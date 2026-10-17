/**
 * LV-007E — the metrics **sidecar** and its freshness pin
 * (ADR-architecture-0003 **Ruling 3**).
 *
 * ── WHAT THIS FILE GUARDS ────────────────────────────────────────────────────
 * `docs/level-difficulty.report.json` is a *generated* artifact: one record per
 * shipped level carrying the §8 solver contract and the §2 breakdown that
 * `scripts/solve-levels.ts` already computes. `docs/level-difficulty.md` §5.2 is its
 * **declared human mirror**. Both were hand-mirrored before this ticket, and that is
 * a drift class with two prior incidents (the divergence-rate figure of
 * ADR-architecture-0003 Ruling 1, and the §3 stale rows withdrawn at LV-007C). The
 * pin is therefore deliberately blunt:
 *
 *  1. **Freshness (§1).** The report is rebuilt from `src/levels/*.json` and the
 *     shipped metric functions and compared **byte for byte** with the committed
 *     file. Editing a board, a weight (`DIFFICULTY_WEIGHTS`) or any metric code
 *     without re-running `node_modules/.bin/tsx scripts/solve-levels.ts --report`
 *     turns this file RED at exactly the commit that caused it.
 *  2. **The mirror (§2).** §5.2's table rows are parsed out of the document and
 *     compared to the report at the precision the document prints (2 dp for
 *     `D`/`D_exec`, 4 dp for `B`) — so a prose-only edit of a published number can
 *     no longer land, and the table cannot drift from the artifact it mirrors.
 *  3. **Non-vacuity (§4).** The report is cross-checked against the **independently
 *     hand-pinned** `PINS` table in `tests/solver/difficulty.test.ts` (re-read from
 *     source: that file is another ticket's territory and is never edited here).
 *     Without this, a bug in the report *builder* would agree with itself.
 *
 * Nothing in this file invents a metric, and nothing here re-implements a rule: the
 * builder calls the same `auditLevel` the CLI gate calls.
 */

import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import { LevelSchema } from "@/core/level";
import { mechanicsCount } from "@/core/solver/difficulty";
import type {
  MetricsReport,
  MetricsReportSeam,
} from "../../scripts/metrics-report";
import {
  METRICS_REPORT_PATH,
  SHIPPED_LEVELS_DIR,
  buildMetricsReport,
  levelContentHash,
  serializeMetricsReport,
} from "../../scripts/metrics-report";
import {
  EXPECTED_LEVEL_COUNT,
  discoveredFileIds,
} from "../e2e/helpers/levels";

// ─────────────────────────────────────────────────────────────────────────────
// Inputs — the committed artifact, the mirror document, the independent pins
// ─────────────────────────────────────────────────────────────────────────────

const DOC_PATH = fileURLToPath(
  new URL("../../docs/level-difficulty.md", import.meta.url),
);
const DIFFICULTY_TEST_PATH = fileURLToPath(
  new URL("./difficulty.test.ts", import.meta.url),
);

/** Slice between two anchors, failing loudly when a doc/test anchor moves. */
function sliceBetween(text: string, from: string, to: string): string {
  const start = text.indexOf(from);
  const end = start < 0 ? -1 : text.indexOf(to, start);
  if (start < 0 || end < 0)
    throw new Error(`metrics-sidecar: anchor not found — ${from} … ${to}`);
  return text.slice(start, end);
}

const COMMITTED = readFileSync(METRICS_REPORT_PATH, "utf8");
const REPORT = JSON.parse(COMMITTED) as MetricsReport;
/** The report as the current tree computes it — the whole point of the pin. */
const REBUILT = buildMetricsReport();
const REBUILT_BYTES = serializeMetricsReport(REBUILT);

const DOC = readFileSync(DOC_PATH, "utf8");
const SECTION_52 = sliceBetween(DOC, "### 5.2 ", "### 5.3 ");
const PINS_SOURCE = readFileSync(DIFFICULTY_TEST_PATH, "utf8");

/** The document writes its minus sign as U+2212, not ASCII hyphen. */
const MINUS = "\u2212";
function docSigned(value: number, digits: number): string {
  const text = value.toFixed(digits);
  return text.startsWith("-") ? `${MINUS}${text.slice(1)}` : text;
}

