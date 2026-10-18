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
 * `src/game/levels/level-registry.ts` statically imports every shipped `*.json`
 * file, and Node's ESM loader refuses a JSON import without an import attribute (the
 * registry is bundled by Vite, where that rule does not apply). Importing the
 * registry from a Playwright spec therefore throws
 * `needs an import attribute of "type: json"`. Reading the shipped files with
 * `node:fs` + `JSON.parse` keeps the *validation* on the production gate while
 * sidestepping a bundler-only import shape — and `tests/e2e/helpers/levels.ts`
 * is a **test** file, so this is not a second production path.
 *
 * The file list is discovered from the directory; the hand-pinned count is
 * {@link EXPECTED_LEVEL_COUNT} (the dataset's **35**-level ladder — R-002 tree →
 * R-003's L11 unlock at `f484e23` → LV-009-B's L12–L15 block, ADR-design-0003 §8 →
 * R-003c's L16–L19 registration at `208c5eb`/`a75b420` → LV-011/R-003d's L20 sealed
 * landing, registered at `4deeb50` → **R-004a's Act II batch 1** (`l021`–`l025`,
 * registered at `50e9ac0`/`178d9d8`) → **R-005a's Act II batches 2 + 3**
 * (`l026`–`l035`, graduated from the shelf by the byte-parity `git mv` of
 * `agent/level/r-005a-reg35`, `src/levels/README.md` §2g + the sidecar's
 * **35** records), which `playthrough.spec.ts`
 * compares the discovered set against. **Every other inventory is derived**
 * (QA-005c OQ2): {@link datasetIds}, {@link doorLevelIds}, {@link discoveredFileIds}
 * and {@link inventoryViolation} — so an unlock costs one pin, not three, while a
 * dataset change still raises the alarm.
 * See `tests/e2e/README.md` §1.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Coord, Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import {
  doorAt,
  inBounds,
  isClosedDoorAt,
  isWallSolidAt,
  portalExit,
} from "@/core/rules/solid";
import { analyse, explore, forEachParRoute, solve } from "@/core/solver/bfs";
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
 * **R-003c re-pinned 15 → 19** when the L16–L19 block was registered at the dataset
 * root (`src/levels/l016.json … l019.json`, `208c5eb` + the registry rows at
 * `a75b420`; `npm run levels` = 19/19 PASS, `docs/level-difficulty.report.json`
 * regenerated to 19 records).
 * **QA-014 re-pinned 19 → 20** one batch later, when GAME-002 registered LV-011's
 * sealed landing at the dataset root (`src/levels/l020.json` + registry row 20 at
 * `4deeb50`; `npm run levels` = 20/20 PASS, the sidecar regenerated to 20 records).
 * **R-004c re-pinned 20 → 25** when R-004a registered the Act II batch 1 at the
 * dataset root (`src/levels/l021.json … l025.json`, registered at `50e9ac0` and
 * published at `178d9d8`; `npm run levels` = 25/25 PASS, the sidecar regenerated to
 * 25 records).
 * The pin moves **only** with a registration commit — it is the alarm, and the
 * registration is the event the alarm is *for*.
 *
 * **This is the one deliberately hand-typed dataset pin** (QA-005c, OQ2 ruling at
 * project-status item 58; re-affirmed by QA-011): a dataset change cannot silently
 * re-baseline the suite. QA-011's migration rule was derivation-first — every other
 * count in `tests/**` now derives from this pin, from the fs scan
 * ({@link discoveredFileIds}), from the registry's own rows, or from a rule over the
 * derived ids, so the ladder has **exactly one** typed count to re-take. That single
 * count cannot be derived without deleting the alarm this file exists to raise
 * (a self-derived inventory is vacuously true after any mutation — proved by the
 * mutation probe of `tests/unit/level-inventory-derivation.test.ts`), which is why
 * it stays a literal and why it is the only one.
 *
 * ⚠ The pin names the **dataset**, and the dataset is what it is checked against.
 * The *playable* registry (`src/game/levels/level-registry.ts`) is a second,
 * independent list; R-003b registered L12–L15 (`3cd643e`), R-003c/GAME-001 the
 * L16–L19 rows (`a75b420`), GAME-002 the L20 row (`4deeb50`), **R-004b the
 * L21–L25 rows** (`agent/gameplay/r-004b-serve25`, `1f72420`, the GAME-002
 * precedent) and **R-005b the L26–L35 rows** (`agent/gameplay/r-005b-serve35`,
 * `1660f83`: registry serves 35, boot proof ids 1..35 in order). With that row
 * stacked the registry ships the same thirty-five, and the
 * UI-walk specs (playthrough rows for every level, the `L1→L35` unlock chain,
 * `?level=26..35`) resolve off it and run green. The two registry-dependent unit
 * rows and the chain spec followed R-005b's row, which is why R-005c's single
 * count re-take above is the whole migration: a *dependency* this dossier names
 * rather than a pin this file may paper over. The
 * dataset pin stays independent on purpose: it is the alarm that fires when the files
 * move, whether or not the registry follows — and that independence is exactly what
 * keeps the registry rows *measurable* instead of self-fulfilling.
 */
