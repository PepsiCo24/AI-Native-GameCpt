# LV-017 — the authoring side of Act II batch 4 (`l036`…`l040`, **shelf candidates**, unregistered)

Proposal and census record for the **closing** batch of Act II. The proving side is
`scripts/prove-candidate-l3640.transcript.md`; nothing here may be read as a proof — every `par`,
`D_exec`, `B`, coverage and gate number below is printed by the shipped solver path
(`@/core/solver/*`, `@/core/rules`), and the proof file re-measures them from the landed bytes.

**Law-before-bytes, git-dated, four deep.** The device, the finale role and the selection rule were
published in the tool's header **before any census ran and before any byte existed** (`b9dac54`,
"LV-017 step 0", docstring alone); the batch-4 machinery that makes that rule executable followed
(`5626e48`); then **two instrument findings were published before the lines that fix them moved**
(`1eea030` F-L36-1 docstring-only, `469e04e` its one-line repair; `c45e3e5` F-L36-2 docstring-only,
`03d0d4d` its label repair). This dossier publishes the **census** and the **§7.3.1 relief label**
(both **before** `--write`); the bytes land in the commit that follows. Every ordering is checkable
in `git log -p` and none of it can be back-dated.

```
STEP 1 — the frame's capacity, and the par-24 obligation at the NEW frame
  a) npx tsx scripts/author-l21.ts --stage=roomcap --cx=1 --h=7 --maxsize=4              (7×7, CX=1)
  b) npx tsx scripts/author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 \
       --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24
     control: the identical command at 7×6 (--h omitted), i.e. batch 3's frame
     re-run after F-L36-2's label repair: the identical command again (29.0 s → 26.6 s)
STEP 2 — the batch's own pool over the full act band, on its own frame
  c) npx tsx scripts/author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 \
       --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24   (145.5 s)
     coverage probe (falsifies rule 3's absence clause at 6× the judged tuples):
  d) the identical command at --budget=120000                                          (763.6 s)
     control for (c): the identical command at 7×6                                     (22.6 s)
STEP 3 — the selection (dry run, then --write)
  e) npx tsx scripts/author-l21.ts --stage=s --batch=4 --parmin=16 --parmax=24 --accepts=<c's dump>
  f) the same with --write                                                             (lands the five)
```

Every run above passes `--accepts=` explicitly, so none of them can clobber the batch-2 dump the
tool would otherwise default to. `--write` appears **only** in (f).

---

## 1. STEP 1 — the frame capacity, and the par-24 probe at the new frame

**(a) `7×7`, `CX=1` — the frame is not empty, and that is the first thing the finale needed to
measure.** LV-015 measured the only other `7×7` frame for this device (`CX=2`) as **EMPTY**
(F-L31-1, 0 judged of 0). Capacity census at `7×7`, `CX=1` (35 far tiles), connected tile sets of
size 1..4, sealability = `roomFrom`:

```
parity(0) arrival A: 46 sealed room(s) [size 1:35 · size 3:3 · size 4:8] · 11 multi-tile · max pairwise-disjoint 8
parity(0) arrival B: 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] ·  3 multi-tile · max pairwise-disjoint 6
parity(1) arrival A: 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] ·  3 multi-tile · max pairwise-disjoint 6
parity(1) arrival B: 46 sealed room(s) [size 1:35 · size 3:3 · size 4:8] · 11 multi-tile · max pairwise-disjoint 8
control 7×6, CX=1: 40 / 27 / 27 / 40 · 10 / 3 / 3 / 10 multi-tile · max pairwise-disjoint 7 / 6 / 6 / 7
```

Two readings matter. The **5-door chain needs five pairwise-disjoint sealed rooms** — the frame
offers a maximum disjoint set of **8** where `7×6` offered **7**, so the ceiling device is
*admissible* on this frame (capacity, not existence — existence is what (b)/(c) measure). And the
`7×6` control reproduces the batch-3 frame's own capacity row-for-row, which is what makes the
cross-frame comparison in §2 a comparison.

