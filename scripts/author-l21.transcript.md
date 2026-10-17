# `scripts/author-l21.ts` — transcript (LV-012)

**Owner:** Level AI + Solver · **Ticket:** LV-012 · **Batch:** Act II batch 1, rungs **L21–L25**
**Law:** `docs/level-design.md` §7.2 / §7.4 / §7.7, §6.1.4 (clone guard), §6.2.3 (verbatim) · ADR `design-0005`
**Discipline:** *LLM ≠ Solver.* Nothing here judges solvability. Every `par`, every `D_exec`, every
`B`, every coverage count in this file is **stamped by the program** (`src/core/solver/**` through the
tool), and the *proof* of the five landed rungs lives in the separate, independent prover:
`scripts/prove-candidate-l2125.transcript.md`.
**Output discipline:** candidates only — `src/levels/candidates/l021.json` … `l025.json`. `src/levels`
root rows were not touched, and L19/L20 were **not** re-stamped (§7.7 item 4).

This transcript is the authoring-side record. It is written so that every number can be re-derived
from the command beside it rather than trusted.

---

## 0. The named plan shape, written BEFORE the skeleton was searched

§7.7 item 2 requires a **named plan shape** first. The G lattice builds:

```
  P  the landing pocket   — walk-sealed: the portal is its only entrance
                            exit  = door  d1  (one door object, whole boundary)
                            press = s1 ∈ P        (drives d1)
  F  the free far region  — entered only by crossing d1
                            press = s2 ∈ F        (drives d2)  ← reachable only
                                                                 after d1 opens
  Q  the second pocket    — walk-sealed room in F: every neighbour is a d2 tile,
                            so d2 is both its entrance and its exit
                            press = sg ∈ Q        (drives d3)
  G  the goal             — every in-region neighbour is a d3 tile (one door
                            object), so the goal is entered only through d3
```

The forced order `s1 → d1 → s2 → d2 → sg → d3` is a **property of the board, never of advice**:
`s2` lies outside `P` (hence after `d1`), `sg` lies inside `Q` (hence after `d2`), `d3` is the goal's
only entrance (hence after `sg`), and §1's one-switch-per-door rule means nothing else can open any of
the three doors. The prover then re-derives all of this **from the landed bytes** and additionally
stages the worlds to check the order is *forced*, not merely *present* (`g3-ordered-chain`).

Commands used (all from the worktree root):

```
  node_modules/.bin/tsx scripts/author-l21.ts --stage=frame
  node_modules/.bin/tsx scripts/author-l21.ts --stage=g --cx=2 --pocketsize=4 --qmax=4 --cap=200
  node_modules/.bin/tsx scripts/author-l21.ts --stage=s --cx=2 --pocketsize=4 --qmax=4 --cap=200 --accepts=<dump>
  node_modules/.bin/tsx scripts/author-l21.ts --stage=s --cx=2 --pocketsize=4 --qmax=4 --cap=200 --accepts=<dump> --write
```

### 0a. The frame — measured, not assumed

```
=== --stage=frame ===
frame census (the derived far-frame phase law vs a BFS of the bare board): 2754/2754 far-tile
(phase, once-reached) readings agree with stand(t) = arrivalPhase ⊕ parity-distance · 0 mismatch(es)
```

**2754/2754, 0 mismatches.** The phase a construction may *stand on* after a teleport is therefore a
readable measurement of the shipped rule, not a construction-time assumption — which matters because
`--cx=2` (the frame this batch uses) moves the sealed column and therefore re-derives the whole far
frame. (The tool's default `--cx=3` is L20's frame; at `cx=3` the G lattice yields **0** judged
candidates. `cx=2` is used deliberately and is declared in every command above.)

---

## 1. The §6.1.4 clone guard — censused, never re-stamped

Every stage prints the guard *before* doing any work, over the **stricter seal-inclusive** key
`player | goal | portal pair | sorted door tiles`:

* at the first exploration (`--pocketsize=5`): **16 geometry key(s)** — exactly the 16 distinct keys
  carried by the shipped 20 boards;
