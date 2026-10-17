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
 *   0. the CUT (`max D_exec` over `src/levels/*.json`, **excluding the L16–L19
 *      ladder itself** — R-003c: a registered block must not raise the filter it is
 *      judged by) and `par(L15)` are re-measured from the shipped dataset — the
 *      rung's obligation is never typed;
 *   1. `par` is **stamped by the solver** (`analyse(...).shortestSolution`), not
 *      read from the file's claim: a mismatch is a REJECT, not a softer target;
 *   2. the ten rung gates (region / escalation / par-step / latch-grade /
 *      latch-route / refused-beat / coverage / validator / well-formed), each
 *      printing the number it read;
 *   2b. for `--rung=20` and above, the **block-escalation** pair
 *      (`rung-plus-block-escalation`: `D_exec > BLOCK_L1619_PRE_R003D_TAIL_EXEC` with
 *      `B` inside `BLOCK_L1619_B_BAND` — the rung must climb out of the *pre-R-003d*
 *      block, not merely out of the L1–L15 cut) and `par-rung-exact`, plus the five
 *      **sealed-landing** gates `g1`–`g5` of `docs/level-design.md` §6.2.6, measured
 *      on the landed bytes with the pocket **derived from those bytes**
 *      ({@link pocketFromBytes}) — never imported from the authoring script;
 *   3. **negative controls on the landed bytes** — surgical mutations of that same
 *      file that must each be REJECTED by a NAMED gate, so a battery that accepts
 *      everything cannot pass unnoticed (`a19a347`'s pattern, LV-009-B step 3 shape).
 *      For `--rung=20` the battery grows by one control per sealed-landing gate
 *      (`g1`–`g5`), each measured before its `expect` list is written.
 *
 * Exit code is non-zero on any REJECT, on a par mismatch, or on a surviving control.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, DoorDef, Level, PortalDef } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute, goalReachableWithAllSwitchesOff } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import { applyMove, isLegalMove } from "@/core/rules";
import { DIRECTIONS, move } from "@/core/state/move";
import { hashState } from "@/core/state/hash";
import type { SearchState } from "@/core/state/types";
import {
  ACT_II_B1_IDS,
  ACT_II_EXEC_BAND,
  ACT_II_PAR_BAND,
  ACT_I_REGISTERED_PEAK_EXEC,
  BLOCK_L1619_B_BAND,
  BLOCK_L1619_PRE_R003D_TAIL_EXEC,
  BLOCK_L1619_IDS,
  BLOCK_L1619_TAIL_EXEC_CEILING,
  allOffShortestSolution,
  auditLevel,
  firingSwitches,
} from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const CANDIDATES_DIR = fileURLToPath(new URL("../src/levels/candidates/", import.meta.url));
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
const CANDIDATE = process.argv[2] ?? fileURLToPath(new URL("../src/levels/candidates/l016.json", import.meta.url));
const RUNG = Number(argOf("rung") ?? "16");
/**
 * The **family** judged. `sl` = the L20 sealed-landing device (§6.2.6, one pocket); `g` = Act II's
 * **multi-pocket** class (§7.2/§7.4 stage G, ≥ 2 walk-sealed rooms). The family is never inferred
 * from the outcome: it is an argument, and the gates it selects are printed.
 */
const FAMILY = argOf("family") ?? (RUNG >= 21 ? "g" : "sl");
/** `--measure-controls`: print each control's *measured* refusal without asserting it (F-L16-3 order). */
const MEASURE_CONTROLS = process.argv.includes("--measure-controls");
/** `--ladder=21,22,23,24,25`: prove the whole batch in order and print the ladder table. */
const LADDER = (argOf("ladder") ?? "").split(",").filter((s) => s !== "").map(Number);
/** `--peak=`: the Act I measured peak the batch must clear (printed by the authoring tool).
 * R-004a: the default is the **registered** peak constant from the law, so the tool cannot
 * quote a peak the registration does not publish. */
const ACT1_PEAK = Number(argOf("peak") ?? String(ACT_I_REGISTERED_PEAK_EXEC));

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
  /** The pocket derived from the landed bytes (rung ≥ 20 only), for printing. */
  readonly view: PocketView | null;
  /** The multi-pocket device derived from the landed bytes (family `g` only), for printing. */
  readonly gview?: GView | null;
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

function measureCut(): { floor: number; l15Par: number; n: number; basis: readonly number[] } {
  let floor = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let n = 0;
  const basis: number[] = [];
  for (const { level } of shipped()) {
    n += 1;
    // ── The basis is FROZEN at the world below the ladder under construction ────
    // R-003c: once L16–L19 are registered, they are *in the root* — and the cut is
    // defined as "the highest D_exec this candidate must beat", i.e. the world it is
    // climbing out of. Letting the ladder raise its own filter would make the tool
    // reject the blocks it proved (L16's 17.100000 is not > L19's 22.885157), which
    // is an instrument artefact, never a finding. So the members of the L16–L19
    // ladder are excluded from the cut basis, by the law's own id list
    // (`BLOCK_L1619_IDS`), and the basis is printed. The rung-to-rung rise, which the
    // cut cannot see, is judged by `block-l1619-rung` / the ladder rows of
    // `scripts/attest-lv010-block.ts` and by `blockL1619Gates`.
    //
    // R-004a: same rule, second registration — with L21–L25 in the root (R-004a) the
    // exclusion has to grow with the dataset again, or Act II's own peak (27.604651)
    // would become the ceiling Act II is judged against and every rung of the batch
    // would be falsely REFUSED (the R-003d quoted red, one mechanism later). The cut
    // stays **frozen at L1–L15 = 14.969697**; §7 needs no re-derivation of it, and the
    // act's own escalation is judged by §7.3's act-peak clause (`act2Batch1Gates` +
    // `actScaleTailGuards`), never by moving the cut.
    if (BLOCK_L1619_IDS.includes(level.id)) continue;
    if (ACT_II_B1_IDS.includes(level.id)) continue;
    basis.push(level.id);
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, l15Par, n, basis };
}

