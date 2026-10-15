/**
 * Standing e2e — **the door latch** (M3 switch → door, R-D1 blocking, R-D7
 * occupancy; `docs/game-design.md` §5, ADR-0008 clauses 3 + 5).
 *
 * A switch inverts the doors it targets when the player **enters its tile while
 * its `activePhase` is the current phase** (`applyMove` step 3), and two very
 * different consequences follow:
 *
 * 1. **R-D1 — a closed door blocks.** `solidAt` = `current-phase walls ∪
 *    current-phase closed doors`, so an entry onto a closed door tile is refused
 *    exactly like a wall (step 1, the only failure point).
 * 2. **R-D7 — a door that closes *under* the player does not move them.** The
 *    entry decision is made once, in the pre-flip phase, and the flip may then
 *    close the door (§6.2 step 5, absolute recompute, **no rollback**). The player
 *    is left legally standing on a closed door.
 *
 * ── Why the states are searched, not typed ──────────────────────────────────
 * Both claims are *existence* claims about the reachable state graph, so the
 * fixtures come from `explore()` — the solver's own BFS over `SearchState` — via
 * `doorFixtures()`. The spec asks the level "show me a state where a closed door
 * refuses me" and then drives the UI to the state the solver found, along the
 * shortest legal route to it. No route is typed into this file.
 *
 * The second test is the **discriminating pair** that makes the latch
 * load-bearing: for every door level there are two reachable states on *the same
 * tile in the same phase* whose only difference is whether the switch was pressed,
 * and the door therefore refuses in one and opens in the other. Position and phase
 * cannot explain the verdict; only the latch can.
 */

import { expect, test } from "@playwright/test";

import {
  cheapestDoorFixtures,
  datasetIds,
  doorLevelIds,
  loadReferenceLevels,
  levelUrl,
  levelsWithDoors,
  refOf,
  resolveRoute,
} from "./helpers/levels";
import {
  boardGeometry,
  expectActorAt,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  settle,
} from "./helpers/game";
import { isClosedDoorAt } from "@/core/rules/solid";
import { isLegalMove } from "@/core/rules";
import type { Direction } from "@/core/state/move";
import { move } from "@/core/state/move";

const REFS = loadReferenceLevels();
const DOOR_LEVELS = levelsWithDoors(REFS);

