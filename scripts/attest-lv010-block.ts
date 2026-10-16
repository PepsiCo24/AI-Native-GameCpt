/**
 * `scripts/attest-lv010-block.ts` — **R-003c**: the L16–L19 **registration**
 * re-attestation (the LV-009-B / LV-010-STEP-0 pattern, pointed at a block that has
 * just been moved into the shipped root instead of at one about to be authored).
 *
 * Why it exists. The four rungs were proven *on the candidate bytes* by
 * `scripts/prove-candidate.ts` (nine gates + a six-control mutation battery each,
 * `docs/ai-native-pipeline.md` §8.12) — but "proven as a candidate" and "registered"
 * are two different claims, and the dispatch that registers them must not be able to
 * re-type a number. So this script
 *
 *   1. proves the **bytes did not move**: each root file's git blob hash equals the
 *      blob hash of the candidate it came from at the commit the dispatch names
 *      (`3cc6df2:src/levels/candidates/lNNN.json`). A byte-copy is not an edit, and
 *      this is the check that says so — if git cannot answer, the check FAILS
 *      (a control that did not run is never a pass);
 *   2. proves the **law's basis** is unchanged on the registered set: `par(L15)`, the
 *      frozen cut (`max D_exec` over L1–L15) and the `B` band are re-derived from the
 *      live L1–L15 files and compared against the constants `@/core/solver/policy`
 *      imports into `blockL1619Gates` (nothing is transcribed here);
 *   3. re-measures every **booked** number of the four rungs (par, `D_exec`, `B`,
 *      par routes, refusals, coverage, the all-OFF world, `T`/`R`/dead states) from
 *      the **root bytes** with the shipped readers, and compares against
 *      {@link BOOKED} — the dispatch's booked evidence, typed once, *to be falsified*;
 *   4. runs the block's own gates (`auditLevel` → `blockL1619Gates`) and requires
 *      every one of them to PASS, printing each gate's measured detail;
 *   5. runs the **ladder** properties the per-board gates cannot see: the rungs are
 *      exactly `par(L15) + 2·(id − 15)`, `D_exec` rises strictly rung to rung, and the
 *      last member sits exactly on the terminal ceiling;
 *   6. runs **one negative control per new gate** (`BlockL1619GateId`, six of them):
 *      a mutated board that must be REFUSED by that gate by name, with the full
 *      refusing set printed so a control caught for the wrong reason is visible.
 *      `tests/**` is not this dispatch's lane, so this table — not a vitest table — is
 *      the one-control-per-gate evidence for R-003c; QA's pin-migration ticket moves
 *      it into `tests/solver/policy-negative-controls.test.ts`'s
 *      `Record<PolicyViolationCode, …>`, which is deliberately left RED.
 *
 * Everything is measured on the **shipped root set** (`src/levels/*.json`) — the
 * post-registration state, not a scratch copy: the question here is "did registering
 * change anything", so reading the registered files is the point. (The pre-move
 * isolation attestation is `scripts/attest-lv010-cut.ts`, transcript committed.)
 *
 *   npx tsx scripts/attest-lv010-block.ts
 *   npx tsx scripts/attest-lv010-block.ts --origin=<sha>:src/levels/candidates   # override the byte-identity source
 *
 * Exit code is non-zero on any divergence: bytes, booked numbers, gates, ladder or
 * controls. `STOP_AND_ROUTE` is the only honest answer to a disagreement, because the
 * candidate bytes are immutable and are never re-authored to fit a later reading.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Level } from "@/core/level";
import { LevelSchema } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import type { PolicyViolationCode } from "@/core/solver/policy";
import {
  BLOCK_L1619_B_BAND,
  BLOCK_L1619_CUT_FLOOR,
  BLOCK_L1619_IDS,
  BLOCK_L1619_PAR_BASE,
  BLOCK_L1619_PAR_EXPECTATION,
  BLOCK_L1619_PAR_STEP,
  BLOCK_L1619_TAIL_EXEC_CEILING,
  allOffShortestSolution,
  auditLevel,
} from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// Inputs
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};

/** Where the registered bytes came from: `<sha>:<dir>` (the candidate shelf at that commit). */
const origin = argOf("origin") ?? "3cc6df2:src/levels/candidates";
const originSha = origin.split(":")[0] ?? origin;
const originDir = origin.split(":").slice(1).join(":");

