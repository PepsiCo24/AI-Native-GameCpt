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
 * **Within L4 the stack is §3.1d's, and it lives here as data** (V0.6, R-Z1):
 * `portal < switch < goal < wall < door` — blockers draw **above** the goal, so a
 * ring can never sit on a solid wall and promise a win the rules refuse (R-Z3).
 * {@link L4_ORDER} is that total order, {@link L4_SLOT} its numeric slot per
 * class, and `TileObjectSpec.layer` carries the slot — the container depth in
 * `board-view.ts` is derived from it, never written as a literal. There is **no**
 * per-cell or per-frame z-sorting anywhere: adding a class is adding a slot
 * value, adding a class *before* an existing one is renumbering this table once.
 *
 * Caveat the table exists to make explicit: precedence assigns the **wall class**
 * a slot, it does not give walls a second renderer — the wall is the one stateful
 * class (see above), so it takes `L4_SLOT.wall` directly instead of an entry.
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

/**
 * `docs/ui-ux.md` §3.1d — the single-cell appearance precedence within L4,
 * **bottom → top**: `portal < switch < goal < wall < door`.
 *
 * The literal is the contract; {@link L4_SLOT} carries the numbers and is
 * checked against it (`satisfies` at compile time, `assertLayerOrder` at boot),
 * so a typo cannot silently invert two classes. `wall` is in the table because
 * §3.1d's order is a statement about *classes* — the wall simply has no
 * `TileObjectSpec` (R-E6/R-E8: it is the one stateful class).
 */
export const L4_ORDER = ["portal", "switch", "goal", "wall", "door"] as const;

export type L4Class = (typeof L4_ORDER)[number];

/**
 * The numeric L4 slot of each class — the rank **is** the number, and the rank
 * ascends in {@link L4_ORDER}. `TileObjectSpec.layer` takes one of these values;
 * `board-view.ts` turns a slot into a container depth (`L4_DEPTH_BASE + slot`).
 *
 * The total order is fixed and complete: inserting a class means renumbering this
 * table once (a data edit), never "finding room" between two numbers.
 */
export const L4_SLOT = {
  portal: 1,
  switch: 2,
  goal: 3,
  wall: 4,
  door: 5,
} as const satisfies Readonly<Record<L4Class, number>>;

export type L4Slot = (typeof L4_SLOT)[L4Class];

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
  /**
   * §3.1d slot (a {@link L4_SLOT} value, never a bare literal): lower draws
   * first. Two specs sharing one slot keep **level-data declaration order**
   * (R-Z4) — they land in the same container, in {@link TILE_OBJECTS} order.
   */
  readonly layer: L4Slot;
  /** `docs/assets/asset-manifest.md` Asset ID this class is waiting on. */
  readonly placeholder: string;
  /** Tiles of this class in the level, in the current state. */
  readonly tilesOf: (level: Level, gs: GameState) => readonly Vec[];
  readonly paint: (ctx: TileObjectPaintContext) => void;
}

const GOAL: TileObjectSpec = {
  kind: "goal",
  // §3.1d — above the modifiers (portal/switch), **below the blockers** (wall/
  // door): R-Z3, the ring never draws over a solid wall / closed door.
  layer: L4_SLOT.goal,
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

/**
 * Every non-wall tile-object class the board can draw. Add an entry, not a branch.
 * Declaration order is the R-Z4 tie-break **within** one slot; across slots the
 * order is §3.1d's and comes from `layer`, not from this list's order.
 */
export const TILE_OBJECTS: readonly TileObjectSpec[] = [GOAL];