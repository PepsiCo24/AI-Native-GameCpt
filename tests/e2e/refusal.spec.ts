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

import { portalAt } from "@/core/rules";
import { ACT_II_B1_IDS, ACT_II_B1_LADDER } from "@/core/solver/policy";
import { flipPhase } from "@/core/state/phase";
import { step } from "@/core/state/move";
import type { Vec } from "@/core/state/types";

import {
  cheapestPortalFixtures,
  cheapestRefusalFixtures,
  loadReferenceLevels,
  levelUrl,
  manhattan,
  refusalCensus,
  refusalRouteEnvelopeMs,
} from "./helpers/levels";
import type { RefusalClass } from "./helpers/levels";
import {
  expectActorAt,
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  pressRoute,
  settle,
} from "./helpers/game";

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
          expect(after.moves, `refused ${refused}: move counter`).toBe(
            before.moves,
          );
          expect(after.phase, `refused ${refused}: phase must not flip`).toBe(
            before.phase,
          );
          expect(
            after.glyph,
            `refused ${refused}: the glyph is the non-colour phase channel`,
          ).toBe(before.glyph);
          expect(after.phaseLabel, `refused ${refused}: chip label`).toBe(
            before.phaseLabel,
          );
          expect(after.won, `refused ${refused}: a refusal can never win`).toBe(
            false,
          );
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
      expect(
        refusals,
        `L${String(ref.id)} par route exercises at least one refusal`,
      ).toBeGreaterThan(0);

      await expect(page.locator(".ps-overlay")).toBeVisible();
      await settle(page);
      await expectActorAt(page, geometry, ref.level, {
        x: ref.level.goal[0],
        y: ref.level.goal[1],
      });
    });
  }

  for (const ref of REFS.filter(
    (candidate) => candidate.refusedAtStart.length > 0,
  )) {
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
      expect(
        after.restartDisabled,
        "restart stays enabled as the way back",
      ).toBe(false);
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

/* ───────── Act II batch 1 — the G-family refusal surface (R-004d) ───────────── */

/**
 * **What the five Act II rungs add to this file, and what they do not.**
 *
 * `src/levels/l021.json … l025.json` (registered by R-004a, §8.18) are the dataset's
 * first **multi-pocket sealed landings**: §8.16's device law gives each board the
 * forced plan `s1 → d1 → s2 → d2 → sg → d3` — a portal-only landing pocket, a free
 * far region behind a door, a second sealed pocket, and a goal whose every in-region
 * neighbour is a door. The generic rows above already walk each of these par routes
 * and freeze on *every* refusal they pass, so "an illegal move is identity" is
 * already asserted on L21–L25. What was **not** asserted anywhere in-browser is
 * *which kind of blocker* refuses, on the boards where two kinds coexist by
 * construction.
 *
 * | class | this board | the row that drives it |
 * |---|---|---|
 * | `phase-wall` | the `x = 2` checkerboard column | {@link cheapestRefusalFixtures} — cheapest reachable |
 * | `door-without-switch` | a seal door met **before** its switch (F-L20-2's class) | …the same helper |
 * | `out-of-bounds` | the board edge | already covered on L21–L25 by the opening-refusal rows above |
 *
 * ── The off-phase portal press is NOT a refusal, and this row says so ─────────
 * The ticket that booked this row expected the third surface to be an off-phase
 * press *at a portal* freezing the triple state. Measured on the landed bytes, that
 * surface **does not exist**, and the reason is the locked rule itself rather than a
 * gap in the data: legality reads the destination in the **current** phase only
 * (`src/core/rules/applyMove.ts:63-68` — in bounds + solid now), and `portalAt`
 * filters on `activePhase` (`src/core/rules/solid.ts:204`), so clicking an
 * *inactive* end is an ordinary legal step. The census counts the honest zero —
 * `refusedAtPortalEnds = 0` on 5/5 — and the row drives the press the other way: the
 * same click that crosses in one phase must be a plain single step in the other
 * (`portal.spec.ts:162` makes the same claim for L11, in-core). Asserting "no move,
 * no flip" here would have been a test asserting something false about the shipped
 * core, so it is not written; the measurement replaces it.
 */

/** The registered rungs, named by the law's own id block, never by a typed ladder. */
const ACT_II_RUNGS = REFS.filter((ref) => ACT_II_B1_IDS.includes(ref.id));

/**
 * The published per-rung `refusedThenEnteredTiles` count — **17 on 5/5**, with the
 * ordered companion equal (`T ≡ R ≡ 0`). Quoted, not re-derived: §8.16's ladder and
 * §8.18's root re-measure (`scripts/prove-candidate-l2125.transcript.md`, the
 * `refused-beat` gate line on every rung; `scripts/attest-r004a-act2.transcript.md`).
 * The **tile lists themselves** stay pinned once, in
 * `tests/solver/ordered-companion.test.ts`'s `ORDERED_PINS` (R-004c) — this file
 * asserts the number and the ordered/unordered equality on the same bytes the
 * browser loads, and does not keep a second copy of the list.
 */
const ACT_II_REFUSED_THEN_ENTERED_TILES = 17;

/**
 * **This ticket's own measurement** — the class partition of *every* refused press
 * over each rung's reachable set (`refusalCensus`, from the shipped rules). The
 * level lane publishes the tile census, not this partition: the split is derived here
 * so "the refusal surface is made of these blockers, and nothing else" is an
 * assertion instead of a description. `door-latch-on = 0` on all five is the
 * measured form of §8.16's device law (the plan meets every door *closed*, before its
 * switch); `out-of-bounds` is the board edge and is identical on all five; the two
 * skeletons show as `door-without-switch` 52 (L21/L24/L25) vs 50 (L22/L23).
 */
const ACT_II_REFUSAL_CLASSES: Readonly<
  Record<number, Readonly<Record<RefusalClass, number>>>
> = {
  21: {
    "out-of-bounds": 188,
    "phase-wall": 48,
    "door-without-switch": 52,
    "door-latch-on": 0,
  },
  22: {
    "out-of-bounds": 188,
    "phase-wall": 48,
    "door-without-switch": 50,
    "door-latch-on": 0,
  },
  23: {
    "out-of-bounds": 188,
    "phase-wall": 48,
    "door-without-switch": 50,
    "door-latch-on": 0,
  },
  24: {
    "out-of-bounds": 188,
    "phase-wall": 48,
    "door-without-switch": 52,
    "door-latch-on": 0,
  },
  25: {
    "out-of-bounds": 188,
    "phase-wall": 48,
    "door-without-switch": 52,
    "door-latch-on": 0,
  },
};

test.describe("Act II batch 1 — the refusal census of the sealed-landing rungs (R-004d)", () => {
  test("L21–L25 — the published refused-then-entered census, and the class partition of the whole surface", () => {
    expect(
      ACT_II_RUNGS.map((ref) => ref.id),
      "the registered Act II id block",
    ).toEqual([...ACT_II_B1_IDS]);

    for (const ref of ACT_II_RUNGS) {
      const id = ref.id;
      const published = ACT_II_B1_LADDER.find((row) => row.id === id);
      expect(
        published,
        `L${String(id)} is a registered ladder row`,
      ).toBeDefined();
      expect(ref.par, `L${String(id)}: par is the solver's own value`).toBe(
        published?.par,
      );

      const census = refusalCensus(ref);
      expect(
        census.refusedThenEntered.length,
        `L${String(id)}: the published refusedThenEnteredTiles census (§8.16/§8.18: 17 on 5/5)`,
      ).toBe(ACT_II_REFUSED_THEN_ENTERED_TILES);
      expect(
        census.refusedBeforeEntered,
        `L${String(id)}: T ≡ R ≡ 0 — the ordered companion equals the unordered one`,
      ).toEqual(census.refusedThenEntered);

      const classes = ACT_II_REFUSAL_CLASSES[id];
      expect(
        classes,
        `L${String(id)}: a measured class row exists`,
      ).toBeDefined();
      expect(
        census.byClass,
        `L${String(id)}: every refused press, by class`,
      ).toEqual(classes);
      expect(
        census.refusedPresses,
        `L${String(id)}: the four classes cover the surface — no refused press is unclassified`,
      ).toBe(
        Object.values(classes ?? {}).reduce((sum, count) => sum + count, 0),
      );
      expect(
        census.refusedAtPortalEnds,
        `L${String(id)}: no refused press lands on a portal end (the off-phase press is a legal step)`,
      ).toBe(0);
    }
  });

  for (const ref of ACT_II_RUNGS) {
    test(`L${String(ref.id)} — a phase-wall refusal and a door-without-switch refusal freeze the triple state; the off-phase portal press is an ordinary step`, async ({
      page,
    }) => {
      // The same derived envelope as every other refusal row (QA-013 / item 77(d)):
      // a function of the level's **par**, never of its id. L25 (par 23) was the first
      // rung whose uncapped envelope exceeded the 240 s cap; R-005c's batch-2+3 rungs
      // add par 24 (L34/L35), the third cap-binding rung — so the migration R-004c
      // registered is now quoted for par 22, 23 *and* 24 (the arithmetic lives in
      // `refusalRouteEnvelopeMs`'s docstring; par 19/L31 lands inside the formula at
      // 212 s).
      test.setTimeout(refusalRouteEnvelopeMs(ref.par));

      const fixtures = cheapestRefusalFixtures(ref);
      const portals = cheapestPortalFixtures(ref);

      /* ── the two refusal classes the board really reaches ─────────────────── */
      for (const kind of ["phase-wall", "door-without-switch"] as const) {
        const fixture = fixtures[kind];
        expect(
          fixture,
          `L${String(ref.id)} reaches a ${kind} refusal`,
        ).not.toBeNull();
        if (fixture === null) continue;
        expect(
          fixture.resume.direction,
          `L${String(ref.id)}: the due move is not the refused one`,
        ).not.toBe(fixture.direction);

        // A fresh session per fixture: each fixture's route is the shortest legal
        // walk from the level's start, so the state it pins is reached exactly.
        await installPixelReadback(page);
        await openLevel(page, levelUrl(ref.id));
        const geometry = await boardGeometry(page, ref.level);

        await pressRoute(page, fixture.route);
        const before = await hud(page);
        expect(
          before.moves,
          `${kind}: the route is ${String(fixture.route.length)} moves`,
        ).toBe(fixture.route.length);
        expect(before.phase, `${kind}: the fixture's phase`).toBe(
          fixture.phase,
        );
        await expectActorAt(page, geometry, ref.level, fixture.player);

        await pressDirection(page, fixture.direction);
        const after = await hud(page);

        // The triple state, exactly as the generic rows above assert it: no move, no
        // flip, no history entry — and the tile read back from the canvas, because the
        // HUD owns no board state.
        expect(
          after.movesText,
          `L${String(ref.id)}: a refused ${fixture.direction} onto ${fixture.blockedBy} (${kind}) must not move the player`,
        ).toBe(before.movesText);
        expect(after.moves, `${kind}: move counter`).toBe(before.moves);
        expect(after.phase, `${kind}: phase must not flip`).toBe(before.phase);
        expect(after.glyph, `${kind}: the non-colour phase channel`).toBe(
          before.glyph,
        );
        expect(after.phaseLabel, `${kind}: chip label`).toBe(before.phaseLabel);
        expect(after.won, `${kind}: a refusal can never win`).toBe(false);
        expect(after.undoDisabled, `${kind}: no history entry was pushed`).toBe(
          before.undoDisabled,
        );
        await expectActorAt(page, geometry, ref.level, fixture.player);

        // …and the state's *continuation* is undisturbed: the move that was due is the
        // fixture state's own first legal press, and it is one move and one flip.
        await settle(page);
        await pressDirection(page, fixture.resume.direction);
        const resumed = await hud(page);
        expect(
          resumed.moves,
          `${kind}: the refusal left no residue in the counter`,
        ).toBe(before.moves + 1);
        expect(
          resumed.phase,
          `${kind}: exactly one flip after the due move`,
        ).toBe(flipPhase(fixture.phase));
        await settle(page);
        await expectActorAt(page, geometry, ref.level, fixture.resume.arrival);
      }

      /* ── the portal press: the gate, not a refusal ───────────────────────── */
      const inactive = portals.inactive;
      expect(
        inactive,
        `L${String(ref.id)} reaches an off-phase portal press`,
      ).not.toBeNull();
      if (inactive === null) return;

      // In-core first: the gate alone decides the two landings, and on these boards
      // the same click really does cross in the other phase (`pair`, measured). The
      // pair is asserted over **its own** members: the cheapest off-phase fixture
      // driven below is a different press on some rungs, and nothing here claims it is
      // the pair's mirror.
      const pair = portals.pair;
      expect(
        pair,
        `L${String(ref.id)}: the same click crosses in the other phase`,
      ).not.toBeNull();
      if (pair !== null) {
        expect(
          pair.teleport.clicked,
          "the discriminating pair is the same click",
        ).toEqual(pair.inactive.clicked);
        expect(pair.teleport.direction, "…the same direction").toBe(
          pair.inactive.direction,
        );
        expect(pair.teleport.portalId).toBe(pair.inactive.portalId);
        expect(pair.teleport.phase, "…in the two phases").not.toBe(
          pair.inactive.phase,
        );
        expect(
          pair.teleport.arrival,
          "the active phase lands on the far end",
        ).toEqual(pair.teleport.exit);
        expect(
          pair.inactive.arrival,
          "the off phase lands where it stepped",
        ).toEqual(step(pair.inactive.player, pair.inactive.direction));
        expect(
          manhattan(pair.teleport.player, pair.teleport.arrival),
        ).toBeGreaterThan(1);
      }
      expect(
        portalAt(ref.level, inactive.phase, inactive.clicked),
        "the off phase: the clicked end is not a portal for entry",
      ).toBeUndefined();
      expect(
        inactive.arrival,
        "the off phase: the landing is the tile that was stepped onto",
      ).toEqual(step(inactive.player, inactive.direction));
      expect(
        inactive.arrival,
        "the far end is not where a step lands",
      ).not.toEqual(inactive.exit);

      await installPixelReadback(page);
      await openLevel(page, levelUrl(ref.id));
      const geometry = await boardGeometry(page, ref.level);

      await pressRoute(page, inactive.route);
      const stepping = await hud(page);
      expect(stepping.moves).toBe(inactive.route.length);
      expect(stepping.phase).toBe(inactive.phase);
      await expectActorAt(page, geometry, ref.level, inactive.player);

      await pressDirection(page, inactive.direction);
      const stepped = await hud(page);
      // Legal: one move, one flip — the refusal contract of this file is *not* the
      // claim being made here (see the block docstring), and asserting it would be
      // asserting something false about the shipped core.
      expect(stepped.moves, "an off-phase portal press is one move").toBe(
        stepping.moves + 1,
      );
      expect(stepped.phase, "…and exactly one flip").toBe(
        flipPhase(inactive.phase),
      );
      await settle(page);
      await expectActorAt(page, geometry, ref.level, inactive.arrival);
      expect(
        manhattan(inactive.arrival, inactive.exit),
        "the far end is a non-adjacent tile the actor never reached",
      ).toBeGreaterThan(1);
    });
  }
});
