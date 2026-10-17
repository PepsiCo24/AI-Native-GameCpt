# LV-014 — the proving side of Act II batch 2 (`l026`…`l030`, shelf candidates)

The authoring side is `scripts/author-l21.ts` (its record: `scripts/author-l2630.transcript.md`).
This file is the **proof**: every number below is a re-measurement of the **bytes on disk** by
`@/core/solver/*` and `@/core/rules` — the same readers the shipped twenty-five are judged by.
Nothing here is quoted from the authoring tool, and nothing here can write a level.

```
npx tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates              # assertion pass (exit 0)
npx tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates --measure-controls   # EXPECTATION pass (exit 0)
npx tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates --peak=28.5  # act-peak falsification (exit 1)
npx tsx scripts/solve-levels.ts --audit src/levels/candidates                                                  # the audit CLI (exit 0)
```

Measured exit codes: assertion **0** · expectation **0** · falsification **1** · audit **0**.

## 1. The instrument — `--family=g` on a 3-pocket device, and one generalization

`--family=g` derives the multi-pocket device **from the board** (never from the generator) and reads
seven gates off the bytes: `g0-portal-pair` (exactly one pair, opposite parity, the teleport measured
on the derived landing end) · `g1-pocket-on-foot` (the landing room is not walk-reachable
portal-free, and no sealed room's tile is) · `g2-room-exit-door` (every room's boundary is one whole
door object, 0 phase-wall boundary tiles, 0 leaks, re-measured against the level *as it stands*) ·
`g6-room-structure` (room count, distinct covering doors, the landing room carrying the switch that
opens **its own** door, the goal's room switch-free) · `g3-ordered-chain` (the press order is read
off the solver's par routes, one shared order, the strict `press(s_i) < cross(door(s_i)) <
press(s_{i+1})` milestone order on **every** route, then **FORCED** by staged worlds) ·
`g4-switch-required` and `g5-identity-broken`. The five Act-`I` ladder gates plus `act2-par-band`,
`act2-exec-band`, `act2-b-band` and `act-peak` are unchanged in meaning.

One generalization landed with this batch, and it needed an **argument** plus a measurement, not a
re-run: `g3-ordered-multi-press` required `minPresses >= 2`; it now requires
`minPresses >= ctx.presses.length`. On a 3-press device that is the identical requirement; on a
4-press device it is the strict one, and it is measured on the accept class — `chain = n/n` on every
accept of both batches (the whole chain on **every** shortest route) — so it cannot refuse a batch-1
accept. The batch-1 accept class was re-measured after every tool edit and is **identical**
(`2208 / 9570`, same histogram and same upstream skips: `scripts/author-l2630.transcript.md` §4).

## 2. Pass 1 — the EXPECTATION pass (measured first, never guessed)

F-L16-3 / F-L20-4 order: the controls run **before** their `expect` lists are written, and the
printed reason **is** the measurement. `--measure-controls` asserts nothing; it prints what each
mutation does to the landed bytes, and only then does the assertion pass check that each mutation is
refused by one of the gates that control may name.

```
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)
RESULT: PASS
```

The base six are the same class `--family=sl` uses (removed latch · muted switches · goal sealed in
both phases · portal pair dropped · every switch retargeted · par mis-stamped). The seven family-`g`
controls, each **named by the gate it catches**:

| control (a mutation of the landed bytes) | refusal, measured |
|---|---|
| a second portal pair added (§6.2.3 item 1: exactly one) | `g0-portal-pair` **named** |
| the landing room's door `d1` dropped (the room is no longer portal-only) | `g1-pocket-on-foot` **named** |
| one landing-room boundary tile dropped from `d1` (a free leak) | `g2-room-exit-door` **named** |
| the landing device removed (door + switch): the multi-pocket derivation collapses | `g6-room-structure` **named** |
| the goal's seal door `d4` dropped (the chain loses a press) | `g3-ordered-chain` **named** |
| every door and switch dropped (existence stops needing any press) | `g4-switch-required` **named** |
| the landing-device-removed world (the census identity holds again) | `g5-identity-broken` **named** |

## 3. Pass 2 — the assertion pass, per rung

`... --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates` → **exit 0**, `GATES: ACCEPT`
on every file, and:

| rung | par | `D_exec` | `B` | coverage | par routes / press-then-cross | all-OFF | gates | controls |
|---|---|---|---|---|---|---|---|---|
| L26 | 17 | 21.560241 | 1.5201 | 42/42 | 60 / **60** | UNSATISFIABLE | 20/20 ok | 13/13 caught |
| L27 | 18 | 22.560241 | 1.5201 | 42/42 | 24 / **24** | UNSATISFIABLE | 20/20 ok | 13/13 caught |
| L28 | 20 | 24.548193 | 1.5161 | 42/42 | 12 / **12** | UNSATISFIABLE | 20/20 ok | 13/13 caught |
| L29 | 21 | 25.548193 | 1.5161 | 42/42 | 72 / **72** | UNSATISFIABLE | 20/20 ok | 13/13 caught |
| L30 | 23 | 27.566265 | 1.5221 | 42/42 | 12 / **12** | UNSATISFIABLE | 20/20 ok | 13/13 caught |

The 20 gates read per file, in the order the prover prints them: `par-stamped` · `region` ·
`escalation` · `act2-par-band` · `act2-exec-band` · `act2-b-band` · `act-peak` · `latch-grade` ·
`latch-route` · `refused-beat` · `coverage` · `validator` · `well-formed` · `g0-portal-pair` ·
`g1-pocket-on-foot` · `g2-room-exit-door` · `g6-room-structure` · `g3-ordered-chain` ·
`g4-switch-required` · `g5-identity-broken`.

The chain, read off the solver's own routes (one line per rung, shortened):

```
g3-ordered-chain par=17 · 60 shortest route(s); press order(s) [s1>s2>s3>s4]; distinct switches per
  route: min=4 (required ≥ 3); routes executing press→cross in the strict order with the landing
  room's switch first: 60/60; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false
  goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false ·
  drop{s1,s2,s3} ⇒ switch s4 tile reachable=false goal reachable=false
