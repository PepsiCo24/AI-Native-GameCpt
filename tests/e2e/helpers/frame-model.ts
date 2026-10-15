/**
 * The **frame model** — what a runner's own animation-frame grid can and cannot
 * present, expressed as pure arithmetic (QA-005d), plus the post-hoc **arc
 * implication** the grid's own stamps license (QA-005e) and the **execution-order
 * attribution** that fixes which step an input actually saw (QA-005f).
 *
 * ── Why this file exists ─────────────────────────────────────────────────────
 * Two cloud-only failures turned out to be *measurement* questions about the
 * runner's frame grid, not rule questions about the game:
 *
 * 1. the §6.5 refusal arc (90 ms) came back with `onset: null` on CI and with an
 *    onset locally — a question about *which steps the machine runs*;
 * 2. the R-T4 swipe (≥ 24 px **within 500 ms of game time**) did not commit on CI
 *    — a question about *how many steps a synthetic gesture's CDP burst spans*.
 *
 * Both are answered by the same small model: Phaser steps the scene **once per
 * animation frame** and stamps that step with the frame's `requestAnimationFrame`
 * timestamp (`Clock.update` ← `Systems.step` ← `TimeStep.step(time)`), while every
 * DOM input event is handled **between** steps, where `scene.time.now` still
 * holds the *previous* step's stamp. So:
 *
 * - a transient of `D` ms is painted iff at least one step runs with a stamp
 *   strictly inside `(stamp_at_event, stamp_at_event + D)`;
 * - a gesture's game-clock duration is `frames_spanned × grid`, quantised to the
 *   grid — never the wall-clock span of the driver's CDP round trips.
 *
 * ── QA-005f: which step an event saw is an *execution* fact ──────────────────
 * The steps an instant falls between are **not** the frames whose stamps bracket
 * that instant. An `requestAnimationFrame` stamp is the frame's *scheduled* time;
 * on a loaded runner (the 2-core software-GL CI box) the callback batch carrying a
 * step can run tens of milliseconds after its own stamp, so a stamp may be `<= t`
 * while that step has **not run yet** — and every step whose stamp is `<= t` has,
 * by definition, already set `scene.time.now`. Comparing an event's wall time
 * against stamps therefore picks the wrong trigger frame and derives the window
 * from the *following* interval: the false `BEAT-REQUIRED-ABSENT` of QA-005f (cloud
 * `gridMs 85.4`, value-bracket `gap 83.3 ms`, `onset null`, while the interval the
 * keydown actually fell inside was a 90–120 ms one).
 *
 * The attribution that *is* exact is the observer's execution order: at any DOM
 * event, `scene.time.now` equals the stamp of the last frame pushed to
 * `__psProbe.frames` (`helpers/probe.ts` records that index on every event, and
 * `ranAt` — the wall clock when the frame's callback ran — proves it:
 * `ranAt[k] <= t < ranAt[k+1]`, {@link attributionHolds}). The model is therefore
 * stated in **indices**: the trigger is frame `k`, its window is
 * `(frames[k], frames[k] + D)`, and the step that can paint is `k+1`.
 *
 * The functions here are deliberately free of Playwright, Phaser and `src/**`
 * imports: they are the part of the protocol that a `node`-environment vitest file
 * can drive with synthetic grids (`tests/unit/frame-model.test.ts`), which is how
 * the "coarse runner" branch is proved **on any machine**, including a 60 Hz one.
 *
 * The measurements they consume come from `helpers/probe.ts`, whose in-page
 * observer records the runner's real `requestAnimationFrame` stamps, the wall time
 * each one's callback actually ran, and every DOM input event with the index of
 * the last frame that had run when it was handled.
 */

/**
 * The two frames whose *stamps* bracket an instant, and the gap between them.
 *
 * Deliberately **not** what the model consumes any more (QA-005f): a stamp is a
 * frame's scheduled time, and the step it drives may run later than the instant.
 * See {@link bracketFrames}.
 */
