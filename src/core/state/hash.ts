/**
 * Canonical state hash for the BFS visited-set.
 *
 * Truth sources: `docs/architecture.md` §6.3, ADR-architecture-0001 decision 5
 * (+ GATE C addendum: the hash contract is **unchanged** by Option B).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 */

import type { SearchState } from "./types";

/**
 * Covers **exactly** `player`, `phase`, `doorsOpen`, `switchesOn`.
 *
 * Deliberately excluded: `moveCount`, `history`, `status` — including them would
 * break transposition detection and make the visited-set useless (§6.3).
 *
 * Canonical by construction:
 * - record keys are sorted before serialization;
 * - falsy entries (`false`, i.e. closed door / switch off) are **omitted**, so
 *   `{ d1: false }` and `{}` — which denote the same logical state, since a
 *   missing key always means closed/off — hash identically. This keeps the hash
 *   correct whether a producer materializes all keys (`initialState`) or only
 *   the "on" ones;
 * - keys are length-prefixed, so the encoding is injective even for ids that
 *   contain the separators.
 *
 * Consequence: equal logical states always serialize identically, and distinct
 * logical states never collide — the visited-set can neither split equivalent
 * states nor merge distinct ones.
 */
export function hashState(s: SearchState): string {
  return [
    `${s.player.x},${s.player.y}`,
    s.phase,
    hashFlags(s.doorsOpen),
    hashFlags(s.switchesOn),
  ].join("|");
}

function hashFlags(flags: Readonly<Record<string, boolean>>): string {
  let out = "";
  for (const key of Object.keys(flags).sort()) {
    if (flags[key] !== true) continue;
    out += `${key.length}:${key}=1,`;
  }
  return out;
}