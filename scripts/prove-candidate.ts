/**
 * `scripts/prove-candidate.ts` — the **proving side** for a single candidate board.
 *
 * `docs/ai-native-pipeline.md` §1: an LLM (or a seeded generator) *proposes*; the
 * program *proves*. This file is the proving half, and it is deliberately separate
 * from the generator so a proposal can be proved **without trusting the script that
 * produced it**: the board is read from disk, and every number below comes from
 * `@/core/solver/*` / `@/core/rules` — the same readers the shipped levels are
 * judged by. Nothing is quoted from the authoring script, and nothing here can
 * write a level.
 *
 * Usage:
 *
 *   npx tsx scripts/prove-candidate.ts [candidate.json] [--rung=16]
 *
 * What it proves, in order:
 *
 *   0. the CUT (`max D_exec` over `src/levels/*.json`) and `par(L15)` are
 *      re-measured from the shipped dataset — the rung's obligation is never typed;
 *   1. `par` is **stamped by the solver** (`analyse(...).shortestSolution`), not
 *      read from the file's claim: a mismatch is a REJECT, not a softer target;
 *   2. the ten rung gates (region / escalation / par-step / latch-grade /
 *      latch-route / refused-beat / coverage / validator / well-formed), each
 *      printing the number it read;
 *   3. **negative controls on the landed bytes** — surgical mutations of that same
 *      file that must each be REJECTED by a NAMED gate, so a battery that accepts
 *      everything cannot pass unnoticed (`a19a347`'s pattern, LV-009-B step 3 shape).
 *
 * Exit code is non-zero on any REJECT, on a par mismatch, or on a surviving control.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, Level } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import { allOffShortestSolution, auditLevel, firingSwitches } from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
const CANDIDATE = process.argv[2] ?? fileURLToPath(new URL("../src/levels/candidates/l016.json", import.meta.url));
const RUNG = Number(argOf("rung") ?? "16");

interface Gate {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}
interface Verdict {
  readonly accepted: boolean;
  readonly reason: string;
  readonly par: number | null;
  readonly dexec: number | null;
  readonly b: number | null;
  readonly gates: readonly Gate[];
}

/** The shipped dataset, judged by the same readers this file uses. */
function shipped(): { file: string; level: Level }[] {
  return readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((file) => ({
      file,
      level: LevelSchema.parse(JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8"))) as Level,
    }));
}

function measureCut(): { floor: number; l15Par: number; n: number } {
  let floor = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let n = 0;
  for (const { level } of shipped()) {
    n += 1;
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, l15Par, n };
}

/** The rung gates. `floor`/`l15Par` arrive measured; the board arrives from disk. */
function judge(level: Level, floor: number, l15Par: number): Verdict {
  const shape = validateLevel(level);
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { accepted: false, reason: "explosion", par: null, dexec: null, b: null, gates: [] };
  }
  const result = analyse(level, graph);
  if (!result.solvable || result.shortestSolution === null)
    return { accepted: false, reason: "unsolvable", par: null, dexec: null, b: null, gates: [] };

  // 1. `par` is the solver's, never the file's.
  const stamped = result.shortestSolution;
  const parMatchesFile = level.par === stamped;
  const proven: Level = { ...level, par: stamped };
  const diff = analyseDifficulty(proven, graph);
  const audit = auditLevel(proven, graph);
  const allOff = allOffShortestSolution(proven, graph);
  const advantage = allOff === null ? null : allOff - stamped;
  const fired = firingSwitches(proven, graph);

  const doorByTile = new Map<string, string>();
  for (const door of proven.doors)
    for (const tile of door.tiles) doorByTile.set(coordKey(tile), door.id);
  const targetsBySwitch = new Map<string, readonly string[]>();
  for (const sw of proven.switches) targetsBySwitch.set(sw.id, sw.targets);

  let routes = 0;
  let pressThenCross = 0;
  forEachParRoute(proven, stamped, (route) => {
    routes += 1;
    let crossed = false;
    for (let i = 0; i < route.length && !crossed; i += 1) {
      const arrival = route[i];
      if (arrival === undefined || arrival.toggledOn.length === 0) continue;
      for (const id of arrival.toggledOn) {
        const targets = targetsBySwitch.get(id) ?? [];
        for (let j = i + 1; j < route.length; j += 1) {
          const later = route[j];
          if (later === undefined) continue;
          const at = coordKey([later.state.player.x, later.state.player.y] as Coord);
          const doorId = doorByTile.get(at);
          if (doorId !== undefined && targets.includes(doorId)) crossed = true;
        }
      }
    }
    if (crossed) pressThenCross += 1;
  });

  const oneSwitchPerDoor = proven.doors.every(
    (d) => proven.switches.filter((s) => s.targets.includes(d.id)).length === 1,
  );
  const gates: readonly Gate[] = [
    {
      id: "par-stamped",
      ok: parMatchesFile,
      detail: `file par=${String(level.par)} · solver par=${String(stamped)} (par is stamped, §8)`,
    },
    {
      id: "region",
      ok: result.deadStates === 0 && result.noUnrecoverableOk && diff.T === 0 && diff.R === 0,
      detail: `deadStates=${String(result.deadStates)} noUnrecoverableOk=${String(result.noUnrecoverableOk)} T=${String(diff.T)} R=${String(diff.R)}`,
    },
    {
      id: "escalation",
      ok: diff.Dexec !== null && diff.Dexec > floor,
      detail: `D_exec=${diff.Dexec === null ? "n/a" : diff.Dexec.toFixed(6)} > CUT ${floor.toFixed(6)}`,
    },
    {
      id: "par-step",
      ok: stamped >= l15Par + 2 * (proven.id - 15),
      detail: `par=${String(stamped)} ≥ ${String(l15Par + 2 * (proven.id - 15))} (l15Par ${String(l15Par)} + 2·${String(proven.id - 15)}, §6.1.1 P2)`,
    },
    {
      id: "latch-grade",
      ok:
        proven.switches.length > 0 &&
        proven.doors.length > 0 &&
        (allOff === null || (advantage ?? 0) >= 1),
      detail: `allOffShortest=${allOff === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOff)} par=${String(stamped)} advantage=${advantage === null ? "n/a" : String(advantage)}`,
    },
    {
      id: "latch-route",
      ok: routes > 0 && pressThenCross === routes,
      detail: `par routes=${String(routes)}; press-then-cross on ${String(pressThenCross)} (G2)`,
    },
    {
      id: "refused-beat",
      ok: result.refusedBeforeEnteredTiles >= 1,
      detail: `refusedBeforeEnteredTiles=${String(result.refusedBeforeEnteredTiles)} [${result.refusedBeforeEnteredTileList.join(" ")}]`,
    },
    {
      id: "coverage",
      ok: result.distinctPositions === proven.width * proven.height,
      detail: `distinctPositions=${String(result.distinctPositions)}/${String(proven.width * proven.height)}`,
    },
    {
      id: "validator",
      ok: shape.ok && audit.violations.length === 0 && oneSwitchPerDoor && proven.switches.every((s) => fired.has(s.id)),
      detail: `ok=${String(shape.ok)} errors=${String(shape.errors.length)} warnings=${String(shape.warnings.length)} policyViolations=${String(audit.violations.length)}[${audit.violations.map((v) => v.code).join(" ")}] one-switch-per-door=${String(oneSwitchPerDoor)} every-switch-fires=${String(proven.switches.every((s) => fired.has(s.id)))}`,
    },
    {
      id: "well-formed",
      ok: proven.doors.every((d) => d.tiles.length >= 1) && proven.switches.every((s) => s.targets.length >= 1),
      detail: `doors=${String(proven.doors.length)} switches=${String(proven.switches.length)}`,
    },
  ];
  const failed = gates.filter((g) => !g.ok);
  return {
    accepted: failed.length === 0,
    reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
    par: stamped,
    dexec: diff.Dexec,
    b: diff.B,
    gates,
  };
}

