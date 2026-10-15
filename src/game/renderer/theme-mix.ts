/**
 * Canvas token cross-fade — the `ground.*` / `obj.*` half of `docs/ui-ux.md`
 * §6.2's `60–200 ms` row, as one pure function.
 *
 * **Why this module exists.** §5.4 says "the phase flip is a **token swap +
 * tween**, not a scene change" and §6.2 fixes *which* tokens cross-fade
 * (`ground.*`, `obj.*`, `text.*`). The board's canvas consumes those through
 * `theme(phase)`, which is a step function — so without a mixer every canvas
 * element that reads the token map directly (page ground, board plate, cell
 * plates, grid separator, goal, hover ring, win tint) would **pop** at the flip
 * instead of fading, while the walls faded (§6.2's `80–200 ms` row via
 * `WallLook`) and the actor faded (`ActorLook`). That asymmetry is the bug this
 * function removes.
 *
 * **Why it lives here and not in `theme/tokens.ts`.** `theme/tokens.ts` is the
 * measured V0.5 token record and is deliberately importable by plain Node for
 * the derived-token evidence run (see its header). This file is *renderer glue*:
 * it introduces no colour and re-tunes no token — it only interpolates two
 * already-measured maps. **No hex literal exists here** (R-C11); every value
 * comes from `theme()` and the blend maths is the same `blend()` the derived
 * tokens use (R-C12), so R-C7's "no runtime alpha over ground" rule still holds:
 * the result is a flat, precomputed colour, never alpha compositing.
 *
 * **Reduced motion (§6.4).** The mixer is timing-agnostic: it is handed a
 * progress value. Under `prefers-reduced-motion` the caller reads
 * `flipTimings(true)`, whose token row is `dur: 60, start: 0` — the documented
 * "single 60 ms token swap" — and every final colour is identical, so legibility
 * is unchanged and only motion is removed.
 *
 * **Scope.** This covers the tokens the canvas reads *outside* the two stateful
 * painters: `ground` (all five), `obj.goal`, `accent` (hover ring) and
 * `feedback.win` (L7 plate tint). Walls interpolate `WallLook` (fill, stroke,
 * edge, footprint, notch) and the actor interpolates `ActorLook` (body, ring,
 * ring alpha, deny tint, `fx.phaseRing`) — both carry geometry/alpha that a
 * colour-only mix cannot express, and both keep their single owner.
 */

import type { Hex, ThemeTokens } from "@/game/theme/tokens";
import { blend } from "@/game/theme/tokens";

/**
 * Interpolate two theme maps for the canvas: colours lerp, decisions do not.
 *
 * - `t` is the **eased** progress of §6.2's token row (`easeOutQuad`, see
 *   `objects/actor.ts`), clamped by the caller.
 * - At `t <= 0` / `t >= 1` the original objects are returned unchanged, so the
 *   steady state is bit-identical to `theme(phase)` — a flip can never leave a
 *   slightly-off colour behind.
 * - **Decision fields come from `to`, never from a blend**: `hud.phaseGlyph`,
 *   `hud.phaseLabel`, `actor.ringVisible` (R-C9's boot-time decision), the
 *   `winAlpha` and the `hud.panelAlpha` are values with no meaningful midpoint.
 *   The actor's ring *visibility* is one of them, which is exactly why the actor
 *   has its own look: it cross-fades the ring's **alpha** (`ActorLook.ringAlpha`)
 *   instead of toggling a boolean mid-flight.
 * - `hud` / `btn` / `text` are carried over from `to` untouched: the DOM half
 *   runs its own CSS transition from the same timing table (`hud.ts`), and the
 *   canvas never draws text (§7.1).
 */
export function mixTheme(from: ThemeTokens, to: ThemeTokens, t: number): ThemeTokens {
  if (t <= 0) return from;
  if (t >= 1) return to;

  /**
   * Lerp two `#RRGGBB` tokens. `blend(to, from, t)` is `to * t + from * (1 - t)`
   * — the same byte-space blend the derived tokens use, so a mid-transition
   * colour is as deterministic (and as unit-testable) as a steady-state one.
   */
  const c = (a: Hex, b: Hex): Hex => blend(b, a, t);

  return {
    ...to,
    ground: {
      page: c(from.ground.page, to.ground.page),
      plate: c(from.ground.plate, to.ground.plate),
      cell: c(from.ground.cell, to.ground.cell),
      cellAlt: c(from.ground.cellAlt, to.ground.cellAlt),
      grid: c(from.ground.grid, to.ground.grid),
    },
    obj: {
      ...to.obj,
      // The goal is the one `obj.*` token the canvas reads directly; walls,
      // doors and portals interpolate their own looks.
      goal: c(from.obj.goal, to.obj.goal),
    },
    accent: c(from.accent, to.accent),
    feedback: {
      ...to.feedback,
      win: c(from.feedback.win, to.feedback.win),
    },
  };
}