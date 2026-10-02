import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withXsrfConfiguration({ cookieName: 'csrftoken', headerName: 'X-CSRFToken' }),
        ),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('restores an authenticated session', () => {
    service.restoreSession().subscribe();
    http.expectOne('/api/v1/auth/me/').flush({
      id: 7,
      username: 'operator.one',
      displayName: 'Operator One',
      roles: ['Operator'],
      isAdministrator: false,
    });

    expect(service.currentUser()?.username).toBe('operator.one');
    expect(service.authenticated()).toBe(true);
    expect(service.loading()).toBe(false);
  });

  it('gets a CSRF cookie before submitting credentials', () => {
    service.login({ username: 'operator.one', password: 'secret' }).subscribe();
    http.expectOne('/api/v1/auth/csrf/').flush({ csrfToken: 'token' });
    const loginRequest = http.expectOne('/api/v1/auth/login/');
    expect(loginRequest.request.method).toBe('POST');
    loginRequest.flush({
      id: 7,
      username: 'operator.one',
      displayName: 'Operator One',
      roles: ['Operator'],
      isAdministrator: false,
    });

    expect(service.currentUser()?.roles).toEqual(['Operator']);
  });

  it('gets a CSRF cookie before registering a user', () => {
    service.register({ username: 'new.viewer', password: 'SafePass!9' }).subscribe();
    http.expectOne('/api/v1/auth/csrf/').flush({ csrfToken: 'token' });
    const registerRequest = http.expectOne('/api/v1/auth/register/');
    expect(registerRequest.request.method).toBe('POST');
    expect(registerRequest.request.body).toEqual({
      username: 'new.viewer',
      password: 'SafePass!9',
    });
    registerRequest.flush(null);
  });
});
