/**
 * Door painter evidence — `docs/ui-ux.md` §3.1b (the binding open/closed contract),
 * §4.3/§4.6 (the door token values and the coverage numbers), R-D2, R-D3, R-D4,
 * R-D5, R-D6, R-D7, R-D8.
 *
 * Every assertion below is made against the **draw calls the shipped painter
 * makes** (via `tests/helpers/graphics-recorder.ts`) or against the **geometry the
 * shipped constructor returns** (`doorParts`). There is no parallel door model in
 * this file: the raster coverage sweep consumes `doorParts` + the shipped glyph
 * constants, so it can only disagree with the painter by disagreeing with the
 * spec's arithmetic.
 *
 * Contract summary being checked (cell = `min(rect.w, rect.h)`, all CSS constants
 * scaled by `cssScale`):
 *
 * | property | closed | open |
 * |---|---|---|
 * | frame | rounded square, 2 px, 88 % of cell, R-L3 radius — identical in both | identical |
 * | bars | 3 rows × 2 flush halves, full inner width, height `max(3, round(0.12 c))` | top/bottom rows = 4 corner stubs `round(0.18 side)` (cap 20 %), middle row zero-width |
 * | medallion | 1 filled disc Ø `max(13, round(0.34 c))` | same disc |
 * | glyph | knockout to `ground.cell`, `max(9, round(0.22 c))`, both states, both sizes | identical |
 * | interior | never filled (the fills are bars + medallion only) | never filled |
 */

import { describe, expect, it } from "vitest";
import type { Rect } from "@/game/renderer/grid-mapping";
import {
  DOOR_BAR_ROWS,
  DOOR_FOOTPRINT,
  DOOR_STUB_WIDTH_CAP,
  DOOR_STUB_WIDTH_FRACTION,
  doorBarHeight,
  doorGlyphBox,
  doorLook,
  doorMedallionDiameter,
  doorParts,
  doorStubWidth,
  paintDoor,
} from "@/game/renderer/objects/door";
import { GLYPH } from "@/game/renderer/objects/glyph";
import type { PhaseGlyph } from "@/game/theme/tokens";
import { cellRadius, theme, toInt } from "@/game/theme/tokens";
import { RecordingGraphics } from "../helpers/graphics-recorder";

/** Nominal cell / the R-T5 40 px floor, both at render scale 1 (§3.1b's numbers). */
const CELL_NOMINAL = 56;
const CELL_FLOOR = 40;

function rect(cell: number): Rect {
  return { x: 0, y: 0, w: cell, h: cell };
}

interface PaintOptions {
  readonly cell: number;
  readonly color?: "red" | "blue";
  /** 0 = closed, 1 = open. */
  readonly retract?: number;
  /** R-D7 occupied interior drop. */
  readonly occupant?: number;
  readonly phase?: "A" | "B";
  readonly cssScale?: number;
}

function paint(options: PaintOptions): RecordingGraphics {
  const {
    cell,
    color = "red",
    retract = 0,
    occupant = 0,
    phase = "A",
    cssScale = 1,
  } = options;
  const tokens = theme(phase);
  const g = new RecordingGraphics();
  paintDoor({
    g,
    rect: rect(cell),
    radius: cellRadius(cell),
    cell,
    cssScale,
    knockout: toInt(tokens.ground.cell),
    look: doorLook(tokens, color, retract, occupant),
  });
  return g;
}

describe("door painter — §3.1b frame (identity, constant across states)", () => {
  it("draws exactly one frame, first, at 88 % of the cell with a 2 px stroke", () => {
    for (const cell of [CELL_NOMINAL, CELL_FLOOR]) {
      for (const retract of [0, 0.5, 1]) {
        for (const cssScale of [1, 2]) {
          const g = paint({ cell, retract, cssScale });
          const frames = g.of("strokeRoundedRect");
          expect(frames).toHaveLength(1);
          // Drawn before any state geometry: the frame is the object's identity.
          expect(g.ops[0]).toBe("strokeRoundedRect");

          const [x, y, w, h, radius] = frames[0]!.args as [number, number, number, number, number];
          const side = cell * DOOR_FOOTPRINT;
          expect(w).toBeCloseTo(side, 10);
          expect(h).toBeCloseTo(side, 10);
          // Centred inside the cell rect.
          expect(x).toBeCloseTo((cell - side) / 2, 10);
          expect(y).toBeCloseTo((cell - side) / 2, 10);
          expect(radius).toBe(Math.max(1, cellRadius(cell)));
          expect(frames[0]!.strokeWidth).toBe(2 * cssScale);
        }
      }
    }
  });

  it("keeps the frame at the full door token even when the interior is occupied (R-D7)", () => {
    for (const color of ["red", "blue"] as const) {
      for (const phase of ["A", "B"] as const) {
        const full = toInt(theme(phase).obj[color === "red" ? "doorRed" : "doorBlue"]);
        const g = paint({ cell: CELL_NOMINAL, color, occupant: 1, phase });
        expect(g.of("strokeRoundedRect")[0]!.stroke).toBe(full);
      }
    }
  });
});

