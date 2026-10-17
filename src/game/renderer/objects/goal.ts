/**
 * Goal painter — **hollow ring + centre dot** (`docs/ui-ux.md` R-C1: "goal —
 * hollow ring, 66 % of cell, with a small centre dot", fill rule = hollow).
 *
 * DEV PLACEHOLDER — A-06 goal (see `src/game/theme/assets.ts`). The delivered
 * annulus is integrated (R-005a, 2026-10-16); this vector ring + dot is what the
 * slot **degrades to** when its texture does not mount, and it is the geometry
 * every R-C1 number here was measured against.
 *
 * R-C8 (one attention magnet): the goal is the **only** element allowed to
 * animate on an idle board — a 2.4 s slow pulse, ±6 % scale, no colour change.
 * Nothing else in the renderer idles, including `wallEcho` (R-E5). The pulse is a
 * *size* rule, so the texture rides it identically (`pulseScale` is applied to the
 * form before the framing correction, never to the box).
 *
 * §6.6 beats touching this painter (GAME-003): **B7**'s one-shot attract arrives
 * already folded into `pulseScale` by the registry (additive, so the hard ceiling is
 * exactly `1 + 6 % + 2 % = 8 %`); **MV-4**'s reduced form is `pulseScale = 1`, a data
 * flip applied by the registry, not a branch here. **M-5** (ORDERED, §3.1e): the art
 * branch also draws R-C1's centre dot, because the delivered annulus carries zero ink
 * inside `r < 0.62 · outer` and the goal must not read as a second live portal.
 */

import type { Rect } from "@/game/renderer/grid-mapping";
import type { Graphics2D } from "@/game/renderer/objects/graphics2d";
import type { TileObjectArtPort } from "@/game/renderer/objects/registry";
import { slotKey } from "@/game/theme/art";
import { toInt } from "@/game/theme/tokens";
import type { ThemeTokens } from "@/game/theme/tokens";

/** R-C8 pulse: period and amplitude are tokens, not magic numbers in the painter. */
export const GOAL_PULSE_MS = 2400;
export const GOAL_PULSE_AMPLITUDE = 0.06;

/** R-C1 footprint: ring diameter as a fraction of the cell. */
const GOAL_DIAMETER = 0.66;
const GOAL_DOT_DIAMETER = 0.12;
const STROKE_CSS = 2;

/** A-06's texture key, from R-P5's single table — never retyped as a string here. */
export const GOAL_TEXTURE_KEY = slotKey("goal");

/**
 * Audit R-T06 (`docs/assets/art-acceptance-2026-10-16.md`): the delivered annulus
 * is framed at **78.9 × 79.1 %** of its 512² canvas (α ≥ 128 bbox). One scalar,
 * because the two axes differ by 0.2 pt and R-C1's footprint is a circle.
 */
export const GOAL_ART_FRAMING = 0.79;

/**
 * The delivered file's **box** size as a fraction of the cell: the delivered
 * annulus is framed with headroom (req-08), so the box is the R-C1 footprint
 * divided by that framing — `0.66 / 0.79 ≈ 0.835 × cell`. Dividing means the
 * *visible* ring lands on R-C1's 0.66 × cell in both phases, which is what keeps
 * the readability numbers (and the R-C9 ring gap around the actor) untouched.
 */
export const GOAL_ART_BOX = GOAL_DIAMETER / GOAL_ART_FRAMING;

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
  /** The view's art registry; absent = no delivered art, so the vector draws. */
  readonly art?: TileObjectArtPort;
}

/**
 * Draw the goal into one cell: the delivered annulus when it is mounted, else the
 * vector ring + dot.
 *
 * Both branches use the same cell rect, the same R-C1 footprint and the same
 * R-C8 `pulseScale` — the art swap changes what the pixel is made of, not where it
 * is, how big it is or when it breathes. The texture is deliberately **not
 * tinted**: `obj.goal`'s per-phase flip (R-C10) is a *token* rule and the
 * delivered amber is already contrastive on both cell grounds (3.26:1 on A,
 * 4.31:1 on B); multiplying a fixed oil-painted hue by a token would only darken
 * it. The per-phase token read stays with the vector branch, which is what R-C10
 * was written about.
 */
export function paintGoal(ctx: GoalPaintContext): void {
  const { g, rect, theme, cssScale } = ctx;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  // R-C1's visible footprint, after R-C8's pulse — the size both branches land on.
  const cell = Math.min(rect.w, rect.h);
  const form = cell * GOAL_DIAMETER * ctx.pulseScale;
  const colour = toInt(theme.obj.goal);

  if (ctx.art?.has(GOAL_TEXTURE_KEY) === true) {
    // The box carries the file's baked headroom, so the *visible* annulus is `form`.
    const box = cell * GOAL_ART_BOX * ctx.pulseScale;
    ctx.art.draw(GOAL_TEXTURE_KEY, cx, cy, box, box);
    // §3.1e M-5 (ORDERED) — R-C1's centre dot, drawn over the delivered annulus.
    // The probe found **zero ink inside r < 0.62 · outer** on the shipped
    // `goal.png`, so the art branch previously returned a bare ring and the goal
    // was indistinguishable from the live portal at a glance (§3.1e "both rings").
    // Same construction, radius and token as the vector branch below; the file's
    // centre is transparent, so the dot reads through it.
    g.fillStyle(colour, 1);
    g.fillCircle(cx, cy, (cell * GOAL_DOT_DIAMETER) / 2);
    return;
  }

  const radius = form / 2;

  g.lineStyle(STROKE_CSS * cssScale, colour, 1);
  g.strokeCircle(cx, cy, radius);
  g.fillStyle(colour, 1);
  g.fillCircle(cx, cy, (cell * GOAL_DOT_DIAMETER) / 2);
}