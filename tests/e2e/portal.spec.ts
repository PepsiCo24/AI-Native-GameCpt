/**
 * Standing e2e — **the phase-gated portal crossing** (M2; ADR-0008 clause 6,
 * `docs/level-design.md` §1, `docs/architecture.md` §6.2 step 3).
 *
 * L11 is the dataset's M2 debut: one portal pair on tiles of opposite `(x + y)`
 * parity (the validator's own requirement — a same-parity pair is mechanically
 * inert and is rejected). Four claims follow from the rules, and this file pins
 * all four for the *shipped* board:
 *
 * | claim | rule | channel |
 * |---|---|---|
 * | a crossing really happens | `applyMove` step 3 teleports once, no chaining | in-core: the par route's arrival is **non-adjacent** to the pressed tile |
 * | the portal is active **only** in phase B | `portalAt` filters on `activePhase` | in-core + UI: the *same* press is an ordinary step in phase A |
 * | the teleport spends no move and no extra flip | the flip stays bound to the single legal move (clause 2) | HUD: `moves + 1` exactly, phase `= flipPhase(before)` exactly |
 * | the walk is clean | — | zero `console.error` lines, zero uncaught page errors |
 *
 * ── Why every tile, route and phase is *found*, not written down ─────────────
 * `portalFixtures()` (`helpers/levels.ts`) asks the level's own reachable state
 * graph (`explore()`, the solver's BFS) for a state where clicking a portal end
 * is legal, and takes the landing from `applyMove` — the single movement truth
 * source both the game and the solver call. So a level edit that moves the pair,
 * flips `activePhase` or removes the crossing fails this run instead of leaving a
 * stale route behind. The only literals in this file are the level id and the
 * HUD's own token lookups.
 *
 * ── The discriminating pair, and why the latch is not the answer ─────────────
 * `cheapestPortalFixtures().pair` is the same press — same start tile, same
 * direction, same clicked end, **same switch latch** — in both phases: it
 * teleports in B and steps in A. The two states' `doorsOpen` differ, but that is
 * *derived*: `doorsOpen = f(color, phase, switchesOn)`, so a phase difference
 * necessarily moves it, and a door is not read by the crossing at all. The
 * portal's eligibility reads `activePhase` and nothing else — which is exactly
 * what this pair isolates.
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { portalAt } from "@/core/rules";
import type { Direction } from "@/core/state/move";
import { step } from "@/core/state/move";
import { flipPhase } from "@/core/state/phase";
import type { Vec } from "@/core/state/types";

import {
  cheapestPortalFixtures,
  loadReferenceLevels,
  levelUrl,
  levelsWithPortals,
  manhattan,
  refOf,
  resolveRoute,
} from "./helpers/levels";
import type { LevelRef } from "./helpers/levels";
import {
  boardGeometry,
  expectActorAt,
  expectNoPageErrors,
  hud,
  installPixelReadback,
  openLevel,
  phaseGlyphOf,
  phaseLabelOf,
  phaseOf,
  pressDirection,
  pressRoute,
  settle,
  watchErrors,
} from "./helpers/game";

const REFS = loadReferenceLevels();
const PORTAL_LEVELS = levelsWithPortals(REFS);
const PORTAL_LEVEL_ID = 11;

/** Walk a searched route through the UI — one key per rendered frame. */
async function walkRoute(page: Page, route: readonly Direction[]): Promise<void> {
  for (const direction of route) await pressDirection(page, direction);
}

