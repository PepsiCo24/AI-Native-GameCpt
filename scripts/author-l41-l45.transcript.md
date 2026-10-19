# LV-018 — the authoring side of Act III's OPENER (`l041`…`l045`, **shelf candidates**, unregistered)

Proposal and census record for the **opening** batch of Act III, the first rungs of the act whose law is
`GD-012` (`docs/level-design.md` §7.10, **ADOPTED + USER-APPROVED 2026-10-19**). The proving side is
`scripts/prove-candidate-l4145.transcript.md`; **nothing here may be read as a proof** — every `par`,
`D_exec`, `B`, coverage and gate number below is printed by the shipped solver path
(`@/core/solver/*`, `@/core/rules`), and the proof file re-measures them from the landed bytes.

**Law-before-bytes, git-dated, three deep.** The clause this batch executes is §7.10.2's opener ladder
`[20, 22, 24, 26, 26]` with its clauses **O1–O6**, read from the law module (`ACT_III_OPENER_PAR_MULTISET`
and friends in `src/core/solver/policy.ts`) and never re-derived here. The device, the frame, the
NON-CLAIM, the relief fill-in procedure, the published fallback and the derived falsification probe were
published in the tool's header **before any census ran and before any byte existed** (`b28ed97`, "LV-018
step 0", docstring alone — 148 added / 0 removed / 0 non-comment lines); the machinery that makes the rule
executable follows; then this census record lands; **the five bytes land in the commit that follows this
one.** §7.10.4's relief value is a **FILL-IN BEFORE THE BYTES, NEVER AFTER** — the exact `ΔD_exec` is
computed in §4 below from L41's measured rung and pasted into the law module in the commit that carries
this file, i.e. one commit before `l041.json` exists. Every ordering is checkable in `git log -p` and none
of it can be back-dated.

**This batch is a SHELF batch.** `src/levels/candidates/l041.json`…`l045.json` are invisible to every
shipped-set census (the root walk is **non-recursive**), so `npm run levels` must stay at **40/40** and
`docs/level-difficulty.report.json` (40 records) must **not** be regenerated. Registration — the
`src/game/levels/level-registry.ts` row, the id block law, `EXPECTED_LEVEL_COUNT` and the sidecar — is a
**different lane** and is named as the handoff in §6. `tests/**` is **off this lane**.

The commands, in order (each one is the exact command whose output is quoted below):

```
STEP 1 — the frame's capacity, and an upstream reading
  a) npx tsx scripts/author-l21.ts --stage=roomcap --act=3 --batch=5 --cx=1 --h=7 --maxsize=4
     (the same command WITHOUT --batch=5 was run first; the ONLY differing bytes are the two banner
      lines — the room enumeration is byte-identical, which is why the banner form is the one quoted.
      --stage=roomcap has no batch, so without the flag the law-surface banner falsely reports
      "MISMATCH — the law module and this tool disagree about L41–L45"; named here rather than hidden.)
STEP 2 — the batch's own pool over the full act band, on its own frame
  b) npx tsx scripts/author-l21.ts --stage=g --act=3 --batch=5 --pockets=4 --cx=1 --h=7 \
       --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=20 --parmax=28 \
       --accepts=/tmp/lv018-act3-b5-accepts.json                                (158.1 s, exit 0)
STEP 3 — the selection (dry run, then --write)
  c) npx tsx scripts/author-l21.ts --stage=s --act=3 --batch=5 --parmin=20 --parmax=28 \
       --accepts=/tmp/lv018-act3-b5-accepts.json                                (exit 0)
  d) the identical command with --write                                          (the NEXT commit)
STEP 4 — the proof (separate file, separate commit)
  e) npx tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 \
       --dir=src/levels/candidates
     + --measure-controls, + the derived falsification probe, + solve-levels --audit
```

## 1. The frame, measured before the pool is read

§7.10.5's YAGNI clause and ADR-`design-0008` RULING D items 1–2 say the opener takes the **proven**
`4-pocket / 5-door / 5-press` class on the frame that family has already been proven on, rather than
opening a new axis. The frame's own capacity is therefore a **reading taken first**, not an argument made
afterwards:

```
author-l21 (G lattice, Act II batch 5 — the ACT III OPENER (L41–L45) on the proven 4-pocket/5-door/5-press class, Act III's own band) — CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = 14.969697 · Act I measured peak (ids 1–20) = 24.729412 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
act 3's law surface (read from the law module, never re-typed): par band [20, 28] inclusive · D_exec band [23.75, 33.0625] (printed [23.75, 33.06]; §7.9: the derived value is the operand) · §7.10.2's opener multiset [20, 22, 24, 26, 26] · O3's reservation margin 0.6875 · §7.3.1 instance 5 bound [-4.705319, -1.392819] vs the previous act's registered maximum 28.455319 (alias to Act II's registered tail 28.455319: identical, so the two cannot drift) · batch ids [41, 42, 43, 44, 45] vs this run's window L41–L45: identical
D2 orbit law — SIZES ONLY (PREDICTED, then MEASURED; accepts never inherit): σ_x : x ↦ 1 + 7 − x ⇒ K is orbit-constant; PREDICTED 14 orbit pair(s) of device counts equal, MEASURED 0/14 equal · 2,0=0 ↔ 6,0=18 DIFFERENT · 3,0=6 ↔ 5,0=27 DIFFERENT · 2,1=0 ↔ 6,1=27 DIFFERENT · 3,1=0 ↔ 5,1=12 DIFFERENT · 2,2=0 ↔ 6,2=30 DIFFERENT · 3,2=0 ↔ 5,2=6 DIFFERENT · 2,3=0 ↔ 6,3=30 DIFFERENT · 3,3=0 ↔ 5,3=6 DIFFERENT · 2,4=0 ↔ 6,4=30 DIFFERENT · 3,4=0 ↔ 5,4=6 DIFFERENT · 2,5=0 ↔ 6,5=27 DIFFERENT · 3,5=0 ↔ 5,5=12 DIFFERENT … (+2 pair(s))
CUT divergence receipt (F-L36-1): FROZEN L1–L15 floor 14.969697 vs the pre-fix basis's 28.455319 (Δ 13.485622) — the pre-fix list let the registered Act II rungs raise the floor and silently turned the escalation gate into "D_exec > the registered act tail"; the generator now reads ACT_II_REGISTERED_IDS, the same law constant the prover's own measureCut() reads
preflight parity law: 40 board(s), 16054 state(s), 44690 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 36 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json, l020.json, l021.json, l022.json, l023.json, l024.json, l025.json, l026.json, l027.json, l028.json, l029.json, l030.json, l031.json, l032.json, l033.json, l034.json, l035.json, l036.json, l037.json, l038.json, l039.json, l040.json]

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

class parity(0) arrival B (landing representative 2,0): 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] of which 3 are multi-tile (size ≥ 2 — a walk-sealed room the chain needs)
  maximum pairwise-disjoint set (tiles ∪ door tiles): 6 room(s)
    [3,0]←[2,0 3,1 4,0]
    [6,0]←[5,0 6,1]
    [4,2]←[3,2 4,1 4,3 5,2]
    [6,3]←[5,3 6,2 6,4]
    [3,4]←[2,4 3,3 3,5 4,4]
    [5,5]←[4,5 5,4 5,6 6,5]

class parity(1) arrival A (landing representative 3,0): 31 sealed room(s) [size 1:28 · size 3:1 · size 4:2] of which 3 are multi-tile (size ≥ 2 — a walk-sealed room the chain needs)
  maximum pairwise-disjoint set (tiles ∪ door tiles): 6 room(s)
    [3,0]←[2,0 3,1 4,0]
    [6,0]←[5,0 6,1]
    [4,2]←[3,2 4,1 4,3 5,2]
    [6,3]←[5,3 6,2 6,4]
    [3,4]←[2,4 3,3 3,5 4,4]
    [5,5]←[4,5 5,4 5,6 6,5]

class parity(1) arrival B (landing representative 3,0): 46 sealed room(s) [size 1:35 · size 3:3 · size 4:8] of which 11 are multi-tile (size ≥ 2 — a walk-sealed room the chain needs)
  maximum pairwise-disjoint set (tiles ∪ door tiles): 8 room(s)
    [2,0]←[2,1 3,0]
    [5,0]←[4,0 5,1 6,0]
    [3,2]←[2,2 3,1 3,3 4,2]
    [6,2]←[5,2 6,1 6,3]
    [2,4]←[2,3 2,5 3,4]
    [5,4]←[4,4 5,3 5,5 6,4]
    [3,6]←[2,6 3,5 4,6]
    [6,6]←[5,6 6,5]
```

