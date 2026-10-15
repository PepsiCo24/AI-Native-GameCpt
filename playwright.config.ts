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
 * ── `reuseExistingServer: false` — the QA-005c decision (R-004b's live risk) ──
 * Playwright's local default is `reuseExistingServer: true`: if *anything* is
 * already listening on the port, Playwright skips starting the server and tests
 * against it. That default made the isolation above **illusory in the one case
 * that matters**: an orphaned `vite` from a *different* worktree left on the
 * default port meant a config run silently exercised another tree's code, with no
 * error and a green-looking report (observed on this repo's lanes). `--strictPort`
 * cannot help there — it only fires if Playwright *tries* to start vite, which it
 * does not while reusing.
 *
 * `false` is therefore the only setting that keeps the promise: Playwright always
 * starts its own server, so a busy port fails loudly at `--strictPort` instead of
 * silently testing a stranger's bundle. Nothing is lost: the legitimate "I already
 * started vite" workflow is the explicit `PS_E2E_BASE_URL` path above, which
 * disables the managed server by design. Port isolation stays per-lane through
 * `PS_E2E_PORT` (each lane picks its own; QA-005c runs on `PS_E2E_PORT=5214`).
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
        // QA-005c: `false`, never `true` — see the header. Playwright's local
        // default (`true`) silently tests whatever is already on the port, which
        // defeats `--strictPort` and can exercise another worktree's code. A busy
        // port must fail loudly; the deliberate "use my own server" path is
        // `PS_E2E_BASE_URL`, which removes the managed server entirely.
        reuseExistingServer: false,
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