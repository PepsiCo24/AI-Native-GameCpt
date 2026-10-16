/**
 * Actor painter — the Echo Spirit (L5, **always above the wall layer**).
 *
 * DEV PLACEHOLDER — A-03 echo_spirit_a / echo_spirit_b
 * (`docs/ui-ux.md` §9.1: "Player (A-03) → DEV PLACEHOLDER → filled circle +
 * `actor.ring`"). The delivered pair is integrated (R-005a, 2026-10-16); this
 * vector body is what the slot **degrades to** when its texture does not mount,
 * and it is the shape every number in this file was measured against.
 *
 * ── The body is now two layers of one element: paint *and* texture ───────────
 * A `Phaser.GameObjects.Graphics` cannot draw a texture, so the L5 actor is one
 * container whose internal order is fixed by three painters in `board-view.ts`:
 *
 * ```
 *   paintActor        one-shot phase ring (R-C13.4) + the vector body fallback
 *   <the spirit texture>   ← the delivered A/B form, cross-faded per phase
 *   paintActorOverlay  R-C9 identity ring + §6.5 deny tint
 * ```
 *
 * The split is not cosmetic, and neither position is arbitrary:
 *
 * - **Phase ring below the body** — R-C13.4/§6.3/R-Z7: at `scaleFrom` its radius
 *   equals the body's, so a ring above the body would draw *over the player*,
 *   which §6.3 forbids outright. Unchanged from V0.7.
 * - **Identity ring + deny tint above the texture** — both sit on the **0.82 ×
 *   cell** path (`RING_DIAMETER`), radially outside R-C1's 0.70 × cell body, so
 *   neither ever covers a pixel of the player. Above the *texture* rather than
 *   below it because the delivered sprite carries a soft aura: its α>0 extent is
 *   73.2 % of the canvas (audit R-T04) against the 69.9 % body, i.e. a glow band
 *   that reaches the ring's inner edge and would composite **over** it — dimming
 *   R-C9's contrast channel exactly in Phase A, where that ring is the *only*
 *   thing separating a 1.5:1 body from an ivory cell. R-C9 is a mechanic read
 *   (`docs/ui-ux.md` §3.1a: the ring is the contrast carrier), so the ring must
 *   land on top of the aura, not under it.
 *
 * Binding rules implemented here:
 * - **R-C9 auto contrast ring** — drawn only when `actor.ringVisible`, a value
 *   computed **once at boot** from the token map (never per frame, never a
 *   per-phase branch). Phase A: ON (the placeholder body is 1.30:1 on an ivory
 *   cell; the delivered form measures 1.48–1.56:1 — still under 3, so the
 *   decision is unchanged and still justified). Phase B: OFF (the placeholder was
 *   12.52:1). `ActorLook.ringAlpha` turns that decision into a **fadeable number**
 *   so the flip can cross-fade the ring instead of popping it (§6.2's
 *   `ground.*` / `obj.*` token fade; a boolean has no midpoint, an alpha does).
 * - **R-C13.1 / R-C13.3** — while the player stands inside a solidified wall the
 *   actor draws above the wall graphic (layer L5 > L4, see `board-view.ts`
 *   `DEPTH`) and keeps a visible contrast channel: in Phase A the ring is
 *   mandatory (body vs `obj.wallOccupied` is only 1.86:1, the ring is 4.86:1);
 *   Phase B needs no ring (body 4.62:1). No wall treatment may draw over any
 *   part of the player.
 * - **R-C13.4 one-shot phase ring** — at flip resolution, when the player's tile
 *   just became solid, a single `fx.phaseRing` ring pulses, 2 px stroke, 180 ms,
 *   scale 0.7 → 1.0 of the cell. **Every number comes from the `ring` row of
 *   `flipTimings()`** (`scaleFrom` / `scaleTo` / `strokeWidth` / `dur`), never
 *   from a constant here — that is what makes Variant CL and the reduced-motion
 *   row (`scaleFrom: 0.9`, `dur: 60`, `start: 0`) actually take effect instead of
 *   silently rendering the Variant-S look. Event feedback, never an idle
 *   animation, never looped while standing (R-C8).
 * - **§6.5 illegal-move feedback** — a nudge of **the player** toward the blocked
 *   cell and back, with `feedback.deny` tinting **the player ring only**. Never a
 *   board flash, never a shake > 2 px, never a marker or text on the wall that
 *   caused the refusal, and **never** a change to `moves` or the phase. The
 *   distance (`deny.nudge`), the duration (`deny.dur`) and the tint alpha
 *   (`deny.ringAlpha`) all come from the timing table; this painter receives the
 *   resolved alpha and only draws it.
 * - **§6.2 hop** — 130 ms `easeOutQuad`, arc `cellSize * 0.12`, squash ≤ 6 % on
 *   landing (collapsed to nothing under reduced motion: `hop.dur = 0`, `arc = 0`,
 *   `squash = 0` ⇒ the actor is drawn exactly at its target cell, §6.4). The
 *   squash is a *shape* rule, so it applies to the texture too — the pair shares
 *   a byte-identical alpha mask, so scaling both forms identically shifts nothing.
 *
 * The deny tint is drawn **over** the identity ring rather than instead of it:
 * §6.5's wording is "tints the *player ring only* at 0.5 alpha", and replacing
 * the ring would dim the actor's R-C9 contrast channel during the 90 ms nudge.
 */

