import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface HealthStatus {
  readonly status: 'ok';
  readonly database: 'ok';
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  getStatus(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>('/api/health/');
  }
}
