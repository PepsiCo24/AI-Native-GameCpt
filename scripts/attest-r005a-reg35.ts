/**
 * `scripts/attest-r005a-reg35.ts` — **R-005a**: the registration re-attestation for **Act II
 * batches 2 + 3** (`l026`–`l035`, LV-014 / LV-015) and the **moved** act-scale tail law
 * (`docs/level-design.md` §7.3 / §7.3.1 / §7.9).
 *
 * R-004a's instrument, one registration later, and the order is the same because the *reason*
 * is the same: a registration is a **byte-copy, never an edit**, and the law moves only after
 * the root bytes have been re-measured.
 *
 *   [1/6] **byte identity** — each new root file is `git`-hashed **and** `sha256`-hashed and
 *        compared with the shelf it was copied from at the dispatch base. A check that cannot
 *        run (git cannot answer) is a FAILURE, never a skip. The shelf is *also* read: it must
 *        now be **empty of level files**, because this registration MOVED the ten rungs rather
 *        than copying them (a shelf still holding them means the move silently became a copy).
 *   [2/6] **the ten registered rows, re-measured on the ROOT bytes** — par (solver-stamped),
 *        `D_exec`, `B`, coverage, the all-OFF world, `T`/`R`, and the audit's violation list,
 *        each against `ACT_II_B2_B3_LADDER` (`@/core/solver/policy`, the law) and not against a
 *        note — **plus the family-gate proof at the root**, taken as
 *        `scripts/prove-candidate.ts`'s own stdout (its per-rung **13/13 controls by name** and
 *        its measured `LADDER RESULT`). A control table re-implemented here would be a statement
 *        about *this file* instead of about the proof.
 *   [3/6] **§7.3's act-scale tail law** — the act peaks and the ten rows are **measured** and fed
 *        to `actScaleTailGuards`, which reports **eleven** clauses. R-004a owns six of them
 *        (`scripts/attest-r004a-act2.ts`); the five this file owns are named here.
 *   [4/6] **anti-tautology controls, one per R-005a clause** — a single-row restamp of the
 *        registered table, a restamped *measured* row, a relabelled tail, a restamped
 *        pre-registration standard, a narrowed `D_exec` ceiling, and a restamped seam. Each must
 *        FAIL **its own clause** by name, and the registered reading must PASS all eleven.
 *   [5/6] **the §7.3.1 seams and the sawtooth, probed in both directions** — the registered drops
 *        pass the clause (so "cross-batch monotony" is falsified by measurement, not by prose),
 *        an out-of-band seam FAILs, a measurement that omits a registered rung FAILs, and *every
 *        adjacent drop in the registered act is one of the two named instances* — which is how an
 *        **unnamed** relief is caught even though the clause judges only the law's own pairs.
 *   [6/6] **the labels and the constants** — the published `ΔD_exec` of both instances derived
 *        from the registered bytes, the **verbatim** label anchors (§7.3.1 instance 2 / instance 3,
 *        GD-010 / GD-011), §7.9's notation law read on the labels themselves (printed form in
 *        instance 2, derived-exact **with** the printed form in parentheses in instance 3), the
 *        tail/pre-standard/headroom arithmetic, and the five R-004a-era rungs shown **un-restamped**.
 *
 * `STOP_AND_ROUTE` (exit 1) is the only honest answer to a disagreement: the registered bytes are
 * immutable and are never re-authored to fit a later reading (ADR-0004).
 *
 *   npx tsx scripts/attest-r005a-reg35.ts
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Level } from "@/core/level";
import { LevelSchema } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore } from "@/core/solver/bfs";
import type { ActScaleLawReading, ActTailClauseId, GateStatus } from "@/core/solver/policy";
import {
  ACT_I_REGISTERED_PEAK_EXEC,
  ACT_II_B1_IDS,
  ACT_II_B1_LADDER,
  ACT_II_B2_B3_LADDER,
  ACT_II_B2_IDS,
  ACT_II_B2_SEAM_RELIEF,
  ACT_II_B3_IDS,
  ACT_II_B3_SEAM_RELIEF,
  ACT_II_B_BAND,
  ACT_II_EXEC_BAND,
  ACT_II_PAR_CEILING,
  ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC,
  ACT_II_PRE_R005A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_REGISTERED_IDS,
  ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
  ACT_II_R005A_REGISTERED_TAIL_EXEC,
  ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_R005A_TAIL_ADVANTAGE,
  ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING,
  ACT_II_SEAM_RELIEFS,
  ACT_TAIL_R004A_CLAUSE_IDS,
  ACT_TAIL_R005A_CLAUSE_IDS,
  LAW_PRECISION,
  actScaleTailGuards,
  allOffShortestSolution,
  auditLevel,
  measureActScaleReading,
} from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const SHELF_DIR = join(LEVELS_DIR, "candidates");
const REPO_DIR = fileURLToPath(new URL("../", import.meta.url));
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
/**
 * The commit and directory the ten files were **moved from** (the dispatch base's shelf).
 * Overridable, because the origin is data about *this* registration, not a convention: a re-run
 * against a moved shelf must say so out loud.
 */
const ORIGIN = argOf("origin") ?? "36ffe0b:src/levels/candidates";
const ORIGIN_SHA = ORIGIN.slice(0, ORIGIN.indexOf(":"));
const ORIGIN_DIR = ORIGIN.slice(ORIGIN.indexOf(":") + 1);

const fileOf = (id: number): string => `l${String(id).padStart(3, "0")}.json`;
const readLevel = (id: number): Level =>
  LevelSchema.parse(
    JSON.parse(readFileSync(join(LEVELS_DIR, fileOf(id)), "utf8")),
  ) as Level;
