# ADR-design-0007 — the BAND-ENDPOINT law (derived-exact, inclusive) · the §7.3.3 C path's standing · the batch-3 relief label blessed for R-006

- **Status:** ADOPTED (design ruling). Requires Orchestrator approval per AGENTS.md §4.
- **Date:** 2026-10-17
- **Decider:** Game Designer (Agent 1, task **GD-011**)
- **Owns:** `docs/level-design.md` **§7.9** (new), **§7.8 item 7** (new), **§7.3.1 instance 3**
  (new), §7.2's band-notation note, header V1.3, this record.
- **Governs:** (a) **how a band endpoint is read** — by any gate, census filter, relief label or
  future act — and (b) the **standing of the pre-registered C path** after Act II's census answered
  its contingency, and (c) the **registrable text** of the batch-3 relief label.
- **Schedule refs:** `docs/level-design.md` §7.0 (the integrity statement: `par` bands are law,
  `D_exec` bands are **derived**), **§7.2** (the act table), **§7.3.1** (relief-label form + the two
  named instances), **§7.3.2** (the `act-close` clause), **§7.3.3** (the falsifiable Playtest ask and
  the C path), **§7.3.4** (the batch-2 ruling), **§7.5** (proof obligations), **§7.7 / §7.8** (the
  batch handoffs); §6 / §6.1 (dip law, P1–P4).
- **Evidence refs:** `docs/project-status.md` **item 134** (LV-015 returned: the par-24 census
  answered before authoring, the anti-mirror par set, the ladder, the act-close carried by the last
  rung, the pre-published relief label, F-L31-1/2/3, **GD-011 dispatched**), **item 129** (RV-012),
  **item 128** (LV-014), **item 124** (R-004a: batch 1 registered, L25 `27.604651`, Act I peak
  `24.729412`); `docs/ai-native-pipeline.md` **§8.18 / §8.19 / §8.20** (the act law, the batch-2 and
  batch-3 records); `scripts/prove-candidate-l3135.transcript.md` **§0** (F-L31-1: the strict form at
  `prove-candidate.ts:239`, the four inclusive readings, the `git log -S` date `849b6d4`, the
  **65 CAUGHT / 0 MISSED both sides** A/B receipt); `docs/level-difficulty.md` **§5.2** (per-par
  `D_exec` windows: batch 1 `21.581395…27.771654`, batch 3 `23.204167…28.339426`), §2b (the collapse
  `D_exec = par + 3·B`), §3.5 (no unbidden numeric target); `src/core/solver/policy.ts`
  (`ACT_II_PAR_BAND [16, 24]`, `ACT_II_EXEC_BAND [19.75, 29.06]`, `BLOCK_L1619_B_BAND [1.25, 1.6875]`,
  `inParBand`, `LAW_PRECISION`); `scripts/author-l21.ts` (the batch's own inclusive census/selection
  filter); ADR-design-0005 (the act architecture — **riders, not edited**); ADR-design-0006 (the
  `act-close` clause + the relief-label form — **riders, not edited**); ADR-design-0001 (taste is not
  evidence; the withdrawn-not-refit margin).
- **Core-loop impact:** **NONE.** The locked loop (one move ⇒ one flip, no manual switch button,
  illegal = no move and no flip) is byte-identical after this ADR; so is every level byte, every
  registered row, every weight, every gate list, every band value, every sidecar cell — and so is all
  of `src/**` and `scripts/**`, which this ruling **does not touch**. The AGENTS §2 triad is **not**
  convened: this changes how a *band* is read, never the phase loop.

---

## Context — what LV-015 put in front of the design lane

Act II batch 3 (`l031`–`l035`) is solver-proven, **on the shelf (unregistered)**: pars
`19 / 22 / 22 / 24 / 24`, `D_exec` `23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426`,
`B` `1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465`, 20/20 gates and 65/65 controls on all five rungs,
`T ≡ R ≡ 0 ×5`, coverage 42/42 ×5, clone guard 26 distinct keys / 0 collisions. Its selection rule
was published **before** the run and **derives** its own par set from §7.8 item 4's anti-mirror
clause — the in-band pars batch 1's registered ladder does not use — giving the multiset
`[19, 22, 22, 24, 24]` with `par 16` absent and never substituted. Batch 3 was the first rung set in
the project's history asked, by §7.8 item 2, to stand **on** the act's `par` ceiling.

