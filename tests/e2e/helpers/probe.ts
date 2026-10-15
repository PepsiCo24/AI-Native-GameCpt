/**
 * The **in-page observer** (QA-005d) — the CI evidence channel for the two
 * cloud-only survivors.
 *
 * ── The question it answers ──────────────────────────────────────────────────
 * The two failures that survived a local battery are both invisible from the
 * driver's side of the wire:
 *
 * - `transient.spec.ts` P1: `onset: null` on CI, an onset locally. Is the 90 ms
 *   refusal arc **presented at all** on that runner, or is the recorder broken?
 * - `mobile.mobile.spec.ts` R-T4: `Expected: 1, Received: 0`. Did the CDP touch
 *   sequence **arrive** at the page, and with which coordinates, in which order,
 *   and how many of the runner's own frames did it span?
 *
 * Both are answered by the same two logs, recorded **in the page** (nothing about
 * the game is mocked or wrapped — `src/**` is untouched):
 *
 * 1. **every `requestAnimationFrame` stamp.** Phaser steps the scene once per
 *    frame and stamps that step with the frame's rAF timestamp
 *    (`TimeStep.step(time)` → `Clock.update(time)`), so these are *the game's own*
 *    frame times, measured rather than assumed.
 * 2. **every DOM input event**, in the capture phase on `window`, with its
 *    `performance.now()` time (`rAF` stamps share that clock), its coordinates,
 *    its pointer type and the touch counts. Order and coordinates are recorded as
 *    delivered — a fix that "makes the test pass" by assuming the events arrived
 *    cannot hide behind it.
 *
 * Between them those two logs settle the model in `helpers/frame-model.ts`:
 * `bracketFrames` turns a recorded event time into the game-clock value the input
 * handler saw, and `framesSpanned` turns two event times into the **quantised**
 * game-clock duration of a gesture.
 *
 * The observer is installed with `addInitScript` (before the app boots) and is
 * purely additive: one array push per frame and one per event.
 */

import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { framesSpanned, medianFrameGap } from "./frame-model";

/** One recorded DOM input event (or a `probeMark` label), page-clock ordered. */
export interface ProbeEvent {
  /** `touchstart` · `touchmove` · `touchend` · `pointerup` · `keydown` · `mark` … */
  readonly kind: string;
  /** `performance.now()` at the moment the listener ran — the `rAF` clock. */
  readonly t: number;
  /** Page coordinates of the first changed touch / the pointer, else `null`. */
  readonly x: number | null;
  readonly y: number | null;
  /** `pointerType` for pointer events ("touch" / "mouse"), else `null`. */
  readonly pointerType: string | null;
  /** `KeyboardEvent.code` for key events, else `null`. */
  readonly code: string | null;
  /** Touch identifier of the first changed touch, else `null`. */
  readonly identifier: number | null;
  /** Active touch count on the event, else `null`. */
  readonly touches: number | null;
  /** `changedTouches.length` on a touch event, else `null`. */
  readonly changed: number | null;
  /** The label, for `kind === "mark"`. */
  readonly label: string | null;
}

/**
 * The **page-side** record shape — the mutable twin of {@link ProbeEvent}.
 *
 * Type-only, so it survives being referenced from inside the serialised
 * `addInitScript` bodies (annotations are erased before the function is stringified
 * and evaluated in the page).
 */
interface RecordedEvent {
  kind: string;
  t: number;
  x: number | null;
  y: number | null;
  pointerType: string | null;
  code: string | null;
  identifier: number | null;
  touches: number | null;
  changed: number | null;
  label: string | null;
}

export interface ProbeSnapshot {
  /** `performance.now()` when the snapshot was taken. */
  readonly now: number;
  /** Every `requestAnimationFrame` stamp the page produced (oldest first). */
  readonly frames: readonly number[];
  /** Every recorded event (oldest first). */
  readonly events: readonly ProbeEvent[];
}

/**
 * Install the observer. MUST be called before {@link import("./game").openLevel}
 * so the frame log starts with the page (a `?level=` fresh session navigates, and
 * `addInitScript` re-runs on every navigation of that page).
 *
 * No `src/**` change is involved: the observer is a test-side `window` listener.
 */
