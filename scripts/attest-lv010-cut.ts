/**
 * `scripts/attest-lv010-cut.ts` — **LV-010 STEP 0**: the *cut* re-attestation.
 *
 * The LV-009-B pattern (`docs/ai-native-pipeline.md` §8.10 item 1) says: before a
 * dataset byte moves, re-derive every constant the task relies on from an
 * **isolated** byte-copy of the boards, with the program solver, and stop if a
 * single one diverges. The one thing the pattern cannot be copied verbatim is
 * *what* gets attested: LV-009-B attested boards that already existed in a dossier,
 * while an *authoring* ticket has no boards yet. So this harness attests the two
 * things that do exist and that every later step is filtered against:
 *
 *   1. **the CUT** — the published escalation floor `D_exec(L16) > D_exec(L15)`
 *      (`docs/level-design.md` §6.1.1 "Forward consequence, already forced";
 *      `docs/level-difficulty.md` §3.3/§3.4), including the par-admissibility
 *      bounds §6.1.1 publishes for the L16 author (`≥ 10` necessary, `≥ 12`
 *      sufficient for any measured `B`), and
 *   2. **the analyzer tooling** every candidate gate will be read from
 *      (`auditLevel`, `allOffShortestSolution`, `blockL1215Gates`,
 *      `analyseDifficulty`, `validateLevel`) — proved *live on the isolated set*
 *      before it is pointed at a new board.
 *
 * Law-first, never fitted:
 *   - every **published** number is typed once, in {@link LAW}, with its citation —
 *     it is the *law*, and the program is asked whether it still holds;
 *   - every **measured** number comes from the program running on the isolated
 *     copies (never from this file's constants, never from the repository path);
 *   - the difficulty weights and the whole `BLOCK_L1215_*` constant set are
 *     **imported** from `@/core/solver/*`, so no weight or bound is transcribed.
 *
 * Isolation: `src/levels/*.json` is byte-copied to a scratch directory OUTSIDE the
 * repository and each copy is proved `sha256 IDENTICAL` to its source **first**.
 * Every solver call in this run reads the scratch directory, so the verdicts are
 * about the copied bytes alone.
 *
 *   npx tsx scripts/attest-lv010-cut.ts            # scratch under $TMPDIR/opencode
 *   LV010_SCRATCH=/some/dir npx tsx scripts/attest-lv010-cut.ts
 *
 * Exit code is non-zero on any divergence from {@link LAW} — this is a gate, not
 * only a transcript.
 *
 * Ownership: `scripts/**` is Level AI + Solver's (`AGENTS.md` §4). This file edits
 * no level, no core module and no weight; it writes only into its scratch tree.
 */

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { explore } from "@/core/solver/bfs";
import { analyseDifficulty, DIFFICULTY_WEIGHTS } from "@/core/solver/difficulty";
import {
  BLOCK_L1215_IDS,
  allOffShortestSolution,
  auditLevel,
  blockL1215Gates,
} from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// 1. The law (typed once, each with its published citation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The **cut** the L16 ladder must clear, and the bounds §6.1.1 publishes for it.
 * Every entry is a *published* value: `docs/level-design.md` §6.1.1 / §3.3–§3.4,
 * `docs/level-difficulty.md` §5.2 / §3.5. The program is asked to reproduce each.
 */
const LAW = {
  /** Prior block peaks, published at 6 dp in `docs/level-difficulty.md` §5.2. */
  l10Dexec6: "13.642857",
  l11Dexec6: "8.573171",
  /** The cut itself — L15's measured `D_exec` (§6.1.1 "Forward consequence"). */
  l15Dexec6: "14.969697",
  l15Par: 10,
  /** ADR-design-0003 §5 / §6.1.3 G1, measured 2 on L12–L15. */
  l15LatchAdvantage: 2,
  /** §6.1.1 P2: "`B` is measured in [1.2500, 1.6875] on 11/11 shipped levels". */
  bBand: [1.25, 1.6875] as const,
  /** §2 V0.1 provisional weights (`docs/level-difficulty.md` §2). */
  weights: { L: 1, B: 3, T: 4, R: 2, M: 5 },
  /** §8.10 item 3's structure: 7 shared readers + the dip clause on the first member
   *  + the tail clause on the last (`blockL1215Gates`) ⇒ 8/7/7/8 by derivation. */
  blockGateCounts: [8, 7, 7, 8] as const,
  /**
   * Named discrepancy, recorded rather than smoothed: the LV-009-B commit message
   * (`c34e0d1`) and this ticket's dispatch prose read "L12–L15: 9/7 gates". The
   * program's per-member inventory is 8/7/7/8 (the 7 shared readers plus one
   * index-conditional clause on each end member) — the "9" is a reading of a
   * printed block, not a gate count. A commit message is a dated record and is not
   * edited by this role; the finding is printed in the transcript.
   */
  blockGateCountsProse: "9/7",
  /** §6.1.1 forward consequence, par admissibility for L16. */
  parNecessary: 10,
  parSufficient: 12,
} as const;

