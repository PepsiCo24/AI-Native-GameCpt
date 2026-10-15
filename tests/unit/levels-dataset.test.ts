/**
 * Level dataset gate — every `src/levels/*.json` must pass:
 *   schema (validateLevel) → solvable → no dead states (§4) → `par` == shortest.
 *
 * Sources: `docs/architecture.md` §7/§8, `docs/level-design.md` §1/§4,
 * ADR-0004 (reject, never repair), ADR-0008 (all results re-proven under
 * Option B; pre-ADR-0008 solver results are void).
 *
 * The `par` gate is NOT relaxed to make CI green: if the solver's shortest
 * solution and the file disagree, this suite fails and names the level.
 *
 * ── KNOWN-FAILING / TRACKED ──────────────────────────────────────────────────
 * L4 (`l004.json`) and L5 (`l005.json`) deliver a teaching beat that GATE D
 * ruled UNREACHABLE in M0-only content: "the wall that refused me becomes my
 * route" cannot happen, because arrival phase is a function of the tile's
 * parity (parity theorem F2, `src/levels/README.md` §3; `docs/level-design.md`
 * §0). Game Designer is re-sequencing and Level AI is adding a static-wall
 * gate; these two levels may be rewritten or rejected.
 *
 * The MECHANICAL gates below (schema/solvable/no-dead/par) currently pass for
 * both (verified), so they remain ACTIVE and are not skipped — no assertion is
 * weakened. Only the (non-mechanical) teaching-intent obligation is recorded in
 * an EXPLICIT `describe.skip` block at the bottom, so the debt is visible in the
 * test report instead of silently absent. It is not `test.skip` used to hide a
 * failing mechanical assertion.
 */

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import {
  deadStates,
  dualPhaseTiles,
  phaseFormulaViolations,
  reachableStates,
  shortestSolution,
} from "../helpers/search";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

interface Loaded {
  file: string;
  raw: unknown;
}

function loadLevels(): Loaded[] {
  return readdirSync(LEVELS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      raw: JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8")) as unknown,
    }));
}

function loadLevel(id: number): Level {
  const raw = JSON.parse(readFileSync(join(LEVELS_DIR, `l${String(id).padStart(3, "0")}.json`), "utf8")) as unknown;
  const result = validateLevel(raw);
  expect(result.ok, `l00${id} must be schema-valid before it can be analysed`).toBe(true);
  return raw as Level;
}

describe("src/levels dataset — schema + solver gates", () => {
  const levels = loadLevels();

  it("contains the authored level files (non-empty)", () => {
    expect(levels.length).toBeGreaterThanOrEqual(5);
  });

  it("has unique level ids equal to the file number", () => {
    const seen = new Map<number, string>();
    for (const { file, raw } of levels) {
      const id = (raw as { id?: unknown }).id;
      expect(typeof id, `${file} id must be a number`).toBe("number");
      const match = /^l(\d+)\.json$/.exec(file);
      expect(match, `${file} must be named lNNN.json`).not.toBeNull();
      const expectedId = Number((match as RegExpExecArray)[1]);
      expect(id, `${file} id must equal its file number`).toBe(expectedId);
      expect(seen.has(id as number), `duplicate id ${String(id)} (${file})`).toBe(false);
      seen.set(id as number, file);
    }
  });

  for (const { file, raw } of levels) {
    it(`${file} — schema valid, solvable, no dead states, par == shortest`, () => {
      // 1. schema + rule validator (reject, never repair).
      const result = validateLevel(raw);
      expect(result.ok, `${file} errors:\n${result.errors.join("\n")}`).toBe(true);

      const level = raw as Level;

      // 2. solvable under the locked Option B rule.
      const shortest = shortestSolution(level);
      expect(shortest, `${file} is unsolvable`).not.toBeNull();

      // 3. no dead state: every reachable non-goal state has ≥1 legal move
      //    (docs/level-design.md §4 — "no unrecoverable state").
      const dead = deadStates(level);
      expect(dead.length, `${file} has ${dead.length} dead state(s)`).toBe(0);

      // 4. `par` is the solver's shortest solution, not a manual guess.
      expect(shortest, `${file} par=${level.par} but solver shortest=${String(shortest)}`).toBe(
        level.par,
      );
    });

    it(`${file} — pure-M0 board obeys the GATE D parity invariant`, () => {
      const level = raw as Level;
      const isM0Only =
        level.portals.length === 0 && level.switches.length === 0 && level.doors.length === 0;
      if (!isM0Only) return;
      expect(reachableStates(level).size).toBeGreaterThan(0);
      expect(dualPhaseTiles(level), `${file} has a dual-phase tile`).toEqual([]);
      expect(phaseFormulaViolations(level), `${file} breaks the parity formula`).toEqual([]);
    });
  }
});

/**
 * TRACKED — GATE D teaching-intent debt (L4/L5). Not a mechanical gate.
 *
 * These assertions describe the beat `docs/level-design.md` §2–§3 requires and
 * that parity theorem F2 proves impossible in M0. They FAIL today; they are
 * skipped so the report shows the debt explicitly, not to hide a rules bug.
 * Remove the skips only when the levels are re-authored (Game Designer / Level
 * AI) so that the intent becomes mechanically true.
 *
 * Tracking: `src/levels/README.md` §3–§4; `docs/level-design.md` §0 / §2–§3;
 * `docs/level-design.md` §1 par inconsistency (par 6 vs actual 4).
 */
describe.skip("TRACKED GATE D design debt — L4/L5 teaching intent (known-failing)", () => {
  it.skip("L4: the wall that refused the player becomes the route after a side step", () => {
    const level = loadLevel(4);
    // Intended: after a parity-changing side step, the refusing tile (3,1)
    // becomes enterable. Actual (F2): (3,1) is an A-wall at distance 3, so it
    // needs an even arrival and is NEVER enterable.
    const enteredRefusingTile = [...reachableStates(level).values()].some(
      (s) => s.player.x === 3 && s.player.y === 1,
    );
    expect(enteredRefusingTile).toBe(true);
  });

  it.skip("L5: the greedy line's refusing wall (3,1) is crossed on the new parity", () => {
    const level = loadLevel(5);
    const enteredRefusingTile = [...reachableStates(level).values()].some(
      (s) => s.player.x === 3 && s.player.y === 1,
    );
    expect(enteredRefusingTile).toBe(true);
  });

  it.skip("docs/level-design.md §1 example: `par` matches the solver (doc says 6, actual 4)", () => {
    const example: Level = {
      id: 5,
      width: 5,
      height: 3,
      startPhase: "A",
      player: [0, 1],
      goal: [4, 1],
      phaseAWalls: [[2, 0]],
      phaseBWalls: [[3, 1]],
      doors: [],
      switches: [],
      portals: [],
      par: 6,
    };
    expect(shortestSolution(example)).toBe(example.par);
  });
});