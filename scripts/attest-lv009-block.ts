/**
 * `scripts/attest-lv009-block.ts` — LV-009-B **STEP 0**: the law re-attestation the
 * ADR-design-0003 §8 handoff demands *before* a single dataset byte moves.
 *
 * What it is: a **law-first** attester. The constants below are typed from
 * `docs/decisions/design-0003-l1215-block-law.md` (§3 ruling Q1, §4 ruling Q2,
 * §5 ruling Q3, §6 verdict tables, §8 pre-registered acceptance law) and the
 * published bound is **imported** from `@/core/solver/policy` rather than
 * transcribed. Nothing here is fitted: the harness only prints what the **program
 * solver** measures and compares it to the numbers law published *before* the
 * candidates existed. A divergence is a STOP-AND-ROUTE event (`AGENTS.md` §7 —
 * LLM opinion never replaces the Solver; ADR-0004 — reject, never repair).
 *
 * Every printed quantity is a solver read-out:
 *   - `solvable` / `shortestSolution` / `parMatch` — BFS over the shipped
 *     `applyMove` (`@/core/solver/bfs`), one truth source;
 *   - `D_exec` / `T` / `R` / `coverage` / `dualPhaseTiles` / `refusedBeforeEntered`
 *     — `analyseDifficulty` + `analyse` via `auditLevel`;
 *   - `portalFree` — the **same board with `portals: []`** solved again (the
 *     below-OFFERED probe, `@/core/solver/policy`);
 *   - `allOffShortest` — a **restricted** BFS over the reachable graph, walking
 *     only through nodes in which every switch is OFF. Note *why* a second walk
 *     is needed instead of reading `graph.depths`: a depth taken from the full
 *     graph may sit on a path that presses a switch, so it is not a distance in
 *     the all-OFF world. `allOffShortest − par` is the G1 measurement.
 *
 * Usage (the levels dir may be outside the repository — that is the point: the
 * candidates are attested **as an isolated dataset** before they ship):
 *
 *   npx tsx scripts/attest-lv009-block.ts <levels-dir>
 *
 * Exit code is non-zero when any printed value diverges from the law, so this can
 * be used as a gate and not only as a transcript.
 *
 * Ownership: `scripts/**` is Level AI + Solver's. This file edits no level, no
 * solver policy and no weight (`AGENTS.md` §4).
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import {
  allSwitchesOff,
  explore,
  goalReachableWithAllSwitchesOff,
  solve,
} from "@/core/solver/bfs";
import { PORTAL_DEBUT_EXEC_BUDGET, auditLevel } from "@/core/solver/policy";
import { isGoal } from "@/core/state/transitions";

/**
 * The law, as published in ADR-design-0003 **before** integration:
 * §3 (Q1: the unique P1∧P2∧P3 ramp ⇒ 4/6/8/10), §4 (Q2: L12 owns the dip's
 * successor slot, so `D_exec(L12) < D_exec(L11)`), §5 (Q3/G1:
 * `allOffShortest − par = 2`, never `< 1`), §6 (per-board verdict tables: coverage,
 * `T ≡ R ≡ 0`, `deadStates 0`, `dualPhaseTiles`, ordered refusals, `portalFree`
 * escalation) and §8 item 5 (the machine-checkable acceptance law for this ticket).
 */
interface LawRow {
  readonly id: number;
  /** Board shape, §6 verdict tables. */
  readonly board: readonly [number, number];
  /** C1 / P1·P2·P3 — the derived ramp, `par == shortestSolution`. */
  readonly par: number;
  /** §6 `D_exec` at 6 dp (the published precision of the ADR table). */
  readonly dexec6: string;
  /** C2 / P4 — `distinctPositions == width × height`. */
  readonly coverage: number;
  /** C6 — `T ≡ R ≡ 0`. */
  readonly t: number;
  readonly r: number;
  /** C6 — `deadStates 0`, `noUnrecoverableOk true`. */
  readonly deadStates: number;
  /** C7 / G1 — `allOffShortest − par`, measured 2 on every board. */
  readonly latchAdvantage: number;
  /** C10 — `dualPhaseTiles ≥ 1`. */
  readonly dualPhaseTiles: number;
  /** C9 / G3 — the **ordered** reader (gate (iii)). */
  readonly refusedBeforeEntered: number;
  /** C14 — the portal-load escalation: `true` on L12, `false` from L13 up. */
  readonly portalFree: boolean;
}

