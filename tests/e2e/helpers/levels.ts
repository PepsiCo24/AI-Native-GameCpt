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
 * The file list is discovered from the directory; the hand-pinned count is
 * {@link EXPECTED_LEVEL_COUNT} (the dataset's **15**-level ladder — R-002 tree →
 * R-003's L11 unlock at `f484e23` → LV-009-B's L12–L15 block, ADR-design-0003 §8),
 * which `playthrough.spec.ts` compares the discovered set against. **Every other
 * inventory is derived** (QA-005c OQ2): {@link datasetIds}, {@link doorLevelIds},
 * {@link discoveredFileIds} and {@link inventoryViolation} — so an unlock costs one
 * pin, not three, while a dataset change still raises the alarm.
 * See `tests/e2e/README.md` §1.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Coord, Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import { doorAt, isClosedDoorAt, portalExit } from "@/core/rules/solid";
import { explore, forEachParRoute, solve } from "@/core/solver/bfs";
import type { ReachableGraph } from "@/core/solver/bfs";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, move, step } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { initialState, toSearchState } from "@/core/state/transitions";
import type { SearchState, Vec } from "@/core/state/types";
import { sameVec } from "@/core/state/types";

/**
 * R-002 tree + R-003 (`f484e23`): L1–L11 reached the board — L11 (M2 portal debut)
 * was the registry's last level, so L10 stopped being the dataset's end.
 * **LV-009-B re-pinned 11 → 15** when the L12–L15 block entered the dataset
 * (`src/levels/l012.json … l015.json`, ADR-design-0003 §8 item 5: the validator
 * gate went 15/15 ok · 0 errors · 28 warnings).
 *
 * **This is the one deliberately hand-typed dataset pin** (QA-005c, OQ2 ruling at
 * project-status item 58): a dataset change cannot silently re-baseline the suite.
 * Everything else about the inventory is derived — see {@link datasetIds},
 * {@link doorLevelIds} and {@link inventoryViolation}.
 *
 * ⚠ The pin names the **dataset**, and the dataset is what it is checked against.
 * The *playable* registry (`src/game/levels/level-registry.ts`) is a second,
 * independent list; R-003b registered L12–L15 (`3cd643e`) so it now ships the same
 * fifteen, and the UI-walk specs (playthrough rows for L12–L15, the L1→L15 unlock
 * chain, `?level=12..15`) resolve off it and run green. The dataset pin stays
 * independent on purpose: it is the alarm that fires when the files move, whether
 * or not the registry follows.
 */
export const EXPECTED_LEVEL_COUNT = 15;

const LEVELS_DIR = fileURLToPath(new URL("../../../src/levels/", import.meta.url));

/** A discovered level file: the name on disk and the number that name claims. */
interface DiscoveredLevelFile {
  readonly file: string;
  readonly id: number;
}

/**
 * The `lNNN.json` files in `dir`, sorted by the number their own name carries.
 *
 * One discovery path for everything below: the loader and the inventory checks
 * must never disagree about what "the dataset" is.
 */
function discoveredLevelFiles(dir: string = LEVELS_DIR): readonly DiscoveredLevelFile[] {
  return readdirSync(dir)
    .map((name) => {
      const match = /^l(\d{3})\.json$/.exec(name);
      return match === null ? null : { file: name, id: Number(match[1]) };
    })
    .filter((entry): entry is DiscoveredLevelFile => entry !== null)
    .sort((a, b) => a.id - b.id);
}

/**
 * The ids the **file names** claim (`l001.json` → 1) — a cheap fs scan, no parse.
 *
 * This is the independent anchor the parsed dataset is compared against, and the
 * mutation probe of `tests/unit/level-inventory-derivation.test.ts` points it at a
 * scratch directory. A file that is added, removed or renamed moves this list.
 */
export function discoveredFileIds(dir: string = LEVELS_DIR): readonly number[] {
  return discoveredLevelFiles(dir).map((entry) => entry.id);
}

