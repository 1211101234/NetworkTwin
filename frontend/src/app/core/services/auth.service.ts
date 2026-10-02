import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';

import { CurrentUser, LoginCredentials, RegisterCredentials } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly loadingState = signal(true);
  private sessionChecked = false;
  private sessionRequest: Observable<CurrentUser | null> | null = null;

  readonly currentUser = this.currentUserState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly authenticated = computed(() => this.currentUserState() !== null);

  restoreSession(): Observable<CurrentUser | null> {
    if (this.sessionChecked) {
      return of(this.currentUserState());
    }
    if (this.sessionRequest) {
      return this.sessionRequest;
    }

    this.loadingState.set(true);
    this.sessionRequest = this.http.get<CurrentUser>('/api/v1/auth/me/').pipe(
      tap((user) => this.currentUserState.set(user)),
      map((user) => user as CurrentUser | null),
      catchError(() => {
        this.currentUserState.set(null);
        return of(null);
      }),
      tap(() => {
        this.sessionChecked = true;
        this.loadingState.set(false);
      }),
      finalize(() => (this.sessionRequest = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.sessionRequest;
  }

  login(credentials: LoginCredentials): Observable<CurrentUser> {
    return this.http.get<{ readonly csrfToken: string }>('/api/v1/auth/csrf/').pipe(
      switchMap(() => this.http.post<CurrentUser>('/api/v1/auth/login/', credentials)),
      tap((user) => {
        this.currentUserState.set(user);
        this.sessionChecked = true;
      }),
    );
  }

  register(credentials: RegisterCredentials): Observable<void> {
    return this.http
      .get<{ readonly csrfToken: string }>('/api/v1/auth/csrf/')
      .pipe(switchMap(() => this.http.post<void>('/api/v1/auth/register/', credentials)));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout/', {}).pipe(
      tap(() => {
        this.currentUserState.set(null);
        this.sessionChecked = true;
      }),
    );
  }
}
