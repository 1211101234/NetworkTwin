# Network Twin Progress Tracker

> Open this file in VS Code and use **Open Preview** (`⌘⇧V`) for the dashboard view.
>
> Last updated: 30 September 2026 · Core delivery: **14 of 22 items complete (64%)**

## At a glance

| Phase | Progress | Status | Current outcome |
| --- | ---: | --- | --- |
| 0 — Foundations | 2/3 · 67% | Active | CI pipeline remains |
| 1 — Static Twin | 8/8 · 100% | Complete | 2D/3D topology verified at 9,997 assets |
| 2 — Live Twin | 4/5 · 80% | Active | Technician movement remains |
| 3 — Scenario Engine | 0/4 · 0% | Planned | Dependency graph and impact propagation |
| 4 — Integration Readiness | 0/2 · 0% | Planned | Adapter contracts and security plan |
| 5 — Optional Extensions | Gated | Not counted | Separate approval required for each pilot |

```text
Core roadmap  [█████████████░░░░░░░] 64%
Current phase [████████████████░░░░] 80%
```

## Current focus

- [ ] **LIVE-04:** Add technician entities and deterministic movement events.
- [ ] Render a technician map layer tied to simulation time.
- [ ] Verify technician position during play, pause, speed change, and reset.
- [ ] **FND-03:** Add GitHub CI after the live movement slice is stable.

## Completed

### Phase 0 — Foundations

- [x] Runnable Angular and Django repository.
- [x] Architecture decisions, API schema, dependency register, licences, and budgets.
- [ ] GitHub CI pipeline.

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
- [ ] Technician entities, routes, movement events, and map layer.

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

- Backend: **6 tests passed**.
- Simulator: **4 tests passed**.
- Frontend: **7 tests passed**.
- Production Angular build, Ruff, TypeScript, Django checks, and OpenAPI validation pass.
- 9,997-asset profile: 25.1 ms generation and 153.3 ms serialization median.
- Live browser replay: six ordered events, status transitions, and deterministic reset verified.

## Detailed project records

- [Full delivery roadmap](docs/roadmap.md)
- [Item-level backlog](docs/backlog.md)
- [Delivery evidence log](docs/progress.md)
- [Performance baseline](docs/performance-baseline.md)
- [Architecture](docs/architecture/system-architecture.md)

Update this dashboard whenever an item changes status. The item IDs and acceptance evidence in
`docs/backlog.md` remain the detailed source of truth.
