/**
 * e2e page object — HUD reads, trusted keyboard/touch input, board geometry and
 * the canvas pixel probe.
 *
 * Rules this file follows:
 *
 * - **DOM/HUD state first.** Every user-visible claim (moves, phase, dialog,
 *   button state) is read from the DOM the player actually sees. Pixels are only
 *   used where the DOM cannot answer (the player's *position* on the canvas).
 * - **No `src/**` change is needed for any assertion here.** The canvas probe
 *   forces `preserveDrawingBuffer` by wrapping `HTMLCanvasElement.prototype.getContext`
 *   in an `addInitScript` (test-side only): Phaser passes its context attributes
 *   through that call (`WebGLRenderer.js` → `canvas.getContext('webgl', config.contextCreation)`),
 *   so the wrapper can add the flag without touching the renderer. Without it a
 *   WebGL `drawImage`/`toDataURL` read-back is black — the finding recorded in
 *   `tests/e2e/README.md`.
 * - **Geometry is the production geometry.** `computeLayout` (the renderer's own
 *   `grid(x,y) → world(px,py)` module) is imported here, not re-derived, and the
 *   render scale is `min(devicePixelRatio, LAYOUT.maxRenderScale)` — the R-L6
 *   formula with the production constant. Cell centres are therefore *the* cell
 *   centres the game hit-tests against.
 * - **Colours are tokens.** The actor probe compares against
 *   `theme(phase).actor.body` / `.ring` — never a hex literal in the test — and,
 *   once the delivered A-03 pair is mounted (R-005a), against the **mounted
 *   texture's own centre pixel**, decoded from the file the page actually loaded.
 *   See {@link actorBodyAnchors}: the anchor set is a *union*, so the same probe
 *   is green in the art state and in the degraded (texture 404 / blocked) state.
 */

import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import type { Level } from "@/core/level";
import type { Direction } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import type { Vec } from "@/core/state/types";
import { sameVec } from "@/core/state/types";
import { computeLayout } from "@/game/renderer/grid-mapping";
import type { BoardLayout } from "@/game/renderer/grid-mapping";
import { PLACEHOLDER_SLOTS } from "@/game/theme/assets";
import { LAYOUT, theme } from "@/game/theme/tokens";

import { ARROW_KEY } from "./levels";

/* ────────────────────────────── readiness ───────────────────────────────── */

/** Wait for n animation frames — the game's own clock (`LevelScene.update`). */
export async function waitForFrames(page: Page, frames = 2): Promise<void> {
  await page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let left = count;
        const tick = (): void => {
          left -= 1;
          if (left <= 0) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    frames,
  );
}

/**
 * `?level=<n>` fresh session: storage cleared, shell mounted, board painted.
 *
 * The readiness sequence is: the `.ps-shell` (HUD constructor, synchronous), the
 * `<canvas>` (`new Phaser.Game`), then ≥ 3 frames — `LevelScene.create()` (which
 * attaches the keyboard/pointer input) runs on the first game step after the
 * canvas exists. Call {@link installPixelReadback} *before* this when the test
 * needs canvas pixels.
 */
export async function openLevel(page: Page, url: string): Promise<void> {
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      /* a blocked storage is still a fresh context — nothing to clear */
    }
  });
  // QA-007 negative-harness switch (opt-in, inert unless set). Playwright has no
  // config-level request hook, so "run the same 88 tests with the delivered art
  // unreachable" is a page-level route — the dossier's own degrade mechanism.
  // Every `*.png` the loader asks for is aborted, so `theme/art.ts` mounts nothing,
  // every painter falls back to its vector placeholder and the probe anchors are the
  // placeholder tokens. It is never set on a normal run, so it cannot mask a
  // delivered-art regression: the art round is the one without it.
  if (process.env["PS_E2E_ART_DEGRADE"] === "1") {
    await page.route("**/*.png", (route) => route.abort());
  }
  await page.goto(url);
  await expect(page.locator(".ps-shell")).toBeVisible();
  await expect(page.locator("#app canvas")).toBeAttached();
  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas");
    return canvas !== null && canvas.width > 0 && canvas.height > 0;
  });
  await waitForFrames(page, 3);
}

/** Let a flip (≤ 220 ms, §6.1) and its DOM transitions resolve. */
export async function settle(page: Page, ms = 320): Promise<void> {
  await page.waitForTimeout(ms);
  await waitForFrames(page, 2);
}

/* ─────────────────────────── error channels ─────────────────────────────── */

/**
 * The two "the page is unhappy" channels, collected per page from the moment the
 * watch is installed: `console.error` lines and uncaught exceptions
 * (`pageerror`). Both lists are **live** (append-only) — assert them after the
 * walk you care about, with {@link expectNoPageErrors}.
 *
 * Only `error`-level console output is collected: Phaser logs `info`/`warn` on a
 * normal boot, and treating those as failures would make the probe unusable.
 */
