/**
 * L6–L15 unlock evidence — the playable slice, the `?level=` deep link, the
 * progression through the door/switch content and the R-T6 hover gate.
 *
 * L11 (R-003) is the first unlocked board that carries a **portal**; R-003b then
 * registered ADR-design-0003's L12–L15 block (`docs/ai-native-pipeline.md` §8.10:
 * `par == shortestSolution` 15/15, validator 15/15 ok · 0 errors), so the portal
 * assertions below are no longer "no shipped level has one" and the unlock sweep
 * covers the whole shipped slice. The registry pin re-typed here is **15** — the
 * L12–L15 block's own dossier value — and everything that can derive from the
 * loaded registry does (see `UNLOCKED_IDS` / `LEVEL_IDS`). The board files
 * themselves are data owned by Level AI + Solver and are never edited from here.
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
import { step } from "@/core/state/move";
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

/** Every registry id, in play order — the derived deep-link/deep-sweep domain. */
const LEVEL_IDS = levels.map((level) => level.id);

/** Registry ids from the L6 unlock on: the M3 door/switch slice and its block. */
const UNLOCKED_IDS = LEVEL_IDS.filter((id) => id >= 6);

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

describe("level registry — L6–L15 are unlocked", () => {
  it("lists the whole authored slice, in order", () => {
    // The registry's file list is the deliberately hand-typed pin (a silent
    // `LEVEL_SOURCES` edit must fail here, not self-derive green): re-typed to the
    // 15-level dataset of `docs/ai-native-pipeline.md` §8.10 (LV-009-B), whose
    // registry unlock is R-003b / ADR-design-0003 §8 item 6.
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
      "l011.json",
      "l012.json",
      "l013.json",
      "l014.json",
      "l015.json",
    ]);
  });

  it("accepts every file: ids 1..15, nothing rejected, nothing dropped", () => {
    expect(rejected).toEqual([]);
    expect(levels.map((level) => level.id)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    );
  });

  it("carries the M3 content from L6 on and a portal on every level from L11 on", () => {
    for (const level of levels) {
      if (level.id < 6) {
        expect(level.doors, `level ${String(level.id)}`).toEqual([]);
        expect(level.switches, `level ${String(level.id)}`).toEqual([]);
      } else {
        expect(level.doors.length, `level ${String(level.id)}`).toBeGreaterThan(0);
        expect(level.switches.length, `level ${String(level.id)}`).toBeGreaterThan(0);
      }
      // R-003: L11 is the M2 debut; R-003b's block follows ADR-design-0003 §8
      // (L12 the portal shortcut, L13–L15 the channel-mandatory tail), so every
      // level from the debut on ships a pair. L1–L10 stay portal-free.
      if (level.id < 11) {
        expect(level.portals, `level ${String(level.id)}`).toEqual([]);
      } else {
        expect(level.portals.length, `level ${String(level.id)}`).toBeGreaterThan(0);
      }
    }
    const l11 = levels.find((level) => level.id === 11);
    expect(l11?.portals).toHaveLength(1);
    expect(l11?.portals[0]?.pair).toEqual([
      [2, 1],
      [4, 0],
    ]);
    expect(l11?.portals[0]?.activePhase).toBe("B");
    expect(l11?.par).toBe(4);
  });
});

