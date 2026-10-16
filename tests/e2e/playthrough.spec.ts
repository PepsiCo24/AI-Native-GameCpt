/**
 * Standing e2e — **the L1–L11 par-route playthrough** (QA-005; re-worded at
 * QA-005c for the eleven-level registry).
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
 * 4. **The full unlock chain drives the dialog's own action**: L1 →
 *    L{@link EXPECTED_LEVEL_COUNT} with the win dialog's `Next` button, ending in
 *    the prototype-over panel. This is the end-to-end statement that every
 *    shipped level reaches the board and the ladder names itself (R-002 tree;
 *    L11 added by R-003).
 * 5. **Fresh context + cleared storage start**: every test opens `?level=<n>` in a
 *    new browser context; `openLevel` clears `localStorage`/`sessionStorage`
 *    before boot (the game persists nothing — asserted, not assumed).
 *
 * The dataset count is the suite's **one hand-typed pin**; the inventories the
 * count test checks are derived (QA-005c OQ2 — `helpers/levels.ts`), so an unlock
 * needs one deliberate edit instead of a hunt for stale literals.
 */

import { expect, test } from "@playwright/test";

import type { LevelRef } from "./helpers/levels";
import {
  datasetIds,
  discoveredFileIds,
  EXPECTED_LEVEL_COUNT,
  inventoryViolation,
  loadReferenceLevels,
  levelUrl,
  refOf,
} from "./helpers/levels";
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
    // The inventories are DERIVED (QA-005c OQ2): the ids come out of the fs scan
    // and the schema parse, never out of this file. `EXPECTED_LEVEL_COUNT` is the
    // one independent hand-typed pin, so a dataset change still raises the alarm.
    expect(datasetIds(REFS), "every parsed id matches its file name").toEqual(discoveredFileIds());
    expect(
      inventoryViolation(datasetIds(REFS), EXPECTED_LEVEL_COUNT),
      "the dataset inventory gate (count + contiguous ladder)",
    ).toBeNull();
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
      // CI-envelope sizing (QA-005j) — one row per level, none of them had a
      // budget before this one; the cost grows with the route (open + probe + a
      // press and a HUD read per leg). Measured on the 2-core software-GL runner
      // at the worst levels (L9/L10/L15): 23.7–26.4 s in the pre-gate slow round
      // (`38862977845`) and 24.5–26.2 s in green round `38869874603` — 80–88 % of
      // the 30 s default. Same class and same ~3× rule as `:135`/QA-005g; wall
      // clock only, every assertion below is unchanged.
      test.setTimeout(90_000);

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

  test(`the unlock chain runs L1 → L${String(EXPECTED_LEVEL_COUNT)} through the win dialog's own Next button`, async ({
    page,
  }) => {
    // CI-envelope sizing (QA-005c, re-derived for the art era by QA-005i): one
    // test drives the whole ladder — 15 par routes, 15 HUD reads and 14 `Next`
    // clicks. On the 2-core software-GL CI runner that exceeded the default 30 s
    // wall clock (measured 30.9 s, project-status item 66) while it runs in
    // ~12 s locally, so QA-005c gave it 120 s. Shipping art then re-priced every
    // UI row: this row measured 96 s pre-art (run 38849186852) and 126 s with the
    // art bundle live (run 38857692208, `2 failed / 105 passed`) — it crossed its
    // own 120 s budget, and the roster-wide envelope is +50–65 % (slow-row sum
    // 14.8 m → 22.2 m), so the budget is re-derived at ~3× the worst art-era
    // observation, the same rule QA-005g used for `latch-door.spec.ts:134`
    // (30.9 s → 90 s). The budget is wall clock, never an assertion: every claim
    // below is unchanged.
    test.setTimeout(360_000);

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

    // Reaching the last shipped level's win without ever leaving the chain is the
    // whole unlock claim (the last id is `EXPECTED_LEVEL_COUNT` by the pin above).
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
      // MINOR-2 (RV-007, QA-005c): close the composition-root chain end-to-end. The
      // panel's range comes from the registry's own list (`ladderLabelOf`) and the
      // dataset pins the same count, so the shipped string must name the ladder the
      // suite actually drives — derived from the one pin, never re-typed as a list.
      expect(won.dialogBody).toContain(`L1–L${String(EXPECTED_LEVEL_COUNT)}`);
      expect(won.dialogBody).toContain(`moves ${String(refOf(REFS, EXPECTED_LEVEL_COUNT).par)}`);
    },
  );
});

// Kept typed for readers: the helper's route legs are the only source of keys.
export type { LevelRef };