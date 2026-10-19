/**
 * Standing unit pin — **the dataset inventories are derived, and the gate is still
 * loud in both directions** (QA-005c, OQ2 ruling at project-status item 58;
 * RV-007 MINOR-1).
 *
 * The problem this file exists to keep solved
 *
 * QA-005b measured the cost of the two hand-typed inventories: at eleven levels
 * `playthrough.spec.ts:47` (`toEqual([1…10])`) and `latch-door.spec.ts:60`
 * (`toEqual([6…10])`) were *arithmetically unsatisfiable* — every unlock needed a
 * manual edit in two spec files, and an unlock that forgot one turned a shipped
 * level into a red suite for the wrong reason. The ruling that followed has two
 * halves, and this file pins the second one:
 *
 * 1. **Derive the inventories** from the discovered dataset (`datasetIds`,
 *    `doorLevelIds`, `discoveredFileIds`, `inventoryViolation` in
 *    `tests/e2e/helpers/levels.ts`) — no spec types a level list.
 * 2. **Keep exactly one independent hand-typed pin**, `EXPECTED_LEVEL_COUNT`, so
 *    the dataset cannot silently re-baseline itself green: a level file added,
 *    removed or renumbered must still raise a deliberate alarm.
 *
 * Half 1 without half 2 would be a hole — a purely self-derived inventory is
 * vacuously true after any mutation, because it just re-derives the new truth.
 * Half 2 without half 1 is the broken state QA-005b measured. So this file drives
 * the **real loader** (`loadReferenceLevels(dir)` — parse, `validateLevel`, solve)
 * against **scratch copies of the shipped files**, mutates them, and requires the
 * same `inventoryViolation` the e2e specs assert to fire — while staying silent on
 * the pristine copy, so the alarm is proved to be about the mutation itself.
 */

import { afterAll, describe, expect, it } from "vitest";
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  contiguousIds,
  datasetIds,
  discoveredFileIds,
  doorLevelIds,
  EXPECTED_LEVEL_COUNT,
  inventoryViolation,
  loadReferenceLevels,
  levelsWithDoors,
} from "../e2e/helpers/levels";

/** The shipped dataset — the pristine source every scratch copy is cloned from. */
const SHIPPED_LEVELS = fileURLToPath(new URL("../../src/levels/", import.meta.url));

const SCRATCH_ROOT = mkdtempSync(join(tmpdir(), "ps-level-inventory-"));

/** `l050.json` for the current pinned count — the file name the mutations move. */
const lastFile = `l${String(EXPECTED_LEVEL_COUNT).padStart(3, "0")}.json`;

/** A clone of the shipped `src/levels/`, so a mutation can never touch the repo. */
function scratchCopy(name: string): string {
  const dir = join(SCRATCH_ROOT, name);
  cpSync(SHIPPED_LEVELS, dir, { recursive: true });
  return dir;
}

/** The inventory gate, exactly as the e2e specs call it, over a scratch copy. */
function gateOver(dir: string): { readonly ids: readonly number[]; readonly verdict: string | null } {
  const ids = datasetIds(loadReferenceLevels(dir));
  return { ids, verdict: inventoryViolation(ids, EXPECTED_LEVEL_COUNT) };
}

afterAll(() => {
  rmSync(SCRATCH_ROOT, { recursive: true, force: true });
});

describe("the dataset inventories are derived — the one pin does the alarming", () => {
  it("the shipped dataset is the pinned count, and every id agrees with its file name", () => {
    const refs = loadReferenceLevels();

    // Derived vs derived — but from two *different* sources: the parsed level's
    // own `id` field against the number its file name carries. A file that is
    // mis-numbered (`l012.json` declaring `id: 5`) breaks this even at the count.
    expect(datasetIds(refs), "parsed ids agree with the file names on disk").toEqual(
      discoveredFileIds(),
    );

    // The one hand-typed pin — the alarm. `null` means "the dataset is sound".
    expect(
      inventoryViolation(datasetIds(refs), EXPECTED_LEVEL_COUNT),
      "the shipped dataset must be exactly the pinned L1…LN ladder",
    ).toBeNull();
    expect(datasetIds(refs)).toEqual(contiguousIds(EXPECTED_LEVEL_COUNT));
  });

  it("the latch inventory derives from `doors.length > 0`, and it is the dataset's tail", () => {
    const refs = loadReferenceLevels();
    const doors = doorLevelIds(refs);
    const all = datasetIds(refs);

    expect(doors, "the latch set is derived, never typed").toEqual(
      levelsWithDoors(refs).map((ref) => ref.id),
    );
    expect(doors.length, "the dataset ships latch levels at all").toBeGreaterThan(0);

    // The design rule the old `[6..11]` literal carried, restated without a typed
    // level number: the latch levels are the dataset's **contiguous tail**. A
    // level in the middle that loses its doors breaks this.
    const first = all.indexOf(doors[0] ?? Number.NaN);
    expect(first, "the first latch level is a dataset level").toBeGreaterThanOrEqual(0);
    expect(doors, "the latch levels are the dataset's tail").toEqual(all.slice(first));
  });
});

