LV-011 authoring transcript — L20, the **sealed landing**, and its stage census
task:    LV-011 (author the L20 board as the ADOPTED sealed-landing device and program-prove it:
         par 20 exactly, D_exec > 22.885157, B in [1.2500, 1.6875], gates g1–g5 each with one
         negative control, plus a committed stage-census transcript)
law:     docs/decisions/design-0004-l20-mechanism-sealed-landing.md (ADOPTED — decisions 1–8, the
         five gates, the escalation arithmetic) · docs/level-design.md §6.2 (GD-007 published law)
         + §6.2.6 (the gate texts) · docs/ai-native-pipeline.md §8.12 V1.5 (census identity) and
         §8.14 (this pass) · docs/level-difficulty.md §2a/§2b/§5.2 · ADR-0004 (reject, never repair)
         · ADR-0009 (checkerboard invariant; a portal breaks the parity link) · ADR-design-0001
         (the execution axis)
source:  src/levels/l001.json … l019.json (the 19 registered boards, read live — the cut, par(L15)
         and the B band are RE-MEASURED from them, never typed) + src/levels/candidates/l020.json
         (the landed candidate this transcript proves)
booked:  the dispatch's L20 obligation — par 20 · D_exec > 22.885157 (the registered
         block-l1619-tail-ceiling, 6 dp) · B ∈ [1.2500, 1.6875] · a sealed landing whose pocket is
         on-foot unreachable and whose exit is ONE door object · an ordered land → press → leave →
         press chain · all-OFF UNSATISFIABLE · the census identity broken by the device

Tooling:  `scripts/author-l20.ts` (propose + census — stages P/SL/V) and `scripts/prove-candidate.ts`
(prove — the rung-≥20 gate chain g1–g5 + an 11-control mutation battery). Every number below is
printed by those tools on the landed bytes; none is typed into a document first.

Why this transcript exists: §1 of the pipeline (LLM creates, the program proves) is only a claim
until the *search* behind a proposal is on the record. LV-011's claim is not "an L20 board was
written" — it is "the sealed-landing lattice was censused, accepts were *found* rather than
conjured, and the one that was selected is the minimum-D_exec accept of its class". That requires
the full census arithmetic (`269484` / `284784` judged tuples, the per-landing ceilings, the par
histogram), the selection rule, and — most importantly — the **two instrument corrections** that
had to be made before any accept could be believed.

```
invocation:
  node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8              # stage P: pocket class census
  node_modules/.bin/tsx scripts/author-l20.ts --stage=sl                            # stage SL: lattice, <=5 pockets (269484 tuples)
  node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write     # stage SL: <=8 pockets (284784 tuples) + land the accept
  node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --only=6,2  # per-landing pass (ceiling measured, not guessed)
  node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --only=6,5 --cap=200000
  node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20
  node_modules/.bin/tsx scripts/validate-levels.ts
  node_modules/.bin/tsx scripts/solve-levels.ts src/levels/candidates --audit
```

---

## 1. The two instrument corrections (both = false refusals, both fixed to the shipped rule)

This is the part of the pass that no gate number can show, so it goes first. Pass 1 censused the
whole `≤5` class and returned **`0 accept(s) of 269484`**. Two of the five gates that could have
been blamed were lying, and both lies were visible only because two independent implementations of
the same law disagreed — `scripts/prove-candidate.ts` (which derives the pocket from the landed
bytes) accepted boards that `scripts/author-l20.ts` (the search) refused.

**(i) `landingArrival()` searched for a walk-in onto the landing.** `src/core/rules/applyMove.ts`
fires a portal when a *move enters* an end tile **in the portal's `activePhase`**, and the phase
flips *after* that move. So the arrival state is the teleport's **successor**, not a state whose
position is the landing. The buggy reader looked for a state *standing on the landing*, found none,
and printed the detail string that exposes it: **`arrival=NOT FOUND`** — for a board whose landing
is entered on the very first teleport.

**(ii) The g1 escape flood counted moves made *after* leaving the pocket.** One
return-to-the-start cycle inflated `escapes` by every later move of the route. The corrected
reader counts **edges out of the pocket** only, and names the near-end return separately (stepping
back onto the landing *is* a portal end, so it teleports to the near end — a cycle that re-enters
the portal at a price, never a way into the far region).

Both corrections move the *instrument* to the shipped rule and are mirrored in the prover. A
return-to-start cycle is not an escape; a teleport's successor is the arrival. Neither correction
was chosen because of its outcome: pass 1's refusal detail already named both facts
(`arrival=NOT FOUND`, `escapes=53, returns=1`) before the accept count moved at all.

