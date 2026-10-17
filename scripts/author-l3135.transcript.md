# LV-015 — the authoring side of Act II batch 3 (`l031`…`l035`, **shelf candidates**, unregistered)

Proposal and census record for the third batch. The proving side is
`scripts/prove-candidate-l3135.transcript.md`; nothing here may be read as a proof — every `par`,
`D_exec`, `B` and gate below is printed by the shipped solver path (`@/core/solver/*`,
`@/core/rules`), and the proof file re-measures them from the landed bytes.

**Law-before-bytes, git-dated.** The selection rule and the device were published in the tool's
header *before* any census ran and before any byte was written (commit `3f460b6`, "LV-015 step 0",
whose diff is the docstring alone). This dossier publishes the **census** and the **§7.3.1 relief
label** (commit *B*) before `--write` lands anything (commit *C*). Both orderings are checkable in
`git log -p`; neither can be back-dated.

```
STEP 1 — the par-24 obligation (§7.8 item 3), both fenced families
  a) npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --pocketsize=4 \
       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24          (8.8 s)
  b) npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=2 --pocketsize=4 \
       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24          (0.9 s)
  c) npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=2 --h=7 \
       --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=16 --parmax=24 (4.3 s)
  d) npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=1 --pocketsize=4 \
       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24          (11.5 s)
  e) npx tsx scripts/author-l21.ts --stage=roomcap --cx=2 --maxsize=4                 (frame capacity)
STEP 2 — the batch's own pool (full act band, the 4-pocket device on its own frame)
  f) npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=1 --pocketsize=4 \
       --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24         (33.7 s)
  g) npx tsx scripts/author-l21.ts --stage=s --batch=3 --parmin=16 --parmax=24 \
       --accepts=<f's dump>                                                           (dry run)
  h) npx tsx scripts/author-l21.ts --stage=s --batch=3 --parmin=16 --parmax=24 --write \
       --accepts=<f's dump>                                                           (lands the five)
```

## 1. STEP 1 — THE PAR-24 CENSUS (the named UNMEASURED obligation)

The obligation is §7.8 item 3: *"LV-014's accept pool by par … **tops at `par 23`**, so **`par 24`
is in-band but unmeasured** in the `G` lattice"*. It is now measured, in **both** fenced families.

