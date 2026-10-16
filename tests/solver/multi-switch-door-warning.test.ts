/**
 * LV-007C OQ4 / **ADR-architecture-0003 Ruling 5** — the `multi-switch-door`
 * validator warning: *legal, flagged, never a gate.*
 *
 * The law (`docs/level-design.md` §1, twice): "each door is targeted by at most
 * one switch in L6–L35 … flagged in review" and "door targeted by more than one
 * switch ⇒ review flag (warning; hard rejection above the L36+ allowance is
 * Solver-side policy)". R5 homes the flag at the **validator-warning** layer —
 * the property is decidable from the level JSON alone, so no search may gate it —
 * and rules that no policy code exists until GD quantifies the L36+ allowance.
 *
 * What this file pins, from both sides:
 *
 * 1. **Not silent** — a door fed by ≥ 2 switches emits exactly one warning whose
 *    head carries the code `multi-switch-door`, naming the door, the count, every
 *    targeting switch id, and the doc anchor.
 * 2. **Not forbidden** — that same board is `ok === true` with **zero errors**, is
 *    still accepted by the frozen schema, and the mandated BFS still proves it
 *    solvable (`shortestSolution` exists, no dead states). A warning that silently
 *    became a rejection would fail here.
 * 3. **Discriminating** — the counting rule is per **distinct switch id**, per
 *    **door**: 1→1 is silent, 2 switches on 2 distinct doors is silent, a repeated
 *    target inside one switch is silent, a dangling target does not manufacture a
 *    door, and a shared switch on two doors produces one warning **per door** with
 *    the right id lists. The last test *mutates* a firing board (flip one switch
 *    target) and requires the warning to disappear — a control against a check
 *    that fires unconditionally.
 * 4. **No silent code** — `LEVEL_WARNING_CODES` is the inventory, each code has a
 *    typed control here (`Record<LevelWarningCode, …>` ⇒ a new code without a
 *    control is a **compile error**, the `policy-negative-controls.test.ts`
 *    discipline), and no shipped board's warning head may name a code outside it.
 * 5. **Head state** — 0/15 shipped boards carry the flag (`errors = 0` unchanged):
 *    the L6–L15 dataset is one-switch-per-door throughout, measured, not assumed.
 *
 * These are hypothetical boards handed straight to `validateLevel` / `solve`; the
 * only shipped input is `src/levels/*.json` read-only (ADR-0004: reject, never
 * repair — nothing here ever writes a level).
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Level, LevelWarningCode, ValidationResult } from "@/core/level";
import { LEVEL_WARNING_CODES, LevelSchema, validateLevel, warningCodeOf } from "@/core/level";
import { solve } from "@/core/solver/bfs";

import { door, makeLevel, switchDef } from "../helpers/fixtures";

const LEVELS_DIR = fileURLToPath(new URL("../../src/levels/", import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// Raw-board builders (the validator's input is `unknown`, so these are plain
// JSON-shaped objects — exactly what an LLM candidate or a level file carries)
// ─────────────────────────────────────────────────────────────────────────────

/** 5 × 3, no walls, player (0,1) → goal (4,1): 4 straight moves. */
function rawBoard(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 950,
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
    ...overrides,
  };
}

/** `d1` blue on (2,1): closed in A, open in B — the latch geometry of L6–L10. */
const D1 = { id: "d1", color: "blue", tiles: [[2, 1]] };
/** `d2` red on (1,0) — a second door, only ever used to move a *target* around. */
const D2 = { id: "d2", color: "red", tiles: [[1, 0]] };