export interface PageErrorWatch {
  /** `console.error` texts seen so far, in order. */
  readonly consoleErrors: readonly string[];
  /** Uncaught page exception messages seen so far, in order. */
  readonly pageErrors: readonly string[];
}

export function watchErrors(page: Page): PageErrorWatch {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  return { consoleErrors, pageErrors };
}

/** Assert both channels stayed empty, with the label that says which walk this was. */
export function expectNoPageErrors(watch: PageErrorWatch, label: string): void {
  expect(watch.consoleErrors, `${label}: console.error lines`).toEqual([]);
  expect(watch.pageErrors, `${label}: uncaught page errors`).toEqual([]);
}

/* ────────────────────────────── HUD reads ───────────────────────────────── */

export interface HudState {
  readonly levelLabel: string;
  readonly movesText: string;
  readonly moves: number;
  /** `.ps-shell[data-phase]` — `"A"` | `"B"`. */
  readonly phase: string;
  /** `.ps-glyph[data-glyph]` — the non-colour phase channel (R-C1). */
  readonly glyph: string;
  /** `.ps-chip` accessible name — `白昼 / Light` | `夜晚 / Shadow` (§7.4). */
  readonly phaseLabel: string;
  /** The `aria-live` region's text (§7.4). */
  readonly live: string;
  readonly won: boolean;
  readonly dialogTitle: string;
  readonly dialogBody: string;
  readonly nextVisible: boolean;
  readonly undoDisabled: boolean;
  readonly restartDisabled: boolean;
}

/** Everything the HUD exposes, read in one round trip. */
export async function hud(page: Page): Promise<HudState> {
  const raw = await page.evaluate(() => {
    const q = (selector: string): Element | null => document.querySelector(selector);
    const text = (selector: string): string => q(selector)?.textContent?.trim() ?? "";
    const shell = q(".ps-shell");
    const chip = q(".ps-chip");
    const overlay = q(".ps-overlay");
    const next = q(".ps-dialog-actions .ps-btn-primary");
    const undo = q('button[aria-label="Undo"]');
    const restart = q('button[aria-label="Restart"]');
    const overlayVisible = overlay !== null && !overlay.hasAttribute("hidden");
    return {
      levelLabel: text(".ps-level"),
      movesText: text(".ps-moves"),
      phase: shell?.getAttribute("data-phase") ?? "",
      glyph: q(".ps-glyph")?.getAttribute("data-glyph") ?? "",
      phaseLabel: chip?.getAttribute("aria-label") ?? "",
      live: text(".ps-top .ps-sr[role='status']"),
      won: overlayVisible,
      dialogTitle: overlayVisible ? text(".ps-dialog-title") : "",
      dialogBody: overlayVisible ? text(".ps-dialog-body") : "",
      nextVisible: next !== null && !next.hasAttribute("hidden"),
      undoDisabled: undo instanceof HTMLButtonElement ? undo.disabled : true,
      restartDisabled: restart instanceof HTMLButtonElement ? restart.disabled : true,
    };
  });

  const moves = /(\d+)/.exec(raw.movesText);
  return {
    levelLabel: raw.levelLabel,
    movesText: raw.movesText,
    moves: moves ? Number(moves[1]) : Number.NaN,
    phase: raw.phase,
    glyph: raw.glyph,
    phaseLabel: raw.phaseLabel,
    live: raw.live,
    won: raw.won,
    dialogTitle: raw.dialogTitle,
    dialogBody: raw.dialogBody,
    nextVisible: raw.nextVisible,
    undoDisabled: raw.undoDisabled,
    restartDisabled: raw.restartDisabled,
  };
}

/** The token map's own label for a phase — never a literal in a test. */
export function phaseLabelOf(phase: Phase): string {
  return theme(phase).hud.phaseLabel;
}

export function phaseGlyphOf(phase: Phase): string {
  return theme(phase).hud.phaseGlyph;
}

/**
 * The HUD's `data-phase` as the core's `Phase` — the same narrowing `actorCell`
 * uses. The shell only ever writes `"A"` / `"B"`, so anything else is phase A.
 */
export function phaseOf(state: HudState): Phase {
  return state.phase === "B" ? "B" : "A";
}

/**
 * How long {@link expectMoves} waits for a gesture to commit (ms).
 *
 * A pointer gesture is delivered as DOM events and consumed by the game's own
 * input update on a later animation frame, so "the HUD has not ticked yet" is
 * not the same claim as "the gesture was a non-input". The window is ~6 frames on
 * a 60 Hz machine and covers a CI runner rendering ~4× slower; it is not a sleep —
 * the first poll that sees the counter returns immediately.
 */
export const HUD_COMMIT_TIMEOUT_MS = 2_000;

