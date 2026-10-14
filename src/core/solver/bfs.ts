/**
 * `src/core/solver/bfs.ts` — the mandated solver (SOLVER-001, Level AI + Solver).
 *
 * Truth sources: `docs/architecture.md` §8 (BFS only until profiled; required
 * decidable metrics), §6.3 (hash contract / finiteness), §5 (state model);
 * `docs/level-design.md` §4 (no unrecoverable state); ADR-0008 rules 1–7;
 * ADR-0009 (checkerboard invariant + the two required dynamism metrics);
 * ADR-architecture-0001 (solver depends on core only).
 *
 * ── WHAT THIS FILE IS ALLOWED TO DO (hard budget, AGENTS.md §3) ──────────────
 * - Pure TypeScript: never imports Phaser, never imports `src/game/**`.
 * - **Movement is never re-implemented here.** `isLegalMove` / `applyMove` from
 *   `@/core/rules` are the only rule functions called; `hashState` from
 *   `@/core/state/hash` is the only state key; `initialState` / `isGoal`
 *   (`@/core/state/transitions`) are the only state constructors/predicates.
 *   Gameplay and the Solver therefore run the *same* rule function (one truth
 *   source).
 * - `@/core/level` is imported **type-only** (`import type { Level }`): the
 *   level layer is a data layer and this module must not depend on its code.
 *   The JSON/validation side lives in `scripts/**` (also Level AI + Solver).
 * - No second "is the tile under me solid?" check exists anywhere in this file:
 *   an embedded state (player standing inside a current-phase-solid cell) is an
 *   ordinary search node (ADR-0008 clause 3, `docs/architecture.md` §6.3).
 *
 * ── THE SEARCH (why it is finite and why it is optimal) ──────────────────────
 * A node is `SearchState` (`player`, `phase`, `doorsOpen`, `switchesOn`) and the
 * visited-set key is `hashState` — so the visited set covers exactly the state,
 * including the dynamic object state (`doorsOpen` / `switchesOn`), never just the
 * position. Out-edges are the four legal `MOVE(dir)` actions; an illegal move
 * contributes no edge and never flips the phase (`applyMove` returns its input).
 * Edges have unit cost, so plain BFS yields the true shortest solution, and the
 * reachable set is bounded by `width × height × 2 × 2^|doors| × 2^|switches|`
 * (`docs/architecture.md` §6.3).
 *
 * ── METRIC DEFINITIONS (pinned, so nothing here is open to re-reading) ───────
 * Throughout, the **clicked tile** of a move is `state.player + dirDelta` —
 * the tile the tap/swipe would step onto. A portal may move the player further
 * (the *landing* tile); the landing is a different tile and is only counted when
 * it is itself clicked from an adjacent state. This is deliberate: the metric is
 * about *entry refusal*, and refusal is decided on the clicked tile only
 * (`applyMove` step 1).
 *
 * - `reachableStates` — number of `SearchState` nodes reachable from the start.
 * - `distinctPositions` — distinct `(x, y)` player positions across those nodes.
 * - `dualPhaseTiles` — tiles that occur as a player position in **both** phases
 *   over the reachable set. Only an opposite-checkerboard-colour portal pair can
 *   produce one (ADR-0009; a teleport changes position without spending a move,
 *   so it decouples phase from step parity). `0` ⇒ **mechanically static** board
 *   (a pure timing-gate maze) and must be flagged for difficulty review.
 * - `refusedThenEnteredTiles` — clicked tiles whose click was **refused** (no
 *   movement, no flip) in at least one reachable state **and accepted** (a legal
 *   move) in at least one other reachable state. This is the history-dependence
 *   measure: on M0-only and M1-without-switches boards it is provably `0`
 *   (arrival phase is a function of the tile, ADR-0009), so `> 0` requires
 *   latched switch state or a parity-breaking portal.
 * - `deadStates` — reachable non-goal states with **zero** legal out-edges
 *   (unrecoverable: there is no wait and no manual flip, `docs/level-design.md`
 *   §4). Their hashes are listed so a failure is reproducible.
 * - `noUnrecoverableOk` — the `docs/level-design.md` §4 invariant: from **every**
 *   reachable state the goal is still reachable. Computed exactly (reverse
 *   reachability from the goal states over the reachable graph), not sampled.
 */

