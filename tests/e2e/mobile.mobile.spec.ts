/**
 * Standing e2e — **mobile: layout, touch targets and gestures** (R-L5, R-L6, R-T1,
 * R-T2, R-T4, R-T5, R-T6, §7.3).
 *
 * Runs only in the `mobile` project (Pixel 5 profile: 393 × 727 @ DPR 2.75, touch
 * + mobile UA), because every claim here is a claim about *a phone*: a shrunken
 * desktop window has no touch, no `visualViewport` and DPR 1, so it cannot falsify
 * any of them. `playwright.config.ts` keeps the two profiles disjoint — the
 * `desktop` project ignores `*.mobile.spec.ts` and the `mobile` project runs only
 * those files — so a gesture assertion can never silently run on a mouse.
 *
 * The claims:
 *
 * | claim | rule | channel |
 * |---|---|---|
 * | the board fills the play area between the two bars | R-L5/§2.2 | DOM boxes |
 * | the top bar is 56 px and the bottom bar 72 px | §2.2 | DOM boxes |
 * | cells stay square and hit areas are the cell rect | R-L2/R-T3 | production `computeLayout` |
 * | the buttons are ≥ 44 × 44 CSS px with ≥ 8 px gaps | R-T1/R-T2 | DOM boxes |
 * | a tap on an adjacent cell is a `MOVE` | R-T3 | HUD + canvas read-back |
 * | a swipe ≥ 24 px is a `MOVE` on its dominant axis | R-T4 | HUD |
 * | below the 44 px cell floor a one-time swipe hint appears | R-T5 | `.ps-hint` |
 * | under 44 px cells a swipe works over the whole board | R-T5 | CDP touch |
 * | touch never shows the desktop hover ring | R-T6 | canvas read-back |
 * | the whole level chain is win-able by touch alone | §7.3 | HUD + dialog |
 */

import { expect, test } from "@playwright/test";

import { loadReferenceLevels, levelUrl, refOf } from "./helpers/levels";
import {
  boardGeometry,
  expectActorAt,
  expectMoves,
  hud,
  installPixelReadback,
  openLevel,
  sampleCanvas,
  settle,
  swipeTouch,
  tapTouch,
  waitForFrames,
} from "./helpers/game";
import { LAYOUT } from "@/game/theme/tokens";

const REFS = loadReferenceLevels();

/** §2.2 — the two fixed bars, in CSS px. */
const TOP_BAR = 56;
const BOTTOM_BAR = 72;

