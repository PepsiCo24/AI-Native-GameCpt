# ADR-design-0012 — the Act IV band (derived-exact), the `L61–L65` opener rule, the reservation's Act IV scope, and the register's first **comparator-free `act-open`** relief bound (instance 9, `L60→L61`)

> Owner: **Agent 1 — Game Designer** · Task **GD-016** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> Law text: `docs/level-design.md` **§7.11** — **§7.11.1** (the Act IV `D_exec` band, derived-exact, with
> the growth law and three dated assumptions), **§7.11.2** (the `L61–L65` opener rule, O1–O6 re-based, and
> the **enter-the-band** ruling that refuses the "hold at Act III's ceiling" reading), **§7.11.3** (the
> reservation's Act IV scope, `L61–L70`, `par ≤ 30`, ruled as a **read-out of O3**), **§7.11.4** (register
> §7.3.1 **instance 9**: the `L60→L61` `act-open` relief, pre-published), **§7.11.5** (mechanics stance,
> the comprehension plan as a **NAMED HOLD**, the deferrals, and the refusals with their arithmetic).
> The register row is `docs/level-design.md` **§7.3.1** instance **9**; §7.2's band-notation note gains
> Act IV's derived-exact form so the act table is never read as a banner of printed roundings.
> **Rider, not an edit:** **ADR-design-0005** (the acts table, the `act-peak`/interior-freedom law) and
> **ADR-design-0008** (the Act III band + opener rule — the template this section re-bases) are **quoted and
> extended, never rewritten**; ADR-design-0006 / -0007 / -0009 / -0010 / -0011 and `docs/game-design.md` are
> **not touched**.
> **Why a NEW number rather than a rider of its own:** an act's band and opener are the one class of law that
> has so far received a **record per act** — ADR-design-0008 is Act III's; the acts themselves were ruled in
> ADR-design-0005. A rider file would have had to name a parent whose scope is a *different act*, which is
> exactly the mislabelled-home error GD-013 avoided when it kept Act III's interior law inside Act III's
> section. So this is a **new ADR that is itself a rider** to 0005 and 0008.
> Scope: **no code.** This ticket writes no `src/**`, no `scripts/**`, no `tests/**`, no level byte and no
> constant. Every number is **read from `src/core/solver/policy.ts`** at this ticket's base, **read from a
> law artifact**, or **derived by the arithmetic printed beside it**; `ACT_IV_*` is **absent from
> `policy.ts` today**, so all Act IV constants below are **proposals** for the level lane's registration
> train, not existing declarations.
> Trigger: Act III's tail (`L56–L60`) is ruled (GD-015 / ADR-design-0011) and its census era is next, and
> **an act's band and opener are ruled BEFORE its first census** — the order GD-012 set for Act III in its
> own words. No Act IV byte may exist until this section lands, and `docs/project-status.md` item 167 names
> the constant re-pins that the same era owes.

