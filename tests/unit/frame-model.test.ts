/**
 * Unit proof for the **frame model** (QA-005d) — the arithmetic two cloud-only
 * e2e survivors were branching on, driven with synthetic grids.
 *
 * ── Why a unit file, next to the e2e tests that use it ───────────────────────
 * `tests/e2e/helpers/frame-model.ts` is the part of the QA-005d protocol that is
 * pure: no Playwright, no Phaser, no `src/**` import. That makes the *classification*
 * testable on any machine, including a fast 60 Hz one where the interesting branch
 * (a grid too coarse to hold a 90 ms transient) never occurs naturally. The e2e
 * side then only has to prove the *inputs* are real (`helpers/probe.ts` measures
 * the runner's own `requestAnimationFrame` stamps and every delivered DOM event)
 * and that the branches hold end to end (`transient.spec.ts` P1/P1b).
 *
 * ── The two claims, and the source they come from ────────────────────────────
 * 1. **The refusal arc is painted iff a frame stamp falls strictly inside its
 *    window.** `LevelScene.tryMove` records the deny on the DOM keydown with
 *    `scene.time.now` (`denyFeedback(dir, this.time.now)`) — i.e. between two
 *    steps, where the clock still holds the previous step's stamp `Tₙ`. The next
 *    step runs with `Tₙ₊₁` and `BoardView.update` drops the deny at
 *    `time >= startAt + deny.dur`. So the arc exists iff `Tₙ₊₁ - Tₙ < deny.dur`
 *    — the boundary `arcVerdict` tests.
 * 2. **A gesture's game-clock duration is `frames_spanned × grid`.** The R-T4
 *    branch compares `scene.time.now - start.time` against `LAYOUT.swipeMaxMs`,
 *    and both ends of that subtraction are quantised to the frame grid — which is
 *    why a driver burst that costs one frame per CDP send degrades from a swipe to
 *    a tap on a slow runner, and why issuing the whole gesture in one tick is a
 *    fix rather than a shortcut.
 *
 * The measured spans in the table below are the ones `helpers/probe.ts` recorded
 * locally (`tests/e2e/README.md` §1.5); this file pins that they arithmetic out to
 * the observed verdicts, so a change to the model cannot silently change the
 * branches the e2e tests take.
 *
 * ── QA-005e: the post-hoc implication, and why it is not a fourth claim ──────
 * Claim 1 above is exact *for the two frames it is handed*. QA-005d then read the
 * runner's **mean** interval before the trigger and used it to pick which
 * observation to require — and on run `38784574025` the mean and the observation
 * contradicted each other in both directions (attempt 1: `gap 100.0` → "no beat
 * can exist" → `onset 643.4`; retry #1: `gap 83.4` → "beat owed" → `null`). Both
 * draws came from the same jittering distribution.
 *
 * The e2e arm therefore asserts the **implication of the recording's own log**
 * ({@link arcWindow} → {@link arcImplication} → {@link arcHandling}), and the
 * synthetic jitter tables below prove every cell of that map — including the two
 * cloud observations of run `38784574025` as legal-but-differently-handled inputs.
 * The 60 Hz teeth survive: on a fine grid short intervals always exist, so an
 * absent beat is `beat-required-absent` → `fail-loudly`.
 *
 * ── QA-005f: "which frames were the two frames?" is an execution question ─────
 * QA-005e still found the trigger frame by comparing the event's wall time against
 * frame **stamps** (`bracketFrames`). A stamp is the frame's *scheduled* time, so on
 * a loaded runner that names a step which has **not run yet** — and the window is
 * then taken from the following interval. Measured on the cloud (PR #2, `gridMs
 * 85.4`): the arithmetic gave `window=(4767.7,4857.7) inside=1 gap=83.3` →
 * `beat-required-absent`, while the steps the keydown really fell between were
 * 90–120 ms apart and nothing could have painted. The model now takes the trigger
 * **index** from the observer's own execution order (`__psProbe.frames.length - 1`
 * at the event, i.e. `scene.time.now`) and proves it with `ranAt`
 * ({@link attributionHolds}). `bracketFrames` is kept, and pinned here as the
 * **wrong** answer, so the defect has a named regression case.
 */

import { describe, expect, it } from "vitest";

import {
  arcHandling,
  arcImplication,
  arcVerdict,
  arcWindow,
  attributionHolds,
  bracketFrames,
  denyNudgeOffsetPx,
  describeIntervalHistogram,
  framesSpanned,
  gestureGameMs,
  intervalHistogram,
  intervalsBelow,
  medianFrameGap,
} from "../e2e/helpers/frame-model";
import type { ArcImplication } from "../e2e/helpers/frame-model";
import { FLIP_TIMING, FLIP_VARIANT, LAYOUT } from "@/game/theme/tokens";

/** The shipped §6.5 deny row — the transient this whole model is about. */
const TIMINGS = FLIP_TIMING[FLIP_VARIANT];
const ARC_MS = TIMINGS.deny.dur;

/**
 * The fabricated per-frame budget of P1b (`P1_STRETCH_MS` in `transient.spec.ts`).
 *
 * Duplicated as a literal because a node-environment unit file cannot import a
 * Playwright spec; `it("names the 140 ms fabricated budget …")` pins that the two
 * cannot drift.
 */
