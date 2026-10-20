# ADR-design-0009 — Act III's INTERIOR-BATCH rule (the anchor-advance ladder), the O3 reservation's scope, and the pre-published `batch-seam` relief **instance 6** (`L45→L46`)

> Owner: **Agent 1 — Game Designer** · Task **GD-013** · Date **2026-10-19** · Status: **PUBLISHED LAW**
> Law text: `docs/level-design.md` **§7.10.6** (the interior-batch rule **B1–B7** + the reservation's scope +
> the `par 27` refusal + the closed ambiguities) and **§7.10.7** (the instance-6 label, verbatim); the
> register row is `docs/level-design.md` **§7.3.1** instance **6**.
> Rider, not an edit: **ADR-design-0008** (the Act III band, the `L41–L45` opener rule, star totality,
> the `act-open` relief) is **quoted and extended, never rewritten**; ADR-design-0005 / -0006 / -0007 and
> `docs/game-design.md` §14.2 are **not touched**.
> Scope: **no code.** This ticket writes no `src/**`, no `scripts/**`, no `tests/**`, no level byte and no
> constant. Every number below is **read from `src/core/solver/policy.ts`** (constants, cited with their
> computed values) or **derived from published law** by the arithmetic shown. The trigger is `LV-019`'s
> gate: a batch-seam relief must be pre-published **by the register's owner** before the level lane's
> census, exactly as instance 5 was (`docs/project-status.md` item 157).

---

## Why this is its own ADR (and not a §-edit inside ADR-design-0008)

ADR-design-0008 legislated **the opener** (`L41–L45`), the act's band, star totality, the `act-open` relief
and the mechanics stance. It says nothing about **how an interior Act III batch's par ladder is derived**,
and its clause **O3** is written in the opener's own terms ("opener rungs top out at …"). This ruling
**legislates a region 0008 left to the lane**, and it does four things 0008 did not:

1. it **publishes a rule for every interior batch** (B1–B7), so the lane *derives* the multiset instead of
   *censusing it into existence*;
2. it **extends the scope of O3's reservation** from "the opener's rungs" to **every rung of `L41–L50`** —
   a scope extension of a published clause, which must be recorded, never silently widened;
3. it publishes a **register-wide relief-admissibility test** (the `Δpar` term), which governs every future
   seam in every act;
4. it closes two **latent §7.10 ambiguities** the opener never exercised (plural same-par rungs under O6;
   `par 27`'s status under O3).

The alternative — folding this into §7.10.2's prose — would have left the *rule* inside a clause table that
is scoped to the opener, which is precisely the F-L31-2 / F-L36-2 failure mode this register keeps paying
for (a label that no longer describes the thing it measures).

---

## Original Hypothesis

ADR-design-0008's §7.10.2 (O1–O6) was believed to be **sufficient law for Act III's par ladders**: the
opener's ladder is *derived* (P2-exact window off `PAR_FLOOR`, ceiling reserved, 5th rung repeating the
truncated top), and §7.10.3 fixed the act's admitted `par` range (`20–28`). The interior batches
(`L46–L50`, `L51–L55`, `L56–L60`) were expected to need **no further rule**: LV-015's and LV-017's Act II
practice — derive a 5-member ladder from the band + P2 + the batch's own census — was assumed to transfer,
and §7.3's *interior freedom* was assumed to cover the rest ("a member of an act sits anywhere inside the
act's `D_exec` band, in any order").

Stated falsifiably: **if §7.10.2 + §7.10.3 + §7.3 determine the interior batches' multisets, then any
competent lane derives the same multiset and no new law is owed.**

## Problem

Four defects, each measured or arithmetically shown — none of them a taste complaint.

