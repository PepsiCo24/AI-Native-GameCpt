/**
 * Board view — the whole Canvas side of `docs/ui-ux.md` §7.1.
 *
 * Owns: page/background, board plate, cell plates + grid, L4 objects
 * (walls + ghosts + occupied walls, then every registry class — portal, switch,
 * goal, door), L5 actor, L6 cell feedback (hover ring), L7 win tint. Owns **no
 * text, no button, no dialog** — every one of those is DOM (`src/game/hud/**`), so
 * canvas text at mobile DPR never exists.
 *
 * Fixed layer stack, §5.2 (`L1` is left empty today: background art is not
 * delivered, so the page ground is painted flat — see `paintGround`):
 *
 * ```
 * L0 pageGround   [L1 backgroundImage — DEV PLACEHOLDER, flat ground.page]
 * L2 boardPlate   L3 cellPlate + grid   L4 objects   L5 actor (player)
 * L6 cellFeedback L7 plateTint (win)
 * ```
 *
 * **Within L4 the stack is §3.1d's, and it is data** (R-Z1):
 * `portal < switch < goal < wall < door` — blockers above the goal, so a goal
 * ring can never sit on a solid wall and promise a win the rules refuse (R-Z3).
 * L4 container depths are `L4_DEPTH_BASE + slot` with `slot` read from the
 * registry's `L4_SLOT` table: adding a class adds a registry entry, never a
 * branch, and there is no per-cell / per-frame z work anywhere. `assertLayerOrder`
 * checks the one total order plus R-C13.1 at boot. The wall is the one stateful
 * class, so it has no registry entry and takes `L4_SLOT.wall` directly.
 *
 * Animation model (§6.4 — the load-bearing decision in this file):
 * **animation is a view of state, never a source of it.** The scene commits the
 * new `GameState` first and then asks this view to catch up. Every transition is
 * driven by one scalar recomputed from the timing table in `update()` — no Phaser
 * tween queue, so a new move arriving mid-flip cannot desync: the new flip starts
 * from the **previous target** and the running one is dropped (snap-to-target,
 * queue depth = 1). Fast repeated taps therefore always end on exactly the
 * committed `GameState` (§6.4 regression property).
 *
 * R-E6: a flip never creates or destroys a wall object — `WallTileView` swaps the
 * look of an existing tile **in place**.
 *
 * Which rows of §6.2's table this file drives (Variant S's numbers; the table is
 * the source of truth, never a literal here):
 *
 * | §6.2 window | row | owner |
 * |---|---|---|
 * | 0–130 ms | `hop` | `paintActor` (arc + landing squash) |
 * | 60–200 ms | `tokens` | `tokenMix()` → ground, plate, grid, goal, hover, win tint |
 * | 80–200 ms | `walls` | `WallTileView.transitionTo` (staggered ≤ 15 ms), and `objectMixFor()` — the door bars, switch dot and portal swirl cross-fade on the **same** row |
 * | 100–220 ms | `background` | `paintGround` (placeholder: the page ground) |
 * | 140–220 ms | `occupied` (+ `ring`) | the player's own tile: `obj.wallOccupied` / the R-D7 occupied door, `fx.phaseRing`, and M3's press beat |
 * | 140–220 ms | `chip` | DOM (`hud.ts`, CSS vars from the same table) |
 *
 * The `occupied` row is why the player's tile is scheduled **separately** from
 * the other walls: R-C13.2's interior drop and the one-shot `fx.phaseRing` are
 * the flip's *resolution* beat (land → the wall closes around me), not part of
 * the bulk state swap. Both live inside the ≤ 220 ms budget with 0 ms input lock
 * (R-C13.5). R-D7 keeps that beat meaningful for doors: standing inside a closed
 * door is a legal state, so `isPlayerEmbedded` covers both classes and the same
 * one-shot ring fires (`flip.ring`) — **no new layer**, the ring is drawn behind
 * the body inside the existing actor container (R-Z7/V0.7).
 */

import Phaser from "phaser";
import type { Level } from "@/core/level";
import { isPlayerEmbedded } from "@/core/rules/solid";
import type { Direction } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import type { GameState, Vec } from "@/core/state/types";
import { isPlayerAt, wallRenderState, wallTilesOf } from "@/game/renderer/cell-state";
import type { WallTile } from "@/game/renderer/cell-state";
import {
  cellAtPoint,
  cellCenter,
  cellRect,
  cellSizeCss,
  cellSurface,
  computeLayout,
  isAltCell,
} from "@/game/renderer/grid-mapping";
import type { BoardLayout, Viewport } from "@/game/renderer/grid-mapping";
import {
  actorLook,
  ACTOR_ART_BOX,
  easeOutQuad,
  hopArcOffset,
  landingSquash,
  lerpActorLook,
  paintActor,
  paintActorOverlay,
} from "@/game/renderer/objects/actor";
import type { ActorPaintContext } from "@/game/renderer/objects/actor";
import { L4_SLOT, TILE_OBJECTS } from "@/game/renderer/objects/registry";
import type {
  L4Slot,
  TileObjectArtPort,
  TileObjectSpec,
  TileObjectTransition,
} from "@/game/renderer/objects/registry";
import {
  assertLayerOrder,
  assertLayerStack,
  l4Depth,
  LAYER_DEPTH,
} from "@/game/renderer/layers";
import type { ObservedLayer } from "@/game/renderer/layers";
import { mixTheme } from "@/game/renderer/theme-mix";
import { WallTileView, staggerFor } from "@/game/renderer/wall-tiles";
import { isArtMounted, slotKey } from "@/game/theme/art";
import { portalSlotFor } from "@/game/theme/assets";
import { flipTimings, theme, toInt } from "@/game/theme/tokens";
import type { FlipTimings, ThemeTokens } from "@/game/theme/tokens";