> **STATUS LINE — dated 2026-10-20 (GD-016b): RV-015 CORRIGENDA APPLIED (items 1–4, WORDING ONLY); RULINGS
> UNMOVED; R2/R3 BOOKED TO GD-017.** RV-015 re-derived every bound, half, margin and refusal in this ADR and
> in `docs/level-design.md` §7.11 and reported **zero arithmetic deltas** — what died is wording. The four
> fixes, recorded here without moving anything: **(1)** §7.11.2's **O6** cell contradicted its parent clause
> §7.10.6 **B5**; it is rewritten to B5's semantics (the plural tie-break is scoped to **NON-FINAL** rungs, and
> in `[24,26,28,30,30]` the non-final `par 30` multiplicity is **one** ⇒ `L64` = pool **minimum**, `L65`
> (closing) = within-par **maximum**), with the **refuted wording kept VERBATIM** in a dated supersession
> record (a corrigendum that erases its evidence trail is a restamp). **(2)** the `+4` "**independent
> readings**" label is corrected to a **growth READ-OUT** — an **induction** from the single Act II→III step,
> Act I excluded, both computations bottoming on §7.2's same designed table — and the fix's form is the
> **FORBID sentence** (*no future act band may be DERIVED FROM `+4`; bands anchor via §7.2's per-act rows*),
> **not** an assumption `A4`, because an assumption is what a derivation *leans on*. **(3)** the refuted B1
> variant is renamed a **CROSS-ACT `ℓ` CONTINUATION** (Act III ends at `ℓ = 4`) and the true **DATASET-SCOPED
> counter** collapse is added — `ℓ = 13` ⇒ `A = 48`, **harder** than the `ℓ = 5` ⇒ `32` already published.
> **(4)** **V3** gains its explicit **`*Owner-program:*`** sentence (level lane, Act IV opener era,
> fill-in-before-bytes + `near()` on the **frozen pair**, `F-GD014-1` family, program-side check in the
> `ARCH-006c` symbol form), matching V1/V2. **BAND, OPENER LADDER, INSTANCE-9 HALVES, REFUSAL STACK, DEFERRALS
> AND EVERY NUMBER ARE UNCHANGED** — re-verified after these edits by the whole-file counter instrument
> (distinct-numeric-value set identical; **no pre-existing occurrence altered, only restatements added**).
> **GD-017 OWNS the two REAL legislation riders RV-015 booked** (the **GD-012 near-era precedent** forbids
> legislating them here — this STATUS line **records the booking, it does not legislate**): **(R2) the Act IV
> closing-batch RANK COMPARISON (`L80` vs `L75`)**, in **§7.10.13.3's form** — pre-byte program comparison,
> the closing rung taking its own pool's B5 maximum, with the **named-limitation fallback** carrying both
> measured numbers when the pool refuses the selection — **DUE BEFORE the `L71–L80` census** (a comparison
> written after the bytes is a justification, not a duty). **(R3) the across-act `act-peak` clause + its
> comparator constant** — the **R-009 analogue of `ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II`** (`2.0` in
> `policy.ts`) — declared **PIN-LITERAL**, never as a growing alias, because **Act III's tail moves at
> `L51–L60`** and an alias would be correct only **contingently** (`F-GD014-1`'s own rule).
> **Authority: RV-015's structural findings.** The generalizing law **exists on disk** — §7.3's strict-increase,
> §7.3.2's last-two-batches carrier clause, and its ACT-MAX rider generalised — so **a lower Act IV tail is
> UNLAWFUL, not merely undesired**; and the duty is **satisfiable by construction**, because the `par 30`/`par
> 32` classes `[33.7500, 35.0625]` / `[35.7500, 37.0625]` both **clear Act III's ceiling `33.0625`** — so the
> comparison's pool condition can be met without padding.

---

## Why this is its own ADR (and why three of its five rulings could not have been published earlier)

1. **An act's band is an instantiation, and an instantiation owes its own evidence.** Act IV's band is
   **already law** in ADR-design-0005's acts table — but only as a **printed range**. GD-011 (§7.9) made
   printed forms *display roundings* and forbade them as operands; GD-012 published Act III's **derived-exact**
   band and the read-out that the band **translates its predecessor by exactly `+4` on both ends**. The Act IV
   instantiation is therefore the first act whose band can be checked against **§7.2's own row** and against
   that read-out at once — and they are checkable **together** to the last digit. *(RV-015 item 2, applied by
   GD-016b: they are **not** two independent derivations — both bottom on §7.2's designed table — and the `+4`
   step is **forbidden as a band source** at `docs/level-design.md` §7.11.1.)*
2. **The opener rule must be re-based, not re-invented, and the "which act's floor?" question is new here.**
   §7.10.2's O1–O6 were written with Act III's constants. Re-basing them raises a question Act III never
   asked: whether Act IV's opener anchors at Act IV's floor or at the class Act III just closed on. That is
   the **first** act seam whose right-hand side is a **whole act's** opener rather than an interior batch, and
   it is the first whose left-hand side is a batch whose **fallbacks are all STOP-gated** (see ruling C).
3. **The register's comparator-free class needs its `act-open` case.** GD-015 named the general form
   (*when `Δpar` is fixed by law and `3·(B_hi − B_lo) < |Δpar|`, the bound and its sign are
   comparator-free*) on a **`batch-seam`**. Instance 9 is that class's **`act-open`** case — and it is the
   sharpest one available, because instance 5, the register's *other* `act-open`, did **not** have it (it
   needed `L40 = 28.455319`). Publishing the class on both seam kinds is what turns a one-off into a law the
   lane can pre-run.
4. **A deferral has to be published as a deferral.** The Act IV interior-batch ladders are **not** this
   ticket's (GD-012's precedent: the opener ticket did not legislate interior ladders; GD-013 did, when the
   lane was **gated**). But one anchor *is* forced by the band law already, and the scope question behind it —
   is B1 act-scoped or dataset-scoped? — must be answered **from disk**, or the deferral would silently
   import a wrong anchor.
5. **Comprehension must be ruled by omission *out loud*.** Act IV's first batch introduces **no** debut, so §6
   fires **no** dip and there is no teaching beat to hang on a rung. Saying that plainly — a **NAMED HOLD**
   with its basis, its readability duties, its named risk and its falsification clause — is the alternative to
   silence, and silence is what ADR-design-0001 withdrew as evidence.

---

## RULING A — the Act IV `D_exec` band is `[27.7500, 37.0625]`, derived-exact from §7.2's own Act IV row and cross-checked by a growth read-out (RV-015 item 2: the two computations are **not** independent readings)

**Original Hypothesis.** ADR-design-0005's acts table prints Act IV's band as `[27.75, 37.06]` alongside its
`par` band `24–32`. The working assumption on the tool side could have been either (a) the printed pair is
the law's value, or (b) each act's band is a fresh derivation from that act's own measurements. GD-011 and
GD-012 each killed one half of that: printed forms are **display roundings** (§7.9), and the `B` band is
**one measured band** aliased by every act (`ACT_II_B_BAND` and `ACT_III_B_BAND` are both
`BLOCK_L1619_B_BAND`).

**Problem.** If (a) held, Act IV's band top would be a comparison operand whose rounding hides a live
endpoint — the GD-011 defect class, one act later. If (b) held, no act's band could be published **before**
its census, which would make the whole "law before bytes" order impossible for every future act. And the
growth law itself had never been tested across a second step: GD-012 showed `+4` for Act II→III, which could
have been an artifact of two adjacent bands rather than a law.

**Change.** Act IV's band is published **derived-exact** as **`[27.7500, 37.0625]`**, *printed*
`[27.75, 37.06]`, with the derivation shown **once and its cross-check beside it**:

```text
band law, from §7.2's OWN Act IV row   (the ONLY source; §7.11.0's integrity row):
  ACT_IV_PAR_FLOOR = 24  ·  ACT_IV_PAR_CEILING = 32
  EXEC_FLOOR   = 24 + 3·1.2500 = 27.7500 · EXEC_CEILING = 32 + 3·1.6875 = 37.0625
growth READ-OUT, cross-checked against the block above:
  floors   : 16 (II) · 20 (III) · 24 (IV) · 28 (V)      ⇒ +4 per act
  ceilings : floor + 8                                   ⇒ +4 per act
  §7.10.1's read-out of Act II→III: "translates Act II's by exactly +4.0 on both ends (ΔEXEC = ΔPAR)"
  applied  : [23.7500, 33.0625] + 4 = [27.7500, 37.0625]   — agrees to the last digit
  BASIS    : an INDUCTION from ONE observed step (Act II→III). Act I is EXCLUDED — its row is a
             MEASURED `9.00–24.73` over a `4–20` rung ladder, not a derived band over a per-act
             par row. BOTH computations bottom on §7.2's SAME designed table, so the agreement
             says the read-out is not CONTRADICTED — never that an independent route exists.
```

The derivation and the read-out **agree to the last digit**, so the published law **uniquely determines** Act
IV's band and **no STOP-AND-ROUTE is owed** — the dispatch's condition (*"if the published law does NOT
uniquely determine Act IV, rule among the named admissible readings with STOP-AND-ROUTE"*) is **not
triggered**. Both endpoints are **dyadic** (`111/4` and `593/16`) ⇒ IEEE-754 bit-exact, and §7.9's
inclusivity is operator-free. **The two computations are NOT independent readings, and the `+4` step is
FORBIDDEN as a band source** — the form of the fix is the FORBID sentence, not a dated assumption `A4`
(an assumption is what a derivation *leans on*; publishing `+4` as one would re-import the misreading).
Bands anchor through **§7.2's per-act rows**, which is what each act's own row already did. **No value
moves:** the band stands on §7.2's row IV alone (RV-015 item 2, applied 2026-10-20 by GD-016b;
law text: `docs/level-design.md` §7.11.1).

Three **dated assumptions** are published so a census can falsify them:

- **A1 (2026-10-20)** — the `B` band is **act-invariant by reference**: `ACT_II_B_BAND` / `ACT_III_B_BAND`
  are aliases of `BLOCK_L1619_B_BAND` = `[1.2500, 1.6875]` (the L1–L15 measurement), and Act IV derives on
  the same reference. A per-act re-measurement is **unbuildable before a census** and would reprice every
  published band; if the measured band ever widens, **every** act band moves — a design change (this file +
  an ADR), never a generation outcome (§7.3).
- **A2 (2026-10-20)** — `D_exec = par + 3·B` (the measured theorem, `T ≡ R ≡ 0`) and §7.9's
  derive-from-formula rule.
- **A3 (2026-10-20)** — §7.2's act boundaries hold: **Act IV is `L61–L80`** (four batches of five), so
  `L61–L70` is its **first half** and the `act-close` carrier window is **`L71–L80`** (§7.3.2's own text puts
  the carrier on an act's **last two batches**; §7.10.1 reads Act III's as `L51–L60`). The dispatch's
  `L61–L70` is corrected by the plan of record, exactly as GD-012's changelog corrected *"L41–L6x"* → `L60`.

**Evidence.** `policy.ts` at this ticket's base: `ACT_III_PAR_FLOOR = 20`, `ACT_III_PAR_CEILING = 28`,
`ACT_III_B_BAND = BLOCK_L1619_B_BAND = [1.25, 1.6875]`, `ACT_III_EXEC_BAND` computed = `[23.75, 33.0625]`,
`LAW_PRECISION = 5e-7`; a throwaway disk-reading script computed `[27.75, 37.0625]` by **both** routes and
diffed them to `0` — **read as a cross-check, not as two independent derivations** (RV-015 item 2); `ACT_IV_*` greps as **ABSENT** from `policy.ts` today; §7.2's Act IV row and §7.10.1's
`+4` read-out are on disk; §7.10.3's totality statement already covers Act IV (`24–32`) inside the published
star rows (`21–30 → k1 6 / k2 12`; `31–40 → +8 / +16`).

**Result.** Act IV has a band that can be read by a gate **before** any of its boards exists; the `+4`
read-out is now **confirmed consistent with §7.2's own row IV** — the same table's designed step, **not** a
second measurement and **not** a band source (RV-015 item 2; the FORBID sentence lives at
`docs/level-design.md` §7.11.1); the printed row in §7.2 is confirmed to be a display rounding of exactly
this pair; and no number in Act I/II/III moves.

---

## RULING B — the `L61–L65` opener ENTERS the Act IV band at its own floor, and the "hold at Act III's ceiling" reading is refused

**Original Hypothesis.** §7.10.2's O1–O6 are Act III's opener law. The plausible-but-unstated alternative at a
new act's seam is a **hold**: open Act IV at the class the previous act closed on (`par 28`), on the reasoning
that a player arriving from four `par 28` rungs should not be dropped to a lower class.

**Problem.** The hold reading is not a preference question, it is a **law** question, and the law is on disk —
but it is on disk in two places that must be read together: O1's formula (`L_i = PAR_FLOOR + 2·(i−1)`, where
`PAR_FLOOR` is *the act's own* floor) and the ratified default. U-002 records the user's own ruling: the Act
III opener is the **floor-anchored** ladder `[20, 22, 24, 26, 26]`, *"par 20 opener, the `−4` par-term breath
after Act II's par-24 climax"*. Read together, the Act II→III precedent decides the case: Act III opened
**four par below** Act II's ceiling. A later ticket must not quietly invert a ratified default by taste.

