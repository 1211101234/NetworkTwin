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
});
