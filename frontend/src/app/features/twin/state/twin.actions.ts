import { createActionGroup, emptyProps, props } from '@ngrx/store';

import {
  AssetId,
  AssetStatus,
  AssetType,
  TopologySnapshot,
} from '../../../core/models/network.models';

export const TwinActions = createActionGroup({
  source: 'Twin',
  events: {
    'Load topology': props<{ seed: number }>(),
    'Load topology success': props<{ topology: TopologySnapshot }>(),
    'Load topology failure': props<{ error: string }>(),
    'Retry topology': emptyProps(),
    'Select asset': props<{ assetId: AssetId }>(),
    'Set query': props<{ query: string }>(),
    'Set status filter': props<{ status: AssetStatus | 'all' }>(),
    'Toggle asset type': props<{ assetType: AssetType }>(),
    'Toggle routes': emptyProps(),
    'Reset filters': emptyProps(),
  },
});
