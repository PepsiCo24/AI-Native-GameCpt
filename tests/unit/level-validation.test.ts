/**
 * Level validator suite — the 10 negative cases from
 * `scripts/validate-levels.ts` migrated into Vitest, plus the non-mutation
 * (ADR-0004: reject, never auto-repair) guarantee.
 *
 * Each case asserts three things:
 *  1. the candidate is REJECTED (`ok === false`);
 *  2. the rejection message NAMES the violated invariant (a generic failure is
 *     not proof);
 *  3. the input object is byte-for-byte unchanged (no silent repair).
 */

import { describe, expect, it } from "vitest";
import { validateLevel } from "@/core/level";

function baseLevel(): Record<string, unknown> {
  return {
    id: 90,
    width: 5,
    height: 3,
    startPhase: "A",
    player: [0, 1],
    goal: [4, 1],
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [],
    switches: [],
    portals: [],
    par: 4,
  };
}

interface NegativeCase {
  name: string;
  /** The invariant under test, quoted from the docs. */
  invariant: string;
  /** The rejection message must NAME that invariant. */
  expect: RegExp;
  level: unknown;
}

const NEGATIVE_CASES: NegativeCase[] = [
  {
    name: "goal-is-wall",
    invariant: "ADR-0008 rule 7 — goal non-wall in BOTH phases",
    expect: /goal .*is a wall in phase B/,
    level: { ...baseLevel(), phaseBWalls: [[4, 1]] },
  },
  {
    name: "out-of-bounds",
    invariant: "docs/level-design.md §1 — all coordinates in bounds",
    expect: /phaseAWalls\[0\] \(5, 1\): out of bounds/,
    level: { ...baseLevel(), phaseAWalls: [[5, 1]] },
  },
  {
    name: "duplicate-coordinate",
    invariant: "docs/level-design.md §1 — no duplicate tiles within a list",
    expect: /phaseBWalls\[1\] \(2, 1\) duplicates phaseBWalls\[0\]/,
    level: { ...baseLevel(), phaseBWalls: [[2, 1], [2, 1]] },
  },
  {
    name: "spawn-inside-wall",
    invariant: "docs/level-design.md §1 — player non-wall in both phases (clean spawn)",
    expect: /player \(0, 1\) is a wall in phase A/,
    level: { ...baseLevel(), phaseAWalls: [[0, 1]] },
  },
  {
    name: "dangling-door-reference",
    invariant: "docs/level-design.md §1 — switch `targets` must name an existing door id",
    expect: /dangling reference/,
    level: {
      ...baseLevel(),
      switches: [{ id: "s1", tile: [2, 0], activePhase: "A", targets: ["d9"] }],
    },
  },
  {
    name: "portal-degenerate-pair",
    invariant: "docs/level-design.md §1 — the two portal ends must differ",
    expect: /the two ends of a portal pair must be different tiles/,
    level: { ...baseLevel(), portals: [{ id: "p1", pair: [[2, 0], [2, 0]], activePhase: "A" }] },
  },
  {
    name: "portal-end-on-own-phase-wall",
    invariant: "docs/level-design.md §1 — a portal end never sits on a wall of its own activePhase",
    expect: /own activePhase/,
    level: {
      ...baseLevel(),
      phaseBWalls: [[2, 0]],
      portals: [{ id: "p1", pair: [[2, 0], [3, 0]], activePhase: "B" }],
    },
  },
  {
    name: "unknown-field",
    invariant: "docs/level-design.md §1 — the field table is exhaustive (schema is strict)",
    expect: /[Uu]nrecognized key/,
    level: { ...baseLevel(), phaseWalls: [] },
  },
  {
    name: "missing-par",
    invariant: "docs/level-design.md §1 — `par` is required, int ≥ 1",
    expect: /par/,
    level: (() => {
      const level = baseLevel();
      delete level["par"];
      return level;
    })(),
  },
  {
    name: "grid-over-r-l2-cap",
    invariant: "docs/ui-ux.md R-L2 — authored grids are ≤ 7 × 7",
    expect: /width/,
    level: { ...baseLevel(), width: 8 },
  },
];

describe("validateLevel — positive control", () => {
  it("accepts a well-formed level and does not mutate it", () => {
    const level = baseLevel();
    const before = JSON.stringify(level);
    const result = validateLevel(level);
    expect(result.ok, JSON.stringify(result.errors)).toBe(true);
    expect(result.errors).toEqual([]);
    expect(JSON.stringify(level)).toBe(before);
  });
});

describe("validateLevel — negative self-tests (reject by name, never repair)", () => {
  for (const testCase of NEGATIVE_CASES) {
    it(`${testCase.name} — rejected, named, unmodified`, () => {
      const before = JSON.stringify(testCase.level);
      const result = validateLevel(testCase.level);

      expect(result.ok, `${testCase.name} must be rejected`).toBe(false);
      const named = result.errors.filter((error) => testCase.expect.test(error));
      expect(
        named,
        `${testCase.name} must name ${String(testCase.expect)}; got:\n${result.errors.join("\n")}`,
      ).not.toEqual([]);
      // ADR-0004 — the validator is a verdict, not a repair.
      expect(JSON.stringify(testCase.level)).toBe(before);
    });
  }

  it("covers all 10 negative cases carried by scripts/validate-levels.ts", () => {
    expect(NEGATIVE_CASES.length).toBe(10);
    expect(new Set(NEGATIVE_CASES.map((c) => c.name)).size).toBe(10);
  });
});