// ── run ───────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(`prove-candidate — CUT re-measured from the shipped set: D_exec max = ${cut.floor.toFixed(6)} ` +
  `· par(L15) = ${String(cut.l15Par)} · ${String(cut.n)} shipped files`);
console.log(`candidate ${CANDIDATE} · rung ${String(RUNG)}`);

const raw = JSON.parse(readFileSync(CANDIDATE, "utf8")) as unknown;
const parsed = LevelSchema.safeParse(raw);
if (!parsed.success) {
  console.log("SCHEMA: REJECT — the frozen zod schema refuses the file");
  process.exit(1);
}
const level = parsed.data as Level;
const verdict = judge(level, cut.floor, cut.l15Par);
console.log(
  `\npar=${verdict.par === null ? "n/a" : String(verdict.par)} ` +
    `D_exec=${verdict.dexec === null ? "n/a" : verdict.dexec.toFixed(6)} ` +
    `B=${verdict.b === null ? "n/a" : verdict.b.toFixed(4)} ` +
    `(CUT ${cut.floor.toFixed(6)}, delta ${verdict.dexec === null ? "n/a" : (verdict.dexec - cut.floor).toFixed(6)})`,
);
for (const g of verdict.gates) console.log(`  ${g.ok ? "ok  " : "FAIL"} ${g.id.padEnd(13)} ${g.detail}`);
// Warnings are not gates (AGENTS.md §7: a warning is not a gate) — they are named
// so nothing ships silently carrying one.
for (const w of validateLevel(level).warnings) console.log(`  warn ${w}`);
console.log(`\nGATES: ${verdict.accepted ? "ACCEPT" : `REJECT — ${verdict.reason}`}`);