export async function installProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const MAX_FRAMES = 4000;
    const MAX_EVENTS = 800;

    // The page-side record shape is declared once at module scope
    // (`RecordedEvent`), so `probeMark` and `probeSnapshot` cannot drift from it.
    const holder = window as unknown as {
      __psProbe?: { frames: number[]; events: RecordedEvent[] };
    };
    if (holder.__psProbe !== undefined) return; // idempotent per document anyway

    const frames: number[] = [];
    const events: RecordedEvent[] = [];
    holder.__psProbe = { frames, events };

    const record = (event: RecordedEvent): void => {
      if (events.length >= MAX_EVENTS) events.shift();
      events.push(event);
    };

    // ── 1. the runner's own frame grid ───────────────────────────────────────
    const frameLoop = (timestamp: number): void => {
      frames.push(timestamp);
      if (frames.length > MAX_FRAMES) frames.shift();
      window.requestAnimationFrame(frameLoop);
    };
    window.requestAnimationFrame(frameLoop);

    // ── 2. every DOM input event, as delivered ───────────────────────────────
    const firstTouch = (
      list: TouchList | undefined,
    ): { x: number; y: number; identifier: number } | null => {
      const touch = list?.[0];
      if (touch === undefined) return null;
      return { x: touch.pageX, y: touch.pageY, identifier: touch.identifier };
    };

    const onTouch = (event: Event): void => {
      const touch = event as TouchEvent;
      const point = firstTouch(touch.changedTouches) ?? firstTouch(touch.touches);
      record({
        kind: touch.type,
        t: performance.now(),
        x: point?.x ?? null,
        y: point?.y ?? null,
        pointerType: "touch",
        code: null,
        identifier: point?.identifier ?? null,
        touches: touch.touches.length,
        changed: touch.changedTouches.length,
        label: null,
      });
    };

    const onPointer = (event: Event): void => {
      const pointer = event as PointerEvent;
      record({
        kind: pointer.type,
        t: performance.now(),
        x: pointer.pageX,
        y: pointer.pageY,
        pointerType: pointer.pointerType,
        code: null,
        identifier: pointer.pointerId,
        touches: null,
        changed: null,
        label: null,
      });
    };

    const onKey = (event: Event): void => {
      const key = event as KeyboardEvent;
      record({
        kind: key.type,
        t: performance.now(),
        x: null,
        y: null,
        pointerType: null,
        code: key.code,
        identifier: null,
        touches: null,
        changed: null,
        label: null,
      });
    };

    for (const kind of ["touchstart", "touchmove", "touchend", "touchcancel"]) {
      window.addEventListener(kind, onTouch, { capture: true, passive: true });
    }
    for (const kind of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
      window.addEventListener(kind, onPointer, { capture: true, passive: true });
    }
    for (const kind of ["keydown", "keyup"]) {
      window.addEventListener(kind, onKey, { capture: true, passive: true });
    }
  });
}

/** Record a labelled instant, so a later snapshot can be windowed from it. */
export async function probeMark(page: Page, label: string): Promise<void> {
  await page.evaluate((text: string) => {
    const holder = window as unknown as {
      __psProbe?: { events: RecordedEvent[] };
    };
    const probe = holder.__psProbe;
    if (probe === undefined) throw new Error("[probe] installProbe() was not called first");
    probe.events.push({
      kind: "mark",
      t: performance.now(),
      x: null,
      y: null,
      pointerType: null,
      code: null,
      identifier: null,
      touches: null,
      changed: null,
      label: text,
    });
  }, label);
}

/** Read the whole observer log. */
export async function probeSnapshot(page: Page): Promise<ProbeSnapshot> {
  return page.evaluate(() => {
    const holder = window as unknown as {
      __psProbe?: { frames: number[]; events: RecordedEvent[] };
    };
    const probe = holder.__psProbe;
    if (probe === undefined) throw new Error("[probe] installProbe() was not called first");
    return {
      now: performance.now(),
      frames: probe.frames.slice(),
      events: probe.events.slice(),
    };
  });
}

/** The events recorded after the last `probeMark(label)`, inclusive of the mark. */
export function eventsSince(
  snapshot: ProbeSnapshot,
  label: string,
): readonly ProbeEvent[] {
  let index = -1;
  snapshot.events.forEach((event, position) => {
    if (event.kind === "mark" && event.label === label) index = position;
  });
  return index < 0 ? snapshot.events : snapshot.events.slice(index + 1);
}

/** The recorded events of one kind (`touchstart`, `keydown`, …), oldest first. */
export function eventsOfKind(
  events: readonly ProbeEvent[],
  kind: string,
): readonly ProbeEvent[] {
  return events.filter((event) => event.kind === kind);
}

/**
 * A one-line-per-fact digest for a failure message or a CI log line: what was
 * delivered, in order, with coordinates — the thing a test must not assume.
 */
export function describeEvents(events: readonly ProbeEvent[]): string {
  return events
    .map((event) => {
      const at =
        event.x === null || event.y === null
          ? ""
          : `@(${event.x.toFixed(0)},${event.y.toFixed(0)})`;
      const extra =
        event.code ?? event.label ?? (event.touches === null ? "" : `touches=${String(event.touches)}`);
      return `${event.kind}${at}${extra === "" ? "" : `:${extra}`}`;
    })
    .join(" → ");
}

/* ───────────────────── the gesture delivery record (QA-005d) ─────────────── */

