/**
 * LV-007B · item 3 — the `docs/level-difficulty.md` §2 model, measured.
 *
 * `D = w1·L + w2·B + w3·T + w4·R + w5·M`, with the doc's **provisional** weights
 * (`1, 3, 4, 2, 5`). This file is the program half of §5.1: it pins what the solver
 * actually computes, including the three numbers the doc had recorded as *missing*
 * (`B` effective, `T`, `R`) and the resulting `D` for L1–L10 — plus, since LV-007C
 * item 2, the **execution axis** `D_exec = D − w5·M` (ADR-design-0001, the axis the
 * dip law lives on), in both of its forms.
 *
 * ── THE TWO THINGS THIS FILE IS CAREFUL ABOUT ────────────────────────────────
 *  1. **Zero is a measurement, not a hole.** `T = 0` and `R = 0` on all ten shipped
 *     levels, so each is paired with a *non-vacuous* control: a board that violates
 *     `docs/level-design.md` §4 and really does report `T > 0` / `R > 0`. Without
 *     those controls, a broken `T` would be indistinguishable from the theorem below.
 *  2. **The weights are a hypothesis and are reported, not tuned.** The seam the
 *     curve rule asks for is *not* what the formula produces, and the disagreement is
 *     pinned here (§3) rather than smoothed away: the doc's §3 rule "a new-mechanic
 *     block always starts with a dip" is incompatible with `w5·M` at the step where
 *     the mechanic is introduced, and `T`/`R` cannot offset it because §4 forbids the
 *     very states they would measure.
 *
 * Theorem (proved by the code below, not by this comment): inside the §4 acceptance
 * region (`noUnrecoverableOk`, no dead states) `T ≡ 0` and `R ≡ 0`, so
 * `D = L + 3·B + 5·M` there. The only levers a shipped level can move are the move
 * count, the effective branching factor, and the mechanic count.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Coord, Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import { analyse, explore, solve } from "@/core/solver/bfs";
import {
  DIFFICULTY_WEIGHTS,
  analyseDifficulty,
  mechanicsCount,
} from "@/core/solver/difficulty";
import { auditLevel } from "@/core/solver/policy";
import { door, makeLevel, portal, switchDef } from "../helpers/fixtures";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

const SHIPPED_IDS = readdirSync(LEVELS_DIR)
  .filter((name) => /^l\d+\.json$/.test(name))
  .map((name) => Number(name.slice(1, -".json".length)))
  .sort((a, b) => a - b);

function shippedBoard(id: number): Level {
  const raw = JSON.parse(
    readFileSync(`${LEVELS_DIR}l${String(id).padStart(3, "0")}.json`, "utf8"),
  ) as Level;
  expect(validateLevel(raw).ok, `l${String(id).padStart(3, "0")}`).toBe(true);
  return raw;
}

const SHIPPED_CASES = SHIPPED_IDS.map(
  (id) => [String(id).padStart(3, "0"), id] as const,
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. The weights are the doc's, and they are the only place they exist
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · item 3 — the §2 weights are provisional, published, and singular", () => {
  it("the code's weights are exactly the §2 V0.1 table", () => {
    // w1 (L) 1.0 · w2 (B) 3.0 · w3 (T) 4.0 · w4 (R) 2.0 · w5 (M) 5.0
    expect(DIFFICULTY_WEIGHTS).toEqual({ L: 1, B: 3, T: 4, R: 2, M: 5 });
  });

  it("`D` is the weighted sum of the five reported terms — no hidden term", () => {
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      const d = analyseDifficulty(level, explore(level));
      expect(d.L, `l${id}`).not.toBeNull();
      expect(d.D, `l${id}`).toBeCloseTo(
        1 * (d.L as number) + 3 * d.B + 4 * d.T + 2 * d.R + 5 * d.M,
        12,
      );
      // The weights the number was computed with travel with it: a stored `D` can
      // never be re-read against a later re-calibration by mistake.
      expect(d.weights, `l${id}`).toEqual(DIFFICULTY_WEIGHTS);
    }
  });

  it("`M` counts mechanic CATEGORIES, once each (§5.1's `1 + doors + switches + portals`)", () => {
    const wallsOnly = makeLevel({ player: [0, 0] as Coord, goal: [4, 0] as Coord });
    expect(mechanicsCount(wallsOnly)).toBe(1);

    const latch = makeLevel({
      doors: [door("d1", "red", [[3, 1]])],
      switches: [switchDef("s1", [2, 0], "A", ["d1"])],
    });
    expect(mechanicsCount(latch)).toBe(3);

    // Two doors are still one category — "M3" must mean the same construction on
    // every board, otherwise the weight would measure object count, not cognitive load.
    const twoDoors = makeLevel({
      doors: [
        door("d1", "red", [[3, 1]]),
        door("d2", "blue", [[3, 2]]),
      ],
      switches: [switchDef("s1", [2, 0], "A", ["d1", "d2"])],
    });
    expect(mechanicsCount(twoDoors)).toBe(3);

    const allThree: Level = {
      ...twoDoors,
      portals: [portal("p1", [0, 0], [1, 2], "A")],
    };
    expect(mechanicsCount(allThree)).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The measured L1–L10 table (the doc's §5.1, now with B / T / R / D)
// ─────────────────────────────────────────────────────────────────────────────

interface DifficultyPin {
  readonly L: number;
  readonly B: number;
  readonly T: number;
  readonly R: number;
  readonly M: number;
  readonly D: number;
  /** The execution axis `D_exec = D − w5·M` (§2a; ADR-design-0001) — LV-007C item 2. */
  readonly dexec: number;
  /** Diagnostic: plain mean out-degree — must equal §5.1's documented `B_raw`. */
  readonly bRaw: number;
  /** Diagnostic: share of states with exactly one legal move (§5.1). */
  readonly forced: number;
  /** Diagnostic: the *other* reading of `T` — saturated at `L − 1` on all ten. */
  readonly lookahead: number;
  readonly states: number;
}

