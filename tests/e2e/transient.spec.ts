/**
 * Standing e2e — **the transient-frame capture protocol** (QA-005; the UA
 * Entry-2 CONDITIONAL adjudication).
 *
 * ── The question ─────────────────────────────────────────────────────────────
 * This game has exactly two sub-frame-rate visual events, and both are defined in
 * the frozen §6.1/§6.2 timing table:
 *
 * | transient | row | length |
 * |---|---|---|
 * | §6.5 refusal arc (deny nudge + deny ring) | `deny` | **90 ms** |
 * | §6.2 switch press beat (`switchPressEmphasis`) | `occupied` | **80 ms** (140 → 220) |
 *
 * The obvious capture channels are both dead for them:
 *
 * - **CDP `Page.captureScreenshot`** — a ~670 ms round trip *independent of the
 *   clip size*, so it cannot sample a 90 ms event at all;
 * - **`canvas.toDataURL()` on the WebGL buffer** — all black, because Phaser
 *   creates its context without `preserveDrawingBuffer`.
 *
 * ── The answer: yes, they are reachable — with an in-page resampler ──────────
 * The suite installs `installPixelReadback` (`addInitScript` wrapping
 * `HTMLCanvasElement.prototype.getContext` and forcing `preserveDrawingBuffer` on
 * the attributes Phaser itself passes — **no `src/**` change**), then reads the
 * presented frame *inside the page* in a `requestAnimationFrame` loop, with
 * `drawImage` + `getImageData` over a small region of interest. That is ~0.3 ms
 * per frame instead of a 670 ms round trip, so the 60 Hz frame grid survives.
 *
 * The protocol is **re-runnable and self-checking**: it asserts the frame grid it
 * achieved (median frame interval), that the picture was frozen before the
 * trigger, that it moved, and that it stopped — all frame-to-frame, i.e. on a
 * channel that never needs to know what the two pictures *are*. Raw pixels never
 * leave the page; only compact per-frame scalars do.
 *
 * ── The one thing the channel cannot show, and why that is a proof ───────────
 * The switch press beat is **physically unreachable on the canvas**, and this file
 * proves it rather than hand-waving it:
 *
 * - the emphasis is `sin(πp)` over `occupied` = 140 → 220 ms, so `emphasis > 0`
 *   ⟺ `t ∈ (140, 220]`;
 * - the hop (`hop.start = 0`, `hop.dur = 130`) is already over by then, so for the
 *   whole emphasis window the actor is drawn *at the tile centre*;
 * - the actor is an opaque disc of diameter `0.70 × cell` (L5, above every L4
 *   layer, body painted last), while the switch box is `0.40 × cell` on a side —
 *   its furthest corner from the tile centre is `0.283 × cell` away, plus half the
 *   widest stroke. `0.283 + stroke/cell < 0.35` at every shipped cell size, so the
 *   disc **strictly contains** the box and its 3 px stroke.
 *
 * The beat is therefore a *real* one-shot animation of a graphic that is always
 * behind the player. `switch.spec`-level claims about it belong to the painter's
 * own unit tests; a canvas assertion would be a false promise, so this file makes
 * the stronger statement: the geometry and the timing make the stroke invisible by
 * construction, and the pixels confirm it (the settled scanline across the switch
 * box is uniform actor body).
 */

import { expect, test } from "@playwright/test";

import { loadReferenceLevels, levelUrl, refOf } from "./helpers/levels";
import {
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  sampleCanvas,
  waitForFrames,
} from "./helpers/game";
import {
  measureFrameGrid,
  reportTransient,
  roiAround,
  SCREENSHOT_ROUND_TRIP_MS,
  startRecorder,
  stopRecorder,
} from "./helpers/capture";
import { switchParts } from "@/game/renderer/objects/switch";
import { cellRect } from "@/game/renderer/grid-mapping";
import { FLIP_TIMING, FLIP_VARIANT, theme } from "@/game/theme/tokens";
import type { Rgb } from "./helpers/game";