**Change.** The opener rule is published as **§7.10.2's O1–O6 re-based on Act IV's constants** — quoted, never
re-derived — giving the ladder **`[24, 26, 28, 30, 30]`**, with:

- **O1** `L_i = ACT_IV_PAR_FLOOR + 2·(i−1)` ⇒ window `(24, 26, 28, 30, 32)`;
- **O2** the derived top `par 32` **withheld**; the 5th rung repeats the truncated top `par 30` at its
  within-par **maximum**;
- **O3** opener rungs top out at `30 + 3·1.6875 = 35.0625` while any `par 32` tail rung bottoms at
  `32 + 3·1.2500 = 35.7500` — margin **`0.6875`**, **act-invariant by construction**
  (`2 − 3·(B_hi − B_lo) = 2 − 1.3125`), numerically equal to `ACT_III_CEILING_RESERVATION_MARGIN` (a
  **checkable coincidence, never a template**: in `policy.ts` that constant is *derived* from its own act's
  endpoints and opener top, so the Act IV sibling is derived likewise);
- **O4** the multiset differs from **all eight** known Act II/III multisets, and the distinctness is
  **structural** — `[24,26,28,30,30]` is the only one carrying `30` at all;
- **O5** ABSENT-never-substituted with a **rising** fill (the instance-5 precedent admits exactly two
  first-rung readings: `par 24` or `par 26`), then **STOP-AND-ROUTE to GD**;
- **O6** the final rung at the within-par maximum, earlier rungs at the minimum — **B5's scope read exactly**:
  the plural-same-par tie-break fires only where **two or more NON-FINAL** rungs share a par, and
  the opener ladder's non-final `par 30` multiplicity is **one** (`L64`) ⇒ it **never fires** here, so
  `L64` = the pool's `par 30` **minimum** and `L65` (closing) = the pool's `par 30` **maximum**. *(As first
  published this bullet added "applying from the act's first batch" over both `par 30` rungs — a claim that
  contradicts B5; the refuted wording is kept verbatim in `docs/level-design.md` §7.11.2's dated supersession
  record. RV-015 item 1, applied 2026-10-20 by GD-016b: wording only.)*

`L61 = par 24`, so the seam's `par` term is `Δpar = −4` against Act III's closing `par 28`, and the seam is a
§7.3.1 relief (ruling C) rather than a dip: **`ΔM = 0`**, no mechanic introduced.

**The HOLD reading is refused on three grounds, stated in their own weights.**

1. **Unauthorised deviation.** O1's ladder is floor-anchored **by its own formula**, and the only ratified
   reading of an act's opener is the floor anchor (U-002). A deviation owes an ADR and a reason; **no reason
   exists on disk**.
2. **It leaves the act's floor class homeless at the only batch that can home it cheaply.** §7.10.9.1's
   tie-break ground (ii) — *"every value of the derived window keeps a home in the act's ladders"* — was
   **SPENT** for Act III's `ℓ ≥ 2` batches and was recorded as spent rather than re-asserted (GD-013). At a
   **new act's first batch** it is **live again by construction**, because no Act IV ladder has landed and
   nothing in the window has a home. Recorded here so it is not re-quoted after it dies the second time.
3. **It would open the act by re-entering a class Act III already occupies four times.** `par 28`'s class is
   `[31.7500, 33.0625]` — **the same numbers** as `L57–L60` — so a `par 28` opener would make Act IV's first
   board a par-class repeat and its distinctness would rest on geometry alone. **This ground is not a refusal
   by itself**: distinctness is checkable (clone guard §6.1.4) and a legal board may share a class. It is
   recorded as *desirability*, explicitly not as unlawfulness — ground 1 is what refuses the hold.

**Evidence.** §7.10.2's O1–O6 text; §7.10.2's own O3 arithmetic re-based (computed at this base:
`35.0625`, `35.7500`, margin `0.6875`); U-002 as recorded in `docs/project-status.md` item 153; §7.10.9.2 B1 /
§7.10.11 B1 (the anchor-advance text); §7.4 stages `I`/`J`; the eight known multisets; the clone guard.

**Result.** Act IV's first board is `par 24` — the act's own floor, four `par` below the class the previous
act closed on — the tail keeps a class (`par 32`) strictly above every non-tail rung's ceiling **regardless of
any `B` an opener measures**, and the file does not silently invert a user-ratified default.

---

## RULING C — register §7.3.1 instance 9 (`L60→L61`) is pre-published with the register's first **comparator-free `act-open`** bound, and it carries three self-voiding clauses

**Original Hypothesis.** Every relief in the register has so far been priced against a **measured comparator**
(`L20 = 24.729412`, `L25 = 27.604651`, `L30 = 27.566265`, `L35 = 28.339426`, `L40 = 28.455319` on the
`act-open` side, `L45 = 30.455319`, `L50 = 30.417021`, `L55`-pending). GD-015 named a **general escape** from
that pattern on a `batch-seam` (instance 8: *when `Δpar` is fixed by law and `3·(B_hi − B_lo) < |Δpar|`, the
bound and its sign are comparator-free*). The open question was whether that class reaches an **`act-open`**
seam, where the register's older instances all needed a comparator.

