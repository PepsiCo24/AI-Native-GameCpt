/**
 * L6–L10 unlock evidence — the playable slice, the `?level=` deep link, the
 * L5 → L6 progression and the R-T6 hover gate over the new door/switch content.
 *
 * Everything here goes through the **shipped** path: `loadLevels()` (schema +
 * `validateLevel`), `startIndexForLevel` (`src/main.ts`'s deep-link resolution),
 * `GameSession` (the only owner of `GameState`) and the production solver
 * (`explore` + `movePath` — the program of record, never a test-local search).
 * The shortest route is therefore the solver's route, with par as the expected
 * move count.
 *
 * `level-scene.ts` itself is deliberately NOT imported: it holds runtime Phaser
 * objects and this suite runs in the `node` environment. Its hover rule is
 * `adjacentDirection(player, cell) !== null && session.movePreview(dir)`; the two
 * halves of that expression are imported from their real modules below (`phaser` is
 * mocked to a stub object because `input-map.ts` only *uses* Phaser inside
 * `attachInput`, never at module scope).
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({ default: {} }));

import type { Level } from "@/core/level";
import { explore, movePath } from "@/core/solver/bfs";
import { isGoal } from "@/core/state/transitions";
import type { Direction } from "@/core/state/move";
import type { Vec } from "@/core/state/types";
import { doorIsOpenNow } from "@/game/renderer/cell-state";
import { adjacentDirection } from "@/game/input/input-map";
import {
  LEVEL_SOURCES,
  loadLevels,
  startIndexForLevel,
} from "@/game/levels/level-registry";
import { GameSession } from "@/game/systems/session";

const { levels, rejected } = loadLevels();

function levelById(id: number): Level {
  const level = levels.find((candidate) => candidate.id === id);
  if (level === undefined) throw new Error(`level ${String(id)} is not playable`);
  return level;
}

/** The production solver's shortest route — no test-local search (AGENTS.md §3). */
function shortestPath(level: Level): readonly Direction[] {
  const graph = explore(level);
  const index = graph.nodes.findIndex((node) => isGoal(level, node));
  if (index < 0) throw new Error(`level ${String(level.id)} is unsolvable`);
  return movePath(graph, index);
}

/** Mirror of `LevelScene.setHover`'s gate — both halves are the shipped functions. */
function hoverCell(session: GameSession, cell: Vec): Vec | null {
  const dir = adjacentDirection(session.playerPosition, cell);
  return dir !== null && session.movePreview(dir) ? cell : null;
}

