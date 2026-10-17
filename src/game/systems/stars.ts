/**
 * Star rating + its persistence — `docs/ui-ux.md` §5.5 (task UA-003) and
 * `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md` **Ruling A**.
 *
 * ─── What this module is, and what it deliberately is not ────────────────────
 * The thresholds are **quoted, not designed** (Ruling A / `docs/game-design.md`
 * §14.2 GD-OQ2): **3★ ≤ par + 2·⌈par/10⌉**, **2★ ≤ par + 4·⌈par/10⌉**, **1★ any
 * finish**. Both factors are already-published numbers — `2` is ADR-0009's detour
 * quantum (the checkerboard invariant makes a detour cost exactly 2 moves, so any
 * odd slack is unreachable arithmetic) and `10` is P3's teaching-span par unit
 * (`docs/level-design.md` §6.1.1). Nothing here is tuned, and a re-tune is a
 * docs-first change (Playtest regression), never a silent constant edit.
 *
 * ─── Why the core is untouched (the load-bearing property) ───────────────────
 * A **hard move cap** was REFUSED in writing by the same ruling: a capped-out
 * state is a dead end in the Solver's own graph, so it manufactures `R > 0` and
 * reprices every published `D_exec` row (the measured identity `T ≡ R ≡ 0`).
 * This module is therefore a **rating**, read only *after* a win, in the
 * game/HUD layer:
 *
 * - no `src/core/**` file imports it (and nothing here imports the core at all —
 *   not `applyMove`, not the phase, not legality), so `applyMove`, the phase flip
 *   and legality cannot gain a star term: determinism, Undo, Restart and the
 *   Solver are untouched **by construction** (Ruling A, `docs/ui-ux.md` §5.5);
 * - **unlock stays completion-based**, never star-based — nothing in this module
 *   is ever consulted by the level order (`level-registry.ts` does not know it
 *   exists), because at 100 levels a star gate would be a progression wall;
 * - the in-play HUD shows `moves N` only (GD-OQ1's live-HUD refusal stands): the
 *   rating exists **only** on the post-win panel (§5.5 "Never").
 *
 * ─── Persistence (YAGNI: no accounts, no server, no sync) ────────────────────
 * One versioned key family, `ps.echoGrid/stars@1`, written **win-only** and
 * **monotone** — a worse run can never downgrade a stored best. The rule is
 * stated on **moves**, because moves are the stored measurement and the star
 * count is *derived* from them: keeping `min(stored, run)` moves makes the star
 * count monotone by construction, and it stays correct if a par is re-cut later.
 * Corrupt / absent / unknown-id / unreadable storage reads as **empty** and never
 * throws (private-mode Safari, a blocked store, a hand-edited value); a write
 * failure is swallowed for the same reason — the panel still shows this run, the
 * record just does not persist. A future second consumer (e.g. a challenge mode)
 * takes its **own version suffix**, never an in-place schema bump.
 */

/** Three slots, always — a rating-dependent width would reflow the card under B13. */
export const STAR_SLOTS = 3;

/** The versioned key family of Ruling A (§5.5 quotes it verbatim). */
export const STAR_STORAGE_KEY = "ps.echoGrid/stars@1";

/** `@1` — the schema number that key family carries. */
export const STAR_SCHEMA = 1;

/** The only rating values: any finish is 1★, so the range has no floor below it. */
export type StarCount = 1 | 2 | 3;

/**
 * The two slack quanta for `par`: `k1 = 2·⌈par/10⌉` (3★ at `≤ par + k1`) and
 * `k2 = 2·k1` (2★ at `≤ par + k2`). Exported because it is the falsifiable half
 * of the ruling — a playtest regression may replace the pair without touching the
 * core, and a test may pin the ladder table directly.
 */
export function starThresholds(par: number): {
  readonly k1: number;
  readonly k2: number;
} {
  const k1 = 2 * Math.ceil(par / 10);
  return { k1, k2: 2 * k1 };
}

/**
 * `starsFor(moves, par)` — the whole rule, as one pure function (§5.5 SF-rating).
 *
 * Win-only by contract: the caller is the post-win panel (`Hud.showWinPanel`),
 * which is reached only from the `levelWon` event, so no in-play read exists and
 * no fail state can be produced (there is nothing to fail: 1★ is any finish).
 */
export function starsFor(moves: number, par: number): StarCount {
  const { k1, k2 } = starThresholds(par);
  if (moves <= par + k1) return 3;
  if (moves <= par + k2) return 2;
  return 1;
}

/** The stored best, as the one measurement the storage holds: moves per level id. */
type BestMoves = ReadonlyMap<string, number>;

