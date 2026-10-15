/**
 * Switch (M3) + portal (M2) painter evidence.
 *
 * Both classes are **hollow in both states** (R-C2), so colour can never carry
 * their state — §3.1's switch row puts the state in a *presence/absence* dot and
 * §3.1c puts the portal's in **swirl presence/absence**. This file asserts exactly
 * those structural channels, plus the two spec-silent switch extensions that
 * `src/game/renderer/objects/switch.ts` documents (the owning-phase glyph and the
 * one-shot press beat), against the **draw calls the shipped painters make**.
 */

import { describe, expect, it } from "vitest";
import type { Phase } from "@/core/state/phase";
import type { Rect } from "@/game/renderer/grid-mapping";
import { GLYPH } from "@/game/renderer/objects/glyph";
import {
  PORTAL_FOOTPRINT,
  PORTAL_SWIRL_ARCS,
  paintPortal,
  portalLook,
  portalParts,
} from "@/game/renderer/objects/portal";
import {
  SWITCH_FOOTPRINT,
  paintSwitch,
  switchLook,
  switchParts,
  switchPressEmphasis,
} from "@/game/renderer/objects/switch";
import { lerpColorInt, theme, toInt } from "@/game/theme/tokens";
import { RecordingGraphics } from "../helpers/graphics-recorder";

const CELL = 56;

function rect(cell: number): Rect {
  return { x: 0, y: 0, w: cell, h: cell };
}

function paintSwitchTile(options: {
  readonly phase?: Phase;
  readonly activePhase?: Phase;
  /** Latched on/off (cross-fading in during a flip). */
  readonly dotAlpha?: number;
  readonly emphasis?: number;
  readonly cell?: number;
  readonly cssScale?: number;
}): { readonly g: RecordingGraphics; readonly outline: number; readonly knockout: number } {
  const {
    phase = "A",
    activePhase = "A",
    dotAlpha = 0,
    emphasis = 0,
    cell = CELL,
    cssScale = 1,
  } = options;
  const tokens = theme(phase);
  const g = new RecordingGraphics();
  paintSwitch({
    g,
    rect: rect(cell),
    cell,
    cssScale,
    knockout: toInt(tokens.ground.cell),
    look: switchLook(tokens, activePhase, dotAlpha, emphasis),
  });
  return { g, outline: toInt(tokens.obj.switch), knockout: toInt(tokens.ground.cell) };
}

describe("switch painter — R-C1 silhouette (hollow 40 % outline)", () => {
  it("draws one hollow rounded outline at exactly 40 % of the cell, centred", () => {
    for (const cell of [CELL, 40]) {
      for (const cssScale of [1, 2]) {
        const { g, outline } = paintSwitchTile({ cell, cssScale });
        const outlines = g.of("strokeRoundedRect");
        expect(outlines).toHaveLength(1);
        expect(g.ops[0]).toBe("strokeRoundedRect");

        const [x, y, w, h, radius] = outlines[0]!.args as [number, number, number, number, number];
        const side = cell * SWITCH_FOOTPRINT;
        expect(w).toBeCloseTo(side, 10);
        expect(h).toBeCloseTo(side, 10);
        expect(x).toBeCloseTo((cell - side) / 2, 10);
        expect(y).toBeCloseTo((cell - side) / 2, 10);
        expect(radius).toBe(Math.max(1, Math.round(side * 0.18)));
        expect(outlines[0]!.strokeWidth).toBe(2 * cssScale);
        // R-C10: one switch token, identical in both phases and both states.
        expect(outlines[0]!.stroke).toBe(outline);
      }
    }
  });

  it("never fills its silhouette — a switch can never read as solid (R-C2)", () => {
    for (const dotAlpha of [0, 1]) {
      for (const activePhase of ["A", "B"] as const) {
        const { g } = paintSwitchTile({ dotAlpha, activePhase });
        expect(g.of("fillRoundedRect")).toEqual([]);
        expect(g.of("fillRect")).toEqual([]);
        expect(g.of("fillEllipse")).toEqual([]);
      }
    }
  });
});

