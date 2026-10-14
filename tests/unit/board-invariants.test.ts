/**
 * Board-invariant suite — the GATE D parity theorem as an executable test
 * (`src/levels/README.md` §3, F1 + F2; `docs/level-design.md` §0).
 *
 * Two facts are pinned, so the design layer cannot re-tell itself a story the
 * code disproves:
 *
 *  - `dualPhaseTiles == 0` for M0-only content: no tile is reachable in both
 *    phases — arrival phase is a function of the tile.
 *  - `phase(reachable at tile c) == startPhase XOR (parity(c) XOR parity(start))`.
 *
 * And one positive control: an **opposite-colour** portal pair (ends on
 * different chessboard parities) breaks the invariant, while a **same-colour**
 * pair leaves it intact — a teleport changes position without spending a move.
 *
 * REFACTOR DEBT: the BFS lives in `tests/helpers/search.ts` only because
 * `src/core/solver/**` (SOLVER-001) does not exist yet; this suite should
 * re-point there when it does.
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import { isLegalMove } from "@/core/rules";
import { move } from "@/core/state/move";
import { applyMoveToGameState, initialState, toSearchState } from "@/core/state/transitions";
import { door, makeLevel, portal, randomM0Level, switchDef } from "../helpers/fixtures";
import {
  dualPhaseTiles,
  phaseFormulaViolations,
  reachableStates,
} from "../helpers/search";

describe("GATE D invariant — M0 random levels", () => {
  it("no tile is reachable in two phases, and the arrival phase matches the parity formula", () => {
    let checkedLevels = 0;
    let checkedStates = 0;
    for (let seed = 1; seed <= 250; seed += 1) {
      const level = randomM0Level(seed);
      const reachable = reachableStates(level);
      checkedLevels += 1;
      checkedStates += reachable.size;

      expect(dualPhaseTiles(level), `dual-phase tile in seed ${seed}`).toEqual([]);
      expect(
        phaseFormulaViolations(level),
        `phase-formula violation in seed ${seed}`,
      ).toEqual([]);
    }
    // Guard against a vacuous sweep.
    expect(checkedLevels).toBe(250);
    expect(checkedStates).toBeGreaterThan(1000);
  });

  it("the theorem also holds on the golden embedded fixture", () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      player: [0, 1],
      goal: [4, 1],
      phaseAWalls: [[2, 0]],
      phaseBWalls: [[3, 1]],
    });
    expect(dualPhaseTiles(level)).toEqual([]);
    expect(phaseFormulaViolations(level)).toEqual([]);
  });

  it("holds for M1 doors and M0+doors (door solidity is still phase-only, no switches)", () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      player: [0, 1],
      goal: [4, 1],
      doors: [door("d1", "red", [[1, 1]]), door("d2", "blue", [[2, 1]])],
    });
    expect(dualPhaseTiles(level)).toEqual([]);
    expect(phaseFormulaViolations(level)).toEqual([]);
  });
});

describe("GATE D invariant — portals are the mechanism that breaks it", () => {
  const openBoard = (): Level =>
    makeLevel({ width: 5, height: 5, player: [0, 0], goal: [4, 4] });

  it("control: the open board alone has zero dual-phase tiles", () => {
    expect(dualPhaseTiles(openBoard())).toEqual([]);
    expect(phaseFormulaViolations(openBoard())).toEqual([]);
  });

  it("an OPPOSITE-colour portal pair (>0 dual-phase tiles) breaks the position→phase function", () => {
    // [1,0] has parity 1; [4,0] has parity 0 — different colours.
    const level = makeLevel({
      width: 5,
      height: 5,
      player: [0, 0],
      goal: [4, 4],
      portals: [portal("p1", [1, 0], [4, 0], "A")],
    });
    const dual = dualPhaseTiles(level);
    expect(dual.length).toBeGreaterThan(0);
    expect(phaseFormulaViolations(level).length).toBeGreaterThan(0);
    // exactly the teleport target is the tile that can be reached in both phases
    expect(dual.map((d) => d.tile)).toContain("4,0");
  });

  it("a SAME-colour portal pair leaves dual-phase tiles at 0 and the formula intact", () => {
    // [1,0] and [3,0] both have parity 1 — same colour: the teleport preserves
    // the chessboard parity, so the phase stays a function of the tile.
    const level = makeLevel({
      width: 5,
      height: 5,
      player: [0, 0],
      goal: [4, 4],
      portals: [portal("p1", [1, 0], [3, 0], "A")],
    });
    expect(dualPhaseTiles(level)).toEqual([]);
    expect(phaseFormulaViolations(level)).toEqual([]);
    // …but the portal is still live (it must have changed the reachable set).
    expect(reachableStates(level).size).toBeGreaterThan(0);
  });

  it("switches (M3) create dynamism WITHOUT breaking the parity theorem", () => {
    // A switch never moves the player, so the phase stays a function of the
    // tile's parity — dualPhaseTiles stays 0 (contrast with portals above).
    // What a switch changes is *door enterability on the same parity*: the
    // "refused-then-entered" dynamism in `src/levels/README.md` §3.
    const level = makeLevel({
      width: 5,
      height: 5,
      player: [0, 0],
      goal: [4, 4],
      doors: [door("d1", "red", [[2, 0]])],
      switches: [switchDef("s1", [1, 0], "A", ["d1"])],
    });
    expect(dualPhaseTiles(level)).toEqual([]);
    expect(phaseFormulaViolations(level)).toEqual([]);

    // Move RIGHT onto the switch (phase A) → s1 on, phase flips to B.
    const gs = applyMoveToGameState(level, initialState(level), move("right"));
    expect(gs.levelState.switchesOn["s1"]).toBe(true);
    expect(gs.levelState.doorsOpen["d1"]).toBe(true); // base red is closed in B; switch opens it
    expect(isLegalMove(level, toSearchState(gs), move("right"))).toBe(true); // enter [2,0] in B

    // Control: without the switch the same entry is refused (base red is closed in B).
    const noSwitch = makeLevel({
      width: 5,
      height: 5,
      player: [0, 0],
      goal: [4, 4],
      doors: [door("d1", "red", [[2, 0]])],
    });
    const gsNo = applyMoveToGameState(noSwitch, initialState(noSwitch), move("right"));
    expect(gsNo.levelState.doorsOpen["d1"]).toBe(false);
    expect(isLegalMove(noSwitch, toSearchState(gsNo), move("right"))).toBe(false);
  });
});