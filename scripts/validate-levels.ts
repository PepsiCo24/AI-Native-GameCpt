/**
 * scripts/validate-levels.ts — the level-set gate (Level AI + Solver).
 *
 * What it does (and deliberately does NOT do):
 *   1. loads every `src/levels/*.json`;
 *   2. runs the schema + rule validator (`validateLevel`, `@/core/level`);
 *   3. prints `ok` / `errors` / `warnings` per level, then a summary;
 *   4. runs a built-in suite of **negative** cases to prove the validator really
 *      rejects broken levels — and really does not repair them;
 *   5. runs a built-in suite of **warning probes**: boards that must be
 *      **accepted**, must carry a named warning code, and must still be proven
 *      solvable by the mandated BFS. Today's probe is the ADR-architecture-0003
 *      R5 flag `multi-switch-door` (a door fed by ≥ 2 switches — legal, flagged,
 *      never a gate). This is the one place where this script calls the solver,
 *      and it does so to prove a **not-rejection**, never to prove the shipped
 *      set (`scripts/solve-levels.ts` owns that);
 *   6. exits non-zero if any level fails, if any negative case is wrongly
 *      accepted, if a probe is wrongly rejected / unnamed / unsolvable, or if the
 *      level set has duplicate `id`s.
 *
 * It does NOT prove the shipped levels' solvability and does NOT verify `par` —
 * that is SOLVER-001's BFS job (`docs/architecture.md` §8, `scripts/solve-levels.ts`).
 * Per ADR-0004 a candidate that fails here is REJECTED, never auto-repaired into
 * the official set.
 *
 * Run (`tsx` is a devDependency of this workspace and `npm run levels` uses it;
 * Node's native type stripping also runs steps 1–2 without a build step):
 *
 *   npm run levels                                  # the workspace command — use this
 *   npx tsx scripts/validate-levels.ts               # equivalent
 *   node scripts/validate-levels.ts                  # steps 1–2 only — see below
 *   node scripts/validate-levels.ts path/to/levels   # or LEVELS_DIR=…
 *
 * **Runner requirement (step 5):** the warning probe's solvability leg imports
 * `@/core/solver/bfs`, whose own imports use the `@/` path alias. Bare Node's
 * type stripping cannot resolve that alias (`Cannot find package '@/core' …`), so
 * a bare-`node` run completes steps 1–2, prints the probe leg as **NOT RUN**,
 * and exits **non-zero** naming the fix — a control that did not run is never
 * reported as a pass. `npm run levels` / `tsx` runs the whole gate.
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

import type { Level, LevelWarningCode, ValidationResult } from "../src/core/level/index";

const levelModuleUrl = new URL("../src/core/level/index.ts", import.meta.url).href;
const levelModule = (await import(levelModuleUrl)) as typeof import("../src/core/level/index");
const { LEVEL_WARNING_CODES, LevelSchema, validateLevel, warningCodeOf } = levelModule;

const solverModuleUrl = new URL("../src/core/solver/bfs.ts", import.meta.url).href;
type SolverModule = typeof import("../src/core/solver/bfs");

/** Loaded-or-not, as a discriminated union so every read has to handle both. */
type SolverLoad = { readonly ok: true; readonly module: SolverModule } | { readonly ok: false; readonly error: string };

/**
 * The mandated BFS, loaded **lazily** so that a runner without the `@/` alias
 * can still complete steps 1–2 and report the probe leg honestly (see the header).
 */
async function loadSolver(): Promise<SolverLoad> {
  try {
    return { ok: true, module: (await import(solverModuleUrl)) as SolverModule };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message.split("\n")[0] ?? "" : String(error) };
  }
}

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
// [1/3] Level files
// ─────────────────────────────────────────────────────────────────────────────

console.log("Phase Shift: Echo Grid — level validation gate");
console.log(`node ${process.version} · levels dir: ${levelsDir}`);
console.log("validation only: the shipped levels' solvability and `par` are NOT proven here (scripts/solve-levels.ts owns the BFS proof);");
console.log("the one solver call below exists to prove a review-flagged board is still ACCEPTED and still solvable — a warning is not a gate.");

