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
 * booked pre-registration set** — the **empty set** since R-006c, because R-006a
 * registered the five measured LV-017 rungs `l036`–`l040` out of it (the same
 * byte-parity `git mv` R-005a used for batches 2 + 3), so the shelf is back to its
 * `README.md` and nothing else. R-005c-b had booked those five names while LV-017's
 * closing batch sat unregistered on the shelf; registering a candidate moves it to
 * `src/levels/` *and* off this list in the same commit, which is why the literal is a
 * live reading of the directory rather than a count. R-005c had booked `[]` before that
 * for exactly one merge, and the earlier readings are the same pin's history (QA-026 had booked those
 * ten: LV-014 wrote `l026`–`l030` fresh and unregistered, LV-015 posted `l031`–`l035`
 * beside them, merged at `afeb5262d`; QA-025's five-id booking `l026`–`l030`, QA-018's
 * batch-1 booking `l021`–`l025`, QA-014's `[]` after R-003d and R-005c's `[]` are the
 * same pin's earlier readings) — and
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
  ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
  ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_B1_IDS,
  ACT_III_B2_IDS,
  ACT_III_PRE_R007_REGISTERED_TAIL_EXEC,
  ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID,
  ACT_III_REGISTERED_IDS,
  ACT_III_REGISTERED_TAIL_EXEC,
  ACT_III_REGISTERED_TAIL_LEVEL_ID,
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
   * **R-005c re-booked it to `[]` — the EMPTY shelf, for exactly one merge.** R-005a
   * graduated all ten batch-2 + batch-3 rungs to the dataset root (`git mv`, blob +
   * `sha256` unchanged on both sides), so at that tip `src/levels/candidates/` held its
   * `README.md` and nothing else, and the literal was the empty set. That row stated the
   * successor as `l036.json` because the shelf was empty **and** the root stopped at 35:
   * the same rung was both the first unbooked shelf name and the root's successor. Both
   * halves were measured true at that tip.
   *
   * **R-005c-b re-booked it to the five MEASURED names `l036`–`l040`.** LV-017 landed
   * those five proven candidates on the shelf **after** R-005c's base (`da0e3ac`, rule
   * commit `b9dac54`) — by design, not by accident: the shelf moved underneath this pin in
   * the very next merge, which is precisely what the row exists to catch, and the seat
   * measurement found the one red in the suite here (`l16-l20-candidates.test.ts:201`,
   * `AssertionError: expected [ 'l036.json', 'l037.json', …(3) ] to deeply equal []`).
   * The literal is the **directory's own reading, never typed**; registering a
   * candidate still moves it to `src/levels/` *and* off this list in the same commit.
   *
   * **R-006c re-books it back to `[]` — the EMPTY shelf, and this time measured on a
   * 40-rung root.** R-006a graduated all five batch-4 rungs to the dataset root (the
   * byte-parity `git mv` off the LV-017 shelf, both `sha256` and git blobs unchanged), so
   * `src/levels/candidates/` again holds its `README.md` and nothing else — the same
   * empty reading R-005c took at 35 rungs, re-taken here at 40 by the directory scan
   * itself rather than asserted from memory.
   *
   * **R-007c re-takes the same empty reading a third time — on a 45-rung root, and it is
   * still `[]` *without an edit*.** R-007 registered Act III's opener (`l041`–`l045`) off
   * the **LV-018** shelf by the same byte-parity `git mv`, so `src/levels/candidates/`
   * holds `README.md` and nothing else again and this literal — the lever R-006c had
   * already taken — needs no re-booking at all. What R-007d's group 0 measured is exactly
   * that: the shelf row is *green* at the new tip (`expected [] to deeply equal []`) while
   * only the two **successor** references below move. Keeping the whole history in one
   * literal (`[]` → `l021`–`l025` → `l026`–`l035` → `[]` → `l036`–`l040` → `[]` → **`[]`**)
   * is why a shelf file can never be justified by a re-typed count.
   *
   * **R-008c re-takes the same empty reading a fourth time — on a 50-rung root, and again
   * it costs this file *no literal edit*.** R-008 graduated Act III's batch 2
   * (`l046`–`l050`) off the **LV-019** shelf by the same byte-parity `git mv`, so
   * `src/levels/candidates/` holds `README.md` and nothing else and this literal stays
   * `[]`. The literal's history is now
   * `[]` → `l021`–`l025` → `l026`–`l035` → `[]` → `l036`–`l040` → `[]` → `[]` → **`[]`**.
   *
   * **The two successor subjects SPLIT APART again at this tip.** At R-007c they coincided
   * (`l046.json` was both the root's next rung and the shelf's next unbooked name); R-008
   * moved the root onto `l046`–`l050`, so they no longer do. The root's absence clause below
   * now stops at **50** — its successor is **`l051.json`** — while the *shelf's* next
   * unbooked name is still **`l046.json`**, a file the root now **holds**. This is exactly
   * the R-005c-b shape, re-taken at a larger rung: the two readings must be kept apart by
   * scope, and the absence clause derives its successor as `maxShipped + 1` rather than
   * typing it, which is what keeps it honest on either shape.
   *
   * The list stays a **live guard rather than a count**: the assertion below is *set
   * equality*, so an unbooked extra (`l046.json` on the shelf, `l051.json` on the root)
   * and a vanished member of the booking (with five names, `l040.json` gone) both fail by
   * name — QA-012 and QA-018 proved the populated direction non-vacuously, QA-014 the empty
   * one and QA-026 the ten-name one (`cp`-in / `mv`-out probes, `tests/e2e/README.md`
   * §1.12); R-005c proved the `[]` reading at 35, R-005c-b the five-name one at 35, **R-006c
   * re-proved both directions on its 40-rung `[]` reading** — the *extra* direction on the
   * shelf (`cp l040.json candidates/l041.json` → red at the set-equality row) and the
   * *absent* direction, which for an empty booking is the root clause rather than a removed
   * member (`cp l040.json l041.json` in `src/levels/` → red at the absence-clause row) —
   * **R-007c re-proved both on its 45-rung `[]` reading** and **R-008c re-proves both on this
   * 50-rung `[]` reading** the same way, with the shelf successor still one rung *below* the
   * root's (`l046.json` vs `l051.json`, the rung reserved for the `par 28` `L51–L60` tail):
   * quoted in `tests/e2e/README.md` §1.19/§1.20.
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

  it("two tails, two facts: the block's tail stays rung 20 while the dataset's tail is the pinned 50 — never a re-stamp", () => {
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
    // **WHICH ACT's tail is no longer a detail a value comparison can leave implicit.**
    // R-005a moved the act maximum off batch 1's peak 27.604651 onto L35, **R-006a moved
    // it again onto L40**, and **R-007 moved it across the first ACT BOUNDARY in the
    // register onto L45** (`ACT_III_REGISTERED_TAIL_LEVEL_ID`). Every one of those three
    // moves is a *pre-registration standard* step (§7.3.2: re-derivation, never
    // re-stamping), so the row reads the **live Act III** constant — from
    // `src/core/solver/policy.ts`, never typed here — while each earlier act's tail keeps
    // its own frozen datum. This is exactly the row R-007d flagged as **green for the
    // wrong reason** at the R-007 tip: at the 40-rung pin it passed only because
    // `EXPECTED_LEVEL_COUNT` happened to equal *Act II's* tail, so the pin at 45 would
    // have owed this row a decision. The decision is made here, by act boundary.
    //
    // **R-008c re-points this pair a third time — and this time the two subjects SPLIT
    // apart again.** R-008 widened Act III's *registered id set* to `41–50`
    // (`ACT_III_REGISTERED_IDS` = batch 1 ++ batch 2), so the act's own id set now ends at
    // **`ACT_III_REGISTERED_IDS.at(-1)` = 50**, which is what the dataset pin names. The
    // **tail constant is deliberately NOT the same fact**: R-008's re-derivation found the
    // act's measured `D_exec` peak unchanged at **L45** (`ACT_III_REGISTERED_TAIL_EXEC`,
    // `30.455319`; the batch's own peak `30.417021` sits `0.038298` below it), so
    // `ACT_III_REGISTERED_TAIL_LEVEL_ID` stays **45** and is now *interior* to the act's id
    // set. Re-pointing this row at the tail constant — the R-007c reading — would therefore
    // be **green for the wrong reason twice over**: at the 50-rung lever it would simply be
    // a stale `45`, and it would paper over the R-008 widening the row is supposed to show.
    // The pair below is (dataset pin ≡ act id-set tail) and (act id-set tail ≢ act tail
    // constant), i.e. the dataset's tail is the *last registered id*, never the *carrier of
    // the act's peak*.
    expect(EXPECTED_LEVEL_COUNT).toBe(ACT_III_REGISTERED_IDS.at(-1));
    // The TOOTH, naming the interior batch: the id set's tail must NOT collapse back onto
    // the response constant it used to be. `ACT_III_REGISTERED_TAIL_LEVEL_ID === 45` is
    // literally batch 1's last id, so this `not.toBe` is the only assertion here that a
    // **pre-R-008 id set** (`[...ACT_III_B1_IDS]`, the array this constant is still equal
    // to) cannot satisfy. Non-vacuity is asserted, not intended, below this row in the
    // `R-008c` describe block — which *runs* the pre-widening array against the tooth and
    // requires the rejection.
    expect(ACT_III_REGISTERED_IDS.at(-1)).not.toBe(ACT_III_REGISTERED_TAIL_LEVEL_ID);
    expect(ACT_III_REGISTERED_IDS.at(-1)).toBe(ACT_III_B2_IDS.at(-1));
    expect(ACT_III_REGISTERED_TAIL_LEVEL_ID).toBe(ACT_III_B1_IDS.at(-1));
    // NON-VACUITY, both directions, asserted rather than intended:
    //   (a) the tail constant this row still pins by value is **not** a synonym of the one
    //       it replaced — Act III's tail strictly exceeds Act II's frozen tail, and the
    //       *aliased* pre-R-007 standard is literally the wrong act's tail, so a re-point
    //       back at either of those two reddens this row. The `not.toBe` is the tooth: it is
    //       the only assertion here that a *wrong act's tail* cannot satisfy. (R-008c keeps
    //       this block intact: R-008 widened the act's *id set* but moved **no** tail
    //       constant, so every value here is byte-identical to R-007c's reading.)
    //   (b) the frozen standards stay where their own registrations left them, so
    //       "re-derivation, never re-stamping" is visible as a *value* comparison and not
    //       only as a live-set one.
    expect(ACT_III_REGISTERED_TAIL_LEVEL_ID).toBeGreaterThan(
      ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
    );
    expect(ACT_III_REGISTERED_TAIL_LEVEL_ID).not.toBe(
      ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID,
    );
    expect(ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID).toBe(
      ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID,
    );
    expect(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID).toBe(40);
    expect(ACT_II_REGISTERED_IDS.at(-1)).toBe(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID);
    // …and the R-005a standard is left where R-005a put it. Re-stamping it to the new
    // tail is exactly the move §7.3.2's law forbids, and it is the failure mode a *live*
    // comparison cannot see — so the frozen standard is asserted by its own number too.
    expect(ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID).toBe(35);
    expect(ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID).not.toBe(EXPECTED_LEVEL_COUNT);
    const tailFile = `l${String(maxShipped).padStart(3, "0")}.json`;
    expect(
      existsSync(join(LEVELS_DIR, tailFile)),
      `${tailFile} is the registered terminal rung and must live in the root set`,
    ).toBe(true);
    // The **value** axis of the same reading, so the pair (level id, `D_exec`) is pinned
    // as a pair and a wrong act's tail reddens on either half: the rung the constant
    // names carries that constant's own measured `D_exec` on the ROOT bytes, and the
    // pre-R-007 standard's value (Act II's 28.455319, alias-typed) is *different* —
    // which is what keeps this comparison from being satisfied by any 45-rung tail.
    //
    // **R-008c: the rung the constant names is no longer the dataset tail.** At R-007c
    // `maxShipped === ACT_III_REGISTERED_TAIL_LEVEL_ID === 45`, so this half could be read
    // off `maxShipped` and still be the constant's own rung. R-008 moved the dataset tail to
    // L50 while leaving the act's peak carrier at L45, so the *value* half must now be read
    // from the constant's rung — read `ACT_III_REGISTERED_TAIL_LEVEL_ID`, never
    // `maxShipped`, or this row would compare L45's constant against L50's bytes and go
    // red for the wrong reason. That is exactly the drift a re-pointed-but-untested pair
    // would hide, so the two rungs are asserted to be *different* right here.
    const actTailFile = `l${String(ACT_III_REGISTERED_TAIL_LEVEL_ID).padStart(3, "0")}.json`;
    expect(actTailFile).not.toBe(tailFile);
    const actTailLevel = readLevel(LEVELS_DIR, actTailFile);
    const actTailDiff = analyseDifficulty(actTailLevel, explore(actTailLevel));
    expect(actTailDiff.Dexec as number).toBeCloseTo(ACT_III_REGISTERED_TAIL_EXEC, 6);
    expect(ACT_III_REGISTERED_TAIL_EXEC).not.toBe(
      ACT_III_PRE_R007_REGISTERED_TAIL_EXEC,
    );
    // …and the **interior batch did not overtake the registered tail** — the R-008 zero-move
    // read off the live bytes rather than trusted: the dataset's own terminal rung (L50)
    // carries a `D_exec` strictly below the act's registered tail, which is *why* the tail
    // constant is still L45 and why the pair above reads two different rungs. A future batch
    // that did overtake would redden this row and force the tail re-derivation to be an
    // explicit decision instead of a silent one.
    const tailLevel = readLevel(LEVELS_DIR, tailFile);
    const tailDiff = analyseDifficulty(tailLevel, explore(tailLevel));
    expect(tailDiff.Dexec as number).toBeLessThan(ACT_III_REGISTERED_TAIL_EXEC);
    // The tail's lesson row exists, and its `obligation` is the **honestly null** one
    // R-005a2 recorded: the `act-2-batch-2` / `act-2-batch-3` dispatchers behind an
    // `ACT_II_B2_B3_LADDER`-keyed reader are booked (`src/levels/README.md` §7 item 7),
    // so R-005c may not invent a family to make this row read a value. Asserting `null`
    // is the honest reading — and it is *not* vacuous: a tail that gained a fabricated
    // obligation (or lost its row) fails here by name. R-007's opener repeats the
    // reading rather than upgrading it: the Act III tail's remedy is booked on **L41's**
    // row as an `ACT_III_B1_LADDER`-keyed `act-3-batch-1` obligation (`policy.ts:45`'s
    // own evidence line), so the tail still carries `null`. **R-008c reads the same `null`
    // one rung further up**: R-008 registered `l046`–`l050` with the batch-2 remedy
    // *booked, not landed* — `policy.ts`'s L46 evidence line books an `act-3-batch-2`
    // obligation behind an `ACT_III_B2_LADDER`-keyed reader plus one control per new code,
    // and until that lands the rungs' proof is the `--act=3 --family=g --ladder=46…50`
    // run — so `L50`'s lesson row exists and its obligation is still honestly `null`. The
    // assertion is re-derived from `maxShipped`, so it followed the tail without an edit;
    // its prose is what moved.
    expect(documentedLesson(maxShipped), `l${String(maxShipped)} lesson row`).not.toBeNull();
    expect(documentedLesson(maxShipped)?.obligation).toBeNull();

    // …and the ABSENCE clause, re-pointed at the *new* max rather than deleted: rung
    // max+1 must have no **registered** file, no lesson row and no obligation
    // (`l051.json` absent from `src/levels/` · `documentedLesson(51)` null · no shipped
    // id above 50 — all three true on the 50-rung root, `src/levels/README.md` §7g). All
    // three are
    // re-derived from the live set, so the clause stays live
    // instead of becoming prose. QA-025's scoping still holds: the subject is the *root*
    // set (`LEVELS_DIR`), never the shelf, so a shelf byte cannot falsify it. At the
    // R-007c tip the two subjects **coincided** (R-007 registered `l041`–`l045`, so the
    // shelf was empty and `l046.json` was both the root's successor and the shelf's next
    // unbooked name); **R-008c re-splits them** — R-008 registered `l046`–`l050`, so the
    // root's successor is now `l051.json` while the shelf's next unbooked name is back to
    // `l046.json` (the R-005c-b shape), and the root clause is scoped to `LEVELS_DIR` by
    // construction, so the shelf's `l046.json-shape` absence claim cannot touch it. The
    // *derived* `maxShipped + 1` is what keeps this clause honest on either shape, which is
    // why R-008c re-points it **without typing a new rung**: the file name and the message
    // both rebuild themselves from the live max.
    const absentSuccessorFile = `l${String(maxShipped + 1).padStart(3, "0")}.json`;
    expect(
      existsSync(join(LEVELS_DIR, absentSuccessorFile)),
      `no registered ${absentSuccessorFile}: the registered dataset stops at the pinned count`,
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
/**
 * ── R-008c · the two-tails tooth, proved non-vacuous ──────────────────────────
 *
 * The `two tails, two facts` row reads the **dataset tail** off the act's *id set*
 * (`ACT_III_REGISTERED_IDS.at(-1)`) and carries a `not.toBe` tooth against the act's
 * **tail constant** (`ACT_III_REGISTERED_TAIL_LEVEL_ID`). A negated assertion is worth
 * exactly what it can reject, so this block *runs* the regression the tooth exists to
 * catch — the pre-R-008 id set, which is literally `[...ACT_III_B1_IDS]` — and requires
 * the tooth's shape to reject it. Nothing here reads the dataset; it is a property of
 * the two policy constants, which is why it belongs in this file (the shelf + tails pin)
 * rather than in a policy suite that would re-say it.
 *
 * Why the *id set* is the right subject and the constant is the right tooth: R-008 moved
 * the id set to `41–50` while deliberately leaving the peak carrier at L45, so the pair
 * (dataset tail ≡ id-set tail) and (id-set tail ≢ tail constant) are two *different*
 * facts. The first is a census fact about the register; the second is the Act III *peak*
 * law. A single assertion that collapsed them would be green under a re-stamp in either
 * direction — which is precisely the class of defect R-007d flagged (green for the wrong
 * reason) and this ticket had to re-point.
 */
describe("R-008c · the Act III id-set tail tooth is not vacuous", () => {
  it("rejects the pre-widening id set: `[...ACT_III_B1_IDS].at(-1)` IS the tail constant, so the tooth reddens", () => {
    // The regression the tooth catches, constructed from policy constants only.
    const preWideningIdSetTail = [...ACT_III_B1_IDS].at(-1);
    // Non-vacuity, direction (a): the hypothetical regression really does collide with the
    // constant — i.e. the tooth would fire. Asserted by *evaluating* the very assertion
    // shape used in the row, so this cannot drift from it. If a future registration moved
    // `ACT_III_REGISTERED_TAIL_LEVEL_ID` off batch 1's last id, this row reddens first,
    // which is the honest place for that discovery to surface.
    expect(() =>
      expect(preWideningIdSetTail).not.toBe(ACT_III_REGISTERED_TAIL_LEVEL_ID),
    ).toThrow();
    // Non-vacuity, direction (b): the *shipped* id set is genuinely wider than that
    // regression — its tail differs from the constant, so the tooth is satisfied by real
    // bytes and not only by the hypothetical.
    expect(ACT_III_REGISTERED_IDS.at(-1)).not.toBe(preWideningIdSetTail);
    // …and the widening is *interior*: the pre-widening tail is still a member of the
    // shipped set (a re-stamp that dropped it would be caught by the register rows, but
    // this is the membership reading the tooth's prose depends on).
    expect(ACT_III_REGISTERED_IDS).toContain(preWideningIdSetTail);
    expect(ACT_III_REGISTERED_TAIL_LEVEL_ID).toBe(preWideningIdSetTail);
  });
});
