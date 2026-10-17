/**
 * QA-017 — **the §6.6 art+motion acceptance surface** (GAME-003, `docs/ui-ux.md`
 * V0.9.6 §3.1e + §6.6, acceptance rows **A-1…A-10**).
 *
 * The unit tier (`tests/unit/portal-mount-acceptance.test.ts`) already proves every
 * claim that is *structural* — the mapping table, the box/pivot arithmetic, the
 * arrival-turn function, the additive attract ceiling, the deny list as a set. This
 * file is the other half, and the split is deliberate: **everything here is measured
 * from the running page** — the bytes its own loader fetched, the pixels it actually
 * presented, and the computed style it actually applied. Nothing in this file
 * re-derives a game value; it reproduces a *measurement*.
 *
 * ── The two instruments, and why these two ───────────────────────────────────
 * 1. **Served bytes** (`helpers/art.ts`): A-2's contrast numbers are properties of the
 *    signed rasters, so they are read from the files the page fetched — through the
 *    same apertures as `docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py`,
 *    with the *ground* supplied as a token, never as a pixel of the raster. A
 *    screenshot would fold the board, the cross-fade and the display profile into the
 *    number; that is how a contrast claim becomes unfalsifiable.
 * 2. **Presented pixels** (`helpers/frames.ts`): A-1/A-3/A-5/A-8/A-9/A-10 are
 *    questions about *what moved where*. Two read-backs of the canvas, diffed
 *    in-page, plus a **luma-only cell census** for the figure read (A-3 is
 *    load-bearing exactly because its value channel measures 1.0, so the census
 *    throws hue away twice over — see `cellCensus`).
 *
 * ── What this file does NOT claim ────────────────────────────────────────────
 * - **A-6's B10 hysteresis is not observable from pixels** at a +2 % attract over a
 *   ±6 % idle pulse under a 2.4 s period: the second trigger's pixel effect is inside
 *   the noise of the first beat's own composited alpha. The constants
 *   (`board-view.ts:132-133`), the predicate (`:136`) and the scalar channel (`:757`)
 *   are private with no page hook, so the *contract* is proven in the unit tier and
 *   the testability gap is filed in `tests/e2e/README.md` — never worked around by
 *   inferring a private number from a screenshot.
 * - **A-7's literal "computed transform at 45 ms = 0.97"** is unreachable inside its
 *   own window: `ease-out` over 90 ms reaches 0.97 only at the window's end. The row
 *   below *measures* the transform instead and reports both the 45 ms reading and the
 *   settled hold, so the report carries a number where the spec carries an
 *   impossibility (already reported by GAME-003, not silently re-specified here).
 *
 * ── Row → evidence map ───────────────────────────────────────────────────────
 * | row | where |
 * |---|---|
 * | A-1 | the manifest rows + `portalSlotFor` (no page) and the painted pair's figure agreement (page) |
 * | A-2 | served-raster contrast, both directions, both phases |
 * | A-3 | the same tile dormant (vector) vs live (raster), luma-only, + the served 1.03:1 value trap |
 * | A-4 | unit tier (box 0.888 / centre pivot / slot order) — the painted *size* is re-measured here in A-1's bbox agreement |
 * | A-5 | rAF transient capture on the far end + the pair's settled figure agreement |
 * | A-7 | the pressed button's own transform samples + the panel's onset, animation and first-frame input |
 * | A-8 | two presented frames 2 s apart, union bbox vs the goal's own cell rect |
 * | A-9 | the same rows under `emulateMedia(reducedMotion: reduce)` |
 * | A-10 | idle on a board carrying walls/echoes/doors/switches/portals + entry/Undo/Restart + the DOM's own stillness |
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { isAltCell } from "@/game/renderer/grid-mapping";
import {
  PLACEHOLDER_SLOTS,
  PLACEHOLDER_TO_ASSET,
  assertNoPlaceholders,
  portalSlotFor,
  unresolvedAssetIds,
} from "@/game/theme/assets";
import { flipTimings, theme } from "@/game/theme/tokens";

import { contrastRGB, hexToRgb, servedPngCensus } from "./helpers/art";
import type { PngCensus } from "./helpers/art";
import { reportTransient, roiAround, startRecorder, stopRecorder } from "./helpers/capture";
import {
  bboxWithin,
  captureFrame,
  cellCensus,
  frameDiffAfter,
  profileDelta,
} from "./helpers/frames";
import type { CellCensus, RgbBytes } from "./helpers/frames";
import {
  boardGeometry,
  expectNoPageErrors,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  pressRestartKey,
  pressRoute,
  pressUndoKey,
  settle,
  watchErrors,
} from "./helpers/game";
import type { BoardGeometry } from "./helpers/game";
import { levelUrl, loadReferenceLevels, refOf } from "./helpers/levels";

const REFS = loadReferenceLevels();
/** L11 is the dataset's portal debut (M2) and the board every §3.1e row was audited on. */
const PORTAL_LEVEL_ID = 11;
const PORTAL = refOf(REFS, PORTAL_LEVEL_ID);
/** L1 — 5×3, par 4: the cheapest board that carries the goal and nothing else to distract. */
const SIMPLE_LEVEL_ID = 1;
const SIMPLE = refOf(REFS, SIMPLE_LEVEL_ID);

/** `portalSlotFor`'s two rows, read from the exported resolver (never a literal name). */
const SLOT_A = portalSlotFor("A");
const SLOT_B = portalSlotFor("B");
/** The swap law's two manifest export names, derived — `portal_a` / `portal_b`. */
const PORTAL_ASSET_NAMES = [SLOT_A?.assetName, SLOT_B?.assetName] as const;

/** The shipped pair's two ends, read out of the level file — never typed into the test. */
const PAIR = PORTAL.level.portals[0]?.pair ?? [];
const END_LIVE: readonly [number, number] = PAIR[0] ?? [0, 0];
const END_FAR: readonly [number, number] = PAIR[1] ?? [0, 0];
/** The par route's first leg: the cheapest legal press, and the one that lights the pair. */
const FIRST_LEG = PORTAL.legs[0];

/** The ground token a tile actually sits on (`isAltCell` is the renderer's own rule). */
function groundOf(phase: "A" | "B", x: number, y: number): string {
  const ground = theme(phase).ground;
  return isAltCell(x, y) ? ground.cellAlt : ground.cell;
}

/** The cell rect in canvas **device** px — `computeLayout`'s own arithmetic. */
function cellRect(
  geometry: BoardGeometry,
  tile: readonly [number, number],
): { x: number; y: number; w: number; h: number } {
  const { layout } = geometry;
  return {
    x: Math.round(layout.grid.x + tile[0] * layout.cellSize),
    y: Math.round(layout.grid.y + tile[1] * layout.cellSize),
    w: Math.round(layout.cellSize),
    h: Math.round(layout.cellSize),
  };
}

/**
 * Census one portal end's cell.
 *
 * The sampling disc is `0.45 × cell`, which is inside the cell *surface*
 * (half-side `0.47 × cell` after R-L3's 6 % gutter) and outside nothing the figure
 * needs (the raster's ink bbox is `0.70 × cell`). A rectangle would have dragged the
 * rounded-corner plate and the R-C4 grid rule into the ink census; a disc cannot.
 */
async function portalEndCensus(
  page: Page,
  geometry: BoardGeometry,
  phase: "A" | "B",
  tile: readonly [number, number],
): Promise<CellCensus> {
  return cellCensus(page, {
    centre: geometry.cellCenterDevice(tile[0], tile[1]),
    radius: geometry.layout.cellSize * 0.45,
    ground: hexToRgb(groundOf(phase, tile[0], tile[1])) as RgbBytes,
  });
}

/** Max per-channel distance between two RGB triples. */
function rgbDistance(a: RgbBytes, b: RgbBytes): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

/** The two numbers a rounded number is worth quoting with — a stable report shape. */
function r2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * CSS Easing L1's keyword → control points.
 *
 * `getComputedStyle` reports a timing function in its **specified** form: Chromium
 * serialises the declared `ease-out` as the keyword `"ease-out"`, never as the bezier
 * it denotes. So the analytic model below cannot just assume every declaration is
 * expanded — it has to carry the spec's own keyword table and read the declaration
 * into it, which is also what makes the assertion falsifiable: change the declaration
 * to `linear` and the model follows it and the crossings move.
 */
const EASING_KEYWORDS: Readonly<Record<string, readonly [number, number, number, number]>> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
};

/** Parse the other form a declaration may take: `cubic-bezier(a, b, c, d)`. */
function parseBezier(value: string): readonly [number, number, number, number] | null {
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(value.trim());
  if (match === null) return null;
  const parts = (match[1] ?? "").split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((value2) => !Number.isFinite(value2))) return null;
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 0];
}

