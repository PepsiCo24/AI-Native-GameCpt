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
 *       `refusedBeforeEnteredTiles = 0` — and gate (iii) **FAILS on it since
 *       LV-007C**, which is the point of the switch: the gate now reads the ordered
 *       form, so a beat no player can witness no longer satisfies it. (Until
 *       LV-007C the gate read the unordered form and PASSed — GD-008 re-worded
 *       `docs/level-design.md` §3 (iii) first, and this task is the code half.)
 *   §2  The shipping-grade control: on the five shipped latch levels the two lists
 *       are **equal** (ADR-architecture-0002's coincidence measurement, now an
 *       assertion), and the ordered list is a subset of the unordered one on all
 *       ten. That equality is what makes the reader switch verdict-identical on the
 *       shipped set — asserted directly in §2b.
 *   §2b The switch has teeth *and* changes nothing shipped: every one of the ten
 *       shipped levels' gate (iii) verdict is provably the same under either reader,
 *       and the pocket flips. (Iron proof ① of LV-007C, as an assertion.)
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
 * Which readers are gated: **gate (iii) only** (LV-007C). The canonical unordered
 * metric stays the carrier of `docs/ai-native-pipeline.md` §8.5's pre-L11
 * acceptance law and of the `lesson-latch-dynamism` obligation — the two legs of
 * ADR-architecture-0002's split are deliberately not re-stitched (Appendix A3).
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

  it("gate (iii) FAILs on it — the ordered reader landed (LV-007C), so the beat is now the gate's question", () => {
    // The pocket is history-dependence without a witnessable beat: the tile answers
    // differently in two reachable states (canonical #7 fires) but no play trace can
    // contain the refusal *before* the acceptance. `docs/level-design.md` §3 (iii)
    // asks for the ordered beat and was re-worded at GD-008; LV-007C is the code
    // switch, and this is the board that proves the switch has teeth.
    const graph = explore(POCKET);
    const result = analyse(POCKET, graph);
    const gate = latchAhaGates(
      POCKET,
      graph,
      result,
      embedMetrics(POCKET, result.shortestSolution ?? POCKET.par),
    ).find((entry) => entry.id === "refused-then-entered");

    expect(result.refusedThenEnteredTiles).toBe(1);
    expect(result.refusedBeforeEnteredTiles).toBe(0);
    expect(gate?.status).toBe("FAIL");
    // The detail names both numbers, so a reader can see *which* metric carried the
    // verdict and what the other one measured — the difference is the trapped set.
    expect(gate?.detail).toContain("refusedBeforeEnteredTiles=0 tiles=[]");
    expect(gate?.detail).toContain(
      "unordered companion refusedThenEnteredTiles=1 tiles=[1,1]",
    );
  });

  it("the same board is still a documented latch — the acceptance leg did not move", () => {
    // One reader switched, the other did not: the canonical unordered metric is the
    // carrier `docs/ai-native-pipeline.md` §8.5's pre-L11 acceptance law and the
    // `lesson-latch-dynamism` obligation rest on (ADR-architecture-0002 decision 4,
    // Appendix A3 — the legs are not re-stitched). The pocket is an *L6* latch row
    // here, so no gate applies and the board is accepted — while as L8 (a level
    // claiming the Aha beat) the very same board is rejected by gate (iii).
    expect(auditLevel(POCKET).lesson?.obligation).toBe("latch-dynamism");
    expect(auditLevel(POCKET).violations).toEqual([]);
    const asAha: Level = { ...POCKET, id: 8 };
    expect(
      auditLevel(asAha).violations.map((v) => v.code),
    ).toContain("gate-refused-then-entered");
  });

  it("as an L6 latch row the pocket still ships; as an Aha #1 claim it cannot (LV-007C)", () => {
    // Recorded because the two facts live one line apart and used to be the same
    // fact: the *acceptance carrier* (canonical #7) accepts the board — a trapped
    // refusal still proves the latch is history-dependent, which is the L6 lesson —
    // while the *Aha beat* gate (iii) does not, because the beat is unorderable.
    // Both verdicts are program-measured; neither is a policy opinion.
    expect(auditLevel(POCKET).lesson?.obligation).toBe("latch-dynamism");
    expect(auditLevel(POCKET).violations).toEqual([]);
    expect(
      auditLevel({ ...POCKET, id: 8 }).violations.map((v) => v.code),
    ).toContain("gate-refused-then-entered");
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
    // Derived as a *rule* over the discovered ids, not a typed trie: the latch column
    // opens at L6 (the M3 debut) and is the dataset's contiguous tail, so a level
    // authored above L6 without a witnessed refusal still fails here (QA-011 replaced
    // the `[6…15]` literal that R-003c's registration invalidated).
    expect(latched).toEqual(SHIPPED_IDS.filter((id) => id >= 6));
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

// ─────────────────────────────────────────────────────────────────────────────
// 2b. LV-007C — the reader switch: verdict-identical on the shipped set, and it
//     really bites on a divergent board
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007C — gate (iii)'s switch to the ordered reader changes no shipped verdict", () => {
  it("both forms report equal tile lists on all ten — so no shipped gate verdict can move", () => {
    // Iron proof ①, as an assertion rather than a sentence: gate (iii) is the only
    // reader that changed, and its verdict is `refusedBeforeEnteredTiles > 0`. On
    // every shipped level the ordered list *equals* the unordered one, so the
    // verdict (and the tile list printed in the detail) is the same number either
    // way — the switch is a semantic correction that cannot reach shipped content.
    for (const id of SHIPPED_IDS) {
      const result = solve(shippedBoard(id));
      expect(result.refusedBeforeEnteredTileList, `l${id}`).toEqual([
        ...result.refusedThenEnteredTileList,
      ]);
    }
  });

  it("l008's named-gate table is unchanged, verdict for verdict", () => {
    // The exact table `tests/solver/route-budget.test.ts` pins as the n-11 baseline
    // (`refused-then-entered:PASS`) — re-asserted here so the reader switch is
    // covered from the gate's own file as well as from the metrics file.
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
    // …and the gate's detail names the ordered field, so the reader is not a matter
    // of inference from a passing verdict.
    const detail = auditLevel(shippedBoard(8)).gates.find(
      (gate) => gate.id === "refused-then-entered",
    )?.detail;
    expect(detail).toContain("refusedBeforeEnteredTiles=1 tiles=[3,1]");
  });

  it("…while the pocket flips: the switch has teeth (a mutation back turns this RED)", () => {
    // Same gate, one divergent board: `refusedThenEnteredTiles = 1` (PASS under the
    // old reader) vs `refusedBeforeEnteredTiles = 0` (FAIL under the new one). A
    // `git bisect`-proof statement of the change: exactly one of the two forms can
    // be the gate's input.
    const graph = explore(POCKET);
    const result = analyse(POCKET, graph);
    const gate = latchAhaGates(
      POCKET,
      graph,
      result,
      embedMetrics(POCKET, result.shortestSolution ?? POCKET.par),
    ).find((entry) => entry.id === "refused-then-entered");
    expect(result.refusedThenEnteredTiles).toBe(1);
    expect(result.refusedBeforeEnteredTiles).toBe(0);
    expect(gate?.status).toBe("FAIL");
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
  // LV-008 — the M2 debut: the door tile (5,0) is clicked-and-refused by the walking
  // world and accepted on the par route (the teleport is what puts the player next to it
  // in phase A), so both forms report the same single tile.
  11: { unordered: ["5,0"], ordered: ["5,0"] },
  // LV-009-B — the L12–L15 block: all four are latch boards whose switch sits just
  // inside the door it drives (a wall, a door, or a sealed line between them), so the
  // refund-first beat is orderable on 4/4 and the two readers report the same list —
  // ADR-design-0003's "refusedBeforeEntered == refusedThenEntered" leg, measured.
  // The counts climb with the ramp (3/5/5/6 tiles), which is the §5 substitute for
  // gate (i) on this block: the latch is witnessed, not merely load-bearing.
  12: { unordered: ["1,0", "2,1", "5,2"], ordered: ["1,0", "2,1", "5,2"] },
  13: {
    unordered: ["4,0", "4,1", "4,2", "4,3", "5,1"],
    ordered: ["4,0", "4,1", "4,2", "4,3", "5,1"],
  },
  14: {
    unordered: ["5,0", "5,1", "5,2", "5,3", "6,2"],
    ordered: ["5,0", "5,1", "5,2", "5,3", "6,2"],
  },
  15: {
    unordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "5,3"],
    ordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "5,3"],
  },
  // R-003c — the L16–L19 block, registered at the dataset root. All four are
  // goal-gated seals (every approach to the goal is a door), so the refusal the player
  // is meant to witness is the door line itself: the column of refused door tiles
  // (`4,0…4,5` on the first two rungs, `3,0…3,5` on the last two) plus the two or four
  // sealed entries into the goal. The two readers agree on 4/4 — the ordered list is
  // the unordered one — and the count climbs with the ramp (8/8/9/10 tiles), which is
  // this block's §5 substitute for gate (i): the latch is witnessed, not merely
  // load-bearing (`allOffGoalReachable: false` on 4/4).
  16: {
    unordered: ["4,0", "4,1", "4,2", "4,3", "4,4", "4,5", "5,1", "6,0"],
    ordered: ["4,0", "4,1", "4,2", "4,3", "4,4", "4,5", "5,1", "6,0"],
  },
  17: {
    unordered: ["4,0", "4,1", "4,2", "4,3", "4,4", "4,5", "5,5", "6,4"],
    ordered: ["4,0", "4,1", "4,2", "4,3", "4,4", "4,5", "5,5", "6,4"],
  },
  18: {
    unordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "5,1", "6,0", "6,2"],
    ordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "5,1", "6,0", "6,2"],
  },
  19: {
    unordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "4,4", "5,3", "5,5", "6,4"],
    ordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "4,4", "5,3", "5,5", "6,4"],
  },
  // R-003d / QA-014 — the block's terminal rung: the sealed landing. The refusal the
  // player is meant to witness is the *door line plus the sealed goal approaches*
  // (14 tiles, the block's widest column: the `3,0…3,5` line, `4,1`/`4,4`, and the
  // `5,0…6,4` entries on the landing's walk-sealed pocket), and the two readers agree
  // again — the ordered list is the unordered one — so ADR-0002's coincidence holds on
  // the 5th rung too. This is the block's §5 substitute for gate (i): the latch is
  // witnessed, not merely load-bearing (`allOffGoalReachable: false` measured 22/1275).
  20: {
    unordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "4,1", "4,4", "5,0", "5,2", "5,3", "5,5", "6,3", "6,4"],
    ordered: ["3,0", "3,1", "3,2", "3,3", "3,4", "3,5", "4,1", "4,4", "5,0", "5,2", "5,3", "5,5", "6,3", "6,4"],
  },
  // R-004a — Act II batch 1 (`l021`–`l025`), registered at the root. All five are latch
  // boards whose pocket/seal doors are refused before they are entered, so the ordered
  // reader equals the unordered one on 5/5 — ADR-0002's coincidence holds on the new
  // device too — and the count is the batch's measured 17-tile column. The two distinct
  // lists are the records' own: `l021`/`l024`/`l025` share one, `l022`/`l023` the other.
  // This is the batch's §5 substitute for gate (i): the latch is witnessed, not merely
  // load-bearing (`allOffGoalReachable: false` on 5/5).
  21: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
  },
  22: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,2", "5,3", "5,4", "6,1", "6,3"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,2", "5,3", "5,4", "6,1", "6,3"],
  },
  23: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,2", "5,3", "5,4", "6,1", "6,3"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,2", "5,3", "5,4", "6,1", "6,3"],
  },
  24: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
  },
  25: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,3", "6,2", "6,4"],
  },
  // R-005a — Act II batches 2 + 3 (`l026`–`l035`), graduated from the shelf to the
  // root. Both batches widen the multi-pocket device to four doors (batch 2, the
  // 3-pocket 7 × 6 frame) and five (batch 3, the `CX = 1` frame), and on all ten the
  // pocket/seal doors are still refused before they are entered, so the ordered reader
  // equals the unordered one on 10/10 — ADR-0002's coincidence holds on both new
  // skeletons — and the counts are the records' measured 19-tile (batch 2) and 22-tile
  // (batch 3) columns. The four distinct lists are the records' own (re-measured off
  // the registered bytes, not inferred): `l026`/`l027`/`l028`, `l029`/`l030`,
  // `l031`/`l032`, `l033`/`l034`/`l035`. This is each batch's §5 substitute for gate
  // (i): the latch is witnessed, not merely load-bearing (`allOffGoalReachable: false`
  // on 10/10).
  26: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
  },
  27: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
  },
  28: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,0", "3,3", "4,1", "4,2", "4,4", "4,5", "5,0", "5,1", "5,3", "5,4", "6,0", "6,2", "6,3"],
  },
  29: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,5"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,5"],
  },
  30: {
    unordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,5"],
    ordered: ["2,0", "2,1", "2,2", "2,3", "2,4", "2,5", "3,2", "3,5", "4,0", "4,1", "4,3", "4,4", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,5"],
  },
  31: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,1", "2,5", "3,0", "3,2", "3,3", "3,4", "4,0", "4,1", "4,2", "4,4", "4,5", "5,1", "5,3", "5,5", "6,2", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,1", "2,5", "3,0", "3,2", "3,3", "3,4", "4,0", "4,1", "4,2", "4,4", "4,5", "5,1", "5,3", "5,5", "6,2", "6,4"],
  },
  32: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,1", "2,5", "3,0", "3,2", "3,3", "3,4", "4,0", "4,1", "4,2", "4,4", "4,5", "5,1", "5,3", "5,5", "6,2", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,1", "2,5", "3,0", "3,2", "3,3", "3,4", "4,0", "4,1", "4,2", "4,4", "4,5", "5,1", "5,3", "5,5", "6,2", "6,4"],
  },
  33: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
  },
  34: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
  },
  35: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "2,2", "2,5", "3,1", "3,3", "3,4", "4,0", "4,2", "4,3", "4,5", "5,1", "5,2", "5,4", "5,5", "6,2", "6,3", "6,4"],
  },
  // R-006a — Act II batch 4 (`l036`–`l040`), the act's closing rungs, registered at the
  // root. The device is batch 3's device class, unchanged — the 4-pocket / 5-door /
  // forced 5-press chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`) — read on
  // §7.4's second, unused frame `7 × 7` at `CX = 1` (batch 3 read `7 × 6`), coverage
  // 49/49 ×5, so the pocket/seal doors are still refused
  // before they are entered and the ordered reader equals the unordered one on 5/5 —
  // ADR-0002's coincidence holds on this frame too. The counts are the records' measured
  // 25-tile column on four rungs and 24 on the closing rung. The records' own groups:
  // `l036`/`l039`, `l037`/`l038`, and `l040`. This is the batch's §5 substitute for
  // gate (i): the latch is witnessed, not merely load-bearing (`allOffGoalReachable:
  // false` on 5/5, with an 11-state all-OFF sink — no goal state).
  36: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,4", "3,1", "3,3", "3,5", "3,6", "4,2", "4,4", "4,5", "5,1", "5,2", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,6"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,4", "3,1", "3,3", "3,5", "3,6", "4,2", "4,4", "4,5", "5,1", "5,2", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,6"],
  },
  37: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,6", "3,0", "3,1", "3,3", "3,4", "3,5", "4,1", "4,2", "4,3", "4,5", "4,6", "5,2", "5,3", "5,4", "6,1", "6,2", "6,4"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,6", "3,0", "3,1", "3,3", "3,4", "3,5", "4,1", "4,2", "4,3", "4,5", "4,6", "5,2", "5,3", "5,4", "6,1", "6,2", "6,4"],
  },
  38: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,5", "3,0", "3,1", "3,3", "3,4", "3,6", "4,1", "4,2", "4,5", "4,6", "5,2", "5,4", "5,5", "6,1", "6,3", "6,5", "6,6"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,5", "3,0", "3,1", "3,3", "3,4", "3,6", "4,1", "4,2", "4,5", "4,6", "5,2", "5,4", "5,5", "6,1", "6,3", "6,5", "6,6"],
  },
  39: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,4", "3,1", "3,3", "3,5", "3,6", "4,2", "4,4", "4,5", "5,1", "5,2", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,6"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,4", "3,1", "3,3", "3,5", "3,6", "4,2", "4,4", "4,5", "5,1", "5,2", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,6"],
  },
  40: {
    unordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,6", "3,1", "3,5", "4,2", "4,4", "4,6", "5,1", "5,2", "5,3", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,5"],
    ordered: ["1,0", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,0", "2,6", "3,1", "3,5", "4,2", "4,4", "4,6", "5,1", "5,2", "5,3", "5,5", "5,6", "6,0", "6,1", "6,3", "6,4", "6,5"],
  },
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