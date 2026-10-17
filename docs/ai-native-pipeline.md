# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Level AI + Solver** with **Orchestrator** (formatting maintenance by Docs + GitHub; content belongs to the owners)
> Version: V1.14 · Date: 2026-10-17

---

## 1. Principle

> **LLM creates. Solver proves. Human decides.**

The LLM is never allowed to declare "this level is definitely solvable." Solvability is always decided by the program Solver.

## 2. End-to-end evidence chain

```
Human defines Core Rule
  ↓
AI proposes mechanics
  ↓
AI generates Level candidates (JSON)
  ↓
Schema Validation (zod)
  ↓
Rule Validation (bounds / dup ids / goal reachable)
  ↓
Solver (BFS → A*)
  ↓
Solvability + Shortest Path + numSolutions
  ↓
Difficulty Metrics
  ↓
Reject / Accept
  ↓
Human + AI select levels & order curve
  ↓
Players test (browser)
  ↓
Telemetry reveals problems
  ↓
AI diagnoses bottlenecks
  ↓
Level parameters change
  ↓
Solver revalidates
  ↓
Players retest
  ↓
Final 50 levels
```

## 3. Generation → validation gate (per candidate)

```
LLM Generate Candidate
        ↓
Schema Validation        → fail = REJECT
        ↓
Rule Validation          → fail = REJECT
        ↓
Solver                   → unsolvable = REJECT
        ↓
Difficulty Metrics
        ↓
Reject / Accept          → accept = enters candidate pool
        ↓
Human Playtest
```

Hard reject conditions:

- Unsolvable.
- Solvable but contains redundant steps (a shorter optimal exists that contradicts the intended curve).
- "Fake hard": many branches but trivially forced (branching ≈ 1).
- Excessive dead-end ratio that punishes casual play.
- Invalid schema / out-of-bounds / duplicate ids.
- A cell that is **two objects at once** — today exactly one case exists, a door tile that is also a phase wall (§3b). The board must never promise a move it refuses.
- **M1 alone**: a door no switch targets, or a door whose only switches can never fire anywhere in the reachable state space. Measured, not declared — see §8. (M1+M3 without either half is the mechanic ADR-0009 measured as static: `refusedThenEnteredTiles = 0`.)
- A documented lesson the board does not deliver (a "forced" phantom walk that is optional, a latch level with `refusedThenEnteredTiles = 0`, a documented load-bearing latch whose goal is still reachable with every switch OFF — `lesson-switch-required`, §8.5 — a named Aha gate that FAILs). The documentation is checked against the program, never the other way round.

## 3b. Level Schema — the validator's own adjudications (door ∩ wall = illegal)

> Owner: **Level AI + Solver** (`src/core/level/**`). Enforced by `validateLevel`; gates: `scripts/validate-levels.ts` and `scripts/solve-levels.ts` (both call it — one function, one truth source), plus the gameplay loader `src/game/levels/level-registry.ts`. A rejection is never a repair: the candidate is re-authored or dropped (`ADR-0004`).

**Ruling (LV-005, 2026-10-14): a tile that appears in `doors[].tiles` *and* in `phaseAWalls` or `phaseBWalls` is ILLEGAL — a hard error. It is *not* "the door swallows the wall", and not "the wall swallows the door".**

Why this is a rejection and not a precedence rule:

1. **The legality layer has no conflict — the read layer does.** `solidAt` already unions *current-phase wall ∪ closed door* (`src/core/rules/solid.ts`, ADR-0008 clause 5), so entry is decidable. But the board's first readable axis is `docs/ui-ux.md` §3.2 **R-C2**: *solid = refuses entry now, hollow = passable now* (walls R-E3, doors R-D1). An overlap cell has to answer that question with **two** objects: a wall tile is drawn in **both** phases (solid in its own phase, hollow echo in the other — §3.1a), while a door's open/closed state is a second, independent state (§3.1b). §3.1 enumerates every cell as **exactly one** class (empty / wall / door / portal / switch / goal), so the overlap cell has no defined rendering at all — and the shipped renderer draws the wall and no door object yet (`src/game/renderer/objects/registry.ts`: `door` is deliberately not implemented).
2. **The lie is real and measured, not hypothetical.** While the wall echoes, the cell renders **hollow** ("passable now") while a door closed in that phase still refuses entry: the board promises a legal move and answers "illegal". Program evidence (shipped `applyMove` + BFS, `tests/unit/door-wall-overlap.test.ts`): the checkerboard invariant (`ADR-0009`) pins the phase in which each tile is *clicked*, so per tile exactly **one of the four (wall phase × door colour) overlaps** lies — and it lies on *every* move count. On the suite's 5 × 3 boards: `reachableStates=14, clicks-on-tile=4, refused=4, hollow-but-refusing=4` for both lying combinations (entry-A tile + B-wall + blue door; entry-B tile + A-wall + red door), `0` for the six honest ones; with an M3 latch (29 reachable states) the same tile is *refused* in only some of its click states (`4` of `8` clicks — the other four are legal once the latch opens the door), and every one of those refusals is the hollow-read lie. Two consequences worth recording: (a) **no per-state validation could catch this** (the tile is permanently wrong, not wrong in one state), and (b) the mirror combinations are *redundant* (the wall already blocks the entry) rather than misleading — they are rejected too, because §3.1 gives the cell no rendering at all and two verdicts for one geometry is exactly the drift this pipeline exists to prevent.
3. **Not inventing a rule.** No document defines appearance precedence for two objects in one cell (`docs/level-design.md` §1 silent; `docs/ui-ux.md` §3.1 defines no composition). Appearance precedence is the **UI / Art Director's** decision (`docs/ui-ux.md` — the appearance-priority pass there), so this pipeline records the **data-layer** verdict only: *the schema has no such cell*. If appearance precedence is ever defined and such a cell becomes readable, this ruling stays "illegal" until the Game Designer, the UI / Art Director and the Orchestrator change it **together** here and in the validator.
4. **Cheapest deterministic gate.** A data-layer rejection costs one set lookup per door tile and is decidable without a single search; "draw both and hope the player reads it" is neither verifiable nor testable (AGENTS.md §7).

Enforcement detail: the error names the door path, the coordinate and every wall list involved, e.g. `doors[0] "d1".tiles[0] (3, 1) is also listed in phaseAWalls — a door tile must never be a phase wall (hard error): …` (also `… in phaseBWalls`, `… in phaseAWalls and phaseBWalls`). The full message carries the readability rationale and cites this section.

## 4. Difficulty metrics (per accepted level)

What the **solver contract** carries (`SolveResult` / `EmbedMetrics`, `@/core/solver/bfs`):

```
solvable · shortestSolution (L) · numSolutions
reachableStates · maxSearchDepth · forcedMoveRatio (diagnostic — NOT `T`)
deadStates / unrecoverableStates / noUnrecoverableOk
refusedThenEnteredTiles      (#7 canonical, UNORDERED — the pre-L11 acceptance carrier, §8.5)
refusedBeforeEnteredTiles    (#7 ordered companion — the reader of Aha gate (iii) since
                              LV-007C; reported on every level, gated only there; §8.5)
dualPhaseTiles               (#3)
embedRoutes / parRoutes      (LV-004: how many shortest routes end embedded — the phantom walk)
switchRequired               (LV-006: is the goal reachable with every switch OFF?)
```

What the **§2 difficulty model** adds (`@/core/solver/difficulty`, surfaced as
`LevelAudit.difficulty` and printed as the per-level `difficulty` /
`difficultyDiagnostics` lines — deliberately **not** part of `SolveResult`, so a
playtest-driven re-calibration moves no solver contract):

```
L · B (effective) · T · R · M
D = w1·L + w2·B + w3·T + w4·R + w5·M      (null iff the board is unsolvable)
D_exec = D − w5·M = w1·L + w2·B + w3·T + w4·R   (execution axis; ADR-design-0001)
diagnostics: bRaw · forcedMoveRatio · lookaheadDepth · unrecoverableRatio · reachableStates
```

Weights are **calibrated from real playtest data**, never hard-frozen. As of **LV-007B
item 3** every term is *measured* — the gap `docs/level-difficulty.md` §5.1 recorded as open
(`B` effective, `T`, `R`, and therefore `D`) is closed by §5.2 there, with the definitions
pinned in its §2a. Two facts from that measurement belong in the pipeline's own record:
inside the `docs/level-design.md` §4 acceptance region `T ≡ 0` **and** `R ≡ 0` (so
`D = L + 3·B + 5·M` for any shippable level and `w3`/`w4` are inert), and the L5→L6
block-opening dip `docs/level-difficulty.md` §3 asks for is measured **+8.53** on `D`
instead of the −2…−3 that the pre-V0.6 `docs/level-design.md` §6 clause demanded — a weight /
definition question for the Game Designer, reported as-is, never tuned away here. The
answer landed as **ADR-design-0001** (`docs/level-design.md` §6 V0.6): the dip law is
re-anchored on the **execution axis** `D_exec = D − w5·M`, which this pipeline now prints
per level (`difficultyExec`, LV-007C item 2) instead of leaving as a subtraction — measured
**−1.47** at the same L5→L6 seam.

## 5. Model routing (roles abstract; the matrix is the single source of truth)

Routing is **not** maintained here. `AGENTS.md` §11 delegates it to **`docs/ai-model-matrix.md`**, whose §3 routing table is the authoritative, measured mapping (five candidate models, identical five-part live probe: text reasoning, TS coding, strict JSON, tool calling, vision):

| Role (abstract) | Measured assignment | Pipeline use |
|---|---|---|
| **REASONING_MODEL** | `kimi-k3` | design & architecture drafting, hard level analysis, playtest diagnosis |
| **CODING_MODEL** | `deepseek-v4.1-flash` | rule/solver/validator implementation, test code |
| **FAST_MODEL** | `qwen3.8-flash` | bulk level-candidate generation, doc drafts, repetitive analysis |
| **REVIEW_MODEL** | `qwen3.8-max` | cross-agent review, playtest analysis |
| **VISION_MODEL** | `qwen3.8-max` | delivered-asset validation, screenshot review (sole vision-capable model on this endpoint) |

A model name is **config, not architecture** — any role can be reassigned in the matrix / agent frontmatter without changing anything in this pipeline or the codebase. There is no separate "TBD" multimodal slot: vision capability was probed and decided on 2026-10-14.

**Invariant (unchanged by any routing decision):** level solvability is always judged by the **program Solver**, never by any model — including the VISION_MODEL. `AGENTS.md` §7 and ADR-0004 outrank any model opinion.

## 6. What "AI truly participated" must be provable as

The final submission must show the chain, not a claim:

- AI proposed mechanics (recorded in `iteration-log.md`).
- AI generated level candidates (raw JSON archived).
- Program Solver validated solvability (metrics archived).
- AI analyzed difficulty / diagnosed bottlenecks (analysis archived).
- Levels changed and were revalidated (before/after metrics archived).
- Players retested (playtest data archived).

## 7. Reproducibility

