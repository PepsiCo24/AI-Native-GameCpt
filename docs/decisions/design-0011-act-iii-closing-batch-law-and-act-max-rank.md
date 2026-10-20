# ADR-design-0011 — the Act III CLOSING batch (`L56–L60`, B1–B7 at `ℓ = 4`), the register's first **comparator-free** relief bound (instance 8, `L55→L56`), and the **ACT-MAX RANK** ruling for an act's close

> Owner: **Agent 1 — Game Designer** · Task **GD-015** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> Law text: `docs/level-design.md` **§7.10.11** (the `L56–L60` ladder at `ℓ = 4` — B1–B7 applied —, B6's
> **no-fallback** reading, and the **B7-vs-batch-3 conditional**), **§7.10.12** (register §7.3.1 **instance
> 8**: the `L55→L56` `batch-seam` relief, pre-published, with the register's first **comparator-free**
> bound, plus finding **`F-GD015-1`**), and **§7.10.13** (the **ACT-MAX RANK** ruling, the plateau-top
> arithmetic, the two refused options, and the `L56–L60` XOR pacing). The register row is
> `docs/level-design.md` **§7.3.1** instance **8**; the rank clause also lands as a **dated rider** at
> `docs/level-design.md` **§7.3.2**.
> **Rider, not an edit:** **ADR-design-0009** (the interior-batch rule **B1–B7**, the `L45→L46` seam relief
> instance 6, the register-wide relief-admissibility test) and **ADR-design-0010** (the XOR device ruling,
> the `G2-X` obligation, the `par 28` release, the `L51–L55` ladder `[24,26,28,28,28]`, instance 7) are
> **quoted and extended, never rewritten**. ADR-design-0005 / -0006 / -0007 / -0008 and
> `docs/game-design.md` are **not touched** (0006's `act-close` clause body is untouched too — this ticket
> adds a **dated rider** beside it).
> Scope: **no code.** This ticket writes no `src/**`, no `scripts/**`, no `tests/**`, no level byte and no
> constant. Every number is **read from `src/core/solver/policy.ts`** (constants, cited with their computed
> values), **read from a law artifact**, or **derived by the arithmetic printed beside it** — and the whole
> arithmetic was re-computed **from `policy.ts` by a throwaway disk-reading script at this ticket's base**,
> so nothing below is a recollection.
> Trigger: **§7.10.10's closing paragraph** hands this batch to the design lane **by name** ("Batch 4's
> (`L56–L60`) ladder is **GD-015's** era: this ruling binds it only through **B7** … and the act band"),
> **§7.10.9.2 B7** binds batch 4 to differ from every landed Act III multiset **and from batch 4's**, and
> **§7.5** forbids registering with a caveat — so the level lane is **gated on a published rule** here,
> exactly as it was on GD-013 (item 157) and GD-014 (items 154/159). `docs/project-status.md` item 167
> additionally names this era for the constant re-pins that batch 3's registration will force.

---

## Why this is its own ADR (and not a §-edit inside ADR-design-0009 or -0010)

