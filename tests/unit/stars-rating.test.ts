/**
 * QA-019 — **the star rating rule, pinned as a table**
 * (`docs/ui-ux.md` V0.9.7 §5.5 + ADR-`design-0005` Ruling A).
 *
 * ── What this file is ────────────────────────────────────────────────────────
 * `starsFor(moves, par)` is the whole rating rule and it is four lines long, which
 * is exactly why it is pinned here rather than trusted: the thresholds are a
 * **quoted ruling** (`3★ ≤ par + 2⌈par/10⌉`, `2★ ≤ par + 4⌈par/10⌉`, `1★ any
 * finish`), so every number in this file is hand-typed from the ruling — never
 * recomputed with the code under test — and the table is the falsifier if the
 * constants ever move silently (`k1 = 2⌈par/10⌉` is ADR-0009's detour quantum ×
 * P3's teaching span, `k2 = 2 · k1`).
 *
 * The three claims the table carries:
 *
 * 1. **the two quanta** — `k1` at the `⌈par/10⌉` boundaries (4 → 2, 10 → 2, 11 → 4,
 *    20 → 4, 21 → 6, 30 → 6) and `k2 = 2 · k1` everywhere;
 * 2. **exact equality lands on the BETTER star** — the ruling's `≤` semantics, so
 *    the boundary move counts (`par + k1`, `par + k2`) are 3★ / 2★ and the first
 *    row above each is 2★ / 1★;
 * 3. **any finish is rated** — there is no floor below 1★ and no fail state, and
 *    the count never leaves `{1, 2, 3}`.
 *
 * `node` environment on purpose (the config's default): this file is a pure
 * function's table and touches no DOM. The persistence half is
 * `stars-persistence.test.ts` (jsdom, real `localStorage`).
 */

import { describe, expect, it } from "vitest";

import { starStateAt } from "@/game/hud/hud";
import {
  STAR_SCHEMA,
  STAR_SLOTS,
  STAR_STORAGE_KEY,
  starThresholds,
  starsFor,
} from "@/game/systems/stars";
import type { StarCount } from "@/game/systems/stars";

/** One row of the ruling's ladder: a move count, its par, and the ruling's verdict. */
interface Row {
  readonly moves: number;
  readonly par: number;
  readonly stars: StarCount;
  readonly why: string;
}

/**
 * The ladder table. Every `stars` value below is read off the ruling's two
 * inequalities by hand; the `why` strings are what a failure prints, so a red row
 * names the clause it broke rather than a bare number.
 */
const TABLE: readonly Row[] = [
  /* ── par 4 — the shipped teaching span: k1 = 2, k2 = 4 ───────────────────── */
  { moves: 4, par: 4, stars: 3, why: "a par clear is 3★" },
  { moves: 5, par: 4, stars: 3, why: "par + 1 is inside par + k1 = 6" },
  { moves: 6, par: 4, stars: 3, why: "EXACT equality at par + k1 = 6 lands on the better star (≤)" },
  { moves: 7, par: 4, stars: 2, why: "the first row above par + k1 = 6 is 2★, not 3★" },
  { moves: 8, par: 4, stars: 2, why: "EXACT equality at par + k2 = 8 lands on the better star (≤)" },
  { moves: 9, par: 4, stars: 1, why: "the first row above par + k2 = 8 is 1★" },
  { moves: 40, par: 4, stars: 1, why: "any finish is 1★ — there is no unrated or zero-star run" },

  /* ── par 10 — the teaching-span unit: ⌈10/10⌉ = 1 ⇒ k1 = 2 ──────────────── */
  { moves: 10, par: 10, stars: 3, why: "a par clear is 3★ at par 10" },
  { moves: 12, par: 10, stars: 3, why: "EXACT par + k1 = 12 is 3★" },
  { moves: 13, par: 10, stars: 2, why: "13 > 12 is 2★" },
  { moves: 14, par: 10, stars: 2, why: "EXACT par + k2 = 14 is 2★" },
  { moves: 15, par: 10, stars: 1, why: "15 > 14 is 1★" },

  /* ── par 11 — the ceil boundary: ⌈11/10⌉ = 2 ⇒ k1 = 4 (not 2) ───────────── */
  { moves: 11, par: 11, stars: 3, why: "a par clear is 3★ at the ceil boundary" },
  { moves: 15, par: 11, stars: 3, why: "EXACT par + k1 = 15 is 3★ — k1 is 4, not 2" },
  { moves: 16, par: 11, stars: 2, why: "16 > 15 is 2★" },
  { moves: 19, par: 11, stars: 2, why: "EXACT par + k2 = 19 is 2★" },
  { moves: 20, par: 11, stars: 1, why: "20 > 19 is 1★" },

  /* ── par 20 — the sealed landing's rung: ⌈20/10⌉ = 2 ⇒ k1 = 4, k2 = 8 ────── */
  { moves: 20, par: 20, stars: 3, why: "a par clear is 3★ at par 20" },
  { moves: 24, par: 20, stars: 3, why: "EXACT par + k1 = 24 is 3★" },
  { moves: 25, par: 20, stars: 2, why: "25 > 24 is 2★" },
  { moves: 28, par: 20, stars: 2, why: "EXACT par + k2 = 28 is 2★" },
  { moves: 29, par: 20, stars: 1, why: "29 > 28 is 1★" },

  /* ── par 21 and par 30 — a second pair of ceil boundaries (k1 = 6) ───────── */
  { moves: 27, par: 21, stars: 3, why: "EXACT par + k1 = 27 is 3★ at par 21" },
  { moves: 28, par: 21, stars: 2, why: "28 > 27 is 2★" },
  { moves: 33, par: 21, stars: 2, why: "EXACT par + k2 = 33 is 2★ at par 21" },
  { moves: 34, par: 21, stars: 1, why: "34 > 33 is 1★ at par 21" },
  { moves: 36, par: 30, stars: 3, why: "EXACT par + k1 = 36 is 3★ at par 30" },
  { moves: 37, par: 30, stars: 2, why: "37 > 36 is 2★" },
  { moves: 42, par: 30, stars: 2, why: "EXACT par + k2 = 42 is 2★ at par 30" },
  { moves: 43, par: 30, stars: 1, why: "43 > 42 is 1★ at par 30" },
];

