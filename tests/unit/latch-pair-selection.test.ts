/**
 * Regression pin — **`cheapestDoorFixtures()` must pair the refusal with the
 * chosen cheapest occupancy** (QA-006; the defect named by LV-009-B's dossier,
 * `docs/ai-native-pipeline.md` §8.10 item 6, with `scripts/latch-pair-audit.ts`
 * as the rerunnable measurement).
 *
 * Reproduce → root cause → fix → regression test
 * ───────────────────────────────────────────────
 * - **Reproduce.** `tests/e2e/latch-door.spec.ts`'s per-level row (`:102`) went
 *   red on **L12 only**: `latched.player = (4,2)A` vs `unlatched.player = (5,1)A`.
 *   The audit measured that L12's board *does* ship co-located pairs (arm 1: 2
 *   under the helper's own bookkeeping, arm 2: 12 under `isLegalMove` alone) and
 *   that L6–L11 / L13–L15 already co-located.
 * - **Root cause.** `cheapestDoorFixtures()` picked the cheapest occupancy and the
 *   cheapest refusal **independently** (`all.find(kind)`); on L12 both sit at depth
 *   4 and BFS node order lands the refusal on a different state — a fixture
 *   *selection* defect, not a board gap. Board exonerated by measurement; no data
 *   edit.
 * - **Fix.** The occupancy is chosen cheapest first; the refusal is the cheapest
 *   fixture on the same tile in the same phase, same direction, with the door the
 *   refusal names reading **open** in the occupancy's pre-arrival state
 *   (`tests/e2e/helpers/levels.ts`).
 * - **Regression (this file) — browser-free.** For *every* dataset door level the
 *   returned pair must satisfy the spec's welded equality exactly: same tile, same
 *   phase, same direction, opposite latch, and precisely the two `isLegalMove`
 *   verdicts. A future board — or a revert to the independent pick — turns this red
 *   on `npm test`, without a browser.
 */

import { describe, expect, it } from "vitest";

import { isLegalMove } from "@/core/rules";
import { isClosedDoorAt } from "@/core/rules/solid";
import type { Direction } from "@/core/state/move";
import { move } from "@/core/state/move";
import {
  cheapestDoorFixtures,
  doorLevelIds,
  loadReferenceLevels,
  resolveRoute,
} from "../e2e/helpers/levels";

const REFS = loadReferenceLevels();
const DOOR_IDS = doorLevelIds(REFS);

describe("cheapestDoorFixtures pairs the refusal with the cheapest occupancy (QA-006)", () => {
  it("the dataset ships door levels at all (the sweep below is not vacuous)", () => {
    expect(DOOR_IDS.length, "at least one level carries a switch-driven door").toBeGreaterThan(0);
  });

  for (const id of DOOR_IDS) {
    it(`L${String(id)} — the two fixtures are the spec's welded pair`, () => {
      const ref = REFS.find((candidate) => candidate.id === id);
      expect(ref, `L${String(id)} is a loaded reference level`).toBeDefined();
      if (ref === undefined) return;

      const { occupancy, refusedEntry } = cheapestDoorFixtures(ref);
      expect(occupancy, `L${String(id)}: reachable closed-door occupancy`).not.toBeNull();
      expect(refusedEntry, `L${String(id)}: reachable closed-door refusal`).not.toBeNull();
      if (occupancy === null || refusedEntry === null) return;

      const latched = resolveRoute(ref.level, occupancy.route.slice(0, -1));
      const unlatched = resolveRoute(ref.level, refusedEntry.route);
      const direction: Direction | null = occupancy.route[occupancy.route.length - 1] ?? null;

      expect(direction, "the occupancy arrival has a direction").not.toBeNull();
      if (direction === null) return;

      // The exact equalities `latch-door.spec.ts` asserts, one screen earlier: the
      // two fixtures must be the same state *except* for the latch.
      expect(latched.player, "both fixtures stand on the same tile").toEqual(unlatched.player);
      expect(latched.phase, "both fixtures are in the same phase").toEqual(unlatched.phase);
      expect(direction, "both fixtures use the same direction").toBe(refusedEntry.direction);
      expect(
        latched.switchesOn,
        "the two states differ in latch state, not merely in phase",
      ).not.toEqual(unlatched.switchesOn);

      // One rules module, two answers.
      expect(
        isLegalMove(ref.level, latched, move(direction)),
        `L${String(id)}: with the switch pressed the entry is legal`,
      ).toBe(true);
      expect(
        isLegalMove(ref.level, unlatched, move(direction)),
        `L${String(id)}: with the switch untouched the same entry is refused`,
      ).toBe(false);
      expect(
        isClosedDoorAt(ref.level, latched.doorsOpen, refusedEntry.doorTile),
        "the latched door is open right now",
      ).toBe(false);
      expect(
        isClosedDoorAt(ref.level, unlatched.doorsOpen, refusedEntry.doorTile),
        "the unlatched door is closed right now",
      ).toBe(true);
    });
  }
});