# ADR-design-0008 — the Act III EXEC band (derived-exact) · the L41–L45 opener rule · Act III par/star totality · the L40→L41 `act-open` relief pre-published

- **Status:** ADOPTED (design ruling). Requires Orchestrator approval per AGENTS.md §4.
- **Date:** 2026-10-18
- **Decider:** Game Designer (Agent 1, task **GD-012**)
- **Owns:** `docs/level-design.md` **§7.10** (new), **§7.2**'s band-notation note (Act III
  added), header **V1.4**, this record.
- **Governs:** (a) **Act III's `D_exec` band**, derived-exact — the first act designed **after**
  Act II's saturation is measurable; (b) the **L41–L45 opener's selection rule**, pre-runnable by
  the level lane; (c) **Act III's admitted `par` range** and the **totality of the star law** over
  it; (d) the **mechanics stance** for Act III (YAGNI: prefer proven axes, no new mechanic); and
  (e) the **pre-published relief label** for the Act II→III seam, per §7.3.1's law that *a relief
  with no pre-published label is not registrable*.
- **Schedule refs:** `docs/level-design.md` §7.0 (integrity: `par` bands are law, `D_exec` bands
  are **derived**), **§7.2** (the acts table — **Act III = L41–L60, `par 20–28`, printed `D_exec`
  `[23.75, 33.06]`**), §7.3 (`act-peak`; interior freedom; the `ΔM = 0` plateau relaxation),
  **§7.3.1** (relief-label **form** — instance 4 added), **§7.3.2** (`act-close`; Act III's carry
  window), §7.4 (lattice stage `H`, both-pair), §7.5 (proof obligations), §7.8 (the closing-peak
  handoff pattern re-used), **§7.9** (bands derived-exact, inclusive; **derive-from-formula, never
  compare against rounded text**); §6 / §6.1 (dip law; P1–P4), §6.2 (`ΔM = 0` precedent).
- **Evidence refs:** `docs/level-difficulty.md` **V1.10** §5.2 (per-par `D_exec` windows; the
  measured `B` band `[1.2500, 1.6875]`; the Act II registration bullets) and §3.5 (no unbidden
  numeric target above the last measured row); `docs/ai-native-pipeline.md` **§8.19 / §8.20 /
  §8.24** (LV-014 / LV-015 / LV-017 — the `G`-lattice censuses, the **`CX = 1` 4-pocket frame
  result**, the Act II closing ladder, F-L36-1/F-L36-2); `docs/project-status.md` (LV-017 merged;
  **R-006a** in flight registering L36–L40); ADR-design-0005 (the acts, the star ladder — **rider,
  not edited**); ADR-design-0006 (`act-close` + the relief-label form — **rider, not edited**);
  ADR-design-0007 (§7.9 endpoint law + the C path — **rider, not edited**); ADR-design-0001 (taste
  is not evidence; withdrawn-not-refit).
- **Core-loop impact:** **NONE.** The locked loop (one move ⇒ one flip, no manual switch, illegal =
  no move and no flip) is byte-identical after this ADR; so is every level byte, every registered
  row, every weight, every gate list, every Act I/II band value and every sidecar cell. This ruling
  touches **no** `src/**`, **no** `scripts/**`, **no** test and **no** level JSON. The AGENTS §2
  triad is **not** convened: Act III introduces **no** new mechanic (`ΔM = 0`, §7.10.5 — new
  **verbs over taught vocabulary**, exactly the L20 sealed-landing precedent).

---

## Context — what Act II's close puts in front of the design lane

Act II closes at **L40**. Its final batch (`l036`–`l040`, §7.4's unused **`7×7` @ `CX = 1`**
frame, the 4-pocket / 5-door / 5-press device class) is **solver-proven on the shelf** (LV-017,
`docs/ai-native-pipeline.md` §8.24) and is being registered by the in-flight **R-006a**. Measured on
those bytes: pars `18 / 20 / 22 / 24 / 24`, `D_exec` `22.301282 / 24.252174 / 26.200000 / 28.185897 /
**28.455319**`, coverage `49/49 ×5`, five distinct clone keys / 0 collisions, `--peak=28.7` failing
**exactly** the act-peak gate on **exactly** L40.

