/**
 * Switch painter (M3) — `docs/ui-ux.md` §3.1/R-C1's switch row, plus the two
 * things the spec leaves undecided. Both are marked here rather than improvised
 * silently, and both are reported in the task's DESIGN_IMPACT.
 *
 * **What the spec fixes.** R-C1's silhouette: *"switch — small square outline,
 * 40 % of cell, corner dot when on"*, fill rule **hollow**, attention rank 5
 * (§5.1), passable in both states (R-C2 — a switch can never refuse a move).
 * §3.1d puts it below the goal and above the portal. Nothing else about it exists:
 * R-C8 forbids any idle animation ("exactly one element may animate on an idle
 * board: the goal"), and §6.2/§6.5 give it no timing row of its own.
 *
 * **Extension 1 — the owning-phase glyph (spec silent).** A switch's
 * `activePhase` decides *when* it can fire, and a hollow 40 % square alone cannot
 * say that: a player standing next to two switches has no way to know which one
 * acts now, and the M3 lesson ("this tile toggles, but only in one phase") would
 * be invisible. §3.1's own logic supplies the answer — "the sun/crescent always
 * names the **owning phase** of the object" (§3.1b, unified with walls) — so the
 * switch draws the **same** R-C1 glyph, small, in the switch token, centred in its
 * outline. It is drawn in **both** phases, matching the door (R-D4) rather than
 * the ghost (R-E4): it is the only non-colour channel between "acts in Day" and
 * "acts in Night", so it may not be size-gated off. Ink + punch, not knockout: the
 * switch is hollow, so the crescent's punch restores the cell ground.
 *
 * **Extension 2 — the press beat (spec silent).** A switch press is the one
 * moment where the player needs confirmation that the tile *did* something
 * ("反应即学习"). §6.2 gives exactly one row for a resolution beat at the player's
 * tile — the `occupied` row, 140–220 ms — so the press is a **one-shot emphasis on
 * that row**: `switchPressEmphasis(p) = sin(πp)` widens the outline from 2 to 3 CSS
 * px and returns to 2 by the end of the beat. It is deliberately **not** a ring,
 * a flash or a colour change: R-C8 forbids idle animation, R-Z7 forbids a
 * cell-anchored marker on the tile the player occupies, and §6.3 forbids any
 * reactive flash on an object. The on/off dot cross-fades on the same §6.2 row the
 * walls use for their state swap, so nothing here is a new timing concept.
 *
 * The two independent axes stay independent: **the glyph names the phase** (which
 * object this is), **the corner dot names the state** (on / off, presence/absence
 * — greyscale- and CVD-proof by construction, §3.1c's structural-channel species),
 * and neither is ever carried by colour alone (R-C1).
 */

import type { Phase } from "@/core/state/phase";
import type { Rect } from "@/game/renderer/grid-mapping";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { paintPhaseGlyph, phaseGlyphFor } from "@/game/renderer/objects/glyph";
import { toInt } from "@/game/theme/tokens";
import type { PhaseGlyph, ThemeTokens } from "@/game/theme/tokens";

/** R-C1: the switch outline is 40 % of the cell, hollow in both states. */
export const SWITCH_FOOTPRINT = 0.4;
/** §3.1a's stroke constant, for the same reason: every thin outline is 2 CSS px. */
const STROKE_CSS = 2;
/** The press beat's extra width: 2 → 3 CSS px and back (one-shot, 140–220 ms). */
const PRESS_STROKE_CSS = 1;
/** R-C1's "corner dot when on" — Ø `max(4, round(cell * 0.09))`, presence/absence. */
const DOT_MIN_CSS = 4;
const DOT_DIAMETER_FRACTION = 0.09;
/** Extension 1: the glyph box inside the 40 % outline, `max(7, round(cell * 0.18))`. */
const GLYPH_BOX_MIN_CSS = 7;
const GLYPH_BOX_FRACTION = 0.18;
/** The outline's corner radius — the small-square echo of the R-L3 cell radius. */
const CORNER_RADIUS_FRACTION = 0.18;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * The one-shot press emphasis of §6.2's `occupied` row (extension 2): 0 at both
 * ends of the beat, 1 at its midpoint. A settled board (`p = 1`) therefore reads
 * 0 — the emphasis can only ever be a *transition*, never an idle pulse (R-C8).
 */
export function switchPressEmphasis(occupiedProgress: number): number {
  const p = clamp01(occupiedProgress);
  return Math.sin(Math.PI * p);
}

