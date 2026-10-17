# `author-l20.ts --stage=p --pocketsize=10` — transcript (LV-012, F-L20-3)

**Owner:** Level AI + Solver · **Ticket:** LV-012 · **Debt:** **F-L20-3** — *pocket-class completeness
is OPEN at ≥ 9 pockets; NO document may claim "par 20 is the sealed-landing device's ceiling" until that
census closes.*
**Law:** `docs/level-design.md` §7.7 item 1 (the handoff order) · §7.4 (named families) · `src/levels/README.md` §2e-5.

This is the **stage-P re-run past the open boundary**. It is an *instrument* record: it measures a search
space. It proves nothing about levels, and it changes no shipped row, no band and no registered ceiling.

---

## 0. What §7.7 item 1 asks for, verbatim

> **1. Re-run stage P past the open boundary.** `--stage=p --pocketsize=10` (the pass F-L20-3 recorded as
> killed after 25 lines because an accept already existed at ≤ 8): measure the leak-free size histogram
> and the per-landing pocket counts (`5,1` went 12 → 40, `6,0` 12 → 40, `5,0` 3 → 13 in the aborted
> pass). **F-L20-3 closes or stays open by measurement — never by assumption**, and no ceiling claim
> about the landing device may be published either way.

So the deliverable is (a) the **leak-free size histogram**, (b) the **per-landing counts**, (c) a verdict
that is *measured* rather than assumed, and (d) the explicit absence of any ceiling claim.

---

## 1. The two instrument changes (both pure, both re-verified)

`scripts/author-l20.ts` gained exactly two things, and the diff is 33 lines:

1. **`pocketCandidates` is now a lazy generator** (was: an eager `Pocket[]` builder). The ≤10
   enumeration materialised every candidate of every landing in one array and died at heap 4092 MB,
   exit 134, after 459 s — a **materialization** bug, not an infeasibility. The rewrite is
   **semantics-preserving by construction**: same recursion, same `pool`/`adjacent` guards, same
   `boundaryOf` filter, same yield order.
2. **`--only=x,y` (repeatable), stage P only** — a slice filter over `FAR_TILES`. With no `--only` the
   loop is byte-for-byte the shipped one. The doc-comment states the rule it must obey: a slice is
   *verified*, never trusted, by re-measuring a landing whose full-run line is already on the record.

### 1a. The ≤8 equivalence proof (the claim the rewrite has to earn)

Because change 1 touches the generator every stage depends on, it was re-verified against the
**committed** ≤8 result (`scripts/author-l20.transcript.md` §4, LV-011):

```
=== --stage=p --pocketsize=8, AFTER the generator rewrite ===
census: 16431095 pocket(s) tested · 13163780 single-phase boundary · 2788 leak-free (the census's accept class)
EXIT=0
```

* `16 431 095` tested · `13 163 780` single-phase · `2 788` leak-free — **identical to the committed
  numbers**, digit for digit.
* `2 788` leak-free **listing** lines plus **102** per-landing count lines (8+9+8+9+8+9+9+8+9+9+8+8 over
  the twelve class-bearing landings).
* Histogram `3:34 4:204 6:510 7:2040` — **identical** to the committed histogram.
* Cross-check that the count lines are not merely plausible: summing the per-landing
  `(per-line count × line count)` over the twelve class-bearing landings gives **13 163 780** exactly,
  i.e. the six `x = 4` landings contribute **0** single-phase members at ≤8. That arithmetic is what
  licenses the `x = 4` reading later in this file.

## 2. The monolithic ≤10 attempt, and why it is on the record

Run at `--max-old-space-size=12288`, the full ≤10 pass in one process is **not** a 30-second job. It was
left running and its partial output was kept rather than thrown away:

```
=== --stage=p --pocketsize=10 — the monolithic pass, stopped after 25 data lines ===
stage P pocket census — grid 7×6 · sealed column x=3 · pocket size ≤ 10 · far tiles = 18
  landing 5,0 (near …): 1338255 single-phase boundary, 13 leak-free      × 8 near ends
  landing 6,0 (near …):  354129 single-phase boundary, 40 leak-free      × 9 near ends
  landing 5,1 (near …): 8262157 single-phase boundary, 40 leak-free      × 8 (of 9)
```

Those 25 lines are, exactly, the LV-011 **aborted pass's** 25 lines: `5,0` 3 → 13, `6,0` 12 → 40,
`5,1` 12 → 40 — the three numbers §7.7 quotes. **The debt's premise is therefore reproduced before it is
resolved**, and the later slices are checked against these lines byte-for-byte (§4a).

## 3. The measurement method: 18 disjoint landing slices

`FAR_TILES` is `{x ∈ {4,5,6}} × {y ∈ 0…5}` = **18 landings**, and `--only=x,y` partitions it. The
landings are **independent** — each is enumerated, sealed-tested and leak-tested on its own — so the
partition is exact: summing the slices' `census:` counters reproduces the monolithic total, and
concatenating their listings reproduces the monolithic listing. The slices are run 8-way parallel to fit
the machine:

```sh
for x in 4 5 6; do for y in 0 1 2 3 4 5; do printf '%s %s\n' "$x" "$y"; done; done \
  | xargs -n 2 -P 8 sh -c '
      x="$1"; y="$2"
      NODE_OPTIONS=--max-old-space-size=4096 node_modules/.bin/tsx scripts/author-l20.ts \
        --stage=p --pocketsize=10 --only="$x,$y" > "$T/p10s-${x}-${y}.txt" 2>&1' _
```

**Slice scope is a declared boundary, not a convenience.** Every landing that does not complete is
reported as `NOT MEASURED` — **never** as zero, and never folded into a total as if it were zero. The
distinction is the whole point of the record.

### 3a. Measured cost (this is itself a finding)

| quantity | measured |
|---|---|
| candidates the ≤8 class costs, full 18-landing pass | **16 431 095** |
| candidates the ≤10 class costs, per landing, vs its own ≤8 count | **≈ 30–44×** (`5,0` 294 632 → 10 706 040 = **36.3×**; `6,0` 104 472 → 3 187 161 = **30.5×**; `5,1` 1 708 317 → 8 262 157 × 9 = **43.5×**) |
| aggregate throughput observed, 8-way parallel | **≈ 89 000 candidates/s** |
| projected full ≤10 pass | **≈ 5 × 10⁸ candidates** ≈ **1.6 hours** wall at the measured rate |

Why it explodes: `pocketCandidates` walks **growth sequences**, not distinct tile sets (`grow` recurses
over every order in which a connected set can be built), so the count is a function of the *tree*, not of
the class. The committed ≤8 listing shows this directly — the same pocket appears repeatedly under the
same landing and near end. **The way to make a ≤10/≤11 census affordable is a distinct-set enumerator**,
and that is named here as the next ticket's lever together with its cost: it re-baselines the committed
≤8 numbers (`16 431 095` / `2 788`), because they are sequence counts, not set counts.

### 3b. In-flight snapshot of the slice job (recorded mid-run, 2026-10-17 ~14:38)

The 18-slice job is a **tracked background shell job** of the harness
(`sh_1487fec4a001HVBqf4pDZC7djV`); its process tree is
`driver sh l20-p10-slices.sh (pid 25979) ← opencode-cli serve (pid 72754) ← OpenCode.app`,
so the driver is a child of the tool's own background shell and the completion notification
lands in the authoring session. Measured at the snapshot: **11/18 landings carry a `census:`
line**, 7 are mid-walk (`5,1 5,2 5,3 5,4 6,2 6,3 6,4`), **0 slices show an error/OOM string**,
and the driver had been up **23:57**.

