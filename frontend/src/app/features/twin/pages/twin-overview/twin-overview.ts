import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';

import { AssetStatus, AssetType, NetworkAsset } from '../../../../core/models/network.models';
import { HealthService } from '../../../../core/services/health.service';
import { NetworkMap } from '../../components/network-map/network-map';
import { TwinActions } from '../../state/twin.actions';
import { twinFeature } from '../../state/twin.reducer';
import {
  selectHasActiveFilters,
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

  protected readonly apiState = signal<ApiState>('checking');
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
  protected readonly hasActiveFilters = this.store.selectSignal(selectHasActiveFilters);
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

  protected loadTopology(seed = 20260929): void {
    this.store.dispatch(TwinActions.loadTopology({ seed }));
  }

  protected retryTopology(): void {
    this.store.dispatch(TwinActions.retryTopology());
  }

  protected selectAsset(asset: NetworkAsset): void {
    this.store.dispatch(TwinActions.selectAsset({ assetId: asset.id }));
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

  protected resetFilters(): void {
    this.queryControl.setValue('', { emitEvent: false });
    this.store.dispatch(TwinActions.resetFilters());
  }
}
