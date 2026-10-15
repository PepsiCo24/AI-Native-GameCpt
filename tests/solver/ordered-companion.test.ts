/**
 * LV-007B · item 2 — the **ordered companion** of metric #7:
 * `refusedBeforeEnteredTiles`.
 *
 * ── THE DEFECT THIS FILE PINS ────────────────────────────────────────────────
 * `refusedThenEnteredTiles` (ADR-0009 metric #7, canonical since
 * ADR-architecture-0002) is an **unordered** state-set metric: a tile counts when
 * its click was refused in *some* reachable state and accepted in *some* other.
 * That is history-dependence, but it is not yet a **decision the player can make**:
 * a *trapped refusal* satisfies both halves while the refusal can never precede the
 * acceptance. The canonical case is a latch whose switch sits on the very tile of
 * the door it drives — pressing it closes the pocket, so the refusal is only ever
 * seen *after* the acceptance.
 *
 * The ordered companion answers the decision question instead:
 *
 *     ∃ r ∈ Refused(t), a ∈ Accepted(t) : r →* a        (same tile at both ends)
 *
 * ── WHAT IS PINNED HERE ──────────────────────────────────────────────────────
 *   §1  The trapped-refusal pocket (`docs/architecture.md` §8.1's open case): a
 *       board the *validator* accepts with zero warnings, whose switch really
 *       fires, with `refusedThenEnteredTiles = 1` and
 *       `refusedBeforeEnteredTiles = 0` — and gate (iii) still PASSes on it, which
 *       is the point: **the acceptance law reads the unordered metric** (the switch
 *       is GD-008's wording pass, not this task's).
 *   §2  The shipping-grade control: on the five shipped latch levels the two lists
 *       are **equal** (ADR-architecture-0002's coincidence measurement, now an
 *       assertion), and the ordered list is a subset of the unordered one on all ten.
 *   §3  Plumbing: `analyse` reports exactly what the graph-level function returns.
 *   §4  A genuine minimal latch (M1 + M3) where *both* metrics fire, so §1's zero
 *       is discrimination and not a broken measurement.
 *   §5  The honest limitation. Over 2000 seeded one-door-one-switch boards the
 *       companion is a **strict refinement** (never larger), and the disagreement
 *       is *mostly* — but **not entirely** — explained by the self-closing latch:
 *       46/2000 diverge, 44 of them have the door tile also serving as the switch
 *       tile, and **2 do not** (seeds 187 and 1228). The structural story is
 *       therefore a *reliable* explanation, not a proved one, and it is recorded as
 *       such instead of being rounded up into a theorem.
 *
 * Nothing here is gated on the ordered metric: it is reported (`SolveResult`,
 * `scripts/solve-levels.ts`) and it is what an L11+ / GD-008 re-wording would
 * promote — never a hard rejection rule before that ruling exists.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Coord, Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import {
  analyse,
  clickLedger,
  embedMetrics,
  explore,
  refusedBeforeEnteredTiles,
  refusedThenEnteredTiles,
  solve,
} from "@/core/solver/bfs";
import { auditLevel, firingSwitches, latchAhaGates } from "@/core/solver/policy";
import { door, makeLevel, switchDef } from "../helpers/fixtures";
import { makeRng } from "../helpers/search";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

const SHIPPED_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

function shippedBoard(id: number): Level {
  const raw = JSON.parse(
    readFileSync(`${LEVELS_DIR}l${String(id).padStart(3, "0")}.json`, "utf8"),
  ) as Level;
  expect(validateLevel(raw).ok, `l${String(id).padStart(3, "0")}`).toBe(true);
  return raw;
}

const SHIPPED_CASES = SHIPPED_IDS.map(
  (id) => [String(id).padStart(3, "0"), id] as const,
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. The trapped-refusal pocket
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The pocket, hand-built and *minimal*: a 5 × 3 corridor, player `(0,1)` → goal
 * `(4,1)`, a **red** door on `(1,1)` and its switch **on that same tile**
 * (`activePhase: "A"`, so it is current exactly when the player steps onto
 * `(1,1)` in phase A — which is also when the red door is closed in B… the tile is
 * the door *and* the switch, i.e. the latch closes over its own press).
 *
 * Structural reason the refusal cannot come first: the only states that click
 * `(1,1)` are its neighbours, and the tile's own acceptance is decided by switch
 * state that can only be latched *by clicking it*, so every accepted-click state is
 * reachable only from a state where the click was itself accepted — the refused
 * half exists (measured) but never precedes.
 *
 * `id: 6` on purpose: L6 is the shipped latch lesson (`latch-dynamism`, with
 * `switchRequired` recorded as the §6 dip), i.e. exactly the documented row a board
 * like this would be submitted against.
 */