/**
 * Assert the HUD's move counter reaches `expected`, polling within a bounded
 * window instead of reading once after a fixed sleep.
 *
 * Used after a **gesture** (tap/swipe), whose commit lands on the game's next
 * input update: a single read at a fixed offset is a race on a loaded runner,
 * while the claim itself ("this gesture is exactly one move") is unchanged — the
 * counter must still reach `expected` or the test fails with the last value.
 */
export async function expectMoves(
  page: Page,
  expected: number,
  timeoutMs: number = HUD_COMMIT_TIMEOUT_MS,
): Promise<void> {
  await expect
    .poll(async () => (await hud(page)).moves, {
      timeout: timeoutMs,
      message: `the HUD move counter should reach ${String(expected)} once the gesture commits`,
    })
    .toBe(expected);
}

/* ─────────────────────────────── input ──────────────────────────────────── */

/**
 * Press one arrow key (`input-map.ts` §7.4 keyboard mapping).
 *
 * **Paced to one press per rendered frame.** Phaser drains its keyboard queue in
 * `KeyboardManager.postUpdate`, which is bound to the game's `POST_RENDER` event,
 * while `KeyboardPlugin.update` runs synchronously on every DOM key event and
 * re-walks the *whole* queue from index 0. Its duplicate guard remembers exactly
 * one event (code + timeStamp + type), so any two *other* events arriving between
 * two `POST_RENDER`s make an already-handled keydown fire a second time.
 *
 * That is a real (if rare) input-replay defect and it is pinned as a failing test
 * in `tests/e2e/input-replay.spec.ts` — it is **not** silently worked around. But
 * a rule-level assertion must measure the game's rules, not a frame-boundary
 * artifact, so this helper waits two frames after each press: every keydown lands
 * in its own frame window and is processed exactly once. One press per frame is
 * still ~10× faster than a human; the pacing costs ~35 ms per key.
 */
export async function pressDirection(page: Page, direction: Direction): Promise<void> {
  await page.keyboard.press(ARROW_KEY[direction]);
  await waitForFrames(page, 2);
}

/** Press a whole route, in order, with no artificial delay (0 ms input lock). */
export async function pressRoute(page: Page, route: readonly Direction[]): Promise<void> {
  for (const direction of route) await pressDirection(page, direction);
}

/** `Z` — undo (`§7.4`). */
export async function pressUndoKey(page: Page): Promise<void> {
  await page.keyboard.press("KeyZ");
}

/** `R` — restart (`§7.4`). */
export async function pressRestartKey(page: Page): Promise<void> {
  await page.keyboard.press("KeyR");
}

/** A CDP session for this page — cached, never detached mid-run. */
type CdpSession = Awaited<ReturnType<ReturnType<Page["context"]>["newCDPSession"]>>;
const touchSessions = new WeakMap<Page, CdpSession>();

/**
 * One CDP session per page, reused by every touch gesture.
 *
 * Previously each gesture created a session and detached it immediately after
 * `touchEnd`. Both halves are round trips, and tearing a session down inside the
 * gesture's own frame window is exactly the kind of input-lifecycle churn that
 * can leave Chromium's touch state sticky on a loaded runner — the next
 * `touchStart` is then dropped and the gesture becomes a no-op
 * (`mobile.mobile.spec.ts` R-T4, `Received: 0`, cloud-only). A session per page
 * removes that variable; it dies with the page at the end of the test.
 */
async function touchSession(page: Page): Promise<CdpSession> {
  const existing = touchSessions.get(page);
  if (existing !== undefined) return existing;
  const client = await page.context().newCDPSession(page);
  touchSessions.set(page, client);
  return client;
}