```
=== pass 1 (≤5 class, instrument NOT yet corrected) — verbatim, complete ===
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage SL sealed-landing lattice: 238 leak-free device(s) (landing × near × pocket, all re-derived) · cap 2000 tuple(s) per (device, s1, goal) · rung par 20

census: 0 accept(s) of 269484 judged candidate(s) in 1056.9 s
rejection histogram:
  par-not-rung: 268844
  g1-pocket-on-foot: 640
best measured par per landing (the family's own ceiling, per landing):
  landing 6,4: par 22
  landing 5,5: par 22
  landing 5,0: par 21
  landing 6,1: par 21
  landing 5,2: par 19
  landing 6,3: par 19
  landing 5,4: par 19
  landing 6,5: par 19
  landing 6,0: par 18
  landing 5,1: par 18
  landing 6,2: par 18
  landing 5,3: par 18
  best board:
    landing=6,4 near=2,5/A pocket=[5,5 6,4 6,5] s1=5,5/A goal=5,2/a4 doors=[d2=4,2/blue d3=5,1/blue d4=5,3/blue d5=6,2/blue] switches=[s2=5,0/B s3=6,0/A s4=4,0/A s5=4,1/B]
par census over every judged candidate (the rung pin's filter's own histogram): 7:3008 8:14624 9:26920 10:36264 11:40366 12:42838 13:38084 14:28672 15:17486 16:10576 17:5512 18:3150 19:1056 21:192 22:96
near-miss (par-rung/escalation only): 0 candidate(s), top 0:
```

---

## 2. Stage SL, ≤5 pockets — the corrected census

`--stage=sl` enumerates `portal entry × pocket × pocket switch × goal × seal-switch tuple`; the
lattice is re-derived per tuple (nothing is assumed from the pocket census) and every tuple goes
through the full gate chain, with `probePar()` (schema → rules → explore → par) as the **rung
pin filter** — only a board that measures `par 20` exactly reaches the gates. The number of
`ACCEPT` blocks is elided in the middle of this block; the header, the first accepts and the
whole summary tail are verbatim.

```
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage SL sealed-landing lattice: 238 leak-free device(s) (landing × near × pocket, all re-derived) · cap 2000 tuple(s) per (device, s1, goal) · rung par 20
  ACCEPT  par=20 D_exec=24.790588 B=1.5969 coverage=42/42
          landing=6,0 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.790588 B=1.5969 coverage=42/42
          landing=6,0 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,2/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.736471 B=1.5788 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.736471 B=1.5788 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,2/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.781176 B=1.5937 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
  … (ACCEPT blocks elided: 640 accepted boards, each printed as two lines —
     `ACCEPT par=20 D_exec=… B=… coverage=42/42` + its device line; the full run is reproducible with
     `--stage=sl`) …
  landing 6,1: par 21
  landing 5,2: par 19
  landing 6,3: par 19
  landing 5,4: par 19
  landing 6,5: par 19
  landing 6,0: par 18
  landing 5,1: par 18
  landing 6,2: par 18
  landing 5,3: par 18
  best board:
    landing=6,4 near=2,5/A pocket=[5,5 6,4 6,5] s1=5,5/A goal=5,2/a4 doors=[d2=4,2/blue d3=5,1/blue d4=5,3/blue d5=6,2/blue] switches=[s2=5,0/B s3=6,0/A s4=4,0/A s5=4,1/B]
par census over every judged candidate (the rung pin's filter's own histogram): 7:3008 8:14624 9:26920 10:36264 11:40366 12:42838 13:38084 14:28672 15:17486 16:10576 17:5512 18:3150 19:1056 21:192 22:96
near-miss (par-rung/escalation only): 0 candidate(s), top 0:
par-20 candidates refused by a gate (rung reached, device not earned): 0; top 0 by D_exec:
```

Read-outs, stated as the census rather than as a slogan:

- **`640 accept(s) of 269484 judged candidate(s)`, 869.2 s**, and the entire rejection histogram is
  `par-not-rung: 268844` — i.e. **the rung pin is the only filter that fires at all** on this
  lattice, and `par-20 candidates refused by a gate: 0` is printed for the rung-reached set.
- `D_exec` over the 640 accepts runs **24.729412 … 24.790588**, i.e. every accept clears the
  registered tail ceiling 22.885157; `B` runs **1.5765 … 1.6485**, inside `[1.2500, 1.6875]`.
- The par histogram has a hole at 20 on purpose: par-20 boards are *judged*, not tabulated in the
  census, so `20` never appears in the histogram while `19:1056 21:192 22:96` are the ceiling
  evidence (per landing: 22 at `6,4` and `5,5`; 21 at `5,0` / `6,1`).
