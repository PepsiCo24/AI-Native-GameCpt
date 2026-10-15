/**
 * The `docs/level-difficulty.md` §2 difficulty model, computed **from the shipped
 * solver's graph** — never from a model's opinion, never from board size.
 *
 *     D = w1·L + w2·B + w3·T + w4·R + w5·M
 *
 * ── WHY THIS IS ITS OWN MODULE ───────────────────────────────────────────────
 * The §2 weights are an explicit **hypothesis** ("V0.1 — NOT final … replaced by
 * regression against real playtest data"). Freezing them into the §8
 * `SolveResult` contract would make a playtest-driven re-calibration a change to
 * the solver's published interface, so the breakdown lives here with the weights in
 * one named constant: {@link DIFFICULTY_WEIGHTS}. Re-calibrating = one edit here
 * plus the §2 table in the doc, and *nothing* else in the codebase moves. The
 * module reads `ReachableGraph` **as a type only**, so there is no runtime cycle
 * with `bfs.ts` (`policy.ts` imports both).
 *
 * ── THE FIVE TERMS, AS IMPLEMENTED (each one pinned in §2/§5.1 of the doc) ────
 * - `L` = the solver's shortest solution length (`null` on an unsolvable board).
 * - `B` = **effective** branching factor: mean over the reachable states of the
 *   number of legal moves whose successor attains the *minimum* remaining distance
 *   to a goal state ("legal, non-dominated moves"). The distance is an **exact**
 *   reverse-BFS (unit edge cost), not a Manhattan estimate, so state-dependent
 *   geometry (walls, doors, portals) is included by construction. §2's `B_raw`
 *   (plain average out-degree) is reported as a diagnostic and is **not** the `B`
 *   of `D`; a state whose successors are all goal-unreachable ties every move at
 *   `∞` and therefore counts its whole out-degree, a degenerate case that can only
 *   occur outside the §4 acceptance region.
 * - `T` = required lookahead depth, read **literally**: the greatest depth of a
 *   reachable state that has a legal move into a goal-unreachable state ("an
 *   alternative leads to dead-end", §5.1's "the depth at which an alternative
 *   becomes unrecoverable"). Consequence, stated rather than hidden: `T ≡ 0` for
 *   every level that satisfies `docs/level-design.md` §4 (`noUnrecoverableOk`), so
 *   inside the acceptance region `w3·T` can never contribute. The *other* reading
 *   of "required lookahead depth" — the deepest state from which some legal move
 *   can no longer still finish within `L` moves — is reported as
 *   {@link DifficultyBreakdown.lookaheadDepth},
 *   a **diagnostic with no weight**, so a re-worded §2 has a measured number to
 *   adopt instead of a new definition invented to make a curve look nice.
 * - `R` = dead-end ratio: reachable non-goal states with zero legal out-edges
 *   (`docs/level-design.md` §4's dead states) ÷ reachable states. The
 *   goal-unreachability ratio is reported separately as
 *   {@link DifficultyBreakdown.unrecoverableRatio} — §5.1 calls both of them
 *   "unrecoverable", and only the first is a *dead end*.
 * - `M` = simultaneously enabled mechanics = `1 + [doors non-empty] + [switches
 *   non-empty] + [portals non-empty]` (§5.1's count; the base term is the phase
 *   flip itself, and a *category* counts once however many objects it contains).
 *
 * ── WHAT THIS MODULE DOES NOT DO ─────────────────────────────────────────────
 * It does not gate anything, it does not order levels, and it does not tune itself
 * against the §3 target curve. `D` is a *measurement*: the curve fit is the Game
 * Designer's job and the weights belong to playtest data (PA-004 onward). Where the
 * measured curve contradicts §3, the contradiction is reported as-is — see the
 * L5→L6 seam recorded in §5.1 of the doc.
 */

import type { Level } from "@/core/level";
import { isGoal } from "@/core/state/transitions";
import type { SearchState } from "@/core/state/types";
import type { ReachableGraph } from "./bfs";

/**
 * §2's provisional weights (V0.1). **A hypothesis, not a finding**: "they will be
 * replaced by regression against real playtest data (Mistake Rate, Retry Rate,
 * First Win Time)". Kept in one constant so a re-calibration is a single edit, and
 * echoed into every {@link DifficultyBreakdown} so a stored number can never be
 * read against the wrong weights.
 */
