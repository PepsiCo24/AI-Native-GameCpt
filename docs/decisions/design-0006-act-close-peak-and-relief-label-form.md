# ADR-design-0006 — the `act-close` PEAK clause · the pre-published RELIEF-LABEL form · Act II batch 2 registers as VARIATION RÜNDS

- **Status:** ADOPTED (design ruling). Requires Orchestrator approval per AGENTS.md §4.
- **Date:** 2026-10-17
- **Decider:** Game Designer (Agent 1, task **GD-010**)
- **Owns:** `docs/level-design.md` **§7.3.1–§7.3.4**, **§7.8**, header V1.2, this record.
- **Governs:** (a) **where an act's measured peak lands** (the interior rhythm of the act architecture
  above L20), and (b) the **process** by which any interior/act relief is labelled before it can
  register.
- **Schedule refs:** `docs/level-design.md` §0, §1 (`par`), §4 (fail conditions), §6 / §6.1 (dip law and
  the par obligation, GD-008/GD-011), §6.2 (L20 sealed landing), **§7.0–§7.8** (the act architecture,
  GD-009); `docs/game-design.md` §8 (rhythm), §11 (difficulty), **§14.2** (GD-OQ2, stars);
  ADR-design-0001 (dip law re-axed to `D_exec`), ADR-design-0003 (P1–P4), ADR-design-0004 (sealed
  landing), **ADR-design-0005** (stars-not-cap + the 100-level acts — **the law this ADR riders onto**).
- **Evidence refs:** `docs/project-status.md` **item 124** (R-004a: batch 1 registered; L21–L25 ladder;
  Act I peak `24.729412`; L25 `27.604651`; the L20→L21 relief `−3.148017` labelled at registration),
  **item 128** (LV-014 return: batch 2 on the shelf, mirrored pars, `ΔD_exec −0.02…−0.07`, the
  `−6.044410` interior relief, the unselected `27.746988`), **item 129** (RV-012 verdict — SHIP-WITH-
  NITS; the sawtooth's second half duplicating its first; the relief label not pre-published) plus the
  medium-severity dispatch **GD-010 (5)**; `docs/level-difficulty.md` **§5.2 V1.3 / V1.5** (both Act II
  ladders, per-par `D_exec` windows, the `B` band, headroom `1.455349`), §2b (the collapse
  `D_exec = par + 3·B` under `T ≡ R ≡ 0`), §3.5 (**no unbidden numeric target**); `docs/ai-native-
  pipeline.md` **§8.18 / §8.19** (R-004a's act-tail law and its anti-tautology guards; LV-014's census,
  refusals, `--peak=28.5` falsification, per-par accept pool); `src/levels/candidates/README.md`
  (the shelf); `docs/playtest-analysis/star-era-asks-readiness.md` (STAR-1 / STAR-5: the only rows that
  can read a relief, presently `NOT TESTABLE`, n = 0).
- **Core-loop impact:** **NONE.** The locked loop (one move ⇒ one flip, no switch button, illegal = no
  move and no flip) is byte-identical after this ADR, and so is every level byte: Act II batch 2 stays
  **ON THE SHELF**, L1–L25 stay registered, no par moves, no weight moves, no band moves, no sidecar
  cell moves. The AGENTS §2 triad is **not** convened (the alternative that would have required it —
  a hard cap, or a per-rung mandatory climb — is refused in writing below).

---

## Context — what RV-012 put in front of the design lane

Act II batch 2 (`l026–l030`) is solver-proven and **on the shelf**. Its selection rule was published
**before** the run and is structural, not a search: rung *i*'s par is `ACT_II_B1_LADDER[i].par`, read
from the registered law constant — a **par mirror** — so the batch's one variable is the chain length
(3 → 4 ordered presses) and the equal-par measurement is readable. Measured consequences
(`docs/level-difficulty.md` §5.2 V1.5, `docs/ai-native-pipeline.md` §8.19):

1. The batch carries **five rungs at five already-registered pars** (17/18/20/21/23) with `D_exec`
   **0.02–0.07 below** each counterpart: `ΔD_exec −0.021154 / −0.023759 / −0.071807 / −0.056458 /
   −0.038386`, `ΔB ≤ 0.0239`. **The thesis as a number: an extra ordered press is near-free on
   `D_exec` at fixed par** — Act II's depth lever is `par`, its variety lever is the **chain**.
2. The interior seam **L25→L26** measures **`−6.044410`** (`21.560241` under the registered
   `27.604651`). Lawful per §7.3 (interior freedom inside the band `[19.75, 29.06]`); RV re-verified the
   arithmetic.
3. The class's own reach at par 23 is **`27.746988`** — **above** the registered Act II maximum —
   published **unselected** four times, deliberately not smuggled into a registration.
4. RV-012's two design findings: **(a)** registration would read as a **sawtooth whose second half
   duplicates its first** (five rungs at five shipped pars, all slightly *below* their counterparts);
   **(b)** **no artifact pre-published the §7.3 relief label**, where the R-004a and LV-008 precedents
   both demand law-before-bytes.

The dispatch put four options on the table (A ship-as-is / B re-order / C promote / D batch-3 steering)
and required, in the ruling: the **relief-label text pre-published** for R-005 to cite, a **falsifiable
Playtest ask**, and an explicit **batch-3 par/peak obligation**.

---

## RULING A — the sawtooth ruling: **(A) + (D) ADOPTED, (B) REFUSED, (C) DEFERRED with a named trigger**

**Original Hypothesis (the shapes on the table).** Either (A) the duplicated-par second half is a
deliberate **sawtooth = peak → breath → re-climb through new mechanics**, registrable as *variation
rungs*; or (B) registration should **re-order/interleave** so the duplication is not visible; or (C) the
act must **end higher** than `27.604651` (promoting the published-unselected `27.746988`), which changes
the registered act-maximum basis; or (D) batch 3 must be **steered** so the act does not read as one
plateau.

**Problem.**
1. **(B) cannot remove the relief and would break a published instrument.** Batch 1 registered
   `par 17→23`; batch 2 mirrors it. **Any** ordering of the ten rungs puts a ~6-point drop *somewhere*.
   Worse, the mirror is **index-keyed** (`ACT_II_B1_LADDER[i].par`, read from the law constant) and the
   prover's ladder gates read that mapping — re-ordering is a **law-file change** (ids + constants +
   attestation) for a purely cosmetic gain, which AGENTS §1 prices badly (`Comprehension` is not served
   by hiding a number the player cannot see: `par` is not in the HUD, GD-OQ1 §14.1).
