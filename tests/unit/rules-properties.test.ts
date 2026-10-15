/**
 * Property test — the `applyMove` / `isLegalMove` equivalence pin.
 *
 * `docs/architecture.md` §6.2 implementation contract (MUST):
 *   `isLegalMove(level, s, m) ⟺ applyMove(level, s, m) ≢ s`
 * over generated states — **including states where the player stands inside a
 * current-phase-solid cell** (embedded states, ADR-0008 clause 3).
 *
 * ⚠ LAYER DISCIPLINE (this is the whole point of the split below):
 * the equivalence is a property of the pure `SearchState` rules layer ONLY.
 * The playable `GameState` layer deliberately violates it once a level is won:
 * `applyMoveToGameState` short-circuits on `status === "won"` and returns the
 * state itself (`src/core/state/transitions.ts:117-118`), so a move that is
 * legal on the board is *locked* in the playable state. Asserting the
 * equivalence at the `GameState` layer would produce a "test is red but the
 * code is correct" false alarm. Both layers are asserted here, separately, and
 * that is intentional, not a workaround.
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import { applyMove, isLegalMove, solidAt } from "@/core/rules";
import { hashState } from "@/core/state/hash";
import { move } from "@/core/state/move";
import { applyMoveToGameState, initialState, isGoal, toSearchState } from "@/core/state/transitions";
import type { GameState, SearchState } from "@/core/state/types";
import { vec } from "@/core/state/types";
import { door, makeLevel, portal, randomM0Level, switchDef } from "../helpers/fixtures";
import { ALL_MOVES, legalMoves, reachableStates } from "../helpers/search";

// A spread of rule surface: empty board, embedded-by-flip, both-phase walls,
// doors, switches, same- and opposite-colour portals. Every one is a valid
// `Level`; the property must hold on all of them.
const FIXTURES: ReadonlyArray<readonly [string, Level]> = [
  ["empty 5x3 (l001-like)", makeLevel({ width: 5, height: 3, player: [0, 1], goal: [4, 1] })],
  [
    "B-wall flipped onto the player",
    makeLevel({ width: 3, height: 3, player: [0, 0], goal: [2, 2], phaseBWalls: [[1, 0]] }),
  ],
  [
    "A- and B-walls",
    makeLevel({
      width: 4,
      height: 4,
      player: [0, 0],
      goal: [3, 3],
      phaseAWalls: [[1, 1]],
      phaseBWalls: [[2, 1]],
    }),
  ],
  [
    "red door",
    makeLevel({ width: 4, height: 3, player: [0, 0], goal: [3, 0], doors: [door("d1", "red", [[1, 0]])] }),
  ],
  [
    "blue door",
    makeLevel({ width: 4, height: 3, player: [0, 0], goal: [3, 0], doors: [door("d1", "blue", [[1, 0]])] }),
  ],
  [
    "switch + door",
    makeLevel({
      width: 4,
      height: 3,
      player: [0, 0],
      goal: [3, 2],
      doors: [door("d1", "red", [[2, 0]])],
      switches: [switchDef("s1", [1, 0], "A", ["d1"])],
    }),
  ],
  [
    "same-colour portal",
    makeLevel({
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      portals: [portal("p1", [1, 0], [3, 0], "A")],
    }),
  ],
  [
    "opposite-colour portal",
    makeLevel({
      width: 5,
      height: 3,
      player: [0, 0],
      goal: [4, 2],
      portals: [portal("p1", [1, 0], [4, 0], "A")],
    }),
  ],
];

function embeddedStates(level: Level, states: Map<string, SearchState>): SearchState[] {
  return [...states.values()].filter((s) => solidAt(level, s.phase, s.doorsOpen, s.player));
}

describe("SearchState layer — isLegalMove(level, s, m) ⟺ applyMove(level, s, m) ≢ s", () => {
  for (const [name, level] of FIXTURES) {
    it(`${name}: holds over every reachable state × 4 directions`, () => {
      const states = reachableStates(level);
      expect(states.size).toBeGreaterThan(0);

      for (const s of states.values()) {
        for (const m of ALL_MOVES) {
          const legal = isLegalMove(level, s, m);
          const next = applyMove(level, s, m);
          expect(legal, `${name} state=${hashState(s)} move=${m.dir}`).toBe(next !== s);
          // Illegal ⇒ identity, by reference (ADR-0008 clause 1).
          if (!legal) expect(next).toBe(s);
        }
      }
    });
  }

  it("the generated state sets include embedded states (ADR-0008 clause 3)", () => {
    const embeddedFixture = makeLevel({
      width: 3,
      height: 3,
      player: [0, 0],
      goal: [2, 2],
      phaseBWalls: [[1, 0], [1, 1]],
    });
    const embedded = embeddedStates(embeddedFixture, reachableStates(embeddedFixture));
    expect(embedded.length).toBeGreaterThan(0);
    // …and an embedded state still has the equivalence checked on it.
    for (const s of embedded) {
      for (const m of ALL_MOVES) {
        expect(isLegalMove(embeddedFixture, s, m)).toBe(
          applyMove(embeddedFixture, s, m) !== s,
        );
      }
    }
  });
});

describe("SearchState layer — randomised sweep", () => {
  it("holds on 60 seeded random M0 levels' full reachable graphs", () => {
    let states = 0;
    for (let seed = 1; seed <= 60; seed += 1) {
      const level = randomM0Level(seed);
      for (const s of reachableStates(level).values()) {
        states += 1;
        for (const m of ALL_MOVES) {
          const legal = isLegalMove(level, s, m);
          const next = applyMove(level, s, m);
          expect(legal, `seed ${seed} state=${hashState(s)} move=${m.dir}`).toBe(next !== s);
        }
      }
    }
    expect(states).toBeGreaterThan(500);
  });
});

describe("GameState layer — the won-state lock is a deliberate exception (transitions.ts:118)", () => {
  it("after a win, applyMoveToGameState refuses every move (identity), even board-legal ones", () => {
    const level = makeLevel({ width: 5, height: 3, player: [0, 1], goal: [4, 1] });
    let gs: GameState = initialState(level);
    // Four RIGHT steps win l001's straight line.
    for (let i = 0; i < 4; i += 1) {
      gs = applyMoveToGameState(level, gs, move("right"));
    }
    expect(gs.status).toBe("won");
    expect(isGoal(level, toSearchState(gs))).toBe(true);

    // At least one board-legal move exists on the won state…
    const search = toSearchState(gs);
    const boardLegal = ALL_MOVES.filter((m) => isLegalMove(level, search, m));
    expect(boardLegal.length).toBeGreaterThan(0);

    // …yet the playable state locks: identity for every direction, and the
    // equivalence `isLegalMove ⟺ changed` is FALSE here *by design*.
    for (const m of ALL_MOVES) {
      const next = applyMoveToGameState(level, gs, m);
      expect(next, `won-state lock must refuse ${m.dir}`).toBe(gs);
    }
    // Explicit statement of the layer difference, so a future reader cannot
    // mistake the lock for a rules bug.
    const right = move("right");
    expect(isLegalMove(level, search, right)).toBe(false); // off-grid at [4,1]
    const left = move("left");
    expect(isLegalMove(level, search, left)).toBe(true);
    expect(applyMove(level, search, left)).not.toBe(search); // rules layer moves
    expect(applyMoveToGameState(level, gs, left)).toBe(gs); // playable layer locks
  });
});

describe("rules-layer sanity — the fixtures exercise the interesting surface", () => {
  it("a move onto a currently-solid tile is illegal and changes nothing", () => {
    const level = makeLevel({
      width: 3,
      height: 3,
      player: [0, 0],
      goal: [2, 2],
      phaseAWalls: [[1, 0]],
    });
    const s: SearchState = toSearchState(initialState(level));
    const right = move("right");
    expect(isLegalMove(level, s, right)).toBe(false);
    expect(applyMove(level, s, right)).toBe(s);
    expect(hashState(applyMove(level, s, right))).toBe(hashState(s));
  });

  it("legalMoves and applyMove agree on the fixture set", () => {
    for (const [name, level] of FIXTURES) {
      for (const s of reachableStates(level).values()) {
        const legal = legalMoves(level, s);
        for (const m of ALL_MOVES) {
          expect(legal.includes(m), `${name} ${hashState(s)} ${m.dir}`).toBe(
            isLegalMove(level, s, m),
          );
        }
      }
    }
  });

  it("the SearchState type carries no moveCount / status bookkeeping", () => {
    // Compile-time contract, pinned at runtime so drift is visible.
    const s: SearchState = {
      player: vec(0, 0),
      phase: "A",
      doorsOpen: {},
      switchesOn: {},
    };
    expect(Object.keys(s).sort()).toEqual(["doorsOpen", "phase", "player", "switchesOn"]);
  });
});