/**
 * Actor painter — the Echo Spirit (L5, **always above the wall layer**).
 *
 * DEV PLACEHOLDER — A-03 echo_spirit_a / echo_spirit_b
 * (`docs/ui-ux.md` §9.1: "Player (A-03) → DEV PLACEHOLDER → filled circle +
 * `actor.ring`"). Filled round glow, 70 % of the cell (R-C1), no sprite, no art.
 *
 * Binding rules implemented here:
 * - **R-C9 auto contrast ring** — drawn only when `theme.actor.ringVisible`, a
 *   value computed **once at boot** from the token map (never per frame, never a
 *   per-phase branch). Phase A: ON (body alone is 1.30:1 on an ivory cell);
 *   Phase B: OFF (12.52:1 already).
 * - **R-C13.1 / R-C13.3** — while the player stands inside a solidified wall the
 *   actor draws above the wall graphic (layer L5 > L4) and keeps a visible
 *   contrast channel: in Phase A the ring is mandatory (body vs
 *   `obj.wallOccupied` is only 1.86:1, the ring is 4.86:1); Phase B needs no ring
 *   (body 4.62:1). No wall treatment may draw over any part of the player.
 * - **R-C13.4 one-shot phase ring** — at flip resolution, when the player's tile
 *   just became solid, a single `fx.phaseRing` ring pulses 0.7 → 1.0 of the cell,
 *   2 px, 180 ms. Event feedback, never an idle animation, never looped.
 * - **§6.5 illegal-move feedback** — a 90 ms nudge of **the player** 4 px toward
 *   the blocked cell and back, with `feedback.deny` tinting **the player ring
 *   only** at 0.5 alpha. Never a board flash, never a shake > 2 px, never a
 *   marker or text on the wall that caused the refusal.
 * - **§6.2 hop** — 130 ms `easeOutQuad`, arc `cellSize * 0.12`, squash ≤ 6 % on
 *   landing (collapsed to nothing under reduced motion, §6.4).
 */

import type Phaser from "phaser";
import { toInt } from "@/game/theme/tokens";
import type { ThemeTokens } from "@/game/theme/tokens";

/** R-C1: player diameter as a fraction of the cell. */
const ACTOR_DIAMETER = 0.7;
const RING_DIAMETER = 0.82;
const PHASE_RING_DIAMETER = 1.0;
const STROKE_CSS = 2;
/** §6.5: the nudge is 4 px of the *player sprite*, never of a wall. */
const DENY_RING_ALPHA = 0.5;

/** §6.2 `easeOutQuad`. */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** §6.2 arc: apex at `cellSize * 0.12` for `arc = 0.12`. */
export function hopArcOffset(progress: number, cellSize: number, arc: number): number {
  const s = easeOutQuad(progress);
  return -arc * cellSize * 4 * s * (1 - s);
}

/** §6.2 squash ≤ 6 % on landing — symmetric, zero at both ends. */
export function landingSquash(progress: number, amount: number): { sx: number; sy: number } {
  // Active only over the tail of the hop, so the shape is round while airborne.
  const tail = Math.max(0, (progress - 0.75) / 0.25);
  const wave = Math.sin(Math.PI * tail) * amount;
  return { sx: 1 + wave, sy: 1 - wave };
}

export interface PhaseRingState {
  /** 0 → 1 over `FLIP_TIMING.ring.dur`. */
  readonly progress: number;
}

export interface ActorPaintContext {
  readonly g: Phaser.GameObjects.Graphics;
  /** Actor centre in device px, hop arc and deny nudge already applied. */
  readonly cx: number;
  readonly cy: number;
  readonly cellSize: number;
  readonly cssScale: number;
  readonly theme: ThemeTokens;
  /** Landing squash (R-C8 disallows actor idle motion; this is flip-only). */
  readonly squash: { readonly sx: number; readonly sy: number };
  /** `true` while the §6.5 deny nudge is running. */
  readonly denying: boolean;
  /** R-C13.4 — present for one 180 ms window after a flip solidified the tile. */
  readonly phaseRing: PhaseRingState | null;
}

export function paintActor(ctx: ActorPaintContext): void {
  const { g, cx, cy, cellSize, cssScale, theme } = ctx;

  // R-C13.4 — one-shot ring, drawn first so the body always sits on top of it.
  if (ctx.phaseRing) {
    const p = Math.min(1, Math.max(0, ctx.phaseRing.progress));
    const ringScale = 0.7 + (1.0 - 0.7) * p;
    g.lineStyle(STROKE_CSS * cssScale, toInt(theme.fx.phaseRing), 1 - p);
    g.strokeCircle(cx, cy, ((cellSize * PHASE_RING_DIAMETER) / 2) * ringScale);
  }

  // R-C9 identity ring — boot-derived, never a per-phase branch.
  // §6.5 deny tint — the ring only; if R-C9 turned the identity ring off, the
  // deny ring is still drawn so the refusal is visible in both phases.
  const ringRadius = (cellSize * RING_DIAMETER) / 2;
  if (ctx.denying) {
    g.lineStyle(STROKE_CSS * cssScale, toInt(theme.feedback.deny), DENY_RING_ALPHA);
    g.strokeCircle(cx, cy, ringRadius);
  } else if (theme.actor.ringVisible) {
    g.lineStyle(STROKE_CSS * cssScale, toInt(theme.actor.ring), 1);
    g.strokeCircle(cx, cy, ringRadius);
  }

  // Body — filled round glow, R-C1's only solid moving element.
  const radius = (cellSize * ACTOR_DIAMETER) / 2;
  g.fillStyle(toInt(theme.actor.body), 1);
  g.fillEllipse(cx, cy, radius * 2 * ctx.squash.sx, radius * 2 * ctx.squash.sy);
}