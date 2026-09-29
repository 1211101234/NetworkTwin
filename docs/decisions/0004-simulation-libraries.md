# ADR 0004: Simulation and topology libraries

**Status:** Proposed · **Date:** 2026-09-29

## Proposal

Use NetworkX for topology traversal and impact propagation, and SimPy for deterministic event scheduling.

## Validation gate

Accept this decision after a Phase 1 spike proves deterministic generation at the target asset count and a Phase 2 spike proves pause, speed, and replay semantics. Do not add the dependencies before that validation.
