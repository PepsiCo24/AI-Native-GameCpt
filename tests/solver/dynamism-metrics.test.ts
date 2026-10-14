/**
 * The two §8 dynamism metrics (`docs/architecture.md` §8) — **positive and
 * negative controls**, so a zero is evidence rather than a broken measurement.
 *
 * ADR-0009 is the truth source. Its measured table (400 boards per class, re-run
 * on the shipped solver) is the *reason* these controls are shaped the way they
 * are — and it is also why this file does **not** pair the metrics the way a
 * first glance suggests:
 *
 *   | class                        | `refusedThenEnteredTiles > 0` | `dualPhaseTiles > 0` |
 *   |---|---|---|
 *   | M0 walls alone               | 0                             | 0                    |
 *   | M1 doors alone               | 0                             | 0                    |
 *   | M1 + M3 switch → door latch  | **142/369**                   | **0**                |
 *   | M2 opposite-colour portal    | **200/203**                   | **203/203**          |
 *
 * i.e. **opposite-colour portals are the only measured producer of dual-phase
 * tiles**, while a door + switch latch produces *refusals that depend on history*
 * (`refusedThenEnteredTiles`) **without** ever producing a dual-phase tile — a
 * switch never moves the player, so the checkerboard invariant survives it. Both
 * facts are pinned as controls below; a latch board asserting
 * `dualPhaseTiles > 0` would be a *failing* test against the program of record.
 *
 * A third control pins the machine-enforced authoring law: a **same-colour**
 * portal pair cannot produce dynamism at all, and the validator now rejects it
 * outright (ADR-0009 decision 5).
 */

import { describe, expect, it } from "vitest";
import type { Coord, Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import { analyse, explore, solve } from "@/core/solver/bfs";
import { door, makeLevel, portal, randomM0Level, switchDef } from "../helpers/fixtures";
import { makeRng } from "../helpers/search";

/**
 * The latch board — red door + the switch that targets it (M1 + M3, the L6–L10
 * teaching unit). This is the *positive control* for `refusedThenEnteredTiles`:
 * the tile the door sits on is refused before the switch is pressed and accepted
 * after, so the metric must fire.
 */
const LATCH: Level = makeLevel({
  width: 5,
  height: 5,
  player: [0, 0],
  goal: [4, 4],
  doors: [door("d1", "red", [[2, 0]])],
  switches: [switchDef("s1", [1, 0], "A", ["d1"])],
});

/** The same board with the switch removed — "M1 doors alone". */
const DOOR_WITHOUT_SWITCH: Level = makeLevel({
  width: 5,
  height: 5,
  player: [0, 0],
  goal: [4, 4],
  doors: [door("d1", "red", [[2, 0]])],
});

/**
 * Opposite-colour portal pair (ends `(1,0)` parity 1 and `(0,2)` parity 0) plus a
 * single A-wall, so the board both refuses clicks and teleports.
 */
const PORTAL_OPPOSITE: Level = makeLevel({
  width: 3,
  height: 3,
  player: [0, 0],
  goal: [2, 2],
  phaseAWalls: [[2, 0]],
  portals: [portal("p1", [1, 0], [0, 2], "A")],
});

/** Same-colour pair (`(1,0)` and `(3,0)` are both parity 1): provably inert. */
const PORTAL_SAME_COLOUR: Level = makeLevel({
  width: 5,
  height: 5,
  player: [0, 0],
  goal: [4, 4],
  portals: [portal("p1", [1, 0], [3, 0], "A")],
});

/** Seeded M1-only board: phase walls + exactly one door, **no switches**. */
function randomM1Level(seed: number): Level {
  const rng = makeRng(seed);
  const width = 4 + Math.floor(rng() * 2);
  const height = 4 + Math.floor(rng() * 2);
  const cells: Coord[] = [];
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) cells.push([x, y] as Coord);
  }
  const pick = (): Coord => cells[Math.floor(rng() * cells.length)] as Coord;
  const player = pick();
  let goal = pick();
  while (goal[0] === player[0] && goal[1] === player[1]) goal = pick();
  const isEnd = (c: Coord): boolean =>
    (c[0] === player[0] && c[1] === player[1]) || (c[0] === goal[0] && c[1] === goal[1]);
  const interior = cells.filter((c) => !isEnd(c));

  return makeLevel({
    id: 7400 + seed,
    width,
    height,
    startPhase: rng() < 0.5 ? "A" : "B",
    player,
    goal,
    phaseAWalls: cells.filter((c) => !isEnd(c) && rng() < 0.2),
    phaseBWalls: cells.filter((c) => !isEnd(c) && rng() < 0.2),
    doors: [
      {
        id: "d1",
        color: rng() < 0.5 ? "red" : "blue",
        tiles: [interior[Math.floor(rng() * interior.length)] as Coord],
      },
    ],
  });
}

