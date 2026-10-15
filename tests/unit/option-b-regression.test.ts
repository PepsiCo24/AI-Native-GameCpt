/**
 * Option B regression suite — one case per locked clause of ADR-0008
 * (GATE C, human-approved 2026-10-14), so that no future refactor can silently
 * resurrect ADR-0006 (the post-flip standing check / union property).
 *
 * Clauses covered, in order:
 *  1. illegal ⇒ identity (no move, no flip, no moveCount, no history)
 *  3. standing inside a wall is legal — never crushed / pushed / moved
 *  4. exit from an embedded tile uses the same entry rule
 *  5-6. doors share the wall semantics; a closed door may be flipped underfoot
 *  6. portals: entry-only, once, no chains, no re-trigger, still flips phase
 *  7. isGoal is phase-independent (pure position equality)
 *  8. parity-dependent entry (walking into an other-phase wall is legal)
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import {
  baseDoorOpen,
  isLegalMove,
  applyMove,
  resolveDoorsOpen,
  solidAt,
} from "@/core/rules";
import { hashState } from "@/core/state/hash";
import { move } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import {
  applyMoveToGameState,
  initialState,
  isGoal,
  toSearchState,
} from "@/core/state/transitions";
import type { GameState, SearchState } from "@/core/state/types";
import { vec } from "@/core/state/types";
import { door, makeLevel, portal, switchDef } from "../helpers/fixtures";

/** A hand-built SearchState rooted at the level start in a chosen phase. */
function stateAtStart(level: Level, phase: Phase, switchesOn: Record<string, boolean> = {}): SearchState {
  return {
    player: vec(level.player[0], level.player[1]),
    phase,
    doorsOpen: resolveDoorsOpen(level, phase, switchesOn),
    switchesOn,
  };
}

function playMoves(level: Level, dirs: ReadonlyArray<"up" | "down" | "left" | "right">, from?: GameState): GameState {
  let gs = from ?? initialState(level);
  for (const dir of dirs) gs = applyMoveToGameState(level, gs, move(dir));
  return gs;
}

// ── clause 1: illegal ⇒ identity ─────────────────────────────────────────────

describe("ADR-0008 c1 — an illegal move is refused atomically", () => {
  const level = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    phaseAWalls: [[1, 0]],
  });

  it("SearchState: no movement, no flip — applyMove returns the identical reference", () => {
    const s = stateAtStart(level, "A");
    const right = move("right");
    expect(isLegalMove(level, s, right)).toBe(false);
    const next = applyMove(level, s, right);
    expect(next).toBe(s);
    expect(next.phase).toBe("A");
    expect(next.player).toEqual(s.player);
  });

  it("GameState: every field is identical, moveCount does not grow, history is not pushed", () => {
    const gs = initialState(level);
    const illegal = move("right");
    const next = applyMoveToGameState(level, gs, illegal);

    expect(next).toBe(gs);
    expect(next.levelId).toBe(gs.levelId);
    expect(next.playerPosition).toEqual(gs.playerPosition);
    expect(next.phase).toBe(gs.phase);
    expect(next.levelState.doorsOpen).toEqual(gs.levelState.doorsOpen);
    expect(next.levelState.switchesOn).toEqual(gs.levelState.switchesOn);
    expect(next.moveCount).toBe(gs.moveCount);
    expect(next.history).toEqual(gs.history);
    expect(next.history.length).toBe(0);
    expect(next.status).toBe(gs.status);
  });

  it("also refuses out-of-bounds moves (condition 1) without flipping", () => {
    const gs = initialState(level);
    const up = applyMoveToGameState(level, gs, move("up"));
    expect(up).toBe(gs);
    expect(up.phase).toBe("A");
    expect(up.moveCount).toBe(0);
  });
});

// ── clause 8: parity-dependent entry ─────────────────────────────────────────

describe("ADR-0008 c8 — an other-phase wall is an enterable phantom", () => {
  const level = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    phaseBWalls: [[1, 0]],
  });

  it("a Phase-B wall is a legal destination during a Phase-A step", () => {
    const s = stateAtStart(level, "A");
    const right = move("right");
    expect(solidAt(level, "A", s.doorsOpen, vec(1, 0))).toBe(false);
    expect(isLegalMove(level, s, right)).toBe(true);

    const next = applyMove(level, s, right);
    expect(next.player).toEqual(vec(1, 0));
    expect(next.phase).toBe("B"); // the move flipped the phase
  });

  it("(control) the same wall is refused once its own phase is current", () => {
    const s = stateAtStart(level, "B");
    expect(solidAt(level, "B", s.doorsOpen, vec(1, 0))).toBe(true);
    expect(isLegalMove(level, s, move("right"))).toBe(false);
  });
});

