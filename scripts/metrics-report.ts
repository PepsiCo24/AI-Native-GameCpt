/**
 * `scripts/metrics-report.ts` — the **accepted-set metrics sidecar** builder
 * (ADR-architecture-0003 **Ruling 3**, executed by LV-007E).
 *
 * ── WHAT THIS FILE IS FOR ─────────────────────────────────────────────────────
 * The acceptance metrics of §8 / §2 were, until LV-007E, **recomputed on every run
 * and never persisted**: `docs/level-difficulty.md` §5.2 is a hand-mirrored table,
 * so every level merge risked silent table drift (RV-007's NIT and DG-004a's two
 * stale rows were exactly that class). Ruling 3 makes the numbers **derived** and
 * the mirror **test-pinned**:
 *
 *   1. this module builds `docs/level-difficulty.report.json` — one record per
 *      shipped level plus a self-describing header (weights) and a content-hash
 *      provenance block;
 *   2. `scripts/solve-levels.ts --report` writes it (silently: the CLI's stdout
 *      dump is frozen and stays byte-identical);
 *   3. `tests/solver/metrics-sidecar.test.ts` re-builds the report in memory and
 *      asserts **byte-equality** with the committed file — any level edit, weight
 *      change or solver change without a regeneration goes RED at test time.
 *
 * ── NO NEW METRIC, NO RULE CODE, NO RE-DERIVATION ─────────────────────────────
 * Every field comes from functions that already exist and that the CLI gate
 * already calls: `auditLevel` (`@/core/solver/policy`) → `explore`/`analyse`/
 * `embedMetrics` (`@/core/solver/bfs`, the §8 contract) and `analyseDifficulty`
 * (`@/core/solver/difficulty`, the §2 model). This module adds **no** measurement
 * of its own; it only *serializes* what the audit computed, in a stable key order.
 * It never re-implements legality, movement, door openness or solidity.
 *
 * ── REPRODUCIBILITY (why there is no git sha and no timestamp) ────────────────
 * A `git rev-parse HEAD` in the payload would red the freshness pin on every
 * unrelated commit, and a wall-clock field would make two runs differ. Instead
 * `generatedFrom` carries a **content hash**:
 *
 *   - per level, `sha256` over the level file's **canonical JSON** (object keys
 *     sorted recursively) — so the hash is content-sensitive and
 *     formatting-invariant (`npm run format` rewrites `src/levels/*.json` today
 *     and must NOT red the pin);
 *   - `datasetHash`, one `sha256` over the sorted `file:sha256` lines.
 *
 * The result is reproducible **across worktrees** (same content ⇒ same bytes) and
 * still pins the tree: change a board and the hash, the record and the file all
 * move, and the pin fails until the artifact is regenerated.
 *
 * ── THE DERIVED AGGREGATES ────────────────────────────────────────────────────
 * `seams[]` holds the two consecutive-pair read-outs §5.2 publishes (the L5→L6
 * latch-block debut and the L10→L11 M2 debut) with a **term-wise decomposition**,
 * taken from the records above and never re-measured: `terms` is the raw movement
 * of `L B T R M`, `contributions` is that movement weighted by `w1…w5`, and
 * `deltaD` / `deltaDexec` are the two sums. It stores **numbers**, not the doc's
 * display strings: `docs/level-difficulty.md`'s `Δ −1.47` / `−5.07` are the 2-dp
 * forms the mirror test derives from these fields, and §5.2's `ΔB = +0.528736` /
 * `ΔM = +10` are its **weighted** contributions (the raw `terms` read
 * `+0.1762452…` / `+2`). The pair list is fixed on purpose — it is the list of
 * seams §5.2 has a read-out for, so a new §5.2 read-out must add its pair here (and
 * thereby regenerates the file). A pair whose levels are missing from the set is an
 * error, never a silent skip.
 *
 * ── HONEST LIMITS ─────────────────────────────────────────────────────────────
 * The report describes **exactly the level directory it was handed**. Pointing
 * `LEVELS_DIR` somewhere else and passing `--report` overwrites the committed
 * artifact with foreign data — which the freshness pin then reports as RED (the
 * per-level hashes and every record move), so it cannot land unnoticed.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import type { DifficultyWeights } from "@/core/solver/difficulty";
import { DIFFICULTY_WEIGHTS } from "@/core/solver/difficulty";
import type { NamedGate } from "@/core/solver/policy";
import { auditLevel } from "@/core/solver/policy";

// ─────────────────────────────────────────────────────────────────────────────
// Paths — both default to the **repo's** shipped set, never to a caller's cwd.
// ─────────────────────────────────────────────────────────────────────────────

/** `src/levels/` — the shipped level set this artifact is about. */
export const SHIPPED_LEVELS_DIR = fileURLToPath(
  new URL("../src/levels/", import.meta.url),
);