const P1_STRETCH = 140;

/** A synthetic `requestAnimationFrame` log: stamps every `gridMs` for `spanMs`. */
function syntheticGrid(gridMs: number, spanMs: number): number[] {
  const frames: number[] = [];
  for (let t = 0; t <= spanMs; t += gridMs) frames.push(Math.round(t * 1000) / 1000);
  return frames;
}

/**
 * The frame **indices** a pair of synthetic events recorded on a lag-free grid —
 * used only to *build* inputs here, never to attribute a real event.
 *
 * On a runner whose callbacks are not delayed past their own stamps, an event at
 * wall time `t` was handled against the last stamp `<= t`, so `frameIndex` is that
 * stamp's index. (When a callback *does* lag, the two differ — and the observer's
 * recorded index is the one that is right; see the QA-005f regression case below.)
 */
function lagFreeIndexAt(frames: readonly number[], t: number): number {
  let index = -1;
  frames.forEach((frame, position) => {
    if (frame <= t) index = position;
  });
  return index;
}

describe("the refusal arc's resolution limit", () => {
  it("is exactly the shipped §6.5 deny row", () => {
    expect(ARC_MS, "the deny row is 90 ms — the model is calibrated to the timing table").toBe(90);
    expect(TIMINGS.deny.nudge, "the nudge is 4 CSS px").toBe(4);
    expect(LAYOUT.swipeMaxMs, "R-T4's window is 500 ms of game time").toBe(500);
  });

  it("classifies a gap as resolvable iff a stamp can fall strictly inside the window", () => {
    expect(arcVerdict(0, ARC_MS), "two events in one frame window").toBe("resolvable");
    expect(arcVerdict(16.7, ARC_MS), "a 60 Hz runner").toBe("resolvable");
    expect(arcVerdict(ARC_MS / 2, ARC_MS), "the arc's half-way point").toBe("resolvable");
    expect(arcVerdict(ARC_MS - 1e-9, ARC_MS), "just inside").toBe("resolvable");
    // The boundary is closed on the *unresolvable* side: `update` clears the deny
    // at `time >= startAt + dur`, so a gap of exactly `dur` paints nothing.
    expect(arcVerdict(ARC_MS, ARC_MS), "exactly the arc's length").toBe("unresolvable-at-grid");
    expect(arcVerdict(ARC_MS + 1e-9, ARC_MS), "just outside").toBe("unresolvable-at-grid");
    expect(arcVerdict(150, ARC_MS), "the fabricated coarse grid of P1b").toBe("unresolvable-at-grid");
  });

  it("has exactly one boundary across a sweep — the classification is not vacuous", () => {
    let flips = 0;
    let previous = arcVerdict(-0.5, ARC_MS);
    for (let gap = 0; gap <= 400; gap += 0.5) {
      const verdict = arcVerdict(gap, ARC_MS);
      if (verdict !== previous) flips += 1;
      previous = verdict;
    }
    expect(flips, "one flip, at `dur` — every other value is stable").toBe(1);
  });

  it("agrees with the deny nudge's own geometry: outside the window the offset is 0", () => {
    const nudgeCss = TIMINGS.deny.nudge;
    for (const scale of [1, 2]) {
      expect(denyNudgeOffsetPx(0, ARC_MS, nudgeCss, scale), "sin(0)").toBe(0);
      // `sin(π)` is 1.2e-16 in floating point, i.e. sub-pixel by ~15 orders of
      // magnitude — and at this gap `BoardView.update` has already cleared the deny,
      // so nothing is painted at all.
      expect(denyNudgeOffsetPx(ARC_MS, ARC_MS, nudgeCss, scale), "sin(π)").toBeLessThan(1e-9);
      expect(
        denyNudgeOffsetPx(ARC_MS / 2, ARC_MS, nudgeCss, scale),
        "the peak is `nudge × scale` at half the row",
      ).toBeCloseTo(nudgeCss * scale, 6);
    }

    // Every grid the verdict calls unresolvable paints a zero offset; every grid it
    // calls resolvable drives a non-zero one. (The *detection* does not rest on the
    // offset: for any `p < 1` the actor ring is tinted at the full `deny.ringAlpha`,
    // which is what makes an onset detectable even where the offset is sub-pixel —
    // a painter fact, asserted end to end by P1's `peakPrevChanged`.)
    for (let gap = 0; gap <= 400; gap += 1.3) {
      const offset = denyNudgeOffsetPx(gap, ARC_MS, nudgeCss, 2);
      const verdict = arcVerdict(gap, ARC_MS);
      if (verdict === "unresolvable-at-grid") {
        expect(offset, `gap ${gap.toFixed(1)} ms must paint no nudge`).toBeLessThan(1e-9);
      } else if (gap > 0 && gap < ARC_MS) {
        expect(offset, `gap ${gap.toFixed(1)} ms must paint a nudge`).toBeGreaterThan(0);
      }
    }
  });
});

