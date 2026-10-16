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
 *    The **mirror** is enforced here too (LV-007B item 4, n-13): a `switches[]`
 *    entry with an empty `targets` list is rejected as `switch-without-targets`.
 *    Such a switch really does fire, so no firing test can catch it; what is wrong
 *    is that no door reads it — M3 content that changes nothing. `validateLevel`
 *    only *warns* about that shape, and a warning is not a gate.
 * 2. **A documented lesson must be program-true** (`AGENTS.md` §7: levels ⇒
 *    solver proof). A level the docs call a *forced* phantom walk must FORCE one
 *    (`embedForced`); one documented as *offering* it must offer it and not force
 *    it; a level documented as teaching the latch must actually be
 *    history-dependent (`refusedThenEnteredTiles > 0` — the **unordered** carrier,
 *    see the reader split below); a level whose docs promise the latch is
 *    **load-bearing** must be measurably so
 *    ({@link DocumentedLesson.switchRequired}, L7–L10, with the documented L6 dip
 *    recorded *on its row* as `"exempt"`); the **Aha #1** level must satisfy the
 *    named gates of `docs/level-design.md` §3 one by one.
 *
 * ── WHICH METRIC EACH READER READS (the two legs of ADR-architecture-0002) ────
 * Metric #7 exists in two forms and this module deliberately uses **both**, for
 * different jobs — re-stitching them into one reader is a re-definition of the
 * acceptance criterion, not a cleanup:
 *
 * - **Aha gate (iii) reads the ORDERED companion** `refusedBeforeEnteredTiles`
 *   (LV-007C, completing GD-008's wording pass of `docs/level-design.md` §3 (iii)).
 *   The condition's own sentence is ordered — "refused *first*, entered *later*" —
 *   and the ordered form is the beat-witnessability measure, i.e. the semantically
 *   correct reading of that gate (ADR-architecture-0002 decision 4: "the companion
 *   (ordered) = beat-witnessability"). It closes the trapped-refusal class: a pocket
 *   where the refusal can only ever be met *after* the acceptance is
 *   history-dependence in the metric but a beat no player can witness. Measured
 *   verdict-identical on the shipped ten (both forms report the same tile lists,
 *   1/1/1/2/1 on L6–L10) and pinned by a divergent-board control.
 * - **Everything else keeps the UNORDERED canonical form**
 *   `refusedThenEnteredTiles`: the `lesson-latch-dynamism` obligation below, gate
 *   (ii)'s refusal half, and `docs/ai-native-pipeline.md` §8.5's pre-L11 acceptance
 *   law (the generation leg). #7 is the board-level dynamism carrier whose M0 /
 *   M1-alone `≡ 0` theorem base was proved for *that* form, and a trapped refusal
 *   still proves entry legality is history-dependent — it must never read as
 *   "static". §8.5's law is not edited by this switch (ADR-architecture-0002
 *   Appendix A3).
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
import type { Phase } from "@/core/state/phase";
import { isGoal } from "@/core/state/transitions";
import type { Vec } from "@/core/state/types";
import { step } from "@/core/state/move";
import type {
  ArrivalRecord,
  EmbedMetrics,
  ReachableGraph,
  SolveResult,
} from "./bfs";
import {
  allSwitchesOff,
  embedMetrics,
  explore,
  analyse,
  forEachParRoute,
  goalReachableWithAllSwitchesOff,
  solve,
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
  | "latch-aha-1"
  | "portal-aha-2"
  | "block-l1215"
  | "block-l1619";

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
  {
    // ── L11 — the M2 (portal) debut, the second and last mechanic seam ────────
    //
    // The obligation `portal-aha-2` is the **debut** obligation: it carries the
    // §3.4 construction floor of a mechanic debut (par ≤ 4, single-concept, below
    // OFFERED) plus the pre-registered seam law `D_exec < L10's measured D_exec`
    // (`docs/level-design.md` §6 V0.6 / ADR-design-0001; `docs/level-difficulty.md`
    // §3.3). It is deliberately **not** a general "this level uses a portal" tag: a
    // post-debut portal level (L12+) must declare its own lesson/obligation, because
    // the par cap and the below-OFFERED grade are properties of the *debut*, exactly
    // like the §3 construction bullets that apply to Aha #1 only (`latchAhaGates`).
    levelId: 11,
    lesson:
      "M2 debut: the portal — a channel that is only alive in one phase; entering its end in that phase moves me without spending a move, and the crossing is on every par route",
    obligation: "portal-aha-2",
    // The L6 precedent, recorded on the row rather than special-cased by id
    // (docs/level-difficulty.md §3.4's construction floor: a debut "teaches **below
    // OFFERED** — demonstrated by walking, not demanded (the L6 precedent
    // `switchRequired = false`, a named concession never scored as FORCED)";
    // docs/level-design.md §6). L11's latch sits on the only 4-move route (gate (ii)
    // PASSes) but the walking world still solves in 7, so the board is *not*
    // load-bearing in the all-OFF sense — the same deliberate price L6 pays, and the
    // reason this row is `"exempt"` instead of `"required"`.
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §2 L11 + §5 (L11–L15 block) + §6 (pre-registered seam law) · docs/level-difficulty.md §3.3/§3.4 · src/levels/README.md §0/§2c",
  },
  // ── L12–L15 — the block's four members, on the law GD-011 published as §6.1 ──
  //
  // One obligation kind (`block-l1215`) for the four rows, because the law is a
  // **block** law: the par ramp is a property of the set (P2's step), the dip is a
  // property of its first member, and the tail clause is a property of its last.
  // `blockL1215Gates` therefore reads `BLOCK_L1215_PAR_EXPECTATION` *by member
  // index* and is the single implementation behind all four rows; the rows carry
  // only the lesson text the player is meant to meet at that member.
  //
  // `switchRequired: "exempt"` on all four is **G4** (ADR §5 / §6.1.3) and is
  // measured, not conceded: the all-OFF world still solves on 4/4, exactly 2 moves
  // slower than par (`allOffShortest` 6/8/10/12 vs par 4/6/8/10), so the latch
  // grades `par`, never solvability. It is `"exempt"` and **not `null`**: these
  // boards *do* carry a latch lesson (`null` would mean "no latch lesson at all"),
  // and G1 gives the exemption teeth.
  {
    levelId: 12,
    lesson:
      "block rest beat: the same plan shape (channel → latch → door) on a different skeleton — the channel re-prices the route (7 → 4) without being the only door, so the dip is a choice-narrowing rest, not a shorter level",
    obligation: "block-l1215",
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §6.1.2 (two-beat dip; L12 owns §6's successor slot — single-beat rejected) + §6.1.3 G4 · ADR-design-0003 §4/§6.1 · measured: par 4 at the P1 floor, D_exec 8.230769 < L11's 8.573171, portalFree true (walk-only solves in 7), allOffShortest − par = 2 · docs/level-difficulty.md §5.2 · src/levels/README.md §0b/§2c",
  },
  {
    levelId: 13,
    lesson:
      "escalation begins: the sealed line makes the channel the ONLY door — the walk-only world is unsatisfiable, so from here the portal is the solvability load, not a shortcut (Aha #2's real step)",
    obligation: "block-l1215",
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §6.1.2 reason 3 (mandatory channel from L13) + §6.1.3 G4 · ADR-design-0003 §6.2 C14 · measured: par 6 (P2 step), D_exec 10.898734, portalFree FALSE (walk-only UNSATISFIABLE, the sealed line x = 4 entered only from the q-flipped side), allOffShortest − par = 2, refusedBeforeEnteredTiles 5 · docs/level-difficulty.md §5.2 · src/levels/README.md §0b/§2c",
  },
  {
    levelId: 14,
    lesson:
      "the ramp's second step, same plan shape one row taller: escalation by board growth and route count (3 → 10 par routes), not by a new idea",
    obligation: "block-l1215",
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §6.1.2 (ramp without a new idea) + §6.1.3 G4 · ADR-design-0003 §6.3 · measured: par 8, D_exec 12.957895 (+2.059161, the Δpar step carrying the ramp), portalFree FALSE, allOffShortest − par = 2, parRoutes 10 · docs/level-difficulty.md §5.2 · src/levels/README.md §0b/§2c",
  },
  {
    levelId: 15,
    lesson:
      "block end: the frozen §6 clause fires POSITIVE — the sawtooth closes above the previous block's peak; the hardest board is the least 'fake hard' (forcedMoveRatio 0.0000, 15 par routes) and the block's only B-phase channel",
    obligation: "block-l1215",
    switchRequired: "exempt",
    evidence:
      "docs/level-design.md §6 (block-end clause, frozen V0.6) + §6.1.2 + §6.1.3 G4 · ADR-design-0003 §6.4 (122 block-floor rejections: the clause was a filter, never a target) · measured: par 10 (exactly the P3 ceiling), D_exec 14.969697 > 13.64 AND > 13.642857, coverage 35/35 at par (every tile visited), portalFree FALSE, allOffShortest − par = 2 · docs/level-difficulty.md §5.2 · src/levels/README.md §0b/§2c",
  },
  // ── L16–L19 — the L16+ block's four members, on the law R-003c encodes ─────
  //
  // One obligation kind (`block-l1619`) for the four rows, for the same reason as
  // `block-l1215`: the rung is a property of a **member's index in the ladder**
  // (`par = par(L15) + 2·(id − 15)`), coverage/grid is a property of the device,
  // and the tail ceiling is a property of the last member. `blockL1619Gates`
  // therefore reads `BLOCK_L1619_PAR_EXPECTATION` by member index and is the
  // single implementation behind all four rows.
  //
  // `switchRequired: "required"` on all four — and it is **measured**, not
  // asserted: the device is a **goal-gated full seal** (every approach to the goal
  // is a door), so with every switch OFF the goal is unreachable
  // (`allOffGoalReachable = false`, all-OFF goal-unreachable on 4/4; the
  // all-OFF subgraph is 64/259, 63/259, 56/467, 54/923 states). That is strictly
  // **stronger** than the L12–L15 block's `"exempt"` rows, where the all-OFF world
  // still solves exactly 2 moves slower: here the latch carries *existence*, which
  // is why ADR-design-0003 §5's "the latch grades par, never solvability" does not
  // transfer and the obligation is not waived.
  {
    levelId: 16,
    lesson:
      "the goal-gated latch: the switch opens the door, and the door is the goal's only approach — with every switch off the goal cannot be reached at all",
    obligation: "block-l1619",
    switchRequired: "required",
    evidence:
      "docs/level-design.md §6.1.4 (the reusable unit is the plan shape, never the board) + §6.1.3 G2/G3 · docs/ai-native-pipeline.md §8.12 (LV-010 rung 1) + §8.13 (R-003c registration) · measured: par 12 = par(L15) + 2·1, D_exec 17.100000, B 1.7000 (F-L16-2: the one NAMED band excursion), coverage 42/42 at 7 × 6, all-OFF UNSATISFIABLE, parRoutes press-then-cross 20/20, refusedBeforeEnteredTiles 8 · docs/level-difficulty.md §5.2 · src/levels/README.md §2e",
  },
  {
    levelId: 17,
    lesson:
      "the latch costs a real detour: the goal is sealed by both of its neighbours, and the two plans (press either switch) are the same length",
    obligation: "block-l1619",
    switchRequired: "required",
    evidence:
      "docs/ai-native-pipeline.md §8.12 (LV-010 rung 2) + §8.13 · measured: par 14 = par(L15) + 2·2, D_exec 19.027027, B 1.6757 (in band), coverage 42/42, all-OFF UNSATISFIABLE, press-then-cross 60/60, refusals 8 · docs/level-difficulty.md §5.2 · src/levels/README.md §2e",
  },
  {
    levelId: 18,
    lesson:
      "the seal widens to THREE doors: escalation is a change of shape (every way into the goal is a door, and there are three switches to find), not a longer walk",
    obligation: "block-l1619",
    switchRequired: "required",
    evidence:
      "docs/ai-native-pipeline.md §8.12 (LV-010 rung 3: door count 2 → 3) + §8.13 · measured: par 16 = par(L15) + 2·3, D_exec 20.907923, B 1.6360 (in band), coverage 42/42, all-OFF UNSATISFIABLE, press-then-cross 189/189, refusals 9 · docs/level-difficulty.md §5.2 · src/levels/README.md §2e",
  },
  {
    levelId: 19,
    lesson:
      "block end and the device's ceiling: the seal closes its fourth side (the goal moves off the edge into the interior, four doors, four switches) — and the ladder stops here, because the measured ceiling of this device is par 18",
    obligation: "block-l1619",
    switchRequired: "required",
    evidence:
      "docs/ai-native-pipeline.md §8.12 (LV-010f rung 4: door count 3 → 4, the goal's own geometry) + §8.13 (the stop, and the two mechanisms a par-20 rung still needs) · measured: par 18 = par(L15) + 2·4 = the device's census ceiling on 7 × 6, D_exec 22.885157 = the block's execution ceiling, B 1.6284 (in band), coverage 42/42, all-OFF UNSATISFIABLE, press-then-cross 231/231, refusals 10 · docs/level-difficulty.md §5.2 · src/levels/README.md §2e",
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

/**
 * The named gates {@link portalAhaGates} adds for the **M2 (portal) debut**: the
 * §3.4 construction floor read on a portal board, plus the pre-registered seam law
 * of `docs/level-design.md` §6 V0.6 / ADR-design-0001 (`D_exec(L11) < L10's measured
 * D_exec`). A closed union for the same reason as {@link AhaGateId}: a gate that is
 * not declared here is a compile error, and every declared gate has a
 * `gate-…` policy code with its own negative control.
 */
export type PortalGateId =
  | "portal-pair-single-opposite-colour"
  | "portal-crossing-on-every-par-route"
  | "portal-par-cap"
  | "portal-teaching-grade-below-offered"
  | "portal-seam-law-execution-axis";

/**
 * The named gates the **L12–L15 block law** adds (ADR-design-0003 §5/§6/§8): the
 * derived par ramp (P1/P2/P3), coverage (P4), the latch grade G1, the portal-load
 * escalation C14, the dip beat C4 and the frozen block-end clause C5. A closed union
 * for the same reason as the two above. G2 and G3 are deliberately **not** new ids:
 * they are the existing `shortest-solution-presses-switch-and-crosses-door` and
 * `refused-then-entered` readers, so the block is judged by the same implementations
 * the latch and portal debuts are (one reader per rule, never a fork).
 */
export type BlockGateId =
  | "block-par-ramp"
  | "block-coverage"
  | "block-latch-par-grade"
  | "block-portal-load"
  | "block-dip-ceiling"
  | "block-tail-exec-budget";

/**
 * The named gates the **L16–L19 block law** adds (R-003c, `docs/ai-native-pipeline.md`
 * §8.13): the derived rung (`par(L15) + 2·(id − 15)`, exactly — this block's rung is a
 * *pin*, not the L12–L15 lower bound), the device's grid + coverage, the goal-gated
 * seal's **existence** grade (the all-OFF world is unsatisfiable — strictly stronger
 * than L12–L15's `advantage ≥ 1` G1, which is why it is its own reader), the
 * escalation cut against the L1–L15 execution ceiling, the `B` band with its **named**
 * excursion register (F-L16-2), and the **terminal ceiling** of the last member.
 *
 * A closed union for the same reason as the three above, and deliberately **not** a
 * growth of {@link BlockGateId}: the two blocks are different laws (a ramp inside the
 * teaching span vs. a ladder climbing past it), and re-using the L12–L15 ids would
 * make one label describe two rules. The two **shared** readers stay shared —
 * `shortest-solution-presses-switch-and-crosses-door` (G2) and `refused-then-entered`
 * (G3) are emitted by this block's gate function as the existing ids, so each rule
 * still has exactly one implementation.
 */
export type BlockL1619GateId =
  | "block-l1619-rung"
  | "block-l1619-grid-coverage"
  | "block-l1619-device-existence"
  | "block-l1619-escalation-cut"
  | "block-l1619-b-band"
  | "block-l1619-tail-ceiling";

export interface NamedGate {
  readonly id: AhaGateId | PortalGateId | BlockGateId | BlockL1619GateId;
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
 *
 * The refusal half reads the **unordered** canonical metric on purpose: gate (ii)
 * is the *route-level* question ("is the toggle required, not incidental?"), while
 * gate (iii) is the *tile-level* beat question and reads the ordered companion
 * (`refusedBeforeEnteredTiles`, LV-007C). The job split is ADR-architecture-0002
 * decision 4; on the shipped ten the two forms are identical, so both gates answer
 * the same way there either way.
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
 * 3. `refused-then-entered` — the crossed door tile is *refused strictly before it
 *    is entered* on one real play trace: the **ordered** companion
 *    `refusedBeforeEnteredTiles ≥ 1` (LV-007C, the code reader for
 *    `docs/level-design.md` §3 (iii) as re-worded at GD-008; ADR-architecture-0002
 *    decision 4). The unordered canonical metric is still measured and reported in
 *    the gate's detail — the difference between the two is the trapped-refusal
 *    set, and only the unordered form carries §8.5's acceptance law;
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
    pressThenCrossGate(par, embeds, verdict),
    refusedBeforeEnteredGate(result),
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
 * Gate (ii) — "every shortest solution presses a switch and then enters a door that
 * switch targets, one the board refused", read off the {@link routeVerdict} probe.
 *
 * Extracted (LV-008) so the M1+M3 debut of the *portal* block (L11) is judged by the
 * **same** gate implementation as Aha #1 rather than by a copy: on L11 the latch sits
 * on the only 4-move route, which is exactly the claim this gate measures, and a
 * second implementation would be a second truth source for one condition. The label
 * and the detail string are byte-identical to the pre-extraction text, so no shipped
 * dump line moves.
 */
function pressThenCrossGate(
  par: number,
  embeds: EmbedMetrics,
  verdict: RouteVerdict,
): NamedGate {
  return {
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
  };
}

/**
 * Gate (iii) — the **ordered** beat (`refusedBeforeEnteredTiles ≥ 1`). Extracted
 * (LV-008) for the same once-implemented reason as {@link pressThenCrossGate}: L11's
 * acceptance explicitly includes the ordered reader, so the debut of the portal block
 * must be judged by the shipped reader and not by a fresh one.
 */
function refusedBeforeEnteredGate(result: SolveResult): NamedGate {
  return {
    id: "refused-then-entered",
    label:
      "refusedBeforeEnteredTiles ≥ 1 — the ordered beat: on one play trace the tile is refused strictly before it is entered (docs/level-design.md §3 (iii), V0.6; ADR-architecture-0002 decision 4)",
    status: result.refusedBeforeEnteredTiles > 0 ? "PASS" : "FAIL",
    detail:
      `refusedBeforeEnteredTiles=${result.refusedBeforeEnteredTiles} tiles=[${result.refusedBeforeEnteredTileList.join(" ")}] ` +
      `(ORDERED reader — LV-007C); unordered companion refusedThenEnteredTiles=${result.refusedThenEnteredTiles} ` +
      `tiles=[${result.refusedThenEnteredTileList.join(" ")}] (canonical #7, §8.5's acceptance carrier — the difference between the two is the trapped-refusal set, a beat no player can witness)`,
  };
}

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
 * The §3.4 **construction floor** for the M2 (portal) debut, as a number: "the debut
 * level … is short (**par ≤ 4** in the teaching span, L1–L15)" — the same floor
 * `docs/level-design.md` §6 records for L6 (par 4) and L11's own hook row asks for.
 */
export const PORTAL_DEBUT_PAR_CAP = 4;

/**
 * The **pre-registered** seam-law budget for the M2 debut, in `D_exec` units:
 * `docs/level-design.md` §6 (V0.6, ADR-design-0001) and `docs/level-difficulty.md`
 * §3.3 publish "`D_exec(L11) < 13.64` ⇔ `D(L11) < 33.64`" **before any candidate
 * existed**, so the bound cannot be fitted after the fact.
 *
 * 13.64 is the *published* 2-dp form of L10's measured `D_exec` = 13.642857
 * (`docs/level-difficulty.md` §5.2, pinned by `tests/solver/difficulty.test.ts` §2c
 * and re-derived here in the suite from the shipped `l010.json`), so the bound is
 * **strictly below** the shipped value it was read from: using it makes the law
 * harder to satisfy than "beat L10 exactly", never easier.
 */
export const PORTAL_DEBUT_EXEC_BUDGET = 13.64;

/**
 * ── The **L12–L15 block law** (ADR-design-0003; `docs/level-design.md` §6.1) ──
 *
 * Published by GD-011 **before** integration (task GD-011), so the L12–L15 numbers
 * are law rather than precedent — the anti-post-hoc guarantee that made the L11
 * clause credible. LV-009-B *encodes* these constants; it fits nothing: the ramp is
 * the unique solution of floor ∩ step ∩ ceiling ∧ a four-member block (uniqueness
 * proof: ADR §3 / §6.1.1), the latch grade is the §6.1.3 paragraph plus the four
 * checkable obligations G1–G4 (ADR §5), and **no `D`/`D_exec` target is published
 * anywhere above L11** — §3.5's deliberate silence stands, and the block's only
 * numeric `D_exec` clause is §6's already-frozen block-end bound.
 *
 * Deliberately **separate** from {@link PORTAL_DEBUT_PAR_CAP} /
 * {@link PORTAL_DEBUT_EXEC_BUDGET}: those are the **L11 debut's** obligations and
 * must never be re-purposed (ADR §8 item 1). The reason is already written above the
 * L11 lesson row — a post-debut portal level declares *its own* lesson, because the
 * par cap and the below-OFFERED grade are properties of the **debut**.
 */

/** P1 — the block's par skeleton is pinned to the game's floor (ADR §3). */
export const BLOCK_L1215_PAR_FLOOR = 4;

/** P2 — the within-block par step: `Δpar = 1` would not guarantee §3.4's ramp. */
export const BLOCK_L1215_PAR_STEP_MIN = 2;

/** P3 — the teaching-span ceiling; L15 lands exactly on it (§6.1.1). */
export const BLOCK_L1215_PAR_CEILING = 10;

/**
 * `P1 ∧ P2 ∧ P3 ∧ exactly four members ⇒ 4/6/8/10`, and no other ramp: `(4,6,8,11)`
 * and `(4,7,9,11)` break P3, `(4,6,7,9)` and `(4,5,7,9)` break P2, and any
 * `par(L12) ≠ 4` breaks P1. `4 + 2·3 = 10` lands **on** the ceiling, which is why
 * the shape is derived rather than chosen (ADR §3).
 */
export const BLOCK_L1215_PAR_EXPECTATION: readonly number[] = [4, 6, 8, 10];

/** The block's members, in order (`docs/game-design.md` §8: L11–L15; L11 is the debut). */
export const BLOCK_L1215_IDS: readonly number[] = [12, 13, 14, 15];

/**
 * **G1** — the latch must be worth at least this many moves over the all-OFF world.
 * "Worth 0" means the switch is **inert**, which is a validator defect class rather
 * than a grade (ADR §5, §7): an unteethed `switchRequired: "exempt"` would invite the
 * "the latch is decoration" drift this obligation exists to catch.
 */
export const BLOCK_LATCH_MIN_PAR_ADVANTAGE = 1;

/**
 * §6's **frozen** block-end clause as a bound: `D_exec` of the block's **last**
 * member exceeds 13.64 (the published 2-dp form of L10's measured `D_exec`, and
 * strictly below the measured 13.642857 it was read from, so the bound is harder to
 * satisfy than "beat L10 exactly"). A separate constant on purpose: re-using
 * {@link PORTAL_DEBUT_EXEC_BUDGET} here would read this clause as the *debut's*.
 */
export const BLOCK_L1215_TAIL_EXEC_FLOOR = 13.64;

/**
 * **C4**'s dip ceiling: the shipped L11's measured `D_exec` = 8.573171 (ADR §4,
 * `docs/level-difficulty.md` §5.2 row L11, pinned by `tests/solver/difficulty.test.ts`).
 * The block's **first** member must stay strictly below it — that is what makes L12
 * the dip's second beat rather than another ramp member. Published at 6 dp, the
 * precision the ADR table prints; the suite re-derives it from the shipped `l011.json`
 * so a re-authored L11 cannot leave this constant silently stale.
 */
export const BLOCK_L1215_DIP_CEILING = 8.573171;

/** The portal-load grade a member of the block is authored to (`§6.1.2` reason 3). */
export type BlockPortalLoad = "shortcut" | "mandatory";

/**
 * **C14** — the block's teaching escalation, per level: the portal starts as a
 * *re-pricing shortcut* (L12: the walking world still solves, 7 → 4) and becomes
 * **the only door** from L13 up (walk-only world **UNSATISFIABLE**, measured). That
 * this is a change of *kind* rather than of move count is the block's honest content
 * (ADR §4 reason 3, §6.1.2).
 */
export const BLOCK_L1215_PORTAL_LOAD: Readonly<Record<number, BlockPortalLoad>> = {
  12: "shortcut",
  13: "mandatory",
  14: "mandatory",
  15: "mandatory",
};

/**
 * ── The **L16–L19 block law** (R-003c; `docs/ai-native-pipeline.md` §8.13) ────
 *
 * The second block, and the first one that climbs **past** the teaching span: L15
 * ends the M2 block on the P3 ceiling (`par 10`), and these four rungs carry the
 * ladder on with the device that was found — a **goal-gated full seal** (every
 * approach to the goal is a door, so existence itself depends on the latch:
 * measured, the all-OFF world is unsatisfiable on 4/4).
 *
 * Where the law comes from, in order, so nothing here is fitted after the fact:
 *
 * 1. **The rung is derived**: `par ≥ par(L15) + 2·(id − 15)` is GD-011's §6.1.1 P2
 *    non-seam step carried past the span. The *selection* gate during authoring was
 *    the lower bound (`scripts/author-l16-candidates.ts`); the **registration** law
 *    here is the **exact** value, because by the time the block ships the rung has
 *    been measured on the landed bytes: a board longer than its rung is a different
 *    board, and shipping it under this id would silently re-price the ladder.
 * 2. **The escalation basis is the frozen cut**: `max D_exec` over L1–L15
 *    ({@link BLOCK_L1619_CUT_FLOOR}, = L15's own 14.969697), re-attested by
 *    `a19a347`'s `scripts/attest-lv010-cut.ts` on an isolated byte-copy of the
 *    fifteen files **before** any candidate was authored. Every rung must clear it,
 *    and each rung must also clear its predecessor — the second half is a ladder
 *    property and is measured over the block by `scripts/attest-lv010-block.ts`.
 * 3. **The ceiling is a census result, not a target**: `--stage=f` enumerated the
 *    sealed-column families completely and measured that the bare route reaches
 *    `par 14` and no further on 7 × 6, that the goal-gated full seal's ceiling at
 *    7 × 6 is exactly `par 18` at every seal arity, and that 7 × 7 does reach
 *    `par 22` only with a seal **byte-identical in shape** to L19's — i.e. a longer
 *    press detour on an already-taught shape, refused as a rung's escalation (LV-010f
 *    §8.12). That is why {@link BLOCK_L1619_TAIL_EXEC_CEILING} is a **ceiling**
 *    (an equality at the last member) and not a floor: there is nothing above it to
 *    climb to with this device, and a rung above it would need a new mechanism.
 *
 * Deliberately **separate** from the L12–L15 constants above: those four are a
 * *ramp inside the teaching span* with a published ceiling, these four are a
 * *ladder past it* with no published `D`/`D_exec` target anywhere (§3.5's silence
 * stands — the only numeric execution clause here is the **tail ceiling**, which is
 * the last member's own measurement recorded as the device's limit).
 */

/** The block's first rung's predecessor: `par(L15) = 10` (measured, not typed by hand in a gate). */
export const BLOCK_L1619_PAR_BASE = 10;

/** §6.1.1 P2's non-seam step, carried past the span: `Δpar = 2` per rung. */
export const BLOCK_L1619_PAR_STEP = 2;

/** The block's members, in order (`docs/game-design.md` §8; L15 is the predecessor rung). */
export const BLOCK_L1619_IDS: readonly number[] = [16, 17, 18, 19];

/**
 * `par(L15) + 2·(id − 15)` for the four members ⇒ `12 / 14 / 16 / 18`. Derived from
 * the two constants above, so a re-based ladder moves the whole expectation at once
 * rather than one hand-typed row at a time.
 */
export const BLOCK_L1619_PAR_EXPECTATION: readonly number[] = BLOCK_L1619_IDS.map(
  (id) => BLOCK_L1619_PAR_BASE + BLOCK_L1619_PAR_STEP * (id - 15),
);

/**
 * **C1** — the escalation basis: the frozen cut, `max D_exec` over the L1–L15 dataset
 * = L15's measured `14.969697` (`scripts/attest-lv010-cut.ts`, transcript committed at
 * `a19a347`; re-derived by `scripts/attest-lv010-block.ts` on every run). Every member
 * of this block must clear it, so the block starts *above* everything already shipped.
 */
export const BLOCK_L1619_CUT_FLOOR = 14.969697;

/**
 * **C5** — the device's grid. All four members are authored on 7 × 6 = 42 tiles, and
 * 42/42 distinct positions are visited at par on all four (measured). The grid is part
 * of the *law* rather than a coincidence because the ceiling argument is a 7 × 6
 * census: the same seal on 7 × 7 reaches `par 22` with an identical shape, which the
 * design refused as a rung's escalation, so a member authored on another grid is a
 * **different device** and would need its own census before it could claim a rung.
 */
export const BLOCK_L1619_GRID: readonly [number, number] = [7, 6];

/** **C7** — the device's par ceiling: `par 18` is what the 7 × 6 goal-gated full-seal census reaches, at every seal arity. */
export const BLOCK_L1619_DEVICE_CEILING_PAR = 18;

/**
 * **C5** — the **terminal ceiling**: `D_exec(L19) = 22.885157` at `par 18`. An
 * equality on purpose, and the difference from
 * {@link BLOCK_L1215_TAIL_EXEC_FLOOR} is the point: L12–L15's last member had to
 * *clear* a published floor, while this block has run out of device — the census
 * proved `par 18` is the ceiling at every seal arity on 7 × 6 — so the last member's
 * execution axis is the block's **recorded limit**. A rung above it (L20) is not a
 * longer walk: it needs a new mechanism (a gauntlet, or a sealed portal landing),
 * and it may not be claimed by relaxing this number. Re-authoring L19 itself would
 * move this constant in the same commit as its re-measurement, never afterwards.
 */
export const BLOCK_L1619_TAIL_EXEC_CEILING = 22.885157;

/**
 * **C6** — the `B` band, as the shipped L1–L15 set itself reports it: `[1.2500,
 * 1.6875]` (`a19a347`'s cut attestation; re-derived live by
 * `scripts/attest-lv010-block.ts`). §6.1.1's self-correcting guard says an
 * out-of-band `B` must be **named** and the ramp re-checked on `D_exec` — it never
 * says the band may be widened.
 */
export const BLOCK_L1619_B_BAND: readonly [number, number] = [1.25, 1.6875];

/**
 * The **named** `B` excursions, by rung — the register §6.1.1 asks for, kept as data
 * so a second excursion cannot appear without a second, deliberate entry. `l016`
 * measures `B = 1.7000` against the shipped top `1.6875` (F-L16-2); the rung
 * escalates on `D_exec` (`17.100000 > 14.969697`), and `l017`/`l018`/`l019` were
 * selected in band (1.6757 / 1.6360 / 1.6284) so the excursion is not compounded.
 * Every rung outside the band that is **not** listed here fails
 * `block-l1619-b-band` by name.
 */
export const BLOCK_L1619_NAMED_B_EXCURSIONS: Readonly<Record<number, string>> = {
  16: "F-L16-2: B=1.7000 above the shipped band top; the rung escalates on D_exec, the excursion is named, never widened",
};

/**
 * The **L16–L19 block's** named gates (R-003c). Read by `auditLevel` for a level whose
 * lesson row carries the `block-l1619` obligation — the four shipped rows, exactly as
 * `block-l1215` routes L12–L15 to `blockL1215Gates`.
 *
 * Returned in a stable, documented order:
 *
 *   1. `block-l1619-rung` — **C1/P2**: `par` is *exactly* the derived rung for this
 *      member of {@link BLOCK_L1619_IDS}, and the file's authored `par` equals the
 *      measured one, so neither can drift quietly.
 *   2. `block-l1619-grid-coverage` — **C5/P4**: the member is authored on
 *      {@link BLOCK_L1619_GRID} and every one of its 42 tiles is reachable
 *      (`distinctPositions == width × height`) — the board is sized to the route, not
 *      padded, and the ceiling argument of the census applies to it.
 *   3. `block-l1619-device-existence` — **C2**: the **all-OFF world is
 *      unsatisfiable** — the seal makes existence itself depend on the latch. This is
 *      the block's substitute for L12–L15's G1 and it is *stronger*: `null`
 *      (unreachable) passes, a finite all-OFF walk fails by name.
 *   4. `block-l1619-escalation-cut` — **C3**: `D_exec` clears
 *      {@link BLOCK_L1619_CUT_FLOOR} **and** the identity `D_exec = par + 3·B` holds,
 *      which is the same statement as `T ≡ R ≡ 0` inside §4's acceptance region (`L` is
 *      the par). A board with a dead pocket or an unrecoverable move fails here.
 *   5. `shortest-solution-presses-switch-and-crosses-door` — **G2**, the shared reader:
 *      every par route presses a switch and crosses a door that switch drives.
 *   6. `refused-then-entered` — **G3**, the shared ordered reader: the refusal the
 *      player is meant to witness really happens before the acceptance.
 *   7. `block-l1619-b-band` — **C6**: `B` inside {@link BLOCK_L1619_B_BAND} unless the
 *      rung is in {@link BLOCK_L1619_NAMED_B_EXCURSIONS}.
 *   8. `block-l1619-tail-ceiling` — **C7**, *only on the block's last member*: the
 *      terminal ceiling, `par == BLOCK_L1619_DEVICE_CEILING_PAR` **and**
 *      `D_exec == `{@link BLOCK_L1619_TAIL_EXEC_CEILING}. The block's stop is a
 *      measurement, and this gate is where the measurement lives.
 *
 * Deliberately **absent**: `dual-phase-tiles`. It is the portal board's reader and it
 * has no portal-specific lesson to add here — the members carry a portal (the device
 * needs the displacement to be solvable at these pars), but gate (iv) is the M2
 * *debut's* escalation channel and `l011`–`l015` already own it; re-asserting it would
 * make this block's law read as a portal law. It stays reported per level by the
 * `--audit` / metrics readers, and its measured values (24/24/18/18) are recorded in
 * `src/levels/README.md` §0b.
 */
export function blockL1619Gates(
  level: Level,
  graph: ReachableGraph,
  result: SolveResult,
  embeds: EmbedMetrics,
): readonly NamedGate[] {
  const par = result.shortestSolution ?? level.par;
  const index = BLOCK_L1619_IDS.indexOf(level.id);
  const expected =
    index === -1 ? null : (BLOCK_L1619_PAR_EXPECTATION[index] ?? null);
  const difficulty = analyseDifficulty(level, graph);
  const dexec = difficulty.Dexec;
  // The identity `D_exec = par + 3·B` is what makes "cleared the cut" mean what it says:
  // with `T` or `R` non-zero the execution axis is not `L + 3·B`, and a board with a
  // dead pocket would be graded by a number no player's hands can feel.
  const identity = dexec === null ? null : dexec - (par + 3 * difficulty.B);
  const hasLatch = level.switches.length > 0 && level.doors.length > 0;
  const allOff = hasLatch ? allOffShortestSolution(level, graph) : null;
  const excursion = BLOCK_L1619_NAMED_B_EXCURSIONS[level.id] ?? null;
  const inBand =
    difficulty.B >= BLOCK_L1619_B_BAND[0] && difficulty.B <= BLOCK_L1619_B_BAND[1];
  const onGrid =
    level.width === BLOCK_L1619_GRID[0] && level.height === BLOCK_L1619_GRID[1];
  // The law constants are published at 6 decimal places (the precision the census
  // table prints), so the tail clause is an equality **at that precision**: `D_exec`
  // itself is `par + 3·B` at full float precision, and comparing it bit-for-bit with
  // a 6-dp literal would reject the very board the literal was read from. Half a unit
  // in the last printed place is the widest tolerance that still cannot hide a rung.
  const LAW_PRECISION = 5e-7;

  const gates: NamedGate[] = [
    {
      id: "block-l1619-rung",
      label:
        "C1 / P2 — par is EXACTLY par(L15) + 2·(id − 15) for this member of the L16–L19 ladder (the derived rung, not a lower bound; docs/level-design.md §6.1.1 P2)",
      status:
        expected !== null && level.par === expected && par === expected
          ? "PASS"
          : "FAIL",
      detail:
        `par=${level.par} (solver shortest=${String(result.shortestSolution)}); this member expects ` +
        `${expected === null ? "n/a (not a block member)" : String(expected)}; the derived ladder is ` +
        `${BLOCK_L1619_PAR_EXPECTATION.join(" / ")} from BLOCK_L1619_IDS=[${BLOCK_L1619_IDS.join(", ")}] ` +
        `(base par(L15) = ${String(BLOCK_L1619_PAR_BASE)} + step ${String(BLOCK_L1619_PAR_STEP)}). The selection gate was the ` +
        `lower bound; the REGISTRATION law is the exact rung, because the block ships only after the rung has been measured on ` +
        `the landed bytes — a longer board under the same id would silently re-price the ladder.`,
    },
    {
      id: "block-l1619-grid-coverage",
      label:
        "C5 / P4 — the device's grid and full coverage: 7 × 6 and distinctPositions == width × height (42/42 at par on all four rungs)",
      status:
        onGrid && result.distinctPositions === level.width * level.height
          ? "PASS"
          : "FAIL",
      detail:
        `grid ${level.width} × ${level.height} (law: ${BLOCK_L1619_GRID[0]} × ${BLOCK_L1619_GRID[1]}); ` +
        `distinctPositions=${String(result.distinctPositions)} of ${String(level.width * level.height)}. ` +
        `The grid is law, not decoration: the ceiling argument is a 7 × 6 census (the same seal on 7 × 7 reaches par 22 with a ` +
        `byte-identical shape and was refused as an escalation), so a member authored elsewhere is a different device and must ` +
        `bring its own census. Coverage 42/42 is how §1's board cap is honoured: the board is sized to the route.`,
    },
    {
      id: "block-l1619-device-existence",
      label:
        "C2 — the goal-gated seal: with EVERY switch OFF the goal is unreachable (the latch carries existence, strictly stronger than L12–L15's advantage ≥ 1)",
      status: allOff === null ? "PASS" : "FAIL",
      detail:
        `switch(es)=${String(level.switches.length)} door(s)=${String(level.doors.length)}; ` +
        `allOffGoalReachable=${String(goalReachableWithAllSwitchesOff(level, graph))} ` +
        `allOffShortest=${allOff === null ? "null (UNSATISFIABLE — the required reading)" : String(allOff)} par=${String(par)}. ` +
        `allOffShortest is a restricted walk over the all-OFF subgraph. Measured null on 4/4 (all-OFF subgraph 64/259, 63/259, ` +
        `56/467, 54/923 states with no goal in it) — the device's whole point: every approach to the goal is a door, so the ` +
        `switch is not a shortcut, it is the difference between solvable and not.`,
    },
    {
      id: "block-l1619-escalation-cut",
      label:
        `C3 — the rung clears the frozen L1–L15 execution cut (D_exec > ${BLOCK_L1619_CUT_FLOOR.toFixed(6)}, L15's measured value) AND the identity D_exec = par + 3·B holds (T ≡ R ≡ 0, §4's acceptance region)`,
      status:
        dexec !== null &&
        dexec > BLOCK_L1619_CUT_FLOOR &&
        identity !== null &&
        Math.abs(identity) < 1e-9
          ? "PASS"
          : "FAIL",
      detail:
        `Dexec=${dexec === null ? "n/a (unsolvable)" : dexec.toFixed(6)} > ${BLOCK_L1619_CUT_FLOOR.toFixed(6)} ` +
        `(re-attested on an isolated byte-copy of L1–L15 at a19a347, re-derived by scripts/attest-lv010-block.ts); ` +
        `identity Dexec − (par + 3·B) = ${identity === null ? "n/a" : identity.toExponential(2)} ` +
        `(B=${difficulty.B.toFixed(6)}, T=${String(difficulty.T)}, R=${difficulty.R.toFixed(6)}). ` +
        `The cut is the frozen basis, not a moving one: the block's own members must not raise the filter they are judged by.`,
    },
    pressThenCrossGate(par, embeds, routeVerdict(level, par, result.refusedThenEnteredTileList)),
    refusedBeforeEnteredGate(result),
    {
      id: "block-l1619-b-band",
      label:
        `C6 — effective branching stays inside the band the shipped L1–L15 set reports (${BLOCK_L1619_B_BAND[0].toFixed(4)}..${BLOCK_L1619_B_BAND[1].toFixed(4)}) unless the rung is NAMED in the excursion register`,
      status: inBand || excursion !== null ? "PASS" : "FAIL",
      detail:
        `B=${difficulty.B.toFixed(4)} vs [${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}]; ` +
        `named excursion: ${excursion ?? "none"}. ` +
        `§6.1.1's self-correcting guard says an out-of-band B must be named and the ramp re-checked on D_exec — never that the ` +
        `band may be widened. The band is re-derived from the live L1–L15 files by scripts/attest-lv010-block.ts on every run.`,
    },
  ];

  if (index === BLOCK_L1619_IDS.length - 1) {
    gates.push({
      id: "block-l1619-tail-ceiling",
      label:
        `C7 — the terminal ceiling: the block's LAST member is par ${String(BLOCK_L1619_DEVICE_CEILING_PAR)} at D_exec ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)} — the measured ceiling of the 7 × 6 goal-gated full-seal device, not a floor to beat`,
      status:
        dexec !== null &&
        par === BLOCK_L1619_DEVICE_CEILING_PAR &&
        Math.abs(dexec - BLOCK_L1619_TAIL_EXEC_CEILING) < LAW_PRECISION
          ? "PASS"
          : "FAIL",
      detail:
        `par=${String(par)} (ceiling ${String(BLOCK_L1619_DEVICE_CEILING_PAR)}); ` +
        `Dexec=${dexec === null ? "n/a (unsolvable)" : dexec.toFixed(6)} (ceiling ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)}). ` +
        `The equality is deliberate and it is the block's HONEST STOP: the census measured par 18 as the ceiling at every seal ` +
        `arity on 7 × 6 (arity 2 → 16, arity 3 → 18, arity 4 → 18), so there is no rung above this one to climb to with this ` +
        `device. A par-20 rung needs a NEW mechanism (a gauntlet: every approach to the goal's ring itself behind a door; or a ` +
        `sealed landing: the portal lands in a pocket whose exit is a door — an ordered two-step chain) — neither is built, and ` +
        `L20 is deliberately NOT authored. Widening this number instead of building a mechanism is what this gate forbids.`,
    });
  }

  return gates;
}

/** What the portal needs to be measured off the shortest routes. */
export interface PortalRouteTelemetry {
  /** Shortest routes enumerated (`par` moves, ending on the goal). */
  readonly routes: number;
  /**
   * Routes on which **some** arrival moved the player by more than one tile — i.e. a
   * teleport really happened. A teleport is the only displacement source in
   * `applyMove`, so this is exact, not a heuristic: an ordinary move moves exactly one
   * tile (`docs/architecture.md` §6.2).
   */
  readonly teleportRoutes: number;
  /**
   * Routes on which **some** arrival *clicked* a tile that is an end of a portal whose
   * `activePhase` was the current (pre-flip) phase. Logically equivalent to
   * {@link PortalRouteTelemetry.teleportRoutes} (entry into an active end ⇒
   * unconditional teleport), measured separately on purpose: a divergence would be a
   * real anomaly, and the gate requires both.
   */
  readonly portalEnterRoutes: number;
  /** Total teleporting arrivals over all routes (route-level count above is the gate). */
  readonly teleportArrivals: number;
}

/** Manhattan distance, for the teleport detector (`|Δx| + |Δy| ≠ 1` ⇒ teleport). */
function manhattan(a: Vec, b: Vec): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Enumerate the shortest routes once and report what the **portal** did on them
 * (LV-008). Reads the shipped `forEachParRoute` walk — no second search, no second
 * rule — and derives "the clicked tile" exactly as the metrics of
 * `docs/architecture.md` §8 do (`previous player + direction delta`; the *landing*
 * tile of a teleport is a different tile and is never what entry refusal is decided
 * on, `@/core/solver/bfs`).
 *
 * The start state comes from `graph.nodes[0]` — the same `toSearchState(initialState)`
 * the walk itself starts from — so the first arrival's "previous state" is the level's
 * real initial state and not a lever-free reconstruction of it.
 */
export function portalRouteTelemetry(
  level: Level,
  par: number,
  graph: ReachableGraph,
): PortalRouteTelemetry {
  const activePhaseByEnd = new Map<string, Phase>();
  for (const portalDef of level.portals) {
    for (const end of portalDef.pair)
      activePhaseByEnd.set(coordKey(end), portalDef.activePhase);
  }
  const start = graph.nodes[0];

  let routes = 0;
  let teleportRoutes = 0;
  let portalEnterRoutes = 0;
  let teleportArrivals = 0;

  forEachParRoute(level, par, (route) => {
    routes += 1;
    let teleported = false;
    let enteredActiveEnd = false;
    for (let i = 0; i < route.length; i += 1) {
      const arrival = route[i] as ArrivalRecord;
      const before = i === 0 ? start : route[i - 1]?.state;
      if (before === undefined) continue;
      const clicked = step(before.player, arrival.direction);
      if (activePhaseByEnd.get(tileKey(clicked)) === before.phase)
        enteredActiveEnd = true;
      if (manhattan(before.player, arrival.state.player) !== 1) {
        teleported = true;
        teleportArrivals += 1;
      }
    }
    if (teleported) teleportRoutes += 1;
    if (enteredActiveEnd) portalEnterRoutes += 1;
  });

  return { routes, teleportRoutes, portalEnterRoutes, teleportArrivals };
}

/**
 * The **M2 debut gate suite** (`portal-aha-2`) — the named conditions the portal-block
 * debut must satisfy, one gate per documented requirement of
 * `docs/level-design.md` §6 / `docs/level-difficulty.md` §3.3–§3.4:
 *
 * 1. `dual-phase-tiles` — gate (iv) of `docs/level-design.md` §3, the **only**
 *    condition that is unsatisfiable before L11 and the reason the schedule puts M2
 *    here (`dualPhaseGate`; on a portal board `0` is a loud FAIL, never an
 *    escalation).
 * 2. `shortest-solution-presses-switch-and-crosses-door` — the M1+M3 unit is on
 *    **every** shortest route, not decoration (the same reader Aha #1 uses, so the
 *    two debuts are judged by one implementation).
 * 3. `refused-then-entered` — the ordered beat, as the dispatch's acceptance list
 *    requires (`refusedBeforeEnteredTiles ≥ 1`, the LV-007C reader).
 * 4. `portal-pair-single-opposite-colour` — "a single opposite-colour portal pair":
 *    exactly one channel, ends on opposite checkerboard colours (ADR-0009 decision 5 /
 *    `docs/level-design.md` §1). A second pair would be the *other* phase's channel —
 *    two mechanics where the debut may introduce one.
 * 5. `portal-crossing-on-every-par-route` — the "no false routes" half that is
 *    specific to this board: no shortest route may reach the goal without teleporting,
 *    or the portal is bypassable decoration and the level does not teach what it
 *    claims.
 * 6. `portal-par-cap` — `par ≤ 4` (the §3.4 construction floor; authored **and**
 *    measured, so neither can move past the cap unnoticed).
 * 7. `portal-teaching-grade-below-offered` — the debut's grade: the **portal-free
 *    world still solves** (the L6 `switchRequired = false` precedent, `§3.4`). The
 *    portal may be rewarded in par (gate 5) but must not be *demanded*.
 * 8. `portal-seam-law-execution-axis` — the pre-registered falsifiable prediction:
 *    `D_exec < 13.64` (⇔ `D < 33.64`), against {@link PORTAL_DEBUT_EXEC_BUDGET}.
 *
 * Deliberately **absent**: gate (i) (`no-solution-with-switches-off`). The debut's
 * construction floor asks for the new mechanic to be *demonstrated, not demanded*, and
 * on a portal-bearing board the checkerboard argument that makes an all-OFF refusal
 * (L7–L10) or an all-OFF solution (L6) a single well-defined fact no longer applies —
 * a walking route and a teleporting route can stand in different phase relations to
 * the same door tile. Whether L11's latch is load-bearing is therefore recorded on its
 * lesson row (`switchRequired: "exempt"`, the L6 pattern) and measured through gate
 * (2), not through a condition that would misread a portal board. This omission is
 * stated here rather than left to inference.
 */
export function portalAhaGates(
  level: Level,
  graph: ReachableGraph,
  result: SolveResult,
  embeds: EmbedMetrics,
): readonly NamedGate[] {
  const par = result.shortestSolution ?? level.par;
  const telemetry = portalRouteTelemetry(level, par, graph);
  const verdict = routeVerdict(level, par, result.refusedThenEnteredTileList);
  const pair = portalPairVerdict(level);
  const portalFree = portalFreeWorldVerdict(level);
  const difficulty = analyseDifficulty(level, graph);
  const dexec = difficulty.Dexec;

  return [
    dualPhaseGate(level, result),
    pressThenCrossGate(par, embeds, verdict),
    refusedBeforeEnteredGate(result),
    {
      id: "portal-pair-single-opposite-colour",
      label:
        "exactly one portal pair, its two ends on opposite checkerboard colours, one channel phase (docs/level-design.md §1 opposite-colour law; acceptance: “a single opposite-colour portal pair”)",
      status:
        level.portals.length === 1 && pair.oppositeColour ? "PASS" : "FAIL",
      detail:
        `portals=${level.portals.length} (the debut introduces ONE channel; a second pair — in particular one with the ` +
        `other activePhase — is a second mechanic, docs/level-difficulty.md §3.4 "single-concept"); ` +
        `pair=[${pair.ends.join(" ⇄ ")}] (x+y parities ${pair.parities.join(" / ")}) ⇒ opposite checkerboard colours: ` +
        `${String(pair.oppositeColour)}; activePhase=${pair.phase ?? "n/a"} (one value per pair, so only that phase shows ` +
        `the channel); ADR-0009 decision 5 — a same-colour pair is inert and the validator hard-rejects it (0/400 legal)`,
    },
    {
      id: "portal-crossing-on-every-par-route",
      label:
        "every par route really teleports — no shortest route reaches the goal without entering an active portal end (the “no false routes” half of the debut's construction floor)",
      status:
        telemetry.routes > 0 &&
        telemetry.teleportRoutes === telemetry.routes &&
        telemetry.portalEnterRoutes === telemetry.routes
          ? "PASS"
          : "FAIL",
      detail:
        `par=${par}: routes=${telemetry.routes}; routes with a teleporting arrival (|Δposition| ≠ 1)=${telemetry.teleportRoutes}; ` +
        `routes entering an active portal end=${telemetry.portalEnterRoutes}; teleporting arrivals=${telemetry.teleportArrivals}. ` +
        `(Both counters are required: a teleport is the only displacement source in applyMove, so a divergence between them ` +
        `would be an anomaly. A par route that walks the whole way means the portal is bypassable decoration — the level ` +
        `claims to teach the channel and does not.)`,
    },
    {
      id: "portal-par-cap",
      label:
        "par ≤ 4 for the M2 debut (docs/level-difficulty.md §3.4 construction floor: “short (par ≤ 4 in the teaching span, L1–L15)”)",
      status:
        level.par <= PORTAL_DEBUT_PAR_CAP && par <= PORTAL_DEBUT_PAR_CAP
          ? "PASS"
          : "FAIL",
      detail:
        `par=${level.par} (solver shortest=${String(result.shortestSolution)}) cap=${PORTAL_DEBUT_PAR_CAP}; ` +
        `the authored and the measured value are both checked, so neither can move past the cap unnoticed.`,
    },
    {
      id: "portal-teaching-grade-below-offered",
      label:
        "below OFFERED: the portal-free world still solves — the mechanic is demonstrated and rewarded in par, not demanded (docs/level-difficulty.md §3.4, the L6 precedent)",
      status: portalFree.solvable ? "PASS" : "FAIL",
      detail:
        `portal-free world (same board, portals: []): solvable=${String(portalFree.solvable)} ` +
        `shortest=${portalFree.shortest === null ? "n/a" : String(portalFree.shortest)} vs par=${par}` +
        (portalFree.solvable
          ? ` — the walking world still finishes ${portalFree.shortest === par ? "in the same number of moves" : `${String((portalFree.shortest ?? 0) - par)} move(s) slower`}, so the portal is a shortcut, not a requirement (the L6 "switchRequired = false" precedent, recorded on this level's lesson row as switchRequired: "exempt" and in docs/ai-native-pipeline.md §8.8).`
          : ` — the portal is REQUIRED for solvability: the debut would ship at the FORCED grade, which the construction floor forbids (docs/level-difficulty.md §3.4). Reject and re-author.`),
    },
    {
      id: "portal-seam-law-execution-axis",
      label:
        "D_exec < 13.64 for the M2 debut — the pre-registered falsifiable prediction (docs/level-design.md §6 V0.6 / ADR-design-0001; ⇔ D < 33.64)",
      status: dexec !== null && dexec < PORTAL_DEBUT_EXEC_BUDGET ? "PASS" : "FAIL",
      detail:
        `Dexec=${dexec === null ? "n/a (unsolvable)" : dexec.toFixed(4)} ` +
        `(D=${difficulty.D === null ? "n/a" : difficulty.D.toFixed(4)} − 5·M(${difficulty.M}) = ` +
        `1·L(${String(difficulty.L)}) + 3·B(${difficulty.B.toFixed(4)}) + 4·T(${difficulty.T}) + 2·R(${difficulty.R.toFixed(4)})) ` +
        `< ${PORTAL_DEBUT_EXEC_BUDGET} = the published 2-dp form of L10's measured D_exec (13.642857, docs/level-difficulty.md §5.2) — ` +
        `the bound is strictly below the shipped value it was read from, so it is not a flattering rounding. ` +
        `Pre-registered before any L11 candidate existed; a candidate that breaks it is rejected whatever its other virtues.`,
    },
  ];
}

/**
 * The **L12–L15 block's** named gates (ADR-design-0003 §5/§6/§8). Read by
 * `auditLevel` for a level whose lesson row carries the `block-l1215` obligation —
 * the four shipped rows, exactly as `portal-aha-2` routes L11 to `portalAhaGates`.
 *
 * Returned in a stable, documented order:
 *
 *   1. `block-par-ramp` — **C1 / P1·P2·P3**: `par` *is* the expectation entry for this
 *      member of {@link BLOCK_L1215_IDS}, and the file's authored `par` equals it, so
 *      the ramp cannot drift and neither the authored nor the measured value can move
 *      quietly. The failure detail prints the whole derived ramp, so a future author
 *      sees *why* the expected number is what it is (floor ∩ step ∩ ceiling ∧ 4).
 *   2. `block-coverage` — **C2 / P4**: `distinctPositions == width × height`. Coverage
 *      is how §1's board cap is honoured without padding: the board is sized to the
 *      route, not the other way round (ADR §6.1 `l015TemplateFamily` note: 35/35 at
 *      par 10 means every tile of a 7 × 5 board is visited).
 *   3. `block-latch-par-grade` — **C7 / G1**: the all-OFF world still solves, but
 *      **exactly `BLOCK_LATCH_MIN_PAR_ADVANTAGE` (or more) moves slower**. Grade
 *      (a) of ADR §5: the latch grades `par`, never solvability, and the latch must
 *      not be decoration. A board with no latch at all fails by name (the rows carry
 *      a latch lesson — G4).
 *   4. `block-portal-load` — **C14**: the per-level portal-load grade of
 *      {@link BLOCK_L1215_PORTAL_LOAD}. `"shortcut"` (L12) requires the walking world
 *      to still solve — the consolidation beat; `"mandatory"` (L13+) requires it to be
 *      **unsatisfiable**, i.e. the sealed channel really is the only door.
 *   5. `dual-phase-tiles` — gate (iv), **C10**, the existing reader (a portal board
 *      with 0 is a loud FAIL, never an escalation).
 *   6. `shortest-solution-presses-switch-and-crosses-door` — gate (ii)'s shape,
 *      **C8 / G2**: every par route presses the switch *and* crosses the door, so the
 *      Aha is "the door opened", not "I walked around it".
 *   7. `refused-then-entered` — **C9 / G3**, the **ordered** reader: the player can
 *      actually witness refused-first-entered-later. (The unordered companion is the
 *      canonical metric and stays the one `lesson-latch-dynamism` reads; the two legs
 *      are deliberately not re-stitched — ADR-architecture-0002 decision 4.)
 *   8. `block-dip-ceiling` — **C4**, *only on the block's first member*: `D_exec`
 *      strictly below {@link BLOCK_L1215_DIP_CEILING} (the shipped L11's measured
 *      value), which is what makes that level the dip's second beat.
 *   9. `block-tail-exec-budget` — **C5**, *only on the block's last member*: §6's
 *      frozen block-end clause, `D_exec > `{@link BLOCK_L1215_TAIL_EXEC_FLOOR}.
 *
 * Deliberately **absent**: gate (i) `no-solution-with-switches-off`. Per ADR §5 that
 * obligation belongs to the **latch unit's own block** (L7–L10, Aha #1), and
 * re-asserting it here would subordinate this block's lesson (Aha #2) to the previous
 * one — `policy.ts`'s L11 row already states the principle. G1/G2/G3 are the
 * substitute teeth, and they are par-grade teeth only, which is stated rather than
 * hidden.
 */
export function blockL1215Gates(
  level: Level,
  graph: ReachableGraph,
  result: SolveResult,
  embeds: EmbedMetrics,
): readonly NamedGate[] {
  const par = result.shortestSolution ?? level.par;
  const index = BLOCK_L1215_IDS.indexOf(level.id);
  const expected =
    index === -1 ? null : (BLOCK_L1215_PAR_EXPECTATION[index] ?? null);
  const hasLatch = level.switches.length > 0 && level.doors.length > 0;
  const allOff = hasLatch ? allOffShortestSolution(level, graph) : null;
  const advantage = allOff === null ? null : allOff - par;
  // An unsatisfiable all-OFF world outranks G1: the latch then carries *existence*,
  // which is stricter than `≥ 1`, so G1 passes on it. (No member of the block reads
  // that way today — all four solve all-OFF, exactly 2 moves slower than par.)
  const latchGrade =
    hasLatch &&
    (allOff === null ||
      (advantage ?? 0) >= BLOCK_LATCH_MIN_PAR_ADVANTAGE);
  const portalFree = portalFreeWorldVerdict(level);
  const load = BLOCK_L1215_PORTAL_LOAD[level.id] ?? null;
  const dexec = analyseDifficulty(level, graph).Dexec;
  const verdict = routeVerdict(level, par, result.refusedThenEnteredTileList);

  const gates: NamedGate[] = [
    {
      id: "block-par-ramp",
      label:
        "C1 — par is the unique P1∧P2∧P3 ramp 4/6/8/10 for the L11–L15 block (floor ∩ step ≥ 2 ∩ ceiling ≤ 10 ∧ four members; ADR-design-0003 §3 / docs/level-design.md §6.1.1)",
      status:
        expected !== null && level.par === expected && par === expected
          ? "PASS"
          : "FAIL",
      detail:
        `par=${level.par} (solver shortest=${String(result.shortestSolution)}); this member expects ` +
        `${expected === null ? "n/a (not a block member)" : String(expected)}; the derived ramp is ` +
        `${BLOCK_L1215_PAR_EXPECTATION.join(" / ")} from BLOCK_L1215_IDS=[${BLOCK_L1215_IDS.join(", ")}] ` +
        `(floor ${String(BLOCK_L1215_PAR_FLOOR)} + step ${String(BLOCK_L1215_PAR_STEP_MIN)} reaching exactly the ceiling ` +
        `${String(BLOCK_L1215_PAR_CEILING)}). Both values are checked, so neither the authored nor the measured par can move past the law unnoticed.`,
    },
    {
      id: "block-coverage",
      label:
        "C2 / P4 — coverage: distinctPositions == width × height (the board is sized to the route, not the other way round; ADR-design-0003 §6.1.1)",
      status:
        result.distinctPositions === level.width * level.height ? "PASS" : "FAIL",
      detail:
        `distinctPositions=${String(result.distinctPositions)} of ${String(level.width * level.height)} ` +
        `(${level.width} × ${level.height}); measured 100 % on all four members of the block (21/21, 24/24, 28/28, 35/35) ` +
        `and stated as P4 of the par derivation, because a ramp bought by padding the board would break §1's board cap instead.`,
    },
    {
      id: "block-latch-par-grade",
      label:
        "C7 / G1 — the latch grades par, never solvability: the all-OFF world still solves, at least BLOCK_LATCH_MIN_PAR_ADVANTAGE moves slower (ADR-design-0003 §5 / docs/level-design.md §6.1.3)",
      status: latchGrade ? "PASS" : "FAIL",
      detail:
        `switch(es)=${String(level.switches.length)} door(s)=${String(level.doors.length)}; ` +
        `allOffGoalReachable=${String(goalReachableWithAllSwitchesOff(level, graph))} ` +
        `allOffShortest=${allOff === null ? "null" : String(allOff)} par=${String(par)} ` +
        `⇒ allOffShortest − par = ${advantage === null ? "n/a" : String(advantage)} ≥ ${String(BLOCK_LATCH_MIN_PAR_ADVANTAGE)} ` +
        `required. allOffShortest is a **restricted** walk over the all-OFF subgraph (a depth read from the full graph may sit on a ` +
        `path that presses a switch, so it would not be a distance in this world). Measured 2 on 4/4 — the latch buys speed, the ` +
        `sealed channel buys existence (ADR §5, "the sentence future reviewers should quote"). A board with no latch fails here by name.`,
    },
    {
      id: "block-portal-load",
      label:
        "C14 — portal load: 'shortcut' on L12 (the walking world still solves) and 'mandatory' from L13 up (walk-only UNSATISFIABLE, the channel is the only door; ADR-design-0003 §6.2 / §6.1.2 reason 3)",
      status: load !== null && portalFree.solvable === (load === "shortcut") ? "PASS" : "FAIL",
      detail:
        `law for this member: ${load === null ? "n/a (not a block member)" : load}; ` +
        `portal-free world (same board, portals: []): solvable=${String(portalFree.solvable)} ` +
        `shortest=${portalFree.shortest === null ? "n/a" : String(portalFree.shortest)} vs par=${String(par)}. ` +
        `The escalation is a change of kind, not of move count: L12 re-prices the route (7 → 4) while L13–L15 delete the walking ` +
        `route entirely, which is the block's real content and the reason the debut's below-OFFERED grade is not re-used here.`,
    },
    dualPhaseGate(level, result),
    pressThenCrossGate(par, embeds, verdict),
    refusedBeforeEnteredGate(result),
  ];

  if (index === 0) {
    gates.push({
      id: "block-dip-ceiling",
      label:
        "C4 — the two-beat dip: the block's first member stays strictly below the shipped L11's measured D_exec (ADR-design-0003 §4 / §6.1.2)",
      status: dexec !== null && dexec < BLOCK_L1215_DIP_CEILING ? "PASS" : "FAIL",
      detail:
        `Dexec=${dexec === null ? "n/a (unsolvable)" : dexec.toFixed(6)} < ${BLOCK_L1215_DIP_CEILING.toFixed(6)} ` +
        `(the shipped L11's measured value, re-derived from src/levels/l011.json by the suite). Par is flat at the P1 floor 4, so the ` +
        `whole beat is carried by effective branching falling — "a choice-narrowing rest, not a shorter level" (ADR §4 reason 5). ` +
        `A single-beat dip was RULED OUT, so a member above this ceiling is not a steeper ramp, it is the wrong block shape.`,
    });
  }

  if (index === BLOCK_L1215_IDS.length - 1) {
    gates.push({
      id: "block-tail-exec-budget",
      label:
        "C5 — §6's frozen block-end clause: the block's LAST member exceeds 13.64 on the execution axis (docs/level-design.md §6 V0.6; ADR-design-0003 §6.4)",
      status:
        dexec !== null && dexec > BLOCK_L1215_TAIL_EXEC_FLOOR ? "PASS" : "FAIL",
      detail:
        `Dexec=${dexec === null ? "n/a (unsolvable)" : dexec.toFixed(6)} > ${BLOCK_L1215_TAIL_EXEC_FLOOR.toFixed(2)} ` +
        `(= the published 2-dp form of L10's measured 13.642857, so the bound is strictly below the shipped value it was read from) ` +
        `AND > 13.642857 itself. Distinct from PORTAL_DEBUT_EXEC_BUDGET on purpose: that constant is the **debut's** obligation ` +
        `(ADR §8 item 1 forbids re-purposing it). Pre-registered at V0.6, before any L12–L15 candidate existed, and applied as a ` +
        `FILTER during the search — 122 block-floor rejections at this level (ADR §6.4).`,
    });
  }

  return gates;
}

/** The portal-pair facts gate 4 reads, as data (so the verdict is not a sentence). */
interface PortalPairVerdict {
  /** The two ends, `"x,y"` each, in the authored order. */
  readonly ends: readonly string[];
  /** `x+y` of each end — different parity ⇒ opposite checkerboard colours. */
  readonly parities: readonly number[];
  readonly oppositeColour: boolean;
  /** The single `activePhase` of the pair, or `null` when there is no single pair. */
  readonly phase: Phase | null;
}

function portalPairVerdict(level: Level): PortalPairVerdict {
  const first = level.portals[0];
  if (first === undefined || level.portals.length !== 1) {
    return { ends: [], parities: [], oppositeColour: false, phase: null };
  }
  const [endA, endB] = first.pair;
  const parityA = endA[0] + endA[1];
  const parityB = endB[0] + endB[1];
  return {
    ends: [coordKey(endA), coordKey(endB)],
    parities: [parityA, parityB],
    oppositeColour: parityA % 2 !== parityB % 2,
    phase: first.activePhase,
  };
}

/**
 * The "below OFFERED" probe: solve the **same board without its portals** — a second,
 * much smaller BFS over the shipped rules (`solve` = `explore ∘ analyse`), not a
 * parity argument. `docs/level-difficulty.md` §3.4 defines the debut's grade as
 * "demonstrated by walking, not demanded", and the L6 precedent makes it concrete:
 * L6's un-switched world still solves in 6 while its par is 4, which is exactly the
 * measured concession `switchRequired: "exempt"` records. For M2 the mirror question is
 * "does the walking world still solve?", and it is decidable by the same program.
 */
function portalFreeWorldVerdict(level: Level): {
  readonly solvable: boolean;
  readonly shortest: number | null;
} {
  const portalFree: Level = { ...level, portals: [] };
  const result = solve(portalFree);
  return { solvable: result.solvable, shortest: result.shortestSolution };
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

/**
 * The **all-OFF shortest solution** — the G1 measurement
 * ({@link BLOCK_LATCH_MIN_PAR_ADVANTAGE}, ADR-design-0003 §5 / §6.1.3): the length of
 * the shortest route that never presses a switch, or `null` when the goal cannot be
 * reached in that world at all (the latch then carries *existence*, which is
 * strictly stronger than "worth one move").
 *
 * Why a second walk and not `graph.depths`: a depth from the full-graph BFS may sit
 * on a path that presses a switch, so it is not a distance inside the all-OFF world.
 * This is a **restricted** BFS over the already-explored graph — no second search of
 * the state space, no second rule, no re-derivation of door openness (the same
 * discipline {@link goalReachableWithAllSwitchesOff} states).
 */
export function allOffShortestSolution(
  level: Level,
  graph: ReachableGraph,
): number | null {
  const start = graph.nodes[0];
  if (start === undefined || !allSwitchesOff(level, start)) return null;
  const depth = new Map<number, number>([[0, 0]]);
  const queue: number[] = [0];
  for (let q = 0; q < queue.length; q += 1) {
    const i = queue[q] as number;
    const node = graph.nodes[i];
    if (node === undefined) continue;
    if (isGoal(level, node)) return depth.get(i) ?? null;
    for (const j of graph.edgesOut[i] as readonly number[]) {
      const next = graph.nodes[j];
      if (next === undefined || depth.has(j)) continue;
      if (!allSwitchesOff(level, next)) continue;
      depth.set(j, (depth.get(i) ?? 0) + 1);
      queue.push(j);
    }
  }
  return null;
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
  | "switch-without-targets"
  | "switch-never-fires"
  | "lesson-phantom-walk-forced"
  | "lesson-phantom-walk-offered"
  | "lesson-latch-dynamism"
  | "lesson-switch-required"
  | `gate-${AhaGateId}`
  | `gate-${PortalGateId}`
  | `gate-${BlockGateId}`
  | `gate-${BlockL1619GateId}`;

export const POLICY_VIOLATION_CODES: readonly PolicyViolationCode[] = [
  "door-without-switch",
  "switch-without-targets",
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
  "gate-portal-pair-single-opposite-colour",
  "gate-portal-crossing-on-every-par-route",
  "gate-portal-par-cap",
  "gate-portal-teaching-grade-below-offered",
  "gate-portal-seam-law-execution-axis",
  "gate-block-par-ramp",
  "gate-block-coverage",
  "gate-block-latch-par-grade",
  "gate-block-portal-load",
  "gate-block-dip-ceiling",
  "gate-block-tail-exec-budget",
  // ── R-003c — the L16–L19 block law (docs/ai-native-pipeline.md §8.13) ──────
  //
  // The controls for these six live in `scripts/attest-lv010-block.ts` (one
  // mutated board per gate, measured on every run, transcript committed). They are
  // NOT yet in the durable vitest table: `tests/**` is QA's lane and this dispatch
  // forbids edits there, so `tests/solver/policy-negative-controls.test.ts`'s
  // `Record<PolicyViolationCode, …>` is deliberately left RED with the six new keys
  // missing (QA's R-003c pin-migration ticket names them). The one-control-per-code
  // rule is not waived — it is discharged in-lane until QA moves it to the table.
  "gate-block-l1619-rung",
  "gate-block-l1619-grid-coverage",
  "gate-block-l1619-device-existence",
  "gate-block-l1619-escalation-cut",
  "gate-block-l1619-b-band",
  "gate-block-l1619-tail-ceiling",
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
    // n-13 (LV-007B item 4): a switch with an empty `targets` list is M3 content no
    // door reads. It *does* fire (`applyMove` toggles `switchesOn` unconditionally),
    // so `switch-never-fires` cannot catch it — the latch is live and pointless.
    // `validateLevel` only WARNS about this shape (it is a shape contract, not a
    // design policy), and that warning is not a gate; the rejection lives here.
    if (sw.targets.length === 0) {
      violations.push({
        code: "switch-without-targets",
        detail:
          `switches[${i}] "${sw.id}" has no targets — no doors[] entry reads its state, so it toggles and changes nothing: ` +
          `decoration wearing a circuit, not M3 content (ADR-0009 decision 4 — the latch must carry a decision; the mirror ` +
          `of "M1 never ships alone"). Point it at a door whose openness the solution depends on, or drop the switch. ` +
          `(validateLevel warns about this shape; that warning is not a gate.)`,
      });
    }
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
        // NOT switched to the ordered companion (LV-007C decision, stated so it is
        // not read as an oversight): this obligation is the *board-level
        // history-dependence* promise ("the latch carries a decision"), which is
        // metric #7's canonical job and the carrier `docs/ai-native-pipeline.md`
        // §8.5's pre-L11 acceptance law was proved on. A trapped refusal still proves
        // history-dependence and must not read as "static" (ADR-architecture-0002
        // decision 4); beat-*witnessability* is what gate (iii) asks, and gate (iii)
        // is the reader that reads the ordered form.
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
      case "portal-aha-2":
        // The M2 debut's own conditions are the named gates below
        // (`portalAhaGates`); there is no separate board-level obligation to add
        // here. In particular this obligation deliberately does **not** carry the
        // `switchRequired` "required" promise: the row is `"exempt"` for the same
        // documented reason as L6 (see the row), and the latch's role on this board
        // is measured by gate (ii) instead.
        break;
      case "block-l1215":
        // The L12–L15 block's own conditions are the named gates below
        // (`blockL1215Gates`: P1–P4, G1, G2, G3, C14, and the block-end/ dip clauses
        // on the members they bind). Deliberately **no** board-level code here, and
        // deliberately **no** `switchRequired: "required"` promise — ADR-design-0003
        // §5 rules that the latch grades `par`, not solvability, from L12 up, and G4
        // records that decision on the row itself.
        break;
      case "block-l1619":
        // The L16–L19 block's own conditions are the named gates below
        // (`blockL1619Gates`: the exact rung, the device's grid + coverage, the
        // all-OFF existence grade, the frozen cut, G2/G3, the `B` band and the tail
        // ceiling). No board-level code here for the same reason as the block above —
        // but note the difference on `switchRequired`: these rows ARE `"required"`,
        // because the device measures `allOffGoalReachable = false` on 4/4, so the
        // obligation has teeth rather than being a concession.
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
      : lesson?.obligation === "portal-aha-2"
        ? portalAhaGates(level, graph, result, embeds)
        : lesson?.obligation === "block-l1215"
          ? blockL1215Gates(level, graph, result, embeds)
          : lesson?.obligation === "block-l1619"
            ? blockL1619Gates(level, graph, result, embeds)
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
