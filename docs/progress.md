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

## 2026-09-30 — Deterministic technician movement

### Completed

- Two deterministic technician entities assigned to seeded fault assets.
- Three ordered movement waypoints per technician in the version 1.0 event envelope.
- Typed frontend event union and NgRx technician state using the existing replay clock.
- Technician positions and travelled paths rendered as a dedicated deck.gl map layer.
- Reset restores technician starting positions and clears travelled paths.

### Evidence

- Backend: 6 tests passing; simulator: 5 tests passing; frontend: 8 tests passing.
- Ruff, Prettier, TypeScript, Django checks, and OpenAPI validation pass.
- The Angular production build was attempted but the local esbuild service deadlocked. TypeScript
  compilation passes, so build verification remains open rather than being claimed as successful.

### Next

1. Add CI for the chosen repository host and verify the production build in a clean runner.
2. Review and approve the proposed authentication/role/CRUD hierarchy.
3. Begin dependency-graph and downstream-impact work for SCN-01.

## 2026-10-01 — Authentication and role foundation

### Completed

- CSRF-protected Django session login, logout, current-user, and CSRF bootstrap endpoints.
- Viewer, Operator, Network Planner, and Administrator groups created through a reversible migration.
- Inactive-user rejection and generic invalid-credential responses that avoid username disclosure.
- Angular session service, typed user/role contracts, responsive sign-in screen, and session-aware header.
- Public read-only twin retained while write-oriented management routes remain pending.

### Evidence

- Backend: 10 tests passing, including CSRF rejection and session lifecycle coverage.
- Frontend: 10 tests passing, including session restoration and login request sequencing.
- Ruff, Django checks, OpenAPI validation, Prettier, TypeScript, and live development build pass.
- Live browser confirms the API-connected twin and responsive `/login` screen.

### Next

1. Confirm network assets as the first persistent CRUD resource.
2. Add permission classes, audit records, and protected management routes with the CRUD slice.
3. Add CI for the chosen repository host.

## 2026-10-02 — Registration and protected application route

### Completed

- CSRF-protected self-registration API using Django password hashing and validation.
- Case-insensitive duplicate User ID rejection and default Viewer role assignment.
- Responsive registration screen with typed validation, confirmation matching, and a live
  Weak/Medium/Strong password indicator.
- Successful registration redirect and confirmation on the sign-in screen.
- Protected main twin route, session restoration, logout redirect, and deduplicated session checks.

### Evidence

- Backend: 14 tests plus 3 password-validation subtests passing.
- Frontend: 14 tests passing; TypeScript and Prettier checks pass.
- Django system and migration checks pass; Ruff passes for the backend.
- The production Angular build still exits in the known local esbuild failure mode before emitting
  diagnostics; the full Angular test compiler and TypeScript compiler pass.

### Next

1. Verify the new GitHub CI workflow on its first remote run, including the production frontend build.
2. Approve the first persistent CRUD resource and its role/permission matrix.
3. Decide whether new Viewer accounts need administrator approval or email verification in production.

## 2026-10-02 — Foundation gap closure

### Completed

- Added GitHub CI for locked dependency installation, formatting, Ruff, Django checks, migration
  drift, OpenAPI drift, backend/simulator/frontend tests, TypeScript, and production build.
- Protected topology, event-log, and SSE endpoints with server-side session authorization.
- Added scoped login and registration throttles.
- Enforced a non-default secret when debug is disabled and enabled production HTTPS redirect, secure
  cookies, content-type protection, clickjacking protection, and HSTS.
- Cleared the simulator lint failure and documented required production environment settings.

### Evidence

- Backend: 16 tests plus 3 password-validation subtests passing.
- Simulator: 5 tests and Ruff passing.
- Frontend: 14 tests, formatting, and TypeScript passing.
- Django configuration/migration checks and generated OpenAPI validation pass.
- The first GitHub-hosted CI run remains required before FND-03 can be marked complete.