const shipped = (): readonly { id: number; level: Level }[] =>
  readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((n) => ({
      id: Number(/l(\d+)\.json/.exec(n)?.[1] ?? "0"),
      level: LevelSchema.parse(
        JSON.parse(readFileSync(join(LEVELS_DIR, n), "utf8")),
      ) as Level,
    }));

const divergences: string[] = [];
function check(name: string, ok: boolean, detail: string): void {
  if (!ok) divergences.push(`${name} — ${detail}`);
  console.log(`  ${ok ? "MATCH" : "DIVERGENT"}  ${name} — ${detail}`);
}

const near = (a: number, b: number): boolean => Math.abs(a - b) < LAW_PRECISION;

console.log(
  "attest-r005a-reg35 — Act II batches 2 + 3 registration (L26–L35) + the moved §7.3 tail law",
);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(`origin:     L26–L35 ${ORIGIN} (the shelf the bytes were moved from)`);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [1/6] byte identity — sha256 + git blob, root vs shelf (the move is a MOVE)
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[1/6] byte identity — the registered root files are byte-copies, not edits",
);
for (const id of [...ACT_II_B2_IDS, ...ACT_II_B3_IDS]) {
  const rootPath = join(LEVELS_DIR, fileOf(id));
  const shelfPath = `${ORIGIN_DIR}/${fileOf(id)}`;
  const sha = createHash("sha256").update(readFileSync(rootPath)).digest("hex");
  let rootBlob = "";
  let shelfBlob = "";
  let error: string | null = null;
  try {
    rootBlob = execFileSync("git", ["hash-object", rootPath], {
      encoding: "utf8",
    }).trim();
    shelfBlob = execFileSync("git", ["rev-parse", `${ORIGIN_SHA}:${shelfPath}`], {
      encoding: "utf8",
    }).trim();
  } catch (e) {
    error =
      e instanceof Error ? (e.message.split("\n")[0] ?? String(e)) : String(e);
  }
  check(
    `${fileOf(id)} blob identity`,
    error === null && rootBlob !== "" && rootBlob === shelfBlob,
    error === null
      ? `root ${rootBlob} == ${ORIGIN} ${shelfBlob} (sha256 ${sha.slice(0, 12)}…)`
      : `NOT RUN — git could not answer (${error ?? ""}); a check that did not run is never a pass`,
  );
}
// The shelf is read as a *state*: a registration that MOVED ten files leaves it empty, and a
// shelf still holding them would mean the move silently became a copy (two byte-identical
// copies of the same rung is exactly the drift `git mv` exists to prevent).
const shelfLevels = readdirSync(SHELF_DIR).filter((n) => /^l\d+\.json$/.test(n));
check(
  "the shelf is EMPTY of level files (R-005a MOVED the ten rungs; a copy would have left them)",
  shelfLevels.length === 0,
  `src/levels/candidates holds ${String(shelfLevels.length)} level file(s)` +
    (shelfLevels.length === 0 ? " (README only)" : ` [${shelfLevels.join(" ")}]`),
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [2/6] the ten registered rows, re-measured from the ROOT bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[2/6] the registered rows — re-measured from the ROOT bytes, never read from a note",
);
const measured = ACT_II_B2_B3_LADDER.map((row) => {
  const level = readLevel(row.id);
  const graph: ReachableGraph = explore(level);
  const result = analyse(level, graph);
  const audit = auditLevel(level, graph);
  return {
    id: row.id,
    row,
    level,
    graph,
    result,
    audit,
    allOff: allOffShortestSolution(level, graph),
    gates: audit.gates,
  };
});
let rowsOk = true;
for (const m of measured) {
  const row = m.row;
  console.log(`  ${fileOf(m.id)} (rung ${String(m.id)})`);
  const parOk = m.result.shortestSolution === row.par && m.level.par === row.par;
  const dexecOk =
    m.audit.difficulty.Dexec !== null &&
    Math.abs(m.audit.difficulty.Dexec - row.dexec) < 5e-7;
  const bOk = Math.abs(m.audit.difficulty.B - row.b) < 5e-5;
  const trOk = m.audit.difficulty.T === 0 && m.audit.difficulty.R === 0;
  const covOk =
    m.result.distinctPositions === row.coverage &&
    m.result.distinctPositions === m.level.width * m.level.height &&
    m.level.width === row.grid[0] &&
    m.level.height === row.grid[1];
  const allOffOk = m.allOff === null && m.audit.allOffGoalReachable === false;
  const cleanOk = m.audit.violations.length === 0;
  rowsOk =
    rowsOk && parOk && dexecOk && bOk && trOk && covOk && allOffOk && cleanOk;
  check(
    `${fileOf(m.id)} par`,
    parOk,
    `solver ${String(m.result.shortestSolution)} · file ${String(m.level.par)} · registered ${String(row.par)}`,
  );
  check(
    `${fileOf(m.id)} D_exec`,
    dexecOk,
    `measured ${m.audit.difficulty.Dexec?.toFixed(6) ?? "n/a"} · registered ${row.dexec.toFixed(6)}`,
  );
  check(
    `${fileOf(m.id)} B`,
    bOk,
    `measured ${m.audit.difficulty.B.toFixed(4)} · registered ${row.b.toFixed(4)}`,
  );
  check(
    `${fileOf(m.id)} T ≡ R ≡ 0`,
    trOk,
    `T=${String(m.audit.difficulty.T)} R=${m.audit.difficulty.R.toFixed(6)} ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)`,
  );
  check(
    `${fileOf(m.id)} grid + coverage`,
    covOk,
    `${String(m.level.width)} × ${String(m.level.height)} · distinctPositions=${String(m.result.distinctPositions)} of ${String(m.level.width * m.level.height)} · registered ${String(row.grid[0])} × ${String(row.grid[1])} / ${String(row.coverage)}`,
  );
  check(
    `${fileOf(m.id)} all-OFF world is UNSATISFIABLE (measured)`,
    allOffOk,
    `allOffShortest=${m.allOff === null ? "null" : String(m.allOff)} · allOffGoalReachable=${String(m.audit.allOffGoalReachable)} ` +
      `· subgraph ${String(m.audit.allOffReachableStates)}/${String(m.result.reachableStates)} states`,
  );
  check(
    `${fileOf(m.id)} audit violations empty`,
    cleanOk,
    `${String(m.audit.violations.length)} violation(s) · per-rung gate families reported by the audit: ${String(m.gates.length)}`,
  );
}
/*
 * A named, printed reading rather than a silent pass. The audit dispatches its per-rung gate
 * families from the *documented lesson row* (`DOCUMENTED_LESSONS`); since **R-005a2** the ten rows
 * **exist** (`l026`–`l035`, `switchRequired: "required"` measured on the all-OFF world,
 * `obligation: null`) but they dispatch **no family**: the act's only per-rung reader
 * (`act2Batch1Gates`) keys its rung on `ACT_II_B1_IDS` and reads `ACT_II_B1_LADDER`, so a value
 * there would mis-key these boards or graft an Act II rung onto another block's law. The ten rungs
 * therefore carry **no registered per-rung gate family**, and their proof at this ticket is still
 * the family-gate run below (`scripts/prove-candidate.ts`, 13/13 named controls per rung).
 * Recorded here so the gap is visible in the artifact rather than inferred from a zero — booked for
 * R-005b/R-005c as an `act-2-batch-2` / `act-2-batch-3` **family** (obligations behind a
 * `ACT_II_B2_B3_LADDER`-keyed reader: design content + QA's one-control-per-code table).
 * R-005a2 moved exactly one printed string here — this row's own detail line, which read "a future
 * `act-2-batch-2/3` **lesson row** must also extend this instrument", now names the **obligation**'s
 * arrival, because that ticket established a row can exist without dispatching a family (these ten
 * do). The check's condition, its `[0]` reading and every other line are unchanged, so no status,
 * count, clause reading or verdict moved; the committed transcript is refreshed with a `refreshed:`
 * note recording that single line. This row reddens exactly when a **family** lands — not when a
 * row lands.
 */
