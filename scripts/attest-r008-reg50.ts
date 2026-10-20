/**
 * `scripts/attest-r008-reg50.ts` — **R-008**: the registration re-attestation for **Act III
 * batch 2** (`l046`–`l050`, LV-019) and the §7.3 act-scale tail law read for the **first time over
 * a basis widened INSIDE an act** (`docs/level-design.md` §7.3 / §7.3.1 / §7.3.2 / §7.9 / §7.10.6
 * B1–B7 / §7.10.7).
 *
 * The fifth instrument of the train (`attest-r004a-act2` → `attest-r005a-reg35` →
 * `attest-r006a-reg40` → `attest-r007-reg45` → here), and the order is the same because the
 * *reason* is the same: a registration is a **byte-copy, never an edit**, and the law moves only
 * after the root bytes have been re-measured.
 *
 *   [1/6] **byte identity** — each new root file is `git`-hashed **and** `sha256`-hashed and
 *        compared with the shelf it was moved from at the dispatch base (`5b354bd5d`, LV-019's
 *        tip — the parent of the docs-only tip this train was cut from, and the commit at which
 *        the shelf still held `l046`–`l050`). A check that cannot run (git cannot answer) is a
 *        FAILURE, never a skip. The shelf is *also* read, and it is read as an **era state**
 *        rather than as a constant: this batch MOVED its five rungs out of it, so an **empty
 *        shelf (README only)** is this ticket's durable reading, and a level file carrying a
 *        registered id would mean the move silently became a copy (two byte-identical copies of
 *        one rung is exactly the drift `git mv` exists to prevent). The **successor name** is
 *        verified ABSENT from the **root** AND from the **shelf** by reading both directories:
 *        `l051`–`l060` are **UNBOOKED** (GD + Architect's XOR `H` device question is open, no
 *        ladder preview is published), so the absence is a measured fact, not an expectation.
 *   [2/6] **the five registered rows, re-measured on the ROOT bytes** — par (solver-stamped),
 *        `D_exec`, `B`, coverage, the all-OFF world, `T`/`R` and the audit's violation list, each
 *        against `ACT_III_B2_LADDER` (`@/core/solver/policy`, the law) and not against a note —
 *        **plus the family-gate proof at the root**, taken as `scripts/prove-candidate.ts`'s own
 *        stdout (its per-rung **13/13 controls by name**, its `par routes=… press-then-cross`
 *        line, its all-OFF line and its measured `LADDER RESULT`), **the frozen `measureCut()`
 *        line**, and the **§6.1.4 clone-guard census**. A control table re-implemented here would
 *        be a statement about *this file* instead of about the proof. (The census is also where
 *        **F-R008-3** lives: a *span caption* typed against a live value — `ids 1–45 ⇒ <live>`, the
 *        F-R007-2 class, caught in `attest-r007-reg45` at this refresh and repaired in both
 *        instruments rather than reported and left. The era reading is an explicit slice with its
 *        own pin; the live total carries a span derived from the shipped set.)
 *   [3/6] **§7.3's act-scale tail law** — the act peaks and the medium rows are **measured** and
 *        fed to `actScaleTailGuards`, which reports **twenty-eight** clauses (R-004a's six,
 *        R-005a's five, R-006a's five, R-007's six, R-008's six; the five sets are asserted to
 *        **partition** the reported set, so a clause with no instrument reddens a printed row).
 *        The **two Act III readings are separate fields**: `actIII` keeps R-007's era basis
 *        `41–45` (an era-frozen reading must not absorb ids it never saw) while `actIIIWidened`
 *        reads the widened set `41–50` — the **zero-move** is *computed* on that field, with the
 *        batch's own peak carried as an explicit **runner-up**.
 *   [4/6] **anti-tautology controls, one per R-008 clause** — a restamped batch-2 row table, a
 *        relabelled widened maximum, a **moved pre-registration standard**, a narrowed Act III
 *        ceiling, a **widened half-ceiling** (the geometry that would starve `L51–L60`), and an
 *        out-of-band seam. Each must FAIL **its own clause** by name, and the registered reading
 *        must PASS every reported clause. Then the **zero-move's non-vacuity, both directions and
 *        more**: a hypothetical **higher rung among the new ids** (the widened reading moves and
 *        the comparator follows it), the batch peak **reaching the tail**, the batch peak strictly
 *        below but at a **different margin**, the standard lowered, the standard raised, a `NaN`
 *        injection — and the **two-field separation probed as well**: moving the widened reading
 *        must leave R-007's six clauses green, and moving R-007's era field must leave R-008's six
 *        green. A zero that no injection can move is a tautology; that is why the clause carries a
 *        runner-up field and this instrument carries seven injections.
 *   [5/6] **§7.3.1's sixth instance, and the sawtooth across the widened act** — the registered
 *        drop passes its clause, an out-of-band seam FAILs, a measurement that omits a registered
 *        rung FAILs, *every* adjacent drop across the widened run is a named instance (five now),
 *        and the **falsification probe sized to batch 2's own act maximum** must refuse exactly
 *        `act-peak` on exactly `L50` while the rest of the ladder still proves.
 *   [6/6] **the labels, the constants, the B1–B7 rule and the prior fifty rungs** — the sixth
 *        instance's published `ΔD_exec` derived from the registered bytes and checked **as a
 *        bound** (inside §7.10.7's union *and* inside the admissible `par 22` half), §7.9's
 *        notation law read on the label itself, the **verbatim** label anchor and its
 *        **provenance** (rule commit → fill-in commit → byte commit, with the fill-in proved to
 *        PRECEDE the boards' existence by asking git for the file at that commit **on both
 *        paths**), §7.9's derived-exact headroom, B3's reservation, B4/B5's honest `Δpar` count
 *        and within-par maximum, B6's absent-never-substituted top, B7's anti-mirror, the lesson
 *        rows, and the **twenty-five** previously registered rungs (20 Act II + Act III batch 1)
 *        shown **un-restamped** alongside all fifty files' solver-stamped pars.
 *
 * `STOP_AND_ROUTE` (exit 1) is the only honest answer to a disagreement: the registered bytes are
 * immutable and are never re-authored to fit a later reading (ADR-0004).
 *
 *   npx tsx scripts/attest-r008-reg50.ts
 *   npx tsx scripts/attest-r008-reg50.ts --origin=<sha>:src/levels/candidates   # override the byte-identity source
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
  ACT_II_B1_LADDER,
  ACT_II_B2_B3_LADDER,
  ACT_II_B4_LADDER,
  ACT_II_REGISTERED_IDS,
  ACT_II_R006A_REGISTERED_TAIL_EXEC,
  ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_R005A_ERA_IDS,
  ACT_III_B1_IDS,
  ACT_III_B1_LADDER,
  ACT_III_B2_ANCHOR_PAR,
  ACT_III_B2_BATCH_PEAK_EXEC,
  ACT_III_B2_BATCH_PEAK_LEVEL_ID,
  ACT_III_B2_HALF_CEILING_EXEC,
  ACT_III_B2_HALF_CEILING_MARGIN,
  ACT_III_B2_IDS,
  ACT_III_B2_LADDER,
  ACT_III_B2_PAR_MULTISET,
  ACT_III_B2_PEAK_BELOW_TAIL,
  ACT_III_B2_SEAM_RELIEF,
  ACT_III_B2_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS,
  ACT_III_B2_SEAM_RELIEF_DELTA_RANGE,
  ACT_III_B2_TAIL_ZERO_MOVE,
  ACT_III_B_BAND,
  ACT_III_CEILING_RESERVATION_MARGIN,
  ACT_III_EXEC_BAND,
  ACT_III_OPENER_PAR_MULTISET,
  ACT_III_OPENER_TOP_PAR,
  ACT_III_PAR_CEILING,
  ACT_III_PAR_FLOOR,
  ACT_III_PRE_R008_REGISTERED_TAIL_EXEC,
  ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_REGISTERED_IDS,
  ACT_III_REGISTERED_TAIL_EXEC,
  ACT_III_REGISTERED_TAIL_LEVEL_ID,
  ACT_SEAM_RELIEFS_ALL,
  ACT_TAIL_R004A_CLAUSE_IDS,
  ACT_TAIL_R005A_CLAUSE_IDS,
  ACT_TAIL_R006A_CLAUSE_IDS,
  ACT_TAIL_R007_CLAUSE_IDS,
  ACT_TAIL_R008_CLAUSE_IDS,
  LAW_PRECISION,
  actScaleTailGuards,
  allOffShortestSolution,
  auditLevel,
  documentedLesson,
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
 * The commit and directory the five files were **moved from**: `5b354bd5d` is LV-019's tip — the
 * commit the registration train was cut from, and the commit at which the shelf still held
 * `l046`–`l050`. Overridable, because the origin is data about *this* registration rather than a
 * convention: a re-run against a moved shelf must say so out loud.
 */
const ORIGIN = argOf("origin") ?? "5b354bd5d:src/levels/candidates";
const ORIGIN_SHA = ORIGIN.slice(0, ORIGIN.indexOf(":"));
const ORIGIN_DIR = ORIGIN.slice(ORIGIN.indexOf(":") + 1);