/* ────────────────────────────────────────────────────────────────────────────
 * The delivered textures this view draws, by manifest export name (§11/R-P5 +
 * `theme/art.ts`). Read once at module load: a slot name that does not exist in
 * `PLACEHOLDER_SLOTS` is a static mistake, and `slotKey` fails loudly instead of
 * handing a painter an `undefined` key that would silently never mount.
 * ──────────────────────────────────────────────────────────────────────────── */
const SPIRIT_A_KEY = slotKey("echo_spirit_a");
const SPIRIT_B_KEY = slotKey("echo_spirit_b");
const BG_A_KEY = slotKey("bg_phase_a");
const BG_B_KEY = slotKey("bg_phase_b");
const GOAL_KEY = slotKey("goal");

/**
 * The drawn weight of **Phase B** in a pair of stacked sprites: `0` = pure A,
 * `1` = pure B, and every value between is the §6.2 cross-fade.
 *
 * The stacking rule this implements is the one thing a cross-dissolve gets wrong
 * if it is written naively. Fading *both* sprites (`α_A = 1 - w`, `α_B = w`) leaks
 * the board through the actor at `w = 0.5` — compositing is `B·α_B + A·α_A·(1-α_B)
 * + backdrop·(1-α_A)(1-α_B)`, i.e. 50 %/25 %/25 %. Drawing **A opaque at the
 * bottom and fading only B in on top** is exact: `B·w + A·(1 - w)` for every `w`,
 * with no backdrop term. The A/B pair sharing a byte-identical alpha mask
 * (audit R-T04) is what makes that a true colour cross-fade rather than a
 * silhouette blend — and it is the same arithmetic the old disc got from
 * `lerpActorLook`: one scalar, `mix(from, to, t)`.
 */
function phaseWeight(from: Phase, to: Phase, mix: number): number {
  const b = (phase: Phase): number => (phase === "B" ? 1 : 0);
  return b(from) + (b(to) - b(from)) * mix;
}

/**
 * §5.2 cross-layer depths (bottom → top), **read from the one stack table in
 * `renderer/layers.ts`** — never re-typed here. `backgroundImage` (5) is reserved
 * for the A-04/A-05 art and has no object yet; `boardPlate` (20) and `cellPlate`
 * (20) share one container (the plate is filled first, then the grid and the cell
 * plates — `paintGround`), which is why the table groups them.
 *
 * **The cross-layer order is fixed by §5.2; the order *within* L4 is §3.1d's** —
 * and it is data, not a literal here: `l4Depth(slot)` with `slot` from the
 * registry's `L4_SLOT`, so the picture order can only ever be the one §3.1d
 * table (R-Z1: one ordered table, no per-tile / per-frame z-sorting). The
 * arithmetic and the boot guards live in `renderer/layers.ts` as a pure module.
 */
const DEPTH = LAYER_DEPTH;

/** An L4 container plus the §3.1d slot it was created for. */
interface L4Container {
  readonly slot: L4Slot;
  readonly gfx: Phaser.GameObjects.Graphics;
}

/** A registry painter and the L4 container its §3.1d slot owns. */
interface L4Painter {
  readonly spec: TileObjectSpec;
  readonly gfx: Phaser.GameObjects.Graphics;
}

/** R-T6 hover ring: 2 px `accent`, desktop only (touch has none). */
const HOVER_STROKE_CSS = 2;

interface FlipAnimation {
  readonly startAt: number;
  readonly fromPhase: Phase;
  readonly hopFrom: Vec;
  /** R-C13.4 — fire the one-shot `fx.phaseRing` (the flip solidified the tile under the player). */
  readonly ring: boolean;
  readonly timings: FlipTimings;
}

interface DenyAnimation {
  readonly startAt: number;
  readonly dir: Direction;
}

interface ShownState {
  readonly phase: Phase;
  readonly player: Vec;
}

export interface BoardViewConfig {
  readonly scene: Phaser.Scene;
  readonly level: Level;
  readonly renderScale: number;
  readonly reducedMotion: boolean;
}

function progress(time: number, startAt: number, duration: number): number {
  if (duration <= 0) return 1;
  return Math.min(1, Math.max(0, (time - startAt) / duration));
}

