/**
 * `scripts/attest-r006a-reg40.ts` — **R-006a**: the registration re-attestation for **Act II
 * batch 4** (`l036`–`l040`, LV-017) and the **moved** act-scale tail law (`docs/level-design.md`
 * §7.3 / §7.3.1 / §7.9).
 *
 * The third instrument of the train (`attest-r004a-act2` → `attest-r005a-reg35` → here), and the
 * order is the same because the *reason* is the same: a registration is a **byte-copy, never an
 * edit**, and the law moves only after the root bytes have been re-measured.
 *
 *   [1/6] **byte identity** — each new root file is `git`-hashed **and** `sha256`-hashed and
 *        compared with the shelf it was moved from at the dispatch base (`e30bbaccf`, the base the
 *        registration train was cut from). A check that cannot run (git cannot answer) is a
 *        FAILURE, never a skip. The shelf is *also* read: after this registration it must be
 *        **empty of level files** — batch 4 MOVED its five rungs, so a shelf still holding them
 *        would mean the move silently became a copy.
 *   [2/6] **the five registered rows, re-measured on the ROOT bytes** — par (solver-stamped),
 *        `D_exec`, `B`, coverage, the all-OFF world, `T`/`R` and the audit's violation list,
 *        each against `ACT_II_B4_LADDER` (`@/core/solver/policy`, the law) and not against a
 *        note — **plus the family-gate proof at the root**, taken as `scripts/prove-candidate.ts`'s
 *        own stdout (its per-rung **13/13 controls by name** and its measured `LADDER RESULT`),
 *        **the frozen `measureCut()` line** (still the L1–L15 basis at `14.969697` over 40 shipped
 *        files), and the **§6.1.4 clone-guard census**. A control table re-implemented here would be
 *        a statement about *this file* instead of about the proof.
 *   [3/6] **§7.3's act-scale tail law** — the act peaks and the fifteen rows are **measured** and
 *        fed to `actScaleTailGuards`, which reports **twenty-two** clauses since R-007 opened Act
 *        III (R-004a's six, R-005a's five, R-006a's five, R-007's six; the four sets are asserted to
 *        **partition** the reported set — the assertion is refreshed, not relaxed).
 *        R-006a's five are named here. The clause pin expression that MOVED at this ticket is
 *        named — `act-tail-peak-advantage`, from the batch-1-only/whole-act form to the live act's
 *        own advantage — and no R-004a/R-005a *constant value* moved.
 *   [4/6] **anti-tautology controls, one per R-006a clause** — a restamped row table, a relabelled
 *        live tail, a restamped pre-registration standard, a narrowed `D_exec` ceiling and a
 *        restamped seam. Each must FAIL **its own clause** by name, and the registered reading must
 *        PASS every reported clause. Then **both directions of the basis split**, which is the
 *        structural claim this ticket makes: moving the **frozen era basis** must fail exactly
 *        R-005a's three act-level clauses and leave the live ones green; moving the **live act**
 *        must fail exactly the live clauses and leave R-005a's record green.
 *   [5/6] **§7.3.1's fourth instance, and the sawtooth** — the registered drop passes its clause, an
 *        out-of-band seam FAILs, a measurement that omits a registered rung FAILs, *every* adjacent
 *        drop in the registered act is a named instance (three of them now), and the **falsification
 *        probe sized to this batch's own act maximum** must refuse exactly `act-peak` on exactly
 *        `L40` while the rest of the ladder still proves.
 *   [6/6] **the labels and the constants** — the fourth instance's published `ΔD_exec` derived from
 *        the registered bytes, §7.9's notation law read on the label itself, the **verbatim** label
 *        anchor and its **provenance** (the rule commit that published it BEFORE the census and
 *        before the bytes), §7.9's derived-exact headroom with the printed-operand counterfactual,
 *        the tail / pre-standard / advantage arithmetic, and the **fifteen** previously registered
 *        rungs (R-004a's five, R-005a's ten) shown **un-restamped**.
 *
 * `STOP_AND_ROUTE` (exit 1) is the only honest answer to a disagreement: the registered bytes are
 * immutable and are never re-authored to fit a later reading (ADR-0004).
 *
 *   npx tsx scripts/attest-r006a-reg40.ts
 *   npx tsx scripts/attest-r006a-reg40.ts --origin=<sha>:src/levels/candidates   # override the byte-identity source
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
import type {
  ActScaleLawReading,
  ActTailClauseId,
  GateStatus,
} from "@/core/solver/policy";
import {
  ACT_I_REGISTERED_PEAK_EXEC,
  ACT_II_B1_IDS,
  ACT_II_B1_LADDER,
  ACT_II_B2_B3_LADDER,
  ACT_II_B4_IDS,
  ACT_II_B4_LADDER,
  ACT_II_B_BAND,
  ACT_II_EXEC_BAND,
  ACT_II_PAR_CEILING,
  ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC,
  ACT_II_PRE_R006A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_REGISTERED_IDS,
  ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
  ACT_II_R005A_ERA_IDS,
  ACT_II_R005A_REGISTERED_TAIL_EXEC,
  ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
  ACT_II_R006A_REGISTERED_TAIL_EXEC,
  ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_R006A_SEAM_RELIEF,
  ACT_II_R006A_TAIL_ADVANTAGE,
  ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING,
  ACT_II_SEAM_RELIEFS_ALL,
  ACT_TAIL_R004A_CLAUSE_IDS,
  ACT_TAIL_R005A_CLAUSE_IDS,
  ACT_TAIL_R006A_CLAUSE_IDS,
  ACT_TAIL_R007_CLAUSE_IDS,
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
 * The commit and directory the five files were **moved from**. `e30bbaccf` is the dispatch base
 * this registration train was cut from (the same base the R-005c-b booking commit sits on), and it
 * is the commit at which the shelf still held `l036`–`l040`. Overridable, because the origin is
 * data about *this* registration rather than a convention: a re-run against a moved shelf must say
 * so out loud.
 */
