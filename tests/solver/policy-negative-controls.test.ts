/**
 * LV-007A · RV-004 **m-2** — one negative control per policy code
 * (`@/core/solver/policy`, `POLICY_VIOLATION_CODES`).
 *
 * Why this file exists: RV-004 re-ran the suite with a deliberately mutated
 * analyzer (`result.refusedThenEnteredTiles === 0` → `false`, i.e. the
 * `lesson-latch-dynamism` check disabled) and **176 tests stayed green** — the
 * policy module claimed to be "pinned by tests", but five of its codes had no
 * control that fails when the code stops firing. "Pinned by tests" must mean: for
 * every code, there is a board that is *rejected by that exact name*, so deleting
 * or neutering the check turns the suite RED.
 *
 * What is enforced here:
 *
 * 1. **Coverage** — `NEGATIVE_CONTROLS` is typed `Record<PolicyViolationCode, …>`
 *    (keyed by the inventory in `policy.ts`), so a new code that is not given a
 *    control is a **compile error**, and every entry is then *measured*: the board
 *    must produce that code (and nothing exotic: several controls assert the
 *    violation list exactly, so they cannot pass for an unrelated reason).
 * 2. **Discrimination** — each control is paired with the *shipped* board carrying
 *    the same documented lesson, which must NOT be rejected. A check that rejects
 *    everything is as useless as a check that rejects nothing.
 * 3. **No silent code** — a source scan of `policy.ts` fails if a `code: "…"`
 *    literal or a named-gate id is emitted without being listed in
 *    `POLICY_VIOLATION_CODES`.
 *
 * These are the *hypothetical* boards the rules allow us to write: a negative
 * control is a Level object handed straight to `auditLevel`, never shipped content
 * (ADR-0004 — reject, never repair; this file only ever rejects).
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import type { PolicyViolationCode } from "@/core/solver/policy";
import {
  DOCUMENTED_LESSONS,
  POLICY_VIOLATION_CODES,
  auditLevel,
  firingSwitches,
  latchAhaGates,
} from "@/core/solver/policy";
import { analyse, embedMetrics, explore } from "@/core/solver/bfs";
import { door, makeLevel, switchDef } from "../helpers/fixtures";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

/** Every shipped level id, read from the dataset (never a hardcoded ladder). */
const SHIPPED_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

/** A shipped level's board, schema-validated first (the documented lesson travels with the id). */
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

// ─────────────────────────────────────────────────────────────────────────────
// Control boards (each one isolates exactly one code)
// ─────────────────────────────────────────────────────────────────────────────

/** M1 alone: a door nobody drives. */
const DOOR_WITHOUT_SWITCH: Level = makeLevel({
  id: 900,
  width: 5,
  height: 3,
  player: [0, 1],
  goal: [4, 1],
  doors: [door("d1", "blue", [[3, 1]])],
});

/**
 * Inert latch: `(1,1)` is entered in phase A only (Manhattan distance 1 ⇒ entry
 * phase A, ADR-0009 decision 1), so an `activePhase: "B"` switch sitting there can
 * never be current — dead data that still *looks* like a circuit.
 */
const INERT_SWITCH: Level = makeLevel({
  id: 900,
  width: 5,
  height: 3,
  player: [0, 1],
  goal: [4, 1],
  doors: [door("d1", "blue", [[3, 1]])],
  switches: [switchDef("s1", [1, 1], "B", ["d1"])],
});

/**
 * The documented **FORCED** phantom walk (`l005`, obligation `phantom-walk-forced`)
 * with a board that has no echo at all: documentation and board disagree.
 */
const FORCED_LESSON_WITHOUT_ECHO: Level = makeLevel({
  id: 5,
  width: 5,
  height: 3,
  player: [0, 1],
  goal: [4, 1],
  par: 4,
});

/**
 * The documented **OFFERED** phantom walk (`l004`) delivered by a board that
 * *forces* it: `l005`'s shipped board (3/3 shortest routes embed) re-labelled as
 * the offered lesson. Same code, opposite defect from the previous control.
 */
const OFFERED_LESSON_WITH_FORCED_BOARD: Level = {
  ...shippedBoard(5),
  id: 4,
};

/**
 * A board documented as a **latch** level that is mechanically static.
 *
 * Construction (why `refusedThenEnteredTiles` is really 0 here, measured not
 * argued): the blue door at `(1,0)` has exactly three neighbours — `(0,0)`,
 * `(2,0)` and `(1,1)` — and all three are walls in **both** phases, so no
 * reachable state ever stands next to the door and the door tile is therefore
 * never *clicked*. `refusedThenEnteredTiles` is a **clicked**-tile metric
 * (`@/core/solver/bfs`), so it is 0 by construction while every other policy
 * check passes: the switch at `(2,1)` targets the door and really fires
 * (`d(2,1) = 2` ⇒ entry phase B = its `activePhase`). This is the board type the
 * mutation above could not be caught by: the latch exists as data, not as a
 * decision.
 */