const gateFamilies = new Set(measured.map((m) => m.gates.length));
check(
  "the registered-bytes audit carries no per-rung gate family for L26–L35 yet (booked gap, NOT a silent pass)",
  gateFamilies.size === 1 && [...gateFamilies][0] === 0,
  `audit gate counts across the ten rungs: [${[...gateFamilies].join(", ")}] — the proof of these rungs in this artifact is the family-gate run below; ` +
    "a future `act-2-batch-2/3` OBLIGATION must also extend this instrument (a ladder-keyed family is the event that reddens this row — the row's mere existence no longer is, measured at R-005a2)",
);
check(
  "the ten rows reproduce their registered table (all of it, rung by rung)",
  rowsOk,
  `${String(measured.filter((m) => m.audit.difficulty.Dexec !== null).length)}/${String(measured.length)} rungs re-measured against ACT_II_B2_B3_LADDER`,
);
console.log("");

// ── the family-gate proof, taken from the prover's own stdout ────────────────
//
// `scripts/prove-candidate.ts` is the authoring prover and the ONLY place the family gates
// (`g0`–`g6`) and their control table live. Re-implementing its table here would make [2/6] a
// statement about this file, so the proof is read as the instrument's own lines: per-rung
// `controls: 13/13 caught by their named gate` and the measured `LADDER RESULT`. `--dir=src/levels`
// points it at the **registered** bytes (not the shelf), which is what makes this a registration
// proof rather than an authoring one.
let ladderOut = "";
let ladderExit = 0;
try {
  const tsxCli = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
  ladderOut = execFileSync(
    process.execPath,
    [
      tsxCli,
      "scripts/prove-candidate.ts",
      "--family=g",
      `--ladder=${ACT_II_REGISTERED_IDS.slice(ACT_II_B1_IDS.length).join(",")}`,
      "--dir=src/levels",
    ],
    { encoding: "utf8", cwd: REPO_DIR, maxBuffer: 64 * 1024 * 1024 },
  );
} catch (e) {
  ladderExit = 1;
  const out = e as { stdout?: string };
  ladderOut = typeof out.stdout === "string" ? out.stdout : "";
}
const cutLine = /^prove-candidate — CUT re-measured.*$/m.exec(ladderOut)?.[0] ?? null;
const cutMatch =
  cutLine === null
    ? null
    : /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(
        cutLine,
      );
const ladderPass =
  /^LADDER RESULT: PASS \((\d+)\/(\d+) rung\(s\) ACCEPT, controls named: (\d+)\/(\d+) across the (\d+) rung\(s\)\)$/m.exec(
    ladderOut,
  );