describe("door painter — §3.1b bars (the state channel, R-D2)", () => {
  it("closed: 3 rows, each two halves flush at the centre = one full-width bar", () => {
    const cell = CELL_NOMINAL;
    const g = paint({ cell, retract: 0 });
    const bars = g.of("fillRect");
    expect(bars).toHaveLength(3 * 2);

    const side = cell * DOOR_FOOTPRINT;
    const innerWidth = side - 2; // 2 CSS px stroke, cssScale 1
    const barHeight = doorBarHeight(cell, 1);
    const y0 = (cell - side) / 2;

    DOOR_BAR_ROWS.forEach((fraction, row) => {
      const left = bars[row * 2]!;
      const right = bars[row * 2 + 1]!;
      const [lx, ly, lw, lh] = left.args as [number, number, number, number];
      const [rx, , rw, rh] = right.args as [number, number, number, number];

      expect(lh).toBe(barHeight);
      expect(rh).toBe(barHeight);
      // Centred on the row's 25 / 50 / 75 % line inside the footprint.
      expect(ly + lh / 2).toBeCloseTo(y0 + side * fraction, 6);
      // Flush at the centre: the halves' union is exactly one full-width bar.
      expect(lx + lw).toBeCloseTo(rx, 6);
      expect(lw + rw).toBeCloseTo(innerWidth, 6);
      // Edge-anchored: the left half starts at the frame's inner edge — the frame's
      // own origin (the 88 % footprint centred in the cell) plus half the stroke.
      const innerX = (cell - side) / 2 + 1;
      expect(lx).toBeCloseTo(innerX, 6);
      expect(rx + rw).toBeCloseTo(innerX + innerWidth, 6);
    });
  });

  it("open: the middle bar is gone and only 4 corner stubs remain (never a full-width bar)", () => {
    const cell = CELL_NOMINAL;
    const g = paint({ cell, retract: 1 });
    const bars = g.of("fillRect");
    expect(bars).toHaveLength(4);

    const side = cell * DOOR_FOOTPRINT;
    const stub = doorStubWidth(side);
    const barHeight = doorBarHeight(cell, 1);
    const y0 = (cell - side) / 2;

    // Rows 0 and 2 only — the 50 % row has no ink at all.
    const rows = bars.map((call) => (call.args[1] as number) + barHeight / 2);
    for (const rowCentre of rows) {
      const fraction = (rowCentre - y0) / side;
      expect(fraction).not.toBeCloseTo(0.5, 3);
      expect([0.25, 0.75].some((f) => Math.abs(fraction - f) < 1e-6)).toBe(true);
    }
    for (const call of bars) {
      const [, , w, h] = call.args as [number, number, number, number];
      expect(w).toBe(stub);
      expect(h).toBe(barHeight);
      // R-D2: maximum horizontal interior span ≤ 20 % of the frame width.
      expect(w / side).toBeLessThanOrEqual(DOOR_STUB_WIDTH_CAP + 1e-9);
      expect(w).toBeLessThan(side * DOOR_STUB_WIDTH_FRACTION + 1);
    }
  });

  it("mid-retraction each half shrinks monotonically toward its stubs (one scalar, no state branch)", () => {
    const cell = CELL_NOMINAL;
    const side = cell * DOOR_FOOTPRINT;
    // Row 0 is always drawn twice (left/right half) at every retraction, so it is
    // the clean monotonicity witness; the middle row (index 1) reaches *zero ink*,
    // i.e. its two calls disappear entirely — that is asserted separately below.
    const widths = [0, 0.25, 0.5, 0.75, 1].map((retract) => {
      const bars = paint({ cell, retract }).of("fillRect");
      return { row0: bars[0]!.args[2] as number, count: bars.length };
    });
    for (const { row0, count } of widths) {
      expect(row0).toBeLessThanOrEqual((side - 2) / 2 + 1e-9);
      expect(count === 6 || count === 4).toBe(true);
    }
    for (let i = 1; i < widths.length; i += 1) {
      expect(widths[i]!.row0).toBeLessThanOrEqual(widths[i - 1]!.row0 + 1e-9);
    }
    expect(widths[0]!.row0).toBeCloseTo((side - 2) / 2, 6);
    expect(widths[0]!.count).toBe(6);
    expect(widths[widths.length - 1]!.row0).toBe(doorStubWidth(side));
    // The middle row has no ink at all in the open state (R-D2: "the middle bar is gone").
    expect(widths[widths.length - 1]!.count).toBe(4);
  });
});