const LATCH_LESSON_WITH_STATIC_BOARD: Level = {
  id: 6,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 1],
  goal: [4, 1],
  phaseAWalls: [
    [0, 0],
    [2, 0],
    [1, 1],
  ],
  phaseBWalls: [
    [0, 0],
    [2, 0],
    [1, 1],
  ],
  doors: [door("d1", "blue", [[1, 0]])],
  switches: [switchDef("s1", [2, 1], "B", ["d1"])],
  portals: [],
  par: 6,
};

const STATIC_BOARD_AS_AHA: Level = { ...LATCH_LESSON_WITH_STATIC_BOARD, id: 8 };

/**
 * **The trapped-refusal control (LV-007C)** — the board that gives gate (iii)'s
 * reader switch its teeth. It is `tests/solver/ordered-companion.test.ts` §1's
 * pocket, re-labelled as the Aha #1 level: a red door on `(1,1)` whose switch sits
 * on **that same tile** (`activePhase: "A"`, i.e. current exactly when the player
 * steps onto `(1,1)`), so the latch closes over its own press.
 *
 * Measured: `refusedThenEnteredTiles = 1`, `refusedBeforeEnteredTiles = 0` — the
 * tile really does answer differently in two reachable states (canonical #7 fires,
 * so `lesson-latch-dynamism` is satisfied and the board is a *working* latch), but
 * no play trace can contain the refusal *before* the acceptance, because the only
 * way to make `(1,1)` accept is to stand on it. Under the unordered reader this
 * board PASSed gate (iii); under the ordered reader it FAILS by name — which is
 * the whole point of the switch, and the mutation guard for it: re-pointing gate
 * (iii) back at `refusedThenEnteredTiles` turns this control green and the
 * coverage assertion in §1 RED.
 */
const TRAPPED_REFUSAL_AS_AHA: Level = makeLevel({
  id: 8,
  width: 5,
  height: 3,
  startPhase: "A",
  player: [0, 1],
  goal: [4, 1],
  doors: [door("d1", "red", [[1, 1]])],
  switches: [switchDef("s1", [1, 1], "A", ["d1"])],
  par: 4,
});

/**
 * A board documented as **Aha #1** whose shortest solutions can *walk around* the
 * door: the goal row is open on both sides, so the latch is not what carries the
 * decision (`allOffGoalReachable === true` — the un-switched world wins too).
 */
const AHA_LESSON_WITH_BYPASS: Level = makeLevel({
  id: 8,
  width: 5,
  height: 3,
  player: [0, 1],
  goal: [4, 1],
  doors: [door("d1", "blue", [[3, 1]])],
  switches: [switchDef("s1", [2, 0], "A", ["d1"])],
  par: 4,
});

/**
 * A board documented as **Aha #1** that carries a portal which can never be used
 * (its two ends form a sealed pocket, so they are never entered): `dualPhaseTiles`
 * is measured 0 while `portals.length > 0`. This is the *only* way gate (iv) can
 * reach its FAIL branch — and the branch must be reachable, otherwise
 * `UNSATISFIABLE` would silently excuse a real failure on any board that merely
 * mentions M2.
 */
const AHA_LESSON_WITH_INERT_PORTAL: Level = {
  ...shippedBoard(8),
  phaseAWalls: [
    [4, 0],
    [4, 2],
    [0, 2],
    [1, 2],
    [2, 3],
  ],
  phaseBWalls: [
    [0, 2],
    [1, 2],
    [2, 3],
  ],
  portals: [{ id: "p1", pair: [[0, 3], [1, 3]], activePhase: "A" }],
};

/** The gate-(i) control `tests/solver/latch-gates.test.ts` already carried. */
const AHA_LESSON_WITHOUT_FUNNEL: Level = AHA_LESSON_WITH_BYPASS;

/**
 * The §3 construction bullets, broken on purpose (LV-007A n-14).
 *
 * `AHA_LESSON_WITH_TWO_DOORS`: the shipped `l008` board plus a second door,
 * both driven by one switch — everything measured still passes, only the
 * "one door + one switch" construction does not. (This is deliberately *L9-like*
 * content wearing an Aha #1 declaration: the funnel rule exists to catch exactly
 * that mislabel.)
 */
const AHA_LESSON_WITH_TWO_DOORS: Level = {
  ...shippedBoard(8),
  doors: [
    { id: "d1", color: "blue", tiles: [[3, 1]] },
    { id: "d2", color: "red", tiles: [[3, 2]] },
  ],
  switches: [
    { id: "s1", tile: [2, 0], activePhase: "A", targets: ["d1", "d2"] },
  ],
};

/**
 * `AHA_LESSON_OVER_PAR_CAP`: the shipped, gate-clean `l008` board with `par: 9`
 * (the board itself is untouched and still solves in 6), so the par cap is the one
 * and only thing wrong with the candidate.
 */
