// @vitest-environment jsdom

/**
 * TICKET-QA-005-2 — **the end panel must be truthful about the shipped ladder**.
 *
 * QA-005 pinned the defect as a `test.fail()`: `hud.ts` built the last level's
 * dialog body from a literal `L1–L5 cleared · <level>: <moves>`, written when the
 * playable slice was five levels, while the registry ships ten (the pin's own
 * expectation: `expect(won.dialogBody).not.toContain("L1–L5")` + "contains
 * `moves <par>`"). The copy now reads the range from the **registry's own list**
 * (`ladderLabelOf(loadPlayableLevels())`, injected by the composition root as the
 * `shippedLadder` hook), and the e2e pin is un-pinned in the same commit series.
 *
 * This file is the fast half of that contract; `playthrough.spec.ts` is the
 * end-to-end half (real browser, real keyboard, real dialog). Three links in the
 * chain, two of them tested here and the third enforced by the **compiler**:
 *
 * 1. `ladderLabelOf` derives the range from the loaded levels — tested here;
 * 2. `Hud.showWinPanel` prints the hook's value and adds the level + move count —
 *    tested here against the real `Hud`, the real `GameSession` and the shipped
 *    levels, with the level solved by the production solver's own route;
 * 3. the hook is wired in `src/main.ts` — **`HudHooks.shippedLadder` is a required
 *    property, so a main.ts that stops supplying it fails `tsc --noEmit`**, which is
 *    stronger than a grep.
 *
 * `jsdom` is opted into per file (the config's default environment is `node`,
 * `vite.config.ts` documents this directive). No Phaser is imported: the HUD is DOM
 * only (§7.2), and the board is not part of this claim.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import type { Level } from "@/core/level";
import { explore, movePath } from "@/core/solver/bfs";
import type { Direction } from "@/core/state/move";
import { isGoal } from "@/core/state/transitions";
import { Hud } from "@/game/hud/hud";
import { ladderLabelOf, loadPlayableLevels } from "@/game/levels/level-registry";
import { GameSession } from "@/game/systems/session";
import type { HudHooks } from "@/game/hud/hud";

const levels = loadPlayableLevels();
const LAST = levels[levels.length - 1] as Level;

/** The production solver's shortest route — no test-local search (AGENTS.md §3). */
function shortestPath(level: Level): readonly Direction[] {
  const graph = explore(level);
  const index = graph.nodes.findIndex((node) => isGoal(level, node));
  if (index < 0) throw new Error(`level ${String(level.id)} is unsolvable`);
  return movePath(graph, index);
}

interface Mounted {
  readonly hud: Hud;
  readonly session: GameSession;
  readonly body: () => string;
  readonly title: () => string;
  readonly nextHidden: () => boolean;
}

/**
 * Mount the real HUD over the real session, exactly as `src/main.ts` wires it —
 * the same `hasNextLevel` / `shippedLadder` closures, only built here so the copy
 * can be read without a browser.
 */
function mount(startIndex: number): Mounted {
  const container = document.createElement("div");
  document.body.append(container);
  const session = new GameSession(levels, { startIndex });
  const hooks: HudHooks = {
    undo: () => {
      session.undo();
    },
    restart: () => {
      session.restart();
    },
    next: () => {
      if (session.isWon) session.next();
    },
    hasNextLevel: () => session.levelIndex + 1 < session.levelCount,
    shippedLadder: () => ladderLabelOf(levels),
  };
  const hud = new Hud({ container, session, hooks, reducedMotion: true });
  const overlay = document.querySelector(".ps-overlay");
  const title = document.querySelector(".ps-dialog-title");
  const body = document.querySelector(".ps-dialog-body");
  const next = document.querySelector<HTMLButtonElement>(".ps-dialog-actions .ps-btn-primary");
  if (overlay === null || title === null || body === null || next === null) {
    throw new Error("the HUD dialog was not built");
  }
  return {
    hud,
    session,
    body: () => body.textContent ?? "",
    title: () => title.textContent ?? "",
    nextHidden: () => next.hidden,
  };
}

/** Solve the session's current level by the solver's own shortest route. */
function solve(mounted: Mounted): void {
  for (const dir of shortestPath(mounted.session.level)) {
    mounted.session.move(dir);
  }
  expect(mounted.session.isWon, "the solver's route completes the level").toBe(true);
  // §6.2: the panel waits for the flip before it appears (`flipTimings.total`).
  vi.advanceTimersByTime(2000);
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("ladderLabelOf — the shipped range comes from the registry", () => {
  it("names the ladder the repository actually ships (L1–L10)", () => {
    expect(levels.map((level) => level.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(ladderLabelOf(levels)).toBe("L1–L10");
  });

  it("is derived, not typed: a shorter or gapped list reads its own range", () => {
    const ids = [3, 4, 5];
    const synthetic = ids.map((id) => ({ ...(levels[0] as Level), id }));
    expect(ladderLabelOf(synthetic)).toBe("L3–L5");
    expect(ladderLabelOf([synthetic[0] as Level])).toBe("L3");
    expect(ladderLabelOf([])).toBe("L—");
  });
});

describe("the end panel copy (TICKET-QA-005-2)", () => {
  it("the last level's dialog is honest about the shipped ten and still carries the move count", () => {
    vi.useFakeTimers();
    const mounted = mount(levels.length - 1);
    solve(mounted);

    expect(mounted.title()).toBe("原型结束 / Prototype over");
    expect(mounted.nextHidden()).toBe(true);
    const body = mounted.body();
    expect(body).not.toContain("L1–L5"); // the pinned defect, gone
    expect(body).toContain("L1–L10 cleared");
    expect(body).toContain("L 10");
    expect(body).toContain(`moves ${String(LAST.par)}`); // the e2e's own contract
    expect(body).toBe(`L1–L10 cleared · L 10: moves ${String(LAST.par)}`);
    mounted.hud.destroy();
  });

  it("a mid-ladder win keeps the plain move copy — no ladder claim is made early", () => {
    vi.useFakeTimers();
    const mounted = mount(0); // L1
    solve(mounted);

    const body = mounted.body();
    expect(mounted.title()).toBe("L 01 cleared");
    expect(mounted.nextHidden()).toBe(false);
    expect(body).toBe(`moves ${String((levels[0] as Level).par)}`);
    expect(body).not.toContain("cleared");
    mounted.hud.destroy();
  });

  it("the copy follows the registry: a three-level list ends with L1–L3", () => {
    vi.useFakeTimers();
    const container = document.createElement("div");
    document.body.append(container);
    const three = levels.slice(0, 3);
    const session = new GameSession(three, { startIndex: 2 });
    const hud = new Hud({
      container,
      session,
      reducedMotion: true,
      hooks: {
        undo: () => undefined,
        restart: () => undefined,
        next: () => undefined,
        hasNextLevel: () => session.levelIndex + 1 < session.levelCount,
        shippedLadder: () => ladderLabelOf(three),
      },
    });
    for (const dir of shortestPath(session.level)) session.move(dir);
    vi.advanceTimersByTime(2000);
    expect(document.querySelector(".ps-dialog-body")?.textContent).toBe(
      `L1–L3 cleared · L 03: moves ${String((three[2] as Level).par)}`,
    );
    hud.destroy();
  });
});