/** The easing a declaration denotes, as control points — read, never assumed. */
function easingPoints(
  value: string | null | undefined,
): readonly [number, number, number, number] | null {
  if (typeof value !== "string") return null;
  return EASING_KEYWORDS[value.trim()] ?? parseBezier(value);
}

/**
 * The declared curve, evaluated at a normalised time `x` — the analytic model named
 * by the declaration the pressed element actually carries.
 *
 * A CSS timing function is **parametric, not `y(x)`**: the browser walks the curve
 * `(X(t), Y(t))`, solves `X(t) = x` for the parameter and *then* reads `Y(t)`. That
 * is exactly what happens below — a bisection on `X(t) - x` over `t ∈ [0, 1]`
 * (monotone in `t`, so it is well posed), then `Y(t)`. Writing a direct `y = f(x)`
 * would have produced a number for a curve the browser never uses, which is the
 * mistake A-7's own sentence makes on its own terms.
 *
 * 60 halvings put `t` inside double precision.
 */
function bezierFraction(x: number, points: readonly [number, number, number, number]): number {
  const [x1, y1, x2, y2] = points;
  const axis = (t: number, p1: number, p2: number): number => {
    const u = 1 - t;
    return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
  };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (axis(mid, x1, x2) < x) lo = mid;
    else hi = mid;
  }
  return axis((lo + hi) / 2, y1, y2);
}

/**
 * The **inverse** of {@link bezierFraction}: the normalised *time* at which the
 * declared curve reaches `value` of its travel. Bisection again, over the already
 * inverted function — the same 60 halvings.
 *
 * This is the quantity A-7's sentence is really about when it says "the transform
 * at 45 ms": the curve is not linear, so the half-way *value* is reached at
 * `t = 0.5` → `X = 0.3425` → **30.8 ms**, not at 45 ms. Measuring the *crossing*
 * is what the row can resolve — the two models are 14 ms apart there, while the
 * difference in *value* at 45 ms (0.0056 of scale, on a travel of 0.03) sits under
 * the frame grid's own noise.
 */
function bezierTimeAt(value: number, points: readonly [number, number, number, number]): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (bezierFraction(mid, points) < value) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

test.describe("§3.1e R-PM5 / A-1 — the pair is mounted, and the K-4 negative is superseded", () => {
  test("the manifest carries both portal rows and the swap law resolves from them", () => {
    // The dev strip's *literal* A-1 wording ("lists A-06 portal_a / portal_b") is
    // unreachable in the mounted state by construction: the strip exists to list
    // UNRESOLVED slots, and since R-005b/UA-0013 there are none, so it renders
    // hidden. Printing it to satisfy a sentence would be theatre. The claim the
    // sentence carries — *the pair is mounted under A-06* — is checked here at the
    // level the strip reads from (R-P5's single table), and the wording conflict is
    // recorded in tests/e2e/README.md rather than edited into the spec.
    // A-06 is shared with the goal slot, so the pair is selected by its *placeholder*
    // — the manifest name the dev strip prints — never by the Asset ID alone.
    const portalRows = PLACEHOLDER_SLOTS.filter((slot) => slot.placeholder.startsWith("portal_"));
    const names = portalRows.map((slot) => slot.placeholder).sort();

    expect(names).toEqual(["portal_a", "portal_b"]);
    for (const slot of portalRows) {
      expect(slot.assetId, `A-06 ${slot.placeholder}`).toBe("A-06");
      expect(slot.resolved, `A-06 ${slot.placeholder} is a resolved row`).toBe(true);
      expect(slot.assetName, `${slot.placeholder}'s texture key is its manifest export name`).toMatch(
        /^portal_[ab]$/,
      );
    }

    // The deliberate supersession: Entry-3's K-4 probe measured `portalMentioned:
    // false` (no slot, no entry). The derived map gaining those two rows **is** that
    // probe's re-pointing, and it is positive evidence rather than a deleted line.
    expect(PLACEHOLDER_TO_ASSET["portal_a"]).toBe("A-06");
    expect(PLACEHOLDER_TO_ASSET["portal_b"]).toBe("A-06");

    // R-PM1 — the mapping is measured, and the two rows are *exchanged*, so neither
    // the suffix convention nor a single-row shortcut can satisfy this.
    expect(SLOT_A?.assetName).toBe("portal_b");
    expect(SLOT_B?.assetName).toBe("portal_a");
    expect(SLOT_A?.assetName).not.toBe(SLOT_B?.assetName);
    expect(PORTAL_ASSET_NAMES.filter((name) => name !== undefined)).toHaveLength(2);

    // R-P6 stays armed: no slot is standing in for art, and the boot gate agrees.
    expect(unresolvedAssetIds()).toEqual([]);
    expect(() => {
      assertNoPlaceholders();
    }).not.toThrow();
  });

  test("the loader receives both files and both ends paint the same figure, in every phase", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);

    // A-1's mount half, measured on the bytes: the page's own resource log must
    // carry both signed rasters, with the probe's exact ink census (74 713 px) —
    // a re-encoded, re-cropped or swapped file changes one of these two numbers.
    const censuses: Array<PngCensus | null> = [];
    for (const name of PORTAL_ASSET_NAMES) {
      censuses.push(name === undefined ? null : await servedPngCensus(page, name));
    }
    for (const [index, census] of censuses.entries()) {
      expect(census, `${String(PORTAL_ASSET_NAMES[index])} was fetched by the game's own loader`).not.toBeNull();
      expect(census?.width).toBe(512);
      expect(census?.height).toBe(512);
      expect(census?.ink, "the signed file's alpha≥128 ink census").toBe(74_713);
    }

    // A-1's pairing half, in both phases: the two ends of a pair mount **one** texture
    // per phase (R-PM1), so their figures must agree in geometry and in mass. This is
    // the clause that would catch a "new graphic at the exit end" (E3-3) without ever
    // asking the renderer which branch it took.
    const measure = async (phase: "A" | "B"): Promise<{ live: CellCensus; far: CellCensus }> => {
      await settle(page);
      const live = await portalEndCensus(page, geometry, phase, END_LIVE);
      const far = await portalEndCensus(page, geometry, phase, END_FAR);
      // eslint-disable-next-line no-console
      console.log(
        `[QA-017] A-1 pair agreement phase=${phase} live.ink=${String(live.ink)} far.ink=${String(far.ink)} ` +
          `live.core=${live.core.map((c) => Math.round(c)).join(",")} far.core=${far.core.map((c) => Math.round(c)).join(",")} ` +
          `live.inner=${String(live.innerInk)} far.inner=${String(far.innerInk)}`,
      );
      return { live, far };
    };

    const assertAgree = (phase: "A" | "B", a: CellCensus, b: CellCensus): void => {
      expect(a.bbox, `phase ${phase}: the live end draws a figure`).not.toBeNull();
      expect(b.bbox, `phase ${phase}: the far end draws a figure`).not.toBeNull();
      expect(Math.abs(a.ink - b.ink) / Math.max(a.ink, b.ink), "phase-identical ink mass").toBeLessThan(0.08);
      const bboxA = a.bbox;
      const bboxB = b.bbox;
      if (bboxA === null || bboxB === null) return;
      // Same figure, same box: a per-end extra mark moves the bbox.
      expect(Math.abs(bboxA.x1 - bboxA.x0 - (bboxB.x1 - bboxB.x0)), "same figure width").toBeLessThanOrEqual(2);
      expect(Math.abs(bboxA.y1 - bboxA.y0 - (bboxB.y1 - bboxB.y0)), "same figure height").toBeLessThanOrEqual(2);
      const delta = profileDelta(a.profile, b.profile);
      expect(delta.maxBinShare, `no extra figure in any radius band (worst bin ${String(delta.worstBin)})`).toBeLessThan(0.1);
      // The swirl is the state channel and it is binary: either both ends carry it or
      // neither does, never one.
      expect(a.innerInk > 0).toBe(b.innerInk > 0);
    };

    const phaseA = await measure("A");
    assertAgree("A", phaseA.live, phaseA.far);
    // Phase A is the pair's dormant phase on L11 (`activePhase: B`), so both ends
    // must be the §3.1c vector figure — no swirl ink anywhere.
    expect(phaseA.live.innerInk, "dormant ends carry no swirl ink").toBe(0);

    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    const after = await hud(page);
    expect(after.phase).toBe("B");

    const phaseB = await measure("B");
    assertAgree("B", phaseB.live, phaseB.far);
    // …and in B the pair is live: the raster's baked swirl is present on both ends.
    expect(phaseB.live.innerInk, "live ends carry the baked swirl").toBeGreaterThan(20);
    expect(phaseB.live.ink, "the live raster is a filled figure, not an outline").toBeGreaterThan(
      phaseA.live.ink,
    );
  });
});