/** `[1, 2, …, count]` — the contiguous ladder an inventory is checked against. */
export function contiguousIds(count: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

/* ────────────────── the dataset inventories (derived, QA-005c OQ2) ─────────── */

/**
 * ── Why these are functions and not typed lists (project-status item 58, OQ2) ──
 *
 * QA-005b proved that the two hand-typed inventories (`[1…10]` all levels,
 * `[6…10]` latch levels) were **arithmetically unsatisfiable** at eleven levels:
 * every level unlock needed a manual edit in two spec files, while the README
 * pretended "adding a level needs no test edit". The ruling: the inventories
 * **derive** from the discovered dataset; exactly **one** independent hand-typed
 * pin stays — {@link EXPECTED_LEVEL_COUNT} — so a dataset change still raises the
 * deliberate alarm instead of self-maintaining itself green.
 *
 * {@link inventoryViolation} is that alarm as data: it is what the specs assert
 * and what the mutation probe exercises against a scratch directory, so "the
 * gate fires when a level is added or removed" is itself pinned.
 */

/** The dataset's own level inventory, derived from the parsed refs — never typed. */
export function datasetIds(refs: readonly LevelRef[]): readonly number[] {
  return refs.map((ref) => ref.id);
}

/** The latch inventory — the ids of the levels that actually ship doors. */
export function doorLevelIds(refs: readonly LevelRef[]): readonly number[] {
  return refs.filter((ref) => ref.level.doors.length > 0).map((ref) => ref.id);
}

/**
 * The dataset-inventory gate: `ids` must be the contiguous `L1…L{expected}`
 * ladder. Returns the reason it is not, or `null` when the dataset is sound.
 *
 * Both directions fail: a level file added (or an id gained) makes the count
 * disagree with the pinned registry; one removed, renamed or mis-numbered makes
 * the ladder discontinuous. The specs call this; the unit probe mutates a scratch
 * copy of the real files and requires it to fire both ways.
 */
export function inventoryViolation(ids: readonly number[], expected: number): string | null {
  if (ids.length !== expected) {
    return `the discovered dataset has ${String(ids.length)} levels, the pinned registry ships ${String(expected)}`;
  }
  const ladder = contiguousIds(expected);
  const firstHole = ids.findIndex((id, index) => id !== ladder[index]);
  if (firstHole >= 0) {
    return `the dataset ladder is ${ids.join(",")}, not the contiguous L1…L${String(expected)} (first mismatch at index ${String(firstHole)})`;
  }
  return null;
}

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
 *
 * `dir` defaults to the shipped `src/levels/`; the mutation probe of
 * `tests/unit/level-inventory-derivation.test.ts` points it at a scratch copy so
 * the *real* loader — parse, validate, solve — is what the inventory gate is
 * proved against, not a stand-in.
 */
export function loadReferenceLevels(dir: string = LEVELS_DIR): readonly LevelRef[] {
  const files = discoveredLevelFiles(dir);

  const refs: LevelRef[] = [];
  for (const { file } of files) {
    const raw: unknown = JSON.parse(readFileSync(join(dir, file), "utf8"));
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

/** Manhattan distance between two tiles — the "non-adjacent arrival" measurement. */
export function manhattan(a: Vec, b: Vec): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
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

/**
 * The cheapest fixtures of each kind for a level — what the UI walk drives.
 *
 * **The refusal is welded to the chosen occupancy** (QA-006). The spec's second
 * row asserts a *discriminating pair*: the state one move before the occupancy and
 * the state the refusal was found in are the same tile in the same phase, arriving
 * in the same direction, differing only in the latch (`latch-door.spec.ts:102`).
 * Picking the cheapest of each kind **independently** is unsound on a board where
 * the two cheapest fixtures do not co-locate: on L12 both sit at depth 4 and BFS
 * node order picked `(5,1)A down` for the refusal, a different state than the
 * occupancy's pre-arrival `(4,2)A right`, so the row went red although the pair
 * exists. `scripts/latch-pair-audit.ts` measures it: L12 has **2** co-located
 * pairs under this helper's own bookkeeping and **12** under `isLegalMove` alone,
 * while L6–L11 and L13–L15 co-locate even under the independent pick.
 *
 * So the occupancy is chosen cheapest first, and the refusal is the cheapest
 * fixture that stands on the same tile in the same phase, uses the same direction,
 * and reads the refusal's door **open** in the occupancy's pre-arrival state — the
 * latch difference the spec's equality asserts. Same claim, correct pairing; no
 * assertion is weakened.
 */
export function cheapestDoorFixtures(ref: LevelRef): {
  readonly occupancy: DoorFixture | null;
  readonly refusedEntry: DoorFixture | null;
} {
  const all = doorFixtures(ref);
  const occupancy = all.find((fixture) => fixture.kind === "closed-door-occupancy") ?? null;
  if (occupancy === null) return { occupancy: null, refusedEntry: null };

  const arrival = occupancy.route[occupancy.route.length - 1] ?? null;
  const latched = resolveRoute(ref.level, occupancy.route.slice(0, -1));
  const refusedEntry =
    all.find(
      (fixture) =>
        fixture.kind === "closed-door-entry-refused" &&
        fixture.direction === arrival &&
        sameVec(fixture.player, latched.player) &&
        fixture.phase === latched.phase &&
        latched.doorsOpen[fixture.doorId] === true,
    ) ?? null;

  return { occupancy, refusedEntry };
}

/** Levels that ship at least one door — the dataset's latch levels (L6–L11). */
export function levelsWithDoors(refs: readonly LevelRef[]): readonly LevelRef[] {
  return refs.filter((ref) => ref.level.doors.length > 0);
}

/* ──────────────────────── portal fixtures (M2 crossing) ───────────────────── */

/**
 * One portal-crossing behaviour the level's **state graph** actually reaches.
 *
 * Portal crossing is phase-gated (`PortalDef.activePhase`, `docs/level-design.md`
 * §1, ADR-0008 clause 6) and entry-triggered only, so two claims have to be made
 * about the shipped board: *somewhere an entry onto a portal end really lands on
 * the far end*, and *somewhere an entry onto the same end in the other phase is
 * an ordinary step*. Both are existence claims about reachable states — found
 * with `explore()` (the solver's own BFS), never typed into a spec. The landing is
 * the core's own answer (`applyMove`), so a rules change cannot leave a stale
 * expectation behind.
 */
export interface PortalFixture {
  /** `portal-teleport` — an ACTIVE end was entered; `portal-inactive-step` — the phase gate was off. */
  readonly kind: "portal-teleport" | "portal-inactive-step";
  /** Shortest legal route from the level's start to {@link player}. */
  readonly route: readonly Direction[];
  /** The tile the press starts from. */
  readonly player: Vec;
  /** The phase the press happens in. */
  readonly phase: Phase;
  readonly direction: Direction;
  /** The clicked tile — `step(player, direction)`, i.e. the portal end that was entered. */
  readonly clicked: Vec;
  readonly portalId: string;
  /** The far end of the pair (the tile a teleport lands on). */
  readonly exit: Vec;
  /** `applyMove`'s landing tile for this press — the single truth source. */
  readonly arrival: Vec;
  /** BFS depth — used to pick the cheapest fixtures for the UI walk. */
  readonly depth: number;
}

/**
 * Every reachable portal-crossing fixture for `ref`, shallowest first.
 *
 * A fixture exists for a press whose *clicked* tile is an end of some portal —
 * the metric definition of `docs/architecture.md` §8 ("the clicked tile of a move
 * is `state.player + dirDelta`; a portal may move the player further"). The kind
 * is decided by the portal's `activePhase` against the state's phase, and the
 * arrival comes from `applyMove`, so "no fixture" means the level genuinely cannot
 * show that behaviour.
 */
export function portalFixtures(ref: LevelRef): readonly PortalFixture[] {
  if (ref.level.portals.length === 0) return [];
  const graph = explore(ref.level);
  const found: PortalFixture[] = [];

  graph.nodes.forEach((state, index) => {
    const mask = graph.legalMask[index] ?? 0;
    DIRECTIONS.forEach((direction, bit) => {
      if ((mask & (1 << bit)) === 0) return; // refused — not a crossing
      const clicked = step(state.player, direction);
      const portal = ref.level.portals.find((candidate) =>
        candidate.pair.some((end) => end[0] === clicked.x && end[1] === clicked.y),
      );
      if (portal === undefined) return;
      const active = portal.activePhase === state.phase;
      found.push({
        kind: active ? "portal-teleport" : "portal-inactive-step",
        route: routeToNode(graph, index),
        player: state.player,
        phase: state.phase,
        direction,
        clicked,
        portalId: portal.id,
        exit: portalExit(portal, clicked),
        arrival: applyMove(ref.level, state, move(direction)).player,
        depth: graph.depths[index] ?? 0,
      });
    });
  });

  found.sort((a, b) => a.depth - b.depth);
  return found;
}

/**
 * The cheapest crossing fixtures for a level — what the UI walk drives.
 *
 * `pair` is the **discriminating pair**: the same press (same start tile, same
 * direction, same clicked portal end) in two different phases, where the gate
 * alone decides between "lands on the far end" and "lands where you stepped".
 * Position cannot explain the two verdicts; only `activePhase` can.
 */
export function cheapestPortalFixtures(ref: LevelRef): {
  readonly teleport: PortalFixture | null;
  readonly inactive: PortalFixture | null;
  readonly pair: { readonly teleport: PortalFixture; readonly inactive: PortalFixture } | null;
} {
  const all = portalFixtures(ref);
  const teleport = all.find((fixture) => fixture.kind === "portal-teleport") ?? null;
  const inactive = all.find((fixture) => fixture.kind === "portal-inactive-step") ?? null;

  let pair: { teleport: PortalFixture; inactive: PortalFixture } | null = null;
  for (const candidate of all) {
    if (candidate.kind !== "portal-teleport") continue;
    const mirror = all.find(
      (other) =>
        other.kind === "portal-inactive-step" &&
        other.portalId === candidate.portalId &&
        other.direction === candidate.direction &&
        sameVec(other.clicked, candidate.clicked),
    );
    if (mirror !== undefined) {
      pair = { teleport: candidate, inactive: mirror };
      break;
    }
  }

  return { teleport, inactive, pair };
}

/** Levels that ship at least one portal — the dataset's M2 levels (L11). */
export function levelsWithPortals(refs: readonly LevelRef[]): readonly LevelRef[] {
  return refs.filter((ref) => ref.level.portals.length > 0);
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