/** The successor's name, which this ticket must NOT have created (read, never assumed). */
const SUCCESSOR_NAME = "l051.json";

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
  "attest-r008-reg50 — Act III batch 2 registration (L46–L50) + the §7.3 tail law at its FIRST act-internal widening",
);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(
  `origin:     L46–L50 ${ORIGIN} (the shelf the bytes were moved from)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [1/6] byte identity — sha256 + git blob, root vs shelf (the move is a MOVE)
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[1/6] byte identity — the registered root files are byte-copies, not edits",
);
const blobOf = (id: number): string | null => {
  try {
    return execFileSync("git", ["hash-object", join(LEVELS_DIR, fileOf(id))], {
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
};
const originBlobOf = (id: number): string | null => {
  try {
    return execFileSync(
      "git",
      ["rev-parse", `${ORIGIN_SHA}:${ORIGIN_DIR}/${fileOf(id)}`],
      { encoding: "utf8" },
    ).trim();
  } catch {
    return null;
  }
};
for (const id of ACT_III_B2_IDS) {
  const rootPath = join(LEVELS_DIR, fileOf(id));
  const sha = createHash("sha256").update(readFileSync(rootPath)).digest("hex");
  const rootBlob = blobOf(id);
  const shelfBlob = originBlobOf(id);
  const ran = rootBlob !== null && shelfBlob !== null;
  check(
    `${fileOf(id)} blob identity`,
    ran && rootBlob !== "" && rootBlob === shelfBlob,
    ran
      ? `root ${String(rootBlob)} == ${ORIGIN} ${String(shelfBlob)} (sha256 ${sha.slice(0, 12)}…)`
      : "NOT RUN — git could not answer; a check that did not run is never a pass",
  );
}
// The shelf is read as an *era state*, not as a constant. R-008 MOVED five files out of it, so at
// this tip it holds README only — the reading R-006a published and R-007 re-published one batch
// earlier. The durable half of the check is the one that does not go stale: **no shelf file may
// carry a registered id** (a candidate is lawful on the shelf precisely while it is NOT a
// registered rung), and every shelf id must be strictly above the registered root maximum.
const shelfEntries = readdirSync(SHELF_DIR).sort();
const shelfLevels = shelfEntries.filter((n) => /^l\d+\.json$/.test(n));
const shelfIds = shelfLevels.map((n) =>
  Number(/^l(\d+)\.json$/.exec(n)?.[1] ?? Number.NaN),
);
const rootMaxId = Math.max(...ACT_III_REGISTERED_IDS);
const shelfHoldsRegistered = shelfIds.filter((id) =>
  ACT_III_REGISTERED_IDS.includes(id),
);
const shelfAboveRootMax = shelfIds.every((id) => id > rootMaxId);
check(
  "the shelf is EMPTY of level files (R-008 MOVED the five rungs; a copy would have left them) and no shelf file carries a registered id",
  shelfLevels.length === 0 &&
    shelfHoldsRegistered.length === 0 &&
    shelfAboveRootMax &&
    shelfIds.length === shelfLevels.length,
  `src/levels/candidates holds ${String(shelfLevels.length)} level file(s) ` +
    `[${shelfEntries.join(" ")}] — README only · ids [${shelfIds.join(", ")}] (registered root max ${String(rootMaxId)}); ` +
    `shelf files carrying a registered id: [${shelfHoldsRegistered.join(", ")}] — ` +
    `the reading is era-scoped, so the durable half (no registered id on the shelf, every shelf id above the root max) is what a later occupancy has to satisfy`,
);
// The roster, read rather than assumed: 50 registered rungs, and the successor name ABSENT from
// the ROOT *and* from the shelf. A registration that also created `l051` anywhere would be a
// second, un-booked move — and `l051`'s ladder is not this ticket's to name (GD-013's second-half
// rule and the XOR `H` device question are open).
const rootNames = readdirSync(LEVELS_DIR)
  .filter((n) => /^l\d+\.json$/.test(n))
  .sort();
check(
  "the roster is exactly 50 registered rungs at the root, in one unbroken run (the dataset's halfway mark)",
  rootNames.length === 50 &&
    rootNames[0] === "l001.json" &&
    rootNames[49] === "l050.json" &&
    rootNames.every((n, i) => n === fileOf(i + 1)),
  `${String(rootNames.length)} files · first ${rootNames[0] ?? "n/a"} · last ${rootNames[49] ?? "n/a"} · ids 1…${String(rootNames.length)} with no gap · ` +
    `every file name matches l###.json for its index (a duplicate would fail here rather than pass the length check alone)`,
);
check(
  `the successor name ${SUCCESSOR_NAME} is ABSENT from the ROOT AND from the SHELF (read, not assumed)`,
  !rootNames.includes(SUCCESSOR_NAME) &&
    !shelfEntries.includes(SUCCESSOR_NAME),
  `root holds ${String(rootNames.filter((n) => n === SUCCESSOR_NAME).length)} ${SUCCESSOR_NAME} and the shelf holds ` +
    `${String(shelfEntries.filter((n) => n === SUCCESSOR_NAME).length)} — ${SUCCESSOR_NAME}–l060 are UNBOOKED: this ticket publishes NO ladder for them ` +
    `(the second half's rule waits on the GD + Architect XOR \`H\` device question), so the absence is measured rather than expected`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [2/6] the five registered rows, re-measured from the ROOT bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[2/6] the registered rows — re-measured from the ROOT bytes, never read from a note",
);
const measured = ACT_III_B2_LADDER.map((row) => {
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
    `${String(m.level.width)} × ${String(m.level.height)} · distinctPositions=${String(m.result.distinctPositions)} of ${String(m.level.width * m.level.height)} · registered ${String(row.grid[0])} × ${String(row.grid[1])} / ${String(row.coverage)} (§7.10.5's ` +
      `second-half frame: the same 7×7 @ CX = 1 device class the opener registered, ΔM = 0)`,
  );
  check(
    `${fileOf(m.id)} all-OFF world is UNSATISFIABLE (switchRequired MEASURED, never decreed)`,
    allOffOk,
    `allOffShortest=${m.allOff === null ? "null" : String(m.allOff)} · allOffGoalReachable=${String(m.audit.allOffGoalReachable)} ` +
      `· subgraph ${String(m.audit.allOffReachableStates)}/${String(m.result.reachableStates)} states ⇒ a press is required, since with every switch OFF the goal is not in the reachable set`,
  );
  check(
    `${fileOf(m.id)} audit violations empty`,
    cleanOk,
    `${String(m.audit.violations.length)} violation(s) · per-rung gate families reported by the audit: ${String(m.audit.gates.length)} · ` +
      `reachableStates=${String(m.result.reachableStates)} · dualPhaseTiles=${String(m.result.dualPhaseTiles)} · ` +
      `refusedBeforeEnteredTiles=${String(m.result.refusedBeforeEnteredTiles)} · maxDepth=${String(m.result.maxDepth)} · M=${String(m.audit.difficulty.M)}`,
  );
}
/*
 * A named, printed reading rather than a silent pass — and the same gap R-007 recorded, one batch
 * later. The audit dispatches its per-rung gate families from the *documented lesson row*
 * (`DOCUMENTED_LESSONS`); the five rows **exist** (`l046`–`l050`) but they dispatch **no family**:
 * the act's per-rung readers (`act2Batch1Gates`) key their rung on `ACT_II_B1_IDS` and read
 * `ACT_II_B1_LADDER`, so a value there would mis-key these boards or graft an Act II rung onto
 * another block's law. The five rungs therefore carry **no registered per-rung gate family**, and
 * their proof at this ticket is the family-gate run below (`scripts/prove-candidate.ts`, 13/13
 * named controls per rung). Recorded so the gap is visible in the artifact rather than inferred
 * from a zero — booked for a later ticket as an `act-3-batch-2` **family** (obligation behind an
 * `ACT_III_B2_LADDER`-keyed reader: design content + QA's one-control-per-code table + the re-pin),
 * exactly as R-007 booked `act-3-batch-1`. This row reddens exactly when a **family** lands — not
 * when a row lands.
 */
const gateFamilies = new Set(measured.map((m) => m.audit.gates.length));
check(
  "the registered-bytes audit carries no per-rung gate family for L46–L50 yet (booked gap, NOT a silent pass)",
  gateFamilies.size === 1 && [...gateFamilies][0] === 0,
  `audit gate counts across the five rungs: [${[...gateFamilies].join(", ")}] — the proof of these rungs in this artifact is the family-gate run below; ` +
    "a future `act-3-batch-2` OBLIGATION must also extend this instrument (a ladder-keyed family is the event that reddens this row)",
);
check(
  "the five rows reproduce their registered table (all of it, rung by rung)",
  rowsOk,
  `${String(measured.filter((m) => m.audit.difficulty.Dexec !== null).length)}/${String(measured.length)} rungs re-measured against ACT_III_B2_LADDER · ` +
    `pars ${ACT_III_B2_LADDER.map((r) => String(r.par)).join(" / ")} = §7.10.6 B4's published multiset ${ACT_III_B2_PAR_MULTISET.join(" / ")}`,
);
console.log("");

// ── the family-gate proof, taken from the prover's own stdout ────────────────
//
// `scripts/prove-candidate.ts` is the authoring prover and the ONLY place the family gates
// (`g0`–`g6`) and their control table live. Re-implementing its table here would make [2/6] a
// statement about this file, so the proof is read as the instrument's own lines: per-rung
// `controls: 13/13 caught by their named gate`, the per-rung `latch-route` / `latch-grade` /
// `coverage` readings and the measured `LADDER RESULT`. `--dir=src/levels` points it at the
// **registered** bytes (not the shelf), which is what makes this a registration proof rather than
// an authoring one. `--act=3` is what selects §7.10's bands for this ladder.
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
          "--act=3",
          "--family=g",
          `--ladder=${ACT_III_B2_IDS.join(",")}`,
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
const ladderPass =
  /^LADDER RESULT: PASS \((\d+)\/(\d+) rung\(s\) ACCEPT, controls named: (\d+)\/(\d+) across the (\d+) rung\(s\)\)$/m.exec(
    ladderRun.out,
  );
const cutLine = /^prove-candidate — CUT re-measured.*$/m.exec(ladderRun.out)?.[0] ?? null;
const cutMatch =
  /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(
    cutLine ?? "",
  );
const perRung = [
  ...ladderRun.out.matchAll(/^controls: (\d+)\/(\d+) caught by their named gate$/gm),
];
const rungBench = [...ladderRun.out.matchAll(/^par=(?<par>\d+) D_exec=(?<dexec>[\d.]+) B=(?<b>[\d.]+) /gm)];
const rungRoutes = [
  ...ladderRun.out.matchAll(/^  ok   latch-route      par routes=(\d+); press-then-cross on (\d+) \(G2\)$/gm),
];
const rungAllOff = [
  ...ladderRun.out.matchAll(/^  ok   latch-grade      allOffShortest=null \(all-OFF world UNSATISFIABLE\)/gm),
];
const rungPeak = [
  ...ladderRun.out.matchAll(/^  ok   act-peak .*ladder peak rung = L(\d+)$/gm),
];
const batchPeakLine =
  /^batch peak: L(\d+) at ([\d.]+) · Previous act's registered max ([\d.]+) · §7.3 act-peak clause (DISCHARGED|NOT DISCHARGED)/m.exec(
    ladderRun.out,
  );
console.log(
  `  family-g ladder run: exit ${String(ladderRun.exit)} · ${String(perRung.length)} rung(s) reporting controls`,
);
check(
  "the five rungs prove at the ROOT under their own family gates (13/13 named controls per rung)",
  ladderRun.exit === 0 &&
    ladderPass !== null &&
    ladderPass[1] === "5" &&
    ladderPass[2] === "5" &&
    ladderPass[3] === "65" &&
    ladderPass[4] === "65" &&
    perRung.length === 5 &&
    perRung.every((m) => m[1] === "13" && m[2] === "13"),
  `exit ${String(ladderRun.exit)} · ${String(perRung.length)} rung(s) reporting controls · ` +
    `${String(perRung.filter((m) => m[1] === "13" && m[2] === "13").length)}/5 at 13/13 · ` +
    `LADDER ${ladderPass === null ? "n/a" : `PASS ${ladderPass[1]}/${ladderPass[2]} · controls named ${ladderPass[3]}/${ladderPass[4]}`}`,
);
check(
  "the prover's own per-rung readings agree with this instrument's (par / press-then-cross / all-OFF / peak rung / batch peak)",
  rungBench.length === 5 &&
    rungBench.every(
      (m, i) =>
        Number(m.groups?.par) === ACT_III_B2_LADDER[i]?.par &&
        near(Number(m.groups?.dexec), ACT_III_B2_LADDER[i]?.dexec ?? Number.NaN),
    ) &&
    rungRoutes.length === 5 &&
    rungRoutes.every((m) => m[1] === m[2] && Number(m[1]) > 0) &&
    rungAllOff.length === 5 &&
    rungPeak.length === 5 &&
    rungPeak.every((m) => Number(m[1]) === ACT_III_B2_BATCH_PEAK_LEVEL_ID) &&
    batchPeakLine !== null &&
    Number(batchPeakLine[1]) === ACT_III_B2_BATCH_PEAK_LEVEL_ID &&
    near(Number(batchPeakLine[2]), ACT_III_B2_BATCH_PEAK_EXEC) &&
    near(Number(batchPeakLine[3]), ACT_II_R006A_REGISTERED_TAIL_EXEC) &&
    batchPeakLine[4] === "DISCHARGED",
  `printed par/D_exec per rung [${rungBench.map((m) => `${String(m.groups?.par)}/${String(m.groups?.dexec)}`).join(", ")}] · ` +
    `parRoutes ${rungRoutes.map((m) => `${String(m[1])}/${String(m[2])}`).join(" ")} all press-then-cross · ` +
    `all-OFF line present on ${String(rungAllOff.length)}/5 · the ladder's own peak rung L${rungPeak.map((m) => String(m[1])).join(", L")} · ` +
    `prover's batch-peak line: "${batchPeakLine?.[0] ?? "MISSING"}"`,
);
// The cut's own filter is FROZEN at the world below the ladder under construction: Act III moved
// five more rungs into the root, so the exclusion list had to grow with the dataset a **sixth**
// time (F-R008-2 is the finding that the recurrence direction is caught by the printed basis line
// and the escalation verdict rather than by the `missingExcluded` tooth — named, not repaired).
// The shipped-file count is read as **instrument agreement** (the prover's census == this
// instrument's own census) rather than typed, so a later registration moves the count without
// reddening a row that is not about the cut.
check(
  "the freezer holds (the cut is still the L1–L15 basis; the shipped-file count agrees with the prover's own census)",
  cutMatch !== null &&
    Number(cutMatch[1]) === 14.969697 &&
    cutMatch[2] === "10" &&
    cutMatch[3] === String(shipped().length) &&
    cutMatch[4] === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
  `CUT D_exec max = ${cutMatch?.[1] ?? "n/a"} · par(L15) = ${cutMatch?.[2] ?? "n/a"} · ` +
    `${cutMatch?.[3] ?? "n/a"} shipped files (instrument census ${String(shipped().length)}) · basis ids [${cutMatch?.[4] ?? "n/a"}] — ` +
    `the L16–L20 block and every registered Act II/III rung are excluded from the cut's own filter`,
);

