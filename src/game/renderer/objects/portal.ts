/**
 * Portal painter (M2 / L36) — `docs/ui-ux.md` §3.1c + §3.1e, the reserved inactive
 * portal and (V0.9.6) the live raster mount.
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
 * ── §3.1e (GAME-003) — the live figure is now the signed raster ──────────────
 * U-001 found the signed A-06 portal pair **unmounted**; §3.1e is the mount
 * contract, and the readability law is one line: *the live portal is the signed
 * raster — mounted by the measured phase mapping, sized so its visible ring lands
 * on §5.1's rank-5 ceiling; the dormant portal is the §3.1c vector outline — drawn,
 * never dimmed; and the state channel is the swirl, which the raster bakes and the
 * vector withholds.* Concretely:
 *
 * - **R-PM1 — the phase mapping is measured, not suffixed.** Phase A mounts
 *   `portal_b`, Phase B mounts `portal_a` (the pair's alpha is bit-identical, so the
 *   suffix convention is a defect and the mapping is a colour measurement or
 *   nothing). The key arrives resolved from `theme/assets.ts` `portalSlotFor`; this
 *   painter never retypes a manifest name and never derives one from the phase letter.
 * - **R-PM2 — the dormant state is drawn, never dimmed.** No tint of the signed
 *   bytes, ever; a dimmed raster still shows its baked swirl (a false "live" read).
 *   State changes render by **swap in place on the same container**: when the raster
 *   is mounted, the vector outline becomes the *dormant* half of the cross-fade
 *   (`alpha = 1 - activeMix`, swirl suppressed — the raster bakes it) and the sprite
 *   is the live half (`alpha = activeMix`). Nothing is created or destroyed.
 * - **R-PM3 — size and pivot.** Art box = `0.70 / 0.788 ≈ 0.888 × cell`,
 *   centre-pivoted, so the visible form lands on rank 5's `0.70 × cell` ceiling (the
 *   R-005a R-1 pattern: delivered files bake their own framing band). §3.1d
 *   occlusion is unchanged (portal in its own slot, actor always above).
 *
 * Two flagged deviations remain, both reported in DESIGN_IMPACT:
 *
 * 1. **Vector size.** R-C1 gives the portal silhouette ("diamond outline with inner
 *    swirl") but no size; §5.1 rank 5 gives the class's allowed area (70 % of a
 *    cell), which is the only number the spec offers, so the **dormant vector**
 *    diamond's bounding box is 0.70 × cell. A rank-5 outline at 70 % stays strictly
 *    subordinate to the rank-3 blockers (88 % filled) and the rank-4 ghosts (80 %),
 *    which is what §5.1's column is for. The live raster's *visible* form is the same
 *    0.70 ceiling via R-PM3's framing correction.
 * 2. **Placeholder status (superseded by GAME-003).** §9.1 lists portals as
 *    `DEV PLACEHOLDER → A-06 diamond outline`, and since GAME-003 `portal_a` /
 *    `portal_b` are **resolved** rows in `theme/assets.ts` (R-PM5). The vector
 *    figure is now the *permanent dormant figure* (R-PM2: drawn, never dimmed) and
 *    the fallback when the raster fails to mount, exactly as A-03/A-04/A-05/A-06's
 *    vectors are for their slots.
 */

import type { Rect } from "@/game/renderer/grid-mapping";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import type { TileObjectArtPort } from "@/game/renderer/objects/registry";
import { lerpColorInt, toInt } from "@/game/theme/tokens";
import type { ThemeTokens } from "@/game/theme/tokens";

/** §5.1 rank 5: the class's allowed area — the diamond's bounding box, 70 % of a cell. */
export const PORTAL_FOOTPRINT = 0.7;
/** The same 2 px outline constant as every other thin object stroke (§3.1a). */
const STROKE_CSS = 2;
/** The swirl's stroke: thinner than the outline so it stays a *secondary* figure. */
const SWIRL_STROKE_CSS = 1.5;

/**
 * §3.1e R-PM3 / audit R-T06: the delivered pair is framed at **78.7 × 78.9 %** of its
 * 512² canvas (α ≥ 128 bbox). One scalar, because the two axes differ by 0.2 pt.
 */
