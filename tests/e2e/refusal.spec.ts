/**
 * Standing e2e — **the refusal contract** (AGENTS.md §2, ADR-0008 clause 1).
 *
 * The locked core rule says an *illegal* move is not a small move: it is **no
 * movement, no phase flip, and no history entry**. That is three separate claims
 * and this file tests all three, at every refused opportunity the solver's own
 * par route actually walks through:
 *
 * | claim | channel |
 * |---|---|
 * | no move | `.ps-moves` text is byte-identical before/after, `undoDisabled` unchanged |
 * | no flip | `data-phase`, `data-glyph` and the chip's `aria-label` are identical |
 * | no position change | the player's tile read back from the canvas (the HUD owns no board state) |
 *
 * ── Why the refusals are *found*, not written down ───────────────────────────
 * `helpers/levels.ts` computes `leg.refused` with `isLegalMove` — the same
 * predicate the game and the solver share (AGENTS.md §3). So this file never
 * asserts "Left is illegal here because QA said so"; it asserts "whatever the one
 * rules module refuses, the UI must freeze on". A level edit that removes a
 * refusal fails the run; a rules edit that starts accepting it fails too.
 *
 * ── Why every refusal inside one level is one test ───────────────────────────
 * The walk is a state machine: a refusal must not disturb the state *and* must not
 * disturb the state's continuation, so each refusal is immediately followed by the
 * legal move that was due — the level still has to finish. A refusal that silently
 * ate a history entry, drifted the phase or nudged the player would break the
 * arrival phase of the very next leg, which is why the walk ends on the goal.
 */

import { expect, test } from "@playwright/test";

import { loadReferenceLevels, levelUrl } from "./helpers/levels";
import {
  expectActorAt,
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  settle,
} from "./helpers/game";
import type { Vec } from "@/core/state/types";

const REFS = loadReferenceLevels();

test.describe("illegal move ⇒ no move, no flip, no position change", () => {
  for (const ref of REFS) {
    test(`L${String(ref.id)} — every refused direction freezes the triple state, then the level still finishes`, async ({
      page,
    }) => {
      await installPixelReadback(page);
      await openLevel(page, levelUrl(ref.id));
      const geometry = await boardGeometry(page, ref.level);

      let player: Vec = { x: ref.level.player[0], y: ref.level.player[1] };
      let refusals = 0;

      for (const leg of ref.legs) {
        for (const refused of leg.refused) {
          refusals += 1;
          const before = await hud(page);
          const beforePlayer: Vec = player;

          await pressDirection(page, refused);
          const after = await hud(page);

          expect(
            after.movesText,
            `L${String(ref.id)}: a refused ${refused} at move ${String(leg.moveCount - 1)} must not move the player`,
          ).toBe(before.movesText);
          expect(after.moves, `refused ${refused}: move counter`).toBe(before.moves);
          expect(after.phase, `refused ${refused}: phase must not flip`).toBe(before.phase);
          expect(after.glyph, `refused ${refused}: the glyph is the non-colour phase channel`).toBe(
            before.glyph,
          );
          expect(after.phaseLabel, `refused ${refused}: chip label`).toBe(before.phaseLabel);
          expect(after.won, `refused ${refused}: a refusal can never win`).toBe(false);
          // History: a refusal is not an action, so the undo stack is untouched.
          expect(
            after.undoDisabled,
            `refused ${refused}: undo must not become available/enabled differently`,
          ).toBe(before.undoDisabled);

          await expectActorAt(page, geometry, ref.level, beforePlayer);
        }

        await pressDirection(page, leg.direction);
        player = leg.player;
      }

      // The walk is only meaningful if it met refusals; a level with none is a
      // dataset change, not a silent pass.
      expect(refusals, `L${String(ref.id)} par route exercises at least one refusal`).toBeGreaterThan(
        0,
      );

      await expect(page.locator(".ps-overlay")).toBeVisible();
      await settle(page);
      await expectActorAt(page, geometry, ref.level, {
        x: ref.level.goal[0],
        y: ref.level.goal[1],
      });
    });
  }

  for (const ref of REFS.filter((candidate) => candidate.refusedAtStart.length > 0)) {
    test(`L${String(ref.id)} — an opening refusal costs nothing: no move, no undo step, no dialog`, async ({
      page,
    }) => {
      await installPixelReadback(page);
      await openLevel(page, levelUrl(ref.id));
      const geometry = await boardGeometry(page, ref.level);
      const start: Vec = { x: ref.level.player[0], y: ref.level.player[1] };

      const before = await hud(page);
      expect(before.moves).toBe(0);

      for (const refused of ref.refusedAtStart) {
        await pressDirection(page, refused);
      }

      const after = await hud(page);
      expect(after.moves).toBe(0);
      expect(after.phase).toBe(ref.level.startPhase);
      expect(after.undoDisabled, "nothing to undo after N refusals").toBe(true);
      expect(after.restartDisabled, "restart stays enabled as the way back").toBe(false);
      expect(after.won).toBe(false);
      await expectActorAt(page, geometry, ref.level, start);

      // The first *legal* move still counts as move 1 — refusals left no residue.
      await pressDirection(page, ref.legs[0]?.direction ?? "right");
      const moved = await hud(page);
      expect(moved.moves).toBe(1);
      expect(moved.phase).not.toBe(ref.level.startPhase);
    });
  }
});