const LAW: readonly LawRow[] = [
  {
    id: 12,
    board: [7, 3],
    par: 4,
    dexec6: "8.230769",
    coverage: 21,
    t: 0,
    r: 0,
    deadStates: 0,
    latchAdvantage: 2,
    dualPhaseTiles: 19,
    refusedBeforeEntered: 3,
    portalFree: true,
  },
  {
    id: 13,
    board: [6, 4],
    par: 6,
    dexec6: "10.898734",
    coverage: 24,
    t: 0,
    r: 0,
    deadStates: 0,
    latchAdvantage: 2,
    dualPhaseTiles: 16,
    refusedBeforeEntered: 5,
    portalFree: false,
  },
  {
    id: 14,
    board: [7, 4],
    par: 8,
    dexec6: "12.957895",
    coverage: 28,
    t: 0,
    r: 0,
    deadStates: 0,
    latchAdvantage: 2,
    dualPhaseTiles: 20,
    refusedBeforeEntered: 5,
    portalFree: false,
  },
  {
    id: 15,
    board: [7, 5],
    par: 10,
    dexec6: "14.969697",
    coverage: 35,
    t: 0,
    r: 0,
    deadStates: 0,
    latchAdvantage: 2,
    dualPhaseTiles: 15,
    refusedBeforeEntered: 6,
    portalFree: false,
  },
];

/** The shipped L11's measured `D_exec`, the dip ceiling — re-audited live, then checked. */
const L11_PUBLISHED_DEXEC6 = "8.573171";

/**
 * The **all-OFF shortest solution**: BFS over the reachable graph, walking only
 * nodes in which every switch is OFF (`allSwitchesOff`). `null` when the all-OFF
 * world cannot reach the goal at all (then G1's `≥ 1` is trivially met — but the
 * block's boards all solve all-OFF, `allOffGoalReachable = true`).
 */
function allOffShortest(level: Level, graph: ReachableGraph): number | null {
  const start = graph.nodes[0];
  if (start === undefined || !allSwitchesOff(level, start)) {
    // The graph's node 0 is the initial state; the initial state has every switch
    // OFF by construction (`initialState`), so this is a structural check only.
    return null;
  }
  const depth = new Map<number, number>([[0, 0]]);
  const queue: number[] = [0];
  for (let q = 0; q < queue.length; q += 1) {
    const i = queue[q] as number;
    const node = graph.nodes[i];
    if (node === undefined) continue;
    if (isGoal(level, node)) return depth.get(i) ?? null;
    for (const j of graph.edgesOut[i] as readonly number[]) {
      const next = graph.nodes[j];
      if (next === undefined || depth.has(j)) continue;
      if (!allSwitchesOff(level, next)) continue;
      depth.set(j, (depth.get(i) ?? 0) + 1);
      queue.push(j);
    }
  }
  return null;
}

function readLevel(path: string): Level {
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`${path}: schema rejected the level (${parsed.error.message})`);
  }
  const verdict = validateLevel(parsed.data);
  if (!verdict.ok) {
    throw new Error(
      `${path}: the rule gate rejected the level (${verdict.errors.join("; ")})`,
    );
  }
  return parsed.data;
}

const dir = process.argv[2] ?? "src/levels";

console.log("LV-009-B STEP 0 — law re-attestation (ADR-design-0003 §8)");
console.log(`node ${process.version} · levels dir: ${dir}`);
console.log(
  `published bound imported live: PORTAL_DEBUT_EXEC_BUDGET = ${String(PORTAL_DEBUT_EXEC_BUDGET)} (@/core/solver/policy)`,
);

// ── the dip ceiling, re-audited LIVE from the shipped L11 (never transcribed) ──
const l11Path = join("src/levels", "l011.json");
const l11 = readLevel(l11Path);
const l11Audit = auditLevel(l11);
const l11Dexec = l11Audit.difficulty.Dexec;
console.log(
  `L11 re-audit (${l11Path}): par=${String(l11.par)} solvable=${String(l11Audit.result.solvable)} ` +
    `Dexec=${l11Dexec === null ? "n/a" : l11Dexec.toFixed(6)} dualPhaseTiles=${String(l11Audit.result.dualPhaseTiles)} ` +
    `refusedBeforeEnteredTiles=${String(l11Audit.result.refusedBeforeEnteredTiles)}`,
);
if (l11Dexec === null) {
  console.log("LAW-DIVERGENCE: the shipped L11 has no D_exec — the dip ceiling cannot be read.");
  process.exit(1);
}
const dipCeiling = l11Dexec;
console.log(
  `dip ceiling: shipped L11 D_exec = ${dipCeiling.toFixed(6)} (ADR-design-0003 §4 publishes ${L11_PUBLISHED_DEXEC6})`,
);
console.log("");

const files = readdirSync(dir)
  .filter((name) => /^l\d+\.json$/.test(name))
  .sort();