const perRung = [...ladderOut.matchAll(/^controls: (\d+)\/(\d+) caught by their named gate$/gm)];
const rungResults = [...ladderOut.matchAll(/^RESULT: (PASS|FAIL)$/gm)].map((m) => m[1]);
console.log(
  "  family-gate proof at the ROOT (scripts/prove-candidate.ts --family=g --ladder=26…35 --dir=src/levels):",
);
console.log(
  `    ${cutLine === null ? "CUT line MISSING" : cutLine.replace(/ \(the L16.*$/, "")}`,
);
console.log(
  `    per-rung: ${perRung.map((m) => `${m[1]}/${m[2]}`).join(" ")} · rung verdicts ${rungResults.join(" ")}`,
);
console.log(
  `    ${ladderPass === null ? "LADDER RESULT line MISSING" : `LADDER RESULT: ${ladderPass[1]}/${ladderPass[2]} rung(s) ACCEPT, controls named ${ladderPass[3]}/${ladderPass[4]} across the ${ladderPass[5]} rung(s)`}`,
);
check(
  "the ten rungs prove at the ROOT under their own family gates, controls named per rung",
  ladderExit === 0 &&
    ladderPass !== null &&
    ladderPass[1] === "10" &&
    ladderPass[2] === "10" &&
    ladderPass[3] === ladderPass[4] &&
    ladderPass[3] === "130" &&
    ladderPass[5] === "10" &&
    perRung.length === 10 &&
    perRung.every((m) => m[1] === "13" && m[2] === "13") &&
    rungResults.length === 10 &&
    rungResults.every((r) => r === "PASS"),
  `exit ${String(ladderExit)} · ${String(perRung.length)} rung(s) reporting controls · ` +
    `${String(perRung.filter((m) => m[1] === "13" && m[2] === "13").length)}/10 at 13/13 · ` +
    `LADDER ${ladderPass === null ? "n/a" : `PASS ${ladderPass[1]}/${ladderPass[2]} · controls named ${ladderPass[3]}/${ladderPass[4]}`}`,
);
check(
  "the freezer holds at 35 shipped files (the cut is still the L1–L15 basis)",
  cutMatch !== null &&
    Number(cutMatch[1]) === 14.969697 &&
    cutMatch[2] === "10" &&
    cutMatch[3] === "35" &&
    cutMatch[4] === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
  `CUT D_exec max = ${cutMatch?.[1] ?? "n/a"} · par(L15) = ${cutMatch?.[2] ?? "n/a"} · ` +
    `${cutMatch?.[3] ?? "n/a"} shipped files · basis ids [${cutMatch?.[4] ?? "n/a"}] — the L16–L20 block and all fifteen registered Act II rungs are excluded from the cut's own filter`,
);
// Non-vacuity, both halves of the section: a reader that cannot move is not evidence, and an
// instrument that accepts the wrong directory is not reading the registered bytes.
const readCut = (line: string): string | null => {
  const m =
    /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(
      line,
    );
  return m === null ? null : `${m[1]!}|${m[2]!}|${m[3]!}|${m[4]!}`;
};
const liveCut = cutLine === null ? null : readCut(cutLine);
const relabeledCut =
  cutLine === null
    ? null
    : readCut(
        cutLine.replace(
          "basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]",
          "basis ids [16, 17, 18, 19, 20]",
        ),
      );