describe("door painter — medallion + glyph (R-D3, R-D4, R-D5)", () => {
  it("draws exactly one medallion disc, whose Ø is §3.1b's formula, identical in both states", () => {
    for (const cell of [CELL_NOMINAL, CELL_FLOOR]) {
      const radius = doorMedallionDiameter(cell, 1) / 2;
      const closed = paint({ cell, retract: 0, color: "blue" }).of("fillCircle");
      const open = paint({ cell, retract: 1, color: "blue" }).of("fillCircle");
      // Crescent glyph adds two discs (ink + punch); the medallion is the first.
      const medallion = closed[0]!;
      expect(medallion.args[0]).toBe(cell / 2);
      expect(medallion.args[1]).toBe(cell / 2);
      expect(medallion.args[2]).toBeCloseTo(radius, 10);
      expect(open[0]!.args).toEqual(medallion.args);
    }
  });

  it("never fills the interior: no fillRoundedRect / fillEllipse, fills are bars + discs only (R-D5)", () => {
    for (const retract of [0, 0.5, 1]) {
      for (const color of ["red", "blue"] as const) {
        const g = paint({ cell: CELL_NOMINAL, retract, color });
        expect(g.of("fillRoundedRect")).toEqual([]);
        expect(g.of("fillEllipse")).toEqual([]);
        expect(new Set(g.ops).size).toBeLessThanOrEqual(6);
        for (const op of g.ops) {
          expect(["strokeRoundedRect", "fillRect", "fillCircle", "lineBetween"]).toContain(op);
        }
      }
    }
  });

  it("always draws the identity glyph — never size-gated off at the 40 px floor (R-D4)", () => {
    // Sun = red (opens in A): disc + 8 rays. Crescent = blue (opens in B): disc + punch.
    const redSun = paint({ cell: CELL_FLOOR, color: "red" });
    expect(redSun.of("lineBetween")).toHaveLength(GLYPH.sunRays);
    expect(redSun.of("fillCircle")).toHaveLength(2);

    const blueSun = paint({ cell: CELL_NOMINAL, color: "blue" });
    expect(blueSun.of("lineBetween")).toHaveLength(0);
    expect(blueSun.of("fillCircle")).toHaveLength(3);
  });

  it("knocks the glyph out to the cell ground and restores it through the medallion fill", () => {
    const tokens = theme("A");
    const knockout = toInt(tokens.ground.cell);
    const red = paint({ cell: CELL_FLOOR, color: "red" });
    // The sun's ink is the knockout colour (§3.1b: "knockout to ground.cell").
    expect(red.of("fillCircle")[1]!.fill).toBe(knockout);
    expect(red.of("lineBetween")[0]!.stroke).toBe(knockout);

    const blue = paint({ cell: CELL_FLOOR, color: "blue" });
    const discs = blue.of("fillCircle");
    expect(discs[1]!.fill).toBe(knockout); // crescent body
    expect(discs[2]!.fill).toBe(toInt(tokens.obj.doorBlue)); // punch = the medallion fill

    // The glyph's box is the door's own formula, in both states and both sizes.
    const parts = doorParts(rect(CELL_FLOOR), cellRadius(CELL_FLOOR), CELL_FLOOR, 1, 0);
    expect(parts.glyphBox).toBe(doorGlyphBox(CELL_FLOOR, 1));
  });

  it("is deterministic: the same inputs produce the same call list", () => {
    expect(paint({ cell: CELL_NOMINAL, color: "blue", retract: 0.4 }).calls).toEqual(
      paint({ cell: CELL_NOMINAL, color: "blue", retract: 0.4 }).calls,
    );
  });
});