const REFS = loadReferenceLevels();

/** The phase the suite runs without reduced motion — the shipped Variant S table. */
const TIMINGS = FLIP_TIMING[FLIP_VARIANT];

/**
 * Recorder window on a machine whose frame grid is already 60 Hz (`>= 29 ms`).
 * The original QA-005 protocol value: ~24 frames, enough to resolve a 90 ms arc
 * several times over.
 */
const BASE_RECORD_MS = 700;
/**
 * How many of the *runner's own* frames the recorder window must span.
 *
 * QA-005c: the window is sized from the measured grid, so the `> 15 frames` tooth
 * ("the recorder really ran, frame by frame") survives on a CI runner rendering
 * at ~8 fps instead of failing the local 700 ms constant. On local 60 Hz this is
 * below `BASE_RECORD_MS` and changes nothing.
 */
const MIN_RECORD_FRAMES = 24;
/**
 * The original `gridMs < 60` local ceiling — kept as the **floor** of a derived
 * bound. On a runner whose own frames are slower than this, the recorder is
 * judged against that runner's own grid instead; the semantic is "the recorder
 * kept the machine's frame grid", which is what makes the channel a rAF grid and
 * not a 670 ms screenshot round trip.
 */
const GRID_CEILING_MS = 60;

test.describe("the resampling channel", () => {
  test("the channel is live: the presented WebGL frame reads back as real colours", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const health = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (canvas === null) throw new Error("no canvas");
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      if (ctx === null) throw new Error("no 2d context");
      ctx.drawImage(canvas, 0, 0);
      const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
      const seen = new Set<string>();
      for (let i = 0; i < data.length; i += 4 * 613) {
        seen.add(`${String(data[i] ?? 0)},${String(data[i + 1] ?? 0)},${String(data[i + 2] ?? 0)}`);
      }
      return { distinct: seen.size };
    });
    // A dead read-back channel is a single flat colour: fail loudly rather than
    // reporting "the transient was not there".
    expect(health.distinct, "the canvas read-back has colour (not the black WebGL trap)").toBeGreaterThan(
      4,
    );
  });
});

