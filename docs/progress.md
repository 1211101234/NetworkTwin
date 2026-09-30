# Delivery Progress

## 2026-09-29 — Foundation and first static-twin increment

### Completed

- Runnable Angular and Django/DRF foundation with health and OpenAPI endpoints.
- Open-source baseline locked to Angular, NgRx, and PrimeNG 21.
- Deterministic standalone topology generator and versioned topology endpoint.
- Kuala Lumpur MapLibre/deck.gl view with 151 default assets and 150 routes.
- Asset details, search, status filter, asset-type visibility, route visibility, legend, and reset behavior.
- Lazy NgRx feature state for topology loading, retry, selection, filters, and layers.
- Architecture decisions, dependency register, performance budgets, roadmap, and tracked backlog.

### Evidence

- Backend and simulation: 5 tests passing; Ruff, Django, and OpenAPI checks passing.
- Frontend: 5 tests passing; Prettier and production build passing.
- Live browser: API connected, Kuala Lumpur basemap rendered with attribution, search reduced 151 assets to one matching cabinet, and layer visibility changed the displayed result set.

### Next

1. Generate and benchmark 1k, 5k, and 10k topology profiles.
2. Add viewport-aware level-of-detail/clustering based on measurements.
3. Add an initial 3D camera/layer mode and record the Phase 1 performance report.

## 2026-09-30 — Scaled static twin and initial 3D

### Completed

- Named deterministic demo, 1k, 5k, and 10k profiles with a server-enforced 10,500-asset ceiling.
- Dataset selection in the shared NgRx state and UI.
- Initial 2D/3D camera switch with extruded 3D asset columns.
- Zoom-aware level of detail with a maximum of 2,000 concurrently detailed assets.
- Repeatable backend generation/serialization benchmark command and recorded baseline.

### Evidence

- The 9,997-asset profile generated in 25.1 ms and serialized to 5.00 MiB in 153.3 ms (five-run medians).
- Backend/API tests, simulation tests, Ruff, Django checks, OpenAPI validation, frontend tests,
  TypeScript, and formatting pass.

### Next

1. Define the versioned live-event envelope and append-only event log.
2. Build deterministic fault/recovery replay on top of the static snapshot.
3. Add a stable scripted browser trace for FPS and interaction-latency measurement.

## 2026-09-30 — Deterministic live-event replay

### Completed

- Version 1.0 event envelope with stable identifiers, sequence numbers, simulation time, event type,
  and typed status-change payloads.
- Seeded fault and recovery event generation with deterministic ordering and replay results.
- JSON event-log endpoint plus SSE transport with event IDs, heartbeat, retry guidance, and resume by
  sequence or `Last-Event-ID`.
- NgRx playback state with play, pause, reset, 0.5×/1×/2× speed, simulation clock, event feed, and
  status changes applied to the shared topology.

### Evidence

- Event generation, ordering, replay, API serialization, and SSE resume tests pass.
- Backend: 6 tests; simulator: 4 tests; frontend: 7 tests.
- Ruff, Django checks, OpenAPI validation, Prettier, and TypeScript checks pass.

### Next

1. Add technician entities, deterministic movement events, and a technician map layer.
2. Expand the replay timeline with direct seeking and scripted HOU storyline presets.
3. Add browser reconnect integration coverage around the SSE client lifecycle.
