/**
 * Solver optimality — `solveBfs` (i.e. `solve` over `explore`) must return the
 * **true** shortest solution, not merely *a* solution.
 *
 * Why this is not circular: the shipped solver is bounded BFS over the shipped
 * `applyMove` (unit edge cost ⇒ optimal *if* the search is correct). A BFS can
 * still be wrong in ways a self-comparison cannot see — a missing edge, a visited
 * key that merges distinct states, a depth that is not the node's shortest. So
 * this suite crosses it against a **deliberately naive brute force**:
 *
 *   iterative-deepening DFS, no visited set, no memoisation, no heuristic —
 *   it enumerates every legal move sequence of length `1..maxDepth` and returns
 *   the first depth at which a goal is reached (⟺ the shortest solution, since
 *   every shorter depth was fully enumerated first).
 *
 * It is exponential on purpose and **test-only**: it exists to disagree with the
 * solver if the solver is wrong. Cost is bounded by keeping the boards small
 * (4 × 4, no mechanics) and the depth limit at {@link BRUTE_MAX_DEPTH}.
 *
 * Truth sources: `docs/architecture.md` §8 (BFS, unit edge cost) and §6.2 (the
 * win check is `isGoal` on the fully-resolved post-move state).
 */

import { describe, expect, it } from "vitest";
import type { Coord, Level } from "@/core/level";
import { coordKey } from "@/core/level";
import { applyMove } from "@/core/rules";
import { solve } from "@/core/solver/bfs";
import { DIRECTIONS, move } from "@/core/state/move";
import { initialState, isGoal, toSearchState } from "@/core/state/transitions";
import type { SearchState } from "@/core/state/types";
import { door, makeLevel, portal, switchDef } from "../helpers/fixtures";
import { makeRng } from "../helpers/search";

/**
 * Depth cap for the brute force. 8 covers every solvable 4 × 4 M0 board measured
 * here (the deepest shortest solution observed is 7) and is still cheap: the
 * naive search stops at the first successful depth.
 */
const BRUTE_MAX_DEPTH = 8;

/**
 * **Deliberately naive** shortest-solution search — iterative deepening over all
 * legal move sequences, with **no visited set** and no memoisation. If the
 * shipped solver and this function ever disagree, one of them is wrong and the
 * disagreement is the finding.
 *
 * Returns the shortest goal-reaching move count, or `null` when no goal is
 * reachable within `maxDepth`.
 */
function bruteForceShortest(level: Level, maxDepth: number): number | null {
  const start = toSearchState(initialState(level));

  const reachesGoalWithin = (s: SearchState, remaining: number): boolean => {
    if (remaining === 0) return false;
    for (const dir of DIRECTIONS) {
      const next = applyMove(level, s, move(dir));
      // Illegal ⇒ identity (ADR-0008 clause 1) ⇒ no edge, no flip, no depth spent.
      if (next === s) continue;
      if (isGoal(level, next)) return true;
      if (reachesGoalWithin(next, remaining - 1)) return true;
    }
    return false;
  };

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    if (reachesGoalWithin(start, depth)) return depth;
  }
  return null;
}

/** Seeded 4 × 4 M0-only board (walls only) — small enough for the brute force. */
function randomSmallM0Level(seed: number): Level {
  const rng = makeRng(seed);
  const cells: Coord[] = [];
  for (let x = 0; x < 4; x += 1) {
    for (let y = 0; y < 4; y += 1) cells.push([x, y] as Coord);
  }
  const pick = (): Coord => cells[Math.floor(rng() * cells.length)] as Coord;

  const player = pick();
  let goal = pick();
  while (coordKey(player) === coordKey(goal)) goal = pick();
  const isEnd = (c: Coord): boolean =>
    coordKey(c) === coordKey(player) || coordKey(c) === coordKey(goal);

  return {
    id: 7000 + seed,
    width: 4,
    height: 4,
    startPhase: rng() < 0.5 ? "A" : "B",
    player,
    goal,
    phaseAWalls: cells.filter((c) => !isEnd(c) && rng() < 0.25),
    phaseBWalls: cells.filter((c) => !isEnd(c) && rng() < 0.25),
    doors: [],
    switches: [],
    portals: [],
    par: 1,
  };
}