describe("door painter — tokens and the occupied treatment (R-C10, R-D7, R-D8)", () => {
  it("carries the colour family, never the state, in the token choice", () => {
    for (const phase of ["A", "B"] as const) {
      const tokens = theme(phase);
      const closedRed = doorLook(tokens, "red", 0, 0);
      const openRed = doorLook(tokens, "red", 1, 0);
      expect(closedRed.frame).toBe(openRed.frame);
      expect(closedRed.body).toBe(openRed.body);
      expect(closedRed.body).toBe(toInt(tokens.obj.doorRed));
      expect(doorLook(tokens, "blue", 0.5, 0).body).toBe(toInt(tokens.obj.doorBlue));
    }
  });

  it("maps red → sun and blue → crescent (the owning phase, §3.1b glyph semantics)", () => {
    const tokens = theme("A");
    expect(doorLook(tokens, "red", 0, 0).glyph).toBe("sun");
    expect(doorLook(tokens, "blue", 0, 0).glyph).toBe("crescent");
  });

  it("drops bars + medallion to the *Occupied token while the frame stays full strength", () => {
    for (const color of ["red", "blue"] as const) {
      for (const phase of ["A", "B"] as const) {
        const tokens = theme(phase);
        const look = doorLook(tokens, color, 1, 1);
        const full = toInt(tokens.obj[color === "red" ? "doorRed" : "doorBlue"]);
        const occupied = toInt(
          tokens.obj[color === "red" ? "doorRedOccupied" : "doorBlueOccupied"],
        );
        expect(look.frame).toBe(full);
        expect(look.body).toBe(occupied);
        expect(occupied).not.toBe(full);

        const g = paint({ cell: CELL_NOMINAL, color, retract: 1, occupant: 1, phase });
        for (const call of g.of("fillRect")) expect(call.fill).toBe(occupied);
        expect(g.of("fillCircle")[0]!.fill).toBe(occupied);
      }
    }
  });

  it("is closed at retract 0 and open at retract 1, with no phase branch in the geometry", () => {
    const a = paint({ cell: CELL_NOMINAL, phase: "A", retract: 1 });
    const b = paint({ cell: CELL_NOMINAL, phase: "B", retract: 1 });
    // Geometry is identical across phases; only token values differ.
    expect(a.of("fillRect").map((c) => c.args)).toEqual(b.of("fillRect").map((c) => c.args));
    expect(a.of("strokeRoundedRect").map((c) => c.args)).toEqual(
      b.of("strokeRoundedRect").map((c) => c.args),
    );
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
 * §4.3 / §4.6 coverage evidence — an independent raster sweep of the shipped
 * construction (frame band ∪ bars ∪ medallion, minus the glyph knockout).
 * ────────────────────────────────────────────────────────────────────────────── */

function inRoundedRect(
  px: number,
  py: number,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): boolean {
  const rad = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  const nx = Math.min(Math.max(px, x + rad), x + w - rad);
  const ny = Math.min(Math.max(py, y + rad), y + h - rad);
  const dx = px - nx;
  const dy = py - ny;
  return dx * dx + dy * dy <= rad * rad;
}

function segmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const vx = bx - ax;
  const vy = by - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * vx + (py - ay) * vy) / len2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

/**
 * Rasterise one door cell from `doorParts` and return ink coverage **before** and
 * **after** the glyph knockout (R-C5). 0.05 px sampling on a ≤ 56 px cell: the
 * sweep is deterministic, so the numbers below are reproducible, not "close to".
 *
 * @param cell the cell side in **device px** — what `board-view.ts` passes as
 *   `min(rect.w, rect.h)`.
 * @param cssScale R-L6's render scale (`min(devicePixelRatio, 2)`): it moves the
 *   CSS-px floors (`max(3, …)` bar, `max(9, …)` glyph box, `max(13, …)` medallion,
 *   2 px stroke) without touching the cell. **The two are not independent** — a real
 *   render has `cell = cssCell * cssScale`, so a corner is named by its CSS cell and
 *   its scale, and `deviceCell` is derived.
 */
function measureDoorCoverage(
  cell: number,
  retract: number,
  glyph: PhaseGlyph,
  cssScale: number,
): { readonly drawn: number; readonly retained: number; readonly medallion: number } {
  const parts = doorParts(rect(cell), cellRadius(cell), cell, cssScale, retract);
  const w = parts.strokeWidth;
  const frame = parts.frame;
  const { x: cx, y: cy, radius: medRadius } = parts.medallion;
  const box = parts.glyphBox;
  const step = 0.05;

  let drawn = 0;
  let retained = 0;
  let total = 0;

  for (let py = 0; py < cell; py += step) {
    for (let px = 0; px < cell; px += step) {
      total += 1;
      const band =
        inRoundedRect(
          px, py,
          frame.x - w / 2, frame.y - w / 2, frame.w + w, frame.h + w,
          parts.radius + w / 2,
        ) &&
        !inRoundedRect(
          px, py,
          frame.x + w / 2, frame.y + w / 2, frame.w - w, frame.h - w,
          Math.max(0, parts.radius - w / 2),
        );
      let bar = false;
      for (const row of parts.bars) {
        if (Math.abs(py - row.cy) > row.height / 2) continue;
        if (px >= row.leftX && px <= row.leftX + row.leftWidth) bar = true;
        if (px >= row.rightX && px <= row.rightX + row.rightWidth) bar = true;
      }
      const medallion = Math.hypot(px - cx, py - cy) <= medRadius;
      if (!band && !bar && !medallion) continue;
      drawn += 1;

      let glyphInk = Math.hypot(px - cx, py - cy) <= box * GLYPH.sunDisc;
      if (glyph === "crescent") {
        const body = Math.hypot(px - cx, py - cy) <= box * GLYPH.crescentDisc;
        const punch =
          Math.hypot(
            px - (cx + box * GLYPH.crescentPunchOffsetX),
            py - (cy + box * GLYPH.crescentPunchOffsetY),
          ) <= box * GLYPH.crescentPunch;
        glyphInk = body && !punch;
      } else {
        for (let i = 0; i < GLYPH.sunRays && !glyphInk; i += 1) {
          const angle = (i / GLYPH.sunRays) * Math.PI * 2;
          const distance = segmentDistance(
            px, py,
            cx + Math.cos(angle) * box * GLYPH.sunRayInner,
            cy + Math.sin(angle) * box * GLYPH.sunRayInner,
            cx + Math.cos(angle) * box * GLYPH.sunRayOuter,
            cy + Math.sin(angle) * box * GLYPH.sunRayOuter,
          );
          if (distance <= (box * GLYPH.sunRayWidth) / 2) glyphInk = true;
        }
      }
      if (!glyphInk) retained += 1;
    }
  }

  return {
    drawn: drawn / total,
    retained: retained / total,
    medallion: (Math.PI * medRadius * medRadius) / (cell * cell),
  };
}

/* ──────────────────────────────────────────────────────────────────────────────
 * §4.3 / §4.6 coverage evidence — an independent raster sweep of the shipped
 * construction (frame band ∪ bars ∪ medallion, minus the glyph knockout), over the
 * **full corner grid**: CSS cell × render scale × door colour (RV-005 m-5).
 *
 * The V0.7 sweep fixed `cssScale = 1` and always drew the **sun**, i.e. it measured
 * one corner of a 2 × 2 × 2 grid and called it the contract. The gaps that left:
 * the crescent glyph (the blue door) knocks out *less* ink than the sun's disc + 8
 * rays, so it is the worst case for the closed:open ratio, and at `cssScale = 2` the
 * CSS-px floors (`max(3, …)`, `max(9, …)`, `max(13, …)`, 2 px stroke) move relative
 * to the cell. Both are measured here, band-asserted where the spec publishes one,
 * and the exact numbers are pinned so a future tweak in either direction is visible.
 *
 * `cell` is the cell side in **device px** and a real render has
 * `cell = cssCell × cssScale` (R-L6 + the R-T5 40 px CSS floor), so `deviceCell` is
 * derived, never chosen. The one literal product that is *not* a reachable render —
 * a 56/40 device cell at scale 2, i.e. a 28/20 CSS px cell below the R-T5 floor — is
 * measured separately at the end, as evidence *for* the floor rather than against
 * the geometry.
 *
 * This file owns the numbers; it does not own the verdict. Nothing here tunes
 * geometry to reach a band.
 * ────────────────────────────────────────────────────────────────────────────── */

type DoorColor = "red" | "blue";

const CSS_CELLS = [56, 40] as const;
const SCALES = [1, 2] as const;
const DOOR_COLORS = ["red", "blue"] as const;

/** The glyph is a function of the colour (§3.1b: sun = red, crescent = blue). */
const glyphFor = (color: DoorColor): PhaseGlyph => (color === "red" ? "sun" : "crescent");

interface Coverage {
  readonly drawn: number;
  readonly retained: number;
  readonly medallion: number;
}

interface Corner {
  /** The CSS cell size the band is quoted at (§4.3/§4.6: "@56 px", "@40 px"). */
  readonly cssCell: number;
  readonly cssScale: number;
  /** `cssCell * cssScale` — what `board-view.ts` hands the painter. */
  readonly deviceCell: number;
  readonly color: DoorColor;
  readonly glyph: PhaseGlyph;
  readonly closed: Coverage;
  readonly open: Coverage;
  /** closed : open, on **retained** ink (post-knockout, R-C5). */
  readonly ratio: number;
  /** open : closed — R-D6's subordination-by-area ceiling. */
  readonly weight: number;
}

function measureCorner(cssCell: number, cssScale: number, color: DoorColor): Corner {
  const deviceCell = cssCell * cssScale;
  const glyph = glyphFor(color);
  const closed = measureDoorCoverage(deviceCell, 0, glyph, cssScale);
  const open = measureDoorCoverage(deviceCell, 1, glyph, cssScale);
  return {
    cssCell,
    cssScale,
    deviceCell,
    color,
    glyph,
    closed,
    open,
    ratio: closed.retained / open.retained,
    weight: open.retained / closed.retained,
  };
}

/** Every reachable corner: 2 CSS cells × 2 scales × 2 colours. */
const CORNERS: readonly Corner[] = CSS_CELLS.flatMap((cssCell) =>
  SCALES.flatMap((cssScale) => DOOR_COLORS.map((color) => measureCorner(cssCell, cssScale, color))),
);

const corner = (cssCell: number, cssScale: number, color: DoorColor): Corner => {
  const found = CORNERS.find(
    (candidate) =>
      candidate.cssCell === cssCell && candidate.cssScale === cssScale && candidate.color === color,
  );
  if (found === undefined) throw new Error(`no measured corner ${cssCell}/${cssScale}/${color}`);
  return found;
};

const cornersAt = (cssCell: number, cssScale?: number): readonly Corner[] =>
  CORNERS.filter(
    (candidate) =>
      candidate.cssCell === cssCell && (cssScale === undefined || candidate.cssScale === cssScale),
  );

const pct = (value: number): number => value * 100;

/** Report shape used by the pins below and by the R-002b hand-off table. */
const line = (c: Corner): string =>
  `${String(c.cssCell)}px/cs${String(c.cssScale)}/${c.color} ` +
  `(dev ${String(c.deviceCell)}): ratio ${c.ratio.toFixed(4)} weight ${c.weight.toFixed(4)} ` +
  `medallion ${pct(c.closed.medallion).toFixed(2)}%`;

describe("door coverage — §4.3 measured numbers over the full corner grid", () => {
  it("measures every corner of the grid (2 CSS cells × 2 scales × 2 colours)", () => {
    expect(CORNERS).toHaveLength(8);
    for (const c of CORNERS) {
      expect(c.deviceCell).toBe(c.cssCell * c.cssScale);
      expect(c.closed.retained).toBeGreaterThan(0);
      expect(c.open.retained).toBeGreaterThan(0);
      expect(c.ratio).toBeGreaterThan(1);
    }
    // The two glyphs really are two different renderings of the knockout (otherwise
    // the colour axis would be a duplicate measurement masquerading as a corner).
    const sun = corner(56, 1, "red");
    const crescent = corner(56, 1, "blue");
    expect(sun.glyph).toBe("sun");
    expect(crescent.glyph).toBe("crescent");
    expect(sun.closed.retained).not.toBe(crescent.closed.retained);
  });

  it("meets R-D2 at the nominal 56 px in every corner: closed : open ≥ 1.6 : 1", () => {
    for (const c of cornersAt(56)) {
      expect(c.ratio, line(c)).toBeGreaterThanOrEqual(1.6);
    }
    // …including the scale-2 render, where the CSS-px floors move (RV-005 m-5).
    expect(cornersAt(56, 2).map((c) => c.ratio).every((r) => r >= 1.6)).toBe(true);
  });

  it("holds V0.8's ≥ 1.55 floor at 40 px in every corner", () => {
    // HONEST READING, NOT A WEAKENED THRESHOLD — see R-002/R-002b DESIGN_IMPACT:
    // §4.3/§4.6's published 1.70 : 1 @40 px does not reproduce under an independent
    // raster sweep of the *shipped* `doorParts` + the shipped glyph constants; V0.8
    // re-issued the contract as two bands (≥ 1.6 @56 nominal, ≥ 1.55 @40 floor), and
    // this asserts the floor. The gap is a measurement-accounting difference (the
    // published script appears to use the ghost's 0.30×cell glyph box rather than
    // §3.1b's `max(9, round(0.22 c))`, plus a thinner effective frame band), not a
    // geometry defect: the unambiguous sub-contracts below hold at every corner
    // (middle bar zero ink, stubs ≤ 20 %, no interior fill, medallion ≤ 10 %,
    // open weight ≤ 0.65). The exact per-corner figures are pinned below.
    for (const c of cornersAt(40)) {
      expect(c.ratio, line(c)).toBeGreaterThanOrEqual(1.55);
      expect(c.ratio, line(c)).toBeLessThan(1.7);
    }
  });

  it("keeps the floor's margin visible: no corner sits within 0.01 of the band", () => {
    // A tripwire, not a band change: if a future tweak lands exactly on 1.55/1.60 the
    // corner is one rounding away from failing, and that should be a loud edit, not a
    // silent drift.
    for (const c of CORNERS) {
      const band = c.cssCell === 56 ? 1.6 : 1.55;
      expect(c.ratio - band, line(c)).toBeGreaterThan(0.01);
    }
  });

  it("meets R-D6 subordination by area at every corner: open weight ≤ 0.65× closed", () => {
    for (const c of CORNERS) {
      expect(c.weight, line(c)).toBeLessThanOrEqual(0.65);
    }
  });

  it("keeps the medallion inside R-C2's ≤ 10 % of cell² exception at every corner", () => {
    for (const c of CORNERS) {
      expect(pct(c.closed.medallion), line(c)).toBeGreaterThanOrEqual(8.5);
      expect(pct(c.closed.medallion), line(c)).toBeLessThanOrEqual(10);
    }
  });

  it("satisfies R-C5 at every corner: the knockout removes far less than 30 % of the ink", () => {
    for (const c of CORNERS) {
      expect(c.closed.retained / c.closed.drawn, line(c)).toBeGreaterThanOrEqual(0.9);
      expect(c.open.retained / c.open.drawn, line(c)).toBeGreaterThanOrEqual(0.85);
    }
  });

  it("an open door carries roughly a third of a solid wall's ink, never wall-like mass", () => {
    // Reference mass from §3.1b: a solid wall covers ≈ 77.4 % of cell².
    const solidWall = 0.774;
    for (const c of CORNERS) {
      expect(c.open.retained / solidWall, line(c)).toBeLessThan(0.5);
    }
  });

  it("pins the measured numbers for every corner (the UA verdict batch)", () => {
    // The exact figures this sweep produces from the shipped construction. They are
    // pinned to 4 decimals because the sweep is deterministic (0.05 px grid): a
    // geometry change anywhere in `doorParts` or `glyph.ts` moves one of these, and
    // the diff is then a number, not a screenshot.
    const pinned: Record<string, { ratio: number; weight: number; medallion: number }> = {
      "56/cs1/red": { ratio: 1.7058, weight: 0.5862, medallion: 9.04 },
      "56/cs1/blue": { ratio: 1.6959, weight: 0.5897, medallion: 9.04 },
      "56/cs2/red": { ratio: 1.6756, weight: 0.5968, medallion: 9.04 },
      "56/cs2/blue": { ratio: 1.6651, weight: 0.6006, medallion: 9.04 },
      "40/cs1/red": { ratio: 1.589, weight: 0.6293, medallion: 9.62 },
      "40/cs1/blue": { ratio: 1.5813, weight: 0.6324, medallion: 9.62 },
      "40/cs2/red": { ratio: 1.5874, weight: 0.63, medallion: 8.95 },
      "40/cs2/blue": { ratio: 1.5797, weight: 0.633, medallion: 8.95 },
    };
    for (const c of CORNERS) {
      const key = `${String(c.cssCell)}/cs${String(c.cssScale)}/${c.color}`;
      const expected = pinned[key];
      expect(expected, `${key} is measured but not pinned`).toBeDefined();
      expect(c.ratio, `${key} ratio`).toBeCloseTo(expected!.ratio, 4);
      expect(c.weight, `${key} weight`).toBeCloseTo(expected!.weight, 4);
      expect(pct(c.closed.medallion), `${key} medallion`).toBeCloseTo(expected!.medallion, 2);
    }
    // The worst in-contract corner, named: 40 px at scale 2, blue (crescent) — 0.030
    // above V0.8's 1.55 floor. The crescent is the worse glyph in every pair (it knocks
    // out less ink than the sun's disc + 8 rays), which is why fixing the old sweep to
    // `sun` at `cssScale = 1` hid it.
    const worst = [...CORNERS].sort((a, b) => a.ratio - b.ratio)[0]!;
    expect(worst.cssCell).toBe(40);
    expect(worst.cssScale).toBe(2);
    expect(worst.color).toBe("blue");
    for (const c of cornersAt(40).filter((candidate) => candidate.color === "blue")) {
      expect(c.ratio, line(c)).toBeLessThan(corner(c.cssCell, c.cssScale, "red").ratio);
    }
    for (const c of CORNERS.filter((candidate) => candidate.cssScale === 2)) {
      expect(c.ratio, line(c)).toBeLessThan(corner(c.cssCell, 1, c.color).ratio);
    }
  });
});

describe("door coverage — below the R-T5 floor the geometry degrades as the floors predict", () => {
  // The one literal `(deviceCell, cssScale)` product RV-005's m-5 wording could also
  // mean: the cell held at 56/40 **device** px while the CSS-px floors are scaled ×2.
  // No R-T5-legal layout can produce it — it is a 28 / 20 CSS px cell, below the 40 px
  // floor ("a level that cannot be laid out at ≥ 40 px on every supported viewport does
  // not ship") — and the numbers are recorded here as evidence *for* that floor: the
  // degenerate direction is exactly what the floor prevents from shipping.
  const DEVICE_CELLS = [56, 40] as const;
  /** Measured once: a 28 / 20 CSS px cell at scale 2. */
  const BELOW_FLOOR: readonly Corner[] = DEVICE_CELLS.map((deviceCell) =>
    measureCorner(deviceCell / 2, 2, "red"),
  );

  it("is out of contract, and the medallion is the tell", () => {
    // Measured: 28 CSS px (dev 56) → ratio 1.2890, weight 0.7758, medallion 16.93 %;
    //           20 CSS px (dev 40) → ratio 1.0495, weight 0.9529, medallion 33.18 %.
    // At the degenerate end the open door is 95 % of the closed state's mass and the
    // structural ratio collapses to ~1.05 — R-D2's primary channel is gone. That is
    // precisely what cannot ship, and the R-T5 40 px CSS floor is what keeps it off a
    // board: the floors below are asserted, not the vanishing bands.
    for (const c of BELOW_FLOOR) {
      // The medallion's `max(13, …)` CSS floor is 26 device px at scale 2 — ~46 % of a
      // 56 device cell (vs 34 % in contract, 9.0 % of cell²).
      expect(pct(c.closed.medallion), line(c)).toBeGreaterThan(10);
      // …and R-D6's subordination ceiling is broken too.
      expect(c.weight, line(c)).toBeGreaterThan(0.65);
      // Structure survives (the open door is still hollow with corner stubs) …
      expect(c.open.retained).toBeGreaterThan(0);
      expect(c.ratio, line(c)).toBeGreaterThan(1);
    }
  });
});