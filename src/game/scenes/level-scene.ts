/**
 * LevelScene — the single Phaser scene of the playable slice (RENDER-001).
 *
 * It is deliberately thin. Everything visual lives in `renderer/board-view.ts`;
 * everything stateful lives in `systems/session.ts`; every rule lives in
 * `src/core/**`. This file is only the **wiring**:
 *
 * ```
 *   input gesture ─► MOVE(dir) ─► GameSession ─► applyMoveToGameState (core)
 *                                                        │
 *                                        typed event bus ├─► BoardView  (canvas)
 *                                                        └─► Hud        (DOM)
 * ```
 *
 * Two properties come out of that shape:
 *
 * 1. **The canvas never decides legality.** `tryMove` hands the direction to the
 *    session and reads the outcome; the only branch it takes on `"illegal"` is the
 *    §6.5 nudge of the *player* (no movement, no phase flip, no board reaction — a
 *    refusal is information, not an error).
 * 2. **A new move never desyncs the picture.** `BoardView` animates toward the
 *    state it is given and snaps a running flip to its target (§6.4, queue depth
 *    1), so the scene may forward states as fast as the player taps.
 *
 * The scene owns no colours, no sizes and no rules; the only numeric table it
 * touches is the §6.1 flip budget (`flipTimings`), used to delay the win flash
 * until the flip has resolved.
 */

import Phaser from "phaser";

import type { Direction } from "@/core/state/move";
import type { GameState, Vec } from "@/core/state/types";
import { adjacentDirection, attachInput } from "@/game/input/input-map";
import type { InputHost, InputIntent } from "@/game/input/input-map";
import { BoardView } from "@/game/renderer/board-view";
import type { Viewport } from "@/game/renderer/grid-mapping";
import type { AppIntents } from "@/game/systems/app-intents";
import type { GameSession } from "@/game/systems/session";
import { flipTimings } from "@/game/theme/tokens";

/** Everything the scene needs, injected by the composition root (`src/main.ts`). */
export interface LevelSceneContext {
  readonly session: GameSession;
  /** undo / restart / next — the same closures the DOM buttons call. */
  readonly intents: AppIntents;
  /**
   * Canvas-parent measurement in **device px** (R-L6: `min(devicePixelRatio, 2)`).
   * The scene never touches the DOM itself; the composition root owns the box.
   */
  readonly measure: () => Viewport;
  /** `BoardView.onLayout` → HUD (the R-T5 swipe hint needs the CSS cell size). */
  readonly onCellSizeCss: (cellSizeCss: number) => void;
  readonly reducedMotion: boolean;
}

/** Phaser scene key. One scene, one board. */
export const LEVEL_SCENE_KEY = "level";

export class LevelScene extends Phaser.Scene {
  private readonly ctx: LevelSceneContext;
  private readonly unsubscribes: (() => void)[] = [];

  private view: BoardView | null = null;
  /** The render scale the current view was built with (R-L6); a DPR change rebuilds. */
  private renderScale: number;
  private detachInput: (() => void) | null = null;
  private winTimer: Phaser.Time.TimerEvent | null = null;
  private reducedMotion: boolean;

  constructor(ctx: LevelSceneContext) {
    super(LEVEL_SCENE_KEY);
    this.ctx = ctx;
    this.reducedMotion = ctx.reducedMotion;
    this.renderScale = ctx.measure().renderScale;
  }

  // `create` is not declared on `Phaser.Scene` (Phaser calls it by name), so it is
  // the one lifecycle method that must not carry `override`; `update` is declared.
  create(): void {
    this.buildView(this.ctx.session.state);

    const scene = this;
    const host: InputHost = {
      // Read through getters: a gesture must always be judged against the state the
      // player can see *now*, never against whatever was current at attach time.
      get renderScale(): number {
        return scene.ctx.measure().renderScale;
      },
      get playerPosition(): Vec {
        return scene.ctx.session.playerPosition;
      },
      cellAt: (px, py) => scene.view?.cellAt(px, py) ?? null,
      move: (dir) => {
        scene.tryMove(dir);
      },
      hover: (cell) => {
        scene.setHover(cell);
      },
      intent: (action) => {
        scene.runIntent(action);
      },
    };
    this.detachInput = attachInput(this, host);

    // §6.4 / R-L7 — the game size is set by the composition root from the CSS box
    // (R-L6 ×2 backing store); on every change the layout is recomputed once.
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);