1. **The usable `par` set for Act III's FIRST HALF is smaller than for Act II's batches, so LV-017's
   uniqueness argument does not transfer — and the derivation stops being unique.** LV-017's uniqueness was a
   counting identity: *5 members × step 2 = span 8 = the band's own width* ⇒ `[16, 18, 20, 22, 24]` **unique**
   (`docs/ai-native-pipeline.md` §8.24 / `docs/level-design.md` §7.8 item 4). Act III's band width is also 8
   (`PAR_FLOOR 20` → `PAR_CEILING 28`), **but O3's reservation removes `27` and `28` from the first half**, so
   the usable set is `{20, 22, 24, 26}` — width **6** across **4 values**. A 5-rung batch cannot span 8 with
   steps of 2 inside a width of 6: **every admissible 5-rung multiset must contain a repeat.** With repeats in
   play the counting identity is gone, and the surviving clause set `{P2 step, repeats only at the truncated
   top (O5's descending fill), anti-mirror (O4), within-par max-late (O6), reservation (O3)}` admits **three**
   candidates for batch 2 — `[22,24,26,26,26]`, `[24,26,26,26,26]`, `[26,26,26,26,26]` — and only excludes
   `[20,22,24,26,26]` (which *is* batch 1, refused by O4). **The hypothesis is falsified at its core: the
   multiset is not unique, so the lane would be *searching* (census-selecting) the act's par frame — the
   practice §7.10.2 was written to forbid** ("a rule, not a search").
2. **O2/O3's reservation is scoped to the opener in its own words, so a `par 27` rung anywhere in
   `L41–L50` would silently break §7.3.2's by-construction guarantee.** O3's guarantee is not about the
   opener's *rungs*; it is about the **first half's ceiling**: §7.3.2's carrier (`L51–L60`) must top the first
   half **by construction**, and a single `par 27` rung can measure up to `27 + 3·1.6875 = 32.0625`
   (policy.ts `ACT_III_B_BAND[1] = 1.6875`), which **exceeds** the `par 28` tail rung's floor
   `28 + 3·1.2500 = 31.7500` by `0.3125`. Read as written, the clause would have to be *re-derived per rung*
   by whoever happened to notice. It must be read as **one boundary over one half**.
3. **The register has no entry for `L45→L46`, and §7.3.1 refuses an unlabelled relief.** Any batch-2 ladder
   other than the flat `[26×5]` re-anchors below `L45`'s `par 26`, i.e. the seam acquires a **negative `par`
   term** — a §7.3 interior relaxation at a `ΔM = 0` boundary. §7.3.1: *"A relief that has no pre-published
   label is **not registrable**."* The level lane is therefore **hard-gated** on this register's owner
   (`docs/project-status.md` item 157: seam-6 gated on GD-013).