const loaded = loadLevels(levelsDir);
console.log("");
console.log(`[1/3] level files (${loaded.length})`);

if (loaded.length === 0) {
  failures.push(`no *.json level files found in ${levelsDir}`);
}

const seenIds = new Map<number, string>();
let okLevels = 0;
/** Honest aggregates: the warning channel is printed per level *and* summed. */
let totalErrors = 0;
let totalWarnings = 0;
const warningsByCode = new Map<LevelWarningCode, number>();

for (const { file, raw } of loaded) {
  const before = JSON.stringify(raw);
  const result = validateLevel(raw);
  if (JSON.stringify(raw) !== before) {
    failures.push(`${file}: validateLevel MUTATED the input — the validator must never touch the candidate (ADR-0004)`);
  }
  if (result.ok) okLevels += 1;
  totalErrors += result.errors.length;
  totalWarnings += result.warnings.length;
  for (const warning of result.warnings) {
    const code = warningCodeOf(warning);
    if (code !== null) warningsByCode.set(code, (warningsByCode.get(code) ?? 0) + 1);
  }
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
// [2/3] Negative self-tests — the validator must REJECT and must NOT repair
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
console.log(`[2/3] negative self-tests (${negativeCases.length}) — each must be REJECTED by name, and not repaired`);

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
// [3/3] Warning probes — the validator must ACCEPT, must NAME the warning, and
//       the board must still be solved by the mandated BFS ("not silent, not
//       forbidden" — ADR-architecture-0003 R5).
//
// A probe is the positive mirror of a negative case: where a negative case
// demands `ok === false` *by name*, a probe demands `ok === true` **with** the
// warning named, zero errors, the input untouched, and a par route in the BFS.
// Together they prove the verdict strength: the flagged construction is
// reviewable (visible), and it is not an acceptance edge (the solver still
// proves the board).
// ─────────────────────────────────────────────────────────────────────────────

interface WarningProbeCase {
  /** Probe name — the warning code it must fire, so a grep finds both sides. */
  name: string;
  /** The law under test, quoted from the docs / ADR. */
  invariant: string;
  /** The code the emitted warning must carry in its `[…]` head. */
  code: LevelWarningCode;
  /** The warning must name the door, the count and the switch ids — a generic warning is not proof. */
  expect: RegExp;
  /** The board: legal, accepted, review-flagged. */
  level: unknown;
  /** The BFS must still find a `par` route of exactly this length. */
  expectShortestSolution: number;
  /** `par` the board carries — must equal the solved length (`par` is solver-stamped). */
  expectPar: number;
}

const probeCases: WarningProbeCase[] = [
  {
    name: "multi-switch-door-warning",
    invariant:
      "docs/level-design.md §1 (L6–L35: at most one switch per door — more is a REVIEW FLAG, never a rejection) · ADR-architecture-0003 R5 (home = validator warning, statically decidable, no search may gate it)",
    code: "multi-switch-door",
    expect: /^\[multi-switch-door\] doors\[0\] "d1" is targeted by 2 switches \(switches\[0\] "s1", switches\[1\] "s2"\) — docs\/level-design\.md §1/,
    // `d1` blue on (2,1) is open in phase B; the straight line (0,1)→(4,1) enters
    // it on move 2 (phase B) ⇒ 4 moves. Two switches both enter in phase A
    // (odd Manhattan distance from the start) and both aim at `d1` — the flagged
    // geometry, on a board whose par route exists with or without either switch.
    level: {
      ...baseLevel(),
      doors: [{ id: "d1", color: "blue", tiles: [[2, 1]] }],
      switches: [
        { id: "s1", tile: [0, 0], activePhase: "A", targets: ["d1"] },
        { id: "s2", tile: [4, 0], activePhase: "A", targets: ["d1"] },
      ],
    },
    expectShortestSolution: 4,
    expectPar: 4,
  },
];

console.log("");
console.log(`[3/3] warning probes (${probeCases.length}) — each must be ACCEPTED, NAMED and still SOLVED`);

const solver = await loadSolver();
let probesNamed = 0;

for (const probe of probeCases) {
  const before = JSON.stringify(probe.level);
  const result = validateLevel(probe.level);
  const mutated = JSON.stringify(probe.level) !== before;

  const named = result.warnings.filter((warning) => probe.expect.test(warning));
  // "by name" = the machine-readable head, not merely a substring: the code
  // inventory and the message must agree.
  const coded = result.warnings.filter((warning) => warningCodeOf(warning) === probe.code);

  console.log(`  --   ${probe.name}`);
  console.log(`         invariant: ${probe.invariant}`);
  console.log(`         accepted : ok=${String(result.ok)} errors=${String(result.errors.length)} warnings=${String(result.warnings.length)}`);
  for (const warning of result.warnings) console.log(`         warning: ${warning}`);

  if (!solver.ok) {
    console.log(`  NOT RUN ${probe.name} — the BFS solver could not be loaded by this runner: ${solver.error}`);
    console.log(`         fix: run this gate with the workspace runner — npm run levels  (tsx resolves the "@/…" alias)`);
    failures.push(
      `warning probe ${probe.name}: solvability leg NOT RUN (solver import failed: ${solver.error}) — run \`npm run levels\``,
    );
    continue;
  }

  const level: Level = LevelSchema.parse(probe.level);
  const analysis = solver.module.solve(level);
  const solved = analysis.solvable && analysis.shortestSolution === probe.expectShortestSolution;
  const parMatchesSolver = level.par === probe.expectPar && analysis.shortestSolution === probe.expectPar;

  const passed =
    result.ok &&
    result.errors.length === 0 &&
    !mutated &&
    named.length > 0 &&
    coded.length === named.length &&
    solved &&
    parMatchesSolver;

  if (passed) {
    probesNamed += 1;
    console.log(`  OK   ${probe.name}`);
    console.log(`         named    : ${coded[0] ?? ""}`);
    console.log(`         solved   : shortest=${String(analysis.shortestSolution)} (par ${String(level.par)}) reachableStates=${String(analysis.reachableStates)} dead=${String(analysis.deadStates)}`);
  } else {
    console.log(`  FAIL ${probe.name}`);
    console.log(
      `         accepted=${String(result.ok)} errors=${String(result.errors.length)} matched=${String(named.length)} coded=${String(coded.length)} mutated=${String(mutated)} solvable=${String(analysis.solvable)} shortest=${String(analysis.shortestSolution)} par=${String(level.par)}`,
    );
    for (const error of result.errors) console.log(`         error:   ${error}`);
    failures.push(
      `warning probe ${probe.name}: expected an ACCEPTED board carrying warning code "${probe.code}" and a solvable par route of ${String(probe.expectShortestSolution)}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

const warningsBreakdown = LEVEL_WARNING_CODES.map(
  (code) => `${String(warningsByCode.get(code) ?? 0)} ${code}`,
).join(" · ");

console.log("");
console.log(
  `summary: ${okLevels}/${loaded.length} level files ok · ${String(totalErrors)} errors · ${String(totalWarnings)} warnings (${warningsBreakdown}) · ` +
    `${String(rejectedAsExpected + probesNamed)}/${String(negativeCases.length + probeCases.length)} negative cases + warning probes by name ` +
    `(${String(rejectedAsExpected)} rejected · ${String(probesNamed)} accepted-with-warning) · inputs unchanged (no auto-repair)`,
);

// The runner-capability line: a control that did not run is stated in words,
// never dropped (the probe rows above already failed the gate when it did not).
if (!solver.ok) {
  console.log(
    `solver leg (step 3): NOT RUN — the BFS import failed (${solver.error}); run \`npm run levels\` (tsx resolves the "@/…" alias).`,
  );
} else {
  console.log("solver leg (step 3): BFS loaded — every probe above was proven solvable by the mandated `@/core/solver/bfs`.");
}

if (failures.length > 0) {
  console.log(`RESULT: FAIL (${failures.length} problem(s))`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS");
  console.log("next: SOLVER-001 must BFS-prove solvability + `par` under ADR-0008 before any of this ships.");
  process.exitCode = 0;
}