/**
 * Served-art census (QA-017) — **the delivered bytes, measured from the page that
 * loaded them**.
 *
 * The §3.1e acceptance rows A-2 and A-3 are measurements *of the signed rasters*:
 * "the mapped contrast reads ≥ 6.2:1 on the mount order's own ground" and "the B
 * value backup is 1.0, so the read must be structural". Both are properties of the
 * files, so both must be read from **the bytes the game's own loader received** —
 * not from a copy in the repo, not from a re-typed hex, and not from a screenshot
 * (where the board's ground, the cross-fade and the display profile would all
 * contaminate the number).
 *
 * Two mechanics, both borrowed from the standing probes so the arithmetic cannot
 * drift from `docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py`:
 *
 * - the URL is **not** written here: it is read out of
 *   `performance.getEntriesByType("resource")` by matching the manifest export name
 *   from `theme/assets.ts` (a build that hashes or renames the file still resolves,
 *   and a degrade round simply finds nothing);
 * - the decode is `createImageBitmap` + `OffscreenCanvas.getImageData` — the same
 *   bytes, the same `getImageData` channel
 *   `tests/e2e/helpers/game.ts#decodeSpiritCentre` already uses.
 *
 * The probe's own apertures are reproduced verbatim: **ink** = `alpha >= 128`,
 * **outer** = half the ink bbox's longer side, **swirl aperture** = `r < 0.62 ·
 * outer`, **core** = the mean RGB over the ink mask (`mean_ink_core`). The WCAG
 * contrast arithmetic stays in the caller, because the *ground* is a token
 * (`theme(phase).ground.cell`), not a pixel of this file.
 */

import type { Page } from "@playwright/test";

/** The measured facts of one served raster. */
export interface PngCensus {
  /** The URL the page's loader actually fetched. */
  readonly url: string;
  readonly width: number;
  readonly height: number;
  /** Pixels with `alpha >= 128` — the probe's ink census. */
  readonly ink: number;
  /** Mean RGB over the ink mask (the probe's `mean_ink_core`). */
  readonly core: readonly [number, number, number];
  /** Ink bbox, in the file's own px. */
  readonly bbox: { readonly x0: number; readonly y0: number; readonly x1: number; readonly y1: number };
  /** bbox centre. */
  readonly centre: { readonly x: number; readonly y: number };
  /** Half the bbox's longer side — the probe's `outer`. */
  readonly outer: number;
  /** The swirl aperture limit in px (`0.62 · outer`). */
  readonly aperture: number;
  /** Ink inside the swirl aperture. */
  readonly innerInk: number;
  /** Distinct RGB triples over the ink mask — a sanity check that a figure was read. */
  readonly distinct: number;
}

interface CensusInput {
  readonly assetName: string;
  readonly inkAlpha: number;
  readonly swirlFrac: number;
}

const cache = new WeakMap<Page, Map<string, Promise<PngCensus | null>>>();

/**
 * Decode one delivered PNG **from the page's own resource log** and census it, or
 * `null` when the file never arrived (degrade round / 404 / blocked).
 */
