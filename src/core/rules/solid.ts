/**
 * Solidity — the single place where "is this tile enterable right now?" is decided.
 *
 * Truth sources:
 * - ADR-0008 (GATE C, Option B) clauses 1, 5, 6, 8 — legality is judged at
 *   entry, against the **current** phase only; walls and doors share one
 *   solidity semantics; portals are phase-gated.
 * - `docs/architecture.md` §6.1 (illegal-move semantics) / §6.2 (step 3 + step 5
 *   interaction semantics) / §6.3 (finiteness).
 * - `docs/level-design.md` §1 (door colours, switch targets, portal pairs).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 *
 * Only ONE path computes door openness: `resolveDoorsOpen`. Everything else
 * reads the resolved `doorsOpen` record. That is deliberate — a second,
 * on-the-fly door computation would be exactly the two-rule-paths failure mode
 * ADR-0006/ADR-0008 exist to prevent.
 */

import type { DoorDef, Level, PortalDef, SwitchDef } from "@/core/level";
import type { Phase } from "@/core/state/phase";
import type { DoorsOpen, PhaseView, Vec } from "@/core/state/types";

/** A level-data coordinate, `[x, y]`, 0-indexed from the top-left (`docs/level-design.md` §1). */
type TileTuple = readonly [number, number];

/**
 * In-bounds test (`docs/architecture.md` §6.1 condition 1).
 * `solidAt` also returns `true` for out-of-bounds tiles (fail-closed), so a
 * caller may use `solidAt` alone; `inBounds` is exported for callers that want
 * to distinguish "blocked" from "edge of the world" (e.g. bump feedback).
 */
export function inBounds(level: Level, p: Vec): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < level.width && p.y < level.height;
}

function toVec(tile: TileTuple): Vec {
  return { x: tile[0], y: tile[1] };
}

function listContains(tiles: readonly TileTuple[], p: Vec): boolean {
  for (const tile of tiles) {
    if (tile[0] === p.x && tile[1] === p.y) return true;
  }
  return false;
}

/**
 * Walls solid while `phase` is active (ADR-0008 clause 8).
 *
 * A phase wall is enterable on exactly one parity of the move count — it is a
 * timing gate, not a static obstacle (`docs/level-design.md` §0). The other
 * phase's walls are "echoes": not solid now, solid after the flip.
 */
export function solidWallTiles(level: Level, phase: Phase): readonly TileTuple[] {
  return phase === "A" ? level.phaseAWalls : level.phaseBWalls;
}

export function isWallSolidAt(level: Level, phase: Phase, p: Vec): boolean {
  return listContains(solidWallTiles(level, phase), p);
}

/** Walls solid in `phase`, as positions (derived view; see `PhaseView`). */
export function solidWalls(level: Level, phase: Phase): readonly Vec[] {
  return solidWallTiles(level, phase).map(toVec);
}

/**
 * Base door openness from colour alone: **red is open in A / closed in B, blue
 * is the inverse** (`docs/game-design.md` §5, `docs/level-design.md` §1).
 * This is the *pre-switch* value; switches may invert it — see `doorIsOpen`.
 */
export function baseDoorOpen(color: "red" | "blue", phase: Phase): boolean {
  return color === "red" ? phase === "A" : phase === "B";
}

/**
 * Door openness for one door in one phase, switches included.
 *
 * `docs/level-design.md` §1: "Stepping on the tile while `activePhase` is
 * current toggles the target doors." Combined with the absolute-recompute
 * contract (`docs/architecture.md` §5 / §6.2 step 5: recomputed from
 * `(door.color, phase, switchesOn)`, never carried incrementally), the openness
 * of a door is its colour base **inverted once per switch that is currently ON
 * and lists this door in `targets`** — i.e. an even number of ON switches
 * targeting the same door restores the colour base.
 *
 * NOTE (flagged, not silently decided): no document pins the multi-switch
 * composition rule (invert-per-ON-switch vs. "any ON switch forces open" vs.
 * "exactly one switch may target a door"). See the GAME-001 return contract,
 * OPEN QUESTIONS. Single-switch levels are unaffected by the choice.
 */