// ─────────────────────────────────────────────────────────────────────────────
// §5.2's published table, parsed from the document
// ─────────────────────────────────────────────────────────────────────────────

interface PublishedRow {
  readonly id: number;
  readonly cells: readonly string[];
}

/** The §5.2 table's data rows (header + separator dropped, `**` emphasis stripped). */
const PUBLISHED_ROWS: readonly PublishedRow[] = SECTION_52.split("\n")
  .filter((line) => line.trimStart().startsWith("|"))
  .slice(2)
  .map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/\*\*/g, ""));
    const label = cells[0] ?? "";
    const match = /^L(\d+)/.exec(label);
    if (match === null)
      throw new Error(`metrics-sidecar: unparsable §5.2 row: ${line}`);
    return { id: Number(match[1]), cells };
  });

// ─────────────────────────────────────────────────────────────────────────────
// difficulty.test.ts's hand-typed PINS — re-read, never edited, never duplicated
// ─────────────────────────────────────────────────────────────────────────────

interface HandPin {
  readonly L: number;
  readonly B: number;
  readonly M: number;
  readonly D: number;
  readonly dexec: number;
}

function parseHandPins(source: string): ReadonlyMap<number, HandPin> {
  const block = sliceBetween(source, "const PINS", "};");
  const pattern =
    /^\s*(\d+): \{ L: (\d+), B: ([\d.]+), T: (\d+), R: (\d+), M: (\d+), D: ([\d.]+), dexec: ([\d.]+),/gm;
  const pins = new Map<number, HandPin>();
  for (const match of block.matchAll(pattern)) {
    pins.set(Number(match[1]), {
      L: Number(match[2]),
      B: Number(match[3]),
      M: Number(match[6]),
      D: Number(match[7]),
      dexec: Number(match[8]),
    });
  }
  return pins;
}

const HAND_PINS = parseHandPins(PINS_SOURCE);

function seamOf(
  report: MetricsReport,
  from: number,
  to: number,
): MetricsReportSeam {
  const seam = report.seams.find(
    (entry) => entry.from === from && entry.to === to,
  );
  if (seam === undefined)
    throw new Error(`metrics-sidecar: no read-out seam L${from}→L${to}`);
  return seam;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Freshness — the committed file IS the current tree, byte for byte
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 §1 — the sidecar is fresh: the committed bytes are what the tree computes", () => {
  it("the committed file is byte-identical to a rebuild (key order, indentation, trailing newline)", () => {
    // A board edit, a weight re-calibration or a solver change without
    // `--report` fails here — the RED mechanism Ruling 3 asked for.
    expect(REBUILT_BYTES).toBe(COMMITTED);
  });

  it("…and deep-equal, so a shape drift cannot hide inside stable text", () => {
    expect(REBUILT).toEqual(REPORT);
  });

  it("the emit is reproducible: two builds of the same tree serialize identically", () => {
    expect(serializeMetricsReport(buildMetricsReport())).toBe(REBUILT_BYTES);
    // No wall clock and no git sha in the payload — otherwise two runs (or two
    // worktrees at the same commit) could not be byte-compared at all.
    expect(COMMITTED).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(COMMITTED).not.toMatch(
      /"(generatedAt|generated_at|timestamp|capturedAt)"/,
    );
  });

  it("the CLI's stdout dump is not part of this artifact (the report adds no print)", () => {
    // The sidecar is written silently by `--report`; the frozen per-level dump is
    // asserted byte-identical to the pre-LV-007E baseline in the task's battery.
    // What this file can pin is that the report carries no ANSI/CSV dump text.
    expect(COMMITTED).not.toContain("PASS l0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The records are the accepted set, and each one is self-consistent
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 §1 — the records: the accepted set, complete and self-consistent", () => {
  it("one record per shipped level, in file order, with no extras", () => {
    const files = readdirSync(SHIPPED_LEVELS_DIR)
      .filter((name) => name.endsWith(".json"))
      .sort();
    expect(REPORT.levels.length).toBe(files.length);
    // Non-vacuity tooth: the shared dataset pin (`EXPECTED_LEVEL_COUNT`, the one
    // hand-typed count in `tests/**`) — an empty — or a silently shrunken — report
    // still fails, and QA-011 replaced the stale `15` literal with the pin so the
    // census has a single source.
    expect(REPORT.levels.length).toBe(EXPECTED_LEVEL_COUNT);
    expect(REPORT.levels.map((record) => record.file)).toEqual(files);
    // …and the record order is the dataset's own file order, taken from the fs scan
    // rather than retyped here (the `[1…15]` literal QA-011 retired).
    expect(REPORT.levels.map((record) => record.id)).toEqual(discoveredFileIds());
  });

  it("every record re-satisfies the §2 identity from its own terms (no hidden term)", () => {
    expect(REPORT.weights).toEqual({ L: 1, B: 3, T: 4, R: 2, M: 5 });
    for (const record of REPORT.levels) {
      const tag = `l${String(record.id).padStart(3, "0")}`;
      expect(record.solvable, tag).toBe(true);
      expect(record.parMatch, tag).toBe(true);
      expect(record.L, tag).toBe(record.shortestSolution);
      expect(record.D, tag).toBeCloseTo(
        REPORT.weights.L * (record.L as number) +
          REPORT.weights.B * record.B +
          REPORT.weights.T * record.T +
          REPORT.weights.R * record.R +
          REPORT.weights.M * record.M,
        12,
      );
      // The execution axis, in both published forms (§2b): never a second metric.
      expect(record.Dexec, tag).toBeCloseTo(
        (record.D as number) - REPORT.weights.M * record.M,
        12,
      );
      expect(record.Dexec, tag).toBeCloseTo(
        (record.L as number) + REPORT.weights.B * record.B,
        12,
      );
      expect({ T: record.T, R: record.R }, tag).toEqual({ T: 0, R: 0 });
      expect(record.noUnrecoverableOk, tag).toBe(true);
      expect(record.deadStates, tag).toBe(0);
      expect(record.lookaheadDepth, tag).toBe((record.L as number) - 1);
    }
  });

  it("`M` is the raw board's mechanic count — a second, independent derivation", () => {
    for (const record of REPORT.levels) {
      const raw = JSON.parse(
        readFileSync(join(SHIPPED_LEVELS_DIR, record.file), "utf8"),
      ) as unknown;
      const level = LevelSchema.parse(raw) as Level;
      expect(record.M, record.file).toBe(mechanicsCount(level));
      expect(record.par, record.file).toBe(level.par);
    }
  });

  it("the tile-keyed lists are consistent with their counts, and L11 is the M2 board", () => {
    for (const record of REPORT.levels) {
      expect(record.dualPhaseTileList.length, record.file).toBe(
        record.dualPhaseTiles,
      );
      expect(record.refusedThenEnteredTileList.length, record.file).toBe(
        record.refusedThenEnteredTiles,
      );
      expect(record.refusedBeforeEnteredTileList.length, record.file).toBe(
        record.refusedBeforeEnteredTiles,
      );
      // The ordered companion is a subset of the canonical (unordered) one.
      expect(record.refusedBeforeEnteredTiles, record.file).toBeLessThanOrEqual(
        record.refusedThenEnteredTiles,
      );
    }
    const l11 = REPORT.levels[10];
    expect(l11?.dualPhaseTiles).toBe(21);
    expect(l11?.M).toBe(4);
    expect(l11?.Dexec?.toFixed(2)).toBe("8.57");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. The derived aggregates reproduce §5.2's published read-outs
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 §1 — the derived seams reproduce the read-outs §5.2 publishes", () => {
  it("the L5→L6 latch seam: +8.528736 on `D`, −1.47 on `D_exec`, decomposed", () => {
    const seam = seamOf(REPORT, 5, 6);
    // Raw term movement…
    expect(seam.terms.L).toBe(-2);
    expect(seam.terms.M).toBe(2);
    // …and its weighted contribution, which is what §5.2 publishes.
    expect(seam.contributions.L).toBe(-2);
    expect(seam.contributions.B.toFixed(6)).toBe("0.528736");
    expect(seam.contributions.M).toBe(10);
    expect(seam.deltaD?.toFixed(6)).toBe("8.528736");
    expect(seam.deltaDexec?.toFixed(2)).toBe("-1.47");
    // The document's own display forms, with the document's minus sign.
    expect(DOC).toContain(docSigned(seam.deltaDexec as number, 2));
    expect(SECTION_52).toContain(
      `Δ **${docSigned(seam.deltaDexec as number, 2)}**`,
    );
    expect(DOC).toContain(`+${(seam.deltaD as number).toFixed(6)}`);
  });

  it("the L10→L11 M2 seam: −5.07 on `D_exec` while the total axis barely moves", () => {
    const seam = seamOf(REPORT, 10, 11);
    expect(seam.terms.L).toBe(-5);
    expect(seam.terms.M).toBe(1); // M 3 → 4: the mechanic debut
    expect(seam.contributions.M).toBe(5);
    expect(seam.deltaDexec?.toFixed(2)).toBe("-5.07");
    expect(seam.deltaD?.toFixed(6)).toBe("-0.069686");
    expect(DOC).toContain(docSigned(seam.deltaDexec as number, 2));
    expect(DOC).toContain(docSigned(seam.deltaD as number, 6));
  });

  it("the contributions sum to the read-outs — the seam is a decomposition, not a measurement", () => {
    for (const seam of REPORT.seams) {
      const { L, B, T, R, M } = seam.contributions;
      expect(L, `L${seam.from}→L${seam.to}`).not.toBeNull();
      const execution = (L as number) + B + T + R;
      expect(seam.deltaDexec, `L${seam.from}→L${seam.to}`).toBeCloseTo(
        execution,
        12,
      );
      expect(seam.deltaD, `L${seam.from}→L${seam.to}`).toBeCloseTo(
        execution + M,
        12,
      );
    }
  });

  it("the pair list is exactly the seams §5.2 has a read-out for", () => {
    expect(REPORT.seams.map((seam) => [seam.from, seam.to])).toEqual([
      [5, 6],
      [10, 11],
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. The mirror — §5.2's table rows equal the report at the published precision
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 — `docs/level-difficulty.md` §5.2 is a declared mirror of the report", () => {
  it("§5.2 declares the mirror and names both artifacts", () => {
    expect(SECTION_52).toContain("docs/level-difficulty.report.json");
    expect(SECTION_52).toContain("tests/solver/metrics-sidecar.test.ts");
  });

  it("the table has one row per record — no row invented, none dropped", () => {
    expect(PUBLISHED_ROWS.length).toBe(REPORT.levels.length);
    expect(PUBLISHED_ROWS.map((row) => row.id)).toEqual(
      REPORT.levels.map((record) => record.id),
    );
  });

  it.each(
    REPORT.levels.map((record) => [String(record.id), record.id] as const),
  )("L%s — every published cell equals the report", (_label, id) => {
    const row = PUBLISHED_ROWS.find((entry) => entry.id === id);
    const record = REPORT.levels.find((entry) => entry.id === id);
    expect(row, `l${id} row`).toBeDefined();
    expect(record, `l${id} record`).toBeDefined();
    // Columns: L | B | T | R | M | D | D_exec | lookaheadDepth (definitions in §2a).
    expect(row?.cells[1], "L").toBe(String(record?.L));
    expect(row?.cells[2], "B").toBe((record?.B as number).toFixed(4));
    expect(row?.cells[3], "T").toBe(String(record?.T));
    expect(row?.cells[4], "R").toBe(String(record?.R));
    expect(row?.cells[5], "M").toBe(String(record?.M));
    expect(row?.cells[6], "D").toBe((record?.D as number).toFixed(2));
    expect(row?.cells[7], "D_exec").toBe((record?.Dexec as number).toFixed(2));
    expect(row?.cells[8], "lookaheadDepth").toBe(
      String(record?.lookaheadDepth),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Non-vacuity — an independently hand-pinned table agrees with the report
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 — the report agrees with the hand-typed pins (a builder bug cannot agree with itself)", () => {
  it("the pin table was really parsed (one row per shipped level, no silent empty match)", () => {
    // The measured table lives in `tests/solver/difficulty.test.ts`; its size must be
    // the dataset pin, so the cross-check below cannot go vacuous by parsing nothing
    // (or by the table keeping the old 15 rows while the report grows).
    expect(HAND_PINS.size).toBe(EXPECTED_LEVEL_COUNT);
    expect([...HAND_PINS.keys()].sort((a, b) => a - b)).toEqual(
      REPORT.levels.map((record) => record.id),
    );
  });

  it("every report row matches `tests/solver/difficulty.test.ts` PINS", () => {
    for (const record of REPORT.levels) {
      const pin = HAND_PINS.get(record.id);
      const tag = `l${record.id}`;
      expect(pin, tag).toBeDefined();
      expect(record.L, tag).toBe(pin?.L);
      expect(record.M, tag).toBe(pin?.M);
      expect(record.B, tag).toBeCloseTo(pin?.B as number, 4);
      expect(record.D, tag).toBeCloseTo(pin?.D as number, 6);
      expect(record.Dexec, tag).toBeCloseTo(pin?.dexec as number, 6);
    }
  });

  it("the published `D_exec` column is the pinned 2-dp list — L11 = 8.57 included", () => {
    expect(
      REPORT.levels.map((record) => (record.Dexec as number).toFixed(2)),
    ).toEqual([
      "9.00",
      "10.06",
      "10.29",
      "10.58",
      "10.33",
      "8.86",
      "7.75",
      "10.50",
      "12.14",
      "13.64",
      "8.57",
      // LV-009-B — the L12–L15 block, in dataset order (the dip's second beat and the
      // block-end row that clears the frozen 13.64 floor).
      "8.23",
      "10.90",
      "12.96",
      "14.97",
      // R-003c — the L16–L19 block: the registered rungs' measured execution axis
      // (the same column `docs/level-difficulty.md` §5.2 prints).
      "17.10",
      "19.03",
      "20.91",
      "22.89",
      // QA-014 — R-003d's terminal rung (the sealed landing): 24.729412, the first
      // value past L19, mirrored out of the *other* file's table again below.
      "24.73",
      // R-004a — Act II batch 1, dataset order: the five registered rungs' measured
      // execution axis (21.581395 / 22.584000 / 24.620000 / 25.604651 / 27.604651),
      // mirrored out of `tests/solver/difficulty.test.ts`'s table (this file's own
      // parsed `HAND_PINS`), so the builder still cannot agree with itself.
      "21.58",
      "22.58",
      "24.62",
      "25.60",
      "27.60",
    ]);
    expect(HAND_PINS.get(11)?.dexec.toFixed(2)).toBe("8.57");
    expect(HAND_PINS.get(12)?.dexec.toFixed(2)).toBe("8.23");
    expect(HAND_PINS.get(15)?.dexec.toFixed(2)).toBe("14.97");
    // …and the four registered rungs were parsed out of the *other* file's table, so
    // the mirror above is checked against a table the report builder never wrote.
    expect(HAND_PINS.get(16)?.dexec.toFixed(2)).toBe("17.10");
    expect(HAND_PINS.get(19)?.dexec.toFixed(2)).toBe("22.89");
    // QA-014 — and the terminal rung's row with them, so the census pin and the
    // mirror are re-taken together (the builder cannot agree with itself here).
    expect(HAND_PINS.get(20)?.dexec.toFixed(2)).toBe("24.73");
    // R-004a — Act II batch 1's open and peak rows, so the five new mirrors are read
    // from the parsed table on both ends (the batch's `D_exec` band edges).
    expect(HAND_PINS.get(21)?.dexec.toFixed(2)).toBe("21.58");
    expect(HAND_PINS.get(25)?.dexec.toFixed(2)).toBe("27.60");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Escalations are attributed per level (the standing l008 producer)
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 §1 — escalations are attributable, and there is exactly one", () => {
  it("the only escalation is l008's `dual-phase-tiles`, unsatisfiable as written", () => {
    const withEscalation = REPORT.levels.filter(
      (record) => record.escalations.length > 0,
    );
    expect(withEscalation.map((record) => record.id)).toEqual([8]);
    const escalation = withEscalation[0]?.escalations[0];
    expect(escalation?.gate).toBe("dual-phase-tiles");
    expect(escalation?.status).toBe("UNSATISFIABLE");
    expect(escalation?.label).toContain("dualPhaseTiles ≥ 1");
    expect(escalation?.detail).toContain("portal-free");
    // …and it is an escalation on exactly one board: the count the CLI prints.
    expect(
      REPORT.levels.reduce(
        (total, record) => total + record.escalations.length,
        0,
      ),
    ).toBe(1);
  });

  it("L11 resolves it by measurement: the same gate PASSES there and is not escalated", () => {
    const l11 = REPORT.levels[10];
    expect(l11?.dualPhaseTiles).toBeGreaterThan(0);
    expect(l11?.escalations).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Provenance — a content hash of the tree (not a git sha), with its controls
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-007E · R3 §1 — `generatedFrom` is a content hash of the level tree", () => {
  it("every per-file hash re-derives from the shipped file it names", () => {
    const provenance = REPORT.generatedFrom.levels;
    expect(provenance.length).toBe(REPORT.levels.length);
    for (const entry of provenance) {
      const raw = JSON.parse(
        readFileSync(join(SHIPPED_LEVELS_DIR, entry.file), "utf8"),
      ) as unknown;
      expect(entry.sha256, entry.file).toBe(levelContentHash(raw));
      expect(entry.sha256, entry.file).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(REPORT.generatedFrom.datasetHash).toMatch(/^[0-9a-f]{64}$/);
    expect(REPORT.generatedFrom.datasetHash).not.toBe(
      REPORT.generatedFrom.levels[0]?.sha256,
    );
  });

  it("no git sha anywhere in the payload (it would red the pin on unrelated commits)", () => {
    expect(COMMITTED).not.toMatch(/\b[0-9a-f]{40}\b/);
    expect(COMMITTED).not.toContain("HEAD");
    expect(REPORT.generatedFrom.hashInput).toContain("not a git sha");
  });

  /** A throwaway copy of the shipped set — the builder is a pure function of a dir. */
  function withCopiedLevels(
    transform: (file: string, raw: unknown) => { text: string },
  ): MetricsReport {
    const dir = mkdtempSync(join(tmpdir(), "lv007e-sidecar-"));
    try {
      for (const name of readdirSync(SHIPPED_LEVELS_DIR).filter((f) =>
        f.endsWith(".json"),
      )) {
        const raw = JSON.parse(
          readFileSync(join(SHIPPED_LEVELS_DIR, name), "utf8"),
        ) as unknown;
        writeFileSync(join(dir, name), transform(name, raw).text, "utf8");
      }
      return buildMetricsReport(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("a board change moves the hash AND the record — the freshness mechanism, demonstrated", () => {
    const mutated = withCopiedLevels((file, raw) => ({
      text:
        file === "l001.json"
          ? JSON.stringify(
              { ...(raw as Level), par: (raw as Level).par + 1 },
              null,
              2,
            )
          : JSON.stringify(raw, null, 2),
    }));
    expect(mutated.generatedFrom.datasetHash).not.toBe(
      REPORT.generatedFrom.datasetHash,
    );
    expect(mutated.generatedFrom.levels[0]?.sha256).not.toBe(
      REPORT.generatedFrom.levels[0]?.sha256,
    );
    expect(mutated.levels[0]?.par).toBe((REPORT.levels[0]?.par as number) + 1);
    expect(mutated.levels[0]?.parMatch).toBe(false);
    // Surgical: only the board that moved, and no other record.
    expect(mutated.levels.slice(1)).toEqual(REPORT.levels.slice(1));
    expect(serializeMetricsReport(mutated)).not.toBe(REBUILT_BYTES);
  });

  it("a formatting-only rewrite does NOT move the hash (the pin is content-sensitive, not byte-sensitive)", () => {
    // `npm run format` currently rewrites `src/levels/*.json` (they are not
    // prettier-clean today), so a byte-level hash would red this pin for a
    // whitespace change that moves no metric. Canonical content is the contract.
    const reformatted = withCopiedLevels((_file, raw) => ({
      text: JSON.stringify(raw, null, 4),
    }));
    expect(reformatted.generatedFrom.datasetHash).toBe(
      REPORT.generatedFrom.datasetHash,
    );
    expect(reformatted.generatedFrom.levels).toEqual(
      REPORT.generatedFrom.levels,
    );
    expect(reformatted.levels).toEqual(REPORT.levels);
  });
});
