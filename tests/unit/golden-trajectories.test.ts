/**
 * Golden trajectories — the two worked examples in the design docs, asserted
 * move by move. These are the "known-good" paths; if the rules engine drifts,
 * one of these breaks immediately.
 *
 * 1. `docs/game-design.md` §3.1 worked example (the V0.4 rule in action).
 * 2. `docs/level-design.md` §1 example — the `R,R,R,R` Option-B illustration,
 *    including the step-3 B-wall entry and the embedded state it produces.
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import { isLegalMove, solidAt } from "@/core/rules";
import { move } from "@/core/state/move";
import {
  applyMoveToGameState,
  initialState,
  isGoal,
  toSearchState,
} from "@/core/state/transitions";
import type { GameState } from "@/core/state/types";
import { vec } from "@/core/state/types";
import { makeLevel } from "../helpers/fixtures";
import { reachableStates, shortestSolution } from "../helpers/search";

function step(level: Level, gs: GameState, dir: "up" | "down" | "left" | "right"): GameState {
  const next = applyMoveToGameState(level, gs, move(dir));
  expect(next, `move ${dir} should have been legal`).not.toBe(gs);
  return next;
}

describe("golden trajectory — docs/game-design.md §3.1 worked example", () => {
  //   0 1 2      0 1 2
  // 0 . . .    0 . . .
  // 1 P . . →  1 P # .   # = Phase-B wall at [1,1]
  // 2 . . G    2 . . G
  const level = makeLevel({
    width: 3,
    height: 3,
    player: [0, 1],
    goal: [2, 2],
    phaseBWalls: [[1, 1]],
  });

  it("the RIGHT tap into the Phase-A-empty tile is legal and embeds the player", () => {
    const gs0 = initialState(level);
    expect(gs0.playerPosition).toEqual(vec(0, 1));
    expect(gs0.phase).toBe("A");
    // [1,1] is a Phase-B wall, i.e. empty while A is current → entry is legal.
    expect(solidAt(level, "A", gs0.levelState.doorsOpen, vec(1, 1))).toBe(false);
    expect(isLegalMove(level, toSearchState(gs0), move("right"))).toBe(true);

    const gs1 = step(level, gs0, "right");
    expect(gs1.playerPosition).toEqual(vec(1, 1));
    expect(gs1.phase).toBe("B");
    expect(gs1.moveCount).toBe(1);
    // The Phase-B wall materialized *under* the player: embedded, safe, unmoved.
    expect(solidAt(level, "B", gs1.levelState.doorsOpen, gs1.playerPosition)).toBe(true);
  });

  it("the player may exit to a Phase-B-open neighbour, never into another B-solid tile", () => {
    const gs1 = step(level, initialState(level), "right");
    // LEFT back to [0,1] is open in B → legal.
    const left = step(level, gs1, "left");
    expect(left.playerPosition).toEqual(vec(0, 1));
    expect(left.phase).toBe("A");
    // DOWN to [1,2] is open in B → legal (from the embedded state).
    const down = step(level, gs1, "down");
    expect(down.playerPosition).toEqual(vec(1, 2));
    expect(down.phase).toBe("A");
    // UP to [1,0] is open in B too → legal.
    const up = step(level, gs1, "up");
    expect(up.playerPosition).toEqual(vec(1, 0));
  });

  it("the example's headline contrast: the moved-onto tile IS solid in B", () => {
    // Under the superseded V0.2 rule this exact tap was refused precisely because
    // the post-flip tile is B-solid. Option B judges entry only, in A.
    const gs0 = initialState(level);
    expect(solidAt(level, "A", gs0.levelState.doorsOpen, vec(1, 1))).toBe(false);
    const sB = {
      player: vec(0, 1),
      phase: "B" as const,
      doorsOpen: gs0.levelState.doorsOpen,
      switchesOn: gs0.levelState.switchesOn,
    };
    expect(solidAt(level, "B", sB.doorsOpen, vec(1, 1))).toBe(true);
    expect(isLegalMove(level, sB, move("right"))).toBe(false); // from a B state it would be refused
  });
});

describe("golden trajectory — docs/level-design.md §1 example (R,R,R,R)", () => {
  const level: Level = {
    id: 5,
    width: 5,
    height: 3,
    startPhase: "A",
    player: [0, 1],
    goal: [4, 1],
    phaseAWalls: [[2, 0]],
    phaseBWalls: [[3, 1]],
    doors: [],
    switches: [],
    portals: [],
    par: 6,
  };

  it("walks R,R,R,R: step 3 enters the B wall in A and embeds the player; step 4 wins", () => {
    let gs = initialState(level);
    expect(gs.playerPosition).toEqual(vec(0, 1));
    expect(gs.phase).toBe("A");

    gs = step(level, gs, "right");
    expect(gs.playerPosition).toEqual(vec(1, 1));
    expect(gs.phase).toBe("B");
    expect(gs.moveCount).toBe(1);

    gs = step(level, gs, "right");
    expect(gs.playerPosition).toEqual(vec(2, 1));
    expect(gs.phase).toBe("A");
    expect(gs.moveCount).toBe(2);

    // Step 3: [3,1] is a Phase-B wall, entered during a Phase-A step.
    gs = step(level, gs, "right");
    expect(gs.playerPosition).toEqual(vec(3, 1));
    expect(gs.phase).toBe("B");
    expect(gs.moveCount).toBe(3);
    expect(solidAt(level, "B", gs.levelState.doorsOpen, gs.playerPosition)).toBe(true);

    // Step 4: exit the embedded tile onto the goal — legal in B, wins regardless of phase.
    gs = step(level, gs, "right");
    expect(gs.playerPosition).toEqual(vec(4, 1));
    expect(gs.phase).toBe("A");
    expect(gs.moveCount).toBe(4);
    expect(isGoal(level, toSearchState(gs))).toBe(true);
    expect(gs.status).toBe("won");
  });

  it("the doc's `par: 6` contradicts its own prose — the true shortest is 4", () => {
    // `src/levels/README.md` §4 flags this doc inconsistency as a tracking item.
    // The prose (and the trajectory above) give R,R,R,R = 4 moves. QA pins the
    // *actual* solver value; it does NOT assert the doc's `par` field.
    expect(shortestSolution(level)).toBe(4);
    expect(level.par).toBe(6);
  });

  it("phaseAWalls [[2,0]] is parity-dead decoration (d=3, needs an even arrival)", () => {
    // [2,0] is never enterable under startPhase A (parity theorem F2,
    // `src/levels/README.md` §3): an A-wall needs an even-distance arrival, but
    // d([2,0]) = 3. It can therefore never appear as a reachable player position.
    const occupied = [...reachableStates(level).values()].some(
      (s) => s.player.x === 2 && s.player.y === 0,
    );
    expect(occupied).toBe(false);
  });
});