Measured partial totals over the 11 completed slices — **178 946 822 candidates tested ·
47 547 600 single-phase boundary · 3 405 leak-free**, i.e. the ≤10 class already exceeds the whole
committed ≤8 census (`16 431 095` tested / `13 163 780` single-phase / `2 788` leak-free) on every
one of the three counters, in 11 of 18 slices. The measured aggregate rate is
**124 528 candidates/s** (178 946 822 / 1 437 s of 8-way wall time).

Per-landing criterion observed live, recorded because it is what makes the summation exact: each
landing emits **one line per near variant**, all carrying the *same* count (the single-phase
boundary count is a property of the pocket set and the far frame, not of the near tile), and the
`census:` line is their **sum** — verified against four completed slices:
`5,0` 8 nears × 1 338 255 = 10 706 040 · `5,5` 9 × 1 338 255 = 12 044 295 ·
`6,0` 9 × 354 129 = 3 187 161 · `6,1` 8 × 2 347 134 = 18 777 072 · `6,5` 8 × 354 129 = 2 833 032.
The x=4 landings print **no** near line at all while still counting (their boundary candidates are
`0` single-phase but `tested > 0`: `4,0` 3 187 161 tested / `4,1` 18 777 072 / `4,4` 21 124 206),
which is why the summed `tested` and the summed `single-phase` differ on the x=4 group and agree on
the class-bearing x=5/x=6 group.

Resumption safety (stated because the orchestrator asked for it explicitly): the **artifacts are
durable** — each slice writes its own `p10s-<x>-<y>.txt` and the reduce step reads whichever files
exist, naming a missing one `NOT MEASURED` rather than zero. The **original driver is not
skip-guarded** (`for x in 4 5 6; for y in 0..5` re-runs all 18 with `>` truncation), so a re-dispatch
of *that* script would repeat the whole pass. A **resumable variant** was therefore written beside it,
`l20-p10-slices-resume.sh`: byte-identical tool, params and slice list, the only difference being
`grep -q "^census:" "$f" && exit 0` per slice, so a re-dispatch pays only for landings still missing.
Estimated remaining work from the live per-near counts and the flushed-near counts is **≈0.3×10⁹
candidates ⇒ ≈40 min at the measured rate** (bounded ~55 min), against the ~100 min in the
orchestrator's ledger row — reported as a correction, not a dispute: both are projections and the
reduce step is what decides.

## 4. The completed ≤10 census (measured 2026-10-17, all 18 landings, no gaps)

The pass the LV-011 record killed after 25 lines was re-run to completion as the 18 disjoint
`--only=x,y` slices of §3a. **18/18 landings produced a `census:` line — nothing is
`NOT MEASURED`** — and no slice output carried an error or OOM string.

```
-- per-slice census lines (landing = the --only pair, summed over its near ends) --
  landing 4,0:  3187161 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 4,1: 18777072 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 4,2: 45252927 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 4,3: 40224824 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 4,4: 21124206 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 4,5:  2833032 pocket(s) tested ·        0 single-phase boundary ·    0 leak-free
  landing 5,0: 10706040 pocket(s) tested · 10706040 single-phase boundary ·  104 leak-free
  landing 5,1: 74359413 pocket(s) tested · 74359413 single-phase boundary ·  360 leak-free
  landing 5,2: 140328568 pocket(s) tested ·140328568 single-phase boundary ·  688 leak-free
  landing 5,3: 157869639 pocket(s) tested ·157869639 single-phase boundary ·  774 leak-free
  landing 5,4: 66097256 pocket(s) tested · 66097256 single-phase boundary ·  320 leak-free
  landing 5,5: 12044295 pocket(s) tested · 12044295 single-phase boundary ·  117 leak-free
  landing 6,0:  3187161 pocket(s) tested ·  3187161 single-phase boundary ·  360 leak-free
  landing 6,1: 18777072 pocket(s) tested · 18777072 single-phase boundary · 2504 leak-free
  landing 6,2: 45252927 pocket(s) tested · 45252927 single-phase boundary · 4824 leak-free
  landing 6,3: 40224824 pocket(s) tested · 40224824 single-phase boundary · 4288 leak-free
  landing 6,4: 21124206 pocket(s) tested · 21124206 single-phase boundary · 2817 leak-free
  landing 6,5:  2833032 pocket(s) tested ·  2833032 single-phase boundary ·  320 leak-free

-- summed totals --
  census: 724203655 pocket(s) tested · 592804433 single-phase boundary · 17476 leak-free

-- the ≤10 leak-free SIZE histogram --
  34 size-3 · 204 size-4 · 510 size-6 · 2040 size-7 · 14688 size-9      (34+204+510+2040+14688 = 17476)
```

