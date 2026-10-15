/**
 * Cell render state — **appearance only, never legality.**
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE RULE THIS FILE MUST NOT BREAK (ADR-0008 clause 1)
 * ─────────────────────────────────────────────────────────────────────────────
 * Legality and state transitions have exactly one implementation:
 * `applyMoveToGameState` (`@/core/state/transitions`). The renderer never asks
 * "can I move there?" — it asks "how do I *paint* that tile?".
 *
 * The core queries used here (`isWallSolidAt`, `solidWalls`) are the ones
 * `docs/ui-ux.md` R-C12 explicitly hands to the renderer: "the renderer picks
 * `wall` vs `wallEcho` from `theme(phase)` + the tile's `phaseAWalls` /
 * `phaseBWalls` membership — data, not a colour decision". Deciding that a tile
 * *looks* solid is not deciding that it *is* enterable. If this module is ever
 * used to pre-filter an input or to skip a call to `applyMoveToGameState`, the
 * bug is not a rendering bug — it is the core rule duplicated in the renderer.
 *
 * Why the classification matters (R-C2 / R-E3 / R-C13):
 * - `solid`    — a wall solid **in the current phase**: filled block, the only
 *                thing that ever refuses a move (highest emphasis, rank 3).
 * - `ghost`    — a wall of the **other** phase: hollow 2 px stroke + flat tint,
 *                **passable right now** and a legal destination (rank 4).
 * - `occupied` — the player stands on a tile solid **now** (entered as a ghost,
 *                solidified by the flip): interior drops to `obj.wallOccupied`,
 *                the edge stroke is retained, the player draws on top
 *                (R-C13 — "safe, walk out", never a clip-through bug).
 *
 * Since V0.5 the same three-state question exists for **doors** (§3.1b, R-D7 —
 * doors share wall semantics) and the same "appearance only" law applies: the
 * openness read here is `GameState.levelState.doorsOpen`, computed once by core's
 * `resolveDoorsOpen`, never re-derived from the colour and the phase in the view.
 * The two other classes are classified for painting only — a switch is a
 * modifier and a portal is phase-gated (M2/L36), and neither can ever refuse a
 * move (R-C2: both are hollow in both states), so their render state carries no
 * legality meaning at all.
 */

import type { DoorDef, Level, PortalDef, SwitchDef } from "@/core/level";
import {
  baseDoorOpen,
  doorAt,
  isClosedDoorAt,
  isWallSolidAt,
  portalAt,
  solidWalls,
} from "@/core/rules/solid";
import { PHASES } from "@/core/state/phase";
import type { Phase } from "@/core/state/phase";
import type { GameState, Vec } from "@/core/state/types";
import { sameVec } from "@/core/state/types";

export type WallRenderState = "solid" | "ghost" | "occupied";

/** One paintable wall tile, with the data the painter needs. */
export interface WallTile {
  readonly tile: Vec;
  /**
   * The phase that **owns** the wall — the only phase in which it is solid.
   * `undefined` when the tile is listed in both phases: such a tile is solid in
   * every phase and therefore never renders as a ghost, so it needs no
   * owning-phase glyph (validator warning "solid in both phases"). Derived from
   * data with no `phase === "A"` branch.
   */
  readonly owningPhase: Phase | undefined;
}

const key = (p: Vec): string => `${p.x},${p.y}`;

/**
 * Every tile carrying a phase wall in either phase — the L4 wall object list.
 *
 * R-E6: one wall object per tile, created at layout time and **never** created or
 * destroyed by a flip; a flip swaps its render state in place.
 */
export function wallTilesOf(level: Level): readonly WallTile[] {
  const byKey = new Map<string, WallTile>();
  for (const phase of PHASES) {
    for (const tile of solidWalls(level, phase)) {
      const k = key(tile);
      if (byKey.has(k)) continue;
      const owners = PHASES.filter((candidate) => isWallSolidAt(level, candidate, tile));
      byKey.set(k, { tile, owningPhase: owners.length === 1 ? owners[0] : undefined });
    }
  }
  return [...byKey.values()];
}

/**
 * How a wall tile must be painted in the current state.
 *
 * `playerEmbedded` is the R-C13 flag: the player stands on this tile **and** the
 * tile is solid in the current phase. Both terms come from `GameState`; nothing
 * here re-derives movement or predicts a flip.
 */
export function wallRenderState(
  level: Level,
  gs: GameState,
  tile: Vec,
  playerEmbedded: boolean,
): WallRenderState {
  if (!isWallSolidAt(level, gs.phase, tile)) return "ghost";
  return playerEmbedded ? "occupied" : "solid";
}

/**
 * R-C13 / R-D7: is the player standing inside a tile that **blocks entry in the
 * current phase**? Two classes qualify — a phase wall solid now (R-C13) and a door
 * closed now (R-D7, "doors share wall semantics") — and the answer is exactly
 * core's own predicate over both, so the view cannot disagree with the rules:
 * `isWallSolidAt(...) || isClosedDoorAt(level, doorsOpen, position)`.
 *
 * A legal, stable state under ADR-0008 clause 3 — the player was never crushed or
 * pushed, and every outward step is judged by the ordinary entry rule, so the tile
 * can always be left. The flag drives R-C13.2's interior drop, R-D7's occupied
 * door treatment and the one-shot `fx.phaseRing` (R-C13.4). The V0.7 addendum to
 * R-Z7 is what it does **not** drive: no layer, no container, no depth — the ring
 * is painted inside the existing L5 actor container, below the body.
 */
export function isPlayerEmbedded(level: Level, gs: GameState): boolean {
  if (isWallSolidAt(level, gs.phase, gs.playerPosition)) return true;
  return isClosedDoorAt(level, gs.levelState.doorsOpen, gs.playerPosition);
}

