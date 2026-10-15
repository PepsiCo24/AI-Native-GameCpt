/**
 * `scripts/solve-levels.ts` — the BFS solver gate (SOLVER-001, Level AI + Solver).
 *
 * What it does:
 *   1. loads every `src/levels/*.json`, parses it with the **frozen zod schema**
 *      (`@/core/level`) and then runs the **rule gate** `validateLevel` on the
 *      raw candidate — a schema failure *or* a rule failure is a REJECT, never a
 *      repair (ADR-0004). The solver gate therefore cannot pass a level the
 *      validator rejects (e.g. a door tile that is also a phase wall, LV-005);
 *   2. runs the mandated BFS solver (`@/core/solver/bfs`, `docs/architecture.md`
 *      §8) over the shipped `applyMove` and prints **every** required field per
 *      level, including the two §8 dynamism metrics (`dualPhaseTiles`,
 *      `refusedThenEnteredTiles`) and the `docs/level-design.md` §4 invariants
 *      (`deadStates`, `noUnrecoverableOk`);
 *   3. prints one PASS/FAIL verdict per level plus a **non-zero exit** when a
 *      level is unsolvable, has a dead state, has an unrecoverable state, is
 *      refused by the solver's state budget (a state explosion is reported, never
 *      silently truncated), or its `par` disagrees with the solver's shortest
 *      solution (`par` is stamped from the solver, §8 — a mismatch is a data
 *      error, not a softer target);
 *   4. prints the mechanical-static conclusion: every level with
 *      `dualPhaseTiles == 0` is, by ADR-0009, a **mechanically static** board
 *      (a pure timing-gate maze) and is flagged for difficulty review;
 *   5. LV-004 hygiene: prints `parRoutes / embedRoutes / embedForced` (every
 *      shortest route enumerated) and enforces the level policy — M1 never ships
 *      alone (every door paired with a switch that can actually fire), a
 *      documented lesson must be program-true (`@/core/solver/policy`), and the
 *      documented Aha #1 (`l008`) must satisfy its named gates one by one. A gate
 *      that is **unsatisfiable as written** (today: `dualPhaseTiles ≥ 1` on a
 *      portal-free board, ADR-0009 schedules M2 at L11) is printed as an
 *      ESCALATION, never counted as a pass and never softened;
 *   6. `--audit` additionally runs the ADR-0009 "9/200 M1-alone anomaly"
 *      qualification obligation handed to SOLVER-001, with the checkerboard
 *      invariant, the artifact probes and minimal reproductions.
 *
 * Run (tsx is a devDependency of this workspace):
 *
 *   npx tsx scripts/solve-levels.ts                 # level-set gate
 *   npx tsx scripts/solve-levels.ts --audit         # gate + anomaly qualification
 *   npx tsx scripts/solve-levels.ts <levels-dir>    # or LEVELS_DIR=…
 *   npx tsx scripts/solve-levels.ts --audit <dir>
 *
 * Ownership note: this script and `src/core/solver/**` are Level AI + Solver's.
 * It calls `validateLevel` (the level layer's rule gate) but never edits the
 * validator script (`scripts/validate-levels.ts`, another task's file: that one
 * also picks this gate up automatically, it calls the same function) and never
 * edits a level: a failing level is reported, not fixed.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import type { Coord, DoorDef, Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { resolveDoorsOpen, solidAt } from "@/core/rules";
import { DIRECTIONS, step } from "@/core/state/move";
import type { Vec } from "@/core/state/types";
import type { ReachableGraph, SolveResult } from "@/core/solver/bfs";
import {
  analyse,
  explore,
  movePath,
  refusedThenEnteredTiles,
  solve,
  tileKey,
} from "@/core/solver/bfs";
import type { LevelAudit, NamedGate, PolicyViolation } from "@/core/solver/policy";
import { auditLevel } from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const withAudit = argv.includes("--audit");
const dirArg = argv.find((arg) => !arg.startsWith("--"));
const levelsDir =
  dirArg ??
  process.env["LEVELS_DIR"] ??
  fileURLToPath(new URL("../src/levels/", import.meta.url));

const failures: string[] = [];

/**
 * Non-failure escalations: a named gate that is *unsatisfiable as written*
 * rather than failed by the level. Recorded and printed separately so it can
 * never be mistaken for a pass and never silently softens a real gate.
 */