if (files.length === 0) {
  console.log(`no level files in ${dir}`);
  process.exit(1);
}

const divergences: string[] = [];
const measured = new Map<number, number>();
const measuredPars = new Map<number, number>();
const orderedReaderAgrees = new Map<number, boolean>();

for (const file of files) {
  const level = readLevel(join(dir, file));
  const graph = explore(level);
  const audit = auditLevel(level, graph);
  const result = audit.result;
  const add = audit.difficulty;
  const par = result.shortestSolution ?? level.par;
  const advantage = allOffShortest(level, graph);
  const portalFreeWorld = solve({ ...level, portals: [] });
  const allOffGoalReachable = goalReachableWithAllSwitchesOff(level, graph);
  const law = LAW.find((row) => row.id === level.id) ?? null;

  measured.set(level.id, add.Dexec ?? Number.NaN);
  measuredPars.set(level.id, par);
  orderedReaderAgrees.set(
    level.id,
    result.refusedThenEnteredTiles === result.refusedBeforeEnteredTiles &&
      result.refusedThenEnteredTileList.join("|") ===
        result.refusedBeforeEnteredTileList.join("|"),
  );

  console.log(
    `${file}  id=${level.id}  board=${level.width}x${level.height}  startPhase=${level.startPhase}`,
  );
  console.log(
    `  solvable=${String(result.solvable)} par=${level.par} shortestSolution=${String(result.shortestSolution)} parMatch=${String(result.shortestSolution === level.par)}`,
  );
  console.log(
    `  D_exec=${add.Dexec === null ? "n/a" : add.Dexec.toFixed(6)} (D=${add.D === null ? "n/a" : add.D.toFixed(6)}, L=${String(add.L)}, B=${add.B.toFixed(6)}, M=${String(add.M)})`,
  );
  console.log(
    `  T=${add.T} R=${add.R} deadStates=${result.deadStates} noUnrecoverableOk=${String(result.noUnrecoverableOk)}`,
  );
  console.log(
    `  coverage distinctPositions=${result.distinctPositions} of ${level.width * level.height} (P4 ${result.distinctPositions === level.width * level.height ? "holds" : "VIOLATED"})`,
  );
  console.log(
    `  portalFree solvable=${String(portalFreeWorld.solvable)} shortest=${portalFreeWorld.shortestSolution === null ? "null" : String(portalFreeWorld.shortestSolution)} (walk-only world ${portalFreeWorld.solvable ? "SATISFIABLE" : "UNSATISFIABLE"})`,
  );
  console.log(
    `  latch allOffGoalReachable=${String(allOffGoalReachable)} allOffShortest=${advantage === null ? "null" : String(advantage)} allOffShortest-par=${advantage === null ? "n/a" : String(advantage - par)} (G1)`,
  );
  console.log(
    `  dualPhaseTiles=${result.dualPhaseTiles} refusedThenEnteredTiles=${result.refusedThenEnteredTiles} refusedBeforeEnteredTiles=${result.refusedBeforeEnteredTiles}`,
  );
  console.log(
    `  parRoutes=${audit.embeds.parRoutes} embedRoutes=${audit.embeds.embedRoutes} embedForced=${String(audit.embeds.embedForced)} validator=${validateLevel(level).ok ? "ok" : "REJECTED"} solverPolicyViolations=${audit.violations.length}`,
  );

  if (law === null) {
    console.log("  LAW: no ADR-design-0003 row for this id (the attester covers L12–L15)");
    console.log("");
    continue;
  }

  const checks: readonly [string, boolean, string][] = [
    [
      "C1 par",
      par === law.par && level.par === law.par,
      `law ${law.par} vs measured ${String(par)}/${String(level.par)}`,
    ],
    [
      "C2 coverage",
      result.distinctPositions === law.coverage &&
        result.distinctPositions === level.width * level.height,
      `law ${law.coverage} of ${law.board[0] * law.board[1]} vs ${result.distinctPositions} of ${level.width * level.height}`,
    ],
    ["C6 T", add.T === law.t, `law ${law.t} vs ${String(add.T)}`],
    ["C6 R", add.R === law.r, `law ${law.r} vs ${String(add.R)}`],
    [
      "C6 deadStates",
      result.deadStates === law.deadStates,
      `law ${law.deadStates} vs ${String(result.deadStates)}`,
    ],
    [
      "C6 noUnrecoverableOk",
      result.noUnrecoverableOk,
      `law true vs ${String(result.noUnrecoverableOk)}`,
    ],
    [
      "C7 G1 latch advantage",
      advantage !== null && advantage - par === law.latchAdvantage,
      `law ${law.latchAdvantage} vs ${advantage === null ? "null" : String(advantage - par)}`,
    ],
    [
      "C10 dualPhaseTiles",
      result.dualPhaseTiles === law.dualPhaseTiles,
      `law ${law.dualPhaseTiles} vs ${String(result.dualPhaseTiles)}`,
    ],
    [
      "C9 G3 refusedBeforeEntered",
      result.refusedBeforeEnteredTiles === law.refusedBeforeEntered,
      `law ${law.refusedBeforeEntered} vs ${String(result.refusedBeforeEnteredTiles)}`,
    ],
    [
      "C14 portalFree",
      portalFreeWorld.solvable === law.portalFree,
      `law ${String(law.portalFree)} vs ${String(portalFreeWorld.solvable)}`,
    ],
    [
      "§6 D_exec at 6 dp",
      add.Dexec !== null && add.Dexec.toFixed(6) === law.dexec6,
      `law ${law.dexec6} vs ${add.Dexec === null ? "n/a" : add.Dexec.toFixed(6)}`,
    ],
    [
      "§6 board",
      level.width === law.board[0] && level.height === law.board[1],
      `law ${law.board.join("x")} vs ${level.width}x${level.height}`,
    ],
    [
      "C4 dip ceiling (L12 only)",
      level.id !== 12 || (add.Dexec ?? Number.POSITIVE_INFINITY) < dipCeiling,
      `D_exec ${add.Dexec === null ? "n/a" : add.Dexec.toFixed(6)} vs live L11 ${dipCeiling.toFixed(6)}`,
    ],
  ];
  for (const [name, ok, detail] of checks) {
    if (!ok) divergences.push(`${file} ${name}: ${detail}`);
  }
  const failed = checks.filter(([, ok]) => !ok);
  console.log(
    `  LAW (ADR-design-0003): ${failed.length === 0 ? "MATCH" : `DIVERGENCE on ${failed.map(([n]) => n).join(", ")}`}`,
  );
  console.log("");
}

