/**
 * Wall painter — one object per tile, two (three) render states (R-E6, R-C13).
 *
 * `docs/ui-ux.md` §3.1a is the binding contract:
 *
 * | property  | `wall` (solid, current phase) | `wallEcho` (ghost, other phase) |
 * |---|---|---|
 * | silhouette| rounded square, **filled**, 88 %    | rounded square, **hollow**: 2 px stroke + flat tint, 80 % |
 * | interior  | `obj.wall`, flat, full coverage | `obj.wallEchoFill`, flat (R-E2a band) |
 * | stroke    | none (the fill carries the shape) | `obj.wallEcho`, 2 px, at every cell ≥ 40 px |
 * | edge      | `obj.wallEdge`, 2 px, only at cell ≥ 56 px | none |
 * | notch     | none | knockout sun/crescent to the cell ground, `cellSize * 0.30`, only at cell ≥ 56 px |
 *
 * plus the V0.4 **occupied** variant (R-C13.2): the interior drops to
 * `obj.wallOccupied` and a 2 px `obj.wallEdge` stroke is retained at **every**
 * cell size, so a solidified wall under the player still reads unmistakably as a
 * wall while the player draws on top of it (L5 above L4).
 *
 * R-C7: flat precomputed tokens only — no texture, no hatch, no runtime alpha
 * over the ground. R-E4: a ghost may never out-contrast or out-size a solid wall.
 */

import type { Rect } from "@/game/renderer/grid-mapping";
import { lerpColorInt, toInt } from "@/game/theme/tokens";
import type { PhaseGlyph, ThemeTokens } from "@/game/theme/tokens";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { paintPhaseGlyph } from "@/game/renderer/objects/glyph";

/** Every value the painter needs; all numbers are device px or plain fractions. */
export interface WallLook {
  /** Rounded-square side as a fraction of the cell (88 % solid, 80 % ghost). */
  readonly footprint: number;
  readonly fill: number;
  readonly fillAlpha: number;
  readonly strokeColor: number;
  readonly strokeWidth: number;
  readonly strokeAlpha: number;
  readonly edgeColor: number;
  readonly edgeWidth: number;
  readonly edgeAlpha: number;
  readonly notchAlpha: number;
}

export interface WallPaintContext {
  readonly g: Graphics2D;
  /** Cell rect (device px) — the wall is centered inside it. */
  readonly rect: Rect;
  readonly radius: number;
  /** Cell size in **CSS px**, for the §3.1a thresholds (56 px edge/notch, 40 px stroke). */
  readonly cellSizeCss: number;
  /** `min(devicePixelRatio, 2)` — converts the spec's CSS-px strokes to device px. */
  readonly cssScale: number;
  readonly look: WallLook;
  /** Glyph naming the phase that owns the ghost (§3.1a notch, R-C1). */
  readonly glyph: PhaseGlyph;
  /** Colour the notch is knocked out to — the tile's own cell ground. */
  readonly knockout: number;
}

/** 2 px strokes as specified in CSS px, scaled into the render target. */
const STROKE_CSS = 2;

function base(
  theme: ThemeTokens,
  footprint: number,
  fill: number,
  cssScale: number,
): WallLook {
  return {
    footprint,
    fill,
    fillAlpha: 1,
    strokeColor: fill,
    strokeWidth: 0,
    strokeAlpha: 0,
    edgeColor: toInt(theme.obj.wallEdge),
    edgeWidth: STROKE_CSS * cssScale,
    edgeAlpha: 0,
    notchAlpha: 0,
  };
}

/** `wall` — solid in the current phase. Rank 3 emphasis, full-strength filled block. */
export function solidLook(theme: ThemeTokens, cellSizeCss: number, cssScale: number): WallLook {
  const look = base(theme, 0.88, toInt(theme.obj.wall), cssScale);
  return { ...look, edgeAlpha: cellSizeCss >= 56 ? 1 : 0 };
}

