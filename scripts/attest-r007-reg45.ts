/**
 * `scripts/attest-r007-reg45.ts` — **R-007**: the registration re-attestation for **Act III
 * batch 1** (`l041`–`l045`, LV-018) and the act-scale tail law's **first act boundary**
 * (`docs/level-design.md` §7.3 / §7.3.1 / §7.3.2 / §7.9 / §7.10).
 *
 * The fourth instrument of the train (`attest-r004a-act2` → `attest-r005a-reg35` →
 * `attest-r006a-reg40` → here), and the order is the same because the *reason* is the same: a
 * registration is a **byte-copy, never an edit**, and the law moves only after the root bytes
 * have been re-measured.
 *
 *   [1/6] **byte identity** — each new root file is `git`-hashed **and** `sha256`-hashed and
 *        compared with the shelf it was moved from at the dispatch base (`82dd808`, the parent
 *        of the tip the train was cut from). A check that cannot run (git cannot answer) is a
 *        FAILURE, never a skip. The shelf is *also* read, and it is read as an **era state**
 *        rather than as a constant: batch 1 MOVED its five rungs out of it, so a shelf still
 *        holding any of `ACT_III_B1_IDS` would mean the move silently became a copy (two
 *        byte-identical copies of one rung is exactly the drift `git mv` exists to prevent). At
 *        R-007 the shelf was EMPTY; LV-019 later occupied it with a *different* batch
 *        (`l046`–`l050`), and this refresh reads that occupancy instead of asserting the old
 *        emptiness — no shelf file may carry a registered id, and every shelf id must be
 *        strictly above the registered root maximum. The **successor name** is verified ABSENT
 *        from the **root** by reading the directory (`l046` is still not registered); the shelf
 *        holding it is printed, because a shelf file is a *candidate*, never a registered rung,
 *        and this instrument must not assume either state.
 *        *(Refresh, disclosed: R-007's original body asserted an EMPTY shelf and a successor
 *        absent from BOTH directories. Both were era claims about the shelf at R-007's tip; LV-019's
 *        occupancy falsified them lawfully — the shelf is a work surface, not a frozen artifact.
 *        Precedent: R-006a's refresh of the R-005a attest. The five registered rungs' byte
 *        identity, the roster, the ladder proof and every act-level clause are UNCHANGED.)*
 *   [2/6] **the five registered rows, re-measured on the ROOT bytes** — par (solver-stamped),
 *        `D_exec`, `B`, coverage, the all-OFF world, `T`/`R` and the audit's violation list,
 *        each against `ACT_III_B1_LADDER` (`@/core/solver/policy`, the law) and not against a
 *        note — **plus the family-gate proof at the root**, taken as `scripts/prove-candidate.ts`'s
 *        own stdout (its per-rung **13/13 controls by name**, its `par routes=… press-then-cross`
 *        line, its all-OFF line and its measured `LADDER RESULT`), **the frozen `measureCut()`
 *        line**, and the **§6.1.4 clone-guard census**. A control table re-implemented here would
 *        be a statement about *this file* instead of about the proof.
 *   [3/6] **§7.3's act-scale tail law** — the act peaks and the medium rows are **measured** and
 *        fed to `actScaleTailGuards`, which reports **twenty-two** clauses (R-004a's six, R-005a's
 *        five, R-006a's five, R-007's six; the four sets are asserted to **partition** the reported
 *        set, so a clause with no instrument reddens a printed row). The reading is taken with
 *        **Act III's own basis**, because reading it off Act II's field would publish Act II's tail
 *        as "Act III's maximum" — the stale-reading failure R-004a named, one act later.
 *   [4/6] **anti-tautology controls, one per R-007 clause** — a restamped Act III row table, a
 *        relabelled Act III tail, a raised Act III maximum, a **moved pre-registration standard**
 *        (the injection that shows the alias-typed standard is read, not asserted), a narrowed Act
 *        III ceiling and an out-of-band seam. Each must FAIL **its own clause** by name, and the
 *        registered reading must PASS every reported clause. Then **both directions of the act
 *        boundary**: moving the **historical era basis** must fail exactly the historical clauses
 *        and leave Act III's green; moving the **live Act III reading** must fail exactly Act
 *        III's value clauses and leave the historical ones green.
 *   [5/6] **§7.3.1's fifth instance, and the sawtooth across the boundary** — the registered drop
 *        passes its clause, an out-of-band seam FAILs, a measurement that omits a registered rung
 *        FAILs, *every* adjacent drop across the act boundary is a named instance (four now), and
 *        the **falsification probe sized to Act III's own act maximum** must refuse exactly
 *        `act-peak` on exactly `L45` while the rest of the ladder still proves.
 *   [6/6] **the labels and the constants** — the fifth instance's published `ΔD_exec` derived from
 *        the registered bytes and checked **as a bound** (inside §7.10.4's union *and* inside the
 *        admissible `par 20` half), §7.9's notation law read on the label itself, the **verbatim**
 *        label anchor and its **provenance** (bound commit → fill-in commit → byte commit, with the
 *        fill-in proved to PRECEDE the board's existence by asking git for the file at that
 *        commit), §7.9's derived-exact headroom with the printed-operand counterfactual, the tail /
 *        pre-standard / advantage arithmetic, and the **twenty** previously registered Act II rungs
 *        (R-004a's five, R-005a's ten, R-006a's five) shown **un-restamped**.
 *
 * `STOP_AND_ROUTE` (exit 1) is the only honest answer to a disagreement: the registered bytes are
 * immutable and are never re-authored to fit a later reading (ADR-0004).
 *
 *   npx tsx scripts/attest-r007-reg45.ts
 *   npx tsx scripts/attest-r007-reg45.ts --origin=<sha>:src/levels/candidates   # override the byte-identity source
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
  ACT_II_EXEC_BAND,
  ACT_II_REGISTERED_IDS,
  ACT_II_R005A_ERA_IDS,
  ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I,
  ACT_II_R006A_REGISTERED_TAIL_EXEC,
  ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_B1_IDS,
  ACT_III_B1_LADDER,
  ACT_III_B1_OPEN_RELIEF,
  ACT_III_B1_OPEN_RELIEF_ADMISSIBLE_FIRST_RUNGS,
  ACT_III_B1_OPEN_RELIEF_DELTA,
  ACT_III_B1_OPEN_RELIEF_DELTA_RANGE,
  ACT_III_B1_OPEN_RELIEF_EXEC,
  ACT_III_B1_OPEN_RELIEF_PREVIOUS_EXEC,
  ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID,
  ACT_III_B_BAND,
  ACT_III_CEILING_RESERVATION_MARGIN,
  ACT_III_EXEC_BAND,
  ACT_III_OPENER_PAR_MULTISET,
  ACT_III_OPENER_TOP_PAR,
  ACT_III_PAR_CEILING,
  ACT_III_PAR_FLOOR,
  ACT_III_PRE_R007_REGISTERED_TAIL_EXEC,
  ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II,
  ACT_III_REGISTERED_TAIL_EXEC,
  ACT_III_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_TAIL_ADVANTAGE,
  ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING,
  ACT_SEAM_RELIEFS_ALL,
  ACT_TAIL_R004A_CLAUSE_IDS,
  ACT_TAIL_R005A_CLAUSE_IDS,
  ACT_TAIL_R006A_CLAUSE_IDS,
  ACT_TAIL_R007_CLAUSE_IDS,
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
 * The commit and directory the five files were **moved from**. `82dd808` is the tip's parent —
 * the commit the registration train was cut from, and the commit at which the shelf still held
 * `l041`–`l045`. Overridable, because the origin is data about *this* registration rather than a
 * convention: a re-run against a moved shelf must say so out loud.
 */
