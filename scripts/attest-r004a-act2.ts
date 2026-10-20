/**
 * `scripts/attest-r004a-act2.ts` — **R-004a**: the registration re-attestation for **Act II
 * batch 1** (`l021`–`l025`) and the **act-scale tail law** (`docs/level-design.md` §7.3).
 *
 * Why this exists, in the R-003c/R-003d shape: a registration is a *byte-copy, never an
 * edit*, and the law moves only after the root bytes have been re-measured. So the sections
 * below, in order, are:
 *
 *   [1/6] **byte identity** — each new root file is `git`-hashed **and** `sha256`-hashed and
 *        compared with the shelf it was copied from at the dispatch base commit. A check
 *        that cannot run (git cannot answer) is a FAILURE, never a skip.
 *   [2/6] **the registered ladder, re-measured on the ROOT bytes** — par (solver-stamped),
 *        `D_exec`, `B`, coverage, the all-OFF world, `T`/`R`, the refusal count and the
 *        shared press-then-cross reader, each against `ACT_II_B1_LADDER` (`@/core/solver/policy`,
 *        the law) and not against a note.
 *   [3/6] **§7.3's act-scale tail law** — the act peaks are **measured** (L1–L20, the batch,
 *        the act's first member) and fed to `actScaleTailGuards`, which reports six clauses.
 *   [4/6] **anti-tautology controls, one per tail clause** — a relabel, a restamp, a
 *        collapsed rise, a restamped pre-registration standard, a grafted L20 tail, and an
 *        out-of-band act-open member. Each must FAIL **its own clause** by name; the
 *        registered reading must PASS all six (the discrimination side), and the
 *        monotone-rise hypothesis is *falsified* here rather than assumed away.
 *   [5/6] **per-member gate controls** — one per new `gate-act2-*` code, on the registered
 *        bytes or on the law's own table, each refused by name.
 *   [6/6] **the L16–L20 block is not re-stamped** — its five files are still byte-identical
 *        to their shelves and its law constants are unchanged, so the five new rungs proved
 *        under their own gates instead of moving the tail L20 is judged by.
 *
 * `STOP_AND_ROUTE` (exit 1) is the only honest answer to a disagreement: the registered bytes
 * are immutable and are never re-authored to fit a later reading.
 *
 * **`refreshed:` R-008 (registration of `l046`–`l050`).** Two rows of this instrument are
 * *statements about the law's shape* rather than about R-004a's own registration, and the law's
 * shape changed: the reported clause set grew from twenty-two to **twenty-eight** when R-008's six
 * clauses (the first written as an act's basis widened *inside* the act) landed. The claimed union
 * gained `ACT_TAIL_R008_CLAUSE_IDS` and the printed ownership lines gained the fifth instrument
 * (`scripts/attest-r008-reg50.ts`). Nothing else moved: every §7.3 tail clause still PASSes, R-004a's
 * own six controls still fail exactly their own clauses, the batch-1 rows still reproduce on the
 * bytes and the L16–L20 block is still un-restamped. This is the same *refresh, not relax* R-007
 * and R-006a performed on their predecessors — a partition row is a reading of the current law and
 * is expected to move when a registration adds a clause; the assertions it guards are not.
 *
 *   npx tsx scripts/attest-r004a-act2.ts
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Level } from "@/core/level";
import { LevelSchema } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, embedMetrics, explore } from "@/core/solver/bfs";
import type { ActScaleLawReading } from "@/core/solver/policy";
import type { GateStatus } from "@/core/solver/policy";
import {
  ACT_II_B1_IDS,
  ACT_II_B1_LADDER,
  ACT_II_B1_OPEN_RELIEF_EXEC,
  ACT_II_B1_OPEN_RELIEF_LEVEL_ID,
  ACT_II_B1_PEAK_ADVANTAGE,
  ACT_II_B1_PEAK_LEVEL_ID,
  ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC,
  ACT_II_B1_REGISTERED_PEAK_EXEC,
  ACT_II_REGISTERED_IDS,
  ACT_II_R005A_REGISTERED_TAIL_EXEC,
  ACT_II_R006A_REGISTERED_TAIL_EXEC,
  ACT_TAIL_R004A_CLAUSE_IDS,
  ACT_TAIL_R005A_CLAUSE_IDS,
  ACT_TAIL_R006A_CLAUSE_IDS,
  ACT_TAIL_R007_CLAUSE_IDS,
  ACT_TAIL_R008_CLAUSE_IDS,

  ACT_I_REGISTERED_PEAK_EXEC,
  ACT_I_REGISTERED_PEAK_LEVEL_ID,
  act2Batch1Gates,
  actScaleTailGuards,
  allOffShortestSolution,
  auditLevel,
  measureActScaleReading,
} from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
/**
 * The commit and directory the five files were **copied from** (the dispatch base's shelf).
 * Overridable, because the origin is data about *this* registration, not a convention: a
 * re-run against a moved shelf must say so out loud.
 */