    const events = this.ctx.session.events;
    this.unsubscribes.push(
      // A legal move was already committed by the session when this fires.
      events.on("move", () => {
        this.view?.animateTo(this.ctx.session.state, this.time.now);
      }),
      // Undo and restart are instant repaints, not flips: they restore a state the
      // player has already seen, so animating them would invent a move (§6.2).
      events.on("undo", () => {
        this.cancelWinFlash();
        this.view?.snapTo(this.ctx.session.state);
      }),
      events.on("restart", () => {
        this.cancelWinFlash();
        this.view?.snapTo(this.ctx.session.state);
      }),
      // Next level: the board is a different level, so the view is rebuilt rather
      // than re-tinted (the wall tile set itself changed).
      events.on("levelStarted", () => {
        this.buildView(this.ctx.session.state);
      }),
      // §6.2 — the win flash lands after the flip resolves, never during it.
      events.on("levelWon", () => {
        this.scheduleWinFlash();
      }),
    );
  }

  override update(_time: number, _delta: number): void {
    // The view is a function of committed state + elapsed time; the scene clock is
    // the single time source, so a paused/duplicated scene cannot double-advance it.
    this.view?.update(this.time.now);
  }

  /** §6.4 — a live OS preference change applies to the next flip, no rebuild. */
  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    this.view?.setReducedMotion(reducedMotion);
  }

  /* ── the single logical action ───────────────────────────────────────────── */

  /**
   * `MOVE(dir)` — the **only** logical action (`AGENTS.md` §2).
   *
   * Note what is *not* here: no wall lookup, no phase test, no "is the target a
   * wall in the current phase" branch. The session asks the core reducer, and the
   * core's identity contract (`next === gs`) is the definition of a refusal.
   *
   * The refused branch nudges **the player** 4 px toward the blocked cell (§6.5).
   * Nothing is drawn on, near or over the wall that refused the move, and the DOM
   * says nothing at all: "the world did not flip" is the primary cue.
   */
  private tryMove(dir: Direction): void {
    const outcome = this.ctx.session.move(dir);
    if (outcome !== "illegal") return;
    this.view?.denyFeedback(dir, this.time.now);
  }

  /** undo / restart / next — the same closures the DOM buttons dispatch. */
  private runIntent(action: InputIntent): void {
    this.ctx.intents[action]();
  }

  /**
   * R-T6 hover. The ring appears only where the **core** would accept the move:
   * the question is asked by calling the same reducer and throwing the result away
   * (`GameSession.movePreview`), so there is no second legality rule to drift, and
   * a ring can never promise a move the rules refuse. Input is never gated by it.
   */
  private setHover(cell: Vec | null): void {
    if (cell === null) {
      this.view?.setHover(null);
      return;
    }
    const dir = adjacentDirection(this.ctx.session.playerPosition, cell);
    this.view?.setHover(dir !== null && this.ctx.session.movePreview(dir) ? cell : null);
  }

  /* ── view lifecycle ──────────────────────────────────────────────────────── */

  private buildView(state: GameState): void {
    this.cancelWinFlash();
    this.view?.destroy();

    const viewport = this.ctx.measure();
    this.renderScale = viewport.renderScale;
    this.view = new BoardView(
      {
        scene: this,
        level: this.ctx.session.level,
        renderScale: viewport.renderScale,
        reducedMotion: this.reducedMotion,
      },
      state,
      viewport,
      (cellSizeCss) => {
        this.ctx.onCellSizeCss(cellSizeCss);
      },
    );
  }

  private onResize(): void {
    const viewport = this.ctx.measure();
    // A device-pixel-ratio change (window moved to another display) changes the
    // render scale, and that is baked into the wall views — rebuild instead of
    // stretching them.
    if (viewport.renderScale !== this.renderScale) {
      this.buildView(this.ctx.session.state);
      return;
    }
    this.view?.resize(viewport);
  }

  private scheduleWinFlash(): void {
    this.cancelWinFlash();
    const delay = flipTimings(this.reducedMotion).total;
    this.winTimer = this.time.delayedCall(delay, () => {
      this.winTimer = null;
      this.view?.winFlash(this.time.now);
    });
  }

  private cancelWinFlash(): void {
    this.winTimer?.remove(false);
    this.winTimer = null;
  }

  private teardown(): void {
    this.cancelWinFlash();
    for (const off of this.unsubscribes) off();
    this.unsubscribes.length = 0;
    this.detachInput?.();
    this.detachInput = null;
    this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.view?.destroy();
    this.view = null;
  }
}