/**
 * Every value below is measured by the shipped solver. `bRaw`, `forced` and `states`
 * are cross-checks against the numbers §5.1 already published (they were produced
 * before this module existed), and `B`, `T`, `R`, `D` are the three fields §5.1
 * recorded as *missing*.
 */
const PINS: Readonly<Record<number, DifficultyPin>> = {
  1: { L: 4, B: 1.6667, T: 0, R: 0, M: 1, D: 14.0, dexec: 9.0, bRaw: 2.93, forced: 0.0, lookahead: 3, states: 15 },
  2: { L: 5, B: 1.6875, T: 0, R: 0, M: 1, D: 15.0625, dexec: 10.0625, bRaw: 3.0, forced: 0.0, lookahead: 4, states: 16 },
  3: { L: 6, B: 1.4286, T: 0, R: 0, M: 1, D: 15.285714, dexec: 10.285714, bRaw: 2.57, forced: 0.0, lookahead: 5, states: 14 },
  4: { L: 6, B: 1.5263, T: 0, R: 0, M: 1, D: 15.578947, dexec: 10.578947, bRaw: 2.84, forced: 0.0, lookahead: 5, states: 19 },
  5: { L: 6, B: 1.4444, T: 0, R: 0, M: 1, D: 15.333333, dexec: 10.333333, bRaw: 2.78, forced: 0.11, lookahead: 5, states: 18 },
  6: { L: 4, B: 1.6207, T: 0, R: 0, M: 3, D: 23.862069, dexec: 8.862069, bRaw: 2.76, forced: 0.0, lookahead: 3, states: 29 },
  7: { L: 4, B: 1.25, T: 0, R: 0, M: 3, D: 22.75, dexec: 7.75, bRaw: 2.0, forced: 0.25, lookahead: 3, states: 12 },
  8: { L: 6, B: 1.5, T: 0, R: 0, M: 3, D: 25.5, dexec: 10.5, bRaw: 2.82, forced: 0.12, lookahead: 5, states: 34 },
  9: { L: 8, B: 1.3793, T: 0, R: 0, M: 3, D: 27.137931, dexec: 12.137931, bRaw: 2.59, forced: 0.03, lookahead: 7, states: 58 },
  10: { L: 9, B: 1.5476, T: 0, R: 0, M: 3, D: 28.642857, dexec: 13.642857, bRaw: 2.95, forced: 0.1, lookahead: 8, states: 42 },
  // LV-008 — the M2 debut: `B` 1.5244 (exact 1.524390243902439) is *lower* than L10's
  // and `L` falls 9 → 4, so the execution axis drops to 8.5732 while `M` rises to 4
  // (M1+M3+M2): `D` = 28.5732 sits 0.07 *below* L10's, but the mechanic-count term is
  // 20 of it. The seam law is therefore written on `D_exec`, not on `D`
  // (ADR-design-0001) — the same finding §3 records for L5→L6.
  11: { L: 4, B: 1.5244, T: 0, R: 0, M: 4, D: 28.573171, dexec: 8.573171, bRaw: 2.98, forced: 0.02, lookahead: 3, states: 82 },
};

