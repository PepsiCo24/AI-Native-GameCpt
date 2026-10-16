/**
 * `tests/e2e-live` — **the deployed-artifact lane** (QA-005h).
 *
 * ── What this lane is for ────────────────────────────────────────────────────
 * Everything in `tests/e2e/**` runs against a vite this repo just built from the
 * working tree. Nothing in it runs against **the artifact the world can actually
 * load** — the GitHub Pages build of `main`. This lane closes exactly that gap and
 * nothing else: for every shipped level it drives the *deployed* bundle with the
 * *local* solver's par route and requires the deployed HUD to agree (win dialog up,
 * `moves` equal to the route length, the session naming the level it claims to be)
 * with both error channels empty.
 *
 * It is deliberately **not** a spec inside `tests/e2e/**`: the standing roster and
 * its 30 s default are the CI gate (`playwright.config.ts`), and a network-hitting
 * production smoke must never enter that roster — a Pages/CDN incident would then
 * turn a zero-retry correctness gate red for a reason that is not the code. It is
 * a separate config (`playwright.live.config.ts`), a separate directory, run on
 * demand:
 *
 * ```bash
 * npx playwright test --config=playwright.live.config.ts
 * ```
 *
 * ── Why the expectations come from the local dataset ─────────────────────────
 * `loadReferenceLevels()` reads `src/levels/*.json`, validates them through the
 * production gate and solves them with the program of record, so the route and the
 * move count are the **solver's**, never typed into this file. Consequence, stated
 * plainly: this lane is green while the **deployed build ships the same ladder as
 * the checkout**. A deploy of an older commit that lacks the newest level fails the
 * newest row — which is the intended reading ("the production artifact does not
 * serve the ladder the tree claims"), not a flake.
 *
 * ── Finding 1 (measured): the deployed root must be spelled out ──────────────
 * See `live-target.ts` and the final row of this file: `levelUrl()` returns a
 * root-absolute `/?level=<n>`, and resolving that against the Pages *project* root
 * drops the `/AI-Native-GameCpt/` sub-path. So `PS_E2E_BASE_URL` cannot target this
 * deployment and this lane builds its URLs from {@link LIVE_ROOT}.
 *
 * ── Finding 2 (measured): the win dialog is raised *after* the arrival beat ───
 * Reading the HUD with a single `hud()` call immediately after the last press sees
 * `won === false` even though `moves` is already the correct count — the flip/hop
 * beat finishes, then the overlay is raised. On the Orchestrator's throwaway
 * version of this spec **all 15 rows** failed on exactly that, with a correct move
 * counter. The fix is the auto-retrying locator below
 * (`await expect(page.locator(".ps-overlay")).toBeVisible()`), **never** a sleep:
 * a sleep would hide a genuine slow-boot regression behind wall-clock padding,
 * while the retrying assertion waits exactly as long as the app takes and fails
 * loudly if the dialog never comes up.
 */

import { expect, test } from "@playwright/test";

import {
  expectNoPageErrors,
  hud,
  openLevel,
  pressDirection,
  watchErrors,
} from "../e2e/helpers/game";
import { EXPECTED_LEVEL_COUNT, levelUrl, loadReferenceLevels } from "../e2e/helpers/levels";

import { LIVE_ROOT, liveLevelUrl } from "./live-target";

/** The shipped dataset, validated + solved by the program of record (`src/levels/*.json`). */
const REFS = loadReferenceLevels();

/** One HUD label per level, composed the same way `playthrough.spec.ts` reads it. */
function levelLabel(id: number): string {
  return `L ${String(id).padStart(2, "0")}`;
}

test.describe("deployed artifact — every shipped level is winnable on the live build", () => {
  for (const ref of REFS) {
    const label = levelLabel(ref.id);
    test(`${label} — the live build wins on the solver's par route`, async ({ page }) => {
      const watch = watchErrors(page);
      await openLevel(page, liveLevelUrl(ref.id));

      // A fresh session: the deployed `?level=` entrance starts at move 0 on the
      // requested board, with no dialog up.
      const start = await hud(page);
      expect(start.levelLabel, "the fresh session names the requested level").toBe(label);
      expect(start.moves, "a fresh session starts at move 0").toBe(0);
      expect(start.won, "no win dialog before the route is walked").toBe(false);

      for (const direction of ref.route) await pressDirection(page, direction);

      // Finding 2: the dialog is raised after the arrival beat, so it is read with
      // the auto-retrying locator — a single `hud()` read here is a measured trap.
      await expect(page.locator(".ps-overlay")).toBeVisible();

      const won = await hud(page);
      expect(won.moves, "the HUD counts exactly the par route's presses").toBe(ref.route.length);
      expect(won.levelLabel, "the winning session still names this level").toBe(label);
      expect(won.won).toBe(true);

      // The last shipped level closes the ladder with the prototype-over panel;
      // every other level names itself in the dialog title. Same branch the
      // standing suite takes (`playthrough.spec.ts`), driven by the one pin.
      if (ref.id < EXPECTED_LEVEL_COUNT) {
        expect(won.dialogTitle).toBe(`${label} cleared`);
        expect(won.nextVisible).toBe(true);
      } else {
        expect(won.dialogTitle).toBe("原型结束 / Prototype over");
        expect(won.nextVisible).toBe(false);
      }

      expectNoPageErrors(watch, `${label} deployed walk`);
    });
  }

  test("an out-of-range ?level deep link falls back to L1 on the live build", async ({ page }) => {
    const watch = watchErrors(page);
    await openLevel(page, liveLevelUrl("out-of-range"));
    const state = await hud(page);
    expect(state.levelLabel, "?level=99 falls back to the deployed L1").toBe(levelLabel(1));
    expect(state.moves).toBe(0);
    expect(state.won).toBe(false);
    expectNoPageErrors(watch, "?level=99 fallback on the live build");
  });
});

test.describe("the lane's own targeting rule", () => {
  test("a root-absolute level path cannot reach this deployment (finding 1)", () => {
    // This is the measurement the lane's existence rests on, kept as a test so it
    // cannot rot: the standing suite's helper answers `/?level=1`, and the URL API
    // resolves it against the *user-pages* root, one level above the project.
    const resolved = new URL(levelUrl(1), LIVE_ROOT).href;
    expect(resolved).toBe("https://pepsico24.github.io/?level=1");
    expect(resolved.startsWith(LIVE_ROOT)).toBe(false);

    // The lane's own builder keeps the sub-path — the two must not agree.
    expect(liveLevelUrl(1)).toBe(`${LIVE_ROOT}?level=1`);
    expect(new URL(liveLevelUrl(1)).href.startsWith(LIVE_ROOT)).toBe(true);
  });
});