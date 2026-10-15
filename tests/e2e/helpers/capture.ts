/**
 * In-process frame capture protocol — the **transient-frame resampler**.
 *
 * ── Why this exists (the physical finding it answers) ────────────────────────
 * Two capture channels were known to be dead for transient frames:
 *
 * 1. **CDP `Page.captureScreenshot`** — a ~670 ms round trip *independent of the
 *    clip size*. The two transients this game has are the §6.5 refusal arc
 *    (`deny.dur = 90 ms`) and the switch press beat (`occupied` row,
 *    `140 → 220 ms`); a 670 ms channel cannot see either.
 * 2. **`canvas.toDataURL()` on the WebGL buffer** — all black, because Phaser
 *    creates its context without `preserveDrawingBuffer`.
 *
 * This module uses the channel that *is* reachable without touching `src/**`:
 * the test installs
 * {@link import("./game").installPixelReadback} (`addInitScript` wrapping
 * `HTMLCanvasElement.prototype.getContext` and forcing
 * `preserveDrawingBuffer: true` on the attributes Phaser itself passes), then
 * reads the presented frame **in the page**, inside a `requestAnimationFrame`
 * loop, with `drawImage` + `getImageData` on a small region of interest. That is
 * a ~0.3 ms read per frame instead of a 670 ms round trip, so the 60 Hz frame grid
 * survives.
 *
 * ── What it returns (and what it deliberately does not) ──────────────────────
 * The page keeps the full ROI pixels of every captured frame in memory, then —
 * after the run — diffs each frame against the **last** frame (the settled state,
 * i.e. "the animation is over") and returns only compact per-frame scalars:
 *
 * ```
 * { t, changed, maxDelta, centroid: {x, y} }
 * ```
 *
 * `changed` counts ROI pixels whose max channel distance to the settled frame
 * exceeds {@link CAPTURE_TOLERANCE}; `centroid` is their centre of mass, which is
 * what makes the refusal *arc* falsifiable in the right direction. Raw pixels
 * never cross the process boundary (a 45-frame ROI would be ~3 MB of JSON).
 *
 * The ROI coordinates are **device px in the canvas backing store** — exactly the
 * space `renderer/grid-mapping.ts` works in — so callers derive them from
 * `BoardGeometry.cellCenterDevice`.
 */

import type { Page } from "@playwright/test";

/** Channel distance under which two pixels count as "the same" (8-bit RGB). */
export const CAPTURE_TOLERANCE = 6;

/**
 * The CDP `Page.captureScreenshot` round trip this channel exists to beat.
 *
 * Measured at QA-005: **~670 ms, independent of the clip size** — which is why a
 * 90 ms refusal arc is unreachable through a screenshot and reachable through the
 * in-page resampler. The number is the *screen channel's* reference point, not a
 * frame-rate expectation, so {@link measureFrameGrid}'s ceiling is derived from
 * it rather than hard-coded per machine.
 */
export const SCREENSHOT_ROUND_TRIP_MS = 670;

export interface FrameGrid {
  /** Median `requestAnimationFrame` interval over the sample window, in ms. */
  readonly gridMs: number;
  /** Frames observed in the window. */
  readonly frames: number;
}

/**
 * Measure **the running machine's own animation-frame grid**.
 *
 * QA-005's `gridMs < 60` guard was calibrated on a local machine (median 31 ms)
 * and went bankrupt on CI's 2-core software-GL runner, where the same recorder
 * observed 6–7 frames in 700 ms (project-status item 57 / the QA-005c ticket):
 * the guard failed its own premise rather than catching a defect. The guard's
 * *semantic* is "the recorder kept pace with the machine's own frames, so the
 * channel is a rAF grid and not a 670 ms screenshot round trip" — which can only
 * be stated relative to that machine. This measures the reference first, on the
 * settled board, so the claim can be made on any runner.
 */
