import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SimulationEvent, TopologyProfile } from '../models/network.models';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private readonly http = inject(HttpClient);

  getEventLog(profile: TopologyProfile, seed: number): Observable<readonly SimulationEvent[]> {
    const params = new HttpParams().set('profile', profile).set('seed', seed);
    return this.http.get<readonly SimulationEvent[]>('/api/v1/topology/events/', { params });
  }
}