**Problem.** The Act IV opener anchor (`par 24`, O1/B1) and Act III's closing rung (`par 28`, §7.10.11's
B4/B5) are **both law**, so nothing about either `par` is a selection; and the `B` term is bounded by the
published band. So a comparator is **not needed** — but the register's form has always carried a left-side
number, and dropping it silently would leave the label unable to say *what it measures against* (`F-L31-2` /
`F-L36-2`: *a label that no longer describes the thing it measures*). At the same time, **both** sides are
future measurements: Act III's batch 4 has not been censused, and its B6 fallbacks are **all flat and
STOP-gated** (§7.10.11 B6). A bound published as a certainty would therefore be a false certainty.

**Change.** §7.3.1 gains **instance 9**, pre-published **before the census and before any byte**, with the
bound derived and the halves never hulled:

```text
ΔD_exec = Δpar + 3·ΔB     with Δpar = 24 − 28 = −4     (BOTH pars are LAW, not selections)
ΔB      ∈ [−0.4375, +0.4375]   ⇒  3·ΔB ∈ [−1.3125, +1.3125]
⇒ at par 24 : ΔD_exec ∈ [−5.3125, −2.6875]      (= [27.7500, 29.0625] − [31.7500, 33.0625])
⇒ at par 26 : ΔD_exec ∈ [−3.3125, −0.6875]      (O5's one admissible rising fill; = [29.7500, 31.0625] − [31.7500, 33.0625])
SIGN IS FIXED BY THE BAND:  |3·ΔB| ≤ 1.3125 < |Δpar| = 4  ⇒  ΔD_exec < 0 for EVERY in-band pair
```

Four properties are published so the lane **verifies** rather than trusts:

- **(a) Comparator-free, and the contrast is checkable.** Instance 5 — the register's other `act-open` — had
  to price against `L40 = 28.455319`; instance 9 needs only that both boards are **in band**. The `1.3125` is
  `3·(B_hi − B_lo)`, the same number §7.10.7 published as the `Δpar = 0` residue bound — quoted as a
  **checkable coincidence, never a template**.
- **(b) Two halves, never a hull.** A fill-in is checked against the half its `par` names; a value inside
  `[−5.3125, −0.6875]` but in neither half is **outside** the label (the instance-6 rule, quoted). Each half's
  midpoint is exactly its `par` term, and the `B` half contributes `±0.65625`.