export const DIFFICULTY_WEIGHTS = {
  L: 1,
  B: 3,
  T: 4,
  R: 2,
  M: 5,
} as const;

/** The §2 weight vector, keyed by the formula's symbols. */
export type DifficultyWeights = typeof DIFFICULTY_WEIGHTS;

/** One level's §2 breakdown: the five weighted terms, plus the diagnostics. */
export interface DifficultyBreakdown {
  readonly levelId: number;
  /** `L` — shortest solution length, `null` iff the board is unsolvable. */
  readonly L: number | null;
  /** `B` — effective (non-dominated) branching factor, mean over reachable states. */
  readonly B: number;
  /** `T` — literal required-lookahead depth (see the module doc: `≡ 0` under §4). */
  readonly T: number;
  /** `R` — dead-end ratio (dead states ÷ reachable states). */
  readonly R: number;
  /** `M` — simultaneously enabled mechanics. */
  readonly M: number;
  /** The weighted sum, or `null` when `L` is unknown (no solution ⇒ no curve spot). */
  readonly D: number | null;
  /** The weights this breakdown was computed with. */
  readonly weights: DifficultyWeights;
  // ── diagnostics (§2: "computed but treated as diagnostics, not primary score") ──
  /** `B_raw` — plain mean legal out-degree. **Not** the `B` of `D` (§5.1). */
  readonly bRaw: number;
  /** Share of reachable states with exactly one legal move ("fake hard" detector). */
  readonly forcedMoveRatio: number;
  /** The other reading of `T`: deepest state whose move budget cannot always finish `L`. */
  readonly lookaheadDepth: number;
  /** Goal-unreachable states ÷ reachable states (companion of `R`, not `R`). */
  readonly unrecoverableRatio: number;
  readonly reachableStates: number;
}

/**
 * `M` — simultaneously enabled mechanics (§5.1): the phase flip plus one point per
 * **non-empty** mechanic category. A category counts once however many objects it
 * holds, so "M3" always means "walls + doors + switches" and never "three doors".
 */
export function mechanicsCount(level: Level): number {
  return (
    1 +
    (level.doors.length > 0 ? 1 : 0) +
    (level.switches.length > 0 ? 1 : 0) +
    (level.portals.length > 0 ? 1 : 0)
  );
}

/** Exact distance to the nearest goal state (reverse BFS); `∞` when unreachable. */
function goalDistances(level: Level, graph: ReachableGraph): number[] {
  const nodeCount = graph.nodes.length;
  const distance = new Array<number>(nodeCount).fill(Number.POSITIVE_INFINITY);
  const queue: number[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    if (!isGoal(level, graph.nodes[i] as SearchState)) continue;
    distance[i] = 0;
    queue.push(i);
  }
  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head] as number;
    for (const previous of graph.edgesIn[node] as readonly number[]) {
      if (distance[previous] !== Number.POSITIVE_INFINITY) continue;
      distance[previous] = (distance[node] as number) + 1;
      queue.push(previous);
    }
  }
  return distance;
}

/**
 * The §2 breakdown of one board. `graph` must be `explore(level)` (or a graph the
 * caller already explored) — the function never searches again, so the number it
 * reports is the same graph the solvability proof used.
 */