test.describe("switch latch ⇒ door blocking (R-D1) and door occupancy (R-D7)", () => {
  test("the dataset's latch levels are exactly the tail that ships doors", () => {
    // The latch inventory is DERIVED (QA-005c OQ2 — `doorLevelIds`), so an unlock
    // costs no edit here. What stays falsifiable is the *design rule* the old
    // `[6..11]` literal encoded: the latch levels are the dataset's contiguous
    // tail (L6+ unlocks doors), so a level that loses its doors breaks this.
    const doors = doorLevelIds(REFS);
    const all = datasetIds(REFS);
    expect(doors.length, "the dataset ships latch levels at all").toBeGreaterThan(0);
    const first = all.indexOf(doors[0] ?? Number.NaN);
    expect(first, "the first latch level is a dataset level").toBeGreaterThanOrEqual(0);
    expect(doors, "the latch levels are the dataset's contiguous tail").toEqual(all.slice(first));

    for (const ref of DOOR_LEVELS) {
      expect(
        ref.level.switches.length,
        `L${String(ref.id)} drives its door from a switch`,
      ).toBeGreaterThan(0);
      for (const door of ref.level.doors) {
        expect(
          ref.level.switches.some((sw) => sw.targets.includes(door.id)),
          `L${String(ref.id)} door ${door.id} is targeted by a switch (otherwise the latch is unfalsifiable)`,
        ).toBe(true);
      }
    }
  });

  for (const ref of DOOR_LEVELS) {
    test(`L${String(ref.id)} — the latch is the whole difference: one tile, one phase, one direction, two verdicts`, () => {
      const { occupancy, refusedEntry } = cheapestDoorFixtures(ref);
      expect(occupancy, `L${String(ref.id)}: reachable closed-door occupancy`).not.toBeNull();
      expect(refusedEntry, `L${String(ref.id)}: reachable closed-door refusal`).not.toBeNull();
      if (occupancy === null || refusedEntry === null) return;

      // The state the occupancy walk *leaves from* vs. the state the refusal was
      // found in: same tile, same phase, opposite latch.
      const latched = resolveRoute(ref.level, occupancy.route.slice(0, -1));
      const unlatched = resolveRoute(ref.level, refusedEntry.route);

      const doorTile = refusedEntry.doorTile;
      const direction: Direction | null = occupancy.route[occupancy.route.length - 1] ?? null;

      expect(latched.player, "both fixtures stand on the same tile").toEqual(unlatched.player);
      expect(latched.phase, "both fixtures are in the same phase").toEqual(unlatched.phase);
      expect(direction, "the occupancy arrival has a direction").not.toBeNull();
      expect(direction, "both fixtures use the same direction").toBe(refusedEntry.direction);

      if (direction === null) return;

      // One rules module, two answers — and the only state difference is the latch.
      expect(
        isLegalMove(ref.level, latched, move(direction)),
        `L${String(ref.id)}: with the switch pressed the entry is legal`,
      ).toBe(true);
      expect(
        isLegalMove(ref.level, unlatched, move(direction)),
        `L${String(ref.id)}: with the switch untouched the same entry is refused`,
      ).toBe(false);
      expect(
        isClosedDoorAt(ref.level, latched.doorsOpen, doorTile),
        "the latched door is open right now",
      ).toBe(false);
      expect(
        isClosedDoorAt(ref.level, unlatched.doorsOpen, doorTile),
        "the unlatched door is closed right now",
      ).toBe(true);
      expect(
        latched.switchesOn,
        "the two states differ in latch state, not merely in phase",
      ).not.toEqual(unlatched.switchesOn);
    });
  }

  for (const ref of DOOR_LEVELS) {
    test(`L${String(ref.id)} — the UI blocks the closed door and strands the player on a closed one`, async ({
      page,
    }) => {
      const { occupancy, refusedEntry } = cheapestDoorFixtures(ref);
      expect(occupancy, `L${String(ref.id)}: reachable closed-door occupancy`).not.toBeNull();
      expect(refusedEntry, `L${String(ref.id)}: reachable closed-door refusal`).not.toBeNull();
      if (occupancy === null || refusedEntry === null) return;
      const direction = refusedEntry.direction;

      /* ── R-D1: a closed door refuses entry exactly like a wall ───────────── */
      await test.step("R-D1 — a move onto a closed door is refused (no move, no flip)", async () => {
        await installPixelReadback(page);
        await openLevel(page, levelUrl(ref.id));
        const geometry = await boardGeometry(page, ref.level);

        for (const step of refusedEntry.route) await pressDirection(page, step);
        const before = await hud(page);
        expect(before.moves, "the searched route is a legal route of exactly that depth").toBe(
          refusedEntry.route.length,
        );
        expect(before.phase, "fixture phase").toBe(refusedEntry.phase);
        await expectActorAt(page, geometry, ref.level, refusedEntry.player);

        expect(direction, "the refused-entry fixture carries a direction").not.toBeNull();
        if (direction === null) return;

        await pressDirection(page, direction);
        const after = await hud(page);
        expect(after.moves, "the closed door must refuse: no move").toBe(before.moves);
        expect(after.phase, "the closed door must refuse: no flip").toBe(before.phase);
        expect(after.won).toBe(false);
        await expectActorAt(page, geometry, ref.level, refusedEntry.player);
      });

      /* ── R-D7: the flip may close the door under the player ──────────────── */
      await test.step("R-D7 — the player may legally end up standing on a closed door", async () => {
        await installPixelReadback(page);
        await openLevel(page, levelUrl(ref.id));
        const geometry = await boardGeometry(page, ref.level);

        for (const step of occupancy.route) await pressDirection(page, step);
        const after = await hud(page);

        expect(after.moves, "the occupancy route is a legal route of that length").toBe(
          occupancy.route.length,
        );
        expect(after.phase, "fixture phase after the flip").toBe(occupancy.phase);
        expect(after.won, "the occupancy fixture is deliberately not the goal").toBe(false);

        // The board — not the HUD — proves the tile: the player stands on the door,
        // and the core says that door is closed right now.
        const arrival = resolveRoute(ref.level, occupancy.route);
        expect(
          isClosedDoorAt(ref.level, arrival.doorsOpen, occupancy.doorTile),
          "the flip closed the door the player is standing on",
        ).toBe(true);

        await settle(page);
        await expectActorAt(page, geometry, ref.level, occupancy.doorTile);
      });
    });
  }

  test("L8 — the same walk, latched and unlatched, through the UI", async ({ page }) => {
    const ref = refOf(REFS, 8);
    const { occupancy, refusedEntry } = cheapestDoorFixtures(ref);
    expect(occupancy).not.toBeNull();
    expect(refusedEntry).not.toBeNull();
    if (occupancy === null || refusedEntry === null) return;
    const doorTile = refusedEntry.doorTile;

    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);

    // Unlatched: walk the refusal fixture's route; the same direction is refused.
    for (const step of refusedEntry.route) await pressDirection(page, step);
    const unlatchedHud = await hud(page);
    await expectActorAt(page, geometry, ref.level, refusedEntry.player);
    const direction = refusedEntry.direction;
    if (direction === null) return;
    await pressDirection(page, direction);
    const afterRefusal = await hud(page);
    expect(afterRefusal.moves).toBe(unlatchedHud.moves);
    expect(afterRefusal.phase).toBe(unlatchedHud.phase);
    await expectActorAt(page, geometry, ref.level, refusedEntry.player);

    // Latched: the very same tile and phase, but the switch was pressed on the way.
    await openLevel(page, levelUrl(8));
    for (const step of occupancy.route.slice(0, -1)) await pressDirection(page, step);
    const latchedHud = await hud(page);
    expect(latchedHud.phase, "same phase as the unlatched walk").toBe(unlatchedHud.phase);
    await expectActorAt(page, geometry, ref.level, refusedEntry.player);

    await pressDirection(page, direction);
    const through = await hud(page);
    expect(through.moves, "latched: the same direction now lands").toBe(latchedHud.moves + 1);
    expect(through.phase).not.toBe(latchedHud.phase);
    await settle(page);
    await expectActorAt(page, geometry, ref.level, doorTile);
  });
});