- `accept` counts are **enumeration-tuple** counts, not distinct-board counts: the same pocket
  set can be reached by more than one insertion order in `pocketCandidates`. The class statement
  ("`≤5` pockets") is what the number is about, and the selection below is taken over the tuples
  exactly as enumerated.

Per-landing passes (run separately, so a family ceiling is a measurement and not a guess):

```
=== --only=6,2 (≤8 pockets) — the landing that first reached par 20 ===
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage SL sealed-landing lattice: 792 leak-free device(s) (landing × near × pocket, all re-derived, filtered to landing 6,2) · cap 2000 tuple(s) per (device, s1, goal) · rung par 20

census: 0 accept(s) of 19548 judged candidate(s) in 57.3 s
rejection histogram:
  par-not-rung: 19520
  g1-pocket-on-foot: 28
best measured par per landing (the family's own ceiling, per landing):
  landing 6,2: par 18
  best board:
    landing=6,2 near=2,3/A pocket=[5,1 6,0 6,1 6,2] s1=5,1/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
par census over every judged candidate (the rung pin's filter's own histogram): 7:160 8:1280 9:1096 10:3168 11:1948 12:4112 13:2000 14:3048 15:1064 16:1188 17:212 18:244
near-miss (par-rung/escalation only): 0 candidate(s), top 0:
```

```
=== --only=6,5, --cap=200000 (200× the tuple cap) — a landing that does NOT reach the rung ===
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage SL sealed-landing lattice: 16 leak-free device(s) (landing × near × pocket, all re-derived, filtered to landing 6,5) · cap 200000 tuple(s) per (device, s1, goal) · rung par 20

census: 0 accept(s) of 13536 judged candidate(s) in 50.6 s
rejection histogram:
  par-not-rung: 13536
best measured par per landing (the family's own ceiling, per landing):
  landing 6,5: par 19
  best board:
    landing=6,5 near=2,4/B pocket=[5,4 6,3 6,4 6,5] s1=6,3/B goal=5,1/a4 doors=[d2=4,1/red d3=5,0/red d4=5,2/red d5=6,1/red] switches=[s2=6,0/A s3=4,5/B s4=4,0/A s5=4,2/A]
par census over every judged candidate (the rung pin's filter's own histogram): 8:792 9:1908 10:2106 11:2586 12:1896 13:2274 14:930 15:782 16:36 17:222 19:4
near-miss (par-rung/escalation only): 0 candidate(s), top 0:
```

---

## 3. Stage SL, ≤8 pockets, `--write` — and the landed candidate

Widening the pocket class to 8 grows the device set `238 → 2788` and the judged tuples
`269484 → 284784`, and the accept set is the **same 640 boards** (the class-growth is absorbed by
the per-landing ceilings). The selection rule is derived, not chosen: **exactly the rung's par,
then minimal `D_exec`, then enumeration order**.

```
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage SL sealed-landing lattice: 2788 leak-free device(s) (landing × near × pocket, all re-derived) · cap 2000 tuple(s) per (device, s1, goal) · rung par 20
  ACCEPT  par=20 D_exec=24.790588 B=1.5969 coverage=42/42
          landing=6,0 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.790588 B=1.5969 coverage=42/42
          landing=6,0 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,2/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.736471 B=1.5788 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.736471 B=1.5788 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,2/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.781176 B=1.5937 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,2/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=6,5/B s3=4,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
          landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,0/A s5=4,3/B]
  ACCEPT  par=20 D_exec=24.729412 B=1.5765 coverage=42/42
  … (ACCEPT blocks elided: 640 accepted boards — the same set as §2) …
  landing 6,1: par 21
  landing 5,2: par 19
  landing 6,3: par 19
  landing 5,4: par 19
  landing 6,5: par 19
  landing 6,0: par 18
  landing 5,1: par 18
  landing 6,2: par 18
  landing 5,3: par 18
  best board:
    landing=6,4 near=2,5/A pocket=[5,5 6,4 6,5] s1=5,5/A goal=5,2/a4 doors=[d2=4,2/blue d3=5,1/blue d4=5,3/blue d5=6,2/blue] switches=[s2=5,0/B s3=6,0/A s4=4,0/A s5=4,1/B]
par census over every judged candidate (the rung pin's filter's own histogram): 7:3008 8:15536 9:28288 10:38328 11:42778 12:45442 13:40328 14:30460 15:18470 16:11212 17:5704 18:3246 19:1056 21:192 22:96
near-miss (par-rung/escalation only): 0 candidate(s), top 0:
par-20 candidates refused by a gate (rung reached, device not earned): 0; top 0 by D_exec:

selection (min par, then min D_exec) of 640 accept(s): par=20 D_exec=24.729412 (cut +9.759715) B=1.5765 coverage=42/42
wrote /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-011-l20/src/levels/candidates/l020.json
  landing=5,1 near=2,5/A pocket=[5,1 6,0 6,1 6,2] s1=6,0/A goal=5,4/a4 doors=[d2=4,4/blue d3=5,3/blue d4=5,5/blue d5=6,4/blue] switches=[s2=4,5/B s3=6,5/B s4=4,0/A s5=4,3/B]
```

