/**
 * Playwright configuration — **the on-demand deployed-artifact lane** (QA-005h).
 *
 * Owner: QA Engineer (`playwright.config.*` + `tests/**`, AGENTS.md §4). This file
 * owns no gameplay, no level data and no `src/**` import.
 *
 * ── What it is, and what it deliberately is not ──────────────────────────────
 * `playwright.config.ts` is the **standing CI roster** (`tests/e2e/**`, two
 * chromium projects, its own managed vite on `PS_E2E_PORT`, 30 s per-test default).
 * This config is the opposite in every dimension that matters:
 *
 * | | `playwright.config.ts` (CI gate) | `playwright.live.config.ts` (this lane) |
 * |---|---|---|
 * | testDir | `./tests/e2e` | `./tests/e2e-live` |
 * | target | a vite built from the working tree | the **deployed GitHub Pages build** |
 * | server | manages its own vite (`--strictPort`) | **none** — nothing is built or served here |
 * | projects | `desktop` + `mobile` | one chromium profile |
 * | timeout | 30 s (with per-test CI-envelope budgets) | 60 s — a *network* round trip per row |
 * | retries | 0 | 0 (same law: a transient is a named red, never a silent re-run) |
 * | in CI | yes | **never** |
 *
 * The last row is the whole point of a second file. The CI job is a zero-retry
 * correctness gate; pointing it at a CDN-backed production URL would make a Pages
 * incident, a DNS hiccup or a propagation delay indistinguishable from a code
 * regression, and would put an external dependency inside the gate that answers
 * "did this commit break the game". A production smoke is run **on demand**, by a
 * human, on purpose:
 *
 * ```bash
 * npx playwright test --config=playwright.live.config.ts
 * ```
 *
 * Note the explicit `--config`: Playwright's automatic lookup only considers the
 * exact filenames `playwright.config.{ts,js,mjs,cjs}`, so this file can never be
 * picked up by a bare `npx playwright test` — and `testDir` is a *different*
 * directory, so the CI roster is untouched in both directions. The isolation is
 * verified from the roster side in `tests/e2e/README.md` (`--list` still reports
 * the standing 107 tests in 8 files).
 *
 * ── `baseURL` is the deployed *project* root ─────────────────────────────────
 * The sub-path matters and is spelled out in `tests/e2e-live/live-target.ts`
 * (QA-005h finding 1): the standing suite's `levelUrl()` answers a root-absolute
 * `/?level=<n>`, which resolved against this base drops the `/AI-Native-GameCpt/`
 * sub-path. The lane passes absolute URLs from its own builder; `baseURL` is set
 * to the same root so nothing in the lane can fall back to `localhost` silently.
 *
 * ── No `webServer`, on purpose ───────────────────────────────────────────────
 * The lane asserts the **deployed** build. If it started a server — even
 * harmlessly — a mis-set `PS_E2E_BASE_URL` or an accidental relative navigation
 * could make the run green against the working tree while claiming production.
 * There is no server key here, so every URL in the lane is an absolute `https://`
 * one and the target is unambiguous.
 */

import { defineConfig, devices } from "@playwright/test";

import { LIVE_ROOT } from "./tests/e2e-live/live-target";

export default defineConfig({
  testDir: "./tests/e2e-live",
  testMatch: "**/*.spec.ts",
  /**
   * 60 s per test: one level row is a real HTTPS page load plus ~10 paced presses
   * and one auto-retrying dialog assertion. Measured against the live Pages build
   * the rows run in ~2 s (QA-005h), so the budget is ~30× the observed cost — big
   * enough that a slow CDN response is not a failure, small enough that a hang
   * still fails loudly. It is a wall clock, never an assertion.
   */
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env["CI"]),
  retries: 0,
  reporter: [["list"]],

  use: {
    baseURL: LIVE_ROOT,
    // No trace/screenshot by default: a production smoke's failure artifact is the
    // assertion message plus the error text. Keep a trace only when it fails.
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
  },

  projects: [
    {
      name: "live-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
  ],
});