Three facts force Act III to be derived on its **own** ground rather than extrapolated:

1. **Act II's band is nearly topped out by design.** Its derived-exact ceiling is
   **`29.0625`** (`24 + 3·1.6875`, §7.9) and its closing rung sits at **`28.455319`** — headroom
   **`0.607181`**. A band whose top is *used* cannot be re-used: a new act must derive its own
   endpoints from its own `par` band.
2. **The plan of record already fixes Act III's `par` band.** `docs/level-design.md` §7.2 (from
   ADR-design-0005 RULING B) publishes **Act III = L41–L60** with `par` **20–28** and a printed
   `D_exec` band `[23.75, 33.06]`. *(The dispatch's "L41–L6x" resolves to **L41–L60** — the act is
   four batches of five, per §7.2. Nothing here is invented.)*
3. **The `H` lattice's frame question is answered on Act II's own shelf.** LV-015 measured the
   4-pocket class **empty at `CX = 2`**, and LV-017 measured the *same device class* **NON-EMPTY at
   `CX = 1` / `7×7`** (sealed rooms `46 / 31 / 31 / 46`, max pairwise-disjoint **8**; census
   `2091 / 20000` accepts, `par 18–24`). Read correctly, **F-L31-1's kill separated the FRAME, not
   the DEVICE CLASS** — which is the licensed evidence Act III's authoring leans on.

---

## RULING A — the Act III EXEC band, derived-exact (no new arithmetic)

**Original Hypothesis.** §7.2 printed Act III's band as `[23.75, 33.06]`; the working assumption
could have been that the printed range *is* the law's value, or that Act III's band could be reached
by sliding Act II's.

**Problem.** Both readings are defects under §7.9: a printed form is a **display rounding** and must
never be a comparison operand; and Act II's band cannot be *extended* to reach Act III — a band is
always `[par_min + 3·B_lo, par_max + 3·B_hi]` over **its own** `par` band, and Act III's `par` band
(`20–28`) is a different integer range from Act II's (`16–24`).

**Change — the band, derived from its formula, exactly as §7.9 requires:**

| Quantity | Value | Derivation |
|---|---|---|
| `PAR_FLOOR` | **`20`** | §7.2's Act III `par` band, lower endpoint (plan of record) |
| `PAR_CEILING` | **`28`** | §7.2's Act III `par` band, upper endpoint (plan of record) |
| `B` band | **`[1.2500, 1.6875]`** | measured, re-derived from L1–L15 every run, **never widened** (§7.0; `docs/level-difficulty.md` §5.2) |
| `EXEC_FLOOR` | **`23.7500`** | `20 + 3·1.2500 = 20 + 3.75` |
| `EXEC_CEILING` | **`33.0625`** | `28 + 3·1.6875 = 28 + 5.0625` |
| **Act III `D_exec` band** | **`[23.7500, 33.0625]`**, *printed* `[23.75, 33.06]` | inclusive at both ends (§7.9); both endpoints **dyadic** (`95/4`, `529/16`) ⇒ IEEE-754 bit-exact |

**Justification, clause by clause.**

- **Against Act II's tail `28.455319`.** Act III's **floor** `23.7500` sits **`4.705319`** *below*
  Act II's closing rung and its **ceiling** `33.0625` sits **`4.607181`** *above* it. The band
  therefore contains the previous act's tail strictly inside — which is exactly what §7.3 interior
  freedom requires of an act that opens *below* the previous act's peak (a **labelled plateau
  relaxation**, never a dip).
- **The band translates Act II's by exactly `+4.0` on both ends** (`23.75 − 19.75 = 4.0`;
  `33.0625 − 29.0625 = 4.0`), because both Act III endpoints move `+4` from Act II's. This is a
  checkable identity, not a resemblance: `ΔEXEC = ΔPAR` when `ΔPAR_FLOOR = ΔPAR_CEILING`.