2. **(C) is right eventually and wrong today.** Raising the act's maximum to `27.746988` would put the
   peak where the act can then *end*, and it is the honest remedy if the second half reads as
   deflation — but adopting it **now**, on **zero** playtest data, would be **fitting the curve to a
   desired shape**. That is precisely the practice ADR-design-0001 withdrew the old "2–3 points below
   peak on `D`" margin for: *a failed number is withdrawn, never re-fit to a target*, and weight/curve
   choices come from playtest regression, never from taste. It would also **supersede the registered
   act-maximum basis** (`ACT_II_B1_PEAK_*`, `ACT_II_B1_PEAK_ADVANTAGE`), i.e. a law-constant change
   needing its own record — spending an approval on no evidence.
3. **(A) is not "do nothing": it obliges a label and a claim-audit.** The duplicated pars are the
   **measurement design**, not a rhythm: they were chosen to hold `par` constant and isolate the chain
   variable, and that was published **pre-run** (git-dated, structural — RV verified both). The player
   never sees `par` during play (GD-OQ1 refuses a live evaluation channel); what the player meets is a
   **mechanically distinct board** — fenced 3-pocket device, a **forced 4-press** ordered chain
   `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4` (one door deeper than batch 1), clone guard **0/5**
   collisions over 21 distinct root keys (recomputed independently by the reviewer). So what repeats is
   a **par frame** (and a star allowance the player may chase again), and what is new is the **puzzle**.
   Under the priority order `Fun > Player Comprehension > …`, that is a **mastery rest**, not a re-run —
   *if* the longer chain does not secretly cost more than the relief returns. **That "if" is the part
   no metric in this repo can read**, and asserting it either way is the error this ADR refuses.
4. **(D) is the structural answer to RV's (a).** A duplicated second half is only a *plateau* if the act
   has no **culmination**. The fix is not to un-mirror the pars; it is to make the act's **tail** carry a
   **new, higher peak** — which is a rule about *where the act's maximum lands*, applicable to every act,
   not a patch for this one.

