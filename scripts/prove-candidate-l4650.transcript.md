# LV-019 — the proving side of Act III's **batch 2** (`l046`…`l050`, shelf candidates)

Companion to `scripts/author-l46-l50.transcript.md`. Every number here is read from the **landed bytes**
(`src/levels/candidates/l046.json`…`l050.json`) through `@/core/solver/*` + `@/core/rules` by
`scripts/prove-candidate.ts` (and, for the two independent readings, `scripts/solve-levels.ts` and
`scripts/author-l21.ts --stage=struct`); nothing is quoted from the authoring script, and nothing in this
file can write a level. The authoring dossier's table is **re-measured** here, not trusted.

**Order of artifacts (law before census before bytes; finding before fix).** `166089d` the rule header —
GD-013's §7.10.6 **B1–B7** applied and cited by artifact+commit, the ladder `[22, 24, 26, 26, 26]` quoted
**as a tie-break**, §7.10.7's instance-6 fill-in *procedure*, the pre-registered falsification test and
the derived probe formula — published **docstring-only** (175 added / 0 removed) before any census or byte
→ `029bed9` **F-L46-1**, published **docstring-only** (86 added / 0 removed) *before* the line that fixes
it moves → `fe445b5` the F-L46-1 repair + the census record (`author-l46-l50.transcript.md`) + the
instance-6 fill-in (`ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489`, derived `Δ = −4.212830`) → **this commit**
the five bytes + the shelf `README.md` restate + this transcript (+ the disclosed R-007 attest refresh) →
the owner-docs commit (pipeline §8.28 / V-bump, `docs/level-difficulty.md` measurement rows). Each step is
checkable in `git log -p`; none can be back-dated. The rule commit is the proof that the ladder was
**not** searched: it is quotable from the law module's constants before any board existed. The five bytes'
git blobs are `0b2eca575a…` · `7f2809707c…` · `2a7da5cfda…` · `e8ad4e8fef…` · `38107bcaec…`.

