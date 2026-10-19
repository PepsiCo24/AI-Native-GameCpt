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
 *  1. **Zero is a measurement, not a hole.** `T = 0` and `R = 0` on every shipped
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
// 2. The measured dataset table (the doc's §5.1, now with B / T / R / D)
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
  /** Diagnostic: the *other* reading of `T` — saturated at `L − 1` on every shipped level. */
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
  // LV-009-B — the L12–L15 block (ADR-design-0003). All four are M1+M3+M2 boards
  // (`M = 4`), `T ≡ R ≡ 0` (§4's region holds: no dead state, every reachable state
  // can still finish — the block's `noUnrecoverableOk` leg is `true` 4/4), and the
  // par ladder is the P1 ramp 4/6/8/10, so `D` and `D_exec` climb *only* because the
  // effective branching factor does: `B` rises 1.4103 → 1.6566 while `L` moves in
  // steps of 2 and `M` is constant. That is the block's whole shape in one column,
  // and the reason §6 read the tail budget off the *execution* axis.
  //
  // The dip holds on the debut member: L12's `D_exec` 8.230769 is 0.342402 *below* the
  // shipped L11's 8.573171 (the ADR's `BLOCK_L1215_DIP_CEILING`), with par flat at the
  // P1 floor 4 — a choice-narrowing rest, not a shorter level. The tail member clears
  // the frozen 13.64 block-end floor by 1.329697 (> L10's measured 13.642857 too).
  // `lookaheadDepth ≡ L − 1` continues to hold on 4/4, so the alternative reading of
  // `T` is still not the missing lever.
  12: { L: 4, B: 1.410256, T: 0, R: 0, M: 4, D: 28.230769, dexec: 8.230769, bRaw: 2.7692, forced: 0.0769, lookahead: 3, states: 78 },
  13: { L: 6, B: 1.632911, T: 0, R: 0, M: 4, D: 30.898734, dexec: 10.898734, bRaw: 3.0633, forced: 0.0127, lookahead: 5, states: 79 },
  14: { L: 8, B: 1.652632, T: 0, R: 0, M: 4, D: 32.957895, dexec: 12.957895, bRaw: 3.1368, forced: 0.0105, lookahead: 7, states: 95 },
  15: { L: 10, B: 1.656566, T: 0, R: 0, M: 4, D: 34.969697, dexec: 14.969697, bRaw: 3.1515, forced: 0.0000, lookahead: 9, states: 99 },
  // R-003c — the L16–L19 block, registered at the dataset root (`208c5eb`, registry
  // rows at `a75b420`). The four rows below are **measured from the landed bytes** by
  // the shipped metric functions (the same read-out `scripts/solve-levels.ts` prints
  // and `docs/level-difficulty.report.json` stores), so the table stopped being "the
  // L1–L15 table": it is the dataset's table. The block's shape in one column: `M = 4`
  // on 4/4 (M1+M3+M2), `T ≡ R ≡ 0` (§4's region holds — the seal is *total*, so there
  // is no dead pocket to fall into), `L` steps exactly 12/14/16/18 (the P2 rung
  // `par(L15) + 2·(id − 15)`, enforced by the `block-l1619-rung` gate) and `D_exec`
  // climbs 17.10 → 22.89 because `B` is *above* the L1–L15 band on the first rung and
  // settles back into it (1.7000 → 1.6757 → 1.6360 → 1.6284). `l016`'s `B` is the one
  // **named** excursion (F-L16-2, `BLOCK_L1619_NAMED_B_EXCURSIONS`); the register is
  // re-pinned by `tests/solver/l16-l20-candidates.test.ts` against this table's band.
  16: { L: 12, B: 1.700000, T: 0, R: 0, M: 4, D: 37.1, dexec: 17.1, bRaw: 3.26, forced: 0.01, lookahead: 11, states: 260 },
  17: { L: 14, B: 1.675676, T: 0, R: 0, M: 4, D: 39.027027, dexec: 19.027027, bRaw: 3.27, forced: 0.01, lookahead: 13, states: 259 },
  18: { L: 16, B: 1.635974, T: 0, R: 0, M: 4, D: 40.907923, dexec: 20.907923, bRaw: 3.20, forced: 0.01, lookahead: 15, states: 467 },
  19: { L: 18, B: 1.628386, T: 0, R: 0, M: 4, D: 42.885157, dexec: 22.885157, bRaw: 3.15, forced: 0.02, lookahead: 17, states: 923 },
  // R-003d / QA-014 — the block's **terminal** rung, registered by GAME-002 at
  // `4deeb50`. L20 is the sealed landing (ADR-design-0004): the portal hands the
  // player a new start inside a walk-sealed pocket whose only exit is a door, so the
  // shortest plan is the ORDERED `land → press → leave → press` chain. Shape in one
  // column: `L = par = 20` (the P2 rung `par(L15) + 2·(20 − 15)`), `M = 4`,
  // `T ≡ R ≡ 0` (§4's region holds — 0 dead, `noUnrecoverableOk` true), `B` 1.576471
  // settles the excursion back into the L1–L15 band `[1.25, 1.6875]` (so no new
  // entry in `BLOCK_L1619_NAMED_B_EXCURSIONS`), and `D_exec = 24.729412` rises past
  // L19's 22.885157 — which is what re-registered the tail ceiling at R-003d.
  // Values measured HERE from the landed bytes by the shipped metric functions
  // (`scripts/solve-levels.ts`'s read-out, `docs/level-difficulty.report.json`
  // record 20) — derived, then typed, exactly like every row above.
  20: { L: 20, B: 1.576471, T: 0, R: 0, M: 4, D: 44.729412, dexec: 24.729412, bRaw: 3.04, forced: 0.05, lookahead: 19, states: 1275 },
  // R-004a — Act II batch 1 (`l021`–`l025`, registered at the root by the byte-parity
  // `git mv` of `50e9ac0` and published at `178d9d8`). The five rows below are the
  // **regenerated sidecar's** records 21–25 (`docs/level-difficulty.report.json`, the
  // law) re-read on the ROOT bytes by the shipped metric functions — the same
  // read-out `scripts/solve-levels.ts` prints (`difficultyExec`), never a note. Shape
  // in one column: `M = 4` ×5 (M1+M3+M2), `T ≡ R ≡ 0` ×5 (§4 holds — 0 dead,
  // `noUnrecoverableOk` true), full coverage `42/42` ×5, the par ladder is
  // **17 / 18 / 20 / 21 / 23** (`ACT_II_B1_LADDER`) and `D_exec` climbs
  // 21.581395 → 27.604651 strictly. `B` is in the measured band on 5/5
  // (1.5271 / 1.5280 / 1.5400 / 1.5349 / 1.5349), so Act II adds no named excursion,
  // and the batch's peak (27.604651) is the registered `act2-act-peak` value.
  // `lookaheadDepth ≡ L − 1` holds on 5/5 (16 / 17 / 19 / 20 / 22), so the alternative
  // reading of `T` is still not the missing lever.
  21: { L: 17, B: 1.5271, T: 0, R: 0, M: 4, D: 41.581395, dexec: 21.581395, bRaw: 2.88, forced: 0.05, lookahead: 16, states: 258 },
  22: { L: 18, B: 1.5280, T: 0, R: 0, M: 4, D: 42.584, dexec: 22.584, bRaw: 2.86, forced: 0.04, lookahead: 17, states: 250 },
  23: { L: 20, B: 1.5400, T: 0, R: 0, M: 4, D: 44.62, dexec: 24.62, bRaw: 2.86, forced: 0.04, lookahead: 19, states: 250 },
  24: { L: 21, B: 1.5349, T: 0, R: 0, M: 4, D: 45.604651, dexec: 25.604651, bRaw: 2.88, forced: 0.05, lookahead: 20, states: 258 },
  25: { L: 23, B: 1.5349, T: 0, R: 0, M: 4, D: 47.604651, dexec: 27.604651, bRaw: 2.88, forced: 0.05, lookahead: 22, states: 258 },
  // R-005a — Act II batches 2 + 3 (`l026`–`l035`), graduated from the shelf to the
  // dataset root by the byte-parity `git mv` of `agent/level/r-005a-reg35` (10/10
  // sha256 + git blobs unchanged on both sides; `attest-r005a-reg35` exit 0). The ten
  // rows below are the **regenerated sidecar's** records 26–35
  // (`docs/level-difficulty.report.json`, the law) re-read on the ROOT bytes by the
  // shipped metric functions — the same read-out `scripts/solve-levels.ts` prints
  // (`difficultyExec`), never a note. Shape in one column: `M = 4` ×10 (M1+M3+M2),
  // `T ≡ R ≡ 0` ×10 (§4 holds — 0 dead, `noUnrecoverableOk` true), full coverage
  // `42/42` ×10, and `D_exec` climbs 21.560241 → 28.339426 with the two labelled
  // seams between the batches — L26 lands 6.044410 *below* L25 (27.604651, §7.3.1
  // instance 2) and L31 lands 4.362098 below L30 (27.566265, instance 3), each relief
  // named at registration rather than smoothed away. The par ladders are batch 2's
  // `17 / 18 / 20 / 21 / 23` (`ACT_II_B2_B3_LADDER`) then batch 3's `19 / 22 / 22 / 24 / 24`
  // — the act's new registered tail is L35's `D_exec` 28.339426, the whole-act maximum
  // (`ACT_II_R005A_REGISTERED_TAIL_EXEC`), 0.734775 above L30's batch-2 peak and
  // 0.723074 under the derived-exact ceiling 29.0625 (§7.9). `B` leaves the L1–L15 band
  // on batch 3 (`CX = 1`'s frame: 1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465, under the
  // band floor on 5/5) — that is the second skeleton's shape, and GD-011's band law is
  // the registered reader of it, not this table. `lookaheadDepth ≡ L − 1` holds on 10/10
  // (16 / 17 / 19 / 20 / 22 / 18 / 21 / 21 / 23 / 23), so the alternative reading of `T`
  // is still not the missing lever.
  26: { L: 17, B: 1.5201, T: 0, R: 0, M: 4, D: 41.560241, dexec: 21.560241, bRaw: 2.84, forced: 0.04, lookahead: 16, states: 498 },
  27: { L: 18, B: 1.5201, T: 0, R: 0, M: 4, D: 42.560241, dexec: 22.560241, bRaw: 2.84, forced: 0.04, lookahead: 17, states: 498 },
  28: { L: 20, B: 1.5161, T: 0, R: 0, M: 4, D: 44.548193, dexec: 24.548193, bRaw: 2.84, forced: 0.04, lookahead: 19, states: 498 },
  29: { L: 21, B: 1.5161, T: 0, R: 0, M: 4, D: 45.548193, dexec: 25.548193, bRaw: 2.84, forced: 0.04, lookahead: 20, states: 498 },
  30: { L: 23, B: 1.5221, T: 0, R: 0, M: 4, D: 47.566265, dexec: 27.566265, bRaw: 2.84, forced: 0.04, lookahead: 22, states: 498 },
  31: { L: 19, B: 1.4014, T: 0, R: 0, M: 4, D: 43.204167, dexec: 23.204167, bRaw: 2.52, forced: 0.16, lookahead: 18, states: 720 },
  32: { L: 22, B: 1.35, T: 0, R: 0, M: 4, D: 46.05, dexec: 26.05, bRaw: 2.53, forced: 0.16, lookahead: 21, states: 740 },
  33: { L: 22, B: 1.3564, T: 0, R: 0, M: 4, D: 46.069191, dexec: 26.069191, bRaw: 2.56, forced: 0.14, lookahead: 21, states: 766 },
  34: { L: 24, B: 1.3756, T: 0, R: 0, M: 4, D: 48.126943, dexec: 28.126943, bRaw: 2.55, forced: 0.14, lookahead: 23, states: 772 },
  35: { L: 24, B: 1.4465, T: 0, R: 0, M: 4, D: 48.339426, dexec: 28.339426, bRaw: 2.56, forced: 0.14, lookahead: 23, states: 766 },
  // R-006a — Act II batch 4, the act's CLOSING rungs (`l036`–`l040`), graduated from
  // the LV-017 shelf to the dataset root by R-006a's byte-parity `git mv` (merged
  // `38e60b11b`; `src/levels/README.md` §2h/§7e). The
  // five rows below are the **regenerated sidecar's** records 36–40
  // (`docs/level-difficulty.report.json`, the law) re-read on the ROOT bytes by the
  // shipped metric functions — the same read-out `scripts/solve-levels.ts` prints
  // (`difficultyExec`), never a note. Shape in one column: `M = 4` ×5 (M1+M3+M2),
  // `T ≡ R ≡ 0` ×5 (§4 holds — 0 dead, `noUnrecoverableOk` true), full coverage
  // `49/49` ×5 (the whole 7 × 7 board, the act's second frame axis), the par ladder is
  // the **derived** `18 / 20 / 22 / 24 / 24` (derived off the act's `par 16–24` band and
  // P2, not re-picked to look smooth — §2h prints its honest fourth step `24 → 24`), and
  // `D_exec` climbs
  // 22.301282 → 28.455319 with the §7.3.1 **fourth** relief instance between the
  // batches: L36 lands 6.038144 *below* L35 (28.339426), a labelled `batch-seam` whose
  // label was published in rule commit `b9dac54` **before** the census and the bytes.
  // `B` is inside the law band `[1.25, 1.6875]` on 5/5 (1.4338 / 1.4174 / 1.4000 /
  // 1.3953 / 1.4851), so batch 4 adds no named excursion beside `l016`'s lone F-L16-2
  // waiver, and the act's registered maximum moves
  // off the R-005a tail (28.339426 at L35) onto L40's 28.455319 — a measured
  // **+0.115893**, with **0.607181** of derived-exact headroom to `ACT_II_EXEC_BAND[1]`
  // (29.0625; §7.9). `lookaheadDepth ≡ L − 1` holds on 5/5 (17 / 19 / 21 / 23 / 23), so
  // the alternative reading of `T` is still not the missing lever.
  36: { L: 18, B: 1.4338, T: 0, R: 0, M: 4, D: 42.301282, dexec: 22.301282, bRaw: 2.6752, forced: 0.1432, lookahead: 17, states: 936 },
  37: { L: 20, B: 1.4174, T: 0, R: 0, M: 4, D: 44.252174, dexec: 24.252174, bRaw: 2.6, forced: 0.1283, lookahead: 19, states: 920 },
  38: { L: 22, B: 1.4, T: 0, R: 0, M: 4, D: 46.2, dexec: 26.2, bRaw: 2.6217, forced: 0.1435, lookahead: 21, states: 920 },
  39: { L: 24, B: 1.3953, T: 0, R: 0, M: 4, D: 48.185897, dexec: 28.185897, bRaw: 2.6752, forced: 0.1432, lookahead: 23, states: 936 },
  40: { L: 24, B: 1.4851, T: 0, R: 0, M: 4, D: 48.455319, dexec: 28.455319, bRaw: 2.7319, forced: 0.1404, lookahead: 23, states: 940 },
  // R-007 — Act III batch 1, the **first act opener** in the set (`l041`–`l045`), graduated
  // from the LV-018 shelf to the root by R-007's byte-parity `git mv` (`src/levels/README.md`
  // §2i/§7f). The five rows below are the **regenerated sidecar's** records 41–45
  // (`docs/level-difficulty.report.json`, the law) re-read on the ROOT bytes by the shipped
  // metric functions — the same read-out `scripts/solve-levels.ts` prints (`difficultyExec`),
  // never a note. Shape in one column: `M = 4` ×5 (M1+M3+M2), `T ≡ R ≡ 0` ×5 (§4 holds —
  // 0 dead, `noUnrecoverableOk` true), full coverage `49/49` ×5 (the whole 7 × 7 board, the
  // same frame axis R-006a's closing batch opened), the par ladder is the **derived**
  // `20 / 22 / 24 / 26 / 26` (Act III's band is 20–28, so 28 is withheld for the tail and the
  // batch closes on a repeated 26 the way batch 4 closed on a repeated 24 — §2i prints its
  // honest fourth step `26 → 26`), and `D_exec` climbs 24.257329 → 30.455319 with the §7.3.1
  // **cross-act** seam between the batches: L41 lands 4.197990 *below* L40 (28.455319), the
  // act opener's labelled relief (R-007's `ACT_III_B1_OPEN_RELIEF`, delta −4.197990,
  // published before the bytes). `B` is inside the law band `[1.25, 1.6875]` on 5/5 (1.4191 / 1.4129 / 1.4046 /
  // 1.4084 / 1.4851), so the opener adds no named excursion, and the **act's** registered
  // maximum moves off the R-006a tail onto L45's 30.455319 — a measured **+2.000000**
  // (`ACT_III_TAIL_ADVANTAGE`), with **2.607181** of derived-exact headroom to
  // `ACT_III_EXEC_BAND[1]` (33.0625; §7.9). `lookaheadDepth ≡ L − 1` holds on 5/5
  // (19 / 21 / 23 / 25 / 25), so the alternative reading of `T` is still not the missing lever.
  41: { L: 20, B: 1.4191, T: 0, R: 0, M: 4, D: 44.257329, dexec: 24.257329, bRaw: 2.6015, forced: 0.1498, lookahead: 19, states: 921 },
  42: { L: 22, B: 1.4129, T: 0, R: 0, M: 4, D: 46.238773, dexec: 26.238773, bRaw: 2.6068, forced: 0.1490, lookahead: 21, states: 913 },
  43: { L: 24, B: 1.4046, T: 0, R: 0, M: 4, D: 48.213816, dexec: 28.213816, bRaw: 2.6228, forced: 0.1469, lookahead: 23, states: 912 },
  44: { L: 26, B: 1.4084, T: 0, R: 0, M: 4, D: 50.225216, dexec: 30.225216, bRaw: 2.6487, forced: 0.1444, lookahead: 25, states: 928 },
  45: { L: 26, B: 1.4851, T: 0, R: 0, M: 4, D: 50.455319, dexec: 30.455319, bRaw: 2.7319, forced: 0.1404, lookahead: 25, states: 940 },
};