**Change.**
1. **ADOPT (A).** Act II batch 2 registers — when its proof and booking gates clear (QA-025, §7.5) — as
   **VARIATION RÜNDS** *after* batch 1's climb, at the **authored order** (no re-ordering, no id
   change). Registration carries the **pre-published relief label** (§7.3.1 instance 2) and states in
   the same artifact that the mirrored pars are the **instrument**, not a designed repetition.
2. **REFUSE (B).** Registration order stays as authored; the level lane is **not** asked to price a
   re-order. Recorded, not silently dropped.
3. **DEFER (C) — pre-registered remedy, not adopted.** If the Playtest ask (§7.3.3) declares
   `deflation`, the authorised remedy is to move Act II's registered maximum onto its tail by selecting
   the par-23 class reach **`27.746988`** into the L30 slot — proven under §7.5 in full, **with its own
   ADR**, because it re-keys the registered-maximum constants. Until that signal exists, no promotion.
4. **ADOPT (D).** Batch 3 (L31–L35) and batch 4 (L36–L40) get an explicit **closing-peak** obligation —
   §7.8 below and `docs/level-design.md` §7.8, with a **derived** par route and **no invented number**.

**Evidence.** Item 124 (batch 1 registered — the par ladder, L25 `27.604651`, the L20→L21 relief
labelled at registration); item 128 (batch 2's own numbers, the published pre-run mirror rule, the
honest non-promotion); **item 129** (RV-012: clone-guard recomputation, mirror git-dated **25 s before**
the run and structural, no-re-stamp diff 0 lines, the two design findings); `docs/level-difficulty.md`
§5.2 V1.3/V1.5 (per-par windows, `B` band, headroom `1.455349`); `docs/ai-native-pipeline.md` §8.19
(the census, the accept pool by par, the `--peak=28.5` falsification failing **exactly** the peak rung);
ADR-design-0001 (withdrawn-not-refit); GD-OQ1 §14.1 (`par` invisible in play).

**Result.** The law keeps its meaning and gains a **culmination**: **peak (L25 `27.604651`) → breath
(L26 `21.560241`, labelled) → re-climb through NEW mechanics (L27–L30, `…27.566265`) → a genuinely
higher tail peak (L31–L40, `> 27.604651`)**. Nothing registered moves; the obligation lands entirely on
**unauthored** bytes.

---

## RULING B — the `act-close` PEAK clause (new law, generalised to every act)

**Original Hypothesis.** §7.3's `act-peak` clause binds the act's **measured maximum** and deliberately
says nothing about **where inside the act** it sits — interior freedom was published (ADR-design-0005,
RULING B item 3) to protect variety, and it is correct as far as it goes.

**Problem.** Act II measured the gap in that reading: with a mirrored second batch, the act's maximum
sits **mid-act** (L25), the last five rungs re-climb to a value *below* it, and **every act would
therefore end on its own plateau** — turning "the top of each act is higher than the last" into "each
act's top is somewhere in the middle". Two costs, both measured, neither a taste call:
(a) **Band headroom is wasted** — Act II leaves `1.455349` of its derived band `[19.75, 29.06]` unused,
so **Act III must open against a base no higher than Act II's midpoint**, compressing the next act's
usable band; (b) **the act's shape loses its culmination**, which is the comprehension function of an
act's tail (the player's last boards should be the act's answer, not its appendix). (Evidence: item 129;
`docs/level-difficulty.md` §5.2 V1.3/V1.5.)

**Change (one clause; generalised; machine-checkable).**
- **`act-close`: an act's registered maximum `D_exec` must be carried by its last two batches.** For Act
  II that is **L31–L40** (batch 3 or 4). The clause reads the **measured** maximum, exactly like
  §7.3's `act-peak`, so it is evaluated per batch once the batch's peak exists (§7.5 item 2).
- **What it is not.** **Not** a per-rung climb: every existing rule stands untouched — no dip without
  `ΔM > 0` (§6), no padded pars (`par ≤` tile count, P3(a)/P4 coverage), measured `Δpar` windows,
  interior freedom inside the band, and an act-open **relief** below the previous act's peak still
  lawful under §7.3.1. It is **one peak per act, carried late**; the interior stays free.
- **Escape hatch (honest, never silent).** If a census proves a family **cannot** reach a closing peak
  without padding, the shortfall is reported as a **named act limitation** with the measured class
  ceiling beside it; the batch still registers **only** proven members — §7.5's "no registered with a
  caveat" rule is untouched, because the caveat is on the **act's shape**, never on a **board's proof** —
  and the gap rides into the next act's band arithmetic as a **named input**. Never smoothed; never
  faked by padding.
