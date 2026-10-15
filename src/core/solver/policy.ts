/**
 * Level shipping policy + documented-lesson audit — `@/core/solver/policy`
 * (Level AI + Solver; AGENTS.md §4).
 *
 * ── WHAT THIS FILE IS ────────────────────────────────────────────────────────
 * The **analyzer / recording layer** the two documented content laws are
 * enforced in, because neither is expressible in the frozen level schema
 * (`src/core/level/index.ts` — schema and validator are NOT changed by this
 * file, and must not be):
 *
 * 1. **M1 never ships alone** (ADR-0009 decision 4, `docs/level-design.md` §1):
 *    every `doors[]` entry must be targeted by at least one `switches[]` entry,
 *    and that switch must be able to fire somewhere in the reachable state space.
 *    A door without a live switch is measured static (ADR-0009: 0/400 boards,
 *    `refusedThenEnteredTiles > 0`), i.e. it is M1-alone content by another name.
 *    Enforced here, printed by `scripts/solve-levels.ts`, and pinned **code by
 *    code** (RV-004 m-2): {@link POLICY_VIOLATION_CODES} is the inventory of every
 *    code this module can emit, and `tests/solver/policy-negative-controls.test.ts`
 *    carries one negative control per entry — a board that must be rejected **by
 *    that exact name** — plus a source scan that fails when a code is added
 *    without a control. The schema stays a shape contract, not a design policy.
 * 2. **A documented lesson must be program-true** (`AGENTS.md` §7: levels ⇒
 *    solver proof). A level the docs call a *forced* phantom walk must FORCE one
 *    (`embedForced`); one documented as *offering* it must offer it and not force
 *    it; a level documented as teaching the latch must actually be
 *    history-dependent (`refusedThenEnteredTiles > 0`); a level whose docs promise
 *    the latch is **load-bearing** must be measurably so
 *    ({@link DocumentedLesson.switchRequired}, L7–L10, with the documented L6 dip
 *    recorded *on its row* as `"exempt"`); the **Aha #1** level must satisfy the
 *    named gates of `docs/level-design.md` §3 one by one.
 *
 * Why `src/core/solver/**` and not `src/core/level/**`: these checks *consume
 * solver metrics*, so putting them in the level layer would point the dependency
 * arrow backwards (`level → solver`). Both the CLI gate and the test suite import
 * this module, so there is exactly **one** implementation of each policy — the
 * repo's one-truth-source rule.
 *
 * Pure TypeScript, no Phaser. No rule is re-implemented here: legality, movement,
 * door openness and solidity come from `@/core/rules` through `@/core/solver/bfs`.
 */

import type { Level } from "@/core/level";
import { coordKey } from "@/core/level";
import type {
  ArrivalRecord,
  EmbedMetrics,
  ReachableGraph,
  SolveResult,
} from "./bfs";
import {
  embedMetrics,
  explore,
  analyse,
  forEachParRoute,
  goalReachableWithAllSwitchesOff,
  tileKey,
} from "./bfs";
import type { DifficultyBreakdown } from "./difficulty";
import { analyseDifficulty } from "./difficulty";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Documented lessons (the table the docs are checked against)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What the docs promise about a level. `null` = no program-checkable obligation
 * (L1–L3 teach literacy / refusal, which the solver cannot falsify).
 */
export type LessonObligation =
  | "phantom-walk-forced"
  | "phantom-walk-offered"
  | "latch-dynamism"
  | "latch-aha-1";