describe("switch painter — the state channel is the corner dot (R-C1)", () => {
  it("off = no dot at all; on = one dot on the outline's top-right corner", () => {
    const side = CELL * SWITCH_FOOTPRINT;
    const origin = (CELL - side) / 2;

    const off = paintSwitchTile({ dotAlpha: 0, activePhase: "A" });
    const on = paintSwitchTile({ dotAlpha: 1, activePhase: "A" });

    // Sun glyph adds one disc; the dot is the extra call.
    expect(off.g.of("fillCircle")).toHaveLength(1);
    expect(on.g.of("fillCircle")).toHaveLength(2);

    const dot = on.g.of("fillCircle")[1]!;
    expect(dot.args[0]).toBeCloseTo(origin + side, 6);
    expect(dot.args[1]).toBeCloseTo(origin, 6);
    expect(dot.args[2]).toBe(Math.max(4, Math.round(CELL * 0.09)) / 2);
    expect(dot.fill).toBe(on.outline);
    expect(dot.fillAlpha).toBe(1);
  });

  it("cross-fades the dot on the flip row instead of popping (alpha, not an either/or)", () => {
    const half = paintSwitchTile({ dotAlpha: 0.5 });
    const dot = half.g.of("fillCircle")[1];
    expect(dot).toBeDefined();
    expect(dot!.fillAlpha).toBe(0.5);
  });

  it("builds its dot and glyph from the exported construction (one source of geometry)", () => {
    const parts = switchParts(rect(CELL), CELL, 1, 0);
    expect(parts.glyphBox).toBe(Math.max(7, Math.round(CELL * 0.18)));
    const { g } = paintSwitchTile({ dotAlpha: 1, activePhase: "A" });
    expect(g.of("fillCircle")[0]!.args[2]).toBeCloseTo(parts.glyphBox * GLYPH.sunDisc, 10);
    expect(g.of("fillCircle")[1]!.args).toEqual([parts.dot.x, parts.dot.y, parts.dot.radius]);
  });

  it("keeps the presence/absence read at the 40 px floor and in both phases", () => {
    for (const cell of [CELL, 40]) {
      for (const phase of ["A", "B"] as const) {
        const side = cell * SWITCH_FOOTPRINT;
        const off = paintSwitchTile({ cell, phase, dotAlpha: 0 });
        const on = paintSwitchTile({ cell, phase, dotAlpha: 1 });
        expect(on.g.of("fillCircle").length).toBe(off.g.of("fillCircle").length + 1);
        expect(side / cell).toBeCloseTo(0.4, 10);
      }
    }
  });
});

describe("switch painter — extension 1, the owning-phase glyph", () => {
  it("draws the Phase-A sun (disc + 8 rays) and the Phase-B crescent (disc + punch)", () => {
    const a = paintSwitchTile({ activePhase: "A", dotAlpha: 0 });
    expect(a.g.of("lineBetween")).toHaveLength(GLYPH.sunRays);
    expect(a.g.of("fillCircle")).toHaveLength(1);

    const b = paintSwitchTile({ activePhase: "B", dotAlpha: 0 });
    expect(b.g.of("lineBetween")).toHaveLength(0);
    expect(b.g.of("fillCircle")).toHaveLength(2);
    expect(b.g.of("fillCircle")[1]!.fill).toBe(b.knockout);
  });

  it("is drawn in both board phases and in both latch states — never size-gated", () => {
    for (const phase of ["A", "B"] as const) {
      for (const dotAlpha of [0, 1]) {
        for (const cell of [CELL, 40]) {
          const { g } = paintSwitchTile({ phase, dotAlpha, cell, activePhase: "A" });
          expect(g.of("lineBetween").length).toBe(GLYPH.sunRays);
        }
      }
    }
  });

  it("uses the switch token as the glyph ink, so the small outline stays one object", () => {
    const { g, outline } = paintSwitchTile({ activePhase: "B" });
    // Crescent ink = the outline token; its punch restores the cell ground.
    expect(g.of("fillCircle")[0]!.fill).toBe(outline);
  });
});