import type Phaser from "phaser";
import type { Hex, ThemeTokens } from "@/game/theme/tokens";
import { blend, toInt } from "@/game/theme/tokens";

/** R-C1: player diameter as a fraction of the cell. */
const ACTOR_DIAMETER = 0.7;
/** R-C9: the identity ring sits just outside the body. */
const RING_DIAMETER = 0.82;
/** R-C13.4: the one-shot phase ring reaches the full cell at `scaleTo`. */
const PHASE_RING_DIAMETER = 1.0;
/** R-C13.4 / R-T6: 2 px strokes, expressed in CSS px and scaled by the DPR cap. */
const STROKE_CSS = 2;

/**
 * Audit R-T04 (`docs/assets/art-acceptance-2026-10-16.md`): the delivered pair is
 * framed at **69.9 × 70.1 %** of its 512² canvas (α ≥ 128 bbox), byte-identical
 * between the forms. Rounded to 0.70 here because that is also R-C1's own body
 * fraction.
 */
export const ACTOR_ART_FRAMING = 0.7;

/**
 * The delivered sprite's **box** size, as a fraction of the cell.
 *
 * The delivered files bake their headroom (framing band 65–80 %, req-08), so the
 * box has to be divided by that framing for the *form* to land on R-C1's
 * 0.70 × cell — the footprint every readability number in this file (the ring at
 * 0.82, the §6.5 arc, the wall comparisons above) was measured against, and the
 * one the vector fallback below still draws. `0.70 / 0.70 = 1.0 × cell`.
 */
export const ACTOR_ART_BOX = ACTOR_DIAMETER / ACTOR_ART_FRAMING;

/** §6.2 `easeOutQuad` — the single easing of the flip (token fade, hop, wall swap). */
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

/**
 * Every colour and alpha the actor needs for one phase.
 *
 * `ringAlpha` is the load-bearing difference from a bare token lookup: R-C9's
 * `ringVisible` is a **boolean decided once at boot per phase**, and a flip has
 * to interpolate it. Turning it into `1 | 0` here keeps R-C9's "one decision,
 * boot time, no per-phase branch" contract while giving the transition a value
 * it can fade.
 */
export interface ActorLook {
  readonly body: Hex;
  readonly ring: Hex;
  /** 1 when R-C9 turns the identity ring on for the phase, else 0. */
  readonly ringAlpha: number;
  /** §6.5 — tints the ring only, at the timing table's `deny.ringAlpha`. */
  readonly deny: Hex;
  /** R-C13.4 — `fx.phaseRing`, boot-derived by the V0.5 minimax in `theme/tokens.ts`. */
  readonly phaseRing: Hex;
}

/**
 * The actor's steady-state look for one phase. **Never hard-code a colour**: the
 * phase ring in particular is a *derived* token (V0.5 re-derived it as a
 * boot-time minimax across `wallOccupied` / both `door*Occupied` interiors), so
 * `#3A3226` / `#EAF0FF` may only ever arrive by reading `theme().fx.phaseRing`.
 */
export function actorLook(tokens: ThemeTokens): ActorLook {
  return {
    body: tokens.actor.body,
    ring: tokens.actor.ring,
    ringAlpha: tokens.actor.ringVisible ? 1 : 0,
    deny: tokens.feedback.deny,
    phaseRing: tokens.fx.phaseRing,
  };
}

/** Interpolate two looks for the flip (§6.2 token row) — the `lerpLook` pattern. */
export function lerpActorLook(from: ActorLook, to: ActorLook, t: number): ActorLook {
  const n = (a: number, b: number): number => a + (b - a) * t;
  return {
    body: blend(to.body, from.body, t),
    ring: blend(to.ring, from.ring, t),
    ringAlpha: n(from.ringAlpha, to.ringAlpha),
    deny: blend(to.deny, from.deny, t),
    phaseRing: blend(to.phaseRing, from.phaseRing, t),
  };
}