const AHA_LESSON_OVER_PAR_CAP: Level = { ...shippedBoard(8), par: 9 };

/**
 * A switch nobody reads (LV-007B item 4 · n-13): `s1` sits on `(1,1)`, d = 1 ⇒
 * entered in phase A (ADR-0009 decision 1), which is exactly its `activePhase`, so
 * the toggle **really happens** — `applyMove` flips `switchesOn` whether or not the
 * switch has targets. That is why `switch-never-fires` cannot catch this board: the
 * latch is live. What makes it invalid is that `doors[]` is empty, so the switch
 * changes nothing at all.
 *
 * The board is schema- and rule-legal *with a warning* — the frozen validator says
 * `switches[0] "s1" has no targets — the switch can never change anything (inert)`
 * and returns `ok: true`. That difference is the point of the control: a warning is
 * not a gate, so the rejection has to live in the policy layer.
 */
const SWITCH_WITHOUT_TARGETS: Level = makeLevel({
  id: 900,
  width: 5,
  height: 3,
  player: [0, 1],
  goal: [4, 1],
  switches: [switchDef("s1", [1, 1], "A", [])],
});

/**
 * The documented **dip**, used as a negative control by re-labelling (LV-007A ·
 * OQ4 ruling): `l006`'s shipped board is solver-verified
 * `refusedThenEnteredTiles = 1`, so it genuinely teaches the latch and
 * `lesson-latch-dynamism` is satisfied — but its un-switched world still solves
 * (6, the §6 dip), i.e. `allOffGoalReachable === true`. As **L7** that board
 * carries a lesson row whose `switchRequired` is `"required"`, so the documented
 * promise and the measurement disagree and *that* is the one and only complaint.
 * Nothing else is wrong with it (`par`, gates and the latch lesson all still
 * hold), which is what makes this control surgical.
 */
const REQUIRED_LESSON_WITH_DECORATIVE_LATCH: Level = { ...shippedBoard(6), id: 7 };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Coverage — typed by the inventory, measured by the analyzer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `Record<PolicyViolationCode, …>` is the compile-time half of the pin: adding a
 * code to `policy.ts` without giving it a control stops `tsc` (AGENTS.md §7 — a
 * claim needs a test, and this one cannot be forgotten).
 */
const NEGATIVE_CONTROLS: Readonly<Record<PolicyViolationCode, readonly Level[]>> =
  {
    "door-without-switch": [DOOR_WITHOUT_SWITCH],
    "switch-without-targets": [SWITCH_WITHOUT_TARGETS],
    "switch-never-fires": [INERT_SWITCH],
    "lesson-phantom-walk-forced": [FORCED_LESSON_WITHOUT_ECHO],
    "lesson-phantom-walk-offered": [
      FORCED_LESSON_WITHOUT_ECHO,
      OFFERED_LESSON_WITH_FORCED_BOARD,
    ],
    "lesson-latch-dynamism": [LATCH_LESSON_WITH_STATIC_BOARD],
    "lesson-switch-required": [REQUIRED_LESSON_WITH_DECORATIVE_LATCH],
    "gate-no-solution-with-switches-off": [AHA_LESSON_WITHOUT_FUNNEL],
    "gate-shortest-solution-presses-switch-and-crosses-door": [
      AHA_LESSON_WITH_BYPASS,
    ],
    "gate-refused-then-entered": [
      STATIC_BOARD_AS_AHA,
      TRAPPED_REFUSAL_AS_AHA,
    ],
    "gate-dual-phase-tiles": [AHA_LESSON_WITH_INERT_PORTAL],
    "gate-single-door-one-switch-funnel": [AHA_LESSON_WITH_TWO_DOORS],
    "gate-aha-par-cap": [AHA_LESSON_OVER_PAR_CAP],
  };

