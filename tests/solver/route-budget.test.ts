/**
 * LV-007B · **n-11** — the route walk gets its **own** budget and an **exact**
 * prune, and the shipped metric table does not move.
 *
 * ── WHAT n-11 WAS ────────────────────────────────────────────────────────────
 * `forEachParRoute` (the `parRoutes` / `embedRoutes` / gate-(ii) walk) enumerated
 * *every* legal move sequence of exactly `par` moves, so its cost was `≈ 4^par⁺¹`
 * **regardless of how many routes exist**, and — the actual defect — its budget
 * was read from `options.maxStates ?? PAR_ROUTE_VISIT_CAP`, i.e. from the
 * *state-exploration* key. No caller passes `maxStates` to it today, so a
 * long-par board died on a default that was documented as a route budget while
 * being measured in DFS nodes; the complaint it printed was a state-space one.
 * This is the n-11 bug (LV-007A handoff) and it is pinned here three ways:
 *
 *   1. **The prune is exact, not heuristic** (`§2` below). At every walk node the
 *      child is admitted only if a goal is reachable from it in **exactly** the
 *      remaining number of moves — the memoized recursion `canFinishExactly`, which
 *      walks real `isLegalMove` / `applyMove` edges. The pruned and the exhaustive
 *      walk therefore emit the *same route sequence, in the same order* (pruning is
 *      a pure filter: it drops prefixes, never reorders the surviving children and
 *      never drops a prefix that any route passes through). The equivalence is
 *      asserted on all ten shipped levels and on three synthetic boards — M0 open,
 *      M1+M3 latch, M2 portal — because "portal-safe" is a claim about real edges,
 *      not about a Manhattan/parity bound.
 *   2. **The budget is the walk's own** (`§3`). `maxRouteVisits` (default
 *      {@link PAR_ROUTE_VISIT_CAP}) is a *work-unit* budget: DFS nodes **plus**
 *      lookahead probes, so a caller cannot buy an unbounded prune. `maxStates` is
 *      ignored by the walk now — asserted, since that is the regression. Overrun
 *      still raises {@link RouteEnumerationError} carrying `cap`/`visits`/`par`/
 *      `levelId`: a partial count is never returned.
 *   3. **The shipped numbers do not move** (`§4`). `docs/ai-native-pipeline.md` §8
 *      / `src/levels/README.md` §0b record the L1–L10 table (reachable/distinct,
 *      `refusedThenEnteredTiles` + tiles, `dualPhaseTiles`, all-OFF subgraph
 *      `16/34`, the `parRoutes`/`embedRoutes`/`embedForced` triple, dead states,
 *      `noUnrecoverableOk`, and the l008 named-gate verdicts). Every one of those
 *      values is pinned by an **equality** assertion below, because n-11 touched
 *      the walk that produces three of them. `scripts/solve-levels.ts` byte-diff
 *      against the pre-change run is the CLI-level half of the same evidence.
 *      **LV-008** extends the table to `l011` (the M2 debut) in the same form: the
 *      ten pre-existing rows are pinned by the *same* numbers, and only the
 *      aggregate counts move (10 static / 6 latched / 6 switch-bearing, still 0 dead
 *      and 0 unrecoverable).
 *
 * ── WHAT THIS FILE IS NOT ────────────────────────────────────────────────────
 * The pinned `routeCost` numbers are **read-outs** (`docs/architecture.md` §8: the
 * solver reports, it does not score). They pin the cost claim — pruning pays by an
 * order of magnitude — and they are deliberately *not* a gate: no acceptance rule
 * may fail a board for being expensive, only for being unenumerable, which is the
 * loud `RouteEnumerationError`.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Coord, Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import type { ParRouteEnumerationStats, SolverOptions } from "@/core/solver/bfs";
import {
  PAR_ROUTE_VISIT_CAP,
  RouteEnumerationError,
  StateSpaceExplosionError,
  forEachParRoute,
  forEachParRouteStats,
  solve,
} from "@/core/solver/bfs";
import { auditLevel } from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

/** Every shipped level id, read from the dataset (never a hardcoded ladder). */
const SHIPPED_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