**(a) the 3-pocket fenced family (batch 2's device), band `[24, 24]` — NON-EMPTY, and EXACT.**

```
census: 130 accept(s) of 2640 judged candidate(s) over 264 (R2,R3) pair(s) in 8.8 s ·
  devices walked 440/440 · 40-pair cap hit on 0 device(s) · global budget 8000 not reached
rejection histogram:  par-out-of-band: 1910 · unsolvable: 528 · g5-identity-broken: 72
  par 24: 130 accept(s), D_exec 28.560241 … 28.771084 (B 1.5201 … 1.5904)   [coverage 42/42, chain n/n]
in-band candidates refused by a gate: 72
```

**202 tuples sit at `par 24`** (130 accepts + 72 `g5-identity-broken`), i.e. exactly the `24:202`
row the batch-2 run printed as *out of band*. No cap was hit and the budget was not reached, so for
**this** enumerated class the count is exact — the refusal ledger is complete, not a floor. Nothing
outside the enumerated class (7 × 6 · `--cx=2` · `--pocketsize=4` · `--qmax=4` · the two published
shape filters) is claimed, in either direction.

`D_exec ∈ [28.560241, 28.771084] ⊂ [27.7500, 29.0625]` (the §7.8 item 2 window) and strictly above
the registered peak `27.604651` by **≥ +0.955590**: the par-24 rung of §7.8 item 2 exists in this
family, measured.

**(b) the 4-pocket family (batch 3's own device axis) on the batch-2 frame — EMPTY, measured.**

```
stage G 4-pocket sub-lattice (4-pocket, 4 pockets): 440 leak-free landing device(s) ·
  R2, R3, R4 ≤ 4 tile(s) · par band [24, 24]
census: 0 accept(s) of 0 judged candidate(s) over 0 (R2,R3,R4) group(s) in 0.9 s ·
  devices walked 440/440 · 40-group cap hit on 0 device(s) · global budget 8000 not reached
upstream skips: … 16280 sealed R4 set(s) · SHAPE FILTER #2 (an R4 tile adjacent to an R2 or R3
  tile) 0 (0 expected by the seal law) · no goal candidate 264 · s2 tile on the goal's seal 0
```

**(c) the same device on the published `7 × 7` frame (`--h=7`) — EMPTY too.**

```
census: 0 accept(s) of 0 judged candidate(s) over 0 (R2,R3,R4) group(s) in 4.3 s ·
  devices walked 598/598 · global budget 8000 not reached
upstream skips: … 111436 sealed R4 set(s) · SHAPE FILTER #2 0 (0 by the seal law) ·
  no goal candidate 13104 · s2 tile on the goal's seal 0
```

So on the frames batch 1/2 used, the 4-pocket device is **empty by arithmetic, not by a capped
search**: a 5-door device needs four sealed rooms *plus* the goal's own seal *plus* a free-banded
`s2` tile, and the frame's measured capacity ceiling is right there — measured beside it, never
argued from it:

**(e) the frame's room capacity at `--cx=2` (`--stage=roomcap --maxsize=4`).**

```
class parity(0) arrival A (landing 4,0): 33 sealed room(s) [size 1:24 · size 3:3 · size 4:6] · 9 multi-tile
  maximum pairwise-disjoint set (tiles ∪ door tiles): 6 room(s)
class parity(0) arrival B (landing 4,0): 20 sealed room(s) [size 1:18 · size 3:1 · size 4:1] · 2 multi-tile
  maximum pairwise-disjoint set (tiles ∪ door tiles): 4 room(s)
class parity(1) arrival A (landing 3,0): 20 sealed room(s) · 2 multi-tile
  maximum pairwise-disjoint set (tiles ∪ door tiles): 4 room(s)
class parity(1) arrival B (landing 3,0): 33 sealed room(s) · 9 multi-tile
  maximum pairwise-disjoint set (tiles ∪ door tiles): 6 room(s)
```

The 4-pocket device lives in **one** of those classes and needs four rooms whose boundaries are
doors *plus* the goal's whole seal; at `CX = 2` the far region is 4 × 6 = 24 tiles and the measured
result is 0 judged candidates in every class combination tried (`(b)`), at both `--pocketsize=4 /
--qmax=4` and the tighter `--pocketsize=3 / --qmax=2` probe (0 judged). The frame, not the filter,
is what closes it.

**(d) the first frame that is NOT closed: `CX = 1` (7 × 6, far region 5 × 6 = 30 tiles) —
NON-EMPTY, and reported as a PREFIX.**

```
census: 69 accept(s) of 8000 judged candidate(s) over 477 (R2,R3,R4) group(s) in 11.5 s ·
  devices walked 62/260 · 40-group cap hit on 7 device(s) · global budget 8000 HIT
rejection histogram:  par-out-of-band: 1372
  par 24: 69 accept(s), D_exec 28.058108 … 28.339426 (B 1.3527 … 1.4465)
in-band candidates refused by a gate: 71   (all g5-identity-broken)
```

**The pair-cap/budget honesty (_named, not smoothed_):** `62/260` devices walked, the `40`-group cap
hit on `7` device(s), and the global budget **HIT** at 8000 judged tuples — so **69 is a FLOOR**
over a deterministic prefix, and the refusal census is complete only *within* that prefix. The
`par` census prints the out-of-band members too (`15:12 · 25:73 · … · 42:8`), because the band is a
filter and never a truncation.

> **PREDICTED (enumeration SIZE only, lawful under `docs/architecture.md` §15.5 — no result inherits
> from it):** at `--paircap=40` a device contributes at most 40 groups, so the class's group bound
> is `260 devices × 40 = 10 400` groups. The prefix walked **477** groups and **1152** in the wider
> run (`f`). The *accept* count is never predicted, and no measured row above inherits this number.

### STEP 1 VERDICT

**`par 24` accepts:** 3-pocket family **130** (exact, no cap hit) · 4-pocket @ `CX=2` **0 of 0
judged** (empty) · 4-pocket @ `7 × 7` **0 of 0 judged** (empty) · 4-pocket @ `CX=1` **69** (a
**floor**, budget hit). **No accept collides with the 25 shipped + 5 shelf files** (the selection
filter reads §6.1.4 over the stricter seal-inclusive key; `0 refused by the clone guard` of 498
accepts). **The par-24 accept pool is therefore NON-EMPTY ⇒ the STOP branch (STEP 1b) does not fire
and no C-path decision is needed.** The published fallback `27.746988` (C path with its own ADR)
stays **unused**, unselected, and undecided — it is the Game Designer's, not this lane's.

`--pocketsize ≥ 11` is **deferred**, as dispatched: `≤ 10` was closed by measurement in
`scripts/author-l20-p10.transcript.md`; **`≥ 11` remains unmeasured**, and no ceiling wording is
published in either direction.

## 2. STEP 2 — the batch's own pool, and the own par set it supports

**(f) the full act band `[16, 24]` on the batch's own frame (`CX = 1`), budget 20 000.**

```
census: 498 accept(s) of 20000 judged candidate(s) over 1152 (R2,R3,R4) group(s) in 33.7 s ·
  devices walked 114/260 · 40-group cap hit on 10 device(s) · global budget 20000 HIT
rejection histogram:  g5-identity-broken: 720        (in-band gate refusals: 720)
par census over every judged candidate (in band and out):
  15:12 25:102 26:112 27:72 28:80 29:36 30:36 31:8 32:24 33:4 34:32 35:16 36:40 37:28 38:36 39:24 40:24 41:8 42:8
accepts by par:
  par 17: 12 accept(s), D_exec 21.212435 … 21.282383 (B 1.4041 … 1.4275)
  par 18: 30 accept(s), D_exec 22.171622 … 22.325130 (B 1.3905 … 1.4417)
  par 19: 50 accept(s), D_exec 23.204167 … 23.290155 (B 1.4014 … 1.4301)
  par 20: 50 accept(s), D_exec 24.147297 … 24.325130 (B 1.3824 … 1.4417)
  par 21: 98 accept(s), D_exec 25.088083 … 25.331593 (B 1.3627 … 1.4439)
  par 22: 78 accept(s), D_exec 26.050000 … 26.339426 (B 1.3500 … 1.4465)
  par 23: 90 accept(s), D_exec 27.088083 … 27.331593 (B 1.3627 … 1.4439)
  par 24: 90 accept(s), D_exec 28.058108 … 28.339426 (B 1.3527 … 1.4465)
```

Again a **PREFIX** (`114/260` devices, `10` group-cap hits, budget HIT at 20 000 judged), so every
count above is a **floor** for this enumerated class and nothing outside it is claimed. Note the
family's own `B` band reads **1.3500 … 1.4465** here — inside the measured band `[1.2500, 1.6875]`,
and a *lower* centre than the 2-/3-pocket families, i.e. the deeper chain lengthens `par` rather
than the `B` term.

**The own par set, executed as the published derivation (never as a search):**

```
selection: batch 3 OWN par set (anti-mirror, §7.8 item 4) — in-band pars batch 1's registered ladder
  does not use: [16, 19, 22, 24] (derived: Act II band 16..24 minus ACT_II_B1_LADDER=[17, 18, 20, 21, 23]) ·
  supported by this census's pool: [19, 22, 24] · ABSENT (empty pool, never substituted): [16]
selection: repeat #1 — par 24 used again (the supported set holds 3 of the 5 rungs §7.2 asks for;
  repeats run down from the act's ceiling, §7.3.2)
selection: repeat #2 — par 22 used again …
selection: batch 3 par multiset [19, 22, 22, 24, 24]
```

**`par 16` produced no accept in the prefix and is therefore ABSENT — it is not substituted, and no
par of batch 1/2 (`17/18/20/21/23`) appears anywhere in the multiset.** The two repeats are the
published, deterministic consequence of five rungs over three supported pars; both are printed with
their reason. **0 rungs share a par with the registered batch-1 ladder** (the anti-mirror check the
tool prints), so this batch has **no equal-par comparator on purpose** — that is the clause, not an
omission.

## 3. THE SELECTION, and the `act-close` reading (§7.3.2 / §7.8 items 1–2)

```
selection filter: 408 accept(s) inside the bands · 0 refused by the §6.1.4 clone guard · 408 usable ·
  26 key(s) already taken
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a shipped board
selection: pars [19, 22, 22, 24, 24] · Δpar≥2 steps 2/4 · min D_exec 23.204167 · spread 5.135259

  L31 par=19 D_exec=23.204167 B=1.4014 coverage=42/42 chain=30/30   Δpar=n/a  ΔD_exec=n/a
  L32 par=22 D_exec=26.050000 B=1.3500 coverage=42/42 chain=6/6     Δpar=3    ΔD_exec=2.845833
  L33 par=22 D_exec=26.069191 B=1.3564 coverage=42/42 chain=30/30   Δpar=0    ΔD_exec=0.019191
  L34 par=24 D_exec=28.126943 B=1.3756 coverage=42/42 chain=12/12   Δpar=2    ΔD_exec=2.057752
  L35 par=24 D_exec=28.339426 B=1.4465 coverage=42/42 chain=160/160 Δpar=0    ΔD_exec=0.212483
```

Every departure from batch 1/2's within-par tie-break, printed (a filter is never silent):

```
  par 22: 2 lower-D_exec row(s) refused by the rung-key-wide distinct clause → took 26.069191
  par 24: 12 lower-D_exec row(s) refused by the rung-key-wide distinct clause → took 28.126943
  par 24 (L35): the closing rung took the within-par MAXIMUM D_exec 28.339426 (published departure,
    header rule 4 — §7.3.2 asks the act's maximum to be carried late); the par's minimum is 28.058108
```

**The two clauses, read as numbers on this ladder:**

- **`act-close` (§7.3.2 / §7.8 item 1):** the batch's measured maximum is **L35 `D_exec` 28.339426 >
  `27.604651`** → **Δ +0.734775, STRICTLY ABOVE, carried by the batch's LAST rung** (the tail also
  rises internally: 28.126943 → 28.339426, +0.212483). The batch is inside the §7.8 item 2 derived
  window `[27.7500, 29.0625]` and clears it by **+0.589426** over the window's floor.
- **`act-peak` (§7.3):** L35 `28.339426` vs Act I's measured peak `24.729412` → **Δ +3.610014**.
  Nothing registered moves: both are *shelf* measurements.
- **The equal-par pair (`L32`/`L33`, `L34`/`L35`) is an instrument fact, not a relief:** each pair's
  second member rises (+0.019191 / +0.212483), so **no `ΔM = 0` drop exists inside the batch** and no
  interior label is owed for them. The single drop in this dossier is the seam below.

## 4. THE RELIEF LABEL, PRE-PUBLISHED BEFORE `--write` (§7.8 item 5, §7.3.1 form)

L31 (`D_exec` 23.204167) sits below shelf-L30 (`27.566265`), so §7.8 item 5 fires: the seam is a
`ΔM = 0` interior relaxation and its label is published **here, before the batch is authored**.
Decomposition, so the label cannot be read as a designed rhythm: **Δpar = 19 − 23 = −4** and
**3·ΔB = 3·(1.4014 − 1.5221) = −0.362098** → **ΔD_exec = −4.362098**.

> **RELIEF LABEL — `batch-seam` seam L30→L31 · `ΔD_exec = −4.362098` · band `[19.75, 29.06]`.**
> This is an **interior relaxation at a `ΔM = 0` boundary, on the execution axis only — never a dip,
> and never a claim of lower felt difficulty.** §6's dip law does **not** fire: no mechanic is
> introduced, so the seam is §7.3 interior freedom and nothing else. It **discharges no clause and
> satisfies none**: the `act-close` clause rides on the batch's **measured maximum** (L35
> `28.339426`), never on a relief. It asserts nothing about the felt half — `D_exec` is **blind to
> comprehension** (`M`/`T` are not in it) — so any claim about how the seam *reads* to a player is a
> **labelled Playtest hypothesis** (§7.3.3), never an asserted ease. **The relief is an artifact of
> two published instruments, and it says so:** (i) batch 3's par set is **not** chosen for rhythm but
> **derived** from §7.8 item 4's anti-mirror clause (the in-band pars batch 1's registered ladder does
> not use), which is why the opening rung sits at `par 19` rather than near L30's `par 23`; and (ii)
> the deeper 5-press device measures a **lower** `B` centre than the 2-/3-pocket families
> (`1.3500…1.4465`), which contributes `−0.362098` of the drop. The batch's own tail (L34→L35,
> `+0.212483`) rises, and its measured maximum is the act's new shelf maximum.