describe("the R-T4 swipe's game-clock duration", () => {
  /**
   * The spans `helpers/probe.ts` measured on this suite (README §1.5):
   * `oldSpan` = the pre-QA-005d one-send-per-frame burst, `newSpan` = the shipped
   * one-tick burst. The grids are the natural 60 Hz grid and two fabricated ones.
   */
  const MEASURED = [
    { grid: 16.7, oldSpan: 13, newSpan: 0 },
    { grid: 66.7, oldSpan: 15, newSpan: 0 },
    { grid: 133.3, oldSpan: 15, newSpan: 0 },
  ] as const;

  it("is `frames_spanned × grid`, never the driver's wall-clock span", () => {
    const frames = syntheticGrid(16.7, 1_000);
    const t0 = (frames[10] ?? 0) + 1;
    // Two events delivered inside one frame window: the game sees a zero-length
    // gesture even though the driver's round trips took real wall-clock time — both
    // handlers recorded the *same* frame index.
    const same = lagFreeIndexAt(frames, t0);
    const sameEnd = lagFreeIndexAt(frames, t0 + 0.2);
    expect(same).toBe(sameEnd);
    expect(framesSpanned(same, sameEnd)).toBe(0);
    expect(gestureGameMs(same, sameEnd, 16.7)).toBe(0);
    // One frame later the same gesture is one grid long.
    const later = lagFreeIndexAt(frames, t0 + 17);
    expect(later - same).toBe(1);
    expect(framesSpanned(same, later)).toBe(1);
    expect(gestureGameMs(same, later, 16.7)).toBeCloseTo(16.7, 6);
    // The claim is about *steps the scene ran*, so wall clock never enters it: two
    // events 200 ms apart that the observer saw against one step are still zero.
    expect(framesSpanned(same, same)).toBe(0);
  });

  it("arithmetics the pre-QA-005d burst into the reproduced cloud verdict", () => {
    for (const row of MEASURED) {
      const frames = syntheticGrid(row.grid, 5_000);
      const start = lagFreeIndexAt(frames, (frames[20] ?? 0) + 1);
      const end = lagFreeIndexAt(frames, (frames[20 + row.oldSpan] ?? 0) + 1);
      const oldMs = gestureGameMs(start, end, row.grid);

      expect(end - start, `the observer counted ${String(row.oldSpan)} frames`).toBe(row.oldSpan);
      expect(oldMs, `grid ${row.grid} ms × ${row.oldSpan} frames`).toBeCloseTo(row.oldSpan * row.grid, 6);
      // The cloud-only shape, as arithmetic: at 60 Hz the pacing fits R-T4's window
      // (so no local run could fail); on a coarse grid it does not, the gesture
      // degrades to the tap branch, and the counter stays at 0.
      expect(
        oldMs <= LAYOUT.swipeMaxMs,
        `grid ${row.grid}: the old burst ${oldMs <= LAYOUT.swipeMaxMs ? "fits" : "exceeds"} R-T4's window`,
      ).toBe(row.grid < LAYOUT.swipeMaxMs / row.oldSpan);
    }
  });

  it("arithmetics the shipped one-tick burst to 0 frames at every grid", () => {
    for (const row of MEASURED) {
      const frames = syntheticGrid(row.grid, 5_000);
      const t0 = (frames[20] ?? 0) + 1;
      const t1 = t0 + 0.2; // all three CDP sends land inside one frame window
      const start = lagFreeIndexAt(frames, t0);
      const end = lagFreeIndexAt(frames, t1);
      expect(framesSpanned(start, end)).toBe(row.newSpan);
      expect(gestureGameMs(start, end, row.grid)).toBe(0);
      expect(gestureGameMs(start, end, row.grid)).toBeLessThanOrEqual(LAYOUT.swipeMaxMs);
    }
  });
});

/**
 * The QA-005f regression case: the **nominal** bracket is kept *because it is
 * wrong*, and these cases make that explicit.
 *
 * `bracketFrames` is the arithmetic QA-005d/QA-005e used, and it is only right for a
 * runner whose callbacks are not delayed past their own stamps. The synthetic logs
 * below carry the measured shape of the coarse cloud runner — a frame whose stamp is
 * `<= t` while its callback ran *after* `t` — and they assert both the nominal
 * mis-pick and the index-based answer the model now uses.
 */
