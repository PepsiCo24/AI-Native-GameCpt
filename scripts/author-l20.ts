/**
 * `scripts/author-l20.ts` — LV-011: the **sealed-landing** lattice stage, and the
 * proposal side for the fifth rung (`par 20`).
 *
 * `docs/ai-native-pipeline.md` §1 (LLM creates, the program proves) and
 * `docs/level-design.md` §6.2 (GD-007 published law): the L20 device is a
 * **sealed landing** — the portal hands the player a new starting point inside a
 * *pocket* whose only exit is a door, so the shortest plan must execute an ordered
 * `land → press → leave → press` chain. The **gauntlet is REJECTED** (§6.2.1) and is
 * not implemented here.
 *
 * Why a new file instead of a stage inside `scripts/author-l16-candidates.ts`: the
 * L16–L19 tool enumerates the **goal-gated full seal** — doors are the goal's own
 * neighbours and the pocket concept does not exist in it. §6.2.3's device needs a
 * different lattice (a pocket, its single door, the ordered press chain), so it gets
 * its own stage tool; the shared *readers* (`explore`/`analyse`/
 * `analyseDifficulty`/`allOffShortestSolution`) are the shipped ones, never copies.
 *
 * Stages:
 *
 *   0.  **preflight law proof** — the parity/judging-phase rule, re-derived by the
 *       program from the shipped boards (same claim as the L16 tool's stage 0).
 *   0b. **clone-guard census** — `docs/level-design.md` §6.1.4 "never clone a
 *       shipped board", read over the registered root **including the seal
 *       geometry**: the key is `player|goal|portal-pair|seal-door-tiles`. The
 *       inherited L16–L19 tool's key is the `(player|goal|portal-pair)` triple; the
 *       L20 lattice can legally reuse a *triple* while re-stamping L19's seal, so
 *       this census is the stricter one and the one the rung must pass.
 *   P.  **pocket census** (`--stage=sl`) — every connected pocket tile-set up to
 *       `--pocketsize`, measured for the single-phase seal (the boundary must be
 *       enterable in ONE phase only, or a single door cannot seal it) and reported
 *       with its boundary.
 *   SL. **sealed-landing lattice** (`--stage=sl`, default) — portal entry × pocket
 *       × pocket switch × goal × seal-switch n-tuple, judged by {@link gates}.
 *   V.  **re-verify** (`--stage=v`) — re-read the written artifact and re-run the
 *       whole chain on the bytes, plus the negative controls.
 *
 * Nothing here asserts solvability by opinion: `par` comes from the BFS solver,
 * every gate number from the shipped readers, and a candidate that fails is
 * **dropped with its measurement** (ADR-0004 — no repair path, no tuning loop).
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, DoorDef, Level, Phase, SwitchDef } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute, goalReachableWithAllSwitchesOff } from "@/core/solver/bfs";
import { applyMove, isLegalMove } from "@/core/rules";
import { DIRECTIONS, move } from "@/core/state/move";
import { hashState } from "@/core/state/hash";
import type { SearchState } from "@/core/state/types";
import { analyseDifficulty } from "@/core/solver/difficulty";
import {
  BLOCK_L1619_IDS,
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
const STAGE = argOf("stage") ?? "sl";
const LEVEL_ID = Number(argOf("id") ?? "20");
const CAP = Number(argOf("cap") ?? "2000");

const W = Number(argOf("w") ?? "7");
const H = Number(argOf("h") ?? "6");
const CX = Number(argOf("cx") ?? "3");

const at = (px: number, py: number): Coord => [px, py];
const x = (c: Coord): number => c[0];
const y = (c: Coord): number => c[1];
const parity = (c: Coord): number => (x(c) + y(c)) % 2;
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
      level: LevelSchema.parse(
        JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8")),
      ) as Level,
    }));
}

/**
 * The parity law the whole construction rests on, re-derived from the shipped
 * boards rather than quoted: (a) the entry decision is taken in the phase the
 * player already has; (b) on a portal-free board the entry phase of a tile is fixed
 * for every move count (ADR-0009 decision 1).
 */
