/**
 * Game session — the **only** owner of `GameState`.
 *
 * This module is the whole gameplay layer's state model. It stores nothing that
 * core does not define, and it never decides anything core could decide:
 *
 * - **Every** legal move goes through `applyMoveToGameState` — one call site, no
 *   pre-check, no second implementation of movement (AGENTS.md §3,
 *   ADR-architecture-0001 decision 1). The illegal case is detected exactly the
 *   way the core defines it: the reducer returns the **same reference** for a
 *   refusal, so `next === gs` ⟺ illegal (no movement, no flip, no `moveCount`
 *   change, no history entry).
 * - `undo` restores a `Snapshot` produced by core's own `snapshotOf` and re-derives
 *   the phase view with core's `phaseView` (architecture §13: "snapshot stack of
 *   serialized `GameState` — no command pattern, no inverse-operation algebra").
 *   It computes **no** rules: a snapshot is bookkeeping, and the renderer is never
 *   allowed to hold a second state model.
 * - The win test is core's `isGoal` on the fully resolved post-move state
 *   (phase-independent, ADR-0008 clause 7). `GameState.status` carries the same
 *   evaluation, and the win **latches** — post-win input locking is gameplay's job
 *   (architecture V0.5 M-4).
 */

import type { Level } from "@/core/level";
import { phaseView } from "@/core/rules/solid";
import type { Direction } from "@/core/state/move";
import { move } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { applyMoveToGameState, initialState, isGoal, toSearchState } from "@/core/state/transitions";
import type { GameState, Vec } from "@/core/state/types";
import { isPlayerEmbedded } from "@/game/renderer/cell-state";
import { EventBus } from "@/game/systems/event-bus";

/** What happened to one logical `MOVE(dir)`. */
export type MoveOutcome =
  /** Refused by the core: no movement, **no phase flip**, no state change of any kind. */
  | "illegal"
  /** Legal move resolved; the phase flipped. */
  | "moved"
  /** Legal move that landed on the goal; the win latched. */
  | "won";

/** Construction options. Both are entry bookkeeping, never rules. */
export interface GameSessionOptions {
  /**
   * Level index to start the session at (`?level=<n>` → `startIndexForLevel`,
   * dev / playtest / E2E). Defaults to `0` (L1). A value that is not an integer
   * inside `0..levels.length - 1` falls back to `0` — a bad deep link must never
   * produce an empty or unplayable session. Nothing is persisted, and this does
   * **not** bypass the win path: the state is `initialState(level)`, move 0.
   */
  readonly startIndex?: number;
}

export class GameSession {
  readonly events = new EventBus();

  private readonly levels: readonly Level[];
  private index = 0;
  private gs: GameState;

  constructor(levels: readonly Level[], options: GameSessionOptions = {}) {
    if (levels.length === 0) {
      throw new Error("GameSession requires at least one validated level");
    }
    this.levels = levels;
    const requested = options.startIndex ?? 0;
    this.index =
      Number.isInteger(requested) && requested >= 0 && requested < levels.length ? requested : 0;
    this.gs = initialState(this.currentLevel);
  }

  /* ── reads ──────────────────────────────────────────────────────────────── */

  get level(): Level {
    return this.currentLevel;
  }

  private get currentLevel(): Level {
    const level = this.levels[this.index];
    if (!level) throw new Error(`No level at index ${this.index}`);
    return level;
  }

  get state(): GameState {
    return this.gs;
  }

  get levelIndex(): number {
    return this.index;
  }

  get levelCount(): number {
    return this.levels.length;
  }

  get phase(): Phase {
    return this.gs.phase;
  }

  get playerPosition(): Vec {
    return this.gs.playerPosition;
  }

  get moveCount(): number {
    return this.gs.moveCount;
  }

  /** `true` when the player legally stands inside a tile solid in the current phase (R-C13). */
  get playerEmbedded(): boolean {
    return isPlayerEmbedded(this.currentLevel, this.gs);
  }

  get canUndo(): boolean {
    return this.gs.status === "playing" && this.gs.history.length > 0;
  }

  get isWon(): boolean {
    return this.gs.status === "won";
  }

  /* ── actions ────────────────────────────────────────────────────────────── */

  /**
   * The one logical action. Tap, swipe and keyboard all land here.
   *
   * Note the order: the input layer maps a gesture to a `Move`; **this** call
   * asks the core what happens; a refusal is not an error, it is one of the three
   * documented outcomes.
   */
  move(dir: Direction): MoveOutcome {
    const m = move(dir);
    const previousPhase = this.gs.phase;
    const next = applyMoveToGameState(this.currentLevel, this.gs, m);

    if (next === this.gs) {
      // Illegal ⇒ identity. Nothing moved, nothing flipped (§6.1, ADR-0008 c1).
      this.events.emit("refused", {
        level: this.currentLevel,
        moveCount: this.gs.moveCount,
        phase: this.gs.phase,
      });
      return "illegal";
    }

    this.gs = next;
    if (next.phase !== previousPhase) {
      this.events.emit("phaseChanged", { from: previousPhase, to: next.phase });
    }

    // `isGoal` is evaluated on the fully resolved post-move state; `status` was set
    // by the same function inside `applyMoveToGameState`. Read from the core, once.
    const won = isGoal(this.currentLevel, toSearchState(this.gs));
    this.events.emit("move", {
      level: this.currentLevel,
      moveCount: this.gs.moveCount,
      phase: this.gs.phase,
      playerEmbedded: this.playerEmbedded,
    });

    if (won) {
      this.events.emit("levelWon", {
        level: this.currentLevel,
        moveCount: this.gs.moveCount,
      });
      return "won";
    }
    return "moved";
  }

  /**
   * R-T6 affordance query: *would the core accept this move?*
   *
   * It is deliberately implemented by calling the **same reducer** and throwing
   * the result away, so the hover ring can never disagree with the real move and
   * no second legality rule exists in the renderer. It is never used to gate an
   * input: `move()` is always called unconditionally and re-decides.
   */
  movePreview(dir: Direction): boolean {
    return applyMoveToGameState(this.currentLevel, this.gs, move(dir)) !== this.gs;
  }

  /** Undo: restore the snapshot core recorded before the last legal move. */
  undo(): boolean {
    if (!this.canUndo) return false;
    const history = this.gs.history;
    const last = history[history.length - 1];
    if (!last) return false;

    this.gs = {
      levelId: this.gs.levelId,
      playerPosition: last.playerPosition,
      phase: last.phase,
      levelState: { doorsOpen: last.doorsOpen, switchesOn: last.switchesOn },
      objects: phaseView(this.currentLevel, last.phase),
      moveCount: last.moveCount,
      history: history.slice(0, -1),
      status: last.status,
    };
    this.events.emit("undo", {
      level: this.currentLevel,
      moveCount: this.gs.moveCount,
      phase: this.gs.phase,
    });
    return true;
  }

  /** Restart: one tap, no dialog, no penalty (`docs/ui-ux.md` R-T2). */
  restart(): void {
    this.gs = initialState(this.currentLevel);
    this.events.emit("restart", { level: this.currentLevel });
  }

  /** Advance to the next level. Returns `false` when the prototype is over. */
  next(): boolean {
    if (this.index + 1 >= this.levels.length) {
      this.events.emit("levelAdvanced", { level: this.currentLevel, finished: true });
      return false;
    }
    this.index += 1;
    this.gs = initialState(this.currentLevel);
    this.events.emit("levelAdvanced", { level: this.currentLevel, finished: false });
    this.events.emit("levelStarted", { level: this.currentLevel });
    return true;
  }
}