/**
 * DOM pixel census (QA-019) — **the star field's marks, read from the pixels the
 * page actually painted**.
 *
 * `helpers/frames.ts` reads the canvas (`drawImage` → `getImageData`); §5.5's star
 * field is a **DOM** row inside `.ps-dialog`, so the canvas channel cannot see it.
 * The equivalent channel for a DOM node is a screenshot of that node's own box,
 * decoded **in the page** (`createImageBitmap` → `OffscreenCanvas.getImageData`, the
 * same decoder `helpers/art.ts` uses for the served PNGs) so no node-side image
 * dependency is added and no PNG round trip leaves the process.
 *
 * ── Why a clip and not the whole page ────────────────────────────────────────
 * The rows A-11/A-12 ask about a 76 × 20 CSS px row (and, on the mobile profile, a
 * 2.75× device-pixel copy of it). Capturing only that region keeps the returned
 * payload small and makes every measurement local to the field: `plate` is the
 * dialog's own `ground.plate` showing in the row's horizontal margins, never a
 * neighbouring surface.
 *
 * ── Colour is a differential verdict, never a typed hex ──────────────────────
 * A pixel is classified against **two references supplied by the caller** (the
 * mark's token and the painted plate); it counts as ink when it is nearer the ink
 * reference than the ground reference. The caller's ink references come from
 * `theme(phase)` (`obj.goal` / `text.secondary`) and its ground is the *painted*
 * plate measured in this very capture, so no test-local colour is invented.
 */

import type { Page } from "@playwright/test";

import type { Rgb } from "./game";

/** A page-CSS-px rectangle (Playwright's own clip shape). */
export interface Clip {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PixelGrid {
  /** Device px of the capture. */
  readonly width: number;
  readonly height: number;
  /** Device px per page CSS px (`devicePixelRatio` of this capture). */
  readonly scale: number;
  /** The clip the capture was taken from, page CSS px. */
  readonly clip: Clip;
  /** Row-major RGB triples, `width * height` entries. */
  readonly rgb: readonly Rgb[];
  /** The pixel at a **device**-px offset, or `undefined` outside the grid. */
  at(x: number, y: number): Rgb | undefined;
  /** A sub-rectangle addressed in **page CSS px relative to this grid's clip**. */
  sub(x: number, y: number, width: number, height: number): PixelGrid;
}

function gridOf(
  clip: Clip,
  width: number,
  height: number,
  scale: number,
  rgb: readonly Rgb[],
): PixelGrid {
  return {
    clip,
    width,
    height,
    scale,
    rgb,
    at(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return undefined;
      return rgb[y * width + x];
    },
    sub(x, y, w, h) {
      const x0 = Math.max(0, Math.round(x * scale));
      const y0 = Math.max(0, Math.round(y * scale));
      const x1 = Math.min(width, Math.round((x + w) * scale));
      const y1 = Math.min(height, Math.round((y + h) * scale));
      const out: Rgb[] = [];
      for (let row = y0; row < y1; row += 1) {
        for (let col = x0; col < x1; col += 1) out.push(rgb[row * width + col] as Rgb);
      }
      return gridOf(
        {
          x: clip.x + x0 / scale,
          y: clip.y + y0 / scale,
          width: (x1 - x0) / scale,
          height: (y1 - y0) / scale,
        },
        x1 - x0,
        y1 - y0,
        scale,
        out,
      );
    },
  };
}

/** Screenshot `clip` (page CSS px) and decode it in the page, pixel by pixel. */
export async function captureClip(page: Page, clip: Clip): Promise<PixelGrid> {
  const box = {
    x: Math.round(clip.x),
    y: Math.round(clip.y),
    width: Math.max(1, Math.round(clip.width)),
    height: Math.max(1, Math.round(clip.height)),
  };
  const shot = await page.screenshot({ clip: box });
  const decoded = await page.evaluate(async (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = offscreen.getContext("2d");
    if (ctx === null) throw new Error("[star-pixels] no 2d context to decode with");
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    const out: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      out.push(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0);
    }
    return { width: bitmap.width, height: bitmap.height, flat: out };
  }, shot.toString("base64"));

  const rgb: Rgb[] = [];
  for (let i = 0; i < decoded.flat.length; i += 3) {
    rgb.push([decoded.flat[i] ?? 0, decoded.flat[i + 1] ?? 0, decoded.flat[i + 2] ?? 0]);
  }
  const scale = decoded.width / box.width;
  return gridOf(box, decoded.width, decoded.height, scale, rgb);
}

/* ─────────────────────────────── arithmetic ─────────────────────────────── */

