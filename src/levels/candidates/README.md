# `src/levels/candidates/` — the proposal shelf (**OCCUPIED**: Act II batches 2 + 3, `l026`–`l035`, proven and unregistered)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the **registered** L16–L20 block, and §2f the
> **registered** Act II batch 1.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: **OCCUPIED** — **ten** files, two proven-and-unregistered Act II batches

The shelf holds **ten** candidate files plus this `README.md`: **`l026`–`l030`** (Act II batch 2,
authored and proven by **LV-014**; `scripts/author-l2630.transcript.md`,
`scripts/prove-candidate-l2630.transcript.md`, pipeline record `docs/ai-native-pipeline.md` §8.19)
and **`l031`–`l035`** (Act II batch 3, authored and proven by **LV-015** on those very bytes;
`scripts/author-l3135.transcript.md`, `scripts/prove-candidate-l3135.transcript.md`, pipeline
record §8.20, merged to `develop` at `afeb5262d`). Both batches are **shelf candidates**: no
registration ticket has moved them, so they stay outside every shipped-set census —
`docs/level-difficulty.report.json` is still **25** records and `src/game/levels/level-registry.ts`
does not import them.

Every number below was re-measured **on these landed bytes** by `@/core/solver/*` and
`@/core/rules` — the same readers that judge the shipped twenty-five. Re-run by **LV-016** on the
ten files as one shelf (the derived-exact band of §7.9, not the printed rounding):

```bash
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels/candidates
#   → LADDER RESULT: PASS (10/10 rung(s) ACCEPT, controls named: 130/130 across the 10 rung(s))
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates
#   → summary: 10/10 level file(s) PASS · par verified from the solver on 10/10 · RESULT: PASS
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
its own formula, see `src/levels/README.md` §2f). **Both are shelf measurements:** a shelf file
does not widen a registered ceiling, and only a registration ticket can put these five numbers in
the dataset's table.

The relief L30→L31 (`ΔD_exec −4.362098`) is the dossier's **single** drop; its §7.3.1-form label was
published **before `--write`** and blessed for R-006 (`docs/decisions/design-0007-…` RULING C).
Inside batch 3 the equal-par pairs **rise** (`+0.019191`, `+0.212483`) — instrument facts, not
relieves.

## The booking is a **named ten-name set**, and its row is green

`tests/solver/l16-l20-candidates.test.ts` walks this directory and pins the shelf's obligations:
**set equality** with the booking literal `BOOKED_CANDIDATE_IDS_IN_SHELF` (a set comparison, never
a length) and *every shelf rung strictly above the registered root max*. The literal now lists the
**ten** Act II ids `l026.json` … `l035.json`: QA-025 booked the five LV-014 ids, and **QA-026
re-booked the literal to the ten names** when LV-015 posted batch 3 beside batch 2 — a five-name
literal over a ten-file shelf was the one red this suite carried until then, so the **shelf is
`0`-red again** at the ten-deep booking (QA-026, `d21f399`; `mv l035.json` out reddens the row **by
name**, so the guard is live rather than vacuous).

History, kept honest: this file once carried a ⚠ paragraph saying the row was **RED** while the
booking literal was still `[]` (the R-004a left-over). That was true of the five-entry era and is
**stale now** — the populated direction is the current state, and the red is gone.

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
`docs/level-difficulty.report.json` (**25** records). The registration's own law — the act's
**maximum** carries §7.3's across-act obligation, while the act's *opening* rung sits below the
previous act's peak as a **plateau relaxation at a `ΔM = 0` boundary**, never a dip — lives in
`@/core/solver/policy` and is re-derived per run by `scripts/attest-r004a-act2.ts`. The
**registered `block-l1619-tail-ceiling` did not move** because candidates existed, and it did not
move at registration either: `BLOCK_L1619_IDS` is still `[16 … 20]` and L20 was **not re-stamped**
(`src/levels/README.md` §2f, §7c).

**Shelf history, in one line each.** `l016.json`–`l019.json` graduated by **R-003c**, `l020.json`
by **R-003d** (blob `78acaed0…`), `l021.json`–`l025.json` by **R-004a** — so the shelf has been
emptied twice and re-occupied **three** times: `l026`–`l030` fresh by **LV-014**, then `l031`–`l035`
beside them by **LV-015**. Every graduation so far was a provenance-exact `git mv`; the current
occupants are **unregistered**, and the booking is the named ten-name set
`["l026.json" … "l035.json"]`.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --qmax=4 --pocketsize=4 \
    --paircap=40 --budget=8000 --cap=400                       # LV-014 stage G: the 3-pocket census (396 accepts / 2640 judged)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=2 --write --accepts=<its own dump>   # LV-014: par-mirror selection + land the bytes
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=1 --pocketsize=4 \
    --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24   # LV-015 stage G: the batch's own pool on the CX = 1 frame (498 accepts / 20000 judged)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=3 --parmin=16 --parmax=24 --write \
    --accepts=<f's dump>                                       # LV-015: anti-mirror selection + land the bytes
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels/candidates   # the assertion pass on the TEN shelf bytes (10/10 · 130/130)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=31,32,33,34,35 --dir=src/levels/candidates --measure-controls   # the expectation pass (13 measured)
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates   # an independent reader (10/10 PASS)
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8        # (historical) stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write  # (historical) stage SL: lattice + land the selection
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels    # R-004a: the batch-1 ladder re-proven from the ROOT
node_modules/.bin/tsx scripts/attest-r004a-act2.ts                          # R-004a: byte identity + the registered ladder + the §7.3 tail law + its control battery
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4     # the L16–L19 (goal-gated seal) tool, unchanged
```

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