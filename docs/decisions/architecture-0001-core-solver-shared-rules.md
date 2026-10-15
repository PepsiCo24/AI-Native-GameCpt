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

## Addendum 2026-10-14 — RV-002 rulings: portal landing, win latch, naming freeze, hash canonicalization, parity invariant

Recorded after cross-agent review RV-002 (task AR-0004). **No core-rule change** — Option B stays locked (GATE D chose D3, mechanism-forward); this addendum resolves doc↔code drift, corrects one false premise, and extends the hash contract to match the shipped implementation. Reflected in `docs/architecture.md` V0.5.

- **H-2 — portal landing: ruling (a) ADOPTED.** V0.4 contradicted itself: §6.2 step 3 demanded the landing tile "pass the same current-phase solidity checks as a normal move", while the implementation contract made step 1 the only failure point. Resolved in favor of the implementation contract (which is also what `src/core/rules/applyMove.ts` already does): once the entering move is legal, the teleport **always** happens; a far end solid in the current phase produces an ordinary embedded state (ADR-0008 clause 3) — no refusal, no rollback. The landing tile never coincides with the stepped-on end and never chain-triggers. The ambiguity is removed at the **data layer**: level validation hard-requires both portal ends to be non-wall in BOTH phases and off every door tile (mirroring ADR-0008 rule 7 for the goal), so validated levels never produce a portal-embedded landing. **Alternative (b) — re-judging the far end inside step 1 — is REJECTED:** it would give one object (the portal) two rule paths, its legality decided at two different tiles — precisely the hybrid failure mode ADR-0008's Alternatives section rejects (Option C). Decision 1 (one truth source) stands unchanged.
- **M-4 — win latch is GameState-layer bookkeeping.** `applyMoveToGameState` returns the identical state for ANY move once `status === "won"` (`src/core/state/transitions.ts`). Decision 4's equivalence `isLegalMove(s,m) ⟺ applyMove(s,m) ≢ s` therefore holds **only for the SearchState-layer pure functions**; QA property tests must target that layer, never the `GameState` reducer. The latch keeps `moveCount`/`history` honest after completion; post-win input locking remains Gameplay's job. `applyMove` itself stays status-unaware, so Solver and Gameplay still share one truth source.
- **M-2 — naming frozen.** The level type is **`Level`** (code contract, `src/core/level`, already imported by GAME-001), not `LevelDef`; architecture.md V0.5 renames every reference. The name is frozen — no further renames.
- **M-3 — hash canonicalization completed.** Decision 5's "sorted keys" is extended with the two rules the implementation already applies: **falsy omission** (entries not literally `true` are dropped, so `{d1:false}` hashes identically to `{}` — sound because a missing key always reads closed/off) and **length-prefixed keys** (`<len>:<key>=1,`, injective even for ids containing the separators). Both are QA property-test targets (architecture.md §6.3/§12). The hash contract's field set (player, phase, doorsOpen, switchesOn) is unchanged.
- **§8 premise correction — the board-parity invariant.** V0.4 §8 claimed "routing depends on move parity ⇒ `deadEndRatio`/lookahead gain meaning". The premise is false. On a 4-directional grid with a flip per legal move, `phase = startPhase ⊕ parity((x+y) − (sx+sy))` is an **invariant**: each cell is enterable in exactly one phase, so M0 legal-move sets depend on position only (proven: 0 dual-phase reachable cells over 400 random boards; 0 counterexamples over 880,640 enumerated configurations). What actually creates move-history dynamics: **latched state** (M3 switches → doors) and **non-±1 displacement** (M2 portals whose ends sit on opposite checkerboard colors — the only construction that breaks the invariant). Measured over 200 generated boards per class: doors+switches produced refused-then-entered tiles in **74/200**; opposite-parity portals in **80/200** (always with dual-phase tiles); same-parity portals **0/200** — connectivity without new timing structure, a dead difficulty mechanic. New **required** solver metrics: `dualPhaseTiles` and `refusedThenEnteredTiles`, both decidable from BFS visitation; `dualPhaseTiles = 0` marks a mechanically static level. Decision 5's finite-BFS argument is unaffected (the `w×h×2×2^d×2^s` bound still holds); `phase` stays in the hash — redundant under the invariant today, payload the moment opposite-parity portals ship.
- **Known gap (RV-002 H-5).** The §12.1 import-boundary test (Decision 6's enforcement arm) and the §6.2 property test (Decision 4's pin) are specified but **not yet implemented**; QA delivers both in the same round (QA-001). Until they land, Decision 6 and the Decision-4 pin are enforced by review only.