- **Against §7.3.2's `act-close` clause.** Act III's registered **maximum `D_exec` must be carried
  by its last two batches** — for Act III that is **batches 3 + 4 = `L51–L60`** (four batches of
  five: `L41–L45 · L46–L50 · L51–L55 · L56–L60`). The clause is read **per batch** once the batch's
  measured peak exists (§7.5 item 2), exactly as Act II's was discharged at L35 and again at L40.
- **Against the readability ceiling.** The band **top is not a difficulty target**: it is
  `par_max + 3·B_hi`, i.e. the ceiling the **measured effective-branching band** supports. Past
  `B_hi = 1.6875` boards stop being *deeper* and start being *cluttered* (§6.2.1's comprehension
  argument; §1's `7×7` cap + ui-ux R-L2's 44 px touch floor set the tile budget, and P3(a) bounds
  `par ≤ tile count`). Act III's ceiling `33.0625` is thus a **derived readable bound**, and no
  number in it was typed.

**Corollary for the law files (prose only — GD writes no code, AGENTS §4).** Mirror LV-016's Act II
pattern: `ACT_III_PAR_FLOOR = 20`, `ACT_III_PAR_CEILING = 28`, `ACT_III_B_BAND = [1.2500, 1.6875]`,
`ACT_III_EXEC_BAND` **computed** as `[PAR_FLOOR + 3·B_BAND[0], PAR_CEILING + 3·B_BAND[1]]` =
`[23.75, 33.0625]`, and `inParBand`-style comparisons **inclusive** at both ends. The **printed**
`[23.75, 33.06]` stays display-only text (§7.9).

---

## RULING B — the L41–L45 opener rule (six clauses, pre-runnable)

**Original Hypothesis.** The opener is the act's first ten-percent; §7.3 leaves the interior *free*,
so "sits anywhere in band, in any order" could be read as "the lane may search the opener freely",
the way Act II batch 1 searched `17 / 18 / 20 / 21 / 23`.

**Problem.** "Free interior" is **not** the same as "unconstrained". Three laws bite the opener
simultaneously, and unless they are intersected **before the run** the lane re-derives them per batch
and the act drifts:

1. **§7.3.2 needs a growth axis.** An act's culmination is only *satisfiable* if the tail can exceed
   the body. Inside a band, `par` is the **only** axis that grows without bound by selection; `B` is
   bounded (`[1.2500, 1.6875]`, spread `1.3125` in `D_exec`). An opener that consumes `PAR_CEILING`
   therefore puts the culmination on a knife-edge: an opener rung at `par 28` with `B` at the band top
   measures `33.0625` — the band's own ceiling — and **no** tail rung can ever exceed it, so the
   `act-close` clause fails **by construction**.
2. **P2 vs band width.** §6.1.1 P2 wants `Δpar ≥ 2`; the Act III band is **8 wide** and the batch is
   **5 members** with `Δpar = 2`, whose span is exactly `2·4 = 8`. So a P2-exact 5-member ladder is
   forced to span **both** endpoints — i.e. it necessarily eats the ceiling.
3. **Comprehension first.** Act III's family is a new **verb** (two portal pairs live in one plan,
   doors re-priced by both, approach-side asymmetry deepened) read against boards that are now
   `7×7`. §6's own rationale — *execution difficulty stacked on comprehension load reads as
   unfairness* — applies to a new verb exactly as to a new mechanic, so the opener must be a **breath**,
   not a step up from Act II's tail.

**Change — the law (published at §7.10.2).** The opener's ladder is **derived, not searched**, and
the derivation is the intersection of the three laws above:

