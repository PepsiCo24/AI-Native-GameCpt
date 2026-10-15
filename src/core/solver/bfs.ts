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
 * - No second "is the tile under me solid?" check exists anywhere in this file
 *   **as a search decision**: an embedded state (player standing inside a
 *   current-phase-solid cell) is an ordinary search node (ADR-0008 clause 3,
 *   `docs/architecture.md` §6.3), and legality is decided by `isLegalMove` alone.
 *   The only extra rule call is `solidAt` inside the **embed metric**
 *   ({@link embedMetrics}, LV-004): it asks the shipped predicate whether an
 *   arrival left the player inside a phase-solid tile. No search decision depends
 *   on it — the metric is a read-out, not a second legality path.
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
 *   latched switch state or a parity-breaking portal. **Canonical** metric #7
 *   (`docs/architecture.md` §8.1 / ADR-architecture-0002): the acceptance law and
 *   gate (iii) read *this* one.
 * - `refusedBeforeEnteredTiles` — the **ordered companion** (LV-007B item 2):
 *   tiles where a refusal is reachable *before* an acceptance (`r →* a`, same tile
 *   at both ends). A strict subset of the metric above; the difference is the
 *   *trapped refusals* — history-dependence the player can never act on. Reported,
 *   never gated.
 * - `deadStates` — reachable non-goal states with **zero** legal out-edges
 *   (unrecoverable: there is no wait and no manual flip, `docs/level-design.md`
 *   §4). Their hashes are listed so a failure is reproducible.
 * - `noUnrecoverableOk` — the `docs/level-design.md` §4 invariant: from **every**
 *   reachable state the goal is still reachable. Computed exactly (reverse
 *   reachability from the goal states over the reachable graph), not sampled.
 *
 * ── ROUTE ENUMERATION: PRUNING + ITS OWN BUDGET (n-11) ───────────────────────
 * {@link forEachParRoute} walks move sequences of a fixed length; its cost is
 * exponential in `par` unless the walk knows which prefixes can still complete.
 * It does: every child is admitted only if a goal is reachable from it in exactly
 * the remaining number of moves ({@link forEachParRouteStats}, exact memoized
 * recursion over the shipped rules). The route set is therefore *unchanged*
 * (pinned by `tests/solver/route-budget.test.ts`, pruned vs exhaustive), the cost
 * becomes `routes × par`-shaped, and the enumeration has its **own** budget key
 * (`maxRouteVisits`) instead of borrowing the state-exploration one — a level
 * that exceeds it raises {@link RouteEnumerationError} with the numbers instead of
 * reporting a partial count.
 */

import type { Level } from "@/core/level";
import { applyMove, isLegalMove, solidAt } from "@/core/rules";
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
  /**
   * Independent budget for **route enumeration** (n-11): the number of work units
   * {@link forEachParRoute} may spend, defaulting to
   * {@link PAR_ROUTE_VISIT_CAP}. Deliberately a different key from `maxStates`:
   * the two searches have different growth laws (states are bounded by §6.3,
   * routes grow with `par`), so one budget could not honestly cover both — before
   * n-11 a caller's `maxStates` silently capped the route walk, and a long-par
   * board died as a state-space complaint.
   */
  readonly maxRouteVisits?: number;
  /**
   * Disables the n-11 **lookahead pruning** of {@link forEachParRoute}
   * (default `true`). It exists so the equivalence between the pruned and the
   * exhaustive walk is *machine-checkable* (`tests/solver/route-budget.test.ts`
   * compares the two route sets); the shipped path always prunes, and turning
   * pruning off can only make the walk slower, never different.
   */
  readonly pruneParRoutes?: boolean;
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
 * Every tile that is *ever clicked* from a reachable state, split by what happened
 * — the shared primitive behind {@link clickLedger} (unordered) and
 * {@link refusedBeforeEnteredTiles} (ordered).
 *
 * Derived from the graph alone — no rule call, no second legality path: bit `d`
 * of `legalMask[i]` already *is* `isLegalMove` for `MOVE(DIRECTIONS[d])`. The map
 * keeps **first-click order**, which is the order {@link clickLedger} has always
 * reported. Out-of-bounds clicked tiles are recorded too (they can only ever be
 * refused, so they can never satisfy either metric).
 */
