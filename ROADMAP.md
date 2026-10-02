# Network Twin Progress Tracker

> Open this file in VS Code and use **Open Preview** (`⌘⇧V`) for the dashboard view.
>
> Last updated: 2 October 2026 · Core delivery: **15 of 22 items complete (68%)**

## At a glance

| Phase                     |   Progress | Status      | Current outcome                                          |
| ------------------------- | ---------: | ----------- | -------------------------------------------------------- |
| 0 — Foundations           |  2/3 · 67% | Active      | CI added; first clean GitHub run remains                 |
| 1 — Static Twin           | 8/8 · 100% | Complete    | 2D/3D topology verified at 9,997 assets                  |
| 2 — Live Twin             | 5/5 · 100% | Complete    | Faults, recovery, and technicians share one replay clock |
| 3 — Scenario Engine       |   0/4 · 0% | Planned     | Dependency graph and impact propagation                  |
| 4 — Integration Readiness |   0/2 · 0% | Planned     | Adapter contracts and security plan                      |
| 5 — Optional Extensions   |      Gated | Not counted | Separate approval required for each pilot                |

```text
Core roadmap  [██████████████░░░░░░] 68%
Current phase [████████████████████] 100%
```

## Current focus

- [ ] **FND-03:** Verify the new GitHub CI workflow on its first remote run.
- [x] Add registration, authentication/session, protected routing, and the role foundation.
- [ ] Confirm the first persistent CRUD entity; network assets are recommended.
- [ ] **SCN-01:** Validate the dependency graph and downstream impact propagation.

## Completed

### Phase 0 — Foundations

- [x] Runnable Angular and Django repository.
- [x] Architecture decisions, API schema, dependency register, licences, and budgets.
- [ ] GitHub CI pipeline added; clean remote run pending.

### Phase 1 — Static Twin

- [x] Deterministic exchange-to-premise topology generator.
- [x] Versioned topology API with validation and safety limits.
- [x] Kuala Lumpur MapLibre/deck.gl map and asset inspection.
- [x] Search, status filters, asset layers, routes, and reset controls.
- [x] Shared typed NgRx feature state.
- [x] Demo, 1k, 5k, and 10k performance profiles.
- [x] Zoom-aware 2,000-asset detail cap.
- [x] 2D/3D camera and layer mode.

### Phase 2 — Live Twin

- [x] Version 1.0 ordered event envelope and event log.
- [x] Deterministic seeded fault and recovery simulation.
- [x] Resumable SSE delivery with heartbeat and duplicate prevention tests.
- [x] Play, pause, speed, reset, simulation clock, and event feed.
- [x] Technician entities, routes, movement events, and map layer.

### Proposed application layer — scope approval required

- [x] Authentication and session lifecycle.
- [x] Self-registration with validated, hashed passwords and default Viewer access.
- [x] Registration/login throttling and authenticated topology/event APIs.
- [x] Viewer/operator/planner/administrator role foundation.
- [ ] Object-level permission matrix for persistent resources.
- [ ] Persistent CRUD APIs for approved operational entities.
- [ ] Audit history, validation, conflict handling, and archive rules.

See [Application hierarchy and delivery order](docs/application-hierarchy.md). These items are not
included in the 22-item core percentage until their scope is approved.

## Upcoming

### Phase 3 — Scenario Engine

- [ ] Dependency graph and downstream impact propagation.
- [ ] Seeded flood scenario.
- [ ] Seeded cabinet-cluster failure scenario.
- [ ] Planned-outage or placement comparison.

### Phase 4 — Integration Readiness

- [ ] Replaceable source-adapter contracts and contract tests.
- [ ] Security, privacy, audit, retention, and sanctioned-data plan.

### Phase 5 — Optional, separately gated

- [ ] AI operations copilot pilot.
- [ ] Predictive maintenance pilot.
- [ ] AR/WebXR field assistant pilot.

## Latest verified evidence

- Backend: **14 tests passed** (plus 3 password-validation subtests).
- Simulator: **5 tests passed**.
- Frontend: **14 tests passed**.
- Ruff, TypeScript, Django tests, and OpenAPI validation pass. The production Angular build was not
  re-verified after LIVE-04 because the local esbuild service deadlocked; TypeScript compilation passes.
- GitHub CI now runs locked installs, formatting, lint, migrations, schema drift, tests, type-checking,
  and the production frontend build; its first remote run is pending.
- 9,997-asset profile: 25.1 ms generation and 153.3 ms serialization median.
- Replay: twelve ordered events, including six technician movements, with deterministic reset covered.

## Detailed project records

- [Full delivery roadmap](docs/roadmap.md)
- [Item-level backlog](docs/backlog.md)
- [Delivery evidence log](docs/progress.md)
- [Performance baseline](docs/performance-baseline.md)
- [Architecture](docs/architecture/system-architecture.md)

Update this dashboard whenever an item changes status. The item IDs and acceptance evidence in
`docs/backlog.md` remain the detailed source of truth.
