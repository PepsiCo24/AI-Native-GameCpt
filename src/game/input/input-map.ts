/**
 * Input mapping — **one logical action**: `MOVE(direction)` (`AGENTS.md`).
 *
 * `docs/game-design.md` §6: tap an adjacent tile, or swipe, or press an arrow /
 * WASD key — all three resolve to the same `Move`, and nothing else. `docs/ui-ux.md`
 * §11/§8 constrain the geometry:
 *
 * - **R-T3** cell hit area = the cell rect exactly; a tap on a non-adjacent cell
 *   is a **non-input** (no feedback, no penalty, §6.5), and a tap outside the grid
 *   is a non-input too.
 * - **R-T4** swipe = ≥ 24 px travel within 500 ms, dominant axis wins; below the
 *   threshold it is treated as a tap.
 * - **R-T6** hover is a desktop-only affordance; it never changes hit areas, and it
 *   asks the host (which asks the **core reducer**) whether the ring is allowed.
 * - **§7.4** keyboard: arrows + WASD → `MOVE`, `Z` → undo, `R` → restart,
 *   `Enter` → next on win.
 *
 * The mapper never inspects walls, doors or phases: translating a gesture into a
 * direction is not a rule, and a "would this be refused?" test here would be the
 * exact duplication AGENTS.md §3 forbids. Direction → outcome is decided inside
 * the core, by `applyMoveToGameState`.
 *
 * The keyboard half of the translation lives in `./key-handler` — a Phaser-free
 * module — because the one rule it must obey (**one DOM `keydown` event object ⇒
 * at most one action**, TICKET-QA-005-1) has to be callable from a unit test. This
 * file only wires it to the scene's `keydown` channel and detaches it again.
 */

import Phaser from "phaser";
import type { Direction } from "@/core/state/move";
import type { Vec } from "@/core/state/types";
import { createKeyActionHandler } from "@/game/input/key-handler";
import type { InputIntent } from "@/game/input/key-handler";
import { LAYOUT } from "@/game/theme/tokens";

export type { InputIntent } from "@/game/input/key-handler";

export interface InputHost {
  /** `min(devicePixelRatio, 2)` — converts the CSS-px thresholds of R-T4. */
  readonly renderScale: number;
  /** The player's cell, for the adjacency test of R-T3. */
  readonly playerPosition: Vec;
  /** Device px → cell, or `null` outside the grid. */
  cellAt(px: number, py: number): Vec | null;
  move(dir: Direction): void;
  /** R-T6 hover (desktop). `null` clears it. */
  hover(cell: Vec | null): void;
  intent(action: InputIntent): void;
}

function dominantDirection(dx: number, dy: number): Direction {
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/** Direction from the player's tile to an adjacent cell, or `null` when not adjacent (R-T3). */
export function adjacentDirection(player: Vec, cell: Vec): Direction | null {
  const dx = cell.x - player.x;
  const dy = cell.y - player.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return null;
  if (dx === 1) return "right";
  if (dx === -1) return "left";
  if (dy === 1) return "down";
  return "up";
}

/**
 * Attach pointer + keyboard input. Returns a detach function (scene shutdown).
 *
 * Tap and swipe both end in `host.move(dir)` with **no** legality inspection — a
 * tap on a ghost tile (a legal destination under ADR-0008) and a tap on a
 * current-phase solid wall (refused) take the identical code path; only the core
 * distinguishes them, which is what keeps refusal semantics honest.
 */
export function attachInput(scene: Phaser.Scene, host: InputHost): () => void {
  let down: { x: number; y: number; time: number } | null = null;
  const swipeTravel = LAYOUT.swipeMinTravel * host.renderScale;

  const onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    down = { x: pointer.x, y: pointer.y, time: scene.time.now };
    updateHover(pointer);
  };

  const onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    updateHover(pointer);
  };

  const onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    const start = down;
    down = null;
    if (!start) return;

    const dx = pointer.x - start.x;
    const dy = pointer.y - start.y;
    const travel = Math.hypot(dx, dy);
    const elapsed = scene.time.now - start.time;

    // R-T4 — swipe first: above the threshold the gesture is a direction, even if
    // the finger never leaves its own cell (the R-T5 fallback for small cells).
    if (travel >= swipeTravel && elapsed <= LAYOUT.swipeMaxMs) {
      host.move(dominantDirection(dx, dy));
      return;
    }

    // Below the threshold it is a tap: adjacent cell → MOVE, anything else → non-input.
    const cell = host.cellAt(pointer.x, pointer.y);
    if (!cell) return;
    const dir = adjacentDirection(host.playerPosition, cell);
    if (!dir) return;
    host.move(dir);
  };

  function updateHover(pointer: Phaser.Input.Pointer): void {
    if (pointer.wasTouch === true) return; // touch has no hover state (R-T6)
    host.hover(host.cellAt(pointer.x, pointer.y));
  }

  const onPointerOut = (): void => host.hover(null);

  // TICKET-QA-005-1: Phaser re-delivers the *same* `keydown` event object while a
  // burst sits in its per-frame queue, so the handler consumes by identity — one
  // action per delivered press, never a replay of the queue (`./key-handler`).
  const onKeyDown = createKeyActionHandler(host);

  scene.input.on(Phaser.Input.Events.POINTER_DOWN, onPointerDown);
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, onPointerMove);
  scene.input.on(Phaser.Input.Events.POINTER_UP, onPointerUp);
  scene.input.on(Phaser.Input.Events.GAME_OUT, onPointerOut);
  scene.input.keyboard?.on("keydown", onKeyDown);

  return () => {
    scene.input.off(Phaser.Input.Events.POINTER_DOWN, onPointerDown);
    scene.input.off(Phaser.Input.Events.POINTER_MOVE, onPointerMove);
    scene.input.off(Phaser.Input.Events.POINTER_UP, onPointerUp);
    scene.input.off(Phaser.Input.Events.GAME_OUT, onPointerOut);
    scene.input.keyboard?.off("keydown", onKeyDown);
  };
}