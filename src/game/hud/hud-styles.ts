/**
 * HUD stylesheet — the CSS half of `docs/ui-ux.md` §7 (DOM / HUD overlay).
 *
 * Injected at runtime as a `<style>` element instead of a `*.css` import so the
 * module needs no bundler CSS handling and no build-config change
 * (`vite.config.ts` / `tsconfig.json` are shared tooling this role does not own).
 *
 * ─── Colour rule (§5.4 / R-C11) ──────────────────────────────────────────────
 * **Not one literal colour in this file.** Every colour is `var(--ps-*)`, and the
 * `--ps-*` values are written onto the shell element by `hud.ts` from
 * `cssVars(phase)` — the same token map Phaser renders from. A phase flip is one
 * `data-phase` attribute plus CSS transitions driven by the §6.2 timing table
 * (also injected as `--ps-*` numbers), never per-element JS styling.
 *
 * Neutral shadows are `rgba(0, 0, 0, …)` on purpose: a shadow is depth, not
 * state, and giving it a token would invent a colour the UI spec never defined.
 * (`rgba()` is also not a `#RRGGBB` literal, so the §5.4 grep gate that forbids
 * hex outside `theme/tokens.ts` stays clean.)
 *
 * Layout contract (§2.2 / §7.3):
 * - top bar **56 px** + `env(safe-area-inset-top)`, bottom bar **72 px** +
 *   safe-area inset, play area `flex: 1`;
 * - bars are **real layout boxes**, not a floating overlay, so the HUD can never
 *   intersect the board rect (§7.3) — a stronger guarantee than
 *   `pointer-events: none` would give, and no full-screen layer eats a board tap;
 * - the only fixed overlay is the win dialog, whose root is `pointer-events:
 *   none` and whose card re-enables `pointer-events: auto` on itself (§7.3);
 * - every interactive control is a real `<button>` with a visible focus ring at
 *   ≥ 3:1 (`accent`), ≥ 44 × 44 CSS px hit box (R-T1), ≥ 8 px gaps (R-T2).
 *
 * ─── §6.6 motion beats on the DOM side (GAME-003) ────────────────────────────
 * **B12** (button press: scale 0.97 + shadow 12 → 6 px, 90 ms in / 140 ms out) and
 * **B13** (win panel entrance: 160 ms alpha + fixed offset, Next tappable from the
 * first frame) are implemented here as CSS over the existing nodes. Every number and
 * every reduced-motion variant arrives as a `--ps-*` value written by `hud.ts`, so the
 * collapse under `prefers-reduced-motion` is a **data flip** (R-M4), not a branch: the
 * press scale and the panel offset are variables, and the panel's alpha fade is the
 * one beat MV-4 keeps.
 *
 * ─── §5.5 the post-win star field (GAME-004) ─────────────────────────────────
 * One added grid row inside `.ps-dialog`, between the body and the actions. The whole
 * field is **program-drawn geometry**: a 5-point `clip-path` polygon computed from the
 * two declared radii ({@link STAR_CLIP_PATH}), never a raster (REFUSED by the ASSET
 * GATE) and never a text glyph (`★` / `☆` — a glyph is not a figure: it has no declared
 * 2 px wall, no ink contract and no token colour, the prototype ships no webfont, and it
 * would enter the accessibility tree as a font-dependent character name where §5.5
 * declares the accessible name exactly). The colours are the **shipped tokens** read
 * through `--ps-*` like every other surface (§5.4 / R-C11): `obj.goal` for both star
 * states, `ground.plate` for the knock-out, `text.secondary` for the empty dot — **no
 * new colour token exists for this field**.
 *
 * Its one added motion is the stars' fill-in, and it is a **child of B13's card**: the
 * keyframes run from the node's own render, which is the overlay's unhide instant
 * (`flipTimings.total`), so no beat ID, no tween instance and no input gate is added.
 * The reduced form is the data flip of `--ps-star-scale-from` → 1 (see the media query
 * note at the bottom of this file) — the field is deliberately **not** in the
 * `animation: none` list, because a media-query kill would be a second code path where
 * §5.5 SF-7 declares one variable.
 */

/** `<style>` element id — the injection is idempotent (never two copies). */
export const HUD_STYLE_ID = "ps-hud-styles";

/** The §5.3 font stack: system fonts only, **no webfont** in the prototype. */
export const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif';

/* ────────────────────────────────────────────────────────────────────────────
 * §5.5 — the star field's geometry (GAME-004), computed from the declared numbers.
 *
 * The polygon is **computed, not typed**: R = {@link STAR_OUTER_RATIO} of the box and
 * r = {@link STAR_INNER_RATIO} × R, centre-pivoted, no rotation — so a box-size change
 * or a ratio ruling moves the figure and nothing else. Emitted in **percentages**, which
 * is what makes the same string valid in CSS at any box size, and rounded to 3 decimals
 * (sub-pixel at every shipped pitch — the box is 20 CSS px).
 * ──────────────────────────────────────────────────────────────────────────── */

