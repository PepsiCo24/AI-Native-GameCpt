/**
 * `tests/solver/l16-l20-candidates.test.ts` — the durable pin on the L16–L19
 * registered root block (QA-011, retargeted from the pre-registration candidate
 * shelf).
 *
 * Why this file exists: `scripts/author-l16-candidates.ts` proposes and
 * `scripts/prove-candidate.ts` proves, but both are *runs* — their output lives in
 * a terminal, and a terminal is not a regression gate. This suite re-measures the
 * same obligations from the landed bytes on every `vitest run`, using only the
 * shipped readers (`@/core/level` + `@/core/solver/*`). Nothing here is compared
 * against a number typed by the author: `par` is stamped by `analyse`, the cut and
 * the rung come from the shipped rows *below the block*, and the band is re-derived
 * from that same pre-block set.
 *
 * Scope boundary (QA-011 / R-003c landed): the block is now **registered**. The four
 * members live in `src/levels/` root and the lessons that carry the `block-l1619`
 * obligation are their registry rows, so this suite walks the root set and derives
 * `BLOCK_IDS` from `documentedLesson(id)?.obligation` — never from a typed 16–19.
 * The candidate shelf (`src/levels/candidates/`) is asserted **empty**: its role was
 * to hold the block while the census stayed at the shipped 15, and that role is over
 * (the census now reads 19 through the single `EXPECTED_LEVEL_COUNT` pin).
 *
 * Why the pre-block filter matters: the block's own rows clear the cut by design
 * (`D_exec` 17.1 … 22.9) and `l016` carries the one NAMED `B` excursion (1.7000).
 * Deriving the cut/band over the *whole* dataset would let the block raise the filter
 * it is judged by — the one thing `docs/level-design.md` §6.1.1 forbids. The window is
 * therefore `id < min(BLOCK_IDS)`, read from the registry, not a typed `15`.
 *
 * Evidence policy (AGENTS.md §7): this suite is the proof, so it must not be able to
 * pass vacuously — every structural obligation carries a **negative control** in the
 * last block, and the controls are asserted to be *rejected* by the same readers that
 * accept the real members.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { analyse, explore } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import {
  allOffShortestSolution,
  auditLevel,
  BLOCK_L1619_IDS,
  BLOCK_L1619_NAMED_B_EXCURSIONS,
  documentedLesson,
} from "@/core/solver/policy";

const LEVELS_DIR = new URL("../../src/levels/", import.meta.url).pathname;
const CANDIDATES_DIR = join(LEVELS_DIR, "candidates");

const readLevel = (dir: string, file: string): Level =>
  LevelSchema.parse(JSON.parse(readFileSync(join(dir, file), "utf8"))) as Level;

const shipped = readdirSync(LEVELS_DIR)
  .filter((n) => /^l\d+\.json$/.test(n))
  .sort()
  .map((f) => readLevel(LEVELS_DIR, f));

/**
 * The block's members, **derived from the registry**: a root row is a member when
 * its documented lesson carries the `block-l1619` obligation. Adding, moving or
 * dropping a member moves this list and every obligation below with it.
 */
const BLOCK_IDS: readonly number[] = shipped
  .map((level) => level.id)
  .filter((id) => documentedLesson(id)?.obligation === "block-l1619")
  .sort((a, b) => a - b);

/** The published rung ladder (`policy.ts`) must name exactly the registered rows. */
const BLOCK_MIN = Math.min(...BLOCK_IDS);
const PRE_BLOCK = shipped.filter((level) => level.id < BLOCK_MIN);

/**
 * The two constants the block law is measured against, **both from the pre-block
 * set**: the escalation cut (the maximum `D_exec` over everything already shipped
 * before the block) and the block's first rung (`par` of the last pre-block row).
 * Neither is typed here — the `attest-lv010-cut` transcript of `a19a347` proved these
 * exact values on the isolated dataset, and this suite re-derives them on the live
 * files *below the block*.
 */
const preBlockMetrics = PRE_BLOCK.map((level) => ({
  level,
  diff: analyseDifficulty(level, explore(level)),
}));
const cut = Math.max(
  ...preBlockMetrics.map((m) => m.diff.Dexec ?? Number.NEGATIVE_INFINITY),
);
const l15Par = PRE_BLOCK.at(-1)?.par ?? 0;
/** The band §6.1.1 P2 publishes for `B` — re-measured on the pre-block set, not imported. */
const bBand: readonly [number, number] = [
  Math.min(...preBlockMetrics.map((m) => m.diff.B)),
  Math.max(...preBlockMetrics.map((m) => m.diff.B)),
];