export interface FrameBracket {
  /** The last frame stamp `<= t` — *nominally* the step `scene.time.now` held. */
  readonly before: number | null;
  /** The first frame stamp `> t` — *nominally* the next step the game will run. */
  readonly after: number | null;
  /**
   * `after - before`: the interval that nominally spans `t`. `null` when either
   * side is missing (the instant fell outside the recorded stamps).
   */
  readonly gapMs: number | null;
}

/**
 * The frame *stamps* bracketing `t` — the nominal view, and the QA-005f defect.
 *
 * This is the arithmetic QA-005d/005e used, and it is only correct while every
 * frame's callback runs before the next instant that lands on its stamp. A loaded
 * runner breaks exactly that: a callback batch can run tens of milliseconds after
 * its own stamp, so `before` may name a step that has **not run yet** while the
 * event is handled against an earlier one. Then `after - before` is the *following*
 * interval, not the interval the event fell in — which is how the cloud produced
 * `stampsInsideWindow=1` for a keydown whose real bracketing interval could not
 * paint anything.
 *
 * It is kept, and unit-pinned as the *wrong* answer, for one reason: the regression
 * case (`tests/unit/frame-model.test.ts`) has to show what the mis-attribution
 * produced, so a future change that reintroduces stamp arithmetic has a failing
 * case to hit. {@link arcWindow} and {@link framesSpanned} never call it.
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
 * Whether one recorded event's frame index really is the step the game clock held.
 *
 * `frameIndex` is the observer's `__psProbe.frames.length - 1` at the instant the
 * listener ran; `ranAt[k]` is the wall clock at which frame `k`'s callbacks
 * actually ran. The attribution channel is trustworthy for this event iff the
 * frame it names had already run and the next one had not:
 * `ranAt[k] <= t < ranAt[k+1]`.
 *
 * This is the **self-check** on the QA-005f channel: the e2e arms assert it before
 * they classify, so a runner on which execution order and the observer's log
 * disagree produces a named "the attribution channel is not trustworthy" failure
 * instead of a quiet mis-read window. `k` at the end of the log is consistent (the
 * next frame is unknown, not absent) — callers that need to prove a window still
 * ask {@link arcWindow} for one frame more.
 */
export function attributionHolds(
  ranAt: readonly number[],
  t: number,
  frameIndex: number,
): boolean {
  if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= ranAt.length) return false;
  const ran = ranAt[frameIndex];
  if (ran === undefined) return false;
  const next = ranAt[frameIndex + 1];
  return ran <= t && (next === undefined || t < next);
}

/**
 * How many frames the interval between two **recorded events** spans — the
 * **quantised** game-clock duration of anything that starts at the first and ends
 * at the second (QA-005f: frame indices, not stamps).
 *
 * The count is `endIndex - startIndex` on the observer's execution-ordered log: the
 * game clock advances exactly when a frame's callback runs, so the number of steps
 * between the two handlers *is* the difference of the indices they recorded. Zero
 * means both events were handled against the same step: the game sees a zero-length
 * gesture even if the driver took 200 ms of wall clock to deliver it.
 *
 * (QA-005d measured this by comparing event times against frame stamps, which on a
 * lagging runner mis-counts — see {@link bracketFrames}.)
 */
export function framesSpanned(startIndex: number, endIndex: number): number {
  if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) return 0;
  if (startIndex < 0 || endIndex < 0) return 0;
  return Math.max(0, endIndex - startIndex);
}

/**
 * The game-clock duration of a gesture, in ms — `framesSpanned × grid`.
 *
 * `gridMs` is the runner's own median frame interval (measured, not assumed).
 * This is the number R-T4's `swipeMaxMs` is compared against, and the number the
 * suite must therefore predict *before* asserting the swipe committed.
 */