const escalations: string[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// [1/2] Level files — schema → BFS → required metrics → PASS/FAIL
// ─────────────────────────────────────────────────────────────────────────────

function formatTiles(list: readonly string[]): string {
  return list.length === 0 ? "[]" : `[${list.join(" ")}]`;
}

/** `true` iff the level satisfies every mechanical gate this script owns. */
function verdictOf(
  level: Level,
  r: SolveResult,
): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!r.solvable) reasons.push("unsolvable (goal unreachable)");
  if (r.deadStates > 0)
    reasons.push(
      `${r.deadStates} dead state(s) — zero legal out-edges, not the goal`,
    );
  if (!r.noUnrecoverableOk) {
    reasons.push(
      `${r.unrecoverableStates} unrecoverable state(s) — the goal is NOT reachable from every reachable state (docs/level-design.md §4)`,
    );
  }
  if (r.shortestSolution !== level.par) {
    reasons.push(
      `shortestSolution=${String(r.shortestSolution)} but par=${level.par}`,
    );
  }
  return { pass: reasons.length === 0, reasons };
}

/** Gate lines are printed for every level that declares an Aha obligation. */
function printGates(gates: readonly NamedGate[]): void {
  for (const gate of gates) {
    console.log(`       gate ${gate.status.padEnd(13)} ${gate.id}`);
    console.log(`            ${gate.label}`);
    console.log(`            ${gate.detail}`);
    if (gate.status === "UNSATISFIABLE") {
      escalations.push(
        `${gate.id}: gate is UNSATISFIABLE as written — see the printed proof (NOT counted as a level failure; escalate)`,
      );
    }
  }
}

function printViolations(violations: readonly PolicyViolation[]): void {
  for (const violation of violations) {
    console.log(`       policy ${violation.code}: ${violation.detail}`);
  }
}

function reportLevel(
  file: string,
  level: Level,
): { result: SolveResult; pass: boolean } | null {
  let audit: LevelAudit;
  try {
    audit = auditLevel(level);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      `  FAIL ${file}  id=${level.id} ${level.width}x${level.height} — solver error`,
    );
    console.log(`       ${message}`);
    failures.push(`${file}: ${message}`);
    return null;
  }

  const result = audit.result;
  const { pass, reasons } = verdictOf(level, result);
  const policyFail = audit.violations.length > 0;
  const ok = pass && !policyFail;
  console.log(
    `  ${ok ? "PASS" : "FAIL"} ${file}  id=${level.id} ${level.width}x${level.height} startPhase=${level.startPhase} par=${level.par}`,
  );
  if (audit.lesson !== null) {
    console.log(`       lesson: ${audit.lesson.lesson}`);
    console.log(`            source: ${audit.lesson.evidence}`);
  }
  console.log(
    `       solvable=${result.solvable} shortestSolution=${String(result.shortestSolution)} parMatch=${result.shortestSolution === level.par}`,
  );
  console.log(
    `       reachableStates=${result.reachableStates} distinctPositions=${result.distinctPositions} maxDepth=${result.maxDepth} stateBudget=${result.stateBudget}`,
  );
  console.log(
    `       dualPhaseTiles=${result.dualPhaseTiles} tiles=${formatTiles(result.dualPhaseTileList)}`,
  );
  console.log(
    `       refusedThenEnteredTiles=${result.refusedThenEnteredTiles} tiles=${formatTiles(result.refusedThenEnteredTileList)}`,
  );
  // LV-004 hygiene: the phantom-walk plumbing PA-004 derived by hand.
  console.log(
    `       parRoutes=${audit.embeds.parRoutes} embedRoutes=${audit.embeds.embedRoutes} embedForced=${String(audit.embeds.embedForced)}`,
  );
  console.log(
    `       deadStates=${result.deadStates} states=${formatTiles(result.deadStateList)}`,
  );
  console.log(
    `       noUnrecoverableOk=${result.noUnrecoverableOk} unrecoverableStates=${result.unrecoverableStates}`,
  );
  printGates(audit.gates);
  printViolations(audit.violations);
  for (const reason of reasons) console.log(`       reason: ${reason}`);
  for (const reason of reasons) failures.push(`${file}: ${reason}`);
  for (const violation of audit.violations) {
    failures.push(`${file}: policy ${violation.code}: ${violation.detail}`);
  }
  return { result, pass: ok };
}

console.log("Phase Shift: Echo Grid — BFS solver gate (SOLVER-001)");
console.log(`node ${process.version} · levels dir: ${levelsDir}`);
console.log(
  "solver: BFS over @/core/rules applyMove + @/core/state hashState (one truth source); metrics per architecture §8 / ADR-0009.",
);

const files = readdirSync(levelsDir)
  .filter((name) => name.endsWith(".json"))
  .sort();

console.log("");
console.log(`[1/2] level files (${files.length})`);

if (files.length === 0)
  failures.push(`no *.json level files found in ${levelsDir}`);

const staticLevels: string[] = [];
const dynamicLevels: string[] = [];
const latchLevels: string[] = [];
let passLevels = 0;
let parVerified = 0;