export interface DocumentedLesson {
  readonly levelId: number;
  /** Short lesson label, as documented. */
  readonly lesson: string;
  /** The solver-checkable obligation, or `null` when the lesson is not falsifiable. */
  readonly obligation: LessonObligation | null;
  /**
   * The level's obligation about `switchRequired` (docs/level-design.md §3 condition
   * (i), generalised to **L7–L10** by the Orchestrator ruling recorded in
   * `docs/ai-native-pipeline.md` §8.5):
   *
   * - `"required"` — the latch must be **load-bearing**: the goal has to be
   *   unreachable with every switch OFF (`allOffGoalReachable === false`), else
   *   `auditLevel` emits `lesson-switch-required`. This is an obligation on the
   *   *documented* level, so a future candidate cannot quietly weaken the shipped
   *   `switchRequired = true` values.
   * - `"exempt"` — the **documented dip**: `docs/level-design.md` §2 L6 + §6 record
   *   that the block-opening level teaches the latch on the natural path while its
   *   un-switched world still solves in 6. The exemption lives here, **on the row**,
   *   so it can never be re-read as "L6 is special because it is L6"; the check
   *   below reads this field and never the level id.
   * - `null` — no obligation (the level carries no latch lesson at all).
   */
  readonly switchRequired: SwitchRequiredObligation;
  /** Where the lesson is documented (so the check is traceable, not invented). */
  readonly evidence: string;
}

/** See {@link DocumentedLesson.switchRequired}. */
export type SwitchRequiredObligation = "required" | "exempt" | null;

/**
 * The shipped ladder's documented lessons, L1–L10.
 *
 * `docs/level-design.md` **V0.5** §2 (ladder, synced with ADR-0009 + the gate (iv)
 * ruling) + §3 (Aha #1 construction, construction bullets included) + §6 (the
 * block-opening dip) + `src/levels/README.md` §0/§2b (per-level lesson column and
 * solver-proven derivations, LV-006) are the sources. Adding a level without a row
 * here is caught by the suite (`l0NN has no documented lesson row`), so the table
 * cannot silently drift from the dataset.
 */
export const DOCUMENTED_LESSONS: readonly DocumentedLesson[] = [
  {
    levelId: 1,
    lesson: "literacy: tap → move, the world flashes (no dynamism claim)",
    obligation: null,
    switchRequired: null,
    evidence: "docs/level-design.md §2 L1",
  },
  {
    levelId: 2,
    lesson: "literacy: the flip happens because I moved",
    obligation: null,
    switchRequired: null,
    evidence: "docs/level-design.md §2 L2",
  },
  {
    levelId: 3,
    lesson:
      "first refusal: a permanent (parity-dead) wall, never a timing gate",
    obligation: null,
    switchRequired: null,
    evidence: "docs/level-design.md §2 L3 + ADR-0009",
  },
  {
    levelId: 4,
    lesson: "phantom walk, OFFERED (an echo-free route of the same par exists)",
    obligation: "phantom-walk-offered",
    switchRequired: null,
    evidence: "docs/level-design.md §2 L4 + LV-004 re-measurement",
  },
  {
    levelId: 5,
    lesson: "phantom walk, FORCED (the goal's only approach is an echo)",
    obligation: "phantom-walk-forced",
    switchRequired: null,
    evidence: "docs/level-design.md §2 L5 + LV-004 re-measurement",
  },
  {
    levelId: 6,
    lesson:
      "M1+M3 debut: the latch — what I step on changes the world, and it stays changed",
    obligation: "latch-dynamism",
    // The documented dip: §2 L6 + §6 record `switchRequired = false` as the
    // deliberate price of teaching the latch on the natural path, so the level is
    // exempt from the L7–L10 obligation — and is **never scored as FORCED**.
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §2 L6 + §6 (block-opening dip: switchRequired=false recorded as a concession)",
  },
  {
    levelId: 7,
    lesson: "the detour-to-switch: I go out of my way to change the world",
    obligation: "latch-dynamism",
    switchRequired: "required",
    evidence: "docs/level-design.md §2 L7 + §3 condition (i)",
  },
  {
    levelId: 8,
    lesson:
      "Aha #1 (the latch): the door that refused the greedy line opens and stays open",
    obligation: "latch-aha-1",
    switchRequired: "required",
    evidence:
      "docs/level-design.md §2 L8 + §3 (named Solver conditions (i)–(vi)) + src/levels/README.md §2b L8",
  },
  {
    levelId: 9,
    lesson:
      "two doors + two switches: the second switch is behind the first door (ordered plan)",
    obligation: "latch-dynamism",
    switchRequired: "required",
    // RV-004 n-15: the pointer used to cite "§6 of the pipeline record", which is
    // not where the LV-006 record lives, and the §2 wording it cited has since been
    // re-worded by V0.5. Pointers now name the re-worded text and the recorded
    // deviation (the pre-L11-unconstructible "switch timing" lesson).
    evidence:
      "docs/level-design.md §2 L9 + §5 (V0.5 re-word) · src/levels/README.md §2b L9 + §4 (pre-L11 deviation)",
  },
  {
    levelId: 10,
    lesson:
      "gate check: permanent M0 geometry + the phantom walk + the latch, planned together",
    obligation: "latch-dynamism",
    switchRequired: "required",
    evidence:
      "docs/level-design.md §2 L10 + §5 · src/levels/README.md §2b L10 · docs/ai-native-pipeline.md §8",
  },
];

