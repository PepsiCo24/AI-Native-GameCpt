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
 * ── The per-tile transition a painter is handed (V0.7) ───────────────────────
 * Every non-wall class is painted **statelessly** from `(level, gs, transition)`:
 * a painter re-reads the object at its own tile (via `cell-state.ts`, which reads
 * the *resolved* `doorsOpen` / `switchesOn` records, never a rule of its own) and
 * mixes the *previous* state's value into the current one. That is the R-E6/R-D8
 * pattern generalised: no per-class view object, no sprite created or destroyed by
 * a flip, and one scalar recomputed from §6.2's timing table per frame. §6.2 gives
 * three rows these classes ride:
 *
 * | row | window | carries |
 * |---|---|---|
 * | `walls` (eased, staggered ≤ 15 ms by distance) | 80–200 ms | door bar retract/extend (R-D3), portal token + swirl swap (R-E6 pattern), switch on/off dot |
 * | `occupied` (raw progress) | 140–220 ms | R-D7's occupied-door interior drop; the M3 press beat (`objects/switch.ts`, extension 2) |
 *
 * There is deliberately **no `swapRow` field** on the spec: the door is one class
 * whose §6.2 timing needs *two* rows at once (its bars ride `walls` while the
 * `*Occupied` drop rides `occupied` — R-D3 vs R-D7), so a per-spec row indirection
 * could not express it. The row is documented per painter instead, and both mixes
 * are cheap scalars the board computes once per tile.
 *
 * Deliberately **not implemented** in this slice: nothing at L4. `goal`, `door`,
 * `switch` and `portal` all have a painter now; `player` is L5, not L4.
 */

import type { Level } from "@/core/level";
import { doorAt } from "@/core/rules/solid";
import type { GameState, Vec } from "@/core/state/types";
import {
  doorIsOccupiedNow,
  doorIsOpenNow,
  doorTilesOf,
  portalIsActive,
  portalLivePhase,
  portalTilesOf,
  switchDefAt,
  switchIsOn,
  switchTilesOf,
} from "@/game/renderer/cell-state";
import type { Rect } from "@/game/renderer/grid-mapping";
import { easeOutQuad } from "@/game/renderer/objects/actor";
import { doorLook, paintDoor } from "@/game/renderer/objects/door";
import { goalPulseScale, paintGoal } from "@/game/renderer/objects/goal";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { paintPortal, portalLook } from "@/game/renderer/objects/portal";
import { paintSwitch, switchLook, switchPressEmphasis } from "@/game/renderer/objects/switch";
import { portalSlotFor } from "@/game/theme/assets";
import type { ThemeTokens } from "@/game/theme/tokens";

export type TileObjectKind = "goal" | "door" | "switch" | "portal";

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

/**
 * §6.2's per-tile transition, resolved by `board-view.ts` for the frame being
 * painted. Both mixes are 1 on a settled board, so a painter's formula needs no
 * "is a flip running?" branch: `mix(from, to, 1) === to`.
 */
export interface TileObjectTransition {
  /**
   * The state shown **before** the running flip, or `null` when the board is
   * settled. A painter reads its own object's previous value from here (door
   * openness, switch latch, portal activity) — the view keeps no per-class state.
   */
  readonly prev: GameState | null;
  /** §6.2 `walls` row (80–200 ms, 120 ms, stagger ≤ 15 ms by distance), eased. */
  readonly objectMix: number;
  /** §6.2 `occupied` row (140–220 ms, 80 ms), **raw** progress 0→1. */
  readonly occupied: number;
}

export interface TileObjectPaintContext {
  readonly g: Graphics2D;
  readonly rect: Rect;
  /** R-L3 cell corner radius (device px) — the same value the wall painter gets. */
  readonly radius: number;
  readonly tile: Vec;
  readonly cssScale: number;
  readonly theme: ThemeTokens;
  /** Scene time in ms — **only** the goal uses it (R-C8 pulse; the one idle animation). */
  readonly timeMs: number;
  /** The level, so a painter can look up which door/switch/portal its tile is. */
  readonly level: Level;
  /** The committed state being shown (the animation target, never a predicted one). */
  readonly gs: GameState;
  readonly transition: TileObjectTransition;
  /** The tile's own cell ground — the target of every glyph knockout (R-D3). */
  readonly knockout: number;
  /**
   * The delivered-art seam (R-005a), or `undefined` when the caller has no art
   * registry — a painter must treat that as "nothing is mounted" and draw its
   * vector placeholder. See {@link TileObjectArtPort}.
   */
  readonly art?: TileObjectArtPort;
}

