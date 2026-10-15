# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Level AI + Solver** with **Orchestrator** (formatting maintenance by Docs + GitHub; content belongs to the owners)
> Version: V0.7 · Date: 2026-10-15

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
diagnostics: bRaw · forcedMoveRatio · lookaheadDepth · unrecoverableRatio · reachableStates
```

Weights are **calibrated from real playtest data**, never hard-frozen. As of **LV-007B
item 3** every term is *measured* — the gap `docs/level-difficulty.md` §5.1 recorded as open
(`B` effective, `T`, `R`, and therefore `D`) is closed by §5.2 there, with the definitions
pinned in its §2a. Two facts from that measurement belong in the pipeline's own record:
inside the `docs/level-design.md` §4 acceptance region `T ≡ 0` **and** `R ≡ 0` (so
`D = L + 3·B + 5·M` for any shippable level and `w3`/`w4` are inert), and the L5→L6
block-opening dip §3 asks for is measured **+8.53** on `D` instead of −2…−3 — a weight /
definition question for the Game Designer, reported as-is, never tuned away here.

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

- Level generation is **seeded** and scripted. The committed, re-runnable scripts are `scripts/validate-levels.ts` (schema/rule gate + 10 negative self-tests), `scripts/solve-levels.ts` (BFS proof, `par`, metrics, policy, gates) and `scripts/author-lv006-candidates.ts` (the L6–L10 doors+switch families, fixed `SEED`, no clock / network / filesystem writes, byte-identical output on every run — see §8.6). A **bulk** multi-block generator does not exist yet; the L11–L20 portals block is where it will be needed, and until it is written this section must not cite a script that is not in the repository (`scripts/generate-levels` was cited here and in `docs/architecture.md` — the latter is the Architect's file, so correcting it there is an OPEN_QUESTION in the LV-007B handoff, not an edit made by this role).
- Every accepted level stores its generation metadata (model role, seed, prompt version, solver metrics).
- Rejected candidates are archived too — the failures are part of the evidence. The LV-006 generator prints its rejects and **fails** if any of its three negative probes is accepted.

## 8. The level-pipeline record — LV-006 (the L6–L10 unit) → LV-007B (2026-10-15)

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
   (`@/core/solver/policy` `DOCUMENTED_LESSONS`, L1–L10) is checked against the metrics:
   phantom walk FORCED (l005) / OFFERED (l004), latch dynamism on L6–L10, the documented
   `switchRequired` obligation (L7–L10, with L6's dip recorded on its row as `"exempt"` —
   §8.5), and the named Aha #1 gates of §3 on L8 — measured conditions (i)(ii)(iii) plus,
   since LV-007A, the §3 **construction** bullets as gates (v) `single-door-one-switch-funnel`
   and (vi) `aha-par-cap` (`par ≤ 8`). The suite fails if a ladder level has no
   documented-lesson row, so the table cannot drift from the dataset.

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
content: on the ten levels both forms report identical tile lists (1 / 1 / 1 / 2 / 1 on
L6–L10), so no gate verdict moved (the CLI's per-level metric lines are byte-identical
across the switch; the l008 gate (iii) line changed only in its wording), while on 2000
seeded single-door-single-switch boards 46 diverge (44 of them because the door tile *is*
the switch tile). The companion's **promotion trigger** beyond gate (iii) is
ADR-architecture-0002's: it MUST land as the gate before the first **L11+ portal
candidate** is accepted (teleport edges make trapped refusals more likely), and SHOULD be
promoted wherever a candidate first diverges.

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
node_modules/.bin/tsx scripts/solve-levels.ts              # 10/10 PASS, per-level metrics + gates
node_modules/.bin/tsx scripts/validate-levels.ts           # schema/rule gate + 10 negative cases
node_modules/.bin/vitest run                               # incl. tests/solver/latch-gates.test.ts
```

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
   `docs/level-difficulty.md` §2a / §5.2.
4. **n-13 · a policy code for M3 content no door reads** — `switch-without-targets`, its own
   negative control, and the validator-warning-vs-policy-rejection layering: §8.4 law 1.

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