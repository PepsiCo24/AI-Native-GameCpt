/**
 * Composition root — the only place that knows about *all* the modules.
 *
 * Owner: Gameplay Engineer (`src/main.ts`, `src/game/**`, AGENTS.md §4). It mounts
 * the game and owns no gameplay logic of its own: no rule, no colour, no size is
 * decided here.
 *
 * What it wires, in order:
 *
 * 1. `loadPlayableLevels()` — every prototype level passes `validateLevel` +
 *    `LevelSchema` before it can reach the board (ADR-0004: reject, never repair).
 *    A rejected file is logged loudly by the registry; if *nothing* survives, the
 *    boot fails visibly in the DOM instead of showing an empty board.
 * 1b. `?level=<n>` — the dev / playtest / E2E entrance into level `n`
 *    (`docs/ui-ux.md` §1: no level-select screen exists). It only selects the
 *    session's starting index; out of range falls back to L1, nothing persists
 *    and no win is bypassed.
 * 2. `GameSession` — the single owner of `GameState`.
 * 3. `Hud` — the DOM overlay (§7.1/§7.2), and the `AppIntents` closures the DOM
 *    buttons and the keyboard shortcuts (`Z` / `R` / `Enter`, §7.4) both call.
 * 4. `LevelScene` — the canvas, handed the session, the intents, a `measure()`
 *    function and the HUD's cell-size callback.
 * 5. Fit + resize: the canvas **backing store** is the play-area CSS box ×
 *    `min(devicePixelRatio, 2)` (R-L6), while `Phaser.Scale.FIT` + `CENTER_BOTH`
 *    keep its CSS size equal to that box — so the board is crisp on a retina phone
 *    and neither portrait nor landscape needs a branch (§2.1).
 *
 * Discipline kept from the previous mount (unchanged on purpose):
 *
 * - `Phaser.Scale.FIT` + `CENTER_BOTH` — one fixed design resolution, letterboxed.
 * - **Pinch-zoom is not touched here and must not be.** Nothing calls
 *   `preventDefault` on document gestures, nothing sets `touch-action` globally and
 *   the viewport meta is not rewritten: zoom behaviour is `index.html`'s
 *   (`#app canvas { touch-action: none }` is scoped to the board surface only).
 * - The pre-first-frame clear colour is the **starting phase's** plate
 *   (`ground.plate`); `BoardView` then paints the full phase ground on the first
 *   update, before the first frame is presented.
 */

import Phaser from "phaser";

import type { Level } from "@/core/level";
import { onReducedMotionChange, prefersReducedMotion, requestedLevel } from "@/game/env";
import { Hud } from "@/game/hud/hud";
import { loadPlayableLevels, ladderLabelOf, startIndexForLevel } from "@/game/levels/level-registry";
import type { Viewport } from "@/game/renderer/grid-mapping";
import { LevelScene } from "@/game/scenes/level-scene";
import type { AppIntents } from "@/game/systems/app-intents";
import { GameSession } from "@/game/systems/session";
import { assertNoPlaceholders } from "@/game/theme/assets";
import { LAYOUT, theme, toInt } from "@/game/theme/tokens";

/** R-L6: `devicePixelRatio` is capped at 2 — never a 3× framebuffer on mobile. */
function renderScaleOf(): number {
  return Math.min(window.devicePixelRatio || 1, LAYOUT.maxRenderScale);
}

/** A visible failure beats a silent blank board. */
function showBootFailure(container: HTMLElement, error: unknown): void {
  const box = document.createElement("div");
  box.setAttribute("role", "alert");
  box.style.cssText =
    "box-sizing:border-box;height:100%;display:flex;flex-direction:column;gap:8px;" +
    "align-items:center;justify-content:center;padding:24px;text-align:center;font:15px/1.4 system-ui,sans-serif";
  const title = document.createElement("strong");
  title.textContent = "无法启动 / Cannot start";
  const detail = document.createElement("span");
  detail.textContent = error instanceof Error ? error.message : String(error);
  box.append(title, detail);
  container.append(box);
}

