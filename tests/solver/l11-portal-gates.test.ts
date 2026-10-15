/**
 * LV-008 — `src/levels/l011.json`, the **M2 (portal) debut**, proved by program.
 *
 * ── WHAT THIS FILE IS ────────────────────────────────────────────────────────
 * L11 is the first shipped board that carries a portal, i.e. the first board on which
 * `dualPhaseTiles` can be non-zero (gate (iv) of `docs/level-design.md` §3 is
 * *unsatisfiable* before it — the schedule puts M2 here for that reason, ADR-0009). The
 * debut has a **pre-registered** acceptance contract (`docs/level-design.md` §6 V0.6 /
 * ADR-design-0001, `docs/level-difficulty.md` §3.3–§3.4) and this file is the program
 * half of it: every clause below is read off `auditLevel(l011)` (or off the shipped
 * solver), never off the design prose.
 *
 *   1. **§1** — the shipped file itself: shape, one channel, one phase, `par = 4`.
 *   2. **§2** — the eight named gates, all PASS, and the deliberate *absence* of gate
 *      (i) as an assertion rather than a comment (the debut is graded **below OFFERED**,
 *      which is the opposite claim, and it is recorded on the lesson row).
 *   3. **§3** — the seam law on the **execution axis**: `D_exec < 13.64` ⇔ `D < 33.64`,
 *      with the budget re-derived from the shipped `l010.json` so the document cannot
 *      drift from the level the number was read off.
 *   4. **§4** — "the portal crossing is the core action of par, not bypassable
 *      decoration": the unique shortest route is enumerated move by move and the
 *      teleport is located in it; the portal-free world is solved as a *second* search
 *      (7 > 4) rather than argued.
 *   5. **§5** — the board-level invariants: `T = R = 0`, no dead state, every reachable
 *      state can still reach the goal (`docs/level-design.md` §4), and the metrics the
 *      CLI prints (which `tests/solver/route-budget.test.ts` pins as a table) are
 *      re-asserted here from the gate suite's own angle.
 *   6. **§6** — the two negative probes that belong to *this* file rather than to the
 *      generic control table (`tests/solver/policy-negative-controls.test.ts`): the
 *      same-colour pair, which is the **validator's** rejection (M2's inert case, ADR-0009
 *      decision 5), and the bypassable portal, which is the policy layer's.
 *
 * ── WHAT THIS FILE IS NOT ────────────────────────────────────────────────────
 * Not a difficulty opinion. `D`'s weights are a provisional hypothesis
 * (`docs/level-difficulty.md` §2, V0.1); the seam law is written on `D_exec` precisely
 * because `w5·M` is not a play difficulty (ADR-design-0001). What is proved here is the
 * *measurement* and the *gate verdicts*, plus the fact that the pre-registered number
 * comes from the shipped L10 board and not from a chosen constant.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Level, Phase } from "@/core/level";
import { validateLevel } from "@/core/level";
import { explore, forEachParRoute, forEachParRouteStats, solve } from "@/core/solver/bfs";
import {
  PORTAL_DEBUT_EXEC_BUDGET,
  PORTAL_DEBUT_PAR_CAP,
  auditLevel,
  portalRouteTelemetry,
} from "@/core/solver/policy";
import { DIFFICULTY_WEIGHTS, analyseDifficulty } from "@/core/solver/difficulty";
import { door, makeLevel, portal, switchDef } from "../helpers/fixtures";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

function shippedBoard(id: number): Level {
  const raw = JSON.parse(
    readFileSync(`${LEVELS_DIR}l${String(id).padStart(3, "0")}.json`, "utf8"),
  ) as Level;
  expect(validateLevel(raw).ok, `l${String(id).padStart(3, "0")}`).toBe(true);
  return raw;
}

const SHIPPED_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

/** The artifact under proof, and its audit — computed once, read everywhere. */
const L11 = shippedBoard(11);
const AUDIT = auditLevel(L11);
const PAR = AUDIT.result.shortestSolution as number;