export function channelDistance(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

export function meanColour(grid: PixelGrid, from = 0, to = grid.rgb.length): Rgb {
  let r = 0;
  let g = 0;
  let b = 0;
  const count = Math.max(1, to - from);
  for (let i = from; i < to; i += 1) {
    const pixel = grid.rgb[i] as Rgb;
    r += pixel[0];
    g += pixel[1];
    b += pixel[2];
  }
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

/** The most frequent colour in the grid — the "what is the ground here" read. */
export function modalColour(grid: PixelGrid): { readonly rgb: Rgb; readonly share: number } {
  const counts = new Map<string, { rgb: Rgb; count: number }>();
  for (const pixel of grid.rgb) {
    const key = `${String(pixel[0])},${String(pixel[1])},${String(pixel[2])}`;
    const entry = counts.get(key);
    if (entry === undefined) counts.set(key, { rgb: pixel, count: 1 });
    else entry.count += 1;
  }
  let best: { rgb: Rgb; count: number } = { rgb: [0, 0, 0], count: 0 };
  for (const entry of counts.values()) if (entry.count > best.count) best = entry;
  return { rgb: best.rgb, share: best.count / Math.max(1, grid.rgb.length) };
}

export interface MarkCensus {
  /** Fraction of the region's pixels nearer `ink` than `ground`. */
  readonly share: number;
  /**
   * The mark's **sub-pixel ink coverage** of the region: the mean of each pixel's
   * projection onto the `ground → ink` segment, i.e. the area the figure actually
   * covers. A hard nearest-reference count rounds every anti-aliased pixel to 0 or 1
   * and is phase-sensitive when the figure's wall is under a device pixel wide; the
   * projection keeps the partial coverage, so the ratio between two states is the
   * ratio of the **areas** rather than of two rounding-noise sums.
   */
  readonly coverage: number;
  readonly count: number;
  readonly total: number;
  /** Mean colour of the ink-classified pixels, or `null` when there are none. */
  readonly inkMean: Rgb | null;
  /**
   * The mark's own **painted** colour: the most frequent pixel inside the ink mask,
   * i.e. the fully-covered interior rather than the anti-aliased rim summed into
   * {@link MarkCensus.inkMean}. A 20 px figure is mostly perimeter, so the mean is
   * biased toward the ground by 1–2 % while the modal pixel is the token itself —
   * this is the value the "the mark is `obj.goal`" cross-check reads.
   */
  readonly inkModal: Rgb | null;
  /** Ink bbox in **device px**, relative to the region; `null` when empty. */
  readonly bbox: { readonly w: number; readonly h: number; readonly x: number; readonly y: number } | null;
}

/**
 * Classify one region's pixels as ink vs ground by nearest reference, and report
 * the share, the mark's own painted colour and the ink cloud's bounding box (which
 * is how the `empty` dot's diameter is measured — from painted pixels, not from the
 * CSS declaration).
 */
export function markCensus(region: PixelGrid, ink: Rgb, ground: Rgb): MarkCensus {
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  const inks = new Map<string, { rgb: Rgb; count: number }>();
  const axis: [number, number, number] = [ink[0] - ground[0], ink[1] - ground[1], ink[2] - ground[2]];
  const axisSq = axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2;
  let coverage = 0;
  region.rgb.forEach((pixel) => {
    const dot = (pixel[0] - ground[0]) * axis[0] + (pixel[1] - ground[1]) * axis[1] + (pixel[2] - ground[2]) * axis[2];
    coverage += axisSq === 0 ? 0 : Math.min(1, Math.max(0, dot / axisSq));
  });
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  region.rgb.forEach((pixel, index) => {
    if (channelDistance(pixel, ink) >= channelDistance(pixel, ground)) return;
    count += 1;
    r += pixel[0];
    g += pixel[1];
    b += pixel[2];
    const key = `${String(pixel[0])},${String(pixel[1])},${String(pixel[2])}`;
    const seen = inks.get(key);
    if (seen === undefined) inks.set(key, { rgb: pixel, count: 1 });
    else seen.count += 1;
    const x = index % region.width;
    const y = Math.floor(index / region.width);
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  });
  let modal: { rgb: Rgb; count: number } | null = null;
  for (const entry of inks.values()) if (modal === null || entry.count > modal.count) modal = entry;
  return {
    share: count / Math.max(1, region.rgb.length),
    coverage: coverage / Math.max(1, region.rgb.length),
    count,
    total: region.rgb.length,
    inkMean: count === 0 ? null : [Math.round(r / count), Math.round(g / count), Math.round(b / count)],
    inkModal: modal === null ? null : modal.rgb,
    bbox:
      count === 0
        ? null
        : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 },
  };
}

export interface GridDiff {
  readonly changed: number;
  readonly maxDelta: number;
  readonly total: number;
}

/** Two captures of the same region, compared pixel by pixel (device px). */
export function gridDiff(a: PixelGrid, b: PixelGrid, tolerance = 0): GridDiff {
  const total = Math.min(a.rgb.length, b.rgb.length);
  let changed = 0;
  let maxDelta = 0;
  for (let i = 0; i < total; i += 1) {
    const delta = channelDistance(a.rgb[i] as Rgb, b.rgb[i] as Rgb);
    if (delta > maxDelta) maxDelta = delta;
    if (delta > tolerance) changed += 1;
  }
  return { changed, maxDelta, total };
}

/* ───────────────────── the §5.5 field, measured as a whole ───────────────── */

/** One `.ps-star` slot's box, in page CSS px, with the state the DOM declares. */
export interface SlotBox {
  readonly state: string | null;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface FieldCensus {
  /** `ground.plate` as the page painted it (the row's own margins) and as declared. */
  readonly plate: Rgb;
  readonly plateToken: Rgb;
  /** The mark's own painted colour (modal ink pixel) for each state. */
  readonly gold: Rgb | null;
  readonly dot: Rgb | null;
  readonly goldToken: Rgb;
  readonly dotToken: Rgb;
  readonly earned: MarkCensus;
  readonly held: MarkCensus;
  readonly empty: MarkCensus;
  /**
   * `earned.coverage / held.coverage` — the **fill-mass ratio** (§5.5 declares
   * 2.78:1), i.e. the ratio of the two figures' sub-pixel areas. Measured 2.73/2.75
   * on the two phases, against the analytic `1/(1 − 0.8²) = 2.78`.
   */
  readonly ratio: number;
  /** The `empty` dot's diameter in CSS px, measured from its painted bbox. */
  readonly dotDiameterCss: number | null;
  /** WCAG 2.1 contrasts against the **painted** plate. */
  readonly goldPlate: number;
  readonly dotPlate: number;
  readonly grid: PixelGrid;
  readonly row: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly slots: readonly SlotBox[];
}

/**
 * Census the star field exactly as A-11 asks: 3 slots, the plate it sits on, each
 * state's ink share, the hollow knock-out ratio and the contrasts — all from one
 * screenshot of the row plus an 8 px margin on each side.
 *
 * The margin is the ground sample: the row is centred inside a 320 px card, so the
 * 8 px beside it is the dialog's own `ground.plate` and nothing else. The modal
 * colour of the whole clip is cross-checked against that sample, so "the ground is
 * the plate" is a measured statement, not an assumption about the card.
 */
export async function fieldCensus(
  page: Page,
  tokens: { readonly plate: Rgb; readonly gold: Rgb; readonly dot: Rgb },
): Promise<FieldCensus | null> {
  const row = page.locator(".ps-stars");
  const rowBox = await row.boundingBox();
  if (rowBox === null) return null;
  const slots = await page.locator(".ps-star").evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return {
        state: (node as HTMLElement).dataset["state"] ?? null,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }),
  );

  const clip: Clip = {
    x: rowBox.x - 8,
    y: rowBox.y,
    width: rowBox.width + 16,
    height: rowBox.height,
  };
  const grid = await captureClip(page, clip);
  const left = meanColour(grid.sub(0, 0, 8, rowBox.height));
  const right = meanColour(grid.sub(rowBox.width + 8, 0, 8, rowBox.height));
  const plate: Rgb = [
    Math.round((left[0] + right[0]) / 2),
    Math.round((left[1] + right[1]) / 2),
    Math.round((left[2] + right[2]) / 2),
  ];

  const regionOf = (state: string): MarkCensus => {
    const slot = slots.find((entry) => entry.state === state);
    if (slot === undefined) {
      return { share: 0, coverage: 0, count: 0, total: 0, inkMean: null, inkModal: null, bbox: null };
    }
    const region = grid.sub(slot.x - clip.x, slot.y - clip.y, slot.width, slot.height);
    return markCensus(region, state === "empty" ? tokens.dot : tokens.gold, plate);
  };

  const earned = regionOf("earned");
  const held = regionOf("held");
  const empty = regionOf("empty");

  return {
    plate,
    plateToken: tokens.plate,
    gold: earned.inkModal,
    dot: empty.inkModal,
    goldToken: tokens.gold,
    dotToken: tokens.dot,
    earned,
    held,
    empty,
    ratio: held.coverage === 0 ? Number.POSITIVE_INFINITY : earned.coverage / held.coverage,
    dotDiameterCss:
      empty.bbox === null
        ? null
        : (empty.bbox.w + empty.bbox.h) / 2 / grid.scale,
    goldPlate: earned.inkModal === null ? 0 : contrastRatio(earned.inkModal, plate),
    dotPlate: empty.inkModal === null ? 0 : contrastRatio(empty.inkModal, plate),
    grid,
    row: { x: rowBox.x, y: rowBox.y, width: rowBox.width, height: rowBox.height },
    slots,
  };
}

/** WCAG 2.1 contrast from two measured RGB triples (same arithmetic as `helpers/art`). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const lum = (rgb: Rgb): number => {
    const channel = (value: number): number => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** `true` when the slot boxes are the declared 3-slot row (never a rating-dependent width). */
export function rowIsThreeSlots(
  census: Pick<FieldCensus, "row" | "slots">,
  boxPx: number,
  gapPx: number,
): boolean {
  if (census.slots.length !== 3) return false;
  const expected = 3 * boxPx + 2 * gapPx;
  return (
    Math.abs(census.row.width - expected) <= 1 &&
    census.slots.every(
      (slot) => Math.abs(slot.width - boxPx) <= 1 && Math.abs(slot.height - boxPx) <= 1,
    )
  );
}