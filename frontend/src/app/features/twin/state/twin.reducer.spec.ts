import { describe, expect, it } from 'vitest';

import { TopologySnapshot } from '../../../core/models/network.models';
import { TwinActions } from './twin.actions';
import { initialTwinState, twinFeature } from './twin.reducer';
import { selectVisibleAssets, selectVisibleTopology } from './twin.selectors';

const topology: TopologySnapshot = {
  seed: 42,
  geography: 'Test area',
  assetCount: 3,
  routeCount: 2,
  assets: [
    {
      id: 'exchange-1',
      type: 'exchange',
      name: 'Central Exchange',
      position: { latitude: 3.1, longitude: 101.7 },
      parentId: null,
      status: 'operational',
      capacity: 1,
      attributes: {},
    },
    {
      id: 'cabinet-1',
      type: 'cabinet',
      name: 'North Cabinet',
      position: { latitude: 3.11, longitude: 101.71 },
      parentId: 'exchange-1',
      status: 'degraded',
      capacity: 1,
      attributes: {},
    },
    {
      id: 'premise-1',
      type: 'premise',
      name: 'Synthetic Premise',
      position: { latitude: 3.12, longitude: 101.72 },
      parentId: 'cabinet-1',
      status: 'operational',
      capacity: 1,
      attributes: {},
    },
  ],
  routes: [
    {
      id: 'route-1',
      sourceAssetId: 'exchange-1',
      targetAssetId: 'cabinet-1',
      path: [],
      medium: 'fibre',
    },
    {
      id: 'route-2',
      sourceAssetId: 'cabinet-1',
      targetAssetId: 'premise-1',
      path: [],
      medium: 'fibre',
    },
  ],
};

describe('twin state', () => {
  it('stores a loaded topology and selects its root asset', () => {
    const state = twinFeature.reducer(
      initialTwinState,
      TwinActions.loadTopologySuccess({ topology }),
    );

    expect(state.topology).toBe(topology);
    expect(state.selectedAssetId).toBe('exchange-1');
    expect(state.loading).toBe(false);
  });

  it('toggles one asset type without mutating the previous visibility state', () => {
    const state = twinFeature.reducer(
      initialTwinState,
      TwinActions.toggleAssetType({ assetType: 'premise' }),
    );

    expect(state.visibleAssetTypes.premise).toBe(false);
    expect(initialTwinState.visibleAssetTypes.premise).toBe(true);
  });

  it('loads the selected performance profile and switches view mode', () => {
    const loadingState = twinFeature.reducer(
      initialTwinState,
      TwinActions.loadTopology({ seed: 42, profile: '5k' }),
    );
    const viewState = twinFeature.reducer(
      loadingState,
      TwinActions.setViewMode({ viewMode: '3d' }),
    );

    expect(viewState.profile).toBe('5k');
    expect(viewState.seed).toBe(42);
    expect(viewState.viewMode).toBe('3d');
  });

  it('applies and resets a deterministic status event', () => {
    const loadedState = twinFeature.reducer(
      initialTwinState,
      TwinActions.loadTopologySuccess({ topology }),
    );
    const eventState = twinFeature.reducer(
      loadedState,
      TwinActions.loadEventLogSuccess({
        events: [
          {
            id: 'evt-000001',
            schemaVersion: '1.0',
            sequence: 1,
            simulationTimeSeconds: 15,
            type: 'asset-status-changed',
            payload: {
              assetId: 'cabinet-1',
              previousStatus: 'degraded',
              status: 'failed',
              reason: 'test',
            },
          },
        ],
      }),
    );
    const appliedState = twinFeature.reducer(eventState, TwinActions.playbackTick());
    const resetState = twinFeature.reducer(appliedState, TwinActions.resetPlayback());

    expect(appliedState.topology?.assets[1]?.status).toBe('failed');
    expect(appliedState.simulationTimeSeconds).toBe(15);
    expect(resetState.topology?.assets[1]?.status).toBe('degraded');
    expect(resetState.playbackCursor).toBe(0);
  });

  it('filters assets and removes routes whose endpoints are hidden', () => {
    const visibleAssetTypes = {
      ...initialTwinState.visibleAssetTypes,
      premise: false,
    };
    const assets = selectVisibleAssets.projector(topology, 'north', 'all', visibleAssetTypes);
    const visible = selectVisibleTopology.projector(topology, assets, true);

    expect(assets.map((asset) => asset.id)).toEqual(['cabinet-1']);
    expect(visible?.assetCount).toBe(1);
    expect(visible?.routes).toEqual([]);
  });

  it('moves technicians with playback and restores their starting positions on reset', () => {
    const loadedState = twinFeature.reducer(
      initialTwinState,
      TwinActions.loadTopologySuccess({ topology }),
    );
    const eventState = twinFeature.reducer(
      loadedState,
      TwinActions.loadEventLogSuccess({
        events: [
          {
            id: 'evt-000001',
            schemaVersion: '1.0',
            sequence: 1,
            simulationTimeSeconds: 25,
            type: 'technician-position-changed',
            payload: {
              technicianId: 'technician-001',
              technicianName: 'Field Technician 01',
              assignedAssetId: 'cabinet-1',
              fromPosition: { latitude: 3.1, longitude: 101.7 },
              position: { latitude: 3.11, longitude: 101.71 },
              status: 'en-route',
            },
          },
        ],
      }),
    );
    const appliedState = twinFeature.reducer(eventState, TwinActions.playbackTick());
    const resetState = twinFeature.reducer(appliedState, TwinActions.resetPlayback());

    expect(eventState.technicians[0]?.position).toEqual({ latitude: 3.1, longitude: 101.7 });
    expect(appliedState.technicians[0]?.position).toEqual({
      latitude: 3.11,
      longitude: 101.71,
    });
    expect(appliedState.technicians[0]?.route).toHaveLength(2);
    expect(resetState.technicians[0]?.position).toEqual({ latitude: 3.1, longitude: 101.7 });
  });
});
