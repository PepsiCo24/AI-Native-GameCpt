/**
 * Portal painter (M2 / L36) — `docs/ui-ux.md` §3.1c, the reserved inactive portal.
 *
 * A portal is **hollow in both states** (R-C2: stepping onto a portal tile is legal
 * whether or not it triggers; only the *teleport* is conditional), so the fill axis
 * that separates `wall ↔ wallEcho` has nothing to separate here — an "echo portal"
 * drawn hollow would have been indistinguishable from an active one. V0.5 therefore
 * redefined the `*Echo` family name as *"belongs to the other phase / inactive now"*
 * with a **per-class** discriminating channel, and for portals it is:
 *
 * | | active | inactive (`portalEcho`) |
 * |---|---|---|
 * | outline | 2 px `obj.portal` | 2 px `obj.portalEcho` (80/20 derived, R-C12) |
 * | **swirl** | **present** | **absent** |
 *
 * Swirl presence/absence is a structural channel — the same species as the wall's
 * edge on/off (§3.1a) — greyscale- and CVD-proof by construction; the value step is
 * the backup, never the argument (§3.1c). The flip swaps token + swirl visibility
 * **on the same sprite** (the R-E6 pattern, R-D8's one-code-path rule): this painter
 * takes an already-mixed `activeMix` and a `swirlAlpha`, so there is no phase branch
 * here — the caller resolves the state, exactly as the door's `retract` works.
 *
 * Two flagged deviations, both reported in DESIGN_IMPACT:
 *
 * 1. **Size.** R-C1 gives the portal a silhouette ("diamond outline with inner
 *    swirl") but no size; §5.1 rank 5 gives the class's allowed area (70 % of a
 *    cell), which is the only number the spec offers, so the diamond's **bounding
 *    box** is 0.70 × cell. A rank-5 outline at 70 % stays strictly subordinate to
 *    the rank-3 blockers (88 % filled) and the rank-4 ghosts (80 %), which is what
 *    §5.1's column is for.
 * 2. **Placeholder status.** §9.1 lists portals as `DEV PLACEHOLDER → A-06 diamond
 *    outline`, but `PLACEHOLDER_TO_ASSET` maps `A-06` to the **goal** alone
 *    (`src/game/theme/assets.ts`), and §3.1c marks the whole portal row
 *    **RESERVED until M2**. This painter is therefore vector-by-design for this
 *    slice and registers **no** placeholder id: inventing a second `A-06` binding
 *    would either duplicate a manifest row or silently claim the goal's art for the
 *    portal. When M2 ships, §3.1c's Stage-5 flag decides between a no-swirl sprite
 *    variant and keeping portals vector-drawn.
 */

import type { Rect } from "@/game/renderer/grid-mapping";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { lerpColorInt, toInt } from "@/game/theme/tokens";
import type { ThemeTokens } from "@/game/theme/tokens";

/** §5.1 rank 5: the class's allowed area — the diamond's bounding box, 70 % of a cell. */
export const PORTAL_FOOTPRINT = 0.7;
/** The same 2 px outline constant as every other thin object stroke (§3.1a). */
const STROKE_CSS = 2;
/** The swirl's stroke: thinner than the outline so it stays a *secondary* figure. */
const SWIRL_STROKE_CSS = 1.5;

/**
 * The swirl (extension of §3.1c's "inner swirl", which the spec does not draw):
 * two concentric arcs of different radius and angular range, centred on the
 * diamond. Presence/absence is the load-bearing part, so the shape only has to read
 * as "there is something turning in here" against "there is nothing".
 */
export const PORTAL_SWIRL_ARCS = [
  { radius: 0.55, startTurns: 0.35, endTurns: 1.55 },
  { radius: 0.3, startTurns: 1.35, endTurns: 2.35 },
] as const;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** The portal construction for one tile, in device px. */
export interface PortalParts {
  readonly cx: number;
  readonly cy: number;
  /** Half the diamond's bounding box: the outline passes through the 4 axis points. */
  readonly half: number;
  readonly strokeWidth: number;
  readonly swirlStrokeWidth: number;
  readonly swirl: readonly {
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
  }[];
}

/** @param cell `min(rect.w, rect.h)` in device px; @param cssScale R-L6 render scale. */
export function portalParts(rect: Rect, cell: number, cssScale: number): PortalParts {
  const half = (cell * PORTAL_FOOTPRINT) / 2;
  return {
    cx: rect.x + rect.w / 2,
    cy: rect.y + rect.h / 2,
    half,
    strokeWidth: STROKE_CSS * cssScale,
    swirlStrokeWidth: SWIRL_STROKE_CSS * cssScale,
    swirl: PORTAL_SWIRL_ARCS.map((arc) => ({
      radius: half * arc.radius,
      startAngle: arc.startTurns * Math.PI,
      endAngle: arc.endTurns * Math.PI,
    })),
  };
}

/** The resolved portal look: muted outline + no swirl, or full token + swirl. */
export interface PortalLook {
  /** `obj.portalEcho` (inactive) → `obj.portal` (active), cross-faded by the caller. */
  readonly stroke: number;
  readonly swirl: number;
  /** 0 = absent, 1 = present — §3.1c's primary channel. */
  readonly swirlAlpha: number;
}

export function portalLook(tokens: ThemeTokens, activeMix: number): PortalLook {
  const mix = clamp01(activeMix);
  return {
    stroke: lerpColorInt(toInt(tokens.obj.portalEcho), toInt(tokens.obj.portal), mix),
    swirl: toInt(tokens.obj.portal),
    swirlAlpha: mix,
  };
}

export interface PortalPaintContext {
  readonly g: Graphics2D;
  readonly rect: Rect;
  /** `min(rect.w, rect.h)`, device px. */
  readonly cell: number;
  readonly cssScale: number;
  readonly look: PortalLook;
}

/**
 * Paint one portal end. The diamond is a path (four vertices, closed, stroked),
 * never a fill: R-C2 puts the portal on the hollow side in **both** states.
 */
export function paintPortal(ctx: PortalPaintContext): void {
  const { g, look } = ctx;
  const parts = portalParts(ctx.rect, ctx.cell, ctx.cssScale);

  g.lineStyle(parts.strokeWidth, look.stroke, 1);
  g.beginPath();
  g.moveTo(parts.cx, parts.cy - parts.half);
  g.lineTo(parts.cx + parts.half, parts.cy);
  g.lineTo(parts.cx, parts.cy + parts.half);
  g.lineTo(parts.cx - parts.half, parts.cy);
  g.closePath();
  g.strokePath();

  if (look.swirlAlpha <= 0.01) return;
  g.lineStyle(parts.swirlStrokeWidth, look.swirl, look.swirlAlpha);
  for (const arc of parts.swirl) {
    g.beginPath();
    g.arc(parts.cx, parts.cy, arc.radius, arc.startAngle, arc.endAngle);
    g.strokePath();
  }
}