Its proving run **failed the first time** (`3/5 ACCEPT`, `L34`/`L35` REJECTED on `act2-par-band`),
and the lane published three **instrument** findings before touching any tool byte. Two of them were
**escalated rather than decided**, each with a revert path:

- **F-L31-1** — the prover compared the band **strictly** at both ends while every other reading of
  the law is inclusive, and the earlier fix had left a second question open: the printed ceiling
  (`29.06`) versus the derived-exact one (`29.0625`). *"If Game Designer or Architect rules §7.2's
  band open at its ends, the one-line comparison is reverted and `L34`/`L35` stay REJECTED — the act
  then closes only through §7.8 item 3's published par-23 reach `27.746988` (+0.142337), the §7.3.3 C
  path with its own ADR."*
- **F-L31-3** — a `g3` control that missed on `l031` only; renamed to its measured meaning with a
  `g6` substitution, battery **not** relaxed. **Not this ADR's**; the residual architecture question
  (whether `g3` must fire on *every* shape, i.e. a device with a redundant switch) is booked to the
  Architect lane.

The dispatch asked for four things: **(1)** the endpoint law, ruled and written into §7;
**(2)** the L34/L35-reject claim **untangled against §7.8 itself** — noting that the two rungs sit at
`28.126943`/`28.339426`, **below** `29.06` under every reading; **(3)** the C path's **standing**
after the census answered it; **(4)** the **relief-label text** for the L30→L31 seam **blessed or
amended** so R-006 can cite it verbatim.

---

## RULING A — the BAND-ENDPOINT law

**Original Hypothesis.** §7.0 published the `D_exec` band as **derived** and §7.2 printed the result
in a table (`[19.75, 29.06]`). The working assumption on the tool side was that the printed range
**was** the law's value, and (in the variant dated by `git log -S` to **`849b6d4`, LV-012, 14:36**)
that membership was tested **strictly** at both ends: `stamped > 16 && stamped < 24`, and
`>= / <=` against the stored `29.06`.

**Problem — two defects, and the escalation fused them.**

1. **Operator.** A strict comparison refuses a rung standing **exactly on** a published ceiling,
   while the law **requires** such a rung:
   - §7.2 writes Act II's `par` band `16–24` in the same notation as Act I's `4–20`, and Act I's
     ceiling `par 20` is **registered** (L20) — the notation has never meant "exclusive";
   - §7.8 item 2 **mandates** a `par 24` rung and names it "Act II's own band ceiling", and item 3
     calls `par 24` "in-band" **in the same paragraph** that makes it an obligation;
   - `src/core/solver/policy.ts`'s `inParBand` is `>=`/`<=` on the same constants, and
     `scripts/author-l21.ts`'s census **and** selection filters are inclusive at four call sites —
     which is how this batch's own pool was filtered;
   - and the derived `D_exec` top **is** `24 + 3·1.6875` — i.e. the published band's own top is
     defined by the ceiling being admissible, so a strict form makes the law **self-contradictory**
     rather than strict.
