# ADR-0002 — Phase flip is bound to player movement (no switch button)

- **Status:** Accepted — **protected core innovation**
- **Date:** 2026-10-14
- **Deciders:** Product Lead + Game Designer (Agent 1), Orchestrator (Agent 0)

## Context

A "two-state board" could be implemented either as (a) the player explicitly toggling worlds with a button, or (b) the world toggling as a side effect of the player's own action.

## Decision

The phase flip is **bound to player movement**. Every legal move resolves in the current phase, then flips A↔B, then resolves the new phase. **A standalone phase-switch button is forbidden.**

## Rationale

Option (a) reduces the game to "walk, press button, walk" — the phase becomes a tool, not a pressure. Option (b) fuses cause and consequence into one input: *"if I move now, the world becomes that."* This is the single sentence the whole game is built on and the source of its planning depth.

## Consequences

- Every move is consequential (no free action).
- The player must plan `move → future board`.
- Undo/Restart become important accessibility valves.
- This rule may not be modified without **Product Lead + Game Designer double confirmation**, recorded in `docs/game-design.md`.