/** A shipped level's board, schema-validated first. */
function shippedBoard(id: number): Level {
  const raw = JSON.parse(
    readFileSync(
      `${LEVELS_DIR}l${String(id).padStart(3, "0")}.json`,
      "utf8",
    ),
  ) as Level;
  expect(validateLevel(raw).ok, `l${String(id).padStart(3, "0")}`).toBe(true);
  return raw;
}

/** `["001", 1]`, … — so a failing title names the shipped file, not a bare number. */
const SHIPPED_CASES = SHIPPED_IDS.map(
  (id) => [String(id).padStart(3, "0"), id] as const,
);

// ─────────────────────────────────────────────────────────────────────────────
// The walk, as a test can see it
// ─────────────────────────────────────────────────────────────────────────────

interface Walk {
  /** One signature per route: the direction sequence, in the order it was visited. */
  readonly signatures: readonly string[];
  readonly stats: ParRouteEnumerationStats;
}

/**
 * A direction sequence **is** the route (each route has exactly `par` arrivals and
 * the sequence determines the visited tiles), so it is the canonical identity for
 * comparing a pruned walk against an exhaustive one.
 */
function walk(level: Level, par: number, options: SolverOptions = {}): Walk {
  const signatures: string[] = [];
  const stats = forEachParRouteStats(
    level,
    par,
    (route) => {
      signatures.push(route.map((arrival) => arrival.direction).join("-"));
    },
    options,
  );
  return { signatures, stats };
}

/** Compact move-spec → signature spelling (`"rrrd"` → `"right-right-right-down"`). */
const SPELLING = { r: "right", l: "left", u: "up", d: "down" } as const;
function moves(spec: string): string {
  return spec
    .split("")
    .map((letter) => SPELLING[letter as keyof typeof SPELLING])
    .join("-");
}