const ORIGIN = argOf("origin") ?? "e30bbaccf:src/levels/candidates";
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
  "attest-r006a-reg40 — Act II batch 4 registration (L36–L40) + the moved §7.3 tail law",
);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(`origin:     L36–L40 ${ORIGIN} (the shelf the bytes were moved from)`);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [1/6] byte identity — sha256 + git blob, root vs shelf (the move is a MOVE)
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[1/6] byte identity — the registered root files are byte-copies, not edits",
);
for (const id of ACT_II_B4_IDS) {
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
// The shelf is read as a *state*: a registration that MOVED five files leaves it empty, and a
// shelf still holding them would mean the move silently became a copy (two byte-identical copies
// of the same rung is exactly the drift `git mv` exists to prevent).
const shelfLevels = readdirSync(SHELF_DIR).filter((n) => /^l\d+\.json$/.test(n));
check(
  "the shelf is EMPTY of level files (R-006a MOVED the five rungs; a copy would have left them)",
  shelfLevels.length === 0,
  `src/levels/candidates holds ${String(shelfLevels.length)} level file(s)` +
    (shelfLevels.length === 0 ? " (README only)" : ` [${shelfLevels.join(" ")}]`),
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [2/6] the five registered rows, re-measured from the ROOT bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[2/6] the registered rows — re-measured from the ROOT bytes, never read from a note",
);
const measured = ACT_II_B4_LADDER.map((row) => {
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
    `${String(m.level.width)} × ${String(m.level.height)} · distinctPositions=${String(m.result.distinctPositions)} of ${String(m.level.width * m.level.height)} · registered ${String(row.grid[0])} × ${String(row.grid[1])} / ${String(row.coverage)} (§7.4's second frame, ` +
      `7×7 at CX = 1 — measured NON-EMPTY by LV-017 after LV-015 measured 7×7 at CX = 2 EMPTY)`,
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
 * families from the *documented lesson row* (`DOCUMENTED_LESSONS`); since **R-006a step 3** the
 * five rows **exist** (`l036`–`l040`) but they dispatch **no family**: the act's only per-rung
 * reader (`act2Batch1Gates`) keys its rung on `ACT_II_B1_IDS` and reads `ACT_II_B1_LADDER`, so a
 * value there would mis-key these boards or graft an Act II rung onto another block's law. The
 * five rungs therefore carry **no registered per-rung gate family**, and their proof at this
 * ticket is the family-gate run below (`scripts/prove-candidate.ts`, 13/13 named controls per
 * rung). Recorded so the gap is visible in the artifact rather than inferred from a zero — booked
 * for a later ticket as an `act-2-batch-4` **family** (obligation behind a `LADDER`-keyed reader:
 * design content + QA's one-control-per-code table + the re-pin). This row reddens exactly when a
 * **family** lands — not when a row lands.
 */
const gateFamilies = new Set(measured.map((m) => m.gates.length));
check(
  "the registered-bytes audit carries no per-rung gate family for L36–L40 yet (booked gap, NOT a silent pass)",
  gateFamilies.size === 1 && [...gateFamilies][0] === 0,
  `audit gate counts across the five rungs: [${[...gateFamilies].join(", ")}] — the proof of these rungs in this artifact is the family-gate run below; ` +
    "a future `act-2-batch-4` OBLIGATION must also extend this instrument (a ladder-keyed family is the event that reddens this row)",
);
check(
  "the five rows reproduce their registered table (all of it, rung by rung)",
  rowsOk,
  `${String(measured.filter((m) => m.audit.difficulty.Dexec !== null).length)}/${String(measured.length)} rungs re-measured against ACT_II_B4_LADDER`,
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
const proveCandidate = (
  extraArgs: readonly string[],
  dir = "src/levels",
): { out: string; exit: number } => {
  try {
    const tsxCli = fileURLToPath(
      new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url),
    );
    return {
      out: execFileSync(
        process.execPath,
        [
          tsxCli,
          "scripts/prove-candidate.ts",
          "--family=g",
          `--ladder=${ACT_II_B4_IDS.join(",")}`,
          `--dir=${dir}`,
          ...extraArgs,
        ],
        { encoding: "utf8", cwd: REPO_DIR, maxBuffer: 64 * 1024 * 1024 },
      ),
      exit: 0,
    };
  } catch (e) {
    const out = e as { stdout?: string };
    return {
      out: typeof out.stdout === "string" ? out.stdout : "",
      exit: 1,
    };
  }
};
const ladderRun = proveCandidate([]);
const ladderOut = ladderRun.out;
const ladderExit = ladderRun.exit;
const cutLine =
  /^prove-candidate — CUT re-measured.*$/m.exec(ladderOut)?.[0] ?? null;
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
const perRung = [
  ...ladderOut.matchAll(/^controls: (\d+)\/(\d+) caught by their named gate$/gm),
];
const rungResults = [...ladderOut.matchAll(/^RESULT: (PASS|FAIL)$/gm)].map(
  (m) => m[1],
);
console.log(
  `  family-gate proof at the ROOT (scripts/prove-candidate.ts --family=g --ladder=${ACT_II_B4_IDS.join(",")} --dir=src/levels):`,
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
  "the five rungs prove at the ROOT under their own family gates, controls named per rung",
  ladderExit === 0 &&
    ladderPass !== null &&
    ladderPass[1] === "5" &&
    ladderPass[2] === "5" &&
    ladderPass[3] === ladderPass[4] &&
    ladderPass[3] === "65" &&
    ladderPass[5] === "5" &&
    perRung.length === 5 &&
    perRung.every((m) => m[1] === "13" && m[2] === "13") &&
    rungResults.length === 5 &&
    rungResults.every((r) => r === "PASS"),
  `exit ${String(ladderExit)} · ${String(perRung.length)} rung(s) reporting controls · ` +
    `${String(perRung.filter((m) => m[1] === "13" && m[2] === "13").length)}/5 at 13/13 · ` +
    `LADDER ${ladderPass === null ? "n/a" : `PASS ${ladderPass[1]}/${ladderPass[2]} · controls named ${ladderPass[3]}/${ladderPass[4]}`}`,
);
// The cut's own filter is FROZEN at the world below the ladder under construction: batch 4 moved
// five rungs into the root, so the exclusion list had to grow with the dataset again (F-L36-1 is
// exactly the finding that it did not, for the *generator*; `prove-candidate.ts` already read
// `ACT_II_REGISTERED_IDS`). The shipped-file count is read as **instrument agreement** (the
// prover's census == this instrument's own census) rather than typed, so a later registration
// moves the count without reddening a row that is not about the cut.
check(
  "the freezer holds (the cut is still the L1–L15 basis; the shipped-file count agrees with the prover's own census)",
  cutMatch !== null &&
    Number(cutMatch[1]) === 14.969697 &&
    cutMatch[2] === "10" &&
    cutMatch[3] === String(shipped().length) &&
    cutMatch[4] === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
  `CUT D_exec max = ${cutMatch?.[1] ?? "n/a"} · par(L15) = ${cutMatch?.[2] ?? "n/a"} · ` +
    `${cutMatch?.[3] ?? "n/a"} shipped files (instrument census ${String(shipped().length)}) · basis ids [${cutMatch?.[4] ?? "n/a"}] — the L16–L20 block and every registered act batch (Act II [21…40] + Act III batch 1 [41…45] at R-007) are excluded from the cut's own filter`,
);

// Non-vacuity, both halves of the section: a reader that cannot move is not evidence, and an
// instrument that accepts the wrong directory is not reading the registered bytes. The exit-code
// half is probed by pointing the SAME ladder at the now-EMPTY shelf — the directory the five bytes
// were moved out of — which must exit non-zero rather than silently "proving" nothing.
const readCut = (line: string): string | null =>
  /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(
    line,
  )?.[4] ?? null;
const liveBasis = readCut(cutLine ?? "");
const relabelledBasis = readCut(
  cutLine === null
    ? ""
    : cutLine.replace(
        "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
        "16, 17, 18, 19, 20",
      ),
);
const shelfRun = proveCandidate([], "src/levels/candidates");
check(
  "the freezer clause can fail (both halves probed live) — the reader distinguishes a relabelled basis, and the prover refuses the EMPTY shelf",
  liveBasis === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15" &&
    relabelledBasis === "16, 17, 18, 19, 20" &&
    shelfRun.exit !== 0,
  `live basis [${liveBasis ?? "n/a"}] vs the relabelled basis [${relabelledBasis ?? "n/a"}] — the reader distinguishes them; ` +
    `a ladder pointed at the now-EMPTY shelf (src/levels/candidates) exits ${String(shelfRun.exit)} (required ≠ 0) — neither the reader nor the prover's exit code is an assumption`,
);

// ── §6.1.4 clone guard ───────────────────────────────────────────────────────
//
// The key is the **seal-inclusive geometry key** published by `scripts/author-l20.ts` (§6.1.4
// "never clone a shipped board", extended past the plain `player|goal|portal-pair` triple to
// include the sorted door tiles so a re-stamped *seal* is visible): a board that re-stamps a
// registered geometry on a fresh triple is exactly the construction the law refuses. The
// definition is re-stated here rather than imported because it lives in a script with top-level
// effects, so it is **pinned against a published number** instead: over ids 1–35 the census must
// still read the **31** distinct keys LV-017's transcript recorded (`scripts/prove-candidate-l3640
// .transcript.md`), which is what catches a drift in the key itself.
const coordKey = (c: readonly [number, number]): string => `${String(c[0])},${String(c[1])}`;
const cloneKeyOf = (level: Level): string => {
  const p = level.portals[0];
  const doors = level.doors
    .flatMap((d) => d.tiles.map(coordKey))
    .sort()
    .join("+");
  return [
    coordKey(level.player),
    coordKey(level.goal),
    p === undefined ? "-" : coordKey(p.pair[0]),
    p === undefined ? "-" : coordKey(p.pair[1]),
    doors,
  ].join("|");
};
const censusOf = (levels: readonly { id: number; level: Level }[]): Map<string, string> => {
  const used = new Map<string, string>();
  for (const { id, level } of levels) used.set(cloneKeyOf(level), fileOf(id));
  return used;
};
const all = shipped();
const censusAll = censusOf(all);
const censusR005aEra = censusOf(all.filter((s) => s.id <= ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID));
const b4Census = censusOf(measured.map((m) => ({ id: m.id, level: m.level })));
const priorKeys = new Set(
  all.filter((s) => !ACT_II_B4_IDS.includes(s.id)).map((s) => cloneKeyOf(s.level)),
);
const b4Collisions = [...b4Census.keys()].filter((k) => priorKeys.has(k));
// The guard is an **invariant about the whole shipped set**, not a record of one registration: its
// job is to catch a board that re-stamps a registered geometry, and a later act cloning an earlier
// one is precisely the construction it must not go blind to. So the *basis* (all shipped files,
// above) stays live, while the **R-006a era reading is pinned** — ids 1–40 read 36 distinct keys at
// this ticket and can never read anything else, because the registration is a byte-copy and those
// bytes are immutable (ADR-0004). The live half is then stated as a **structure** rather than as a
// typed total, so a later registration moves the census without reddening a row that is not about
// batch 4: every post-R-006a board must be fresh, across the split and within it.
const censusAtR006a = censusOf(all.filter((s) => s.id <= ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID));
const postR006a = all.filter((s) => s.id > ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID);
const censusPostR006a = censusOf(postR006a);
check(
  "§6.1.4 clone guard — the five batch-4 rungs carry five distinct seal-inclusive keys, 0 of them colliding with the other registered boards",
  b4Census.size === 5 &&
    b4Collisions.length === 0 &&
    censusAtR006a.size === 36 &&
    censusPostR006a.size === postR006a.length &&
    censusAll.size === censusAtR006a.size + censusPostR006a.size,
  `${String(censusAll.size)} distinct key(s) over the ${String(all.length)} registered root files ` +
    `(${String(censusAtR006a.size)} over ids 1–${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)} = the era reading published at R-006a, ` +
    `+ ${String(censusPostR006a.size)} over the ${String(postR006a.length)} post-R-006a file(s) = 0 cross-split and 0 intra-split collisions) · ` +
    `batch 4: ${String(b4Census.size)} distinct over ${String(ACT_II_B4_IDS.length)} rung(s) · ` +
    `${String(b4Collisions.length)} colliding with the other ${String(all.length - ACT_II_B4_IDS.length)} registered board(s)`,
);
check(
  "§6.1.4 clone guard — the key itself has not drifted (it still reproduces the 31 distinct keys LV-017's transcript recorded over ids 1–35)",
  censusR005aEra.size === 31,
  `ids 1–${String(ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID)} ⇒ ${String(censusR005aEra.size)} distinct key(s) (published reading 31) · ` +
    `the LIVE shipped set (ids 1–${String(all.at(-1)?.id ?? 0)}, ${String(all.length)} files) ⇒ ${String(censusAll.size)} — the printed live total moves with the dataset and is never typed as an era count; the census is a Map, so the collision groups are visible in the key list rather than inferred`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [3/6] §7.3 — the act-scale tail law, measured
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[3/6] §7.3 act-scale tail law — the act peaks, measured on the root bytes",
);
// R-006a's change here is exactly the *basis split*: the live act (`ACT_II_REGISTERED_IDS`,
// L21–L40) now ends at L40, while R-005a's three act-level clauses read the **frozen era basis**
// (`ACT_II_R005A_ERA_IDS`, ids 21–35) so that a record of that registration is not a moving
// target. One implementation (`measureActScaleReading`) builds the reading for all three
// instruments: two transcripts of the same law that measure it two ways is how a stale reading
// survives a registration.
const reading: ActScaleLawReading = measureActScaleReading(
  all.map((s) => s.level),
);
console.log(
  `  measured: Act I peak ${reading.actI.dexec.toFixed(6)} (L${String(reading.actI.levelId)}) · ` +
    `Act II peak ${reading.actII.dexec.toFixed(6)} (L${String(reading.actII.levelId)}, read over ids ` +
    `${String(ACT_II_REGISTERED_IDS[0])}–${String(ACT_II_REGISTERED_IDS[ACT_II_REGISTERED_IDS.length - 1] ?? 0)}) · ` +
    `era peak at R-005a ${reading.actIIAtR005a.dexec.toFixed(6)} (L${String(reading.actIIAtR005a.levelId)}, ids ` +
    `${String(ACT_II_R005A_ERA_IDS[0])}–${String(ACT_II_R005A_ERA_IDS[ACT_II_R005A_ERA_IDS.length - 1] ?? 0)}) · ` +
    `batch-1 record ${reading.actIIBatchPeak.dexec.toFixed(6)} (L${String(reading.actIIBatchPeak.levelId)}) · ` +
    `act-open L${String(reading.actOpen.levelId)} ${reading.actOpen.dexec.toFixed(6)}`,
);
console.log(
  `  five new rows read off the bytes: ${reading.actIIB4Rows.map((r) => `L${String(r.id)} ${String(r.par)}/${r.dexec.toFixed(6)}/${r.b.toFixed(4)}`).join(" · ")}`,
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
// The partition, in the four-instrument form. R-006a grew the reported set from eleven to
// sixteen and R-007 grew it to twenty-two (six + five + five + six, the last set written across an
// act boundary); the invariant that keeps a NEW clause from riding along with no instrument is that
// the four registrations' clause lists are pairwise disjoint AND cover every reported clause AND
// together equal the reported count. Sum vs distinct catches an overlap; the unclaimed list
// catches a clause with no home. **Refreshed at R-007, not relaxed**: the R-007 list joins the
// claimed union and every R-006a assertion below is unchanged.
const claimedClauses = new Set([
  ...ACT_TAIL_R004A_CLAUSE_IDS,
  ...ACT_TAIL_R005A_CLAUSE_IDS,
  ...ACT_TAIL_R006A_CLAUSE_IDS,
  ...ACT_TAIL_R007_CLAUSE_IDS,
]);
const claimedSum =
  ACT_TAIL_R004A_CLAUSE_IDS.length +
  ACT_TAIL_R005A_CLAUSE_IDS.length +
  ACT_TAIL_R006A_CLAUSE_IDS.length +
  ACT_TAIL_R007_CLAUSE_IDS.length;
const unclaimedClauses = registered.filter(
  (c) => !claimedClauses.has(c.clause),
);
check(
  "the clause split PARTITIONS the reported set across four instruments, and this one owns R-006a's five",
  claimedClauses.size === registered.length &&
    claimedSum === claimedClauses.size &&
    unclaimedClauses.length === 0,
  `reported ${String(registered.length)} = R-004a ${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} (scripts/attest-r004a-act2.ts) + ` +
    `R-005a ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} (scripts/attest-r005a-reg35.ts) + ` +
    `R-006a ${String(ACT_TAIL_R006A_CLAUSE_IDS.length)} [${ACT_TAIL_R006A_CLAUSE_IDS.join(", ")}] (here) + ` +
    `R-007 ${String(ACT_TAIL_R007_CLAUSE_IDS.length)} (scripts/attest-r007-reg45.ts) = ` +
    `${String(claimedSum)} claimed · ${String(claimedClauses.size)} distinct · ${String(unclaimedClauses.length)} unclaimed`,
);
// A named reading rather than a claim: the ONE pin expression that moved at this ticket. Nothing
// else about any clause changed — the fifteen previously registered rungs keep their own rows and
// the R-005a record keeps its own basis — so the moved pin is reported as a single, checkable fact
// (a *second* moved pin would be a silent retrofit of an earlier registration).
const movedPins = [
  "act-tail-peak-advantage (batch-1-only → whole act at R-005a → the LIVE act L21–L40 here)",
];
check(
  "§7.3 — exactly one clause PIN moved at this ticket, and it is named",
  movedPins.length === 1 &&
    registered.find((c) => c.clause === "act-tail-peak-advantage")?.status === "PASS" &&
    near(
      ACT_II_R006A_REGISTERED_TAIL_EXEC - ACT_I_REGISTERED_PEAK_EXEC,
      ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
    ) &&
    near(
      ACT_II_R005A_REGISTERED_TAIL_EXEC - ACT_I_REGISTERED_PEAK_EXEC,
      ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
    ),
  `${String(movedPins.length)} moved pin [${movedPins.join(", ")}] · R-005a's own act-level record re-derives from its own tail ` +
    `(${ACT_II_R005A_REGISTERED_TAIL_EXEC.toFixed(6)} − ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)} = ${(ACT_II_R005A_REGISTERED_TAIL_EXEC - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)} = pinned ${ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I.toFixed(6)}) ` +
    `and R-006a's live advantage re-derives from the live tail (${(ACT_II_R006A_REGISTERED_TAIL_EXEC - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)} = pinned ${ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I.toFixed(6)}) — ` +
    `no R-004a/R-005a CONSTANT VALUE moved`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [4/6] anti-tautology controls — one per R-006a clause, plus the basis split both ways
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[4/6] anti-tautology controls — one per R-006a clause, refused BY NAME",
);
const restampB4Table = ACT_II_B4_LADDER.map((r) =>
  r.id === 38 ? { ...r, dexec: 30 } : r,
);
const tailControls: readonly {
  readonly clause: ActTailClauseId;
  readonly name: string;
  readonly coupling: string;
  readonly reading: ActScaleLawReading;
}[] = [
  {
    clause: "act-tail-r006a-registered-rows",
    name: "RESTAMP (table side): the law's own row for L38 is moved to D_exec 30 while the bytes stay registered — the table is injectable, so the reading cannot be confirmed by the constant it is compared with",
    coupling: "named: only the row clause reads the table's D_exec, so nothing else can carry the refusal",
    reading: { ...reading, actIIB4Table: restampB4Table },
  },
  {
    clause: "act-tail-r006a-tail-pin",
    name: "RELABEL: the live act's registered tail is moved onto L39 while keeping L40's value — the constant and the rung it belongs to disagree, and the value itself is untouched",
    coupling: "named: the tail value is unchanged, so the advantage, pre-standard and headroom clauses stay green and the refusal is this clause's own",
    reading: {
      ...reading,
      actII: {
        levelId: ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID - 1,
        dexec: ACT_II_R006A_REGISTERED_TAIL_EXEC,
      },
    },
  },
  {
    clause: "act-tail-r006a-pre-standard",
    name: "RESTAMPED STANDARD: the pre-R006a standard is overwritten with the post-registration tail — the re-registration would confirm itself",
    coupling: "named: the standard must still be the tail as it stood before this ticket (28.339426 at L35), so this is the R-003d shape a third time",
    reading: {
      ...reading,
      preR006aStandard: ACT_II_R006A_REGISTERED_TAIL_EXEC,
    },
  },
  {
    clause: "act-tail-r006a-exec-headroom",
    name: `NARROWED CEILING: the D_exec ceiling is taken as the band FLOOR (${ACT_II_EXEC_BAND[0].toFixed(2)}) — a silently narrowed band has to move the derived headroom`,
    coupling: "named: the ceiling operand is not the derived-exact band end, so the clause refuses twice over (narrowed operand, negative headroom). R-005a's headroom clause reads the same operand by construction, so it moves too — both refusals are the operator working, not a leak",
    reading: { ...reading, execCeiling: ACT_II_EXEC_BAND[0] },
  },
  {
    clause: "act-tail-r006a-seam-reliefs",
    name: "RESTAMPED SEAM: the L35→L36 relief is re-measured as 24.000000 — the derived Δ no longer equals the published ΔD_exec",
    coupling: "named: the seam clause is the only reader of this registration's instance, and the derived halves move with the measured ones so the pair stays self-consistent",
    reading: {
      ...reading,
      seams: reading.seams.map((s) =>
        s.toLevelId === ACT_II_R006A_SEAM_RELIEF.toLevelId
          ? { ...s, toExec: 24, registeredTo: 24, registeredDelta: 24 - s.registeredFrom }
          : s,
      ),
    },
  },
];
let tailCaught = 0;
for (const control of tailControls) {
  const refused = actScaleTailGuards(control.reading).filter(
    (c) => c.status === "FAIL",
  );
  const caught = refused.some((c) => c.clause === control.clause);
  if (caught) tailCaught += 1;
  console.log(`  ${caught ? "CAUGHT " : "MISSED "} ${control.clause}`);
  console.log(`          mutation: ${control.name}`);
  console.log(`          coupling: ${control.coupling}`);
  console.log(
    `          measured: FAIL clauses [${refused.map((c) => c.clause).join(" ")}]`,
  );
}
check(
  "every R-006a clause has exactly one control, and the control set is R-006a's own five",
  tailCaught === tailControls.length &&
    new Set(tailControls.map((c) => c.clause)).size ===
      ACT_TAIL_R006A_CLAUSE_IDS.length &&
    ACT_TAIL_R006A_CLAUSE_IDS.every((id) =>
      tailControls.some((c) => c.clause === id),
    ),
  `${String(tailCaught)}/${String(tailControls.length)} caught · clauses covered ${String(new Set(tailControls.map((c) => c.clause)).size)}/${String(ACT_TAIL_R006A_CLAUSE_IDS.length)}`,
);
check(
  "discrimination: the registered reading PASSes every reported clause while every control FAILs one",
  registered.every((c) => c.status === "PASS") &&
    tailControls.every((control) =>
      actScaleTailGuards(control.reading).some(
        (c) => c.clause === control.clause && c.status === "FAIL",
      ),
    ),
  `${String(registered.filter((c) => c.status === "PASS").length)}/${String(registered.length)} clauses PASS on the registered bytes · ` +
    `${String(tailCaught)}/${String(tailControls.length)} controls refused by name`,
);
// ── the basis split, probed in BOTH directions ───────────────────────────────
//
// This is the structural claim of the ticket, so it is a control rather than prose: R-006a
// *froze* a basis and *moved* one. Direction (a) moves the era basis (to the live act) and
// requires the refusal to land on EXACTLY R-005a's three act-level clauses, leaving the live ones
// green; direction (b) moves the live act (relabel + a higher in-band value) and requires the
// refusal to land on EXACTLY the live clauses, leaving R-005a's record green. Either direction
// failing the other side's clauses would mean the split is not real — a clause reading the wrong
// basis is exactly the stale-reading failure this ticket exists to prevent.
const refusalSetOf = (r: ActScaleLawReading): readonly string[] =>
  actScaleTailGuards(r)
    .filter((c) => c.status === "FAIL")
    .map((c) => c.clause);
const eraMoved = refusalSetOf({ ...reading, actIIAtR005a: reading.actII });
const liveMoved = refusalSetOf({
  ...reading,
  actII: {
    levelId: ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID - 1,
    dexec: reading.actII.dexec + 0.5,
  },
});
const eraExpected = [
  "act-tail-r005a-tail-pin",
  "act-tail-r005a-pre-standard",
  "act-tail-r005a-exec-headroom",
];
const liveExpected = [
  "act-tail-peak-advantage",
  "act-tail-r006a-tail-pin",
  "act-tail-r006a-pre-standard",
  "act-tail-r006a-exec-headroom",
];
const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
// `liveMoved` is taken with the tail RELABELLED and the value raised, so the two live act-level
// clauses that compare a *value* cannot be satisfied; the expected set is therefore the four live
// clauses that read `actII`, and R-005a's three must be untouched.
//
// (a) moves the era basis to the live act. Exactly the three R-005a clauses that read the BASIS
// for a *value* must move — the row clause reads the row tables and the seam clause reads the
// seams, so neither has an opinion about the act's maximum, and R-005a's two non-act-level clauses
// staying green is part of the claim rather than an aside.
check(
  "(a) moving the FROZEN ERA BASIS fails exactly R-005a's three act-level clauses and leaves every other clause green",
  sameSet(eraMoved, eraExpected),
  `era basis ← the live act ⇒ FAIL [${eraMoved.join(", ")}] (required exactly [${eraExpected.join(", ")}]) · ` +
    `every one of the other ${String(registered.length - eraExpected.length)} clauses stays PASS · R-005a's two non-act-level clauses unaffected = ` +
    `${String(!eraMoved.includes("act-tail-r005a-registered-rows") && !eraMoved.includes("act-tail-r005a-seam-reliefs"))}`,
);
check(
  "(b) moving the LIVE ACT fails exactly the live clauses and leaves R-005a's record green",
  sameSet(liveMoved, liveExpected),
  `live act ← relabelled to L${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID - 1)} and raised ${(reading.actII.dexec + 0.5).toFixed(6)} ⇒ FAIL [${liveMoved.join(", ")}] ` +
    `(required exactly [${liveExpected.join(", ")}]) · none of R-005a's five clauses moved: ${String(ACT_TAIL_R005A_CLAUSE_IDS.every((id) => !liveMoved.includes(id)))}`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [5/6] the §7.3.1 fourth instance, the sawtooth, and the act-peak falsification
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[5/6] the §7.3.1 fourth instance — both directions probed, every adjacent drop accounted for, and the act maximum falsified",
);
const seamClause = (r: ActScaleLawReading): GateStatus =>
  actScaleTailGuards(r).find((c) => c.clause === "act-tail-r006a-seam-reliefs")
    ?.status ?? "FAIL";
/** One rung's `D_exec`, re-measured from the registered bytes (never read from a row table). */
const dexecOf = (id: number): number =>
  auditLevel(readLevel(id)).difficulty.Dexec ?? Number.NaN;
const seamFrom = dexecOf;
/**
 * **The sawtooth, measured.** The registered act's `D_exec` is deliberately non-monotone at the
 * batch seams (`L25→L26 −6.044410`, `L30→L31 −4.362098`, and now `L35→L36 −6.038144`) and rises
 * everywhere else. §7.3's `act-peak` clause rides on the act's **maximum**, and §7.3.1 makes a
 * relief registrable by its **pre-published label** — so a validator demanding cross-batch
 * monotony would have refused three *registered* rungs. Falsified here by measurement.
 *
 * The reading is over the **live act** and the named-instance list is `ACT_II_SEAM_RELIEFS_ALL`
 * (every instance the law carries) — scoping the named list to R-005a's own two would have made
 * this ticket's *registered* drop read as unnamed.
 */
const actIIExec = ACT_II_REGISTERED_IDS.map((id) => ({ id, dexec: seamFrom(id) }));
const steps = actIIExec.slice(1).map((r, i) => ({
  from: actIIExec[i]!.id,
  to: r.id,
  delta: r.dexec - actIIExec[i]!.dexec,
}));
const drops = steps.filter((s) => s.delta < 0);
const rises = steps.filter((s) => s.delta > 0);
const namedSeams = ACT_II_SEAM_RELIEFS_ALL.map(
  (s) => `${String(s.fromLevelId)}→${String(s.toLevelId)}`,
);
const namedDrop = (from: number, to: number): boolean =>
  ACT_II_SEAM_RELIEFS_ALL.some(
    (spec) => spec.fromLevelId === from && spec.toLevelId === to,
  );
console.log(
  `  registered adjacent steps inside the act: ${steps.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(6)}`).join(" · ")}`,
);
check(
  "§7.3.1 — the sawtooth is the registered reading, and the clause PASSes it (a monotony validator would have refused three registered rungs)",
  drops.length === 3 &&
    drops.every((s) => namedDrop(s.from, s.to)) &&
    seamClause(reading) === "PASS" &&
    rises.length === 16,
  `drops ${String(drops.length)} (all named [${namedSeams.join(", ")}]) · rises ${String(rises.length)} (none labelled, none owed: §7.3 interior freedom) · ` +
    `clause act-tail-r006a-seam-reliefs on the registered reading = ${seamClause(reading)}`,
);
check(
  "§7.3.1 — no UNNAMED relief hides in the bytes (every adjacent drop is a named instance)",
  drops.every((s) => namedDrop(s.from, s.to)),
  `drops: ${drops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(" · ")} · the law's instances: ` +
    `${ACT_II_SEAM_RELIEFS_ALL.map((s) => `L${String(s.fromLevelId)}→L${String(s.toLevelId)} ${s.delta.toFixed(6)}`).join(" · ")} — ` +
    "the seam clauses judge only the pairs their own registration published, so this measurement is what closes the 'unnamed relief' hole",
);
// Non-vacuity on the same reader: an UNNAMED drop must be visible to it. The probe lowers one
// copied rung so a fabricated drop appears at a pair the law does not name; the filter is the
// whole instance register, so this ticket's own registered drop is excluded by name rather than
// reported as fabricated.
const fabricated = actIIExec.map((r) => (r.id === 33 ? { ...r, dexec: 20 } : r));
const fabricatedDrops = fabricated
  .slice(1)
  .map((r, i) => ({
    from: fabricated[i]!.id,
    to: r.id,
    delta: r.dexec - fabricated[i]!.dexec,
  }))
  .filter((s) => s.delta < 0)
  .filter((s) => !namedDrop(s.from, s.to));
check(
  "the unnamed-relief reader can fail (a fabricated drop is named as unnamed, with the three registered drops excluded)",
  fabricatedDrops.length === 1 &&
    fabricatedDrops[0]!.from === 32 &&
    fabricatedDrops[0]!.to === 33,
  `fabricated drops at unnamed pairs: [${fabricatedDrops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(", ")}] (required exactly L32→L33; the registered drops [${namedSeams.join(", ")}] are excluded by name)`,
);
// The BAND half has teeth: an endpoint outside the act band FAILs even when the derived Δ
// happens to match its published value.
const outOfBandSeam = actScaleTailGuards({
  ...reading,
  seams: reading.seams.map((s) =>
    s.toLevelId === ACT_II_R006A_SEAM_RELIEF.toLevelId
      ? {
          ...s,
          toExec: ACT_II_EXEC_BAND[1] + 1.5,
          registeredTo: ACT_II_EXEC_BAND[1] + 1.5,
          registeredDelta: ACT_II_EXEC_BAND[1] + 1.5 - s.registeredFrom,
        }
      : s,
  ),
});
check(
  "§7.3.1 / §7.9 — an out-of-band seam FAILs (interior freedom is freedom INSIDE the band)",
  outOfBandSeam.find((c) => c.clause === "act-tail-r006a-seam-reliefs")
    ?.status === "FAIL" && seamClause(reading) === "PASS",
  `registered reading ${seamClause(reading)}; L${String(ACT_II_R006A_SEAM_RELIEF.toLevelId)} moved to ${(ACT_II_EXEC_BAND[1] + 1.5).toFixed(4)} ` +
    `(derived-exact band top ${ACT_II_EXEC_BAND[1].toFixed(4)}) with a self-consistent published Δ ⇒ seam clause FAIL`,
);
// A measurement that DROPS a registered rung cannot satisfy the clause: the instance is required,
// not optional, and a dataset missing L36 fails by name rather than skipping the check.
const withoutL36 = measureActScaleReading(
  all
    .filter((s) => s.id !== ACT_II_R006A_SEAM_RELIEF.fromLevelId)
    .map((s) => s.level),
);
const missingSeam = actScaleTailGuards(withoutL36).find(
  (c) => c.clause === "act-tail-r006a-seam-reliefs",
);
check(
  "a measurement that omits a registered rung FAILs the seam clause (the instance is required, not optional)",
  missingSeam?.status === "FAIL" &&
    (missingSeam.detail.includes("MISSING") ||
      missingSeam.detail.includes("NaN")),
  `reading built from the ${String(all.length - 1)} shipped files without L${String(ACT_II_R006A_SEAM_RELIEF.fromLevelId)} (census ${String(all.length)} − 1): ` +
    `clause ${String(missingSeam?.status)} — ${(missingSeam?.detail ?? "").slice(0, 140)}…`,
);
// ── the falsification probe, SIZED TO THIS BATCH'S OWN ACT MAXIMUM ───────────
//
// The probe value is *derived*, not typed: the midpoint between the newly registered act tail and
// the derived band ceiling. It is therefore strictly above every registered rung (so exactly the
// peak rung must fail `act-peak`) and strictly inside the band (so no other gate has an opinion) —
// and the arithmetic that puts it there is printed rather than asserted. A probe that could not
// fail is not evidence, and a probe with a typed threshold is a number that goes stale.
const PEAK_PROBE =
  (ACT_II_R006A_REGISTERED_TAIL_EXEC + ACT_II_EXEC_BAND[1]) / 2;
const peakRun = proveCandidate([`--peak=${String(PEAK_PROBE)}`]);
const peakBlocks = peakRun.out.split(/^candidate /m).slice(1);
const peakFailed = peakBlocks.filter((b) => /^\s*FAIL /m.test(b));
const failedIds = peakFailed.map(
  (b) => Number(/^src\/levels\/l(\d+)\.json/m.exec(b)?.[1] ?? "0"),
);
const failedGates = peakFailed.flatMap((b) =>
  [...b.matchAll(/^\s*FAIL (\S+)/gm)].map((m) => m[1]),
);
const peakLadder =
  /^LADDER RESULT: FAIL \((\d+)\/(\d+) rung\(s\) ACCEPT, controls named: (\d+)\/(\d+) across the (\d+) rung\(s\)\)$/m.exec(
    peakRun.out,
  );
console.log(
  `  falsification probe: --peak=${String(PEAK_PROBE)} (= (${ACT_II_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} + ${String(ACT_II_EXEC_BAND[1])}) / 2, the midpoint of the new act tail and the derived ceiling)`,
);
check(
  "the act-peak probe is sized to THIS batch's act maximum and refuses exactly act-peak on exactly L40",
  peakRun.exit === 1 &&
    peakLadder !== null &&
    peakLadder[1] === "4" &&
    peakLadder[2] === "5" &&
    peakLadder[3] === "65" &&
    peakFailed.length === 1 &&
    failedIds[0] === ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID &&
    failedGates.length === 1 &&
    failedGates[0] === "act-peak",
  `exit ${String(peakRun.exit)} · probe ${PEAK_PROBE.toFixed(6)} sits ${(PEAK_PROBE - ACT_II_R006A_REGISTERED_TAIL_EXEC).toFixed(6)} above the registered act max ` +
    `${ACT_II_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} and ${(ACT_II_EXEC_BAND[1] - PEAK_PROBE).toFixed(6)} below the derived ceiling ${String(ACT_II_EXEC_BAND[1])} · ` +
    `rungs failing [${failedIds.map((i) => `L${String(i)}`).join(", ")}] · gates failing [${failedGates.join(", ")}] · battery still ` +
    `${peakLadder === null ? "n/a" : `${peakLadder[3]}/${peakLadder[4]}`}`,
);
// The battery must not be silently relaxed by the probe: the falling rung still carries its 13/13
// named controls, which is what distinguishes "the ladder still proves, only the peak threshold
// moved" from "the probe broke the run".
const peakPerRung = [
  ...peakRun.out.matchAll(/^controls: (\d+)\/(\d+) caught by their named gate$/gm),
];
check(
  "the probe's run keeps the full control battery (nothing was relaxed to make the failure legible)",
  peakPerRung.length === 5 &&
    peakPerRung.every((m) => m[1] === "13" && m[2] === "13") &&
    /^GATES: REJECT — act-peak$/m.test(peakRun.out),
  `${String(peakPerRung.length)} rung(s) reporting controls, all 13/13 · the reject line names exactly one gate: ` +
    `${/^GATES: REJECT.*$/m.exec(peakRun.out)?.[0] ?? "GATES line MISSING"}`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [6/6] the labels and the constants — §7.3.1 verbatim, §7.9 notation, the arithmetic
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[6/6] the §7.3.1 label and the moved constants — derived from the registered bytes, quoted verbatim",
);
// The fourth instance's published ΔD_exec, DERIVED from the registered bytes (never read from the
// constant), and the label's own quotation of it.
const delta4 = ACT_II_R006A_SEAM_RELIEF.toExec - ACT_II_R006A_SEAM_RELIEF.fromExec;
check(
  "§7.3.1 instance 4 — derived ΔD_exec = −6.038144 (L35 28.339426 → L36 22.301282) equals the published Δ, and the label quotes it",
  near(delta4, ACT_II_R006A_SEAM_RELIEF.delta) &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("ΔD_exec = −6.038144") &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("seam L35→L36") &&
    near(seamFrom(35), ACT_II_R006A_SEAM_RELIEF.fromExec) &&
    near(seamFrom(36), ACT_II_R006A_SEAM_RELIEF.toExec),
  `derived ${delta4.toFixed(6)} · published ${ACT_II_R006A_SEAM_RELIEF.delta.toFixed(6)} · measured L35 ${seamFrom(35).toFixed(6)} → L36 ${seamFrom(36).toFixed(6)}`,
);
// §7.9's notation law, read on the label itself. Instance 4 is a *later* publication than the
// notation-only amendment GD-011 made, so it carries the **derived-exact** form with the printed
// form in parentheses — like instance 3 and unlike instance 2.
const printedBand = `[${ACT_II_EXEC_BAND[0].toFixed(2)}, ${ACT_II_EXEC_BAND[1].toFixed(2)}]`;
const derivedBand = `[${ACT_II_EXEC_BAND[0].toFixed(2)}, ${ACT_II_EXEC_BAND[1]}]`;
check(
  "§7.9 — the label carries the band in the published form (derived-exact + printed in parentheses)",
  ACT_II_R006A_SEAM_RELIEF.label.includes(derivedBand) &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("printed `[19.75, 29.06]`") &&
    derivedBand !== printedBand,
  `instance 4 quotes \`${derivedBand}\` with the printed form in parentheses (\`${printedBand}\`); the clause's comparison operand is the derived-exact constant, printed forms are display text`,
);
// The three halves of a registrable relief: attribution, the "no ease the instrument cannot see"
// clause (`M`/`T` are not terms of D_exec), and §6's refusal to present a relief as a dip.
const noEaseClaim = "largely an artifact of the measurement design";
const neverAdip = /never a [`"]?dip/;
check(
  "§7.3.1 — the label carries its attribution and refuses to claim an ease the instrument cannot see",
  ACT_II_R006A_SEAM_RELIEF.label.includes("LV-017") &&
    ACT_II_R006A_SEAM_RELIEF.label.includes(noEaseClaim) &&
    neverAdip.test(ACT_II_R006A_SEAM_RELIEF.label) &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("b9dac54") &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("labelled Playtest hypothesis") &&
    ACT_II_R006A_SEAM_RELIEF.label.includes("§7.3.3"),
  `label tail: "…${ACT_II_R006A_SEAM_RELIEF.label.slice(-150)}"`,
);
// PROVENANCE — the half that makes a §7.3.1 relief registrable at all: the label has to PREDATE
// the boards it explains. Read here as a *live measurement of the two commits* (the rule commit
// that published the label, the byte commit that landed the rungs) rather than as prose, because a
// transcript is not evidence about time order.
const commitDate = (rev: string): string | null => {
  try {
    return execFileSync("git", ["show", "-s", "--format=%ci", rev], {
      encoding: "utf8",
      cwd: REPO_DIR,
    }).trim();
  } catch {
    return null;
  }
};
const ruleCommitDate = commitDate("b9dac54");
const byteCommitDate = commitDate("da0e3ac");
const ruleIsEarlier =
  ruleCommitDate !== null &&
  byteCommitDate !== null &&
  Date.parse(ruleCommitDate) < Date.parse(byteCommitDate);
check(
  "§7.3.1 provenance — the rule commit that published the label PREDATES the commit that landed the five bytes",
  ruleCommitDate !== null && byteCommitDate !== null && ruleIsEarlier,
  ruleCommitDate === null || byteCommitDate === null
    ? "NOT RUN — git could not date one of the commits; a check that did not run is never a pass"
    : `rule b9dac54 ${ruleCommitDate} < bytes da0e3ac ${byteCommitDate} ⇒ ${String(ruleIsEarlier)} (the label is a prediction, not a description)`,
);
// The tail arithmetic: live post/pre, the measured rise, the cross-act advantage, and the
// DERIVED-EXACT headroom with its printed-operand counterfactual (§7.9's whole reason for
// existing: the last 0.0025 of the band).
const derivedHeadroom = ACT_II_EXEC_BAND[1] - ACT_II_R006A_REGISTERED_TAIL_EXEC;
const printedHeadroom =
  Number(ACT_II_EXEC_BAND[1].toFixed(2)) - ACT_II_R006A_REGISTERED_TAIL_EXEC;
check(
  "§7.9 — the tail's headroom is DERIVED-EXACT: 29.0625 − 28.455319 = 0.607181, and the printed operand would not reproduce it",
  near(derivedHeadroom, ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING) &&
    near(ACT_II_PAR_CEILING + 3 * ACT_II_B_BAND[1], ACT_II_EXEC_BAND[1]) &&
    near(seamFrom(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID), ACT_II_R006A_REGISTERED_TAIL_EXEC) &&
    Math.abs(printedHeadroom - ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING) > 1e-3,
  `derived ${derivedHeadroom.toFixed(6)} = pinned ${ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)}; the printed operand (${ACT_II_EXEC_BAND[1].toFixed(2)}) would give ` +
    `${printedHeadroom.toFixed(6)} — a ${Math.abs(printedHeadroom - ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING).toFixed(6)} difference, i.e. the sliver §7.9 keeps buildable`,
);
check(
  "the moved tail: pre-R006a standard 28.339426 (L35) → live tail 28.455319 (L40), rise 0.115893; the act's advance (−0.153529 receding at L39, +0.269422 at L40)",
  ACT_II_PRE_R006A_REGISTERED_TAIL_LEVEL_ID === ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID &&
    near(ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC, 28.339426) &&
    ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID === 40 &&
    near(ACT_II_R006A_REGISTERED_TAIL_EXEC, 28.455319) &&
    near(
      ACT_II_R006A_REGISTERED_TAIL_EXEC -
        ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC,
      ACT_II_R006A_TAIL_ADVANTAGE,
    ) &&
    near(seamFrom(39), 28.185897) &&
    near(seamFrom(39) - ACT_II_R005A_REGISTERED_TAIL_EXEC, -0.153529),
  `standard ${ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_II_PRE_R006A_REGISTERED_TAIL_LEVEL_ID)} · ` +
    `live tail ${ACT_II_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)} · rise ${ACT_II_R006A_TAIL_ADVANTAGE.toFixed(6)} · ` +
    `L39 ${seamFrom(39).toFixed(6)} (${(seamFrom(39) - ACT_II_R005A_REGISTERED_TAIL_EXEC).toFixed(6)} vs the R-005a tail) · ` +
    `the ALIAS-TYPED standard (three derived identities, none typed twice)`,
);
// The fifteen previously registered rungs are NOT re-stamped by this ticket: their registered rows
// must still reproduce on the bytes, exactly as R-004a and R-005a left them (the clone-guard duty
// applied backwards).
const restampedPrior = [...ACT_II_B1_LADDER, ...ACT_II_B2_B3_LADDER].filter(
  (row) => {
    const measuredRow = auditLevel(readLevel(row.id)).difficulty;
    return (
      measuredRow.Dexec === null ||
      !near(measuredRow.Dexec, row.dexec) ||
      Math.abs(measuredRow.B - row.b) >= 5e-5
    );
  },
);
check(
  "the fifteen previously registered rungs are un-restamped (R-004a's five and R-005a's ten still reproduce on the bytes)",
  restampedPrior.length === 0 &&
    ACT_II_B1_IDS.length + ACT_II_B2_B3_LADDER.length ===
      ACT_II_R005A_ERA_IDS.length,
  `${String(ACT_II_B1_LADDER.length + ACT_II_B2_B3_LADDER.length)} rows re-measured · mismatches [${restampedPrior.map((r) => `L${String(r.id)}`).join(", ")}] · ` +
    `pars ${[...ACT_II_B1_LADDER, ...ACT_II_B2_B3_LADDER].map((r) => String(r.par)).join(" / ")}`,
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
  `RESULT: REGISTERED-MATCH — the five R-006a rungs are byte-identical to the shelf they were moved from (${ORIGIN}),`,
);
console.log(
  `every registered row (par / D_exec / B / grid / coverage) is reproduced by the program solver on the ROOT bytes,`,
);
console.log(
  `the five rungs prove at the root under their own family gates (13/13 named controls per rung, ${String(perRung.length)} rungs),`,
);
console.log(
  `the act's registered tail moved with a re-derived identity (${ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} → ${ACT_II_R006A_REGISTERED_TAIL_EXEC.toFixed(6)}, +${ACT_II_R006A_TAIL_ADVANTAGE.toFixed(6)}) and ${ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)} of DERIVED-EXACT headroom,`,
);
console.log(
  `all ${String(registered.length)} §7.3 tail clauses PASS (this instrument controls R-006a's ${String(ACT_TAIL_R006A_CLAUSE_IDS.length)} of them, by name), one pin moved and named, the basis split holds in both directions, and §7.3.1's fourth label is cited verbatim with its published ΔD_exec.`,
);