/** Is the player standing on `tile`? (View-side comparison, no rule meaning.) */
export function isPlayerAt(gs: GameState, tile: Vec): boolean {
  return sameVec(gs.playerPosition, tile);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Doors (§3.1b / R-D1 / R-D7)
 * ──────────────────────────────────────────────────────────────────────────── */

/** One paintable door tile. A door is a multi-tile gate, so the tile carries its def. */
export interface DoorTile {
  readonly tile: Vec;
  readonly door: DoorDef;
}

/**
 * Every door tile in the level, in **level-data declaration order** — which is
 * R-Z4's tie-break if two doors ever claim one cell (unvalidated today): the
 * later entry draws on top, and `board-view.ts` paints this list in order.
 */
export function doorTilesOf(level: Level): readonly DoorTile[] {
  const out: DoorTile[] = [];
  for (const door of level.doors) {
    for (const [x, y] of door.tiles) out.push({ tile: { x, y }, door });
  }
  return out;
}

/**
 * The phase a door **opens in by colour**: red = A, blue = B (`game-design.md` §5).
 *
 * Read out of core's `baseDoorOpen` rather than re-stated as a local rule — the
 * view asks the rules which phase owns the door, and only maps the answer to a
 * `Phase`. This is the value the R-C1 glyph names (§3.1b: "sun = red (opens in A),
 * crescent = blue (opens in B)").
 */
export function doorOwnerPhase(color: DoorDef["color"]): Phase {
  return baseDoorOpen(color, "A") ? "A" : "B";
}

/**
 * Is this door tile open **right now**? Read from the resolved `doorsOpen` record
 * (fail-closed: only a literal `true` means open), exactly like `solidAt` — never
 * recomputed from `(colour, phase, switches)` in the renderer.
 */
export function doorIsOpenNow(level: Level, gs: GameState, tile: Vec): boolean {
  const door = doorAt(level, tile);
  return door !== undefined && gs.levelState.doorsOpen[door.id] === true;
}

/**
 * Is the player standing **inside this door tile** while the door blocks entry in
 * the current phase? R-D1/R-D7's "occupied" render flag, tile-scoped.
 *
 * Deliberately a predicate over **one tile**, not a classification of the board: the
 * caller asks it for the tile it is about to paint, so it needs no `playerEmbedded`
 * argument and cannot answer for a tile the player is not on. (The V0.7 signature
 * took the board-wide embedded flag and returned "occupied" for *any* door tile
 * whenever the player was embedded somewhere — right for the player's own tile, wrong
 * for every other door on the board.) Both terms come from `GameState`; nothing here
 * re-derives movement or predicts a flip.
 */
export function doorIsOccupiedNow(level: Level, gs: GameState, tile: Vec): boolean {
  // A tile that carries no door can never be an occupied **door** — the predicate is
  // answerable for any tile on the board, so it must answer "no" for all of them
  // rather than only being safe when the caller already filtered to door tiles.
  if (doorAt(level, tile) === undefined) return false;
  return isPlayerAt(gs, tile) && !doorIsOpenNow(level, gs, tile);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Switches (M3) and portals (M2)
 * ──────────────────────────────────────────────────────────────────────────── */

/** One paintable switch tile (M3: optional remote toggle, never blocks entry). */
export interface SwitchTile {
  readonly tile: Vec;
  readonly switch: SwitchDef;
}

export function switchTilesOf(level: Level): readonly SwitchTile[] {
  return level.switches.map((sw) => ({ tile: { x: sw.tile[0], y: sw.tile[1] }, switch: sw }));
}

/**
 * The switch at `tile`, **regardless of its `activePhase`**.
 *
 * Deliberately not core's `switchAt`, which filters by the current phase: that is
 * the *rules* question ("would entering this tile fire the switch?", `applyMove`
 * step 3) and it is the wrong question for painting — an inactive switch is still
 * an object on the board and must still be drawn (it is the player's only warning
 * that this tile is a toggle at all). The phase question is never asked here; the
 * glyph names the owning phase instead (§3.1/R-C1 extension, `objects/switch.ts`).
 */
export function switchDefAt(level: Level, tile: Vec): SwitchDef | undefined {
  for (const sw of level.switches) {
    if (sw.tile[0] === tile.x && sw.tile[1] === tile.y) return sw;
  }
  return undefined;
}

/** Latched switch state: only a literal `true` means on (missing ⇒ off, core's rule). */
export function switchIsOn(gs: GameState, sw: SwitchDef): boolean {
  return gs.levelState.switchesOn[sw.id] === true;
}

/** One paintable portal end (M2/L36 — no shipped level carries one yet). */
export interface PortalTile {
  readonly tile: Vec;
  readonly portal: PortalDef;
}

export function portalTilesOf(level: Level): readonly PortalTile[] {
  const out: PortalTile[] = [];
  for (const portal of level.portals) {
    for (const [x, y] of portal.pair) out.push({ tile: { x, y }, portal });
  }
  return out;
}

/**
 * Is this portal end **active now**? Asked of core's `portalAt` (the same function
 * `applyMove`'s entry step uses), so the swirl can never promise a teleport the
 * rules would not perform — the §3.1c primary channel is exactly this flag.
 *
 * There is deliberately no `portalDefAt` counterpart to `switchDefAt`: a portal's
 * look takes no per-portal data (§3.1c gives the class one outline token and a swirl,
 * never a colour or a glyph), so the tile's def has no consumer and a lookup that
 * nothing calls is API, not abstraction. `portalTilesOf` is what enumerates the ends.
 */
export function portalIsActive(level: Level, gs: GameState, tile: Vec): boolean {
  return portalAt(level, gs.phase, tile) !== undefined;
}