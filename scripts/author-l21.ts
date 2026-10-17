/**
 * `scripts/author-l21.ts` — LV-012: the **G lattice** (Act II batch 1, L21–L25) —
 * *multi-pocket* sealed landings with an **ordered multi-press chain**.
 *
 * Law it implements, quoted not paraphrased:
 * - `docs/level-design.md` §7.2 (GD-009 / ADR-design-0005): Act II =
 *   "**Portal orchestration**: multi-pocket sealed landings (2–4 pockets), ordered
 *   multi-switch chains, portal-repriced latches; the walk-only world deleted from
 *   the outset", par band **16–24**, `D_exec` band **[19.75, 29.06]**, batch size 5.
 * - §7.4: stage **G** = "multi-pocket: pocket count 1–4 × portal pairs 1–2 × door
 *   arity 2–5 × landing position, on 7×6 → 7×7". This pass enumerates **7×6 first**
 *   (the dispatch's order) with **one** portal pair, per §6.2.3 item 1.
 * - §6.2.3 (the sealed-landing lattice, VERBATIM obligations):
 *   1. exactly one opposite-colour portal pair (ADR-0009; same-colour is a validator
 *      hard error);
 *   2. the landing pocket is **not on-foot reachable** in the needed phase
 *      (the portal-free world never enters it — the sealed column at `x = CX` makes
 *      the whole far region portal-only);
 *   3. **every blocker is an openable door** — no phase wall may form an exit
 *      (F-L19-2: a far-region phase wall makes its tile unstandable and the 42/42
 *      coverage gate fails);
 *   4. an ordered **≥ 2-press** plan: the second switch reachable only *after* the
 *      first door opens (here: a **3-press** chain `s1 → d1 → s2 → d2 → sg → d3`);
 *   5. `T ≡ R ≡ 0` and P4 coverage 42/42 (the pockets are through-stations);
 *   6. `switchRequired` read as a **measurement**, never an assertion.
 * - §7.4 **clone guard**: "the reusable unit is the plan shape, never the board" —
 *   the stricter seal-inclusive geometry key is censused (never re-stamping L19/L20).
 * - §7.7 item 4: **do not re-stamp L20**; a new skeleton under the same plan shape.
 *
 * ── THE DEVICE THIS FILE BUILDS (the named plan shape, written before the search) ─
 *
 * ```
 *   P  the landing pocket   — walk-sealed: the portal is its only entrance
 *                             exit  = door  d1  (one door object, whole boundary)
 *                             press = s1 ∈ P        (drives d1)
 *   F  the free far region  — entered only by crossing d1
 *                             press = s2 ∈ F        (drives d2)  ← reachable only
 *                                                                  after d1 opens
 *   Q  the second pocket    — walk-sealed room in F: every neighbour is a d2 tile,
 *                             so d2 is both its entrance and its exit
 *                             press = sg ∈ Q        (drives d3)
 *   G  the goal             — every in-region neighbour is a d3 tile (one door
 *                             object), so the goal is entered only through d3
 * ```
 *
 * The forced order is a property of the board, never of advice: `s2` lies outside
 * `P` (hence after `d1`), `sg` lies inside `Q` (hence after `d2`), and `d3` is the
 * goal's only entrance (hence after `sg`). Nothing else can open `d1`, `d2` or `d3`
 * (one switch per door, §1's L6–L35 authoring rule).
 *
 * Stages:
 *
 *   0.  **preflight law** — the parity/judging-phase rule re-derived from the shipped
 *       boards (never quoted).
 *   0b. **clone-guard census** — §6.1.4 over the stricter seal-inclusive key
 *       `player|goal|portal-pair|door-tiles`.
 *   0c. **frame census** (`--stage=frame`) — the far-frame phase law
 *       `stand(t) = arrivalPhase ⊕ parity-distance` **measured** against a BFS of the
 *       bare board (no doors, no switches), so the construction's phase arithmetic is
 *       a readable measurement rather than an assumption.
 *   p.  **pocket census** (`--stage=p`) — every leak-free room up to `--pocketsize`
 *       on the activation set (the same measurement stage SL's P inventory uses).
 *   g.  **G lattice** (`--stage=g`, default) — device × `s1` × `Q` × `s2` × goal ×
 *       `sg`, each tuple re-derived and judged; the par band is the **filter**
 *       (probe first, gates only on in-band boards), and accepts are dumped with
 *       their measurements for the selection stage.
 *   s.  **selection** (`--stage=s --accepts=…`) — picks the five rungs L21–L25 from
 *       the accept dump by a **derived, published rule**: pars strictly inside the
 *       act band, `D_exec` strictly rising along the batch, and the par-step rule
 *       maximised (see {@link selectBatch}).
 *   v.  **verify** (`--stage=v`) — re-read the written artifacts and re-run the whole
 *       chain + negative controls on the bytes.
 *
 * Solvability is never asserted here: `par` comes from the BFS solver, every gate
 * number from the shipped readers, and a candidate that fails is **dropped with its
 * measurement** (ADR-0004 — no repair path, no tuning loop).
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, DoorDef, Level, Phase, SwitchDef } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute, goalReachableWithAllSwitchesOff } from "@/core/solver/bfs";
import { applyMove, isLegalMove, solidAt } from "@/core/rules";
import { DIRECTIONS, move } from "@/core/state/move";
import { hashState } from "@/core/state/hash";
import { initialState } from "@/core/state";
import type { SearchState } from "@/core/state/types";
import { analyseDifficulty } from "@/core/solver/difficulty";
import {
  BLOCK_L1619_B_BAND,
  BLOCK_L1619_IDS,
  BLOCK_L1619_PAR_BASE,
  BLOCK_L1619_TAIL_EXEC_CEILING,
  allOffShortestSolution,
  auditLevel,
  firingSwitches,
} from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../src/levels/candidates/", import.meta.url));
const WRITE = process.argv.includes("--write");
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
const STAGE = argOf("stage") ?? "g";
const ACCEPTS = argOf("accepts") ?? "/private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/lv012-accepts.json";

const W = Number(argOf("w") ?? "7");
const H = Number(argOf("h") ?? "6");
const CX = Number(argOf("cx") ?? "3");
const POCKET_MAX = Number(argOf("pocketsize") ?? "4");
const QMAX = Number(argOf("qmax") ?? "4");
const CAP = Number(argOf("cap") ?? "400");
/** The Act II par band, strictly inside (§7.2 band 16–24; the dispatch's obligation). */
const PAR_MIN = Number(argOf("parmin") ?? "17");
/** Act II batch 1's first rung id — the batch this tool authors (see {@link candidateFiles}). */
const BATCH_FIRST_ID = 21;
const PAR_MAX = Number(argOf("parmax") ?? "23");
/** The Act II `D_exec` band (§7.2, derived from the measured `B` band). */
const ACT2_EXEC_BAND: readonly [number, number] = [19.75, 29.06];

const at = (px: number, py: number): Coord => [px, py];
const x = (c: Coord): number => c[0];
const y = (c: Coord): number => c[1];
const parity = (c: Coord): number => (x(c) + y(c)) % 2;
const flip = (p: Phase): Phase => (p === "A" ? "B" : "A");
const adjacent = (a: Coord, b: Coord): boolean =>
  Math.abs(x(a) - x(b)) + Math.abs(y(a) - y(b)) === 1;
const PLAYER = at(0, 0);
const START_PHASE: Phase = "A";

// ─────────────────────────────────────────────────────────────────────────────
// 0. Preflight + the measured basis (never typed)
// ─────────────────────────────────────────────────────────────────────────────