/** The schema's own field set — the *closed* mechanic vocabulary of ADR-0008/0009. */
const VOCABULARY_FIELDS: readonly string[] = Object.keys(
  (LevelSchema as unknown as { shape: Record<string, unknown> }).shape,
).sort();

// ─────────────────────────────────────────────────────────────────────────────
// 2. Isolation — byte-copies first, sha256 IDENTICAL required
// ─────────────────────────────────────────────────────────────────────────────

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

const sourceDir = join(process.cwd(), "src", "levels");
const scratchRoot =
  process.env["LV010_SCRATCH"] ?? join(tmpdir(), "opencode", "lv010-cut");
const isolatedDir = join(scratchRoot, "levels");
mkdirSync(isolatedDir, { recursive: true });

console.log("LV-010 STEP 0 — the CUT re-attestation (authoring law for L16+)");
console.log(`node ${process.version}`);
console.log(`source  : ${sourceDir}`);
console.log(`scratch : ${isolatedDir}  (OUTSIDE the repository — the set is judged alone)`);
console.log("");

const sourceFiles = readdirSync(sourceDir)
  .filter((name) => /^l\d+\.json$/.test(name))
  .sort();

const divergences: string[] = [];
const copies: string[] = [];

console.log("byte-identity of the isolated byte-copies (source sha256 vs copy sha256):");
for (const file of sourceFiles) {
  const sourceBytes = readFileSync(join(sourceDir, file));
  copyFileSync(join(sourceDir, file), join(isolatedDir, file));
  const copyBytes = readFileSync(join(isolatedDir, file));
  const a = sha256(sourceBytes);
  const b = sha256(copyBytes);
  const identical = a === b && sourceBytes.equals(copyBytes);
  if (!identical) divergences.push(`${file}: byte-copy DIVERGED (${a} vs ${b})`);
  copies.push(file);
  console.log(`  ${file}  ${a}  ${b}  ${identical ? "IDENTICAL" : "DIVERGED"}`);
}
console.log(`  ${String(copies.length)} file(s) copied; every solver read below uses this directory.`);
console.log("");

function readIsolated(file: string): Level {
  const raw: unknown = JSON.parse(readFileSync(join(isolatedDir, file), "utf8"));
  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`${file}: schema rejected the level (${parsed.error.message})`);
  }
  const verdict = validateLevel(parsed.data);
  if (!verdict.ok) {
    throw new Error(`${file}: the rule gate rejected the level (${verdict.errors.join("; ")})`);
  }
  return parsed.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. The isolated set, measured
// ─────────────────────────────────────────────────────────────────────────────

interface Measured {
  readonly file: string;
  readonly level: Level;
  readonly graph: ReachableGraph;
  readonly dexec: number;
  readonly b: number;
  readonly par: number;
  readonly allOff: number | null;
  readonly gates: readonly string[];
  readonly gatesPass: number;
}

const measured: Measured[] = [];