const ORIGIN = argOf("origin") ?? "82dd808:src/levels/candidates";
const ORIGIN_SHA = ORIGIN.slice(0, ORIGIN.indexOf(":"));
const ORIGIN_DIR = ORIGIN.slice(ORIGIN.indexOf(":") + 1);

/** The successor's name, which this ticket must NOT have created (read, never assumed). */
const SUCCESSOR_NAME = "l046.json";

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
  "attest-r007-reg45 — Act III batch 1 registration (L41–L45) + the §7.3 act boundary",
);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(`origin:     L41–L45 ${ORIGIN} (the shelf the bytes were moved from)`);
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
for (const id of ACT_III_B1_IDS) {
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
// The shelf is read as an *era state*, not as a constant. A registration that MOVED five files
// leaves it empty at that tip; a shelf still holding a moved rung would mean the move silently
// became a copy (two byte-identical copies of the same rung is exactly the drift `git mv` exists
// to prevent). LV-019 later *occupied* the shelf with a different batch (`l046`–`l050`), so the
// durable reading is not "empty" but "no registered id, and every id above the registered root
// max": a candidate is legal on the shelf precisely while it is NOT a registered rung.
const shelfEntries = readdirSync(SHELF_DIR);
const shelfLevels = shelfEntries.filter((n) => /^l\d+\.json$/.test(n));
const shelfIds = shelfLevels.map((n) => Number(/^l(\d+)\.json$/.exec(n)?.[1] ?? Number.NaN));
const rootMaxId = Math.max(...ACT_III_B1_IDS);
const shelfHoldsRegistered = shelfIds.filter((id) => ACT_III_B1_IDS.includes(id));
const shelfAboveRootMax = shelfIds.every((id) => id > rootMaxId);
check(
  "the shelf holds no registered rung and every shelf id is strictly above the registered root max (R-007 MOVED its five; a copy would have left them)",
  shelfHoldsRegistered.length === 0 &&
    shelfAboveRootMax &&
    shelfIds.length === shelfLevels.length,
  `src/levels/candidates holds ${String(shelfLevels.length)} level file(s) ` +
    `[${shelfEntries.join(" ")}] — ids [${shelfIds.join(", ")}] (root max registered id ${String(rootMaxId)}); ` +
    `shelf files carrying a registered id: [${shelfHoldsRegistered.join(", ")}]; ` +
    `every shelf id above the root max = ${String(shelfAboveRootMax)} — at R-007's tip this read EMPTY, ` +
    `and the reading is era-scoped so a later occupancy is *measured* here rather than forbidden`,
);
// The roster, read rather than assumed: 45 registered rungs, and the successor name ABSENT from
// the ROOT. A registration that also created `l046` at the root would be a second, un-booked move.
// The suffix of this check is scoped to the ROOT on purpose after LV-019: the shelf holding
// `l046` is a lawful *candidate*, and the harm this check exists to catch is a rung becoming
// *registered* (or registered twice) without a registration ticket.
const rootNames = readdirSync(LEVELS_DIR).filter((n) => /^l\d+\.json$/.test(n));
check(
  "the roster is exactly 45 registered rungs at the root, in one unbroken run",
  rootNames.length === 45 &&
    rootNames[0] === "l001.json" &&
    rootNames[44] === "l045.json" &&
    rootNames.every((n, i) => n === fileOf(i + 1)),
  `${String(rootNames.length)} files · first ${rootNames[0] ?? "n/a"} · last ${rootNames[44] ?? "n/a"} · ids 1…${String(rootNames.length)} with no gap`,
);
check(
  `the successor name ${SUCCESSOR_NAME} is ABSENT from the ROOT (read, not assumed)`,
  !rootNames.includes(SUCCESSOR_NAME),
  `root holds ${String(rootNames.filter((n) => n === SUCCESSOR_NAME).length)} ${SUCCESSOR_NAME} — the successor is ` +
    `UNREGISTERED (Act III's next batch is not named by this ticket); the shelf holds ` +
    `${String(shelfEntries.filter((n) => n === SUCCESSOR_NAME).length)} as a CANDIDATE (a shelf file is not a registration, ` +
    `and the shelf's own reading above is what keeps that lawful)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [2/6] the five registered rows, re-measured from the ROOT bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[2/6] the registered rows — re-measured from the ROOT bytes, never read from a note",
);
const measured = ACT_III_B1_LADDER.map((row) => {
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
      `preferred 7×7 frame at CX = 1 — the frame Act II's batch 3 measured EMPTY at CX = 2)`,
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
 * A named, printed reading rather than a silent pass — and the same gap R-006a recorded, one act
 * later. The audit dispatches its per-rung gate families from the *documented lesson row*
 * (`DOCUMENTED_LESSONS`); the five rows **exist** (`l041`–`l045`) but they dispatch **no family**:
 * the act's per-rung readers (`act2Batch1Gates`) key their rung on `ACT_II_B1_IDS` and read
 * `ACT_II_B1_LADDER`, so a value there would mis-key these boards or graft an Act II rung onto
 * another block's law. The five rungs therefore carry **no registered per-rung gate family**, and
 * their proof at this ticket is the family-gate run below (`scripts/prove-candidate.ts`, 13/13
 * named controls per rung). Recorded so the gap is visible in the artifact rather than inferred
 * from a zero — booked for a later ticket as an `act-3-batch-1` **family** (obligation behind an
 * `ACT_III_B1_LADDER`-keyed reader: design content + QA's one-control-per-code table + the re-pin).
 * This row reddens exactly when a **family** lands — not when a row lands.
 */
const gateFamilies = new Set(measured.map((m) => m.audit.gates.length));
check(
  "the registered-bytes audit carries no per-rung gate family for L41–L45 yet (booked gap, NOT a silent pass)",
  gateFamilies.size === 1 && [...gateFamilies][0] === 0,
  `audit gate counts across the five rungs: [${[...gateFamilies].join(", ")}] — the proof of these rungs in this artifact is the family-gate run below; ` +
    "a future `act-3-batch-1` OBLIGATION must also extend this instrument (a ladder-keyed family is the event that reddens this row)",
);
check(
  "the five rows reproduce their registered table (all of it, rung by rung)",
  rowsOk,
  `${String(measured.filter((m) => m.audit.difficulty.Dexec !== null).length)}/${String(measured.length)} rungs re-measured against ACT_III_B1_LADDER · ` +
    `pars ${ACT_III_B1_LADDER.map((r) => String(r.par)).join(" / ")} = §7.10.2's multiset ${ACT_III_OPENER_PAR_MULTISET.join(" / ")}`,
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
          `--ladder=${ACT_III_B1_IDS.join(",")}`,
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
  "the prover's own per-rung readings agree with this instrument's (par / press-then-cross / all-OFF / peak rung)",
  rungBench.length === 5 &&
    rungBench.every(
      (m, i) =>
        Number(m.groups?.par) === ACT_III_B1_LADDER[i]?.par &&
        near(Number(m.groups?.dexec), ACT_III_B1_LADDER[i]?.dexec ?? Number.NaN),
    ) &&
    rungRoutes.length === 5 &&
    rungRoutes.every((m) => m[1] === m[2]) &&
    rungAllOff.length === 5 &&
    rungPeak.length === 5 &&
    rungPeak.every((m) => Number(m[1]) === ACT_III_REGISTERED_TAIL_LEVEL_ID),
  `printed par/D_exec per rung [${rungBench.map((m) => `${String(m.groups?.par)}/${String(m.groups?.dexec)}`).join(", ")}] · ` +
    `parRoutes ${rungRoutes.map((m) => String(m[1])).join("/")} all press-then-cross · ` +
    `all-OFF line present on ${String(rungAllOff.length)}/5 · act-peak's own ladder peak rung L${rungPeak.map((m) => m[1]).join(", L")}`,
);
// The cut's own filter is FROZEN at the world below the ladder under construction: Act III moved
// five rungs into the root, so the exclusion list had to grow with the dataset again (F-L41-3 is
// exactly the finding that it did not: the first run of this ladder refused all five rungs with
// `FAIL escalation D_exec=24.257329 > CUT 30.455319`, because Act III's own tail had been counted
// into the cut's basis). The shipped-file count is read as **instrument agreement** (the prover's
// census == this instrument's own census) rather than typed, so a later registration moves the
// count without reddening a row that is not about the cut.
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
// that does NOT hold the registered rungs (it was emptied by R-007 and is now occupied by a later
// batch) — which must exit non-zero rather than silently "proving" nothing.
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
    `a ladder pointed at the shelf (src/levels/candidates, which holds no registered rung) exits ${String(shelfRun.exit)} (required ≠ 0) — neither the reader nor the prover's exit code is an assumption`,
);

// ── §6.1.4 clone guard ───────────────────────────────────────────────────────
//
// The key is the **seal-inclusive geometry key** published by `scripts/author-l20.ts` (§6.1.4
// "never clone a shipped board", extended past the plain `player|goal|portal-pair` triple to
// include the sorted door tiles so a re-stamped *seal* is visible). The definition is re-stated
// here rather than imported because it lives in a script with top-level effects, so it is **pinned
// against a published number** instead: over ids 1–35 the census must still read the **31** distinct
// keys LV-017's transcript recorded, and over ids 1–40 the **36** R-006a's census read — which is
// what catches a drift in the key itself.
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
const actIIICensus = censusOf(measured.map((m) => ({ id: m.id, level: m.level })));
const priorKeys = new Set(
  all.filter((s) => !ACT_III_B1_IDS.includes(s.id)).map((s) => cloneKeyOf(s.level)),
);
const actIIICollisions = [...actIIICensus.keys()].filter((k) => priorKeys.has(k));
check(
  "§6.1.4 clone guard — the five Act III rungs carry five distinct seal-inclusive keys, 0 of them colliding with the other 40 registered boards",
  actIIICensus.size === 5 &&
    actIIICollisions.length === 0 &&
    censusR006aEra.size === 36 &&
    censusAll.size === 41 &&
    censusAll.size === censusR006aEra.size + actIIICensus.size,
  `${String(censusAll.size)} distinct key(s) over the ${String(all.length)} registered root files ` +
    `(${String(censusR006aEra.size)} over ids 1–${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)} = the reading R-006a's census published, ` +
    `+ ${String(actIIICensus.size)} ⇒ the new act's five are all FRESH: 0 cross-act and 0 intra-batch collisions) · ` +
    `collisions with the other ${String(all.length - ACT_III_B1_IDS.length)} board(s): [${actIIICollisions.join(", ")}]`,
);
check(
  "§6.1.4 clone guard — the key itself has not drifted (it still reproduces the 31 distinct keys LV-017's transcript recorded over ids 1–35)",
  censusR005aEra.size === 31,
  `ids 1–${String(ACT_II_R005A_ERA_IDS[ACT_II_R005A_ERA_IDS.length - 1])} ⇒ ${String(censusR005aEra.size)} distinct key(s) (published reading 31) · ` +
    `ids 1–${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)} ⇒ ${String(censusR006aEra.size)} (published reading 36) · ` +
    `ids 1–45 ⇒ ${String(censusAll.size)} — the census is a Map, so the collision groups are visible in the key list rather than inferred`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [3/6] §7.3 — the act-scale tail law, measured
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[3/6] §7.3 act-scale tail law — the act peaks, measured on the root bytes",
);
// R-007's change here is exactly the **act boundary**: Act III now has its own basis
// (`ACT_III_B1_IDS`, L41–L45) and its own peak field, while Act I's basis is the complement of
// *both* registered later acts. One implementation (`measureActScaleReading`) builds the reading
// for all four instruments: two transcripts of the same law that measure it two ways is how a
// stale reading survives a registration.
const reading: ActScaleLawReading = measureActScaleReading(
  all.map((s) => s.level),
);
console.log(
  `  measured: Act I peak ${reading.actI.dexec.toFixed(6)} (L${String(reading.actI.levelId)}) · ` +
    `Act II peak ${reading.actII.dexec.toFixed(6)} (L${String(reading.actII.levelId)}, ids 21–${String(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)}) · ` +
    `era peak at R-005a ${reading.actIIAtR005a.dexec.toFixed(6)} (L${String(reading.actIIAtR005a.levelId)}) · ` +
    `Act III peak ${reading.actIII.dexec.toFixed(6)} (L${String(reading.actIII.levelId)}, ids ${String(ACT_III_B1_IDS[0])}–${String(ACT_III_B1_IDS[ACT_III_B1_IDS.length - 1] ?? 0)}) · ` +
    `pre-R007 standard ${reading.preR007Standard.toFixed(6)} at L${String(ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID)} · ` +
    `Act III ceiling ${reading.actIIIExecCeiling.toFixed(4)} (Act II's own stays ${reading.execCeiling.toFixed(4)})`,
);
console.log(
  `  five new rows read off the bytes: ${reading.actIIIBatchRows.map((r) => `L${String(r.id)} ${String(r.par)}/${r.dexec.toFixed(6)}/${r.b.toFixed(4)}`).join(" · ")}`,
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
// The partition, in the four-instrument form. R-006a grew the reported set from eleven to sixteen
// and R-007 grew it to twenty-two (six + five + five + six, the last set written across an act
// boundary); the invariant that keeps a NEW clause from riding along with no instrument is that
// the four registrations' clause lists are pairwise disjoint AND cover every reported clause AND
// together equal the reported count. Sum vs distinct catches an overlap; the unclaimed list
// catches a clause with no home. **Refreshed at R-007, not relaxed**: the R-007 list joins the
// claimed union and the R-006a assertion that "no R-004a/R-005a *constant value* moved" is
// unchanged — the same refresh the two earlier instruments carry.
const claimedClauses = new Set<ActTailClauseId>([
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
const unclaimedClauses = registered.filter((c) => !claimedClauses.has(c.clause));
check(
  "the clause split PARTITIONS the reported set across four instruments, and this one owns R-007's six",
  claimedClauses.size === registered.length &&
    claimedSum === claimedClauses.size &&
    unclaimedClauses.length === 0 &&
    ACT_TAIL_R007_CLAUSE_IDS.length === 6,
  `reported ${String(registered.length)} = R-004a ${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} (scripts/attest-r004a-act2.ts) + ` +
    `R-005a ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} (scripts/attest-r005a-reg35.ts) + ` +
    `R-006a ${String(ACT_TAIL_R006A_CLAUSE_IDS.length)} (scripts/attest-r006a-reg40.ts) + ` +
    `R-007 ${String(ACT_TAIL_R007_CLAUSE_IDS.length)} [${ACT_TAIL_R007_CLAUSE_IDS.join(", ")}] (here) = ` +
    `${String(claimedSum)} claimed · ${String(claimedClauses.size)} distinct · ${String(unclaimedClauses.length)} unclaimed`,
);
check(
  "the act boundary is read from Act III's OWN field (a reading off `actII` would publish Act II's tail as Act III's maximum)",
  near(reading.actIII.dexec, ACT_III_REGISTERED_TAIL_EXEC) &&
    reading.actIII.levelId === ACT_III_REGISTERED_TAIL_LEVEL_ID &&
    reading.actII.dexec !== reading.actIII.dexec &&
    near(reading.actII.dexec, ACT_II_R006A_REGISTERED_TAIL_EXEC),
  `actIII reads ${reading.actIII.dexec.toFixed(6)} at L${String(reading.actIII.levelId)} while actII reads ${reading.actII.dexec.toFixed(6)} at L${String(reading.actII.levelId)} ` +
    `— two acts, two fields, and the pre-R007 standard field reads ${reading.preR007Standard.toFixed(6)} (the previous act's registered tail, alias-typed)`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [4/6] anti-tautology controls, one per R-007 clause, and the act boundary
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[4/6] anti-tautology — one control per R-007 clause, then the act boundary probed in both directions",
);
interface TailControl {
  readonly clause: ActTailClauseId;
  readonly name: string;
  readonly reading: ActScaleLawReading;
}
const restampRow = (
  rows: readonly (typeof ACT_III_B1_LADDER)[number][],
  id: number,
  par: number,
): typeof ACT_III_B1_LADDER =>
  rows.map((r) => (r.id === id ? { ...r, par } : r));
const tailControls: readonly TailControl[] = [
  {
    clause: "act-tail-r007-registered-rows",
    name: "-registered-rows: one Act III row restamped in the TABLE (L43 par 24 → 30)",
    reading: {
      ...reading,
      actIIIBatchTable: restampRow(reading.actIIIBatchTable, 43, 30),
    },
  },
  {
    clause: "act-tail-r007-tail-pin",
    name: "-tail-pin: the Act III maximum relabelled onto L44 (same value, wrong carrier)",
    reading: {
      ...reading,
      actIII: { levelId: ACT_III_REGISTERED_TAIL_LEVEL_ID - 1, dexec: reading.actIII.dexec },
    },
  },
  {
    clause: "act-tail-r007-peak-advantage",
    name: "-peak-advantage: Act III's maximum raised +0.5 in band (the across-act gap stops reproducing the pin)",
    reading: {
      ...reading,
      actIII: { levelId: reading.actIII.levelId, dexec: reading.actIII.dexec + 0.5 },
    },
  },
  {
    clause: "act-tail-r007-pre-standard",
    name: "-pre-standard: the STANDARD lowered by 1 (a re-registration restamping what it is judged against)",
    reading: { ...reading, preR007Standard: ACT_III_PRE_R007_REGISTERED_TAIL_EXEC - 1 },
  },
  {
    clause: "act-tail-r007-exec-headroom",
    name: "-exec-headroom: Act III's band narrowed (the derived headroom stops reproducing the pin)",
    reading: { ...reading, actIIIExecCeiling: ACT_III_EXEC_BAND[1] - 0.5 },
  },
  {
    clause: "act-tail-r007-seam-reliefs",
    name: "-seam-reliefs: instance 5's arriving rung moved out of band with a self-consistent published Δ",
    reading: {
      ...reading,
      seams: reading.seams.map((s) =>
        s.toLevelId === ACT_III_B1_OPEN_RELIEF.toLevelId
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
  "every R-007 clause has a control and every control is refused by ITS OWN clause's name",
  tailCaught === tailControls.length &&
    tailControls.length === ACT_TAIL_R007_CLAUSE_IDS.length &&
    tailControls.every((c) => ACT_TAIL_R007_CLAUSE_IDS.includes(c.clause)),
  `${String(tailCaught)}/${String(tailControls.length)} caught · R-007 clauses covered ${String(new Set(tailControls.map((c) => c.clause)).size)}/${String(ACT_TAIL_R007_CLAUSE_IDS.length)}`,
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
// ── the act boundary, probed in BOTH directions ──────────────────────────────
//
// This is the structural claim of the ticket, so it is a control rather than prose: R-007 *opened*
// a boundary, so two readings that used to be one field are now two. Direction (a) moves the
// **historical era basis** (to the live Act II act) and requires the refusal to land on EXACTLY
// R-005a's three act-level clauses, leaving everything else green; direction (b) moves the **live
// Act III reading** and requires the refusal to land on EXACTLY Act III's three value clauses
// (`-tail-pin`, `-peak-advantage`, `-exec-headroom` — the pre-standard clause reads its own
// injectable field, which is why direction (c) below exists). Either direction failing the other
// side's clauses would mean a clause is reading the wrong act — the stale-reading failure this
// ticket exists to prevent.
const refusalSetOf = (r: ActScaleLawReading): readonly string[] =>
  actScaleTailGuards(r)
    .filter((c) => c.status === "FAIL")
    .map((c) => c.clause);
const eraMoved = refusalSetOf({ ...reading, actIIAtR005a: reading.actII });
const actIIIMoved = refusalSetOf({
  ...reading,
  actIII: {
    levelId: ACT_III_REGISTERED_TAIL_LEVEL_ID - 1,
    dexec: reading.actIII.dexec + 0.5,
  },
});
const standardMoved = refusalSetOf({
  ...reading,
  preR007Standard: ACT_III_REGISTERED_TAIL_EXEC,
});
const eraExpected = [
  "act-tail-r005a-tail-pin",
  "act-tail-r005a-pre-standard",
  "act-tail-r005a-exec-headroom",
];
const actIIIExpected = [
  "act-tail-r007-tail-pin",
  "act-tail-r007-peak-advantage",
  "act-tail-r007-exec-headroom",
];
const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
check(
  "(a) moving the FROZEN ERA BASIS fails exactly R-005a's three act-level clauses and leaves Act III's clauses green",
  sameSet(eraMoved, eraExpected),
  `era basis ← the live Act II act ⇒ FAIL [${eraMoved.join(", ")}] (required exactly [${eraExpected.join(", ")}]) · ` +
    `every one of the other ${String(registered.length - eraExpected.length)} clauses stays PASS · Act III's six unaffected = ` +
    `${String(ACT_TAIL_R007_CLAUSE_IDS.every((id) => !eraMoved.includes(id)))}`,
);
check(
  "(b) moving the LIVE ACT III reading fails exactly Act III's three value clauses and leaves every historical clause green",
  sameSet(actIIIMoved, actIIIExpected),
  `Act III ← relabelled to L${String(ACT_III_REGISTERED_TAIL_LEVEL_ID - 1)} and raised ${(reading.actIII.dexec + 0.5).toFixed(6)} ⇒ FAIL [${actIIIMoved.join(", ")}] ` +
    `(required exactly [${actIIIExpected.join(", ")}]) · none of the ${String(ACT_II_REGISTERED_IDS.length)} Act II-era clauses moved: ` +
    `${String([...ACT_TAIL_R004A_CLAUSE_IDS, ...ACT_TAIL_R005A_CLAUSE_IDS, ...ACT_TAIL_R006A_CLAUSE_IDS].every((id) => !actIIIMoved.includes(id)))}`,
);
// (c) the alias-typed standard exists to be MOVEABLE in a probe, not merely cited: inverting it
// must fail the rise clause and nothing else. Without this the standard would be an assertion about
// a constant, which is exactly the self-confirming shape R-003d named.
check(
  "(c) the pre-registration STANDARD is read, not asserted: restamping it fails exactly act-tail-r007-pre-standard",
  sameSet(standardMoved, ["act-tail-r007-pre-standard"]),
  `standard ← Act III's own tail (${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)}) ⇒ FAIL [${standardMoved.join(", ")}] (required exactly [act-tail-r007-pre-standard]) · ` +
    `the value clauses still read the bytes — they are judged against separate fields, so the coincidence that ` +
    `ACT_III_TAIL_ADVANTAGE and ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II are both ${ACT_III_TAIL_ADVANTAGE.toFixed(6)} ` +
    `(same number, one measurement: the pre-R007 standard IS Act II's tail and Act III's maximum IS its own tail) is NOT two clauses confirming each other`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [5/6] §7.3.1's fifth instance, the sawtooth, and the act-peak falsification
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[5/6] the §7.3.1 fifth instance — both directions probed, every adjacent drop accounted for, and Act III's maximum falsified",
);
const seamClause = (r: ActScaleLawReading): GateStatus =>
  actScaleTailGuards(r).find((c) => c.clause === "act-tail-r007-seam-reliefs")
    ?.status ?? "FAIL";
/** One rung's `D_exec`, re-measured from the registered bytes (never read from a seam spec). */
const dexecOf = (id: number): number =>
  auditLevel(readLevel(id)).difficulty.Dexec ?? Number.NaN;
const seamFrom = dexecOf;
/**
 * **The sawtooth, measured ACROSS the boundary.** The registered `D_exec` is deliberately
 * non-monotone at the batch seams (`L25→L26 −6.044410`, `L30→L31 −4.362098`, `L35→L36 −6.038144`,
 * and now the **act boundary itself** `L40→L41 −4.197990` — a `kind: "act-open"` relief, the
 * register's first) and rises everywhere else. §7.3's `act-peak` clause rides on the act's
 * **maximum**, and §7.3.1 makes a relief registrable by its **pre-published label** — so a
 * validator demanding monotony would have refused four *registered* seams, and one demanding a
 * drop at every cross-act step would refuse all twenty interior rises. Falsified here by
 * measurement, over the **live registered run** `ACT_II_REGISTERED_IDS ++ ACT_III_B1_IDS`
 * (L21–L45), with the named-instance list being `ACT_SEAM_RELIEFS_ALL` (every instance the law
 * carries, both species).
 */
const runIds = [...ACT_II_REGISTERED_IDS, ...ACT_III_B1_IDS];
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
const actIIIDrops = drops.filter((s) => s.to >= ACT_III_B1_IDS[0]!);
console.log(
  `  boundary step L${String(ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID)}→L${String(ACT_III_B1_OPEN_RELIEF.toLevelId)}: ` +
    `${(seamFrom(ACT_III_B1_OPEN_RELIEF.toLevelId) - seamFrom(ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID)).toFixed(6)} · ` +
    `Act III's four interior steps: ${steps.filter((s) => s.from >= ACT_III_B1_IDS[0]!).map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(6)}`).join(" · ")}`,
);
check(
  "§7.3.1 — the sawtooth is the registered reading, and the clause PASSes it (a monotony validator would have refused four registered seams)",
  drops.length === 4 &&
    drops.every((s) => namedDrop(s.from, s.to)) &&
    actIIIDrops.length === 1 &&
    seamClause(reading) === "PASS" &&
    rises.length === 20,
  `drops ${String(drops.length)} (all named [${namedSeams.join(", ")}]) · rises ${String(rises.length)} (none labelled, none owed: §7.3 interior freedom) · ` +
    `clause act-tail-r007-seam-reliefs on the registered reading = ${seamClause(reading)}`,
);
check(
  "§7.3.1 — no UNNAMED relief hides in the bytes across the act boundary (every adjacent drop is a named instance)",
  drops.every((s) => namedDrop(s.from, s.to)) &&
    ACT_III_B1_OPEN_RELIEF.kind === "act-open" &&
    ACT_SEAM_RELIEFS_ALL.some((s) => s.kind === "act-open"),
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
  "the unnamed-relief reader can fail (a fabricated drop is named as unnamed, with the four registered drops excluded)",
  fabricatedDrops.length === 1 &&
    fabricatedDrops[0]!.from === 42 &&
    fabricatedDrops[0]!.to === 43,
  `fabricated drops at unnamed pairs: [${fabricatedDrops.map((s) => `L${String(s.from)}→L${String(s.to)} ${s.delta.toFixed(6)}`).join(", ")}] (required exactly L42→L43; the registered drops [${namedSeams.join(", ")}] are excluded by name)`,
);
// A measurement that DROPS a registered rung cannot satisfy the clause: the instance is required,
// not optional, and a dataset missing L41 fails by name rather than skipping the check.
const withoutL41 = measureActScaleReading(
  all
    .filter((s) => s.id !== ACT_III_B1_OPEN_RELIEF.toLevelId)
    .map((s) => s.level),
);
const missingSeam = actScaleTailGuards(withoutL41).find(
  (c) => c.clause === "act-tail-r007-seam-reliefs",
);
check(
  "a measurement that omits a registered rung FAILs the seam clause (the instance is required, not optional)",
  missingSeam?.status === "FAIL" &&
    (missingSeam.detail.includes("MISSING") ||
      missingSeam.detail.includes("NaN")),
  `reading built from the ${String(all.length - 1)} shipped files without L${String(ACT_III_B1_OPEN_RELIEF.toLevelId)} (census ${String(all.length)} − 1): ` +
    `clause ${String(missingSeam?.status)} — ${(missingSeam?.detail ?? "").slice(0, 140)}…`,
);
// ── the falsification probe, SIZED TO ACT III'S OWN ACT MAXIMUM ──────────────
//
// The probe value is *derived*, not typed: the midpoint between the newly registered act tail and
// Act III's derived band ceiling. It is therefore strictly above every registered rung (so exactly
// the peak rung must fail `act-peak`) and strictly inside the band (so no other gate has an
// opinion) — and the arithmetic that puts it there is printed rather than asserted. A probe that
// could not fail is not evidence, and a probe with a typed threshold is a number that goes stale.
const PEAK_PROBE =
  (ACT_III_REGISTERED_TAIL_EXEC + ACT_III_EXEC_BAND[1]) / 2;
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
  `  falsification probe: --peak=${String(PEAK_PROBE)} (= (${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)} + ${String(ACT_III_EXEC_BAND[1])}) / 2, the midpoint of the new act tail and Act III's derived ceiling)`,
);
check(
  "the act-peak probe is sized to ACT III's own act maximum and refuses exactly act-peak on exactly L45",
  peakRun.exit === 1 &&
    peakLadder !== null &&
    peakLadder[1] === "4" &&
    peakLadder[2] === "5" &&
    peakLadder[3] === "65" &&
    peakLadder[4] === "65" &&
    peakFailed.length === 1 &&
    failedIds[0] === ACT_III_REGISTERED_TAIL_LEVEL_ID &&
    failedGates.length === 1 &&
    failedGates[0] === "act-peak",
  `exit ${String(peakRun.exit)} · probe ${PEAK_PROBE.toFixed(6)} sits ${(PEAK_PROBE - ACT_III_REGISTERED_TAIL_EXEC).toFixed(6)} above the registered act max ` +
    `${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)} and ${(ACT_III_EXEC_BAND[1] - PEAK_PROBE).toFixed(6)} below Act III's derived ceiling ${String(ACT_III_EXEC_BAND[1])} · ` +
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
  "[6/6] the §7.3.1 fifth label and the new constants — derived from the registered bytes, quoted verbatim",
);
// The fifth instance's published ΔD_exec, DERIVED from the registered bytes (never read from the
// constant), and the label's own quotation of it.
const delta5 = ACT_III_B1_OPEN_RELIEF.toExec - ACT_III_B1_OPEN_RELIEF.fromExec;
const derivedDelta5 =
  seamFrom(ACT_III_B1_OPEN_RELIEF.toLevelId) -
  seamFrom(ACT_III_B1_OPEN_RELIEF.fromLevelId);
check(
  "§7.3.1 instance 5 — derived ΔD_exec = −4.197990 (L40 28.455319 → L41 24.257329) equals the published Δ, and the label quotes it",
  near(delta5, ACT_III_B1_OPEN_RELIEF.delta) &&
    near(derivedDelta5, ACT_III_B1_OPEN_RELIEF.delta) &&
    near(ACT_III_B1_OPEN_RELIEF_DELTA, ACT_III_B1_OPEN_RELIEF.delta) &&
    near(ACT_III_B1_OPEN_RELIEF_EXEC, ACT_III_B1_OPEN_RELIEF.toExec) &&
    ACT_III_B1_OPEN_RELIEF.label.includes("ΔD_exec = −4.197990") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("`act-open` seam L40→L41") &&
    near(seamFrom(ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID), ACT_III_B1_OPEN_RELIEF_PREVIOUS_EXEC) &&
    near(seamFrom(ACT_III_B1_OPEN_RELIEF.toLevelId), ACT_III_B1_OPEN_RELIEF.toExec),
  `derived ${delta5.toFixed(6)} · measured-on-bytes ${derivedDelta5.toFixed(6)} · published ${ACT_III_B1_OPEN_RELIEF.delta.toFixed(6)} · ` +
    `measured L${String(ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID)} ${seamFrom(ACT_III_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID).toFixed(6)} → ` +
    `L${String(ACT_III_B1_OPEN_RELIEF.toLevelId)} ${seamFrom(ACT_III_B1_OPEN_RELIEF.toLevelId).toFixed(6)}`,
);
// The bound, checked AS A BOUND (and as §7.10.4 splits it): the registered delta must land inside
// the published union AND inside an admissible first-rung half. A fill-in that sat in the union but
// in neither half would be OUTSIDE the label, so the half it matched is printed by name.
const matchedHalf = ACT_III_B1_OPEN_RELIEF_ADMISSIBLE_FIRST_RUNGS.find(
  (r) =>
    ACT_III_B1_OPEN_RELIEF.delta >= r.deltaRange[0] &&
    ACT_III_B1_OPEN_RELIEF.delta <= r.deltaRange[1],
);
check(
  "§7.10.4 — the registered Δ sits inside the published union AND inside an admissible first-rung half (the bound is checked, not quoted)",
  ACT_III_B1_OPEN_RELIEF.delta >= ACT_III_B1_OPEN_RELIEF_DELTA_RANGE[0] &&
    ACT_III_B1_OPEN_RELIEF.delta <= ACT_III_B1_OPEN_RELIEF_DELTA_RANGE[1] &&
    matchedHalf?.par === 20 &&
    ACT_III_B1_OPEN_RELIEF.label.includes("[−4.705319, −1.392819]"),
  `Δ ${ACT_III_B1_OPEN_RELIEF.delta.toFixed(6)} ∈ union [${ACT_III_B1_OPEN_RELIEF_DELTA_RANGE[0].toFixed(6)}, ${ACT_III_B1_OPEN_RELIEF_DELTA_RANGE[1].toFixed(6)}] ` +
    `and ∈ the admissible par-${String(matchedHalf?.par)} half [${matchedHalf?.deltaRange[0].toFixed(6) ?? "n/a"}, ${matchedHalf?.deltaRange[1].toFixed(6) ?? "n/a"}] · ` +
    `the other half (par ${String(ACT_III_B1_OPEN_RELIEF_ADMISSIBLE_FIRST_RUNGS[1]?.par)}) excludes it — a fill-in inside the union but in neither half would be OUTSIDE the label`,
);
// §7.9's notation law, read on the label itself. Instance 5 is a later publication than the
// notation-only amendment GD-011 made, so it carries the **derived-exact** form with the printed
// form in parentheses — like instance 3 and 4 and unlike instance 2.
const printedBandIII = `[${ACT_III_EXEC_BAND[0].toFixed(2)}, ${ACT_III_EXEC_BAND[1].toFixed(2)}]`;
const derivedBandIII = `[${ACT_III_EXEC_BAND[0].toFixed(2)}, ${ACT_III_EXEC_BAND[1]}]`;
check(
  "§7.9 — the label carries Act III's band in the published form (derived-exact + printed in parentheses)",
  ACT_III_B1_OPEN_RELIEF.label.includes(derivedBandIII) &&
    ACT_III_B1_OPEN_RELIEF.label.includes("printed `[23.75, 33.06]`") &&
    derivedBandIII !== printedBandIII &&
    near(ACT_III_EXEC_BAND[0], ACT_III_PAR_FLOOR + 3 * ACT_III_B_BAND[0]) &&
    near(ACT_III_EXEC_BAND[1], ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[1]),
  `instance 5 quotes \`${derivedBandIII}\` with the printed form in parentheses (\`${printedBandIII}\`); the clause's comparison operand is the derived-exact constant, printed forms are display text · ` +
    `derived: [${String(ACT_III_PAR_FLOOR)} + 3·${ACT_III_B_BAND[0].toFixed(4)}, ${String(ACT_III_PAR_CEILING)} + 3·${ACT_III_B_BAND[1].toFixed(4)}]`,
);
// The halves of a registrable relief: attribution, the "no ease the instrument cannot see" clause
// (`M`/`T` are not terms of D_exec), §6's refusal to present a relief as a dip, and the
// fill-in's own decomposition recorded beside the verbatim label text.
check(
  "§7.3.1 — the label is GD-012 §7.10.4's form, carries its attribution and refuses to claim an ease the instrument cannot see",
  ACT_III_B1_OPEN_RELIEF.label.includes("largely an artifact of the measurement design") &&
    /never a dip/.test(ACT_III_B1_OPEN_RELIEF.label) &&
    ACT_III_B1_OPEN_RELIEF.label.includes("labelled Playtest hypothesis") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("§7.3.3") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("ΔM = 0") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("FILL-IN") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("Δpar = −4") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("3·ΔB = −0.197971") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("24.25732899022801 − 28.45531914893617") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("db78a13") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("19:22:17") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("568c136") &&
    ACT_III_B1_OPEN_RELIEF.label.includes("19:56:24"),
  `label tail: "…${ACT_III_B1_OPEN_RELIEF.label.slice(-190)}"`,
);
// PROVENANCE — the half that makes a §7.3.1 relief registrable at all: the label has to PREDATE the
// boards it explains. Read here as a **live measurement of three commits**: the rule commit that
// published the BOUND, the commit that wrote the FILL-IN, and the byte commit that landed the
// rungs. This instance's order is the stronger one — the *value* precedes the *existence* of the
// board it measures — so it is checked as such: `git` is asked for the file AT the fill-in commit,
// and a hit there would mean the fill-in was written with the answer already on disk.
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
const RULE_COMMIT = "b28ed97";
const FILLIN_COMMIT = "db78a13";
const BYTE_COMMIT = "568c136";
const ruleDate = commitDate(RULE_COMMIT);
const fillinDate = commitDate(FILLIN_COMMIT);
const byteDate = commitDate(BYTE_COMMIT);
const ordered =
  ruleDate !== null &&
  fillinDate !== null &&
  byteDate !== null &&
  Date.parse(ruleDate) < Date.parse(fillinDate) &&
  Date.parse(fillinDate) < Date.parse(byteDate);
const boardAtFillin = existsAt(FILLIN_COMMIT, `src/levels/${fileOf(ACT_III_B1_OPEN_RELIEF.toLevelId)}`);
const boardAtBound = existsAt(RULE_COMMIT, `src/levels/${fileOf(ACT_III_B1_OPEN_RELIEF.toLevelId)}`);
const seconds = (a: string | null, b: string | null): number | null =>
  a === null || b === null ? null : (Date.parse(b) - Date.parse(a)) / 1000;
const fillinToBytes = seconds(fillinDate, byteDate);
check(
  "§7.3.1 provenance — bound → fill-in → bytes, in that order, and the FILL-IN predates the board's EXISTENCE",
  ordered && boardAtFillin === false && boardAtBound === false,
  ruleDate === null || fillinDate === null || byteDate === null
    ? "NOT RUN — git could not date one of the commits; a check that did not run is never a pass"
    : `bound ${RULE_COMMIT} ${ruleDate} → fill-in ${FILLIN_COMMIT} ${fillinDate} → bytes ${BYTE_COMMIT} ${byteDate} · ` +
      `${String(fillinToBytes)} s between fill-in and bytes (34 min 7 s) · ` +
      `\`src/levels/${fileOf(ACT_III_B1_OPEN_RELIEF.toLevelId)}\` present at the fill-in commit: ${String(boardAtFillin)} and at the bound commit: ${String(boardAtBound)} ` +
      `— the register's first VALUE-before-EXISTENCE order, which is the stronger one §7.10.4's wording asks for`,
);
check(
  "§7.3.1 / §7.10.4 — instance 5 in the register, and the first `act-open` SPEC the law types",
  ACT_III_B1_OPEN_RELIEF.instance === 5 &&
    ACT_III_B1_OPEN_RELIEF.kind === "act-open" &&
    ACT_SEAM_RELIEFS_ALL.length === 4 &&
    ACT_SEAM_RELIEFS_ALL.every((s, i) => s.instance === i + 2) &&
    ACT_SEAM_RELIEFS_ALL.filter((s) => s.kind === "act-open").length === 1 &&
    ACT_SEAM_RELIEFS_ALL.filter((s) => s.kind === "batch-seam").length === 3,
  `register: ${ACT_SEAM_RELIEFS_ALL.map((s) => `#${String(s.instance)} ${s.kind} L${String(s.fromLevelId)}→L${String(s.toLevelId)}`).join(" · ")} — ` +
    `instances 2–5, so §7.3.1's instance 1 (the registered act-open at L20→L21, R-004a's labelled plateau relaxation) is cited by its own clause ` +
    `(act-tail-l21-open-relief) rather than re-typed here · the Act-II batch seams keep their own list (ACT_II_SEAM_RELIEFS_ALL) and this register is the union, ` +
    `so no Act-II-named constant had to lie about its contents`,
);
// The tail arithmetic: the pre-registration standard, the live tail, the measured rise, the
// across-act advantage, and the DERIVED-EXACT headroom with its printed-operand counterfactual
// (§7.9's whole reason for existing: the last 0.0025 of the band, third band).
const derivedHeadroomIII = ACT_III_EXEC_BAND[1] - ACT_III_REGISTERED_TAIL_EXEC;
const printedHeadroomIII =
  Number(ACT_III_EXEC_BAND[1].toFixed(2)) - ACT_III_REGISTERED_TAIL_EXEC;
check(
  "§7.9 — Act III's tail headroom is DERIVED-EXACT: 33.0625 − 30.455319 = 2.607181, and the printed operand would not reproduce it",
  near(derivedHeadroomIII, ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING) &&
    near(ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[1], ACT_III_EXEC_BAND[1]) &&
    near(seamFrom(ACT_III_REGISTERED_TAIL_LEVEL_ID), ACT_III_REGISTERED_TAIL_EXEC) &&
    Math.abs(printedHeadroomIII - ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING) > 1e-3 &&
    near(ACT_III_EXEC_BAND[1], reading.actIIIExecCeiling) &&
    !near(ACT_II_EXEC_BAND[1], reading.actIIIExecCeiling),
  `derived ${derivedHeadroomIII.toFixed(6)} = pinned ${ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)}; the printed operand (${ACT_III_EXEC_BAND[1].toFixed(2)}) would give ` +
    `${printedHeadroomIII.toFixed(6)} — a ${Math.abs(printedHeadroomIII - ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING).toFixed(6)} difference, i.e. the sliver §7.9 keeps buildable · ` +
    `Act II's ceiling ${ACT_II_EXEC_BAND[1].toFixed(4)} is a SEPARATE field, so a band swap is a FAIL rather than a shared number`,
);
check(
  "the opened act: pre-R007 standard 28.455319 (L40) → Act III tail 30.455319 (L45), rise 2.000000; the comparator is crossed between L43 and L44, never by every member",
  ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID === ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID &&
    near(ACT_III_PRE_R007_REGISTERED_TAIL_EXEC, ACT_II_R006A_REGISTERED_TAIL_EXEC) &&
    ACT_III_REGISTERED_TAIL_LEVEL_ID === 45 &&
    near(ACT_III_REGISTERED_TAIL_EXEC, 30.455319) &&
    near(ACT_III_REGISTERED_TAIL_EXEC - ACT_III_PRE_R007_REGISTERED_TAIL_EXEC, ACT_III_TAIL_ADVANTAGE) &&
    near(ACT_III_REGISTERED_TAIL_EXEC - ACT_III_PRE_R007_REGISTERED_TAIL_EXEC, ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II) &&
    near(seamFrom(41), 24.257329) &&
    near(seamFrom(43), 28.213816) &&
    near(seamFrom(44), 30.225216) &&
    seamFrom(41) < ACT_II_R006A_REGISTERED_TAIL_EXEC &&
    seamFrom(43) < ACT_II_R006A_REGISTERED_TAIL_EXEC &&
    seamFrom(44) > ACT_II_R006A_REGISTERED_TAIL_EXEC &&
    seamFrom(44) < ACT_III_REGISTERED_TAIL_EXEC &&
    seamFrom(41) < seamFrom(42) &&
    seamFrom(42) < seamFrom(43) &&
    seamFrom(43) < seamFrom(44) &&
    seamFrom(44) < seamFrom(45),
  `standard ${ACT_III_PRE_R007_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID)} (ALIAS-TYPED to Act II's tail — compile-time) · ` +
    `live tail ${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)} at L${String(ACT_III_REGISTERED_TAIL_LEVEL_ID)} · rise ${ACT_III_TAIL_ADVANTAGE.toFixed(6)} · ` +
    `L41 ${seamFrom(41).toFixed(6)} and L43 ${seamFrom(43).toFixed(6)} BELOW the comparator (L43 by ${(ACT_II_R006A_REGISTERED_TAIL_EXEC - seamFrom(43)).toFixed(6)}; the lesson row says so out loud), ` +
    `L44 ${seamFrom(44).toFixed(6)} above it but still below Act III's own maximum ⇒ the across-act rise is carried by the act's MAXIMUM, never by every member · ` +
    `Act II's own across-act record ${ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I.toFixed(6)} is not restated here`,
);
// The twenty previously registered Act II rungs are NOT re-stamped by this ticket: their registered
// rows must still reproduce on the bytes, exactly as R-004a, R-005a and R-006a left them (the
// clone-guard duty applied backwards — an act boundary is where a re-band is most tempting).
const priorRows = [
  ...ACT_II_B1_LADDER,
  ...ACT_II_B2_B3_LADDER,
  ...ACT_II_B4_LADDER,
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
  "the twenty previously registered Act II rungs are un-restamped (R-004a's five, R-005a's ten and R-006a's five still reproduce on the bytes)",
  restampedPrior.length === 0 &&
    priorRows.length === ACT_II_REGISTERED_IDS.length &&
    ACT_II_B1_LADDER.length + ACT_II_B2_B3_LADDER.length + ACT_II_B4_LADDER.length ===
      ACT_II_REGISTERED_IDS.length,
  `${String(priorRows.length)} rows re-measured · mismatches [${restampedPrior.map((r) => `L${String(r.id)}`).join(", ")}] · ` +
    `pars ${priorRows.map((r) => String(r.par)).join(" / ")}`,
);
// The lesson rows: the five new rungs are documented, and the gap is documented *in the row*
// (obligation NULL with the remedy booked by name on L41's row) — the R-006a precedent. Also read:
// `switchRequired` is the MEASURED all-OFF fact and not a decree, so it is cross-checked against
// the byte measurement above rather than trusted.
const lessonRows = ACT_III_B1_IDS.map((id) => documentedLesson(id));
const lessonGaps = lessonRows.filter(
  (l) => l === null || l.obligation !== null,
);
const interior = lessonRows.slice(1);
check(
  "the five new rungs are documented lessons (Act III's gate family is BOOKED on the opener's row, not silently absent)",
  lessonGaps.length === 0 &&
    lessonRows.length === 5 &&
    lessonRows.every((l) => l?.evidence.includes("§7.10")) &&
    lessonRows.every((l) => l?.evidence.includes("src/levels/README.md §2i")) &&
    lessonRows.every((l) => l?.evidence.includes("§8.27")) &&
    lessonRows.every((l) =>
      l?.evidence.includes("ai-native-pipeline.md"),
    ) &&
    interior.every((l) => (l?.evidence ?? "").includes("L41's row")) &&
    (lessonRows[0]?.evidence ?? "").includes(
      "NO REGISTERED PER-RUNG GATE FAMILY",
    ) &&
    (lessonRows[0]?.evidence ?? "").includes("BOOKED REMEDY") &&
    (lessonRows[0]?.evidence ?? "").includes("act-3-batch-1"),
  `${String(lessonRows.length)} rows read · obligation NULL on all (a NULL obligation is honest while the family is unbooked — the remedy is named in L41's row as an \`act-3-batch-1\` ` +
    `family behind an ACT_III_B1_LADDER-keyed reader, and ${String(interior.filter((l) => (l?.evidence ?? "").includes("L41's row")).length)}/${String(interior.length)} interior rows point at it by name) · ` +
    `the family-gap sentence itself lives on the OPENER's row, which is the row a future family has to edit`,
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
// §7.10.2 / O3 — the withheld `par 28` and the ceiling reservation, re-derived rather than quoted:
// the opener's top rung still tops out below any `par 28` tail rung's floor, which is what keeps
// §7.3.2's `act-close` satisfiable on L51–L60 by construction.
check(
  "§7.10.2 / §7.10.3 — the withheld `par 28` is ABSENT from the opener and O3's reservation re-derives",
  !ACT_III_B1_LADDER.some((r) => r.par === ACT_III_PAR_CEILING) &&
    near(
      ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0] -
        (ACT_III_OPENER_TOP_PAR + 3 * ACT_III_B_BAND[1]),
      ACT_III_CEILING_RESERVATION_MARGIN,
    ) &&
    ACT_III_OPENER_PAR_MULTISET.every((par) => par < ACT_III_PAR_CEILING),
  `opener pars ${ACT_III_B1_LADDER.map((r) => String(r.par)).join("/")} (multiset ${ACT_III_OPENER_PAR_MULTISET.join("/")}) · withheld par ${String(ACT_III_PAR_CEILING)} count ${String(ACT_III_B1_LADDER.filter((r) => r.par === ACT_III_PAR_CEILING).length)} · ` +
    `reservation ${ACT_III_CEILING_RESERVATION_MARGIN.toFixed(4)} = any par-${String(ACT_III_PAR_CEILING)} tail rung's floor ` +
    `${(ACT_III_PAR_CEILING + 3 * ACT_III_B_BAND[0]).toFixed(4)} − this opener's top ${(ACT_III_OPENER_TOP_PAR + 3 * ACT_III_B_BAND[1]).toFixed(4)}`,
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
  `RESULT: REGISTERED-MATCH — the five R-007 rungs are byte-identical to the shelf they were moved from (${ORIGIN}),`,
);
console.log(
  "every registered row (par / D_exec / B / grid / coverage) is reproduced by the program solver on the ROOT bytes,",
);
console.log(
  `the five rungs prove at the root under their own family gates (13/13 named controls per rung, ${String(perRung.length)} rungs),`,
);
console.log(
  `the act boundary moved the registered tail with a re-derived identity (${ACT_III_PRE_R007_REGISTERED_TAIL_EXEC.toFixed(6)} → ${ACT_III_REGISTERED_TAIL_EXEC.toFixed(6)}, +${ACT_III_TAIL_ADVANTAGE.toFixed(6)}) and ${ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING.toFixed(6)} of DERIVED-EXACT headroom under Act III's own ceiling,`,
);
console.log(
  `all ${String(registered.length)} §7.3 tail clauses PASS (this instrument controls R-007's ${String(ACT_TAIL_R007_CLAUSE_IDS.length)} of them, by name), the boundary holds in both directions, and §7.3.1's fifth label — the register's first \`act-open\` — is cited verbatim with its published ΔD_exec and its fill-in-before-existence.`,
);