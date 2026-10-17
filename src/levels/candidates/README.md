# `src/levels/candidates/` — the proposal shelf (**OCCUPIED**: Act II batch 2, `l026`–`l030`, proven and unregistered)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the **registered** L16–L20 block, and §2f the
> **registered** Act II batch 1.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: **OCCUPIED** — Act II batch 2 (`l026`–`l030`), proven and unregistered

The shelf holds five candidate files plus this `README.md`. They are the **Act II batch 2** rungs,
authored and proven by **LV-014** on those very bytes (authoring record
`scripts/author-l2630.transcript.md`, proof record `scripts/prove-candidate-l2630.transcript.md`,
pipeline record `docs/ai-native-pipeline.md` §8.19). They are **shelf candidates**: no registration
ticket has moved them, so they stay outside every shipped-set census — `docs/level-difficulty.report.json`
is still **25** records and `src/game/levels/level-registry.ts` does not import them.

| file | git blob | `sha256` | `par` (solver) | `D_exec` | `B` | chain (press→cross) | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|---|---|
| `l026.json` | `00127e95…` | `0166f697…` | 17 | 21.560241 | 1.5201 | 60/60 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l027.json` | `0aacf6ae…` | `13c29e99…` | 18 | 22.560241 | 1.5201 | 24/24 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l028.json` | `96d26e80…` | `f82ec936…` | 20 | 24.548193 | 1.5161 | 12/12 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l029.json` | `f91a0ffb…` | `1fb03d09…` | 21 | 25.548193 | 1.5161 | 72/72 | UNSATISFIABLE | 20/20 ok · 13/13 caught |
| `l030.json` | `b003f01f…` | `896bdd24…` | 23 | 27.566265 | 1.5221 | 12/12 | UNSATISFIABLE | 20/20 ok · 13/13 caught |

Every number was re-measured on the landed bytes by `@/core/solver/*` and `@/core/rules` — the same
readers that judge the shipped twenty-five — and `T ≡ R ≡ 0` is printed per rung
(`deadStates=0 unrecoverableStates=0 noUnrecoverableOk=true`). The `par` column is the Solver's
shortest solution, and it is **not** a free design choice: the batch's selection rule was published
*before* the run — rung *i*'s par **mirrors** the registered batch-1 ladder (`@/core/solver/policy`'s
`ACT_II_B1_LADDER`, read as a constant, never re-typed), so the five pars are `17 18 20 21 23` and
every one is **strictly interior** to the act band `[16, 24]`. Within-par tie-break is minimal
`D_exec` then enumeration order; §6.1.4's clone clause filters `B`/`M` identity. There is **no**
rising-`D_exec` obligation here (§7.3 puts the across-act clause on the act's *peak*), and the batch
does **not** promote the peak: its peak rung `27.566265` sits below the registered Act II peak
`27.604651`, which is not re-stamped. Clone guard measured: **5 distinct rung keys, 0 collisions**
against the shipped 25 (21 distinct keys over 25 files).

**Equal-par measurement — the batch's thesis.** At the *same* five pars, batch 2's `D_exec` differs
from batch 1 by **−0.021154 · −0.023759 · −0.071807 · −0.056458 · −0.038386** with `ΔB ≤ 0.0239`:
one extra **ordered** press costs under `0.072 D_exec` at fixed par. That is a measurement of *this*
4-press device — not a claim about any device's limit.

**Classes published beside the accepts, by reason.** The 3-pocket census ran to completion
(`--paircap=40 --budget=8000 --cap=400`: **396 accepts / 2640 judged** over **264** `(R2,R3)` pairs;
`devices walked 440/440`, the 40-pair cap hit on **0** pairs, budget 8000 **not reached**), refusals
`par-out-of-band 1178 · g5-identity-broken 538 · unsolvable 528`. Its accepted rows reach `D_exec`
`27.746988` at par 23 — above the registered peak; that is a **measurement of the census**, and the
row was **not selected**. Two declines are named rather than hidden: the **2-pocket class is declined
for batch 2 by design** — its census doubles as the semantics-preservation evidence (`2208 accepts /
9570 judged`, identical before and after the `g3` generalization) — and the **≥ 11-pocket probe is
DEFERRED**, so the census is complete for pocket size ≤ 10 and **unmeasured at ≥ 11**.

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
`@/core/solver/policy` and is re-derived per run by `scripts/attest-r004a-act2.ts` (exit 0,
`RESULT: REGISTERED-MATCH`). The **registered `block-l1619-tail-ceiling` did not move** because
candidates existed, and it did not move at registration either: `BLOCK_L1619_IDS` is still
`[16 … 20]` and L20 was **not re-stamped** (`src/levels/README.md` §2f, §7c).

**Shelf history, in one line each.** `l016.json`–`l019.json` graduated by **R-003c**, `l020.json`
by **R-003d** (blob `78acaed0…`), `l021.json`–`l025.json` by **R-004a** — so the shelf has been
emptied twice and re-occupied **twice**, the second time (this occupancy) by **LV-014** writing
`l026`–`l030` fresh. Every graduation so far was a provenance-exact `git mv`; the current occupant
is still **unregistered**, and the booking is the named set `["l026.json" … "l030.json"]`.

A shelf rung must sit **strictly above the registered root max** — that is a **derived rung
relation, never a ceiling claim about any device**: `docs/project-status.md` item 114's law binds
this prose too — the pocket census is unmeasured at ≥ 11, so neither "9 is the largest pocket" nor
"20 is the device ceiling" may be published in either direction. A shelf file at or below the
registered root max is a root row hiding outside the census, and the pin catches it **as a live
guard, not as a count**.

**Why this `README.md` exists.** `tests/solver/l16-l20-candidates.test.ts` walks this directory and
pins the shelf's obligations (set equality with the booking — `["l026.json" … "l030.json"]` — and
every shelf rung strictly above the registered root max). Earlier in its life the walking reader died
before running a single test (`readLevel(dir, undefined)` against an *empty* shelf) — the R-003c
handover recorded
in `src/levels/README.md` §7 alongside `tests/e2e/helpers/levels.ts:76` and the other count pins —
which is why the booking is a named, live-guarded set rather than a convenience, and why QA-018
proved **both** directions non-vacuously (`cp` in / `mv` out transcripts, `tests/e2e/README.md`
§1.12). The ceiling-wording scrub that came with it is the reason no sentence here quantifies a
device's maximum. This file is documentation, not data: the suite filters on `l\d+\.json`, so it
changes no count.

⚠ **One** `tests/**` row reads the shelf and is **RED** while this booking is populated: the
set-equality assertion at `tests/solver/l16-l20-candidates.test.ts:174`, whose booking literal
`BOOKED_CANDIDATE_IDS_IN_SHELF` at `:161` is still `[]` since R-004a — measured as
`expected [ 'l026.json', … ] to deeply equal []`. It goes green only when a registration ticket moves
these bytes to the root **and** re-books the literal in the same commit. That is the guard working as
designed, not a defect: QA-014 wrote it to catch exactly "an unregistered extra (`l026.json`) dropped
into the shelf" (`tests/e2e/README.md` §1.12). The other clauses of the same test **pass** on these
bytes — clause (b) (every shelf rung strictly above the registered root max, `26–30 > 25`) and the
two-tails row at `:193` (`BLOCK_IDS.at(-1)` is 20, dataset tail 25, no re-stamp) — so the occupancy
adds **exactly one** red row and no other. `tests/**` is QA's lane and was not touched here.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --qmax=4 --pocketsize=4 \
    --paircap=40 --budget=8000 --cap=400                       # LV-014 stage G: the 3-pocket census (396 accepts / 2640 judged)
node_modules/.bin/tsx scripts/author-l21.ts --stage=s --batch=2 --write --accepts=<its own dump>   # LV-014: par-mirror selection + land the bytes
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates   # the assertion pass on the SHELF bytes
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates --measure-controls   # the expectation pass (13 measured)
node_modules/.bin/tsx scripts/solve-levels.ts --audit src/levels/candidates   # an independent reader (5/5 PASS)
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
One boundary is named in **both** directions rather than closed by assumption: the pocket census is
**complete for pocket size ≤ 10** (the `≥ 9` debt F-L20-3 was closed by measurement, `17 476`
leak-free members, histogram `3:34 4:204 6:510 7:2040 9:14688`) and **unmeasured at ≥ 11**, so no
document — this one included — may claim either "9 is the largest pocket" or "the device's ceiling
is 20". A future pass that needs a bigger pocket starts from that measurement
(`scripts/author-l20-p10.transcript.md`, incl. its **§10 corrigendum** on the census instrument).