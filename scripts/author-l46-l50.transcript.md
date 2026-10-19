# LV-019 · Act III batch 2 (`L46–L50`) — census record, the F-L46-1 repair, and the instance-6 fill-in

Proposal and census record for the **second** batch of Act III. This file is the instrument's own
reading, published **before** the five boards exist: the rule and the census commands were published in
`scripts/author-l21.ts`'s LV-019 header **before any census ran and before any board byte** (commit
`166089d`, `175` added / `0` removed / `0` non-comment — docstring alone), the F-L46-1 finding was
published **before the line that fixes it moved** (commit `029bed9`, `86` added / `0` removed / `0`
non-comment), and the §7.10.7 **instance-6 value is filled in by the commit that carries this file** —
the five shelf boards land in the commit **that follows**, so *["bound published → value filled in →
bytes landed"]* is git-provable in exactly the order (and by exactly the method) instance 5's was.

**Law this pass executes, cited and never re-derived:** `docs/level-design.md` §7.10.6 (B1–B7, the
interior-batch rule) + §7.10.7 (the batch-seam relief register, instance 6) + §7.3.1 items 1–6 +
§6.2.3 + §7.3.2 (the act-close carrier, which is `L51–L60`'s, **not** this batch's) +
`docs/decisions/design-0009-act-iii-interior-batch-and-batch-seam-relief.md` (ADR, GD-013) + GD-013's
provenance commit `1d6c90f` (published pre-census, `22:39:26`) merged as `64e79a9`.

**Sacred principle restated for this batch:** the ladder was **applied** (B1–B7 read from the law
module), never re-derived; the falsification test was **published before the census** (header, clause
(ii)); nothing was repaired in a board — a gate that refuses writes nothing.

---

## 0. The order of proofs, as commits

| # | what | commit | content |
|---|---|---|---|
| 0 | the rule + the census commands + the pre-registered falsification test + the instance-6 procedure | `166089d` | `scripts/author-l21.ts` docstring only (175/0/0) |
| 1 | **F-L46-1** — the instrument fault, published before the fix byte | `029bed9` | docstring only (86/0/0) |
| 2 | the fix + this census record + the instance-6 **fill-in** | *(this commit)* | `scripts/author-l21.ts`, `src/core/solver/policy.ts`, this file |
| 3 | the five bytes | *(next commit)* | `src/levels/candidates/l046…l050.json` + `src/levels/candidates/README.md` + the proof transcript |

`166089d`'s and `029bed9`'s diffs are checkable as *non-code* by `git show --stat` and by counting
non-comment lines; the fill-in precedes the bytes by construction (a `--write` selection cannot run
before the constant it verifies exists — the verification line reads the law module).

---

## 1. STEP 1 — the frame's capacity at this batch's own frame (a re-measurement, not an inheritance)

```
$ npx tsx scripts/author-l21.ts --stage=roomcap --act=3 --batch=6 --cx=1 --h=7 --maxsize=4      (exit 0)
room-capacity census at 7×7, CX=1 (35 far tile(s)) · connected tile sets of size 1..4 · sealability = roomFrom (single-phase boundary, no column leak, connected)

class parity(0) arrival A (landing representative 2,0): 46 sealed room(s) [size 1:35 · size 3:3 · size 4:8] of which 11 are multi-tile (size ≥ 2 — a walk-sealed room the chain needs)
  maximum pairwise-disjoint set (tiles ∪ door tiles): 8 room(s)
    [2,0]←[2,1 3,0]
    [5,0]←[4,0 5,1 6,0]
    [3,2]←[2,2 3,1 3,3 4,2]
    [6,2]←[5,2 6,1 6,3]
    [2,4]←[2,3 2,5 3,4]
    [5,4]←[4,4 5,3 5,5 6,4]
    [3,6]←[2,6 3,5 4,6]
    [6,6]←[5,6 6,5]

class parity(0) arrival B (landing representative 2,0): 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] of which 3 are multi-tile …  maximum pairwise-disjoint set: 6 room(s)
class parity(1) arrival A (landing representative 3,0): 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] of which 3 are multi-tile …  maximum pairwise-disjoint set: 6 room(s)
class parity(1) arrival B (landing representative 3,0): 46 sealed room(s) [size 1:35 · size 3:3 · size 4:8] of which 11 are multi-tile …  maximum pairwise-disjoint set: 8 room(s)
```

**Read as a bound, not as comfort.** The device needs **5** walk-sealed rooms (the landing pocket `P` +
`R2` + `R3` + `R4` + the goal's own seal) out of a **maximum pairwise-disjoint set of 8** (favourable
classes) and needs **4** multi-tile rooms out of **11**. The frame is therefore **not** the constraint
this batch is fighting, and that matters below: when the pool came back truncated, the frame had already
been measured as adequate — the cause had to be the *filter*, and it was (F-L46-1). This receipt is
**also byte-identical to the LV-018 run's** except for the banner and the `CUT` lines (see §4), which is
the expected shape: `--stage=roomcap` measures the frame, and the frame did not change.

---

## 2. The pre-registered falsification test — what it says, and what the census did with it

Published in `scripts/author-l21.ts`'s LV-019 header **before any number was known** (B1's clause (ii)
of §7.10.6 — *"keeps every value of the act's derived window in the act's par vocabulary"*), with its
own STOP-AND-ROUTE:

> **TEST.** The tie-break holds iff the census supports the anchor it chooses, i.e. iff `par 22` has a
> non-empty admissible pool on this frame. **FALSIFICATION CONDITION:** if `par 22`'s pool is **empty**
> — so B1's anchor cannot be populated — **while** an alternative tie-break member's window can
> (e.g. `24` non-empty), then clause (ii) has been contradicted by measurement … The correct response is
> **STOP-AND-ROUTE to GD with the falsification named** — **not** a silent switch to B6's descending-fill
> ladder, and **not** a re-pick of the anchor by this lane.

This lane additionally pre-registered the degenerate leg: **`22` and `24` both empty ⇒ `Δpar = 0`, the
label is void ⇒ STOP**.

**Result, on the repaired instrument (§5):** `par 22` has **373** admissible accepts
(`D_exec 26.200000 … 26.436170`) and `par 24` has **483** (`28.185897 … 28.455319`). Clause (ii) is
**NOT falsified**; B1's anchor has a home on this frame, at this device, at this budget; **no STOP fires
and no B6 fallback is used** (B4's fill was nevertheless *executed and printed*, §7, because the rule
says it is executed and the batch is not allowed to look as if it needed it).

**And the test was made to fire against a broken instrument first, on purpose.** The pre-fix census
(§3) *appeared* to satisfy both legs — `par 22` and `par 24` empty. That reading was published, its
cause was published *before the fix*, and the test was then re-run with the **byte-identical command**.
Both readings are in this file (§5). A batch that reports only the census taken after the instrument was
repaired is reporting the half it likes.

---

## 3. F-L46-1 — the generator's cut basis had silently become Act III's own tail

### 3.1 The pre-fix census, verbatim (identical command to the post-fix one, §5)

```
$ npx tsx scripts/author-l21.ts --stage=g --act=3 --batch=6 --pockets=4 --cx=1 --h=7 \
    --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=20 --parmax=28 \
    --accepts=/tmp/lv019/pre-fix-accepts.json                       (exit 0, 146.12 s user / 2:22.88 total)

… CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = 30.455319 · Act I measured peak (ids 1–20) = 24.729412 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 41, 42, 43, 44, 45]
CUT divergence receipt (F-L36-1): the FROZEN L1–L15 floor 30.455319 equals the pre-fix floor 30.455319 — the two bases coincide, which is expected while no Act II rung above batch 1 is registered

census: 1138 accept(s) of 20000 judged candidate(s) over 417 (R2,R3,R4) group(s) in 142.4 s · devices walked 10/348 · 40-group cap hit on 9 device(s) · global budget 20000 HIT (the run is a deterministic PREFIX: the accept count is a floor, the refusal census is complete only within the prefix)
rejection histogram:
  par-out-of-band: 7794
  unsolvable: 6643
  escalation: 3063
  escalation+g5-identity-broken: 1032
  derived-two-room-door: 219
census accounting identity (F-L36-2 / F-L41-2 — every refusal is counted, so the census can close): accepts 1138 + refuses 18862 [derived-two-room-door 219 · escalation 3063 · escalation+g5-identity-broken 1032 · g5-identity-broken 111 · par-out-of-band 7794 · unsolvable 6643] = 20000 vs judged 20000 — CLOSES exactly
accepts by par:
  par 27: 609 accept(s), D_exec 31.129450 … 31.429336 (B 1.3765 … 1.4764)
  par 28: 529 accept(s), D_exec 32.157895 … 32.448936 (B 1.3860 … 1.4830)
in-band candidates refused by a gate: 4206
```

### 3.2 What was wrong, and the label that said so

The header line prints `D_exec max over the L1–L15 basis = 30.455319` and, **on the same line**,
`basis ids [… 41, 42, 43, 44, 45]`. The label named fifteen ids; the measurement named twenty. The
`measureCut()` exclusion list carried `BLOCK_L1619_IDS` + `ACT_II_REGISTERED_IDS` (L21–L40) — **R-007
registered L41–L45 and the list was never extended for Act III**, so the basis included Act III's *own*
registered tail and `cut.floor` became `30.455319` (= `L45`). The `escalation` gate is
`dexec > ctx.cut.floor`, so it silently meant *"`D_exec` > the registered Act III tail"*. Fifth
occurrence of one mechanism: R-003c/R-003d → R-004a → R-005a → **F-L36-1** → this.

### 3.3 The arithmetic, and why the truncation was total rather than approximate

`D_exec = par + 3·B` with `B ≤ 1.6875`, so `D_exec > 30.455319` needs `par > 30.455319 − 5.0625 =
25.392819` **at best**. Stronger than that, the recorded pools (§6) have maxima
`par 24: … 28.455319` and `par 26: … 30.455319` — **exactly** the registered tails `L40`/`L45` — and the
gate is **strict** (`>`), so every `par 24` and every `par 26` member is refused **to its last member**.
The measured cut is therefore clean: `par 21 … 26` vanish and `par 27`/`par 28` survive.

### 3.4 The one-to-one A/B, from the record — not an argument

`scripts/author-l41-l45.transcript.md` §8 records the **identical** command for batch 5 (`--batch=5` the
only difference; the F-L41-2-repaired arm): **`4201` accept(s)**, ledger
`derived-two-room-door 219 · g5-identity-broken 1143 · par-out-of-band 7794 · unsolvable 6643`, and by-par
rows `par 20: 169 · 21: 323 · 22: 373 · 23: 531 · 24: 483 · 25: 619 · 26: 565 · 27: 609 · 28: 529`.
The pre-fix reading here is that pool **truncated by the `escalation` gate**:

```
4201 − 3063 = 1138   exactly (3063 = the gate's own refusal count in the pre-fix ledger)
par 27: 609 · par 28: 529 with the SAME D_exec ranges, to the digit
```

### 3.5 It was not an Act III-only breakage

At the same frame the **Act II** path printed the same basis, so its `escalation` gate demanded
`D_exec > 30.455319` while the same invocation printed its own band ceiling `29.0625`
(`ACT_II_EXEC_BAND[1]`). The two are **jointly unsatisfiable by arithmetic alone**: pre-fix, *every* Act
II authoring census at this frame necessarily returned `0 accept(s)`, whatever the frame's capacity was.
No run was needed to see it — it is on the first two lines of any Act II invocation.

### 3.6 The fix, and its teeth

- `measureCut()` now excludes `ACT_III_B1_IDS` **in addition to** `ACT_II_REGISTERED_IDS`;
- the printed clause is **derived from the constants** (`CUT_BASIS_CLAUSE` composes
  `BLOCK_L1619_IDS`, `ACT_II_REGISTERED_IDS`, `ACT_III_B1_IDS`), so it cannot name a basis the
  measurement is not taking — the F-L36-1/F-L46-1 shape (`label ⊃ measurement`) is closed *by
  construction*, not by attention;
- a **second tooth** is added in the one direction a derived list can still get wrong: the run checks
  that every excluded id is **present in the root**, and prints
  `the clause's exclusion list is measured against the root: 30 excluded id(s), all present` (a
  `MISMATCH — absent from the root: […]` reading would mean the clause over-claims an exclusion).

Blast radius, stated as a bound: the `escalation` gate and **two printed lines**. Revert path: dropping
`ACT_III_B1_IDS` restores `30.455319` and re-truncates the census — both directions are in this file.

---

## 4. The blast radius, measured as a diff (three arms)

`--stage=roomcap` prints the whole `CUT` block before its stage output, so it is an exact A/B of the
instrument. Pre-fix and post-fix, identical commands, **`diff` output as the receipt**:

```
$ diff prefix-roomcap-a3b6.txt postfix-roomcap-a3b6.txt                 (act=3 --batch=6)
1c1   the CUT line:      "… D_exec max over the L1–L15 basis = 30.455319 … basis ids [1…15, 41…45]"
                      →  "… D_exec max over L1–L15 with the L16–L20 block [16…20] and the registered
                          blocks [21…45] excluded = 14.969697 · … 30 excluded id(s), all present …
                          basis ids [1 … 15]"
4c4   the divergence receipt: floor 14.969697 vs the pre-fix basis's 30.455319 (Δ 15.485622) — the
      pre-fix list let the registered blocks raise the floor …

$ diff prefix-roomcap-a2.txt postfix-roomcap-a2.txt                     (act=2, batch 1 — the ACT II arm)
1c1, 3c3   the same two lines, nothing else

$ diff prefix-roomcap-a3b6.txt postfix-roomcap-a3b6.txt | wc -l  →  8   (4 changed lines, both arms)
```

**Reading.** Every other line — the room enumeration, the parity classes, the pairwise-disjoint sets —
is **byte-identical**, in both acts. The Act II arm is the one that matters for the *shared path*
question: `--act=2` runs the same `measureCut()`, and its `CUT` block moves for the same reason and in
the same two lines, while its stage output does not move at all. The floor it reports is now
**`14.969697`** — the frozen `L1–L15` value the Act II batches were authored against (LV-014/LV-015/
LV-017 transcripts), i.e. the Act II path is **restored** to its recorded basis, not re-baselined.

---

## 5. STEP 2, post-fix — the census (verbatim), and the pre-fix/post-fix table

```
$ npx tsx scripts/author-l21.ts --stage=g --act=3 --batch=6 --pockets=4 --cx=1 --h=7 \
    --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=20 --parmax=28 \
    --accepts=/tmp/lv019/post-fix-accepts.json                       (exit 0, 145.63 s user / 2:22.38 total)
```

