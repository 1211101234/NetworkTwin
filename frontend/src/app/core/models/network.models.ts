export type AssetId = string;
export type AssetStatus = 'operational' | 'degraded' | 'failed' | 'maintenance';
export type AssetType = 'exchange' | 'cabinet' | 'distribution-point' | 'premise';
export type TopologyProfile = 'demo' | '1k' | '5k' | '10k';
export type TwinViewMode = '2d' | '3d';

export interface GeoPosition {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevationMetres?: number;
}

export interface NetworkAsset {
  readonly id: AssetId;
  readonly type: AssetType;
  readonly name: string;
  readonly position: GeoPosition;
  readonly parentId: AssetId | null;
  readonly status: AssetStatus;
  readonly capacity: number;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}

export interface NetworkRoute {
  readonly id: string;
  readonly sourceAssetId: AssetId;
  readonly targetAssetId: AssetId;
  readonly path: readonly GeoPosition[];
  readonly medium: 'fibre' | 'copper' | 'wireless';
}

export interface TopologySnapshot {
  readonly seed: number;
  readonly geography: string;
  readonly assetCount: number;
  readonly routeCount: number;
  readonly assets: readonly NetworkAsset[];
  readonly routes: readonly NetworkRoute[];
}