const ORIGIN = argOf("origin") ?? "551fd43:src/levels/candidates";
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

console.log(`attest-r004a-act2 — Act II batch 1 registration + the §7.3 act-scale tail law`);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(`origin(s):  L21–L25 ${ORIGIN} (the shelf the bytes were copied from)`);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [1/6] byte identity — sha256 + git blob, root vs shelf
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[1/6] byte identity — the registered root files are byte-copies, not edits",
);
for (const id of ACT_II_B1_IDS) {
  const rootPath = join(LEVELS_DIR, fileOf(id));
  const shelfPath = `${ORIGIN_DIR}/${fileOf(id)}`;
  const sha = createHash("sha256")
    .update(readFileSync(rootPath))
    .digest("hex");
  let rootBlob = "";
  let shelfBlob = "";
  let error: string | null = null;
  try {
    rootBlob = execFileSync("git", ["hash-object", rootPath], {
      encoding: "utf8",
    }).trim();
    shelfBlob = execFileSync(
      "git",
      ["rev-parse", `${ORIGIN_SHA}:${shelfPath}`],
      { encoding: "utf8" },
    ).trim();
  } catch (e) {
    error = e instanceof Error ? (e.message.split("\n")[0] ?? String(e)) : String(e);
  }
  check(
    `${fileOf(id)} blob identity`,
    error === null && rootBlob !== "" && rootBlob === shelfBlob,
    error === null
      ? `root ${rootBlob} == ${ORIGIN} ${shelfBlob} (sha256 ${sha.slice(0, 12)}…)`
      : `NOT RUN — git could not answer (${error ?? ""}); a check that did not run is never a pass`,
  );
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [2/6] the registered ladder, re-measured from the ROOT bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[2/6] the registered ladder — re-measured from the ROOT bytes, never read from a note",
);
const measured = ACT_II_B1_IDS.map((id) => {
  const level = readLevel(id);
  const graph: ReachableGraph = explore(level);
  const result = analyse(level, graph);
  const audit = auditLevel(level, graph);
  return {
    id,
    level,
    graph,
    result,
    audit,
    allOff: allOffShortestSolution(level, graph),
    row: ACT_II_B1_LADDER[ACT_II_B1_IDS.indexOf(id)],
  };
});
for (const m of measured) {
  const row = m.row;
  if (row === undefined) {
    divergences.push(`${fileOf(m.id)}: no registered ladder row`);
    continue;
  }
  const gates = m.audit.gates;
  const shared = gates.find(
    (g) => g.id === "shortest-solution-presses-switch-and-crosses-door",
  );
  const routes = /routes=(\d+); press-then-cross-door=(\d+)/.exec(
    shared?.detail ?? "",
  );
  console.log(`  ${fileOf(m.id)} (rung ${String(m.id)})`);
  check(
    `${fileOf(m.id)} par`,
    m.result.shortestSolution === row.par && m.level.par === row.par,
    `solver ${String(m.result.shortestSolution)} · file ${String(m.level.par)} · registered ${String(row.par)}`,
  );
  check(
    `${fileOf(m.id)} D_exec`,
    m.audit.difficulty.Dexec !== null &&
      Math.abs(m.audit.difficulty.Dexec - row.dexec) < 5e-7,
    `measured ${m.audit.difficulty.Dexec?.toFixed(6) ?? "n/a"} · registered ${row.dexec.toFixed(6)}`,
  );
  check(
    `${fileOf(m.id)} B`,
    Math.abs(m.audit.difficulty.B - row.b) < 5e-5,
    `measured ${m.audit.difficulty.B.toFixed(4)} · registered ${row.b.toFixed(4)}`,
  );
  check(
    `${fileOf(m.id)} T ≡ R ≡ 0`,
    m.audit.difficulty.T === 0 && m.audit.difficulty.R === 0,
    `T=${String(m.audit.difficulty.T)} R=${m.audit.difficulty.R.toFixed(6)} ⇒ D_exec = par + 3·B`,
  );
  check(
    `${fileOf(m.id)} coverage`,
    m.result.distinctPositions === row.coverage &&
      m.result.distinctPositions === m.level.width * m.level.height,
    `distinctPositions=${String(m.result.distinctPositions)} of ${String(m.level.width * m.level.height)} · registered ${String(row.coverage)}`,
  );
  check(
    `${fileOf(m.id)} all-OFF world is UNSATISFIABLE (switchRequired measured)`,
    m.allOff === null && m.audit.allOffGoalReachable === false,
    `allOffShortest=${m.allOff === null ? "null" : String(m.allOff)} · allOffGoalReachable=${String(m.audit.allOffGoalReachable)} ` +
      `· subgraph ${String(m.audit.allOffReachableStates)}/${String(m.result.reachableStates)} states`,
  );
  check(
    `${fileOf(m.id)} press-then-cross on every par route`,
    routes !== null && routes[1] === routes[2],
    `parRoutes=${routes?.[1] ?? "n/a"} press-then-cross=${routes?.[2] ?? "n/a"} (shared reader, G2)`,
  );
  check(
    `${fileOf(m.id)} gates all PASS, violations empty`,
    m.audit.violations.length === 0 &&
      gates.every((g) => g.status === "PASS"),
    `${String(gates.filter((g) => g.status === "PASS").length)}/${String(gates.length)} gates PASS · codes [${m.audit.violations.map((v) => v.code).join(" ")}]`,
  );
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [3/6] §7.3 — the act-scale tail law, measured
// ─────────────────────────────────────────────────────────────────────────────

console.log("[3/6] §7.3 act-scale tail law — the act peaks, measured on the root bytes");
const all = shipped();
// **R-005a** — the reading is built by ONE implementation (`@/core/solver/policy`'s
// `measureActScaleReading`), shared with `scripts/attest-r005a-reg35.ts`: two transcripts of
// the same law that measure it two ways is how a stale reading survives a registration.
// R-004a's own change here is the Act I basis (it now excludes every registered Act II id,
// not only batch 1's five) and the act-level maximum (which now spans L21–L40 after R-006a,
// while batch 1's own record stays pinned in `act-tail-act-ii-peak-pin`). The act-level
// reading is the LIVE act (`ACT_II_REGISTERED_IDS`); R-005a's three act-level clauses are the
// ones re-pointed to the frozen era basis (`ACT_II_R005A_ERA_IDS`), and they are controlled
// by `scripts/attest-r005a-reg35.ts`, not here.
const reading: ActScaleLawReading = measureActScaleReading(all.map((s) => s.level));
console.log(
  `  measured: Act I peak ${reading.actI.dexec.toFixed(6)} (L${String(reading.actI.levelId)}) · ` +
    `Act II peak ${reading.actII.dexec.toFixed(6)} (L${String(reading.actII.levelId)}) · ` +
    `batch-1 peak ${reading.actIIBatchPeak.dexec.toFixed(6)} · act-open L${String(reading.actOpen.levelId)} ${reading.actOpen.dexec.toFixed(6)}`,
);
const registered = actScaleTailGuards(reading);
for (const clause of registered) {
  console.log(`  ${clause.status === "PASS" ? "MATCH" : "DIVERGENT"}  ${clause.clause} — ${clause.label}`);
  console.log(`           ${clause.detail}`);
}
check(
  "§7.3 — every registered tail clause holds on the registered bytes",
  registered.every((c) => c.status === "PASS"),
  `${String(registered.filter((c) => c.status === "PASS").length)}/${String(registered.length)} clauses PASS`,
);
// The falsification, stated as a reading rather than as a preference: the registered relief
// is BELOW Act I's peak and passes, so "every act must open above the previous act's peak" is
// refused by measurement. It is §7.3's interior-freedom clause, quoted in the code.
check(
  "§7.3 — the monotone-rise hypothesis is FALSIFIED by the registered relief (interior freedom)",
  reading.actOpen.dexec < ACT_I_REGISTERED_PEAK_EXEC &&
    registered.find((c) => c.clause === "act-tail-l21-open-relief")?.status === "PASS",
  `L${String(reading.actOpen.levelId)} ${reading.actOpen.dexec.toFixed(6)} < Act I peak ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)} ` +
    `(relief ${(reading.actOpen.dexec - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)}) and the clause PASSes: a validator ` +
    `demanding a cross-act rise would have refused a registered rung`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [4/6] anti-tautology controls, one per tail clause
// ─────────────────────────────────────────────────────────────────────────────

console.log("[4/6] anti-tautology controls — one per tail clause, refused BY NAME");
const tailControls: readonly {
  readonly clause: string;
  readonly name: string;
  readonly coupling: string;
  readonly reading: ActScaleLawReading;
}[] = [
  {
    clause: "act-tail-act-i-peak-pin",
    name: "RELABEL: Act I's basis is given the Act II peak rung (L25 at 27.604651) — the constant and the measurement disagree",
    coupling: "named: the advantage clause moves with it, because the two ends are the same relabel",
    reading: { ...reading, actI: { levelId: ACT_II_B1_PEAK_LEVEL_ID, dexec: ACT_II_B1_REGISTERED_PEAK_EXEC } },
  },
  {
    clause: "act-tail-act-ii-peak-pin",
    name: "RESTAMP: the batch peak is re-measured as Act I's value (24.729412 at L25) — the registered record is not reproduced",
    coupling: "named: the peak no longer clears Act I, so act-tail-peak-advantage fires too (a restamp cannot be a small edit)",
    reading: { ...reading, actIIBatchPeak: { levelId: ACT_II_B1_PEAK_LEVEL_ID, dexec: ACT_I_REGISTERED_PEAK_EXEC } },
  },
  {
    clause: "act-tail-peak-advantage",
    name: "COLLAPSED RISE: both acts read 27.604651 — the clause is 'strictly exceeds', so equality is not a pass",
    coupling: "named: the measurement−registration identity fails as well, which is the point of testing both halves",
    reading: { ...reading, actI: { levelId: ACT_II_B1_PEAK_LEVEL_ID, dexec: ACT_II_B1_REGISTERED_PEAK_EXEC } },
  },
  {
    clause: "act-tail-pre-r004a-standard",
    name: "RESTAMPED STANDARD: the pre-R004a standard is overwritten with the post-registration peak (27.604651) — the re-registration would confirm itself",
    coupling: "named: the standard must still equal Act I's registered peak, so this control is two clauses in one line",
    reading: { ...reading, preR004aStandard: ACT_II_B1_REGISTERED_PEAK_EXEC },
  },
  {
    clause: "act-tail-l20-not-restamped",
    name: "GRAFT: the block's tail is moved to rung 25 (ids 16–20 + 25, par 25, D_exec 27.604651) — L20 would stop being the rung the registered tail ceiling judges",
    coupling: "named: the grafted act-II id is named in the detail, so the control cannot pass on a different reason",
    reading: {
      ...reading,
      l20Tail: {
        ids: [16, 17, 18, 19, 20, ACT_II_B1_PEAK_LEVEL_ID],
        tailPar: ACT_II_B1_PEAK_LEVEL_ID,
        tailExec: ACT_II_B1_REGISTERED_PEAK_EXEC,
      },
    },
  },
  {
    clause: "act-tail-l21-open-relief",
    name: "OUT-OF-BAND RELIEF: the act opens at 31.000000 — interior freedom is freedom *inside the band*, never an excuse to drop a rung out of it",
    coupling: "named: the relief clause is the only one that reads the act-open member, so nothing else can carry the refusal",
    reading: { ...reading, actOpen: { levelId: ACT_II_B1_OPEN_RELIEF_LEVEL_ID, dexec: 31.0 } },
  },
];
let tailCaught = 0;
for (const control of tailControls) {
  const clauses = actScaleTailGuards(control.reading);
  const failed = clauses.filter((c) => c.status === "FAIL").map((c) => c.clause);
  const hit = failed.includes(
    control.clause as (typeof clauses)[number]["clause"],
  );
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
  "every R-004a tail clause has exactly one control, and the control set is R-004a's own six",
  tailCaught === tailControls.length &&
    new Set(tailControls.map((c) => c.clause)).size === ACT_TAIL_R004A_CLAUSE_IDS.length &&
    ACT_TAIL_R004A_CLAUSE_IDS.every((id) => tailControls.some((c) => c.clause === id)),
  `${String(tailCaught)}/${String(tailControls.length)} caught · clauses covered ${String(new Set(tailControls.map((c) => c.clause)).size)}/${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} (R-004a's six; R-005a's five are ` +
    `${ACT_TAIL_R005A_CLAUSE_IDS.join(", ")} and are controlled by scripts/attest-r005a-reg35.ts; R-006a's five are ` +
    `${ACT_TAIL_R006A_CLAUSE_IDS.join(", ")} and are controlled by scripts/attest-r006a-reg40.ts; R-007's six are ` +
    `${ACT_TAIL_R007_CLAUSE_IDS.join(", ")} and are controlled by scripts/attest-r007-reg45.ts; R-008's six are ` +
    `${ACT_TAIL_R008_CLAUSE_IDS.join(", ")} and are controlled by scripts/attest-r008-reg50.ts — named here so the split of ownership is a reading, not a convention)`,
);
check(
  "the registered reading is the discrimination side (every reported clause PASSes on it)",
  registered.every((c) => c.status === "PASS"),
  `registered ${String(registered.filter((c) => c.status === "PASS").length)}/${String(registered.length)} PASS · R-004a controls ${String(tailControls.length)} · R-005a (${String(ACT_TAIL_R005A_CLAUSE_IDS.length)}) + R-006a (${String(ACT_TAIL_R006A_CLAUSE_IDS.length)}) + R-007 (${String(ACT_TAIL_R007_CLAUSE_IDS.length)}) + R-008 (${String(ACT_TAIL_R008_CLAUSE_IDS.length)}) clauses reported here but controlled in their own instruments`,
);
// The reported set grew to three registrations at R-006a (R-004a's six, R-005a's five,
// R-006a's five), to **four** at R-007 (R-007's six, the first written across an act
// boundary), and to **five** at R-008 (R-008's six, the first written as an act's basis
// widened *inside* the act). The partition is the invariant that keeps a NEW clause from
// silently riding along with no instrument: the five sets must be pairwise disjoint, must
// cover every reported clause, and must together be exactly the reported count. Sum vs
// distinct catches an overlap; the unclaimed list catches a clause with no home.
// **Refreshed at R-008, not relaxed**: the R-008 list is added to the claimed union, and
// every R-004a assertion above is unchanged.
const claimedClauses = new Set([
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
const unclaimedClauses = registered.filter(
  (c) => !claimedClauses.has(c.clause),
);
check(
  "the five instruments' clause sets PARTITION the reported set (a future clause must be given a home)",
  claimedClauses.size === registered.length &&
    claimedSum === claimedClauses.size &&
    unclaimedClauses.length === 0,
  `reported ${String(registered.length)} · R-004a ${String(ACT_TAIL_R004A_CLAUSE_IDS.length)} + R-005a ${String(ACT_TAIL_R005A_CLAUSE_IDS.length)} + R-006a ${String(ACT_TAIL_R006A_CLAUSE_IDS.length)} + R-007 ${String(ACT_TAIL_R007_CLAUSE_IDS.length)} + R-008 ${String(ACT_TAIL_R008_CLAUSE_IDS.length)} = ` +
    `${String(claimedSum)} claimed · ${String(claimedClauses.size)} distinct · ${String(unclaimedClauses.length)} unclaimed ` +
    `(a clause with no instrument reddens this row)`,
);
// Two-sided non-vacuity, on the clause whose subject is a DIRECTION: the law binds the
// registered value and the band, and nothing else. So (a) an in-band value *above* Act I's
// peak also passes — the clause is not a disguised demand for a dip — and (b) the registered
// value on the wrong rung fails. Both are probes of the same clause, so they are reported
// here rather than smuggled into the one-control-per-clause table above.
const reliefOf = (r: readonly { clause: string; status: GateStatus }[]) =>
  r.find((c) => c.clause === "act-tail-l21-open-relief")?.status;
const riseVariant = actScaleTailGuards({
  ...reading,
  actOpen: { levelId: ACT_II_B1_OPEN_RELIEF_LEVEL_ID, dexec: 25.0 },
  actOpenRelief: 25.0,
});
check(
  "the relief clause is not a disguised dip demand (an in-band rise PASSes too)",
  reliefOf(riseVariant) === "PASS",
  "act-open 25.000000 registered as the relief (in band, ABOVE Act I peak 24.729412) ⇒ act-tail-l21-open-relief PASS — only the named rung's value and the band bind, never the direction",
);
const unnamedRelief = actScaleTailGuards({
  ...reading,
  actOpen: { levelId: 22, dexec: ACT_II_B1_OPEN_RELIEF_EXEC },
});
check(
  "the relief is NAMED, not inferred from the value (the registered relief on the wrong rung FAILs)",
  reliefOf(unnamedRelief) === "FAIL",
  `L22 carrying ${ACT_II_B1_OPEN_RELIEF_EXEC.toFixed(6)} ⇒ act-tail-l21-open-relief FAIL — the clause names the act-open member, so an unnamed rung cannot borrow the relief`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [5/6] per-member gate controls — one per new `gate-act2-*` code
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[5/6] per-member gate controls — one per new gate code, on the registered bytes or the law's table",
);
const gatesOf = (level: Level, rows = ACT_II_B1_LADDER): readonly string[] => {
  const graph: ReachableGraph = explore(level);
  const result = analyse(level, graph);
  return act2Batch1Gates(
    level,
    graph,
    result,
    embedMetrics(level, result.shortestSolution ?? level.par),
    rows,
  )
    .filter((g) => g.status === "FAIL")
    .map((g) => g.id);
};
const l021 = readLevel(21);
const l024 = readLevel(24);
const l016 = readLevel(16);
const sealedRow = Array.from({ length: 7 }, (_, x) => [x, 6] as [number, number]);
const restampedRows = ACT_II_B1_LADDER.map((r) =>
  r.id === 23 ? { ...r, dexec: 30 } : r,
);
const memberControls: readonly {
  readonly mustFire: string;
  readonly name: string;
  readonly coupling: string;
  readonly codes: readonly string[];
}[] = [
  {
    mustFire: "gate-act2-registered-rung",
    name: "-registered-rung: the registered l021 bytes wearing id 22 (par 17 against the registered 18)",
    coupling: "named: the relabel moves the rung expectation, so this is the rung gate's own refusal",
    codes: gatesOf({ ...l021, id: 22 }),
  },
  {
    mustFire: "gate-act2-exec-band",
    name: "-exec-band: the LAW table is restamped (L23's registered D_exec moved to 30) while the bytes stay registered",
    coupling: "named: the band is [19.75, 29.0625] (printed [19.75, 29.06]; §7.9 — derived-exact is the value), so a restamped row leaves the band by three units — the silent-restamp direction this dispatch's guard exists for",
    codes: gatesOf(readLevel(23), restampedRows),
  },
  {
    mustFire: "gate-act2-b-band",
    name: "-b-band: the goal-gated seal's l016 board (B = 1.7000, F-L16-2's NAMED excursion) wearing an Act II id, where no excursion is registered",
    coupling: "named: the rung gate fires too (par 12 ≠ 23), and the excursion register is act-scoped on purpose",
    codes: gatesOf({ ...l016, id: 23 }),
  },
  {
    mustFire: "gate-act2-exec-identity",
    name: "-exec-identity: the R-003c B10 construction on l021 (a phase-B portal landing in an A-walled pocket ⇒ T > 0), so D_exec = par + 3·B stops holding",
    coupling: "named: T > 0 also lifts D_exec, which is why the identity is checked as an identity and not as a bound",
    codes: gatesOf({
      ...l021,
      portals: [
        ...l021.portals,
        { id: "p2", pair: [[0, 5], [1, 0]] as const, activePhase: "B" as const },
      ],
      phaseAWalls: [...l021.phaseAWalls, [1, 5], [0, 4]] as [number, number][],
    }),
  },
  {
    mustFire: "gate-act2-coverage",
    name: "-coverage: the registered l021 bytes on 7 × 7 with the added row sealed in both phases (42 of 49 positions reachable)",
    coupling: "named: the grid is part of the registered lattice key, so the row check fires in the same breath",
    codes: gatesOf({
      ...l021,
      height: 7,
      phaseAWalls: [...l021.phaseAWalls, ...sealedRow],
      phaseBWalls: [...l021.phaseBWalls, ...sealedRow],
    }),
  },
  {
    mustFire: "gate-act2-act-peak",
    name: "-act-peak: the interior member l024 (par 21 / D_exec 25.604651) wearing the batch's peak id 25",
    coupling: "named: an interior rung in the peak's slot cannot claim the registered peak — the clause is an equality AND a strict rise",
    codes: gatesOf({ ...l024, id: 25 }),
  },
  {
    mustFire: "gate-shortest-solution-presses-switch-and-crosses-door",
    name: "-latch-route (shared reader): l021 with the pocket switch's targets emptied, so no par route presses-then-crosses",
    coupling: "named: the switch-without-targets policy fires at the same layer, and the shared G2 reader must not be re-implemented for Act II",
    codes: gatesOf({
      ...l021,
      switches: l021.switches.map((s, i) => (i === 0 ? { ...s, targets: [] } : s)),
    }),
  },
];
let memberCaught = 0;
for (const control of memberControls) {
  // `mustFire` is written as the POLICY CODE (`gate-…`), because that is the name a dossier
  // quotes; the gate function reports bare ids, so the prefix is the only difference.
  const hit = control.codes.includes(control.mustFire.replace(/^gate-/, ""));
  if (hit) memberCaught += 1;
  console.log(`  ${hit ? "CAUGHT" : "MISSED"}  ${control.mustFire}`);
  console.log(`          mutation: ${control.name}`);
  console.log(`          coupling: ${control.coupling}`);
  console.log(`          measured: FAIL gates [${control.codes.join(" ")}]`);
  if (!hit)
    divergences.push(
      `member control for ${control.mustFire} was MISSED (measured FAIL gates [${control.codes.join(" ")}])`,
    );
}
check(
  "one control per new member gate, plus the shared reader, all caught",
  memberCaught === memberControls.length,
  `${String(memberCaught)}/${String(memberControls.length)} caught`,
);
check(
  "discrimination: the registered bytes fire no act2 gate",
  ACT_II_B1_IDS.every((id) => gatesOf(readLevel(id)).length === 0),
  `FAIL gates on the registered set: ${ACT_II_B1_IDS.map((id) => `${String(id)}:[${gatesOf(readLevel(id)).join(" ")}]`).join(" ")}`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// [6/6] the L16–L20 block is NOT re-stamped
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[6/6] the L16–L20 block law is untouched — L20 keeps the tail it was registered with",
);
const l20 = readLevel(ACT_I_REGISTERED_PEAK_LEVEL_ID);
check(
  "L20 is still the registered tail rung, at its registered par/D_exec",
  l20.par === ACT_I_REGISTERED_PEAK_LEVEL_ID &&
    Math.abs((auditLevel(l20).difficulty.Dexec ?? Number.NaN) - ACT_I_REGISTERED_PEAK_EXEC) < 5e-7,
  `par ${String(l20.par)} · measured D_exec ${auditLevel(l20).difficulty.Dexec?.toFixed(6) ?? "n/a"} · Act I registered peak ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)}`,
);
check(
  "the new rungs are not grafted onto the block law (they prove under their own gates)",
  registered.find((c) => c.clause === "act-tail-l20-not-restamped")?.status === "PASS",
  `act-tail-l20-not-restamped PASS on the live constants; registered Act II ids [${ACT_II_REGISTERED_IDS.join(", ")}] ∉ BLOCK_L1619_IDS (L16–L20)`,
);
check(
  "the pre-R004a standard is the tail as it stood before this ticket",
  ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC === ACT_I_REGISTERED_PEAK_EXEC &&
    reading.actIIBatchPeak.dexec > ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC &&
    Math.abs(
      reading.actIIBatchPeak.dexec - reading.actI.dexec - ACT_II_B1_PEAK_ADVANTAGE,
    ) < 5e-7,
  `standard ${ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC.toFixed(6)} = Act I peak ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)}; ` +
    `batch peak − Act I peak = ${(reading.actIIBatchPeak.dexec - reading.actI.dexec).toFixed(6)} = pinned ${ACT_II_B1_PEAK_ADVANTAGE.toFixed(6)}`,
);
/**
 * The freezer clause, read from the instrument that owns it. `measureCut()` lives in
 * `scripts/prove-candidate.ts`; re-implementing its filter here would make this section a
 * statement about *this file* instead of about the shipped cut, so the pass is taken as the
 * instrument's own stdout (its `CUT` line and its exit code) over the registered root bytes.
 * A ladder failure, or a cut that moved off 14.969697 / off the L1–L15 basis, fails this row.
 *
 * **R-005a chore (booked by `docs/project-status.md` item 139, discharged here).** The
 * summary regex used to pin the *pre-F-L31-2* print
 * `LADDER RESULT: PASS (5/5 rung(s) ACCEPT, every control caught on every rung)` — a literal
 * LV-015 replaced with the **measured tally** (`controls named: 65/65 across the 5 rung(s)`,
 * F-L31-2's honest-count fix). The row therefore REPORTED A DIVERGENCE on a ladder that had
 * passed, at base as well as here (`docs/ai-native-pipeline.md` §8.21's instrument-finding
 * note). It now reads the post-fix print — and reads the **counts** out of it rather than
 * only matching its shape, so the relaxed regex cannot hide a rung that stopped passing.
 *
 * ── revert path, and the PRE → POST byte diff ───────────────────────────────
 * The chore is **one reader line + one identity in the row below** — it cannot touch the
 * registration, the cut or the basis. Bytes, base `dfd8f48` → this tree:
 *
 *   -const ladderPass = /^LADDER RESULT: PASS \((\d)\/(\d) rung\(s\) ACCEPT, every control caught on every rung\)$/m.exec(ladderOut);
 *   +const ladderPass = /^LADDER RESULT: PASS \((\d+)\/(\d+) rung\(s\) ACCEPT, controls named: (\d+)\/(\d+) across the (\d+) rung\(s\)\)$/m.exec(ladderOut);
 *   +const ladderControlsOk =
 *   +  ladderPass !== null && ladderPass[4] === `${String(5 * 13)}` && ladderPass[5] === "5";
 *
 *   -    ladderPass !== null &&
 *   -    ladderPass[1] === ladderPass[2],
 *   +    ladderPass !== null &&
 *   +    ladderPass[1] === ladderPass[2] &&
 *   +    ladderPass[1] === "5" &&
 *   +    ladderControlsOk,
 *
 * `git revert <the R-005a commit that carries this>` re-pins the pre-F-L31-2 print, and the
 * row then reports a DIVERGENCE again on a green ladder — measured, not asserted: it did so at
 * base `dfd8f48` as well as here. To revert by hand: restore the one-line regex and drop
 * `ladderControlsOk` from the row's condition and from its detail string.
 */
let ladderOut = "";
let ladderExit = 0;
try {
  // Resolved through `node` rather than `npx`, so the child's stdout carries the instrument's
  // own lines and nothing from a package runner (a transcript must not depend on npm's mood).
  const tsxCli = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
  ladderOut = execFileSync(
    process.execPath,
    [tsxCli, "scripts/prove-candidate.ts", "--family=g", "--ladder=21,22,23,24,25", "--dir=src/levels"],
    { encoding: "utf8", cwd: fileURLToPath(new URL("../", import.meta.url)), maxBuffer: 64 * 1024 * 1024 },
  );
} catch (e) {
  ladderExit = 1;
  const out = e as { stdout?: string };
  ladderOut = typeof out.stdout === "string" ? out.stdout : "";
}
const cutLine = /^prove-candidate — CUT re-measured.*$/m.exec(ladderOut)?.[0] ?? null;
const cutMatch = cutLine === null ? null : /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(cutLine);
const ladderPass = /^LADDER RESULT: PASS \((\d+)\/(\d+) rung\(s\) ACCEPT, controls named: (\d+)\/(\d+) across the (\d+) rung\(s\)\)$/m.exec(ladderOut);
const ladderControlsOk =
  ladderPass !== null && ladderPass[4] === `${String(5 * 13)}` && ladderPass[5] === "5";
check(
  "the freezer holds: the cut is still L1–L15, and the ladder still proves at the root",
  ladderExit === 0 &&
    cutMatch !== null &&
    Number(cutMatch[1]) === 14.969697 &&
    cutMatch[2] === "10" &&
    cutMatch[3] === String(shipped().length) &&
    cutMatch[4] === "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15" &&
    ladderPass !== null &&
    ladderPass[1] === ladderPass[2] &&
    ladderPass[1] === "5" &&
    ladderControlsOk,
  `scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels on this tree: exit ${String(ladderExit)} · ` +
    `CUT D_exec max = ${cutMatch?.[1] ?? "n/a"} · par(L15) = ${cutMatch?.[2] ?? "n/a"} · ${cutMatch?.[3] ?? "n/a"} shipped files · ` +
    `basis ids [${cutMatch?.[4] ?? "n/a"}] · LADDER ${ladderPass === null ? "n/a" : `${ladderPass[1]}/${ladderPass[2]} ACCEPT, controls named ${ladderPass[3]}/${ladderPass[4]}`} — ` +
    "the L16–L20 block and every registered act batch (Act II + Act III batch 1 at R-007) are excluded from the cut's own filter and prove under their own laws",
);
// Non-vacuity, both halves. A row that cannot fail is not evidence, so the reader and the
// instrument are each probed with an input that MUST move them.
const cutReader = (line: string): string | null => {
  const m = /D_exec max = ([\d.]+) · par\(L15\) = (\d+) · (\d+) shipped files · basis ids \[([\d, ]+)\]/.exec(line);
  return m === null ? null : `${m[1]!}|${m[2]!}|${m[3]!}|${m[4]!}`;
};
const liveCut = cutLine === null ? null : cutReader(cutLine);
const relabeled = cutLine === null ? null : cutReader(cutLine.replace("basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]", "basis ids [16, 17, 18, 19, 20]"));
let emptyShelfExit = 0;
try {
  execFileSync(
    process.execPath,
    [fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url)), "scripts/prove-candidate.ts", "--family=g", "--ladder=21", "--dir=src/levels/candidates"],
    { encoding: "utf8", cwd: fileURLToPath(new URL("../", import.meta.url)), stdio: "pipe" },
  );
} catch {
  emptyShelfExit = 1;
}
console.log(
  `  CONTROL  freezer clause non-vacuity — the reader moves on a relabeled basis (${
    liveCut === null || relabeled === null || liveCut === relabeled ? "NO — VACUOUS" : "yes"
  }) and the instrument refuses an empty ladder dir (exit ${String(emptyShelfExit)}, required ≠ 0)`,
);
check(
  "the freezer clause can fail (both halves probed)",
  liveCut !== null && relabeled !== null && liveCut !== relabeled && emptyShelfExit !== 0,
  liveCut === null || relabeled === null
    ? "the CUT reader could not be parsed, so the clause above would have to be read as unparsed"
    : `live basis ${liveCut.split("|")[3] ?? "n/a"} vs the relabeled basis ${relabeled.split("|")[3] ?? "n/a"} — the reader distinguishes them; ` +
      `a ladder pointed at the now-EMPTY shelf (src/levels/candidates) exits ${String(emptyShelfExit)} — the instrument's exit code is a live input`,
);
console.log("");

// ── verdict ──────────────────────────────────────────────────────────────────

if (divergences.length > 0) {
  console.log(
    `RESULT: STOP_AND_ROUTE — ${String(divergences.length)} divergence(s):`,
  );
  for (const d of divergences) console.log(`  - ${d}`);
  console.log(
    "The registered bytes are the record of a proof: a disagreement means this registration is wrong, NOT",
  );
  console.log(
    "that the board should be re-authored. Route it; do not repair it (ADR-0004).",
  );
  process.exit(1);
}
console.log(
  `RESULT: REGISTERED-MATCH — the five R-004a rungs are byte-identical to the shelf they were copied from (${ORIGIN}), every`,
);
console.log(
  "booked number (par / D_exec / B / T / R / coverage / all-OFF / press-then-cross) is reproduced by the program solver",
);
console.log(
  `on the registered bytes, the registered ladder is ${ACT_II_B1_LADDER.map((r) => String(r.par)).join(" / ")} rising strictly on the execution axis,`,
);
console.log(
  `§7.3's act-peak clause reads the act's measured maximum (${ACT_II_R006A_REGISTERED_TAIL_EXEC.toFixed(6)} > Act I's ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)}, read over ${String(ACT_II_REGISTERED_IDS[0])}–${String(ACT_II_REGISTERED_IDS[ACT_II_REGISTERED_IDS.length - 1] ?? 0)} after R-006a; the value R-005a carried, ${ACT_II_R005A_REGISTERED_TAIL_EXEC.toFixed(6)}, is the frozen era basis its own three clauses read) under all ${String(registered.length)}`,
);
console.log(
  `tail clauses (R-004a's six controlled HERE, R-005a's five by scripts/attest-r005a-reg35.ts, R-006a's five by scripts/attest-r006a-reg40.ts, R-007's six by scripts/attest-r007-reg45.ts), and ${String(memberControls.length)}/${String(memberControls.length)} member controls are refused by name with the L16–L20 block un-restamped.`,
);