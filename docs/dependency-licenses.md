# Dependency License Register

This register records direct runtime dependencies. Exact versions are held in the lockfiles; license metadata must be regenerated and reviewed before any external distribution.

| Area | Dependency | Intended use | License to verify |
| --- | --- | --- | --- |
| Frontend | Angular 21 | Application framework | MIT |
| Frontend | NgRx 21 | Shared state and effects | MIT |
| Frontend | PrimeNG 21 / PrimeIcons | UI components and icons; major version intentionally pinned | MIT |
| Frontend | Tailwind CSS | Utility styling | MIT |
| Mapping | MapLibre GL JS | Basemap renderer | BSD-3-Clause |
| Mapping | deck.gl | Geospatial data layers | MIT |
| Backend | Django | Web framework | BSD-3-Clause |
| Backend | Django REST Framework | API framework | BSD-3-Clause |
| Backend | drf-spectacular | OpenAPI generation | BSD-3-Clause |
| Backend | django-cors-headers | Development CORS policy | MIT |

Map tiles and geographic datasets have separate attribution and usage terms. Their source must be selected and recorded before Phase 1 data is committed.

The current development map uses OpenFreeMap's hosted Liberty style. Hosted-service suitability, attribution, and an offline demo fallback remain Phase 1 actions and are not covered by the software licences above.