import type { Level } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import { hashState } from "@/core/state/hash";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, move, step } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { initialState, isGoal, toSearchState } from "@/core/state/transitions";
import type { SearchState, Vec } from "@/core/state/types";

/**
 * Absolute safety cap on the number of explored states. A level that reaches it
 * is a bug (or an authoring mistake), not a level: `docs/ui-ux.md` R-L2 caps the
 * grid at 7 × 7 and the state bound of §6.3 keeps real levels far below this.
 */
export const SOLVER_HARD_STATE_CAP = 2_000_000;

/** Raised instead of silently reporting partial metrics on a state explosion. */
export class StateSpaceExplosionError extends Error {
  constructor(level: Level, budget: number) {
    super(
      `state space for level ${level.id} exceeded the solver budget (${budget} states) — ` +
        `refusing to report partial reachability/solvability metrics`,
    );
    this.name = "StateSpaceExplosionError";
  }
}

export interface SolverOptions {
  /** Overrides the default budget (`stateSpaceBound(level)`). Never silently ignored. */
  readonly maxStates?: number;
}

/**
 * The §6.3 finiteness bound `width × height × 2 × 2^(doors+switches)`, clamped to
 * {@link SOLVER_HARD_STATE_CAP}. Portal ends are static per level and contribute
 * no state bits, so they do not enter the bound.
 */
export function stateSpaceBound(level: Level): number {
  // `2 ** 60` is already beyond any playable level; clamping the exponent keeps
  // the arithmetic exact instead of overflowing into Infinity.
  const objectBits = Math.min(level.doors.length + level.switches.length, 30);
  const bound = level.width * level.height * 2 * 2 ** objectBits;
  return Math.min(bound, SOLVER_HARD_STATE_CAP);
}

/** Canonical tile key `"x,y"` (the level layer's `coordKey`/`Vec` bridge, local to the solver). */
export function tileKey(p: Vec): string {
  return `${p.x},${p.y}`;
}

/**
 * The reachable `SearchState` graph, in BFS discovery order.
 *
 * Kept separate from {@link solve} so callers that need *the graph* (traces,
 * audit tooling, later difficulty metrics) do not re-implement the search.
 */
export interface ReachableGraph {
  /** Nodes in BFS order; `nodes[0]` is the start. */
  readonly nodes: readonly SearchState[];
  /** `depths[i]` = BFS depth (shortest legal-move count) of `nodes[i]`. */
  readonly depths: readonly number[];
  /** Parent node index, `-1` for the start. */
  readonly parentIndex: readonly number[];
  /** Direction taken from the parent, `null` for the start. */
  readonly parentDirection: readonly (Direction | null)[];
  /** Bit `d` of `legalMask[i]` is set iff `MOVE(DIRECTIONS[d])` is legal from `nodes[i]`. */
  readonly legalMask: readonly number[];
  /** Successor node indices per node (multigraph-safe: one entry per legal move). */
  readonly edgesOut: readonly (readonly number[])[];
  /** Predecessor node indices per node. */
  readonly edgesIn: readonly (readonly number[])[];
  /** The budget actually applied; `stateSpaceBound(level)` unless overridden. */
  readonly stateBudget: number;
}

/**
 * Breadth-first exploration of every state reachable from `initial`
 * (default: the level's `initialState` projected to `SearchState`).
 *
 * Goal states are expanded like any other node: under `SearchState` there is no
 * win latch (`applyMoveToGameState` holds that latch, `docs/architecture.md`
 * §6.2 M-4), so the reachable set — and therefore every metric below — is the
 * complete one.
 */
