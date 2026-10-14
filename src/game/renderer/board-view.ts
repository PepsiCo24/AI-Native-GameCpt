/**
 * Board view — the whole Canvas side of `docs/ui-ux.md` §7.1.
 *
 * Owns: page/background, board plate, cell plates + grid, L4 objects
 * (walls + ghosts + occupied walls, goal), L5 actor, L6 cell feedback (hover ring),
 * L7 win tint. Owns **no text, no button, no dialog** — every one of those is DOM
 * (`src/game/hud/**`), so canvas text at mobile DPR never exists.
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
 */

import Phaser from "phaser";
import type { Level } from "@/core/level";
import type { Direction } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import type { GameState, Vec } from "@/core/state/types";
import {
  isPlayerAt,
  isPlayerEmbedded,
  wallRenderState,
  wallTilesOf,
} from "@/game/renderer/cell-state";
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
import { hopArcOffset, landingSquash, paintActor } from "@/game/renderer/objects/actor";
import { TILE_OBJECTS } from "@/game/renderer/objects/registry";
import { WallTileView, staggerFor } from "@/game/renderer/wall-tiles";
import { flipTimings, lerpColorInt, theme, toInt } from "@/game/theme/tokens";
import type { FlipTimings, ThemeTokens } from "@/game/theme/tokens";