/**
 * A real touch swipe via CDP (`Input.dispatchTouchEvent`) — the only way to get
 * Phaser's `pointer.wasTouch === true`, which R-T6 requires and which a synthetic
 * `pointerdown` cannot fake. Chromium-only, which is what this suite runs on.
 *
 * ── Why the whole gesture goes out in ONE tick (QA-005d root cause) ──────────
 * The sends used to be awaited one after another (start, four interpolated moves,
 * end), and **every `Input.dispatchTouchEvent` acknowledgement is gated by the
 * renderer's next animation frame**. On a 60 Hz machine that is invisible: the
 * six-send burst spanned ~13 frames ≈ 217 ms of game time, well inside R-T4's
 * `LAYOUT.swipeMaxMs = 500`. On the CI runner the same burst spans the runner's
 * own, far coarser grid — and the *game clock is quantised to that grid*:
 * `attachInput`'s `onPointerUp` computes `elapsed = scene.time.now - start.time`
 * and `Clock.update` only moves `scene.time.now` once per frame, so a burst's
 * game-clock duration is `frames_spanned × grid`, never its wall-clock span.
 *
 * Measured with the in-page observer (`helpers/probe.ts`), the shipped helper at
 * three fabricated grids:
 *
 * | grid | six awaiting sends | game-clock elapsed | R-T4 verdict |
 * |---|---|---|---|
 * | 16.7 ms (local 60 Hz) | 13 frames | 217 ms | swipe ✓ |
 * | 66.7 ms | 15 frames | 1001 ms | over 500 → **tap** |
 * | 133.3 ms | 15 frames | 1999 ms | over 500 → **tap** |
 *
 * Over the limit the gesture falls to the tap branch, the 36 px travel ends
 * inside the player's own cell (36 CSS px = exactly half of L3's 72 CSS px cell),
 * `adjacentDirection(player, player)` is `null` and nothing happens — the cloud
 * `Received: 0`. That is a failure of the *driver's* pacing, not of the game's
 * rule, so it is fixed here, on the driver's side, and `src/**` is untouched.
 *
 * All three events are therefore issued in the same tick (`Promise.all`, in
 * array order, so the wire order is the gesture order): the burst costs **zero
 * game frames at any grid**, so `elapsed ≈ 0` on every runner. Measured span with
 * this shape: **0 frames / 0 ms at 16.7, 66.7 and 133.3 ms grids, 12/12 runs**.
 *
 * The four interpolated `touchMove`s went with the `await`s that made them
 * necessary: `onPointerUp` reads the pointer's *final* position only, so one move
 * is the whole gesture. Nothing is assumed about delivery — the caller asserts
 * counts, order and coordinates from the observer record
 * ({@link import("./probe").expectGestureDelivered}) before it claims a move.
 *
 * After `touchEnd` the helper waits one animation frame so the game's input
 * update has **consumed** the sequence before the caller reads the HUD.
 */
export async function swipeTouch(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  const client = await touchSession(page);
  await Promise.all([
    client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: from.x, y: from.y }],
    }),
    client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: to.x, y: to.y }],
    }),
    client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }),
  ]);
  await waitForFrames(page, 1);
}

/** Tap a page coordinate with real touch input. */
export async function tapTouch(page: Page, at: { x: number; y: number }): Promise<void> {
  await page.touchscreen.tap(at.x, at.y);
}

/* ──────────────────────── geometry (production) ─────────────────────────── */

export interface BoardGeometry {
  /** The renderer's layout, in device px — the same object `BoardView` draws from. */
  readonly layout: BoardLayout;
  /** The canvas CSS box. */
  readonly canvas: { x: number; y: number; width: number; height: number };
  readonly renderScale: number;
  /** Cell centre in canvas **device** px (what `cellAtPoint` consumes). */
  cellCenterDevice(x: number, y: number): { x: number; y: number };
  /** Cell centre in page **CSS** px (what a tap/swipe needs). */
  cellCenterPage(x: number, y: number): { x: number; y: number };
}

/**
 * The board geometry for `level`, in both coordinate systems the game uses.
 *
 * The canvas backing store *is* the viewport (`main.ts` sets `scale.width/height`
 * from `measure()`), so the device viewport is read from the canvas itself and
 * `computeLayout` reproduces exactly what the renderer did.
 */
export async function boardGeometry(page: Page, level: Level): Promise<BoardGeometry> {
  const box = await page.locator("#app canvas").boundingBox();
  if (box === null) throw new Error("[e2e] canvas has no box — the board is not mounted");
  const device = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas === null) throw new Error("no canvas");
    return { w: canvas.width, h: canvas.height, dpr: window.devicePixelRatio || 1 };
  });
  const renderScale = Math.min(device.dpr, LAYOUT.maxRenderScale);
  const layout = computeLayout(level, {
    width: device.w,
    height: device.h,
    renderScale,
  });
  const centre = (x: number, y: number): { x: number; y: number } => ({
    x: layout.grid.x + x * layout.cellSize + layout.cellSize / 2,
    y: layout.grid.y + y * layout.cellSize + layout.cellSize / 2,
  });
  return {
    layout,
    canvas: { x: box.x, y: box.y, width: box.width, height: box.height },
    renderScale,
    cellCenterDevice: centre,
    cellCenterPage: (x, y) => {
      const d = centre(x, y);
      return { x: box.x + d.x / renderScale, y: box.y + d.y / renderScale };
    },
  };
}

/* ─────────────────────── canvas pixel probe (test-side) ─────────────────── */

/**
 * Force `preserveDrawingBuffer: true` on the Phaser WebGL context from the test.
 *
 * MUST be installed before {@link openLevel} (`addInitScript`). Test-side only:
 * `src/**` is untouched, and nothing the player sees changes — the flag only
 * keeps the drawing buffer readable after compositing.
 */