describe("LV-007B · item 3 — the shipped dataset's difficulty table, measured", () => {
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
  it("the two forms agree on every shipped level: `D − w5·M` = `w1·L + w2·B + w3·T + w4·R`", () => {
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
    // …and the value published for every shipped level is the one the CLI prints
    // (`difficultyExec Dexec=…`), on the same axis the seam law is written on — with
    // LV-008's L11 (8.57) and LV-009-B's block (8.23 / 10.90 / 12.96 / 14.97) appended
    // in dataset order, so this list is the published 2-dp column of §5.2 whole.
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
      "8.23",
      "10.90",
      "12.96",
      "14.97",
      // R-003c — the L16–L19 block, in dataset order: the registered rungs'
      // measured execution axis (17.10 / 19.03 / 20.91 / 22.89), which is the same
      // column `docs/level-difficulty.md` §5.2 and the sidecar now print.
      "17.10",
      "19.03",
      "20.91",
      "22.89",
      // QA-014 — R-003d's terminal rung: the sealed landing's measured 24.729412,
      // i.e. the column's first value past L19. Par 20 is what the derived refusal
      // envelope (`refusalRouteEnvelopeMs`, tests/e2e/helpers/levels.ts) absorbs.
      "24.73",
      // R-004a — Act II batch 1, dataset order: the five registered rungs' measured
      // execution axis (21.581395 / 22.584000 / 24.620000 / 25.604651 / 27.604651),
      // the same column `docs/level-difficulty.md` §5.2 and the sidecar print. Par 22
      // is the first rung whose derived refusal envelope is CAP-BOUND (240 s) and par
      // 23 the first whose uncapped formula lands above it — the QA-013 law's named
      // re-derivation, documented on `refusalRouteEnvelopeMs` (helpers/levels.ts).
      "21.58",
      "22.58",
      "24.62",
      "25.60",
      "27.60",
      // R-005a — Act II batches 2 + 3, dataset order: the ten graduated rungs'
      // measured execution axis (21.560241 / 22.560241 / 24.548193 / 25.548193 /
      // 27.566265 / 23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426), the
      // same column `docs/level-difficulty.md` §5.2 and the sidecar print. The two
      // labelled seams sit at "21.56" (L26, 6.044410 below L25) and "23.20" (L31,
      // 4.362098 below L30); the act's registered tail is the last value. Par 24 —
      // L34/L35 — is the new rung whose derived refusal envelope is CAP-BOUND
      // (240 s), the par-24 named row on `refusalRouteEnvelopeMs` (helpers/levels.ts).
      "21.56",
      "22.56",
      "24.55",
      "25.55",
      "27.57",
      "23.20",
      "26.05",
      "26.07",
      "28.13",
      "28.34",
      // R-006a — Act II batch 4, the closing rungs, dataset order: the five registered
      // rungs' measured execution axis (22.301282 / 24.252174 / 26.200000 / 28.185897 /
      // 28.455319), the same column `docs/level-difficulty.md` §5.2 and the sidecar
      // print. The labelled seam sits at "22.30" (L36, 6.038144 below L35); the act's
      // registered tail is the last value (L40 28.455319, +0.115893 over the R-005a tail).
      // Par 24 — L39/L40 — repeats the par-24 CAP-BOUND row on `refusalRouteEnvelopeMs`
      // (helpers/levels.ts), so the new rungs are absorbed with zero re-migration.
      "22.30",
      "24.25",
      "26.20",
      "28.19",
      "28.46",
      // R-007 — Act III batch 1, the act **opener**, dataset order: the five registered
      // rungs' measured execution axis (24.257329 / 26.238773 / 28.213816 / 30.225216 /
      // 30.455319), the same column `docs/level-difficulty.md` §5.2 and the sidecar print.
      // "24.26" is L41, the first ever **cross-act** relief instance (4.197990 below L40);
      // the last value is Act III's registered tail (L45 30.455319, +2.000000 over the
      // R-006a tail). Par 26 — L44/L45 — is the new rung whose derived refusal envelope is
      // CAP-BOUND (240 s): the first par value the family has not seen before since R-005c's
      // 24, named on `refusalRouteEnvelopeMs` (helpers/levels.ts, §1.19).
      "24.26",
      "26.24",
      "28.21",
      "30.23",
      "30.46",
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
    // on every shipped level the deepest state where a move can waste the par is
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