# ADR-architecture-0005 — Playthrough chain-row envelope **law** (general form + re-measurement cadence) and the 100-rung **split** ruling

- **Status:** Accepted — Architect ruling (task ARCH-005); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-20
- **Deciders:** Agent 2 (Technical Architect). Answers the 100-rung formulation booking that has stood since `docs/project-status.md` item 143 (`:1873`), was confirmed overdue at item 154 (`:1895`) and item 159 (`:1905`), and is the stated object of the ARCH-005 dispatch at item 160 (`:1907`). The design lane booked the same question in `docs/level-design.md` §7.10 (`:1191`–`:1194`, "Booked, not solved … BOOKED to the Architect at the Act IV juncture") and §7.10.6–§7.10.7 (`:1338`).
- **References:** `tests/e2e/playthrough.spec.ts` — the row and its whole derivation history: `:219`–`:230` (the QA-024 crossing, K = 23), `:233`–`:244` (the local inputs and the `4.40 ×` cloud run-rate), `:246`–`:256` (the derivation that shipped `639_000`, plus the `856_000` same-family face), `:257`–`:270` (the orchestrator decision), `:272`–`:283` (the pre-registered bound and the cloud-datum law), `:285`–`:305` (the 35- and 40-rung historical legs), `:307`–`:341` (the 45-rung re-measurement and re-derivation → the live `1_617_000`), `:342`–`:357` (the falsification chain), `:359`–`:372` (the level lane's forecast vs the measurement), `:374`–`:386` (the two pre-registered next bounds), `:395` (`test.setTimeout`), `:403`–`:427` (the row body: entry at L1, dialog-own-`Next` for every transition, `nextVisible === false` at the tail) · `src/levels/README.md` §7d `:1450`, §7e `:1649`, §7f `:1792` (the per-era pin dossiers and the R-007 pre-alert) · `docs/ai-native-pipeline.md` §8.22 `:1413`, §8.25 `:1478`, §8.27 `:1512`, §8.28 `:1534` (the registration-era pre-alerts) · `docs/level-difficulty.report.json` (`levels[].par`, 45 records) · `src/core/solver/policy.ts` (symbol-anchored, no line numbers — `policy.ts` lines move every era): `ACT_II_PAR_BAND` (declarator `export const ACT_II_PAR_BAND`), `ACT_III_PAR_BAND` (declarator `export const ACT_III_PAR_BAND`), `ACT_III_B2_PAR_MULTISET` (declarator `export const ACT_III_B2_PAR_MULTISET`) · `src/levels/candidates/l046.json`…`l050.json` (the L46–L50 shelf) · `docs/level-design.md` §7.2 `:547`–`:549` (the Act III/IV/V par bands), §7.6 `:866`, §7.6(e) `:881`–`:883`, §7.10 `:1191`–`:1194`, §7.10.6–7 `:1338` · `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md` `:240` · `playwright.config.ts` `:67`–`:70` · `.github/workflows/ci.yml` `:51`, `:67`–`:70`
- **Changes no rule, no code, no level, no test.** Docs-only. No `src/core/**`, no `src/game/**`, no `src/levels/**`, no `scripts/**`, no `tests/**` byte moves; the shipped constant stays `1_617_000` (`tests/e2e/playthrough.spec.ts:395`) until QA lands a measured 50-rung datum. This ADR only rules **what may be forecast, what must be measured, and where the single row ends**.

## Context

The e2e unlock chain is **one serial row** that walks every shipped rung in dataset order, entering at L1 and moving on only through the win dialog's own `Next` (`tests/e2e/playthrough.spec.ts:403`–`:419`); the walk is asserted never to leave the chain (`:422`–`:427`). Its harness budget is a hand-derived constant sitting in the row (`:395`), re-derived at each registration era from **that era's own fresh local measurement**, the booked `4.40 ×` cloud run-rate and the standing `1.5 ×` safety leg (`:326`–`:333`).

Five such constants have shipped, each falsified on the rung count it was derived for and each replaced by the next era's measurement (`:342`–`:357`):

| era | rungs (walks) | measured local total (s) | constant (ms) | source |
|---|---|---|---|---|
| QA-024 `39031050727` | 25 (23 walked before the cut) | 96.715 (route curve) | **639_000** | `:248`, `:254` |
| same round, refusal family ×5.9 | 25 | 96.715 | **856_000** (pre-registered, never used) | `:256` |
| R-005c | 35 (479 moves) | 183.718 (worse of 166.564 / 183.718) | **1_213_000** | `:290`, `:291` |
| R-006c | 40 (587 moves) | 211.602 (worse of 191.060 / 211.602) | **1_397_000** | `:302`, `:303` |
| R-007c | 45 (705 moves) | 244.875 (worse of 232.144 / 244.875) | **1_617_000** (live) | `:331`, `:337`–`:338` |

Two structural facts force a general law now rather than a sixth hand-derivation.

1. **Every era re-runs the same dance.** Each registration lengthens the walk and the level lane publishes a pre-alert forecast (the formula is the level lane's arithmetic; `tests/**` is off-lane for it), QA then measures, and the row is re-derived — five crossings in a row (`docs/project-status.md` items 143/146/152/154/157/159). Roughly ten further eras remain before the 100 mandate, so the process needs a law, not a ritual.
2. **The forecasts are systematically optimistic, and the reason is measured.** The lane's forecasts scale the previous era's local total by the **move ratio**; at 40 rungs it read `1_486_000` against a measured `1_397_000` (**+6.40 %**, `docs/ai-native-pipeline.md:1489`) and at 45 rungs `1_678_000` against `1_617_000` (**+3.78 %**, `tests/e2e/playthrough.spec.ts:363`–`:366`) — the "6.4 %→3.8 %" the dispatch records (`docs/project-status.md:1907`). The diagnosed cause is on disk: a move-linear scale "prices 705 moves as if cost were proportional to move count, while the per-rung fixed cost (open, first HUD read, dialog round trip) does not grow with the move count at all" (`:369`–`:371`). The law below encodes exactly that split.

## Ruling 1 — the general envelope **law**: `LOCAL_TOTAL(N) = c_move·M(N) + c_rung·N`, and the constant is always the *measurement*, never the fit

**LAW-1 (form).** With `M(N) = par(1) + … + par(N)` taken from the committed dataset (the sidecar's `levels[].par`, or the shipped `lNNN.json` bytes):

```
LOCAL_TOTAL(N) = c_move · M(N) + c_rung · N                [seconds, local bench]
envelope(N)    = ceil( SAFETY × CLOUD_RATE × LOCAL_TOTAL(N) ) × 1000   [ms]  ← point face (forecast)
trigger(N)     = ceil( SAFETY × CLOUD_RATE × (1 + ρ) × LOCAL_TOTAL(N) ) × 1000 [ms]  ← alarm face
```

Both faces are **forecasts off the fit** (the point face and the worst-case alarm face of the same fit). The number that *ships* is a third thing and is never a fit output: `ceil(SAFETY × CLOUD_RATE × measured_local(N)) × 1000`, where `measured_local(N)` is the era's own two-run carried worse sample.

- `SAFETY = 1.5` — the standing item-77(d) leg "fitted × safety ≥ 1.5", quoted verbatim in the row (`tests/e2e/playthrough.spec.ts:333`).
- `CLOUD_RATE = 4.40` — the **certified cloud datum** from QA-024 round `39031050727`, "≤ 360 / 81.783 = **4.40 × local**" (`:241`–`:242`, re-quoted `:329`–`:332`); it is a cloud run-rate, not a throttle rate, per the item-131/146 law "walk-class envelopes derive from CLOUD datums; a throttled-local green is necessary, not sufficient" (`:278`–`:283`).
- `c_move = 0.296754 s/move`, `c_rung = 0.909297 s/rung` — **fit outputs**, not authored constants.
- `ρ = 0.08` — the model-residue allowance on the **trigger face only** (see LAW-3).

**LAW-2 (the constants are a rolling fit output; nobody hand-edits them).** `(c_move, c_rung)` are the least-squares solution of `LOCAL_TOTAL = c_move·M + c_rung·N` over the **last four carried observations** (the worse-sample law of `:326`/`:339` supplies the carried value). At this tip the four are:

| N | `M(N)` | carried `LOCAL_TOTAL` (s) | source |
|---|---|---|---|
| 25 | 269 | 96.715 | `:248` |
| 35 | 479 | 183.718 | `:290` |
| 40 | 587 | 211.602 | `:302` |
| 45 | 705 | 244.875 | `:331` |

Least squares gives `c_move = 0.296754`, `c_rung = 0.909297`. When a fifth observation lands, the oldest drops out and the pair is re-solved — the constants are a *reading of the last four eras*, never a typed number. (Sums `M(25)=269 / M(35)=479 / M(40)=587 / M(45)=705` were re-summed from the sidecar's `levels[].par` for this ruling, not remembered.)

**LAW-3 (fit quality, and the domain edge).** Law point face vs the era's own measured local total: **+6.04 %** at 25, **−5.31 %** at 35, **−0.49 %** at 40, **+2.15 %** at 45 rungs. Leave-one-out (fit on three, predict the fourth) reads **−0.70 %** at 40, **+6.06 %** at 45, **−7.28 %** at 35, and **+27.36 %** at 25. The 25-rung miss is structural, not noise: on short routes the per-move cost is not constant across the chain, so the two-parameter split has no purchase there. **Domain: the law is asserted for `N ≥ 35`.** `ρ = 0.08` is the largest in-domain |LOO residual| (7.28 % at 35) rounded up, and it is applied to the **trigger** face only — so the alarm fires *before* the point face reaches the live constant.

**LAW-4 (the trigger is an alarm, not an editor).** A `trigger(N)` that exceeds the live constant is a **STOP-and-measure** order: the era owes a fresh two-run local measurement at its tip (LAW-2's carried worse sample), a re-derivation by LAW-1's *form* from that measurement, and a named constant in `tests/**`. **The law never edits a constant**, and no agent may raise the shipped number from `trigger()` or `envelope()` output — the arithmetic triggers the measurement; the measurement supplies the number. This is the QA-024 doctrine (`:272`–`:283`) restated as a general rule.

**Five-data-point validation.** Every published constant is an instance of LAW-1's *form* with its own era's local total, and each reproduces exactly:

| # | datum | N | local total (s) | `ceil(SAFETY × RATE × local)` | shipped constant | reproduces |
|---|---|---|---|---|---|---|
| 1 | QA-024 `39031050727` (4.40 family) | 25 | 96.715 (`:248`) | `ceil(1.5 × 4.40 × 96.715) = ceil(638.319)` = 639 | **639_000** (`:254`) | ✓ |
| 2 | same round, same-family 5.9 face | 25 | 96.715 (`:248`) | `ceil(1.5 × 5.9 × 96.715) = ceil(855.928)` = 856 | **856_000** (`:256`) | ✓ |
| 3 | R-005c | 35 | 183.718 (`:290`) | `ceil(1_212.539)` = 1 213 | **1_213_000** (`:291`) | ✓ |
| 4 | R-006c | 40 | 211.602 (`:302`) | `ceil(1_396.573)` = 1 397 | **1_397_000** (`:303`) | ✓ |
| 5 | R-007c | 45 | 244.875 (`:331`) | `ceil(1_616.175)` = 1 617 | **1_617_000** (`:338`) | ✓ |

Rows 1 and 2 are the *same* local datum under two cloud families, which is why the law carries `CLOUD_RATE` as a parameter rather than a constant of the formula. The fit constants of LAW-2 are validated separately, on the four `4.40`-family local totals (residues above) — the fit is a trend instrument; the constants are the product.

**What the law does not claim.** It does not predict the *next* constant (the next constant is the next measurement). It does not model per-era shape (an era whose pars jump hard will sit above the fit face and the trigger face will catch it). It does not replace the throttle arm (`:388`–`:394`), which stays necessary-not-sufficient.

## Ruling 2 — anchor re-measurement cadence (CAD-1 … CAD-5)

- **CAD-1 (arm is standing).** `trigger(N)` is recomputed at **every registration era** that lengthens the chain, from that era's `M(N)`. Recomputation is arithmetic on the sidecar, costs nothing, and is the only cadence obligation that is unconditional.
- **CAD-2 (anchor).** The anchor is **two plain local runs at the era tip, carried as the worse sample** — the standing law the row already states (`:316`–`:326`) and the only local datum any envelope may be derived from.
- **CAD-3 (measurement cadence may relax; the trigger may not).** Because the last two carried observations both sit inside `ρ` on the leave-one-out check (40 → −0.70 %, 45 → +6.06 %, both ≤ 8 %), the *measurement* cadence is relaxed from every-era to: **every other registration era (rungs a multiple of 10) plus every era that opens a new act.** The era immediately after a relaxation must be a multiple-of-10 era or an act-opening era, so the relaxation can never carry more than one unanchored era.
- **CAD-4 (reversion).** The cadence reverts to **every era** on any of: a red chain run; any LOO residual beyond `ρ`; any era opening a new act. Reversion is automatic, and re-earning the relaxed cadence requires two more in-`ρ` observations.
- **CAD-5 (no thinning).** No cadence, and no relaxation, may justify thinning the walk: entry only at a row's own first rung, every transition through the dialog's own `Next`, no `?level=` mid-chain hop, no skipped rung (`:422`–`:427`). A cadence that reduces measurement frequency is legitimate; a cadence that reduces *coverage* is a semantics change and needs the core-loop triad, not this ADR.

## Ruling 3 — the 100-rung design ruling: keep the single row to the threshold, split by era, and the split lands at the **L86–L90** era

**The threshold.** `X = 5_040_000 ms` = **84 min** = the **worst e2e job clock ever observed** ("an 84 m e2e job — the worst of this era's three 1.4 h-class days", `:221`; the three days are 52.2 m / 59.8 m / 84 m, `docs/project-status.md:1841`; the fast end is a 42.0 min day, item 142 `:1871`, and a 1.1 h round, item 149 `:1885`). `X` is a **demonstrated-class** line, not a platform line: the e2e job carries no `timeout-minutes` (measured: zero occurrences in the 100-line `.github/workflows/ci.yml`, job at `:51`), so the platform default is 360 min — but a row whose own harness envelope exceeds every job clock we have ever observed is asserting a capability with **no observation behind it**. Past `X` the honest remedy is therefore the **design** one (split), and a budget bump has to argue from something other than "the fit says so".

**What the published work faces say.** The lane's published `×100/45` work face reads `ceil(1.5 × 4.40 × 244.875 × 100/45) = 3_592_000 ms` (59.9 min, `:382`); the dispatch's "≈63 min at 100 rungs" is `2 × 1_901_000` = `3_802_000 ms` (63.4 min, the 50-rung forecast `1_901_000` at `docs/project-status.md:1905` doubled). Both are move/rung-linear extrapolations. **Both under-price the law by 1.27×–1.53×** (below), for exactly the LAW-1 reason: they carry no per-rung fixed term large enough.

**The band faces at 100 rungs.** `M(40) = 587` from the sidecar; Acts III/IV/V are 20 rungs each (`docs/level-design.md:547`–`:549`, bands III 20–28, IV 24–32, V 28–36). Holding every unregistered rung at its act band's floor / midpoint / ceiling:

| face | pars III/IV/V | `M(100)` | `LOCAL_TOTAL(100)` (s) | `envelope(100)` (ms) | min | vs the 3_592_000 work face | crossing of `X` |
|---|---|---|---|---|---|---|---|
| band-min | 20 / 24 / 28 | 2 027 | 692.450 | **4_571_000** | 76.2 | 1.27× | never |
| band-mid | 24 / 28 / 32 | 2 267 | 763.671 | **5_041_000** | 84.0 | 1.40× | at N = 100 (1 000 ms over — a knife-edge) |
| band-max | 28 / 32 / 36 | 2 507 | 834.892 | **5_511_000** | 91.8 | 1.53× | at N = 94 |

Band-max era tips (the ruling's operative face, because a split must survive the worst admissible pars):

| era | tip N | `envelope(tip)` (ms) | min | verdict |
|---|---|---|---|---|
| L81–L85 | 85 | 4_363_000 | 72.7 | under |
| **L86–L90** | 90 | **4_746_000** | **79.1** | **under — last single-row era** |
| L91–L95 | 95 | 5_128_000 | 85.5 | **over** |
| L96–L100 | 100 | 5_511_000 | 91.8 | over |

**RULING.** (1) **Keep the single row while its forecast stays under `X`.** At today's bands that is **L1 → L90**. (2) **The split lands at the L86–L90 era** — the last era whose tip stays under `X`; the boundary is between L90 and L91. (3) **Split by era, as contiguous era segments** (option (i)): on the 100-rung dataset the chain becomes **L1–L90, L91–L95, L96–L100** — one row per era from the boundary on. Each row enters at **its own first rung** (`?level=<era first>` — the same entry the row uses today at L1, `:403`), walks every rung of its era in order through the dialog's own `Next` with the existing per-transition assertions (`:412`–`:419`), and **ends by asserting the `Next` handover out of its era into the next era's first rung** (label + `moves 0` + start phase), so every `Next` transition in the whole chain is exercised exactly once per round and **no rung is unwalked**. Entry is an era *entry*; there is no mid-chain hop and no skipped rung inside a row.

**Rejected — option (ii), era-chain rows plus one full-chain smoke row.** It leaves every act-boundary transition unexercised on the per-push rounds (the smoke row is the rarely-run one, by construction) and duplicates era walks inside that row, inverting the cost/coverage ratio: worst coverage per wall clock, and the coverage it buys is precisely the coverage `§7.6(e)` already buys at milestones. The milestone-only full chain stays exactly where the design lane put it (`docs/level-design.md:881`–`:883`, `docs/decisions/design-0005-…md:240`).

**Two things this ruling must not be read as.** (a) It is **not** a CI speed-up: `workers: 1` / `fullyParallel: false` (`playwright.config.ts:67`–`:68`) means the split's rows telescope — `LOCAL_TOTAL(90) + ΔLOCAL(91–95) + ΔLOCAL(96–100) = LOCAL_TOTAL(100)` — so the model buys **no wall-clock relief at all** (and the extra boots make it, strictly, marginally worse); the relief is per-row *risk*, and the wall-clock lever remains `§7.6(c)`'s seeded stratification (that is QA's). (b) It is **not** frozen at L90: the rule is "split at the last era whose **real** tip stays under `X`", and `M(N)` reads the sidecar, so each era re-prices automatically; if Act III/IV/V land below the band-max face the boundary can move later (on band-mid alone the crossing is the final rung; on band-min it never comes). The L90 number is the *pre-registered worst-case* boundary, never a new typed threshold.

## Ruling 4 — seam-neutrality check: the law is **act-blind**, and the ruling lands inside §7.10's declared freedom

`docs/level-design.md` §7.10 states it is **"seam-walk-neutral"** — "no clause here reads a cross-act walk and every batch proves on its own bytes (§7.5), so a later choice between per-act seam walks and one `L1→L100` chain lands without re-opening Act III" (`:1192`–`:1194`; restated for §7.10.6–7 at `:1338`). Check against this ADR, clause by clause:

- **The law's inputs are act-blind.** Its only dataset input is `M(N) = Σ par(1..N)` — a plain prefix sum over committed level files, which carry no act label. Its constants `SAFETY`, `CLOUD_RATE`, `c_move`, `c_rung`, `ρ` are global scalars. **No term is keyed on act, seam, era or boundary**, so a seam-crossing rung is priced identically to an interior rung. This is the F-L41-3 / F-L41-4 trap ("an act-blind LABEL with act-aware VALUE", `docs/ai-native-pipeline.md:1492`) avoided by construction: nothing in the law *has* an act-aware value to mislabel.
- **The law does not read the act band constants.** `ACT_II_PAR_BAND` (`src/core/solver/policy.ts`, declarator `export const ACT_II_PAR_BAND`) and `ACT_III_PAR_BAND` (`src/core/solver/policy.ts`, declarator `export const ACT_III_PAR_BAND`) are *not* inputs. They appear in this ADR only as the source of Ruling 3's band faces, which is a projection of unregistered rungs, not a clause of the law.
- **The split choice is the one §7.10 left open**, and it is exercised without re-opening Act III: the era segments are contiguous and every batch keeps proving on its own bytes, so nothing §7.10 legislated is contradicted and no Act III clause is read.
- **Corollary:** because the law is act-blind, an act-opening era gets **no** special envelope term — its protection is CAD-3's "plus every era that opens a new act" measurement rule, i.e. a cadence obligation, not a pricing exception.

## CI-budget risk (stated, not hidden)

1. **This ticket costs zero.** Docs-only; no `tests/**`, no `src/**`, no workflow file touched. The frozen CI budget is untouched today.
2. **The next era's row will be red before it is measured.** `trigger(50)` = `ceil(1.5 × 4.40 × 1.08 × 291.474) = 2_078_000 ms` against the live `1_617_000` (1.29×), point face `1_924_000` (1.19×) — above the standing 600 s orchestrator-decision line that stopped QA-024 (`:257`–`:260`). **R-008c owes the STOP-and-measure**, not a bigger number: measure at the 50-rung tip (the L46–L50 shelf pars are 22/24/26/26/26 — `src/levels/candidates/l046.json`…`l050.json`, matching `ACT_III_B2_PAR_MULTISET` at `src/core/solver/policy.ts`, declarator `export const ACT_III_B2_PAR_MULTISET` — so `M(50) = 829`), then re-derive by LAW-1's form. The lane's own forecast for that era is `1_901_000` (`docs/project-status.md:1905`); the law's point face sits 1.2 % above it.
3. **A red chain row is not a cheap event.** `retries: 0` (`playwright.config.ts:70`) and the cloud retry policy v2 that **removed** retries (`.github/workflows/ci.yml:67`–`:70`) mean one red row costs a named red ticket **plus a full job re-run**. The split therefore trades one large envelope for three smaller ones and **three independent red opportunities** — a real, non-zero cost that only pays if the envelopes are honest. That is the argument for LAW-4 (`ρ` on the trigger face) rather than a hand-set margin.
4. **The dominant row after the split is the first segment.** On the band-max face L1–L90 is priced at 4_746_000 ms (79.1 min) — inside the demonstrated 84 min class, but with little room; L91–L95 and L96–L100 are ~383_000 ms each. The 100-rung era's first order of business is therefore to *measure L1–L90*, and to treat a reading near `X` as another STOP rather than a rounding opportunity.

## Consequences / follow-ups

- **`docs/architecture.md` §16 is the normative text**; this ADR is its decision record.
- **QA** (owner of `tests/**`): the law changes **no byte today**. The 50-rung era owes the CAD-2 anchor measurement and a re-derivation by LAW-1's form (R-008c), and the shipped constant stays `1_617_000` until that datum lands. The 100-rung split is pre-registered, not scheduled: it executes in the era where the real-par forecast crosses `X`.
- **QA**: when the split is implemented, each segment row must keep the existing per-transition assertions and add the tip handover assertion (label + `moves 0` + start phase) so "every `Next` transition exercised exactly once per round" is a test property, not a claim.
- **Level AI + Solver** (owner of `scripts/**`, the sidecar and the pre-alerts): the per-era envelope pre-alert may now cite this ADR instead of re-deriving the form; the pre-alert arithmetic itself does not change.
- **Citation pointers recorded during this ruling (both measured, so a future reader does not chase them):** `docs/ai-native-pipeline.md` has **no §7d/§7e** — the pin dossiers are `src/levels/README.md` §7d `:1450`, §7e `:1649`, §7f `:1792`; and that file's **§8.29 does not exist** (the highest is §8.28 `:1534`), so a pre-alert for the 50-rung era has no numbering home yet and is the level lane's to allocate.
- **Nothing else moves:** no core rule, no `GameState`, no schema, no level, no `par`, no band, no gate, no registry, no PINS, no sidecar cell, no workflow, no shipped constant.