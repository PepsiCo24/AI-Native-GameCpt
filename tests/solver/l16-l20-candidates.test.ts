/**
 * `tests/solver/l16-l20-candidates.test.ts` — the durable pin on the L16–L20
 * registered root block (QA-011, retargeted from the pre-registration candidate
 * shelf; QA-014 extended to the registered terminal rung; QA-018 re-booked the shelf
 * to the Act II batch-1 ids, QA-025 to the Act II batch-2 ids and QA-026 to the ten-name
 * Act II batch-2 + batch-3 shelf).
 *
 * Why this file exists: `scripts/author-l16-candidates.ts` proposes and
 * `scripts/prove-candidate.ts` proves, but both are *runs* — their output lives in
 * a terminal, and a terminal is not a regression gate. This suite re-measures the
 * same obligations from the landed bytes on every `vitest run`, using only the
 * shipped readers (`@/core/level` + `@/core/solver/*`). Nothing here is compared
 * against a number typed by the author: `par` is stamped by `analyse`, the cut and
 * the rung come from the shipped rows *below the block*, and the band is re-derived
 * from that same pre-block set.
 *
 * Scope boundary (QA-011 / R-003c landed, QA-014 / R-003d closed): the block is
 * **registered**. The five members live in `src/levels/` root and the lessons that
 * carry the `block-l1619` obligation are their registry rows, so this suite walks the
 * root set and derives `BLOCK_IDS` from `documentedLesson(id)?.obligation` — never from
 * a typed 16–20.
 * The candidate shelf (`src/levels/candidates/`) is asserted to hold **exactly the
 * booked pre-registration set** — `[]` since R-005c, because R-005a graduated the ten
 * Act II ids `l026`–`l035` to the dataset root (QA-026 had booked those ten: LV-014
 * wrote `l026`–`l030` fresh and unregistered, LV-015 posted `l031`–`l035` beside them,
 * merged at `afeb5262d`; QA-025's five-id booking `l026`–`l030`, QA-018's batch-1
 * booking `l021`–`l025` and QA-014's `[]` after R-003d are the same pin's earlier
 * readings) — and
 * only rungs *derived strictly above the registered root max*: the shelf's role is to
 * hold a proven candidate *while its rung is above the registered dataset* (QA-012;
 * R-003c moved l016–l019 off it, LV-011 → R-003d moved the landing rung off it last,
 * LV-012 posted the Act II batch, LV-014 batch 2, LV-015 batch 3). That is a **derived rung relation, never a ceiling
 * claim about any device** — `docs/project-status.md` item 114: the pocket census is
 * unmeasured at ≥ 11, so no ceiling may be published in either direction, and the law
 * binds test prose too. A shelf file at or below the registered root max is a root row
 * hiding outside the census, and the pin below still catches it **as a live guard, not
 * as a count**: the booking is asserted by set equality, so a stray candidate is still
 * caught.
 *
 * Why the pre-block filter matters: the block's own rows clear the cut by design
 * (`D_exec` 17.1 … 22.9) and `l016` carries the one NAMED `B` excursion (1.7000).
 * Deriving the cut/band over the *whole* dataset would let the block raise the filter
 * it is judged by — the one thing `docs/level-design.md` §6.1.1 forbids. The window is
 * therefore `id < min(BLOCK_IDS)`, read from the registry, not a typed `15`.
 *
 * Evidence policy (AGENTS.md §7): this suite is the proof, so it must not be able to
 * pass vacuously — every structural obligation carries a **negative control** in the
 * last block, and the controls are asserted to be *rejected* by the same readers that
 * accept the real members.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import { LevelSchema, validateLevel } from "@/core/level";
import { analyse, explore } from "@/core/solver/bfs";
import { analyseDifficulty } from "@/core/solver/difficulty";
import {
  allOffShortestSolution,
  ACT_II_REGISTERED_IDS,
  ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID,
  auditLevel,
  BLOCK_L1619_IDS,
  BLOCK_L1619_NAMED_B_EXCURSIONS,
  documentedLesson,
} from "@/core/solver/policy";
import { EXPECTED_LEVEL_COUNT } from "../e2e/helpers/levels";

const LEVELS_DIR = new URL("../../src/levels/", import.meta.url).pathname;
const CANDIDATES_DIR = join(LEVELS_DIR, "candidates");

const readLevel = (dir: string, file: string): Level =>
  LevelSchema.parse(JSON.parse(readFileSync(join(dir, file), "utf8"))) as Level;

const shipped = readdirSync(LEVELS_DIR)
  .filter((n) => /^l\d+\.json$/.test(n))
  .sort()
  .map((f) => readLevel(LEVELS_DIR, f));

/**
 * The block's members, **derived from the registry**: a root row is a member when
 * its documented lesson carries the `block-l1619` obligation. Adding, moving or
 * dropping a member moves this list and every obligation below with it.
 */
