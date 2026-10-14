# ADR-0003 — Core logic decoupled from Phaser; Solver reuses core rules

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Agent 2 (Architect), Agent 4 (Solver), Orchestrator

## Context

If game rules live inside Phaser scenes, automated verification requires running a browser and manipulating sprites — slow, brittle, and impossible to use for bulk level generation.

## Decision

- Rules live in `src/core` as **pure TypeScript** with **zero Phaser imports**.
- Phaser is a **visualization layer only**; it never owns truth.
- The Solver depends on `src/core` and **never** on Phaser scenes.

Dependency direction:

```
Renderer → Gameplay → Core Logic
Solver → Core Logic
```

## Consequences

- Same `applyMove` powers both gameplay and BFS/A* ⇒ no rule drift.
- Levels can be generated, validated and scored headlessly in Node.
- Enforced by an import-boundary test in CI.

## Rejected

`Solver → Phaser Scene` — explicitly forbidden.