describe("LV-007B · item 3 — the L1–L10 difficulty table, measured", () => {
  it("the pin table covers the dataset", () => {
    expect(Object.keys(PINS).map(Number).sort((a, b) => a - b)).toEqual(
      SHIPPED_IDS,
    );
  });

  it.each(SHIPPED_CASES)("l%s — §2 breakdown", (_label, id) => {
    const pin = PINS[id] as DifficultyPin;
    const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));

    expect({ L: d.L, T: d.T, R: d.R, M: d.M }).toEqual({
      L: pin.L,
      T: pin.T,
      R: pin.R,
      M: pin.M,
    });
    expect(d.B, `l${id} B`).toBeCloseTo(pin.B, 4);
    expect(d.D, `l${id} D`).toBeCloseTo(pin.D, 6);
    expect(d.Dexec, `l${id} D_exec`).toBeCloseTo(pin.dexec, 6);
    expect(d.bRaw, `l${id} B_raw`).toBeCloseTo(pin.bRaw, 2);
    expect(d.forcedMoveRatio, `l${id} forced`).toBeCloseTo(pin.forced, 2);
    expect(d.lookaheadDepth, `l${id} lookaheadDepth`).toBe(pin.lookahead);
    expect(d.reachableStates, `l${id} states`).toBe(pin.states);
    expect(d.unrecoverableRatio, `l${id} unrecoverable`).toBe(0);
  });

  it("`L` is the solver's shortest solution, never the file's `par` claim", () => {
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      const d = analyseDifficulty(level, explore(level));
      expect(d.L, `l${id}`).toBe(solve(level).shortestSolution);
    }
  });

  it("`B` is the effective factor, and it is genuinely smaller than `B_raw`", () => {
    // The doc's whole point: raw out-degree is not the thing that makes a level hard.
    // If `B` ever equalled `B_raw` on every level, the dominance filter would be dead
    // code and §2's "non-dominated" qualifier would be unpinned.
    for (const id of SHIPPED_IDS) {
      const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));
      expect(d.B, `l${id}`).toBeLessThan(d.bRaw);
      expect(d.B, `l${id}`).toBeGreaterThan(1); // …and the player always has a choice
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2c. LV-007C · item 2 — the execution axis `D_exec = D − w5·M` (ADR-design-0001)
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007C · item 2 — `D_exec` is a derived reading of the published terms, not a second metric", () => {
  it("the two forms agree on all ten: `D − w5·M` = `w1·L + w2·B + w3·T + w4·R`", () => {
    // The field is computed from the formula's own non-`M` terms and the subtraction
    // is the cross-check — so the identity is asserted, never assumed. This is the
    // "both forms printed" contract of `scripts/solve-levels.ts`'s `difficultyExec`
    // line, in assertions.
    for (const id of SHIPPED_IDS) {
      const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));
      expect(d.Dexec, `l${id}`).toBeCloseTo(
        (d.D as number) - DIFFICULTY_WEIGHTS.M * d.M,
        12,
      );
      expect(d.Dexec, `l${id}`).toBeCloseTo(
        DIFFICULTY_WEIGHTS.L * (d.L as number) +
          DIFFICULTY_WEIGHTS.B * d.B +
          DIFFICULTY_WEIGHTS.T * d.T +
          DIFFICULTY_WEIGHTS.R * d.R,
        12,
      );
      // …and inside the §4 acceptance region it collapses to `L + 3·B` (§5.2's
      // theorem — the only two live terms), which is how `docs/level-design.md` §6
      // recomputes the curve by hand.
      expect(d.Dexec, `l${id}`).toBeCloseTo(
        (d.L as number) + DIFFICULTY_WEIGHTS.B * d.B,
        12,
      );
    }
  });

  it("`D_exec` is `null` exactly where `D` is (an unsolvable board has no axis position)", () => {
    // Same sealed board §4 uses: schema-legal, solvable = false, so neither the total
    // nor the execution axis may carry a fabricated number.
    const sealed: Level = {
      id: 7_202,
      width: 3,
      height: 3,
      startPhase: "A",
      player: [0, 0] as Coord,
      goal: [2, 2] as Coord,
      phaseAWalls: [
        [1, 2],
        [2, 1],
      ],
      phaseBWalls: [
        [1, 2],
        [2, 1],
      ],
      doors: [],
      switches: [],
      portals: [],
      par: 4,
    };
    const d = analyseDifficulty(sealed, explore(sealed));
    expect(d.D).toBeNull();
    expect(d.Dexec).toBeNull();
    // …and the §4-violating control from §3 shows the axis is not blind to `T`/`R`:
    // on a board where those terms are non-zero, `D_exec` differs from `L + 3·B`.
    const trapped: Level = {
      id: 7_203,
      width: 5,
      height: 3,
      startPhase: "A",
      player: [0, 0] as Coord,
      goal: [1, 2] as Coord,
      phaseAWalls: [
        [2, 1],
        [4, 1],
        [3, 0],
        [3, 2],
      ],
      phaseBWalls: [
        [2, 1],
        [4, 1],
        [3, 0],
        [3, 2],
      ],
      doors: [],
      switches: [],
      portals: [portal("p1", [1, 0], [3, 1], "A")],
      par: 3,
    };
    const t = analyseDifficulty(trapped, explore(trapped));
    expect(t.T).toBeGreaterThan(0);
    expect(t.R).toBeGreaterThan(0);
    expect(t.Dexec).toBeCloseTo(
      (t.D as number) - DIFFICULTY_WEIGHTS.M * t.M,
      12,
    );
    expect(t.Dexec as number).toBeGreaterThan(
      (t.L as number) + DIFFICULTY_WEIGHTS.B * t.B,
    );
  });

  it("the pre-registered L11 threshold is the shipped L10 value, reproduced by the program", () => {
    // `docs/level-design.md` §6 (V0.6) pre-registers `D_exec(L11) < 13.64` as the
    // falsifiable seam law for the portal block. That number is not a doc constant:
    // it is L10's measured `D_exec`, recomputed here from the shipped board's own
    // terms, so the document cannot drift away from the level it was read from.
    const l10 = analyseDifficulty(shippedBoard(10), explore(shippedBoard(10)));
    expect(l10.Dexec).toBeCloseTo(13.642857, 6);
    expect((l10.Dexec as number).toFixed(2)).toBe("13.64");
    // …and the value published for every level of the ten is the one the CLI prints
    // (`difficultyExec Dexec=…`), on the same axis the seam law is written on.
    expect(
      SHIPPED_IDS.map((id) => {
        const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));
        return (d.Dexec as number).toFixed(2);
      }),
    ).toEqual([
      "9.00",
      "10.06",
      "10.29",
      "10.58",
      "10.33",
      "8.86",
      "7.75",
      "10.50",
      "12.14",
      "13.64",
      "8.57",
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The §4 theorem, and the seam the curve rule asks for
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · item 3 — `T` and `R` are structurally zero inside the §4 acceptance region", () => {
  it("T = 0 and R = 0 on 10/10 shipped levels — reported, so the theorem is visible", () => {
    for (const id of SHIPPED_IDS) {
      const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));
      expect({ T: d.T, R: d.R }, `l${id}`).toEqual({ T: 0, R: 0 });
    }
    // …and the reason is not "the measurement is broken": the invariant those terms
    // would measure is true on every shipped level (`docs/level-design.md` §4).
    for (const id of SHIPPED_IDS) {
      const result = solve(shippedBoard(id));
      expect(result.noUnrecoverableOk, `l${id}`).toBe(true);
      expect(result.deadStates, `l${id}`).toBe(0);
    }
    // ⇒ the usable formula inside that region has only three live terms:
    for (const id of SHIPPED_IDS) {
      const d = analyseDifficulty(shippedBoard(id), explore(shippedBoard(id)));
      expect(d.D, `l${id}`).toBeCloseTo(
        (d.L as number) + 3 * d.B + 5 * d.M,
        12,
      );
    }
  });

  it("the zero is a measurement — a §4-violating board really reports T > 0 and R > 0", () => {
    // Construction (everything here is a consequence of `applyMove`'s one rule,
    // ADR-0008: legality is decided **at entry, current phase only**, and standing
    // inside a solid cell is legal — c1/c3/c8):
    //
    // - `(3,1)` is sealed: all four of its neighbours are walls in **both** phases,
    //   so no ordinary move can ever enter it or leave it.
    // - The portal pair `(1,0) ⇄ (3,1)` is opposite-parity (1 vs 4) and both ends are
    //   non-wall in both phases, which is what the validator requires — so the
    //   teleport is legal and *deposits* the player inside the sealed room. That is
    //   the only entry: `(3,1)` becomes a reachable **dead state** (no legal move),
    //   i.e. a reachable state from which the goal can never be reached.
    // - The goal `(1,2)` sits in the open part of the board, so the level is solvable
    //   and the sealed room is a genuine *mistake* the player can walk into.
    //
    // The board is schema- and rule-legal (`validateLevel.ok`); what it breaks is
    // `docs/level-design.md` §4 — exactly the invariant `T` and `R` exist to measure.
    const trapped: Level = {
      id: 7_200,
      width: 5,
      height: 3,
      startPhase: "A",
      player: [0, 0] as Coord,
      goal: [1, 2] as Coord,
      phaseAWalls: [
        [2, 1],
        [4, 1],
        [3, 0],
        [3, 2],
      ],
      phaseBWalls: [
        [2, 1],
        [4, 1],
        [3, 0],
        [3, 2],
      ],
      doors: [],
      switches: [],
      portals: [portal("p1", [1, 0], [3, 1], "A")],
      par: 3,
    };
    expect(validateLevel(trapped as unknown).ok).toBe(true);

    const result = solve(trapped);
    expect(result.solvable).toBe(true); // the goal is reachable…
    expect(result.noUnrecoverableOk).toBe(false); // …but not from every reachable state
    expect(result.deadStates).toBeGreaterThan(0); // the sealed room, entered by portal
    expect(result.unrecoverableStates).toBeGreaterThan(0);

    const d = analyseDifficulty(trapped, explore(trapped));
    expect(d.R).toBeGreaterThan(0); // dead-end ratio: the sealed room
    expect(d.T).toBeGreaterThan(0); // a legal move really leads into it
    expect(d.unrecoverableRatio).toBeGreaterThan(0); // …and the companion ratio too
    expect(d.L).not.toBeNull();
    // Both now feed `D`, so the two weights are not decorative:
    expect(d.D).toBeCloseTo(
      (d.L as number) + 3 * d.B + 4 * d.T + 2 * d.R + 5 * d.M,
      12,
    );
    expect(4 * d.T + 2 * d.R).toBeGreaterThan(0);
    // The portal is M2 content, so `M` counts it — the mechanic count follows the
    // board, not the lesson label.
    expect(d.M).toBe(2); // walls + portals (no doors, no switches on this board)
  });
});

