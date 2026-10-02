import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { authGuard } from './core/guards/auth.guard';
import { TwinEffects } from './features/twin/state/twin.effects';
import { twinFeature } from './features/twin/state/twin.reducer';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((component) => component.Login),
    title: 'Sign in · Network Twin',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((component) => component.Register),
    title: 'Register · Network Twin',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/twin/pages/twin-overview/twin-overview').then(
        (component) => component.TwinOverview,
      ),
    providers: [provideState(twinFeature), provideEffects(TwinEffects)],
    title: 'Network Twin',
  },
  { path: '**', redirectTo: '' },
];