/** The committed sidecar (ADR-architecture-0003 Ruling 3 §1). */
export const METRICS_REPORT_PATH = fileURLToPath(
  new URL("../docs/level-difficulty.report.json", import.meta.url),
);

// ─────────────────────────────────────────────────────────────────────────────
// The record shape (a serialization of existing computed fields, nothing new)
// ─────────────────────────────────────────────────────────────────────────────

/** A gate that is *unsatisfiable as written* — attributed to its level. */
export interface MetricsReportEscalation {
  /** The named gate id (e.g. `dual-phase-tiles`). */
  readonly gate: string;
  /** Always `UNSATISFIABLE` today; carried so the entry is self-describing. */
  readonly status: string;
  /** The condition in the words of the design doc / dispatch. */
  readonly label: string;
  /** The measured numbers behind the verdict, as the CLI prints them. */
  readonly detail: string;
}

/** One shipped level's accepted-set record (§8 metrics + §2 breakdown). */
export interface MetricsReportLevel {
  readonly id: number;
  /** File name inside the level directory, e.g. `l001.json`. */
  readonly file: string;

  // ── §8 solver contract (`analyse`) ─────────────────────────────────────────
  readonly solvable: boolean;
  readonly shortestSolution: number | null;
  /** Read back **from the level file** (the gate FAILs on `parMatch === false`). */
  readonly par: number;
  readonly parMatch: boolean;
  readonly reachableStates: number;
  readonly distinctPositions: number;
  readonly maxDepth: number;
  readonly deadStates: number;
  readonly noUnrecoverableOk: boolean;
  readonly unrecoverableStates: number;
  /** #3 — `dualPhaseTiles` count and its tile list. */
  readonly dualPhaseTiles: number;
  readonly dualPhaseTileList: readonly string[];
  /** #7 canonical (unordered) — the pre-L11 acceptance carrier. */
  readonly refusedThenEnteredTiles: number;
  readonly refusedThenEnteredTileList: readonly string[];
  /** #7 ordered companion — the Aha gate (iii) reader. */
  readonly refusedBeforeEnteredTiles: number;
  readonly refusedBeforeEnteredTileList: readonly string[];
  /** LV-004 phantom-walk enumeration. */
  readonly parRoutes: number;
  readonly embedRoutes: number;
  readonly embedForced: boolean;

  // ── §2 difficulty model (`analyseDifficulty`) ──────────────────────────────
  readonly L: number | null;
  readonly B: number;
  readonly T: number;
  readonly R: number;
  readonly M: number;
  /** `null` iff the board is unsolvable (no position on the curve). */
  readonly D: number | null;
  /** The execution axis `D − w5·M` (ADR-design-0001). */
  readonly Dexec: number | null;
  // Diagnostics (§2: "computed but treated as diagnostics, not primary score").
  readonly bRaw: number;
  readonly forcedMoveRatio: number;
  readonly lookaheadDepth: number;
  readonly unrecoverableRatio: number;

  /** Escalations attributable to **this** level (see {@link MetricsReportEscalation}). */
  readonly escalations: readonly MetricsReportEscalation[];
}

/**
 * A consecutive-pair read-out on the §2 axes, decomposed term by term.
 *
 * `terms` are the **raw** movements of the five measured terms (`ΔL`, `ΔB`, …);
 * `contributions` are those movements **weighted** (`w1·ΔL`, `w2·ΔB`, …), so they
 * sum to the read-outs: `deltaDexec` = `L+B+T+R` contributions and `deltaD` =
 * `deltaDexec` + the `M` contribution. The two maps exist because
 * `docs/level-difficulty.md` §5.2 publishes the **weighted** form (`ΔB = +0.528736`
 * is `3 · 0.1762452…`, `ΔM = +10` is `5 · 2`) — carrying only one of them would
 * make the other look like a disagreement. Numbers only: the document's display
 * forms are derived by the mirror test.
 */
export interface MetricsReportSeam {
  readonly from: number;
  readonly to: number;
  /** Raw term movement: `to.term − from.term`, `null` on an unsolvable board. */
  readonly terms: {
    readonly L: number | null;
    readonly B: number;
    readonly T: number;
    readonly R: number;
    readonly M: number;
  };
  /** `w_i · terms[i]` — the decomposition of `deltaD`/`deltaDexec`. */
  readonly contributions: {
    readonly L: number | null;
    readonly B: number;
    readonly T: number;
    readonly R: number;
    readonly M: number;
  };
  /** The `D` seam = the sum of all five contributions. */
  readonly deltaD: number | null;
  /** The `D_exec` seam = the sum of the four non-`M` contributions. */
  readonly deltaDexec: number | null;
}