export function explore(
  level: Level,
  initial?: SearchState,
  options: SolverOptions = {},
): ReachableGraph {
  const start = initial ?? toSearchState(initialState(level));
  const stateBudget = options.maxStates ?? stateSpaceBound(level);

  const nodes: SearchState[] = [];
  const depths: number[] = [];
  const parentIndex: number[] = [];
  const parentDirection: Array<Direction | null> = [];
  const legalMask: number[] = [];
  const edgesOut: number[][] = [];
  const edgesIn: number[][] = [];
  const indexOf = new Map<string, number>();

  const addNode = (
    s: SearchState,
    depth: number,
    parent: number,
    dir: Direction | null,
  ): number => {
    const i = nodes.length;
    nodes.push(s);
    depths.push(depth);
    parentIndex.push(parent);
    parentDirection.push(dir);
    legalMask.push(0);
    edgesOut.push([]);
    edgesIn.push([]);
    indexOf.set(hashState(s), i);
    return i;
  };

  addNode(start, 0, -1, null);

  for (let i = 0; i < nodes.length; i += 1) {
    const state = nodes[i] as SearchState;
    const out = edgesOut[i] as number[];
    let mask = 0;

    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const dir = DIRECTIONS[d] as Direction;
      const action = move(dir);
      // The shipped rule decides legality; nothing here re-implements it.
      if (!isLegalMove(level, state, action)) continue;
      mask |= 1 << d;

      const next = applyMove(level, state, action);
      const key = hashState(next);
      let j = indexOf.get(key);
      if (j === undefined) {
        if (nodes.length >= stateBudget)
          throw new StateSpaceExplosionError(level, stateBudget);
        j = addNode(next, (depths[i] as number) + 1, i, dir);
      }
      out.push(j);
      (edgesIn[j] as number[]).push(i);
    }

    legalMask[i] = mask;
  }

  return {
    nodes,
    depths,
    parentIndex,
    parentDirection,
    legalMask,
    edgesOut,
    edgesIn,
    stateBudget,
  };
}

/** The shortest legal-move sequence from the start to `nodeIndex` (empty for the start). */
export function movePath(
  graph: ReachableGraph,
  nodeIndex: number,
): readonly Direction[] {
  const reversed: Direction[] = [];
  let i = nodeIndex;
  while (i > 0) {
    const dir = graph.parentDirection[i];
    if (dir === undefined || dir === null) break;
    reversed.push(dir);
    i = graph.parentIndex[i] ?? -1;
  }
  return reversed.reverse();
}

/** One clicked tile's observation record, aggregated over the whole reachable set. */
export interface ClickRecord {
  /** The click was refused in at least one reachable state (no movement, no flip). */
  readonly refused: boolean;
  /** The click was accepted in at least one reachable state (a legal move). */
  readonly accepted: boolean;
}

/**
 * Every tile that is *ever clicked* from a reachable state, with the observed
 * outcomes. Out-of-bounds clicked tiles are recorded too (they can only ever be
 * refused, so they can never appear in `refusedThenEnteredTiles`).
 *
 * Derived from the graph alone — no rule call, no second legality path: bit `d`
 * of `legalMask[i]` already *is* `isLegalMove` for `MOVE(DIRECTIONS[d])`.
 */
export function clickLedger(
  graph: ReachableGraph,
): ReadonlyMap<string, ClickRecord> {
  const ledger = new Map<string, ClickRecord>();
  const note = (key: string, accepted: boolean): void => {
    const previous = ledger.get(key);
    ledger.set(key, {
      refused: (previous?.refused ?? false) || !accepted,
      accepted: (previous?.accepted ?? false) || accepted,
    });
  };

  for (let i = 0; i < graph.nodes.length; i += 1) {
    const state = graph.nodes[i] as SearchState;
    const mask = graph.legalMask[i] ?? 0;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const clicked = step(state.player, DIRECTIONS[d] as Direction);
      note(tileKey(clicked), (mask & (1 << d)) !== 0);
    }
  }

  return ledger;
}

/** Tiles stamped `illegal in some reachable state, legal in another` (sorted). */
export function refusedThenEnteredTiles(
  graph: ReachableGraph,
): readonly string[] {
  const out: string[] = [];
  for (const [key, record] of clickLedger(graph)) {
    if (record.refused && record.accepted) out.push(key);
  }
  return out.sort();
}

/** Tiles visited in more than one phase over the reachable set (sorted). */
export function dualPhaseTiles(graph: ReachableGraph): readonly string[] {
  const phasesByTile = new Map<string, Set<Phase>>();
  for (const state of graph.nodes) {
    const key = tileKey(state.player);
    const phases = phasesByTile.get(key) ?? new Set<Phase>();
    phases.add(state.phase);
    phasesByTile.set(key, phases);
  }
  const out: string[] = [];
  for (const [key, phases] of phasesByTile) {
    if (phases.size > 1) out.push(key);
  }
  return out.sort();
}