export async function installPixelReadback(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      if (
        contextId === "webgl" ||
        contextId === "webgl2" ||
        contextId === "experimental-webgl"
      ) {
        const forced = Object.assign({}, options, { preserveDrawingBuffer: true });
        return original.call(this, contextId, forced);
      }
      return original.call(this, contextId, options);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

export type Rgb = readonly [number, number, number];

/** Sample the presented canvas at device-px points, in one round trip. */
export async function sampleCanvas(
  page: Page,
  points: readonly { x: number; y: number }[],
): Promise<Rgb[]> {
  return page.evaluate((input: ReadonlyArray<{ x: number; y: number }>) => {
    const canvas = document.querySelector("canvas");
    if (canvas === null) throw new Error("no canvas to sample");
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext("2d", { willReadFrequently: true });
    if (ctx === null) throw new Error("no 2d context to read back through");
    ctx.drawImage(canvas, 0, 0);
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
    return input.map((point) => {
      const x = Math.min(copy.width - 1, Math.max(0, Math.round(point.x)));
      const y = Math.min(copy.height - 1, Math.max(0, Math.round(point.y)));
      const i = (y * copy.width + x) * 4;
      return [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0];
    });
  }, points as ReadonlyArray<{ x: number; y: number }>);
}

/** Parse a `#rrggbb` token into the sample type — for tests that must name an ink. */
export function hexToRgb(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

/** Max per-channel distance — the two colours are "the same pixel" under this. */
export function rgbDistance(a: Rgb, b: Rgb): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

/* ─────────────── actor body anchors (R-005a art-aware pixel probe) ─────────── */

/**
 * One colour the player's body can legitimately be drawn with, this phase.
 *
 * Two sources, one per branch of `renderer/board-view.ts`'s `paintActor`:
 *
 * - `"vector"` — `theme(phase).actor.body`, the DEV PLACEHOLDER disc A-03 that
 *   still paints whenever the delivered texture is not mounted (R-P2's fallback);
 * - `"art"` — the **centre pixel of the mounted A-03 file**, decoded from the very
 *   bytes the page's loader received ({@link actorBodyAnchors}).
 *
 * The decode is what makes the probe art-aware without a hex literal and without
 * asking the page which branch it took: `paintActor` draws the sprite centred on
 * the cell, so its own centre pixel is exactly what lands on the cell centre.
 */
export interface ActorBodyAnchor {
  readonly rgb: Rgb;
  /** Per-channel tolerance for this anchor (the sprite composites at alpha 253). */
  readonly tolerance: number;
  /** Human-readable provenance, for failure messages. */
  readonly source: string;
}

/**
 * Decode the centre pixel of one delivered spirit PNG, from the page's own
 * resource log — or `null` when that file never arrived (a 404, a blocked request,
 * an offline boot: the degraded state `theme/art.ts` is built around).
 *
 * The URL is **not** written here: it is read out of
 * `performance.getEntriesByType("resource")` by matching the manifest name from
 * `theme/assets.ts`, so the probe follows whatever `?url` import the build emitted
 * (hashed or not) and simply finds nothing in a degrade round. The file is fetched
 * and decoded in-page (`createImageBitmap`), which is the same bytes Phaser's
 * loader used.
 */
const spriteCentres = new WeakMap<Page, Map<Phase, Promise<Rgb | null>>>();

async function decodeSpiritCentre(page: Page, phase: Phase): Promise<Rgb | null> {
  let perPage = spriteCentres.get(page);
  if (perPage === undefined) {
    perPage = new Map<Phase, Promise<Rgb | null>>();
    spriteCentres.set(page, perPage);
  }
  const cached = perPage.get(phase);
  if (cached !== undefined) return cached;

  // The A-03 pair is two manifest rows, one Asset ID; the phase picks the row by
  // the manifest name's own suffix (`echo_spirit_a` / `_b`), never a typed path.
  const slot = PLACEHOLDER_SLOTS.find(
    (entry) => entry.assetId === "A-03" && entry.assetName.endsWith(phase.toLowerCase()),
  );
  const pending = page.evaluate(async (assetName: string | null): Promise<Rgb | null> => {
    if (assetName === null) return null;
    const url = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .find((name) => name.endsWith(`/${assetName}.png`));
    if (url === undefined) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const bitmap = await createImageBitmap(await response.blob());
      const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = offscreen.getContext("2d");
      if (ctx === null) return null;
      ctx.drawImage(bitmap, 0, 0);
      const data = ctx.getImageData(bitmap.width >> 1, bitmap.height >> 1, 1, 1).data;
      return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0];
    } catch {
      return null;
    }
  }, slot?.assetName ?? null);
  perPage.set(phase, pending);
  return pending;
}

/**
 * Every colour the player's body may carry in `phase`, **as a set** — the vector
 * token plus, when the delivered sprite is reachable, the sprite's own centre
 * pixel. Union, not a branch on mount state: the two are mutually exclusive on the
 * canvas (`paintActor` draws exactly one of them), so union-ing them keeps the
 * "exactly one cell matches" verdict in both states and cannot rot when R-005b
 * changes the manifest. Mock-free and layout-free.
 */
