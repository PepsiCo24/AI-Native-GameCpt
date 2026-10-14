/**
 * Per-tile wall view — the persistent L4 object for one wall tile (R-E6/R-E8).
 *
 * One display object per wall tile, created once at layout time. A flip **never**
 * creates or destroys a wall object: it cross-fades `wall ↔ wallEcho` (and the
 * V0.4 `wallOccupied` variant) **in place**, staggering tiles by ≤ 15 ms by
 * distance from the player (§6.2). This class owns the tiny amount of per-tile
 * transition state that needs; the silhouette rules live in `objects/wall.ts` and
 * the classification rules in `cell-state.ts`.
 *
 * `setState` deliberately starts from the **current target** look, not from the
 * interpolated one: §6.4 requires a running tween to **snap to its target** when
 * a new move arrives mid-flip (animation queue depth = 1, no desync from state).
 *
 * Naming note (the reason `tokens` is spelled out): every method here takes a
 * resolved `ThemeTokens` for the current phase. Naming that parameter `theme`
 * shadowed the `theme(phase)` lookup function imported from `theme/tokens.ts` and
 * broke the glyph lookup — the parameter is `tokens`, the lookup is `theme()`.
 */

import type Phaser from "phaser";
import type { Phase } from "@/core/state/phase";
import type { Vec } from "@/core/state/types";
import type { Rect } from "@/game/renderer/grid-mapping";
import type { WallTile, WallRenderState } from "@/game/renderer/cell-state";
import {
  ghostLook,
  lerpLook,
  occupiedLook,
  paintWall,
  solidLook,
} from "@/game/renderer/objects/wall";
import type { WallLook } from "@/game/renderer/objects/wall";
import { easeOutQuad } from "@/game/renderer/objects/actor";
import { theme } from "@/game/theme/tokens";
import type { PhaseGlyph, ThemeTokens } from "@/game/theme/tokens";

function lookFor(
  state: WallRenderState,
  tokens: ThemeTokens,
  cellSizeCss: number,
  cssScale: number,
): WallLook {
  if (state === "ghost") return ghostLook(tokens, cellSizeCss, cssScale);
  if (state === "occupied") return occupiedLook(tokens, cssScale);
  return solidLook(tokens, cellSizeCss, cssScale);
}

export class WallTileView {
  readonly tile: Vec;
  readonly owningPhase: Phase | undefined;

  private current: WallRenderState;
  private from: WallLook;
  private to: WallLook;
  private glyph: PhaseGlyph;
  private startAt = 0;
  private duration = 0;
  private animating = false;

  constructor(
    wall: WallTile,
    state: WallRenderState,
    phase: Phase,
    tokens: ThemeTokens,
    cellSizeCss: number,
    cssScale: number,
  ) {
    this.tile = wall.tile;
    this.owningPhase = wall.owningPhase;
    this.current = state;
    this.from = lookFor(state, tokens, cellSizeCss, cssScale);
    this.to = this.from;
    this.glyph = theme(wall.owningPhase ?? phase).hud.phaseGlyph;
  }

  get renderState(): WallRenderState {
    return this.current;
  }

  /** Is this tile's silhouette still interpolating? (View-side bookkeeping only.) */
  get isAnimating(): boolean {
    return this.animating;
  }

  /**
   * Snap to a state with no transition — the initial paint, a layout/resize
   * repaint, and the §6.4 "snap to target" step when a new move interrupts.
   */
  snap(
    state: WallRenderState,
    phase: Phase,
    tokens: ThemeTokens,
    cellSizeCss: number,
    cssScale: number,
  ): void {
    this.current = state;
    this.from = lookFor(state, tokens, cellSizeCss, cssScale);
    this.to = this.from;
    this.glyph = theme(this.owningPhase ?? phase).hud.phaseGlyph;
    this.animating = false;
  }

  /** Begin the in-place cross-fade to `state`, starting at absolute scene time `startAt`. */
  transitionTo(
    state: WallRenderState,
    phase: Phase,
    tokens: ThemeTokens,
    cellSizeCss: number,
    cssScale: number,
    startAt: number,
    duration: number,
  ): void {
    this.current = state;
    this.glyph = theme(this.owningPhase ?? phase).hud.phaseGlyph;
    this.from = this.to;
    this.to = lookFor(state, tokens, cellSizeCss, cssScale);
    this.startAt = startAt;
    this.duration = duration;
    this.animating = duration > 0;
    if (!this.animating) this.from = this.to;
  }

  /** The look to paint at `time` (absolute scene ms). */
  lookAt(time: number): WallLook {
    if (!this.animating) {
      this.from = this.to;
      return this.to;
    }
    const p = Math.min(1, Math.max(0, (time - this.startAt) / this.duration));
    const look = lerpLook(this.from, this.to, easeOutQuad(p));
    if (p >= 1) this.animating = false;
    return look;
  }

  paint(
    g: Phaser.GameObjects.Graphics,
    rect: Rect,
    radius: number,
    cellSizeCss: number,
    cssScale: number,
    time: number,
    knockout: number,
  ): void {
    paintWall({
      g,
      rect,
      radius,
      cellSizeCss,
      cssScale,
      look: this.lookAt(time),
      glyph: this.glyph,
      knockout,
    });
  }
}

/**
 * §6.2 stagger: ≤ 15 ms, ordered by distance from the player, so the swap reads
 * as travelling outward from the move rather than as a global flash.
 */
export function staggerFor(tile: Vec, player: Vec, staggerMax: number): number {
  const distance = Math.abs(tile.x - player.x) + Math.abs(tile.y - player.y);
  return Math.min(distance * 4, staggerMax);
}