let emptyShelfExit = 0;
try {
  execFileSync(
    process.execPath,
    [
      fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url)),
      "scripts/prove-candidate.ts",
      "--family=g",
      `--ladder=${String(ACT_II_B2_IDS[0])}`,
      "--dir=src/levels/candidates",
    ],
    { encoding: "utf8", cwd: REPO_DIR, stdio: "pipe" },
  );
} catch {
  emptyShelfExit = 1;
}
check(
  "the section can fail (both halves probed live)",
  liveCut !== null &&
    relabeledCut !== null &&
    liveCut !== relabeledCut &&
    emptyShelfExit !== 0,
  liveCut === null || relabeledCut === null
    ? "the CUT reader could not be parsed, so the freezer row would have to be read as unparsed"
    : `the reader distinguishes the live basis from a relabeled one ([${relabeledCut.split("|")[3] ?? "n/a"}]); and a ladder pointed at the now-EMPTY shelf exits ${String(emptyShelfExit)} (≠ 0) — ` +
      "so neither the reader nor the prover's exit code is an assumption",
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [3/6] §7.3 — the act-scale tail law, measured
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[3/6] §7.3 act-scale tail law — the act peaks and the ten new rows, measured on the root bytes",
);
const all = shipped();
// ONE implementation of "the act's maximum" (`measureActScaleReading`), shared with
// `scripts/attest-r004a-act2.ts`: two transcripts of the same law that measure it two ways is
// how a stale reading survives a registration.
const reading: ActScaleLawReading = measureActScaleReading(all.map((s) => s.level));
console.log(
  `  measured: Act I peak ${reading.actI.dexec.toFixed(6)} (L${String(reading.actI.levelId)}) · ` +
    `Act II peak ${reading.actII.dexec.toFixed(6)} (L${String(reading.actII.levelId)}, read over ids ` +
    `${String(ACT_II_REGISTERED_IDS[0])}–${String(ACT_II_REGISTERED_IDS[ACT_II_REGISTERED_IDS.length - 1] ?? 0)}) · ` +
    `batch-1 record ${reading.actIIBatchPeak.dexec.toFixed(6)} (L${String(reading.actIIBatchPeak.levelId)}) · ` +
    `act-open L${String(reading.actOpen.levelId)} ${reading.actOpen.dexec.toFixed(6)}`,
);
console.log(
  `  ten new rows read off the bytes: ${reading.actIIBatchRows.map((r) => `L${String(r.id)} ${String(r.par)}/${r.dexec.toFixed(6)}/${r.b.toFixed(4)}`).join(" · ")}`,
);
const registered = actScaleTailGuards(reading);
for (const clause of registered) {
  console.log(
    `  ${clause.status === "PASS" ? "MATCH" : "DIVERGENT"}  ${clause.clause} — ${clause.label}`,
  );
  console.log(`           ${clause.detail}`);
}
check(
  "§7.3 — every reported tail clause holds on the registered bytes",
  registered.every((c) => c.status === "PASS"),
  `${String(registered.filter((c) => c.status === "PASS").length)}/${String(registered.length)} clauses PASS`,
);
check(
  "the clause split partitions the reported set, and this instrument owns R-005a's five",
  registered.length ===
    ACT_TAIL_R004A_CLAUSE_IDS.length + ACT_TAIL_R005A_CLAUSE_IDS.length &&
    registered.every(
      (c) =>
        ACT_TAIL_R004A_CLAUSE_IDS.includes(c.clause) ||
        ACT_TAIL_R005A_CLAUSE_IDS.includes(c.clause),
    ),
  `reported ${String(registered.length)} = R-004a ${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} (controlled by scripts/attest-r004a-act2.ts) + ` +
    `R-005a ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} [${ACT_TAIL_R005A_CLAUSE_IDS.join(", ")}] (controlled here)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [4/6] anti-tautology controls, one per R-005a clause
// ─────────────────────────────────────────────────────────────────────────────

console.log("[4/6] anti-tautology controls — one per R-005a clause, refused BY NAME");
const restampTable = ACT_II_B2_B3_LADDER.map((r) =>
  r.id === 28 ? { ...r, dexec: 30 } : r,
);
const restampRow = reading.actIIBatchRows.map((r) =>
  r.id === 33 ? { ...r, dexec: 30 } : r,
);
const tailControls: readonly {
  readonly clause: ActTailClauseId;
  readonly name: string;
  readonly coupling: string;
  readonly reading: ActScaleLawReading;
}[] = [
  {
    clause: "act-tail-r005a-registered-rows",
    name: "RESTAMP (table side): the law's own row for L28 is moved to D_exec 30 while the bytes stay registered — the table is injectable, so the reading cannot be confirmed by the constant it is compared with",
    coupling: "named: only the row clause reads the table's D_exec, so nothing else can carry the refusal",
    reading: { ...reading, actIIBatchTable: restampTable },
  },
  {
    clause: "act-tail-r005a-registered-rows",
    name: "RESTAMP (measurement side): the L33 row read off the bytes is moved to D_exec 30 — the registered row set names the restamped rung",
    coupling: "named: the clause reports the restamped rung by name ([L33]), which is the 'never re-stamp a registered rung' duty per row",
    reading: { ...reading, actIIBatchRows: restampRow },
  },
  {
    clause: "act-tail-r005a-tail-pin",
    name: "RELABEL: the act's registered tail is moved onto L34 while keeping L35's value — the constant and the rung it belongs to disagree",
    coupling: "named: the tail value is unchanged, so the neighbouring clauses stay green and the refusal is this clause's own",
    reading: {
      ...reading,
      actII: {
        levelId: ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID - 1,
        dexec: ACT_II_R005A_REGISTERED_TAIL_EXEC,
      },
    },
  },
  {
    clause: "act-tail-r005a-pre-standard",
    name: "RESTAMPED STANDARD: the pre-R005a standard is overwritten with the post-registration tail (28.339426) — the re-registration would confirm itself",
    coupling: "named: the standard must still be the tail as it stood before this ticket (27.604651 at L25), so this is the R-003d shape a second time",
    reading: {
      ...reading,
      preR005aStandard: ACT_II_R005A_REGISTERED_TAIL_EXEC,
    },
  },
  {
    clause: "act-tail-r005a-exec-headroom",
    name: `NARROWED CEILING: the D_exec ceiling is taken as the band FLOOR (${ACT_II_EXEC_BAND[0].toFixed(2)}) — a silently narrowed band has to move the derived headroom`,
    coupling: "named: the ceiling operand is not the derived-exact band end, so the clause refuses twice over (narrowed operand, negative headroom)",
    reading: { ...reading, execCeiling: ACT_II_EXEC_BAND[0] },
  },
  {
    clause: "act-tail-r005a-seam-reliefs",
    name: "RESTAMPED SEAM: the L30→L31 relief is re-measured as 24.000000 — the derived Δ no longer equals the published ΔD_exec",
    coupling: "named: the seam clause is the only reader of the two §7.3.1 instances",
    reading: {
      ...reading,
      seams: reading.seams.map((s) =>
        s.toLevelId === ACT_II_B3_SEAM_RELIEF.toLevelId
          ? { ...s, toExec: 24 }
          : s,
      ),
    },
  },
];
let tailCaught = 0;
for (const control of tailControls) {
  const clauses = actScaleTailGuards(control.reading);
  const failed = clauses.filter((c) => c.status === "FAIL").map((c) => c.clause);
  const hit = failed.includes(control.clause);
  if (hit) tailCaught += 1;
  console.log(`  ${hit ? "CAUGHT" : "MISSED"}  ${control.clause}`);
  console.log(`          mutation: ${control.name}`);
  console.log(`          coupling: ${control.coupling}`);
  console.log(`          measured: FAIL clauses [${failed.join(" ")}]`);
  if (!hit)
    divergences.push(
      `tail control for ${control.clause} was MISSED (measured FAIL clauses [${failed.join(" ")}])`,
    );
}
check(
  "every R-005a clause has at least one control, all caught, and no R-004a clause is claimed here",
  tailCaught === tailControls.length &&
    ACT_TAIL_R005A_CLAUSE_IDS.every((id) =>
      tailControls.some((c) => c.clause === id),
    ) &&
    tailControls.every((c) => ACT_TAIL_R005A_CLAUSE_IDS.includes(c.clause)),
  `${String(tailCaught)}/${String(tailControls.length)} caught · R-005a clauses covered ${String(new Set(tailControls.map((c) => c.clause)).size)}/${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} ` +
    `(R-004a's six are controlled in scripts/attest-r004a-act2.ts — the split is asserted there as a partition)`,
);
check(
  "discrimination: the registered reading PASSes all eleven clauses while every control FAILs one",
  registered.every((c) => c.status === "PASS") &&
    tailControls.every((c) =>
      actScaleTailGuards(c.reading).some((x) => x.status === "FAIL"),
    ),
  `${String(registered.length)}/${String(registered.length)} clauses PASS on the registered bytes · ${String(tailCaught)}/${String(tailControls.length)} controls refused by name`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [5/6] the §7.3.1 seams and the sawtooth, probed in both directions
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[5/6] the §7.3.1 seams — both directions probed, and every adjacent drop accounted for",
);
const seamClause = (r: ActScaleLawReading): GateStatus =>
  actScaleTailGuards(r).find((c) => c.clause === "act-tail-r005a-seam-reliefs")
    ?.status ?? "FAIL";
/** One rung's `D_exec`, re-measured from the registered bytes (never read from a row table). */
const dexecOf = (id: number): number =>
  auditLevel(readLevel(id)).difficulty.Dexec ?? Number.NaN;
const seamFrom = dexecOf;
/**
 * **The sawtooth, measured.** The registered act's `D_exec` is deliberately non-monotone at the
 * two batch seams (`L25→L26 −6.044410`, `L30→L31 −4.362098`) and rises elsewhere. §7.3's
 * `act-peak` clause rides on the act's **maximum**, and §7.3.1 makes a relief registrable by its
 * **pre-published label** — so a validator demanding cross-batch monotony would have refused two
 * *registered* rungs. That hypothesis is falsified here by measurement rather than argued away.
 */
const actIIExec = ACT_II_REGISTERED_IDS.map((id) => ({ id, dexec: seamFrom(id) }));
const steps = actIIExec.slice(1).map((r, i) => ({
  from: actIIExec[i]!.id,
  to: r.id,
  delta: r.dexec - actIIExec[i]!.dexec,
}));
const drops = steps.filter((s) => s.delta < 0);
const rises = steps.filter((s) => s.delta > 0);
const namedSeams = ACT_II_SEAM_RELIEFS.map((s) => `${String(s.fromLevelId)}→${String(s.toLevelId)}`);
console.log(
  `  registered adjacent steps inside the act: ${steps.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(6)}`).join(" · ")}`,
);
check(
  "§7.3.1 — the sawtooth is the registered reading, and the clause PASSes it (a monotony validator would have refused two registered rungs)",
  drops.length === 2 &&
    drops.every((s) =>
      ACT_II_SEAM_RELIEFS.some(
        (spec) => spec.fromLevelId === s.from && spec.toLevelId === s.to,
      ),
    ) &&
    seamClause(reading) === "PASS" &&
    rises.length === 12,
  `drops ${String(drops.length)} (both named [${namedSeams.join(", ")}]) · rises ${String(rises.length)} (none labelled, none owed: §7.3 interior freedom) · ` +
    `clause act-tail-r005a-seam-reliefs on the registered reading = ${seamClause(reading)}`,
);
check(
  "§7.3.1 — no UNNAMED relief hides in the bytes (every adjacent drop is a named instance)",
  drops.every((s) =>
    ACT_II_SEAM_RELIEFS.some(
      (spec) => spec.fromLevelId === s.from && spec.toLevelId === s.to,
    ),
  ),
  `drops: ${drops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(" · ")} · the law's instances: ` +
    `${ACT_II_SEAM_RELIEFS.map((s) => `L${String(s.fromLevelId)}→L${String(s.toLevelId)} ${s.delta.toFixed(6)}`).join(" · ")} — ` +
    "the seam clause judges only the pairs the law names, so this measurement is what closes the 'unnamed relief' hole",
);
// Non-vacuity on the same reader: an UNNAMED drop must be visible to it. The probe lowers one
// copied rung so a fabricated third drop appears at a pair the law does not name.
const fabricated = actIIExec.map((r) => (r.id === 33 ? { ...r, dexec: 20 } : r));
const fabricatedDrops = fabricated
  .slice(1)
  .map((r, i) => ({
    from: fabricated[i]!.id,
    to: r.id,
    delta: r.dexec - fabricated[i]!.dexec,
  }))
  .filter((s) => s.delta < 0)
  .filter(
    (s) =>
      !ACT_II_SEAM_RELIEFS.some(
        (spec) => spec.fromLevelId === s.from && spec.toLevelId === s.to,
      ),
  );
