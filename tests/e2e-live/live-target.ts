/**
 * The deployed artifact this lane targets — **its own URL root, spelled out
 * here** (QA-005h finding 1).
 *
 * ── Why the deployed root is a literal in this lane and not `levelUrl()` ─────
 * The standing suite's `tests/e2e/helpers/levels.ts:levelUrl()` answers a
 * **root-absolute** path (`/?level=<n>`) so that it resolves against whatever
 * `baseURL` the run uses. Against a *project* Pages deployment that is wrong,
 * and measurably so:
 *
 * ```
 * new URL("/?level=1", "https://pepsico24.github.io/AI-Native-GameCpt/").href
 *   === "https://pepsico24.github.io/?level=1"      // the user-pages root, 404/empty
 * ```
 *
 * The URL API drops the `/AI-Native-GameCpt/` sub-path because an absolute path
 * replaces the whole path, not just its last segment. So `PS_E2E_BASE_URL` cannot
 * be pointed at this deployment either: the suite would join the project root with
 * a root-absolute level path and land outside the project. The lane therefore
 * carries the *sub-path* root itself ({@link LIVE_ROOT}) and builds the level URL
 * with the query appended **after** it ({@link liveLevelUrl}).
 *
 * `deployed-artifact.spec.ts` pins that resolution (`new URL(levelUrl(1), LIVE_ROOT)`
 * is asserted to be exactly the broken `…github.io/?level=1`), so if `levelUrl()`
 * ever becomes deployment-safe the row goes red and this lane can drop its own
 * builder. Until then, the duplication is the point: it is the measured shape of
 * the deployment, not an assumption.
 *
 * ── Targets ──────────────────────────────────────────────────────────────────
 * `LIVE_ROOT` is the **GitHub Pages production URL** (`main`). Nothing about the
 * lane is level- or build-specific beyond that string: it reads the checked-out
 * dataset for the routes and the deployed bundle for the board, so it is green
 * exactly while the deployed build ships the same ladder as the checkout.
 */

/** The GitHub Pages deployment root **including** the `/AI-Native-GameCpt/` sub-path. */
export const LIVE_ROOT = "https://pepsico24.github.io/AI-Native-GameCpt/";

/**
 * `?level=<n>` on the deployed artifact, with the sub-path root kept.
 *
 * The `?level=99` fallback probe is spelled as `"out-of-range"` so the call sites
 * read like the suite's own (`levelUrl("out-of-range")`) even though the number is
 * written here: the query value is part of the deployed contract being exercised.
 */
export function liveLevelUrl(id: number | "out-of-range"): string {
  const level = id === "out-of-range" ? 99 : id;
  return `${LIVE_ROOT}?level=${String(level)}`;
}