/**
 * LV-006 — the doors+switch teaching unit (L6–L10) and the level policy that
 * keeps it honest. `src/levels/l006.json` … `l010.json`.
 *
 * What this file is for (AGENTS.md §7 — levels ⇒ solver proof):
 *
 * 1. **Every L6–L10 level is program-proven**, not model-proven: schema-valid,
 *    solvable, `par == shortestSolution`, 0 dead states, no unrecoverable state.
 * 2. **The documented lesson is program-true** (`@/core/solver/policy`): each of
 *    L6–L10 must be *history-dependent* (`refusedThenEnteredTiles > 0`, ADR-0009
 *    decision 4 — M1+M3 content whose latch carries a decision), and L7–L10 must
 *    genuinely *require* the switch (`allOffGoalReachable === false`). L6 is the
 *    documented exception: it is the block-opening **dip** (docs/level-design.md
 *    §6) — the latch is demonstrated on the natural path while the un-switched
 *    world still solves in 6, so the level teaches without punishing.
 * 3. **Aha #1 (`l008`) satisfies its named gates one by one** — see
 *    `docs/level-design.md` §3. Gates (i)/(ii)/(iii) PASS with the measured
 *    numbers below. Gate (iv), `dualPhaseTiles ≥ 1`, is **provably unsatisfiable
 *    on a portal-free board** (the checkerboard invariant of ADR-0009 decision 1:
 *    a switch never relocates the player, so the position→phase link survives the
 *    latch and a tile is entered in exactly one phase). ADR-0009 schedules M2 at
 *    L11; there is no portal in `src/levels` before L11. This file therefore pins
 *    `dualPhaseTiles === 0` as the *proven* value — the same fact
 *    `tests/solver/dynamism-metrics.test.ts` already pins ("a latch board
 *    asserting dualPhaseTiles > 0 would be a failing test against the program of
 *    record") — and pins the gate's status as `UNSATISFIABLE` rather than letting
 *    the condition silently disappear or be "satisfied" with a mechanic the
 *    schedule forbids. It is escalated, not faked and not weakened.
 * 4. **Negative controls**, so the policy is evidence and not decoration: a fake
 *    "latch" candidate that has a solution with every switch OFF is REJECTED by
 *    the analyzer; a door with no switch is rejected; a switch that can never
 *    fire is rejected; a level documented as a FORCED phantom walk that stops
 *    forcing it is rejected. (ADR-0004: reject, never repair.)
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import {
  DOCUMENTED_LESSONS,
  auditLevel,
  documentedLesson,
  firingSwitches,
} from "@/core/solver/policy";
import { explore } from "@/core/solver/bfs";
import { door, makeLevel, switchDef } from "../helpers/fixtures";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

/**
 * Every shipped level id, read from the dataset directory itself — **never** a
 * hardcoded ladder. `policy.ts` promises that "adding a level without a row here
 * is caught by the suite"; a literal `[1, …, 10]` loop cannot keep that promise,
 * because a new `src/levels/l0NN.json` would simply not be looked at.
 */
const LEVEL_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

/** Load a shipped level file, asserting it is schema-valid first (ADR-0004). */
function loadLevel(id: number): Level {
  const raw = JSON.parse(
    readFileSync(`${LEVELS_DIR}l${String(id).padStart(3, "0")}.json`, "utf8"),
  ) as unknown;
  const result = validateLevel(raw);
  expect(
    result.ok,
    `l${String(id).padStart(3, "0")} must be schema-valid`,
  ).toBe(true);
  return raw as Level;
}

const L6 = loadLevel(6);
const L7 = loadLevel(7);
const L8 = loadLevel(8);
const L9 = loadLevel(9);
const L10 = loadLevel(10);
const LATCH_UNIT: readonly Level[] = [L6, L7, L8, L9, L10];

