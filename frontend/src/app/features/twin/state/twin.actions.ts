import { createActionGroup, emptyProps, props } from '@ngrx/store';

import {
  AssetId,
  AssetStatus,
  AssetType,
  PlaybackSpeed,
  SimulationEvent,
  TopologyProfile,
  TopologySnapshot,
  TwinViewMode,
} from '../../../core/models/network.models';

export const TwinActions = createActionGroup({
  source: 'Twin',
  events: {
    'Load topology': props<{ seed: number; profile: TopologyProfile }>(),
    'Load topology success': props<{ topology: TopologySnapshot }>(),
    'Load topology failure': props<{ error: string }>(),
    'Retry topology': emptyProps(),
    'Select asset': props<{ assetId: AssetId }>(),
    'Set query': props<{ query: string }>(),
    'Set status filter': props<{ status: AssetStatus | 'all' }>(),
    'Toggle asset type': props<{ assetType: AssetType }>(),
    'Toggle routes': emptyProps(),
    'Set view mode': props<{ viewMode: TwinViewMode }>(),
    'Reset filters': emptyProps(),
    'Load event log': props<{ seed: number; profile: TopologyProfile }>(),
    'Load event log success': props<{ events: readonly SimulationEvent[] }>(),
    'Load event log failure': props<{ error: string }>(),
    'Toggle playback': emptyProps(),
    'Set playback speed': props<{ speed: PlaybackSpeed }>(),
    'Playback tick': emptyProps(),
    'Reset playback': emptyProps(),
  },
});
