/**
 * R-004 / ADR-architecture-0003 ruling 4 — **`isPlayerEmbedded` is rule semantics,
 * so its home is `src/core/rules`, reached through the single `solidAt` truth.**
 *
 * The finding this closes (RV-005 n-6, project-status item 31): the predicate lived
 * in the **renderer** (`src/game/renderer/cell-state.ts`) and was imported by
 * **gameplay** (`src/game/systems/session.ts`) — a `systems → renderer` edge, the
 * reverse of the §4 direction — and it re-derived the answer as
 * `isWallSolidAt(...) || isClosedDoorAt(...)`, a second solidity truth beside the
 * core's own (`solidAt`), which the solver already used at its arrival record
 * (`bfs.ts`).
 *
 * What is pinned here, in the repo's own terms:
 *
 * 1. **One truth, not two.** On every state the shipped levels can reach,
 *    `isPlayerEmbedded(level, gs)` equals `solidAt(level, gs.phase,
 *    gs.levelState.doorsOpen, gs.playerPosition)` — and the sweep is **not
 *    vacuous**: it counts the embedded states it saw and requires the shipped
 *    ladder to contain some (the L4/L5 phantom walk is the player *standing inside
 *    a wall that just closed around them*; if that stops existing, this file says so
 *    instead of passing on an empty set).
 * 2. **The clause-3 semantics** (ADR-0008): standing inside a now-solid tile is a
 *    legal, stable state, the state is reached by the ordinary entry rule, and a
 *    **refused** move leaves the verdict untouched (refusal is identity).
 * 3. **The seam stays where the ADR put it.** The renderer receives the verdict as
 *    an *input* (`wallRenderState(..., playerEmbedded)`) — this file feeds it the
 *    core predicate and gets the R-C13 "occupied" paint state back.
 * 4. **The layer home, statically.** `src/game/systems/**` contains no
 *    `@/game/renderer` import; `cell-state.ts` no longer exports the predicate;
 *    `src/core/rules/solid.ts` implements it via `solidAt` (the ADR's own
 *    acceptance list). `src/core/**` staying Phaser-free is already gated by
 *    `import-boundary.test.ts` and is deliberately not restated here.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, sep } from "node:path";

import type { Level } from "@/core/level";
import { isPlayerEmbedded, solidAt } from "@/core/rules/solid";
import { explore, movePath } from "@/core/solver/bfs";
import type { ReachableGraph } from "@/core/solver/bfs";
import { move } from "@/core/state/move";
import type { Direction } from "@/core/state/move";
import { applyMoveToGameState, initialState, isGoal } from "@/core/state/transitions";
import type { GameState, SearchState } from "@/core/state/types";
import { LEVEL_SOURCES, loadLevels } from "@/game/levels/level-registry";
import { wallRenderState } from "@/game/renderer/cell-state";
import { GameSession } from "@/game/systems/session";
import {
  EXPECTED_LEVEL_COUNT,
  contiguousIds,
  discoveredFileIds,
} from "../e2e/helpers/levels";
import { door, makeLevel } from "../helpers/fixtures";

const { levels, rejected } = loadLevels();
const SRC_DIR = fileURLToPath(new URL("../../src/", import.meta.url));

/** The four fields the predicate reads — the only projection this file makes. */
function gameStateOf(level: Level, node: SearchState): GameState {
  return {
    levelId: level.id,
    playerPosition: node.player,
    phase: node.phase,
    levelState: { doorsOpen: node.doorsOpen, switchesOn: node.switchesOn },
    objects: { walls: [], portals: [] },
    moveCount: 0,
    history: [],
    status: "playing",
  };
}

/** The production solver's shortest route — no test-local search (AGENTS.md §3). */
function shortestPath(level: Level): readonly Direction[] {
  const graph = explore(level);
  const index = graph.nodes.findIndex((node) => isGoal(level, node));
  if (index < 0) throw new Error(`level ${String(level.id)} is unsolvable`);
  return movePath(graph, index);
}

function graphOf(level: Level): ReachableGraph {
  return explore(level);
}

/* ────────────────────────────────────────────────────────────────────────────
 * 1 — one truth: the predicate IS `solidAt` on the player's own tile
 * ──────────────────────────────────────────────────────────────────────────── */