- **(c) A numerical coincidence is named so it cannot be cross-quoted.** `[27.7500, 29.0625] − 30.455319 =
  [−2.705319, −1.392819]` — **the same numbers** as instance 5's `par 22` half, with **different referents**
  (instance 5's is `L41`'s class against `L40`'s measured `B = 1.4851`; this one is Act IV's band-floor class
  against Act III's registered tail). Cross-quoting is forbidden.
- **(d) The register form still owes a left side.** A comparator-free bound still owes a **pinned comparator
  at the fill-in** (`F-GD015-1`), so instance 9's constants are proposed in the **PIN-LITERAL** form
  (`_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 60`, `_PREVIOUS_EXEC_AT_REGISTRATION = <L60's registered value>`),
  and **never** as an alias to `ACT_III_REGISTERED_TAIL_*`: whether that symbol points at `L60` depends on
  §7.10.13.3's rank comparison, i.e. an alias would be correct only **contingently**, and `F-GD015-1`'s rule
  admits an alias only over a referent **frozen by construction**.

**Three self-voiding clauses, each with its named owner-program.**

- **(V1) Dilation conditional.** The band-width step holds **iff both boards' `B` sit in the published band**
  (§7.5's F-L16-2 excursion register). A **named excursion** on `L60` or `L61` **voids** the step: the value
  becomes a fill-in against the measured pair, the published halves are **retired for this instance** (never
  widened), and the lane **STOP-AND-ROUTES to GD**. *Owner-program:* the level lane's Act IV census — the only
  program that can produce the excursion; remedy owed **before** the bytes.
- **(V2) Left-side conditional.** `L60 = par 28` is law **only while Act III's batch 4 is registrable at
  all**: §7.10.11's B6 makes every `ℓ = 4` fallback a **flat, STOP-gated** batch, so if it fires, batch 4
  registers **nothing** and this seam has **no lawful left side** ⇒ **this instance is VOID as published**,
  and it may not be re-published against a substituted or borrowed batch. *Owner-program:* the level lane's
  `L56–L60` census + registration train — it reports, the design lane rules, nothing is improvised between.
  **B7's multiset conditional** (§7.10.11's own NAMED CONDITIONAL) is inherited **unchanged**.
- **(V3) Register-form obligation.** `F-GD015-1`'s pin duty, published explicitly **because this is the third
  occurrence of the same hazard class** (instances 6, 8, 9) — a hazard with two named prior occurrences that
  is silently assumed gone is how the class returns. ***Owner-program:* the LEVEL LANE, at the Act IV opener
  era** — it fills the pin **literals** (`60` and `L60`'s registered value), derives `_DELTA` from the pin, and
  asserts `near()` on the **frozen pair** (`F-GD014-1` family), enforced by the register's
  **fill-in-before-bytes ceremony** (§7.3.1's bound → fill-in → bytes order) and checked program-side in the
  **`ARCH-006c` symbol form** (declarators, not integers). *(Clause added 2026-10-20 by GD-016b, RV-015 item 4:
  V1 and V2 named their owners and this one left ownership implied by the constants paragraph.)*

**Evidence.** §7.10.11's B1–B7 and its B7 conditional; §7.10.12's general form and `F-GD015-1`; §7.10.7's
register-wide test and its `1.3125` residue bound; §7.10.13.3's rank comparison; §7.10.4 / §7.10.10 for the
register's form (bound → fill-in → bytes); the computed halves, `[27.7500, 29.0625]`, `[29.7500, 31.0625]`,
`[31.7500, 33.0625]`, and `30.455319` read from `policy.ts`.

**Result.** The register's comparator-free class now covers **both** seam kinds; R-00x-era tickets get a
verbatim-citable, two-half, sign-fixed bound **before** either board exists; and every way the bound can stop
being true has a **named owner-program** and an explicit **VOID** verdict rather than a widened range.

---

## RULING D — the Act IV interior-batch ladder is DEFERRED to GD-017, and the one anchor the band law forces is published here (with the B1 scope question answered from disk)

**Original Hypothesis.** A ticket that legislates an act's band and opener might reasonably also legislate its
interior ladders, as GD-014 did for Act III's `ℓ = 3` and GD-015 for `ℓ = 4`.

**Problem.** GD-012 **did not**: it published the Act III opener rule and left the interior batches — where the
batch index `ℓ` is 2, 3, 4 — to a later ruling, which became GD-013 when the **level lane was gated on a
pre-census relief label**. The same gate will exist for Act IV's `L66–L70`, and it is **not raised** by Act IV's
band or its opener. A premature ladder would be a rule written before the question that consumes it. But a
blanket deferral would be unsafe in one spot: the **opener's anchor** is fixed by the band law's own clauses
(O1/B1) and the dispatch asks whether B1 generalizes **across acts** — if the answer were "dataset-scoped", a
deferred Act IV ladder would inherit the wrong anchor.

**Change.** Two clauses, in opposite directions, each with its ground:

- **Deferred: the Act IV interior-batch ladder law (B1–B7 at `ℓ = 2, 3, 4`) → GD-017, near its era.** GD-012's
  precedent is named, not paraphrased; and the deferral includes the `T5` comprehension extension (ruling E)
  and the **release of `par 32`** (as a future tail-era ruling — §7.10.9.1's release was an arithmetic act
  against a **registered** act maximum, and Act IV has no registered row, so a release today would be a claim
  about a tail that does not exist).
- **Published: the one anchor the band law forces.** **On disk B1 is ACT-SCOPED**, and this is a text reading,
  not an inference: §7.10.9.2's B1 law text reads `A₃ = ACT_III_PAR_FLOOR + 2·(3−1)` and §7.10.11's reads
  `A₄ = ACT_III_PAR_FLOOR + 2·(4−1)` — the expression names **its own act's** floor constant, and `ℓ` indexes
  **that act's own batches**. The cross-act generalization is therefore **substitution of the act's floor into
  the same formula** (which is exactly how O1 already writes it generically), **not** a shared dataset-level
  counter. **Two** losing readings are refused arithmetically, and the second collapses harder:
  (a) a **CROSS-ACT `ℓ` CONTINUATION** (called *"dataset-scoped `ℓ = 5`"* when first published — the
  arithmetic was right, the name was not, since Act III ends at `ℓ = 4`) gives `A = 24 + 2·(5−1) = 32` —
  **the act's own reserved ceiling** — which O2/O3 forbids as an opener, because consuming the ceiling
  destroys §7.3.2's by-construction carrier guarantee (no class would remain above the opener); (b) a
  **genuinely DATASET-SCOPED counter** (the reading the word properly denotes) gives, at Act IV's first batch,
  dataset batch **`ℓ = 13`** (12 batches to `L60`: 4 + 4 + 4) ⇒ `A = 24 + 2·(13−1) = 48`, which exceeds
  **`ACT_IV_PAR_CEILING = 32`** (integer comparison, no operator question) and lies outside **every** act's
  `par` band.
  *(RV-015 item 3, applied 2026-10-20 by GD-016b: naming + the stronger second collapse; conclusion unchanged.)*
  So the forced anchor is **`ACT_IV_PAR_FLOOR = 24`** — the `+2` is the **step**, not the
  anchor — and this section publishes it as part of the opener law rather than deferring it.

**Evidence.** §7.10.2's O1–O6 and its scope sentence; §7.10.6's opening (why the interior rule needed its own
ticket) and §7.10.9.2 / §7.10.11's B1 texts (read at this base, quoted above); §7.10.9.1's release arithmetic;
§7.11.3's scope read-out; the O3 margin `0.6875`.

**Result.** Act IV's interior batches get a rule **when they are gated**, the opener gets its anchor **now**,
and the "act-scoped vs dataset-scoped" question is answered with a **disk citation** and an **arithmetic
refusal** of the losing reading — not with a recollection.

---

## RULING E — Act IV ships ZERO new mechanics, its comprehension plan is a NAMED HOLD, and the refusals carry their arithmetic

**Original Hypothesis.** A new act with a new **family** name ("phase-maze") and two new **lattice stages**
(`I`, `J`) reads, at a glance, like a `ΔM > 0` seam: a candidate mechanism debut, which would fire §6's full
dip law and require its own ruling plus ADR before authoring.

**Problem.** §7.2 says the opposite in its own words — *"Mechanism families use locked vocabulary only …
No family may introduce a new rule; a family is furniture on the same physics"* — and its Act IV row names
**M0 wall-echo mazes**, **both-pair objects** and **gauntlet-shaped boards (≥ 6-door rings) as FLAVOUR only**.
§7.4's `I`/`J` are **generator lattices** (enumerated construction classes), not devices. But two live risks
remain: (1) a census might discover that the *maze read* needs a semantics the core does not have; (2) a
`ΔM = 0` act has **no debut rung**, so nobody is obliged by §6 to ask how the new *geometry* is taught — and
"nobody is obliged" is how a comprehension risk ships unmeasured.

**Change.** Three clauses, all in §7.11.5:

- **`ΔM = 0` through Act IV, by citation** (§7.2's family sentence + §7.4's lattice names + the shipped
  primitives: M0 walls and their other-phase echo, `doorIsOpen`, the portal array under the opposite-colour
  law, geometry). **No Act IV rung may be scored as a debut**, and **no architect-impact is flagged**.
  **Asset Gate: unaffected** — no new board feature or player-facing object, so **no `asset-request` is owed by
  this ruling**. **Named conditional:** if the stage-`I`/`J` census finds that the maze read needs a rule the
  core lacks, that is **architect-impact** and needs **its own ADR before authoring** (never smuggled in as
  "Act IV variety"), and this section's `ΔM = 0` claim is **void for that batch**. *Owner-program:* the level
  lane's stage-`I` census.
- **Comprehension = NAMED HOLD, not a T-series extension.** No debut rung exists to hang a beat on; the
  shipped teaching is **assumed, not re-taught** (T0's latch since L6–L10 / Aha #1; M0's refusal at L3 and
  phantom walk at L4–L5; the both-pair cycle T1–T4 complete at `L55`). The hold carries the standing duties —
  **R6** (zero text), **§6.1.4's clone guard**, **§6.1.6 item 6 / §7.5 item 5's registry gate** — plus a
  **named risk** (*"it refused me here and let me through there"* reading as inconsistency rather than as the
  shipped echo rule) with a **measurement window** (**M4/M5/M6 at `L61–L65` vs `L60`**, thresholds frozen
  before the cohort; the instrument reads **`NOT TESTABLE, n = 0`** today) and a **falsification clause**: a
  spike means the geometry is **re-designed, never re-labelled** (§6.2.5's standing rule). The `T5` extension
  is **deferred to GD-017** because a teaching cycle is a **per-rung** claim and the interior rungs are that
  ticket's.
- **Refusals, with arithmetic where arithmetic does the refusing** — the `par 29` precedent's instrument
  rigor (§7.10.13) applied to Act IV's own numbers, because a lane that checked **containment only** would let
  two of these through:
  - **`par 33`:** `33 + 3·1.2500 = 36.7500` is **inside** `[27.7500, 37.0625]` (by `0.3125`) — **containment
    alone does not refuse it**. Refused by the **`par` band** (`33 > ACT_IV_PAR_CEILING = 32`, an integer
    comparison with no operator question) **and** by the mod-2 derivation (odd); at the band top
    `33 + 3·1.6875 = 38.0625` exceeds the ceiling by `1.0`.
  - **`par 34`:** even, still `> 32` ⇒ refused by the `par` band; containment agrees only at the `B` floor
    (`37.7500`, excess `0.6875`) and exceeds by `2.0` at the top (`39.0625`) — **two** instruments, neither of
    them containment alone.
  - **`par 31`:** **containment and the `par` band BOTH admit it** (`[34.7500, 36.0625] ⊆ [27.7500, 37.0625]`,
    and `31 ≤ 32`) — refused **by the derivation only** (odd ⇒ no home in any Act IV ladder), and **strictly
    dominated**, stated in two readings because neither alone is sufficient: **(i)** for **every** in-band `B`
    it measures exactly `1.0` below the `par 32` rung built from the same `B` (`31 + 3·B < 32 + 3·B`);
    **(ii)** read **inside the reserved class** (the same "inside the ceiling class" reading §7.10.9.1 uses for
    `par 27`) its reachable span is `[35.7500, 36.0625]` against `par 32`'s `[35.7500, 37.0625]` — **identical
    floor, a top `1.0` lower**. **This is the sharpest read-out in the section:** an Act IV admissibility test
    without the `par`-band/parity derivation is **insufficient**, and that is checkable, not taste.
  - **`par 32` in the first half:** in band, in the parity class, and **still inadmissible** — the reservation
    is O3's, and the act band is never a per-rung licence (containment is not admissibility).
  - **REFUSED also:** any new device/mechanic/board feature; **re-stamping** (no published number moves,
    instance 9 is **appended** in seam order, `[24,26,28,30,30]` is not obtained by editing an Act III
    number); **any ceiling claim while `H` is uncensused — in either direction** (`H` is uncensused at
    GD-015's publication and `I`/`J` have no census at all; if the ladder cannot be populated **O5 governs**);
    **any Act IV rung law that would break monotone grades** (§7.10.13.4's convention inherited as a binding
    constraint: no pandering grades, no **debut** grade under `ΔM = 0`, no FORCED demand on a relief rung —
    the last by *"a relief rung may carry a device, never an obligation"*); and **silence about the felt
    half** (every player-facing claim here is a labelled hypothesis with a falsification clause; my own
    sawtooth-over-plateau taste is not evidence — AGENTS §7).

**Evidence.** §7.2's family sentence and Act IV row; §7.4's `I`/`J` rows; §7.10.5 (the Act III stance this
mirrors) and §7.10.13.4 (the monotone-grade convention); §7.10.8.3 (the T-series and R-series form); §6.1.4,
§6.1.6 item 6, §7.5 item 5; §6.2.5 (redesign-never-relabel); §3.5's silence; the computed refusals above.

**Result.** Act IV cannot drift into an undeclared mechanic debut; its comprehension duty is **published as an
absence with a trigger** rather than left to silence; and the act's admissibility test is described by the
instrument that actually refuses its hardest case (`par 31`), so a lane cannot pass it by containment alone.

---

## Decision

1. **Act IV's `D_exec` band is `[27.7500, 37.0625]`**, printed `[27.75, 37.06]`, derived-exact from
   **§7.2's own Act IV row** and cross-checked by the **growth read-out** (an induction from the single
   Act II→III step; **never** a band source — RV-015 item 2 forbids deriving any act band from `+4`);
   assumptions **A1–A3** are published as dated clauses.
2. **Act IV is `L61–L80`**, its **first half `L61–L70`** carries the reservation's scope (**`par ≤ 30`**;
   `par 31` inadmissible; `par 32` reserved), and its **`act-close` carrier window is `L71–L80`**.
3. **The `L61–L65` opener rule is §7.10.2's O1–O6 re-based** ⇒ `[24, 26, 28, 30, 30]`; the opener **enters the
   band at the act's floor** (`L61 = par 24`); the "hold at Act III's ceiling" reading is **refused**.
4. **Register §7.3.1 gains instance 9** (`L60→L61`, `act-open`), pre-published **before the census and before
   any byte**, with the register's first **comparator-free `act-open`** bound — **two halves**
   (`[−5.3125, −2.6875]` at `par 24`; `[−3.3125, −0.6875]` at `par 26`), **never a hull** — plus the
   pin-literal constants and **three self-voiding clauses** with named owner-programs.
5. **The Act IV interior-batch ladder (B1–B7 at `ℓ = 2, 3, 4`) and the `T5` extension are DEFERRED to
   GD-017**; the **release of `par 32`** is deferred to the tail's era. The **opener's anchor is published now**,
   with B1's scope answered from disk (**act-scoped**).
6. **`ΔM = 0`, no debut, no new board feature, no architect-impact, Asset Gate unaffected**; the comprehension
   plan is a **NAMED HOLD** with a named risk, a measurement window and a falsification clause.
7. **ADR-design-0005 and ADR-design-0008 are not edited** — this ADR **riders** onto them by name;
   ADR-design-0006/-0007/-0009/-0010/-0011 and `docs/game-design.md` are untouched.
8. **No code, no constant, no dataset, no gate, no band value, no registered row moves.** All `ACT_IV_*`
   declarations are **proposals** for the level lane's registration train.

---

## Consequences

- **Positive.** Every future act now has a **template that has been applied twice**: a band derived from
  **§7.2's own per-act row** and **cross-checked** by the growth read-out (`+4`) — the read-out being a
  cross-check and never a source (§7.11.1's FORBID); an opener rule re-based rather than
  re-invented; a pre-published relief with **no** comparator needed; and a documented split between the opener's
  law (ruled early) and the interior ladders' law (ruled when gated). The comparator-free relief class is now
  established on **both** seam kinds, and the `par 31` read-out gives the level lane a checkable statement of
  **which instrument** refuses an odd Act IV par — the failure mode that would otherwise let a bad rung in.
- **Handed over (not this lane's to do).** (a) **Level lane:** declare `ACT_IV_*` in its registration train
  (`policy.ts` is `src/core/solver/**`); run the §7.11.2 opener rule as a pre-census instrument and print the
  O4 multiset comparison against the **realised** Act III sets; fill instance 9's pin **after** Act III's
  batch 4 registers and **before** Act IV's bytes. (b) **Level lane + Architect:** the register's re-pinning
  duties (instances 6 and 8, plus item 167's three disclosed growing-alias declarators at the tail move).
  (c) **Playtest Analyst:** the comprehension measurement window (`L61–L65` vs `L60`) with thresholds frozen
  before any cohort; today the instrument reads `NOT TESTABLE, n = 0`.
- **Neutral.** §7.2's readable printed forms stay (with the notation note extended to Act IV); §7.10's Act III
  sections are untouched; the star law needs no new row.
- **Risk named.** The derivation leans on **A1** (one measured `B` band, act-invariant by reference). If a
  future census widens the measured band, **every** act band moves at once — so the guard is that widening is a
  design change with an ADR, never a silent re-derivation; and any lane that re-derives a band from printed
  prose re-introduces GD-011's defect, while any lane that derives one from the `+4` read-out breaks
  §7.11.1's **FORBID** (bands anchor via §7.2's per-act rows). §7.9 plus this section's derivation lines are
  the guard.
- **Testable predictions, published so they can fail.** (i) If Act III's batch 4 ever registers with a closing
  `par` other than `28`, **V2** fires and instance 9 must be re-published by a GD ruling — a measurement, not
  a renegotiation. (ii) If the Playtest lens measures an `M4/M5/M6` spike at `L61–L65` against `L60`, the
  geometry is re-designed and a `T5` beat is owed — the hold is **falsifiable by measurement**. (iii) If the
  stage-`I`/`J` census shows `par 24`–`par 30` cannot be populated, **O5** governs and the Act IV opener
  **STOP-AND-ROUTES** rather than substituting a `par`. None of these outcomes is smoothed by a widened bound,
  a substitute ladder or a re-labelled grade.