/** `wallEcho` — a wall of the other phase: **passable now**, hollow, strictly subordinate. */
export function ghostLook(theme: ThemeTokens, cellSizeCss: number, cssScale: number): WallLook {
  const look = base(theme, 0.8, toInt(theme.obj.wallEchoFill), cssScale);
  return {
    ...look,
    strokeColor: toInt(theme.obj.wallEcho),
    strokeWidth: STROKE_CSS * cssScale,
    strokeAlpha: cellSizeCss >= 40 ? 1 : 0,
    notchAlpha: cellSizeCss >= 56 ? 1 : 0,
  };
}

/** `wallOccupied` — R-C13.2: the wall under the player keeps its edge at every size. */
export function occupiedLook(theme: ThemeTokens, cssScale: number): WallLook {
  const look = base(theme, 0.88, toInt(theme.obj.wallOccupied), cssScale);
  return { ...look, edgeAlpha: 1 };
}

/** Interpolate two looks for the R-E6 in-place state cross-fade (`wall ↔ wallEcho`). */
export function lerpLook(from: WallLook, to: WallLook, t: number): WallLook {
  const n = (a: number, b: number): number => a + (b - a) * t;
  return {
    footprint: n(from.footprint, to.footprint),
    fill: lerpColorInt(from.fill, to.fill, t),
    fillAlpha: n(from.fillAlpha, to.fillAlpha),
    strokeColor: lerpColorInt(from.strokeColor, to.strokeColor, t),
    strokeWidth: n(from.strokeWidth, to.strokeWidth),
    strokeAlpha: n(from.strokeAlpha, to.strokeAlpha),
    edgeColor: lerpColorInt(from.edgeColor, to.edgeColor, t),
    edgeWidth: n(from.edgeWidth, to.edgeWidth),
    edgeAlpha: n(from.edgeAlpha, to.edgeAlpha),
    notchAlpha: n(from.notchAlpha, to.notchAlpha),
  };
}

/**
 * The phase notch — a **knockout** through stroke and tint (§3.1a, R-E4): the
 * owning phase is named without colour, which is the redundant channel that lets
 * `wall ↔ wallEcho` and the door pair survive CVD simulation (§7.4).
 *
 * The shape itself lives in `objects/glyph.ts` (the R-E8 "one code path" rule
 * applied to the glyph the door also uses); this function is only the ghost's
 * argument set — `cellSize * 0.30` box, knock out to the cell ground, cross-faded
 * by `notchAlpha`, `punch` = the wall's own current fill so a partial alpha stays
 * artifact-free.
 */
function paintNotch(
  g: Graphics2D,
  cx: number,
  cy: number,
  box: number,
  glyph: PhaseGlyph,
  knockout: number,
  fill: number,
  alpha: number,
): void {
  paintPhaseGlyph(g, { cx, cy, box, glyph, ink: knockout, punch: fill, alpha });
}

/**
 * Paint one wall tile. Called every frame while a flip is running (≤ 15 tiles on
 * the shipped boards) and whenever the state changes otherwise — never by
 * creating or destroying a display object (R-E6).
 */
export function paintWall(ctx: WallPaintContext): void {
  const { g, rect, radius, look } = ctx;
  const side = Math.min(rect.w, rect.h) * look.footprint;
  const x = rect.x + (rect.w - side) / 2;
  const y = rect.y + (rect.h - side) / 2;
  const inner = Math.max(1, radius * (look.footprint / 0.88));

  g.fillStyle(look.fill, look.fillAlpha);
  g.fillRoundedRect(x, y, side, side, inner);

  if (look.strokeAlpha > 0.01 && look.strokeWidth > 0.25) {
    g.lineStyle(look.strokeWidth, look.strokeColor, look.strokeAlpha);
    g.strokeRoundedRect(x, y, side, side, inner);
  }

  if (look.edgeAlpha > 0.01 && look.edgeWidth > 0.25) {
    g.lineStyle(look.edgeWidth, look.edgeColor, look.edgeAlpha);
    const inset = look.edgeWidth / 2;
    g.strokeRoundedRect(x + inset, y + inset, side - look.edgeWidth, side - look.edgeWidth, inner);
  }

  if (look.notchAlpha > 0.01) {
    paintNotch(
      g,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      ctx.rect.w * 0.3,
      ctx.glyph,
      ctx.knockout,
      look.fill,
      look.notchAlpha,
    );
  }
}