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
  BLOCK_L1619_IDS,
  BLOCK_L1619_PAR_EXPECTATION,
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
// 1b. LV-008 — the five M2 (portal) debut gates: one mutation each, off the
//     shipped board
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `l011`'s shipped board, schema-validated (the `shippedBoard` helper does it): **every**
 * portal control below is this board with exactly one mutation, which is what makes each
 * of them a probe of the gate it names rather than a probe of some other board. Deriving
 * them from the shipped artifact matters: a control built from a synthetic board would
 * tell us that *some* board trips the check, not that the gates protecting *this* level
 * have teeth.
 */
const PORTAL_DEBUT_BOARD: Level = shippedBoard(11);

/**
 * **N1a** — `gate-portal-pair-single-opposite-colour`, the *phase* clause: a **second**
 * portal pair carrying the *other* channel phase (`A`, while the shipped pair is `B`).
 * Both pairs are individually legal — opposite checkerboard colour, validator-clean — so
 * the only thing wrong with the board is the count: two channels where a mechanic debut
 * may introduce one (`docs/level-difficulty.md` §3.4 "single-concept"; `docs/level-design.md`
 * §1 keeps the other phase's channel for a later block).
 *
 * Measured surgical: exactly one gate is non-PASS, and the rest of the debut suite (the
 * M1+M3 unit, the ordered beat, the par cap, the seam law) still passes — so this control
 * cannot be green for an unrelated reason. The route set does not move (`parRoutes` stays
 * 1), which is why gate (ii) is untouched: the added pair is never entered on the par
 * route.
 */
const PORTAL_DEBUT_WITH_SECOND_PAIR: Level = {
  ...PORTAL_DEBUT_BOARD,
  portals: [
    ...PORTAL_DEBUT_BOARD.portals,
    { id: "p2", pair: [[1, 2], [6, 0]], activePhase: "A" },
  ],
};

/**
 * **N1b** — the *count* clause on its own: a second pair in the **same** channel phase
 * (`B`). It separates `portals.length === 1` from "a second pair in another phase is a
 * second mechanic": even a same-phase duplicate is rejected, because one channel is one
 * concept. Surgical for the same measured reason as N1a (nothing else moves).
 *
 * Not carried as a control: the same mutation with the ends `(0,0)`/`(5,2)` (also phase
 * `A`). It is honest coupling rather than an isolated probe — the extra pair is entered
 * on two *additional* par routes, so `parRoutes` rises 1 → 3 and gate (ii) fails with the
 * pair gate. Same code, same board class, one more complaint; N1a already pins the code,
 * so the coupled variant is recorded here instead of shipping as a second control.
 */
const PORTAL_DEBUT_WITH_SAME_PHASE_PAIR: Level = {
  ...PORTAL_DEBUT_BOARD,
  portals: [
    ...PORTAL_DEBUT_BOARD.portals,
    { id: "p2", pair: [[0, 2], [5, 2]], activePhase: "B" },
  ],
};

/**
 * **N2a** — the *unit* gate on a portal board (the LV-008 extraction of gate (ii)):
 * `l011` with the goal moved to `(4,1)`. The then-3-move shortest route teleports
 * `(2,1) → (4,0)` and steps onto the goal **without ever crossing the door** — the portal
 * really is on the route (so the debut's own crossing gate passes), and the one complaint
 * is the M1+M3 unit. This is the board that proves gate (ii) reads `par` from the solver
 * on a channel-bearing board too, i.e. that the shared implementation is not a
 * latch-board-only reader.
 */
const PORTAL_DEBUT_DOOR_BYPASSED: Level = { ...PORTAL_DEBUT_BOARD, goal: [4, 1] };

/**
 * **N2b** — `gate-portal-crossing-on-every-par-route`, the true *bypass* control: the same
 * goal move, but the pair is re-declared `activePhase: "A"`. The channel is then dead in
 * every phase the shortest routes stand in, so the par-4 route set walks the whole way and
 * never teleports: the portal is decoration, and the board claims a lesson it does not
 * deliver. Because a bypass *is* a route that ignores the latch, this board fails gate (ii)
 * as well — the same honest coupling §3 records for `AHA_LESSON_WITH_BYPASS`, restated here
 * so the second code is not misread as a stray.
 */
const PORTAL_DEBUT_WITH_DEAD_CHANNEL: Level = {
  ...PORTAL_DEBUT_BOARD,
  goal: [4, 1],
  portals: [{ id: "p1", pair: [[2, 1], [4, 0]], activePhase: "A" }],
};

/**
 * **N3** — `gate-portal-par-cap`: the shipped board with `par: 5`. Nothing else moves —
 * the solver's shortest is still 4 and every measured metric is identical — so the cap is
 * the one and only complaint (the LV-007A `AHA_LESSON_OVER_PAR_CAP` pattern, on the M2
 * debut's `par ≤ 4` floor instead of Aha #1's `≤ 8`).
 */
const PORTAL_DEBUT_OVER_PAR_CAP: Level = { ...PORTAL_DEBUT_BOARD, par: 5 };

/**
 * **N4** — `gate-portal-teaching-grade-below-offered`: the column `x = 3` sealed with
 * parity-dead walls (one in phase A, two in phase B), so the walking world can no longer
 * reach the goal and the portal becomes **required** — a FORCED-grade debut, which the
 * construction floor forbids. The walls are legal geometry: the validator *warns* three
 * times (same-parity entry phase, and the parity argument is explicitly "NOT PROVEN" on a
 * portal-bearing board) and returns `ok: true`, which is why the rejection has to live in
 * the policy layer. Measured surgical: the only gate that moves is the grade, and
 * `D_exec` rises only to 8.6271 — still under the seam budget, so this control isolates
 * the grade rule from the seam law.
 */
const PORTAL_DEBUT_FORCED_GRADE: Level = {
  ...PORTAL_DEBUT_BOARD,
  phaseAWalls: [[3, 1]],
  phaseBWalls: [
    [3, 0],
    [3, 2],
  ],
};