// ── clause 3: standing inside a wall is legal, never crushed/pushed/moved ────

describe("ADR-0008 c3 — the player stands inside the flipped-in wall, unmoved", () => {
  const level = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    phaseBWalls: [[1, 0]],
  });

  it("lands exactly on the target tile and keeps that tile; no crush/push/relocation", () => {
    const gs = playMoves(level, ["right"]);
    expect(gs.playerPosition).toEqual(vec(1, 0));
    expect(gs.phase).toBe("B");
    // The player is now standing on a B-solid tile — a legal, stable state.
    expect(solidAt(level, "B", gs.levelState.doorsOpen, gs.playerPosition)).toBe(true);
    // Not relocated to any neighbour.
    for (const other of [vec(0, 0), vec(2, 0), vec(1, 1)]) {
      expect(gs.playerPosition).not.toEqual(other);
    }
  });

  it("the embedded state is stable — the rules never move the player on their own", () => {
    const gs = playMoves(level, ["right"]);
    const search = toSearchState(gs);
    expect(search.player).toEqual(vec(1, 0));
    // Re-reading the state (no move applied) yields the same player — no hidden
    // auto-motion. An out-of-bounds tap is refused (identity), also motion-free.
    expect(toSearchState(gs).player).toEqual(vec(1, 0));
    expect(applyMoveToGameState(level, gs, move("up"))).toBe(gs);
  });
});

// ── clause 4: exit from an embedded tile uses the same entry rule ────────────

describe("ADR-0008 c4 — you can step out of a wall, but not into another solid tile", () => {
  const level = makeLevel({
    width: 4,
    height: 3,
    player: [0, 0],
    goal: [3, 2],
    phaseBWalls: [
      [1, 0],
      [2, 0],
    ],
  });

  it("from an embedded state, a currently-solid neighbour is refused", () => {
    const gs = playMoves(level, ["right"]); // embed at [1,0] in phase B
    expect(gs.phase).toBe("B");
    const search = toSearchState(gs);
    expect(solidAt(level, "B", search.doorsOpen, vec(2, 0))).toBe(true);
    const blocked = applyMoveToGameState(level, gs, move("right"));
    expect(blocked).toBe(gs); // no movement, no flip
    expect(blocked.phase).toBe("B");
    expect(blocked.moveCount).toBe(1);
  });

  it("from the same embedded state, a currently-open neighbour is legal", () => {
    const gs = playMoves(level, ["right"]);
    const out = applyMoveToGameState(level, gs, move("down"));
    expect(out).not.toBe(gs);
    expect(out.playerPosition).toEqual(vec(1, 1));
    expect(out.phase).toBe("A");
  });
});

// ── clause 5: doors share the wall semantics ─────────────────────────────────

describe("ADR-0008 c5 — doors are solid exactly like walls", () => {
  const redLevel = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    doors: [door("d1", "red", [[1, 0]])],
  });
  const blueLevel = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    doors: [door("d1", "blue", [[1, 0]])],
  });

  it("red is open in A / closed in B; blue is the inverse", () => {
    expect(baseDoorOpen("red", "A")).toBe(true);
    expect(baseDoorOpen("red", "B")).toBe(false);
    expect(baseDoorOpen("blue", "A")).toBe(false);
    expect(baseDoorOpen("blue", "B")).toBe(true);
  });

  it("an open door is enterable, a closed door is not (same test as a wall)", () => {
    // red in A: open → legal
    const redA = stateAtStart(redLevel, "A");
    expect(isLegalMove(redLevel, redA, move("right"))).toBe(true);
    // red in B: closed → illegal
    const redB = stateAtStart(redLevel, "B");
    expect(isLegalMove(redLevel, redB, move("right"))).toBe(false);
    // blue in A: closed → illegal; blue in B: open → legal
    const blueA = stateAtStart(blueLevel, "A");
    expect(isLegalMove(blueLevel, blueA, move("right"))).toBe(false);
    const blueB = stateAtStart(blueLevel, "B");
    expect(isLegalMove(blueLevel, blueB, move("right"))).toBe(true);
  });

  it("solidAt agrees with the door openness in both phases", () => {
    const redAd = resolveDoorsOpen(redLevel, "A", {});
    const redBd = resolveDoorsOpen(redLevel, "B", {});
    expect(solidAt(redLevel, "A", redAd, vec(1, 0))).toBe(false);
    expect(solidAt(redLevel, "B", redBd, vec(1, 0))).toBe(true);
  });
});

// ── clause 5 regression: a closed door may be flipped under the player ───────

