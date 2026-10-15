/**
 * Standing e2e — **the keyboard frame-window defect** (QA-005; fixed by R-004b at
 * the call site, so this file is now the regression record with no pins left).
 *
 * ── Reproduce → Root cause → Fix → Regression ────────────────────────────────
 *
 * **Reproduce (deterministic).** Dispatch two arrow **keydown/keyup pairs**
 * (`R`, `L`) inside a single task — i.e. one rendered-frame window — and the game
 * applies **five** moves instead of two. One pair alone applies exactly one move,
 * so the trigger is the *second* pair, not the dispatching mechanism. The
 * measured matrix on L2 (start `(0,1)` phase A):
 *
 * | burst in one task | events | legal moves expected | observed |
 * |---|---|---|---|
 * | `R` | 2 | 1 | 1 |
 * | `R`,`R` | 4 | 2 | 3 (clamped: the 4th `R` is out of bounds) |
 * | `R`,`L` | 4 | 2 | **5** |
 * | `R`,`L`,`R`,`L` | 8 | 4 | **18** |
 *
 * **Root cause (Phaser 3, read in `node_modules/phaser/src/input/keyboard/`).**
 * `KeyboardManager.onKeyDown` pushes the DOM event into `manager.queue` and then
 * emits `MANAGER_PROCESS` **synchronously**, and `KeyboardPlugin.update()` walks
 * that queue **from index 0 every time**:
 *
 * ```js
 * this.onKeyDown = function (event) { _this.queue.push(event); _this.manager.events.emit(MANAGER_PROCESS); }
 * // KeyboardPlugin.update()
 * var queue = this.manager.queue;  var len = queue.length;
 * for (var i = 0; i < len; i++) { var event = queue[i]; ... this.emit(ANY_KEY_DOWN, event) }
 * ```
 *
 * The queue is only emptied in `KeyboardManager.postUpdate`, which the game runs
 * on `POST_RENDER` — one **frame** later. So every key event received since the
 * last rendered frame makes the plugin re-emit *all* of them.
 *
 * Two guards exist and both are per-*consecutive*-event, which is why an
 * alternating down/up burst defeats them:
 *
 * 1. the consecutive duplicate check `code === prevCode && event.timeStamp ===
 *    prevTime && event.type === prevType` — a keyup always differs from the
 *    keydown before it, so it never trips;
 * 2. `repeat = key.isDown` + `if (!event.cancelled && (!key || !repeat))` —
 *    re-walking `[down, up, down]` reaches the first `down` *after* the `up` has
 *    already cleared `isDown`, so it is emitted a second time.
 *
 * **Fix (owner: Gameplay Engineer, one line at the call site).** Phaser re-emits
 * the *same* event object, so `attachInput`'s own handler can dedupe on object
 * identity:
 *
 * ```ts
 * const handled = new WeakSet<KeyboardEvent>();
 * const onKeyDown = (event: KeyboardEvent): void => {
 *   if (handled.has(event)) return;   // ← the plugin re-walks its queue per frame
 *   handled.add(event);
 *   ...
 * };
 * ```
 *
 * **Regression (landed).** The second test below is the regression pin and is now
 * an **ordinary passing assertion**: R-004b stores the handled events in a
 * `WeakSet` at the call site, so the two pairs in one frame window are exactly two
 * moves (`Expected: 2, Received: 5` before the fix). There is no `test.fail()`
 * anywhere in this suite any more — the annotation is deleted exactly when the fix
 * lands, never left to rot. The surrounding tests stay as the islands around the
 * pin: one pair in one window is one move, the same burst spread across frames is
 * applied once per pair, and the 2-frame-paced press helper must keep producing
 * exactly one move per press, because it is what makes every other file in this
 * suite measure *rules* rather than frame boundaries.
 */

import { expect, test } from "@playwright/test";

import { levelUrl } from "./helpers/levels";
import { hud, openLevel, pressDirection, waitForFrames } from "./helpers/game";

/**
 * Dispatch whole keydown/keyup pairs **in one task** — the browser cannot render
 * a frame in the middle of a synchronous `evaluate`, so this is exactly "two
 * press/release cycles inside one frame window", the defect's precondition.
 */
async function burstPairs(page: import("@playwright/test").Page, codes: readonly string[]): Promise<void> {
  await page.evaluate((input: readonly string[]) => {
    for (const code of input) {
      const key = code === "ArrowLeft" ? "ArrowLeft" : "ArrowRight";
      const init = { code, key, bubbles: true, cancelable: true };
      window.dispatchEvent(new KeyboardEvent("keydown", init));
      window.dispatchEvent(new KeyboardEvent("keyup", init));
    }
  }, codes as unknown as string[]);
}

test.describe("keyboard frame window", () => {
  test("one press/release cycle inside one frame window is exactly one move", async ({ page }) => {
    await openLevel(page, levelUrl(2));
    await burstPairs(page, ["ArrowRight"]);
    await waitForFrames(page, 3);
    const state = await hud(page);
    expect(state.moves, "a single press is never replayed").toBe(1);
  });

  test(
    "two press/release cycles inside one frame window must be exactly two moves",
    async ({ page }) => {
      // Fixed at the call site (R-004b): Phaser re-walks its whole keyboard queue
      // on every DOM key event and empties it only a frame later, so `attachInput`
      // now consumes the *same* event object at most once — `createKeyActionHandler`
      // in `src/game/input/key-handler.ts` holds the WeakSet. The pin is gone; this
      // is now an ordinary passing assertion.
      await openLevel(page, levelUrl(2));

      await burstPairs(page, ["ArrowRight", "ArrowLeft"]);
      await waitForFrames(page, 3);

      const state = await hud(page);
      // R then L from (0,1) in phase A: two flips, back on the start tile.
      expect(state.moves, "two presses must be two moves, not a replay of the queue").toBe(2);
      expect(state.phase).toBe("A");
    },
  );

  test("the paced press helper isolates the rules from the frame window", async ({ page }) => {
    // This is the guarantee every other spec in the suite relies on: one press per
    // frame window ⇒ at most one pair in the queue ⇒ no replay.
    await openLevel(page, levelUrl(2));
    await pressDirection(page, "right");
    await pressDirection(page, "left");
    await pressDirection(page, "right");
    const state = await hud(page);
    expect(state.moves, "three paced presses are exactly three moves").toBe(3);
    expect(state.phase, "three flips from phase A").toBe("B");
  });

  test("the same burst delivered across frames is applied exactly once per pair", async ({ page }) => {
    // The mirror image of the defect: identical events, one frame apart, behave.
    await openLevel(page, levelUrl(2));
    await burstPairs(page, ["ArrowRight"]);
    await waitForFrames(page, 2);
    await burstPairs(page, ["ArrowLeft"]);
    await waitForFrames(page, 3);
    const state = await hud(page);
    expect(state.moves).toBe(2);
    expect(state.phase).toBe("A");
  });
});