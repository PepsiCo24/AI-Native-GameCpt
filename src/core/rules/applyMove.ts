/**
 * `isLegalMove` / `applyMove` — the **single truth source** for movement.
 *
 * AGENTS.md §3: "Gameplay and Solver must call the same `applyMove` rule
 * function. One truth source." Neither layer may re-implement or reorder it.
 *
 * Truth sources:
 * - ADR-0008 (GATE C, Option B — human-approved core-rule change), all 8 clauses.
 * - `docs/architecture.md` V0.4 §6.1 (illegal-move semantics) and §6.2
 *   (`applyMove` 6-step order).
 * - ADR-architecture-0001 decision 1–4 + its 2026-10-14 GATE C addendum.
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 *
 * ---------------------------------------------------------------------------
 * ADR-0008 clause → code map
 * ---------------------------------------------------------------------------
 * c1 Legality at entry, current phase only, illegal ⇒ identity
 *      → `validateEntry` (called by `isLegalMove` and `applyMove` step 1)
 * c2 Flip stays bound to movement (no manual switch)
 *      → `applyMove` step 4; an illegal move returns before it
 * c3 Standing inside a wall is legal (never crushed / pushed / moved)
 *      → there is *no* post-flip standing check anywhere in this file
 * c4 Exit from an embedded tile uses the same entry rule
 *      → `validateEntry` reads only the destination, never `s.player`
 * c5 Doors share the wall semantics
 *      → `solidAt` (rules/solid.ts) — one solidity predicate for walls + doors
 * c6 Portals trigger on entry only (no chains, no re-trigger while standing)
 *      → `applyMove` step 3 (executed once, on the stepped-onto tile)
 * c7 Win = standing on the goal at the end of a fully-resolved legal move, any phase
 *      → `isGoal` (state/transitions.ts), applied by the caller *after* step 5
 * c8 Parity-dependent entry (a B-wall is enterable during A-steps, and vice versa)
 *      → falls out of c1 + `solidWallTiles(level, phase)`
 */

import type { Level } from "@/core/level";
import type { Move } from "@/core/state/move";
import { step } from "@/core/state/move";
import { flipPhase } from "@/core/state/phase";
import type { SearchState, Vec } from "@/core/state/types";
import {
  inBounds,
  portalAt,
  portalExit,
  resolveDoorsOpen,
  solidAt,
  switchAt,
} from "./solid";

/**
 * STEP 1 of the truth — the entry decision. `undefined` means "illegal move".
 *
 * The **only** illegal conditions (`docs/architecture.md` §6.1):
 * 1. the destination is out of bounds;
 * 2. the destination is solid in the **current** phase (a wall active now, or a
 *    door closed now — one semantics for both).
 *
 * There is no post-flip legality check: the tile after the flip is never
 * re-judged (ADR-0008 clause 3), and the player's *own* tile is never part of
 * the decision, so a player standing inside a solid cell can still step out
 * onto any currently non-solid neighbour (clause 4).
 */
function validateEntry(level: Level, s: SearchState, m: Move): Vec | undefined {
  const target = step(s.player, m.dir);
  if (!inBounds(level, target)) return undefined;
  if (solidAt(level, s.phase, s.doorsOpen, target)) return undefined;
  return target;
}

/**
 * Derived predicate, not a parallel rule (ADR-architecture-0001 decision 4):
 * `isLegalMove(level, s, m)` ⟺ `applyMove(level, s, m) !== s`.
 *
 * The equivalence holds by construction: both call `validateEntry`, and a legal
 * move always changes `phase` (step 4), so a successful `applyMove` can never
 * return a state structurally equal to the input. QA pins this with a property
 * test (`docs/architecture.md` §6.2 implementation contract).
 */
export function isLegalMove(level: Level, s: SearchState, m: Move): boolean {
  return validateEntry(level, s, m) !== undefined;
}

