/**
 * **One truth source for "the rooms of a board", derived from the bytes.**
 *
 * `g6-room-structure` — and `g2-room-exit-door`, and the `g5` census identity, and the negative
 * controls — judge a candidate on the rooms **derived from its landed bytes**, never on the rooms
 * the authoring script *declared* while it was building them. Two derivations of the same law is
 * how the generator and the prover come to disagree about a board that one accepts and the other
 * refuses; `F-L41-2` is exactly that failure, so this module exists: `scripts/prove-candidate.ts`
 * and `scripts/author-l21.ts` both call {@link derivedWalkSealedRooms}, and neither keeps its own.
 *
 * The law it implements (§6.2.3's device, as the prover has read it since LV-012):
 *
 * - a **region** is a maximal connected set of tiles that are neither a phase wall nor a door tile
 *   (walls block, doors block, the grid edge blocks);
 * - a region is a **walk-sealed room** only when a **single door object** covers its whole boundary,
 *   with **no** phase-wall boundary tile (`F-L19-2`: a wall on the boundary makes the tile
 *   unstandable, and the coverage gate fails) and **no** free boundary tile (an open leak);
 * - anything else is a region, not a room, and a gate that wants a room says so by name.
 *
 * A door enclosing **two** regions is therefore two rooms sharing one door — legal geometry, but
 * outside this device's class (`g6`'s "covering doors distinct" clause).
 */

import type { Coord, Level } from "@/core/level";
import { coordKey } from "@/core/level";
import { DIRECTIONS } from "@/core/state/move";

/**
 * The board shape this derivation reads. It is exactly `Level` **without `par`**, so the authoring
 * script can hand it a draft (`Omit<Level, "par">`) before the solver has stamped a par, and the
 * prover hands it a landed `Level` — one function, both callers, no second copy of the law.
 */
export type RoomBoard = Omit<Level, "par">;

/** A derived region-that-is-a-room. `hasLanding` is never set here — the caller marks it. */
export interface DerivedRoom {
  readonly tiles: readonly Coord[];
  readonly boundary: readonly Coord[];
  /** Distinct door ids covering the boundary (exactly one, or the region is not a room). */
  readonly doorIds: readonly string[];
  readonly doorTiles: readonly Coord[];
  readonly wallTiles: readonly Coord[];
  readonly freeTiles: readonly Coord[];
  readonly switchIds: readonly string[];
  readonly hasGoal: boolean;
  readonly hasLanding: boolean;
}

/** `t` stepped one tile in `dir` (a level-data step; never a move, never a legality question). */
function step(t: Coord, dir: string): Coord {
  if (dir === "left") return [t[0] - 1, t[1]] as Coord;
  if (dir === "right") return [t[0] + 1, t[1]] as Coord;
  if (dir === "up") return [t[0], t[1] - 1] as Coord;
  return [t[0], t[1] + 1] as Coord;
}

/** The four tile-neighbours of `t` that are in bounds (the grid edge blocks by itself). */
export function inBoundsNeighbours(level: RoomBoard, t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = step(t, d);
    if (n[0] < 0 || n[1] < 0 || n[0] >= level.width || n[1] >= level.height) continue;
    out.push(n);
  }
  return out;
}

/** Every walk-sealed room of the board, **derived from the bytes** (see this module's docstring). */
export function derivedWalkSealedRooms(level: RoomBoard): DerivedRoom[] {
  const wall = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const doorOf = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorOf.set(coordKey(t), d.id);
  const blocked = (t: Coord): boolean => wall.has(coordKey(t)) || doorOf.has(coordKey(t));
  const seen = new Set<string>();
  const rooms: DerivedRoom[] = [];
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
      for (const t of tiles)
        for (const n of inBoundsNeighbours(level, t)) if (!inside.has(coordKey(n))) bmap.set(coordKey(n), n);
      const boundary = [...bmap.values()].sort((p, q2) => coordKey(p).localeCompare(coordKey(q2)));
      const doorIds = [...new Set(boundary.map((t) => doorOf.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
      const wallTiles = boundary.filter((t) => wall.has(coordKey(t)));
      const freeTiles = boundary.filter((t) => !wall.has(coordKey(t)) && !doorOf.has(coordKey(t)));
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

/**
 * The **derived-structure receipt** a rung must satisfy to be in this device's class: every door
 * object must cover **at most one** derived walk-sealed room. Returns the offending door ids
 * (empty ⇒ the board is in class) and the covering list, so a refusal can name what it saw rather
 * than assert a verdict.
 */
export function doorsCoveringTwoRooms(level: RoomBoard): { covering: string[]; duplicated: string[] } {
  const covering = derivedWalkSealedRooms(level).map((r) => r.doorIds[0] as string);
  const seenDoors = new Set<string>();
  const duplicated = new Set<string>();
  for (const d of covering) {
    if (seenDoors.has(d)) duplicated.add(d);
    seenDoors.add(d);
  }
  return { covering, duplicated: [...duplicated].sort() };
}