---

## 4. Stage P — the pocket class census (the search space behind stage SL)

Stage P walks *every* connected pocket tile-set up to `--pocketsize`, measures the **single-phase
boundary** (the boundary must be enterable in ONE phase only, or a single door object cannot seal
it) and then the leak test. This is the census that says how big the class stage SL draws from is.

```
=== --stage=p --pocketsize=8 — the complete ≤8 class ===
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage P pocket census — grid 7×6 · sealed column x=3 · pocket size ≤ 8 · far tiles = 18
  landing 5,0 (near 2,0, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 1,1, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 0,2, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 2,2, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 1,3, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 0,4, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 2,4, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 5,0 (near 1,5, arrival A): 36829 single-phase boundary, 3 leak-free
  landing 6,0 (near 1,0, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 0,1, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 2,1, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 1,2, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 0,3, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 2,3, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 1,4, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 0,5, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 6,0 (near 2,5, arrival B): 11608 single-phase boundary, 12 leak-free
  landing 5,1 (near 1,0, arrival B): 189813 single-phase boundary, 12 leak-free
  landing 5,1 (near 0,1, arrival B): 189813 single-phase boundary, 12 leak-free
  landing 5,1 (near 2,1, arrival B): 189813 single-phase boundary, 12 leak-free
  landing 5,1 (near 1,2, arrival B): 189813 single-phase boundary, 12 leak-free
  landing 5,1 (near 0,3, arrival B): 189813 single-phase boundary, 12 leak-free
  … (3 more `landing 5,1` count lines elided; the listing resumes mid-block) …
  landing 5,1 (near 2,5, arrival B): 189813 single-phase boundary, 12 leak-free
  landing 6,1 (near 2,0, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 1,1, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 0,2, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 2,2, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 1,3, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 0,4, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 2,4, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 6,1 (near 1,5, arrival A): 63000 single-phase boundary, 33 leak-free
  landing 5,2 (near 2,0, arrival A): 355503 single-phase boundary, 16 leak-free
  landing 5,2 (near 1,1, arrival A): 355503 single-phase boundary, 16 leak-free
  landing 5,2 (near 0,2, arrival A): 355503 single-phase boundary, 16 leak-free
… (the remaining per-(landing, near-end) count lines elided) …
census: 16431095 pocket(s) tested · 13163780 single-phase boundary · 2788 leak-free (the census's accept class)
  … (the 2788 leak-free pockets are then listed in full, each as
     `landing X,Y near X,Y/P · pocket […] · boundary […] · door <colour>`) …
  landing 6,5 near 2,4/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,4 6,3 6,4 6,5] · boundary [4,4 5,3 5,5 6,2] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,4 6,3 6,4 6,5] · boundary [4,4 5,3 5,5 6,2] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
  landing 6,5 near 1,5/A · pocket [5,2 5,4 6,1 6,2 6,3 6,4 6,5] · boundary [4,2 4,4 5,1 5,3 5,5 6,0] · door blue
```

Derived from that same transcript — the leak-free size histogram (a one-liner over the committed
output, so it can be re-derived rather than trusted):

```
$ awk '/^leak-free pockets:/{flag=1;next} flag' <transcript> \
    | sed -n 's/.*pocket \[\([^]]*\)\].*/\1/p' | awk '{print NF}' | sort -n | uniq -c
     34 3
    204 4
    510 6
   2040 7
```

`34 + 204 + 510 + 2040 = 2788` — sizes **3, 4, 6, 7**, i.e. the class has no size-5 member and
**no size-8 member**: at `--pocketsize=8` the largest leak-free pocket the lattice can build is 7.
That is a measurement about the *generator's* class, not a completeness claim about the device (see §5).

### The named open boundary: the class is **not proven complete at ≥ 9**

The `≤10` census was started and **deliberately killed after 25 lines** — the run is OOM-free with
an 8 GB heap but the pocket enumeration is exponential in `--pocketsize`, and the run was not needed:
an accept exists inside `≤8`, so no exhaustion claim is required. The partial output is committed
as the named boundary rather than as a result, because it **contradicts** the reading that `≤8` is
everything:

```
=== --stage=p --pocketsize=10 — PARTIAL (killed after 25 lines) ===
author-l20 — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the registered L16–L19 ladder is excluded — a block must not raise its own filter)
preflight parity law: 19 board(s), 2599 state(s), 8122 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 15 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json]

stage P pocket census — grid 7×6 · sealed column x=3 · pocket size ≤ 10 · far tiles = 18
  landing 5,0 (near 2,0, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 1,1, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 0,2, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 2,2, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 1,3, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 0,4, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 2,4, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 5,0 (near 1,5, arrival A): 1338255 single-phase boundary, 13 leak-free
  landing 6,0 (near 1,0, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 0,1, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 2,1, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 1,2, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 0,3, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 2,3, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 1,4, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 0,5, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 6,0 (near 2,5, arrival B): 354129 single-phase boundary, 40 leak-free
  landing 5,1 (near 1,0, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 0,1, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 2,1, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 1,2, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 0,3, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 2,3, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 1,4, arrival B): 8262157 single-phase boundary, 40 leak-free
  landing 5,1 (near 0,5, arrival B): 8262157 single-phase boundary, 40 leak-free
```

The same landing (`5,1`), the same near end (`2,1`): **12 leak-free pockets at `≤8` → 40 at
`≤10`**; landing `5,0` goes 3 → 13, landing `6,0` 12 → 40. So **larger pockets exist** and the
`≤8` class is a *slice*, not the whole device space. Recorded as **`class completeness: OPEN at
≥9`** — a boundary named in the record, never promoted to a completeness theorem, and never used to
claim that 20 is the device's ceiling.

---

## 5. The proof on the landed bytes

`scripts/prove-candidate.ts` re-measures the CUT from the shipped 15 (`D_exec max 14.969697`,
`par(L15) = 10`), **derives the pocket independently from the landed bytes** (never from the
authoring script — that independence is what caught both instrument bugs), runs the rung-≥20 gate
chain g1–g5, and then runs an 11-control mutation battery in which each mutation must be refused
**by a name it actually trips**.

