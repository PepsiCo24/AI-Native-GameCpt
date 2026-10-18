# LV-017 — the proving side of Act II batch 4 (`l036`…`l040`, shelf candidates)

Companion to `scripts/author-l36-l40.transcript.md`. Every number here is read from the **landed
bytes** (`src/levels/candidates/l036.json`…`l040.json`) through `@/core/solver/*` + `@/core/rules` by
`scripts/prove-candidate.ts`; nothing is quoted from the authoring script, and nothing in this file
can write a level. The authoring dossier's table is **re-measured** here, not trusted.

**Order of artifacts (law before bytes, finding before fix).** `b9dac54` the rule + device + finale
role, published before any census → `5626e48` the batch-4 machinery → `1eea030` **F-L36-1**
(docstring alone) → `469e04e` its one-line repair → `c45e3e5` **F-L36-2** (docstring alone) →
`03d0d4d` its label repair → `6f03ae4` the census dossier + §8.24/V1.18 + the `level-difficulty` rows
→ `17091ac` the five bytes + the shelf `README.md` restate → `a3857c7` the README's own two
self-corrections → **this file**. Each step is checkable in `git log -p`; none can be back-dated.

---

## §0 · The two instrument findings, as the authoring side published them

Both are **census-instrument** findings — neither is about a level, and both were published **before
the line that fixes them moved** (docstring-only commits, verified at 0 non-comment added lines).
They are summarised here because the proving side inherits their receipts; the full argument lives in
`scripts/author-l36-l40.transcript.md` §2 and `docs/ai-native-pipeline.md` §8.24.

### F-L36-1 · the generator's cut floor was raised by the registered Act II rungs

`scripts/author-l21.ts`'s `measureCut()` excluded `BLOCK_L1619_IDS` + **`ACT_II_B1_IDS` only**, so
after R-005a registered `L26`–`L35` the cut basis silently became `[1…15, 26…35]` and `cut.floor`
became **28.339426** (i.e. `L35` itself) while the banner still labelled it *"max over the L1–L15
basis"* — the label and the measurement disagreeing on screen. With `escalation = dexec > cut.floor`
and `D_exec = par + 3·B`, `B ≤ 1.6875`, that silently forced **`par ≥ 24`** and truncated the accept
pool **by filter**. The prover already read `ACT_II_REGISTERED_IDS` — **R-005a fixed the prover and
not the generator**. The repair is one line plus an always-printed **CUT divergence receipt**:

```
CUT divergence receipt (F-L36-1): FROZEN L1–L15 floor 14.969697 vs the pre-fix basis's 28.339426
(Δ 13.369729) — the pre-fix list let the registered Act II rungs raise the floor and silently turned
the escalation gate into "D_exec > the registered act tail"; the generator now reads
ACT_II_REGISTERED_IDS, the same law constant the prover's own measureCut() reads
```

**Blast radius, pre-registered then re-measured (not argued).** The pre-fix census produced a
degenerate pool (every rung pinned at `par 24`). After the repair the same command returns the pool
this batch selected from — `7×7`/20000: **234 accepts → 2091**, `1857 + 234 = 2091`, with g5
`1232 + 45 = 1277` **unchanged**; `7×7`/120000 at the same `54/348` devices: **549 → 8920**,
`8371 + 549 = 8920`; the `par 24` probe: **185 → 293**, `108 + 185 = 293`; and `7×6`/20000 (batch 3's
frame, only the batch id changed) **0 → 498**, which reproduces **batch 3's own LV-015 pool
digit-for-digit** (histograms differing in **exactly one** row). The five bytes are selected from the
**post-fix** dump only — `17091ac` records the provenance. **The pre-fix census must never be used for
selection.**

### F-L36-2 · the par-census line's label claimed coverage it never measured

The three G-lattice stages printed *"par census over every judged candidate (in band and out)"* while
`parHist` is incremented **only in the out-of-band branch**. Two receipts from pages this ticket
already quoted settle it without a source reading: `post-par24.txt` (band `[24, 24]`) lists
`18:24 … 23:347 25:361 …` and **omits `24`** beside its own `par 24: 293 accept(s)`; `post-deep.txt`
starts its histogram at **`25` = `ACT_II_PAR_CEILING + 1`** while its accept table lists `par 18 … par
24`. It is load-bearing because rule 3's **empty-pool** clause is read off that line: as labelled it
licenses *"no judged candidate had `par 16` or `par 17`"* — a claim about the whole enumerated class
the histogram never measures. What this batch publishes is the narrower, supported sentence: **the
accept pool's minimum in-band par is `18`**.