test.describe("portal crossing is phase-gated (M2 — L11)", () => {
  test("the dataset's portal levels are exactly the levels that ship portals", () => {
    expect(PORTAL_LEVELS.map((ref) => ref.id)).toEqual([PORTAL_LEVEL_ID]);
    for (const ref of PORTAL_LEVELS) {
      expect(ref.level.portals.length, `L${String(ref.id)} ships a portal pair`).toBeGreaterThan(0);
      for (const portal of ref.level.portals) {
        const [endA, endB] = portal.pair;
        expect(
          (endA[0] + endA[1]) % 2,
          `L${String(ref.id)} portal ${portal.id} must break the position↔phase link`,
        ).not.toBe((endB[0] + endB[1]) % 2);
        expect(endA, `L${String(ref.id)} portal ${portal.id} ends are two different tiles`).not.toEqual(
          endB,
        );
      }
    }
  });

  test("L11 — the par route really teleports: one press, a non-adjacent arrival", () => {
    const ref = refOf(REFS, PORTAL_LEVEL_ID);
    const start: Vec = { x: ref.level.player[0], y: ref.level.player[1] };

    // A "jump" is a leg whose arrival is not a neighbour of the tile it started
    // from — impossible for a plain step, and exactly what a teleport is.
    let before: Vec = start;
    const jumps: Array<{
      readonly index: number;
      readonly direction: Direction;
      readonly from: Vec;
      readonly to: Vec;
    }> = [];
    ref.legs.forEach((leg, index) => {
      if (manhattan(before, leg.player) > 1) {
        jumps.push({ index, direction: leg.direction, from: before, to: leg.player });
      }
      before = leg.player;
    });

    expect(jumps.length, "the par route crosses the portal exactly once").toBe(1);
    const jump = jumps[0];
    if (jump === undefined) return;

    const phaseBefore = resolveRoute(ref.level, ref.route.slice(0, jump.index)).phase;
    const clicked = step(jump.from, jump.direction);
    const portal = portalAt(ref.level, phaseBefore, clicked);

    expect(portal, "the pressed tile is an active portal end").toBeDefined();
    if (portal === undefined) return;

    const [endA, endB] = portal.pair;
    const farEnd: Vec =
      endA[0] === clicked.x && endA[1] === clicked.y
        ? { x: endB[0], y: endB[1] }
        : { x: endA[0], y: endA[1] };

    expect(manhattan(clicked, jump.to), "the landing is not adjacent to the clicked tile").toBeGreaterThan(1);
    expect(manhattan(jump.from, jump.to), "…nor to the tile the press started from").toBeGreaterThan(1);
    expect(jump.to, "the landing is the pair's far end").toEqual(farEnd);
    // The teleport spends no second flip: the arrival phase is the one flip of
    // that single legal move.
    expect(ref.legs[jump.index]?.phase).toBe(flipPhase(phaseBefore));
  });

  test("L11 — the phase gate is the whole difference: one press, two landings", () => {
    const ref = refOf(REFS, PORTAL_LEVEL_ID);
    const { pair } = cheapestPortalFixtures(ref);
    expect(pair, "the board reaches a portal crossing in both phases").not.toBeNull();
    if (pair === null) return;
    const { teleport, inactive } = pair;

    // Same press: same tile, same direction, same clicked portal end.
    expect(teleport.player).toEqual(inactive.player);
    expect(teleport.direction).toBe(inactive.direction);
    expect(teleport.clicked).toEqual(inactive.clicked);
    expect(teleport.portalId).toBe(inactive.portalId);

    // The switch latch is *not* what differs — only the phase is.
    const teleportState = resolveRoute(ref.level, teleport.route);
    const inactiveState = resolveRoute(ref.level, inactive.route);
    expect(teleportState.player).toEqual(inactiveState.player);
    expect(inactiveState.switchesOn, "the two states carry the same latch").toEqual(
      teleportState.switchesOn,
    );
    expect(teleportState.phase).toBe(teleport.phase);
    expect(inactiveState.phase).toBe(inactive.phase);
    expect(inactive.phase).not.toBe(teleport.phase);

    // The gate, read from the rules themselves, decides the two landings.
    expect(portalAt(ref.level, teleport.phase, teleport.clicked)?.id).toBe(teleport.portalId);
    expect(portalAt(ref.level, inactive.phase, inactive.clicked)).toBeUndefined();

    expect(teleport.arrival, "phase B: the landing is the far end").toEqual(teleport.exit);
    expect(manhattan(teleport.player, teleport.arrival)).toBeGreaterThan(1);
    expect(inactive.arrival, "phase A: the landing is the tile that was stepped onto").toEqual(
      step(inactive.player, inactive.direction),
    );
    expect(manhattan(inactive.player, inactive.arrival), "phase A: an ordinary single step").toBe(1);
    expect(inactive.arrival).not.toEqual(inactive.exit);

    // Entry-only, no re-trigger (clause 6): after an ordinary phase-A step the
    // player stands on a portal end that is active *now* — and is not moved.
    const after = resolveRoute(ref.level, [...inactive.route, inactive.direction]);
    expect(
      portalAt(ref.level, after.phase, after.player),
      "the arrival stands on an ACTIVE portal end",
    ).toBeDefined();
    expect(after.player).toEqual(inactive.arrival);
    expect(manhattan(inactive.exit, after.player), "standing on it did not teleport").toBeGreaterThan(1);
  });

  test("L11 — the par route wins through the UI and the teleport leg jumps the board", async ({
    page,
  }) => {
    const ref = refOf(REFS, PORTAL_LEVEL_ID);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, ref.level);

    const start = await hud(page);
    expect(start.moves).toBe(0);
    expect(start.phase).toBe(ref.level.startPhase);

    for (const leg of ref.legs) {
      const before = await hud(page);
      const beforePlayer = resolveRoute(ref.level, ref.route.slice(0, leg.moveCount - 1)).player;
      const jumped = manhattan(beforePlayer, leg.player) > 1;

      if (jumped) {
        // The teleport leg: the board (not the HUD, which owns no board state)
        // proves where the press starts from.
        await settle(page);
        await expectActorAt(page, geometry, ref.level, beforePlayer);
      }

      await pressDirection(page, leg.direction);
      const after = await hud(page);

      // One legal move: exactly one history entry and exactly one flip. A
      // teleport that spent its own flip would make `after.phase` the phase
      // *before* the press, and any extra move would show in `after.moves`.
      expect(after.moves, `moves after ${leg.key}${jumped ? " (teleport leg)" : ""}`).toBe(
        before.moves + 1,
      );
      expect(after.phase, "exactly one flip, derived from the phase before the press").toBe(
        flipPhase(phaseOf(before)),
      );
      expect(after.phase).toBe(leg.phase);
      expect(after.phaseLabel).toBe(phaseLabelOf(leg.phase));
      expect(after.glyph).toBe(phaseGlyphOf(leg.phase));

      if (jumped) {
        await settle(page);
        await expectActorAt(page, geometry, ref.level, leg.player);
        // …and the arrival is non-adjacent to the tile the press clicked, which is
        // the one-finger fact a teleport has to explain.
        expect(
          manhattan(step(beforePlayer, leg.direction), leg.player),
          "the landing is not adjacent to the clicked tile",
        ).toBeGreaterThan(1);
        expect(leg.player, "the actor is not where a plain step would leave it").not.toEqual(
          step(beforePlayer, leg.direction),
        );
      }
    }

    await expect(page.locator(".ps-overlay")).toBeVisible();
    const won = await hud(page);
    expect(won.won).toBe(true);
    expect(won.moves).toBe(ref.par);
    await settle(page);
    await expectActorAt(page, geometry, ref.level, {
      x: ref.level.goal[0],
      y: ref.level.goal[1],
    });
  });

  test("L11 — the same press through the UI: phase B teleports, phase A steps", async ({ page }) => {
    const ref = refOf(REFS, PORTAL_LEVEL_ID);
    const { pair } = cheapestPortalFixtures(ref);
    expect(pair).not.toBeNull();
    if (pair === null) return;
    const { teleport, inactive } = pair;

    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    const geometry = await boardGeometry(page, ref.level);

    /* ── phase B: the crossing ─────────────────────────────────────────────── */
    await walkRoute(page, teleport.route);
    const crossingPhase = await hud(page);
    expect(crossingPhase.moves).toBe(teleport.route.length);
    expect(crossingPhase.phase).toBe(teleport.phase);
    await settle(page);
    await expectActorAt(page, geometry, ref.level, teleport.player);

    await pressDirection(page, teleport.direction);
    const crossed = await hud(page);
    expect(crossed.moves, "the crossing is one move, not more").toBe(crossingPhase.moves + 1);
    expect(crossed.phase, "one move, one flip").toBe(flipPhase(phaseOf(crossingPhase)));
    await settle(page);
    await expectActorAt(page, geometry, ref.level, teleport.arrival);

    /* ── phase A: the same press is an ordinary step ───────────────────────── */
    // A fresh session: the phase-A route is a different walk, and the state
    // differs in the phase — and in nothing the portal reads.
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    await walkRoute(page, inactive.route);
    const steppingPhase = await hud(page);
    expect(steppingPhase.moves).toBe(inactive.route.length);
    expect(steppingPhase.phase).toBe(inactive.phase);
    expect(steppingPhase.phase, "the same tile, the other phase").not.toBe(crossingPhase.phase);
    await settle(page);
    await expectActorAt(page, geometry, ref.level, inactive.player);

    await pressDirection(page, inactive.direction);
    const stepped = await hud(page);
    expect(stepped.moves).toBe(steppingPhase.moves + 1);
    expect(stepped.phase).toBe(flipPhase(phaseOf(steppingPhase)));
    await settle(page);
    await expectActorAt(page, geometry, ref.level, inactive.arrival);
    // The far end is a different, non-adjacent tile: the crossing really did not
    // happen in this phase.
    expect(steppingPhase.phase).not.toBe(teleport.phase);
    expect(manhattan(inactive.arrival, inactive.exit), "the far end is not where the actor is").toBeGreaterThan(1);
  });

  test("L11 — the whole par-route walk raises no console or page error", async ({ page }) => {
    const ref = refOf(REFS, PORTAL_LEVEL_ID);
    const watch = watchErrors(page);

    await installPixelReadback(page);
    await openLevel(page, levelUrl(PORTAL_LEVEL_ID));
    await pressRoute(page, ref.route);
    await expect(page.locator(".ps-overlay")).toBeVisible();
    const won = await hud(page);
    expect(won.won).toBe(true);
    expect(won.moves).toBe(ref.par);

    expectNoPageErrors(watch, `L${String(PORTAL_LEVEL_ID)} par route + teleport leg`);
  });
});

/** Kept typed for readers: the fixture helpers are the only source of routes. */
export type { LevelRef };