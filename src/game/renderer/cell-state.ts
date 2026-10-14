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
 */

import type { Level } from "@/core/level";
import { isWallSolidAt, solidWalls } from "@/core/rules/solid";
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
 * R-C13: is the player standing inside a tile that is **solid in the current
 * phase**? A legal, stable state under ADR-0008 clause 3 — the player was never
 * crushed or pushed, and every outward step is judged by the ordinary entry rule,
 * so the tile can always be left.
 */
export function isPlayerEmbedded(level: Level, gs: GameState): boolean {
  return isWallSolidAt(level, gs.phase, gs.playerPosition);
}

/** Is the player standing on `tile`? (View-side comparison, no rule meaning.) */
export function isPlayerAt(gs: GameState, tile: Vec): boolean {
  return sameVec(gs.playerPosition, tile);
}