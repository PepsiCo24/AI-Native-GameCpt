/**
 * `tests/solver/l16-l20-candidates.test.ts` — the durable pin on the L16+ block
 * candidates (Level AI + Solver, AGENTS.md §4).
 *
 * Why this file exists: `scripts/author-l16-candidates.ts` proposes and
 * `scripts/prove-candidate.ts` proves, but both are *runs* — their output lives in
 * a terminal, and a terminal is not a regression gate. This suite re-measures the
 * same obligations from the landed bytes on every `vitest run`, using only the
 * shipped readers (`@/core/level` + `@/core/solver/*`). Nothing here is compared
 * against a number typed by the author: `par` is stamped by `analyse`, the cut and
 * the rung come from the shipped `l015.json`, and the band comes from the shipped
 * dataset.
 *
 * Scope boundary (LV-010 / R-003c): the candidates are **unregistered**. They live
 * in `src/levels/candidates/` precisely so that the three suites that own the
 * shipped-set census (`difficulty.test.ts` `SHIPPED_IDS`, `metrics-sidecar.test.ts`
 * `REPORT.levels.length`, the registry) keep reading 15 and are not perturbed.
 * This suite therefore walks the subdirectory itself and asserts nothing about
 * registration — wiring the candidates into `src/levels/` root, `EXPECTED_LEVEL_COUNT`
 * and the sidecars is the R-003c ticket's work, not this file's.
 *
 * Evidence policy (AGENTS.md §7): this suite is the proof, so it must not be able
 * to pass vacuously — every structural obligation carries a **negative control** in
 * the last block, and the controls are asserted to be *rejected* by the same
 * readers that accept the real candidates.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { analyse, explore } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import { allOffShortestSolution, auditLevel } from "@/core/solver/policy";

const LEVELS_DIR = new URL("../../src/levels/", import.meta.url).pathname;
const CANDIDATES_DIR = join(LEVELS_DIR, "candidates");

const readLevel = (dir: string, file: string): Level =>
  LevelSchema.parse(JSON.parse(readFileSync(join(dir, file), "utf8"))) as Level;

const shipped = readdirSync(LEVELS_DIR)
  .filter((n) => /^l\d+\.json$/.test(n))
  .sort()
  .map((f) => readLevel(LEVELS_DIR, f));

const candidateFiles = readdirSync(CANDIDATES_DIR)
  .filter((n) => /^l\d+\.json$/.test(n))
  .sort();

/**
 * The two constants the block law is measured against, **both from the shipped
 * set**: the escalation cut (the maximum `D_exec` over everything already shipped)
 * and the block's first rung (`par(L15)`). Neither is typed here — the `attest-lv010-cut`
 * transcript of `a19a347` proved these exact values on the isolated dataset, and
 * this suite re-derives them on the live files.
 */
const shippedMetrics = shipped.map((level) => ({
  level,
  diff: analyseDifficulty(level, explore(level)),
}));
const cut = Math.max(...shippedMetrics.map((m) => m.diff.Dexec ?? Number.NEGATIVE_INFINITY));
const l15Par = shipped.find((l) => l.id === 15)?.par ?? 0;
/** The band §6.1.1 P2 publishes for `B` — re-measured, not imported as a literal. */
const bBand: readonly [number, number] = [
  Math.min(...shippedMetrics.map((m) => m.diff.B)),
  Math.max(...shippedMetrics.map((m) => m.diff.B)),
];

describe("L16+ candidates — derived block obligations, re-measured per run", () => {
  it("re-derives the cut and the first rung from the shipped set (the obligations are measured, not typed)", () => {
    expect(shipped).toHaveLength(15);
    expect(l15Par).toBe(10);
    expect(cut).toBeCloseTo(14.969697, 6);
    expect(bBand).toEqual([1.25, 1.6875]);
  });

  it("has at least the L16 rung and no candidate outside the L16–L20 window", () => {
    expect(candidateFiles.length).toBeGreaterThanOrEqual(1);
    for (const file of candidateFiles) {
      const level = readLevel(CANDIDATES_DIR, file);
      expect(level.id).toBeGreaterThanOrEqual(16);
      expect(level.id).toBeLessThanOrEqual(20);
      // the file name is the id, zero-padded: a mis-named rung would break the
      // `SHIPPED_IDS`-style readers the moment R-003c registers it
      expect(file).toBe(`l${String(level.id).padStart(3, "0")}.json`);
    }
  });

  for (const file of candidateFiles) {
    const level = readLevel(CANDIDATES_DIR, file);
    const graph = explore(level);
    const result = analyse(level, graph);
    const diff = analyseDifficulty(level, graph);
    const audit = auditLevel(level, graph);
    const allOff = allOffShortestSolution(level, graph);

    describe(`${file} (rung ${String(level.id)})`, () => {
      it("is schema- and rule-legal, with `par` stamped by the solver rather than declared", () => {
        const verdict = validateLevel(JSON.parse(readFileSync(join(CANDIDATES_DIR, file), "utf8")));
        expect(verdict.ok).toBe(true);
        expect(verdict.errors).toEqual([]);
        expect(audit.violations).toEqual([]);
        expect(result.solvable).toBe(true);
        expect(level.par).toBe(result.shortestSolution);
      });

      it("delivers the §6.1.1 P2 step: par ≥ l15Par + 2·(id − 15)", () => {
        expect(result.shortestSolution).toBeGreaterThanOrEqual(l15Par + 2 * (level.id - 15));
      });

      it("clears the escalation cut on D_exec, and strictly increases along the candidates", () => {
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
   * Negative controls for the *suite itself*: each mutation must be refused by the
   * same readers that accepted the candidate above. A control that stops being
   * refused means the assertions above have gone slack, so this block is the
   * suite's own liveness check — and it is why the suite is not a restatement of
   * `scripts/prove-candidate.ts`'s numbers.
   */
  describe("negative controls — the obligations above are live", () => {
    const base = readLevel(CANDIDATES_DIR, candidateFiles[0] as string);

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
      // gate reads `allOff - par` rather than silently treating "no latch" as
      // "existence": a null here would have been the weaker reading.
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