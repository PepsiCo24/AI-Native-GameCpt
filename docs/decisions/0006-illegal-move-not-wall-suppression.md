# ADR-0006 — Illegal move refused (no movement, no flip); wall suppression rejected

- **Status:** Accepted — locked in `docs/game-design.md` V0.2 §3.1
- **Date:** 2026-10-14
- **Deciders:** Game Designer (Agent 1), Orchestrator (Agent 0); Playtest Analyst confirmation pending Stage 2

## Context

V0.1 left one core-rule question open: what happens when the phase flip would place a wall on the player's tile? V0.1 answered with *wall suppression* ("the player is never covered; incoming walls are suppressed on the player's tile"). Stage-1 review found this creates **two different resolution paths for the same object** — a wall sometimes blocks, sometimes yields — which the player and the Solver can model differently. That is a direct threat to determinism and to the single shared rules source (ADR-0002, ADR-0004, architecture-0001).

Rule-change record (required format):

- **Original Hypothesis (V0.1):** suppress incoming walls on the player's tile; telegraph it visually (the tile stays clear).
- **Problem:** two rule paths for one object; player state and solver state can diverge; "walls that aren't always walls" weakens every later mechanic built on top of them.
- **Change (V0.2):** any move whose resolution would leave the player standing on a phase wall is **illegal** — refused atomically: no movement and no phase flip.
- **Evidence:** case analysis (union property, see Consequences); consistency with ADR-0002 (flip bound to *legal* moves) and ADR-0004 (Solver and gameplay share one truth). Empirical playtest evidence: pending Stage 2 — tracked in `docs/playtest-log.md`.
- **Result:** rule locked in `docs/game-design.md` V0.2 §3.1; teaching ladder rebuilt around refusal-as-tutorial in `docs/level-design.md` §2–§3.

## Decision

A move is legal only if (1) the destination tile is not solid in the current phase **and** (2) after the move resolves and the phase flips, the tile the player would stand on is not a wall in the new phase. An illegal move is refused atomically: **no movement and NO phase flip.** The V0.1 wall-suppression rule is deleted and superseded.

## Consequences

- (+) **One rule path.** A wall is a wall in every context; player model, renderer, and Solver share one truth (ADR-0004, architecture-0001 stay sound).
- (+) **Refusal is a free tutorial.** The blocked move itself communicates "that tile is a wall in the other world" with zero text; the L1–L10 teaching ladder (`docs/level-design.md` §2–§3) is built on this channel.
- (+) No special-case rendering for suppressed tiles; the two-phase visual language stays consistent (readability rule, game-design.md §7).
- (−) **Union property (proved by case analysis):** entering a wall tile from its own phase is blocked by solidity; entering from the other phase is blocked by the post-flip standing check. Therefore a tile that is a wall in *either* phase is *never* a legal destination. Plain phase walls are permanent obstacles with phase-skinned visibility; they cannot, by themselves, open or close routes. Genuine route dynamism must come from doors (M1), portals (M2), and switches (M3). Recorded as OQ-1 in `docs/level-design.md` with a Stage-2 playtest gate and documented mitigations.
- (−) Refused moves need unmistakable feedback (bump animation + visibly unchanged phase) or they read as input failure — dependency on UI direction (`docs/ui-ux.md`).
- Undo and Restart remain the only safety valves; levels must still contain no unrecoverable states (Solver-enforced, `docs/level-design.md` §4).

## Alternatives considered

- **Wall suppression on the player's tile (V0.1)** — REJECTED: two resolution paths for one object; solver/player divergence; weakens determinism and every wall-derived mechanic.
- **Crush = death** — REJECTED: adds a fail state the design deliberately excludes (game-design.md §12); punishment spikes are anti-casual and would poison the first ten minutes.
- **Push/slide the player to a free tile** — REJECTED: violates "the player is never crushed / pushed / randomly moved" (AGENTS.md §2); feels non-deterministic even when it isn't.
- **Allow standing; block only passing *through*** — REJECTED: the same two-path problem in softer clothing, plus ambiguous board states for the Solver.
