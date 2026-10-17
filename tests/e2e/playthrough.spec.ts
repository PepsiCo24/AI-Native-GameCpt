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
import { installCpuThrottle } from "./helpers/throttle";

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
      //
      // QA-011 at 19 rows: the tail is now the heaviest class. Local art-era
      // (this worktree, `--retries=0`, frozen bytes, two green rounds): L16
      // 6.7/7.1 s / L17 7.6 s / L18 8.6 s / L19 9.3/10.1 s against L15 5.6 s /
      // L9 5.1 s / L1 3.1 s — the growth is the longer par route (12/14/16/18 vs
      // ≤ 10), measured across the tail, not extrapolated. Projected onto CI:
      // ~30 s with the suite-level factor of these rounds' own wall clock (10.0/
      // 11.8 m local vs the art-era cloud round's 31.6 m = 2.7–3.2×) and ~74 s
      // with the row-class factor the chain's own history records (8×) — inside
      // the budget either way, so **L19 is a named WATCH ROW** (project-status
      // item 84 doctrine: named, not silently widened) and the budget is left at
      // the QA-005j derivation.
      //
      // QA-014 at 20 rows: the tail grew one rung and the row re-measured at
      // **L20 10.8 s** (vs L19 9.1 s, L18 8.2 s, L17 7.6 s, L16 6.8 s in the same
      // 132/132-green round, `PS_E2E_PORT=5244`, `--retries=0`) — **12.0 % of the
      // 90 s budget**, still 2.3× under the widest QA-011 projection for this row
      // class. L20 is the per-level playthrough peak by par, as expected, and it did
      // **not** cross: the budget stands at the QA-005j derivation.
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
    // CI-envelope sizing (QA-005c, re-derived for the art era by QA-005i; carry
    // re-derived for the 19-row ladder by QA-011): one test drives the whole
    // ladder — 19 par routes, 19 HUD reads and 18 `Next` clicks. On the 2-core
    // software-GL CI runner that exceeded the default 30 s wall clock (measured
    // 30.9 s at 15 rows, project-status item 66) while it runs in ~12 s locally,
    // so QA-005c gave it 120 s. Shipping art then re-priced every UI row: this
    // row measured 96 s pre-art (run 38849186852) and 126 s with the art bundle
    // live at 15 rows (run 38857692208, `2 failed / 105 passed`) — it crossed
    // its own 120 s budget, and the roster-wide envelope is +50–65 % (slow-row
    // sum 14.8 m → 22.2 m), so QA-005i re-derived the budget at ~3× the worst
    // observation (126 s → 360 s), the same rule QA-005g used for
    // `latch-door.spec.ts:134` (30.9 s → 90 s).
    //
    // QA-011 re-measurement at 19 rows (local, `PS_E2E_PORT=5234`,
    // `--retries=0`, frozen bytes, art-era, **two** green rounds): the chain takes
    // **51.4 s / 56.3 s** (route moves 90 → 150, i.e. +67 %; 19 opens, 19 HUD reads,
    // 18 `Next` clicks; the same rounds' 4-row tail is L16 6.7/7.1, L17 7.6, L18 8.6,
    // L19 9.3/10.1 s, i.e. the growth is the longer route, and the whole round is
    // 10.0 m → 11.8 m). Projected onto CI: ~165–180 s with the suite-level factor
    // these rounds carry (10.0/11.8 m local vs the art-era cloud round's 31.6 m ≈
    // 2.7–3.2×) and ~410–450 s with the row-class factor the row's own history
    // records (12 s local → 96 s CI pre-art = 8×) — so the 360 s budget sits
    // **inside that band**, not comfortably under it.
    // WATCH ROW, named and not silently widened (project-status item 84's
    // doctrine): QA-011 keeps 360 s and files the row for the next cloud round,
    // which is the observation the derived envelope must be taken from
    // (`budget when crossed`, and this row has not crossed at 19 rows yet).
    // The budget is wall clock, never an assertion: every claim below is
    // unchanged.
    //
    // ── QA-014 at 20 rows: RE-MEASURED, and it did NOT cross. Arithmetic, not a
    //    feeling (item 77(d): fitted × safety ≥ 1.5, and never a silent raise) ─────
    // This round (`PS_E2E_PORT=5244`, `--retries=0`, art-era bytes, 132/132 green,
    // 11.1 m total) drove the whole ladder once: **L1 → L20 — 20 par routes, 20 HUD
    // reads, 19 `Next` clicks — in 57.1 s.** Against QA-011's two green rounds at 19
    // rows (51.4 s / 56.3 s) the +1 rung costs **+0.8 … +5.7 s (+1.6 % … +11 %)**,
    // which is the route-length delta and nothing else (route moves 150 → 170, i.e.
    // +13 %); against the *worst* 19-row observation the row moved **+1.4 %**.
    //   • budget used: **57.1 / 360 = 15.9 %** — the same room it had at 19 rows (16 %).
    //   • suite-level projection (QA-011's own band, 2.7–3.2× from these rounds'
    //     local-vs-cloud ratio): 57.1 × 2.7…3.2 = **154…183 s < 360** ✓.
    //   • row-class projection (this row's history: 12 s local → 96 s pre-art cloud =
    //     8×): 57.1 × 8 = **457 s > 360** ✗.
    // The two models disagree by 2.5×, so an envelope derived *now* would be a
    // choice between projections rather than a fitted observation — exactly what
    // QA-013 replaced with measurement. **The constant stays at 360 s**: nothing is
    // raised and nothing is derived from a guess, so there is no silent widening to
    // report; the row stays a NAMED WATCH ROW. The next cloud round is the crossing
    // observation item 77(d) requires, and if it crosses the envelope is
    // `E = 1.5 × (fitted local(rows) + worst residual) × cloud factor` taken from
    // *that* round's numbers with the fitted×safety ≥ 1.5 leg quoted beside it.
    //
    // ── QA-024: THE BOOKED CROSSING ARRIVED (round `39031050727`) — K = 23; the
    //    envelope is DERIVED cloud-anchored and raised to 639 s (option A) ────────
    // The round (tip `4c1d9cae6`, an 84 m e2e job — the worst of this era's three
    // 1.4 h-class days) truncated this row inside the 24th level's **first** `hud()`
    // round trip (`helpers/game.ts:308`, `page.evaluate`: "Test timeout of 360000ms
    // exceeded"). No assertion failed — the walk was cut by harness patience.
    // Cloud progress, read from the one readable half of the 108.9 MB failure bundle
    // (`test-results/.../error-context.md`, page snapshot): **`L 24 / moves 0 / 白昼`**
    // ⇒ the cloud had completed **K = 23 of 25 levels** (23 routes, 46 HUD round trips,
    // 23 `Next` clicks) and was standing on L24's opening read (its 47th). The bundle's
    // `trace.zip` is DEFLATE-compressed *inside* the artifact, so per-level cloud
    // timestamps were not retrievable; the snapshot is the cloud datum.
    //
    // Inputs, all measured this round (worktree `qa-024-envelope`, `--retries=0`):
    //   plain walk            **88.6 s** and **95.7 s** (two greens, exact JSON) and
    //                         **97.4 s** inside the whole-file run ⇒ this round's plain
    //                         band is 88.6–97.4 s (R-004c measured 96/108 s on its bench)
    //   `PS_E2E_CPU_THROTTLE=10`  **168.5 s** green  = 1.90 × 88.6
    //   `PS_E2E_CPU_THROTTLE=20`  **232.0 s** green  = 2.62 × 88.6
    //   local per-level curve (one instrumented plain walk): L23 = **81.783 s**,
    //   L25 = **96.715 s** ⇒ the last two rungs are 44/269 moves = 16.4 % of the moves
    //   and 15.4 % of the measured walk time.
    // Cloud run-rate for the work it demonstrably completed: ≤ `360 / 81.783` =
    // **4.40 × local** — i.e. this day is **1.68 × harsher than CDP rate 20**
    // (4.40 / 2.62). The rate-20 green is therefore *not* a cloud-day reproduction,
    // and the cloud side binds the envelope.
    //
    // DERIVATION (the `refusalRouteEnvelopeMs` form: formula + inputs + result):
    //   cloudFullChainS = 360 s × localTotal / localThroughL23
    //                   = 360 × 96.715 / 81.783                  = 425.7 s
    //   flatLevelVariant= (360 / K) × 25 = 15.65 × 25             = 391.3 s   ← 8 % below
    //                     the work-weighted figure: it prices the last two rungs at
    //                     their *level* share (8 %) where their measured *work* share is
    //                     15.4 %, so it is the optimistic face of the same arithmetic —
    //                     quoted here, not used.
    //   envelopeMs      = ceil(1.5 × 425.7) × 1000                = **639_000 ms**
    //   (same-family variant, the refusal family's own cloud factor 5.9:
    //    ceil(1.5 × 5.9 × 96.715) = 856_000 ms.)
    // 639 s is **above the 600 s line**, so QA-024 stopped and put the number to the
    // orchestrator with two priced options — row B of option (B) (L14→L25, 197/269
    // moves, local 71.371 s) would have read `ceil(1.5 × 4.40 × 71.371) = 472_000 ms`
    // and row A (L1→L13, 72/269, local 25.344 s) `168_000 ms`.
    //
    // ── ORCHESTRATOR DECISION: option (A) adopted, so the constant below IS 639_000 ──
    // Three grounds, recorded here so the reasoning travels with the number:
    //   1. the watchdog-semantics law binds: (B) would have needed row B to open a
    //      mid-chain level directly (`?level=14`), and a direct open is exactly the
    //      thinning this row exists to prevent — it needs design-level approval, and it
    //      buys no suite time at all (two boots for the same walk);
    //   2. the arithmetic above is **cloud-anchored** — K = 23 from the round's own page
    //      snapshot, the work-weighted 425.7 s, the standing item-77(d) ×1.5 leg;
    //   3. it prices the worst day actually OBSERVED, with headroom, not a projection.
    //
    // PRE-REGISTERED UPPER BOUND — the remedy is written before it is needed: if a
    // future round crosses 639_000 ms, the remedy is the **856_000 ms** same-family row
    // quoted above (`ceil(1.5 × 5.9 × local)`, the refusal family's own measured cloud
    // factor 5.9) — **not** a fresh improvisation and not another round that re-derives
    // the same three inputs.
    //
    // DERIVATION ANCHOR for future walk-class envelopes (measured this round): **no
    // local throttle rate reproduced the crossing.** Rate 10 = 168.5 s (1.90×) and rate
    // 20 = 232.0 s (2.62×) both went GREEN while the cloud ran at ≤ 4.40× local (1.68×
    // harsher than rate 20) and still stalled out. Walk-class envelopes therefore derive
    // from **cloud datums**; a throttled-local green is **necessary, not sufficient** —
    // it proves the row is not scheduler-fragile, never that it fits a starvation day.
    test.setTimeout(639_000);

    // QA-024 starvation arm (opt-in, inert unless `PS_E2E_CPU_THROTTLE` is set —
    // `helpers/throttle.ts`): the cloud crossing this envelope is derived from
    // happened on a 1.4 h-starvation day, so the derivation must be certifiable
    // against starvation on this bench, not against a fast machine.
    await installCpuThrottle(page);

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
      // ── QA-015: derived envelope, from the round that crossed (item 77(d)) ────────
      // Main round `38920309798` (train 4, `72a5366`) finished 131 passed / 1 FAILED at
      // 52.4 m — the slowest cloud round observed so far — and this row is the lone
      // red: `page.evaluate` hard-timed at the **30 s DEFAULT**. Same class QA-005j
      // (`ce9f1b0`) ruled on: a row that overruns the default gets the derived 90 s
      // family envelope. Why it grew here: the row walks the win of the *last* shipped
      // level (`EXPECTED_LEVEL_COUNT`), so the ladder census from 15 → 20 rows (the
      // L16–L20 block) lengthened its route and its HUD/dialog reads.
      //
      // Arithmetic, not a feeling: local (`PS_E2E_PORT=5245`, `--retries=0`) this
      // dispatch measured **7.4 s body / 8.4 s total** against the 30 s default ⇒ the
      // round that crossed implies a cloud factor of **≥ 4.05×** (30 / 7.4) — a
      // *lower* bound, since the row timed out rather than merely nearing it.
      // 90 s = local × **12.2×** (90 / 7.4), i.e. ≥ **3.0×** (12.2 / 4.05) the
      // exceedance today's round already demonstrated, and it matches the QA-005j
      // family ratio (30.9 s → 90 s, 126 s → 360 s ≈ 2.9×). 90 s is therefore the
      // fitted envelope with safety, not a thin one; the local measure does **not**
      // justify 120 s (that would be 16.2× local for a row whose route is 20 legs).
      // Wall clock only — no retry, no test logic and no assertion changes with this
      // budget.
      test.setTimeout(90_000);

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