**The law this batch executes.** `docs/level-design.md` §7.10.6 (**GD-013**, RIDER to design-0008:
extends, never overrides; provenance commit `1d6c90f` published **pre-census**) — **B1** the interior-batch
rule `A_ℓ = PAR_FLOOR + 2(ℓ−1)` with anchor `22`, **B2** the self-check that **reproduces the registered
opener multiset `[20, 22, 24, 26, 26]` exactly**, **B3** the half-wide ceiling `26 + 3·1.6875 = 31.0625`
(`0.6875` below any `par 28` tail rung's floor `31.7500`), **B4** truncate-and-fill at the truncated top,
**B5** the plural-same-par tie-break (the case the opener never exercised), **B6**
**ABSENT-never-substituted** with a `Δpar = 0` STOP-AND-ROUTE, **B7** the anti-mirror against every
registered multiset; plus §7.10.7's **instance 6** (batch-seam `L45 → L46`) and §7.10.5's `ΔM = 0`
clause (no new mechanic; the XOR door stays **U-002**'s, reserved for the second half). Frozen instrument
constant: `LAW_PRECISION = 5e-7`.

---

## §0 · The instrument finding this batch carries, as published — F-L46-1

`scripts/author-l21.ts`'s `measureCut()` excluded `BLOCK_L1619_IDS` + `ACT_II_REGISTERED_IDS` and **had
never been extended for Act III**. With `l041`–`l045` registered by R-007 the cut basis silently became
`[1…15, 41…45]` and `cut.floor` became **`30.455319`** — *Act III's own registered tail* — while the
header printed `D_exec max over the L1–L15 basis` and, **on the same line**, `basis ids [… 41 … 45]`.
Because `escalation` is `dexec > cut.floor`, the gate silently demanded *"`D_exec` > the Act III tail"*.

**The receipts, both readings published side by side** (the pre-fix reading is never overwritten by the
repaired one):

| reading | cut floor | basis ids | accepts | `par 22` / `par 24` | ledger |
|---|---|---|---|---|---|
| **pre-fix** (`/tmp/lv019/prefix-census.txt`) | `30.455319` | `[1…15, 41…45]` | **1138** | **empty / empty** | `par 27: 609 · par 28: 529` · `escalation 3063` |
| **post-fix** (this tip) | `14.969697` | `[1…15]` | **4201** | `373 / 483` | `derived-two-room-door 219 · g5-identity-broken 1143 · par-out-of-band 7794 · unsolvable 6643` |

`4201 − 3063 = 1138` **exactly**, and the recorded LV-018 arm for the **identical** command
(`--batch=5`, `parmin=20 parmax=28`) returns **4201** with every par `20…28` populated — so the truncation
looks like a clean cut precisely because **no `par 27`/`par 28` row lies in `30.455319 … 31.0625`**. At
the same frame the **Act II** path was empty **by arithmetic alone** (its gate demanded `D_exec > 30.455319`
while its own band ceiling is `29.0625`). The fix is **one exclusion** plus a **derived** clause (the
printed text composes the three law constants rather than typing them, and a new tooth checks that every
excluded id is **present in the root** — so a stale exclusion list cannot read as a clean basis).

**Blast radius measured, not asserted.** `--stage=roomcap` stdout moves in exactly **two `CUT` lines and
nothing else** — `diff` **8 lines per arm** on both the Act II arm (`a2`) and the Act III arm (`a3b6`) —
because the clause line and the F-L36-1 divergence line are the fix's own text and no measured verdict
line moves.

**A pre-registered falsification test may not fire on a broken instrument.** B1's clause (ii) (the
`par 22` rung must be **selectable**) *appeared* to fire on the pre-fix census — `par 22` was empty — but
the instrument, not the law, was refusing it. The finding was published, the instrument repaired, and the
**identical command re-run**: `par 22 = **373** accepts` → **clause (ii) holds, no STOP fires, and no B6
fallback is taken** (B4's fill was nevertheless executed and printed, for the record).

---

## §1 · The batch, proved from the landed bytes

```
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates
```

**`LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))`** — every rung
**20 gates / 20 `ok` / 0 `FAIL`**, 13 named controls per rung (65 = 5 × 13).

| rung | par (solver) | `D_exec` | `B` | coverage | chain (press→cross) | g6 rooms (derived) | g5 seal tiles not adjacent | all-OFF world |
|---|---|---|---|---|---|---|---|---|
| L46 | 22 | 26.242489 | 1.4142 | 49/49 | 120/120 | 5 · `[d1:4,0+5,0+5,1+6,0 · d2:3,2 · d3:4,4 · d5:3,6 · d4:6,6]` | 13 (free region 10) | UNSATISFIABLE |
| L47 | 24 | 28.216304 | 1.4054 | 49/49 | 1440/1440 | 5 · `[d1:4,0+5,0+5,1+6,0 · d2:3,2 · d5:6,3 · d3:4,4 · d4:3,6]` | 14 (free region 10) | UNSATISFIABLE |
| L48 | 26 | 30.227421 | 1.4091 | 49/49 | 48/48 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d3:3,3 · d5:6,5 · d4:3,6]` | 13 (free region 7) | UNSATISFIABLE |
| L49 | 26 | 30.227564 | 1.4092 | 49/49 | 36/36 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d5:3,4 · d3:6,5 · d4:4,6]` | 13 (free region 10) | UNSATISFIABLE |
| L50 | 26 | 30.417021 | 1.4723 | 49/49 | 108/108 | 5 · `[d1:3,0+4,0+4,1+5,0 · d2:6,2 · d5:5,4 · d3:3,6 · d4:6,6]` | 12 (free region 10) | UNSATISFIABLE |

**What each column is worth.** The room lists are **re-derived from the bytes**, which is what makes
`covering doors distinct` read `true` 5/5 (the F-L41-2 derivation, one truth source for both the generator
and the prover). `par` is the solver's own `shortestSolution` and `par-stamped` is `ok` 5/5. `chain` is the
G2 relation and it is `n/n` on every rung: the whole ordered `s1>s2>s3>s4>s5` chain executes **before** the
crossing on **every** shortest route, never merely on one. `region` reads `deadStates=0 ·
noUnrecoverableOk=true · T=0 · R=0` 5/5. Every rung's all-OFF world is **UNSATISFIABLE**
(`allOffShortest=null`, `allOffGoalReachable=false`).

**`g4`'s forcing is staged, not asserted.** All five report one shared press order with
`distinct switches per route: min = 5` (requirement ≥ 3) and staged worlds that must all read FALSE for
both the next switch's tile **and** the goal: `drop{s1} ⇒ s2 unreachable · drop{s1,s2} ⇒ s3 unreachable ·
drop{s1,s2,s3} ⇒ s4 unreachable · drop{s1,s2,s3,s4} ⇒ s5 unreachable`.

**`g5`'s census identity is BROKEN on all five** — the point of the gate. The world with the landing
device (door `d1` + its switch) removed solves at **`16 / 18 / 24 / 24 / 24`**, each **strictly below** its
`par` (`22 / 24 / 26 / 26 / 26`): the board's par is not a one-press arithmetic, so no rung is a disguised
simple level. (On this device the break is carried by the **goal's own seal**, since the landing channel is
the pocket rather than a free-region tile: the seal tiles are exactly the `12–14` non-adjacent tiles
listed, and the removed-device world loses the ordered presses, not an exit.)

**The ladder, from the same run's table** (act-aware operands):

```
L46 · par 22 · 26.242489 · 1.4142 · 49/49 · Δpar —    · rise —        · delta -2.212830
L47 · par 24 · 28.216304 · 1.4054 · 49/49 · Δpar ≥2 (2) · rise OK (1.973815) · delta -0.239015
L48 · par 26 · 30.227421 · 1.4091 · 49/49 · Δpar ≥2 (2) · rise OK (2.011117) · delta  1.772102
L49 · par 26 · 30.227564 · 1.4092 · 49/49 · Δpar <2 (0) · rise OK (0.000143) · delta  1.772245
L50 · par 26 · 30.417021 · 1.4723 · 49/49 · Δpar <2 (0) · rise OK (0.189457) · delta  1.961702
batch peak: L50 at 30.417021 · §7.3 act-peak clause DISCHARGED · headroom to the Act III ceiling 33.0625: 2.645479
```

`Δpar ≥ 2` holds on **2 of 4** steps — the honest count for this ladder: **B3** truncates the window at
`26`, so B4's fill repeats the truncated top **twice**, which is the case §7.10.6's B4/B5 exist for. The
ladder rises anyway (an *observation*: §7.3 carries no interior-rise obligation). **B5's plural-same-par
departures are printed, never silent**: `2` lower-`D_exec` par-26 rows were refused by the rung-key-wide
distinct clause before `L49` took `30.227564`, and the **closing** rung `L50` took the within-par
**maximum** `30.417021` (its minimum is `30.227421`) so the batch's maximum lands as late as the law
permits.

**Band containment, derived-exact both directions (§7.9).** Every rung sits inside `[23.75, 33.0625]`
**inclusive** and inside `par` band `[20, 28]` inclusive; the compared operands ARE the derived values, so
the printed `[23.75, 33.06]` never judges anything. **B3's ceiling is enforced on the admitted rows**, not
only asserted: `L46 26.242489 ≤ 31.0625 · L47 28.216304 ≤ 31.0625 · L48 30.227421 ≤ 31.0625 ·
L49 30.227564 ≤ 31.0625 · L50 30.417021 ≤ 31.0625`.

**B2's self-check reproduces landed history, printed on the selection run**: the identical rule applied at
`ℓ = 1` returns the registered opener multiset `[20, 22, 24, 26, 26]` — `REPRODUCED EXACTLY`. And **B7's
anti-mirror is a multiset comparison**, printed against all four registered Act II multisets and the
opener's: `[22, 24, 26, 26, 26]` is **distinct from every one of them**, while the distinct pars `3 of 3`
(`22`, `24`, `26`) coincide with registered ones — unavoidable on a finite integer band, published rather
than implied away.

**The relief instance 6, re-derived from the landed bytes** (§7.10.7; label pre-published by GD-013):

```
L46 par 22 · D_exec 26.242489 · B 1.4142 vs L45 par 26 · D_exec 30.455319 · B 1.4851
  Δpar -4 · ΔB -0.0709 · 3·ΔB -0.212811 · ΔD_exec = -4.212830
  bound [-4.705319, -1.392819] → INSIDE · par-22 admissible half [-4.705319, -3.392819] → INSIDE
  the "+2 shift identity" checked, not trusted: 22 − 30.455319 = 20 − 28.455319 = -8.455319
```

The constants `ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489` / `_DELTA = -4.212830` were committed in
`fe445b5` — **one commit before `l046.json` exists** — and the post-fix re-derivation returns the same
value (`|Δ| 2.704e-7 < LAW_PRECISION 5e-7`, **MATCH** on both constants). Instance 5's `−4.197990` is
**not** reusable here: the bound coincides, the **value** does not (`B 1.4142` vs `1.4191`).

**The act reading — a READING, never a clause claim.** §7.10.6 gives batch 2 **no** `act-peak` /
`act-close` branch either (§7.3.2's carrier is `L51–L60`), so the tool carries none here. What the bytes
measure: the batch maximum is **L50 `30.417021`**, which sits **`0.038298` BELOW** L45's registered
`30.455319` — the act's maximum **remains at L45** until `L51–L60` lands. That is **reported, never
repaired by padding**: no rung was re-selected or re-stamped to make the batch peak rise.

---

## §2 · Falsifications (the checks were asked to fail, and did)

**The derived probe, sized to THIS batch (never typed — F-L41-3's rule: a falsifying comparator must sit
ABOVE the peak).** `--peak = (L50 30.417021 + ACT_III_EXEC_BAND[1] 33.0625)/2 = 31.739760638297874`,
strictly inside the act band and strictly above this batch's own peak:

```
exit 1
  FAIL act-peak  D_exec=30.417021 vs the PREVIOUS act's registered maximum (Act II ≡ L40's measured D_exec) 31.739761 (delta -1.322739) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L50
