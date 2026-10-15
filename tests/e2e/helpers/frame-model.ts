/**
 * The **frame model** — what a runner's own animation-frame grid can and cannot
 * present, expressed as pure arithmetic (QA-005d).
 *
 * ── Why this file exists ─────────────────────────────────────────────────────
 * Two cloud-only failures turned out to be *measurement* questions about the
 * runner's frame grid, not rule questions about the game:
 *
 * 1. the §6.5 refusal arc (90 ms) came back with `onset: null` on CI and with an
 *    onset locally — a question about *which frames the machine presents*;
 * 2. the R-T4 swipe (≥ 24 px **within 500 ms of game time**) did not commit on CI
 *    — a question about *how many frames a synthetic gesture's CDP burst spans*.
 *
 * Both are answered by the same small model: Phaser steps the scene **once per
 * animation frame** and stamps that step with the frame's `requestAnimationFrame`
 * timestamp (`Clock.update` ← `Systems.step` ← `TimeStep.step(time)`), while every
 * DOM input event is handled **between** steps, where `scene.time.now` still
 * holds the *previous* frame's stamp. So:
 *
 * - a transient of `D` ms is painted iff at least one frame stamp falls strictly
 *   inside `(stamp_at_event, stamp_at_event + D)`;
 * - a gesture's game-clock duration is `frames_spanned × grid`, quantised to the
 *   grid — never the wall-clock span of the driver's CDP round trips.
 *
 * The functions here are deliberately free of Playwright, Phaser and `src/**`
 * imports: they are the part of the protocol that a `node`-environment vitest file
 * can drive with synthetic grids (`tests/unit/frame-model.test.ts`), which is how
 * the "coarse runner" branch is proved **on any machine**, including a 60 Hz one.
 *
 * The measurements they consume come from `helpers/probe.ts`, whose in-page
 * observer records the runner's real `requestAnimationFrame` stamps and every DOM
 * input event, both on the `performance.now()` clock.
 */

/** The two animation frames that bracket an instant, and the gap between them. */
export interface FrameBracket {
  /** The last frame stamp `<= t` — the step `scene.time.now` held during `t`. */
  readonly before: number | null;
  /** The first frame stamp `> t` — the next step the game will run. */
  readonly after: number | null;
  /**
   * `after - before`: the frame interval that spans `t`. `null` when either side
   * is missing (the instant fell outside the recorded frames).
   */
  readonly gapMs: number | null;
}

/**
 * The frame stamps bracketing `t`.
 *
 * `before` is the game clock's value **at** `t`: an input event is handled between
 * two steps, so `scene.time.now` is the previous step's stamp. `after` is the step
 * that will paint the response.
 */
export function bracketFrames(frames: readonly number[], t: number): FrameBracket {
  let before: number | null = null;
  let after: number | null = null;
  for (const frame of frames) {
    if (frame <= t) {
      if (before === null || frame > before) before = frame;
      continue;
    }
    if (after === null || frame < after) after = frame;
  }
  return { before, after, gapMs: before === null || after === null ? null : after - before };
}

/**
 * How many frames the interval `(t0, t1]` spans — the **quantised** game-clock
 * duration of anything that starts at `t0` and ends at `t1`.
 *
 * The count is `index(before(t1)) - index(before(t0))` on the recorded grid, i.e.
 * the number of steps the scene runs between the two instants. Zero means both
 * instants were handled against the same step: the game sees a zero-length
 * gesture even if the driver took 200 ms of wall clock to deliver it.
 */
export function framesSpanned(frames: readonly number[], t0: number, t1: number): number {
  const before = bracketFrames(frames, t0).before;
  const after = bracketFrames(frames, t1).before;
  if (before === null || after === null) return 0;
  const from = frames.indexOf(before);
  const to = frames.indexOf(after);
  if (from < 0 || to < 0) return 0;
  return Math.max(0, to - from);
}

/**
 * The game-clock duration of a gesture, in ms — `framesSpanned × grid`.
 *
 * `gridMs` is the runner's own median frame interval (measured, not assumed).
 * This is the number R-T4's `swipeMaxMs` is compared against, and the number the
 * suite must therefore predict *before* asserting the swipe committed.
 */
export function gestureGameMs(
  frames: readonly number[],
  t0: number,
  t1: number,
  gridMs: number,
): number {
  return framesSpanned(frames, t0, t1) * gridMs;
}

/** What the runner's frame grid can say about a 90 ms transient. */
export type ArcVerdict =
  /** A frame stamp can fall inside the arc's window — the pixel claim is owed. */
  | "resolvable"
  /**
   * Every step is at least one arc-length apart: the arc is painted at no
   * presented frame, so **no pixel evidence can exist on this machine**. The
   * claim is not false — it is unresolvable at this grid, and must be named as
   * such instead of silently dropped.
   */
  | "unresolvable-at-grid";

/**
 * Classify a gap between the two frames bracketing the trigger.
 *
 * The refusal arc is painted iff a step lands strictly inside
 * `(t_trigger, t_trigger + dur)`: the step *at* `t_trigger` painted before the
 * deny was recorded, and the step at `t_trigger + dur` (or later) already reads
 * `progress >= 1`, where the nudge offset is `sin(π) = 0` and `BoardView.update`
 * has cleared the deny. So `gap >= dur` ⟺ the arc is never presented.
 *
 * This is a **strict** inequality at the boundary: a 90.0 ms gap can present
 * nothing, and `deny.dur` is exactly that boundary.
 */
export function arcVerdict(gapMs: number, arcMs: number): ArcVerdict {
  return gapMs >= arcMs ? "unresolvable-at-grid" : "resolvable";
}

/**
 * The runner's own median animation-frame interval over recorded stamps, in ms.
 *
 * This is the `grid` of the measured tables in `tests/e2e/README.md` §1.5: the
 * frame grid an *observer* recorded (`helpers/probe.ts`), as opposed to the
 * recorder's own median (`capture.ts` `medianFrameInterval`). `0` when fewer than
 * two stamps were recorded — which makes `framesSpanned × grid === 0` unusable as
 * evidence, so callers assert `gridMs > 0` where they mean "a real grid".
 */
export function medianFrameGap(frames: readonly number[]): number {
  const deltas: number[] = [];
  for (let index = 1; index < frames.length; index += 1) {
    const a = frames[index - 1];
    const b = frames[index];
    if (a !== undefined && b !== undefined) deltas.push(b - a);
  }
  deltas.sort((x, y) => x - y);
  return deltas[Math.floor(deltas.length / 2)] ?? 0;
}

/**
 * The §6.5 deny nudge's displacement at the first step after the trigger, in
 * device px — `sin(π · gap/dur) · nudge · renderScale`.
 *
 * Used by the unit proof that the *geometry* agrees with the verdict: it is the
 * nudge offset the presentation would show, and it is 0 exactly when the verdict
 * says "unresolvable-at-grid". Note the verdict does **not** depend on this
 * number: a step inside the window also paints the `feedback.deny` tint on the
 * player ring at `deny.ringAlpha`, which is what makes the onset detectable even
 * where the nudge offset is sub-pixel.
 */
export function denyNudgeOffsetPx(
  gapMs: number,
  arcMs: number,
  nudgeCss: number,
  renderScale: number,
): number {
  const p = Math.min(1, Math.max(0, gapMs / arcMs));
  return Math.sin(Math.PI * p) * nudgeCss * renderScale;
}