function deltaOf(dir: Direction): Vec {
  if (dir === "up") return { x: 0, y: -1 };
  if (dir === "down") return { x: 0, y: 1 };
  if (dir === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

export class BoardView {
  private readonly scene: Phaser.Scene;
  private readonly level: Level;
  private readonly renderScale: number;
  /**
   * §6.4: live OS preference. Mutable because the platform can change it while the
   * game runs (`env.onReducedMotionChange`) and the *next* flip must honour it —
   * `flipTimings()` is re-read on every animation, so no view rebuild is needed.
   */
  private reducedMotion: boolean;
  private readonly onLayout: ((cellSizeCss: number) => void) | undefined;

  private layout: BoardLayout;
  private readonly wallTiles: readonly WallTile[];
  private walls: readonly WallTileView[];

  private readonly pageGfx: Phaser.GameObjects.Graphics;
  private readonly plateGfx: Phaser.GameObjects.Graphics;
  /**
   * L1 `backgroundImage` (§5.2, depth 5): the delivered A-04/A-05 plates, cover-fit
   * to the play area and alpha cross-dissolved on §6.2's `background` row. `null`
   * per phase when that file did not mount — the page ground underneath is the
   * documented fallback, never a blank or a black frame.
   */
  private readonly backgroundArt: {
    readonly A: Phaser.GameObjects.Image | null;
    readonly B: Phaser.GameObjects.Image | null;
  };
  /** §3.1d slot `wall` — the one stateful L4 class, so it owns its container (R-E6/R-E8). */
  private readonly wallGfx: Phaser.GameObjects.Graphics;
  /** Every L4 container that exists today, with the §3.1d slot it was created for. */
  private readonly l4Containers: readonly L4Container[];
  /** The registry seam: each painter and the L4 container its slot owns. */
  private readonly l4Painters: readonly L4Painter[];
  /**
   * Delivered art drawn at L4 (R-005a), keyed by **the single image's slot** or —
   * for a class whose two instances share one texture key — by
   * `${textureKey}@${x},${y}` (the portal pair, §3.1e). Created once when the
   * texture mounted and destroyed with the view. An empty map is the pre-integration
   * state, not an error — every painter then draws its vector placeholder exactly as
   * it did before.
   */
  private readonly l4Art = new Map<string, Phaser.GameObjects.Image>();
  /**
   * The port every L4 painter receives (`objects/registry.ts`): the painter resolves
   * the geometry, this view owns the display object. `has` is what makes the texture
   * and the vector placeholder mutually exclusive rather than layered — it asks the
   * **mount measurement** (`isArtMounted`), because the portal pair is keyed per end
   * and a plain key lookup would answer "no art" for a mounted portal.
   */
  private readonly artPort: TileObjectArtPort = {
    has: (key) => isArtMounted(key),
    draw: (key, cx, cy, w, h, opts) => {
      // The per-end instance when one is named (the portal pair), else the slot's one
      // image (the goal). A no-op for an unmounted key, and a resize **in place** for
      // a mounted one: the goal's R-C8 pulse is a per-frame `setDisplaySize`, never a
      // new object. Alpha is the live half of the §3.1e in-place swap (R-PM2).
      const image =
        opts?.instance === undefined ? this.l4Art.get(key) : this.l4Art.get(opts.instance);
      if (image === undefined) return;
      image.setPosition(cx, cy).setDisplaySize(w, h);
      image.setAlpha(opts?.alpha ?? 1);
    },
  };
  /**
   * L5 `actor` — **one** container, so the three-way order inside the actor is a
   * data fact (child order) rather than a depth coincidence: phase ring +
   * fallback body, then the delivered forms, then the identity ring + deny arc.
   * See `objects/actor.ts` for why each half sits where it does.
   */
  private readonly actorRoot: Phaser.GameObjects.Container;
  /** Below the body: R-C13.4's one-shot phase ring and the vector body fallback. */
  private readonly actorGfx: Phaser.GameObjects.Graphics;
  /** The delivered A/B forms, or `null` when that file did not mount. */
  private readonly spiritArt: {
    readonly A: Phaser.GameObjects.Image | null;
    readonly B: Phaser.GameObjects.Image | null;
  };
  /** Above the body (radially outside it): R-C9's identity ring and §6.5's deny arc. */
  private readonly actorOverlayGfx: Phaser.GameObjects.Graphics;
  private readonly feedbackGfx: Phaser.GameObjects.Graphics;
  private readonly tintGfx: Phaser.GameObjects.Graphics;

  /** The state the view has been told to show (the animation target). */
  private shown: ShownState;
  /** Last committed state — the goal's `tilesOf` seam and the wall views read it. */
  private lastState: GameState;
  /**
   * The state shown **before** the running flip, or `null` on a settled board —
   * the `prev` of §6.2's per-tile cross-fade (`TileObjectTransition`). Without it
   * the doors, switches and portals would pop at the phase change instead of
   * swapping in place (R-E6/R-D8's "never created or destroyed by a flip").
   */
  private prevState: GameState | null = null;

  private flip: FlipAnimation | null = null;
  private deny: DenyAnimation | null = null;
  private winAt: number | null = null;
  private hover: Vec | null = null;

  private groundDirty = true;
  private wallsDirty = true;
  private feedbackDirty = true;

  constructor(
    config: BoardViewConfig,
    initial: GameState,
    viewport: Viewport,
    onLayout?: (cellSizeCss: number) => void,
  ) {
    this.scene = config.scene;
    this.level = config.level;
    this.renderScale = config.renderScale;
    this.reducedMotion = config.reducedMotion;
    this.onLayout = onLayout;

    const s = this.scene;
    this.pageGfx = s.add.graphics().setDepth(DEPTH.pageGround);

    // L1 — the delivered background plates, created once at their own depth and
    // never re-created by a flip (R-E6's pattern one layer down): a phase change
    // is an *alpha* on the two existing objects, not a new sprite.
    const backgroundArt = {
      A: this.createArtImage(BG_A_KEY, DEPTH.backgroundImage),
      B: this.createArtImage(BG_B_KEY, DEPTH.backgroundImage),
    };
    this.backgroundArt = backgroundArt;

    this.plateGfx = s.add.graphics().setDepth(DEPTH.boardPlate);

    // L4 — one container per registry painter, each at the depth of the §3.1d
    // slot its `layer` declares, plus the wall class's own container. There is no
    // per-tile and no per-frame z work anywhere: the order is decided once, here,
    // from the registry's slot table (R-Z1). Two specs that declare one slot share
    // one container and keep declaration order inside it (R-Z4).
    const containers: L4Container[] = [];
    const painters: L4Painter[] = [];
    const bySlot = new Map<L4Slot, Phaser.GameObjects.Graphics>();
    for (const spec of TILE_OBJECTS) {
      let gfx = bySlot.get(spec.layer);
      if (gfx === undefined) {
        gfx = s.add.graphics().setDepth(l4Depth(spec.layer));
        bySlot.set(spec.layer, gfx);
        containers.push({ slot: spec.layer, gfx });
      }
      painters.push({ spec, gfx });
    }
    this.l4Painters = painters;

    this.wallGfx = s.add.graphics().setDepth(l4Depth(L4_SLOT.wall));
    containers.push({ slot: L4_SLOT.wall, gfx: this.wallGfx });
    this.l4Containers = containers;

    // L4 slot `goal` (§3.1d rank 3) — the delivered A-06 annulus, created once at
    // the **slot's own depth**, so R-Z3 ("the ring never draws over a solid wall /
    // closed door") holds for the texture exactly as it holds for the vector ring:
    // `l4Depth(L4_SLOT.goal)` is the same number the goal's Graphics container got
    // above, and both blockers keep their higher slots. Created after that container
    // so that, at equal depth, an unmounted board and a mounted one differ only in
    // *what is drawn*, never in the order things are drawn in.
    const goalArt = this.createArtImage(GOAL_KEY, l4Depth(L4_SLOT.goal));
    if (goalArt !== null) this.l4Art.set(GOAL_KEY, goalArt);

    // L4 slot `portal` (§3.1d rank 1) — the signed A-06 raster pair (§3.1e). The two
    // ends of one pair share **one texture key per phase** (both live in the portal's
    // own `activePhase`), so the single-image-per-key map cannot place both: each end
    // gets its own instance under `${key}@${x},${y}`, at the slot's own depth (R-PM3:
    // §3.1d occlusion unchanged, actor always above). The dormant figure is the
    // §3.1c vector, drawn by the painter — never an image, never dimmed.
    for (const portal of this.level.portals) {
      const key = portalSlotFor(portal.activePhase)?.assetName;
      if (key === undefined || !isArtMounted(key)) continue;
      for (const [x, y] of portal.pair) {
        const image = this.scene.add
          .image(0, 0, key)
          .setOrigin(0.5, 0.5)
          .setDepth(l4Depth(L4_SLOT.portal));
        this.l4Art.set(`${key}@${x},${y}`, image);
      }
    }

    // L5 — one container at `DEPTH.actor`, children in the fixed order the actor's
    // own module documents. The container is what the §5.2 stack guard sees, and
    // what R-C13.1's "above every L4 layer" is asserted against.
    this.actorGfx = s.add.graphics();
    const spiritArt = {
      A: this.createArtImage(SPIRIT_A_KEY, 0),
      B: this.createArtImage(SPIRIT_B_KEY, 0),
    };
    this.spiritArt = spiritArt;
    this.actorOverlayGfx = s.add.graphics();
    const actorChildren: Phaser.GameObjects.GameObject[] = [this.actorGfx];
    if (spiritArt.A !== null) actorChildren.push(spiritArt.A);
    if (spiritArt.B !== null) actorChildren.push(spiritArt.B);
    actorChildren.push(this.actorOverlayGfx);
    this.actorRoot = s.add.container(0, 0, actorChildren).setDepth(DEPTH.actor);

    this.feedbackGfx = s.add.graphics().setDepth(DEPTH.cellFeedback);
    this.tintGfx = s.add.graphics().setDepth(DEPTH.plateTint);

    // §3.1d + R-C13.1 — fail loudly rather than quietly paint a picture that
    // contradicts the spec's one total order.
    assertLayerOrder(
      this.l4Containers.map((container) => ({
        slot: container.slot,
        depth: container.gfx.depth,
      })),
      this.actorRoot.depth,
    );

    // §5.2 — the same discipline one level up: the observed depths of the real
    // objects must be the spec's layer stack, checked against the one table in
    // `renderer/layers.ts` (L2/L3 share the plate's container on purpose). The
    // per-slot order *inside* L4 stays `assertLayerOrder`'s job above, which is
    // where the §3.1d arithmetic lives. The guard checks what was **created**,
    // never what is merely reserved — so `backgroundImage` is reported only when a
    // delivered plate actually mounted (with no art there is no object at depth 5,
    // and claiming one would make that row of the guard unfalsifiable).
    //
    // `objects` reports the depth of the **real bottom L4 container**, not the
    // constant `L4_DEPTH_BASE`: the base is a group marker and no object is ever
    // created at it, so passing the constant would make that row of the guard
    // unfalsifiable (`assertLayerStack` checks `LAYER_GROUP_BASE` rows as a range).
    const observed: readonly ObservedLayer[] = [
      { name: "pageGround", depth: this.pageGfx.depth },
      ...(this.backgroundArt.A === null && this.backgroundArt.B === null
        ? []
        : [{ name: "backgroundImage" as const, depth: DEPTH.backgroundImage }]),
      { name: "boardPlate", depth: this.plateGfx.depth },
      { name: "cellPlate", depth: this.plateGfx.depth },
      {
        name: "objects",
        depth: Math.min(...this.l4Containers.map((container) => container.gfx.depth)),
      },
      { name: "actor", depth: this.actorRoot.depth },
      { name: "cellFeedback", depth: this.feedbackGfx.depth },
      { name: "plateTint", depth: this.tintGfx.depth },
    ];
    assertLayerStack(observed);

    this.layout = computeLayout(this.level, viewport);
    this.wallTiles = wallTilesOf(this.level);
    this.shown = { phase: initial.phase, player: initial.playerPosition };
    this.lastState = initial;
    this.walls = this.buildWallViews(initial);
    onLayout?.(cellSizeCss(this.layout));
  }

  /** Release every display object of this level. The scene builds a fresh view per level. */
  destroy(): void {
    for (const gfx of [
      this.pageGfx,
      this.plateGfx,
      ...this.l4Containers.map((container) => container.gfx),
      this.feedbackGfx,
      this.tintGfx,
    ]) {
      gfx.destroy();
    }
    // The actor is one container and `Container.destroy` releases its children
    // (the ring graphics and the spirit images), so they are not listed twice.
    this.actorRoot.destroy();
    // L4's delivered art lives outside any container (it sits at the slot's own
    // depth), so it is released here rather than by a container destroy.
    for (const image of this.l4Art.values()) image.destroy();
    this.l4Art.clear();
    this.backgroundArt.A?.destroy();
    this.backgroundArt.B?.destroy();
  }

  /**
   * One delivered texture as a display object, or `null` when it did not mount.
   *
   * `null` is the degrade path and it is deliberately not an error: the caller's
   * painter then draws the vector placeholder it has always drawn (R-P2). Creating
   * the object only when the texture exists also keeps the §5.2 boot guard honest —
   * it asserts the depths that were *created*.
   */
  private createArtImage(
    textureKey: string,
    depth: number,
  ): Phaser.GameObjects.Image | null {
    if (!isArtMounted(textureKey)) return null;
    return this.scene.add.image(0, 0, textureKey).setOrigin(0.5, 0.5).setDepth(depth);
  }

  /* ── layout ─────────────────────────────────────────────────────────────── */

  /** §6.4 — reduced-motion changes take effect on the next flip. */
  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
  }

  /**
   * Device px → cell in the **currently laid out** board (R-T3 hit area, and the
   * hover lookup). Pure geometry: it answers "which tile is this finger over",
   * never "may the player move there" — that question belongs to the core reducer.
   */
  cellAt(px: number, py: number): Vec | null {
    return cellAtPoint(this.layout, px, py);
  }

  /** R-L7: recompute once per resize / orientation change, then repaint. */
  resize(viewport: Viewport): void {
    this.layout = computeLayout(this.level, viewport);
    this.walls = this.buildWallViews(this.lastState);
    this.onLayout?.(cellSizeCss(this.layout));
    this.groundDirty = true;
    this.wallsDirty = true;
    this.feedbackDirty = true;
  }

  private buildWallViews(gs: GameState): readonly WallTileView[] {
    const css = cellSizeCss(this.layout);
    const t = theme(gs.phase);
    const embedded = isPlayerEmbedded(this.level, gs);
    return this.wallTiles.map(
      (wall) =>
        new WallTileView(
          wall,
          wallRenderState(this.level, gs, wall.tile, embedded && isPlayerAt(gs, wall.tile)),
          gs.phase,
          t,
          css,
          this.renderScale,
        ),
    );
  }

  /* ── state → view ───────────────────────────────────────────────────────── */

  /** Paint a state instantly: level start, restart, undo, resize. */
  snapTo(gs: GameState): void {
    this.lastState = gs;
    this.flip = null;
    this.deny = null;
    this.winAt = null;
    // No flip ⇒ nothing to cross-fade from: every painter takes its "settled"
    // branch (`mix(from, to, 1) === to`), so undo/restart repaint exactly.
    this.prevState = null;
    this.shown = { phase: gs.phase, player: gs.playerPosition };
    const css = cellSizeCss(this.layout);
    const t = theme(gs.phase);
    const embedded = isPlayerEmbedded(this.level, gs);
    for (const wall of this.walls) {
      wall.snap(
        wallRenderState(this.level, gs, wall.tile, embedded && isPlayerAt(gs, wall.tile)),
        gs.phase,
        t,
        css,
        this.renderScale,
      );
    }
    this.groundDirty = true;
    this.wallsDirty = true;
    this.feedbackDirty = true;
  }

  /**
   * Animate the flip from the last shown state to `gs` (§6.2 sequence). The caller
   * has **already committed** `gs`; a flip arriving while another runs snaps the
   * previous one to its target first (§6.4).
   */
  animateTo(gs: GameState, time: number): void {
    const from = this.shown;
    // §6.2's per-tile cross-fade needs the state shown **before** this flip, so it
    // is captured before `lastState` advances. Note it is the previous flip's
    // *target* (not a progress-sampled value): §6.4's snap-to-target rule means a
    // move arriving mid-flip starts from the committed state, never from a
    // mid-animation hybrid — a painter's `prev` therefore always names a real
    // `GameState`, and `mix(from, to, 1) === to` holds on every settle.
    this.prevState = this.lastState;
    this.lastState = gs;
    this.shown = { phase: gs.phase, player: gs.playerPosition };

    // §6.4 — a new move supersedes a running refusal animation. The deny nudge is
    // the response to a *refused* input (no movement, no flip); letting it ride
    // along with a legal move would attribute the nudge to the wrong beat. Snap it
    // to its target (i.e. drop it), exactly like a running flip.
    this.deny = null;

    const timings = flipTimings(this.reducedMotion);
    const embedded = isPlayerEmbedded(this.level, gs);
    this.flip = {
      startAt: time,
      fromPhase: from.phase,
      hopFrom: from.player,
      ring: embedded,
      timings,
    };

    // R-E6 — in-place state swap, staggered ≤ 15 ms by distance from the move.
    const css = cellSizeCss(this.layout);
    const t = theme(gs.phase);
    for (const wall of this.walls) {
      const playerTile = isPlayerAt(gs, wall.tile);
      const state = wallRenderState(this.level, gs, wall.tile, embedded && playerTile);
      // §6.2 schedules the **player's own tile** on the `occupied` row (140–220),
      // not on the bulk `walls` row (80–200): R-C13.2's interior drop to
      // `obj.wallOccupied` plus its retained 2 px edge and the one-shot
      // `fx.phaseRing` are the flip's *resolution* beat — the wall closes around
      // the player after the hop lands. Every other changed tile keeps the
      // staggered bulk swap.
      const occupied = state === "occupied";
      const startAt = occupied
        ? time + timings.occupied.start
        : time +
          timings.walls.start +
          staggerFor(wall.tile, gs.playerPosition, timings.walls.stagger);
      wall.transitionTo(
        state,
        gs.phase,
        t,
        css,
        this.renderScale,
        startAt,
        occupied ? timings.occupied.dur : timings.walls.dur,
      );
    }

    this.groundDirty = true;
    this.wallsDirty = true;
  }

  /** §6.5 — refusal: nudge **the player** 4 px toward the blocked cell and back. */
  denyFeedback(dir: Direction, time: number): void {
    this.deny = { startAt: time, dir };
  }

  /** §6.2 — win flash: a plate-level tint (L7), never a per-cell cover. */
  winFlash(time: number): void {
    this.winAt = time;
    this.groundDirty = true;
  }

  /**
   * R-T6 — desktop hover ring. The scene supplies the cell only when the **core**
   * rule function accepts the move (`GameSession.movePreview`); this view never
   * decides legality itself.
   */
  setHover(cell: Vec | null): void {
    const same =
      (cell === null && this.hover === null) ||
      (cell !== null &&
        this.hover !== null &&
        cell.x === this.hover.x &&
        cell.y === this.hover.y);
    if (same) return;
    this.hover = cell;
    this.feedbackDirty = true;
  }

  /* ── per-frame painting ─────────────────────────────────────────────────── */

  /**
   * §6.2's `tokens` row, resolved for `time`: the canvas token map mid-flip.
   *
   * One value drives every non-stateful canvas element (page ground, plate, grid,
   * cell plates, goal, hover ring, win tint), so they cross-fade on the **same**
   * beat as the walls and the actor instead of popping at the phase change.
   * `easeOutQuad` is §6.2's easing for this row; the duration/lead come from
   * `flipTimings()` (`140 ms` from `60 ms` in Variant S, a single `60 ms` swap
   * under `prefers-reduced-motion` — §6.4, legibility identical, motion removed).
   */
  private tokenMix(time: number): { readonly tokens: ThemeTokens; readonly t: number } {
    const flip = this.flip;
    const to = theme(this.shown.phase);
    if (flip === null) return { tokens: to, t: 1 };
    const raw = progress(time, flip.startAt + flip.timings.tokens.start, flip.timings.tokens.dur);
    const t = easeOutQuad(raw);
    return { tokens: mixTheme(theme(flip.fromPhase), to, t), t };
  }

  /**
   * §6.2's `walls` row for **one tile**, eased and staggered by distance from the
   * move — the row every stateful object's swap rides (door bars R-D2/R-D3, the
   * switch dot, the portal swirl). One scalar recomputed per frame, never a tween
   * queue, so a move arriving mid-flip cannot desync (§6.4). `1` on a settled board.
   */
  private objectMixFor(tile: Vec, time: number): number {
    const flip = this.flip;
    if (flip === null) return 1;
    const startAt =
      flip.startAt +
      flip.timings.walls.start +
      staggerFor(tile, this.shown.player, flip.timings.walls.stagger);
    return easeOutQuad(progress(time, startAt, flip.timings.walls.dur));
  }

  /**
   * §6.2's `occupied` row — **raw** progress, deliberately not eased here: R-D7's
   * interior drop applies its own `easeOutQuad`, and M3's press beat is a
   * `sin(πp)` one-shot that needs the linear progress to peak exactly once. `1` on
   * a settled board (so `sin(π·1)` — the beat's own zero — is the only value a
   * resting board can produce).
   */
  private occupiedProgress(time: number): number {
    const flip = this.flip;
    if (flip === null) return 1;
    return progress(time, flip.startAt + flip.timings.occupied.start, flip.timings.occupied.dur);
  }

  update(time: number): void {
    const timings = flipTimings(this.reducedMotion);
    if (this.flip !== null && time >= this.flip.startAt + this.flip.timings.total) {
      // Settle on the exact target values, then stop repainting the static layers.
      // `prevState` drops with the flip: the cross-fade is over, so every painter
      // reads its "settled" branch (and the switch's press beat cannot re-fire on a
      // resting board — `sin(π·0)` over a stale `prev` is exactly the R-C8 bug).
      this.flip = null;
      this.prevState = null;
      this.groundDirty = true;
      this.wallsDirty = true;
    }
    if (this.deny !== null && time >= this.deny.startAt + timings.deny.dur) this.deny = null;
    if (this.winAt !== null && time >= this.winAt + timings.winTint.dur) {
      this.winAt = null;
      this.groundDirty = true;
    }

    if (this.flip !== null || this.groundDirty) {
      this.paintGround(time);
      this.groundDirty = false;
    }
    if (this.flip !== null || this.wallsDirty) {
      this.paintWalls(time);
      this.wallsDirty = false;
    }
    this.paintTileObjects(time);
    this.paintActor(time);
    if (this.flip !== null || this.feedbackDirty) {
      this.paintFeedback(time);
      this.feedbackDirty = false;
    }
    this.paintTint(time);
  }

  /** L0/L2/L3 — page ground, plate, cell plates and the R-C4 grid separator. */
  private paintGround(time: number): void {
    const { tokens: t } = this.tokenMix(time);

    // L0 pageGround — kept as the **base layer under the art**, not replaced by it.
    // The delivered plates are drawn above this rect, so (a) a mid-dissolve frame
    // composites over a real colour rather than over nothing, and (b) a plate that
    // did not mount degrades to exactly the pre-integration ground.
    // DEV PLACEHOLDER — A-04 bg_phase_a / A-05 bg_phase_b: this flat `ground.page`
    // fill, which is what either plate's slot falls back to.
    this.pageGfx.clear();
    this.pageGfx.fillStyle(toInt(t.ground.page), 1);
    this.pageGfx.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    this.paintBackground(time);

    // L2 board plate — R-L4 opaque enough that background art never leaks in.
    const plate = this.layout.plate;
    const plateRadius = Math.round(this.layout.cellSize * 0.18);
    this.plateGfx.clear();
    this.plateGfx.fillStyle(toInt(t.ground.plate), 1);
    this.plateGfx.fillRoundedRect(plate.x, plate.y, plate.w, plate.h, plateRadius);

    // L3 grid separator surface (R-C4: 1.6–2.2:1 vs the cell ground — structural,
    // never stronger than a state element). The R-L3 gutter falls out of insetting
    // each cell plate by gutter/2 on top of it.
    const grid = this.layout.grid;
    this.plateGfx.fillStyle(toInt(t.ground.grid), 1);
    this.plateGfx.fillRect(grid.x, grid.y, grid.w, grid.h);

    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const surface = cellSurface(this.layout, x, y);
        this.plateGfx.fillStyle(toInt(isAltCell(x, y) ? t.ground.cellAlt : t.ground.cell), 1);
        this.plateGfx.fillRoundedRect(surface.x, surface.y, surface.w, surface.h, this.layout.radius);
      }
    }
  }

  /**
   * L1 `backgroundImage` — §6.2's `background` row (100–220 ms Variant S / 150–250
   * Variant CL / instant under reduced motion), read from the **same** flip the
   * board is running. One scalar per frame and no tween queue, so a move arriving
   * mid-dissolve snaps the pair to its target exactly like every other layer
   * (§6.4) — and a settled board takes the `flip === null` branch, i.e. exactly
   * `w = 1` or `0`, never a stale mid-dissolve alpha.
   *
   * Cover-fit is recomputed here, not cached: this runs only when the ground is
   * dirty (resize, level change, flip), and `layout` is what R-L7 recomputes.
   */
  private paintBackground(time: number): void {
    const { A, B } = this.backgroundArt;
    if (A === null && B === null) return;

    const flip = this.flip;
    const raw =
      flip === null
        ? 1
        : progress(
            time,
            flip.startAt + flip.timings.background.start,
            flip.timings.background.dur,
          );
    const w = phaseWeight(flip?.fromPhase ?? this.shown.phase, this.shown.phase, easeOutQuad(raw));

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    for (const image of [A, B]) {
      if (image === null) continue;
      // §11 — cover-fit to the play area: scale the 1920×1080 plate up until it
      // covers the box on its short axis, then centre it. Letterboxing instead
      // would show the page ground at the edges, which is a *fallback*, not a
      // framing.
      const cover = Math.max(width / image.frame.realWidth, height / image.frame.realHeight);
      image.setDisplaySize(image.frame.realWidth * cover, image.frame.realHeight * cover);
      image.setPosition(width / 2, height / 2);
    }

    // Each plate owns its own phase, so a *pair* dissolves and a *single* plate
    // simply appears/disappears for its phase (the other slot's page ground is its
    // honest fallback). `phaseWeight`'s stacking rule: A opaque under, B faded in.
    const paired = A !== null && B !== null;
    if (A !== null) A.setAlpha(paired ? 1 : 1 - w);
    if (B !== null) B.setAlpha(w);
  }

  /**
   * The tile's cell ground — the ghost notch is knocked out to this exact colour,
   * read from the **same** mixed token map `paintGround` just filled the cell with
   * (§3.1a: "a knockout to `ground.cell` through stroke and tint"). Sharing one
   * map is what keeps the notch a true knockout at every frame of the cross-fade
   * instead of a near-miss that shows a faint square edge.
   */
  private knockoutFor(x: number, y: number, tokens: ThemeTokens): number {
    return toInt(isAltCell(x, y) ? tokens.ground.cellAlt : tokens.ground.cell);
  }

  /**
   * L4 slot `wall` — walls (solid / ghost / occupied), swapped in place and
   * staggered (R-E6, §6.2). The wall class keeps **one** renderer: this is the
   * same in-place `WallTileView` swap as before, it merely draws at §3.1d's wall
   * slot (above the goal, below the doors).
   */
  private paintWalls(time: number): void {
    const { tokens } = this.tokenMix(time);
    const css = cellSizeCss(this.layout);

    this.wallGfx.clear();
    for (const wall of this.walls) {
      wall.paint(
        this.wallGfx,
        cellRect(this.layout, wall.tile.x, wall.tile.y),
        this.layout.radius,
        css,
        this.renderScale,
        time,
        this.knockoutFor(wall.tile.x, wall.tile.y, tokens),
      );
    }
  }

  /**
   * L4 — every non-wall registry class, each into the container of its §3.1d
   * slot. One `TILE_OBJECTS` sweep, no class named here: a class added to the
   * registry lands at its own `layer` slot automatically and can never be painted
   * into another class's container by accident. Today: portal, switch, goal and
   * door — the goal keeps its single R-C8 idle pulse, every other class is
   * statelessly re-derived per frame from `(level, state, transition)`.
   *
   * Clear-then-paint in two passes so two specs sharing a slot keep declaration
   * order in their shared container (R-Z4).
   */
  private paintTileObjects(time: number): void {
    const { tokens } = this.tokenMix(time);
    // Two passes so two specs sharing a §3.1d slot keep declaration order in their
    // shared container (R-Z4): clear every container first, then paint in order.
    for (const painter of this.l4Painters) painter.gfx.clear();
    for (const { spec, gfx } of this.l4Painters) {
      for (const tile of spec.tilesOf(this.level)) {
        // `prevState` is `null` exactly when no flip runs, and both mixes are `1`
        // then — so a painter's `mix(prev, now, mix)` collapses to `now` and undo,
        // restart and resize all repaint the committed state bit-exactly.
        const transition: TileObjectTransition = {
          prev: this.prevState,
          objectMix: this.objectMixFor(tile, time),
          occupied: this.occupiedProgress(time),
        };
        spec.paint({
          g: gfx,
          rect: cellRect(this.layout, tile.x, tile.y),
          radius: this.layout.radius,
          tile,
          cssScale: this.renderScale,
          theme: tokens,
          // R-C8 — the idle pulse is wall-clock, deliberately NOT the flip clock:
          // the goal's slow 2.4 s breathing must not restart on every move.
          timeMs: this.scene.time.now,
          // The rules-of-record for this tile: the painter reads its own object out
          // of the **committed** state (`doorsOpen` / `switchesOn` / `portalAt`
          // via `cell-state.ts`) and never re-derives solidity or legality.
          level: this.level,
          gs: this.lastState,
          transition,
          // §3.1b/R-D3 — the glyph knockout is the tile's own cell ground, read
          // from the same mixed map `paintGround` filled it with, so the punch is
          // exact at every frame of the `tokens` cross-fade.
          knockout: this.knockoutFor(tile.x, tile.y, tokens),
          // R-005a — every painter gets the same port; the goal and the portal pair
          // stand in for delivered art today, and a class with no asset never asks.
          art: this.artPort,
        });
      }
    }
  }

  /** L5 — the actor, above **every** L4 layer (R-C13.1, enforced by `assertLayerOrder`). */
  private paintActor(time: number): void {
    const flip = this.flip;
    const timings = flipTimings(this.reducedMotion);
    const { t: mix } = this.tokenMix(time);
    const to = theme(this.shown.phase);
    const look = flip
      ? lerpActorLook(actorLook(theme(flip.fromPhase)), actorLook(to), mix)
      : actorLook(to);
    const target = cellCenter(this.layout, this.shown.player.x, this.shown.player.y);

    let cx = target.x;
    let cy = target.y;
    let squash = { sx: 1, sy: 1 };

    if (flip) {
      const hop = flip.timings.hop;
      const p = progress(time, flip.startAt + hop.start, hop.dur);
      const from = cellCenter(this.layout, flip.hopFrom.x, flip.hopFrom.y);
      cx = from.x + (target.x - from.x) * p;
      cy = from.y + (target.y - from.y) * p;
      cy += hopArcOffset(p, this.layout.cellSize, hop.arc);
      squash = landingSquash(p, hop.squash);
    }

    // §6.5 — the refusal nudge. Direction and distance only; the tint alpha is the
    // timing table's `deny.ringAlpha`, and nothing here touches the world.
    let denyAlpha: number | null = null;
    if (this.deny) {
      const p = progress(time, this.deny.startAt, timings.deny.dur);
      const offset = Math.sin(Math.PI * p) * timings.deny.nudge * this.renderScale;
      const dir = deltaOf(this.deny.dir);
      cx += dir.x * offset;
      cy += dir.y * offset;
      denyAlpha = timings.deny.ringAlpha;
    }

    // The A-03 pair is **one** element (two manifest rows, one Asset ID): half a
    // pair is not a body, it is a stray sprite, so the texture path runs only when
    // both forms mounted — otherwise the vector disc below draws, and R-P2's
    // badge names the slot that failed.
    const spiritA = this.spiritArt.A;
    const spiritB = this.spiritArt.B;
    if (spiritA !== null && spiritB !== null) {
      const box = this.layout.cellSize * ACTOR_ART_BOX;
      // `mix` is §6.2's `tokens` row — the same scalar the old disc's colour was
      // lerped on, so the texture swap inherits its timing exactly.
      const w = phaseWeight(flip?.fromPhase ?? this.shown.phase, this.shown.phase, mix);
      for (const image of [spiritA, spiritB]) {
        image.setPosition(cx, cy);
        // §6.2 hop — squash is a *shape* rule, so it scales the sprite exactly as
        // it scaled the ellipse; the pair's byte-identical alpha keeps A and B in
        // step, so nothing shifts between the forms.
        image.setDisplaySize(box * squash.sx, box * squash.sy);
      }
      // `phaseWeight`'s stacking rule: A opaque underneath, B faded in on top —
      // fading both would leak the board through the actor at w = 0.5.
      spiritA.setAlpha(1);
      spiritB.setAlpha(w);
    } else {
      spiritA?.setAlpha(0);
      spiritB?.setAlpha(0);
    }

    // Both halves of the actor painter share every field except the `Graphics`
    // they draw into: one container, two passes, so `g` is supplied at the call.
    const ctx: Omit<ActorPaintContext, "g"> = {
      cx,
      cy,
      cellSize: this.layout.cellSize,
      cssScale: this.renderScale,
      look,
      squash,
      denyAlpha,
      textureBody: spiritA !== null && spiritB !== null,
      // R-C13.4 — geometry from the timing table, colour from the boot-derived
      // `fx.phaseRing` token. Fires once per flip that solidified the tile under
      // the player, never while standing (R-C8 forbids a looping ring).
      //
      // R-Z2 — the trapped state adds **no layer**: the occupied interior is the
      // existing wall container's in-place swap and this ring is painted into the
      // existing actor container, *behind* the body (`paintActor` draws it first).
      // It must stay behind the player here: at `scaleFrom` the ring's radius
      // equals the body radius, and §3.1d/R-C13.1 forbid any treatment over the
      // player sprite while it occupies a wall tile (§6.3, and R-C5 for the
      // general case).
      phaseRing:
        flip && flip.ring
          ? {
              progress: progress(
                time,
                flip.startAt + flip.timings.ring.start,
                flip.timings.ring.dur,
              ),
              scaleFrom: flip.timings.ring.scaleFrom,
              scaleTo: flip.timings.ring.scaleTo,
              strokeWidthCss: flip.timings.ring.strokeWidth,
            }
          : null,
    };

    // One container, two painters, one fixed order: below the body, then the
    // delivered forms (their own child slots), then the ring + deny arc above.
    this.actorGfx.clear();
    this.actorOverlayGfx.clear();
    paintActor({ ...ctx, g: this.actorGfx });
    paintActorOverlay({ ...ctx, g: this.actorOverlayGfx });
  }

  /** L6 — R-T6 hover ring (desktop affordance; never the only cue, never a hit area). */
  private paintFeedback(time: number): void {
    this.feedbackGfx.clear();
    if (this.hover === null) return;
    const rect = cellRect(this.layout, this.hover.x, this.hover.y);
    const stroke = HOVER_STROKE_CSS * this.renderScale;
    this.feedbackGfx.lineStyle(stroke, toInt(this.tokenMix(time).tokens.accent), 0.9);
    this.feedbackGfx.strokeRoundedRect(
      rect.x + stroke,
      rect.y + stroke,
      rect.w - stroke * 2,
      rect.h - stroke * 2,
      this.layout.radius,
    );
  }

  /** L7 — win flash: plate tint only, never per-cell. */
  private paintTint(time: number): void {
    this.tintGfx.clear();
    if (this.winAt === null) return;
    const t = this.tokenMix(time).tokens;
    const dur = flipTimings(this.reducedMotion).winTint.dur;
    const p = progress(time, this.winAt, dur);
    const alpha = t.feedback.winAlpha * (1 - p);
    if (alpha <= 0.001) return;
    const plate = this.layout.plate;
    this.tintGfx.fillStyle(toInt(t.feedback.win), alpha);
    this.tintGfx.fillRoundedRect(
      plate.x,
      plate.y,
      plate.w,
      plate.h,
      Math.round(this.layout.cellSize * 0.18),
    );
  }
}