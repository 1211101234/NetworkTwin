import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AssetId,
  DependencyImpact,
  FloodScenario,
  FloodSeverity,
  TopologyProfile,
  TopologySnapshot,
} from '../models/network.models';

export interface TopologyRequest {
  readonly seed: number;
  readonly profile: TopologyProfile;
  readonly cabinetCount?: number;
  readonly distributionPointsPerCabinet?: number;
  readonly premisesPerDistributionPoint?: number;
}

@Injectable({ providedIn: 'root' })
export class TopologyService {
  private readonly http = inject(HttpClient);

  getTopology(request: TopologyRequest): Observable<TopologySnapshot> {
    const params = this.requestParams(request);
    return this.http.get<TopologySnapshot>('/api/v1/topology/', { params });
  }

  getDependencyImpact(request: TopologyRequest, assetId: AssetId): Observable<DependencyImpact> {
    const params = this.requestParams(request).set('asset_id', assetId);
    return this.http.get<DependencyImpact>('/api/v1/topology/impact/', { params });
  }

  getFloodScenario(
    request: TopologyRequest,
    scenarioSeed: number,
    severity: FloodSeverity,
  ): Observable<FloodScenario> {
    const params = this.requestParams(request)
      .set('scenario_seed', scenarioSeed)
      .set('severity', severity);
    return this.http.get<FloodScenario>('/api/v1/topology/scenarios/flood/', { params });
  }

  private requestParams(request: TopologyRequest): HttpParams {
    let params = new HttpParams().set('seed', request.seed).set('profile', request.profile);
    if (request.cabinetCount !== undefined) {
      params = params.set('cabinet_count', request.cabinetCount);
    }
    if (request.distributionPointsPerCabinet !== undefined) {
      params = params.set('distribution_points_per_cabinet', request.distributionPointsPerCabinet);
    }
    if (request.premisesPerDistributionPoint !== undefined) {
      params = params.set('premises_per_distribution_point', request.premisesPerDistributionPoint);
    }
    return params;
  }
}
