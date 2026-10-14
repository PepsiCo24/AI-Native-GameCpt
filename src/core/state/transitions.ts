/**
 * GameState transitions — `initialState`, the goal test and the `GameState`
 * reducer that keeps the playable state in sync with the pure rule engine.
 *
 * Truth sources: `docs/architecture.md` §5 (state model §, `GameState`),
 * §6.2 step 6 (win check), §13 (undo = snapshot stack), ADR-0008 clause 7 and
 * `docs/game-design.md` §3.1 (win = standing on the goal at the end of a
 * fully-resolved legal move, **regardless of phase**).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 *
 * There is exactly ONE movement implementation (`applyMove`, rules/). This file
 * never re-implements movement: it projects `GameState` → `SearchState`, calls
 * `applyMove`, and folds the bookkeeping (`moveCount`, `history`, `status`,
 * derived view) around the result.
 */

import type { Level } from "@/core/level";
import { applyMove } from "@/core/rules/applyMove";
import { phaseView, resolveDoorsOpen } from "@/core/rules/solid";
import type { Move } from "./move";
import type {
  GameState,
  SearchState,
  Snapshot,
  Vec,
} from "./types";

/**
 * The win test (`docs/architecture.md` §6.2 step 6).
 *
 * Player-position equality with the goal tile and **no phase term**
 * (ADR-0008 clause 7): the goal is one tile, enterable on both parities because
 * level validation guarantees it is a non-wall in both phases. Call it only on a
 * **fully resolved** post-move state (i.e. on the result of `applyMove`), never
 * on an intermediate state.
 */
export function isGoal(level: Level, s: SearchState): boolean {
  return s.player.x === level.goal[0] && s.player.y === level.goal[1];
}

/** Project the playable state down to the minimum searchable state (§6). */
export function toSearchState(s: GameState): SearchState {
  return {
    player: s.playerPosition,
    phase: s.phase,
    doorsOpen: s.levelState.doorsOpen,
    switchesOn: s.levelState.switchesOn,
  };
}

/** Undo record for the current state (`history` holds the states *before* each move). */
export function snapshotOf(s: GameState): Snapshot {
  return {
    playerPosition: s.playerPosition,
    phase: s.phase,
    doorsOpen: s.levelState.doorsOpen,
    switchesOn: s.levelState.switchesOn,
    moveCount: s.moveCount,
    status: s.status,
  };
}

function tileToVec(tile: readonly [number, number]): Vec {
  return { x: tile[0], y: tile[1] };
}

/**
 * The state at move 0: `startPhase`, every switch off, `doorsOpen` recomputed
 * absolutely for `startPhase`, empty history, `status: "playing"`.
 *
 * Both records carry an explicit entry for every object in the level, which is
 * what makes the state canonical for `hashState` (§6.3).
 */
export function initialState(level: Level): GameState {
  const switchesOn: Record<string, boolean> = {};
  for (const sw of level.switches) switchesOn[sw.id] = false;

  const phase = level.startPhase;
  const doorsOpen = resolveDoorsOpen(level, phase, switchesOn);

  return {
    levelId: level.id,
    playerPosition: tileToVec(level.player),
    phase,
    levelState: { doorsOpen, switchesOn },
    objects: phaseView(level, phase),
    moveCount: 0,
    history: [],
    status: "playing",
  };
}

/**
 * Apply one logical action to the playable state.
 *
 * - An **illegal** move returns `gs` itself (identity): no movement, no side
 *   effects, **no flip**, no `moveCount` increment, no history entry
 *   (ADR-0008 clause 1; ADR-architecture-0001 decision 3).
 * - A legal move flips the phase, bumps `moveCount`, pushes the pre-move
 *   snapshot onto `history` (the undo stack, §13) and re-derives `objects`.
 * - `status` becomes `"won"` when the fully-resolved state satisfies `isGoal`
 *   (§6.2 step 6) and **latches**: a completed level accepts no further moves
 *   (post-win input locking is Gameplay's job; refusing here keeps the counter
 *   and history honest).
 *
 * This is a `GameState`-level bookkeeping decision, not a movement rule: the
 * rule functions (`isLegalMove` / `applyMove`) remain pure and unaware of
 * `moveCount` / `status`, which is what keeps the Solver and the game on one
 * truth source.
 */
export function applyMoveToGameState(
  level: Level,
  gs: GameState,
  m: Move,
): GameState {
  if (gs.status === "won") return gs;

  const search = toSearchState(gs);
  const next = applyMove(level, search, m);

  // `applyMove` returns its input reference for an illegal move ⇒ illegal ⇒ identity.
  if (next === search) return gs;

  return {
    levelId: gs.levelId,
    playerPosition: next.player,
    phase: next.phase,
    levelState: { doorsOpen: next.doorsOpen, switchesOn: next.switchesOn },
    objects: phaseView(level, next.phase),
    moveCount: gs.moveCount + 1,
    history: [...gs.history, snapshotOf(gs)],
    status: isGoal(level, next) ? "won" : "playing",
  };
}