export function analyseDifficulty(
  level: Level,
  graph: ReachableGraph,
): DifficultyBreakdown {
  const nodeCount = graph.nodes.length;
  const distance = goalDistances(level, graph);

  let shortest: number | null = null;
  let sumEffective = 0;
  let sumOutDegree = 0;
  let forcedMoves = 0;
  let deadStates = 0;
  let reachableToGoal = 0;

  for (let i = 0; i < nodeCount; i += 1) {
    const state = graph.nodes[i] as SearchState;
    const out = graph.edgesOut[i] as readonly number[];
    const depth = graph.depths[i] ?? 0;
    const goal = isGoal(level, state);

    if (goal && (shortest === null || depth < shortest)) shortest = depth;
    if (distance[i] !== Number.POSITIVE_INFINITY) reachableToGoal += 1;
    if (!goal && out.length === 0) deadStates += 1;

    sumOutDegree += out.length;
    if (out.length === 1) forcedMoves += 1;
    if (out.length === 0) continue;

    // §2's "non-dominated": a legal move that is at least as good as the best one
    // available (ties count — two equally short continuations are two real choices).
    let best = Number.POSITIVE_INFINITY;
    for (const next of out) {
      const d = distance[next] as number;
      if (d < best) best = d;
    }
    let effective = 0;
    for (const next of out) if (distance[next] === best) effective += 1;
    sumEffective += effective;
  }

  // `T` (literal): deepest state with a legal move into a goal-unreachable state.
  let requiredLookahead = 0;
  for (let i = 0; i < nodeCount; i += 1) {
    for (const next of graph.edgesOut[i] as readonly number[]) {
      if (distance[next] !== Number.POSITIVE_INFINITY) continue;
      const depth = graph.depths[i] ?? 0;
      if (depth > requiredLookahead) requiredLookahead = depth;
      break;
    }
  }

  const B = nodeCount === 0 ? 0 : sumEffective / nodeCount;
  const R = nodeCount === 0 ? 0 : deadStates / nodeCount;
  const M = mechanicsCount(level);
  const D =
    shortest === null
      ? null
      : DIFFICULTY_WEIGHTS.L * shortest +
        DIFFICULTY_WEIGHTS.B * B +
        DIFFICULTY_WEIGHTS.T * requiredLookahead +
        DIFFICULTY_WEIGHTS.R * R +
        DIFFICULTY_WEIGHTS.M * M;

  return {
    levelId: level.id,
    L: shortest,
    B,
    T: requiredLookahead,
    R,
    M,
    D,
    weights: DIFFICULTY_WEIGHTS,
    bRaw: nodeCount === 0 ? 0 : sumOutDegree / nodeCount,
    forcedMoveRatio: nodeCount === 0 ? 0 : forcedMoves / nodeCount,
    lookaheadDepth: lookaheadDepth(level, graph, shortest),
    unrecoverableRatio:
      nodeCount === 0 ? 0 : (nodeCount - reachableToGoal) / nodeCount,
    reachableStates: nodeCount,
  };
}

/**
 * The **other** reading of `T` (§2's "required lookahead depth"), reported as a
 * diagnostic: the greatest depth of a reachable state from which (a) the goal is
 * still reached in exactly `shortest − depth` moves — so the state lies on a
 * completable prefix of a shortest route — and (b) some legal move cannot still
 * finish within that same budget. In words: *how deep the player has to notice that
 * a move burns the par*. `0` when every legal move from every completable prefix
 * still finishes (the shipped L1–L5 corridor shape), `null`-free by design, and
 * `0` as well when the board is unsolvable (`shortest === null`).
 *
 * It carries **no weight**: §2's `T` is pinned to unrecoverability, and this module
 * never silently substitutes one definition for the other.
 */
function lookaheadDepth(
  level: Level,
  graph: ReachableGraph,
  shortest: number | null,
): number {
  if (shortest === null || graph.nodes.length === 0) return 0;

  // `finishable[k][i]` = "a goal is reachable from state i in exactly k moves".
  const finishable: Uint8Array[] = [];
  for (let k = 0; k <= shortest; k += 1) {
    finishable.push(new Uint8Array(graph.nodes.length));
  }
  for (let i = 0; i < graph.nodes.length; i += 1) {
    if (isGoal(level, graph.nodes[i] as SearchState))
      (finishable[0] as Uint8Array)[i] = 1;
  }
  for (let k = 1; k <= shortest; k += 1) {
    const previous = finishable[k - 1] as Uint8Array;
    const current = finishable[k] as Uint8Array;
    for (let i = 0; i < graph.nodes.length; i += 1) {
      for (const next of graph.edgesOut[i] as readonly number[]) {
        if (previous[next] !== 1) continue;
        current[i] = 1;
        break;
      }
    }
  }

  let deepest = 0;
  for (let i = 0; i < graph.nodes.length; i += 1) {
    // A goal state is where the level *ends*: it never has to "finish", so counting
    // it would pin this diagnostic to `L` whenever the goal has a legal move out.
    if (isGoal(level, graph.nodes[i] as SearchState)) continue;
    const depth = graph.depths[i] ?? 0;
    if (depth > shortest) continue;
    if ((finishable[shortest - depth] as Uint8Array)[i] !== 1) continue;
    const remaining = shortest - depth;
    for (const next of graph.edgesOut[i] as readonly number[]) {
      if (remaining >= 1 && (finishable[remaining - 1] as Uint8Array)[next] === 1)
        continue;
      if (depth > deepest) deepest = depth;
      break;
    }
  }
  return deepest;
}