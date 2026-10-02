# Network Twin Progress Tracker

> Open this file in VS Code and use **Open Preview** (`⌘⇧V`) for the dashboard view.
>
> Last updated: 3 October 2026 · Core delivery: **17 of 22 items complete (77%)**

## At a glance

| Phase                     |   Progress | Status      | Current outcome                                          |
| ------------------------- | ---------: | ----------- | -------------------------------------------------------- |
| 0 — Foundations           | 3/3 · 100% | Complete    | Full GitHub CI pipeline verified                         |
| 1 — Static Twin           | 8/8 · 100% | Complete    | 2D/3D topology verified at 9,997 assets                  |
| 2 — Live Twin             | 5/5 · 100% | Complete    | Faults, recovery, and technicians share one replay clock |
| 3 — Scenario Engine       |  1/4 · 25% | Active      | Dependency impact complete; flood scenario next          |
| 4 — Integration Readiness |   0/2 · 0% | Planned     | Adapter contracts and security plan                      |
| 5 — Optional Extensions   |      Gated | Not counted | Separate approval required for each pilot                |

```text
Core roadmap  [███████████████░░░░░] 77%
Current phase [█████░░░░░░░░░░░░░░░] 25%
```

## Current focus

- [x] **FND-03:** GitHub CI passes on the merged authentication/live-twin delivery.
- [x] Add registration, authentication/session, protected routing, and the role foundation.
- [ ] Confirm the first persistent CRUD entity; network assets are recommended.
- [x] **SCN-01:** Deterministic dependency graph and downstream impact propagation.
- [ ] **SCN-02:** Add the seeded geographic flood scenario — next.

## Completed

### Phase 0 — Foundations

- [x] Runnable Angular and Django repository.
- [x] Architecture decisions, API schema, dependency register, licences, and budgets.
- [x] GitHub CI pipeline with clean production build verification.

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

- [x] Dependency graph and downstream impact propagation.
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

- Backend: **19 tests passed** (plus 3 password-validation subtests).
- Simulator: **8 tests passed**.
- Frontend: **15 tests passed**.
- Dependency-impact golden fixtures cover exchange, cabinet, distribution-point, premise, direct,
  transitive, empty, and unknown-source behavior.
- Ruff, TypeScript, Django tests, OpenAPI validation, and the production Angular build pass in CI.
- GitHub CI runs locked installs, formatting, lint, migrations, schema drift, tests, type-checking,
  and the production frontend build. [Run #1 passed](https://github.com/1211101234/NetworkTwin/actions/runs/37007898447).
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
