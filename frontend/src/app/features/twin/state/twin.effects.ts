import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { TopologyService } from '../../../core/services/topology.service';
import { TwinActions } from './twin.actions';
import { twinFeature } from './twin.reducer';

@Injectable()
export class TwinEffects {
  private readonly actions = inject(Actions);
  private readonly topologyService = inject(TopologyService);
  private readonly store = inject(Store);

  readonly loadTopology = createEffect(() =>
    this.actions.pipe(
      ofType(TwinActions.loadTopology),
      switchMap(({ seed, profile }) =>
        this.topologyService.getTopology({ seed, profile }).pipe(
          map((topology) => TwinActions.loadTopologySuccess({ topology })),
          catchError((error: unknown) =>
            of(
              TwinActions.loadTopologyFailure({
                error: error instanceof Error ? error.message : 'Topology request failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly retryTopology = createEffect(() =>
    this.actions.pipe(
      ofType(TwinActions.retryTopology),
      withLatestFrom(
        this.store.select(twinFeature.selectSeed),
        this.store.select(twinFeature.selectProfile),
      ),
      map(([, seed, profile]) => TwinActions.loadTopology({ seed, profile })),
    ),
  );
}