describe("LV-006 · the L6–L10 latch unit is solver-proven", () => {
  it.each(LATCH_UNIT.map((level) => [level.id, level] as const))(
    "l%03i is solvable, par-exact and free of dead states",
    (_id, level) => {
      const audit = auditLevel(level);
      const r = audit.result;
      expect(r.solvable, `l${level.id} must be solvable`).toBe(true);
      expect(
        r.shortestSolution,
        `l${level.id} par must equal the solver's shortest`,
      ).toBe(level.par);
      expect(
        r.deadStates,
        `l${level.id} must have no dead state (docs/level-design.md §4)`,
      ).toBe(0);
      expect(
        r.noUnrecoverableOk,
        `l${level.id} must be recoverable from every state`,
      ).toBe(true);
      // AC-1: the whole unit stays ≤ 7×7 and inside the BFS state budget.
      expect(level.width, `l${level.id} width`).toBeLessThanOrEqual(7);
      expect(level.height, `l${level.id} height`).toBeLessThanOrEqual(7);
      expect(
        r.reachableStates,
        `l${level.id} must fit the state budget`,
      ).toBeLessThanOrEqual(r.stateBudget);
      expect(
        audit.violations,
        `l${level.id} must satisfy the level policy`,
      ).toEqual([]);
    },
  );

  it.each(LATCH_UNIT.map((level) => [level.id, level] as const))(
    "l%03i is history-dependent: the latch, not parity, carries a decision",
    (_id, level) => {
      const audit = auditLevel(level);
      // ADR-0009 decision 4: M1-bearing content ships only with M3, and the
      // measured signature of "the latch is load-bearing" is a tile that refuses
      // entry in one reachable state and accepts it in another.
      expect(audit.result.refusedThenEnteredTiles).toBeGreaterThanOrEqual(1);
      expect(audit.result.refusedThenEnteredTileList.length).toBe(
        audit.result.refusedThenEnteredTiles,
      );
    },
  );

  it("L6–L10 are the first levels in the game to carry M1+M3 content", () => {
    for (const level of LATCH_UNIT) {
      expect(
        level.doors.length,
        `l${level.id} must ship a door`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        level.switches.length,
        `l${level.id} must ship the switch that drives it`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        level.portals,
        `l${level.id} must not use portals (ADR-0009 puts M2 at L11)`,
      ).toEqual([]);
    }
    // l001–l005 stay door-free: the latch unit cannot leak backwards into M0.
    for (const id of [1, 2, 3, 4, 5]) {
      const level = loadLevel(id);
      expect(
        level.doors,
        `l00${id} must stay M0-only (no doors before L6)`,
      ).toEqual([]);
      expect(
        level.switches,
        `l00${id} must stay M0-only (no switches before L6)`,
      ).toEqual([]);
    }
  });

  it("L7–L10 require the switch; L6 is the documented dip where it is optional", () => {
    // docs/level-design.md §3 condition (i) is generalised to every latch level:
    // the goal must be unreachable inside the all-OFF subgraph — unless the level is
    // the documented block-opening dip.
    //
    // RV-004 n-18: the subgraph size is pinned as a **number** (a solver-side
    // read-out, `auditLevel().allOffReachableStates`) next to the reachable-state
    // count, so "the goal is unreachable with every switch OFF" is an assertion
    // about two measurements rather than about a sentence printed into a detail
    // string. Values re-measured on the shipped set (2026-10-15).
    const allOffSubgraph = [
      { id: 6, goalReachable: true, allOff: 14, reachable: 29 },
      { id: 7, goalReachable: false, allOff: 5, reachable: 12 },
      { id: 8, goalReachable: false, allOff: 16, reachable: 34 },
      { id: 9, goalReachable: false, allOff: 10, reachable: 58 },
      { id: 10, goalReachable: false, allOff: 20, reachable: 42 },
    ] as const;

    for (const expected of allOffSubgraph) {
      const level = LATCH_UNIT.find((entry) => entry.id === expected.id) as Level;
      const audit = auditLevel(level);
      expect(
        audit.allOffGoalReachable,
        `l${expected.id}: the door must genuinely refuse the un-switched approach`,
      ).toBe(expected.goalReachable);
      expect(
        audit.allOffReachableStates,
        `l${expected.id}: all-OFF subgraph size`,
      ).toBe(expected.allOff);
      expect(
        audit.result.reachableStates,
        `l${expected.id}: reachable states`,
      ).toBe(expected.reachable);
    }

    expect(
      auditLevel(L6).allOffGoalReachable,
      "l006 is the block-opening dip (docs/level-design.md §6): its un-switched world still solves in 6",
    ).toBe(true);
  });

  it("every shipped level in src/levels has a documented-lesson row (the table cannot drift)", () => {
    expect(LEVEL_IDS.length).toBeGreaterThan(0);
    for (const id of LEVEL_IDS) {
      const lesson = documentedLesson(id);
      expect(
        lesson,
        `l${String(id).padStart(3, "0")} has no documented-lesson row`,
      ).not.toBeNull();
      expect((lesson as { evidence: string }).evidence.length).toBeGreaterThan(
        0,
      );
      expect((lesson as { lesson: string }).lesson.length).toBeGreaterThan(0);
    }
    // Superset, not equality: the table may legitimately keep rows for levels that
    // are not shipped yet, but it may never lack a row for a *shipped* level. The
    // dataset id set must therefore be a subset of the table's id set.
    const documentedIds = new Set(
      DOCUMENTED_LESSONS.map((entry) => entry.levelId),
    );
    expect(
      LEVEL_IDS.filter((id) => !documentedIds.has(id)).map(
        (id) => `l${String(id).padStart(3, "0")}`,
      ),
      "every id in the dataset must appear in DOCUMENTED_LESSONS (table ⊇ dataset)",
    ).toEqual([]);
  });
});