// ── negative controls on the landed bytes ─────────────────────────────────────

const switches = level.switches;
/**
 * Each control names the gate that **must** fire, and the name is the measured one
 * — not the one a reader might guess. A mutation can be refused by more than one
 * legal clause (a muted switch is also a `switch-without-targets` policy violation
 * *before* it is a weak latch; a portal-free board is UNSOLVABLE before its par can
 * be compared). What the control battery proves is that every mutation is refused
 * **by a named gate**, so a battery that accepts everything cannot pass; the exact
 * firing set is printed beside the verdict and is never collapsed to a boolean.
 */
const controls: readonly { name: string; board: Level; expect: string }[] = [
  { name: "latch removed (switches dropped)", board: { ...level, switches: [] }, expect: "latch-grade" },
  {
    // `switch-without-targets` (policy.ts) must fire: the mirror of M1-alone.
    name: "every switch muted (latch fully decorative)",
    board: { ...level, switches: switches.map((s) => ({ ...s, targets: [] })) },
    expect: "validator",
  },
  {
    name: "goal sealed in both phases",
    board: {
      ...level,
      phaseAWalls: [...level.phaseAWalls, level.goal],
      phaseBWalls: [...level.phaseBWalls, level.goal],
    },
    expect: "unsolvable",
  },
  {
    // With the portal gone the far region is unreachable at all, so existence
    // fails before par can: `unsolvable` is the honest name.
    name: "portal pair dropped (parity frame broken)",
    board: { ...level, portals: [] },
    expect: "unsolvable",
  },
  {
    // Two switches on one door breaks "exactly one switch per door" (§1, L6–L35).
    name: "both switches retargeted to the first door",
    board: { ...level, switches: switches.map((s) => ({ ...s, targets: [switches[0]?.targets[0] ?? "d1"] })) },
    expect: "validator",
  },
  {
    name: "par mis-stamped (file par falls by 1)",
    board: { ...level, par: Math.max(1, level.par - 1) },
    expect: "par-stamped",
  },
];
let caught = 0;
console.log("\nnegative controls on the landed bytes:");
for (const control of controls) {
  const v = judge(control.board, cut.floor, cut.l15Par);
  const hit = !v.accepted && v.reason.includes(control.expect);
  if (hit) caught += 1;
  console.log(`  ${hit ? "CAUGHT" : "MISSED"}  ${control.name} → ${v.reason}`);
}
console.log(`controls: ${String(caught)}/${String(controls.length)} caught by their named gate`);

const ok = verdict.accepted && caught === controls.length;
console.log(`\nRESULT: ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);