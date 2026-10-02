import { createFeature, createReducer, on } from '@ngrx/store';

import {
  AssetId,
  AssetStatus,
  AssetType,
  PlaybackSpeed,
  SimulationEvent,
  Technician,
  TopologyProfile,
  TopologySnapshot,
  TwinViewMode,
} from '../../../core/models/network.models';
import { TwinActions } from './twin.actions';

export interface TwinState {
  readonly topology: TopologySnapshot | null;
  readonly baselineTopology: TopologySnapshot | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly seed: number;
  readonly profile: TopologyProfile;
  readonly viewMode: TwinViewMode;
  readonly selectedAssetId: AssetId | null;
  readonly query: string;
  readonly status: AssetStatus | 'all';
  readonly visibleAssetTypes: Readonly<Record<AssetType, boolean>>;
  readonly showRoutes: boolean;
  readonly eventLog: readonly SimulationEvent[];
  readonly technicians: readonly Technician[];
  readonly eventError: string | null;
  readonly playbackCursor: number;
  readonly playbackSpeed: PlaybackSpeed;
  readonly playing: boolean;
  readonly simulationTimeSeconds: number;
}

const allAssetTypesVisible: Readonly<Record<AssetType, boolean>> = {
  exchange: true,
  cabinet: true,
  'distribution-point': true,
  premise: true,
};

export const initialTwinState: TwinState = {
  topology: null,
  baselineTopology: null,
  loading: false,
  error: null,
  seed: 20260929,
  profile: 'demo',
  viewMode: '2d',
  selectedAssetId: null,
  query: '',
  status: 'all',
  visibleAssetTypes: allAssetTypesVisible,
  showRoutes: true,
  eventLog: [],
  technicians: [],
  eventError: null,
  playbackCursor: 0,
  playbackSpeed: 1,
  playing: false,
  simulationTimeSeconds: 0,
};

export const twinFeature = createFeature({
  name: 'twin',
  reducer: createReducer(
    initialTwinState,
    on(TwinActions.loadTopology, (state, { seed, profile }): TwinState => ({
      ...state,
      seed,
      profile,
      loading: true,
      error: null,
    })),
    on(TwinActions.loadTopologySuccess, (state, { topology }): TwinState => ({
      ...state,
      topology,
      baselineTopology: topology,
      loading: false,
      error: null,
      selectedAssetId: state.selectedAssetId ?? topology.assets[0]?.id ?? null,
      eventLog: [],
      technicians: [],
      playbackCursor: 0,
      playing: false,
      simulationTimeSeconds: 0,
    })),
    on(TwinActions.loadTopologyFailure, (state, { error }): TwinState => ({
      ...state,
      loading: false,
      error,
    })),
    on(TwinActions.selectAsset, (state, { assetId }): TwinState => ({
      ...state,
      selectedAssetId: assetId,
    })),
    on(TwinActions.setQuery, (state, { query }): TwinState => ({ ...state, query })),
    on(TwinActions.setStatusFilter, (state, { status }): TwinState => ({ ...state, status })),
    on(TwinActions.toggleAssetType, (state, { assetType }): TwinState => ({
      ...state,
      visibleAssetTypes: {
        ...state.visibleAssetTypes,
        [assetType]: !state.visibleAssetTypes[assetType],
      },
    })),
    on(TwinActions.toggleRoutes, (state): TwinState => ({
      ...state,
      showRoutes: !state.showRoutes,
    })),
    on(TwinActions.setViewMode, (state, { viewMode }): TwinState => ({ ...state, viewMode })),
    on(TwinActions.resetFilters, (state): TwinState => ({
      ...state,
      query: '',
      status: 'all',
      visibleAssetTypes: allAssetTypesVisible,
      showRoutes: true,
    })),
    on(TwinActions.loadEventLog, (state): TwinState => ({ ...state, eventError: null })),
    on(TwinActions.loadEventLogSuccess, (state, { events }): TwinState => ({
      ...state,
      eventLog: events,
      technicians: initialTechnicians(events),
      eventError: null,
    })),
    on(TwinActions.loadEventLogFailure, (state, { error }): TwinState => ({
      ...state,
      eventError: error,
      playing: false,
    })),
    on(TwinActions.togglePlayback, (state): TwinState => ({
      ...state,
      playing: state.playbackCursor < state.eventLog.length ? !state.playing : false,
    })),
    on(TwinActions.setPlaybackSpeed, (state, { speed }): TwinState => ({
      ...state,
      playbackSpeed: speed,
    })),
    on(TwinActions.playbackTick, (state): TwinState => {
      const event = state.eventLog[state.playbackCursor];
      if (!event || !state.topology) return { ...state, playing: false };
      const topology =
        event.type === 'asset-status-changed'
          ? {
              ...state.topology,
              assets: state.topology.assets.map((asset) =>
                asset.id === event.payload.assetId
                  ? { ...asset, status: event.payload.status }
                  : asset,
              ),
            }
          : state.topology;
      const technicians =
        event.type === 'technician-position-changed'
          ? state.technicians.map((technician) =>
              technician.id === event.payload.technicianId
                ? {
                    ...technician,
                    position: event.payload.position,
                    route: [...technician.route, event.payload.position],
                    status: event.payload.status,
                  }
                : technician,
            )
          : state.technicians;
      const nextCursor = state.playbackCursor + 1;
      return {
        ...state,
        topology,
        technicians,
        playbackCursor: nextCursor,
        playing: nextCursor < state.eventLog.length && state.playing,
        simulationTimeSeconds: event.simulationTimeSeconds,
      };
    }),
    on(TwinActions.resetPlayback, (state): TwinState => ({
      ...state,
      topology: state.baselineTopology,
      playbackCursor: 0,
      playing: false,
      simulationTimeSeconds: 0,
      technicians: initialTechnicians(state.eventLog),
    })),
  ),
});

function initialTechnicians(events: readonly SimulationEvent[]): readonly Technician[] {
  const technicians = new Map<string, Technician>();
  for (const event of events) {
    if (
      event.type === 'technician-position-changed' &&
      !technicians.has(event.payload.technicianId)
    ) {
      technicians.set(event.payload.technicianId, {
        id: event.payload.technicianId,
        name: event.payload.technicianName,
        assignedAssetId: event.payload.assignedAssetId,
        position: event.payload.fromPosition,
        route: [event.payload.fromPosition],
        status: 'en-route',
      });
    }
  }
  return [...technicians.values()];
}