describe("LV-007A · m-2 — every policy code has a negative control that fails when the check is disabled", () => {
  it("the inventory and the control table cover exactly the same codes", () => {
    expect(Object.keys(NEGATIVE_CONTROLS).sort()).toEqual(
      [...POLICY_VIOLATION_CODES].sort(),
    );
  });

  it.each([...POLICY_VIOLATION_CODES])(
    "%s — a board is rejected by that exact code",
    (code) => {
      const boards = NEGATIVE_CONTROLS[code];
      expect(boards.length).toBeGreaterThan(0);
      const fired = boards.filter((board) =>
        auditLevel(board).violations.some((v) => v.code === code),
      );
      expect(
        fired.length,
        `no control board produced the code "${code}" — the check is unpinned (a mutated check would stay green)`,
      ).toBeGreaterThan(0);
    },
  );

  it("no control board is rejected for an unrelated reason only (each code is isolated)", () => {
    // Three controls are deliberately *exact*: they fire one code and nothing else,
    // so the code name — not a side effect — is what the assertion is reading.
    const exact = [
      LATCH_LESSON_WITH_STATIC_BOARD,
      AHA_LESSON_WITH_INERT_PORTAL,
      FORCED_LESSON_WITHOUT_ECHO,
    ];
    for (const board of exact) {
      expect(
        auditLevel(board)
          .violations.map((v) => v.code)
          .sort(),
        `board id=${board.id}`,
      ).toEqual(
        board === FORCED_LESSON_WITHOUT_ECHO
          ? ["lesson-phantom-walk-forced"]
          : board === AHA_LESSON_WITH_INERT_PORTAL
            ? ["gate-dual-phase-tiles"]
            : ["lesson-latch-dynamism"],
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Discrimination — the shipped board for the same lesson must NOT be rejected
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007A · m-2 — each control is paired with the shipped board it must not reject", () => {
  it("l004 (OFFERED) is accepted, the forced board carrying the same id is not", () => {
    const offered = auditLevel(shippedBoard(4));
    expect(offered.embeds.parRoutes).toBeGreaterThan(1);
    expect(offered.embeds.embedRoutes).toBeGreaterThan(0);
    expect(offered.embeds.embedForced).toBe(false);
    expect(offered.violations).toEqual([]);
    // …and the control only differs in the *board*, never in the obligation: the id
    // is the same, so the analyzer is reading the metrics.
    expect(OFFERED_LESSON_WITH_FORCED_BOARD.id).toBe(4);
    expect(
      auditLevel(OFFERED_LESSON_WITH_FORCED_BOARD).embeds.embedForced,
    ).toBe(true);
    expect(
      auditLevel(OFFERED_LESSON_WITH_FORCED_BOARD).violations.map(
        (v) => v.code,
      ),
    ).toEqual(["lesson-phantom-walk-offered"]);
  });

  it("l006 (the latch lesson, the documented dip) is accepted while a static board with the same lesson is not", () => {
    const shipped = auditLevel(shippedBoard(6));
    expect(shipped.result.refusedThenEnteredTiles).toBe(1);
    expect(shipped.violations).toEqual([]);

    // The control: same documented lesson (id 6), latched door and firing switch as
    // data — and a *measured* 0, because the door tile is never clickable.
    const staticBoard = auditLevel(LATCH_LESSON_WITH_STATIC_BOARD);
    expect(staticBoard.result.refusedThenEnteredTiles).toBe(0);
    expect(staticBoard.result.solvable).toBe(true);
    // "otherwise legal": the M1⇄M3 pairing law is satisfied on the control board
    // (the door is targeted *and* the switch really toggles in the reachable graph),
    // so `lesson-latch-dynamism` is the only complaint — exactly the mutation case.
    expect(staticBoard.violations.map((v) => v.code)).toEqual([
      "lesson-latch-dynamism",
    ]);
    expect(firingSwitches(LATCH_LESSON_WITH_STATIC_BOARD, explore(LATCH_LESSON_WITH_STATIC_BOARD)).has("s1")).toBe(true);
    expect(validateLevel(LATCH_LESSON_WITH_STATIC_BOARD).ok).toBe(true);
  });

  it("l008 (Aha #1) passes its gates while the bypass and static variants fail theirs", () => {
    const shipped = auditLevel(shippedBoard(8));
    expect(shipped.violations).toEqual([]);
    expect(shipped.gates.filter((g) => g.status === "FAIL")).toEqual([]);
    // The two controls are the same documented lesson (id 8) with a broken board.
    for (const board of [AHA_LESSON_WITH_BYPASS, STATIC_BOARD_AS_AHA]) {
      const audit = auditLevel(board);
      expect(audit.result.solvable, `id=${board.id}`).toBe(true);
      expect(
        audit.gates.filter((g) => g.status === "FAIL").length,
        `id=${board.id} must really fail a named gate`,
      ).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2b. LV-007B · item 4 (n-13) — a switch nobody reads
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · n-13 — `switch-without-targets` rejects M3 content no door reads", () => {
  it("the board is rejected by exactly that code, and the switch really does fire", () => {
    const audit = auditLevel(SWITCH_WITHOUT_TARGETS);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "switch-without-targets",
    ]);
    expect(audit.result.solvable).toBe(true);

    // The two facts that make this a *separate* check rather than a second name for
    // `switch-never-fires`: the toggle happens (so no firing test can see the
    // defect), and the board's `doors[]` is empty (so nothing can read it).
    expect(
      firingSwitches(
        SWITCH_WITHOUT_TARGETS,
        explore(SWITCH_WITHOUT_TARGETS),
      ).has("s1"),
    ).toBe(true);
    expect(SWITCH_WITHOUT_TARGETS.doors).toEqual([]);

    // …and the message says what to do, not only that something is wrong.
    expect(audit.violations[0]?.detail).toContain("has no targets");
    expect(audit.violations[0]?.detail).toContain("ADR-0009 decision 4");
  });

  it("one field decides: the same board with a target door is accepted", () => {
    // Discrimination, the same shape §2 uses: identical board, identical switch,
    // identical position — only `targets` differs. A check that rejected the
    // *shape* (a switch on a decorative tile) would fail this.
    const wired: Level = {
      ...SWITCH_WITHOUT_TARGETS,
      doors: [door("d1", "blue", [[3, 0]])],
      switches: [switchDef("s1", [1, 1], "A", ["d1"])],
    };
    expect(validateLevel(wired).ok).toBe(true);
    expect(auditLevel(wired).violations).toEqual([]);
  });

  it("the frozen validator only WARNS about this shape — the gate is the policy layer", () => {
    // Stated because the two layers disagree on purpose (schema = shape contract,
    // policy = content law): if the validator ever becomes the rejecting layer, this
    // control has to move with it rather than silently duplicate it.
    const validated = validateLevel(SWITCH_WITHOUT_TARGETS);
    expect(validated.ok).toBe(true);
    expect(
      validated.warnings.some((warning) =>
        warning.includes('"s1" has no targets'),
      ),
      `validator warnings: ${validated.warnings.join(" | ")}`,
    ).toBe(true);
  });

  it("no shipped level carries a targetless switch", () => {
    const offenders: string[] = [];
    for (const id of SHIPPED_IDS) {
      for (const sw of shippedBoard(id).switches) {
        if (sw.targets.length === 0) offenders.push(`l${id}:${sw.id}`);
      }
      expect(auditLevel(shippedBoard(id)).violations, `l${id}`).toEqual([]);
    }
    expect(offenders).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The two newly controlled gates, stated in their own words
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007A · m-2 — gate (ii) rejects a board whose shortest solution bypasses the door", () => {
  const audit = auditLevel(AHA_LESSON_WITH_BYPASS);
  const gate = audit.gates.find(
    (g) => g.id === "shortest-solution-presses-switch-and-crosses-door",
  );

  it("the bypass is measured, not asserted: some shortest routes never cross the door", () => {
    expect(gate?.status).toBe("FAIL");
    // par comes from the solver (the board's own `par: 4` is a proposal that the
    // gate does not read); 12 shortest routes exist and only 6 of them press the
    // switch *and then* enter the door it targets — the other 6 walk around it.
    expect(gate?.detail).toContain("par=6: routes=12; press-then-cross-door=6");
    expect(gate?.detail).not.toContain("refusedThenEnteredTiles=");
    expect(audit.violations.map((v) => v.code)).toContain(
      "gate-shortest-solution-presses-switch-and-crosses-door",
    );
  });

  it("the same board also fails gate (i) — a bypass *is* an all-OFF solution", () => {
    // Honest coupling, stated rather than hidden: gate (i) asks "can the goal be
    // reached without pressing a switch" and gate (ii) asks "does every shortest
    // route press one and cross the door it targets". A route that walks around the
    // door answers *no* to (ii) and *yes* to (i), so a bypass control cannot fail
    // (ii) alone. (Stated here so the duplication is not misread as a stray code.)
    expect(audit.allOffGoalReachable).toBe(true);
    expect(
      audit.gates.find((g) => g.id === "no-solution-with-switches-off")?.status,
    ).toBe("FAIL");
  });
});

describe("LV-007C — gate (iii) reads the ORDERED companion, and the switch has teeth", () => {
  it("reports refusedBeforeEnteredTiles=0 as a FAIL, not as an absence of evidence", () => {
    const audit = auditLevel(STATIC_BOARD_AS_AHA);
    const gate = audit.gates.find((g) => g.id === "refused-then-entered");
    // Both forms are 0 here (the door tile is never clicked at all), so this board
    // fails under either reader — it is the *verdict-string* control.
    expect(audit.result.refusedThenEnteredTiles).toBe(0);
    expect(audit.result.refusedBeforeEnteredTiles).toBe(0);
    expect(gate?.status).toBe("FAIL");
    expect(gate?.detail).toContain("refusedBeforeEnteredTiles=0 tiles=[]");
    expect(gate?.detail).toContain(
      "unordered companion refusedThenEnteredTiles=0 tiles=[]",
    );
    expect(audit.violations.map((v) => v.code)).toContain(
      "gate-refused-then-entered",
    );
  });

  it("the trapped-refusal board flips PASS → violation: the unordered reader would have shipped it", () => {
    // This is the control that makes the reader switch falsifiable. The board is a
    // working latch (canonical `refusedThenEnteredTiles = 1`, switch really fires,
    // door targeted, validator-clean), i.e. exactly what the *unordered* reader
    // accepted — and its beat is unorderable (`refusedBeforeEnteredTiles = 0`), so
    // the ordered reader rejects it by that exact name.
    const audit = auditLevel(TRAPPED_REFUSAL_AS_AHA);
    const gate = audit.gates.find((entry) => entry.id === "refused-then-entered");

    expect(audit.result.solvable).toBe(true);
    expect(audit.result.refusedThenEnteredTiles).toBe(1);
    expect(audit.result.refusedBeforeEnteredTiles).toBe(0);
    expect(gate?.status).toBe("FAIL");
    expect(gate?.detail).toContain("refusedBeforeEnteredTiles=0 tiles=[]");
    expect(gate?.detail).toContain(
      "unordered companion refusedThenEnteredTiles=1 tiles=[1,1]",
    );
    expect(audit.violations.map((v) => v.code)).toContain(
      "gate-refused-then-entered",
    );

    // …and the *other* reader is untouched: the same board is still a valid
    // documented latch under the canonical metric (§8.5's acceptance leg), which is
    // why it is rejected here by gate (iii)'s code and not by
    // `lesson-latch-dynamism`.
    expect(audit.lesson?.obligation).toBe("latch-aha-1");
    expect(audit.violations.map((v) => v.code)).not.toContain(
      "lesson-latch-dynamism",
    );
    expect(audit.result.refusedThenEnteredTiles).toBeGreaterThan(0);

    // The canonical carrier did not move: a `latch-dynamism` level (L6's row) built
    // from the very same board is still accepted — the two legs of
    // ADR-architecture-0002 are deliberately not re-stitched (Appendix A3).
    const asLatchLesson: Level = { ...TRAPPED_REFUSAL_AS_AHA, id: 6 };
    const latchAudit = auditLevel(asLatchLesson);
    expect(latchAudit.lesson?.obligation).toBe("latch-dynamism");
    expect(latchAudit.gates).toEqual([]);
    expect(latchAudit.violations).toEqual([]);
  });
});

describe("LV-007A · m-2 — gate (iv) reaches FAIL (not UNSATISFIABLE) when a portal is present", () => {
  it("a portal-bearing board with dualPhaseTiles=0 is a real failure", () => {
    const audit = auditLevel(AHA_LESSON_WITH_INERT_PORTAL);
    const gate = audit.gates.find((g) => g.id === "dual-phase-tiles");
    expect(audit.result.dualPhaseTiles).toBe(0);
    expect(AHA_LESSON_WITH_INERT_PORTAL.portals.length).toBeGreaterThan(0);
    expect(gate?.status).toBe("FAIL");
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-dual-phase-tiles",
    ]);
  });

  it("the same board without the portal is UNSATISFIABLE (the escalation is not lost)", () => {
    const portalFree: Level = { ...AHA_LESSON_WITH_INERT_PORTAL, portals: [] };
    expect(validateLevel(portalFree).ok).toBe(true);
    expect(
      auditLevel(portalFree).gates.find((g) => g.id === "dual-phase-tiles")
        ?.status,
    ).toBe("UNSATISFIABLE");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. LV-007A · n-14 — the §3 construction bullets enforced as named gates
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007A · n-14 — gates (v)/(vi) enforce the Aha #1 construction spec", () => {
  it("the shipped l008 satisfies both construction bullets", () => {
    const audit = auditLevel(shippedBoard(8));
    const funnel = audit.gates.find(
      (gate) => gate.id === "single-door-one-switch-funnel",
    );
    const cap = audit.gates.find((gate) => gate.id === "aha-par-cap");
    expect(funnel?.status).toBe("PASS");
    expect(funnel?.detail).toContain("doors=1 switches=1");
    expect(cap?.status).toBe("PASS");
    expect(cap?.detail).toContain("par=6 (solver shortest=6) cap=8");
  });

  it("gate (v) rejects an Aha #1 candidate with a second door", () => {
    const audit = auditLevel(AHA_LESSON_WITH_TWO_DOORS);
    const funnel = audit.gates.find(
      (gate) => gate.id === "single-door-one-switch-funnel",
    );
    expect(funnel?.status).toBe("FAIL");
    expect(funnel?.detail).toContain("doors=2 switches=1");
    // The *measured* conditions are all still satisfied on this board: the funnel
    // rule is a construction requirement of its own, not a restatement of (i)–(iii),
    // and this control is what proves the two are different checks.
    expect(
      audit.gates
        .filter((gate) => gate.status === "FAIL")
        .map((gate) => gate.id),
    ).toEqual(["single-door-one-switch-funnel"]);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-single-door-one-switch-funnel",
    ]);
  });

  it("gate (vi) rejects an Aha #1 candidate over the §3 par cap", () => {
    const audit = auditLevel(AHA_LESSON_OVER_PAR_CAP);
    const cap = audit.gates.find((gate) => gate.id === "aha-par-cap");
    expect(cap?.status).toBe("FAIL");
    expect(cap?.detail).toContain("par=9 (solver shortest=6) cap=8");
    // The board is the shipped l008 one, so nothing else fails: the cap is the only
    // complaint (and the solver's own shortest value never moves the cap).
    expect(audit.violations.map((v) => v.code)).toEqual(["gate-aha-par-cap"]);
  });

  it("never judges a level that does not declare Aha #1 (L9 keeps both its doors)", () => {
    // `docs/level-design.md` §5 puts the two-door ordered plan at L9 and Aha #1 at
    // L8: the funnel rule must therefore not touch `l009.json`, whose documented
    // obligation is the latch lesson, not `latch-aha-1`.
    const l9 = auditLevel(shippedBoard(9));
    expect(l9.lesson?.obligation).toBe("latch-dynamism");
    expect(l9.gates).toEqual([]);
    expect(shippedBoard(9).doors.length).toBe(2);
    expect(l9.violations).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. LV-007A · m-5 — the UNSATISFIABLE channel is whitelisted, and guarded by
//    two facts rather than one
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007A · m-5 — UNSATISFIABLE is whitelisted to `dual-phase-tiles`", () => {
  const WHITELIST = "dual-phase-tiles";

  it("no other named gate ever reports UNSATISFIABLE (shipped levels + every control board)", () => {
    // The aggregation channel in `scripts/solve-levels.ts` is generic: *any* gate
    // that says UNSATISFIABLE is printed as an ESCALATION instead of a failure. That
    // generality is a fact of the aggregator, so its *use* is pinned here: the only
    // condition allowed to escalate is the proved-unsatisfiable one. A future gate
    // that returns UNSATISFIABLE by accident (or as a shortcut) turns this RED.
    const boards: readonly Level[] = [
      ...SHIPPED_IDS.map((id) => shippedBoard(id)),
      ...Object.values(NEGATIVE_CONTROLS).flat(),
    ];
    const offenders: string[] = [];
    let escalations = 0;
    for (const board of boards) {
      for (const gate of auditLevel(board).gates) {
        if (gate.status !== "UNSATISFIABLE") continue;
        escalations += 1;
        if (gate.id !== WHITELIST)
          offenders.push(`${gate.id} (board id=${board.id})`);
      }
    }
    expect(offenders).toEqual([]);
    // …and the whitelisted escalation really is reachable, so the assertion above
    // is not vacuous (l008 is portal-free with a measured dualPhaseTiles of 0).
    expect(escalations).toBeGreaterThan(0);
  });

  it("the guard needs BOTH facts: a portal-free board measured non-zero is PASS, not excused", () => {
    // Unconstructible as a real board (the checkerboard invariant is proved three
    // times over), which is exactly why the second clause must be pinned by
    // injecting the measurement: `latchAhaGates` takes the `SolveResult` as an
    // argument, so this asks the question "what if the measurement disagreed with
    // the proof?" — the answer must be a loud verdict, never an escalation.
    const level = shippedBoard(8);
    const graph = explore(level);
    const result = analyse(level, graph);
    const par = result.shortestSolution ?? level.par;
    const injected = latchAhaGates(
      level,
      graph,
      { ...result, dualPhaseTiles: 3, dualPhaseTileList: ["0,0", "1,1", "2,2"] },
      embedMetrics(level, par),
    ).find((gate) => gate.id === "dual-phase-tiles");

    expect(injected?.status).toBe("PASS");
    expect(injected?.detail).toContain("ANOMALY");
    expect(injected?.detail).toContain("dualPhaseTiles=3");
    // The real measurement on the same board still escalates, so the guard has not
    // been weakened into "any portal-free board is excused whatever the number".
    expect(
      auditLevel(level).gates.find((gate) => gate.id === "dual-phase-tiles")
        ?.status,
    ).toBe("UNSATISFIABLE");
    expect(result.dualPhaseTiles).toBe(0);
  });

  it("the escalation is not lost on the shipped set (l008 still reports it)", () => {
    const gate = auditLevel(shippedBoard(8)).gates.find(
      (entry) => entry.id === "dual-phase-tiles",
    );
    expect(gate?.status).toBe("UNSATISFIABLE");
    expect(gate?.detail).toContain("Guard: portal-free AND measured 0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. LV-007A · OQ4 ruling — `switchRequired` is an obligation *on the documented
//    level*, and the L6 dip is a row rather than a level id
// ─────────────────────────────────────────────────────────────────────────────

/** `policy.ts` as text — used by the scans in §7 (no id special case) and §8. */
const POLICY_SOURCE = readFileSync(
  fileURLToPath(new URL("../../src/core/solver/policy.ts", import.meta.url)),
  "utf8",
);

describe("LV-007A · OQ4 — a documented load-bearing latch must be measurably load-bearing", () => {
  it("the obligation lives on the lesson rows: L7–L10 `required`, L6 `exempt`, L1–L5 none", () => {
    const row = (levelId: number) =>
      DOCUMENTED_LESSONS.find((entry) => entry.levelId === levelId);
    // The dip is recorded **on the row** (with the §2 L6 + §6 evidence) precisely so
    // that no check has to know that "6" is special.
    expect(row(6)?.switchRequired).toBe("exempt");
    for (const id of [7, 8, 9, 10])
      expect(row(id)?.switchRequired, `L${id}`).toBe("required");
    for (const id of [1, 2, 3, 4, 5])
      expect(row(id)?.switchRequired, `L${id}`).toBeNull();
  });

  it("every level documented as `required` really is: unreachable with all switches OFF", () => {
    // The obligation is not aspirational: the four rows are checked against the
    // shipped boards' measured all-OFF subgraph, so the values the L7–L10 rows
    // declare are what the dataset actually delivers.
    for (const id of [7, 8, 9, 10]) {
      const audit = auditLevel(shippedBoard(id));
      expect(audit.allOffGoalReachable, `l${String(id).padStart(3, "0")}`).toBe(
        false,
      );
      expect(audit.violations, `l${String(id).padStart(3, "0")}`).toEqual([]);
    }
  });

  it("the dip is a row, not an id: l006 ships while the very same board as L7 is rejected", () => {
    const dip = auditLevel(shippedBoard(6));
    expect(dip.lesson?.switchRequired).toBe("exempt");
    expect(dip.allOffGoalReachable).toBe(true); // the dip, measured — not a claim
    expect(dip.violations).toEqual([]);

    // Same board, same metrics (the latch is real: refusedThenEnteredTiles = 1),
    // different documented promise ⇒ rejected by name.
    const promoted = auditLevel(REQUIRED_LESSON_WITH_DECORATIVE_LATCH);
    expect(REQUIRED_LESSON_WITH_DECORATIVE_LATCH.id).toBe(7);
    expect(promoted.result.refusedThenEnteredTiles).toBe(1);
    expect(promoted.allOffGoalReachable).toBe(true);
    expect(promoted.violations.map((v) => v.code)).toEqual([
      "lesson-switch-required",
    ]);
    expect(promoted.violations[0]?.detail).toContain(
      "goal reachable inside it = true",
    );
  });

  it("the exemption covers `switchRequired` only, never the latch lesson itself", () => {
    // l006 is exempt from the *load-bearing* obligation (the documented price of
    // teaching the latch on the natural path), and from nothing else: the static
    // board carrying id 6 is still rejected by `lesson-latch-dynamism`.
    const staticBoard = auditLevel(LATCH_LESSON_WITH_STATIC_BOARD);
    expect(staticBoard.lesson?.switchRequired).toBe("exempt");
    expect(staticBoard.violations.map((v) => v.code)).toEqual([
      "lesson-latch-dynamism",
    ]);
  });

  it("policy.ts decides from the row, never from the level id", () => {
    // The ruling's explicit requirement: no `id === 6` special case. A source-level
    // guard would be a second truth source for the dip, and the row is the one the
    // docs are checked against.
    expect(POLICY_SOURCE).not.toMatch(/\bid\s*===\s*6\b/);
    expect(POLICY_SOURCE).toContain('switchRequired === "required"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. No silent code — the inventory cannot drift from the source
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007A · m-2 — policy.ts emits no code that the inventory does not declare", () => {
  it("every literal `code:` and every named-gate id is in POLICY_VIOLATION_CODES", () => {
    const declared = new Set<string>(POLICY_VIOLATION_CODES);
    const literals = [...POLICY_SOURCE.matchAll(/code:\s*"([^"]+)"/g)].map(
      (match) => match[1] as string,
    );
    const gateIds = [
      ...POLICY_SOURCE.matchAll(/id:\s*"([^"]+)",\s*\n\s*label[,:]/g),
    ].map((match) => match[1] as string);
    const declaredGateIds = POLICY_VIOLATION_CODES.filter((code) =>
      code.startsWith("gate-"),
    ).map((code) => code.slice("gate-".length));

    // A silent zero-match would make this test vacuous, so the scan itself is
    // checked first (and its shape re-stated for the next maintainer). One gate id
    // may legitimately appear several times (the dual-phase gate has three verdict
    // branches), so the comparison is over the *set* of declared gate ids — which
    // also makes the scan self-guarding: an empty scan cannot equal four ids.
    expect(
      literals.length,
      'the source scan found no `code: "…"` literal — update the scan if policy.ts changed shape',
    ).toBeGreaterThan(0);
    expect(
      [...new Set(gateIds)].sort(),
      'the named-gate ids found in policy.ts must be exactly the gate entries of POLICY_VIOLATION_CODES (update the scan if policy.ts changed shape)',
    ).toEqual([...declaredGateIds].sort());

    for (const code of literals) {
      expect(
        declared.has(code),
        `policy.ts emits "${code}" but POLICY_VIOLATION_CODES does not declare it (add it *and* a negative control)`,
      ).toBe(true);
    }
  });
});