/**
 * Reference levels for the e2e suite — **read from the shipped files and
 * resolved by the shipped rules**, never hard-coded here.
 *
 * `tests/e2e/**` is a browser-level integration surface: it must assert that the
 * *UI* agrees with the *program of record*. So every expectation in the suite
 * (the par route, the phase at each step, the player's tile, which move is
 * refused, which tile is a switch/door) is computed here with:
 *
 * - `validateLevel` + `LevelSchema` — the same gate the registry applies
 *   (ADR-0004: reject, never repair), so a broken level file fails the e2e run
 *   loudly instead of silently shifting every expectation;
 * - `solve()` — the par value is the **solver's** shortest solution, not
 *   `level.par`;
 * - `forEachParRoute()` — the par route itself, depth-first from the solver
 *   (the same walk the route-budget tests pin);
 * - `isLegalMove` / `applyMove` — the one movement truth source (AGENTS.md §3).
 *
 * ── Why the files are read from disk instead of importing the registry ───────
 * `src/game/levels/level-registry.ts` statically imports eleven `*.json` files,
 * and Node's ESM loader refuses a JSON import without an import attribute (the
 * registry is bundled by Vite, where that rule does not apply). Importing the
 * registry from a Playwright spec therefore throws
 * `needs an import attribute of "type: json"`. Reading the eleven files with
 * `node:fs` + `JSON.parse` keeps the *validation* on the production gate while
 * sidestepping a bundler-only import shape — and `tests/e2e/helpers/levels.ts`
 * is a **test** file, so this is not a second production path.
 *
 * The file list is discovered from the directory; the hand-pinned registry count
 * is {@link EXPECTED_LEVEL_COUNT} ("the registry ships 11 levels" — R-002 tree
 * plus R-003's L11 unlock at `f484e23`), which `playthrough.spec.ts` compares the
 * discovered set against.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Coord, Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import { doorAt, isClosedDoorAt } from "@/core/rules/solid";
import { explore, forEachParRoute, solve } from "@/core/solver/bfs";
import type { ReachableGraph } from "@/core/solver/bfs";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, move, step } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { initialState, toSearchState } from "@/core/state/transitions";
import type { SearchState, Vec } from "@/core/state/types";
import { sameVec } from "@/core/state/types";

/**
 * R-002 tree + R-003 (`f484e23`): L1–L11 reach the board — L11 (M2 portal debut)
 * is the registry's last level, so L10 is no longer the dataset's end (that is
 * what moved `playthrough.spec.ts` onto the "L 10 cleared" branch).
 *
 * Re-pinned 10 → 11 by QA-005b. Four Playwright failures at `f484e23` traced here;
 * this constant alone resolves the two that are *derived* from it
 * (`playthrough.spec.ts:97` — L10 is no longer last — and `:118` — the unlock
 * chain now advances L10 → L11). The other two are hand-typed dataset-inventory
 * literals that this constant cannot reach: `playthrough.spec.ts:47`
 * (`toEqual([1..10])`) and `latch-door.spec.ts:60` (`toEqual([6..10])`). See
 * `tests/e2e/README.md` §1.
 */
export const EXPECTED_LEVEL_COUNT = 11;

const LEVELS_DIR = fileURLToPath(new URL("../../../src/levels/", import.meta.url));

/** Arrow-key code per direction — the §7.4 keyboard mapping, as Playwright presses it. */
export const ARROW_KEY: Readonly<Record<Direction, string>> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

/** One-letter direction, for readable test titles and failure messages. */
export const DIRECTION_LETTER: Readonly<Record<Direction, string>> = {
  up: "U",
  down: "D",
  left: "L",
  right: "R",
};

/** One resolved step of a par route. */
export interface RouteLeg {
  readonly direction: Direction;
  readonly key: string;
  /** 1-based move count after the legal move. */
  readonly moveCount: number;
  /** The fully resolved state after the move (`applyMove`). */
  readonly state: SearchState;
  readonly player: Vec;
  readonly phase: Phase;
  /** Directions the core refused *before* this move was made. */
  readonly refused: readonly Direction[];
}

export interface LevelRef {
  readonly id: number;
  readonly level: Level;
  /** The solver's shortest solution length (the pinned par). */
  readonly par: number;
  /** The first par route in the solver's depth-first order. */
  readonly route: readonly Direction[];
  readonly legs: readonly RouteLeg[];
  /** Tiles the core refuses to enter at move 0 — the cheapest refusals to pin. */
  readonly refusedAtStart: readonly Direction[];
}