2. **Value.** The stored `D_exec` ceiling is the **printed** literal `29.06`, while the derived-exact
   value is `29.0625`. The `0.0025` gap is reachable **only** at `par 24` with
   `B > 5.06/3 = 1.6866̄` — inside the still-legal `B` band top `1.6875`. A gate comparing against the
   rounded text therefore rejects a rung the law admits. (Where the rounded form is pure notation the
   same reading is harmless: Act I's band top is **measured**, and `24.729412 ≤ 24.73` either way.)

**Verdict on the escalated claim, untangled (the deliverable the dispatch asked for).**

| Claim component | Verdict | What it actually turned on |
|---|---|---|
| "`L34`/`L35` REJECT if the band is ruled strict/open" | **TRUE in effect** | the **`par` ceiling `24`** compared strictly at `scripts/prove-candidate.ts:239` — an **integer** law constant with **no rounding in it** |
| "…at the printed `29.06`" | **WRONG in cause** | the `D_exec` ceiling never touched them: `28.126943` / `28.339426` are **strictly inside `[19.75, 29.06]` under every reading**, so no reading of that endpoint could have rejected them (a band endpoint in a *strict* form still admits interior values — the two rungs sit ~0.7–0.9 **below** the ceiling) |
| "the act then closes **only** via the C path" | **FALSE as an absolute** | §7.3.2 places the carrier obligation on the act's **last two batches**, so batch 4 (L36–L40) is a legal carrier; and the premise is moot, since the strict reading is refused and the act-close is carried at `28.339426` (**+0.734775**) |

Two ceilings, two readings, two refutations — that is the whole untangling. The `par` ceiling is
inclusive on four independent readings; the `D_exec` ceiling is `29.0625` **by derivation** and only
*printed* `29.06`.

**Change — the law, as published in §7.9 (binding on all acts, gates, censuses and labels).**

> A band is a range over **DERIVED-EXACT** values and is **INCLUSIVE at both ends**. It is computed
> from its formula — `[par_min + 3·B_lo, par_max + 3·B_hi]` for `D_exec`, the integer range for `par`
> — and is **never** read back from rounded text. Printed forms (`[19.75, 29.06]`, `16–24`, `4–20`)
> are **display roundings**; a comparison against a printed form is a **defect**, and so is a strict
> (`<`/`>`) endpoint comparison. Act II's `D_exec` band is **`[19.75, 29.0625]`**; `par 24` is in
> band; a rung at `par 24` / `B = 1.6875` / `D_exec = 29.0625` is **in band**.
> **Derive-from-formula; never compare against rounded text.**

**Corollary — the latent half, named and handed over.** Under this law the **stored constant must be
the derived value**: a constant equal to a printed rounding is a **latent endpoint defect even while
no row occupies the sliver**, because §7.8 item 2's own mandate (`par 24` ⇒ up to `29.0625`) is then
unbuildable at its top. **This ADR is prose only**: it edits no `src/**`, no `scripts/**`, no
constant. Aligning `ACT_II_EXEC_BAND[1]` (and any sibling constant) with its formula — or making the
comparison read the formula — is a **code follow-up for the Architecture, Gameplay and Level/Solver
lanes**, and the Game Designer writes no code (AGENTS §4).

**Blast radius on published/measured rows (by name).**

| Row (by name) | `D_exec` | Inside derived-exact `[19.75, 29.0625]`? | Verdict change |
|---|---|---|---|
| batch 1 **registered tail — L25** | `27.604651` | ✔ (both readings) | none |
| batch 2 shelf max — **L30** | `27.566265` | ✔ (both readings) | none |
| batch 3 census top (3-pocket, `par 24`) | `28.771084` | ✔ (both readings) | none |
| batch 3 rung **L34** / **L35** | `28.126943` / `28.339426` | ✔ (both readings) | none *(the `par` operator no longer refuses them)* |
| Act I measured top — **L20** | `24.729412` | ✔ Act I band `9.00–24.73` (measured) | none |

**No published row changes side.** The only rows whose verdict changes are **hypothetical and
unmeasured to date**: (a) `par 24` with `B ∈ (1.6866̄, 1.6875]` ⇒ `D_exec ∈ (29.06, 29.0625]` —
**empty in every census so far** (batch 3's par-24 reads top out at `28.771084`); (b) a rung standing
**on** a ceiling — exercised for the **first time** by batch 3's `par 24`.

**Evidence.** LV-015's A/B receipt: the pre-fix prover was extracted from `HEAD` (temp file, never
committed) and both versions ran **root L21–L25** and **shelf l026–l030** → **5/5 ACCEPT, 13/13
controls each, 65 CAUGHT / 0 MISSED on both sides**, status surfaces differing in **exactly one line
per set**, **no control changing `CAUGHT`/`MISSED`**; `849b6d4` (LV-012, 14:36) dates the strict form
~7.5 h **before** GD-010 (`ef643f7`, 22:06) published the par-24 obligation, and every Act II rung
recorded until batch 3 sits at `par 17–23`, **strictly inside** — so the endpoint comparison had
**never been exercised** when the law depending on it was written; `docs/level-difficulty.md` §5.2's
per-par windows; the constants and `inParBand` in `src/core/solver/policy.ts`; §7.2's registered
`par 20` ceiling (L20).

**Result.** §7.8 item 2's route is buildable **at its own ceiling**; the strict form is refused as the
**outlier** (it contradicted four readings and the arithmetic the law itself uses); no board, weight,
band, gate list, sidecar cell or registered row moves; and a printed band value may no longer be used
as a comparison operand anywhere in §7 or in its law constants.

---

## RULING B — the §7.3.3 C path: KEPT ARMED for a future act; its Act II fallback ground RETIRED by measurement

**Original Hypothesis.** §7.8 item 3 pre-registered a **fallback** in case Act II's `par 24` class
turned out to be unreachable: the published, deliberately unselected par-23 reach **`27.746988`**
(`+0.142337` over the registered peak), travelling the **§7.3.3 C path with its own ADR**. Separately,
§7.3.3 pre-registered the same remedy as the answer to a **playtest** signal (`deflation`).

**Problem.** LV-015 **measured the contingency absent before authoring**: `par 24`'s pool is
**non-empty** — 3-pocket family at band `[24,24]`: **130 accepts of 2640 judged**, an **exact** count
(no cap hit, budget not reached; `202` tuples at `par 24`, `D_exec ∈ [28.560241, 28.771084] ⊆
[27.7500, 29.0625]`) — and on the batch's own `CX = 1` frame: **498 accepts of 20000 judged**
(published as a **floor**). The act-close clause was then discharged by the batch's **last rung**
(`28.339426 > 27.604651`, **+0.734775**), inside §7.8 item 2's window with `+0.589426` of margin.
Without a rule, the project is left with a pre-registered remedy whose trigger is *known to be absent*
— which invites two opposite errors: quietly invoking it anyway, or quietly deleting it.

**Change (published at §7.8 item 7).**

- The C path is **KEPT ARMED**, and its **Act II par-24-absence ground is RETIRED**: a contingency
  whose condition is measured absent is **falsified, not dormant** — it may **not** be invoked on that
  ground, and the par-23 reach `27.746988` is **not** a standing spare the act still owes itself.
- It stays armed for **(a) a future act** whose own census measures a band-ceiling class unreachable,
  and **(b) its own §7.3.3 trigger** — the playtest `deflation` signal (≥ 2/5 quit-within-next-level
  at the L25→L26 seam) — each use requiring **its own ADR** as published.
- **Retiring it outright is refused**: nothing about Act II falsifies the remedy's legality for an act
  that has **not** been censused, and deleting a pre-registered remedy on one act's census would be
  the **mirror error** of adopting it on zero data — the exact practice ADR-design-0001 withdrew.

**Evidence.** Item 134; `docs/ai-native-pipeline.md` §8.20 (STEP 1 / STEP 1b: the census, the GO
verdict, the STOP branch not firing, the fallback "unused, unselected, undecided"); §7.8 item 3's own
wording, which conditions the fallback on the census outcome alone; the `act-close` discharge at
`28.339426`.

**Result.** The C path's **status is published**, not inferred: armed for the future, retired for the
ground it was registered against. No number, row or band moves; the Playtest ask (§7.3.3) is
untouched and remains `NOT TESTABLE, n = 0`.

---

## RULING C — the batch-3 relief label (`L30→L31`) is BLESSED for R-006, with a notation-only amendment

**Original Hypothesis.** §7.3.1 publishes the relief-label **form** once and makes every later relief
a **fill-in against it**; a relief with **no pre-published label is not registrable**. RV-012 (item
129) found batch 2's interior relief was labelled *after* the transfer.

**Problem.** Batch 3 opens at `L31 = 23.204167` under batch 2's maximum `L30 = 27.566265`
(`ΔD_exec = −4.362098`, `Δpar −4`), and the batch is still **unregistered** — so R-006 will have to
cite the label **verbatim** from this file. LV-015 duly pre-published it **before `--write`**
(commit `6f3b25b`'s published-form section → the five bytes at `b35cdc8`), which discharges the
process fix. But its band was written in the **printed** form `[19.75, 29.06]`, and RULING A now
forbids printed forms as comparison operands/law text.

**Change.** §7.3.1 gains **instance 3**, and the label is blessed as follows:

- **Text:** the §7.3.1-form label for the seam **`L30→L31`**, kind **`batch-seam`**, with the band
  written **derived-exact** (`[19.75, 29.0625]`) **with the printed form in parentheses**. This is a
  **notation-only amendment under RULING A**, disclosed as such.
- **Numbers: unchanged.** `Δpar −4`, `3·ΔB −0.362098`, `ΔD_exec −4.362098` — exactly what LV-015
  published **pre-write**. The amendment was made **before registration**, by the role that owns the
  file, so the **law-before-bytes order is not re-opened** and no number moved after a byte was
  written.
- **Constants proposed for the law files:** `ACT_II_B3_SEAM_RELIEF_LEVEL_ID = 31`,
  `ACT_II_B3_SEAM_RELIEF_EXEC = 23.204167`, `ACT_II_B3_SEAM_RELIEF_DELTA = −4.362098` (shelf-side
  previous value `L30 = 27.566265`), mirroring the `ACT_II_B2_SEAM_RELIEF_*` triple.
- **Substance preserved:** `ΔM = 0`, execution axis only, **never a dip, never felt-ease, discharges
  no clause**; the relief is **largely an instrument artifact** (the anti-mirror par derivation drops
  the `par` term by 4 by construction, and the deeper device carries a **lower `B` centre**
  `1.3500…1.4465`); the equal-par pairs **rise** (`+0.019191` / `+0.212483`), so nothing else is owed;
  the **felt half is a labelled Playtest hypothesis** (§7.3.3, `NOT TESTABLE, n = 0`).

**Evidence.** Item 134 ("relief label L30→L31 −4.362098 PRE-PUBLISHED before --write (GD-010
registrability law WORKING)"); §8.20's relief section; §7.3.1's published form; the arithmetic
`27.566265 − 23.204167 = 4.362098`.

**Result.** R-006 has a **verbatim-citable** label whose readings were fixed before the bytes, and the
file's band notation is now uniform with RULING A. No board, constant or registered row moves.

---

## Decision

1. **§7.9 is PUBLISHED LAW:** bands are **derived-exact** ranges, **inclusive at both ends**;
   printed forms are **display roundings**; **derive-from-formula, never compare against rounded
   text** — binding on §7.2, §7.3.1, §7.5, §7.7, §7.8 and all future acts. Act II's `D_exec` band is
   `[19.75, 29.0625]`; `par 24` is in band.
2. **F-L31-1 is RULED:** the strict/open reading is **refused**; the escalation's cause is corrected
   (the `par` ceiling `24`, not the printed `29.06`); the "closes only via the C path" branch is
   **false as an absolute** (§7.3.2 leaves batch 4 as a legal carrier, and the branch is moot).
3. **The C path is KEPT ARMED for future acts and its Act II fallback ground is RETIRED by
   measurement** (§7.8 item 7). Outright retirement refused.
4. **The batch-3 relief label (`L30→L31`, `−4.362098`) is BLESSED for R-006 verbatim citation** with
   a notation-only band amendment (§7.3.1 instance 3). Numbers unchanged from LV-015's pre-write
   publication.
5. **ADR-design-0005 and ADR-design-0006 are not edited** — this ADR **riders** onto them by name.
6. **No code, no constant, no dataset, no gate, no band value, no registered row moves.** The
   constant/operator alignment implied by RULING A's corollary is **handed over**, not performed.

---

## Consequences

- **Positive.** The `par 24` route §7.8 item 2 mandated is buildable **at its own ceiling**; a printed
  number can no longer become a comparison operand anywhere in §7; the C path's status is published
  instead of inferred; R-006 can cite the seam label verbatim; and the failure mode is now named —
  *a law can be contradicted by the tool that reads it, and a printed rounding can hide a live
  endpoint*.
- **Handed over (not this lane's to do).** (a) **Architecture / Gameplay / Level-Solver:** make the
  stored `D_exec` band constant **equal its formula** (or make the comparison read the formula), so
  the `(29.06, 29.0625]` sliver is legible to the gates; the prover's `act2-*` gates are the Level
  lane's. (b) **QA:** any test that pins `[19.75, 29.06]` as a **value** rather than as display text
  should be re-booked to the derived-exact form. (c) **Architect:** the F-L31-3 residual (a control
  that must fire on every shape ⇒ a device with a **redundant switch**), already booked.
- **Neutral.** §7.2's table keeps its readable printed forms (with the notation note); §7.8's window
  `[27.7500, 29.0625]` was already derived-exact and needs no change — the same law now governs
  everything around it.
- **Risk named.** Any lane that re-derives bands from printed prose rather than the formula
  re-introduces the defect; §7.9's clause is the guard, and this record is its evidence trail.