RESULT: FAIL
LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
```

**Exactly one `FAIL`, exactly one rung — L50, the rung carrying the maximum** — with L46–L49 still
`ACCEPT` and the battery still **65/65**. The **exit code** is the deliverable: a probe that reddens a
*neighbour*, or that fails nothing, would have been a finding in its own right (that is exactly F-L41-3).

**The A/B receipts.**

| A/B | command | result |
|---|---|---|
| the registered Act III **opener**, proved from the ROOT, before vs after the F-L46-1 fix | `prove-candidate --act=3 --family=g --ladder=41…45 --dir=src/levels` | **byte-identical** (`cmp` clean, 92 704 bytes both sides) — exit 0, `PASS (5/5 … 65/65)` |
| the Act III **opener's generator dump**, before vs after the fix | `author-l21 --stage=g --act=3 --batch=5 … --budget=20000 --accepts=…` | the accepts dump is **byte-identical** (`cmp` clean, 5 064 906 bytes; `4201` accepts both sides) |
| the **Act II** arm on the shared generator path (batch 4) | `author-l21 --stage=g --batch=4 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24` | accepts dump **byte-identical** to LV-018's recorded arm (`293` accepts); stdout differs **only** in the two volatile lines (elapsed seconds, `--accepts=` path) plus the clause/dataset-state lines the fix itself rewrites |

So the fix's own text and the dataset-state lines are the **only** stdout delta, and **no verdict, ledger,
histogram or accept count moves** on either arm. The stronger form is the dump-level identity above: the
opener's generator output is unchanged **to the byte**, which is why this batch's five bytes are derivable
from the same pool the opener came from.

---

## §3 · The rest of the acceptance battery

**3.1 · The expectation pass (F-L16-3 order — measured, not asserted).**

```
--measure-controls → PASS (5/5 rung(s) ACCEPT, controls MEASURED, not asserted (F-L16-3): 65)
```

**3.2 · The independent reader.** `solve-levels.ts --audit src/levels/candidates` →
**`5/5 level file(s) PASS · par verified from the solver on 5/5 · RESULT: PASS`**. This reader is not the
prover and does not share its ladder logic, so agreement is evidence rather than tautology.

**3.3 · The F-L41-2 structure ledger, over any directory through the SAME derivation**
(it is act-independent by construction, so it can adjudicate the registered corpus too):

```
--stage=struct --dir=src/levels/candidates → struct ledger: 5 in class · 0 out of class
--stage=struct --dir=src/levels            → struct ledger: 45 in class · 0 out of class
```

The clause refuses **nothing** on either corpus — the receipt says the derivation and the lattice agree on
the landed bytes, and it is the instrument F-L41-2 was repaired *into*.

**3.4 · Clone keys.** The five rungs carry **5 distinct §6.1.4 seal-inclusive keys** and **0 collide with
a shipped board**; the generator's guard takes **41** keys over the **45** registered root files and its
taken-set grows to **46** once the shelf is included — `41 + 5 = 46`, the arithmetic form of "all five keys
are fresh" rather than a resemblance. Selection-time refusals: `159` of the batch's **`3063`** in-band
accepts were refused by the clone guard (`2904` usable), so the guard **bites**.

**3.5 · The registered set and the census pins did not move.**

```
npm run levels                              → 45/45 ok · 0 errors · 218 warnings (0 multi-switch-door) · 11/11 negative cases
solve-levels.ts --audit src/levels          → 45/45 PASS (par verified 45/45)
docs/level-difficulty.report.json           → 45 records · NOT regenerated
git diff develop -- src/levels/*.json       → EMPTY  (the five files are in candidates/, which the root walk does not enter)
```

The shelf stays invisible to every shipped-set census because the three consumers walk the root
**non-recursively** (`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`,
`tests/solver/metrics-sidecar.test.ts`'s report length, `src/game/levels/level-registry.ts`'s explicit
imports). That is the same mechanism that withheld the L16–L19 rows through LV-010, L20 through LV-011,
batch 1 through LV-012, batches 2–3 through LV-014/LV-015, L36–L40 through LV-017 and the Act III opener
through LV-018.

**3.6 · The R-007 registration re-attested — with its shelf-state claims refreshed (disclosed).**
`scripts/attest-r007-reg45.ts` exits **0 · `RESULT: REGISTERED-MATCH` · 0 divergence(s)**, all five
registered rungs byte-identical to `82dd808:src/levels/candidates`, the 22-clause act-tail partition
intact, both boundary directions holding and the §7.3.1 instance-5 label quoted verbatim.

The refresh is a **body** change, forced by LV-019's occupancy, and it is worth stating exactly what
moved, because the two failing checks were *era claims* rather than defects:

| R-007 body said | LV-019 refresh says | why |
|---|---|---|
| *the shelf is EMPTY of level files* | *the shelf holds **no registered id** and every shelf id is **strictly above** the registered root max* (printing `[46, 47, 48, 49, 50]` vs root max `45`) | the shelf is a **work surface**, not a frozen artifact; the durable harm the check exists to catch is a moved rung surviving as a **copy** — and a candidate above the registered max is not a copy |
| *the successor `l046.json` is ABSENT from the root **and** from the shelf* | *... ABSENT from the **root*** (holds), **printing** that the shelf holds it as a candidate | a shelf file is a **candidate**, never a registration; the harm is a rung becoming registered twice or unbooked |
| *a ladder pointed at the **now-EMPTY** shelf exits ≠ 0* | *a ladder pointed at the shelf — which holds **no registered rung** — exits ≠ 0* (measured `exit 1`) | same assertion, honest label |

Precedent: **R-006a refreshed the R-005a attest's body** for the same reason (an instrument that describes
an era must be re-read when the era moves), and the registered bytes, the roster, the ladder proof and
every act-level clause are unchanged by the refresh — the run's `0 divergence(s)` is what shows that.

**3.7 · The battery, and the one red this batch books.**

```
with the shelf as committed:   1 failed · 1040 passed · 3 skipped (1044)   [1 failed file]
with the five files off the shelf: 0 failed · 1041 passed · 3 skipped (1044)   [the same command, same tree]
the single red: tests/solver/l16-l20-candidates.test.ts:252
  AssertionError: expected [ 'l046.json', 'l047.json', …(3) ] to deeply equal []
```

The booking literal is **`[]`** (R-006c's booking) and five fresh shelf files are exactly its business:
the row is **RED by name, in the populated direction**, and **exactly one row moved from pass to fail —
no other row moved**, which the baseline above measures rather than assumes. The row's other half (*every
shelf rung strictly above the registered root max*, asserted on the **file names**) stays **GREEN** — this
batch's names are all above root max **45** — and the count pins are green because **R-007c** has merged
(`1e93984`: pin tables re-booked 40 → 45). Only a registration ticket moves the bytes **and** re-books the
literal; `tests/**` is **off this lane and was untouched**.

**3.8 · `tsc --noEmit` → 0 errors.**

---

## §4 · What stays open, deliberately

- **Registration is the R-008-era train, not this ticket.** The `ACT_III_B2_*` policy constants, the
  `l046`–`l050` documented-lesson rows, the sidecar at **50**, the registry row (GAME), the count pins and
  the 50-rung walk-class envelope pre-alert arithmetic are all named and **not taken** here. Instance 6 is
  deliberately **not** appended to `ACT_SEAM_RELIEFS_ALL` — that is R-008's move, exactly as appending
  instance 5 was R-007's and not LV-018's. This batch's whole deliverable is five proven shelf bytes plus
  their record.
- **The batch peak is BELOW the act's registered maximum and that is published, not padded.** §7.10.6's
  read-out (no `act-peak`/`act-close` branch for batch 2) is what makes the honest reading possible:
  `L50 30.417021 < L45 30.455319` by `0.038298`. The act's maximum simply **remains at L45** until
  `L51–L60` lands, and any later ticket that wants a rising act maximum has to earn it on a later batch.
- **The ranking this act's ladders do not settle.** B7 is satisfied **by multiset** (`[22, 24, 26, 26, 26]`
  is distinct from every registered multiset) while **3 of 3** distinct pars coincide with a registered
  one — unavoidable on a finite integer band, printed rather than implied away. The repeated `par 26` is
  the act's genuinely new axis (the opener used it twice, this batch three times).
- **The `H` (both-pair) composition and the XOR multi-switch door remain an explicit NON-CLAIM**, handed
  forward by name to Game Designer + Architect (**U-002**). No device decision gated `L46`–`L50`, and
  `ΔM = 0` is measured, not asserted (M is 4 on every rung, as on the opener).
- **`--pocketsize ≥ 11` stays DEFERRED**, with no ceiling wording in either direction: the pocket census
  is complete for size ≤ 10 and **unmeasured at ≥ 11**, so no document — this one included — may claim
  "9 is the largest pocket" or "the device's ceiling is 20".
- **The `par 28` reservation is intact.** The withheld tail par is **ABSENT** from this batch and was
  **never substituted** (B6); §7.3.2's `act-close` carrier `L51–L60` keeps its `0.6875` margin, re-derived
  from the band on this run's own admitted rows.

---

## §5 · The commit trail this proof belongs to

```
166089d  feat(level)  the rule header — B1–B7 + instance-6 procedure + the pre-registered test (docstring only, 175/0)
029bed9  fix(level)   F-L46-1 published BEFORE the fix byte (docstring only, 86/0)
fe445b5  feat(level)  the F-L46-1 repair + the census record + instance 6 filled in BEFORE the bytes
this     feat(level)  the five shelf bytes + the shelf README + this transcript + the R-007 attest refresh
next     docs(...)    pipeline §8.28 + V-bump, docs/level-difficulty.md measurement rows
```

`STOP_AND_ROUTE` was the honest answer available at every step, and the one time the temptation existed —
`par 22` looking empty, which B1's clause (ii) would have read as a falsification — the finding was
published, the **instrument** repaired, and the identical command re-run rather than the ladder switched.