test.describe("§3.1e A-2 — the mapped contrast survives on the bytes the game loaded", () => {
  test("the swap law is load-bearing: as-named fails R-C3, swapped clears the named bar", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));

    const portalA = await servedPngCensus(page, "portal_a");
    const portalB = await servedPngCensus(page, "portal_b");
    expect(portalA).not.toBeNull();
    expect(portalB).not.toBeNull();
    if (portalA === null || portalB === null) return;

    // The core is the probe's `mean_ink_core`: mean RGB over the α≥128 mask.
    expect(portalA.core.map((c) => Math.round(c))).toEqual([69, 186, 209]);
    expect(portalB.core.map((c) => Math.round(c))).toEqual([56, 95, 139]);
    // Silhouette and alpha geometry are shared between the pair, which is *why* the
    // mapping has to be a colour measurement (the whole point of A-1's audit note).
    expect(portalA.ink).toBe(portalB.ink);
    expect(portalA.innerInk).toBe(portalB.innerInk);

    const grounds = {
      A: { cell: hexToRgb(theme("A").ground.cell), alt: hexToRgb(theme("A").ground.cellAlt) },
      B: { cell: hexToRgb(theme("B").ground.cell), alt: hexToRgb(theme("B").ground.cellAlt) },
    } as const;

    const swappedA = {
      cell: contrastRGB(portalB.core as RgbBytes, grounds.A.cell),
      alt: contrastRGB(portalB.core as RgbBytes, grounds.A.alt),
    };
    const swappedB = {
      cell: contrastRGB(portalA.core as RgbBytes, grounds.B.cell),
      alt: contrastRGB(portalA.core as RgbBytes, grounds.B.alt),
    };
    const asNamedA = {
      cell: contrastRGB(portalA.core as RgbBytes, grounds.A.cell),
      alt: contrastRGB(portalA.core as RgbBytes, grounds.A.alt),
    };
    const asNamedB = {
      cell: contrastRGB(portalB.core as RgbBytes, grounds.B.cell),
      alt: contrastRGB(portalB.core as RgbBytes, grounds.B.alt),
    };

    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-2 contrast swapped A=${r2(swappedA.cell)}/${r2(swappedA.alt)} B=${r2(swappedB.cell)}/${r2(swappedB.alt)} ` +
        `| as-named A=${r2(asNamedA.cell)}/${r2(asNamedA.alt)} B=${r2(asNamedB.cell)}/${r2(asNamedB.alt)}`,
    );

    // The named bar, on the mount order's own `.cell` ground, both phases. Note A-2's
    // pass shape quotes *two* numbers per phase (6.50 / 5.53 A · 6.25 / 5.49 B): only
    // the first is ≥ 6.2, so the second ground binds at the pre-registered 5.4 — the
    // spec's own parenthetical, not a re-specified threshold (see README).
    expect(swappedA.cell).toBeGreaterThanOrEqual(6.2);
    expect(swappedB.cell).toBeGreaterThanOrEqual(6.2);
    expect(swappedA.alt).toBeGreaterThanOrEqual(5.4);
    expect(swappedB.alt).toBeGreaterThanOrEqual(5.4);

    // …and the suffixed (as-named) mapping FAILS R-C3 on both grounds of both phases.
    // This is the falsifier: if the renderer regressed to the suffix convention, the
    // shipped colours would land here and this row would go red on the *bytes*, not
    // on a screenshot.
    for (const value of [asNamedA.cell, asNamedA.alt, asNamedB.cell, asNamedB.alt]) {
      expect(value).toBeLessThan(3);
    }
    expect(rgbDistance(portalA.core as RgbBytes, portalB.core as RgbBytes)).toBeGreaterThan(60);
  });
});

test.describe("§3.1e A-3 — the B state read is structural, because B's value backup is 1.0", () => {
  test("the same tile reads dormant → live through luma alone, and the value channel is useless", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);

    // 1. The *value* channel, on the served bytes: the live raster against the
    //    reserved inactive token it swaps from. This is the number that makes the
    //    whole row load-bearing — 1.03:1 is indistinguishable by luminance, so a
    //    state read resting on value would be a coin flip in phase B.
    const portalA = await servedPngCensus(page, "portal_a");
    expect(portalA).not.toBeNull();
    if (portalA === null) return;
    const valueBackupB = contrastRGB(portalA.core as RgbBytes, hexToRgb(theme("B").obj.portalEcho));
    // eslint-disable-next-line no-console
    console.log(`[QA-017] A-3 B value backup live-vs-dormant = ${r2(valueBackupB)}:1`);
    expect(valueBackupB, "phase B's value backup really is ~1.0").toBeLessThan(1.1);

    // 2. The *structural* channel, on the presented board: the same tile in its
    //    dormant phase (the §3.1c vector outline, swirl withheld) and after one press
    //    (the signed raster, swirl baked in). The census is luma-only, so it uses
    //    exactly the channel the number above proves is unreliable — and still reads
    //    the two states apart, because the difference is *presence*, not value.
    await settle(page);
    const start = await hud(page);
    const dormant = await portalEndCensus(page, geometry, start.phase as "A" | "B", END_LIVE);

    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    const flipped = await hud(page);
    expect(flipped.phase).not.toBe(start.phase);
    await settle(page);
    const live = await portalEndCensus(page, geometry, flipped.phase as "A" | "B", END_LIVE);

    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-3 luma census tile=${END_LIVE.join(",")} dormant.ink=${String(dormant.ink)} dormant.inner=${String(dormant.innerInk)} ` +
        `live.ink=${String(live.ink)} live.inner=${String(live.innerInk)} ratio=${r2(live.ink / Math.max(1, dormant.ink))}`,
    );

    // The swirl aperture is the probe's own: `r < 0.62 · outer` of the ink bbox. The
    // vector diamond's nearest edge sits outside it (its mid-edge is 0.2475 × cell
    // from the centre; the aperture is ~0.217 × cell), so "dormant carries zero ink
    // inside" is geometry, not luck.
    expect(dormant.innerInk, "the dormant figure withholds the swirl").toBe(0);
    expect(live.innerInk, "the live raster bakes it in").toBeGreaterThan(20);
    // Presence, not value: the live figure is a *filled* form over the outline's
    // stroke, so the structural read is a large coverage step at desktop pitch.
    expect(live.ink / Math.max(1, dormant.ink), "live coverage vs dormant outline").toBeGreaterThan(1.5);
    // The state channel is binary in the census too: swirl present on exactly one.
    expect(profileDelta(dormant.profile, live.profile).maxBinShare).toBeGreaterThan(0.1);
  });
});

/** One rAF transient inside the portal ROI, read through `helpers/capture.ts`. */
test.describe("§6.6 B6 / A-5 — the arrival beat fits its own window and adds no figure", () => {
  test("the swap transient on the far end stays inside the walls row and settles", async ({ page }) => {
    // `walls` is `{ start: 80, dur: 120 }` (tokens.ts FLIP_TIMING.S), and B6 rides
    // that row: the beat's declared window is over at 200 ms. The recorder runs ~420 ms
    // past it so the final frame *is* the resting picture (`stopRecorder`'s contract).
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);
    await settle(page);

    const roi = roiAround(
      geometry.cellCenterDevice(END_FAR[0], END_FAR[1]),
      Math.round(geometry.layout.cellSize / 2),
    );
    await startRecorder(page, roi, 700);

    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    await page.waitForTimeout(420);
    const stats = await stopRecorder(page, roi);
    const report = reportTransient(stats);

    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-5 far-end ROI frames=${String(report.frames)} gridMs=${r2(report.gridMs)} ` +
        `frozenUntil=${r2(report.frozenUntil)} onset=${report.onset === null ? "null" : r2(report.onset)} ` +
        `durationMs=${report.durationMs === null ? "null" : r2(report.durationMs)} peakPrevChanged=${String(report.peakPrevChanged)}`,
    );

    expect(report.onset, "the recorder saw the picture start moving").not.toBeNull();
    expect(report.frozenUntil, "…and it was provably still before the press").toBeGreaterThan(0);
    expect(report.peakPrevChanged, "the beat is a visible transient, not a no-op").toBeGreaterThan(0);
    // The window, with one frame of grid slack — the same shape every other transient
    // row in this suite uses (the grid is a measurement limit, not a product claim).
    expect(report.durationMs).not.toBeNull();
    expect(report.durationMs ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200 + report.gridMs);

    const tail = stats[stats.length - 1];
    expect(tail?.changed, "the ROI is back on the resting picture").toBe(0);
    expect(tail?.prevChanged, "…and it is not still moving").toBe(0);

    // A-5's "zero new ink at the exit end", measured where it can be measured: the far
    // end's settled figure must be the *same* figure as the live end's — same ink mass,
    // same radius profile, same swirl presence. A marker or a second graphic at the
    // exit end would break this on the presented pixels.
    const phase = (await hud(page)).phase as "A" | "B";
    const live = await portalEndCensus(page, geometry, phase, END_LIVE);
    const far = await portalEndCensus(page, geometry, phase, END_FAR);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-5 exit-end ink live=${String(live.ink)} far=${String(far.ink)} ` +
        `inner live=${String(live.innerInk)} far=${String(far.innerInk)}`,
    );
    expect(far.ink).toBeGreaterThan(0);
    expect(Math.abs(far.ink - live.ink) / Math.max(live.ink, far.ink)).toBeLessThan(0.08);
    expect(profileDelta(live.profile, far.profile).maxBinShare).toBeLessThan(0.1);
    expect(far.innerInk > 0).toBe(live.innerInk > 0);
  });
});

