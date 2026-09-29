# ADR 0003: Demo geography

**Status:** Accepted provisionally · **Date:** 2026-09-29

## Decision

Use a bounded Kuala Lumpur city-centre area as the initial demonstration geography. Exact bounding coordinates will be fixed alongside the generator's first dataset.

## Rationale

The area is locally recognisable, dense enough for a credible access-network demonstration, and small enough to keep early asset and rendering budgets controlled.

## Constraints

Only open geographic data and synthetic telecom assets may be used. The first vertical slice uses OpenFreeMap's public Liberty style for geographic context. Its availability and attribution requirements must be reviewed before an external demo or deployment. OpenStreetMap-derived features must not be presented as TM network infrastructure.
