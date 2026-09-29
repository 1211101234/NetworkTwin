import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { TwinEffects } from './features/twin/state/twin.effects';
import { twinFeature } from './features/twin/state/twin.reducer';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/twin/pages/twin-overview/twin-overview').then(
        (component) => component.TwinOverview,
      ),
    providers: [provideState(twinFeature), provideEffects(TwinEffects)],
    title: 'Network Twin',
  },
  { path: '**', redirectTo: '' },
];