/**
 * **N5** — `gate-portal-seam-law-execution-axis`, and deliberately **not** surgical: the
 * seam law's *boundary* control. The board is the shipped `l010` re-labelled `id: 11` —
 * i.e. "a level sitting exactly at the published budget, declared as the M2 debut". Its
 * measured `D_exec` is **13.642857 ≥ 13.64**, so the seam gate fails by 0.002857, and the
 * three portal-construction gates fail with it (the board carries no channel at all).
 *
 * That coupling is the point of the control: it shows the budget is the *number that was
 * published* and not a flattering rounding — a board one move-hair above the bound is
 * rejected by name. A surgical variant was searched for and does not exist: adding dead
 * pockets to `l011` (which would raise `D_exec` without touching the construction gates)
 * was measured to produce `deadStates = 0` and `T = 0` — i.e. no `D_exec` movement at all
 * — so the honest boundary control is the one that fails several gates.
 *
 * (`dual-phase-tiles` on this board reports UNSATISFIABLE — a proved-unsatisfiable
 * *escalation*, not a failure, because the board is portal-free and measured 0. §5
 * re-asserts the whitelist over every control board in this file.)
 */
const PORTAL_BUDGET_BOUNDARY_AS_DEBUT: Level = { ...shippedBoard(10), id: 11 };

// ─────────────────────────────────────────────────────────────────────────────
// 1c. LV-009-B — the L12–L15 block's six gates: one control each, off the
//     shipped l012/l013/l014 boards. The block's law (ADR-design-0003) is a
//     *ramp*, so its controls are members of that ramp perturbed by one field at
//     a time — never synthetic boards, because a synthetic board would only show
//     that *some* board trips the check.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **B1** — `gate-block-par-ramp`: the shipped `l012` board with `par: 6`. Nothing
 * on the board moves — the solver still finds the P1 floor of 4 in 4 moves, the
 * coverage is still 21/21, the latch still grades par and the channel is still a
 * shortcut — so the *authored* number is the one and only thing wrong. That is the
 * point: the gate reads the authored **and** the measured par, so a candidate cannot
 * drift onto another member's rung by writing a bigger number in the file.
 */
const BLOCK_PAR_RAMP_OVER_RAMP: Level = { ...shippedBoard(12), par: 6 };

/**
 * **B2** — `gate-block-coverage`: the shipped `l012` board with the corner `(0,0)`
 * sealed in **both** phases. The solver still reaches the goal in 4 moves on the
 * unchanged route, every latch/channel gate still passes, and the board is still
 * schema- and rule-legal (the validator warns twice — a warning is not a gate) —
 * but `distinctPositions` falls to 20 of the 21 tiles the law counts. Surgical by
 * construction, and the reason the clause is not implied by solvability: a board can
 * be *solvable* and still leave a tile of its own grid outside the law's accounting.
 *
 * (Walling a cell in one phase only does **not** move this number — the tile is still
 * reachable in the other phase — which is why the control needs both phases; measured
 * on the shipped board, and the reason a single-phase mutation was not shipped as a
 * control.)
 */
const BLOCK_COVERAGE_ONE_SEALED_CELL: Level = {
  ...shippedBoard(12),
  phaseAWalls: [...shippedBoard(12).phaseAWalls, [0, 0]] as [number, number][],
  phaseBWalls: [...shippedBoard(12).phaseBWalls, [0, 0]] as [number, number][],
};

/**
 * **B3** — `gate-block-latch-par-grade`: the shipped `l012` board with the latch
 * **removed** (`doors: []`, `switches: []`). G1 is a *construction* obligation, so
 * a board with no latch at all fails it by name; the par route then also stops
 * pressing a switch and crossing a door.
 *
 * The second code is **not** an unrelated complaint, it is a theorem of the law —
 * stated here rather than hidden: if every par route presses the switch *and* crosses
 * the door it targets (gate (ii)), then no all-OFF route can be as short as par, so
 * `allOffShortest − par ≥ 1` and G1 passes. G1 can therefore only fail when gate (ii)
 * fails with it (or when there is no latch). A *surgical* G1-only control is
 * unconstructible, and the measured search for one is on the record: relabelling
 * `l012`'s latch language and moving the door were both measured to keep G1 at PASS
 * with advantage 2, exactly as the theorem requires.
 */
const BLOCK_LATCH_REMOVED: Level = {
  ...shippedBoard(12),
  doors: [],
  switches: [],
};

/**
 * **B4** — `gate-block-portal-load`, the **`mandatory`** clause: `l013` with the wall
 * `(4, 3)` moved from phase A to phase B. The sealed line stops being sealed in a
 * phase-consistent way, so the walking world solves again — while the portal world's
 * par stays exactly 6, the coverage stays 24/24 and the latch/history gates stay PASS.
 * The one and only complaint is the load grade, which is the clause this control
 * exists for: from L13 up the channel must be the **only** door, and "the walk still
 * finishes" is a rejection even when the par is untouched.
 *
 * Measured surgical: exactly one gate non-PASS. The validator warns three times (the
 * portal-bearing parity argument is explicitly "NOT PROVEN") and returns `ok: true`,
 * so the rejection has to live in the policy layer.
 */
const BLOCK_MANDATORY_GRADE_WITH_OPEN_WALK: Level = {
  ...shippedBoard(13),
  phaseAWalls: [[4, 1]],
  phaseBWalls: [
    [4, 0],
    [4, 2],
    [4, 3],
  ],
};