describe("isPlayerEmbedded — core owns it via solidAt (R-004)", () => {
  it("the registry is the shipped dataset (the sweep below is over real content)", () => {
    expect(rejected).toEqual([]);
    // The registry pin is the dataset census (QA-011, derivation-first): the count is
    // the shared `EXPECTED_LEVEL_COUNT` (the one hand-typed count in `tests/**`), the
    // fs scan must agree with it, and the id ladder is a rule over the registry's own
    // rows — contiguous `1 … count`. The typed `15` + `[1…15]` pair this used to hold
    // was a second hand-typed count beside the dataset pin, and R-003c's L16–L20
    // registration is what exposed it.
    expect(LEVEL_SOURCES).toHaveLength(levels.length);
    expect(levels.length).toBe(EXPECTED_LEVEL_COUNT);
    expect(discoveredFileIds().length).toBe(EXPECTED_LEVEL_COUNT);
    expect(levels.map((level) => level.id)).toEqual(contiguousIds(EXPECTED_LEVEL_COUNT));
  });

  it("agrees with solidAt at every state of every shipped par route", () => {
    let compared = 0;
    for (const level of levels) {
      let gs = initialState(level);
      for (const dir of shortestPath(level)) {
        const next = applyMoveToGameState(level, gs, move(dir));
        expect(next, `L${String(level.id)}: the par route must be legal`).not.toBe(gs);
        gs = next;
        compared += 1;
        expect(
          isPlayerEmbedded(level, gs),
          `L${String(level.id)} at move ${String(gs.moveCount)}`,
        ).toBe(solidAt(level, gs.phase, gs.levelState.doorsOpen, gs.playerPosition));
      }
    }
    expect(compared, "the sweep walked real moves").toBeGreaterThan(0);
  });

  it("agrees with solidAt on EVERY reachable state of the shipped ladder, and the sweep is non-vacuous", () => {
    let states = 0;
    let embedded = 0;
    const levelsWithEmbeddedStates: number[] = [];

    for (const level of levels) {
      const graph = graphOf(level);
      let levelEmbedded = 0;
      for (const node of graph.nodes) {
        const gs = gameStateOf(level, node);
        const verdict = isPlayerEmbedded(level, gs);
        expect(verdict, `L${String(level.id)} @ ${JSON.stringify(node.player)}`).toBe(
          solidAt(level, node.phase, node.doorsOpen, node.player),
        );
        states += 1;
        if (verdict) levelEmbedded += 1;
      }
      if (levelEmbedded > 0) levelsWithEmbeddedStates.push(level.id);
      embedded += levelEmbedded;
    }

    expect(states).toBeGreaterThan(100);
    // Non-vacuity: the phantom walk is shipped content — a player legally standing
    // inside a tile that is solid in the current phase, on at least one level.
    expect(embedded, "the shipped ladder contains embedded states").toBeGreaterThan(0);
    expect(levelsWithEmbeddedStates.length).toBeGreaterThan(0);
    // The beat is L4/L5's lesson (docs/level-design.md §2; ADR-0009 lesson (b): the
    // embedded state must read as "safe — walk out"). Measured on this tree: 48
    // embedded states over 690 reachable ones, on L4–L15 (the sweep grew
    // 257/11 on L4–L10 → 339/13 on L4–L11 → 690/48 once R-003b registered the
    // L12–L15 block, whose every board carries a switch-driven door). A
    // re-authoring that deletes the beat from L4/L5 has to change this line deliberately.
    expect(levelsWithEmbeddedStates).toEqual(expect.arrayContaining([4, 5]));
    // The block growth is itself evidence the sweep is not vacuous on the new boards.
    expect(levelsWithEmbeddedStates).toContain(11);
    expect(levelsWithEmbeddedStates).toEqual(expect.arrayContaining([12, 13, 14, 15]));
  });

  it("is false for a tile the player is not standing on, whatever that tile is", () => {
    // The predicate answers for the player's tile only — the renderer asks per tile
    // (`doorIsOccupiedNow`) and composes the two itself.
    const level = makeLevel({
      startPhase: "B",
      player: [1, 1],
      goal: [4, 4],
      phaseAWalls: [[2, 1]],
      phaseBWalls: [[1, 2]],
      doors: [door("d1", "red", [[3, 3]])],
    });
    const start = initialState(level);
    expect(isPlayerEmbedded(level, start)).toBe(false); // the player's own tile is empty
    const onWall = applyMoveToGameState(level, start, move("right"));
    expect(onWall.playerPosition).toEqual({ x: 2, y: 1 }); // inside the A wall, phase A
    expect(isPlayerEmbedded(level, onWall)).toBe(true);
    expect(isPlayerEmbedded(level, start)).toBe(false); // unchanged: still not on a solid tile
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2 — ADR-0008 clause 3 semantics
 * ──────────────────────────────────────────────────────────────────────────── */

describe("embedded = legal and stable (ADR-0008 clause 3)", () => {
  /** The phantom walk: enter a wall as a ghost, then the flip solidifies it underfoot. */
  const phantom = makeLevel({
    startPhase: "B",
    player: [1, 1],
    goal: [4, 4],
    phaseAWalls: [[2, 1]],
  });

  it("the flip that solidifies the tile under the player does not crush or move them", () => {
    const before = initialState(phantom);
    expect(before.phase).toBe("B");
    expect(isPlayerEmbedded(phantom, before)).toBe(false);
    const after = applyMoveToGameState(phantom, before, move("right"));
    expect(after.phase).toBe("A");
    expect(after.playerPosition).toEqual({ x: 2, y: 1 }); // exactly where they walked
    expect(isPlayerEmbedded(phantom, after)).toBe(true);
  });

  it("a player standing on a ghost (the other phase's wall) is not embedded", () => {
    const start = initialState(phantom);
    // (2,1) carries phase-**A** walls; in phase B the tile is hollow and passable.
    expect(solidAt(phantom, "B", start.levelState.doorsOpen, { x: 2, y: 1 })).toBe(false);
    expect(
      isPlayerEmbedded(phantom, { ...start, playerPosition: { x: 2, y: 1 } }),
    ).toBe(false);
  });

  it("a closed door under the player is embedded — doors share wall semantics (clause 5)", () => {
    const level = makeLevel({
      startPhase: "B",
      player: [0, 1],
      goal: [4, 4],
      doors: [door("d1", "blue", [[1, 1]])],
    });
    const start = initialState(level);
    expect(isPlayerEmbedded(level, start)).toBe(false);
    const onDoor = applyMoveToGameState(level, start, move("right")); // flips to A
    expect(onDoor.phase).toBe("A");
    expect(onDoor.playerPosition).toEqual({ x: 1, y: 1 });
    expect(onDoor.levelState.doorsOpen["d1"]).toBe(false); // blue closes in A
    expect(isPlayerEmbedded(level, onDoor)).toBe(true);
  });

  it("every outward step is judged by the ordinary entry rule: the embedded player can always leave", () => {
    const start = initialState(phantom);
    const embedded = applyMoveToGameState(phantom, start, move("right"));
    expect(isPlayerEmbedded(phantom, embedded)).toBe(true);
    const out = applyMoveToGameState(phantom, embedded, move("right"));
    expect(out).not.toBe(embedded); // not refused: being embedded is not a trap
    expect(out.playerPosition).toEqual({ x: 3, y: 1 });
    expect(isPlayerEmbedded(phantom, out)).toBe(false);
  });

  it("a refused move is identity: the embedded verdict cannot change on an illegal press", () => {
    // The player stands embedded on (0,1); `left` leaves the board, so the core
    // refuses it — and refusal is identity, so neither the tile nor the verdict moves.
    const level = makeLevel({
      startPhase: "B",
      player: [0, 0],
      goal: [4, 4],
      phaseAWalls: [[0, 1]],
    });
    const session = new GameSession([level]);
    const entered = session.move("down"); // → (0,1), phase A: the tile solidifies underfoot
    expect(entered).toBe("moved");
    expect(session.playerEmbedded).toBe(true);
    const tileBefore = session.playerPosition;
    const movesBefore = session.moveCount;

    expect(session.move("left")).toBe("illegal");
    expect(session.playerPosition).toEqual(tileBefore); // no movement
    expect(session.phase).toBe("A"); // no phase flip
    expect(session.moveCount).toBe(movesBefore);
    expect(session.playerEmbedded).toBe(true); // and the verdict is untouched
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3 — the renderer seam: the verdict is an INPUT, not the renderer's question
 * ──────────────────────────────────────────────────────────────────────────── */

describe("the renderer maps the core verdict to paint (wallRenderState seam)", () => {
  const level = makeLevel({
    startPhase: "B",
    player: [1, 1],
    goal: [4, 4],
    phaseAWalls: [[2, 1]],
    phaseBWalls: [[3, 1]],
  });

  it("the player's own tile paints `occupied`, fed the core predicate's verdict", () => {
    const start = initialState(level);
    const embedded = applyMoveToGameState(level, start, move("right")); // → (2,1), phase A
    const tile = embedded.playerPosition;
    expect(isPlayerEmbedded(level, embedded)).toBe(true);
    expect(wallRenderState(level, embedded, tile, isPlayerEmbedded(level, embedded))).toBe(
      "occupied",
    );
  });

  it("a solid wall the player is not on paints `solid`; the other phase's wall paints `ghost`", () => {
    const start = initialState(level); // phase B, player (1,1)
    expect(wallRenderState(level, start, { x: 3, y: 1 }, isPlayerEmbedded(level, start))).toBe(
      "solid",
    );
    expect(wallRenderState(level, start, { x: 2, y: 1 }, isPlayerEmbedded(level, start))).toBe(
      "ghost",
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 4 — the layer home, statically (ADR ruling 4, engineering micro-ticket 6)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Module specifiers in a source text — **every form a dodge could take**:
 * `from "…"` (static import/export), `import("…")` (dynamic), `import "…"`
 * (bare side-effect) and `require("…")` (CJS escape hatch).
 *
 * RV-007 (QA-005c) caught the gap: the reader only knew `from` and the dynamic
 * form, so a boundary violation written as `import "@/game/renderer/…";` — which
 * is the idiomatic way to import a module for its side effects — would not have
 * been seen at all. The scan's value is exactly as good as the pattern list here.
 */
function specifiers(text: string): string[] {
  const patterns = [
    /\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const out: string[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[1] !== undefined) out.push(match[1]);
    }
  }
  return out;
}

/**
 * Every `.ts` file under `src/<relativeDir>`, **recursively**.
 *
 * RV-007 (QA-005c): the previous one-level `readdirSync` + `endsWith(".ts")` walk
 * stopped covering a layer the moment it grew a subdirectory
 * (`src/game/systems/foo/bar.ts` was invisible), so a boundary test whose coverage
 * quietly depends on the filesystem's depth could go green with a hole in it.
 * Declaration files aren't implementation text and hidden entries are skipped.
 */
function tsFilesIn(relativeDir: string): string[] {
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(path));
      else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")) out.push(path);
    }
    return out;
  };
  return walk(join(SRC_DIR, relativeDir)).sort();
}

describe("layer homes (ADR-architecture-0003 ruling 4)", () => {
  it("`src/game/systems/**` has no import that reaches `src/game/renderer/**`", () => {
    const files = tsFilesIn("game/systems");
    expect(files.length, "the gameplay layer was actually scanned").toBeGreaterThan(0);
    const violations: string[] = [];
    for (const file of files) {
      for (const specifier of specifiers(readFileSync(file, "utf8"))) {
        if (specifier.includes("renderer")) violations.push(`${file} → ${specifier}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("the boundary scan is recursive and knows every import form (non-vacuous)", () => {
    // (a) Depth: `src/game/renderer/objects/` exists, so a one-level walk — the
    //     version RV-007 flagged — provably could not have produced this path.
    const renderer = tsFilesIn("game/renderer");
    expect(renderer.length, "the renderer layer was actually scanned").toBeGreaterThan(0);
    expect(
      renderer.some((file) => file.includes(`${sep}objects${sep}`)),
      "the walk reaches nested subdirectories",
    ).toBe(true);

    // (b) Form: each pattern the scanner promises to read, exercised with the very
    //     specifier shape a boundary violation would use.
    const dodge = "@/game/renderer/objects/actor";
    for (const sample of [
      `import x from "${dodge}";`,
      `export * from "${dodge}";`,
      `const x = await import("${dodge}");`,
      `import "${dodge}";`,
      `const x = require("${dodge}");`,
    ]) {
      expect(specifiers(sample), `the scanner reads: ${sample}`).toContain(dodge);
    }
  });

  it("`cell-state.ts` no longer defines the predicate; core does, via `solidAt`", () => {
    const cellState = readFileSync(join(SRC_DIR, "game/renderer/cell-state.ts"), "utf8");
    expect(cellState).not.toContain("export function isPlayerEmbedded");
    // The renderer keeps the flag-injection seam the ruling leaves it.
    expect(cellState).toContain("export function wallRenderState");

    const solid = readFileSync(join(SRC_DIR, "core/rules/solid.ts"), "utf8");
    expect(solid).toContain("export function isPlayerEmbedded");
    expect(solid, "implemented via the one solidity truth, never beside it").toContain(
      "return solidAt(level, gs.phase, gs.levelState.doorsOpen, gs.playerPosition);",
    );
  });

  it("gameplay and the solver agree on the same player position (one truth, two readers)", () => {
    // The solver's arrival record uses `solidAt` on the post-move state; the game's
    // session reports `playerEmbedded` through the same function. Same input, same
    // verdict — this is the statement RV-005 n-6 wanted.
    const level = levels[0] as Level;
    const session = new GameSession(levels);
    for (const dir of shortestPath(level)) {
      session.move(dir);
      const gs = session.state;
      expect(session.playerEmbedded).toBe(
        solidAt(level, gs.phase, gs.levelState.doorsOpen, gs.playerPosition),
      );
    }
  });
});