const fileOf = (id: number): string => `l${String(id).padStart(3, "0")}.json`;
const pathOf = (id: number): string => join(LEVELS_DIR, fileOf(id));

const readLevel = (id: number): Level =>
  LevelSchema.parse(JSON.parse(readFileSync(pathOf(id), "utf8"))) as Level;

const shipped = (): readonly { id: number; level: Level }[] =>
  readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((n) => ({
      id: Number(n.slice(1, -5)),
      level: readLevel(Number(n.slice(1, -5))),
    }));

/**
 * The **booked** evidence of the four rungs, typed once so the program can falsify it.
 *
 * Source: the LV-010 / LV-010f records (`docs/ai-native-pipeline.md` §8.12) repeated by
 * the R-003c dispatch — par / `D_exec` pairs `12/17.100000`, `14/19.027027`,
 * `16/20.907923`, `18/22.885157`. NOTHING here is read from a candidate file's notes:
 * every field is compared against a fresh measurement, and a single disagreement is a
 * `STOP_AND_ROUTE` (the bytes are immutable — a mismatch means the registration, not
 * the board, is wrong).
 */
const BOOKED: Readonly<
  Record<
    number,
    {
      readonly par: number;
      readonly dexec: number;
      readonly b: number;
      readonly parRoutes: number;
      readonly refusals: number;
      readonly coverage: number;
    }
  >
> = {
  16: {
    par: 12,
    dexec: 17.1,
    b: 1.7,
    parRoutes: 20,
    refusals: 8,
    coverage: 42,
  },
  17: {
    par: 14,
    dexec: 19.027027,
    b: 1.6757,
    parRoutes: 60,
    refusals: 8,
    coverage: 42,
  },
  18: {
    par: 16,
    dexec: 20.907923,
    b: 1.636,
    parRoutes: 189,
    refusals: 9,
    coverage: 42,
  },
  19: {
    par: 18,
    dexec: 22.885157,
    b: 1.6284,
    parRoutes: 231,
    refusals: 10,
    coverage: 42,
  },
};

/** The precision the law's constants are published at (6 dp) — see `blockL1619Gates`. */
const LAW_PRECISION = 5e-7;

