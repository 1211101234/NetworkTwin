# ADR 0002: Streaming transport

**Status:** Accepted for initial implementation · **Date:** 2026-09-29

## Decision

Use Server-Sent Events for Phase 2 event delivery. Keep command and scenario operations on REST endpoints.

## Rationale

The first live-twin use case is one-way server-to-browser delivery. SSE provides reconnection semantics and works over ordinary HTTP with less infrastructure than WebSocket. Event identifiers will allow clients to resume a stream.

## Revisit when

Adopt WebSocket only if requirements demonstrate sustained bidirectional low-latency messaging that REST plus SSE cannot serve cleanly.