describe("the nominal frame bracket (the view QA-005f replaced)", () => {
  it("names, for a lag-free log, the step the game clock held, and the step that paints it", () => {
    const frames = [0, 16.7, 33.4, 50.1];
    const bracket = bracketFrames(frames, 20);
    expect(bracket.before, "`scene.time.now` during an input handled at 20 ms").toBe(16.7);
    expect(bracket.after, "the step that will paint the response").toBe(33.4);
    expect(bracket.gapMs).toBeCloseTo(16.7, 6);
  });

  it("reports `null` outside the recorded window — 'not measured' is not 'zero'", () => {
    expect(bracketFrames([10, 20], 5).gapMs, "before the first stamp").toBeNull();
    expect(bracketFrames([10, 20], 25).gapMs, "after the last stamp").toBeNull();
    expect(bracketFrames([], 5).gapMs, "no stamps at all").toBeNull();
    // The index-based window says the same thing in its own terms: an input handled
    // before any frame ran, or whose next step was never recorded, cannot be
    // classified — the e2e walk asserts non-null before classifying.
    expect(arcWindow([10, 20], -1, ARC_MS), "no frame had run").toBeNull();
    expect(arcWindow([10, 20], 1, ARC_MS), "the log ends at the trigger").toBeNull();
    expect(arcWindow([], 0, ARC_MS), "no frames at all").toBeNull();
  });

  it("mis-picks the trigger step when a callback lags its own stamp — the defect, both directions", () => {
    // (a) The cloud shape of QA-005f: the interval *before* the trigger is a full
    // 90–120 ms band, the one *after* it is a fast 83 ms one. The keydown's wall time
    // lands on the next frame's stamp while that frame's callback had not run, so the
    // stamp arithmetic reads the fast interval and demands a beat the machine could
    // not paint.
    const late = [1000, 1100, 1183.3, 1266.6, 1349.9]; // intervals 100, 83.3, …
    const lateRanAt = [1100, 1205, 1290, 1375, 1460]; // frame 1's callbacks ran at 1205
    const lateKeydown = 1105; // after frames[1] = 1100, before its callback ran
    const lateIndex = 0; // …so the game clock held frames[0] = 1000

    expect(attributionHolds(lateRanAt, lateKeydown, lateIndex), "frame 1 had not run").toBe(true);
    expect(bracketFrames(late, lateKeydown).before, "the stamp arithmetic names frame 1").toBe(1100);
    expect(late[lateIndex], "the game clock held frame 0").toBe(1000);

    const nominal = arcWindow(late, 1, ARC_MS);
    const truthful = arcWindow(late, lateIndex, ARC_MS);
    if (nominal === null || truthful === null) throw new Error("both windows were decidable");
    expect(nominal.gapMs, "the following interval — 83.3 ms, a fast frame").toBeCloseTo(83.3, 1);
    expect(nominal.frameInWindow, "…so the nominal view demands a beat").toBe(true);
    expect(
      arcImplication(nominal, false),
      "the false BEAT-REQUIRED-ABSENT that went red on PR #2",
    ).toBe("beat-required-absent");
    expect(truthful.gapMs, "the true bracketing interval — 100 ms, a full frame").toBeCloseTo(100, 1);
    expect(truthful.frameInWindow, "…so no step could paint").toBe(false);
    expect(arcImplication(truthful, false), "the correct handling is the named limit").toBe(
      "limit-justified-absent",
    );

    // (b) The mirror: a fast interval *before* the trigger and a stalled one after.
    // Here the stamp arithmetic excuses an absence that was in fact owed — the same
    // oscillation as run 38784574025, produced by the same mis-pick.
    const fast = [1000, 1083.3, 1183.3, 1266.6, 1349.9]; // intervals 83.3, 100, …
    const fastRanAt = [1080, 1150, 1290, 1375, 1460]; // frame 1's callbacks ran at 1150
    const fastKeydown = 1090; // after fast[1] = 1083.3, before its callback ran
    const fastIndex = 0;

    expect(attributionHolds(fastRanAt, fastKeydown, fastIndex)).toBe(true);
    expect(bracketFrames(fast, fastKeydown).before, "the stamp arithmetic names frame 1").toBe(1083.3);
    const fastNominal = arcWindow(fast, 1, ARC_MS);
    const fastTruthful = arcWindow(fast, fastIndex, ARC_MS);
    if (fastNominal === null || fastTruthful === null) throw new Error("both windows were decidable");
    expect(fastNominal.frameInWindow, "the nominal view excuses the absence").toBe(false);
    expect(arcImplication(fastNominal, false)).toBe("limit-justified-absent");
    expect(fastTruthful.gapMs, "the true interval is a fast 83.3 ms").toBeCloseTo(83.3, 1);
    expect(fastTruthful.frameInWindow, "so the beat was owed").toBe(true);
    expect(arcImplication(fastTruthful, false)).toBe("beat-required-absent");
  });

  it("handles the measured sharp trace of QA-005f as a named legal input", () => {
    // The trace this office measured locally at a fabricated 74 ms grid, with the
    // cloud's own defect in it: the keydown is handled at wall 6585.3 ms against
    // `scene.time.now = 6486.7` (the observer's *last pushed* frame), while the next
    // nominal stamp, 6570.1, only ran its callbacks at wall 6660.4 — 75 ms after the
    // keydown. (The trigger frame's own run time was not recorded in that trace; any
    // value `<= 6585.3` proves the same point, and a 90 ms-old frame is the
    // conservative order the coarsest grids produce.)
    const frames = [6486.7, 6570.1, 6653.4, 6736.7];
    const ranAt = [6570.4, 6660.4, 6750.4, 6840.4];
    const keydownWall = 6585.3;
    const triggerIndex = 0;

    expect(attributionHolds(ranAt, keydownWall, triggerIndex)).toBe(true);
    expect(attributionHolds(ranAt, keydownWall, 1), "frame 1 had not run yet").toBe(false);
    expect(bracketFrames(frames, keydownWall).before, "the stamp arithmetic picks 6570.1").toBe(6570.1);
    expect(frames[triggerIndex], "the game clock was at 6486.7").toBe(6486.7);

    const truthful = arcWindow(frames, triggerIndex, ARC_MS);
    if (truthful === null) throw new Error("the window was decidable");
    expect(truthful.inside, "the next step (6570.1) is inside the 90 ms window").toEqual([6570.1]);
    expect(truthful.frameInWindow, "so the arc WAS paintable on this trace").toBe(true);
    expect(arcImplication(truthful, true), "the recorder did see the beat — shape owed").toBe(
      "beat-required-observed",
    );
  });
});

