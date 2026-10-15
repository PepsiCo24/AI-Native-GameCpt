/**
 * QA test helpers — thin **wrappers over the production solver**
 * (`@/core/solver/bfs`, SOLVER-001) plus two genuinely test-only predicates.
 *
 * ── WHY THIS FILE NO LONGER CONTAINS A SEARCH (QA-002) ───────────────────────
 * Until QA-002 this file carried its own BFS ("the smallest correct BFS") because
 * `src/core/solver/**` did not exist yet. That was a **second truth source**: the
 * GATE D board invariants and the dataset gate were then proven against a test
 * search instead of against the program of record. `src/core/solver/bfs.ts` has
 * shipped, so the duplication is deleted here.
 *
 * Every search-shaped export below is now a projection of the solver:
 *
 *   reachableStates      → `explore(level).nodes` keyed by `hashState`
 *   deadStates           → `analyse(level, graph).deadStateList`
 *   shortestSolution     → `solve(level).shortestSolution`
 *   dualPhaseTiles       → `dualPhaseTiles(graph)` (production metric)
 *   legalMoves           → `isLegalMove` (`@/core/rules`) — the same predicate the
 *                          solver's edge loop calls; no search at all
 *   phaseFormulaViolations → a test-only assertion predicate over the solver's
 *                          reachable node set (the parity formula is a *design*
 *                          claim, not a §8 metric, so it has no production home)
 *
 * The solver itself calls the production `isLegalMove` / `applyMove` (one truth
 * source, AGENTS.md §3), so everything reachable from here is the shipped rule.
 *
 * Pure data in / pure data out: no DOM, no Phaser (`tests/**` runs under the
 * default `node` environment).
 */

import type { Level } from "@/core/level";
import { isLegalMove } from "@/core/rules";
import {
  analyse,
  dualPhaseTiles as solverDualPhaseTiles,
  explore,
  solve,
} from "@/core/solver/bfs";
import { hashState } from "@/core/state/hash";
import type { Move } from "@/core/state/move";
import { DIRECTIONS, move } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import type { SearchState } from "@/core/state/types";

/** Four canonical directions, as `Move` values (solver direction order). */
export const ALL_MOVES: readonly Move[] = DIRECTIONS.map((dir) => move(dir));

/**
 * The full reachable `SearchState` graph from the level start, keyed by
 * `hashState` — the solver's node set, re-keyed for callers that want a map.
 * Embedded states (player inside a current-phase-solid cell) are ordinary nodes,
 * exactly as `docs/architecture.md` §6.3 requires.
 */
export function reachableStates(level: Level): Map<string, SearchState> {
  const graph = explore(level);
  const out = new Map<string, SearchState>();
  for (const node of graph.nodes) out.set(hashState(node), node);
  return out;
}

/** All legal moves from one state (never mutates the state) — the shipped predicate, filtered. */
export function legalMoves(level: Level, s: SearchState): Move[] {
  return ALL_MOVES.filter((m) => isLegalMove(level, s, m));
}

/**
 * Shortest solution length in moves, or `null` if the goal is unreachable —
 * read straight off the production solver (`docs/architecture.md` §8: BFS, unit
 * edge cost).
 */
export function shortestSolution(level: Level): number | null {
  return solve(level).shortestSolution;
}

/**
 * `docs/level-design.md` §4 fail condition: a reachable non-goal state with
 * **zero legal moves** is unrecoverable by construction. Returned as states (the
 * solver reports hashes), reconstructed from the same graph — no second search,
 * no second deadness rule.
 */
export function deadStates(level: Level): SearchState[] {
  const graph = explore(level);
  const result = analyse(level, graph);
  const byHash = new Map<string, SearchState>();
  for (const node of graph.nodes) byHash.set(hashState(node), node);
  const out: SearchState[] = [];
  for (const hash of result.deadStateList) {
    const node = byHash.get(hash);
    if (node !== undefined) out.push(node);
  }
  return out;
}

/**
 * Tiles reachable in more than one phase (GATE D / ADR-0009: M0 and M1-alone
 * content ⇒ must be 0), with the phases observed at each tile. The tile list is
 * the production metric (`dualPhaseTiles`); only the per-tile phase detail is
 * assembled here from the same node set.
 */
export function dualPhaseTiles(
  level: Level,
): Array<{ tile: string; phases: Phase[] }> {
  const graph = explore(level);
  const phasesByTile = new Map<string, Set<Phase>>();
  for (const node of graph.nodes) {
    const key = `${node.player.x},${node.player.y}`;
    const phases = phasesByTile.get(key) ?? new Set<Phase>();
    phases.add(node.phase);
    phasesByTile.set(key, phases);
  }
  const out: Array<{ tile: string; phases: Phase[] }> = [];
  for (const tile of solverDualPhaseTiles(graph)) {
    out.push({ tile, phases: [...(phasesByTile.get(tile) ?? [])].sort() });
  }
  return out;
}

/**
 * The **GATE D parity theorem** as an executable predicate
 * (`src/levels/README.md` §3, F1 + F2):
 *
 *   phase(reachable at tile c) === startPhase XOR (parity(c) XOR parity(start))
 *
 * i.e. with no portal (or only same-colour portal ends) the arrival phase is a
 * function of the tile's chessboard parity — the phase is *not* free. Returns
 * every solver node that breaks the formula (empty ⇒ invariant holds).
 *
 * Test-only by design: it is a design-law assertion, not one of the §8 metrics
 * the solver is required to report.
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