describe("dualPhaseTiles — positive control: an opposite-colour portal breaks position→phase", () => {
  it("the minimal portal board has dual-phase tiles (and refuses clicks too)", () => {
    const result = solve(PORTAL_OPPOSITE);
    expect(result.dualPhaseTiles).toBeGreaterThan(0);
    // The teleport target is one of the tiles reachable in both phases.
    expect(result.dualPhaseTileList).toContain("0,2");
    // …and the same board also exercises refusals (the A-wall), so this is not a
    // trivial "everything is reachable" board.
    expect(result.refusedThenEnteredTiles).toBeGreaterThan(0);
  });

  it("on an open board an opposite-colour pair makes EVERY tile dual-phase", () => {
    // The 5 × 5 analogue of ADR-0009's "203/203 boards with dual-phase tiles":
    // with nothing solid to refuse a click, free teleporting decouples the phase
    // from the move count everywhere.
    const level = makeLevel({
      width: 5,
      height: 5,
      player: [0, 0],
      goal: [4, 4],
      portals: [portal("p1", [1, 0], [4, 0], "A")],
    });
    const result = solve(level);
    expect(result.dualPhaseTiles).toBe(25);
    expect(result.dualPhaseTileList).toHaveLength(25);
    // Sanity: the board has no walls/doors, so no click is ever refused.
    expect(result.refusedThenEnteredTiles).toBe(0);
  });
});

describe("dualPhaseTiles — negative controls: M0 and M1-alone are provably static", () => {
  it("is 0 on 150 seeded M0 wall-only boards", () => {
    for (let seed = 1; seed <= 150; seed += 1) {
      const level = randomM0Level(seed);
      expect(solve(level).dualPhaseTiles, `M0 seed ${seed}`).toBe(0);
    }
  });

  it("is 0 on 60 seeded M1 doors-only boards", () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const level = randomM1Level(seed);
      expect(solve(level).dualPhaseTiles, `M1 seed ${seed}`).toBe(0);
    }
  });

  it("is 0 on a door a hair away from being a latch (no switch)", () => {
    expect(solve(DOOR_WITHOUT_SWITCH).dualPhaseTiles).toBe(0);
  });
});

describe("refusedThenEnteredTiles — positive control: the latch, not parity, fires it", () => {
  it("fires on the door + switch board, on exactly the door's tile", () => {
    const result = solve(LATCH);
    expect(result.refusedThenEnteredTiles).toBeGreaterThan(0);
    // The door tile is refused while `s1` is off (red is closed in B) and
    // accepted once the switch latched it open — the Aha #1 beat.
    expect(result.refusedThenEnteredTileList).toContain("2,0");
    // ADR-0009: a switch never relocates the player ⇒ the parity invariant
    // survives the latch ⇒ dual-phase tiles stay 0 on this board.
    expect(result.dualPhaseTiles).toBe(0);
  });

  it("fires on the opposite-colour portal board too (the M2 mechanism)", () => {
    const result = solve(PORTAL_OPPOSITE);
    expect(result.refusedThenEnteredTiles).toBeGreaterThan(0);
    expect(result.refusedThenEnteredTileList).toContain("2,0");
  });

  it("is 0 on 150 seeded M0 boards and 60 seeded M1 doors-only boards", () => {
    for (let seed = 1; seed <= 150; seed += 1) {
      expect(solve(randomM0Level(seed)).refusedThenEnteredTiles, `M0 seed ${seed}`).toBe(0);
    }
    for (let seed = 1; seed <= 60; seed += 1) {
      expect(solve(randomM1Level(seed)).refusedThenEnteredTiles, `M1 seed ${seed}`).toBe(0);
    }
  });
});

describe("same-colour portal pairs — inert by law and rejected by the validator", () => {
  it("produces no dual-phase tile, no refusal decision, and fails validation", () => {
    const result = solve(PORTAL_SAME_COLOUR);
    expect(result.dualPhaseTiles).toBe(0);
    expect(result.refusedThenEnteredTiles).toBe(0);

    const verdict = validateLevel(PORTAL_SAME_COLOUR as unknown);
    expect(verdict.ok, "ADR-0009 decision 5: a same-colour pair must be rejected").toBe(false);
    expect(verdict.errors.join("\n")).toMatch(/same \(x \+ y\) parity/);
  });

  it("the opposite-colour control passes validation (no friendly fire)", () => {
    expect(validateLevel(PORTAL_OPPOSITE as unknown).ok).toBe(true);
  });
});

describe("metric plumbing — `solve` is `analyse ∘ explore`", () => {
  it("reports the same numbers whether it runs the combined call or the split calls", () => {
    const combined = solve(LATCH);
    const split = analyse(LATCH, explore(LATCH));
    expect(split).toEqual(combined);
  });
});