/** Run a walk that is *expected* to raise, and hand back the error (never swallow it). */
function raised(level: Level, par: number, options: SolverOptions): RouteEnumerationError {
  try {
    walk(level, par, options);
  } catch (error) {
    expect(error, "the walk must raise RouteEnumerationError, not a generic Error").toBeInstanceOf(
      RouteEnumerationError,
    );
    return error as RouteEnumerationError;
  }
  throw new Error(
    `expected the walk to raise (par=${par}, options=${JSON.stringify(options)}) — ` +
      `a silent return here would mean a partial route count was reported`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. The pruned and the exhaustive walk agree — on the shipped levels
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · n-11 — the lookahead prune is a pure filter (shipped levels)", () => {
  it.each(SHIPPED_CASES)(
    "l%s — pruned and exhaustive emit the same routes, in the same order",
    (_label, id) => {
      const level = shippedBoard(id);
      const par = solve(level).shortestSolution ?? level.par;
      const exhaustive = walk(level, par, { pruneParRoutes: false });
      const pruned = walk(level, par);

      // Equality, not "same count": ordered comparison also proves the surviving
      // children kept their `DIRECTIONS` order, i.e. the prune filters prefixes
      // instead of re-walking the tree in a different shape.
      expect(pruned.signatures).toEqual(exhaustive.signatures);
      expect(pruned.stats).toMatchObject({
        par,
        pruning: true,
        routes: pruned.signatures.length,
      });
      expect(exhaustive.stats).toMatchObject({
        pruning: false,
        routes: pruned.signatures.length,
        lookaheadVisits: 0, // the exhaustive walk must not have probed at all
      });
      expect(pruned.stats.visitBudget).toBe(PAR_ROUTE_VISIT_CAP);

      // The prune is *not* vacuous on any shipped level: something was dropped, and
      // the walk got cheaper because of it.
      expect(pruned.stats.prunedChildren).toBeGreaterThan(0);
      expect(pruned.stats.visits).toBeLessThan(exhaustive.stats.visits);
      expect(pruned.stats.lookaheadVisits).toBeGreaterThan(0);
    },
  );

  it("the visitor is handed every route exactly once (no duplicate signatures)", () => {
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      const par = solve(level).shortestSolution ?? level.par;
      const pruned = walk(level, par);
      expect(new Set(pruned.signatures).size, `l${id}`).toBe(pruned.signatures.length);
    }
  });

  it("`forEachParRoute` still returns the count and delegates to the stats walk", () => {
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      const par = solve(level).shortestSolution ?? level.par;
      let seen = 0;
      const count = forEachParRoute(level, par, () => {
        seen += 1;
      });
      expect(count, `l${id}`).toBe(seen);
      expect(count, `l${id}`).toBe(walk(level, par).stats.routes);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The prune is exact on synthetic boards too — including the M2 (portal) case
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Why a *portal* board is in this list: the cheap pruning bound one reaches for
 * first is arithmetic (Manhattan distance / `x + y` parity to the goal). That bound
 * is **unsound** the moment M2 ships — a teleport moves the player without moving
 * through the intervening tiles — so the shipped prune walks real edges instead.
 * These three boards are small enough to exhaust (`≈ 4^7` nodes), so "exact" is
 * measured rather than argued: the latch board proves it under door/switch state,
 * the portal board under a relocation.
 */
const OPEN_M0: Level = {
  id: 7_101,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 0] as Coord,
  goal: [4, 2] as Coord,
  phaseAWalls: [],
  phaseBWalls: [],
  doors: [],
  switches: [],
  portals: [],
  par: 6,
};

const LATCH_M1_M3: Level = {
  id: 7_102,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 0] as Coord,
  goal: [4, 2] as Coord,
  phaseAWalls: [[2, 1]],
  phaseBWalls: [],
  doors: [{ id: "d1", color: "red", tiles: [[1, 1]] }],
  switches: [{ id: "s1", tile: [2, 0], activePhase: "A", targets: ["d1"] }],
  portals: [],
  par: 6,
};

const PORTAL_M2: Level = {
  id: 7_103,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 0] as Coord,
  goal: [4, 2] as Coord,
  phaseAWalls: [[2, 1]],
  phaseBWalls: [],
  doors: [],
  switches: [],
  // `(1,0)` is parity 1 and `(0,2)` is parity 0: an opposite-colour pair, i.e. the
  // only mechanism ADR-0009 records as able to break position → phase.
  portals: [{ id: "p1", pair: [[1, 0], [0, 2]], activePhase: "A" }],
  par: 6,
};

