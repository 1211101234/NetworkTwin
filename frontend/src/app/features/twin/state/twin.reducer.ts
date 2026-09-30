import { createFeature, createReducer, on } from '@ngrx/store';

import {
  AssetId,
  AssetStatus,
  AssetType,
  TopologyProfile,
  TopologySnapshot,
  TwinViewMode,
} from '../../../core/models/network.models';
import { TwinActions } from './twin.actions';

export interface TwinState {
  readonly topology: TopologySnapshot | null;
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
}

const allAssetTypesVisible: Readonly<Record<AssetType, boolean>> = {
  exchange: true,
  cabinet: true,
  'distribution-point': true,
  premise: true,
};

export const initialTwinState: TwinState = {
  topology: null,
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
      loading: false,
      error: null,
      selectedAssetId: state.selectedAssetId ?? topology.assets[0]?.id ?? null,
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
  ),
});
