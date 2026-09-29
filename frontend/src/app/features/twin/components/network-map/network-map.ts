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
import { PickingInfo, Position as DeckPosition } from '@deck.gl/core';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

import {
  NetworkAsset,
  NetworkRoute,
  TopologySnapshot,
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
  readonly assetSelected = output<NetworkAsset>();

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private map?: MapLibreMap;
  private overlay?: MapLibreOverlay;

  ngAfterViewInit(): void {
    this.map = new MapLibreMap({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [101.71165, 3.15785],
      zoom: 12.5,
      pitch: 35,
    });
    this.map.addControl(new NavigationControl(), 'top-right');
    this.overlay = new MapLibreOverlay({ interleaved: true, layers: this.createLayers() });
    this.map.addControl(this.overlay);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topology'] && this.overlay) {
      this.overlay.setProps({ layers: this.createLayers() });
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private createLayers(): [PathLayer<NetworkRoute>, ScatterplotLayer<NetworkAsset>] {
    const topology = this.topology();
    return [
      new PathLayer<NetworkRoute>({
        id: 'network-routes',
        data: topology.routes,
        getPath: (route): DeckPosition[] =>
          route.path.map(({ longitude, latitude }) => [longitude, latitude]),
        getColor: [45, 212, 191, 145],
        getWidth: 2,
        widthMinPixels: 1,
        antialiasing: true,
      }),
      new ScatterplotLayer<NetworkAsset>({
        id: 'network-assets',
        data: topology.assets,
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
    ];
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
