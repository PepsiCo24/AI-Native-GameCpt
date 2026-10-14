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
 */

/** `<style>` element id — the injection is idempotent (never two copies). */
export const HUD_STYLE_ID = "ps-hud-styles";

/** The §5.3 font stack: system fonts only, **no webfont** in the prototype. */
export const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif';

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

/* Buttons — real buttons, 44 px hit box floor (R-T1), ≥ 8 px gaps (R-T2). */
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
  transition:
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
}

.ps-dialog-title { margin: 0; font-size: 28px; font-weight: 700; }
.ps-dialog-body { margin: 0; font-size: 15px; color: var(--ps-text-secondary); font-variant-numeric: tabular-nums; }
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

/* §6.4 — reduced motion: the token swap stays, the transition goes. */
@media (prefers-reduced-motion: reduce) {
  .ps-shell, .ps-bar, .ps-play, .ps-chip, .ps-btn, .ps-dialog {
    transition: none;
    animation: none;
  }
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