/** §5.5 SF-2: the star box, in CSS px — 3 slots + 2 × `--ps-gap` ⇒ the 76 px row. */
export const STAR_BOX_PX = 20;
/** §5.5 SF-1: outer circumradius as a fraction of the box (`R = 50 %`). */
export const STAR_OUTER_RATIO = 0.5;
/** §5.5 SF-1: inner radius as a fraction of the outer (`r = 0.382 R`, the ★ proportion). */
export const STAR_INNER_RATIO = 0.382;
/** §5.5 SF-3: the hollow form's knock-out scale — R − 0.8R = **2 px** of wall (§3.1a). */
export const STAR_KNOCKOUT_SCALE = 0.8;
/** §5.5 SF-3: the `empty` slot's dot diameter, `0.25 ×` the box. */
export const STAR_DOT_PX = 5;

/** 5 outer points, 5 inner, 36° apart, first point straight up (`-90°`). */
export const STAR_POINTS = 10;

/** One `x% y%` pair, centre-relative and rounded so the CSS string stays readable. */
function starPoint(box: number, index: number): string {
  const centre = box / 2;
  const outer = box * STAR_OUTER_RATIO;
  const radius = index % 2 === 0 ? outer : outer * STAR_INNER_RATIO;
  const angle = ((-90 + index * (360 / STAR_POINTS)) * Math.PI) / 180;
  const x = ((centre + radius * Math.cos(angle)) / box) * 100;
  const y = ((centre + radius * Math.sin(angle)) / box) * 100;
  const pct = (value: number): string => `${String(Number(value.toFixed(3)))}%`;
  return `${pct(x)} ${pct(y)}`;
}

/** §5.5 SF-1 — the filled star's silhouette, as the `clip-path` both states share. */
export const STAR_CLIP_PATH = `polygon(${Array.from(
  { length: STAR_POINTS },
  (_, index) => starPoint(STAR_BOX_PX, index),
).join(", ")})`;

/**
 * The stylesheet. Values that belong to the spec's numbers (bar heights, target
 * sizes, flip timings, token colours) are all `var(--ps-*)` — see `hud.ts`.
 */