The repair touches **three print labels + three doc lines** (15/11). Its blast radius was
**pre-registered and re-measured**: the identical `par 24` probe returned `293 accept(s) of 8000`,
histogram `5040 / 2655 / 12`, in-band refusals `12` — every counter equal — and the two accept dumps
are `353694` bytes each and `sha256`-**identical**; a normalised `diff` of the two logs shows **one**
differing line, the label.

In both cases the census is **complete within its prefix by an identity that closes exactly**:
`accepts + par-out-of-band + unsolvable + g5-identity-broken = judged`
(`8920 + 58378 + 41158 + 11544 = 120000`; `2091 + 9989 + 6643 + 1277 = 20000`; `293 + 5040 + 2655 + 12
= 8000`; `498 + 702 + 18080 + 720 = 20000`).

---

## §1 · The batch, proved from the landed bytes

Command (exit **0**):

```
npx tsx scripts/prove-candidate.ts src/levels/candidates/l036.json --family=g --ladder=36,37,38,39,40 --dir=src/levels/candidates
```

```
prove-candidate — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 ·
  35 shipped files · basis ids [1 … 15] (the L16–L20 block and the registered Act II batches
  [21 … 35] are excluded from their own filter — see measureCut)
family g (Act II multi-pocket — §7.2 / §7.4 stage G) · Act I's measured peak the batch must clear:
  24.729412 · ladder peak rung L40

L36 · par 18 · 22.301282 · 1.4338 · 49/49 · Δpar —    · rise —            · delta -2.428130
L37 · par 20 · 24.252174 · 1.4174 · 49/49 · Δpar ≥2 (2) · rise OK (1.950892) · delta -0.477238
L38 · par 22 · 26.200000 · 1.4000 · 49/49 · Δpar ≥2 (2) · rise OK (1.947826) · delta  1.470588
L39 · par 24 · 28.185897 · 1.3953 · 49/49 · Δpar ≥2 (2) · rise OK (1.985897) · delta  3.456485
L40 · par 24 · 28.455319 · 1.4851 · 49/49 · Δpar <2 (0) · rise OK (0.269422) · delta  3.725907
batch peak: L40 at 28.455319 · Act I measured peak 24.729412 · §7.3 act-peak clause DISCHARGED ·
  headroom to the Act II ceiling 29.0625 (printed 29.06; §7.9 — derived-exact is the value): 0.607181
LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))
```

**Per-rung surface, every rung: 20 gates, 20 `ok`, 0 `FAIL`.** `par-stamped` (file `par` = solver
`par`) · `region` `deadStates=0 noUnrecoverableOk=true T=0 R=0` · `escalation` above the frozen CUT
`14.969697` · `act2-par-band` **inclusive** at `[16, 24]` · `act2-exec-band` derived-exact
`[19.75, 29.0625]` · `act2-b-band` `[1.2500, 1.6875]` · `act-peak` (Δ `−2.428130 … +3.725907`) ·
`latch-grade` **all-OFF world UNSATISFIABLE** (`allOffShortest=null`) · `latch-route` press-then-cross
on **every** `par` route (`36/36 · 72/72 · 48/48 · 162/162 · 30/30`) · `refused-beat` ·
`coverage` **49/49** · `validator` `ok=true errors=0 policyViolations=0 one-switch-per-door=true` ·
`well-formed` `doors=5 switches=5` · **g0** exactly 1 opposite-parity portal pair · **g1** landing room
portal-only on the portal-free board · **g2** five walk-sealed rooms **re-derived from the bytes**,
0 leaks / 0 phase-wall boundaries · **g6** rooms `5` (`≥ 2`), the landing room carrying the switch for
its own door and the goal's room switch-free · **g3** one shared press order on every shortest route,
**5 distinct presses**, staged-world forcing FALSE on all four drops · **g4** all-OFF unreachable
(`allOffGoalReachable=false`) · **g5** census identity broken.

**`g5` is the §6.2.3 item 4 break, measured on every rung** — the identity's *value* falls below
`par` everywhere, and the seal-tile counts are printed: `13 / 14 / 14 / 13 / 12` seal tiles outside
the landing room, none adjacent to the all-OFF free region, with the device-removed world solving at
`16 / 16 / 16 / 22 / 22` `< par` `18 / 20 / 22 / 24 / 24` respectively.

