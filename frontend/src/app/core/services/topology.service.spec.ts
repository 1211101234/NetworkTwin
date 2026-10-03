import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TopologyService } from './topology.service';

describe('TopologyService', () => {
  let service: TopologyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TopologyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests dependency impact for the selected topology asset', () => {
    service.getDependencyImpact({ seed: 42, profile: 'demo' }, 'cabinet-001').subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/v1/topology/impact/' &&
        candidate.params.get('seed') === '42' &&
        candidate.params.get('profile') === 'demo' &&
        candidate.params.get('asset_id') === 'cabinet-001',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      sourceAssetId: 'cabinet-001',
      sourceAssetType: 'cabinet',
      directDependentCount: 4,
      impactedAssetCount: 24,
      affectedPremiseCount: 20,
      impactedAssets: [],
    });
  });

  it('requests a seeded flood scenario for the selected topology', () => {
    service.getFloodScenario({ seed: 42, profile: 'demo' }, 7, 'severe').subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/v1/topology/scenarios/flood/' &&
        candidate.params.get('seed') === '42' &&
        candidate.params.get('profile') === 'demo' &&
        candidate.params.get('scenario_seed') === '7' &&
        candidate.params.get('severity') === 'severe',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      scenarioSeed: 7,
      severity: 'severe',
      centre: { latitude: 3.1, longitude: 101.7 },
      radiusKm: 0.62,
      boundary: [],
      directAssets: [],
      downstreamAssets: [],
      directAssetCount: 0,
      downstreamAssetCount: 0,
      totalImpactedAssetCount: 0,
      affectedPremiseCount: 0,
    });
  });
});
