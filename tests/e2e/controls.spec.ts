/**
 * Standing e2e — **the control surface** (§7.4: arrows/WASD → `MOVE`, `Z` → undo,
 * `R` → restart, `Enter` → next; the three buttons; ADR-0008 clause 2 — there is
 * **no manual phase switch**, so nothing on this surface may flip the phase).
 *
 * The claims, and why each one is here rather than in a unit test:
 *
 * - **Undo is a real inverse.** It must restore *all three* observable facts —
 *   move counter, phase, player tile — and re-disable itself at move 0. A
 *   UI that decremented a counter without restoring the phase would still look
 *   right in the HUD alone, so the tile is read back from the canvas.
 * - **Restart is a fresh session, not a rewind.** After a restart the level starts
 *   at `startPhase`, move 0, undo disabled — i.e. the history stack is gone.
 * - **Nothing here flips the phase on its own** (clause 2). Undo/restart restore
 *   the phase as a *consequence* of the state they restore; the assertion that
 *   matters is that the phase after undo is the parity of the move count, and that
 *   pressing undo at move 0 changes nothing at all.
 * - **`Enter` drives the win dialog's own action**, so the keyboard path through
 *   the level chain does not depend on the mouse.
 */

import { expect, test } from "@playwright/test";

import { loadReferenceLevels, levelUrl, refOf } from "./helpers/levels";
import {
  boardGeometry,
  expectActorAt,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  pressRestartKey,
  pressRoute,
  pressUndoKey,
  phaseGlyphOf,
  settle,
} from "./helpers/game";
import type { Vec } from "@/core/state/types";

const REFS = loadReferenceLevels();

function startOf(id: number): Vec {
  const ref = refOf(REFS, id);
  return { x: ref.level.player[0], y: ref.level.player[1] };
}

test.describe("undo — the real inverse", () => {
  test("one move, one undo: counter, phase and tile all come back", async ({ page }) => {
    const ref = refOf(REFS, 1);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const geometry = await boardGeometry(page, ref.level);

    const before = await hud(page);
    expect(before.moves).toBe(0);
    expect(before.undoDisabled).toBe(true);

    await pressDirection(page, ref.legs[0]?.direction ?? "right");
    const moved = await hud(page);
    expect(moved.moves).toBe(1);
    expect(moved.phase).not.toBe(before.phase);
    expect(moved.undoDisabled).toBe(false);

    await page.locator('button[aria-label="Undo"]').click();
    await settle(page);
    const undone = await hud(page);
    expect(undone.moves).toBe(0);
    expect(undone.phase).toBe(before.phase);
    expect(undone.glyph).toBe(before.glyph);
    expect(undone.undoDisabled, "nothing left to undo at move 0").toBe(true);
    await expectActorAt(page, geometry, ref.level, startOf(1));
  });

  test("the Z key is the same action as the button, and deeper stacks unwind in order", async ({
    page,
  }) => {
    const ref = refOf(REFS, 1);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const geometry = await boardGeometry(page, ref.level);

    // Walk the first three par legs, remembering the exact state after each.
    const trail: { moves: number; phase: string; player: Vec }[] = [];
    const legs = ref.legs.slice(0, 3);
    for (const leg of legs) {
      await pressDirection(page, leg.direction);
      trail.push({ moves: leg.moveCount, phase: leg.phase, player: leg.player });
    }

    // Unwind with the keyboard: after each Z the HUD must replay the trail backwards.
    for (let index = trail.length - 1; index > 0; index -= 1) {
      await pressUndoKey(page);
      await expect
        .poll(async () => (await hud(page)).moves, { message: `undo back to move ${String(index)}` })
        .toBe(index);
      const state = await hud(page);
      expect(state.phase).toBe(trail[index - 1]?.phase);
      await settle(page);
      await expectActorAt(page, geometry, ref.level, trail[index - 1]?.player ?? startOf(1));
    }

    await pressUndoKey(page);
    await settle(page);
    const fresh = await hud(page);
    expect(fresh.moves).toBe(0);
    expect(fresh.phase).toBe(ref.level.startPhase);
    expect(fresh.undoDisabled).toBe(true);
    await expectActorAt(page, geometry, ref.level, startOf(1));
  });

  test("undo restores the level state too, so the par route still finishes after one undo", async ({
    page,
  }) => {
    const ref = refOf(REFS, 6);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(6));
    const geometry = await boardGeometry(page, ref.level);

    // L6's switch sits on the first par tile: move 1 presses it.
    await pressDirection(page, ref.legs[0]?.direction ?? "right");
    expect((await hud(page)).moves).toBe(1);

    await pressUndoKey(page);
    await settle(page);
    const undone = await hud(page);
    expect(undone.moves).toBe(0);
    expect(undone.phase).toBe(ref.level.startPhase);
    await expectActorAt(page, geometry, ref.level, startOf(6));

    // Re-entering the switch tile is a *new* entry, so it presses again — and the
    // whole par route still finishes, which is the strongest statement that the
    // undo restored the level state and not just the counters.
    await pressRoute(page, ref.route);
    await expect(page.locator(".ps-overlay")).toBeVisible();
    expect((await hud(page)).moves).toBe(ref.par);
  });

  test("undo at move 0 is a no-op, by button and by key", async ({ page }) => {
    await openLevel(page, levelUrl(1));
    const before = await hud(page);
    expect(before.undoDisabled).toBe(true);

    await pressUndoKey(page);
    const afterKey = await hud(page);
    expect(afterKey.moves).toBe(0);
    expect(afterKey.phase).toBe(before.phase);
    expect(afterKey.movesText).toBe(before.movesText);

    // The button is disabled in the DOM, so it cannot fire at all.
    await expect(page.locator('button[aria-label="Undo"]')).toBeDisabled();
    const afterClick = await hud(page);
    expect(afterClick.moves).toBe(0);
    expect(afterClick.phase).toBe(before.phase);
  });
});

