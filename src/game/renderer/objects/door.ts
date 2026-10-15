/**
 * Door painter — `docs/ui-ux.md` §3.1b, the binding open/closed contract.
 *
 * A closed door is the wall grammar applied to a second class: **closed = the
 * SOLID side** (3 full-width solid bars + medallion), **open = the HOLLOW side**
 * (frame + 4 corner stubs + medallion floating in an empty passage). The state is
 * carried by **geometry**, never by a colour swap (R-D2: "no desaturation, no
 * dichromat simulation and no dirty phone screen can collapse it"), and the door
 * picks the **same token in both states** (§3.1b Proposal 2, R-C10/R-C12: open and
 * closed never change the colour family — only the geometry). That is *not* the same
 * **value in both phases**: R-C10 flips value and temperature with the phase
 * (`obj.doorRed` `#B03A32` in A → `#FF8A7A` in B), so a flip does repaint this
 * painter's ink and §6.2's `tokens` row cross-fades it (`renderer/theme-mix.ts`).
 * The only state-dependent additions are the two formula-derived `*Occupied`
 * tokens, used when the player legally stands inside a closed door (R-D7).
 *
 * | property | closed | open | channel |
 * |---|---|---|---|
 * | frame | rounded square, 2 px stroke, 88 % of cell, R-L3 radius | **identical** | identity (constant, R-D3) |
 * | bars | 3 bars, height `max(3, round(cell * 0.12))`, centred at 25/50/75 % | 0 full-width bars: 4 corner stubs `round(0.18 * footprint)` (cap ≤ 20 %), flush to the frame's inner edges; the middle bar is gone | **fill / mass — primary** |
 * | passage | ground gaps ≈ `0.10 * cell` between bars | empty: interior = `ground.cell`, **never tinted** (R-D5) | mass distribution |
 * | medallion | filled disc Ø `max(13, round(cell * 0.34))`, fused with the middle bar | identical disc, floating | identity (constant) |
 * | glyph | knockout to `ground.cell`: sun = red (opens in A), crescent = blue (opens in B), box `max(9, round(cell * 0.22))` | identical | R-C6 CVD channel, **never size-gated** (R-D4) |
 *
 * Three implementation notes that the picture depends on:
 *
 * 1. **The two halves of a bar.** Closed = *one* full-width bar and open = *two*
 *    edge-anchored stubs, so the retraction can only be one continuous scalar if
 *    each bar row is drawn as two rects that are flush at the centre when closed
 *    (their union is exactly the spec's bar, and the seam is invisible: adjacent
 *    rects, one token, no stroke). `retract` therefore lerps *each half* from
 *    `innerWidth / 2` (closed) to `stubWidth` (top/bottom rows, R-D2's "4 corner
 *    stubs") or to `0` (middle row, "the middle bar is gone"). No state branch,
 *    no sprite created or destroyed by a flip (R-D8).
 * 2. **The frame is drawn first and never changes colour** — R-D7 keeps it at the
 *    full door token at every cell size while the bars/medallion drop to the
 *    occupied token, exactly as the occupied wall keeps its `obj.wallEdge` stroke.
 * 3. **The interior is never filled**: the only shapes inside the frame are the
 *    bars, the medallion and the glyph knockout. A `fillRoundedRect` over the
 *    frame area would be the R-D5 violation that collapses the open door into
 *    "tinted square" — the ghost's own treatment.
 */

import type { DoorDef } from "@/core/level";
import type { Rect } from "@/game/renderer/grid-mapping";
import { doorOwnerPhase } from "@/game/renderer/cell-state";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { paintPhaseGlyph, phaseGlyphFor } from "@/game/renderer/objects/glyph";
import { lerpColorInt, toInt } from "@/game/theme/tokens";
import type { PhaseGlyph, ThemeTokens } from "@/game/theme/tokens";

/** §3.1b: frame = 88 % of the cell, **constant across states** (R-D3). */
export const DOOR_FOOTPRINT = 0.88;
/** §3.1b: every stroke in this construction is 2 CSS px (`max(3, …)` floors are CSS px too). */
const STROKE_CSS = 2;
const BAR_HEIGHT_MIN_CSS = 3;
const BAR_HEIGHT_FRACTION = 0.12;
/** §3.1b: bars centred at 25 / 50 / 75 % of the footprint; index 1 is the middle bar. */
export const DOOR_BAR_ROWS = [0.25, 0.5, 0.75] as const;
const MIDDLE_ROW = 1;
/** §3.1b: open-state corner stub = `round(0.18 * footprint)`, capped at 20 % of it. */
export const DOOR_STUB_WIDTH_FRACTION = 0.18;
export const DOOR_STUB_WIDTH_CAP = 0.2;
/** §3.1b: medallion Ø = `max(13, round(cell * 0.34))` — R-C2's ≤ 10 % cell² exception. */
const MEDALLION_MIN_CSS = 13;
const MEDALLION_DIAMETER_FRACTION = 0.34;
/** §3.1b / R-D4: knockout glyph box = `max(9, round(cell * 0.22))`, never size-gated off. */
const GLYPH_BOX_MIN_CSS = 9;
const GLYPH_BOX_FRACTION = 0.22;

