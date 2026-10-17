/**
 * QA-021 — the **CPU-starvation arm**: `Emulation.setCPUThrottlingRate` on the
 * row's own page, opt-in and inert unless set.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * Cloud round `39018968002` failed exactly two rows that pass locally on every
 * schedule tried (`docs/project-status.md` item 120): both sampled an animation
 * timeline at a **wall-clock** offset, and on a slow runner (36.0 m vs 11.3 m)
 * dropped frames moved the sample past the beat's own window. Reading that as
 * "the cloud is just slow" is how a time bomb survives: the fix has to be
 * certified against the *starvation*, not against a fast machine.
 *
 * Chromium's own CDP emulation gives the starvation **without the cloud**:
 * `Emulation.setCPUThrottlingRate` makes the renderer's main thread busy at a
 * fixed multiple, which coarsens the frame grid exactly the way a loaded runner
 * does. That is the arm this helper installs — same shape as the QA-007
 * `PS_E2E_ART_DEGRADE` / QA-010 `PS_E2E_ART_DELAY_MS` arms: **never set on a
 * normal run**, so it can never mask a real regression, and it is what the
 * rewritten rows' "throttled green" acceptance was measured with.
 *
 * ```
 * PS_E2E_CPU_THROTTLE=4  npx playwright test tests/e2e/portal-mount.spec.ts -g "…"
 * PS_E2E_CPU_THROTTLE=10 npx playwright test tests/e2e/star-field.spec.ts  -g "…"
 * ```
 *
 * The rate is applied to *this page's* session only, on the first call, and is
 * idempotent — CDP sessions are per page and this project runs `workers: 1`, so
 * nothing leaks into another row.
 */

import type { Page } from "@playwright/test";

/** The rate the arm asks for, or `0` when the suite is unthrottled. */
export function cpuThrottleRate(): number {
  const raw = Number(process.env["PS_E2E_CPU_THROTTLE"] ?? "");
  return Number.isFinite(raw) && raw > 1 ? raw : 0;
}

/** Sessions already carrying the arm, so a row can call this more than once. */
const armed = new WeakMap<Page, number>();

/**
 * Install the starvation arm on `page` and return the rate actually in force
 * (`0` = unthrottled, i.e. the normal run). Chromium-only, which this suite is.
 */
export async function installCpuThrottle(page: Page): Promise<number> {
  const rate = cpuThrottleRate();
  if (rate === 0) return 0;
  if (armed.get(page) === rate) return rate;
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate });
  armed.set(page, rate);
  return rate;
}