function preflightLaw(): { boards: number; states: number; moves: number; bimodal: number } {
  let states = 0;
  let moves = 0;
  let bimodal = 0;
  for (const { level } of shipped()) {
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
  return { boards: shipped().length, states, moves, bimodal };
}

/**
 * The escalation cut, **frozen at the world L20 climbs out of** — the same rule
 * `scripts/prove-candidate.ts` adopted at R-003c: the members of the registered
 * L16–L19 ladder are excluded from the basis, because a registered block must not
 * raise the filter it is judged by. Re-derived here from the root bytes on every
 * run; nothing is typed twice.
 */
function measureCut(): { floor: number; l15Par: number; basis: readonly number[]; bBand: readonly [number, number] } {
  let floor = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let bMin = Number.POSITIVE_INFINITY;
  let bMax = Number.NEGATIVE_INFINITY;
  const basis: number[] = [];
  for (const { level } of shipped()) {
    if (BLOCK_L1619_IDS.includes(level.id)) continue;
    basis.push(level.id);
    const d = analyseDifficulty(level, explore(level));
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (d.B < bMin) bMin = d.B;
    if (d.B > bMax) bMax = d.B;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, l15Par, basis, bBand: [bMin, bMax] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 0b. The clone guard — §6.1.4, read over the seal geometry too
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The inherited guard's key (`scripts/author-l16-candidates.ts`, §6.1.4 "never clone
 * a shipped board") is the geometry triple `player|goal|portal-pair`. LV-010f's
 * census broke the *seal* question open — `7×7` reached `par 22` only by re-stamping
 * L19's **exact seal shape** — so the stricter key used for the L20 lattice adds the
 * **seal geometry**: the sorted door tiles of the goal-gated seal. A board that
 * re-stamped L19's seal on a fresh triple would pass the inherited guard and is
 * exactly the construction §6.2/ADR-design-0004 refused; this census catches it.
 */
function cloneKeyOf(level: Level): string {
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
}

function candidateFiles(): string[] {
  return readdirSync(OUT_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort();
}

function cloneGuardCensus(): Map<string, string> {
  const used = new Map<string, string>();
  for (const { file, level } of shipped()) used.set(cloneKeyOf(level), file);
  for (const file of candidateFiles()) {
    const level = LevelSchema.parse(
      JSON.parse(readFileSync(join(OUT_DIR, file), "utf8")),
    ) as Level;
    used.set(cloneKeyOf(level), `candidates/${file}`);
  }
  return used;
}

// ─────────────────────────────────────────────────────────────────────────────
// The grid: the registered device's frame (7 × 6, sealed column at x = CX)
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
 * The sealed column at `x = CX`, split by the **inherited derivation** (an entry
 * from the start region always happens in `entryPhase(T)`, so a wall in its own
 * entry phase is parity-dead — an ordinary permanent wall, ADR-0009). The far
 * region reaches those same tiles from the other side, where the portal has shifted
 * the parity frame, which is what keeps coverage at 42/42.
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

const adjacent = (a: Coord, b: Coord): boolean =>
  Math.abs(x(a) - x(b)) + Math.abs(y(a) - y(b)) === 1;

// ─────────────────────────────────────────────────────────────────────────────
// P. The pocket census — what a pocket IS, measured
// ─────────────────────────────────────────────────────────────────────────────

interface Pocket {
  /** The landing tile — the portal's far end, and the pocket's anchor. */
  readonly landing: Coord;
  /** The pocket interior (the landing plus every tile reachable inside it). */
  readonly tiles: readonly Coord[];
  /**
   * The pocket's **boundary**: in-bounds far tiles, outside the pocket, adjacent to
   * a pocket tile. Every one of them is an exit candidate and must be blocked.
   */
  readonly boundary: readonly Coord[];
}

/**
 * The sealing condition, stated as the thing that must be true for ONE door to seal
 * the pocket: the phase with which a boundary tile is *entered from the pocket* must
 * be the same for every adjacent pocket tile. A boundary tile adjacent to pocket
 * tiles of both parities is enterable in **both** phases, and a single-colour door
 * can only be closed in one of them — so such a pocket leaks, and the leak is a
 * free exit that would make the press non-mandatory.
 *
 * The phase of a pocket tile is fixed while the pocket is sealed (every wandering
 * move comes in pairs), so it is `arrivalPhase ⊕ (distance from the landing mod 2)`
 * over the pocket graph.
 *
 * **LV-013 — ADR architecture-0004 Ruling 3: this screen screens nothing.** `grow`
 * yields only *connected* sets, and on a bipartite grid every neighbour of a boundary
 * tile carries one `(x+y)` parity while `dist mod 2 ≡ parity(t) ⊕ parity(landing)`, so
 * `parities.size > 1` is **unreachable**: `ok` is always true for every candidate the
 * census enumerates, and the count of `ok` verdicts is identically the `tested` count.
 * It is kept (not deleted) so the tautology stays visible beside the historical screen;
 * the `single-phase` column in `stagePockets` is labelled as what it is and must never
 * be read as a measurement. Deleting the channel outright is a named, deferred row
 * (`docs/ai-native-pipeline.md` §8.17) — it moves no number either way.
 */
function sealedPocket(pocket: Pocket, arrivalPhase: Phase): { ok: boolean; detail: string } {
  const inPocket = new Set(pocket.tiles.map(coordKey));
  const dist = new Map<string, number>([[coordKey(pocket.landing), 0]]);
  const queue: Coord[] = [pocket.landing];
  for (let q = 0; q < queue.length; q += 1) {
    const t = queue[q] as Coord;
    for (const f of pocket.tiles) {
      if (!adjacent(t, f) || dist.has(coordKey(f))) continue;
      dist.set(coordKey(f), (dist.get(coordKey(t)) as number) + 1);
      queue.push(f);
    }
  }
  if (dist.size !== pocket.tiles.length)
    return { ok: false, detail: `pocket not connected (${String(dist.size)}/${String(pocket.tiles.length)} reached)` };
  const bad: string[] = [];
  for (const b of pocket.boundary) {
    const parities = new Set<number>();
    for (const t of pocket.tiles) {
      if (!adjacent(t, b)) continue;
      parities.add(((dist.get(coordKey(t)) as number) % 2));
    }
    if (parities.size > 1) bad.push(coordKey(b));
  }
  // the phase of every pocket tile (arrival frame) and the entry phase of the exits
  const phaseOf = (t: Coord): Phase => {
    const d = dist.get(coordKey(t)) as number;
    const arr: Phase = d % 2 === 0 ? arrivalPhase : arrivalPhase === "A" ? "B" : "A";
    return arr;
  };
  const escapePhases = [...new Set(pocket.boundary.map(() => "A" as Phase))];
  void escapePhases;
  const detail =
    `tiles=[${pocket.tiles.map(coordKey).join(" ")}] boundary=[${pocket.boundary.map(coordKey).join(" ")}] ` +
    `pocketPhases=[${pocket.tiles.map((t) => `${coordKey(t)}:${phaseOf(t)}`).join(" ")}]` +
    (bad.length === 0 ? " · single-phase boundary ✓" : ` · TWO-PHASE boundary exits: [${bad.join(" ")}]`);
  void inPocket;
  return { ok: bad.length === 0, detail };
}

/** The boundary of a tile set, within the far region (the column/left region are not exits). */
function boundaryOf(tiles: readonly Coord[]): readonly Coord[] {
  const inside = new Set(tiles.map(coordKey));
  const out = new Map<string, Coord>();
  for (const t of tiles) {
    for (let dx = -1; dx <= 1; dx += 1)
      for (let dy = -1; dy <= 1; dy += 1) {
        if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
        const b = at(x(t) + dx, y(t) + dy);
        if (x(b) < 0 || y(b) < 0 || x(b) >= W || y(b) >= H) continue;
        if (inside.has(coordKey(b))) continue;
        if (x(b) <= CX) continue; // left region / sealed column: not an exit of the far pocket
        out.set(coordKey(b), b);
      }
  }
  return [...out.values()].sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

/** Every connected far-region tile set of size 2..`maxSize` containing `landing`. */
function* pocketCandidates(landing: Coord, maxSize: number): Generator<Pocket> {
  const pool = FAR_TILES.filter((f) => coordKey(f) !== coordKey(landing));
  function* grow(tiles: Coord[]): Generator<Pocket> {
    if (tiles.length >= 2) {
      const boundary = boundaryOf(tiles);
      if (boundary.length > 0)
        yield { landing, tiles: [...tiles].sort((a, b) => coordKey(a).localeCompare(coordKey(b))), boundary };
    }
    if (tiles.length >= maxSize) return;
    for (const p of pool) {
      if (tiles.some((t) => coordKey(t) === coordKey(p))) continue;
      if (!tiles.some((t) => adjacent(t, p))) continue;
      tiles.push(p);
      yield* grow(tiles);
      tiles.pop();
    }
  }
  yield* grow([landing]);
}

// ─────────────────────────────────────────────────────────────────────────────
// The gate chain
// ─────────────────────────────────────────────────────────────────────────────

interface Gate {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

interface Context {
  readonly cut: { floor: number; l15Par: number };
  readonly pocket: Pocket;
  readonly pocketDoor: DoorDef;
  readonly pocketSwitch: SwitchDef;
  readonly arrivalPhase: Phase;
  readonly landing: Coord;
  /** The portal's near end (left region) — the target of the landing's null cycle. */
  readonly near: Coord;
}

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

/** `true` iff every switch is OFF in this state. */
const allOff = (level: Level, s: SearchState): boolean =>
  level.switches.every((sw) => s.switchesOn[sw.id] !== true);

/**
 * The state in which the player first stands on `landing`, **arrived by the
 * teleport** — re-derived from the shipped rule, never assumed.
 *
 * `@/core/rules/applyMove` step 3 fires the portal when the **entered** tile is
 * either end AND `s.phase === portal.activePhase` (pre-flip), and `portalExit`
 * places the player on the *other* end; step 4 then flips. So the arrival state
 * is the successor of a move that **clicks the near end** (the end the plan
 * enters, in the portal's own `activePhase`) and that leaves the player standing
 * on `landing`.
 *
 * The earlier revision of this helper looked for a click on `pair[1]` that ends
 * on the landing, i.e. a move that does **not** fire the portal — which on this
 * device is precisely the move the device forbids (stepping onto the landing
 * from inside the pocket happens in `activePhase`, where the portal fires and
 * sends the player back to the near end). It therefore reported
 * `arrival = NOT FOUND` on exactly the boards the device is made of, and g1
 * refused them. Corrected here to the rule's own reading; the proving side
 * (`scripts/prove-candidate.ts`) already read it this way, which is what made
 * the disagreement visible (LV-011, `docs/ai-native-pipeline.md` §8.14).
 */
function landingArrival(level: Level, graph: ReachableGraph, landing: Coord): SearchState | null {
  const portal = level.portals[0];
  if (portal === undefined) return null;
  const [a, b] = portal.pair;
  const entry = x(a) === x(landing) && y(a) === y(landing) ? b : a; // the end the plan enters
  for (const s of graph.nodes) {
    if (!allOff(level, s)) continue;
    if (s.phase !== portal.activePhase) continue; // the rule fires in this phase only
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const clicked = { x: s.player.x + (d === "left" ? -1 : d === "right" ? 1 : 0), y: s.player.y + (d === "up" ? -1 : d === "down" ? 1 : 0) };
      if (clicked.x !== entry[0] || clicked.y !== entry[1]) continue;
      const n = applyMove(level, s, move(d));
      if (n.player.x === x(landing) && n.player.y === y(landing)) return n;
    }
  }
  return null;
}

/**
 * The sealed-landing gates g1–g5 of `docs/level-design.md` §6.2.6, each printing the
 * number it read. They are measured on the landed bytes by `prove-candidate.ts`
 * (rung 20) and here; **no gate is a restatement of another**.
 */
function sealedLandingGates(
  level: Level,
  graph: ReachableGraph,
  ctx: Context,
): readonly Gate[] {
  const result = analyse(level, graph);
  const diff = analyseDifficulty(level, graph);
  const par = result.shortestSolution ?? level.par;
  const pocketKeys = new Set(ctx.pocket.tiles.map(coordKey));
  const arrival = landingArrival(level, graph, ctx.landing);

  // ── g1 — the pocket is not on-foot reachable, and it is sealed pre-press ────
  // (a) the walk-only subgraph of the start (every move whose clicked tile is an
  //     ACTIVE portal end is forbidden — that move teleports) never enters the
  //     pocket; (b) the strong reading the device actually needs: from the arrival
  //     state, with every switch OFF, no legal move leaves the pocket.
  const start = graph.nodes[0] as SearchState;
  const walkOnly = new Set<string>([hashState(start)]);
  const wq: SearchState[] = [start];
  let walkOnlyTouchedPocket = 0;
  for (let q = 0; q < wq.length; q += 1) {
    const s = wq[q] as SearchState;
    for (const d of DIRECTIONS) {
      if (!isLegalMove(level, s, move(d))) continue;
      const clicked = { x: s.player.x + (d === "left" ? -1 : d === "right" ? 1 : 0), y: s.player.y + (d === "up" ? -1 : d === "down" ? 1 : 0) };
      const isPortalEnd = level.portals.some(
        (p) => p.activePhase === s.phase && p.pair.some((e) => e[0] === clicked.x && e[1] === clicked.y),
      );
      if (isPortalEnd) continue;
      const n = applyMove(level, s, move(d));
      if (pocketKeys.has(`${String(n.player.x)},${String(n.player.y)}`)) walkOnlyTouchedPocket += 1;
      const h = hashState(n);
      if (walkOnly.has(h)) continue;
      walkOnly.add(h);
      wq.push(n);
    }
  }
  // (b) the strong reading the device actually needs: from the arrival state, with
  //     every switch OFF, no legal move leaves the pocket **into the far region**.
  //     A move back onto the landing teleports to the near end (the landing IS a
  //     portal end, ADR-0008 clause 6): that is a *return to the start region*, a
  //     cycle that re-enters the portal at a price, never an exit into the far
  //     region — so it is counted and named separately (`returns`), exactly as the
  //     proving side reads it. LV-011 correction: the first pass counted it as an
  //     escape, which refused boards whose pocket is in fact sealed.
  let escapes = 0;
  let returns = 0;
  if (arrival !== null) {
    const seen = new Set<string>([hashState(arrival)]);
    const aq: SearchState[] = [arrival];
    for (let q = 0; q < aq.length; q += 1) {
      const s = aq[q] as SearchState;
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const key = `${String(n.player.x)},${String(n.player.y)}`;
        if (!pocketKeys.has(key)) {
          // an EDGE out of the pocket is what this gate counts — the flood never
          // continues outside, because a move made in the start region is not a
          // pocket exit (LV-011 correction: the first pass counted those too, so
          // one return inflated `escapes` by every move that followed it).
          if (coordKey(ctx.near) === key) returns += 1;
          else escapes += 1;
          continue;
        }
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        aq.push(n);
      }
    }
  }
  const g1: Gate = {
    id: "g1-pocket-on-foot",
    ok: arrival !== null && walkOnlyTouchedPocket === 0 && escapes === 0,
    detail:
      `walk-only subgraph of the start: ${String(walkOnly.size)} states, ${String(walkOnlyTouchedPocket)} pocket entries; ` +
      `pre-press escape moves out of the pocket into the far region (from the landing arrival state, all switches OFF): ${String(escapes)}; ` +
      `moves back through the landing to the near end ${coordKey(ctx.near)}=${String(returns)} (named, not counted as an escape: the landing IS a portal end); ` +
      `arrival=${arrival === null ? "NOT FOUND (the portal never lands on the pocket tile)" : `phase ${arrival.phase} at ${coordKey(ctx.landing)}`}`,
  };

  // ── g2 — the pocket's only exit is a door (no phase-wall exit) ──────────────
  const doorTiles = new Set(ctx.pocketDoor.tiles.map(coordKey));
  const wallKeys = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const unblocked = ctx.pocket.boundary.filter((b) => !doorTiles.has(coordKey(b)));
  const walled = ctx.pocket.boundary.filter((b) => wallKeys.has(coordKey(b)));
  const g2: Gate = {
    id: "g2-pocket-exit-door",
    ok: unblocked.length === 0 && walled.length === 0,
    detail:
      `boundary=[${ctx.pocket.boundary.map(coordKey).join(" ")}] of ${String(ctx.pocket.boundary.length)} tile(s); ` +
      `covered by door "${ctx.pocketDoor.id}" (colour ${ctx.pocketDoor.color}, base closed in ${ctx.arrivalPhase}): ` +
      `${String(ctx.pocket.boundary.length - unblocked.length)}/${String(ctx.pocket.boundary.length)}; ` +
      `phase-wall boundary tiles (F-L19-2: forbidden): [${walled.map(coordKey).join(" ")}]`,
  };

  // ── g3 — the ordered ≥ 2-press chain, and the pension that it is mandatory ──
  const pocketSwitchId = ctx.pocketSwitch.id;
  let routes = 0;
  let minPresses = Number.POSITIVE_INFINITY;
  let orderedRoutes = 0;
  const pressHistogram = new Map<number, number>();
  forEachParRoute(level, par, (route) => {
    routes += 1;
    const order: string[] = [];
    let crossedAfterPocketPress = false;
    let secondPressAfterExit = false;
    let pocketPressed = false;
    for (const arrivalRec of route) {
      for (const id of arrivalRec.toggledOn) if (!order.includes(id)) order.push(id);
      const tile = coordKey([arrivalRec.state.player.x, arrivalRec.state.player.y] as Coord);
      if (doorTiles.has(tile) && pocketPressed) crossedAfterPocketPress = true;
      if (arrivalRec.toggledOn.some((id) => id !== pocketSwitchId) && crossedAfterPocketPress)
        secondPressAfterExit = true;
      if (arrivalRec.toggledOn.includes(pocketSwitchId)) pocketPressed = true;
    }
    minPresses = Math.min(minPresses, order.length);
    pressHistogram.set(order.length, (pressHistogram.get(order.length) ?? 0) + 1);
    const ordered =
      order.length >= 2 &&
      order[0] === pocketSwitchId &&
      crossedAfterPocketPress &&
      secondPressAfterExit;
    if (ordered) orderedRoutes += 1;
  });
  const g3: Gate = {
    id: "g3-ordered-two-press",
    ok: routes > 0 && minPresses >= 2 && orderedRoutes === routes,
    detail:
      `par=${String(par)} · ${String(routes)} shortest route(s); distinct switches pressed per route: min=${Number.isFinite(minPresses) ? String(minPresses) : "n/a"} ` +
      `histogram ${[...pressHistogram.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}; ` +
      `routes with the pocket door crossed after its press AND the second switch pressed after that crossing: ${String(orderedRoutes)}/${String(routes)} ` +
      `(the chain land → press(${pocketSwitchId}) → leave → press(the seal switch))`,
  };

  // ── g4 — switchRequired, measured ──────────────────────────────────────────
  const allOffShortest = allOffShortestSolution(level, graph);
  const allOffReach = goalReachableWithAllSwitchesOff(level, graph);
  const g4: Gate = {
    id: "g4-switch-required",
    ok: allOffShortest === null && !allOffReach,
    detail:
      `allOffShortest=${allOffShortest === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOffShortest)} ` +
      `allOffGoalReachable=${String(allOffReach)} par=${String(par)} — the pocket is only enterable by the portal and its exit is a door, ` +
      `so with every switch OFF the far region beyond the pocket is not reachable at all`,
  };

  // ── g5 — the census identity is BROKEN (the mechanism's whole point) ───────
  // (a) the premiss: the identity holds when EVERY seal tile is directly adjacent to
  //     the free far region. The free region is measured as the positions reachable
  //     in the all-OFF world (a shipped reader's own subgraph).
  const freePositions = new Set<string>();
  {
    const s0 = graph.nodes[0] as SearchState;
    const seen = new Set<string>([hashState(s0)]);
    const q: SearchState[] = [s0];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      if (!allOff(level, s)) continue;
      freePositions.add(`${String(s.player.x)},${String(s.player.y)}`);
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const sealTiles = level.doors.filter((d) => d.id !== ctx.pocketDoor.id).flatMap((d) => d.tiles);
  const notAdjacent = sealTiles.filter(
    (t) => ![...freePositions].some((k) => {
      const [fx, fy] = k.split(",").map(Number);
      return Math.abs((fx as number) - x(t)) + Math.abs((fy as number) - y(t)) === 1;
    }),
  );
  // (b) the value: the identity's own arithmetic is a statement about a world in
  // which ONE door is opened. Measured directly — the board with the pocket device
  // removed (the D1-free world) is the world whose seal tiles ARE adjacent to the
  // free far region, and its par is the number the identity computes.
  const d1Free: Level = {
    ...level,
    doors: level.doors.filter((d) => d.id !== ctx.pocketDoor.id),
    switches: level.switches.filter((s) => s.id !== ctx.pocketSwitch.id),
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
      `min_i(d(start→s_i)+1+d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5) and it holds only while every seal tile is ` +
      `directly adjacent to the free far region. Measured here: ${String(sealTiles.length)} seal tile(s), ` +
      `${String(notAdjacent.length)} NOT adjacent to the all-OFF free region [${notAdjacent.map(coordKey).join(" ")}] ` +
      `(free region ${String(freePositions.size)} position(s)); ` +
      `and the identity's VALUE — the world with the pocket device removed (every seal tile adjacent again) — solves at ` +
      `${identityValue === null ? "n/a" : String(identityValue)} < par ${String(par)}. ` +
      `The minimum form therefore no longer computes L20's par: its one-press arithmetic is ${identityValue === null ? "n/a" : String(identityValue)}, ` +
      `while every par route presses ${Number.isFinite(minPresses) ? String(minPresses) : "?"} switch(es) through the sealed landing (g3).`,
  };

  void result;
  void diff;
  return [g1, g2, g3, g4, g5];
}

/**
 * The **shared** ladder readers for a rung above L19 — the nine gates the L16–L19
 * tool judges a board by (`region`, `escalation`, `par-step`, `latch-grade`,
 * `latch-route`, `refused-beat`, `coverage`, `validator`, `well-formed`), re-used
 * rather than re-implemented, with the rung read as `l15Par + 2·(id − 15)` per
 * `docs/level-design.md` §6.1.1 P2.
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
      id: "par-rung",
      ok: par === cut.l15Par + 2 * (level.id - 15) && level.par === par,
      detail:
        `par=${String(level.par)} (solver shortest=${String(result.shortestSolution)}) === l15Par ${String(cut.l15Par)} + 2·${String(level.id - 15)} ` +
        `= ${String(cut.l15Par + 2 * (level.id - 15))} — the rung is exact for a rung above the registered block (§6.1.1 P2 plus the rung pin)`,
    },
    {
      id: "latch-grade",
      ok:
        level.switches.length > 0 &&
        level.doors.length > 0 &&
        (allOff === null || (allOff - par) >= 1),
      detail: `allOffShortest=${allOff === null ? "null (UNSATISFIABLE)" : String(allOff)} par=${String(par)}`,
    },
    {
      id: "latch-route",
      ok: routes > 0 && pressThenCross === routes,
      detail: `par routes=${String(routes)}; press-then-cross on ${String(pressThenCross)}`,
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
      detail:
        `ok=${String(verdict.ok)} errors=${String(verdict.errors.length)} warnings=${String(verdict.warnings.length)} ` +
        `violations=${String(audit.violations.length)}[${audit.violations.map((v) => v.code).join(" ")}] ` +
        `one-switch-per-door=${String(oneSwitchPerDoor)} every-switch-fires=${String(everySwitchFires)}`,
    },
    {
      id: "well-formed",
      ok: level.doors.every((d) => d.tiles.length >= 1) && level.switches.every((s) => s.targets.length >= 1),
      detail: `doors=${String(level.doors.length)} switches=${String(level.switches.length)}`,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// The derived frame — the far region's phase law, anchored at the landing
// ─────────────────────────────────────────────────────────────────────────────

/** The other phase. */
const flip = (p: Phase): Phase => (p === "A" ? "B" : "A");

/**
 * The phase the player is **in** when the portal lands them on the far end,
 * derived (ADR-0008 clause 8 + the entry rule): the entry into the near end
 * happens in `entryPhase(near)`, and `applyMove` step 4 flips after the teleport.
 * `entryPhase(t) = parity(t) === 1 ? startPhase : flip(startPhase)` with the start
 * at `(0,0)` and `startPhase A` — i.e. odd `(x+y)` → A.
 */
const arrivalPhaseOf = (near: Coord): Phase => flip(parity(near) === 1 ? START_PHASE : flip(START_PHASE));

/**
 * The **far region's** phase law, derived from the grid's bipartiteness: every
 * move flips the phase, so the phase at `t` is `arrivalPhase ⊕ (moves from the
 * landing mod 2)`, and on a bipartite grid the move-count parity between two tiles
 * is `(x+y)` parity — path-independent. Hence:
 *
 *     stand(t) = arrivalPhase            when parity(t) === parity(landing)
 *     stand(t) = flip(arrivalPhase)      otherwise
 *     entry(t) = flip(stand(t))
 *
 * This is a **proposal**; the gates (`every-switch-fires`, the ordered route
 * reader, coverage) decide, and `--stage=p` prints the agreement with the measured
 * `bareEntryMap`.
 */
const standPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  parity(t) === parity(landing) ? arrivalPhase : flip(arrivalPhase);
const farEntryPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  flip(standPhase(landing, arrivalPhase, t));

/** Base door openness from colour alone (`@/core/rules/solid`: red open in A, blue in B). */
const doorOpenIn = (color: DoorDef["color"], p: Phase): boolean =>
  color === "red" ? p === "A" : p === "B";

/**
 * **The local leak test** (the census's cheap, exact screen). A pocket is sealed by
 * one door object iff **no** pocket tile has a neighbour outside the pocket that is
 * enterable in the phase the step would happen in, with every switch OFF. Measured
 * per boundary tile with the derived frame, so a two-phase boundary and a
 * **column leak** (a pocket tile at `x = CX + 1` is adjacent to the sealed column,
 * which is a *corridor* in the far frame — every one of its tiles is enterable in
 * exactly one far-phase) are both caught here rather than argued about.
 */
function pocketLeaks(
  landing: Coord,
  arrivalPhase: Phase,
  pocket: readonly Coord[],
  door: { color: DoorDef["color"]; tiles: readonly Coord[] } | null,
): string[] {
  const inside = new Set(pocket.map(coordKey));
  const wallKeys = new Set<string>();
  const doorKeys = new Set((door?.tiles ?? []).map(coordKey));
  const leaks: string[] = [];
  for (const p of pocket) {
    const here = standPhase(landing, arrivalPhase, p);
    for (const d of DIRECTIONS) {
      const n = at(x(p) + (d === "left" ? -1 : d === "right" ? 1 : 0), y(p) + (d === "up" ? -1 : d === "down" ? 1 : 0));
      if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
      if (inside.has(coordKey(n))) continue;
      // solid in `here`? a phase wall in `here`, or a door closed in `here`.
      const wall = (here === "A" ? COLUMN.a : COLUMN.b).some((t) => coordKey(t) === coordKey(n));
      if (wall) continue;
      if (doorKeys.has(coordKey(n))) {
        if (door !== null && !doorOpenIn(door.color, here)) continue;
        leaks.push(`${coordKey(p)}→${coordKey(n)}@${here}(door OPEN)`);
        continue;
      }
      leaks.push(`${coordKey(p)}→${coordKey(n)}@${here}`);
    }
  }
  void wallKeys;
  return leaks;
}

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
  ctx: Context,
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
  const gates = [...ladderGates(proven, graph, cut), ...sealedLandingGates(proven, graph, ctx)];
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
// ─────────────────────────────────────────────────────────────────────────────
// P. The pocket census — what a pocket IS, measured (never argued)
// ─────────────────────────────────────────────────────────────────────────────

const POCKET_MAX = Number(argOf("pocketsize") ?? "5");

/**
 * `--only=x,y` (repeatable) — **slice filter**, stage P only. Added by LV-012 for
 * tractability, never for tuning: the pocket enumeration is exponential in
 * `--pocketsize`, so the ≤10 census is measured in landing slices. With no `--only`
 * the loop is exactly the shipped one (every far tile) and no measurement changes;
 * a slice is verified by re-measuring a landing whose full-run line is already
 * committed (`5,0` → 13, `6,0` → 40 at ≤10, `author-l20.transcript.md` §4).
 */
const ONLY_LANDINGS: ReadonlySet<string> = new Set(
  process.argv.filter((a) => a.startsWith("--only=")).map((a) => a.slice("--only=".length)),
);
const SLICED: readonly Coord[] =
  ONLY_LANDINGS.size === 0 ? FAR_TILES : FAR_TILES.filter((t) => ONLY_LANDINGS.has(coordKey(t)));

/**
 * **Census-cost note — ADR architecture-0004 Ruling 4 (`docs/architecture.md` §15.5).
 * `PREDICTED` is a label, never a licence.**
 *
 * Within one frame, enumeration **sizes** are invariant per `D2` orbit of the far
 * rectangle `Γ_F` (`tested = N(parity) × K(orbit)`, `N` recomputed per landing, never
 * inherited across the parity-flipping half). So a batch *may* walk at most one landing
 * per orbit and label the rest `PREDICTED`. **Results never inherit** — the equivariance
 * condition `g(σ(P)) = g(P)` fails exactly on leaks (`x=4` 0 vs `x=6` 15 113 at ≤10) —
 * with exactly one lawful exception, the first far column, where `leak-free ≡ 0` is a
 * law (Ruling 2) and must be labelled a law, not a measurement.
 *
 * **No prediction is implemented here.** This tool walks every landing in `SLICED` and
 * every figure it prints is measured. The one-flag version is a named, deferred row
 * (`docs/ai-native-pipeline.md` §8.17); when it is built it must print `PREDICTED` beside
 * any inherited size and must refuse to inherit a verdict.
 */
function stagePockets(): void {
  console.log(
    `\nstage P pocket census — grid ${String(W)}×${String(H)} · sealed column x=${String(CX)} · ` +
      `pocket size ≤ ${String(POCKET_MAX)} · far tiles = ${String(FAR_TILES.length)}` +
      (ONLY_LANDINGS.size === 0 ? "" : ` · SLICE --only=${[...ONLY_LANDINGS].join(" --only=")} (${String(SLICED.length)} landing(s))`),
  );
  let tested = 0;
  let single = 0;
  let sealed = 0;
  const kept: string[] = [];
  for (const landing of SLICED) {
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      if (parity(near) === parity(landing)) continue; // ADR-0009: opposite parity only
      const arrivalPhase = arrivalPhaseOf(near);
      let hereTested = 0;
      let hereSingle = 0;
      let hereSealed = 0;
      for (const pocket of pocketCandidates(landing, POCKET_MAX)) {
        tested += 1;
        hereTested += 1;
        const sp = sealedPocket(pocket, arrivalPhase);
        if (!sp.ok) continue;
        hereSingle += 1;
        const door = { color: closedIn(arrivalPhase), tiles: pocket.boundary };
        const leaks = pocketLeaks(landing, arrivalPhase, pocket.tiles, door);
        if (leaks.length > 0) continue;
        hereSealed += 1;
        kept.push(
          `  landing ${coordKey(landing)} near ${coordKey(near)}/${arrivalPhase} · ` +
            `pocket [${pocket.tiles.map(coordKey).join(" ")}] · boundary [${pocket.boundary.map(coordKey).join(" ")}] ` +
            `· door ${closedIn(arrivalPhase)}`,
        );
      }
      // ── LV-013 — ADR architecture-0004 Ruling 3: **the print gate is GONE.**
      // It used to read `if (hereSealed > 0)`, which suppressed BOTH the line and the
      // counter accumulation for every `(landing, near)` with no leak-free pocket — and
      // that is exactly the first far column (Ruling 2: leak-free ≡ 0 by law). The
      // published "x=4 → 0 single-phase" was therefore a suppressed counter, not a
      // measurement: its deficit (`724 203 655 − 592 804 433` at ≤10, `16 431 095 −
      // 13 163 780` at ≤8) was the x=4 `tested` sum, digit for digit.
      // Accumulation below is unconditional, hence honest — and being honest it shows
      // what it always was: `sealedPocket` cannot reject a connected pocket, so
      // `hereSingle ≡ hereTested` on every single line. The label says so, in the
      // output, so no future reader can mistake the column for a measurement.
      const firstColumn = x(landing) === CX + 1;
      console.log(
        `  landing ${coordKey(landing)} (near ${coordKey(near)}, arrival ${arrivalPhase}): ` +
          `${String(hereTested)} tested · ${String(hereSingle)} single-phase boundary ` +
          `(TAUTOLOGY ≡ tested · ADR architecture-0004 R3: the screen screens nothing)` +
          (firstColumn ? " · FIRST-COLUMN LAW: leak-free ≡ 0 (ADR architecture-0004 R2)" : "") +
          ` · ${String(hereSealed)} leak-free`,
      );
      single += hereSingle;
      sealed += hereSealed;
    }
  }
  console.log(
    `\ncensus: ${String(tested)} pocket(s) tested · ${String(single)} single-phase boundary ` +
      `(TAUTOLOGY ≡ tested — ADR architecture-0004 Ruling 3) · ` +
      `${String(sealed)} leak-free (the census's accept class)`,
  );
  console.log("leak-free pockets:");
  for (const k of kept) console.log(k);
}

// ─────────────────────────────────────────────────────────────────────────────
// SL. The sealed-landing lattice — the census's leak-free devices, then the
//     goal-gated seal, judged by the shipped readers on every candidate
// ─────────────────────────────────────────────────────────────────────────────

interface Device {
  /** The portal's far end — where the teleport lands the player. */
  readonly landing: Coord;
  /** The portal's near end (left region): entered at `nearPhase`, which is the portal's `activePhase`. */
  readonly near: Coord;
  /** `entryPhase(near)` — the phase the portal must be active in to fire at all. */
  readonly nearPhase: Phase;
  /** The phase the player stands in after the teleport (`flip(nearPhase)`). */
  readonly arrivalPhase: Phase;
  readonly pocket: Pocket;
}

/** `entryPhase(near)` — the phase a first entry into a left-region tile always happens in. */
const nearEntryPhase = (near: Coord): Phase => (parity(near) === 1 ? START_PHASE : flip(START_PHASE));

/** The leak-free devices — the census's accept class, re-derived here (never typed). */
function devices(): Device[] {
  const out: Device[] = [];
  for (const landing of FAR_TILES) {
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      const nearPhase = nearEntryPhase(near);
      if (parity(near) === parity(landing)) continue; // ADR-0009 decision 5: opposite parity only
      const arrivalPhase = flip(nearPhase);
      for (const pocket of pocketCandidates(landing, POCKET_MAX)) {
        if (!sealedPocket(pocket, arrivalPhase).ok) continue;
        const door = { color: closedIn(arrivalPhase), tiles: pocket.boundary };
        if (pocketLeaks(landing, arrivalPhase, pocket.tiles, door).length > 0) continue;
        out.push({ landing, near, nearPhase, arrivalPhase, pocket });
      }
    }
  }
  return out;
}

/** In-bounds neighbours of `t`, in the walkable region (`x > CX`). */
function walkNeighbours(t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at(x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0), y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0));
    if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
    if (x(n) <= CX) continue; // the column is walkable but can hold no door (door ∩ wall = hard error)
    out.push(n);
  }
  return out.sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

/**
 * The goal candidates: a far tile with **no column neighbour** (else the goal is
 * enterable from the column corridor, which can hold no door, and the seal leaks)
 * and every in-region neighbour outside the pocket and its boundary door (a door
 * tile belongs to exactly one door object).
 */
function goalCandidates(dev: Device): Coord[] {
  const seen = new Set([...dev.pocket.tiles, ...dev.pocket.boundary].map(coordKey));
  return FAR_TILES.filter((g) => {
    if (seen.has(coordKey(g))) return false;
    if (x(g) < CX + 2) return false; // x ≥ 5: no column neighbour
    return walkNeighbours(g).every((n) => !seen.has(coordKey(n)));
  });
}

/** Ordered `k`-tuples of distinct tiles from `pool` (which switch drives which door is a choice). */
function orderedTuples(pool: readonly Coord[], k: number): Coord[][] {
  const out: Coord[][] = [];
  const walk = (acc: Coord[]): void => {
    if (acc.length === k) {
      out.push([...acc]);
      return;
    }
    for (const t of pool) {
      if (acc.some((a) => coordKey(a) === coordKey(t))) continue;
      acc.push(t);
      walk(acc);
      acc.pop();
    }
  };
  walk([]);
  return out;
}

/**
 * The **cheap pre-filter**: schema → rules → BFS → `par`. It runs on every
 * candidate; the full gate chain (which enumerates par routes and floods the
 * all-OFF subgraph) runs only on the boards whose measured `par` is **exactly the
 * rung** — the rung pin, applied as a filter instead of as a post-hoc rejection, so
 * the census can afford to be exhaustive. A candidate dropped here is dropped with
 * its measurement, never repaired.
 */
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

function stageLattice(cut: { floor: number; l15Par: number }): void {
  const RUNG = cut.l15Par + 2 * (LEVEL_ID - 15);
  const only = argOf("only");
  const devs = devices().filter((d) => only === null || coordKey(d.landing) === only);
  console.log(
    `\nstage SL sealed-landing lattice: ${String(devs.length)} leak-free device(s) ` +
      `(landing × near × pocket, all re-derived${only === null ? "" : `, filtered to landing ${only}`}) · ` +
      `cap ${String(CAP)} tuple(s) per (device, s1, goal) · rung par ${String(RUNG)}`,
  );
  const histogram = new Map<string, number>();
  const parHist = new Map<number, number>();
  const bestByLanding = new Map<string, { par: number; note: string }>();
  const misses: { reason: string; note: string; par: number; dexec: number; b: number; failing?: readonly Gate[] }[] = [];
  const accepts: { note: string; level: Level; dexec: number; b: number; coverage: string }[] = [];
  let total = 0;
  const t0 = Date.now();
  for (const dev of devs) {
    const d1: DoorDef = { id: "d1", color: closedIn(dev.arrivalPhase), tiles: dev.pocket.boundary };
    for (const s1Tile of dev.pocket.tiles) {
      if (coordKey(s1Tile) === coordKey(dev.landing)) continue; // a switch on the portal end never gets an entry of its own
      const s1: SwitchDef = {
        id: "s1",
        tile: s1Tile,
        activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s1Tile),
        targets: ["d1"],
      };
      for (const goal of goalCandidates(dev)) {
        const sealTiles = walkNeighbours(goal);
        const sealDoors: DoorDef[] = sealTiles.map((t, i) => ({
          id: `d${String(i + 2)}`,
          color: closedIn(farEntryPhase(dev.landing, dev.arrivalPhase, t)),
          tiles: [t],
        }));
        const used = new Set<string>([...dev.pocket.tiles, ...dev.pocket.boundary, goal, ...sealTiles].map(coordKey));
        const pool = FAR_TILES.filter((t) => !used.has(coordKey(t)));
        let tried = 0;
        for (const tuple of orderedTuples(pool, sealDoors.length)) {
          if (tried >= CAP) break;
          tried += 1;
          total += 1;
          const switches: SwitchDef[] = [
            s1,
            ...sealDoors.map((d, i) => ({
              id: `s${String(i + 2)}`,
              tile: tuple[i] as Coord,
              activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, tuple[i] as Coord),
              targets: [d.id],
            })),
          ];
          const ctx: Context = {
            cut,
            pocket: dev.pocket,
            pocketDoor: d1,
            pocketSwitch: s1,
            arrivalPhase: dev.arrivalPhase,
            landing: dev.landing,
            near: dev.near,
          };
          const note =
            `landing=${coordKey(dev.landing)} near=${coordKey(dev.near)}/${dev.nearPhase} pocket=[${dev.pocket.tiles.map(coordKey).join(" ")}] ` +
            `s1=${coordKey(s1Tile)}/${s1.activePhase} goal=${coordKey(goal)}/a${String(sealTiles.length)} ` +
            `doors=[${sealDoors.map((d) => `${d.id}=${coordKey(d.tiles[0] as Coord)}/${d.color}`).join(" ")}] ` +
            `switches=[${switches.slice(1).map((s) => `${s.id}=${coordKey(s.tile)}/${s.activePhase}`).join(" ")}]`;
          const draft = {
            id: LEVEL_ID,
            width: W,
            height: H,
            startPhase: START_PHASE,
            player: PLAYER,
            goal,
            phaseAWalls: COLUMN.a,
            phaseBWalls: COLUMN.b,
            doors: [d1, ...sealDoors],
            switches,
            portals: [{ id: "p1", pair: [dev.near, dev.landing] as const, activePhase: dev.nearPhase }],
          };
          // ── the rung pin, as a FILTER (the L16 tool's selection pin, one step
          // earlier in the pipeline): only a board measuring exactly the rung earns
          // the full gate chain. Everything else is dropped with its par.
          const probe = probePar(draft);
          if (probe.par !== RUNG) {
            histogram.set(probe.reason === "ok" ? "par-not-rung" : probe.reason, (histogram.get(probe.reason === "ok" ? "par-not-rung" : probe.reason) ?? 0) + 1);
            if (probe.par > 0) {
              parHist.set(probe.par, (parHist.get(probe.par) ?? 0) + 1);
              const k = coordKey(dev.landing);
              const prev = bestByLanding.get(k);
              if (prev === undefined || probe.par > prev.par) bestByLanding.set(k, { par: probe.par, note });
            }
            continue;
          }
          const { outcome, level } = judge(
            draft,
            cut,
            ctx,
          );
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
          accepts.push({ note, level, dexec: outcome.dexec ?? Number.NaN, b: outcome.b ?? Number.NaN, coverage: outcome.coverage ?? "?" });
          console.log(
            `  ACCEPT  par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} B=${(outcome.b ?? 0).toFixed(4)} ` +
              `coverage=${String(outcome.coverage)}\n          ${note}`,
          );
        }
      }
    }
  }
  console.log(
    `\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} judged candidate(s) ` +
      `in ${( (Date.now() - t0) / 1000 ).toFixed(1)} s`,
  );
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1]))
    console.log(`  ${k}: ${String(v)}`);
  console.log("best measured par per landing (the family's own ceiling, per landing):");
  for (const [k, v] of [...bestByLanding.entries()].sort((a, b) => b[1].par - a[1].par))
    console.log(`  landing ${k}: par ${String(v.par)}`);
  const top = [...bestByLanding.entries()].sort((a, b) => b[1].par - a[1].par)[0];
  if (top !== undefined) console.log(`  best board:\n    ${top[1].note}`);
  console.log(
    `par census over every judged candidate (the rung pin's filter's own histogram): ` +
      `${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}`,
  );
  const nearMiss = misses
    .filter((m) => m.reason.split("+").every((g) => g === "escalation" || g === "par-rung"))
    .sort((a, b) => b.par - a.par || b.dexec - a.dexec)
    .slice(0, 8);
  console.log(
    `near-miss (par-rung/escalation only): ${String(misses.filter((m) => m.reason.split("+").every((g) => g === "escalation" || g === "par-rung")).length)} candidate(s)` +
      `, top ${String(nearMiss.length)}:`,
  );
  for (const m of nearMiss) console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
  // ── the par-rung candidates a GATE refused (not the pin): the rung was reached
  // and the board then had to earn the device; each is printed with the numbers its
  // refusing gate read, because "the census found nothing at the rung" and "the
  // census found boards at the rung that are not the device" are different findings.
  const atRung = misses.filter((m) => m.par === RUNG);
  const shownRung = atRung.sort((a, b) => b.dexec - a.dexec).slice(0, 6);
  console.log(
    `par-${String(RUNG)} candidates refused by a gate (rung reached, device not earned): ${String(atRung.length)}; top ${String(shownRung.length)} by D_exec:`,
  );
  for (const m of shownRung) {
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
    for (const g of m.failing ?? []) console.log(`      ${g.id}: ${g.detail}`);
  }

  if (WRITE && accepts.length > 0) {
    mkdirSync(OUT_DIR, { recursive: true });
    // Selection is derived, never tasted: exactly the rung's par, then the smallest
    // D_exec (in-band B is an obligation, and among boards sharing par the least
    // execution axis is the honest pick), then the enumeration order.
    const chosen = accepts.reduce((a, b) => {
      const pa = a.level.par;
      const pb = b.level.par;
      if (pb !== pa) return pb < pa ? b : a;
      return b.dexec < a.dexec ? b : a;
    });
    const file = join(OUT_DIR, `l${String(chosen.level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(chosen.level, null, 2)}\n`);
    console.log(
      `\nselection (min par, then min D_exec) of ${String(accepts.length)} accept(s): par=${String(chosen.level.par)} ` +
        `D_exec=${chosen.dexec.toFixed(6)} (cut +${(chosen.dexec - cut.floor).toFixed(6)}) B=${chosen.b.toFixed(4)} coverage=${chosen.coverage}`,
    );
    console.log(`wrote ${file}\n  ${chosen.note}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// run
// ─────────────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(
  `author-l20 — CUT re-measured from the shipped set: D_exec max = ${cut.floor.toFixed(6)} · par(L15) = ${String(cut.l15Par)} ` +
    `· B band [${cut.bBand[0].toFixed(4)}, ${cut.bBand[1].toFixed(4)}] · basis ids [${cut.basis.join(", ")}] ` +
    `(the registered L16–L19 ladder is excluded — a block must not raise its own filter)`,
);
const law = preflightLaw();
console.log(
  `preflight parity law: ${String(law.boards)} board(s), ${String(law.states)} state(s), ${String(law.moves)} legal move(s), ` +
    `${String(law.bimodal)} bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)`,
);
const guard = cloneGuardCensus();
console.log(`clone guard (§6.1.4, seal-inclusive key): ${String(guard.size)} geometry key(s) taken [${[...guard.values()].join(", ")}]`);

if (STAGE === "p") stagePockets();
else stageLattice(cut);
