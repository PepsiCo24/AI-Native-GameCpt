/**
 * **R-C8's idle pulse as a sampling problem** (QA-020) — the arithmetic that makes
 * A-8's stillness proof independent of *when* the sample lands.
 *
 * ── The bug this file exists for ─────────────────────────────────────────────
 * A-8 asked `frameDiffAfter(page, 2000)` for a changed-pixel count and required
 * `> 0`. The goal's idle pulse is `1 + A·sin(2πt/2400)` (`src/game/renderer/
 * objects/goal.ts:32-33,59-61`, fed from the wall clock at `board-view.ts:973`), so
 * two samples at phases θ and θ + 2πS/2400 differ by
 *
 *     A·|sin(θ + 2πS/2400) − sin θ| = A · 2·|cos(θ + πS/2400)| · |sin(πS/2400)|,
 *
 * a **cosine of the capture phase** — which the row cannot control, because the row
 * starts whenever the runner happens to start. Its zero crossings are therefore a
 * flake, not a rare accident: measured on the frozen bytes, S = 2000 ms
 * (`A·|cos(θ + 150°)|`) gave `changed=0 maxDelta=0` at page-clock residues 713 ms
 * and 716 ms while the same row 400 ms away read `changed=1688`. QA-019 saw the same
 * thing as an in-file/alone split (`changed=0` in 1 of 5 runs).
 *
 * *No* two-sample schedule escapes this — one that is not a whole multiple of the
 * period always has a phase where the two samples coincide, and half a period
 * (QA-019's option (a), S = 1200) does **not** "return to the same phase": it returns
 * to the *negated* one (`sin(θ+π) = −sin θ`), which is maximal where the two-sample
 * difference is maximal and zero where it is zero. Measured at S = 1200: `changed=88,
 * maxDelta=40` at residue 2315 ms, against ~1600 elsewhere — two orders of magnitude
 * below the row's own typical reading, i.e. the same cliff, moved.
 *
 * ── The schedule that *is* invariant ─────────────────────────────────────────
 * Three samples {@link IDLE_TRIO_STEP_MS} apart span one whole period (the real wait
 * is `setTimeout` + one rAF + read-back, measured 827–866 ms per step, so the span is
 * ≥ 1.0 period and never less). Over any θ the *best* of three phases 120° apart has
 * `max|cos| ≥ 0.866` — the minimum of `max(|cos θ|, |cos(θ±120°)|)`, attained at
 * θ = 30° + k·60° and computed here rather than typed (see {@link minOfMaxAbsCos}).
 * The trio's largest sample therefore always carries at least
 * `2·sin(π·800/2400)·0.866·A ≈ 9 %` of pulse *scale*, at every phase, and the
 * assertion goes on that peak. Individual samples may legitimately read 0 — measured
 * `changed=1688/1347/0` — which is exactly why the peak, not the minimum and not the
 * first sample, is the channel.
 *
 * ── What stays in the row (this file must not absorb it) ─────────────────────
 * The *meaning* of A-8 is the deny list: on a settled board, **no animation outside
 * the goal's cell may move anything** (a portal breathing, a grid line shimmering, an
 * echo fading, a HUD beat). That is asserted per sample in the spec, on every sample's
 * union bbox. This module only supplies a positive control that cannot go flaky
 * (the goal is alive) and the sample schedule that makes both halves phase-invariant.
 *
 * ── The constants are quoted, and re-measured ────────────────────────────────
 * `GOAL_PULSE_MS`/`GOAL_PULSE_AMPLITUDE` cannot be imported here: `objects/goal.ts`
 * reaches `theme/art.ts`'s `?url` PNG imports, which Playwright's loader does not
 * transform (the unit tier pins both constants:
 * `tests/unit/portal-mount-acceptance.test.ts:567`). They are not trusted on paper
 * either: {@link idleStillnessProof} reads the painted goal radius over the cycle
 * from the page, and the measured 28.50…32.00 device px on the 91 px desk cell is
 * the 6 % amplitude the pulse law predicts (30.25 · (1 ± 0.06) = 28.44 / 32.07).
 */

import type { Page } from "@playwright/test";

import { captureFrame, cellCensus, frameDiffAfter } from "./frames";
import type { FrameDiff, RgbBytes } from "./frames";

/** `objects/goal.ts:32` — the pulse's period, in ms. */
export const GOAL_PULSE_MS = 2400;
/** `objects/goal.ts:33` — the pulse's amplitude, as a fraction of scale. */
export const GOAL_PULSE_AMPLITUDE = 0.06;

/**
 * The trio's step. Three of these are one whole pulse period, so the schedule cannot
 * be caught with all three samples at one phase — and 120° spacing is what makes the
 * best of three a *guaranteed* 0.866 of the amplitude (see the header).
 */
export const IDLE_TRIO_STEP_MS = 800;