*(raw output: `STEP 1a`)*


Two readings matter here, and both were published in the header before the run:

- **the ceiling is admitted but not consumed.** The `parity(0)/arrival A` and `parity(1)/arrival B`
  classes hold **46** sealed rooms with a maximum pairwise-disjoint set of **8**; the 5-door chain needs
  four sealed rooms *plus* the goal's own seal *plus* a free-banded `s2` tile, so the frame admits the
  device class. The opener **uses 4 pockets and 5 doors** and does **not** extend to a 5-pocket device: a
  5-pocket member is refused by §7.2's published family text and is **not censused here** (censusing a
  forbidden device is an invitation to a family change, which is a Game Designer decision).
- **the `H` (both-pair) composition and the XOR door are NOT in this opener.** That is a **NON-CLAIM**,
  not an oversight, and it is booked forward **by name** to Act III's second half in the rule commit. The
  reason is mechanical and stated so it can be falsified: a both-pair composition needs a
  *pocket-only-by-pair-2* forcing mechanism, whose gate family does not exist yet, and §7.5 requires **one
  negative control per new gate** — so introducing it is new gate law, i.e. a Game Designer + Architect
  decision with its own ADR, not a level ticket's business. Censusing it here would be manufacturing the
  evidence for a decision this lane does not own.

## 2. The pool census, and the identity that says it closes exactly

The band is a **filter, not a truncation** (§7.10.2 O5 reads the *pool*, not the accept count), so the
refusal ledger is printed beside the accepts and the run's accounting must close:

```
accepts + par-out-of-band + unsolvable + g5-identity-broken = judged
4402    + 7794            + 6643       + 1161                = 20000   ✓ exactly
in-band candidates refused by a gate: 1161 = the g5-identity-broken row
```

