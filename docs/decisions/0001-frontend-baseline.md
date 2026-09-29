# ADR 0001: Frontend baseline

**Status:** Accepted · **Date:** 2026-09-29

## Decision

Use Angular 21 LTS with standalone components, NgRx 21, RxJS 7, PrimeNG 21, Tailwind CSS 4, MapLibre GL, and the framework-neutral deck.gl packages.

NgRx will hold shared topology, selection, and scenario state only. Component-local presentation state remains local.

## Rationale

Angular 21 is supported and compatible with the installed Node.js 24 runtime. PrimeNG 21 is the final MIT-licensed major version; PrimeNG 22 requires a PrimeUI licence and therefore conflicts with the project's open-source-only constraint. Standalone APIs are the Angular default for a fresh application. The framework-neutral deck.gl packages avoid adding React to the Angular application.

## Consequences

The project deliberately favours the supported open-source baseline over the newest PrimeNG major. Dependency versions are locked in `package-lock.json`; Angular or PrimeNG major upgrades require an explicit licence and compatibility review.

## Revision

The initial Angular/PrimeNG 22 scaffold was revised on 2026-09-29 after live browser verification displayed a PrimeUI licence notice. Angular, NgRx, and PrimeNG were aligned on major version 21 before feature work continued.
