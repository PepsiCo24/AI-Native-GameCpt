/**
 * QA test helpers — the *smallest correct* BFS over the locked rule engine.
 *
 * ⚠ These helpers deliberately call the production `applyMove` / `isLegalMove`
 * (`@/core/rules`) and `initialState` (`@/core/state`). AGENTS.md §3: one truth
 * source — a test must never re-implement the movement rule, or it would prove
 * only that the test agrees with itself.
 *
 * REFACTOR DEBT (flagged, tracked): SOLVER-001 will eventually own BFS +
 * difficulty metrics under `src/core/solver/**` (`docs/architecture.md` §8,
 * `docs/ai-native-pipeline.md`). That module does not exist yet, so QA keeps the
 * minimal reachability search here to make the GATE D board invariants and the
 * dataset gates executable today. When the solver lands, this file should
 * re-point at it instead of growing a second implementation.
 *
 * Pure data in / pure data out: no DOM, no Phaser (`tests/**` runs under the
 * default `node` environment).
 */

import type { Level } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import { hashState } from "@/core/state/hash";
import type { Move } from "@/core/state/move";
import { DIRECTIONS, move } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { initialState, isGoal, toSearchState } from "@/core/state/transitions";
import type { SearchState } from "@/core/state/types";

/** Four canonical directions, as `Move` values. */
export const ALL_MOVES: readonly Move[] = DIRECTIONS.map((dir) => move(dir));

/** Guard against a runaway search — a level this large is already a bug. */
const MAX_STATES = 2_000_000;

/**
 * The full reachable `SearchState` graph from the level start, keyed by
 * `hashState`. Embedded states (player inside a current-phase-solid cell) are
 * ordinary nodes here, exactly as `docs/architecture.md` §6.3 requires.
 */
export function reachableStates(level: Level): Map<string, SearchState> {
  const start = toSearchState(initialState(level));
  const seen = new Map<string, SearchState>();
  seen.set(hashState(start), start);

  const queue: SearchState[] = [start];
  for (let i = 0; i < queue.length; i += 1) {
    const state = queue[i] as SearchState;
    for (const m of ALL_MOVES) {
      // Reference equality is the documented illegal-move contract (applyMove
      // returns its input for an illegal move). isLegalMove is the derived
      // predicate; the property suite pins the two together.
      if (!isLegalMove(level, state, m)) continue;
      const next = applyMove(level, state, m);
      const h = hashState(next);
      if (seen.has(h)) continue;
      seen.set(h, next);
      queue.push(next);
    }
    if (seen.size > MAX_STATES) {
      throw new Error(`state explosion (>${MAX_STATES}) in level ${level.id}`);
    }
  }
  return seen;
}

/** All legal moves from one state (never mutates the state). */
export function legalMoves(level: Level, s: SearchState): Move[] {
  return ALL_MOVES.filter((m) => isLegalMove(level, s, m));
}

/**
 * Shortest solution length in moves, or `null` if the goal is unreachable.
 * BFS is the mandated algorithm (`docs/architecture.md` §8) — unit edge cost,
 * so the first time the goal is generated is the shortest solution.
 */
export function shortestSolution(level: Level): number | null {
  const start = toSearchState(initialState(level));
  if (isGoal(level, start)) return 0;

  const seen = new Set<string>([hashState(start)]);
  let frontier: SearchState[] = [start];
  let depth = 0;

  while (frontier.length > 0) {
    depth += 1;
    const next: SearchState[] = [];
    for (const state of frontier) {
      for (const m of ALL_MOVES) {
        const ns = applyMove(level, state, m);
        if (ns === state) continue;
        if (isGoal(level, ns)) return depth;
        const h = hashState(ns);
        if (!seen.has(h)) {
          seen.add(h);
          next.push(ns);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * `docs/level-design.md` §4 fail condition: a reachable non-goal state with
 * **zero legal moves** is unrecoverable by construction. (There is no waiting
 * and no manual flip — the phase only changes when you move.)
 */
export function deadStates(level: Level): SearchState[] {
  const out: SearchState[] = [];
  for (const state of reachableStates(level).values()) {
    if (isGoal(level, state)) continue;
    if (legalMoves(level, state).length === 0) out.push(state);
  }
  return out;
}

/** Tiles that are reachable in more than one phase (GATE D: M0 ⇒ must be 0). */
export function dualPhaseTiles(level: Level): Array<{ tile: string; phases: Phase[] }> {
  const byTile = new Map<string, Set<Phase>>();
  for (const state of reachableStates(level).values()) {
    const key = tileKey(state.player.x, state.player.y);
    const set = byTile.get(key) ?? new Set<Phase>();
    set.add(state.phase);
    byTile.set(key, set);
  }
  const out: Array<{ tile: string; phases: Phase[] }> = [];
  for (const [tile, phases] of byTile) {
    if (phases.size > 1) out.push({ tile, phases: [...phases].sort() });
  }
  return out.sort((a, b) => a.tile.localeCompare(b.tile));
}

/**
 * The **GATE D parity theorem** as an executable predicate
 * (`src/levels/README.md` §3, F1 + F2):
 *
 *   phase(reachable at tile c) === startPhase XOR (parity(c) XOR parity(start))
 *
 * i.e. with no portal (or only same-colour portal ends) the arrival phase is a
 * function of the tile's chessboard parity — the phase is *not* free. Returns
 * every state that breaks the formula (empty ⇒ invariant holds).
 */
export function phaseFormulaViolations(level: Level): SearchState[] {
  const startParity = (level.player[0] + level.player[1]) & 1;
  const startCode = level.startPhase === "A" ? 0 : 1;
  const out: SearchState[] = [];
  for (const state of reachableStates(level).values()) {
    const parity = (state.player.x + state.player.y) & 1;
    const expected = startCode ^ (parity ^ startParity);
    const actual = state.phase === "A" ? 0 : 1;
    if (expected !== actual) out.push(state);
  }
  return out;
}

export function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Deterministic `mulberry32` PRNG — random-looking level boards with a fixed
 * seed, so a failing invariant is always reproducible (no flaky CI).
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}