/**
 * Level registry — loads the authored L1–L35 files and **validates every one**
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
 * frozen, solver-proven artefact and is not touched here. L12–L15 (R-003b) execute
 * that precedent four more times: ADR-design-0003's block is in the dataset and
 * solver-proven (`docs/ai-native-pipeline.md` §8.10), so the unlock is again data —
 * four entries, no scene logic. The UA capture-entry round the ADR §8 item 6 asks
 * for stays tracked separately (LV-009-B handoff #2, `docs/ui-ux.md`), and the
 * files remain read-only inputs here.
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
import l012 from "@/levels/l012.json";
import l013 from "@/levels/l013.json";
import l014 from "@/levels/l014.json";
import l015 from "@/levels/l015.json";
import l016 from "@/levels/l016.json";
import l017 from "@/levels/l017.json";
import l018 from "@/levels/l018.json";
import l019 from "@/levels/l019.json";
import l020 from "@/levels/l020.json";
import l021 from "@/levels/l021.json";
import l022 from "@/levels/l022.json";
import l023 from "@/levels/l023.json";
import l024 from "@/levels/l024.json";
import l025 from "@/levels/l025.json";
import l026 from "@/levels/l026.json";
import l027 from "@/levels/l027.json";
import l028 from "@/levels/l028.json";
import l029 from "@/levels/l029.json";
import l030 from "@/levels/l030.json";
import l031 from "@/levels/l031.json";
import l032 from "@/levels/l032.json";
import l033 from "@/levels/l033.json";
import l034 from "@/levels/l034.json";
import l035 from "@/levels/l035.json";

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
  // L12–L15 is ADR-design-0003's block (LV-009-B): logged doors × mandatory
  // portals, par 4/6/8/10, `par == shortestSolution` on 15/15 and 0 dead states on
  // the whole dataset (`docs/ai-native-pipeline.md` §8.10). Registered as the same
  // shape of input as L1–L11 — four entries, no new scene logic: the portal painter
  // shipped in R-002 and the door/switch painters before it, so `?level=12..15` and
  // the L1→L15 chain resolve off this list rather than off a literal.
  { file: "l012.json", raw: l012 },
  { file: "l013.json", raw: l013 },
  { file: "l014.json", raw: l014 },
  { file: "l015.json", raw: l015 },
  // L16–L19 is R-003c's registered block (the ADR-design-0003 successor clause:
  // constant doors on the latch block, `docs/ai-native-pipeline.md` §8.11). All
  // four are `switchRequired: required` — the first non-exempt latch: all-OFF is
  // a measured no-goal state — and 19/19 ship with `par == shortestSolution`.
  // Same shape of input as L1–L15: four rows, no new scene logic, no painter seam.
  { file: "l016.json", raw: l016 },
  { file: "l017.json", raw: l017 },
  { file: "l018.json", raw: l018 },
  { file: "l019.json", raw: l019 },
  // L20 is R-003d's registered tail rung of the same latch block, closing
  // L16–L20 (ADR-design-0003 successor clause, `docs/ai-native-pipeline.md`
  // §8.11): `switchRequired: required` like its four block-mates — all-OFF is a
  // measured no-goal state — par 20 / D_exec 24.729412, 252 ordered two-press
  // routes and 14 refusals on the certified root. Same shape of input as
  // L1–L19: one row, no new scene logic, no painter seam. The file stays a
  // read-only input (`src/levels/**` is Level AI + Solver's).
  { file: "l020.json", raw: l020 },
  // L21–L25 is R-004a's registered Act II batch 1 (the ADR-design-0003 successor
  // clause's own successor — the act-scale tail law, `docs/ai-native-pipeline.md`
  // §8.16 / `src/levels/README.md` §2f): moved out of `src/levels/candidates/` by
  // `git mv`, rename 100 %, `sha256` **and** git blobs identical on both sides, no
  // content edit during the move. All five are `switchRequired: required` like the
  // L16–L20 latch block — all-OFF is a measured no-goal state (UNSATISFIABLE ×5) —
  // and each carries its own per-member gates (`ACT_II_B1_LADDER` in
  // `@/core/solver/policy`): par **17 / 18 / 20 / 21 / 23**, `par == shortestSolution`
  // 5/5 at D_exec 21.581395 / 22.584 / 24.62 / 25.604651 / 27.604651, coverage 42/42
  // and 13/13 controls caught on every rung (`LADDER RESULT: PASS`, act-peak
  // DISCHARGED at 1.455349 headroom). The registration did **not** move the block law
  // (`BLOCK_L1619_IDS` is still `[16 … 20]`, L20 not re-stamped). Same shape of input
  // as L1–L20: five rows, no new scene logic, no new painter seam — the door / switch
  // / portal painters all shipped before them, so requiring them of `?level=21..25`
  // and of the L1→L25 chain is exactly this data edit and nothing else. The files stay
  // read-only inputs here (`src/levels/**` is Level AI + Solver's).
  { file: "l021.json", raw: l021 },
  { file: "l022.json", raw: l022 },
  { file: "l023.json", raw: l023 },
  { file: "l024.json", raw: l024 },
  { file: "l025.json", raw: l025 },
  // L26–L35 is R-005a's registered Act II batches 2 + 3 (the act-scale tail law's
  // successor clause, `docs/ai-native-pipeline.md` §7.3.1 / `src/levels/README.md`
  // §2g): moved out of `src/levels/candidates/` by `git mv`, rename 100 %, `sha256`
  // **and** git blobs identical on both sides, no content edit during the move. All
  // ten are `switchRequired: required` like the L16–L20 latch block and R-004a's
  // batch above — all-OFF is a measured no-goal state (UNSATISFIABLE ×10) — and each
  // carries its own per-member gates (`ACT_II_B2_B3_LADDER` in
  // `@/core/solver/policy`): par **17 / 18 / 20 / 21 / 23** (batch 2) and
  // **19 / 22 / 22 / 24 / 24** (batch 3), `par == shortestSolution` 10/10, coverage
  // and the 13/13 controls caught on every rung (`LADDER RESULT: PASS`). Batch 3 is
  // the act's **new registered tail** — it raises the act maximum to L35's `D_exec`
  // 28.339426, a tail the batch ladder registers by name rather than a number that
  // drifts on its own — and the two seam rungs are labelled at registration
  // (L26 lands below L25, L31 below L30, §7.3.1: a named relief, never a silent
  // dip). The registration did **not** move the block law (`BLOCK_L1619_IDS` is
  // still `[16 … 20]`, `block-l1619-tail-ceiling` still judges L20 at par 20 /
  // `D_exec` 24.729412; L20 **not** re-stamped) and re-stamped **no** R-004a-era
  // row — the five L21–L25 rows above survive unchanged. Same shape of input as
  // L1–L25: ten rows, no new scene logic, no new painter seam — the door / switch /
  // portal painters all shipped before them, so requiring them of `?level=26..35`
  // and of the L1→L35 chain is exactly this data edit and nothing else
  // (`GameSession.next` walks this array, so the chain needs no second literal).
  // The files stay read-only inputs here (`src/levels/**` is Level AI + Solver's).
  { file: "l026.json", raw: l026 },
  { file: "l027.json", raw: l027 },
  { file: "l028.json", raw: l028 },
  { file: "l029.json", raw: l029 },
  { file: "l030.json", raw: l030 },
  { file: "l031.json", raw: l031 },
  { file: "l032.json", raw: l032 },
  { file: "l033.json", raw: l033 },
  { file: "l034.json", raw: l034 },
  { file: "l035.json", raw: l035 },
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
 * `L1–L35` — the **shipped ladder's own range**, derived from the playable list.
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