check(
  "the unnamed-relief reader can fail (a fabricated third drop is named as unnamed)",
  fabricatedDrops.length === 1 &&
    fabricatedDrops[0]!.from === 32 &&
    fabricatedDrops[0]!.to === 33,
  `fabricated drops at unnamed pairs: [${fabricatedDrops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(", ")}] (required exactly L32→L33)`,
);
// Direction 2: the BAND half has teeth — a seam endpoint outside the act band FAILs even when
// the derived Δ happens to match its published value.
const outOfBandSeam = actScaleTailGuards({
  ...reading,
  seams: reading.seams.map((s) =>
    s.toLevelId === ACT_II_B2_SEAM_RELIEF.toLevelId
      ? {
          ...s,
          toExec: ACT_II_EXEC_BAND[1] + 1.5,
          registeredTo: ACT_II_EXEC_BAND[1] + 1.5,
          registeredDelta:
            ACT_II_EXEC_BAND[1] + 1.5 - s.registeredFrom,
        }
      : s,
  ),
});
check(
  "§7.3.1 / §7.9 — an out-of-band seam FAILs (interior freedom is freedom INSIDE the band)",
  outOfBandSeam.find((c) => c.clause === "act-tail-r005a-seam-reliefs")
    ?.status === "FAIL" && seamClause(reading) === "PASS",
  `registered reading ${seamClause(reading)}; L26 moved to ${(ACT_II_EXEC_BAND[1] + 1.5).toFixed(4)} (derived-exact band top ${ACT_II_EXEC_BAND[1].toFixed(4)}) ` +
    `with a self-consistent published Δ ⇒ seam clause FAIL`,
);
// Direction 3: a measurement that DROPS a registered rung cannot satisfy the clause. This is
// the honest reading of "the instance must exist": the law's two instances are required, not
// optional, and a dataset missing L31 (or L26) fails by name rather than skipping the check.
const withoutL31 = measureActScaleReading(
  all.filter((s) => s.id !== ACT_II_B3_SEAM_RELIEF.toLevelId).map((s) => s.level),
);
const missingSeam = actScaleTailGuards(withoutL31).find(
  (c) => c.clause === "act-tail-r005a-seam-reliefs",
);
check(
  "a measurement that omits a registered rung FAILs the seam clause (the instance is required, not optional)",
  missingSeam?.status === "FAIL" &&
    (missingSeam.detail.includes("MISSING") ||
      missingSeam.detail.includes("NaN")),
  `reading built from the 34 shipped files without L${String(ACT_II_B3_SEAM_RELIEF.toLevelId)}: clause ${String(missingSeam?.status)} — ` +
    `${(missingSeam?.detail ?? "").slice(0, 150)}…`,
);
/*
 * Stated plainly rather than probed: the seam clause compares the **published** Δ (a label
 * field) against the derived Δ, so a *rise* seam registered with a positive Δ would satisfy the
 * same terms — there is no sign test in the status, in either direction. It cannot be exercised
 * live here, because doing so would mean re-implementing the clause's own comparison against a
 * spec the law does not publish; this instrument refuses to re-implement a clause it attests.
 * What the law DOES bind is the pair and the published value, and both registered instances are
 * drops, so the "direction is not a term" claim is carried by the clause's own detail string and
 * by the labels in [6/6] — never by a probe that could not fail.
 */
