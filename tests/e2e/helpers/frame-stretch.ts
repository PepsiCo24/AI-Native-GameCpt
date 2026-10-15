/**
 * The **fabricated coarse grid** (QA-005d) — a test-side frame stretcher, so the
 * "no presented frame can hold this transient" branch is provable on *any*
 * machine, including a fast 60 Hz laptop.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * `transient.spec.ts` P1's pixel claim (the §6.5 refusal arc, `deny.dur = 90 ms`)
 * is only owed when the runner's frame grid can place a frame stamp strictly
 * inside the arc's window. On a fast machine that is always true; on the 2-core
 * software-GL CI runner the grid straddles 90 ms — the same test came back
 * `onset: null` twice and passed on a retry, i.e. the *evidence channel*, not the
 * game, was the variable.
 *
 * The fallback branch therefore has to be exercised deliberately, not left to a
 * slow runner's mercy: this helper burns a fixed budget **once per animation
 * frame**, so every frame interval is provably longer than the transient. Then
 * "no onset" is a *prediction* the machine must obey, and a runner-independent
 * regression test for the classification in `helpers/frame-model.ts`.
 *
 * ── How it works (and what it deliberately does not touch) ──────────────────
 * `window.requestAnimationFrame` is wrapped **from the test**, before the app
 * boots (`addInitScript`), and each frame's *first* callback pays a busy-wait of
 * `stretchMs` before running. Because the guard is keyed on the frame's own
 * timestamp, the other callbacks of the same frame (Phaser's step, the recorder's
 * read-back, the observer's log) run immediately after: one burn per frame, not
 * one per subscriber. The main thread cannot start the next frame's callbacks
 * before the burn ends, so the next `requestAnimationFrame` timestamp is at least
 * `stretchMs` later — and that timestamp *is* `scene.time.now` for the step it
 * drives (`Clock.update` ← `TimeStep.step(time)`).
 *
 * Nothing under `src/**` is touched, no production timing is faked, and the
 * stretched grid is *measured* by the caller (`frame-model.ts` `medianFrameGap`,
 * or `capture.ts` `measureFrameGrid`) rather than trusted: the tests assert the
 * fabricated grid is at least `deny.dur` long before they draw any conclusion
 * from it.
 *
 * The wrapper is installed for the whole test (every navigation of the page) and
 * disabled by {@link setFrameStretch}(0), so a test that only needs the coarse
 * grid for part of its walk can turn it back off.
 */

import type { Page } from "@playwright/test";

/**
 * Install the stretcher. MUST be called before {@link import("./game").openLevel}
 * — the app's very first frame has to be a stretched one, or the boot sequence
 * (three frames of readiness) would run at the natural grid.
 */
export async function installFrameStretcher(page: Page, stretchMs: number): Promise<void> {
  await page.addInitScript((budgetMs: number) => {
    const holder = window as unknown as {
      __psFrameStretchMs?: number;
      __psStretchBurnedFor?: number;
    };
    holder.__psFrameStretchMs = budgetMs;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = ((callback: FrameRequestCallback): number =>
      original((timestamp: number) => {
        const budget = holder.__psFrameStretchMs ?? 0;
        // Once per frame, not once per subscriber: the guard is the frame's own
        // timestamp, so every callback of this frame shares the single burn.
        if (budget > 0 && holder.__psStretchBurnedFor !== timestamp) {
          holder.__psStretchBurnedFor = timestamp;
          const end = performance.now() + budget;
          while (performance.now() < end) {
            /* burn this frame's budget on the main thread */
          }
        }
        callback(timestamp);
      })) as typeof window.requestAnimationFrame;
  }, stretchMs);
}

/** Change (or clear, with `0`) the per-frame burn for the rest of the test. */
export async function setFrameStretch(page: Page, stretchMs: number): Promise<void> {
  await page.evaluate((budgetMs: number) => {
    (window as unknown as { __psFrameStretchMs?: number }).__psFrameStretchMs = budgetMs;
  }, stretchMs);
}