for (const file of files) {
  const raw = JSON.parse(
    readFileSync(join(levelsDir, file), "utf8"),
  ) as unknown;
  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    console.log(
      `  FAIL ${file} — schema rejected (reject, never repair: ADR-0004)`,
    );
    for (const issue of parsed.error.issues) {
      const path = issue.path.length === 0 ? "<level>" : issue.path.join(".");
      console.log(`       ${path}: ${issue.message}`);
      failures.push(`${file}: schema ${path}: ${issue.message}`);
    }
    continue;
  }

  const level: Level = parsed.data;

  // Rule gate — the same `validateLevel` (`@/core/level`) the level-set gate
  // calls: one truth source, so a candidate the validator rejects can never be
  // BFS-proven "solvable" here (ADR-0004: reject, never repair). This is where
  // LV-005's door ∩ phase-wall hard error enters the solver gate.
  const verdict = validateLevel(raw);
  if (!verdict.ok) {
    console.log(
      `  FAIL ${file} — rule gate (validateLevel) rejected the candidate (reject, never repair: ADR-0004)`,
    );
    for (const error of verdict.errors) {
      console.log(`       rule: ${error}`);
      failures.push(`${file}: rule ${error}`);
    }
    continue;
  }

  const report = reportLevel(file, level);
  if (report === null) continue;
  const { result } = report;

  if (report.pass) passLevels += 1;
  if (result.dualPhaseTiles === 0) staticLevels.push(file);
  else dynamicLevels.push(file);
  if (result.refusedThenEnteredTiles > 0) latchLevels.push(file);
  if (result.shortestSolution === level.par) parVerified += 1;
}

