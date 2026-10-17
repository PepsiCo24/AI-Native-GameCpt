/**
 * QA-017 (mobile profile) — the §3.1e rows that are **pitch-dependent**.
 *
 * `docs/ui-ux.md` §6.6 A-2 asks for the mapped contrast "at desktop **and** the mobile
 * pitch", and A-8's stillness law is a claim about the presented board at *every*
 * pitch — the pulse is a size rule, so R-L6's `min(dpr, 2)` render scale changes the
 * cell's device size and nothing else. Two facts follow, and this file is exactly
 * those two:
 *
 * 1. **The mount's colour survives the downscale.** The bytes are pitch-independent
 *    (A-2's ≥ 6.2:1 is measured on the served files in `portal-mount.spec.ts` and is
 *    not re-derived here), so what the mobile row adds is the *fidelity of the paint*:
 *    the ink the board actually presents at the Pixel 5 pitch must still be the signed
 *    colour — a re-tinted or re-framed raster would show up here and nowhere else.
 * 2. **R-M1's one magnet is the goal at every pitch**, so the idle census is repeated
 *    at the mobile profile against the goal's own cell rect.
 *
 * Guarded by `testMatch: "**\/*.mobile.spec.ts"` in `playwright.config.ts`, so the
 * rows run on a real Pixel 5 emulation (touch + mobile UA), never on a shrunken
 * desktop window.
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { isAltCell } from "@/game/renderer/grid-mapping";
import { LAYOUT, theme } from "@/game/theme/tokens";

import { contrastRGB, hexToRgb, servedPngCensus } from "./helpers/art";
import { bboxWithin, cellCensus, profileDelta } from "./helpers/frames";
import type { CellCensus, RgbBytes } from "./helpers/frames";
import {
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  phaseOf,
  pressDirection,
  settle,
} from "./helpers/game";
import type { BoardGeometry } from "./helpers/game";
import { levelUrl, loadReferenceLevels, refOf } from "./helpers/levels";
import { idleStillnessProof } from "./helpers/pulse-schedule";

const REFS = loadReferenceLevels();
const PORTAL_LEVEL_ID = 11;
const PORTAL = refOf(REFS, PORTAL_LEVEL_ID);
const PAIR = PORTAL.level.portals[0]?.pair ?? [];
const END_LIVE: readonly [number, number] = PAIR[0] ?? [0, 0];
const END_FAR: readonly [number, number] = PAIR[1] ?? [0, 0];
const FIRST_LEG = PORTAL.legs[0];

function groundOf(phase: "A" | "B", x: number, y: number): string {
  const ground = theme(phase).ground;
  return isAltCell(x, y) ? ground.cellAlt : ground.cell;
}

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

function rgbDistance(a: RgbBytes, b: RgbBytes): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

test.describe("§3.1e A-2 (mobile pitch) — the signed colour is what the board paints", () => {
  test("at the R-L6 render scale the live end still paints the served raster's own ink", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);
    await settle(page);

    // The pitch claim only means something below R-L5's board cap: at the mobile
    // profile the board is width-limited, so the cell is genuinely smaller and the
    // render scale genuinely 2 (the R-L6 cap).
    const cellCss = geometry.layout.cellSize / geometry.renderScale;
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-2 mobile pitch cellCss=${cellCss.toFixed(1)} cellDevice=${String(geometry.layout.cellSize)} ` +
        `renderScale=${String(geometry.renderScale)} dpr=${String(geometry.renderScale)}`,
    );
    expect(geometry.renderScale).toBe(LAYOUT.maxRenderScale);
    expect(cellCss, "R-L1's 44 px floor still holds at this pitch").toBeGreaterThanOrEqual(LAYOUT.minCellTarget);

    // The contrast itself is a property of the bytes (see `portal-mount.spec.ts` A-2);
    // it is re-read here so this row's statement is self-contained and cannot drift from
    // the file the loader fetched.
    const portalA = await servedPngCensus(page, "portal_a");
    const portalB = await servedPngCensus(page, "portal_b");
    expect(portalA).not.toBeNull();
    expect(portalB).not.toBeNull();
    if (portalA === null || portalB === null) return;
    const swappedB = contrastRGB(portalB.core as RgbBytes, hexToRgb(theme("A").ground.cell));
    const swappedA = contrastRGB(portalA.core as RgbBytes, hexToRgb(theme("B").ground.cell));
    expect(swappedB).toBeGreaterThanOrEqual(6.2);
    expect(swappedA).toBeGreaterThanOrEqual(6.2);

    expect(FIRST_LEG).toBeDefined();
    if (FIRST_LEG === undefined) return;
    await pressDirection(page, FIRST_LEG.direction);
    const flipped = await hud(page);
    expect(flipped.phase).toBe("B");
    await settle(page);

    const live = await portalEndCensus(page, geometry, "B", END_LIVE);
    const far = await portalEndCensus(page, geometry, "B", END_FAR);
    const servedCore = portalA.core as RgbBytes;
    // eslint-disable-next-line no-console
    console.log(
      `[QA-017] A-2 mobile painted core live=${live.core.map((c) => Math.round(c)).join(",")} ` +
        `far=${far.core.map((c) => Math.round(c)).join(",")} served=${servedCore.map((c) => Math.round(c)).join(",")} ` +
        `inkB=${String(live.ink)} innerB=${String(live.innerInk)}`,
    );

    // The mount's fidelity: the ink on the board is the signed colour, not a re-tint.
    // The tolerance is the census's own composite slack — anti-aliased edge pixels
    // carry the B ground into the mean, which is what keeps the number honest.
    expect(live.ink).toBeGreaterThan(0);
    expect(rgbDistance(live.core, servedCore), "the painted ink is the served A-06 bytes").toBeLessThanOrEqual(24);
    expect(rgbDistance(far.core, servedCore)).toBeLessThanOrEqual(24);
    // …and both ends carry the *same* figure at this pitch too (A-1's pairing clause,
    // re-measured where the render scale is 2 rather than 1).
    expect(Math.abs(live.ink - far.ink) / Math.max(live.ink, far.ink)).toBeLessThan(0.08);
    expect(profileDelta(live.profile, far.profile).maxBinShare).toBeLessThan(0.1);
    expect(live.innerInk > 0).toBe(far.innerInk > 0);
  });
});

test.describe("§6.6 R-M1 / A-8 (mobile pitch) — the idle board moves only inside the goal", () => {
  test("three frames across one goal-pulse period differ only inside the goal's own cell", async ({ page }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, PORTAL.level);
    await settle(page);
    await settle(page);

    // QA-020 — the same phase-invariance as the desk row (`helpers/pulse-schedule.ts`
    // carries the derivation and the measurements): the old single 2 s difference was
    // `A·|cos(θ + 150°)|` in the *capture* phase θ, so it read `changed=0` on some
    // schedules and ~1600 on others. Three samples 800 ms apart span a whole period,
    // and the best of three phases 120° apart always carries ≥ 0.866 of the pulse.
    const phase = phaseOf(await hud(page));
    const still = await idleStillnessProof(page, {
      centre: geometry.cellCenterDevice(PORTAL.level.goal[0], PORTAL.level.goal[1]),
      sampleRadius: Math.round(geometry.layout.cellSize * 0.45),
      ground: hexToRgb(groundOf(phase, PORTAL.level.goal[0], PORTAL.level.goal[1])),
    });
    const rect = cellRect(geometry, PORTAL.level.goal);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-020] A-8 mobile idle samples=${still.samples.map((d) => String(d.changed)).join("/")} ` +
        `peak=${String(still.peak)} floor=${String(still.floor)} goalRadius=${still.goalRadius.toFixed(2)} ` +
        `cell=${[rect.x, rect.y, rect.w, rect.h].join(",")} spanMs=${still.spanMs.toFixed(2)}`,
    );

    expect(still.goalRadius, "the goal's figure is painted, so the floor is measured not typed").toBeGreaterThan(0);
    expect(still.peak, "the goal's own pulse keeps the board alive").toBeGreaterThanOrEqual(still.floor);
    still.samples.forEach((diff, index) => {
      expect(
        bboxWithin(diff.bbox, rect, 2),
        `sample ${String(index + 1)} of ${String(still.samples.length)}: every moved pixel is inside the goal's cell`,
      ).toBe(true);
    });
  });
});