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
 */

import { describe, expect, it } from "vitest";

import {
  arcVerdict,
  bracketFrames,
  denyNudgeOffsetPx,
  framesSpanned,
  gestureGameMs,
  medianFrameGap,
} from "../e2e/helpers/frame-model";
import { FLIP_TIMING, FLIP_VARIANT, LAYOUT } from "@/game/theme/tokens";

/** The shipped §6.5 deny row — the transient this whole model is about. */
const TIMINGS = FLIP_TIMING[FLIP_VARIANT];
const ARC_MS = TIMINGS.deny.dur;

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