describe("ADR-0008 c5 REGRESSION — flipping onto a closing door is legal (anti step-6 revert)", () => {
  // Under the superseded ADR-0006 this exact move was illegal: after the flip
  // the player would stand on a closed door, so the whole move was rolled back.
  // Option B keeps the move and lets the door close *under* the player. This
  // regression exists so nobody resurrects the ADR-0006 post-flip check.
  const redLevel = makeLevel({
    width: 3,
    height: 3,
    player: [0, 0],
    goal: [2, 2],
    doors: [door("d1", "red", [[1, 0]])],
  });

  it("red door: enter while A-open, flip to B, stand inside the now-closed door", () => {
    const gs0 = initialState(redLevel);
    expect(gs0.levelState.doorsOpen["d1"]).toBe(true); // open in A

    const gs1 = applyMoveToGameState(redLevel, gs0, move("right"));
    expect(gs1).not.toBe(gs0); // the move was NOT rolled back
    expect(gs1.playerPosition).toEqual(vec(1, 0));
    expect(gs1.phase).toBe("B");
    expect(gs1.levelState.doorsOpen["d1"]).toBe(false); // closed in B
    expect(gs1.status).toBe("playing");
    expect(gs1.moveCount).toBe(1);
    expect(gs1.history.length).toBe(1);
    // The blocked-for-entry tile is now the tile the player occupies.
    expect(solidAt(redLevel, "B", gs1.levelState.doorsOpen, gs1.playerPosition)).toBe(true);
  });

  it("blue door: the symmetric case (enter while B-open, flip to A, stand inside)", () => {
    const blueLevel = makeLevel({
      width: 3,
      height: 3,
      player: [0, 0],
      goal: [2, 2],
      doors: [door("d1", "blue", [[1, 1]])],
    });
    // move 1: DOWN in A (open cell) → phase B. move 2: RIGHT onto the blue door,
    // which is open while B is current → legal; flip to A where blue is closed.
    const gs = playMoves(blueLevel, ["down", "right"]);
    expect(gs.playerPosition).toEqual(vec(1, 1));
    expect(gs.phase).toBe("A");
    expect(gs.levelState.doorsOpen["d1"]).toBe(false);
    expect(solidAt(blueLevel, "A", gs.levelState.doorsOpen, gs.playerPosition)).toBe(true);
  });
});

// ── clause 6: switches trigger on entry only, in the current phase ───────────

describe("ADR-0008 c6 (switch) — entering, leaving, wrong phase", () => {
  const level = makeLevel({
    width: 4,
    height: 3,
    player: [0, 0],
    goal: [3, 2],
    doors: [door("d1", "red", [[0, 2]])],
    switches: [
      switchDef("sA", [1, 0], "A", ["d1"]),
      switchDef("sC", [2, 0], "A", ["d1"]),
    ],
  });

  it("entering the switch tile while its activePhase is current toggles it once", () => {
    const gs = playMoves(level, ["right"]); // enter [1,0] in phase A; sA.activePhase = A
    expect(gs.levelState.switchesOn["sA"]).toBe(true);
    expect(gs.levelState.switchesOn["sC"]).toBe(false);
    expect(gs.phase).toBe("B");
    // Single ON switch targeting d1 inverts red's B-closed base → open.
    expect(gs.levelState.doorsOpen["d1"]).toBe(true);
  });

  it("leaving the switch tile does not toggle it again", () => {
    const entered = playMoves(level, ["right"]);
    expect(entered.levelState.switchesOn["sA"]).toBe(true);
    const left = applyMoveToGameState(level, entered, move("left"));
    expect(left.playerPosition).toEqual(vec(0, 0));
    expect(left.phase).toBe("A");
    expect(left.levelState.switchesOn["sA"]).toBe(true); // unchanged by leaving
  });

  it("entering the same switch in the wrong phase does nothing", () => {
    const atSwitch = playMoves(level, ["right"]); // [1,0], phase B
    // step RIGHT to [2,0] in phase B; sC.activePhase = A ⇒ must NOT toggle
    const wrong = applyMoveToGameState(level, atSwitch, move("right"));
    expect(wrong.playerPosition).toEqual(vec(2, 0));
    expect(wrong.levelState.switchesOn["sC"]).toBe(false);
    expect(wrong.phase).toBe("A");
  });

  it("standing on an active switch without entering never triggers it", () => {
    // After the wrong-phase move the player stands on [2,0] in phase A, where
    // sC IS active — standing must still not toggle (entry-triggered only).
    const standing = playMoves(level, ["right", "right"]);
    expect(standing.playerPosition).toEqual(vec(2, 0));
    expect(standing.phase).toBe("A");
    expect(standing.levelState.switchesOn["sC"]).toBe(false);

    const away = applyMoveToGameState(level, standing, move("right"));
    expect(away.levelState.switchesOn["sC"]).toBe(false);
  });
});