describe("LV-007B · item 3 — the L5→L6 seam: measured, and not the dip §3 asks for", () => {
  const difficultyOf = (id: number): DifficultyPin => PINS[id] as DifficultyPin;

  it("`D` RISES by +8.53 across the L5→L6 block opening (the design asks for −2…−3)", () => {
    // docs/level-design.md §6: the first level of the latch block "sits 2–3 points
    // below the previous block's peak on the difficulty metric D". Measured, with
    // the §2 formula and the §2 weights, it sits **+8.53 above** instead. The number
    // is recorded as-is: the formula is not re-weighted to manufacture the dip, and
    // the weights stay the doc's hypothesis.
    const seam = difficultyOf(6).D - difficultyOf(5).D;
    expect(seam).toBeCloseTo(8.528736, 6);
    expect(seam).toBeGreaterThan(0);
  });

  it("the seam decomposes into the three live terms — and `M` is what carries it", () => {
    // Measured breakdowns, not the rounded pin table: the decomposition has to add up
    // to the *reported* seam, otherwise it would be a re-derivation with its own
    // rounding error.
    const a = analyseDifficulty(shippedBoard(5), explore(shippedBoard(5)));
    const b = analyseDifficulty(shippedBoard(6), explore(shippedBoard(6)));
    const dL = ((b.L as number) - (a.L as number)) * DIFFICULTY_WEIGHTS.L; // 4 − 6 = −2
    const dB = (b.B - a.B) * DIFFICULTY_WEIGHTS.B; // B RISES 1.4444 → 1.6207
    const dM = (b.M - a.M) * DIFFICULTY_WEIGHTS.M; // M 1 → 3, +5 per category
    const top = 4 * (b.T - a.T) + 2 * (b.R - a.R); // …and the §4-only terms cannot help

    expect(dL).toBe(-2);
    expect(dM).toBe(10);
    expect(top).toBe(0);
    expect(dL + dB + dM + top).toBeCloseTo((b.D as number) - (a.D as number), 12);
    expect(dL + dB + dM).toBeCloseTo(8.528736, 6);

    // The structural finding: introducing a mechanic raises `D` by 5·ΔM in the very
    // step where the "dip" is supposed to lower it, while `L` can fall at most to the
    // block's floor (4 here) and `B` does not fall at all — it rises. A −2…−3 dip at a
    // mechanic introduction is therefore unreachable with these weights *by
    // construction*, whatever the board looks like: it is a weight/definition question
    // for the Game Designer (see this task's OPEN_QUESTIONS), not an authoring failure.
    expect(dM).toBeGreaterThan(Math.abs(dL) + 2);
    expect(dB).toBeGreaterThan(0);
  });

  it("the block still opens with the *move-count* dip §3 describes (L, not D)", () => {
    // The half of the §3 rule that does hold today, stated next to the half that does
    // not: par falls 6 → 4 at L6 while M jumps 1 → 3.
    expect(difficultyOf(6).L).toBeLessThan(difficultyOf(5).L);
    expect(difficultyOf(6).M).toBeGreaterThan(difficultyOf(5).M);
    expect(difficultyOf(6).L).toBe(4);
  });

  it("`lookaheadDepth` (the other reading of `T`) saturates at `L − 1` — it is not the missing lever", () => {
    // Pinned so nobody adopts the alternative reading expecting a differentiator:
    // on all ten shipped levels the deepest state where a move can waste the par is
    // exactly one step before the goal. It is retained as a *diagnostic* (the number
    // a re-worded §2 would have to beat), never as a weight.
    for (const id of SHIPPED_IDS) {
      const pin = PINS[id] as DifficultyPin;
      expect(pin.lookahead, `l${id}`).toBe(pin.L - 1);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Plumbing and boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007B · item 3 — plumbing, and what `D` is on a board with no solution", () => {
  it("`LevelAudit.difficulty` is the graph-level measurement, not a second opinion", () => {
    for (const id of SHIPPED_IDS) {
      const level = shippedBoard(id);
      expect(auditLevel(level).difficulty, `l${id}`).toEqual(
        analyseDifficulty(level, explore(level)),
      );
    }
  });

  it("an unsolvable board has `L = null` and `D = null` (no solution ⇒ no curve spot)", () => {
    // Walls that seal the goal tile in both phases: the board is schema-legal, is
    // rejected by no policy code except solvability, and must never be handed a
    // fabricated difficulty. The board-level terms are still measured.
    const sealed: Level = {
      id: 7_201,
      width: 3,
      height: 3,
      startPhase: "A",
      player: [0, 0] as Coord,
      goal: [2, 2] as Coord,
      phaseAWalls: [
        [1, 2],
        [2, 1],
      ],
      phaseBWalls: [
        [1, 2],
        [2, 1],
      ],
      doors: [],
      switches: [],
      portals: [],
      par: 4,
    };
    expect(validateLevel(sealed as unknown).ok).toBe(true);
    expect(solve(sealed).solvable).toBe(false);

    const d = analyseDifficulty(sealed, explore(sealed));
    expect(d.L).toBeNull();
    expect(d.D).toBeNull();
    expect(d.M).toBe(1);
    expect(d.reachableStates).toBeGreaterThan(0);
    expect(Number.isFinite(d.B)).toBe(true);
    expect(Number.isFinite(d.R)).toBe(true);
  });

  it("the §8 report is untouched by the difficulty model (it stays a hypothesis)", () => {
    // `SolveResult` deliberately does not carry `D`: the weights are provisional, so
    // publishing them through the §8 contract would make a playtest re-calibration a
    // solver API change. The breakdown lives on the audit instead.
    for (const id of SHIPPED_IDS) {
      const result = solve(shippedBoard(id));
      expect(Object.keys(result)).not.toContain("difficulty");
      expect(Object.keys(result)).not.toContain("D");
    }
    expect(Object.keys(auditLevel(shippedBoard(1)))).toContain("difficulty");
  });

  it("`analyseDifficulty` never re-searches: it reads the graph it was handed", () => {
    const level = shippedBoard(9);
    const graph = explore(level);
    expect(analyseDifficulty(level, graph)).toEqual(
      analyseDifficulty(level, graph),
    );
    expect(analyse(level, graph).shortestSolution).toBe(
      analyseDifficulty(level, graph).L,
    );
  });
});