/**
 * `min over θ of max_k |cos(θ + 2πk·step/P)|` — the phase-invariant guarantee of a
 * `samples`-long schedule. Computed, not typed, so the row's floor moves with the
 * schedule: 2 samples at 1200 ms → **0** (the exact flake), 2 at 2000 ms → 0.5,
 * 3 at 800 ms → **0.866**.
 */
export function minOfMaxAbsCos(stepMs: number, samples: number, grid = 720): number {
  let worst = 1;
  for (let i = 0; i < grid; i += 1) {
    const theta = (i / grid) * 2 * Math.PI;
    let best = 0;
    for (let k = 0; k < samples; k += 1) {
      best = Math.max(best, Math.abs(Math.cos(theta + (2 * Math.PI * stepMs * k) / GOAL_PULSE_MS)));
    }
    if (best < worst) worst = best;
  }
  return worst;
}

/**
 * The pulse-scale difference the *best* sample of the schedule is guaranteed to see,
 * whatever the capture phase: `2·|sin(πS/P)| · minOfMaxAbsCos(S, n) · A`.
 */
export function guaranteedPeakDeltaScale(
  stepMs: number = IDLE_TRIO_STEP_MS,
  samples = 3,
): number {
  return (
    2 *
    Math.abs(Math.sin((Math.PI * stepMs) / GOAL_PULSE_MS)) *
    minOfMaxAbsCos(stepMs, samples) *
    GOAL_PULSE_AMPLITUDE
  );
}

/**
 * The floor a changed-pixel count must clear for the goal to count as *alive*.
 *
 * The pulse is a *size* rule, so a radius move of `ΔR = δ·R` repaints a band of
 * roughly `2πR · ΔR` device px. The analytic band is derated 4× — `changed` counts
 * only pixels past the differ's 6/255 tolerance, and a floor that is the raw analytic
 * area would be a second flake; the derate is the documented margin and the row prints
 * the headroom it actually got.
 */
export function idleProofFloor(goalRadius: number, deltaScale: number = guaranteedPeakDeltaScale()): number {
  return Math.round((2 * Math.PI * goalRadius * deltaScale * goalRadius) / 4);
}

/** What {@link idleStillnessProof} measured, and the bound it derived. */
export interface IdleStillness {
  /** One entry per sample, oldest first — each is a diff against the previous frame. */
  readonly samples: readonly FrameDiff[];
  /** Largest changed-pixel count across the samples (the phase-invariant channel). */
  readonly peak: number;
  /** `peak − min` — reported, **not** asserted: see the header of this file. */
  readonly spread: number;
  /** The painted goal radius, device px, from the page's own pixels. */
  readonly goalRadius: number;
  /** The pulse-scale difference the best sample is guaranteed to see, at any phase. */
  readonly guaranteedDeltaScale: number;
  /** The derated analytic floor `peak` must clear. */
  readonly floor: number;
  /** Wall-clock the schedule spanned, ms (≥ one pulse period by construction). */
  readonly spanMs: number;
}

export interface IdleStillnessSpec {
  /** The goal cell's centre, canvas **device** px. */
  readonly centre: { readonly x: number; readonly y: number };
  /** Census disc radius, device px — keep it inside the cell surface (callers use 0.45·cell). */
  readonly sampleRadius: number;
  /** The goal cell's own ground token, **in the phase the board is in**. */
  readonly ground: RgbBytes;
  /** Sample count. Default 3 — the minimum that is phase-invariant. */
  readonly samples?: number;
  /** Step between samples, ms. Default {@link IDLE_TRIO_STEP_MS}. */
  readonly stepMs?: number;
}

/**
 * Prove an idle board is *at rest except for the goal's own pulse*, at any phase.
 *
 * Samples `n` frames `stepMs` apart (default 3 × 800 ms = one pulse period), returns
 * every diff for the caller's deny-list assertion, plus the phase-invariant positive
 * control (`peak`) and the derived `floor`. The goal's radius is censused first, so
 * the floor is measured from the board that is on screen — never typed.
 */
export async function idleStillnessProof(page: Page, spec: IdleStillnessSpec): Promise<IdleStillness> {
  const samples = spec.samples ?? 3;
  const stepMs = spec.stepMs ?? IDLE_TRIO_STEP_MS;
  const census = await cellCensus(page, {
    centre: spec.centre,
    radius: spec.sampleRadius,
    ground: spec.ground,
  });
  await captureFrame(page);
  const diffs: FrameDiff[] = [];
  for (let i = 0; i < samples; i += 1) diffs.push(await frameDiffAfter(page, stepMs));
  const changed = diffs.map((d) => d.changed);
  const peak = Math.max(...changed);
  const deltaScale = guaranteedPeakDeltaScale(stepMs, samples);
  return {
    samples: diffs,
    peak,
    spread: peak - Math.min(...changed),
    goalRadius: census.outer,
    guaranteedDeltaScale: deltaScale,
    floor: idleProofFloor(census.outer, deltaScale),
    spanMs: diffs.reduce((acc, d) => acc + d.elapsedMs, 0),
  };
}