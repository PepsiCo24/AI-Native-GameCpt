/**
 * QA test fixtures — tiny, explicit levels built to isolate one ADR-0008
 * clause each. Every fixture is a plain `Level` object; `tests/**` never
 * imports the renderer and never touches production logic.
 */

import type { Coord, DoorDef, Level, PortalDef, SwitchDef } from "@/core/level";
import type { Phase } from "@/core/state/phase";
import type { SearchState } from "@/core/state/types";
import { vec } from "@/core/state/types";
import { makeRng } from "./search";

/** Build a level from a base template; `player`/`goal` are mandatory in the base. */
export function makeLevel(overrides: Partial<Level> = {}): Level {
  return {
    id: 900,
    width: 5,
    height: 5,
    startPhase: "A",
    player: [0, 0] as Coord,
    goal: [4, 0] as Coord,
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [],
    switches: [],
    portals: [],
    par: 1,
    ...overrides,
  };
}

/** Build a raw `SearchState` without going through a level. */
export function makeSearchState(overrides: Partial<SearchState> = {}): SearchState {
  return {
    player: vec(0, 0),
    phase: "A",
    doorsOpen: {},
    switchesOn: {},
    ...overrides,
  };
}

export function door(id: string, color: DoorDef["color"], tiles: Coord[]): DoorDef {
  return { id, color, tiles };
}

export function switchDef(
  id: string,
  tile: Coord,
  activePhase: Phase,
  targets: string[],
): SwitchDef {
  return { id, tile, activePhase, targets };
}

export function portal(id: string, a: Coord, b: Coord, activePhase: Phase): PortalDef {
  return { id, pair: [a, b], activePhase };
}

/**
 * Seeded random **M0-only** level (phase walls only; no doors/switches/portals).
 * Deterministic per seed, so a failing invariant is reproducible. Used by the
 * property sweep and the GATE D board-invariant sweep.
 */
export function randomM0Level(seed: number): Level {
  const rng = makeRng(seed);
  const width = 3 + Math.floor(rng() * 5); // 3..7
  const height = 3 + Math.floor(rng() * 5); // 3..7
  const cells: Array<[number, number]> = [];
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) cells.push([x, y]);
  }
  const pick = (): [number, number] => cells[Math.floor(rng() * cells.length)] as [number, number];
  const same = (a: [number, number], b: [number, number]): boolean => a[0] === b[0] && a[1] === b[1];

  const player = pick();
  let goal = pick();
  while (same(player, goal)) goal = pick();

  const isEnd = (c: [number, number]): boolean => same(c, player) || same(c, goal);
  const phaseAWalls = cells.filter((c) => !isEnd(c) && rng() < 0.25);
  const phaseBWalls = cells.filter((c) => !isEnd(c) && rng() < 0.25);

  return makeLevel({
    id: seed,
    width,
    height,
    startPhase: rng() < 0.5 ? "A" : "B",
    player,
    goal,
    phaseAWalls,
    phaseBWalls,
  });
}