describe("the median frame gap", () => {
  it("is the runner's own grid, and 0 when there is nothing to measure", () => {
    expect(medianFrameGap([])).toBe(0);
    expect(medianFrameGap([5]), "one stamp is no interval").toBe(0);
    expect(medianFrameGap([0, 16.7, 33.4, 50.1])).toBeCloseTo(16.7, 6);
    expect(medianFrameGap([0, 150, 300, 450]), "a fabricated coarse grid").toBe(150);
    // An outlier does not move the median: one stalled frame is not the grid.
    expect(medianFrameGap([0, 16, 32, 500, 516, 532])).toBeCloseTo(16, 6);
  });
});

/* ───────────── QA-005e: the window, the implication, the census ─────────────── */

/** A synthetic rAF log from an explicit interval list — jitter stated directly. */
function framesFromIntervals(intervals: readonly number[]): number[] {
  const frames = [0];
  let t = 0;
  for (const interval of intervals) {
    t += interval;
    frames.push(Math.round(t * 1000) / 1000);
  }
  return frames;
}

/** `count` intervals at `baseMs`, with interval `index` jittered to `jitterMs`. */
function jittered(baseMs: number, count: number, index: number, jitterMs: number): number[] {
  const intervals = Array.from({ length: count }, () => baseMs);
  intervals[index] = jitterMs;
  return intervals;
}

/**
 * The arc's window, in every case above, is `arcWindow(frames, triggerIndex, 90)`:
 * the trigger is a *recorded index* (the step the game clock held), never the
 * midpoint of an interval — the QA-005f correction this file's header describes.
 */

describe("the arc window, read post hoc from the observer's own frame log", () => {
  it("excludes the trigger step itself — it was rendered before the deny existed", () => {
    // The trigger step's update ran *before* the keydown, which is exactly why
    // `scene.time.now` is its stamp. It cannot paint the response.
    const frames = [0, 45, 90];
    const window = arcWindow(frames, 0, ARC_MS);
    expect(window).not.toBeNull();
    if (window === null) return;
    expect(window.triggerIndex, "the step the game clock held during the keydown").toBe(0);
    expect(window.startAt, "`scene.time.now` during the keydown").toBe(0);
    expect(window.nextAt, "the only step that can paint").toBe(45);
    expect(window.endAt, "`startAt + deny.dur`").toBe(90);
    expect(window.inside, "only the frame strictly inside the open interval").toEqual([45]);
    expect(window.inside, "the frame at `startAt` is not inside the paint window").not.toContain(0);
    expect(window.gapMs, "the interval between the trigger step and the next").toBe(45);
  });

  it("keeps the boundary closed: a step at exactly `startAt + arcMs` paints nothing", () => {
    // `BoardView.update` clears at `time >= startAt + dur`, so 90.0 is out.
    const window = arcWindow([0, ARC_MS], 0, ARC_MS);
    if (window === null) throw new Error("the window was decidable");
    expect(window.inside).toEqual([]);
    expect(window.frameInWindow, "90 ms is not inside a 90 ms window").toBe(false);
    // One microsecond short of the boundary is inside.
    const justInside = arcWindow([0, ARC_MS - 1e-3], 0, ARC_MS);
    if (justInside === null) throw new Error("the window was decidable");
    expect(justInside.frameInWindow).toBe(true);
  });

  it("is null when the next step was never recorded — not measured is not 'no frame inside'", () => {
    expect(arcWindow([10, 20], -1, ARC_MS), "no frame had run when the input was handled").toBeNull();
    expect(arcWindow([10, 20], 1, ARC_MS), "the log ends at the trigger step").toBeNull();
    expect(arcWindow([10, 20], 7, ARC_MS), "an index past the log").toBeNull();
    expect(arcWindow([], 0, ARC_MS), "no frames at all").toBeNull();
    // A caller that ignored the `null` could justify an absent beat on a recording
    // whose next step was never covered; the e2e walk asserts non-null first.
  });

  it("is equivalent to the interval model wherever both are defined, at every gap", () => {
    // `frameInWindow` ⟺ `gap < arcMs`: the stamps are monotonic, so the *next* step
    // is the only candidate. The equivalence is the licence for the verdict to keep
    // being used as the fabrication arbiter (unit-proved here, not assumed).
    for (let gap = 0; gap <= 200; gap += 0.5) {
      const frames = framesFromIntervals([gap, 40, 40]);
      const window = arcWindow(frames, 0, ARC_MS);
      if (window === null) throw new Error(`the trigger at gap ${gap.toFixed(1)} was not decidable`);
      expect(window.gapMs, `gap ${gap.toFixed(1)} ms is the interval this log recorded`).toBeCloseTo(gap, 3);
      expect(
        window.frameInWindow,
        `gap ${gap.toFixed(1)} ms: the window and the verdict must agree`,
      ).toBe(arcVerdict(window.gapMs, ARC_MS) === "resolvable");
    }
  });
});