/**
 * **B5** — `gate-block-dip-ceiling`, and deliberately **not** surgical-by-deletion:
 * the shipped `l012` board made one row taller (`height: 5`). Every tile of the new
 * 35-cell grid is still reachable (35/35), par is still the P1 floor 4, the latch
 * still grades par by 2 and the channel is still a shortcut — the *only* thing that
 * moved is the execution axis, `D_exec = 8.723881 > 8.573171` (the shipped L11's
 * measured value). That is exactly §4's reading of the dip: it is carried by
 * effective branching, not by a shorter route, so a first member that merely grows
 * breaks the ceiling without any par change. Measured: one code, one gate.
 *
 * (A wall-deletion variant was measured too and is recorded rather than shipped: with
 * both of the board's walls removed `D_exec` only reaches 8.500000 — still below the
 * ceiling — so "looser" is a weaker lever than "bigger" on this board.)
 */
const BLOCK_DIP_CEILING_ENLARGED: Level = { ...shippedBoard(12), height: 5 };

/**
 * **B6** — `gate-block-tail-exec-budget`, and **not** surgical: the block's
 * *interior* member (`l014`, `D_exec = 12.957895`) wearing the last member's id. The
 * frozen §6 block-end clause is a comparison against the published 13.64, so the
 * honest counter-example is a member whose execution axis is that of the block's
 * middle: it fails the tail budget by name, and the par ramp fails with it (8 ≠ 10),
 * because the block's members are not interchangeable rungs.
 *
 * A one- and two-wall search for a surgical variant is on the record: **every**
 * single-phase and two-phase wall addition to `l015` was measured (48 slots, 1128
 * pairs) and *no* board reached the ceiling from above — the last member's execution
 * axis cannot be pulled under 13.64 by sealing tiles, only by being a different (and
 * therefore law-breaking) rung. Recorded instead of hidden, in the same spirit as the
 * portal debut's boundary control.
 */
const BLOCK_TAIL_INTERIOR_MEMBER_AS_LAST: Level = {
  ...shippedBoard(14),
  id: 15,
};

/**
 * **B7** — `gate-block-l1619-rung`, and surgical by construction: the shipped `l016` row
 * with its **authored** `par` moved off the derived rung (12 → 14). The board itself is
 * untouched, so every other `block-l1619` gate still reads PASS — the violation list is
 * exactly one code — and the code's two teeth (`level.par` **and** the solver's
 * `shortestSolution` must equal the rung) are what reject it. This is the C1/P2 law the
 * registration introduced: `par = par(L15) + 2·(id − 15)`, an equality, not a floor.
 */
const BLOCK_L1619_RUNG_OFF_BY_ONE: Level = {
  ...shippedBoard(16),
  par: 14,
};

/**
 * **B8** — `gate-block-l1619-grid-coverage`, and surgical: `l016` re-based on a 7 × 7
 * grid with the added seventh **row sealed in both phases**, so the walkable world — and
 * with it the par, the latch grading, the coverage *count* (42) and every other gate — is
 * byte-for-byte the shipped device's. The only thing that moved is the law's accounting:
 * `distinctPositions` is 42 of the 49 tiles the grid now claims. The grid is law, not
 * decoration (the census that produced the par-18 ceiling is a 7 × 6 census), which is why
 * the clause is an equality on `width × height` rather than a solvability check.
 */
const BLOCK_L1619_GRID_ENLARGED: Level = {
  ...shippedBoard(16),
  height: 7,
  phaseAWalls: [
    ...shippedBoard(16).phaseAWalls,
    ...(Array.from({ length: 7 }, (_, x) => [x, 6]) as [number, number][]),
  ],
  phaseBWalls: [
    ...shippedBoard(16).phaseBWalls,
    ...(Array.from({ length: 7 }, (_, x) => [x, 6]) as [number, number][]),
  ],
};

/**
 * **B9** — `gate-block-l1619-device-existence`: the shipped `l016` seal with its `d1`
 * door **and the switch that drives it removed** (`d1` is the goal's only other approach),
 * so the all-OFF world solves again and the goal-gated property is gone.
 *
 * Deliberately **not** surgical, and recorded rather than hidden: the same removal is read
 * by three clauses — `block-l1619-device-existence` (the seal is no longer load-bearing),
 * `lesson-switch-required` (the row promises `"required"` and the latch is now decorative)
 * and gate (ii) (the remaining par routes cross `d2`, which no longer needs a press) — and
 * that co-firing *is* the finding: existence and load-bearingness are one property here
 * (ADR-design-0003 §5's "the latch grades par, never solvability" does **not** transfer to
 * this device, which is exactly why the rows are `"required"`). The rung still PASSES
 * (par stays 12), so the code is the only reader that reports the loss.
 */
const BLOCK_L1619_SEAL_OPENED: Level = (() => {
  const l016 = shippedBoard(16);
  return { ...l016, doors: l016.doors.slice(1), switches: l016.switches.slice(1) };
})();

/**
 * **B10** — `gate-block-l1619-escalation-cut`, and surgical: `l016` plus a **second portal
 * whose landing is a pocket**. The pair `(0,5) ⇄ (1,0)` is live in phase B and the corner
 * `(0,5)` has its two neighbours walled in phase A, so entering `(1,0)` in phase B lands the
 * player in a dead pocket: `T = 21`, `R = 0.016` and `D_exec = 100.943548` — the execution
 * axis is no longer `par + 3·B` (the identity the clause is written on). The par (12), the
 * grid, the coverage (42/42), the all-OFF grade and the press-then-cross routes are all
 * untouched, so exactly one code fires. The clause exists because a board nobody can finish
 * after a wrong turn must not be graded by a number the player's hands cannot feel —
 * without it, the extra `T` would have *lowered* the grade's meaning while raising its value.
 */
const BLOCK_L1619_CUT_BREACHED: Level = (() => {
  const l016 = shippedBoard(16);
  return {
    ...l016,
    portals: [...l016.portals, { id: "p2", pair: [[0, 5], [1, 0]] as const, activePhase: "B" as const }],
    phaseAWalls: [...l016.phaseAWalls, [1, 5], [0, 4]] as [number, number][],
  };
})();