```
author-l21 (G lattice, Act II batch 6 — ACT III BATCH 2 (L46–L50): §7.10.6's B1–B7 interior-batch rule applied (GD-013), the proven 4-pocket/5-door/5-press class on 7×7 @ CX=1) — CUT re-measured from the shipped set: D_exec max over L1–L15 with the L16–L20 block [16, 17, 18, 19, 20] and the registered blocks [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45] excluded = 14.969697 · the clause's exclusion list is measured against the root: 30 excluded id(s), all present · Act I measured peak (ids 1–20) = 24.729412 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
act 3's law surface (read from the law module, never re-typed): par band [20, 28] inclusive · D_exec band [23.75, 33.0625] (printed [23.75, 33.06]; §7.9: the derived value is the operand) · §7.10.6 B4's batch-2 multiset [22, 24, 26, 26, 26] (B1's anchor 22 = PAR_FLOOR + 2·(ℓ−1) with ℓ = 2 — published as a TIE-BREAK, not a derivation) · B3's half ceiling 31.0625 = 26 + 3·1.6875 (margin 0.6875 below any par 28 tail rung's floor 31.7500) · §7.3.1 instance 6 bound [-4.705319, -1.392819] vs the previous rung L45 30.455319 (alias to Act III's registered tail 30.455319: identical, so the two cannot drift) · batch ids [46, 47, 48, 49, 50] vs this run's window L46–L50: identical
D2 orbit law — SIZES ONLY (PREDICTED, then MEASURED; accepts never inherit): σ_x : x ↦ 1 + 7 − x ⇒ K is orbit-constant; PREDICTED 14 orbit pair(s) of device counts equal, MEASURED 0/14 equal · 2,0=0 ↔ 6,0=18 DIFFERENT · 3,0=6 ↔ 5,0=27 DIFFERENT · 2,1=0 ↔ 6,1=27 DIFFERENT · 3,1=0 ↔ 5,1=12 DIFFERENT · 2,2=0 ↔ 6,2=30 DIFFERENT · 3,2=0 ↔ 5,2=6 DIFFERENT · 2,3=0 ↔ 6,3=30 DIFFERENT · 3,3=0 ↔ 5,3=6 DIFFERENT · 2,4=0 ↔ 6,4=30 DIFFERENT · 3,4=0 ↔ 5,4=6 DIFFERENT · 2,5=0 ↔ 6,5=27 DIFFERENT · 3,5=0 ↔ 5,5=12 DIFFERENT … (+2 pair(s))
CUT divergence receipt (F-L36-1): FROZEN registered-blocks-excluded floor 14.969697 vs the pre-fix basis's 30.455319 (Δ 15.485622) — …
preflight parity law: 45 board(s), 20668 state(s), 56884 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 41 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, …, l045.json]
```

```
census: 4201 accept(s) of 20000 judged candidate(s) over 417 (R2,R3,R4) group(s) in 141.9 s · devices walked 10/348 · 40-group cap hit on 9 device(s) · global budget 20000 HIT (the run is a deterministic PREFIX: the accept count is a floor, the refusal census is complete only within the prefix)
upstream skips: R2 sets not sealable 21 (column-leak 21) · R2 boundary outside the pool 28 · 38 sealed R2 set(s) · devices with < 4 free tiles for R2 0 · (R2,R3) pairs with < 4 free tiles for R3 0 · R3 sets not sealable 1994 (column-leak 752) (mixed-entry-phase 1242) · R3 boundary outside the pool 40 · 153 sealed R3 set(s) · SHAPE FILTER #1 (an R3 tile adjacent to an R2 tile) 0 (0 expected by the seal law) · (R2,R3,R4) groups with < 4 free tiles for R4 0 · R4 sets not sealable 12605 (column-leak 6259) (mixed-entry-phase 6346) · R4 boundary outside the pool 786 · 1335 sealed R4 set(s) · SHAPE FILTER #2 (an R4 tile adjacent to an R2 or R3 tile) 0 (0 expected by the seal law) · no goal candidate 132 · s2 tile on the goal's seal or the goal itself 9564 · derived two-room door (F-L41-2 — a door enclosing TWO derived walk-sealed rooms) 219
tile accounting: largest R3 pool seen 22 tile(s) · largest R4 pool seen 19 tile(s) · largest free pool seen after a sealed R4 15 tile(s) (that pool must hold the goal + its whole seal (≥ 2) + the s2 tile)
room rejections: mixed-entry-phase: 24472 · column-leak: 13908
rejection histogram:
  par-out-of-band: 7794
  unsolvable: 6643
  g5-identity-broken: 1143
  derived-two-room-door: 219
census accounting identity (F-L36-2 / F-L41-2 — every refusal is counted, so the census can close): accepts 4201 + refuses 15799 [derived-two-room-door 219 · g5-identity-broken 1143 · par-out-of-band 7794 · unsolvable 6643] = 20000 vs judged 20000 — CLOSES exactly
par census over the OUT-OF-BAND judged candidate(s) (the histogram counts only the members the par band refused; in-band members are enumerated by "accepts by par" and by the in-band refusal list — F-L36-2): 16:27 17:69 18:166 19:314 29:551 30:497 31:510 32:388 33:537 34:364 35:565 36:362 37:585 38:344 39:503 40:281 41:368 42:203 43:232 44:130 45:137 46:89 47:102 48:53 49:82 50:49 51:56 52:50 53:36 54:38 55:24 56:32 57:11 58:24 59:2 60:11 62:2
accepts by par:
  par 20: 169 accept(s), D_exec 24.252174 … 24.420213 (B 1.4174 … 1.4734)
  par 21: 323 accept(s), D_exec 25.171053 … 25.419700 (B 1.3904 … 1.4732)
  par 22: 373 accept(s), D_exec 26.200000 … 26.436170 (B 1.4000 … 1.4787)
  par 23: 531 accept(s), D_exec 27.186957 … 27.419700 (B 1.3957 … 1.4732)
  par 24: 483 accept(s), D_exec 28.185897 … 28.455319 (B 1.3953 … 1.4851)
  par 25: 619 accept(s), D_exec 29.181230 … 29.413276 (B 1.3937 … 1.4711)
  par 26: 565 accept(s), D_exec 30.185897 … 30.455319 (B 1.3953 … 1.4851)
  par 27: 609 accept(s), D_exec 31.129450 … 31.429336 (B 1.3765 … 1.4764)
  par 28: 529 accept(s), D_exec 32.157895 … 32.448936 (B 1.3860 … 1.4830)
in-band candidates refused by a gate: 1143
```

### 5.1 The pre-fix / post-fix table (both readings, neither suppressed)