The last line is the load-bearing one: **every in-band refusal is the device's own structural law and not
one is a stray rule**, which is what makes "the pool by par" a statement about this device rather than
about the machinery (§7.7 item 5's shape). The run is a **prefix** — `devices walked 10/348`, the 40-group
cap hit on 9 devices, `global budget 20000 HIT` — so the accept counts are **floors** and are labelled as
floors everywhere they are quoted. `par 20` and `par 22` are non-empty, so §7.10.2's O5 clause ("a derived
par with an empty pool is ABSENT and is **never** substituted") has **nothing to drop** on this frame: all
five derived rungs are supported, the descending-fill branch is not exercised, and the STOP-AND-ROUTE
branch does **not** fire.

```
author-l21 (G lattice, Act II batch 5 — the ACT III OPENER (L41–L45) on the proven 4-pocket/5-door/5-press class, Act III's own band) — CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = 14.969697 · Act I measured peak (ids 1–20) = 24.729412 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
act 3's law surface (read from the law module, never re-typed): par band [20, 28] inclusive · D_exec band [23.75, 33.0625] (printed [23.75, 33.06]; §7.9: the derived value is the operand) · §7.10.2's opener multiset [20, 22, 24, 26, 26] · O3's reservation margin 0.6875 · §7.3.1 instance 5 bound [-4.705319, -1.392819] vs the previous act's registered maximum 28.455319 (alias to Act II's registered tail 28.455319: identical, so the two cannot drift) · batch ids [41, 42, 43, 44, 45] vs this run's window L41–L45: identical
D2 orbit law — SIZES ONLY (PREDICTED, then MEASURED; accepts never inherit): σ_x : x ↦ 1 + 7 − x ⇒ K is orbit-constant; PREDICTED 14 orbit pair(s) of device counts equal, MEASURED 0/14 equal · 2,0=0 ↔ 6,0=18 DIFFERENT · 3,0=6 ↔ 5,0=27 DIFFERENT · 2,1=0 ↔ 6,1=27 DIFFERENT · 3,1=0 ↔ 5,1=12 DIFFERENT · 2,2=0 ↔ 6,2=30 DIFFERENT · 3,2=0 ↔ 5,2=6 DIFFERENT · 2,3=0 ↔ 6,3=30 DIFFERENT · 3,3=0 ↔ 5,3=6 DIFFERENT · 2,4=0 ↔ 6,4=30 DIFFERENT · 3,4=0 ↔ 5,4=6 DIFFERENT · 2,5=0 ↔ 6,5=27 DIFFERENT · 3,5=0 ↔ 5,5=12 DIFFERENT … (+2 pair(s))
CUT divergence receipt (F-L36-1): FROZEN L1–L15 floor 14.969697 vs the pre-fix basis's 28.455319 (Δ 13.485622) — the pre-fix list let the registered Act II rungs raise the floor and silently turned the escalation gate into "D_exec > the registered act tail"; the generator now reads ACT_II_REGISTERED_IDS, the same law constant the prover's own measureCut() reads
preflight parity law: 40 board(s), 16054 state(s), 44690 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 36 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json, l020.json, l021.json, l022.json, l023.json, l024.json, l025.json, l026.json, l027.json, l028.json, l029.json, l030.json, l031.json, l032.json, l033.json, l034.json, l035.json, l036.json, l037.json, l038.json, l039.json, l040.json]

stage G 4-pocket sub-lattice (4-pocket, 4 pockets): 348 leak-free landing device(s) (landing × near × pocket ≤ 4) · R2, R3, R4 ≤ 4 tile(s) · 40 (R2,R3,R4) group(s)/device cap · 400 tuple(s)/group cap · 20000 judged tuple(s) budget · par band [20, 28] · D_exec band [23.75, 33.06] (derived-exact [23.75, 33.0625], §7.9)
  ACCEPT par=22 D_exec=26.299342 B=1.4331 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=21 D_exec=25.301087 B=1.4337 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=21 D_exec=25.326923 B=1.4423 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=24 D_exec=28.273026 B=1.4243 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=23 D_exec=27.275000 B=1.4250 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=23 D_exec=27.291667 B=1.4306 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=24 D_exec=28.279605 B=1.4265 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=23 D_exec=27.268478 B=1.4228 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=23 D_exec=27.282051 B=1.4274 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=26 D_exec=30.266447 B=1.4221 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=25 D_exec=29.255435 B=1.4185 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=25 D_exec=29.272436 B=1.4241 coverage=49/49 routes=54 chain=54/54
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=24 D_exec=28.263158 B=1.4211 coverage=49/49 routes=216 chain=216/216
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=23 D_exec=27.275000 B=1.4250 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=23 D_exec=27.298077 B=1.4327 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=26 D_exec=30.236842 B=1.4123 coverage=49/49 routes=216 chain=216/216
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=25 D_exec=29.248913 B=1.4163 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=25 D_exec=29.262821 B=1.4209 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,4] d4=[4,4 5,3 5,5 6,4]/blue s4=3,3/A s5=5,4/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=21 D_exec=25.284790 B=1.4283 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=23 D_exec=27.249191 B=1.4164 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=23 D_exec=27.233010 B=1.4110 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=25 D_exec=29.220065 B=1.4067 coverage=49/49 routes=108 chain=108/108
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=23 D_exec=27.268608 B=1.4229 coverage=49/49 routes=216 chain=216/216
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=25 D_exec=29.233010 B=1.4110 coverage=49/49 routes=216 chain=216/216
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[4,5] d4=[3,5 4,4 4,6 5,5]/blue s4=3,3/A s5=4,5/B goal=6,6 d5=[5,6 6,5]/red
  ACCEPT par=22 D_exec=26.315385 B=1.4385 coverage=49/49 routes=180 chain=180/180
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=24 D_exec=28.289011 B=1.4297 coverage=49/49 routes=180 chain=180/180
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=24 D_exec=28.295604 B=1.4319 coverage=49/49 routes=180 chain=180/180
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=26 D_exec=30.282418 B=1.4275 coverage=49/49 routes=180 chain=180/180
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=24 D_exec=28.279121 B=1.4264 coverage=49/49 routes=360 chain=360/360
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=26 D_exec=30.252747 B=1.4176 coverage=49/49 routes=360 chain=360/360
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=24 D_exec=28.318966 B=1.4397 coverage=49/49 routes=432 chain=432/432
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=23 D_exec=27.318328 B=1.4394 coverage=49/49 routes=252 chain=252/252
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=26 D_exec=30.293103 B=1.4310 coverage=49/49 routes=432 chain=432/432
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=25 D_exec=29.292605 B=1.4309 coverage=49/49 routes=252 chain=252/252
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=26 D_exec=30.299569 B=1.4332 coverage=49/49 routes=432 chain=432/432
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=25 D_exec=29.273312 B=1.4244 coverage=49/49 routes=252 chain=252/252
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=28 D_exec=32.286638 B=1.4289 coverage=49/49 routes=432 chain=432/432
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=27 D_exec=31.260450 B=1.4202 coverage=49/49 routes=252 chain=252/252
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,2/A R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=4,6 d5=[3,6 4,5 5,6]/red
  ACCEPT par=26 D_exec=30.289871 B=1.4300 coverage=49/49 routes=864 chain=864/864
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=3,6 d5=[2,6 3,5 4,6]/blue
  ACCEPT par=25 D_exec=29.302251 B=1.4341 coverage=49/49 routes=504 chain=504/504
          landing=3,0 near=0,2/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=5,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[6,5] d4=[5,5 6,4 6,6]/blue s4=3,3/A s5=6,5/B goal=4,6 d5=[3,6 4,5 5,6]/red

census: 4402 accept(s) of 20000 judged candidate(s) over 417 (R2,R3,R4) group(s) in 158.1 s · devices walked 10/348 · 40-group cap hit on 9 device(s) · global budget 20000 HIT (the run is a deterministic PREFIX: the accept count is a floor, the refusal census is complete only within the prefix)
upstream skips: R2 sets not sealable 21 (column-leak 21) · R2 boundary outside the pool 28 · 38 sealed R2 set(s) · devices with < 4 free tiles for R2 0 · (R2,R3) pairs with < 4 free tiles for R3 0 · R3 sets not sealable 1994 (column-leak 752) (mixed-entry-phase 1242) · R3 boundary outside the pool 40 · 153 sealed R3 set(s) · SHAPE FILTER #1 (an R3 tile adjacent to an R2 tile) 0 (0 expected by the seal law) · (R2,R3,R4) groups with < 4 free tiles for R4 0 · R4 sets not sealable 12605 (column-leak 6259) (mixed-entry-phase 6346) · R4 boundary outside the pool 786 · 1335 sealed R4 set(s) · SHAPE FILTER #2 (an R4 tile adjacent to an R2 or R3 tile) 0 (0 expected by the seal law) · no goal candidate 132 · s2 tile on the goal's seal or the goal itself 9564
tile accounting: largest R3 pool seen 22 tile(s) · largest R4 pool seen 19 tile(s) · largest free pool seen after a sealed R4 15 tile(s) (that pool must hold the goal + its whole seal (≥ 2) + the s2 tile)
room rejections: mixed-entry-phase: 24472 · column-leak: 13908
rejection histogram:
  par-out-of-band: 7794
  unsolvable: 6643
  g5-identity-broken: 1161
par census over the OUT-OF-BAND judged candidate(s) (the histogram counts only the members the par band refused; in-band members are enumerated by "accepts by par" and by the in-band refusal list — F-L36-2): 16:27 17:69 18:166 19:314 29:551 30:497 31:510 32:388 33:537 34:364 35:565 36:362 37:585 38:344 39:503 40:281 41:368 42:203 43:232 44:130 45:137 46:89 47:102 48:53 49:82 50:49 51:56 52:50 53:36 54:38 55:24 56:32 57:11 58:24 59:2 60:11 62:2
accepts by par:
  par 20: 171 accept(s), D_exec 24.252174 … 24.420213 (B 1.4174 … 1.4734)
  par 21: 333 accept(s), D_exec 25.171053 … 25.419700 (B 1.3904 … 1.4732)
  par 22: 387 accept(s), D_exec 26.200000 … 26.436170 (B 1.4000 … 1.4787)
  par 23: 561 accept(s), D_exec 27.186957 … 27.419700 (B 1.3957 … 1.4732)
  par 24: 512 accept(s), D_exec 28.185897 … 28.455319 (B 1.3953 … 1.4851)
  par 25: 653 accept(s), D_exec 29.181230 … 29.413276 (B 1.3937 … 1.4711)
  par 26: 599 accept(s), D_exec 30.185897 … 30.455319 (B 1.3953 … 1.4851)
  par 27: 630 accept(s), D_exec 31.129450 … 31.429336 (B 1.3765 … 1.4764)
  par 28: 556 accept(s), D_exec 32.157895 … 32.448936 (B 1.3860 … 1.4830)
in-band candidates refused by a gate: 1161
  par=28 D_exec=32.397872 B=1.4660 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
  par=28 D_exec=32.397872 B=1.4660 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
  par=28 D_exec=32.397872 B=1.4660 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,1/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
  par=28 D_exec=32.385106 B=1.4617 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=3,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
  par=28 D_exec=32.385106 B=1.4617 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=3,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
  par=28 D_exec=32.385106 B=1.4617 [g5-identity-broken]
    landing=4,0 near=0,1/A P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=3,0/B R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,5/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue
      g5-identity-broken: the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region (ai-native-pipeline §8.12 V1.5). Measured: 4 seal tile(s), 4 NOT adjacent [4,4 5,3 5,5 6,4] (free region 10 position(s)); the identity's VALUE — the world with the landing pocket's device removed — solves at 28 < par 28, while every par route presses 5 switch(es) through the chain (g3)
wrote 4402 accept(s) to /tmp/lv018-act3-b5-accepts.json
```

*(raw output: `STEP 2b`)*


Three further readings are worth carrying forward and none of them is a claim:

- **`par 16`–`par 19` and `par 29`–`par 62` appear in the OUT-OF-BAND census** — the out-of-band histogram
  is printed because the band is a filter (`F-L36-2`'s lesson: it counts only what the band refused, and
  it says so in its own label). `par 16:27 · 17:69 · 18:166 · 19:314` is a **measurement of what the frame
  can also produce**, not a claim that the opener could open lower: §7.10.2's ladder is derived from
  `PAR_FLOOR`, and a lower opening rung would break O3's reservation by construction.
- **the D2 orbit line is PREDICTED then MEASURED, and the prediction is FALSE on this frame.** The header
  published `σ_x : x ↦ CX + W − x` as size-orbit-conserving (an automorphism of the rectangle and of the
  boundary operator, preserving checkerboard parity), which predicts equal device counts on each orbit;
  the run measures **0/14 equal**. Published as a reading with its mechanism named rather than argued
  away — the orbit is a symmetry of `Γ_F` **as a set of far tiles**, but the column is on the *left* and
  the board edge on the *right*, so `g_leak` is not equivariant under it. Nothing in the batch is
  inherited across an orbit: no accept, cap or instrument crosses.
- **the `F-L36-1` cut receipt is printed on every run of every act** (`CUT re-measured … 14.969697` vs the
  pre-fix basis's `28.455319`), because the escalation filter reads the same law constant the prover's own
  `measureCut()` reads. On this batch `escalation: 0` refusals — the filter bites nothing, and the receipt
  is what says so rather than the absence of a line.

## 3. The selection — §7.10.2's ladder executed as a derivation, never a search

`BATCH === 5` pushes **exactly one** par combo (the law's own multiset), never a search: the batch's
variable is the **par axis**, and the tie-break inside each par is the minimal `D_exec` subject to the
§6.1.4 rung-key-distinct clause, with the closing rung taking the within-par **maximum**. Every departure
from the tie-break is printed — a filter is never silent, in either direction.

```
author-l21 (G lattice, Act II batch 5 — the ACT III OPENER (L41–L45) on the proven 4-pocket/5-door/5-press class, Act III's own band) — CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = 14.969697 · Act I measured peak (ids 1–20) = 24.729412 · par(L15) = 10 · B band [1.2500, 1.6875] · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
act 3's law surface (read from the law module, never re-typed): par band [20, 28] inclusive · D_exec band [23.75, 33.0625] (printed [23.75, 33.06]; §7.9: the derived value is the operand) · §7.10.2's opener multiset [20, 22, 24, 26, 26] · O3's reservation margin 0.6875 · §7.3.1 instance 5 bound [-4.705319, -1.392819] vs the previous act's registered maximum 28.455319 (alias to Act II's registered tail 28.455319: identical, so the two cannot drift) · batch ids [41, 42, 43, 44, 45] vs this run's window L41–L45: identical
D2 orbit law — SIZES ONLY (PREDICTED, then MEASURED; accepts never inherit): σ_x : x ↦ 3 + 7 − x ⇒ K is orbit-constant; PREDICTED 6 orbit pair(s) of device counts equal, MEASURED 0/6 equal · 4,0=0 ↔ 6,0=36 DIFFERENT · 4,1=0 ↔ 6,1=72 DIFFERENT · 4,2=0 ↔ 6,2=90 DIFFERENT · 4,3=0 ↔ 6,3=80 DIFFERENT · 4,4=0 ↔ 6,4=81 DIFFERENT · 4,5=0 ↔ 6,5=32 DIFFERENT
CUT divergence receipt (F-L36-1): FROZEN L1–L15 floor 14.969697 vs the pre-fix basis's 28.455319 (Δ 13.485622) — the pre-fix list let the registered Act II rungs raise the floor and silently turned the escalation gate into "D_exec > the registered act tail"; the generator now reads ACT_II_REGISTERED_IDS, the same law constant the prover's own measureCut() reads
preflight parity law: 40 board(s), 16054 state(s), 44690 legal move(s), 0 bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)
clone guard (§6.1.4, seal-inclusive key): 36 geometry key(s) taken [l005.json, l002.json, l008.json, l007.json, l009.json, l010.json, l011.json, l012.json, l013.json, l014.json, l015.json, l016.json, l017.json, l018.json, l019.json, l020.json, l021.json, l022.json, l023.json, l024.json, l025.json, l026.json, l027.json, l028.json, l029.json, l030.json, l031.json, l032.json, l033.json, l034.json, l035.json, l036.json, l037.json, l038.json, l039.json, l040.json]
read 4402 accept(s) from /tmp/lv018-act3-b5-accepts.json

selection filter: 4402 accept(s) inside the bands · 151 refused by the §6.1.4 clone guard (key already taken by a shipped board) · 4251 usable · 36 key(s) already taken
selection: Act III OPENER par multiset (GD-012 §7.10.2 O1–O6, read from the law module, never re-derived by taste) — [20, 22, 24, 26, 26]: O1's P2-exact window is [20, 22, 24, 26, 28] (PAR_FLOOR 20 + 2·(i−1)); O2 withholds the derived top rung par 28 (the ceiling, §7.10.1's PAR_CEILING 28) and repeats the truncated top 26 at its 5th rung; O3's reservation margin 0.6875 = (28 + 3·1.2500) − (26 + 3·1.6875) = 31.7500 − 31.0625 (derived, not taste; §7.10.2 O3) (width check: P2-exact window span 28 vs the band's width 8)
selection: O5 descending fill executed — 5 rung(s) populated from the truncated set [20, 22, 24, 26] (5 of the 5 derived rung(s) supported); five rungs are populatable, so the STOP-AND-ROUTE branch does not fire
selection: Act III opener par multiset [20, 22, 24, 26, 26] · ascending par; O6: the ladder's LAST rung takes the within-par MAXIMUM D_exec and every earlier rung the minimum
selection: O4 anti-mirror (printed, never hidden) — O1's own step is not re-tuned to dodge a coincidence; the registered Act II multisets are [17, 18, 20, 21, 23] · [17, 18, 20, 21, 23] · [19, 22, 22, 24, 24] · [18, 20, 22, 24, 24] and this batch's is [20, 22, 24, 26, 26]: distinct from every one of them by multiset · coinciding distinct pars 3 of 4 (20, 22, 24) — a finite integer band makes these coincidences unavoidable, so they are printed rather than implied away, and the par 26 rung is the act's own new axis (no registered rung carries it)

selection: 1 par combo(s) tried · rising-D_exec clause NOT in force (batch 5's published amendment: §7.3 interior freedom; the across-act clause rode on batch 1's peak) · 0 dropped by it · 0 dropped by the clone clause (a par's whole in-band pool keyed on already-used geometry)
selection: pars [20, 22, 24, 26, 26] · Δpar≥2 steps 3/4 · min D_exec 24.257329 · spread 6.197990
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a shipped board
  L41 par=20 D_exec=24.257329 B=1.4191 coverage=49/49 chain=48/48 Δpar=n/a ΔD_exec=n/a
    key=0,0|6,3|0,1|4,0|2,2+2,5+3,0+3,1+3,3+3,4+3,6+4,1+4,2+4,5+4,6+5,2+5,3+5,5+6,1+6,2+6,4+6,6
    landing=4,0 near=0,1/A P=[4,0 5,0 5,1 6,0] d1=[3,0 4,1 5,2 6,1]/red s1=5,0/B R2=[3,2] d2=[2,2 3,1 3,3 4,2]/blue s2=2,1/B R3=[3,5] d3=[2,5 3,4 3,6 4,5]/red s3=3,2/B R4=[5,6] d4=[4,6 5,5 6,6]/blue s4=3,5/A s5=5,6/B goal=6,3 d5=[5,3 6,2 6,4]/blue
  L42 par=22 D_exec=26.238773 B=1.4129 coverage=49/49 chain=336/336 Δpar=2 ΔD_exec=1.981444
    key=0,0|5,6|0,1|4,0|2,2+2,5+3,0+3,1+3,3+3,4+3,6+4,1+4,2+4,5+4,6+5,2+5,3+5,5+6,1+6,2+6,4+6,6
    landing=4,0 near=0,1/A P=[4,0 5,0 5,1 6,0] d1=[3,0 4,1 5,2 6,1]/red s1=5,0/B R2=[3,2] d2=[2,2 3,1 3,3 4,2]/blue s2=2,1/B R3=[6,3] d3=[5,3 6,2 6,4]/blue s3=3,2/B R4=[3,5] d4=[2,5 3,4 3,6 4,5]/red s4=6,3/B s5=3,5/A goal=5,6 d5=[4,6 5,5 6,6]/blue
  L43 par=24 D_exec=28.213816 B=1.4046 coverage=49/49 chain=27/27 Δpar=2 ΔD_exec=1.975043
    key=0,0|3,6|0,6|3,0|2,0+2,3+2,6+3,1+3,2+3,4+3,5+4,2+4,3+4,4+4,6+5,1+5,2+5,3+5,5+6,0+6,1+6,3+6,4
    landing=3,0 near=0,6/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[5,4] d3=[4,4 5,3 5,5 6,4]/blue s3=6,2/A R4=[3,3] d4=[2,3 3,2 3,4 4,3]/red s4=5,4/B s5=3,3/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  L44 par=26 D_exec=30.209890 B=1.4033 coverage=49/49 chain=180/180 Δpar=2 ΔD_exec=1.996074
    key=0,0|3,6|0,6|3,0|2,0+2,3+2,6+3,1+3,2+3,4+3,5+4,2+4,3+4,5+4,6+5,1+5,2+5,4+5,6+6,0+6,1+6,3+6,5
    landing=3,0 near=0,6/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,3] d3=[2,3 3,2 3,4 4,3]/red s3=6,2/A R4=[5,5] d4=[4,5 5,4 5,6 6,5]/red s4=3,3/A s5=5,5/A goal=3,6 d5=[2,6 3,5 4,6]/blue
  L45 par=26 D_exec=30.455319 B=1.4851 coverage=49/49 chain=30/30 Δpar=0 ΔD_exec=0.245429
    key=0,0|5,4|0,4|3,0|2,0+2,6+3,1+3,5+4,2+4,4+4,6+5,1+5,2+5,3+5,5+5,6+6,0+6,1+6,3+6,4+6,5
    landing=3,0 near=0,4/B P=[3,0 4,0 4,1 5,0] d1=[2,0 3,1 4,2 5,1 6,0]/blue s1=4,0/A R2=[6,2] d2=[5,2 6,1 6,3]/red s2=2,1/B R3=[3,6] d3=[2,6 3,5 4,6]/blue s3=6,2/A R4=[6,6] d4=[5,6 6,5]/red s4=3,6/B s5=6,6/A goal=5,4 d5=[4,4 5,3 5,5 6,4]/blue

act-III opener note — every departure from the minimal-D_exec tie-break, printed (a filter is never silent):
  par 22: 1 lower-D_exec row(s) refused by the rung-key-wide distinct clause (the rung already keyed the batch) → took 26.238773
  par 24: 2 lower-D_exec row(s) refused by the rung-key-wide distinct clause (the rung already keyed the batch) → took 28.213816
  par 26: 8 lower-D_exec row(s) refused by the rung-key-wide distinct clause (the rung already keyed the batch) → took 30.209890
  par 26 (L45): the closing rung took the within-par MAXIMUM D_exec 30.455319 (published departure, header rule 4 — §7.3.2 asks the act's maximum to be carried late); the par's minimum is 30.187500

act III opener READING (§7.10.2: NO act-peak / act-close branch on the opener; §7.3.2's carrier is L51–L60) — the batch's measured MAXIMUM is L45 at D_exec 30.455319 (par 26, B 1.4851, chain 30/30): vs the previous act's registered maximum 28.455319 (L40, §7.3's across-act comparator) → Δ 2.000000 — STRICTLY ABOVE, so the act-scale reading is discharged by the batch's own peak (a READING: the opener carries no clause); vs Act I's measured peak 24.729412 → Δ 5.725907
  band containment (derived-exact both directions, §7.9): Act III's band is [23.75, 33.0625] (printed [23.75, 33.06]) and every rung sits inside it inclusive: L41 24.257329 ∈ · L42 26.238773 ∈ · L43 28.213816 ∈ · L44 30.209890 ∈ · L45 30.455319 ∈; par band [20, 28] inclusive (§7.10.3)
  last rung L45 par=26 D_exec=30.455319 (O6 put the batch's maximum on the closing rung: HOLDING)

RELIEF instance 5 FILL-IN (§7.10.4; the label was PRE-PUBLISHED, its value is filled in BEFORE the bytes, never after):
  L41 par 20 · D_exec 24.257329 · B 1.4191 vs L40 par 24 · D_exec 28.455319 · B 1.4851 → Δpar -4, ΔB -0.0660, 3·ΔB -0.197971, ΔD_exec = Δpar + 3·ΔB = -4.197990
  exact value -4.197990 · published bound [-4.705319, -1.392819] → INSIDE the bound · admissible first-rung half for par 20: [-4.705319, -3.392819] → INSIDE it 
  paste-ready (the census record quotes this line verbatim, before any board byte): ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41 · ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329 · ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990 · ACT_III_B1_OPEN_RELIEF_DELTA_RANGE = [-4.705319, -1.392819] (BELOW the previous act's tail — §7.10.4's own premise holds)
  law-module verification (the constant and the measurement must agree, or the registration train cites a stale literal; compared with the law module's own LAW_PRECISION 5e-7 — never `===`, because the operand is the display form, F-L41-1): ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329 (constant 24.257329; exact 24.25732899022801 vs 24.257329, |Δ| 9.772e-9) → MATCH · ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990 (derived -4.197990; exact -4.197990009771988 vs -4.197990000000001, |Δ| 9.772e-9) → MATCH
(dry run — pass --write to land the 5 candidates)
```

*(raw output: `STEP 3c`)*


## 4. §7.3.1 instance 5 — the `act-open` relief, FILLED IN BEFORE THE BYTES

The label was pre-published by §7.10.4 with the comparator named as **Act II's registered maximum** and a
bound of `[−4.705319, −1.392819]`. The value is a **fill-in**: it can only be known once L41 exists as a
candidate, and §7.10.4 requires it to be written **before** the bytes so that the label cannot be
reverse-fitted to the boards it explains. The lines below are quoted **verbatim from the dry run** — the
first three were published with the census, the fourth is the receipt that the constant this commit fills
in is *the value this run measured* (it is what caught `F-L41-1`):

```
RELIEF instance 5 FILL-IN (§7.10.4; the label was PRE-PUBLISHED, its value is filled in BEFORE the bytes, never after):
  L41 par 20 · D_exec 24.257329 · B 1.4191 vs L40 par 24 · D_exec 28.455319 · B 1.4851 → Δpar -4, ΔB -0.0660, 3·ΔB -0.197971, ΔD_exec = Δpar + 3·ΔB = -4.197990
  exact value -4.197990 · published bound [-4.705319, -1.392819] → INSIDE the bound · admissible first-rung half for par 20: [-4.705319, -3.392819] → INSIDE it 
  paste-ready (the census record quotes this line verbatim, before any board byte): ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41 · ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329 · ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990 · ACT_III_B1_OPEN_RELIEF_DELTA_RANGE = [-4.705319, -1.392819] (BELOW the previous act's tail — §7.10.4's own premise holds)
  law-module verification (the constant and the measurement must agree, or the registration train cites a stale literal; compared with the law module's own LAW_PRECISION 5e-7 — never `===`, because the operand is the display form, F-L41-1): ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329 (constant 24.257329; exact 24.25732899022801 vs 24.257329, |Δ| 9.772e-9) → MATCH · ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990 (derived -4.197990; exact -4.197990009771988 vs -4.197990000000001, |Δ| 9.772e-9) → MATCH
```

Read as three separate facts, because conflating them is how a label becomes a decoration:

1. **`−4.197990` is inside the published union** `[−4.705319, −1.392819]` **and inside the admissible
   first-rung half for `par 20`** (`[−4.705319, −3.392819]`). The half-check is the real one: the union is
   the two halves' union, so a value in the union but in neither half is *outside* the label. Both checks
   are re-executed at the **write point** in `author-l21.ts`, and a value outside either range makes the
   run refuse to `--write` (§7.10.4: a fill-in the label does not admit is not made true by re-picking a
   rung — it is a STOP-AND-ROUTE to the Game Designer).
2. **`−4.197990` is a relaxation of the execution axis only**, and it is dominated by the par term:
   `Δpar = −4` (`24 → 20`) against `3·ΔB = −0.197971`. So the seam is **almost entirely the par axis**,
   and `D_exec` is blind to comprehension (`M`/`T` are not in it — §7.10.4's own premise). §6 does **not**
   fire: no mechanic is introduced (`ΔM = 0`) — the opener runs the **same device class** Act II's ceiling
   batch registered, read on **Act III's own band**. How the seam *reads* — mastery rest or deflation — is
   therefore a **labelled Playtest hypothesis** (§7.3.3, `NOT TESTABLE, n = 0`) and is not a result, and
   the relief discharges **no clause**: the opener carries no `act-peak`/`act-close` branch at all
   (§7.10.2's clause set has neither — O1–O6 are the whole ladder).
3. **The comparator is alias-typed.** `ACT_III_B1_OPEN_RELIEF_PREVIOUS_EXEC` **is**
   `ACT_II_R006A_REGISTERED_TAIL_EXEC` (L40's measured `28.455319`), not a re-typed copy, so the seam
   value and the across-act comparator cannot drift apart when a later registration moves a constant.
   Every run prints the drift check beside the bound.

## 5. The ladder this census supports (what the next commit lands)

```
L41 par 20 · 24.257329 · B 1.4191 · chain  48/48
L42 par 22 · 26.238773 · B 1.4129 · chain 336/336
L43 par 24 · 28.213816 · B 1.4046 · chain  27/27
L44 par 26 · 30.209890 · B 1.4033 · chain 180/180
L45 par 26 · 30.455319 · B 1.4851 · chain  30/30    (O6: the batch's maximum on the closing rung — HOLDING)
```

- **par multiset `[20, 22, 24, 26, 26]`** — §7.10.2's own derivation, quoted not searched; `Δpar ≥ 2` on
  **3 of 4** steps (the last step is the O2 repeat, `Δpar = 0`).
- **5 distinct §6.1.4 keys**, **0 collisions** with the **36** keys the shipped set has taken, and of the
  **4402** in-band accepts **151** were refused by the clone guard — so the guard bites and the batch does
  not re-stamp shipped geometry.
- **`par 26` is the act's own new axis**: no registered rung carries it (Act II's registered multisets are
  `[17, 18, 20, 21, 23]`, `[17, 18, 20, 21, 23]`, `[19, 22, 22, 24, 24]`, `[18, 20, 22, 24, 24]`), and
  the **3 of 4** coinciding distinct pars are printed rather than implied away. The multiset is distinct
  from every one of them — O4's anti-mirror clause is satisfied **by the derivation**, not by tuning.
- **every rung sits inside the derived-exact band** `[23.75, 33.0625]` **inclusive** (§7.9: the derived
  value is the operand, the printed `[23.75, 33.06]` is display text — the `F-L31-1` lesson applied to a
  third band), and the batch's measured maximum `30.455319` is **+2.000000** above Act II's registered
  maximum `28.455319` and **+5.725907** above Act I's `24.729412`. Both are printed as **READINGS**:
  §7.10.2 gives the opener **no** `act-peak`/`act-close` branch, and §7.3.2's carrier is `L51–L60`.
- **headroom for the act's tail is 0.6875 by construction** (`ACT_III_CEILING_RESERVATION_MARGIN`): opener
  rungs top out at `26 + 3·1.6875 = 31.0625` while any `par 28` tail rung bottoms at
  `28 + 3·1.2500 = 31.7500`. That is what the withheld `par 28` (O2) buys, and it is why the opener does
  not consume the ceiling.

## 6. What this lane does NOT touch, and the handoff

- **`tests/**` is off this lane.** Five new files in `src/levels/candidates/` will redden
  `tests/solver/l16-l20-candidates.test.ts`'s shelf-set row **by design** — the booking pin expects the
  shelf's own name list, and QA re-books it (LV-017 / QA-026 precedent: the pin is a *live guard catching
  unregistered extras*, green only when a registration ticket moves the bytes **and** re-books the
  literal). It is **booked by name in the return, never fixed here.**
- **Root bytes are untouched**: the five files are new and only under `src/levels/candidates/`, so the
  tracked root level diff vs the base commit must be **EMPTY**, `npm run levels` must stay **40/40**, and
  `docs/level-difficulty.report.json` must stay at **40 records**.
- **Registration is a later train** (R-007-era): the registry row, the id block law, `EXPECTED_LEVEL_COUNT`,
  the per-level difficulty rows and the `ActSeamReliefSpec` object for instance 5 are all written **with**
  the registration, not here. The two constants this commit fills in are what that train cites, so the
  registration cites a **constant** rather than a literal.
- **What Act III's act-close carrier (`L51–L60`) will need**, named now because this batch's `par 28`
  reservation exists to make it possible: a `par 28` family whose `D_exec` can be pushed to the **derived
  ceiling `33.0625`** and no further. The opener deliberately held `par 28` unused so that tail rungs
  bottom at `31.7500` — i.e. the reservation is a *floor for the tail*, and the tail's own obligation is
  to reach past whatever maximum the mid-act batches register without leaving the band's top.

## 7. Findings and cross-lane escalations (named, not decided)

- **`F-L41-1` — a measured operand is published as display text, and the verification line caught it
  before any byte existed.** The first draft of the "law-module verification" line compared the measured
  `D_exec` with the filled-in constant by **strict equality** and printed `DRIFTED` for both constants
  even though their 6-decimal forms matched — because C6's *operand* is the double `24.25732899022801`
  and the constant is the house-style display form `24.257329` (`|Δ| = 9.772e-9`). Two things follow, and
  both are recorded rather than smoothed over: ① the comparison must use the law module's **own**
  tolerance `LAW_PRECISION` (`5e-7`, the rule `near()` already applies to Act II's registered tails —
  `28.339426` for the sidecar's `28.33942558746736`), so the line now prints **both** forms and the
  residue; ② the exact values (`24.25732899022801`, `−4.197990009771988`) are published **in the law
  module's own doc comment** beside the display forms, so a later reader never has to guess which of the
  two the registration train is citing. This is `F-L31-1`'s failure mode (a display form silently
  becoming the operand) one layer up, and it was found by *running* the check rather than by reading it.
- **The D2 orbit prediction is falsified at this frame (0/14).** The header's form of the orbit law
  (cited to ADR-`architecture-0004` Ruling 4) predicts orbit-equal *sizes*; the measurement disagrees
  because the column is on the left and the board edge on the right, so `g_leak` breaks the symmetry.
  Nothing in this batch depends on it (sizes only, never accepts), and it is **reported** — if a later
  ticket wants the law to read as "orbit-equal *up to the boundary operator*", that is a wording change in
  a document this lane does not own.
- **`--stage=roomcap` prints a batch-id window check it has no batch for** (see the STEP 1 note).
  Harmless (nothing depends on the string) and worked around by passing `--batch=5` in the published
  command, but a reader of a bare roomcap run would see a false `MISMATCH`.
- **The 5-pocket device and the `H`/XOR compositions stay outside this batch** (§1). Both are Game
  Designer + Architect territory; handing them over by name is the whole point of the NON-CLAIM.
- **`--pocketsize ≥ 11` stays DEFERRED**, unchanged and with **no ceiling wording in either direction**:
  `≤ 10` is closed by measurement (`F-L20-3`), `≥ 11` remains unmeasured.
## 8. Post-fix amendment — `F-L41-2` (the shared derivation) and `F-L41-3` (the probe that could not falsify)

§1–§7 above are the **pre-fix** census and are kept **verbatim**, because a receipt that overwrites its
own earlier reading cannot show what a filter moved. This section records what the clause published in the
finding commit `e6d70fb` actually did when it ran, and it lands **before** the five bytes.

### 8.1 `F-L41-2` implemented — one derivation, both callers

The prover's walk-sealed-room reader moved to `scripts/room-derivation.ts`
(`derivedWalkSealedRooms`, `doorsCoveringTwoRooms`), imported by **both** `scripts/prove-candidate.ts`
(its `g6`, `g2`, `g5` and the negative-control readers) and `scripts/author-l21.ts` (the new clause). The
generator's clause runs in the 4-pocket enumeration **immediately after the par-band filter and before
`judge`**, is **scoped to `ACT === 3`** by construction, and counts its refusal in a histogram row, an
upstream skip counter and the census identity — it never hides an accept and it never repairs one.

**The ledger stage (`--stage=struct`) is the receipt, and it reproduces the prover's exact finding from
the bytes.** Pre-fix, on the shelf:

```
  L44 l044.json: rooms=6 covering=[d1 d2 d3 d4 d5 d4] — door(s) covering TWO rooms: [d4] (OUT OF CLASS)
struct ledger: 4 in class · 1 out of class [l044.json]
```

— byte-for-byte the covering list `g6-room-structure` printed when it **rejected** the written `l044`
(`§` finding commit). Post-fix, after re-drawing, `struct ledger: 5 in class · 0 out of class`. And the
audit's *other* half — **the clause must refuse nothing on the registered corpus** — is measured, not
asserted: `--stage=struct --dir=src/levels` reads **40 in class · 0 out of class** (exit 0).

**A/B, the semantics did not move.** Because the extraction and the type-widening touch a path Act II
also walks, both A/Bs were re-run:

| A/B | command | result |
|---|---|---|
| prover, 20 registered rungs | `prove-candidate.ts --family=g --ladder=21…40 --dir=src/levels` | **byte-identical** to the pre-extraction baseline; `LADDER RESULT: PASS (20/20, controls 260/260)` |
| generator, Act II (no `--act`) | `author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24` | stdout differs **only** in the elapsed-seconds field and the `--accepts=` path; the `--accepts` dump is **byte-identical** (293 accepts, same histogram, same identity) |

The `ACT === 3` guards (the clause itself, the skip-counter suffix, the identity line) are the *only*
behavioural delta, so the Act II path is untouched by construction **and** by measurement.

### 8.2 The post-fix census — the identity still closes, with one more term

`--stage=g --act=3 --batch=5 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=20 --parmax=28`
(158.1 s, exit 0; classic `HIT` prefix, 417 groups, devices 10/348, 40-group cap on 9):

```
census: 4201 accept(s) of 20000 judged candidate(s) over 417 (R2,R3,R4) group(s) …
  … derived two-room door (F-L41-2 — a door enclosing TWO derived walk-sealed rooms) 219
rejection histogram:
  par-out-of-band: 7794
  unsolvable: 6643
  g5-identity-broken: 1143
  derived-two-room-door: 219
census accounting identity …: accepts 4201 + refuses 15799 [derived-two-room-door 219 · g5-identity-broken 1143 · par-out-of-band 7794 · unsolvable 6643] = 20000 vs judged 20000 — CLOSES exactly
```

**Pre-fix → post-fix, A/B:** accepts `4402 → 4201` (−201); `g5-identity-broken` `1161 → 1143` (−18);
new row `derived-two-room-door 219`. The arithmetic is a check, not a coincidence: of the 219 now-refused
boards, **18** would also have failed `g5` had they reached `judge`, so the net accept loss is
`219 − 18 = 201`. The identity closes **exactly** on both readings (pre-fix: `4402 + 7794 + 6643 + 1161 =
20000`; post-fix: `4201 + 15799 = 20000`).

### 8.3 §7.10.4's relief fill-in — **unchanged**, and that is checked rather than assumed

The clause removes rungs from the pool, so the fill-in was re-derived from the post-fix pool **before any
byte**:

```
L41 par 20 · D_exec 24.257329 · B 1.4191 vs L40 par 24 · D_exec 28.455319 · B 1.4851 → ΔD_exec = -4.197990
exact -4.197990 · bound [-4.705319, -1.392819] → INSIDE · par-20 admissible half [-4.705319, -3.392819] → INSIDE
```

**Identical to the value committed at `db78a13`** — L41's par-20 minimum is stable across the filter, so
the constant written in the census commit (`ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329`,
`ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990`) stands and **no re-publication was needed**. The fill-in still
precedes the bytes by one commit.

### 8.4 Selection post-fix — only the defective rung moved

Same ladder multiset `[20, 22, 24, 26, 26]`, same four rungs at byte level, **L44 re-drawn**:

| rung | pre-fix | post-fix |
|---|---|---|
| L41 | par 20 · 24.257329 | par 20 · 24.257329 (identical) |
| L42 | par 22 · 26.238773 | par 22 · 26.238773 (identical) |
| L43 | par 24 · 28.213816 | par 24 · 28.213816 (identical) |
| **L44** | **par 26 · 30.209890 (the board `g6` rejected)** | **par 26 · 30.225216 (fresh draw)** |
| L45 | par 26 · 30.455319 | par 26 · 30.455319 (identical) |

The five rung keys stay distinct, 0 collide with a shipped board, and O6's within-par maximum still lands
on the closing rung. This is the falsifiable statement of §8.1: **the filter changed exactly the board the
prover refused, and nothing else.**

### 8.5 `F-L41-3` — the published probe derivation was a no-op (measured both ways)

The tool's header, as committed at `b28ed97`, read `--peak = (our peak rung's D_exec + 28.455319)/2`. Since
`--peak` **is** the comparator the peak rung must clear, a midpoint with a **below-peak** operand is itself
below the peak — so `D_exec > peak` holds and nothing fails:

```
--peak=29.455319  →  exit 0 · RESULT: PASS  (a probe that fails nothing)
--peak=31.7589095 →  exit 1 · exactly ONE FAIL, `act-peak` on exactly L45 · LADDER RESULT: FAIL (4/5 · controls 65/65)
```

The corrected operand sits **above** the peak and inside the act's band: the band's derived-exact ceiling
`33.0625`, so `--peak = (30.455319 + 33.0625)/2 = 31.7589095`. The header paragraph is amended in this
commit, quoting the superseded form so a reader sees what moved; the correction is a **root-cause fix to
an operand**, not a re-tuning of the expectation. Finding published as `F-L41-3`.

### 8.6 The proof on the landed bytes (details in the proving transcript)

`prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates`:

```
L41 · par 20 · 24.257329 · 1.4191 · 49/49 · delta -4.197990
L42 · par 22 · 26.238773 · 1.4129 · 49/49 · rise OK (1.981444)
L43 · par 24 · 28.213816 · 1.4046 · 49/49 · rise OK (1.975043)
L44 · par 26 · 30.225216 · 1.4084 · 49/49 · rise OK (2.011400)
L45 · par 26 · 30.455319 · 1.4851 · 49/49 · rise OK (0.230104)
batch peak: L45 at 30.455319 · §7.3 act-peak clause DISCHARGED · headroom to the Act III ceiling 33.0625: 2.607181
LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
```

Plus: `--measure-controls` → `PASS (5/5, controls MEASURED, not asserted (F-L16-3): 65)`; the corrected
`--peak` → exit 1 / one `act-peak` FAIL on exactly L45 / controls still 65/65; `solve-levels --audit
src/levels/candidates` → `RESULT: PASS`; `npm run levels` → **40/40** unchanged; `docs/level-difficulty.report.json`
→ **40 records**, not regenerated.

### 8.7 The micro-fix this amendment also carries, and the red it books

`src/core/level/index.ts`'s `multi-switch-door` prose carried a stale reading — "at most ONE switch per
door in **L6–L35** … the **L36+** allowance is not quantified yet" — while shipped ids reach **40** and
`§7.2`'s acts table moves the allowance to **Act III** (`L41–L60`, `§7.10.5`: no schema/core/validator
change). The stale "L36+ / not quantified yet" claim is retired in the code comment and in the message;
every pinned literal (`docs/level-design.md §1`, `L6–L35`, `never rejects a candidate`) is preserved, so
`tests/solver/multi-switch-door-warning.test.ts` stays green (16/16) and `tests/**` is untouched. The
**design-lane** half of the same finding (`docs/level-design.md:42`'s windows) is **not** this lane's file
and is left as the named handoff it already was.

**Booked, by design, never fixed here:** five new shelf files are `tests/solver/l16-l20-candidates.test.ts`'s
shelf-set row's business; the booking literal is `[]` (R-006c, at 40 rungs) and only a registration ticket
moves the bytes **and** re-books it. The suite is therefore **1 failed · 995 passed · 3 skipped (999)** —
the single red is that row, at `tests/solver/l16-l20-candidates.test.ts:236`, and **the count of reds is
unchanged by this batch's own doing** (base was 0 red at 996P/3S; one test moved from pass to fail).

### 8.8 Cross-lane status of `F-L41-2`, restated for the return

`F-L41-2` is **fixed for `ACT === 3` only**. Act II is not re-baselined by a filter inserted into its
census — the prover already passes `g6` on 20/20 registered Act II rungs, so the clause refuses nothing
there (measured: `--stage=struct --dir=src/levels` → 40/0). Whether the **`H` (both-pair) composition** and
the **XOR door** enter the device class at all remains an explicit **NON-CLAIM** of this batch, booked
forward by name to Game Designer + Architect; this lane does not decide it.