4. **Two latent ambiguities in §7.10, both unexercised by the opener.**
   (a) **O6 with plural same-par rungs**: *"the final rung takes the within-par maximum `D_exec`; every
   earlier rung the minimum"* — the opener had **one** non-final `par 26` rung (`L44`), so the convention for
   **two** non-final same-par rungs was never exercised; batch 2's derived multiset has **two** of them
   (`L48`, `L49`). Left open, the lane would invent an order silently.
   (b) **The relief test itself**: is a seam with `Δpar = 0` whose `D_exec` residue is negative (a `B`-only
   wiggle, bounded by `3·(B_hi − B_lo) = 3·0.4375 = 1.3125`) a *registrable relief*? §7.3.1's form
   **leads with the `par` term** ("decomposition always `ΔD_exec = Δpar + 3·ΔB` with the `par` term shown
   beside it, never folded in"), and every registered instance has a **negative `par` term as its dominant
   term** (`−4`, `−4`(instrument), `−4`, `−6`, `−4`), but the register never says so as a **test**.

## Change

**Nothing in the locked core loop, in any mechanic, in any weight/gate/band, in any registered row and in
any level byte changes.** The change is law text for Act III's interior batches plus one register entry.

**1 — The interior-batch rule (B1–B7), `docs/level-design.md` §7.10.6.** For Act III batch `ℓ` (`L41+5(ℓ−1) …`):

- **B1 · anchor advance.** `A_ℓ = PAR_FLOOR + 2·(ℓ−1)` (`policy.ts`: `ACT_III_PAR_FLOOR = 20`), i.e. the
  ladder's floor advances by **exactly one P2 step** per batch: `A₁ = 20`, `A₂ = 22`, `A₃ = 24`, `A₄ = 26`.
- **B2 · consistency check (the rule's own proving test).** Applied at `ℓ = 1`, B1–B5 **reproduce the
  published opener multiset `[20, 22, 24, 26, 26]` exactly** (`policy.ts`
  `ACT_III_OPENER_PAR_MULTISET`). A rule that did not reproduce already-published law would be a new rule
  wearing 0008's clothes.
- **B3 · reservation scope + `par 27`'s boundary (closes Problem 2).** For **every** rung of `L41–L50`,
  `par ≤ ACT_III_OPENER_TOP_PAR = 26`. Arithmetic: `26 + 3·1.6875 = 31.0625 < 28 + 3·1.2500 = 31.7500`,
  margin `0.6875` (= `policy.ts` `ACT_III_CEILING_RESERVATION_MARGIN`, computed as
  `ACT_III_PAR_CEILING + 3·B_lo − (TOP + 3·B_hi)`), while `27 + 3·1.6875 = 32.0625 > 31.7500` by `0.3125`.
  **`par 27` is INADMISSIBLE in batch 2** — the boundary is `p ≤ 26` under both an inclusive and a strict
  reading, so the answer does not depend on the operator (§7.9's lesson applied pre-emptively).
- **B4 · truncate + fill.** The P2-exact window from `A_ℓ` is truncated at `26`, and the shortfall is
  absorbed by repeats **at the truncated top** (O2/O5 verbatim: descending fill at the highest available
  derived par).
- **B5 · within-par convention (O6) + the plural-same-par tie-break (closes Problem 4a).** The closing rung
  takes the within-par **maximum**, every earlier rung the **minimum**; where **two or more** non-final rungs
  share a par, they take the pool's **lowest** accepted `D_exec` values **in ascending id order**, with
  LV-015/LV-017's published tie-break inside a value (**minimal `D_exec`, then enumeration order**) — a
  convention the opener never exercised.
- **B6 · empty pool (O5 verbatim, plus the seam's degenerate case).** A derived par absent from the census
  pool is **ABSENT and never substituted**; the fill drops to the next-lower derived value. If the pool
  forces the fill **up to `26`** (i.e. `A_ℓ`'s and the next-lower value's pools are both empty), the seam's
  `par` term is `0`: the label at that seam is **void — not a relief** — and the lane **STOP-AND-ROUTES to
  GD** rather than registering a void label or silently re-anchoring.
- **B7 · anti-mirror (O4 verbatim, generalised to Act III).** The multiset must differ from every registered
  Act II multiset (`[17,18,20,21,23]` · `[19,22,22,24,24]` · `[18,20,22,24,24]`) and from every other Act III
  batch's; **coinciding pars are printed, never hidden**.

**Resulting batch-2 ladder: `[22, 24, 26, 26, 26]`** (`L46 22 · L47 24 · L48 26 · L49 26 · L50 26`), the
multiset selected from the three admissible candidates **not** by taste but by the published **tie-break**:

> **§7.10.6 B1 TIE-BREAK (published, because the multiset is not unique).** Where the clause set admits more
> than one multiset, take the one whose **anchor is the smallest admissible advance above the previous
> batch's anchor** — here **one P2 step**. Grounds, in the register's own idiom: (i) it is the **minimum
> advance that clears B7** (re-anchoring at `20` reproduces batch 1's multiset, which O4/B7 refuse); (ii) it
> keeps **every value of the act's derived window in the act's par vocabulary** (a two-step advance would
> leave `22` with no home in Act III's four ladders), which is O1's derivation being spent, not re-tuned;
> (iii) it is a **minimality convention**, the same form O6 already uses inside a par (`earlier rungs take
> the minimum D_exec`) and LV-015/LV-017 use inside a value (`minimal D_exec, then enumeration order`) —
> **it is a tie-break, labelled as one: it is not claimed as a derivation, and it is the part of this ruling
> a future ticket may replace with its own ADR if a measurement contradicts (ii)**.

**2 — The scope of O3's reservation (closes Problem 2)**, published as B3 above: `L41–L50`'s par ceiling is
`26`, so O3's by-construction guarantee is a property of the **half**, not of the opener's realised `B`.

**3 — The register-wide relief test (closes Problem 4b)**, published in §7.10.7:

> **§7.10.7 RELIEF-ADMISSIBILITY TEST. A `ΔM = 0` seam is a registrable relief iff its `par` term is
> negative** — `ΔD_exec = Δpar + 3·ΔB` with `Δpar < 0`. A seam with `Δpar = 0` is **not** a relief: its
> `D_exec` residue is `3·ΔB`, bounded by `3·(B_hi − B_lo) = 3·(1.6875 − 1.2500) = 1.3125`, and is published
> as an **instrument reading**, never labelled (the LV-017 precedent, where interior minima
> `−0.071490 / −0.071739 / −0.019565 / −0.109810` were published beside the selection and **not** labelled).
> Every registered instance has a negative `par` term (`−4 · −4 · −4 · −6 · −4`), so the test **describes the
> register it governs**; it does not narrow it — a seam that a future act drives negative *through the `par`
> term* remains registrable exactly as instances 1–5 were. **The test is stated so the boundary is law, not
> so it can be worked around:** a lane that measures a seam with `Δpar < 0` owes this register a label
> **before the bytes**, whatever the `D_exec` sign.

**4 — `RELIEF INSTANCE 6` — `batch-seam` `L45→L46`, pre-published (§7.10.7; register row §7.3.1 item 6).**

| | |
|---|---|
| comparator (previous side) | **`L45 = 30.455319`** — `policy.ts` `ACT_III_REGISTERED_TAIL_EXEC` (level id `ACT_III_REGISTERED_TAIL_LEVEL_ID = 45`), the Solver's read of the ROOT bytes at R-007 |
| first rung's admissible pars | **`22`** (B1's primary anchor) and **`24`** (B6's descending-fill fallback) |
| `par` term | **`−4`** (primary: `26 → 22`) · `−2` (fallback: `26 → 24`) |
| published bound | **`ΔD_exec ∈ [−4.705319, −1.392819]`**, the **union** of `par 22` ⇒ `[−4.705319, −3.392819]` and `par 24` ⇒ `[−2.705319, −1.392819]` |
| band | **`[23.7500, 33.0625]`**, printed `[23.75, 33.06]` — `policy.ts` `ACT_III_EXEC_BAND`, derived-exact, inclusive (§7.9) |
| exact value | **a fill-in against the published form, before the bytes** (`ACT_III_B2_SEAM_RELIEF_EXEC` / `_DELTA`), exactly as instance 5's `db78a13` preceded `568c136` |

The bound's arithmetic, shown so the level lane can verify its measured `Δ` inside it
(`D_exec = par + 3·B`; `B ∈ [1.2500, 1.6875]`, `policy.ts` `ACT_III_B_BAND = BLOCK_L1619_B_BAND`):

```
par 22 : [22 + 3·1.2500, 22 + 3·1.6875] = [25.7500, 27.0625]  −  30.455319  =  [−4.705319, −3.392819]
par 24 : [24 + 3·1.2500, 24 + 3·1.6875] = [27.7500, 29.0625]  −  30.455319  =  [−2.705319, −1.392819]
union  : [                                          −4.705319, −1.392819  ]
```

**Two properties of this bound are stated so a reader can check them rather than trust them.**

- **The `+2` shift identity, proved in one line.** `22 − 30.455319 = 20 − 28.455319 = −8.455319`, so the
  batch-2 seam's bound is **numerically identical** to instance 5's (`[−4.705319, −1.392819]`), because both
  the anchor and the comparator advanced by exactly `2`. **The bound coincides; the fill-in must not.**
  Instance 5's value is `−4.197990` (`L41`'s `B` `1.4191`); a lane that re-quotes it for `L46` would be
  quoting a **different board's `B`** — the coincidence is a checkable identity, not a template.
- **It is a union, not an interval.** A fill-in landing in `[−4.705319, −1.392819]` but in **neither**
  admissible half is **outside** the label, not inside it — instance 5's own `…ADMISSIBLE_FIRST_RUNGS`
  docstring states this and that discipline is unchanged.

**Label text (verbatim, for the registration ticket to cite).** `docs/level-design.md` §7.10.7 carries the
full label; its header line is:

> **RELIEF LABEL — `batch-seam` seam L45→L46 · `ΔD_exec ∈ [−4.705319, −1.392819]` (exact value filled in
> against this pre-published form once L46's `par` is selected; `par` term `−4` at the anchor) · band
> `[23.7500, 33.0625]` (printed `[23.75, 33.06]`).**

**5 — What batch 2 carries, and what it does not.** Batch 2 **carries no `act-peak` / `act-close` branch**
(unchanged from §7.10.2's reading: §7.3.2's carrier is `L51–L60`; §7.3's `act-peak` binds the act's measured
maximum, evaluated per batch). It **carries instance 6** and it **reports** its measured peak. The
consequence is stated in advance so it cannot read as a surprise later: batch 2's ceiling is `31.0625`
(B3), strictly below **any** `par 28` tail rung's floor `31.7500`, and below `L45`'s measured `30.455319`
only if its own `par 26` pool tops out below `B = 1.4851` — **either way §7.3.2's carrier obligation stays
satisfiable by construction on `L51–L60`**, which is the same guarantee O3 established and which **B3
extends** rather than weakens.

## Evidence

| # | Evidence | What it settles |
|---|---|---|
| 1 | `src/core/solver/policy.ts` — `ACT_III_PAR_FLOOR = 20`, `ACT_III_PAR_CEILING = 28`, `ACT_III_B_BAND = BLOCK_L1619_B_BAND = [1.25, 1.6875]`, `ACT_III_EXEC_BAND` **computed** `= [23.7500, 33.0625]`, `ACT_III_OPENER_PAR_MULTISET = [20,22,24,26,26]`, `ACT_III_OPENER_TOP_PAR = 26`, `ACT_III_CEILING_RESERVATION_MARGIN` (computed `0.6875`), `ACT_III_B1_LADDER`, `ACT_III_REGISTERED_TAIL_LEVEL_ID/_EXEC = 45 / 30.455319`, `ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING = 2.607181` | every constant quoted above is **read from the module**, never retyped from memory; both band endpoints are dyadic ⇒ the arithmetic is bit-exact (§7.9) |
| 2 | §7.3.1 instances **1–5**, verbatim | the register's **order** (monotone by seam position, GD-012b) and its **form**: `ΔD_exec = Δpar + 3·ΔB`, the `par` term shown, the bound pre-published, the value a fill-in. Every instance's `par` term is negative (`−4`, `−4`, `−4`, `−6`, `−4`) — the empirical shape the new **relief test** formalises |
| 3 | **LV-017's uniqueness argument** (`docs/ai-native-pipeline.md` §8.24; §7.8 item 4): *5 members × step 2 = span 8 = the band's width ⇒ unique* | the precedent my Problem 1 **measures the failure of** in Act III's first half (usable width 6 across 4 values ⇒ repeats are forced ⇒ no counting identity) |
| 4 | `docs/ai-native-pipeline.md` §8.26 / LV-018 census (Act III, `--stage=g --act=3 --pockets=4 --cx=1 --h=7`, budget HIT = prefix **floor**): pool by par `20:171 · 21:333 · 22:387 · 23:561 · 24:512 · 25:653 · 26:599 · 27:630 · 28:556` | **`par 22` and `par 24` are measured non-empty on the frame/device family the lane reuses** — evidence that B1's primary anchor is populatable, **not** a promise (B6 keeps ABSENT-never-substituted, and the lane must verify with its own census; a prefix census licenses no class claim — item 114's law) |
| 5 | The three admissible candidates `[22,24,26,26,26]`, `[24,26,26,26,26]`, `[26,26,26,26,26]` vs the clause set `{B3, B4, B5, B7}` | **uniqueness fails honestly**, which is *why* B1 publishes a tie-break instead of pretending the multiset was forced — the ticket's own escape valve, used because it is true |
| 6 | Registration rows: `ACT_III_B1_LADDER` (`L45 par 26 / 30.455319 / B 1.4851`), `ACT_II_B1..B4_LADDER` multisets | the comparator, the `Δpar` (`26 → 22`), and B7's anti-mirror list are all read off **registered** rows |
| 7 | §7.3.2 (the `act-close` carrier is `L51–L60`), §7.10.1's read-outs (floor `4.705319` below Act II's closing rung) | batch 2 **owes no clause**; its peek is a reading; the carrier guarantee rides B3's boundary |
| 8 | `docs/project-status.md` item 157 (GD-013's gate: *"the L45→L46 seam either gets RELIEF INSTANCE 6 … or an explicit no-relief ruling"*), item 154 (the XOR/`H` question booked to **GD + Architect** for the `L51–L60` era, *"NOT gating batch-2 L46–L50, which needs no new device"*), user ruling **U-002** (XOR held for the act's second half) | the *order* (law before census, register owner pre-publishes the seam) and the *scope* (batch 2 needs no device decision) |

**What is *not* evidence, stated so it cannot be read as any.** No playtest datum exists for this seam
(§7.3.3's star-era instrument reads `NOT TESTABLE, n = 0`). **The felt half of every claim here is a labelled
hypothesis, not a result**: `D_exec` carries no comprehension term (`M`/`T` are not in it), so *"a
`par 22` re-anchor makes L46 read as a breath"* is a **hypothesis** — and the label says so in its own text,
exactly as instances 2–5 do. My own preference for a sawtooth over a plateau is **not** evidence (AGENTS §7);
it is the reason the tie-break's clause (ii) is published as a **checkable** claim (`22`'s home in the act's
four ladders) that a measurement could contradict.

## Result

- **Batch 2's par ladder is law before its census exists:** `[22, 24, 26, 26, 26]` (`L46 22 · L47 24 ·
  L48 26 · L49 26 · L50 26`), derived by **B1–B7** with a published tie-break, and **`par 27` is
  inadmissible** (`32.0625 > 31.7500`, by `0.3125`) — the reserved-top clause now has a **half-wide**
  boundary with its arithmetic on the page.
- **The `L45→L46` seam is a registrable re-anchor, and it is pre-published:** `RELIEF INSTANCE 6`,
  bound **`[−4.705319, −1.392819]`** (union of `par 22` ⇒ `[−4.705319, −3.392819]` and `par 24` ⇒
  `[−2.705319, −1.392819]`), band `[23.7500, 33.0625]`, `par` term `−4`, exact value a
  **fill-in before the bytes**. **No relief is owed anywhere else in batch 2** — its interior steps are
  `+2` (`22→24`) and the same-par repeats ascend by `B` (B5).
- **Two latent §7.10 ambiguities are closed** (plural same-par rungs under O6; `par 27`'s status), plus the
  register-wide **relief-admissibility test** (`Δpar < 0`).
- **The register stays monotone (1–6 by seam position)** and the *no-relief* branch is **not taken** —
  not because a breath is desirable, but because B1's tie-break re-anchors at `22`, which makes the seam a
  `ΔM = 0` interior relaxation by arithmetic.
- **Untouched:** the locked core loop (no AGENTS §2 triad — this is band/ladder law, not the phase loop);
  every registered row; every band value; every weight; every gate list; every sidecar cell; every level
  byte; all of `src/**`, `scripts/**`, `tests/**`; `docs/game-design.md` (no mechanic, no HUD, no star row);
  ADR-design-0005 / -0006 / -0007 / -0008 bodies (0008 is a **rider**, quoted and extended).
- **Left gated, by name:** the `L51–L60` tail's ladders (which must redeem the reserved `par 28` and be
  B7-distinct from `[20,22,24,26,26]` and `[22,24,26,26,26]`) stay unlegislated here — they are **coupled to
  the XOR multi-switch door / `H` both-pair device-contract question booked to Game Designer + Architect**
  (`docs/project-status.md` item 154), and the reservation's *release* clause belongs to that ruling.

## Handoff

1. **LV-019 (level lane, Act III batch 2 `L46–L50`)** — **UNBLOCKED.** Run the census on the pre-published
   rule (B1–B7), verify the measured seam's `ΔD_exec` lands **inside the published union and inside the
   admitted half** for whichever first rung the pool supports, **fill `ACT_III_B2_SEAM_RELIEF_EXEC` /
   `_DELTA` in a commit that precedes the board bytes** (the instance-5 provenance shape: bound → fill-in →
   bytes, git-datable), and cite **this commit** as the pre-census provenance. If the pool forces B6's
   degenerate case (`par 22` **and** `par 24` both absent ⇒ fill at `26` ⇒ `Δpar = 0`), **STOP-AND-ROUTE to
   GD**: the label is void and a void label is not registrable.
2. **Registration (the `R-008`-era train)** — `ACT_III_B2_PAR_MULTISET`, `ACT_III_B2_IDS`,
   `ACT_III_B2_SEAM_RELIEF_LEVEL_ID = 46` / `_PREVIOUS_*` alias-typed to `ACT_III_REGISTERED_TAIL_*` /
   `_DELTA_RANGE = [−4.705319, −1.392819]` / `_ADMISSIBLE_FIRST_RUNGS`, the lesson rows, the sidecar at 50,
   the registry row, the count pins. **Fill-in-before-bytes is the register's rule, not a preference.**
3. **QA** — one control per new gate code, in the `policy-negative-controls` Record (the R-005a2 / R-006c
   precedent), if the lane adds an `act-3-batch-2`-keyed reader.
4. **Game Designer + Architect (the `L51–L60` era)** — the XOR/`H` device-contract question and, with it,
   the tail's ladder law and the reservation's release. **Not gated on this ticket and not gated by it.**
5. **Playtest** — §7.3.3's ASK extends naturally to the L45→L46 seam (the register's sixth instance), with
   the felt half **labelled**: `D_exec` is blind to comprehension and the instrument reads `NOT TESTABLE,
   n = 0`.