/** The per-level solver report consumed by `scripts/solve-levels.ts` (§8). */
export interface SolveResult {
  readonly levelId: number;
  /** `true` iff a goal state is reachable from the start. */
  readonly solvable: boolean;
  /** Shortest legal-move count, or `null` when unsolvable. */
  readonly shortestSolution: number | null;
  readonly reachableStates: number;
  readonly distinctPositions: number;
  /** §8 required metric — `0` ⇒ mechanically static board (flag for review). */
  readonly dualPhaseTiles: number;
  readonly dualPhaseTileList: readonly string[];
  /** §8 required metric — history-dependence of entry refusals. */
  readonly refusedThenEnteredTiles: number;
  readonly refusedThenEnteredTileList: readonly string[];
  readonly deadStates: number;
  /** `hashState` of each dead state, for reproduction. */
  readonly deadStateList: readonly string[];
  /** `docs/level-design.md` §4: goal reachable from **every** reachable state. */
  readonly noUnrecoverableOk: boolean;
  readonly unrecoverableStates: number;
  readonly maxDepth: number;
  /** §6.3 bound actually applied; `reachableStates` must stay below it. */
  readonly stateBudget: number;
}

/**
 * Compute every §8 metric from an already-explored graph. `solve` is
 * `analyse ∘ explore`; exposing the split keeps a caller that needs the graph
 * (traces, audit tooling) from running the search twice.
 */
export function analyse(level: Level, graph: ReachableGraph): SolveResult {
  const nodeCount = graph.nodes.length;

  let shortestSolution: number | null = null;
  let maxDepth = 0;
  const positions = new Set<string>();
  const deadStateList: string[] = [];

  for (let i = 0; i < nodeCount; i += 1) {
    const state = graph.nodes[i] as SearchState;
    const depth = graph.depths[i] ?? 0;
    if (depth > maxDepth) maxDepth = depth;
    positions.add(tileKey(state.player));

    if (
      isGoal(level, state) &&
      (shortestSolution === null || depth < shortestSolution)
    ) {
      shortestSolution = depth;
    }
    // BFS discovery order makes the first goal node the shallowest; the min-scan
    // above is kept so the result does not depend on that ordering argument.
    if (!isGoal(level, state) && (graph.legalMask[i] ?? 0) === 0) {
      deadStateList.push(hashState(state));
    }
  }

  // ── `docs/level-design.md` §4: goal reachable from every reachable state ────
  const canReachGoal = new Uint8Array(nodeCount);
  const queue: number[] = [];
  for (let i = 0; i < nodeCount; i += 1) {
    if (!isGoal(level, graph.nodes[i] as SearchState)) continue;
    canReachGoal[i] = 1;
    queue.push(i);
  }
  for (let q = 0; q < queue.length; q += 1) {
    const node = queue[q] as number;
    for (const previous of graph.edgesIn[node] as readonly number[]) {
      if (canReachGoal[previous] === 1) continue;
      canReachGoal[previous] = 1;
      queue.push(previous);
    }
  }
  let reachableGoalCount = 0;
  for (let i = 0; i < nodeCount; i += 1) {
    if (canReachGoal[i] === 1) reachableGoalCount += 1;
  }

  const dual = dualPhaseTiles(graph);
  const refused = refusedThenEnteredTiles(graph);

  return {
    levelId: level.id,
    solvable: shortestSolution !== null,
    shortestSolution,
    reachableStates: nodeCount,
    distinctPositions: positions.size,
    dualPhaseTiles: dual.length,
    dualPhaseTileList: dual,
    refusedThenEnteredTiles: refused.length,
    refusedThenEnteredTileList: refused,
    deadStates: deadStateList.length,
    deadStateList,
    noUnrecoverableOk: reachableGoalCount === nodeCount,
    unrecoverableStates: nodeCount - reachableGoalCount,
    maxDepth,
    stateBudget: graph.stateBudget,
  };
}

/**
 * Solve one level: shortest solution + full solvability + the §8 metrics.
 *
 * `initial` lets a caller start the search from a non-default state (fixtures,
 * QA reproductions). It is a `SearchState`, not a `GameState`: the win latch and
 * the move counter are gameplay bookkeeping, not puzzle state.
 */
export function solve(
  level: Level,
  initial?: SearchState,
  options: SolverOptions = {},
): SolveResult {
  return analyse(level, explore(level, initial, options));
}
