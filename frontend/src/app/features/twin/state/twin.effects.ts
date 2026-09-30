import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, catchError, map, of, switchMap, timer, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { TopologyService } from '../../../core/services/topology.service';
import { SimulationService } from '../../../core/services/simulation.service';
import { TwinActions } from './twin.actions';
import { twinFeature } from './twin.reducer';

@Injectable()
export class TwinEffects {
  private readonly actions = inject(Actions);
  private readonly topologyService = inject(TopologyService);
  private readonly simulationService = inject(SimulationService);
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

  readonly requestEventLog = createEffect(() =>
    this.actions.pipe(
      ofType(TwinActions.loadTopologySuccess),
      withLatestFrom(
        this.store.select(twinFeature.selectSeed),
        this.store.select(twinFeature.selectProfile),
      ),
      map(([, seed, profile]) => TwinActions.loadEventLog({ seed, profile })),
    ),
  );

  readonly loadEventLog = createEffect(() =>
    this.actions.pipe(
      ofType(TwinActions.loadEventLog),
      switchMap(({ seed, profile }) =>
        this.simulationService.getEventLog(profile, seed).pipe(
          map((events) => TwinActions.loadEventLogSuccess({ events })),
          catchError((error: unknown) =>
            of(
              TwinActions.loadEventLogFailure({
                error: error instanceof Error ? error.message : 'Simulation event request failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  readonly playbackClock = createEffect(() =>
    this.actions.pipe(
      ofType(
        TwinActions.togglePlayback,
        TwinActions.setPlaybackSpeed,
        TwinActions.loadEventLogSuccess,
        TwinActions.resetPlayback,
      ),
      withLatestFrom(
        this.store.select(twinFeature.selectPlaying),
        this.store.select(twinFeature.selectPlaybackSpeed),
      ),
      switchMap(([, playing, speed]) =>
        playing ? timer(0, 1_000 / speed).pipe(map(() => TwinActions.playbackTick())) : EMPTY,
      ),
    ),
  );
}