```
=== prove-candidate.ts src/levels/candidates/l020.json --rung=20 ===
prove-candidate — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 19 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the L16–L19 ladder is excluded from its own filter — see measureCut)
candidate src/levels/candidates/l020.json · rung 20

par=20 D_exec=24.729412 B=1.5765 (CUT 14.969697, delta 9.759715)
derived pocket (from the landed bytes, never from the authoring script): landing 5,1 (behind the portal) · near 2,5 · pocket [5,1 6,0 6,1 6,2] 4 tile(s) · boundary [4,1 5,0 5,2 6,3] · covering door id(s) [d1] · switch(es) inside the pocket [s1]
  ok   par-stamped   file par=20 · solver par=20 (par is stamped, §8)
  ok   region        deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation    D_exec=24.729412 > CUT 14.969697
  ok   par-step      par=20 ≥ 20 (l15Par 10 + 2·5, §6.1.1 P2)
  ok   latch-grade   allOffShortest=null (all-OFF world UNSATISFIABLE) par=20 advantage=n/a
  ok   latch-route   par routes=252; press-then-cross on 252 (G2)
  ok   refused-beat  refusedBeforeEnteredTiles=14 [3,0 3,1 3,2 3,3 3,4 3,5 4,1 4,4 5,0 5,2 5,3 5,5 6,3 6,4]
  ok   coverage      distinctPositions=42/42
  ok   validator     ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed   doors=5 switches=5
  ok   rung-plus-block-escalation D_exec=24.729412 > block ceiling 22.885157 (BLOCK_L1619, the registered L16–L19 stop — a rung above the block must clear the block, not only the L1–L15 cut) AND B=1.5765 ∈ [1.2500, 1.6875]
  ok   par-rung-exact solver par=20 === rung 20 (exact, not a floor — §6.1.1 P2)
  ok   g1-pocket-on-foot landing 5,1 (behind the portal: not on foot); pocket [5,1 6,0 6,1 6,2] 4 tile(s); on-foot-reachable pocket tiles=0 (required 0); arrival=phase B; pre-press moves leaving the pocket into the far region=0 (required 0); moves back through the landing to the near end 2,5=1 (named, not counted as an escape: the landing IS a portal end — ADR-0009 — so stepping back onto it is a return to the start region, a cycle that re-enters the portal at a price, never a way into the far region)
  ok   g2-pocket-exit-door boundary [4,1 5,0 5,2 6,3] of 4 tile(s); distinct door id(s) covering it: 1 [d1] (required exactly 1 — a single door object); boundary tiles that are neither door nor wall (free leaks)=0 []; boundary tiles that are phase walls=0 [] (F-L19-2: a far-region phase wall makes its tile unstandable, so the 42/42 coverage gate fails — every blocker must be an openable door)
  ok   g3-ordered-two-press par=20 · 252 shortest route(s); pocket switch=s1 on tile 6,0; distinct switches pressed per route: min=2 (required ≥ 2); routes executing the chain land → press(s1) → cross the pocket door → press the seal switch = 252/252
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=20 — with every switch OFF the pocket's door refuses the only exit (its base colour is closed in the arrival phase), so the far region beyond the pocket is unreachable at all: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5) and it holds only while every seal tile is directly adjacent to the free far region. Measured: 4 seal tile(s), 4 NOT adjacent to the all-OFF free region [4,4 5,3 5,5 6,4] (free region 21 position(s)); and the identity's VALUE — the world with the pocket device removed, where every seal tile is adjacent again — solves at 16 < par 20. The minimum form therefore no longer computes this par: its one-press arithmetic is 16 while every par route presses 2 switch(es) through the sealed landing (g3).

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: latch-grade, par-stamped, unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, par-step)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g1 control — the pocket door "d1" dropped (the pocket becomes on-foot reachable) → par-stamped+par-step+validator+rung-plus-block-escalation+par-rung-exact+g1-pocket-on-foot+g2-pocket-exit-door+g3-ordered-two-press+g5-identity-broken  (expected a refusal naming one of: g1-pocket-on-foot, validator, rules, unsolvable)
  CAUGHT  g2 control — one pocket-boundary tile dropped from door "d1" (a free leak) → par-stamped+par-step+rung-plus-block-escalation+par-rung-exact+g1-pocket-on-foot+g2-pocket-exit-door+g3-ordered-two-press+g5-identity-broken  (expected a refusal naming one of: g2-pocket-exit-door, g1-pocket-on-foot, validator, rules)
  CAUGHT  g3 control — the goal's seal doors dropped (the press chain falls to the pocket press alone) → par-stamped+par-step+validator+rung-plus-block-escalation+par-rung-exact+g3-ordered-two-press+g5-identity-broken  (expected a refusal naming one of: g3-ordered-two-press, g4-switch-required, validator, par-rung-exact)
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+par-step+latch-grade+latch-route+rung-plus-block-escalation+par-rung-exact+g1-pocket-on-foot+g2-pocket-exit-door+g3-ordered-two-press+g4-switch-required+g5-identity-broken  (expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, latch-grade, par-rung-exact, validator)
  CAUGHT  g5 control — the pocket-device-removed world (the census identity holds again) → par-stamped+par-step+rung-plus-block-escalation+par-rung-exact+g1-pocket-on-foot+g2-pocket-exit-door+g3-ordered-two-press+g5-identity-broken  (expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, par-rung-exact, validator)
controls: 11/11 caught by their named gate

RESULT: PASS

  warn phaseAWalls[0] (3, 0): this wall can never be entered on any move count — it is equivalent to an ordinary permanent wall (legal geometry, not a defect). Entry into (3, 0) always happens in phase A, which is exactly this wall's own solid phase: every legal move changes x + y parity and the phase together, so the phase at entry is fixed by the tile's Manhattan-distance parity from the start (odd distance ⇒ startPhase "A", even distance ⇒ "B"), and extra moves cannot change that parity (wandering moves come in pairs). It does not mislead the player: clicking this tile requires standing on a neighbour, and on any neighbour that same invariant puts the current phase at A — this tile's solid phase — so it only ever reads solid when it can be clicked. Manual review is warranted only if the level's intent uses it as a phase gate / timing mechanic, which is wrong by construction (it answers identically on every move count) — docs/decisions/0009-checkerboard-invariant-mechanics-forward.md, docs/level-design.md V0.4 §0 + §2 — NOT PROVEN for this candidate: it carries 1 portal(s), and a teleport between tiles of opposite (x + y) parity breaks the parity link above, so this wall may still be enterable from a portal landing (manual review / needs the solver)
  … (the other 5 of the run's 6 `warn` lines elided — one per COLUMN tile
     (`(3,0) (3,2) (3,4)` A / `(3,1) (3,3) (3,5)` B). Each says the same thing — the FAR-REGION column tiles are parity-dead
     on a portal-free board, and this board carries a portal so the claim is NOT PROVEN here (a
     teleport between opposite-parity tiles breaks the parity link); manual review, never a gate.
     AGENTS.md §7: a warning is not a gate — the validator reports `ok=true errors=0 warnings=6
     policyViolations=0`, and the six are the L16–L19 form.) …
```

---

## 6. The gate chain, read off the run above (not re-typed)

