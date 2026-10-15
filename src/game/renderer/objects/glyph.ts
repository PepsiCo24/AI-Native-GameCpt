/**
 * The R-C1 phase glyph — **sun = Phase A (Light / 白昼), crescent = Phase B
 * (Shadow / 夜晚)** — as one shared painter.
 *
 * `docs/ui-ux.md` fixes this glyph in three places, always meaning the same thing
 * ("sun = acts in Day, crescent = acts in Night"):
 *
 * | Consumer | Contract | Rule |
 * |---|---|---|
 * | `wallEcho` | knockout to `ground.cell`, box `cellSize * 0.30`, only at ≥ 56 px | §3.1a, R-E4 (redundant channel) |
 * | door | knockout through the medallion, box `max(9, round(cellSize * 0.22))`, **never** size-gated | §3.1b, R-D3/R-D4 (load-bearing CVD channel) |
 * | switch | ink inside the small outline, box `max(7, round(cellSize * 0.18))` — spec is silent, see `objects/switch.ts` | §3.1/R-C1 extension |
 *
 * Extracting it here is the R-E8 "one code path" rule applied to a *shape*: the
 * door's glyph is the same construction as the ghost's notch (identical sun rays,
 * identical crescent punch), only the box, the ink target and the size gate
 * differ — and those are arguments, not a second implementation.
 *
 * **Why the crescent is drawn as ink + punch rather than as an arc.** At every
 * partial alpha on this glyph (`wallEcho` cross-fades its notch between 0 and 1
 * during a flip) an arc-shaped crescent would show a hard edge somewhere in the
 * transition. Drawing a full disc in the ink colour and then re-filling the
 * "punch" disc with whatever was underneath (`punch` = the wall's current fill,
 * or the door medallion's current fill) makes `alpha = 0` indistinguishable from
 * the surface beneath, so the cross-fade has no artefact — and it is exactly the
 * construction the shipped `wallEcho` notch already used.
 *
 * Pure geometry + token ints: no Phaser import (AGENTS.md §3), so a unit test can
 * hand this a recording {@link Graphics2D} double and assert the real draw calls.
 */

import type { Phase } from "@/core/state/phase";
import { theme } from "@/game/theme/tokens";
import type { PhaseGlyph } from "@/game/theme/tokens";
import type { Graphics2D } from "./graphics2d";

/** The glyph naming `phase` — the *only* way a phase becomes a shape (§5.4). */
export function phaseGlyphFor(phase: Phase): PhaseGlyph {
  return theme(phase).hud.phaseGlyph;
}

export interface PhaseGlyphPaint {
  /** Glyph centre, device px. */
  readonly cx: number;
  readonly cy: number;
  /**
   * The glyph's box (device px). §3.1a's "box" and §3.1b's `max(9, …)` are the
   * same quantity: the sun's disc is `0.26 * box`, its rays reach `0.5 * box`,
   * the crescent's disc is `0.42 * box` and its punch is offset `0.2 * box`.
   */
  readonly box: number;
  readonly glyph: PhaseGlyph;
  /** The knockout colour the glyph is cut to (a ground token, never a state token). */
  readonly ink: number;
  /**
   * What the crescent's punch restores: the fill the glyph is cut *through*. At
   * `alpha = 1` this is cosmetic; during a cross-fade it is what keeps the
   * knockout artifact-free (see the module header).
   */
  readonly punch: number;
  readonly alpha: number;
}

/** Every constant of the glyph, so no consumer re-derives a radius. */
export const GLYPH = {
  sunDisc: 0.26,
  sunRayInner: 0.36,
  sunRayOuter: 0.5,
  sunRays: 8,
  sunRayWidth: 0.07,
  crescentDisc: 0.42,
  crescentPunchOffsetX: 0.2,
  crescentPunchOffsetY: -0.12,
  crescentPunch: 0.38,
} as const;

/**
 * Paint the phase glyph. Deterministic in `(cx, cy, box, glyph, alpha)`; the
 * caller owns every colour decision (R-C11) and every size threshold (R-E4 vs
 * R-D4 — the glyph itself is never size-gated, its *callers* are).
 */
export function paintPhaseGlyph(g: Graphics2D, paint: PhaseGlyphPaint): void {
  const { cx, cy, box, glyph, ink, punch, alpha } = paint;

  g.fillStyle(ink, alpha);
  if (glyph === "sun") {
    g.fillCircle(cx, cy, box * GLYPH.sunDisc);
    g.lineStyle(box * GLYPH.sunRayWidth, ink, alpha);
    for (let i = 0; i < GLYPH.sunRays; i += 1) {
      const angle = (i / GLYPH.sunRays) * Math.PI * 2;
      const inner = box * GLYPH.sunRayInner;
      const outer = box * GLYPH.sunRayOuter;
      g.lineBetween(
        cx + Math.cos(angle) * inner,
        cy + Math.sin(angle) * inner,
        cx + Math.cos(angle) * outer,
        cy + Math.sin(angle) * outer,
      );
    }
    return;
  }

  g.fillCircle(cx, cy, box * GLYPH.crescentDisc);
  // Flat restore of the covered surface — deliberately full alpha, exactly like
  // the shipped wall notch (a fractional punch would leave a ghost crescent).
  g.fillStyle(punch, 1);
  g.fillCircle(
    cx + box * GLYPH.crescentPunchOffsetX,
    cy + box * GLYPH.crescentPunchOffsetY,
    box * GLYPH.crescentPunch,
  );
}