export async function actorBodyAnchors(page: Page, phase: Phase): Promise<readonly ActorBodyAnchor[]> {
  const token = theme(phase).actor.body;
  const anchors: ActorBodyAnchor[] = [
    { rgb: hexToRgb(token), tolerance: 2, source: `vector body ${token}` },
  ];
  const sprite = await decodeSpiritCentre(page, phase);
  if (sprite !== null) {
    anchors.push({
      rgb: sprite,
      tolerance: 3,
      source: `delivered spirit centre rgb(${sprite.join(",")})`,
    });
  }
  return anchors;
}

/** `true` when `sample` is the body ink under **any** of `anchors`. */
export function isActorBody(sample: Rgb | undefined, anchors: readonly ActorBodyAnchor[]): boolean {
  if (sample === undefined) return false;
  return anchors.some((anchor) => rgbDistance(sample, anchor.rgb) <= anchor.tolerance);
}

/* ─────────────────── one ink on one scanline — run census ────────────────── */

export interface TokenRunCensus {
  /** Longest contiguous stretch of samples equal to `token` (within `tolerance`). */
  readonly longest: number;
  /** Every run length seen, longest first — the shape of the row, for messages. */
  readonly runs: readonly number[];
  /** The token the row was searched for, and the tolerance used. */
  readonly token: Rgb;
  readonly tolerance: number;
  /** Every sampled pixel on the centre row, in scan order. */
  readonly samples: readonly Rgb[];
}

/**
 * Count the contiguous runs of one ink on a tile's centre row: "how much of this
 * row is *this* colour, in unbroken stretches".
 *
 * Used for the R-C7 occlusion claim, where the interesting quantity is not "does
 * the switch token appear" but "can a stroke of it be **read**": a visible 2 px
 * outline puts an unbroken stretch of at least its own stroke width on the row,
 * whereas a single coincidental pixel of a delivered sprite is a run of one. The
 * caller supplies the token (a phase's `obj.switch`) and the floor it takes from
 * the production geometry (`switchParts(...).strokeWidth`), so the threshold is
 * never a magic number.
 */
export async function centreRowTokenRuns(
  page: Page,
  geometry: BoardGeometry,
  tile: Vec,
  token: Rgb,
  tolerance = 2,
): Promise<TokenRunCensus> {
  const cell = geometry.layout.cellSize;
  const centre = geometry.cellCenterDevice(tile.x, tile.y);
  const half = Math.ceil(cell / 2);
  const offsets: number[] = [];
  for (let dx = -half; dx <= half; dx += 1) offsets.push(dx);
  const samples = await sampleCanvas(
    page,
    offsets.map((dx) => ({ x: centre.x + dx, y: centre.y })),
  );
  const runs: number[] = [];
  let current = 0;
  for (const sample of samples) {
    if (rgbDistance(sample, token) <= tolerance) {
      current += 1;
    } else {
      if (current > 0) runs.push(current);
      current = 0;
    }
  }
  if (current > 0) runs.push(current);
  runs.sort((a, b) => b - a);
  return {
    longest: runs[0] ?? 0,
    runs,
    token,
    tolerance,
    samples,
  };
}

/* ──────────────────── scanline ink run (art-agnostic probe) ──────────────── */

/** Where the background references are sampled, as a fraction of the cell. */
export const INK_REFERENCE_FRACTION = 0.4;
/** How far a sample must sit from **every** reference to count as ink. */
export const INK_THRESHOLD = 8;

export interface InkRun {
  /** Longest contiguous run of ink samples. */
  readonly longest: number;
  /** First / last index of that run (inclusive), for failure messages. */
  readonly from: number;
  readonly to: number;
  /** Index of the tile's own centre sample (the actor is drawn centred). */
  readonly centreIndex: number;
  /** `true` when the longest run straddles {@link centreIndex} — the ink is *the actor*, not a tile edge. */
  readonly coversCentre: boolean;
  /** `longest / samples.length` — how much of the scanline the ink owns. */
  readonly coverage: number;
  /** Every sampled pixel on the centre row, in scan order. */
  readonly samples: readonly Rgb[];
  /** The background references this runner actually used. */
  readonly references: readonly Rgb[];
}

/**
 * Measure the **ink run** across one cell's centre row: the longest contiguous
 * stretch of samples that differ from the cell's own background.
 *
 * ── Why not compare against a body token (R-005a) ────────────────────────────
 * The transient probes were written against `theme(phase).actor.body`, which is
 * the **placeholder** colour. Once the delivered A-03 sprite is mounted the body
 * is art and no token describes it, so a token comparison measures "did the
 * placeholder paint" rather than "is the actor covering the box". The background
 * reference is taken at ±{@link INK_REFERENCE_FRACTION} of a cell — outside the
 * actor disc in both branches (placeholder r ≈ 45 px, art r ≈ 40 px on a 128 px
 * cell) and inside the tile, so it reads the tile's own ground / door / wall ink
 * rather than a neighbour's. Ink is then a *differential* claim: "this pixel is
 * not the tile's background", which holds for the vector disc and for the sprite
 * alike.
 *
 * The claim it feeds is strictly stronger than a colour match: the caller can ask
 * whether the actor's ink *contains* the switch box (radius comparison) and what
 * fraction of the scanline it owns (coverage) — neither of which needs the body's
 * colour at all.
 *
 * Throws when no reference pixel is readable: a dead read-back channel must fail
 * loudly, never report "no ink".
 */