/**
 * Apply one `MOVE(direction)` — the 6 steps of `docs/architecture.md` §6.2, in
 * this exact order:
 *
 * ```
 * 1. Validate Move        — in bounds + non-solid in the CURRENT phase
 * 2. Move Player          — set the player position to the target cell
 * 3. Resolve Interaction  — switch toggle / portal teleport, entry-triggered only
 * 4. Flip Phase           — A→B / B→A
 * 5. Resolve Phase Effects— absolute recompute of `doorsOpen`; NO rollback
 * 6. Check Win            — `isGoal(level, result)`, phase-independent
 * ```
 *
 * Step 1 is the only failure point; once it passes, steps 2–5 always complete —
 * there is no later failure path and no rollback machinery. Step 6 is not part
 * of `SearchState` (the hash contract excludes `status`, §6.3), so it is the
 * caller's evaluation of `isGoal(level, applyMove(...))` — which must be done
 * on the fully-resolved result.
 *
 * Invariants (ADR-0008 / ADR-architecture-0001):
 * - **Illegal ⇒ identity.** An illegal move returns `s` itself: no movement, no
 *   interaction side effects, **no phase flip** (the flip is a consequence of a
 *   legal move only, and is never consumed by a refusal). Callers may rely on
 *   reference equality (`next === s` ⟺ illegal).
 * - **Parity.** The returned phase is `flipPhase(s.phase)` on every legal move,
 *   so the phase after n moves is a deterministic function of the move count.
 * - **Solidity** is a function of `(level, phase, doorsOpen)` only — never of
 *   history or of the player's own tile.
 * - No crush, no push, no suppression, no random relocation: a legal move ends
 *   exactly where the player moved (or where the portal placed them).
 */
export function applyMove(level: Level, s: SearchState, m: Move): SearchState {
  // ── STEP 1 — Validate Move (current phase only) ────────────────────────────
  const target = validateEntry(level, s, m);
  if (target === undefined) {
    // Illegal ⇒ identity: no movement, no side effects, no flip.
    return s;
  }

  // ── STEP 2 — Move Player ───────────────────────────────────────────────────
  let player: Vec = target;

  // ── STEP 3 — Resolve Interaction (entering tile only, current phase) ───────
  // A switch toggles only when the player ENTERS its tile while its
  // `activePhase` is current; leaving it, or standing on it in the other phase,
  // does nothing (`docs/architecture.md` §6.2).
  let switchesOn = s.switchesOn;
  const sw = switchAt(level, s.phase, player);
  if (sw) {
    switchesOn = { ...switchesOn, [sw.id]: switchesOn[sw.id] !== true };
  }
  // A portal teleports on the entering move only, once: no chaining, and
  // standing on a portal later (including when the flip activates it under the
  // player) never teleports (ADR-0008 clause 6). The landing tile triggers
  // nothing else in this move — that is what "no chains" means here.
  const portal = portalAt(level, s.phase, player);
  if (portal) {
    // NOTE (flagged, not silently decided — see OPEN QUESTIONS in the GAME-001
    // return contract): `docs/architecture.md` §6.2 step 3 says "the landing
    // tile must pass the same current-phase solidity checks as a normal move",
    // while §6.1 lists exactly two illegal conditions and §6.2's implementation
    // contract says the only failure point is step 1. This implementation takes
    // the invariant-preserving reading: the teleport is unconditional once the
    // entry move is legal, and landing inside a currently-solid tile is a legal,
    // stable state (the same class of state as ADR-0008 clause 3). Levels whose
    // portal ends are non-solid in their own `activePhase` (recommended
    // validator rule, mirroring the both-phase non-wall goal rule) behave
    // identically under either reading.
    player = portalExit(portal, player);
  }

  // ── STEP 4 — Flip Phase ────────────────────────────────────────────────────
  const phase = flipPhase(s.phase);

  // ── STEP 5 — Resolve Phase Effects (absolute recompute, no rollback) ───────
  // Doors are recomputed from `(color, new phase, switchesOn)` — never carried
  // incrementally. If the flip left the player inside a cell that is solid in
  // the new phase, that state is legal and kept: there is no retrospective
  // rollback (ADR-0008 clauses 3 / 5).
  const doorsOpen = resolveDoorsOpen(level, phase, switchesOn);

  // ── STEP 6 — Check Win ────────────────────────────────────────────────────
  // Not stored here: `SearchState` excludes `status` (§6.3). The caller checks
  // `isGoal(level, result)` on this fully-resolved state (ADR-0008 clause 7).
  return { player, phase, doorsOpen, switchesOn };
}