test.describe("mobile layout (§2.2, R-L5, R-L6)", () => {
  test("the board occupies the whole play area between the two fixed bars", async ({ page }) => {
    const ref = refOf(REFS, 10);
    await openLevel(page, levelUrl(10));

    const boxes = await page.evaluate(() => {
      const box = (selector: string): { x: number; y: number; w: number; h: number } | null => {
        const element = document.querySelector(selector);
        if (element === null) return null;
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
      };
      return {
        viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
        top: box(".ps-top"),
        bottom: box(".ps-bottom"),
        canvas: box("#app canvas"),
      };
    });

    expect(boxes.top, "the top bar exists").not.toBeNull();
    expect(boxes.bottom, "the bottom bar exists").not.toBeNull();
    expect(boxes.canvas, "the canvas exists").not.toBeNull();
    if (boxes.top === null || boxes.bottom === null || boxes.canvas === null) return;

    expect(boxes.top.h, "top bar is 56 CSS px").toBeCloseTo(TOP_BAR, 1);
    expect(boxes.top.y, "the top bar starts at the very top of the viewport").toBe(0);
    expect(boxes.bottom.h, "bottom bar is 72 CSS px").toBeCloseTo(BOTTOM_BAR, 1);
    expect(boxes.bottom.y, "the bottom bar sits directly under the canvas").toBeCloseTo(
      boxes.canvas.y + boxes.canvas.h,
      1,
    );
    expect(boxes.bottom.y + boxes.bottom.h, "the two bars bracket the whole viewport").toBeCloseTo(
      boxes.viewport.h,
      1,
    );
    expect(boxes.canvas.y, "the canvas starts where the top bar ends").toBeCloseTo(
      boxes.top.y + boxes.top.h,
      1,
    );
    expect(boxes.canvas.w, "the canvas spans the full width").toBeCloseTo(boxes.viewport.w, 1);
    expect(boxes.canvas.h, "the play area is the leftover height").toBeCloseTo(
      boxes.viewport.h - TOP_BAR - BOTTOM_BAR,
      1,
    );

    // R-L6: the renderer may cap the scale, so the backing store is exactly
    // `min(dpr, maxRenderScale)` times the CSS box — never the raw DPR.
    const scale = Math.min(boxes.viewport.dpr, LAYOUT.maxRenderScale);
    expect(scale, "Pixel 5's DPR is capped by R-L6").toBe(LAYOUT.maxRenderScale);
    const geometry = await boardGeometry(page, ref.level);
    expect(geometry.renderScale).toBe(scale);
    const longest = Math.max(ref.level.width, ref.level.height);
    expect(geometry.layout.grid.w, "the drawn grid is `longest` square cells wide").toBe(
      geometry.layout.cellSize * longest,
    );
    expect(geometry.layout.cellSize, "cells are square").toBe(
      Math.floor(geometry.layout.grid.w / longest),
    );
    expect(
      geometry.layout.cellSize / geometry.renderScale,
      "the board is laid out in whole CSS px above the 40 px floor",
    ).toBeGreaterThanOrEqual(40);
  });

  test("every control is a real button with a ≥ 44 × 44 CSS px hit box and ≥ 8 px gaps", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(1));
    const measured = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLButtonElement>(".ps-btn")).map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          label: button.getAttribute("aria-label") ?? button.textContent ?? "",
          hidden: button.hasAttribute("hidden") || rect.width === 0,
          w: rect.width,
          h: rect.height,
          x: rect.x,
          y: rect.y,
        };
      }),
    );

    const visible = measured.filter((button) => !button.hidden);
    expect(visible.length, "Undo and Restart are on screen during play").toBeGreaterThanOrEqual(2);
    for (const button of visible) {
      expect(button.w, `${button.label}: R-T1 width`).toBeGreaterThanOrEqual(44);
      expect(button.h, `${button.label}: R-T1 height`).toBeGreaterThanOrEqual(44);
    }
    const [left, right] = visible;
    if (left !== undefined && right !== undefined) {
      expect(right.x - (left.x + left.w), "R-T2 gap between adjacent buttons").toBeGreaterThanOrEqual(
        8,
      );
    }

    // The dialog's own actions are ≥ 44 px too, once they are on screen.
    const ref = refOf(REFS, 1);
    for (const leg of ref.legs) {
      await tapTouch(
        page,
        (await boardGeometry(page, ref.level)).cellCenterPage(leg.player.x, leg.player.y),
      );
      await waitForFrames(page, 2);
    }
    await expect(page.locator(".ps-overlay")).toBeVisible();
    const dialogButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLButtonElement>(".ps-dialog-actions .ps-btn"))
        .filter((button) => !button.hasAttribute("hidden"))
        .map((button) => {
          const rect = button.getBoundingClientRect();
          return { label: button.getAttribute("aria-label") ?? "", w: rect.width, h: rect.height };
        }),
    );
    expect(dialogButtons.length, "the win dialog offers Next and Replay").toBeGreaterThanOrEqual(2);
    for (const button of dialogButtons) {
      expect(button.w, `${button.label}: R-T1 width`).toBeGreaterThanOrEqual(44);
      expect(button.h, `${button.label}: R-T1 height`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("touch gestures (R-T3, R-T4)", () => {
  test("a tap on an adjacent cell is a move and flips the phase", async ({ page }) => {
    const ref = refOf(REFS, 3);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(3));
    const geometry = await boardGeometry(page, ref.level);
    const before = await hud(page);

    const leg = ref.legs[0];
    expect(leg).toBeDefined();
    if (leg === undefined) return;

    await tapTouch(page, geometry.cellCenterPage(leg.player.x, leg.player.y));
    await settle(page);
    await expectMoves(page, 1);
    const after = await hud(page);
    expect(after.phase).not.toBe(before.phase);
    await expectActorAt(page, geometry, ref.level, leg.player);
  });

  test("a tap on a non-adjacent cell is a non-input (§6.5: no move, no penalty)", async ({ page }) => {
    const ref = refOf(REFS, 3);
    await openLevel(page, levelUrl(3));
    const geometry = await boardGeometry(page, ref.level);
    const before = await hud(page);

    // Two cells away: R-T3 forbids the hit area, so this must be silent.
    await tapTouch(page, geometry.cellCenterPage(ref.level.player[0] + 2, ref.level.player[1]));
    await waitForFrames(page, 2);
    const after = await hud(page);
    expect(after.moves, "a distant tap is not a move").toBe(0);
    expect(after.phase).toBe(before.phase);
  });

  test("a swipe of ≥ 24 px resolves to its dominant axis (R-T4), a shorter one does not", async ({
    page,
  }) => {
    const ref = refOf(REFS, 3);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(3));
    const geometry = await boardGeometry(page, ref.level);
    const from = geometry.cellCenterPage(ref.level.player[0], ref.level.player[1]);

    // R-T4's threshold is in CSS px and scales with the render scale.
    const minTravel = LAYOUT.swipeMinTravel;
    expect(minTravel, "R-T4's swipe threshold is 24 CSS px").toBe(24);

    const leg = ref.legs[0];
    expect(leg, "the level has a first par leg to aim the swipe at").toBeDefined();
    if (leg === undefined) return;

    // Travel vector along the leg's own direction — the swipe must resolve to it.
    const step = { up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 } }[
      leg.direction
    ];
    const along = (travel: number): { x: number; y: number } => ({
      x: from.x + step.dx * travel,
      y: from.y + step.dy * travel,
    });

    // Under the threshold the gesture stays inside the player's own cell and is a
    // tap on the occupied tile — a guaranteed non-input (§6.5).
    await swipeTouch(page, from, along(10));
    await waitForFrames(page, 2);
    expect((await hud(page)).moves, "a 10 px drag is not a swipe").toBe(0);
    await expectActorAt(page, geometry, ref.level, {
      x: ref.level.player[0],
      y: ref.level.player[1],
    });

    // Over the threshold the same gesture is a MOVE in its dominant direction.
    // The commit is polled, not read once after a fixed sleep: the pointer
    // sequence is consumed on the game's next input update, which is frames away
    // on a loaded runner (the cloud shape this test exists to tolerate).
    await swipeTouch(page, from, along(minTravel + 12));
    await settle(page);
    await expectMoves(page, 1);
    const after = await hud(page);
    expect(after.phase).toBe(leg.phase);
    await expectActorAt(page, geometry, ref.level, leg.player);
  });

  test("the dominant axis decides (R-T4): a mostly-horizontal drag moves right", async ({ page }) => {
    const ref = refOf(REFS, 1); // 5 × 3, no walls: every axis is legal from the start
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const geometry = await boardGeometry(page, ref.level);
    const from = geometry.cellCenterPage(ref.level.player[0], ref.level.player[1]);

    // Travel 44 px right but 30 px down: |dx| > |dy|, so the gesture is `right`.
    await swipeTouch(page, from, { x: from.x + 44, y: from.y + 30 });
    await settle(page);
    await expectMoves(page, 1);
    const after = await hud(page);
    expect(after.phase).toBe("B");
    await expectActorAt(page, geometry, ref.level, {
      x: ref.level.player[0] + 1,
      y: ref.level.player[1],
    });
  });

  test("the R-T6 hover ring never appears under touch (differential pixel probe)", async ({ page }) => {
    const ref = refOf(REFS, 1);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const geometry = await boardGeometry(page, ref.level);

    // A thin band along the four edges of a legal adjacent cell — exactly where
    // R-T6's 2 px `accent` ring would be drawn.
    const cell = geometry.layout.cellSize;
    const neighbour = { x: ref.level.player[0] + 1, y: ref.level.player[1] };
    const target = geometry.cellCenterDevice(neighbour.x, neighbour.y);
    const band = [
      { x: target.x - cell / 4, y: target.y - cell / 2 + 1 },
      { x: target.x + cell / 4, y: target.y - cell / 2 + 1 },
      { x: target.x - cell / 2 + 1, y: target.y },
      { x: target.x + cell / 2 - 1, y: target.y },
      { x: target.x, y: target.y + cell / 2 - 1 },
    ];

    const before = await sampleCanvas(page, band);

    // A real touch drag that ends inside the player's own cell: below R-T4's
    // threshold, on the occupied tile — a guaranteed non-input, so any pixel change
    // could only be a hover state.
    const from = geometry.cellCenterPage(ref.level.player[0], ref.level.player[1]);
    await swipeTouch(page, from, { x: from.x + 6, y: from.y + 6 });
    await settle(page);
    const state = await hud(page);
    expect(state.moves, "the precondition is that nothing moved").toBe(0);
    expect(state.phase).toBe(ref.level.startPhase);

    const after = await sampleCanvas(page, band);
    expect(
      after,
      "R-T6: a touch pointer must not leave a hover ring on a legal neighbour",
    ).toEqual(before);
  });
});

