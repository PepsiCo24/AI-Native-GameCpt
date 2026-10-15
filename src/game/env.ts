/**
 * Environment probes for the browser layer.
 *
 * `/// <reference types="vite/client" />` is used instead of adding `"vite/client"`
 * to `tsconfig.json` `types`, because `tsconfig.json` is shared build tooling and
 * is not this role's file (AGENTS.md §4). `src/core/**` never uses anything here
 * — this module is for `src/game/**` only.
 */

/// <reference types="vite/client" />

/** `true` in a `vite build` bundle. Used for the dev-only placeholder badge (R-P3). */
export const IS_PROD: boolean = import.meta.env.PROD;

/** `?placeholders=1` — draws each placeholder's Asset ID (R-P3, dev builds only). */
export function hasQueryFlag(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

/**
 * `?level=<n>` — **entry selector only** (dev, playtest, E2E).
 *
 * `docs/ui-ux.md` §1: *"Level select / lobby — **no**; prototype enters at a
 * level directly (design §4)."* The query parameter is that entrance, nothing
 * more: it decides **where the session starts** and nothing else. It is not an
 * unlock system (no progression is stored), it does not persist anywhere (no
 * `localStorage`, no cookie, no `history.replaceState`), and it cannot bypass a
 * win — `GameSession` still starts at move 0 of the chosen level and every win
 * still runs through `applyMoveToGameState` + `isGoal` (AGENTS.md §10 YAGNI).
 *
 * Returns the 1-based level number, or `null` when the parameter is absent,
 * empty or not a positive integer. Resolution to an index (with the
 * out-of-range fallback to L1) is `startIndexForLevel` in the level registry —
 * this probe only parses.
 */
export function requestedLevel(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("level");
  if (raw === null || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** §6.4: the reduced-motion contract. Legibility identical, motion removed. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Subscribe to OS reduced-motion changes (best effort; unsupported ⇒ no-op). */
export function onReducedMotionChange(listener: (reduced: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent): void => listener(event.matches);
  query.addEventListener("change", handler);
  return () => query.removeEventListener("change", handler);
}