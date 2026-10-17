# `src/levels/candidates/` — the proposal shelf (**EMPTY**: the Act II batch-1 set `l021`–`l025` graduated at R-004a)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the **registered** L16–L20 block, and §2f the
> **registered** Act II batch 1.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: **EMPTY** — the booked set graduated

The shelf holds its `README.md` and **nothing else**. The five files that were booked here
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
by **R-003d** (blob `78acaed0…`), and `l021.json`–`l025.json` by **R-004a** — so the shelf has now
been emptied twice and re-occupied once, each time by a provenance-exact `git mv`. A future batch
re-occupies it; until then the booking is the **empty set**.

A shelf rung must sit **strictly above the registered root max** — that is a **derived rung
relation, never a ceiling claim about any device**: `docs/project-status.md` item 114's law binds
this prose too — the pocket census is unmeasured at ≥ 11, so neither "9 is the largest pocket" nor
"20 is the device ceiling" may be published in either direction. A shelf file at or below the
registered root max is a root row hiding outside the census, and the pin catches it **as a live
guard, not as a count**.

**Why this `README.md` exists.** `tests/solver/l16-l20-candidates.test.ts` walks this directory and
pins the shelf's obligations (set equality with the booking — now `[]` — and every shelf rung
strictly above the registered root max). Earlier in its life the walking reader died before running
a single test (`readLevel(dir, undefined)` against an *empty* shelf) — the R-003c handover recorded
in `src/levels/README.md` §7 alongside `tests/e2e/helpers/levels.ts:76` and the other count pins —
which is why the booking is a named, live-guarded set rather than a convenience, and why QA-018
proved **both** directions non-vacuously (`cp` in / `mv` out transcripts, `tests/e2e/README.md`
§1.12). The ceiling-wording scrub that came with it is the reason no sentence here quantifies a
device's maximum. This file is documentation, not data: the suite filters on `l\d+\.json`, so it
changes no count.

⚠ Two `tests/**` rows read the shelf and are **RED** until R-004c re-takes them
(`src/levels/README.md` §7c item 5): the booking literal at
`tests/solver/l16-l20-candidates.test.ts:159/:178` (`["l021.json" … "l025.json"]` → `[]`) and the
terminal-rung clause at `:204`, which must be **re-worded, not re-stamped** (`BLOCK_L1619_IDS.at(-1)`
is 20 while the dataset max is now 25). `tests/**` is QA's lane and was not touched here.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8        # stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write  # stage SL: lattice + land the selection
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --only=6,2           # per-landing pass (an estimator, measured not guessed)
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l021.json --rung=17 --family=g   # at authoring time; R-004a moved the bytes to src/levels/l021.json
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels    # R-004a: the same ladder re-proven from the ROOT
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