describe("solver optimality — 4 × 4 M0 boards vs a naive brute force", () => {
  it("agrees on every board where a comparison is decidable", () => {
    let equalToBruteForce = 0;
    let nulls = 0;
    let deeperThanBruteForce = 0;

    for (let seed = 1; seed <= 40; seed += 1) {
      const level = randomSmallM0Level(seed);
      const shortest = solve(level).shortestSolution;
      const brute = bruteForceShortest(level, BRUTE_MAX_DEPTH);

      if (shortest === null) {
        // Unsolvable for the real solver ⇒ the brute force must not find a goal
        // at all (its reachable set is the same set; it just explores it worse).
        nulls += 1;
        expect(brute, `seed ${seed}: solver says unsolvable, brute force found a goal`).toBeNull();
        continue;
      }
      if (shortest > BRUTE_MAX_DEPTH) {
        // Deeper than the brute-force budget ⇒ the only decidable claim is
        // "nothing shorter exists", which IDDFS returns as `null`.
        deeperThanBruteForce += 1;
        expect(brute, `seed ${seed}: solver=${shortest} > cap but brute found a shorter solution`).toBeNull();
        continue;
      }
      equalToBruteForce += 1;
      expect(brute, `seed ${seed}: solver=${shortest} brute=${String(brute)}`).toBe(shortest);
    }

    // Guard against a vacuous sweep: the comparisons above only mean something
    // if a real number of boards actually exercised the equality branch.
    expect(equalToBruteForce).toBeGreaterThanOrEqual(20);
    expect(nulls + deeperThanBruteForce + equalToBruteForce).toBe(40);
  });

  it("also agrees on a hand-built board whose shortest solution is forced", () => {
    // Open 3 × 3, player (0,0) → goal (2,2): exactly 4 moves, and the brute force
    // must find 4 (not 6 — the walk-with-detours answer).
    const level = makeLevel({
      width: 3,
      height: 3,
      player: [0, 0],
      goal: [2, 2],
    });
    expect(bruteForceShortest(level, BRUTE_MAX_DEPTH)).toBe(4);
    expect(solve(level).shortestSolution).toBe(4);
  });
});

describe("solver optimality — mechanic boards (M1 · M2 · M3)", () => {
  const boards: ReadonlyArray<readonly [string, Level]> = [
    [
      "red door only (M1)",
      makeLevel({
        width: 3,
        height: 3,
        player: [0, 0],
        goal: [2, 2],
        doors: [door("d1", "red", [[1, 0]])],
      }),
    ],
    [
      "door + switch latch (M3)",
      makeLevel({
        width: 5,
        height: 5,
        player: [0, 0],
        goal: [4, 4],
        doors: [door("d1", "red", [[2, 0]])],
        switches: [switchDef("s1", [1, 0], "A", ["d1"])],
      }),
    ],
    [
      "opposite-colour portal (M2)",
      makeLevel({
        width: 3,
        height: 3,
        player: [0, 0],
        goal: [2, 2],
        phaseAWalls: [[2, 0]],
        portals: [portal("p1", [1, 0], [0, 2], "A")],
      }),
    ],
  ];

  for (const [name, level] of boards) {
    it(`${name}: solver shortest === brute-force shortest`, () => {
      const shortest = solve(level).shortestSolution;
      const brute = bruteForceShortest(level, BRUTE_MAX_DEPTH);
      expect(shortest, `${name} must be solvable for this comparison`).not.toBeNull();
      expect(brute, `${name}: brute force found nothing within ${BRUTE_MAX_DEPTH}`).not.toBeNull();
      expect(brute, `${name}: solver=${String(shortest)} brute=${String(brute)}`).toBe(shortest);
    });
  }
});