/**
 * R-C13.4 — the one-shot ring, fully resolved by the caller from
 * `flipTimings().ring`: progress, the two scales and the stroke width are the
 * table's numbers, so Variant S, Variant CL and the reduced-motion row each
 * render their own documented geometry.
 */
export interface PhaseRingState {
  /** 0 → 1 over `ring.dur`. */
  readonly progress: number;
  readonly scaleFrom: number;
  readonly scaleTo: number;
  /** Stroke width in **CSS px** (`ring.strokeWidth`), scaled by `cssScale`. */
  readonly strokeWidthCss: number;
}

export interface ActorPaintContext {
  readonly g: Phaser.GameObjects.Graphics;
  /** Actor centre in device px, hop arc and deny nudge already applied. */
  readonly cx: number;
  readonly cy: number;
  readonly cellSize: number;
  readonly cssScale: number;
  /** Colours + ring alpha for the phase (or the cross-faded pair during a flip). */
  readonly look: ActorLook;
  /** Landing squash (R-C8 disallows actor idle motion; this is flip-only). */
  readonly squash: { readonly sx: number; readonly sy: number };
  /**
   * §6.5 — alpha of the `feedback.deny` tint drawn on the player ring, or `null`
   * when no refusal is being shown. Comes from `flipTimings().deny.ringAlpha`.
   */
  readonly denyAlpha: number | null;
  /** R-C13.4 — present for one `ring.dur` window after a flip solidified the tile. */
  readonly phaseRing: PhaseRingState | null;
  /**
   * `true` when the delivered spirit texture is mounted and is drawing the body in
   * a layer between {@link paintActor} and {@link paintActorOverlay} — so this
   * painter must **not** draw the vector body (it stays the fallback, never a
   * second body under the sprite).
   */
  readonly textureBody: boolean;
}

/**
 * The **below-the-body** half of the actor: the one-shot phase ring and, when no
 * texture is mounted, the vector body fallback.
 */
export function paintActor(ctx: ActorPaintContext): void {
  const { g, cx, cy, cellSize, cssScale, look } = ctx;

  // R-C13.4 — one-shot ring, drawn first so the body always sits on top of it and
  // the ring can never cover any part of the player (R-C13.1/R-C5).
  if (ctx.phaseRing) {
    const p = Math.min(1, Math.max(0, ctx.phaseRing.progress));
    const scale = ctx.phaseRing.scaleFrom + (ctx.phaseRing.scaleTo - ctx.phaseRing.scaleFrom) * p;
    g.lineStyle(ctx.phaseRing.strokeWidthCss * cssScale, toInt(look.phaseRing), 1 - p);
    g.strokeCircle(cx, cy, ((cellSize * PHASE_RING_DIAMETER) / 2) * scale);
  }

  // DEV PLACEHOLDER — A-03 echo_spirit_a / echo_spirit_b: the vector body, drawn
  // only when the delivered texture is not mounted (R-005a, `theme/art.ts`).
  // Geometry, colour and squash are exactly the pre-integration paint.
  if (ctx.textureBody) return;
  const radius = (cellSize * ACTOR_DIAMETER) / 2;
  g.fillStyle(toInt(look.body), 1);
  g.fillEllipse(cx, cy, radius * 2 * ctx.squash.sx, radius * 2 * ctx.squash.sy);
}

/**
 * The **above-the-texture** half of the actor: R-C9's identity ring and §6.5's
 * deny tint. Both sit on the 0.82 × cell path, radially outside the body, so
 * neither covers any part of the player (see this file's header for why they must
 * still land *above* the sprite rather than under it).
 */
export function paintActorOverlay(ctx: ActorPaintContext): void {
  const { g, cx, cy, cellSize, cssScale, look } = ctx;
  const ringRadius = (cellSize * RING_DIAMETER) / 2;

  // R-C9 identity ring — boot-derived per phase, cross-faded across a flip.
  if (look.ringAlpha > 0.01) {
    g.lineStyle(STROKE_CSS * cssScale, toInt(look.ring), look.ringAlpha);
    g.strokeCircle(cx, cy, ringRadius);
  }

  // §6.5 deny tint — **the ring only**, at the timing table's alpha, over the
  // identity ring. If R-C9 turned the identity ring off (Phase B) this still
  // draws, so a refusal is never invisible. Nothing else on the board reacts.
  if (ctx.denyAlpha !== null && ctx.denyAlpha > 0.01) {
    g.lineStyle(STROKE_CSS * cssScale, toInt(look.deny), ctx.denyAlpha);
    g.strokeCircle(cx, cy, ringRadius);
  }
}