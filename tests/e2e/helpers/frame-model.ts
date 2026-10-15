/**
 * The **frame model** — what a runner's own animation-frame grid can and cannot
 * present, expressed as pure arithmetic (QA-005d), plus the post-hoc **arc
 * implication** the grid's own stamps license (QA-005e).
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
 *
 * ── QA-005e: this classifies ONE interval; it is not a prediction ────────────
 * The gap it consumes is the interval the recording actually produced, so the
 * verdict is exact *for that gap*. It is **not** a licence to predict the
 * observation from a runner's *mean* grid: a mean of 91.6 ms with one 83.4 ms
 * interval gives a `resolvable` verdict, and the same mean with one 100 ms
 * interval gives `unresolvable-at-grid` (measured, run `38784574025`). The
 * natural e2e arm therefore branches on {@link arcImplication}, computed post hoc
 * from the recording's own stamps; `arcVerdict` stays as the **fabrication
 * arbiter** for grids whose every interval is longer than the arc by construction.
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

/* ─────────────── QA-005e: the arc window, post hoc, from the stamps ─────────── */

/**
 * What a recording's **own** frame stamps say about the §6.5 arc's window.
 *
 * ── Why this replaces a pre-judged prediction ────────────────────────────────
 * QA-005d's natural arm *pre-measured* the runner's grid, picked a branch from the
 * mean interval, and then required that branch's predicted observation. On a
 * runner whose intervals jitter around the arc's own 90 ms length that is a coin:
 * the pre-measurement and the observation are two draws from the same noisy
 * distribution, and they can contradict each other (measured: run `38784574025`,
 * attempt 1 `gap 100.0 ms` / `onset 643.4`, retry #1 `gap 83.4 ms` / `onset null`).
 *
 * The question "could the arc have been presented at all?" is only decidable
 * **after** the recording, from the stamps that recording actually produced. The
 * window is `(startAt, startAt + arcMs)`:
 *
 * - `startAt` is `Tₙ`, the last step before the keydown — the value
 *   `LevelScene.tryMove` passed to `denyFeedback(dir, this.time.now)`;
 * - `Tₙ` itself **cannot** paint the arc: that step was already rendered when the
 *   deny was recorded (that is exactly why `scene.time.now` *is* `Tₙ`);
 * - `BoardView.update` clears the deny at `time >= startAt + arcMs`, so the end is
 *   exclusive.
 *
 * So `frameInWindow` is exactly `Tₙ₊₁ < Tₙ + arcMs` (the stamps are monotonic), and
 * it is a statement about *this* recording, not about a calibration window.
 */
export interface ArcWindow {
  /** `Tₙ` — the step `scene.time.now` held during the keydown. */
  readonly startAt: number;
  /** `startAt + arcMs`, **exclusive** — the step at which `update` clears the deny. */
  readonly endAt: number;
  /** The two frames bracketing the trigger, and the interval that spans it. */
  readonly bracket: FrameBracket;
  /** The bracketing interval, in ms — `bracket.gapMs`, narrowed to a number. */
  readonly gapMs: number;
  /** Recorded stamps strictly inside `(startAt, startAt + arcMs)`. */
  readonly inside: readonly number[];
  /** `true` iff a presented frame provably fell inside the paint window. */
  readonly frameInWindow: boolean;
}

/**
 * Read the arc's window from one recording: the frame stamps around `triggerT`.
 *
 * `null` when the trigger could not be bracketed (it fell outside the recorded
 * stamps) — "not measured" is not "no frame inside", and a caller that ignored the
 * `null` could justify an absent beat on a recording that never covered it.
 */
export function arcWindow(
  frames: readonly number[],
  triggerT: number,
  arcMs: number,
): ArcWindow | null {
  const bracket = bracketFrames(frames, triggerT);
  if (bracket.before === null || bracket.gapMs === null) return null;
  const startAt = bracket.before;
  const endAt = startAt + arcMs;
  const inside = frames.filter((frame) => frame > startAt && frame < endAt);
  return { startAt, endAt, bracket, gapMs: bracket.gapMs, inside, frameInWindow: inside.length > 0 };
}

/**
 * The **physical implication** of one recording, given whether a beat was seen.
 *
 * The four classes are exhaustive and each has exactly one handling
 * ({@link arcHandling}), so the branch an e2e arm takes is a function of the two
 * facts a recording can actually produce — never of a pre-measurement that the
 * observation may contradict.
 */