ADR-design-0009 legislated the interior batches **as a rule** and named `L56–L60` inside that rule's scope
— then handed the last batch out **by name** in §7.10.7's closing paragraph. ADR-design-0010 applied the
rule at `ℓ = 3`, released the `par 28` reservation, and bound batch 4 **only by constraint** ("this ruling
binds it only through B7 … never by a preview"). Three things are therefore owed that **neither** ADR could
have published:

1. **The rule's LAST application inside the act** — `ℓ = 4` is the final `ℓ` that exists (batch 4 is the
   act's closing batch), so this is the only place where the ladder law's own **degeneracy** can be seen:
   B4 truncates the window to **two** values and B6's fallbacks are then **both singletons**. That fact is
   invisible at `ℓ = 1, 2, 3` — every earlier batch had a non-flat fallback — and it changes what "ABSENT,
   never substituted" means for the close.
2. **The register's first COMPARATOR-FREE bound** — instances 1–7 each priced a seam against a **measured**
   comparator. Instance 8 cannot (its left side does not exist yet) and does not need one, because `Δpar`
   is **law** and the `B` term is bounded by the **published band**: a *general* property of the register,
   named so it can be reused rather than rediscovered.
3. **The ACT-MAX RANK question** — a **new clause class**. §7.3.2 (ADR-design-0006) fixes the *place* of an
   act's maximum (its last two batches) and §7.3 fixes its relation to the previous **act**; neither says
   anything about the **order inside the window the close occupies**. Act III is the first act where that
   residual is (i) small enough to be one comparison (`L60` vs `L55`) and (ii) **decidable in arithmetic**
   rather than by taste.

The alternative — folding all three into a "fill-in note" under §7.10.9/§7.10.10 — would have left the
level lane to *infer* a ladder, an unlabelled seam, and the act's closing shape at census time: the three
inferences that the register's whole history (F-L31-2, F-L36-1/2, RV-012's unlabelled `−6.044410`) exists to
prevent.

---

## Original Hypothesis

Three hypotheses were live before this ticket; each is stated so it can be **falsified on disk**.

**H-ladder (what B6 does at `ℓ = 4`).** *The interior-batch rule at `ℓ = 4` behaves like it did at
`ℓ = 2` and `ℓ = 3`: if a derived par is absent from the census pool, B6 drops the fill to the next-lower
derived value and the batch keeps a **non-flat** shape, so the ladder has a lawful fallback and the seam's
`par` term merely **widens** (`Δpar = −4` instead of `−2`).*

**H-relief (what instance 8 can publish pre-census).** *Because `L55` is not registered and not even
censused, instance 8's bound must be published the way instances 1–7 were: as a bound **anchored on a
measured comparator**, with its exact value a fill-in against that comparator. A comparator-free bound is
not available — the seam's `D_exec` depends on two boards' `B`, and one of them does not exist.*

**H-close (whether the band answers the act-max question).** *The `par 28` class occupies
`[31.7500, 33.0625]` and the act's ceiling is `33.0625`; since `L60` must take the within-par **maximum**
(B5), the act's maximum lands on `L60` automatically — so the band already decides the close and no clause
is owed.*

Falsifiable forms: **H-ladder** — if the post-truncation window at `ℓ = 4` has fewer than three values,
removing any one value leaves a multiset of one value, i.e. the fallback is **flat**. **H-relief** — if
`Δpar` is fixed by published law **and** `3·(B_hi − B_lo) < |Δpar|`, the bound and its sign do not depend on
either comparator's measured value. **H-close** — if the band admits an ordering of (`L55`, `L60`) in which
`L60 < L55`, the band does **not** decide it.

## Problem

Four defects, each shown by arithmetic or by a law read — none a taste complaint.