| # | Clause | Content |
|---|---|---|
| **O1 · ladder (derived)** | `L_i = PAR_FLOOR + 2·(i−1)`, `i = 1…5` | the P2-exact 5-member window (`20, 22, 24, 26, 28`) — LV-017's derivation, same constants, applied to Act III's band |
| **O2 · ceiling reservation (the opener's own branch)** | the derived top rung `par 28` is **withheld**; the 5th rung repeats the truncated top at its within-par **maximum** | multiset **`[20, 22, 24, 26, 26]`** |
| **O3 · why O2 is derived, not taste** | any opener rung has `D_exec ≤ (PAR_CEILING − 2) + 3·B_hi = 26 + 5.0625 = **31.0625**`; any `par 28` tail rung has `D_exec ≥ 28 + 3·B_lo = 28 + 3.75 = **31.7500**` | **`31.7500 > 31.0625`** (margin `0.6875`) ⇒ §7.3.2's `act-close` is satisfiable **by construction** on `L51–L60` **regardless of the opener's realised `B`**. Consuming the ceiling destroys this guarantee — that is a measurement, not a preference |
| **O4 · anti-mirror** | the multiset must differ from **every** registered Act II batch's multiset (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`) and from every other Act III batch's | `[20,22,24,26,26]` satisfies this; **coinciding pars are printed, never hidden** (§7.8 item 4's discipline, generalised across acts) |
| **O5 · empty pool ⇒ ABSENT, never substituted** | if the `H` census pool holds **no** in-band tuple at a derived par, that rung is **absent** and **no out-of-set par is substituted**; the shortfall is absorbed by **within-par repeats at the highest available derived par** (LV-017's descending-fill convention, verbatim) | if fewer than five rungs can be populated from the truncated set, the batch **STOP-AND-ROUTES to GD** — it never silently extends to the ceiling |
| **O6 · within-par convention** | the **final rung** takes the within-par **maximum** `D_exec`; every earlier rung takes the within-par **minimum** | LV-017 rule 4 / LV-015's tie-break; makes the batch's own interior rise visible **without** claiming a clause |

**Does the opener need its own `act-peak` / `act-close` branch? — RULED: NO, and that is the
point.** §7.3.2 places the carrier obligation on the act's **last two batches** (`L51–L60`), and
§7.3's `act-peak` clause binds the act's **measured maximum**, evaluated per batch *once the batch's
peak exists* (§7.5 item 2). The opener batch therefore **reports** its measured peak and **carries no
clause** — a first batch cannot be the act's culmination. What the opener **does** carry is the
§7.3.1 **`act-open` relief** (RULING E), because its first rung necessarily sits below Act II's
registered tail.

**Nice property worth printing (it makes O1/O2 auditable):** every rung the rule admits is in band
*by construction* — `par 20` ⇒ `D_exec ∈ [23.75, 25.0625]`; `par 26` ⇒ `[29.75, 31.0625]`; all
⊆ `[23.75, 33.0625]`. A selector that lands a rung outside the band has therefore broken the rule,
not found a nuance.

---

## RULING C — Act III's par range and the STAR LAW's totality (ruled as law text)

**Original Hypothesis (the question the dispatch put).** Does Act III's ladder extend **beyond
`par 24`** (Act II's ceiling)? And if Act III's pars exceed `30`, the star tables need their **next
row ruled here**.

**Problem — the dispatch's restatement does not match the plan of record, and the record wins.**

1. **The ladder DOES extend beyond `par 24`.** Act III's `par` band is **`20–28`** (§7.2, plan of
   record), so `26` and `28` are admitted — the first pars in the project's history above Act II's
   `24` ceiling. They carry **no** new star row: `26`/`28` sit inside ADR-design-0005's existing
   `par 21–30` row.
2. **Act III's pars do NOT exceed `30`** — its ceiling is `28`. So the "rule the `par 31+` row"
   branch is **not triggered by Act III**, and inventing a row for it now would be publishing an
   unfitted number.
3. **Corrigendum on the dispatch's star restatement (recorded, not quietly used).** The dispatch
   wrote *"`k1 = ceil(2·par/10)`, `k2 = 2·k1`; PA-004 falsification bands `k2` par 21–30 = 6"*. The
   **record** says otherwise and it is quoted verbatim, never re-derived:
   **`k1 = 2·⌈par/10⌉`, `k2 = 2·k1`** (ADR-design-0005 RULING A decision 2; `docs/playtest-analysis/
   star-era-asks-readiness.md` §0, §2). PA-004's §2 table gives `par 21–30 → ⌈par/10⌉ = 3`,
   **`k1 = 6`**, **`k2 = 12`**, with `F2` falsify-too-tight at `median > 6`. The `6` in the dispatch
   is **`k1`, not `k2`** — the same F-L31-2 / F-L36-2 fault class (a restatement that misdescribes
   its own number) and it is corrected here against the artifact, §7.9's discipline applied to a
   dispatch.

**Change — the law, published at §7.10.3:**

> **LAW (Act III `par` range and star totality).** Act III's admitted `par` range is **`20–28`
> inclusive** — exactly the plan-of-record band (§7.2). A rung outside it is **rejected, not
> re-banded**. Because `28 ≤ 30`, every Act III `par` falls inside ADR-design-0005 RULING A's
> **existing** rows — `par 11–20 → k1 = 4, k2 = 8` and `par 21–30 → k1 = 6, k2 = 12`, with
> `k1 = 2·⌈par/10⌉`, `k2 = 2·k1`, `1★ = any finish` — so the star law is **total over Act III by
> derivation**. **No new star row is ruled, and `docs/game-design.md` §14.2 needs no edit.** The
> same totality holds across the whole 100-level plan: §7.2's Act IV (`24–32`) and Act V (`28–36`)
> tops are covered by the rows `par 31–40 → +8 / +16` and below, which the star ladder table already
> publishes to `par 100` (`91–100 → +20 / +40`). **A rule requiring a fresh row would be owed only
> by an act whose `par` band left the published ladder — none does.** No `par` value is capped at
> `30` for Act III; the act's own ceiling `28` binds.

**Evidence.** `docs/level-design.md` §7.2 (Act III `par 20–28`); ADR-design-0005 RULING A
(threshold derivation; the ladder table `4–10 · 11–20 · 21–30 · 31–40 …`); `docs/playtest-analysis/
star-era-asks-readiness.md` §0/§2 (the quoted pair and the per-band falsifiers, `n = 0`,
`NOT TESTABLE`); `src/game/systems/stars.ts` (shipped `starThresholds` / `starsFor`, quoted not
re-derived). ADR-design-0006 decision 6 already stated the narrower fact (`par 24` needs no edit);
this ruling generalises it to the act's full range.

**Result.** The star law's totality over Act III is **stated as law instead of assumed**, the
dispatch's `k1`/`k2` swap is on the record rather than silently propagated, and no threshold, pin or
`game-design.md` line moves.

---

## RULING D — Act III's mechanics stance (YAGNI) — **no new mechanic, no architect-impact**

**Original Hypothesis.** Act III's family ("both-pair objects") might be read as needing new support:
a second portal pair, doors re-priced by both pairs, maybe a new field or a new core case.

**Problem.** Every ingredient already exists and is **shipped law**:

- **two opposite-colour portal pairs** — the schema is an **array** of portals, each with its own
  `activePhase`, each pair independently validated by the **opposite-colour** rule (`§1`; ADR-0009
  decision 5; `0/400` same-colour boards legal). Two pairs in one plan is **composition**, not a new
  entity: entering a pair teleports **once, no chaining**, and standing on a portal never retriggers
  (ADR-0008 rule 6).
- **doors re-priced by both pairs** — geometry plus the shipped `doorIsOpen` reading (colour base
  inverted once per ON switch that lists the door, `§1`; `src/core/rules`).
- **the XOR multi-switch door** — §7.2 moves the allowance here from `§8`'s L36–L45. The semantics
  are **already pinned** (`§1`: an even number of ON switches restores the colour base; RV-002 M-5;
  authoring rule "≤ 1 switch per door in L6–L35, XOR doors reserved for L36+, **review-flagged**").
  So it needs **no** schema field, **no** core case and **no** validator change — only the existing
  review flag.
- **`ΔM = 0`.** Act III introduces **no mechanic unit**: no new vocabulary, no new physics. Its
  novelty is a **verb over taught vocabulary**, exactly the L20 sealed-landing precedent (§6.2.2),
  which ruled that a new verb at `ΔM = 0` fires **no** dip obligation and forces no debut. §6's dip
  law therefore **does not bind Act III**, and no Act III rung may be scored as a debut.

**Change.** **RULED: Act III ships zero new mechanics and zero new board features. Prefer proven
axes first**:
1. the **`CX = 1` frames** that LV-015/LV-017 *measured* — `7×6` @ `CX = 1` (40 / 27 / 27 / 40
   sealed rooms, disjoint 7) and **`7×7` @ `CX = 1`** (46 / 31 / 31 / 46, disjoint 8) — over any new
   frame. **F-L31-1's kill separated the frame, not the device class**: the 4-pocket / 5-press member
   is proven non-empty at `CX = 1` and empty at `CX = 2` / `7×7`@`CX=2`. A lane that reports the
   4-pocket class "closed" is reading the wrong axis.
2. the **4-pocket / 5-door / 5-press device class** (Act II batch 3's and batch 4's registered
   device) before any deeper chain — a **5-pocket** device is refused by §7.2's published family text
   and is **not censused** (LV-017 rule 7: censusing a forbidden device invites a family change,
   which is a GD decision).
3. **no architect-impact is flagged by this ADR.** If a later Act III round wants something beyond
   the above (a new field, a new solidity case, a new target semantics), it is **architect-impact**:
   schema + core review **before** the level lane authors a byte, and it needs its own ADR — it may
   **not** be smuggled in as "Act III variety".

**Evidence.** `§1` (doors/switches/portals, all pinned); ADR-0009 decision 5; ADR-0008 rules 1–7;
§6.2.2 (`ΔM = 0` for a new verb); `docs/ai-native-pipeline.md` §8.20 / §8.24 (the `CX = 1` frame
census and the `CX = 2` emptiness — the discriminator); LV-017's rule 7 (no censusing of forbidden
devices).

**Result.** Act III's authoring surface is **bounded and already-shipped**: no new rule, no new
field, no core change, and the frame axis the censuses actually support is named before the lane
spends a tuple.

---

## RULING E — the L40→L41 `act-open` seam relief, PRE-PUBLISHED now (§7.3.1 instance 4)

**Original Hypothesis.** §7.3's interior freedom *permits* an act to open below the previous act's
peak; §7.3.1's law makes the relief **registrable only against a pre-published label** (*"a relief
with no pre-published label is not registrable"*). Act II's opener took its label at registration;
batch 2's was labelled after the transfer (RV-012's finding). The question: can Act III's seam be
labelled **before it exists**, or should the act be ruled seam-free?

**Problem.** The seam is **not** merely likely — it is **forced by RULING B's own derivation**:

- Act III's opener anchors at the band **floor** (`PAR_FLOOR = 20`, clause O1) — deliberately, on
  §6's comprehension-first rationale (a new *verb* read against `7×7` boards is a comprehension load,
  so the act opens lower: the same shape as L20→L21's registered `act-open`).
- Act II's registered tail is at **`par 24`** (`D_exec 28.455319` on the R-006a basis; `28.339426`
  if R-006a has not landed). So **`Δpar = 20 − 24 = −4`** by construction and `ΔD_exec` is negative
  **whatever** the opener's realised `B` is.