/**
 * What one synthetic touch gesture **actually did on the wire**, as the page saw
 * it: how many of each event arrived, in which order, at which coordinates, and
 * how many of the runner's own frames the whole gesture spanned.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * `mobile.mobile.spec.ts` R-T4 asks "a swipe ≥ 24 px within 500 ms of game time
 * is a MOVE on its dominant axis". Two things can make that claim fail, and they
 * are not the same thing:
 *
 * 1. the **game** treated the gesture as a tap (a rule observation), or
 * 2. the **driver** never delivered a usable gesture (0 events, or the wrong
 *    coordinates, or a burst so slow that the game clock quantised it past
 *    `LAYOUT.swipeMaxMs`) — a measurement failure wearing the rule's clothes.
 *
 * The cloud-only `Received: 0` was (2). So the spec asserts the delivery facts
 * *first*, from this record, and only then the rule: "the counter did not move"
 * can no longer be read as a rule pass when the gesture was never delivered, and
 * a delivery regression fails by name instead of masquerading as a rules change.
 */
export interface GestureEvidence {
  /** Every recorded event after the window's mark. */
  readonly events: readonly ProbeEvent[];
  /** Only the touch events, in delivery order. */
  readonly touches: readonly ProbeEvent[];
  /** The first `touchstart`, or `null` when the gesture never started. */
  readonly start: ProbeEvent | null;
  /** The last `touchend`, or `null` when the gesture never completed. */
  readonly end: ProbeEvent | null;
  readonly starts: number;
  readonly moves: number;
  readonly ends: number;
  /** Delivery order of the touch events, e.g. `start,move,end`. */
  readonly order: string;
  /** Frames the gesture spanned on the runner's grid (`-1` when incomplete). */
  readonly span: number;
  /** The runner's median frame interval over the recorded stamps, in ms. */
  readonly gridMs: number;
  /**
   * The gesture's **game-clock** duration, in ms — `span × gridMs`.
   *
   * This is the number `input-map.ts` compares against `LAYOUT.swipeMaxMs`: the
   * input handler reads `scene.time.now`, which only moves once per frame, so a
   * burst that takes 200 ms of wall clock but lands inside one frame window is a
   * zero-length gesture. `-1` when the gesture is incomplete.
   */
  readonly gameMs: number;
}

/** Collect the delivery record for the gesture recorded since `probeMark(label)`. */
export function gestureEvidence(snapshot: ProbeSnapshot, label: string): GestureEvidence {
  const events = eventsSince(snapshot, label);
  const touches = events.filter((event) => event.kind.startsWith("touch"));
  const start = touches.find((event) => event.kind === "touchstart") ?? null;
  const end = [...touches].reverse().find((event) => event.kind === "touchend") ?? null;
  const starts = touches.filter((event) => event.kind === "touchstart").length;
  const moves = touches.filter((event) => event.kind === "touchmove").length;
  const ends = touches.filter((event) => event.kind === "touchend").length;
  const gridMs = medianFrameGap(snapshot.frames);
  const span =
    start === null || end === null ? -1 : framesSpanned(snapshot.frames, start.t, end.t);
  return {
    events,
    touches,
    start,
    end,
    starts,
    moves,
    ends,
    order: touches.map((event) => event.kind.replace("touch", "")).join(","),
    span,
    gridMs,
    gameMs: span < 0 ? -1 : span * gridMs,
  };
}

/**
 * Assert the gesture was **delivered**: exactly one start, exactly one end, at
 * least one move carrying the travel, in gesture order, at the coordinates the
 * driver aimed at — and on a real frame grid.
 *
 * Coordinates are compared with a 1 CSS px tolerance: Chromium rounds a touch
 * point to whole page px (`from = (52.5, 283.5)` is delivered as `(53, 284)`), so
 * the claim is "the driver's aim, not a different cell". `want.from` / `want.to`
 * are page coordinates, i.e. exactly what the driver passed to
 * {@link import("./game").swipeTouch}.
 */
export function expectGestureDelivered(
  evidence: GestureEvidence,
  want: { readonly from: { readonly x: number; readonly y: number }; readonly to: { readonly x: number; readonly y: number } },
  label: string,
): void {
  const digest = describeEvents(evidence.touches);
  expect(evidence.gridMs, `${label}: the frame grid was recorded — the span below is measured, not assumed`).toBeGreaterThan(0);
  expect(evidence.starts, `${label}: exactly one touchstart — the gesture reached the page (${digest})`).toBe(1);
  expect(evidence.moves, `${label}: the travel arrived as a touchmove (${digest})`).toBeGreaterThan(0);
  expect(evidence.ends, `${label}: exactly one touchend — the gesture completed (${digest})`).toBe(1);
  expect(evidence.order, `${label}: delivered in gesture order — start, then move(s), then end (${digest})`).toMatch(
    /^start(?:,move)*,end$/,
  );

  const aimedAt = (event: ProbeEvent | null, wanted: { readonly x: number; readonly y: number }): boolean =>
    event !== null &&
    event.x !== null &&
    event.y !== null &&
    Math.abs(event.x - wanted.x) <= 1 &&
    Math.abs(event.y - wanted.y) <= 1;
  expect(
    aimedAt(evidence.start, want.from),
    `${label}: the touchstart landed where the driver aimed (${digest})`,
  ).toBe(true);
  expect(
    aimedAt(evidence.end, want.to),
    `${label}: the touchend landed where the driver aimed (${digest})`,
  ).toBe(true);
}