const POCKET: Level = makeLevel({
  id: 6,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 1] as Coord,
  goal: [4, 1] as Coord,
  doors: [door("d1", "red", [[1, 1]])],
  switches: [switchDef("s1", [1, 1], "A", ["d1"])],
  par: 4,
});

describe("LV-007B · item 2 — a trapped refusal is history-dependence, not a decision", () => {
  it("the pocket is a legal board: the validator accepts it with no warning at all", () => {
    const verdict = validateLevel(POCKET);
    expect(verdict.ok).toBe(true);
    expect(verdict.warnings).toEqual([]);
    expect(solve(POCKET).shortestSolution).toBe(4); // …and it solves
    expect(solve(POCKET).reachableStates).toBe(29);
  });

  it("the latch is real — the switch fires and the metric #7 pair disagrees", () => {
    const result = solve(POCKET);
    // Metric #7 (unordered, canonical): the tile answers differently in two
    // reachable states, so it counts.
    expect(result.refusedThenEnteredTiles).toBe(1);
    expect(result.refusedThenEnteredTileList).toEqual(["1,1"]);
    // The ordered companion: no refusal can be reached *before* the acceptance,
    // because the only way to make `(1,1)` accept is to stand on it — which is the
    // click the refusal denies.
    expect(result.refusedBeforeEnteredTiles).toBe(0);
    expect(result.refusedBeforeEnteredTileList).toEqual([]);
    // The switch is not inert (so this is not the `switch-never-fires` control) and
    // the door is not untargeted: the pocket is a *working* latch that simply cannot
    // be met in the refused state first.
    expect(firingSwitches(POCKET, explore(POCKET)).has("s1")).toBe(true);
    expect(auditLevel(POCKET).violations).toEqual([]);
  });

  it("gate (iii) PASSes on it — the acceptance law reads the UNORDERED metric", () => {
    // This is the pin the docs must keep saying (docs/ai-native-pipeline.md §8.5):
    // gate (iii) is satisfied by `refusedThenEnteredTiles > 0`, so a trapped
    // refusal passes the gate even though no player can ever act on it. Switching
    // the gate to the ordered companion is a *wording pass* on the latch lessons
    // (§6 dip, L7–L10 `switchRequired`) — GD-008's call, not the solver's.
    const graph = explore(POCKET);
    const result = analyse(POCKET, graph);
    const gate = latchAhaGates(
      POCKET,
      graph,
      result,
      embedMetrics(POCKET, result.shortestSolution ?? POCKET.par),
    ).find((entry) => entry.id === "refused-then-entered");

    expect(result.refusedBeforeEnteredTiles).toBe(0);
    expect(gate?.status).toBe("PASS");
    // …and the gate's own words name the unordered metric, so a reader cannot
    // mistake which number carried the verdict.
    expect(gate?.detail).toBe("refusedThenEnteredTiles=1 tiles=[1,1]");
  });

  it("the policy suite would ship the pocket as an L6 latch (the gap GD-008 owns)", () => {
    // Reported as a finding, not repaired here: nothing in `policy.ts` rejects a
    // board whose latch is unorderable. The board above is what such a submission
    // looks like — valid, solvable, switch-firing, documented row satisfied, and
    // yet unreachable in the refused state first. Only the ordered companion sees
    // it, which is why the companion exists.
    expect(auditLevel(POCKET).lesson?.obligation).toBe("latch-dynamism");
    expect(auditLevel(POCKET).violations).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The shipping-grade control: on the shipped latches both metrics agree
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · item 2 — the shipped latch levels are orderable latches", () => {
  it("the ordered list is a subset of the unordered one on all ten shipped boards", () => {
    for (const id of SHIPPED_IDS) {
      const result = solve(shippedBoard(id));
      const unordered = new Set(result.refusedThenEnteredTileList);
      for (const tile of result.refusedBeforeEnteredTileList) {
        expect(
          unordered.has(tile),
          `l${id}: "${tile}" is ordered-but-not-unordered — that would break the refinement law`,
        ).toBe(true);
      }
      expect(result.refusedBeforeEnteredTiles, `l${id}`).toBeLessThanOrEqual(
        result.refusedThenEnteredTiles,
      );
      expect(result.refusedBeforeEnteredTileList.length, `l${id}`).toBe(
        result.refusedBeforeEnteredTiles,
      );
    }
  });

  it.each(SHIPPED_CASES)(
    "l%s — measured ordered list (equal to the unordered one, ADR-0002's coincidence)",
    (_label, id) => {
      const result = solve(shippedBoard(id));
      expect({
        unordered: result.refusedThenEnteredTileList,
        ordered: result.refusedBeforeEnteredTileList,
      }).toEqual(ORDERED_PINS[id]);
    },
  );

  it("the coincidence is a property of these boards, not of the metric pair", () => {
    // Restated as a class claim so the pocket cannot be misread as an anomaly of
    // *counting*: the two functions agree wherever the shipped latches put their
    // switches (on the natural path, adjacent to the door they drive), and disagree
    // exactly where a refusal cannot precede an acceptance.
    const latched = SHIPPED_IDS.filter(
      (id) => solve(shippedBoard(id)).refusedThenEnteredTiles > 0,
    );
    expect(latched).toEqual([6, 7, 8, 9, 10]);
    for (const id of latched) {
      const result = solve(shippedBoard(id));
      expect(result.refusedBeforeEnteredTileList, `l${id}`).toEqual(
        result.refusedThenEnteredTileList,
      );
    }
    expect(solve(POCKET).refusedBeforeEnteredTileList).not.toEqual(
      solve(POCKET).refusedThenEnteredTileList,
    );
  });
});

/** Measured ordered lists — `[]` on the five levels that never refuse a click. */
const ORDERED_PINS: Readonly<
  Record<number, { readonly unordered: readonly string[]; readonly ordered: readonly string[] }>
> = {
  1: { unordered: [], ordered: [] },
  2: { unordered: [], ordered: [] },
  3: { unordered: [], ordered: [] },
  4: { unordered: [], ordered: [] },
  5: { unordered: [], ordered: [] },
  6: { unordered: ["3,1"], ordered: ["3,1"] },
  7: { unordered: ["1,1"], ordered: ["1,1"] },
  8: { unordered: ["3,1"], ordered: ["3,1"] },
  9: { unordered: ["2,2", "4,1"], ordered: ["2,2", "4,1"] },
  10: { unordered: ["4,1"], ordered: ["4,1"] },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Plumbing — the report is the graph-level measurement, not a second opinion
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · item 2 — `analyse` reports the graph-level measurement verbatim", () => {
  it.each([
    ["pocket", POCKET],
    ["opened latch (M1+M3 minimal)", OPEN_LATCH],
    ["open corridor (no refusal at all)", OPEN_CORRIDOR],
  ] as const)("%s — the two functions agree with the report", (_label, level) => {
    const graph = explore(level);
    const result = analyse(level, graph);
    expect(result.refusedThenEnteredTileList).toEqual(
      refusedThenEnteredTiles(graph),
    );
    expect(result.refusedBeforeEnteredTileList).toEqual(
      refusedBeforeEnteredTiles(graph),
    );
    expect(result.refusedBeforeEnteredTiles).toBe(
      result.refusedBeforeEnteredTileList.length,
    );
    expect(result.refusedBeforeEnteredTiles).toBeLessThanOrEqual(
      result.refusedThenEnteredTiles,
    );
  });

  it("this did not disturb metric #7 itself (the canonical numbers are untouched)", () => {
    // `clickLedger` was refactored to share its per-tile primitive with the ordered
    // companion, so the canonical metric must be unchanged: same tiles, same
    // sorted contract, and the same per-tile record — including on the pocket, where
    // the tile really is *both* refused and accepted.
    for (const id of SHIPPED_IDS) {
      const result = solve(shippedBoard(id));
      expect(result.refusedThenEnteredTileList, `l${id}`).toEqual(
        [...result.refusedThenEnteredTileList].sort(),
      );
      expect(result.refusedThenEnteredTiles, `l${id}`).toBe(
        result.refusedThenEnteredTileList.length,
      );
    }

    const ledger = clickLedger(explore(POCKET));
    expect(ledger.get("1,1")).toEqual({ refused: true, accepted: true });
    for (const record of ledger.values())
      expect(record.refused || record.accepted).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. A genuine latch: both metrics fire (so §1's zero is discrimination)
// ─────────────────────────────────────────────────────────────────────────────

/** M1 + M3 minimal teaching unit: red door on `(2,0)`, its switch on `(1,0)`. */
const OPEN_LATCH: Level = makeLevel({
  width: 5,
  height: 5,
  player: [0, 0] as Coord,
  goal: [4, 4] as Coord,
  doors: [door("d1", "red", [[2, 0]])],
  switches: [switchDef("s1", [1, 0], "A", ["d1"])],
});

/** Nothing is ever refused here, so both metrics must be 0 (the zero control). */
const OPEN_CORRIDOR: Level = makeLevel({
  width: 5,
  height: 3,
  player: [0, 1] as Coord,
  goal: [4, 1] as Coord,
});

describe("LV-007B · item 2 — discrimination: an orderable latch fires both metrics", () => {
  it("the minimal door + switch board has a refusal that really comes first", () => {
    const result = solve(OPEN_LATCH);
    expect(result.refusedThenEnteredTiles).toBeGreaterThan(0);
    expect(result.refusedBeforeEnteredTileList).toContain("2,0");
    expect(result.refusedBeforeEnteredTiles).toBeGreaterThan(0);
    expect(validateLevel(OPEN_LATCH).ok).toBe(true);
  });

  it("a refuse-free corridor is 0 on both (neither metric is a tautology)", () => {
    const result = solve(OPEN_CORRIDOR);
    expect(result.refusedThenEnteredTiles).toBe(0);
    expect(result.refusedBeforeEnteredTiles).toBe(0);
    expect(result.solvable).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. The honest limitation — measured over 2000 seeded latch boards
// ─────────────────────────────────────────────────────────────────────────────

/** One-door-one-switch board, seeded (`docs/architecture.md` §8.1's generator shape). */
function randomLatch(seed: number): Level {
  const rng = makeRng(seed);
  const width = 3 + Math.floor(rng() * 5);
  const height = 3 + Math.floor(rng() * 5);
  const cells: Coord[] = [];
  for (let x = 0; x < width; x += 1)
    for (let y = 0; y < height; y += 1) cells.push([x, y] as Coord);
  const pick = (): Coord => cells[Math.floor(rng() * cells.length)] as Coord;
  const player = pick();
  let goal = pick();
  while (goal[0] === player[0] && goal[1] === player[1]) goal = pick();
  const isEnd = (c: Coord): boolean =>
    (c[0] === player[0] && c[1] === player[1]) ||
    (c[0] === goal[0] && c[1] === goal[1]);
  const interior = cells.filter((c) => !isEnd(c));
  const phaseAWalls = cells.filter((c) => !isEnd(c) && rng() < 0.2);
  const phaseBWalls = cells.filter((c) => !isEnd(c) && rng() < 0.2);
  const doorTile = interior[Math.floor(rng() * interior.length)] as Coord;
  const switchTile = interior[Math.floor(rng() * interior.length)] as Coord;
  const distance =
    Math.abs(switchTile[0] - player[0]) + Math.abs(switchTile[1] - player[1]);

  return makeLevel({
    id: 9_100 + seed,
    width,
    height,
    startPhase: "A",
    player,
    goal,
    phaseAWalls,
    phaseBWalls,
    doors: [
      { id: "d1", color: rng() < 0.5 ? "red" : "blue", tiles: [doorTile] },
    ],
    switches: [
      {
        id: "s1",
        tile: switchTile,
        // Entry phase is decided by the chessboard parity of the move count, so the
        // switch is made current on the parity it is actually reachable in — the
        // point of the sweep is the *metric*, not `switch-never-fires`.
        activePhase: distance % 2 === 1 ? "A" : "B",
        targets: ["d1"],
      },
    ],
    portals: [],
    par: 1,
  });
}

describe("LV-007B · item 2 — the refinement is strict, and its structure is not fully proved", () => {
  const SWEEP = (() => {
    let divergence = 0;
    let overlapBoards = 0;
    let overlapDivergence = 0;
    const divergenceWithoutOverlap: number[] = [];
    for (let seed = 1; seed <= 2000; seed += 1) {
      const level = randomLatch(seed);
      const graph = explore(level);
      const result = analyse(level, graph);
      const doorIsAlsoSwitch = level.doors.some((entry) =>
        level.switches.some(
          (sw) =>
            sw.tile[0] === entry.tiles[0]?.[0] &&
            sw.tile[1] === entry.tiles[0]?.[1],
        ),
      );
      if (doorIsAlsoSwitch) overlapBoards += 1;

      // The refinement law, checked on every board of the sweep: the ordered tile
      // set can never contain a tile the unordered one does not.
      expect(result.refusedBeforeEnteredTiles).toBeLessThanOrEqual(
        result.refusedThenEnteredTiles,
      );

      if (result.refusedThenEnteredTiles === 0) continue;
      if (result.refusedBeforeEnteredTiles > 0) continue;
      divergence += 1;
      if (doorIsAlsoSwitch) overlapDivergence += 1;
      else divergenceWithoutOverlap.push(seed);
    }
    return {
      divergence,
      overlapBoards,
      overlapDivergence,
      divergenceWithoutOverlap,
    };
  })();

  it("46/2000 boards diverge — history-dependence the player cannot act on", () => {
    expect(SWEEP.divergence).toBe(46);
  });

  it("44 of the 46 are explained by the self-closing latch (door tile = switch tile)", () => {
    expect(SWEEP.overlapBoards).toBe(119);
    expect(SWEEP.overlapDivergence).toBe(44);
  });

  it("…but 2 are NOT (seeds 187, 1228) — the explanation is reliable, not complete", () => {
    // Recorded so nobody promotes the structural story into a theorem: the ordered
    // companion is *measured*, and two boards in this very sweep diverge with the
    // door and the switch on different tiles. Characterizing them exactly is left
    // open on purpose (OPEN_QUESTIONS → Architect / Game Designer) instead of being
    // hidden behind a rounded number.
    expect(SWEEP.divergenceWithoutOverlap).toEqual([187, 1228]);
  });
});