describe("?level=<n> deep link — resolves by Level.id for the new levels", () => {
  it("maps every registry id to its own index, so the link never shifts by one", () => {
    for (const id of LEVEL_IDS) {
      expect(startIndexForLevel(levels, id), `?level=${String(id)}`).toBe(id - 1);
    }
  });

  it("falls back to L1 for absent / unknown / out-of-range values", () => {
    expect(startIndexForLevel(levels, null)).toBe(0);
    // The ladder now runs through L15 (R-003b), so the honest out-of-range probe
    // is the id just past its last rung — "unknown id ⇒ index 0" is the meaning.
    const beyond = Math.max(...LEVEL_IDS) + 1;
    expect(startIndexForLevel(levels, beyond)).toBe(0);
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
    expect(session.levelCount).toBe(levels.length);
    // The deep link selects where the session starts; it grants nothing.
    expect(session.moveCount).toBe(0);
    expect(session.isWon).toBe(false);
    expect(session.canUndo).toBe(false);
  });

  it("starts a session on L11 for ?level=11 — the portal board is player-facing", () => {
    const session = new GameSession(levels, {
      startIndex: startIndexForLevel(levels, 11),
    });
    expect(session.level.id).toBe(11);
    expect(session.levelIndex).toBe(10);
    expect(session.levelCount).toBe(levels.length);
    expect(session.level.portals).toHaveLength(1);
    expect(session.phase).toBe("A");
    expect(session.moveCount).toBe(0);
    expect(session.isWon).toBe(false);
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

  it("'Next' from L10 now lands on L11 — the unlock extends the chain by one", () => {
    const session = new GameSession(levels, { startIndex: 9 });
    expect(session.level.id).toBe(10);

    for (const dir of shortestPath(session.level)) session.move(dir);
    expect(session.isWon).toBe(true);

    expect(session.next()).toBe(true);
    expect(session.level.id).toBe(11);
    expect(session.levelIndex).toBe(10);
    expect(session.moveCount).toBe(0);
  });

  it("'Next' is refused only after the last unlocked level", () => {
    const lastIndex = levels.length - 1;
    const session = new GameSession(levels, { startIndex: lastIndex });
    expect(session.level.id).toBe(LEVEL_IDS[lastIndex]);
    expect(session.next()).toBe(false);
    expect(session.level.id).toBe(LEVEL_IDS[lastIndex]);
  });
});

describe("L6–L15 are playable end-to-end (solver-verified routes)", () => {
  for (const id of UNLOCKED_IDS) {
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

  it("L11's par route really uses the portal: a move lands the player on the pair's exit", () => {
    // The unlock claim is not "the JSON parses" — it is "the shipped session walks
    // the M2 mechanic". The teleport is detected as a non-adjacent arrival, so the
    // assertion survives any re-authoring of the route as long as the mechanic is
    // genuinely on it (the board itself is frozen data, not this test's business).
    //
    // The *entry* tile is not observable from the session afterwards (the move
    // lands on the exit), so it is recomputed with core's own `step` from the
    // pre-move position — the same function the rules use in `validateEntry`.
    const level = levelById(11);
    const portal = level.portals[0]!;
    const pair = portal.pair.map(([x, y]) => ({ x, y }));
    const session = new GameSession(levels, { startIndex: startIndexForLevel(levels, 11) });

    const arrivals: Array<{ move: number; entry: Vec; exit: Vec; phaseBefore: string }> = [];
    for (const dir of shortestPath(level)) {
      const from = session.playerPosition;
      const phaseBefore = session.phase;
      const entry = step(from, dir);
      session.move(dir);
      const to = session.playerPosition;
      const teleported = Math.abs(to.x - entry.x) + Math.abs(to.y - entry.y) > 1;
      if (teleported) arrivals.push({ move: session.moveCount, entry, exit: to, phaseBefore });
    }

    expect(arrivals).toHaveLength(1);
    const arrival = arrivals[0]!;
    expect(pair.some((tile) => tile.x === arrival.entry.x && tile.y === arrival.entry.y)).toBe(true);
    expect(pair.some((tile) => tile.x === arrival.exit.x && tile.y === arrival.exit.y)).toBe(true);
    // Entry is resolved in the *current* phase (applyMove step 3 runs before step
    // 4's flip), i.e. the phase where `p1` is live — B.
    expect(arrival.phaseBefore).toBe(portal.activePhase);
    expect(session.isWon).toBe(true);
    expect(session.moveCount).toBe(level.par);
  });

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
    // still green) while `expect(session.isWon)` at the end passed anyway. Every
    // level here passed **for the wrong reason**, and the last third of every path
    // was never validated.
    //
    // The probe therefore runs on a **clone** — a second `GameSession` replayed to the
    // same step — so the probe may win without touching the session under test. The
    // path is then walked for real, and every step is pinned: exactly one move per step,
    // and no win before the last one.
    for (const id of UNLOCKED_IDS) {
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