* at the selection/write (the five candidates on the shelf): **21 key(s)** — 16 shipped + the 5 landed
  rungs, listed by file in the printed census.

L19/L20 were never candidates of this lattice: the batch's far-frame (`cx=2`), its pocket sizes and its
3-door plan shape are disjoint from the sealed landing's one-off fit, and the guard census proves the
resulting keys do not collide with anything shipped.

---

## 2. The `--pocketsize=5` pass — a **negative** census, and the diversity finding

```
stage G multi-pocket lattice: 476 leak-free landing device(s) (landing × near × pocket ≤ 5) ·
second pocket ≤ 5 · cap 800 tuple(s) per device · par band [17, 23] · D_exec band [19.75, 29.06]

census: 0 accept(s) of 0 judged candidate(s) in 0.1 s
upstream skips: room2 sets not sealable 28968 · room2 boundary outside the free pool 102 ·
devices with < 2 free tiles 0 · no goal candidate 34 · no s2 tile 0 · no sg tile 0
room rejections: column-leak: 72471 · mixed-entry-phase: 24004
```

**0 accepts / 0 judged** — and the reason is *upstream of the par filter*: **not one room survived
`sealable-room`**. Every one of the 476 devices died on `column-leak` (72 471) or `mixed-entry-phase`
(24 004). With `POCKET_MAX = 5` the second pocket's tile-sets in this frame are either leaky (a
neighbour that is not a `d2` tile, so the room can be walked out of) or they straddle the entry phase.

