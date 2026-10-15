/**
 * Playwright configuration — **the standing e2e surface** (QA-005).
 *
 * Owner: QA Engineer (`playwright.config.*` + `tests/**`, AGENTS.md §4). This file
 * owns no gameplay, no level data and no `src/**` import: it only decides *where*
 * the suite runs and *which browser profiles* it runs in.
 *
 * ── Why e2e is NOT part of `npm run test` ────────────────────────────────────
 * `vitest.config.ts` (inside `vite.config.ts`) globs `tests/**\/*.test.ts`; this
 * suite is `tests/e2e/**\/*.spec.ts`, a different directory **and** a different
 * extension, so `npm run test` stays vitest-only and a missing browser can never
 * break the CI unit gate. The e2e run is the explicit `npx playwright test`
 * command. `testDir` is pinned to `./tests/e2e` and `testMatch` to `*.spec.ts`
 * for the same reason (one-way isolation, verifiable from either side).
 *
 * ── The server ───────────────────────────────────────────────────────────────
 * The suite never reuses somebody else's dev server. It starts **its own** vite
 * on `PS_E2E_PORT` (default **5198** — deliberately not the 5173 default and not
 * the Orchestrator's 5199) with `--strictPort`, so a port collision is a loud
 * failure instead of a silent reuse of another session's tree. Setting
 * `PS_E2E_BASE_URL` points the suite at an already-running instance and disables
 * the managed server entirely (that is the parameterised baseURL the ticket asks
 * for: `PS_E2E_BASE_URL=http://localhost:6000 npx playwright test`).
 *
 * ── Devices ──────────────────────────────────────────────────────────────────
 * Two profiles, both chromium (the only browser installed here):
 * - `desktop` — 1280×900 @1×, no touch. Runs every spec except `*.mobile.spec.ts`.
 * - `mobile`  — Pixel 5 (393×851 @2.75, DPR capped at 2 by R-L6), touch + mobile
 *   UA. Runs only `*.mobile.spec.ts`. Touch/gesture/layout claims are asserted
 *   here, on a real mobile emulation, not on a shrunken desktop window.
 *
 * `workers: 1` / `fullyParallel: false` are intentional: the transient-frame
 * protocol of `tests/e2e/transient.spec.ts` samples real 60 Hz frames, and a
 * second worker competing for the CPU would make the frame grid a lottery. The
 * whole suite is ~1 minute; determinism is worth more than the parallelism.
 */

import { defineConfig, devices } from "@playwright/test";

/** The QA-only dev-server port. Never 5173 (developer), never 5199 (orchestrator). */
const PORT = Number(process.env["PS_E2E_PORT"] ?? 5198);
const BASE_URL = process.env["PS_E2E_BASE_URL"] ?? `http://localhost:${String(PORT)}`;
const EXTERNAL_SERVER = process.env["PS_E2E_BASE_URL"] !== undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env["CI"]),
  retries: 0,
  reporter: [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
  },

  webServer: EXTERNAL_SERVER
    ? undefined
    : {
        command: `node_modules/.bin/vite --port ${String(PORT)} --strictPort`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 60_000,
      },

  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
      testIgnore: "**/*.mobile.spec.ts",
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: "**/*.mobile.spec.ts",
    },
  ],
});