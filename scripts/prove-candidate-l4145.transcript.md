# LV-018 — the proving side of Act III's opener (`l041`…`l045`, shelf candidates)

Companion to `scripts/author-l41-l45.transcript.md`. Every number here is read from the **landed
bytes** (`src/levels/candidates/l041.json`…`l045.json`) through `@/core/solver/*` + `@/core/rules` by
`scripts/prove-candidate.ts`; nothing is quoted from the authoring script, and nothing in this file can
write a level. The authoring dossier's table is **re-measured** here, not trusted.

**Order of artifacts (law before bytes, finding before fix).** `b28ed97` the rule + device + frame +
ladder + relief *procedure*, published before any census or byte (docstring alone: 148 added / 0
removed) → `db78a13` the census dossier **and** §7.10.4's instance-5 relief **fill-in** → `e6d70fb`
**F-L41-2**, published docstring-only *before* the line that fixes it moves → `efdaded` the F-L41-2
repair (shared `scripts/room-derivation.ts`) + the F-L41-3 header amendment + the `--stage=struct`
ledger → `568c136` the five bytes + the shelf `README.md` restate → `8c34a7d` the two owner docs
(pipeline §8.26 / V1.20, difficulty V1.12) → `7ffd5ae` the `src/core/level/index.ts` micro-fix →
**this file**. Each step is checkable in `git log -p`; none can be back-dated. The rule commit is the
proof that the ladder was **not** searched: it is quotable from the law module's constants before any
board existed. The registered blobs of the five bytes at `568c136` are `a07f7846…` ·
`d130315e…` · `ae18e42b…` · `a4da9d38…` · `a4d8860a…` — the same five recorded in the shelf README's
table, verified from `git ls-tree` rather than typed from `hash-object`.

**The law this batch executes.** `docs/level-design.md` §7.10 (GD-012, **ADOPTED + USER-APPROVED
2026-10-19**), ADR `design-0008` (RULING D), band `[23.7500, 33.0625]` **derived-exact inclusive**,
opener ladder `[20, 22, 24, 26, 26]` (O1–O6), §7.10.4's relief bound `[−4.705319, −1.392819]`,
§7.10.5's frame ruling, §7.3's across-act clause on the act's **peak**, §7.3.2's `act-close` carrier
`L51–L60`. Frozen instrument constants used below: `LAW_PRECISION = 5e-7`.

---

## §0 · The three instrument findings this batch carries, as published

None of them is about a level's solvability; all three are about the **instruments**. Each was
published **before** the line that changes it moved, and the two repairs are act-scoped, so the Act II
path is untouched — and that is **measured twice**, not argued (§3.4).

### F-L41-2 · the generator judged *declared* rooms, the prover *derives* them from the bytes

The generator's `g6-room-structure` verdict read `ctx.rooms` — the rooms the authoring lattice had
**declared** — while the prover re-derives them from the landed board. A door enclosing a second region
is **invisible to the declaration and visible to the derivation**, so the two could disagree, and on
this batch they did: `l044`'s `d4 = [5,6 6,5]` rings the intended room `{5,5}` **and** the corner
`{6,6}`. The prover refused the written board —

```
L44 l044.json: rooms=6 covering=[d1 d2 d3 d4 d5 d4] — door(s) covering TWO rooms: [d4] (OUT OF CLASS)
```

— while the generator had accepted it. The finding is published **docstring-only at `e6d70fb`**, then
fixed at `efdaded` by moving the law to **one** implementation, `scripts/room-derivation.ts`
(`derivedWalkSealedRooms`, `doorsCoveringTwoRooms`, `RoomBoard = Omit<Level,"par">`,
`inBoundsNeighbours`), imported by **both** `scripts/prove-candidate.ts` (whose local `sealedRooms` /
`inBoundsNeighbours` were deleted) and `scripts/author-l21.ts` — one truth source, so they cannot drift
again. The clause is **`ACT === 3`-scoped**, counts its refusal in the **rejection histogram**, the
**upstream skip ledger** *and* the printed **census identity**, and **repairs nothing**: the board was
re-drawn from its own pool like any other refusal (`30.209890 → 30.225216`, both `par 26`).

**The receipt is `--stage=struct`, and it reads any directory through the same derivation** (it is
act-independent by construction, so it can adjudicate the registered corpus too):