// Non-vacuity, both halves of the section: a reader that cannot move is not evidence, and an
// instrument that accepts the wrong directory is not reading the registered bytes. The exit-code
// half is probed by pointing the SAME ladder at the shelf (`src/levels/candidates`) — a directory
// that does NOT hold these rungs (R-008 emptied it) — which must exit non-zero rather than
// silently "proving" nothing.
const readCutBasis = (line: string): string | null =>
  /basis ids \[([\d, ]+)\]/.exec(line)?.[1] ?? null;
const liveBasis = readCutBasis(cutLine ?? "");
const relabelledBasis = readCutBasis(
  cutLine === null
    ? ""
    : cutLine.replace(
        "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15",
        "16, 17, 18, 19, 20",
      ),
);
const shelfRun = proveCandidate([], "src/levels/candidates");
check(
  "the freezer clause can fail (both halves probed live) — the reader distinguishes a relabelled basis, and the prover refuses a directory without the registered ladder",
  liveBasis === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15" &&
    relabelledBasis === "16, 17, 18, 19, 20" &&
    shelfRun.exit !== 0,
  `live basis [${liveBasis ?? "n/a"}] vs the relabelled basis [${relabelledBasis ?? "n/a"}] — the reader distinguishes them; ` +
    `a ladder pointed at the shelf (src/levels/candidates, which now holds no level file at all) exits ${String(shelfRun.exit)} (required ≠ 0) — neither the reader nor the prover's exit code is an assumption`,
);