describe("the four-class implication table", () => {
  const CASES: readonly {
    readonly frames: readonly number[];
    readonly triggerIndex: number;
    readonly observed: boolean;
    readonly implication: ArcImplication;
    readonly handling: string;
  }[] = [
    // A step is in the window → the beat is owed, observed or not.
    {
      frames: framesFromIntervals([40, 40]),
      triggerIndex: 0,
      observed: true,
      implication: "beat-required-observed",
      handling: "assert-shape",
    },
    {
      frames: framesFromIntervals([40, 40]),
      triggerIndex: 0,
      observed: false,
      implication: "beat-required-absent",
      handling: "fail-loudly",
    },
    // No step is in the window → absence is a limit; a beat is still an observation.
    {
      frames: framesFromIntervals([100, 100]),
      triggerIndex: 0,
      observed: false,
      implication: "limit-justified-absent",
      handling: "resolve-limit",
    },
    {
      frames: framesFromIntervals([100, 100]),
      triggerIndex: 0,
      observed: true,
      implication: "beat-observed-beyond-window",
      handling: "assert-shape",
    },
  ];

  it("maps every combination of (step in window, beat observed) to exactly one handling", () => {
    const seen = new Set<string>();
    for (const row of CASES) {
      const window = arcWindow(row.frames, row.triggerIndex, ARC_MS);
      if (window === null) throw new Error("the window was decidable");
      const implication = arcImplication(window, row.observed);
      expect(implication, "the implication is a function of the two facts").toBe(row.implication);
      expect(arcHandling(implication), "and the handling is a function of the implication").toBe(
        row.handling,
      );
      seen.add(implication);
    }
    // Non-vacuity: all four classes are reachable, so the map is total and the
    // switch in the e2e arm can never fall through.
    expect([...seen].sort()).toEqual([
      "beat-observed-beyond-window",
      "beat-required-absent",
      "beat-required-observed",
      "limit-justified-absent",
    ]);
  });

  it("decides the handling from the log, never from the runner's mean grid", () => {
    // Same runner, same median, opposite implications — the mean is not a verdict.
    // The trigger is the *same interval index* in both logs (index 5 → frame 5).
    const shortFrames = framesFromIntervals(jittered(100, 11, 5, 45));
    const longFrames = framesFromIntervals(jittered(100, 11, 5, 200));
    const short = arcWindow(shortFrames, 5, ARC_MS);
    const long = arcWindow(longFrames, 5, ARC_MS);
    if (short === null || long === null) throw new Error("both windows were decidable");
    expect(medianFrameGap(shortFrames), "the same mean grid").toBe(100);
    expect(medianFrameGap(longFrames), "the same mean grid").toBe(100);
    expect(short.frameInWindow, "a short interval can carry the trigger").toBe(true);
    expect(long.frameInWindow, "a stalled one cannot").toBe(false);
    expect(arcImplication(short, false), "owed").toBe("beat-required-absent");
    expect(arcImplication(long, false), "justified").toBe("limit-justified-absent");
  });
});

describe("the cloud oscillation of run 38784574025 — both observations are legal inputs", () => {
  /**
   * The two draws the old pre-measurement arbiter produced on the *same* e2e
   * content, from the CI log (`/tmp/ci-dev-fb751de.log`):
   *
   * | draw | mean grid | bracketing gap | old verdict | old requirement | observed |
   * |---|---|---|---|---|---|
   * | attempt 1 | 91.6 ms | 100.0 ms | unresolvable-at-grid | `onset === null` | **643.4** |
   * | retry #1 | 91.9 ms | 83.4 ms | resolvable | `onset !== null` | **null** |
   *
   * The synthetic logs below reproduce both rows: a ~91.6 ms grid whose bracketing
   * interval is the measured one. They are unit **inputs**, not assertions about
   * the game — what this file proves is that the model handles each one, and that
   * the handling is a function of the log rather than of the mean.
   */
  const DRAWS = [
    {
      label: "attempt 1",
      gridMs: 91.6,
      gapMs: 100.0,
      observed: true,
      verdict: "unresolvable-at-grid",
      implication: "beat-observed-beyond-window",
      handling: "assert-shape",
    },
    {
      label: "retry #1",
      gridMs: 91.9,
      gapMs: 83.4,
      observed: false,
      verdict: "resolvable",
      implication: "beat-required-absent",
      handling: "fail-loudly",
    },
  ] as const;

  for (const draw of DRAWS) {
    it(`handles ${draw.label} (grid ${String(draw.gridMs)} ms, gap ${String(draw.gapMs)} ms, onset ${draw.observed ? "observed" : "null"}) post hoc`, () => {
      const frames = framesFromIntervals(jittered(draw.gridMs, 11, 5, draw.gapMs));
      const window = arcWindow(frames, 5, ARC_MS);
      if (window === null) throw new Error("the trigger was bracketed");

      expect(medianFrameGap(frames), "the runner's mean grid, as the log measured it").toBeCloseTo(
        draw.gridMs,
        1,
      );
      expect(window.gapMs, "the interval between the trigger step and the next, as the log recorded it").toBeCloseTo(draw.gapMs, 1);
      expect(arcVerdict(window.gapMs, ARC_MS), "the old mean-grid arbiter's reading").toBe(draw.verdict);
      expect(window.frameInWindow, "the window, from this recording's own log").toBe(
        draw.gapMs < ARC_MS,
      );
      const implication = arcImplication(window, draw.observed);
      expect(implication).toBe(draw.implication);
      expect(arcHandling(implication)).toBe(draw.handling);
    });
  }

  it("is the same machine in both draws — the verdict flipped, the stamps did not", () => {
    const [attempt, retry] = DRAWS;
    expect(
      Math.abs(attempt.gridMs - retry.gridMs),
      "the two draws differ by under a millisecond of mean grid",
    ).toBeLessThan(1);
    expect(attempt.verdict, "yet the mean-grid arbiter flipped").not.toBe(retry.verdict);
    // …and that is why the mean-grid verdict can no longer choose the assertion:
    // it is a function of a *noisy estimate*, not of the recording it judges.
    expect(attempt.implication).not.toBe(retry.implication);
  });
});