for (const file of copies) {
  const level = readIsolated(file);
  const graph = explore(level);
  const audit = auditLevel(level, graph);
  const difficulty = analyseDifficulty(level, graph);
  const gates = blockL1215Gates(level, graph, audit.result, audit.embeds);
  const allOff = allOffShortestSolution(level, graph);
  const dexec = difficulty.Dexec;

  if (dexec === null) {
    divergences.push(`${file}: no D_exec (unsolvable) — the curve has no position for it`);
    continue;
  }
  measured.push({
    file,
    level,
    graph,
    dexec,
    b: difficulty.B,
    par: audit.result.shortestSolution ?? level.par,
    allOff,
    gates: gates.map((g) => `${g.id}:${g.status}`),
    gatesPass: gates.filter((g) => g.status === "PASS").length,
  });

  console.log(
    `${file}  id=${String(level.id)}  board=${String(level.width)}x${String(level.height)}  ` +
      `par=${String(level.par)} shortest=${String(audit.result.shortestSolution)}`,
  );
  console.log(
    `  D_exec=${dexec.toFixed(6)} (D=${String(difficulty.D === null ? "n/a" : difficulty.D.toFixed(6))} ` +
      `L=${String(difficulty.L)} B=${difficulty.B.toFixed(6)} T=${String(difficulty.T)} R=${String(difficulty.R)} M=${String(difficulty.M)})`,
  );
  console.log(
    `  §4 region: deadStates=${String(audit.result.deadStates)} noUnrecoverableOk=${String(audit.result.noUnrecoverableOk)} ` +
      `coverage=${String(audit.result.distinctPositions)}/${String(level.width * level.height)} ` +
      `dualPhaseTiles=${String(audit.result.dualPhaseTiles)} refusedBeforeEntered=${String(audit.result.refusedBeforeEnteredTiles)}`,
  );
  console.log(
    `  latch: allOffGoalReachable=${String(audit.allOffGoalReachable)} allOffShortest=${allOff === null ? "null" : String(allOff)} ` +
      `allOffShortest-par=${allOff === null ? "n/a" : String(allOff - (audit.result.shortestSolution ?? level.par))}`,
  );
  console.log(
    `  validator=${validateLevel(level).ok ? "ok" : "REJECTED"} policyViolations=${String(audit.violations.length)} ` +
      `blockGates=${String(gates.length)} allPass=${String(gates.every((g) => g.status === "PASS"))}`,
  );
  console.log("");
}

const byId = (id: number): Measured | undefined =>
  measured.find((m) => m.level.id === id);
const d6 = (id: number): string =>
  (byId(id)?.dexec ?? Number.NaN).toFixed(6);

// ─────────────────────────────────────────────────────────────────────────────
// 4. The CUT and the prior peaks — law vs program
// ─────────────────────────────────────────────────────────────────────────────

const l15 = byId(15);
const l11 = byId(11);
const l10 = byId(10);
const floor = l15?.dexec ?? Number.NaN;
const l15Advantage = l15 === undefined || l15.allOff === null ? null : l15.allOff - l15.par;
const bMin = Math.min(...measured.map((m) => m.b));
const bMax = Math.max(...measured.map((m) => m.b));
const priorPeak = Math.max(...measured.filter((m) => m.level.id <= 15).map((m) => m.dexec));