describe("L16–L19 block — derived obligations, re-measured per run", () => {
  it("re-derives the cut, the first rung and the band from the pre-block set (the obligations are measured, not typed)", () => {
    expect(PRE_BLOCK).toHaveLength(15);
    expect(l15Par).toBe(10);
    expect(cut).toBeCloseTo(14.969697, 6);
    expect(bBand).toEqual([1.25, 1.6875]);
    // …and the boundary is the registry's, not a typed 16: the pre-block window stops
    // exactly one rung below the first registered member.
    expect(PRE_BLOCK.at(-1)?.id).toBe(BLOCK_MIN - 1);
  });

  it("is registered as the L16–L19 ladder the law publishes, and the shelf is empty", () => {
    // The four rows the `block-l1619` obligation names are exactly `BLOCK_L1619_IDS`.
    expect([...BLOCK_IDS]).toEqual([...BLOCK_L1619_IDS]);
    // Contiguous, one rung per id, id === file name — a mis-named rung would break
    // the `SHIPPED_IDS`-style readers the moment they read it.
    for (let i = 0; i < BLOCK_IDS.length; i += 1) {
      const id = BLOCK_IDS[i] as number;
      expect(id).toBe(BLOCK_MIN + i);
    }
    for (const id of BLOCK_IDS) {
      const file = `l${String(id).padStart(3, "0")}.json`;
      expect(
        existsSync(join(LEVELS_DIR, file)),
        `l${id} is a registered member and must live in the root set`,
      ).toBe(true);
    }
  });

  it("the candidate shelf is empty — the block no longer lives outside the census", () => {
    const shelf = existsSync(CANDIDATES_DIR)
      ? readdirSync(CANDIDATES_DIR).filter((n) => /^l\d+\.json$/.test(n))
      : [];
    expect(shelf).toEqual([]);
  });

  it("L20 is the documented ABSENT rung: the ladder's tail is the dataset's tail, and nothing claims to be above it", () => {
    const maxShipped = Math.max(...shipped.map((level) => level.id));
    // The block's last member is the last shipped row: the ladder stops where the
    // dataset stops (the device's census ceiling, `BLOCK_L1619_TAIL_EXEC_CEILING`).
    expect(BLOCK_IDS.at(-1)).toBe(maxShipped);
    expect(maxShipped).toBe(19);
    // No L20 file, no L20 lesson row, no `block-l1619` obligation above the tail.
    expect(existsSync(join(LEVELS_DIR, "l020.json"))).toBe(false);
    expect(documentedLesson(20)).toBeNull();
    expect(
      shipped.filter((level) => level.id >= 20).map((level) => level.id),
    ).toEqual([]);
  });

  for (const id of BLOCK_IDS) {
    const file = `l${String(id).padStart(3, "0")}.json`;
    const level = readLevel(LEVELS_DIR, file);
    const graph = explore(level);
    const result = analyse(level, graph);
    const diff = analyseDifficulty(level, graph);
    const audit = auditLevel(level, graph);
    const allOff = allOffShortestSolution(level, graph);

    describe(`${file} (rung ${String(level.id)})`, () => {
      it("is schema- and rule-legal, with `par` stamped by the solver rather than declared", () => {
        const verdict = validateLevel(JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8")));
        expect(verdict.ok).toBe(true);
        expect(verdict.errors).toEqual([]);
        expect(audit.violations).toEqual([]);
        expect(result.solvable).toBe(true);
        expect(level.par).toBe(result.shortestSolution);
      });

      it("delivers the §6.1.1 P2 step: par ≥ l15Par + 2·(id − 15)", () => {
        expect(result.shortestSolution).toBeGreaterThanOrEqual(l15Par + 2 * (level.id - 15));
      });

      it("clears the escalation cut on D_exec, and strictly increases along the block", () => {
        expect(diff.Dexec).not.toBeNull();
        expect(diff.Dexec as number).toBeGreaterThan(cut);
      });

      it("is in the §4 acceptance region: deadStates 0, no unrecoverable ok, T ≡ R ≡ 0", () => {
        expect(result.deadStates).toBe(0);
        expect(result.noUnrecoverableOk).toBe(true);
        expect(diff.T).toBe(0);
        expect(diff.R).toBe(0);
        // the identity that makes the in-region escalation check mean what it says
        expect(diff.Dexec).toBeCloseTo((result.shortestSolution ?? 0) + 3 * diff.B, 9);
      });

      it("covers every tile of its grid (the board is sized to the route, not padded)", () => {
        expect(result.distinctPositions).toBe(level.width * level.height);
      });

      it("grades the latch: the all-OFF world cannot finish, or is at least one move slower", () => {
        expect(level.switches.length).toBeGreaterThan(0);
        expect(level.doors.length).toBeGreaterThan(0);
        expect(
          allOff === null || allOff - (result.shortestSolution as number) >= 1,
        ).toBe(true);
      });

      it("carries the Aha beat on the ordered reader (§3 iii)", () => {
        expect(result.refusedBeforeEnteredTiles).toBeGreaterThanOrEqual(1);
      });

      it("respects the block's §1 latch shape: exactly one switch per door", () => {
        for (const door of level.doors) {
          expect(level.switches.filter((s) => s.targets.includes(door.id))).toHaveLength(1);
        }
      });
    });
  }

  /**
   * ── Block-level obligations ───────────────────────────────────────────────
   *
   * The per-member block above pins each board on its own. These pin the
   * **ladder**, which is the thing the design actually ships: the rungs must be a
   * strictly rising sequence, each must sit exactly on its derived rung value, and
   * the one `B` excursion that was accepted must stay the only one.
   *
   * All read the landed bytes through the same readers; the `B` register is imported
   * from `policy.ts` (its single home since R-003c), so the assertion pins the
   * *measurement against the register* in both directions rather than restating it.
   */
  const ladder = BLOCK_IDS.map((id) => {
    const file = `l${String(id).padStart(3, "0")}.json`;
    const level = readLevel(LEVELS_DIR, file);
    const graph = explore(level);
    return { file, level, graph, diff: analyseDifficulty(level, graph), result: analyse(level, graph) };
  }).sort((a, b) => a.level.id - b.level.id);

  it("rises strictly along the block: every rung's D_exec exceeds its predecessor's", () => {
    expect(ladder.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < ladder.length; i += 1) {
      const prev = ladder[i - 1] as (typeof ladder)[number];
      const cur = ladder[i] as (typeof ladder)[number];
      expect(prev.diff.Dexec).not.toBeNull();
      expect(cur.diff.Dexec as number).toBeGreaterThan(prev.diff.Dexec as number);
    }
  });

  it("sits exactly on each rung's derived par (l15Par + 2·(id − 15)), not merely above it", () => {
    for (const rung of ladder) {
      expect(rung.level.par).toBe(l15Par + 2 * (rung.level.id - 15));
      expect(rung.result.shortestSolution).toBe(rung.level.par);
    }
  });

  it("keeps every B in band except the rungs named in the excursion register — and names no rung that is in band", () => {
    for (const rung of ladder) {
      const inBand = rung.diff.B >= bBand[0] && rung.diff.B <= bBand[1];
      const named = rung.level.id in BLOCK_L1619_NAMED_B_EXCURSIONS;
      if (!inBand) {
        expect(
          named,
          `${rung.file} measures B=${rung.diff.B.toFixed(4)} outside [${bBand[0]}, ${bBand[1]}] and is not named in the excursion register`,
        ).toBe(true);
      }
      // The register is a record of a measurement, not a sink: an entry whose rung
      // came back in band is stale, and a stale entry is how a second excursion gets
      // smuggled in behind a name that no longer describes it.
      if (named) {
        expect(
          inBand,
          `${rung.file} is named in the excursion register but measures B=${rung.diff.B.toFixed(4)} inside [${bBand[0]}, ${bBand[1]}] — the entry is stale`,
        ).toBe(false);
      }
    }
    // …and the register is not empty, so the rule above is not vacuous.
    expect(Object.keys(BLOCK_L1619_NAMED_B_EXCURSIONS).length).toBeGreaterThan(0);
  });

  /**
   * Negative controls for the *suite itself*: each mutation must be refused by the
   * same readers that accepted the members above. A control that stops being refused
   * means the assertions above have gone slack, so this block is the suite's own
   * liveness check — and it is why the suite is not a restatement of
   * `scripts/prove-candidate.ts`'s numbers.
   */
  describe("negative controls — the obligations above are live", () => {
    const base = readLevel(
      LEVELS_DIR,
      `l${String(BLOCK_MIN).padStart(3, "0")}.json`,
    );

    it("refuses a mis-stamped par (the file's claim is compared, never trusted)", () => {
      const forged: Level = { ...base, par: Math.max(1, base.par - 1) };
      expect(analyse(forged, explore(forged)).shortestSolution).not.toBe(forged.par);
    });

    it("refuses a board with its latch removed (a bare door is a violation, not a puzzle)", () => {
      const naked: Level = { ...base, switches: [] };
      const nakedGraph = explore(naked);
      const r = analyse(naked, nakedGraph);
      // A door with no switch is still *solvable* — the door's own colour keeps it
      // passable in one of the two phases, so the player can walk around the latch
      // by arriving in the other phase. That is exactly why the latch obligation may
      // not be replaced by a solvability check: the audit has to catch this board,
      // and it does, by name.
      expect(r.solvable).toBe(true);
      expect(auditLevel(naked, nakedGraph).violations.map((v) => v.code)).toContain(
        "door-without-switch",
      );
      // and the sanctioned measurement stays defined on the bare board, so the
      // existence/grade readers keep working rather than silently treating "no latch"
      // as "UNSATISFIABLE": a null here would have been the weaker reading.
      expect(allOffShortestSolution(naked, nakedGraph)).not.toBeNull();
    });

    it("refuses a sealed goal (the region check is not vacuous)", () => {
      const sealed: Level = {
        ...base,
        phaseAWalls: [...base.phaseAWalls, base.goal],
        phaseBWalls: [...base.phaseBWalls, base.goal],
      };
      expect(validateLevel(sealed).ok).toBe(false);
    });

    it("refuses a phase wall on a door tile (§1: one cell is one object)", () => {
      const overlap: Level = {
        ...base,
        phaseAWalls: [...base.phaseAWalls, base.doors[0]?.tiles[0] as never],
      };
      expect(validateLevel(overlap).ok).toBe(false);
    });
  });
});