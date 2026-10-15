/**
 * Keyboard translation — **one DOM `keydown` event object ⇒ at most one action**.
 *
 * `docs/game-design.md` §6 / `docs/ui-ux.md` §7.4: arrows + WASD resolve to
 * `MOVE(direction)`, `Z` → undo, `R` → restart, `Enter` → next. Nothing else, and
 * no legality inspection — direction → outcome is decided by core's
 * `applyMoveToGameState` (AGENTS.md §3), never here.
 *
 * ── Why this is a separate, Phaser-free module (TICKET-QA-005-1) ─────────────
 *
 * Phaser 3's keyboard plugin **re-delivers the same event object more than once**
 * (`KeyboardManager.onKeyDown`/`onKeyUp` push the DOM event into `manager.queue`
 * and synchronously emit `MANAGER_PROCESS`; `KeyboardPlugin.update()` walks that
 * queue **from index 0** on every emission, and the queue is only emptied in
 * `postUpdate` — one rendered frame later). Both of Phaser's own guards are
 * per-*consecutive*-event, so an alternating down/up burst inside one frame window
 * defeats them:
 *
 * 1. the consecutive-duplicate check
 *    (`code === prevCode && timeStamp === prevTime && type === prevType`) never
 *    trips, because a `keyup` always differs from the `keydown` before it;
 * 2. `repeat = key.isDown` is already cleared by the preceding `keyup` when the
 *    re-walk reaches the same `keydown` again.
 *
 * The same *object* is what comes back each time, so the handler consumes by
 * **identity**: a `WeakSet` of the events it has already acted on. Measured on L2
 * (`R` then `L` in one task): 5 moves before, exactly 2 after — see
 * `tests/e2e/input-replay.spec.ts` (QA-005's pin, now un-pinned) and
 * `tests/unit/input-key-handler.test.ts` (the queue re-walk driven step by step).
 *
 * The rule is written here as a pure function **first** and only then wired to the
 * DOM by `attachInput`, so it is testable without a browser and without Phaser:
 * `src/game/**` may import Phaser, but a rule that a test must be able to call
 * should not need it.
 *
 * One thing this deliberately does **not** do: suppress OS key **repeat**. Holding
 * an arrow key still produces one move per repeated `keydown` (each repeat is a
 * *distinct* event object), which is the pre-existing behaviour and not this
 * ticket's defect.
 */

import type { Direction } from "@/core/state/move";

/** The three non-`MOVE` actions the keyboard can dispatch (`docs/ui-ux.md` §7.4). */
export type InputIntent = "undo" | "restart" | "next";

/**
 * The **only** DOM surface this rule reads: the key code, and the ability to
 * cancel the browser default. Taken as a structural type rather than
 * `KeyboardEvent` so the rule can be driven from a `node`-environment unit test
 * (no jsdom, no Phaser) — a real `KeyboardEvent` satisfies it unchanged.
 */
export interface KeyEventLike {
  readonly code: string;
  preventDefault(): void;
}

/** What a mapped key does: exactly one `MOVE` or exactly one intent. */
export interface KeyActionHost {
  move(dir: Direction): void;
  intent(action: InputIntent): void;
}

const KEY_MOVE: Readonly<Record<string, Direction>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

const KEY_INTENT: Readonly<Record<string, InputIntent>> = {
  KeyZ: "undo",
  KeyR: "restart",
  Enter: "next",
};

/**
 * Build the `keydown` handler for one input attachment.
 *
 * The returned function is safe to call any number of times with the same event
 * object: the first call acts, every further call with that **same object** is a
 * no-op. A fresh object (a real key press, or an OS key repeat) always acts, so
 * exactly one action per delivered press survives the re-walk.
 */
export function createKeyActionHandler(host: KeyActionHost): (event: KeyEventLike) => void {
  const handled = new WeakSet<KeyEventLike>();

  return (event: KeyEventLike): void => {
    const dir = KEY_MOVE[event.code];
    const intent = dir === undefined ? KEY_INTENT[event.code] : undefined;
    // Not one of our keys: nothing to consume, and `preventDefault` is not ours to
    // call (browser shortcuts and page scrolling stay the browser's business).
    if (dir === undefined && intent === undefined) return;
    if (handled.has(event)) return;
    handled.add(event);

    event.preventDefault();
    if (dir !== undefined) {
      host.move(dir);
      return;
    }
    if (intent !== undefined) host.intent(intent);
  };
}