export function doorIsOpen(
  level: Level,
  door: DoorDef,
  phase: Phase,
  switchesOn: Readonly<Record<string, boolean>>,
): boolean {
  let open = baseDoorOpen(door.color, phase);
  for (const sw of level.switches) {
    if (switchesOn[sw.id] !== true) continue;
    if (!sw.targets.includes(door.id)) continue;
    open = !open;
  }
  return open;
}

/**
 * Absolute post-resolution door openness for every door in the level
 * (`applyMove` step 5). Canonical by construction: it always contains an entry
 * for every door, so equal logical states serialize identically (§6.3).
 */
export function resolveDoorsOpen(
  level: Level,
  phase: Phase,
  switchesOn: Readonly<Record<string, boolean>>,
): DoorsOpen {
  const doorsOpen: Record<string, boolean> = {};
  for (const door of level.doors) {
    doorsOpen[door.id] = doorIsOpen(level, door, phase, switchesOn);
  }
  return doorsOpen;
}

/**
 * The door covering `p`, if any (doors are multi-tile gates, `docs/level-design.md` §1).
 * Returns `undefined` for a tile that holds no door.
 */
export function doorAt(level: Level, p: Vec): DoorDef | undefined {
  for (const door of level.doors) {
    if (listContains(door.tiles, p)) return door;
  }
  return undefined;
}

/** `true` iff `p` is a door tile that is **closed** in the given resolved state. */
export function isClosedDoorAt(level: Level, doorsOpen: DoorsOpen, p: Vec): boolean {
  const door = doorAt(level, p);
  return door !== undefined && doorsOpen[door.id] !== true;
}

/**
 * The one solidity question the rules ever ask: *is `p` blocked for entry right
 * now?* (`docs/architecture.md` §6.1 condition 2).
 *
 * Blocked iff a wall is active in `phase`, or `p` is a door tile whose resolved
 * openness is not `true` (missing key ⇒ closed, fail-closed). Out-of-bounds
 * counts as solid, so this function is a complete entry test on its own.
 *
 * Deliberately **not** consulted: the tile the player *already occupies*
 * (ADR-0008 clause 3 — standing inside a solid cell is legal and stable; there
 * is no post-flip standing check) and the phase after the flip (clause 1 — one
 * evaluation point only).
 */
export function solidAt(
  level: Level,
  phase: Phase,
  doorsOpen: DoorsOpen,
  p: Vec,
): boolean {
  if (!inBounds(level, p)) return true;
  if (isWallSolidAt(level, phase, p)) return true;
  if (isClosedDoorAt(level, doorsOpen, p)) return true;
  return false;
}

/** Portal definitions active while `phase` is current (M2, ADR-0008 clause 6). */
export function activePortals(level: Level, phase: Phase): readonly PortalDef[] {
  return level.portals.filter((portal) => portal.activePhase === phase);
}

/**
 * The portal end at `p` that is **active in `phase`**, if any.
 * A portal on the other parity does not exist for entry purposes, and standing
 * on a portal never re-triggers it (ADR-0008 clause 6) — this function is only
 * ever called from the entry step of `applyMove`.
 */
export function portalAt(level: Level, phase: Phase, p: Vec): PortalDef | undefined {
  for (const portal of activePortals(level, phase)) {
    const [a, b] = portal.pair;
    if (listContains([a, b], p)) return portal;
  }
  return undefined;
}

/** The paired end of `portal` opposite to `from` (the player is standing on the other end). */
export function portalExit(portal: PortalDef, from: Vec): Vec {
  const [a, b] = portal.pair;
  if (a[0] === from.x && a[1] === from.y) return toVec(b);
  return toVec(a);
}

/** The switch at `p` whose `activePhase` is `phase`, if any (M3, optional mechanic). */
export function switchAt(level: Level, phase: Phase, p: Vec): SwitchDef | undefined {
  for (const sw of level.switches) {
    if (sw.activePhase !== phase) continue;
    if (sw.tile[0] === p.x && sw.tile[1] === p.y) return sw;
  }
  return undefined;
}

/**
 * Phase-resolved occupancy view used by the renderer and by `GameState.objects`.
 * Portals are static per level; only their eligibility changes with the phase,
 * so the view is a pure function of `(level, phase)`.
 */
export function phaseView(level: Level, phase: Phase): PhaseView {
  return { walls: solidWalls(level, phase), portals: activePortals(level, phase) };
}