describe("§5.5 / Ruling A — starsFor(moves, par) is the quoted ladder", () => {
  it("every row of the ruling's table reads as the ruling says (par 4 / 10 / 11 / 20 / 21 / 30)", () => {
    const wrong = TABLE.filter((row) => starsFor(row.moves, row.par) !== row.stars).map(
      (row) => `${String(row.moves)} moves at par ${String(row.par)}: ${row.why}`,
    );
    expect(wrong).toEqual([]);
    expect(TABLE.length).toBeGreaterThanOrEqual(28);
  });

  it("the par-4 ladder is exactly the teaching span's ladder (3★ ≤ 6 · 2★ ≤ 8 · 1★ above)", () => {
    const ladder = Array.from({ length: 13 }, (_, moves) => starsFor(moves, 4));
    expect(ladder).toEqual([3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1, 1]);
  });

  it("a higher move count never increases the rating (monotone, par 1…30)", () => {
    for (let par = 1; par <= 30; par += 1) {
      const { k1 } = starThresholds(par);
      let previous = starsFor(0, par);
      for (let moves = 1; moves <= par + 3 * k1; moves += 1) {
        const now = starsFor(moves, par);
        expect(now, `par ${String(par)}: moves ${String(moves)} rated higher than ${String(moves - 1)}`).toBeLessThanOrEqual(previous);
        expect([1, 2, 3]).toContain(now);
        previous = now;
      }
      // The floor is 1★, never 0 and never undefined: a finish is always rated.
      expect(starsFor(par + 100, par)).toBe(1);
    }
  });
});

describe("§5.5 SF-2/SF-6 — starThresholds is the ADR's own expression", () => {
  it("k1 = 2·⌈par/10⌉ and k2 = 2·k1, hand-typed at every ⌈par/10⌉ boundary", () => {
    const expected: Readonly<Record<number, number>> = {
      1: 2,
      10: 2,
      11: 4,
      20: 4,
      21: 6,
      30: 6,
      31: 8,
      40: 8,
    };
    for (const [parText, k1] of Object.entries(expected)) {
      const par = Number(parText);
      const pair = starThresholds(par);
      expect({ par, ...pair }).toEqual({ par, k1, k2: 2 * k1 });
    }
  });

  it("k1 is even and positive for every par 1…100 — the checkerboard quantum (ADR-0009)", () => {
    for (let par = 1; par <= 100; par += 1) {
      const { k1, k2 } = starThresholds(par);
      expect(k1, `par ${String(par)}`).toBeGreaterThan(0);
      expect(k1 % 2, `par ${String(par)}: k1 must be an even move count`).toBe(0);
      expect(k2).toBe(2 * k1);
      expect(k2 % 2).toBe(0);
    }
  });
});

describe("§5.5 SF-2/SF-3 — the field's constants and its one position rule", () => {
  it("three slots, and the versioned key family the ruling quotes verbatim", () => {
    expect(STAR_SLOTS).toBe(3);
    expect(STAR_STORAGE_KEY).toBe("ps.echoGrid/stars@1");
    expect(STAR_SCHEMA).toBe(1);
  });

  it("starStateAt maps (position, run, best) to earned / held / empty", () => {
    expect(starStateAt(1, 3, 3)).toBe("earned");
    expect(starStateAt(2, 2, 3)).toBe("earned");
    expect(starStateAt(3, 2, 3)).toBe("held");
    expect(starStateAt(2, 1, 2)).toBe("held");
    expect(starStateAt(3, 1, 2)).toBe("empty");
    expect(starStateAt(3, 3, 3)).toBe("earned");
    expect(starStateAt(1, 1, 3)).toBe("earned");
  });

  it("a hollow mark can only mean 'this run's shortfall' — never a best the run already holds", () => {
    const counts: readonly StarCount[] = [1, 2, 3];
    for (const run of counts) {
      for (const best of counts) {
        for (const position of [1, 2, 3]) {
          const state = starStateAt(position, run, best);
          if (state === "held") {
            expect(
              best > run,
              `held at ${String(position)} with run ${String(run)} / best ${String(best)}`,
            ).toBe(true);
            expect(position).toBeGreaterThan(run);
            expect(position).toBeLessThanOrEqual(best);
          }
        }
        // A new best, a first clear and an equal run all draw zero hollow marks.
        if (best <= run) {
          const states = [1, 2, 3].map((position) => starStateAt(position, run, best));
          expect(states).not.toContain("held");
        }
      }
    }
  });
});