describe("LV-007B · n-11 — the prune is exact under M0, M1+M3 and M2 content", () => {
  it.each([
    ["M0 open 5x3", OPEN_M0],
    ["M1+M3 latch 5x3", LATCH_M1_M3],
    ["M2 opposite-colour portal 5x3", PORTAL_M2],
  ] as const)("%s — exhaustive ≡ pruned", (_label, level) => {
    expect(validateLevel(level).ok, `board id=${level.id}`).toBe(true);
    const exhaustive = walk(level, level.par, { pruneParRoutes: false });
    const pruned = walk(level, level.par);

    expect(pruned.signatures).toEqual(exhaustive.signatures);
    expect(pruned.stats.routes).toBe(pruned.signatures.length);
    expect(pruned.stats.routes).toBeGreaterThan(1); // the comparison is not over zero routes
    expect(pruned.stats.prunedChildren).toBeGreaterThan(0);
    // Every signature is a legal `par`-move sequence that lands on the goal: the
    // walk's routes are the thing the gates count, so their shape is pinned too.
    for (const signature of pruned.signatures)
      expect(signature.split("-")).toHaveLength(level.par);
  });

  it("the portal board really teleports (the prune met a relocation, not just a walk)", () => {
    // Otherwise this control would be an open board wearing a portal: `(0,2)` is
    // entered in phase A only through the pair, i.e. `dualPhaseTiles > 0`.
    expect(solve(PORTAL_M2).dualPhaseTiles).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The 7×7 long-par boards — the ones the old budget killed
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shipping-grade 7 × 7 board, `par = 20`: eleven tiles are walls in **both** phases
 * and the player walks `(0,0) → (6,6)` — a 12-tile Manhattan gap stretched to 20
 * moves, i.e. exactly the long-par shape whose route set is *tiny* (2 routes) while
 * its search tree is not. Under the pre-n-11 walk this dies at the default budget.
 */
const LONG_PAR_DEMO: Level = {
  id: 7_104,
  width: 7,
  height: 7,
  startPhase: "A",
  player: [0, 0] as Coord,
  goal: [6, 6] as Coord,
  phaseAWalls: [
    [0, 3],
    [1, 2],
    [2, 1],
    [2, 4],
    [3, 1],
    [3, 3],
    [3, 5],
    [4, 3],
    [5, 3],
    [5, 6],
    [6, 4],
  ],
  phaseBWalls: [
    [0, 3],
    [1, 2],
    [2, 1],
    [2, 4],
    [3, 1],
    [3, 3],
    [3, 5],
    [4, 3],
    [5, 3],
    [5, 6],
    [6, 4],
  ],
  doors: [],
  switches: [],
  portals: [],
  par: 20,
};

/** The degenerate long-par case: no walls at all, so the tree is at its widest. */
const OPEN_7X7_PAR_12: Level = {
  id: 7_105,
  width: 7,
  height: 7,
  startPhase: "A",
  player: [0, 0] as Coord,
  goal: [6, 6] as Coord,
  phaseAWalls: [],
  phaseBWalls: [],
  doors: [],
  switches: [],
  portals: [],
  par: 12,
};

describe("LV-007B · n-11 — a long-par board is enumerable, not a state-space complaint", () => {
  it("7x7 par=20 is a legitimate board, and its two routes are the puzzle", () => {
    expect(validateLevel(LONG_PAR_DEMO as unknown).ok).toBe(true);
    expect(solve(LONG_PAR_DEMO).shortestSolution).toBe(20);
    expect(solve(LONG_PAR_DEMO).reachableStates).toBe(38);

    const pruned = walk(LONG_PAR_DEMO, 20);
    expect(pruned.signatures).toEqual([
      moves("rrrrddlldldddrrrurrd"),
      moves("rrrrddlldlddrdrrurrd"),
    ]);
    // The two shortest solutions differ only in a transposition (moves 13–14), i.e.
    // the board offers one local choice — which is why the route set is 2 while the
    // tree is astronomically larger.
    const [a, b] = pruned.signatures as readonly [string, string];
    expect(a).not.toBe(b);
    const movesA = a.split("-");
    const movesB = b.split("-");
    expect(movesA.map((entry, i) => (entry === movesB[i] ? null : i)).filter((i) => i !== null)).toEqual([
      12, 13,
    ]);

    // …and the walk's whole cost, reported (n-11 read-outs, not gates):
    expect(pruned.stats).toMatchObject({
      par: 20,
      routes: 2,
      visits: 29,
      lookaheadVisits: 558,
      prunedChildren: 40,
      visitBudget: PAR_ROUTE_VISIT_CAP,
      pruning: true,
    });
  });

  it("the pre-n-11 walk (no prune) exhausts the default budget on that board", () => {
    // This is the n-11 complaint reproduced: the walk that enumerates the tree
    // *blind* cannot answer the question under the same 2 M budget. It raises with
    // the numbers instead of returning a count, and `visits` is exactly one over the
    // cap because every work unit is charged as it is entered.
    const error = raised(LONG_PAR_DEMO, 20, { pruneParRoutes: false });
    expect(error.cap).toBe(PAR_ROUTE_VISIT_CAP);
    expect(error.visits).toBe(PAR_ROUTE_VISIT_CAP + 1);
    expect(error.par).toBe(20);
    expect(error.levelId).toBe(LONG_PAR_DEMO.id);
    expect(error.message).toContain("maxRouteVisits"); // names the key that would help
    expect(error.message).toContain("refusing to report partial"); // never a partial count
  });

  it("the widest board (open 7x7, par=12) keeps its 924 routes under the same budget", () => {
    const pruned = walk(OPEN_7X7_PAR_12, 12);
    expect(pruned.stats).toMatchObject({
      par: 12,
      routes: 924,
      visits: 3431,
      lookaheadVisits: 8903,
      prunedChildren: 5000,
    });
    expect(new Set(pruned.signatures).size).toBe(924);
    for (const signature of pruned.signatures)
      expect(signature.split("-")).toHaveLength(12);

    // The blind walk dies at the *same* budget on the *same* board: the old
    // behaviour would have reported "state-space explosion" for a 924-route puzzle.
    expect(raised(OPEN_7X7_PAR_12, 12, { pruneParRoutes: false }).cap).toBe(
      PAR_ROUTE_VISIT_CAP,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. The budget belongs to the enumeration (the n-11 key change)
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · n-11 — the route walk's budget is its own key", () => {
  it("`maxStates` (the exploration budget) no longer caps the walk — the n-11 regression", () => {
    // Pre-n-11 the walk read `options.maxStates ?? PAR_ROUTE_VISIT_CAP`. Passing the
    // exploration budget to it must now be a no-op: the enumeration's default stands.
    expect(forEachParRoute(LONG_PAR_DEMO, 20, () => {}, { maxStates: 1 })).toBe(2);
    expect(walk(LONG_PAR_DEMO, 20, { maxStates: 1 }).stats.visitBudget).toBe(
      PAR_ROUTE_VISIT_CAP,
    );
    // …and the same key still means what it always meant for `explore`:
    expect(() => solve(LONG_PAR_DEMO, undefined, { maxStates: 1 })).toThrow(
      StateSpaceExplosionError,
    );
  });

  it("`maxRouteVisits` is the key that caps it — loudly, with cap/visits/par/levelId", () => {
    const error = raised(LONG_PAR_DEMO, 20, { maxRouteVisits: 10 });
    expect(error.cap).toBe(10);
    expect(error.visits).toBe(11);
    expect(error.par).toBe(20);
    expect(error.levelId).toBe(LONG_PAR_DEMO.id);
    expect(error.name).toBe("RouteEnumerationError");
  });

  it("the budget covers lookahead probes as well as DFS nodes (a prune cannot be bought)", () => {
    const stats = walk(LONG_PAR_DEMO, 20).stats;
    expect(stats.visits + stats.lookaheadVisits).toBe(587);
    // 100 units is more than the 29 DFS nodes but less than the 587 units of work:
    // the walk must still raise, so `maxRouteVisits` cannot be undercut by measuring
    // only the tree.
    expect(raised(LONG_PAR_DEMO, 20, { maxRouteVisits: 100 }).cap).toBe(100);
    expect(stats.visits).toBeLessThan(100);
  });

  it("a budget above the demand is never a failure, and the default is the documented cap", () => {
    expect(walk(LONG_PAR_DEMO, 20, { maxRouteVisits: 587 }).stats.routes).toBe(2);
    expect(walk(LONG_PAR_DEMO, 20).stats.visitBudget).toBe(PAR_ROUTE_VISIT_CAP);
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      const par = solve(level).shortestSolution ?? level.par;
      expect(walk(level, par).stats.visitBudget, `l${id}`).toBe(PAR_ROUTE_VISIT_CAP);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. The shipped table is unchanged (the LV-007B iron rule)
// ─────────────────────────────────────────────────────────────────────────────

interface ShippedPin {
  readonly shortest: number;
  readonly reachable: number;
  readonly positions: number;
  readonly maxDepth: number;
  readonly dualPhaseTiles: number;
  readonly refusedThenEnteredTiles: number;
  readonly refusedThenEnteredTileList: readonly string[];
  readonly deadStates: number;
  readonly unrecoverableStates: number;
  readonly parRoutes: number;
  readonly embedRoutes: number;
  readonly embedForced: boolean;
  readonly allOffGoalReachable: boolean | null;
  readonly allOffReachableStates: number | null;
  /** n-11 cost read-out — reported, never a verdict. */
  readonly cost: {
    readonly visits: number;
    readonly lookaheadVisits: number;
    readonly prunedChildren: number;
  };
}

/**
 * The pre-n-11 values, transcribed from the baseline run of
 * `scripts/solve-levels.ts` (`RESULT: PASS`, 10/10). Equality against these is the
 * iron rule of LV-007B item 1: n-11 rewrote the walk that produces `parRoutes` /
 * `embedRoutes` / `embedForced` and the gate-(ii) count, so *every* metric the CLI
 * prints is pinned here, not only the ones the walk owns.
 */
const PINS: Readonly<Record<number, ShippedPin>> = {
  1: { shortest: 4, reachable: 15, positions: 15, maxDepth: 5, dualPhaseTiles: 0, refusedThenEnteredTiles: 0, refusedThenEnteredTileList: [], deadStates: 0, unrecoverableStates: 0, parRoutes: 1, embedRoutes: 0, embedForced: false, allOffGoalReachable: null, allOffReachableStates: null, cost: { visits: 5, lookaheadVisits: 54, prunedChildren: 11 } },
  2: { shortest: 5, reachable: 16, positions: 16, maxDepth: 6, dualPhaseTiles: 0, refusedThenEnteredTiles: 0, refusedThenEnteredTileList: [], deadStates: 0, unrecoverableStates: 0, parRoutes: 10, embedRoutes: 0, embedForced: false, allOffGoalReachable: null, allOffReachableStates: null, cost: { visits: 34, lookaheadVisits: 131, prunedChildren: 51 } },
  3: { shortest: 6, reachable: 14, positions: 14, maxDepth: 6, dualPhaseTiles: 0, refusedThenEnteredTiles: 0, refusedThenEnteredTileList: [], deadStates: 0, unrecoverableStates: 0, parRoutes: 6, embedRoutes: 0, embedForced: false, allOffGoalReachable: null, allOffReachableStates: null, cost: { visits: 33, lookaheadVisits: 129, prunedChildren: 36 } },
  4: { shortest: 6, reachable: 19, positions: 19, maxDepth: 6, dualPhaseTiles: 0, refusedThenEnteredTiles: 0, refusedThenEnteredTileList: [], deadStates: 0, unrecoverableStates: 0, parRoutes: 6, embedRoutes: 3, embedForced: false, allOffGoalReachable: null, allOffReachableStates: null, cost: { visits: 33, lookaheadVisits: 165, prunedChildren: 48 } },
  5: { shortest: 6, reachable: 18, positions: 18, maxDepth: 6, dualPhaseTiles: 0, refusedThenEnteredTiles: 0, refusedThenEnteredTileList: [], deadStates: 0, unrecoverableStates: 0, parRoutes: 3, embedRoutes: 3, embedForced: true, allOffGoalReachable: null, allOffReachableStates: null, cost: { visits: 18, lookaheadVisits: 136, prunedChildren: 34 } },
  6: { shortest: 4, reachable: 29, positions: 15, maxDepth: 6, dualPhaseTiles: 0, refusedThenEnteredTiles: 1, refusedThenEnteredTileList: ["3,1"], deadStates: 0, unrecoverableStates: 0, parRoutes: 1, embedRoutes: 1, embedForced: true, allOffGoalReachable: true, allOffReachableStates: 14, cost: { visits: 5, lookaheadVisits: 77, prunedChildren: 11 } },
  7: { shortest: 4, reachable: 12, positions: 7, maxDepth: 4, dualPhaseTiles: 0, refusedThenEnteredTiles: 1, refusedThenEnteredTileList: ["1,1"], deadStates: 0, unrecoverableStates: 0, parRoutes: 2, embedRoutes: 2, embedForced: true, allOffGoalReachable: false, allOffReachableStates: 5, cost: { visits: 8, lookaheadVisits: 39, prunedChildren: 10 } },
  8: { shortest: 6, reachable: 34, positions: 18, maxDepth: 8, dualPhaseTiles: 0, refusedThenEnteredTiles: 1, refusedThenEnteredTileList: ["3,1"], deadStates: 0, unrecoverableStates: 0, parRoutes: 6, embedRoutes: 6, embedForced: true, allOffGoalReachable: false, allOffReachableStates: 16, cost: { visits: 27, lookaheadVisits: 172, prunedChildren: 43 } },
  9: { shortest: 8, reachable: 58, positions: 20, maxDepth: 15, dualPhaseTiles: 0, refusedThenEnteredTiles: 2, refusedThenEnteredTileList: ["2,2", "4,1"], deadStates: 0, unrecoverableStates: 0, parRoutes: 2, embedRoutes: 2, embedForced: true, allOffGoalReachable: false, allOffReachableStates: 10, cost: { visits: 16, lookaheadVisits: 225, prunedChildren: 27 } },
  10: { shortest: 9, reachable: 42, positions: 22, maxDepth: 9, dualPhaseTiles: 0, refusedThenEnteredTiles: 1, refusedThenEnteredTileList: ["4,1"], deadStates: 0, unrecoverableStates: 0, parRoutes: 36, embedRoutes: 36, embedForced: true, allOffGoalReachable: false, allOffReachableStates: 20, cost: { visits: 163, lookaheadVisits: 721, prunedChildren: 303 } },
  // LV-008 — the M2 debut. The first shipped board with `dualPhaseTiles > 0` (21 of its
  // 21 tiles are enterable in both phases: the opposite-colour pair `(2,1) ⇄ (4,0)`
  // breaks the position→phase parity link on *every* tile it can reach), and the first
  // whose `driver` is a single route: `parRoutes = 1`. `allOffGoalReachable: true` is the
  // documented "below OFFERED" grade, not a defect — the walking world solves in 7.
  11: { shortest: 4, reachable: 82, positions: 21, maxDepth: 10, dualPhaseTiles: 21, refusedThenEnteredTiles: 1, refusedThenEnteredTileList: ["5,0"], deadStates: 0, unrecoverableStates: 0, parRoutes: 1, embedRoutes: 1, embedForced: true, allOffGoalReachable: true, allOffReachableStates: 41, cost: { visits: 5, lookaheadVisits: 80, prunedChildren: 9 } },
};

/** Everything the CLI prints for a level, projected off the audit — one object, one diff. */
function project(id: number): ShippedPin {
  const level = shippedBoard(id);
  const audit = auditLevel(level);
  const result = audit.result;
  const par = result.shortestSolution ?? level.par;
  const routeStats = walk(level, par).stats;
  return {
    shortest: result.shortestSolution as number,
    reachable: result.reachableStates,
    positions: result.distinctPositions,
    maxDepth: result.maxDepth,
    dualPhaseTiles: result.dualPhaseTiles,
    refusedThenEnteredTiles: result.refusedThenEnteredTiles,
    refusedThenEnteredTileList: result.refusedThenEnteredTileList,
    deadStates: result.deadStates,
    unrecoverableStates: result.unrecoverableStates,
    parRoutes: audit.embeds.parRoutes,
    embedRoutes: audit.embeds.embedRoutes,
    embedForced: audit.embeds.embedForced,
    allOffGoalReachable: audit.allOffGoalReachable,
    allOffReachableStates: audit.allOffReachableStates,
    cost: {
      visits: routeStats.visits,
      lookaheadVisits: routeStats.lookaheadVisits,
      prunedChildren: routeStats.prunedChildren,
    },
  };
}

describe("LV-007B · n-11 — the shipped L1–L10 numbers are unchanged (LV-008 appends L11 to the same table)", () => {
  it("the pin table covers the dataset (no shipped level is unpinned)", () => {
    expect(Object.keys(PINS).map(Number).sort((a, b) => a - b)).toEqual(SHIPPED_IDS);
  });

  it.each(SHIPPED_CASES)("l%s — every printed metric equals its pre-n-11 value", (_label, id) => {
    expect(project(id)).toEqual(PINS[id]);
    expect(auditLevel(shippedBoard(id)).violations, `l${id}`).toEqual([]);
    expect(auditLevel(shippedBoard(id)).result.noUnrecoverableOk, `l${id}`).toBe(true);
  });

  it("l008's named-gate table is byte-for-byte the baseline verdicts", () => {
    // The gates read `parRoutes` / `embedRoutes` (gate (ii), `routeVerdict`) and
    // `allOffStateCount` (gate (i)) — i.e. the two things n-11 touched — so the
    // verdict *strings* are pinned, not just the aggregate.
    expect(
      auditLevel(shippedBoard(8)).gates.map((gate) => `${gate.id}:${gate.status}`),
    ).toEqual([
      "no-solution-with-switches-off:PASS",
      "shortest-solution-presses-switch-and-crosses-door:PASS",
      "refused-then-entered:PASS",
      "dual-phase-tiles:UNSATISFIABLE",
      "single-door-one-switch-funnel:PASS",
      "aha-par-cap:PASS",
    ]);
    // …and the CLI's `16/34` sentence is two assertions, not prose (LV-007A n-18).
    const l8 = auditLevel(shippedBoard(8));
    expect(l8.allOffReachableStates).toBe(16);
    expect(l8.result.reachableStates).toBe(34);
  });

  it("the CLI's aggregate lines still hold (10 static, 6 latched, 0 dead, 0 unrecoverable)", () => {
    // LV-008 moved three of these counts by adding the M2 debut: `dualPhaseTiles === 0`
    // is now 10 of 11, `refusedThenEnteredTiles > 0` is 6 of 11, and the switch-bearing
    // set (`allOffGoalReachable !== null`) is 6 of 11. The "0 dead / 0 unrecoverable"
    // lines are the ones that must stay *whole*: every shipped board obeys §4.
    const table = SHIPPED_IDS.map((id) => PINS[id] as ShippedPin);
    expect(table.filter((pin) => pin.dualPhaseTiles === 0)).toHaveLength(10);
    expect(table.filter((pin) => pin.refusedThenEnteredTiles > 0)).toHaveLength(6);
    expect(table.filter((pin) => pin.deadStates === 0)).toHaveLength(11);
    expect(table.filter((pin) => pin.unrecoverableStates === 0)).toHaveLength(11);
    expect(table.filter((pin) => pin.allOffGoalReachable !== null)).toHaveLength(6);
    // …and the single level that carries the parity-breaking displacement is the M2
    // debut, so the aggregate line names it rather than counting it.
    expect(
      table
        .filter((pin) => pin.dualPhaseTiles > 0)
        .map((pin) => pin.dualPhaseTiles),
    ).toEqual([21]);
    // The escalation count of the CLI run is one, and it is gate (iv)'s — unchanged
    // by n-11 but printed next to the same lines, so it is pinned with them.
    const escalations = SHIPPED_IDS.flatMap((id) =>
      auditLevel(shippedBoard(id)).gates.filter((gate) => gate.status === "UNSATISFIABLE"),
    );
    expect(escalations.map((gate) => gate.id)).toEqual(["dual-phase-tiles"]);
  });
});