```
--stage=struct --dir=src/levels              → struct ledger: 40 in class · 0 out of class
--stage=struct --dir=src/levels/candidates   → struct ledger: 5 in class · 0 out of class      (post-fix)
                                             → struct ledger: 4 in class · 1 out of class [l044.json]   (pre-fix bytes)
```

The pre-fix line reproduces the **prover's own covering list off the bytes** — `rooms=6
covering=[d1 d2 d3 d4 d5 d4]`, naming `d4` — which is what makes it a derivation receipt rather than a
restatement of the lattice.

**Blast radius measured, not asserted.** Pre-fix → post-fix census: accepts `4402 → 4201` (**−201**),
`g5-identity-broken` `1161 → 1143` (**−18**), new row `derived-two-room-door 219`, and
`219 − 18 = 201` checks the three numbers against each other (18 of the 219 newly-refused boards would
*also* have failed `g5` had they reached `judge`). The identity closes on **both** readings
(pre-fix `4402 + 7794 + 6643 + 1161 = 20000`; post-fix `4201 + 15799 = 20000`).

### F-L41-3 · the published falsification probe's operand sat below the peak it had to fail

The tool header, as committed at `b28ed97`, derived `--peak = (our peak rung's D_exec + 28.455319)/2`.
`--peak` **is** the comparator the peak rung must clear, so a midpoint with a **below-peak** operand
lands below the peak and `D_exec > peak` holds everywhere: measured `--peak=29.455319` → **exit 0** ·
`RESULT: PASS` — the "probe that fails nothing" the rule's own last sentence names. The **operand** was
wrong, not the intent: a falsifying comparator must sit **above** the peak, and the only derived choice
inside the act's band is the band's **derived-exact ceiling** `33.0625`, so
`--peak = (30.455319 + 33.0625)/2 = 31.7589095`. The header paragraph is amended at `efdaded` and
**quotes the superseded form** so a reader sees what moved; the correction is a root-cause fix to an
operand, never a re-tuning of the expectation.

### F-L41-1 · a display form was compared with `===` against a measured double

The §7.10.4 verification line compares the law module's stored constant against the measured value. The
measured `D_exec` is `24.25732899022801` while its display form is `24.257329`
(`|Δ| = 9.772e-9`): with `===` the check would have printed a spurious MISMATCH. It was caught **only
because the line ran**, and the comparison now uses the law module's own `LAW_PRECISION` (`5e-7`) and
prints both forms with the residue — `MATCH` for both `ACT_III_B1_OPEN_RELIEF_EXEC` and
`ACT_III_B1_OPEN_RELIEF_DELTA`.

### F-L41-4 · **booked, not fixed** — the ladder table's operand *label* is act-blind while its operand is act-aware

Under `--act=3` the prover's ladder table and its closing line print `Δ vs Act I peak 28.455319` and
`Act I measured peak 28.455319`. The **value** is right — it is the *previous* act's registered maximum,
read act-aware at `scripts/prove-candidate.ts:114` — but the **name** is wrong, since Act I's peak is
`24.729412`. The **asserting** line (`act-peak`, per rung) is act-aware and names the operand correctly,
so **no verdict is affected** and the 65-control battery is unaffected. The two label sites
(`:1255`, `:1278`, plus the two per-rung `:1157`/`:1267` prints and the header at `:1130`) are left
standing with the remedy named — make them act-conditional and re-run the Act II byte-identical A/B —
because a correction landing after the A/B receipts were published in `efdaded` would be a fix inside a
commit whose evidence it would invalidate. Same class as F-L36-1 / F-L36-2: a printed string that
misdescribes its own reading is a **finding**, published and then fixed, never quietly edited.

---

## §1 · The batch, proved from the landed bytes

```
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates
```

**`LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))`** — every rung
**20 gates / 20 `ok` / 0 `FAIL`**, 13 named controls per rung.

| rung | par (solver) | `D_exec` | `B` | coverage | chain (press→cross) | g6 rooms (derived) | g5 seal tiles not adjacent | all-OFF world |
|---|---|---|---|---|---|---|---|---|
| L41 | 20 | 24.257329 | 1.4191 | 49/49 | 48/48 | 5 · `[d1:4,0+5,0+5,1+6,0 · d2:3,2 · d5:6,3 · d3:3,5 · d4:5,6]` | 14 (free region 2) | UNSATISFIABLE |
| L42 | 22 | 26.238773 | 1.4129 | 49/49 | 336/336 | 5 · `[d1:4,0+5,0+5,1+6,0 · d2:3,2 · d3:6,3 · d4:3,5 · d5:5,6]` | 14 (free region 2) | UNSATISFIABLE |
| L43 | 24 | 28.213816 | 1.4046 | 49/49 | 27/27 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d4:3,3 · d3:5,4 · d5:3,6]` | 14 (free region 7) | UNSATISFIABLE |
| L44 | 26 | 30.225216 | 1.4084 | 49/49 | 27/27 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d4:3,3 · d3:6,5 · d5:3,6]` | 13 (free region 7) | UNSATISFIABLE |
| L45 | 26 | 30.455319 | 1.4851 | 49/49 | 30/30 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d5:5,4 · d3:3,6 · d4:6,6]` | 12 (free region 5) | UNSATISFIABLE |

**What each column is worth.** The room lists are **re-derived from the bytes** — the public statement
that F-L41-2's clause and the prover now read one derivation, and the reason `covering doors distinct`
reads `true` 5/5. `par` is the solver's own `shortestSolution` and `par-stamped` is `ok` 5/5. `chain`
is the same G2 relation the Act II tables use, and it is `n/n` on every rung: the whole ordered
`s1>s2>s3>s4>s5` chain executes **before** the crossing on **every** shortest route, never merely on
one. `region` reads `deadStates=0 · noUnrecoverableOk=true · T=0 · R=0` 5/5. Every rung's all-OFF world
is `UNSATISFIABLE` (`allOffShortest=null`, `allOffGoalReachable=false`).

**`g3`'s forcing is staged, not asserted.** All five rungs report one shared press order with
`distinct switches per route: min = 5` (requirement ≥ 3) and staged worlds that must all read FALSE for
both the next switch's tile and the goal: `drop{s1} ⇒ s2 unreachable · drop{s1,s2} ⇒ s3 unreachable ·
drop{s1,s2,s3} ⇒ s4 unreachable · drop{s1,s2,s3,s4} ⇒ s5 unreachable`.

**`g5`'s census identity is BROKEN on all five** — the point of the gate. The world with the landing
device (door `d1` + its switch) removed solves at **`16 / 18 / 22 / 24 / 24`**, each **strictly below**
its `par` (`20 / 22 / 24 / 26 / 26`): the board's par is not a one-press arithmetic, so no rung is a
disguised simple level.

**The ladder, from the same run's table** (act-aware operands):

```
L41 · par 20 · 24.257329 · 1.4191 · 49/49 · Δpar —    · delta -4.197990
L42 · par 22 · 26.238773 · 1.4129 · 49/49 · Δpar ≥2 (2) · rise OK (1.981444) · delta -2.216546
L43 · par 24 · 28.213816 · 1.4046 · 49/49 · Δpar ≥2 (2) · rise OK (1.975043) · delta -0.241503
L44 · par 26 · 30.225216 · 1.4084 · 49/49 · Δpar ≥2 (2) · rise OK (2.011400) · delta  1.769897
L45 · par 26 · 30.455319 · 1.4851 · 49/49 · Δpar <2 (0) · rise OK (0.230104) · delta  2.000000
batch peak: L45 at 30.455319 · §7.3 act-peak clause DISCHARGED · headroom to the Act III ceiling 33.0625: 2.607181
```

`Δpar ≥ 2` holds on **3 of 4** steps (the closing repeat is `Δpar = 0`, the truncated top used twice —
stated, never hidden), the ladder rises anyway (an *observation*: §7.3 carries no interior-rise
obligation), and O6's within-par **maximum** lands on the closing rung as §7.10.2 requires.

**Band containment, derived-exact both directions (§7.9).** Every rung sits inside
`[23.75, 33.0625]` **inclusive** and inside `par` band `[20, 28]` inclusive; the compared operands ARE
the derived values, so the printed `[23.75, 33.06]` never judges anything.

**The relief instance 5, re-derived from the landed bytes** (§7.10.4; label pre-published):

```
L41 par 20 · D_exec 24.257329 · B 1.4191 vs L40 par 24 · D_exec 28.455319 · B 1.4851
  Δpar -4 · ΔB -0.0660 · 3·ΔB -0.197971 · ΔD_exec = -4.197990
  bound [-4.705319, -1.392819] → INSIDE · par-20 admissible half [-4.705319, -3.392819] → INSIDE