1. **H-ladder is FALSIFIED at `ℓ = 4`, and the falsification is structural.** B1's anchor at `ℓ = 4` is
   `A₄ = ACT_III_PAR_FLOOR + 2·(4−1) = 26` (read from `policy.ts`; `ACT_III_PAR_FLOOR = 20`). B4's window
   from `26` is `[26, 28, 30, 32, 34]`, truncated at `ACT_III_PAR_CEILING = 28` ⇒ `[26, 28]`, and the
   **3-rung** shortfall is filled by repeats at the truncated top. The **derived** set is therefore a
   **two-value** set. B6 removes absent values from the batch's own window and absorbs the shortfall by
   repeats at the truncated top (§7.10.9.2's own reading, calibrated by instance 6's published fallback
   `par 24` and by §7.10.9.2's STOP note). Removing **either** of two values leaves a **singleton**:
   `26` absent ⇒ `[28×5]`; `28` absent ⇒ `[26×5]`. **Both are flat batches with no interior rise.** The
   non-flat fallback that existed at `ℓ = 2` and `ℓ = 3` **does not exist at `ℓ = 4`** — the ladder law
   runs out of room on its last application, and the lane must be told **before** its census, not after.
2. **H-relief is FALSIFIED — the bound is comparator-free — but only the bound.** `ΔD_exec = Δpar + 3·ΔB`;
   `Δpar = 26 − 28 = −2`, and **both pars are law**: `26` is B1's anchor at `ℓ = 4` and `28` is batch 3's
   closing par by B4/B5 (published at GD-014). `ΔB ∈ [1.2500 − 1.6875, 1.6875 − 1.2500] = [−0.4375,
   +0.4375]`, so `3·ΔB ∈ [−1.3125, +1.3125]` and **`|3·ΔB| ≤ 1.3125 < |Δpar| = 2`** ⇒ `ΔD_exec ∈
   [−3.3125, −0.6875]`, **entirely negative, for every in-band pair of `B`**. The bound needs neither
   `L55`'s nor `L56`'s measured value; it needs only that both are **in band** (`ACT_III_B_BAND =
   BLOCK_L1619_B_BAND = [1.25, 1.6875]`). **What remains comparator-dependent is the VALUE**, not the bound
   — so the fill-in still owes a pinned comparator (`F-GD015-1`), and the label still reports a seam
   **between two boards**.
3. **H-close is FALSIFIED — the band does not decide the close.** The candidates for Act III's maximum are
   `L55` and `L60`, both `par 28`, both B5 within-par **maxima**, drawn from **disjoint pools of one
   class**. `L56` can never be the act max (`par 26` ceiling `31.0625 < 31.7500 ≤` any `par 28` rung) and
   `L57–L59` are B5 pool **minima**, so B5 already ranks them below `L60` — but nothing ranks `L60` against
   `L55`: the band admits `L55 = 33.0625` with `L60 = 31.7500`, an **inversion of up to `1.3125`**. A band
   that admits both orders cannot publish a rule by containment; the clause must be a **comparison**, and a
   comparison can fail — so it needs a **named outcome when it fails**.
4. **B7's second operand does not exist yet.** B7 at `ℓ = 4` must differ from **batch 3's realised
   multiset**, and batch 3 is **not censused** (LV-020 is the in-flight/next authoring ticket). B6 can move
   batch 3's realised multiset to `[22,26,28,28,28]`, `[24,24,28,28,28]` or `[24,26,26,26,26]` (its fourth
   outcome `[28×5]` is already STOP-gated by §7.10.9.2 B6, so it may not register at all). A law that
   asserted distinctness **as a certainty** would be asserting a census outcome it has not seen — the class
   of certainty the register has refused since instance 3 (where LV-015 published a label while **neither**
   side was registered).

## Change

Published as law in `docs/level-design.md` §7.10.11–§7.10.13 (+ the §7.3.1 instance-8 index row and the
§7.3.2 rank rider). In outline:

**(a) §7.10.11 — the `L56–L60` ladder at `ℓ = 4`: `[26, 28, 28, 28, 28]`.** B1 `A₄ = 26` (the published
tie-break, third application) · B2 the rule now reproduces **three** landed multisets exactly
(`[20,22,24,26,26]`, `[22,24,26,26,26]`, `[24,26,28,28,28]`) · B3 the released ceiling, with the first
half's `par ≤ 26` scope and `par 27`'s inadmissibility **unchanged** · B4 `[26,28,30,32,34]` → truncated
`[26,28]` → 3 repeats at the top · B5 `L60` within-par **maximum**, `L56` the minimum, `L57–L59` the pool's
lowest values in ascending id order (**third** plural-same-par occurrence) · B6 **no non-flat fallback**
(both singletons are STOP-AND-ROUTE; the STOP is on **flatness**, generalised off the ceiling, plus an
arithmetic ground for `[26×5]`) · B7 distinct from every landed Act III multiset and from batch 3's
**realised** set by the named procedure below. The batch's interior structure is stated with its cost: the
**only** `Δpar` step is `L56→L57` and the `par 28` class's whole reachable span is `1.3125`, so the close's
intensity must be carried by **boards and the device**, not by the ladder.