describe("LV-006 · M1 never ships alone (door ⇄ switch pairing, ADR-0009 decision 4)", () => {
  it.each(LATCH_UNIT.map((level) => [level.id, level] as const))(
    "l%03i pairs every door with a switch that can actually fire",
    (_id, level) => {
      const graph = explore(level);
      const fired = firingSwitches(level, graph);
      for (const doorDef of level.doors) {
        const drivers = level.switches.filter((sw) =>
          sw.targets.includes(doorDef.id),
        );
        expect(
          drivers.length,
          `doors "${doorDef.id}" needs at least one switch`,
        ).toBeGreaterThan(0);
        expect(
          drivers.some((sw) => fired.has(sw.id)),
          `every switch targeting doors "${doorDef.id}" is inert — measured over the whole reachable graph`,
        ).toBe(true);
      }
      // …and no switch is decorative: each one toggles somewhere reachable.
      expect(fired.size).toBe(level.switches.length);
    },
  );

  it("rejects a door with no switch at all", () => {
    const audit = auditLevel(
      makeLevel({
        id: 900,
        width: 5,
        height: 3,
        player: [0, 1],
        goal: [4, 1],
        doors: [door("d1", "blue", [[3, 1]])],
      }),
    );
    expect(audit.violations.map((v) => v.code)).toContain(
      "door-without-switch",
    );
  });

  it("rejects a switch that can never fire (inert latch, provably not a circuit)", () => {
    // (1,1) is entered in phase A only (Manhattan distance 1 from the start,
    // ADR-0009 decision 1 / the parity theorem), so an activePhase "B" switch
    // there is dead data: it can never be current on that tile.
    const audit = auditLevel(
      makeLevel({
        id: 900,
        width: 5,
        height: 3,
        player: [0, 1],
        goal: [4, 1],
        doors: [door("d1", "blue", [[3, 1]])],
        switches: [switchDef("s1", [1, 1], "B", ["d1"])],
      }),
    );
    expect(audit.violations.map((v) => v.code)).toContain("switch-never-fires");
  });
});

describe("LV-006 · documented lessons are program-true (phantom walk offers/forces)", () => {
  it("keeps l004 as the OFFERED phantom walk (some shortest routes never embed)", () => {
    const audit = auditLevel(loadLevel(4));
    expect(audit.embeds.parRoutes).toBeGreaterThan(1);
    expect(audit.embeds.embedRoutes).toBeGreaterThan(0);
    expect(audit.embeds.embedForced).toBe(false);
    expect(audit.violations).toEqual([]);
  });

  it("keeps l005 as the FORCED phantom walk (every shortest route embeds)", () => {
    const audit = auditLevel(loadLevel(5));
    expect(audit.embeds.parRoutes).toBeGreaterThan(0);
    expect(audit.embeds.embedRoutes).toBe(audit.embeds.parRoutes);
    expect(audit.embeds.embedForced).toBe(true);
    expect(audit.violations).toEqual([]);
  });

  it("rejects a level documented as a FORCED phantom walk that stops forcing it", () => {
    // Same level id as l005 (so the documented obligation applies) with a board
    // that has no echo at all: the documentation and the board disagree, and the
    // analyzer must say so instead of trusting the doc.
    const audit = auditLevel(
      makeLevel({
        id: 5,
        width: 5,
        height: 3,
        player: [0, 1],
        goal: [4, 1],
        par: 4,
      }),
    );
    expect(audit.embeds.embedRoutes).toBe(0);
    expect(audit.violations.map((v) => v.code)).toContain(
      "lesson-phantom-walk-forced",
    );
  });
});