**(b) the par-24 probe at `7×7` — NON-EMPTY.** §7.8 item 2's named obligation was discharged at
L35 (`28.339426`), so this probe is a **reading**, not a target: *does the class reach the act's own
band-ceiling par on the new frame?* Post-fix (i.e. after F-L36-1's repair; the pre-fix reading is
kept beside it in §2.3):

```
census: 293 accept(s) of 8000 judged candidate(s) over 168 (R2,R3,R4) group(s) in 29.0 s ·
  devices walked 4/348 · 40-group cap hit on 3 device(s) · global budget 8000 HIT
  (the run is a deterministic PREFIX: the accept count is a floor)
rejection histogram:  par-out-of-band: 5040 · unsolvable: 2655 · g5-identity-broken: 12
  par 24: 293 accept(s), D_exec 28.263158 … 28.455319 (B 1.4211 … 1.4851)   [coverage 49/49, chain n/n]
```

---

## 2. TWO INSTRUMENT FINDINGS, both published before their fixes moved, both with closed receipts

### 2.1 F-L36-1 — the generator's cut floor was raised by the registered Act II rungs

`measureCut()` excluded `BLOCK_L1619_IDS` + **`ACT_II_B1_IDS` only**, so with `L26`–`L35` in the root
the cut basis became `[1…15, 26…35]` and `cut.floor` became **28.339426** (= `L35`) while the banner
labelled it *"D_exec max over the L1–L15 basis"*. The `escalation` gate is `dexec > cut.floor`, so
with the measured collapse `D_exec = par + 3·B` and `B ≤ 1.6875` it silently meant **`par ≥ 24`** —
the accept pool was truncated **by filter**, and nothing about `7×7` was being measured at all.
`scripts/prove-candidate.ts`'s `measureCut()` already read `ACT_II_REGISTERED_IDS` and carries an
R-005a note describing *exactly this failure*: **R-005a fixed the prover and not the generator.**

### 2.2 The receipts, which are what make it batch-fatal rather than cosmetic

Same commands, before and after the one-line repair (`469e04e`); `devices walked`, `groups` and
every non-escalation bucket are **identical**, so the difference is the cut and nothing else:

| run | before the repair | after the repair |
|---|---|---|
| `7×7`, band `16–24`, budget 20000 | **234** accepts, **all `par 24`** · par-out 9989 · unsolvable 6643 · **escalation 1857** · esc+g5 1232 · g5 45 | **2091** accepts, `par 18–24` · par-out 9989 · unsolvable 6643 · **zero escalation** · g5 1277 |
| `7×7`, band `16–24`, budget 120000 | **549** accepts, **all `par 24`** · par-out 58378 · unsolvable 41158 · **esc+g5 10991** · **escalation 8371** · g5 553 · 54/348 devices | **8920** accepts, `par 18–24` · par-out 58378 · unsolvable 41158 · **zero escalation** · g5 11544 · 54/348 devices |
| `7×6`, band `16–24`, budget 20000 (batch 3's own frame, only the id changed) | **0** accepts · par-out 702 · unsolvable 18080 · **escalation 498** · esc+g5 720 · in-band refused 1218 | **498** accepts, `par 17–24` · par-out 702 · unsolvable 18080 · **zero escalation** · g5 720 · in-band refused 720 |
| `7×7`, `par 24` probe, budget 8000 | **185** accepts of 8000 | **293** accepts of 8000 |

**Closures, each exact** — arithmetic, not argument:

- `7×7`/120000: `8371` escalation-only refusals `+ 549` already-accepted `= 8920` accepts;
  `10991 + 553 = 11544` g5 refusals — **unchanged**. The repair released **exactly** the boards
  no other gate ever refused.
- `7×7`/20000: `1857 + 234 = 2091` accepts, and `1232 + 45 = 1277` g5 refusals — unchanged.
- `par 24` probe/8000: `108 + 185 = 293` accepts, and `6 + 6 = 12` g5 refusals — unchanged.
- `7×6`/20000: `498 + 0 = 498` accepts — and that `498` is **batch 3's own LV-015 pool
  digit-for-digit** (par `17:12 · 18:30 · 19:50 · 20:50 · 21:98 · 22:78 · 23:90 · 24:90`; par 19
  `23.204167`, par 22 `26.050000 … 26.339426`, par 24 `28.058108 … 28.339426`). The two histograms
  differ in **exactly one row** (`escalation`). A one-to-one A/B on the same boards, not a
  resemblance.
- Every run of this ticket also satisfies `accepts + par-out-of-band + unsolvable +
  g5-identity-broken = judged` (see §2.3 item 6).

**The counter-reading, and why it loses.** One could call the truncation *correct* on the ground
that a shelf rung must sit above the registered root max. It is not: that relation is an **id**
relation, and the machine pin says so — `tests/solver/l16-l20-candidates.test.ts` asserts
`expect(id, …).toBeGreaterThan(rootMax)` over the shelf's **file names**, and its sibling row
compares `maxShipped` to the *pinned count*. Batch 3's own registered `L31` sits at `23.204167`,
**below** the then-registered root max `27.604651`. A `D_exec` floor at the act tail would be a new
obligation invented by an instrument accident.

**Revert path:** restoring `ACT_II_B1_IDS` restores `28.339426` and re-truncates the pool to
`par 24`. Both directions are re-measured (the table above), never remembered.

### 2.3 F-L36-2 — the par census line's label claimed coverage it never measured

The three G-lattice stages printed *"par census over every judged candidate (in band and out): …"*,
and the parenthesis is **false**: `parHist` is incremented **only inside the out-of-band branch**, so
an **in-band** tuple is counted by *"accepts by par"* (accepted) or by the **in-band refusal list**
(refused). Two receipts from the pages this dossier already quotes, no source reading needed:

1. `post-par24.txt` runs at band `[24, 24]`, so its own in-band par is `24`: the histogram reads
   `18:24 19:48 20:102 21:200 22:222 23:347 25:361 …` — every par **around** the band, and `24`
   **omitted** — while the same run's accept table reads `par 24: 293 accept(s)`.
2. `post-deep.txt` runs at band `16–24`: the histogram **starts at `25`** = `ACT_II_PAR_CEILING + 1`,
   while the same run's accept table lists `par 18 … par 24`.

**Why it is load-bearing for this batch.** This is the line rule 3's *empty-pool* clause is read off.
As labelled it licenses *"no judged candidate had `par 16` or `par 17`"* — a claim about the whole
enumerated class that the histogram never measures. The supported sentence is narrower, and it is the
one §4 publishes: **the accept pool's minimum in-band par is `18`** (`par 18: 84 accept(s)` in the
120000 census; `par 18: 39` at the published budget).

**Blast radius, pre-registered before the repair and re-measured after it:** no count, accept, gate,
band or cut moved. The identical `--parmin=24 --parmax=24 --budget=8000` census was re-run after the
label repair and returned `293 accept(s) of 8000`, histogram `5040 / 2655 / 12`, in-band refusals
`12` — every counter equal. A strict diff of the two logs (timing and dump path normalised) shows
**one** differing line: the label. The two accept dumps are `353694` bytes each and
`sha256`-**identical** (`568b471a84a0eee4a89b0f3265ea9c99a4307b80fcffa40934b3c7e7f2b4432c`).

**The accounting identity that actually says "every judged tuple is accounted for"** —
`accepts + par-out-of-band + unsolvable + g5-identity-broken = judged`, closing **exactly** on every
run of this ticket: 120000 census `8920 + 58378 + 41158 + 11544 = 120000`; published budget
`2091 + 9989 + 6643 + 1277 = 20000`; par-24 probe `293 + 5040 + 2655 + 12 = 8000`; `7×6` control
`498 + 702 + 18080 + 720 = 20000`.