function shipped(): { file: string; level: Level }[] {
  return readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((file) => ({
      file,
      level: LevelSchema.parse(JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8"))) as Level,
    }));
}

/** The parity law the whole construction rests on, re-derived from the shipped boards. */
function preflightLaw(): { boards: number; states: number; moves: number; bimodal: number } {
  let states = 0;
  let moves = 0;
  let bimodal = 0;
  const boards = shipped();
  for (const { level } of boards) {
    const graph = explore(level);
    states += graph.nodes.length;
    const phases = new Map<string, Set<Phase>>();
    for (const s of graph.nodes) {
      for (const d of DIRECTIONS) {
        if (!isLegalMove(level, s, move(d))) continue;
        moves += 1;
        const n = applyMove(level, s, move(d));
        const key = coordKey([n.player.x, n.player.y] as Coord);
        const set = phases.get(key) ?? new Set<Phase>();
        set.add(s.phase);
        phases.set(key, set);
      }
    }
    if (level.portals.length === 0) {
      for (const [, set] of phases) if (set.size > 1) bimodal += 1;
    }
  }
  return { boards: boards.length, states, moves, bimodal };
}

/**
 * The two ceilings the batch is judged against, **re-measured from the root bytes on
 * every run**:
 * - `cut` = `max D_exec` over the L1–L15 basis (the registered L16–L20 ladder
 *   excluded, exactly as `prove-candidate.ts`'s `measureCut()` reads it: a registered
 *   block must not raise the filter judged against it);
 * - `actI` = Act I's **measured maximum** `D_exec` over ids 1–20 — the number
 *   `docs/level-design.md` §7.3's `act-peak` clause compares against (24.729412 at
 *   R-003d, re-derived here rather than typed).
 */
function measureCut(): {
  floor: number;
  actI: number;
  l15Par: number;
  basis: readonly number[];
  bBand: readonly [number, number];
} {
  let floor = Number.NEGATIVE_INFINITY;
  let actI = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let bMin = Number.POSITIVE_INFINITY;
  let bMax = Number.NEGATIVE_INFINITY;
  const basis: number[] = [];
  for (const { level } of shipped()) {
    if (level.id <= 20) {
      const d = analyseDifficulty(level, explore(level));
      if (d.Dexec !== null && d.Dexec > actI) actI = d.Dexec;
    }
    if (BLOCK_L1619_IDS.includes(level.id)) continue;
    basis.push(level.id);
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (d.B < bMin) bMin = d.B;
    if (d.B > bMax) bMax = d.B;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, actI, l15Par, basis, bBand: [bMin, bMax] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 0b. The clone guard — §6.1.4, read over the seal geometry too
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The stricter seal-inclusive geometry key (`scripts/author-l20.ts`, §6.1.4): a board
 * that re-stamps L19's or L20's geometry on a fresh player/goal/portal triple is
 * exactly the construction the law refuses ("never clone a shipped board, never
 * re-stamp L20"), and this census is what catches it. Door tiles are included, so the
 * rooms count.
 */
function cloneKeyOf(level: Level): string {
  const p = level.portals[0];
  const doors = level.doors.flatMap((d) => d.tiles.map(coordKey)).sort().join("+");
  return [
    coordKey(level.player),
    coordKey(level.goal),
    p === undefined ? "-" : coordKey(p.pair[0]),
    p === undefined ? "-" : coordKey(p.pair[1]),
    doors,
  ].join("|");
}

/**
 * The shelf's candidate files. `forSelection` drops **the batch under construction** — every
 * candidate whose id is ≥ `BATCH_FIRST_ID` (21 = Act II batch 1's first rung). The guard's law
 * is "never clone a shipped board or a *previously landed* candidate"; the batch's own five
 * files are this command's OUTPUT, so reading them back would make the tool refuse the ladder it
 * just wrote and the run non-reproducible from its own record. A later batch (L26–L30) still
 * guards against L21–L25, because by then ids 21–25 are below its own `BATCH_FIRST_ID`.
 */
function candidateFiles(forSelection = false): string[] {
  return readdirSync(OUT_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .filter((n) => !forSelection || Number(/^l(\d+)\.json$/.exec(n)?.[1] ?? "0") < BATCH_FIRST_ID)
    .sort();
}

function cloneGuardCensus(forSelection = false): Map<string, string> {
  const used = new Map<string, string>();
  for (const { file, level } of shipped()) used.set(cloneKeyOf(level), file);
  for (const file of candidateFiles(forSelection)) {
    const level = LevelSchema.parse(JSON.parse(readFileSync(join(OUT_DIR, file), "utf8"))) as Level;
    used.set(cloneKeyOf(level), `candidates/${file}`);
  }
  return used;
}

// ─────────────────────────────────────────────────────────────────────────────
// The grid: the frame the device lives in (7 × 6, sealed column at x = CX)
// ─────────────────────────────────────────────────────────────────────────────

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
 * The sealed column at `x = CX`, split by the inherited derivation: a tile entered
 * from the start region always happens in `entryPhase(T)`, so a wall in its own entry
 * phase is parity-dead from that side (an ordinary permanent wall, ADR-0009) — while
 * the far region reaches the same tile from the other side, where the portal has
 * shifted the parity frame, which is what keeps coverage at 42/42.
 */
const COLUMN = (() => {
  const a: Coord[] = [];
  const b: Coord[] = [];
  for (let py = 0; py < H; py += 1) {
    const d = Math.abs(CX - x(PLAYER)) + Math.abs(py - y(PLAYER));
    const entry: Phase = d % 2 === 1 ? START_PHASE : flip(START_PHASE);
    (entry === "A" ? a : b).push(at(CX, py));
  }
  return { a, b };
})();

/** `entryPhase(near)` — the phase a first entry into a left-region tile always happens in. */
const nearEntryPhase = (near: Coord): Phase => (parity(near) === 1 ? START_PHASE : flip(START_PHASE));
/** The phase the player is IN after the teleport (`applyMove` flips after the teleport). */
/** The phase the player is IN after the teleport (`applyMove` flips after the teleport). */
const _arrivalPhaseOf = (near: Coord): Phase => flip(nearEntryPhase(near));
void _arrivalPhaseOf;

/**
 * The far region's phase law, derived from the grid's bipartiteness: every move flips
 * the phase, so `stand(t) = arrivalPhase ⊕ (moves from the landing mod 2)`, and on a
 * bipartite grid that parity is `(x+y)` parity — path-independent. Hence
 * `stand(t) = arrivalPhase` iff `parity(t) === parity(landing)`, else its flip.
 *
 * A **proposal**: `--stage=frame` measures it against a BFS of the bare board, and
 * every gate re-reads the real rules.
 */
const standPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  parity(t) === parity(landing) ? arrivalPhase : flip(arrivalPhase);
const farEntryPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  flip(standPhase(landing, arrivalPhase, t));

const _doorOpenIn = (color: DoorDef["color"], p: Phase): boolean =>
  color === "red" ? p === "A" : p === "B";
void _doorOpenIn;
/** The colour whose base is CLOSED in phase `p` — a door that refuses `p`. */
const closedIn = (p: Phase): DoorDef["color"] => (p === "A" ? "blue" : "red");

/** Every legal move out of a state, as successor states (the shipped rule decides). */
function successors(level: Level, s: SearchState): SearchState[] {
  const out: SearchState[] = [];
  for (const d of DIRECTIONS) {
    if (!isLegalMove(level, s, move(d))) continue;
    out.push(applyMove(level, s, move(d)));
  }
  return out;
}

const allOff = (level: Level, s: SearchState): boolean =>
  level.switches.every((sw) => s.switchesOn[sw.id] !== true);

/** In-bounds neighbours of `t` inside the walkable far region (`x > CX`). */
function walkNeighbours(t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at(
      x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
      y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
    );
    if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
    if (x(n) <= CX) continue;
    out.push(n);
  }
  return out.sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

/** In-bounds neighbours of `t` (grid-wide; used only for data-side geometry). */
function gridNeighbours(t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at(
      x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
      y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
    );
    if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
    out.push(n);
  }
  return out.sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Rooms — what a walk-sealed room IS, measured (never argued)
// ─────────────────────────────────────────────────────────────────────────────

interface Room {
  /** The room's tiles (the interior — the door tiles are the boundary, not the room). */
  readonly tiles: readonly Coord[];
  /** Every in-region neighbour outside the room: each is an exit, and each must be a door tile. */
  readonly boundary: readonly Coord[];
  /**
   * The single phase in which every boundary tile is *entered* from the room (the
   * room's own stand phase). A single-colour door can only refuse in one phase, so a
   * two-phase boundary leaks, and the leak is a free exit that would make the press
   * non-mandatory (`scripts/author-l20.ts` `sealedPocket`).
   */
  readonly entryPhase: Phase;
}

/**
 * Measure a tile set as a room: connected, non-empty boundary (every neighbour in the
 * region is an exit), and a **single-phase boundary** — every boundary tile's adjacent
 * room tiles share one parity, i.e. one phase.
 */
const ROOM_FAIL = new Map<string, number>();
const roomFail = (reason: string): null => {
  ROOM_FAIL.set(reason, (ROOM_FAIL.get(reason) ?? 0) + 1);
  return null;
};

function roomFrom(
  tiles: readonly Coord[],
  arrivalPhase: Phase,
  landing: Coord,
): Room | null {
  if (tiles.length === 0) return roomFail("empty");
  const inside = new Set(tiles.map(coordKey));
  // connectivity (a room is a connected set: the flood from its first tile must reach it all)
  const seen = new Set<string>([coordKey(tiles[0] as Coord)]);
  const q: Coord[] = [tiles[0] as Coord];
  for (let i = 0; i < q.length; i += 1) {
    const t = q[i] as Coord;
    for (const f of tiles) {
      if (seen.has(coordKey(f)) || !adjacent(t, f)) continue;
      seen.add(coordKey(f));
      q.push(f);
    }
  }
  if (seen.size !== tiles.length) return roomFail("disconnected");
  const boundaryMap = new Map<string, Coord>();
  for (const t of tiles) {
    const here = standPhase(landing, arrivalPhase, t);
    for (const d of DIRECTIONS) {
      const n = at(
        x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
        y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
      );
      if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
      if (inside.has(coordKey(n))) continue;
      if (x(n) < CX) return roomFail("left-region-neighbour"); // the left region is not the far frame's business
      if (x(n) === CX) {
        // The column can hold no door (door ∩ wall is a hard error, LV-005), so the tile is
        // an exit iff it is *passable* in the phase the step would happen in (`here`). A wall
        // solid in `here` is not an exit (the same rule `scripts/author-l20.ts` `pocketLeaks`
        // applies); a passable column echo IS — the player steps onto it, flips, and walks off
        // into the region — so the room is not sealable and is rejected here.
        const wallPhase: Phase = COLUMN.a.some((c2) => coordKey(c2) === coordKey(n)) ? "A" : "B";
        if (wallPhase === here) continue;
        return roomFail("column-leak");
      }
      boundaryMap.set(coordKey(n), n);
    }
  }
  const boundary = [...boundaryMap.values()].sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
  if (boundary.length === 0) return roomFail("no-boundary");
  const phases = new Set<Phase>();
  for (const b of boundary) {
    const inner = tiles.filter((t) => adjacent(t, b));
    const parities = new Set(inner.map(parity));
    if (parities.size !== 1) return roomFail("two-phase-boundary"); // one door cannot seal it
    phases.add(standPhase(landing, arrivalPhase, inner[0] as Coord));
  }
  if (phases.size !== 1) return roomFail("mixed-entry-phase");
  return { tiles: [...tiles].sort((a, b) => coordKey(a).localeCompare(coordKey(b))), boundary, entryPhase: [...phases][0] as Phase };
}

/** Every connected tile set of size 2..`maxSize` drawn from `pool` (enumeration order = sorted pool). */
function roomCandidates(pool: readonly Coord[], maxSize: number): Coord[][] {
  const out: Coord[][] = [];
  const grow = (tiles: Coord[]): void => {
    if (tiles.length >= 2) out.push([...tiles]);
    if (tiles.length >= maxSize) return;
    for (const p of pool) {
      if (tiles.some((t) => coordKey(t) === coordKey(p))) continue;
      if (!tiles.some((t) => adjacent(t, p))) continue;
      if (tiles.some((t) => coordKey(t).localeCompare(coordKey(p)) >= 0)) continue; // canonical order
      tiles.push(p);
      grow(tiles);
      tiles.pop();
    }
  };
  for (let i = 0; i < pool.length; i += 1) grow([pool[i] as Coord]);
  return out;
}

/** Every connected tile set of size 2..`maxSize` **containing `anchor`** (the landing-pocket enumeration). */
function anchoredRooms(anchor: Coord, pool: readonly Coord[], maxSize: number): Coord[][] {
  const out: Coord[][] = [];
  const grow = (tiles: Coord[]): void => {
    if (tiles.length >= 2) out.push([...tiles]);
    if (tiles.length >= maxSize) return;
    for (const p of pool) {
      if (coordKey(p) === coordKey(anchor)) continue;
      if (tiles.some((t) => coordKey(t) === coordKey(p))) continue;
      if (!tiles.some((t) => adjacent(t, p))) continue;
      tiles.push(p);
      grow(tiles);
      tiles.pop();
    }
  };
  grow([anchor]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 0c. The frame census — the phase law, MEASURED against the real rules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the bare board of a device (the portal + the sealed column, **no doors, no
 * switches**), BFS it from the start, and compare the measured phase at every far tile
 * with the derived law `stand(t) = arrivalPhase ⊕ parity-distance`. A disagreement is a
 * finding about the derivation — printed, never smoothed.
 */
function frameCensus(): void {
  const rows: string[] = [];
  let checked = 0;
  let agree = 0;
  for (const landing of FAR_TILES) {
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      if (parity(near) === parity(landing)) continue;
      const nearPhase = nearEntryPhase(near);
      const arrivalPhase = flip(nearPhase);
      const bare: Level = {
        id: 21,
        width: W,
        height: H,
        startPhase: START_PHASE,
        player: PLAYER,
        goal: landing,
        phaseAWalls: COLUMN.a,
        phaseBWalls: COLUMN.b,
        doors: [],
        switches: [],
        portals: [{ id: "p1", pair: [near, landing], activePhase: nearPhase }],
        par: 1,
      };
      const graph = explore(bare);
      // the phase measured at each far tile (all-off world: no switches exist)
      const measured = new Map<string, Phase>();
      for (const s of graph.nodes) {
        const key = `${String(s.player.x)},${String(s.player.y)}`;
        if (!measured.has(key)) measured.set(key, s.phase);
      }
      // the far frame only exists after the teleport: read the tiles whose phase the
      // arrival state's flood reaches
      const start = graph.nodes.find(
        (s) => s.player.x === x(landing) && s.player.y === y(landing),
      );
      if (start === undefined) continue;
      const seen = new Set<string>([hashState(start)]);
      const q: SearchState[] = [start];
      const reached = new Map<string, Phase>([[`${String(start.player.x)},${String(start.player.y)}`, start.phase]]);
      for (let i = 0; i < q.length; i += 1) {
        const s = q[i] as SearchState;
        for (const n of successors(bare, s)) {
          const h = hashState(n);
          const key = `${String(n.player.x)},${String(n.player.y)}`;
          if (!reached.has(key) && x([n.player.x, n.player.y] as Coord) > CX) reached.set(key, n.phase);
          if (seen.has(h)) continue;
          seen.add(h);
          q.push(n);
        }
      }
      for (const [key, phase] of reached) {
        const [px, py] = key.split(",").map(Number);
        const t = at(px as number, py as number);
        const derived = standPhase(landing, arrivalPhase, t);
        checked += 1;
        if (derived === phase) agree += 1;
        else rows.push(`MISMATCH landing ${coordKey(landing)} near ${coordKey(near)} tile ${coordKey(t)} measured ${phase} derived ${derived}`);
      }
      void measured;
    }
  }
  console.log(
    `\nframe census (the derived far-frame phase law vs a BFS of the bare board): ` +
      `${String(agree)}/${String(checked)} far-tile (phase, once-reached) readings agree with ` +
      `stand(t) = arrivalPhase ⊕ parity-distance · ${String(rows.length)} mismatch(es)`,
  );
  for (const r of rows.slice(0, 20)) console.log(`  ${r}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// The device + the gate chain
// ─────────────────────────────────────────────────────────────────────────────

interface Gate {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

interface Device {
  readonly landing: Coord;
  readonly near: Coord;
  readonly nearPhase: Phase;
  readonly arrivalPhase: Phase;
  /** The landing pocket P — walk-sealed by the column, its exit door d1 covers the boundary. */
  readonly pocket: Room;
}

/** The leak-free landing pockets — the class stage SL draws from, re-derived here. */
function devices(onlyLanding: string | null): Device[] {
  const out: Device[] = [];
  for (const landing of FAR_TILES) {
    if (onlyLanding !== null && coordKey(landing) !== onlyLanding) continue;
    const pool = FAR_TILES.filter((t) => coordKey(t) !== coordKey(landing));
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      if (parity(near) === parity(landing)) continue; // ADR-0009 decision 5: opposite parity only
      const nearPhase = nearEntryPhase(near);
      const arrivalPhase = flip(nearPhase);
      for (const tiles of anchoredRooms(landing, pool, POCKET_MAX)) {
        const room = roomFrom(tiles, arrivalPhase, landing);
        if (room !== null) out.push({ landing, near, nearPhase, arrivalPhase, pocket: room });
      }
    }
  }
  return out;
}

interface Context {
  readonly cut: { floor: number; actI: number; l15Par: number };
  readonly device: Device;
  readonly door1: DoorDef;
  readonly switch1: SwitchDef;
  readonly room2: Room;
  readonly door2: DoorDef;
  readonly switch2: SwitchDef;
  readonly door3: DoorDef;
  readonly switch3: SwitchDef;
}

/** Milestones of the ordered chain, in the order the plan must execute them. */
type Milestone = "press1" | "cross1" | "press2" | "cross2" | "press3" | "cross3";

/**
 * The **ordered multi-press chain** reader: on one par route, record the first arrival
 * of each milestone and require the strictly increasing order
 * `press1 < cross1 < press2 < cross2 < press3 < cross3`.
 *
 * This is §6.2.3 item 4 read literally ("the second switch reachable **only after** the
 * first door opens"), extended to the three-press construction, and it is a *witness*
 * statement: the order must hold on **every** shortest route, not on one.
 */
function chainOfRoute(route: readonly { state: SearchState; toggledOn: readonly string[] }[], ctx: Context): {
  order: Milestone[];
  ok: boolean;
  presses: string[];
} {
  const doorTiles = new Map<string, "d1" | "d2" | "d3">();
  for (const t of ctx.door1.tiles) doorTiles.set(coordKey(t), "d1");
  for (const t of ctx.door2.tiles) doorTiles.set(coordKey(t), "d2");
  for (const t of ctx.door3.tiles) doorTiles.set(coordKey(t), "d3");
  const first = new Map<Milestone, number>();
  const presses: string[] = [];
  for (let i = 0; i < route.length; i += 1) {
    const rec = route[i];
    if (rec === undefined) continue;
    const tile = coordKey([rec.state.player.x, rec.state.player.y] as Coord);
    const crossed = doorTiles.get(tile);
    if (crossed === "d1" && !first.has("cross1")) first.set("cross1", i);
    if (crossed === "d2" && !first.has("cross2")) first.set("cross2", i);
    if (crossed === "d3" && !first.has("cross3")) first.set("cross3", i);
    for (const id of rec.toggledOn) {
      if (!presses.includes(id)) presses.push(id);
      if (id === ctx.switch1.id && !first.has("press1")) first.set("press1", i);
      if (id === ctx.switch2.id && !first.has("press2")) first.set("press2", i);
      if (id === ctx.switch3.id && !first.has("press3")) first.set("press3", i);
    }
  }
  const order: Milestone[] = ["press1", "cross1", "press2", "cross2", "press3", "cross3"];
  let last = -1;
  let ok = true;
  for (const m of order) {
    const idx = first.get(m);
    if (idx === undefined || idx <= last) {
      ok = false;
      break;
    }
    last = idx;
  }
  return { order, ok, presses };
}

/**
 * The G-lattice gate chain: the shared ladder readers (`scripts/author-l20.ts`'s
 * `ladderGates`, re-used shape for shape but read against **Act II's** laws — par band
 * and `D_exec` band instead of the exact rung pin) plus the device gates **g1–g6**.
 * Every gate prints the number it read.
 */
function gatesOf(level: Level, graph: ReachableGraph, ctx: Context): readonly Gate[] {
  const result = analyse(level, graph);
  const diff = analyseDifficulty(level, graph);
  const par = result.shortestSolution ?? level.par;
  const allOffShortest = allOffShortestSolution(level, graph);
  const audit = auditLevel(level, graph);
  const fired = firingSwitches(level, graph);
  const verdict = validateLevel(level);
  const doorByTile = new Map<string, string>();
  for (const door of level.doors) for (const tile of door.tiles) doorByTile.set(coordKey(tile), door.id);
  const targetsBySwitch = new Map<string, readonly string[]>();
  for (const sw of level.switches) targetsBySwitch.set(sw.id, sw.targets);

  // press-then-cross census (the §6.1.3 G2 shape): every par route presses a switch and
  // later crosses a door that switch targets.
  let routes = 0;
  let pressThenCross = 0;
  let chainOk = 0;
  let minPresses = Number.POSITIVE_INFINITY;
  const pressHistogram = new Map<number, number>();
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
      const chain = chainOfRoute(route, ctx);
      if (chain.ok) chainOk += 1;
      minPresses = Math.min(minPresses, chain.presses.length);
      pressHistogram.set(chain.presses.length, (pressHistogram.get(chain.presses.length) ?? 0) + 1);
    });
  }

  const oneSwitchPerDoor = level.doors.every(
    (d) => level.switches.filter((s) => s.targets.includes(d.id)).length === 1,
  );
  const everySwitchFires = level.switches.every((s) => fired.has(s.id));
  const dexec = diff.Dexec;

  // ── g1 — the landing pocket is not on-foot reachable, and sealed pre-press ───
  const pocketKeys = new Set(ctx.device.pocket.tiles.map(coordKey));
  const foot = (() => {
    const walk = explore({ ...level, portals: [] } as Level);
    return new Set(walk.nodes.map((s) => coordKey([s.player.x, s.player.y] as Coord)));
  })();
  const footInPocket = [...pocketKeys].filter((k) => foot.has(k)).length;
  const arrival = (() => {
    for (const s of graph.nodes) {
      if (!allOff(level, s)) continue;
      if (s.phase !== level.portals[0]?.activePhase) continue;
      for (const d of DIRECTIONS) {
        if (!isLegalMove(level, s, move(d))) continue;
        const clicked = at(
          s.player.x + (d === "left" ? -1 : d === "right" ? 1 : 0),
          s.player.y + (d === "up" ? -1 : d === "down" ? 1 : 0),
        );
        if (coordKey(clicked) !== coordKey(ctx.device.near)) continue;
        const n = applyMove(level, s, move(d));
        if (coordKey([n.player.x, n.player.y] as Coord) === coordKey(ctx.device.landing)) return n;
      }
    }
    return null;
  })();
  let escapes = 0;
  let returns = 0;
  if (arrival !== null) {
    const seen = new Set<string>([hashState(arrival)]);
    const q: SearchState[] = [arrival];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const key = coordKey([n.player.x, n.player.y] as Coord);
        if (!pocketKeys.has(key)) {
          if (key === coordKey(ctx.device.near)) returns += 1;
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

  // ── g2 — EVERY room's boundary is covered by exactly one door object ────────
  const doorIdByTile = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorIdByTile.set(coordKey(t), d.id);
  const wallSet = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const roomReport = [ctx.device.pocket, ctx.room2].map((room, i) => {
    const ids = [...new Set(room.boundary.map((t) => doorIdByTile.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
    const free = room.boundary.filter((t) => !doorIdByTile.has(coordKey(t)) && !wallSet.has(coordKey(t)));
    const walls = room.boundary.filter((t) => wallSet.has(coordKey(t)));
    return `room${String(i + 1)} [${room.tiles.map(coordKey).join(" ")}] boundary [${room.boundary.map(coordKey).join(" ")}] doorIds [${ids.join(" ")}] freeLeaks ${String(free.length)}[${free.map(coordKey).join(" ")}] phaseWalls ${String(walls.length)}[${walls.map(coordKey).join(" ")}]`;
  });
  const g2Ok = [ctx.device.pocket, ctx.room2].every((room) => {
    const ids = [...new Set(room.boundary.map((t) => doorIdByTile.get(coordKey(t))).filter((id): id is string => id !== undefined))];
    const free = room.boundary.filter((t) => !doorIdByTile.has(coordKey(t)));
    return ids.length === 1 && free.length === 0;
  });

  // ── g5 — the census identity is broken ─────────────────────────────────────
  const freePositions = new Set<string>();
  {
    const start = graph.nodes[0] as SearchState;
    const seen = new Set<string>([hashState(start)]);
    const q: SearchState[] = [start];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      if (!allOff(level, s)) continue;
      freePositions.add(coordKey([s.player.x, s.player.y] as Coord));
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const sealTiles = ctx.door3.tiles;
  const notAdjacent = sealTiles.filter(
    (t) => !gridNeighbours(t).some((n) => freePositions.has(coordKey(n))),
  );
  const deviceFree: Level = {
    ...level,
    doors: level.doors.filter((d) => d.id !== ctx.door1.id),
    switches: level.switches.filter((s) => s.id !== ctx.switch1.id),
  };
  let identityValue: number | null = null;
  try {
    identityValue = analyse(deviceFree, explore(deviceFree)).shortestSolution;
  } catch {
    identityValue = null;
  }

  // ── g6 — multi-pocket: the far region splits into ≥ 2 door-sealed rooms ────
  const components = (() => {
    const blocked = new Set<string>([...wallSet, ...doorIdByTile.keys()]);
    const seen = new Set<string>();
    const comps: { tiles: Coord[]; doorIds: string[] }[] = [];
    for (const t of FAR_TILES) {
      const k = coordKey(t);
      if (blocked.has(k) || seen.has(k)) continue;
      const comp: Coord[] = [t];
      seen.add(k);
      for (let i = 0; i < comp.length; i += 1) {
        const c = comp[i] as Coord;
        for (const n of walkNeighbours(c)) {
          const nk = coordKey(n);
          if (blocked.has(nk) || seen.has(nk)) continue;
          seen.add(nk);
          comp.push(n);
        }
      }
      const boundaryOfComp = new Set<string>();
      for (const c of comp)
        for (const n of walkNeighbours(c)) {
          const nk = coordKey(n);
          if (blocked.has(nk)) {
            const id = doorIdByTile.get(nk);
            if (id !== undefined) boundaryOfComp.add(id);
          }
        }
      comps.push({ tiles: comp, doorIds: [...boundaryOfComp].sort() });
    }
    return comps;
  })();
  const singleDoorRooms = components.filter((c) => c.doorIds.length === 1);

  const gates: Gate[] = [
    {
      id: "region",
      ok: result.deadStates === 0 && result.noUnrecoverableOk && diff.T === 0 && diff.R === 0,
      detail: `deadStates=${String(result.deadStates)} noUnrecoverableOk=${String(result.noUnrecoverableOk)} T=${String(diff.T)} R=${String(diff.R)}`,
    },
    {
      id: "par-band",
      ok: par >= PAR_MIN && par <= PAR_MAX && level.par === par,
      detail: `par=${String(level.par)} (solver ${String(result.shortestSolution)}) ∈ [${String(PAR_MIN)}, ${String(PAR_MAX)}] — strictly inside Act II's published 16–24 (§7.2, §7.7 item 3)`,
    },
    {
      id: "act2-exec-band",
      ok: dexec !== null && dexec >= ACT2_EXEC_BAND[0] && dexec <= ACT2_EXEC_BAND[1],
      detail: `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} ∈ [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}] (§7.2's derived band = [par+3·1.2500, par+3·1.6875] over the par band)`,
    },
    {
      id: "b-band",
      ok: diff.B >= BLOCK_L1619_B_BAND[0] && diff.B <= BLOCK_L1619_B_BAND[1],
      detail: `B=${diff.B.toFixed(4)} ∈ [${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}] (the measured band, re-derived from L1–L15; an excursion is named, never smoothed)`,
    },
    {
      id: "escalation",
      ok: dexec !== null && dexec > ctx.cut.floor,
      detail: `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} > CUT ${ctx.cut.floor.toFixed(6)} (max over the L1–L15 basis; Act I's measured peak is ${ctx.cut.actI.toFixed(6)})`,
    },
    // NOTE — the exact-rung ladder (`par = l15Par + 2·(id − 15)`, §6.1.1 P2 / the L16–L19
    // rung pin) is **deliberately NOT applied** inside an act: §7.2 makes Act II par band
    // 16–24 a *plateau* and §7.3 grants interior freedom ("a member of an act sits anywhere
    // inside the act's `D_exec` band, in any order"), while the batch-level obligations (the
    // par step and the strictly rising `D_exec`) are judged by the selection stage on the
    // assembled batch. Applying the rung formula here would refuse every par-17…21 member of
    // the band by arithmetic — measured: 174 candidates refused by `par-step` alone.
    {
      id: "latch-grade",
      ok: level.switches.length > 0 && level.doors.length > 0 && (allOffShortest === null || allOffShortest - par >= 1),
      detail: `allOffShortest=${allOffShortest === null ? "null (all-OFF UNSATISFIABLE)" : String(allOffShortest)} par=${String(par)} (§6.1.3 G1: the latch must be worth ≥ 1 move, or carry existence)`,
    },
    {
      id: "latch-route",
      ok: routes > 0 && pressThenCross === routes,
      detail: `par routes=${String(routes)}; press-then-cross on ${String(pressThenCross)} (G2 — every par route presses a switch and then crosses a door it targets)`,
    },
    {
      id: "refused-beat",
      ok: result.refusedBeforeEnteredTiles >= 1,
      detail: `refusedBeforeEnteredTiles=${String(result.refusedBeforeEnteredTiles)} [${result.refusedBeforeEnteredTileList.join(" ")}] unordered=${String(result.refusedThenEnteredTiles)}`,
    },
    {
      id: "coverage",
      ok: result.distinctPositions === level.width * level.height,
      detail: `distinctPositions=${String(result.distinctPositions)}/${String(level.width * level.height)} (P4)`,
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
    {
      id: "g1-pocket-on-foot",
      ok: arrival !== null && footInPocket === 0 && escapes === 0,
      detail:
        `landing ${coordKey(ctx.device.landing)} (portal-only: the sealed column makes the far region unreachable on foot); ` +
        `pocket [${ctx.device.pocket.tiles.map(coordKey).join(" ")}] on-foot-reachable tiles=${String(footInPocket)} (required 0); ` +
        `arrival=${arrival === null ? "NOT FOUND" : `phase ${arrival.phase}`}; pre-press moves leaving the pocket into the far region=${String(escapes)} (required 0); ` +
        `moves back through the landing to the near end ${coordKey(ctx.device.near)}=${String(returns)} (named, not an escape: the landing IS a portal end)`,
    },
    {
      id: "g2-room-exits-are-doors",
      ok: g2Ok,
      detail: `${roomReport.join(" · ")} — §6.2.3 item 3 (F-L19-2: every blocker an openable door, no phase-wall exit)`,
    },
    {
      id: "g3-ordered-multi-press",
      ok: routes > 0 && chainOk === routes && minPresses >= 2,
      detail:
        `par=${String(par)} · ${String(routes)} shortest route(s); distinct switches pressed per route: min=${Number.isFinite(minPresses) ? String(minPresses) : "n/a"} ` +
        `histogram ${[...pressHistogram.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}; ` +
        `routes executing the strict chain press(${ctx.switch1.id}) < cross(${ctx.door1.id}) < press(${ctx.switch2.id}) < cross(${ctx.door2.id}) < press(${ctx.switch3.id}) < cross(${ctx.door3.id}) = ${String(chainOk)}/${String(routes)}`,
    },
    {
      id: "g4-switch-required",
      ok: allOffShortest === null && !goalReachableWithAllSwitchesOff(level, graph),
      detail:
        `allOffShortest=${allOffShortest === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOffShortest)} ` +
        `allOffGoalReachable=${String(goalReachableWithAllSwitchesOff(level, graph))} — the landing pocket's exit and the goal's only entrance are both doors whose base is closed in the needed phase`,
    },
    {
      id: "g5-identity-broken",
      ok: notAdjacent.length >= 1 && identityValue !== null && identityValue < par && minPresses >= 2,
      detail:
        `the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region ` +
        `(ai-native-pipeline §8.12 V1.5). Measured: ${String(sealTiles.length)} seal tile(s), ${String(notAdjacent.length)} NOT adjacent ` +
        `[${notAdjacent.map(coordKey).join(" ")}] (free region ${String(freePositions.size)} position(s)); ` +
        `the identity's VALUE — the world with the landing pocket's device removed — solves at ${identityValue === null ? "n/a" : String(identityValue)} < par ${String(par)}, ` +
        `while every par route presses ${Number.isFinite(minPresses) ? String(minPresses) : "?"} switch(es) through the chain (g3)`,
    },
    {
      id: "g6-multi-pocket",
      ok: components.length >= 3 && singleDoorRooms.length >= 2,
      detail:
        `far region split by walls+door tiles: ${String(components.length)} free component(s) ` +
        `${components.map((c, i) => `#${String(i + 1)}(size ${String(c.tiles.length)}, doorIds [${c.doorIds.join(" ")}])`).join(" ")}; ` +
        `components sealed by exactly one door object: ${String(singleDoorRooms.length)} ` +
        `(${singleDoorRooms.map((c) => `[${c.tiles.map(coordKey).join(" ")}]←${c.doorIds[0] ?? "-"}`).join(" ")}) — ` +
        `≥ 2 walk-sealed rooms is the multi-pocket class of §7.2/§7.4 stage G`,
    },
  ];
  void result;
  return gates;
}

interface Outcome {
  readonly accepted: boolean;
  readonly reason: string;
  readonly par?: number;
  readonly dexec?: number;
  readonly b?: number;
  readonly coverage?: string;
  readonly gates?: readonly Gate[];
  readonly routes?: number;
  readonly pressThenCross?: number;
}

function probePar(draft: Omit<Level, "par">): { reason: string; par: number } {
  const parsed = LevelSchema.safeParse({ ...draft, par: 1 });
  if (!parsed.success) return { reason: "schema", par: -1 };
  if (!validateLevel(parsed.data).ok) return { reason: "rules", par: -1 };
  const level = parsed.data as Level;
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { reason: "explosion", par: -1 };
  }
  const result = analyse(level, graph);
  if (!result.solvable || result.shortestSolution === null) return { reason: "unsolvable", par: -1 };
  return { reason: "ok", par: result.shortestSolution };
}

function judge(draft: Omit<Level, "par">, ctx: Context): { outcome: Outcome; level: Level | null } {
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
  if (!result.solvable || result.shortestSolution === null)
    return { outcome: { accepted: false, reason: "unsolvable" }, level: null };
  const proven: Level = { ...level, par: result.shortestSolution };
  const gates = gatesOf(proven, graph, ctx);
  const failed = gates.filter((g) => !g.ok);
  const diff = analyseDifficulty(proven, graph);
  let routes = 0;
  let pressThenCross = 0;
  forEachParRoute(proven, proven.par, (route) => {
    routes += 1;
    const chain = chainOfRoute(route, ctx);
    if (chain.ok) pressThenCross += 1;
  });
  return {
    outcome: {
      accepted: failed.length === 0,
      reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
      par: result.shortestSolution,
      dexec: diff.Dexec ?? Number.NaN,
      b: diff.B,
      coverage: `${String(result.distinctPositions)}/${String(level.width * level.height)}`,
      gates,
      routes,
      pressThenCross,
    },
    level: failed.length === 0 ? proven : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// G. The lattice
// ─────────────────────────────────────────────────────────────────────────────

/** One accept, as dumped for the selection stage (the level plus its measurements). */
interface Accept {
  readonly par: number;
  readonly dexec: number;
  readonly b: number;
  readonly coverage: string;
  readonly routes: number;
  readonly pressThenCross: number;
  readonly note: string;
  readonly level: Level;
}

function stageLattice(cut: { floor: number; actI: number; l15Par: number }, onlyLanding: string | null): Accept[] {
  const devs = devices(onlyLanding);
  console.log(
    `\nstage G multi-pocket lattice: ${String(devs.length)} leak-free landing device(s) ` +
      `(landing × near × pocket ≤ ${String(POCKET_MAX)}${onlyLanding === null ? "" : `, filtered to landing ${onlyLanding}`}) · ` +
      `second pocket ≤ ${String(QMAX)} · cap ${String(CAP)} tuple(s) per device · par band [${String(PAR_MIN)}, ${String(PAR_MAX)}] · ` +
      `D_exec band [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}]`,
  );
  const histogram = new Map<string, number>();
  const parHist = new Map<number, number>();
  const accepts: Accept[] = [];
  const skip = { noRoom2: 0, noGoal: 0, noS2: 0, noSg: 0, room2SealFail: 0, room2BoundaryFail: 0 };
  void skip;
  const misses: { reason: string; note: string; par: number; dexec: number; b: number; failing?: readonly Gate[] }[] = [];
  let total = 0;
  const t0 = Date.now();
  for (const dev of devs) {
    const d1: DoorDef = { id: "d1", color: closedIn(dev.pocket.entryPhase), tiles: dev.pocket.boundary };
    const k1 = new Set([...dev.pocket.tiles, ...dev.pocket.boundary].map(coordKey));
    const qPool = FAR_TILES.filter((t) => !k1.has(coordKey(t)));
    if (qPool.length < 2) skip.noRoom2 += 1;
    const s1Tiles = dev.pocket.tiles.filter((t) => coordKey(t) !== coordKey(dev.landing));
    for (const room2Tiles of roomCandidates(qPool, QMAX)) {
      // the second room must be sealed: every neighbour of it is one of its own door tiles
      const room2 = roomFrom(room2Tiles, dev.arrivalPhase, dev.landing);
      if (room2 === null) {
        skip.room2SealFail += 1;
        continue;
      }
      if (room2.boundary.some((b) => !qPool.some((t) => coordKey(t) === coordKey(b)))) {
        skip.room2BoundaryFail += 1;
        continue;
      }
      const d2: DoorDef = { id: "d2", color: closedIn(room2.entryPhase), tiles: room2.boundary };
      const used2 = new Set([...k1, ...room2.tiles.map(coordKey), ...room2.boundary.map(coordKey)]);
      const freePool = qPool.filter((t) => !used2.has(coordKey(t)));
      const goalPool = freePool.filter(
        (g) =>
          x(g) >= CX + 2 && // no column neighbour: else the goal is enterable from the corridor, which can hold no door
          walkNeighbours(g).length > 0 &&
          walkNeighbours(g).every((n) => freePool.some((t) => coordKey(t) === coordKey(n))),
      );
      const sgTiles = room2.tiles;
      const s2Tiles = freePool.filter((t) => !goalPool.some((g) => coordKey(g) === coordKey(t)));
      if (goalPool.length === 0) skip.noGoal += 1;
      if (s2Tiles.length === 0) skip.noS2 += 1;
      if (sgTiles.length === 0) skip.noSg += 1;
      if (goalPool.length === 0 || s2Tiles.length === 0 || sgTiles.length === 0) continue;
      let tried = 0;
      for (const s1Tile of s1Tiles) {
        const s1: SwitchDef = {
          id: "s1",
          tile: s1Tile,
          activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s1Tile),
          targets: ["d1"],
        };
        for (const s2Tile of s2Tiles) {
          const s2: SwitchDef = {
            id: "s2",
            tile: s2Tile,
            activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s2Tile),
            targets: ["d2"],
          };
          for (const sgTile of sgTiles) {
            const sg: SwitchDef = {
              id: "s3",
              tile: sgTile,
              activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, sgTile),
              targets: ["d3"],
            };
            for (const goal of goalPool) {
              if (tried >= CAP) break;
              tried += 1;
              total += 1;
              const sealTiles = walkNeighbours(goal);
              const d3: DoorDef = {
                id: "d3",
                color: closedIn(standPhase(dev.landing, dev.arrivalPhase, goal)),
                tiles: sealTiles,
              };
              const draft = {
                id: 21,
                width: W,
                height: H,
                startPhase: START_PHASE,
                player: PLAYER,
                goal,
                phaseAWalls: COLUMN.a,
                phaseBWalls: COLUMN.b,
                doors: [d1, d2, d3],
                switches: [s1, s2, sg],
                portals: [{ id: "p1", pair: [dev.near, dev.landing] as const, activePhase: dev.nearPhase }],
              };
              const ctx: Context = {
                cut,
                device: dev,
                door1: d1,
                switch1: s1,
                room2,
                door2: d2,
                switch2: s2,
                door3: d3,
                switch3: sg,
              };
              const note =
                `landing=${coordKey(dev.landing)} near=${coordKey(dev.near)}/${dev.nearPhase} ` +
                `P=[${dev.pocket.tiles.map(coordKey).join(" ")}] d1=[${dev.pocket.boundary.map(coordKey).join(" ")}]/${d1.color} ` +
                `s1=${coordKey(s1Tile)}/${s1.activePhase} ` +
                `Q=[${room2.tiles.map(coordKey).join(" ")}] d2=[${room2.boundary.map(coordKey).join(" ")}]/${d2.color} s2=${coordKey(s2Tile)}/${s2.activePhase} ` +
                `goal=${coordKey(goal)} d3=[${sealTiles.map(coordKey).join(" ")}]/${d3.color} sg=${coordKey(sgTile)}/${sg.activePhase}`;
              // the par band is the FILTER (the probe), the gates run on in-band boards only
              const probe = probePar(draft);
              if (probe.par < PAR_MIN || probe.par > PAR_MAX) {
                const reason = probe.reason === "ok" ? "par-out-of-band" : probe.reason;
                histogram.set(reason, (histogram.get(reason) ?? 0) + 1);
                if (probe.par > 0) parHist.set(probe.par, (parHist.get(probe.par) ?? 0) + 1);
                continue;
              }
              const { outcome, level } = judge(draft, ctx);
              if (!outcome.accepted || level === null) {
                histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
                if (outcome.par !== undefined)
                  misses.push({
                    reason: outcome.reason,
                    note,
                    par: outcome.par,
                    dexec: outcome.dexec ?? Number.NaN,
                    b: outcome.b ?? Number.NaN,
                    failing: (outcome.gates ?? []).filter((g) => !g.ok),
                  });
                continue;
              }
              accepts.push({
                par: outcome.par as number,
                dexec: outcome.dexec ?? Number.NaN,
                b: outcome.b ?? Number.NaN,
                coverage: outcome.coverage ?? "?",
                routes: outcome.routes ?? 0,
                pressThenCross: outcome.pressThenCross ?? 0,
                note,
                level,
              });
              if (accepts.length <= 40)
                console.log(
                  `  ACCEPT par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} B=${(outcome.b ?? 0).toFixed(4)} ` +
                    `coverage=${String(outcome.coverage)} routes=${String(outcome.routes)} chain=${String(outcome.pressThenCross)}/${String(outcome.routes)}\n          ${note}`,
                );
            }
            if (tried >= CAP) break;
          }
          if (tried >= CAP) break;
        }
        if (tried >= CAP) break;
      }
    }
  }
  console.log(
    `\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} judged candidate(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s`,
  );
  console.log(
    `upstream skips: room2 sets not sealable ${String(skip.room2SealFail)} · room2 boundary outside the free pool ${String(skip.room2BoundaryFail)} · ` +
      `devices with < 2 free tiles ${String(skip.noRoom2)} · no goal candidate ${String(skip.noGoal)} · no s2 tile ${String(skip.noS2)} · no sg tile ${String(skip.noSg)}`,
  );
  if (ROOM_FAIL.size > 0)
    console.log(`room rejections: ${[...ROOM_FAIL.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}`);
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${String(v)}`);
  console.log(
    `par census over every judged candidate: ` +
      `${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}`,
  );
  console.log("accepts by par:");
  const byPar = new Map<number, Accept[]>();
  for (const a of accepts) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const [p, list] of [...byPar.entries()].sort((a, b) => a[0] - b[0])) {
    const lo = Math.min(...list.map((a) => a.dexec));
    const hi = Math.max(...list.map((a) => a.dexec));
    console.log(
      `  par ${String(p)}: ${String(list.length)} accept(s), D_exec ${lo.toFixed(6)} … ${hi.toFixed(6)} ` +
        `(B ${Math.min(...list.map((a) => a.b)).toFixed(4)} … ${Math.max(...list.map((a) => a.b)).toFixed(4)})`,
    );
  }
  const atBand = misses.filter((m) => m.par >= PAR_MIN && m.par <= PAR_MAX);
  console.log(`in-band candidates refused by a gate: ${String(atBand.length)}`);
  for (const m of atBand.sort((a, b) => b.dexec - a.dexec).slice(0, 6)) {
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
    for (const g of m.failing ?? []) console.log(`      ${g.id}: ${g.detail}`);
  }
  writeFileSync(ACCEPTS, `${JSON.stringify(accepts)}\n`);
  console.log(`wrote ${String(accepts.length)} accept(s) to ${ACCEPTS}`);
  return accepts;
}

// ─────────────────────────────────────────────────────────────────────────────
// S. Selection — the five rungs, by a derived (not tasted) rule
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The selection rule, published before it runs.**
 *
 * 1. Rungs are `L21 … L25` in that order; every member must have `par` strictly inside
 *    Act II's 16–24 band (17…23) and `D_exec` inside `[19.75, 29.06]`; `B` inside the
 *    measured band.
 * 2. `D_exec` must **strictly rise** along the batch (§7.3's act law: "plateau only at
 *    act-open, labelled `ΔM = 0`, never a dip" — and a *rise* is the obligation the
 *    batch can prove).
 * 3. Among the admissible five-rung ladders, prefer the one that maximises the number
 *    of `Δpar ≥ 2` steps (§6.1.1 P2), then the one whose **minimal** per-rung `D_exec`
 *    is largest (so the selection is not merely the cheapest board at each par), then
 *    the lowest total `D_exec` spread (fewer ties to break by enumeration order).
 * 4. **Clause added by LV-012 before anything was written** — §6.1.4 / `src/levels/README.md`
 *    §2e-4: *"a spawn/goal/portal triple already present in the shipped set or among the
 *    landed candidates is skipped outright, so a new rung can never be the previous board
 *    with more moves."* Read here over the **stricter seal-inclusive** key (spawn · goal ·
 *    portal pair · every door tile), so the constraint bites on doors too: no rung may key
 *    an existing board, and the five rungs must carry **five distinct** keys. Amended
 *    before the write, and the first rule draft was measured to violate it (two rungs at
 *    `landing 5,5 / near 0,5` with identical portals and doors — a clone-and-perturb of the
 *    same skeleton, exactly what §6.1.4 names), which is why the clause is a *filter* and
 *    not a preference.
 *
 * The par-step preference is a *preference*, not a gate, and that is itself a measured
 * finding: five rungs inside a 7-wide par window cannot all step by 2 — `17 + 2·4 = 25 >
 * 23`, so at most two steps can be 2 (spread ≤ 6 over four steps). The violated step is
 * reported beside the ladder, never hidden.
 */
function selectBatch(accepts: readonly Accept[]): { level: Level; accept: Accept }[] {
  const takenKeys = new Set(cloneGuardCensus(true).keys());
  const inBand = accepts.filter(
    (a) =>
      a.par >= PAR_MIN &&
      a.par <= PAR_MAX &&
      a.dexec >= ACT2_EXEC_BAND[0] &&
      a.dexec <= ACT2_EXEC_BAND[1] &&
      a.b >= BLOCK_L1619_B_BAND[0] &&
      a.b <= BLOCK_L1619_B_BAND[1] &&
      Number.isFinite(a.dexec),
  );
  const usable = inBand.filter((a) => !takenKeys.has(cloneKeyOf(a.level)));
  console.log(
    `\nselection filter: ${String(inBand.length)} accept(s) inside the bands · ` +
      `${String(inBand.length - usable.length)} refused by the §6.1.4 clone guard (key already taken by a shipped board) · ` +
      `${String(usable.length)} usable · ${String(takenKeys.size)} key(s) already taken`,
  );
  const byPar = new Map<number, Accept[]>();
  for (const a of usable) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const list of byPar.values()) list.sort((p, q) => p.dexec - q.dexec);
  const pars = [...byPar.keys()].sort((a, b) => a - b);
  const combos: number[][] = [];
  const pick = (start: number, acc: number[]): void => {
    if (acc.length === 5) {
      combos.push([...acc]);
      return;
    }
    for (let i = start; i < pars.length; i += 1) {
      acc.push(pars[i] as number);
      pick(i + 1, acc);
      acc.pop();
    }
  };
  pick(0, []);
  interface Ladder {
    levels: { level: Level; accept: Accept }[];
    score: [number, number, number];
    pars: number[];
  }
  let best: Ladder | null = null;
  let comboCloneBlocked = 0;
  let comboNoRise = 0;
  for (const combo of combos) {
    // greedy minimal-D_exec strictly-rising ladder inside this par combo, distinct keys
    let prev = Number.NEGATIVE_INFINITY;
    const chosen: { level: Level; accept: Accept }[] = [];
    const usedKeys = new Set<string>();
    let ok = true;
    for (const p of combo) {
      const pool = (byPar.get(p) ?? []).filter((a) => a.dexec > prev);
      const candidate = pool.find((a) => !usedKeys.has(cloneKeyOf(a.level)));
      if (candidate === undefined) {
        ok = false;
        if (pool.length > 0) comboCloneBlocked += 1;
        else comboNoRise += 1;
        break;
      }
      chosen.push({ level: candidate.level, accept: candidate });
      usedKeys.add(cloneKeyOf(candidate.level));
      prev = candidate.dexec;
    }
    if (!ok) continue;
    const steps2 = combo
      .map((p, i) => (i === 0 ? null : p - (combo[i - 1] ?? 0)))
      .filter((d): d is number => d !== null && d >= 2).length;
    const first = chosen[0];
    const last = chosen[chosen.length - 1];
    if (first === undefined || last === undefined) continue;
    const minExec = Math.min(...chosen.map((c) => c.accept.dexec));
    const spread = last.accept.dexec - first.accept.dexec;
    const score: [number, number, number] = [steps2, minExec, -spread];
    const incumbent: Ladder | null = best;
    if (
      incumbent === null ||
      score[0] > incumbent.score[0] ||
      (score[0] === incumbent.score[0] && score[1] > incumbent.score[1]) ||
      (score[0] === incumbent.score[0] && score[1] === incumbent.score[1] && score[2] > incumbent.score[2])
    )
      best = { levels: chosen, score, pars: combo };
  }
  if (best === null) {
    console.log("selection: NO admissible ladder in the accept set — report the census, never fabricate a rung");
    return [];
  }
  console.log(
    `\nselection: ${String(combos.length)} par combo(s) tried · ${String(comboNoRise)} dropped by the rising-D_exec clause · ` +
      `${String(comboCloneBlocked)} dropped by the clone clause (a par's whole in-band pool keyed on already-used geometry)`,
  );
  console.log(
    `selection: pars [${best.pars.join(", ")}] · Δpar≥2 steps ${String(best.score[0])}/4 · ` +
      `min D_exec ${best.score[1].toFixed(6)} · spread ${(-best.score[2]).toFixed(6)}`,
  );
  const batchKeys = new Set(best.levels.map((c) => cloneKeyOf(c.level)));
  console.log(
    `clone census on the ladder: ${String(batchKeys.size)} distinct §6.1.4 key(s) over ${String(best.levels.length)} rung(s) · ` +
      `${String(best.levels.filter((c) => takenKeys.has(cloneKeyOf(c.level))).length)} key(s) colliding with a shipped board`,
  );
  for (let i = 0; i < best.levels.length; i += 1) {
    const c = best.levels[i] as { level: Level; accept: Accept };
    console.log(
      `  L${String(21 + i)} par=${String(c.accept.par)} D_exec=${c.accept.dexec.toFixed(6)} B=${c.accept.b.toFixed(4)} ` +
        `coverage=${c.accept.coverage} chain=${String(c.accept.pressThenCross)}/${String(c.accept.routes)}\n` +
        `    key=${cloneKeyOf(c.level)}\n    ${c.accept.note}`,
    );
  }
  return best.levels;
}

function stageSelect(): void {
  const accepts = JSON.parse(readFileSync(ACCEPTS, "utf8")) as Accept[];
  console.log(`read ${String(accepts.length)} accept(s) from ${ACCEPTS}`);
  const chosen = selectBatch(accepts);
  if (chosen.length === 0) return;
  if (!WRITE) {
    console.log("(dry run — pass --write to land the five candidates)");
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < chosen.length; i += 1) {
    const level: Level = { ...(chosen[i] as { level: Level }).level, id: 21 + i };
    const file = join(OUT_DIR, `l${String(level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(level, null, 2)}\n`);
    console.log(`wrote ${file} (par ${String(level.par)})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// run
// ─────────────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(
  `author-l21 (G lattice, Act II batch 1) — CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = ${cut.floor.toFixed(6)} · ` +
    `Act I measured peak (ids 1–20) = ${cut.actI.toFixed(6)} · par(L15) = ${String(cut.l15Par)} · ` +
    `B band [${cut.bBand[0].toFixed(4)}, ${cut.bBand[1].toFixed(4)}] · basis ids [${cut.basis.join(", ")}]`,
);
const law = preflightLaw();
console.log(
  `preflight parity law: ${String(law.boards)} board(s), ${String(law.states)} state(s), ${String(law.moves)} legal move(s), ` +
    `${String(law.bimodal)} bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)`,
);
const guard = cloneGuardCensus();
console.log(`clone guard (§6.1.4, seal-inclusive key): ${String(guard.size)} geometry key(s) taken [${[...guard.values()].join(", ")}]`);

if (STAGE === "frame") frameCensus();
else if (STAGE === "g") stageLattice(cut, argOf("only"));
else if (STAGE === "s") stageSelect();
else console.log(`unknown stage "${STAGE}" — use frame | g | s`);

void BLOCK_L1619_PAR_BASE;
void BLOCK_L1619_TAIL_EXEC_CEILING;
void initialState;
void solidAt;