export function documentedLesson(levelId: number): DocumentedLesson | null {
  return DOCUMENTED_LESSONS.find((entry) => entry.levelId === levelId) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Named gates (the Aha #1 condition list, one gate per documented condition)
// ─────────────────────────────────────────────────────────────────────────────

export type GateStatus = "PASS" | "FAIL" | "UNSATISFIABLE";

/**
 * The named gates {@link latchAhaGates} can report (the Aha #1 condition list of
 * `docs/level-design.md` §3). Deliberately a **closed union typed onto
 * `NamedGate.id`**: adding a gate without declaring it here is a compile error,
 * so the gate list cannot drift past `POLICY_VIOLATION_CODES` / the suite's
 * one-negative-control-per-code rule below.
 */
export type AhaGateId =
  | "no-solution-with-switches-off"
  | "shortest-solution-presses-switch-and-crosses-door"
  | "refused-then-entered"
  | "dual-phase-tiles"
  | "single-door-one-switch-funnel"
  | "aha-par-cap";

export interface NamedGate {
  readonly id: AhaGateId;
  /** The condition in the words of the design doc / dispatch. */
  readonly label: string;
  readonly status: GateStatus;
  /** The measured numbers behind the verdict (never an opinion). */
  readonly detail: string;
}

interface RouteVerdict {
  readonly routes: number;
  /** Routes whose switch press (toggle ON) is followed by entering a door that switch targets. */
  readonly pressThenCross: number;
  /** Of those, routes whose crossed door tile is in `refusedThenEnteredTileList`. */
  readonly refusedDoor: number;
}

/**
 * Gate (ii) probe: for **every** shortest route, did the player press a switch
 * while its `activePhase` was current (that is what `toggledOn` means — the
 * shipped `switchAt` only returns a switch whose `activePhase` is the current
 * phase) and afterwards enter a tile of a door that switch targets, and is that
 * door tile one the board ever *refused* (`refusedThenEnteredTileList`)?
 */
function routeVerdict(
  level: Level,
  par: number,
  refusedTiles: readonly string[],
): RouteVerdict {
  const refused = new Set(refusedTiles);
  const doorByTile = new Map<string, string>();
  for (const door of level.doors) {
    for (const tile of door.tiles) doorByTile.set(coordKey(tile), door.id);
  }
  const targetsBySwitch = new Map<string, readonly string[]>();
  for (const sw of level.switches) targetsBySwitch.set(sw.id, sw.targets);

  let routes = 0;
  let pressThenCross = 0;
  let refusedDoor = 0;

  forEachParRoute(level, par, (route: readonly ArrivalRecord[]) => {
    routes += 1;
    let crossedTargetedDoor = false;
    let crossedRefusedDoor = false;

    for (let i = 0; i < route.length; i += 1) {
      const arrival = route[i] as ArrivalRecord;
      if (arrival.toggledOn.length === 0) continue;
      // the door tile this arrival sits on (if any) and every door a pressed switch targets
      for (const switchId of arrival.toggledOn) {
        const targets = targetsBySwitch.get(switchId) ?? [];
        if (targets.length === 0) continue;
        for (let j = i + 1; j < route.length; j += 1) {
          const later = route[j] as ArrivalRecord;
          const doorId = doorByTile.get(tileKey(later.state.player));
          if (doorId === undefined || !targets.includes(doorId)) continue;
          crossedTargetedDoor = true;
          if (refused.has(tileKey(later.state.player)))
            crossedRefusedDoor = true;
        }
      }
    }

    if (crossedTargetedDoor) pressThenCross += 1;
    if (crossedTargetedDoor && crossedRefusedDoor) refusedDoor += 1;
  });

  return { routes, pressThenCross, refusedDoor };
}

/**
 * The named Aha #1 gates of `docs/level-design.md` §3, measured:
 *
 * 1. `no-solution-with-switches-off` — "no solution exists with all
 *    `switchesOn` false" (the door genuinely refuses the un-switched approach);
 * 2. `shortest-solution-presses-switch-and-crosses-door` — "the solution must
 *    pass through the refusing door itself after the toggle", and the toggle must
 *    be required, not incidental;
 * 3. `refused-then-entered` — the §8/ADR-0009 history-dependence metric fires;
 * 4. `dual-phase-tiles` — the dispatch's fourth named gate, delegated to
 *    {@link dualPhaseGate}. **Portal-free boards can never produce one**
 *    (checkerboard invariant, ADR-0009 decision 1: a switch never moves the
 *    player, so the position→phase link survives the latch; the same fact is
 *    pinned by `tests/solver/dynamism-metrics.test.ts`), so the gate is reported
 *    `UNSATISFIABLE` with the proof instead of being quietly dropped or satisfied
 *    with a mechanic the schedule forbids before L11 — but only while the guard
 *    holds (portal-free **and** measured 0, RV-004 m-5).
 * 5. `single-door-one-switch-funnel` and 6. `aha-par-cap` — the §3 **construction**
 *    bullets ("exactly one door + one switch"; "par ≤ 8 for L8"), programmatically
 *    enforced since LV-007A (RV-004 n-14). They apply to Aha #1 levels only.
 */
export function latchAhaGates(
  level: Level,
  graph: ReachableGraph,
  result: SolveResult,
  embeds: EmbedMetrics,
): readonly NamedGate[] {
  const allOffReachable = goalReachableWithAllSwitchesOff(level, graph);
  const allOffStates = allOffStateCount(level, graph) ?? result.reachableStates;

  const par = result.shortestSolution ?? level.par;
  const verdict = routeVerdict(level, par, result.refusedThenEnteredTileList);

  const gates: NamedGate[] = [
    {
      id: "no-solution-with-switches-off",
      label:
        "no solution exists with every switch OFF (docs/level-design.md §3)",
      status: allOffReachable ? "FAIL" : "PASS",
      detail:
        `all-OFF subgraph: ${allOffStates}/${result.reachableStates} reachable state(s) keep every switch OFF; ` +
        `goal reachable inside it = ${allOffReachable}`,
    },
    {
      id: "shortest-solution-presses-switch-and-crosses-door",
      label:
        "every shortest solution presses a switch and then enters a door that switch targets, one the board refused",
      status:
        verdict.routes > 0 &&
        verdict.pressThenCross === verdict.routes &&
        verdict.refusedDoor === verdict.routes
          ? "PASS"
          : "FAIL",
      detail:
        `par=${par}: routes=${verdict.routes}; press-then-cross-door=${verdict.pressThenCross}; ` +
        `…and that door is one of the refused tiles: routes=${verdict.refusedDoor}; ` +
        `parRoutes=${embeds.parRoutes} embedRoutes=${embeds.embedRoutes}`,
    },
    {
      id: "refused-then-entered",
      label:
        "refusedThenEnteredTiles ≥ 1 (ADR-0009: the latch, not parity, carries the decision)",
      status: result.refusedThenEnteredTiles > 0 ? "PASS" : "FAIL",
      detail: `refusedThenEnteredTiles=${result.refusedThenEnteredTiles} tiles=[${result.refusedThenEnteredTileList.join(" ")}]`,
    },
    dualPhaseGate(level, result),
    // ── the §3 construction bullets, as gates (LV-007A n-14) ──────────────────
    //
    // `docs/level-design.md` V0.5 §3 keeps two *construction* requirements next to
    // the measured conditions — "Exactly one door + one switch on the board" and
    // "Par ≤ 8 for L8" — and records that "programmatic enforcement = LV-007
    // (RV-004 n-14)". These two gates are that enforcement. They are deliberately
    // computed **only** for a level whose documented lesson declares Aha #1
    // (`latch-aha-1`), so the multi-door L9 ordered plan — a different lesson, with
    // its own obligation — is never judged by the Aha funnel rule.
    {
      id: "single-door-one-switch-funnel",
      label:
        "exactly one door + one switch on the board (docs/level-design.md §3 construction bullet)",
      status:
        level.doors.length === 1 && level.switches.length === 1 ? "PASS" : "FAIL",
      detail:
        `doors=${level.doors.length} switches=${level.switches.length} — the Aha #1 board is the ` +
        `one-door-one-switch funnel (visible from the start, §3). More doors/switches is a different ` +
        `lesson (L9's ordered plan, L16+ latch fluency) and must not declare Aha #1.`,
    },
    {
      id: "aha-par-cap",
      label:
        "par ≤ 8 for the Aha #1 level (docs/level-design.md §3 construction bullet)",
      status:
        level.par <= AHA_PAR_CAP && par <= AHA_PAR_CAP ? "PASS" : "FAIL",
      detail:
        `par=${level.par} (solver shortest=${String(result.shortestSolution)}) cap=${AHA_PAR_CAP}; ` +
        `the authored and the measured value are both checked, so neither can move past the cap unnoticed.`,
    },
  ];
  return gates;
}

/**
 * The §3 par cap for the Aha #1 level: "Par ≤ 8 for L8 (L6–L7 sit at par ≤ 4 under
 * the §6 dip)" — the shipped `l008.json` is solver-verified at 6.
 */
export const AHA_PAR_CAP = 8;

/**
 * Gate (iv), `dualPhaseTiles ≥ 1` — the one gate whose verdict can be
 * **UNSATISFIABLE**, and the *only* producer of that status in this module
 * (pinned by the suite: every other gate must answer PASS or FAIL).
 *
 * The UNSATISFIABLE verdict is drawn only when **both** facts hold (RV-004 m-5):
 *
 * - the board is **portal-free** (so ADR-0009 decision 1's checkerboard proof
 *   applies at all — a switch never relocates the player, so the phase at a tile
 *   stays a function of the tile), and
 * - the solver **measured** `dualPhaseTiles === 0`.
 *
 * Either fact alone is not an excuse: if a portal is present the proof does not
 * apply (FAIL, loudly), and if a portal-free board ever measured a non-zero value
 * the invariant itself has been broken (PASS with an explicit anomaly note, so it
 * cannot be read as a routine pass). Before m-5 the guard read
 * `level.portals.length === 0` alone, which would have silently upgraded a real
 * failure on a portal-bearing board to a non-failure escalation.
 */
function dualPhaseGate(level: Level, result: SolveResult): NamedGate {
  const portalFree = level.portals.length === 0;
  const measured = result.dualPhaseTiles;
  const label = "dualPhaseTiles ≥ 1 (dispatch's fourth named gate)";

  if (portalFree && measured === 0) {
    return {
      id: "dual-phase-tiles",
      label,
      status: "UNSATISFIABLE",
      detail:
        `dualPhaseTiles=0 is FORCED to 0 on a portal-free board: the grid is bipartite and every ` +
        `legal move changes x+y parity and the phase together, so the phase at a tile is a function of the tile ` +
        `(ADR-0009 decision 1 — a switch never relocates the player, so the latch cannot break it). No portal-free ` +
        `level before L11 can satisfy the gate as written; ADR-0009 schedules M2 at L11. ` +
        `(Guard: portal-free AND measured 0 — if either stops holding this verdict becomes PASS/FAIL.)`,
    };
  }

  if (measured > 0) {
    return {
      id: "dual-phase-tiles",
      label,
      status: "PASS",
      detail:
        `dualPhaseTiles=${measured} tiles=[${result.dualPhaseTileList.join(" ")}]; ` +
        `portals=${level.portals.length}` +
        (portalFree
          ? ` — ⚠ ANOMALY: the board is portal-free, yet a tile is entered in both phases, so the checkerboard ` +
            `invariant has been falsified by measurement. The gate condition holds, but escalate: do not read this as a routine pass.`
          : ` — causality broken by M2 displacement, as designed (ADR-0009 schedules portals from L11).`),
    };
  }

  return {
    id: "dual-phase-tiles",
    label,
    status: "FAIL",
    detail:
      `dualPhaseTiles=0 on a board carrying ${level.portals.length} portal(s): the portal-free proof does NOT apply, ` +
      `so this is a real FAIL — a portal that never displacement-breaks the phase link is inert content ` +
      `(same-colour pairs are validator-rejected; an unused opposite-colour pair is measurably useless). ` +
      `Not an escalation, and never softened.`,
  };
}

/**
 * Number of reachable states in which **every** switch is OFF — the size of the
 * §3 condition (i) subgraph — or `null` when the level carries no switches at all
 * (`null` = the obligation does not apply; a measured `0` is a real value).
 *
 * Exposed as a **number** (LV-007A n-18) so the analyzer's `16/34` statement about
 * `l008` is a pair of assertions in the suite and not a sentence inside a detail
 * string: a metric that is only ever read as prose cannot be pinned.
 */
export function allOffStateCount(
  level: Level,
  graph: ReachableGraph,
): number | null {
  if (level.switches.length === 0) return null;
  let count = 0;
  for (const node of graph.nodes) {
    let allOff = true;
    for (const sw of level.switches) {
      if (node.switchesOn[sw.id] === true) {
        allOff = false;
        break;
      }
    }
    if (allOff) count += 1;
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Policy violations (hard, mechanical)
// ─────────────────────────────────────────────────────────────────────────────

export interface PolicyViolation {
  /** Stable machine-readable code, so a failure can be pinned by the suite. */
  readonly code: PolicyViolationCode;
  readonly detail: string;
}

/**
 * The inventory of every code this module can emit — a failing gate is reported
 * as `gate-<id>`, everything else is listed literally.
 *
 * This list is the **declaration of record** (RV-004 m-2): each entry must have a
 * negative control in `tests/solver/policy-negative-controls.test.ts` that fails
 * if that single check is disabled, so "pinned by tests" is a claim about every
 * code and not only about the four that were convenient. A code emitted inline
 * without being added here is caught by the same suite's source scan.
 */
export type PolicyViolationCode =
  | "door-without-switch"
  | "switch-never-fires"
  | "lesson-phantom-walk-forced"
  | "lesson-phantom-walk-offered"
  | "lesson-latch-dynamism"
  | "lesson-switch-required"
  | `gate-${AhaGateId}`;

export const POLICY_VIOLATION_CODES: readonly PolicyViolationCode[] = [
  "door-without-switch",
  "switch-never-fires",
  "lesson-phantom-walk-forced",
  "lesson-phantom-walk-offered",
  "lesson-latch-dynamism",
  "lesson-switch-required",
  "gate-no-solution-with-switches-off",
  "gate-shortest-solution-presses-switch-and-crosses-door",
  "gate-refused-then-entered",
  "gate-dual-phase-tiles",
  "gate-single-door-one-switch-funnel",
  "gate-aha-par-cap",
];

/** Switch ids that actually toggle somewhere in the reachable graph. */
export function firingSwitches(
  level: Level,
  graph: ReachableGraph,
): ReadonlySet<string> {
  const fired = new Set<string>();
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const from = graph.nodes[i];
    if (from === undefined) continue;
    for (const j of graph.edgesOut[i] as readonly number[]) {
      const to = graph.nodes[j];
      if (to === undefined) continue;
      for (const sw of level.switches) {
        if (
          (from.switchesOn[sw.id] === true) !==
          (to.switchesOn[sw.id] === true)
        ) {
          fired.add(sw.id);
        }
      }
    }
  }
  return fired;
}

export interface LevelAudit {
  readonly levelId: number;
  readonly lesson: DocumentedLesson | null;
  readonly result: SolveResult;
  readonly embeds: EmbedMetrics;
  /**
   * `docs/level-design.md` §3 condition, measured for **every** switch-bearing
   * level (not only the Aha): `true` = the goal is still reachable without ever
   * pressing a switch (the latch is optional), `false` = the switch is required
   * (the door genuinely refuses the un-switched approach), `null` = the level has
   * no switches.
   */
  readonly allOffGoalReachable: boolean | null;
  /**
   * Size of that same all-OFF subgraph (LV-007A n-18): `16` of `l008`'s 34
   * reachable states. `null` when the level has no switches. Exposed as a number so
   * the `16/34` claim is pinned by an assertion instead of by a printed sentence.
   */
  readonly allOffReachableStates: number | null;
  /** Named gates — only for a level documented as Aha #1 (`latch-aha-1`). */
  readonly gates: readonly NamedGate[];
  /**
   * The `docs/level-difficulty.md` §2 breakdown (LV-007B item 3). Reported, never
   * gated: the weights are the doc's **provisional V0.1 hypothesis** and live in
   * `@/core/solver/difficulty` (one constant), so re-calibrating them against
   * playtest data moves no solver contract. `D` is `null` when the board has no
   * solution — a board with no solution has no position on the curve.
   */
  readonly difficulty: DifficultyBreakdown;
  /** Hard policy violations: the level must not ship while any is present. */
  readonly violations: readonly PolicyViolation[];
}

/**
 * One call, one truth source: explore → analyse → embed metrics → policies.
 * `graph` may be passed when the caller already explored (the CLI does), so the
 * search runs once per level.
 */
export function auditLevel(
  level: Level,
  graph: ReachableGraph = explore(level),
): LevelAudit {
  const result = analyse(level, graph);
  const par = result.shortestSolution ?? level.par;
  const embeds = embedMetrics(level, par);
  const lesson = documentedLesson(level.id);
  const violations: PolicyViolation[] = [];

  // The all-OFF subgraph is measured **once** per level, before any check reads it
  // (LV-007A): it feeds the `switchRequired` obligation below, the returned audit
  // record, and — for an Aha #1 level — gate (i) inside `latchAhaGates`.
  const allOffReachable =
    level.switches.length === 0
      ? null
      : goalReachableWithAllSwitchesOff(level, graph);
  const allOffStates = allOffStateCount(level, graph);

  // ── M1 never ships alone (ADR-0009 decision 4) ─────────────────────────────
  const fired = firingSwitches(level, graph);
  const targetedDoors = new Set<string>();
  for (const sw of level.switches) {
    for (const target of sw.targets) targetedDoors.add(target);
  }
  for (const door of level.doors) {
    if (targetedDoors.has(door.id)) continue;
    violations.push({
      code: "door-without-switch",
      detail:
        `doors "${door.id}" is targeted by no switch — M1 never ships alone (ADR-0009 decision 4: doors without a switch ` +
        `are measured static, 0/400 boards with refusedThenEnteredTiles > 0). Either pair it with a switch whose ` +
        `activePhase can actually be current on its tile, or drop the door.`,
    });
  }
  level.switches.forEach((sw, i) => {
    if (fired.has(sw.id)) return;
    violations.push({
      code: "switch-never-fires",
      detail:
        `switches[${i}] "${sw.id}" never toggles in any reachable state — the latch is inert, so every door it targets is ` +
        `static content wearing a switch. (Measured over the whole reachable graph, so this is exact, not a parity argument.)`,
    });
  });

  // ── documented lesson obligations ──────────────────────────────────────────
  if (lesson) {
    switch (lesson.obligation) {
      case "phantom-walk-forced":
        if (!embeds.embedForced) {
          violations.push({
            code: "lesson-phantom-walk-forced",
            detail:
              `documented as a FORCED phantom walk (${lesson.evidence}) but parRoutes=${embeds.parRoutes} ` +
              `embedRoutes=${embeds.embedRoutes}: at least one shortest solution never ends embedded. Re-author or ` +
              `re-document the lesson — never soften the check.`,
          });
        }
        break;
      case "phantom-walk-offered":
        if (embeds.embedRoutes === 0 || embeds.embedForced) {
          violations.push({
            code: "lesson-phantom-walk-offered",
            detail:
              `documented as OFFERING the phantom walk (${lesson.evidence}) but parRoutes=${embeds.parRoutes} ` +
              `embedRoutes=${embeds.embedRoutes} (embedForced=${String(embeds.embedForced)}): it must have at least one ` +
              `embedding shortest route AND at least one that never embeds.`,
          });
        }
        break;
      case "latch-dynamism":
        if (result.refusedThenEnteredTiles === 0) {
          violations.push({
            code: "lesson-latch-dynamism",
            detail:
              `documented as a latch level (${lesson.evidence}) but refusedThenEnteredTiles=0: no tile in the level ever ` +
              `refuses entry in one reachable state and accepts it in another, so the board is mechanically static — ` +
              `exactly what ADR-0009 forbids shipping as M1+M3 content.`,
          });
        }
        break;
      case "latch-aha-1":
        break;
      default:
        break;
    }

    // ── the `switchRequired` obligation (LV-007A, OQ4 ruling) ────────────────
    //
    // `docs/level-design.md` §3 condition (i) asks the Aha #1 door to *refuse* the
    // un-switched approach; the Orchestrator ruling recorded in
    // `docs/ai-native-pipeline.md` §8.5 generalises that from L8 to **every**
    // documented latch level, L7–L10. The obligation lives on the lesson row
    // ({@link DocumentedLesson.switchRequired}), so this check reads the *documented
    // promise*, never the level id: L6's recorded dip is an explicit `"exempt"` row
    // and is therefore the one level that may keep `switchRequired = false`. A
    // re-authored candidate with an id ≥ 7 can no longer quietly weaken the shipped
    // value — it is rejected by name instead.
    if (lesson.switchRequired === "required" && allOffReachable !== false) {
      violations.push({
        code: "lesson-switch-required",
        detail:
          `documented as a latch level whose switch is load-bearing (${lesson.evidence}) but the goal is still reachable ` +
          `with every switch OFF (all-off subgraph: ${String(allOffStates)}/${result.reachableStates} reachable state(s), ` +
          `goal reachable inside it = ${String(allOffReachable)}): the latch is decorative, so the level teaches the ` +
          `latch lesson without ever requiring it. Re-author the board, or have the Game Designer record the dip — ` +
          `never relax this check.`,
      });
    }
  }

  const gates =
    lesson?.obligation === "latch-aha-1"
      ? latchAhaGates(level, graph, result, embeds)
      : [];
  for (const gate of gates) {
    if (gate.status !== "FAIL") continue;
    violations.push({
      code: `gate-${gate.id}`,
      detail: `${gate.label} — ${gate.detail}`,
    });
  }

  return {
    levelId: level.id,
    lesson,
    result,
    embeds,
    allOffGoalReachable: allOffReachable,
    allOffReachableStates: allOffStates,
    gates,
    violations,
    difficulty: analyseDifficulty(level, graph),
  };
}