function clickSourcesByTile(
  graph: ReachableGraph,
): ReadonlyMap<string, { readonly refusedNodes: readonly number[]; readonly acceptedNodes: readonly number[] }> {
  const map = new Map<
    string,
    { refusedNodes: number[]; acceptedNodes: number[] }
  >();
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const state = graph.nodes[i] as SearchState;
    const mask = graph.legalMask[i] ?? 0;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const clicked = step(state.player, DIRECTIONS[d] as Direction);
      const key = tileKey(clicked);
      let entry = map.get(key);
      if (entry === undefined) {
        entry = { refusedNodes: [], acceptedNodes: [] };
        map.set(key, entry);
      }
      // One node cannot appear twice in one bucket: the four clicked tiles of a
      // state are four distinct tiles, so `i` is pushed at most once per bucket.
      if ((mask & (1 << d)) !== 0) entry.acceptedNodes.push(i);
      else entry.refusedNodes.push(i);
    }
  }
  return map;
}

/** Is any node of `targets` reachable from the multi-source set `sources` (inclusive)? */
function reachesAnyOf(
  graph: ReachableGraph,
  sources: readonly number[],
  targets: ReadonlySet<number>,
): boolean {
  const seen = new Uint8Array(graph.nodes.length);
  const queue: number[] = [];
  for (const node of sources) {
    if (seen[node] === 1) continue;
    seen[node] = 1;
    queue.push(node);
  }
  for (let head = 0; head < queue.length; head += 1) {
    const node = queue[head] as number;
    if (targets.has(node)) return true;
    for (const next of graph.edgesOut[node] as readonly number[]) {
      if (seen[next] === 1) continue;
      seen[next] = 1;
      queue.push(next);
    }
  }
  return false;
}

/**
 * Every tile that is *ever clicked* from a reachable state, with the observed
 * outcomes.
 *
 * Derived from the graph alone — no rule call, no second legality path: bit `d`
 * of `legalMask[i]` already *is* `isLegalMove` for `MOVE(DIRECTIONS[d])`.
 */
