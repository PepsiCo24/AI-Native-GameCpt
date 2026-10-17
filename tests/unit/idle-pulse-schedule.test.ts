/**
 * QA-020 — **the idle-stillness proof's schedule law, proven where it can be proven
 * exactly.**
 *
 * A-8's flake was not a rendering accident, it was arithmetic: two samples of R-C8's
 * `1 + A·sin(2πt/2400)` pulse (`src/game/renderer/objects/goal.ts:32-33,59-61`, wall
 * clock at `board-view.ts:973`) separate by a distance whose *amplitude is a cosine of
 * the capture phase*:
 *
 *     |sin(θ + 2πS/P) − sin θ| = 2·|cos(θ + πS/P)|·|sin(πS/P)|
 *
 * so for any S that is not a whole multiple of the period the row's `changed > 0`
 * preference has a phase where it is false — the runner picks the phase, not the test.
 * This file pins the consequences as numbers: the two-sample schedules A-8 used to run
 * (and the half-period variant QA-019 proposed) hit **exactly** that phase, and the
 * three-sample 800 ms trio cannot. The browser tier then only has to *measure* — the
 * law it asserts against is settled here, deterministically, with no page involved.
 */

import { describe, expect, it } from "vitest";

import { bboxWithin } from "../e2e/helpers/frames";
import {
  GOAL_PULSE_AMPLITUDE,
  GOAL_PULSE_MS,
  IDLE_TRIO_STEP_MS,
  guaranteedPeakDeltaScale,
  idleProofFloor,
  minOfMaxAbsCos,
} from "../e2e/helpers/pulse-schedule";

/** The real per-step wall clock the browser tier measures (827–866 ms, not 800). */
const MEASURED_STEPS = [800, 827, 845, 866] as const;

describe("QA-020 R-C8 idle pulse — the sample schedule decides whether the row can go red", () => {
  it("pins the pulse the rest of this file is arithmetic on", () => {
    // The same two numbers the unit tier already pins from production
    // (`portal-mount-acceptance.test.ts:567`); restated here so this file's laws can
    // never drift silently away from the pulse they model.
    expect(GOAL_PULSE_MS).toBe(2400);
    expect(GOAL_PULSE_AMPLITUDE).toBe(0.06);
    expect(IDLE_TRIO_STEP_MS * 3).toBe(GOAL_PULSE_MS);
  });

  it("two samples 1200 ms apart (QA-019's option (a)) still have an exact null phase", () => {
    // "Half the period returns the cosine to the same phase" is false: sin(θ+π) = −sin θ,
    // so the pair is *maximally* apart where the pulse is at its extreme and *identical*
    // where sin θ = 0 — the same cliff the 2 s row had, only moved in phase.
    expect(minOfMaxAbsCos(1200, 2)).toBeLessThan(1e-9);
    // …and the schedule the row actually ran is no better: S = 2000 ⇒ A·|cos(θ+150°)|,
    // half the amplitude in the best phase and zero at θ = −60°/120°.
    expect(minOfMaxAbsCos(2000, 2)).toBeCloseTo(0.5, 9);
  });

  it("three samples 800 ms apart guarantee ≥ 0.866 of the amplitude at every phase", () => {
    // min over θ of max(|cos θ|, |cos(θ±120°)|), attained at θ = 30° + k·60° — the
    // √3/2 that turns "a sample may legitimately read 0" into a usable peak assertion.
    expect(minOfMaxAbsCos(IDLE_TRIO_STEP_MS, 3)).toBeCloseTo(Math.sqrt(3) / 2, 9);
    expect(guaranteedPeakDeltaScale(IDLE_TRIO_STEP_MS, 3)).toBeCloseTo(0.09, 9);
  });

  it("the guarantee survives the schedule's real wall clock, not just the nominal step", () => {
    // The browser waits `setTimeout` + one rAF + read-back, so the trio's steps measure
    // 827–866 ms (and its span 2510–2528 ms, i.e. ≥ one period, never less). Every one
    // of those spans still guarantees a large phase-independent move.
    for (const step of MEASURED_STEPS) {
      expect(minOfMaxAbsCos(step, 3), `S=${String(step)}`).toBeGreaterThan(0.76);
      expect(guaranteedPeakDeltaScale(step, 3), `S=${String(step)}`).toBeGreaterThan(0.083);
    }
  });

  it("the trio's floor is a derived band, and it is monotone in the painted radius", () => {
    // A pulse is a size rule: ΔR = δR repaints ≈ 2πR·ΔR device px. The floor is that
    // analytic band derated 4× (a raw analytic area would be a second flake), so it is
    // derived from the census the row takes — measured 29.00 px (desk) / 32.00 px
    // (mobile pitch) on the 91 / 103 px cell.
    expect(idleProofFloor(29)).toBe(119);
    expect(idleProofFloor(32)).toBe(145);
    expect(idleProofFloor(64)).toBeGreaterThan(idleProofFloor(32));
    // Both floors sit an order of magnitude below the measured peaks (1675 desk,
    // 2134 mobile at the phases the browser tier printed), i.e. the margin a
    // suppressed pulse must eat before the row goes red is ~14×.
    expect(idleProofFloor(29)).toBeLessThan(1675 / 10);
    // No ink measured ⇒ no floor ⇒ the browser row's `goalRadius > 0` guard is what
    // stops this degenerating into a tautology (`peak >= 0`).
    expect(idleProofFloor(0)).toBe(0);
  });

  it("the deny-list assertion is falsifiable: a pixel outside the goal's cell fails it", () => {
    // The row's *meaning* is this predicate, applied to every sample. If a rogue idle
    // animation (a portal breathing, a grid line shimmering, an echo fading, a HUD
    // beat) moved a pixel anywhere else, the union bbox would leave the rect and this
    // returns false — the negative control that keeps the trio from being decoration.
    const rect = { x: 867, y: 67, w: 91, h: 91 };
    // The trio's own measured bboxes (desk, 2026-10-17): 879,79,945,146 / 880,80,944,144.
    expect(bboxWithin({ x0: 879, y0: 79, x1: 945, y1: 146 }, rect, 2)).toBe(true);
    expect(bboxWithin({ x0: 880, y0: 80, x1: 944, y1: 144 }, rect, 2)).toBe(true);
    // …and 2 px of slack is the whole allowance: the cell's own edge (867…958) plus 2.
    expect(bboxWithin({ x0: 865, y0: 65, x1: 960, y1: 158 }, rect, 2)).toBe(true);
    expect(bboxWithin({ x0: 879, y0: 79, x1: 961, y1: 146 }, rect, 2)).toBe(false);
    expect(bboxWithin({ x0: 864, y0: 79, x1: 945, y1: 146 }, rect, 2)).toBe(false);
    expect(bboxWithin({ x0: 879, y0: 79, x1: 945, y1: 161 }, rect, 2)).toBe(false);
    // Nothing moved *outside* the cell either when a sample reads 0 — the deny list is
    // about location, and the positive control (the peak floor) is what proves life.
    expect(bboxWithin(null, rect, 2)).toBe(true);
  });
});