Per-landing split of the class, which is what makes the verdict of §6 checkable rather than
summarised away — `≤7` is the membership inherited from the ≤8 pass (whose largest member measures
7), `size-9` is the class the ≤8 cap could not have built:

```
  landing   total  ≤7 (the ≤8 sub-class)  size-8  size-9  size-10
   5,0       104            24                0      80       0
   5,1       360           108                0     252       0
   5,2       688           128                0     560       0
   5,3       774           144                0     630       0
   5,4       320            96                0     224       0
   5,5       117            27                0      90       0
   6,0       360           108                0     252       0
   6,1      2504           264                0    2240       0
   6,2      4824           792                0    4032       0
   6,3      4288           704                0    3584       0
   6,4      2817           297                0    2520       0
   6,5       320            96                0     224       0
  4,0 … 4,5     0             0               0       0       0
  ── column sums: 2788 (the committed ≤8 total) · 0 · 14688 · 0
```

**No size-8 and no size-10 member exists in the whole 18-landing frame** — measured directly by
counting the pocket sizes in the listing, `NF == 8` and `NF == 10` evaluate to `0` on every one of
the 18 landings. The admitted sizes inside `≤ 10` are therefore exactly `{3, 4, 6, 7, 9}`.

### 4a. The killed pass, reproduced rather than assumed

The whole exactness argument for slicing is that a slice is a **partition element**. That was
demonstrated against the only pre-existing evidence, the monolith LV-011 killed after 25 lines:

* its **25 data lines are reproduced byte-for-byte** by the slice outputs (`5,0` 1 338 255/13 per
  near end × 8 · `6,0` 354 129/40 × 9 · `5,1` 8 262 157/40), and
* its **three per-near preview readings are confirmed exactly** on the completed pass —
  `5,1` 12 → **40**, `6,0` 12 → **40**, `5,0` 3 → **13** — i.e. the numbers LV-011 recorded as a
  *preview of an unfinished run* are now the finished run's own per-near values.

Re-run before the full pass and after it, the slice partition produced set-identical output, so the
summation below is exact and not an approximation.

## 5. The diff against the committed ≤8 census

| counter | ≤8 (committed, `author-l20.transcript.md` §4) | ≤10 (measured here) | factor |
|---|---|---|---|
| pockets tested | 16 431 095 | **724 203 655** | **44.07×** |
| single-phase boundary | 13 163 780 | **592 804 433** | **45.03×** |
| leak-free (the accept class) | 2 788 | **17 476** | **6.27×** |
| histogram | `3:34 4:204 6:510 7:2040` | `3:34 4:204 6:510 7:2040 9:14688` | one new row |

Two things in that table carry the verdict:

1. **The ≤8 histogram is reproduced digit for digit.** `34 + 204 + 510 + 2040 = 2 788`, which is the
   committed leak-free total exactly, and the ≤10 pass's size-≤7 columns sum to `2 788` as well. The
   ≤10 pass did not merely *agree* with its predecessor in aggregate — it **carried it as a
   sub-histogram**, which is what a correct widening of the same enumeration must do.