/** Content-hash provenance — deliberately **not** a git sha (see the module doc). */
export interface MetricsReportProvenance {
  /** The command that wrote the artifact. */
  readonly generator: string;
  /** The module that built it (one implementation, shared with the test pin). */
  readonly builder: string;
  readonly hashAlgorithm: string;
  /** What was hashed, in words. */
  readonly hashInput: string;
  /** `sha256` over the sorted `file:sha256` lines below. */
  readonly datasetHash: string;
  readonly levels: readonly {
    readonly file: string;
    readonly id: number;
    readonly sha256: string;
  }[];
}

/** The whole sidecar: header + records + derived aggregates + provenance. */
export interface MetricsReport {
  /** Sidecar schema id — bump only on a breaking shape change. */
  readonly schema: string;
  readonly generator: string;
  /** `docs/level-difficulty.md` §2's weight vector, so the file is self-describing. */
  readonly weights: DifficultyWeights;
  readonly levels: readonly MetricsReportLevel[];
  readonly seams: readonly MetricsReportSeam[];
  readonly generatedFrom: MetricsReportProvenance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hashing (content, not bytes)
// ─────────────────────────────────────────────────────────────────────────────

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Deterministic, formatting-invariant serialization: object keys sorted
 * recursively, no whitespace. Two files that say the same thing hash the same,
 * whatever a formatter did to their indentation.
 */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
    );
    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/**
 * The content hash of one parsed level file. Exported so the freshness test can
 * re-derive the report's own lineage from the tree **and** hold a mutation
 * control (`par` +1 ⇒ different hash) next to a formatting control (same content,
 * other indentation ⇒ same hash).
 */