/**
 * **B11** — `gate-block-l1619-b-band`: the shipped `l016` board (the one **named**
 * excursion, `B = 1.7000 > 1.6875`) wearing a rung that is **not** in
 * `BLOCK_L1619_NAMED_B_EXCURSIONS`. The register is keyed by rung, and this control is what
 * proves it: the same board under `id = 17` is rejected by `block-l1619-b-band` by name.
 *
 * Not surgical — the rung gate fires with it, and it must: the register is indexed by the
 * rung the board *claims*, so presenting the out-of-band board under another rung is
 * simultaneously an unnamed excursion and a broken ladder. A surgical variant (an in-band
 * board pushed out of band without disturbing par, coverage or the cut) was searched and is
 * not reachable on this device: `B` is measured over the reachable graph, so any wall
 * change large enough to move it out of the band moves the rung's par or its coverage too.
 */
const BLOCK_L1619_UNNAMED_B_EXCURSION: Level = {
  ...shippedBoard(16),
  id: 17,
};

/**
 * **B12** — the block's LAST member wearing an interior member's board — the same
 * shape as {@link BLOCK_TAIL_INTERIOR_MEMBER_AS_LAST} above, and for the same reason:
 * the terminal-ceiling clause is only reachable on the block's last rung, so the honest
 * counter-example is a rung that is not the ceiling. `l018` carries par 16 (not 20) and
 * `D_exec = 20.907923` (not 24.729412), so `block-l1619-tail-ceiling` fails by name; the
 * rung gate fails with it, because the block's members are not interchangeable rungs.
 *
 * QA-014 re-point: the last member is now **`l020`** (R-003d registered the sealed
 * landing at the root), so the id is taken from `BLOCK_L1619_IDS` instead of a typed
 * `19`. The control's *shape* is unchanged — an interior member's board wearing the
 * tail's rung — which is why the board stays `l018`'s: `l019` is no longer the tail,
 * so it is a legitimate interior member to borrow from.
 */