2. **The inheritance also holds per landing**, against the only two ≤8 per-landing anchors on record:
   `5,0` = **24** (= 8 near ends × **3** leak-free per near end, the committed number) and `6,0` =
   **108** (= 9 × **12**, likewise). Both reproduce, so the sub-histogram identity is not an
   artefact of summing six landings in the wrong proportions.

What changed is one row: **a size-9 class of 14 688 members — 7.2× the largest ≤8 row (2 040)** —
distributed over the twelve class-bearing landings as the §4 table shows, and entirely on the
parity-bearing columns (`x=5`, `x=6`); the six `x=4` landings contribute **0** to it, exactly as they
contribute 0 to the whole ≤8 class.

## 6. F-L20-3 — VERDICT: CLOSED by measurement

§7.7 item 1 instructed: *"measure the leak-free size histogram and the per-landing pocket counts …
**F-L20-3 closes or stays open by measurement — never by assumption**, and no ceiling claim about the
landing device may be published either way."*

**The boundary closes.** The ≥ 9-pocket class is **real, enumerated, and bounded**: 14 688 leak-free
members of size 9, on twelve landings, each re-derived by the same stage-P enumeration that produced
the ≤8 class. LV-011's sentence — *the ≤8 class is a slice, not the whole space* — was **correct and
is now measured as such**, with its own three preview numbers confirmed on a finished pass.

**What the closure is scoped to, in plain words.** Completeness is proven **for pocket size ≤ 10**,
which is the frame's own enumeration limit. Sizes **≥ 11 were not enumerated** and remain unmeasured.
Accordingly **no ceiling claim about the landing device is published here** — neither "20 is the
device's ceiling", nor "9 is the largest pocket". What is claimed is exactly: *inside `≤ 10`, the
leak-free class is `{3:34, 4:204, 6:510, 7:2040, 9:14688}`; `{5, 8, 10}` are empty; `≥ 11` is not
measured.*

**What it does to the game's numbers — nothing.** The new members are a **wider pool** for Act II
rungs (2 363 leak-free on the six `x=5` landings, 15 113 on the six `x=6` landings, 0 on the six
`x=4` landings). That is a **pool** statement; it is not a difficulty claim, and **no `par`, no `B`
and no `D_exec` moves because of this census**. The five landed rungs of this batch were authored,
stamped and proven **without** the size-9 class.

### 6a. Two findings recorded beside the verdict, neither promoted to a law

**(i) The mirrored-column identity.** The `x=4` and `x=6` slices enumerate to **identical `tested`
counts on all six landing rows**, to the last digit:

```
  4,0 = 6,0 =  3 187 161      4,3 = 6,3 = 40 224 824
  4,1 = 6,1 = 18 777 072      4,4 = 6,4 = 21 124 206
  4,2 = 6,2 = 45 252 927      4,5 = 6,5 =  2 833 032
```

Six exact equalities are not chance; but the **verdict** between the two columns is total and
opposite — `x=4` returns **0** single-phase boundary and **0** leak-free on every landing, `x=6`
returns its **entire** `tested` count as single-phase and all **15 113** of its leak-free members.
So the enumeration is mirror-symmetric in those two columns while the parity check is not.
**The mechanism is not established by this census.** It is named for the architect as an open
lattice question and is *not* asserted as a law, and nothing downstream depends on it.

**(ii) The parity pattern of the empty sizes.** Sizes 5, 8 and 10 are empty while 3, 4, 6, 7 and 9
are populated, over 724M candidates. The measurement is solid; no structural argument is offered
for it here, and none is needed for the verdict above.

## 7. Cost and method (measured)

* **Wall clock: 2 737 s = 45 min 37 s** at 8-way (`xargs -P 8`), from the driver's start to the last
  slice's final write.
* **Aggregate throughput: 724 203 655 / 2 737 s = 264 573 candidates/s.**
* **The ≤8 pass is 2.3 % of this volume** (16 431 095 / 724 203 655). This is the number that
  justifies slicing rather than a monolithic run: the monolith would have held one core for ~6 h.