- **Why this is not the refused "endless climb".** ADR-design-0005 refused a **per-rung** rise to 100
  levels because it is unfulfillable without padding (par is bounded by the board; accept share collapses
  0.5 % → 0.03 % by par 10). This clause asks for **one** peak per act, at the act's tail, inside the
  act's own published band — and for Act II the derived route is arithmetic, not hope (§7.8 item 2).

**Evidence.** ADR-design-0005 §7.3 (the clause amended) + its RULING B Problem (why a per-rung climb was
refused); item 129 (the mid-act peak as measured); `docs/level-difficulty.md` §5.2 V1.3/V1.5 (both
ladders, headroom, the per-par windows); `docs/level-design.md` §7.2 (Act II's band `par 16–24`,
`D_exec [19.75, 29.06]`) and §7.4 (the named open axes batch 3 may spend).

**Result.** Across acts the clause still reads "each act's top is higher than the last" (ADR-design-0005
unchanged); **within** acts the top now lands late, so an act reads as a **shape with a culmination**
rather than one long plateau. Falsifiable by measurement: a closing batch whose every member is below
the act's current maximum **fails**, by the batch's own reported numbers.

---

## RULING C — the pre-published RELIEF-LABEL form (process law)

**Original Hypothesis.** §7.3 labels the relief an act may open on. Labelling was treated as **prose
written when the numbers arrive** — the way R-004a did it in the same artifact that registered the rung.

**Problem.** RV-012's finding (b): batch 2's relief was **lawful but labelled after the transfer**, with
no artifact carrying the label **before** the bytes moved. LV-008 had already set the stricter precedent
(an acceptance contract frozen **before any candidate existed**) and R-004a's own anti-tautology guards
exist precisely because a label written after a number is a label that can be *shaped* by the number.
The difference between "published before the run" and "written after the result" is the difference
between a law and a rationalisation.

**Change.** §7.3.1 publishes the **label FORM once**, binding on every act and every relief kind
(`act-open`, `batch-seam`, `act-interior`, …): the required fields (`kind`, seam levels, `ΔD_exec`,
band), the required assertions (interior relaxation at a `ΔM = 0` boundary; **never a dip**; **never a
claim of lower felt difficulty**; discharges and satisfies **no** clause — `act-peak` rides on the
measured maximum), the required honesty about **instrument artifacts** (e.g. a par mirror held constant
to isolate a variable), and the required pointer to the felt-half hypothesis (§7.3.3). Each instance is
then a **fill-in**, quoted verbatim in the registration artifact. **A relief with no pre-published label
is not registrable.**

**Evidence.** Item 129 (RV-012 (b)); LV-008's pre-registered contract (`docs/ai-native-pipeline.md`
§8.8; the board was **filtered** to a published bound, never fitted); R-004a's labelled registration
(item 124) and its six `ActTailClause` guards, including the two-direction tautology refusal
(`docs/ai-native-pipeline.md` §8.18).

**Result.** Future reliefs cannot be labelled post hoc; batch 2's own label is pre-published **now**
(§7.3.1 instance 2, quoted for R-005), and batch 3's must be published **before it is authored** (§7.8
item 5).

---

## Decision

1. **Ruling A:** **(A) + (D) ADOPTED.** Act II batch 2 registers as **VARIATION RÜNDS** on its
   authored order when proof/booking gates clear; **(B) REFUSED** (cannot remove the relief; would break
   the index-keyed published mirror; buys no comprehension); **(C) DEFERRED** with a **named trigger**
   (the §7.3.3 `deflation` signal ⇒ promote the published-unselected par-23 reach `27.746988` to the
   L30 slot, proven in full, **with its own ADR**).
2. **Ruling B:** the **`act-close` clause** (new): an act's registered maximum must be carried by its
   **last two batches**; per-rung/internal rules untouched; honest named-limitation escape hatch;
   §7.5's no-caveat rule preserved because the caveat is on the act's shape.
3. **Ruling C:** the **relief-label form** is published once (§7.3.1); instances are fill-ins; a relief
   with no pre-published label is **not registrable**.