/** Below this a half-bar is not worth a draw call (it is a lerp artifact, not a shape). */
const MIN_DRAW_PX = 0.5;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * §3.1b's formulas. `cell` is the cell side in **device px** (`min(rect.w, rect.h)`)
 * and `cssScale = min(devicePixelRatio, 2)` (R-L6): at `cssScale = 1` these are
 * §3.1b's expressions verbatim, and at `cssScale = 2` the `max(3, …)` / `max(9, …)`
 * / `max(13, …)` CSS-px floors scale with the target instead of vanishing into it.
 */
export function doorBarHeight(cell: number, cssScale: number): number {
  return Math.max(BAR_HEIGHT_MIN_CSS * cssScale, Math.round(cell * BAR_HEIGHT_FRACTION));
}

/** `round(0.18 * footprint)`, with the R-D2 cap ≤ 20 % of the footprint width. */
export function doorStubWidth(footprintSide: number): number {
  return Math.min(
    Math.round(footprintSide * DOOR_STUB_WIDTH_FRACTION),
    Math.round(footprintSide * DOOR_STUB_WIDTH_CAP),
  );
}

export function doorMedallionDiameter(cell: number, cssScale: number): number {
  return Math.max(MEDALLION_MIN_CSS * cssScale, Math.round(cell * MEDALLION_DIAMETER_FRACTION));
}

export function doorGlyphBox(cell: number, cssScale: number): number {
  return Math.max(GLYPH_BOX_MIN_CSS * cssScale, Math.round(cell * GLYPH_BOX_FRACTION));
}

/**
 * One bar row drawn as two edge-anchored halves. At `retract = 0` the halves are
 * flush at the frame's centre and their union is §3.1b's full-width bar; at
 * `retract = 1` the top/bottom rows are the two corner stubs and the middle row
 * has no ink at all.
 */
export interface DoorBarRow {
  /** Row centre (device px). */
  readonly cy: number;
  readonly height: number;
  readonly leftX: number;
  readonly leftWidth: number;
  readonly rightX: number;
  readonly rightWidth: number;
}

/** The whole §3.1b construction for one tile, in device px. */
export interface DoorParts {
  /** The frame's outer rounded rect (88 % of the cell), centred in `rect`. */
  readonly frame: Rect;
  readonly radius: number;
  readonly strokeWidth: number;
  /** Always 3 rows (25/50/75 %); width 0 means "no ink in this state". */
  readonly bars: readonly DoorBarRow[];
  readonly medallion: { readonly x: number; readonly y: number; readonly radius: number };
  readonly glyphBox: number;
}

/**
 * Build the door's geometry for one tile at one retraction value.
 *
 * @param rect the cell rect, device px (the frame is centred inside it).
 * @param radius the cell's R-L3 corner radius; the frame keeps it at 88 % — the
 *   wall's own `radius * (footprint / 0.88)` expression, which at the door's
 *   constant 88 % footprint is exactly `radius`.
 * @param cell `min(rect.w, rect.h)` — passed in so no caller re-derives it.
 * @param cssScale R-L6 render scale.
 * @param retract 0 = closed (3 full-width bars), 1 = open (4 stubs, empty passage).
 */
export function doorParts(
  rect: Rect,
  radius: number,
  cell: number,
  cssScale: number,
  retract: number,
): DoorParts {
  const t = clamp01(retract);
  const side = cell * DOOR_FOOTPRINT;
  const x = rect.x + (rect.w - side) / 2;
  const y = rect.y + (rect.h - side) / 2;
  const strokeWidth = STROKE_CSS * cssScale;
  const innerX = x + strokeWidth / 2;
  const innerWidth = side - strokeWidth;

  const barHeight = doorBarHeight(cell, cssScale);
  const stub = doorStubWidth(side);
  const closedHalf = innerWidth / 2;

  const bars = DOOR_BAR_ROWS.map((fraction, index) => {
    const openHalf = index === MIDDLE_ROW ? 0 : stub;
    const half = closedHalf + (openHalf - closedHalf) * t;
    return {
      cy: y + side * fraction,
      height: barHeight,
      leftX: innerX,
      leftWidth: half,
      // The right half stays anchored to the frame's inner edge: `innerX + innerWidth`
      // is exactly that edge, so the two halves are flush when closed and symmetric
      // at every intermediate value.
      rightX: innerX + innerWidth - half,
      rightWidth: half,
    };
  });

  const medallionDiameter = doorMedallionDiameter(cell, cssScale);
  return {
    frame: { x, y, w: side, h: side },
    radius: Math.max(1, radius),
    strokeWidth,
    bars,
    medallion: {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
      radius: medallionDiameter / 2,
    },
    glyphBox: doorGlyphBox(cell, cssScale),
  };
}

