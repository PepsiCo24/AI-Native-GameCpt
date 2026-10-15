/**
 * Standing e2e — **the L1–L10 par-route playthrough** (QA-005).
 *
 * What this file pins, and why each claim is here:
 *
 * 1. **Every level is playable to its win dialog by keyboard alone.** The route
 *    is the *solver's* first par route (`helpers/levels.ts` → `forEachParRoute`),
 *    so the assertion is "the UI reaches the win on the program of record's
 *    shortest route" — not "the UI matches a route QA typed once".
 * 2. **The phase flips on every legal move, and only then** (the locked core
 *    loop, AGENTS.md §2). After each arrow key the HUD phase chip, its glyph and
 *    its text all name the *opposite* phase, and `moves` advances by exactly one.
 *    The label is compared against `theme(phase).hud.phaseLabel` — the token map
 *    is the truth source, not a string in the test.
 * 3. **The board agrees with the core.** After the last move the player's tile is
 *    read back from the canvas (the HUD owns no board state) and must equal the
 *    solver's goal tile.
 * 4. **The full unlock chain drives the dialog's own action**: L1 → L10 with the
 *    win dialog's `Next` button, ending in the prototype-over panel. This is the
 *    end-to-end statement that ten levels reach the board (R-002 tree).
 * 5. **Fresh context + cleared storage start**: every test opens `?level=<n>` in a
 *    new browser context; `openLevel` clears `localStorage`/`sessionStorage`
 *    before boot (the game persists nothing — asserted, not assumed).
 */

import { expect, test } from "@playwright/test";

import type { LevelRef } from "./helpers/levels";
import { EXPECTED_LEVEL_COUNT, loadReferenceLevels, levelUrl, refOf } from "./helpers/levels";
import {
  actorCell,
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  phaseGlyphOf,
  phaseLabelOf,
  pressDirection,
  pressRoute,
  settle,
} from "./helpers/game";

const REFS = loadReferenceLevels();

test.describe("par route → win → HUD contract", () => {
  test(`the shipped dataset is ${String(EXPECTED_LEVEL_COUNT)} levels and every one is solvable`, () => {
    expect(REFS.map((ref) => ref.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const ref of REFS) {
      expect(ref.route.length, `L${String(ref.id)} route length`).toBe(ref.par);
      expect(ref.legs[ref.legs.length - 1]?.state.player, `L${String(ref.id)} ends on the goal`).toEqual(
        { x: ref.level.goal[0], y: ref.level.goal[1] },
      );
    }
  });

  for (const ref of REFS) {
    test(`L${String(ref.id)} — par route ${ref.route.map((d) => d[0]?.toUpperCase()).join("")} wins with the HUD tracking every flip`, async ({
      page,
    }) => {
      await installPixelReadback(page);
      await openLevel(page, levelUrl(ref.id));

      const start = await hud(page);
      expect(start.levelLabel).toBe(`L ${String(ref.id).padStart(2, "0")}`);
      expect(start.moves).toBe(0);
      expect(start.phase).toBe(ref.level.startPhase);
      expect(start.phaseLabel).toBe(phaseLabelOf(ref.level.startPhase));
      expect(start.glyph).toBe(phaseGlyphOf(ref.level.startPhase));
      expect(start.won).toBe(false);
      expect(start.undoDisabled).toBe(true);

      let previousPhase = start.phase;
      for (const leg of ref.legs) {
        await pressDirection(page, leg.direction);
        const after = await hud(page);
        expect(after.moves, `moves after ${leg.key} (move ${String(leg.moveCount)})`).toBe(
          leg.moveCount,
        );
        expect(after.phase, `phase after ${leg.key}`).toBe(leg.phase);
        expect(after.phase, `phase must flip on move ${String(leg.moveCount)}`).not.toBe(
          previousPhase,
        );
        expect(after.phaseLabel).toBe(phaseLabelOf(leg.phase));
        expect(after.glyph).toBe(phaseGlyphOf(leg.phase));
        previousPhase = after.phase;
      }

      // Win dialog: "L 0n cleared" + the plain move count (§5.3 M-5b, no par copy).
      await expect(page.locator(".ps-overlay")).toBeVisible();
      const won = await hud(page);
      expect(won.won).toBe(true);
      expect(won.moves).toBe(ref.par);
      if (ref.id < EXPECTED_LEVEL_COUNT) {
        expect(won.dialogTitle).toBe(`L ${String(ref.id).padStart(2, "0")} cleared`);
        expect(won.nextVisible).toBe(true);
      } else {
        expect(won.dialogTitle).toBe("原型结束 / Prototype over");
        expect(won.nextVisible).toBe(false);
      }
      expect(won.dialogBody).toContain(`moves ${String(ref.par)}`);

      // The board (not the HUD) proves the player is standing on the goal tile.
      await settle(page);
      const geometry = await boardGeometry(page, ref.level);
      const probe = await actorCell(page, geometry, ref.level);
      expect(
        probe.cell,
        `actor should stand on the goal (${String(ref.level.goal[0])},${String(ref.level.goal[1])})`,
      ).toEqual({ x: ref.level.goal[0], y: ref.level.goal[1] });
    });
  }

  test("the unlock chain runs L1 → L10 through the win dialog's own Next button", async ({ page }) => {
    await openLevel(page, levelUrl(1));

    for (const ref of REFS) {
      const before = await hud(page);
      expect(before.levelLabel).toBe(`L ${String(ref.id).padStart(2, "0")}`);

      await pressRoute(page, ref.route);
      await expect(page.locator(".ps-overlay")).toBeVisible();

      if (ref.id < EXPECTED_LEVEL_COUNT) {
        await page.locator(".ps-dialog-actions .ps-btn-primary").click();
        await expect(page.locator(".ps-overlay")).toBeHidden();
        const next = await hud(page);
        expect(next.levelLabel).toBe(`L ${String(ref.id + 1).padStart(2, "0")}`);
        expect(next.moves).toBe(0);
        expect(next.phase).toBe(refOf(REFS, ref.id + 1).level.startPhase);
      }
    }

    // Reaching L10's win without ever leaving the chain is the whole unlock claim.
    const end = await hud(page);
    expect(end.won).toBe(true);
    expect(end.nextVisible).toBe(false);
    expect(end.live).toContain("原型结束");
  });

  test("an out-of-range ?level deep link falls back to L1 instead of an empty board", async ({ page }) => {
    await openLevel(page, levelUrl("out-of-range"));
    const state = await hud(page);
    expect(state.levelLabel).toBe("L 01");
    expect(state.moves).toBe(0);
  });

  test(
    "the last level's dialog must not claim the prototype ends at L5",
    async ({ page }) => {
      // Fixed (R-004b): `hud.ts` now reads the ladder range from the registry's own
      // list (`ladderLabelOf`), so the end panel names the levels that shipped
      // instead of the stale `L1–L5` prototype literal. Pin removed.
      await openLevel(page, levelUrl(EXPECTED_LEVEL_COUNT));
      await pressRoute(page, refOf(REFS, EXPECTED_LEVEL_COUNT).route);
      await expect(page.locator(".ps-overlay")).toBeVisible();
      const won = await hud(page);
      expect(won.dialogTitle).toBe("原型结束 / Prototype over");
      expect(won.dialogBody).not.toContain("L1–L5");
      expect(won.dialogBody).toContain(`moves ${String(refOf(REFS, EXPECTED_LEVEL_COUNT).par)}`);
    },
  );
});

// Kept typed for readers: the helper's route legs are the only source of keys.
export type { LevelRef };