test.describe("restart — a fresh session, not a rewind", () => {
  for (const via of ["key", "button"] as const) {
    test(`restart via ${via} returns to move 0, startPhase and the start tile, and clears the undo stack`, async ({
      page,
    }) => {
      const ref = refOf(REFS, 8);
      await installPixelReadback(page);
      await openLevel(page, levelUrl(8));
      const geometry = await boardGeometry(page, ref.level);

      for (const leg of ref.legs.slice(0, 4)) await pressDirection(page, leg.direction);
      const moving = await hud(page);
      expect(moving.moves).toBe(4);
      expect(moving.undoDisabled).toBe(false);

      if (via === "key") await pressRestartKey(page);
      else await page.locator('button[aria-label="Restart"]').click();

      await settle(page);
      const restarted = await hud(page);
      expect(restarted.moves, "restart is move 0, not a rewind").toBe(0);
      expect(restarted.phase).toBe(ref.level.startPhase);
      expect(restarted.glyph).toBe(phaseGlyphOf(ref.level.startPhase));
      expect(restarted.undoDisabled, "the history stack is gone").toBe(true);
      expect(restarted.won).toBe(false);
      await expectActorAt(page, geometry, ref.level, startOf(8));

      // And the level is genuinely playable again from scratch.
      await pressRoute(page, ref.route);
      await expect(page.locator(".ps-overlay")).toBeVisible();
      expect((await hud(page)).moves).toBe(ref.par);
    });
  }
});

test.describe("the win dialog is drivable from the keyboard", () => {
  test("Enter advances to the next level exactly like the Next button", async ({ page }) => {
    await openLevel(page, levelUrl(1));
    await pressRoute(page, refOf(REFS, 1).route);
    await expect(page.locator(".ps-overlay")).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator(".ps-overlay")).toBeHidden();

    const next = await hud(page);
    expect(next.levelLabel).toBe("L 02");
    expect(next.moves).toBe(0);
    expect(next.phase).toBe(refOf(REFS, 2).level.startPhase);
    expect(next.undoDisabled).toBe(true);
  });

  test("the action buttons the dialog offers are real buttons with accessible names", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(1));
    const actions = ["Undo", "Restart"];
    for (const label of actions) {
      await expect(page.locator(`button[aria-label="${label}"]`)).toBeVisible();
    }
    // The dialog's own actions exist but are hidden until the level is won.
    await expect(page.locator(".ps-dialog-actions .ps-btn-primary")).toBeHidden();
    await pressRoute(page, refOf(REFS, 1).route);
    await expect(page.locator('button[aria-label="Next"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Replay"]')).toBeVisible();
  });
});