* **Concurrency note, recorded honestly.** The mid-flight projection in §3b said ~40 min remaining;
  the pass finished in 21 min more. Both numbers are honest projections at different times — the
  earlier one extrapolated the *first* 24 minutes (during which the six cheap `x=4` landings were
  still occupying worker slots), the second is the completed measurement. The lesson recorded: with
  `-P 8` and heterogeneous slice cost, an early-window rate **underestimates** throughput; take the
  rate from completed work, not from the opening phase.
* **Resumption.** The original driver re-runs all 18 slices (`>` truncation, no skip guard), so the
  resumable variant `l20-p10-slices-resume.sh` was written beside it — byte-identical tool, params
  and slice list, plus `grep -q "^census:" "$f" && exit 0` per slice. Neither driver was needed twice:
  the tracked job ran to completion with **18 exit=0**.

## 8. What this changes downstream, and what it must not be read as

* **For this lane:** F-L20-3 no longer blocks the `P`/`SL` lattice extension named in §7.4. Any future
  Act II/III batch that wants the size-9 members can enumerate them **without re-running this census**;
  they are bounded, listed, and reproducible from the 18 slice files.
* **For the difficulty model:** nothing moves. The census touches the **pool**, not the curve; §5.2's
  rows, §3.5's bands and every weight are byte-identical before and after.
* **For the architect:** the mirrored-column identity (i) is the one genuinely new structural datum
  here, and it is handed over as a **question**, not a finding.
* **For the next census ticket:** the enumerator walks **growth sequences, not distinct tile sets**
  (the same pocket appears repeatedly under different build orders), so `16 431 095` / `2 788` are
  **sequence** counts. A distinct-set enumerator is the lever that makes a ≤11/≤12 pass affordable —
  and it **re-baselines those two numbers** plus the ≤10 histogram above, which is why it is a ticket
  boundary and not a silent optimisation.

## 9. Reproduction

```sh
# the whole census, 18 disjoint landing slices, 8-way (~46 min on 10 cores)
sh "$T/l20-p10-slices.sh"                    # T = the session temp dir; writes $T/p10s-<x>-<y>.txt

# a single landing (any of the 18)
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=10 --only=5,0

# reduce the 18 slices into the result + the diff vs the committed ≤8 baseline
sh "$T/l20-p10-reduce.sh"                    # writes $T/f-l20-3-p10-result.txt and echoes it

# re-dispatch after an interruption, paying only for landings still missing
sh "$T/l20-p10-slices-resume.sh"

# the instrument equivalence proof (lazy generator vs the eager builder)
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8
#   ⇒ census: 16431095 pocket(s) tested · 13163780 single-phase boundary · 2788 leak-free
#     histogram 3:34 4:204 6:510 7:2040      (identical to the committed ≤8 run, exit 0)
```

**Summary of the pass, one paragraph.** Stage P at `--pocketsize=10`, run as 18 disjoint landing
slices and cross-checked against the aborted monolithic pass, measures **724 203 655 pockets tested ·
592 804 433 single-phase boundary · 17 476 leak-free** over **18/18** landings with **0 errors** in
**45 min 37 s**. The leak-free size histogram is **`3:34 4:204 6:510 7:2040 9:14688`**; its size-≤7
rows reproduce the committed ≤8 census exactly (digit for digit in aggregate **and** per landing),
and the new size-9 row adds a **14 688-member** class while **size-8 and size-10 members do not exist
anywhere in the frame**. **F-L20-3 therefore CLOSES**, scoped explicitly to pocket size ≤ 10, with
sizes ≥ 11 named as the unmeasured residual, **no ceiling claim published in either direction**, and
**no published `par`, `B` or `D_exec` number moved**. Two structural observations are recorded
without promotion (the `x=4`/`x=6` mirrored enumeration, handed to the architect as a question; the
parity pattern of the empty sizes), and the lever for the next pass — a distinct-set enumerator that
would re-baseline the sequence counts — is named rather than taken.