// ── §6.1.4 clone guard ───────────────────────────────────────────────────────
//
// The key is the **seal-inclusive geometry key** published by `scripts/author-l20.ts` (§6.1.4
// "never clone a shipped board", extended past the plain `player|goal|portal-pair` triple to
// include the sorted door tiles so a re-stamped *seal* is visible). The definition is re-stated
// here rather than imported because it lives in a script with top-level effects, so it is **pinned
// against a published number** instead: over ids 1–35 the census must still read the **31** distinct
// keys LV-017's transcript recorded, and over ids 1–40 the **36** R-006a's census read — which is
// what catches a drift in the key itself. R-008 extends the same census by the five new boards.
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
const censusOf = (
  levels: readonly { id: number; level: Level }[],
): Map<string, string> => {
  const used = new Map<string, string>();
  for (const { id, level } of levels) used.set(cloneKeyOf(level), fileOf(id));
  return used;
};
const all = shipped();
const censusAll = censusOf(all);
const censusR005aEra = censusOf(
  all.filter((s) => s.id <= ACT_II_R005A_ERA_IDS[ACT_II_R005A_ERA_IDS.length - 1]!),
);
const censusR006aEra = censusOf(
  all.filter((s) => s.id <= ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID),
);
const censusA3B1 = censusOf(
  all.filter((s) => ACT_III_B1_IDS.includes(s.id)),
);
const batchCensus = censusOf(measured.map((m) => ({ id: m.id, level: m.level })));
const priorKeys = new Set(
  all.filter((s) => !ACT_III_B2_IDS.includes(s.id)).map((s) => cloneKeyOf(s.level)),
);
const batchCollisions = [...batchCensus.keys()].filter((k) => priorKeys.has(k));
// F-R008-3 (same class, caught here before it could be committed): a span caption is never typed —
// the era reading is an explicit slice with its own pin and the live total carries a derived span.
const registeredTop = Math.max(...ACT_III_B2_IDS);
const censusThruR008 = censusOf(all.filter((s) => s.id <= registeredTop));
const censusPostR008 = censusOf(all.filter((s) => s.id > registeredTop));
check(
  "§6.1.4 clone guard — the five batch-2 rungs carry five distinct seal-inclusive keys, 0 of them colliding with the other registered boards",
  batchCensus.size === 5 &&
    batchCollisions.length === 0 &&
    censusA3B1.size === ACT_III_B1_IDS.length,
  `${String(censusAll.size)} distinct key(s) over the ${String(all.length)} registered root files ` +
    `(Act III batch 1 ⇒ ${String(censusA3B1.size)} distinct, + ${String(batchCensus.size)} ⇒ the new batch's five are all FRESH: ` +
    `0 cross-act and 0 intra-batch collisions) · collisions with the other ${String(all.length - ACT_III_B2_IDS.length)} board(s): [${batchCollisions.join(", ")}]`,
);
check(
  "§6.1.4 clone guard — the key itself has not drifted (it still reproduces the 31 keys over ids 1–35 and the 36 over ids 1–40)",
  censusR005aEra.size === 31 && censusR006aEra.size === 36,
  `ids 1–${String(ACT_II_R005A_ERA_IDS[ACT_II_R005A_ERA_IDS.length - 1])} ⇒ ${String(censusR005aEra.size)} distinct key(s) (published reading 31) · ` +
    `ids 1–${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)} ⇒ ${String(censusR006aEra.size)} (published reading 36) · ` +
    `the LIVE shipped set (ids 1–${String(all.at(-1)?.id ?? 0)}, ${String(all.length)} files) ⇒ ${String(censusAll.size)} — the printed live total moves with the dataset and is never typed as an era count; the census is a Map, so the collision groups are visible in the key list rather than inferred`,
);
check(
  "the census grows by exactly the registered batches (the pre-Act-III keys + Act III batch 1 + this batch = the pinned era total, and later files only ever add)",
  censusThruR008.size === censusR006aEra.size + censusA3B1.size + batchCensus.size &&
    censusThruR008.size === 46 &&
    censusAll.size === censusThruR008.size + censusPostR008.size,
  `${String(censusR006aEra.size)} (ids 1–40) + ${String(censusA3B1.size)} (batch 1) + ${String(batchCensus.size)} (batch 2) = ${String(censusThruR008.size)} distinct over ids 1–${String(registeredTop)} (pinned 46 — the era reading this registration establishes) · ` +
    `the LIVE set ⇒ ${String(censusAll.size)} over ${String(all.length)} file(s) (= the era total + ${String(censusPostR008.size)} post-R-008) — ` +
    `an intra-batch clone or a re-used Act III geometry would make the sum fail while the collision list stayed empty`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [3/6] §7.3 — the act-scale tail law, measured (first widening INSIDE an act)
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[3/6] §7.3 act-scale tail law — the widened basis read from its OWN field, measured on the root bytes",
);
// One implementation (`measureActScaleReading`) builds the reading for all five instruments: five
// transcripts of the same law that measure it five ways is how a stale reading survives a
// registration.
const reading: ActScaleLawReading = measureActScaleReading(
  all.map((s) => s.level),
);
console.log(
  `  measured: Act I peak ${reading.actI.dexec.toFixed(6)} (L${String(reading.actI.levelId)}) · ` +
    `Act II peak ${reading.actII.dexec.toFixed(6)} (L${String(reading.actII.levelId)}) · ` +
    `era peak at R-005a ${reading.actIIAtR005a.dexec.toFixed(6)} (L${String(reading.actIIAtR005a.levelId)}) · ` +
    `Act III peak, R-007's basis ${String(ACT_III_B1_IDS[0])}–${String(ACT_III_B1_IDS[ACT_III_B1_IDS.length - 1] ?? 0)}: ${reading.actIII.dexec.toFixed(6)} (L${String(reading.actIII.levelId)}) · ` +
    `WIDENED basis ${String(ACT_III_REGISTERED_IDS[0])}–${String(ACT_III_REGISTERED_IDS[ACT_III_REGISTERED_IDS.length - 1] ?? 0)}: ${reading.actIIIWidened.dexec.toFixed(6)} (L${String(reading.actIIIWidened.levelId)}) · ` +
    `batch-2 runner-up ${reading.actIIIWidenedBatchPeak.dexec.toFixed(6)} (L${String(reading.actIIIWidenedBatchPeak.levelId)}) · ` +
    `pre-R008 standard ${reading.preR008Standard.toFixed(6)} at L${String(ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID)} · ` +
    `Act III ceiling ${reading.actIIIExecCeiling.toFixed(4)} · B3 half ceiling ${reading.actIIIHalfCeiling.toFixed(4)}`,
);
console.log(
  `  five new rows read off the bytes: ${reading.actIIIBatch2Rows.map((r) => `L${String(r.id)} ${String(r.par)}/${r.dexec.toFixed(6)}/${r.b.toFixed(4)}`).join(" · ")}`,
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
// The partition, in the five-instrument form. R-006a grew the reported set from eleven to sixteen,
// R-007 grew it to twenty-two across an act boundary, and R-008 grows it to **twenty-eight** as an
// act's basis widens inside itself; the invariant that keeps a NEW clause from riding along with no
// instrument is that the five registrations' clause lists are pairwise disjoint AND cover every
// reported clause AND together equal the reported count. Sum vs distinct catches an overlap; the
// unclaimed list catches a clause with no home. **Refreshed at R-008, not relaxed**: the R-008 list
// joins the claimed union and the assertion that "no earlier *constant value* moved" is unchanged —
// the same refresh the four earlier instruments carry.
const claimedClauses = new Set<ActTailClauseId>([
  ...ACT_TAIL_R004A_CLAUSE_IDS,
  ...ACT_TAIL_R005A_CLAUSE_IDS,
  ...ACT_TAIL_R006A_CLAUSE_IDS,
  ...ACT_TAIL_R007_CLAUSE_IDS,
  ...ACT_TAIL_R008_CLAUSE_IDS,
]);
const claimedSum =
  ACT_TAIL_R004A_CLAUSE_IDS.length +
  ACT_TAIL_R005A_CLAUSE_IDS.length +
  ACT_TAIL_R006A_CLAUSE_IDS.length +
  ACT_TAIL_R007_CLAUSE_IDS.length +
  ACT_TAIL_R008_CLAUSE_IDS.length;
const unclaimedClauses = registered.filter((c) => !claimedClauses.has(c.clause));
check(
  "the clause split PARTITIONS the reported set across five instruments, and this one owns R-008's six",
  claimedClauses.size === registered.length &&
    claimedSum === claimedClauses.size &&
    unclaimedClauses.length === 0 &&
    ACT_TAIL_R008_CLAUSE_IDS.length === 6 &&
    registered.length === 28,
  `reported ${String(registered.length)} = R-004a ${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} (scripts/attest-r004a-act2.ts) + ` +
    `R-005a ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} (scripts/attest-r005a-reg35.ts) + ` +
    `R-006a ${String(ACT_TAIL_R006A_CLAUSE_IDS.length)} (scripts/attest-r006a-reg40.ts) + ` +
    `R-007 ${String(ACT_TAIL_R007_CLAUSE_IDS.length)} (scripts/attest-r007-reg45.ts) + ` +
    `R-008 ${String(ACT_TAIL_R008_CLAUSE_IDS.length)} [${ACT_TAIL_R008_CLAUSE_IDS.join(", ")}] (here) = ` +
    `${String(claimedSum)} claimed · ${String(claimedClauses.size)} distinct · ${String(unclaimedClauses.length)} unclaimed`,
);
// The structural claim of THIS ticket, as a measurement rather than a paragraph: the era basis
// (`actIII`, ids 41–45) and the widened reading (`actIIIWidened`, ids 41–50) are **two fields**.
// R-007's six clauses keep reading the era field, R-008's six the widened one — so a later batch
// can move the widened maximum without silently re-interpreting what R-007 registered.
check(
  "the widened basis is read from its OWN field (an implementation that re-used `actIII` would publish R-007's era basis as the widened reading)",
  near(reading.actIII.dexec, ACT_III_REGISTERED_TAIL_EXEC) &&
    reading.actIII.levelId === ACT_III_REGISTERED_TAIL_LEVEL_ID &&
    near(reading.actIIIWidened.dexec, ACT_III_REGISTERED_TAIL_EXEC) &&
    reading.actIIIWidened.levelId === ACT_III_REGISTERED_TAIL_LEVEL_ID &&
    near(reading.actIIIWidenedBatchPeak.dexec, ACT_III_B2_BATCH_PEAK_EXEC) &&
    reading.actIIIWidenedBatchPeak.levelId === ACT_III_B2_BATCH_PEAK_LEVEL_ID &&
    ACT_III_REGISTERED_IDS.length ===
      ACT_III_B1_IDS.length + ACT_III_B2_IDS.length &&
    reading.actIII.dexec !== reading.actII.dexec,
  `era field reads ${reading.actIII.dexec.toFixed(6)} at L${String(reading.actIII.levelId)} (basis ${String(ACT_III_B1_IDS[0])}–${String(ACT_III_B1_IDS[4])}, ${String(ACT_III_B1_IDS.length)} ids) · ` +
    `widened field reads ${reading.actIIIWidened.dexec.toFixed(6)} at L${String(reading.actIIIWidened.levelId)} (basis ${String(ACT_III_REGISTERED_IDS[0])}–${String(ACT_III_REGISTERED_IDS[9])}, ${String(ACT_III_REGISTERED_IDS.length)} ids) · ` +
    `runner-up ${reading.actIIIWidenedBatchPeak.dexec.toFixed(6)} at L${String(reading.actIIIWidenedBatchPeak.levelId)} · Act II's field stays ${reading.actII.dexec.toFixed(6)} — three acts, three fields`,
);
// THE MAX COMPARATOR, made explicit: the widened maximum is the maximum **of the ten registered
// rungs' own measured `D_exec`**, so the claim "the comparator selected L45" is checked by
// comparing every one of the ten rather than by trusting the field. If any new rung reached or
// passed the tail, this check names it — and the runner-up's identity pins the *runner-up* to the
// batch's own measured maximum, so a dataset where L45 is the max only because the batch is
// missing would fail here too.
const batchDexecs = measured.map((m) => m.audit.difficulty.Dexec);
const batchMaxMeasured = Math.max(...batchDexecs.map((d) => d ?? Number.NaN));
const rungsAtOrAboveTail = measured
  .filter((m) => (m.audit.difficulty.Dexec ?? Number.NaN) >= reading.actIIIWidened.dexec)
  .map((m) => `L${String(m.id)}`);
check(
  "the max comparator EXPLICITLY selects L45 over the widened set: every one of the ten registered rungs is compared, and no batch-2 rung reaches the tail",
  rungsAtOrAboveTail.length === 0 &&
    near(batchMaxMeasured, ACT_III_B2_BATCH_PEAK_EXEC) &&
    near(batchMaxMeasured, reading.actIIIWidenedBatchPeak.dexec) &&
    near(
      reading.actIIIWidened.dexec - reading.actIIIWidenedBatchPeak.dexec,
      ACT_III_B2_PEAK_BELOW_TAIL,
    ) &&
    reading.actIIIWidenedBatchPeak.dexec < reading.actIIIWidened.dexec &&
    measured.every((m) => (m.audit.difficulty.Dexec ?? Number.NaN) < reading.actIIIWidened.dexec),
  `widened max ${reading.actIIIWidened.dexec.toFixed(6)} (L${String(reading.actIIIWidened.levelId)}) vs the five measured batch rows ` +
    `[${measured.map((m) => (m.audit.difficulty.Dexec ?? Number.NaN).toFixed(6)).join(", ")}] ⇒ rungs at or above the tail: [${rungsAtOrAboveTail.join(", ")}] · ` +
    `the batch's own measured max ${batchMaxMeasured.toFixed(6)} = the reported runner-up ${reading.actIIIWidenedBatchPeak.dexec.toFixed(6)} · ` +
    `margin ${(reading.actIIIWidened.dexec - reading.actIIIWidenedBatchPeak.dexec).toFixed(6)} vs pinned ${ACT_III_B2_PEAK_BELOW_TAIL.toFixed(6)} — ` +
    `REPORTED, never padded: no \`act-peak\` branch was invented for this batch to fire`,
);
check(
  "the registered zero-move is a DERIVED zero (30.455319 − 30.455319 = 0.000000) with the constant algebraically separate from the reading",
  ACT_III_B2_TAIL_ZERO_MOVE === 0 &&
    near(ACT_III_B2_TAIL_ZERO_MOVE, ACT_III_B2_TAIL_ZERO_MOVE) &&
    near(
      reading.actIIIWidened.dexec - reading.preR008Standard,
      ACT_III_B2_TAIL_ZERO_MOVE,
    ) &&
    near(ACT_III_PRE_R008_REGISTERED_TAIL_EXEC, ACT_III_REGISTERED_TAIL_EXEC) &&
    ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID === ACT_III_REGISTERED_TAIL_LEVEL_ID,
  `pinned zero ${ACT_III_B2_TAIL_ZERO_MOVE.toFixed(6)} · measured widened max − standard = ` +
    `${(reading.actIIIWidened.dexec - reading.preR008Standard).toFixed(6)} · the standard is ALIAS-TYPED to R-007's Act III tail ` +
    `(${String(ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID)}), so "no move" is a compile-time identity AND a measured difference`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [4/6] anti-tautology controls, one per R-008 clause, and the widening probed both ways
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[4/6] anti-tautology — one control per R-008 clause, then the widening's non-vacuity (seven injections)",
);
interface TailControl {
  readonly clause: ActTailClauseId;
  readonly name: string;
  readonly reading: ActScaleLawReading;
}
const restampRow = (
  rows: readonly (typeof ACT_III_B2_LADDER)[number][],
  id: number,
  par: number,
): typeof ACT_III_B2_LADDER =>
  rows.map((r) => (r.id === id ? { ...r, par } : r));
const tailControls: readonly TailControl[] = [
  {
    clause: "act-tail-r008-registered-rows",
    name: "-registered-rows: one batch-2 row restamped in the TABLE (L48 par 26 → 30)",
    reading: {
      ...reading,
      actIIIBatch2Table: restampRow(reading.actIIIBatch2Table, 48, 30),
    },
  },
  {
    clause: "act-tail-r008-tail-zero-move",
    name: "-tail-zero-move: the widened maximum relabelled onto L47 (same value, wrong carrier)",
    reading: {
      ...reading,
      actIIIWidened: { levelId: 47, dexec: reading.actIIIWidened.dexec },
    },
  },
  {
    clause: "act-tail-r008-pre-standard",
    name: "-pre-standard: the STANDARD raised +0.5 (a re-registration restamping what it is judged against)",
    reading: {
      ...reading,
      preR008Standard: ACT_III_REGISTERED_TAIL_EXEC + 0.5,
    },
  },
  {
    clause: "act-tail-r008-exec-headroom",
    name: "-exec-headroom: Act III's band narrowed (the derived headroom stops reproducing the pin)",
    reading: { ...reading, actIIIExecCeiling: ACT_III_EXEC_BAND[1] - 0.5 },
  },
  {
    clause: "act-tail-r008-b2-half-ceiling",
    name: "-b2-half-ceiling: the half ceiling widened past any `par 28` tail rung's floor (the geometry that starves L51–L60)",
    reading: {
      ...reading,
      actIIIHalfCeiling: ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0] + 0.25,
    },
  },
  {
    clause: "act-tail-r008-seam-reliefs",
    name: "-seam-reliefs: instance 6's arriving rung moved out of band with a self-consistent published Δ",
    reading: {
      ...reading,
      seams: reading.seams.map((s) =>
        s.toLevelId === ACT_III_B2_SEAM_RELIEF.toLevelId
          ? {
              ...s,
              toExec: ACT_III_EXEC_BAND[1] + 1.5,
              registeredTo: ACT_III_EXEC_BAND[1] + 1.5,
              registeredDelta: ACT_III_EXEC_BAND[1] + 1.5 - s.registeredFrom,
            }
          : s,
      ),
    },
  },
];
const tailCaught = tailControls.filter((control) =>
  actScaleTailGuards(control.reading).some(
    (c) => c.clause === control.clause && c.status === "FAIL",
  ),
).length;
for (const control of tailControls) {
  const moved = actScaleTailGuards(control.reading).filter(
    (c) => c.status === "FAIL",
  );
  console.log(
    `  control ${String(control.clause)} ⇒ FAIL [${moved.map((c) => c.clause).join(", ")}]`,
  );
}
check(
  "every R-008 clause has a control and every control is refused by ITS OWN clause's name",
  tailCaught === tailControls.length &&
    tailControls.length === ACT_TAIL_R008_CLAUSE_IDS.length &&
    tailControls.every((c) => ACT_TAIL_R008_CLAUSE_IDS.includes(c.clause)),
  `${String(tailCaught)}/${String(tailControls.length)} caught · R-008 clauses covered ${String(new Set(tailControls.map((c) => c.clause)).size)}/${String(ACT_TAIL_R008_CLAUSE_IDS.length)}`,
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
// ── the TWO-FIELD separation, probed in BOTH directions ──────────────────────
//
// This is the structural claim of the ticket, so it is a control rather than prose: the act's
// basis widened *inside* the act, so what used to be one act-level reading is now two. Direction
// (i) moves the **widened reading** (a world where every new rung is below the tail) and requires
// the refusal to land on EXACTLY R-008's two widened clauses, leaving R-007's six green; direction
// (ii) moves **R-007's era field** and requires the refusal to land on EXACTLY R-007's three value
// clauses, leaving R-008's six green. Either direction failing the other side's clauses would mean
// a clause is reading the wrong basis — the stale-reading failure R-004a named, one widening later.
const refusalSetOf = (r: ActScaleLawReading): readonly string[] =>
  actScaleTailGuards(r)
    .filter((c) => c.status === "FAIL")
    .map((c) => c.clause);
const widenedMoved = refusalSetOf({
  ...reading,
  actIIIWidened: {
    levelId: 48,
    dexec: ACT_III_REGISTERED_TAIL_EXEC - 0.5,
  },
});
const eraMoved = refusalSetOf({
  ...reading,
  actIII: {
    levelId: ACT_III_REGISTERED_TAIL_LEVEL_ID - 1,
    dexec: reading.actIII.dexec + 0.5,
  },
});
const widenedExpected = [
  "act-tail-r008-tail-zero-move",
  "act-tail-r008-exec-headroom",
];
const eraExpected = [
  "act-tail-r007-tail-pin",
  "act-tail-r007-peak-advantage",
  "act-tail-r007-exec-headroom",
];
const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
check(
  "(i) moving the WIDENED reading fails exactly R-008's two widened clauses and leaves R-007's six clauses green",
  sameSet(widenedMoved, widenedExpected),
  `widened ← L48 at ${(ACT_III_REGISTERED_TAIL_EXEC - 0.5).toFixed(6)} (a batch entirely below the tail) ⇒ FAIL [${widenedMoved.join(", ")}] ` +
    `(required exactly [${widenedExpected.join(", ")}]) · R-007's six unaffected = ` +
    `${String(ACT_TAIL_R007_CLAUSE_IDS.every((id) => !widenedMoved.includes(id)))} · ` +
    `this is the direction a LATER batch can actually produce, which is why the two fields exist`,
);
check(
  "(ii) moving R-007's ERA field fails exactly R-007's three value clauses and leaves R-008's six green",
  sameSet(eraMoved, eraExpected),
  `era field ← relabelled to L${String(ACT_III_REGISTERED_TAIL_LEVEL_ID - 1)} and raised ${(reading.actIII.dexec + 0.5).toFixed(6)} ⇒ FAIL [${eraMoved.join(", ")}] ` +
    `(required exactly [${eraExpected.join(", ")}]) · every R-008 clause unaffected = ` +
    `${String(ACT_TAIL_R008_CLAUSE_IDS.every((id) => !eraMoved.includes(id)))} — the widened clauses read their OWN field, so R-007's record cannot be re-interpreted by a widening`,
);
// ── the ZERO-MOVE's non-vacuity: seven injections, each printing what it refused ──
//
// A zero that no injection can move is a tautology, so the zero-move clause carries a runner-up
// field and this instrument moves it from every direction a real dataset could. Each probe prints
// its own refusal set; the `(c'')` row is the one that CANNOT fail, and it is printed as such
// rather than dressed up: the production value restated is a no-op by construction, which is
// exactly why (c) and (c′) exist beside it.
const probe = (
  name: string,
  r: ActScaleLawReading,
  expected: readonly string[],
): void => {
  const refused = refusalSetOf(r);
  console.log(
    `  non-vacuity ${name} ⇒ FAIL [${refused.join(", ")}]`,
  );
  check(
    `non-vacuity ${name} — refused by name`,
    sameSet(refused, expected),
    `FAIL [${refused.join(", ")}] (required exactly [${expected.join(", ")}])`,
  );
};
probe(
  "(a) a hypothetical HIGHER rung among the new ids (L47 at 30.500000, in band)",
  { ...reading, actIIIWidened: { levelId: 47, dexec: 30.5 } },
  ["act-tail-r008-tail-zero-move", "act-tail-r008-exec-headroom"],
);
probe(
  "(b) the batch peak REACHING the tail (L50 at the registered tail) — the zero-move claim becomes false",
  {
    ...reading,
    actIIIWidenedBatchPeak: {
      levelId: ACT_III_B2_BATCH_PEAK_LEVEL_ID,
      dexec: ACT_III_REGISTERED_TAIL_EXEC,
    },
  },
  ["act-tail-r008-tail-zero-move", "act-tail-r008-b2-half-ceiling"],
);
probe(
  "(b′) the batch peak strictly below but at a DIFFERENT margin (half the pinned distance)",
  {
    ...reading,
    actIIIWidenedBatchPeak: {
      levelId: ACT_III_B2_BATCH_PEAK_LEVEL_ID,
      dexec: ACT_III_REGISTERED_TAIL_EXEC - ACT_III_B2_PEAK_BELOW_TAIL / 2,
    },
  },
  ["act-tail-r008-tail-zero-move", "act-tail-r008-b2-half-ceiling"],
);
probe(
  "(c) the standard LOWERED (30.000000) — a fake rise would satisfy a clause that only compared magnitudes",
  { ...reading, preR008Standard: 30.0 },
  ["act-tail-r008-pre-standard"],
);
probe(
  "(c′) the standard RAISED above the tail (tail + 0.5)",
  { ...reading, preR008Standard: ACT_III_REGISTERED_TAIL_EXEC + 0.5 },
  ["act-tail-r008-pre-standard"],
);
const noopRefused = refusalSetOf({
  ...reading,
  preR008Standard: ACT_III_REGISTERED_TAIL_EXEC,
});
check(
  "(c″) DISCLOSED NO-OP: restating the production standard is refused by nothing — which is why (c) and (c′) exist",
  noopRefused.length === 0 &&
    near(ACT_III_PRE_R008_REGISTERED_TAIL_EXEC, ACT_III_REGISTERED_TAIL_EXEC),
  `standard ← ${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)} (the production value) ⇒ FAIL [${noopRefused.join(", ")}] — ` +
    `an injection equal to the field's own value cannot move a clause, and printing that is the honest form: the clause is shown to be moveable by (c)/(c′) instead`,
);
probe(
  "(d) a NaN reading (an absent or unparseable rung)",
  { ...reading, actIIIWidened: { levelId: 47, dexec: Number.NaN } },
  ["act-tail-r008-tail-zero-move", "act-tail-r008-exec-headroom"],
);
check(
  "the non-vacuity probes never restamp a constant: every one of them is a READING injection, and the registered reading is re-checked after them",
  actScaleTailGuards(reading).every((c) => c.status === "PASS"),
  `${String(actScaleTailGuards(reading).filter((c) => c.status === "PASS").length)}/${String(registered.length)} clauses still PASS on the untouched registered reading — ` +
    `the probes above are pure functions of the reading, so nothing they inject can leak back`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [5/6] §7.3.1's sixth instance, the sawtooth, and the act-peak falsification
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[5/6] the §7.3.1 sixth instance — both directions probed, every adjacent drop accounted for over the WIDENED act, and the batch's maximum falsified",
);
const seamClause = (r: ActScaleLawReading): GateStatus =>
  actScaleTailGuards(r).find((c) => c.clause === "act-tail-r008-seam-reliefs")
    ?.status ?? "FAIL";
/** One rung's `D_exec`, re-measured from the registered bytes (never read from a seam spec). */
const dexecOf = (id: number): number =>
  auditLevel(readLevel(id)).difficulty.Dexec ?? Number.NaN;
const seamFrom = dexecOf;
/**
 * **The sawtooth, measured across the WIDENED act.** The registered `D_exec` is deliberately
 * non-monotone at the batch seams (`L25→L26 −6.044410`, `L30→L31 −4.362098`, `L35→L36 −6.038144`,
 * the act boundary `L40→L41 −4.197990`, and now the act's **interior** seam `L45→L46 −4.212830`)
 * and rises everywhere else. §7.3's `act-peak` clause rides on the act's **maximum**, and §7.3.1
 * makes a relief registrable by its **pre-published label** — so a validator demanding monotony
 * would have refused five *registered* seams, and one demanding a drop at every cross-batch step
 * would refuse the twenty-four interior rises. Falsified here by measurement, over the **widened
 * registered run** `ACT_II_REGISTERED_IDS ++ ACT_III_REGISTERED_IDS` (L21–L50), with the
 * named-instance list being `ACT_SEAM_RELIEFS_ALL` (every instance the law carries, both species).
 */
const runIds = [...ACT_II_REGISTERED_IDS, ...ACT_III_REGISTERED_IDS];
const runExec = runIds.map((id) => ({ id, dexec: seamFrom(id) }));
const steps = runExec.slice(1).map((r, i) => ({
  from: runExec[i]!.id,
  to: r.id,
  delta: r.dexec - runExec[i]!.dexec,
}));
const drops = steps.filter((s) => s.delta < 0);
const rises = steps.filter((s) => s.delta > 0);
const namedSeams = ACT_SEAM_RELIEFS_ALL.map(
  (s) => `${String(s.fromLevelId)}→${String(s.toLevelId)}`,
);
const namedDrop = (from: number, to: number): boolean =>
  ACT_SEAM_RELIEFS_ALL.some(
    (spec) => spec.fromLevelId === from && spec.toLevelId === to,
  );
const interiorDrops = drops.filter((s) => s.to >= ACT_III_REGISTERED_IDS[0]!);
console.log(
  `  the act's interior seam L${String(ACT_III_B2_SEAM_RELIEF.fromLevelId)}→L${String(ACT_III_B2_SEAM_RELIEF.toLevelId)}: ` +
    `${(seamFrom(ACT_III_B2_SEAM_RELIEF.toLevelId) - seamFrom(ACT_III_B2_SEAM_RELIEF.fromLevelId)).toFixed(6)} · ` +
    `Act III's nine interior steps: ${steps.filter((s) => s.from >= ACT_III_REGISTERED_IDS[0]!).map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(6)}`).join(" · ")}`,
);
check(
  "§7.3.1 — the sawtooth is the registered reading over the WIDENED act, and the clause PASSes it (a monotony validator would have refused five registered seams)",
  drops.length === 5 &&
    drops.every((s) => namedDrop(s.from, s.to)) &&
    interiorDrops.length === 2 &&
    seamClause(reading) === "PASS" &&
    rises.length === 24,
  `drops ${String(drops.length)} (all named [${namedSeams.join(", ")}]) · rises ${String(rises.length)} (none labelled, none owed: §7.3 interior freedom) · ` +
    `clause act-tail-r008-seam-reliefs on the registered reading = ${seamClause(reading)}`,
);
check(
  "§7.3.1 — no UNNAMED relief hides in the bytes across the widened act (every adjacent drop is a named instance)",
  drops.every((s) => namedDrop(s.from, s.to)) &&
    ACT_III_B2_SEAM_RELIEF.kind === "batch-seam" &&
    ACT_SEAM_RELIEFS_ALL.filter((s) => s.kind === "batch-seam").length === 4,
  `drops: ${drops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(" · ")} · the law's instances: ` +
    `${ACT_SEAM_RELIEFS_ALL.map((s) => `#${String(s.instance)} ${s.kind} L${String(s.fromLevelId)}→L${String(s.toLevelId)} ${s.delta.toFixed(6)}`).join(" · ")} — ` +
    "the seam clauses judge only the pairs their own registration published, so this measurement is what closes the 'unnamed relief' hole",
);
// Non-vacuity on the same reader: an UNNAMED drop must be visible to it. The probe lowers one
// copied rung so a fabricated drop appears at a pair the law does not name; the filter is the
// whole instance register, so this ticket's own registered drop is excluded by name rather than
// reported as fabricated.
const fabricated = runExec.map((r) => (r.id === 43 ? { ...r, dexec: 20 } : r));
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
  "the unnamed-relief reader can fail (a fabricated drop is named as unnamed, with the five registered drops excluded)",
  fabricatedDrops.length === 1 &&
    fabricatedDrops[0]!.from === 42 &&
    fabricatedDrops[0]!.to === 43,
  `fabricated drops at unnamed pairs: [${fabricatedDrops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(", ")}] (required exactly L42→L43; the registered drops [${namedSeams.join(", ")}] are excluded by name)`,
);
// A measurement that DROPS a registered rung cannot satisfy the clause: the instance is required,
// not optional, and a dataset missing L46 fails by name rather than skipping the check.
const withoutL46 = measureActScaleReading(
  all
    .filter((s) => s.id !== ACT_III_B2_SEAM_RELIEF.toLevelId)
    .map((s) => s.level),
);
const missingSeam = actScaleTailGuards(withoutL46).find(
  (c) => c.clause === "act-tail-r008-seam-reliefs",
);
check(
  "a measurement that omits a registered rung FAILs the seam clause (the instance is required, not optional)",
  missingSeam?.status === "FAIL" &&
    (missingSeam.detail.includes("MISSING") ||
      missingSeam.detail.includes("NaN")),
  `reading built from the ${String(all.length - 1)} shipped files without L${String(ACT_III_B2_SEAM_RELIEF.toLevelId)} (census ${String(all.length)} − 1): ` +
    `clause ${String(missingSeam?.status)} — ${(missingSeam?.detail ?? "").slice(0, 140)}…`,
);
// ── the falsification probe, SIZED TO BATCH 2'S OWN ACT MAXIMUM ──────────────
//
// The probe value is *derived*, not typed: the midpoint between the newly registered batch's peak
// and Act III's derived band ceiling. It is therefore strictly above every batch-2 rung (so
// exactly the ladder's own peak rung — L50, which is the rung the prover evaluates `act-peak` on —
// must fail) and strictly inside the band (so no other gate has an opinion) — and the arithmetic
// that puts it there is printed rather than asserted. A probe that could not fail is not evidence,
// and a probe with a typed threshold is a number that goes stale.
const PEAK_PROBE =
  (ACT_III_B2_BATCH_PEAK_EXEC + ACT_III_EXEC_BAND[1]) / 2;
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
  `  falsification probe: --peak=${String(PEAK_PROBE)} (= (${ACT_III_B2_BATCH_PEAK_EXEC.toFixed(6)} + ${String(ACT_III_EXEC_BAND[1])}) / 2, the midpoint of the batch's own act maximum and Act III's derived ceiling)`,
);
check(
  "the act-peak probe is sized to BATCH 2's own act maximum and refuses exactly act-peak on exactly L50",
  peakRun.exit === 1 &&
    peakLadder !== null &&
    peakLadder[1] === "4" &&
    peakLadder[2] === "5" &&
    peakLadder[3] === "65" &&
    peakLadder[4] === "65" &&
    peakFailed.length === 1 &&
    failedIds[0] === ACT_III_B2_BATCH_PEAK_LEVEL_ID &&
    failedGates.length === 1 &&
    failedGates[0] === "act-peak",
  `exit ${String(peakRun.exit)} · probe ${PEAK_PROBE.toFixed(6)} sits ${(PEAK_PROBE - ACT_III_B2_BATCH_PEAK_EXEC).toFixed(6)} above the batch's measured maximum ` +
    `${ACT_III_B2_BATCH_PEAK_EXEC.toFixed(6)} and ${(ACT_III_EXEC_BAND[1] - PEAK_PROBE).toFixed(6)} below Act III's derived ceiling ${String(ACT_III_EXEC_BAND[1])} · ` +
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
// [6/6] the labels, the constants, the B1–B7 rule and the prior fifty rungs
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[6/6] the §7.3.1 sixth label, the §7.10.6 B1–B7 rule and the new constants — derived from the registered bytes, quoted verbatim",
);
// The sixth instance's published ΔD_exec, DERIVED from the registered bytes (never read from the
// constant), and the label's own quotation of it.
const delta6 = ACT_III_B2_SEAM_RELIEF.toExec - ACT_III_B2_SEAM_RELIEF.fromExec;
const derivedDelta6 =
  seamFrom(ACT_III_B2_SEAM_RELIEF.toLevelId) -
  seamFrom(ACT_III_B2_SEAM_RELIEF.fromLevelId);