export function clickLedger(
  graph: ReachableGraph,
): ReadonlyMap<string, ClickRecord> {
  const ledger = new Map<string, ClickRecord>();
  for (const [key, sources] of clickSourcesByTile(graph)) {
    ledger.set(key, {
      refused: sources.refusedNodes.length > 0,
      accepted: sources.acceptedNodes.length > 0,
    });
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

/**
 * The **ordered companion** of {@link refusedThenEnteredTiles} (`ADR-architecture-0002`,
 * LV-007B item 2): tiles where a refusal is reachable **before** an acceptance —
 * i.e. there is a reachable state `r` whose click on the tile is refused, and a
 * reachable state `a` whose click on the tile is accepted, with `r →* a` in the
 * reachable transition graph (same tile, both ends).
 *
 * Why it exists: the unordered metric answers "has this tile ever answered
 * differently?", which a *trapped refusal* also satisfies — a pocket where the
 * refusal can never precede the acceptance (the canonical case is a latch that
 * closes over its own press tile) is history-dependence in the metric but not a
 * decision the player can ever make. The ordered metric is therefore a **strict
 * refinement**: `refusedBeforeEnteredTiles ⊆ refusedThenEnteredTiles` always, and
 * the difference is exactly the trapped-refusal set. It is a **companion**, not a
 * replacement: `docs/architecture.md` §8.1 pins the *unordered* state-set as
 * metric #7 (it is the one ADR-0009 measured: 142/369 latch boards), and the
 * acceptance law of `docs/ai-native-pipeline.md` §8.5, gate (iii) included, stays
 * on that canonical metric until GD-008 re-words the lessons.
 *
 * Direction of the walk: the predicate is "∃ r ∈ Refused(t), a ∈ Accepted(t):
 * `r →* a`", and this computes it from the *source* side — a forward closure from
 * `Refused(t)` tested against `Accepted(t)`. That is the same relation the ADR
 * states as reverse reachability from the accented set; traversing it the other
 * way would give the identical verdict at the same cost, because a refusal is
 * **identity** (no movement, no phase flip), so refused states are ordinary
 * reachable nodes and no duplicated "try the click" edges are involved.
 */
export function refusedBeforeEnteredTiles(
  graph: ReachableGraph,
): readonly string[] {
  const out: string[] = [];
  for (const [key, sources] of clickSourcesByTile(graph)) {
    if (sources.refusedNodes.length === 0 || sources.acceptedNodes.length === 0)
      continue;
    if (reachesAnyOf(graph, sources.refusedNodes, new Set(sources.acceptedNodes)))
      out.push(key);
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
  /**
   * Ordered companion of the two fields above (LV-007B item 2): refusals a player
   * can really meet *before* the tile accepts them. Always a subset
   * (`≤ refusedThenEnteredTiles`); the difference is the trapped-refusal set. It is
   * reported, not gated: `docs/architecture.md` §8.1 keeps the unordered metric
   * canonical, and gate (iii) of `docs/level-design.md` §3 still reads it.
   */
  readonly refusedBeforeEnteredTiles: number;
  readonly refusedBeforeEnteredTileList: readonly string[];
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
  const refusedBefore = refusedBeforeEnteredTiles(graph);

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
    refusedBeforeEnteredTiles: refusedBefore.length,
    refusedBeforeEnteredTileList: refusedBefore,
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

// ─────────────────────────────────────────────────────────────────────────────
// Shortest-route enumeration + the embed metrics (LV-004)
//
// Why this is not a second search: it walks the *same* `isLegalMove` /
// `applyMove` rule functions over *move sequences of a fixed length*, and it is
// only ever called with `par = shortestSolution` (or `level.par` when the level
// is unsolvable). It exists because PA-004 asked a question `solve()` cannot
// answer: **do shortest solutions cross a passable echo and end up embedded?**
// That is a property of the routes, not of the reachable set — L4 and L5 differ
// exactly there (offered vs forced, `docs/level-design.md` §2).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Absolute cap on the number of **work units** a route enumeration may spend
 * (default for `maxRouteVisits`, n-11). A unit is one DFS node entered *or* one
 * lookahead probe ({@link forEachParRouteStats}); exceeding it raises instead of
 * reporting a partial count — the same honesty rule as
 * {@link StateSpaceExplosionError}, and the budget is now the enumeration's
 * **own** (before n-11 it read `maxStates`, the state-exploration key).
 */
export const PAR_ROUTE_VISIT_CAP = 2_000_000;

/** Raised instead of silently reporting a partial route count. */
export class RouteEnumerationError extends Error {
  /** The budget that was hit. */
  readonly cap: number;
  /** Work units spent when the budget was hit (always `> cap`). */
  readonly visits: number;
  /** The `par` being enumerated. */
  readonly par: number;
  readonly levelId: number;

  constructor(level: Level, par: number, cap: number, visits: number) {
    super(
      `route enumeration for level ${level.id} at par=${par} exceeded its own visit budget ` +
        `(${visits} work units > maxRouteVisits ${cap}) — refusing to report partial ` +
        `parRoutes/embedRoutes counts. The budget is not auto-raised and the walk is not ` +
        `truncated: re-run with an explicit larger maxRouteVisits (the remaining demand is ` +
        `not knowable without completing the enumeration), or re-author the board. Note that ` +
        `with the n-11 lookahead pruning the cost is proportional to (routes × par); a blow-up ` +
        `here means the board's shortest-route set is itself too large to enumerate.`,
    );
    this.name = "RouteEnumerationError";
    this.cap = cap;
    this.visits = visits;
    this.par = par;
    this.levelId = level.id;
  }
}

/**
 * What one {@link forEachParRouteStats} walk cost — reported, never inferred.
 *
 * `visits` counts DFS nodes (the classic route-walk cost); `lookaheadVisits`
 * counts the pruning probes (memo hits included, because they are work); the
 * budget applies to their **sum**, so a level that spends its whole budget on
 * lookahead is stopped just as loudly as one that enumerates endlessly.
 */
export interface ParRouteEnumerationStats {
  readonly par: number;
  /** Distinct legal move sequences of exactly `par` moves that end on the goal. */
  readonly routes: number;
  readonly visits: number;
  readonly lookaheadVisits: number;
  /** Candidate children dropped by the lookahead because they cannot complete (n-11). */
  readonly prunedChildren: number;
  readonly visitBudget: number;
  readonly pruning: boolean;
}

/** One arrival on an enumerated route (the start state is not an arrival). */
export interface ArrivalRecord {
  /** The fully resolved post-move state (phase flipped, door state recomputed). */
  readonly state: SearchState;
  readonly direction: Direction;
  /**
   * The player stands inside a phase-solid tile in `state` — the ADR-0008
   * clause-3 embedded state, i.e. the phantom-walk arrival. Decided by the
   * shipped `solidAt`, never re-derived here.
   */
  readonly embedded: boolean;
  /** Switch ids whose latch turned ON / OFF on this arrival (sorted by level order). */
  readonly toggledOn: readonly string[];
  readonly toggledOff: readonly string[];
}

/**
 * Visitor for {@link forEachParRoute}. **The array is reused between visits** —
 * copy it if the records must outlive the callback.
 */
export type ParRouteVisitor = (route: readonly ArrivalRecord[]) => void;

/**
 * Enumerate every distinct legal move sequence of exactly `par` moves that ends
 * on the goal, in depth-first order, and hand each one to `visit`.
 * Returns the number of routes ({@link forEachParRouteStats} returns the cost).
 *
 * A "route" is a direction sequence (= a path; the direction sequence determines
 * the visited tiles). `par` is not checked against the solver's shortest
 * solution here — callers pass `SolveResult.shortestSolution` so the routes are
 * the shortest ones by construction.
 */
export function forEachParRoute(
  level: Level,
  par: number,
  visit: ParRouteVisitor,
  options: SolverOptions = {},
): number {
  return forEachParRouteStats(level, par, visit, options).routes;
}

/**
 * {@link forEachParRoute} plus the cost of the walk (n-11).
 *
 * ── THE PRUNING (why it cannot change the route set) ─────────────────────────
 * At every walk node `(s, d)` and for each legal child `s' = applyMove(s, dir)`
 * the walk asks one exact question: **can a goal be reached from `s'` in
 * exactly `par − d − 1` moves?** — {@link canFinishExactly}, a memoized exact
 * recursion over the shipped `isLegalMove` / `applyMove`. A child that cannot
 * complete is dropped; every child that can completes *some* enumerated route,
 * so the walk visits exactly the prefixes of the routes it reports. The pruned
 * and the exhaustive walk therefore produce the **same route set** (pinned by
 * `tests/solver/route-budget.test.ts`, which compares the two sets on the
 * shipped levels and on a synthetic multi-route board), and pruning can only
 * remove work, never a route.
 *
 * Why this is the honest fix for n-11: without the lookahead the walk's cost is
 * exponential in `par` *regardless of how many routes exist* (an open 7 × 7 board
 * at `par = 12` dies at the 2 M budget while its 924 routes are trivially
 * enumerable). With it, `visits ≤ routes × par + 1` — the cost of a walk that
 * must hand every route to the visitor — plus the memoized lookahead, whose table
 * is bounded by `par × (states reachable within par moves)`. A board that still
 * blows the budget therefore has a shortest-route set that is itself too large to
 * enumerate, which is a **loud** `RouteEnumerationError`, never a partial count.
 *
 * The lookahead is portal-safe by construction (it walks real edges, so a
 * teleport that shortens the distance to the goal is seen as the move it is);
 * a distance/parity bound would *not* be sound once M2 ships, which is why the
 * exact recursion — not the cheaper arithmetic bound — is the shipped prune.
 */
export function forEachParRouteStats(
  level: Level,
  par: number,
  visit: ParRouteVisitor,
  options: SolverOptions = {},
): ParRouteEnumerationStats {
  const pruning = options.pruneParRoutes ?? true;
  const cap = options.maxRouteVisits ?? PAR_ROUTE_VISIT_CAP;
  const start = toSearchState(initialState(level));
  const path: ArrivalRecord[] = [];
  const memo = new Map<string, boolean>();
  let visits = 0;
  let lookaheadVisits = 0;
  let prunedChildren = 0;
  let routes = 0;

  /** One work unit = one DFS node or one lookahead probe; over budget = raise. */
  const charge = (): void => {
    if (visits + lookaheadVisits > cap)
      throw new RouteEnumerationError(level, par, cap, visits + lookaheadVisits);
  };

  const canFinishExactly = (state: SearchState, moves: number): boolean => {
    lookaheadVisits += 1;
    charge();
    if (moves === 0) return isGoal(level, state);
    const key = `${hashState(state)}|${moves}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let finishable = false;
    for (const direction of DIRECTIONS) {
      const action = move(direction);
      if (!isLegalMove(level, state, action)) continue;
      if (canFinishExactly(applyMove(level, state, action), moves - 1)) {
        finishable = true;
        break;
      }
    }
    memo.set(key, finishable);
    return finishable;
  };

  const walk = (state: SearchState, depth: number): void => {
    visits += 1;
    charge();
    if (depth === par) {
      if (isGoal(level, state)) {
        routes += 1;
        visit(path);
      }
      return;
    }
    for (const direction of DIRECTIONS) {
      const action = move(direction);
      if (!isLegalMove(level, state, action)) continue;
      const next = applyMove(level, state, action);
      if (pruning && !canFinishExactly(next, par - depth - 1)) {
        prunedChildren += 1;
        continue;
      }
      path.push(arrivalRecord(level, state, next, direction));
      walk(next, depth + 1);
      path.pop();
    }
  };

  walk(start, 0);
  return {
    par,
    routes,
    visits,
    lookaheadVisits,
    prunedChildren,
    visitBudget: cap,
    pruning,
  };
}

function arrivalRecord(
  level: Level,
  before: SearchState,
  after: SearchState,
  direction: Direction,
): ArrivalRecord {
  const toggledOn: string[] = [];
  const toggledOff: string[] = [];
  for (const sw of level.switches) {
    const was = before.switchesOn[sw.id] === true;
    const now = after.switchesOn[sw.id] === true;
    if (was === now) continue;
    (now ? toggledOn : toggledOff).push(sw.id);
  }
  return {
    state: after,
    direction,
    embedded: solidAt(level, after.phase, after.doorsOpen, after.player),
    toggledOn,
    toggledOff,
  };
}

/**
 * The LV-004 embed metrics, measured over **every shortest route**.
 *
 * - `parRoutes` — distinct legal move sequences of length `par` that reach the goal.
 * - `embedRoutes` — of those, how many leave the player inside a phase-solid tile
 *   at some arrival (the phantom walk, `docs/level-design.md` §2 L4/L5).
 * - `embedForced` — `parRoutes > 0 && embedRoutes === parRoutes`: **every**
 *   shortest solution crosses a passable echo and is embedded by the flip.
 *
 * Measured on the shipped set (PA-004 / LV-004): `l004` 6 routes, 3 embedded
 * (OFFERED), `l005` 3 routes, 3 embedded (**FORCED**), `l001`–`l003` 0 embedded.
 *
 * Since n-11 the enumeration prunes with the exact finishability lookahead, so
 * the cost is reported alongside the counts (it used to be that the walk's own
 * budget was silently the state-exploration one).
 */
export function embedMetrics(
  level: Level,
  par: number = level.par,
  options: SolverOptions = {},
): EmbedMetrics {
  let parRoutes = 0;
  let embedRoutes = 0;
  const stats = forEachParRouteStats(
    level,
    par,
    (route) => {
      parRoutes += 1;
      if (route.some((arrival) => arrival.embedded)) embedRoutes += 1;
    },
    options,
  );
  return {
    parRoutes,
    embedRoutes,
    embedForced: parRoutes > 0 && embedRoutes === parRoutes,
    routeVisits: stats.visits,
    routeLookaheadVisits: stats.lookaheadVisits,
    routePrunedChildren: stats.prunedChildren,
    routeVisitBudget: stats.visitBudget,
  };
}

export interface EmbedMetrics {
  readonly parRoutes: number;
  readonly embedRoutes: number;
  /** Every shortest route embeds at least one arrival (`embedRoutes === parRoutes > 0`). */
  readonly embedForced: boolean;
  /** n-11 cost read-out: DFS nodes entered by the route walk. */
  readonly routeVisits: number;
  /** n-11 cost read-out: lookahead probes (memo hits included). */
  readonly routeLookaheadVisits: number;
  /** n-11 cost read-out: children dropped because they cannot complete. */
  readonly routePrunedChildren: number;
  /** The `maxRouteVisits` budget the walk ran under. */
  readonly routeVisitBudget: number;
}

/**
 * `docs/level-design.md` §3 Solver condition: "no solution exists with all
 * `switchesOn` false". Decided as **subgraph reachability over the already
 * explored graph** — no second search, no second rule, and no re-derivation of
 * door openness: a path may only use nodes in which every switch is OFF.
 *
 * A route that steps on a switch while its `activePhase` is current leaves the
 * all-OFF subgraph (the toggle is part of the state, `hashState`), so this is
 * exactly "the level is winnable without ever pressing a switch".
 */
export function goalReachableWithAllSwitchesOff(
  level: Level,
  graph: ReachableGraph,
): boolean {
  const nodeCount = graph.nodes.length;
  const seen = new Uint8Array(nodeCount);
  const queue: number[] = [];
  const start = graph.nodes[0];
  if (start === undefined) return false;
  if (!allSwitchesOff(level, start)) return false;
  seen[0] = 1;
  queue.push(0);

  for (let q = 0; q < queue.length; q += 1) {
    const i = queue[q] as number;
    if (isGoal(level, graph.nodes[i] as SearchState)) return true;
    for (const j of graph.edgesOut[i] as readonly number[]) {
      if (seen[j] === 1) continue;
      if (!allSwitchesOff(level, graph.nodes[j] as SearchState)) continue;
      seen[j] = 1;
      queue.push(j);
    }
  }
  return false;
}

/** `true` iff every switch in `level` is OFF in `state`. */
export function allSwitchesOff(level: Level, state: SearchState): boolean {
  for (const sw of level.switches) {
    if (state.switchesOn[sw.id] === true) return false;
  }
  return true;
}
