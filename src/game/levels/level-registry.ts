/**
 * Level registry — loads the authored L1–L11 files and **validates every one**
 * before it can reach the board.
 *
 * `docs/architecture.md` §7 / ADR-0004: schema → rule validation → (solver, at CI
 * level) → accept or **reject**. Nothing here repairs, guesses or skips a level
 * silently: an invalid file is reported on the console and dropped, and if that
 * leaves nothing playable the app fails loudly instead of showing an empty board.
 *
 * Explicit imports (not a Vite glob) on purpose:
 * - `resolveJsonModule` is already on, so `tsc --noEmit` type-checks the data path;
 * - `import.meta.glob` needs the `vite/client` ambient types, and `tsconfig.json`
 *   is shared build tooling that this role does not own (AGENTS.md §4).
 * L6+ adds one entry to {@link LEVEL_SOURCES} — data, not scene logic. Level files
 * are read-only inputs for this task (`src/levels/**` is owned by Level AI +
 * Solver), so nothing here writes, mutates or normalizes them. L11 (R-003) is the
 * same shape of edit: the portal painter seam shipped in R-002, so the unlock is
 * this entry and nothing else — the board itself (`l011.json`) is Level AI's
 * frozen, solver-proven artefact and is not touched here.
 */

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import l001 from "@/levels/l001.json";
import l002 from "@/levels/l002.json";
import l003 from "@/levels/l003.json";
import l004 from "@/levels/l004.json";
import l005 from "@/levels/l005.json";
import l006 from "@/levels/l006.json";
import l007 from "@/levels/l007.json";
import l008 from "@/levels/l008.json";
import l009 from "@/levels/l009.json";
import l010 from "@/levels/l010.json";
import l011 from "@/levels/l011.json";

interface LevelSource {
  readonly file: string;
  readonly raw: unknown;
}

/** The playable slice, in order. */
export const LEVEL_SOURCES: readonly LevelSource[] = [
  { file: "l001.json", raw: l001 },
  { file: "l002.json", raw: l002 },
  { file: "l003.json", raw: l003 },
  { file: "l004.json", raw: l004 },
  { file: "l005.json", raw: l005 },
  // L6–L10 unlock the doors + switch mechanics (`docs/level-design.md`): the
  // painter seam above was built first, so unlocking is this data edit and
  // nothing else. They are the same shape of input as L1–L5 — read-only files,
  // validated through `validateLevel` before a board may see them.
  { file: "l006.json", raw: l006 },
  { file: "l007.json", raw: l007 },
  { file: "l008.json", raw: l008 },
  { file: "l009.json", raw: l009 },
  { file: "l010.json", raw: l010 },
  // L11 is the M2 debut (opposite-colour portal pair at B, `docs/level-design.md`
  // §1 / ADR-0009): accepted by the program solver and the rule validator, par 4.
  // It joins the slice as data — no new scene logic, no new renderer class.
  { file: "l011.json", raw: l011 },
];

export interface LoadReport {
  readonly levels: readonly Level[];
  readonly rejected: readonly { readonly file: string; readonly errors: readonly string[] }[];
}

/**
 * Validate and parse every source. Invalid entries are **reported**, never
 * silently accepted (the dispatch requires a console error, not a quiet skip).
 */
export function loadLevels(sources: readonly LevelSource[] = LEVEL_SOURCES): LoadReport {
  const levels: Level[] = [];
  const rejected: { file: string; errors: readonly string[] }[] = [];

  for (const source of sources) {
    const result = validateLevel(source.raw);
    if (!result.ok) {
      console.error(
        `[levels] ${source.file} REJECTED by validateLevel (ADR-0004: reject, never repair):\n` +
          result.errors.map((error) => `  · ${error}`).join("\n"),
      );
      rejected.push({ file: source.file, errors: result.errors });
      continue;
    }
    if (result.warnings.length > 0) {
      // Warnings never reject a level (they are authoring notes: parity-dead walls,
      // dual walls, inert switches). They are logged because the level files are
      // deliberately hand-authored candidates, and hiding that would be dishonest.
      console.warn(
        `[levels] ${source.file} accepted with ${String(result.warnings.length)} design warning(s):`,
        result.warnings,
      );
    }
    // `validateLevel` returns a verdict, not a parsed level; the schema is the
    // frozen contract, so the typed value comes from re-parsing the same object.
    const parsed = LevelSchema.safeParse(source.raw);
    if (!parsed.success) {
      console.error(`[levels] ${source.file} passed validation but failed the schema parse`, parsed.error);
      rejected.push({ file: source.file, errors: parsed.error.issues.map((issue) => issue.message) });
      continue;
    }
    levels.push(parsed.data);
  }

  return { levels, rejected };
}

/**
 * `?level=<n>` → the index of level `n` in the playable list (item 4: deep link).
 *
 * The parameter is an **entry selector**, never an unlock system: it picks where
 * the session starts, and that is all it does — nothing is persisted, and the
 * win/`next` flow is untouched (`docs/ui-ux.md` §1 has no level-select screen;
 * `AGENTS.md` §10 forbids progression systems).
 *
 * Out of range / unknown / absent ⇒ index **0** (L1). The match is by
 * `Level.id`, not by array position, so a future non-contiguous dataset still
 * resolves honestly; a level that is not in the playable list falls back rather
 * than silently shifting by one.
 */
export function startIndexForLevel(levels: readonly Level[], requested: number | null): number {
  if (requested === null || levels.length === 0) return 0;
  const index = levels.findIndex((level) => level.id === requested);
  return index < 0 ? 0 : index;
}

/**
 * `L1–L11` — the **shipped ladder's own range**, derived from the playable list.
 *
 * The end panel's copy must name the ladder the player actually cleared, so it is
 * computed from the registry rather than written down: QA-005 pinned the stale
 * literal `L1–L5` that outlived the ship of L6–L10 (TICKET-QA-005-2 — the panel
 * claimed the prototype ended five levels early while ten were on the board).
 * Ids, not array positions, so a non-contiguous dataset still reads honestly.
 *
 * The empty case cannot be reached: `loadPlayableLevels()` throws rather than
 * returning zero levels, and `GameSession` refuses to be constructed with none.
 */
export function ladderLabelOf(levels: readonly Level[]): string {
  const first = levels[0];
  const last = levels[levels.length - 1];
  if (first === undefined || last === undefined) return "L—";
  if (first.id === last.id) return `L${String(first.id)}`;
  return `L${String(first.id)}–L${String(last.id)}`;
}

/** Validated levels in play order, or a hard failure if the slice is empty. */
export function loadPlayableLevels(): readonly Level[] {
  const { levels, rejected } = loadLevels();
  if (levels.length === 0) {
    throw new Error(
      `No playable levels: every source was rejected (${rejected.map((r) => r.file).join(", ")})`,
    );
  }
  if (rejected.length > 0) {
    console.error(
      `[levels] ${String(rejected.length)} level file(s) dropped: ${rejected.map((r) => r.file).join(", ")}`,
    );
  }
  return levels;
}