const cutChecks: [string, boolean, string][] = [
  [
    `CUT L15 D_exec = ${LAW.l15Dexec6} (§6.1.1)`,
    l15?.dexec.toFixed(6) === LAW.l15Dexec6,
    `${floor.toFixed(6)} vs law ${LAW.l15Dexec6}`,
  ],
  ["L15 par 10 (§5.2)", l15?.par === LAW.l15Par, `${String(l15?.par)} vs law ${String(LAW.l15Par)}`],
  [
    `L15 latch advantage ${String(LAW.l15LatchAdvantage)} (ADR-design-0003 §5 / G1)`,
    l15Advantage === LAW.l15LatchAdvantage,
    `${l15Advantage === null ? "null" : String(l15Advantage)} vs law ${String(LAW.l15LatchAdvantage)}`,
  ],
  [
    `L11 D_exec = ${LAW.l11Dexec6} (§5.2, the previous dip ceiling)`,
    l11?.dexec.toFixed(6) === LAW.l11Dexec6,
    `${d6(11)} vs law ${LAW.l11Dexec6}`,
  ],
  [
    `L10 D_exec = ${LAW.l10Dexec6} (§5.2, the L6-block peak)`,
    l10?.dexec.toFixed(6) === LAW.l10Dexec6,
    `${d6(10)} vs law ${LAW.l10Dexec6}`,
  ],
  [
    `B band [${LAW.bBand.join(", ")}] (§6.1.1 P2) is reproduced by the isolated set`,
    bMin === LAW.bBand[0] && bMax === LAW.bBand[1],
    `measured [${bMin.toFixed(4)}, ${bMax.toFixed(4)}] vs law [${LAW.bBand.join(", ")}]`,
  ],
  [
    "weights are §2 V0.1 (imported live, not transcribed)",
    JSON.stringify(DIFFICULTY_WEIGHTS) === JSON.stringify(LAW.weights),
    `${JSON.stringify(DIFFICULTY_WEIGHTS)} vs law ${JSON.stringify(LAW.weights)}`,
  ],
  [
    "the floor is the maximum D_exec over the whole prior set (no prior level sits above it)",
    priorPeak === floor,
    `max over L1-L15 = ${priorPeak.toFixed(6)} vs L15 ${floor.toFixed(6)}`,
  ],
  [
    "the block law is not re-purposed: BLOCK_L1215_IDS covers exactly L12-L15",
    JSON.stringify([...BLOCK_L1215_IDS]) === JSON.stringify([12, 13, 14, 15]),
    `BLOCK_L1215_IDS=[${BLOCK_L1215_IDS.join(", ")}]`,
  ],
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. The mechanic vocabulary is CLOSED (ADR-0008 / ADR-0009 only)
// ─────────────────────────────────────────────────────────────────────────────

console.log(`vocabulary: the frozen schema's own field set = [${VOCABULARY_FIELDS.join(", ")}]`);
let unknownKeys = 0;
for (const file of copies) {
  const raw = JSON.parse(readFileSync(join(isolatedDir, file), "utf8")) as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (!VOCABULARY_FIELDS.includes(key)) {
      unknownKeys += 1;
      console.log(`  ${file}: UNKNOWN FIELD "${key}" — outside the closed vocabulary`);
    }
  }
}
console.log(
  `  unknown fields across ${String(copies.length)} file(s): ${String(unknownKeys)} ` +
    `(schema is a strictObject, so any new mechanic field is already a hard REJECT)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 6. The analyzer tooling, proved live on the isolated set
// ─────────────────────────────────────────────────────────────────────────────

console.log("— analyzer tooling on the isolated set (the readers every candidate gate reuses) —");
const blockCounts = [12, 13, 14, 15].map((id) => byId(id)?.gates.length ?? -1);
const blockAllPass = [12, 13, 14, 15].every((id) => {
  const m = byId(id);
  return m !== undefined && m.gatesPass === m.gates.length;
});
cutChecks.push([
  `blockL1215Gates live: L12-L15 carry ${LAW.blockGateCounts.join("/")} gates (7 shared readers + the dip clause first + the tail clause last), all PASS (§8.10 item 3)`,
  JSON.stringify(blockCounts) === JSON.stringify([...LAW.blockGateCounts]) && blockAllPass,
  `measured ${blockCounts.join("/")} · derived ${LAW.blockGateCounts.join("/")} · allPass=${String(blockAllPass)}`,
]);
console.log(
  `  prose discrepancy recorded: the LV-009-B commit message reads "${LAW.blockGateCountsProse} gates"; ` +
    `the program's per-member inventory is ${blockCounts.join("/")} (7 shared + dip on the first + tail on the last).`,
);
for (const id of [12, 13, 14, 15]) {
  const m = byId(id);
  console.log(
    `  L${String(id)}: ${String(m?.gatesPass ?? 0)}/${String(m?.gates.length ?? 0)} PASS — ${(m?.gates ?? []).join(" ")}`,
  );
}
const sharedReaders = measured.filter((m) => m.level.id >= 12 && m.level.id <= 15);
const orderedAgrees = sharedReaders.filter((m) => {
  const audit = auditLevel(m.level, m.graph);
  return (
    audit.result.refusedThenEnteredTiles === audit.result.refusedBeforeEnteredTiles &&
    audit.result.refusedThenEnteredTileList.join("|") ===
      audit.result.refusedBeforeEnteredTileList.join("|")
  );
}).length;
cutChecks.push([
  "the ordered/unordered refusal readers agree on L12-L15 (ADR-design-0002: the promotion trigger stays unfired)",
  orderedAgrees === sharedReaders.length,
  `${String(orderedAgrees)}/${String(sharedReaders.length)} identical tile lists`,
]);
console.log(
  `  ordered vs unordered refusal reader: identical on ${String(orderedAgrees)}/${String(sharedReaders.length)} of L12-L15`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 7. The par admissibility of L16 — §6.1.1's forward consequence, recomputed
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  `— the CUT and the admissibility of a par rung (§6.1.1 "Forward consequence, already forced") —`,
);
console.log(
  `  floor = max D_exec over the prior set = ${floor.toFixed(6)} (L15, re-derived above)`,
);
console.log(
  `  measured B band ⇒ 3·B ∈ [${(3 * bMin).toFixed(4)}, ${(3 * bMax).toFixed(4)}], spread ${(3 * (bMax - bMin)).toFixed(4)}`,
);
const thresholds = new Map<number, number>();
for (const par of [9, 10, 11, 12]) {
  const worst = par + 3 * bMin;
  const best = par + 3 * bMax;
  const threshold = (floor - par) / 3;
  thresholds.set(par, threshold);
  const verdict =
    worst > floor
      ? "admissible for ANY B in band"
      : best <= floor
        ? "INADMISSIBLE for every B in band"
        : `admissible only if B > ${threshold.toFixed(6)}`;
  console.log(
    `  par ${String(par)}: min D_exec ${worst.toFixed(6)} · max D_exec ${best.toFixed(6)} ⇒ ${verdict}`,
  );
}
cutChecks.push([
  `par ${String(LAW.parNecessary - 1)} cannot clear the cut for any measured B (§6.1.1 necessary bound)`,
  (LAW.parNecessary - 1) + 3 * bMax <= floor,
  `par ${String(LAW.parNecessary - 1)} max D_exec ${((LAW.parNecessary - 1) + 3 * bMax).toFixed(6)} <= ${floor.toFixed(6)}`,
]);
cutChecks.push([
  `par ${String(LAW.parSufficient)} clears the cut for any measured B (§6.1.1 sufficient bound)`,
  LAW.parSufficient + 3 * bMin > floor,
  `par ${String(LAW.parSufficient)} min D_exec ${(LAW.parSufficient + 3 * bMin).toFixed(6)} > ${floor.toFixed(6)}`,
]);
cutChecks.push([
  "the two published L16 par thresholds are reproduced by the program arithmetic",
  (thresholds.get(10) ?? 0).toFixed(6) === "1.656566" &&
    (thresholds.get(11) ?? 0).toFixed(6) === "1.323232",
  `B > ${(thresholds.get(10) ?? 0).toFixed(6)} (par 10) · B > ${(thresholds.get(11) ?? 0).toFixed(6)} (par 11)`,
]);
console.log(
  `  published thresholds reproduced: par 10 needs B > ${(thresholds.get(10) ?? 0).toFixed(6)}, ` +
    `par 11 needs B > ${(thresholds.get(11) ?? 0).toFixed(6)}`,
);
console.log("");
console.log("— §4 acceptance region over the isolated set (the region a candidate must live in) —");
const region = measured.filter((m) => {
  const a = auditLevel(m.level, m.graph);
  return a.result.deadStates === 0 && a.result.noUnrecoverableOk;
});
console.log(
  `  ${String(region.length)}/${String(measured.length)} boards: deadStates 0 AND noUnrecoverableOk`,
);
let tZero = 0;
let rZero = 0;
for (const m of measured) {
  const a = analyseDifficulty(m.level, m.graph);
  if (a.T === 0) tZero += 1;
  if (a.R === 0) rZero += 1;
}
console.log(
  `  T ≡ 0 on ${String(tZero)}/${String(measured.length)} · R ≡ 0 on ${String(rZero)}/${String(measured.length)} ` +
    `(§5.2's theorem: inside §4, D_exec = L + 3·B and w3/w4 are inert)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 8. Verdict
// ─────────────────────────────────────────────────────────────────────────────

console.log("— law checks —");
for (const [name, ok, detail] of cutChecks) {
  console.log(`  ${ok ? "MATCH     " : "DIVERGENCE"} ${name} — ${detail}`);
  if (!ok) divergences.push(`${name}: ${detail}`);
}
console.log("");

if (divergences.length > 0) {
  console.log(`RESULT: STOP_AND_ROUTE — ${String(divergences.length)} divergence(s):`);
  for (const d of divergences) console.log(`  - ${d}`);
  process.exit(1);
}
console.log(
  `RESULT: LAW-MATCH — the cut (D_exec > ${floor.toFixed(6)}), the par-admissibility bounds and every ` +
    "analyzer constant are reproduced by the program solver on the isolated byte-copies.",
);
console.log(
  "The law is re-attested; authoring of the L16+ candidates may proceed, against these numbers and no others.",
);