// ── the block clauses that are properties of the SET, not of one board ────────
const ramp = [12, 13, 14, 15];
const rampValues = ramp.map((id) => measured.get(id) ?? Number.NaN);
const tail = rampValues[3] ?? Number.NaN;

const blockClauses: readonly [string, boolean, string][] = [
  [
    "C3 strictly increasing from L12",
    rampValues.every(
      (value, i) => i === 0 || (value > (rampValues[i - 1] as number)),
    ),
    rampValues.map((v, i) => `${String(ramp[i])}:${v.toFixed(6)}`).join(" < "),
  ],
  [
    "C4 two-beat dip: D_exec(L12) < D_exec(L11)",
    (rampValues[0] as number) < dipCeiling,
    `${(rampValues[0] as number).toFixed(6)} vs live L11 ${dipCeiling.toFixed(6)}`,
  ],
  [
    "C5 block-end clause: D_exec(L15) > 13.64 and > 13.642857 (L10's measured peak)",
    tail > PORTAL_DEBUT_EXEC_BUDGET && tail > 13.642857,
    `${tail.toFixed(6)} vs bound ${String(PORTAL_DEBUT_EXEC_BUDGET)} / 13.642857`,
  ],
  [
    "C9 STOP-and-route guard: ordered refusal reader == unordered on 4/4",
    ramp.every((id) => orderedReaderAgrees.get(id) === true),
    ramp.map((id) => `${String(id)}:${String(orderedReaderAgrees.get(id))}`).join(" "),
  ],
  [
    "P2/P3 the ramp is the unique admissible shape (4 + 2·3 = 10 = ceiling)",
    ramp.every((id, i) => measuredPars.get(id) === 4 + 2 * i),
    ramp.map((id) => `${String(id)}:par ${String(measuredPars.get(id))}`).join(" / "),
  ],
];

console.log("— block clauses (the set, not one board) —");
for (const [name, ok, detail] of blockClauses) {
  console.log(`  ${ok ? "MATCH     " : "DIVERGENCE"} ${name} — ${detail}`);
  if (!ok) divergences.push(`block clause ${name}: ${detail}`);
}

console.log("");
if (divergences.length > 0) {
  console.log(
    `RESULT: STOP_AND_ROUTE — ${String(divergences.length)} divergence(s) from ADR-design-0003:`,
  );
  for (const d of divergences) console.log(`  - ${d}`);
  process.exit(1);
}
console.log(
  "RESULT: LAW-MATCH — every ADR-design-0003 §3–§6 constant reproduced by the program solver.",
);
console.log(
  "The law is re-attested on the isolated dataset; integration may proceed.",
);