test.describe("P1 — the §6.5 refusal arc (90 ms) is reachable on the frame grid", () => {
  test(`a refused move produces a bounded, centred, settling transient shorter than the flip budget`, async ({
    page,
  }) => {
    const ref = refOf(REFS, 1);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const geometry = await boardGeometry(page, ref.level);

    // The player's own cell — the deny nudge and the deny ring are both anchored
    // to it (R-Z7: player-anchored L5 treatments).
    const player = { x: ref.level.player[0], y: ref.level.player[1] };
    const roi = roiAround(geometry.cellCenterDevice(player.x, player.y), geometry.layout.cellSize / 2 + 8);

    // ── calibrate to THIS runner before the trigger ───────────────────────────
    // The bounds below are stated relative to the machine's own frame grid, so a
    // 2-core software-GL CI runner (measured: 6 frames / 700 ms, item 57) is
    // judged on its own terms instead of on a local-machine constant.
    const idle = await measureFrameGrid(page);
    expect(
      idle.gridMs,
      "the machine renders animation frames at all — the channel is a rAF grid, not the ~670 ms screenshot round trip",
    ).toBeLessThan(SCREENSHOT_ROUND_TRIP_MS / 2);
    expect(idle.frames, "the frame-grid calibration itself ran").toBeGreaterThan(3);
    const recordMs = Math.max(BASE_RECORD_MS, Math.round(idle.gridMs * MIN_RECORD_FRAMES));
    const gridCeiling = Math.max(GRID_CEILING_MS, idle.gridMs * 2);

    await startRecorder(page, roi, recordMs);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(Math.round(recordMs * 0.7));
    const stats = await stopRecorder(page, roi);
    const report = reportTransient(stats);

    // ── the channel was real: a rendered-frame grid, not a few lucky screenshots ──
    // The read-back costs ~0.3 ms/frame, so the recorder's grid IS the runner's
    // grid; the window is sized from the measured grid (above), which keeps the
    // "the recorder really ran" tooth meaningful on any runner. The claim that
    // matters is the *order of magnitude*: the runner's own frames, not the 670 ms
    // CDP screenshot round trip that makes a 90 ms event unreachable.
    expect(report.frames, "the recorder ran long enough to resolve a 90 ms event").toBeGreaterThan(15);
    expect(
      report.gridMs,
      `median frame interval is the runner's own frame grid (<${String(gridCeiling)} ms), not a CDP screenshot round trip`,
    ).toBeLessThan(gridCeiling);

    // ── the shape: frozen, then moved, then stopped ───────────────────────────
    expect(report.onset, "the refusal beat reached the frame grid").not.toBeNull();
    expect(report.durationMs, "the beat is short — far below the 220 ms flip budget").not.toBeNull();
    // Bounded by the flip budget **plus frame quantisation**: a coarse grid cannot
    // fake a long beat, and a slow runner is not failed for its own frame width.
    expect(report.durationMs ?? 999, "the refusal beat is resolved, not smeared").toBeLessThanOrEqual(
      TIMINGS.total + 2 * report.gridMs,
    );
    // Self-calibrating: the measured window is the documented 90 ms row plus at most
    // one frame of quantisation on each side, so a coarse grid cannot fake a long beat.
    expect(
      report.durationMs ?? 999,
      "the measured window is the §6.5 deny row plus frame quantisation",
    ).toBeLessThanOrEqual(TIMINGS.deny.dur + 2 * report.gridMs + 4);
    expect(report.peakPrevChanged, "the beat actually changed pixels").toBeGreaterThan(50);
    expect(report.settledAt, "the board returns to a settled picture").not.toBeNull();

    // ── the anchor: the movement is *at the player's tile*, not somewhere else ─
    const moving = stats.filter((frame) => frame.changed > 0 && frame.centroid.x !== 0);
    expect(moving.length).toBeGreaterThan(0);
    const centre = { x: roi.w / 2, y: roi.h / 2 };
    for (const frame of moving) {
      expect(
        Math.hypot(frame.centroid.x - centre.x, frame.centroid.y - centre.y),
        `the refusal transient must stay inside the player's cell (t=${frame.t.toFixed(0)} ms)`,
      ).toBeLessThan(roi.w / 4);
    }

    // ── and the refusal itself is still a triple freeze ───────────────────────
    const state = await hud(page);
    expect(state.moves).toBe(0);
    expect(state.phase).toBe(ref.level.startPhase);
  });
});