function boot(container: HTMLElement): void {
  let session: GameSession;
  let levels: readonly Level[];
  try {
    // R-P6 — the production gate. It throws only when art is expected to be
    // integrated (`ART_INTEGRATED`), see `theme/assets.ts`.
    assertNoPlaceholders();
    levels = loadPlayableLevels();
    // `?level=<n>` — the dev / playtest / E2E entrance (docs/ui-ux.md §1: there is
    // no level-select screen). Out of range falls back to L1; nothing is persisted
    // and the win path is untouched (`startIndexForLevel`).
    session = new GameSession(levels, {
      startIndex: startIndexForLevel(levels, requestedLevel()),
    });
  } catch (error) {
    console.error("[main] boot failed:", error);
    showBootFailure(container, error);
    return;
  }

  const reducedMotion = prefersReducedMotion();

  // One dispatch path for the three non-`MOVE` actions: the DOM buttons, the win
  // dialog and the keyboard all land in these closures.
  const intents: AppIntents = {
    undo: () => {
      session.undo();
    },
    restart: () => {
      session.restart();
    },
    next: () => {
      // Guarded by state, not by a UI flag: `Enter` (§7.4) must not skip a level
      // that has not been solved.
      if (session.isWon) session.next();
    },
  };

  const hud = new Hud({
    container,
    session,
    reducedMotion,
    hooks: {
      ...intents,
      hasNextLevel: () => session.levelIndex + 1 < session.levelCount,
      // The end panel names the ladder that actually shipped, computed from the
      // registry (TICKET-QA-005-2) — a literal here is exactly how `L1–L5` outlived
      // L6–L10.
      shippedLadder: () => ladderLabelOf(levels),
    },
  });

  /** The play area's CSS box, in device px — the single geometry input (R-L7). */
  const measure = (): Viewport => {
    const box = hud.playArea.getBoundingClientRect();
    const renderScale = renderScaleOf();
    return {
      width: Math.max(1, Math.round(box.width * renderScale)),
      height: Math.max(1, Math.round(box.height * renderScale)),
      renderScale,
    };
  };

  const first = measure();
  const scene = new LevelScene({
    session,
    intents,
    measure,
    onCellSizeCss: (cellSizeCss) => {
      hud.setCellSizeCss(cellSizeCss);
    },
    reducedMotion,
  });

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: hud.playArea,
    // The first presented frame is already the correct phase ground, even before
    // `BoardView` finishes painting (levels start in their own `startPhase`).
    backgroundColor: toInt(theme(session.phase).ground.plate),
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: first.width,
      height: first.height,
    },
    scene: [scene],
  });

  // ── fit: keep the backing store equal to the CSS box × render scale (R-L6) ──
  let pendingFrame = 0;
  const fit = (): void => {
    if (pendingFrame !== 0) return;
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;
      const next = measure();
      const current = game.scale.gameSize;
      if (next.width === current.width && next.height === current.height) return;
      // This emits `Scale.Events.RESIZE`, which is what makes the scene recompute
      // its layout exactly once (R-L7).
      game.scale.setGameSize(next.width, next.height);
    });
  };

  const observer = new ResizeObserver(fit);
  observer.observe(hud.playArea);
  window.addEventListener("resize", fit);
  window.visualViewport?.addEventListener("resize", fit);

  const offMotion = onReducedMotionChange((reduced) => {
    scene.setReducedMotion(reduced);
    hud.setReducedMotion(reduced);
  });

  // Keep the references alive for the lifetime of the page and give an explicit
  // teardown for a future hot-reload / multi-mount scenario.
  window.addEventListener("pagehide", () => {
    offMotion();
    observer.disconnect();
    window.removeEventListener("resize", fit);
    window.visualViewport?.removeEventListener("resize", fit);
    hud.destroy();
    game.destroy(true);
  });
}

const app = document.getElementById("app");

if (app === null) {
  console.error(
    '[main] mount point missing: index.html must provide <div id="app"> — the game was not started',
  );
} else {
  boot(app);
}