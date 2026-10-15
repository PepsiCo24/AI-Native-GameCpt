/**
 * Move — the one and only logical action: `MOVE(direction)`.
 *
 * Truth sources: AGENTS.md ("One logical action: MOVE(direction)"), ADR-0002
 * (flip bound to movement), `docs/architecture.md` §11 (tap and swipe both map
 * to a `Move`; one interaction model only).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 */

import type { Vec } from "./types";

/** Grid directions. `y` grows downward (`docs/level-design.md` §1: 0-indexed from top-left). */
export type Direction = "up" | "down" | "left" | "right";

/** The single logical action. Tap and swipe are input mappings, never rules. */
export interface Move {
  readonly dir: Direction;
}

/** Canonical direction order — fixed, so search expansions are deterministic. */
export const DIRECTIONS = [
  "up",
  "down",
  "left",
  "right",
] as const satisfies readonly Direction[];

export const MOVE_DELTAS: Readonly<Record<Direction, Vec>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function isDirection(value: unknown): value is Direction {
  return (
    value === "up" || value === "down" || value === "left" || value === "right"
  );
}

/** Construct the logical action. */
export function move(dir: Direction): Move {
  return { dir };
}

/** The destination tile of a single step from `from` in `dir` (never bounds-checked here). */
export function step(from: Vec, dir: Direction): Vec {
  const delta = MOVE_DELTAS[dir];
  return { x: from.x + delta.x, y: from.y + delta.y };
}