export const HUD_CSS = `
.ps-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--ps-ground-page);
  color: var(--ps-text-primary);
  font-family: var(--ps-font-stack);
  -webkit-user-select: none;
  user-select: none;
  transition: background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms);
}

.ps-bar {
  flex: 0 0 auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--ps-gap);
  padding-inline: var(--ps-pad);
  background: var(--ps-ground-plate);
  transition: background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms);
}

.ps-top {
  height: calc(var(--ps-top-bar) + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  border-bottom: 1px solid var(--ps-ground-grid);
}

.ps-bottom {
  height: calc(var(--ps-bottom-bar) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top: 1px solid var(--ps-ground-grid);
  justify-content: space-between;
}

/* The play area is the canvas parent: flex: 1, never sized from window.innerWidth. */
.ps-play {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background: var(--ps-ground-page);
  transition: background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms);
}

.ps-play canvas { display: block; }

.ps-level { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.ps-moves { font-size: 16px; font-weight: 500; color: var(--ps-text-secondary); font-variant-numeric: tabular-nums; }
.ps-spacer { flex: 1 1 auto; }
.ps-hint { font-size: 14px; color: var(--ps-text-secondary); }
.ps-hint[hidden] { display: none; }

/* Phase chip — indicator only, never a button (there is no manual phase switch). */
.ps-chip {
  height: calc(var(--ps-control) - var(--ps-gap));
  display: inline-flex;
  align-items: center;
  gap: var(--ps-gap);
  padding-inline: var(--ps-gap);
  border-radius: 22px;
  background: var(--ps-chip-fill);
  color: var(--ps-chip-ink);
  transition:
    background-color var(--ps-flip-chip-ms) linear var(--ps-flip-chip-delay-ms),
    color var(--ps-flip-chip-ms) linear var(--ps-flip-chip-delay-ms);
}

/* Glyphs distinguish the phase by SHAPE, never by colour alone (R-C1): sun =
   ringed disc, crescent = carved disc. Inline SVG-free CSS shapes (§9.1). */
.ps-glyph { position: relative; width: 32px; height: 32px; flex: 0 0 auto; }
.ps-glyph::before { content: ""; position: absolute; inset: 9px; border-radius: 50%; background: currentColor; }
.ps-glyph[data-glyph="sun"]::after { content: ""; position: absolute; inset: 2px; border-radius: 50%; border: 2px solid currentColor; }
.ps-glyph[data-glyph="crescent"]::after { content: ""; position: absolute; inset: 9px; left: 3px; border-radius: 50%; background: var(--ps-chip-fill); }

/* Buttons — real buttons, 44 px hit box floor (R-T1), ≥ 8 px gaps (R-T2).

   B12 (§6.6) — press feedback: visual scale 0.97 + shadow lift 12 → 6 px,
   90 ms in / 140 ms out. The **hit box stays the layout box**: the beat is a
   transform, never a width/height/margin change, so the 44 px floor is untouched.
   Both the scale and the offset are data (--ps-press-*), so MV-4's reduced form
   (the scale dies, the value state survives) is a variable flip, not a branch. */
.ps-actions { display: flex; align-items: center; gap: var(--ps-control-gap); }

.ps-btn {
  box-sizing: border-box;
  min-height: var(--ps-control);
  min-width: var(--ps-control);
  padding-inline: var(--ps-pad);
  border-radius: 12px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.18);
  transition:
    background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms),
    color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms),
    border-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms),
    transform var(--ps-press-out-ms) ease-out,
    box-shadow var(--ps-press-out-ms) ease-out;
}

.ps-btn:active {
  transform: scale(var(--ps-press-scale));
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.28);
  transition:
    transform var(--ps-press-in-ms) ease-out,
    box-shadow var(--ps-press-in-ms) ease-out,
    background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms),
    color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms),
    border-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms);
}

.ps-btn:focus-visible { outline: 3px solid var(--ps-accent); outline-offset: 2px; }
.ps-btn[disabled] { opacity: 0.45; cursor: default; }

.ps-btn-ghost { background: transparent; border-color: var(--ps-btn-ghost-outline); color: var(--ps-btn-ghost-label); }

.ps-btn-primary {
  background: linear-gradient(180deg, var(--ps-btn-from), var(--ps-btn-to));
  color: var(--ps-btn-label);
  min-height: 48px;
  min-width: 160px;
  font-size: 16px;
}

/* Win dialog (§1: the prototype's only dialog). Backdrop is NOT a tap target. */
.ps-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--ps-pad);
  pointer-events: none;
}
.ps-overlay[hidden] { display: none; }

.ps-dialog {
  pointer-events: auto;
  box-sizing: border-box;
  width: 100%;
  max-width: 320px;
  display: grid;
  gap: var(--ps-gap);
  justify-items: center;
  text-align: center;
  padding: var(--ps-pad);
  border-radius: 20px;
  background: var(--ps-ground-plate);
  color: var(--ps-text-primary);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  transition: background-color var(--ps-flip-tokens-ms) linear var(--ps-flip-tokens-delay-ms);
  /* B13 (§6.6) — entrance from flipTimings.total (220 ms, the HUD's own delay),
     160 ms, settled ≈ 380–400 ms. Alpha + a fixed offset; **Next is tappable from
     the first frame** because the overlay unhides with no input gate. Under reduced
     motion the offset is 0 (--ps-panel-offset), which leaves the alpha fade alone
     — MV-4's "kept (alpha only)". */
  animation: ps-panel-in var(--ps-panel-ms) ease-out both;
}

@keyframes ps-panel-in {
  from { opacity: 0; transform: translateY(var(--ps-panel-offset)); }
  to { opacity: 1; transform: translateY(0); }
}

.ps-dialog-title { margin: 0; font-size: 28px; font-weight: 700; }
.ps-dialog-body { margin: 0; font-size: 15px; color: var(--ps-text-secondary); font-variant-numeric: tabular-nums; }

/* §5.5 — the post-win star field. ONE added grid row between the body and the
   actions, so its vertical rhythm is the panel's own --ps-gap and there is no new
   padding / gap / offset / z-index constant anywhere here. Three slots, ALWAYS (a
   rating-dependent width would reflow the card under B13's offset entrance): 3 × 20 px
   + 2 × --ps-gap = the 76 px row, centred by the panel's own justify-items.

   The ground is the panel's own ground.plate (--ps-ground-plate) — never
   ground.cellAlt (A-2's lesson: the panel is not a checker cell).

   The field is aria-hidden (set in hud.ts): it carries no text and no name, and the
   rating is announced by the panel's existing live-region line. There is **no idle
   motion** on any slot in any state (§5.5 SF-8): the only keyframe below is the one-shot
   fill-in, and it is both-filled so a settled panel is a constant. */
.ps-stars {
  display: flex;
  align-items: center;
  gap: var(--ps-gap);
  height: ${STAR_BOX_PX}px;
}

.ps-star { position: relative; width: ${STAR_BOX_PX}px; height: ${STAR_BOX_PX}px; flex: 0 0 auto; }

/* Filled star (earned) and hollow star (held) share the ONE silhouette: the hollow
   form is the same figure knocked out — never a stroke outline (SF-1/SF-3). Both are
   obj.goal (--ps-goal): there is no second colour and the colour step is not a
   declared channel (§5.5's measured 1.530:1 / 1.295:1 is below R-E2's criterion). */
.ps-star[data-state="earned"]::before,
.ps-star[data-state="held"]::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ps-goal);
  clip-path: ${STAR_CLIP_PATH};
  /* R = 50 % of the box, r = 0.382 R — computed in hud-styles.ts, never typed here. */
}

/* The knock-out, in the field's own ground: the door-medallion device (§3.1b), which
   reads as a 2 px wall and yields the analytic 36.0 % ink share / 2.78:1 fill ratio. */
.ps-star[data-state="held"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ps-ground-plate);
  clip-path: ${STAR_CLIP_PATH};
  transform: scale(${STAR_KNOCKOUT_SCALE});
}

/* Nobody has it: a filled disc of text.secondary, 5 px Ø = 0.25 × the box. */
.ps-star[data-state="empty"]::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: ${STAR_DOT_PX}px;
  height: ${STAR_DOT_PX}px;
  margin: ${String(-STAR_DOT_PX / 2)}px 0 0 ${String(-STAR_DOT_PX / 2)}px;
  border-radius: 50%;
  background: var(--ps-text-secondary);
}

/* §5.5 SF-6 / §6.6 B13 — the field's ONE added motion, on the earned marks only ("scale
   0.86 → 1.00, fill-only"): ≤ 120 ms, delay 0 — no colour flash, no rotation, no overshoot
   and **no per-star stagger** (§5.5: three staggered beats in a 160 ms window is chatter).
   It rides B13 because it is a child of the same card, so it starts on the unhide frame
   and settles by ≈ 340 ms inside the 380–400 ms flourish.

   There is **no opacity channel**: under reduced motion the star's only appearance
   channel must be the panel's own kept alpha fade (SF-7), which the data flip
   (--ps-star-scale-from = 1) leaves as a constant-value animation — no pop, no branch,
   and no second code path in the media query at the bottom of this file. */
@keyframes ps-star-in {
  from { transform: scale(var(--ps-star-scale-from)); }
  to { transform: scale(1); }
}

.ps-star[data-state="earned"] { animation: ps-star-in var(--ps-star-ms) ease-out both; }

.ps-dialog-actions { display: flex; flex-wrap: wrap; gap: var(--ps-control-gap); justify-content: center; }

/* R-P3 — dev-only placeholder honesty label. Lives inside a bar, never over the board. */
.ps-devbadge { flex: 0 1 auto; font-size: 10px; line-height: 1.25; font-weight: 600; letter-spacing: 0.04em; text-align: right; color: var(--ps-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* R-P3 placeholders=1 — a dev-only strip BETWEEN the bars and the play area, so
   the Asset ID list is never truncated and still never intersects the board rect
   (§7.3: it is a layout box, not an overlay). */
.ps-devstrip { flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 4px 10px; padding: 4px var(--ps-pad); font-size: 10px; line-height: 1.3; font-weight: 500; color: var(--ps-text-secondary); background: var(--ps-ground-plate); }
.ps-devstrip[hidden] { display: none; }
.ps-devstrip-item { white-space: nowrap; }

/* Visually hidden, still announced (§7.4 aria-live region). */
.ps-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* §6.4 — reduced motion: the token swap stays, the transition goes. B12's press
   scale, B13's panel offset and the §5.5 star fill-in's pop all die as *data*
   (--ps-press-scale / --ps-panel-offset / --ps-star-scale-from are set to 1 / 0px / 1
   by hud.ts); the panel's own alpha fade is kept (MV-4), so .ps-dialog — and the star
   field with it — is deliberately NOT in the animation: none list below: killing the
   keyframes here would be a second code path where SF-7 declares one variable. */
@media (prefers-reduced-motion: reduce) {
  .ps-shell, .ps-bar, .ps-play, .ps-chip, .ps-btn, .ps-dialog {
    transition: none;
  }
  .ps-shell, .ps-bar, .ps-play, .ps-chip {
    animation: none;
  }
  .ps-btn:active { transition: none; }
}
`;

/** Inject the stylesheet once per document. */
export function injectHudStyles(doc: Document): void {
  if (doc.getElementById(HUD_STYLE_ID) !== null) return;
  const style = doc.createElement("style");
  style.id = HUD_STYLE_ID;
  style.textContent = HUD_CSS;
  doc.head.append(style);
}