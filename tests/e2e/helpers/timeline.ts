/**
 * QA-023 — the **own-timeline instruments** for the last two wall-clock rows.
 *
 * ── The class, named ─────────────────────────────────────────────────────────
 * Cloud round `39023384882` died on exactly two rows (`docs/project-status.md`
 * item 123), both of them in this file's debt: rows that asked a question about
 * *motion* and answered it with **a reading of the test's own clock** — an rAF
 * capture tail, or `panelAt - keyAt` against a typed millisecond budget. On a
 * starved runner (gridMs 204.6–294.6) the frame the test happened to read had
 * drifted past the beat, and the row reported a product defect where the only
 * defect was the sampling schedule. QA-021 buried three specimens of the class
 * (A-7's ramp, SF-6's two-beat window, and the rate-20 reproduction that proved
 * the method); the last two are A-5 (item 123 RED-1) and B13 (RED-2), and this
 * module carries the instruments their conversion needs.
 *
 * ── The law the conversion follows (QA-021 canon, restated) ──────────────────
 * *Only clocks the verdict is invariant to may be read.* Concretely:
 *
 * 1. **The flip's own declared values** come from the shipped table
 *    (`flipTimings`) and from the page's computed style — never from a typed
 *    millisecond literal.
 * 2. **The flip's own end** is read on the **document timeline**: every DOM rider
 *    of the flip (`.ps-chip`, `.ps-play`, `.ps-shell`, `.ps-btn`) publishes its
 *    `startTime` and its own computed `delay`/`duration` at its `transitionrun`,
 *    so `startTime + delay + duration` is the instant that beat ends *on the
 *    clock the animation itself runs on*. A starved frame moves the two numbers
 *    that produce it by at most one frame, and only in the direction that
 *    *delays* the declared end (a transition is created on a frame boundary, so
 *    its published `startTime` can never precede the frame the beat began on).
 * 3. **"Resting" is then measured from that instant**, never from a sleep: the
 *    frames the capture takes *at or after* the flip's own end must be pairwise
 *    identical *and* identical to the settled picture. A transient that outlives
 *    its own declared window is therefore still caught — that is the control.
 * 4. **Event *order* is read on the timeline, never as delivery order.** The
 *    panel's entrance animation publishes its own `startTime`; the flip's budget
 *    is the press instant on the *same* clock plus the declared `flipTimings`
 *    total. Delivery order (a `transitionend` dispatched by the rendering steps
 *    vs a `setTimeout` task) **is** grid-sensitive — on a 200 ms starved frame the
 *    timer can be serviced first — so no assertion in this file is written on it.
 *    The two event logs below are therefore *stamped*, and reported, not ordered.
 *
 * ── What is deliberately NOT here ────────────────────────────────────────────
 * This file owns no product value and no `src/**` edit; it re-reads the shipped
 * declarations. It is a **new file** rather than an addition to
 * `helpers/capture.ts` / `helpers/frames.ts` because those two sit under a live
 * single-writer lane (R-004c pins the dataset files), and because the recorder
 * below stops on the *document timeline* rather than on a wall-clock `maxMs`,
 * which is a different contract from the QA-005 resampler's.
 */

import type { Page } from "@playwright/test";

/** Channel distance under which two pixels count as "the same" (same value as `capture.ts`). */
export const BEAT_TOLERANCE = 6;

