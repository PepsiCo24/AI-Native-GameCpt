# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Level AI + Solver** with **Orchestrator** (formatting maintenance by Docs + GitHub; content belongs to the owners)
> Version: V1.1 · Date: 2026-10-16

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

### 8.11 Sibling records

The **player-facing** half of this record — which painter seam each new object needs, and what
the block must *read* as on screen before it may be registered — belongs to `docs/ui-ux.md`
(UI / Art Director) and is quoted, never restated, here. The design law is
`docs/decisions/design-0003-l1215-block-law.md`; the dataset's own per-level derivations are
`src/levels/README.md` §2d.

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
