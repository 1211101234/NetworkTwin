# Application Hierarchy: Authentication and CRUD

**Status:** Registration and authentication foundation implemented · CRUD scope approval remains

## Guiding boundary

The generated topology and event log remain reproducible simulation inputs. Persistent CRUD should
manage deliberate operational records; it must not silently overwrite a generated snapshot or turn
the twin into a workforce dispatch system.

## User hierarchy

| Role            | Read twin | Run replay/scenarios | Manage assets/routes  | Manage technicians            | Manage users |
| --------------- | --------- | -------------------- | --------------------- | ----------------------------- | ------------ |
| Viewer          | Yes       | No                   | No                    | No                            | No           |
| Operator        | Yes       | Yes                  | No                    | Update operational state only | No           |
| Network planner | Yes       | Yes                  | Create/update/archive | Read                          | No           |
| Administrator   | Yes       | Yes                  | Yes                   | Yes                           | Yes          |

Permissions must be enforced by Django/DRF on every endpoint. Angular route guards and hidden
controls improve the interface but are not security boundaries.

## Domain hierarchy

```text
Organisation
├── Users and roles
├── Network
│   └── Exchange
│       └── Cabinet
│           └── Distribution point
│               └── Premise
├── Routes
│   └── Source asset → target asset
├── Field operations
│   └── Technician → assignment → asset
└── Scenarios
    └── Scenario → run → immutable event/result log
```

## Recommended CRUD scope

1. **Users and roles:** administrator-managed activation, deactivation, and role assignment. Password
   handling uses Django authentication; passwords and tokens are never returned or logged.
2. **Network assets:** create, read, update, and archive exchanges, cabinets, distribution points,
   and premises. Parent/type rules prevent invalid hierarchy changes.
3. **Routes:** create, read, update, and archive connections. Both endpoints must exist, self-links
   are rejected, and duplicate active links are constrained.
4. **Technicians:** create, read, update, and archive profiles plus availability state. Assignment is
   a separate record so movement history is not overwritten.
5. **Scenarios:** create, read, update, archive, and execute definitions. Completed runs and event
   logs are immutable audit records rather than ordinary CRUD resources.

Use soft archive for referenced operational records. Hard deletion is limited to unreferenced draft
records and administrative maintenance because routes, assignments, and scenario runs require
historical integrity.

## Delivery order

### A — Authentication foundation

- [x] Use secure same-origin Django sessions by default.
- [x] Add login, logout, current-user, CSRF handling, and inactive-user rejection.
- [x] Add Angular session state, login UI, and unauthenticated handling.
- [x] Add self-registration with password rules, duplicate detection, and default Viewer access.
- [x] Protect the main Angular route and redirect logout to sign-in.
- [x] Protect topology/event APIs with Django session authorization.
- [x] Add scoped throttling for login and registration attempts.
- [x] Test authentication, CSRF, invalid credentials, logout, and unauthorized access.
- [ ] Add protected management routes and session-expiry return URL when the first CRUD area exists.

### B — Authorization and audit

- Add role groups and explicit DRF permission classes.
- Define action-by-role tests before exposing write endpoints.
- Record actor, timestamp, action, target, and safe before/after metadata for writes.

### C — Persistent domain model

- Introduce Django models and migrations with hierarchy constraints, indexes, archive timestamps,
  optimistic concurrency/version fields, and safe uniqueness rules.
- Add a source boundary so generated snapshots and persisted records implement the same read contract.
- Provide an explicit import/promote workflow; never persist generated demo data accidentally.

### D — CRUD APIs

- Add versioned serializers/viewsets with filtering, pagination, validation, transactions, and
  consistent errors.
- Cover permission, hierarchy, conflict, archive, and rollback behavior.
- Update OpenAPI and add adapter-level contract tests.

### E — Angular management UI

- Add authenticated application shell and role-aware navigation.
- Build list/detail/create/edit/archive flows with typed reactive forms.
- Handle loading, empty, validation, conflict, forbidden, and retry states.
- Keep NgRx for shared server-backed collections; keep form state local.

## Decisions required before implementation

1. Single-organisation is the implemented baseline; confirm whether multi-organisation is required.
2. Which records are editable first: assets, routes, technicians, scenarios, or all four?
3. Self-registration with default Viewer access is the implemented baseline; confirm whether new
   accounts require administrator approval or email verification before production use.
4. Should synthetic topology be read-only, importable into persistence, or overlaid with edits?
5. Which repository host will run CI, and what is the first deployment environment?