export function gestureGameMs(startIndex: number, endIndex: number, gridMs: number): number {
  return framesSpanned(startIndex, endIndex) * gridMs;
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
 * What a recording's **own frame log** says about the §6.5 arc's window.
 *
 * ── Why this replaces a pre-judged prediction ────────────────────────────────
 * QA-005d's natural arm *pre-measured* the runner's grid, picked a branch from the
 * mean interval, and then required that branch's predicted observation. On a
 * runner whose intervals jitter around the arc's own 90 ms length that is a coin:
 * the pre-measurement and the observation are two draws from the same noisy
 * distribution, and they can contradict each other (measured: run `38784574025`,
 * attempt 1 `gap 100.0 ms` / `onset 643.4`, retry #1 `gap 83.4 ms` / `onset null`).
 *
 * QA-005e removed the prediction and read the window **post hoc** from the stamps —
 * but still by comparing the event's wall time against stamps, which QA-005f
 * showed mis-picks the trigger frame on a loaded runner. Both halves are now one
 * rule:
 *
 * - `triggerIndex` is the frame the game clock actually held — the observer's
 *   `__psProbe.frames.length - 1` at the keydown, proved by `ranAt`
 *   ({@link attributionHolds}), never inferred from stamps;
 * - `startAt` is `frames[triggerIndex]` — the value `LevelScene.tryMove` passed to
 *   `denyFeedback(dir, this.time.now)`;
 * - that step **cannot** paint the arc: it was already rendered when the deny was
 *   recorded (that is exactly why `scene.time.now` *is* `stamps[triggerIndex]`);
 * - `BoardView.update` clears the deny at `time >= startAt + arcMs`, so the end is
 *   exclusive and the only candidate is the *next* step.
 *
 * So `frameInWindow` is exactly `frames[triggerIndex + 1] < startAt + arcMs`, and it
 * is a statement about *this* recording, not about a calibration window.
 */
export interface ArcWindow {
  /** `Tₙ` — the step `scene.time.now` held during the keydown. */
  readonly startAt: number;
  /** `startAt + arcMs`, **exclusive** — the step at which `update` clears the deny. */
  readonly endAt: number;
  /** The index of the trigger frame in the observer's execution-ordered log. */
  readonly triggerIndex: number;
  /** The stamp of the step that can paint the response (`frames[triggerIndex + 1]`). */
  readonly nextAt: number;
  /** The trigger frame, the next step, and the interval between them. */
  readonly bracket: FrameBracket;
  /** The bracketing interval, in ms — `bracket.gapMs`, narrowed to a number. */
  readonly gapMs: number;
  /** Recorded stamps strictly inside `(startAt, startAt + arcMs)`. */
  readonly inside: readonly number[];
  /** `true` iff a presented frame provably fell inside the paint window. */
  readonly frameInWindow: boolean;
}

/**
 * Read the arc's window from one recording: the frame log around `triggerIndex`.
 *
 * `null` when the window cannot be *proved* from the log — and there are exactly
 * two such cases, both "not measured" rather than "no frame inside":
 * `triggerIndex < 0` (no frame had run when the input was handled) and
 * `triggerIndex >= frames.length - 1` (the log ends at the trigger, so the next
 * step — the only one that could paint — was never recorded). A caller that read
 * either as "no frame inside" could justify an absent beat on a recording that
 * never covered it.
 */
export function arcWindow(
  frames: readonly number[],
  triggerIndex: number,
  arcMs: number,
): ArcWindow | null {
  if (!Number.isInteger(triggerIndex) || triggerIndex < 0) return null;
  if (triggerIndex >= frames.length - 1) return null;
  const startAt = frames[triggerIndex];
  const nextAt = frames[triggerIndex + 1];
  if (startAt === undefined || nextAt === undefined) return null;
  const endAt = startAt + arcMs;
  const inside = frames.slice(triggerIndex + 1).filter((frame) => frame < endAt);
  return {
    startAt,
    endAt,
    triggerIndex,
    nextAt,
    bracket: { before: startAt, after: nextAt, gapMs: nextAt - startAt },
    gapMs: nextAt - startAt,
    inside,
    frameInWindow: inside.length > 0,
  };
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