export interface Roi {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Build an ROI centred on a device-px point (device px, canvas backing store). */
export function roiAround(centre: { x: number; y: number }, half: number): Roi {
  return {
    x: Math.round(centre.x - half),
    y: Math.round(centre.y - half),
    w: Math.round(half * 2),
    h: Math.round(half * 2),
  };
}

/* ───────────────────────────── the beat recorder ───────────────────────── */

/**
 * ── The QA-023 **saturation arm** (opt-in, inert unless set) ─────────────────
 *
 * `helpers/throttle.ts` cannot reach the cloud's starvation on this machine: Chromium
 * clamps `Emulation.setCPUThrottlingRate` at 20, and at that rate the measured
 * recorder grid is 26 ms solo / 41 ms inside the full file, while the cloud round
 * `39023384882` logged **204.6–294.6 ms**. A rate-20 run alone therefore *passes* the
 * two unconverted rows locally — the reproduction would be a story about a slow
 * runner instead of a measurement of one.
 *
 * This arm closes that gap the same way the cloud did, without touching `src/**`: it
 * lets the test saturate the page's main thread for a bounded window, so
 * `requestAnimationFrame` deliveries are spaced exactly the way a loaded 2-core
 * runner spaces them. It is a *starvation source*, not a product hook, and it is
 * never set on a normal run — the converted rows' acceptance includes a green run
 * with it enabled, which is strictly stronger than the cloud.
 *
 * ```
 * PS_E2E_CPU_THROTTLE=20 PS_E2E_BEAT_LOAD=200 PS_E2E_BEAT_WINDOW=500 npx playwright test …
 * ```
 */
export async function saturateMainThread(page: Page): Promise<number> {
  const burnMs = Number(process.env["PS_E2E_BEAT_LOAD"] ?? "");
  const windowMs = Number(process.env["PS_E2E_BEAT_WINDOW"] ?? "6000");
  if (!Number.isFinite(burnMs) || burnMs <= 0) return 0;
  const budget = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 6_000;
  await page.evaluate(
    (input: { burnMs: number; windowMs: number }) => {
      const holder = window as unknown as { __psBeatLoad?: boolean };
      if (holder.__psBeatLoad === true) return;
      holder.__psBeatLoad = true;
      const start = performance.now();
      const spin = (): void => {
        const until = performance.now() + input.burnMs;
        while (performance.now() < until) {
          /* burn the main thread — the starvation source */
        }
        if (performance.now() - start > input.windowMs) return;
        setTimeout(spin, 0);
      };
      setTimeout(spin, 0);
    },
    { burnMs, windowMs: budget },
  );
  return burnMs;
}

/**
 * One captured frame of a beat ROI, on **both** clocks.
 *
 * `t` is the recorder's own wall clock (kept for the grid report only). `docT` is
 * `document.timeline.currentTime` **at the capture** — the same clock the flip's
 * own riders publish their `startTime` on, which is what makes "the ROI was
 * resting at the beat's own end" a comparison instead of a race.
 */
export interface BeatFrame {
  readonly t: number;
  readonly docT: number;
  /** ROI pixels differing from the **settled** (last captured) frame. */
  readonly changed: number;
  /** ROI pixels differing from the **previous** captured frame. */
  readonly prevChanged: number;
  readonly maxDelta: number;
}

/**
 * Start capturing `roi` every frame, stopping **on the flip's own timeline**:
 * `afterFrames` frames past the anchor published by {@link armFlipTimeline} — or
 * `maxMs` of wall clock, whichever comes first, so a row whose anchor never
 * arrives terminates and fails loudly instead of hanging.
 */
export async function startBeatRecorder(
  page: Page,
  roi: Roi,
  options: { afterFrames?: number; maxMs?: number } = {},
): Promise<void> {
  await page.evaluate(
    (input: { roi: Roi; afterFrames: number; maxMs: number }) => {
      const canvas = document.querySelector("canvas");
      if (canvas === null) throw new Error("[timeline] no canvas");
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      if (ctx === null) throw new Error("[timeline] no 2d context");

      interface Rec {
        t0: number;
        frames: { t: number; docT: number; data: Uint8ClampedArray }[];
        stop: boolean;
        done: boolean;
        pressT: number | null;
        anchor: number | null;
        afterAnchor: number;
      }
      const holder = window as unknown as { __psBeat?: Rec };
      const rec: Rec = {
        t0: performance.now(),
        frames: [],
        stop: false,
        done: false,
        pressT: null,
        anchor: null,
        afterAnchor: 0,
      };
      holder.__psBeat = rec;

      const step = (): void => {
        if (rec.stop) return;
        ctx.drawImage(canvas, 0, 0);
        const image = ctx.getImageData(input.roi.x, input.roi.y, input.roi.w, input.roi.h);
        const docT = document.timeline.currentTime;
        const frame = {
          t: performance.now() - rec.t0,
          docT: typeof docT === "number" ? docT : 0,
          data: image.data,
        };
        rec.frames.push(frame);
        if (rec.anchor !== null && frame.docT >= rec.anchor) {
          rec.afterAnchor += 1;
          if (rec.afterAnchor >= input.afterFrames) {
            rec.done = true;
            return;
          }
        }
        if (performance.now() - rec.t0 >= input.maxMs) {
          rec.done = true;
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    { roi, afterFrames: options.afterFrames ?? 3, maxMs: options.maxMs ?? 4_000 },
  );
}

/** Stop the recorder and diff every frame against the settled (last) one. */
export async function stopBeatRecorder(page: Page, roi: Roi): Promise<readonly BeatFrame[]> {
  return page.evaluate(
    (input: { tolerance: number; width: number; height: number }) => {
      interface Rec {
        frames: { t: number; docT: number; data: Uint8ClampedArray }[];
        stop: boolean;
      }
      const rec = (window as unknown as { __psBeat?: Rec }).__psBeat;
      if (rec === undefined) throw new Error("[timeline] recorder was never started");
      rec.stop = true;
      const frames = rec.frames;
      const last = frames[frames.length - 1];
      if (last === undefined) return [];
      const settled = last.data;
      const diff = (
        a: Uint8ClampedArray,
        b: Uint8ClampedArray,
      ): { changed: number; maxDelta: number } => {
        let changed = 0;
        let maxDelta = 0;
        for (let i = 0; i < a.length; i += 4) {
          const delta = Math.max(
            Math.abs((a[i] ?? 0) - (b[i] ?? 0)),
            Math.abs((a[i + 1] ?? 0) - (b[i + 1] ?? 0)),
            Math.abs((a[i + 2] ?? 0) - (b[i + 2] ?? 0)),
          );
          if (delta > maxDelta) maxDelta = delta;
          if (delta > input.tolerance) changed += 1;
        }
        return { changed, maxDelta };
      };
      return frames.map((frame, index) => {
        const vsSettled = diff(frame.data, settled);
        const previous = frames[index - 1];
        const vsPrevious =
          previous === undefined ? { changed: 0, maxDelta: 0 } : diff(frame.data, previous.data);
        return {
          t: frame.t,
          docT: frame.docT,
          changed: vsSettled.changed,
          prevChanged: vsPrevious.changed,
          maxDelta: vsSettled.maxDelta,
        };
      });
    },
    { tolerance: BEAT_TOLERANCE, width: roi.w, height: roi.h },
  );
}

/**
 * How many frames the recorder has captured so far — polled (never slept on) so a
 * row can guarantee it has a **pre-press** frame before it presses, on any grid.
 */
export async function beatFrameCount(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as { __psBeat?: { frames: unknown[] } }).__psBeat?.frames.length ?? 0,
  );
}

/** True once the capture has taken its post-anchor frames (or hit its wall-clock cap). */
export async function beatRecorderFinished(page: Page): Promise<boolean> {
  return page.evaluate(
    () => (window as unknown as { __psBeat?: { done: boolean } }).__psBeat?.done ?? false,
  );
}

/**
 * Stamp the upcoming input on the **recorder's own clock**: every frame with
 * `t < pressT` was captured before the press, so "the picture was still" becomes a
 * statement about the captured frames rather than about a sleep.
 */
export async function stampBeatPress(page: Page): Promise<number> {
  return page.evaluate(() => {
    const rec = (window as unknown as { __psBeat?: { t0: number; pressT: number | null } }).__psBeat;
    if (rec === undefined) throw new Error("[timeline] recorder was never started");
    rec.pressT = performance.now() - rec.t0;
    return rec.pressT;
  });
}

/** Median wall-clock frame interval of a capture — the runner's grid, for the report. */
export function medianGridMs(frames: readonly BeatFrame[]): number {
  const deltas = frames
    .slice(1)
    .map((frame, index) => frame.t - (frames[index]?.t ?? frame.t))
    .sort((a, b) => a - b);
  return deltas[Math.floor(deltas.length / 2)] ?? 0;
}

/* ──────────────────── the flip's own timeline (DOM riders) ─────────────── */

/**
 * One flip rider's own record, read **at its `transitionrun`** — the frame the
 * transition was created on, which is the earliest moment the browser can be
 * asked what it is going to do.
 */
export interface RiderTimeline {
  readonly target: string;
  readonly property: string;
  /** `Animation.startTime` on the document timeline, or `null` while pending. */
  readonly startTime: number | null;
  /** `getComputedTiming().delay` — the declared delay, in ms. */
  readonly delayMs: number | null;
  /** `getComputedTiming().duration` — the declared duration, in ms. */
  readonly durationMs: number | null;
  /** `startTime + delay + duration`: where this rider ends **on its own clock**. */
  readonly endOnDocumentTimeline: number | null;
  /** The used longhands, as the computed style declares them. */
  readonly declaredDelay: string;
  readonly declaredDuration: string;
}

/** A transition event, stamped with its own `elapsedTime` (report-only; see the header). */
export interface RiderEvent {
  readonly kind: "run" | "start" | "end";
  readonly target: string;
  readonly property: string;
  readonly elapsedMs: number;
  readonly docT: number | null;
}

/** The panel's own animation record, read on the frame it exists. */
export interface PanelEntrance {
  readonly name: string | null;
  /** The entrance's own `startTime` on the document timeline — its onset. */
  readonly startTime: number | null;
  readonly currentTime: number | null;
  readonly playState: string | null;
}

/** The unhide instant, read synchronously inside the mutation that unhid the panel. */
export interface PanelOnset {
  readonly at: number;
  readonly docT: number | null;
  readonly nextHit: string | null;
  readonly nextDisabled: boolean | null;
  readonly nextBox: { x: number; y: number; w: number; h: number } | null;
  /** The interval the tick observer actually experienced at this mutation. */
  readonly frameAtUnhideMs: number | null;
}

/** The whole in-page instrument state for one row. */
export interface FlipTimeline {
  /** Every flip rider's own timeline record, in `transitionrun` order. */
  readonly riders: readonly RiderTimeline[];
  /** The transition events, stamped (reported, never ordered — see the header). */
  readonly events: readonly RiderEvent[];
  /** The overlay's unhide, or `null` if it never happened. */
  readonly onset: PanelOnset | null;
  /** The winning press, on the page clock (report-only). */
  readonly keyAt: number | null;
  /** The winning press, on the **document timeline** — the flip's own origin. */
  readonly keyDocT: number | null;
  /** The panel's entrance record, or `null` */
  readonly panel: PanelEntrance | null;
}

/**
 * Arm the flip observers.
 *
 * `riders` are CSS selectors of elements whose `background-color` transition
 * belongs to the flip: their `transitionrun` is what publishes the flip's own
 * timeline (see {@link RiderTimeline}). `overlay` is the win overlay — its
 * `hidden` attribute is what "the panel appeared" means — and the mutation that
 * removes it is where the panel's hit test and its entrance onset are read.
 */
export async function armFlipTimeline(
  page: Page,
  options: {
    riders: readonly string[];
    overlay: string;
    dialog: string;
    nextLabel?: string;
    /**
     * Clear the rider log on every keydown, so the log belongs to the flip the *last*
     * press started (B13 is won by the last leg of a route: without this the log holds
     * the level-entry flip and the first move's). The recorder's anchor is republished
     * by the new flip's own riders; between the clear and that publish it is `null`, so
     * the capture simply keeps running.
     */
    resetOnPress?: boolean;
  },
): Promise<void> {
  await page.evaluate(
    (input: { riders: string[]; overlay: string; dialog: string; nextLabel: string; resetOnPress: boolean }) => {
      interface Rec {
        riders: RiderTimeline[];
        riderKeys: string[];
        events: RiderEvent[];
        onset: PanelOnset | null;
        keyAt: number | null;
        keyDocT: number | null;
        panel: PanelEntrance | null;
        anchor: number | null;
        lastTick: number | null;
      }
      const holder = window as unknown as {
        __psFlip?: Rec;
        __psBeat?: { anchor: number | null };
      };
      const rec: Rec = {
        riders: [],
        riderKeys: [],
        events: [],
        onset: null,
        keyAt: null,
        keyDocT: null,
        panel: null,
        anchor: null,
        lastTick: null,
      };
      holder.__psFlip = rec;

      /** The recorder stops on the **latest** rider end seen so far, never the first. */
      const publish = (): void => {
        const beat = holder.__psBeat;
        if (beat !== undefined) beat.anchor = rec.anchor;
      };

      const readPanel = (tries: number): void => {
        const node = document.querySelector(input.dialog);
        const entrance = (node?.getAnimations() ?? []).find(
          (animation) => (animation as CSSAnimation).animationName === "ps-panel-in",
        );
        if (entrance === undefined) {
          if (tries > 0) requestAnimationFrame(() => readPanel(tries - 1));
          return;
        }
        const startTime = entrance.startTime === null ? null : Number(entrance.startTime);
        // The first read keeps the *undisturbed* clock (`currentTime`/`playState` at the
        // unhide); `startTime` is filled in as soon as the timeline places the animation,
        // because a freshly created animation is still pending for one frame or two.
        rec.panel =
          rec.panel === null
            ? {
                name: (entrance as CSSAnimation).animationName,
                startTime,
                currentTime: Number(entrance.currentTime ?? -1),
                playState: entrance.playState,
              }
            : rec.panel.startTime === null
              ? { ...rec.panel, startTime }
              : rec.panel;
        if (rec.panel.startTime === null && tries > 0) {
          requestAnimationFrame(() => readPanel(tries - 1));
        }
      };

      const record = (element: Element, propertyName: string): boolean => {
        const key = `${(element as HTMLElement).className}|${propertyName}`;
        if (rec.riderKeys.includes(key)) return true;
        const transition = element
          .getAnimations()
          .find(
            (animation) =>
              (animation as Partial<CSSTransition>).transitionProperty === propertyName &&
              animation.playState === "running",
          );
        const timing = (transition?.effect as KeyframeEffect | null | undefined)?.getComputedTiming();
        const style = getComputedStyle(element);
        const delay = typeof timing?.delay === "number" ? timing.delay : null;
        const duration = typeof timing?.duration === "number" ? timing.duration : null;
        const startTime =
          transition === undefined || transition.startTime === null
            ? null
            : Number(transition.startTime);
        // A transition created this frame can still be *pending*: `startTime` is null
        // until the timeline places it, which Chromium does not do inside the
        // `transitionrun` dispatch. A pending read is retried on the next frames (see
        // below); a null end is never recorded, so the anchor is never invented.
        if (startTime === null || delay === null || duration === null) return false;
        const end = startTime + delay + duration;
        rec.riderKeys.push(key);
        rec.riders.push({
          target: (element as HTMLElement).className,
          property: propertyName,
          startTime,
          delayMs: delay,
          durationMs: duration,
          endOnDocumentTimeline: end,
          declaredDelay: style.transitionDelay,
          declaredDuration: style.transitionDuration,
        });
        rec.anchor = rec.anchor === null ? end : Math.max(rec.anchor, end);
        publish();
        return true;
      };

      /** Retry a rider read on the following frames until the timeline places it. */
      const retry = (element: Element, propertyName: string, tries: number): void => {
        if (record(element, propertyName)) return;
        if (tries <= 0) return;
        requestAnimationFrame(() => {
          retry(element, propertyName, tries - 1);
        });
      };

      for (const selector of input.riders) {
        for (const node of Array.from(document.querySelectorAll(selector))) {
          for (const [name, kind] of [
            ["transitionrun", "run"],
            ["transitionstart", "start"],
            ["transitionend", "end"],
          ] as const) {
            node.addEventListener(
              name,
              (event) => {
                const transition = event as TransitionEvent;
                if (transition.propertyName !== "background-color") return;
                const docT = document.timeline.currentTime;
                rec.events.push({
                  kind,
                  target: (node as HTMLElement).className,
                  property: transition.propertyName,
                  elapsedMs: Number(transition.elapsedTime),
                  docT: typeof docT === "number" ? docT : null,
                });
                if (kind === "run") retry(node, transition.propertyName, 10);
              },
              true,
            );
          }
        }
      }

      window.addEventListener(
        "keydown",
        () => {
          if (input.resetOnPress) {
            rec.riders = [];
            rec.riderKeys = [];
            rec.events = [];
            rec.anchor = null;
            publish();
          }
          rec.keyAt = performance.now();
          const docT = document.timeline.currentTime;
          if (typeof docT === "number") rec.keyDocT = docT;
        },
        true,
      );

      // The observer's own frame interval — the measured resolution of the unhide
      // snapshot below (QA-021's `tickAt`, restated for this row).
      const tick = (): void => {
        rec.lastTick = performance.now();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      const capture = (): void => {
        if (rec.onset !== null) return;
        const now = performance.now();
        const docT = document.timeline.currentTime;
        const node = document.querySelector(input.dialog);
        const next = node?.querySelector(`button[aria-label="${input.nextLabel}"]`) ?? null;
        let nextHit: string | null = null;
        let nextBox: { x: number; y: number; w: number; h: number } | null = null;
        if (next instanceof HTMLElement) {
          const box = next.getBoundingClientRect();
          nextBox = { x: box.x, y: box.y, w: box.width, h: box.height };
          nextHit =
            document
              .elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
              ?.closest("button")
              ?.getAttribute("aria-label") ?? null;
        }
        rec.onset = {
          at: now,
          docT: typeof docT === "number" ? docT : null,
          nextHit,
          nextDisabled: next instanceof HTMLButtonElement ? next.disabled : null,
          nextBox,
          frameAtUnhideMs: rec.lastTick === null ? null : now - rec.lastTick,
        };
        readPanel(20);
      };

      const observe = (): void => {
        const node = document.querySelector(input.overlay);
        if (node === null) {
          requestAnimationFrame(observe);
          return;
        }
        if (!node.hasAttribute("hidden")) capture();
        new MutationObserver(() => {
          if (!node.hasAttribute("hidden")) capture();
        }).observe(node, { attributes: true, attributeFilter: ["hidden"] });
      };
      observe();
    },
    {
      riders: [...options.riders],
      overlay: options.overlay,
      dialog: options.dialog,
      nextLabel: options.nextLabel ?? "Next",
      resetOnPress: options.resetOnPress ?? false,
    },
  );
}

/** Read what {@link armFlipTimeline} recorded. */
export async function readFlipTimeline(page: Page): Promise<FlipTimeline | null> {
  return page.evaluate(
    () => (window as unknown as { __psFlip?: FlipTimeline }).__psFlip ?? null,
  );
}

/**
 * The flip's own end on the document timeline: the **latest** rider end. Several
 * riders share the flip (the tokens row on `.ps-play`/`.ps-shell`/`.ps-btn`, the
 * chip row on `.ps-chip`), and a claim about rest needs the latest of them.
 */
export function flipOwnEnd(timeline: FlipTimeline | null): number | null {
  const ends = (timeline?.riders ?? [])
    .map((rider) => rider.endOnDocumentTimeline)
    .filter((end): end is number => end !== null);
  return ends.length === 0 ? null : Math.max(...ends);
}

/** The rider that ends last — the flip's own final beat, and the row's anchor. */
export function lastRider(timeline: FlipTimeline | null): RiderTimeline | null {
  let best: RiderTimeline | null = null;
  for (const rider of timeline?.riders ?? []) {
    if (rider.endOnDocumentTimeline === null) continue;
    if (best === null || (rider.endOnDocumentTimeline ?? 0) > (best.endOnDocumentTimeline ?? 0)) {
      best = rider;
    }
  }
  return best;
}

/* ─────────────────────────── the rest predicate ────────────────────────── */

export interface RestVerdict {
  /** Index of the first frame at or after the flip's own end, or `-1` if there is none. */
  readonly fromIndex: number;
  /** How many frames fall at or after the flip's own end. */
  readonly frames: number;
  /** Sum of `prevChanged` over those frames — non-zero means something was still moving. */
  readonly moved: number;
  /** Sum of `changed` over those frames — non-zero means the settled picture was not reached. */
  readonly unsettled: number;
  readonly firstMovedAt: number | null;
}

/**
 * Frames **at or after** `anchorDocT` (the flip's own end on the document
 * timeline) must be a still picture: each identical to its predecessor and to the
 * settled (last) one. This is the QA-023 replacement for "the last frame after a
 * 420 ms sleep is the resting picture" — the sleep is gone and the answer is read
 * on the clock the beat itself runs on.
 */
export function restAfter(frames: readonly BeatFrame[], anchorDocT: number): RestVerdict {
  const fromIndex = frames.findIndex((frame) => frame.docT >= anchorDocT);
  if (fromIndex < 0) return { fromIndex: -1, frames: 0, moved: 0, unsettled: 0, firstMovedAt: null };
  const window = frames.slice(fromIndex);
  let moved = 0;
  let unsettled = 0;
  let firstMovedAt: number | null = null;
  for (const frame of window) {
    moved += frame.prevChanged;
    unsettled += frame.changed;
    if (frame.prevChanged > 0 && firstMovedAt === null) firstMovedAt = frame.docT;
  }
  return { fromIndex, frames: window.length, moved, unsettled, firstMovedAt };
}

/** The largest `prevChanged` over frames captured **before** the flip's own end (the beat). */
export function peakBefore(frames: readonly BeatFrame[], anchorDocT: number): number {
  return frames
    .filter((frame) => frame.docT < anchorDocT)
    .reduce((best, frame) => Math.max(best, frame.prevChanged), 0);
}