/**
 * `hashState` canonical-form contract (`docs/architecture.md` §6.3,
 * ADR-architecture-0001 decision 5 + GATE C addendum: the hash contract is
 * UNCHANGED by Option B).
 *
 * The visited-set is only correct if equal logical states always hash equal and
 * distinct logical states never collide. This suite pins both directions, plus
 * the GATE D consequence: two states with the same hash must have the same
 * legal-move set — even if their `moveCount` bookkeeping differs.
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import { hashState } from "@/core/state/hash";
import { move } from "@/core/state/move";
import {
  applyMoveToGameState,
  initialState,
  toSearchState,
} from "@/core/state/transitions";
import type { GameState, SearchState } from "@/core/state/types";
import { vec } from "@/core/state/types";
import { makeLevel, makeSearchState } from "../helpers/fixtures";
import { ALL_MOVES } from "../helpers/search";

function flags(pairs: ReadonlyArray<readonly [string, boolean]>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [k, v] of pairs) out[k] = v;
  return out;
}

describe("hashState — canonicalization", () => {
  it("is independent of record key insertion order", () => {
    const a = makeSearchState({
      player: vec(2, 3),
      doorsOpen: flags([
        ["d1", true],
        ["d2", true],
        ["d3", true],
      ]),
      switchesOn: flags([
        ["s1", true],
        ["s2", true],
      ]),
    });
    const b = makeSearchState({
      player: vec(2, 3),
      doorsOpen: flags([
        ["d3", true],
        ["d1", true],
        ["d2", true],
      ]),
      switchesOn: flags([
        ["s2", true],
        ["s1", true],
      ]),
    });
    expect(hashState(a)).toBe(hashState(b));
  });

  it("treats `{ d1: false }` and `{}` as the same logical state", () => {
    // A missing key always means closed/off (fail-closed), so false is omitted.
    const withFalse = makeSearchState({ doorsOpen: { d1: false }, switchesOn: { s1: false } });
    const empty = makeSearchState({ doorsOpen: {}, switchesOn: {} });
    expect(hashState(withFalse)).toBe(hashState(empty));
  });

  it("still distinguishes an ON flag from a missing one", () => {
    expect(hashState(makeSearchState({ doorsOpen: { d1: true } }))).not.toBe(
      hashState(makeSearchState({ doorsOpen: {} })),
    );
  });

  it("length-prefixes ids so separator characters cannot collide", () => {
    // Naive `a,b=1,` joins would be ambiguous; the 1-based list here must all
    // hash differently.
    const variants: SearchState[] = [
      makeSearchState({ doorsOpen: flags([["a", true], ["b", true]]) }),
      makeSearchState({ doorsOpen: flags([["a,b", true]]) }),
      makeSearchState({ doorsOpen: flags([["a", true]]) }),
      makeSearchState({ doorsOpen: flags([["a=1,", true]]) }),
      makeSearchState({ doorsOpen: flags([["a|1", true]]) }),
      makeSearchState({ doorsOpen: flags([["", true]]) }),
    ];
    const hashes = variants.map(hashState);
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it("does not confuse doorsOpen with switchesOn (field domains are separated)", () => {
    const inDoors = makeSearchState({ doorsOpen: { x: true }, switchesOn: {} });
    const inSwitches = makeSearchState({ doorsOpen: {}, switchesOn: { x: true } });
    expect(hashState(inDoors)).not.toBe(hashState(inSwitches));
  });

  it("distinguishes each of the four covered fields one at a time", () => {
    const base = makeSearchState({
      player: vec(1, 1),
      phase: "A",
      doorsOpen: { d: true },
      switchesOn: { s: true },
    });
    const variants: Array<[string, SearchState]> = [
      ["player", { ...base, player: vec(1, 2) }],
      ["phase", { ...base, phase: "B" }],
      ["doorsOpen", { ...base, doorsOpen: {} }],
      ["switchesOn", { ...base, switchesOn: {} }],
    ];
    const hashes = variants.map(([, s]) => hashState(s));
    for (const h of hashes) expect(h).not.toBe(hashState(base));
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});

describe("hashState — the GATE D board invariant made executable", () => {
  const level: Level = makeLevel({ width: 5, height: 3, player: [0, 1], goal: [4, 1] });

  it("two states with the same hash but different moveCount have identical legal-move sets", () => {
    const g0: GameState = initialState(level); // moveCount 0
    // RIGHT then LEFT returns to the same logical state with moveCount 2.
    const g2: GameState = applyMoveToGameState(
      level,
      applyMoveToGameState(level, g0, move("right")),
      move("left"),
    );

    const s0 = toSearchState(g0);
    const s2 = toSearchState(g2);

    expect(s2.player).toEqual(s0.player);
    expect(s2.phase).toBe(s0.phase);
    expect(hashState(s0)).toBe(hashState(s2));
    expect(g0.moveCount).toBe(0);
    expect(g2.moveCount).toBe(2);
    expect(g0.moveCount).not.toBe(g2.moveCount);

    // Same hash ⇒ same board: identical legal set, identical successor hashes.
    for (const m of ALL_MOVES) {
      expect(isLegalMove(level, s0, m)).toBe(isLegalMove(level, s2, m));
      expect(hashState(applyMove(level, s0, m))).toBe(hashState(applyMove(level, s2, m)));
    }
  });

  it("different logical boards hash differently (no visited-set over-merging)", () => {
    const a = makeSearchState({ player: vec(1, 1), phase: "A" });
    const b = makeSearchState({ player: vec(1, 1), phase: "B" });
    const c = makeSearchState({ player: vec(2, 1), phase: "A" });
    expect(new Set([hashState(a), hashState(b), hashState(c)]).size).toBe(3);
  });
});