const BLOCK_L1619_INTERIOR_MEMBER_AS_LAST: Level = {
  ...shippedBoard(18),
  id: BLOCK_L1619_IDS.at(-1) as number,
};

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
      // LV-008: the *same* gate implementation, reached from a channel-bearing board.
      // The portal debut reuses gate (ii) rather than re-implementing it, so the code
      // needs a control of its own on M2 content: this one fails gate (ii) alone (the
      // par route teleports and never crosses the door the switch drives).
      PORTAL_DEBUT_DOOR_BYPASSED,
    ],
    "gate-refused-then-entered": [
      STATIC_BOARD_AS_AHA,
      TRAPPED_REFUSAL_AS_AHA,
    ],
    "gate-dual-phase-tiles": [AHA_LESSON_WITH_INERT_PORTAL],
    "gate-single-door-one-switch-funnel": [AHA_LESSON_WITH_TWO_DOORS],
    "gate-aha-par-cap": [AHA_LESSON_OVER_PAR_CAP],
    // ── LV-008 — the M2 (portal) debut gates (one mutation each, off l011) ────
    "gate-portal-pair-single-opposite-colour": [
      PORTAL_DEBUT_WITH_SECOND_PAIR,
      PORTAL_DEBUT_WITH_SAME_PHASE_PAIR,
    ],
    "gate-portal-crossing-on-every-par-route": [
      PORTAL_DEBUT_WITH_DEAD_CHANNEL,
    ],
    "gate-portal-par-cap": [PORTAL_DEBUT_OVER_PAR_CAP],
    "gate-portal-teaching-grade-below-offered": [PORTAL_DEBUT_FORCED_GRADE],
    "gate-portal-seam-law-execution-axis": [PORTAL_BUDGET_BOUNDARY_AS_DEBUT],
    // ── LV-009-B — the L12–L15 block's gates (ADR-design-0003) ───────────────
    "gate-block-par-ramp": [BLOCK_PAR_RAMP_OVER_RAMP],
    "gate-block-coverage": [BLOCK_COVERAGE_ONE_SEALED_CELL],
    "gate-block-latch-par-grade": [BLOCK_LATCH_REMOVED],
    "gate-block-portal-load": [BLOCK_MANDATORY_GRADE_WITH_OPEN_WALK],
    "gate-block-dip-ceiling": [BLOCK_DIP_CEILING_ENLARGED],
    "gate-block-tail-exec-budget": [BLOCK_TAIL_INTERIOR_MEMBER_AS_LAST],
    // ── QA-011 — the L16–L20 registered root rows' six gates (LV-010-law) ────
    "gate-block-l1619-rung": [BLOCK_L1619_RUNG_OFF_BY_ONE],
    "gate-block-l1619-grid-coverage": [BLOCK_L1619_GRID_ENLARGED],
    "gate-block-l1619-device-existence": [BLOCK_L1619_SEAL_OPENED],
    "gate-block-l1619-escalation-cut": [BLOCK_L1619_CUT_BREACHED],
    "gate-block-l1619-b-band": [BLOCK_L1619_UNNAMED_B_EXCURSION],
    "gate-block-l1619-tail-ceiling": [BLOCK_L1619_INTERIOR_MEMBER_AS_LAST],
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
// 2c. LV-008 — the M2 debut's gates stated in their own words (the shipped board
//     is accepted, every control fails by name, and the coupling is admitted)
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 — the portal debut's gates have teeth, and the shipped l011 keeps them all", () => {
  it("the shipped l011 is accepted: eight gates, all PASS, no violation", () => {
    const audit = auditLevel(PORTAL_DEBUT_BOARD);
    expect(audit.lesson?.obligation).toBe("portal-aha-2");
    expect(audit.gates.map((gate) => `${gate.id}:${gate.status}`)).toEqual([
      "dual-phase-tiles:PASS",
      "shortest-solution-presses-switch-and-crosses-door:PASS",
      "refused-then-entered:PASS",
      "portal-pair-single-opposite-colour:PASS",
      "portal-crossing-on-every-par-route:PASS",
      "portal-par-cap:PASS",
      "portal-teaching-grade-below-offered:PASS",
      "portal-seam-law-execution-axis:PASS",
    ]);
    expect(audit.violations).toEqual([]);
  });

  it("gate 4 rejects ONE channel only — the phase clause and the count clause are both live", () => {
    // Two controls, two clauses: N1a adds a pair in the *other* phase (the "two
    // mechanics" reading), N1b adds one in the *same* phase (the "one channel is one
    // concept" reading). Both are validator-clean and otherwise gate-clean, so the
    // count is the only complaint either way.
    for (const board of [
      PORTAL_DEBUT_WITH_SECOND_PAIR,
      PORTAL_DEBUT_WITH_SAME_PHASE_PAIR,
    ]) {
      expect(validateLevel(board).ok, "the extra pair itself is legal").toBe(true);
      expect(board.portals.length).toBe(2);
      const audit = auditLevel(board);
      expect(
        audit.gates.filter((gate) => gate.status === "FAIL").map((gate) => gate.id),
      ).toEqual(["portal-pair-single-opposite-colour"]);
      expect(audit.violations.map((v) => v.code)).toEqual([
        "gate-portal-pair-single-opposite-colour",
      ]);
      // …and the shipped board, whose *only* difference is the missing second pair, is
      // accepted: the control is not passing because the shape is rejected wholesale.
      expect(PORTAL_DEBUT_BOARD.portals.length).toBe(1);
      expect(
        auditLevel(PORTAL_DEBUT_BOARD).gates.find(
          (gate) => gate.id === "portal-pair-single-opposite-colour",
        )?.status,
      ).toBe("PASS");
    }
  });

  it("gate 5 rejects a channel that is dead on the route, and admits the coupling", () => {
    const audit = auditLevel(PORTAL_DEBUT_WITH_DEAD_CHANNEL);
    const crossing = audit.gates.find(
      (gate) => gate.id === "portal-crossing-on-every-par-route",
    );
    expect(crossing?.status).toBe("FAIL");
    expect(crossing?.detail).toContain("routes=1");
    expect(crossing?.detail).toContain("teleporting arrival (|Δposition| ≠ 1)=0");
    expect(crossing?.detail).toContain("routes entering an active portal end=0");
    // Honest coupling, stated rather than hidden: a bypass *is* an all-ignore route, so
    // the unit gate fails with the crossing gate (see §3 for the same shape on Aha #1).
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-shortest-solution-presses-switch-and-crosses-door",
      "gate-portal-crossing-on-every-par-route",
    ]);
    // The mirror image is surgical, and it is the extraction's own control: with the
    // channel back on the route (`activePhase: "B"`), gate (ii) is the single failure —
    // so gate 5 is not a second name for gate (ii).
    const doorBypass = auditLevel(PORTAL_DEBUT_DOOR_BYPASSED);
    expect(
      doorBypass.gates
        .filter((gate) => gate.status === "FAIL")
        .map((gate) => gate.id),
    ).toEqual(["shortest-solution-presses-switch-and-crosses-door"]);
    expect(
      doorBypass.gates.find(
        (gate) => gate.id === "portal-crossing-on-every-par-route",
      )?.status,
    ).toBe("PASS");
  });

  it("gate 6 reads the authored AND the measured par, and gate 7 measures the walking world", () => {
    const cap = auditLevel(PORTAL_DEBUT_OVER_PAR_CAP);
    expect(
      cap.gates.filter((gate) => gate.status === "FAIL").map((gate) => gate.id),
    ).toEqual(["portal-par-cap"]);
    expect(
      cap.gates.find((gate) => gate.id === "portal-par-cap")?.detail,
    ).toContain("par=5 (solver shortest=4) cap=4");

    // Gate 7's two branches are both reachable: the shipped board's walking world still
    // solves (below OFFERED), the sealed board's does not (FORCED, forbidden).
    expect(
      auditLevel(PORTAL_DEBUT_BOARD).gates.find(
        (gate) => gate.id === "portal-teaching-grade-below-offered",
      )?.detail,
    ).toContain("portal-free world (same board, portals: []): solvable=true");
    const forced = auditLevel(PORTAL_DEBUT_FORCED_GRADE);
    expect(
      forced.gates.filter((gate) => gate.status === "FAIL").map((gate) => gate.id),
    ).toEqual(["portal-teaching-grade-below-offered"]);
    expect(
      forced.gates.find(
        (gate) => gate.id === "portal-teaching-grade-below-offered",
      )?.detail,
    ).toContain("solvable=false");
    // …and the board really is one step from legal: the validator accepts it with the
    // parity warnings the LEVEL layer owns (a warning is not a gate).
    expect(validateLevel(PORTAL_DEBUT_FORCED_GRADE).ok).toBe(true);
    expect(validateLevel(PORTAL_DEBUT_FORCED_GRADE).warnings.length).toBe(3);
  });

  it("gate 8 is the seam law's boundary control — it fails at 13.642857 ≥ 13.64", () => {
    const audit = auditLevel(PORTAL_BUDGET_BOUNDARY_AS_DEBUT);
    const seam = audit.gates.find(
      (gate) => gate.id === "portal-seam-law-execution-axis",
    );
    expect(seam?.status).toBe("FAIL");
    expect(seam?.detail).toContain("Dexec=13.6429");
    expect((audit.difficulty.Dexec as number).toFixed(2)).toBe("13.64");
    // Everything except the seam gate and the three construction gates passes: the
    // board is a legitimate L10-class puzzle wearing the debut's id, which is exactly
    // why the seam law cannot be satisfied by building a bad debut. (The grade gate
    // passes vacuously here — the board carries no portals, so "the portal-free world"
    // *is* the board — which is a fact about the control, recorded rather than hidden.)
    expect(
      audit.gates.filter((gate) => gate.status === "PASS").map((gate) => gate.id),
    ).toEqual([
      "shortest-solution-presses-switch-and-crosses-door",
      "refused-then-entered",
      "portal-teaching-grade-below-offered",
    ]);
    expect(PORTAL_BUDGET_BOUNDARY_AS_DEBUT.portals).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2d. LV-009-B — the L12–L15 block's gates stated in their own words (the four
//     shipped boards are accepted, each control fails by name, and the one
//     coupling that is a theorem is admitted as one)
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-009-B — the L12–L15 block's gates have teeth, and the four shipped members keep them all", () => {
  const BLOCK_IDS = [12, 13, 14, 15] as const;

  it("the four shipped members are accepted: every gate PASS, no violation", () => {
    for (const id of BLOCK_IDS) {
      const audit = auditLevel(shippedBoard(id));
      expect(audit.lesson?.obligation, `l${id}`).toBe("block-l1215");
      expect(
        audit.gates.filter((gate) => gate.status !== "PASS").map((gate) => `${gate.id}:${gate.status}`),
        `l${id}`,
      ).toEqual([]);
      expect(audit.violations, `l${id}`).toEqual([]);
      // The block's shape, member by member: the par ladder, full coverage, and the
      // latch grading par by exactly 2 moves in the restricted all-OFF world.
      expect(audit.result.shortestSolution, `l${id}`).toBe([4, 6, 8, 10][id - 12]);
      expect(audit.result.distinctPositions, `l${id}`).toBe(
        shippedBoard(id).width * shippedBoard(id).height,
      );
    }
  });

  it("B1 — the par ramp reads the AUTHORED and the MEASURED par: 6 vs 4 alone is a rejection", () => {
    const audit = auditLevel(BLOCK_PAR_RAMP_OVER_RAMP);
    const ramp = audit.gates.find((gate) => gate.id === "block-par-ramp");
    expect(ramp?.status).toBe("FAIL");
    expect(ramp?.detail).toContain("par=6 (solver shortest=4); this member expects 4");
    expect(ramp?.detail).toContain("floor 4 + step 2 reaching exactly the ceiling 10");
    // Surgical: the board is otherwise the shipped, gate-clean L12, so the authored
    // number is the only complaint and the code names it exactly.
    expect(audit.violations.map((v) => v.code)).toEqual(["gate-block-par-ramp"]);
  });

  it("B2 — coverage is a clause of its own: a solvable board can still leave a tile out", () => {
    const audit = auditLevel(BLOCK_COVERAGE_ONE_SEALED_CELL);
    const coverage = audit.gates.find((gate) => gate.id === "block-coverage");
    expect(coverage?.status).toBe("FAIL");
    expect(coverage?.detail).toContain("distinctPositions=20 of 21 (7 × 3)");
    expect(audit.result.shortestSolution).toBe(4); // still solvable, still par
    expect(audit.violations.map((v) => v.code)).toEqual(["gate-block-coverage"]);
    // The board is legal geometry: the validator *warns* (twice) and returns ok.
    expect(validateLevel(BLOCK_COVERAGE_ONE_SEALED_CELL).ok).toBe(true);
    expect(validateLevel(BLOCK_COVERAGE_ONE_SEALED_CELL).warnings.length).toBe(2);
  });

  it("B3 — G1 fails by construction when the latch is gone, and the coupling with gate (ii) is a theorem", () => {
    const audit = auditLevel(BLOCK_LATCH_REMOVED);
    const grade = audit.gates.find((gate) => gate.id === "block-latch-par-grade");
    expect(grade?.status).toBe("FAIL");
    expect(grade?.detail).toContain("switch(es)=0 door(s)=0");
    expect(grade?.detail).toContain("allOffShortest=null par=4 ⇒ allOffShortest − par = n/a");
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-block-latch-par-grade",
      "gate-shortest-solution-presses-switch-and-crosses-door",
    ]);

    // The coupling, as the law's own implication: "every par route presses the switch
    // and crosses its door" ⇒ no all-OFF route is as short as par ⇒ G1 passes. So G1
    // can never be the *only* failing gate on a latched board, and a G1-only control
    // is unconstructible. This is checked over every board in the file (shipped +
    // controls), not asserted in prose.
    const boards: readonly Level[] = [
      ...SHIPPED_IDS.map((id) => shippedBoard(id)),
      ...Object.values(NEGATIVE_CONTROLS).flat(),
    ];
    const counterexamples: string[] = [];
    for (const board of boards) {
      const gates = auditLevel(board).gates;
      const crossing = gates.find(
        (gate) => gate.id === "shortest-solution-presses-switch-and-crosses-door",
      );
      const latch = gates.find((gate) => gate.id === "block-latch-par-grade");
      if (latch === undefined || crossing?.status !== "PASS") continue;
      if (latch.status !== "PASS")
        counterexamples.push(
          `board id=${board.id}: gate (ii) PASS but ${latch.id}=${latch.status} (${latch.detail})`,
        );
    }
    expect(counterexamples).toEqual([]);
    // …and the implication is not vacuous: a board on which both gates fail exists.
    expect(
      auditLevel(BLOCK_LATCH_REMOVED).gates.find(
        (gate) => gate.id === "shortest-solution-presses-switch-and-crosses-door",
      )?.status,
    ).toBe("FAIL");
  });

  it("B4 — the `mandatory` load grade rejects a walking world that still finishes", () => {
    const audit = auditLevel(BLOCK_MANDATORY_GRADE_WITH_OPEN_WALK);
    const load = audit.gates.find((gate) => gate.id === "block-portal-load");
    expect(load?.status).toBe("FAIL");
    expect(load?.detail).toContain("law for this member: mandatory");
    expect(load?.detail).toContain("solvable=true");
    // Surgical: par is still exactly the member's 6 and the coverage is still 24/24,
    // so the *load kind* is the only thing the gate can be reading.
    expect(audit.result.shortestSolution).toBe(6);
    expect(audit.result.distinctPositions).toBe(24);
    expect(audit.violations.map((v) => v.code)).toEqual(["gate-block-portal-load"]);
    expect(validateLevel(BLOCK_MANDATORY_GRADE_WITH_OPEN_WALK).ok).toBe(true);
    // …and the shipped l013 — the same board with the sealed line sealed again — is
    // the discrimination leg: measured walk-only UNSATISFIABLE, gate PASS.
    expect(
      auditLevel(shippedBoard(13))
        .gates.find((gate) => gate.id === "block-portal-load")
        ?.detail,
    ).toContain("solvable=false");
  });

  it("B5 — the dip ceiling is an EXECUTION clause: par unchanged, board grown, ceiling broken", () => {
    const audit = auditLevel(BLOCK_DIP_CEILING_ENLARGED);
    const dip = audit.gates.find((gate) => gate.id === "block-dip-ceiling");
    expect(dip?.status).toBe("FAIL");
    expect(dip?.detail).toContain("Dexec=8.723881 < 8.573171");
    // Everything except the ceiling is the shipped L12's own state: the P1 floor par,
    // full coverage of the *new* grid, and the latch still grading par by 2.
    expect(audit.result.shortestSolution).toBe(4);
    expect(audit.result.distinctPositions).toBe(35);
    expect(audit.violations.map((v) => v.code)).toEqual(["gate-block-dip-ceiling"]);
    expect(validateLevel(BLOCK_DIP_CEILING_ENLARGED).ok).toBe(true);
    // The clause is a strict inequality against a shipped measurement, so the shipped
    // member is on the other side of it by 0.34 (the shipped L11 re-read here).
    expect(
      auditLevel(shippedBoard(12)).gates.find(
        (gate) => gate.id === "block-dip-ceiling",
      )?.detail,
    ).toContain("Dexec=8.230769 < 8.573171");
  });

  it("B6 — the tail budget rejects an interior rung wearing the last member's id", () => {
    const audit = auditLevel(BLOCK_TAIL_INTERIOR_MEMBER_AS_LAST);
    const tail = audit.gates.find((gate) => gate.id === "block-tail-exec-budget");
    expect(tail?.status).toBe("FAIL");
    expect(tail?.detail).toContain("Dexec=12.957895 > 13.64");
    expect(BLOCK_TAIL_INTERIOR_MEMBER_AS_LAST.id).toBe(15);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-block-par-ramp",
      "gate-block-tail-exec-budget",
    ]);
    // The coupling is admitted rather than hidden: the block's members are a *ramp*,
    // so a board at the interior member's rung also misses the last member's par. The
    // control pins the clause; it does not claim isolation.
    expect(
      audit.gates.find((gate) => gate.id === "block-par-ramp")?.status,
    ).toBe("FAIL");
  });

  it("the two single-member clauses do not fire on the other members", () => {
    // `dip-ceiling` belongs to the first member and `tail-exec-budget` to the last:
    // a member that is neither must not carry either gate, so a future edit cannot
    // quietly re-scope them to the whole block.
    expect(
      auditLevel(shippedBoard(12)).gates.map((gate) => gate.id),
    ).toContain("block-dip-ceiling");
    expect(
      auditLevel(shippedBoard(12)).gates.map((gate) => gate.id),
    ).not.toContain("block-tail-exec-budget");
    for (const id of [13, 14] as const) {
      const ids = auditLevel(shippedBoard(id)).gates.map((gate) => gate.id);
      expect(ids, `l${id}`).not.toContain("block-dip-ceiling");
      expect(ids, `l${id}`).not.toContain("block-tail-exec-budget");
    }
    expect(
      auditLevel(shippedBoard(15)).gates.map((gate) => gate.id),
    ).toContain("block-tail-exec-budget");
    expect(
      auditLevel(shippedBoard(15)).gates.map((gate) => gate.id),
    ).not.toContain("block-dip-ceiling");
  });

  it("never judges a level that does not declare the block lesson (l011 keeps its own gates)", () => {
    const l11 = auditLevel(shippedBoard(11));
    expect(l11.lesson?.obligation).toBe("portal-aha-2");
    expect(l11.gates.map((gate) => gate.id)).not.toContain("block-par-ramp");
    expect(l11.violations).toEqual([]);
  });

  // ── QA-011 — the L16–L20 registered root block's six gates, control by control ─
  // The ladder is read from the registry, never typed: this section's controls are
  // the *same* six gates the rows land under, so a re-registration moves both at once.
  const BLOCK_GATE_IDS = [
    "block-l1619-rung",
    "block-l1619-grid-coverage",
    "block-l1619-device-existence",
    "block-l1619-escalation-cut",
    "block-l1619-b-band",
    "block-l1619-tail-ceiling",
  ] as const;

  it("the registered rows are the discrimination side: every block gate PASSes on l016–l020 with zero violations", () => {
    // Derivation-first: the member ids come from the registry, not from a typed 16–20.
    for (const id of BLOCK_L1619_IDS) {
      const audit = auditLevel(shippedBoard(id));
      expect(audit.violations, `l${id}`).toEqual([]);
      for (const gateId of BLOCK_GATE_IDS) {
        const gate = audit.gates.find((g) => g.id === gateId);
        // The tail-ceiling clause is only carried by the LAST member (index === len−1),
        // so its absence elsewhere is the law, not a hole.
        if (gateId === "block-l1619-tail-ceiling" && id !== BLOCK_L1619_IDS.at(-1)) {
          expect(gate, `l${id} must not carry ${gateId}`).toBeUndefined();
          continue;
        }
        expect(gate?.status, `l${id} · ${gateId}`).toBe("PASS");
      }
    }
  });

  it("B7 — the rung is an EQUALITY: an authored par off the derived rung is rejected by name, alone", () => {
    const audit = auditLevel(BLOCK_L1619_RUNG_OFF_BY_ONE);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-block-l1619-rung",
    ]);
    const rung = audit.gates.find((g) => g.id === "block-l1619-rung");
    expect(rung?.status).toBe("FAIL");
    expect(rung?.detail).toContain(
      "par=14 (solver shortest=12); this member expects 12",
    );
    // The expectation table behind that sentence is derived from the registry ids.
    expect(rung?.detail).toContain(
      `${BLOCK_L1619_PAR_EXPECTATION.join(" / ")} from BLOCK_L1619_IDS=[${BLOCK_L1619_IDS.join(", ")}]`,
    );
    expect(validateLevel(BLOCK_L1619_RUNG_OFF_BY_ONE).ok).toBe(true);
  });

  it("B8 — the grid is law: the same walkable world re-based on 7 × 7 fails coverage alone", () => {
    const audit = auditLevel(BLOCK_L1619_GRID_ENLARGED);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-block-l1619-grid-coverage",
    ]);
    const coverage = audit.gates.find(
      (g) => g.id === "block-l1619-grid-coverage",
    );
    expect(coverage?.status).toBe("FAIL");
    expect(coverage?.detail).toContain(
      "grid 7 × 7 (law: 7 × 6); distinctPositions=42 of 49",
    );
    // The seal is untouched: the solver still reads the shipped par 12 and 42 tiles,
    // so only the *accounting* moved — which is the clause's whole claim.
    expect(audit.result.shortestSolution).toBe(12);
    expect(audit.result.distinctPositions).toBe(42);
  });

  it("B9 — existence is load-bearing: opening the seal fires three named clauses, and that coupling IS the finding", () => {
    const audit = auditLevel(BLOCK_L1619_SEAL_OPENED);
    expect(
      audit.violations.map((v) => v.code).sort(),
    ).toEqual([
      "gate-block-l1619-device-existence",
      "gate-shortest-solution-presses-switch-and-crosses-door",
      "lesson-switch-required",
    ]);
    const existence = audit.gates.find(
      (g) => g.id === "block-l1619-device-existence",
    );
    expect(existence?.status).toBe("FAIL");
    expect(existence?.detail).toContain(
      "allOffGoalReachable=true allOffShortest=14 par=12",
    );
    // The rung still PASSes (par stays 12), which is why existence is not implied by
    // the ladder: the rung is the only reader that stays silent here.
    expect(
      audit.gates.find((g) => g.id === "block-l1619-rung")?.status,
    ).toBe("PASS");
  });

  it("B10 — the cut is an identity: a portal pocket re-prices the execution axis and fires alone", () => {
    const audit = auditLevel(BLOCK_L1619_CUT_BREACHED);
    expect(audit.violations.map((v) => v.code)).toEqual([
      "gate-block-l1619-escalation-cut",
    ]);
    const cut = audit.gates.find((g) => g.id === "block-l1619-escalation-cut");
    expect(cut?.status).toBe("FAIL");
    expect(cut?.detail).toContain("Dexec=100.943548 > 14.969697");
    // The identity `D_exec = par + 3·B` is what the clause reads, so the measured
    // `T = 21` / `R = 0.016129` must be on the record with the check.
    expect(cut?.detail).toContain("T=21, R=0.016129");
    expect(validateLevel(BLOCK_L1619_CUT_BREACHED).ok).toBe(false);
  });

  it("B11 — the excursion register is keyed by rung: the named board under an unnamed id fires", () => {
    const audit = auditLevel(BLOCK_L1619_UNNAMED_B_EXCURSION);
    expect(
      audit.violations.map((v) => v.code).sort(),
    ).toEqual(["gate-block-l1619-b-band", "gate-block-l1619-rung"]);
    const band = audit.gates.find((g) => g.id === "block-l1619-b-band");
    expect(band?.status).toBe("FAIL");
    expect(band?.detail).toContain(
      "B=1.7000 vs [1.2500, 1.6875]; named excursion: none",
    );
    // Both facts are one act: the register is indexed by the rung the board *claims*.
    expect(
      audit.gates.find((g) => g.id === "block-l1619-rung")?.status,
    ).toBe("FAIL");
  });

  it("B12 — the terminal ceiling is an equality, so an interior member wearing the last rung's id fires", () => {
    const audit = auditLevel(BLOCK_L1619_INTERIOR_MEMBER_AS_LAST);
    expect(
      audit.violations.map((v) => v.code).sort(),
    ).toEqual(["gate-block-l1619-rung", "gate-block-l1619-tail-ceiling"]);
    const tail = audit.gates.find((g) => g.id === "block-l1619-tail-ceiling");
    expect(tail?.status).toBe("FAIL");
    expect(tail?.detail).toContain("par=16 (ceiling 20)");
    expect(tail?.detail).toContain("Dexec=20.907923 (ceiling 24.729412)");
    // The clause is reachable only on the registry's last member; the control has to
    // *be* that member to ask the question, which is why the id is re-labelled — and
    // why that id comes from the registry rather than a typed 19 (QA-014 / R-003d).
    expect(BLOCK_L1619_INTERIOR_MEMBER_AS_LAST.id).toBe(
      BLOCK_L1619_IDS.at(-1),
    );
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
  it("the obligation lives on the lesson rows: L7–L10 `required`, L6 + L11 `exempt`, L1–L5 none", () => {
    const row = (levelId: number) =>
      DOCUMENTED_LESSONS.find((entry) => entry.levelId === levelId);
    // The dip is recorded **on the row** (with the §2 L6 + §6 evidence) precisely so
    // that no check has to know that "6" is special. L11 repeats the same construction
    // for the second mechanic seam: the M2 debut's latch sits on the only par route, but
    // the walking world still finishes, so its row is `exempt` for the same documented
    // reason (the debut teaches *below OFFERED* — demonstrated, not demanded).
    expect(row(6)?.switchRequired).toBe("exempt");
    expect(row(11)?.switchRequired).toBe("exempt");
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