// @vitest-environment jsdom

/**
 * QA-019 — **the star persistence contract, pinned on real `localStorage`**
 * (`docs/ui-ux.md` V0.9.7 §5.5 SF-5 + ADR-`design-0005` Ruling A).
 *
 * ── What this file decides ───────────────────────────────────────────────────
 * `ps.echoGrid/stars@1` is the whole record, and the ruling states it in one line:
 * **win-only, monotone, and stated ON MOVES** — the star count is *derived* from the
 * stored measurement, never stored beside it. Four claims follow, and every one of
 * them is measured here rather than argued:
 *
 * 1. **monotone on moves** — a better run writes, an equal or worse run leaves the
 *    stored bytes **untouched** (asserted two ways: the serialized string is
 *    byte-identical, and `Storage.prototype.setItem` was *not called at all*, which
 *    is the stronger statement — no read-modify-write of an equal value);
 * 2. **stars are derived** — no payload this module ever writes contains a star
 *    count; `bestStarsFor(levelId, par)` re-derives from the stored moves, so a par
 *    re-cut later cannot desynchronise the two;
 * 3. **tolerant reads** — corrupt JSON, a foreign schema number, a non-object
 *    payload, invalid rows, a throwing store and **no store at all** all read as
 *    "no record" (`null`, never `0`, never a throw);
 * 4. **level isolation** — a win on one level preserves every other valid row
 *    verbatim, and an unknown id is simply absent.
 *
 * `jsdom` is opted into per file (the config's default environment is `node`);
 * the pure ladder table lives in `stars-rating.test.ts`, which stays `node`.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  STAR_SCHEMA,
  STAR_STORAGE_KEY,
  bestMovesFor,
  bestStarsFor,
  recordWinStars,
} from "@/game/systems/stars";

/** The exact bytes the module is expected to write for one improved row. */
function payload(best: Record<string, number>): string {
  const rows = Object.entries(best)
    .map(([id, moves]) => `"${id}":{"moves":${String(moves)}}`)
    .join(",");
  return `{"schema":${String(STAR_SCHEMA)},"best":{${rows}}}`;
}

const stored = (): string | null => window.localStorage.getItem(STAR_STORAGE_KEY);