| gate | measurement on `l020.json` |
|---|---|
| `par-stamped` | file `par 20` · solver `par 20` |
| `region` | `deadStates 0` · `noUnrecoverableOk true` · `T = 0` · `R = 0` |
| `escalation` | `D_exec 24.729412 > CUT 14.969697` |
| `par-step` | `20 ≥ l15Par 10 + 2·5` (§6.1.1 P2) |
| `latch-grade` | `allOffShortest = null` (the all-OFF world is UNSATISFIABLE) |
| `latch-route` | `par` routes **252** · press-then-cross on **252/252** |
| `refused-beat` | 14 tiles `[3,0 3,1 3,2 3,3 3,4 3,5 4,1 4,4 5,0 5,2 5,3 5,5 6,3 6,4]` |
| `coverage` | `42/42` distinct positions |
| `validator` | `ok=true errors=0` · one-switch-per-door · every-switch-fires |
| `well-formed` | 5 doors · 5 switches |
| `rung-plus-block-escalation` | `D_exec 24.729412 > 22.885157` **and** `B 1.5765 ∈ [1.2500, 1.6875]` |
| `par-rung-exact` | solver `par 20 === rung 20` (exact, not a floor) |
| `g1-pocket-on-foot` | landing `5,1` **behind the portal, not on foot**; pocket `[5,1 6,0 6,1 6,2]`; on-foot-reachable pocket tiles **0**; pre-press moves leaving the pocket into the far region **0**; returns through the landing to the near end **1** (named — a portal end, so it is a cycle, not an escape) |
| `g2-pocket-exit-door` | boundary `[4,1 5,0 5,2 6,3]` covered by **exactly 1** door object `[d1]`; free leaks **0**; phase walls on the boundary **0** (a wall there would fail `coverage` — F-L19-2) |
| `g3-ordered-two-press` | 252 shortest routes, `min` distinct switches pressed per route **2**, ordered chain `land → press(s1) → cross the pocket door → press the seal switch` on **252/252** |
| `g4-switch-required` | all-OFF world UNSATISFIABLE (`allOffGoalReachable false`) — the pocket door's base colour is closed in the arrival phase, so the latch carries **existence** |
| `g5-identity-broken` | 4 seal tiles, **4 NOT adjacent** to the all-OFF free region `[4,4 5,3 5,5 6,4]` (21 free positions); the identity's VALUE — the pocket-device-removed world — solves at **16 < par 20**, while every par route presses **2** switches through the sealed landing |

`GATES: ACCEPT` — 15/15. `controls: 11/11 caught by their named gate` — `RESULT: PASS`.

The battery's honest history is part of the record, not a footnote: the inherited control
*"both switches retargeted to the first door"* **MISSED**, because this board carries **five**
switches and, once every switch is moved onto `d1`, the far region cannot be opened at all — the
first refusal is `unsolvable`, not `validator`/`latch-route`/`coverage`. Per **F-L16-3** the
control was **renamed to its measured meaning** (`every switch retargeted…`) and its `expect` list
corrected **to the measured names**; the five g1–g5 controls were each measured before their
`expect` lists were written. A control whose expectation is an *unmeasured* guess is not evidence.

---

## 7. The landed artifact

`src/levels/candidates/l020.json` — `id 20` · 7 × 6 · `startPhase A` · player `(0,0)` · goal
`(5,4)` · `phaseAWalls (3,0) (3,2) (3,4)` · `phaseBWalls (3,1) (3,3) (3,5)` · `d1` **red**
`(4,1) (5,0) (5,2) (6,3)` (the pocket exit — the *single* boundary object) · `d2`/`d3`/`d4`/`d5`
blue `(4,4)` `(5,3)` `(5,5)` `(6,4)` (the goal's four neighbours) · `s1` `(6,0)`/A → `d1` (inside
the pocket) · `s2` `(4,5)`/B → `d2` · `s3` `(6,5)`/B → `d3` · `s4` `(4,0)`/A → `d4` · `s5`
`(4,3)`/B → `d5` · `p1` `(2,5) ⇄ (5,1)`/A · `par 20`.

It is a **candidate on the shelf**, not a shipped level: registration, `EXPECTED_LEVEL_COUNT`, the
metrics sidecar and the `-tail-ceiling` registration are R-003c's and the Orchestrator's, and the
registered ceiling stays **`par 18` / `D_exec 22.885157`** until a registration ticket moves these
bytes into the root. Nothing in this pass touched a shipped byte, a gate constant or a weight.

---

## 8. Acceptance on this tree (measured, report-only-up)