test.describe("R-T5 — the sub-44 px cell hint and the whole-board swipe fallback", () => {
  test.use({ viewport: { width: 280, height: 600 } });

  test("below the 44 px floor the app offers the one-time swipe hint, and swipe works", async ({
    page,
  }) => {
    const ref = refOf(REFS, 10); // 6 cells wide: the widest shipped grid
    await installPixelReadback(page);
    await openLevel(page, levelUrl(10));
    const geometry = await boardGeometry(page, ref.level);
    const cellCss = geometry.layout.cellSize / geometry.renderScale;

    // Precondition for R-T5 *and* for R-L2's absolute floor.
    expect(cellCss, "precondition: this viewport is below the 44 px target").toBeLessThan(44);
    expect(cellCss, "R-L2: the 40 px absolute floor still holds").toBeGreaterThanOrEqual(40);

    const hint = page.locator(".ps-hint");
    await expect(hint, "R-T5: the swipe hint is shown at sub-44 px cells").toBeVisible();
    await expect(hint).toContainText("Swipe");

    // …and the swipe fallback over the whole board still moves the player.
    const from = geometry.cellCenterPage(ref.level.player[0], ref.level.player[1]);
    await swipeTouch(page, from, { x: from.x + LAYOUT.swipeMinTravel + 16, y: from.y });
    await settle(page);
    await expectMoves(page, 1);
    const after = await hud(page);
    expect(after.moves, "R-T5: swipe stays available below the floor").toBe(1);
  });

  test("the hint is a hint, never a blocker: the board is playable underneath it", async ({ page }) => {
    const ref = refOf(REFS, 10);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(10));
    const geometry = await boardGeometry(page, ref.level);
    const hint = page.locator(".ps-hint");
    await expect(hint).toBeVisible();

    // Tap the first par leg's cell: the hint must not swallow the input.
    const leg = ref.legs[0];
    expect(leg).toBeDefined();
    if (leg === undefined) return;
    await tapTouch(page, geometry.cellCenterPage(leg.player.x, leg.player.y));
    await settle(page);
    await expectMoves(page, 1);
    const after = await hud(page);
    expect(after.moves, "the hint must not swallow the input").toBe(1);
  });
});