const BLOCK_IDS: readonly number[] = shipped
  .map((level) => level.id)
  .filter((id) => documentedLesson(id)?.obligation === "block-l1619")
  .sort((a, b) => a - b);

/** The published rung ladder (`policy.ts`) must name exactly the registered rows. */
const BLOCK_MIN = Math.min(...BLOCK_IDS);
const PRE_BLOCK = shipped.filter((level) => level.id < BLOCK_MIN);

/**
 * The two constants the block law is measured against, **both from the pre-block
 * set**: the escalation cut (the maximum `D_exec` over everything already shipped
 * before the block) and the block's first rung (`par` of the last pre-block row).
 * Neither is typed here — the `attest-lv010-cut` transcript of `a19a347` proved these
 * exact values on the isolated dataset, and this suite re-derives them on the live
 * files *below the block*.
 */
const preBlockMetrics = PRE_BLOCK.map((level) => ({
  level,
  diff: analyseDifficulty(level, explore(level)),
}));
const cut = Math.max(
  ...preBlockMetrics.map((m) => m.diff.Dexec ?? Number.NEGATIVE_INFINITY),
);
const l15Par = PRE_BLOCK.at(-1)?.par ?? 0;
/** The band §6.1.1 P2 publishes for `B` — re-measured on the pre-block set, not imported. */
const bBand: readonly [number, number] = [
  Math.min(...preBlockMetrics.map((m) => m.diff.B)),
  Math.max(...preBlockMetrics.map((m) => m.diff.B)),
];