/**
 * A best-of read is `null` when nothing is stored — distinct from `1★`, which is
 * a real record. The distinction is what keeps the field from ever claiming a
 * record the storage does not hold (§5.5 SF-5: a first clear draws **no hollow
 * mark**, and neither does a corrupt store).
 */
export function bestMovesFor(levelId: number): number | null {
  return readBestMoves().get(String(levelId)) ?? null;
}

/** The stored best as a rating, or `null` when this level has no record. */
export function bestStarsFor(levelId: number, par: number): StarCount | null {
  const moves = bestMovesFor(levelId);
  return moves === null ? null : starsFor(moves, par);
}

/** What one win produced: this run's rating, and the **post-write** best (§5.5 SF-5). */
export interface WinStars {
  /** This run's rating, from `starsFor`. */
  readonly run: StarCount;
  /** `max(previous, this run)` — the field renders from this. */
  readonly best: StarCount;
  /** The stored best in moves after the write (`min(previous, this run)`). */
  readonly bestMoves: number;
  /** `true` only when this run strictly improved the record (a stored best changed). */
  readonly improved: boolean;
}

/**
 * Record a win and answer with this run's rating + the post-write best.
 *
 * The write happens **here and only here**, which is the "win-only" half of the
 * monotone rule: this function has exactly one caller (`Hud.showWinPanel`, itself
 * reached only from `levelWon`), so Undo, Restart, level entry and loss cannot
 * write — those paths never touch storage at all. The monotone half is the
 * `moves < previous` guard: a worse or equal run leaves the stored bytes
 * **unchanged** (no read-modify-write of an equal value, no downgrade), while the
 * returned `best` still reports the record the panel must present.
 */
export function recordWinStars(
  levelId: number,
  moves: number,
  par: number,
): WinStars {
  const run = starsFor(moves, par);
  // One read, one write-back: the bytes are parsed once and every other valid row
  // is preserved verbatim through the write (a win on L4 never drops L5's record).
  const raw = readRawBest();
  const previous = validMoves(raw).get(String(levelId));
  const bestMoves = previous === undefined ? moves : Math.min(previous, moves);
  const improved = previous === undefined || moves < previous;
  if (improved) writeBestMoves(levelId, bestMoves, raw);
  return { run, best: starsFor(bestMoves, par), bestMoves, improved };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Storage plumbing — the only place in the repository that touches this key.
 *
 * Every branch below is a *tolerance* branch, never a gameplay branch: read
 * failures all collapse to "no record", which is a state the field already has
 * (all filled, no hollow). Nothing here throws, and nothing here is consulted by
 * any rule.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The browser store, or `null` when there is none (Node, a blocked store). */
function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Some privacy modes throw on *access*, not just on write.
    return null;
  }
}

/** The parsed `best` object as it is on disk, or `{}` — used to write back without loss. */
function readRawBest(): Record<string, unknown> {
  const store = storage();
  if (store === null) return {};
  let raw: string | null = null;
  try {
    raw = store.getItem(STAR_STORAGE_KEY);
  } catch {
    return {};
  }
  if (raw === null) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};
  const record = parsed as {
    readonly schema?: unknown;
    readonly best?: unknown;
  };
  // A different schema number is not this version's data: read as empty, never
  // coerce (a future `@2` consumer writes its own key family anyway).
  if (record.schema !== STAR_SCHEMA) return {};
  const best = record.best;
  if (typeof best !== "object" || best === null || Array.isArray(best))
    return {};
  return best as Record<string, unknown>;
}

/** The valid rows of `best`: `{ "<levelId>": { "moves": <non-negative integer> } }`. */
function validMoves(raw: Record<string, unknown>): BestMoves {
  const out = new Map<string, number>();
  for (const [key, entry] of Object.entries(raw)) {
    if (typeof entry !== "object" || entry === null) continue;
    const moves = (entry as { readonly moves?: unknown }).moves;
    if (typeof moves !== "number" || !Number.isInteger(moves) || moves < 0)
      continue;
    out.set(key, moves);
  }
  return out;
}

/** The stored best rows, from one tolerant read of the key family. */
function readBestMoves(): BestMoves {
  return validMoves(readRawBest());
}

/** Persist one improved row, preserving every other valid row. Never throws. */
function writeBestMoves(
  levelId: number,
  moves: number,
  raw: Record<string, unknown>,
): void {
  const store = storage();
  if (store === null) return;
  const best: Record<string, { readonly moves: number }> = {};
  for (const [key, value] of validMoves(raw)) {
    best[key] = { moves: value };
  }
  best[String(levelId)] = { moves };
  try {
    store.setItem(
      STAR_STORAGE_KEY,
      JSON.stringify({ schema: STAR_SCHEMA, best }),
    );
  } catch {
    // Quota / blocked store: the run is still rated on screen, the record just
    // does not persist. Never a crash, never a gameplay consequence.
  }
}