| reading | pre-fix | post-fix | note |
|---|---|---|---|
| accepts | **1138** | **4201** | identical enumeration (`upstream skips`, histograms, `par-out-of-band 7794`, `unsolvable 6643`, `derived-two-room-door 219` all **byte-identical**) |
| `par 22` | **0** | **373** | B1's anchor — the falsification test's subject |
| `par 24` | **0** | **483** | B6's fallback window member |
| `par 26` | **0** | **565** | B3's truncated top — this batch's carrier par |
| `par 27`, `par 28` | 609, 529 | 609, 529 | **unchanged to the digit** (both survive the old gate) |
| `escalation` refuses | 3063 (+1032 shared with `g5`) | **0** | the gate no longer binds: `14.969697` |
| accounting | `1138 + 18862 = 20000` ✓ | `4201 + 15799 = 20000` ✓ | both close **exactly** |

**The `L46–L50` window's own reading (B3/B4 depend on it):** the derived window from B1's anchor is
`22, 24, 26, 28, 30`, truncated by B3 at the reserved top to `22, 24, 26` — all three **populated**
(`373 / 483 / 565`), and `par 28`'s pool (`529`) is **deliberately out of reach** for this batch by the
batch's own ceiling (`31.0625`), not by a shortage of boards.

**One distributional reading worth keeping (not a rule):** the measured bands leave a **gap** between
`30.455319` (the `par 24`/`par 26` maxima) and `31.129450` (the `par 27` minimum) — and both the old
gate's floor (`30.455319`) and the new ceiling (`31.0625`) fall inside that same gap, which is *why*
the F-L46-1 truncation appeared as a clean cut rather than a smear. Nothing is inferred from it.

---

## 6. The generator A/B — the recorded Act III opener arm, reproduced

The identical command for **batch 5** (`--batch=5` the only difference) was re-run in this tree against
the recorded post-F-L41-2 arm (`/tmp/lv018-census77-post.txt`, i.e. the arm
`scripts/author-l41-l45.transcript.md` §8 records at `4201` accepts):

```
$ diff lv018-census77-post.txt /tmp/lv019/postfix-census-b5.txt
1c1        the CUT clause line (the fix; floor 14.969697 in BOTH)
4,6c4,6    the two CUT-adjacent lines + the two DATASET-STATE lines:
             preflight parity law: 40 board(s) → 45 board(s)
             clone guard: [l001…l040, candidates/l041…l045] → [l001…l045]
90c90      census: 4201 accept(s) … in 158.1 s → in 143.8 s      (elapsed only)
130c130    wrote 4201 accept(s) to <path>                        (path only)
```

**Reading.** The accept table, the refusal ledger, the in-band refusal list and the accounting line are
**byte-identical** — `4201` accepts, `derived-two-room-door 219 · g5-identity-broken 1143 ·
par-out-of-band 7794 · unsolvable 6643`. The two "dataset-state" lines move only because the recorded
run was taken **before R-007 moved the five Act III files from `candidates/` to the root** (40 → 45
boards; the guard listing the same five files under a different path) — that is a change of *the world
being measured*, not of the instrument, and it is `git`-dated in `lv018-reg-after.txt` vs
`lv018-reg-before.txt`. This is the required receipt that the fix **restores the recorded verdicts
exactly** rather than shifting them: pre-fix the same command returns `0` accepts at `par ≤ 26`.

**And it shows the census is a property of `(frame, device, caps)`**, not of the batch: the batch-6 pool
(§5) and the batch-5 pool are the same 4201 accepts. The batch number changes the banner, the law-surface
fragment and the draft id used for `auditLevel` — not a single judged tuple.

---

## 7. STEP 3, dry run — the ladder, the rungs, the clone census, B3/B5/B7

```
$ npx tsx scripts/author-l21.ts --stage=s --act=3 --batch=6 --parmin=20 --parmax=28 \
    --accepts=/tmp/lv019/post-fix-accepts.json                                       (exit 0)
```