/** The whole switch construction for one tile, in device px. */
export interface SwitchParts {
  /** The 40 % outline box, centred in the cell. */
  readonly box: Rect;
  readonly radius: number;
  readonly strokeWidth: number;
  /** The "on" dot, centred on the outline's top-right corner (R-C1). */
  readonly dot: { readonly x: number; readonly y: number; readonly radius: number };
  readonly glyphBox: number;
}

/**
 * Build the switch geometry for one tile.
 *
 * @param cell `min(rect.w, rect.h)` in device px.
 * @param cssScale R-L6 render scale (°CSS-px floors scale with the target).
 * @param emphasis 0 = rest, 1 = the press beat's midpoint (see
 *   {@link switchPressEmphasis}).
 */
export function switchParts(
  rect: Rect,
  cell: number,
  cssScale: number,
  emphasis: number,
): SwitchParts {
  const side = cell * SWITCH_FOOTPRINT;
  const x = rect.x + (rect.w - side) / 2;
  const y = rect.y + (rect.h - side) / 2;
  const dotDiameter = Math.max(DOT_MIN_CSS * cssScale, Math.round(cell * DOT_DIAMETER_FRACTION));
  return {
    box: { x, y, w: side, h: side },
    radius: Math.max(1, Math.round(side * CORNER_RADIUS_FRACTION)),
    strokeWidth: (STROKE_CSS + PRESS_STROKE_CSS * clamp01(emphasis)) * cssScale,
    dot: { x: x + side, y, radius: dotDiameter / 2 },
    glyphBox: Math.max(GLYPH_BOX_MIN_CSS * cssScale, Math.round(cell * GLYPH_BOX_FRACTION)),
  };
}

/**
 * The resolved switch look. `dotAlpha` is the on/off channel carried as
 * presence/absence; `emphasis` is the press beat.
 */
export interface SwitchLook {
  /**
   * `obj.switch` — one token in both latch states (the on/off channel is the dot,
   * R-C1) and still **per-phase in value** (R-C10: same hue family, value and
   * temperature flip with the phase, cross-faded by `renderer/theme-mix.ts`).
   */
  readonly outline: number;
  /** The owning phase's glyph (extension 1). */
  readonly glyph: PhaseGlyph;
  /** 0 = off (no dot), 1 = on (dot at full token strength). */
  readonly dotAlpha: number;
  /** 0 = rest, 1 = the press beat's midpoint. */
  readonly emphasis: number;
}

export function switchLook(
  tokens: ThemeTokens,
  activePhase: Phase,
  dotAlpha: number,
  emphasis: number,
): SwitchLook {
  return {
    outline: toInt(tokens.obj.switch),
    glyph: phaseGlyphFor(activePhase),
    dotAlpha: clamp01(dotAlpha),
    emphasis: clamp01(emphasis),
  };
}

export interface SwitchPaintContext {
  readonly g: Graphics2D;
  readonly rect: Rect;
  /** `min(rect.w, rect.h)`, device px. */
  readonly cell: number;
  readonly cssScale: number;
  readonly look: SwitchLook;
  /** The tile's own cell ground — the crescent's punch target (the switch is hollow). */
  readonly knockout: number;
}

/** Paint one switch tile. Static apart from the one-shot press beat (R-C8). */
export function paintSwitch(ctx: SwitchPaintContext): void {
  const { g, look } = ctx;
  const parts = switchParts(ctx.rect, ctx.cell, ctx.cssScale, look.emphasis);

  // 1 — the hollow outline (R-C1: "small square outline", fill rule hollow).
  g.lineStyle(parts.strokeWidth, look.outline, 1);
  g.strokeRoundedRect(parts.box.x, parts.box.y, parts.box.w, parts.box.h, parts.radius);

  // 2 — the owning-phase glyph, in both phases and at every cell size (extension 1).
  paintPhaseGlyph(g, {
    cx: parts.box.x + parts.box.w / 2,
    cy: parts.box.y + parts.box.h / 2,
    box: parts.glyphBox,
    glyph: look.glyph,
    ink: look.outline,
    punch: ctx.knockout,
    alpha: 1,
  });

  // 3 — the corner dot: the on/off state as presence/absence (R-C1). Drawn last so
  // it can never be covered by the glyph, and skipped entirely when off.
  if (look.dotAlpha <= 0.01) return;
  g.fillStyle(look.outline, look.dotAlpha);
  g.fillCircle(parts.dot.x, parts.dot.y, parts.dot.radius);
}