The Game Designer's §7.3.3 ask remains the only instrument that can read the seam's felt half; it
still reads **NOT TESTABLE (n = 0)**, and nothing here claims otherwise.

## 5. What was written (commit *C*)

`--write` landed five files, each `par`-stamped by the solver (`analyse`), ids assigned in ladder
order (`BATCH_FIRST_ID + i`), nothing auto-repaired (ADR-0004), and **only** in batch 3's own slots
(`l031`–`l035`; the writer refuses any id outside them):

| file | par | `D_exec` | `B` | chain | coverage |
|---|---|---|---|---|---|
| `l031.json` | 19 | 23.204167 | 1.4014 | 30/30 | 42/42 |
| `l032.json` | 22 | 26.050000 | 1.3500 | 6/6 | 42/42 |
| `l033.json` | 22 | 26.069191 | 1.3564 | 30/30 | 42/42 |
| `l034.json` | 24 | 28.126943 | 1.3756 | 12/12 | 42/42 |
| `l035.json` | 24 | 28.339426 | 1.4465 | 160/160 | 42/42 |

Every number above is re-measured from those bytes in `scripts/prove-candidate-l3135.transcript.md`;
the five files are **unregistered**, so no shipped-set census, registry, `EXPECTED_LEVEL_COUNT` or
sidecar sees them.