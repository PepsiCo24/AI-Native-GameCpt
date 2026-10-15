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
 * The e2e arm therefore asserts the **implication of the recording's own stamps**
 * ({@link arcWindow} → {@link arcImplication} → {@link arcHandling}), and the
 * synthetic jitter tables below prove every cell of that map — including the two
 * cloud observations of run `38784574025` as legal-but-differently-handled inputs.
 * The 60 Hz teeth survive: on a fine grid short intervals always exist, so an
 * absent beat is `beat-required-absent` → `fail-loudly`.
 */

import { describe, expect, it } from "vitest";

import {
  arcHandling,
  arcImplication,
  arcVerdict,
  arcWindow,
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
    // gesture even though the driver's round trips took real wall-clock time.
    expect(framesSpanned(frames, t0, t0 + 0.2)).toBe(0);
    expect(gestureGameMs(frames, t0, t0 + 0.2, 16.7)).toBe(0);
    // One frame later the same gesture is one grid long.
    expect(framesSpanned(frames, t0, t0 + 17)).toBe(1);
    expect(gestureGameMs(frames, t0, t0 + 17, 16.7)).toBeCloseTo(16.7, 6);
  });

  it("arithmetics the pre-QA-005d burst into the reproduced cloud verdict", () => {
    for (const row of MEASURED) {
      const frames = syntheticGrid(row.grid, 5_000);
      const t0 = (frames[20] ?? 0) + 1;
      const oldEnd = (frames[20 + row.oldSpan] ?? 0) + 1;
      const oldMs = gestureGameMs(frames, t0, oldEnd, row.grid);

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
      expect(framesSpanned(frames, t0, t1)).toBe(row.newSpan);
      expect(gestureGameMs(frames, t0, t1, row.grid)).toBe(0);
      expect(gestureGameMs(frames, t0, t1, row.grid)).toBeLessThanOrEqual(LAYOUT.swipeMaxMs);
    }
  });
});