/**
 * Delivered art, as an L4 painter may use it (§11/R-P5, R-005a).
 *
 * A painter draws into a `Graphics2D`, which cannot draw a texture — so the split
 * is: the **painter** owns the footprint rule (centre, size, idle pulse) and the
 * **view** owns the `Phaser.GameObjects.Image`. `draw` is the one call that hands
 * the resolved geometry over, `has` is what keeps the texture and the vector
 * placeholder from ever drawing on top of each other.
 *
 * Keys are manifest export names resolved through `theme/assets.ts` (`slotKey`),
 * never a file path: a painter knows *which slot* it stands in for, nothing about
 * where the bytes live.
 */
export interface TileObjectArtPort {
  /**
   * `true` when the delivered texture for this key is mounted and can be drawn.
   *
   * Reads the **mount measurement** (`theme/art.ts` `isArtMounted`), not "is there
   * an image object": the portal pair needs one image *per end* ({@link ArtDrawOptions}
   * `instance`), so the map is keyed by instance and a plain key lookup would answer
   * "no art" for a portal whose texture is perfectly mounted.
   */
  has(textureKey: string): boolean;
  /**
   * Place the mounted texture for `textureKey` with its form centred on (`cx`,
   * `cy`) and `w × h` device px. A no-op for a key that is not mounted, so a
   * painter may call it after `has` without a second branch.
   */
  draw(textureKey: string, cx: number, cy: number, w: number, h: number, opts?: ArtDrawOptions): void;
}

/**
 * Per-frame presentation for a delivered form — the **transform-only** half of the
 * §6.6 beats (R-M2): alpha and (for a shared key) which instance. Neither is a colour
 * or a redraw, so a painter can animate a signed raster without violating
 * R-PM2/R-PM4.
 */
export interface ArtDrawOptions {
  /** Alpha of the delivered form — the §6.2 cross-fade; never a dimmed live figure. */
  readonly alpha?: number;
  /**
   * Display-object instance key when **two ends share one texture key** (the portal
   * pair, §3.1e): the view registers one image per end under `${textureKey}@${x},${y}`
   * and this selects which. Absent ⇒ the slot's single image (the goal).
   */
  readonly instance?: string;
}

export interface TileObjectSpec {
  readonly kind: TileObjectKind;
  /**
   * §3.1d slot (a {@link L4_SLOT} value, never a bare literal): lower draws
   * first. Two specs sharing one slot keep **level-data declaration order**
   * (R-Z4) — they land in the same container, in {@link TILE_OBJECTS} order.
   */
  readonly layer: L4Slot;
  /**
   * `docs/assets/asset-manifest.md` Asset ID this class is waiting on.
   *
   * **Absent = vector-by-design, not "forgotten"**: §9.1 makes the door (all three
   * states), the switch and every occupied treatment vector-by-design with *no*
   * asset requested, so they must **not** carry a placeholder id — a placeholder
   * here would claim art the manifest never asked for (`PLACEHOLDER_TO_ASSET`).
   */
  readonly placeholder?: string;
  /**
   * Tiles of this class in the level, in level-data declaration order (R-Z4).
   *
   * A **pure projection of the level**: it takes no `GameState`, because a flip can
   * never change which tiles carry an object (R-E6/R-D8 — the object is created at
   * layout time and swaps its look in place). It used to accept `gs` and ignore it;
   * the regression test that used to police that was testing the absence of a
   * parameter, so the parameter is gone and the memo below pins the real property
   * (one array per level, not one per frame).
   */
  readonly tilesOf: (level: Level) => readonly Vec[];
  readonly paint: (ctx: TileObjectPaintContext) => void;
}

/**
 * Memoise a class's tile list per level.
 *
 * `paintTileObjects` calls `tilesOf` once per spec **per frame**, so a fresh array
 * each call is four allocations per frame for information that cannot change. The
 * cache is a `WeakMap` keyed by the level object, so it keeps no level alive and
 * cannot leak across a level switch, and the result is frozen because the array is
 * now shared by every caller: a painter that mutated its tile list would corrupt the
 * board, not just its own frame.
 */