**Not licensed by either finding:** promoting a label or a cut into a class claim. "This device
cannot open below `par 18`" is a claim about the device class, and a **prefix** census of one frame's
enumeration cannot make it (rule 10; item 114's law). No batch-2/3 transcript is re-stamped either:
those are print records of the instrument as it was.

---

## 3. STEP 2 — the batch's own pool, and the probe that falsifies rule 3's absence clause

**(c) the published-budget census (`7×7`, band `16–24`, budget 20000, post-fix).** This run is the
**selection instrument** — the one the header's STEP 3 (e)/(f) commands name:

```
stage G 4-pocket sub-lattice: 348 leak-free landing device(s) · par band [16, 24] · D_exec band [19.75, 29.06]
census: 2091 accept(s) of 20000 judged candidate(s) over 417 (R2,R3,R4) group(s) in 145.5 s ·
  devices walked 10/348 · 40-group cap hit on 9 device(s) · global budget 20000 HIT  → accept count is a FLOOR
rejection histogram:  par-out-of-band: 9989 · unsolvable: 6643 · g5-identity-broken: 1277 · escalation: 0
in-band candidates refused by a gate: 1277   (all g5-identity-broken; example below)
accepts by par:
  par 18:  39 · par 19:  88 · par 20: 171 · par 21: 333 · par 22: 387 · par 23: 561 · par 24: 512
  par 18: D_exec 22.301282 … 22.401064 (B 1.4338 … 1.4670)   par 19: 23.230263 … 23.400428 (B 1.4101 … 1.4668)
  par 20: D_exec 24.252174 … 24.420213 (B 1.4174 … 1.4734)   par 21: 25.171053 … 25.419700 (B 1.3904 … 1.4732)
  par 22: D_exec 26.200000 … 26.436170 (B 1.4000 … 1.4787)   par 23: 27.186957 … 27.419700 (B 1.3957 … 1.4732)
  par 24: D_exec 28.185897 … 28.455319 (B 1.3953 … 1.4851)
```

`par 16` and `par 17` are **absent from this pool**, and the `in-band candidates refused by a gate`
list is printed (`1277`, every one `g5-identity-broken` — the census identity `par =
min_i(d(start→s_i) + 1 + d(s_i→goal))` needs every seal tile adjacent to the free far region,
`ai-native-pipeline` §8.12; measured examples carry 4 seal tiles with 4 not adjacent, and the
identity's *value* — the world with the landing pocket's device removed — solving below `par`).

**(d) the coverage probe — the falsification of "`par 16` empty", at 6× the judged tuples.** A
prefix census can only ever *under*-report a pool, so the absence clause was attacked directly: the
identical command at `--budget=120000`, which walks **54/348** devices instead of 10:

```
census: 8920 accept(s) of 120000 judged candidate(s) over 2444 (R2,R3,R4) group(s) in 763.6 s ·
  devices walked 54/348 · 40-group cap hit on 53 device(s) · global budget 120000 HIT  → FLOOR
rejection histogram:  par-out-of-band: 58378 · unsolvable: 41158 · g5-identity-broken: 11544 · escalation: 0
accepts by par (coverage 49/49 and chain n/n on every one):
  par 18:   84 · par 19:  304 · par 20:  752 · par 21: 1144 · par 22: 1824 · par 23: 2262 · par 24: 2550
  par 18: D_exec 22.229792 … 22.401064   par 19: 23.151316 … 23.400428   par 20: 24.180435 … 24.420213
  par 21: D_exec 25.151316 … 25.419700   par 22: 26.167391 … 26.436170   par 23: 27.046053 … 27.419700
  par 24: D_exec 28.076087 … 28.455319
par histogram (OUT-OF-BAND members only, see F-L36-2): 25:4925 26:4674 27:4386 … 64:6   (nothing below 25)
upstream: R3 sets not sealable 10823 (column-leak 3684 · mixed-entry-phase 7139) · R4 sets not sealable 67367
  (column-leak 31037 · mixed-entry-phase 36330) · SHAPE FILTER #1 (R3 adjacent R2) 0 · #2 (R4 adjacent R2/R3) 0
```

**Verdict: `par 16` and `par 17` are ABSENT from the accept pool at 6× the judged tuples and 5.4×
the devices walked**, while every par `18`–`24` is populated and every within-par **maximum** is
**identical** to the published-budget pool's. Both runs are prefixes, so both counts are floors —
labelled as floors, and the identity of §2.3 closes exactly on both.

**The published instrument is still the published-budget census (c).** The probe's role is the
absence clause, not selection, and the honest consequence is printed rather than smoothed: at the
deeper coverage a **within-par minimum** can only fall, and it does — the four rungs the selection
would re-read fall by `0.071490` (par 18) · `0.071739` (par 20) · `0.019565` (par 22) · `0.109810`
(par 24), and in the unselected pool by `0.078947` (par 19) · `0.019737` (par 21) · `0.140904`
(par 23) — while every within-par **maximum** is identical in both pools (`par 18` `22.401064`,
`par 20` `24.420213`, `par 22` `26.436170`, `par 24` `28.455319`) and `par 24`'s maximum — the only
rung the act's law reads (§7.3.2) — is `28.455319` in **both**. A batch that reported only the
deeper pool's interior rungs would be reporting the half it prefers; the rule was published against
(c) before either run existed, and (d) is quoted beside it.

**(c)'s control — the `7×6` frame, batch 3's own, only the batch id changed.** `498` accepts of
20000 judged in `22.6 s`, `devices walked 114/260`, budget HIT, **zero escalation**, par support
`17–24` — batch 3's LV-015 pool digit-for-digit (§2.2). The control exists to prove the **frame** is
what separates batch 4 from batch 3, not the device class and not the machinery.

---

## 4. THE SELECTION — the derived ladder, and what it prints beside it

Dry run (e), reading (c)'s dump; the write (f) is byte-identical in its selection inputs:

```
read 2091 accept(s)
selection filter: 2091 inside the bands · 0 refused by the §6.1.4 clone guard · 31 key(s) already taken
selection: batch 4 P2-exact ladder — anchored at the act's ceiling 24, stepping down by §6.1.1's P2
  minimum 2: [16, 18, 20, 22, 24]  (5 rungs × step 2 spans 8 = the band's own width → UNIQUE)
selection: ABSENT (empty pool, never substituted): [16]
selection: repeat #1 — par 24 used again (repeats run down from the act's ceiling, §7.3.2)
selection: par multiset [18, 20, 22, 24, 24] · Δpar≥2 steps 3/4 · min D_exec 22.301282 · spread 6.154037
selection: 1 par combo(s) tried · rising-D_exec clause NOT in force · 0 dropped by it · 0 dropped by the clone clause
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a shipped board
```

| rung | par | `D_exec` | `B` | coverage | chain (press→cross) | `Δpar` | `ΔD_exec` | band membership (§7.9 derived-exact) |
|---|---|---|---|---|---|---|---|---|
| L36 | 18 | 22.301282 | 1.4338 | 49/49 | 36/36 | — | — | par ∈ [16,24] ✓ · `D_exec` ∈ [19.75, 29.0625] ✓ |
| L37 | 20 | 24.252174 | 1.4174 | 49/49 | 72/72 | 2 | +1.950892 | ✓ · ✓ |
| L38 | 22 | 26.200000 | 1.4000 | 49/49 | 48/48 | 2 | +1.947826 | ✓ · ✓ |
| L39 | 24 | 28.185897 | 1.3953 | 49/49 | 162/162 | 2 | +1.985897 | ✓ · ✓ |
| L40 | 24 | **28.455319** | 1.4851 | 49/49 | 30/30 | 0 | +0.269422 | ✓ · ✓ |

`D_exec = par + 3·B` holds on all five to the printed digits (36 = 18 + 3·1.4338 …), and `T ≡ R ≡ 0`
with the all-OFF world are **prover** gates on the bytes, not census readings.

**Departures, printed rather than hidden.** (1) `par 16` is **ABSENT, never substituted** (rule 3);
the missing rung is filled by repeating the ladder's **own highest supported par, descending** —
`24` — and the repeat states its reason. (2) `Δpar ≥ 2` holds on **3 of 4** steps; the closing pair
is `24 → 24`, which P2's window cannot cover when the ladder has 5 members and the band has 4
supported pars (§7.2's batch size is the constraint, and the ladder is derived, not re-picked to look
smooth). (3) The **closing rung takes the within-par MAXIMUM** `28.455319` (published departure, rule
4; the par's minimum is `28.185897`) so §7.3.2's maximum rides as late as the family permits.
(4) The ladder's interior rungs rise strictly — `+1.950892 · +1.947826 · +1.985897` — with **no dip**;
the final step is small (`+0.269422`) because both closing rungs share `par 24` and the rule puts the
par's **maximum** there deliberately.

**`act-close` READING (§7.3.2 / §7.8 items 1, 6) — no refusal branch exists here, by rule 7.** The
obligation was discharged at L35, so batch 4 owes no peak and the tool has no `act-close` refusal
branch — a branch invented now would be a gate created to be passed:

```
batch's measured MAXIMUM: L40 · D_exec 28.455319 (par 24, B 1.4851, chain 30/30)
  vs the registered Act II tail 28.339426 (L35, ACT_II_R005A_REGISTERED_TAIL_EXEC)  → Δ +0.115893
  vs the registered batch-1 peak 27.604651 (ACT_II_B1_REGISTERED_PEAK_EXEC)          → Δ +0.850668
  vs Act I's measured peak 24.729412 (ACT_I_REGISTERED_PEAK_EXEC)                    → Δ +3.725907
headroom to Act II's derived `D_exec` ceiling 29.0625 (printed 29.06; §7.9)          → 0.607181
last rung carries it: the pre-published rule put the maximum on the closing rung — HOLDING
```

A shelf file moves **no** constant: this is a reading on unauthored bytes, and only a registration
ticket can put these five numbers into the dataset's table.

**Anti-mirror (§7.8 item 4, in spirit — a THIRD mirror is forbidden).** Registered Act II pars (batch
1 ∪ batches 2–3, read from the law module) = `{17, 18, 19, 20, 21, 22, 23, 24}`. This batch's multiset
is `[18, 20, 22, 24, 24]`, so **4** of its distinct pars coincide with a registered one — printed so
it is never implied away, and **not** a mirror: the multiset is **derived** from the band endpoints
and P2's minimum (rule 2), the *third* instance of that derivation style (after `4, 6, 8, 10`), and
no par was chosen to avoid or to match a registered rung. The coincidence is a property of a
9-integer band, not of a copied ladder — and where the mirror clause really bites (a ladder
*transcribed* from a registered one), this batch is clear by construction.

**Clone guard (§6.1.4, seal-inclusive key).** **0** collisions against the **31 taken geometry keys**
of the **35 registered root files** (31 distinct keys over 35 files — the census prints the key list,
`l005, l002, l008, l007, l009 … l035`), and **5 distinct keys over 5 rungs**. Five rungs, five
distinct boards; no shipped board is re-stamped.

---

## 5. THE RELIEF LABEL, PRE-PUBLISHED BEFORE `--write` (§7.8 item 5 · §7.3.1 form)

Rule 9 predicted it before the run (`b9dac54`): *"L36's `D_exec` will sit below the registered tail
on any plausible ladder, so §7.8 item 5 fires."* The census measured `−6.038144`, so the seam takes
a label **published in this dossier, before any byte** — a relief with no pre-published label is not
registrable (§7.3.1).

> **RELIEF LABEL — `batch-seam` seam L35→L36 · `ΔD_exec = −6.038144` · band `[19.75, 29.0625]`**
> (printed `[19.75, 29.06]`; §7.9's notation law). Interior relaxation at a `ΔM = 0` boundary, on the
> execution axis only — **never a dip, never a claim of lower felt difficulty, and never the thing
> that satisfies a clause.** §6 does not fire: no mechanic is introduced (`ΔM = 0`) — the fenced
> **4-pocket / forced 5-press** chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`) is the
> **same device class** batch 3 registered, read on §7.4's **other frame** (`7×7`, `CX = 1`).
> Decomposed so it cannot be read as a designed rhythm: **`Δpar = −6`** (L35 `24` → L36 `18`, the
> dominant term), **`ΔB = −0.0127147` ⇒ `3·ΔB = −0.038144`** (from `B` `1.4337607` vs `1.4464753`;
> the printed forms `1.4338` / `1.4465` / `−0.0127` are display roundings, §7.9), and their sum
> **`ΔD_exec = −6.038144`** (`28.339426 → 22.301282`) — i.e. **the entire seam is the par term plus a
> 0.6 % correction**, and `D_exec` is blind to comprehension (`M`/`T` are not in it). `act-close`
> rides on the act's measured **maximum**, which this batch reports at L40 `28.455319` — never on
> this relief.
> **The relief is largely an artifact of the measurement design, and says so:** batch 4's ladder is
> **derived** from the band endpoints and P2 (not mirrored), so its opening rung is `par 18` where
> L35 sat at the act ceiling `par 24`, and the ladder *cannot* open higher without inventing a par
> the derivation forbids. **How the seam reads** — mastery rest or deflation — is therefore a
> **labelled Playtest hypothesis** (§7.3.3), not a result.

Within-batch seams are **not** reliefs: `+1.950892 · +1.947826 · +1.985897 · +0.269422` all **rise**,
so the batch contains no drop at all. `L35 → L36` is the batch's **single** drop, the **fourth
instance** of §7.3.1's pre-published form and its **third `batch-seam`** (form instance 1 `act-open`
L20→L21 `−3.148017` registered by R-004a; instances 2 and 3 `batch-seam` L25→L26 `−6.044410` and
L30→L31 `−4.362098`).

---

## 6. The refusal census, the counters, and the deferral — published beside the accepts

| # | run | judged | accepts | par-out-of-band | unsolvable | g5-identity-broken | escalation | devices walked | cap hits | budget |
|---|---|---|---|---|---|---|---|---|---|---|
| c | `7×7` band 16–24 (selection) | 20000 | **2091** (FLOOR) | 9989 | 6643 | 1277 | **0** | 10/348 | 9 | HIT |
| d | `7×7` band 16–24 (probe) | 120000 | **8920** (FLOOR) | 58378 | 41158 | 11544 | **0** | 54/348 | 53 | HIT |
| c′ | `7×6` band 16–24 (control) | 20000 | **498** (FLOOR) | 702 | 18080 | 720 | **0** | 114/260 | 10 | HIT |
| b | `7×7` par-24 probe | 8000 | **293** (FLOOR) | 5040 | 2655 | 12 | **0** | 4/348 | 3 | HIT |
| b-pre | `7×7` par-24 probe, **pre-fix** | 8000 | 185 | 5040 | 2655 | 6 | 108 (+6 esc+g5) | 4/348 | 3 | HIT |

**Every count above is a FLOOR, and every counter is printed with the count** (§7.5 item 1: the band
is a filter, the caps are truncations). No run in this ticket walked its device lattice to the end;
`348` devices exist at `7×7` and `260` at `7×6`. The published-budget run's `10/348` is a *small*
prefix and is labelled as one everywhere it appears — the `120000` probe is what raises the walked
fraction, and it is a floor too.

**The `--pocketsize ≥ 11` probe stays DEFERRED** (rule 10, unchanged): `≤ 10` was closed by
measurement (`scripts/author-l20-p10.transcript.md` §10 — `17 476` leak-free members, histogram
`3:34 4:204 6:510 7:2040 9:14688`), **`≥ 11` remains unmeasured**, and **no ceiling wording is
published in either direction** — neither *"9 is the largest pocket"* nor *"20 is the device
ceiling"*. Nothing in this dossier quantifies a maximum for any device; the only numbers that are
bounded are the bands and the frame, both read from the law module.

**What the census does not do, stated as scope:** the enumerated class is one frame (`7×7`, `CX=1`),
one portal pair, `--pocketsize=4`, `--qmax=4`, the seal-shape filters, `40 (R2,R3,R4)` groups/device
and `400` tuples/group. Nothing outside it is claimed in either direction.

---

## 7. What lands next, and what proves it

Commit *C* (the next one) writes `l036.json` … `l040.json` from (c)'s dump via (f) — the bytes are the
tool's own output, and `scripts/prove-candidate-l3640.transcript.md` re-measures every number in §4
from those bytes with `--family=g --ladder=36,37,38,39,40 --dir=src/levels/candidates`, the 13
named family-`g` controls, and a falsification probe sized to this ladder. `src/levels/candidates/README.md`
is restated **in that same commit**, so that no document describes a file before it exists.

The shelf stays **invisible to every shipped-set census** (`npm run levels` walks the root only,
non-recursively), so this batch moves **no** registered row, **no** sidecar count and **no**
`BLOCK_L1619_*` constant. Registration is a separate ticket with its own proof obligations.