**The measured consequence is a diversity law**: in this frame the sealable room caps at **4 tiles**,
and the G family's device/seal skeleton census measures only **2 distinct skeletons per par**. So a
five-rung ladder *cannot* be five different skeletons here. This is reported as a **legibility risk,
not a guard violation** — the rungs differ by portal endpoint, landing tile and switch placement, so
they carry five **distinct** §6.1.4 keys, but L21/L24/L25 share one device skeleton (`P/d1/Q/d2/goal/d3`
with the same door tiles) and L22/L23 share the other. §7.7 item 4 forbids re-stamping **L20** (a
shipped board's own skeleton) and forbids clone-key collisions; it does not demand five skeletons. The
risk lands on the designer's desk as a *comprehension* question for Act II batch 2, not as a proof
obligation.

---

## 3. The `--pocketsize=4 --qmax=4 --cap=200` census — the accepted class

```
stage G multi-pocket lattice: 440 leak-free landing device(s) (landing × near × pocket ≤ 4) ·
second pocket ≤ 4 · cap 200 tuple(s) per device · par band [17, 23] · D_exec band [19.75, 29.06]

census: 2208 accept(s) of 9570 judged candidate(s) in 29.0 s
upstream skips: room2 sets not sealable 47608 · room2 boundary outside the free pool 132 ·
devices with < 2 free tiles 0 · no goal candidate 132 · no s2 tile 0 · no sg tile 0
room rejections: column-leak: 31603 · mixed-entry-phase: 28743
rejection histogram:
  unsolvable: 4004
  g5-identity-broken: 1864
  par-out-of-band: 1494
par census over every judged candidate: 9:24 10:8 11:128 12:38 13:276 14:56 15:450 16:112
                                      24:260 25:24 26:96 28:22
in-band candidates refused by a gate: 1864
```

**2208 accepts of 9570 judged** — and the census is set-identical to the earlier `--cap` dump
(`/tmp/lv012-cx2-p4q4.json`, 1 951 759 B), so the pass is reproducible from its own record.

### 3a. The refusal census, published beside the accepts (§7.7 item 5)

| refusal | count | what it means |
|---|---|---|
| `unsolvable` | **4004** | the BFS found no route — the largest single class, and the one the program (never a model) owns |
| `g5-identity-broken` | **1864** | an **in-band** candidate whose seal tiles are *not* adjacent to the all-OFF free region, so the census identity `par = min_i(d(start→s_i)+1+d(s_i→goal))` no longer computes this board |
| `par-out-of-band` | **1494** | parity-locked `par` outside 16–24 (measured over *all* judged candidates: 9, 10, 11, 12, 13, 14, 15 on the low side and 24, 25, 26, 28 on the high side) |
| `room2 sets not sealable` (upstream) | **47 608** | the second pocket could not be closed by a single door object |
| `column-leak` / `mixed-entry-phase` | **31 603 / 28 743** | room sets that fail §6.2.3 item 3 / the entry-phase law |

Note the shape of that histogram: **`par-out-of-band` is not the dominant filter** — the dominant
filter is *the puzzle not existing* (`unsolvable`) followed by *the device's own structural law*
(`g5-identity-broken`). And `in-band candidates refused by a gate: 1864` is precisely the number of
in-band candidates the `g5-identity-broken` gate refused, i.e. **no in-band candidate was dropped for
any other reason**. That is the honest reading of "the gates are load-bearing".

### 3b. Accepts by par (the pool the selection drew from)

```
  par 17: 380 accept(s), D_exec 21.581395 … 21.795276 (B 1.5271 … 1.5984)
  par 18:  72 accept(s), D_exec 22.584000 … 22.752000 (B 1.5280 … 1.5840)
  par 19: 574 accept(s), D_exec 23.593023 … 23.795276 (B 1.5310 … 1.5984)
  par 20: 172 accept(s), D_exec 24.608000 … 24.776000 (B 1.5360 … 1.5920)
  par 21: 528 accept(s), D_exec 25.593023 … 25.783465 (B 1.5310 … 1.5945)
  par 22: 244 accept(s), D_exec 26.584000 … 26.802372 (B 1.5280 … 1.6008)
  par 23: 238 accept(s), D_exec 27.604651 … 27.771654 (B 1.5349 … 1.5906)
```

Every one of those `B` readings is inside the measured `[1.2500, 1.6875]` band — checked, not assumed
(`act2-b-band` re-checks it per rung in the prover).

---

## 4. The selection rule, published before it ran, plus the clause added before the write

1. Rungs are `L21 … L25` in order; every member strictly inside Act II's `par` 16–24 band, `D_exec`
   inside `[19.75, 29.06]`, `B` inside the measured band.
2. `D_exec` must **strictly rise** along the batch (§7.3: a plateau is allowed only at act-open and
   must be labelled `ΔM = 0` — **never a dip**; a rise is the obligation this batch can prove).
3. Prefer the ladder maximising `Δpar ≥ 2` steps (§6.1.1 P2), then the largest minimal per-rung
   `D_exec`, then the lowest total spread.
4. **Added by LV-012 before anything was written** — the §6.1.4 distinct-key clause, read over the
   *stricter* seal-inclusive key. The first draft of rule 3 was **measured to violate it** (two rungs
   at `landing 5,5 / near 0,5` with identical portals *and identical door tiles* — a clone-and-perturb
   of one skeleton, exactly what §6.1.4 names), which is why the clause is a **filter, not a
   preference**. The tool excludes ids ≥ `BATCH_FIRST_ID = 21` from the guard so it reproduces its own
   record rather than reading back the boards it just wrote.

Rule 3's par-step preference is a *preference, and that is itself a measured finding*: five rungs
inside a 7-wide par window cannot all step by 2 (`17 + 2·4 = 25 > 23`), so at most two steps can be 2.
The violated step is **reported beside the ladder, never hidden** — see the table in §5.

### 4a. Dry run

```
clone guard (§6.1.4, seal-inclusive key): 21 geometry key(s) taken [… candidates/l021.json … l025.json]
read 2208 accept(s) from …/lv012-cx2-p4q4-final.json

selection filter: 2208 accept(s) inside the bands · 0 refused by the §6.1.4 clone guard
                  (key already taken by a shipped board) · 2208 usable · 16 key(s) already taken

selection: 21 par combo(s) tried · 0 dropped by the rising-D_exec clause ·
           0 dropped by the clone clause (a par's whole in-band pool keyed on already-used geometry)
selection: pars [17, 18, 20, 21, 23] · Δpar≥2 steps 2/4 · min D_exec 21.581395 · spread 6.023256
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a
shipped board
(dry run — pass --write to land the five candidates)
```

**21 par combinations tried** (non-decreasing 5-subsets of `{17,18,19,20,21,22,23}`), **0 dropped by the
rising-`D_exec` clause** — the chosen ladder satisfies it by construction of the pool — and **0 par
dropped by the clone clause**. The dry run was inspected **before** `--write`, per the "publish the rule,
then run it" discipline.

### 4b. The landed rungs

```
  L21 par=17 D_exec=21.581395 B=1.5271 coverage=42/42 chain=12/12
    key=0,0|4,2|0,5|5,5|3,2+3,5+4,0+4,1+4,3+4,4+5,1+5,2+5,3+6,2+6,4
    landing=5,5 near=0,5/A P=[4,5 5,4 5,5 6,5] d1=[3,5 4,4 5,3 6,4]/blue s1=4,5/B Q=[5,0 6,0 6,1] d2=[4,0 5,1 6,2]/blue s2=6,3/B goal=4,2 d3=[3,2 4,1 4,3 5,2]/red sg=6,0/A
  L22 par=18 D_exec=22.584000 B=1.5280 coverage=42/42 chain=16/16
    key=0,0|4,3|1,0|5,5|3,0+3,3+4,1+4,2+4,4+4,5+5,2+5,3+5,4+6,1+6,3
    landing=5,5 near=1,0/A P=[5,5 6,4 6,5] d1=[4,5 5,4 6,3]/red s1=6,5/B Q=[4,0 5,0 5,1 6,0] d2=[3,0 4,1 5,2 6,1]/red s2=3,1/A goal=4,3 d3=[3,3 4,2 4,4 5,3]/blue sg=4,0/A
  L23 par=20 D_exec=24.620000 B=1.5400 coverage=42/42 chain=20/20
    key=0,0|4,3|0,5|6,4|3,0+3,3+4,1+4,2+4,4+4,5+5,2+5,3+5,4+6,1+6,3
    landing=6,4 near=0,5/A P=[5,5 6,4 6,5] d1=[4,5 5,4 6,3]/red s1=5,5/A Q=[4,0 5,0 5,1 6,0] d2=[3,0 4,1 5,2 6,1]/red s2=6,2/A goal=4,3 d3=[3,3 4,2 4,4 5,3]/blue sg=4,0/A
  L24 par=21 D_exec=25.604651 B=1.5349 coverage=42/42 chain=90/90
    key=0,0|4,2|1,5|5,4|3,2+3,5+4,0+4,1+4,3+4,4+5,1+5,2+5,3+6,2+6,4
    landing=5,4 near=1,5/B P=[4,5 5,4 5,5 6,5] d1=[3,5 4,4 5,3 6,4]/blue s1=4,5/B Q=[5,0 6,0 6,1] d2=[4,0 5,1 6,2]/blue s2=3,1/A goal=4,2 d3=[3,2 4,1 4,3 5,2]/red sg=5,0/B
  L25 par=23 D_exec=27.604651 B=1.5349 coverage=42/42 chain=72/72
    key=0,0|4,2|1,5|4,5|3,2+3,5+4,0+4,1+4,3+4,4+5,1+5,2+5,3+6,2+6,4
    landing=4,5 near=1,5/B P=[4,5 5,4 5,5 6,5] d1=[3,5 4,4 5,3 6,4]/blue s1=6,5/B Q=[5,0 6,0 6,1] d2=[4,0 5,1 6,2]/blue s2=3,1/A goal=4,2 d3=[3,2 4,1 4,3 5,2]/red sg=5,0/B
```

`chain=` is the press-then-cross census (`routes` / `routes` — every shortest route executes
press→cross in the strict order). Clone census at write time: **16 shipped → 21 keys**, 5 distinct new
keys, 0 collisions.

---

## 5. The ladder table (measured by the prover, quoted here for the handoff)

| rung | par | `D_exec` | `B` | coverage | Δpar vs previous | rising `D_exec` | Δ vs Act I peak 24.729412 |
|---|---|---|---|---|---|---|---|
| L21 | 17 | 21.581395 | 1.5271 | 42/42 | — | — | −3.148017 |
| L22 | 18 | 22.584000 | 1.5280 | 42/42 | < 2 (1) | OK (+1.002605) | −2.145412 |
| L23 | 20 | 24.620000 | 1.5400 | 42/42 | **≥ 2 (2)** | OK (+2.036000) | −0.109412 |
| L24 | 21 | 25.604651 | 1.5349 | 42/42 | < 2 (1) | OK (+0.984651) | **+0.875239** |
| L25 | 23 | 27.604651 | 1.5349 | 42/42 | **≥ 2 (2)** | OK (+2.000000) | **+2.875239** |

* pars strictly inside 16–24: **5/5**; `D_exec` inside `[19.75, 29.06]`: **5/5**; `B` inside
  `[1.2500, 1.6875]`: **5/5**; strictly rising `D_exec`: **4/4** steps — **no dip**.
* `Δpar ≥ 2` on **2 of 4** steps — the maximum achievable in a 7-wide window, and the two violated
  steps are reported above rather than smoothed over.
* **Batch peak `L25` at 27.604651 vs Act I's measured 24.729412** ⇒ §7.3's `act-peak` clause
  **DISCHARGED**, headroom to the Act II ceiling 29.06 = **1.455349**.

## 6. What this file does NOT claim

* It does **not** claim the G family is exhausted: §7.4's stage G is `pocket count 1–4 × portal pairs
  1–2 × door arity 2–5 × landing position` on `7×6 → 7×7`, and this pass enumerates **7×6 first**
  (the dispatch's order) with **one** portal pair per §6.2.3 item 1, at `--cx=2`. `7×7`, two portal
  pairs and higher door arities are **outside this census** and are named here so nobody reads "2208
  accepts" as a completeness theorem.
* It does **not** claim `switchRequired` by assertion — it is *read* as a measurement
  (`allOffShortest = null` / all-OFF world UNSATISFIABLE) by the prover, per rung.
* It does **not** claim solvability. Five rungs are *proposed* here; the program proves them in
  `scripts/prove-candidate-l2125.transcript.md` (5/5 GATES ACCEPT, 13/13 negative controls caught with
  their own gate named on every rung, plus an `act-peak` falsification pass that fails exactly one rung
  on exactly one gate).

---

## 7. Reproduction

```
  # frame (phase law measured against a bare-board BFS)
  node_modules/.bin/tsx scripts/author-l21.ts --stage=frame

  # the census (accepts are written to --accepts, default $TMPDIR/lv012-accepts.json)
  node_modules/.bin/tsx scripts/author-l21.ts --stage=g --cx=2 --pocketsize=4 --qmax=4 --cap=200

  # the selection — dry run first, then the write
  node_modules/.bin/tsx scripts/author-l21.ts --stage=s --cx=2 --pocketsize=4 --qmax=4 --cap=200 --accepts=<dump>
  node_modules/.bin/tsx scripts/author-l21.ts --stage=s --cx=2 --pocketsize=4 --qmax=4 --cap=200 --accepts=<dump> --write
```

Re-running `--stage=s` with the five candidates already on the shelf reproduces the identical ladder:
the guard deliberately excludes ids ≥ 21 (`BATCH_FIRST_ID`), so the tool reads the **shipped** 16 keys
plus nothing it authored itself.

Captures for this pass: `$TMPDIR/lv012-frame-p.txt`, `$TMPDIR/lv012-g-census-final.txt`,
`$TMPDIR/g-lattice-p5q5.txt`, `$TMPDIR/lv012-cx2-p4q4-final.json`, `$TMPDIR/lv012-s-dry.txt`.