console.log(
  "  NOTE     the seam status binds the published Δ by equality and the derived Δ by arithmetic — no sign test exists in either direction;",
);
console.log(
  "           a rise seam published with a positive Δ would satisfy the same terms. Not probed live (that would mean re-implementing the clause here);",
);
console.log(
  "           the two registered instances are drops and [6/6] reads their labels verbatim, which is what §7.3.1 makes registrable.",
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [6/6] the labels and the constants — §7.3.1 verbatim, §7.9 notation, the arithmetic
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[6/6] the §7.3.1 labels and the moved constants — derived from the registered bytes, quoted verbatim",
);
// (1)+(2) Each instance's published ΔD_exec, DERIVED from the registered bytes (never read from
// the constant), and the label's own quotation of it.
const delta2 = ACT_II_B2_SEAM_RELIEF.toExec - ACT_II_B2_SEAM_RELIEF.fromExec;
const delta3 = ACT_II_B3_SEAM_RELIEF.toExec - ACT_II_B3_SEAM_RELIEF.fromExec;
check(
  `§7.3.1 instance 2 — derived ΔD_exec = −6.044410 (L25 27.604651 → L26 21.560241) equals the published Δ, and the label quotes it`,
  near(delta2, ACT_II_B2_SEAM_RELIEF.delta) &&
    ACT_II_B2_SEAM_RELIEF.label.includes("ΔD_exec = −6.044410") &&
    ACT_II_B2_SEAM_RELIEF.label.includes("seam L25→L26") &&
    near(seamFrom(25), ACT_II_B2_SEAM_RELIEF.fromExec) &&
    near(seamFrom(26), ACT_II_B2_SEAM_RELIEF.toExec),
  `derived ${delta2.toFixed(6)} · published ${ACT_II_B2_SEAM_RELIEF.delta.toFixed(6)} · measured L25 ${seamFrom(25).toFixed(6)} → L26 ${seamFrom(26).toFixed(6)}`,
);
check(
  "§7.3.1 instance 3 — derived ΔD_exec = −4.362098 (L30 27.566265 → L31 23.204167) equals the published Δ, and the label quotes it",
  near(delta3, ACT_II_B3_SEAM_RELIEF.delta) &&
    ACT_II_B3_SEAM_RELIEF.label.includes("ΔD_exec = −4.362098") &&
    ACT_II_B3_SEAM_RELIEF.label.includes("seam L30→L31") &&
    near(seamFrom(30), ACT_II_B3_SEAM_RELIEF.fromExec) &&
    near(seamFrom(31), ACT_II_B3_SEAM_RELIEF.toExec),
  `derived ${delta3.toFixed(6)} · published ${ACT_II_B3_SEAM_RELIEF.delta.toFixed(6)} · measured L30 ${seamFrom(30).toFixed(6)} → L31 ${seamFrom(31).toFixed(6)}`,
);
// (3) §7.9's notation law, read on the labels themselves: instance 2 carries the PRINTED form
// (it was published that way); instance 3 carries the derived-exact form WITH the printed form
// in parentheses (GD-011's notation-only amendment). Neither the operand here nor the clause's
// comparisons ever read the printed form.
const printedBand = `[${ACT_II_EXEC_BAND[0].toFixed(2)}, ${ACT_II_EXEC_BAND[1].toFixed(2)}]`;
const derivedBand = `[${ACT_II_EXEC_BAND[0].toFixed(2)}, ${ACT_II_EXEC_BAND[1]}]`;
check(
  "§7.9 — the labels carry the band in the form each was published in (printed in instance 2; derived-exact + printed in parentheses in instance 3)",
  ACT_II_B2_SEAM_RELIEF.label.includes(printedBand) &&
    !ACT_II_B2_SEAM_RELIEF.label.includes(derivedBand) &&
    ACT_II_B3_SEAM_RELIEF.label.includes(derivedBand) &&
    ACT_II_B3_SEAM_RELIEF.label.includes("(printed `[19.75, 29.06]`)"),
  `instance 2 quotes \`${printedBand}\` (and not the derived-exact \`${derivedBand}\`); instance 3 quotes \`${derivedBand}\` with the printed form in parentheses. ` +
    `The clause's comparison operand is the derived-exact constant; printed forms are display text.`,
);
// (4)+(5) Attribution, and the "no ease the instrument cannot see" clause — the half of a relief
// label that forbids claiming a comprehension effect the execution axis cannot measure
// (`M`/`T` are not terms of `D_exec`), plus §6's own distinction: a relief is never presented as
// a dip.
const noEaseClaim =
  "largely an artifact of the measurement design";
