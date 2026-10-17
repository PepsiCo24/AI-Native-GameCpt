/**
 * Whole-canvas frame differencing (QA-017) — the **idle-stillness** instrument.
 *
 * `helpers/capture.ts` records one ROI per animation frame while a *transient* runs.
 * The §6.6 acceptance rows A-8/A-9/A-10 ask a different question: **on a settled
 * board, which pixels move at all?** — and the answer has to be "only the goal's
 * cell" (R-M1: one attention magnet), or "nothing, at all" under reduced motion
 * (the pulse is a data flip).
 *
 * The instrument is deliberately blunt and exact: the presented canvas is copied
 * twice (`drawImage` → `getImageData`, the same read-back channel every other probe
 * uses) separated by a wall-clock wait, and the two buffers are diffed **in the
 * page**. Two facts make that the right shape:
 *
 * - **No node-side image decoding.** Playwright's own screenshot diffing needs a PNG
 *   round trip and a decoder; the page already has the pixels.
 * - **The bbox, not a count.** "Nothing else moved" is only falsifiable if the
 *   *location* of the movement is reported, so the diff returns the union bounding
 *   box of every changed pixel in **device px** — the caller compares it against the
 *   goal cell's own device-px rect (`computeLayout`, the production geometry).
 *
 * The pairing is stateful and single-slot, like the capture recorder: `captureFrame`
 * stores a base, `frameDiffAfter` waits, diffs, and **re-stores the new frame as the
 * base**, so successive calls tessellate the timeline without ever comparing against
 * a stale picture.
 */

import type { Page } from "@playwright/test";

/** One comparison between two presented frames. */
export interface FrameDiff {
  /** Pixels whose max channel distance to the base exceeds `tolerance`. */
  readonly changed: number;
  /** Pixels in the buffer (canvas device px). */
  readonly total: number;
  /** Largest single-channel distance seen (0..255). */
  readonly maxDelta: number;
  /** Union bbox of the changed pixels, device px — `null` when nothing changed. */
  readonly bbox: { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number } | null;
  /** Wall clock the page actually waited, ms. */
  readonly elapsedMs: number;
}

interface StoredFrame {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

/** Store the presented canvas as the diff base. Call before the wait you care about. */
export async function captureFrame(page: Page): Promise<void> {
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas === null) throw new Error("[frames] no canvas");
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext("2d", { willReadFrequently: true });
    if (ctx === null) throw new Error("[frames] no 2d context");
    ctx.drawImage(canvas, 0, 0);
    (window as unknown as { __psFrame?: StoredFrame }).__psFrame = {
      w: copy.width,
      h: copy.height,
      data: ctx.getImageData(0, 0, copy.width, copy.height).data,
    };
  });
}

/**
 * Wait `waitMs` of page wall clock, then diff the canvas against the last stored
 * frame and leave **this** frame stored as the new base.
 *
 * The wait is a `setTimeout` on purpose: the renderer keeps stepping (the point of
 * the probe is to sample the *clock*, so a pause driven by the game's own frames
 * would be the wrong instrument), and one extra `requestAnimationFrame` after it
 * aligns the read-back with a presented frame rather than a mid-step buffer.
 */
