# Delivery Backlog

Status: `DONE`, `ACTIVE`, `NEXT`, `LATER`, `GATED`.

| ID | Item | Phase | Priority | Status | Acceptance evidence |
| --- | --- | --- | --- | --- | --- |
| FND-01 | Repository and runnable Angular/Django skeleton | 0 | Must | DONE | Builds, tests, live health response |
| FND-02 | Architecture, ADRs, budgets, licences, OpenAPI | 0 | Must | DONE | Documents reviewed and schema validates |
| FND-03 | CI pipeline for chosen repository host | 0 | Should | NEXT | Clean runner executes all checks |
| ST-01 | Deterministic hierarchy generator | 1 | Must | DONE | Same seed returns identical assets/routes |
| ST-02 | Versioned topology endpoint | 1 | Must | DONE | Contract, validation, and API tests pass |
| ST-03 | Kuala Lumpur 2D map with typed layers | 1 | Must | DONE | Assets/routes render and assets are selectable |
| ST-04 | Search and asset type/status filters | 1 | Must | DONE | Keyboard-accessible controls update visible set |
| ST-05 | Layer toggles and persistent legend | 1 | Should | DONE | Each layer changes independently within budget |
| ST-06 | Shared topology/selection/filter NgRx state | 1 | Should | DONE | State is shared by map, controls, and detail panel |
| ST-07 | 1k/5k/10k performance fixtures and report | 1 | Must | DONE | Measurements recorded against budgets |
| ST-08 | 3D layer and camera mode | 1 | Must | DONE | Distinct assets/routes visible in 3D |
| LIVE-01 | Versioned event envelope and event log | 2 | Must | DONE | Schema and ordering tests pass |
| LIVE-02 | Deterministic fault/recovery simulator | 2 | Must | DONE | Same seed produces same ordered log |
| LIVE-03 | Resumable SSE transport | 2 | Must | DONE | Reconnect test proves no loss/duplication |
| LIVE-04 | Technician movement | 2 | Should | LATER | Position follows replay clock |
| LIVE-05 | Timeline, speed, pause, and rewind | 2 | Should | DONE | Controls reproduce expected state |
| SCN-01 | Dependency graph and impact propagation | 3 | Must | LATER | Golden fixture results pass |
| SCN-02 | Flood scenario | 3 | Must | LATER | Seeded scenario replay and impact report |
| SCN-03 | Cabinet cluster failure | 3 | Must | LATER | Seeded scenario replay and impact report |
| SCN-04 | Planned outage / placement comparison | 3 | Must | LATER | Before/after comparison is reproducible |
| INT-01 | Source adapter contracts and contract tests | 4 | Must | LATER | Synthetic adapter can be swapped unchanged |
| INT-02 | Security, privacy, and sanctioned-data plan | 4 | Must | LATER | Stakeholder approval recorded |
| EXT-01 | AI operations copilot pilot | 5 | Could | GATED | Separate approved pilot brief |
| EXT-02 | Predictive maintenance pilot | 5 | Could | GATED | Separate approved pilot brief |
| EXT-03 | AR/WebXR field assistant | 5 | Could | GATED | Separate approved pilot brief |