function vecOf(tile: Coord): Vec {
  return { x: tile[0], y: tile[1] };
}

/**
 * Every shipped level, validated and path-resolved.
 *
 * Throws on a rejected file (the same "reject, never repair" verdict the
 * registry logs) so the suite can never pass against a level the game would not
 * even load.
 */
export function loadReferenceLevels(): readonly LevelRef[] {
  const files = readdirSync(LEVELS_DIR)
    .filter((name) => /^l\d{3}\.json$/.test(name))
    .sort();

  const refs: LevelRef[] = [];
  for (const file of files) {
    const raw: unknown = JSON.parse(readFileSync(`${LEVELS_DIR}${file}`, "utf8"));
    const verdict = validateLevel(raw);
    if (!verdict.ok) {
      throw new Error(`[e2e] ${file} rejected by validateLevel: ${verdict.errors.join(" | ")}`);
    }
    const level: Level = LevelSchema.parse(raw);
    refs.push(buildRef(level));
  }
  refs.sort((a, b) => a.id - b.id);
  return refs;
}

function buildRef(level: Level): LevelRef {
  const solved = solve(level);
  const par = solved.shortestSolution;
  if (par === null) {
    throw new Error(`[e2e] level ${String(level.id)} is not solvable — no e2e route exists`);
  }

  // The visitor may be called many times (the walk enumerates every par route);
  // keep the first, which is the solver's depth-first first route.
  let route: Direction[] = [];
  let found = false;
  forEachParRoute(level, par, (arrivals) => {
    if (found) return;
    route = arrivals.map((arrival) => arrival.direction);
    found = true;
  });
  if (!found) {
    throw new Error(`[e2e] level ${String(level.id)} has no par route at par=${String(par)}`);
  }

  const legs: RouteLeg[] = [];
  let state: SearchState = toSearchState(initialState(level));
  const refusedAtStart = DIRECTIONS.filter((dir) => !isLegalMove(level, state, move(dir)));
  let count = 0;
  for (const direction of route) {
    const refused = DIRECTIONS.filter((dir) => !isLegalMove(level, state, move(dir)));
    state = applyMove(level, state, move(direction));
    count += 1;
    legs.push({
      direction,
      key: ARROW_KEY[direction],
      moveCount: count,
      state,
      player: state.player,
      phase: state.phase,
      refused,
    });
  }

  return { id: level.id, level, par, route, legs, refusedAtStart };
}

/** `?level=<n>` — the dev / playtest / e2e entrance (`src/game/env.ts`). */
export function levelUrl(id: number | "out-of-range"): string {
  return id === "out-of-range" ? "/?level=99" : `/?level=${String(id)}`;
}

export function refOf(refs: readonly LevelRef[], id: number): LevelRef {
  const found = refs.find((ref) => ref.id === id);
  if (!found) throw new Error(`[e2e] no reference level with id ${String(id)}`);
  return found;
}

/** `true` when the resolved state stands on the goal tile. */
export function isOnGoal(level: Level, state: SearchState): boolean {
  return state.player.x === level.goal[0] && state.player.y === level.goal[1];
}

/** Tile membership helper, for "the switch is at this tile" style assertions. */
export function tileIs(tile: Coord, at: Vec): boolean {
  return tile[0] === at.x && tile[1] === at.y;
}

/** `[x, y]` → `Vec` — shared with the helpers that need a level coordinate. */
export { vecOf };

/* ────────────────────── door fixtures (latch / occupancy) ──────────────────── */

/**
 * One door behaviour the level's **state graph** actually reaches — found, not
 * written down.
 *
 * The two door rules this suite pins are both *existence* claims ("somewhere the
 * player legally stands on a closed door"; "somewhere a closed door refuses
 * entry"), and `docs/level-design.md`/ADR-0008 clause 3 make them reachable
 * states, not authored tiles. So the fixtures come out of `explore()` — the
 * solver's own BFS over `SearchState` — which means a level edit that removes the
 * behaviour fails the e2e run instead of leaving a stale hard-coded route behind.
 */
