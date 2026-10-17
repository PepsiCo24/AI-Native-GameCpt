# `src/levels/candidates/` — the proposal shelf (booked: the five Act II batch-1 candidates `l021`–`l025`)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the **registered** L16–L20 block.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: the booked set `l021`–`l025` — proven, **unregistered**

The shelf holds **exactly five files, and they are the booked set**: `l021.json` … `l025.json`, the
**Act II batch 1** rungs authored and proven by LV-012 on these very bytes
(`scripts/prove-candidate-l2125.transcript.md`; pipeline record `docs/ai-native-pipeline.md` §8.16).
The booking is asserted as **set equality** — QA-018's re-book of the shelf pin
(`tests/solver/l16-l20-candidates.test.ts:163`) — so an unregistered extra (`l026.json`) and a
vanished member (`l025.json` gone) both fail **by name**:

| file | `par` (solver) | `D_exec` | `B` | coverage | all-OFF world | gates / controls |
|---|---|---|---|---|---|---|
| `l021.json` | 17 | 21.581395 | 1.5271 | 42/42 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l022.json` | 18 | 22.584000 | 1.5280 | 42/42 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l023.json` | 20 | 24.620000 | 1.5400 | 42/42 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l024.json` | 21 | 25.604651 | 1.5349 | 42/42 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |
| `l025.json` | 23 | 27.604651 | 1.5349 | 42/42 | UNSATISFIABLE | 5/5 ACCEPT · 13/13 caught |

Every rung's `par` is derived **strictly above the registered root max** (20) and its `D_exec` rises
strictly above the registered Act I peak (24.729412) — a **derived rung relation, never a ceiling
claim about any device**: `docs/project-status.md` item 114's law binds this prose too — the pocket
census is unmeasured at ≥ 11, so neither "9 is the largest pocket" nor "20 is the device ceiling" may
be published in either direction. A shelf file at or below the registered root max is a root row
hiding outside the census, and the pin catches it **as a live guard, not as a count**.

`l020.json` was the shelf's previous occupant: it **graduated** by R-003d (`git mv` into
`src/levels/`, blob `78acaed0…`, root re-measure equal to the booked `20 / 24.729412 / 1.5765`), and
`l016.json`–`l019.json` graduated earlier the same way by R-003c — so the shelf has been
*re-occupied* by LV-012's batch, not left empty. Registration of `l021`–`l025` is a **later ticket**
(the R-003c/R-003d precedent: the root move with blob-hash identity, the registry rows, the count
pins, the metrics-sidecar regeneration and the derived tables in `src/levels/README.md` §7), and the
**registered `block-l1619-tail-ceiling` does not move because candidates exist**.

**Why this `README.md` exists.** `tests/solver/l16-l20-candidates.test.ts` walks this directory and
pins the shelf's obligations (set equality with the booking, and every rung strictly above the
registered root max). Earlier in its life the walking reader died before running a single test
(`readLevel(dir, undefined)` against an *empty* shelf) — the R-003c handover recorded in
`src/levels/README.md` §7 alongside `tests/e2e/helpers/levels.ts:76` and the other count pins — which
is why the booking is a named, live-guarded set rather than a convenience. QA-018 proved the re-booked
case non-vacuous in **both** directions (`cp` in / `mv` out transcripts, `tests/e2e/README.md` §1.12);
the ceiling-wording scrub that came with it is the reason no sentence here quantifies a device's
maximum. This file is documentation, not data: the suite filters on `l\d+\.json`, so it changes no
count.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8        # stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write  # stage SL: lattice + land the selection
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --only=6,2           # per-landing pass (an estimator, measured not guessed)
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l021.json --rung=17 --family=g
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l025.json --rung=23 --family=g
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4     # the L16–L19 (goal-gated seal) tool, unchanged
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l024.json --rung=21 --family=g
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