test.describe("P2 — the switch press beat is occluded by construction", () => {
  test("the emphasis window starts after the hop ends, so the actor is on the tile centre throughout", () => {
    // §6.2 rows: emphasis rides `occupied`, the actor rides `hop`.
    expect(TIMINGS.occupied.start, "occupied starts at 140 ms").toBeGreaterThanOrEqual(
      TIMINGS.hop.start + TIMINGS.hop.dur,
    );
    // At the emphasis peak the hop is long over — no motion can uncover the box.
    const peak = TIMINGS.occupied.start + TIMINGS.occupied.dur / 2;
    expect(peak).toBeGreaterThanOrEqual(TIMINGS.hop.start + TIMINGS.hop.dur);
    // And an emphasis is a one-shot: at rest (p = 1) it reads 0 (R-C8).
    expect(TIMINGS.occupied.start + TIMINGS.occupied.dur).toBeLessThanOrEqual(TIMINGS.total);
  });

  test("the actor disc strictly contains the switch box and its widest stroke, measured from pixels", async ({
    page,
  }) => {
    const ref = refOf(REFS, 8);
    const route = ["up", "right", "right", "down", "right"] as const; // onto door d1 at (3,1)
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);

    for (const direction of route) await pressDirection(page, direction);
    await waitForFrames(page, 4);
    const state = await hud(page);
    expect(state.phase).toBe("B");

    const tile = { x: 3, y: 1 };
    const centre = geometry.cellCenterDevice(tile.x, tile.y);
    const cell = geometry.layout.cellSize;

    // Measure the actor's radius from the canvas: the contiguous run of actor-body
    // pixels across the cell's centre row (the body is the last-painted layer).
    const points: { x: number; y: number }[] = [];
    for (let dx = -Math.ceil(cell / 2); dx <= Math.ceil(cell / 2); dx += 1) {
      points.push({ x: centre.x + dx, y: centre.y });
    }
    const samples = await sampleCanvas(page, points);
    const body = theme("B").actor.body;
    const bodyRgb: Rgb = [
      Number.parseInt(body.slice(1, 3), 16),
      Number.parseInt(body.slice(3, 5), 16),
      Number.parseInt(body.slice(5, 7), 16),
    ];
    const isBody = (sample: Rgb | undefined): boolean =>
      sample !== undefined &&
      Math.max(
        Math.abs(sample[0] - bodyRgb[0]),
        Math.abs(sample[1] - bodyRgb[1]),
        Math.abs(sample[2] - bodyRgb[2]),
      ) <= 2;
    const matches = samples.map((sample) => isBody(sample));
    let longest = 0;
    let current = 0;
    for (const hit of matches) {
      current = hit ? current + 1 : 0;
      longest = Math.max(longest, current);
    }
    const actorRadius = longest / 2;
    expect(actorRadius, "the actor body was found on its own tile").toBeGreaterThan(cell * 0.3);

    // The production switch geometry, at its widest (emphasis = 1).
    const rect = cellRect(geometry.layout, tile.x, tile.y);
    const parts = switchParts(rect, cell, geometry.renderScale, 1);
    const farCorner = Math.hypot(parts.box.w / 2, parts.box.h / 2) + parts.strokeWidth / 2;

    expect(
      farCorner,
      `the switch box's furthest inked point (${farCorner.toFixed(1)} px) must be inside the actor disc (r=${actorRadius.toFixed(1)} px)`,
    ).toBeLessThan(actorRadius);

    // The pixel cross-check: at rest the scanline across the box is uniform actor
    // body — the switch, in either latch state, is not visible while occupied.
    expect(
      longest / matches.length,
      "the occupied cell's centre row is dominated by the actor body, not by the switch outline",
    ).toBeGreaterThan(0.5);
  });

  test("the arrival transient at the switch tile is bounded and settles", async ({ page }) => {
    const ref = refOf(REFS, 8);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);
    const tile = { x: 2, y: 0 }; // L8's switch s1

    await pressDirection(page, "up");
    await pressDirection(page, "right");
    await waitForFrames(page, 3);
    const before = await hud(page);
    expect(before.moves, "precondition: standing next to the switch").toBe(2);

    // ROI = the switch cell, and only it: the box (40 %) plus a margin, so the
    // scanline's reference pixel is the cell ground rather than the neighbour.
    const roi = roiAround(
      geometry.cellCenterDevice(tile.x, tile.y),
      Math.round((geometry.layout.cellSize * 0.4) / 2) + 8,
    );

    // Calibrate to this runner (QA-005c): window and bounds follow the machine's
    // own frame grid, so a CI software-GL runner is measured on its own terms.
    const idle = await measureFrameGrid(page);
    expect(
      idle.gridMs,
      "the machine renders animation frames at all — the channel is a rAF grid, not the ~670 ms screenshot round trip",
    ).toBeLessThan(SCREENSHOT_ROUND_TRIP_MS / 2);
    expect(idle.frames, "the frame-grid calibration itself ran").toBeGreaterThan(3);
    const recordMs = Math.max(BASE_RECORD_MS, Math.round(idle.gridMs * MIN_RECORD_FRAMES));
    const gridCeiling = Math.max(GRID_CEILING_MS, idle.gridMs * 2);

    await startRecorder(page, roi, recordMs);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(Math.round(recordMs * 0.7));
    const stats = await stopRecorder(page, roi);
    const report = reportTransient(stats);

    expect(report.frames).toBeGreaterThan(15);
    expect(
      report.gridMs,
      `median frame interval is the runner's own frame grid (<${String(gridCeiling)} ms)`,
    ).toBeLessThan(gridCeiling);
    expect(report.onset, "the arrival reached the frame grid").not.toBeNull();
    expect(
      report.durationMs ?? 999,
      "the arrival transient (hop + press beat + cross-fade) is bounded by the §6.1 budget plus frame quantisation",
    ).toBeLessThanOrEqual(TIMINGS.total + 120 + 2 * report.gridMs);
    expect(report.settledAt).not.toBeNull();

    // The beat's own row is inside the window — the emphasis is a live animation
    // even though its graphic is occluded. The ±40 ms band is widened by one
    // frame of the *measured* grid so a coarse runner still puts a sample in it.
    const tolerance = 40 + report.gridMs;
    const beat = stats.filter(
      (frame) =>
        frame.t >= (report.onset ?? 0) + TIMINGS.occupied.start - tolerance &&
        frame.t <= (report.onset ?? 0) + TIMINGS.occupied.start + TIMINGS.occupied.dur + tolerance,
    );
    expect(beat.length, "the occupied row was sampled at least once").toBeGreaterThan(0);

    const after = await hud(page);
    expect(after.moves).toBe(3);
    expect(after.phase).toBe("B");
  });

  test("the switch cell's outline is never readable while the player occupies it", async ({ page }) => {
    const ref = refOf(REFS, 8);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);
    const tile = { x: 2, y: 0 };
    const centre = geometry.cellCenterDevice(tile.x, tile.y);
    const boxHalf = (geometry.layout.cellSize * 0.4) / 2;

    // Settled on the switch tile, phase B.
    for (const direction of ["up", "right", "right"] as const) await pressDirection(page, direction);
    await waitForFrames(page, 4);
    expect((await hud(page)).phase).toBe("B");

    // A diagonal through the box's corners: any point on the box's outline is at
    // most `boxHalf * sqrt(2)` from the tile centre.
    const points = [-1, 0, 1].flatMap((sx) =>
      [-1, 0, 1].map((sy) => ({
        x: centre.x + sx * Math.round(boxHalf),
        y: centre.y + sy * Math.round(boxHalf),
      })),
    );
    const samples = await sampleCanvas(page, points);
    const body = theme("B").actor.body;
    const bodyRgb: Rgb = [
      Number.parseInt(body.slice(1, 3), 16),
      Number.parseInt(body.slice(3, 5), 16),
      Number.parseInt(body.slice(5, 7), 16),
    ];
    const outline = theme("B").obj.switch;
    const outlineRgb: Rgb = [
      Number.parseInt(outline.slice(1, 3), 16),
      Number.parseInt(outline.slice(3, 5), 16),
      Number.parseInt(outline.slice(5, 7), 16),
    ];
    const distance = (a: Rgb, b: Rgb): number =>
      Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

    for (const [index, sample] of samples.entries()) {
      expect(sample, "every probe returned a pixel").toBeDefined();
      if (sample === undefined) continue;
      expect(
        distance(sample, outlineRgb),
        `probe ${String(index)} lands on the switch box outline, so it must not be the switch token`,
      ).toBeGreaterThan(2);
    }
    // …and at least the centre probe *is* the actor: the cell reads as the player.
    const centreSample = samples[4];
    expect(centreSample).toBeDefined();
    if (centreSample !== undefined) {
      expect(distance(centreSample, bodyRgb), "the tile centre is the actor body").toBeLessThanOrEqual(2);
    }
  });
});