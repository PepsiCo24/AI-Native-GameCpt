/**
 * Tile-object registry — **the one place a tile class is enumerated** (the
 * "tileType / registry" seam the L6+ work plugs into).
 *
 * `docs/ui-ux.md` §5.2 fixes the layer stack:
 *
 * ```
 * L0 pageGround   L1 backgroundImage   L2 boardPlate   L3 cellPlate + grid
 * L4 objects (wall + wallEcho / door / portal / switch / goal)   L5 actor
 * L6 cellFeedback   L7 plateTint (win)   L8 DOM overlay
 * ```
 *
 * L4 is data-driven: adding a **new object class** is adding one `TileObjectSpec`
 * entry to {@link TILE_OBJECTS} — a data item, not scene logic, exactly as
 * requirement "one registry" intends. `board-view.ts` iterates this list and
 * never names a class.
 *
 * **Walls are the one stateful class and are deliberately not in this table.**
 * R-E6/R-E8: a wall tile is one persistent display object whose *state* swaps
 * `wall ↔ wallEcho ↔ wallOccupied` in place, staggered per tile during a flip, and
 * stacked inside the existing wall renderer. That per-tile transition state lives
 * in `renderer/wall-tiles.ts` + `renderer/objects/wall.ts`; the classification
 * itself (solid / ghost / occupied) is in `renderer/cell-state.ts`, which is the
 * `tileType` answer for a wall tile.
 *
 * Deliberately **not implemented** in this slice (structure without function):
 * - `door`   — M1, first authored at L6 (`docs/game-design.md` §5, §8); a spec
 *              entry here + a painter in `objects/` is the whole addition. No
 *              door/switch pairing visuals are drawn by this task (V0.5 of the
 *              pairing spec is owned by the UI / Art Director).
 * - `switch` — M3, ships with M1 as one unit.
 * - `portal` — M2, L11; `*Echo` portal tokens stay RESERVED (§3.1).
 * Each will also need its manifest row, which does not exist yet — nothing here
 * assumes an `assets/` path (AGENTS.md §8, `docs/assets/asset-manifest.md`).
 */

import type { Level } from "@/core/level";
import type { GameState, Vec } from "@/core/state/types";
import type { Rect } from "@/game/renderer/grid-mapping";
import { paintGoal, goalPulseScale } from "@/game/renderer/objects/goal";
import type { ThemeTokens } from "@/game/theme/tokens";

export type TileObjectKind = "goal";

export interface TileObjectPaintContext {
  readonly g: Phaser.GameObjects.Graphics;
  readonly rect: Rect;
  readonly tile: Vec;
  readonly cssScale: number;
  readonly theme: ThemeTokens;
  /** Scene time in ms — only the goal uses it (R-C8 pulse). */
  readonly timeMs: number;
}

export interface TileObjectSpec {
  readonly kind: TileObjectKind;
  /** Draw order inside L4; lower first. */
  readonly layer: number;
  /** `docs/assets/asset-manifest.md` Asset ID this class is waiting on. */
  readonly placeholder: string;
  /** Tiles of this class in the level, in the current state. */
  readonly tilesOf: (level: Level, gs: GameState) => readonly Vec[];
  readonly paint: (ctx: TileObjectPaintContext) => void;
}

const GOAL: TileObjectSpec = {
  kind: "goal",
  layer: 10,
  // DEV PLACEHOLDER — A-06 goal
  placeholder: "goal",
  tilesOf: (level) => [{ x: level.goal[0], y: level.goal[1] }],
  paint: (ctx) =>
    paintGoal({
      g: ctx.g,
      rect: ctx.rect,
      cssScale: ctx.cssScale,
      theme: ctx.theme,
      pulseScale: goalPulseScale(ctx.timeMs),
    }),
};

/** Every non-wall tile-object class the board can draw. Add an entry, not a branch. */
export const TILE_OBJECTS: readonly TileObjectSpec[] = [GOAL];