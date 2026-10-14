# ADR-0005 — Asset Gate: no self-generated final art

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Agent 5 (Art Director), Orchestrator, User

## Context

The competition values fun, not art complexity, but the two-phase world still needs a coherent, readable visual identity. Letting an agent "just generate something" risks style drift and readability loss.

## Decision

Any task requiring new **cover / character / scene / background / logo / icon / sprite / decorative / VFX texture** must first produce `docs/assets/asset-request-XX.md` (with full prompt spec), then output `WAITING_FOR_USER_ASSETS` and pause all dependent work. The user generates the images. The Art Agent then checks → names → resizes → verifies transparency → verifies style consistency → places into `assets/`.

## Consequences

- A human gate exists between art need and art production.
- Asset specs are reviewable before generation (cheaper to fix).
- Agents are forbidden from self-generating final assets.