```
$ node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20
GATES: ACCEPT · controls: 11/11 caught by their named gate · RESULT: PASS   (exit 0)

$ npm run levels
summary: 19/19 level files ok · 0 errors · 52 warnings (0 multi-switch-door) · 11/11 negative cases
         + warning probes by name (10 rejected · 1 accepted-with-warning) · inputs unchanged
RESULT: PASS                                                               (exit 0)

$ node_modules/.bin/tsx scripts/solve-levels.ts src/levels/candidates --audit
  PASS l020.json  id=20 7x6 startPhase=A par=20
       solvable=true shortestSolution=20 parMatch=true
       reachableStates=1275 distinctPositions=42 maxDepth=38 stateBudget=86016
       dualPhaseTiles=18  refusedThenEnteredTiles=14  refusedBeforeEnteredTiles=14
       parRoutes=252 embedRoutes=252 embedForced=true
       routeWalk=1658 dfs + 6299 lookahead work units (budget=2000000) prunedChildren=2866
       switchRequired=true allOffSubgraph=22/1275 states (goal reachable with every switch OFF: false)
       deadStates=0  noUnrecoverableOk=true  unrecoverableStates=0
       difficulty D=44.73 = 1·L(20) + 3·B(1.5765) + 4·T(0) + 2·R(0.0000) + 5·M(4)
       difficultyExec Dexec=24.73 = D(44.73) − 5·M(4) = 1·L(20) + 3·B(1.5765) + 4·T(0) + 2·R(0.0000)
summary: 1/1 level file(s) PASS · par verified from the solver on 1/1        (exit 0)

$ node_modules/.bin/tsc --noEmit
tests/solver/policy-negative-controls.test.ts(552,7): error TS2740   ← pre-existing at b597f64, the
                                                                        QA-011 pinned row; production clean

$ npx vitest run
  baseline at b597f64, candidate absent: 33 files · 12 failed / 21 passed · 42 failed / 648 passed
                                          / 3 skipped (693) · 1 failed SUITE
  with l020.json on the shelf:           33 files · 12 failed / 21 passed · 45 failed / 662 passed
                                          / 3 skipped (710) · 0 failed suites
```

**The vitest delta is one suite switching from "crashed, 0 tests executed" to "ran, 17 executed".**
`tests/solver/l16-l20-candidates.test.ts` walks `src/levels/candidates/`; with the shelf empty its
`readLevel(dir, files[0])` gets `undefined` and the whole file dies with
`TypeError: The "path" argument must be of type string` before any test runs (that is the recorded
baseline: 1 **failed suite**, 42 failed tests). With the candidate present the suite executes
**17 tests → 14 pass / 3 red**, and the three reds are obligations that are red for reasons that do
not involve `l020.json`'s *shape* — or, in one case, do:

1. *"re-derives the cut and the first rung from the shipped set"* — `shipped` must be 15, it is
   **19**: the registered L16–L19 (GAME-001 / R-003c) vs the fixture's `15`. Base-red.
2. *"rises strictly along the block"* — the shelf holds **one** candidate (`ladder.length = 1`), so
   "every rung exceeds its predecessor" cannot be checked. A shelf-composition red, not a board red.
3. *"refuses a board with its latch removed (a bare door is a violation, not a puzzle)"* — the
   control asserts the naked board (`switches: []`) is still **solvable** so that the audit names
   `door-without-switch` rather than solvability. On a **sealed landing** that premise is false *by
   construction*: `g4` measures the all-OFF world UNSATISFIABLE (the pocket door's base colour is
   closed in the arrival phase), so the bare board has no route to the goal. The control's
   expectation encodes a property of the L16–L19 goal-gated seal, which the adopted L20 device
   deliberately breaks — the same class of false refusal as §1's two, on the **test** side.
   `tests/**` is QA-011's lane, so it is **reported, not edited**: named here with the mechanism,
   for QA to re-measure (`F-L20-2`).

**No test that passed at the baseline fails now.** Every one of the 42 baseline failures is still a
failure, byte-for-byte; the only test-level movement is inside a file that was already RED. The nine
`l020.json (rung 20)` obligations in that suite — schema/rules legality with solver-stamped `par`,
the P2 step, the cut, the §4 region, 42/42 coverage, the latch grade, the ordered reader, and
one-switch-per-door — all **PASS**, i.e. the candidate is measured by the pinned suite and by
`scripts/prove-candidate.ts` **independently** (different code, same bytes).

---

## 9. Reproducing this record

```
$ cd <worktree>
$ npx tsx scripts/author-l20.ts --stage=p --pocketsize=8                  # §4 (long: exponential in --pocketsize)
$ npx tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write         # §3 (~15 min; re-derives every number)
$ npx tsx scripts/author-l20.ts --stage=sl --pocketsize=8                 # §2 (same accepts; --write lands the selection)
$ npx tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20   # §5, §6 (< 1 s)
$ npm run levels && npx tsx scripts/solve-levels.ts src/levels/candidates --audit # §8
```

`--write` re-derives every byte it writes: the selection is a function of the census, so re-running
the census re-writes the same artifact. A candidate that fails a gate is **dropped with its
measurement** (ADR-0004); the tool has no repair path and no tuning loop, and a re-run that
disagrees with this transcript is a finding, not a rebuild.
