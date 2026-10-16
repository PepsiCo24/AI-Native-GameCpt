# `src/levels/candidates/` — the proposal shelf (**empty since R-003c**)

> Owner: **Level AI + Solver** (AGENTS.md §4). The dataset itself is one directory up:
> `src/levels/README.md` §0 lists it, §2e documents the L16–L19 registration.

This directory is the **shelf, not the ship**: a candidate is authored here, proven here, and only
moved into `src/levels/` root by a deliberate registration ticket. It sits *inside* `src/levels/`
on purpose — the three readers that own the shipped-set census walk the root **non-recursively**
(`tests/solver/difficulty.test.ts`'s `SHIPPED_IDS`, `tests/solver/metrics-sidecar.test.ts`'s
report length, and `src/game/levels/level-registry.ts`'s explicit imports), so a candidate on the
shelf is visible to a human and invisible to every gate that counts shipped levels.

## Current state: no candidate files

The shelf is empty because its last occupants graduated. `l016.json` … `l019.json` were
**byte-copied** into the root by **R-003c** (`git mv`, hashes verified against
`3cc6df2:src/levels/candidates/lNNN.json`) after being proven on these very bytes by
`scripts/prove-candidate.ts` (nine gates + a six-control mutation battery each) — see
`docs/ai-native-pipeline.md` §8.12 (authoring) and §8.13 (registration).

**Why this `README.md` exists.** `tests/solver/l16-l20-candidates.test.ts` used to walk this
directory and pin the block's obligations. It now finds no `l*.json` here, so it is **RED until
QA re-points it at the root** (the R-003c handoff in `src/levels/README.md` §7 lists it with
`tests/e2e/helpers/levels.ts:76` and the other count pins). This file keeps that red *legible* —
an empty directory with no explanation reads like a lost dataset. It is documentation, not data:
the suite filters on `l\d+\.json`, so this file changes no count.

## L20 is not on the shelf, and that is a measurement

No `l020.json` was ever authored, and no candidate is being held back. The goal-gated full-seal
device the block is built from measures a ceiling of **par 18 / `D_exec` 22.885157** on `7×6` at
every seal arity — exhaustive censuses, not samples (`src/levels/README.md` §2e). A par-20 rung
needs a **new lattice stage**: a *gauntlet* (every approach to the goal's ring itself behind a
door) or a *sealed landing* (the portal lands in a pocket whose exit is a door, an ordered
two-press chain). Neither is built. The next lane starts by building that stage, **not** by
lengthening a walk — the rung law would reject the latter by name.

## Working here

```bash
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4        # propose + census
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=d --cx=3 --id=18 --geos=45 --write
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l018.json --rung=18
```

`--write` is what lands bytes on the shelf; nothing here is ever auto-repaired (ADR-0004). A
candidate that fails one gate is **rejected**, never fixed in place — the generator prints the
rejection ledger, and re-running it re-derives every file it wrote.