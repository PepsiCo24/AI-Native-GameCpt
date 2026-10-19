# `src/levels/candidates/` — the proposal shelf (**OCCUPIED**: five Act III batch-2 rungs)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the **registered** L16–L20 block, §2f the
> **registered** Act II batch 1, §2g the **registered** Act II batches 2 + 3, §2h the **registered**
> Act II batch 4 (`l036`–`l040`) and **§2i the registered Act III batch 1 (`l041`–`l045`)** — the five
> rungs that occupied this shelf before them, graduated by **R-007**. **This shelf now holds five level
> files again** (`l046.json` … `l050.json`, **LV-019**'s Act III batch 2), so the section immediately
> below is a **current** reading taken on the landed shelf bytes; every older era below it is kept as
> **provenance** (a registration is a byte-copy), and the boards' public record, once `R-008` registers
> them, will be `src/levels/README.md` §2j plus the two transcripts
> (`scripts/author-l46-l50.transcript.md`, `scripts/prove-candidate-l4650.transcript.md`).

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current occupancy (LV-019) — **Act III batch 2 (`l046`–`l050`)**, unregistered

**LV-019 wrote the second batch of Act III here** — five rungs on the **`7×7` @ `CX = 1`** frame
(§7.4's second frame), the **same proven device class** the opener registered (the **4-pocket /
5-door / 5-press** ordered chain: five walk-sealed rooms incl. the landing pocket and the goal's own
seal), so **`ΔM = 0`** and no new mechanic enters (§7.10.5's YAGNI clause, U-002's XOR reservation for
`L51–L60`). The batch's rule is **GD-013** (`docs/level-design.md` §7.10.6 **B1–B7** + §7.10.7
instance 6; ADR `docs/decisions/design-0009-…`), **applied** from the law module — never re-derived —
and its ladder is the published multiset **`[22, 24, 26, 26, 26]`** (`par 22 / 24 / 26 / 26 / 26`).

Every number below was measured on **these** bytes by `@/core/solver/*` and `@/core/rules` — the same
readers that judge the shipped set — and the proof transcript is
`scripts/prove-candidate-l4650.transcript.md`.

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | coverage | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|---|
| `l046.json` | `0b2eca575a…` | `d5f26dea…` | 22 | 26.242489 | 1.4142 | 49/49 | 120/120 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l047.json` | `7f2809707c…` | `55b9c88f…` | 24 | 28.216304 | 1.4054 | 49/49 | 1440/1440 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l048.json` | `2a7da5cfda…` | `c6c0e12a…` | 26 | 30.227421 | 1.4091 | 49/49 | 48/48 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l049.json` | `e8ad4e8fef…` | `2866324b…` | 26 | 30.227564 | 1.4092 | 49/49 | 36/36 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l050.json` | `38107bcaec…` | `25d5b11a…` | 26 | 30.417021 | 1.4723 | 49/49 | 108/108 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

`par` is the solver's own reading, never the file's stamp (`par-stamped` 5/5 `ok`). `coverage` is
`distinctPositions = 49` on the `7×7` frame, `chain` is `press-then-cross` over the number of shortest
routes (`n/n` on all five, so the **ordering** is carried by every shortest solution), `T ≡ R ≡ 0` and
`deadStates 0` / `noUnrecoverableOk true` on 5/5, and every rung's all-OFF world is **UNSATISFIABLE**
(`allOffGoalReachable = false`): with every switch OFF the landing room's door refuses its only exit,
so the far region is unreachable — the latch carries *existence*, not decoration.

```bash
# ── LV-019's live commands on THIS shelf ──
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates
#   → LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates --measure-controls
#   → the expectation pass (F-L16-3 order): controls MEASURED, not asserted — 65 across the 5 rung(s)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates --peak=31.739760638297874
#   → exit 1 · FAIL (4/5 rung(s) ACCEPT, controls named 65/65) · exactly ONE FAIL, `act-peak`, on exactly the peak rung L50
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates
#   → an independent reader: 5/5 level file(s) PASS · par verified from the solver on 5/5 · RESULT: PASS
node_modules/.bin/tsx scripts/author-l21.ts --stage=struct --dir=src/levels/candidates
#   → the F-L41-2 receipt on this shelf: 5 in class · 0 out of class (the clause refuses nothing here)
```

**The ladder is APPLIED from the law, and the rule proves itself against landed history.**
`ACT_III_B2_PAR_MULTISET` is read out of `@/core/solver/policy`, never re-derived by taste: the
P2-exact window from **B1**'s anchor `22` is `22, 24, 26, 28, 30`; **B3** truncates it at the
**reserved** top `26` (§7.3.2's `act-close` carrier is `L51–L60`'s), **B4**'s descending fill repeats
the truncated top, and **B2**'s self-check — the identical rule applied at `ℓ = 1` — **reproduces the
registered opener multiset `[20, 22, 24, 26, 26]` exactly** (`REPRODUCED EXACTLY`, printed on every
selection run). The ceiling is derived rather than chosen: `26 + 3·1.6875 = **31.0625**` is
`0.6875` below any `par 28` tail rung's floor `31.7500`, and it is enforced **on the admitted rows**,
not only asserted in prose (`L46 … L50 ≤ 31.0625`, printed per rung). **B7**'s anti-mirror is printed
as a **multiset** comparison against every registered Act II multiset and the opener's: the distinct
pars `{22, 24, 26}` coincide with the opener's `{20, 22, 24, 26}` on **3 of 3** — unavoidable on a
finite integer band, so it is published rather than implied away — while the **multiset** differs
(`par 26` three times here, twice in the opener). **B5**'s plural-same-par case (the one the opener
never exercised) is printed as two departures: `L48` takes the par-26 pool's **minimum** `30.227421`
(the first of the pair), `L49` the next ascending row `30.227564` after **2** lower rows were refused
by the rung-key-wide distinct clause, and the **closing** rung `L50` takes the within-par
**maximum** `30.417021` so the batch's maximum lands as late as the law permits.

**The clone census is `5` distinct §6.1.4 seal-inclusive keys with `0` collisions** against the
**`41` distinct geometry keys** the guard takes over the **`45`** registered root files (`l001`–`l045`;
the shipped-set census walk is non-recursive, so this shelf is invisible to it). The arithmetic form of
"all five keys are fresh" is measured, not asserted: the derived-structure ledger run over this
directory reads **`46` geometry keys taken** — the `41` registered keys `+` these five, with `0`
collisions — and `159` of the batch's `3063` in-band accepts were refused by the clone guard before
selection, so the guard **bites**.

**The relief instance 6 was filled in BEFORE these bytes existed** (`ACT_III_B2_SEAM_RELIEF_EXEC =
26.242489`, derived `Δ = −4.212830`, committed one commit before `l046.json`). L46 `par 22` /
`D_exec 26.242489` against L45 `par 26` / `30.455319` gives `ΔD_exec = Δpar −4 + 3·ΔB −0.212811`,
**inside** the published bound `[−4.705319, −1.392819]` **and** inside `par 22`'s own admissible half
`[−4.705319, −3.392819]` — the union is **not** an interval, and the tool checks the half, not only
the range. The bound coincides with instance 5's by the published `+2` shift identity
(`22 − 30.455319 = 20 − 28.455319`) while the **value must not**: `−4.212830` is this board's own `B`
(`1.4142`), not `L41`'s `−4.197990` (`B 1.4191`).