```

The constants `ACT_III_B1_OPEN_RELIEF_EXEC = 24.257329` / `ACT_III_B1_OPEN_RELIEF_DELTA = -4.197990`
were committed at `db78a13` — **one commit before `l041.json` exists** — and the post-fix re-derivation
returns the same value, so the filter moved L41's *neighbourhood* and not its `par 20` minimum. The
`LAW_PRECISION` comparison prints both forms and their residue (F-L41-1).

---

## §2 · Falsifications (the checks were asked to fail, and did)

**`--peak=29.455319` — the superseded header formula, a probe that falsifies nothing (F-L41-3):**

```
exit 0 · RESULT: PASS · LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65)
```

**`--peak=31.7589095` — the corrected probe (the derived midpoint of this batch's peak and the band's
derived-exact ceiling), which must fail exactly the peak rung:**

```
exit 1 · LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
  FAIL act-peak  D_exec=30.455319 vs the PREVIOUS act's registered maximum (Act II ≡ L40's measured D_exec) 31.758910 (delta -1.303590)
```

**Exactly one `FAIL`, exactly one rung — L45, the rung carrying the maximum — with L41–L44 still
`ACCEPT` and the battery still 65/65.** A probe that reddens a *neighbour* would have been a finding in
its own right; it reddens the peak, which is what §7.3's clause is about.

**The Act II path is not re-baselined, measured twice (F-L41-2's own acceptance criterion):**

| A/B | command | result |
|---|---|---|
| prover, the 20 registered rungs | `prove-candidate --family=g --ladder=21…40 --dir=src/levels` | **byte-identical** to the pre-extraction baseline; `LADDER RESULT: PASS (20/20 rung(s) ACCEPT, controls named: 260/260 across the 20 rung(s))` |
| generator, Act II (no `--act`) | `author-l21 --stage=g --batch=4 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24` | stdout differs **only** in the elapsed-seconds field and the `--accepts=` path; the accepts dump is **byte-identical** (293 accepts, same histogram, same identity) |

So the `ACT === 3` guards (the clause, the skip-counter suffix, the identity line) are the **only**
behavioural delta — by construction **and** by measurement. `--stage=struct` makes the same point from
the other side: on the registered corpus it reports **40 in class / 0 out**, i.e. the clause refuses
nothing that was already shipped.

---

## §3 · The rest of the acceptance battery

**3.1 · The expectation pass (F-L16-3 order — measured, not asserted).**

```
--measure-controls → PASS (5/5 rung(s) ACCEPT, controls MEASURED, not asserted (F-L16-3): 65)
```

**3.2 · The independent reader.** `solve-levels.ts --audit src/levels/candidates` →
**`5/5 level file(s) PASS · par verified from the solver on 5/5 · RESULT: PASS`**. This reader is not
the prover and does not share its ladder logic, so agreement is evidence rather than tautology.

**3.3 · The registered set and the census pins did not move.**

```
npm run levels                              → 40/40 ok · 0 errors · 183 warnings (0 multi-switch-door) · 11/11 negative cases
solve-levels.ts --audit src/levels          → 40/40 PASS (par verified 40/40)
docs/level-difficulty.report.json           → 40 records · NOT regenerated
git diff <base> -- src/levels (root only)   → EMPTY  (the five files are in candidates/, which the root walk does not enter)
```

The shelf stays invisible to every shipped-set census because the three consumers walk the root
**non-recursively** (`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`,
`tests/solver/metrics-sidecar.test.ts`'s report length, `src/game/levels/level-registry.ts`'s explicit
imports). That is the same mechanism that withheld the L16–L19 rows through LV-010, L20 through LV-011,
batch 1 through LV-012, batches 2–3 through LV-014/LV-015 and L36–L40 through LV-017.

**3.4 · Clone keys.** The five rungs carry **5 distinct §6.1.4 seal-inclusive keys** and **0 collide
with a shipped board**. The generator's clone guard reads **36 distinct keys over the 40 registered root
files** (the census is keyed by key, not by file) and its taken-set grows to **41** once the shelf is
included — `36 + 5 = 41`, which is the arithmetic form of "all five keys are fresh" rather than a
resemblance. Selection-time refusals: `151` of `4201` in-band candidates refused by the clone guard,
`4050` usable.

**3.5 · The micro-fix this train carries.**

`src/core/level/index.ts`'s `multi-switch-door` prose held a stale reading — "at most ONE switch per
door in **L6–L35** … the **L36+** allowance is not quantified yet" — while shipped ids reach **40** and
`§7.2`'s acts table moves the allowance to **Act III** (`L41–L60`; `§7.10.5` rules no
schema/core/validator change). The stale "L36+ / not quantified yet" claim is retired in the code
comment and in the warning message; **every pinned literal is preserved** (`docs/level-design.md §1`,
`L6–L35`, `never rejects a candidate`), so `tests/solver/multi-switch-door-warning.test.ts` stays
**green 16/16** and `tests/**` is untouched. It is a **wording** fix: the count remains legal and
flagged — no gate reads the allowance, and none was invented here.

**3.6 · The battery, and the one red this batch books.**

```
vitest run → 1 failed · 995 passed · 3 skipped (999)   [base: 0 red · 996 passed · 3 skipped]
the single red: tests/solver/l16-l20-candidates.test.ts:236
  AssertionError: expected [ 'l041.json', 'l042.json', …(3) ] to deeply equal []
```

The booking literal is **`[]`** (R-006c, re-booked on the 40-rung root), and five fresh shelf files are
exactly its business: the row is **RED by name, in the populated direction**, and **the count of reds is
unchanged by this batch's own doing** — one test moved from pass to fail, no other row moved. Only a
registration ticket moves the bytes **and** re-books the literal; `tests/**` is off this lane.

**3.7 · Two readings printed so they are not over-read.** The `--stage=roomcap` banner still carries no
batch for this run and prints a false `MISMATCH` unless `--batch=5` is passed (named, not chased). The
**D2 orbit law** for `σ_x : x ↦ 3 + 7 − x` is a **SIZES-ONLY** prediction the run **measured false on
6/6 pairs** (`4,0=0 ↔ 6,0=36` · `4,1=0 ↔ 6,1=72` · `4,2=0 ↔ 6,2=90` · `4,3=0 ↔ 6,3=80` ·
`4,4=0 ↔ 6,4=81` · `4,5=0 ↔ 6,5=32`): accepts never inherit a prediction, and no clause was invented
from a refuted one.

---

## §4 · What stays open, deliberately

- **Registration is the R-007-era train, not this ticket.** The `ACT_III_*` policy constants (band
  endpoints, the opener multiset, the relief-5 spec), the `l041`–`l045` documented-lesson rows, the
  sidecar at **45**, the registry row (GAME), the count pins and the 45-rung walk-class envelope
  pre-alert arithmetic are all named and **not taken** here. This batch's whole deliverable is five
  proven shelf bytes plus their record.
- **The ranking this act's ladder does *not* settle.** §7.10.2's O4 anti-mirror clause is satisfied by
  multiset (`[20, 22, 24, 26, 26]` is distinct from every registered Act II multiset) while **3 of 4**
  distinct pars coincide with a registered one — unavoidable on a finite integer band, printed rather
  than implied away. The `par 26` rung is the act's genuinely new axis.
- **The `H` (both-pair) composition and the XOR multi-switch door remain an explicit NON-CLAIM**, handed
  forward by name to Game Designer + Architect. The `5`-pocket class is refused by §7.2's family text
  and was **not censused**: a census of a forbidden device is an invitation to a family change, which is
  a design decision, not a level ticket's.
- **`--pocketsize ≥ 11` stays DEFERRED**, with the scope stated and **no ceiling wording in either
  direction**: the pocket census is complete for size ≤ 10 (`17 476` leak-free members) and **unmeasured
  at ≥ 11**, so no document — this one included — may claim "9 is the largest pocket" or "the device's
  ceiling is 20". The same law forbids reading this batch's `4201`-of-`20000` prefix as a total: the
  budget was **HIT**, so the accept count is a **floor** for these five devices on this frame.
- **F-L41-4 (the ladder table's act-blind operand label)** is booked with its remedy and its blast
  radius stated: no verdict depends on it, and fixing it means re-running the Act II byte-identical A/B
  it is printed inside.
- **`docs/level-design.md:42`'s windows** (the design-lane half of the same stale-range finding the
  micro-fix addresses in code) are **not this lane's file** and stay the named handoff they already
  were.