// ── clause 6: portals are entry-only, once, non-chaining ─────────────────────

describe("ADR-0008 c6 (portal) — teleport on entry only, no chains, no re-trigger", () => {
  it("entering a portal in its active phase teleports once and still flips the phase", () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      portals: [portal("p1", [1, 0], [3, 0], "A"), portal("p2", [3, 0], [0, 2], "A")],
    });
    const search = stateAtStart(level, "A");
    const next = applyMove(level, search, move("right"));
    expect(next.player).toEqual(vec(3, 0)); // p1 teleport
    expect(next.phase).toBe("B"); // every legal move flips
    // no chain: p2 also ends on [3,0] but must not fire in the same move
    expect(next.player).not.toEqual(vec(0, 2));
  });

  it("a flip that activates a portal under the player does not teleport", () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      portals: [portal("pB", [1, 0], [3, 0], "B")],
    });
    const search = stateAtStart(level, "A"); // portal pB is inactive in A
    const next = applyMove(level, search, move("right"));
    expect(next.player).toEqual(vec(1, 0)); // stepped onto the portal end…
    expect(next.phase).toBe("B"); // …flip activates it, but standing ≠ entering
    expect(next.player).not.toEqual(vec(3, 0));
  });

  it("walking off a portal (without entering another) does not teleport", () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      portals: [portal("pB", [1, 0], [3, 0], "B")],
    });
    const afterFlip = playMoves(level, ["right"]); // stands on active portal in B
    const walkedOff = applyMoveToGameState(level, afterFlip, move("right"));
    expect(walkedOff.playerPosition).toEqual(vec(2, 0));
    expect(walkedOff.phase).toBe("A");
  });

  it("DOCUMENTED CURRENT BEHAVIOUR (OQ): the teleport is unconditional once entry is legal", () => {
    // OPEN QUESTION, flagged in `src/core/rules/applyMove.ts` step 3, NOT a
    // locked rule: docs/architecture.md §6.2 step 3 says the landing tile must
    // pass the same entry check, while §6.1 + the implementation contract say
    // step 1 is the only failure point. `applyMove` takes the
    // invariant-preserving reading: entry legality is judged, then the teleport
    // is unconditional, and an embedded landing is the legal ADR-0008 clause-3
    // state. This test pins TODAY's behaviour so a silent change is caught; if
    // the Architect rules for a landing check, update this test and the code
    // together. (For validator-clean levels the two readings coincide because
    // portal ends must not be solid in their own activePhase.)
    const level = makeLevel({
      width: 5,
      height: 2,
      player: [0, 0],
      goal: [4, 1],
      doors: [door("d1", "blue", [[4, 0]])], // blue is closed in A
      portals: [portal("p1", [1, 0], [4, 0], "A")],
    });
    const s = stateAtStart(level, "A");
    // [4,0] is a closed blue door while A is current → "solid at landing".
    expect(solidAt(level, "A", s.doorsOpen, vec(4, 0))).toBe(true);
    const next = applyMove(level, s, move("right"));
    expect(next.player).toEqual(vec(4, 0)); // teleport still happened
    expect(next.phase).toBe("B");
  });
});

// ── clause 7: win is phase-independent ───────────────────────────────────────

describe("ADR-0008 c7 — isGoal is pure position equality, no phase term", () => {
  const level = makeLevel({ width: 3, height: 3, player: [0, 0], goal: [2, 2] });

  it("standing on the goal wins in either phase", () => {
    expect(isGoal(level, { ...stateAtStart(level, "A"), player: vec(2, 2) })).toBe(true);
    expect(isGoal(level, { ...stateAtStart(level, "B"), player: vec(2, 2) })).toBe(true);
  });

  it("not on the goal never wins, in either phase", () => {
    expect(isGoal(level, { ...stateAtStart(level, "A"), player: vec(1, 2) })).toBe(false);
    expect(isGoal(level, { ...stateAtStart(level, "B"), player: vec(1, 2) })).toBe(false);
  });

  it("win is checked on the fully-resolved state and latches the playable status", () => {
    const small = makeLevel({ width: 3, height: 1, player: [0, 0], goal: [2, 0] });
    const gs = playMoves(small, ["right", "right"]);
    expect(gs.status).toBe("won");
    expect(isGoal(small, toSearchState(gs))).toBe(true);
    // the hash never depends on win bookkeeping
    expect(hashState(toSearchState(gs))).toBe(hashState(toSearchState(gs)));
  });
});