export interface DoorFixture {
  /** R-D7 occupancy (stand on a closed door) vs. R-D1 blocking (entry refused). */
  readonly kind: "closed-door-occupancy" | "closed-door-entry-refused";
  /** Shortest legal route from the level's start to {@link player}. */
  readonly route: readonly Direction[];
  /** The state the fixture was found in, i.e. the state *before* the refused move. */
  readonly player: Vec;
  readonly phase: Phase;
  readonly doorId: string;
  /** The door tile: the tile stood on, or the tile the refused move would enter. */
  readonly doorTile: Vec;
  /** `closed-door-entry-refused` only: the direction the rules refuse. */
  readonly direction: Direction | null;
  /** BFS depth — used to pick the cheapest fixtures for the UI walk. */
  readonly depth: number;
}

/** Shortest legal move sequence from the start to node `index` (parent pointers). */
function routeToNode(graph: ReachableGraph, index: number): readonly Direction[] {
  const reversed: Direction[] = [];
  let cursor = index;
  // Bounded by the tree depth; a malformed graph would otherwise spin forever.
  for (let guard = 0; guard <= graph.nodes.length; guard += 1) {
    const parent = graph.parentIndex[cursor];
    const direction = graph.parentDirection[cursor];
    if (parent === undefined || parent < 0 || direction === null || direction === undefined) break;
    reversed.push(direction);
    cursor = parent;
  }
  return reversed.reverse();
}

/**
 * Every reachable door fixture for `ref`, shallowest first.
 *
 * Both kinds are searched over the **whole reachable set** (`explore` expands
 * goal states like any other node), so "no fixture" means "the level cannot show
 * this behaviour", which is exactly the assertion the spec wants to make.
 */
export function doorFixtures(ref: LevelRef): readonly DoorFixture[] {
  if (ref.level.doors.length === 0) return [];
  const graph = explore(ref.level);
  const goal: Vec = { x: ref.level.goal[0], y: ref.level.goal[1] };
  const found: DoorFixture[] = [];

  graph.nodes.forEach((state, index) => {
    const depth = graph.depths[index] ?? 0;
    const depthOf = (): number => depth;

    // (1) R-D7 occupancy — the player stands on a door that is closed right now.
    // Goal nodes are excluded: those are the win latch, not a walkable fixture.
    if (!sameVec(state.player, goal) && isClosedDoorAt(ref.level, state.doorsOpen, state.player)) {
      const door = doorAt(ref.level, state.player);
      if (door !== undefined) {
        found.push({
          kind: "closed-door-occupancy",
          route: routeToNode(graph, index),
          player: state.player,
          phase: state.phase,
          doorId: door.id,
          doorTile: state.player,
          direction: null,
          depth: depthOf(),
        });
      }
    }

    // (2) R-D1 blocking — a move onto a currently-closed door tile is refused.
    const mask = graph.legalMask[index] ?? 0;
    DIRECTIONS.forEach((direction, bit) => {
      const destination = step(state.player, direction);
      const door = doorAt(ref.level, destination);
      if (door === undefined) return;
      if (state.doorsOpen[door.id] === true) return;
      if ((mask & (1 << bit)) !== 0) return;
      if (sameVec(destination, goal)) return;
      found.push({
        kind: "closed-door-entry-refused",
        route: routeToNode(graph, index),
        player: state.player,
        phase: state.phase,
        doorId: door.id,
        doorTile: destination,
        direction,
        depth: depthOf(),
      });
    });
  });

  found.sort((a, b) => a.depth - b.depth);
  return found;
}

/** The cheapest fixtures of each kind for a level — what the UI walk drives. */
export function cheapestDoorFixtures(ref: LevelRef): {
  readonly occupancy: DoorFixture | null;
  readonly refusedEntry: DoorFixture | null;
} {
  const all = doorFixtures(ref);
  const first = (kind: DoorFixture["kind"]): DoorFixture | null =>
    all.find((fixture) => fixture.kind === kind) ?? null;
  return { occupancy: first("closed-door-occupancy"), refusedEntry: first("closed-door-entry-refused") };
}

/** Levels that ship at least one door — the dataset's latch levels (L6–L11). */
export function levelsWithDoors(refs: readonly LevelRef[]): readonly LevelRef[] {
  return refs.filter((ref) => ref.level.doors.length > 0);
}

/**
 * Resolve a legal route through the core, move by move (`applyMove`, the single
 * truth source). Used where a spec needs the *state* a searched route arrives in
 * (door openness, switch latch) rather than just the tiles it passes through.
 */
export function resolveRoute(level: Level, route: readonly Direction[]): SearchState {
  let state: SearchState = toSearchState(initialState(level));
  for (const direction of route) state = applyMove(level, state, move(direction));
  return state;
}