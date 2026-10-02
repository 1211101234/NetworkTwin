# Network Digital Twin Delivery Roadmap

**Baseline:** 2026-09-29 · **Planning horizon:** 29 weeks · **Delivery model:** solo, demo-first

## Planning assumptions

- Capacity is 12–15 focused project hours per week alongside regular duties.
- The system uses synthetic assets and open geographic context only.
- Each phase ends with evidence and a go/no-go decision; incomplete optional work does not delay the gate.
- Estimates are ranges until two delivery iterations provide actual velocity.
- The HOU demo target is the Phase 2 exit. Scenario depth follows in Phase 3.

## Outcomes and measures

| Outcome | Measure | Target |
| --- | --- | --- |
| Credible static twin | Stable 2D/3D presentation on Kuala Lumpur geography | 10,000 assets in the performance dataset |
| Live operational story | Fault, recovery, and technician events visible in sequence | p95 event-to-screen under 500 ms locally |
| Repeatable decisions | Three seeded scenarios produce consistent impact | Same seed and inputs produce identical results |
| Integration readiness | Frontend stays unchanged when a source adapter is replaced | Contract tests pass for synthetic and future adapters |
| Stakeholder confidence | Scripted demo and proposal reviewed | Feedback and go/no-go decision recorded |

## Release train

| Phase | Indicative dates | Required outcome | Exit evidence | Status |
| --- | --- | --- | --- | --- |
| 0 — Foundations | 29 Sep–16 Oct 2026 | Runnable skeleton, decisions, contracts, budgets | Clean builds, health/API docs, architecture review | 67% — first CI run remains |
| 1 — Static Twin | 19 Oct–11 Dec 2026 | Synthetic topology in interactive 2D and initial 3D | Mini-demo and measured performance report | Complete early |
| 2 — Live Twin | 14 Dec 2026–22 Jan 2027 | Replayable faults, recoveries, and technician movement | HOU demo rehearsal passes twice | Implementation complete; rehearsal remains |
| 3 — Scenario Engine | 25 Jan–19 Mar 2027 | Impact propagation and three headline scenarios | Seeded expected-result tests and comparison demo | Not started |
| 4 — Integration Readiness | 22 Mar–16 Apr 2027 | Approved adapter and security design | Integration specification review | Not started |
| 5 — Extensions | Proposal-dependent | Individually approved pilots | Separate pilot gate per extension | Gated |

Dates are working targets, not commitments. Re-baseline after the Phase 1 mini-demo.

## Phase 0 — Foundations

### Deliverables

1. Repository boundaries for frontend, API, simulation, and documentation.
2. Angular/NgRx/PrimeNG/MapLibre/deck.gl baseline and Django/DRF baseline.
3. Architecture, decision records, API schema, dependency register, and performance budgets.
4. Deterministic topology proof with a health endpoint and production frontend build.
5. Development workflow and a CI job once the repository host is confirmed.

### Exit gate

- A new developer can run both applications from the README.
- Formatting, unit tests, Django checks, OpenAPI validation, and frontend production build pass.
- No secrets or real operational/customer data are committed.
- Open decisions have an owner and a deadline.

## Phase 1 — Static Twin

### Iteration 1: topology vertical slice

- Generate a bounded hierarchy with stable identifiers from an explicit seed.
- Return typed assets and routes through a versioned endpoint.
- Render routes and asset types over Kuala Lumpur geography.
- Select an asset and inspect hierarchy, status, capacity, and position.
- Add reproducibility, validation, API, and component tests.

### Iteration 2: usable 2D operations view

- Add type/status filters, search, layer toggles, and a persistent legend.
- Add viewport-aware loading or clustering for larger datasets.
- Introduce NgRx feature state when topology, selection, and filters are shared across views.
- Add loading, empty, partial failure, and retry states.
- Record basemap/data attribution in the application.

### Iteration 3: 3D and performance

- Add height/elevation rules and 3D asset/cable layers.
- Produce 1k, 5k, and 10k seeded performance fixtures.
- Measure initial load, frame rate, memory, selection, and layer toggles.
- Apply level-of-detail and aggregation only where measurements justify them.
- Prepare the supervisor mini-demo and capture feedback.

### Exit gate

- The mini-demo completes without manual data repair or code changes.
- The 10k fixture stays within the agreed performance budgets or exceptions are documented.
- Asset counts and hierarchy integrity agree between generator, API, and UI.

## Phase 2 — Live Twin

### Work packages

- Define the event envelope, ordering, event ID, simulation time, and schema version.
- Implement deterministic fault/recovery scheduling and technician routes.
- Expose an SSE stream with resume support and heartbeat handling.
- Batch frontend updates and separate simulation time from wall-clock time.
- Add an event feed, pause/resume, speed controls, and deterministic replay.
- Build fault visibility, alert states, technician layers, and recovery transitions.
- Script and rehearse the HOU storyline with fallback recorded data.