export async function centreRowInk(
  page: Page,
  geometry: BoardGeometry,
  tile: Vec,
): Promise<InkRun> {
  const cell = geometry.layout.cellSize;
  const centre = geometry.cellCenterDevice(tile.x, tile.y);
  const half = Math.ceil(cell / 2);
  const offsets: number[] = [];
  for (let dx = -half; dx <= half; dx += 1) offsets.push(dx);
  const centreIndex = half;
  const samples = await sampleCanvas(
    page,
    offsets.map((dx) => ({ x: centre.x + dx, y: centre.y })),
  );
  const referenceOffset = Math.round(cell * INK_REFERENCE_FRACTION);
  const raw = await sampleCanvas(page, [
    { x: centre.x + referenceOffset, y: centre.y },
    { x: centre.x - referenceOffset, y: centre.y },
  ]);
  const references = raw.filter((sample): sample is Rgb => sample !== undefined);
  if (references.length === 0) {
    throw new Error("[e2e] no background reference readable on the centre row");
  }
  const isInk = (sample: Rgb | undefined): boolean =>
    sample !== undefined &&
    references.every((reference) => rgbDistance(sample, reference) > INK_THRESHOLD);
  let longest = 0;
  let from = 0;
  let runStart = 0;
  let current = 0;
  samples.forEach((sample, index) => {
    if (isInk(sample)) {
      if (current === 0) runStart = index;
      current += 1;
      if (current > longest) {
        longest = current;
        from = runStart;
      }
    } else {
      current = 0;
    }
  });
  return {
    longest,
    from,
    to: longest === 0 ? from - 1 : from + longest - 1,
    centreIndex,
    coversCentre: longest > 0 && from <= centreIndex && centreIndex <= from + longest - 1,
    coverage: samples.length === 0 ? 0 : longest / samples.length,
    samples,
    references,
  };
}

/**
 * Read back the canvas through `drawImage` and report how many distinct colours
 * the board has. `<= 1` means the read-back channel is dead (all black) — the
 * probe must fail loudly instead of reporting "the actor is nowhere".
 */
export async function canvasColourHealth(page: Page): Promise<{ distinct: number; nonBlack: number }> {
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (canvas === null) throw new Error("no canvas");
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext("2d", { willReadFrequently: true });
    if (ctx === null) throw new Error("no 2d context");
    ctx.drawImage(canvas, 0, 0);
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
    const seen = new Set<string>();
    let nonBlack = 0;
    for (let i = 0; i < data.length; i += 4 * 613) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      seen.add(`${String(r)},${String(g)},${String(b)}`);
      if (r !== 0 || g !== 0 || b !== 0) nonBlack += 1;
    }
    return { distinct: seen.size, nonBlack };
  });
}

export interface ActorProbe {
  /** Every tile whose centre pixel matches the actor body token — `[]` or one cell. */
  readonly cells: Vec[];
  /** The single cell, or `null` when the actor was not found / found twice. */
  readonly cell: Vec | null;
  /** The sampled colour per cell centre, for failure messages. */
  readonly samples: readonly Rgb[];
}

/**
 * Find the player's tile **from the pixels**: the cell whose centre is the actor
 * body in the current phase.
 *
 * This is the one claim the DOM cannot answer (the HUD owns no board state,
 * `hud.ts` §7.2), so it is read from the rendered board — against an **absolute**
 * anchor set ({@link actorBodyAnchors}), never a relative "it changed"
 * comparison.
 *
 * ── Why the anchor is a set (R-005a) ─────────────────────────────────────────
 * `paintActor` draws either the delivered A-03 sprite or the vector placeholder,
 * and the sprite's own colours are art, not tokens. Comparing the cell centre
 * against `theme(phase).actor.body` alone was the failure mode of all 56 rows in
 * the R-005a roster: in the art state the centre is the sprite's centre pixel, so
 * the token comparison found `[]` on a perfectly healthy board. The union anchor
 * answers "is this cell the player" in both mount states without asking the page
 * which branch it took — and, because the two branches are mutually exclusive on
 * the canvas, the "exactly one cell matches" verdict is unchanged.
 *
 * The census is still **the whole board**: every cell centre is sampled and every
 * anchor is tested at every cell, so a second body-coloured tile is still a
 * two-match failure, not a silent first-hit.
 */