export const EXPECTED_LEVEL_COUNT = 35;

/**
 * The dataset directory — resolved **lazily**, at call time, so importing this
 * module never dereferences `import.meta.url` or touches the fs. `EXPECTED_LEVEL_COUNT`
 * is the one pin the fast unit suites need (one of them under **jsdom**, where
 * `import.meta.url` is not a `file:` URL and a module-level `fileURLToPath` throws
 * `The URL must be of scheme file` before a single test runs).
 */
const levelsDir = (): string =>
  fileURLToPath(new URL("../../../src/levels/", import.meta.url));

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
function discoveredLevelFiles(
  dir: string = levelsDir(),
): readonly DiscoveredLevelFile[] {
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
export function discoveredFileIds(
  dir: string = levelsDir(),
): readonly number[] {
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
export function inventoryViolation(
  ids: readonly number[],
  expected: number,
): string | null {
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
export function loadReferenceLevels(
  dir: string = levelsDir(),
): readonly LevelRef[] {
  const files = discoveredLevelFiles(dir);

  const refs: LevelRef[] = [];
  for (const { file } of files) {
    const raw: unknown = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const verdict = validateLevel(raw);
    if (!verdict.ok) {
      throw new Error(
        `[e2e] ${file} rejected by validateLevel: ${verdict.errors.join(" | ")}`,
      );
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
    throw new Error(
      `[e2e] level ${String(level.id)} is not solvable — no e2e route exists`,
    );
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
    throw new Error(
      `[e2e] level ${String(level.id)} has no par route at par=${String(par)}`,
    );
  }

  const legs: RouteLeg[] = [];
  let state: SearchState = toSearchState(initialState(level));
  const refusedAtStart = DIRECTIONS.filter(
    (dir) => !isLegalMove(level, state, move(dir)),
  );
  let count = 0;
  for (const direction of route) {
    const refused = DIRECTIONS.filter(
      (dir) => !isLegalMove(level, state, move(dir)),
    );
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
function routeToNode(
  graph: ReachableGraph,
  index: number,
): readonly Direction[] {
  const reversed: Direction[] = [];
  let cursor = index;
  // Bounded by the tree depth; a malformed graph would otherwise spin forever.
  for (let guard = 0; guard <= graph.nodes.length; guard += 1) {
    const parent = graph.parentIndex[cursor];
    const direction = graph.parentDirection[cursor];
    if (
      parent === undefined ||
      parent < 0 ||
      direction === null ||
      direction === undefined
    )
      break;
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
    if (
      !sameVec(state.player, goal) &&
      isClosedDoorAt(ref.level, state.doorsOpen, state.player)
    ) {
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
  const occupancy =
    all.find((fixture) => fixture.kind === "closed-door-occupancy") ?? null;
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

/** Levels that ship at least one door — the dataset's latch levels (L6–L35). */
export function levelsWithDoors(
  refs: readonly LevelRef[],
): readonly LevelRef[] {
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
        candidate.pair.some(
          (end) => end[0] === clicked.x && end[1] === clicked.y,
        ),
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
  readonly pair: {
    readonly teleport: PortalFixture;
    readonly inactive: PortalFixture;
  } | null;
} {
  const all = portalFixtures(ref);
  const teleport =
    all.find((fixture) => fixture.kind === "portal-teleport") ?? null;
  const inactive =
    all.find((fixture) => fixture.kind === "portal-inactive-step") ?? null;

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

/** Levels that ship at least one portal — the dataset's M2 levels (L11–L35). */
export function levelsWithPortals(
  refs: readonly LevelRef[],
): readonly LevelRef[] {
  return refs.filter((ref) => ref.level.portals.length > 0);
}

/**
 * Resolve a legal route through the core, move by move (`applyMove`, the single
 * truth source). Used where a spec needs the *state* a searched route arrives in
 * (door openness, switch latch) rather than just the tiles it passes through.
 */
export function resolveRoute(
  level: Level,
  route: readonly Direction[],
): SearchState {
  let state: SearchState = toSearchState(initialState(level));
  for (const direction of route)
    state = applyMove(level, state, move(direction));
  return state;
}

/* ──────────── the refusal *classes* (R-004d) — Act II's G-family rungs ──────── */

/**
 * **Why** a press was refused, not just *that* it was (R-004d).
 *
 * The locked rule has exactly two illegal conditions (`docs/architecture.md` §6.1,
 * `applyMove.ts:63-68`): the destination is out of bounds, or it is solid **in the
 * current phase** — and solid means *a wall active now* or *a door closed now*
 * (ADR-0008 clause 5: "doors share the wall semantics", one predicate,
 * `rules/solid.ts:155`). The classes below are that partition, named, because the
 * Act II batch (`src/levels/l021.json … l025.json`, registered by R-004a) is the
 * dataset's first **multi-pocket sealed landing** and its refusal surface is built
 * out of two different kinds of blocker — the checkerboard phase-wall column and
 * the switch-gated seal doors — which the earlier per-direction refusal rows
 * counted but never *distinguished*.
 *
 * | class | solid because | the shipped case |
 * |---|---|---|
 * | `out-of-bounds` | the destination is off the board | the board edge (L21–L25 start) |
 * | `phase-wall` | a wall is active in the current phase | the `x = 2` checkerboard column |
 * | `door-without-switch` | a door tile is closed **and every switch that targets it is OFF** | F-L20-2's class: the seal door refuses because its latch has not been pressed |
 * | `door-latch-on` | a door tile is closed while a switch targeting it is ON | a latch that closes the gate it drives (an ON switch *inverts* the colour base, `solid.ts:93`) |
 *
 * The last class is carried so the partition is **total** on the boards this suite
 * walks: every refused press is counted, and "the classes cover the surface" is an
 * assertion (`refusedPresses === Σ byClass`) rather than a hope. On the five Act II
 * rungs `door-latch-on` is measured **0** — the refusal the player meets at a seal
 * door is always the *un-pressed* latch (see `docs/ai-native-pipeline.md` §8.18's
 * `refusedThenEnteredTiles` census and §8.16's device law: the ordered plan
 * `s1 → d1 → s2 → d2 → sg → d3` means the doors are met closed first).
 */
export type RefusalClass =
  "out-of-bounds" | "phase-wall" | "door-without-switch" | "door-latch-on";

/** Every class, in census order — the partition the census sums over. */
export const REFUSAL_CLASSES: readonly RefusalClass[] = [
  "out-of-bounds",
  "phase-wall",
  "door-without-switch",
  "door-latch-on",
];

/**
 * Why `direction` is refused from `state`, or `null` when it is legal.
 *
 * Reads the shipped rules only: `isLegalMove` decides *whether*, and this function
 * only asks the same solidity predicate *why* (`isWallSolidAt` first, then the door
 * covering the tile) — a second rule path is never created, and a rules change that
 * makes a press legal cannot leave a stale class behind.
 */
export function refusalClassOf(
  level: Level,
  state: SearchState,
  direction: Direction,
): RefusalClass | null {
  if (isLegalMove(level, state, move(direction))) return null;
  const target = step(state.player, direction);
  if (!inBounds(level, target)) return "out-of-bounds";
  if (isWallSolidAt(level, state.phase, target)) return "phase-wall";
  const door = doorAt(level, target);
  // `solidAt` is wall ∨ door, so the only remaining reason is a closed door.
  if (door === undefined) return null;
  const targeting = level.switches.filter((sw) => sw.targets.includes(door.id));
  return targeting.some((sw) => state.switchesOn[sw.id] === true)
    ? "door-latch-on"
    : "door-without-switch";
}

/**
 * One refused press the level's **state graph** really reaches, with the two things
 * a UI row needs to drive it: the legal route to the state it starts from, and the
 * legal move that was *due* — so the walk can show the refusal did not disturb the
 * continuation (`refusal.spec.ts`'s own contract).
 */
export interface RefusalFixture {
  readonly kind: RefusalClass;
  /** Shortest legal route from the level's start to {@link player}. */
  readonly route: readonly Direction[];
  readonly player: Vec;
  readonly phase: Phase;
  /** The press the rules refuse. */
  readonly direction: Direction;
  /** The tile that press would enter — solid in {@link phase}. */
  readonly target: Vec;
  /** `"wall"`, or the id of the closed door that blocks the entry. */
  readonly blockedBy: string;
  readonly depth: number;
  /** The first legal press from this state (never the refused one) and where it lands. */
  readonly resume: { readonly direction: Direction; readonly arrival: Vec };
}

/**
 * Every reachable refusal on the board, classified, shallowest first.
 *
 * Found with `explore()` — the solver's own BFS — so a level edit that removes a
 * refusal, or moves it into another class, fails the run instead of leaving a typed
 * route behind; and the arrival of {@link RefusalFixture.resume} is `applyMove`'s own
 * answer, the single movement truth source (AGENTS.md §3).
 */
export function refusalFixtures(ref: LevelRef): readonly RefusalFixture[] {
  const graph = explore(ref.level);
  const found: RefusalFixture[] = [];

  graph.nodes.forEach((state, index) => {
    const mask = graph.legalMask[index] ?? 0;
    DIRECTIONS.forEach((direction, bit) => {
      if ((mask & (1 << bit)) !== 0) return;
      const kind = refusalClassOf(ref.level, state, direction);
      if (kind === null) return;
      const target = step(state.player, direction);
      const door = doorAt(ref.level, target);
      const resumeDirection = DIRECTIONS.find((candidate) =>
        isLegalMove(ref.level, state, move(candidate)),
      );
      found.push({
        kind,
        route: routeToNode(graph, index),
        player: state.player,
        phase: state.phase,
        direction,
        target,
        blockedBy: door === undefined ? "wall" : door.id,
        depth: graph.depths[index] ?? 0,
        resume:
          resumeDirection === undefined
            ? { direction, arrival: state.player }
            : {
                direction: resumeDirection,
                arrival: applyMove(ref.level, state, move(resumeDirection))
                  .player,
              },
      });
    });
  });

  found.sort((a, b) => a.depth - b.depth);
  return found;
}

/** The cheapest fixture of each class — what a UI row drives, one session each. */
export function cheapestRefusalFixtures(
  ref: LevelRef,
): Readonly<Record<RefusalClass, RefusalFixture | null>> {
  const all = refusalFixtures(ref);
  const out: Record<RefusalClass, RefusalFixture | null> = {
    "out-of-bounds": null,
    "phase-wall": null,
    "door-without-switch": null,
    "door-latch-on": null,
  };
  for (const kind of REFUSAL_CLASSES)
    out[kind] = all.find((fixture) => fixture.kind === kind) ?? null;
  return out;
}

/**
 * The board's refusal **census**: the published `refusedThenEnteredTiles` set (the
 * metric the level lane books per rung — `docs/ai-native-pipeline.md` §8.16's ladder
 * and §8.18's re-measure, `REFUSAL_CLASSES`' full tile list is pinned in
 * `tests/solver/ordered-companion.test.ts`) plus the class partition of **every**
 * refused press over the reachable set, so the two lanes cannot disagree about what
 * the refusal surface is made of.
 */
export interface RefusalCensus {
  /** Tiles whose click is refused in one reachable state and accepted in another. */
  readonly refusedThenEntered: readonly string[];
  /** Its ordered companion — equal on the Act II rungs (the `T ≡ R ≡ 0` reading). */
  readonly refusedBeforeEntered: readonly string[];
  /** Every refused press on the board, by class. */
  readonly byClass: Readonly<Record<RefusalClass, number>>;
  /** Refused presses whose clicked tile is a portal end — `0` on the Act II rungs. */
  readonly refusedAtPortalEnds: number;
  readonly refusedPresses: number;
  /** Reachable states explored (the census denominator, for messages). */
  readonly reachableStates: number;
}

export function refusalCensus(ref: LevelRef): RefusalCensus {
  const graph = explore(ref.level);
  const result = analyse(ref.level, graph);
  const byClass: Record<RefusalClass, number> = {
    "out-of-bounds": 0,
    "phase-wall": 0,
    "door-without-switch": 0,
    "door-latch-on": 0,
  };
  let refusedAtPortalEnds = 0;
  let refusedPresses = 0;

  graph.nodes.forEach((state, index) => {
    const mask = graph.legalMask[index] ?? 0;
    DIRECTIONS.forEach((direction, bit) => {
      if ((mask & (1 << bit)) !== 0) return;
      refusedPresses += 1;
      const kind = refusalClassOf(ref.level, state, direction);
      if (kind !== null) byClass[kind] += 1;
      const target = step(state.player, direction);
      const onPortalEnd = ref.level.portals.some((portal) =>
        portal.pair.some((end) => end[0] === target.x && end[1] === target.y),
      );
      if (onPortalEnd) refusedAtPortalEnds += 1;
    });
  });

  return {
    refusedThenEntered: result.refusedThenEnteredTileList,
    refusedBeforeEntered: result.refusedBeforeEnteredTileList,
    byClass,
    refusedAtPortalEnds,
    refusedPresses,
    reachableStates: result.reachableStates,
  };
}

/* ─────────────── the refusal-row CI envelope (QA-013, item 77(d)) ──────────── */

/**
 * The wall-clock ceiling for **one refusal-surface row** — a function of the
 * level's own **par**, never of its id.
 *
 * ── Why a function of par, and why not a constant ────────────────────────────
 * The row walks the whole par route and probes the canvas after every refused
 * direction, so its cost is `Σ_legs refusals(leg) × C_probe + par × C_move`:
 * measured, it grows with par and nothing else. QA-005c froze it at `90_000` for
 * every row; that is a **prediction from a smaller census**, and observation round
 * `38890893868` (develop `77a6ba6`, job `116940140379`) falsified it at the tail —
 * L18 and L19 hard-timed-out at exactly that ceiling while L15/L16/L17 passed.
 * Item 77(d) (`DERIVED ENVELOPES`, project-status item 95) says the replacement
 * must be **derived from the level**, so that L20 (par 20) is absorbed by the same
 * formula with **zero re-migration** — and so that the next growth rung is a
 * *number the formula computes*, not an edit somebody has to remember.
 *
 * ── The arithmetic (all of it measured, none of it typed from a feeling) ─────
 * Local refusal-family rows, `--retries=0`, this branch, art-era bytes (one
 * worker, `PS_E2E_PORT=5240`), and the same round's cloud rows:
 *
 * | level | par | local s | cloud s | local→cloud |
 * |---|---|---|---|---|
 * | L15 | 10 | 10.4 | 57 | 5.48 |
 * | L16 | 12 | 13.4 | 79 | **5.90** |
 * | L17 | 14 | 14.0 | 82 | 5.86 |
 * | L18 | 16 | 17.8 | ≥90 (crossed) | ≥5.06 |
 * | L19 | 18 | 19.9 | ≥90 (crossed) | ≥4.52 |
 *
 * 1. **shape** — least squares over the five local points gives
 *    `local(par) = 1.17 par − 1.28 s` with worst residual `3.0 s` (at par 10).
 *    The per-rung steps are `+3.0, +0.6, +3.8, +2.1` s, whose *second*
 *    differences `−2.4, +3.2, −1.7` **change sign**: the honest verdict is
 *    **affine in par with run-level jitter**, not convex. (The cloud curve's own
 *    `+22 s` then `+3 s` steps say the same thing: the steep rung is the small-par
 *    one, so a convex fit would be a story told against the data.)
 * 2. **cloud factor** — the max same-family factor this round is **5.90**
 *    (par 12). Taking the max, not the mean, is the conservative direction.
 * 3. **upper-bound cloud estimate** — `5.90 × (local(par) + worst residual)`,
 *    i.e. an affine envelope that is `≥` the observed cloud duration at all three
 *    rungs that *have* one (79.2 ≥ 57, 93.0 ≥ 79, 106.8 ≥ 82).
 * 4. **envelope** — `× 1.5` safety, `ceil`ed to whole seconds, floored at the
 *    `90_000` this migration replaces (no row is ever *tightened* by the
 *    migration), capped at `240_000` (the absolute cap the ticket asks for).
 *
 * | par | 10 | 12 | 14 | 16 | 18 | 20 | 22 |
 * |---|---|---|---|---|---|---|---|
 * | upper-bound cloud s | 79.2 | 93.0 | 106.8 | 120.6 | 134.4 | 148.2 | 162.0 |
 * | envelope s | 119 | 140 | 161 | 181 | 202 | 223 | 240 (cap) |
 *
 * ── QA-014: the par-20 rung ran, and the formula absorbed it with no edit ─────
 * The 20-level round (`PS_E2E_PORT=5244`, `--retries=0`, art-era bytes, 132/132
 * green, 11.1 m) is the **first browser walk of L20 ever**, and its refusal row is
 * the predicted `refusalRouteEnvelopeMs(20) = 223 s` claim tested end to end:
 *
 * | round | L15 | L16 | L17 | L18 | L19 | **L20** |
 * |---|---|---|---|---|---|---|
 * | QA-013 local (19 rows) | 10.4 | 13.4 | 14.0 | 17.8 | 19.9 | — |
 * | QA-014 local (20 rows) | 11.6 | 14.8 | 15.9 | 19.5 | 21.8 | **28.1** |
 *
 * L20 comes in at **28.1 s = 12.6 % of its 223 s envelope**, i.e. the affine fit's
 * own prediction (`1.17 × 20 − 1.28 = 22.1 s`, +3.0 residual ⇒ 25.1; worst-case
 * cloud ⇒ 148.2; ×1.5 ⇒ 223) sits *above* the observation with the designed margin.
 * That is the whole point of the derived form: the flat `90_000` this replaced would
 * have read 28.1/90 = **31 % locally** and `28.1 × 5.9 ≈ 166 s` on the conservative
 * cloud factor — **crossed**, exactly like L18/L19 did at 19 rows. So the rung that
 * the derivation was written *for* is the rung that proves it, and **no constant was
 * touched for this migration**.
 *
 * ── The cap binds from par 22 on, and R-004c's new rung is the first to bind it ──
 * The Act II batch 1 walk takes the refusal family to **par 23** (L25, registered by
 * R-004a), and par 23 is the first rung whose *uncapped* envelope exceeds the cap. So
 * it is registered here as a **named cap-binding row**, evaluated from the formula
 * above, rather than quietly clamped:
 *
 * ```
 * cloudUpperS(23, capped)   = 5.9 × (1.17 × 23 − 1.28 + 3.0)   = 5.9 × 28.63  = 168.917 s
 * uncapped envelope (23)    = ceil(1.5 × 168.917) × 1000      = ceil(253.3755) × 1000 = 254_000 ms
 * refusalRouteEnvelopeMs(23)= min(240_000, max(90_000, 254_000))                     = 240_000 ms
 * exceedance over the cap   = 254_000 − 240_000                                       = +14_000 ms (+5.8 %)
 * ```
 *
 * The **same cap already binds at par 22** (the pre-existing 20-row rung):
 * `ceil(1.5 × 5.9 × (1.17 × 22 − 1.28 + 3.0)) = ceil(1.5 × 162.014) = ceil(243.021) = 244_000 ms`
 * — also above the cap (by +4 s), so that rung also reads 240 s and needed **no**
 * re-migration for this batch. Both rungs therefore hold 240 s, and **no number in the
 * table above was changed** by the migration: this is the named re-derivation the cap
 * requires (item 84 / item 95 doctrine), not a silent widening.
 *
 * ── R-005c: the par-24 rung of Act II batches 2 + 3, cap-binding a third time ──
 * R-005a's batches 2 + 3 (`l031`–`l035`, `src/levels/README.md` §2g) walk the refusal
 * family to par **19 / 22 / 22 / 24 / 24** — one *new* par value (24) and two the
 * family already covers. Both are registered here as **named rows evaluated from the
 * formula above**, again computed rather than clamped; `refusalRouteEnvelopeMs` is a
 * function of `par` alone, so the three new rungs are absorbed with **zero
 * re-migration** (the whole point of QA-013's derived form):
 *
 * ```
 * cloudUpperS(19)          = 5.9 × (1.17 × 19 − 1.28 + 3.0) = 5.9 × 23.95   = 141.305 s
 * envelope(19)             = ceil(1.5 × 141.305) × 1000      = ceil(211.9575) = 212_000 ms
 *                            → INSIDE the formula (212 s < cap), no cap-binding
 *
 * cloudUpperS(22)          = 5.9 × (1.17 × 22 − 1.28 + 3.0) = 5.9 × 27.46   = 162.014 s
 * uncapped envelope (22)   = ceil(1.5 × 162.014) × 1000      = ceil(243.021) = 244_000 ms
 * refusalRouteEnvelopeMs(22)= min(240_000, max(90_000, 244_000)) = 240_000 ms (cap binds)
 *
 * cloudUpperS(24)          = 5.9 × (1.17 × 24 − 1.28 + 3.0) = 5.9 × 29.80   = 175.820 s
 * uncapped envelope (24)   = ceil(1.5 × 175.820) × 1000      = ceil(263.730) = 264_000 ms
 * refusalRouteEnvelopeMs(24)= min(240_000, max(90_000, 264_000)) = 240_000 ms (cap binds)
 * exceedance over the cap at par 24 = 264_000 − 240_000                        = +24_000 ms (+10.0 %)
 * ```
 *
 * So **par 24 joins par 22 and par 23 as a named cap-binding row** (L34/L35 read the
 * 240 s cap, with the +24 s exceedance written above rather than hidden by the `min`),
 * while par 19 — the batch's low rung, L31 — lands *inside* the formula at **212 s**
 * and needs no cap registration at all. The cap has now stopped the derived form on
 * four consecutive values (22 → 24), which keeps the standing signal below loud
 * instead of quiet. No number in the table above moved and no code moved.
 *
 * ⚠ The standing consequence, stated so it stays loud: from par 22 on the derived form
 * has **stopped growing** — every further rung reads the cap (par 22, 23 and now 24).
 * That is the signal for a *named* re-derivation of the envelope itself (its cloud factor,
 * or the cap), and this row exists so the signal cannot be missed: **R-005c registers the
 * par-24 rung as that third reading and leaves the cap standing**, because the envelope's
 * re-derivation is a cloud-datum question (QA-024's `4.40×` is the walk-class datum; the
 * refusal family's is `5.9×`) and no fresh cloud round exists at 35 levels yet. This is
 * wall clock only — every assertion in the spec is untouched.
 */
export function refusalRouteEnvelopeMs(par: number): number {
  /** Least-squares slope of the five local rows against par. */
  const LOCAL_S_PER_PAR = 1.17;
  /** …and its intercept. */
  const LOCAL_INTERCEPT_S = -1.28;
  /** Max `|measured − fit|` in the local round — folds the jitter into the bound. */
  const LOCAL_WORST_RESIDUAL_S = 3.0;
  /** Max local→cloud same-family factor observed in round `38890893868`. */
  const CLOUD_FACTOR = 5.9;
  /** Required margin over the fitted value. */
  const SAFETY = 1.5;
  /** The constant this migration replaces — kept as a floor, so it only ever widens. */
  const FLOOR_MS = 90_000;
  /** The ticket's absolute cap. It binds at par ≥ 22 (22, 23 and 24 all read it — see above). */
  const CAP_MS = 240_000;

  const cloudUpperS =
    CLOUD_FACTOR *
    (LOCAL_S_PER_PAR * par + LOCAL_INTERCEPT_S + LOCAL_WORST_RESIDUAL_S);

  return Math.min(
    CAP_MS,
    Math.max(FLOOR_MS, Math.ceil(SAFETY * cloudUpperS) * 1000),
  );
}