describe("L16–L20 block — derived obligations, re-measured per run", () => {
  it("re-derives the cut, the first rung and the band from the pre-block set (the obligations are measured, not typed)", () => {
    expect(PRE_BLOCK).toHaveLength(15);
    expect(l15Par).toBe(10);
    expect(cut).toBeCloseTo(14.969697, 6);
    expect(bBand).toEqual([1.25, 1.6875]);
    // …and the boundary is the registry's, not a typed 16: the pre-block window stops
    // exactly one rung below the first registered member.
    expect(PRE_BLOCK.at(-1)?.id).toBe(BLOCK_MIN - 1);
  });

  it("is registered as the L16–L20 ladder the law publishes, above a shelf booked by set equality that is a live guard, not a count", () => {
    // The five rows the `block-l1619` obligation names are exactly `BLOCK_L1619_IDS`.
    expect([...BLOCK_IDS]).toEqual([...BLOCK_L1619_IDS]);
    // Contiguous, one rung per id, id === file name — a mis-named rung would break
    // the `SHIPPED_IDS`-style readers the moment they read it.
    for (let i = 0; i < BLOCK_IDS.length; i += 1) {
      const id = BLOCK_IDS[i] as number;
      expect(id).toBe(BLOCK_MIN + i);
    }
    for (const id of BLOCK_IDS) {
      const file = `l${String(id).padStart(3, "0")}.json`;
      expect(
        existsSync(join(LEVELS_DIR, file)),
        `l${id} is a registered member and must live in the root set`,
      ).toBe(true);
    }
  });

  /**
   * The booked shelf, **named once**: the candidates that a pre-registration
   * transcript measured and proved while their rung sat above the registered root max
   * (`l016`–`l019` on the R-003c lineage, `l020` on LV-011's, `l021`–`l025` on the
   * Act II batch-1 lineage, `l026`–`l030` on LV-014's batch-2 lineage and `l031`–`l035`
   * on LV-015's batch-3 lineage — the first three
   * registered at the root since, which is why every booking since QA-014 was `[]` until
   * QA-025). Registering a candidate moves it to
   * `src/levels/` *and* off this list, in the same commit — so this pin cannot
   * silently absorb a new shelf file, and a *missing* booked file fails too.
   *
   * **QA-025 booked the five LV-014 ids.** R-004c's booking was `[]` (R-004a had
   * registered `l021`–`l025` — proof in `scripts/prove-candidate-l2125.transcript.md` —
   * leaving the shelf empty), and LV-014 then occupied the shelf with Act II batch 2:
   * `l026.json`–`l030.json`, written fresh, proven on the shelf and **unregistered**.
   * **QA-026 booked the ten Act II ids `l026`–`l035`**, because LV-015 posted batch 3
   * beside batch 2 — `l031.json`–`l035.json`, proven on the shelf and **unregistered**
   * (`scripts/prove-candidate-l3135.transcript.md` §5 measures the shelf as ten files,
   * `10/10 PASS`) — and the merge `afeb5262d` landed all ten at once: a five-name literal
   * over a ten-file shelf was the one red this suite carried (byte-shape
   * `expected [ 'l026.json', 'l027.json', …(8) ] to deeply equal [ 'l026.json', 'l027.json', …(3) ]`),
   * so the literal is re-booked to the set the shelf actually holds.
   *
   * **R-005c re-books it to `[]` — the EMPTY shelf, again.** R-005a graduated all ten
   * batch-2 + batch-3 rungs to the dataset root (`git mv`, blob + `sha256` unchanged on
   * both sides), so `src/levels/candidates/` holds its `README.md` and nothing else and
   * the booking literal is `[]`. The row is **re-worded, never re-stamped**: the title
   * drops the now-false parenthetical, the literal becomes the empty set, and the
   * absence clause below re-points at the new successor (`l036.json`, `documentedLesson(36)`
   * null, no shipped id > 35) — because the ROOT DATASET stops at the pinned count 35
   * (`src/levels/README.md` §7d) and nothing above it is booked. The list stays a
   * **live guard rather than a count**: the
   * assertion below is *set equality*, so an unregistered extra (`l036.json`) on the
   * shelf and a vanished member of a non-empty booking both fail by name. QA-012 and
   * QA-018 proved the populated direction non-vacuously, QA-014 the empty one and
   * QA-026 the ten-name one (`cp`-in / `mv`-out probes, `tests/e2e/README.md` §1.12);
   * on a `[]` booking the non-vacuous direction is the **absence clause beside it**
   * (a probe that drops `l036.json` into the shelf reddens this row by name), which is
   * the QA-025/QA-026 canon for an empty booking.
   */
  const BOOKED_CANDIDATE_IDS_IN_SHELF: readonly string[] = [];

  it("the shelf holds only the booked pre-registration candidates, every rung derived strictly above the registered root max", () => {
    const rootMax = Math.max(...shipped.map((level) => level.id));
    const shelf = existsSync(CANDIDATES_DIR)
      ? readdirSync(CANDIDATES_DIR)
          .filter((n) => /^l\d+\.json$/.test(n))
          .sort()
      : [];
    // (a) Set equality with the booking: the shelf's role is a *named* hold, not a
    //     dumping ground. A stray `l012.json` (a root row hiding outside the census), a
    //     re-appearing registered rung, or an unregistered extra is caught here — the
    //     booking is compared as a *set*, never as a length.
    expect(shelf).toEqual([...BOOKED_CANDIDATE_IDS_IN_SHELF]);
    // (b) The honest law, re-derived per run: a shelf rung must strictly exceed the
    //     registered root max. At or below it there is no "candidate" — there is a
    //     duplicate of a registered rung, which would be a census lie. The root max is
    //     asserted against the shared dataset pin right here, so a shelf file cannot be
    //     justified by a dataset that moved without the pin moving.
    //     This is a *derived* relation between the landed root rows and the shelf rungs,
    //     and it claims nothing about any device's ceiling: `docs/project-status.md`
    //     item 114 — the pocket census is unmeasured at ≥ 11, so neither "9 is the
    //     largest" nor "20 is the ceiling" may be published, here or anywhere.
    expect(rootMax).toBe(EXPECTED_LEVEL_COUNT);
    for (const name of shelf) {
      const id = Number(/^l(\d+)\.json$/.exec(name)?.[1]);
      expect(id, `${name} sits at or below the registered root max ${rootMax}`).toBeGreaterThan(
        rootMax,
      );
    }
  });

  it("two tails, two facts: the block's tail stays rung 20 while the dataset's tail is the pinned 35 — never a re-stamp", () => {
    const blockMax = BLOCK_IDS.at(-1) as number;
    const maxShipped = Math.max(...shipped.map((level) => level.id));

    // ── FACT 1: the BLOCK's tail. `block-l1619` ends where its own registry rows end,
    // and that number is *the block's*, not the dataset's. R-004c was handed this row
    // as a re-word precisely so that R-004a landing Act II above it cannot re-stamp it
    // (`docs/ai-native-pipeline.md` §7.7 item 4 forbids re-stamping L20 for a new act).
    expect(blockMax).toBe(20);
    expect(documentedLesson(blockMax)?.obligation).toBe("block-l1619");
    const blockTailFile = `l${String(blockMax).padStart(3, "0")}.json`;
    expect(
      existsSync(join(LEVELS_DIR, blockTailFile)),
      `${blockTailFile} is the block's terminal rung and must live in the root set`,
    ).toBe(true);

    // ── FACT 2: the DATASET's tail. The registered root set runs to the shared dataset
    // pin, and the shipped files agree with it. That is a statement about the registered
    // root set and the dataset census — never a ceiling claim about the landing device
    // (`docs/project-status.md` item 114: the pocket census is unmeasured at ≥ 11, so
    // neither "9 is the largest" nor any other ceiling may be published).
    expect(maxShipped).toBe(EXPECTED_LEVEL_COUNT);
    // The act's **registered** tail is the dataset's tail (R-005a moved the act maximum
    // off batch 1's peak 27.604651 onto L35), and the law's own constants name that
    // rung — so this is read off `ACT_II_REGISTERED_IDS` / the tail-level constant
    // rather than a typed 35.
    expect(EXPECTED_LEVEL_COUNT).toBe(ACT_II_REGISTERED_IDS.at(-1));
    expect(EXPECTED_LEVEL_COUNT).toBe(ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID);
    const tailFile = `l${String(maxShipped).padStart(3, "0")}.json`;
    expect(
      existsSync(join(LEVELS_DIR, tailFile)),
      `${tailFile} is the registered terminal rung and must live in the root set`,
    ).toBe(true);
    // The tail's lesson row exists, and its `obligation` is the **honestly null** one
    // R-005a2 recorded: the `act-2-batch-2` / `act-2-batch-3` dispatchers behind an
    // `ACT_II_B2_B3_LADDER`-keyed reader are booked (`src/levels/README.md` §7 item 7),
    // so R-005c may not invent a family to make this row read a value. Asserting `null`
    // is the honest reading — and it is *not* vacuous: a tail that gained a fabricated
    // obligation (or lost its row) fails here by name.
    expect(documentedLesson(maxShipped), `l${String(maxShipped)} lesson row`).not.toBeNull();
    expect(documentedLesson(maxShipped)?.obligation).toBeNull();

    // …and the ABSENCE clause, re-pointed at the *new* max rather than deleted: rung
    // max+1 must have no **registered** file, no lesson row and no obligation
    // (`l036.json` absent from `src/levels/` · `documentedLesson(36)` null · no shipped
    // id above 35 — all three already true, `src/levels/README.md` §7d). All three are
    // re-derived from the live set, so the clause stays live
    // instead of becoming prose. QA-025: the subject is the *root* set (`LEVELS_DIR`),
    // never the shelf — a shelved `l036.json` would be a *candidate*, not the dataset's
    // successor, so re-pointing this derived clause at it would assert an arbitrary rung
    // instead of the dataset's successor, and would have to be typed; scoping the words
    // is the honest fix, and the assertion itself is unchanged.
    expect(
      existsSync(join(LEVELS_DIR, `l${String(maxShipped + 1).padStart(3, "0")}.json`)),
      "no registered l036.json: the registered dataset stops at the pinned count",
    ).toBe(false);
    expect(documentedLesson(maxShipped + 1)).toBeNull();
    expect(
      shipped.filter((level) => level.id > maxShipped).map((level) => level.id),
    ).toEqual([]);
  });

  for (const id of BLOCK_IDS) {
    const file = `l${String(id).padStart(3, "0")}.json`;
    const level = readLevel(LEVELS_DIR, file);
    const graph = explore(level);
    const result = analyse(level, graph);
    const diff = analyseDifficulty(level, graph);
    const audit = auditLevel(level, graph);
    const allOff = allOffShortestSolution(level, graph);

    describe(`${file} (rung ${String(level.id)})`, () => {
      it("is schema- and rule-legal, with `par` stamped by the solver rather than declared", () => {
        const verdict = validateLevel(JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8")));
        expect(verdict.ok).toBe(true);
        expect(verdict.errors).toEqual([]);
        expect(audit.violations).toEqual([]);
        expect(result.solvable).toBe(true);
        expect(level.par).toBe(result.shortestSolution);
      });

      it("delivers the §6.1.1 P2 step: par ≥ l15Par + 2·(id − 15)", () => {
        expect(result.shortestSolution).toBeGreaterThanOrEqual(l15Par + 2 * (level.id - 15));
      });

      it("clears the escalation cut on D_exec, and strictly increases along the block", () => {
        expect(diff.Dexec).not.toBeNull();
        expect(diff.Dexec as number).toBeGreaterThan(cut);
      });

      it("is in the §4 acceptance region: deadStates 0, no unrecoverable ok, T ≡ R ≡ 0", () => {
        expect(result.deadStates).toBe(0);
        expect(result.noUnrecoverableOk).toBe(true);
        expect(diff.T).toBe(0);
        expect(diff.R).toBe(0);
        // the identity that makes the in-region escalation check mean what it says
        expect(diff.Dexec).toBeCloseTo((result.shortestSolution ?? 0) + 3 * diff.B, 9);
      });

      it("covers every tile of its grid (the board is sized to the route, not padded)", () => {
        expect(result.distinctPositions).toBe(level.width * level.height);
      });

      it("grades the latch: the all-OFF world cannot finish, or is at least one move slower", () => {
        expect(level.switches.length).toBeGreaterThan(0);
        expect(level.doors.length).toBeGreaterThan(0);
        expect(
          allOff === null || allOff - (result.shortestSolution as number) >= 1,
        ).toBe(true);
      });

      it("carries the Aha beat on the ordered reader (§3 iii)", () => {
        expect(result.refusedBeforeEnteredTiles).toBeGreaterThanOrEqual(1);
      });

      it("respects the block's §1 latch shape: exactly one switch per door", () => {
        for (const door of level.doors) {
          expect(level.switches.filter((s) => s.targets.includes(door.id))).toHaveLength(1);
        }
      });
    });
  }

  /**
   * ── Block-level obligations ───────────────────────────────────────────────
   *
   * The per-member block above pins each board on its own. These pin the
   * **ladder**, which is the thing the design actually ships: the rungs must be a
   * strictly rising sequence, each must sit exactly on its derived rung value, and
   * the one `B` excursion that was accepted must stay the only one.
   *
   * All read the landed bytes through the same readers; the `B` register is imported
   * from `policy.ts` (its single home since R-003c), so the assertion pins the
   * *measurement against the register* in both directions rather than restating it.
   */
  const ladder = BLOCK_IDS.map((id) => {
    const file = `l${String(id).padStart(3, "0")}.json`;
    const level = readLevel(LEVELS_DIR, file);
    const graph = explore(level);
    return { file, level, graph, diff: analyseDifficulty(level, graph), result: analyse(level, graph) };
  }).sort((a, b) => a.level.id - b.level.id);

  it("rises strictly along the block: every rung's D_exec exceeds its predecessor's", () => {
    expect(ladder.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < ladder.length; i += 1) {
      const prev = ladder[i - 1] as (typeof ladder)[number];
      const cur = ladder[i] as (typeof ladder)[number];
      expect(prev.diff.Dexec).not.toBeNull();
      expect(cur.diff.Dexec as number).toBeGreaterThan(prev.diff.Dexec as number);
    }
  });

  it("sits exactly on each rung's derived par (l15Par + 2·(id − 15)), not merely above it", () => {
    for (const rung of ladder) {
      expect(rung.level.par).toBe(l15Par + 2 * (rung.level.id - 15));
      expect(rung.result.shortestSolution).toBe(rung.level.par);
    }
  });

  it("keeps every B in band except the rungs named in the excursion register — and names no rung that is in band", () => {
    for (const rung of ladder) {
      const inBand = rung.diff.B >= bBand[0] && rung.diff.B <= bBand[1];
      const named = rung.level.id in BLOCK_L1619_NAMED_B_EXCURSIONS;
      if (!inBand) {
        expect(
          named,
          `${rung.file} measures B=${rung.diff.B.toFixed(4)} outside [${bBand[0]}, ${bBand[1]}] and is not named in the excursion register`,
        ).toBe(true);
      }
      // The register is a record of a measurement, not a sink: an entry whose rung
      // came back in band is stale, and a stale entry is how a second excursion gets
      // smuggled in behind a name that no longer describes it.
      if (named) {
        expect(
          inBand,
          `${rung.file} is named in the excursion register but measures B=${rung.diff.B.toFixed(4)} inside [${bBand[0]}, ${bBand[1]}] — the entry is stale`,
        ).toBe(false);
      }
    }
    // …and the register is not empty, so the rule above is not vacuous.
    expect(Object.keys(BLOCK_L1619_NAMED_B_EXCURSIONS).length).toBeGreaterThan(0);
  });

  /**
   * Negative controls for the *suite itself*: each mutation must be refused by the
   * same readers that accepted the members above. A control that stops being refused
   * means the assertions above have gone slack, so this block is the suite's own
   * liveness check — and it is why the suite is not a restatement of
   * `scripts/prove-candidate.ts`'s numbers.
   */
  describe("negative controls — the obligations above are live", () => {
    const base = readLevel(
      LEVELS_DIR,
      `l${String(BLOCK_MIN).padStart(3, "0")}.json`,
    );

    it("refuses a mis-stamped par (the file's claim is compared, never trusted)", () => {
      const forged: Level = { ...base, par: Math.max(1, base.par - 1) };
      expect(analyse(forged, explore(forged)).shortestSolution).not.toBe(forged.par);
    });

    /**
     * ── QA-014: the semantics-drift note this control carried is now DISCHARGED ───
     *
     * QA-012 booked the drift (F-L20-2): what this control encodes is the *switch-gated-door* reading of "latch removed":
     * the bare board is still SOLVABLE, because the door's own phase colour keeps it
     * passable in the other phase, and the refusal is named by the audit
     * (`door-without-switch`) rather than by solvability. That reading is **by
     * construction FALSE for a sealed-landing board**: `l020.json` (shelf-booked when
     * QA-012 wrote the note, registered at the root by R-003d since) uses
     * the latch as the landing device, so dropping `switches` makes the bare board
     * UNSOLVABLE — which is why `scripts/prove-candidate.ts:652` already lists
     * `"unsolvable"` beside `"latch-grade"` in that mutation's accepted-refusal set.
     * R-003d registered that rung at the root, so QA-014 closes the note the right way
     * round: `base` is still `BLOCK_MIN` = l016 (a plain switch-gated door), so this
     * control is kept *verbatim* — its class is real and still shipped — and the
     * landing rung gets the **named `unsolvable` refusal as its own control** below.
     * Neither clause is inherited across the class boundary, and neither is deleted.
     */
    it("refuses a board with its latch removed (a bare door is a violation, not a puzzle)", () => {
      const naked: Level = { ...base, switches: [] };
      const nakedGraph = explore(naked);
      const r = analyse(naked, nakedGraph);
      // A door with no switch is still *solvable* — the door's own colour keeps it
      // passable in one of the two phases, so the player can walk around the latch
      // by arriving in the other phase. That is exactly why the latch obligation may
      // not be replaced by a solvability check: the audit has to catch this board,
      // and it does, by name.
      expect(r.solvable).toBe(true);
      expect(auditLevel(naked, nakedGraph).violations.map((v) => v.code)).toContain(
        "door-without-switch",
      );
      // and the sanctioned measurement stays defined on the bare board, so the
      // existence/grade readers keep working rather than silently treating "no latch"
      // as "UNSATISFIABLE": a null here would have been the weaker reading.
      expect(allOffShortestSolution(naked, nakedGraph)).not.toBeNull();
    });

    /**
     * The landing rung's own reading of the same mutation — the QA-012 drift note's
     * prescribed re-point, measured on the registered bytes rather than described.
     *
     * The shipped landing already carries `allOffShortestSolution === null`: the latch
     * is the *existence* device, so the all-OFF world cannot finish. Dropping the
     * switches therefore cannot move that reading, and the bare board's own solvability
     * is what collapses — which is exactly the "by construction FALSE" the note names.
     * The audit still names the latch, so the collapse is attributable.
     */
    it("refuses a SEALED LANDING with its latch removed: the named `unsolvable` reading, not the door-without-switch one", () => {
      const landingId = BLOCK_IDS.at(-1) as number;
      const landing = readLevel(
        LEVELS_DIR,
        `l${String(landingId).padStart(3, "0")}.json`,
      );
      // Non-vacuity: the shipped landing really is the sealed-landing class.
      expect(allOffShortestSolution(landing, explore(landing))).toBeNull();

      const naked: Level = { ...landing, switches: [] };
      const nakedGraph = explore(naked);
      // The reading that does NOT transfer from l016's class: a bare landing is
      // unsolvable, because the latch was carrying existence, not an advantage.
      expect(analyse(naked, nakedGraph).solvable).toBe(false);
      // …and the audit still names the latch by code, so "unsolvable" is a *consequence*
      // of removing the latch, not a mystery failure.
      expect(auditLevel(naked, nakedGraph).violations.map((v) => v.code)).toContain(
        "door-without-switch",
      );
      // The `allOffStaysDefined` clause gets the same treatment: on this class the
      // sanctioned measurement is null **before and after** the mutation, so "stays
      // defined" is not a claim this board can carry — it is replaced by the equality
      // `null === null`, which is the honest form of the same emptiness.
      expect(allOffShortestSolution(naked, nakedGraph)).toBeNull();
    });

    it("refuses a sealed goal (the region check is not vacuous)", () => {
      const sealed: Level = {
        ...base,
        phaseAWalls: [...base.phaseAWalls, base.goal],
        phaseBWalls: [...base.phaseBWalls, base.goal],
      };
      expect(validateLevel(sealed).ok).toBe(false);
    });

    it("refuses a phase wall on a door tile (§1: one cell is one object)", () => {
      const overlap: Level = {
        ...base,
        phaseAWalls: [...base.phaseAWalls, base.doors[0]?.tiles[0] as never],
      };
      expect(validateLevel(overlap).ok).toBe(false);
    });
  });
});