export async function actorCell(page: Page, geometry: BoardGeometry, level: Level): Promise<ActorProbe> {
  const shellPhase = await page.locator(".ps-shell").getAttribute("data-phase");
  const phase: Phase = shellPhase === "B" ? "B" : "A";
  const anchors = await actorBodyAnchors(page, phase);
  const cells: Vec[] = [];
  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) cells.push({ x, y });
  }
  const points = cells.map((cell) => geometry.cellCenterDevice(cell.x, cell.y));
  const samples = await sampleCanvas(page, points);
  const matches: Vec[] = [];
  cells.forEach((cell, index) => {
    if (isActorBody(samples[index], anchors)) matches.push(cell);
  });
  return {
    cells: matches,
    cell: matches.length === 1 ? (matches[0] ?? null) : null,
    samples,
  };
}

/** The anchor provenance, for a failure message — never a hex literal in the test. */
function describeAnchors(anchors: readonly ActorBodyAnchor[]): string {
  return anchors.map((anchor) => `${anchor.source} (±${String(anchor.tolerance)})`).join(" | ");
}

/**
 * How long {@link expectActorAt} waits for a move's animation to settle.
 *
 * §6.1's `hop` is 130 ms and the §6.5 deny nudge 90 ms; a 2 s window is ~15× the
 * longest of them, which covers a CI runner rendering ~4× slower
 * (project-status item 57) without ever being reached on a healthy local run.
 */
export const ACTOR_SETTLE_TIMEOUT_MS = 2_000;

/** `true` when the probe read exactly `expected` — the only settled verdict. */
function settledAt(probe: ActorProbe, expected: Vec): boolean {
  const cell = probe.cells[0];
  return probe.cells.length === 1 && cell !== undefined && sameVec(cell, expected);
}

/**
 * Assert the player stands on `expected`, **waiting bounded for the move to
 * settle** and failing honestly if it never does.
 *
 * ── Why this polls (root cause of the QA-005c flake) ─────────────────────────
 * {@link actorCell} reads the player's tile from **one** presented frame at
 * **one** instant. A legal move is not instant: §6.1's `hop` tween carries the
 * disc from the old cell centre to the new one over 130 ms, and between the two
 * centres the body covers **neither** centre — so the probe reports `cells: []`
 * for the first frames after a press even though the move is perfectly legal.
 * The refused case is the same shape: the §6.5 deny nudge moves the body off its
 * centre for 90 ms.
 *
 * Measured on this suite (QA-005c, desktop L1, frame-by-frame after a press):
 * `cells: []` at frame 0, `[1,1]` from frame 1 — and on the mobile profile the
 * empty window is frames 0–3. `pressDirection` only waits two frames, so an
 * assertion issued straight after it could land inside that window. That is the
 * observed failure: `latch-door.spec.ts` (L6/L10) and `refusal.spec.ts` (L3),
 * `found []` at a mid-hop instant — a measurement artifact, never a rule
 * failure.
 *
 * ── What the poll does NOT do (the claim is not weakened) ────────────────────
 * - It succeeds only when **exactly one** cell matches **and it is `expected`**;
 *   `[]` (mid-flight), `[oldCell]` (still overlapping the start) and two matches
 *   all keep polling and all fail if they persist.
 * - The window is **bounded** ({@link ACTOR_SETTLE_TIMEOUT_MS}) and the failure
 *   message carries the last probe's cells and the elapsed time, so a genuine
 *   wrong-position bug still fails — it just fails after the bound instead of
 *   instantly.
 * - It is **event-driven, not a sleep**: the settled case costs one probe and
 *   adds no wall-clock padding, so a real timing regression cannot hide behind it.
 */
export async function expectActorAt(
  page: Page,
  geometry: BoardGeometry,
  level: Level,
  expected: Vec,
  timeoutMs: number = ACTOR_SETTLE_TIMEOUT_MS,
): Promise<void> {
  const startedAt = Date.now();
  let probe = await actorCell(page, geometry, level);
  let shellPhase = await page.locator(".ps-shell").getAttribute("data-phase");
  while (!settledAt(probe, expected) && Date.now() - startedAt < timeoutMs) {
    await waitForFrames(page, 1);
    probe = await actorCell(page, geometry, level);
    shellPhase = await page.locator(".ps-shell").getAttribute("data-phase");
  }
  const phase: Phase = shellPhase === "B" ? "B" : "A";
  const anchors = await actorBodyAnchors(page, phase);
  expect(
    probe.cell,
    `actor tile should be (${String(expected.x)},${String(expected.y)}) in phase ${String(shellPhase)}; ` +
      `found ${JSON.stringify(probe.cells)} after ${String(Date.now() - startedAt)} ms; ` +
      `body anchors: ${describeAnchors(anchors)}`,
  ).toEqual(expected);
}