/** §5.2 layer depths. `backgroundImage` (5) is reserved for the A-04/A-05 art. */
const DEPTH = {
  page: 0,
  backgroundImage: 5,
  plate: 20,
  objects: 40,
  actor: 50,
  cellFeedback: 60,
  plateTint: 70,
} as const;

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
  private readonly objectsGfx: Phaser.GameObjects.Graphics;
  private readonly goalGfx: Phaser.GameObjects.Graphics;
  private readonly actorGfx: Phaser.GameObjects.Graphics;
  private readonly feedbackGfx: Phaser.GameObjects.Graphics;
  private readonly tintGfx: Phaser.GameObjects.Graphics;

  /** The state the view has been told to show (the animation target). */
  private shown: ShownState;
  /** Last committed state — the goal's `tilesOf` seam and the wall views read it. */
  private lastState: GameState;

  private flip: FlipAnimation | null = null;
  private deny: DenyAnimation | null = null;
  private winAt: number | null = null;
  private hover: Vec | null = null;

  private groundDirty = true;
  private objectsDirty = true;
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
    this.pageGfx = s.add.graphics().setDepth(DEPTH.page);
    this.plateGfx = s.add.graphics().setDepth(DEPTH.plate);
    this.objectsGfx = s.add.graphics().setDepth(DEPTH.objects);
    this.goalGfx = s.add.graphics().setDepth(DEPTH.objects + 1);
    this.actorGfx = s.add.graphics().setDepth(DEPTH.actor);
    this.feedbackGfx = s.add.graphics().setDepth(DEPTH.cellFeedback);
    this.tintGfx = s.add.graphics().setDepth(DEPTH.plateTint);

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
      this.objectsGfx,
      this.goalGfx,
      this.actorGfx,
      this.feedbackGfx,
      this.tintGfx,
    ]) {
      gfx.destroy();
    }
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
    this.objectsDirty = true;
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
    this.objectsDirty = true;
    this.feedbackDirty = true;
  }

  /**
   * Animate the flip from the last shown state to `gs` (§6.2 sequence). The caller
   * has **already committed** `gs`; a flip arriving while another runs snaps the
   * previous one to its target first (§6.4).
   */
  animateTo(gs: GameState, time: number): void {
    const from = this.shown;
    this.lastState = gs;
    this.shown = { phase: gs.phase, player: gs.playerPosition };

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
      const state = wallRenderState(
        this.level,
        gs,
        wall.tile,
        embedded && isPlayerAt(gs, wall.tile),
      );
      const startAt =
        time + timings.walls.start + staggerFor(wall.tile, gs.playerPosition, timings.walls.stagger);
      wall.transitionTo(state, gs.phase, t, css, this.renderScale, startAt, timings.walls.dur);
    }

    this.groundDirty = true;
    this.objectsDirty = true;
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

  update(time: number): void {
    const timings = flipTimings(this.reducedMotion);
    if (this.flip !== null && time >= this.flip.startAt + this.flip.timings.total) {
      // Settle on the exact target values, then stop repainting the static layers.
      this.flip = null;
      this.groundDirty = true;
      this.objectsDirty = true;
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
    if (this.flip !== null || this.objectsDirty) {
      this.paintObjects(time);
      this.objectsDirty = false;
    }
    this.paintGoal();
    this.paintActor(time);
    if (this.flip !== null || this.feedbackDirty) {
      this.paintFeedback();
      this.feedbackDirty = false;
    }
    this.paintTint(time);
  }

  /** L0/L2/L3 — page ground, plate, cell plates and the R-C4 grid separator. */
  private paintGround(time: number): void {
    const flip = this.flip;
    const to = theme(this.shown.phase);
    const from = flip ? theme(flip.fromPhase) : to;
    const mix = flip
      ? progress(time, flip.startAt + flip.timings.tokens.start, flip.timings.tokens.dur)
      : 1;

    // L0 pageGround + L1 backgroundImage placeholder (A-04/A-05 not delivered).
    // DEV PLACEHOLDER — A-04 bg_phase_a / A-05 bg_phase_b: integration adds an
    // Image at DEPTH.backgroundImage and this rect becomes the letterbox.
    this.pageGfx.clear();
    this.pageGfx.fillStyle(lerpColorInt(toInt(from.ground.page), toInt(to.ground.page), mix), 1);
    this.pageGfx.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);

    // L2 board plate — R-L4 opaque enough that background art never leaks in.
    const plate = this.layout.plate;
    const plateRadius = Math.round(this.layout.cellSize * 0.18);
    this.plateGfx.clear();
    this.plateGfx.fillStyle(lerpColorInt(toInt(from.ground.plate), toInt(to.ground.plate), mix), 1);
    this.plateGfx.fillRoundedRect(plate.x, plate.y, plate.w, plate.h, plateRadius);

    // L3 grid separator surface (R-C4: 1.6–2.2:1 vs the cell ground — structural,
    // never stronger than a state element). The R-L3 gutter falls out of insetting
    // each cell plate by gutter/2 on top of it.
    const grid = this.layout.grid;
    this.plateGfx.fillStyle(lerpColorInt(toInt(from.ground.grid), toInt(to.ground.grid), mix), 1);
    this.plateGfx.fillRect(grid.x, grid.y, grid.w, grid.h);

    const cell = lerpColorInt(toInt(from.ground.cell), toInt(to.ground.cell), mix);
    const cellAlt = lerpColorInt(toInt(from.ground.cellAlt), toInt(to.ground.cellAlt), mix);
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const surface = cellSurface(this.layout, x, y);
        this.plateGfx.fillStyle(isAltCell(x, y) ? cellAlt : cell, 1);
        this.plateGfx.fillRoundedRect(surface.x, surface.y, surface.w, surface.h, this.layout.radius);
      }
    }
  }

  /** The tile's cell ground — the ghost notch is knocked out to this exact colour. */
  private knockoutFor(x: number, y: number, to: ThemeTokens, from: ThemeTokens, mix: number): number {
    const toGround = isAltCell(x, y) ? to.ground.cellAlt : to.ground.cell;
    const fromGround = isAltCell(x, y) ? from.ground.cellAlt : from.ground.cell;
    return lerpColorInt(toInt(fromGround), toInt(toGround), mix);
  }

  /** L4 — walls (solid / ghost / occupied), swapped in place and staggered (R-E6, §6.2). */
  private paintObjects(time: number): void {
    const flip = this.flip;
    const to = theme(this.shown.phase);
    const from = flip ? theme(flip.fromPhase) : to;
    const mix = flip
      ? progress(time, flip.startAt + flip.timings.tokens.start, flip.timings.tokens.dur)
      : 1;
    const css = cellSizeCss(this.layout);

    this.objectsGfx.clear();
    for (const wall of this.walls) {
      wall.paint(
        this.objectsGfx,
        cellRect(this.layout, wall.tile.x, wall.tile.y),
        this.layout.radius,
        css,
        this.renderScale,
        time,
        this.knockoutFor(wall.tile.x, wall.tile.y, to, from, mix),
      );
    }
  }

  /** L4 — the goal, the single R-C8 idle pulse (2 shapes per frame). */
  private paintGoal(): void {
    const t = theme(this.shown.phase);
    this.goalGfx.clear();
    for (const spec of TILE_OBJECTS) {
      for (const tile of spec.tilesOf(this.level, this.lastState)) {
        spec.paint({
          g: this.goalGfx,
          rect: cellRect(this.layout, tile.x, tile.y),
          tile,
          cssScale: this.renderScale,
          theme: t,
          timeMs: this.scene.time.now,
        });
      }
    }
  }

  /** L5 — the actor, above every wall (R-C13.1). */
  private paintActor(time: number): void {
    const flip = this.flip;
    const t = theme(this.shown.phase);
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

    if (this.deny) {
      const p = progress(time, this.deny.startAt, flipTimings(this.reducedMotion).deny.dur);
      const offset =
        Math.sin(Math.PI * p) * flipTimings(this.reducedMotion).deny.nudge * this.renderScale;
      const dir = deltaOf(this.deny.dir);
      cx += dir.x * offset;
      cy += dir.y * offset;
    }

    this.actorGfx.clear();
    paintActor({
      g: this.actorGfx,
      cx,
      cy,
      cellSize: this.layout.cellSize,
      cssScale: this.renderScale,
      theme: t,
      squash,
      denying: this.deny !== null,
      phaseRing:
        flip && flip.ring
          ? {
              progress: progress(
                time,
                flip.startAt + flip.timings.ring.start,
                flip.timings.ring.dur,
              ),
            }
          : null,
    });
  }

  /** L6 — R-T6 hover ring (desktop affordance; never the only cue, never a hit area). */
  private paintFeedback(): void {
    this.feedbackGfx.clear();
    if (this.hover === null) return;
    const rect = cellRect(this.layout, this.hover.x, this.hover.y);
    const stroke = HOVER_STROKE_CSS * this.renderScale;
    this.feedbackGfx.lineStyle(stroke, toInt(theme(this.shown.phase).accent), 0.9);
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
    const t = theme(this.shown.phase);
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