describe("level registry — L6–L10 are unlocked", () => {
  it("lists the whole authored slice, in order", () => {
    expect(LEVEL_SOURCES.map((source) => source.file)).toEqual([
      "l001.json",
      "l002.json",
      "l003.json",
      "l004.json",
      "l005.json",
      "l006.json",
      "l007.json",
      "l008.json",
      "l009.json",
      "l010.json",
    ]);
  });

  it("accepts every file: ids 1..10, nothing rejected, nothing dropped", () => {
    expect(rejected).toEqual([]);
    expect(levels.map((level) => level.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("carries the M3 content only from L6 on (doors + switches, still no portals)", () => {
    for (const level of levels) {
      if (level.id < 6) {
        expect(level.doors, `level ${String(level.id)}`).toEqual([]);
        expect(level.switches, `level ${String(level.id)}`).toEqual([]);
      } else {
        expect(level.doors.length, `level ${String(level.id)}`).toBeGreaterThan(0);
        expect(level.switches.length, `level ${String(level.id)}`).toBeGreaterThan(0);
      }
      // M2 ships at L36; no shipped level carries a portal end.
      expect(level.portals, `level ${String(level.id)}`).toEqual([]);
    }
  });
});

describe("?level=<n> deep link — resolves by Level.id for the new levels", () => {
  it("maps 6..10 to their indices and keeps L1..L5 intact", () => {
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      expect(startIndexForLevel(levels, id), `?level=${String(id)}`).toBe(id - 1);
    }
  });

  it("falls back to L1 for absent / unknown / out-of-range values", () => {
    expect(startIndexForLevel(levels, null)).toBe(0);
    expect(startIndexForLevel(levels, 11)).toBe(0);
    expect(startIndexForLevel(levels, 99)).toBe(0);
    expect(startIndexForLevel(levels, -3)).toBe(0);
    expect(startIndexForLevel(levels, 0)).toBe(0);
  });

  it("starts a session on L8 for ?level=8 — the smoke-test path", () => {
    const session = new GameSession(levels, {
      startIndex: startIndexForLevel(levels, 8),
    });
    expect(session.level.id).toBe(8);
    expect(session.levelIndex).toBe(7);
    expect(session.levelCount).toBe(10);
    // The deep link selects where the session starts; it grants nothing.
    expect(session.moveCount).toBe(0);
    expect(session.isWon).toBe(false);
    expect(session.canUndo).toBe(false);
  });
});

describe("progression — the win dialog walks L5 into L6", () => {
  it("'Next' from L5 lands on L6, which is playable", () => {
    const session = new GameSession(levels, { startIndex: 4 });
    expect(session.level.id).toBe(5);

    for (const dir of shortestPath(session.level)) session.move(dir);
    expect(session.isWon).toBe(true);

    expect(session.next()).toBe(true);
    expect(session.level.id).toBe(6);
    expect(session.levelIndex).toBe(5);
    expect(session.state.playerPosition).toEqual({ x: session.level.player[0], y: session.level.player[1] });
    expect(session.moveCount).toBe(0);
    expect(session.isWon).toBe(false);

    for (const dir of shortestPath(session.level)) session.move(dir);
    expect(session.isWon).toBe(true);
    expect(session.moveCount).toBe(session.level.par);
    expect(session.level.id).toBe(6);
  });

  it("'Next' is refused only after the last unlocked level", () => {
    const session = new GameSession(levels, { startIndex: 9 });
    expect(session.level.id).toBe(10);
    expect(session.next()).toBe(false);
    expect(session.level.id).toBe(10);
  });
});

describe("L6–L10 are playable end-to-end (solver-verified routes)", () => {
  for (const id of [6, 7, 8, 9, 10]) {
    it(`L${String(id)}: the shortest route wins in exactly \`par\` moves`, () => {
      const session = new GameSession(levels, {
        startIndex: startIndexForLevel(levels, id),
      });
      const level = levelById(id);
      const path = shortestPath(level);
      expect(path.length).toBe(level.par);

      for (const dir of path) {
        const outcome = session.move(dir);
        expect(outcome, `L${String(id)} is stuck before its goal`).not.toBe("illegal");
      }
      expect(session.isWon).toBe(true);
      expect(session.state.playerPosition).toEqual({ x: level.goal[0], y: level.goal[1] });
      expect(session.moveCount).toBe(level.par);
    });
  }

  it("a refused move inside these levels is still a no-op: no movement, no flip", () => {
    const session = new GameSession(levels, { startIndex: startIndexForLevel(levels, 10) });
    let refused = 0;
    for (const dir of ["up", "left", "down", "right"] as const) {
      const snapshot = session.state;
      if (session.move(dir) === "illegal") {
        refused += 1;
        // Identity, not equality: the core's refusal contract (`next === gs`) is
        // what makes "no flip" structural rather than a convention here.
        expect(session.state).toBe(snapshot);
      }
    }
    // L10's start is on the left edge, so at least one direction is refused.
    expect(refused).toBeGreaterThan(0);
  });
});

describe("R-D7 on the shipped door levels: a legal state inside a closed door", () => {
  for (const id of [6, 7]) {
    it(`L${String(id)} walks a step through the door and ends embedded in it`, () => {
      const level = levelById(id);
      const session = new GameSession(levels, { startIndex: startIndexForLevel(levels, id) });
      const path = shortestPath(level);

      const embedded: Array<{ move: number; tile: Vec; phase: string }> = [];
      path.forEach((dir, index) => {
        session.move(dir);
        if (session.playerEmbedded) {
          const tile = session.playerPosition;
          expect(doorIsOpenNow(level, session.state, tile), `move ${String(index + 1)}`).toBe(false);
          embedded.push({ move: index + 1, tile, phase: session.phase });
          // ADR-0008 clause 3 — the state is safe, not a trap: the tile can be left.
          const escapes = (["up", "down", "left", "right"] as const).filter((candidate) =>
            session.movePreview(candidate),
          );
          expect(escapes.length).toBeGreaterThan(0);
        }
      });

      expect(embedded.length).toBeGreaterThan(0);
      // The door is closed *because* the phase flipped after entry: the entry
      // itself was legal, which is what makes this a rendered state at all.
      expect(embedded[0]!.phase).toBe("B");
    });
  }
});

describe("R-T6 hover — the ring appears only where the core accepts the move", () => {
  it("L7: no hover on the closed blue door until the switch opens it", () => {
    const level = levelById(7);
    const session = new GameSession(levels, { startIndex: startIndexForLevel(levels, 7) });
    const doorTile: Vec = { x: 1, y: 1 };

    // Phase A, switch off ⇒ the blue door is closed now (R-D1: solid side).
    expect(session.phase).toBe("A");
    expect(doorIsOpenNow(level, session.state, doorTile)).toBe(false);
    expect(session.movePreview("right")).toBe(false);
    expect(hoverCell(session, doorTile)).toBeNull();
    // Non-adjacent cells are never hover targets either (R-T3).
    expect(hoverCell(session, { x: 2, y: 2 })).toBeNull();
    expect(hoverCell(session, { x: 0, y: 1 })).toBeNull();

    // Press the switch: up to (0,0) in A toggles d1, down returns in A with d1 open.
    expect(session.move("up")).toBe("moved");
    expect(session.move("down")).toBe("moved");
    expect(session.phase).toBe("A");
    expect(doorIsOpenNow(level, session.state, doorTile)).toBe(true);

    // The same cell is now a legal destination ⇒ the affordance appears.
    expect(session.movePreview("right")).toBe(true);
    expect(hoverCell(session, doorTile)).toEqual(doorTile);
  });

  it("the hover predicate agrees with the reducer on every step of every unlocked level", () => {
    // RV-005 m-8: this test used to probe on the LIVE session with `move()` + `undo()`.
    // `applyMoveToGameState` refuses every move once `status === "won"` and `undo()`
    // requires `status === "playing"`, so the first probe whose move happened to be the
    // winning one latched the level: every later step degenerated into
    // "movePreview is false because the session is won" (still asserted as a refusal,
    // still green) while `expect(session.isWon)` at the end passed anyway. All five
    // levels passed **for the wrong reason**, and the last third of every path was never
    // validated.
    //
    // The probe therefore runs on a **clone** — a second `GameSession` replayed to the
    // same step — so the probe may win without touching the session under test. The
    // path is then walked for real, and every step is pinned: exactly one move per step,
    // and no win before the last one.
    for (const id of [6, 7, 8, 9, 10]) {
      const level = levelById(id);
      const startIndex = startIndexForLevel(levels, id);
      const session = new GameSession(levels, { startIndex });
      const path = shortestPath(level);
      const where = (index: number): string => `level ${String(id)} step ${String(index + 1)}`;

      path.forEach((dir, index) => {
        // A clone at the same step: replay the prefix on a fresh session. (`toEqual`
        // rather than `toBe`: the point is that the replay lands on the same state, and
        // a divergence here would itself be the bug.)
        const probe = new GameSession(levels, { startIndex });
        for (const replay of path.slice(0, index)) probe.move(replay);
        expect(probe.state, where(index)).toEqual(session.state);

        for (const candidate of ["up", "down", "left", "right"] as const) {
          // `movePreview` is R-T6's question; a hover may only be granted where it
          // answers `true`, and a refusal must never move or flip anything.
          const accepted = probe.movePreview(candidate);
          const snapshot = probe.state;
          if (accepted) {
            expect(probe.move(candidate), `${where(index)} via ${candidate}`).not.toBe(
              "illegal",
            );
          } else {
            expect(probe.move(candidate), `${where(index)} via ${candidate}`).toBe("illegal");
            expect(probe.state, `${where(index)} via ${candidate}`).toBe(snapshot);
          }
        }

        // The session under test walks the path: one move per step, and it must not be
        // won before the final one — the early latch is the regression this pins.
        expect(session.isWon, `${where(index)} was already won`).toBe(false);
        expect(session.move(dir), where(index)).toBe(index === path.length - 1 ? "won" : "moved");
        expect(session.moveCount, where(index)).toBe(index + 1);
      });

      expect(session.isWon).toBe(true);
      expect(session.moveCount).toBe(path.length);
      expect(session.playerPosition).toEqual({ x: level.goal[0], y: level.goal[1] });
    }
  });

  it("the latch that made the live probe unsound is real: post-win moves refuse and undo is locked", () => {
    // The premise the clone rests on, pinned rather than assumed. A won `GameState` is
    // frozen by core (`applyMoveToGameState` returns the same reference), `undo` needs
    // `status === "playing"`, and `GameSession.canUndo` therefore goes false — which is
    // exactly why a probe that wins on the live session can never be rolled back, and
    // why the old test's remaining steps were silently skipped instead of failing.
    const session = new GameSession(levels, { startIndex: startIndexForLevel(levels, 6) });
    for (const dir of shortestPath(levelById(6))) session.move(dir);
    expect(session.isWon).toBe(true);
    expect(session.canUndo).toBe(false);
    expect(session.undo()).toBe(false);

    const frozen = session.state;
    const moves = session.moveCount;
    for (const candidate of ["up", "down", "left", "right"] as const) {
      expect(session.movePreview(candidate)).toBe(false);
      expect(session.move(candidate)).toBe("illegal");
      expect(session.state).toBe(frozen);
    }
    expect(session.moveCount).toBe(moves);
  });
});