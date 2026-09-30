import { createSelector } from '@ngrx/store';

import { NetworkAsset, TopologySnapshot } from '../../../core/models/network.models';
import { twinFeature } from './twin.reducer';

export const selectVisibleAssets = createSelector(
  twinFeature.selectTopology,
  twinFeature.selectQuery,
  twinFeature.selectStatus,
  twinFeature.selectVisibleAssetTypes,
  (topology, query, status, visibleAssetTypes): readonly NetworkAsset[] => {
    if (!topology) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return topology.assets.filter(
      (asset) =>
        visibleAssetTypes[asset.type] &&
        (status === 'all' || asset.status === status) &&
        (!normalizedQuery ||
          asset.name.toLocaleLowerCase().includes(normalizedQuery) ||
          asset.id.toLocaleLowerCase().includes(normalizedQuery)),
    );
  },
);

export const selectVisibleTopology = createSelector(
  twinFeature.selectTopology,
  selectVisibleAssets,
  twinFeature.selectShowRoutes,
  (topology, assets, showRoutes): TopologySnapshot | null => {
    if (!topology) return null;
    const visibleIds = new Set(assets.map((asset) => asset.id));
    const routes = showRoutes
      ? topology.routes.filter(
          (route) => visibleIds.has(route.sourceAssetId) && visibleIds.has(route.targetAssetId),
        )
      : [];
    return {
      ...topology,
      assetCount: assets.length,
      routeCount: routes.length,
      assets,
      routes,
    };
  },
);

export const selectSelectedAsset = createSelector(
  twinFeature.selectTopology,
  twinFeature.selectSelectedAssetId,
  (topology, selectedAssetId) =>
    topology?.assets.find((asset) => asset.id === selectedAssetId) ?? null,
);

export const selectHasActiveFilters = createSelector(
  twinFeature.selectQuery,
  twinFeature.selectStatus,
  twinFeature.selectVisibleAssetTypes,
  twinFeature.selectShowRoutes,
  (query, status, visibleAssetTypes, showRoutes) =>
    Boolean(query.trim()) ||
    status !== 'all' ||
    !showRoutes ||
    Object.values(visibleAssetTypes).some((visible) => !visible),
);

export const selectAppliedEvents = createSelector(
  twinFeature.selectEventLog,
  twinFeature.selectPlaybackCursor,
  (events, cursor) => events.slice(0, cursor).reverse(),
);