export async function frameDiffAfter(page: Page, waitMs: number, tolerance = 6): Promise<FrameDiff> {
  return page.evaluate(
    async (input: { waitMs: number; tolerance: number }): Promise<FrameDiff> => {
      const holder = window as unknown as { __psFrame?: StoredFrame };
      const base = holder.__psFrame;
      if (base === undefined) throw new Error("[frames] captureFrame() was not called first");
      const t0 = performance.now();
      await new Promise((resolve) => setTimeout(resolve, input.waitMs));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const canvas = document.querySelector("canvas");
      if (canvas === null) throw new Error("[frames] no canvas");
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      if (ctx === null) throw new Error("[frames] no 2d context");
      ctx.drawImage(canvas, 0, 0);
      const now = ctx.getImageData(0, 0, copy.width, copy.height).data;
      holder.__psFrame = { w: copy.width, h: copy.height, data: now };

      const width = base.w;
      let changed = 0;
      let maxDelta = 0;
      let x0 = Number.POSITIVE_INFINITY;
      let y0 = Number.POSITIVE_INFINITY;
      let x1 = Number.NEGATIVE_INFINITY;
      let y1 = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < now.length; i += 4) {
        const delta = Math.max(
          Math.abs((now[i] ?? 0) - (base.data[i] ?? 0)),
          Math.abs((now[i + 1] ?? 0) - (base.data[i + 1] ?? 0)),
          Math.abs((now[i + 2] ?? 0) - (base.data[i + 2] ?? 0)),
        );
        if (delta > maxDelta) maxDelta = delta;
        if (delta > input.tolerance) {
          changed += 1;
          const pixel = i / 4;
          const x = pixel % width;
          const y = Math.floor(pixel / width);
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
      return {
        changed,
        total: now.length / 4,
        maxDelta,
        bbox: changed === 0 ? null : { x0, y0, x1, y1 },
        elapsedMs: performance.now() - t0,
      };
    },
    { waitMs, tolerance },
  );
}

/* ─────────────────── cell census: the hue-free figure read (A-1/A-3) ───────── */

/** RGB bytes — the token format every `theme()` ground value uses. */
export type RgbBytes = readonly [number, number, number];

/** One cell's figure, measured **through luma only** (a deliberate desaturation). */
export interface CellCensus {
  /** Pixels inside the sampled disc. */
  readonly total: number;
  /** Pixels whose luma differs from the cell's own ground luma by > threshold. */
  readonly ink: number;
  /** Ink inside `0.62 · outer` of the ink bbox — the probe's swirl aperture. */
  readonly innerInk: number;
  /** `0.62 · outer`, device px. */
  readonly aperture: number;
  /** Half the ink bbox's longer side, device px (`portal_probe.py`'s `outer`). */
  readonly outer: number;
  /** Ink bbox in canvas device px. */
  readonly bbox: { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number } | null;
  /** Ink per equal-radius bin, innermost first — "is there a *new* figure in some band?". */
  readonly profile: readonly number[];
  /** Mean RGB over the ink mask — the probe's `mean_ink_core`, measured on the board. */
  readonly core: RgbBytes;
  /** The cell's own ground luma, `0.2126 R + 0.7152 G + 0.0722 B` (0..255). */
  readonly groundLuma: number;
}

export interface CellCensusSpec {
  /** Cell centre in canvas **device** px. */
  readonly centre: { readonly x: number; readonly y: number };
  /** Sampling radius in device px — must stay inside the cell surface (see callers). */
  readonly radius: number;
  /** The cell's own ground token, as bytes (`theme(phase).ground.cell`). */
  readonly ground: RgbBytes;
  /** Luma step that counts as ink. Default 40 (a signed figure is ≥ 100 apart). */
  readonly threshold?: number;
  /** Radial profile bins. Default 12. */
  readonly bins?: number;
}

/**
 * Census one board cell **in luma only** — the instrument A-3 asks for by name.
 *
 * A-3 is load-bearing *because of what it must not use*: on the B ground the live
 * raster and the dormant vector are **1.03:1 / ΔL\* 1.0** apart, so a state read that
 * leans on value is a coin flip. The measurement therefore throws hue and value
 * *direction* away twice over: the pixel is reduced to Rec.709 luma on the
 * gamma-encoded bytes (what `filter: grayscale(1)` does) and the ink test is a step
 * **away from the cell's own ground**, so "brighter" and "darker" are the same event.
 * What survives is structure: how much ink, where in the radius profile, and whether
 * anything is inside the swirl aperture — the §3.1c primary channel.
 *
 * The disc mask (never a rectangle) is what keeps the census free of the cell's own
 * decoration: the rounded-corner plate and the R-C4 grid rule both sit outside the
 * inscribed circle the callers pass, so no structural pixel can ever masquerade as
 * figure ink.
 */
export async function cellCensus(page: Page, spec: CellCensusSpec): Promise<CellCensus> {
  return page.evaluate((input: CellCensusSpec): CellCensus => {
    const bins = input.bins ?? 12;
    const threshold = input.threshold ?? 40;
    const luma = (r: number, g: number, b: number): number => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const groundLuma = luma(input.ground[0], input.ground[1], input.ground[2]);

    const canvas = document.querySelector("canvas");
    if (canvas === null) throw new Error("[frames] no canvas");
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext("2d", { willReadFrequently: true });
    if (ctx === null) throw new Error("[frames] no 2d context");
    ctx.drawImage(canvas, 0, 0);
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;

    const r2 = input.radius * input.radius;
    const step = input.radius / bins;
    const profile = new Array<number>(bins).fill(0);
    const inkPx: { x: number; y: number; r: number }[] = [];
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let total = 0;
    for (let y = Math.max(0, Math.floor(input.centre.y - input.radius)); y <= input.centre.y + input.radius; y += 1) {
      if (y >= copy.height) break;
      for (let x = Math.max(0, Math.floor(input.centre.x - input.radius)); x <= input.centre.x + input.radius; x += 1) {
        if (x >= copy.width) break;
        const dx = x + 0.5 - input.centre.x;
        const dy = y + 0.5 - input.centre.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        total += 1;
        const i = (y * copy.width + x) * 4;
        const value = luma(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
        if (Math.abs(value - groundLuma) <= threshold) continue;
        sumR += data[i] ?? 0;
        sumG += data[i + 1] ?? 0;
        sumB += data[i + 2] ?? 0;
        const r = Math.sqrt(d2);
        const bin = Math.min(bins - 1, Math.floor(r / step));
        profile[bin] = (profile[bin] ?? 0) + 1;
        inkPx.push({ x, y, r });
      }
    }

    if (inkPx.length === 0) {
      return {
        total,
        ink: 0,
        innerInk: 0,
        aperture: 0,
        outer: 0,
        bbox: null,
        profile,
        core: [0, 0, 0],
        groundLuma,
      };
    }
    let x0 = Number.POSITIVE_INFINITY;
    let y0 = Number.POSITIVE_INFINITY;
    let x1 = Number.NEGATIVE_INFINITY;
    let y1 = Number.NEGATIVE_INFINITY;
    for (const pixel of inkPx) {
      if (pixel.x < x0) x0 = pixel.x;
      if (pixel.x > x1) x1 = pixel.x;
      if (pixel.y < y0) y0 = pixel.y;
      if (pixel.y > y1) y1 = pixel.y;
    }
    const outer = Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2;
    const aperture = 0.62 * outer;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    let innerInk = 0;
    for (const pixel of inkPx) {
      if (Math.hypot(pixel.x - cx, pixel.y - cy) < aperture) innerInk += 1;
    }
    return {
      total,
      ink: inkPx.length,
      innerInk,
      aperture,
      outer,
      bbox: { x0, y0, x1, y1 },
      profile,
      core: [sumR / inkPx.length, sumG / inkPx.length, sumB / inkPx.length],
      groundLuma,
    };
  }, spec);
}

/** A per-bin comparison of two radial insk profiles — "no extra figure in any band". */
export interface ProfileDelta {
  /** Worst absolute per-bin difference. */
  readonly maxBinDelta: number;
  /** The bin that carried it. */
  readonly worstBin: number;
  /** Worst difference as a fraction of the larger profile's total. */
  readonly maxBinShare: number;
}

/** Compare two {@link CellCensus} profiles bin by bin. */
export function profileDelta(a: readonly number[], b: readonly number[]): ProfileDelta {
  const sumA = a.reduce((acc, v) => acc + v, 0);
  const sumB = b.reduce((acc, v) => acc + v, 0);
  const scale = Math.max(sumA, sumB) || 1;
  let maxBinDelta = 0;
  let worstBin = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const delta = Math.abs((a[i] ?? 0) - (b[i] ?? 0));
    if (delta > maxBinDelta) {
      maxBinDelta = delta;
      worstBin = i;
    }
  }
  return { maxBinDelta, worstBin, maxBinShare: maxBinDelta / scale };
}

/** `true` when the whole bbox lies inside `rect` (device px), with `margin` px of slack. */
export function bboxWithin(
  bbox: FrameDiff["bbox"],
  rect: { readonly x: number; readonly y: number; readonly w: number; readonly h: number },
  margin = 2,
): boolean {
  if (bbox === null) return true;
  return (
    bbox.x0 >= rect.x - margin &&
    bbox.y0 >= rect.y - margin &&
    bbox.x1 <= rect.x + rect.w + margin &&
    bbox.y1 <= rect.y + rect.h + margin
  );
}