### Exit gate

- Replaying the same event log produces the same final network state.
- Disconnect/reconnect does not silently lose or duplicate events.
- Two consecutive HOU demo rehearsals complete within the timebox.

## Phase 3 — Scenario Engine

### Work packages

- Validate NetworkX against the 10k topology fixture before accepting the dependency decision.
- Calculate downstream premises and capacity impact for failed nodes and routes.
- Represent hazards as explicit scenario inputs rather than UI-only effects.
- Deliver flood, cabinet-cluster failure, and planned-outage/placement scenarios.
- Add before/after and with/without-mitigation comparison views.
- Maintain golden expected results for seeded scenarios.

### Exit gate

- All three headline scenarios are reproducible from clean startup.
- Impact results match independently calculated fixture expectations.
- Scenario computation is within the two-second local budget or runs asynchronously with visible progress.

## Phase 4 — Integration Readiness

### Work packages

- Freeze versioned contracts for assets, routes, faults, technicians, and events.
- Define source adapters, synchronization ownership, retries, idempotency, and reconciliation.
- Map workforce-style data without duplicating dispatch or scheduling responsibilities.
- Complete authentication, authorization, audit, retention, aggregation, and anonymization designs.
- Perform threat modelling and dependency/security review.
- Produce a sanctioned-data pilot plan with rollback and success criteria.

### Exit gate

- Architecture, security, and data owners approve the integration specification.
- A contract-test harness proves adapter interchangeability.
- No real-data connection is attempted without explicit approval.

## Phase 5 — Gated extensions

AI assistance, predictive analytics, and AR/WebXR each require a separate problem statement, data-readiness assessment, risk review, pilot KPI, and stop condition. They do not enter the core backlog before Phase 4 approval.

## Operating cadence

- **Monday:** select one demonstrable weekly outcome and confirm dependencies.
- **Midweek:** integrate early; do not leave frontend/backend connection until the end.
- **Friday:** run the full verification suite, record measurements, risks, and a short demo capture.
- **Every two weeks:** review scope against the next exit gate and remove optional work if the gate is at risk.
- **At each phase gate:** demonstrate, record feedback, decide proceed/rework/stop, and re-baseline dates.

## Definition of done

A backlog item is done only when implementation, strict types, validation/error handling, focused tests, formatting, documentation/contract changes, and relevant performance/security checks are complete. A visual item also requires keyboard/accessibility review and a rendered browser check.

## Critical path

Deterministic topology → versioned API → performant 2D rendering → ordered event model → replay → impact graph → headline scenarios → adapter contract. Work outside this path must not threaten the next demo gate.

## Open decisions

| Decision | Deadline | Evidence needed |
| --- | --- | --- |
| Exact Kuala Lumpur bounding box and map-data source | Before Phase 1 iteration 2 | Coverage, licence/attribution, tile/service limits |
| NetworkX and SimPy acceptance | Phase 1/2 spikes | Determinism, performance, replay semantics |
| Persistence database beyond local SQLite | Before shared deployment | Query profile, deployment constraints, geospatial need |
| CI provider and deployment target | Repository hosting decision | Available runners, secrets model, environment policy |
| HOU date and demo duration | Before Phase 2 planning | Stakeholder availability and presentation timebox |

## Principal risks and triggers

| Risk | Trigger | Response |
| --- | --- | --- |
| Solo capacity | Two consecutive missed weekly outcomes | Cut optional scope and re-baseline the next gate |
| Map/rendering scale | Below 30 FPS in scripted interaction | Profile, aggregate, and introduce level-of-detail |
| Demo network dependence | Tile or service failure during rehearsal | Cache an approved offline demo package or use a local style |
| Unrealistic synthetic data | Stakeholder cannot recognise the topology story | Review generation rules with a network-domain contact |
| TMFORCE overlap concern | Dispatch/job-management requests enter backlog | Restate boundary and route those requirements to integration design |
| Real-data pressure | Request arrives before security approval | Use adapter mocks and start the sanctioned-access review |

## Proposed application layer

User login and persistent CRUD are a meaningful expansion of the synthetic-first demo. Their
recommended hierarchy, permission boundaries, data ownership, and implementation order are defined
in [`application-hierarchy.md`](application-hierarchy.md). They remain outside the core completion
percentage until the scope and repository host are confirmed.

## Immediate next three outcomes

1. Verify the new GitHub CI workflow and its production frontend build.
2. Confirm the first persistent CRUD entity and its role matrix.
3. Start SCN-01 with dependency-graph validation and golden impact fixtures.