describe("switch painter — extension 2, the one-shot press beat", () => {
  it("switchPressEmphasis is 0 at both ends of the beat and peaks once at its midpoint", () => {
    expect(switchPressEmphasis(0)).toBeCloseTo(0, 12);
    expect(switchPressEmphasis(0.5)).toBeCloseTo(1, 12);
    expect(switchPressEmphasis(1)).toBeCloseTo(0, 12);
    expect(switchPressEmphasis(0.25)).toBeGreaterThan(0);
    expect(switchPressEmphasis(0.75)).toBeGreaterThan(0);
    // Clamped outside 0..1, like every other mix in the renderer.
    expect(switchPressEmphasis(-1)).toBeCloseTo(0, 12);
    expect(switchPressEmphasis(2)).toBeCloseTo(0, 12);
  });

  it("never idles: a settled board (progress 1) reads no emphasis at all (R-C8)", () => {
    expect(switchPressEmphasis(1)).toBeLessThan(0.01);
    const settled = paintSwitchTile({ emphasis: switchPressEmphasis(1) });
    expect(settled.g.of("strokeRoundedRect")[0]!.strokeWidth).toBe(2);
  });

  it("widens the outline 2 → 3 CSS px and back, never above the §3.1a 2 px class stroke", () => {
    const mid = paintSwitchTile({ emphasis: switchPressEmphasis(0.5) });
    expect(mid.g.of("strokeRoundedRect")[0]!.strokeWidth).toBe(3);
    const quarter = paintSwitchTile({ emphasis: switchPressEmphasis(0.25) });
    expect(quarter.g.of("strokeRoundedRect")[0]!.strokeWidth).toBeGreaterThan(2);
    expect(quarter.g.of("strokeRoundedRect")[0]!.strokeWidth).toBeLessThan(3);
    // Scaled with the target, exactly like every other CSS-px constant (R-L6).
    const dpr2 = paintSwitchTile({ emphasis: 1, cssScale: 2 });
    expect(dpr2.g.of("strokeRoundedRect")[0]!.strokeWidth).toBe(6);
  });

  it("adds no second graphic: the press beat changes stroke width only", () => {
    const rest = paintSwitchTile({ emphasis: 0 });
    const press = paintSwitchTile({ emphasis: 1 });
    expect(press.g.ops).toEqual(rest.g.ops);
  });
});

function paintPortalTile(options: {
  readonly phase?: Phase;
  readonly activeMix?: number;
  readonly cell?: number;
  readonly cssScale?: number;
}): { readonly g: RecordingGraphics; readonly tokens: ReturnType<typeof theme> } {
  const { phase = "A", activeMix = 0, cell = CELL, cssScale = 1 } = options;
  const tokens = theme(phase);
  const g = new RecordingGraphics();
  paintPortal({
    g,
    rect: rect(cell),
    cell,
    cssScale,
    look: portalLook(tokens, activeMix),
  });
  return { g, tokens };
}

describe("portal painter — §3.1c hollow diamond outline", () => {
  it("strokes a closed 4-vertex diamond path, never a fill (R-C2: hollow in both states)", () => {
    for (const activeMix of [0, 1]) {
      for (const cell of [CELL, 40]) {
        const { g, tokens } = paintPortalTile({ activeMix, cell });
        expect(g.of("moveTo")).toHaveLength(1);
        expect(g.of("lineTo")).toHaveLength(3);
        expect(g.of("closePath")).toHaveLength(1);
        expect(g.of("fillRect")).toEqual([]);
        expect(g.of("fillCircle")).toEqual([]);
        expect(g.of("fillRoundedRect")).toEqual([]);
        expect(g.of("fillEllipse")).toEqual([]);

        const half = (cell * PORTAL_FOOTPRINT) / 2;
        const cx = cell / 2;
        const cy = cell / 2;
        expect(g.of("moveTo")[0]!.args).toEqual([cx, cy - half]);
        expect(g.of("lineTo").map((call) => call.args)).toEqual([
          [cx + half, cy],
          [cx, cy + half],
          [cx - half, cy],
        ]);
        // §5.1 rank 5 is the only size the spec gives the class.
        expect((half * 2) / cell).toBeCloseTo(0.7, 10);
        expect(tokens.obj.portal).toBeDefined();
      }
    }
  });

  it("keeps the outline at 2 CSS px and the swirl strictly thinner (subordination)", () => {
    const parts = portalParts(rect(CELL), CELL, 1);
    expect(parts.strokeWidth).toBe(2);
    expect(parts.swirlStrokeWidth).toBe(1.5);
    const { g } = paintPortalTile({ activeMix: 1 });
    expect(g.of("strokePath")[0]!.strokeWidth).toBe(2);
    for (const call of g.of("strokePath").slice(1)) {
      expect(call.strokeWidth).toBe(1.5);
    }
  });
});