/* ───────────────────────── B12/B13 — the DOM beats (A-7) ─────────────────── */

interface PressSample {
  /** ms since the sampler was installed. */
  readonly t: number;
  readonly scaleX: number;
  /** Layout box (CSS px) — what the 44 px floor is measured on. */
  readonly offsetW: number;
  readonly offsetH: number;
  /** Painted box (CSS px) — `getBoundingClientRect`, i.e. *after* the transform. */
  readonly visualW: number;
  /** The running `transform` transition's own clock at this sample, or `null`. */
  readonly transitionMs: number | null;
}

/**
 * The transform leg of the used `transition-*` longhands for one element, read at
 * whichever moment it is asked for — the point being that the *pressed* state has
 * its own declaration (`90 ms in`) and the resting state has another (`140 ms out`),
 * so reading only one of the two would mis-state the beat.
 */
interface TransformTransition {
  readonly transform: string;
  readonly duration: string | null;
  readonly easing: string | null;
}

/** One `transitionstart` / `transitionend` as the browser reported it. */
interface TransitionRecord {
  readonly phase: "start" | "end";
  readonly propertyName: string;
  /** `transitionend`'s own duration report, in **ms** (`elapsedTime` in seconds). */
  readonly elapsedMs: number;
  /** ms since the sampler was installed. */
  readonly at: number;
}

/**
 * Hold a HUD button down and sample its own computed transform on the **frame grid**.
 *
 * Four decisions carry this instrument:
 *
 * - the sampling is **in-page**, so no RPC round trip can be mistaken for the beat's
 *   timing — and so is the *hold window*: `pointerdown` / `pointerup` (and their mouse
 *   twins) on `window` in the capture phase stamp the press in the page's own clock,
 *   and the sampler is stopped right after the release instead of after a wall-clock
 *   wait. That is what keeps the post-release return leg out of the "settled hold"
 *   filter: the release time is *measured*, never inferred from how long the driver
 *   meant to hold.
 * - the grid is `requestAnimationFrame`. A running CSS transition's computed value is
 *   recomputed **once per frame**, so one sample per frame is exactly the resolution
 *   of the underlying data; a finer timer grid can only ever repeat the same value,
 *   and on this stack it is *coarser* than the frame grid instead — measured here,
 *   `setTimeout(…, 4)` under a WebGL (SwiftShader) renderer at load lands at a ~50 ms
 *   median while the frame grid stays ~30 ms. Sampling on the frame grid is therefore
 *   both the honest and the finer instrument, and `gridMs` is reported so the row's
 *   resolution is never implied to be better than it is.
 * - each sample also carries the **running transition's own clock**: `CSSTransition`
 *   objects are exposed by `element.getAnimations()`, so `currentTime` gives the
 *   position on the declared curve at the instant the value was read.
 * - the transition's **own record** is captured too (`transitionstart` /
 *   `transitionend`, `propertyName === "transform"`): `elapsedTime` is the browser's
 *   report of how long the ramp actually took, which is the one part of this beat
 *   that no sampling grid has to interpolate.
 *
 * The pointer is released *off* the button, so the press has no side effect on the
 * game — the row is about the button, not the move.
 */
