/**
 * Level data layer — `@/core/level` (Level AI + Solver; AGENTS.md §4).
 *
 * Owns: the level schema (zod), the level types, and the rule validator.
 * Does NOT own: `src/core/state/**` + `src/core/rules/**` (Gameplay Engineer),
 * the renderer (`src/game/**`), or level *design intent* (`docs/level-design.md`).
 *
 * Truth sources:
 * - `docs/level-design.md` §1 — field-by-field schema table + validation invariants;
 * - `docs/architecture.md` §5 (state model) + §7 (level schema & validation);
 * - `ADR-0004` — invalid candidates are REJECTED, never auto-repaired;
 * - `ADR-0008` rule 7 — the goal must be non-wall in BOTH phases (hard error);
 * - `docs/architecture.md` V0.5 §7 (RV-002 H-2) — both ends of every portal must
 *   be non-wall in BOTH phases and must not be door tiles (hard error), and a
 *   same-parity portal pair can never break the position↔phase parity link
 *   (hard error, they are mechanically inert);
 * - parity-dead walls — every legal move changes `x + y` parity and the phase
 *   together, so the phase an entry happens in is fixed by the tile's Manhattan
 *   parity from the start; a wall solid in its own entry phase is therefore
 *   never enterable on any move count (ADR-0008 clause 8). Hard error in
 *   teaching levels, warning afterwards;
 * - `docs/ui-ux.md` R-L2 — hard grid cap 7 × 7 (`width`/`height` ∈ 3..7);
 * - `AGENTS.md` §3 — `src/core/**` is pure TypeScript: never import Phaser here.
 *
 * Why one file instead of `types.ts` / `schema.ts` / `validate.ts`?
 * `tsconfig.json` is frozen (not this role's file) and has **no**
 * `allowImportingTsExtensions`, while Node's native type-stripping (the only
 * TypeScript runner present in this workspace — there is no `tsx`) requires
 * explicit `.ts` specifiers to resolve a module at runtime. Extensionless
 * internal imports would therefore break `node scripts/validate-levels.ts`,
 * and `.ts` internal imports would break `npx tsc --noEmit`. Keeping the level
 * layer in a single module (only external import: `zod`) makes the module
 * loadable by *both* the compiler and bare Node, with zero build step.
 *
 * ── COORDINATE REPRESENTATION (frozen, do not mix) ──────────────────────────
 * - JSON level data + this module: `Coord` tuples — `readonly [x, y]`, 0-indexed,
 *   `x` = column (left→right), `y` = row (top→bottom).
 * - runtime `src/core/state` (Gameplay Engineer, already delivered): `Vec`
 *   objects — `{ x, y }`.
 * - The conversion happens **exactly once**, in the level loader /
 *   `initialState` — never here, never per-move, never in both directions
 *   inside the solver loop.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Types — frozen cross-agent contract
//    (GAME-001 already imports `PortalDef` from `@/core/level`; these names are
//    frozen. Do not rename, do not re-shape.)
// ─────────────────────────────────────────────────────────────────────────────

/** The two world phases. A = Light / 白昼, B = Shadow / 夜晚 (AGENTS.md §2). */
export type Phase = "A" | "B";

/**
 * Tile coordinate: 0-indexed, `[x, y]`, `x` = column, `y` = row.
 *
 * Data-layer form (this module + the JSON files). The runtime state layer uses
 * `Vec = { x, y }`; see the representation note at the top of this file.
 */
export type Coord = readonly [x: number, y: number];

/**
 * M1 — a colored, multi-tile, level-authored phase gate
 * (`docs/level-design.md` §1, `docs/game-design.md` §5).
 *
 * Red doors are open in phase A / closed in B; blue doors the inverse.
 * Closed-door tiles are solid, exactly like a wall of the current phase.
 * Introduced at L21 — M0 teaching levels must carry `doors: []`.
 */