describe("portal painter — swirl presence/absence is the primary channel (§3.1c)", () => {
  it("active: two concentric swirl arcs at the exported radii and angular ranges", () => {
    const { g } = paintPortalTile({ activeMix: 1 });
    const arcs = g.of("arc");
    expect(arcs).toHaveLength(PORTAL_SWIRL_ARCS.length);
    const half = (CELL * PORTAL_FOOTPRINT) / 2;
    PORTAL_SWIRL_ARCS.forEach((spec, index) => {
      const arc = arcs[index]!;
      expect(arc.args[0]).toBe(CELL / 2);
      expect(arc.args[1]).toBe(CELL / 2);
      expect(arc.args[2]).toBeCloseTo(half * spec.radius, 10);
      expect(arc.args[3]).toBeCloseTo(spec.startTurns * Math.PI, 10);
      expect(arc.args[4]).toBeCloseTo(spec.endTurns * Math.PI, 10);
    });
  });

  it("inactive: the outline is there and the swirl is gone entirely — not dimmed", () => {
    const { g } = paintPortalTile({ activeMix: 0 });
    expect(g.of("arc")).toEqual([]);
    expect(g.of("moveTo")).toHaveLength(1);
    expect(g.of("strokePath")).toHaveLength(1);
  });

  it("cross-fades the swirl's alpha with the flip and restores the muted stroke at rest", () => {
    const half = paintPortalTile({ activeMix: 0.5 });
    for (const arc of half.g.of("arc")) {
      const stroke = half.g.of("strokePath")[1]!;
      expect(stroke.strokeAlpha).toBe(0.5);
      expect(arc.args[0]).toBe(CELL / 2);
    }
    const inactive = paintPortalTile({ activeMix: 0 });
    const tokens = theme("A");
    expect(inactive.g.of("strokePath")[0]!.stroke).toBe(toInt(tokens.obj.portalEcho));
    const active = paintPortalTile({ activeMix: 1 });
    expect(active.g.of("strokePath")[0]!.stroke).toBe(toInt(tokens.obj.portal));
    expect(active.g.of("strokePath")[1]!.stroke).toBe(toInt(tokens.obj.portal));
  });

  it("portalLook interpolates the outline token and never mutes the active portal", () => {
    const tokens = theme("B");
    expect(portalLook(tokens, 0).stroke).toBe(toInt(tokens.obj.portalEcho));
    expect(portalLook(tokens, 1).stroke).toBe(toInt(tokens.obj.portal));
    expect(portalLook(tokens, 0.5).stroke).toBe(
      lerpColorInt(toInt(tokens.obj.portalEcho), toInt(tokens.obj.portal), 0.5),
    );
    expect(portalLook(tokens, 0).swirlAlpha).toBe(0);
    expect(portalLook(tokens, 1).swirlAlpha).toBe(1);
  });

  it("is deterministic: the same inputs produce the same call list", () => {
    expect(paintPortalTile({ activeMix: 0.3 }).g.calls).toEqual(
      paintPortalTile({ activeMix: 0.3 }).g.calls,
    );
    expect(paintSwitchTile({ emphasis: 0.3, dotAlpha: 0.7 }).g.calls).toEqual(
      paintSwitchTile({ emphasis: 0.3, dotAlpha: 0.7 }).g.calls,
    );
  });
});