describe("synthetic jitter tables — what each observation licenses", () => {
  it("(i) a mean grid ≥ 90 ms with one short interval bundles the trigger ⇒ the beat is REQUIRED", () => {
    const frames = framesFromIntervals(jittered(100, 11, 5, 45));
    const window = arcWindow(frames, 5, ARC_MS);
    if (window === null) throw new Error("the trigger was bracketed");
    expect(medianFrameGap(frames), "the mean grid alone would read 'unresolvable'").toBe(100);
    expect(window.frameInWindow, "but this recording put a frame inside the window").toBe(true);
    expect(window.inside.length).toBeGreaterThan(0);
    // Both observations are legal inputs; the difference is what they license.
    expect(arcImplication(window, true), "observed").toBe("beat-required-observed");
    expect(arcHandling(arcImplication(window, true))).toBe("assert-shape");
    expect(arcImplication(window, false), "absent is a real failure here").toBe("beat-required-absent");
    expect(arcHandling(arcImplication(window, false))).toBe("fail-loudly");
  });

  it("(ii) a mean grid ≥ 90 ms with every stamp outside the window ⇒ an absent beat is JUSTIFIED", () => {
    const frames = framesFromIntervals(jittered(100, 11, 5, 100));
    const window = arcWindow(frames, 5, ARC_MS);
    if (window === null) throw new Error("the trigger was bracketed");
    expect(medianFrameGap(frames)).toBe(100);
    expect(window.inside, "the window contains no recorded stamp").toEqual([]);
    expect(window.frameInWindow).toBe(false);
    expect(window.gapMs).toBeGreaterThanOrEqual(ARC_MS);
    expect(arcImplication(window, false)).toBe("limit-justified-absent");
    expect(arcHandling(arcImplication(window, false))).toBe("resolve-limit");
  });

  it("(iii) a 60 Hz grid ⇒ an absent beat is a REAL failure (the local teeth are preserved)", () => {
    const frames = framesFromIntervals(Array.from({ length: 11 }, () => 16.7));
    const window = arcWindow(frames, 5, ARC_MS);
    if (window === null) throw new Error("the trigger was bracketed");
    expect(medianFrameGap(frames), "a 60 Hz machine").toBeCloseTo(16.7, 6);
    expect(window.frameInWindow, "short intervals always exist on a fine grid").toBe(true);
    expect(arcImplication(window, true), "the beat is owed and observed").toBe("beat-required-observed");
    expect(arcImplication(window, false), "and its absence fails loudly, as it always did").toBe(
      "beat-required-absent",
    );
    expect(arcHandling(arcImplication(window, false))).toBe("fail-loudly");
  });

  it("(iii-b) a 60 Hz grid with one stalled interval at the trigger ⇒ absent is justified post hoc", () => {
    // The *other* direction of the same oscillation: a fast machine that dropped one
    // frame window cannot present the arc either, and the mean grid hides it.
    const frames = framesFromIntervals(jittered(16.7, 11, 5, 150));
    const window = arcWindow(frames, 5, ARC_MS);
    if (window === null) throw new Error("the trigger was bracketed");
    expect(medianFrameGap(frames), "the mean grid reads 60 Hz").toBeCloseTo(16.7, 6);
    expect(window.gapMs, "but the bracketing interval is a stall").toBeGreaterThanOrEqual(ARC_MS);
    expect(window.frameInWindow).toBe(false);
    expect(arcImplication(window, false)).toBe("limit-justified-absent");
    expect(arcHandling(arcImplication(window, false))).toBe("resolve-limit");
  });

  it("(iv) the fabricated coarse grid ⇒ the prediction is exact at every trigger position", () => {
    // The stretcher burns once per frame, so *every* interval is longer than the
    // arc — not just the one that happened to bracket the trigger. That is what
    // makes P1b's `onset === null` a physical prediction instead of a mean-based bet.
    for (const stretchMs of [P1_STRETCH, 200, 233.3]) {
      const frames = framesFromIntervals(Array.from({ length: 9 }, () => stretchMs));
      const histogram = intervalHistogram(frames);
      const below = histogram.filter((band) => band.to !== null && band.to <= ARC_MS);
      expect(
        below.reduce((sum, band) => sum + band.count, 0),
        `fabricated ${String(stretchMs)} ms: no interval may be shorter than the arc`,
      ).toBe(0);
      for (let index = 0; index < frames.length - 1; index += 1) {
        const window = arcWindow(frames, index, ARC_MS);
        if (window === null) throw new Error("the trigger was bracketed");
        expect(window.frameInWindow, `fabricated ${String(stretchMs)} ms, interval ${String(index)}`).toBe(
          false,
        );
        expect(arcVerdict(window.gapMs, ARC_MS)).toBe("unresolvable-at-grid");
        expect(arcImplication(window, false)).toBe("limit-justified-absent");
        // …and even the impossible observation is handled, not crashed on: it would
        // be an unrelated transient, and would owe the same shape clauses.
        expect(arcImplication(window, true)).toBe("beat-observed-beyond-window");
      }
    }
  });

  it("names the 140 ms fabricated budget of P1b, so the e2e pin and this table cannot drift", () => {
    // `P1_STRETCH_MS` in `transient.spec.ts`; kept as a literal here because the
    // spec is not importable from a node-environment unit file (Playwright import).
    expect(P1_STRETCH).toBe(140);
    expect(P1_STRETCH).toBeGreaterThan(ARC_MS);
  });
});

