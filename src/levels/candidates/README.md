# `src/levels/candidates/` — the proposal shelf (one occupant: the L20 candidate)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the L16–L19 registration **and** the L20
> sealed-landing candidate.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: `l020.json` — proven, **unregistered**

| file | what it is | measured on the landed bytes |
|---|---|---|
| `l020.json` | the **sealed landing** (`docs/decisions/design-0004-l20-mechanism-sealed-landing.md`, GD-007's adopted mechanism; the **gauntlet was REJECTED**) | `par 20` · `D_exec` 24.729412 · `B` 1.5765 · 252/252 ordered two-press routes · 14 refusal tiles · 42/42 coverage · all-OFF **UNSATISFIABLE** · **15/15 gates ACCEPT** · 11/11 controls caught |

It is the fifth rung of the L16+ ladder and the first that **exceeds** the block's registered
terminal value rather than matching it (`24.729412 > 22.885157`), because its escalation is a
**mechanism** — the portal lands the player in a walk-sealed pocket whose exit is a single door, so
the shortest plan must run the ordered `land → press → cross → press` chain — instead of a longer
press detour. Full pass record: `docs/ai-native-pipeline.md` **§8.14**; transcript:
`scripts/author-l20.transcript.md`; device read-out and gate table: `src/levels/README.md` §2e.

**Registration is a different ticket** (the R-003c precedent): the root move with blob-hash
identity, the registry row (`src/game/levels/level-registry.ts`), the count pin
(`tests/e2e/helpers/levels.ts:76`), the metrics-sidecar regeneration, and the eight derived pin
tables in `src/levels/README.md` §7. **The registered `block-l1619-tail-ceiling` must not move just
because a candidate exists** — par 18 / `D_exec` 22.885157 is the registered stop, and the ladder's
strict-`D_exec`-rise obligation is what would judge a future registration. Nothing here claims the
dataset contains L20: `EXPECTED_LEVEL_COUNT`, the sidecar and the registry still read **19**.

`l016.json` … `l019.json` were the shelf's previous occupants and **graduated** by R-003c
(`git mv`, hashes verified against `3cc6df2:src/levels/candidates/lNNN.json`) after being proven on
these very bytes by `scripts/prove-candidate.ts` — see `docs/ai-native-pipeline.md` §8.12
(authoring) and §8.13 (registration).

**Why this `README.md` exists.** `tests/solver/l16-l20-candidates.test.ts` walks this directory and
pins the block's obligations. It used to find no `l*.json` here and die before running a single test
(`readLevel(dir, undefined)` against the empty shelf — the R-003c handoff in `src/levels/README.md`
§7 lists it with `tests/e2e/helpers/levels.ts:76` and the other count pins). With `l020.json`
present it **runs**: 17 tests, 14 pass / 3 red. Two of the reds are count/fixture reds that predate
this candidate; the third is **F-L20-2** and is about the *control's* premise, not the board — the
latch-removed negative control asserts a bare board stays solvable, which a sealed landing falsifies
by construction (its all-OFF world is unsatisfiable, and that is the point of the device). It is
reported to QA-011 in `docs/ai-native-pipeline.md` §8.14, not edited here. This file is
documentation, not data: the suite filters on `l\d+\.json`, so it changes no count.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8        # stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8 --write  # stage SL: lattice + land the selection
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --only=6,2           # per-landing pass (a family ceiling, measured)
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4     # the L16–L19 (goal-gated seal) tool, unchanged
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l018.json --rung=18
```

`--write` is what lands bytes on the shelf; nothing here is ever auto-repaired (ADR-0004). A
candidate that fails one gate is **rejected**, never fixed in place — the generator prints the
rejection ledger (per-gate, with the gate's own `detail`), the selection is derived (exact rung par
→ minimal `D_exec` → enumeration order), and re-running the census re-derives every file it wrote.
One boundary is named rather than closed: the sealed-landing pocket class is **not proven complete**
at `--pocketsize ≥ 9` (F-L20-3 — `≤10` measures strictly *more* leak-free pockets than `≤8`), so a
future pass that needs a bigger pocket starts from that measurement, not from a completeness claim.