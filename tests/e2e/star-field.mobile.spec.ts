/**
 * QA-019 (mobile profile) — **the §5.5 star field at the Pixel 5 pitch**.
 *
 * `docs/ui-ux.md` §6.6 asks A-11/A-12 to hold "at the desktop **and** the mobile
 * pitch", and §5.5's field is a DOM row whose every declared number is in **CSS px**:
 * 3 × 20 px slots + 2 × 8 px gaps = the 76 px row, a 5 CSS px dot, a 20 px star box.
 * The mobile profile is therefore the class where the *rasterisation* could betray the
 * declaration and nothing else could — R-L6 caps the **canvas** render scale at
 * `min(dpr, 2)` while the DOM is still rasterised at the device's 2.75×, so this is the
 * only pitch in the suite where the row's ink is resolved into finer device pixels than
 * the board's own art.
 *
 * What this file adds over `star-field.spec.ts` (and refuses to repeat):
 *
 * 1. **The row's geometry and its three states survive the pitch** — the slots are the
 *    declared CSS boxes (no reflow, no squeeze), and a real padded run still lands
 *    `earned · held · empty`.
 * 2. **The stillness law at this pitch** (SF-8): two captures 2 s apart are 0 px, and
 *    no animation is left running.
 * 3. **The census at the device-pixel scale**: the same A-11 arithmetic the desktop row
 *    runs (token identity, the declared silhouette area, the 0.8 knock-out's 31–41 %
 *    band, the ≈ 2.78:1 fill ratio, the 5 CSS px dot, the ≥ 3.0:1 floors) measured on
 *    the 2.75× raster.
 * 4. **A real touch tap on Next** at this pitch — a pointer event, not a raw click, so
 *    the added row cannot have eaten the button's hit area.
 *
 * Guarded by `testMatch: "**\/*.mobile.spec.ts"` in `playwright.config.ts`, so the rows
 * run on a real Pixel 5 emulation (touch + mobile UA), never on a shrunken desktop
 * window.
 */

import { expect, test } from "@playwright/test";

import { STAR_BOX_PX } from "@/game/hud/hud-styles";
import { LAYOUT, theme } from "@/game/theme/tokens";

import { hexToRgb } from "./helpers/art";
import { hud, installPixelReadback, openLevel, pressRoute, settle } from "./helpers/game";
import { levelUrl } from "./helpers/levels";
import {
  A_LADDER,
  A_REF,
  B_REF,
  censusAllThreeStates,
  detoursFor,
  expectCensus,
  paddedRoute,
  r2,
  runningStarAnimations,
  seedBest,
  slotStates,
  slackK1,
} from "./helpers/star-field";
import { captureClip, gridDiff } from "./helpers/star-pixels";

test.describe("§5.5 A-12 (mobile pitch) — the row is the declared 76 px at the device scale", () => {
  test("three states on a real run, 0 px over 2 s, and a touch tap still advances", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(A_REF.id));
    await seedBest(page, { [String(A_REF.id)]: A_LADDER.boundary2 });
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, A_LADDER.oneStar)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
    await settle(page);
    await settle(page);

    // ── the row's own box, in CSS px, at this pitch
    const row = await page.locator(".ps-stars").boundingBox();
    expect(row).not.toBeNull();
    if (row === null) return;
    const slots = await page.locator(".ps-star").evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { w: box.width, h: box.height };
      }),
    );
    // eslint-disable-next-line no-console
    console.log(
      `[QA-019] mobile A-12 row=${r2(row.width)}x${r2(row.height)}css ` +
        `slots=${slots.map((slot) => `${r2(slot.w)}x${r2(slot.h)}`).join(",")} dpr=${String(await page.evaluate(() => window.devicePixelRatio))}`,
    );
    expect(row.width, "3 × 20 px + 2 × 8 px, unchanged by the pitch").toBeCloseTo(
      3 * STAR_BOX_PX + 2 * LAYOUT.controlGap,
      0.5,
    );
    expect(row.height).toBeCloseTo(STAR_BOX_PX, 0.5);
    for (const slot of slots) {
      expect(slot.w, "every slot is its declared 20 px box").toBeCloseTo(STAR_BOX_PX, 0.5);
      expect(slot.h).toBeCloseTo(STAR_BOX_PX, 0.5);
    }
    expect(await slotStates(page), "run 1★ against a stored 2★ record").toEqual(["earned", "held", "empty"]);

    // ── SF-8 at this pitch: the field is a constant
    const before = await captureClip(page, row);
    await page.waitForTimeout(2_000);
    const after = await captureClip(page, row);
    const diff = gridDiff(before, after);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-019] mobile A-12 idle scale=${r2(before.scale)} device=${String(before.width)}x${String(before.height)} ` +
        `changed=${String(diff.changed)}/${String(diff.total)} maxDelta=${String(diff.maxDelta)}`,
    );
    expect(before.scale, "the census really ran on the device-pixel copy").toBeGreaterThan(1.5);
    expect(diff.changed, "SF-8: no shimmer, twinkle, pulse, breathe or loop — 0 px").toBe(0);
    expect(diff.maxDelta).toBe(0);
    expect(await runningStarAnimations(page), "nothing is left running").toBe(0);

    // ── a real touch tap on Next: the added row did not eat the button
    await page.getByRole("button", { name: "Next" }).tap();
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(false);
    const advanced = await hud(page);
    expect(advanced.moves, "the tap advanced into the next level").toBe(0);
  });
});

test.describe("§5.5 A-11 (mobile pitch) — the painted census at the device scale", () => {
  test("both phases bind ≥ 3.0:1 with the declared areas, ratio and knock-out", async ({ page }) => {
    const aCensus = await censusAllThreeStates(page, {
      ref: A_REF,
      bestMoves: A_LADDER.boundary2,
      runMoves: A_LADDER.oneStar,
      phase: "A",
    });
    expect(aCensus).not.toBeNull();
    if (aCensus === null) return;
    expectCensus(aCensus, `mobile phase A (L${String(A_REF.id)})`);

    const bCensus = await censusAllThreeStates(page, {
      ref: B_REF,
      bestMoves: B_REF.par + 2 * slackK1(B_REF.par),
      runMoves: B_REF.par + 2 * slackK1(B_REF.par) + 2,
      phase: "B",
    });
    expect(bCensus).not.toBeNull();
    if (bCensus === null) return;
    expectCensus(bCensus, `mobile phase B (L${String(B_REF.id)})`);

    // …and both rows were read from the *phone* pixels: the same law on a 2.75× raster
    // of a 20 CSS px box, where the ground is the phase's own plate.
    expect(aCensus.grid.scale).toBeGreaterThan(1.5);
    expect(bCensus.grid.scale).toBeGreaterThan(1.5);
    expect(aCensus.plateToken).toEqual(hexToRgb(theme("A").ground.plate));
    expect(bCensus.plateToken).toEqual(hexToRgb(theme("B").ground.plate));
  });
});