`deriveRoom`-equivalent device lines, **from the landed bytes** (never from the authoring script) —
one landing + four walk-sealed pockets + the goal's own seal, e.g. `L40`: `landing 3,0 (behind the
portal) · near 0,2 · 5 walk-sealed room(s): d1[3,0 4,0 4,1 5,0](landing) · d2[6,2] · d5[5,4](goal) ·
d3[3,6] · d4[6,6]`.

---

## §2 · Falsifications (the checks were asked to fail, and did)

- **Peak probe, padded:** `--peak=28.7` (a peak no board carries, sized to this ladder's measured
  maximum `28.455319`) → **exit 1 · `LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, controls named:
  65/65)`**, failing **exactly one gate on exactly one rung**:
  `FAIL act-peak  D_exec=28.455319 vs Act I's measured peak 28.700000 (delta -0.244681)` on **`L40`**
  — the rung the batch's measured maximum sits on (`GATES: REJECT — act-peak`). The clause is
  therefore **live, falsifiable, and not satisfied by the clause's own neighbours**: `L36`–`L39` stay
  `ACCEPT` in the same run, and the control battery stays `65 CAUGHT / 0 MISSED` even there.
- **Control battery, 13 per rung by NAME:** `--measure-controls` → **exit 0**,
  `controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)` **×5 rungs =
  65 measured**, **35 lines carry `gate … named: true`** (7 family-`g` controls × 5 rungs), **0
  mutations accepted**. The expectation pass asserts nothing (F-L16-3 order: measure, then write the
  expectation), and the two passes were compared line by line: the **per-rung refusal strings are
  byte-identical** between `--measure-controls` and the assertion pass, so the battery is
  deterministic, not merely green. Sample, `L36`:

  ```
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added → validator+g0-portal-pair            [g0 named]
  MEASURED g1 control — the landing room's door "d1" dropped →
      par-stamped+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken   [g1 named]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) →
      g2-room-exit-door                                                                   [g2 named]
  MEASURED g6 control — the landing device removed (door + switch) →
      par-stamped+g6-room-structure                                                        [g6 named]
  MEASURED g3/g6 control — the goal's seal door "d5" dropped →
      par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken   [g6 named]
  MEASURED g4 control — every door and switch dropped →
      par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken   [g4 named]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) →
      par-stamped+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken   [g5 named]
  ```

- **The act reading is a measurement, not a clause.** The batch's maximum `28.455319` sits **above**
  the **registered** Act II tail `28.339426` by **+0.115893**, above batch 1's peak `27.604651` by
  **+0.850668**, and above Act I's measured peak `24.729412` by **+3.725907**, with **0.607181** of
  headroom under the derived Act II ceiling `29.0625`. §7.3.2's obligation was **discharged at L35**,
  so this batch carries **no act-close clause** and the tool has **no `act-close` refusal branch**
  here — a fabricated refusal branch would be an instrument invented to have something to fire.
- **Anti-mirror, by derivation and printed:** the par multiset is `[18, 20, 22, 24, 24]`, derived as
  the unique P2-exact ladder `[16, 18, 20, 22, 24]` anchored at `ACT_II_PAR_CEILING`, with **`par 16`
  ABSENT from the pool and never substituted** and the repeat of `24` stated. **4 of the 5 distinct
  pars coincide with a registered Act II par** — a coincidence of the band's finite integer range —
  and the tool prints it rather than implying it away. No par was chosen to match or to avoid a
  registered rung.
- **Determinism:** re-running the ladder on the landed bytes returns the identical ladder table, the
  identical `20/20` gate surface, the identical `65/65` control tally and the identical
  `LADDER RESULT: PASS`.

---

## §3 · The rest of the acceptance battery

| check | result |
|---|---|
| `npx tsc --noEmit` | **clean** (exit 0, after every edit in the chain) |
| `npx tsx scripts/solve-levels.ts --audit src/levels/candidates` | **`5/5 level file(s) PASS · par verified from the solver on 5/5 · refusals are reported, never repaired`** (an independent reader, not the prover) |
| `npx tsx scripts/solve-levels.ts --audit src/levels` | **`35/35 level file(s) PASS · par verified from the solver on 35/35`**, `RESULT: PASS` |
| `npm run levels` (root) | **`35/35 level files ok · 0 errors · 148 warnings (0 multi-switch-door) · 11/11 negative cases`** — **UNCHANGED**, `RESULT: PASS` |
| sidecar `docs/level-difficulty.report.json` | **35 records**, untouched |
| root level bytes (`src/levels/l*.json`) | **tracked diff EMPTY vs the branch base `db4af50`** — the five shelf files are untracked-on-shelf and no root byte moved; `EXPECTED_LEVEL_COUNT` / registry / PINS untouched |
| clone guard (§6.1.4, seal-inclusive key) | **31 distinct geometry keys** held by the 35 registered root files; the ladder's 5 rungs are distinct from all of them and from each other — **`0 key(s) colliding with a shipped board`**, and **`0 refused by the §6.1.4 clone guard`** of the 2091 accepts |
| prettier | `src/levels/candidates/README.md` — **All matched files use Prettier code style!** |
| `npx vitest run` | **9 failed / 28 passed files (37) · 48 failed / 903 passed / 3 skipped (954)** |

