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
 *      (`rung-plus-block-escalation`: `D_exec > BLOCK_L1619_TAIL_EXEC_CEILING` with
 *      `B` inside `BLOCK_L1619_B_BAND` — the rung must climb out of the *registered*
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
  BLOCK_L1619_B_BAND,
  BLOCK_L1619_IDS,
  BLOCK_L1619_TAIL_EXEC_CEILING,
  allOffShortestSolution,
  auditLevel,
  firingSwitches,
} from "@/core/solver/policy";

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
  /** The pocket derived from the landed bytes (rung ≥ 20 only), for printing. */
  readonly view: PocketView | null;
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
    if (BLOCK_L1619_IDS.includes(level.id)) continue;
    basis.push(level.id);
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, l15Par, n, basis };
}

/** The rung gates. `floor`/`l15Par` arrive measured; the board arrives from disk. */
function judge(level: Level, floor: number, l15Par: number, rung: number, viewOverride?: PocketView | null): Verdict {
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

  // ── rung ≥ 20: the block-escalation pair and the sealed-landing gates g1–g5 ──
  const extras: Gate[] = [];
  let view: PocketView | null = null;
  if (rung >= 20) {
    const dexec = diff.Dexec;
    const inBand = diff.B >= BLOCK_L1619_B_BAND[0] && diff.B <= BLOCK_L1619_B_BAND[1];
    extras.push({
      id: "rung-plus-block-escalation",
      ok: dexec !== null && dexec > BLOCK_L1619_TAIL_EXEC_CEILING && inBand,
      detail:
        `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} > block ceiling ${BLOCK_L1619_TAIL_EXEC_CEILING.toFixed(6)} ` +
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

// ── run ───────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(`prove-candidate — CUT re-measured from the shipped set: D_exec max = ${cut.floor.toFixed(6)} ` +
  `· par(L15) = ${String(cut.l15Par)} · ${String(cut.n)} shipped files · basis ids [${cut.basis.join(", ")}] ` +
  `(the L16–L19 ladder is excluded from its own filter — see measureCut)`);
console.log(`candidate ${CANDIDATE} · rung ${String(RUNG)}`);

const raw = JSON.parse(readFileSync(CANDIDATE, "utf8")) as unknown;
const parsed = LevelSchema.safeParse(raw);
if (!parsed.success) {
  console.log("SCHEMA: REJECT — the frozen zod schema refuses the file");
  process.exit(1);
}
const level = parsed.data as Level;
const verdict = judge(level, cut.floor, cut.l15Par, RUNG);
console.log(
  `\npar=${verdict.par === null ? "n/a" : String(verdict.par)} ` +
    `D_exec=${verdict.dexec === null ? "n/a" : verdict.dexec.toFixed(6)} ` +
    `B=${verdict.b === null ? "n/a" : verdict.b.toFixed(4)} ` +
    `(CUT ${cut.floor.toFixed(6)}, delta ${verdict.dexec === null ? "n/a" : (verdict.dexec - cut.floor).toFixed(6)})`,
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
const controls: { name: string; board: Level; expect: readonly string[]; view?: PocketView | null }[] = [
  // `expect` is a LIST of clauses that may legitimately be the one that names the
  // refusal, filled from MEASUREMENT on the landed artifact. Which clause fires
  // first is a property of the board's shape — a mutation aimed at a late gate can
  // be caught by a stronger, earlier reader (`rules`, `unsolvable`) — so the rule
  // the battery enforces is "the mutation is REJECTED, and the rejection names one
  // of the clauses this mutation may trip", with the full reason string printed.
  // A mutation that is ACCEPTED still fails the battery: it cannot be made vacuous
  // by widening this list.
  { name: "latch removed (switches dropped)", board: { ...level, switches: [] }, expect: ["latch-grade", "par-stamped", "unsolvable"] },
  {
    // `switch-without-targets` (policy.ts) must fire: the mirror of M1-alone. When
    // the muted latch also seals the goal, the BFS names it first.
    name: "every switch muted (latch fully decorative)",
    board: { ...level, switches: switches.map((s) => ({ ...s, targets: [] })) },
    expect: ["validator", "unsolvable"],
  },
  {
    name: "goal sealed in both phases",
    board: {
      ...level,
      phaseAWalls: [...level.phaseAWalls, level.goal],
      phaseBWalls: [...level.phaseBWalls, level.goal],
    },
    expect: ["rules", "unsolvable"],
  },
  {
    // With the portal gone the far region is unreachable at all, so existence
    // fails before par can: `unsolvable` is the honest name.
    name: "portal pair dropped (parity frame broken)",
    board: { ...level, portals: [] },
    expect: ["unsolvable", "par-step"],
  },
  {
    // Every switch on one door breaks "exactly one switch per door" (§1, L6–L35).
    // MEASURED, not guessed (F-L16-3): with all five switches moved onto `d1` the
    // board has no route to the goal at all — `d1` is a parity wall's door, so the
    // far region can no longer be opened — and the BFS names `unsolvable` first.
    // The name says "every", not "both": this board carries five switches.
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

// ── rung ≥ 20: one negative control per sealed-landing gate g1–g5 ─────────────
// Each mutation is *measured* before its `expect` list is written (F-L16-3): the
// list names the clauses that may legitimately be the first to refuse the mutation,
// and the whole reason string is printed beside the verdict.
let caught = 0;
if (RUNG >= 20) {
  const view = verdict.view;
  if (view === null) {
    console.log(
      "\nsealed-landing controls (g1–g5): NOT APPLICABLE — the landed bytes do not describe the pocket device " +
        "(see `pocket-derived` above), so there is no pocket to mutate.",
    );
  } else {
    const pocketDoor = view.pocketDoor;
    const pocketDoorId = pocketDoor?.id ?? "-";
    controls.push(
      {
        name: `g1 control — the pocket door "${pocketDoorId}" dropped (the pocket becomes on-foot reachable)`,
        board: { ...level, doors: level.doors.filter((d) => d.id !== pocketDoorId) },
        expect: ["g1-pocket-on-foot", "validator", "rules", "unsolvable"],
      },
      {
        name: `g2 control — one pocket-boundary tile dropped from door "${pocketDoorId}" (a free leak)`,
        board: {
          ...level,
          doors: level.doors.map((d) => (d.id === pocketDoorId ? { ...d, tiles: d.tiles.slice(1) } : d)),
        },
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
        // The identity-holding world of g5(b): the pocket device removed, the same
        // pocket VIEW injected (the mutation deletes the device, so the derivation
        // would otherwise have no landing to find) — this is the world in which the
        // census identity computes L20's par, so g5 must name it.
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
}
console.log("\nnegative controls on the landed bytes:");
for (const control of controls) {
  const v = judge(control.board, cut.floor, cut.l15Par, RUNG, control.view);
  const hit = !v.accepted && control.expect.some((e) => v.reason.includes(e));
  if (hit) caught += 1;
  console.log(
    `  ${hit ? "CAUGHT" : "MISSED"}  ${control.name} → ${v.reason}` +
      `  (expected a refusal naming one of: ${control.expect.join(", ")})`,
  );
}
console.log(`controls: ${String(caught)}/${String(controls.length)} caught by their named gate`);

const ok = verdict.accepted && caught === controls.length;
console.log(`\nRESULT: ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);