async function holdAndSample(
  page: Page,
  label: string,
): Promise<{
  samples: readonly PressSample[];
  hit: string | null;
  /** The `:active` declaration read **during** the hold — the state that matters. */
  active: TransformTransition | null;
  /** The press's own window, in the sampler's clock: `[pointerdown, pointerup)`. */
  downAt: number | null;
  upAt: number | null;
  /** The `transform` transition's start/end, as the browser reported them (ms). */
  transitions: readonly TransitionRecord[];
}> {
  await page.evaluate((name: string) => {
    const el = document.querySelector(`button[aria-label="${name}"]`);
    if (el === null) throw new Error(`[press] no button labelled ${name}`);
    interface PressRecorder {
      samples: PressSample[];
      stop: boolean;
      t0: number;
      downAt: number | null;
      upAt: number | null;
      transitions: TransitionRecord[];
    }
    const holder = window as unknown as { __psPress?: PressRecorder };
    const rec: PressRecorder = {
      samples: [],
      stop: false,
      t0: performance.now(),
      downAt: null,
      upAt: null,
      transitions: [],
    };
    holder.__psPress = rec;
    const t0 = rec.t0;
    const stamp = (which: "down" | "up"): void => {
      if (which === "down") {
        if (rec.downAt === null) rec.downAt = performance.now() - t0;
      } else if (rec.upAt === null) rec.upAt = performance.now() - t0;
    };
    // Both the pointer and the mouse pair: a CDP-dispatched press produces pointer
    // events in Chromium, but the stamp must not depend on which family arrives first.
    window.addEventListener("pointerdown", () => { stamp("down"); }, true);
    window.addEventListener("mousedown", () => { stamp("down"); }, true);
    window.addEventListener("pointerup", () => { stamp("up"); }, true);
    window.addEventListener("mouseup", () => { stamp("up"); }, true);
    const record = (phase: "start" | "end") => (event: Event) => {
      const transition = event as TransitionEvent;
      if (transition.propertyName !== "transform") return;
      rec.transitions.push({
        phase,
        propertyName: transition.propertyName,
        elapsedMs: transition.elapsedTime * 1000,
        at: performance.now() - t0,
      });
    };
    window.addEventListener("transitionstart", record("start"), true);
    window.addEventListener("transitionend", record("end"), true);
    const step = (): void => {
      if (rec.stop) return;
      const style = getComputedStyle(el);
      const matrix =
        style.transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(style.transform);
      // The transform's own transition, when it is running: its `currentTime` is the
      // position on the declared curve *now*, in the browser's animation clock.
      const transition = el
        .getAnimations()
        .map((animation) => animation as Partial<CSSTransition>)
        .find((animation) => animation.transitionProperty === "transform");
      rec.samples.push({
        t: performance.now() - t0,
        scaleX: matrix.a,
        offsetW: el instanceof HTMLElement ? el.offsetWidth : 0,
        offsetH: el instanceof HTMLElement ? el.offsetHeight : 0,
        visualW: el.getBoundingClientRect().width,
        transitionMs:
          transition?.currentTime === null || transition?.currentTime === undefined
            ? null
            : Number(transition.currentTime),
      });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, label);

  const box = await page.locator(`button[aria-label="${label}"]`).boundingBox();
  if (box === null) throw new Error(`[press] ${label} has no box`);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.waitForTimeout(320);
  // Read mid-hold, and read it *because* it is mid-hold: `:active` is the state the
  // 90 ms window belongs to, and the resting `.ps-btn` rule declares the 140 ms out
  // leg instead. The hit test goes with it: a transform that moved the button out
  // from under the pointer would show up as a different element here.
  const midHold = await page.evaluate(
    (point: { x: number; y: number }) => {
      const found = document.elementFromPoint(point.x, point.y);
      const button = found?.closest("button") ?? null;
      let declaration: TransformTransition | null = null;
      if (button !== null) {
        const style = getComputedStyle(button);
        const props = style.transitionProperty.split(",").map((part) => part.trim());
        const durations = style.transitionDuration.split(",").map((part) => part.trim());
        const easings = style.transitionTimingFunction.split(",").map((part) => part.trim());
        const index = props.indexOf("transform");
        declaration = {
          transform: style.transform,
          duration: index < 0 ? null : (durations[index] ?? null),
          easing: index < 0 ? null : (easings[index] ?? null),
        };
      }
      return { hit: button?.getAttribute("aria-label") ?? null, declaration };
    },
    { x: cx, y: cy },
  );
  await page.mouse.move(cx, Math.max(0, cy - 240));
  await page.mouse.up();
  // A short tail, not a wait: enough to catch the release leg's first samples, short
  // enough that nothing beyond the hold can be mistaken for the hold.
  await page.waitForTimeout(60);

  const result = await page.evaluate(() => {
    const rec = (
      window as unknown as {
        __psPress?: {
          samples: PressSample[];
          stop: boolean;
          downAt: number | null;
          upAt: number | null;
          transitions: TransitionRecord[];
        };
      }
    ).__psPress;
    if (rec === undefined) {
      return {
        samples: [] as PressSample[],
        downAt: null,
        upAt: null,
        transitions: [] as TransitionRecord[],
      };
    }
    rec.stop = true;
    return { samples: rec.samples, downAt: rec.downAt, upAt: rec.upAt, transitions: rec.transitions };
  });
  return {
    samples: result.samples,
    hit: midHold.hit,
    active: midHold.declaration,
    downAt: result.downAt,
    upAt: result.upAt,
    transitions: result.transitions,
  };
}

test.describe("§6.6 B11/B12/B13 — the DOM beats' timing (A-7)", () => {
  test("B12 — the press transform is the declared 90 ms ease-out to 0.97, on the layout box", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(SIMPLE_LEVEL_ID));
    await settle(page);

    // A disabled button is never `:active`, so the row's precondition is stated rather
    // than assumed: one legal move arms both bottom-bar buttons.
    const leg = SIMPLE.legs[0];
    expect(leg).toBeDefined();
    if (leg === undefined) return;
    await pressDirection(page, leg.direction);
    await settle(page);
    expect((await hud(page)).restartDisabled, "Restart is armed by the committed move").toBe(false);

    const vars = await page.evaluate(() => {
      const shell = document.querySelector(".ps-shell");
      if (shell === null) return null;
      const style = getComputedStyle(shell);
      return {
        scale: style.getPropertyValue("--ps-press-scale").trim(),
        inMs: style.getPropertyValue("--ps-press-in-ms").trim(),
        outMs: style.getPropertyValue("--ps-press-out-ms").trim(),
      };
    });
    expect(vars).toEqual({ scale: "0.97", inMs: "90ms", outMs: "140ms" });

    const { samples, hit, active, downAt, upAt, transitions } = await holdAndSample(page, "Restart");
    expect(samples.length, "the sampler ran").toBeGreaterThan(3);

    // The press's own *declaration*, read from the pressed element while it is
    // pressed — that is what makes the arithmetic below a statement about the
    // shipped stylesheet, and what makes the spec's "45 ms" reading checkable at
    // all. `--ps-press-in-ms` is 90 ms on the `:active` rule; the resting rule
    // declares the 140 ms out leg, so the two are read separately and both are
    // asserted (reading only the resting one would silently quote the wrong window).
    const resting = await page.evaluate((name: string) => {
      const el = document.querySelector(`button[aria-label="${name}"]`);
      if (el === null) return null;
      const style = getComputedStyle(el);
      const props = style.transitionProperty.split(",").map((part) => part.trim());
      const durations = style.transitionDuration.split(",").map((part) => part.trim());
      const easings = style.transitionTimingFunction.split(",").map((part) => part.trim());
      const index = props.indexOf("transform");
      return {
        transform: style.transform,
        duration: index < 0 ? null : (durations[index] ?? null),
        easing: index < 0 ? null : (easings[index] ?? null),
      };
    }, "Restart");

    expect(active?.easing, "the :active transform leg's declared easing").toBe("ease-out");
    const points = easingPoints(active?.easing ?? null);
    expect(points, "the declared easing is a value the model can carry").not.toBeNull();
    // The keyword's own meaning is spec data (CSS Easing L1), asserted here so a
    // declaration that stopped being `ease-out` could not keep borrowing this model.
    expect(points, "CSS Easing L1 defines `ease-out` as cubic-bezier(0, 0, 0.58, 1)").toEqual([
      0, 0, 0.58, 1,
    ]);
    // …and the transform really was read *inside* the pressed state: `.ps-btn` at rest
    // declares no transform at all, so a `none` here would mean the hold missed its
    // own window and the 90/140 ms split below was read off the wrong rule.
    expect(active?.transform, "the sampler caught the button mid-press").not.toBe("none");
    expect(active?.duration, "the :active transform leg is the declared 90 ms in").toBe("0.09s");
    expect(resting?.duration, "…and the resting leg is the declared 140 ms out").toBe("0.14s");
    expect(resting?.easing).toBe("ease-out");
    if (points === null) return;

    // A-7's *literal* number, computed from that declaration: `ease-out` is
    // `cubic-bezier(0, 0, 0.58, 1)`, so the fraction of the window elapsed at 45 ms
    // (x = 0.5) is y ≈ 0.686 and the transform is `1 + y · (0.97 - 1)` ≈ 0.9794 — not
    // 0.97. The relaxation below is what makes the measurement falsifiable, and the
    // measured curve is then required to bracket the declared 90 ms.
    const at45 = 1 + bezierFraction(0.5, points) * (0.97 - 1);
    const atEnd = 1 + bezierFraction(1, points) * (0.97 - 1);

    const onsetIndex = samples.findIndex((sample) => sample.scaleX < 0.9999);
    expect(onsetIndex, "the :active transform really started").toBeGreaterThanOrEqual(0);
    // The hold's own window, stamped in-page. `[pointerdown, pointerup)` bounds every
    // claim below: the press cannot start before the pointer is down, and the *out*
    // leg cannot be inside the hold — so the "settled" filter is bounded by the
    // measured release, never by the wall clock the driver meant to spend.
    expect(downAt, "the pointerdown was stamped in-page").not.toBeNull();
    expect(upAt, "the pointerup was stamped in-page").not.toBeNull();
    const holdStart = downAt ?? 0;
    const holdEnd = upAt ?? holdStart;
    expect(holdEnd - holdStart, "the hold outlived the declared 90 ms ramp").toBeGreaterThan(150);

    const after = samples.filter((sample) => sample.t >= holdStart && sample.t <= holdEnd);
    const settled = after.filter((sample) => sample.scaleX > 0.968 && sample.scaleX < 0.9719);
    const insideRamp = after.filter((sample) => sample.scaleX > 0.97 && sample.scaleX < 0.9999);
    // The frame grid — the resolution of a running transition's computed value, and
    // therefore the resolution of this entire row. Every grid-bounded bound below
    // carries it, so the row can never claim more precision than it measured.
    const deltas = after
      .slice(1)
      .map((sample, index) => sample.t - (after[index]?.t ?? sample.t))
      .sort((a, b) => a - b);
    const gridMs = deltas[Math.floor(deltas.length / 2)] ?? 0;

    // The declared duration as a number, parsed from the declaration itself (never
    // typed) — the denominator of every `x` below.
    const declaredMs =
      active?.duration === null || active?.duration === undefined
        ? null
        : Number.parseFloat(active.duration) * 1000;
    expect(declaredMs, "the declared transform duration parses to a number").toBe(90);

    // The browser's own record of the ramp: `transitionend.elapsedTime` is how long
    // it *actually* took, reported by the transition machinery itself — the one part
    // of this beat that no sampling grid has to interpolate. The wall span between the
    // two events brackets the same 90 ms; it is a frame or two wider than the duration
    // because both events are dispatched on frame boundaries.
    const inTransitions = transitions.filter((entry) => entry.at < holdEnd + 5);
    const startEvent = inTransitions.find((entry) => entry.phase === "start");
    const endEvent = inTransitions.find((entry) => entry.phase === "end");
    const wallSpan = startEvent !== undefined && endEvent !== undefined ? endEvent.at - startEvent.at : null;

    // The ramp's extent, in the sampler's wall clock: the first sample that has left 1
    // and the last that has not yet reached 0.97 bound the window from inside, their
    // neighbours from outside. The declared 90 ms must sit inside that bracket.
    const lastBefore = [...samples].reverse().find((sample) => sample.t < (insideRamp[0]?.t ?? 0));
    const firstRamp = insideRamp[0];
    const lastRamp = insideRamp[insideRamp.length - 1];
    const firstSettled = samples.find((sample) => lastRamp !== undefined && sample.t > lastRamp.t && sample.scaleX <= 0.9705);
    const spanLo = (lastRamp?.t ?? 0) - (firstRamp?.t ?? 0);
    const spanHi = (firstSettled?.t ?? lastRamp?.t ?? 0) - (lastBefore?.t ?? firstRamp?.t ?? 0);

    // ── The curve, anchored on the transition's own clock ──────────────────────
    // The ramp's origin is **not** "the first sample that moved": that sample is a
    // frame late by construction, which is why anchoring on it produced a negative
    // crossing time. The origin the browser uses is the transition's own start, and
    // `CSSTransition.currentTime` measures exactly that. Every sample carrying a
    // running transform transition therefore yields a `(time, value)` pair whose
    // **abscissa does not depend on the sampling grid at all** — `x = currentTime /
    // declaredDuration` — so the check below tests the shipped easing rather than my
    // clock. (This is the resolution of the row: one pair per frame, and each pair's
    // position on the curve is exact.)
    const rampPairs = after
      .filter((sample): sample is PressSample & { transitionMs: number } => sample.transitionMs !== null)
      .map((sample) => ({ x: sample.transitionMs / (declaredMs ?? 90), scaleX: sample.scaleX, transitionMs: sample.transitionMs }));
    const curvePoints = rampPairs.filter((pair) => pair.x > 0 && pair.x < 1);
    const midPairs = curvePoints.filter((pair) => pair.x >= 0.25 && pair.x <= 0.75);
    const midScale = (1 + 0.97) / 2;
    const midIndex = rampPairs.findIndex((pair) => pair.scaleX <= midScale);
    const beforeMid = rampPairs[midIndex - 1];
    const atMid = rampPairs[midIndex];
    const crossFraction =
      midIndex > 0 && beforeMid !== undefined && atMid !== undefined && atMid.scaleX !== beforeMid.scaleX
        ? beforeMid.x + ((beforeMid.scaleX - midScale) / (beforeMid.scaleX - atMid.scaleX)) * (atMid.x - beforeMid.x)
        : (atMid?.x ?? 1);
    const crossT = crossFraction * (declaredMs ?? 90);
    const analyticCrossMs = bezierTimeAt(0.5, points) * (declaredMs ?? 90);
    // The measured reading nearest the 45 ms mark, on the same clock — A-7's own
    // readout, reported with its offset so it can never be quoted as if it were taken
    // *at* 45 ms.
    const near45 = curvePoints.reduce<(typeof curvePoints)[number] | undefined>((best, pair) => {
      if (best === undefined) return pair;
      return Math.abs(pair.transitionMs - 45) < Math.abs(best.transitionMs - 45) ? pair : best;
    }, undefined);
    const settledScale = settled[settled.length - 1]?.scaleX ?? 1;
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-7 B12 samples=${String(samples.length)} gridMs=${r2(gridMs)} rampSamples=${String(insideRamp.length)} ` +
        `rampSpan=[${r2(spanLo)},${r2(spanHi)}]ms declared=${String(declaredMs)}ms ` +
        `transitionElapsed=${endEvent === undefined ? "null" : r2(endEvent.elapsedMs)}ms ` +
        `transitionWall=${wallSpan === null ? "null" : r2(wallSpan)}ms ` +
        `crossT=${r2(crossT)}ms analyticCross=${r2(analyticCrossMs)}ms linearCross=45ms ` +
        `t45offset=${r2((near45?.transitionMs ?? 0) - 45)}ms scale@45measured=${(near45?.scaleX ?? 1).toFixed(4)} ` +
        `scale@45analytic=${at45.toFixed(4)} scale@90analytic=${atEnd.toFixed(4)} settledScale=${settledScale.toFixed(4)} ` +
        `hold=[${r2(holdStart)},${r2(holdEnd)}]`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-7 B12 curve x:scale = ${curvePoints
        .map((pair) => `${pair.x.toFixed(3)}:${pair.scaleX.toFixed(4)}`)
        .join(" ")}`,
    );

    expect(insideRamp.length, "the transform is a ramp, not an instant snap").toBeGreaterThan(1);
    expect(settled.length, "the press was held long enough to settle").toBeGreaterThan(0);
    expect(spanLo, "the measured ramp is at least this long").toBeLessThanOrEqual(90);
    expect(spanHi, "…and no longer than this").toBeGreaterThanOrEqual(90);
    // The browser's own record, independent of the sampling grid: the transform
    // transition really ran, and it ran for the declared 90 ms (`elapsedTime` is the
    // transition machinery's own report, in seconds, of how long the ramp took).
    expect(startEvent, "the transform transition started during the press").toBeDefined();
    expect(endEvent, "…and it finished during the press").toBeDefined();
    expect(endEvent?.elapsedMs, "the transition's own report of its duration").toBeCloseTo(90, 0);
    expect(endEvent?.elapsedMs, "…which is the 90 ms window, not the 140 ms out leg").toBeLessThan(120);
    expect(wallSpan, "the two events' wall span brackets the same 90 ms, a frame or two wide").not.toBeNull();
    expect(wallSpan ?? 0).toBeGreaterThan(90 - 1.5 * gridMs);
    expect(wallSpan ?? 999).toBeLessThan(90 + 3 * gridMs);
    // The settled hold is the declared scale, and the *midpoint* of the declared window
    // is measurably above it — A-7's literal "0.97 at 45 ms" is falsified by its own
    // declaration, not by an interpretation: `ease-out` is not linear.
    expect(settledScale, "the settled hold is the declared scale").toBeGreaterThan(0.968);
    expect(settledScale).toBeLessThan(0.972);
    expect(at45, "the analytic 45 ms value, from the declaration").toBeGreaterThan(0.975);
    expect(at45).toBeLessThan(0.99);
    expect(atEnd).toBeCloseTo(0.97, 6);
    // ── The measured curve, sample by sample ───────────────────────────────────
    // Each pair sits at a known position on the declared curve, so the shipped easing
    // is checked directly: the measured value must track the model, and must sit
    // *twice as close* to `ease-out` as to a linear ramp wherever the two differ
    // enough to distinguish (the middle of the window, where the two models are
    // ~0.005 apart on a travel of 0.03 — above the frame grid's noise floor and below
    // nothing the row could otherwise resolve).
    expect(curvePoints.length, "the ramp produced curve points").toBeGreaterThan(1);
    expect(midPairs.length, "…including points that can separate ease-out from linear").toBeGreaterThan(0);
    for (const pair of curvePoints) {
      const model = 1 + bezierFraction(pair.x, points) * (0.97 - 1);
      expect(
        Math.abs(pair.scaleX - model),
        `at x=${pair.x.toFixed(3)} (${r2(pair.transitionMs)} ms) measured ${pair.scaleX.toFixed(4)} vs model ${model.toFixed(4)}`,
      ).toBeLessThanOrEqual(0.003);
    }
    for (const pair of midPairs) {
      const model = 1 + bezierFraction(pair.x, points) * (0.97 - 1);
      const linear = 1 + pair.x * (0.97 - 1);
      expect(
        Math.abs(pair.scaleX - model),
        `at x=${pair.x.toFixed(3)} measured ${pair.scaleX.toFixed(4)}: ease-out ${model.toFixed(4)} vs linear ${linear.toFixed(4)}`,
      ).toBeLessThan(Math.abs(pair.scaleX - linear) / 2);
    }
    // The crossing, on the transition's own clock: `ease-out` reaches half its travel
    // at 30.8 ms of a 90 ms window, a linear ramp at exactly 45 ms. The measured
    // crossing must be inside one frame of the model and under the linear mark.
    expect(
      Math.abs(crossT - analyticCrossMs),
      `measured crossing ${r2(crossT)} ms vs analytic ${r2(analyticCrossMs)} ms (grid ${r2(gridMs)} ms)`,
    ).toBeLessThanOrEqual(gridMs + 2);
    expect(
      crossT,
      `the press crosses mid-scale at ${r2(crossT)} ms; a linear 45 ms read would not have crossed yet`,
    ).toBeLessThan(45);
    // The settled hold is the declared scale, and the *midpoint* of the declared window
    // is measurably above it — A-7's literal "0.97 at 45 ms" is falsified by its own
    // declaration, not by an interpretation: `ease-out` is not linear.
    expect(settledScale, "the settled hold is the declared scale").toBeGreaterThan(0.968);
    expect(settledScale).toBeLessThan(0.972);
    expect(at45, "the analytic 45 ms value, from the declaration").toBeGreaterThan(0.975);
    expect(at45).toBeLessThan(0.99);
    expect(atEnd).toBeCloseTo(0.97, 6);
    expect(analyticCrossMs, "ease-out crosses the half-way value at 0.3425 of the window").toBeGreaterThan(29);
    expect(analyticCrossMs).toBeLessThan(32);
    // …and every mid-ramp sample sits strictly between the two endpoints of the
    // declaration: the press is a ramp, never a snap and never an overshoot.
    for (const sample of insideRamp) {
      expect(sample.scaleX).toBeGreaterThan(0.97);
      expect(sample.scaleX).toBeLessThan(1);
    }

    // The hit box is the layout box: `offsetWidth/Height` never move, `elementFromPoint`
    // at the layout centre still resolves to the same button, and the *painted* box is
    // the layout box scaled — i.e. 0.97 is a paint property, never a layout change
    // (§8's 44 px floor is measured on `offset*`, so it cannot be spent by a beat).
    const widths = new Set(samples.map((sample) => sample.offsetW));
    const heights = new Set(samples.map((sample) => sample.offsetH));
    expect(widths.size, "the layout width is constant through the press").toBe(1);
    expect(heights.size, "the layout height is constant through the press").toBe(1);
    expect(hit).toBe("Restart");
    const held = settled[settled.length - 1];
    expect(held).toBeDefined();
    if (held !== undefined) {
      expect(
        Math.abs(held.visualW - held.offsetW * 0.97),
        "the painted box is the scaled layout box",
      ).toBeLessThan(1.5);
    }
  });

  test("B13 — the panel starts at the flip budget and Next works on its first frame", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(SIMPLE_LEVEL_ID));

    // One in-page instrument for the whole row. It stamps the last keydown (the press
    // that commits the winning move) and, on the **first** frame the overlay is
    // unhidden, records everything that can only be read at that instant: the elapsed
    // time, the entrance animation's own clock, and the hit test at the Next button's
    // centre. That last one is the row's real question — "is Next tappable from the
    // first frame" is a *hit-testability* claim, and the only moment at which it can
    // be observed is the frame the panel appears on.
    await page.evaluate(() => {
      interface PanelState {
        keyAt: number | null;
        panelAt: number | null;
        opacity: number | null;
        nextHit: string | null;
        nextDisabled: boolean | null;
        nextBox: { x: number; y: number; w: number; h: number } | null;
        animation: { name: string; currentTime: number; playState: string } | null;
      }
      const holder = window as unknown as { __psPanel?: PanelState };
      const state: PanelState = {
        keyAt: null,
        panelAt: null,
        opacity: null,
        nextHit: null,
        nextDisabled: null,
        nextBox: null,
        animation: null,
      };
      holder.__psPanel = state;
      window.addEventListener(
        "keydown",
        () => {
          state.keyAt = performance.now();
        },
        true,
      );
      const tick = (): void => {
        const overlay = document.querySelector(".ps-overlay");
        if (overlay !== null && !overlay.hasAttribute("hidden")) {
          const dialog = document.querySelector(".ps-dialog");
          state.panelAt = performance.now();
          state.opacity = dialog === null ? null : Number.parseFloat(getComputedStyle(dialog).opacity);
          const next = dialog?.querySelector(".ps-dialog-actions .ps-btn-primary") ?? null;
          if (next instanceof HTMLElement) {
            const box = next.getBoundingClientRect();
            state.nextBox = { x: box.x, y: box.y, w: box.width, h: box.height };
            const under = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
            state.nextHit = under?.closest("button")?.getAttribute("aria-label") ?? null;
            state.nextDisabled = next instanceof HTMLButtonElement ? next.disabled : null;
          }
          const animations = dialog?.getAnimations() ?? [];
          const entrance = animations.find(
            (animation) => (animation as CSSAnimation).animationName === "ps-panel-in",
          );
          state.animation =
            entrance === undefined
              ? null
              : {
                  name: "ps-panel-in",
                  currentTime: Number(entrance.currentTime ?? 0),
                  playState: entrance.playState,
                };
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await pressRoute(page, SIMPLE.route);

    // The one thing that *must* wait: the panel is gated by `setTimeout(flipTimings
    // (...).total)` (hud.ts:406), so a HUD read taken straight after the winning press
    // would be reading the pre-panel board on purpose. Waiting on the instrument's own
    // `panelAt` — not on a sleep — is what keeps the row honest: it resolves on the
    // unhide frame, so the hit test and the click below land as early as possible.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => (window as unknown as { __psPanel?: { panelAt: number | null } }).__psPanel?.panelAt ?? null,
          ),
        { timeout: 5_000, message: "the win panel never unhid after the winning route" },
      )
      .not.toBeNull();

    const won = await hud(page);
    expect(won.won).toBe(true);
    expect(won.nextVisible).toBe(true);

    const panel = await page.evaluate(() => {
      const state = (
        window as unknown as {
          __psPanel?: {
            keyAt: number | null;
            panelAt: number | null;
            opacity: number | null;
            nextHit: string | null;
            nextDisabled: boolean | null;
            nextBox: { x: number; y: number; w: number; h: number } | null;
            animation: { name: string; currentTime: number; playState: string } | null;
          };
        }
      ).__psPanel;
      return state ?? null;
    });
    expect(panel).not.toBeNull();
    if (panel === null) return;
    const delay = panel.panelAt !== null && panel.keyAt !== null ? panel.panelAt - panel.keyAt : null;
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-7 B13 panelDelay=${delay === null ? "null" : r2(delay)}ms declared=${String(flipTimings(false).total)}ms ` +
        `opacityAtUnhide=${panel.opacity === null ? "null" : String(r2(panel.opacity))} ` +
        `nextHit=${panel.nextHit ?? "null"} nextDisabled=${String(panel.nextDisabled)} ` +
        `animation=${JSON.stringify(panel.animation)}`,
    );

    // §6.2 / B13's window: the dialog starts at `flipTimings(...).total` — the same
    // gate the renderer uses for the plate tint — so the panel *cannot* precede the
    // flip. The bound is the flip budget itself, not an anecdote: measured delay =
    // one input frame + the 220 ms timer, so the lower bound states the ordering claim.
    expect(delay).not.toBeNull();
    expect(delay ?? 0, "the panel does not appear before the flip budget the tint rides").toBeGreaterThanOrEqual(200);
    expect(delay ?? 999).toBeLessThan(420);
    expect(flipTimings(false).total).toBe(220);

    // B13's declared entrance, read from the computed style — and, at the unhide
    // frame itself, the animation's own clock: it is *running* and it has barely
    // started, which is the evidence that the button was hit-tested mid-entrance.
    const dialog = await page.evaluate(() => {
      const node = document.querySelector(".ps-dialog");
      if (node === null) return null;
      const style = getComputedStyle(node);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        delay: style.animationDelay,
      };
    });
    expect(dialog).toEqual({ name: "ps-panel-in", duration: "0.16s", delay: "0s" });
    expect(panel.animation, "the entrance was running on the unhide frame").not.toBeNull();
    expect(panel.animation?.playState).toBe("running");
    expect(Number(panel.animation?.currentTime ?? Number.NaN)).toBeLessThan(80);

    // "Next is tappable from the first frame" — no input gate. The claim has two
    // halves, and both are read at the unhide frame: the element under the button's
    // own centre *is* the button (`nextHit`), and the button is not disabled. The
    // click is then a raw pointer click, because Playwright's own actionability check
    // would *wait out* the 160 ms entrance (a harness gate, not a product one) and
    // would therefore prove the opposite of what the row asks.
    expect(panel.nextHit, "the element under the button's centre is the button").toBe("Next");
    expect(panel.nextDisabled, "…and it is live input, not a disabled placeholder").toBe(false);
    expect(panel.nextBox).not.toBeNull();

    const nextBox = await page.getByRole("button", { name: "Next" }).boundingBox();
    expect(nextBox).not.toBeNull();
    if (nextBox === null) return;
    await page.mouse.click(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2);
    await expect
      .poll(async () => (await hud(page)).won, { timeout: 5_000 })
      .toBe(false);
    const advanced = await hud(page);
    expect(advanced.levelLabel).not.toBe(won.levelLabel);
    expect(advanced.moves).toBe(0);
  });
});

/* ───────────────────── Stillness, reduced motion, deny list ───────────────── */

/** The goal's own cell rect, in canvas **device** px — R-M1's allowed motion region. */
function goalRect(geometry: BoardGeometry, goal: readonly [number, number]): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  return cellRect(geometry, goal);
}

/** Everything the DOM is allowed to change on an idle board: nothing. */
async function domSnapshot(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const text = (selector: string): string => document.querySelector(selector)?.textContent?.trim() ?? "";
    const styleOf = (selector: string): string => {
      const node = document.querySelector(selector);
      if (node === null) return "";
      const style = getComputedStyle(node);
      return `${style.transform}|${style.opacity}|${style.backgroundColor}|${style.color}`;
    };
    return {
      moves: text(".ps-moves"),
      level: text(".ps-level"),
      glyph: document.querySelector(".ps-glyph")?.getAttribute("data-glyph") ?? "",
      chip: document.querySelector(".ps-chip")?.getAttribute("aria-label") ?? "",
      phase: document.querySelector(".ps-shell")?.getAttribute("data-phase") ?? "",
      movesStyle: styleOf(".ps-moves"),
      levelStyle: styleOf(".ps-level"),
      chipStyle: styleOf(".ps-chip"),
      runningAnimations: document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => (animation as unknown as { animationName?: string }).animationName ?? animation.id),
    };
  });
}

test.describe("§6.6 R-M1 / A-8 + A-10 — one magnet, and nothing else moves", () => {
  test("two frames 2 s apart differ only inside the goal's own cell (L11: portals, switch, door, walls)", async ({
    page,
  }) => {
    await installPixelReadback(page);
    // L11 is the *hard* board for this row: it carries a portal pair, a switch, a door
    // and walls, so every deny-list class is on screen while the census runs.
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);
    await settle(page);
    await settle(page);

    await captureFrame(page);
    const diff = await frameDiffAfter(page, 2000);
    const rect = goalRect(geometry, PORTAL.level.goal);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-8 idle diff changed=${String(diff.changed)} total=${String(diff.total)} maxDelta=${String(diff.maxDelta)} ` +
        `bbox=${diff.bbox === null ? "null" : [diff.bbox.x0, diff.bbox.y0, diff.bbox.x1, diff.bbox.y1].join(",")} ` +
        `goalCell=${[rect.x, rect.y, rect.w, rect.h].join(",")} elapsedMs=${r2(diff.elapsedMs)}`,
    );

    expect(diff.changed, "the goal's own pulse keeps the board alive").toBeGreaterThan(0);
    expect(diff.bbox, "the union bbox is reported, never assumed").not.toBeNull();
    // R-M1, as a falsifier: a portal breathing, a grid line shimmering, an echo fading
    // or a HUD beat on the canvas would each land outside this rect.
    expect(bboxWithin(diff.bbox, rect, 2), "every moved pixel is inside the goal's cell").toBe(true);
  });

  test("A-10 — entry, Undo and Restart are not events: the board is still after the state lands", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);
    const rect = goalRect(geometry, PORTAL.level.goal);

    // Entry: settle twice (the flip budget plus a margin), then require the board to be
    // at rest *other* than the goal. A beat that fired at entry would still be moving
    // here; a beat that fires at entry and is over by then is caught by the row below
    // (nothing may be left moving at all).
    await settle(page);
    await settle(page);
    await captureFrame(page);
    const afterEntry = await frameDiffAfter(page, 700);
    expect(bboxWithin(afterEntry.bbox, rect, 2), "level entry leaves the board still").toBe(true);

    // Undo: commit a move, undo it, and then require the restored board to be at rest.
    const before = await hud(page);
    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    await settle(page);
    await pressUndoKey(page);
    await settle(page);
    const undone = await hud(page);
    expect(undone.moves).toBe(before.moves);
    await settle(page);
    await captureFrame(page);
    const afterUndo = await frameDiffAfter(page, 700);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-10 restored-board diffs entry=${String(afterEntry.changed)} undo=${String(afterUndo.changed)} ` +
        `undoBbox=${afterUndo.bbox === null ? "null" : [afterUndo.bbox.x0, afterUndo.bbox.y0, afterUndo.bbox.x1, afterUndo.bbox.y1].join(",")}`,
    );
    expect(bboxWithin(afterUndo.bbox, rect, 2), "Undo restores without firing a beat").toBe(true);

    // Restart: same claim on the other restoration path.
    await pressRestartKey(page);
    await settle(page);
    await settle(page);
    await captureFrame(page);
    const afterRestart = await frameDiffAfter(page, 700);
    expect(bboxWithin(afterRestart.bbox, rect, 2), "Restart restores without firing a beat").toBe(true);

    // The DOM half of the deny list: HUD digits are a text swap only, the phase chip
    // does not swap while idle, and nothing anywhere in the document is mid-animation.
    const first = await domSnapshot(page);
    await page.waitForTimeout(2000);
    const second = await domSnapshot(page);
    expect(second).toEqual(first);
    expect(second["runningAnimations"]).toEqual([]);
  });
});

test.describe("§6.4 MV-4 / A-9 — reduced motion is a data flip", () => {
  test.use({ reducedMotion: "reduce" });

  test("every declared reduced form reproduces: no scale, no translation, no idle motion", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const watch = watchErrors(page);

    await installPixelReadback(page);
    await openLevel(page, levelUrl(SIMPLE_LEVEL_ID));
    const geometry = await boardGeometry(page, SIMPLE.level);
    const rect = goalRect(geometry, SIMPLE.level.goal);
    await settle(page);
    await settle(page);

    // The two data flips, read from the shell the HUD writes them to.
    const vars = await page.evaluate(() => {
      const shell = document.querySelector(".ps-shell");
      if (shell === null) return null;
      const style = getComputedStyle(shell);
      return {
        pressScale: style.getPropertyValue("--ps-press-scale").trim(),
        panelOffset: style.getPropertyValue("--ps-panel-offset").trim(),
      };
    });
    expect(vars).toEqual({ pressScale: "1", panelOffset: "0px" });

    // R-M1's one magnet dies (§6.6 B7/§6.4 "no object scale"): on an idle board under
    // reduced motion there is *nothing* left moving, so two frames 2 s apart are
    // identical — a strictly stronger statement than A-8's bbox containment.
    await captureFrame(page);
    const idle = await frameDiffAfter(page, 2000);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-9 reduced idle changed=${String(idle.changed)} maxDelta=${String(idle.maxDelta)} ` +
        `goalCell=${[rect.x, rect.y, rect.w, rect.h].join(",")}`,
    );
    expect(idle.changed, "the goal's idle pulse is a data flip, so it is gone").toBe(0);
    expect(idle.maxDelta).toBe(0);

    // B12's scale dies (kept as a value state): the same held press as the normal-motion
    // row, on an armed button, with the transform pinned at 1 for the whole hold.
    const leg = SIMPLE.legs[0];
    expect(leg).toBeDefined();
    if (leg === undefined) return;
    await pressDirection(page, leg.direction);
    await settle(page);
    const { samples, hit } = await holdAndSample(page, "Restart");
    expect(samples.length).toBeGreaterThan(3);
    const scales = new Set(samples.map((sample) => sample.scaleX.toFixed(3)));
    // eslint-disable-next-line no-console
    console.log(`[QA-017] A-9 reduced press scales=${[...scales].join(",")} hit=${hit ?? "null"}`);
    expect([...scales]).toEqual(["1.000"]);
    expect(hit).toBe("Restart");

    // Legibility identical: the *state* read survives with the motion removed. The
    // portal's live/dormant channel is a swap, not a beat, so the A-3 census must return
    // the same verdict with the arrival turn suppressed — measured on a fresh L11.
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const portalGeometry = await boardGeometry(page, PORTAL.level);
    await settle(page);
    const portalStart = await hud(page);
    expect(portalStart.phase).toBe("A");
    const dormant = await portalEndCensus(page, portalGeometry, "A", END_LIVE);
    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    await settle(page);
    const live = await portalEndCensus(page, portalGeometry, "B", END_LIVE);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-9 reduced legibility dormant.inner=${String(dormant.innerInk)} dormant.ink=${String(dormant.ink)} ` +
        `live.inner=${String(live.innerInk)} live.ink=${String(live.ink)}`,
    );
    expect(dormant.innerInk, "the reduced state swap withholds the swirl the same way").toBe(0);
    expect(live.innerInk, "…and shows it, with no turn required").toBeGreaterThan(20);
    expect(live.ink).toBeGreaterThan(dormant.ink);

    // B13's offset dies while the alpha fade is kept (MV-4 "kept (alpha only)"). A fresh
    // L1: the par route is walked from the level's own start state, never mid-game.
    await openLevel(page, levelUrl(SIMPLE_LEVEL_ID));
    await settle(page);
    await pressRoute(page, SIMPLE.route);
    const won = await hud(page);
    expect(won.won).toBe(true);
    const dialog = await page.evaluate(() => {
      const node = document.querySelector(".ps-dialog");
      if (node === null) return null;
      const style = getComputedStyle(node);
      const matrix = style.transform === "none" ? null : new DOMMatrixReadOnly(style.transform);
      return {
        name: style.animationName,
        duration: style.animationDuration,
        translateY: matrix === null ? 0 : matrix.f,
      };
    });
    // eslint-disable-next-line no-console
    console.log(`[QA-017] A-9 reduced panel=${JSON.stringify(dialog)} declaredDelay=${String(flipTimings(true).total)}ms`);
    expect(dialog?.name, "the alpha fade is kept under reduced motion").toBe("ps-panel-in");
    expect(dialog?.duration).toBe("0.16s");
    expect(Math.abs(dialog?.translateY ?? 99), "the entrance offset dies").toBeLessThan(1);
    expect(flipTimings(true).total, "the reduced flip budget is the panel's own delay").toBeLessThan(
      flipTimings(false).total,
    );

    expectNoPageErrors(watch, "L1 + L11 reduced-motion run");
  });
});