export async function measureFrameGrid(page: Page, ms = 600): Promise<FrameGrid> {
  return page.evaluate(
    (window_ms: number) =>
      new Promise<{ gridMs: number; frames: number }>((resolve) => {
        const deltas: number[] = [];
        let previous = performance.now();
        const startedAt = previous;
        const tick = (): void => {
          const now = performance.now();
          deltas.push(now - previous);
          previous = now;
          if (now - startedAt >= window_ms) {
            deltas.sort((a, b) => a - b);
            const mid = deltas[Math.floor(deltas.length / 2)];
            resolve({ gridMs: mid ?? 0, frames: deltas.length });
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
}

export interface CaptureStats {
  /** ms since the recorder started (page clock, `performance.now`). */
  readonly t: number;
  /** ROI pixels differing from the settled frame by more than the tolerance. */
  readonly changed: number;
  /** Largest single-channel distance to the settled frame (0..255). */
  readonly maxDelta: number;
  /**
   * ROI pixels differing from the **previous** captured frame (same tolerance).
   *
   * This is the channel that answers "was the picture frozen *before* the
   * trigger?" — a question the settled-frame diff cannot answer, because a
   * transient by definition ends in a different phase/picture than it started in
   * (the refusal arc begins in phase A and settles in phase B). Comparing
   * frame-to-frame makes "nothing has happened yet" an assertion instead of an
   * assumption, on a channel that is blind to *which* picture is on screen.
   */
  readonly prevChanged: number;
  /** Largest single-channel distance to the previous captured frame (0..255). */
  readonly prevMaxDelta: number;
  /** Centre of mass of the changed pixels, in ROI-local device px. */
  readonly centroid: { readonly x: number; readonly y: number };
  /**
   * The ROI's **horizontal centre scanline**, RGB triples, ROI-local x order.
   *
   * Kept because it answers a question the whole-ROI diff cannot: *how wide is the
   * stroke right now?* (§6.2's switch press emphasis widens the outline from 2 to
   * 3 CSS px on the `occupied` row.) Its reference is the frame's **own** ground
   * pixel — the first pixel of this row — so the phase cross-fade of the ground and
   * of the ink cancels out and only the geometry remains.
   */
  readonly line: readonly number[];
}

export interface Roi {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Build an ROI centred on a device-px point, padded so a nudge stays inside. */
export function roiAround(
  centre: { x: number; y: number },
  half: number,
): Roi {
  return {
    x: Math.round(centre.x - half),
    y: Math.round(centre.y - half),
    w: Math.round(half * 2),
    h: Math.round(half * 2),
  };
}

/**
 * Start capturing `roi` on every animation frame for at most `maxMs`.
 *
 * Must be awaited before the input that triggers the transient: the recorder
 * keeps a few frames of pre-trigger history, which is what makes "the state was
 * stable before the move" an assertion instead of an assumption.
 */
export async function startRecorder(page: Page, roi: Roi, maxMs = 700): Promise<void> {
  await page.evaluate(
    (input: { roi: Roi; maxMs: number }) => {
      const canvas = document.querySelector("canvas");
      if (canvas === null) throw new Error("[capture] no canvas");
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      if (ctx === null) throw new Error("[capture] no 2d context");

      const holder = window as unknown as {
        __psCapture?: {
          t0: number;
          frames: { t: number; data: Uint8ClampedArray }[];
          stop: boolean;
        };
      };
      const rec = { t0: performance.now(), frames: [], stop: false } as {
        t0: number;
        frames: { t: number; data: Uint8ClampedArray }[];
        stop: boolean;
      };
      holder.__psCapture = rec;

      const step = (): void => {
        if (rec.stop) return;
        ctx.drawImage(canvas, 0, 0);
        const image = ctx.getImageData(input.roi.x, input.roi.y, input.roi.w, input.roi.h);
        rec.frames.push({ t: performance.now() - rec.t0, data: image.data });
        if (performance.now() - rec.t0 >= input.maxMs) return;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    { roi, maxMs },
  );
}

/**
 * Stop the recorder and return the per-frame statistics.
 *
 * The **settled frame is the last captured one**: by construction the caller lets
 * the recorder run ~250 ms past the documented end of every animation row, so the
 * final frame *is* the resting picture and every earlier frame is measured against
 * it. Nothing in this file decides what "settled" means — the caller's timing
 * budget does.
 */
export async function stopRecorder(page: Page, roi: Roi): Promise<CaptureStats[]> {
  return page.evaluate((input: { tolerance: number; width: number; height: number }) => {
    const tolerance = input.tolerance;
    const width = input.width;
    const height = input.height;
    const holder = window as unknown as {
      __psCapture?: {
        t0: number;
        frames: { t: number; data: Uint8ClampedArray }[];
        stop: boolean;
      };
    };
    const rec = holder.__psCapture;
    if (rec === undefined) throw new Error("[capture] recorder was never started");
    rec.stop = true;
    const frames = rec.frames;
    const last = frames[frames.length - 1];
    if (last === undefined) return [];
    const settled = last.data;

    /** Max channel distance and count of pixels over tolerance between two buffers. */
    const diff = (
      a: Uint8ClampedArray,
      b: Uint8ClampedArray,
    ): { changed: number; maxDelta: number; sx: number; sy: number } => {
      let changed = 0;
      let maxDelta = 0;
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < a.length; i += 4) {
        const dr = Math.abs((a[i] ?? 0) - (b[i] ?? 0));
        const dg = Math.abs((a[i + 1] ?? 0) - (b[i + 1] ?? 0));
        const db = Math.abs((a[i + 2] ?? 0) - (b[i + 2] ?? 0));
        const delta = Math.max(dr, dg, db);
        if (delta > maxDelta) maxDelta = delta;
        if (delta > tolerance) {
          changed += 1;
          const pixel = i / 4;
          sx += pixel % width;
          sy += Math.floor(pixel / width);
        }
      }
      return { changed, maxDelta, sx, sy };
    };

    return frames.map((frame, index) => {
      const vsSettled = diff(frame.data, settled);
      const previous = frames[index - 1]?.data ?? frame.data;
      const vsPrevious = diff(frame.data, previous);

      // Centre scanline of the ROI, for the stroke-width read.
      const row = Math.floor(height / 2) * width;
      const line: number[] = [];
      for (let x = 0; x < width; x += 1) {
        const i = (row + x) * 4;
        line.push(frame.data[i] ?? 0, frame.data[i + 1] ?? 0, frame.data[i + 2] ?? 0);
      }
      return {
        t: frame.t,
        changed: vsSettled.changed,
        maxDelta: vsSettled.maxDelta,
        prevChanged: vsPrevious.changed,
        prevMaxDelta: vsPrevious.maxDelta,
        centroid:
          vsSettled.changed === 0
            ? { x: 0, y: 0 }
            : { x: vsSettled.sx / vsSettled.changed, y: vsSettled.sy / vsSettled.changed },
        line,
      };
    });
  }, { tolerance: CAPTURE_TOLERANCE, width: roi.w, height: roi.h });
}

/** Ink runs on a captured scanline, measured against that frame's own ground pixel. */
export interface InkRun {
  readonly start: number;
  readonly length: number;
}

/**
 * Classify one captured scanline into "ink" runs.
 *
 * The reference is the frame's **first** scanline pixel (inside the cell, outside
 * the switch footprint) — so the A→B token cross-fade, which moves both the ground
 * and the ink, cancels and only geometry remains.
 */
export function inkRuns(line: readonly number[], minDistance = 40): InkRun[] {
  const gr = line[0] ?? 0;
  const gg = line[1] ?? 0;
  const gb = line[2] ?? 0;
  const runs: InkRun[] = [];
  let start = -1;
  for (let x = 0; x < line.length / 3; x += 1) {
    const r = line[x * 3] ?? 0;
    const g = line[x * 3 + 1] ?? 0;
    const b = line[x * 3 + 2] ?? 0;
    const isInk = Math.max(Math.abs(r - gr), Math.abs(g - gg), Math.abs(b - gb)) > minDistance;
    if (isInk && start < 0) start = x;
    if (!isInk && start >= 0) {
      runs.push({ start, length: x - start });
      start = -1;
    }
  }
  if (start >= 0) runs.push({ start, length: line.length / 3 - start });
  return runs;
}

/** Frames whose `changed` count exceeds `threshold`. */
export function changedFrames(
  stats: readonly CaptureStats[],
  threshold = 0,
): readonly CaptureStats[] {
  return stats.filter((frame) => frame.changed > threshold);
}

/** Largest `changed` count in `[from, to]` ms. */
export function maxChangedIn(
  stats: readonly CaptureStats[],
  from: number,
  to: number,
): CaptureStats | null {
  let best: CaptureStats | null = null;
  for (const frame of stats) {
    if (frame.t < from || frame.t > to) continue;
    if (best === null || frame.changed > best.changed) best = frame;
  }
  return best;
}

/** The timestamps where the ROI still differs from the settled picture. */
export function transientWindow(stats: readonly CaptureStats[]): {
  readonly first: number | null;
  readonly last: number | null;
} {
  const changed = changedFrames(stats);
  const first = changed[0];
  const last = changed[changed.length - 1];
  return { first: first?.t ?? null, last: last?.t ?? null };
}

/** Median frame interval — evidence that the 60 Hz grid was real. */
export function medianFrameInterval(stats: readonly CaptureStats[]): number {
  const deltas: number[] = [];
  for (let i = 1; i < stats.length; i += 1) {
    const a = stats[i - 1];
    const b = stats[i];
    if (a !== undefined && b !== undefined) deltas.push(b.t - a.t);
  }
  deltas.sort((x, y) => x - y);
  const mid = deltas[Math.floor(deltas.length / 2)];
  return mid ?? 0;
}

/** The resolution of the resampling protocol, in ms. */
export interface TransientReport {
  /** Frames captured at all (the recorder ran; the page did not stall). */
  readonly frames: number;
  /** Median frame interval — the frame grid the read-back achieved. */
  readonly gridMs: number;
  /** Last frame that is frame-to-frame identical to its predecessor — "the freeze". */
  readonly frozenUntil: number;
  /** First frame that differs from its predecessor — the trigger lands here. */
  readonly onset: number | null;
  /** Last frame that differs from the settled picture — "the picture stopped moving". */
  readonly settledAt: number | null;
  /** Frame-to-frame movement window, i.e. `settledAt - onset`. */
  readonly durationMs: number | null;
  /** Worst frame-to-frame movement inside the window (pixel count). */
  readonly peakPrevChanged: number;
  /** Worst distance-to-settled inside the window (0..255). */
  readonly peakMaxDelta: number;
}

/**
 * Summarise a capture as the transient's own shape.
 *
 * `frozenUntil` is the *last* frame before the first frame-to-frame difference:
 * the protocol therefore asserts "the picture was provably still, then it moved,
 * then it stopped" without ever assuming what the two pictures are. A capture
 * whose pre-trigger frames are not all identical reports a late `onset`, which is
 * the failure mode this exists to catch (a stalled renderer, or a background
 * animation, would masquerade as "the transient").
 */
export function reportTransient(stats: readonly CaptureStats[]): TransientReport {
  const first = stats.findIndex((frame) => frame.prevChanged > 0);
  const onset = first < 0 ? null : (stats[first]?.t ?? null);
  const frozenUntil = first <= 0 ? (stats[0]?.t ?? 0) : (stats[first - 1]?.t ?? 0);

  let settledAt: number | null = null;
  let peakPrevChanged = 0;
  let peakMaxDelta = 0;
  for (const frame of stats) {
    if (frame.t < (onset ?? 0)) continue;
    peakPrevChanged = Math.max(peakPrevChanged, frame.prevChanged);
    peakMaxDelta = Math.max(peakMaxDelta, frame.maxDelta);
    settledAt = frame.t;
    if (frame.changed === 0 && frame.prevChanged === 0) break;
  }

  return {
    frames: stats.length,
    gridMs: medianFrameInterval(stats),
    frozenUntil,
    onset,
    settledAt,
    durationMs: onset === null || settledAt === null ? null : settledAt - onset,
    peakPrevChanged,
    peakMaxDelta,
  };
}