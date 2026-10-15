/**
 * Goal painter — **hollow ring + centre dot** (`docs/ui-ux.md` R-C1: "goal —
 * hollow ring, 66 % of cell, with a small centre dot", fill rule = hollow).
 *
 * DEV PLACEHOLDER — A-06 goal (see `src/game/theme/assets.ts`).
 *
 * R-C8 (one attention magnet): the goal is the **only** element allowed to
 * animate on an idle board — a 2.4 s slow pulse, ±6 % scale, no colour change.
 * Nothing else in the renderer idles, including `wallEcho` (R-E5).
 */

import type { Rect } from "@/game/renderer/grid-mapping";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import { toInt } from "@/game/theme/tokens";
import type { ThemeTokens } from "@/game/theme/tokens";

/** R-C8 pulse: period and amplitude are tokens, not magic numbers in the painter. */
export const GOAL_PULSE_MS = 2400;
export const GOAL_PULSE_AMPLITUDE = 0.06;

/** R-C1 footprint: ring diameter as a fraction of the cell. */
const GOAL_DIAMETER = 0.66;
const GOAL_DOT_DIAMETER = 0.12;
const STROKE_CSS = 2;

export function goalPulseScale(timeMs: number): number {
  return 1 + GOAL_PULSE_AMPLITUDE * Math.sin((timeMs / GOAL_PULSE_MS) * Math.PI * 2);
}

export interface GoalPaintContext {
  readonly g: Graphics2D;
  readonly rect: Rect;
  readonly cssScale: number;
  readonly theme: ThemeTokens;
  /** R-C8 — the only idle animation on the board. */
  readonly pulseScale: number;
}

export function paintGoal(ctx: GoalPaintContext): void {
  const { g, rect, theme, cssScale } = ctx;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const radius = (Math.min(rect.w, rect.h) * GOAL_DIAMETER * ctx.pulseScale) / 2;
  const colour = toInt(theme.obj.goal);

  g.lineStyle(STROKE_CSS * cssScale, colour, 1);
  g.strokeCircle(cx, cy, radius);
  g.fillStyle(colour, 1);
  g.fillCircle(cx, cy, (Math.min(rect.w, rect.h) * GOAL_DOT_DIAMETER) / 2);
}