/**
 * Minimal typed event bus — `docs/architecture.md` §10 / §13.
 *
 * "Light typed event bus between Core and Phaser layer (`move`, `phaseChanged`,
 * `levelWon`, `undo`, `restart`). Core emits semantic events; Phaser subscribes.
 * Core never knows how things are drawn."
 *
 * Deliberately minimal (architecture §13: "no middleware, no wildcard topics, no
 * replayable event log"). The bus lives in the **gameplay** layer, not in core:
 * `src/core/**` stays pure and event-free, and both consumers of a state change —
 * the Phaser renderer and the DOM overlay (`docs/ui-ux.md` §7.2) — subscribe to
 * this one bus instead of talking to each other.
 */

import type { Level } from "@/core/level";
import type { Phase } from "@/core/state/phase";

/** Payloads are *facts about what just happened*, never commands or state copies. */
export interface GameEvents {
  readonly levelStarted: { readonly level: Level };
  /** A legal move resolved; the state has already been committed. */
  readonly move: {
    readonly level: Level;
    readonly moveCount: number;
    readonly phase: Phase;
    readonly playerEmbedded: boolean;
  };
  /** Illegal move: no movement, **no phase flip** (ADR-0008 clause 1). */
  readonly refused: { readonly level: Level; readonly moveCount: number; readonly phase: Phase };
  readonly phaseChanged: { readonly from: Phase; readonly to: Phase };
  readonly undo: { readonly level: Level; readonly moveCount: number; readonly phase: Phase };
  readonly restart: { readonly level: Level };
  readonly levelWon: { readonly level: Level; readonly moveCount: number };
  /** `finished: true` = the prototype is over (no L6 in this slice). */
  readonly levelAdvanced: { readonly level: Level; readonly finished: boolean };
}

type Listener<K extends keyof GameEvents> = (payload: GameEvents[K]) => void;

export class EventBus {
  private readonly listeners = new Map<keyof GameEvents, Set<(payload: never) => void>>();

  /** Subscribe. Returns an unsubscribe function (used on scene shutdown). */
  on<K extends keyof GameEvents>(name: K, listener: Listener<K>): () => void {
    let set = this.listeners.get(name);
    if (!set) {
      set = new Set();
      this.listeners.set(name, set);
    }
    set.add(listener as (payload: never) => void);
    return () => {
      set?.delete(listener as (payload: never) => void);
    };
  }

  emit<K extends keyof GameEvents>(name: K, payload: GameEvents[K]): void {
    const set = this.listeners.get(name);
    if (!set) return;
    for (const listener of set) (listener as Listener<K>)(payload);
  }

  /** Drop a listener set entirely (scene teardown). */
  clear(): void {
    this.listeners.clear();
  }
}