function memoTiles(project: (level: Level) => readonly Vec[]): (level: Level) => readonly Vec[] {
  const cache = new WeakMap<Level, readonly Vec[]>();
  return (level) => {
    const cached = cache.get(level);
    if (cached !== undefined) return cached;
    const tiles: readonly Vec[] = Object.freeze(
      project(level).map((tile) => Object.freeze({ x: tile.x, y: tile.y })),
    );
    cache.set(level, tiles);
    return tiles;
  };
}

/** `mix(from, to, t)` — the §6.2 cross-fade, in one place. */
function mix(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

const GOAL: TileObjectSpec = {
  kind: "goal",
  // §3.1d — above the modifiers (portal/switch), **below the blockers** (wall/
  // door): R-Z3, the ring never draws over a solid wall / closed door.
  layer: L4_SLOT.goal,
  // DEV PLACEHOLDER — A-06 goal
  placeholder: "goal",
  tilesOf: memoTiles((level) => [{ x: level.goal[0], y: level.goal[1] }]),
  paint: (ctx) =>
    paintGoal({
      g: ctx.g,
      rect: ctx.rect,
      cssScale: ctx.cssScale,
      theme: ctx.theme,
      pulseScale: goalPulseScale(ctx.timeMs),
      // R-005a — the delivered annulus draws through the view's art port when it is
      // mounted; absent (a caller with no art registry, e.g. a unit test) means the
      // vector ring + dot, which is exactly the degrade path.
      art: ctx.art,
    }),
};

/**
 * Doors (§3.1b) — vector-by-design, no Asset ID (§9.1).
 *
 * Two §6.2 rows at once, which is why the spec carries no `swapRow`:
 * - `retract` (bar mass, R-D2/R-D3) rides the `walls` row, **staggered** by
 *   distance like every other state swap;
 * - `occupant` (R-D7's `*Occupied` interior drop) rides the `occupied` row — the
 *   flip's *resolution* beat, the same one that fires the phase ring, because it
 *   describes the player's own tile.
 *
 * Both ends come from resolved state (`doorsOpen` — a literal `true` means open) and
 * the previous state, never from a re-derivation of the door rule.
 *
 * The door's **colour** rides neither of those rows: `obj.doorRed` / `obj.doorBlue`
 * (and their `*Occupied` variants) are **per-phase values** (R-C10 — same hue family,
 * value and temperature flip with the phase), read from `ctx.theme`, i.e. §6.2's
 * `tokens` row on the global, unstaggered beat. R-C10 does **not** mean "same value in
 * both phases"; mixing the token into `objectMix` instead would fade a door's ink on
 * the wall's staggered curve and desynchronise it from the ground it stands on.
 */
const DOOR: TileObjectSpec = {
  kind: "door",
  layer: L4_SLOT.door,
  tilesOf: memoTiles((level) => doorTilesOf(level).map((entry) => entry.tile)),
  paint: (ctx) => {
    const door = doorAt(ctx.level, ctx.tile);
    if (door === undefined) return; // unreachable: the tile list comes from the same data

    const openNow = doorIsOpenNow(ctx.level, ctx.gs, ctx.tile);
    const prev = ctx.transition.prev;
    const openBefore = prev !== null && doorIsOpenNow(ctx.level, prev, ctx.tile);

    // R-C13.7 — one code path for the "occupied" flag: `cell-state.ts`'s tile-scoped
    // predicate, asked separately of the state being shown and of the previous one
    // (never carried, never re-derived from `(colour, phase, switches)` here).
    const occupiedNow = doorIsOccupiedNow(ctx.level, ctx.gs, ctx.tile);
    const occupiedBefore = prev !== null && doorIsOccupiedNow(ctx.level, prev, ctx.tile);

    paintDoor({
      g: ctx.g,
      rect: ctx.rect,
      radius: ctx.radius,
      cell: Math.min(ctx.rect.w, ctx.rect.h),
      cssScale: ctx.cssScale,
      knockout: ctx.knockout,
      look: doorLook(
        ctx.theme,
        door.color,
        mix(openBefore ? 1 : 0, openNow ? 1 : 0, ctx.transition.objectMix),
        mix(occupiedBefore ? 1 : 0, occupiedNow ? 1 : 0, easeOutQuad(ctx.transition.occupied)),
      ),
    });
  },
};

/**
 * Switches (M3) — vector-by-design, no Asset ID (§9.1).
 *
 * The on/off dot cross-fades on the `walls` row (a state swap, R-E6's row); the
 * press beat is a **one-shot** on the `occupied` row and only when this very move
 * toggled the latch, so a settled board can never show it (R-C8: the goal is the
 * only idle animation). See `objects/switch.ts` for the two spec-silent extensions.
 */
const SWITCH: TileObjectSpec = {
  kind: "switch",
  layer: L4_SLOT.switch,
  tilesOf: memoTiles((level) => switchTilesOf(level).map((entry) => entry.tile)),
  paint: (ctx) => {
    const sw = switchDefAt(ctx.level, ctx.tile);
    if (sw === undefined) return; // unreachable, as above

    const onNow = switchIsOn(ctx.gs, sw);
    const prev = ctx.transition.prev;
    const onBefore = prev !== null && switchIsOn(prev, sw);
    const toggled = prev !== null && onNow !== onBefore;

    paintSwitch({
      g: ctx.g,
      rect: ctx.rect,
      cell: Math.min(ctx.rect.w, ctx.rect.h),
      cssScale: ctx.cssScale,
      knockout: ctx.knockout,
      look: switchLook(
        ctx.theme,
        sw.activePhase,
        mix(onBefore ? 1 : 0, onNow ? 1 : 0, ctx.transition.objectMix),
        toggled ? switchPressEmphasis(ctx.transition.occupied) : 0,
      ),
    });
  },
};

/**
 * Portals (M2 / L36) — §3.1c's state channel, plus §3.1e's live raster mount
 * (GAME-003): the live figure is the signed A-06 raster, the dormant figure the
 * §3.1c vector outline. §3.1c's primary channel is swirl presence/absence, so the
 * mix feeds the live raster's alpha (which bakes the swirl) and the vector's own
 * alpha (the dormant half), and the vector's swirl arc is suppressed whenever the
 * raster is drawing.
 */
const PORTAL: TileObjectSpec = {
  kind: "portal",
  layer: L4_SLOT.portal,
  tilesOf: memoTiles((level) => portalTilesOf(level).map((entry) => entry.tile)),
  paint: (ctx) => {
    const prev = ctx.transition.prev;
    const activeNow = portalIsActive(ctx.level, ctx.gs, ctx.tile);
    const activeBefore = prev !== null && portalIsActive(ctx.level, prev, ctx.tile);

    // §3.1e R-PM1 — the live raster's key is this end's **own** `activePhase` mapped
    // through the measured table (`portalSlotFor`), never the `_a`/`_b` suffix of the
    // board phase. `undefined` when the tile has no portal or the row is absent.
    const livePhase = portalLivePhase(ctx.level, ctx.tile);
    const liveKey = livePhase === undefined ? undefined : portalSlotFor(livePhase)?.assetName;

    paintPortal({
      g: ctx.g,
      rect: ctx.rect,
      cell: Math.min(ctx.rect.w, ctx.rect.h),
      cssScale: ctx.cssScale,
      look: portalLook(
        ctx.theme,
        mix(activeBefore ? 1 : 0, activeNow ? 1 : 0, ctx.transition.objectMix),
      ),
      art: ctx.art,
      liveKey,
      // The pair shares one texture key per phase, so each end needs its own instance
      // key (`${key}@${x},${y}`) — the same string `board-view.ts` registers the image
      // under. Never a per-end marker graphic (R-PM4): an instance key is data.
      instance: liveKey === undefined ? undefined : `${liveKey}@${ctx.tile.x},${ctx.tile.y}`,
    });
  },
};

/**
 * Every non-wall tile-object class the board can draw. Add an entry, not a branch.
 * Declaration order is the R-Z4 tie-break **within** one slot; across slots the
 * order is §3.1d's and comes from `layer`, not from this list's order.
 *
 * The list is complete by construction: `TileObjectKind` has four members, each has
 * exactly one spec here, and `L4_ORDER` minus `wall` is exactly these four — so the
 * registry-completeness test is a real gate on a future fifth class, not a
 * restatement of this file.
 */
export const TILE_OBJECTS: readonly TileObjectSpec[] = [PORTAL, SWITCH, GOAL, DOOR];