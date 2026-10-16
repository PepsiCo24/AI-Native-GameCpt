/**
 * `scripts/author-l16-candidates.ts` — LV-010/LV-010f: the **proposal side** for the
 * L16+ rungs, now a **rung-generic generator** (LV-010f graduated the L16-only tool:
 * the geometry, the grid and the seal arity are arguments with the historical L16–L18
 * defaults, so the commands recorded in `src/levels/README.md` §2e still reproduce,
 * and rung 19/20 reuses the very same code path instead of a copy of it).
 *
 * `docs/ai-native-pipeline.md` §1: LLM creates, the program proves. This file is
 * the program half, split in three deliberate stages:
 *
 *   0. **preflight law proof** — the parity/judging-phase rule the whole
 *      construction rests on, re-derived by the *program* from the shipped 15
 *      boards before a single candidate byte is authored:
 *
 *        entering a tile is judged in the phase the player already has, and on a
 *        portal-free board the entry phase of a tile is fixed for all move counts
 *
 *      Not quoted from `docs/level-design.md` §0 — asserted over every reachable
 *      state × every legal move of every shipped level.
 *
 *   1. **geometry census** (`--stage=a`) — the channel lattice: player (0,0),
 *      sealed column, opposite-colour portal pair, goal. Every combination is
 *      measured (par, coverage, §4) so the latch is designed against *numbers*.
 *
 *   2. **latch lattice** (`--stage=b`, default) — the ordered latch chain drawn
 *      from the far region's corridor band, filtered by the derived gate set and
 *      the escalation check (see {@link ladderGates}).
 *
 * Nothing here asserts solvability by opinion. `par` comes from the BFS solver
 * (`analyse`), the ladder gates come from the shipped readers, and a candidate
 * that fails is **dropped with its measurement** (ADR-0004) — there is no repair
 * path and no tuning loop.
 *
 * Determinism: fixed seed, no clock, no network. Only `--write` touches
 * `src/levels/candidates/**`.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, DoorDef, Level, Phase, SwitchDef } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute, movePath } from "@/core/solver/bfs";
import { applyMove, isLegalMove } from "@/core/rules";
import { DIRECTIONS, move } from "@/core/state/move";
import { analyseDifficulty } from "@/core/solver/difficulty";
import { allOffShortestSolution, auditLevel, firingSwitches } from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../src/levels/candidates/", import.meta.url));
const WRITE = process.argv.includes("--write");
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
const STAGE = argOf("stage") ?? "b";
/**
 * The rung this run authors. The **par target is derived from it**, never chosen:
 * `a19a347` proved on the isolated dataset that `Δpar ≥ 2` within the non-seam
 * block (L16–L25) and `par(L15) = 10` force `par(L16) = 12`, and that 12 is
 * admissible for *any* `B` in band while 11 is not. Rung `id = 15 + n` therefore
 * carries the derived target `10 + 2·n`.
 */
const LEVEL_ID = Number(argOf("id") ?? "16");
const GEO_LIMIT = Number(argOf("geos") ?? "4");
const CAP = Number(argOf("cap") ?? "40000");
const SEED = 20261016;

/**
 * **The grid.** `7×6` is the shipped block's shape and stays the default, so the
 * L16–L18 commands reproduce byte-for-byte. LV-010f made it an argument because the
 * rung-generic question "is this family exhausted at this par?" is a question about
 * `W×H` and the sealed column together, and answering it by editing a constant
 * would be an unmeasured claim.
 */
const W = Number(argOf("w") ?? "7");
const H = Number(argOf("h") ?? "6");

const x = (c: Coord): number => c[0];
const y = (c: Coord): number => c[1];
const at = (px: number, py: number): Coord => [px, py];
const parity = (c: Coord): number => (x(c) + y(c)) % 2;

// ─────────────────────────────────────────────────────────────────────────────
// 0. Preflight — the judging-phase law, asserted on the shipped set
// ─────────────────────────────────────────────────────────────────────────────

function shipped(): { file: string; level: Level }[] {
  return readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((file) => ({
      file,
      level: LevelSchema.parse(
        JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8")),
      ) as Level,
    }));
}

/**
 * Two claims, both machine-checked on every shipped board:
 *
 *  (a) **the entry decision is taken in the phase the player already has** — for
 *      every legal move, the destination is non-solid as seen in `s.phase`
 *      (`isLegalMove` is defined as `applyMove !== s`, so this is the same fact
 *      stated twice, and the point is that neither statement is re-derived here);
 *
 *  (b) **on a portal-free board the entry phase of every tile is fixed** — the
 *      amount of moves spent on arriving at a tile always has the same parity
 *      because the grid is bipartite and no edge (portal) has zero cost, so a
 *      wall solid in a tile's own entry phase refuses every approach on every
 *      move count. `ADR-0009` decision 1 is the reason portals are excluded: they
 *      are the sole parity-breaker, and the shipped block uses exactly that.
 */