4. **§7.3.3** pre-registers the **falsifiable Playtest ask** on the five equal-par mirror pairs
   (`L21↔L26 · L22↔L27 · L23↔L28 · L24↔L29 · L25↔L30`): STAR-1 replay share + M5/M6, batch-2 side vs
   batch-1 side; `mastery-rest` survives iff the batch-2 member's replay share ≥ its same-par
   comparator's on **≥ 3/5** paired participants; `deflation` is declared on **≥ 2/5** showing
   quit-within-next-level or flat M5/M6-with-low-dwell at the **L25→L26** seam — which fires the C path.
   The row is the Playtest lane's to carry; today it reads **NOT TESTABLE (n = 0)**
   (`docs/playtest-analysis/star-era-asks-readiness.md`).
5. **§7.8** sets batch 3–4's obligation: closing peak **`> 27.604651`**; the **derived** par route
   (**`par 24` ⇒ `D_exec ∈ [27.7500, 29.0625]`** from the measured `B` band and `D_exec = par + 3·B`,
   ≥ `+0.145349`, redeeming the `1.455349` headroom — **no new number invented**); **`par 24` is
   in-band but unmeasured**, a **named census obligation** with the published `27.746988` fallback
   (C path + ADR); an **anti-mirror** clause (own par set, §6.1.4-distinct device, named open axes =
   the 4-pocket member and the deferred `--pocketsize ≥ 11` probe); and "label before the bytes" for any
   further relief.
6. **No star threshold re-prices.** `par` is unchanged; a future `par 24` is already covered by
   ADR-design-0005's ladder row (`par 21–30 → +6 / +12`, `k1 = 2·⌈par/10⌉`), so
   `docs/game-design.md` §14.2 needs **no** edit and no pins are added (derivation, not pins).

---

## Consequences

- **Positive.** The act architecture gains a **culmination rule** that is checkable, generalises to Acts
  III–V, and costs no board byte; the relief-labelling process becomes law-before-bytes instead of
  prose-after-numbers; the batch-2 ruling is recorded with its own falsifier and a pre-registered remedy
  instead of a silent shape decision; and the batch's own honest thesis (an extra ordered press is
  near-free on the execution axis at fixed par; the chain is the variety lever) is preserved as the
  measurement it is.
- **Negative / cost.** Act II's remaining batches carry a **derived** obligation that includes a
  **census** (`par 24`, unmeasured in the `G` lattice) — a real risk that the route needs the fallback;
  the Playtest lane inherits one more pre-registered ask in an instrument that already reads
  `NOT TESTABLE`; and the `act-close` clause narrows interior freedom for **all** acts, which is a
  genuine imposition on the level lane's future search (mitigated by `par_max` always being in each
  act's own band and by the escape hatch).
- **Risk register.** (a) *The mastery-rest reading is wrong and the second half reads as deflation* —
  hypothesis, falsified by §7.3.3's ask; the remedy (C) is pre-registered, ADR'd, and evidence-gated.
  (b) *`par 24` turns out unauthorable* — named census obligation, never a promise; fallback published.
  (c) *The `act-close` clause pressures a padded par* — refused by P3(a)/P4 (par ≤ tile count, coverage)
  and by §7.5 (no caveat registration); a padding attempt **fails the gates before it fails this clause**.
  (d) *A future relief is labelled to fit a number* — blocked by Ruling C (label form pre-published;
  no-label ⇒ not registrable).
- **Not changed.** The locked core loop; every registered level byte and its gates; `M` for L1–L20 and
  the §8 schedule; weights `w1…w5`; every published `D`/`D_exec`/`par`/`B` number; §6's dip law; §6.1's
  P1–P4; §6.2's sealed-landing law; §7.2's acts/bands/batch sizes; §7.5's proof obligations; §7.6's
  sampling policy; the star thresholds and the post-win-only presentation (GD-OQ1 §14.1, GD-OQ2 §14.2).
- **Follow-ups.** **Level lane:** §7.8 item 3's census (`par 24` in the `G` lattice, then the fallback
  decision), the 4-pocket axis, the deferred `--pocketsize ≥ 11` probe; **R-005 registration** carries
  §7.3.1 instance 2 verbatim. **Playtest Analyst:** carry §7.3.3's ask in the star-era instrument
  (STAR-1 row + STAR-5 counter-check), thresholds frozen before the cohort — and only then may the C
  path be considered. **QA:** §7.5 item 2's per-batch reporting gains the `act-close` reading beside the
  `act-peak` reading (mechanics: QA's lane, shape fixed here). **Orchestrator:** approval of this record
  per AGENTS §4.