```
read 4201 accept(s) from /tmp/lv019/post-fix-accepts.json

selection filter: 3063 accept(s) inside the bands · 159 refused by the §6.1.4 clone guard (key already taken by a shipped board) · 2904 usable · 41 key(s) already taken
selection: Act III BATCH 2's par multiset (GD-013 §7.10.6 B1–B7, APPLIED — read from the law module, never re-derived by taste) — [22, 24, 26, 26, 26]: B1's anchor A₂ = PAR_FLOOR 20 + 2·(ℓ−1) = 22 (§7.10.6's box publishes this as the TIE-BREAK — the smallest admissible advance clearing B7 — not as a derivation); the P2-exact window from it is 22, 24, 26, 28, 30 and B3 truncates it at the reserved top 26 → [22, 24, 26]; B4's fill repeats the truncated top; B3's batch ceiling 31.0625 = 26 + 3·1.6875 is enforced by this run's filter (reservation margin 0.6875 below the par 28 tail floor 31.7500)
selection: B2 self-check (the rule's own proving test) — the identical rule applied at ℓ = 1 (anchor 20) reproduces [20, 22, 24, 26, 26] vs the registered ACT_III_OPENER_PAR_MULTISET [20, 22, 24, 26, 26]: REPRODUCED EXACTLY — the rule is not a new rule wearing §7.10.2's clothes
selection: B4 descending fill executed — [22, 24, 26, 26, 26] from the truncated window [22, 24, 26] (3 of 3 derived value(s) supported); IDENTICAL to the published multiset ACT_III_B2_PAR_MULTISET
selection: Act III batch 2 par multiset [22, 24, 26, 26, 26] · ascending par · B5: the FIRST rung of a same-par pair takes the pool's lowest accepted D_exec and the CLOSING rung the within-par MAXIMUM (O6; the plural-same-par case L48/L49 is the one the opener never exercised), every rung's departure printed below
selection: B7 anti-mirror (printed, never hidden, as a MULTISET comparison) — the registered Act II multisets are [17, 18, 20, 21, 23] · [17, 18, 20, 21, 23] · [19, 22, 22, 24, 24] · [18, 20, 22, 24, 24] and Act III batch 1's is [20, 22, 24, 26, 26]; this batch's is [22, 24, 26, 26, 26]: distinct from every one of them by multiset · coinciding distinct pars 3 of 3 (22, 24, 26) — a finite integer band makes these coincidences unavoidable, so they are printed rather than implied away; the MULTISET differs (par 26 repeated three times here vs twice in the opener), and "shares pars" is not "is the same ladder"
selection: B3 enforced — every admitted row sits at or below the batch's half ceiling 31.0625 (= TOP 26 + 3·1.6875), which is 0.6875 BELOW any par 28 tail rung's floor 31.7500 — the reservation survives the selection

selection: 1 par combo(s) tried · rising-D_exec clause NOT in force (batch 6's published amendment: §7.3 interior freedom; the across-act clause rode on batch 1's peak) · 0 dropped by it · 0 dropped by the clone clause (a par's whole in-band pool keyed on already-used geometry)
selection: pars [22, 24, 26, 26, 26] · Δpar≥2 steps 2/4 · min D_exec 26.242489 · spread 4.174532
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a shipped board
  L46 par=22 D_exec=26.242489 B=1.4142 coverage=49/49 chain=120/120 Δpar=n/a ΔD_exec=n/a
    key=0,0|3,6|0,1|4,0|2,2+2,6+3,0+3,1+3,3+3,4+3,5+4,1+4,2+4,3+4,5+4,6+5,2+5,4+5,6+6,1+6,5
    landing=4,0 near=0,1/A P=[4,0 5,0 5,1 6,0] d1=[3,0 4,1 5,2 6,1]/red s1=5,1/A R2=[3,2] d2=[2,2 3,1 3,3 4,2]/blue s2=2,1/B R3=[4,4] d3=[3,4 4,3 4,5 5,4]/red s3=3,2/B R4=[6,6] d4=[5,6 6,5]/red s4=4,4/A s5=6,6/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  L47 par=24 D_exec=28.216304 B=1.4054 coverage=49/49 chain=1440/1440 Δpar=2 ΔD_exec=1.973815
    key=0,0|6,3|0,1|4,0|2,2+2,6+3,0+3,1+3,3+3,4+3,5+4,1+4,2+4,3+4,5+4,6+5,2+5,3+5,4+6,1+6,2+6,4
    landing=4,0 near=0,1/A P=[4,0 5,0 5,1 6,0] d1=[3,0 4,1 5,2 6,1]/red s1=5,1/A R2=[3,2] d2=[2,2 3,1 3,3 4,2]/blue s2=2,1/B R3=[4,4] d3=[3,4 4,3 4,5 5,4]/red s3=3,2/B R4=[3,6] d4=[2,6 3,5 4,6]/blue s4=4,4/A s5=3,6/B goal=6,3 d5=[5,3 6,2 6,4]/blue
  L48 par=26 D_exec=30.227421 B=1.4091 coverage=49/49 chain=48/48 Δpar=2 ΔD_exec=2.011117
    key=0,0|6,5|0,6|3,0|2,0+2,3+2,6+3,1+3,2+3,4+3,5+4,2+4,3+4,6+5,1+5,2+5,5+6,0+6,1+6,3+6,4+6,6
    landing=3,0 near=0,6/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[3,6] d4=[2,6 3,5 4,6]/blue s4=3,3/A s5=3,6/B goal=6,5 d5=[5,5 6,4 6,6]/blue
  L49 par=26 D_exec=30.227564 B=1.4092 coverage=49/49 chain=36/36 Δpar=0 ΔD_exec=0.000143
    key=0,0|3,4|0,6|3,0|2,0+2,4+3,1+3,3+3,5+3,6+4,2+4,4+4,5+5,1+5,2+5,5+5,6+6,0+6,1+6,3+6,4+6,6
    landing=3,0 near=0,6/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=5,4/B R3=[6,5] d3=[5,5 6,4 6,6]/blue s3=6,2/A R4=[4,6] d4=[3,6 4,5 5,6]/red s4=6,5/B s5=4,6/A goal=3,4 d5=[2,4 3,3 3,5 4,4]/blue
  L50 par=26 D_exec=30.417021 B=1.4723 coverage=49/49 chain=108/108 Δpar=0 ΔD_exec=0.189457
    key=0,0|5,4|0,1|4,0|2,0+2,6+3,1+3,5+4,2+4,4+4,6+5,1+5,2+5,3+5,5+5,6+6,0+6,1+6,3+6,4+6,5
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,3/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue

batch-2 note — every departure from the within-par tie-break, printed (B5's plural-same-par case: a filter is never silent):
  par 26: 2 lower-D_exec row(s) refused by the rung-key-wide distinct clause (the rung already keyed the batch) → took 30.227564
  par 26 (L50): the closing rung took the within-par MAXIMUM D_exec 30.417021 (published departure, header rule 4 — §7.3.2 asks the act's maximum to be carried late); the par's minimum is 30.227421

act III BATCH 2 READING (§7.10.6: NO act-peak / act-close branch on batch 2 either — §7.3.2's carrier is L51–L60; the batch REPORTS its peak) — the batch's measured MAXIMUM is L50 at D_exec 30.417021 (par 26, B 1.4723, chain 108/108): vs L45 30.455319 (Act III's REGISTERED tail — the seam's own left side) → Δ -0.038298 — BELOW: the act's maximum simply REMAINS at L45 until L51–L60 lands — reported, never repaired by padding (§7.10.6's own read-out); vs Act II's registered tail 28.455319 → Δ 1.961702 (the §7.3 across-act reading, already discharged by L45)
  band containment (derived-exact, §7.9) AND B3's batch ceiling — Act III's band [23.75, 33.0625] (printed [23.75, 33.06]; the derived value is the operand) and the half ceiling 31.0625: L46 26.242489 ≤ 31.0625 · L47 28.216304 ≤ 31.0625 · L48 30.227421 ≤ 31.0625 · L49 30.227564 ≤ 31.0625 · L50 30.417021 ≤ 31.0625; par band [20, 28] inclusive (§7.10.3) with this batch's own par ceiling 26 (§7.10.6 B3)
  last rung L50 par=26 D_exec=30.417021 (B5 put the batch's maximum on the closing rung: HOLDING)
  DERIVED falsification probe for THIS batch (never typed; F-L41-3's rule — a probe must sit ABOVE the peak to falsify): --peak = (L50 30.417021 + ACT_III_EXEC_BAND[1] 33.0625) / 2 = 31.739760638297874 · strictly inside the act band (checked) and strictly above this batch's own peak (checked: it can falsify); the prover run must exit 1 with exactly one act-peak FAIL on L50 and the battery 65/65
```