**The red set is unchanged from the branch base, measured.** At `db4af50` the suite read the same
`48 failed / 903 passed / 3 skipped (954)` across the same **9** failed files, and every failing row
above is a count-, dataset- or `PINS`-derived pin that still reads the pre-R-005a dataset (25 where
the dataset is 35) — R-005c's, itemised by `file:line` in `src/levels/README.md` §7d. Landing five
**shelf** files changes none of them, because the shelf is invisible to every shipped-set census.

**The one row this batch touches, and it is the tests lane's.** `tests/solver/l16-l20-candidates.test.ts`
pins the shelf by **set equality** against `BOOKED_CANDIDATE_IDS_IN_SHELF`. The literal there is the
**ten names `l026` … `l035`** (QA-026's re-book at `d21f399`) — **not** `[]`, despite the shelf README
having claimed otherwise before `a3857c7` corrected it. The suite prints:

```
AssertionError: expected [ 'l036.json', 'l037.json', …(3) ] to deeply equal [ 'l026.json', 'l027.json', …(8) ]
```

It was **red before this batch landed anything** (`expected [] to deeply equal [ 'l026.json', …(9) ]`),
so this batch did not create the red — it changed *which* mismatch the red reports. The needed
re-book is to **`l036` … `l040`**. `tests/**` is **off this lane and was not edited**; the row is
**reported, not re-booked**.

**The same block's absence clause is green and needs no edit** — QA-025 had already scoped it to the
**root** set (`LEVELS_DIR`) and asserted it as the *derived* `maxShipped + 1`: `src/levels/l036.json`
does not exist, `documentedLesson(36)` is `null`, no shipped id exceeds `35`. All three are
re-derived per run and a shelf byte cannot falsify any of them, which is exactly why the clause is
scoped that way. (This corrects an assertion in the shelf README's own earlier draft; the correction
is `a3857c7`.)

---

## §4 · What stays open, deliberately

1. **The five files are UNREGISTERED shelf candidates.** No registry row, no `EXPECTED_LEVEL_COUNT`
   change, no sidecar record, no star threshold, no §7.6 stratum assignment. A proven candidate does
   **not** widen a registered ceiling, and `ACT_II_R005A_REGISTERED_TAIL_EXEC` (`28.339426`) is
   untouched by a shelf maximum of `28.455319`.
2. **`--pocketsize ≥ 11` stays DEFERRED.** The pocket census is **complete for pocket size ≤ 10** and
   **unmeasured at ≥ 11** — so no document here claims either "9 is the largest pocket" or any device
   ceiling. The `7×7` capacity rows (`46 / 31 / 31 / 46` sealed rooms, maximum pairwise-disjoint **8**)
   are a *frame-capacity* measurement, not a family claim.
3. **A 5-pocket device is refused by §7.2's published family text and was NOT censused.** Censusing a
   forbidden device is an invitation to a family change, which is a Game Designer decision, not a
   level ticket's.
4. **Both census prefixes are FLOORS, and are labelled so.** `7×7`/20000 walked `10/348` devices with
   the budget **HIT**; the `120000` probe walked `54/348` with the budget **HIT**. Neither is a total,
   and neither is a ceiling in any direction. The one *exact* count in this ticket's ledger is the
   `par 24` probe's closure arithmetic (`293 + 5040 + 2655 + 12 = 8000`).
5. **No class claim is licensed.** *"This device cannot open below `par 18`"* is a statement about the
   device **class**, and a prefix census of **one frame** cannot make it. What is proven is the
   narrower sentence: **the accept pool's minimum in-band par is `18`** — and `par 16`/`par 17` are
   absent from **both** prefixes, including the one at 6× the judged tuples.
6. **The `L35 → L36` seam relief is an instrument artifact, not a felt-ease claim.** `ΔD_exec =
   −6.038144` = `Δpar −6` + `3·ΔB −0.038144` at a `ΔM = 0` boundary; it discharges no clause, and its
   felt half stays a labelled Playtest hypothesis (`NOT TESTABLE`, `n = 0`). It is §7.3.1's **fourth**
   instance and the **third** `batch-seam`.