describe("the frame bracket", () => {
  it("names the step the game clock held during an instant, and the step that paints it", () => {
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
    // A caller that ignored the `null` would read "0 ms" and believe the arc was
    // resolvable; the e2e walk asserts non-null before classifying.
    expect(framesSpanned([10, 20], 5, 25)).toBe(0);
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

/** The midpoint of interval `index` — strictly inside it, so it is the trigger. */
function triggerIn(frames: readonly number[], index: number): number {
  const a = frames[index] ?? 0;
  const b = frames[index + 1] ?? 0;
  return (a + b) / 2;
}

describe("the arc window, read post hoc from a recording's own stamps", () => {
  it("excludes the trigger frame itself — it was rendered before the deny existed", () => {
    // `Tₙ` is the step whose update ran *before* the keydown, which is exactly why
    // `scene.time.now` is `Tₙ` at the keydown. It cannot paint the response.
    const frames = [0, 45, 90];
    const window = arcWindow(frames, 20, ARC_MS);
    expect(window).not.toBeNull();
    if (window === null) return;
    expect(window.startAt, "`scene.time.now` during the keydown").toBe(0);
    expect(window.endAt, "`startAt + deny.dur`").toBe(90);
    expect(window.inside, "only the frame strictly inside the open interval").toEqual([45]);
    expect(window.inside, "the frame at `startAt` is not inside the paint window").not.toContain(0);
    expect(window.gapMs, "the bracketing interval").toBe(45);
  });

  it("keeps the boundary closed: a frame at exactly `startAt + arcMs` paints nothing", () => {
    // `BoardView.update` clears at `time >= startAt + dur`, so 90.0 is out.
    const frames = [0, ARC_MS];
    const window = arcWindow(frames, ARC_MS / 2, ARC_MS);
    if (window === null) throw new Error("the trigger was bracketed");
    expect(window.inside).toEqual([]);
    expect(window.frameInWindow, "90 ms is not inside a 90 ms window").toBe(false);
    // One microsecond short of the boundary is inside.
    const justInside = arcWindow([0, ARC_MS - 1e-3], ARC_MS / 2, ARC_MS);
    if (justInside === null) throw new Error("the trigger was bracketed");
    expect(justInside.frameInWindow).toBe(true);
  });

  it("is null when the trigger fell outside the recorded stamps — not measured is not 'no frame inside'", () => {
    expect(arcWindow([10, 20], 5, ARC_MS), "before the first stamp").toBeNull();
    expect(arcWindow([10, 20], 25, ARC_MS), "after the last stamp").toBeNull();
    expect(arcWindow([], 5, ARC_MS), "no stamps at all").toBeNull();
    // A caller that ignored the `null` could justify an absent beat on a recording
    // that never covered the trigger; the e2e walk asserts non-null first.
  });

  it("is equivalent to the interval model wherever both are defined, at every gap", () => {
    // `frameInWindow` ⟺ `gap < arcMs`: the stamps are monotonic, so the *next* frame
    // is the only candidate. The equivalence is the licence for the verdict to keep
    // being used as the fabrication arbiter (unit-proved here, not assumed).
    for (let gap = 0; gap <= 200; gap += 0.5) {
      const frames = framesFromIntervals([gap, 40, 40]);
      const window = arcWindow(frames, gap / 2, ARC_MS);
      if (window === null) throw new Error(`the trigger at gap ${gap.toFixed(1)} was bracketed`);
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
    readonly trigger: number;
    readonly observed: boolean;
    readonly implication: ArcImplication;
    readonly handling: string;
  }[] = [
    // A frame is in the window → the beat is owed, observed or not.
    {
      frames: framesFromIntervals([40, 40]),
      trigger: 20,
      observed: true,
      implication: "beat-required-observed",
      handling: "assert-shape",
    },
    {
      frames: framesFromIntervals([40, 40]),
      trigger: 20,
      observed: false,
      implication: "beat-required-absent",
      handling: "fail-loudly",
    },
    // No frame is in the window → absence is a limit; a beat is still an observation.
    {
      frames: framesFromIntervals([100, 100]),
      trigger: 50,
      observed: false,
      implication: "limit-justified-absent",
      handling: "resolve-limit",
    },
    {
      frames: framesFromIntervals([100, 100]),
      trigger: 50,
      observed: true,
      implication: "beat-observed-beyond-window",
      handling: "assert-shape",
    },
  ];

  it("maps every combination of (frame in window, beat observed) to exactly one handling", () => {
    const seen = new Set<string>();
    for (const row of CASES) {
      const window = arcWindow(row.frames, row.trigger, ARC_MS);
      if (window === null) throw new Error("the trigger was bracketed");
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

  it("decides the handling from the stamps, never from the runner's mean grid", () => {
    // Same runner, same median, opposite implications — the mean is not a verdict.
    const shortFrames = framesFromIntervals(jittered(100, 11, 5, 45));
    const longFrames = framesFromIntervals(jittered(100, 11, 5, 200));
    const short = arcWindow(shortFrames, triggerIn(shortFrames, 5), ARC_MS);
    const long = arcWindow(longFrames, triggerIn(longFrames, 5), ARC_MS);
    if (short === null || long === null) throw new Error("both triggers were bracketed");
    expect(medianFrameGap(shortFrames), "the same mean grid").toBe(100);
    expect(medianFrameGap(longFrames), "the same mean grid").toBe(100);
    expect(short.frameInWindow, "a short interval can bracket the trigger").toBe(true);
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
   * the handling is a function of the stamps rather than of the mean.
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
      const window = arcWindow(frames, triggerIn(frames, 5), ARC_MS);
      if (window === null) throw new Error("the trigger was bracketed");

      expect(medianFrameGap(frames), "the runner's mean grid, as the log measured it").toBeCloseTo(
        draw.gridMs,
        1,
      );
      expect(window.gapMs, "the bracketing interval, as the log measured it").toBeCloseTo(draw.gapMs, 1);
      expect(arcVerdict(window.gapMs, ARC_MS), "the old mean-grid arbiter's reading").toBe(draw.verdict);
      expect(window.frameInWindow, "the window, from this recording's own stamps").toBe(
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
    const window = arcWindow(frames, triggerIn(frames, 5), ARC_MS);
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
    const window = arcWindow(frames, triggerIn(frames, 5), ARC_MS);
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
    const window = arcWindow(frames, triggerIn(frames, 5), ARC_MS);
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
    const window = arcWindow(frames, triggerIn(frames, 5), ARC_MS);
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
        const window = arcWindow(frames, triggerIn(frames, index), ARC_MS);
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