const divergences: string[] = [];
function check(label: string, ok: boolean, detail: string): void {
  console.log(`  ${ok ? "MATCH     " : "DIVERGENCE"} ${label} — ${detail}`);
  if (!ok) divergences.push(`${label}: ${detail}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. the bytes did not move — git blob identity against the candidate origin
// ─────────────────────────────────────────────────────────────────────────────

console.log(`attest-lv010-block — R-003c registration re-attestation`);
console.log(`levels dir: ${LEVELS_DIR}`);
console.log(
  `origin:     ${originSha}:${originDir} (the shelf the bytes were copied from)`,
);
console.log("");

console.log(
  "[1/6] byte identity — the registered root files are byte-copies, not edits",
);
for (const id of BLOCK_L1619_IDS) {
  const rootPath = pathOf(id);
  const candidatePath = `${originDir}/${fileOf(id)}`;
  let rootBlob = "";
  let originBlob = "";
  let error: string | null = null;
  try {
    rootBlob = execFileSync("git", ["hash-object", rootPath], {
      encoding: "utf8",
    }).trim();
    originBlob = execFileSync(
      "git",
      ["rev-parse", `${originSha}:${candidatePath}`],
      {
        encoding: "utf8",
      },
    ).trim();
  } catch (e) {
    error =
      e instanceof Error ? (e.message.split("\n")[0] ?? String(e)) : String(e);
  }
  check(
    `${fileOf(id)} blob identity`,
    error === null && rootBlob !== "" && rootBlob === originBlob,
    error === null
      ? `root ${rootBlob} == ${originSha}:${candidatePath} ${originBlob}`
      : `NOT RUN — git could not answer (${error ?? ""}); a check that did not run is never a pass`,
  );
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 2. the law's basis, re-derived from the live L1–L15 files
// ─────────────────────────────────────────────────────────────────────────────

const basis = shipped().filter((s) => !BLOCK_L1619_IDS.includes(s.id));
const basisMetrics = basis.map((s) => ({
  id: s.id,
  diff: analyseDifficulty(s.level, explore(s.level)),
}));
const measuredCut = Math.max(
  ...basisMetrics.map((m) => m.diff.Dexec ?? Number.NEGATIVE_INFINITY),
);
const measuredL15Par = basis.find((s) => s.id === 15)?.level.par ?? 0;
const measuredBand: readonly [number, number] = [
  Math.min(...basisMetrics.map((m) => m.diff.B)),
  Math.max(...basisMetrics.map((m) => m.diff.B)),
];

console.log(
  `[2/6] the law's basis — re-derived from the ${String(basis.length)} L1–L15 files`,
);
check(
  "par(L15) = BLOCK_L1619_PAR_BASE",
  measuredL15Par === BLOCK_L1619_PAR_BASE,
  `measured ${String(measuredL15Par)} · constant ${String(BLOCK_L1619_PAR_BASE)}`,
);
check(
  "cut = BLOCK_L1619_CUT_FLOOR",
  Math.abs(measuredCut - BLOCK_L1619_CUT_FLOOR) < LAW_PRECISION,
  `measured ${measuredCut.toFixed(6)} · constant ${BLOCK_L1619_CUT_FLOOR.toFixed(6)}`,
);
check(
  "B band = BLOCK_L1619_B_BAND",
  Math.abs(measuredBand[0] - BLOCK_L1619_B_BAND[0]) < LAW_PRECISION &&
    Math.abs(measuredBand[1] - BLOCK_L1619_B_BAND[1]) < LAW_PRECISION,
  `measured [${measuredBand[0].toFixed(4)}, ${measuredBand[1].toFixed(4)}] · constant ` +
    `[${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}]`,
);
check(
  "the registered set is the 15-level basis + the 4 rungs",
  shipped().length === 19 && basis.length === 15,
  `root ${String(shipped().length)} files = ${String(basis.length)} basis + ${String(BLOCK_L1619_IDS.length)} rungs`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 3. the booked numbers, re-measured from the registered bytes
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[3/6] booked numbers — re-measured from the ROOT bytes, never read from a note",
);
const measured = BLOCK_L1619_IDS.map((id) => {
  const level = readLevel(id);
  const graph: ReachableGraph = explore(level);
  const result = analyse(level, graph);
  const diff = analyseDifficulty(level, graph);
  const audit = auditLevel(level, graph);
  const allOff = allOffShortestSolution(level, graph);
  return { id, level, graph, result, diff, audit, allOff };
});

for (const m of measured) {
  const booked = BOOKED[m.id];
  if (booked === undefined) {
    divergences.push(`${fileOf(m.id)}: no booked row`);
    continue;
  }
  const dexec = m.diff.Dexec;
  const rows: readonly (readonly [string, boolean, string])[] = [
    [
      "par",
      m.result.shortestSolution === booked.par && m.level.par === booked.par,
      `solver ${String(m.result.shortestSolution)} · file ${String(m.level.par)} · booked ${String(booked.par)}`,
    ],
    [
      "D_exec",
      dexec !== null && Math.abs(dexec - booked.dexec) < LAW_PRECISION,
      `${dexec === null ? "n/a" : dexec.toFixed(6)} · booked ${booked.dexec.toFixed(6)}`,
    ],
    [
      "B",
      Math.abs(m.diff.B - booked.b) < 5e-5,
      `${m.diff.B.toFixed(4)} · booked ${booked.b.toFixed(4)}`,
    ],
    [
      "par routes",
      m.audit.embeds.parRoutes === booked.parRoutes,
      `${String(m.audit.embeds.parRoutes)} · booked ${String(booked.parRoutes)}`,
    ],
    [
      "ordered refusals",
      m.result.refusedBeforeEnteredTiles === booked.refusals,
      `${String(m.result.refusedBeforeEnteredTiles)} · booked ${String(booked.refusals)}`,
    ],
    [
      "coverage",
      m.result.distinctPositions === booked.coverage &&
        m.result.distinctPositions === m.level.width * m.level.height,
      `${String(m.result.distinctPositions)}/${String(m.level.width * m.level.height)} · booked ${String(booked.coverage)}`,
    ],
    [
      "all-OFF world",
      m.allOff === null && m.audit.allOffGoalReachable === false,
      `allOffShortest ${m.allOff === null ? "null (UNSATISFIABLE)" : String(m.allOff)} · ` +
        `allOffGoalReachable ${String(m.audit.allOffGoalReachable)}`,
    ],
    [
      "region",
      m.result.deadStates === 0 &&
        m.result.noUnrecoverableOk &&
        m.diff.T === 0 &&
        m.diff.R === 0,
      `deadStates ${String(m.result.deadStates)} · noUnrecoverableOk ${String(m.result.noUnrecoverableOk)} · ` +
        `T ${String(m.diff.T)} · R ${m.diff.R.toFixed(6)}`,
    ],
    [
      "D_exec identity",
      dexec !== null &&
        Math.abs(dexec - ((m.result.shortestSolution ?? 0) + 3 * m.diff.B)) <
          1e-9,
      `D_exec − (par + 3·B) = ${dexec === null ? "n/a" : (dexec - ((m.result.shortestSolution ?? 0) + 3 * m.diff.B)).toExponential(2)}`,
    ],
  ];
  console.log(`  ${fileOf(m.id)} (rung ${String(m.id)})`);
  for (const [label, ok, detail] of rows) {
    check(`  ${fileOf(m.id)} ${label}`, ok, detail);
  }
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 4. the block's own gates, per rung
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "[4/6] block law gates — `blockL1619Gates`, read through `auditLevel`",
);
const expectedNewGates = [
  "block-l1619-rung",
  "block-l1619-grid-coverage",
  "block-l1619-device-existence",
  "block-l1619-escalation-cut",
  "block-l1619-b-band",
] as const;
for (const m of measured) {
  const failed = m.audit.gates.filter((g) => g.status !== "PASS");
  const ids = m.audit.gates.map((g) => g.id);
  const mustHave = [
    ...expectedNewGates,
    ...(m.id === BLOCK_L1619_IDS[BLOCK_L1619_IDS.length - 1]
      ? ["block-l1619-tail-ceiling"]
      : []),
  ];
  check(
    `  ${fileOf(m.id)} gates`,
    failed.length === 0 &&
      mustHave.every((id) => ids.includes(id as (typeof ids)[number])),
    `${String(m.audit.gates.length)} gate(s) [${ids.join(" ")}] · FAIL [${failed.map((g) => g.id).join(" ")}] · ` +
      `policyViolations [${m.audit.violations.map((v) => v.code).join(" ")}]`,
  );
  for (const gate of m.audit.gates) {
    console.log(`      ${gate.status.padEnd(4)} ${gate.id} — ${gate.detail}`);
  }
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 5. the ladder — the properties no single board can carry
// ─────────────────────────────────────────────────────────────────────────────

console.log("[5/6] the ladder — exact rungs, strict rise, terminal ceiling");
const expectedRungs = BLOCK_L1619_IDS.map(
  (id) => BLOCK_L1619_PAR_BASE + BLOCK_L1619_PAR_STEP * (id - 15),
);
check(
  "the derived ladder is 12 / 14 / 16 / 18",
  expectedRungs.join(",") === BLOCK_L1619_PAR_EXPECTATION.join(",") &&
    BLOCK_L1619_PAR_EXPECTATION.join(",") === "12,14,16,18",
  `BLOCK_L1619_PAR_EXPECTATION = [${BLOCK_L1619_PAR_EXPECTATION.join(", ")}]`,
);
for (const m of measured) {
  const index = BLOCK_L1619_IDS.indexOf(m.id);
  check(
    `  ${fileOf(m.id)} sits exactly on its rung`,
    m.level.par === BLOCK_L1619_PAR_EXPECTATION[index] &&
      m.result.shortestSolution === m.level.par,
    `par ${String(m.level.par)} · rung ${String(BLOCK_L1619_PAR_EXPECTATION[index])}`,
  );
}
for (let i = 1; i < measured.length; i += 1) {
  const prev = measured[i - 1];
  const cur = measured[i];
  if (prev === undefined || cur === undefined) continue;
  const prevD = prev.diff.Dexec ?? Number.NEGATIVE_INFINITY;
  const curD = cur.diff.Dexec ?? Number.NEGATIVE_INFINITY;
  check(
    `  rung rise ${String(prev.id)} → ${String(cur.id)}`,
    curD > prevD,
    `D_exec ${prevD.toFixed(6)} → ${curD.toFixed(6)} (+${(curD - prevD).toFixed(6)})`,
  );
}
for (const m of measured) {
  check(
    `  ${fileOf(m.id)} clears the frozen cut`,
    (m.diff.Dexec ?? Number.NEGATIVE_INFINITY) > BLOCK_L1619_CUT_FLOOR,
    `D_exec ${(m.diff.Dexec ?? 0).toFixed(6)} > ${BLOCK_L1619_CUT_FLOOR.toFixed(6)}`,
  );
}
const last = measured[measured.length - 1];
check(
  "the last member sits on the terminal ceiling",
  last !== undefined &&
    last.diff.Dexec !== null &&
    Math.abs(last.diff.Dexec - BLOCK_L1619_TAIL_EXEC_CEILING) < LAW_PRECISION,
  `D_exec ${last?.diff.Dexec === null || last === undefined ? "n/a" : last.diff.Dexec.toFixed(6)} · ` +
    `ceiling ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)}`,
);
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// 6. one negative control per new gate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The controls. Each entry is a **mutation of a registered board** (never shipped
 * content — `auditLevel` is called on an in-memory `Level`, ADR-0004: reject, never
 * repair) and names the gate that must refuse it.
 *
 * Three of the six are deliberately **coupled** — the mutated board is refused by more
 * than one gate — and the coupling is named rather than hidden, exactly as LV-009-B's
 * B5/B6 controls do it: the honest counter-example for "this rung is the registered
 * one" is a *different member wearing its id*, and such a board necessarily fails the
 * rung gate too. What the battery proves is the thing that matters: the mutation is
 * REFUSED **by the named gate**, so a gate that stopped firing cannot pass unnoticed.
 * The full refusing set is printed beside every row.
 */
const l016 = readLevel(16);
const l018 = readLevel(18);

interface Control {
  readonly name: string;
  readonly mustFire:
    (typeof expectedNewGates)[number] | "block-l1619-tail-ceiling";
  readonly coupling: string;
  readonly board: Level;
}

const controls: readonly Control[] = [
  {
    name: "rung gate: l016's board with par re-stamped 12 → 14 (the file's claim disagrees with the ladder)",
    mustFire: "block-l1619-rung",
    coupling: "surgical: nothing else moves",
    board: { ...l016, par: 14 },
  },
  {
    name: "grid-coverage gate: l016 with the tile (1,5) sealed in BOTH phases — it leaves the reachable graph, so 41 of the device's 42 tiles are visited",
    mustFire: "block-l1619-grid-coverage",
    coupling:
      "surgical in the measured sense: `block-l1619-grid-coverage` is the ONLY gate that fails and the only policy code emitted, par stays 12 and the board stays rule-legal (`validateLevel` ok=true). The sealed tile is a parity-dead wall in phase A and a second, permanent wall in phase B — legal geometry (ADR-0009), which is exactly why a coverage reader has to exist",
    board: {
      ...l016,
      phaseAWalls: [...l016.phaseAWalls, [1, 5] as const],
      phaseBWalls: [...l016.phaseBWalls, [1, 5] as const],
    },
  },
  {
    name: "device-existence gate: l016 with the d1/s1 pair dropped — the seal loses one of its doors, so the goal IS reachable with every switch OFF (allOffShortest = 14)",
    mustFire: "block-l1619-device-existence",
    coupling:
      "named: the board also stops needing the latch, so `lesson-switch-required` fires at the lesson layer and gate (ii) fails at the route layer — three readers of one fact, and the control names all of them",
    board: {
      ...l016,
      doors: l016.doors.filter((d) => d.id !== "d1"),
      switches: l016.switches.filter((s) => s.id !== "s1"),
    },
  },
  {
    name: "escalation-cut gate: the shipped l015 board wearing id 16 — its D_exec is the cut itself (14.969697), which does not clear it",
    mustFire: "block-l1619-escalation-cut",
    coupling:
      "named: l015's par 10 is also not the L16 rung, so the rung gate fires too (the LV-009-B B6 precedent — the honest counter-example is a different member wearing this id)",
    board: { ...readLevel(15), id: 16 },
  },
  {
    name: "B-band gate: l016 relabelled as rung 17 — its B = 1.7000 is out of band and only rung 16 is a named excursion",
    mustFire: "block-l1619-b-band",
    coupling:
      "named: the relabel also moves the rung expectation (12 ≠ 14), so the rung gate fires too",
    board: { ...l016, id: 17 },
  },
  {
    name: "tail-ceiling gate: the shipped l018 board wearing id 19 — the last member's slot carrying an interior member's board (par 16 / D_exec 20.907923)",
    mustFire: "block-l1619-tail-ceiling",
    coupling:
      "named: the relabel also moves the rung expectation, so the rung gate fires too (the same B6-family construction as above)",
    board: { ...l018, id: 19 },
  },
];

console.log("[6/6] negative controls — one per new gate, refused BY NAME");
let caught = 0;
for (const control of controls) {
  const audit = auditLevel(control.board);
  const failedGates = audit.gates
    .filter((g) => g.status === "FAIL")
    .map((g) => g.id);
  const codes: readonly PolicyViolationCode[] = audit.violations.map(
    (v) => v.code,
  );
  const hit = failedGates.includes(control.mustFire);
  if (hit) caught += 1;
  console.log(`  ${hit ? "CAUGHT" : "MISSED"}  ${control.mustFire}`);
  console.log(`          mutation: ${control.name}`);
  console.log(`          coupling: ${control.coupling}`);
  console.log(
    `          measured: FAIL gates [${failedGates.join(" ")}] · codes [${codes.join(" ")}] · ` +
      `solvable=${String(audit.result.solvable)} · par=${String(audit.result.shortestSolution)}`,
  );
  if (!hit) {
    divergences.push(
      `control for ${control.mustFire} was MISSED (measured FAIL gates [${failedGates.join(" ")}])`,
    );
  }
}
const unguarded = expectedNewGates.filter(
  (id) => !controls.some((c) => c.mustFire === id),
);
check(
  "every new gate has exactly one control",
  caught === controls.length && unguarded.length === 0,
  `${String(caught)}/${String(controls.length)} caught · uncovered [${unguarded.join(" ")}]`,
);
console.log("");

// ── verdict ──────────────────────────────────────────────────────────────────

if (divergences.length > 0) {
  console.log(
    `RESULT: STOP_AND_ROUTE — ${String(divergences.length)} divergence(s):`,
  );
  for (const d of divergences) console.log(`  - ${d}`);
  console.log(
    "The booked numbers are the record of a measurement on immutable bytes: a disagreement means this",
  );
  console.log(
    "registration is wrong, NOT that the board should be re-authored. Route it; do not repair it.",
  );
  process.exit(1);
}
console.log(
  `RESULT: REGISTERED-MATCH — the four rungs are byte-identical to ${originSha}:${originDir}, every booked`,
);
console.log(
  "number (par / D_exec / B / routes / refusals / coverage / all-OFF / region) is reproduced by the program",
);
console.log(
  `solver on the registered bytes, the ladder is 12 / 14 / 16 / 18 rising strictly to the ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)} ceiling,`,
);
console.log(
  `and ${String(controls.length)}/${String(controls.length)} gate controls are refused by name.`,
);
