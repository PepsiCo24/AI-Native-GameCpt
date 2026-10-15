/**
 * scripts/validate-levels.ts — the level-set gate (Level AI + Solver).
 *
 * What it does (and deliberately does NOT do):
 *   1. loads every `src/levels/*.json`;
 *   2. runs the schema + rule validator (`validateLevel`, `@/core/level`);
 *   3. prints `ok` / `errors` / `warnings` per level, then a summary;
 *   4. runs a built-in suite of **negative** cases to prove the validator really
 *      rejects broken levels — and really does not repair them;
 *   5. exits non-zero if any level fails, if any negative case is wrongly
 *      accepted, or if the level set has duplicate `id`s.
 *
 * It does NOT prove solvability and does NOT verify `par` — that is SOLVER-001's
 * BFS job (`docs/architecture.md` §8). Per ADR-0004 a candidate that fails here
 * is REJECTED, never auto-repaired into the official set.
 *
 * Run (this workspace has **no** `tsx` dependency, and this role must not install
 * one — Node's native type stripping is used instead; Node ≥ 22.6):
 *
 *   node scripts/validate-levels.ts
 *   node --experimental-strip-types scripts/validate-levels.ts
 *   node scripts/validate-levels.ts path/to/other/levels   # or LEVELS_DIR=…
 *
 * Why the dynamic import below? `tsconfig.json` is frozen and does not set
 * `allowImportingTsExtensions`, so a literal `..../index.ts` specifier would be a
 * `tsc --noEmit` error (TS5097); but Node's type stripping needs an explicit
 * `.ts` extension to resolve the file at runtime. A computed specifier satisfies
 * both: the compiler still type-checks the module through the `typeof import(…)`
 * annotation, and Node resolves the URL.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import type { ValidationResult } from "../src/core/level/index";

const levelModuleUrl = new URL("../src/core/level/index.ts", import.meta.url).href;
const levelModule = (await import(levelModuleUrl)) as typeof import("../src/core/level/index");
const { validateLevel } = levelModule;

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────

const levelsDir =
  process.argv[2] ?? process.env["LEVELS_DIR"] ?? fileURLToPath(new URL("../src/levels/", import.meta.url));

interface LoadedLevel {
  file: string;
  raw: unknown;
}

function loadLevels(dir: string): LoadedLevel[] {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();
  return files.map((file) => {
    const text = readFileSync(join(dir, file), "utf8");
    return { file, raw: JSON.parse(text) as unknown };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Reporting helpers
// ─────────────────────────────────────────────────────────────────────────────

const failures: string[] = [];

function reportValidation(label: string, result: ValidationResult): void {
  const status = result.ok ? "OK  " : "FAIL";
  console.log(`  ${status} ${label}  errors=${result.errors.length} warnings=${result.warnings.length}`);
  for (const error of result.errors) console.log(`         error:   ${error}`);
  for (const warning of result.warnings) console.log(`         warning: ${warning}`);
}

function summarizeLevel(raw: unknown): string {
  if (typeof raw !== "object" || raw === null) return "<not an object>";
  const l = raw as Record<string, unknown>;
  const walls = Array.isArray(l["phaseAWalls"]) && Array.isArray(l["phaseBWalls"]) ? (l["phaseAWalls"] as unknown[]).length + (l["phaseBWalls"] as unknown[]).length : "?";
  const objects = ["doors", "switches", "portals"]
    .map((key) => (Array.isArray(l[key]) ? (l[key] as unknown[]).length : "?"))
    .join("/");
  return `id=${String(l["id"])} ${String(l["width"])}x${String(l["height"])} par=${String(l["par"])} walls=${walls} doors/switches/portals=${objects}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// [1/2] Level files
// ─────────────────────────────────────────────────────────────────────────────

console.log("Phase Shift: Echo Grid — level validation gate");
console.log(`node ${process.version} · levels dir: ${levelsDir}`);
console.log("validation only: solvability and `par` are NOT proven here (SOLVER-001 owns BFS).");

const loaded = loadLevels(levelsDir);
console.log("");
console.log(`[1/2] level files (${loaded.length})`);

if (loaded.length === 0) {
  failures.push(`no *.json level files found in ${levelsDir}`);
}

const seenIds = new Map<number, string>();
let okLevels = 0;

for (const { file, raw } of loaded) {
  const before = JSON.stringify(raw);
  const result = validateLevel(raw);
  if (JSON.stringify(raw) !== before) {
    failures.push(`${file}: validateLevel MUTATED the input — the validator must never touch the candidate (ADR-0004)`);
  }
  if (result.ok) okLevels += 1;
  reportValidation(`${file}  ${summarizeLevel(raw)}`, result);
  if (!result.ok) failures.push(`${file}: ${result.errors.length} validation error(s)`);

  const id = (raw as Record<string, unknown>)["id"];
  if (typeof id === "number") {
    const previous = seenIds.get(id);
    if (previous !== undefined) {
      failures.push(`${file}: duplicate level id ${id} (already used by ${previous}) — ids are unique in the 50-level progression`);
    } else {
      seenIds.set(id, file);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// [2/2] Negative self-tests — the validator must REJECT and must NOT repair
// ─────────────────────────────────────────────────────────────────────────────

interface NegativeCase {
  name: string;
  /** The invariant under test, quoted from the docs. */
  invariant: string;
  /** The rejection message must NAME that invariant — a generic failure is not proof. */
  expect: RegExp;
  level: unknown;
}

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

const negativeCases: NegativeCase[] = [
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
    level: { ...baseLevel(), switches: [{ id: "s1", tile: [2, 0], activePhase: "A", targets: ["d9"] }] },
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

console.log("");
console.log(`[2/2] negative self-tests (${negativeCases.length}) — each must be REJECTED by name, and not repaired`);

let rejectedAsExpected = 0;

for (const testCase of negativeCases) {
  const before = JSON.stringify(testCase.level);
  const result = validateLevel(testCase.level);
  const mutated = JSON.stringify(testCase.level) !== before;

  const named = result.errors.filter((error) => testCase.expect.test(error));
  const passed = !result.ok && named.length > 0 && !mutated;

  if (passed) {
    rejectedAsExpected += 1;
    console.log(`  OK   ${testCase.name}`);
    console.log(`         invariant: ${testCase.invariant}`);
    console.log(`         rejected : ${named[0] ?? ""}`);
  } else {
    console.log(`  FAIL ${testCase.name}`);
    console.log(`         invariant: ${testCase.invariant}`);
    console.log(`         ok=${String(result.ok)} matched=${String(named.length)} mutated=${String(mutated)}`);
    for (const error of result.errors) console.log(`         error:   ${error}`);
    failures.push(`negative case ${testCase.name}: expected rejection naming "${String(testCase.expect)}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log(
  `summary: ${okLevels}/${loaded.length} level files ok · ${rejectedAsExpected}/${negativeCases.length} negative cases rejected by name · inputs unchanged (no auto-repair)`,
);

if (failures.length > 0) {
  console.log(`RESULT: FAIL (${failures.length} problem(s))`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS");
  console.log("next: SOLVER-001 must BFS-prove solvability + `par` under ADR-0008 before any of this ships.");
  process.exitCode = 0;
}