/**
 * Core state types — `GameState` / `SearchState` and their pieces.
 *
 * Truth sources: `docs/architecture.md` §5 (state model) and §6 (rules engine),
 * ADR-architecture-0001 (hash contract) + its 2026-10-14 GATE C addendum,
 * ADR-0008 (Option B — entry-only phase solidity).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 *
 * Every field below is `readonly` on purpose: state objects are shared between
 * the Gameplay layer and the Solver (one truth source, AGENTS.md §3), so an
 * in-place mutation anywhere would be a determinism bug. Produce new states via
 * `applyMove` / `initialState`; never mutate.
 */

import type { PortalDef } from "@/core/level";
import type { Phase } from "./phase";

/** Grid position. All screen/level coordinates are `[x, y]`, 0-indexed from the top-left. */
export interface Vec {
  readonly x: number;
  readonly y: number;
}

export function vec(x: number, y: number): Vec {
  return { x, y };
}

export function sameVec(a: Vec, b: Vec): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Absolute, post-resolution door openness — recomputed from
 * `(door.color, current phase, switchesOn)` at every phase resolution
 * (`applyMove` step 5), never carried incrementally (`docs/architecture.md` §5,
 * ADR-architecture-0001 addendum M-7).
 *
 * Reading rule (fail-closed): a door is open **only** if its entry is literally
 * `true`; a missing entry means closed. `hashState` relies on this — see
 * `hash.ts`.
 */
export type DoorsOpen = Readonly<Record<string, boolean>>;

/**
 * Latched switch state: a switch entry flips only when the player **enters** its
 * tile while the switch's `activePhase` is the current phase (`applyMove`
 * step 3). Missing entry means off.
 */
export type SwitchesOn = Readonly<Record<string, boolean>>;

/**
 * The minimum searchable state (BFS visited-set node).
 *
 * `moveCount`, `history` and `status` are deliberately absent: they are
 * gameplay bookkeeping, not puzzle state (`docs/architecture.md` §6.3).
 */
export interface SearchState {
  readonly player: Vec;
  readonly phase: Phase;
  readonly doorsOpen: DoorsOpen;
  readonly switchesOn: SwitchesOn;
}

export type GameStatus = "playing" | "won";

/**
 * Phase-resolved occupancy view — a **derived cache**, never an input to the
 * rules. It is recomputed at every phase resolution (`applyMove` step 5) and is
 * deliberately excluded from `hashState` (it holds no information that is not
 * already a function of `level` + `phase` + `doorsOpen` + `switchesOn`).
 *
 * - `walls`: phase-wall tiles solid in `phase` (union of `phaseAWalls` /
 *   `phaseBWalls` filtered by the active phase). Closed-door tiles are **not**
 *   listed here — door occupancy is read from `doorsOpen`.
 * - `portals`: portal definitions whose `activePhase` is `phase`.
 */
export interface PhaseView {
  readonly walls: readonly Vec[];
  readonly portals: readonly PortalDef[];
}

/**
 * Undo record (`docs/architecture.md` §13: "snapshot stack of serialized
 * `GameState`", no command pattern, no inverse-operation algebra).
 * `objects` is omitted because it is derived, not state.
 */
export interface Snapshot {
  readonly playerPosition: Vec;
  readonly phase: Phase;
  readonly doorsOpen: DoorsOpen;
  readonly switchesOn: SwitchesOn;
  readonly moveCount: number;
  readonly status: GameStatus;
}

/**
 * Full playable state. Mirrors `docs/architecture.md` §5.
 *
 * `SearchState` is the projection used by the rules engine and the Solver;
 * `applyMoveToGameState` is the only place where the two are kept in sync.
 */
export interface GameState {
  readonly levelId: number;
  readonly playerPosition: Vec;
  readonly phase: Phase;
  readonly levelState: {
    readonly doorsOpen: DoorsOpen;
    readonly switchesOn: SwitchesOn;
  };
  /** Derived, phase-resolved occupancy cache — see `PhaseView`. */
  readonly objects: PhaseView;
  readonly moveCount: number;
  /** Undo stack: the states *before* each legal move, oldest first. */
  readonly history: readonly Snapshot[];
  readonly status: GameStatus;
}