**(b) §7.10.11 — the B7-vs-batch-3 NAMED CONDITIONAL (procedure, verbatim in the law).** LV-020's census
must **print batch 3's realised multiset before batch 4's ladder is frozen**; the batch-4 tool **re-runs B7
as a multiset-inequality over the REALISED set** (never a pairwise par comparison — coinciding pars are
printed); on **equality** the tool **writes nothing, prints both multisets, and STOP-AND-ROUTES to GD**
(re-anchoring B1's tie-break is a design decision with its own ADR — never a tool fix, never a widened
gate); on inequality the ladder stands and the realised batch-3 multiset is printed as the B7 witness. The
law also records a **reading, not a guarantee**: no admissible B6 path can raise a batch-3 rung to `26`
(a fill only removes values from a batch's own window, and batch 3's anchor is `24`) — so today no known
outcome collides; the conditional is published anyway.

**(c) §7.10.12 — register §7.3.1 instance 8, pre-published, comparator-free.** `batch-seam` `L55→L56` ·
`ΔD_exec ∈ [−3.3125, −0.6875]` · band `[23.7500, 33.0625]` (printed `[23.75, 33.06]`) · `par` term `−2` ·
**single half** (B6's fallbacks are both flat ⇒ STOP-gated ⇒ the anchor is the only admissible left `par`) ·
midpoint exactly the `par` term · the `1.3125` quoted as the **checkable coincidence** with §7.10.7's
`Δpar = 0` residue bound. Constants proposed in the **pin-literal** form (§7.10.10's register-wide form
law): `ACT_III_B4_SEAM_RELIEF_LEVEL_ID = 56`,
`…_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 55` / `…_PREVIOUS_EXEC_AT_REGISTRATION = <L55's registered value>`
as **literals**, delta **derived from the pin**, `…_DELTA_RANGE = [−3.3125, −0.6875]`,
`…_ADMISSIBLE_FIRST_RUNGS = [{ par 26, [−3.3125, −0.6875] }]`; ladder-side `ACT_III_B4_ANCHOR_PAR`,
`ACT_III_B4_PAR_MULTISET = [26, 28, 28, 28, 28]`. Two **named conditionals**: a **named F-L16-2 excursion**
on either board voids the band-width step (fill-in against the measured pair + STOP-AND-ROUTE), and if
batch 3's realised closing par moves off `28` then `Δpar ≥ 0` ⇒ §7.10.7's test makes the seam **not a
relief** ⇒ **this instance is VOID as published** (re-publication is a GD ruling). Finding **`F-GD015-1`**
named, not fixed (see Handoff).

**(d) §7.10.13 — the ACT-MAX RANK ruling, and its Why.** An act's **closing batch's maximum is the act's
maximum wherever the pool permits the selection**, enforced **before the bytes** by comparing the closing
rung against the highest registered rung **outside** the closing batch; where the pool does not permit it,
the inversion is a **NAMED act limitation with both measured numbers** (§7.3.2's escape hatch, inherited
verbatim) and registration proceeds (§7.5's no-caveat rule untouched: the caveat is on the act's shape,
never on a board's proof). For Act III the check is **one comparison**, `L60` vs `L55`. **(A) adopted in its
strongest satisfiable form; (B) max-within-batch-4 adopted as a consequence, never a substitute; (C)
unconstrained REFUSED.** The reasoning, said out loud: the plateau is **not a perceptual risk** — `par` is
never shown live (`GD-OQ1`, §7.1) and `D_exec` is not player-visible, so four `par 28` rungs are invisible
as repetition while the four boards are mechanically distinct (clone guard, §6.1.4) — therefore the
decision cannot rest on felt experience and rests on **the file's honesty about the clause it publishes**:
(C) would let §7.3.2's *"a shape with a culmination rather than … one long plateau"* be published about an
act whose last board is its **weakest-measured** ceiling rung (the `F-L31-2`/`F-L36-2` class). The duty
costs **zero headroom** (both candidates share the `33.0625` ceiling inside one `1.3125` window) and is
therefore not a padding pressure. The arithmetic half is law; the felt half is a **labelled hypothesis**
with a **testable prediction** (a measured `M5/M6`/replay climb across `L57→L60` on an inverted close
**falsifies** the rank duty and withdraws it with its own ADR).

**(e) §7.10.13.4 — the `L56–L60` XOR pacing (C4 continued), with `ΔM = 0` through the close.** The teaching
cycle completes at `L55`, so batch 4 is the **expression** phase: `L56` **OFFERED, never FORCED**
(`switchRequired: "exempt"` with a measured reason — a relief rung may carry the device, never an
obligation); `L57` **OFFERED** (the batch's lowest-measured `par 28` rung, so the demand grade stays
monotone in the batch's own measured order); `L58` **FORCED**; `L59` **FORCED**; `L60` **FORCED at the
within-par maximum**. Every XOR rung owes R1–R6 + the R5 refusal witness + **`G2-X`** (never the membership
reader); the named *"press un-opened the door"* risk gains a second measurement window (`L58` vs `L57`)
under redesign-never-relabel. **Refusals:** `par 29`/`par 30` (out of band at the **par** level and homed by
no Act III ladder by the mod-2 derivation — with the honest note that the `D_exec` band **alone** would not
refuse `par 29`, since `32.7500` is in band); the `5-pocket` device (refused **as uncensused** — named as
unmeasured, not as arithmetic-refused); any second derivation / schema / validator change (option (a)
DERIVABLE, ARCH-006 signed); a flat closing batch (B6's STOP); and any debut grade (§7.10.5).

## Evidence

Every number below is read from disk at this ticket's base (`develop` `33631aa`), or derived by the
arithmetic shown beside it; the derivation was **re-computed by a throwaway script that read the constants
out of `policy.ts`** rather than retyping them.

| # | Fact | Read where / derived how |
|---|---|---|
| 1 | `ACT_III_PAR_FLOOR = 20` · `ACT_III_PAR_CEILING = 28` · `ACT_III_PAR_BAND [20,28]` | `src/core/solver/policy.ts:2191–2195` |
| 2 | `ACT_III_B_BAND = BLOCK_L1619_B_BAND = [1.25, 1.6875]` | `policy.ts:2199` ← `:1384` |
| 3 | `ACT_III_EXEC_BAND = [23.75, 33.0625]` computed as `[20 + 3·1.25, 28 + 3·1.6875]` | `policy.ts:2206–2209` |
| 4 | `ACT_III_CEILING_RESERVATION_MARGIN = 0.6875` = `28 + 3·1.25 − (26 + 3·1.6875)` | `policy.ts:2228–2229` |
| 5 | `A₄ = ACT_III_PAR_FLOOR + 2·(ℓ−1)` at `ℓ = 4` ⇒ **26** | B1's formula, `policy.ts:2462–2467` at `ℓ = 2` |
| 6 | batch-4 window `[26,28,30,32,34]` → B4 truncation at `28` → `[26,28]` → 3 repeats ⇒ `[26,28,28,28,28]` | derived; window form from §7.10.9.2 B4 |
| 7 | `L56` ceiling `31.0625` < any `par 28` floor `31.7500`, margin `0.6875` | derived |
| 8 | instance-8 bound `[29.7500, 31.0625] − [31.7500, 33.0625] = [−3.3125, −0.6875]`, `|3·ΔB| = 1.3125 < 2` | derived; band from row 2 |
| 9 | `par 28` reachable span `1.3125` = **4.31 %** of the act's registered tail `30.455319` (`1.3125/30.455319`) | derived from `ACT_III_REGISTERED_TAIL_EXEC` (`policy.ts:2315`) |
| 10 | `31.7500 − 30.455319 = +1.294681` · `33.0625 − 30.455319 = +2.607181` | derived; both match `ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING = 2.607181` (`policy.ts:2346`) |
| 11 | `par 29`: `32.7500` **in** band, `34.0625` **out**; `par 30`: floor `33.7500` out by `0.6875` | derived (row 2) |
| 12 | Act II's registered multisets `[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`; Act III's landed `[20,22,24,26,26]`, `[22,24,26,26,26]`, `[24,26,28,28,28]` | §7.10.6 B7 · §7.10.9.2 · `policy.ts:2216`, `:2485`, and batch-3 law |
| 13 | batch-2 tail `30.417021 @ L50` · pre-R-008 tail `30.455319 @ L45` · zero-move `0.000000` | `policy.ts:2619–2620`, `:2312/:2315`, `:2631–2636` |
| 14 | `ACT_III_REGISTERED_IDS` declarator at `:2573–2576` (`:2572` is its doc-comment) | ARCH-006b §10 row 5; re-read at this base |
| 15 | released class non-empty in the `G`-family pool (`par 28: 556` LV-018 / pre-fix `529` LV-019) but the **`H` both-pair lattice is UNCENSUSED** | §7.10.9.2's census obligation |
| 16 | XOR device ruling, `G2-X`, C4 pacing `L51–L55`, comprehension T0–T4 / R1–R6 | §7.10.8, ADR-design-0010 |
| 17 | `F-GD014-1` + the register-wide PIN-LITERAL form law + item 167's two disclosed growing-alias instances (`policy.ts:2584`/`:2587`, label `:2631–2632`) | §7.10.10 · `docs/project-status.md` items 167–168 |
| 18 | U-002 (item 153): the XOR debut held to the second half; the opener's ladder ratified as published | `docs/project-status.md:1893` |

**What this evidence is NOT.** There is **no playtest datum** for any seam, plateau or close in Act III: the
star-era instrument reads **`NOT TESTABLE, n = 0`** (§7.3.3). Therefore every *felt* claim in §7.10.13 is a
**labelled hypothesis with a falsification route**, and the parts I could not derive in arithmetic are
published as **hypotheses**, not as findings. My own preference for a sawtooth close over a plateau-close is
**not** evidence (AGENTS §7) — which is why the plateau was **checked** (it is invisible in play, on the
published `GD-OQ1`/§7.1 fact) instead of **asserted** either way.

## Result

- **The level lane is unblocked on batch 4 with a rule, not a search**: `[26, 28, 28, 28, 28]`, derived and
  self-checked three times against landed law.
- **The lane also learns, before its census, that the close has no non-flat fallback** — so a census that
  cannot populate `{26, 28}` routes to GD instead of quietly producing a flat batch.
- **The register grows to eight instances**, and instance 8 adds a **general property** rather than one more
  bound: *when `Δpar` is fixed by law and `3·(B_hi − B_lo) < |Δpar|`, a seam's bound — and its sign — are
  comparator-free*, so a lane can publish a bound **before either board exists**.
- **The act-close residual is closed for Act III** by one comparison with a named outcome, and the *shape*
  question is answered with its arithmetic (`1.3125` span, 4.31 %, zero headroom cost) instead of with a
  preference.
- **Nothing moves that is not law.** No board, no byte, no `par`, no weight, no gate, no band, no star row,
  no registered row, no constant, no `src/**`, `scripts/**`, `tests/**`. The locked core loop is
  byte-identical; **no AGENTS §2 triad** is convened (ladder/relief/rank law is not the phase loop).
- **Two things are deliberately left open and named**: the `H` lattice's census outcome (no ceiling claim in
  either direction), and batch 3's realised multiset (the B7 conditional).

## Handoff

**(1) LV-020 (batch 3, standing five-rider scope) gains two duties from this ticket, both cheap.**
(a) **Print batch 3's REALISED multiset** in the census artifact — it is already computed for B2's
self-check and it is now **B7's second operand** (§7.10.11's conditional: the batch-4 ladder may not be
frozen before it is printed; equality ⇒ STOP-AND-ROUTE to GD). (b) Instance 7's fill-in stays inside its
corrected half `[−2.667021, −1.354521]` **and** inside B6's gating: if `par 28` cannot be populated, batch 3
must **STOP-AND-ROUTE**, because §7.10.13.3's rank duty and §7.3.2's carrier both assume the released class
is reachable — a flat `[24,26,26,26,26]` close for batch 3 is lawful only as a **named** outcome with the
instruments re-pointed.

**(2) LV-021 (batch 4) owes, in this order, all before any byte.** (i) the **B7 re-check** against LV-020's
printed realised multiset (multiset-inequality, write-nothing on equality); (ii) the **instance-8 fill-in**
inside `[−3.3125, −0.6875]` **and** inside `par 26`'s single half, with the `L55` comparator pinned as a
literal at registration (`F-GD015-1`) — *bound → fill-in → bytes*, git-datable, the register's fifth
fill-in-before-existence; (iii) the **rank comparison** `D_exec(L60)` vs `D_exec(L55)` **before the bytes**,
with the named-limitation line written if it inverts; (iv) **`G2-X` encoded before the census** (the
LV-019 `F-L46-1` precedent: a gate repaired after a census owes the identical command re-run), with the
membership-vs-`G2-X` divergence printed and `divergence = 0` on the XOR class ⇒ STOP-AND-ROUTE to GD;
(v) the pacing grades of §7.10.13.4 (`exempt` **with a measured reason, never `null`**, at `L56`; OFFERED at
`L57`; `required` + all-OFF UNSATISFIABLE + `G2-X` at `L58–L60`); (vi) the `H`-lattice census result
published **in both directions** — if it is empty the **B6 STOP** fires and nothing is written.

**(3) The R-009-era registration must re-pin, in one pass, the whole growing-alias class.** Item 167
disclosed **two** instances (`policy.ts:2584` / `:2587` — the act-tail aliases — and the self-cancelling
label `:2631–2632`, which must **never** be cited as evidence that the act maximum did not move), and
`F-GD014-1` named the principle (*a registered instance's left side is a **published number** and may not
move*). Batch 3's registration is the train where the hazard **fires**: `ACT_III_REGISTERED_TAIL_*` moves
off `L45`/`30.455319` the moment a `par 28` rung registers, which **re-points instance 6's alias**
(`_PREVIOUS_EXEC`, published `−4.212830`) and would silently restamp it. The remedy is §7.10.10's shape —
freeze each instance as `_PREVIOUS_EXEC_AT_REGISTRATION`, **or** assert `near(...)` against the published
value so drift fails **loudly** — and **instance 8's pin is written in that form from birth**, so the train
that writes instance 8 and the train that heals instance 6 are the **same** train. `src/core/solver/**` is
the level lane's file with Architect sign-off; **this ADR edits nothing there.**

**(4) Playtest Analyst — two labelled asks, thresholds frozen pre-cohort.** (a) The plateau close:
`M5/M6` and replay share across `L57→L60`, **split by whether the close inverted** (`L55 > L60`) — the
falsification route published in §7.10.13.3. (b) The device's second window: `M4/M5/M6` at `L58` vs `L57`
(the post-teaching plateau), extending §7.10.10's `L52` vs `L51` ask. Both read `NOT TESTABLE, n = 0` today.

**(5) Architect — nothing new is owed by this ticket**, and that is a claim, not an omission: instance 8
introduces no representation, no schema field, no validator rule and no reader; its one constant-hygiene
item (`F-GD015-1`) is the **already-signed** remedy shape of ADR-architecture-0006 §5/§17.4, applied to one
more instance. The §7.10.10 register-form law (pins for published values; aliases only over referents
**frozen by construction**) already covers it — this ADR adds the **instance**, not the rule.

**(6) Orchestrator approval.** This ADR is a **rider** to ADR-design-0009 and ADR-design-0010: it quotes and
extends them, edits neither body, and changes **no core rule** (AGENTS §2 is untouched — no phase-loop,
move, or solidity semantics is involved). Under AGENTS §4, the Game Designer authors design ADRs and the
Orchestrator approves; approval is requested for the **§7.3.2 rank rider** in particular, since it extends a
clause authored under ADR-design-0006 (**dated rider beside the body, body untouched**).