- Therefore an un-labelled seam would appear the moment L41 lands — and per §7.3.1 it would then be
  **unregistrable**. That is exactly the failure RV-012 named, one act later.

**Change — publish the label's FORM and its DERIVED numbers-range now, before the census, before
`--write`, before any byte.** Exactness follows when L41's `par` is selected off the census; **no
number may be written after a byte exists**. The `Δ` is **bounded by arithmetic**, using O1/O2's
admitted first-rung pars and the measured `B` band:

| Case | `Δpar` | L41 `D_exec` interval | `ΔD_exec` = L41 − L40 | vs the pre-R-006a basis (`28.339426`) |
|---|---|---|---|---|
| **L41 at `par 20`** (floor, per O1) | **−4** | `[23.7500, 25.0625]` | **`[−4.705319, −3.392819]`** | `[−4.589426, −3.276926]` |
| **L41 at `par 22`** (if `par 20` is pool-absent, O5) | −2 | `[25.7500, 27.0625]` | `[−2.705319, −1.392819]` | `[−2.589426, −1.276926]` |

**Published range for the seam: `ΔD_exec ∈ [−4.705319, −1.392819]`** (union over O5's admissible
first rungs); decomposition always `ΔD_exec = Δpar + 3·ΔB`, with the `par` term the dominant one
(`−4` at the floor) and `3·ΔB` shown beside it, never folded in. The full label, verbatim, for R-006b
(or Act III's own registration ticket) to cite:

> **RELIEF LABEL — `act-open` seam L40→L41 · `ΔD_exec ∈ [−4.705319, −1.392819]` (exact value
> filled in against this pre-published form once L41's `par` is selected; `par` term `−4` at the
> band floor) · band `[23.75, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip,
> never a claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law
> does **not** fire: Act III introduces **no** mechanic unit (RULING D; `M` is unchanged), and the
> both-pair object is **variety inside §7.2's Act III family**, one verb deeper than Act II's
> multi-pocket chain. `act-peak`/`act-close` ride on the act's **measured maximum**, never on this
> relief; the carrier obligation sits on **`L51–L60`** (§7.3.2). **The relief is largely an artifact
> of the measurement design:** RULING B's opener ladder is **derived** (floor-anchored, P2-exact,
> ceiling reserved for the tail), so the `par` term drops by **4** **by construction**, and the
> ceiling reservation itself caps the rung set's own top. The label therefore asserts **no** ease the
> instrument cannot see — `D_exec` is **blind to comprehension** (`M`/`T` are not terms in it), so
> *how the seam reads* (mastery breath vs deflation) is a **labelled Playtest hypothesis** (§7.3.3;
> the star-era instrument reads `NOT TESTABLE, n = 0`), not a result.

**Registration-side constants proposed** (mirroring the `ACT_II_B2/B3_SEAM_RELIEF_*` triples):
`ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41`,
`ACT_III_B1_OPEN_RELIEF_DELTA_RANGE = [−4.705319, −1.392819]` (the published bound), and the exact
`ACT_III_B1_OPEN_RELIEF_EXEC` / `_DELTA` **filled only after selection and before the bytes**.

**Evidence.** §7.3.1 (the form + instances 1–3); §7.3.3 / `star-era-asks-readiness.md` (`NOT
TESTABLE, n = 0`); item 129 (RV-012: the un-published batch-2 label — the fault class this prevents);
§7.8 item 5 (the same discipline one act earlier); `docs/ai-native-pipeline.md` §8.24 (LV-017's
own before-`--write` publication, `ΔD_exec −6.038144`).

**Result.** The Act II→III seam has a **registrable** label from the moment RULING B is law; no
number may be fitted after the bytes; and the act is explicitly **not** ruled seam-free, because the
seam is derived rather than predicted.

---

## Decision

1. **RULING A — Act III's `D_exec` band is `[23.7500, 33.0625]`** (printed `[23.75, 33.06]`),
   derived from `PAR_FLOOR = 20`, `PAR_CEILING = 28` and the measured `B` band `[1.2500, 1.6875]`;
   inclusive at both ends (§7.9); derived-exact, never read back from rounded text.
2. **RULING B — the L41–L45 opener rule is published as six clauses O1–O6**, ladder
   **`[20, 22, 24, 26, 26]`** (floor-anchored, P2-exact, **ceiling reserved** at `PAR_CEILING − 2`
   with a `0.6875` derived guarantee that `L51–L60` can carry the `act-close`), anti-mirror,
   empty-pool-absent, final-rung within-par maximum. **The opener carries no `act-peak`/`act-close`
   branch** — §7.3.2's carrier obligation is `L51–L60`.
3. **RULING C — Act III admits `par 20–28` inclusive, and the star law is total over it**: no new
   star row is ruled and `docs/game-design.md` §14.2 needs no edit; the dispatch's `k1`/`k2`
   restatement is corrected against the record.
4. **RULING D — zero new mechanics, zero new board features, zero architect-impact.** Prefer the
   **`CX = 1`** frames and the proven 4-pocket device class; the XOR door is already shipped
   semantics (review-flagged). Anything beyond is architect-impact and needs its own ADR.
5. **RULING E — the `L40→L41` `act-open` relief is PRE-PUBLISHED** as §7.3.1 instance 4, with the
   published bound `ΔD_exec ∈ [−4.705319, −1.392819]`; the exact value is a fill-in before the
   bytes, never after.
6. **No code, no constant, no dataset, no gate, no registered row, no Act I/II band moves.** The law
   constants in RULINGS A and E are **proposals handed to the integrator** (GD writes no code).
7. **ADR-design-0005, ADR-design-0006 and ADR-design-0007 are not edited** — this ADR **riders** onto
   them by name.

---

## Consequences

- **Positive.** Act III stops being "Act II's band, slid up": its band is derived from its own `par`
  band on §7.9's formula, its opener is pre-runnable before any census, its climax is
  **satisfiable by construction** rather than by hope, its par range is stated with the star law's
  totality proved over it, and its seam relief cannot be fitted after the fact. Act III also
  consumes the **measured** frame axis (`CX = 1`) instead of betting on an unmeasured one.
- **Handed over (not this lane's to do).** (a) **Level lane:** run the `H` (both-pair) census on the
  `CX = 1` frames; apply O1–O6; publish the rejection histogram with the accepts (§7.5 item 2);
  STOP-AND-ROUTE if the truncated set cannot populate five rungs. (b) **Architect + Level/Solver:**
  the §7.9 corollary's constant alignment (still open from ADR-design-0007) now has an Act III
  sibling — `ACT_III_EXEC_BAND` should be **computed**, per LV-016's pattern. (c) **QA:** §7.5's
  per-batch reporting gains the Act III reading beside the Act II one. (d) **Orchestrator:** approval
  per AGENTS §4.
- **Risk register.** (a) *The opener's floor anchor makes Act III open too easily* — bounded and
  labelled: the seam is an `act-open` relief whose felt half is a Playtest hypothesis, and §6's
  comprehension-first rationale is the ground; if the cohort declares `deflation` **at L40→L41**,
  that is §7.3.3's own signal and the C path is armed for **future acts** (ADR-design-0007 RULING B).
  (b) *The reserved ceiling `26` turns out pool-empty* — O5's absent-never-substituted rule handles
  it, and a shortfall routes to GD rather than widening the ladder. (c) *The `H` lattice's `par 26` /
  `par 28` classes are unmeasured* — a **named census obligation**, never a promise (§7.0), exactly
  as Act II's `par 24` was before LV-015 measured it.
- **Neutral / not changed.** The locked core loop; every level byte and registered row; weights
  `w1…w5`; Act I's measured band; Act II's band and registrations; §6's dip law; §6.1's P1–P4;
  §6.2's sealed-landing law; §7.2's acts/bands/batch sizes; §7.5's proof obligations; §7.6's
  sampling policy; the star thresholds and the post-win-only presentation.

## Booked, not solved here

- **The structural chain-envelope question (100-rung e2e walk cost) stays BOOKED to the
  Architect**, at the Act IV juncture. This ADR **does not solve it and does not depend on it**: no
  clause in RULINGS A–E reads a cross-act walk, and every batch proves on its **own** bytes (§7.5).
  Act III's ladder is therefore **seam-walk-neutral** — if the architect's later choice is
  **per-act seam walks** rather than one `L1→L100` walk, no `par`, no band and no opener rule in this
  record changes; if it is a single chain, the same holds. Either option lands without re-opening
  Act III.