check(
  "§7.3.1 instance 6 — derived ΔD_exec = −4.212830 (L45 30.455319 → L46 26.242489) equals the published Δ, and the label quotes it",
  near(delta6, ACT_III_B2_SEAM_RELIEF.delta) &&
    near(derivedDelta6, ACT_III_B2_SEAM_RELIEF.delta) &&
    ACT_III_B2_SEAM_RELIEF.label.includes("ΔD_exec = −4.212830") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("`batch-seam` seam L45→L46") &&
    near(seamFrom(ACT_III_B2_SEAM_RELIEF.fromLevelId), ACT_III_REGISTERED_TAIL_EXEC) &&
    near(seamFrom(ACT_III_B2_SEAM_RELIEF.toLevelId), ACT_III_B2_SEAM_RELIEF.toExec) &&
    near(ACT_III_B2_SEAM_RELIEF.fromExec, ACT_III_REGISTERED_TAIL_EXEC),
  `derived ${delta6.toFixed(6)} · measured-on-bytes ${derivedDelta6.toFixed(6)} · published ${ACT_III_B2_SEAM_RELIEF.delta.toFixed(6)} · ` +
    `measured L${String(ACT_III_B2_SEAM_RELIEF.fromLevelId)} ${seamFrom(ACT_III_B2_SEAM_RELIEF.fromLevelId).toFixed(6)} → ` +
    `L${String(ACT_III_B2_SEAM_RELIEF.toLevelId)} ${seamFrom(ACT_III_B2_SEAM_RELIEF.toLevelId).toFixed(6)} · ` +
    `the left side is ALIAS-TYPED to Act III's registered tail, so the seam cannot drift from the reading it measures`,
);
// The bound, checked AS A BOUND (and as §7.10.7 splits it): the registered delta must land inside
// the published union AND inside an admissible first-rung half. A fill-in that sat in the union but
// in neither half would be OUTSIDE the label, so the half it matched is printed by name — and the
// halves are printed with their `par` term beside them, never folded in.
const matchedHalf = ACT_III_B2_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS.find(
  (r) =>
    ACT_III_B2_SEAM_RELIEF.delta >= r.deltaRange[0] &&
    ACT_III_B2_SEAM_RELIEF.delta <= r.deltaRange[1],
);
check(
  "§7.10.7 — the registered Δ sits inside the published union AND inside an admissible first-rung half (the bound is checked, not quoted)",
  ACT_III_B2_SEAM_RELIEF.delta >= ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[0] &&
    ACT_III_B2_SEAM_RELIEF.delta <= ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[1] &&
    matchedHalf?.par === ACT_III_B2_ANCHOR_PAR &&
    ACT_III_B2_SEAM_RELIEF.label.includes("[−4.705319, −1.392819]") &&
    ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[0] === -4.705319 &&
    ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[1] === -1.392819,
  `Δ ${ACT_III_B2_SEAM_RELIEF.delta.toFixed(6)} ∈ union [${ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[0].toFixed(6)}, ${ACT_III_B2_SEAM_RELIEF_DELTA_RANGE[1].toFixed(6)}] ` +
    `and ∈ the admissible par-${String(matchedHalf?.par)} half [${matchedHalf?.deltaRange[0].toFixed(6) ?? "n/a"}, ${matchedHalf?.deltaRange[1].toFixed(6) ?? "n/a"}] · ` +
    `the other half (par ${String(ACT_III_B2_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS[1]?.par)}) excludes it — a fill-in inside the union but in neither half would be OUTSIDE the label`,
);
// §7.9's notation law, read on the label itself. Instance 6 is a later publication than the
// notation-only amendment GD-011 made, so it carries the **derived-exact** form with the printed
// form in parentheses — like instances 3, 4 and 5.
const printedBandIII = `[${ACT_III_EXEC_BAND[0].toFixed(2)}, ${ACT_III_EXEC_BAND[1].toFixed(2)}]`;
const derivedBandIII = `[${ACT_III_EXEC_BAND[0].toFixed(2)}, ${ACT_III_EXEC_BAND[1]}]`;
check(
  "§7.9 — the label carries Act III's band in the published form (derived-exact + printed in parentheses)",
  ACT_III_B2_SEAM_RELIEF.label.includes(derivedBandIII) &&
    ACT_III_B2_SEAM_RELIEF.label.includes("printed `[23.75, 33.06]`") &&
    derivedBandIII !== printedBandIII &&
    near(ACT_III_EXEC_BAND[0], ACT_III_PAR_FLOOR + 3 * ACT_III_B_BAND[0]) &&
    near(ACT_III_EXEC_BAND[1], ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[1]),
  `instance 6 quotes \`${derivedBandIII}\` with the printed form in parentheses (\`${printedBandIII}\`); the clause's comparison operand is the derived-exact constant, printed forms are display text · ` +
    `derived: [${String(ACT_III_PAR_FLOOR)} + 3·${ACT_III_B_BAND[0].toFixed(4)}, ${String(ACT_III_PAR_CEILING)} + 3·${ACT_III_B_BAND[1].toFixed(4)}]`,
);
// The halves of a registrable relief: attribution, the "no ease the instrument cannot see" clause
// (`M`/`T` are not terms of D_exec), §6's refusal to present a relief as a dip, the XOR device's
// non-claim for the act's second half, and the fill-in's own decomposition recorded beside the
// verbatim label text.
check(
  "§7.3.1 / §7.10.7 — the label is the published form, carries its attribution, refuses to claim an ease the instrument cannot see, and names the withheld XOR device",
  ACT_III_B2_SEAM_RELIEF.label.includes("largely an artifact of the measurement design") &&
    /never a dip/.test(ACT_III_B2_SEAM_RELIEF.label) &&
    ACT_III_B2_SEAM_RELIEF.label.includes("labelled Playtest hypothesis") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("§7.3.3") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("ΔM = 0") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("H / XOR door stays U-002's") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("FILL-IN") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("Δpar = −4") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("3·ΔB = −0.212811") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("26.242489270386265 − 30.45531914893617") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("1d6c90f") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("22:39:26") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("fe445b5") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("23:12:26") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("f956f4d") &&
    ACT_III_B2_SEAM_RELIEF.label.includes("23:26:06"),
  `label tail: "…${ACT_III_B2_SEAM_RELIEF.label.slice(-190)}" · ` +
    `the exact measured double differs from the stored 6-decimal form by ${Math.abs(26.242489270386265 - ACT_III_B2_SEAM_RELIEF.toExec).toExponential(4)} (F-L41-1: readers compare with \`near\`)`,
);
// PROVENANCE — the half that makes a §7.3.1 relief registrable at all: the label has to PREDATE the
// boards it explains. Read here as a **live measurement of three commits**: the rule commit that
// published the BOUND, the commit that wrote the FILL-IN, and the byte commit that landed the
// rungs. This instance's order is the stronger one — the *value* precedes the *existence* of the
// boards it measures — so `git` is asked for the file at the fill-in commit **on both paths** (a
// hit at either would mean the fill-in was written with the answer already on disk), and for
// contrast at the byte commit (where it must be present, on the shelf).
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
const existsAt = (rev: string, path: string): boolean | null => {
  try {
    execFileSync("git", ["cat-file", "-e", `${rev}:${path}`], {
      stdio: "ignore",
      cwd: REPO_DIR,
    });
    return true;
  } catch (e) {
    // Exit 128 = "did not match any files" (absent). Anything else is a git we cannot read.
    const status = (e as { status?: number }).status;
    return status === 128 || status === 1 ? false : null;
  }
};
const RULE_COMMIT = "1d6c90f";
const FILLIN_COMMIT = "fe445b5";
const BYTE_COMMIT = "f956f4d";
const ruleDate = commitDate(RULE_COMMIT);
const fillinDate = commitDate(FILLIN_COMMIT);
const byteDate = commitDate(BYTE_COMMIT);
const ordered =
  ruleDate !== null &&
  fillinDate !== null &&
  byteDate !== null &&
  Date.parse(ruleDate) < Date.parse(fillinDate) &&
  Date.parse(fillinDate) < Date.parse(byteDate);