/** The rung gates. `floor`/`l15Par` arrive measured; the board arrives from disk. */
function judge(
  level: Level,
  floor: number,
  l15Par: number,
  rung: number,
  viewOverride?: PocketView | null,
  family: string = FAMILY,
  gViewOverride?: GView | null,
): Verdict {
  const shape = validateLevel(level);
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { accepted: false, reason: "explosion", par: null, dexec: null, b: null, gates: [], view: null };
  }
  const result = analyse(level, graph);
  if (!result.solvable || result.shortestSolution === null)
    return { accepted: false, reason: "unsolvable", par: null, dexec: null, b: null, gates: [], view: null };

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
  const base: readonly Gate[] = [
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
    ...(family === "g"
      ? ([
          {
            id: "act2-par-band",
            ok: stamped > ACT2_PAR_BAND[0] && stamped < ACT2_PAR_BAND[1],
            detail:
              `par=${String(stamped)} strictly inside Act II's band (${String(ACT2_PAR_BAND[0])}, ${String(ACT2_PAR_BAND[1])}) ` +
              `(§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)`,
          },
          {
            id: "act2-exec-band",
            ok: diff.Dexec !== null && diff.Dexec >= ACT2_EXEC_BAND[0] && diff.Dexec <= ACT2_EXEC_BAND[1],
            detail:
              `D_exec=${diff.Dexec === null ? "n/a" : diff.Dexec.toFixed(6)} ∈ [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}] ` +
              `(§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)`,
          },
          {
            id: "act2-b-band",
            ok: diff.B >= BLOCK_L1619_B_BAND[0] && diff.B <= BLOCK_L1619_B_BAND[1],
            detail: `B=${diff.B.toFixed(4)} ∈ [${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}] (the measured band; F-L16-2 excursion would have to be named)`,
          },
          {
            id: "act-peak",
            ok: PEAK_RUNG === null || rung === PEAK_RUNG ? (diff.Dexec !== null && diff.Dexec > ACT1_PEAK) : true,
            detail:
              `D_exec=${diff.Dexec === null ? "n/a" : diff.Dexec.toFixed(6)} vs Act I's measured peak ${ACT1_PEAK.toFixed(6)} ` +
              `(delta ${diff.Dexec === null ? "n/a" : (diff.Dexec - ACT1_PEAK).toFixed(6)}) — §7.3 puts the across-act obligation on the act's measured ` +
              `PEAK, never on every interior member: ${PEAK_RUNG === null ? "no ladder given, so the clause is reported (this file is treated as the peak)" : `ladder peak rung = L${String(PEAK_RUNG)}`}`,
          },
        ] as Gate[])
      : ([
          {
            id: "par-step",
            ok: stamped >= l15Par + 2 * (proven.id - 15),
            detail: `par=${String(stamped)} ≥ ${String(l15Par + 2 * (proven.id - 15))} (l15Par ${String(l15Par)} + 2·${String(proven.id - 15)}, §6.1.1 P2)`,
          },
        ] as Gate[])),
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

  // ── family "g" (Act II multi-pocket): the device derived from the landed bytes ──
  if (family === "g") {
    const gview = gViewOverride === undefined ? multiPocketFromBytes(proven) : gViewOverride;
    const extras: Gate[] = [];
    if (gview === null) {
      extras.push({
        id: "g6-room-structure",
        ok: false,
        detail:
          "the multi-pocket device could not be derived from the landed bytes: §7.4's stage G needs exactly one portal pair, exactly one end " +
          "unreachable on foot (the landing), and ≥ 2 walk-sealed rooms each covered by exactly ONE openable door object. " +
          `Measured: ${String(proven.portals.length)} portal(s), ${String(sealedRooms(proven).length)} sealed room(s)`,
      });
    } else {
      extras.push(...multiPocketGates(proven, graph, result, gview));
    }
    const gates: readonly Gate[] = [...base, ...extras];
    const failed = gates.filter((g) => !g.ok);
    return {
      accepted: failed.length === 0,
      reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
      par: stamped,
      dexec: diff.Dexec,
      b: diff.B,
      gates,
      view: null,
      gview,
    };
  }

  // ── rung ≥ 20: the block-escalation pair and the sealed-landing gates g1–g5 ──
  const extras: Gate[] = [];
  let view: PocketView | null = null;
  if (rung >= 20) {
    const dexec = diff.Dexec;
    const inBand = diff.B >= BLOCK_L1619_B_BAND[0] && diff.B <= BLOCK_L1619_B_BAND[1];
    extras.push({
      id: "rung-plus-block-escalation",
      ok: dexec !== null && dexec > BLOCK_L1619_PRE_R003D_TAIL_EXEC && inBand,
      detail:
        `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} > block ceiling ${BLOCK_L1619_PRE_R003D_TAIL_EXEC.toFixed(6)} (the pre-R-003d stop the rung had to beat; the block\u2019s tail is now ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)}) ` +
        `(BLOCK_L1619, the registered L16–L19 stop — a rung above the block must clear the block, not only the L1–L15 cut) ` +
        `AND B=${diff.B.toFixed(4)} ∈ [${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}]`,
    });
    extras.push({
      id: "par-rung-exact",
      ok: stamped === rung,
      detail: `solver par=${String(stamped)} === rung ${String(rung)} (exact, not a floor — §6.1.1 P2)`,
    });
    // The proving side derives the pocket ITSELF (§1): the override exists only for
    // the negative-control battery, where a mutation removes the device and the
    // gates must still be measured against the pocket the landed bytes describe.
    view = viewOverride === undefined ? pocketFromBytes(proven) : viewOverride;
    if (view === null) {
      extras.push({
        id: "pocket-derived",
        ok: false,
        detail:
          `the pocket device could not be derived from the landed bytes: the board must have exactly one portal pair, ` +
          `and exactly ONE of its two ends must be unreachable on foot in the portal-free world (that end is the landing). ` +
          `Measured: ${String(proven.portals.length)} portal(s)`,
      });
    } else {
      extras.push(...sealedLandingGates(proven, graph, result, view));
    }
  }
  const gates: readonly Gate[] = [...base, ...extras];
  const failed = gates.filter((g) => !g.ok);
  return {
    accepted: failed.length === 0,
    reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
    par: stamped,
    dexec: diff.Dexec,
    b: diff.B,
    gates,
    view,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The SEALED LANDING gates (rung ≥ 20) — the five gates of docs/level-design.md
// §6.2.6, measured on the landed bytes, with the pocket **derived from those bytes**
// and never imported from the authoring script (§1: the proving side must not trust
// the proposing side).
//
// The derivation is the device's own premise, read as three measurements:
//
//   1. **the landing** — of the (single) portal pair, the end that is NOT
//      reachable on foot from the player's start when the portal is removed
//      (ADR §6.2.3 item 2: the landing is behind the portal by construction);
//   2. **the pocket** — the connected component of the landing through tiles that
//      are neither phase walls nor door tiles (a door tile is the boundary, not the
//      room);
//   3. **the boundary** — every in-bounds neighbour of the pocket outside it: the
//      door tiles it must all belong to (one door object), plus any non-door
//      neighbour, which is a leak the gate must name.
// ─────────────────────────────────────────────────────────────────────────────

interface PocketView {
  readonly landing: Coord;
  readonly near: Coord;
  readonly pocket: readonly Coord[];
  readonly boundary: readonly Coord[];
  /** Distinct door ids covering the boundary tiles (exactly one, or g2 fails). */
  readonly doorIds: readonly string[];
  /** Switches whose tile lies inside the pocket. */
  readonly switchIds: readonly string[];
  /** The pocket door object, when the boundary resolves to exactly one. */
  readonly pocketDoor: DoorDef | null;
}

function walkPositions(level: Level): Set<string> {
  const walk = explore({ ...level, portals: [] } as Level);
  return new Set(walk.nodes.map((s) => coordKey([s.player.x, s.player.y] as Coord)));
}

function pocketFromBytes(level: Level): PocketView | null {
  if (level.portals.length !== 1) return null;
  const portal = level.portals[0] as PortalDef;
  const [a, b] = portal.pair;
  const foot = walkPositions(level);
  const behind = [a, b].filter((e) => !foot.has(coordKey(e)));
  if (behind.length !== 1) return null; // neither end behind the portal, or both
  const landing = behind[0] as Coord;
  const near = coordKey(a) === coordKey(landing) ? b : a;

  const wall = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const doorOf = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorOf.set(coordKey(t), d.id);
  const blocked = (t: Coord): boolean => wall.has(coordKey(t)) || doorOf.has(coordKey(t));

  const pocket = new Map<string, Coord>();
  const queue: Coord[] = [landing];
  pocket.set(coordKey(landing), landing);
  for (let q = 0; q < queue.length; q += 1) {
    const t = queue[q] as Coord;
    for (const d of DIRECTIONS) {
      const n = at2(t, d);
      if (n[0] < 0 || n[1] < 0 || n[0] >= level.width || n[1] >= level.height) continue;
      if (pocket.has(coordKey(n)) || blocked(n)) continue;
      pocket.set(coordKey(n), n);
      queue.push(n);
    }
  }
  const outward = new Set<string>();
  const boundary: Coord[] = [];
  for (const t of pocket.values()) {
    for (const d of DIRECTIONS) {
      const n = at2(t, d);
      if (n[0] < 0 || n[1] < 0 || n[0] >= level.width || n[1] >= level.height) continue;
      if (pocket.has(coordKey(n)) || outward.has(coordKey(n))) continue;
      outward.add(coordKey(n));
      boundary.push(n);
    }
  }
  const doorIds = [...new Set(boundary.map((t) => doorOf.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
  const pocketKeys = new Set(pocket.keys());
  const switchIds = level.switches.filter((s) => pocketKeys.has(coordKey(s.tile))).map((s) => s.id);
  return {
    landing,
    near,
    pocket: [...pocket.values()].sort((p, q) => coordKey(p).localeCompare(coordKey(q))),
    boundary: boundary.sort((p, q) => coordKey(p).localeCompare(coordKey(q))),
    doorIds,
    switchIds,
    pocketDoor: doorIds.length === 1 ? (level.doors.find((d) => d.id === doorIds[0]) ?? null) : null,
  };
}

/** `t` stepped one tile in `dir` (a local copy of the canonical step, level-data side). */
function at2(t: Coord, dir: string): Coord {
  if (dir === "left") return [t[0] - 1, t[1]] as Coord;
  if (dir === "right") return [t[0] + 1, t[1]] as Coord;
  if (dir === "up") return [t[0], t[1] - 1] as Coord;
  return [t[0], t[1] + 1] as Coord;
}

/** A level-data neighbour step, used only to build the boundary (never to judge entry). */
const neighbours4 = (level: Level, t: Coord): Coord[] => {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at2(t, d);
    if (n[0] < 0 || n[1] < 0 || n[0] >= level.width || n[1] >= level.height) continue;
    out.push(n);
  }
  return out;
};

/** Every legal move out of a state, as successor states (the shipped rule decides). */
function nextStates(level: Level, s: SearchState): SearchState[] {
  const out: SearchState[] = [];
  for (const d of DIRECTIONS) {
    if (!isLegalMove(level, s, move(d))) continue;
    out.push(applyMove(level, s, move(d)));
  }
  return out;
}

const everySwitchOff = (level: Level, s: SearchState): boolean =>
  level.switches.every((sw) => s.switchesOn[sw.id] !== true);

/**
 * The five sealed-landing gates. `graph` is the landed board's reachable graph, so
 * every number here is a re-measurement of the bytes on disk.
 */
function sealedLandingGates(
  level: Level,
  graph: ReachableGraph,
  result: { shortestSolution: number | null; distinctPositions: number },
  view: PocketView,
): readonly Gate[] {
  const par = result.shortestSolution ?? level.par;
  const pocketKeys = new Set(view.pocket.map(coordKey));
  const doorTiles = new Set((view.pocketDoor?.tiles ?? []).map(coordKey));
  const wallList = [...level.phaseAWalls, ...level.phaseBWalls].map(coordKey);
  const wallSet = new Set(wallList);
  const doorKeySet = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorKeySet.set(coordKey(t), d.id);

  // ── the arrival state: the state the teleport produces (all switches OFF) ────
  let arrival: SearchState | null = null;
  for (const s of graph.nodes) {
    if (!everySwitchOff(level, s)) continue;
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const clicked = at2([s.player.x, s.player.y] as Coord, d);
      if (coordKey(clicked) !== coordKey(view.near)) continue;
      const n = applyMove(level, s, move(d));
      if (coordKey([n.player.x, n.player.y] as Coord) === coordKey(view.landing)) arrival = n;
    }
  }

  // ── g1 — the pocket is not on-foot reachable, and it is sealed pre-press ────
  const foot = walkPositions(level);
  const footInPocket = [...pocketKeys].filter((k) => foot.has(k)).length;
  let escapes = 0;
  let returns = 0;
  if (arrival !== null) {
    const seen = new Set<string>([hashState(arrival)]);
    const q: SearchState[] = [arrival];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      for (const n of nextStates(level, s)) {
        if (!everySwitchOff(level, n)) continue;
        const key = coordKey([n.player.x, n.player.y] as Coord);
        if (!pocketKeys.has(key)) {
          // an EDGE out of the pocket is what g1 counts; the flood stops there,
          // because a move made after leaving is not a pocket exit.
          if (key === coordKey(view.near)) returns += 1;
          else escapes += 1;
          continue;
        }
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const g1: Gate = {
    id: "g1-pocket-on-foot",
    ok: arrival !== null && footInPocket === 0 && escapes === 0,
    detail:
      `landing ${coordKey(view.landing)} (behind the portal: not on foot); pocket [${view.pocket.map(coordKey).join(" ")}] ` +
      `${String(view.pocket.length)} tile(s); on-foot-reachable pocket tiles=${String(footInPocket)} (required 0); ` +
      `arrival=${arrival === null ? "NOT FOUND (the teleport never lands on the derived landing)" : `phase ${arrival.phase}`}; ` +
      `pre-press moves leaving the pocket into the far region=${String(escapes)} (required 0); ` +
      `moves back through the landing to the near end ${coordKey(view.near)}=${String(returns)} ` +
      `(named, not counted as an escape: the landing IS a portal end — ADR-0009 — so stepping back onto it is a return to the start region, ` +
      `a cycle that re-enters the portal at a price, never a way into the far region)`,
  };

  // ── g2 — the pocket's only exit is a door (no phase wall exit, no free exit) ─
  const unblocked = view.boundary.filter((t) => {
    const k = coordKey(t);
    return !doorKeySet.has(k) && !wallSet.has(k);
  });
  const walledBoundary = view.boundary.filter((t) => wallSet.has(coordKey(t)));
  const g2: Gate = {
    id: "g2-pocket-exit-door",
    ok: view.doorIds.length === 1 && unblocked.length === 0 && walledBoundary.length === 0,
    detail:
      `boundary [${view.boundary.map(coordKey).join(" ")}] of ${String(view.boundary.length)} tile(s); ` +
      `distinct door id(s) covering it: ${String(view.doorIds.length)} [${view.doorIds.join(" ")}] (required exactly 1 — a single door object); ` +
      `boundary tiles that are neither door nor wall (free leaks)=${String(unblocked.length)} [${unblocked.map(coordKey).join(" ")}]; ` +
      `boundary tiles that are phase walls=${String(walledBoundary.length)} [${walledBoundary.map(coordKey).join(" ")}] ` +
      `(F-L19-2: a far-region phase wall makes its tile unstandable, so the 42/42 coverage gate fails — every blocker must be an openable door)`,
  };

  // ── g3 — the ordered ≥ 2-press chain, and that the press is mandatory ───────
  const pocketSwitch = level.switches.find((s) => view.switchIds.includes(s.id)) ?? null;
  const pocketSwitchId = pocketSwitch?.id ?? "-";
  let routes = 0;
  let minPresses = Number.POSITIVE_INFINITY;
  let orderedRoutes = 0;
  forEachParRoute(level, par, (route) => {
    routes += 1;
    const order: string[] = [];
    let crossedAfterPocketPress = false;
    let secondAfterExit = false;
    let pressed = false;
    for (const rec of route) {
      for (const id of rec.toggledOn) if (!order.includes(id)) order.push(id);
      const tile = coordKey([rec.state.player.x, rec.state.player.y] as Coord);
      if (doorTiles.has(tile) && pressed) crossedAfterPocketPress = true;
      if (rec.toggledOn.some((id) => id !== pocketSwitchId) && crossedAfterPocketPress) secondAfterExit = true;
      if (rec.toggledOn.includes(pocketSwitchId)) pressed = true;
    }
    minPresses = Math.min(minPresses, order.length);
    if (order.length >= 2 && order[0] === pocketSwitchId && crossedAfterPocketPress && secondAfterExit) orderedRoutes += 1;
  });
  const g3: Gate = {
    id: "g3-ordered-two-press",
    ok: routes > 0 && minPresses >= 2 && orderedRoutes === routes,
    detail:
      `par=${String(par)} · ${String(routes)} shortest route(s); pocket switch=${pocketSwitchId} on tile ` +
      `${pocketSwitch === null ? "n/a" : coordKey(pocketSwitch.tile)}; distinct switches pressed per route: min=${Number.isFinite(minPresses) ? String(minPresses) : "n/a"} ` +
      `(required ≥ 2); routes executing the chain land → press(${pocketSwitchId}) → cross the pocket door → press the seal switch = ` +
      `${String(orderedRoutes)}/${String(routes)}`,
  };

  // ── g4 — switchRequired, measured ──────────────────────────────────────────
  const allOffShortest = allOffShortestSolution(level, graph);
  const allOffReach = goalReachableWithAllSwitchesOff(level, graph);
  const g4: Gate = {
    id: "g4-switch-required",
    ok: allOffShortest === null && !allOffReach,
    detail:
      `allOffShortest=${allOffShortest === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOffShortest)} ` +
      `allOffGoalReachable=${String(allOffReach)} par=${String(par)} — with every switch OFF the pocket's door refuses the only exit ` +
      `(its base colour is closed in the arrival phase), so the far region beyond the pocket is unreachable at all: the latch carries existence`,
  };

  // ── g5 — the census identity is BROKEN (the mechanism's whole point) ───────
  const freePositions = new Set<string>();
  {
    const start = graph.nodes[0] as SearchState;
    const seen = new Set<string>([hashState(start)]);
    const q: SearchState[] = [start];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      if (!everySwitchOff(level, s)) continue;
      freePositions.add(coordKey([s.player.x, s.player.y] as Coord));
      for (const n of nextStates(level, s)) {
        if (!everySwitchOff(level, n)) continue;
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const sealTiles = level.doors
    .filter((d) => view.pocketDoor === null || d.id !== view.pocketDoor.id)
    .flatMap((d) => d.tiles);
  const notAdjacent = sealTiles.filter(
    (t) =>
      !neighbours4(level, t).some((n) => freePositions.has(coordKey(n))),
  );
  const d1Free: Level = view.pocketDoor === null
    ? level
    : {
        ...level,
        doors: level.doors.filter((d) => d.id !== view.pocketDoor?.id),
        switches: level.switches.filter((s) => !view.switchIds.includes(s.id)),
      };
  let identityValue: number | null = null;
  try {
    identityValue = analyse(d1Free, explore(d1Free)).shortestSolution;
  } catch {
    identityValue = null;
  }
  const g5: Gate = {
    id: "g5-identity-broken",
    ok: notAdjacent.length >= 1 && identityValue !== null && identityValue < par && minPresses >= 2,
    detail:
      `par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5) and it holds only while every seal ` +
      `tile is directly adjacent to the free far region. Measured: ${String(sealTiles.length)} seal tile(s), ${String(notAdjacent.length)} NOT adjacent ` +
      `to the all-OFF free region [${notAdjacent.map(coordKey).join(" ")}] (free region ${String(freePositions.size)} position(s)); ` +
      `and the identity's VALUE — the world with the pocket device removed, where every seal tile is adjacent again — solves at ` +
      `${identityValue === null ? "n/a" : String(identityValue)} < par ${String(par)}. The minimum form therefore no longer computes this par: ` +
      `its one-press arithmetic is ${identityValue === null ? "n/a" : String(identityValue)} while every par route presses ` +
      `${Number.isFinite(minPresses) ? String(minPresses) : "?"} switch(es) through the sealed landing (g3).`,
  };

  return [g1, g2, g3, g4, g5];
}

// ─────────────────────────────────────────────────────────────────────────────
// The MULTI-POCKET device (family `g`) — Act II · docs/level-design.md §7.2 / §7.4
// stage G, read off the landed bytes. The class is defined by *measurements on the
// board*, never by the generator's lattice:
//
//   1. exactly ONE portal pair, exactly one of its ends unreachable on foot (the
//      landing; §6.2.3 item 1 + the ADR-0009 opposite-colour law);
//   2. **walk-sealed rooms** — maximal connected tile-sets whose every outward
//      neighbour is covered by exactly ONE door object, with no phase wall and no
//      free leak on the boundary (§6.2.3 items 2–3, read without the CX column);
//   3. ≥ 2 such rooms, one holding the landing, one holding the goal (the
//      multi-pocket class of §7.4's stage G);
//   4. the press chain measured on the solver's par routes, then *forced* by staged
//      worlds: removing the first k switches must leave the (k+1)-th switch's tile
//      and the goal unreachable (§6.2.3 item 4, the ordered ≥ 2-press chain).
// ─────────────────────────────────────────────────────────────────────────────

/** Act II's published par band (`docs/level-design.md` §7.2) — the AUTHORING filter is the
 * **strictly interior** form (`> 16`, `< 24`), deliberately narrower than the band: the tool
 * may only ever accept less than §7.2 permits, never more, so a widening here is impossible
 * by construction. The band itself is imported from the law (`@/core/solver/policy`, R-004a)
 * so the tool and the registration gate cannot drift apart. */
const ACT2_PAR_BAND: readonly [number, number] = ACT_II_PAR_BAND;
/** Act II's published `D_exec` band (§7.2; derived from the measured `B` band, not new maths). */
const ACT2_EXEC_BAND: readonly [number, number] = ACT_II_EXEC_BAND;
/** The batch's peak rung, when a ladder was given (§7.3: the across-act clause rides on the peak). */
const PEAK_RUNG: number | null = LADDER.length > 0 ? Math.max(...LADDER) : null;

interface RoomView {
  readonly tiles: readonly Coord[];
  readonly boundary: readonly Coord[];
  /** Distinct door ids covering the boundary (exactly one, or the room is not sealed). */
  readonly doorIds: readonly string[];
  readonly doorTiles: readonly Coord[];
  readonly wallTiles: readonly Coord[];
  readonly freeTiles: readonly Coord[];
  readonly switchIds: readonly string[];
  readonly hasGoal: boolean;
  readonly hasLanding: boolean;
}

interface GView {
  readonly landing: Coord;
  readonly near: Coord;
  readonly rooms: readonly RoomView[];
  readonly landingRoom: RoomView;
  readonly goalRoom: RoomView;
  readonly order: "landing-first" | "by-size";
}

/** The four tile-neighbours of `t` that are in bounds (the grid edge blocks by itself). */
function inBoundsNeighbours(level: Level, t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at2(t, d);
    if (n[0] < 0 || n[1] < 0 || n[0] >= level.width || n[1] >= level.height) continue;
    out.push(n);
  }
  return out;
}

/**
 * Every **walk-sealed room** of the board, derived from the bytes: a maximal connected
 * set of tiles that are neither a phase wall nor a door tile, whose entire boundary is
 * covered by exactly one door object — no phase-wall boundary tile (F-L19-2: a wall on
 * the boundary makes its tile unstandable and the 42/42 coverage gate fails) and no
 * free boundary tile (an open leak).
 */
function sealedRooms(level: Level): RoomView[] {
  const wall = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const doorOf = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorOf.set(coordKey(t), d.id);
  const blocked = (t: Coord): boolean => wall.has(coordKey(t)) || doorOf.has(coordKey(t));
  const seen = new Set<string>();
  const rooms: RoomView[] = [];
  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) {
      const s = [x, y] as Coord;
      if (seen.has(coordKey(s)) || blocked(s)) continue;
      const tiles: Coord[] = [];
      const q: Coord[] = [s];
      seen.add(coordKey(s));
      for (let i = 0; i < q.length; i += 1) {
        const t = q[i] as Coord;
        tiles.push(t);
        for (const n of inBoundsNeighbours(level, t)) {
          if (seen.has(coordKey(n)) || blocked(n)) continue;
          seen.add(coordKey(n));
          q.push(n);
        }
      }
      const inside = new Set(tiles.map(coordKey));
      const bmap = new Map<string, Coord>();
      for (const t of tiles) for (const n of inBoundsNeighbours(level, t)) if (!inside.has(coordKey(n))) bmap.set(coordKey(n), n);
      const boundary = [...bmap.values()].sort((p, q2) => coordKey(p).localeCompare(coordKey(q2)));
      const doorIds = [...new Set(boundary.map((t) => doorOf.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
      const wallTiles = boundary.filter((t) => wall.has(coordKey(t)));
      const freeTiles = boundary.filter((t) => !wall.has(coordKey(t)) && !doorOf.has(coordKey(t)));
      // The room is a walk-sealed ROOM only when a single door object covers its whole
      // boundary. Anything else (a wall boundary, two doors, an open leak) is a region,
      // not a room, and the gate that wants a room will say so by name.
      if (doorIds.length !== 1 || wallTiles.length > 0 || freeTiles.length > 0) continue;
      const sorted = [...tiles].sort((p, q2) => coordKey(p).localeCompare(coordKey(q2)));
      rooms.push({
        tiles: sorted,
        boundary,
        doorIds,
        doorTiles: boundary.filter((t) => doorOf.has(coordKey(t))),
        wallTiles,
        freeTiles,
        switchIds: level.switches.filter((sw) => inside.has(coordKey(sw.tile))).map((sw) => sw.id),
        hasGoal: inside.has(coordKey(level.goal)),
        hasLanding: false,
      });
    }
  }
  return rooms;
}

function multiPocketFromBytes(level: Level): GView | null {
  if (level.portals.length !== 1) return null;
  const portal = level.portals[0] as PortalDef;
  const [a, b] = portal.pair;
  const foot = walkPositions(level);
  const behind = [a, b].filter((e) => !foot.has(coordKey(e)));
  if (behind.length !== 1) return null;
  const landing = behind[0] as Coord;
  const near = coordKey(a) === coordKey(landing) ? b : a;
  const rooms = sealedRooms(level).map((r) => ({
    ...r,
    hasLanding: r.tiles.some((t) => coordKey(t) === coordKey(landing)),
  }));
  if (rooms.length < 2) return null; // §7.4 stage G: the MULTI-pocket class
  const landingRoom = rooms.find((r) => r.hasLanding);
  const goalRoom = rooms.find((r) => r.hasGoal);
  if (landingRoom === undefined || goalRoom === undefined) return null;
  return { landing, near, rooms, landingRoom, goalRoom, order: "landing-first" };
}

/** The reachable *positions* of a world (a staged world for the forcing measurement). */
function reachablePositions(level: Level): Set<string> | null {
  try {
    const g = explore(level);
    return new Set(g.nodes.map((s) => coordKey([s.player.x, s.player.y] as Coord)));
  } catch {
    return null;
  }
}

/**
 * Re-measure a room's boundary against **the level as it is now**: the injected view of the
 * negative-control battery carries geometry derived from the *unmutated* board, so the gates
 * must not read its cached boundary fields — they re-derive them from the tiles. This is what
 * lets a control that only *perturbs* a door still be named by the gate it targets.
 */
function measureRoom(level: Level, tiles: readonly Coord[], hasLanding: boolean): RoomView {
  const wall = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const doorOf = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorOf.set(coordKey(t), d.id);
  const inside = new Set(tiles.map(coordKey));
  const bmap = new Map<string, Coord>();
  for (const t of tiles) for (const n of inBoundsNeighbours(level, t)) if (!inside.has(coordKey(n))) bmap.set(coordKey(n), n);
  const boundary = [...bmap.values()].sort((p, q2) => coordKey(p).localeCompare(coordKey(q2)));
  const doorIds = [...new Set(boundary.map((t) => doorOf.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
  return {
    tiles,
    boundary,
    doorIds,
    doorTiles: boundary.filter((t) => doorOf.has(coordKey(t))),
    wallTiles: boundary.filter((t) => wall.has(coordKey(t))),
    freeTiles: boundary.filter((t) => !wall.has(coordKey(t)) && !doorOf.has(coordKey(t))),
    switchIds: level.switches.filter((sw) => inside.has(coordKey(sw.tile))).map((sw) => sw.id),
    hasGoal: inside.has(coordKey(level.goal)),
    hasLanding,
  };
}

/** The switch inside the landing room that opens the landing room's OWN door (§6.2.3 item 4). */
function firstPressSwitch(level: Level, view: GView): string | null {
  const inRoom = level.switches.filter((s) => view.landingRoom.switchIds.includes(s.id));
  const own = inRoom.find((s) => s.targets.some((t) => view.landingRoom.doorIds.includes(t)));
  return own?.id ?? inRoom[0]?.id ?? null;
}

/**
 * The multi-pocket gates `g0`–`g6`. `graph` is the landed board's reachable graph, so every
 * number is a re-measurement of the bytes on disk; `par` is the solver's.
 */
function multiPocketGates(
  level: Level,
  graph: ReachableGraph,
  result: { shortestSolution: number | null; distinctPositions: number },
  view: GView,
): readonly Gate[] {
  const par = result.shortestSolution ?? level.par;
  const portal = level.portals[0] as PortalDef;
  const [pa, pb] = portal.pair;
  // Every room's geometry is RE-MEASURED against the level as it now stands (the battery's
  // injected view carries the unmutated board's cached boundary — see {@link measureRoom}).
  const rooms = view.rooms.map((r) => measureRoom(level, r.tiles, r.hasLanding));
  const landingRoom = rooms.find((r) => r.hasLanding) ?? view.landingRoom;
  const goalRoom = rooms.find((r) => r.hasGoal) ?? view.goalRoom;
  /** The view with every room re-measured against the current bytes — what the gates read. */
  const v: GView = { ...view, rooms, landingRoom, goalRoom };

  // ── the arrival state: the state the teleport produces (all switches OFF) ─────
  let arrival: SearchState | null = null;
  for (const s of graph.nodes) {
    if (!everySwitchOff(level, s)) continue;
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const clicked = at2([s.player.x, s.player.y] as Coord, d);
      if (coordKey(clicked) !== coordKey(v.near)) continue;
      const n = applyMove(level, s, move(d));
      if (coordKey([n.player.x, n.player.y] as Coord) === coordKey(v.landing)) arrival = n;
    }
  }

  // ── g0 — exactly one portal pair, one end behind it, ends of opposite parity ──
  const g0: Gate = {
    id: "g0-portal-pair",
    ok:
      level.portals.length === 1 &&
      (pa[0] + pa[1]) % 2 !== (pb[0] + pb[1]) % 2 &&
      arrival !== null,
    detail:
      `portal(s)=${String(level.portals.length)} (required exactly 1 — §6.2.3 item 1); pair ${coordKey(pa)}–${coordKey(pb)} ` +
      `parities ${String((pa[0] + pa[1]) % 2)} / ${String((pb[0] + pb[1]) % 2)} (opposite required, ADR-0009's opposite-colour law sets the frames apart); ` +
      `landing end ${coordKey(v.landing)} (the end not on foot), near end ${coordKey(v.near)}; ` +
      `the teleport fires on entry and is measured landing there: arrival=${arrival === null ? "NOT FOUND" : `phase ${arrival.phase}`}`,
  };

  // ── g1 — the landing room is not on foot reachable, and it is sealed pre-press ─
  // "On foot" is read the way §6.2.3 item 2 reads it: the **portal-free** board (the teleport
  // removed; doors and latches still playable) — the walking-only subgraph has no entry.
  const foot = walkPositions(level);
  const landingKeys = new Set(v.landingRoom.tiles.map(coordKey));
  const footInRoom = [...landingKeys].filter((k) => foot.has(k)).length;
  const allRoomKeys = new Set(v.rooms.flatMap((r) => r.tiles.map(coordKey)));
  const footInAnyRoom = [...allRoomKeys].filter((k) => foot.has(k)).length;
  let escapes = 0;
  let returns = 0;
  if (arrival !== null) {
    const seen = new Set<string>([hashState(arrival)]);
    const q: SearchState[] = [arrival];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      for (const n of nextStates(level, s)) {
        if (!everySwitchOff(level, n)) continue;
        const key = coordKey([n.player.x, n.player.y] as Coord);
        if (!landingKeys.has(key)) {
          if (key === coordKey(v.near)) returns += 1;
          else escapes += 1;
          continue;
        }
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const g1: Gate = {
    id: "g1-pocket-on-foot",
    ok: arrival !== null && footInRoom === 0 && footInAnyRoom === 0 && escapes === 0,
    detail:
      `landing room [${v.landingRoom.tiles.map(coordKey).join(" ")}] (door ${v.landingRoom.doorIds.join("")}): ` +
      `on-foot-reachable (portal-free board) room tiles=${String(footInRoom)} (required 0 — §6.2.3 item 2); ` +
      `on-foot-reachable tiles over ALL ${String(v.rooms.length)} sealed room(s)=${String(footInAnyRoom)} (required 0: the device is portal-only in every room); ` +
      `pre-press edges leaving the room=${String(escapes)} (required 0); edges back onto the near end ${coordKey(v.near)}=${String(returns)} (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)`,
  };

  // ── g2 — every sealed room's only exit is ONE openable door (no wall, no leak) ─
  const notSealed = v.rooms.filter(
    (r) => r.doorIds.length !== 1 || r.wallTiles.length > 0 || r.freeTiles.length > 0,
  );
  const g2: Gate = {
    id: "g2-room-exit-door",
    ok: v.rooms.length >= 2 && notSealed.length === 0,
    detail:
      `${String(v.rooms.length)} walk-sealed room(s) derived from the bytes ` +
      `[${v.rooms.map((r) => `${r.doorIds.join("")}:${r.tiles.map(coordKey).join("+")}`).join(" · ")}]; ` +
      `rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=${String(notSealed.length)} (required 0)`,
  };

  // ── g6 — the multi-pocket STRUCTURE (§7.4 stage G's class, measured) ─────────
  const covering = v.rooms.map((r) => r.doorIds[0] as string);
  const distinctDoors = new Set(covering).size === v.rooms.length;
  const landingDriven = v.landingRoom.switchIds.some((id) => {
    const sw = level.switches.find((s) => s.id === id);
    return sw !== undefined && sw.targets.some((t) => v.landingRoom.doorIds.includes(t));
  });
  const goalDrivenFromOutside = v.goalRoom.switchIds.length === 0 &&
    level.switches.some((s) => s.targets.some((t) => v.goalRoom.doorIds.includes(t)));
  const g6: Gate = {
    id: "g6-room-structure",
    ok:
      v.rooms.length >= 2 &&
      distinctDoors &&
      landingDriven &&
      goalDrivenFromOutside &&
      v.landingRoom.hasLanding &&
      v.goalRoom.hasGoal,
    detail:
      `rooms=${String(v.rooms.length)} (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); ` +
      `covering doors distinct=${String(distinctDoors)} [${covering.join(" ")}]; ` +
      `landing room carries the switch that opens ITS OWN door=${String(landingDriven)} (switch(es) in the landing room [${v.landingRoom.switchIds.join(" ")}] ` +
      `targeting [${v.landingRoom.doorIds.join(" ")}]); the goal's room is switch-free and its door is driven from elsewhere=${String(goalDrivenFromOutside)} ` +
      `(goal room [${v.goalRoom.tiles.map(coordKey).join(" ")}] door [${v.goalRoom.doorIds.join(" ")}] switch(es) [${v.goalRoom.switchIds.join(" ")}])`,
  };

  // ── g3 — the ordered ≥ 2-press chain, measured AND forced ────────────────────
  const targetsOf = new Map(level.switches.map((s) => [s.id, s.targets]));
  const doorTilesOf = new Map<string, Set<string>>();
  for (const d of level.doors) doorTilesOf.set(d.id, new Set(d.tiles.map(coordKey)));
  let routes = 0;
  const orders: string[] = [];
  let ordered = 0;
  let minPresses = Number.POSITIVE_INFINITY;
  const firstChain = firstPressSwitch(level, view);
  forEachParRoute(level, par, (route) => {
    routes += 1;
    const order: string[] = [];
    const first = new Map<string, number>();
    for (let i = 0; i < route.length; i += 1) {
      const rec = route[i];
      if (rec === undefined) continue;
      const tile = coordKey([rec.state.player.x, rec.state.player.y] as Coord);
      for (const [id, tiles] of doorTilesOf) if (tiles.has(tile) && !first.has(`cross:${id}`)) first.set(`cross:${id}`, i);
      for (const id of rec.toggledOn) {
        if (!order.includes(id)) order.push(id);
        if (!first.has(`press:${id}`)) first.set(`press:${id}`, i);
      }
    }
    minPresses = Math.min(minPresses, order.length);
    orders.push(order.join(">"));
    // the strict milestone order: press(s_i) < cross(door(s_i)) < press(s_{i+1}) …
    let last = -1;
    let ok = true;
    for (let i = 0; i < order.length; i += 1) {
      const sw = order[i] as string;
      const door = (targetsOf.get(sw) ?? [])[0] ?? "";
      const p = first.get(`press:${sw}`);
      const c = first.get(`cross:${door}`);
      if (p === undefined || c === undefined || p <= last || c <= p) {
        ok = false;
        break;
      }
      last = c;
    }
    if (ok && order.length >= 3 && order[0] === firstChain) ordered += 1;
  });
  const sharedOrder = new Set(orders).size === 1 ? (orders[0] ?? "") : null;
  const chain = sharedOrder === null ? [] : sharedOrder.split(">");

  // the FORCING measurement: staged worlds. Removing the first k switches must leave the
  // (k+1)-th switch's tile and the goal unreachable — "the second switch is reachable only
  // after the first door opens" (§6.2.3 item 4) as a measured statement, not a reading.
  const staged: { removed: string[]; target: string; targetReachable: boolean | null; goalReachable: boolean | null }[] = [];
  for (let k = 1; k < chain.length; k += 1) {
    const removed = chain.slice(0, k);
    const world: Level = { ...level, switches: level.switches.filter((s) => !removed.includes(s.id)) };
    const pos = reachablePositions(world);
    const sw = level.switches.find((s) => s.id === chain[k]);
    staged.push({
      removed,
      target: chain[k] as string,
      targetReachable: pos === null ? null : sw !== undefined && pos.has(coordKey(sw.tile)),
      goalReachable: pos === null ? null : pos.has(coordKey(level.goal)),
    });
  }
  const forcingOk = staged.length === chain.length - 1 && staged.every((s) => s.targetReachable === false && s.goalReachable === false);
  const g3: Gate = {
    id: "g3-ordered-chain",
    ok: routes > 0 && sharedOrder !== null && chain.length >= 3 && ordered === routes && forcingOk,
    detail:
      `par=${String(par)} · ${String(routes)} shortest route(s); press order(s) [${[...new Set(orders)].join(" | ")}] ` +
      `(one shared order required; ${sharedOrder === null ? "NOT SHARED" : `chain ${sharedOrder}`}); distinct switches per route: min=${Number.isFinite(minPresses) ? String(minPresses) : "n/a"} (required ≥ 3); ` +
      `routes executing press→cross in the strict order with the landing room's switch first: ${String(ordered)}/${String(routes)}; ` +
      `FORCING by staged worlds: ` +
      (staged.length === 0
        ? "not measurable (no chain)"
        : staged
            .map(
              (s) =>
                `drop{${s.removed.join(",")}} ⇒ switch ${s.target} tile reachable=${String(s.targetReachable)} goal reachable=${String(s.goalReachable)}`,
            )
            .join(" · ")) +
      ` — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)`,
  };

  // ── g4 — switchRequired, measured ───────────────────────────────────────────
  const allOffShortest = allOffShortestSolution(level, graph);
  const allOffReach = goalReachableWithAllSwitchesOff(level, graph);
  const g4: Gate = {
    id: "g4-switch-required",
    ok: allOffShortest === null && !allOffReach,
    detail:
      `allOffShortest=${allOffShortest === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOffShortest)} allOffGoalReachable=${String(allOffReach)} ` +
      `par=${String(par)} — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence`,
  };

  // ── g5 — the census identity is BROKEN (the mechanism's whole point) ────────
  const freePositions = new Set<string>();
  {
    const start = graph.nodes[0] as SearchState;
    const seen = new Set<string>([hashState(start)]);
    const q: SearchState[] = [start];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      if (!everySwitchOff(level, s)) continue;
      freePositions.add(coordKey([s.player.x, s.player.y] as Coord));
      for (const n of nextStates(level, s)) {
        if (!everySwitchOff(level, n)) continue;
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const landingDoorIds = new Set(v.landingRoom.doorIds);
  const sealTiles = level.doors.filter((d) => !landingDoorIds.has(d.id)).flatMap((d) => d.tiles);
  const notAdjacent = sealTiles.filter((t) => !inBoundsNeighbours(level, t).some((n) => freePositions.has(coordKey(n))));
  const deviceFree: Level = {
    ...level,
    doors: level.doors.filter((d) => !landingDoorIds.has(d.id)),
    switches: level.switches.filter((s) => !v.landingRoom.switchIds.includes(s.id)),
  };
  let identityValue: number | null = null;
  try {
    identityValue = analyse(deviceFree, explore(deviceFree)).shortestSolution;
  } catch {
    identityValue = null;
  }
  const g5: Gate = {
    id: "g5-identity-broken",
    ok: notAdjacent.length >= 1 && identityValue !== null && identityValue < par && minPresses >= 2,
    detail:
      `par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly ` +
      `adjacent to the free far region. Measured: ${String(sealTiles.length)} seal tile(s) outside the landing room, ${String(notAdjacent.length)} NOT adjacent ` +
      `to the all-OFF free region [${notAdjacent.map(coordKey).join(" ")}] (free region ${String(freePositions.size)} position(s)); the identity's VALUE — the world ` +
      `with the landing device (door ${v.landingRoom.doorIds.join("")} + its switch[es]) removed — solves at ${identityValue === null ? "n/a" : String(identityValue)} ` +
      `< par ${String(par)}: its one-press arithmetic no longer computes this board`,
  };

  return [g0, g1, g2, g6, g3, g4, g5];
}

// ── run ───────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(`prove-candidate — CUT re-measured from the shipped set: D_exec max = ${cut.floor.toFixed(6)} ` +
  `· par(L15) = ${String(cut.l15Par)} · ${String(cut.n)} shipped files · basis ids [${cut.basis.join(", ")}] ` +
  `(the L16–L20 block and the registered Act II batch are excluded from their own filter — see measureCut)`);
console.log(
  `family ${FAMILY}${FAMILY === "g" ? " (Act II multi-pocket — §7.2 / §7.4 stage G)" : " (the L20 sealed landing — §6.2.6)"}` +
    ` · Act I's measured peak the batch must clear: ${ACT1_PEAK.toFixed(6)}` +
    (PEAK_RUNG === null ? " (no --ladder: the across-act clause is reported per file)" : ` · ladder peak rung L${String(PEAK_RUNG)}`),
);

interface Proved {
  readonly ok: boolean;
  readonly verdict: Verdict;
  readonly level: Level | null;
  readonly caught: number;
  readonly controls: number;
}

function proveOne(file: string, rung: number): Proved {
  console.log(`\n${"─".repeat(78)}\ncandidate ${file} · rung ${String(rung)}`);
  const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
  const parsed = LevelSchema.safeParse(raw);
  if (!parsed.success) {
    console.log("SCHEMA: REJECT — the frozen zod schema refuses the file");
    return { ok: false, verdict: { accepted: false, reason: "schema", par: null, dexec: null, b: null, gates: [], view: null }, level: null, caught: 0, controls: 0 };
  }
  const level = parsed.data as Level;
  const verdict = judge(level, cut.floor, cut.l15Par, rung);
  console.log(
    `\npar=${verdict.par === null ? "n/a" : String(verdict.par)} ` +
      `D_exec=${verdict.dexec === null ? "n/a" : verdict.dexec.toFixed(6)} ` +
      `B=${verdict.b === null ? "n/a" : verdict.b.toFixed(4)} ` +
      `(CUT ${cut.floor.toFixed(6)}, delta ${verdict.dexec === null ? "n/a" : (verdict.dexec - cut.floor).toFixed(6)}; ` +
      `delta vs Act I peak ${verdict.dexec === null ? "n/a" : (verdict.dexec - ACT1_PEAK).toFixed(6)})`,
  );
  if (verdict.view !== null) {
    const v = verdict.view;
    console.log(
      `derived pocket (from the landed bytes, never from the authoring script): landing ${coordKey(v.landing)} (behind the portal) · ` +
        `near ${coordKey(v.near)} · pocket [${v.pocket.map(coordKey).join(" ")}] ${String(v.pocket.length)} tile(s) · ` +
        `boundary [${v.boundary.map(coordKey).join(" ")}] · covering door id(s) [${v.doorIds.join(" ")}] · ` +
        `switch(es) inside the pocket [${v.switchIds.join(" ")}]`,
    );
  }
  const gv = verdict.gview ?? null;
  if (gv !== null) {
    console.log(
      `derived multi-pocket device (from the landed bytes, never from the authoring script): landing ${coordKey(gv.landing)} (behind the portal) · ` +
        `near ${coordKey(gv.near)} · ${String(gv.rooms.length)} walk-sealed room(s): ` +
        gv.rooms
          .map(
            (r) =>
              `${r.doorIds.join("")}[${r.tiles.map(coordKey).join(" ")}]${r.hasLanding ? "(landing)" : ""}${r.hasGoal ? "(goal)" : ""}`,
          )
          .join(" · "),
    );
  }
  for (const g of verdict.gates) console.log(`  ${g.ok ? "ok  " : "FAIL"} ${g.id.padEnd(16)} ${g.detail}`);
  // Warnings are not gates (AGENTS.md §7: a warning is not a gate) — they are named
  // so nothing ships silently carrying one.
  for (const w of validateLevel(level).warnings) console.log(`  warn ${w}`);
  console.log(`\nGATES: ${verdict.accepted ? "ACCEPT" : `REJECT — ${verdict.reason}`}`);

  const controls = controlTable(level, rung, verdict, gv);
  console.log("\nnegative controls on the landed bytes:");
  let caught = 0;
  for (const control of controls) {
    const v = judge(control.board, cut.floor, cut.l15Par, rung, control.view, FAMILY, control.gview);
    const named = control.mustFire === undefined ? null : v.reason.includes(control.mustFire);
    if (MEASURE_CONTROLS) {
      console.log(
        `  MEASURED ${control.name} → ${v.accepted ? "ACCEPTED (!!)" : v.reason}` +
          (control.mustFire === undefined ? "" : `  [gate ${control.mustFire} named: ${String(named)}]`),
      );
      continue;
    }
    const hit = !v.accepted && control.expect.some((e) => v.reason.includes(e)) && named !== false;
    if (hit) caught += 1;
    console.log(
      `  ${hit ? "CAUGHT" : "MISSED"}  ${control.name} → ${v.reason}` +
        (control.mustFire === undefined
          ? `  (expected a refusal naming one of: ${control.expect.join(", ")})`
          : `  [expected a refusal naming one of: ${control.expect.join(", ")}; gate ${control.mustFire} named: ${String(named)}]`),
    );
  }
  const controlsOk = MEASURE_CONTROLS ? true : caught === controls.length;
  console.log(
    MEASURE_CONTROLS
      ? `controls: ${String(controls.length)} measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)`
      : `controls: ${String(caught)}/${String(controls.length)} caught by their named gate`,
  );
  const ok = verdict.accepted && controlsOk;
  console.log(`\nRESULT: ${ok ? "PASS" : "FAIL"}`);
  return { ok, verdict, level, caught, controls: controls.length };
}

const ladderRows: { id: number; par: number | null; dexec: number | null; b: number | null; coverage: string | null; chain: string | null; accepted: boolean }[] = [];
let allOk = true;
const targets = LADDER.length > 0 ? LADDER : [RUNG];
/**
 * Where a ladder run reads its bytes. The shelf is the default (this is the authoring
 * prover), and `--dir=<path>` re-points it at a **registered** set — which is what R-004a
 * used to re-prove the batch from `src/levels/` after the registration moved it there. The
 * resolved directory is printed per run, so a transcript can never be read as "proved on the
 * shelf" when it was proved at the root (and vice versa).
 */
const LADDER_DIR = argOf("dir") ?? CANDIDATES_DIR;
if (LADDER.length > 0) console.log(`ladder mode: proving ${LADDER.map((i) => `L${String(i)}`).join(" → ")} from ${LADDER_DIR}`);
for (const id of targets) {
  const file =
    LADDER.length > 0 ? join(LADDER_DIR, `l${String(id).padStart(3, "0")}.json`) : CANDIDATE;
  const r = proveOne(file, id);
  allOk = allOk && r.ok;
  const coverage = r.verdict.gates.find((g) => g.id === "coverage")?.detail ?? null;
  const chain = r.verdict.gates.find((g) => g.id === "g3-ordered-chain")?.detail ?? r.verdict.gates.find((g) => g.id === "latch-route")?.detail ?? null;
  ladderRows.push({
    id,
    par: r.verdict.par,
    dexec: r.verdict.dexec,
    b: r.verdict.b,
    coverage: coverage === null ? null : (/(\d+\/\d+)/.exec(coverage)?.[1] ?? coverage),
    chain,
    accepted: r.verdict.accepted,
  });
}

if (LADDER.length > 0) {
  console.log(`\n${"═".repeat(78)}\nLADDER TABLE — ${LADDER.map((i) => `L${String(i)}`).join(", ")} (§7.2 band, §7.3 rise, §7.7 handoff)`);
  console.log(
    "rung · par · D_exec · B · coverage · prev-step Δpar · strictly-rising D_exec · Δ vs Act I peak " + ACT1_PEAK.toFixed(6),
  );
  let prevPar: number | null = null;
  let prevExec: number | null = null;
  for (const row of ladderRows) {
    const dPar = prevPar === null || row.par === null ? null : row.par - prevPar;
    const rise = prevExec === null || row.dexec === null ? null : row.dexec - prevExec;
    console.log(
      `L${String(row.id)} · par ${String(row.par)} · ${row.dexec === null ? "n/a" : row.dexec.toFixed(6)} · ` +
        `${row.b === null ? "n/a" : row.b.toFixed(4)} · ${row.coverage ?? "n/a"} · ` +
        `Δpar ${dPar === null ? "—" : `${dPar >= 2 ? "≥2" : "<2"} (${String(dPar)})`} · ` +
        `rise ${rise === null ? "—" : `${rise > 0 ? "OK" : "DIP"} (${rise.toFixed(6)})`} · ` +
        `delta ${row.dexec === null ? "n/a" : (row.dexec - ACT1_PEAK).toFixed(6)}`,
    );
    prevPar = row.par;
    prevExec = row.dexec;
  }
  const maxRow = ladderRows.reduce<typeof ladderRows[number] | null>(
    (acc, r) => (acc === null || (r.dexec ?? Number.NEGATIVE_INFINITY) > (acc.dexec ?? Number.NEGATIVE_INFINITY) ? r : acc),
    null,
  );
  console.log(
    `batch peak: ${maxRow === null || maxRow.dexec === null ? "n/a" : `L${String(maxRow.id)} at ${maxRow.dexec.toFixed(6)}`} · ` +
      `Act I measured peak ${ACT1_PEAK.toFixed(6)} · §7.3 act-peak clause ${maxRow !== null && maxRow.dexec !== null && maxRow.dexec > ACT1_PEAK ? "DISCHARGED" : "NOT DISCHARGED"} ` +
      `· headroom to the Act II ceiling ${ACT2_EXEC_BAND[1].toFixed(2)}: ${maxRow === null || maxRow.dexec === null ? "n/a" : (ACT2_EXEC_BAND[1] - maxRow.dexec).toFixed(6)}`,
  );
  console.log(`LADDER RESULT: ${allOk ? "PASS" : "FAIL"} (${String(ladderRows.filter((r) => r.accepted).length)}/${String(ladderRows.length)} rung(s) ACCEPT, every control caught on every rung)`);
}

process.exit(allOk ? 0 : 1);

// ── negative controls on the landed bytes ─────────────────────────────────────

interface Control {
  readonly name: string;
  readonly board: Level;
  /**
   * The clauses that may legitimately be the one that NAMES the refusal, filled from
   * MEASUREMENT on the landed artifact (F-L16-3 / F-L20-4). A mutation aimed at a late
   * gate can be caught by a stronger, earlier reader (`rules`, `unsolvable`), so the rule
   * enforced is "the mutation is REJECTED, and the rejection names one of the clauses this
   * mutation may trip" — with the full reason string printed beside the verdict. A mutation
   * that is ACCEPTED fails the battery regardless of the list's width.
   */
  readonly expect: readonly string[];
  /**
   * The gate this control **targets**: asserted to be among the firing set. `expect` stays a
   * union (a mutation may legitimately be refused by a stronger, earlier reader — F-L20-4),
   * but a control battery whose gates were never *named* would be vacuous, so every family-`g`
   * control also asserts that its own gate fired.
   */
  readonly mustFire?: string;
  readonly view?: PocketView | null;
  readonly gview?: GView | null;
}

/**
 * The control battery: the six inherited mutations, the sealed-landing set (family `sl`),
 * and — for family `g` — **one control per new gate** plus the landing-device controls read
 * in the multi-pocket shape. Expectations are measured, never guessed.
 */
function controlTable(level: Level, rung: number, verdict: Verdict, gview: GView | null): Control[] {
  const switches = level.switches;
  const controls: Control[] = [
    {
      name: "latch removed (switches dropped)",
      board: { ...level, switches: [] },
      expect: rung >= 20 ? ["unsolvable"] : ["latch-grade", "par-stamped", "unsolvable"],
    },
    {
      name: "every switch muted (latch fully decorative)",
      board: { ...level, switches: switches.map((s) => ({ ...s, targets: [] })) },
      expect: ["validator", "unsolvable"],
    },
    {
      name: "goal sealed in both phases",
      board: { ...level, phaseAWalls: [...level.phaseAWalls, level.goal], phaseBWalls: [...level.phaseBWalls, level.goal] },
      expect: ["rules", "unsolvable"],
    },
    {
      name: "portal pair dropped (parity frame broken)",
      board: { ...level, portals: [] },
      expect: FAMILY === "g" ? ["unsolvable", "g0-portal-pair"] : ["unsolvable", "par-step"],
    },
    {
      name: "every switch retargeted to the first door",
      board: { ...level, switches: switches.map((s) => ({ ...s, targets: [switches[0]?.targets[0] ?? "d1"] })) },
      expect: ["unsolvable", "validator", "latch-route", "coverage"],
    },
    {
      name: "par mis-stamped (file par falls by 1)",
      board: { ...level, par: Math.max(1, level.par - 1) },
      expect: ["par-stamped"],
    },
  ];

  if (FAMILY === "g") {
    if (gview === null) {
      console.log("\nfamily-g controls (g0–g6): NOT APPLICABLE — the landed bytes do not describe a multi-pocket device.");
      return controls;
    }
    const landingDoor = gview.landingRoom.doorIds[0] as string;
    const goalDoor = gview.goalRoom.doorIds[0] as string;
    const landingSwitches = gview.landingRoom.switchIds;
    controls.push(
      {
        // g0 — a second opposite-parity portal pair on the same board: §6.2.3 item 1 says
        // "exactly one", and the derivation itself needs one end behind the (single) portal.
        name: "g0 control — a second portal pair added (§6.2.3 item 1: exactly one)",
        board: {
          ...level,
          portals: [...level.portals, { id: "p2", pair: [[1, 0], [3, 4]], activePhase: "A" }],
        },
        gview,
        mustFire: "g0-portal-pair",
        expect: [
          "g0-portal-pair", "validator", "par-stamped", "escalation", "act2-par-band", "act2-exec-band", "act-peak",
          "latch-grade", "latch-route", "g3-ordered-chain", "g4-switch-required", "g5-identity-broken",
        ],
      },
      {
        // g1 — the landing room's door dropped: the room becomes on-foot reachable once the
        // portal's frame is broken open by walking round through the freed tiles.
        name: `g1 control — the landing room's door "${landingDoor}" dropped (the room is no longer portal-only)`,
        board: { ...level, doors: level.doors.filter((d) => d.id !== landingDoor) },
        gview,
        mustFire: "g1-pocket-on-foot",
        expect: [
          "g1-pocket-on-foot", "g2-room-exit-door", "g6-room-structure", "g3-ordered-chain", "g5-identity-broken",
          "validator", "par-stamped", "act2-par-band", "act2-exec-band", "act-peak",
        ],
      },
      {
        // g2 — one boundary tile dropped from the landing room's door: a free leak in the
        // room's boundary (the seal is no longer one whole door object).
        name: `g2 control — one landing-room boundary tile dropped from door "${landingDoor}" (a free leak)`,
        board: { ...level, doors: level.doors.map((d) => (d.id === landingDoor ? { ...d, tiles: d.tiles.slice(1) } : d)) },
        gview,
        mustFire: "g2-room-exit-door",
        expect: [
          "g2-room-exit-door", "region", "g1-pocket-on-foot", "g3-ordered-chain", "g5-identity-broken",
          "par-stamped", "act2-par-band", "act2-exec-band", "act-peak",
        ],
      },
      {
        // g6 — the landing device removed entirely (its door AND its switch): the board stays
        // solvable, but the multi-pocket derivation collapses, so the STRUCTURE gate must be
        // the one that names it. No view override: the derivation is allowed to fail here,
        // because that failure IS the gate's subject.
        name: "g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses",
        board: {
          ...level,
          doors: level.doors.filter((d) => d.id !== landingDoor),
          switches: level.switches.filter((s) => !landingSwitches.includes(s.id)),
        },
        mustFire: "g6-room-structure",
        expect: ["g6-room-structure", "par-stamped", "act2-par-band", "act2-exec-band", "act-peak"],
      },
      {
        // g3 — the goal's seal door dropped: the chain loses its last press and the goal's
        // room is no longer sealed. The view is injected so every gate still measures a device.
        name: `g3 control — the goal's seal door "${goalDoor}" dropped (the chain loses a press)`,
        board: { ...level, doors: level.doors.filter((d) => d.id !== goalDoor) },
        gview,
        mustFire: "g3-ordered-chain",
        expect: [
          "g3-ordered-chain", "g2-room-exit-door", "g6-room-structure", "g5-identity-broken", "validator",
          "par-stamped", "escalation", "act2-par-band", "act2-exec-band", "act-peak",
        ],
      },
      {
        // g4 — every door and switch dropped: with nothing to press, the all-OFF world reaches
        // the goal, so the latch no longer carries existence.
        name: "g4 control — every door and switch dropped (existence stops needing any press)",
        board: { ...level, doors: [], switches: [] },
        gview,
        mustFire: "g4-switch-required",
        expect: [
          "g4-switch-required", "g1-pocket-on-foot", "g2-room-exit-door", "g6-room-structure", "g3-ordered-chain",
          "latch-grade", "latch-route", "par-stamped", "escalation", "act2-par-band", "act2-exec-band", "act2-b-band", "act-peak",
        ],
      },
      {
        // g5 — the identity-holding world: the landing device removed WITH the derived view
        // injected, so g5 measures the identity's value against the same device. The identity
        // then computes the mutated board's own par, so it no longer breaks it.
        name: "g5 control — the landing-device-removed world (the census identity holds again)",
        board: {
          ...level,
          doors: level.doors.filter((d) => d.id !== landingDoor),
          switches: level.switches.filter((s) => !landingSwitches.includes(s.id)),
        },
        gview,
        mustFire: "g5-identity-broken",
        expect: [
          "g5-identity-broken", "g1-pocket-on-foot", "g2-room-exit-door", "g6-room-structure", "g3-ordered-chain",
          "par-stamped", "act2-par-band", "act2-exec-band", "act-peak",
        ],
      },
    );
    return controls;
  }

  // ── family `sl`: one control per sealed-landing gate g1–g5 (rung ≥ 20) ──────
  if (rung >= 20) {
    const view = verdict.view;
    if (view === null) {
      console.log(
        "\nsealed-landing controls (g1–g5): NOT APPLICABLE — the landed bytes do not describe the pocket device " +
          "(see `pocket-derived` above), so there is no pocket to mutate.",
      );
      return controls;
    }
    const pocketDoorId = view.pocketDoor?.id ?? "-";
    controls.push(
      {
        name: "rung-20 control — `-rung`: par mis-stamped 19 under rung 20 (the derived rung is an equality)",
        board: { ...level, par: Math.max(1, level.par - 1) },
        expect: ["par-rung-exact", "par-stamped"],
      },
      {
        name: "F-L20-2 control — every switch dropped (the latch carries EXISTENCE: the named refusal is `unsolvable`)",
        board: { ...level, switches: [] },
        expect: ["unsolvable"],
      },
      {
        name: `g1 control — the pocket door "${pocketDoorId}" dropped (the pocket becomes on-foot reachable)`,
        board: { ...level, doors: level.doors.filter((d) => d.id !== pocketDoorId) },
        expect: ["g1-pocket-on-foot", "validator", "rules", "unsolvable"],
      },
      {
        name: `g2 control — one pocket-boundary tile dropped from door "${pocketDoorId}" (a free leak)`,
        board: { ...level, doors: level.doors.map((d) => (d.id === pocketDoorId ? { ...d, tiles: d.tiles.slice(1) } : d)) },
        expect: ["g2-pocket-exit-door", "g1-pocket-on-foot", "validator", "rules"],
      },
      {
        name: "g3 control — the goal's seal doors dropped (the press chain falls to the pocket press alone)",
        board: { ...level, doors: level.doors.filter((d) => d.id === pocketDoorId) },
        expect: ["g3-ordered-two-press", "g4-switch-required", "validator", "par-rung-exact"],
      },
      {
        name: "g4 control — every door and switch dropped (existence stops needing any press)",
        board: { ...level, doors: [], switches: [] },
        expect: ["g4-switch-required", "g1-pocket-on-foot", "latch-grade", "par-rung-exact", "validator"],
      },
      {
        name: "g5 control — the pocket-device-removed world (the census identity holds again)",
        board: {
          ...level,
          doors: level.doors.filter((d) => d.id !== pocketDoorId),
          switches: level.switches.filter((s) => !view.switchIds.includes(s.id)),
        },
        view,
        expect: ["g5-identity-broken", "g1-pocket-on-foot", "par-rung-exact", "validator"],
      },
    );
  }
  return controls;
}