/** Two switches, both entering in phase A (odd Manhattan distance from (0,1)), both aiming at `d1`. */
const TWO_SWITCHES_ON_D1 = [
  { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
  { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d1"] },
];

/** The flagged board: one door, two switches — legal, solvable, review-flagged. */
function multiSwitchBoard(): Record<string, unknown> {
  return rawBoard({ doors: [D1], switches: TWO_SWITCHES_ON_D1 });
}

/** Every coded warning of a validator result, in emission order. */
function codes(result: ValidationResult): LevelWarningCode[] {
  return result.warnings
    .map((warning) => warningCodeOf(warning))
    .filter((code): code is LevelWarningCode => code !== null);
}

/** The warning head `[code] `, as emitted. */
function headOf(warning: string): string {
  return warning.slice(0, warning.indexOf("]") + 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// LV-007C OQ4 · R5 — the flag, from both sides
// ─────────────────────────────────────────────────────────────────────────────

describe("multi-switch-door — the R5 validator warning (legal, flagged, not a gate)", () => {
  it("fires exactly once, BY NAME, on a door fed by two switches", () => {
    const result = validateLevel(multiSwitchBoard());

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(codes(result)).toEqual(["multi-switch-door"]);

    const [warning] = result.warnings;
    expect(warning).toBeDefined();
    expect(headOf(warning ?? "")).toBe("[multi-switch-door]");
    // the door, located the way every other message locates things
    expect(warning).toContain(`doors[0] "d1"`);
    // the count, as a number
    expect(warning).toContain("is targeted by 2 switches");
    // every targeting switch id, located
    expect(warning).toContain(`switches[0] "s1"`);
    expect(warning).toContain(`switches[1] "s2"`);
    // the authoring rule it belongs to (the doc anchor)
    expect(warning).toContain("docs/level-design.md §1");
    expect(warning).toContain("L6–L35");
    // the verdict semantics, in the message itself
    expect(warning).toContain("never rejects a candidate");
  });

  it("does NOT reject the board: still schema-valid, still proven solvable (the flag is not a gate)", () => {
    const raw = multiSwitchBoard();
    const result = validateLevel(raw);

    expect(result.ok).toBe(true);
    expect(codes(result)).toEqual(["multi-switch-door"]);

    // Accepted by the frozen schema — the warning is not an acceptance edge.
    const level: Level = LevelSchema.parse(raw);
    expect(level.par).toBe(4);

    // The mandated BFS still proves it: a par route exists, nothing is dead.
    const analysis = solve(level);
    expect(analysis.solvable).toBe(true);
    expect(analysis.shortestSolution).toBe(4);
    expect(analysis.deadStates).toBe(0);
    expect(analysis.noUnrecoverableOk).toBe(true);
  });

  it("is silent on a one-switch-one-door latch (the shipped L6–L11 shape)", () => {
    const result = validateLevel(
      rawBoard({ doors: [D1], switches: [TWO_SWITCHES_ON_D1[0]] }),
    );

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("is silent when two switches target two distinct doors", () => {
    const result = validateLevel(
      rawBoard({
        doors: [D1, D2],
        switches: [
          { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
          { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d2"] },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("counts per distinct switch: one switch naming the same door twice is silent", () => {
    const result = validateLevel(
      rawBoard({
        doors: [D1],
        switches: [{ id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1", "d1"] }],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("does not manufacture a door out of a dangling target (that stays a hard error)", () => {
    const result = validateLevel(
      rawBoard({
        doors: [D1],
        switches: [
          { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
          { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d9"] },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("dangling reference");
    expect(codes(result)).toEqual([]);
  });

  it("warns PER DOOR when a shared switch feeds two doors (right ids each time)", () => {
    const result = validateLevel(
      rawBoard({
        doors: [D1, D2],
        switches: [
          { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
          { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d1", "d2"] },
          { id: "s3", tile: [2, 0], activePhase: "A", targets: ["d2"] },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(codes(result)).toEqual(["multi-switch-door", "multi-switch-door"]);
    expect(result.warnings).toHaveLength(2);

    const [first, second] = result.warnings;
    expect(first).toContain(`doors[0] "d1"`);
    expect(first).toContain("is targeted by 2 switches");
    expect(first).toContain(`switches[0] "s1"`);
    expect(first).toContain(`switches[1] "s2"`);

    expect(second).toContain(`doors[1] "d2"`);
    expect(second).toContain("is targeted by 2 switches");
    expect(second).toContain(`switches[1] "s2"`);
    expect(second).toContain(`switches[2] "s3"`);
  });

  it("mutation control: flipping ONE switch target removes the warning (the check is discriminating)", () => {
    const before = validateLevel(multiSwitchBoard());
    expect(codes(before)).toEqual(["multi-switch-door"]);

    // The mutation: s2 stops aiming at d1 and aims at a real second door instead.
    const mutated = rawBoard({
      doors: [D1, D2],
      switches: [
        { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
        { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d2"] },
      ],
    });
    const after = validateLevel(mutated);

    expect(after.ok).toBe(true);
    expect(codes(after)).toEqual([]);
    // …and the *board* identity is the only thing that changed: no repair happened.
    expect(JSON.stringify(mutated)).toContain(`"targets":["d2"]`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// The code inventory — no silent code, one control per code
// ─────────────────────────────────────────────────────────────────────────────

describe("validator warning codes — inventory, shape, coverage", () => {
  /**
   * Typed as `Record<LevelWarningCode, …>`: adding a code to
   * `LEVEL_WARNING_CODES` without a board that actually emits it is a **compile
   * error**, never a silently untested code (the `policy-negative-controls`
   * discipline, applied to the warning channel).
   */
  const CONTROLS: Record<LevelWarningCode, () => Record<string, unknown>> = {
    "multi-switch-door": multiSwitchBoard,
  };

  it("declares exactly one code today — the R5 flag", () => {
    expect(LEVEL_WARNING_CODES).toEqual(["multi-switch-door"]);
  });

  it("reads the code out of the message head, and only for known codes", () => {
    expect(warningCodeOf("[multi-switch-door] doors[0] …")).toBe("multi-switch-door");
    // historic prose warnings carry no code — the reader must not invent one
    expect(warningCodeOf(`doors[0] "d1".tiles[0] (3, 1) covers the goal`)).toBeNull();
    expect(warningCodeOf("[unknown-code] …")).toBeNull();
    expect(warningCodeOf("")).toBeNull();
  });

  it("emits every declared code from a board that is ACCEPTED (warn ≠ reject)", () => {
    for (const code of LEVEL_WARNING_CODES) {
      const board = CONTROLS[code]();
      const result = validateLevel(board);
      expect(result.ok, `${code}: the control board must not be rejected`).toBe(true);
      expect(result.errors, `${code}: control board errors`).toEqual([]);
      expect(codes(result), `${code}: control board must emit its code`).toContain(code);
    }
  });

  it("no shipped board's warning head names a code outside the inventory", () => {
    const shipped = readdirSync(LEVELS_DIR)
      .filter((name) => /^l\d+\.json$/.test(name))
      .sort();

    for (const name of shipped) {
      const raw: unknown = JSON.parse(readFileSync(`${LEVELS_DIR}${name}`, "utf8"));
      const result = validateLevel(raw);
      for (const warning of result.warnings) {
        const code = warningCodeOf(warning);
        if (warning.startsWith("[")) {
          expect(code, `${name}: unregistered warning code in "${headOf(warning)}"`).not.toBeNull();
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Head state — the shipped L1–L15 dataset is one-switch-per-door throughout
// ─────────────────────────────────────────────────────────────────────────────

describe("head state — no shipped board carries multi-switch-door", () => {
  const shipped = readdirSync(LEVELS_DIR)
    .filter((name) => /^l\d+\.json$/.test(name))
    .sort();

  it("reads the shipped dataset (15 boards)", () => {
    expect(shipped).toHaveLength(15);
  });

  it("0/15 shipped boards warn, and errors stay 0 on all 15", () => {
    const flagged: string[] = [];
    for (const name of shipped) {
      const raw: unknown = JSON.parse(readFileSync(`${LEVELS_DIR}${name}`, "utf8"));
      const result = validateLevel(raw);
      expect(result.errors, `${name}: errors`).toEqual([]);
      expect(result.ok, `${name}: ok`).toBe(true);
      if (codes(result).includes("multi-switch-door")) flagged.push(name);
    }
    expect(flagged).toEqual([]);
  });

  it("the shipped doors are each fed by at most one switch, measured on the raw JSON", () => {
    for (const name of shipped) {
      const raw = JSON.parse(readFileSync(`${LEVELS_DIR}${name}`, "utf8")) as {
        doors: { id: string }[];
        switches: { id: string; targets: string[] }[];
      };
      for (const doorDef of raw.doors) {
        const feeders = raw.switches.filter((sw) => sw.targets.includes(doorDef.id));
        expect(feeders.length, `${name}: door "${doorDef.id}" feeders`).toBeLessThan(2);
      }
    }
  });

  it("keeps the fixture helpers honest: the flagged board is expressible with them too", () => {
    // Same geometry through the shared helpers (`tests/helpers/fixtures`) — proof
    // the flag is reachable from a plain `Level` object, not from raw JSON only.
    const level = makeLevel({
      id: 951,
      width: 5,
      height: 3,
      player: [0, 1],
      goal: [4, 1],
      par: 4,
      doors: [door("d1", "blue", [[2, 1]])],
      switches: [switchDef("s1", [0, 0], "A", ["d1"]), switchDef("s2", [4, 0], "A", ["d1"])],
    });
    const result = validateLevel(level);

    expect(result.ok).toBe(true);
    expect(codes(result)).toEqual(["multi-switch-door"]);
    expect(solve(level).shortestSolution).toBe(4);
  });
});