function preflightLaw(): { boards: number; states: number; moves: number; bimodal: number } {
  let states = 0;
  let moves = 0;
  let bimodal = 0;
  for (const { file, level } of shipped()) {
    const graph = explore(level);
    states += graph.nodes.length;
    const start = graph.nodes[0];
    if (start === undefined) throw new Error(`${file}: empty reachable set`);
    const phases = new Map<string, Set<Phase>>();
    const add = (key: string, phase: Phase): void => {
      const set = phases.get(key) ?? new Set<Phase>();
      set.add(phase);
      phases.set(key, set);
    };
    add(coordKey([start.player.x, start.player.y] as Coord), start.phase);
    for (const s of graph.nodes) {
      for (const d of DIRECTIONS) {
        if (!isLegalMove(level, s, move(d))) continue;
        moves += 1;
        const next = applyMove(level, s, move(d));
        add(coordKey([next.player.x, next.player.y] as Coord), next.phase);
      }
    }
    if (level.portals.length === 0) {
      for (const [, set] of phases) if (set.size > 1) bimodal += 1;
    }
  }
  return { boards: shipped().length, states, moves, bimodal };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. The measured cut
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The escalation floor `D_exec(L15)`, **measured from the shipped board** — the
 * value `a19a347` re-attested as 14.969697, re-derived here so a re-authored L15
 * cannot leave the ladder silently stale. Nothing in this file is typed twice.
 */
function measureCut(): { floor: number; l15Par: number; bBand: readonly [number, number] } {
  let floor = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let bMin = Number.POSITIVE_INFINITY;
  let bMax = Number.NEGATIVE_INFINITY;
  for (const { level } of shipped()) {
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (d.B < bMin) bMin = d.B;
    if (d.B > bMax) bMax = d.B;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, l15Par, bBand: [bMin, bMax] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. The derived L16 ladder gates
// ─────────────────────────────────────────────────────────────────────────────

interface Gate {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

/**
 * The derived candidate gate set for an L16+ board. Each entry names the published
 * clause it reads and the shipped function that measures it; none is a new law.
 *
 *  E0 `region`      §4 acceptance region: `deadStates == 0` ∧ `noUnrecoverableOk`
 *                   ∧ `T ≡ R ≡ 0` (the identity that makes `D_exec = par + 3·B`).
 *  E1 `escalation`  §6.1.1 forward consequence: `D_exec >` the measured cut.
 /**
 *  E2 `par-step`    §6.1.1 P2: `par ≥ l15Par + 2·(id − 15)` (non-seam block ⇒ Δpar ≥ 2,
 *                   and the block-open's floor from `a19a347`). The gate is the
 *                   **step**; the minimal admissible value is taken in selection,
 *                   because the law bounds the step, not the board's length.
 *  E3 `latch-grade` ADR-design-0003 §5 / G1 through the shipped
 *                   `allOffShortestSolution`: the all-OFF world is at least one
 *                   move slower, or cannot finish at all (`null` — existence,
 *                   strictly stronger than ≥ 1).
 *  E4 `latch-route` G2: **every** par route presses a switch and afterwards stands
 *                   on a door that switch targets — the Aha is "the door opened",
 *                   not "I walked around".
 *  E5 `refused-beat`§3 (iii): the ordered reader `refusedBeforeEnteredTiles ≥ 1`.
 *  E6 `coverage`    the board is sized to the route, not padded:
 *                   `distinctPositions == w × h`.
 *  E7 `validator`   `validateLevel` ok, zero hard policy violations, exactly one
 *                   switch per door (§1, L6–L35), and every switch actually fires
 *                   (`firingSwitches`).
 *  E8 `well-formed` each door has ≥1 tile, each switch ≥1 target (the
 *                   `switch-without-targets` defect class, ADR-0009 decision 4).
 *
 * `B` is **reported, not gated**: §6.1.1's self-correcting guard asks for an
 * out-of-band `B` to be named and the ramp re-checked on `D_exec` directly, which
 * E1 already does — so a band excursion can neither be silently widened nor
 * silently pass.
 */
function ladderGates(
  level: Level,
  graph: ReachableGraph,
  cut: { floor: number; l15Par: number },
): readonly Gate[] {
  const audit = auditLevel(level, graph);
  const result = audit.result;
  const diff = audit.difficulty;
  const par = result.shortestSolution ?? level.par;
  const allOff = allOffShortestSolution(level, graph);
  const advantage = allOff === null ? null : allOff - par;
  const fired = firingSwitches(level, graph);

  const doorByTile = new Map<string, string>();
  for (const door of level.doors)
    for (const tile of door.tiles) doorByTile.set(coordKey(tile), door.id);
  const targetsBySwitch = new Map<string, readonly string[]>();
  for (const sw of level.switches) targetsBySwitch.set(sw.id, sw.targets);

  let routes = 0;
  let pressThenCross = 0;
  if (result.shortestSolution !== null) {
    forEachParRoute(level, result.shortestSolution, (route) => {
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
            const doorId = doorByTile.get(coordKey([later.state.player.x, later.state.player.y] as Coord));
            if (doorId !== undefined && targets.includes(doorId)) crossed = true;
          }
        }
      }
      if (crossed) pressThenCross += 1;
    });
  }

  const oneSwitchPerDoor = level.doors.every(
    (d) => level.switches.filter((s) => s.targets.includes(d.id)).length === 1,
  );
  const everySwitchFires = level.switches.every((s) => fired.has(s.id));
  const verdict = validateLevel(level);

  return [
    {
      id: "region",
      ok: result.deadStates === 0 && result.noUnrecoverableOk && diff.T === 0 && diff.R === 0,
      detail: `deadStates=${String(result.deadStates)} noUnrecoverableOk=${String(result.noUnrecoverableOk)} T=${String(diff.T)} R=${String(diff.R)}`,
    },
    {
      id: "escalation",
      ok: diff.Dexec !== null && diff.Dexec > cut.floor,
      detail: `D_exec=${diff.Dexec === null ? "n/a" : diff.Dexec.toFixed(6)} > cut ${cut.floor.toFixed(6)}`,
    },
    {
      id: "par-step",
      ok: par >= cut.l15Par + 2 * (level.id - 15),
      detail:
        `par=${String(par)} ≥ ${String(cut.l15Par + 2 * (level.id - 15))} ` +
        `(= l15Par ${String(cut.l15Par)} + 2·${String(level.id - 15)}; P2's step. The MINIMUM admissible par is ` +
        `the rung's rung-value and is chosen in selection, not gated: the law constrains the step, ` +
        `and a gate at equality would reject a legal board for being longer)`,
    },
    {
      id: "latch-grade",
      ok:
        level.switches.length > 0 &&
        level.doors.length > 0 &&
        (allOff === null || (advantage ?? 0) >= 1),
      detail: `allOffShortest=${allOff === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOff)} par=${String(par)} advantage=${advantage === null ? "n/a" : String(advantage)}`,
    },
    {
      id: "latch-route",
      ok: routes > 0 && pressThenCross === routes,
      detail: `shortest routes=${String(routes)}; press-then-cross on ${String(pressThenCross)}`,
    },
    {
      id: "refused-beat",
      ok: result.refusedBeforeEnteredTiles >= 1,
      detail: `refusedBeforeEnteredTiles=${String(result.refusedBeforeEnteredTiles)} [${result.refusedBeforeEnteredTileList.join(" ")}] unordered=${String(result.refusedThenEnteredTiles)}`,
    },
    {
      id: "coverage",
      ok: result.distinctPositions === level.width * level.height,
      detail: `distinctPositions=${String(result.distinctPositions)}/${String(level.width * level.height)}`,
    },
    {
      id: "validator",
      ok: verdict.ok && audit.violations.length === 0 && oneSwitchPerDoor && everySwitchFires,
      detail: `ok=${String(verdict.ok)} errors=${String(verdict.errors.length)} warnings=${String(verdict.warnings.length)} violations=${String(audit.violations.length)}[${audit.violations.map((v) => v.code).join(" ")}] one-switch-per-door=${String(oneSwitchPerDoor)} every-switch-fires=${String(everySwitchFires)}`,
    },
    {
      id: "well-formed",
      ok: level.doors.every((d) => d.tiles.length >= 1) && level.switches.every((s) => s.targets.length >= 1),
      detail: `doors=${String(level.doors.length)} switches=${String(level.switches.length)}`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Geometry — the channel
// ─────────────────────────────────────────────────────────────────────────────

const CX = Number(argOf("cx") ?? "3");
/**
 * **The seal arity window.** A "full seal" makes *every* neighbour of the goal a
 * door, so the door count is the goal's own geometry. On the shipped `7×6` with the
 * far region between the sealed column and the right edge the reachable arities are
 * 2 (goal in a corner) and 3 (goal against an edge); a goal strictly *inside* the far
 * region has 4. The window is an argument (default `2-3`, the inherited shape) and
 * the census reports what each arity actually yields — the arity is escalated by
 * moving the goal inward, never by typing a larger number into a door list.
 */
const SEAL = (() => {
  const raw = argOf("seal") ?? "2-3";
  const [lo, hi] = raw.split("-").map(Number);
  return { lo: lo ?? 2, hi: hi ?? lo ?? 2 };
})();
const PLAYER = at(0, 0);
const START_PHASE: Phase = "A";

const LEFT_TILES: readonly Coord[] = (() => {
  const out: Coord[] = [];
  for (let py = 0; py < H; py += 1) for (let px = 0; px < CX; px += 1) out.push(at(px, py));
  return out;
})();
const FAR_TILES: readonly Coord[] = (() => {
  const out: Coord[] = [];
  for (let py = 0; py < H; py += 1) for (let px = CX + 1; px < W; px += 1) out.push(at(px, py));
  return out;
})();

/**
 * The sealed column at `x = 4`, derived from the parity rule rather than typed:
 * with the player at `(0,0)` and `startPhase A`, tile `(4,y)` is entered in phase
 * A iff `4 + y` is odd, so a wall listed in its own entry phase refuses every
 * crossing attempt on every move count (a parity-dead wall is ordinary permanent
 * geometry — ADR-0009). The strip reaches those same tiles from the landing side,
 * where the portal has shifted the parity frame, which is what keeps board
 * coverage at 100 %.
 */
const COLUMN = (() => {
  const a: Coord[] = [];
  const b: Coord[] = [];
  for (let py = 0; py < H; py += 1) {
    const d = Math.abs(CX - x(PLAYER)) + Math.abs(py - y(PLAYER));
    const entry: Phase = d % 2 === 1 ? START_PHASE : START_PHASE === "A" ? "B" : "A";
    (entry === "A" ? a : b).push(at(CX, py));
  }
  return { a, b };
})();

interface Geo {
  readonly leftEnd: Coord;
  readonly rightEnd: Coord;
  readonly portalPhase: Phase;
  readonly goal: Coord;
}
const geoNote = (g: Geo): string =>
  `portal ${coordKey(g.leftEnd)}<>${coordKey(g.rightEnd)}/${g.portalPhase} goal=${coordKey(g.goal)}`;

function* geometries(): Generator<Geo> {
  for (const leftEnd of LEFT_TILES)
    for (const rightEnd of FAR_TILES) {
      // ADR-0009 decision 5: a same-parity pair can never break the
      // position↔phase link and is a hard validation error — not a candidate.
      if (parity(leftEnd) === parity(rightEnd)) continue;
      // A portal end on the spawn tile is legal but degenerate (the player is
      // teleported by their own first step back onto it); not selected here.
      if (coordKey(leftEnd) === coordKey(PLAYER) || coordKey(rightEnd) === coordKey(PLAYER)) continue;
      for (const portalPhase of ["A", "B"] as const)
        for (const goal of FAR_TILES) {
          if (goal === rightEnd) continue;
          yield { leftEnd, rightEnd, portalPhase, goal };
        }
    }
}

function lead(g: Geo, doors: readonly DoorDef[], switches: readonly SwitchDef[]): Omit<Level, "par"> {
  return {
    id: LEVEL_ID,
    width: W,
    height: H,
    startPhase: START_PHASE,
    player: PLAYER,
    goal: g.goal,
    phaseAWalls: COLUMN.a,
    phaseBWalls: COLUMN.b,
    doors,
    switches,
    portals: [{ id: "p1", pair: [g.leftEnd, g.rightEnd], activePhase: g.portalPhase }],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Judge
// ─────────────────────────────────────────────────────────────────────────────

interface Outcome {
  readonly accepted: boolean;
  readonly reason: string;
  readonly par?: number;
  readonly dexec?: number;
  readonly b?: number;
  readonly coverage?: string;
  readonly gates?: readonly Gate[];
}

function judge(
  draft: Omit<Level, "par">,
  cut: { floor: number; l15Par: number },
): { outcome: Outcome; level: Level | null } {
  const parsed = LevelSchema.safeParse({ ...draft, par: 1 });
  if (!parsed.success) return { outcome: { accepted: false, reason: "schema" }, level: null };
  const shape = validateLevel(parsed.data);
  if (!shape.ok) return { outcome: { accepted: false, reason: "rules" }, level: null };
  const level = parsed.data as Level;
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { outcome: { accepted: false, reason: "explosion" }, level: null };
  }
  const result = analyse(level, graph);
  if (!result.solvable) return { outcome: { accepted: false, reason: "unsolvable" }, level: null };
  const proven: Level = { ...level, par: result.shortestSolution as number };
  const gates = ladderGates(proven, graph, cut);
  const failed = gates.filter((g) => !g.ok);
  const diff = analyseDifficulty(proven, graph);
  return {
    outcome: {
      accepted: failed.length === 0,
      reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
      par: result.shortestSolution as number,
      dexec: diff.Dexec ?? Number.NaN,
      b: diff.B,
      coverage: `${String(result.distinctPositions)}/${String(level.width * level.height)}`,
      gates,
    },
    level: failed.length === 0 ? proven : null,
  };
}

/**
 * The measured entry-phase map of a bare board: tile → the phase(s) in which that
 * tile is entered by a legal move. On a portal-bearing board the far region is
 * usually single-phase (the portal fixes the arrival parity there) while the start
 * region is dual-phase — the per-tile resolution of `analyse`'s `dualPhaseTiles`.
 */
function bareEntryMap(level: Level, graph: ReachableGraph): Map<string, Set<Phase>> {
  const entered = new Map<string, Set<Phase>>();
  for (const s of graph.nodes)
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const n = applyMove(level, s, move(d));
      const key = coordKey([n.player.x, n.player.y] as Coord);
      const set = entered.get(key) ?? new Set<Phase>();
      set.add(s.phase);
      entered.set(key, set);
    }
  return entered;
}

/** The colour whose base is CLOSED in phase `p` — a door that refuses `p`. */
const closedIn = (p: Phase): DoorDef["color"] => (p === "A" ? "blue" : "red");

/**
 * **The proof of the artifact that actually lands.** Called by every stage that can
 * write, so a stage added later cannot ship a board that skipped it.
 *
 * `a19a347`'s pattern, one artifact further: the proof is re-run on the **bytes
 * that landed**, not on the in-memory object that produced them, and the gate
 * battery is then shown to **discriminate** — each surgical mutation of those same
 * bytes must be REJECTED by a NAMED gate. A battery that accepts everything proves
 * nothing (LV-009-B step 3 shape). A surviving mutation throws; it is never
 * reported as a warning.
 *
 * Selection (min `par` then min `D_exec`) stays in the write path beside the
 * census it selects from; this function only re-proves. The `D_exec` key exists
 * because `D_exec = par + 3·B` in-region and this construction measures `B`
 * **above** §5.2's band top 1.6875 — the §6.1.1 self-correcting guard's excursion
 * case. The excursion is *named, not widened*: the honest pick escalates on
 * `D_exec` while adding the least unmeasured `B`, where maximising `D_exec` would
 * chase depth through the one coordinate that left its measured band.
 */
function proveArtifact(file: string, cut: { floor: number; l15Par: number }): void {
  const landed = LevelSchema.parse(JSON.parse(readFileSync(file, "utf8"))) as Level;
  const positive = judge(landed, cut);
  console.log(
    `\nbyte re-read control: ${positive.outcome.accepted ? "ACCEPT" : "REJECT (" + positive.outcome.reason + ")"} ` +
      `par=${String(positive.outcome.par)} D_exec=${(positive.outcome.dexec ?? Number.NaN).toFixed(6)} ` +
      `gates=${String(positive.outcome.gates?.filter((g) => g.ok).length ?? 0)}/${String(positive.outcome.gates?.length ?? 0)} PASS`,
  );
  for (const g of positive.outcome.gates ?? [])
    console.log(`    ${g.ok ? "ok  " : "FAIL"} ${g.id.padEnd(13)} ${g.detail}`);
  if (!positive.outcome.accepted) throw new Error("the written artifact does not reproduce its own verdict");

  const others: readonly SwitchDef[] = landed.switches.map((s) => ({ ...s, targets: [] }));
  // ── Negative controls ──────────────────────────────────────────────────────
  //
  // Each `expect` below is the clause the mutation is **measured** to trip on the
  // landed artifact — not the clause the author guessed. The correctness rule is
  // that a mutation must be REJECTED and the rejection must name a clause; which
  // clause fires first is a property of this board's shape (a deeper mutation can
  // trip an earlier gate than the one it was aimed at), and the full reason string
  // is printed rather than collapsed to a boolean. Expectations that disagree with
  // measurement are corrected TO the measured name — the alternative would be to
  // loosen the battery until it agreed with a guess.
  const controls: readonly { name: string; board: Level; expect: string }[] = [
    {
      name: "latch removed (switches dropped)",
      board: { ...landed, switches: [] },
      expect: "unsolvable",
    },
    {
      name: "switch muted (s2 targets nothing)",
      board: {
        ...landed,
        switches: landed.switches.map((s, i) => (i === 1 ? { ...s, targets: [] } : s)),
      },
      expect: "well-formed",
    },
    {
      name: "every switch muted (latch fully decorative)",
      board: { ...landed, switches: others },
      expect: "unsolvable",
    },
    {
      name: "goal sealed in both phases",
      board: {
        ...landed,
        phaseAWalls: [...landed.phaseAWalls, landed.goal],
        phaseBWalls: [...landed.phaseBWalls, landed.goal],
      },
      expect: "rules",
    },
    {
      name: "portal pair dropped (parity frame broken)",
      board: { ...landed, portals: [] },
      expect: "unsolvable",
    },
    {
      name: "both switches retargeted to d1 (door d2 unmoved)",
      board: {
        ...landed,
        switches: landed.switches.map((s) => ({ ...s, targets: ["d1"] })),
      },
      expect: "validator",
    },
  ];
  let caught = 0;
  for (const control of controls) {
    const verdict = judge(control.board, cut);
    const named = verdict.outcome.reason;
    const hit = !verdict.outcome.accepted && named.includes(control.expect);
    if (hit) caught += 1;
    console.log(
      `  ${hit ? "CAUGHT" : "MISSED"}  ${control.name} → ${named}` +
        ` (expected a rejection naming "${control.expect}")`,
    );
  }
  console.log(`negative controls: ${String(caught)}/${String(controls.length)} caught by their named gate`);
  if (caught !== controls.length)
    throw new Error("a mutation of the shipped artifact survived the gate battery — the battery is vacuous here");
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

const cloneKeyOf = (level: Level): string => {
  const p = level.portals[0];
  return [
    coordKey(level.player),
    coordKey(level.goal),
    p === undefined ? "-" : coordKey(p.pair[0]),
    p === undefined ? "-" : coordKey(p.pair[1]),
  ].join("|");
};
/** §6.1.4 "never clone a shipped board" — the channel geometry triple. */
const usedGeometries = new Set<string>([
  ...shipped().map((s) => cloneKeyOf(s.level)),
  ...readdirSync(OUT_DIR)
    .filter((n) => n.endsWith(".json"))
    .map((n) => cloneKeyOf(LevelSchema.parse(JSON.parse(readFileSync(join(OUT_DIR, n), "utf8"))) as Level)),
]);

const pre = preflightLaw();
console.log("LV-010 — L16 candidate proposer (7×6, sealed column x=4, portal channel, far-region latch chain)");
console.log(
  `stage 0 preflight: ${String(pre.boards)} shipped boards · ${String(pre.states)} reachable states · ` +
    `${String(pre.moves)} legal moves walked · tiles observed in TWO phases on portal-free boards = ` +
    `${String(pre.bimodal)} (ADR-0009 decision 1: must be 0)`,
);
if (pre.bimodal !== 0) throw new Error("the judging-phase parity law does not hold on the shipped portal-free set");
const cut = measureCut();
console.log(
  `stage 0 cut (measured): D_exec(L15) = ${cut.floor.toFixed(6)} · l15Par = ${String(cut.l15Par)} · ` +
    `B band [${cut.bBand[0].toFixed(4)}, ${cut.bBand[1].toFixed(4)}]`,
);
console.log(`seed ${String(SEED)} · stage=${STAGE} · cap ${String(CAP)}\n`);

// ── stage A: the geometry census ────────────────────────────────────────────
interface GeoRow {
  readonly geo: Geo;
  readonly par: number;
  readonly coverage: string;
  readonly deadStates: number;
}
const rows: GeoRow[] = [];
for (const geo of geometries()) {
  const parsed = LevelSchema.safeParse({ ...lead(geo, [], []), par: 1 });
  if (!parsed.success) continue;
  if (!validateLevel(parsed.data).ok) continue;
  const level = parsed.data as Level;
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    continue;
  }
  const r = analyse(level, graph);
  if (!r.solvable || r.shortestSolution === null) continue;
  rows.push({
    geo,
    par: r.shortestSolution,
    coverage: `${String(r.distinctPositions)}/${String(level.width * level.height)}`,
    deadStates: r.deadStates,
  });
}
console.log(`stage A geometry census: ${String(rows.length)} solvable bare boards of ${String(W * H)} tiles`);
const byPar = new Map<number, number>();
for (const r of rows) byPar.set(r.par, (byPar.get(r.par) ?? 0) + 1);
console.log(
  `  bare par histogram: ${[...byPar.entries()].sort((a, b) => a[0] - b[0]).map(([p, n]) => `par ${String(p)}:${String(n)}`).join("  ")}`,
);
const clean = rows
  .filter((r) => r.coverage === `${String(W * H)}/${String(W * H)}` && r.deadStates === 0)
  .sort((a, b) => a.par - b.par || coordKey(a.geo.goal).localeCompare(coordKey(b.geo.goal)));
console.log(
  `  full-coverage, dead-state-free: ${String(clean.length)} (par min ${String(clean[0]?.par ?? 0)}, max ${String(clean[clean.length - 1]?.par ?? 0)})`,
);
console.log("  first 24 clean geometries (the ladder a latch chain can be built on):");
for (const r of clean.slice(0, 24))
  console.log(`    par ${String(r.par)}  ${geoNote(r.geo)}`);

if (STAGE === "map") {
  // ── the frame map: the measured entry phase of every strip tile, plus the
  //    bare shortest trace. Design input, not a claim: it comes from the same
  //    `explore`/`applyMove` pair the solver uses.
  const seedIdx = Number(argOf("seed") ?? "0");
  const row = (clean.filter((r) => r.par >= 8 && r.par <= 12)[seedIdx] ?? clean[seedIdx]);
  if (row === undefined) throw new Error("no geometry to map");
  const level = LevelSchema.parse({ ...lead(row.geo, [], []), par: 1 }) as Level;
  const graph = explore(level);
  const r = analyse(level, graph);
  const entered = new Map<string, Set<Phase>>();
  for (const s of graph.nodes)
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const n = applyMove(level, s, move(d));
      const key = coordKey([n.player.x, n.player.y] as Coord);
      const set = entered.get(key) ?? new Set<Phase>();
      set.add(s.phase);
      entered.set(key, set);
    }
  console.log(`\nstage M — frame map for ${geoNote(row.geo)} (bare par ${String(r.shortestSolution)})`);
  console.log(
    `  reachableStates=${String(r.reachableStates)} distinctPositions=${String(r.distinctPositions)}/${String(W * H)} ` +
      `dualPhaseTiles=${String(r.dualPhaseTiles)} [${r.dualPhaseTileList.join(" ")}] deadStates=${String(r.deadStates)}`,
  );
  console.log("  entry phase per tile (row = y, col = x; '.' = in the sealed column or left region):");
  for (let py = 0; py < H; py += 1) {
    const line: string[] = [];
    for (let px = 0; px < W; px += 1) {
      if (px <= CX) {
        line.push(" . ");
        continue;
      }
      const set = entered.get(coordKey([px, py] as Coord));
      const label = set === undefined ? "??" : [...set].sort().join("");
      line.push(label.padStart(2, " ").padEnd(3, " "));
    }
    console.log(`    y=${String(py)} ${line.join("")}`);
  }
  console.log("  bare shortest trace:");
  const goalIdx = graph.nodes.findIndex(
    (s) => s.player.x === x(row.geo.goal) && s.player.y === y(row.geo.goal),
  );
  const path = goalIdx < 0 ? [] : movePath(graph, goalIdx);
  console.log(`    ${path.join(",")}`);
} else if (STAGE === "c") {
  // ── stage C: the DIRECTED lattice ─────────────────────────────────────────
  //
  // The blind lattice spent its cap before reaching a board that both gates and
  // reads as the §5 intent, so this stage encodes the intent as a constraint
  // instead of hoping to stumble on it:
  //
  //   `docs/level-design.md` §5 (L16–L25): multi-door, **chained** switches,
  //   2-step lookahead. On the shipped device that is a single reading — the goal
  //   lies directly down the landing's column (so the route between them is a line
  //   and a door on that line is unavoidable, which is what makes E4 satisfiable at
  //   all), and along that line the four objects appear in the order
  //
  //       s1 → d1 → s2 → d2
  //
  //   with `s2` **behind** `d1`: opening `d1` is what exposes the second switch.
  //   Each switch is also allowed one column off the line, which is where a
  //   deliberate press (and therefore a real decision, not an automatic one) lives.
  //
  // Everything else is still measured by the same `judge`: the colours and switch
  // phases come from `bareEntryMap`, `par` comes from BFS, and the gate chain
  // decides. The intent picks the *lattice*; the program picks the *board*.
  const lineGoals: GeoRow[] = [];
  for (const geo of geometries()) {
    if (x(geo.goal) !== x(geo.rightEnd)) continue;
    const span = Math.abs(y(geo.goal) - y(geo.rightEnd));
    if (span < 4 || span > H - 1) continue;
    const parsed = LevelSchema.safeParse({ ...lead(geo, [], []), par: 1 });
    if (!parsed.success || !validateLevel(parsed.data).ok) continue;
    let graph: ReachableGraph;
    try {
      graph = explore(parsed.data as Level);
    } catch {
      continue;
    }
    const r = analyse(parsed.data as Level, graph);
    if (!r.solvable || r.shortestSolution === null) continue;
    if (r.distinctPositions !== W * H || r.deadStates !== 0) continue;
    lineGoals.push({ geo, par: r.shortestSolution, coverage: `${String(r.distinctPositions)}/${String(W * H)}`, deadStates: 0 });
  }
  console.log(`\nstage C directed lattice: ${String(lineGoals.length)} line geometry(ies) (goal directly down the landing column)`);
  const histogram = new Map<string, number>();
  const accepts: { note: string; level: Level; dexec: number }[] = [];
  const misses: { reason: string; note: string; par: number; dexec: number; b: number }[] = [];
  let total = 0;
  for (const row of lineGoals) {
    const bare = LevelSchema.parse({ ...lead(row.geo, [], []), par: 1 }) as Level;
    const entry = bareEntryMap(bare, explore(bare));
    const phaseAt = (t: Coord): Phase | null => {
      const set = entry.get(coordKey(t));
      return set !== undefined && set.size === 1 ? ([...set][0] as Phase) : null;
    };
    const y0 = y(row.geo.rightEnd);
    const y1 = y(row.geo.goal);
    const step = y1 > y0 ? 1 : -1;
    const line: Coord[] = [];
    for (let py = y0 + step; py !== y1; py += step) line.push(at(x(row.geo.goal), py));
    // every slot must be single-phase or the derived colour/phase is not decidable
    if (line.some((t) => phaseAt(t) === null)) continue;
    const offLine = (t: Coord, dx: number): Coord => at(x(t) + dx, y(t));
    for (let a = 0; a < line.length; a += 1)
      for (let b = 0; b < line.length; b += 1)
        for (let c = 0; c < line.length; c += 1)
          for (let d = 0; d < line.length; d += 1) {
            // the order along the line is s1 < d1 < s2 < d2 — `s2` behind `d1`
            if (!(a < b && b < c && c < d)) continue;
            for (const dx1 of [-1, 0, 1])
              for (const dx2 of [-1, 0, 1]) {
                const s1Tile = dx1 === 0 ? (line[a] as Coord) : offLine(line[a] as Coord, dx1);
                const s2Tile = dx2 === 0 ? (line[c] as Coord) : offLine(line[c] as Coord, dx2);
                if (x(s1Tile) < CX + 1 || x(s1Tile) > W - 1) continue;
                if (x(s2Tile) < CX + 1 || x(s2Tile) > W - 1) continue;
                const p1 = phaseAt(s1Tile);
                const p2 = phaseAt(s2Tile);
                const d1Tile = line[b] as Coord;
                const d2Tile = line[d] as Coord;
                if (p1 === null || p2 === null) continue;
                if (s1Tile === s2Tile) continue;
                total += 1;
                const doors: DoorDef[] = [
                  { id: "d1", color: closedIn(phaseAt(d1Tile) as Phase), tiles: [d1Tile] },
                  { id: "d2", color: closedIn(phaseAt(d2Tile) as Phase), tiles: [d2Tile] },
                ];
                const switches: SwitchDef[] = [
                  { id: "s1", tile: s1Tile, activePhase: p1, targets: ["d1"] },
                  { id: "s2", tile: s2Tile, activePhase: p2, targets: ["d2"] },
                ];
                const note =
                  `${geoNote(row.geo)} · chain s1=${coordKey(s1Tile)}/${p1} → d1=${coordKey(d1Tile)}/${closedIn(phaseAt(d1Tile) as Phase)} ` +
                  `→ s2=${coordKey(s2Tile)}/${p2} → d2=${coordKey(d2Tile)}/${closedIn(phaseAt(d2Tile) as Phase)}`;
                const { outcome, level } = judge(lead(row.geo, doors, switches), cut);
                if (!outcome.accepted || level === null) {
                  histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
                  if (outcome.par !== undefined)
                    misses.push({ reason: outcome.reason, note, par: outcome.par, dexec: outcome.dexec ?? Number.NaN, b: outcome.b ?? Number.NaN });
                  continue;
                }
                accepts.push({ note, level, dexec: outcome.dexec ?? Number.NaN });
                console.log(
                  `  ACCEPT  ${note}\n          par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} ` +
                    `(cut +${((outcome.dexec ?? 0) - cut.floor).toFixed(6)}) B=${(outcome.b ?? 0).toFixed(4)} coverage=${String(outcome.coverage)} barePar=${String(row.par)}`,
                );
              }
          }
  }
  console.log(`\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} directed candidate(s)`);
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((x, y) => y[1] - x[1]))
    console.log(`  ${k}: ${String(v)}`);
  const nearMiss = misses
    .sort((a, b) => b.par - a.par || b.dexec - a.dexec)
    .slice(0, 8);
  console.log(`near-miss (top ${String(nearMiss.length)} of ${String(misses.length)}):`);
  for (const m of nearMiss)
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
  // The on-rung near-misses: par == the derived target but a gate still says no.
  // Printed in full (they are the ones a wrong law would have accepted) with the
  // failing gate names, so the gap between "the rung is right" and "the board is
  // acceptable" is visible instead of inferred.
  const onRung = misses.filter((m) => m.par === cut.l15Par + 2);
  console.log(`on-rung rejections (par === ${String(cut.l15Par + 2)}): ${String(onRung.length)}`);
  for (const m of onRung.slice(0, 12))
    console.log(`  [${m.reason}] B=${m.b.toFixed(4)}\n    ${m.note}`);
  if (WRITE && accepts.length > 0) {
    mkdirSync(OUT_DIR, { recursive: true });
    const chosen = accepts.reduce((a, b) => {
      const pa = a.level.par ?? 0;
      const pb = b.level.par ?? 0;
      if (pb !== pa) return pb < pa ? b : a;
      return b.dexec < a.dexec ? b : a;
    });
    const file = join(OUT_DIR, `l${String(chosen.level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(chosen.level, null, 2)}\n`);
    console.log(
      `\nselection (min par, then min D_exec) of ${String(accepts.length)} accept(s): ` +
        `par=${String(chosen.level.par)} D_exec=${chosen.dexec.toFixed(6)} (cut +${(chosen.dexec - cut.floor).toFixed(6)})`,
    );
    console.log(`wrote ${file}\n  ${chosen.note}`);
    proveArtifact(file, cut);
  }
}
if (STAGE === "verify" || STAGE === "v") {
  // ── stage V: re-read the WRITTEN artifact and re-run the whole chain ───────
  //
  // The only stage that judges bytes on disk rather than objects in memory: schema
  // → rule gate → BFS → the derived gate chain, on `src/levels/candidates/*.json`.
  // This is what the commit body quotes, so a hand-edited file cannot inherit an
  // earlier in-memory verdict.
  const files = readdirSync(OUT_DIR).filter((n) => n.endsWith(".json")).sort();
  console.log(`\nstage V — re-verification of ${String(files.length)} written candidate(s) in src/levels/candidates/`);
  for (const file of files) {
    const path = join(OUT_DIR, file);
    const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
    console.log(`\n── ${file}`);
    const parsed = LevelSchema.safeParse(raw);
    if (!parsed.success) {
      console.log(`  SCHEMA REJECT — ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
      continue;
    }
    const level = parsed.data as Level;
    const shape = validateLevel(raw);
    console.log(
      `  level: ${String(level.width)}×${String(level.height)} player=${coordKey(level.player)} goal=${coordKey(level.goal)} ` +
        `phase walls=${String(level.phaseAWalls.length)}+${String(level.phaseBWalls.length)} doors=${String(level.doors.length)} ` +
        `switches=${String(level.switches.length)} portals=${String(level.portals.length)} par(declared)=${String(level.par)}`,
    );
    console.log(
      `  validateLevel: ok=${String(shape.ok)} errors=${String(shape.errors.length)} warnings=${String(shape.warnings.length)}`,
    );
    for (const w of shape.warnings) console.log(`    warn: ${w.slice(0, 160)}`);
    const graph = explore(level);
    const result = analyse(level, graph);
    const diff = analyseDifficulty(level, graph);
    const allOff = allOffShortestSolution(level, graph);
    console.log(
      `  BFS: reachableStates=${String(result.reachableStates)} distinctPositions=${String(result.distinctPositions)}/${String(level.width * level.height)} ` +
        `shortest=${String(result.shortestSolution)} maxDepth=${String(result.maxDepth)} deadStates=${String(result.deadStates)}`,
    );
    console.log(
      `  metrics: dualPhaseTiles=${String(result.dualPhaseTiles)} refusedThenEntered=${String(result.refusedThenEnteredTiles)} ` +
        `refusedBeforeEntered=${String(result.refusedBeforeEnteredTiles)} [${result.refusedBeforeEnteredTileList.join(" ")}]`,
    );
    console.log(
      `  difficulty: L=${String(diff.L)} B=${diff.B.toFixed(6)} T=${String(diff.T)} R=${String(diff.R)} M=${String(diff.M)} ` +
        `D=${diff.D === null ? "n/a" : diff.D.toFixed(6)} D_exec=${diff.Dexec === null ? "n/a" : diff.Dexec.toFixed(6)} ` +
        `(cut ${cut.floor.toFixed(6)}, delta ${diff.Dexec === null ? "n/a" : (diff.Dexec - cut.floor).toFixed(6)})`,
    );
    console.log(
      `  all-OFF: shortest=${allOff === null ? "null (UNSATISFIABLE)" : String(allOff)} advantage=${allOff === null ? "n/a" : String(allOff - (result.shortestSolution ?? 0))} ` +
        `switchRequired=${String(auditLevel(level, graph).allOffGoalReachable === false)}`,
    );
    const gates = ladderGates(level, graph, cut);
    for (const g of gates) console.log(`  ${g.ok ? "PASS" : "FAIL"} ${g.id.padEnd(13, " ")} ${g.detail}`);
    const goalIdx = graph.nodes.findIndex((s) => s.player.x === x(level.goal) && s.player.y === y(level.goal));
    const path2 = goalIdx < 0 ? [] : movePath(graph, goalIdx);
    console.log(`  bare-name trace: ${path2.join(",")}`);
    console.log(`  VERDICT: ${gates.every((g) => g.ok) ? "ACCEPT (all gates PASS)" : "REJECT — " + gates.filter((g) => !g.ok).map((g) => g.id).join("+")}`);
  }
} else if (STAGE === "d") {
  // ── stage D: the goal-gated shape ─────────────────────────────────────────
  //
  // Stage C's on-line chain turns out to be **automatic**: the switches sit on the
  // landing→goal line, so walking fires them and the doors are already open by the
  // time the player arrives. `latch-route` accepts it (every par route does press
  // and then cross), but no decision is ever made — the §5 intent ("2-step
  // lookahead") is not delivered by a board the player cannot get wrong.
  //
  // This stage encodes the alternative reading of the same published vocabulary:
  // **both doors are gates on the goal itself** (its neighbours), so
  //
  //   • the goal is unreachable until a switch has been pressed at all, which makes
  //     the all-OFF world UNSATISFIABLE rather than merely slower (E3 existence);
  //   • a press costs a real detour (the switches are drawn from the whole far
  //     region, not from the line), so the rung's Δpar comes from a decision;
  //   • every approach to the goal crosses a door, which is what makes E4 hold for
  //     *all* par routes instead of only for the line.
  //
  // The lattice is small on purpose: the door pair is drawn from the goal's own
  // neighbour set (a corner goal has exactly two, so the pair is forced), and the
  // switch pair from the far region minus those tiles.
  const gateGeos: GeoRow[] = [];
  // The rung target is derived, not chosen: `l15Par + 2·(id − 15)`. Each press in
  // the goal-gated shape costs 2 moves, so the bare route must be the target
  // itself or short by 2 or 4 — anything else cannot land on the rung.
  const target = cut.l15Par + 2 * (LEVEL_ID - 15);
  // How far below the rung's target the BARE route may sit. The lattice adds the
  // press detour, so `par − bare` is `Δpar`; `docs/level-design.md` §6.1.1's step law
  // bounds the *step* between rungs, not this gap, so the gap is an enumeration
  // bound that must be reported rather than a law that may be assumed. The inherited
  // value 4 encoded "each press costs 2 moves", which L17/L18 measured at 4 for a
  // single press; `--drop` widens it and the census prints what each setting yields.
  const DROP = Number(argOf("drop") ?? "4");
  const window: number[] = [];
  for (let k = 0; k <= DROP; k += 2) window.push(target - k);
  for (const geo of geometries()) {
    // The seal arity is the goal's own geometry (`goalNeighbours` below), so a
    // geometry whose arity is outside the window cannot be a member of this family
    // and is dropped before any solver run.
    const arity = FAR_TILES.filter(
      (t) => Math.abs(x(t) - x(geo.goal)) + Math.abs(y(t) - y(geo.goal)) === 1,
    ).length;
    if (arity < SEAL.lo || arity > SEAL.hi) continue;
    const parsed = LevelSchema.safeParse({ ...lead(geo, [], []), par: 1 });
    if (!parsed.success || !validateLevel(parsed.data).ok) continue;
    let graph: ReachableGraph;
    try {
      graph = explore(parsed.data as Level);
    } catch {
      continue;
    }
    const r = analyse(parsed.data as Level, graph);
    if (!r.solvable || r.shortestSolution === null) continue;
    if (r.distinctPositions !== W * H || r.deadStates !== 0) continue;
    if (!window.includes(r.shortestSolution)) continue;
    // §6.1.4 "never clone a shipped board": a geometry whose spawn/goal/portal
    // triple already exists in the shipped set or among the committed candidates
    // is skipped, whatever its latch lattice looks like.
    const cloneKey = [coordKey(PLAYER), coordKey(geo.goal), coordKey(geo.leftEnd), coordKey(geo.rightEnd)].join("|");
    if (usedGeometries.has(cloneKey)) continue;
    usedGeometries.add(cloneKey);
    gateGeos.push({ geo, par: r.shortestSolution, coverage: `${String(r.distinctPositions)}/${String(W * H)}`, deadStates: 0 });
  }
  console.log(
    `\nstage D goal-gated lattice: ${String(gateGeos.length)} geometry(ies) with bare par in ` +
      `{${window.map(String).join(",")}} · seal arity ${String(SEAL.lo)}-${String(SEAL.hi)} · grid ${String(W)}×${String(H)}`,
  );
  const geosCap = Number(argOf("geos") ?? "40");
  const geoOffset = Number(argOf("geo") ?? "0");
  const geoList = gateGeos.slice(geoOffset, geoOffset + geosCap);
  // The geometry set is printed with its index: the enumeration is deterministic but
  // the *slice* the run consumed is not visible from the accepts alone, and a census
  // that hides which rows it read is not a census. `--geo`/`--geos` therefore select a
  // published range rather than silently taking the head.
  for (let i = 0; i < geoList.length; i += 1)
    console.log(`  geo[${String(geoOffset + i)}] barePar=${String((geoList[i] as GeoRow).par)}  ${geoNote((geoList[i] as GeoRow).geo)}`);
  gateGeos.length = 0;
  gateGeos.push(...geoList);
  const histogram = new Map<string, number>();
  /** Every judged candidate's measured `par` — the family's reachable-`par` census. */
  const parHist = new Map<number, number>();
  const accepts: { note: string; level: Level; dexec: number }[] = [];
  const misses: { reason: string; note: string; par: number; dexec: number; b: number }[] = [];
  let total = 0;
  /** Ordered switch n-tuples examined per geometry — sampling, and the cap is printed. */
  const swCap = Number(argOf("swcap") ?? "1500");
  for (const row of gateGeos) {
    let tried = 0;
    const bare = LevelSchema.parse({ ...lead(row.geo, [], []), par: 1 }) as Level;
    const entry = bareEntryMap(bare, explore(bare));
    const phaseAt = (t: Coord): Phase | null => {
      const set = entry.get(coordKey(t));
      return set !== undefined && set.size === 1 ? ([...set][0] as Phase) : null;
    };
    // the goal's neighbours inside the far region — the candidate door tiles
    const goalNeighbours = FAR_TILES.filter(
      (t) => Math.abs(x(t) - x(row.geo.goal)) + Math.abs(y(t) - y(row.geo.goal)) === 1,
    );
    const switchTiles = FAR_TILES.filter((t) => t !== row.geo.goal);
    // ── A FULL SEAL: every neighbour of the goal is a door ────────────────────
    //
    // The door count is therefore the goal's own geometry, not an axis the author
    // dials: a corner goal has n = 2 neighbours, a goal against one edge has n = 3.
    // That is what makes this beat escalatable by moving the goal INWARD instead of
    // by lengthening a walk — and why the enumeration below is over the switch
    // n-tuples only: the doors are forced, the switches are chosen.
    //
    // (`E4` `latch-route` is what makes the full seal necessary rather than
    // optional: it asks that *every* par route press a switch and then cross a door
    // it targets, so one free approach to the goal would fail it.)
    if (goalNeighbours.length < SEAL.lo || goalNeighbours.length > SEAL.hi) continue;
    if (goalNeighbours.some((t) => phaseAt(t) === null)) continue;
    const n = goalNeighbours.length;
    const doors: DoorDef[] = goalNeighbours.map((t, i) => ({
      id: `d${String(i + 1)}`,
      color: closedIn(phaseAt(t) as Phase),
      tiles: [t],
    }));
    const pool = switchTiles.filter((t) => !goalNeighbours.includes(t) && phaseAt(t) !== null);
    const picks: number[] = [];
    const visit = (): void => {
      if (tried >= swCap) return;
      if (picks.length < n) {
        for (let i = 0; i < pool.length; i += 1) {
          if (picks.includes(i)) continue;
          picks.push(i);
          visit();
          picks.pop();
          if (tried >= swCap) return;
        }
        return;
      }
      tried += 1;
      total += 1;
      const swTiles = picks.map((i) => pool[i] as Coord);
      const switches: SwitchDef[] = swTiles.map((t, i) => ({
        id: `s${String(i + 1)}`,
        tile: t,
        activePhase: phaseAt(t) as Phase,
        targets: [`d${String(i + 1)}`],
      }));
      const note =
        `${geoNote(row.geo)} · seal(${String(n)}) ` +
        doors.map((d) => `${d.id}=${coordKey(d.tiles[0] as Coord)}/${d.color}`).join(" ") +
        " · " +
        switches.map((s) => `${s.id}=${coordKey(s.tile)}/${s.activePhase}`).join(" ");
      const { outcome, level } = judge(lead(row.geo, doors, switches), cut);
      if (outcome.par !== undefined) parHist.set(outcome.par, (parHist.get(outcome.par) ?? 0) + 1);
      if (!outcome.accepted || level === null) {
        histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
        if (outcome.par !== undefined)
          misses.push({ reason: outcome.reason, note, par: outcome.par, dexec: outcome.dexec ?? Number.NaN, b: outcome.b ?? Number.NaN });
        return;
      }
      accepts.push({ note, level, dexec: outcome.dexec ?? Number.NaN });
      console.log(
        `  ACCEPT  ${note}\n          par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} ` +
          `(cut +${((outcome.dexec ?? 0) - cut.floor).toFixed(6)}) B=${(outcome.b ?? 0).toFixed(4)} coverage=${String(outcome.coverage)} barePar=${String(row.par)}`,
      );
    };
    visit();
  }
  console.log(`\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} goal-gated candidate(s)`);
  console.log(
    `measured par census of the judged space: ${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([p, c]) => `${String(p)}:${String(c)}`).join(" ") || "(none)"}`,
  );
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((x, y) => y[1] - x[1]))
    console.log(`  ${k}: ${String(v)}`);
  const onRungD = misses.filter((m) => m.par === target);
  console.log(`rung-target rejections (par === ${String(target)}): ${String(onRungD.length)}`);
  for (const m of onRungD.slice(0, 10))
    console.log(`  [${m.reason}] B=${m.b.toFixed(4)}\n    ${m.note}`);
  // ── the rung pin: an accept whose par is not the rung's derived target ──────
  //
  // E2 (`par ≥ l15Par + 2·(id − 15)`) is the published law and it constrains the
  // *step*, so a longer board is legal. The rung is a stronger, authored obligation:
  // rung `id` carries `par = l15Par + 2·(id − 15)` exactly. An accept above the rung
  // is therefore a **reported selection rejection** with its measurement, never a
  // silent widening of the rung — the same discipline E1 applies to the `B` band.
  const onTarget = accepts.filter((a) => a.level.par === target);
  const aboveRung = accepts.filter((a) => (a.level.par ?? 0) > target);
  console.log(
    `\nrung pin: par === ${String(target)} on ${String(onTarget.length)} of ${String(accepts.length)} accept(s); ` +
      `over-rung accepts = ${String(aboveRung.length)} (named and dropped, not written)`,
  );
  for (const a of aboveRung.slice(0, 5))
    console.log(`  over-rung par=${String(a.level.par)} D_exec=${a.dexec.toFixed(6)} B=?  ${a.note}`);
  if (WRITE && onTarget.length > 0) {
    mkdirSync(OUT_DIR, { recursive: true });
    const chosen = onTarget.reduce((a, b) => (b.dexec < a.dexec ? b : a));
    const file = join(OUT_DIR, `l${String(chosen.level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(chosen.level, null, 2)}\n`);
    console.log(
      `\nselection (min par, then min D_exec) of ${String(accepts.length)} accept(s): ` +
        `par=${String(chosen.level.par)} D_exec=${chosen.dexec.toFixed(6)} (cut +${(chosen.dexec - cut.floor).toFixed(6)})`,
    );
    console.log(`wrote ${file}\n  ${chosen.note}`);
    proveArtifact(file, cut);
  }
} else if (STAGE === "f") {
  // ── stage F: the FAMILY census ─────────────────────────────────────────────
  //
  // The rung question is "which geometry family can carry par N?", and the
  // inherited answer for L16–L18 was a census of exactly one family. This stage
  // measures the alternatives in the same terms — bare par histogram, full-coverage
  // count, and how many geometries land inside the rung's derived bare-par window —
  // so a family is chosen by a number and an exhausted family is *reported*, not
  // assumed. It writes nothing.
  //
  // The rows are the same objects stage D enumerates; only the grouping differs.
  const targetF = cut.l15Par + 2 * (LEVEL_ID - 15);
  const windowF = [targetF, targetF - 2, targetF - 4];
  interface FamRow {
    readonly cx: number;
    readonly arity: number;
    readonly bare: number;
    readonly solvable: boolean;
    readonly full: boolean;
    readonly clean: boolean;
  }
  const fam: FamRow[] = [];
  for (const cx of (argOf("cxs") ?? "2,3,4").split(",").map(Number)) {
    const left: Coord[] = [];
    for (let py = 0; py < H; py += 1) for (let px = 0; px < cx; px += 1) left.push(at(px, py));
    const far: Coord[] = [];
    for (let py = 0; py < H; py += 1) for (let px = cx + 1; px < W; px += 1) far.push(at(px, py));
    // The sealed column is `x = cx` itself, split by entry phase exactly as the
    // inherited `COLUMN` derivation does for the authoring `CX`.
    const colA: Coord[] = [];
    const colB: Coord[] = [];
    for (let py = 0; py < H; py += 1) {
      const entry: Phase = (cx + py) % 2 === 1 ? START_PHASE : START_PHASE === "A" ? "B" : "A";
      (entry === "A" ? colA : colB).push(at(cx, py));
    }
    if (left.length === 0 || far.length === 0 || cx >= W) continue;
    for (const leftEnd of left)
      for (const rightEnd of far) {
        if (parity(leftEnd) === parity(rightEnd)) continue;
        if (coordKey(leftEnd) === coordKey(PLAYER) || coordKey(rightEnd) === coordKey(PLAYER)) continue;
        for (const portalPhase of ["A", "B"] as const)
          for (const goal of far) {
            if (goal === rightEnd) continue;
            const arity = far.filter(
              (t) => Math.abs(x(t) - x(goal)) + Math.abs(y(t) - y(goal)) === 1,
            ).length;
            if (arity < SEAL.lo || arity > SEAL.hi) continue;
            const draft: Omit<Level, "par"> = {
              id: LEVEL_ID,
              width: W,
              height: H,
              startPhase: START_PHASE,
              player: PLAYER,
              goal,
              phaseAWalls: colA,
              phaseBWalls: colB,
              doors: [],
              switches: [],
              portals: [{ id: "p1", pair: [leftEnd, rightEnd], activePhase: portalPhase }],
            };
            const parsed = LevelSchema.safeParse({ ...draft, par: 1 });
            if (!parsed.success || !validateLevel(parsed.data).ok) {
              fam.push({ cx, arity, bare: -1, solvable: false, full: false, clean: false });
              continue;
            }
            const level = parsed.data as Level;
            let graph: ReachableGraph;
            try {
              graph = explore(level);
            } catch {
              fam.push({ cx, arity, bare: -1, solvable: false, full: false, clean: false });
              continue;
            }
            const r = analyse(level, graph);
            const solvable = r.solvable && r.shortestSolution !== null;
            const full = r.distinctPositions === W * H;
            fam.push({
              cx,
              arity,
              bare: solvable ? (r.shortestSolution as number) : -1,
              solvable,
              full,
              clean: solvable && full && r.deadStates === 0,
            });
          }
      }
  }
  console.log(
    `\nstage F family census — grid ${String(W)}×${String(H)} · seal arity window ${String(SEAL.lo)}-${String(SEAL.hi)} · ` +
      `rung ${String(LEVEL_ID)} bare-par window {${windowF.map(String).join(",")}}`,
  );
  const groups = new Map<string, FamRow[]>();
  for (const row of fam) {
    const key = `cx=${String(row.cx)} arity=${String(row.arity)}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  console.log(`  geometries scanned (all families): ${String(fam.length)}`);
  for (const [key, list] of [...groups.entries()].sort()) {
    const hist = new Map<number, number>();
    for (const row of list) if (row.solvable) hist.set(row.bare, (hist.get(row.bare) ?? 0) + 1);
    const clean = list.filter((r) => r.clean);
    const onRung = clean.filter((r) => windowF.includes(r.bare));
    const bareMax = list.filter((r) => r.solvable).reduce((m, r) => Math.max(m, r.bare), -1);
    console.log(
      `  ${key.padEnd(12)} scanned=${String(list.length).padEnd(5)} solvable=${String(list.filter((r) => r.solvable).length).padEnd(5)} ` +
        `full-coverage+clean=${String(clean.length).padEnd(5)} bare max=${String(bareMax).padEnd(3)} ` +
        `ON-RUNG=${String(onRung.length)}`,
    );
    console.log(
      `      bare histogram: ${[...hist.entries()].sort((a, b) => a[0] - b[0]).map(([p, n]) => `${String(p)}:${String(n)}`).join(" ")}`,
    );
    console.log(
      `      on-rung bare values: ${[...new Set(onRung.map((r) => r.bare))].sort((a, b) => a - b).join(" ") || "(none)"}`,
    );
  }
  console.log("\n(stage f only — no latch lattice run, nothing written)");
} else if (STAGE === "a") {
  console.log("\n(stage a only — no latch lattice run)");
} else {
  // ── stage B: the latch lattice over a band-spread geometry seed set ────────
  //
  // The seed set is drawn **round-robin across bare par 8…12** rather than from
  // the lowest par, because the ladder's E2 needs `par ≥ 12` and a shorter bare
  // route only exists if the latch chain adds ≥ 4 moves. Sampling the band this
  // way keeps the search honest about where the par budget can come from instead
  // of spending the whole cap on the seeds least able to reach the gate.
  const bandSeeds = clean.filter((r) => r.par >= 8 && r.par <= 12);
  const byParSeed = new Map<number, GeoRow[]>();
  for (const r of bandSeeds) {
    const list = byParSeed.get(r.par) ?? [];
    list.push(r);
    byParSeed.set(r.par, list);
  }
  const parKeys = [...byParSeed.keys()].sort((a, b) => a - b);
  const seeds: GeoRow[] = [];
  for (let round = 0; seeds.length < GEO_LIMIT; round += 1) {
    const before = seeds.length;
    for (const p of parKeys) {
      const list = byParSeed.get(p) ?? [];
      const row = list[round];
      if (row !== undefined && seeds.length < GEO_LIMIT) seeds.push(row);
    }
    if (seeds.length === before) break;
  }
  console.log(
    `\nstage B latch lattice: ${String(seeds.length)} geometry seed(s) with bare par in [8,12] ` +
      `· far tiles = ${String(FAR_TILES.length)} · cap ${String(CAP)} per seed`,
  );
  const histogram = new Map<string, number>();
  const accepts: { note: string; level: Level; dexec: number }[] = [];
  /**
   * Near-miss record — **measurement, never a repair path**. A rejected candidate
   * is written down with the same numbers an accepted one would have had, so the
   * cap can be judged (are we 1 move short, or a region away?) without anything
   * being mutated to fit. Nothing here feeds the gates.
   */
  const misses: { reason: string; note: string; par: number; dexec: number; b: number }[] = [];
  let total = 0;
  let goalOnDoor = 0;
  for (const row of seeds) {
    // ── The lattice is drawn from the far region's tiles, with two of its three
    // axes **derived by measurement instead of enumerated**:
    //
    //   • a door only changes a route if it REFUSES the phase in which its tile is
    //     entered, and that phase is fixed (`bareEntryMap`), so the colour is
    //     `closedIn(entryPhase)` — enumerating the other colour can only produce a
    //     door that is transparent when the player arrives, i.e. decoration;
    //   • a switch only fires if its `activePhase` IS the phase in which its tile
    //     is entered, so `activePhase = entryPhase`, measured the same way.
    //
    // Both are *proposals*: the gate chain still proves `every-switch-fires`, the
    // hard violations and E4 on the finished board, so a derivation that turns out
    // wrong yields a named rejection, never a false accept. The reduction buys the
    // whole lattice at ~1/16 of the cost.
    const bare = LevelSchema.parse({ ...lead(row.geo, [], []), par: 1 }) as Level;
    const entry = bareEntryMap(bare, explore(bare));
    const tiles = FAR_TILES.filter((t) => {
      const set = entry.get(coordKey(t));
      return set !== undefined && set.size === 1;
    });
    const phaseAt = (t: Coord): Phase =>
      [...(entry.get(coordKey(t)) as Set<Phase>)][0] as Phase;
    let tried = 0;
    outer: for (let di = 0; di < tiles.length; di += 1)
      for (let dj = 0; dj < tiles.length; dj += 1) {
        if (di === dj) continue;
        for (let si = 0; si < tiles.length; si += 1)
          for (let sj = 0; sj < tiles.length; sj += 1) {
            if (si === sj || si === di || si === dj || sj === di || sj === dj) continue;
            if (tried >= CAP) break outer;
            tried += 1;
            total += 1;
            const t = tiles as readonly Coord[];
            const d1Tile = t[di] as Coord;
            const d2Tile = t[dj] as Coord;
            const s1Tile = t[si] as Coord;
            const s2Tile = t[sj] as Coord;
            const c1 = closedIn(phaseAt(d1Tile));
            const c2 = closedIn(phaseAt(d2Tile));
            const p1 = phaseAt(s1Tile);
            const p2 = phaseAt(s2Tile);
            const doors: DoorDef[] = [
              { id: "d1", color: c1, tiles: [d1Tile] },
              { id: "d2", color: c2, tiles: [d2Tile] },
            ];
            const switches: SwitchDef[] = [
              { id: "s1", tile: s1Tile, activePhase: p1, targets: ["d1"] },
              { id: "s2", tile: s2Tile, activePhase: p2, targets: ["d2"] },
            ];
            const note =
              `${geoNote(row.geo)} · d1=${coordKey(d1Tile)}/${c1} d2=${coordKey(d2Tile)}/${c2} ` +
              `· s1=${coordKey(s1Tile)}/${p1} s2=${coordKey(s2Tile)}/${p2}`;
            const { outcome, level } = judge(lead(row.geo, doors, switches), cut);
            if (!outcome.accepted || level === null) {
              histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
              if (outcome.par !== undefined)
                misses.push({
                  reason: outcome.reason,
                  note,
                  par: outcome.par,
                  dexec: outcome.dexec ?? Number.NaN,
                  b: outcome.b ?? Number.NaN,
                });
              continue;
            }
            // A goal standing on a door tile is flagged by the validator itself
            // (`ADR-0008` rule 7 intends the goal enterable on both parities, and
            // `validateLevel` warns "covers the goal"): the gate chain does not
            // reject it — it is a warning, never a law — so it is a SELECTION
            // rejection here, with its measurement, not a silent drop.
            if (d1Tile === row.geo.goal || d2Tile === row.geo.goal) {
              goalOnDoor += 1;
              continue;
            }
            accepts.push({ note, level, dexec: outcome.dexec ?? Number.NaN });
            console.log(
              `  ACCEPT  ${note}\n          par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} ` +
                `(cut +${((outcome.dexec ?? 0) - cut.floor).toFixed(6)}) B=${(outcome.b ?? 0).toFixed(4)} coverage=${String(outcome.coverage)}`,
            );
          }
      }
  }
  console.log(`\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} candidate(s)`);
  console.log(
    `selection rejection (not a gate): goal standing on a door tile = ${String(goalOnDoor)} ` +
      `board(s) — the validator's own "covers the goal" warning (ADR-0008 rule 7 intent)`,
  );
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1]))
    console.log(`  ${k}: ${String(v)}`);
  const nearMiss = misses
    .filter((m) => m.reason.split("+").every((g) => g === "escalation" || g === "par-step"))
    .sort((a, b) => b.par - a.par || b.dexec - a.dexec)
    .slice(0, 6);
  console.log(
    `near-miss (par/escalation ONLY, top ${String(nearMiss.length)} of ` +
      `${String(misses.filter((m) => m.reason.split("+").every((g) => g === "escalation" || g === "par-step")).length)}):`,
  );
  for (const m of nearMiss)
    console.log(
      `  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`,
    );
  if (WRITE && accepts.length > 0) {
    // ── selection: minimal par, then minimal D_exec ──────────────────────────
    //
    // Both keys are **derived, not tasted**. `par` has one admissible value per
    // rung (`a19a347`), so the par key is a no-op filter kept explicit. Among the
    // boards that share it, the smallest `D_exec` is taken because `D_exec` is
    // `par + 3·B` in-region and every accept here measures `B` **above** §5.2's
    // band top 1.6875 — the §6.1.1 self-correcting guard's excursion case. The
    // excursion is named, not widened, and the honest pick is the board that
    // escalates on `D_exec` while adding the least unmeasured `B`; maximising
    // `D_exec` instead would chase depth through the one coordinate that left its
    // measured band. Ties fall to the deterministic enumeration order.
    mkdirSync(OUT_DIR, { recursive: true });
    const chosen = accepts.reduce((a, b) => {
      const pa = a.level.par ?? 0;
      const pb = b.level.par ?? 0;
      if (pb !== pa) return pb < pa ? b : a;
      return b.dexec < a.dexec ? b : a;
    });
    const file = join(OUT_DIR, `l${String(chosen.level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(chosen.level, null, 2)}\n`);
    console.log(
      `\nselection (min par, then min D_exec) of ${String(accepts.length)} accept(s): ` +
        `par=${String(chosen.level.par)} D_exec=${chosen.dexec.toFixed(6)} (cut +${(chosen.dexec - cut.floor).toFixed(6)})`,
    );
    console.log(`wrote ${file}\n  ${chosen.note}`);
    proveArtifact(file, cut);

    // ── byte re-read + negative controls on the WRITTEN artifact ─────────────
    //
    // `a19a347`'s pattern, applied one artifact further: the proof is re-run on
    // the bytes that actually landed, not on the in-memory object that produced
    // them, and the gate set is then shown to **discriminate** — each surgical
    // mutation of those same bytes must be REJECTED by a NAMED gate. A gate
    // battery that accepts everything proves nothing (LV-009-B step 3 shape).
    const landed = LevelSchema.parse(JSON.parse(readFileSync(file, "utf8"))) as Level;
    const positive = judge(landed, cut);
    console.log(
      `\nbyte re-read control: ${positive.outcome.accepted ? "ACCEPT" : "REJECT (" + positive.outcome.reason + ")"} ` +
        `par=${String(positive.outcome.par)} D_exec=${(positive.outcome.dexec ?? Number.NaN).toFixed(6)} ` +
        `gates=${String(positive.outcome.gates?.filter((g) => g.ok).length ?? 0)}/${String(positive.outcome.gates?.length ?? 0)} PASS`,
    );
    if (!positive.outcome.accepted) throw new Error("the written artifact does not reproduce its own verdict");
    const controls: readonly { name: string; board: Level; expect: string }[] = [
      {
        name: "latch removed (switches dropped)",
        board: { ...landed, switches: [] },
        expect: "latch-grade",
      },
      {
        name: "switch muted (s2 targets nothing)",
        board: {
          ...landed,
          switches: landed.switches.map((s, i) => (i === 1 ? { ...s, targets: [] } : s)),
        },
        expect: "latch-grade",
      },
      {
        name: "goal sealed in both phases",
        board: {
          ...landed,
          phaseAWalls: [...landed.phaseAWalls, landed.goal],
          phaseBWalls: [...landed.phaseBWalls, landed.goal],
        },
        expect: "unsolvable",
      },
      {
        name: "portal pair dropped (parity frame broken)",
        board: { ...landed, portals: [] },
        expect: "par-step",
      },
      {
        name: "one door retargeted to the other switch",
        board: {
          ...landed,
          switches: landed.switches.map((s, i) => (i === 0 ? { ...s, targets: ["d1", "d2"] } : { ...s, targets: ["d1", "d2"] })),
        },
        expect: "latch-route",
      },
    ];
    let controlsCaught = 0;
    for (const control of controls) {
      const verdict = judge(control.board, cut);
      const named = verdict.outcome.reason;
      const caught = !verdict.outcome.accepted && named.includes(control.expect);
      if (caught) controlsCaught += 1;
      console.log(
        `  ${caught ? "CAUGHT" : "MISSED"}  ${control.name} → ${named}` +
          ` (expected a rejection naming "${control.expect}")`,
      );
    }
    console.log(`negative controls: ${String(controlsCaught)}/${String(controls.length)} caught by their named gate`);
    if (controlsCaught !== controls.length)
      throw new Error("a mutation of the shipped artifact survived the gate battery — the battery is vacuous here");
  }
}