const neverAdip = /never a [`"]?dip/;
check(
  "§7.3.1 — both labels carry their attribution and refuse to claim an ease the instrument cannot see",
  ACT_II_B2_SEAM_RELIEF.label.includes("GD-010 §7.3.1 instance 2") &&
    ACT_II_B2_SEAM_RELIEF.label.includes(noEaseClaim) &&
    neverAdip.test(ACT_II_B2_SEAM_RELIEF.label) &&
    ACT_II_B3_SEAM_RELIEF.label.includes("GD-011 RULING C") &&
    ACT_II_B3_SEAM_RELIEF.label.includes(noEaseClaim) &&
    neverAdip.test(ACT_II_B3_SEAM_RELIEF.label) &&
    ACT_II_B3_SEAM_RELIEF.label.includes("NOT TESTABLE, n = 0"),
  `instance 2: "${ACT_II_B2_SEAM_RELIEF.label.slice(-96)}" · instance 3: "${ACT_II_B3_SEAM_RELIEF.label.slice(-96)}"`,
);
// The tail arithmetic: post/pre standard, the measured rise, the cross-act advantage, and the
// DERIVED-EXACT headroom — including the printed-operand counterfactual, which is §7.9's whole
// reason for existing (the last 0.0025 of the band).
const derivedHeadroom = ACT_II_EXEC_BAND[1] - ACT_II_R005A_REGISTERED_TAIL_EXEC;
const printedHeadroom = Number(ACT_II_EXEC_BAND[1].toFixed(2)) - ACT_II_R005A_REGISTERED_TAIL_EXEC;
check(
  "§7.9 — the tail's headroom is DERIVED-EXACT: 29.0625 − 28.339426 = 0.723074, and the printed operand would not reproduce it",
  near(derivedHeadroom, ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING) &&
    near(
      ACT_II_PAR_CEILING + 3 * ACT_II_B_BAND[1],
      ACT_II_EXEC_BAND[1],
    ) &&
    Math.abs(printedHeadroom - ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING) > 1e-3,
  `derived ${derivedHeadroom.toFixed(6)} = pinned ${ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)}; the printed operand (${ACT_II_EXEC_BAND[1].toFixed(2)}) would give ` +
    `${printedHeadroom.toFixed(6)} — a ${Math.abs(printedHeadroom - ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING).toFixed(6)} difference, i.e. the sliver §7.9 keeps buildable`,
);
check(
  "the moved tail: pre-R005a standard 27.604651 (L25) → post tail 28.339426 (L35), rise 0.734775; across acts 28.339426 − 24.729412 = 3.610014",
  ACT_II_PRE_R005A_REGISTERED_TAIL_LEVEL_ID === 25 &&
    near(ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC, 27.604651) &&
    ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID === 35 &&
    near(ACT_II_R005A_REGISTERED_TAIL_EXEC, 28.339426) &&
    near(
      ACT_II_R005A_REGISTERED_TAIL_EXEC -
        ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC,
      ACT_II_R005A_TAIL_ADVANTAGE,
    ) &&
    near(
      ACT_II_R005A_REGISTERED_TAIL_EXEC - ACT_I_REGISTERED_PEAK_EXEC,
      ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
    ),
  `standard ${ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_II_PRE_R005A_REGISTERED_TAIL_LEVEL_ID)} · ` +
    `tail ${ACT_II_R005A_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID)} · rise ${ACT_II_R005A_TAIL_ADVANTAGE.toFixed(6)} · ` +
    `advantage vs Act I ${ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I.toFixed(6)} (three derived identities, none typed twice)`,
);
// The five R-004a-era rungs are NOT re-stamped by this ticket: their registered rows must still
// reproduce on the bytes, exactly as R-004a left them (the clone-guard duty applied backwards).
const b1Restamped = ACT_II_B1_LADDER.filter((row) => {
  const measuredRow = auditLevel(readLevel(row.id)).difficulty;
  return (
    measuredRow.Dexec === null ||
    !near(measuredRow.Dexec, row.dexec) ||
    Math.abs(measuredRow.B - row.b) >= 5e-5
  );
});
check(
  "the five R-004a-era rungs are un-restamped (their registered rows still reproduce on the bytes)",
  b1Restamped.length === 0,
  `${String(ACT_II_B1_IDS.length)} rows re-measured · mismatches [${b1Restamped.map((r) => `L${String(r.id)}`).join(", ")}] · ` +
    `pars ${ACT_II_B1_LADDER.map((r) => String(r.par)).join(" / ")}`,
);
console.log("");

// ── verdict ──────────────────────────────────────────────────────────────────

if (divergences.length > 0) {
  console.log(`RESULT: STOP_AND_ROUTE — ${String(divergences.length)} divergence(s):`);
  for (const d of divergences) console.log(`  - ${d}`);
  console.log(
    "The registered bytes are the record of a proof: a disagreement means this registration is wrong, NOT",
  );
  console.log("that the board should be re-authored. Route it; do not repair it (ADR-0004).");
  process.exit(1);
}
console.log(
  `RESULT: REGISTERED-MATCH — the ten R-005a rungs are byte-identical to the shelf they were moved from (${ORIGIN}),`,
);
console.log(
  `every registered row (par / D_exec / B / grid / coverage) is reproduced by the program solver on the ROOT bytes,`,
);
console.log(
  `the ten rungs prove at the root under their own family gates (13/13 named controls per rung, ${String(perRung.length)} rungs),`,
);
console.log(
  `the act's registered tail moved with a re-derived identity (${ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC.toFixed(6)} → ${ACT_II_R005A_REGISTERED_TAIL_EXEC.toFixed(6)}, +${ACT_II_R005A_TAIL_ADVANTAGE.toFixed(6)}) and ${ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)} of DERIVED-EXACT headroom,`,
);
console.log(
  `all ${String(registered.length)} §7.3 tail clauses PASS (this instrument controls R-005a's ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} of them, by name), and both §7.3.1 seam labels are cited verbatim with their published ΔD_exec.`,
);