- Level generation is **seeded** and scripted. The committed, re-runnable scripts are `scripts/validate-levels.ts` (schema/rule gate + 10 negative self-tests), `scripts/solve-levels.ts` (BFS proof, `par`, metrics, policy, gates), `scripts/author-lv006-candidates.ts` (the L6–L10 doors+switch families, fixed `SEED`, no clock / network / filesystem writes, byte-identical output on every run — see §8.6) and `scripts/author-l11-candidates.ts` (since **LV-008**: the M2 portal-debut family, 54 candidates, same discipline — see §8.8). Every one of them is re-runnable and prints its rejects. A **bulk** multi-block generator does not exist yet; the rest of the L11–L20 portals block is where it will be needed, and until it is written this section must not cite a script that is not in the repository (`scripts/generate-levels` was cited here and in `docs/architecture.md` — the latter is the Architect's file, so correcting it there is an OPEN_QUESTION in the LV-007B handoff, not an edit made by this role).
- Every accepted level stores its generation metadata (model role, seed, prompt version, solver metrics).
- Rejected candidates are archived too — the failures are part of the evidence. The LV-006 generator prints its rejects and **fails** if any of its three negative probes is accepted.

## 8. The level-pipeline record — LV-006 (the L6–L10 unit) → LV-007B → LV-008 (2026-10-15)

§8.1–§8.2 are the **LV-006** run. §8.3 onward is the running protocol record: each later
task appends what it changed about *how levels are proved*, so the record cannot drift into
"the pipeline works" without the evidence for saying so.

The LV-006 block itself — the first level block in the game that carries **M1 (doors) + M3
(switches)**, and the first run of the full pipeline on content whose lesson is *not* a
special case of "walls": schema → rules → BFS → metrics → policy/lesson audit →
accept/reject.

### 8.1 The proposal side (recorded templates, not trusted)

`scripts/author-lv006-candidates.ts` commits the candidate **families** as data (seeded,
`SEED = 20261015`, no clock / network / writes):

| Family | Board | Proposal axes enumerated | Lesson the family is supposed to teach |
|---|---|---|---|
| L6 | 5×3 | switch tile ∈ {(1,1),(2,0),(0,0)} × door tile ∈ {(3,1),(2,1)} × colour ∈ {blue, red} | the latch on the natural path (block-opening dip) |
| L7 | 3×3 | switch tile ∈ {(0,0),(0,2),(1,0)} | the detour: I leave the line to change the world |
| L8 | 5×4 | switch tile ∈ {(2,0),(2,2),(1,0)}, funnel walls fixed | Aha #1: the door that refused the greedy line |
| L9 | 5×5 | s2 tile ∈ {(3,1),(3,3)} × door2 tile ∈ {(4,1),(4,3)} | two doors + two switches, ordered plan (s2 sits behind door1) |
| L10 | 6×4 | switch tile ∈ {(2,3),(1,3),(2,1)} × echo ∈ {(1,2), none} | mastery: permanent M0 geometry + the phantom walk + the latch |

Plus a seeded decoration axis (1–3 extra **permanent** walls per family, placed only on
tiles whose fixed entry phase equals the wall's solid phase, so a variant adds geometry
and no validator warning).

### 8.2 The proof side (the program, on every candidate)

`zod` → `validateLevel` → `explore`/`analyse` (BFS) → **`par` set from the solver, never
stated by the proposal** → `auditLevel` policy + lesson audit → accept/reject. A rejection
is printed with a machine-readable reason and dropped (ADR-0004: reject, never repair).

Result of the recorded run (re-runnable, byte-identical):

```
seed 20261015 · 43 candidates · 39 accepted, 4 rejected (reason: unsolvable)
per family: l006 15/15 · l007 5/6 · l008 5/6 · l009 5/7 · l010 9/9 accepted
rejection histogram: unsolvable: 4
shipped file re-derived by the program: l006 YES · l007 YES · l008 YES · l009 YES · l010 YES
negative probes: 3/3 rejected by name
summary: l006–l010 each re-derived from the recorded template families (seed 20261015); 5/5 shipped files MATCH an accepted candidate; 3/3 negative probes rejected by name; rejections are named, never repaired.
```

`shipped=MATCH` in the run means the shipped JSON **is** an accepted candidate of the
recorded family (canonical comparison, wall-list order normalised) — i.e. no level was
hand-edited after it was proven. Which candidates were rejected, and why, matters as much
as the accepts: L7 and L8 with the switch at `(1,0)` and two L9 seeded variants are
**unsolvable** (the switch is placed where it cannot open the door in time), and the
generator prints them rather than quietly narrowing the family.

### 8.3 Gate self-test (negative probes — the run must fail if these pass)

| Probes | Expected reason | Measured |
|---|---|---|
| inert switch (`activePhase` can never be current on its own tile) | `policy:switch-never-fires` | rejected by that name |
| L8 board without the goal funnel (the door still refuses, the switch still fires — but the goal is reachable without pressing it) | `policy:gate-no-solution-with-switches-off` **+** `policy:lesson-switch-required` (LV-007A: removing the funnel removes the only reason to press the switch, so the same board also breaks the `switchRequired` obligation — stated, not tolerated; gate (ii) is named too) | rejected by those names |
| door targeted by no switch (M1 alone) | `policy:door-without-switch` | rejected by that name |

A probe claims **every** code it must see (`expect: readonly string[]`) and the script prints the
full code list, so a probe can no longer hide a second finding behind a `(+N)` suffix. The probes
mirror `scripts/validate-levels.ts`'s negative self-tests: an accept-only
generator proves nothing about its own gate.

Since **LV-007A** this is no longer only the generator's business: `tests/solver/policy-negative-controls.test.ts`
carries **one negative control per entry of `POLICY_VIOLATION_CODES`** (`Record<PolicyViolationCode, …>`,
so a code without a control is a compile error) plus a source scan that fails when `policy.ts`
emits a `code:` literal the inventory does not declare. RV-004 **m-2** found the gap the hard way:
mutating `lesson-latch-dynamism` (`=== 0` → `false`) kept **176 tests green**. Today the same
mutation turns the suite RED, as does the inversion of any check (each mutation was run, not
assumed).

### 8.4 What was enforced where (and why not in the schema)

Two content laws are checked in the **analyzer/recording layer** (`@/core/solver/policy`),
consumed by both `scripts/solve-levels.ts` and `tests/solver/**`, because the frozen level
schema is a *shape* contract (`src/core/level/**` was not changed by LV-006):

1. **M1 never ships alone** — every door is targeted by a switch, and that switch toggles
   somewhere in the reachable graph (exact: measured over the whole graph, not argued from
   parity). Enforced on every level, not just L6–L10.
   **Its mirror is enforced here too** (LV-007B item 4, n-13): a `switches[]` entry with an
   empty `targets` list is rejected as **`switch-without-targets`**. Such a switch *does*
   fire (`applyMove` toggles `switchesOn` unconditionally), so no firing test can catch it;
   what is wrong is that no door reads it — M3 content that changes nothing. The frozen
   validator only **warns** about that shape (a shape contract, not a design policy), and a
   warning is not a gate, so the rejection lives in the policy layer with its own negative
   control. Whether the *warning* should be promoted to a data-layer error is an
   Architect/Game-Designer question: doing so would change `src/core/level/**`, which the
   solver role must not touch (OPEN_QUESTION in the LV-007B handoff).
2. **A documented lesson must be program-true** — the ladder's lesson table
   (`@/core/solver/policy` `DOCUMENTED_LESSONS`, L1–L11) is checked against the metrics:
   phantom walk FORCED (l005) / OFFERED (l004), latch dynamism on L6–L10, the documented
   `switchRequired` obligation (L7–L10, with L6's dip recorded on its row as `"exempt"` —
   §8.5), and the named Aha #1 gates of §3 on L8 — measured conditions (i)(ii)(iii) plus,
   since LV-007A, the §3 **construction** bullets as gates (v) `single-door-one-switch-funnel`
   and (vi) `aha-par-cap` (`par ≤ 8`). Since **LV-008** the table carries a second gate
   family, Aha #2 (`portal-aha-2`) on L11 (§8.8), whose `switchRequired` obligation is
   `"exempt"` on the same L6 pattern — the debut *demonstrates* M2, it does not demand it.
   The suite fails if a ladder level has no documented-lesson row, so the table cannot drift
   from the dataset.

### 8.5 Escalation — one named condition is unsatisfiable as written

The Aha #1 condition list asks for four gates. Three PASS with measured numbers; the
fourth, **`dualPhaseTiles ≥ 1`**, cannot be satisfied by *any* portal-free level
(ADR-0009 decision 1, the checkerboard invariant: a switch never relocates the player, so
the phase at a tile stays a function of the tile; the same fact is already pinned by
`tests/solver/dynamism-metrics.test.ts`). ADR-0009 schedules M2 (portals) at L11 and no
portal exists in `src/levels` before it. The gate is therefore **implemented and reported
as `UNSATISFIABLE` with the proof printed**, `dualPhaseTiles === 0` is pinned as the proven
value, and the CLI lists it under ESCALATIONS — never as a pass, never softened, and never
"fixed" by adding a portal the schedule forbids.

*(Resolved at **LV-008**: the L11 portal debut exists, so gate (iv) is satisfiable for the
first time and PASSes with `dualPhaseTiles = 21` measured on `l011.json` — §8.8. The escalation
channel is nevertheless unchanged, because no *pre-L11* board can satisfy it: `dual-phase-tiles`
remains the single legitimate producer and `l008` the single board that reports it.)*

**The corrected acceptance law, restated for the record (Orchestrator adjudication of this
escalation).** Because gate (iv) cannot be satisfied before L11, acceptance of an M1+M3 level
**pre-L11** is carried by the *measured latch* instead: `refusedThenEnteredTiles ≥ 1`
(ADR-0009 decision 4 — a tile that refuses entry in one reachable state and accepts it in
another, i.e. history, not parity, carries the decision). The fourth gate **activates from the
L11 portals block** and reports `UNSATISFIABLE` with its proof until then. LV-007A **m-5**
tightened the guard: the verdict now needs **both** facts — the board is portal-free **and**
the solver measured 0 — so a portal-bearing board that measures 0 is a loud **FAIL** (inert
M2 content), and a portal-free board that ever measures non-zero is a **PASS with an explicit
ANOMALY** escalation instead of a routine pass. A suite pin asserts that `dual-phase-tiles` is
the **only** gate allowed to reach `UNSATISFIABLE` (the CLI's escalation channel is generic,
so its single legitimate producer is pinned rather than trusted).

**The acceptance law keeps reading the metric it was proved on (ADR-architecture-0002, LV-007B
item 2; reader split completed at LV-007C).** `refusedThenEnteredTiles` is an **unordered
state-set** property: it counts a tile if any reachable state refuses entry on it and another
accepts it, in whatever order those states were discovered. A stronger, trace-ordered
companion exists — **`refusedBeforeEnteredTiles`**, computed by `@/core/solver/bfs` and
printed per level by `scripts/solve-levels.ts` — which requires the *same tile* to be
refused strictly before it is accepted **on one real path**.

**The two legs are deliberately not re-stitched (LV-007C).** GD-008 re-worded
`docs/level-design.md` §3 (iii) — the **Aha-beat** condition — to the ordered form, and
LV-007C landed the code half: **`policy.ts` gate (iii) now reads
`refusedBeforeEnteredTiles ≥ 1`**, with a divergent-board negative control per §8.3's
one-control-per-code rule (the trapped-refusal pocket: canonical `= 1`,
ordered `= 0`, so the old reader PASSed a beat no player can witness). Everything else in
this section still reads the **unordered** form:

- **this section's pre-L11 acceptance law** (`refusedThenEnteredTiles ≥ 1`) — unchanged,
  because that is the form ADR-0009 decision 4 was measured and proved on, because the
  unordered form must keep firing for latch boards whose beat is real but
  trace-unwitnessable (a trapped refusal still proves entry legality is
  history-dependent and must never read as "static"), and because **any change that makes
  this law read the ordered form would be a re-definition of the acceptance criterion,
  not a documentation fix** (ADR-architecture-0002 Appendix A3, unchanged);
- **`lesson-latch-dynamism`** (the documented-latch obligation, §8.4 law 2) — the
  board-level dynamism carrier, i.e. the same job as the paragraph above. A level row
  documented as `latch-dynamism` built from the trapped-refusal board is still accepted;
  the *same board* claiming Aha #1 (row `latch-aha-1`) is rejected by gate (iii). Both
  verdicts are pinned in `tests/solver/**`.

So the split reads: **spec (iii) = ordered, this section's generation/acceptance leg =
unordered — until the L11 block ruling.** The switch is verdict-identical on shipped
content: on the eleven levels both forms report identical tile lists (1 / 1 / 1 / 2 / 1 on
L6–L10, and `[5,0]` on both forms for L11 — §8.8), so no gate verdict moved (the CLI's per-level metric lines are byte-identical
across the switch; the l008 gate (iii) line changed only in its wording), while on 2000
seeded single-door-single-switch boards 46 diverge (44 of them because the door tile *is*
the switch tile). The companion's **promotion trigger** beyond gate (iii) is
ADR-architecture-0002's: it MUST land as the gate before the first **L11+ portal
candidate** is accepted (teleport edges make trapped refusals more likely), and SHOULD be
promoted wherever a candidate first diverges. *(Satisfied at **LV-007C**: the ordered form
*is* gate (iii) now — and the trigger was then tested at the first L11+ portal candidate,
LV-008, where it did **not** fire: `l011.json` reports the same tile list on both readers,
§8.8.)*

**`switchRequired` is an obligation on the documented lesson (LV-007A · OQ4 ruling).** The
`switchRequired = true` that L7–L10 carry (all four measure `true` on the shipped boards) is no
longer shipped data only: `@/core/solver/policy` checks it, and a level documented as a latch
whose switch is load-bearing is rejected by **`policy:lesson-switch-required`** when the goal is
still reachable with every switch OFF (the all-OFF subgraph and its reachability are printed
with the violation). The obligation is read from the **lesson row**
(`DOCUMENTED_LESSONS[].switchRequired`), never from the level id: **L6**'s documented dip
(`docs/level-design.md` §2 L6 + §6 — the un-switched world still solves in 6, the deliberate
price of teaching the latch on the natural path) is an explicit `"exempt"` row and is the only
level allowed to keep `switchRequired = false`. There is **no `id === 6` special case** anywhere
in the module — pinned by a source scan — so the exemption can never be re-read as "L6 is special
because it is L6"; re-labelling L6's board as L7 is rejected, and promoting a future candidate
that weakens the latch is a rejection, not a repair (ADR-0004).

### 8.6 Reproducing this record

```bash
node_modules/.bin/tsx scripts/author-lv006-candidates.ts   # families → accept/reject + probes
node_modules/.bin/tsx scripts/author-l11-candidates.ts     # M2 debut family → accept/reject + probes
node_modules/.bin/tsx scripts/solve-levels.ts              # 11/11 PASS, per-level metrics + gates
node_modules/.bin/tsx scripts/validate-levels.ts           # schema/rule gate + 10 negative cases
node_modules/.bin/vitest run                               # incl. tests/solver/latch-gates.test.ts
```

This is §8's (LV-006 era) reproducer; commands are kept because they must keep passing, and
the current end-to-end block is **§8.9** (it is the one that prints 11/11).

### 8.7 LV-007B — solver hardening + the measurement pass (2026-10-15)

Four changes to the proving machinery itself, each landing as its own commit (probe scripts
deleted, never committed; `tsc` + full suite + all three CLI gates re-run per item):

1. **n-11 · route enumeration got exact pruning and its own budget key.** `forEachParRoute`
   walks every shortest route (the phantom-walk / Aha-gate evidence). It now prunes a child
   whose remaining budget can never finish, using an exact memoized finishability lookahead
   over the shipped `isLegalMove` / `applyMove` (portal-safe; equivalence with exhaustive
   enumeration is machine-checked on all ten shipped levels and three synthetic boards — one
   M0, one latch, one portal). The real defect fixed here was the **budget key**: the walk
   read the *exploration* cap, so "raise the state limit" silently changed route enumeration
   and a long-par board could die on a budget nobody printed. The walk now has its own
   independent cap (`maxRouteVisits`, default `PAR_ROUTE_VISIT_CAP = 2_000_000`), prints
   `routeWalk=<dfs> + <lookahead> work units (budget=…) prunedChildren=…`, and **raises**
   `RouteEnumerationError` on overrun rather than truncating (a truncated route set would
   silently weaken every metric read from it). `maxStates` still caps the exploration only.
2. **The ordered companion metric** `refusedBeforeEnteredTiles` — see §8.5 for what it
   measures, why the **canonical** unordered form still carries the acceptance law, and its
   promotion trigger. (Superseded in part at **LV-007C**: the companion *is* gated now —
   by Aha gate (iii) alone, per GD-008's re-wording of `docs/level-design.md` §3 (iii).)
3. **The §2 difficulty model is measured** — `B` effective, `T`, `R` and `D`, with the two
   structural findings and the untouched weights recorded in §4 above and in
   `docs/level-difficulty.md` §2a / §5.2. Its **execution axis** `D_exec = D − w5·M` is
   printed per level since LV-007C item 2 (§2b there; the axis ADR-design-0001's dip law
   lives on), and `docs/level-difficulty.md` **§3's target curve was re-keyed to that law
   at LV-007C item 3** — the pre-ADR-0009 schedule (door at L21, portal at L36) and the
   pre-measurement absolute `D` bands are withdrawn by name, the block table now follows
   `docs/game-design.md` §8 with dips only at the two real seams (L6, L11), and the only
   numbers with legal force are L1–L10 (measured) and L11 (pre-registered). *(Superseded in
   part at **LV-008**: L11 is no longer pre-registered — it is authored and measured, §8.8;
   the legal-force set is now L1–L11 measured.)*
4. **n-13 · a policy code for M3 content no door reads** — `switch-without-targets`, its own
   negative control, and the validator-warning-vs-policy-rejection layering: §8.4 law 1.

### 8.8 LV-008 — the M2 (portal) debut, `l011.json` (2026-10-15)

The second mechanic seam, and the first level authored **against a pre-registered numeric law**
rather than against a design paragraph. Recorded here because it is the pipeline's first
complete pass on a *mechanic debut*, which is the case the whole "LLM proposes, the program
proves" split exists for.

**The pre-registration, and the order of events.** `docs/level-design.md` §6 (V0.6 /
ADR-design-0001) and `docs/level-difficulty.md` §3.3–§3.4 published the debut's acceptance
contract **before any candidate existed**: `D_exec(L11) < 13.64` (⇔ `D < 33.64`), `par ≤ 4`,
exactly **one** opposite-colour portal pair, no false routes, and a **below-OFFERED** teaching
grade. 13.64 is not a chosen constant — it is the *published 2-dp form* of the shipped
`l010.json` measurement (13.642857, re-derived in the suite from the board itself), so the bound
is strictly **harder** than "beat L10". The order matters and is kept in the record: the board
was filtered *to* the bound, never the bound read off the board.

**The proposal side (recorded families, not trusted).** `scripts/author-l11-candidates.ts`
(`SEED = 20261015`) enumerates the M2-debut template family — the L6 debut template's wall-free
7 × 3 skeleton × switch tile × door tile × door colour × pair × channel phase — plus a seeded
pair-placement axis drawn from the recorded lattice, **54 candidates**, printing every
rejection with its machine-readable reason. The recorded axes are hypotheses in the AGENTS.md
§1 sense: the *designer's* claim is "put the channel on the natural row so it is the core action
of par"; the *program* decides which of the 54 placements actually satisfies that.

**The proof side (the program, on every candidate).** Unchanged from §8.2, plus the debut's own
gate family: zod → `validateLevel` → `explore`/`analyse` → `par` **from the solver** → the whole
`portal-aha-2` suite in `@/core/solver/policy` → accept/reject. A candidate is accepted only if
it has zero policy violations *and* every par route teleports *and* the portal-free world still
solves *and* `par ≤ 4` *and* `D_exec < 13.64`.

**Result — 1/54 accepted, and it is the shipped file (`shipped=MATCH`), with 2/2 negative probes
rejected by name:**

| Family outcome | Count | What it means |
|---|---|---|
| accepted | **1** | `switch=1,1 door=5,0/blue p=2,1⇄4,0/B` — the shipped board (`par=4`, `Dexec=8.5732`) |
| rejected by `gate-shortest-solution-presses-switch-and-crosses-door` | 49 | the M1+M3 unit is not on the shortest route — the latch became decoration |
| rejected by `gate-portal-par-cap` | 4 | the channel placement made the proven shortest solution longer than 4 |

The 1/54 rate is the **finding**, not a failure of the sweep: the debut's constraint set is
genuinely tight (the channel must sit *exactly* on the only route, while the door must still be
*closed* in its entry phase, so the teleport is the only thing that can put the player beside an
open door). The board was found by filtering 54 recorded proposals, not hand-fitted.

**Negative probes (both must be rejected, and both are plausible authoring mistakes):**

1. **Same-colour pair** — `(6,2) ⇄ (0,2)`, both `x + y` even (8 and 2), so the pair preserves the
   parity link and is mechanically nothing (ADR-0009 decision 5). Rejected by the **level layer**
   as a hard **error** (not a warning), which is why this probe asserts on `validateLevel` and
   not on a policy code. A validator-warning-vs-policy-rejection case, the same layering §8.4
   law 1 records for `switch-without-targets`.
2. **Bypassable portal** — the same board with the goal moved to `(4,1)` and the channel
   re-declared in phase A, the phase the par route never stands in, so every shortest route
   walks the whole way and the level teaches a mechanic it does not use: rejected by
   `gate-portal-crossing-on-every-par-route` ("no false routes"). This is the one construction
   where the portal is decoration, which is exactly what the debut's construction floor forbids.
   The script prints **both** codes it trips — gate (ii) also fires, because the moved goal puts
   the M1+M3 unit off the route (the same coupling the N2 family of the control table records) —
   and the probe asserts on the portal code, the one the board was built to break.

**What the debut's gate suite got, and what it deliberately did not.** `portalAhaGates` reuses
the *same implementations* as Aha #1 for the two gates they share — `pressThenCrossGate` and
`refusedBeforeEnteredGate` were **extracted**, not copied (a second implementation would be a
second truth source for one condition), which is why L11's `press-then-cross-door` line is
byte-identical in shape to `l008`'s. Five new codes arrived with it
(`gate-portal-pair-single-opposite-colour`, `gate-portal-crossing-on-every-par-route`,
`gate-portal-par-cap`, `gate-portal-teaching-grade-below-offered`,
`gate-portal-seam-law-execution-axis`), each with a negative control in
`tests/solver/policy-negative-controls.test.ts` — the one-negative-control-per-code law of §8.3,
enforced at compile time. Deliberately **absent**: a `portalRequired` flag or a
"lesson-portal-required" code. The debut's design asks for the mechanic to be *demonstrated,
not demanded*, so such a check would be unreachable — and an unreachable check violates the
one-control-per-code law. The load-bearing question is instead answered by the **shared** gate
(ii) (the latch is on the only par route) and recorded on the lesson row as
`switchRequired: "exempt"` (the L6 pattern, generalized to a second seam).

**L11 also lands the ordered/unordered block ruling of §8.5.** Both readers report the same tile
list (`[5,0]`) on L11, so gate (iii)'s switch to `refusedBeforeEnteredTiles` (LV-007C) moves no
verdict on the shipped set — the debut is where the *promotion trigger* recorded at LV-007B was
to be tested, and it did not fire. `dualPhaseTiles = 21` (all 21 tiles enterable in both phases)
makes gate (iv) satisfiable **for the first time**, so the escalation channel §8.5 whitelists
remains exactly one gate on exactly one board (`l008`), unchanged.

**The honest gaps, stated rather than hidden:**

- The seam-law negative control is **not surgical**, and a search was run for one. `D_exec` is
  driven here by `L` and `B`; adding dead pockets to `l011` (which would raise `D_exec` without
  touching the construction gates) was measured to produce `deadStates = 0` and `T = 0`, i.e.
  **no `D_exec` movement at all**, because §4 legal geometry forbids the very states that would
  move it. The control shipped is therefore the *boundary* board — the shipped `l010` re-labelled
  `id: 11`, `D_exec = 13.642857 ≥ 13.64` — which fails the seam gate **and** the three
  construction gates. That coupling proves the budget is not a flattering rounding; it is
  documented in the control table rather than presented as isolation.
- The portal-pair control **is** surgical in its phase clause (`l011` + a second pair in the
  *other* phase fails only the pair gate) but its count clause is not always: one variant
  (`(0,0) ⇄ (5,2)`, phase A) makes the added pair enterable on two further par routes, so
  `parRoutes` rises 1 → 3 and gate (ii) fails with it. The surgical variant was chosen for the
  table and the coupled one is recorded in the test file's comment — same class, one more
  complaint.
- On the **total** axis the M2 debut is *not* a dip: `D` falls 0.0697 (28.6429 → 28.5732) while
  `M` rises +1 (+5 on `D`). This is the same structural finding §8.7 item 3 records for L5→L6,
  now confirmed at the last `ΔM > 0` seam in the schedule: the sawtooth is real on `D_exec`
  (`13.6429 → 8.5732`, **−5.07**) and invisible on `D`. No weight was tuned to change that.

### 8.9 Reproducing *this* record

```bash
node_modules/.bin/tsx scripts/author-l11-candidates.ts     # M2 family → accept/reject + probes
node_modules/.bin/tsx scripts/solve-levels.ts              # 11/11 PASS (l011: 8 gates, all PASS)
node_modules/.bin/tsx scripts/validate-levels.ts           # 11/11 level files ok
node_modules/.bin/vitest run                               # incl. tests/solver/l11-portal-gates.test.ts
```

The ten pre-existing solver-dump lines are byte-identical to the pre-LV-008 run; L11 is appended
as line 11 and the only other diff is the aggregate count lines. ADR-0004 in force throughout:
reject, never repair. (LV-009-B's record is **§8.10**: the invariant it re-asserts is that the
pre-LV-008 dump lines are *still* byte-identical, with L12–L15 appended in order.)

### 8.10 LV-009-B — the L12–L15 block enters the dataset (2026-10-16)

**The law came first, and the law is written down elsewhere.** `docs/decisions/design-0003-l1215-block-law.md`
carries the block's constants, its four per-board verdicts and its §8 acceptance law. This
record is the *pipeline* half: what the program did with that law, in what order, and what
it measured — because the only claim that ships a level is a program claim.

**1. Attestation before the data (STEP 0).** The first commit of the task
(`e8a456d`, `scripts/attest-lv009-block.ts` + its committed transcript) re-derived **every**
ADR-design-0003 constant from the four candidate files *as an isolated dataset* — a byte-copy
of the LV-009-A dossier's `candidates/` tree whose four files were proved `sha256 IDENTICAL`
to the recorded blobs first. It printed `par`, `D_exec`, `T`, `R`, dead states, coverage, the
all-OFF advantage (a *restricted* all-OFF BFS, not a depth read from the full graph), the
portal-free verdict, `dualPhaseTiles` and the ordered/unordered refusal counts. Result:
**LAW-MATCH, exit 0, no `STOP_AND_ROUTE`** — 4/6/8/10 · 8.230769/10.898734/12.957895/14.969697 ·
`T ≡ R ≡ 0` · 0 dead states · coverage 100 % (21/21, 24/24, 28/28, 35/35) · portal-free
`7` (L12) and UNSATISFIABLE (L13–L15) · `allOffShortest − par = 2` on 4/4 · 19/16/20/15
dual-phase tiles · 3/5/5/6 refused-then-entered tiles with the ordered list equal on 4/4.
The ADR's dip ceiling was re-read from the live `l011.json` in the same run: **8.573171**.
Nothing was fitted to a target; a divergence would have been a named stop, not a repair.

**2. Then the law was encoded, then the bytes were copied.** `@/core/solver/policy` gained the
constants (`BLOCK_L1215_PAR_*`, `BLOCK_LATCH_MIN_PAR_ADVANTAGE`, `BLOCK_L1215_TAIL_EXEC_FLOOR`,
`BLOCK_L1215_DIP_CEILING`, `BLOCK_L1215_PORTAL_LOAD`, `BLOCK_L1215_IDS`), six `BlockGateId`
entries, six `gate-block-*` codes, four `DOCUMENTED_LESSONS` rows with the new
`block-l1215` obligation, `allOffShortestSolution()` and `blockL1215Gates()` — **before**
`src/levels/l012.json … l015.json` were copied in. The candidate JSON files were byte-copied
and never edited; no policy *number* of an earlier block was touched (the debut's
`PORTAL_DEBUT_EXEC_BUDGET` is deliberately **not** re-purposed — ADR §8 item 1).

**3. Every new code got a negative control, and the two couplings are stated.** The suite's
`Record<PolicyViolationCode, …>` makes a code without a control a compile error, and this
block's six controls are measured rather than assumed: the par-ramp control (authored `par` 6
on L12's board → **one** violation), the coverage control (one cell sealed in *both* phases →
20/21 → **one** violation, which is why the clause is not implied by solvability), the latch
control (the latch removed — couples with gate (ii), and the coupling is a **theorem**:
gate (ii) PASS ⇒ no all-OFF route is as short as par, so G1 can never fail alone; the
implication is asserted over every board in the suite), the portal-load control (`l013` with
one wall moved to the other phase: walk-only solves again while par stays 6 → **one**
violation), the dip control (L12's board one row taller: par still 4, coverage still 35/35,
`D_exec` 8.723881 > 8.573171 → **one** violation) and the tail control (`l014` wearing `id: 15`
— deliberately **not** surgical, because a one- and two-wall search over `l015` (48 slots,
1128 pairs) measured that no sealing pulls the last member's execution axis under 13.64).

**4. Acceptance, as the numbers the program printed** (this tree, this task):
`scripts/validate-levels.ts` → **15/15 level files ok · 0 errors · 28 warnings (0
multi-switch-door)** · `RESULT: PASS` (the warnings ledger is the 13 → 28 growth the ADR's §8
item 5 predicted, all explainable and none a gate); `scripts/solve-levels.ts --report` →
**15/15 PASS**, `par == shortestSolution` 15/15, 0 dead / 0 unrecoverable on the whole set,
1 ESCALATION (the standing `l008` `dual-phase-tiles`), sidecar regenerated
(`docs/level-difficulty.report.json`, 15 records); `tsc --noEmit` → 0; `vitest run` →
**30 files, 617 passed, 3 skipped**; `vite build` → ok.

**5. What did *not* happen.** No candidate was edited, no level was auto-repaired, no test was
weakened to make a board pass, and the solver's policy numbers were not moved. Two things are
**not** this role's to do and are handed over by name: the **registry unlock**
(`src/game/levels/level-registry.ts` still imports `l001`–`l011`, so `?level=12..15` does not
resolve — the playthrough rows and the L1→L15 unlock chain therefore stay RED) and the
**UA capture-entry round** ADR §8 item 6 requires (the doors × portals painter seam, the sealed
line reading as a wall column, the portal ends reading as a pair) before the block is
registered as playable. The dataset pin `tests/e2e/helpers/levels.ts:EXPECTED_LEVEL_COUNT`
moved 11 → 15 — the one cross-lane byte this task is authorized to touch — so the inventory
gate now checks the dataset against the dataset, and the remaining red rows name the
*registry*, not the data. Item 6 measures that sentence instead of asserting it, and finds the two
rows it does not cover.

**6. The one e2e round — every red row named, and the probe that isolates the cause.** Preflight
per the standing protocol (`pgrep -f "playwright test"` → zero foreign matches, port `5219` free,
no process rooted in this tree), then **one** managed run, `PS_E2E_PORT=5219 playwright test
--retries=0`: inventory **107 tests in 8 files** → **20 failed · 87 passed (6.0 m)**, no retry.

*The 20 rows, by cause.* **19 of 20 are the registry gap**, and the mechanism is the registry's own
documented contract — `startIndexForLevel`: *"Out of range / unknown / absent ⇒ index 0 (L1)"* — so
`?level=12` loads L1 before a single frame is judged: 4 × `playthrough` HUD labels (`L 12`…`L 15`
read `L 01`), L11's own row (its dialog says `原型结束 / Prototype over`, because the playable
ladder still ends at L11), the L1→L15 unlock chain (times out on the Next click that L11 refuses to
show) and the end-dialog row (`?level=15` never reaches an overlay), 5 × `latch-door`, 7 ×
`refusal` (the refusal fixtures are the block's own geometry; the UI is standing on L1's board). The
20th is **not** the registry: `tests/e2e/portal.spec.ts:82` pins the literal `[PORTAL_LEVEL_ID]`
against a dataset-derived list that is now `[11,12,13,14,15]` — stale *by design*, since
ADR-design-0003 makes portals mandatory on L13–L15 and a shortcut on L12.

*Then the probe that separates "the data is unplayable" from "the import list is short."* A
temporary, clearly-labelled, **uncommitted** edit appended `l012`–`l015` to `LEVEL_SOURCES` and
changed nothing else; it was reverted immediately after the run (`git status` clean, probe markers
`0`, file bytes restored to `HEAD`). The four UI-walk specs then measured **74 passed · 2 failed
(3.6 m)**: every playthrough row (L11 and L12–L15), the **L1 → L15 unlock chain**, the end-dialog
row and all seven refusal rows go green — the four boards are **winnable through the real UI**. The
two survivors under the probe are neither the registry nor this lane's pen:

- `tests/e2e/latch-door.spec.ts:102` (L12 only): expected `(5,1)`, received `(4,2)`.
  `scripts/latch-pair-audit.ts` measures the board's reachable set on two independent arms and finds
  **2** co-located discriminating pairs under the spec's own fixture bookkeeping and **12** under
  `isLegalMove` alone over L12's 78 reachable states; L6–L11 and L13–L15 all read HOLDS. L12's
  cheapest occupancy fixture (depth 3, pre-arrival `(4,2)A`, arriving `right`, door `d1`) *does*
  pair with a depth-4 refusal fixture — but the spec picks the cheapest refusal **independently**,
  and that is `(5,1)A down` at the same depth, a tie broken by node order. So the welded pair exists
  on the board and the red row is **fixture selection**: the spec's own docstring ("two reachable
  states on the same tile in the same phase whose only difference is whether the switch was
  pressed") is not what `cheapestDoorFixtures()` implements. Board exonerated by measurement, no
  data edit proposed.
- `tests/e2e/portal.spec.ts:82`: the dataset-derived pin above, QA's file, QA's pen.

Handover is therefore three named items, all outside this lane: the **registry unlock** and the
**UA capture-entry round** (Gameplay Engineer / UI-Art, ADR §8 item 6), and these **two e2e pins**
(QA — the portal list and the latch pair selection). Nothing red is left unexplained, and nothing
was patched or weakened here to make a row green.

**7. Reproduce this record.**

```bash
node_modules/.bin/tsx scripts/attest-lv009-block.ts            # STEP 0: LAW-MATCH on the candidates
node_modules/.bin/tsx scripts/solve-levels.ts                  # 15/15 PASS (L12–L15: 9/7 gates, all PASS)
node_modules/.bin/tsx scripts/solve-levels.ts --report         # + regenerate docs/level-difficulty.report.json
node_modules/.bin/tsx scripts/validate-levels.ts               # 15/15 level files ok · 0 errors
node_modules/.bin/vitest run                                   # incl. tests/solver/policy-negative-controls.test.ts §2d
node_modules/.bin/tsx scripts/latch-pair-audit.ts              # L6-L15: the co-located latch pairs (item 6's L12 finding)
PS_E2E_PORT=5219 node_modules/.bin/playwright test --retries=0  # 107 tests / 8 files — 20 red, all named in item 6
```

The ten pre-LV-008 dump lines are byte-identical; L11–L15 are appended in order and the only
other diffs are the aggregate count lines. ADR-0004 in force throughout: reject, never repair.

**Item 6, closed — the handover landed, in the order item 6 named it (2026-10-16).** Every pen item 6
pointed at has written, and nothing was re-attributed afterwards to make the census prettier.

- **The registry gap closed first.** R-003b landed as `3cd643e` (four imports + four
  `LEVEL_SOURCES` entries, matching the L11 precedent `f484e23`; no scene logic, `src/levels/**`
  untouched) and merged to develop in `96cd43c`. Its census on its own tree: **105 passed · 2 failed
  (6.2 m)**, no retries. The arithmetic stated plainly, because 20 → 2 does not mean 19: **exactly 18
  rows flipped green** (87 + 18 = 105, same 107-row inventory) — the 4 playthrough HUD rows that had
  read `L 01`, L11's own dialog, the L1→L15 unlock chain, the end-dialog row, the **4 UI latch-door
  rows for L12–L15**, and all 7 refusal rows. **The row that did not flip is
  `tests/e2e/latch-door.spec.ts:102`**, the L12 discriminating-pair row, and it is **browser-free**
  (it resolves both fixtures against the dataset file and calls `isLegalMove` directly — it never
  touches the page), so the registry could not have moved it either way: item 6's 19-row registry
  bucket carried one row with a second cause, the probe that fixed the registry is what had already
  pulled that row out, and the unlock census **confirms the probe** — red for its own reason
  (fixture selection), before and after. One count to retire with it: R-003b's prose lists "5x
  latch-door" among the rows that go green; 4 of the 5 flipped, the fifth is the survivor.
- **The 2 survivors are exactly the 2 rows item 6 foreclosed as not-this-lane**, both QA's pen:
  `tests/e2e/latch-door.spec.ts:102` (L12 fixture selection — `cheapestDoorFixtures()` picking each
  kind's cheapest independently) and `tests/e2e/portal.spec.ts:82` (the dataset-derived portal
  list). No third cause appeared and none of the 20 was left unexplained.
- **The two foreclosed pins moved under QA's pen.** QA-006 (`0f08c95`, merged `db9536d`) migrated
  **10 unit + 2 e2e rows derivation-first** and welded the latch refusal to the chosen occupancy
  fixture with a browser-free regression.
- **The chain to develop closed at `ff0a8f8`**, every link a two-parent merge, verified pairwise:
  LV-009-B `c34e0d1` ← R-003b `96cd43c` (← `3cd643e`) ← QA-006 `db9536d` (← `0f08c95`) ← UA-0011
  `ff0a8f8` (← `c05885d`).
- **FIRST FULL GREEN under the zero-retry law.** Local: **107/107** e2e in **6.8 m**, zero retry
  consumed, held under one foreign runner contention, on a round whose other gates read
  `tsc` 0 · levels 15/15 · `vitest` 632 passed / 3 skipped (QA-006's round). Cloud: **107/107 in
  16.0 m** on the develop tip `ff0a8f8`, run **38843718456**, zero retry. No retry, no pardon, no
  named-survivor list — because there are zero survivors.
- **ADR-design-0003 §8 item 6 — EXECUTED AND JUDGED: 5/5 clauses PASS.** UA-0011's capture-entry
  round is a measurement now, not a requirement: 33 PNG + 4 capture logs committed in-repo at
  `docs/evidence/entry4-block/` (provenance README + programmatically verified integrity table,
  tree `3cd643e`, `pageErrors: []` ×4, routes solver-enumerated with **no hand-typed move** and
  `tests/**` untouched), verdict recorded as **Entry 4** in `docs/ui-ux.md` **V0.9.2 §3.3b** — the
  door × portal seam, the sealed channel reading as a wall column, the teal pair reading as a pair
  in both phases, phone pitch classes **8/8 formula-exact**, zero page errors. R-003b made the block
  *playable*; this round's verdict, not the import list, is what makes that registration honest.
- **L12–L15 are LIVE.** Train 2 `5b058ff` merged the develop tip `ff0a8f8` into `main`
  (`3da1240` + `ff0a8f8`), and Pages published the 15-level ladder; the publisher round reads the
  deep link per level — `L 12` / `L 13` / `L 14` / `L 15` banners render, console **0 errors**,
  serving bundle `index-CCs6qr4w.js`. The ladder a visitor loads is the ladder the Solver proved.
- **main CI round: recorded by the Orchestrator in `docs/project-status.md` item 76** — deliberately
  **not** claimed here; it was still running when this closure was written, and a pending verdict
  written as a fact would be exactly the kind of claim this section exists to refuse.

**Falsification kept on the books (acceptance-criteria hygiene).** R-003b's dispatch acceptance
criterion **#2** — "the unit pins go green **derived**" — was **falsified by measurement**: the ten
red unit pins are **hand-typed** (`tests/unit/renderer-level-unlock.test.ts:69,86,125,137,150,195`,
`tests/unit/player-embedded-home.test.ts:89`, `tests/unit/hud-end-panel-copy.test.ts:118,145,164`,
reading `expected 11, received 15` / `'L1-L15 cleared'` vs `'L1-L11'`), so no registry change could
ever have greened them. The agent stopped at the `tests/**` boundary and routed them; QA-006
discharged them. The rule this buys: **predict derivation only where the file actually derives** —
an acceptance criterion that assumes a property the code does not have is a broken instrument, not
a work item.

### 8.11 Sibling records

The **player-facing** half of this record — which painter seam each new object needs, and what
the block must *read* as on screen before it may be registered — belongs to `docs/ui-ux.md`
(UI / Art Director) and is quoted, never restated, here. The design law is
`docs/decisions/design-0003-l1215-block-law.md`; the dataset's own per-level derivations are
`src/levels/README.md` §2d.

### 8.12 LV-010 — the L16+ ladder opens: an **unregistered candidate shelf**, and three proven rungs (2026-10-16)

> **R-003d update (2026-10-16):** the ladder this section opened now has **five** rungs — L20 was registered at R-003d; the tables below are left exactly as measured at LV-010/LV-010f (§8.15).

**The shelf.** Candidates for L16+ live in `src/levels/candidates/lNNN.json` — a subdirectory of
`src/levels/`, deliberately outside the dataset. Measured reason, not preference: three readers
own the shipped-set census and all three are non-recursive — `tests/solver/difficulty.test.ts`
derives `SHIPPED_IDS` from `readdirSync(src/levels)` and asserts `Object.keys(PINS).sort() ===
SHIPPED_IDS`; `tests/solver/metrics-sidecar.test.ts` asserts `REPORT.levels.length === 15` plus
file-list equality against a regenerated sidecar; `src/game/levels/level-registry.ts` uses
**explicit imports**, not `import.meta.glob`. A candidate in the root therefore breaks two suites
*and* auto-registers a level the game is not ready to show. Verified in both directions: with
three candidates on disk, `npm run levels` is still `15/15 ok · RESULT: PASS` and the sidecar is
byte-identical (nothing regenerated). **Registration, `EXPECTED_LEVEL_COUNT`, sidecar
regeneration and the L16–L25 block-law encoding are R-003c's work.**

**STEP 0 first, as in LV-009-B.** `a19a347` lands `scripts/attest-lv010-cut.ts` + its committed
transcript: on an isolated, sha256-identical byte-copy of the 15 shipped files, `LAW-MATCH` —
15/15 copies verified, cut floor `D_exec max = 14.969697` (L15), `B` band `[1.2500, 1.6875]`,
`T ≡ R ≡ 0` on 15/15, ordered == unordered refusal readers 4/4, mechanic vocabulary closed
(walls / doors / switches / latch / portals). No candidate byte was authored before it.

**The law, then the data.** The rung is derived: `par ≥ l15Par + 2·(id − 15)` (§6.1.1 P2's
non-seam step). The **gate is a lower bound and the exact rung is chosen in selection** — stated
deliberately: *a gate at equality would reject a legal board for being longer*.

**Two tools, one per direction.** `scripts/author-l16-candidates.ts` **proposes**
(`--stage=a|b|c|d|f|map|verify`, rung-parameterised by `--id`, and — since LV-010f — by grid
(`--w`/`--h`), seal arity (`--seal`) and enumeration window (`--drop`); stage D enumerates a
**full seal** — the doors are *every* neighbour of the goal, so the door count is the goal's own
geometry, 2 against a corner, 3 against one edge and 4 for an interior goal, and only the switch
n-tuples are chosen, sampled with a printed cap; the lattice carries a §6.1.4 clone guard over the
`(player|goal|portal-pair)` triple; stage **f** is the *family* census — what each
`(cx, arity)` family can carry, measured before any lattice runs, so a shape step is picked from
numbers and an exhausted family is *reported*). `scripts/prove-candidate.ts <file> --rung=NN`
**proves** — it re-reads the landed bytes, re-measures the CUT and `par(L15)` from the 15 shipped
files on *every* run, runs the nine-gate chain, and then a six-control **mutation battery**.

| rung | `par` | `D_exec` | `B` | region | all-OFF world | par routes press-then-cross | refusals | coverage |
|---|---|---|---|---|---|---|---|---|
| L16 `l016.json` | 12 | 17.100000 | 1.7000 | clean | **UNSATISFIABLE** | 20/20 | 8 | 42/42 |
| L17 `l017.json` | 14 | 19.027027 | 1.6757 | clean | **UNSATISFIABLE** | 60/60 | 8 | 42/42 |
| L18 `l018.json` | 16 | 20.907923 | 1.6360 | clean | **UNSATISFIABLE** | 189/189 | 9 | 42/42 |
| L19 `l019.json` | 18 | 22.885157 | 1.6284 | clean | **UNSATISFIABLE** | 231/231 | 10 | 42/42 |

"clean" = `deadStates 0` **and** `noUnrecoverableOk` **and** `T ≡ R ≡ 0`, and `D_exec = par + 3·B`
to 9 places (the identity that makes the escalation check mean what it says). Each rung clears
the previous rung's `D_exec` as well as the frozen `14.969697` cut. The device is the
**goal-gated latch**: because every approach to the goal is a door, the all-switches-OFF world is
**unsatisfiable** — existence, strictly stronger than the `advantage ≥ 1` reading. The ordered
plan shape is reused (`docs/level-design.md` §6.1.4: the reusable unit is the plan shape, never
the board); the escalation from L17 to L18 is a change of **shape** (door count 2 → 3), and from
L18 to L19 another one (**3 → 4**, the goal moved off the edge into the interior), not a longer
walk.

**The shape step is chosen from a census, not from a hunch (LV-010f).** Before the L19 lattice
ran, `--stage=f --w=7 --h=6 --id=19 --cxs=2,3,4 --seal=2-4` measured 14 310 bare boards across the
sealed-column families. Two numbers settled the design: the bare route on `7×6` reaches `par 14`
**and no further**, and only at seal arity 2 (corner goal) — arity 3 caps at 13, arity 4 at 12 —
so a par-18 rung cannot come from the bare route at all; and the arity-2 row is L16/L17's shape
already, so a par-18 board built there would be the same seal with a longer walk. The arity-3 → 4
step was then taken and its family enumerated **completely** (`--swcap=30000` over the whole
17 160-tuple space of its single clean geometry), measuring
`par census 12:10230 14:6450 16:446 18:34` — 18 is the family's ceiling and 26 boards clear every
gate at exactly the rung value. The generator prints a **rung pin** (`par === l15Par + 2·(id − 15)`
exactly, not merely `≥`): an accept longer than its rung is named and dropped, never shipped as
the rung.

**Expectations corrected to measurement, never tuned to pass (F-L16-3).** The first
negative-control table named the clause each mutation *should* trip; three of six measurements
disagreed, and the expectations were corrected **to the measured names** — `expect` is now a
*list* of clauses any of which may legitimately name the refusal, because a mutation aimed at a
late gate can be caught by a stronger earlier reader ("latch removed" is refused as
`unsolvable`, not `latch-grade`). Widening the list cannot make the battery vacuous: **a mutation
that is ACCEPTED still fails it**. 6/6 caught on each rung.

**A durable pin, because a terminal is not a regression gate.** `tests/solver/l16-l20-candidates.test.ts`
walks the directory itself, re-derives the cut (14.969697), `par(L15)` (10) and the `B` band
(`[1.25, 1.6875]`) from the *shipped* set on every run, and carries four negative controls (mis-stamped
`par`; latch removed — **still solvable**, which is exactly why the latch obligation may not be
replaced by a solvability check, the audit catches it by the name `door-without-switch`; sealed
goal; phase wall on a door tile). L18 was covered the moment it landed, with no test edit; L19
added three **block-level** obligations that pin the ladder rather than a board — `D_exec` rises
strictly rung to rung, each rung sits **exactly** on `l15Par + 2·(id − 15)`, and the `B`-band
excursion register (`l016`'s 1.7000, F-L16-2) stays the *only* named one. `vitest run` at L19 =
**32 files · 670 passed · 3 skipped** (the four candidate blocks are 8 assertions each).

**Named, not smoothed.** *F-L16-1 (inert second latch):* in `l016.json` the switch `s1` sits on
`(5,0)`, which **is** the goal tile, and `allOffShortestSolution = null` proves that tile is
unreachable while all switches are off — so `d1` can only ever be opened from an already-won
state. `s1`/`d1` fires (`every-switch-fires = true`) but can never change a route, the policy
audit reports `violations = 0`, and the `latch-route` reader needs only *some* switch to be
pressed-then-crossed, so the gate chain does not name it. Recorded for review and for R-003c, not
repaired silently inside a committed artifact. *F-L16-2:* `l016.json` measures `B = 1.7000`,
above the band top — §6.1.1's self-correcting guard says an out-of-band `B` must be **named and
the ramp re-checked on `D_exec`**, which it is (`17.100000 > 14.969697`), and `l017`/`l018` were
thereafter selected in-band (1.6757, 1.6360) so the excursion is not compounded. The excursion is
named, never widened.

**Reproduce:** `node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l019.json --rung=19`
(reset-set battery) · `node_modules/.bin/tsx scripts/solve-levels.ts src/levels/candidates --audit`
(`PASS` on all four, `parMatch=true`) · `node_modules/.bin/tsx scripts/attest-lv010-cut.ts`
(`LAW-MATCH` — the candidates cannot move the cut because they are not in the root).

### 8.13 R-003c — the L16–L19 registration: the shelf empties, the law lands, and the cut stops being climbable (2026-10-16)

> **R-003d update (2026-10-16):** the stop recorded here was correct **for that device** and is now beaten by a different one — the sealed landing; the block law grew to five rungs and the tail clause was re-registered (§8.15).

**What registration *is*.** The four shelf files were moved into the dataset root by `git mv`
— the §2d / LV-009-B precedent: **a byte-copy, never a re-authoring**. Identity is proven, not
asserted: for each id the root file's git blob hash equals
`git rev-parse 3cc6df2:src/levels/candidates/lNNN.json` — `4635a866…` (L16), `97ce1448…` (L17),
`486fedac…` (L18), `3feca910…` (L19). `scripts/attest-lv010-block.ts` runs that check on every
invocation and **fails** (never skips) if git cannot answer, because a control that did not run
is not a pass. The four `sha256` content hashes in the regenerated metrics sidecar are the
hashes of those same root bytes.

**Why the shelf existed, and why its emptying is the interesting part.** §8.12 recorded that
`src/levels/candidates/` sat *inside* `src/levels/` precisely so the three shipped-set census
readers — `tests/solver/difficulty.test.ts`'s `readdirSync`-derived `SHIPPED_IDS`,
`tests/solver/metrics-sidecar.test.ts`'s report length, and
`src/game/levels/level-registry.ts`'s explicit imports — would stay blind to a candidate. R-003c
is the bill for that design arriving: the dataset is now **19 root files**, and every one of
those three readers (plus five more derived pins) is RED by construction until the QA/Gameplay
lane moves its pen. That is recorded in §7 of `src/levels/README.md` with file:line — the
registration's *cost*, itemised rather than implied.

**The law is encoded before any number is quoted.** New in `@/core/solver/policy`:
`BLOCK_L1619_PAR_BASE` (10) · `_PAR_STEP` (2) · `_IDS` (16–19) · `_PAR_EXPECTATION`
(12/14/16/18) · `_CUT_FLOOR` (14.969697) · `_GRID` (7 × 6) · `_B_BAND` (1.2500–1.6875) ·
`_DEVICE_CEILING_PAR` (18) · `_TAIL_EXEC_CEILING` (22.885157) · `_NAMED_B_EXCURSIONS`
(`{16: F-L16-2}`), the six-id `BlockL1619GateId` union with `blockL1619Gates()`, four
`block-l1619` lesson rows, and six new `gate-block-l1619-*` codes in `POLICY_VIOLATION_CODES`.
The four lesson rows ship **`switchRequired: "required"`** — measured, not decreed: on 4/4 rungs
the all-OFF subgraph contains **no goal state** (`allOffGoalReachable = false`,
`allOffShortestSolution = null`), so this block's latch carries *existence*, strictly stronger
than L12–L15's 2-move advantage. **L16–L19 are the first latch block in the set that is not
`"exempt"`.**

**A registered block must not raise the filter it is judged by.** `scripts/prove-candidate.ts`'s
`measureCut()` now **excludes `BLOCK_L1619_IDS`** from the cut basis. Without that, registering
the rungs into the root would have let the block's own max `D_exec` (22.885157) become the
ceiling it is measured against, and all four rungs would have been **falsely REJECTed** — a
gate that silently moves to admit its members is not a gate. The cut stays the frozen
**L1–L15** value `14.969697`, re-derived from the live basis files on every run.

**The re-attestation (six tables, `RESULT: REGISTERED-MATCH`, exit 0).**
`scripts/attest-lv010-block.ts` + its committed transcript: (1) byte identity, (2) the law's
basis re-derived from the live L1–L15 files — `par(L15) = 10`, cut `14.969697`, band
`[1.2500, 1.6875]`, all MATCH against the constants the gates import, (3) **every booked number
re-measured from the root bytes** with the shipped readers, (4) the block's gates per rung (all
PASS, 7 each, 8 on the terminal rung), (5) the ladder properties no single board can carry
(exact rung `par`, strictly rising `D_exec`, the terminal = ceiling equality), and (6) **one
negative control per gate**, refused by name:

| rung | `par` | `D_exec` | `B` | par routes | refusals | coverage | all-OFF world |
|---|---|---|---|---|---|---|---|
| L16 `l016.json` | 12 | 17.100000 | 1.7000 | 20/20 | 8 tiles | 42/42 | **UNSATISFIABLE** (`null`) |
| L17 `l017.json` | 14 | 19.027027 | 1.6757 | 60/60 | 8 tiles | 42/42 | **UNSATISFIABLE** (`null`) |
| L18 `l018.json` | 16 | 20.907923 | 1.6360 | 189/189 | 9 tiles | 42/42 | **UNSATISFIABLE** (`null`) |
| L19 `l019.json` | 18 | 22.885157 | 1.6284 | 231/231 | 10 tiles | 42/42 | **UNSATISFIABLE** (`null`) |

| gate code | control (a mutation of a **registered** board) | coupling |
|---|---|---|
| `block-l1619-rung` | `l016`'s board with `par` re-stamped 12 → 14 | surgical |
| `block-l1619-grid-coverage` | `l016` with `(1,5)` sealed in **both** phases (41/42 visited) | surgical — the only gate that fires; board stays rule-legal |
| `block-l1619-device-existence` | `l016` with `d1`+`s1` dropped (all-OFF becomes solvable at 14) | named: `lesson-switch-required` + gate (ii) also fire |
| `block-l1619-escalation-cut` | shipped `l015` wearing id 16 (`D_exec` = the cut itself) | named: the rung gate fires too |
| `block-l1619-b-band` | `l016` relabelled as rung 17 (`B = 1.7000` out of band) | named: the rung gate fires too |
| `block-l1619-tail-ceiling` | shipped `l018` wearing id 19 (non-terminal member in the terminal slot) | named: the rung gate fires too |

6/6 **CAUGHT**. The controls live in this script rather than in
`tests/solver/policy-negative-controls.test.ts`'s `Record<PolicyViolationCode, …>` **because
`tests/**` is not this dispatch's lane** — so that Record is deliberately left RED (its 552-line
`tsc` error names the six missing keys) for QA's pin-migration ticket to take over. The in-lane
table is not a substitute for the test: it is the evidence, handed over with the code that
produced it.

**The parity claim, stated as the thing this ticket had to prove.** The dispatch's booked
numbers were `12/17.100000 · 14/19.027027 · 16/20.907923 · 18/22.885157`. The registered bytes
re-measure **identically** — every quoted value above comes from the program Solver reading the
root files, never from the candidate-era notes. Where a gate needed a *precision* ruling, it
was made explicit: the tail-ceiling gate compares at 6 dp against `22.885157` (bit-exact
comparison wrongly refused `l019`, whose `D_exec` is the same number to the published
precision); the law constant is published as `LAW_PRECISION`'s subject, not as a byte compare.

**Acceptance on this tree (all measured).** validator `19/19 ok · 0 errors · 52 warnings`
(11/11 negative probes); solver `19/19 PASS · RESULT: PASS` with the one standing escalation
(`l008`'s `dual-phase-tiles`); metrics sidecar regenerated to **19 records**; `tsc --noEmit`
clean on every production file; `vitest run` **33 files → 9 failed / 24 passed, 38 failed /
648 passed / 3 skipped** — **every red row is a count- or dataset-derived pin**, itemised with
file:line in `src/levels/README.md` §7. One of those rows taught the pipeline something and is
recorded as a measurement, not a mystery: `tests/solver/route-budget.test.ts`'s
exhaustive-vs-pruned equality compares an **unpruned** walk against the default
`PAR_ROUTE_VISIT_CAP = 2_000_000`, and the new rungs' unpruned demand is **l016 1,363,684 ·
l017 17,779,004 · l018 98,736,430 · l019 > 5 × 10⁸ work units** — i.e. above L16 the shipped
budget refuses the exhaustive leg by design (`RouteEnumerationError`, n-11's honesty rule),
while the **pruned** walk every shipped tool uses costs `115/570` … `2162/7386` units on the
same boards. That is the n-11 lookahead prune proving it is load-bearing rather than dead code.
No level byte is implicated; QA either raises that case's explicit `maxRouteVisits` or drops
the exhaustive leg above L16 — the numbers above are the handover.

**Cross-lane, named and not taken** (`src/game/**` and `tests/**` are outside this lane):
the **registry row** (`src/game/levels/level-registry.ts` — four `import l0NN` lines, four
`LEVEL_SOURCES` rows, the docstring range `L1–L15` → `L1–L19`; no new painter seam is implied,
the boards reuse objects the L12–L15 block already draws), the **count pin**
(`tests/e2e/helpers/levels.ts:76`, `EXPECTED_LEVEL_COUNT = 15` → `19`), and the eight derived
pin tables enumerated in `src/levels/README.md` §7. `src/levels/candidates/README.md` is created
so the now-empty shelf reads as *graduated*, not as a lost dataset — and so the
`l16-l20-candidates.test.ts` red (it walks that directory) is legible.

**The L20 gap, restated in the registration record because it is permanent.**
L16–L19 are the **goal-gated full seal** (every neighbour of the goal is a door, each door
targeted by one switch, all-OFF unsatisfiable), and that device's ceiling was censused
exhaustively: `par 18` / `D_exec 22.885157` on `7×6` at **every** seal arity — arity 2 → 16,
arity 3 → 18, arity 4 → 18 — with `7×7` reaching `par 22` only by re-running L19's **exact
seal shape** longer (a re-lengthened walk, refused as an escalation). So R-003c registered the
four rungs that **exist** and fabricated no fifth. `block-l1619-tail-ceiling` enforces the stop
as an equality: widening the terminal number instead of building a new mechanism is exactly what
that gate forbids. The two named constructions a par-20 rung needs — a **gauntlet** (every
approach to the goal's ring itself behind a door; walls cannot remove an approach, because a
far-region phase wall makes its tile unstandable and the 42/42 coverage gate then fails, so
every blocker must be an openable door) and a **sealed landing** (the portal lands in a pocket
whose exit is a door → the ordered two-press chain `docs/level-design.md` §5's "2-step
lookahead" still has not delivered) — are recorded for the next lane. Neither is built; no rung
claims them. **Superseded for one half by §8.14 (LV-011):** the **sealed landing** was adopted by
GD-007 (ADR-`design-0004`) and a par-20 board now exists as a proven **candidate** on the shelf; the
**gauntlet** is **REJECTED** there and remains unbuilt by ruling, not by omission. Nothing in this
section's numbers moves — L16–L19 are still the block, and its registered ceiling is still par 18 /
`D_exec` 22.885157.

### 8.14 LV-011 — L20 authored: the **sealed landing** is built, censused, and proven as a candidate (2026-10-16)

**What the rung needed, and what was built.** §8.13 closed with the L20 gap restated permanently: the
goal-gated full-seal device L16–L19 are built from measures a ceiling of `par 18` / `D_exec 22.885157`
on `7×6` at every arity, and two constructions were named for the next lane — a **gauntlet** and a
**sealed landing**. GD-007 published the mechanism ruling as **ADR-`design-0004`** (`docs/decisions/
design-0004-l20-mechanism-sealed-landing.md`): the **sealed landing is ADOPTED**, the **gauntlet is
REJECTED** (it needs ≥ 6 doors on a 7×6 arity-3 ring, and walls cannot remove an approach because a
far-region phase wall makes its tile unstandable — the 42/42 coverage gate then fails, so every blocker
must be an openable door). This pass implements the adopted device only: no gauntlet stage, no gate for
it, nothing to reject later.

**The device, as the program measures it on the landed bytes.** The portal lands the player inside a
**pocket** — a tile-set whose boundary is enterable in **one phase only**, so a **single door object**
can seal it — and the pocket is *walk-sealed*: the landing is reached only by the teleport, never on
foot. The far region is portal-only (the `x = CX` column is parity-dead from the left region and
enterable in exactly one far-frame phase — §8.13 / ADR-0009), so the shortest plan must execute the
ordered chain **land → press the pocket switch → cross the pocket door → press a seal switch**. On
`l020.json` that is: landing `5,1` behind `p1 (2,5) ⇄ (5,1)`/A, pocket `[5,1 6,0 6,1 6,2]`, boundary
`[4,1 5,0 5,2 6,3]` covered by **exactly one** door `d1`, pocket switch `s1 (6,0)`/A → `d1`, goal
`(5,4)` with its four neighbours all blue doors driven by `s2`–`s5`. The prover derives that pocket
**independently from the file** — never from the authoring script — and that independence is the entire
reason the two instrument corrections below were caught.

**The law is what judges, and it is the prover's own reading.** `scripts/prove-candidate.ts` keeps its
§8.12 role (re-measure the CUT from the shipped 15 on every run, `measureCut()` still excluding
`BLOCK_L1619_IDS`, so the block's own `22.885157` never becomes the ceiling it is judged against) and
gains the rung-≥20 chain: `par-stamped` · `region` · `escalation` · `par-step` · `latch-grade` ·
`latch-route` · `refused-beat` · `coverage` · `validator` · `well-formed` ·
`rung-plus-block-escalation` (`D_exec > 22.885157` **AND** `B ∈ [1.2500, 1.6875]` — a rung above the
block must clear the block, not only the L1–L15 cut) · `par-rung-exact` (exact, not a floor), plus the
five device gates **g1–g5** (`docs/level-design.md` §6.2.6, ADR-design-0004 decision 5): pocket
on-foot-unreachable and leak-free · boundary covered by exactly one door object with 0 free leaks and 0
phase walls · the ordered two-press chain on every shortest route · the all-OFF world unsatisfiable ·
**the census identity broken** (`par ≠ min_i(d(start→s_i) + 1 + d(s_i→goal))`, §8.12 V1.5 — that
identity holds only while every seal tile is directly adjacent to the free far region).

**The landed candidate, measured (not typed).**

| file | grid | `par` (solver) | `D_exec` | `B` | routes / press-then-cross | refusals | coverage | all-OFF world | gates |
|---|---|---|---|---|---|---|---|---|---|
| `src/levels/candidates/l020.json` | 7 × 6 | **20** | **24.729412** (> 22.885157 by 1.844255) | **1.5765** (in band) | 252/252 | 14 tiles | 42/42 | **UNSATISFIABLE** (`null`) | **15/15 ACCEPT** |

`RESULT: PASS` on the landed bytes; `rung-plus-block-escalation` quotes both required inequalities
machine-checked; the `B` band and the cut are re-derived from the live L1–L15 files on every run.

**The census behind it — accepts were found, not conjured.** `scripts/author-l20.ts` is a new tool
(not a stage of the L16–L19 one: that tool enumerates the goal-gated seal, where the pocket concept
does not exist) with stage **P** (pocket class census: every connected pocket tile-set up to
`--pocketsize`, measured for the single-phase seal and the leak test), stage **SL** (the lattice
`portal entry × pocket × pocket switch × goal × seal-switch tuple`, each tuple re-derived and judged),
stage **V** (re-read the written artifact and re-run the chain), the §6.1.4 **clone guard** on the
stricter seal-inclusive geometry key (`player|goal|portal-pair|seal-door-tiles`), and `probePar()` as
the **rung pin filter** (schema → rules → explore → par), so only a board measuring exactly `par 20`
reaches the gates.

| run | devices | tuples judged | accepts | rejection histogram | per-landing par ceilings |
|---|---|---|---|---|---|
| `--stage=sl` (pockets ≤ 5) | 238 | 269 484 | **640** | `par-not-rung: 268844` — the rung pin is the *only* filter that fires | 22 (`6,4` · `5,5`) · 21 (`5,0` · `6,1`) · 19 (`5,2` `6,3` `5,4` `6,5`) · 18 (`6,0` `5,1` `6,2` `5,3`) |
| `--stage=sl --pocketsize=8 --write` | 2 788 | 284 784 | **640** (the same set) | `par-not-rung: 284144` | same |

Both runs print `par-20 candidates refused by a gate: 0` — i.e. **every** tuple that reached the rung
was accepted by all gates; the refusals are all upstream of par. `D_exec` over the 640 accepts runs
**24.729412 … 24.790588** and `B` **1.5765 … 1.6485**, both inside their obligations, so the selection
is the *derived* one: **exactly the rung's par, then minimal `D_exec`, then enumeration order**. Two
honesty notes that belong in the record: (a) the par census histogram has a **hole at 20** on purpose —
par-20 boards are *judged*, not tabulated, so `19:1056 21:192 22:96` is the ceiling evidence while `20`
never appears; (b) **accept counts are enumeration-tuple counts, not distinct-board counts** — the same
pocket set can be reached by more than one insertion order in `pocketCandidates`, so "640" is a class
statement about the lattice, not "640 different levels".

**Two instrument corrections — both false refusals, both fixed to the shipped rule.** Pass 1 censused
the whole ≤5 class and returned `0 accept(s) of 269484`, with two of the five gates lying:

1. `landingArrival()` searched for a **walk-in** onto the landing. `applyMove` fires a portal when a
   move *enters* an end in the portal's `activePhase` and flips the phase **after** that move, so the
   arrival state is the teleport's **successor**. The reader reported `arrival=NOT FOUND`.
2. The **g1 escape flood** counted moves made *after* leaving the pocket, so a single return-to-start
   cycle inflated `escapes` by every later move. Only **edges out of the pocket** now count; the
   near-end return is named separately (stepping back onto the landing IS a portal end — ADR-0009 — so
   it is a cycle that re-enters the portal at a price, never a way into the far region).

Both are justified by the rule, not by the outcome: pass 1's refusal *detail* already named both facts
(`arrival=NOT FOUND`, `escapes=53, returns=1`) before the accept count moved at all, and the
disagreement between the search and the prover — two independent implementations of the same law — is
what made them visible. The corrected ≤5 census returns **640 accepts** and is committed verbatim in
`scripts/author-l20.transcript.md` §1–§3. **F-L20-1** records them as false refusals of the
*instrument*, with the search-side correction mirrored into the prover.

**One negative control per new gate — and one inherited control that MISSED.** The prover's battery is
now **11/11 caught by their named gate**, each of g1–g5 measured *before* its `expect` list was
written. The inherited control *"both switches retargeted to the first door"* **MISSED**: this board
carries **five** switches, and moving every switch onto `d1` leaves the far region unopenable, so the
first refusal is `unsolvable` — not `validator`/`latch-route`/`coverage`. Per **F-L16-3** the control
was renamed to its measured meaning (`every switch retargeted…`) and its `expect` list corrected **to
the measured names**; an `expect` that has not been measured is not evidence. **F-L20-4** records it.
The gates' own controls are surgical-in-intent and honest about coupling: `g1` (drop the pocket door)
and `g2` (drop one boundary tile) both fire as a *set* of gate names, printed in full beside the
verdict, so a control caught for the wrong reason is visible rather than hidden behind a boolean.

**How much of the device space is proven — the open boundary, named.** Stage P's ≤8 class is
**complete** (`16 431 095` pocket tile-sets tested · `13 163 780` single-phase boundary · **2 788**
leak-free) and its leak-free size histogram is `3:34 · 4:204 · 6:510 · 7:2040` — no size-5 and **no
size-8 member**, i.e. the largest leak-free pocket the lattice can build at `--pocketsize=8` is 7.
But `--stage=p --pocketsize=10` (started, **deliberately killed after 25 lines** — exponential in
`--pocketsize`, and unnecessary because an accept exists inside ≤8) measures **more** leak-free pockets
on the same landings: `5,1` goes 12 → **40** per near end, `6,0` 12 → 40, `5,0` 3 → 13. So the ≤8 class
is a **slice**, not the whole space. Recorded as **F-L20-3: class completeness OPEN at ≥ 9** — a named
boundary, never promoted to a completeness theorem, and never used to claim 20 is the device's ceiling.
The per-landing ceilings *are* measured where they are claimed: a filtered pass on landing `6,2` reaches
`par 18` and a 200 000-tuple `--cap` pass on `6,5` reaches `par 19`, while the full census's histogram
shows `21:192 22:96` from other landings — the rung is the *window*, not a wall.

**Acceptance on this tree (measured; report-only-up).** validator `npm run levels` → **19/19 ok ·
0 errors · 52 warnings · 11/11 negative probes**, exit 0 · solver `solve-levels.ts src/levels/candidates
--audit` → **1/1 PASS**, `solvable=true shortestSolution=20 parMatch=true`, `parRoutes 252`,
`switchRequired=true`, `deadStates 0`, `noUnrecoverableOk`, `D_exec = par + 3·B` · `tsc --noEmit` →
**production clean**, the one red row being `tests/solver/policy-negative-controls.test.ts(552,7)`
(the QA-011 pin, **pre-existing at `b597f64`**) · `vitest run` → the delta is **one suite switching from
"crashed with 0 tests executed" to "ran, 17 executed"**: baseline (candidate absent) **33 files ·
12 failed / 21 passed · 42 failed / 648 passed / 3 skipped (693) · 1 failed suite**; with the candidate
**33 files · 12 failed / 21 passed · 45 failed / 662 passed / 3 skipped (710) · 0 failed suites**. **No
test that passed at the baseline fails now** — all 42 baseline failures are still failures, and the
three new reds are inside `tests/solver/l16-l20-candidates.test.ts`, which was already RED.

The three reds, itemised because two of them are not about this candidate's shape and one is:
(i) *"re-derives the cut and the first rung from the shipped set"* — the fixture's `shipped` must be 15
and the registered dataset is **19** (GAME-001 / R-003c vs the fixture literal), base-red; (ii) *"rises
strictly along the block"* — the shelf holds exactly **one** candidate, so a ladder comparison cannot
run (shelf composition, not a board); (iii) *"refuses a board with its latch removed (a bare door is a
violation, not a puzzle)"* — **F-L20-2**: the control asserts the naked board (`switches: []`) is still
**solvable** so that the audit names `door-without-switch` rather than solvability. On a **sealed
landing** that premise is false **by construction** — `g4` measures the all-OFF world UNSATISFIABLE
(the pocket door's base colour is closed in the arrival phase), which is exactly what the adopted law
requires. The expectation encodes a property of the L16–L19 goal-gated seal that this device
deliberately breaks: the **same class of false refusal as F-L20-1, on the test side**. `tests/**` is
QA-011's lane, so it is **reported, not edited** — named with its mechanism and with the measured
`allOffShortestSolution = null`, for QA to re-measure. The nine `l020.json (rung 20)` obligations in
that suite all **PASS**, so the candidate is measured by the pinned suite **and** by
`scripts/prove-candidate.ts` independently.

**Cross-lane, named and not taken.** `src/levels/candidates/l020.json` is a **candidate on the shelf**:
registration into the dataset root, the registry row (`src/game/levels/level-registry.ts`), the count
pin (`tests/e2e/helpers/levels.ts:76 EXPECTED_LEVEL_COUNT`), the metrics sidecar regeneration, the eight
derived pin tables of `src/levels/README.md` §7, and any change to the registered
`block-l1619-tail-ceiling` are **R-003c / Orchestrator**, not this pass. In particular the registered
ceiling stays `par 18` / `D_exec 22.885157`: a proven candidate does **not** widen the registered stop,
and the gate that enforces the stop is untouched. `src/game/**`, `tests/**` and
`docs/level-design.md` were not edited; no shipped byte, gate constant or weight moved.

**Reproducing this record.** `npx tsx scripts/author-l20.ts --stage=p --pocketsize=8` (stage P),
`--stage=sl --pocketsize=8 --write` (stage SL + land), `npx tsx scripts/prove-candidate.ts
src/levels/candidates/l020.json --rung=20` (< 1 s), `npm run levels`, `npx tsx scripts/solve-levels.ts
src/levels/candidates --audit`. The committed transcript is `scripts/author-l20.transcript.md`
(complete stage-P ≤8 class, both stage-SL censuses with their summary tails, the two per-landing passes,
the full prover run with gates, controls and verdict, the pass-1 evidence of both instrument bugs, and
the ≤10 datum as the named open boundary). `--write` re-derives every byte it writes, so re-running the
census re-writes the same artifact; a re-run that disagrees with the transcript is a finding, not a
rebuild.

### 8.15 R-003d — the fifth rung: L20 registered, the block is five rungs, the tail ceiling re-registered on a certified root re-measure (2026-10-16)

**The one-line result.** `src/levels/candidates/l020.json` -> `git mv` -> `src/levels/l020.json`, a **byte-copy, never an edit**: git reports `rename ... (100%)` and the blob is `78acaed0921202eebf8bd3e8eba86d4e4d92be54` on both sides (candidate at the dispatch base `2ea83ac`, root in the index). The **root re-measure**, run BEFORE any law file was touched so the law could not influence it, reproduces the booked trio exactly: `par 20` (declared *and* solver-stamped), `D_exec 24.729412`, `B 1.5765`, with 252/252 par routes executing the ordered two-press chain, `refusedBeforeEnteredTiles 14`, coverage 42/42 and an **UNSATISFIABLE** all-OFF world. Equal to booked => proceed; any differing digit => STOP.

**The law delta (`src/core/solver/policy.ts`): five rungs.** `BLOCK_L1619_IDS = [16,17,18,19,20]`, so `BLOCK_L1619_PAR_EXPECTATION` is `12 / 14 / 16 / 18 / 20` by the same derived-rung rule (matched exactly — rung 5 needs no new clause), the L20 lesson row carries `switchRequired: "required"` (measured all-OFF no-goal, LV-011 g4), and the terminal clause was re-registered: **18 / 22.885157 -> `BLOCK_L1619_TAIL_PAR` 20 / `BLOCK_L1619_TAIL_EXEC_CEILING` 24.729412**, at the same 6-dp comparison (bit-exact would refuse the board the literal was read from — the R-003c finding). The old pair stays in the file as the **door-count seal's** measured census ceiling, because it is exactly the standard rung 5 had to beat (`24.729412 > 22.885157`).

**The gate that could have been self-serving, again.** `measureCut()` excludes the block's own ids; with four ids excluded and L20 registered, the basis became *L1–L15 + l020*, the cut became **24.729412**, and `prove-candidate` refused the level with `escalation - D_exec=24.729412 > CUT 24.729412`. That red is quoted as the **evidence** that the exclusion had to grow with the block; once grown the cut is **frozen L1–L15 at 14.969697** and no member judges itself.

**(The battery)** blob parity per `RUNG_ORIGINS` (L16–L19 `3cc6df2:src/levels/candidates`, L20 `2ea83ac:src/levels/candidates`; `--origin` still overrides all) · `npm run levels` **20/20 ok** · `solve-levels` **20/20 PASS** · sidecar **20 records** · `attest-lv010-block` **exit 0, REGISTERED-MATCH** (every booked number re-measured from the ROOT bytes) · `prove-candidate src/levels/l020.json --rung=20` -> **ACCEPT + 13/13 controls caught by name**, including the two rung-20 re-points (`-rung at 20`; **F-L20-2**, where the latch-removed control is measured as the **named `unsolvable`** refusal — the bare-board-solvable reading of the ladder's boards does not transfer to a sealed landing, QA-012's drift note) · `scripts/audit-block-l1620-controls.ts` -> **6/6 caught by name** (one per block gate; `-tail-ceiling` now fires on `l018` wearing rung 20).

**(P-1 / PL-3, one solver query)** `scripts/p1-l020-reland.ts`: **252/252** of L20's par routes enter an active portal end **twice** — the first entry on the landing end `5,1`, the second on foot back onto it while the pre-move phase is `A` (the `leave` beat). The re-landing is therefore a **LIVE row**, not a structural guard: PA-003's protocol must watch the named "wrong arrived phase" / "pocket reads as trap" pair on the beat every shortest route is forced through.

**(Cross-lane, named not taken)** `tests/**` is QA-014's (`l16-l20-candidates.test.ts`'s shelf rule flips to a booked-empty shelf, `EXPECTED_LEVEL_COUNT` 19->20, and the derived pin tables burn — the verbatim list is in `src/levels/README.md` §7b), and the registry row (`src/game/levels/level-registry.ts`) is GAME-002's.

### 8.16 LV-012 — Act II batch 1: five `G`-lattice rungs on the shelf, and the ≤10 pocket census (2026-10-17)

**The one-line result.** `docs/level-design.md` §7.2/§7.4/§7.7 (GD-009 / ADR-`design-0005`) turned into a
search: a new lattice family — **stage `G`, multi-pocket sealed landings with an ordered multi-press
chain** — was named, censused, and used to author **five rungs L21–L25** on the unregistered candidate
shelf (`src/levels/candidates/l021.json` … `l025.json`), each with a **program-stamped** `par` and a
**program-proved** gate chain. Root rows untouched; **L19/L20 not re-stamped** (§7.7 item 4).

**The law it implements, quoted not paraphrased** (`docs/level-design.md` §6.2.3, the sealed-landing
lattice): exactly one opposite-colour portal pair; the landing pocket **not on-foot reachable** in the
needed phase; **every** blocker an openable door (no phase-wall exit — the F-L19-2 doctrine that protects
P4 coverage); an ordered **≥ 2-press** plan whose second switch is reachable only after the first door
opens; `T ≡ R ≡ 0`; coverage **42/42**; and `switchRequired` read as a **measurement**, never an
assertion.

**Plan shape before skeleton (`§7.7` item 2).** The tool's header publishes the device *before* the
search runs: `P` (landing pocket, portal-only, exit = door `d1`, press = `s1 ∈ P`) → `F` (free far
region, entered only by crossing `d1`, press = `s2 ∈ F`) → `Q` (second walk-sealed pocket, `d2` its only
entrance *and* exit, press = `sg ∈ Q`) → `G` (goal, every in-region neighbour a `d3` tile). The forced
order `s1 → d1 → s2 → d2 → sg → d3` is a **property of the board**: `s2` lies outside `P`, `sg` inside
`Q`, `d3` is the goal's only entrance, and §1's one-switch-per-door rule closes every shortcut. The
prover then re-derives the device **from the landed bytes** and additionally *stages the worlds* to check
the chain is **forced**, not merely present.

**The frame is measured, not assumed.** `--stage=frame` checks the derived far-frame phase law against a
BFS of the bare board: **2754/2754 far-tile (phase, once-reached) readings agree, 0 mismatches.** This
matters because the batch runs at **`--cx=2`** (the sealed column moves), and at the tool's default
`--cx=3` — L20's frame — the `G` lattice yields **0** judged candidates. Every command in the record
carries the flag.

**(A negative census, published as a finding.)** `--pocketsize=5 --qmax=5 --cap=800` returns **0 accepts
of 0 judged** — and the cause is *upstream of the par filter*: **not one room survived sealability**
(`column-leak` 72 471 · `mixed-entry-phase` 24 004 over 476 devices). Measured consequence: in this frame
the walk-sealable room caps at **4 tiles**, so the `G` family carries only **2 device/seal skeletons per
`par`**. The five rungs therefore share skeletons (L21/L24/L25 one, L22/L23 the other) while differing in
portal endpoint, landing tile and switch placement — **five distinct §6.1.4 keys**, 0 collisions. That is
a **legibility risk reported to the designer**, not a guard violation: §7.7 item 4 forbids re-stamping
L20's shipped skeleton and forbids clone-key collisions; it does not demand five skeletons.

**(The accept class, with its refusals beside it — §7.7 item 5.)** `--pocketsize=4 --qmax=4 --cap=200`:
**2208 accepts of 9570 judged in 29.0 s** (set-identical to the earlier dump, so the pass reproduces from
its own record). Refusal histogram: **`unsolvable` 4004 · `g5-identity-broken` 1864 · `par-out-of-band`
1494**, with upstream `room2 sets not sealable` 47 608 and room rejections `column-leak` 31 603 /
`mixed-entry-phase` 28 743 — and **`in-band candidates refused by a gate: 1864`**, i.e. every in-band
candidate was refused by exactly the identity gate and none by a stray rule. Note the shape: the dominant
filter is *the puzzle not existing*, the second is *the device's own structural law* — `par-out-of-band`
is **not** the dominant filter. Measured `par` census over every judged candidate:
`9:24 10:8 11:128 12:38 13:276 14:56 15:450 16:112 24:260 25:24 26:96 28:22`.

**(The selection rule, published before it ran.)** Rungs strictly inside Act II's 16–24 band with `D_exec`
in `[19.75, 29.06]` and `B` in the measured band; `D_exec` **strictly rising** along the batch (§7.3: no
dip; plateau only at act-open, labelled `ΔM = 0`); then prefer the maximum number of `Δpar ≥ 2` steps
(§6.1.1 P2), then the largest minimal `D_exec`, then the smallest spread. **A fourth clause was added
before anything was written** — the §6.1.4 distinct-key rule read over the *stricter seal-inclusive* key —
and the first draft of the preference was **measured to violate it** (two rungs on one skeleton with
identical portals *and identical door tiles*), which is why it is a **filter, not a preference**. Dry run:
**21 par combinations tried · 0 dropped by the rising clause · 0 par dropped by the clone clause · pars
[17, 18, 20, 21, 23] · Δpar≥2 steps 2/4 · min `D_exec` 21.581395 · spread 6.023256 · 5 distinct keys, 0
colliding with the shipped 16**. The 2/4 step count is the *maximum achievable* in a 7-wide window
(`17 + 2·4 = 25 > 23`) and the two violated steps are reported beside the ladder, never smoothed over.

**The ladder as measured, per rung** (prover: `scripts/prove-candidate.ts --family=g
--ladder=21,22,23,24,25 --peak=24.729412`):

| rung | par | `D_exec` | `B` | coverage | press-then-cross | Δ vs Act I peak 24.729412 |
|---|---|---|---|---|---|---|
| L21 | 17 | 21.581395 | 1.5271 | 42/42 | 12/12 | −3.148017 |
| L22 | 18 | 22.584000 | 1.5280 | 42/42 | 16/16 | −2.145412 |
| L23 | 20 | 24.620000 | 1.5400 | 42/42 | 20/20 | −0.109412 |
| L24 | 21 | 25.604651 | 1.5349 | 42/42 | 90/90 | **+0.875239** |
| L25 | 23 | 27.604651 | 1.5349 | 42/42 | 72/72 | **+2.875239** |

**5/5 GATES ACCEPT**, **13/13 negative controls caught with each control's own gate named on every rung**,
all-OFF world **UNSATISFIABLE** per rung, coverage 42/42 ×5, `T ≡ R ≡ 0` ×5, `D_exec` strictly rising
**4/4** with no dip, and **`B` in band 5/5**. §7.3's `act-peak` obligation is **DISCHARGED by the batch's
measured maximum** (`L25` 27.604651 > Act I's measured 24.729412), with **1.455349** of headroom to the
Act II ceiling 29.06 — and the obligation rides **only on the peak rung** (§7.3), which is why the
interior members are allowed below it. A **falsification pass** (`--peak=28.5`) fails **exactly one rung
on exactly one gate** (`L25`, `act-peak`), so the clause is live rather than decorative.

**The proving side grew, and its expectations were measured first.** `scripts/prove-candidate.ts` gains
`--family=g|sl`, `--ladder=`, `--peak=`, `--measure-controls` (an **expectation pass** that asserts
nothing, per the F-L16-3 order: measure, then write the expectation) and a `measureRoom()` that
re-measures each sealed room's boundary against the **current** bytes, so a control that mutates a door is
still named by `g2`. The family-`g` gate set is `g0-portal-pair` · `g1-pocket-on-foot` · `g2-room-exit-door`
· `g6-room-structure` · `g3-ordered-chain` · `g4-switch-required` · `g5-identity-broken`, with the base
`par-step` replaced inside the act band by `act2-par-band` · `act2-exec-band` · `act2-b-band` · `act-peak`.
`g3` is the strongest of them: besides the per-route order census it **stages worlds** — dropping the
first *k* switches must leave the `(k+1)`-th switch tile **and** the goal unreachable — so the order is
**forced**, not merely present. Transcript: `scripts/prove-candidate-l2125.transcript.md`.

**(Acceptance / report-only.** `tsc --noEmit` clean on production · `npm run levels` **20/20 ok · 0 errors ·
58 warnings · 11/11 probes** (candidates are excluded from the root pass by construction) · `solve-levels
src/levels/candidates --audit` **5/5 PASS with `parMatch=true` 5/5** (17/18/20/21/23) · `vitest` at the
dispatch base with the shelf empty **33 files · 758 passed · 3 skipped**, and with the five candidates
**1 failed file / 1 failed test** — `tests/solver/l16-l20-candidates.test.ts:163`, QA-011's *booked-shelf*
pin `expect(shelf).toEqual([])`, **no previously-passing test failing**. That one red is the **tests
lane's** (QA / Orchestrator) and is reported, not edited — exactly as R-003c/QA-014 handled the pins its
own ticket owns.)

**(Cross-lane, named not taken)** the registry row (`src/game/levels/level-registry.ts`), the level-id
block law in `src/core/solver/policy.ts`, `EXPECTED_LEVEL_COUNT` and the metrics sidecar all stay with
their owners until registration: **a proven candidate does not widen a registered ceiling.**

**(F-L20-3 — CLOSED by measurement. The `--stage=p --pocketsize=10` census, landed as its own commit.)**
§7.7 item 1 asked for exactly this and forbade closing it by assumption — and §7.4 makes `P`/`SL`
"extended past F-L20-3's open ≥ 9-pocket boundary" Act II's **first** lattice family, so the boundary had
to be measured before anything could be built on it. *(Why it is a slice job)* the monolithic pass is
exponential in `--pocketsize` and LV-011 deliberately killed it after 25 lines because an accept already
existed at ≤ 8; LV-012 ran the same measurement as **18 disjoint `--only=x,y` landing slices** — identical
tool, identical `--stage=p --pocketsize=10`, the only difference being which landing each process walks.
Disjointness is what makes summation **exact**, and that was demonstrated rather than argued: the killed
pass's **25 data lines reproduce byte-for-byte** (`5,0` 1 338 255/13 per near × 8 · `6,0` 354 129/40 × 9 ·
`5,1` 8 262 157/40), and its three per-near readings are reproduced **exactly** on all three landings it
reached (`5,1` **40**, `6,0` **40**, `5,0` **13** — the aborted pass's own numbers, now confirmed rather
than projected). *(What it cost)* **724 203 655 pockets tested · 592 804 433 single-phase boundary ·
17 476 leak-free**, **18/18 landings measured**, **0 slices carrying an error or OOM string**, in
**45 min 37 s** of 8-way wall time = **264 573 candidates/s** aggregate; the ≤8 pass is **2.3 %** of this
volume (16 431 095 / 724 203 655 = **44×**). *(The verdict)* **the leak-free size histogram at ≤10 is
`3:34 · 4:204 · 6:510 · 7:2040 · 9:14688`.** Its first four rows are the committed ≤8 histogram **digit for
digit** (`34 + 204 + 510 + 2040 = 2 788`, the committed leak-free total), so the ≤10 pass reproduces its
predecessor's class as a **sub-histogram** instead of merely agreeing with it in aggregate — and it does so
**per landing**: the size-≤7 counts reproduce both ≤8 anchors on record (`5,0` = **24** = 8 × 3 and `6,0` =
**108** = 9 × 12, the committed per-near counts times their near ends). The fifth row is new: a **size-9
class of 14 688 members**, **7.2×** the largest ≤8 row, distributed over the twelve class-bearing landings
(`6,3` 3 584 · `6,2` 4 032 · `6,4` 2 520 · `6,1` 2 240 · `5,3` 630 · `5,2` 560 · `5,1` 252 · `6,0` 252 ·
`5,4` 224 · `6,5` 224 · `5,5` 90 · `5,0` 80). And **no size-8 and no size-10 member exists anywhere in
the 18-landing frame** — measured directly, `NF == 8` and `NF == 10` count **0** on every one of the 18
landings. So inside `≤ 10` the admitted sizes are exactly **`{3, 4, 6, 7, 9}`**, `{5, 8, 10}` are empty, and
LV-011's "the ≤8 class is a slice, not the whole space" is now **measured as such** (its three preview
readings all confirmed). *(Scope, stated so the closure is not misread as a ceiling)* completeness is
proven **for pocket size ≤ 10**, which is the frame's own enumeration limit; sizes **≥ 11 were not
enumerated** and stay unmeasured, and per §7.7 item 1 **no ceiling claim about the landing device is
published either way**. What the new members buy is a **wider pool** for Act II rungs — 2 363 leak-free on
the six x=5 landings, 15 113 on the six x=6 landings, **0** on the six x=4 landings — a pool statement, not
a difficulty claim: **no `par`, no `B` and no `D_exec` moves because of this census.** *(Two findings
recorded beside the verdict, neither promoted to law)* ① **the mirrored-column identity**: the `x=4` and
`x=6` slices enumerate to **identical `tested` counts on all six landing rows** (3 187 161 · 18 777 072 ·
45 252 927 · 40 224 824 · 21 124 206 · 2 833 032 — six exact matches to the last digit) while the parity
verdict between them is **total and opposite** — `x=4` returns **0** single-phase boundary and **0**
leak-free, `x=6` returns its **entire** tested count as single-phase and all 15 113 of its leak-free
members; the enumeration is mirror-symmetric in those two columns and the phase check is not, and **the
mechanism is not established by this census**, so it is named as an open lattice question for the
architect rather than asserted. ② the parities of the empty sizes (5, 8, 10) are measured over 724M
candidates; no structural argument for them is offered here. *(The instrument work that made it
affordable — this lane, `scripts/**`, both semantics-preserving and both proven)* `pocketCandidates` was an
**eager `Pocket[]` builder that materialized the entire class**; the ≤10 OOM was a **materialization bug,
not infeasibility**, and it is now a **lazy generator**, whose equivalence was proven by re-running
`--pocketsize=8` to the identical `16 431 095 / 13 163 780 / 2 788` and histogram `3:34 4:204 6:510 7:2040`
(exit 0); and `--only=x,y` (repeatable, stage P only) was added, with the no-`--only` shipped loop left
byte-unchanged. **Nothing that changes what is counted was touched** — the slice partition is a **cost**
optimisation whose exactness is demonstrated against the killed pass, and it was published *before* it ran,
together with the rule that an unmeasured landing is reported **`NOT MEASURED`, never as zero** (there were
none: 18/18). *(The lever for the next census, named not taken)* `pocketCandidates` walks **growth
sequences, not distinct tile sets** — the same pocket appears repeatedly under different build orders — so
the committed ≤8 numbers `16 431 095` / `2 788` are **sequence counts**; a distinct-set enumerator would
make a ≤11/≤12 pass affordable **and re-baseline them**, which is a ticket boundary, not a silent
optimisation. Transcript: `scripts/author-l20-p10.transcript.md`.

### 8.17 LV-013 — the census instrument is made honest: the `single-phase` column is retired to a tautology, the `x=4` zeros are reclassified law-not-measurement, and ARCH's two probes are run (2026-10-17)

Authority: **ADR `docs/decisions/architecture-0004-lattice-census-mirror-and-cost-law.md`** → normative
text **`docs/architecture.md` §15.6** (dispatched by item 117 as LV-013). Nothing here re-censuses: the
ruling is *instrument hygiene plus a corrigendum*, and the blast radius on results is **zero**.

* **The corrigendum (published in `scripts/author-l20-p10.transcript.md` §10, with ⚠ markers left in
  place at §1a / §4 / §5 / §6a(i), 46/2000 style — labelled, never silently replaced):** the published
  **`single-phase boundary` totals `592 804 433` (≤10) and `13 163 780` (≤8) were tautological
  accumulations, not measurements** — `sealedPocket` can never reject a connected pocket, so the column is
  **`≡ tested` by construction** (correct values: `724 203 655` / `16 431 095`), and its accumulation sat
  **inside** `if (hereSealed > 0)` (`author-l20.ts:925–932`), which silently dropped the six `x=4`
  landings' mass — the quoted deficits `131 399 222` / `3 267 315` are exactly the `x=4` `tested` sums.
  **The first-column `0`s are reclassified as a LAW** (Ruling 2: no `(CX+1, y)` landing is leak-free in any
  frame), **never as a measurement**. **Unchanged and standing:** `724 203 655` tested · `17 476` leak-free ·
  the histogram `3:34 4:204 6:510 7:2040 9:14688` · the `2 788` ≤8 sub-histogram · every per-landing anchor
  · every `par`/`B`/`D_exec`/band/gate/shipped row/registered ceiling (accepts never consulted the column).
* **PROBE A (gate removed, `--pocketsize=4`, one full orbit-pair set, 12 landings, exit 0):** `tested`
  mirrors **6/6** across `σ_x` (`261 · 568 · 747 · 664 · 639 · 232`, orbit total `3 111` per column) while
  the leak-free verdicts do **not** — the six `x=4` landings are **empty at all 51 per-near lines**, the
  `x=6` members carry **153** line-instances. `single-phase(4,y) == tested(4,y)` on all six, now printed
  side by side. `σ_x` equivariance holds for sizes and fails for accepts, **exactly as §15.3 proves**;
  orbit `K` read-out `29 · 71 · 83 · 83 · 71 · 29` with the `9↔8` parity factor visible on `σ_y`.
* **PROBE B (the ≤8 retro-test): `v = K(6,2)|≤8 = 117 587` is CONFIRMED by measurement** — `--only=4,2
  --only=6,2 --only=4,3 --only=6,3 --pocketsize=8` returns per-near **117 587** on **4/4** landings and
  `tested` `1 058 283 / 1 058 283 / 940 696 / 940 696` = `N × 117 587` on the nose (35.5 s, exit 0);
  `17 × (11 608 + 63 000 + 117 587) = 3 267 315` closes the committed ≤8 deficit exactly. **The prediction
  was not recoverable from the committed record, and the missing data is named** rather than reconstructed:
  every `x=4` ≤8 per-near line (suppressed at source by the gate, so absent from every committed artifact)
  and every class-`{2,3}` ≤8 per-near line (elided in `author-l20.transcript.md` §4; the ≤8 slice files were
  never committed — only the ≤10 slices were). **The ≤8 `x=4` rows had never been measured before; this
  probe is their first reading** and it reproduces the mirrored `tested` identity at ≤8 too.
* **The instrument fix (`scripts/author-l20.ts`, +52 −9, smallest honest diff):** accumulation moved
  **out** of the print gate; the per-`(landing, near)` line prints unconditionally as
  `N tested · N single-phase boundary (TAUTOLOGY ≡ tested · ADR architecture-0004 R3) · M leak-free`, with
  first-column landings labelled with the Ruling-2 law; the census line labels the column too; `sealedPocket`
  keeps a doc-comment stating the tautology (the function stays, so the historical screen remains readable).
  **Pre/post receipt** at `--pocketsize=4 --only=4,2 --only=6,2`: `tested` **1 494 → 1 494**, `leak-free`
  **36 → 36** with the **36-line listing byte-identical (`diff` = 0)**, the 9 shared pairs' `tested` and
  `leak-free` digits identical 9/9, and the only changed field being the tautological one (now honest);
  9 previously suppressed `x=4` lines appear, all `leak-free 0`.
* **Cost law carried into the tool as a comment, not as machinery** (ADR Ruling 4 / §15.5): **sizes** may be
  predicted per `D2` orbit with at most one walked landing, labelled `PREDICTED`; **results never inherit**
  except the first-column law (labelled a law); **no prediction is implemented** in `author-l20.ts`, which
  still walks every landing and prints only measured figures. **Two deferred rows, named:** (a) the
  one-flag orbit prediction (walk ≤ 1 landing per orbit, print `PREDICTED`, refuse to inherit a verdict);
  (b) deleting the tautological `sealedPocket` channel outright — both move **zero** numbers, so YAGNI
  defers them (`docs/architecture.md` §13).
* **Cross-lane fold-in:** `src/levels/candidates/README.md` is restated from its stale "shelf is empty /
  Current state: `l020.json`" wording to the **booked `l021`–`l025` set-equality** (QA-018's `:163`
  re-book), **with no ceiling wording in either direction** (item 114's law).
* **Battery at this tree:** `tsc --noEmit` **0** · `npm run levels` **20/20 ok · 0 errors** · `vitest`
  reported, not chased (QA-019 holds `tests/**`). **No root row, no `src/core/**` law file, no
  `src/game/**`, no `tests/**`, no schema, no `par`/`B`/`D_exec` and no registered ceiling moved.**

### 8.20 LV-015 — Act II batch 3: the 4-pocket chain, §7.8's par-24 obligation measured before it was built, and three instrument findings published before any tool was touched (2026-10-17)

**The one-line result.** Five candidates now sit on the shelf — `src/levels/candidates/l031.json` … `l035.json`, **unregistered** — at pars **19 / 22 / 22 / 24 / 24** with `D_exec` **23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426**, `B` **1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465**, coverage **42/42 ×5**, **T ≡ R ≡ 0 ×5**, `M` 4 ×5, all-OFF **UNSATISFIABLE ×5** (`switchRequired` measured), press-then-cross **30/30 · 6/6 · 30/30 · 12/12 · 160/160**, all five carrying the forced **5-press** chain `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5` on every shortest route. The device is `docs/level-design.md` §7.4's published axis `pocket count 1–4` taken to its **4-pocket** member — one room deeper than batch 2's 3-pocket device — on the **`CX = 1`** frame (7 × 6, far region 5 × 6 = 30 tiles). The batch's maximum `28.339426` is **strictly above** the registered Act II peak `27.604651` by **+0.734775**, which **discharges §7.8 item 1's act-close obligation** on the shelf. Proof: `scripts/prove-candidate-l3135.transcript.md` · authoring record: `scripts/author-l3135.transcript.md`.

**The rule was published before the run, and the census before the bytes.** Commit `3f460b6` carries the selection rule and the device **git-dated ahead of any census or any level byte**: the batch's own par set is **derived** (§7.8 item 4's anti-mirror clause — the in-band pars `ACT_II_B1_LADDER` does not use, `{16, 19, 22, 24}`), `CLOSE = max unused par supported by the census pool` repeated at the last two rungs, one published tie-break departure (the last rung takes the within-par **maximum** `D_exec` so §7.3.2's maximum lands on the batch's last rung), an **act-close REFUSAL instead of padding or substitution** if the measured max came in at or below `27.604651` (a named act limitation plus a C-path briefing, never a par swap), and the §7.3.1 relief label in published form **before `--write`** (§7.8 item 5). Commit `6f3b25b` is the census dossier — the par-24 obligation **measured**, the pool, the own par set, the relief label — and it lands **before** commit `b35cdc8`, which is the five level bytes. `--pocketsize ≥ 11` is **deferred** with its scope stated: `≤ 10` was closed by measurement (`scripts/author-l20-p10.transcript.md` §10), **`≥ 11` remains unmeasured**, and **no ceiling wording is published in either direction** (item 114's law).

**STEP 1 — §7.8 item 3's "`par 24` is in-band but unmeasured" is now measured in both fenced families, and the STOP branch does not fire.** *(a) The 3-pocket family (batch 2's own device)* at band `[24, 24]`: `devices walked 440/440 · 40-pair cap hit 0 · global budget 8000 not reached` → **130 accepts of 2640 judged over 264 distinct (`R2`,`R3`) pairs**, an **exact** count for that enumerated class, with `202` tuples sitting at `par 24` (130 accepts + 72 `g5-identity-broken`, i.e. exactly the `24:202` row batch 2 printed as out-of-band) and `D_exec ∈ [28.560241, 28.771084] ⊂ [27.7500, 29.0625]` — strictly above the registered peak by **≥ +0.955590**. §7.8 item 2's window is therefore **enterable**, measured, before anything was built. *(b) The 4-pocket family on batch 2's frame (`CX = 2`)*: **0 accepts of 0 judged** — empty **by arithmetic, not by a capped search** (`devices walked 440/440`, `0` group-cap hits, budget not reached; `16280 sealed R4 set(s)` upstream). *(c) The same device on the published `7 × 7` frame (`--h=7`)*: **0 accepts of 0 judged** as well (`598/598` devices walked, `111436 sealed R4 set(s)`). *(d) The first frame that is not closed, `CX = 1`* (far region 5 × 6 = 30 tiles): **69 accepts of 8000 judged over 477 (`R2`,`R3`,`R4`) groups**, `par 24` running `D_exec 28.058108 … 28.339426` — reported as a **floor**, because `62/260` devices were walked, the 40-group cap was hit on `7` device(s) and the global budget was **HIT**. *(e) The frame's room capacity, measured beside the emptiness rather than argued from it*: `--stage=roomcap --maxsize=4` reads maximum pairwise-disjoint sealed-room sets of **6 / 4 / 4 / 6** rooms across the four class-parity/arrival classes, and the 5-door device needs four sealed rooms *plus* the goal's own seal *plus* a free-banded `s2` tile — which is the frame, not the filter, closing `CX = 2`. **STEP 1b verdict:** the par-24 accept pool is **NON-EMPTY** in two independent families ⇒ **GO**, the STOP branch does not fire, and §7.8 item 3's published fallback `par 23` / `27.746988` (+0.142337) — the **§7.3.3 C path with its own ADR** — stays **unused, unselected and undecided**, which is the Game Designer's call to make and not this lane's.

**STEP 2 — the batch's own par set is executed as the published derivation, and the departure is printed.** The full act band `[16, 24]` censused on the batch's own frame (`--cx=1`, budget 20 000) returns **498 accepts of 20000 judged over 1152 groups** — again a **floor** (`114/260` devices, `10` group-cap hits, budget **HIT**), with the refusal ledger complete within the prefix (`g5-identity-broken: 720`, and **720** in-band gate refusals, i.e. every in-band refusal is the device's own identity law and none a stray rule). The published derivation then runs: in-band pars batch 1's registered ladder does not use ⇒ `[16, 19, 22, 24]`; supported by this census's pool ⇒ `[19, 22, 24]`; **`par 16` is ABSENT (empty pool) and is not substituted**; the two repeats (`22`, `24`) are the deterministic consequence of five rungs over three supported pars, printed with their reasons; the final multiset is **`[19, 22, 22, 24, 24]`** with **0 rungs sharing a par with batch 1's registered ladder** — and, incidentally, none with batch 2's `17/18/20/21/23` either. That is the anti-mirror clause's purpose: this batch has **no equal-par comparator on purpose**, which is what makes its numbers a *climb* statement rather than a *chain-length* statement (batch 2's was the opposite, and said so). The selector also prints every filter that bit: **2** lower-`D_exec` rows at `par 22` and **12** at `par 24` were refused by the rung-key-wide distinct clause (so L33 and L34 are not their par's minima), and L35's closing-rung departure takes the within-par **maximum** `28.339426` against that par's minimum `28.058108`. A filter is never silent, in either direction.

**The ladder, proved from the landed bytes.** `npx tsx scripts/prove-candidate.ts --family=g --ladder=31,32,33,34,35 --dir=src/levels/candidates` → **exit 0 · `LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65)`**. Every rung carries **20 gates, 20 `ok`, 0 `FAIL`**: `par-stamped` · `region` (`deadStates=0`, `T=0`, `R=0`) · `escalation` (above the frozen CUT `14.969697`) · `act2-par-band` · `act2-exec-band` · `act2-b-band` · `act-peak` · `latch-grade` (all-OFF world **UNSATISFIABLE**, `allOffShortest=null`) · `latch-route` (press-then-cross on **every** par route — 30/6/30/12/160) · `refused-beat` · `coverage` **42/42** · `validator` (`ok=true errors=0 policyViolations=0`) · `well-formed` (5 doors / 5 switches) · **g0** one opposite-parity portal pair · **g1** the landing room is portal-only (on-foot tiles 0, pre-press exits 0) · **g2** five walk-sealed rooms re-derived from the bytes (0 leaks, 0 phase-wall boundaries) · **g6** the landing room carries the switch for *its own* door and the goal's room is switch-free · **g3** one shared press order on every route, 5 distinct presses, staged-world forcing FALSE on all four drops · **g4** all-OFF unreachable · **g5** the census identity broken. The batch's readings: L31 `par 19` / `23.204167` / `B 1.4014` · L32 `22` / `26.050000` / `1.3500` · L33 `22` / `26.069191` / `1.3564` · L34 `24` / `28.126943` / `1.3756` · L35 `24` / `28.339426` / `1.4465`, `ΔD_exec` `+2.845833 / +0.019191 / +2.057752 / +0.212483` with `Δpar ≥ 2` on **2 of 4** steps (a measured consequence of a 3-wide supported par set, printed beside the ladder, never smoothed by re-selection), and the family's `B` centre (**1.3500 … 1.4465**) sits **lower** than the 2-/3-pocket families — the deeper chain lengthens `par`, not the branching term.

**The act-close clause is discharged on the shelf, by the batch's last rung.** `act-close` (§7.3.2 / §7.8 item 1) fires against the **registered** `27.604651`: the batch's measured maximum is L35 `28.339426` → **Δ +0.734775, strictly above, carried by the batch's LAST rung**, with the internal tail also rising (`28.126943 → 28.339426`, **+0.212483**). The value sits inside §7.8 item 2's derived window `[27.7500, 29.0625]` with **+0.589426** of margin over its floor, and `par 24`'s two rungs measure `B` `1.3756` / `1.4465` — **inside** the measured band. `act-peak` (§7.3) reads Δ **+3.610014** against Act I's measured `24.729412`, headroom **0.720574** to the Act II ceiling 29.06. **Nothing registered moves for any of this**: both are *shelf* measurements, and a shelf file does not widen a registered ceiling.

**The §7.3.1 relief label, published before `--write` and never described as a rhythm.** L31 (`23.204167`) sits below shelf-L30 (`27.566265`), so §7.8 item 5 fires and the seam's label was published **in the authoring transcript before the batch was authored** — decomposition included, so it cannot be read as a designed dip: **Δpar = 19 − 23 = −4**, **3·ΔB = 3·(1.4014 − 1.5221) = −0.362098**, **ΔD_exec = −4.362098**, band `[19.75, 29.06]`; labelled **`batch-seam`**, an **interior relaxation at a `ΔM = 0` boundary, on the execution axis only — never a dip and never a claim of lower felt difficulty**. §6's dip law does not fire (no mechanic is introduced). The label states what it does **not** do: it discharges no clause and satisfies none (`act-close` rides on the measured **maximum**, never on a relief); the felt half is a **labelled Playtest hypothesis** (§7.3.3, still `NOT TESTABLE (n = 0)`), because `D_exec` is blind to comprehension; and the drop is largely an **artifact of two published instruments** — the anti-mirror par derivation (which is why the opening rung sits at `par 19` rather than near L30's `par 23`) and the deeper device's lower `B` centre (which contributes the `−0.362098`). The batch's own tail rises, so this is the dossier's **single** drop. The equal-par pairs (L32/L33, L34/L35) rise (`+0.019191`, `+0.212483`) and are **instrument facts**, not relieves: no `ΔM = 0` drop exists inside the batch, so no interior label is owed.

**Falsifications — the checks were asked to fail, and did.** `--peak=28.5` (a peak no board carries) → **exit 1**, `LADDER RESULT: FAIL (4/5)`, failing **exactly one gate on exactly one rung**: `FAIL act-peak  D_exec=28.339426 vs Act I's measured peak 28.500000 (delta −0.160574)` on **L35 only** — the rung the ladder's measured maximum sits on. The clause is therefore falsifiable at the right rung and is *not* satisfied by its own neighbours. `--measure-controls` → **65 mutations measured (13 × 5)**, **35 lines carrying `gate … named: true`** (7 family-`g` controls × 5 rungs), **0 mutations ACCEPTED** — every mutation of every rung is refused by a gate that can be named.

**Three instrument findings, published BEFORE any tool change (commit `8e05f2d`, FINDING-FIRST).** The first proving run of the batch **failed**, and it failed for three reasons that are all about the **instrument**, none about a level: `3/5 ACCEPT`, `L34`/`L35` REJECTED on `act2-par-band`, L31 controls `12/13`. *(F-L31-1 — the false refusal)* `scripts/prove-candidate.ts:239` tested the band **strict at both ends** (`> [0] && < [1]`) while `policy.ts:1293`'s constant `[16, 24]` is **inclusive**, `policy.ts:1704–1705`'s `inParBand` is inclusive, `author-l21.ts` (this batch's own census and selection filter) is inclusive at four call sites, §7.2's table writes Act I's band `4–20` with `par 20` **registered** (L20), and §7.8 items 2–3 **mandate** a `par 24` rung and call it **in-band**. The arithmetic settles it because the derived `D_exec` ceiling is *defined by* par 24 being admissible: `24 + 3·1.6875 = 29.0625` = the published `ACT_II_EXEC_BAND[1] = 29.06`, whereas `23 + 3·1.6875 = 28.0625` is *not* the published band — under the strict form §7.8's own mandate would be unbuildable. The strict form is the outlier, and `git log -S` dates it to **`849b6d4` (LV-012, 14:36)**, ~7.5 h **before** GD-010 (`ef643f7`, 22:06) published the par-24 obligation; every Act II rung judged through it so far sits strictly inside (batch 1's `17/18/20/21/23` and batch 2's same pars), so the endpoint comparison had **never been exercised** when the law that depends on it was written. Batch 3 is the first rung set to stand on the ceiling — §7.8 item 2 is exactly what asked it to. *(F-L31-2 — a summary asserting an uncomputed fact)* the ladder-level phrase **"every control caught on every rung" was a string literal** (`prove-candidate.ts:1301`), printed even when a control MISSED on every rung; AGENTS.md §7 forbids a claim without evidence, and this was one layer below the tool that exists to prevent it. *(F-L31-3 — a shape-dependent control)* the `g3` goal-seal-drop control **MISSED on L31 only**. Measured first: the mutated board is **REFUSED on 5/5 rungs**, naming `par-stamped` + `validator` + `g2-room-exit-door` + `g6-room-structure` on 5/5 — the mutation keeps its teeth; what is shape-dependent is the *specific name* it asks for. On `l031` the four remaining presses are still **forced and strictly ordered**, so `g3-ordered-chain`'s clauses are **legitimately satisfied** — on this fully-forced 5-press sealed chain the order is implied by the room-seal topology, so a single-object mutation cannot break the order without first destroying reachability. `g3` is nevertheless named on **5/5** rungs (on L31 by three other controls), so §7.5 item 4's per-gate coverage is not reduced.

**The corrigenda were A/B'd, not argued — the blast-radius receipt.** Commit `f1b6fb6` lands the three smallest honest diffs: the comparison becomes the law's inclusive form with a label that stops claiming "strictly inside" (no constant, endpoint, threshold or gate list moves); the ladder literal becomes a **computed tally**; and the control is **renamed to its measured meaning** with `mustFire` `g3-ordered-chain` → **`g6-room-structure`** (measured 5/5 on this device), per **F-L16-3 / F-L20-4**'s house rule that a control whose expectation disagrees with the measurement is corrected *to the measured names* and still has to be refused **and still has to name a specific gate**. The pre-fix prover was extracted from `HEAD` before the edit (a temp file, never committed) and both versions ran the same ladders: **root L21–L25 → 5/5 ACCEPT, 13/13 controls each, 65 CAUGHT / 0 MISSED, PASS — identically before and after**; **shelf L26–L30 → the same, 65/0 both sides**. The status-surface diff is **one line per set** — the F-L31-2 literal replaced by the computed `controls named: 65/65 across the 5 rung(s)` — and nothing else moved. The honest residue is named: where a *mutated* board's own stamped `par` lands exactly on a band endpoint (`16` or `24`), the name `act2-par-band` leaves that mutation's refusal list, while the mutation stays **CAUGHT** by its other named gates; **no control changed `CAUGHT`/`MISSED` status on either ladder**. The fix's own `--measure-controls` receipt then caught the **second half of F-L31-2 in the fix for F-L31-2**: in the expectation pass nothing is asserted, so a `caught` counter reads `0` and the new line printed a fresh uncomputed claim (`controls named: 0/65 …`), corrected the same way (the measure pass now prints `controls MEASURED, not asserted (F-L16-3 expectation pass): 65 across the 5 rung(s)`). `tsc --noEmit` is clean post-fix. The commit sequence is checkable in `git log -p` and none of it can be back-dated: `3f460b6` rule → `6f3b25b` census + label → `b35cdc8` bytes → `8e05f2d` findings → `f1b6fb6` corrigenda → `c2b65ae` re-run.

**Acceptance at this tree.** `npx tsc --noEmit` **clean** (exit 0) · `npx tsx scripts/solve-levels.ts --audit src/levels/candidates` → **`10/10 level file(s) PASS · par verified from the solver on 10/10`** (`l026`–`l035`; refusals are reported, never repaired) · `npm run levels` (root) **`25/25 level files ok · 0 errors · 88 warnings · 11/11 negative cases`** — **UNCHANGED**, the five shelf files are **invisible to every shipped-set census** (the shelf is walked non-recursively), so the dataset count stays **25** · `docs/level-difficulty.report.json` **25 records**, untouched (`git diff` empty vs the branch's base `ef643f7`) · root level files **`git diff` empty vs `ef643f7`** — no root byte, no `EXPECTED_LEVEL_COUNT`, no registry row and no `PINS` moved · **clone guard** (§6.1.4, the stricter seal-inclusive key): the census prints **26 distinct keys** held by the existing 25 root + 5 shelf files, and the ladder's five rungs are distinct from all of them and from each other — **0 collisions**, `0 refused by the clone guard` of the 498 accepts · `npx vitest run` **1 failed / 859 passed / 3 skipped (863) across 37 files**, the single red **booked by name** and owned by another lane: `tests/solver/l16-l20-candidates.test.ts:174:19` → `AssertionError: expected [ 'l026.json', 'l027.json', …(10) ] to deeply equal []` (booking literal at `:161`). That pin is a **live guard, not a count**: it catches an unregistered extra by name. **QA-025's re-book** (`9be894d`, merged to `develop` *after* this branch was cut from `ef643f7`) already extended it to `l026`–`l030`; this branch's copy still carries `[]`, and merging batch 3 needs the booking extended to **`l026`–`l035`**. It is named here, not "fixed", because `tests/**` is QA's lane.

**Cross-lane, named not taken.** `tests/**` (the shelf pin and its re-booking, above) is QA's; the registry row for `l031`–`l035` (`src/game/levels/level-registry.ts`) is GAME's and is **not** touched — an unregistered shelf file must not be playable; the **§7.6 stratum assignment before registry** (§7.8 item 6) is handed to QA with the batch. Two items are **escalated rather than decided**, each with its revert path. *(F-L31-1)* if Game Designer or Architect rules §7.2's band **open** at its ends, the one-line comparison is reverted and batch 3's `L34`/`L35` stay REJECTED — the act then closes only through §7.8 item 3's published `par 23` reach `27.746988` (**+0.142337**), the **§7.3.3 C path with its own ADR**; the batch's bytes do not change either way and nothing is registered. *(F-L31-3)* a `g3`-dedicated control that fires on *every* shape needs a device with a **redundant switch** — a chain that is not fully forced — which is a **design** question, handed over with the measurement rather than patched into a looser battery. **No root level, core-law file, weight, gate, band, `EXPECTED_LEVEL_COUNT` or registered ceiling moved.** Transcripts: `scripts/author-l3135.transcript.md`, `scripts/prove-candidate-l3135.transcript.md`.

### 8.19 LV-014 — Act II batch 2: the 3-pocket chained sub-lattice, five shelf candidates at batch 1's pars, and the census that had to be fixed before it could be run (2026-10-17)

**The one-line result.** Five candidates now sit on the shelf — `src/levels/candidates/l026.json` … `l030.json`, **unregistered** — at pars **17 / 18 / 20 / 21 / 23** with `D_exec` **21.560241 / 22.560241 / 24.548193 / 25.548193 / 27.566265**, `B` **1.5201 / 1.5201 / 1.5161 / 1.5161 / 1.5221**, coverage **42/42 ×5**, **T ≡ R ≡ 0 ×5**, `M` 4 ×5, all-OFF **UNSATISFIABLE ×5** (`switchRequired` measured), press-then-cross **60/60 · 24/24 · 12/12 · 72/72 · 12/12**, all five carrying the forced **4-press** chain `s1 → s2 → s3 → s4` on every shortest route. The device is §6.2.3's sealed landing **one pocket deeper**: `P` (landing, walk-sealed, exit `d1`) · `R2` (a second sealed room, exit `d2`) · `R3` (a third, exit `d3`) · the goal's own seal `d4`, with the presses ordered `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4` as a property of the board. Proof: `scripts/prove-candidate-l2630.transcript.md` · authoring record: `scripts/author-l2630.transcript.md`.

**What the batch had to publish before it could be judged: its selection rule.** Batch 1 *searched* a par set (clause 3 of `selectBatch`'s published rule: maximise `Δpar ≥ 2` steps, then the largest minimal `D_exec`). Batch 2 has something batch 1 did not — a **registered comparator** — so the search is replaced by a **par mirror**: rung *i*'s par is `ACT_II_B1_LADDER[i].par`, **read from the law constant** (never typed), and the only rule left inside the fixed par set is batch 1's own within-par tie-break (**minimal `D_exec`**, then enumeration order). The consequence is the batch's thesis, measured rather than claimed: at **equal par**, the extra door costs `ΔD_exec` **−0.021154 / −0.023759 / −0.071807 / −0.056458 / −0.038386** (and `ΔB` **−0.0070 / −0.0079 / −0.0239 / −0.0188 / −0.0128**) — the 4-press chain runs *within 0.072* of its 3-press comparator at the same par, on the same 7 × 6 frame, with the same `M`. Two more published clauses ride with it: **no rising-`D_exec` obligation** (§7.3 interior freedom; the mirrored pars and disjoint per-par windows make the selected ladder rise anyway, printed as an observation), and **no promotion** — at par 23 the within-par minimum lands **below** the registered Act II peak (`27.560241 < 27.604651`), so a shelf file asks no registration train to move a registered maximum. The selection prints its own **skips**: the raw par-23 minimum (`27.560241`) was refused by the rung-key-**distinct** clause (a lower-`D_exec` row whose seal-inclusive key the batch already carried), and L30's `27.566265` is the par's minimum *among rows whose key is still free* — a filter that is named, counted and printed, never silent.

**The census was wrong first, and the counter is what said so.** The batch-2 device was enumerated at `--cx=2` (the header carries the frame-law measurement: `H = 7` pushes `par` out of band and `CX = 3` yields **0** judged candidates), and the first published *shape filter* was **impossible by the seal law**: it demanded "≥ 1 `d3` tile adjacent to an `R2` tile", but `R2`'s boundary is exactly `d2` (that is what walk-sealed means), so any tile adjacent to `R2` from outside is a `d2` tile and is excluded from `R3`'s pool before `R3` is drawn. The filter is now published **inverted** (no `R3` tile adjacent to an `R2` tile) with a **printed counter** — and it reads **0 of 2640**, i.e. **0 by the seal law, not by taste**: a non-zero reading would mean the seal law is broken, and the run says so. The same discipline caught the second rewrite: the **2-tile-minimum `R3` enumeration is empty at `CX = 2`** (0 sealed `R3` of 8712 candidates over 374 sealed `R2` sets), which is only explicable once `chainRoomCandidates` stops excluding **singletons** — a 1-tile walk-sealed room is legal, its boundary is always single-phase, and the shipped L20-style device already uses one *(the goal's own seal)*. With singletons admitted the class is non-empty, so the earlier "empty class" was an **instrument artifact, named as such**, not a property of the lattice.

**The singleton room is not a trap, and the reason is the rule, not a guess.** The accepted boards contain 1-tile rooms (`R2 = [4,3]`, `R3 = [6,1]` on L26), which invites the reading "the player is sealed in and dead". The shipped rule answers it in `applyMove`: **step 3 evaluates `switchAt(level, s.phase, player)` with the *entry* phase and the *post-move* position**, and **step 5 recomputes every door absolutely** from `(color, phase, switchesOn)`. So the press inside the room fires on the very move that enters it, and the recompute then leaves the seal open **in the flipped phase** — the room is a one-way-in, self-unlocking station. L26's shortest route shows it move by move (the transcript carries the full dump): the player crosses `R2`'s ring at `(3,3)` on move 9 judged at entry phase `A`, where `d2` is **open** because `s2` had inverted it two moves earlier; presses `s3` on move 10 by stepping `(3,3) → (4,3)` **with entry phase `B`** (that press's `activePhase`), whose toggle targets `d3` — the *next* room's seal; and leaves the ring again on move 11 (`(4,3) → (4,2)`, both `d2` tiles) judged at entry phase `A`, where `d2` is still open. Nothing re-judges the tile the player is standing on (ADR-0008 clause 3 — no crush, no retro-flip check), so the "trap" reading comes from reading the door's **base colour** instead of `doorIsOpen`'s per-ON-switch inversion. The *general* form of the question is answered by the Solver, not by prose: **`noUnrecoverableOk = true` and `unrecoverableStates = 0` on 5/5** (with `deadStates = 0`, `reachableStates = 498`), i.e. **every reachable state can still reach a goal**, so no board of this batch contains a stuck state at all. That is §4's theorem re-measured on the new device, and it is the honest place to look for a trap if a future lattice revision creates one.

**A completed census is a stronger object than a floor, and it says exactly what it bought.** With `--paircap=40 --budget=8000` the run reports `devices walked 440/440 · 40-pair cap hit on 0 device(s) · global budget 8000 not reached`: **396 accepts of 2640 judged over 264 distinct (`R2`,`R3`) pairs** — an **exact** count for the enumerated class (7 × 6, `--cx=2`, `--pocketsize=4`, `--qmax=4`, both shape filters), with a **complete** refusal ledger (`par-out-of-band` 1178 · `g5-identity-broken` 538 · `unsolvable` 528) and the upstream skip counters printed beside it (R2 sets not sealable 50116 *column-leak 28930 / mixed-entry-phase 21186* · 4862 sealed R2 · R3 sets not sealable 153208 *column-leak 114180 / mixed-entry-phase 39028* · 20174 sealed R3 · no goal candidate 4752 · `s2` on the goal's seal 2288). The par census over **every** judged tuple is published too (`13:8 14:24 15:40 16:52 … 44:1`), because the band is a **filter, not a truncation**. The accept pool by par: **17: 24 · 18: 28 · 19: 36 · 20: 38 · 21: 70 · 22: 94 · 23: 106**. What the counters still do **not** buy is a ceiling in either direction: the class is the enumerated one, and nothing outside it is claimed. The **measurement worth carrying forward** is that the class reaches `D_exec` **27.746988** at par 23 — **above** the registered Act II peak — reported here as data a deliberate peak promotion could be argued from, and deliberately **left unselected** because a shelf file moves no registered constant.

**The semantics-preservation check, re-run before the class was trusted.** Extending the authoring tool touches the gates the *accept* class is judged by, so the batch-1 path was re-measured after every edit: `--stage=g --batch=2 --pockets=2 --cx=2 --pocketsize=4 --qmax=4 --cap=200` returns **2208 accepts of 9570 judged** with an **identical** rejection histogram (`unsolvable` 4004 · `g5-identity-broken` 1864 · `par-out-of-band` 1494), identical upstream skips (`47608 / 132 / 0 / 132 / 0 / 0`), identical par census — **zero narrowing** of the class the batch-1 rungs were selected from. The one generalization that needed an *argument* is `g3-ordered-multi-press`: `minPresses ≥ 2` became `minPresses ≥ ctx.presses.length`, which is the same requirement for a 3-press device and the strict one for a 4-press device; it is measured on the accept class (`chain = n/n` on every accept, i.e. the whole chain on **every** shortest route) and cannot refuse a batch-1 accept, whose chain length is 3.

**Evidence, one command per claim** (`scripts/prove-candidate-l2630.transcript.md` carries the raw output). `npx tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates` → **exit 0**, `LADDER RESULT: PASS (5/5 ACCEPT)`, and with `--measure-controls` (**exit 0**, the F-L16-3 expectation pass, controls *measured before* their `expect` lists were written) **13/13 controls caught**, the seven family-`g` ones **by name** (`g0-portal-pair` · `g1-pocket-on-foot` · `g2-room-exit-door` · `g6-room-structure` · `g3-ordered-chain` · `g4-switch-required` · `g5-identity-broken`, each with a named refusal detail, e.g. *the landing device removed: the multi-pocket derivation collapses* → `g6-room-structure`). Falsification: `--peak=28.5` → **exit 1**, `LADDER RESULT: FAIL (4/5)`, failing **exactly the peak rung** (`FAIL act-peak D_exec=27.566265 vs Act I's measured peak 28.500000 (delta −0.933735)`) — the same instrument-defeating probe R-004a used. `act-peak` is **DISCHARGED** on the real constants (`27.566265 > 24.729412`, Δ **+2.836853**) with headroom **1.493735** to the Act II ceiling 29.06.

**Acceptance at this tree.** `tsc --noEmit` **clean** · `npm run levels` **25/25 level files ok · 0 errors · 88 warnings (0 multi-switch-door) · 11/11 negative cases**, `RESULT: PASS` — the five candidates are **invisible to every shipped-set census** (the shelf is walked non-recursively by `tests/solver/difficulty.test.ts`, `tests/solver/metrics-sidecar.test.ts` and `src/game/levels/level-registry.ts`), so the dataset count stays **25** and `docs/level-difficulty.report.json` is **not** regenerated (25 records, its length pinned) · `npx tsx scripts/solve-levels.ts --audit src/levels/candidates` **5/5 PASS** with `parMatch=true` ×5, `switchRequired=true` ×5, `noUnrecoverableOk=true` ×5, `deadStates=0` ×5, `distinctPositions=42` ×5, `RESULT: PASS` · prover as above · `npx vitest run` **1 failed / 859 passed / 3 skipped (863) across 37 files**, and the single red is **booked, by name**: `tests/solver/l16-l20-candidates.test.ts:174` (booking literal at `:161`) fails exactly as QA-018 designed it to — `expected [ 'l026.json', 'l027.json', …, 'l030.json' ] to deeply equal []`. That pin is a **live guard, not a count**: it catches an unregistered extra by name, and it goes green only when a registration ticket moves these bytes to the root **and** re-books the literal in the same commit. It is named here, not "fixed", because `tests/**` is QA's lane.

**Cross-lane, named not taken.** `tests/**` (the shelf pin above, and its re-booking) is QA's. The registry row for L26–L30 (`src/game/levels/level-registry.ts`) is GAME's and is **not** touched: an unregistered shelf file must not be playable. `docs/level-design.md` §7.4's `pocket count 1–4` axis now has its **3-pocket** member measured; whether the **4-pocket** member is enumerated at `--pockets=4` is a design call (Game Designer) — this pass reports only that nothing in the 3-pocket run closes it. **No root level, core-law file, weight, gate, band, `EXPECTED_LEVEL_COUNT` or registered ceiling moved.** The optional ≥ 11 `--pocketsize` probe was **deferred**, not claimed: its honest scope statement is that the ≤ 10 census is closed by measurement (`scripts/author-l20-p10.transcript.md` §10) and **≥ 11 remains unmeasured** — no ceiling wording in either direction.

### 8.18 R-004a — Act II batch 1 is registered: the shelf empties again, the act-tail law lands with anti-tautology guards, and the cut stays frozen (2026-10-17)

**The one-line result.** `src/levels/candidates/l021.json` … `l025.json` -> `git mv` -> `src/levels/l021.json` … `l025.json`, a **byte-copy, never an edit**: git reports `rename ... (100%)`, and both the git blob and the `sha256` are identical on the two sides — `18d05965c81afa972e74e07918c5cd3ba801742d` / `78df6c27…` · `e8fcabd5a0a6ef25eb7345281626a11292ceb5a9` / `de0b579b…` · `a2331baf00271991c8206619a521dcb7cefa54e9` / `f435f8f5…` · `cb23369c633a71131f385f3d0f28b7acec0485db` / `524aadbc…` · `6e4b10d10b6be889bd35e0bc04293a107fb9dd51` / `afd6bc0e…`. The **root re-measure ran BEFORE any law file was touched**, so the law could not have influenced it: `par` **17 / 18 / 20 / 21 / 23**, `D_exec` **21.58139534883721 / 22.584 / 24.62 / 25.6046511627907 / 27.6046511627907**, `B` **1.5271317829457365 / 1.528 / 1.54 / 1.5348837209302326 / 1.5348837209302326** (in band 5/5), `T ≡ R ≡ 0` ×5, `M` 4 ×5, coverage **42/42 ×5**, `refusedThenEnteredTiles` **17 ×5**, all-OFF **UNSATISFIABLE ×5** (all-OFF subgraph `16/258 · 15/250 · 15/250 · 16/258 · 15/250`), par-route press-then-cross **12/12 · 16/16 · 20/20 · 90/90 · 72/72** — digit-for-digit the LV-012 bookings (`scripts/prove-candidate-l2125.transcript.md`). Equal to booked => proceed; any differing digit => STOP.

**The law delta (`src/core/solver/policy.ts`).** The batch is an *obligation* of its own, not a graft: `LessonObligation` gains **`"act-2-batch-1"`**, five lesson rows carry it (`switchRequired: "required"`, measured — the all-OFF world has no goal state) and a new `Act2GateId` union adds six `gate-act2-*` codes to `POLICY_VIOLATION_CODES` (`act2-registered-rung` · `act2-exec-band` · `act2-b-band` · `act2-exec-identity` · `act2-coverage` · `act2-act-peak`), with the shared reader `shortest-solution-presses-switch-and-crosses-door` reused **as the same implementation**, not copied. The dataset-level pins are constants, not prose: `ACT_II_PAR_BAND [16, 24]` and `ACT_II_EXEC_BAND [19.75, 29.06]` (the derived band §7.2 publishes), `ACT_II_B1_IDS`, **`ACT_II_B1_LADDER`** (a *registered* row set, deliberately not a derived rung like `BLOCK_L1619_PAR_EXPECTATION` — the act's ladder is a measurement, not an arithmetic law), `ACT_I_REGISTERED_PEAK_LEVEL_ID/EXEC` (20 / 24.729412), `ACT_II_B1_PEAK_LEVEL_ID/REGISTERED_PEAK_EXEC` (25 / 27.604651), `ACT_II_B1_PEAK_ADVANTAGE` (2.875239), `ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC` (24.729412) and `ACT_II_B1_OPEN_RELIEF_LEVEL_ID/EXEC` (21 / 21.581395); `auditLevel` routes the act ids through `act2Batch1Gates()`. `LAW_PRECISION` was hoisted to module scope with the comparison bytes unchanged, so the act clauses and the block clauses compare at one precision.

**The clause that is easy to write as a tautology, and is not.** §7.3 requires the act's tail to rise across the act boundary, and the batch's own opening rung sits **below** Act I's peak (`21.581395 < 24.729412`). Both readings must be refused by the *same* clause, in the R-003d style: six `ActTailClause`s (`act-tail-act-i-peak-pin` · `act-tail-act-ii-peak-pin` · `act-tail-peak-advantage` · `act-tail-pre-r004a-standard` · `act-tail-l20-not-restamped` · `act-tail-l21-open-relief`) are read by `actScaleLawReading()` / `actScaleTailGuards()` against **named pre/post-registration constants**, and each has exactly one control refused **by name**. Direction 1 — a future edit that silently **relabels** Act I's basis or **restamps** the batch peak **FAILs** (`act-tail-act-i-peak-pin`, `act-tail-act-ii-peak-pin`, `act-tail-pre-r004a-standard`); the guards' reading fields are **injectable** precisely so the controls can probe relabel/restamp/graft. Direction 2 — a validator demanding a cross-act **monotone rise** would have **refused a registered rung**, so `act-tail-l21-open-relief` satisfies itself from the **named rung's registered value and the band, never from the direction**: an in-band *rise* on the opening rung **PASSes**, the registered relief carried on the **wrong rung** FAILs by name, an out-of-band value FAILs by name. `act-peak` is a **per-member gate on the peak rung only** — demanding the across-act clause of every member would demand 20 padded rungs. The dataset-level clauses have their own `ActTailClause` type and are deliberately **not** in `POLICY_VIOLATION_CODES`, so the source-scan/`Record` coupling in `tests/**` is not stretched by a clause that is not a per-level gate. The wording the code quotes is §7's own: *"An act may therefore open **below** the previous act's peak. That is a **plateau relaxation at a `ΔM = 0` boundary**, honestly labelled — it is **never** presented as a dip"* — and `M = 4` on every rung of both acts, which is what makes the boundary `ΔM = 0` rather than a second comprehension tax.

**The law that did not move, and the gate that could have been self-serving again.** `BLOCK_L1619_IDS` is still `[16 … 20]`; `block-l1619-tail-ceiling` still judges **L20 at par 20 / `D_exec` 24.729412`**; L20 was **not re-stamped**; and the five new rungs are **not** grafted onto the block (they prove under `act2-*`; `scripts/prove-candidate.ts`'s `measureCut()` excludes `ACT_II_B1_IDS` as well as the block ids, so the registered act cannot raise the filter it is judged by). The cut is **frozen L1–L15 at `14.969697`**, now re-derived on **25** files with basis ids `[1 … 15]`: `CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 25 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]`. The ladder invocation convention is the block's own — `--family=g --ladder=21,22,23,24,25 --dir=src/levels` — and the flag is **required**: without `--family=g` the identical ladder FAILs the block's `par-step`/`par-rung-exact` gates, because the act's `Δpar` window is 7 wide, not 2.

**The evidence run, one command per claim.** `scripts/attest-r004a-act2.ts` (new, transcript `scripts/attest-r004a-act2.transcript.md`, **exit 0 · `RESULT: REGISTERED-MATCH`**) re-derives everything from the **root** bytes in six sections: byte identity 5/5 · the registered ladder re-measured from the root (every row MATCH, incl. press-then-cross and gates/violations) · the six tail clauses PASS with the **monotone-rise hypothesis FALSIFIED** (relief −3.148017) · **6/6** tail controls CAUGHT by name · **7/7** member-gate controls caught with **0** act2 violations on the registered set (`21:[] 22:[] 23:[] 24:[] 25:[]`) · and the L16–L20 block **untouched** (L20 par 20 / 24.729412, ids `[16..20]` vs `BLOCK_L1619_IDS`). Its last section **executes** `scripts/prove-candidate.ts` in ladder mode (via `node node_modules/tsx/dist/cli.mjs`, so no npm-runner warning contaminates the transcript) rather than quoting it: **LADDER RESULT: PASS (5/5 ACCEPT, 13/13 controls caught on every rung)**, `act-peak` DISCHARGED, headroom **1.455349**. Two non-vacuity controls were added to the freezer check: the reader distinguishes a relabeled basis, and an empty shelf makes the ladder exit 1. `scripts/attest-lv010-block.ts` re-run on this tree is **exit 0** and its regenerated transcript differs from the committed R-003d bytes in **exactly two lines** — the worktree path and the census line `root 25 files = 15 basis + 5 rungs + 5 Act II batch-1 rungs` — which is the **L20-was-not-touched proof**, stated as a diff rather than as a claim.

**Acceptance at this tree.** `tsc --noEmit` clean on production (the only red is the `tests/**` `Record<PolicyViolationCode, …>` pin, §7c) · `npm run levels` **25/25 level files ok · 0 errors · 88 warnings (0 multi-switch-door) · 11/11 negative cases**, RESULT: PASS · `solve-levels --audit` **25/25 PASS** with `parMatch` 25/25, RESULT: PASS (the one standing escalation is still `l008`'s `dual-phase-tiles`) · `solve-levels --report` regenerated `docs/level-difficulty.report.json` to **25 records**, byte-stable on a second run, RESULT: PASS · `prove-candidate --family=g --ladder=… --dir=src/levels` exit 0 PASS · `vitest` reported, not chased: **10 failed files / 27 passed (37); 41 failed / 814 passed / 3 skipped (858)** — every red row a count-, dataset- or `PINS`-derived pin, none a production behaviour and none a board defect.

**Cross-lane, named not taken.** `tests/**` is R-004c's (the verbatim broken-pin dossier with `file:line` and the **measured** new expectation is `src/levels/README.md` **§7c**; the five §5.2 mirror rows written here are already green), and the registry row (`src/game/levels/level-registry.ts`, L1–L20 -> L1–L25) is GAME's. `src/levels/candidates/README.md` is restated to the **EMPTY** shelf (the booking becomes `[]`, with the graduation table and both `tests/**` rows named), with **no ceiling wording in either direction** (item 114's law). **No earlier row, weight, gate, band or shipped number moved.**

## 9. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Pipeline, validation gate, model routing, evidence requirements | Agent 4 / Orchestrator |
| 2026-10-14 | V0.2 | RV-001 **LOW-4** reconciliation: §5 rewritten — "vision-capable model, TBD" and the FAST=DeepSeek mapping were stale; routing now delegates to `docs/ai-model-matrix.md` §3 as single source of truth (REASONING `kimi-k3` · CODING `deepseek-v4.1-flash` · FAST `qwen3.8-flash` · REVIEW/VISION `qwen3.8-max`); Solver-decides-solvability invariant kept verbatim | Docs + GitHub (DG-002) |
| 2026-10-14 | V0.3 | **LV-005** — new **§3b Level Schema adjudications**: `doors[]` ∩ (`phaseAWalls` \| `phaseBWalls`) = **illegal, hard error** (never "the door swallows the wall"); §3's hard-reject list gains "a cell that is two objects at once". Reason recorded with measured BFS evidence and the explicit non-decision on appearance precedence (UI / Art Director's `docs/ui-ux.md`) | Level AI + Solver (LV-005) |
| 2026-10-15 | V0.4 | **LV-006** — new **§8 record for the L6–L10 doors+switch unit**: the committed seeded generator and its candidate families, the accept/reject histogram, the shipped-file re-derivation check, the three negative probes, the two content laws now enforced in `@/core/solver/policy`, and the **§8.5 escalation** (`dualPhaseTiles ≥ 1` unsatisfiable before L11). §3's hard-reject list gains "M1 alone" and "a documented lesson the board does not deliver" | Level AI + Solver (LV-006) |
| 2026-10-15 | V0.5 | **LV-007A (RV-004 backlog A)** — §8.3 gains the one-negative-control-per-code rule (`Record<PolicyViolationCode, …>` + source scan; the m-2 mutation that survived 176 green tests is now RED) and multi-code probe expectations; §8.4's law 2 names the §3 construction bullets as gates (v)/(vi); **§8.5 gains the corrected acceptance law restated for the record** (pre-L11 = `refusedThenEnteredTiles ≥ 1`, gate (iv) active from L11; m-5's two-fact guard + the single-producer whitelist) and the **OQ4 ruling** — `switchRequired` is an obligation on the L7–L10 lesson rows with L6's dip an explicit `"exempt"` row, no `id === 6` special case, new code `lesson-switch-required` | Level AI + Solver (LV-007A) |
| 2026-10-15 | V0.6 | **LV-007B (m-8/m-9/m-10 reconciliation) + LV-007B items 1–4 recorded.** §4 **corrected**: the metric block now separates what `SolveResult` carries from what `@/core/solver/difficulty` adds, `maxSearchDepth` is labelled NOT `T`, and "still unmeasured" is replaced by the measured state (`B`/`T`/`R`/`D` landed, §5.2 of `docs/level-difficulty.md`; `D = L + 3·B + 5·M` inside the §4 acceptance region because `T ≡ R ≡ 0` there; the L5→L6 dip is measured **+8.53**, not −2…−3). §7 **stops citing a script that does not exist** (`scripts/generate-levels`) and names the three real gates, with the stale `docs/architecture.md` citation raised as an OPEN_QUESTION since that file is the Architect's. §8.4 law 1 gains the **mirror** law (n-13 `switch-without-targets`: a switch that fires but no door reads is M3 decoration; validator warning ≠ policy gate). §8.5 gains the **ADR-architecture-0002 split stated for the record**: gate (iii) and the pre-L11 acceptance law keep reading the **unordered** `refusedThenEnteredTiles`; the ordered companion `refusedBeforeEnteredTiles` is reported, never gated, with its L11 promotion trigger and the measured 0.9 %-class divergence. New **§8.7** records the n-11 route-walk fix (exact pruning + its **own** budget key `maxRouteVisits`; it used to read the exploration cap), item 2, item 3 and item 4 in one place. Header version resynced to the changelog (it had been left at V0.3 across V0.4/V0.5), and §8 retitled to the running pipeline record with §8.1–§8.2 declared to be the LV-006 block | Level AI + Solver (LV-007B) |
| 2026-10-15 | V0.7 | **LV-007C item 1 — gate (iii) reads the ordered companion** (the code half of GD-008's re-wording of `docs/level-design.md` §3 (iii); ADR-architecture-0002 decision 4 / Appendix A2). `policy.ts` gate (iii) now gates `refusedBeforeEnteredTiles ≥ 1` and prints both forms in its detail; `lesson-latch-dynamism`, gate (ii)'s refusal half and §8.5's pre-L11 acceptance law stay on the canonical **unordered** `refusedThenEnteredTiles` (A3 — the legs are not re-stitched; §8.5 rewritten to say so). Teeth: a watched trapped-refusal pocket (canonical 1, ordered 0) is now rejected by `gate-refused-then-entered`, added to the one-control-per-code table alongside the zero-board control. No shipped verdict moved: both forms report identical tile lists on L1–L10 (asserted), the CLI's per-level metric lines are byte-identical across the switch and the sole diff is gate (iii)'s own label/detail line. §4's metric block now names gate (iii) as the ordered field's single reader | Level AI + Solver (LV-007C) |
| 2026-10-15 | V0.7 | **LV-007C items 2–3 — the execution axis in this pipeline's record, and the target-curve reconciliation it points at.** *Item 2* (landed in its own commit): §4's metric block names `D_exec = D − w5·M` as a **component** of `D` (ADR-design-0001) and §8.7 item 3 records that the CLI prints it per level (`difficultyExec`, `@/core/solver/difficulty` `DifficultyBreakdown.Dexec`), both forms, `null` iff the board is unsolvable; `D`'s formula, weights and published values untouched. *Item 3*: §4's dip sentence now names its source precisely (`docs/level-difficulty.md` §3's "block starts with a dip" rule against the **pre-V0.6** `docs/level-design.md` §6 clause), and §8.7 item 3 records that §3 of `docs/level-difficulty.md` was **re-keyed** to the V0.6 execution-axis law — pre-ADR-0009 schedule (door L21 / portal L36) and pre-measurement absolute `D` bands withdrawn **by name**, block table following `docs/game-design.md` §8, dips scheduled only at the two real seams (**L6**, **L11**), legal-force numbers limited to L1–L10 (measured) + L11 (pre-registered). No solver behaviour, verdict, gate or contract changes in either item | Level AI + Solver (LV-007C) |
| 2026-10-15 | V0.8 | **LV-008 — the first complete mechanic-debut pass: `l011.json`, the M2 (portal) debut.** New **§8.8** records the second and last seam end-to-end: the pre-registered acceptance contract (`docs/level-design.md` §6 V0.6 / `docs/level-difficulty.md` §3.3–§3.4: `D_exec < 13.64`, `par ≤ 4`, exactly one opposite-colour pair, no false routes, below-OFFERED) filtered **before** the board existed; the committed seeded proposal family (`scripts/author-l11-candidates.ts`, `SEED = 20261015`, 54 candidates, histogram `gate-shortest-solution-presses-switch-and-crosses-door` 49 / `gate-portal-par-cap` 4); the 1 accept that is the shipped file (`shipped=MATCH`, `par=4`, `Dexec=8.5732`); the two named negative probes (same-colour pair → level-layer hard **error**, bypassable portal → `gate-portal-crossing-on-every-par-route`); the five new `PortalGateId` codes, each with its negative control under the §8.3 one-control-per-code law, and the deliberately **absent** `portalRequired`/"lesson-portal-required" check (unreachable ⇒ it would violate that law; the load-bearing question stays on shared gate (ii) + `switchRequired: "exempt"`); **gate (iv) satisfied for the first time** (`dualPhaseTiles = 21`), so §8.5's escalation paragraph gains its resolution note while the whitelist stays one gate on one board (`l008`); the §8.5 ordered/unordered **promotion trigger tested and not fired** (`[5,0]` on both readers). Honest gaps stated, not hidden: the seam-law control is a documented **boundary** board (shipped `l010` re-labelled `id: 11`, `D_exec = 13.642857 ≥ 13.64`), no surgical variant exists on `l011` because dead pockets there measure `deadStates = 0` / `T = 0`; the portal-pair control is surgical in its phase clause but its count clause couples to gate (ii) on one variant (recorded, not shipped); and on the **total** axis the debut is *not* a dip (`D` 28.6429 → 28.5732 while `M` +1) — the same structural sawtooth §8.7 item 3 records for L5→L6, real on `D_exec` (13.6429 → 8.5732, −5.07) and invisible on `D`, with no weight tuned to change it. §8.4 law 2 named the second gate family (L1–L11 lesson rows), §8.6's reproducer gained the new script, §8.7 item 3 / §8.5's trigger paragraph and §7's script list were reconciled to the authored state, and new **§8.9** is the current end-to-end block (11/11 PASS). Legal-force numbers are now L1–L11 measured | Level AI + Solver (LV-008) |
| 2026-10-15 | V0.9 | **LV-007E — the metrics sidecar: ADR-architecture-0003 Ruling 3 executed.** The accepted-set metrics stop being recompute-only: `docs/level-difficulty.report.json` is the committed artifact, emitted by `node_modules/.bin/tsx scripts/solve-levels.ts --report` (builder `scripts/metrics-report.ts`, calling the same `auditLevel` the gate and §4's inventory already name) and carrying one record per shipped level (the §8 contract fields + `par` read back from the file + the §2 breakdown `L B T R M D D_exec` + the diagnostics + the ordered/unordered latch tile lists + `parRoutes`/`embedRoutes`/`embedForced` + the per-level escalations, today exactly one: `l008`'s `dual-phase-tiles`), the weight vector, the two published seam read-outs with their weighted decomposition, and a `generatedFrom` block hashing the level files' **canonical content** (no git sha, no timestamp — reproducible across worktrees, still tree-bound). Freshness is a test, not a promise: `tests/solver/metrics-sidecar.test.ts` rebuilds the file and asserts byte-equality with the committed bytes, so a level edit, a weight re-calibration or a solver change without a regeneration is RED at the causing commit; it also pins `docs/level-difficulty.md` §5.2's cells against the artifact at the table's printed precision and cross-checks `tests/solver/difficulty.test.ts`'s hand-typed pins (non-vacuity: a builder bug cannot agree with itself). §8.9's reproduce list gains the emit; `docs/level-difficulty.md` §5.2 declares itself the human mirror and §5's stale "no sidecar exists" sentence is corrected. **The CLI's stdout dump is unchanged** — `--report` writes silently, so this document's §8.6/§8.9 baselines stay diffable; the sidecar adds no print, no metric and no rule | Level AI + Solver (LV-007E) |
| 2026-10-16 | V1.0 | **LV-009-B — the L12–L15 block integrated: the law first, the program second, the data third.** New **§8.10** records the integration end-to-end: the **STEP 0** attestation commit (`e8a456d`, `scripts/attest-lv009-block.ts` + committed transcript) that re-derived *every* constant of **ADR-design-0003** from the four candidates as an **isolated, sha256-verified dataset** **before any dataset byte moved** (`LAW-MATCH`, exit 0, no `STOP_AND_ROUTE`: par 4/6/8/10 · `D_exec` 8.230769/10.898734/12.957895/14.969697 · `T ≡ R ≡ 0` · 0 dead states · coverage 100 % · portal-free 7 / UNSATISFIABLE · all-OFF advantage **+2** on 4/4 · 19/16/20/15 dual-phase tiles · 3/5/5/6 refusal tiles, ordered == unordered 4/4); then the **law encoded before the data** (six `BlockGateId`s, six `gate-block-*` codes, the `block-l1215` obligation rows, `allOffShortestSolution()`, `blockL1215Gates()`, the dip ceiling re-read from the live `l011.json` at **8.573171**, and the debut's `PORTAL_DEBUT_EXEC_BUDGET` deliberately **not** re-purposed); then a **byte-copy** of the four candidate files, never an edit; then **one measured negative control per new code** — four surgical, two deliberately coupled with the coupling named (the latch control couples with gate (ii) by **theorem**: gate (ii) PASS ⇒ no all-OFF route is as short as par, so G1 can never fail alone, asserted as an implication over every board; the tail control is the interior member wearing the last member's id because a 48-slot / 1128-pair wall search measured that no sealing pulls L15's execution axis under 13.64). Acceptance on this tree: validator **15/15 ok · 0 errors · 28 warnings** · solver **15/15 PASS** (1 standing escalation) · sidecar regenerated to 15 records · `tsc` 0 · vitest **30 files · 617 passed · 3 skipped** · build ok. Recorded as **not** this role's to do: the **registry unlock** (`src/game/levels/level-registry.ts` still imports `l001`–`l011`) and the **UA capture-entry round** of ADR-design-0003 §8 item 6 — both handed over by name, so the remaining RED rows name the *registry*, not the data. New **§8.11** points at the sibling records instead of restating them | Level AI + Solver (LV-009-B) |
| 2026-10-16 | V1.1 | **LV-009-B, the e2e half — the red rows stop being inferred.** §8.10 gains **item 6**: one managed full run (`PS_E2E_PORT=5219 … --retries=0`) at **107 tests / 8 files → 20 failed · 87 passed (6.0 m)**, with **every** red row named and attributed — 19 of 20 from the registry gap (quoted at the mechanism: `startIndexForLevel`'s *"unknown ⇒ index 0 (L1)"*, so `?level=12` plays L1: 4 HUD labels, L11's own dialog, the L1→L15 unlock chain, the end-dialog row, 5 latch-door, 7 refusal) and **1** from a *dataset-derived* pin that the block law legitimately invalidates (`portal.spec.ts:82`, `[11]` → `[11,12,13,14,15]`, QA's pen). Then the **transient registry probe** — clearly labelled, uncommitted, reverted (`git status` clean, bytes back to `HEAD`) — which lifts the four UI-walk specs to **74 passed · 2 failed (3.6 m)** and thereby proves the four boards are **winnable through the real UI**: the L1→L15 unlock chain included. The surviving L12 latch row is triaged by a new committed audit tool, **`scripts/latch-pair-audit.ts`** (two independent arms: the spec's own fixture bookkeeping and `isLegalMove` alone over the reachable set): L12 ships **2 / 12** co-located discriminating pairs while L6–L11 and L13–L15 read HOLDS, so the row is **fixture selection** in `cheapestDoorFixtures()`' independent cheapest-of-each-kind pick (the tie that lands on `(5,1)A down` instead of the pairing `(4,2)A right`), not a board gap — the spec's docstring describes a search the helper does not perform. No data byte, no solver number and no test changed; handover is three named items (registry unlock, UA capture-entry round, two QA pins). Header version resynced to the changelog | Level AI + Solver (LV-009-B) |
| 2026-10-16 | V1.2 | **LEVEL-DOCS-1 — §8.10 item 6 CLOSED: the handover landed and the round is discharged.** Registry unlock `3cd643e` (R-003b, merged `96cd43c`) measured **105/107** on its own tree, i.e. **18 of the 20 named reds green** (87 + 18 = 105, same 107-row inventory; the row that did not flip is the **browser-free** L12 pair row `latch-door.spec.ts:102`, which the registry could never have moved and which item 6's fix-the-registry probe had already isolated for fixture selection) with the 2 survivors *exactly* the 2 rows item 6 had foreclosed as not-this-lane (`latch-door.spec.ts:102` L12 fixture selection, `portal.spec.ts:82` dataset-derived list) → QA-006 (`0f08c95`, merged `db9536d`) moved 10 unit + 2 e2e rows derivation-first → **FIRST FULL GREEN under the zero-retry law: local 107/107 in 6.8 m** (tsc 0 · levels 15/15 · vitest 632/3) **and cloud 107/107 in 16.0 m on develop tip `ff0a8f8`, run `38843718456`**, zero retry in both; chain `c34e0d1` ← `96cd43c` ← `db9536d` ← `ff0a8f8` verified pairwise (each a two-parent merge). **ADR-design-0003 §8 item 6 EXECUTED AND JUDGED 5/5 PASS** (UA-0011: 33 PNG + 4 logs in-repo at `docs/evidence/entry4-block/`, verdict `docs/ui-ux.md` V0.9.2 §3.3b Entry 4, no hand-typed move, `tests/**` untouched). **L12–L15 LIVE on Pages** via train 2 `5b058ff` (deep-link `L 12`…`L 15` banners, console 0 errors, bundle `index-CCs6qr4w.js`); **main CI round recorded by the Orchestrator in `docs/project-status.md` item 76, deliberately not claimed here.** Falsification kept on the books: R-003b's dispatch criterion #2 ("unit pins go green derived") **falsified by measurement** — 10 hand-typed pins, agent stopped at the `tests/**` boundary, routed to QA-006; rule bought = predict derivation only where the file actually derives | Level AI + Solver (LEVEL-DOCS-1) |
| 2026-10-16 | V1.3 | **LV-010 — the L16+ ladder opens, and three rungs are proven.** New **§8.12** records the **unregistered candidate shelf** (`src/levels/candidates/`, with the three non-recursive census readers that make a root placement break two suites and auto-register a level), the **STEP 0** re-attestation (`a19a347`, `scripts/attest-lv010-cut.ts` + transcript, `LAW-MATCH`: cut floor `14.969697`, `B` band `[1.2500, 1.6875]`, `T ≡ R ≡ 0` 15/15, vocabulary closed), the derived rung `par ≥ l15Par + 2·(id − 15)` with **the rung chosen in selection and only a lower bound gated**, the two tools (`scripts/author-l16-candidates.ts` propose / `scripts/prove-candidate.ts` prove, the latter re-measuring the CUT from the shipped 15 on every run and carrying a six-control mutation battery), and the measured ladder **L16 `par 12` / `D_exec 17.100000` · L17 `14` / `19.027027` · L18 `16` / `20.907923`**, each §4-clean and each with an **UNSATISFIABLE** all-OFF world (the goal-gated latch = every approach to the goal is a door; L18's step is a change of *shape* — a 3-door full seal — not a longer walk). F-L16-3 recorded: the first control table's expectations disagreed with 3 of 6 measurements and were corrected **to the measured names** (`expect` is now a clause *list*; a mutation that is ACCEPTED still fails the battery). New durable pin `tests/solver/l16-l20-candidates.test.ts` (walks the directory, re-derives cut/rung/band from the shipped set, four negative controls) → `vitest` **32 files · 662 passed · 3 skipped**. F-L16-1 (L16's inert second latch, measured via the `null` all-OFF walk + the tile identity) and F-L16-2 (the named, not widened `B` excursion to 1.7000) are recorded for review; registration/`EXPECTED_LEVEL_COUNT`/sidecar/block-law stay **R-003c** | Level AI + Solver (LV-010) |
| 2026-10-16 | V1.4 | **LV-010f — L19 is proven: the seal closes its fourth side.** The block gains a fourth rung, **L19 `l019.json` · `par 18` · `D_exec 22.885157` · `B` 1.6284 · 231/231 press-then-cross · 10 refusals · 42/42**, all nine gates ACCEPT on the landed bytes and 6/6 mutation controls caught by their named gate. The **shape step is a census result, not a choice**: `--stage=f` (new) measured 14 310 bare boards across the sealed-column families at `7×6` and showed the bare route reaches `par 14` and no further — and only at seal arity 2, which is L16/L17's shape already — while arity 3 caps at 13 and arity 4 at 12; so the step taken is arity **3 → 4**: the goal moves off the edge into the **interior** (`(5,4)`, four neighbours, all four doors) and the ladder now walks the full-seal sequence 2 → 2 → 3 → 4. The arity-4 family was enumerated **completely** (17 160 tuples, `--swcap` above the whole space) giving `par census 12:10230 14:6450 16:446 18:34` — 18 is the family's ceiling and 26 boards clear every gate at exactly the rung value. The generator is now **rung- and family-generic** (`--w`/`--h`/`--seal`/`--drop`/`--geo`, defaults reproducing every L16–L18 command byte-for-byte) and prints a **rung pin**: an accept longer than `l15Par + 2·(id − 15)` is named and dropped, never shipped as the rung. The block test gains three **ladder-level** obligations (strict `D_exec` rise, exact rung `par`, the named `B`-excursion register) → `vitest` **32 files · 670 passed · 3 skipped**. Registration/`EXPECTED_LEVEL_COUNT`/sidecar/block-law stay **R-003c** | Level AI + Solver (LV-010f) |
| 2026-10-16 | V1.5 | **LV-010f — L20 is NOT authored, and the block's stop is a measurement.** After L19 the par-20 rung was searched for and **not** found: the census says the goal-gated full-seal device L16–L19 are built from has a measured ceiling of exactly **18 on `7×6`** at every arity. Enumerated, not sampled: arity 2 (both bare-14 geometries, 210 tuples each) `14:201 16:9`; arity 3 (2 184 tuples) `12:1584 14:452 16:139 18:9` and `12:1224 14:910 16:50`; arity 4 — L19's own board — (17 160 tuples) `12:10230 14:6450 16:446 18:34`. `7×7` does reach `par 22` (43 680 tuples: `12:21840 14:18018 16:2457 18:1197 20:108 22:60`) but with a seal **byte-identical in shape to L19's** at the **same bare par 12**, so the extra moves are press-detour length on an already-taught shape — a re-ran longer walk, refused as a rung's escalation. **Why it is structural, measured:** with a full seal the shortest plan opens exactly ONE door, because every seal tile is directly adjacent to the free far region — on `l019.json` and `l018.json` every single-door board (that door plus only its own switch, all others deleted) is solvable at `shortest = 12` while all-OFF is unsatisfiable. So `par = min_i (d(start→s_i) + 1 + d(s_i→goal))` and the only escalation available is where the cheapest switch sits. Two constructions that would force a *second* press were identified and recorded for the next lane — a **gauntlet** (every approach to the goal's ring itself behind a door; note that walls cannot be used to remove an approach, because a far-region phase wall makes its tile unstandable and the 42/42 coverage gate then fails, so every blocker must be an openable door) and a **sealed landing** (the portal lands in a pocket whose exit is a door → an ordered two-step chain, `docs/level-design.md` §5's still-undelivered "2-step lookahead"). **Neither was built and no rung claims them**; the block ships as L16–L19 and waits for a mechanism. Barrel unchanged: no gate widened, no band moved, no shipped row touched | Level AI + Solver (LV-010f) |
| 2026-10-16 | V1.6 | **R-003c — the shelf empties and the block is registered: the four rungs are dataset, and the law is what judges them.** New **§8.13** records the registration end-to-end. *(The copy)* `git mv` of `l016`–`l019` from `src/levels/candidates/` into the root — a **byte-copy, never an edit** — with identity proven by git blob hash against `3cc6df2:src/levels/candidates/lNNN.json` (`4635a866…`/`97ce1448…`/`486fedac…`/`3feca910…`) and the check **failing** rather than skipping when git cannot answer. *(The law, before the numbers)* `BLOCK_L1619_*` constants + the six-id `BlockL1619GateId` union + `blockL1619Gates()` + four lesson rows **all `switchRequired: "required"`** (measured, not decreed: the all-OFF subgraph contains no goal state on 4/4, so this latch carries **existence** — L16–L19 are the first latch block in the set that is not `"exempt"`) + six new `gate-block-l1619-*` codes. *(The gate that could have been self-serving)* `scripts/prove-candidate.ts`'s `measureCut()` now **excludes `BLOCK_L1619_IDS`** from the cut basis: without it, registering the rungs would have let the block's own max `D_exec` (22.885157) become the ceiling it is judged against, and all four rungs would have been **falsely REJECTed**. *(The re-attestation)* `scripts/attest-lv010-block.ts` + committed transcript, `RESULT: REGISTERED-MATCH`, exit 0 — byte identity; the law's basis re-derived from the live L1–L15 files (10 / 14.969697 / `[1.2500, 1.6875]`, all MATCH against the imported constants); **every booked number re-measured from the root bytes**; all gates PASS per rung; the ladder (exact rung `par`, strictly rising `D_exec`, terminal = the 22.885157 ceiling); and **6/6 negative controls caught by name** — one per gate, in-lane (the `tests/**` `Record<PolicyViolationCode, …>` is deliberately left RED with its six missing keys named for QA). *(The parity claim)* the registered bytes re-measure the booked `12/17.100000 · 14/19.027027 · 16/20.907923 · 18/22.885157` **identically** — every published number is a Solver read-out of the root files, never a candidate note; the tail-ceiling gate compare is 6-dp for exactly that reason (bit-exact wrongly refused `l019`). *(Acceptance)* validator `19/19 ok · 0 errors · 52 warnings` (11/11 probes) · solver `19/19 PASS` (1 standing escalation, `l008`) · sidecar regenerated to **19 records** · `tsc` clean on production · `vitest` **33 files → 9 failed / 38 rows**, every red one a count- or dataset-derived pin itemised with **file:line** in `src/levels/README.md` §7. *(A measured finding, not a mystery)* `route-budget.test.ts`'s exhaustive-vs-pruned equality runs an **unpruned** walk under the default `PAR_ROUTE_VISIT_CAP = 2_000_000`, and the new rungs' unpruned demand is **1,363,684 / 17,779,004 / 98,736,430 / > 5 × 10⁸** work units (L16→L19) while the **pruned** walk every shipped tool uses costs 115/570 … 2162/7386 on the same boards — n-11's lookahead prune shown to be load-bearing, with the numbers handed to QA. *(Cross-lane, named not taken)* the registry row (`src/game/levels/level-registry.ts`), `EXPECTED_LEVEL_COUNT` `tests/e2e/helpers/levels.ts:76`, and eight derived pin tables; `src/levels/candidates/README.md` created so the empty shelf reads as **graduated**, not lost. *(The permanent gap)* **L20 is not authored** and no fifth rung was invented: the goal-gated full-seal device's ceiling is par 18 / `D_exec` 22.885157 on `7×6` at every arity, `7×7` reaches par 22 only by re-running L19's exact seal shape longer (refused as an escalation), and `block-l1619-tail-ceiling` enforces the stop as an equality — a par-20 rung needs a new lattice stage (gauntlet or sealed landing), recorded for the next lane. **No earlier row, gate, band, weight or shipped number moved** | Level AI + Solver (R-003c) |
| 2026-10-16 | V1.7 | **LV-011 — L20 is authored: the ADOPTED sealed landing is built, censused, and proven as a candidate.** New **§8.14**. *(The law first)* GD-007 / ADR-`design-0004`: **sealed landing ADOPTED, gauntlet REJECTED** (≥ 6 doors on a 7×6 arity-3 ring, and walls cannot remove an approach — a far-region phase wall makes its tile unstandable and the 42/42 coverage gate fails); only the adopted device is implemented, no stage and no gate for the rejected one. *(The search)* new tool `scripts/author-l20.ts` — stage **P** (pocket class census), stage **SL** (the lattice `portal entry × pocket × pocket switch × goal × seal-switch tuple`, each tuple re-derived and judged), stage **V**, the §6.1.4 clone guard on the **stricter seal-inclusive** geometry key, `probePar()` as the rung pin filter; **238 devices / 269 484 tuples** at pockets ≤ 5 and **2 788 / 284 784** at ≤ 8 give the **same 640 accepts**, the whole rejection histogram being `par-not-rung` (the rung pin is the only filter that fires) with `par-20 candidates refused by a gate: 0`; accepts run `D_exec` 24.729412…24.790588 · `B` 1.5765…1.6485, and the selection is derived (exact rung par → min `D_exec` → enumeration order). *(The instrument)* **F-L20-1**: pass 1 returned `0 accept(s) of 269484` from **two false refusals** — `landingArrival()` searched a *walk-in* where `applyMove` fires the portal on **entry** and flips after it (so the arrival is the teleport's successor), and g1's escape flood counted moves made *after* leaving the pocket (now edges out of the pocket only, with the near-end return named); both corrected to the shipped rule and mirrored in the prover, justified by the rule and not by the outcome, and visible only because two independent implementations disagreed. *(The proof)* `l020.json` = **par 20 · `D_exec` 24.729412 · `B` 1.5765 · 252/252 press-then-cross · 14 refusals · 42/42 · all-OFF UNSATISFIABLE · gates 15/15 ACCEPT**, with the rung-≥20 chain adding `rung-plus-block-escalation` (`> 22.885157` **and** `B` in band), `par-rung-exact` and **g1–g5** (pocket on-foot-unreachable and leak-free · boundary sealed by **exactly one** door object, 0 free leaks, 0 walls · the ordered two-press chain on every route · all-OFF unsatisfiable · **the census identity broken** — the identity's value 16 < par 20 while every par route presses 2 switches). *(The battery)* **11/11 caught by their named gate**, each g1–g5 control measured before its `expect` was written — and **F-L20-4**: the inherited *"both switches retargeted"* control **MISSED** (this board carries five, and the first refusal is `unsolvable`), so per F-L16-3 it was **renamed to its measured meaning** and its `expect` corrected to the measured names. *(The open boundary)* **F-L20-3**: stage P's ≤8 class is complete (`16 431 095` tested · `13 163 780` single-phase boundary · 2 788 leak-free, sizes `3:34 4:204 6:510 7:2040`) but `--pocketsize=10` measures **more** leak-free pockets on the same landings (`5,1` 12 → 40, `6,0` 12 → 40, `5,0` 3 → 13) — recorded as **class completeness OPEN at ≥ 9**, a named slice, never a completeness theorem and never a ceiling claim. *(Acceptance / report-only-up)* validator 19/19 ok · 0 errors · 52 warnings · 11/11 probes; solver `src/levels/candidates --audit` **1/1 PASS** with `parMatch=true`; `tsc` production clean (the single red row is the QA-011 pin, pre-existing at `b597f64`); `vitest` delta is **one suite turning from "crashed, 0 tests executed" into "ran, 17 executed"** — baseline 33 files · 12 failed / 21 passed · 42 failed / 648 passed / 3 skipped · 1 failed suite → 33 files · 12 failed / 21 passed · 45 failed / 662 passed / 3 skipped · 0 failed suites, **no previously-passing test failing**, the three new reds itemised (two are the fixture's `15`-vs-`19` and the one-candidate shelf; the third is **F-L20-2**, reported not edited: QA's *latch-removed* control asserts a bare board stays solvable, which a sealed landing falsifies **by construction** — the same class of false refusal as F-L20-1, on the test side, handed to QA-011 with its mechanism). *(Cross-lane, named not taken)* registration, the registry row, `EXPECTED_LEVEL_COUNT`, the sidecar and the **registered `block-l1619-tail-ceiling`** stay R-003c/Orchestrator — the registered ceiling is still par 18 / 22.885157 and a proven candidate does not widen it. Transcript: `scripts/author-l20.transcript.md` | Level AI + Solver (LV-011) |
| 2026-10-16 | V1.8 | **R-003d — the fifth rung is registered: L20 joins the block, and the tail ceiling moves only after a certified root re-measure.** New **§8.15** records the pass: `git mv` byte parity (blob `78acaed0…`, rename 100 %), the root re-measure reproducing the booked `20 / 24.729412 / 1.5765` **before** any law file was touched, the block law grown to `BLOCK_L1619_IDS = [16..20]` with the derived rungs `12/14/16/18/20` matched exactly, the **re-registered** tail (`BLOCK_L1619_TAIL_PAR` 20 / `BLOCK_L1619_TAIL_EXEC_CEILING` 24.729412; the old 18/22.885157 recorded as the door-count seal's census ceiling, i.e. the standard rung 5 beat), the `measureCut()` exclusion grown to the five-rung block so the **cut stays frozen L1–L15 14.969697** (quoted red: the pre-fix run refused L20 with `escalation - D_exec=24.729412 > CUT 24.729412`, the board judging itself), `switchRequired: "required"` on the fifth row, `prove-candidate` **ACCEPT + 13/13 controls caught by name** (incl. the F-L20-2 re-point: the latch-removed control is the **named `unsolvable`** refusal on a sealed landing), the new in-lane battery `scripts/audit-block-l1620-controls.ts` **6/6 caught by name**, the **P-1** readout (**252/252** par routes re-land through the landing portal => a LIVE PA-003 row, not a structural guard), `attest-lv010-block` **exit 0 REGISTERED-MATCH** with per-rung byte origins, the sidecar regenerated to **20 records**, and the cross-lane pins named for **GAME-002** (registry row) and **QA-014** (verbatim broken-pin list in `src/levels/README.md` §7b). **No earlier row, weight, gate or shipped number moved** | Level AI + Solver (R-003d) |
| 2026-10-17 | V1.9 | **LV-012 — Act II batch 1: the `G` lattice is named, censused, and five rungs are proven on the shelf.** New **§8.16**. *(The law)* `docs/level-design.md` §7.2/§7.4/§7.7 + ADR-`design-0005`: Act II = portal orchestration, `par` **16–24**, `D_exec` **`[19.75, 29.06]`** (derived from the measured `B` band, no new maths), stage **G** = multi-pocket with an ordered ≥ 2-press plan under §6.2.3's obligations **verbatim**. *(The frame)* `--stage=frame` measures the far-frame phase law against a bare-board BFS: **2754/2754 readings agree, 0 mismatches**; the batch runs at **`--cx=2`** (at the tool's default `--cx=3` — L20's frame — the `G` lattice judges **0** candidates), and every command in the record carries the flag. *(The shape before the search, §7.7 item 2)* the device is published in the tool header before anything is enumerated: landing pocket `P` (portal-only, exit = one door `d1`, press `s1 ∈ P`) → free far region `F` (entered only through `d1`, press `s2 ∈ F`) → second walk-sealed pocket `Q` (`d2` its only entrance *and* exit, press `sg ∈ Q`) → goal (every in-region neighbour a `d3` tile); the forced order `s1 → d1 → s2 → d2 → sg → d3` is a **property of the board**, and the prover re-derives it **from the landed bytes** and stages the worlds to show it is *forced*, not merely present. *(A negative census published as a finding)* `--pocketsize=5 --qmax=5 --cap=800` returns **0 accepts of 0 judged** with **not one room surviving sealability** (`column-leak` 72 471 · `mixed-entry-phase` 24 004 over 476 devices) ⇒ in this frame the walk-sealable room caps at **4 tiles**, so the family carries only **2 skeletons per `par`**; the five rungs therefore share skeletons while carrying **five distinct §6.1.4 keys, 0 collisions** — reported as a **legibility risk to the designer**, never as a guard violation (§7.7 item 4 forbids re-stamping L20's shipped skeleton and forbids clone-key collisions; it does not demand five skeletons). *(The accept class, refusals beside it — §7.7 item 5)* `--pocketsize=4 --qmax=4 --cap=200`: **2208 accepts of 9570 judged in 29.0 s**, set-identical to the earlier dump ⇒ reproducible from its own record; histogram **`unsolvable` 4004 · `g5-identity-broken` 1864 · `par-out-of-band` 1494**, upstream `room2 sets not sealable` 47 608, room rejections `column-leak` 31 603 / `mixed-entry-phase` 28 743, and **`in-band candidates refused by a gate: 1864`** — every in-band refusal is the identity gate, none a stray rule; note the shape, the dominant filter is *the puzzle not existing* and the second is *the device's own structural law*, **`par-out-of-band` is not the dominant filter**. *(The selection rule, published before it ran, §6.1.4 clause added before the write)* a fourth clause (distinct seal-inclusive key) was **measured to be violated by the first draft** (two rungs on one skeleton with identical portals *and identical door tiles*), which is why it is a **filter, not a preference**; dry run — **21 par combinations tried · 0 dropped by the rising-`D_exec` clause · 0 par dropped by the clone clause · pars [17, 18, 20, 21, 23] · Δpar≥2 steps 2/4 · min `D_exec` 21.581395 · spread 6.023256 · 5 distinct keys, 0 colliding with the shipped 16**. *(The ladder, prover-measured)* **L21 `par 17` / `D_exec` 21.581395 / `B` 1.5271 / 12-12 · L22 `18` / 22.584000 / 1.5280 / 16-16 · L23 `20` / 24.620000 / 1.5400 / 20-20 · L24 `21` / 25.604651 / 1.5349 / 90-90 · L25 `23` / 27.604651 / 1.5349 / 72-72** — coverage **42/42 ×5**, `T ≡ R ≡ 0` ×5, all-OFF **UNSATISFIABLE** ×5, `B` in band **5/5**, `D_exec` strictly rising **4/4 with no dip** (`Δ` +1.002605 / +2.036000 / +0.984651 / +2.000000), **5/5 GATES ACCEPT**, **13/13 negative controls caught with each control's own gate named on every rung**, and §7.3's `act-peak` **DISCHARGED by the batch maximum** (27.604651 > Act I's measured 24.729412, **+2.875239**, headroom to the ceiling 29.06 = **1.455349**) with the clause riding **only on the peak rung**; `Δpar ≥ 2` on **2 of 4** steps is a *measured* consequence of a 7-wide window (`17 + 2·4 = 25 > 23`) reported beside the ladder, never smoothed over. *(Falsification)* `--peak=28.5` fails **exactly one rung on exactly one gate** (`L25`, `act-peak`), so the clause is live rather than decorative. *(The proving side)* `prove-candidate.ts` gains `--family=g|sl`, `--ladder=`, `--peak=`, `--measure-controls` (**expectation pass asserts nothing** — F-L16-3 order: measure, then write the expectation) and `measureRoom()` re-measuring each room's boundary against the **current** bytes so a door-mutating control is still named by `g2`; family-`g` gates `g0-portal-pair · g1-pocket-on-foot · g2-room-exit-door · g6-room-structure · g3-ordered-chain · g4-switch-required · g5-identity-broken` with the base `par-step` replaced inside the act band by `act2-par-band · act2-exec-band · act2-b-band · act-peak`; `g3` **stages worlds** (dropping the first *k* switches must leave the `(k+1)`-th switch tile **and** the goal unreachable) so the order is *forced*. *(Acceptance at this tree)* `tsc --noEmit` clean on production · `npm run levels` **20/20 ok · 0 errors · 11/11 probes** · `solve-levels src/levels/candidates --audit` **5/5 PASS, `parMatch=true` 5/5** (17/18/20/21/23) · `vitest` at this tree **33 files → 32 passed / 1 failed · 761 rows → 757 passed / 1 failed / 3 skipped**, the single red being `tests/solver/l16-l20-candidates.test.ts:163` (QA-011's *booked-shelf* pin `expect(shelf).toEqual([])`) with **no previously-passing test failing** — the empty-shelf baseline at the same base was **758 passed / 3 skipped**. *(Cross-lane, named not taken)* the registry row, the id block law in `src/core/solver/policy.ts`, `EXPECTED_LEVEL_COUNT` and the sidecar stay with their owners until registration — **a proven candidate does not widen a registered ceiling**; the one red row (`tests/solver/l16-l20-candidates.test.ts:163`, QA-011's booked-shelf pin) is the **tests lane's** and is reported, not edited. **F-L20-3 is a SEPARATE pass and lands as its own commit** — no verdict is recorded here. Transcripts: `scripts/author-l21.transcript.md`, `scripts/prove-candidate-l2125.transcript.md` | Level AI + Solver (LV-012) |
| 2026-10-17 | V1.10 | **LV-012 — F-L20-3 is CLOSED by measurement: the ≥ 9-pocket boundary is a real, enumerated size-9 class, and the ≤8 census is proven to be a slice of it.** The `--stage=p --pocketsize=10` pass LV-011 deliberately killed after 25 lines was run as **18 disjoint `--only=x,y` landing slices** (identical tool and stage; only the landing walked differs), which makes summation exact — demonstrated, not argued: the killed pass's **25 data lines reproduce byte-for-byte** and its three per-near previews are **confirmed exactly** (`5,1` 40 · `6,0` 40 · `5,0` 13). *(Measured)* **724 203 655 pockets tested · 592 804 433 single-phase boundary · 17 476 leak-free · 18/18 landings · 0 errors**, in **45 min 37 s** at 8-way = **264 573 candidates/s**; the ≤8 pass is **2.3 %** of that volume (**44×**). *(Verdict)* histogram at ≤10 = **`3:34 · 4:204 · 6:510 · 7:2040 · 9:14688`**; the first four rows are the committed ≤8 histogram **digit for digit** (`= 2 788`), reproducing it **per landing too** (`5,0` 24 = 8 × 3, `6,0` 108 = 9 × 12 — both committed anchors), so the ≤10 pass carries its predecessor as a **sub-histogram**; the new row is a **size-9 class of 14 688 members** (7.2× the largest ≤8 row) spread over the twelve class-bearing landings; and **no size-8 and no size-10 member exists anywhere** (`NF == 8` and `NF == 10` are **0** on all 18 landings) ⇒ inside `≤ 10` the admitted sizes are exactly **`{3, 4, 6, 7, 9}`**. LV-011's "the ≤8 class is a slice, not the whole space" is therefore **measured**, and the boundary **closes**. *(Scope)* completeness holds **for pocket size ≤ 10**, the frame's own limit; **≥ 11 was not enumerated** and per §7.7 item 1 **no ceiling claim is published either way**. What the new members buy is a **wider pool** (2 363 leak-free on x=5 landings · 15 113 on x=6 · **0** on x=4), a pool statement — **no `par`, `B` or `D_exec` moves because of this census**. *(Two findings recorded, neither promoted to law)* ① the `x=4` / `x=6` slices enumerate to **identical `tested` counts on all six landing rows** (3 187 161 · 18 777 072 · 45 252 927 · 40 224 824 · 21 124 206 · 2 833 032 — six exact matches) while the parity verdict between them is **total and opposite** (**0** single-phase and **0** leak-free at `x=4`; the whole tested count plus 15 113 leak-free at `x=6`) — **mechanism NOT established**, named as an open lattice question for the architect; ② the parity pattern of the empty sizes (5, 8, 10) is measured over 724M candidates with no structural argument offered. *(Instrument work, both semantics-preserving and both proven)* `pocketCandidates` was an **eager `Pocket[]` builder materializing the whole class** — the ≤10 OOM was a **materialization bug, not infeasibility** — now a **lazy generator**, equivalence proven by re-running `--pocketsize=8` to the identical `16 431 095 / 13 163 780 / 2 788` and histogram `3:34 4:204 6:510 7:2040`; and `--only=x,y` (repeatable, stage P only) was added with the no-`--only` shipped loop **byte-unchanged**. **Nothing that changes what is counted moved**, the slice method and the `NOT MEASURED`-never-zero rule were published **before** the run, and **no tuning-to-pass** occurred. *(Next lever, named not taken)* the enumerator walks **growth sequences, not distinct tile sets**, so `16 431 095` / `2 788` are **sequence counts**; a distinct-set enumerator makes ≤11/≤12 affordable **and re-baselines them** — a ticket boundary. **No root row, weight, band, gate or shipped number moved.** Transcript: `scripts/author-l20-p10.transcript.md` | Level AI + Solver (LV-012) |
| 2026-10-17 | V1.11 | **LV-013 — the census instrument is made honest and ARCH's two probes are run; every accept-class number stands.** New **§8.17**. *(The corrigendum, 46/2000 style — labelled in place, never silently replaced)* the published `single-phase boundary` totals **592 804 433** (≤10) and **13 163 780** (≤8) were **tautological accumulations, not measurements**: `sealedPocket` cannot reject a connected pocket, so the column is **`≡ tested` by construction** (correct values **724 203 655 / 16 431 095**), and its accumulation sat **inside** `if (hereSealed > 0)` at `author-l20.ts:925–932`, silently dropping the six `x=4` landings — the deficits quoted as evidence (`131 399 222` / `3 267 315`) are exactly the `x=4` `tested` sums. The **first-column `0`s are reclassified LAW** (ADR `architecture-0004` Ruling 2: no `(CX+1, y)` landing is leak-free in any frame), never measurement; §1a's "licenses the `x=4` reading" cross-check is named a tautology, and §6a(i)'s "mechanism is not established" is marked SUPERSEDED by Rulings 1–2. **Zero blast radius:** `724 203 655` tested · `17 476` leak-free · `3:34 4:204 6:510 7:2040 9:14688` · the `2 788` ≤8 sub-histogram · every per-landing anchor · every `par`/`B`/`D_exec`/band/gate/shipped row/registered ceiling — accepts never consulted the column. *(PROBE A, gate removed, `--pocketsize=4`, one full orbit-pair set, 12 landings, exit 0)* `tested` mirrors **6/6** across `σ_x` (`261 · 568 · 747 · 664 · 639 · 232`, orbit total `3 111` per column) while verdicts do not: the six `x=4` landings are **empty at all 51 per-near lines**, the `x=6` members carry **153** leak-free line-instances, and `single-phase(4,y) == tested(4,y)` on all six — sizes mirror, accepts do not, exactly as §15.3 proves; orbit `K` read-out `29 · 71 · 83 · 83 · 71 · 29` with the `9↔8` parity factor on `σ_y`. *(PROBE B)* **`v = K(6,2)|≤8 = 117 587` CONFIRMED by measurement** — `--only=4,2 --only=6,2 --only=4,3 --only=6,3 --pocketsize=8` returns per-near **117 587** on **4/4** landings and `tested` `1 058 283 / 1 058 283 / 940 696 / 940 696` = `N × 117 587` (35.5 s, exit 0), with `17 × (11 608 + 63 000 + 117 587) = 3 267 315` closing the committed ≤8 deficit exactly; **the prediction was NOT recoverable from the committed record and the missing data is named** (every `x=4` ≤8 per-near line — gate-suppressed at source, absent from every committed artifact; every class-`{2,3}` ≤8 per-near line — elided in `author-l20.transcript.md` §4, the ≤8 slice files never committed) ⇒ the probe is the measurement, **never a reconstruction**; the ≤8 `x=4` rows had never been measured before. *(The fix, smallest honest diff, `scripts/author-l20.ts` +52 −9)* accumulation moved **out** of the print gate, the per-pair line prints unconditionally as `N tested · N single-phase boundary (TAUTOLOGY ≡ tested · ADR architecture-0004 R3) · M leak-free` with first-column landings labelled with the Ruling-2 law, `sealedPocket` documents its own tautology, and the **pre/post receipt** at `--pocketsize=4 --only=4,2 --only=6,2` shows **`tested` 1 494 → 1 494, `leak-free` 36 → 36 with the 36-line listing byte-identical (`diff` = 0)**, the 9 shared pairs identical 9/9 and only the tautological field changed (now honest); 9 previously suppressed `x=4` lines appear, all `leak-free 0`. *(Cost law carried as a comment, not machinery)* ADR Ruling 4: sizes may be predicted per `D2` orbit labelled `PREDICTED`, results **never** inherit except the first-column law, and **no prediction is implemented** — two deferred rows named in §8.17 (the one-flag orbit prediction; deleting the tautological channel), both moving zero numbers (YAGNI, `docs/architecture.md` §13). *(Cross-lane fold-in)* `src/levels/candidates/README.md` restated from the stale "shelf is empty / `l020.json`" wording to the booked **`l021`–`l025` set-equality** (QA-018's `:163` re-book), **no ceiling wording either direction** (item 114). Battery: `tsc` **0** · `npm run levels` **20/20** · `vitest` **reported, not chased** (QA-019 holds `tests/**`). **No root row, core law file, `src/game/**`, `tests/**`, schema, `par`, `B`, `D_exec` or registered ceiling moved.** Transcript: `scripts/author-l20-p10.transcript.md` §10 | Level AI + Solver (LV-013) |
| 2026-10-17 | V1.12 | **R-004a — Act II batch 1 (L21–L025) is REGISTERED: the shelf empties again, the act-tail law lands with anti-tautology guards, and the cut stays frozen.** New **§8.18**. *(The move)* `git mv` of the five LV-012 candidates into the dataset root — **byte-copy, never an edit** — with `rename (100%)` and both the git blob **and** the `sha256` identical on the two sides (`18d05965…`/`78df6c27…` · `e8fcabd5…`/`de0b579b…` · `a2331baf…`/`f435f8f5…` · `cb23369c…`/`524aadbc…` · `6e4b10d1…`/`afd6bc0e…`); the **root re-measure ran BEFORE any law edit** and reproduced the booking digit for digit (`par` 17/18/20/21/23 · `D_exec` 21.58139534883721/22.584/24.62/25.6046511627907/27.6046511627907 · `B` 1.5271317829457365/1.528/1.54/1.5348837209302326/1.5348837209302326 in band 5/5 · `T ≡ R ≡ 0` ×5 · `M` 4 ×5 · coverage 42/42 ×5 · `refusedThenEnteredTiles` 17 ×5 · all-OFF UNSATISFIABLE ×5 · press-then-cross 12/12 · 16/16 · 20/20 · 90/90 · 72/72). *(The law, in `@/core/solver/policy`)* `LessonObligation` gains `"act-2-batch-1"`, five lesson rows carry it (`switchRequired: "required"`, measured), six `gate-act2-*` codes join `POLICY_VIOLATION_CODES` with the shared route reader reused as **the same implementation**, and the pins are constants: `ACT_II_PAR_BAND [16,24]` · `ACT_II_EXEC_BAND [19.75,29.06]` · `ACT_II_B1_IDS` · **`ACT_II_B1_LADDER`** (a *registered* row set, not a derived rung) · `ACT_I_REGISTERED_PEAK_*` (20 / 24.729412) · `ACT_II_B1_PEAK_*` (25 / 27.604651) · `ACT_II_B1_PEAK_ADVANTAGE` 2.875239 · `ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC` 24.729412 · `ACT_II_B1_OPEN_RELIEF_*` (21 / 21.581395); `LAW_PRECISION` hoisted with comparison bytes unchanged. *(Both directions of the tautology trap refused by the same clause)* six `ActTailClause`s read by `actScaleLawReading()`/`actScaleTailGuards()` against **named pre/post-registration constants** with **injectable reading fields**: a silent **relabel** of Act I's basis or a **restamp** of the batch peak FAILs (`act-tail-act-i-peak-pin` · `-act-ii-peak-pin` · `-pre-r004a-standard`), and a validator demanding a cross-act **monotone rise** — which would have refused a registered rung — is refused in turn: `act-tail-l21-open-relief` is satisfied by the **named rung's registered value and the band, never the direction** (an in-band *rise* on the opening rung PASSes · the registered relief on the **wrong rung** FAILs by name · an out-of-band value FAILs by name), while §7's own words label the −3.148017 as a **plateau relaxation at a `ΔM = 0` boundary, never a dip** (`M = 4` on both acts, which is what makes it `ΔM = 0`). `act-peak` is a per-member gate **on the peak rung only**; dataset-level clauses use their own `ActTailClause` type and are deliberately **not** in `POLICY_VIOLATION_CODES`, so the `Record`/source-scan coupling is not stretched by a clause that is not a per-level gate. *(What did NOT move)* `BLOCK_L1619_IDS` still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at par 20 / 24.729412**, L20 **not re-stamped**, the five rungs **not grafted** onto the block, and the cut **frozen L1–L15 at 14.969697** re-derived on **25** files with basis ids `[1 … 15]` (`measureCut()` excludes both blocks). The ladder convention is the block's own — `--family=g --ladder=21,22,23,24,25 --dir=src/levels` — and **`--family=g` is required**: without it the identical ladder FAILs the block's `par-step`/`par-rung-exact` gates (the act's `Δpar` window is 7 wide, not 2). *(Evidence)* new `scripts/attest-r004a-act2.ts` + committed transcript, **exit 0 · `RESULT: REGISTERED-MATCH`** — byte identity 5/5 · the registered ladder re-measured from the root · the six clauses PASS with the **monotone-rise hypothesis FALSIFIED** · **6/6** tail controls CAUGHT by name · **7/7** member-gate controls caught with **0** act2 violations on the registered set — and its last section **executes** the prover rather than quoting it (`node node_modules/tsx/dist/cli.mjs`, so no npm-runner warning contaminates the transcript): **PASS (5/5 ACCEPT, 13/13 controls on every rung)**, `act-peak` DISCHARGED, headroom **1.455349**; two non-vacuity controls added (a relabeled basis is distinguished; an empty shelf makes the ladder exit 1). `attest-lv010-block` is **exit 0** and its regenerated transcript differs from the committed R-003d bytes in **exactly two lines** (the worktree path, and `root 25 files = 15 basis + 5 rungs + 5 Act II batch-1 rungs`) — the **L20-was-not-touched proof stated as a diff**. *(Acceptance)* `tsc` production-clean · `npm run levels` **25/25 ok · 0 errors · 88 warnings · 11/11 negative cases** · `solve-levels --audit` **25/25 PASS** (`parMatch` 25/25, one standing escalation `l008`) · sidecar regenerated to **25 records**, byte-stable on a second run · `vitest` **reported, not chased: 41 failed / 814 passed / 3 skipped (858)** across 10 failed files, **every** red row a count-, dataset- or `PINS`-derived pin. *(Cross-lane, named not taken)* `tests/**` is R-004c's — the verbatim broken-pin dossier with `file:line` and the **measured** new expectation is `src/levels/README.md` **§7c**, and the five §5.2 mirror rows written here are already green; the registry row (L1–L20 -> L1–L25) is GAME's. `src/levels/candidates/README.md` restated to the **EMPTY** shelf (booking -> `[]`, with the graduation table and both `tests/**` rows named), **no ceiling wording in either direction** (item 114). **No earlier row, weight, gate, band or shipped number moved.** Transcripts: `scripts/attest-r004a-act2.transcript.md`, `scripts/attest-lv010-block.transcript.md`. **Header resynced to V1.12** (it had been left at V1.10 across V1.11) | Level AI + Solver (R-004a) |
| 2026-10-17 | V1.13 | **LV-014 — Act II batch 2: the 3-pocket chained sub-lattice, five SHELF candidates at batch 1's pars, and a census that had to be fixed twice before it could be trusted.** New **§8.19**. *(The device)* §6.2.3's sealed landing **one pocket deeper** — `P` (walk-sealed landing, exit `d1`) · `R2` · `R3` · the goal's own seal `d4`, with the forced order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4` a property of the board: `src/levels/candidates/l026.json`–`l030.json`, **unregistered**, pars **17 / 18 / 20 / 21 / 23**, `D_exec` **21.560241 / 22.560241 / 24.548193 / 25.548193 / 27.566265**, `B` **1.5201 / 1.5201 / 1.5161 / 1.5161 / 1.5221**, coverage **42/42 ×5**, `T ≡ R ≡ 0 ×5`, all-OFF **UNSATISFIABLE ×5**, press-then-cross **60/60 · 24/24 · 12/12 · 72/72 · 12/12** (the **whole 4-press chain on every shortest route**), `noUnrecoverableOk` + `unrecoverableStates 0` + `deadStates 0` **×5**. *(The published rule, written before the run)* batch 1 *searched* its par set; batch 2 **mirrors** it — rung *i*'s par is `ACT_II_B1_LADDER[i].par`, **read from the law constant, never typed** — so the batch's one variable is the chain length (3 → 4 presses) and the equal-par measurement is readable: `ΔD_exec` **−0.021154 / −0.023759 / −0.071807 / −0.056458 / −0.038386** against each rung's batch-1 comparator (`ΔB` ≤ 0.0239), i.e. **one extra door in the ordered chain costs under 0.072 `D_exec` at fixed par**. Two clauses go with it: **no rising-`D_exec` obligation** (§7.3 interior freedom; the ladder rises anyway and that is printed as an *observation*, not a clause) and **no promotion** — at par 23 the within-par minimum lands **below** the registered Act II peak (`27.560241 < 27.604651`), so a shelf file asks no registration train to move a registered maximum; the class's own **27.746988** at that par is published as a *measurement* and left unselected. The selector also prints its **skips**: the raw par-23 minimum was refused by the rung-key-**distinct** clause, and `27.566265` is the par's minimum among rows whose key is still free (`mirror note` line, counted, never silent). *(Two instrument failures, caught by their own counters)* (1) the first published shape filter — "≥ 1 `d3` tile adjacent to an `R2` tile" — is **unsatisfiable by the seal law** (`R2`'s boundary *is* `d2`, so every tile adjacent to `R2` from outside is a `d2` tile and is out of `R3`'s pool); it is published **inverted** with a counter that reads **0 of 2640** — 0 *by law*, which is the point, and a non-zero reading would mean the seal law broke. (2) a **2-tile-minimum `R3` enumeration is empty at `CX = 2`** (0 sealed `R3` of 8712 over 374 sealed `R2` sets), which was an artifact of `roomCandidates` excluding **singletons** — a 1-tile walk-sealed room is legal (its boundary is single-phase by construction, and the shipped device already uses one: the goal's own seal). With `chainRoomCandidates` admitting singletons the class is non-empty; the frame law is measured, not assumed (`H = 7` pushes `par` out of band, `CX = 3` yields **0** judged). *(The singleton is not a trap — proved by the rule and by the Solver)* `applyMove` step 3 reads `switchAt(level, s.phase, player)` with the **entry** phase and the **post-move** position and step 5 recomputes doors **absolutely** from `(color, phase, switchesOn)`, so an in-room press fires on the entering move and leaves the seal open in the flipped phase; and the general question is answered by `noUnrecoverableOk = true / unrecoverableStates = 0` on **5/5** — no reachable state of this batch is stuck. *(Semantics preservation, re-measured after every tool edit)* the batch-1 path returns the **identical** class: `--batch=2 --pockets=2 --cx=2 --pocketsize=4 --qmax=4 --cap=200` → **2208 accepts of 9570 judged**, identical rejection histogram (`unsolvable` 4004 · `g5-identity-broken` 1864 · `par-out-of-band` 1494), identical upstream skips and par census; the single generalization (`g3-ordered-multi-press`: `minPresses ≥ 2` → `≥ ctx.presses.length`) is the same requirement at 3 presses and measured as `chain = n/n` on every accept. *(The census, complete)* `--paircap=40 --budget=8000` → `devices walked 440/440 · 40-pair cap hit on **0** · budget **not reached**`: **396 accepts of 2640 judged over 264 distinct (`R2`,`R3`) pairs** — an **exact** count for the enumerated class, with the complete refusal ledger (`par-out-of-band` 1178 · `g5-identity-broken` 538 · `unsolvable` 528), the full upstream skip counters, and the accept pool by par **17:24 · 18:28 · 19:36 · 20:38 · 21:70 · 22:94 · 23:106**; the band is a **filter, not a truncation** (the par census prints the out-of-band members too). What it still does **not** buy: a ceiling in either direction — the class is the enumerated one. *(Evidence)* `prove-candidate --family=g --ladder=26,27,28,29,30 --dir=src/levels/candidates` **exit 0 · PASS 5/5**; `--measure-controls` **exit 0** with **13/13** controls caught, the seven family-`g` ones **by name**; `--peak=28.5` → **exit 1 · FAIL 4/5**, failing **exactly the peak rung** (`act-peak`: 27.566265 vs 28.500000, Δ −0.933735) — the R-004a falsification shape; `act-peak` **DISCHARGED** on the real constants (Δ **+2.836853**), headroom **1.493735**. *(Acceptance)* `tsc` **0** · `npm run levels` **25/25 ok · 0 errors · 88 warnings · 11/11 negative cases, PASS** (the shelf is invisible to every shipped-set census, so the dataset stays **25** and the sidecar is **not** regenerated) · `solve-levels --audit src/levels/candidates` **5/5 PASS** (`parMatch`/`switchRequired`/`noUnrecoverableOk` 5/5, `deadStates` 0) · `vitest` **1 failed / 859 passed / 3 skipped (863) across 37 files**, the single red **booked by name**: `tests/solver/l16-l20-candidates.test.ts:174` (literal `:161`) → `expected [ 'l026.json' … 'l030.json' ] to deeply equal []`, which is QA-018's **live guard catching an unregistered extra**, green only when a registration ticket moves the bytes **and** re-books the literal. *(Cross-lane, named not taken)* `tests/**` (the pin and its re-booking) is QA's; the L26–L30 registry row (`src/game/levels/level-registry.ts`) is GAME's and is **not** touched — an unregistered shelf file must not be playable. The optional **≥ 11 `--pocketsize`** probe is **DEFERRED with its scope stated**: ≤ 10 is closed by measurement, **≥ 11 remains unmeasured**, no ceiling wording either direction. **No root level, core-law file, weight, gate, band, `EXPECTED_LEVEL_COUNT` or registered ceiling moved.** Transcripts: `scripts/author-l2630.transcript.md`, `scripts/prove-candidate-l2630.transcript.md`. **Header resynced to V1.13** | Level AI + Solver (LV-014) |
| 2026-10-17 | V1.14 | **LV-015 — Act II batch 3: the 4-pocket chain, §7.8's par-24 obligation measured before anything was built, and three INSTRUMENT findings published before any tool was touched.** New **§8.20**. *(The batch)* `src/levels/candidates/l031.json`–`l035.json`, **unregistered**, pars **19 / 22 / 22 / 24 / 24**, `D_exec` **23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426**, `B` **1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465**, coverage **42/42 ×5**, `T ≡ R ≡ 0 ×5`, `M` 4 ×5, all-OFF **UNSATISFIABLE ×5**, press-then-cross **30/30 · 6/6 · 30/30 · 12/12 · 160/160** (the whole chain on every shortest route) — the forced **5-press** chain `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5` on §7.4's `pocket count 1–4` axis taken to its **4-pocket** member, frame **`CX = 1`** (7 × 6, far region 5 × 6). *(The census, before the bytes)* commit `3f460b6` publishes the selection rule + device **git-dated ahead of any census or byte** (own par set **derived** from §7.8 item 4's anti-mirror clause `{16,19,22,24}` = Act II's band minus `ACT_II_B1_LADDER`; `CLOSE` = the max unused par supported, repeated at the last two rungs; one published tie-break departure — the last rung takes the within-par **maximum** so §7.3.2's maximum lands late; an **act-close REFUSAL instead of padding/substitution**, never a par swap; the §7.3.1 relief label in published form before `--write`). `6f3b25b` is the dossier, `b35cdc8` the five bytes. **STEP 1 — §7.8 item 3's "`par 24` is in-band but unmeasured" is now MEASURED in both fenced families:** 3-pocket (batch 2's device) at band `[24,24]` → **130 accepts of 2640 judged over 264 (`R2`,`R3`) pairs**, an **exact** count (no cap hit, budget not reached), `202` tuples at `par 24` (= the `24:202` row batch 2 printed as out-of-band) with `D_exec ∈ [28.560241, 28.771084] ⊂ [27.7500, 29.0625]` (**≥ +0.955590** above the registered peak); 4-pocket at `CX = 2` → **0 of 0 judged** (empty by arithmetic: `440/440` devices walked, 0 cap hits, budget not reached, `16280 sealed R4 set(s)`) and at the published `7×7` frame → **0 of 0 judged** too (`598/598`, `111436` sealed R4); the first open frame, `CX = 1` → **69 accepts of 8000 judged over 477 groups** at `par 24` `28.058108 … 28.339426`, reported as a **FLOOR** (`62/260` devices, 40-group cap on 7, budget **HIT**); and `--stage=roomcap --maxsize=4` measures the frame's disjoint-room capacity (**6 / 4 / 4 / 6**) beside the emptiness rather than arguing from it — the 5-door device needs four sealed rooms *plus* the goal's seal *plus* a free-banded `s2` tile, so the **frame**, not a filter, closes `CX = 2`. **STEP 1b verdict: NON-EMPTY ⇒ GO**, the STOP branch does not fire, and §7.8 item 3's published fallback `par 23` / **27.746988** (+0.142337, the **§7.3.3 C path with its own ADR**) stays **unused, unselected, undecided** — the Game Designer's call. *(STEP 2)* the full band on the batch's own frame: **498 accepts of 20000 judged over 1152 groups** (a **floor**; `114/260` devices, 10 cap hits, budget **HIT**), refusals `g5-identity-broken: 720` = the in-band gate refusals, so **every** in-band refusal is the device's own identity law; derived set `[19, 22, 24]` supported, **`par 16` ABSENT and never substituted**, multiset **`[19, 22, 22, 24, 24]`**, **0 rungs sharing a par with batch 1** (and none with batch 2's `17/18/20/21/23`); the selectors' skips are printed (**2** lower-`D_exec` rows refused at `par 22`, **12** at `par 24` by the rung-key-wide distinct clause; L35 takes the par's **maximum** `28.339426` vs its minimum `28.058108`). *(The proof)* `prove-candidate --family=g --ladder=31,32,33,34,35 --dir=src/levels/candidates` **exit 0 · LADDER RESULT: PASS (5/5, controls named: 65/65)** — every rung **20 gates / 20 `ok` / 0 `FAIL`**, `13/13` controls, `T ≡ R ≡ 0`, all-OFF UNSATISFIABLE, coverage 42/42, `deadStates 0`, five walk-sealed rooms re-derived from the bytes, one shared press order with staged-world forcing FALSE on all four drops, the census identity broken. *(The act clauses, on the shelf)* **`act-close` DISCHARGED and carried by the batch's LAST rung**: `28.339426 > 27.604651` = **+0.734775**, internal tail also rising (`+0.212483`), inside §7.8 item 2's window with **+0.589426** of margin, `par 24`'s `B` **in band**; `act-peak` Δ **+3.610014** vs Act I's `24.729412`, headroom **0.720574**. *(The relief)* the **§7.3.1 `batch-seam` label for L30→L31** was published **before `--write`**: Δpar **−4**, 3·ΔB **−0.362098**, **ΔD_exec −4.362098**, band `[19.75, 29.06]` — an **interior relaxation at a `ΔM = 0` boundary, execution axis only, never a dip and never a felt-ease claim** (§6's dip law does not fire), discharging no clause, with the felt half left a **labelled Playtest hypothesis** (`NOT TESTABLE, n = 0`) and the drop named as an artifact of the anti-mirror par derivation plus the deeper device's **lower `B` centre** (`1.3500…1.4465`). The equal-par pairs **rise** (+0.019191 / +0.212483), so no interior label is owed anywhere else. *(Falsifications)* `--peak=28.5` → **exit 1 · FAIL 4/5**, failing **exactly one gate on exactly one rung** (`act-peak` on **L35**, Δ −0.160574); `--measure-controls` → **65 measured / 35 lines naming a gate / 0 accepted**. *(Three INSTRUMENT findings, FINDING-FIRST at `8e05f2d` before any tool byte moved)* the first proving run **failed** (`3/5 ACCEPT`, L34/L35 REJECTED on `act2-par-band`, L31 `12/13` controls): **F-L31-1** `prove-candidate.ts:239` tested the band **strict at both ends** while the constant, `inParBand`, `author-l21.ts`'s four call sites, §7.2's `4–20` table with registered L20, and §7.8 items 2–3 are all **inclusive** — settled by the arithmetic the law itself uses (`29.06 = 24 + 3·1.6875`; the strict form's `28.0625` is *not* the published band, so §7.8's mandate would be unbuildable), dated by `git log -S` to **`849b6d4` (LV-012, 14:36)**, ~7.5 h before GD-010 published the obligation, never exercised because every recorded Act II rung is 17–23; **F-L31-2** the ladder summary's **"every control caught on every rung" was a string literal** (`:1301`), printed even when controls MISSED — and its own `--measure-controls` receipt then caught the **second half in the fix for the first** (the expectation pass asserts nothing, so the new line printed `controls named: 0/65 …`; now `controls MEASURED, not asserted (F-L16-3 expectation pass)`); **F-L31-3** the `g3` goal-seal-drop control **MISSED on L31 only** — measured first: the mutated board is still **REFUSED 5/5**, naming `par-stamped`/`validator`/`g2`/`g6` on 5/5, but on L31 the four remaining presses are still legitimately forced and ordered, so `g3-ordered-chain` *should* pass — renamed to its measured meaning with `mustFire` → **`g6-room-structure`** (5/5 on this device) per **F-L16-3 / F-L20-4**, battery not relaxed; `g3` is still named on 5/5 rungs by other controls. *(The corrigenda A/B'd, not argued)* the pre-fix prover was extracted from `HEAD` (temp file, never committed) and both versions ran the same ladders: **root L21–L25 and shelf l026–l030 → 5/5 ACCEPT, 13/13 each, 65 CAUGHT / 0 MISSED, PASS both sides**, status surface differing in **exactly one line per set** (the F-L31-2 literal replaced by the computed `controls named: 65/65 across the 5 rung(s)`), the honest residue named (a *mutated* board landing on a band endpoint drops `act2-par-band` from its refusal list while staying CAUGHT by its other gates) and **no control changing `CAUGHT`/`MISSED`**; `tsc` clean post-fix; the sequence `3f460b6 → 6f3b25b → b35cdc8 → 8e05f2d → f1b6fb6 → c2b65ae` is checkable in `git log -p` and none of it can be back-dated. *(Acceptance)* `tsc` **0** · `solve-levels --audit src/levels/candidates` **10/10 PASS** with `par` verified from the solver **10/10** · `npm run levels` **25/25 ok · 0 errors · 88 warnings · 11/11 negative cases — UNCHANGED** (the shelf is invisible to every shipped-set census) · sidecar **25 records, untouched**, and root level files **`git diff` empty vs `ef643f7`** · **clone guard 26 distinct keys, 0 collisions, 0 of 498 accepts refused** · `vitest` **1 failed / 859 passed / 3 skipped (863) across 37 files**, the single red **booked by name**: `tests/solver/l16-l20-candidates.test.ts:174:19` (`expected [ 'l026.json', …(10) ] to deeply equal []`, literal at `:161`) — QA-025's re-book (`9be894d`) landed on `develop` *after* this branch was cut, so **merging batch 3 needs the booking extended to `l026`–`l035`**; `tests/**` is QA's and is **reported, not edited**. *(Two escalations with revert paths, not decisions)* **F-L31-1**: if the band is ruled **open** at its ends, revert one line and `L34`/`L35` stay REJECTED — the act closes only via `par 23` / `27.746988` (+0.142337) and the **C path with its own ADR**. **F-L31-3**: a control that fires on *every* shape needs a device with a **redundant switch** (not-fully-forced chain) — a design question, handed over. **`--pocketsize ≥ 11` stays DEFERRED** (`≤ 10` closed by measurement, `≥ 11` unmeasured, **no ceiling wording either direction**). Cross-lane: registry row (**GAME**), `tests/**` re-book (**QA**), §7.8 item 6's §7.6 stratum assignment before registry (**QA**). **No root level, core-law file, weight, gate, band, `EXPECTED_LEVEL_COUNT` or registered ceiling moved.** Transcripts: `scripts/author-l3135.transcript.md`, `scripts/prove-candidate-l3135.transcript.md`. **Header resynced to V1.14** | Level AI + Solver (LV-015) |
