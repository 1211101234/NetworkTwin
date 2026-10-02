import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { Layer, PickingInfo, Position as DeckPosition } from '@deck.gl/core';
import { ColumnLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import {
  NetworkAsset,
  NetworkRoute,
  Technician,
  TopologySnapshot,
  TwinViewMode,
} from '../../../../core/models/network.models';

setWorkerUrl(mapLibreWorkerUrl);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-network-map',
  styleUrl: './network-map.css',
  template:
    '<div #mapContainer class="map" role="application" aria-label="Synthetic network map"></div>',
})
export class NetworkMap implements AfterViewInit, OnChanges, OnDestroy {
  readonly topology = input.required<TopologySnapshot>();
  readonly viewMode = input.required<TwinViewMode>();
  readonly technicians = input<readonly Technician[]>([]);
  readonly assetSelected = output<NetworkAsset>();

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private map?: MapLibreMap;
  private overlay?: MapLibreOverlay;
  private currentZoom = 13.25;

  ngAfterViewInit(): void {
    this.map = new MapLibreMap({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [101.71165, 3.15785],
      zoom: this.currentZoom,
      pitch: this.viewMode() === '3d' ? 55 : 0,
      bearing: this.viewMode() === '3d' ? -18 : 0,
    });
    this.map.addControl(new NavigationControl(), 'top-right');
    this.overlay = new MapLibreOverlay({ interleaved: true, layers: this.createLayers() });
    this.map.addControl(this.overlay);
    this.map.on('zoomend', this.handleZoomEnd);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['topology'] || changes['viewMode'] || changes['technicians']) && this.overlay) {
      this.overlay.setProps({ layers: this.createLayers() });
    }
    if (changes['viewMode'] && this.map) {
      const is3d = this.viewMode() === '3d';
      this.map.easeTo({ pitch: is3d ? 55 : 0, bearing: is3d ? -18 : 0, duration: 450 });
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private readonly handleZoomEnd = (): void => {
    this.currentZoom = this.map?.getZoom() ?? this.currentZoom;
    this.overlay?.setProps({ layers: this.createLayers() });
  };

  private createLayers(): Layer[] {
    const topology = this.topology();
    const assets = this.assetsForZoom(topology.assets);
    const visibleIds = new Set(assets.map((asset) => asset.id));
    const routes = topology.routes.filter(
      (route) => visibleIds.has(route.sourceAssetId) && visibleIds.has(route.targetAssetId),
    );
    const routeLayer = new PathLayer<NetworkRoute>({
      id: 'network-routes',
      data: routes,
      getPath: (route): DeckPosition[] =>
        route.path.map(({ longitude, latitude }) => [longitude, latitude]),
      getColor: [45, 212, 191, 145],
      getWidth: 2,
      widthMinPixels: 1,
      antialiasing: true,
    });
    const technicianRouteLayer = new PathLayer<Technician>({
      id: 'technician-routes',
      data: this.technicians(),
      getPath: (technician): DeckPosition[] =>
        technician.route.map(({ longitude, latitude }) => [longitude, latitude]),
      getColor: [244, 114, 182, 210],
      getWidth: 4,
      widthMinPixels: 2,
    });
    const technicianLayer = new ScatterplotLayer<Technician>({
      id: 'technicians',
      data: this.technicians(),
      getPosition: (technician) => [technician.position.longitude, technician.position.latitude],
      getRadius: 75,
      getFillColor: [244, 114, 182, 245],
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2,
      radiusMinPixels: 7,
      radiusMaxPixels: 18,
      stroked: true,
      pickable: true,
    });
    if (this.viewMode() === '3d') {
      return [
        routeLayer,
        technicianRouteLayer,
        new ColumnLayer<NetworkAsset>({
          id: 'network-assets-3d',
          data: assets,
          diskResolution: 12,
          extruded: true,
          getPosition: (asset) => [asset.position.longitude, asset.position.latitude],
          radius: 42,
          getElevation: (asset) => this.elevationFor(asset),
          getFillColor: (asset) => this.colourFor(asset),
          pickable: true,
          autoHighlight: true,
          onClick: ({ object }: PickingInfo<NetworkAsset>) => {
            if (object) this.assetSelected.emit(object);
          },
        }),
        technicianLayer,
      ];
    }
    return [
      routeLayer,
      technicianRouteLayer,
      new ScatterplotLayer<NetworkAsset>({
        id: 'network-assets',
        data: assets,
        getPosition: (asset) => [asset.position.longitude, asset.position.latitude],
        getRadius: (asset) => this.radiusFor(asset),
        getFillColor: (asset) => this.colourFor(asset),
        getLineColor: [226, 232, 240, 220],
        lineWidthMinPixels: 1,
        radiusMinPixels: 3,
        radiusMaxPixels: 16,
        stroked: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 90],
        onClick: ({ object }: PickingInfo<NetworkAsset>) => {
          if (object) this.assetSelected.emit(object);
        },
      }),
      technicianLayer,
    ];
  }

  private assetsForZoom(assets: readonly NetworkAsset[]): readonly NetworkAsset[] {
    if (this.currentZoom < 11.5) {
      return assets.filter((asset) => asset.type === 'exchange' || asset.type === 'cabinet');
    }
    if (this.currentZoom < 13) {
      return assets.filter((asset) => asset.type !== 'premise');
    }
    if (assets.length <= 2_000) return assets;

    const infrastructure = assets.filter((asset) => asset.type !== 'premise');
    const premises = assets.filter((asset) => asset.type === 'premise');
    const availablePremiseSlots = Math.max(0, 2_000 - infrastructure.length);
    const sampledPremises = Array.from({ length: availablePremiseSlots }, (_, index) =>
      premises.at(Math.floor((index * premises.length) / availablePremiseSlots)),
    ).filter((asset): asset is NetworkAsset => asset !== undefined);
    return [...infrastructure, ...sampledPremises];
  }

  private elevationFor(asset: NetworkAsset): number {
    const elevationByType: Record<NetworkAsset['type'], number> = {
      exchange: 260,
      cabinet: 160,
      'distribution-point': 90,
      premise: 35,
    };
    return elevationByType[asset.type];
  }

  private radiusFor(asset: NetworkAsset): number {
    const radiusByType: Record<NetworkAsset['type'], number> = {
      exchange: 130,
      cabinet: 85,
      'distribution-point': 45,
      premise: 18,
    };
    return radiusByType[asset.type];
  }

  private colourFor(asset: NetworkAsset): [number, number, number, number] {
    const colourByType: Record<NetworkAsset['type'], [number, number, number, number]> = {
      exchange: [251, 191, 36, 235],
      cabinet: [56, 189, 248, 225],
      'distribution-point': [45, 212, 191, 215],
      premise: [167, 139, 250, 190],
    };
    return colourByType[asset.type];
  }
}