// ─────────────────────────────────────────────────────────────────────────────
// 1. The shipped file: the M2 debut's shape
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §1 — l011.json is the M2 debut, and the data says so", () => {
  it("is the eleven-th board, 7×3, opening in phase A, with `par = 4`", () => {
    expect(L11.id).toBe(11);
    expect(L11.width).toBe(7);
    expect(L11.height).toBe(3);
    expect(L11.startPhase).toBe("A");
    expect(L11.par).toBe(PORTAL_DEBUT_PAR_CAP);
    // The authored claim and the solver's answer, together: `par` is a proposal, and on
    // this board the proposal is exactly right (the CLI's `parMatch=true`).
    expect(AUDIT.result.solvable).toBe(true);
    expect(AUDIT.result.shortestSolution).toBe(4);
    expect(AUDIT.result.shortestSolution).toBe(L11.par);
  });

  it("carries exactly ONE channel: one pair, one activePhase, opposite colours", () => {
    expect(L11.portals).toHaveLength(1);
    const pair = L11.portals[0];
    expect(pair?.id).toBe("p1");
    expect(pair?.activePhase).toBe("B");
    // "a single opposite-colour portal pair" — the acceptance wording, as arithmetic:
    // x+y parity 3 vs 4, so the two ends are on opposite checkerboard colours and a
    // teleport can move the player between the two phase classes (ADR-0009 decision 5).
    expect(pair?.pair).toEqual([
      [2, 1],
      [4, 0],
    ]);
    expect((pair?.pair[0][0] ?? 0) + (pair?.pair[0][1] ?? 0)).toBe(3);
    expect((pair?.pair[1][0] ?? 0) + (pair?.pair[1][1] ?? 0)).toBe(4);
    // One value per pair ⇒ only phase B shows the channel. The other phase's channel
    // (a pair with `activePhase: "A"`) must not appear anywhere on the board: the debut
    // introduces one mechanic, and `docs/level-design.md` §1 keeps the other phase's
    // channel for the next block. (A second, *same-phase* pair is a second channel too —
    // the count clause; both are pinned by the pair gate's own controls.)
    expect(
      L11.portals.filter((entry) => entry.activePhase === "A"),
    ).toEqual([]);
  });

  it("is the M1+M3 unit plus M2 — `M = 4`, and the latch still drives the door", () => {
    expect(L11.doors).toHaveLength(1);
    expect(L11.switches).toHaveLength(1);
    const doorDef = L11.doors[0];
    const switchDef0 = L11.switches[0];
    expect(doorDef?.color).toBe("blue");
    expect(doorDef?.tiles).toEqual([[5, 0]]);
    expect(switchDef0?.tile).toEqual([1, 1]);
    expect(switchDef0?.activePhase).toBe("A");
    // One switch, one target, and the target is the door: the §3 "one door + one switch"
    // construction the M1+M3 block already ships (docs/level-design.md §6).
    expect(switchDef0?.targets).toEqual([doorDef?.id]);
    // M counts mechanic CATEGORIES (walls + doors + switches + portals), so the debut
    // carries M1+M3+M2 ⇒ 4, `ΔM = +1` against L10 — the step the seam law has to survive.
    expect(AUDIT.difficulty.M).toBe(4);
    expect(AUDIT.lesson?.obligation).toBe("portal-aha-2");
  });

  it("is wall-free in both phases, so no wall can mask the portal's effect", () => {
    // `docs/level-difficulty.md` §3.4 asks the debut to be single-concept: a wall-free
    // board keeps the only obstruction in the level a *rule* object (the door), which is
    // also what the L6 debut template did. Consequence: `dualPhaseTiles` is the whole
    // board — see §5.
    expect(L11.phaseAWalls).toEqual([]);
    expect(L11.phaseBWalls).toEqual([]);
    expect(validateLevel(L11).warnings).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The eight gates — all PASS, and gate (i) is deliberately not among them
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §2 — the debut's named-gate suite is green, verdict for verdict", () => {
  it("all eight gates PASS, in suite order, with no violation and no escalation", () => {
    expect(AUDIT.gates.map((gate) => `${gate.id}:${gate.status}`)).toEqual([
      "dual-phase-tiles:PASS",
      "shortest-solution-presses-switch-and-crosses-door:PASS",
      "refused-then-entered:PASS",
      "portal-pair-single-opposite-colour:PASS",
      "portal-crossing-on-every-par-route:PASS",
      "portal-par-cap:PASS",
      "portal-teaching-grade-below-offered:PASS",
      "portal-seam-law-execution-axis:PASS",
    ]);
    expect(AUDIT.violations).toEqual([]);
    // The one condition that is allowed to escalate (`dual-phase-tiles` on a portal-free
    // board, §5 of the control file) must not fire here — this board *proves* gate (iv).
    expect(AUDIT.gates.filter((gate) => gate.status === "UNSATISFIABLE")).toEqual(
      [],
    );
  });

  it("gate (iv) is the reason the schedule puts M2 here: it is satisfiable only from L11", () => {
    const iv = AUDIT.gates.find((gate) => gate.id === "dual-phase-tiles");
    expect(iv?.status).toBe("PASS");
    expect(iv?.detail).toContain("dualPhaseTiles=21");
    // Before L11 no shipped board could satisfy it — measured over the dataset rather
    // than asserted about the schedule.
    const earlier = SHIPPED_IDS.filter(
      (id) => id < 11 && solve(shippedBoard(id)).dualPhaseTiles > 0,
    );
    expect(earlier).toEqual([]);
    expect(SHIPPED_IDS.filter((id) => solve(shippedBoard(id)).dualPhaseTiles > 0)).toEqual(
      [11],
    );
  });

  it("gate (i) is absent by name — the debut is graded BELOW OFFERED, the opposite claim", () => {
    // Stated as an assertion so it cannot be added (or quietly dropped) without turning
    // this red: the §3 construction floor for a mechanic debut is "demonstrated by
    // walking, not demanded", which is *incompatible* with gate (i)'s "no solution with
    // every switch OFF". The obligation is recorded where the L6 precedent put it —
    // `switchRequired: "exempt"` on the lesson row — and measured by gate (2) instead.
    expect(AUDIT.gates.map((gate) => gate.id)).not.toContain(
      "no-solution-with-switches-off",
    );
    expect(AUDIT.lesson?.switchRequired).toBe("exempt");
    // …and the walking world really does finish the board, so `exempt` is a measurement:
    expect(AUDIT.allOffGoalReachable).toBe(true);
    expect(AUDIT.allOffReachableStates).toBe(41);
    expect(AUDIT.result.reachableStates).toBe(82);
  });

  it("the Aha #1 suite does not apply to this board (no gate is borrowed)", () => {
    // `latchAhaGates` is dispatched by obligation (`latch-aha-1`), so the two debuts are
    // separate gate families: Aha #1's construction bullets (one-door funnel, `par ≤ 8`)
    // must not be read on a board that is not claiming Aha #1.
    expect(AUDIT.gates.map((gate) => gate.id)).not.toContain(
      "single-door-one-switch-funnel",
    );
    expect(AUDIT.gates.map((gate) => gate.id)).not.toContain("aha-par-cap");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The pre-registered seam law, on the execution axis
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §3 — `D_exec < 13.64` ⇔ `D < 33.64`, and the bound is L10's own number", () => {
  it("the budget is the *published* 2-dp form of the shipped L10 measurement", () => {
    // Re-derived here from `l010.json` so the doc cannot drift away from the board the
    // number was read off: 13.642857 → "13.64". Using the rounded form makes the law
    // *harder* than "beat L10", never easier (13.64 < 13.642857).
    const l10 = analyseDifficulty(shippedBoard(10), explore(shippedBoard(10)));
    expect(l10.Dexec).toBeCloseTo(13.642857, 6);
    expect((l10.Dexec as number).toFixed(2)).toBe("13.64");
    expect(PORTAL_DEBUT_EXEC_BUDGET).toBe(13.64);
    expect(PORTAL_DEBUT_EXEC_BUDGET).toBeLessThan(l10.Dexec as number);
  });

  it("l011 satisfies it with room to spare, and the gate reads the measured value", () => {
    const d = AUDIT.difficulty;
    expect(d.Dexec).toBeCloseTo(8.573171, 6);
    expect(d.Dexec as number).toBeLessThan(PORTAL_DEBUT_EXEC_BUDGET);
    // The two published forms of the same axis (ADR-design-0001 / LV-007C item 2), on
    // this board: `D − w5·M` and `w1·L + w2·B + w3·T + w4·R` must agree, or the number
    // the seam law is written on would be an unbacked field.
    expect(d.Dexec).toBeCloseTo(
      (d.D as number) - DIFFICULTY_WEIGHTS.M * d.M,
      12,
    );
    expect(d.Dexec).toBeCloseTo(
      DIFFICULTY_WEIGHTS.L * (d.L as number) +
        DIFFICULTY_WEIGHTS.B * d.B +
        DIFFICULTY_WEIGHTS.T * d.T +
        DIFFICULTY_WEIGHTS.R * d.R,
      12,
    );
    expect(d.Dexec).toBeCloseTo((d.L as number) + 3 * d.B, 12);
  });

  it("the ⇔ is arithmetic: `D_exec < 13.64` holds iff `D < 33.64` at `M = 4`", () => {
    // `D_exec = D − 5·M` with `M = 4` fixed by the board (M1+M3+M2), so the two bounds
    // are the same claim in two units: 13.64 + 5·4 = 33.64.
    expect(AUDIT.difficulty.M).toBe(4);
    expect((AUDIT.difficulty.D as number) < 33.64).toBe(true);
    expect((AUDIT.difficulty.D as number) - 5 * 4).toBeCloseTo(
      AUDIT.difficulty.Dexec as number,
      12,
    );
  });

  it("the seam the §3 curve rule asks for does NOT happen on `D` — and that is the point", () => {
    // `M` rises 3 → 4 (+5 on `D`) exactly where the block changes mechanic, and `D` only
    // falls because `L` falls 9 → 4. The measured seam is therefore recorded as-is: on
    // the *total* axis a mechanic debut cannot be a dip (the same structural finding
    // `tests/solver/difficulty.test.ts` §3 pins for L5→L6), which is why the design
    // writes this law on `D_exec` and publishes both numbers.
    const l10 = analyseDifficulty(shippedBoard(10), explore(shippedBoard(10)));
    expect((AUDIT.difficulty.D as number) - (l10.D as number)).toBeCloseTo(
      -0.069686,
      6,
    );
    expect((AUDIT.difficulty.M ?? 0) - l10.M).toBe(1);
    expect((AUDIT.difficulty.L ?? 0) - (l10.L ?? 0)).toBe(-5);
    // The lever that *did* move: `B` falls 1.5476 → 1.5244, i.e. the debut is a smaller
    // state space with a lower effective branching factor — the "short (par ≤ 4)" floor.
    expect(AUDIT.difficulty.B).toBeLessThan(l10.B);
    expect(AUDIT.difficulty.B).toBeGreaterThan(1);
    expect(AUDIT.difficulty.B).toBeLessThan(AUDIT.difficulty.bRaw);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. The portal crossing is the core action of par, not bypassable decoration
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §4 — the par route really teleports, and there is exactly one of it", () => {
  it("the unique shortest route is `right × 4`, and it crosses the channel on move 2", () => {
    const signatures: string[] = [];
    forEachParRoute(L11, PAR, (route) => {
      signatures.push(route.map((arrival) => arrival.direction).join("-"));
    });
    expect(signatures).toEqual(["right-right-right-right"]);

    // Move by move, read off the walk rather than reconstructed (the teleport is the
    // arrival whose displacement is 3 tiles, the only displacement source in `applyMove`).
    const arrivals: { direction: string; player: string; phase: Phase }[] = [];
    forEachParRoute(L11, PAR, (route) => {
      for (const arrival of route)
        arrivals.push({
          direction: arrival.direction,
          player: `${arrival.state.player.x},${arrival.state.player.y}`,
          phase: arrival.state.phase,
        });
    });
    expect(arrivals).toEqual([
      { direction: "right", player: "1,1", phase: "B" }, // presses s1 (entry phase A = its activePhase)
      { direction: "right", player: "4,0", phase: "A" }, // enters (2,1) in B ⇒ teleports to (4,0)
      { direction: "right", player: "5,0", phase: "B" }, // crosses d1 in A (blue open while s1 is ON)
      { direction: "right", player: "6,0", phase: "A" }, // the goal
    ]);
  });

  it("the crossing gate's two counters agree, and they are not the same measurement", () => {
    const telemetry = portalRouteTelemetry(L11, PAR, explore(L11));
    expect(telemetry).toEqual({
      routes: 1,
      teleportRoutes: 1,
      portalEnterRoutes: 1,
      teleportArrivals: 1,
    });
    // The gate requires both counters, so a divergence would be a real anomaly (an
    // active-end entry that did not displace, or a displacement from nothing). Their
    // definitions are independent: one reads the arrival's displacement, the other the
    // *clicked* tile's phase — so this assertion is what keeps them distinguishable.
    const gate = AUDIT.gates.find(
      (entry) => entry.id === "portal-crossing-on-every-par-route",
    );
    expect(gate?.status).toBe("PASS");
    expect(gate?.detail).toContain(
      "routes with a teleporting arrival (|Δposition| ≠ 1)=1",
    );
    expect(gate?.detail).toContain("routes entering an active portal end=1");
  });

  it("no par route can reach the goal without teleporting — the portal-free world needs 7", () => {
    // The "no false routes" half, measured with a *second* BFS over the shipped rules
    // (the same board with `portals: []`), not by a parity argument: a teleport is
    // precisely what a Manhattan bound cannot model, so the only honest probe is the
    // solver. 7 > 4 ⇒ the portal is a shortcut worth 3 moves; a route that walks it is
    // not among the shortest.
    const portalFree: Level = { ...L11, portals: [] };
    expect(validateLevel(portalFree).ok).toBe(true);
    const walking = solve(portalFree);
    expect(walking.solvable).toBe(true);
    expect(walking.shortestSolution).toBe(7);
    expect(walking.shortestSolution as number).toBeGreaterThan(PAR);
    expect(
      AUDIT.gates.find((gate) => gate.id === "portal-teaching-grade-below-offered")
        ?.detail,
    ).toContain("solvable=true shortest=7 vs par=4");
  });

  it("the door is refused before it is entered — the ordered beat, on the portal board", () => {
    // `(5,0)` is the blue door: closed in B, open in A while `s1` is ON. The par route
    // enters it in A (move 3) after a teleport put the player beside it; walking off-route
    // clicks it in B and is refused. Both readers agree here, so the ordered reader
    // (LV-007C) changes no verdict — it is the carrier, not the novelty.
    expect(AUDIT.result.refusedBeforeEnteredTiles).toBe(1);
    expect(AUDIT.result.refusedBeforeEnteredTileList).toEqual(["5,0"]);
    expect(AUDIT.result.refusedThenEnteredTileList).toEqual(
      AUDIT.result.refusedBeforeEnteredTileList,
    );
    expect(AUDIT.result.refusedThenEnteredTileList).toEqual(["5,0"]);
  });

  it("gate (ii) is the shared implementation: the latch is on the route, not beside it", () => {
    const unit = AUDIT.gates.find(
      (gate) => gate.id === "shortest-solution-presses-switch-and-crosses-door",
    );
    expect(unit?.status).toBe("PASS");
    expect(unit?.detail).toContain(
      "par=4: routes=1; press-then-cross-door=1; …and that door is one of the refused tiles: routes=1",
    );
    expect(AUDIT.embeds).toMatchObject({
      parRoutes: 1,
      embedRoutes: 1,
      embedForced: true,
      // …and the walk's cost, which `tests/solver/route-budget.test.ts` owns as a table
      // row: reported, never a verdict.
      routeVisits: 5,
      routeLookaheadVisits: 80,
      routePrunedChildren: 9,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Board-level invariants and the CLI's printed metrics
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §5 — the board obeys §4, and the printed metrics are what they are", () => {
  it("`T = R = 0`, no dead state, and every reachable state can still reach the goal", () => {
    const d = AUDIT.difficulty;
    expect({ T: d.T, R: d.R }).toEqual({ T: 0, R: 0 });
    expect(d.unrecoverableRatio).toBe(0);
    expect(AUDIT.result.deadStates).toBe(0);
    expect(AUDIT.result.deadStateList).toEqual([]);
    expect(AUDIT.result.unrecoverableStates).toBe(0);
    expect(AUDIT.result.noUnrecoverableOk).toBe(true);
  });

  it("the teleport breaks the position→phase link on EVERY tile (the M2 footprint)", () => {
    // 7×3 = 21 tiles, all wall-free, and all 21 are reachable in both phases: with an
    // opposite-colour pair the parity argument that fixes "the phase an entry happens in"
    // no longer holds — which is exactly the consequence ADR-0009 schedules M2 for, and
    // the reason the level layer caveats its parity-dead-wall warning on portal boards.
    expect(AUDIT.result.dualPhaseTileList).toHaveLength(21);
    expect(AUDIT.result.dualPhaseTiles).toBe(L11.width * L11.height);
    expect(AUDIT.result.distinctPositions).toBe(21);
  });

  it("the state-space read-outs the CLI prints are pinned, not paraphrased", () => {
    expect(AUDIT.result.reachableStates).toBe(82);
    expect(AUDIT.result.maxDepth).toBe(10);
    expect(AUDIT.result.stateBudget).toBe(168);
    expect(AUDIT.difficulty.reachableStates).toBe(82);
    expect(AUDIT.difficulty.lookaheadDepth).toBe(PAR - 1);
    expect(AUDIT.difficulty.bRaw).toBeCloseTo(2.9756, 4);
    expect(AUDIT.difficulty.forcedMoveRatio).toBeCloseTo(0.024390243902439025, 12);
    expect(AUDIT.difficulty.bRaw).toBeGreaterThan(AUDIT.difficulty.B);
  });

  it("the route walk is pruned and cheap on the debut (a read-out, never a verdict)", () => {
    // `tests/solver/route-budget.test.ts` owns the **budget contract**; this records the
    // walk's actual cost on the debut next to the gate verdicts it feeds, so a future
    // change that made the winner's walk expensive would be visible where it is read.
    const stats = forEachParRouteStats(L11, PAR, () => {});
    expect(stats).toMatchObject({
      par: PAR,
      routes: 1,
      pruning: true,
      visits: 5,
      lookaheadVisits: 80,
      prunedChildren: 9,
    });
    // A pruned walk really is cheaper than the blind one on this board: the portal makes
    // the arithmetic prune unsound, so the walk walks real edges — and it still prunes.
    expect(stats.prunedChildren).toBeGreaterThan(0);
    expect(stats.visits).toBeLessThan(stats.lookaheadVisits + stats.visits);
  });

  it("the gate family is dispatched by the documented lesson: an undocumented id gets none", () => {
    // Discrimination at the dispatch level: `auditLevel` selects `portalAhaGates` from the
    // lesson row's `obligation`, not from "the board happens to carry a portal". This
    // synthetic board is M1+M3+M2 with a measured `dualPhaseTiles > 0` — i.e. exactly the
    // shape that would satisfy the debut's gates — and still gets no gate list at all,
    // because its id has no row. That is what keeps the suite a *contract on L11* rather
    // than a rule about portals.
    const latchOnly = makeLevel({
      id: 7_102,
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      doors: [door("d1", "red", [[1, 1]])],
      switches: [switchDef("s1", [2, 0], "A", ["d1"])],
      portals: [portal("p1", [1, 0], [0, 2], "A")],
    });
    expect(solve(latchOnly).dualPhaseTiles).toBeGreaterThan(0);
    expect(auditLevel(latchOnly).gates).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. The two probes that belong to this file: the validator's and the policy's
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-008 · §6 — the two named “差一点” probes: same-colour pair, bypassable portal", () => {
  it("probe 1 — a SAME-COLOUR pair is rejected by the frozen validator, not by policy", () => {
    // The inert case of M2 (ADR-0009 decision 5): `(6,2)` and `(0,2)` have the same
    // `(x + y)` parity (8 and 2, both even), so the pair can never move the player
    // between phase classes and is mechanically nothing. The rejection lives in the
    // level layer (hard error), which is why this probe cannot be a policy control:
    // a board carrying it never reaches `auditLevel`.
    const sameColour: Level = {
      ...L11,
      portals: [{ id: "p1", pair: [[6, 2], [0, 2]], activePhase: "B" }],
    };
    const verdict = validateLevel(sameColour as unknown);
    expect(verdict.ok).toBe(false);
    expect(
      verdict.errors.some((error) => /parity|colour|color|inert/i.test(error)),
      `validator errors: ${verdict.errors.join(" | ")}`,
    ).toBe(true);
    // …and the shipped pair on the same board is accepted, so the probe isolates the
    // parity clause rather than the portal shape.
    expect(validateLevel(L11).ok).toBe(true);
  });

  it("probe 2 — a portal that is off the par route is rejected by the crossing gate", () => {
    // The bypassable-decoration case: the same board with the channel dead in every
    // phase a shortest route stands in (`activePhase: "A"`) and the goal moved one tile
    // nearer, so the par route walks the whole way. This is the *policy* half of the pair
    // of probes — it is the only construction where the portal is decoration, and the
    // debut's construction floor forbids exactly that ("the portal crossing must be the
    // core action of par").
    const bypassable: Level = {
      ...L11,
      goal: [4, 1],
      portals: [{ id: "p1", pair: [[2, 1], [4, 0]], activePhase: "A" }],
    };
    const audit = auditLevel(bypassable);
    const crossing = audit.gates.find(
      (gate) => gate.id === "portal-crossing-on-every-par-route",
    );
    expect(crossing?.status).toBe("FAIL");
    expect(portalRouteTelemetry(bypassable, 4, explore(bypassable))).toMatchObject({
      routes: 1,
      teleportRoutes: 0,
      portalEnterRoutes: 0,
      teleportArrivals: 0,
    });
    expect(audit.violations.map((v) => v.code)).toContain(
      "gate-portal-crossing-on-every-par-route",
    );
    // Same board, channel live in B: the crossing gate passes again ⇒ the probe is the
    // phase, not the geometry.
    const live: Level = {
      ...L11,
      goal: [4, 1],
    };
    expect(
      auditLevel(live).gates.find(
        (gate) => gate.id === "portal-crossing-on-every-par-route",
      )?.status,
    ).toBe("PASS");
  });
});