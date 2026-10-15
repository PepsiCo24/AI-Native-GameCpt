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
 *   `theme(phase).actor.body` / `.ring` — never a hex literal in the test.
 */

import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import type { Level } from "@/core/level";
import type { Direction } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import type { Vec } from "@/core/state/types";
import { computeLayout } from "@/game/renderer/grid-mapping";
import type { BoardLayout } from "@/game/renderer/grid-mapping";
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

/**
 * A real touch swipe via CDP (`Input.dispatchTouchEvent`) — the only way to get
 * Phaser's `pointer.wasTouch === true`, which R-T6 requires and which a synthetic
 * `pointerdown` cannot fake. Chromium-only, which is what this suite runs on.
 */
export async function swipeTouch(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  const point = (p: { x: number; y: number }): Array<{ x: number; y: number }> => [
    { x: p.x, y: p.y },
  ];
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: point(from),
  });
  const steps = 4;
  for (let i = 1; i <= steps; i += 1) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: point({
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
      }),
    });
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await client.detach();
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

function hexToRgb(hex: string): Rgb {
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
 * body token for the current phase.
 *
 * This is the one claim the DOM cannot answer (the HUD owns no board state,
 * `hud.ts` §7.2), so it is read from the rendered board — an absolute anchor
 * (`theme(phase).actor.body`), not a relative "it changed" comparison.
 */
export async function actorCell(page: Page, geometry: BoardGeometry, level: Level): Promise<ActorProbe> {
  const shellPhase = await page.locator(".ps-shell").getAttribute("data-phase");
  const phase: Phase = shellPhase === "B" ? "B" : "A";
  const body = hexToRgb(theme(phase).actor.body);
  const cells: Vec[] = [];
  for (let y = 0; y < level.height; y += 1) {
    for (let x = 0; x < level.width; x += 1) cells.push({ x, y });
  }
  const points = cells.map((cell) => geometry.cellCenterDevice(cell.x, cell.y));
  const samples = await sampleCanvas(page, points);
  const matches: Vec[] = [];
  cells.forEach((cell, index) => {
    const sample = samples[index];
    if (sample !== undefined && rgbDistance(sample, body) <= 2) matches.push(cell);
  });
  return {
    cells: matches,
    cell: matches.length === 1 ? (matches[0] ?? null) : null,
    samples,
  };
}

/** Assert the player stands on `expected`, with a diagnostic on failure. */
export async function expectActorAt(
  page: Page,
  geometry: BoardGeometry,
  level: Level,
  expected: Vec,
): Promise<void> {
  const probe = await actorCell(page, geometry, level);
  const shellPhase = await page.locator(".ps-shell").getAttribute("data-phase");
  expect(
    probe.cell,
    `actor tile should be (${String(expected.x)},${String(expected.y)}) in phase ${String(shellPhase)}; ` +
      `found ${JSON.stringify(probe.cells)}`,
  ).toEqual(expected);
}