export type ArcImplication =
  /** A frame was inside the window *and* the beat was observed — the pixel claim. */
  | "beat-required-observed"
  /**
   * A presented frame fell inside the window and no beat appeared. `BoardView`
   * would have painted the deny at that step, so this is not a limit: it is a
   * **real failure** (a game that dropped the trigger, or a channel that missed
   * it), and it must fail loudly.
   */
  | "beat-required-absent"
  /** No frame could fall inside the window, and none did — the limit is real. */
  | "limit-justified-absent"
  /**
   * No frame could fall inside the window, yet a beat was observed. The
   * observation is not attributable to the arc (a late repaint, a layout change, a
   * capture artefact), but it is still a transient in the player's cell and owes
   * the shape clauses like any other.
   */
  | "beat-observed-beyond-window";

/** What an e2e arm must do with a recording — the post-hoc decision. */
export type ArcHandling =
  /** Assert the full pixel shape (bounded, centred, settles, under the budget). */
  | "assert-shape"
  /** Name the limit (`RESOLVE-LIMIT`) and assert everything the refusal still owes. */
  | "resolve-limit"
  /** The beat was owed and absent: fail loudly, with the stamps. */
  | "fail-loudly";

/**
 * Classify one recording. `beatObserved` is `onset !== null` from
 * {@link import("./capture").TransientReport}.
 */
export function arcImplication(window: ArcWindow, beatObserved: boolean): ArcImplication {
  if (window.frameInWindow) {
    return beatObserved ? "beat-required-observed" : "beat-required-absent";
  }
  return beatObserved ? "beat-observed-beyond-window" : "limit-justified-absent";
}

/** The single, total observation → handling map (unit-proved, never branched on ad hoc). */
export function arcHandling(implication: ArcImplication): ArcHandling {
  switch (implication) {
    case "beat-required-observed":
    case "beat-observed-beyond-window":
      return "assert-shape";
    case "limit-justified-absent":
      return "resolve-limit";
    case "beat-required-absent":
      return "fail-loudly";
  }
}

/* ─────────────────── the interval census, for self-documenting reds ─────────── */

/**
 * The default band edges, in ms. `90` is an edge because it is the §6.5 arc's own
 * length: the number of intervals **below** it is what lets a reader check, from a
 * failing log alone, whether a fast frame was available near the trigger. A
 * runner's frames jitter around a boundary, so the useful evidence is the
 * distribution, not the mean.
 */
export const INTERVAL_EDGES_MS = [0, 30, 60, 90, 120, 180, 300] as const;

export interface IntervalBand {
  /** Inclusive lower edge, in ms. */
  readonly from: number;
  /** Exclusive upper edge, or `null` for the open-ended last band. */
  readonly to: number | null;
  readonly count: number;
}

/** How many consecutive frame intervals fell in each band — the `gridMs` mean says nothing about this. */
export function intervalHistogram(
  frames: readonly number[],
  edges: readonly number[] = INTERVAL_EDGES_MS,
): readonly IntervalBand[] {
  const bands: IntervalBand[] = edges.map((from, index) => ({
    from,
    to: edges[index + 1] ?? null,
    count: 0,
  }));
  const counts = bands.map((band) => band.count);
  for (let index = 1; index < frames.length; index += 1) {
    const gap = (frames[index] ?? 0) - (frames[index - 1] ?? 0);
    for (const [position, band] of bands.entries()) {
      if (gap >= band.from && (band.to === null || gap < band.to)) {
        counts[position] = (counts[position] ?? 0) + 1;
        break;
      }
    }
  }
  return bands.map((band, position) => ({ ...band, count: counts[position] ?? 0 }));
}

/** The interval census as one greppable line, e.g. `0-30:0 30-60:1 60-90:18 90-120:3 …`. */
export function describeIntervalHistogram(
  frames: readonly number[],
  edges: readonly number[] = INTERVAL_EDGES_MS,
): string {
  return intervalHistogram(frames, edges)
    .map((band) => `${String(band.from)}-${band.to === null ? "inf" : String(band.to)}:${String(band.count)}`)
    .join(" ");
}

/** How many recorded frame intervals were shorter than `ms` — the raw count behind a bracket. */
export function intervalsBelow(frames: readonly number[], ms: number): number {
  let count = 0;
  for (let index = 1; index < frames.length; index += 1) {
    if ((frames[index] ?? 0) - (frames[index - 1] ?? 0) < ms) count += 1;
  }
  return count;
}