console.log("");
console.log("conclusion — board dynamism (architecture §8 / ADR-0009):");
if (staticLevels.length > 0) {
  console.log(
    `  dualPhaseTiles == 0 on ${staticLevels.length}/${files.length} level(s) ⇒ these boards are MECHANICALLY STATIC`,
  );
  console.log(
    `  (no cell is enterable in two phases ⇒ a pure timing-gate maze) ⇒ FLAG FOR DIFFICULTY REVIEW: ${staticLevels.join(", ")}`,
  );
}
if (dynamicLevels.length > 0) {
  console.log(
    `  dualPhaseTiles > 0 on ${dynamicLevels.length}/${files.length} level(s) ⇒ parity-breaking portal displacement present: ${dynamicLevels.join(", ")}`,
  );
}
if (latchLevels.length > 0) {
  console.log(
    `  refusedThenEnteredTiles > 0 on ${latchLevels.length}/${files.length} level(s) ⇒ M3 latch state is load-bearing (a tile answers differently because of history, ADR-0009 decision 4): ${latchLevels.join(", ")}`,
  );
}
const parityStatic = files.filter((file) => !dynamicLevels.includes(file));
if (parityStatic.length === files.length && files.length > 0) {
  console.log(
    `  ⇒ no portal in the shipped set: the position→phase link is intact everywhere (dualPhaseTiles ≡ 0 by the checkerboard invariant).`,
  );
  if (latchLevels.length === 0) {
    console.log(
      `    …and no latched state either: every shipped solution is reachable without M3/M2 state — the whole set is static.`,
    );
  } else {
    console.log(
      `    …but ${latchLevels.length} level(s) DO carry latch state, so "static" here means only "parity not broken" — read refusedThenEnteredTiles.`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("");
console.log(
  `summary: ${passLevels}/${files.length} level file(s) PASS · par verified from the solver on ${parVerified}/${files.length} · refusals are reported, never repaired`,
);
if (escalations.length > 0) {
  console.log("");
  console.log(`ESCALATIONS (${escalations.length}) — not level failures, not silently dropped:`);
  for (const escalation of escalations) console.log(`  - ${escalation}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// [2/2] --audit — ADR-0009: qualify the "M1 doors alone → 9/200" residue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The GATE D decision scan (out of repo, ADR-0009 Context item 4) reported
 * `M1 doors alone → 9/200 decision-bearing`, which the checkerboard invariant
 * says must be 0. This audit decides the open question with the shipped rules:
 *
 *  - (a) the **shipped** metric (`refusedThenEnteredTiles`, tile-keyed, entry
 *    legality only) on random doors-only boards, under two generator policies;
 *  - (b) an **exhaustive** 3 × 3 sweep (every per-tile wall assignment, plus a
 *    door on the player start) — degenerate/invalid boards included on purpose;
 *  - (c) **artifact probes**: alternative ways to implement "refused then
 *    entered" that a throwaway harness plausibly used. Each probe is named after
 *    the mistake it models; only the shipped variant is the program of record;
 *  - (d) a **positive control** on the shipped metric (a latch level where it
 *    must fire), so a zero is evidence and not a broken measurement;
 *  - (e) minimal reproductions (level JSON + BFS trajectories with state and
 *    phase) for every probe that fires.
 */

type Policy = "doors-anywhere" | "doors-off-endpoints";

type Variant =
  | "spec-tile"
  | "occupied-position"
  | "oob-flat-index"
  | "oob-wrap"
  | "direction-key"
  | "no-adjacency";

const VARIANTS: readonly Variant[] = [
  "spec-tile",
  "occupied-position",
  "oob-flat-index",
  "oob-wrap",
  "direction-key",
  "no-adjacency",
];

const VARIANT_NOTES: Readonly<Record<Variant, string>> = {
  "spec-tile":
    "shipped metric: key = clicked tile; refused = entry illegal, accepted = legal move (docs/architecture.md §8)",
  "occupied-position":
    "artifact: accepted side = the tile is OCCUPIED by the player in some reachable state (the start tile is occupied without any entry)",
  "oob-flat-index":
    "artifact: key = flat index y*width+x of the clicked tile, so an out-of-bounds click aliases onto an in-bounds tile",
  "oob-wrap":
    "artifact: key = clicked tile wrapped modulo the grid, so an out-of-bounds click aliases onto an in-bounds tile",
  "direction-key":
    "artifact: key = direction only, so legality is compared across positions",
  "no-adjacency":
    "artifact: accepted side = the tile is not solid in some reachable state (adjacency ignored); refused side still per click",
};

/** Deterministic seeded PRNG (mulberry32) — a flagged board is always reproducible. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Random doors-only board (M0 walls + 1–2 single-tile doors, **no switches, no
 * portals** — exactly the class ADR-0009 calls "M1 doors alone"). Deliberately
 * mirrors the QA fixture generator's distributions; `doors-anywhere` also allows
 * a door on the player/goal tile (the shipped validator only *warns* about that,
 * so a harness of the same era could have generated it).
 */
function randomM1Level(seed: number, policy: Policy): Level {
  const rng = makeRng(seed);
  const width = 3 + Math.floor(rng() * 5);
  const height = 3 + Math.floor(rng() * 5);
  const cells: Coord[] = [];
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) cells.push([x, y] as Coord);
  }
  const same = (a: Coord, b: Coord): boolean => a[0] === b[0] && a[1] === b[1];
  const pick = (): Coord => cells[Math.floor(rng() * cells.length)] as Coord;

  const player = pick();
  let goal = pick();
  while (same(player, goal)) goal = pick();
  const isEnd = (c: Coord): boolean => same(c, player) || same(c, goal);

  const phaseAWalls = cells.filter((c) => !isEnd(c) && rng() < 0.25);
  const phaseBWalls = cells.filter((c) => !isEnd(c) && rng() < 0.25);

  const interior = cells.filter((c) => !isEnd(c));
  const doors: DoorDef[] = [];
  const doorCount = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < doorCount; i += 1) {
    const pool =
      policy === "doors-anywhere"
        ? cells
        : interior.length > 0
          ? interior
          : cells;
    const tile = pool[Math.floor(rng() * pool.length)] as Coord;
    doors.push({
      id: `d${i + 1}`,
      color: rng() < 0.5 ? "red" : "blue",
      tiles: [tile],
    });
  }

  return {
    id: 9000 + seed,
    width,
    height,
    startPhase: rng() < 0.5 ? "A" : "B",
    player,
    goal,
    phaseAWalls,
    phaseBWalls,
    doors,
    switches: [],
    portals: [],
    par: 1,
  };
}

/**
 * The offending keys of one metric implementation on one board.
 *
 * `spec-tile` re-derives exactly the shipped metric from the graph (so a
 * disagreement with `solve()` would be a bug in this probe, not in the solver);
 * every other variant models one plausible harness mistake.
 */
function variantOffenders(
  level: Level,
  graph: ReachableGraph,
  variant: Variant,
): string[] {
  // The shipped metric is called, not re-derived: the `spec-tile` probe row *is*
  // the production function, so a probe/solver disagreement could not hide.
  if (variant === "spec-tile") return [...refusedThenEnteredTiles(graph)];

  const refused = new Set<string>();
  const accepted = new Set<string>();
  const width = level.width;
  const height = level.height;
  const wrap = (v: number, m: number): number => ((v % m) + m) % m;

  for (let i = 0; i < graph.nodes.length; i += 1) {
    const state = graph.nodes[i];
    if (state === undefined) continue;
    const mask = graph.legalMask[i] ?? 0;

    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const dir = DIRECTIONS[d] as (typeof DIRECTIONS)[number];
      const clicked: Vec = step(state.player, dir);
      const legal = (mask & (1 << d)) !== 0;

      if (variant === "no-adjacency") {
        // Asymmetric sloppy variant: refusal is still recorded per *click*
        // (adjacency preserved), but the "accepted" side asks every in-bounds
        // grid tile for solidity in the state's phase, adjacency ignored.
        for (let gx = 0; gx < width; gx += 1) {
          for (let gy = 0; gy < height; gy += 1) {
            const tile: Vec = { x: gx, y: gy };
            if (!solidAt(level, state.phase, state.doorsOpen, tile))
              accepted.add(tileKey(tile));
          }
        }
        if (!(
          legal && !solidAt(level, state.phase, state.doorsOpen, clicked)
        )) {
          refused.add(tileKey(clicked));
        }
        continue;
      }
      if (variant === "direction-key") {
        (legal ? accepted : refused).add(dir);
        continue;
      }

      const key =
        variant === "oob-flat-index"
          ? String(clicked.y * width + clicked.x)
          : variant === "oob-wrap"
            ? tileKey({ x: wrap(clicked.x, width), y: wrap(clicked.y, height) })
            : tileKey(clicked);
      (legal ? accepted : refused).add(key);
    }
  }

  if (variant === "occupied-position") {
    for (const state of graph.nodes) accepted.add(tileKey(state.player));
  }

  return [...refused].filter((key) => accepted.has(key)).sort();
}

interface ProbeSample {
  readonly seed: number;
  readonly level: Level;
  readonly offenders: readonly string[];
  /** Smallest level kept for a minimal reproduction. */
  readonly area: number;
}

/** `true` iff `key` is clicked and refused from some reachable state. */
function isClickedAndRefused(graph: ReachableGraph, key: string): boolean {
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const state = graph.nodes[i];
    if (state === undefined) continue;
    const mask = graph.legalMask[i] ?? 0;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const dir = DIRECTIONS[d] as (typeof DIRECTIONS)[number];
      if (tileKey(step(state.player, dir)) !== key) continue;
      if ((mask & (1 << d)) === 0) return true;
    }
  }
  return false;
}

/**
 * Mechanism attribution for the `occupied-position` probe: a tile can only be
 * *occupied* while refusing a click if it was never entered — i.e. the player's
 * start tile — and it can only refuse the click if it is solid in the phase
 * opposite the start phase. So the probe can fire **only** on a board whose
 * start tile carries a door closed in that phase. These counters test exactly
 * that, instead of leaving the correlation implied.
 */
function startTileMechanism(level: Level): {
  doorOnStart: boolean;
  refuses: boolean;
} {
  const startVec: Vec = { x: level.player[0], y: level.player[1] };
  const startKey = tileKey(startVec);
  const doorOnStart = level.doors.some((door) =>
    door.tiles.some((tile) => tileKey({ x: tile[0], y: tile[1] }) === startKey),
  );
  // The phase in which the start tile is ever clicked (every neighbour has the
  // opposite checkerboard parity, so it is the opposite of the start phase).
  const clickPhase = level.startPhase === "A" ? "B" : "A";
  const doorsOpen = resolveDoorsOpen(level, clickPhase, {});
  return {
    doorOnStart,
    refuses: solidAt(level, clickPhase, doorsOpen, startVec),
  };
}

function probeVariant(
  variant: Variant,
  policy: Policy,
  count: number,
): {
  flagged: number;
  keys: number;
  maxKeys: number;
  smallest: ProbeSample | null;
} {
  let flagged = 0;
  let keys = 0;
  let maxKeys = 0;
  let smallest: ProbeSample | null = null;

  for (let seed = 1; seed <= count; seed += 1) {
    const level = randomM1Level(seed, policy);
    const graph = explore(level);
    const offenders = variantOffenders(level, graph, variant);
    if (offenders.length === 0) continue;
    flagged += 1;
    keys += offenders.length;
    if (offenders.length > maxKeys) maxKeys = offenders.length;
    const area = level.width * level.height;
    if (smallest === null || area < smallest.area)
      smallest = { seed, level, offenders, area };
  }

  return { flagged, keys, maxKeys, smallest };
}

function printLevelJson(level: Level): void {
  console.log(
    JSON.stringify(
      {
        id: level.id,
        width: level.width,
        height: level.height,
        startPhase: level.startPhase,
        player: level.player,
        goal: level.goal,
        phaseAWalls: level.phaseAWalls,
        phaseBWalls: level.phaseBWalls,
        doors: level.doors,
        switches: level.switches,
        portals: level.portals,
        par: level.par,
      },
      null,
      2,
    )
      .split("\n")
      .map((line) => `      ${line}`)
      .join("\n"),
  );
}

/**
 * Every BFS trajectory that clicks a tile whose *key* equals `key` under `keyOf`,
 * printed with the state (player, phase, door state) it happens in. This is the
 * evidence format the anomaly report needs: one refusal trajectory and one
 * acceptance trajectory, each with its state and phase.
 *
 * Returns the full observed counts (printing is capped at 6 trajectories).
 */
function explainClicks(
  level: Level,
  graph: ReachableGraph,
  key: string,
  keyOf: (clicked: Vec) => string,
): { accepted: number; refused: number } {
  let accepted = 0;
  let refused = 0;
  let printed = 0;
  for (let i = 0; i < graph.nodes.length; i += 1) {
    const state = graph.nodes[i];
    if (state === undefined) continue;
    const mask = graph.legalMask[i] ?? 0;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const dir = DIRECTIONS[d] as (typeof DIRECTIONS)[number];
      const clicked = step(state.player, dir);
      if (keyOf(clicked) !== key) continue;
      const legal = (mask & (1 << d)) !== 0;
      if (legal) accepted += 1;
      else refused += 1;
      if (printed >= 6) continue;
      printed += 1;
      const trail = movePath(graph, i);
      const inBounds =
        clicked.x >= 0 &&
        clicked.y >= 0 &&
        clicked.x < level.width &&
        clicked.y < level.height;
      console.log(
        `      trace: moves=[${trail.join(" ") || "<start>"}] → state(player=(${state.player.x},${state.player.y}) phase=${state.phase} doorsOpen=${JSON.stringify(state.doorsOpen)} switchesOn=${JSON.stringify(state.switchesOn)})`,
      );
      console.log(
        `             click ${dir} → clicked tile (${clicked.x},${clicked.y})${inBounds ? "" : " OUT OF BOUNDS"} key="${key}" → ${
          legal
            ? "ACCEPTED (legal move, phase flips)"
            : "REFUSED (no movement, no flip)"
        }`,
      );
    }
  }
  return { accepted, refused };
}

function audit(): void {
  const COUNT = 2000;

  console.log("");
  console.log(
    '[2/2] --audit · ADR-0009 obligation: qualify the GATE D scan\'s "M1 doors alone → 9/200" residue',
  );
  console.log(
    "  claim under test: on a doors-only board (no switches, no portals) no clicked tile can be refused in one",
  );
  console.log(
    "  reachable state and accepted in another — the checkerboard invariant makes the arrival phase a function of the tile.",
  );
  console.log(
    "  (the metric implementation is this probe's only variable: same board, same shipped applyMove, different key/semantics)",
  );

  let theoremBroken = false;

  for (const policy of ["doors-anywhere", "doors-off-endpoints"] as const) {
    console.log("");
    console.log(
      `  (a) randomized doors-only scan · ${COUNT} boards · generator policy "${policy}"`,
    );

    let specFlagged = 0;
    let dualFlagged = 0;
    let startDoorBoards = 0;
    let startRefusingBoards = 0;
    let startRefusedBoards = 0;
    for (let seed = 1; seed <= COUNT; seed += 1) {
      const level = randomM1Level(seed, policy);
      const graph = explore(level);
      const result = analyse(level, graph);
      if (result.refusedThenEnteredTiles > 0) specFlagged += 1;
      if (result.dualPhaseTiles > 0) dualFlagged += 1;
      const mechanism = startTileMechanism(level);
      if (mechanism.doorOnStart) startDoorBoards += 1;
      if (mechanism.doorOnStart && mechanism.refuses) {
        startRefusingBoards += 1;
        const startKey = tileKey({ x: level.player[0], y: level.player[1] });
        if (isClickedAndRefused(graph, startKey)) startRefusedBoards += 1;
      }
    }
    console.log(
      `      shipped metric  refusedThenEnteredTiles > 0: ${specFlagged}/${COUNT} boards   dualPhaseTiles > 0: ${dualFlagged}/${COUNT}`,
    );
    console.log(
      `      mechanism census  door on the player start tile: ${startDoorBoards}/${COUNT} · …and it is solid in the phase that`,
    );
    console.log(
      `                        tile is clicked in: ${startRefusingBoards}/${COUNT} · …and it is really clicked-and-refused from a reachable state: ${startRefusedBoards}/${COUNT}`,
    );
    if (specFlagged > 0) {
      theoremBroken = true;
      failures.push(
        `audit/${policy}: the shipped metric flagged ${specFlagged}/${COUNT} doors-only boards — the invariant would be broken`,
      );
    }

    for (const variant of VARIANTS) {
      const probe = probeVariant(variant, policy, COUNT);
      const smallest = probe.smallest;
      console.log(
        `      ${variant.padEnd(18)} flagged ${String(probe.flagged).padStart(4)}/${COUNT} boards (${((100 * probe.flagged) / COUNT).toFixed(1)}%) · keys=${probe.keys} · maxKeys/board=${probe.maxKeys}${smallest === null ? "" : ` · smallest: seed=${smallest.seed} ${smallest.level.width}x${smallest.level.height} offenders=${formatTiles(smallest.offenders)}`}`,
      );
      console.log(`                         ${VARIANT_NOTES[variant]}`);
    }
  }

  // ── (b) exhaustive 3 × 3 sweep ─────────────────────────────────────────────
  const width = 3;
  const height = 3;
  const cells: Coord[] = [];
  for (let x = 0; x < width; x += 1)
    for (let y = 0; y < height; y += 1) cells.push([x, y] as Coord);
  const doorScenarios: readonly (readonly DoorDef[])[] = [
    [],
    [{ id: "d1", color: "red", tiles: [[0, 0] as Coord] }], // a door ON the player start
    [{ id: "d1", color: "red", tiles: [[1, 1] as Coord] }],
    [{ id: "d1", color: "blue", tiles: [[1, 1] as Coord] }],
  ];

  let boards = 0;
  let flaggedBoards = 0;
  const wallKinds = 4 ** cells.length;
  for (let code = 0; code < wallKinds; code += 1) {
    const phaseAWalls: Coord[] = [];
    const phaseBWalls: Coord[] = [];
    let rest = code;
    for (const cell of cells) {
      const kind = rest % 4;
      rest = Math.floor(rest / 4);
      if (kind === 1 || kind === 3) phaseAWalls.push(cell);
      if (kind === 2 || kind === 3) phaseBWalls.push(cell);
    }
    for (const doors of doorScenarios) {
      boards += 1;
      const level: Level = {
        id: 8000 + boards,
        width,
        height,
        startPhase: "A",
        player: [0, 0] as Coord,
        goal: [2, 2] as Coord,
        phaseAWalls,
        phaseBWalls,
        doors,
        switches: [],
        portals: [],
        par: 1,
      };
      if (solve(level).refusedThenEnteredTiles > 0) flaggedBoards += 1;
    }
  }

  console.log("");
  console.log(
    "  (b) exhaustive 3 × 3 sweep · every per-tile wall assignment (none / A / B / both) × 4 door scenarios",
  );
  console.log(
    "      (no door · red door on the player start · red door centre · blue door centre), player (0,0) → goal (2,2)",
  );
  console.log(
    `      boards=${boards}  shipped metric > 0: ${flaggedBoards}   (degenerate/invalid boards included on purpose)`,
  );
  if (flaggedBoards > 0) {
    theoremBroken = true;
    failures.push(
      `audit/exhaustive-3x3: ${flaggedBoards} doors-only boards flagged by the shipped metric`,
    );
  }

  // ── (d) positive control: the shipped metric MUST fire on a latch level ────
  console.log("");
  console.log(
    "  (d) positive control — the shipped metric on a latch level (M1 + M3), where it must fire",
  );
  const latch: Level = {
    id: 9500,
    width: 5,
    height: 5,
    startPhase: "A",
    player: [0, 0] as Coord,
    goal: [4, 4] as Coord,
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [{ id: "d1", color: "red", tiles: [[2, 0] as Coord] }],
    switches: [
      { id: "s1", tile: [1, 0] as Coord, activePhase: "A", targets: ["d1"] },
    ],
    portals: [],
    par: 1,
  };
  const latchGraph = explore(latch);
  const latchResult = analyse(latch, latchGraph);
  console.log(
    `      latch board: refusedThenEnteredTiles=${latchResult.refusedThenEnteredTiles} tiles=${formatTiles(latchResult.refusedThenEnteredTileList)} dualPhaseTiles=${latchResult.dualPhaseTiles} solvable=${latchResult.solvable}`,
  );
  if (latchResult.refusedThenEnteredTiles === 0) {
    failures.push(
      "audit/positive-control: the shipped metric did not fire on a latch level — measurement is broken",
    );
  } else {
    console.log(
      "      (the latch — not parity — is what makes the metric fire, so a 0 elsewhere is a real 0)",
    );
    console.log("      lattice / traces:");
    printLevelJson(latch);
    const latchClicks = explainClicks(
      latch,
      latchGraph,
      latchResult.refusedThenEnteredTileList[0] ?? "",
      tileKey,
    );
    console.log(
      `      observed for this tile: ${latchClicks.accepted} accepted click(s), ${latchClicks.refused} refused click(s) — the latch, not parity, makes the difference.`,
    );
  }

  // ── (e) minimal reproductions for the artifact probes that fire ────────────
  console.log("");
  console.log(
    "  (e) minimal reproductions (level JSON + BFS trajectories, state and phase shown)",
  );

  const openBoard: Level = {
    id: 9600,
    width: 3,
    height: 3,
    startPhase: "A",
    player: [0, 0] as Coord,
    goal: [2, 2] as Coord,
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [],
    switches: [],
    portals: [],
    par: 4,
  };
  console.log("");
  console.log(
    "      [e1] alias probe on the trivial open 3 × 3 board (no walls, no doors, no switches, no portals)",
  );
  printLevelJson(openBoard);
  const openGraph = explore(openBoard);
  const openResult = analyse(openBoard, openGraph);
  console.log(
    `      shipped metric: refusedThenEnteredTiles=${openResult.refusedThenEnteredTiles} dualPhaseTiles=${openResult.dualPhaseTiles} shortestSolution=${String(openResult.shortestSolution)}`,
  );
  const aliasKey = String(1 * openBoard.width + -1); // flat index of the out-of-bounds click (-1,1)
  console.log(
    `      alias probe key "${aliasKey}" (= flat index y*width+x of the out-of-bounds click (-1,1), i.e. tile (2,0)):`,
  );
  const aliasClicks = explainClicks(openBoard, openGraph, aliasKey, (clicked) =>
    String(clicked.y * openBoard.width + clicked.x),
  );
  console.log(
    `      observed for this key: ${aliasClicks.accepted} accepted click(s) and ${aliasClicks.refused} refused click(s) — the refusal is an OUT-OF-BOUNDS click, the acceptance is the unrelated in-bounds tile (2,0): the key, not the game, collided.`,
  );

  const startDoor: Level = {
    id: 9601,
    width: 3,
    height: 3,
    startPhase: "A",
    player: [0, 0] as Coord,
    goal: [2, 2] as Coord,
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [{ id: "d1", color: "red", tiles: [[0, 0] as Coord] }],
    switches: [],
    portals: [],
    par: 4,
  };
  console.log("");
  console.log(
    "      [e2] occupied-position probe: a door on the player start tile (doors-only; the validator only WARNS about this)",
  );
  printLevelJson(startDoor);
  const startDoorGraph = explore(startDoor);
  const startDoorResult = analyse(startDoor, startDoorGraph);
  console.log(
    `      shipped metric: refusedThenEnteredTiles=${startDoorResult.refusedThenEnteredTiles} (tiles=${formatTiles(startDoorResult.refusedThenEnteredTileList)}) dualPhaseTiles=${startDoorResult.dualPhaseTiles}`,
  );
  const startKey = tileKey({ x: 0, y: 0 });
  const startState = startDoorGraph.nodes[0];
  console.log(`      occupied-position probe key "${startKey}":`);
  if (startState !== undefined) {
    console.log(
      `      occupancy trace: the initial state already stands on it — moves=[<start>] → state(player=(${startState.player.x},${startState.player.y}) phase=${startState.phase} doorsOpen=${JSON.stringify(startState.doorsOpen)} switchesOn=${JSON.stringify(startState.switchesOn)}) — the tile is OCCUPIED, but no entry ever happened.`,
    );
  }
  const startClicks = explainClicks(
    startDoor,
    startDoorGraph,
    startKey,
    tileKey,
  );
  console.log(
    `      observed for this tile: ${startClicks.accepted} accepted click(s), ${startClicks.refused} refused click(s) ⇒ the probe's hit is "occupied first, refused later", i.e. the reverse of the claimed beat "refused first, entered later".`,
  );

  console.log("");
  console.log(
    theoremBroken
      ? "  RESULT: the shipped metric fired on a doors-only board — the invariant is BROKEN, escalate with the reproduction above."
      : "  RESULT: on doors-only boards the shipped metric is 0 everywhere (randomized + exhaustive); the invariant is intact and the metric is demonstrably live (positive control above),",
  );
  if (!theoremBroken) {
    console.log(
      "  so the GATE D '9/200 M1-alone' residue is a HARNESS-SIDE measurement artifact, not a hole in the theorem.",
    );
    console.log(
      "  Rate signature (the residue is 9/200 = 4.5%): a key-collision bug is class-blind — it fires on the majority of boards of",
    );
    console.log(
      "  EVERY class, so the same harness would have reported high rates for the M0 and M2/M3 classes too; it cannot produce a",
    );
    console.log(
      "  lone 4.5% residue. The only probe that fires rarely is 'occupied-position' — and it fires exactly on the boards counted",
    );
    console.log(
      "  in the census above: a door tile ON THE PLAYER START, closed in the phase that tile is clicked in. That construction is",
    );
    console.log(
      "  'occupied without ever being entered, then refused' — the opposite order to the claimed beat — and the shipped validator",
    );
    console.log(
      "  only WARNS about it (`src/core/level/index.ts`, door covers the player start), so a harness of that era could generate it freely.",
    );
    console.log(
      "  Not reproducible from the repo: the GATE D harness, its 200 boards and its metric code are out of repo (ADR-0009 Context)",
    );
    console.log(
      "  — the exact 9 boards cannot be named from here. What IS program-proven: the shipped metric reads 0 on doors-only content,",
    );
    console.log(
      "  the invariant is intact, and the only artifact whose rate can match the residue needs no theorem change at all.",
    );
  }
}

if (withAudit) audit();

console.log("");
if (failures.length > 0) {
  console.log(`RESULT: FAIL (${failures.length} problem(s))`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("RESULT: PASS");
  process.exitCode = 0;
}