describe("mutation probe — the alarm fires when the dataset moves (both directions)", () => {
  it("ADD: one more level file is caught by the pinned count", () => {
    const dir = scratchCopy("added");

    // The pristine clone is sound, so the failure below belongs to the mutation.
    expect(gateOver(dir).verdict, "a pristine clone must not alarm").toBeNull();

    // A valid, solvable extra level: a copy of the last file, renumbered. This is
    // the realistic unlock shape — someone ships L20 and forgets the pin.
    writeFileSync(
      join(dir, `l${String(EXPECTED_LEVEL_COUNT + 1).padStart(3, "0")}.json`),
      readFileSync(join(dir, lastFile), "utf8"),
    );

    const { ids, verdict } = gateOver(dir);
    expect(ids.length, "the scratch dataset really grew").toBe(EXPECTED_LEVEL_COUNT + 1);
    expect(verdict, "the alarm must fire when a level is added").not.toBeNull();
    expect(verdict).toContain(String(ids.length));
    expect(verdict).toContain(String(EXPECTED_LEVEL_COUNT));
  });

  it("REMOVE: one fewer level file is caught by the pinned count", () => {
    const dir = scratchCopy("removed");
    unlinkSync(join(dir, lastFile));

    const { ids, verdict } = gateOver(dir);
    expect(ids.length, "the scratch dataset really shrank").toBe(EXPECTED_LEVEL_COUNT - 1);
    expect(verdict, "the alarm must fire when a level is removed").not.toBeNull();
  });

  it("RENUMBER: a mis-numbered level is caught by the ladder even at the pinned count", () => {
    const dir = scratchCopy("renumbered");
    // The dataset's ids come from the parsed level (`id`), not from the file name,
    // so a level whose own id is wrong is invisible to the count: only the
    // contiguity tooth can see it. **R-008c derives the collision target from the pin**
    // rather than typing it: the probe used a literal `50`, which was count-blind at a
    // 45-rung pin but became *count-neutral-and-ladder-clean-adjacent* the moment the pin
    // reached 50 — at that value `l005`'s id collides with the tail and the count still
    // reads 50, so the ladder tooth is the only detector (which is what this row claims).
    const file = join(dir, "l005.json");
    const level = JSON.parse(readFileSync(file, "utf8")) as { id: number };
    level.id = EXPECTED_LEVEL_COUNT;
    writeFileSync(file, JSON.stringify(level));

    const { ids, verdict } = gateOver(dir);
    expect(ids.length, "the count alone would NOT catch this").toBe(EXPECTED_LEVEL_COUNT);
    expect(verdict, "the contiguity tooth must fire on its own").not.toBeNull();
    expect(verdict).toContain("ladder");
  });

  it("RENUMBER, the other direction: an id ABOVE the tail is *still* invisible to the count", () => {
    const dir = scratchCopy("renumbered-above");
    const file = join(dir, "l005.json");
    const level = JSON.parse(readFileSync(file, "utf8")) as { id: number };
    level.id = EXPECTED_LEVEL_COUNT + 1;
    writeFileSync(file, JSON.stringify(level));

    const { ids, verdict } = gateOver(dir);
    // The count tooth compares the *number of levels*, not the largest id: no renumber can
    // ever move it (the file count is unchanged), so this direction is count-blind exactly
    // like the tail collision above. Asserting that is the point — a "pin covers renumbers
    // too" belief is false, and the ladder tooth is what actually covers them.
    expect(ids.length, "a renumber cannot move the level count").toBe(EXPECTED_LEVEL_COUNT);
    expect(verdict, "the ladder tooth fires above the tail as well").not.toBeNull();
    expect(verdict).toContain("ladder");
  });

  it("ADD, the other direction: a *clean* append leaves the ladder sound, so the pin alone fires", () => {
    const dir = scratchCopy("added-clean");
    const raw = JSON.parse(readFileSync(join(dir, lastFile), "utf8")) as {
      id: number;
    };
    raw.id = EXPECTED_LEVEL_COUNT + 1;
    writeFileSync(
      join(dir, `l${String(EXPECTED_LEVEL_COUNT + 1).padStart(3, "0")}.json`),
      JSON.stringify(raw),
    );

    const { ids, verdict } = gateOver(dir);
    // Non-vacuity of the *pin*: the derived ladder is perfectly happy here, so a
    // self-derived inventory would report `null` and the unlock would ship silently.
    expect(ids, "a clean append keeps the ladder contiguous").toEqual(
      contiguousIds(EXPECTED_LEVEL_COUNT + 1),
    );
    expect(verdict, "the count is the only tooth that can fire on a clean append").not.toBeNull();
    expect(verdict).toContain(String(EXPECTED_LEVEL_COUNT));
  });
});