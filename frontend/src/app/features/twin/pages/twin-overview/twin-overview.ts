import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';

import {
  AssetStatus,
  AssetType,
  DependencyImpact,
  NetworkAsset,
  PlaybackSpeed,
  TopologyProfile,
  TwinViewMode,
} from '../../../../core/models/network.models';
import { HealthService } from '../../../../core/services/health.service';
import { TopologyService } from '../../../../core/services/topology.service';
import { NetworkMap } from '../../components/network-map/network-map';
import { TwinActions } from '../../state/twin.actions';
import { twinFeature } from '../../state/twin.reducer';
import {
  selectHasActiveFilters,
  selectAppliedEvents,
  selectSelectedAsset,
  selectVisibleTopology,
} from '../../state/twin.selectors';

type ApiState = 'checking' | 'connected' | 'unavailable';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, NetworkMap, ReactiveFormsModule],
  selector: 'app-twin-overview',
  styleUrl: './twin-overview.scss',
  templateUrl: './twin-overview.html',
})
export class TwinOverview {
  private readonly healthService = inject(HealthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);
  private readonly topologyService = inject(TopologyService);

  protected readonly apiState = signal<ApiState>('checking');
  protected readonly impact = signal<DependencyImpact | null>(null);
  protected readonly impactLoading = signal(false);
  protected readonly impactError = signal<string | null>(null);
  protected readonly topology = this.store.selectSignal(twinFeature.selectTopology);
  protected readonly visibleTopology = this.store.selectSignal(selectVisibleTopology);
  protected readonly topologyError = this.store.selectSignal(twinFeature.selectError);
  protected readonly topologyLoading = this.store.selectSignal(twinFeature.selectLoading);
  protected readonly selectedAsset = this.store.selectSignal(selectSelectedAsset);
  protected readonly visibleAssetTypes = this.store.selectSignal(
    twinFeature.selectVisibleAssetTypes,
  );
  protected readonly statusFilter = this.store.selectSignal(twinFeature.selectStatus);
  protected readonly showRoutes = this.store.selectSignal(twinFeature.selectShowRoutes);
  protected readonly profile = this.store.selectSignal(twinFeature.selectProfile);
  protected readonly viewMode = this.store.selectSignal(twinFeature.selectViewMode);
  protected readonly hasActiveFilters = this.store.selectSignal(selectHasActiveFilters);
  protected readonly eventLog = this.store.selectSignal(twinFeature.selectEventLog);
  protected readonly technicians = this.store.selectSignal(twinFeature.selectTechnicians);
  protected readonly appliedEvents = this.store.selectSignal(selectAppliedEvents);
  protected readonly playbackCursor = this.store.selectSignal(twinFeature.selectPlaybackCursor);
  protected readonly playbackSpeed = this.store.selectSignal(twinFeature.selectPlaybackSpeed);
  protected readonly playing = this.store.selectSignal(twinFeature.selectPlaying);
  protected readonly simulationTime = this.store.selectSignal(
    twinFeature.selectSimulationTimeSeconds,
  );
  protected readonly queryControl = new FormControl('', { nonNullable: true });
  protected readonly assetTypes: readonly { type: AssetType; label: string }[] = [
    { type: 'exchange', label: 'Exchanges' },
    { type: 'cabinet', label: 'Cabinets' },
    { type: 'distribution-point', label: 'Distribution points' },
    { type: 'premise', label: 'Premises' },
  ];

  constructor() {
    this.checkApi();
    this.loadTopology();
    this.queryControl.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.store.dispatch(TwinActions.setQuery({ query })));
  }

  protected checkApi(): void {
    this.apiState.set('checking');
    this.healthService
      .getStatus()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((health) => this.apiState.set(health ? 'connected' : 'unavailable'));
  }

  protected loadTopology(seed = 20260929, profile: TopologyProfile = 'demo'): void {
    this.impact.set(null);
    this.impactError.set(null);
    this.store.dispatch(TwinActions.loadTopology({ seed, profile }));
  }

  protected retryTopology(): void {
    this.store.dispatch(TwinActions.retryTopology());
  }

  protected selectAsset(asset: NetworkAsset): void {
    this.impact.set(null);
    this.impactError.set(null);
    this.store.dispatch(TwinActions.selectAsset({ assetId: asset.id }));
  }

  protected analyzeImpact(): void {
    const asset = this.selectedAsset();
    const topology = this.topology();
    if (!asset || !topology || this.impactLoading()) return;

    this.impactLoading.set(true);
    this.impactError.set(null);
    this.topologyService
      .getDependencyImpact({ seed: topology.seed, profile: this.profile() }, asset.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (impact) => {
          this.impact.set(impact);
          this.impactLoading.set(false);
        },
        error: () => {
          this.impactError.set('Downstream impact could not be calculated.');
          this.impactLoading.set(false);
        },
      });
  }

  protected toggleAssetType(assetType: AssetType): void {
    this.store.dispatch(TwinActions.toggleAssetType({ assetType }));
  }

  protected toggleRoutes(): void {
    this.store.dispatch(TwinActions.toggleRoutes());
  }

  protected setStatusFilter(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as AssetStatus | 'all';
    this.store.dispatch(TwinActions.setStatusFilter({ status }));
  }

  protected setProfile(event: Event): void {
    const profile = (event.target as HTMLSelectElement).value as TopologyProfile;
    this.loadTopology(20260929, profile);
  }

  protected setViewMode(viewMode: TwinViewMode): void {
    this.store.dispatch(TwinActions.setViewMode({ viewMode }));
  }

  protected togglePlayback(): void {
    this.store.dispatch(TwinActions.togglePlayback());
  }

  protected resetPlayback(): void {
    this.store.dispatch(TwinActions.resetPlayback());
  }

  protected setPlaybackSpeed(event: Event): void {
    const speed = Number((event.target as HTMLSelectElement).value) as PlaybackSpeed;
    this.store.dispatch(TwinActions.setPlaybackSpeed({ speed }));
  }

  protected resetFilters(): void {
    this.queryControl.setValue('', { emitEvent: false });
    this.store.dispatch(TwinActions.resetFilters());
  }
}
