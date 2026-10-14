# ADR-architecture-0001 — Illegal-move semantics: one `applyMove`, revert without flip

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Agent 2 (Architect); mirrors the parallel design lock GD-001 (Game Designer + Orchestrator)
- **Supersedes:** the V0.1 "player is never covered / incoming walls are suppressed on the player's tile" rule in `docs/architecture.md` §6

## Context

Architecture V0.1 specified that a wall spawned by the phase flip would be *suppressed* on the player's tile ("never covered"). That rule has three defects:

1. **Two rule paths** — wall suppression is a hidden exception to occupancy, so gameplay and solver can drift on exactly the edge case that matters most.
2. **Weaker puzzles** — suppression removes the planning pressure "if I move now, the world becomes that"; the flip stops being dangerous.
3. **Ambiguous truth** — the post-flip board no longer matches the level data, so `GameState` no longer fully describes what is drawn.

The design side locked the replacement in parallel (GD-001): a move that would leave the player standing on a phase wall is **illegal — no movement and no phase flip.**

## Decision

1. **Single truth source.** `applyMove(level, state, move)` in `src/core/rules/**` is the only implementation of the movement rule. Gameplay and Solver both call it; neither may re-implement or reorder it.
2. **Fixed step order** (spec in `docs/architecture.md` §6.2):
   `Validate Move → Move Player → Resolve Interaction → Flip Phase → Resolve Phase Effects → Check player-on-wall (illegal ⇒ revert, no flip) → Check Win`.
3. **Illegal = identity.** An illegal move returns a state structurally equal to the input (implementations may return the same reference). Position, interaction side effects and phase are all restored; the flip is not consumed. No crushing, pushing, suppression, or random relocation — deterministic puzzles only.
4. **`isLegalMove` is derived, not parallel.** It is defined as "applyMove completes without an illegal condition." An allocation-free pre-check is permitted only with a property test pinning `isLegalMove(s, m) ⟺ applyMove(s, m) ≢ s`.
5. **Hash contract.** `hashState` covers exactly `player`, `phase`, `doorsOpen`, `switchesOn` (records canonicalized with sorted keys). `moveCount`, `history`, `status` are excluded (§6.3). Because `applyMove` is pure and deterministic and illegal moves contribute no graph edge, the BFS graph is finite (`width × height × 2 × 2^|doors| × 2^|switches|`) and BFS terminates with the true shortest solution.
6. **Boundary enforcement.** An automated Vitest import-boundary test (static source scan, no execution) fails CI if any file under `src/core/**` — including `src/core/solver/**` — imports `'phaser'` (spec in `docs/architecture.md` §12.1). This is the enforcement arm of ADR-0003.

## Consequences

- (+) One rule, one code path: gameplay, solver and replay can never disagree on legality.
- (+) Phase flip stays dangerous ⇒ planning depth is preserved (the core innovation, ADR-0002).
- (+) Illegal-move feedback is trivially renderable (reject animation, board unchanged) — UI/Art does not need a "suppressed wall" visual state.
- (+) Hashable finite graph ⇒ solver correctness proof stays simple.
- (−) Levels can now contain true dead ends; the level generator and difficulty metrics (deadEndRatio) must account for this — owned by Agent 4.
- (−) Undo/restart become the only recovery valves, reinforcing ADR-0002's accessibility note.

## Rejected alternatives

- **Wall suppression (V0.1 rule)** — hidden occupancy exception; see defects above.
- **Crush = death/restart** — rejected on the design side for casual accessibility.
- **Legal move that doesn't flip** — breaks "every legal move flips the phase" (ADR-0002); forbidden.

## Addendum 2026-10-14 — RV-001 reconciliation: door coverage of the post-flip check; hashed-state semantics

Recorded after cross-agent review RV-001; no rule change, only clarification of the locked rule's scope and the state contract.

- **H-3 — the post-flip solidity check covers doors.** Condition 3 / applyMove step 6 is "a wall **or a closed door** active in the **new** phase": anything solid in the post-flip phase must not be under the player. Without this, a red door open in Phase A could close onto the player at the flip while the move stayed legal — re-creating exactly the second rule path this ADR exists to kill. One rule, both phases: *if the post-flip board is solid under you, the move does not happen.*
- **M-7 — `doorsOpen` semantics.** Absolute post-resolution openness, recomputed from `(door.color, current phase, switchesOn)` at every phase resolution (step 5, per the door rules in `docs/level-design.md` §1); never an incremental carryover. Canonical by construction ⇒ equal logical states always hash equal.
- **M-7 — `switchesOn` semantics.** Latched toggle: flips only when the player enters the switch tile while its `activePhase` is current (step 3).
- **M-7 — portal trigger.** A portal teleports only on the entering move; the far end does not chain-trigger, and standing on a portal tile later (including when the flip activates it under the player) never teleports.

## Addendum 2026-10-14 — GATE C / Option B: the post-flip standing check is removed

**GATE C (human decision, 2026-10-14) adopted Option B.** This supersedes the third legality condition of ADR-0006 ("after the flip, the tile the player would stand on must not be solid in the new phase") and, in this ADR, the "Check player-on-wall (illegal ⇒ revert, no flip)" step of Decision item 2. The RV-001 addendum's H-3 extension of that check to closed doors is superseded with it. Effective immediately, and reflected in `docs/architecture.md` V0.4 §6:

- **Legality consults the current phase only.** Out-of-bounds or current-phase-solid target (wall active now, door closed now — one solidity semantics for both) ⇒ illegal ⇒ identity: no movement, no interaction side effects, no phase flip.
- **Standing inside a solid cell is legal and stable.** After the flip resolves, the player may be inside a cell that is solid in the new phase. Moving out is judged by the same rule: the destination must be in-bounds and non-solid in the current phase.
- **`applyMove` step order is now:** Validate Move (current phase) → Move Player → Resolve Interaction (entry-triggered switch/portal only; no chains, no re-trigger while standing) → Flip Phase → Resolve Phase Effects (absolute recompute of active objects and `doorsOpen`; **no retrospective rollback**) → Check Win (position equality, phase-independent).
- **Retained invariant — the player is never crushed, pushed, or randomly relocated.** Removing the post-flip check introduces no forced movement: a legal move still ends with the player exactly where they moved (or where a portal placed them); a solid cell appearing under the player is a board state, not an action on the player. ADR-0006's rejected alternatives (crush = death; push/slide) remain rejected. The V0.1 wall-suppression rule also remains superseded — walls are never suppressed; what changed is that standing inside one is a legal outcome, not grounds for refusing the move.
- **Everything else in this ADR stands:** single truth source (`applyMove` shared by Gameplay and Solver), illegal = identity, derived `isLegalMove` with the property-test pin, the hash contract (player, phase, doorsOpen, switchesOn — unchanged), and the import-boundary enforcement.
- **Solver consequence (architecture.md §8):** ADR-0006's union property no longer holds — phase walls are enterable from the opposite phase and routing is parity-dependent — so `deadEndRatio` and lookahead-style metrics become meaningful difficulty signals. The finite, deterministic BFS argument in Decision item 5 is unaffected (re-argued in architecture.md §6.3).
