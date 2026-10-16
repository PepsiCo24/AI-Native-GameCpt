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

import { loadReferenceLevels, levelUrl, refusalRouteEnvelopeMs } from "./helpers/levels";
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
      // CI-envelope sizing (QA-005c): this walks a whole level's refusal surface
      // through the real browser and probes the canvas after every refusal. On the
      // 2-core software-GL CI runner it exceeded the default 30 s wall clock
      // (measured: L3/L4/L9 at 30.8 s, project-status item 66) while it runs in
      // ~5 s locally. Wall clock, never an assertion: every claim below is intact.
      //
      // QA-011 at 19 rows — this is now the suite's slowest per-level class, and
      // the tail is the peak: measured locally on the frozen bytes (`--retries=0`,
      // art-era, two green rounds) L16 13.4→22.1 / L17 14.0→23.6 / L18 18.4→28.0 /
      // **L19 20.1→28.4 s**, against L15 8.9 s and ~5 s for L3/L4/L9 — because the
      // refusal surface is walked once per leg and the tail's par is 12/14/16/18.
      // That is 22–32 % of the budget on this fast machine. Projected onto CI with
      // the suite-level factor of these rounds (10.0/11.8 m local vs the art-era
      // cloud round's 31.6 m ≈ 2.7–3.2×) L19 lands at ~55–90 s, and with the
      // QA-011's projection landed exactly here: observation round `38890893868`
      // (develop `77a6ba6`, job `116940140379`) hard-timed-out L18 and L19 at this
      // very constant while L15/L16/L17 passed — the projected 120–170 s row class
      // against 90 s, confirmed. So the constant is replaced by a **par-derived
      // envelope** (item 77(d)); the measured table and the fit live in
      // `refusalRouteEnvelopeMs` (tests/e2e/helpers/levels.ts). Par comes from the
      // level's own solver-shortest solution (`ref.par`), never from the id — so
      // **L20 (par 20) is absorbed by the same formula with zero re-migration**
      // (it evaluates to 223 s), and every further rung is a computed number.
      // Retries stay forbidden and every assertion above/below is untouched: this
      // is wall clock, and only wall clock.
      //
      // QA-014 at 20 rows — **the par-20 rung ran, and the derived envelope absorbed
      // it with zero re-migration, exactly as item 77(d) predicted.** This round
      // (`PS_E2E_PORT=5244`, `--retries=0`, art-era bytes, 132/132 green, 11.1 m,
      // the FIRST browser walk of L20 ever) measured the family as
      // L15 11.6 / L16 14.8 / L17 15.9 / L18 19.5 / L19 21.8 / **L20 28.1 s**, so:
      // `refusalRouteEnvelopeMs(20) = 223_000 ms` against a **28.1 s** observation =
      // **12.6 % of budget**, and L20 is the family's new peak as predicted (par 20).
      // The constant this replaced (`90_000`) would have put the same observation at
      // 31 % locally and at `28.1 × 5.9 ≈ 166 s` on QA-013's own conservative cloud
      // factor — i.e. **crossed**, the exact red that round `38890893868` produced on
      // L18/L19. No constant was touched for this migration; the arithmetic lives in
      // `refusalRouteEnvelopeMs`'s docstring (tests/e2e/helpers/levels.ts).
      test.setTimeout(refusalRouteEnvelopeMs(ref.par));

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