export function levelContentHash(raw: unknown): string {
  return sha256(canonicalJson(raw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Building
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The two §5.2 read-out seams, as `[from, to]`. Fixed on purpose: this is the
 * list of seams the difficulty document has a published read-out for, so a new
 * read-out adds its pair here (and regenerates the artifact).
 */
const READOUT_SEAMS: readonly (readonly [number, number])[] = [
  [5, 6], // the latch-block (M1+M3) debut — §5.2's +8.53 / −1.47
  [10, 11], // the M2 (portal) debut — §5.2's −5.07
];

function escalationOf(gate: NamedGate): MetricsReportEscalation {
  return {
    gate: String(gate.id),
    status: gate.status,
    label: gate.label,
    detail: gate.detail,
  };
}

function nullAwareDelta(from: number | null, to: number | null): number | null {
  return from === null || to === null ? null : to - from;
}

/**
 * Build the sidecar for one level directory. Pure: it reads the files and the
 * existing metric functions, and returns the report object — the caller decides
 * whether to write it.
 *
 * A file the schema or the rule gate rejects is an **error**, not a record: the
 * sidecar describes the *accepted* set, and a rejected candidate has no accepted
 * metrics to publish (ADR-0004: reject, never repair).
 */
export function buildMetricsReport(
  levelsDir: string = SHIPPED_LEVELS_DIR,
): MetricsReport {
  const files = readdirSync(levelsDir)
    .filter((name) => name.endsWith(".json"))
    .sort();

  const levels: MetricsReportLevel[] = [];
  const provenance: MetricsReportProvenance["levels"][number][] = [];

  for (const file of files) {
    const raw = JSON.parse(
      readFileSync(join(levelsDir, file), "utf8"),
    ) as unknown;

    const parsed = LevelSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `metrics-report: ${file} is rejected by the level schema — the sidecar ` +
          `records the accepted set only (ADR-0004: reject, never repair)`,
      );
    }
    const verdict = validateLevel(raw);
    if (!verdict.ok) {
      throw new Error(
        `metrics-report: ${file} is rejected by the rule gate ` +
          `(${verdict.errors.join("; ")}) — the sidecar records the accepted set only`,
      );
    }

    const level: Level = parsed.data;
    const audit = auditLevel(level);
    const result = audit.result;
    const breakdown = audit.difficulty;

    levels.push({
      id: level.id,
      file,

      solvable: result.solvable,
      shortestSolution: result.shortestSolution,
      par: level.par,
      parMatch: result.shortestSolution === level.par,
      reachableStates: result.reachableStates,
      distinctPositions: result.distinctPositions,
      maxDepth: result.maxDepth,
      deadStates: result.deadStates,
      noUnrecoverableOk: result.noUnrecoverableOk,
      unrecoverableStates: result.unrecoverableStates,
      dualPhaseTiles: result.dualPhaseTiles,
      dualPhaseTileList: result.dualPhaseTileList,
      refusedThenEnteredTiles: result.refusedThenEnteredTiles,
      refusedThenEnteredTileList: result.refusedThenEnteredTileList,
      refusedBeforeEnteredTiles: result.refusedBeforeEnteredTiles,
      refusedBeforeEnteredTileList: result.refusedBeforeEnteredTileList,
      parRoutes: audit.embeds.parRoutes,
      embedRoutes: audit.embeds.embedRoutes,
      embedForced: audit.embeds.embedForced,

      L: breakdown.L,
      B: breakdown.B,
      T: breakdown.T,
      R: breakdown.R,
      M: breakdown.M,
      D: breakdown.D,
      Dexec: breakdown.Dexec,
      bRaw: breakdown.bRaw,
      forcedMoveRatio: breakdown.forcedMoveRatio,
      lookaheadDepth: breakdown.lookaheadDepth,
      unrecoverableRatio: breakdown.unrecoverableRatio,

      // A gate that is unsatisfiable *as written* is an escalation, not a level
      // failure (the CLI prints it the same way) — attributed to the level whose
      // declared gates produced it (today: exactly one, l008's `dual-phase-tiles`,
      // resolved at L11 by ADR-0009's M2 schedule).
      escalations: audit.gates
        .filter((gate) => gate.status === "UNSATISFIABLE")
        .map(escalationOf),
    });

    provenance.push({
      file,
      id: level.id,
      sha256: levelContentHash(raw),
    });
  }

  const byId = new Map(levels.map((record) => [record.id, record]));
  const seams: MetricsReportSeam[] = READOUT_SEAMS.map(([from, to]) => {
    const a = byId.get(from);
    const b = byId.get(to);
    if (a === undefined || b === undefined) {
      throw new Error(
        `metrics-report: the §5.2 read-out seam L${String(from)}→L${String(to)} ` +
          `is not in the level set (${files.length} file(s)) — the pair list in ` +
          `scripts/metrics-report.ts must be updated deliberately, never skipped`,
      );
    }
    const terms = {
      L: nullAwareDelta(a.L, b.L),
      B: b.B - a.B,
      T: b.T - a.T,
      R: b.R - a.R,
      M: b.M - a.M,
    };
    // Weighted exactly as `D` weights them (§2's `DIFFICULTY_WEIGHTS`), so the two
    // sums below reproduce the published seam instead of approximating it.
    const contributions = {
      L: terms.L === null ? null : DIFFICULTY_WEIGHTS.L * terms.L,
      B: DIFFICULTY_WEIGHTS.B * terms.B,
      T: DIFFICULTY_WEIGHTS.T * terms.T,
      R: DIFFICULTY_WEIGHTS.R * terms.R,
      M: DIFFICULTY_WEIGHTS.M * terms.M,
    };
    const execution =
      contributions.L === null
        ? null
        : contributions.L + contributions.B + contributions.T + contributions.R;
    return {
      from,
      to,
      terms,
      contributions,
      deltaD: execution === null ? null : execution + contributions.M,
      deltaDexec: execution,
    };
  });

  return {
    schema: "level-difficulty-report/1",
    generator: "node_modules/.bin/tsx scripts/solve-levels.ts --report",
    weights: DIFFICULTY_WEIGHTS,
    levels,
    seams,
    generatedFrom: {
      generator: "scripts/solve-levels.ts --report",
      builder: "scripts/metrics-report.ts",
      hashAlgorithm: "sha256",
      hashInput:
        "canonical JSON of each parsed level file (object keys sorted recursively, whitespace-insensitive) — a content hash, not a git sha, so the report is reproducible across worktrees",
      datasetHash: sha256(
        provenance.map((entry) => `${entry.file}:${entry.sha256}`).join("\n"),
      ),
      levels: provenance,
    },
  };
}

/**
 * The exact bytes written to disk: `JSON.stringify(…, null, 2)` plus a trailing
 * newline. Key order is the construction order above, which is fixed by the code
 * (never by a map iteration), so two builds of the same tree are byte-identical.
 * Exported so the test can assert byte-equality instead of only deep-equality.
 */
export function serializeMetricsReport(report: MetricsReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

/** Write the sidecar. Returns the report so a caller can report on it. */
export function writeMetricsReport(
  levelsDir: string = SHIPPED_LEVELS_DIR,
  outFile: string = METRICS_REPORT_PATH,
): MetricsReport {
  const report = buildMetricsReport(levelsDir);
  writeFileSync(outFile, serializeMetricsReport(report), "utf8");
  return report;
}
