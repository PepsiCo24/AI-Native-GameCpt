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
 *    Enforced here, printed by `scripts/solve-levels.ts`, pinned by
 *    `tests/solver/**` — the schema stays a shape contract, not a design policy.
 * 2. **A documented lesson must be program-true** (`AGENTS.md` §7: levels ⇒
 *    solver proof). A level the docs call a *forced* phantom walk must FORCE one
 *    (`embedForced`); one documented as *offering* it must offer it and not force
 *    it; a level documented as teaching the latch must actually be
 *    history-dependent (`refusedThenEnteredTiles > 0`); the **Aha #1** level must
 *    satisfy the named gates of `docs/level-design.md` §3 one by one.
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
  /** Where the lesson is documented (so the check is traceable, not invented). */
  readonly evidence: string;
}

/**
 * The shipped ladder's documented lessons, L1–L10.
 *
 * `docs/level-design.md` V0.4 §2 (ladder) + §3 (Aha #1 construction) +
 * `src/levels/README.md` §0 (per-level lesson column, LV-006) are the sources.
 * Adding a level without a row here is caught by the suite (`l0NN has no
 * documented lesson row`), so the table cannot silently drift from the dataset.
 */
export const DOCUMENTED_LESSONS: readonly DocumentedLesson[] = [
  {
    levelId: 1,
    lesson: "literacy: tap → move, the world flashes (no dynamism claim)",
    obligation: null,
    evidence: "docs/level-design.md §2 L1",
  },
  {
    levelId: 2,
    lesson: "literacy: the flip happens because I moved",
    obligation: null,
    evidence: "docs/level-design.md §2 L2",
  },
  {
    levelId: 3,
    lesson:
      "first refusal: a permanent (parity-dead) wall, never a timing gate",
    obligation: null,
    evidence: "docs/level-design.md §2 L3 + ADR-0009",
  },
  {
    levelId: 4,
    lesson: "phantom walk, OFFERED (an echo-free route of the same par exists)",
    obligation: "phantom-walk-offered",
    evidence: "docs/level-design.md §2 L4 + LV-004 re-measurement",
  },
  {
    levelId: 5,
    lesson: "phantom walk, FORCED (the goal's only approach is an echo)",
    obligation: "phantom-walk-forced",
    evidence: "docs/level-design.md §2 L5 + LV-004 re-measurement",
  },
  {
    levelId: 6,
    lesson:
      "M1+M3 debut: the latch — what I step on changes the world, and it stays changed",
    obligation: "latch-dynamism",
    evidence: "docs/level-design.md §2 L6 + §6 (block-opening dip)",
  },
  {
    levelId: 7,
    lesson: "the detour-to-switch: I go out of my way to change the world",
    obligation: "latch-dynamism",
    evidence: "docs/level-design.md §2 L7",
  },
  {
    levelId: 8,
    lesson:
      "Aha #1 (the latch): the door that refused the greedy line opens and stays open",
    obligation: "latch-aha-1",
    evidence: "docs/level-design.md §2 L8 + §3 (named Solver conditions)",
  },
  {
    levelId: 9,
    lesson:
      "two doors + two switches: the second switch is behind the first door (ordered plan)",
    obligation: "latch-dynamism",
    evidence:
      "docs/level-design.md §2 L9/L10 (LV-006 authoring note, §6 of the pipeline record)",
  },
  {
    levelId: 10,
    lesson:
      "gate check: permanent M0 geometry + the phantom walk + the latch, planned together",
    obligation: "latch-dynamism",
    evidence: "docs/level-design.md §2 L10 + LV-006 pipeline record",
  },
];

export function documentedLesson(levelId: number): DocumentedLesson | null {
  return DOCUMENTED_LESSONS.find((entry) => entry.levelId === levelId) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Named gates (the Aha #1 condition list, one gate per documented condition)
// ─────────────────────────────────────────────────────────────────────────────

export type GateStatus = "PASS" | "FAIL" | "UNSATISFIABLE";

export interface NamedGate {
  readonly id: string;
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
 * 4. `dual-phase-tiles` — the dispatch's fourth named gate. **Portal-free boards
 *    can never produce one** (checkerboard invariant, ADR-0009 decision 1: a
 *    switch never moves the player, so the position→phase link survives the
 *    latch; the same fact is pinned by `tests/solver/dynamism-metrics.test.ts`).
 *    The gate is therefore reported `UNSATISFIABLE` with the proof instead of
 *    being quietly dropped or satisfied with a mechanic the schedule forbids
 *    before L11.
 */
export function latchAhaGates(
  level: Level,
  graph: ReachableGraph,
  result: SolveResult,
  embeds: EmbedMetrics,
): readonly NamedGate[] {
  const allOffReachable = goalReachableWithAllSwitchesOff(level, graph);
  const allOffStates = countAllOffStates(level, graph);

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
        `…and that door is in refusedThenEnteredTiles=${verdict.refusedDoor}; ` +
        `parRoutes=${embeds.parRoutes} embedRoutes=${embeds.embedRoutes}`,
    },
    {
      id: "refused-then-entered",
      label:
        "refusedThenEnteredTiles ≥ 1 (ADR-0009: the latch, not parity, carries the decision)",
      status: result.refusedThenEnteredTiles > 0 ? "PASS" : "FAIL",
      detail: `refusedThenEnteredTiles=${result.refusedThenEnteredTiles} tiles=[${result.refusedThenEnteredTileList.join(" ")}]`,
    },
    {
      id: "dual-phase-tiles",
      label: "dualPhaseTiles ≥ 1 (dispatch's fourth named gate)",
      status:
        level.portals.length === 0
          ? "UNSATISFIABLE"
          : result.dualPhaseTiles > 0
            ? "PASS"
            : "FAIL",
      detail:
        level.portals.length === 0
          ? `dualPhaseTiles=${result.dualPhaseTiles} is FORCED to 0 on a portal-free board: the grid is bipartite and every ` +
            `legal move changes x+y parity and the phase together, so the phase at a tile is a function of the tile ` +
            `(ADR-0009 decision 1 — a switch never relocates the player, so the latch cannot break it). No portal-free ` +
            `level before L11 can satisfy the gate as written; ADR-0009 schedules M2 at L11.`
          : `dualPhaseTiles=${result.dualPhaseTiles} tiles=[${result.dualPhaseTileList.join(" ")}]`,
    },
  ];
  return gates;
}

function countAllOffStates(level: Level, graph: ReachableGraph): number {
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
  readonly code: string;
  readonly detail: string;
}

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
  /** Named gates — only for a level documented as Aha #1 (`latch-aha-1`). */
  readonly gates: readonly NamedGate[];
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
    allOffGoalReachable:
      level.switches.length === 0
        ? null
        : goalReachableWithAllSwitchesOff(level, graph),
    gates,
    violations,
  };
}