export async function servedPngCensus(page: Page, assetName: string): Promise<PngCensus | null> {
  let perPage = cache.get(page);
  if (perPage === undefined) {
    perPage = new Map<string, Promise<PngCensus | null>>();
    cache.set(page, perPage);
  }
  const cached = perPage.get(assetName);
  if (cached !== undefined) return cached;

  const pending = page.evaluate(async (input: CensusInput): Promise<PngCensus | null> => {
    const url = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      // The **pathname**, not the raw name: a dev server is free to append a query
      // (`?import&url`, vite's module-transform entry) or a cache-buster, and a hashed
      // build is free to rewrite the basename's directory. Matching the last path
      // segment keeps the lookup on the manifest export name — the one string
      // `theme/assets.ts` owns — instead of pinning a URL shape this file has no
      // business knowing.
      .filter((name) => {
        try {
          return new URL(name, window.location.href).pathname.endsWith(`/${input.assetName}.png`);
        } catch {
          return false;
        }
      });
    if (url.length === 0) return null;
    try {
      // …and then the **bytes**, not the first URL that matched: vite's dev server
      // serves a `?url` import twice — once as a module transform (a few hundred bytes
      // of JavaScript, which is what a naive `find` picks up and what
      // `createImageBitmap` refuses with "the source image could not be decoded") and
      // once as the file itself. The image content type is the discriminator, so a
      // future build shape cannot silently pick the wrong one.
      let bitmap: ImageBitmap | null = null;
      let usedUrl = url[0] ?? "";
      for (const candidate of url) {
        const response = await fetch(candidate);
        if (!response.ok) continue;
        const blob = await response.blob();
        if (!blob.type.startsWith("image/")) continue;
        try {
          bitmap = await createImageBitmap(blob);
          usedUrl = candidate;
          break;
        } catch {
          continue;
        }
      }
      if (bitmap === null) return null;
      const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = offscreen.getContext("2d", { willReadFrequently: true });
      if (ctx === null) return null;
      ctx.drawImage(bitmap, 0, 0);
      const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;

      // ── the ink mask and its bbox (portal_probe.py's `mask_radii`) ──────────
      let ink = 0;
      let x0 = Number.POSITIVE_INFINITY;
      let y0 = Number.POSITIVE_INFINITY;
      let x1 = Number.NEGATIVE_INFINITY;
      let y1 = Number.NEGATIVE_INFINITY;
      const rgbSeen = new Set<number>();
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] ?? 0) < input.inkAlpha) continue;
        ink += 1;
        const pixel = i / 4;
        const x = pixel % bitmap.width;
        const y = Math.floor(pixel / bitmap.width);
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
        if (rgbSeen.size < 4096) {
          rgbSeen.add(((data[i] ?? 0) << 16) | ((data[i + 1] ?? 0) << 8) | (data[i + 2] ?? 0));
        }
      }
      if (ink === 0) return null;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const outer = Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2;
      const aperture = input.swirlFrac * outer;

      // ── the core mean and the swirl aperture, in one pass ──────────────────
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let innerInk = 0;
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] ?? 0) < input.inkAlpha) continue;
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        sumR += r;
        sumG += g;
        sumB += b;
        const pixel = i / 4;
        const x = pixel % bitmap.width;
        const y = Math.floor(pixel / bitmap.width);
        if (Math.hypot(x - cx, y - cy) < aperture) innerInk += 1;
      }
      return {
        url: usedUrl,
        width: bitmap.width,
        height: bitmap.height,
        ink,
        core: [sumR / ink, sumG / ink, sumB / ink] as [number, number, number],
        bbox: { x0, y0, x1, y1 },
        centre: { x: cx, y: cy },
        outer,
        aperture,
        innerInk,
        distinct: rgbSeen.size,
      };
    } catch {
      return null;
    }
  }, { assetName, inkAlpha: 128, swirlFrac: 0.62 });

  perPage.set(assetName, pending);
  return pending;
}

/* ───────────────────────── WCAG 2.1 relative luminance ──────────────────── */

/** The `#rrggbb` token pair as bytes — callers pass `theme(phase).ground.cell`. */
export type Rgb = readonly [number, number, number];

/** WCAG 2.1 SC 1.4.11 relative luminance (sRGB linearisation, then Rec. 709). */
export function relativeLuminance(rgb: Rgb): number {
  const linear = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

/** WCAG contrast ratio between two luminances — `(hi + 0.05) / (lo + 0.05)`. */
export function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/** `contrastRGB(x, y)` — the probe's `cr()`, one call. */
export function contrastRGB(a: Rgb, b: Rgb): number {
  return contrastRatio(relativeLuminance(a), relativeLuminance(b));
}

/** `#rrggbb` → bytes (the token format every `theme()` value uses). */
export function hexToRgb(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}