/** Seed the store directly, exactly as a previous sitting of the game would have. */
function seed(rows: Readonly<Record<string, number>>): void {
  window.localStorage.setItem(STAR_STORAGE_KEY, payload({ ...rows }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("§5.5 SF-5 — the write is win-only, monotone, and stores MOVES", () => {
  it("a first clear writes one row, and the payload holds no star count at all", () => {
    expect(bestMovesFor(1)).toBeNull();
    expect(bestStarsFor(1, 4)).toBeNull();

    const win = recordWinStars(1, 4, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 4, improved: true });
    expect(stored()).toBe(payload({ 1: 4 }));
    // The load-bearing half: the stored measurement is moves, and the stars are
    // derived from it. A payload carrying `stars` would be a second truth source.
    expect(stored()).not.toMatch(/star/i);
    expect(stored()).not.toContain("run");
  });

  it("the rating is re-derived from the stored moves, so a par re-cut cannot desynchronise it", () => {
    recordWinStars(1, 8, 4);
    expect(stored()).toBe(payload({ 1: 8 }));
    expect(bestStarsFor(1, 4)).toBe(2); // 8 = par + k2 at par 4 ⇒ the boundary row
    expect(bestStarsFor(1, 10)).toBe(3); // the same stored 8 moves, a looser par (3★ ≤ 12)
    expect(bestStarsFor(1, 8)).toBe(3); // …and at par 8 it is still inside par + k1 = 10
    expect(bestStarsFor(1, 1)).toBe(1); // a par-1 rung rates the same 8 moves as 1★
  });

  it("a worse run never downgrades: the bytes are untouched and no write happens at all", () => {
    seed({ 1: 6 });
    const before = stored();
    const spy = vi.spyOn(Storage.prototype, "setItem");

    const worse = recordWinStars(1, 8, 4);
    expect(worse).toEqual({ run: 2, best: 3, bestMoves: 6, improved: false });
    expect(stored(), "a worse run must not rewrite the record").toBe(before);
    expect(spy, "an equal/worse run must not even issue a write").not.toHaveBeenCalled();
  });

  it("an equal run is not an improvement either — bytes and write count both unchanged", () => {
    seed({ 1: 6 });
    const before = stored();
    const spy = vi.spyOn(Storage.prototype, "setItem");

    const equal = recordWinStars(1, 6, 4);
    expect(equal).toEqual({ run: 3, best: 3, bestMoves: 6, improved: false });
    expect(stored()).toBe(before);
    expect(spy).not.toHaveBeenCalled();
  });

  it("a better run is the only write, and it lands on the new minimum", () => {
    seed({ 1: 6 });
    const spy = vi.spyOn(Storage.prototype, "setItem");

    const better = recordWinStars(1, 5, 4);
    expect(better).toEqual({ run: 3, best: 3, bestMoves: 5, improved: true });
    expect(stored()).toBe(payload({ 1: 5 }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("a whole sitting is monotone on moves: 12, 9, 7, 6, 6, 5 → the record is 5", () => {
    const runs = [12, 9, 7, 6, 6, 5];
    const ratings = runs.map((moves) => recordWinStars(1, moves, 4).best);
    // The best rating never falls as runs come in, and an equal run (the second 6)
    // neither writes nor moves it — that is the monotone rule as the player sees it.
    expect(ratings).toEqual([1, 1, 2, 3, 3, 3]);
    expect(bestMovesFor(1)).toBe(5);
    expect(stored()).toBe(payload({ 1: 5 }));
  });
});

describe("§5.5 SF-5 — one level's win cannot disturb another's row", () => {
  it("every other valid row survives the write verbatim", () => {
    seed({ 2: 3, 9: 11 });
    const win = recordWinStars(4, 6, 20);
    expect(win.bestMoves).toBe(6);
    expect(stored()).toBe(payload({ 2: 3, 9: 11, 4: 6 }));
    expect(bestMovesFor(2)).toBe(3);
    expect(bestMovesFor(4)).toBe(6);
    expect(bestMovesFor(9)).toBe(11);
  });

  it("an unknown level id is absent, not zero, and its own win stays isolated", () => {
    seed({ 2: 3 });
    expect(bestMovesFor(7)).toBeNull();
    expect(bestStarsFor(7, 4)).toBeNull();
    recordWinStars(7, 10, 4);
    expect(bestMovesFor(7)).toBe(10);
    expect(bestMovesFor(2), "the neighbour's record is untouched").toBe(3);
    expect(bestMovesFor(8)).toBeNull();
  });
});

describe("§5.5 SF-5 — a broken store reads as 'no record', never as a crash", () => {
  it("absent key, corrupt JSON and a non-object payload all read as null", () => {
    expect(bestMovesFor(1)).toBeNull();
    window.localStorage.setItem(STAR_STORAGE_KEY, "{ not json");
    expect(bestMovesFor(1)).toBeNull();
    window.localStorage.setItem(STAR_STORAGE_KEY, "[]");
    expect(bestMovesFor(1)).toBeNull();
    window.localStorage.setItem(STAR_STORAGE_KEY, "\"a string\"");
    expect(bestMovesFor(1)).toBeNull();
    window.localStorage.setItem(STAR_STORAGE_KEY, "null");
    expect(bestMovesFor(1)).toBeNull();
  });

  it("a foreign schema number is not this version's data: it is not coerced", () => {
    window.localStorage.setItem(
      STAR_STORAGE_KEY,
      `{"schema":${String(STAR_SCHEMA + 1)},"best":{"1":{"moves":3}}}`,
    );
    expect(bestMovesFor(1), "a schema-2 row never reads as this family's record").toBeNull();
    expect(bestStarsFor(1, 4)).toBeNull();

    // …and the next win writes this family's own payload, not a merged one.
    const win = recordWinStars(1, 6, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 6, improved: true });
    expect(stored()).toBe(payload({ 1: 6 }));
  });

  it("a corrupt store still lets a win be rated, and the write replaces the damage", () => {
    window.localStorage.setItem(STAR_STORAGE_KEY, "{ not json");
    const win = recordWinStars(1, 6, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 6, improved: true });
    expect(stored()).toBe(payload({ 1: 6 }));
  });

  it("invalid rows are dropped and valid rows preserved (negative, fractional, string, null, empty)", () => {
    window.localStorage.setItem(
      STAR_STORAGE_KEY,
      `{"schema":1,"best":{"1":{"moves":-1},"2":{"moves":2.5},"3":{"moves":"3"},"4":{"moves":null},"5":{}}}`,
    );
    for (const id of [1, 2, 3, 4, 5]) {
      expect(bestMovesFor(id), `row ${String(id)} is not a stored measurement`).toBeNull();
    }
    window.localStorage.setItem(
      STAR_STORAGE_KEY,
      '{"schema":1,"best":{"1":null,"2":[1],"5":{"moves":7}}}',
    );
    expect(bestMovesFor(5)).toBe(7);
    expect(bestMovesFor(1)).toBeNull();
    expect(bestMovesFor(2)).toBeNull();
    recordWinStars(4, 6, 4);
    expect(stored(), "only the one valid row and the new row are written back").toBe(
      payload({ 5: 7, 4: 6 }),
    );
  });

  it("a store that throws on read is a read of 'no record' — and the win still rates", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked store");
    });
    expect(bestMovesFor(1)).toBeNull();
    const win = recordWinStars(1, 6, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 6, improved: true });
  });

  it("a store that throws on write is swallowed: the run is still rated, nothing persists", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const win = recordWinStars(1, 6, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 6, improved: true });
    expect(spy).toHaveBeenCalledTimes(1); // it tried — and the failure never escaped
  });

  it("no localStorage at all (node, or a blocked global) is 'no record', never a throw", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(bestMovesFor(1)).toBeNull();
    expect(bestStarsFor(1, 4)).toBeNull();
    const win = recordWinStars(1, 6, 4);
    expect(win).toEqual({ run: 3, best: 3, bestMoves: 6, improved: true });
    // Nothing to assert about bytes: there is no store. The claim is that the rating
    // the panel shows does not depend on persistence succeeding.
    vi.unstubAllGlobals();
    expect(stored(), "the stub wrote nothing").toBeNull();
  });
});