const boardAtFillinRoot = existsAt(FILLIN_COMMIT, `src/levels/${fileOf(ACT_III_B2_SEAM_RELIEF.toLevelId)}`);
const boardAtFillinShelf = existsAt(FILLIN_COMMIT, `src/levels/candidates/${fileOf(ACT_III_B2_SEAM_RELIEF.toLevelId)}`);
const boardAtBytesShelf = existsAt(BYTE_COMMIT, `src/levels/candidates/${fileOf(ACT_III_B2_SEAM_RELIEF.toLevelId)}`);
const boardAtRuleRoot = existsAt(RULE_COMMIT, `src/levels/${fileOf(ACT_III_B2_SEAM_RELIEF.toLevelId)}`);
const seconds = (a: string | null, b: string | null): number | null =>
  a === null || b === null ? null : (Date.parse(b) - Date.parse(a)) / 1000;
const fillinToBytes = seconds(fillinDate, byteDate);
check(
  "§7.3.1 provenance — bound → fill-in → bytes, in that order, and the FILL-IN predates the boards' EXISTENCE on BOTH paths",
  ordered &&
    boardAtFillinRoot === false &&
    boardAtFillinShelf === false &&
    boardAtBytesShelf === true &&
    boardAtRuleRoot === false,
  ruleDate === null || fillinDate === null || byteDate === null
    ? "NOT RUN — git could not date one of the commits; a check that did not run is never a pass"
    : `rule/bound ${RULE_COMMIT} ${ruleDate} → fill-in ${FILLIN_COMMIT} ${fillinDate} → bytes ${BYTE_COMMIT} ${byteDate} · ` +
      `${String(fillinToBytes)} s between fill-in and bytes (13 min 40 s) · ` +
      `\`src/levels/${fileOf(ACT_III_B2_SEAM_RELIEF.toLevelId)}\` present at the fill-in commit: root ${String(boardAtFillinRoot)} / shelf ${String(boardAtFillinShelf)} ` +
      `(absent from BOTH), present at the byte commit on the shelf: ${String(boardAtBytesShelf)}, and absent from the root at the rule commit: ${String(boardAtRuleRoot)} ` +
      `— the register's second VALUE-before-EXISTENCE order, which is the stronger one §7.10.7's wording asks for`,
);
check(
  "§7.3.1 / §7.10.7 — instance 6 in the register, appended in instance order by the registration that owed it",
  ACT_III_B2_SEAM_RELIEF.instance === 6 &&
    ACT_III_B2_SEAM_RELIEF.kind === "batch-seam" &&
    ACT_SEAM_RELIEFS_ALL.length === 5 &&
    ACT_SEAM_RELIEFS_ALL.every((s, i) => s.instance === i + 2) &&
    ACT_SEAM_RELIEFS_ALL.filter((s) => s.kind === "act-open").length === 1 &&
    ACT_SEAM_RELIEFS_ALL.filter((s) => s.kind === "batch-seam").length === 4,
  `register: ${ACT_SEAM_RELIEFS_ALL.map((s) => `#${String(s.instance)} ${s.kind} L${String(s.fromLevelId)}→L${String(s.toLevelId)}`).join(" · ")} — ` +
    `instances 2–6, so §7.3.1's instance 1 (the registered act-open at L20→L21, R-004a's labelled plateau relaxation) is cited by its own clause ` +
    `(act-tail-l21-open-relief) rather than re-typed here · the Act-II batch seams keep their own list (ACT_II_SEAM_RELIEFS_ALL), and the register the reading resolves against is the union, ` +
    `so neither earlier half had to lie about its contents · LV-019 published the bound and the value but deliberately did NOT append the spec (registrations belong to the registration train)`,
);
// The tail arithmetic: the pre-registration standard, the live tail, the measured zero-move, the
// across-act advantage R-007 recorded (NOT restated — R-008 makes no move on it), and the
// DERIVED-EXACT headroom with its printed-operand counterfactual (§7.9's whole reason for
// existing: the last 0.0025 of the band, third band).
const derivedHeadroomIII = ACT_III_EXEC_BAND[1] - reading.actIIIWidened.dexec;
const printedHeadroomIII =
  Number(ACT_III_EXEC_BAND[1].toFixed(2)) - reading.actIIIWidened.dexec;