**The act reading — a READING, never a clause claim.** §7.10.6 gives batch 2 **no** `act-peak` /
`act-close` branch either (§7.3.2's carrier is `L51–L60`), so the tool carries none here. What the
bytes measure: the batch maximum is **L50 `30.417021`**, which sits **`0.038298` BELOW** L45's
registered `30.455319` — the act's maximum **remains at `L45`** until `L51–L60` lands, and that is
**reported, never repaired by padding**. Against the §7.3 across-act comparator (Act II's registered
tail `28.455319`) the batch is `+1.961702`; the headroom to the Act III `D_exec` ceiling `33.0625`
(printed `33.06`; §7.9's notation law — the *derived-exact* value is the one that counts) is
`2.645479`. **A shelf file moved no registered number:** the tails, the bands, `ACT_II_PAR_CEILING`,
`BLOCK_L1619_IDS` and `ACT_SEAM_RELIEFS_ALL` are all untouched — instance 6 is **deliberately not
appended** to the relief register, because that is the **R-008**-era train's move, exactly as R-007
(not LV-018) appended instance 5.

**An instrument fault rides this batch, published before the line that fixed it moved — `F-L46-1`.**
`scripts/author-l21.ts`'s `measureCut()` excluded `BLOCK_L1619_IDS` + `ACT_II_REGISTERED_IDS` and had
**never been extended for Act III**: with `L41–L45` registered by R-007 the cut basis silently became
`[1…15, 41…45]` and `cut.floor` became **`30.455319`** — *Act III's own registered tail* — while the
header printed `D_exec max over the L1–L15 basis` and, **on the same line**, `basis ids [… 41 … 45]`.
Because `escalation` is `dexec > cut.floor`, the gate silently demanded *"`D_exec` > the Act III
tail"*: the batch's first census returned **`1138`** accepts (`par 27: 609` · `par 28: 529`, `par 22`
and `par 24` **empty**, `escalation 3063`) where the recorded LV-018 arm for the **identical** command
returns **`4201`** with every par `20…28` populated — `4201 − 3063 = 1138` **exactly**, and the
`par 27`/`par 28` rows match to the digit. At the same frame the **Act II** path was empty **by
arithmetic alone** (its gate demanded `D_exec > 30.455319` while its own band ceiling is `29.0625`).
The finding is published **docstring-only** at `029bed9`, the fix is one exclusion plus a **derived**
clause (the printed text now composes the three law constants, and the run checks that every excluded
id is present in the root), and the blast radius is measured as a **diff in both acts**: `--stage=roomcap`
stdout moves in exactly **two `CUT` lines and nothing else** (`diff` 8 lines per arm). The
**pre-registered falsification test** (B1's clause (ii)) *appeared* to fire on the broken instrument
and was **re-run on the repaired one**: `par 22` = **373** accepts, so clause (ii) holds, **no STOP**
fires and **no B6 fallback** is taken (B4's fill was nevertheless executed and printed).

**The booking row is RED here — by name, in the *populated* direction, and it is the ONE red this
batch's bytes produce.** The literal is **`[]`** (R-006c's booking), so with five files on the shelf the
suite prints — *measured on this tip, not predicted* —
`AssertionError: expected [ 'l046.json', 'l047.json', …(3) ] to deeply equal []` at
`tests/solver/l16-l20-candidates.test.ts:252` (the set-equality row; the literal itself is `:239`). It
is **booked, not fixed**: only a registration ticket moves the bytes **and** re-books the literal, and
`tests/**` is **off this lane**. The baseline was measured the same way — with these five files
temporarily off the shelf the same command reports **`0 failed · 1041 passed · 3 skipped`**, and with
them on it **`1 failed · 1040 passed · 3 skipped`**: exactly **one row moved from pass to fail**, and
**no other row moved**. The row's other half — *every shelf rung strictly above the registered root
max*, asserted on the **file names** — stays **GREEN** and is the live guard that matters here: this
batch's names (`l046` … `l050`) are all above the root max id **`45`**, and that half is re-derived per
run, never typed (F-L36-1 item 4: it is an **`id`** relation, which is exactly why a shelf rung's
`D_exec` is *not* required to exceed the registered root's `D_exec` — `L31` sits at `23.204167`, below
its era's registered max). **The count half is GREEN at this tip, because R-007c has merged** (`1e93984`:
the pin tables re-booked 40 → 45), so `rootMax`/`maxShipped` and `EXPECTED_LEVEL_COUNT`
(`tests/e2e/helpers/levels.ts:147`) all read **45**.

**This shelf is invisible to every shipped-set census.** The three readers that count shipped levels
walk `src/levels/` **non-recursively** (`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`,
`tests/solver/metrics-sidecar.test.ts`'s report length, `src/game/levels/level-registry.ts`'s explicit
imports), which is why these five files sit here without moving a single count: `npm run levels` stays
**45/45**, the sidecar stays **45 records** (not regenerated), `solve-levels --audit src/levels` stays
**45/45 PASS**, and the tracked **root** level diff is **EMPTY**. What moves those counts is the
registration ticket, never the shelf.

## The previous reading — **EMPTY** at R-007's tip

Between **R-007**'s merge and **LV-019** this shelf was empty: `readdirSync("src/levels/candidates")`
filtered on `l\d+\.json` returned **`[]`** — the five Act III opener rungs `l041.json` … `l045.json`
had been `git mv`'d into `src/levels/` root, and the booking literal agreed with the shelf for the
**first time since R-004a**. The successor name was `l046.json`, **absent from the root *and* from this
shelf**, and that is the name **LV-019 consumed**.

## Graduation provenance (R-007) — the byte identity of the five files that last occupied this shelf

Those five files (`l041.json` … `l045.json`, **Act III batch 1 — GD-012's opener**) were moved into the
dataset root by **R-007** with `git mv`, **no content edit during the move**, rename 100 %, and `sha256`
**and** git blobs identical on both sides (5 files / 0 insertions / 0 deletions). Root blob ==
`82dd808:src/levels/candidates` blob **5/5**. The measurement below is LV-018's, re-measured on those very
bytes before the move and re-verified from the **root** after it (§2i): a registration is a byte-copy, so
the two readings must agree to the last digit. The five files are the
**4-pocket / 5-door / 5-press** member of §7.2's published family, on §7.4's **second
frame** (`7×7`, `CX = 1`) — the very device R-006a's rungs carry, i.e. **zero new mechanics** — executing
**GD-012's Act III opener ladder** (`docs/level-design.md` §7.10, **ADOPTED + USER-APPROVED 2026-10-19**;
ADR `design-0008`, RULING D). The batch's own new axis is **`par 26`**: no registered rung carries it,
and O4's anti-mirror clause is **printed beside the ladder**, never implied away.

`par` is the solver's own reading (`par-stamped` 5/5 `ok`), never the file's stamp. `coverage` is
`distinctPositions = 49` on the `7×7` frame. `chain` is the same `press-then-cross` relation the earlier
tables use — the number of shortest routes on which the whole ordered press chain runs **before** the
crossing — and it is `n/n` on all five, so the ordering is carried by **every** shortest solution.
`T ≡ R ≡ 0` and `deadStates 0` / `noUnrecoverableOk true` on 5/5, and every rung's all-OFF world is
**UNSATISFIABLE** (`allOffGoalReachable = false`): with every switch OFF the landing room's door refuses
its only exit, so the whole far region is unreachable — the latch carries *existence*, it is not
decoration. Every number below was measured on the **landed bytes** by `@/core/solver/*` and
`@/core/rules`, the same readers that judge the shipped set:

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | coverage | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|---|
| `l041.json` | `a07f7846…` | `e3fe42fb…` | 20 | 24.257329 | 1.4191 | 49/49 | 48/48 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l042.json` | `d130315e…` | `6d631d5b…` | 22 | 26.238773 | 1.4129 | 49/49 | 336/336 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l043.json` | `ae18e42b…` | `c749fca3…` | 24 | 28.213816 | 1.4046 | 49/49 | 27/27 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l044.json` | `a4da9d38…` | `eb6cdf6b…` | 26 | 30.225216 | 1.4084 | 49/49 | 27/27 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l045.json` | `a4d8860a…` | `e72d5446…` | 26 | 30.455319 | 1.4851 | 49/49 | 30/30 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

```bash
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates
#   → LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))   [20 gates / 20 ok / 0 FAIL per rung]
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --measure-controls
#   → the expectation pass (F-L16-3 order): controls MEASURED, not asserted — 65 across the 5 rung(s)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --peak=31.7589095
#   → exit 1 · FAIL (4/5 rung(s) ACCEPT, controls 65/65) · exactly ONE FAIL, `act-peak`, on exactly the peak rung L45
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --peak=29.455319
#   → exit 0 · PASS — the superseded header formula, kept as the F-L41-3 no-op receipt (a comparator below the peak cannot falsify)
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates
#   → an independent reader: 5/5 level file(s) PASS · par verified from the solver on 5/5 · RESULT: PASS
node_modules/.bin/tsx scripts/author-l21.ts --stage=struct --dir=src/levels
#   → the F-L41-2 receipt on the REGISTERED corpus: struct ledger: 40 in class · 0 out of class (the clause refuses nothing there)
```

**The ladder is DERIVED from the law, not searched.** §7.10.2's `[20, 22, 24, 26, 26]` (O1–O6) is read
out of the law module, never re-derived by taste: O1's P2-exact window is `[20, 22, 24, 26, 28]`, O2
withholds the derived top `par 28` — **reserved** for §7.3.2's `L51–L60` `act-close` carrier — and
repeats the truncated top `26` at its fifth rung, O3 proves the reservation (`26 + 3·1.6875 = 31.0625 <
28 + 3·1.2500 = 31.7500`, margin **0.6875** computed from the band, not chosen), O4 prints the
anti-mirror reading against every registered multiset, O5's empty-pool clause is
**ABSENT-never-substituted** with a STOP-AND-ROUTE to GD, and O6 puts the within-par **maximum** on the
closing rung. The coincidences are published rather than implied away: 3 of the 4 distinct pars
(`20 22 24`) also occur in a registered Act II multiset — unavoidable on a finite integer band — and the
ladder **rises** `+1.981444 / +1.975043 / +2.011400 / +0.230104` with `Δpar ≥ 2` on **3 of 4** steps.
The five files carry **5 distinct §6.1.4 seal-inclusive keys** and **0 collide with a shipped board**
(the clone guard reads **36 distinct keys over the 40 registered root files**, and its taken-set grows to
**41** with these five, which is the arithmetic form of "all five keys are fresh"). The **published
`7×6`@`CX=1` fallback was not needed** — the chosen frame populated every rung, so no silent frame
switch occurred and none was available to make. *(Every count in this and the following paragraphs is the
**LV-018-era** reading: the root then held **40** files, so the clone guard read **36** distinct keys over
them and the taken-set grew to **41**. At R-007 the root holds **45**; §2i carries the post-registration
readings, re-measured on the same bytes.)*

**The census is a prefix floor, and it prints its own accounting identity.** The Act III pool came from
`--stage=g --act=3 --batch=5 --pockets=4 --cx=1 --h=7 --pocketsize=4 --qmax=4 --paircap=40
--budget=20000 --cap=400 --parmin=20 --parmax=28` (158.1 s): **4201 accepts of 20000 judged** over
**417** `(R2,R3,R4)` groups, `devices walked 10/348`, the group cap hit on 9, and the budget **HIT** —
which is why the accept count is labelled a **floor** and never a total. The run closes by an identity it
prints itself: `accepts 4201 + refuses 15799 [derived-two-room-door 219 · g5-identity-broken 1143 ·
par-out-of-band 7794 · unsolvable 6643] = 20000` — **CLOSES exactly**. The **pre-fix** census
(`4402` accepts, `g5` 1161) is kept **verbatim beside** it in the authoring transcript, because the
receipt exists to show what a filter moved and may not overwrite its own earlier reading.

**Two instrument faults ride this batch, each published before the line that fixed it moved.**
**F-L41-2** — the generator's `g6` verdict read the rooms it had **declared**, while the prover
**derives** them from the landed bytes, so `l044`'s `d4 = [5,6 6,5]` rings the intended room **and** the
corner `{6,6}`: `g6-room-structure` refused the written board (`covering doors distinct=false
[d1 d2 d3 d4 d5 d4]`) while the generator accepted it. The finding is published **docstring-only** at
`e6d70fb`, and the law moves to **one** implementation, `scripts/room-derivation.ts`
(`derivedWalkSealedRooms`, `doorsCoveringTwoRooms`), imported by **both** `scripts/prove-candidate.ts`
and `scripts/author-l21.ts`, so the two cannot drift again. The clause is **act-scoped** (`ACT === 3`),
counts its refusal in the histogram, the upstream skip ledger **and** the identity, and **repairs
nothing**: `l044` was re-drawn from its own pool like any other refusal (`30.209890 → 30.225216`, both
`par 26`), and the other four rungs are **byte-identical** across the fix. The blast radius is
*arithmetic, not resemblance*: accepts `4402 → 4201` (**−201**), `g5` `1161 → 1143` (**−18**), new row
`219`, and `219 − 18 = 201` checks. `--stage=struct` is the receipt and reads any directory through the
**same** derivation: the registered corpus is `40 in class / 0 out`, and on the **pre-fix** shelf it
reproduced the prover's covering list **off the bytes** (`L44 l044.json: rooms=6 covering=[d1 d2 d3 d4
d5 d4] — door(s) covering TWO rooms: [d4] (OUT OF CLASS)`). **F-L41-3** — the header's published probe
`--peak = (our peak rung's D_exec + 28.455319)/2` is a midpoint whose operand sits **below** the peak it
was meant to falsify, so it falsified nothing: `--peak=29.455319` → **exit 0, `RESULT: PASS`**. The
operand is corrected to the band's **derived-exact ceiling** `33.0625`, giving
`--peak = (30.455319 + 33.0625)/2 = 31.7589095` → **exit 1**, exactly one `act-peak` FAIL on exactly
**L45**, controls still 65/65; the superseded form is **quoted** in the header beside the repair.
`F-L41-1` is the sub-finding both probes produced: a display form was being compared with `===` against
a measured double (`24.25732899022801` vs `24.257329`, `|Δ| 9.772e-9`), caught **only because the
verification line ran**; the comparison now uses the law module's own `LAW_PRECISION` (`5e-7`) and prints
both forms with the residue.

**§7.10.4's relief instance 5 is filled in BEFORE the bytes exist, and re-checked unchanged after the
filter.** L41 `par 20` / `D_exec 24.257329` against L40 `par 24` / `28.455319` gives
`ΔD_exec = −4.197990` = `Δpar −4` + `3·ΔB −0.197971`, **inside** the published bound
`[−4.705319, −1.392819]` **and** inside the `par 20` admissible half `[−4.705319, −3.392819]`. The
constants `ACT_III_B1_OPEN_RELIEF_EXEC` / `_DELTA` were committed **one commit before `l041.json`
existed** — the register's first fill-in-before-existence — and the post-fix re-derivation returns the
**same** value, so no re-publication was owed; that L41's `par 20` minimum is *stable across the filter*
is a measurement, not an assumption.

**The act reading — a READING, never a clause claim.** §7.3.2's `act-close` carrier is `L51–L60`, **not**
the opener, so this batch **owes no peak** and the tool carries **no** `act-close` branch here (a clause
added now would be an instrument invented to have something to fire). What the bytes measure: the batch
maximum is **L45 `30.455319`**, **+2.000000** above the previous act's registered maximum `28.455319`
(L40 — §7.3's across-act comparator) and **+5.725907** above Act I's measured peak `24.729412`, inside
the Act III **derived-exact** band `[23.7500, 33.0625]` inclusive and inside `par` band `[20, 28]`, with
**2.607181** of headroom to the Act III `D_exec` ceiling (printed `33.06`; §7.9's notation law — the
*derived-exact* value is the one that counts). **A shelf file moved no registered number — and that was
LV-018's reading, exactly as it should have been.** The registration ticket is what moved them: at
**R-007** the act tails (`ACT_III_REGISTERED_TAIL_EXEC` `45 / 30.455319`, with Act II's kept
**alias-typed**), the §5.2 rows, the lesson rows and the 45-record sidecar all entered, while
`ACT_II_PAR_CEILING` and `BLOCK_L1619_IDS` (`[16 … 20]`) stayed **byte-identical** and **no earlier rung
was re-stamped** (`src/levels/README.md` §2i).

**F-L41-4 (booked at LV-018; FIXED at R-007, in its own disclosed commit): the ladder table's operand *label* was act-blind while its operand is
act-aware.** Under `--act=3` the prover printed `rung · … · Δ vs Act I peak 28.455319` and `Act I measured
peak 28.455319` in the ladder table and its closing line — the **value** was right (it is the *previous*
act's registered maximum, read act-aware) but the **name** was wrong, since Act I's peak is `24.729412`.
The asserting line (`act-peak`, per rung) was act-aware and named it correctly, so **no verdict was
affected** — and R-007 proved that rather than asserting it: the two
`scripts/prove-candidate.ts` label sites are act-conditional now, the **Act II 20-rung run is
byte-identical before/after** (`diff` **0 lines**), the Act III run differs in **7 changed line pairs with
0 numeric differences** (`diff` 28 lines), `LADDER RESULT: PASS (5/5 …, 65/65)` on both sides, and the
probe still returns **exit 1** on exactly **L45** with **4/5 ACCEPT** (`src/levels/README.md` §2i). Same
class as F-L36-1/F-L36-2: a printed string that misdescribes its own reading is a finding, and findings
here are **published, then fixed** rather than quietly edited.

Two smaller readings, both printed so they are never over-read: `--stage=roomcap` still carries **no
batch** for this run and prints a false `MISMATCH` unless `--batch=5` is passed (named, not chased), and
the **D2 orbit law** for the `σ_x : x ↦ 3 + 7 − x` reflection is a **SIZES-ONLY** prediction that the run
**measured false on 6/6 pairs** (`4,0=0 ↔ 6,0=36` … `4,5=0 ↔ 6,5=32`) — accepts never inherit the
prediction, and no clause was invented from it.

**And the booking row was RED here — by name, in the *populated* direction — while this shelf was occupied; the graduation healed it, with no edit to `tests/**`.** The literal is **`[]`** (R-006c, re-booked on the 40-rung root), so with five files on the shelf the suite printed `AssertionError: expected [ 'l041.json', 'l042.json', …(3) ] to deeply equal []` at `tests/solver/l16-l20-candidates.test.ts:236` — the **fourth** state this row has been in (see the era table below) — and it was **booked, not fixed**: only a registration ticket moves the bytes **and** re-books the literal, and `tests/**` is **off this lane**. **R-007's registration is what closed it without touching a test**: the five files moved to the root, the shelf reads `[]`, and the *same* row now prints `expected [] to deeply equal []`. What remained **RED** in that file at R-007's tip was the row's **count half** — `rootMax` / `maxShipped` are **45** while the dataset pin `EXPECTED_LEVEL_COUNT` still read **40** — which is exactly what **R-007c** re-booked (`1e93984`, pin → **45**), so that half is **GREEN** at LV-019's tip and this batch's own red is the *set* half instead. The live guard itself is intact and still doing work: every *future* shelf rung must sit strictly above the registered root max, re-derived per run, never typed.

**This shelf is invisible to every shipped-set census.** The three readers that count shipped levels walk
`src/levels/` **non-recursively** (`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`,
`tests/solver/metrics-sidecar.test.ts`'s report length, `src/game/levels/level-registry.ts`'s explicit
imports), which is why the five files sat here without moving a single count. **The numbers in the next
sentence are the LV-018-era reading** — while the shelf held them, `npm run levels` stayed **40/40**, the
sidecar stayed **40 records** (not regenerated) and the tracked **root** level diff was **EMPTY** — the
same mechanism that withheld the L16–L19 rows through LV-010, L20 through LV-011, batch 1 through LV-012,
batches 2–3 through LV-014/LV-015 and L36–L40 through LV-017. What moved those counts was **the
registration ticket, never the shelf**: at R-007 the dataset is **45** files, `npm run levels` reads
**45/45** and the sidecar **45** records (`src/levels/README.md` §2i).

## The previous reading — **EMPTY** at R-006a's tip, and the literal it was red against

**R-006a graduated the last occupants, and between that merge and LV-018 this shelf was empty.**
`readdirSync("src/levels/candidates")` filtered on `l\d+\.json` returned **`[]`** — the five Act II
batch-4 rungs `l036.json` … `l040.json` had been `git mv`'d into `src/levels/` root — exactly as the
shelf read between R-005a and LV-017.

| subject | value at R-006a's tip | value at **LV-018's** tip (five fresh files) |
|---|---|---|
| shelf reading (`l\d+\.json` in this directory) | **`[]`** — zero level files | **five** — `l041.json` … `l045.json` |
| booking literal (`tests/solver/l16-l20-candidates.test.ts` `BOOKED_CANDIDATE_IDS_IN_SHELF`) | still the **five MEASURED names** `l036.json` … `l040.json` (R-005c-b's reading) — **stale by one merge**, therefore **RED by name** | **`[]`** (re-booked by **R-006c** on the 40-rung root) — **RED by name** the other way, printing `expected [ 'l041.json', 'l042.json', …(3) ] to deeply equal []` |
| the unbooked extra this row refuses | **`l041.json`** — absent from this shelf *and* from the root; the successor reference was re-pointed `l036` → `l041` at **R-005c-b** | unchanged in kind: `l046.json` is the shelf's next unbooked name, and the root clause still stops at `40` |
| the ROOT's successor (a different subject, and it stays root-scoped) | `src/levels/l041.json` — absent; `documentedLesson(41)` is `null`; no shipped id exceeds the pinned max. **Green**, and a shelf byte cannot falsify it | **now false as an absence claim, and correctly so**: `l041`–`l045` are shelf files, and the root clause still reads the **root** set (`maxShipped + 1`) — so it stays green, and its prose belongs to QA's lane |
| who re-books the staleness | **R-006c** (QA's lane) — the re-book was the empty set **`[]`** | **R-007** graduated the bytes, which made the literal `[]` *correct without a re-book*; the count rows it leaves behind are **R-007c**'s |

**The fifth state closes the loop: shelf `[]` and literal `[]` agree.** R-007's registration is what did
it — the same five files moved to the root and the shelf matched the literal for the first time since
R-004a. No `tests/**` byte was edited to make that true.

**The successor-absence clause and the booking literal are two different subjects, and only one of them
was ever owed a re-point.** QA-025 scoped the absence clause to the **root** set (`LEVELS_DIR`) as the
*derived* `maxShipped + 1` — *"the subject is the **root** set, never the shelf"* — so it needed no edit
when the shelf filled at LV-017, none when it emptied at R-006a, and none now that it holds five fresh
names: a shelf byte cannot make it red, and the five files' presence does not make it claim anything
about the root. The **shelf's** own successor lives in the booking row's docstring, where R-005c-b had
moved it to **`l041.json`** — a reference that has now been *consumed* by this batch, so the next
re-book owes **`l046.json`** instead of `l041.json`. Nothing in this file re-points it: `tests/**` is
**off this lane** and was not edited.

## Graduation provenance (R-006a) — the byte identity of the five files that used to occupy this shelf

Those five files (`l036.json` … `l040.json`, the **Act II batch 4** rungs authored and proven by
LV-017 on those very bytes) were moved into the dataset root by **R-006a** with `git mv`, **no content
edit during the move**, rename 100 %, and `sha256` **and** git blobs identical on both sides (5 files
/ 0 insertions / 0 deletions). Root blob == `e30bbaccf:src/levels/candidates` blob **5/5**:

| file | root blob (`e30bbaccf:` shelf blob) | `sha256` | `par` (solver) | `D_exec` | `B` | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|
| `l036.json` | `adff8c1e50db…` | `5b23e8ee…` | 18 | 22.301282 | 1.4338 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l037.json` | `c0eb8660…` | `cd4c8edb…` | 20 | 24.252174 | 1.4174 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l038.json` | `76dcc3e0…` | `a65ab804…` | 22 | 26.200000 | 1.4000 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l039.json` | `241d669d…` | `e5f9e8be…` | 24 | 28.185897 | 1.3953 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l040.json` | `e6f7359d3679…` | `701e46ee…` | 24 | 28.455319 | 1.4851 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

Every number in that table was **re-measured on the root bytes before any law edit**, and the five
rows are now in `docs/level-difficulty.md` §5.2 and in the regenerated
`docs/level-difficulty.report.json` (**40** records). The registration's own law — the act's
**registered maximum** moves from L35's `28.339426` to L40's `28.455319` by re-derivation, never by
re-stamping, and the act-close obligation stays discharged at L35 — lives in `@/core/solver/policy`
and is re-derived per run by `scripts/attest-r006a-reg40.ts` (transcript
`scripts/attest-r006a-reg40.transcript.md`), beside the two older instruments it extends. The
per-rung table, the derived ladder and the seam label are in `src/levels/README.md` §2h.

## The shelf-era record for those five — LV-017's measurement, kept because a registration is a byte-copy

**LV-017 wrote the closing batch of Act II here.** `l036.json` … `l040.json` are the
**4-pocket / 5-door / 5-press** member of §7.2's `pocket count 1–4` axis — the act's **published
family ceiling** for this device, i.e. a *law* statement, **not** a census ceiling (the ≥ 11-pocket
probe stays DEFERRED below) — on §7.4's **second frame** (`7×7`, `CX = 1`). They were on the shelf,
proven on these very bytes, and **unregistered**; R-006a has since moved them, so the paths in the
commands below read `--dir=src/levels/candidates` **as the shelf era ran them**, and the same ladder
is re-run today with `--dir=src/levels`. The authoring record is
`scripts/author-l36-l40.transcript.md`; the proof is
`scripts/prove-candidate-l3640.transcript.md`; the pipeline record is
`docs/ai-native-pipeline.md` **§8.24**. Nothing here may be read as a proof — every number below is
printed by `prove-candidate.ts` on the **landed bytes**, through the same `@/core/solver/*` and
`@/core/rules` readers that judge the shipped set:

```bash
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l036.json --family=g --ladder=36,37,38,39,40 --dir=src/levels/candidates
#   → LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates
#   → summary: 5/5 level file(s) PASS · par verified from the solver on 5/5 · RESULT: PASS
```

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | coverage | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|---|
| `l036.json` | `adff8c1e…` | `5b23e8ee…` | 18 | 22.301282 | 1.4338 | 49/49 | 36/36 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l037.json` | `c0eb8660…` | `cd4c8edb…` | 20 | 24.252174 | 1.4174 | 49/49 | 72/72 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l038.json` | `76dcc3e0…` | `a65ab804…` | 22 | 26.200000 | 1.4000 | 49/49 | 48/48 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l039.json` | `241d669d…` | `e5f9e8be…` | 24 | 28.185897 | 1.3953 | 49/49 | 162/162 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l040.json` | `e6f7359d…` | `701e46ee…` | 24 | 28.455319 | 1.4851 | 49/49 | 30/30 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

The `par` column is the solver's own reading, not the file's stamp (`par-stamped` is 5/5 `ok`).
`coverage` is `distinctPositions = 49` on the `7×7` frame — 49/49 means every tile of the board is
reachable in the phase the puzzle needs. The `chain` column is `press-then-cross`: the number of
shortest routes on which the whole ordered press chain is executed **before** the crossing, over the
number of shortest routes — `n/n` on all five, so the ordering is carried by **every** shortest
solution, never merely by one. `T ≡ R ≡ 0` and `deadStates 0` / `noUnrecoverableOk true` on 5/5, and
every rung's all-OFF world is **UNSATISFIABLE** (`allOffGoalReachable = false`): with every switch
OFF the landing room's door refuses its only exit, so the whole far region is unreachable — the latch
carries *existence*, it is not decoration.

**The ladder is DERIVED (P2-exact), not mirrored a third time.** §7.8 item 4 forbids mirroring a
registered ladder; batch 2 *deliberately mirrored* batch 1 and batch 3 *derived its own par set to
avoid* mirroring. This batch derives from the law constants alone: §7.2's batch size **5** + §6.1.1's
**P2** minimum `Δpar ≥ 2` + the band endpoints `[16, 24]` ⇒ a 5-member ladder whose every step is 2
spans **8 = the band's own width** ⇒ **`[16, 18, 20, 22, 24]`, unique**. `par 16` is **ABSENT** from
the census pool and **never substituted** (§7.8 item 4) — the repeated `24` is the act's own ceiling
used again, stated as a repeat rather than hidden. Four of the five distinct pars (`18 20 22 24`)
coincide with a registered one; that is a coincidence of the band's finite integer range and is
**printed** so it is never implied away. The five files carry **5 distinct §6.1.4 seal-inclusive
keys**, and `prove-candidate`/`author-l21` both report **0 collisions against the registered keys** —
measured against the **31 distinct geometry keys held by the 35 registered root files** (0 of 2091
accepts were refused by the clone clause). At R-006a's tip that same census reads **36 distinct keys
over 40 root files**, and it still reproduces **31 over ids 1–35** — the published LV-017 reading —
which is what catches a drift in the key itself (`scripts/attest-r006a-reg40.ts`, §6.1.4 clone guard).

| rung | `par` | `D_exec` | `B` | prev-step `Δpar` | strictly-rising `D_exec` | Δ vs Act I peak `24.729412` |
|---|---|---|---|---|---|---|
| **L36** | 18 | 22.301282 | 1.4338 | — | — | −2.428130 |
| **L37** | 20 | 24.252174 | 1.4174 | ≥2 (2) | +1.950892 | −0.477238 |
| **L38** | 22 | 26.200000 | 1.4000 | ≥2 (2) | +1.947826 | +1.470588 |
| **L39** | 24 | 28.185897 | 1.3953 | ≥2 (2) | +1.985897 | +3.456485 |
| **L40** | 24 | 28.455319 | 1.4851 | <2 (0) | +0.269422 | +3.725907 |

Two departures are printed beside the ladder rather than smoothed over: `Δpar ≥ 2` holds on **3 of
4** steps (the closing repeat is a `Δpar = 0`, the act's ceiling used twice), and the **closing rung
takes the within-par `D_exec` MAXIMUM** `28.455319` (its minimum is `28.185897`) — a published
tie-break departure, so §7.3.2's act maximum lands as late as the family permits. There is **no
rising-`D_exec` obligation** inside the batch (§7.3's across-act clause rides on the act's *peak*);
the ladder rises anyway, and that is an *observation*.

**The act reading — a READING, never a clause claim.** §7.3.2's obligation was discharged at L35, so
this batch carries **no act-close clause** and the tool has **no `act-close` refusal branch** here
(adding a fabricated one would be an instrument invented to have something to fire). What the bytes
measure: the batch maximum **L40 `28.455319`** is above the **registered** Act II tail `28.339426`
by **+0.115893**, above batch 1's peak `27.604651` by **+0.850668**, and above Act I's measured peak
`24.729412` by **+3.725907** — with **0.607181** of headroom under the Act II `D_exec` ceiling
`29.0625` (printed `29.06`; §7.9's notation law — the *derived-exact* value is the one that counts).
**A shelf file moves no registered number**: the tail, the ceiling, `ACT_II_PAR_CEILING` and
`BLOCK_L1619_IDS` are all untouched.

**The seam relief, published before `--write`.** The `L35 → L36` step is `ΔD_exec = −6.038144`
(`Δpar = −6`, `ΔB = −0.0127147` ⇒ `3·ΔB = −0.038144`), so §7.8 item 5 fires and a §7.3.1-form label
with that decomposition was published **in the dossier before the bytes were written** — §7.3.1's
**fourth** instance, the **third** `batch-seam`. Like the earlier two it is largely an **instrument
artifact** of the par derivation (`Δpar = −6` by construction) at a `ΔM = 0` boundary — an execution-
axis relaxation, **never a dip and never a felt-ease claim**; the felt half stays a labelled Playtest
hypothesis (`NOT TESTABLE`, `n = 0`). Inside the batch the equal-par pair `L39 → L40` **rises**
(`+0.269422`), so no second label is owed.

## Act II batches 2 + 3 (`l026`–`l035`) — the shelf era batch 4 followed, kept as R-005a re-measured it

**R-005a graduated the previous ten shelf files into the root.** `l026`–`l030` (Act II batch 2,
authored and proven by **LV-014**; `scripts/author-l2630.transcript.md`,
`scripts/prove-candidate-l2630.transcript.md`, pipeline record `docs/ai-native-pipeline.md` §8.19)
and `l031`–`l035` (Act II batch 3, authored and proven by **LV-015**; `scripts/author-l3135.transcript.md`,
`scripts/prove-candidate-l3135.transcript.md`, pipeline record §8.20) were moved into `src/levels/`
root by R-005a with `git mv`, **no content edit during the move**, rename 100 %, `sha256` **and** git
blobs identical on both sides (proven per file in `src/levels/README.md` §2g and re-proven on every run
of `scripts/attest-r005a-reg35.ts`). They are **no longer on this shelf**: the shelf emptied at R-006a,
was occupied by **LV-018's** five Act III opener rungs (which then graduated at **R-007**), and now holds
**LV-019's** five Act III batch-2 rungs (the block at the top of this file) — the five
LV-017 files that replaced the ten have themselves graduated (§2h / the R-006a block above),
`docs/level-difficulty.report.json` reads **45** records, and `src/game/levels/level-registry.ts`
imports neither the graduated fifteen nor anything from the shelf (the registry row is GAME's edit,
§7e).

The numbers below are kept as the **shelf-era record the registration re-measured** — every one of
them survived the move unchanged, because a registration is a byte-copy and never a re-authoring.
They were re-measured on the landed shelf bytes by `@/core/solver/*` and `@/core/rules` — the same
readers that judge the shipped set (re-run by **LV-016** on the ten files as one shelf, i.e. on the
derived-exact band of §7.9, not the printed rounding):

```bash
# shelf-era (those ten files no longer live here — run these with --dir=src/levels instead)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels/candidates
#   → shelf-era reading: 10/10 rung(s) ACCEPT · controls named: 130/130 (now run at --dir=src/levels)
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates
#   → shelf-era reading: 10/10 level file(s) PASS · par verified from the solver on 10/10
```

**Act II batch 2 (`l026`–`l030`) — the equal-par measurement.** `par` **mirrors** the registered
batch-1 ladder (`@/core/solver/policy`'s `ACT_II_B1_LADDER`, read as a constant, never re-typed),
so the five pars are `17 18 20 21 23`, each **strictly interior** to the act band `[16, 24]`.
Within-par tie-break is minimal `D_exec`, then enumeration order; §6.1.4's clone clause filters
`B`/`M` identity.

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|
| `l026.json` | `00127e95…` | `0166f697…` | 17 | 21.560241 | 1.5201 | 60/60 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l027.json` | `0aacf6ae…` | `13c29e99…` | 18 | 22.560241 | 1.5201 | 24/24 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l028.json` | `96d26e80…` | `f82ec936…` | 20 | 24.548193 | 1.5161 | 12/12 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l029.json` | `f91a0ffb…` | `1fb03d09…` | 21 | 25.548193 | 1.5161 | 72/72 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l030.json` | `b003f01f…` | `896bdd24…` | 23 | 27.566265 | 1.5221 | 12/12 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

**Batch 2's thesis is a number.** At the *same* five pars, batch 2's `D_exec` differs from batch 1
by **−0.021154 · −0.023759 · −0.071807 · −0.056458 · −0.038386** with `ΔB ≤ 0.0239`: one extra
**ordered** press costs under `0.072 D_exec` at fixed par. That is a measurement of *this* 4-press
device — not a claim about any device's limit. There is **no** rising-`D_exec` obligation here
(§7.3 puts the across-act clause on the act's *peak*), and the batch does **not** promote the peak:
its peak rung `27.566265` sits below the registered Act II peak `27.604651`, which is not
re-stamped (the stronger candidate `27.746988` at par 23 stays published-**unselected**).

Its 3-pocket census ran to completion (`--paircap=40 --budget=8000 --cap=400`: **396 accepts /
2640 judged** over **264** `(R2,R3)` pairs; `devices walked 440/440`, cap hit on **0** pairs, budget
**not reached**), refusals `par-out-of-band 1178 · g5-identity-broken 538 · unsolvable 528`. Two
declines are named rather than hidden: the **2-pocket class is declined for batch 2 by design** —
its census doubles as the semantics-preservation evidence (`2208 accepts / 9570 judged`, identical
before and after the `g3` generalization) — and the **≥ 11-pocket probe is DEFERRED**, so the census
is complete for pocket size ≤ 10 and **unmeasured at ≥ 11**.

**Act II batch 3 (`l031`–`l035`) — the 4-pocket chain, and §7.8's `par 24` obligation measured
before it was built.** Where batch 2 *held* par constant to price one extra ordered press, batch 3
deliberately does the **opposite**: its selection rule (published before the run, `3f460b6`)
**derives** its own par set from §7.8 item 4's anti-mirror clause — the in-band pars batch 1's
registered ladder does not use, `{16, 19, 22, 24}` filtered by the census pool to `{19, 22, 24}`,
with `par 16` **absent and never substituted**. That removes the equal-par comparator so the numbers
speak about the act's **reach**: the deepest device of the published `pocket count 1–4` axis, a
forced **5-press** chain on the `CX = 1` frame (7 × 6, far region 5 × 6).

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|
| `l031.json` | `02ed0599…` | `1b30c185…` | 19 | 23.204167 | 1.4014 | 30/30 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l032.json` | `c9878551…` | `00fedd90…` | 22 | 26.050000 | 1.3500 | 6/6 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l033.json` | `a722f1c5…` | `77d6f7fa…` | 22 | 26.069191 | 1.3564 | 30/30 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l034.json` | `fb3671db…` | `e8289968…` | 24 | 28.126943 | 1.3756 | 12/12 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l035.json` | `0d562c7c…` | `eb798ca4…` | 24 | 28.339426 | 1.4465 | 160/160 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

The `par` multisets of the two batches **do not intersect** (`[19, 22, 22, 24, 24]` vs
`[17, 18, 20, 21, 23]`), and both non-monotone facts are printed beside the ladder rather than
re-selected away: `Δpar ≥ 2` holds on **3 of 4** steps, and the tie-break departure on the closing
rung takes the within-par **maximum** `28.339426` (its minimum is `28.058108`) so that §7.3.2's
act-close maximum lands on the **last** rung.

**The act-close clause is DISCHARGED on the shelf, and nothing registered moves.** The obligation
(§7.3.2/§7.8 item 1) is *"an act's registered maximum must exceed `27.604651`"*; batch 3's measured
maximum is **`28.339426` → Δ +0.734775**, strictly above, inside §7.8 item 2's window
`[27.7500, 29.0625]` with **+0.589426** over its floor. `act-peak` (§7.3) reads Δ **+3.610014**
against Act I's measured `24.729412`, headroom **0.723074** to the Act II `D_exec` ceiling
`29.0625` (printed `29.06`; §7.9's notation law — **LV-016** aligned the stored band constant with
its own formula, see `src/levels/README.md` §2f). **Shelf-era reading:** a shelf file does not widen
a registered ceiling, and only a registration ticket can put these five numbers in the dataset's
table. **R-005a was that ticket** — `28.339426` at L35 is now the registered act tail
(`ACT_II_R005A_REGISTERED_TAIL_EXEC`), and the registered `block-l1619-tail-ceiling` **still did not
move** (`BLOCK_L1619_IDS` is still `[16 … 20]`; `src/levels/README.md` §2g/§7d).

The relief L30→L31 (`ΔD_exec −4.362098`) is the dossier's **single** drop; its §7.3.1-form label was
published **before `--write`** and blessed for verbatim citation (**GD-011 RULING C**,
`docs/decisions/design-0007-…`) — R-005a carried it, and batch 2's own `L25→L26 −6.044410` label
(**GD-010 §7.3.1 instance 2**) beside it. Inside batch 3 the equal-par pairs **rise**
(`+0.019191`, `+0.212483`) — instrument facts, not reliefs.

## The booking is a **named live set** — at LV-019's tip the literal is **`[]`** and the shelf holds **five**

`tests/solver/l16-l20-candidates.test.ts` walks this directory and pins the shelf's obligations:
**set equality** with the booking literal `BOOKED_CANDIDATE_IDS_IN_SHELF` (`:239`; a set comparison,
never a length — `expect(shelf).toEqual([...BOOKED_CANDIDATE_IDS_IN_SHELF])` at `:252`) and *every shelf
rung strictly above the registered root max*, which is the dataset pin `EXPECTED_LEVEL_COUNT`
(`tests/e2e/helpers/levels.ts:147`, asserted at `:262`), asserted on the spot so a shelf file cannot be
justified by a dataset that moved without the pin moving.

**The measured state at this tip (LV-019).** The shelf holds **five level files** (`l046.json` …
`l050.json`, this batch) and the literal is **`[]`**, so the row's **set half is RED in the populated
direction** — `expected [ 'l046.json', 'l047.json', …(3) ] to deeply equal []`, one red, measured
against a **`0 failed · 1041 passed · 3 skipped`** baseline taken with the same five files removed. It
is worth stating plainly which red is which, because each revision of this section described a different
one: the literal was `[]` while the shelf held five (R-004a's left-over, red the other way), then **ten
names** (`l026` … `l035`, booked at QA-026 when the shelf held those ten, made stale by R-005a's
graduation), then **five names** that R-006a's graduation moved to the root (stale by one merge), then
`[]` with five *new* files on the shelf (RED in the populated direction — the state LV-018 left behind),
then `[]` with an empty shelf (the first agreement since R-004a), and now again `[]` with fresh files:
**the literal was re-booked `[]` by R-006c and the bytes moved on without it, which is exactly the
booking's job** — R-008, the registration ticket, is what re-books it. The **count half is GREEN at this
tip**: R-007c has merged (`1e93984`) and the pin tables read **45**, so `rootMax` / `maxShipped` (`:262`
/ `:273`) agree with `EXPECTED_LEVEL_COUNT` (`tests/e2e/helpers/levels.ts:147`). `tests/**` is **off
this lane and was not edited** — this file reports the rows, it does not re-book them.

**The successor claim is the other half of that block, and it is green — because it is *derived*, not typed.** QA-025 scoped the absence
clause at the **`LEVELS_DIR` (root) set**, asserted as the *derived* `maxShipped + 1` — *"the subject is the **root**
set, never the shelf"*. At this tip the root row set is `1 … 45`, so the clause reads **`l046.json`**: absent
from `src/levels/`, `documentedLesson(46)` is `null`, and no shipped id exceeds **45** — all three hold, and a
shelf byte cannot falsify any of them (the shelf now carries `l046.json` as a **candidate**, which is
precisely the relation the clause is silent about: a candidate is not a registration). The **same derivation**
keeps the close-out clause honest:
`documentedLesson(maxShipped)?.obligation` is asserted on the **live** max, so it now reads **L45**'s row
(`obligation: null`, with R-007's booked `act-3-batch-1` remedy named in the row itself) instead of L40's —
it needed **no re-point** when the dataset moved, which is the point of deriving it. What R-006a recorded
as prose-and-pin drift (the comment block saying the root "stops at the pinned 35", and a count row red with
`expected 40 to be 35`) was **discharged by R-006c's merge**, and the *count* drift R-007 introduced was
**discharged by R-007c's** (`1e93984`); the family half of the block's obligations **stays booked**, by name,
rather than being closed by inventing an obligation.

Two readings the pin's second half gives for free, both **derived relations, never ceiling claims**:
the root's max is re-derived from the landed files (now **`45`**) and each shelf rung must be strictly
above it (re-derived per run in the loop over `shelf`, not typed — the shelf holds five files at this
tip, and all five clear it, which is the *green* half measured while the set half is red). That half is
**live**: it re-derives on every
run, so a shelf file at or below the root max is caught **as a live guard, not as a count**, and an
unregistered extra and a vanished member both fail **by name** (QA-012/QA-018 proved the populated
direction, QA-014 the empty one; QA-026 the ten-name one, R-005c-b both directions on the five-name one,
R-006c the `[]` one at 40 rungs — all four quoted in `tests/e2e/README.md`).

History, kept honest: this row's literal has always tracked the shelf, **never a count** — which is
exactly why a stale literal is a *named* failure and not a silent pass, and why the red text is worth
quoting in each era rather than remembered as "the shelf row is red".

**A shelf rung must sit strictly above the registered root max** — a **derived rung relation,
never a ceiling claim about any device**: `docs/project-status.md` item 114's law binds this prose
too — the pocket census is unmeasured at ≥ 11, so neither "9 is the largest pocket" nor "20 is the
device ceiling" may be published in either direction. A shelf file at or below the registered root
max is a root row hiding outside the census, and the pin catches it **as a live guard, not as a
count**.

**Why this `README.md` exists.** Earlier in its life the walking reader died before running a
single test (`readLevel(dir, undefined)` against an *empty* shelf) — the R-003c handover recorded in
`src/levels/README.md` §7 alongside `tests/e2e/helpers/levels.ts:76` and the other count pins —
which is why the booking is a named, live-guarded set rather than a convenience, and why QA-018
proved **both** directions non-vacuously (`cp` in / `mv` out transcripts, `tests/e2e/README.md`
§1.12). The ceiling-wording scrub that came with it is the reason no sentence here quantifies a
device's maximum. This file is documentation, not data: the suite filters on `l\d+\.json`, so it
changes no count.

## Graduation provenance (R-005a) — the byte identity of the ten files that used to occupy this shelf

Those ten files (`l026.json` … `l035.json`) were moved into the dataset root by **R-005a** with
`git mv`, **no content edit during the move**, rename 100 %, and `sha256` **and** git blobs identical
on both sides (10 files / 0 insertions). Root blob == `36ffe0b:src/levels/candidates` blob **10/10**:

| file | root blob (`36ffe0b:` shelf blob) | sidecar `sha256` | `par` (solver) | `D_exec` | `B` | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|
| `l026.json` | `00127e956081bdd33b91943cd75a7638c398fd95` | `2dac5f24…` | 17 | 21.560241 | 1.5201 | UNSATISFIABLE | 13/13 caught |
| `l027.json` | `0aacf6ae35372b92f68b701fcd240e3fc07c3e4a` | `5aca24e7…` | 18 | 22.560241 | 1.5201 | UNSATISFIABLE | 13/13 caught |
| `l028.json` | `96d26e80c5a1038746dce58cba8f5809f54b203e` | `b2d722c4…` | 20 | 24.548193 | 1.5161 | UNSATISFIABLE | 13/13 caught |
| `l029.json` | `f91a0ffb12ea9387a0700e3c10ddd8755779adb4` | `3cf31ddd…` | 21 | 25.548193 | 1.5161 | UNSATISFIABLE | 13/13 caught |
| `l030.json` | `b003f01f24eaf1b905c7d5964739a9b279989301` | `148b707f…` | 23 | 27.566265 | 1.5221 | UNSATISFIABLE | 13/13 caught |
| `l031.json` | `02ed0599accde4d0ba4e7d8ea941a4b16e3b372e` | `1fa77cfc…` | 19 | 23.204167 | 1.4014 | UNSATISFIABLE | 13/13 caught |
| `l032.json` | `c9878551ff77d0c1e2248c0fb281de62ef26129e` | `831ef9d3…` | 22 | 26.050000 | 1.3500 | UNSATISFIABLE | 13/13 caught |
| `l033.json` | `a722f1c5b99f2b4b7580bff56c4b252fe1ec06be` | `81b400a5…` | 22 | 26.069191 | 1.3564 | UNSATISFIABLE | 13/13 caught |
| `l034.json` | `fb3671db70c5d4f0408ac6cecdbf4dfdf8e20915` | `9d7f1404…` | 24 | 28.126943 | 1.3756 | UNSATISFIABLE | 13/13 caught |
| `l035.json` | `0d562c7cd1805d85415fd618f8b03935ca87be98` | `f039a6f4…` | 24 | 28.339426 | 1.4465 | UNSATISFIABLE | 13/13 caught |

Every number in that table was **re-measured on the root bytes before any law edit**, and the ten
rows are now in `docs/level-difficulty.md` §5.2 and in the regenerated
`docs/level-difficulty.report.json` (**40** records — the ten rows here were already there at 35 and
are unchanged by R-006a's five; §2h). The registration's own law — the act's
**maximum** carries §7.3's across-act obligation, the two batch seams it published are the two
**pre-published §7.3.1 reliefs** cited verbatim (R-006a's step 2 added the act's *closing* seam as the
**fourth** instance and re-pointed exactly one clause pin, without moving any R-004a / R-005a constant
*value* — §2h), and the act's registered tail moves by re-derivation, never by
re-stamping — lives in `@/core/solver/policy` and is re-derived per run by
`scripts/attest-r005a-reg35.ts` (transcript `scripts/attest-r005a-reg35.transcript.md`, **body
refreshed at R-006a**: its ladder stays scoped to the R-005a-era ids 26–35 and its control set is
unchanged at **120** MATCH lines).

## Previous occupancy — Act II batch 1 (`l021`–`l025`), graduated by **R-004a**

Those five files
(`l021.json` … `l025.json`, the **Act II batch 1** rungs authored and proven by LV-012 on those very
bytes; `scripts/prove-candidate-l2125.transcript.md`, pipeline record `docs/ai-native-pipeline.md`
§8.16) were moved into the dataset root by **R-004a** with `git mv`, **no content edit during the
move**, rename 100 %, and `sha256` **and** git blobs identical on both sides:

| file | root blob (`551fd43:` shelf blob) | root `sha256` | `par` (solver) | `D_exec` | `B` | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|
| `l021.json` | `18d05965c81afa972e74e07918c5cd3ba801742d` | `78df6c27…` | 17 | 21.581395 | 1.5271 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l022.json` | `e8fcabd5a0a6ef25eb7345281626a11292ceb5a9` | `de0b579b…` | 18 | 22.584000 | 1.5280 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l023.json` | `a2331baf00271991c8206619a521dcb7cefa54e9` | `f435f8f5…` | 20 | 24.620000 | 1.5400 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l024.json` | `cb23369c633a71131f385f3d0f28b7acec0485db` | `524aadbc…` | 21 | 25.604651 | 1.5349 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l025.json` | `6e4b10d10b6be889bd35e0bc04293a107fb9dd51` | `afd6bc0e…` | 23 | 27.604651 | 1.5349 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |

Every number in that table was **re-measured on the registered root bytes before any law edit**, and
the five rows are now in `docs/level-difficulty.md` §5.2 and in the regenerated
`docs/level-difficulty.report.json` (**25** records at R-004a; **35** after R-005a; **40** after
R-006a). The registration's own law — the act's
**maximum** carries §7.3's across-act obligation, while the act's *opening* rung sits below the
previous act's peak as a **plateau relaxation at a `ΔM = 0` boundary**, never a dip — lives in
`@/core/solver/policy` and is re-derived per run by `scripts/attest-r004a-act2.ts`. The
**registered `block-l1619-tail-ceiling` did not move** because candidates existed, and it did not
move at registration either: `BLOCK_L1619_IDS` is still `[16 … 20]` and L20 was **not re-stamped**
(`src/levels/README.md` §2f, §7c).

**Shelf history, in one line each.** `l016.json`–`l019.json` graduated by **R-003c**, `l020.json`
by **R-003d** (blob `78acaed0…`), `l021.json`–`l025.json` by **R-004a**, `l026.json`–`l035.json` by
**R-005a**, `l036.json`–`l040.json` by **R-006a**, `l041.json`–`l045.json` by **R-007** — so the shelf has
been emptied **six** times and re-occupied **seven**: `l026`–`l030` fresh by **LV-014**, `l031`–`l035`
beside them by **LV-015**, `l036`–`l040` fresh by **LV-017**, `l041`–`l045` fresh by **LV-018**,
`l046`–`l050` fresh by **LV-019**, and each occupancy graduated in turn — the fifth and sixth, LV-017's and
LV-018's, having graduated at R-006a and **R-007**. Every graduation so far was a provenance-exact
`git mv`; the shelf's current occupants are the **five Act III batch-2 rungs** measured in the table at
the top of this file, and they are **unregistered** until the `R-008`-era train moves them
(`src/levels/README.md` §2j is that train's row, not yet written). The successor the booking row will
have to name when the next batch is booked is **`l051.json`** — the name LV-019 *did not* consume,
because a batch stops where its law stops.

## Working here

```bash
# ── LV-019's five Act III batch-2 rungs: the LIVE commands for the shelf as it stands now ──
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates        # 5/5 ACCEPT · 65/65 named controls
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=46,47,48,49,50 --dir=src/levels/candidates --peak=31.739760638297874   # exit 1 · exactly one `act-peak` FAIL on exactly L50 · 4/5 ACCEPT · 65/65
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates          # the independent reader: 5/5 PASS · par verified 5/5
node_modules/.bin/tsx scripts/author-l21.ts --stage=struct --dir=src/levels/candidates   # the F-L41-2 ledger on this shelf: 5 in class · 0 out
node_modules/.bin/tsx scripts/attest-r007-reg45.ts                                   # R-007's registration re-attested, body refreshed for the OCCUPIED shelf (exit 0 · 0 divergent)
# ── LV-018's five Act III opener rungs: SHELF-ERA paths — they no longer resolve, because R-007
#    graduated the bytes. Every `--dir=src/levels/candidates` command below is kept as the era's
#    receipt and now exits 1 (ENOENT on l041.json). The SAME assertions run at the root today:
#    `--act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels`  (src/levels/README.md §1)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates   # shelf-era: the assertion pass (5/5 ACCEPT · 65/65 named controls)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --measure-controls   # shelf-era: the expectation pass (13 MEASURED per rung × 5)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --peak=31.7589095   # shelf-era falsification (F-L41-3 corrected): exit 1 · one act-peak FAIL on L45
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates --peak=29.455319     # the SUPERSEDED formula's no-op receipt: exit 0 · PASS
node_modules/.bin/tsx scripts/author-l21.ts --stage=struct --dir=src/levels              # the registered corpus through the shared derivation (F-L41-2): 45 in class · 0 out
node_modules/.bin/tsx scripts/author-l21.ts --stage=struct --dir=src/levels/candidates   # the occupied shelf, read through the SAME derivation: 5 in class · 0 out (LV-019's receipt; the empty-shelf reading was 0/0, §2i)
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates   # LV-019 shelf-era: an independent reader (5/5 PASS); against an empty shelf it is the falsification probe (exit 1)
# ── R-007: the five Act III rungs are ROOT rows now — these are the live commands ──
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels            # R-007: assertion pass on the FIVE registered root bytes (5/5 ACCEPT · 65/65 controls)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels --peak=31.7589095   # R-007 falsification: exit 1 · `GATES: REJECT — act-peak` · one FAIL on exactly L45 · 4/5 ACCEPT
node_modules/.bin/tsx scripts/attest-r007-reg45.ts             # R-007: byte identity (5/5 vs 82dd808) + the Act III ladder + the act-boundary tail law + the 22-clause partition
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels   # an independent reader (45/45 PASS, par verified 45/45)
# ── R-006a: the five PREVIOUS rungs are ROOT rows now — run these at --dir=src/levels ──
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels   # R-006a: the assertion pass on the FIVE registered root bytes (5/5 ACCEPT · 65/65 controls)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels --measure-controls   # the expectation pass (13 MEASURED per rung × 5, no assertion — F-L16-3 order)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels --peak=28.7589095   # falsification: exit 1 · FAIL 4/5, exactly L40 on act-peak
node_modules/.bin/tsx scripts/attest-r006a-reg40.ts            # R-006a: byte identity (5/5 vs e30bbaccf) + the batch-4 ladder + the 16-clause act-tail set + its control battery
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels   # an independent reader (40/40 PASS, par verified 40/40)
# shelf-era path for the graduated five: no longer resolves (the bytes are in the root)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels/candidates   # → exit 1 (ENOENT on l036.json — that file is a ROOT row now; the attest's non-vacuity probe, still exit 1 on the occupied shelf)
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l036.json --family=g --ladder=36,37,38,39,40 --dir=src/levels/candidates   # (historical, LV-017) the shelf-era assertion pass on the five
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels   # R-005a: the assertion pass on the TEN **registered root** bytes (10/10 · 130/130)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels/candidates   # shelf-era path for the graduated ten: no longer resolves (the bytes are in the root)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=31,32,33,34,35 --dir=src/levels --measure-controls   # the expectation pass (13 measured)
node_modules/.bin/tsx scripts/attest-r005a-reg35.ts            # R-005a: byte identity + both ladders + the act tail/seam law + its control battery
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 --pocketsize=4 \
    --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24   # LV-017 stage G: batch 4's pool on the 7×7 / CX=1 frame (2091 accepts / 20000 judged — a FLOOR)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=4 --parmin=16 --parmax=24 --write \
    --accepts=<that dump>                                      # LV-017: derived P2-exact ladder selection + land the bytes
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --qmax=4 --pocketsize=4 \
    --paircap=40 --budget=8000 --cap=400                       # LV-014 stage G: the 3-pocket census (396 accepts / 2640 judged)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=2 --write --accepts=<its own dump>   # LV-014: par-mirror selection + land the bytes
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=1 --pocketsize=4 \
    --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24   # LV-015 stage G: the batch's own pool on the CX = 1 frame (498 accepts / 20000 judged)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=3 --parmin=16 --parmax=24 --write \
    --accepts=<f's dump>                                       # LV-015: anti-mirror selection + land the bytes
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels    # R-004a: the batch-1 ladder re-proven from the ROOT
node_modules/.bin/tsx scripts/attest-r004a-act2.ts                          # R-004a: byte identity + the registered ladder + the §7.3 tail law + its control battery
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8        # (historical) stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write  # (historical) stage SL: lattice + land the selection
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4     # the L16–L19 (goal-gated seal) tool, unchanged
```

Every census command above passes `--accepts=` explicitly, so none can clobber the tool's default dump
path. LV-017's own census prints its enumeration counters (how many devices of the frame it walked, how
many group caps it hit, whether the budget was reached) so a truncated count is labelled a **floor**
rather than read as a total — the `20000` run walked **10/348** devices and **hit** the budget, the
`120000` falsification probe walked **54/348** and hit it too, which is why both are floors and neither
is a ceiling.

`--write` is what lands bytes on the shelf; nothing here is ever auto-repaired (ADR-0004). A
candidate that fails one gate is **rejected**, never fixed in place — the generator prints the
rejection ledger (per-gate, with the gate's own `detail`), the selection is derived (exact rung par
→ minimal `D_exec` → enumeration order), and re-running the census re-derives every file it wrote.
The `D_exec` band the gates compare against is the **derived-exact** `[19.75, 29.0625]` (printed
`[19.75, 29.06]`), read from `@/core/solver/policy` and never re-typed (§7.9 / ADR-design-0007;
**LV-016** retired the last rounded literal in `scripts/author-l21.ts`). One boundary is named in
**both** directions rather than closed by assumption: the pocket census is **complete for pocket
size ≤ 10** (the `≥ 9` debt F-L20-3 was closed by measurement, `17 476` leak-free members,
histogram `3:34 4:204 6:510 7:2040 9:14688`) and **unmeasured at ≥ 11**, so no document — this one
included — may claim either "9 is the largest pocket" or "the device's ceiling is 20". A future pass
that needs a bigger pocket starts from that measurement (`scripts/author-l20-p10.transcript.md`,
incl. its **§10 corrigendum** on the census instrument).