test.describe("touch-only playthrough", () => {
  test("a whole level is winnable by touch, and the dialog's Next works by touch", async ({ page }) => {
    const ref = refOf(REFS, 2);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(2));
    const geometry = await boardGeometry(page, ref.level);

    for (const leg of ref.legs) {
      await tapTouch(page, geometry.cellCenterPage(leg.player.x, leg.player.y));
      await waitForFrames(page, 2);
    }
    await expect(page.locator(".ps-overlay")).toBeVisible();
    const won = await hud(page);
    expect(won.moves).toBe(ref.par);
    expect(won.won).toBe(true);

    await settle(page);
    await expectActorAt(page, geometry, ref.level, {
      x: ref.level.goal[0],
      y: ref.level.goal[1],
    });

    await page.locator(".ps-dialog-actions .ps-btn-primary").tap();
    await expect(page.locator(".ps-overlay")).toBeHidden();
    const next = await hud(page);
    expect(next.levelLabel).toBe("L 03");
    expect(next.moves).toBe(0);
  });

  test("a touch tap on Undo restores the previous state", async ({ page }) => {
    const ref = refOf(REFS, 2);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(2));
    const geometry = await boardGeometry(page, ref.level);
    const start = { x: ref.level.player[0], y: ref.level.player[1] };

    const leg = ref.legs[0];
    expect(leg).toBeDefined();
    if (leg === undefined) return;
    await tapTouch(page, geometry.cellCenterPage(leg.player.x, leg.player.y));
    await settle(page);
    await expectMoves(page, 1);

    await page.locator('button[aria-label="Undo"]').tap();
    await settle(page);
    await expectMoves(page, 0);
    const undone = await hud(page);
    expect(undone.phase).toBe(ref.level.startPhase);
    await expectActorAt(page, geometry, ref.level, start);
  });
});