check(
  "§7.9 — Act III's tail headroom is DERIVED-EXACT and UNCHANGED by the widening: 33.0625 − 30.455319 = 2.607181, and the printed operand would not reproduce it",
  near(derivedHeadroomIII, 2.607181) &&
    near(reading.actIIIExecCeiling, ACT_III_EXEC_BAND[1]) &&
    near(seamFrom(ACT_III_REGISTERED_TAIL_LEVEL_ID), ACT_III_REGISTERED_TAIL_EXEC) &&
    Math.abs(printedHeadroomIII - 2.607181) > 1e-3 &&
    near(derivedHeadroomIII, 33.0625 - 30.455319) &&
    ACT_III_EXEC_BAND[1] === 33.0625,
  `derived ${derivedHeadroomIII.toFixed(6)} = pinned 2.607181; the printed operand (${ACT_III_EXEC_BAND[1].toFixed(2)}) would give ` +
    `${printedHeadroomIII.toFixed(6)} — a ${Math.abs(printedHeadroomIII - 2.607181).toFixed(6)} difference, i.e. the sliver §7.9 keeps buildable · ` +
    `R-007 pinned the same number against the \`41–45\` basis and this registration re-derives it against \`41–50\`: two bases, one number, ` +
    `and a registration that had moved the tail would make them disagree`,
);
// §7.10.6's rule, all seven clauses, re-derived rather than quoted — the falsification the design
// box published (clause (ii)) is re-run here on the landed bytes.
const b2Pars = ACT_III_B2_LADDER.map((r) => r.par);
const stepsDeltaPar = b2Pars.slice(1).map((p, i) => p - b2Pars[i]!);
check(
  "§7.10.6 B1/B2 — the anchor re-derives (`FLOOR + 2·(ℓ−1)` at ℓ = 2 ⇒ 22) and the same rule reproduces the opener's own anchor at ℓ = 1 (the law validates itself against landed history)",
  ACT_III_B2_ANCHOR_PAR === ACT_III_PAR_FLOOR + 2 &&
    b2Pars[0] === ACT_III_B2_ANCHOR_PAR &&
    ACT_III_PAR_FLOOR + 2 * (1 - 1) === ACT_III_OPENER_PAR_MULTISET[0] &&
    ACT_III_B1_LADDER[0]?.par === ACT_III_OPENER_PAR_MULTISET[0] &&
    ACT_III_OPENER_PAR_MULTISET.join("/") ===
      ACT_III_B1_LADDER.map((r) => r.par).join("/"),
  `anchor ${String(ACT_III_B2_ANCHOR_PAR)} = FLOOR ${String(ACT_III_PAR_FLOOR)} + 2·(2−1) · opener anchor re-derived at ℓ = 1: ${String(ACT_III_PAR_FLOOR + 2 * (1 - 1))} ` +
    `= L41's published par ${String(ACT_III_B1_LADDER[0]?.par)} · the opener multiset ${ACT_III_OPENER_PAR_MULTISET.join("/")} still equals its ladder's pars ${ACT_III_B1_LADDER.map((r) => String(r.par)).join("/")}`,
);
check(
  "§7.10.6 B3 — the half-wide ceiling re-derives (26 + 3·1.6875 = 31.0625) and sits the published 0.6875 below any `par 28` tail rung's floor 31.7500",
  ACT_III_B2_HALF_CEILING_EXEC === ACT_III_OPENER_TOP_PAR + 3 * ACT_III_B_BAND[1] &&
    near(
      ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0] - ACT_III_B2_HALF_CEILING_EXEC,
      ACT_III_CEILING_RESERVATION_MARGIN,
    ) &&
    near(
      ACT_III_B2_HALF_CEILING_EXEC - ACT_III_B2_BATCH_PEAK_EXEC,
      ACT_III_B2_HALF_CEILING_MARGIN,
    ) &&
    ACT_III_B2_HALF_CEILING_EXEC < ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0] &&
    ACT_III_B2_LADDER.every((r) => r.dexec <= ACT_III_B2_HALF_CEILING_EXEC),
  `ceiling ${ACT_III_B2_HALF_CEILING_EXEC.toFixed(4)} = ${String(ACT_III_OPENER_TOP_PAR)} + 3·${ACT_III_B_BAND[1].toFixed(4)} · ` +
    `reservation ${(ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0] - ACT_III_B2_HALF_CEILING_EXEC).toFixed(4)} = published ${ACT_III_CEILING_RESERVATION_MARGIN.toFixed(4)} · ` +
    `batch peak margin ${(ACT_III_B2_HALF_CEILING_EXEC - ACT_III_B2_BATCH_PEAK_EXEC).toFixed(6)} = published ${ACT_III_B2_HALF_CEILING_MARGIN.toFixed(6)} · ` +
    `every admitted rung under it: ${String(ACT_III_B2_LADDER.every((r) => r.dexec <= ACT_III_B2_HALF_CEILING_EXEC))}`,
);
check(
  "§7.10.6 B4/B5 — the multiset is the published one, `Δpar ≥ 2` holds on 2 of 4 steps (the honest count), and the closing rung takes the within-par MAXIMUM",
  b2Pars.join("/") === ACT_III_B2_PAR_MULTISET.join("/") &&
    stepsDeltaPar.filter((d) => d >= 2).length === 2 &&
    stepsDeltaPar.slice(-2).every((d) => d === 0) &&
    ACT_III_B2_LADDER[4]?.par === ACT_III_B2_LADDER[3]?.par &&
    (ACT_III_B2_LADDER[4]?.dexec ?? 0) > (ACT_III_B2_LADDER[3]?.dexec ?? 0) &&
    (ACT_III_B2_LADDER[2]?.dexec ?? 0) < (ACT_III_B2_LADDER[4]?.dexec ?? 0),
  `pars ${b2Pars.join("/")} = published ${ACT_III_B2_PAR_MULTISET.join("/")} · Δpar steps [${stepsDeltaPar.join(", ")}] ⇒ ${String(stepsDeltaPar.filter((d) => d >= 2).length)}/4 at ≥ 2 ` +
    `(the truncated top is repeated, so the last two steps are 0 — printed, not smoothed) · ` +
    `the closing rung's D_exec ${ACT_III_B2_LADDER[4]?.dexec.toFixed(6)} takes the within-par maximum against the par's own minimum ${ACT_III_B2_LADDER[2]?.dexec.toFixed(6)} ` +
    `(B5's tie-break, the case the opener never exercised)`,
);
check(
  "§7.10.6 B6 — the withheld `par 28` is ABSENT from the batch AND from the whole registered act, and was never substituted",
  !ACT_III_REGISTERED_IDS.some(
    (id) =>
      ACT_III_B2_LADDER.find((r) => r.id === id)?.par === ACT_III_PAR_CEILING ||
      ACT_III_B1_LADDER.find((r) => r.id === id)?.par === ACT_III_PAR_CEILING,
  ) &&
    !b2Pars.includes(ACT_III_PAR_CEILING) &&
    ACT_III_OPENER_PAR_MULTISET.every((par) => par < ACT_III_PAR_CEILING),
  `batch-2 pars ${b2Pars.join("/")} · withheld par ${String(ACT_III_PAR_CEILING)} count in the batch ${String(b2Pars.filter((p) => p === ACT_III_PAR_CEILING).length)} ` +
    `and in the registered act ${String(
      ACT_III_REGISTERED_IDS.filter(
        (id) =>
          ACT_III_B2_LADDER.find((r) => r.id === id)?.par === ACT_III_PAR_CEILING ||
          ACT_III_B1_LADDER.find((r) => r.id === id)?.par === ACT_III_PAR_CEILING,
      ).length,
    )} · the reservation stays satisfiable for \`L51–L60\` by construction`,
);
const actIIMultisets = [
  ACT_II_B1_LADDER,
  ACT_II_B2_B3_LADDER,
  ACT_II_B4_LADDER,
].map((rows) => rows.map((r) => r.par).join("/"));
check(
  "§7.10.6 B7 — the anti-mirror holds: batch 2's multiset differs from the Act II registrations' and from the Act III opener's (the coinciding pars are printed, never hidden)",
  actIIMultisets.every((m) => m !== b2Pars.join("/")) &&
    ACT_III_OPENER_PAR_MULTISET.join("/") !== b2Pars.join("/") &&
    new Set(b2Pars).size === 3 &&
    new Set(ACT_III_OPENER_PAR_MULTISET).size === 4,
  `batch-2 multiset ${b2Pars.join("/")} (distinct ${String(new Set(b2Pars).size)}) vs the Act II registrations [${actIIMultisets.join(" | ")}] ` +
    `and the opener ${ACT_III_OPENER_PAR_MULTISET.join("/")} (distinct ${String(new Set(ACT_III_OPENER_PAR_MULTISET).size)}) — ` +
    `the pars {22, 24, 26} are shared with Act II's bands (a finite-integer-band fact, printed by the authoring tool) while the multisets are not`,
);
// The twenty-five previously registered rungs are NOT re-stamped by this ticket: their registered
// rows must still reproduce on the bytes, exactly as R-004a … R-007 left them (the clone-guard duty
// applied backwards — a widening is where a re-band is most tempting).
const priorRows = [
  ...ACT_II_B1_LADDER,
  ...ACT_II_B2_B3_LADDER,
  ...ACT_II_B4_LADDER,
  ...ACT_III_B1_LADDER,
];
const restampedPrior = priorRows.filter((row) => {
  const m = auditLevel(readLevel(row.id)).difficulty;
  return (
    m.Dexec === null ||
    !near(m.Dexec, row.dexec) ||
    Math.abs(m.B - row.b) >= 5e-5
  );
});
check(
  "the twenty-five previously registered rungs are un-restamped (R-004a's five, R-005a's ten, R-006a's five and R-007's five still reproduce on the bytes)",
  restampedPrior.length === 0 &&
    priorRows.length === ACT_II_REGISTERED_IDS.length + ACT_III_B1_IDS.length,
  `${String(priorRows.length)} rows re-measured · mismatches [${restampedPrior.map((r) => `L${String(r.id)}`).join(", ")}] · ` +
    `pars ${priorRows.map((r) => String(r.par)).join(" / ")}`,
);
// The whole dataset, read the way the `par-stamped` gate reads it: every one of the FIFTY files
// carries the solver's own shortest solution as its label, so this registration's move re-stamped
// nothing anywhere — and the count is read from the directory rather than typed.
const restamped50 = all
  .filter((s) => analyse(s.level, explore(s.level)).shortestSolution !== s.level.par)
  .map((s) => `L${String(s.id)}`);