### 7.1 The ladder, as a table

| rung | par | `D_exec` | `B` | coverage | chain | step `Δpar` | step `ΔD_exec` | within-par position |
|---|---|---|---|---|---|---|---|---|
| `L46` | 22 | **26.242489** | 1.4142 | 49/49 | 120/120 | — | — | pool min (373 accepts) |
| `L47` | 24 | 28.216304 | 1.4054 | 49/49 | 1440/1440 | +2 | +1.973815 | pool min (483 accepts) |
| `L48` | 26 | 30.227421 | 1.4091 | 49/49 | 48/48 | +2 | +2.011117 | pool **min** (B5's first of the plural pair) |
| `L49` | 26 | 30.227564 | 1.4092 | 49/49 | 36/36 | +0 | +0.000143 | next ascending after 2 key-refusals |
| `L50` | 26 | **30.417021** | 1.4723 | 49/49 | 108/108 | +0 | +0.189457 | pool **max** (published departure, B5/O6) |

`par` multiset `[22, 24, 26, 26, 26]` = the published `ACT_III_B2_PAR_MULTISET`; `B3`'s ceiling holds on
every rung; the batch's peak `30.417021` sits **below** `L45`'s registered `30.455319` (`Δ −0.038298`),
which §7.10.6 **reports and does not repair** — the act's maximum remains at `L45` until `L51–L60` lands.

### 7.2 The clone census (`§6.1.4`, seal-inclusive key)

`5` rungs, `5` **distinct** keys, `0` collisions with a shipped board. The arithmetic, quoted so it can
be checked: the guard takes **`41` distinct geometry keys over `45` root files** (`l001`–`l045`; the root
walk is non-recursive), and these five rungs are checked **against** that set — `41` registered keys `+`
`5` batch keys `= 46` keys in play, `0` of which may collide. The guard's own basis does **not** grow when
the five shelf files land in `src/levels/candidates/`, because `candidates/` is not in the root walk
(§6's A/B shows the same `41`-key listing before and after this batch).

---

## 8. The relief fill-in (instance 6) — value before bytes, and the law-module MATCH

```
RELIEF instance 6 FILL-IN (§7.10.7; the label was PRE-PUBLISHED by GD-013 before this census, its exact value is filled in BEFORE the bytes, never after — and never copied from instance 5):
  L46 par 22 · D_exec 26.242489 · B 1.4142 vs L45 par 26 · D_exec 30.455319 · B 1.4851 → Δpar -4, ΔB -0.0709, 3·ΔB -0.212811, ΔD_exec = Δpar + 3·ΔB = -4.212830
  exact value -4.212830 · published bound (union) [-4.705319, -1.392819] → INSIDE the union · applicable half for par 22: [-4.705319, -3.392819] → INSIDE it
  paste-ready (the census record quotes this line verbatim, before any board byte): ACT_III_B2_SEAM_RELIEF_LEVEL_ID = 46 · ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489 · ACT_III_B2_SEAM_RELIEF_DELTA = -4.212830 · ACT_III_B2_SEAM_RELIEF_DELTA_RANGE = [-4.705319, -1.392819] (BELOW L45 — §7.10.7's own premise holds: Δpar < 0)
  law-module verification (the constant and the measurement must agree, or the registration train cites a stale literal; compared with the law module's own LAW_PRECISION 5e-7 — never `===`, because the operand is the display form, F-L41-1): ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489 (constant 26.242489; exact 26.242489270386265 vs 26.242489, |Δ| 2.704e-7) → MATCH · ACT_III_B2_SEAM_RELIEF_DELTA = -4.212830 (derived -4.212830; exact -4.212829729613734 vs -4.21283, |Δ| 2.704e-7) → MATCH
  the "+2 shift identity" is CHECKED, not trusted: 22 − 30.455319 = -8.455319 vs 20 − 28.455319 = -8.455319 — the bound coincides with instance 5's while this value (-4.212830) is a DIFFERENT number computed from L46's own B 1.4142 vs L41's 1.4191: quoting instance 5's −4.197990 here would cite a different board
```

**What this commit wrote, and nothing more:** `ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489` and the
**derived** `ACT_III_B2_SEAM_RELIEF_DELTA` (`_EXEC − _PREVIOUS_EXEC`, never re-typed). The bound
`[-4.705319, -1.392819]` and `ADMISSIBLE_FIRST_RUNGS` were published by GD-013 **before** this census
(`1d6c90f`/`64e79a9`); instance 6 is deliberately **not** appended to `ACT_SEAM_RELIEFS_ALL` — the
register-wide relief-admissibility test's freeze over `L41–L50` is the **R-008** train's move, and a
shelf batch does not move a registered constant.

---

## 9. STEP 4's inputs (the probe is derived here, not typed)

`--peak = (L50's D_exec 30.417021 + ACT_III_EXEC_BAND[1] 33.0625) / 2 = 31.739760638297874`.

The prover run **must exit 1** with **exactly one** `act-peak` FAIL on **exactly** `L50` (the closing
rung carries the within-par maximum per B5) and the control battery at `65/65`. A probe that fails
nothing, or fails more than the peak rung, is a finding about the instrument and will be published as
one (F-L41-3 is the measured record of a probe whose operand sat *below* the peak it had to fail).

---

## 10. Commands, timings, exit codes

| step | command (`scripts/author-l21.ts` unless noted) | wall | exit |
|---|---|---|---|
| 1a | `--stage=roomcap --act=3 --batch=6 --cx=1 --h=7 --maxsize=4` | pre/post both fast | 0 / 0 |
| 1b | `--stage=roomcap --act=2 --cx=1 --h=7 --maxsize=4` (the Act II arm) | fast | 0 / 0 |
| 2a | `--stage=g --act=3 --batch=6 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=20 --parmax=28` **pre-fix** | 146.12 s user / 2:22.88 | 0 |
| 2b | the identical command **post-fix** (`--accepts=/tmp/lv019/post-fix-accepts.json`) | 145.63 s user / 2:22.38 | 0 |
| 2c | the identical command at `--batch=5` (the **A/B** arm) | 147.72 s user / 2:24.36 | 0 |
| 3a | `--stage=s --act=3 --batch=6 --parmin=20 --parmax=28 --accepts=<2b's dump>` (dry) | fast | 0 |
| 3b | the identical command **with `--write`** | *next commit* | — |
| 4 | `tsc --noEmit` (`npm run typecheck`) after the fix and after the fill-in | ~5 s | 0 |

---

## 11. Findings, and what this record does NOT claim

- **F-L46-1** (the generator's cut basis): found pre-census-fix, published docstring-only before the fix
  (`029bed9`), fixed here, with the pre-fix reading kept beside the post-fix one (§5.1) and the
  blast radius measured as a diff in both acts (§4). **Fifth occurrence** of the F-L36-1 mechanism; the
  repair additionally derives the printed clause from the constants and measures the clause's exclusion
  list against the root, so the *shape* of the fault (`label ⊃ measurement`) is now closed twice over.
- **Not claimed: that the `7×7` frame could not open below `par 21`.** The pre-fix truncation was a
  filter's verdict. The supported sentence is the measured one: on this frame, this device, these caps,
  the admissible pool's in-band pars are `20 … 28` with `par 22 = 373` accepts — and a **prefix** census
  of one frame's enumeration cannot make a claim about the device class (rule 10; item 114's law).
- **Not claimed: an `act-peak` or `act-close` obligation for this batch.** §7.10.6 gives batch 2 **no**
  such branch; §7.3.2's carrier is `L51–L60`. The batch's peak (`30.417021`) is **reported**, and it
  sits `0.038298` **below** `L45`'s registered tail — a reading, never repaired by padding.
- **Not claimed: registration.** These five boards are **shelf** candidates. No registered constant
  moves, `ACT_III_REGISTERED_TAIL_*` is untouched, instance 6 is not appended to `ACT_SEAM_RELIEFS_ALL`,
  `tests/**` is untouched, and `npm run levels` stays at **45/45** (the root walk is non-recursive, so
  the shelf files are invisible to it until the registration train moves them).
- **Not claimed: `H`/XOR.** U-002 holds the XOR multi-switch door for `L51–L60`; §7.10.5's `ΔM = 0`
  governs this batch, the five-rung device is the opener's own proven class, and **no device decision
  was taken here** (GD-013: batch 2 *"needs no device decision"*).
- **Booked, not fixed (design + QA lane):** there is no `ACT_III_B2_PAR_MULTISET`-keyed per-rung gate
  family yet (`gate-act3-batch-2-*`), and the ladder's operand label is act-aware only via the
  `ACT3_LAW_LABEL` branch added on the prover side (§ the proof transcript,
  `scripts/prove-candidate-l4650.transcript.md`). Also booked: the `R-008`
  envelope arithmetic (the chain model at 50 rungs vs the live `1_617_000` ms forecast) — a
  measurement for the registration train, not for this census.