describe("the on-the-wire attribution (QA-005f)", () => {
  it("holds exactly for the frame that had run and not for the one that had not", () => {
    // `ranAt` is the wall clock at which each frame's callbacks ran; `frames` holds
    // the *scheduled* stamps. A coarse runner's log: stamps 83 ms apart, callbacks
    // running ~90 ms after their own stamp.
    const ranAt = [1_000, 1_090, 1_180, 1_270];
    expect(attributionHolds(ranAt, 1_050, 0), "frame 0 had run, frame 1 had not").toBe(true);
    expect(attributionHolds(ranAt, 1_050, 1), "frame 1 had not run yet").toBe(false);
    expect(attributionHolds(ranAt, 1_090, 1), "the instant a frame's callbacks ran is its own").toBe(true);
    expect(attributionHolds(ranAt, 1_089.9, 1), "…one microsecond earlier is the previous step").toBe(false);
    // The boundary of the last recorded frame: the next one is unknown, not absent.
    expect(attributionHolds(ranAt, 1_300, 3)).toBe(true);
    expect(attributionHolds(ranAt, 1_199, 3), "frame 3 had not run at 1199").toBe(false);
  });

  it("fails closed on indices the log cannot support — the check cannot be talked around", () => {
    const ranAt = [1_000, 1_090];
    expect(attributionHolds(ranAt, 1_050, -1), "no frame had run").toBe(false);
    expect(attributionHolds(ranAt, 1_050, 2), "an index past the log").toBe(false);
    expect(attributionHolds(ranAt, 1_050, 0.5), "a non-integer is not a frame").toBe(false);
    expect(attributionHolds([], 1_050, 0), "no run times at all").toBe(false);
    // …and the two facts it compares are the ones the observer records, so an
    // event that names a step its own run times contradict is a red, not a guess.
    expect(
      attributionHolds(ranAt, 1_005, 1),
      "a stamp-lagging mis-pick would claim frame 1 at a wall time before it ran",
    ).toBe(false);
  });
});

describe("the interval census", () => {
  it("bins every interval, and counts the ones shorter than the arc", () => {
    // 16, 16, 16, 90, 100 — a fine grid with one stall: the mean says nothing about
    // how many frames could have carried the arc.
    const frames = framesFromIntervals([16, 16, 16, 90, 100]);
    const bands = intervalHistogram(frames);
    expect(bands.reduce((sum, band) => sum + band.count, 0), "every interval is binned").toBe(
      frames.length - 1,
    );
    expect(bands[0]?.count, "three 16 ms intervals in [0, 30)").toBe(3);
    expect(bands[3]?.count, "90 and 100 ms in [90, 120)").toBe(2);
    // The arc's own length is a band edge, so "how many intervals were shorter than
    // the transient" is readable straight off the census.
    expect(intervalsBelow(frames, ARC_MS), "16, 16, 16 — 90 is not below 90").toBe(3);
    expect(describeIntervalHistogram(frames)).toBe(
      "0-30:3 30-60:0 60-90:0 90-120:2 120-180:0 180-300:0 300-inf:0",
    );
  });

  it("reveals the jitter the median hides, and degrades cleanly with no intervals", () => {
    const jitteredGrid = framesFromIntervals(jittered(100, 11, 5, 45));
    expect(medianFrameGap(jitteredGrid), "the median is the coarse grid").toBe(100);
    expect(intervalsBelow(jitteredGrid, ARC_MS), "but one interval could carry the arc").toBe(1);
    expect(intervalHistogram([]).every((band) => band.count === 0)).toBe(true);
    expect(intervalHistogram([5]).every((band) => band.count === 0), "one stamp is no interval").toBe(true);
    expect(intervalsBelow([5], ARC_MS)).toBe(0);
    expect(describeIntervalHistogram([])).toBe(
      "0-30:0 30-60:0 60-90:0 90-120:0 120-180:0 180-300:0 300-inf:0",
    );
  });
});