check(
  "every one of the FIFTY registered rungs is un-restamped (the file's `par` equals the program solver's shortest solution, on all 50 files)",
  restamped50.length === 0 && all.length === 50,
  `${String(all.length)} files re-stamped by the solver · mismatches [${restamped50.join(", ")}] · ` +
    "this is the `par-stamped` gate read dataset-wide: a registration that moved a board's file `par`, or a board whose label disagreed with its bytes, would be named here",
);
// The lesson rows: the five new rungs are documented, and the gap is documented *in the row*
// (obligation NULL with the remedy booked by name on L46's row) — the R-006a/R-007 precedent. Also
// read: `switchRequired` is the MEASURED all-OFF fact and not a decree, so it is cross-checked
// against the byte measurement above rather than trusted.
const lessonRows = ACT_III_B2_IDS.map((id) => documentedLesson(id));
const lessonGaps = lessonRows.filter(
  (l) => l === null || l.obligation !== null,
);
const interior = lessonRows.slice(1);
check(
  "the five new rungs are documented lessons (Act III's gate family is BOOKED on the batch's opener's row, not silently absent)",
  lessonGaps.length === 0 &&
    lessonRows.length === 5 &&
    lessonRows.every((l) => l?.evidence.includes("§7.10")) &&
    lessonRows.every((l) => l?.evidence.includes("src/levels/README.md §2j")) &&
    lessonRows.every((l) => l?.evidence.includes("§8.29")) &&
    lessonRows.every((l) => l?.evidence.includes("ai-native-pipeline.md")) &&
    interior.every((l) => (l?.evidence ?? "").includes("L46's row")),
  `${String(lessonRows.length)} rows read · obligation NULL on all (a NULL obligation is honest while the family is unbooked — the remedy is named in L46's row as an \`act-3-batch-2\` ` +
    `family behind an ACT_III_B2_LADDER-keyed reader plus one control per new code, and ${String(interior.filter((l) => (l?.evidence ?? "").includes("L46's row")).length)}/${String(interior.length)} interior rows point at it by name) · ` +
    `the family-gap sentence itself lives on the BATCH's opener row, which is the row a future family has to edit`,
);
check(
  "the five rows name the batch's own proofs (the withheld XOR device, the rule box, the interior-seam provenance)",
  (lessonRows[0]?.evidence ?? "").includes("NO REGISTERED PER-RUNG GATE FAMILY") &&
    (lessonRows[0]?.evidence ?? "").includes("BOOKED REMEDY") &&
    (lessonRows[0]?.evidence ?? "").includes("act-3-batch-1") &&
    (lessonRows[0]?.evidence ?? "").includes("act-3-batch-2") &&
    (lessonRows[2]?.evidence ?? "").includes("the act's maximum did not move when its basis widened") &&
    (lessonRows[4]?.evidence ?? "").includes("REPORTED, never padded") === false &&
    (lessonRows[4]?.lesson ?? "").includes("REPORTED, never padded") &&
    (lessonRows[4]?.evidence ?? "").includes("B3's margin"),
  `L46's row names the booked remedy for both acts' families · L48's row records the zero-move as a measurement · ` +
    `L50's lesson text says "REPORTED, never padded" and its evidence carries B3's margin — the three claims this registration is judged on are in the rows, not only in this instrument`,
);
const switchClaimed = lessonRows.every((l) => l?.switchRequired === "required");
const switchMeasured = measured.every(
  (m) => m.allOff === null && m.audit.allOffGoalReachable === false,
);
check(
  "`switchRequired: \"required\"` on all five rows is a MEASUREMENT, not a decree (the all-OFF world refuses the goal on every rung)",
  switchClaimed && switchMeasured,
  `claimed on ${String(lessonRows.filter((l) => l?.switchRequired === "required").length)}/${String(lessonRows.length)} rows; measured unsatisfiable on ` +
    `${String(measured.filter((m) => m.allOff === null).length)}/${String(measured.length)} (subgraphs ${measured.map((m) => `${String(m.audit.allOffReachableStates)}/${String(m.result.reachableStates)}`).join(", ")})`,
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
  `RESULT: REGISTERED-MATCH — the five R-008 rungs are byte-identical to the shelf they were moved from (${ORIGIN}),`,
);
console.log(
  "every registered row (par / D_exec / B / grid / coverage) is reproduced by the program solver on the ROOT bytes,",
);
console.log(
  `the five rungs prove at the root under their own family gates (13/13 named controls per rung, ${String(perRung.length)} rungs),`,
);
console.log(
  `the act's basis WIDENED INSIDE THE ACT (${String(ACT_III_B1_IDS[0])}–${String(ACT_III_REGISTERED_TAIL_LEVEL_ID)} → ${String(ACT_III_REGISTERED_IDS[0])}–${String(ACT_III_REGISTERED_IDS[ACT_III_REGISTERED_IDS.length - 1] ?? 0)}) and the tail law re-derived to the SAME reading (${reading.actIIIWidened.dexec.toFixed(6)} at L${String(reading.actIIIWidened.levelId)}, zero-move ${ACT_III_B2_TAIL_ZERO_MOVE.toFixed(6)}) with the batch's own peak ${reading.actIIIWidenedBatchPeak.dexec.toFixed(6)} pinned ${ACT_III_B2_PEAK_BELOW_TAIL.toFixed(6)} BELOW it,`,
);
console.log(
  `all ${String(registered.length)} §7.3 tail clauses PASS (this instrument controls R-008's ${String(ACT_TAIL_R008_CLAUSE_IDS.length)} of them, by name), the widening holds in both directions, and §7.3.1's sixth label — the register's second \`batch-seam\` and second fill-in-before-existence — is cited verbatim with its published ΔD_exec, its bound's admissible half and its three commit dates;`,
);
console.log(
  `the shelf is EMPTY (README only) and ${SUCCESSOR_NAME} is absent from the root AND the shelf — L51–L060 stay UNBOOKED at this tip.`,
);