```

i.e. §6.2.3 item 4 is satisfied **one door deeper**: not "≥ 2 presses" but the whole **4-press**
chain, forced, on every shortest route, with the staged-world test refusing both the next press's
tile and the goal. `g5-identity-broken` re-measures the identity's **value** rather than its shape —
e.g. on L30 the landing-device-removed world solves at **21 < par 23**.

`T ≡ R ≡ 0` is printed per rung (`region deadStates=0 noUnrecoverableOk=true T=0 R=0`), which is the
§4 acceptance region; `validator` reads `ok=true errors=0 warnings=6 policyViolations=0`
(`one-switch-per-door=true every-switch-fires=true`). The six warnings are the frame walls'
"this wall can never be entered on any move count" notice, and they carry their own boundary
explicitly: *"NOT PROVEN for this candidate: it carries 1 portal(s), and a teleport between tiles of
opposite (x + y) parity breaks the parity link above, so this wall may still be enterable from a
portal landing (manual review / needs the solver)"* — the same warning class the registered Act II
batch-1 boards carry, reported and not suppressed.

Audit CLI, an independent reader:

```
[1/2] level files (5)
  PASS l026.json  id=26 7x6 startPhase=A par=17   (parMatch=true · switchRequired=true ·
       noUnrecoverableOk=true · deadStates=0 · distinctPositions=42 · reachableStates=498 · maxDepth=33)
  PASS l027.json  id=27 … par=18 · PASS l028.json id=28 … par=20
  PASS l029.json  id=29 … par=21 · PASS l030.json id=30 … par=23
RESULT: PASS
```

## 4. The falsification — the instrument can fail, and it fails exactly where it should

```
--peak=28.5 → exit 1
  FAIL act-peak  D_exec=27.566265 vs Act I's measured peak 28.500000 (delta -0.933735) —
    §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member:
    ladder peak rung = L30
LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, every control caught on every rung)
```

**4/5, and the one failure is the peak rung** — the same shape R-004a used to prove `act-peak` is not
a tautology. On the real constants (`--peak` defaulting to the law's `ACT_I_REGISTERED_PEAK_EXEC`):

```
LADDER TABLE — L26 … L30
L26 · par 17 · 21.560241 · in band · coverage 42/42 · Δpar —      · Δ vs Act I peak -3.169171
L27 · par 18 · 22.560241 · in band · coverage 42/42 · Δpar <2 (1) · Δ vs Act I peak -2.169171
L28 · par 20 · 24.548193 · in band · coverage 42/42 · Δpar ≥2 (2) · Δ vs Act I peak -0.181219
L29 · par 21 · 25.548193 · in band · coverage 42/42 · Δpar <2 (1) · Δ vs Act I peak 0.818781
L30 · par 23 · 27.566265 · in band · coverage 42/42 · Δpar ≥2 (2) · Δ vs Act I peak 2.836853
batch peak: L30 at 27.566265 · Act I measured peak 24.729412 · §7.3 act-peak clause DISCHARGED ·
  headroom to the Act II ceiling 29.06: 1.493735
LADDER RESULT: PASS (5/5 rung(s) ACCEPT, every control caught on every rung)
```

§7.3's across-act clause is **DISCHARGED** by the act's maximum (Δ **+2.836853** over Act I's
24.729412), and the batch does **not** promote the registered Act II peak: its peak rung
(27.566265) sits **below** the registered 27.604651. The census rows that would exceed it
(up to `D_exec` 27.746988 at par 23) are published as measurements in
`scripts/author-l2630.transcript.md` §3 and were **not** selected.

## 5. Battery, and the one RED that is booked by name

| leg | command | result |
|---|---|---|
| types | `npx tsc --noEmit` | **clean**, exit 0 |
| dataset | `npm run levels` | **25/25 level files ok · 0 errors · 88 warnings (0 multi-switch-door) · 11/11 negative cases · RESULT: PASS** — the five candidates are invisible to every shipped-set census (the readers walk the root non-recursively), so the dataset stays **25** |
| audit | `npx tsx scripts/solve-levels.ts --audit src/levels/candidates` | **5/5 PASS**, `parMatch=true` ×5, `RESULT: PASS` |
| proof | `prove-candidate --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates` (+`--measure-controls`) | exit 0, **5/5 ACCEPT**, **13/13 controls caught**, `LADDER RESULT: PASS` |
| falsification | `… --peak=28.5` | exit **1**, `FAIL (4/5)` — exactly the peak rung |
| suite | `npx vitest run` | **1 failed / 859 passed / 3 skipped (863) across 37 files** |

The single red is **booked, by name**, and it is the shelf's own live guard:

```
FAIL tests/solver/l16-l20-candidates.test.ts > … > the shelf holds only the booked pre-registration
  candidates (empty — R-004a landed l021–l025), every rung derived strictly above the registered root max
AssertionError: expected [ 'l026.json', 'l027.json', …(3) ] to deeply equal []
  ❯ tests/solver/l16-l20-candidates.test.ts:174:19
```

`BOOKED_CANDIDATE_IDS_IN_SHELF` (`:161`) is `[]` since R-004a registered the batch-1 set, and the
assertion is **set equality**: an unregistered extra fails by name, which is exactly what QA-018
designed it to do when it wrote *"an unregistered extra (`l026.json`) dropped into the shelf still
fails by name"*. Clause (b) of the same test — every shelf rung strictly above the registered root
max — **passes** on all five (26–30 > 25), and the terminal-rung clause passes too, so the shelf adds
**one** red row and no other. It goes green only when a registration ticket moves these bytes to the
root **and** re-books the literal in the same commit; `tests/**` is QA's lane and was not touched.

## 6. Reproducing this record

```
npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --qmax=4 --pocketsize=4 \
    --paircap=40 --budget=8000 --cap=400                       # re-derives the census (396 / 2640)
npx tsx scripts/author-l21.ts --stage=s --batch=2 --write --accepts=<the dump it wrote>   # re-derives the five files
npx tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates --measure-controls
npx tsx scripts/solve-levels.ts --audit src/levels/candidates
```

The authoring tool prints its own counters and its own byte-for-byte rewrites; the proof reads only
the landed files. Neither can repair a candidate (ADR-0004): a board that fails one gate is
**rejected with its measurement**, and the classes it was rejected from are reported by reason.