export interface DoorDef {
  id: string;
  color: "red" | "blue";
  tiles: readonly Coord[];
}

/**
 * M3 — optional remote toggle (ships only on positive Stage 2–4 playtest
 * evidence). Entering `tile` while `activePhase` is the current phase toggles
 * the doors named in `targets` (enter-only: standing on it never re-triggers).
 */
export interface SwitchDef {
  id: string;
  tile: Coord;
  activePhase: Phase;
  targets: readonly string[];
}

/**
 * M2 — a phase-gated space fold. Entering either end while `activePhase` is the
 * current phase teleports the player to the other end, **once, no chaining**
 * (ADR-0008 rule 6). Introduced at L36 — M0 teaching levels carry `portals: []`.
 */
export interface PortalDef {
  id: string;
  pair: readonly [Coord, Coord];
  activePhase: Phase;
}

/**
 * A level definition — the exact contract of `docs/level-design.md` §1.
 * Every field is required (empty arrays are valid, missing arrays are not).
 * `par` is the display-only "perfect clear" target, never a fail condition.
 */
export interface Level {
  /** Unique; equals the level's number in the 50-level progression (L`id`). Int ≥ 1. */
  id: number;
  /** Columns. Int 3..7 — hard cap from `docs/ui-ux.md` R-L2. */
  width: number;
  /** Rows. Int 3..7 — same cap. */
  height: number;
  /** Phase at move 0. Teaching levels always start `"A"`. */
  startPhase: Phase;
  /** Start tile: in bounds, non-wall in BOTH phases (clean spawn — never embedded). */
  player: Coord;
  /** Goal tile: differs from `player`, non-wall in BOTH phases (ADR-0008 rule 7). */
  goal: Coord;
  /** Tiles solid while phase A is active (passable echoes during phase B). */
  phaseAWalls: readonly Coord[];
  /** Tiles solid while phase B is active (passable echoes during phase A). */
  phaseBWalls: readonly Coord[];
  doors: readonly DoorDef[];
  switches: readonly SwitchDef[];
  portals: readonly PortalDef[];
  /** Reference move count, int ≥ 1. MANUAL HYPOTHESIS until SOLVER-001 proves it. */
  par: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Schema (zod 4) — mirrors `docs/level-design.md` §1, hard cap 3..7 (R-L2)
// ─────────────────────────────────────────────────────────────────────────────

const MIN_GRID = 3;
const MAX_GRID = 7; // docs/ui-ux.md R-L2: authored grids are ≤ 7 × 7.

const PhaseSchema = z.enum(["A", "B"]);

/** `[x, y]` — both integers. Bounds are checked in `validateLevel` (schema cannot know width/height). */
export const CoordSchema = z.tuple([z.number().int(), z.number().int()]);

export const DoorSchema = z.strictObject({
  id: z.string().min(1),
  color: z.enum(["red", "blue"]),
  tiles: z.array(CoordSchema).min(1),
});

export const SwitchSchema = z.strictObject({
  id: z.string().min(1),
  tile: CoordSchema,
  activePhase: PhaseSchema,
  targets: z.array(z.string().min(1)),
});

export const PortalSchema = z.strictObject({
  id: z.string().min(1),
  pair: z.tuple([CoordSchema, CoordSchema]),
  activePhase: PhaseSchema,
});

/**
 * The authoritative level schema. `strictObject`: an unknown key is an **error**,
 * not silent noise — a typo like `phaseWalls` must not be accepted as an empty
 * wall set (ADR-0004: reject, never auto-repair). Adding a field is a
 * `docs/level-design.md` §1 change (Game Designer) + a change here, in that order.
 */
export const LevelSchema = z.strictObject({
  id: z.number().int().min(1),
  width: z.number().int().min(MIN_GRID).max(MAX_GRID),
  height: z.number().int().min(MIN_GRID).max(MAX_GRID),
  startPhase: PhaseSchema,
  player: CoordSchema,
  goal: CoordSchema,
  phaseAWalls: z.array(CoordSchema),
  phaseBWalls: z.array(CoordSchema),
  doors: z.array(DoorSchema),
  switches: z.array(SwitchSchema),
  portals: z.array(PortalSchema),
  par: z.number().int().min(1),
});

/** Raw (pre-parse) level shape, e.g. straight out of an LLM candidate or a JSON file. */
export type LevelInput = z.input<typeof LevelSchema>;

/** Parsed (post-schema) shape. `validateLevel` pins it to `Level` — see below. */
export type LevelSchemaOutput = z.infer<typeof LevelSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. Small coordinate helpers (shared by the validator and, later, the solver)
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical map/set key for a tile: `"x,y"`. */
export function coordKey(c: Coord): string {
  return `${c[0]},${c[1]}`;
}

export function sameCoord(a: Coord, b: Coord): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** Human-readable tile, for error messages. */
export function formatCoord(c: Coord): string {
  return `(${c[0]}, ${c[1]})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3b. Phase + entry-parity helpers
//
// Deliberately level-local (`flip` mirrors `flipPhase`, `PHASES` mirrors the
// state-layer constant) rather than imported from `@/core/state/**`: this module
// stays importable by both `tsc` and bare Node with `zod` as its only dependency
// (see the header note), and a runtime `level → state` edge would point the
// dependency arrow backwards — `src/core/state/types.ts` already imports *from*
// `src/core/level`.
// ─────────────────────────────────────────────────────────────────────────────

/** Canonical phase order (A = Light / 白昼, B = Shadow / 夜晚). */
const PHASES = ["A", "B"] as const satisfies readonly Phase[];

/** The other phase, in the validator's own words. */
function flip(phase: Phase): Phase {
  return phase === "A" ? "B" : "A";
}

/**
 * Teaching-block ceiling: L1–L20 are the M0 literacy/fluency block and carry
 * `portals: []` by design (docs/level-design.md §5, `PortalDef` doc comment) —
 * they must teach live parity gates, not permanent obstacles.
 */
const TEACHING_MAX_ID = 20;

/**
 * The phase an entry into `tile` always happens in — the heart of the
 * parity-dead-wall check.
 *
 * `entryPhase(T) = (ManhattanDistance(start, T) odd) ? startPhase : flip(startPhase)`.
 *
 * Direction matters and is easy to invert: the entry is decided **before** that
 * move's flip, so an ODD distance means the phase at entry is `startPhase` (the
 * player stands on a neighbour after `d - 1` moves, an even count, and the phase
 * is `startPhase` flipped an even number of times). Verified against `applyMove`.
 */
function entryPhaseOf(tile: Coord, start: Coord, startPhase: Phase): Phase {
  const manhattanParity = (tile[0] + tile[1] - start[0] - start[1]) % 2;
  return manhattanParity !== 0 ? startPhase : flip(startPhase);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Validator
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  /** `true` ⟺ `errors` is empty. Warnings never reject a level. */
  ok: boolean;
  /** Hard invariant violations — the candidate is REJECTED (ADR-0004). */
  errors: string[];
  /** Suspicious-but-legal constructions for manual review; never reject by themselves. */
  warnings: string[];
}

/**
 * Validate a raw level candidate (JSON file, LLM proposal, generator output).
 *
 * Contract:
 * - **Never mutates `raw`** and **never repairs** anything: the result is a
 *   verdict, not a fixed level. A rejected candidate must be re-authored or
 *   dropped, never patched into the official set (ADR-0004).
 * - Hard errors: schema violation (unknown key, missing field, wrong type,
 *   `width`/`height` outside 3..7); coordinates out of bounds; duplicate tiles
 *   within one list; duplicate ids within one collection; `player`/`goal`
 *   overlapping each other; `player` or `goal` solid in either phase
 *   (ADR-0008 rule 7 for the goal); dangling switch `targets`; portal ends
 *   identical / out of bounds / solid in **either** phase / covered by a door
 *   tile / a pair whose two ends share one `(x + y)` parity (architecture V0.5
 *   §7); a wall that can never be entered on any move count in a portal-free
 *   teaching level (`id ≤ 20`, `portals: []`), where the parity argument is
 *   exact.
 * - Warnings: a tile solid in BOTH phases (never enterable — deliberate design
 *   only, flag for review); a wall that can never be entered on any move count
 *   in a non-teaching level; door tiles on a phase wall, or on the player/goal;
 *   a switch that can never fire; a switch with no targets.
 *
 * Parity-dead walls, precisely: every legal move changes `x + y` parity and the
 * phase together, so the player can only stand next to a tile `T` after
 * `n ≡ d(T) - 1 (mod 2)` moves (`d` = Manhattan distance from the start; extra
 * "wandering" moves come in pairs and cannot change the parity), and the phase
 * current at that moment is `startPhase` flipped `n` times, i.e.
 * `entryPhase(T) = (d(T) odd) ? startPhase : flip(startPhase)`. A wall listed in
 * `phase{entryPhase(T)}Walls` therefore refuses *every* entry attempt on *every*
 * move count. Verified against the real rules engine by exhaustive BFS over
 * `applyMove` (L3 `(3,1)`: entry phase A, never entered; L4 `(2,0)`: entry
 * phase A, entered in A). A portal pair of opposite parity breaks that link
 * (`applyMove` BFS: same-parity pairs leave every tile reachable in exactly one
 * phase, opposite-parity pairs make tiles reachable in both), so with portals
 * present the claim is not decidable at the data layer and the check degrades to
 * a warning that says so.
 *
 * This function proves nothing about **solvability** or about `par` — that is
 * SOLVER-001's BFS job (`docs/architecture.md` §8, ADR-0004 pipeline).
 */
export function validateLevel(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${formatIssuePath(issue.path)}: ${issue.message}`);
    }
    return { ok: false, errors, warnings };
  }

  // The explicit annotation is the compile-time drift guard: if `LevelSchema` and
  // the frozen `Level` interface ever diverge, `tsc --noEmit` fails right here.
  const level: Level = parsed.data;
  const { width, height, player, goal } = level;

  // Reader-supplied labels, so every message names the failing list *and* index.
  const boundChecks: ReadonlyArray<readonly [string, readonly Coord[]]> = [
    ["player", [player]],
    ["goal", [goal]],
    ["phaseAWalls", level.phaseAWalls],
    ["phaseBWalls", level.phaseBWalls],
  ];

  for (const [label, list] of boundChecks) {
    list.forEach((c, i) => {
      const problem = outOfBounds(c, width, height);
      if (problem !== null) {
        errors.push(`${label}[${i}] ${formatCoord(c)}: ${problem}`);
      }
    });
  }

  // Duplicate tiles inside one list (same list only — wall A / wall B overlap is
  // a different, explicitly-allowed case, handled as a warning below).
  errors.push(...duplicateTileMessages("phaseAWalls", level.phaseAWalls, width, height));
  errors.push(...duplicateTileMessages("phaseBWalls", level.phaseBWalls, width, height));

  const wallA = new Set(level.phaseAWalls.map(coordKey));
  const wallB = new Set(level.phaseBWalls.map(coordKey));
  const playerKey = coordKey(player);
  const goalKey = coordKey(goal);

  if (sameCoord(player, goal)) {
    errors.push(`player and goal are the same tile ${formatCoord(player)} — the goal must differ from the start`);
  }

  // Clean spawn: the player never starts embedded (docs/level-design.md §1).
  if (wallA.has(playerKey)) {
    errors.push(
      `player ${formatCoord(player)} is a wall in phase A (phaseAWalls) — the player must spawn on a tile that is non-wall in BOTH phases`,
    );
  }
  if (wallB.has(playerKey)) {
    errors.push(
      `player ${formatCoord(player)} is a wall in phase B (phaseBWalls) — the player must spawn on a tile that is non-wall in BOTH phases`,
    );
  }

  // ADR-0008 rule 7 — hard error, this one is load-bearing: it guarantees the
  // goal is enterable on both parities and that a win never happens from inside
  // a wall.
  if (wallA.has(goalKey)) {
    errors.push(
      `goal ${formatCoord(goal)} is a wall in phase A (phaseAWalls) — ADR-0008 rule 7: the goal must be non-wall in BOTH phases`,
    );
  }
  if (wallB.has(goalKey)) {
    errors.push(
      `goal ${formatCoord(goal)} is a wall in phase B (phaseBWalls) — ADR-0008 rule 7: the goal must be non-wall in BOTH phases`,
    );
  }

  // Warning: solid in both phases ⇒ never enterable from any parity. Legal only
  // by deliberate design; it is exactly the case L4/L5 analysis must look at.
  const bothPhases = [...wallA].filter((key) => wallB.has(key));
  for (const key of bothPhases) {
    const [x, y] = key.split(",");
    warnings.push(
      `tile (${x}, ${y}) is listed in phaseAWalls AND phaseBWalls — solid in both phases, never enterable; allowed only by deliberate design (manual review)`,
    );
  }

  // ── parity-dead walls ─────────────────────────────────────────────────────
  // Every legal move is ±1 on one axis, which changes `x + y` parity and the
  // phase *together*; a tile's parity relative to the start therefore fixes the
  // phase its entry can happen in (see the `validateLevel` contract note).
  //   entryPhase(T) = (d(T) odd) ? startPhase : flip(startPhase)
  // Note the direction, it is easy to invert: the entry happens *before* the
  // n-th move's flip, so an ODD distance means the entry phase is `startPhase`.
  // A wall listed in its own entry phase is then never enterable — with one
  // exception: a portal pair of opposite parity breaks the position↔phase link,
  // so the claim is only decidable at the data layer when no portals exist.
  const wallLists: ReadonlyArray<readonly [string, readonly Coord[], Phase]> = [
    ["phaseAWalls", level.phaseAWalls, "A"],
    ["phaseBWalls", level.phaseBWalls, "B"],
  ];
  const portalCaveat =
    level.portals.length > 0
      ? ` — NOT PROVEN for this candidate: it carries ${String(level.portals.length)} portal(s), and a teleport between tiles of opposite (x + y) parity breaks the parity link above, so this wall may still be enterable from a portal landing (manual review / needs the solver)`
      : "";

  for (const [label, list, ownPhase] of wallLists) {
    list.forEach((tile, i) => {
      if (outOfBounds(tile, width, height) !== null) return; // already an error above
      if (entryPhaseOf(tile, player, level.startPhase) === ownPhase) {
        const message = `${label}[${i}] ${formatCoord(tile)}: this wall can never be entered on any move count — it is decoration, not a mechanic. Entry into ${formatCoord(tile)} always happens in phase ${ownPhase}, which is exactly this wall's own solid phase: every legal move changes x + y parity and the phase together, so the phase at entry is fixed by the tile's Manhattan-distance parity from the start (odd distance ⇒ startPhase "${level.startPhase}", even distance ⇒ "${flip(level.startPhase)}"), and extra moves cannot change that parity (wandering moves come in pairs)${portalCaveat}`;
        if (level.id <= TEACHING_MAX_ID && level.portals.length === 0) {
          errors.push(
            `${message} — teaching levels (id ≤ ${TEACHING_MAX_ID}) must carry live parity gates, not permanent obstacles (ADR-0004: reject, never auto-repair)`,
          );
        } else {
          warnings.push(message);
        }
      }
    });
  }

  // ── doors (M1) ────────────────────────────────────────────────────────────
  errors.push(...duplicateIdMessages("doors", level.doors.map((d) => d.id)));
  level.doors.forEach((door, i) => {
    door.tiles.forEach((tile, j) => {
      const problem = outOfBounds(tile, width, height);
      if (problem !== null) errors.push(`doors[${i}] "${door.id}".tiles[${j}] ${formatCoord(tile)}: ${problem}`);
    });
    errors.push(...duplicateTileMessages(`doors[${i}] "${door.id}".tiles`, door.tiles, width, height));

    door.tiles.forEach((tile, j) => {
      const key = coordKey(tile);
      if (wallA.has(key) || wallB.has(key)) {
        const phase = wallA.has(key) ? "A" : "B";
        warnings.push(
          `doors[${i}] "${door.id}".tiles[${j}] ${formatCoord(tile)} is also a phase-${phase} wall — while that phase is active the tile is solid regardless of the door state (door may be partially inert)`,
        );
      }
      if (key === goalKey) {
        warnings.push(
          `doors[${i}] "${door.id}".tiles[${j}] covers the goal ${formatCoord(goal)} — the goal can only be entered while that door is open in the current phase; ADR-0008 rule 7 intends the goal to be enterable on both parities (manual review / redesign)`,
        );
      }
      if (key === playerKey) {
        warnings.push(
          `doors[${i}] "${door.id}".tiles[${j}] covers the player start ${formatCoord(player)} — the player may start embedded in a closed door (manual review)`,
        );
      }
    });
  });

  // ── switches (M3) ─────────────────────────────────────────────────────────
  errors.push(...duplicateIdMessages("switches", level.switches.map((s) => s.id)));
  const doorIds = new Set(level.doors.map((d) => d.id));
  level.switches.forEach((sw, i) => {
    const problem = outOfBounds(sw.tile, width, height);
    if (problem !== null) errors.push(`switches[${i}] "${sw.id}".tile ${formatCoord(sw.tile)}: ${problem}`);

    sw.targets.forEach((target, j) => {
      if (!doorIds.has(target)) {
        errors.push(
          `switches[${i}] "${sw.id}".targets[${j}] = "${target}" — dangling reference: no doors[] entry has that id`,
        );
      }
    });
    if (sw.targets.length === 0) {
      warnings.push(`switches[${i}] "${sw.id}" has no targets — the switch can never change anything (inert)`);
    }

    const ownWall = sw.activePhase === "A" ? wallA : wallB;
    if (ownWall.has(coordKey(sw.tile))) {
      warnings.push(
        `switches[${i}] "${sw.id}".tile ${formatCoord(sw.tile)} is a wall while its own activePhase "${sw.activePhase}" is current — entry (and therefore the toggle) can never happen; the switch is inert`,
      );
    }
  });

  // ── portals (M2) ──────────────────────────────────────────────────────────
  errors.push(...duplicateIdMessages("portals", level.portals.map((p) => p.id)));
  const isWallIn = (phase: Phase, key: string): boolean =>
    (phase === "A" ? wallA : wallB).has(key);

  level.portals.forEach((portal, i) => {
    const [endA, endB] = portal.pair;
    const label = `portals[${i}] "${portal.id}"`;

    portal.pair.forEach((end, j) => {
      const problem = outOfBounds(end, width, height);
      if (problem !== null) errors.push(`${label}.pair[${j}] ${formatCoord(end)}: ${problem}`);
      if (problem !== null) return; // a coordinate outside the grid has no wall/door question

      // docs/architecture.md V0.5 §7 (RV-002 H-2): both ends must be non-wall in
      // BOTH phases — this strengthens the older own-`activePhase`-only check.
      // `solidAt` is `(level, phase, doorsOpen)`-dependent, and every door is
      // closed in at least one reachable phase-state, so the door case is
      // excluded outright rather than reasoned about per state.
      for (const phase of PHASES) {
        const key = coordKey(end);
        if (!isWallIn(phase, key)) continue;
        const explanation =
          portal.activePhase === phase
            ? `the end is solid while its own activePhase "${portal.activePhase}" is current, so it could never be entered while the portal is active`
            : `a teleport landing there while phase ${phase} is current would drop the player inside a wall — exactly the §6.2 step-3 landing ambiguity RV-002 H-2 removes at the data layer`;
        errors.push(
          `${label}.pair[${j}] ${formatCoord(end)} is a wall in phase ${phase} (phase${phase}Walls) — a portal end must be non-wall in BOTH phases (docs/architecture.md V0.5 §7 / RV-002 H-2): ${explanation}`,
        );
      }

      const doorIndex = level.doors.findIndex((d) => d.tiles.some((tile) => sameCoord(tile, end)));
      if (doorIndex !== -1) {
        const door = level.doors[doorIndex];
        errors.push(
          `${label}.pair[${j}] ${formatCoord(end)} is also a tile of doors[${doorIndex}] "${door?.id ?? ""}" — a portal end must not be a door tile (docs/architecture.md V0.5 §7 / RV-002 H-2): a door is closed in at least one reachable phase-state, so a landing there is never statically safe`,
        );
      }
    });

    if (sameCoord(endA, endB)) {
      errors.push(
        `${label} has both ends on ${formatCoord(endA)} — the two ends of a portal pair must be different tiles`,
      );
    } else if ((endA[0] + endA[1]) % 2 === (endB[0] + endB[1]) % 2) {
      // Same parity ⇒ the pair cannot break the position↔phase link, so the
      // portal is inert as a phase mechanic (docs/architecture.md V0.5 §7).
      errors.push(
        `${label}: both ends ${formatCoord(endA)} and ${formatCoord(endB)} have the same (x + y) parity — every legal move changes x + y parity and the phase together, so this teleport preserves that link and can never break the parity invariant: the phase at every tile stays a function of that tile's (x + y) parity, i.e. the phase behaves as if the portal did not exist. M2's purpose is to break exactly that invariant. Verified by exhaustive BFS over applyMove (5 × 5 sample: same-parity pairs leave every tile reachable in exactly one phase; opposite-parity pairs make tiles reachable in both). Rejected per docs/architecture.md V0.5 §7 / ADR-0004: re-author the pair with ends of opposite (x + y) parity`,
      );
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function outOfBounds(c: Coord, width: number, height: number): string | null {
  const [x, y] = c;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return `out of bounds (width=${width} ⇒ x ∈ 0..${width - 1}; height=${height} ⇒ y ∈ 0..${height - 1})`;
  }
  return null;
}

function duplicateTileMessages(label: string, list: readonly Coord[], width: number, height: number): string[] {
  const out: string[] = [];
  const firstSeen = new Map<string, number>();
  list.forEach((c, i) => {
    const key = coordKey(c);
    const first = firstSeen.get(key);
    if (first === undefined) {
      firstSeen.set(key, i);
      return;
    }
    // A tile that is out of bounds and duplicated gets both messages on purpose:
    // one problem per invariant, so triage never hides one behind the other.
    const alsoOutOfBounds = outOfBounds(c, width, height) !== null ? " (and out of bounds)" : "";
    out.push(
      `${label}[${i}] ${formatCoord(c)} duplicates ${label}[${first}] — the same tile may not appear twice in one list${alsoOutOfBounds}`,
    );
  });
  return out;
}

function duplicateIdMessages(label: string, ids: readonly string[]): string[] {
  const out: string[] = [];
  const firstSeen = new Map<string, number>();
  ids.forEach((id, i) => {
    const first = firstSeen.get(id);
    if (first === undefined) {
      firstSeen.set(id, i);
      return;
    }
    out.push(`${label}[${i}] has id "${id}", already used by ${label}[${first}] — ids must be unique within a collection`);
  });
  return out;
}

function formatIssuePath(path: PropertyKey[]): string {
  if (path.length === 0) return "<level>";
  return path.map((segment) => (typeof segment === "number" ? `[${segment}]` : String(segment))).join(".");
}