describe("LV-006 · Aha #1 (l008) named gates, measured (docs/level-design.md §3)", () => {
  const graph = explore(L8);
  const audit = auditLevel(L8, graph);
  const gate = (id: string): { status: string; detail: string } => {
    const found = audit.gates.find((entry) => entry.id === id);
    expect(found, `l008 must declare the named gate "${id}"`).toBeDefined();
    return found as { status: string; detail: string };
  };

  it("gate (i) — no solution exists with every switch OFF", () => {
    expect(gate("no-solution-with-switches-off").status).toBe("PASS");
    expect(audit.allOffGoalReachable).toBe(false);
    // RV-004 n-18: the `16/34` in the detail is a measurement, so it is pinned as
    // two numbers, not as a sentence. `allOffReachableStates` is the size of the
    // all-OFF subgraph (a solver-side read-out, not a schema field).
    expect(audit.allOffReachableStates).toBe(16);
    expect(audit.result.reachableStates).toBe(34);
    expect(gate("no-solution-with-switches-off").detail).toContain(
      "all-OFF subgraph: 16/34 reachable state(s) keep every switch OFF",
    );
  });

  it("gate (ii) — every shortest solution presses the switch and crosses the door that refused", () => {
    expect(
      gate("shortest-solution-presses-switch-and-crosses-door").status,
    ).toBe("PASS");
    expect(audit.embeds.parRoutes).toBe(6);
    expect(
      gate("shortest-solution-presses-switch-and-crosses-door").detail,
    ).toContain("press-then-cross-door=6");
    // RV-004 m-4: this number is a **route** count, so it must never print under
    // gate (iii)'s tile-count name (`refusedThenEnteredTiles`) — the two values
    // differ (6 routes vs 1 tile on l008) and the shared name was a misread trap.
    expect(
      gate("shortest-solution-presses-switch-and-crosses-door").detail,
    ).toContain("that door is one of the refused tiles: routes=6");
    expect(
      gate("shortest-solution-presses-switch-and-crosses-door").detail,
    ).not.toContain("refusedThenEnteredTiles=");
    expect(gate("refused-then-entered").detail).toContain(
      "refusedThenEnteredTiles=1 tiles=[3,1]",
    );
  });

  it("gate (iii) — the refusing tile is in refusedThenEnteredTileList", () => {
    expect(gate("refused-then-entered").status).toBe("PASS");
    // RV-004 n-18: `toEqual` on the whole list, not `toContain` on one entry — a
    // second refused-then-entered tile on l008 would change the shipped level's
    // measured shape and must not slip through a membership check.
    expect(audit.result.refusedThenEnteredTileList).toEqual(["3,1"]);
    expect(audit.result.refusedThenEnteredTiles).toBe(1);
  });

  it("gate (iv) — dualPhaseTiles ≥ 1 is UNSATISFIABLE before L11, and the proven value is 0", () => {
    // The gate is reported, never dropped and never satisfied by softening a rule.
    expect(gate("dual-phase-tiles").status).toBe("UNSATISFIABLE");
    expect(audit.result.dualPhaseTiles).toBe(0);
    expect(L8.portals).toEqual([]);
    // ADR-0009 decision 1, the checkerboard invariant: a switch never relocates
    // the player, so the phase at a tile stays a function of the tile. Every
    // portal-free level in the game therefore has dualPhaseTiles === 0 — pinned
    // here for the whole shipped set so the measurement cannot silently change.
    for (const level of LATCH_UNIT) {
      expect(auditLevel(level).result.dualPhaseTiles, `l${level.id}`).toBe(0);
    }
  });

  it("does not raise the UNSATISFIABLE gate as a hard violation (it is escalated)", () => {
    expect(audit.violations).toEqual([]);
    expect(audit.gates.filter((entry) => entry.status === "FAIL")).toEqual([]);
  });

  it("rejects a fake latch that can be solved with every switch OFF", () => {
    // The l008 layout with the goal funnel removed: the door is still there and
    // still refuses, the switch still fires, the metric still reports dynamism —
    // but the goal is reachable without ever pressing it, so the Aha is not
    // preserved. The analyzer must reject the candidate on the measured gate.
    const fake = makeLevel({
      id: 8,
      width: 5,
      height: 3,
      player: [0, 1],
      goal: [4, 1],
      doors: [door("d1", "blue", [[3, 1]])],
      switches: [switchDef("s1", [2, 0], "A", ["d1"])],
      par: 4,
    });
    const fakeAudit = auditLevel(fake);
    expect(fakeAudit.result.solvable).toBe(true);
    expect(fakeAudit.allOffGoalReachable).toBe(true);
    expect(fakeAudit.violations.map((v) => v.code)).toContain(
      "gate-no-solution-with-switches-off",
    );
    expect(
      fakeAudit.gates.find(
        (entry) => entry.id === "no-solution-with-switches-off",
      )?.status,
    ).toBe("FAIL");
  });
});