export const PORTAL_ART_FRAMING = 0.788;

/**
 * The delivered file's **box** size as a fraction of the cell: the visible form must
 * land on §5.1 rank 5's 0.70 × cell ceiling, so the box is that footprint divided by
 * the baked framing — `0.70 / 0.788 ≈ 0.888 × cell` (R-PM3's own number). A literal
 * 0.70 box would land the form ≈ 0.55 cell, ~21 % under the ceiling.
 */
export const PORTAL_ART_BOX = PORTAL_FOOTPRINT / PORTAL_ART_FRAMING;

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
  /**
   * The view's art registry (`objects/registry.ts`); absent = no delivered art, so
   * the §3.1c vector figure draws exactly as it did before integration.
   */
  readonly art?: TileObjectArtPort;
  /**
   * The **live raster's** texture key for this end (§3.1e R-PM1) — resolved by the
   * caller from the portal's own `activePhase` through `portalSlotFor`, never derived
   * from a phase letter here. `undefined` = no key (no art to draw).
   */
  readonly liveKey?: string;
  /**
   * The display-object instance key when **two ends share one texture key** (the
   * portal pair): the view registers one image per end, so this selects which one.
   */
  readonly instance?: string;
}

/**
 * Paint one portal end: the live signed raster when it is mounted, with the §3.1c
 * vector figure as the dormant half of an in-place swap (R-PM2); the vector alone
 * when no art is mounted (the pre-integration — and failed-mount — board, byte for
 * byte).
 *
 * The diamond is a path (four vertices, closed, stroked), never a fill: R-C2 puts the
 * portal on the hollow side in **both** states.
 */
export function paintPortal(ctx: PortalPaintContext): void {
  const { g, look } = ctx;
  const parts = portalParts(ctx.rect, ctx.cell, ctx.cssScale);

  const art = ctx.art;
  const liveKey = ctx.liveKey;
  const live = art !== undefined && liveKey !== undefined && art.has(liveKey) ? liveKey : null;

  // R-PM2 — with the raster mounted the vector becomes the *dormant* half of the
  // cross-fade; with no art it is the whole figure at full opacity (the unchanged
  // pre-integration paint). `activeMix` is 0 dormant → 1 live, so `1 - activeMix`
  // is exactly its alpha. This is a fade between the two figures, never a dimmed or
  // tinted raster.
  const vectorAlpha = live === null ? 1 : 1 - look.swirlAlpha;

  // DEV PLACEHOLDER — the A-06 portal half's §3.1c vector outline: the dormant
  // figure (drawn, never dimmed) and the permanent fallback if the raster 404s.
  if (vectorAlpha > 0.01) {
    g.lineStyle(parts.strokeWidth, look.stroke, vectorAlpha);
    g.beginPath();
    g.moveTo(parts.cx, parts.cy - parts.half);
    g.lineTo(parts.cx + parts.half, parts.cy);
    g.lineTo(parts.cx, parts.cy + parts.half);
    g.lineTo(parts.cx - parts.half, parts.cy);
    g.closePath();
    g.strokePath();
  }

  if (art !== undefined && live !== null) {
    // Live raster — the signed bytes at R-PM3's measured art box, centre-pivoted, so
    // the *visible* form lands on rank 5's 0.70 ceiling while the box bakes the
    // file's own framing band. Never tinted (R-PM2/R-PM4); alpha is the live half of
    // the in-place dormant↔live swap on the one container.
    const box = ctx.cell * PORTAL_ART_BOX;
    art.draw(live, parts.cx, parts.cy, box, box, {
      alpha: look.swirlAlpha,
      instance: ctx.instance,
    });
    return;
  }

  if (look.swirlAlpha <= 0.01) return;
  g.lineStyle(parts.swirlStrokeWidth, look.swirl, look.swirlAlpha);
  for (const arc of parts.swirl) {
    g.beginPath();
    g.arc(parts.cx, parts.cy, arc.radius, arc.startAngle, arc.endAngle);
    g.strokePath();
  }
}