/**
 * The resolved door look. `frame` and `body` differ only under R-D7's occupied
 * treatment; `retract` is the state.
 */
export interface DoorLook {
  /** The 2 px frame — full door token at **every** cell size, occupied or not (R-D7). */
  readonly frame: number;
  /** Bars + medallion — full door token, or `*Occupied` while the player is inside. */
  readonly body: number;
  readonly glyph: PhaseGlyph;
  /** 0 = closed, 1 = open. */
  readonly retract: number;
  /** 0 = full strength, 1 = the R-D7 occupied interior drop. */
  readonly occupant: number;
}

/**
 * `obj.doorRed` / `obj.doorBlue` are **per-phase** values (R-C10: same hue family,
 * value and temperature flip with the phase), so the token comes from the **mixed**
 * map the caller passes in — the caller is what makes this a cross-fade instead of a
 * step. The colour *family* is the only thing `color` decides — never the state
 * (R-D8: open/closed is a derived render flag, not a colour decision).
 */
export function doorLook(
  tokens: ThemeTokens,
  color: DoorDef["color"],
  retract: number,
  occupant: number,
): DoorLook {
  const red = color === "red";
  const full = toInt(red ? tokens.obj.doorRed : tokens.obj.doorBlue);
  const occupied = toInt(red ? tokens.obj.doorRedOccupied : tokens.obj.doorBlueOccupied);
  const mix = clamp01(occupant);
  return {
    frame: full,
    body: lerpColorInt(full, occupied, mix),
    glyph: phaseGlyphFor(doorOwnerPhase(color)),
    retract: clamp01(retract),
    occupant: mix,
  };
}

export interface DoorPaintContext {
  readonly g: Graphics2D;
  readonly rect: Rect;
  readonly radius: number;
  /** `min(rect.w, rect.h)`, device px. */
  readonly cell: number;
  readonly cssScale: number;
  readonly look: DoorLook;
  /** R-D3: the glyph is knocked out to the tile's own cell ground. */
  readonly knockout: number;
}

/**
 * Paint one door tile. Every frame during a flip (one door tile on the shipped
 * L6–L10 boards, up to a handful later) and whenever the state changes otherwise;
 * never by creating or destroying a display object (R-D8).
 */
export function paintDoor(ctx: DoorPaintContext): void {
  const { g, look } = ctx;
  const parts = doorParts(ctx.rect, ctx.radius, ctx.cell, ctx.cssScale, look.retract);

  // 1 — the frame: identity, identical in both states (R-D3), full token at every
  // cell size even when occupied (R-D7).
  g.lineStyle(parts.strokeWidth, look.frame, 1);
  g.strokeRoundedRect(parts.frame.x, parts.frame.y, parts.frame.w, parts.frame.h, parts.radius);

  // 2 — the bars: the state channel (R-D2). Two edge-anchored halves per row.
  g.fillStyle(look.body, 1);
  for (const bar of parts.bars) {
    const top = bar.cy - bar.height / 2;
    if (bar.leftWidth >= MIN_DRAW_PX) g.fillRect(bar.leftX, top, bar.leftWidth, bar.height);
    if (bar.rightWidth >= MIN_DRAW_PX) g.fillRect(bar.rightX, top, bar.rightWidth, bar.height);
  }

  // 3 — the medallion: filled identity disc, fused with the middle bar when closed,
  // floating in the empty passage when open. Same size in both states (R-D3).
  g.fillStyle(look.body, 1);
  g.fillCircle(parts.medallion.x, parts.medallion.y, parts.medallion.radius);

  // 4 — the identity glyph: a knockout through the medallion, so it reads at the
  // token's own contrast (R-D3) and carries red↔blue for dichromats (R-C6/R-D4).
  // Never size-gated: unlike the ghost's redundant notch it is load-bearing at the
  // 40 px floor.
  paintPhaseGlyph(g, {
    cx: parts.medallion.x,
    cy: parts.medallion.y,
    box: parts.glyphBox,
    glyph: look.glyph,
    ink: ctx.knockout,
    punch: look.body,
    alpha: 1,
  });
}