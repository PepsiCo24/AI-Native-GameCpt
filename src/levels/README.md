# `src/levels/` — level data set (M0 ladder L1–L5 + M1+M3 unit L6–L10)

> Owner: **Level AI + Solver** (AGENTS.md §4). Design intent: **Game Designer** (`docs/level-design.md` §1–§3).
> Status: **schema-validated AND solver-proven** — `scripts/solve-levels.ts` reports `10/10 PASS`, `par` == the solver's `shortestSolution` on 10/10, 0 dead states, 0 unrecoverable states, and the level policy (`@/core/solver/policy`) reports 0 violations on 10/10.
> Metrics: the `docs/level-difficulty.md` §2 model is now **measured** for this block (`B` effective, `T`, `R`, `D` — §5.2 there, definitions in §2a); the route walk and the ordered latch companion are printed by the solver CLI (§0b).
> Board cap: **≤ 7 × 7** (`docs/ui-ux.md` R-L2). L1–L5 are **M0 only**; L6–L10 add **M1 doors + M3 switches** and still use **no portals** (ADR-0009 schedules M2 at L11).
> The `par` values below started as manual hypotheses (§2) and are now **solver-verified**; the hand derivations are kept because they explain *why* each number is the floor.

## 0. What is in here

| File | id | grid | walls (A / B) | doors / switches | `par` (solver-verified) | documented lesson |
|---|---|---|---|---|---|---|
| `l001.json` | 1 | 5 × 3 | — / — | — / — | 4 | literacy: tap → move, the world flashes |
| `l002.json` | 2 | 4 × 4 | — / — | — / — | 5 | literacy: the flip happens because I moved |
| `l003.json` | 3 | 5 × 3 | `(3,1)` / — | — / — | 6 | first refusal: a permanent (parity-dead) wall |
| `l004.json` | 4 | 5 × 4 | `(3,1)` / `(2,0)` | — / — | 6 | phantom walk **offered** (3 of 6 shortest routes embed) |
| `l005.json` | 5 | 5 × 4 | `(3,1)`, `(4,0)` / `(4,2)` | — / — | 6 | phantom walk **forced** (3 of 3 shortest routes embed) |
| `l006.json` | 6 | 5 × 3 | — / — | `d1` blue `(3,1)` / `s1` `(1,1)` A → `d1` | 4 | **M1+M3 debut**: the latch on the natural path (block-opening dip) |
| `l007.json` | 7 | 3 × 3 | `(2,0)`, `(2,2)` / — | `d1` blue `(1,1)` / `s1` `(0,0)` A → `d1` | 4 | the detour: I leave the line to change the world |
| `l008.json` | 8 | 5 × 4 | `(4,0)`, `(4,2)` / — | `d1` blue `(3,1)` / `s1` `(2,0)` A → `d1` | 6 | **Aha #1**: the door that refused the greedy line opens |
| `l009.json` | 9 | 5 × 5 | `(2,1)`, `(2,3)`, `(3,0)` / `(2,0)`, `(2,4)` | `d1` red `(2,2)`, `d2` blue `(4,1)` / `s1` `(0,1)` A → `d1`, `s2` `(3,1)` B → `d2` | 8 | two doors + two switches: `s2` sits **behind** `d1` (ordered plan) |
| `l010.json` | 10 | 6 × 4 | `(1,2)` / `(5,0)`, `(5,2)` | `d1` red `(4,1)` / `s1` `(2,3)` B → `d1` | 9 | gate check: permanent M0 geometry + phantom walk + latch, planned together |

### 0b. Measured solver facts (2026-10-15, LV-006 · obligations re-pinned by LV-007A)

`node_modules/.bin/tsx scripts/solve-levels.ts` prints these per run; `docs/level-difficulty.md` §5.1 holds the full table.

| id | shortest | reachable states | `refusedThenEnteredTiles` | `dualPhaseTiles` | `parRoutes` / `embedRoutes` | switch required | Aha gates |
|---|---|---|---|---|---|---|---|
| 6 | 4 | 29 | 1 `[3,1]` | 0 | 1 / 1 | **no** (dip: un-switched world solves in 6 — documented `switchRequired: "exempt"`) | — |
| 7 | 4 | 12 | 1 `[1,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 8 | 6 | 34 | 1 `[3,1]` | 0 | 6 / 6 | yes (**obligation**) | (i)(ii)(iii) PASS · (iv) UNSATISFIABLE before L11 · (v)(vi) PASS (§4) |
| 9 | 8 | 58 | 2 `[2,2] [4,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 10 | 9 | 42 | 1 `[4,1]` | 0 | 36 / 36 | yes (**obligation**) | — |

- **The `switch required` column is an obligation, not a note** (LV-007A, OQ4 ruling): `@/core/solver/policy` reads it from the lesson row (`DOCUMENTED_LESSONS[].switchRequired`) and rejects a level documented as a load-bearing latch whose goal is still reachable with every switch OFF — code `lesson-switch-required`. **L6 is the only level exempt** (an explicit `"exempt"` row backed by the §6 dip, with the measured `allOffGoalReachable = true`), and the check never reads a level id, so relabelling L6's board as L7 is rejected while the shipped `l006.json` stays clean.

- **Four more lines per level since LV-007B/007C** (§0b's table intentionally stays the LV-006 facts; these are the new program outputs):
  - `routeWalk=<dfs> + <lookahead> work units (budget=…) prunedChildren=…` — the cost of enumerating *every* shortest route, on the walk's **own** budget key (`maxRouteVisits`, default 2 000 000). Before LV-007B item 1 the walk read the *exploration* cap (`maxStates`), so raising the state limit silently changed route enumeration; an overrun now raises instead of silently truncating the route set. See `docs/ai-native-pipeline.md` §8.7.
  - `refusedBeforeEnteredTiles=… tiles=[…]` — the **ordered** companion of the `refusedThenEnteredTiles` column above (same tile refused strictly before it is accepted, on one real path). It is the reader of **gate (iii)** since **LV-007C** (the code half of GD-008's re-wording of `docs/level-design.md` §3 (iii): the Aha's own sentence is ordered — "refused *first*, entered *later*"), where a trapped refusal — `refusedThenEnteredTiles > 0` but `refusedBeforeEnteredTiles = 0`, a beat no player can witness — is now rejected by name (`gate-refused-then-entered`, control: `tests/solver/policy-negative-controls.test.ts`). The `lesson-latch-dynamism` check and the pre-L11 acceptance law still read the *unordered* canonical metric (ADR-architecture-0002 decision 4 / Appendix A3; `docs/ai-native-pipeline.md` §8.5) — the two legs of the split are deliberately **not** re-stitched. On L6–L10 both forms report the same tile lists, so the switch moves no verdict on this set.
  - `difficulty D=… = 1·L + 3·B + 4·T + 2·R + 5·M` + `difficultyDiagnostics …` + `difficultyExec Dexec=… = D − 5·M = 1·L + 3·B + 4·T + 2·R` — the `docs/level-difficulty.md` §2 model with its **provisional** weights (printed next to the number on purpose) and its **execution axis** (§2b, ADR-design-0001 — the axis `docs/level-design.md` §6's dip law lives on), printed in both forms so the identity is checked by the reader. Inside `docs/level-design.md` §4 the `4·T` and `2·R` terms are provably 0 on every shipped level, so `Dexec = L + 3·B` there.

- **Validation is proven** for all ten: `node scripts/validate-levels.ts` → `10/10 level files ok`, exit code 0 (negative self-tests 10/10 rejected by name).
- **Solvability, `par` and the level policy are proven** for all ten: `node_modules/.bin/tsx scripts/solve-levels.ts` → `10/10 PASS`, `RESULT: PASS` (plus one ESCALATION, §4).
- The hand derivations in §2 (L1–L5, written before the solver existed) and §2b (L6–L10) are kept as the *reason* each `par` is the floor. Where a hand derivation and the solver disagreed, the level file was re-authored — never the number.
- Supplementary, *informal* evidence (kept deliberately **out of the repo**): the original throwaway BFS that first agreed with all five L1–L5 `par` values (4 / 5 / 6 / 6 / 6). It has been superseded by `scripts/solve-levels.ts`, which is the deliverable and the evidence.

## 1. Running the gate

```bash
node_modules/.bin/tsx scripts/validate-levels.ts      # schema/rule gate + 10 negative self-tests
node_modules/.bin/tsx scripts/solve-levels.ts         # BFS: solvable, par, dead states, metrics, policy, gates
node_modules/.bin/tsx scripts/author-lv006-candidates.ts   # L6-L10 families: accept/reject + negative probes
node_modules/.bin/tsx scripts/validate-levels.ts <other-levels-dir>   # or LEVELS_DIR=…
```

`tsx` is a dev dependency of this workspace (`package.json`), so both gates run without a build step. `scripts/validate-levels.ts` additionally documents that it can run under Node's native type stripping. Exit code is **non-zero** if any level fails, if a negative self-test is wrongly accepted, or if two level files share an `id`. Failing levels are **rejected, never auto-repaired** (ADR-0004). `scripts/solve-levels.ts` also exits non-zero on a policy violation (`@/core/solver/policy` — the inventory is `POLICY_VIOLATION_CODES`, with one negative control per code in `tests/solver/policy-negative-controls.test.ts`: disabling any one check turns the suite RED), on a `par` mismatch, on a dead/unrecoverable state, or on a FAILing named gate; a gate that is *unsatisfiable as written* (only `dual-phase-tiles`, before L11 — pinned as the single legitimate escalation channel) is printed under ESCALATIONS (§4) instead of being counted as a pass.

The policy layer checks both content laws and the ladder's documented lessons, including the **`switchRequired` obligation on L7–L10** (`lesson-switch-required`) and the **§3 Aha construction bullets** as named gates (v) `single-door-one-switch-funnel` and (vi) `aha-par-cap`; `docs/ai-native-pipeline.md` §8.3–§8.5 is the record. Because **M1 never ships alone**, the mirror is enforced here too: a `switches[]` entry with an empty `targets` list is rejected as `switch-without-targets` (LV-007B n-13). Such a switch really *does* toggle — `applyMove` flips `switchesOn` regardless of targets — so the firing check cannot see it; what is wrong is that no door reads it. The frozen validator only **warns** about that shape, and a warning is not a gate (`src/core/level/**` is the schema layer and was deliberately not touched).

## 2. Per-level manual derivation (hypothesis, for SOLVER-001 to falsify)

Rules used below (ADR-0008, Option B): a move is legal iff the destination is in bounds and non-solid **in the current phase at entry**; an illegal move changes nothing (no movement, **no flip**); after a legal move the phase flips; the goal is won on arrival regardless of phase.

Two derived facts I use throughout (proved in §3):

- **F1 — arrival parity.** With `startPhase = "A"`, move *n* is played in phase **A if n is odd, B if n is even**.
- **F2 — enterability is route-independent.** Arrival at tile `c` always happens on a move number `n ≡ d(c) (mod 2)`, where `d(c)` is the Manhattan distance from `player`. Therefore a `phaseAWalls` tile is enterable **iff `d` is even**, a `phaseBWalls` tile **iff `d` is odd** — and a tile can never be "refused first, then entered later".

### L1 — `l001.json` · tap → move, the world flashes (5 × 3, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,1)` | A | B |
| 2 | `(2,1)` | B | A |
| 3 | `(3,1)` | A | B |
| 4 | `(4,1)` **goal** | B | A → win |

- Enterable windows: every tile is non-wall in both phases, so every tile is enterable on every parity. The goal is enterable on both parities by design (ADR-0008 rule 7).
- `par = 4` = `d(goal)`; the row is the only 4-move route, so 4 is the floor.
- **If a tile here were made solid in BOTH phases:** `(1,1)`, `(2,1)` or `(3,1)` each cut the only 4-route, and the goal stays reachable via row 0/2 at **6** moves, so `par` would become 6 (verified by brute force: all three single-tile dual variants give exactly 6). The level would stop being "the flip is harmless", which is the point of L1 — a dual wall must not be added here.

### L2 — `l002.json` · "the flip happens because *I* moved" (4 × 4, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,0)` | A | B |
| 2 | `(2,0)` | B | A |
| 3 | `(3,0)` | A | B |
| 4 | `(3,1)` | B | A |
| 5 | `(3,2)` **goal** | A | B → win |

- `par = 5` = `d(goal)`; the board is open, so the player has many 5-move routes and the world alternates in lockstep with their taps.
- **If a tile here were made solid in BOTH phases:** a single dual tile never changes this `par` — e.g. `(3,1)` dual still leaves the 5-move route `(1,0)→(2,0)→(2,1)→(2,2)→(3,2)`. Brute force over all 14 non-endpoint tiles confirms it: **no** single dual tile changes `par = 5`. That is exactly why L2 must stay empty: a dual wall here would silently teach "walls", not "causality".

### L3 — `l003.json` · the first "no": a **current-phase** wall refuses the tap (5 × 3, `phaseAWalls = [(3,1)]`)

`d(3,1) = 3` (odd). By F2 a `phaseAWalls` tile needs an **even** arrival, so `(3,1)` is **never enterable** — it is a permanent obstacle that only *looks* like a parity gate.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — `(3,1)` is solid in A: no movement, **no flip**, still phase A |
| 3′ | `(2,0)` (the detour) | A | legal → phase B |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)` — **never** (see above). Its *ghost* state (phase B) is visible but unreachable: any arrival there is an odd move, i.e. a phase-A move.
- `par = 6`: the 4-move straight line is cut, and the only other routes go through row 0 or row 2 (both 6).
- **If `(3,1)` were made solid in BOTH phases: nothing changes at all** — the level is byte-for-byte equivalent in behaviour, because a parity-mismatched phase wall already is a dual wall. This is the load-bearing observation of §3.

### L4 — `l004.json` · the other face of a wall: a tile that is solid in phase B is *passable while it is A* (5 × 4, `phaseAWalls = [(3,1)]`, `phaseBWalls = [(2,0)]`)

`d(3,1) = 3` → never enterable (as in L3). `d(2,0) = 3` (odd) → a `phaseBWalls` tile needs an **odd** arrival, so `(2,0)` **is** enterable — on odd moves, while the current phase is A, where it renders as a passable echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip |
| 3′ | `(2,0)` (row 0 detour) | A | legal — the tile is **solid in B only**, so it is *passable now*; after the flip to B the player stands **inside** a solid tile (legal and safe, ADR-0008 rule 3) |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

The alternative 6-move detour `(0,2)→(1,2)→(2,2)→(3,2)→(4,2)→(4,1)` avoids `(2,0)` entirely, so the ghost crossing is offered, not forced.

- Enterable windows: `(3,1)` — never. `(2,0)` — odd moves (3, 5, 7 …) while phase A is current; in this level the first reachable entry is move 3.
- `par = 6`: 4 moves is impossible (the straight line is cut at `(3,1)`, and every 4-move route *is* the straight line); 6 is achieved.
- **If `(2,0)` were made solid in BOTH phases:** the row-0 corridor is severed at `(2,0)` — the "walk through a wall" beat disappears — but the row-2 route still solves in 6, so `par` is unchanged and the level stays solvable. The *teaching* content of L4 is what is lost, not the solution.
- **If `(3,1)` were made solid in BOTH phases:** no change (as in L3).
- ⚠ **Blocked intent (see §4):** `docs/level-design.md` §2 asks this tile to be "the wall that said no, gone after I move". Under ADR-0008 that is unreachable — L4 as specified has no legal implementation in M0.

### L5 — `l005.json` · the goal line is reached only **through** a wall that is a ghost right now (5 × 4, `phaseAWalls = [(3,1), (4,0)]`, `phaseBWalls = [(4,2)]`)

`d(3,1) = 3`, `d(4,0) = 5`, `d(4,2) = 5` — all odd. `(3,1)` and `(4,0)` are `phaseAWalls` (need even arrivals) → **never enterable**. `(4,2)` is `phaseBWalls` (needs odd arrivals) → **enterable on odd moves**, i.e. while phase A is current, where it renders as an echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip (the greedy straight line dies here, one tile before the goal column) |
| 3′ | `(2,2)` (the side step) | A | legal → phase B |
| 4 | `(3,2)` | B | legal → phase A |
| 5 | `(4,2)` | A | legal — solid in **B** only, so it is passable *now*; after the flip the player stands inside it (embedded, legal) |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)`, `(4,0)` — never. `(4,2)` — odd moves (3, 5, 7 …); earliest reachable entry is move 5.
- The goal's neighbours are `(3,1)`, `(4,0)` and `(4,2)` only; the first two are never enterable, so **every** solution must enter through the echo `(4,2)`.
- `par = 6`: 4 is impossible (the straight line is refused at `(3,1)`, and the goal cannot be reached from `(3,1)` or `(4,0)` in any case); 6 is achieved.
- **If `(4,2)` were made solid in BOTH phases: the level becomes UNSOLVABLE** — all three goal approaches are then permanently solid. This is the clearest evidence in the set that a parity-matched wall is load-bearing content, not decoration.
- **If `(3,1)` or `(4,0)` were made solid in BOTH phases:** no change (both are already permanently solid).
- ⚠ **Blocked intent (see §4):** the design asks for "a side step changes the parity, and the wall that refused me becomes my route". The side step here changes **nothing about `(3,1)`** — it routes around it and lets the player walk through a *different* wall, `(4,2)`.

## 2b. L6–L10 — the doors + switches unit (M1 + M3), solver-verified

Facts used below (proved in §3): **F1** (move *n* is played in phase A if *n* is odd) and **F2** (arrival at tile `c` is always a move `n ≡ d(c) (mod 2)`), plus the corollary **F3** derived in §3: *a switch's `activePhase` must equal the fixed entry phase of its own tile, otherwise the switch can never fire* (the policy `switch-never-fires` rejects it).

Door openness (`src/core/rules/solid.ts`, frozen): a **blue** door is closed in phase A and open in B; a **red** door is the inverse; a switch that is ON inverts its targets. So the *only* way a door tile can be entered is: base-open in the phase present during that move, or latched open by a switch that is currently ON.

### L6 — `l006.json` · the latch on the natural path (5 × 3, `par` 4)

`d(3,1) = 3` (odd) → the blue door `d1` at `(3,1)` is entered on odd moves, i.e. **in phase A, where blue is closed**. `d(1,1) = 1` (odd) → the switch `s1` at `(1,1)` is entered in phase A too, so `activePhase: "A"` is exactly the phase that is current when it is stepped on (F3).

| step | tile entered | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` `s1` | A | legal, `s1` → **ON**; after the flip, phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` `d1` | A | blue is closed in A, but `s1` ON **inverts** it → **open**, legal → phase B |
| 4 | `(4,1)` **goal** | B | legal → win |

- `par = 4` = `d(goal)`: the only 4-move route is the straight row, and that route passes `s1` at move 1, so **the shortest solution necessarily latches**. Solver: `shortestSolution = 4`, `parRoutes = 1`.
- The latch is **not required**: the un-switched world still solves in 6 via row 0 or row 2 (`switchRequired = false`). This is deliberate — §6 of `docs/level-design.md` wants the new-mechanic block to open with a **dip**, and `refusedThenEnteredTiles = 1` (`(3,1)`) still proves the latch is load-bearing content, not decoration.
- The level is also the first place where a **door closes under the player**: after move 3 the player stands on `d1` while phase B is current, where the blue door is open with `s1` ON → not solid; after the *next* flip it would be solid. The solver's `embedRoutes = 1` records exactly that (see §3's note on door-tile embedding).

### L7 — `l007.json` · the detour (3 × 3, `par` 4)

`(2,0)` and `(2,2)` have `d = 3` (odd) and are `phaseAWalls` → by F2 they need an *even* arrival, so both are **permanently solid**: the goal `(2,1)` (d = 2, entered on even moves) has exactly one non-wall neighbour, the door.

| step | tile entered / attempted | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` `d1` **attempted** from the start | A | blue closed in A, `s1` OFF → **REFUSED**: no movement, no flip, still at `(0,1)` phase A |
| 1′ | `(0,0)` `s1` (the detour) | A | legal, `s1` → **ON** → phase B |
| 2 | `(0,1)` | B | legal → phase A |
| 3 | `(1,1)` `d1` | A | latching open (as in L6) → legal → phase B |
| 4 | `(2,1)` **goal** | B | legal → win |

- The greedy line is refused **at the door itself**, and the switch is one step off that line: the detour costs exactly the two moves the refusal demands, so `par = 4` is simultaneously the floor and the "go out of your way" beat. Solver: `shortestSolution = 4`, `parRoutes = 2` (both shortest routes embed, `embedForced = true`).
- `switchRequired = true`: without `s1`, the door stays closed in A and the goal has no other non-solid neighbour.

### L8 — `l008.json` · Aha #1, the door that refused the greedy line (5 × 4, `par` 6)

`(4,0)` and `(4,2)` have `d = 5` (odd) and are `phaseAWalls` → **permanently solid** (F2). The goal `(4,1)` (d = 4, entered on even moves) therefore has exactly one non-solid neighbour: the blue door `(3,1)` (d = 3, entered on odd moves, in phase A where blue is closed). `s1` sits at `(2,0)` (d = 3, entered in phase A → `activePhase: "A"`, per F3) — **one tile off the straight row**, past the halfway point.

| step | tile entered / attempted | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` `d1` **attempted** | A | blue closed in A, `s1` OFF → **REFUSED** (the greedy line dies here) |
| 3′ | `(2,1)` is where the player stands; the fix is the side step `U` | — | — |
| 3″ | `(2,0)` `s1` | A | legal, `s1` → **ON** → phase B |
| 4 | `(2,1)` | B | legal → phase A |
| 5 | `(3,1)` `d1` | A | latching open → legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

- `par = 6`; **all six** shortest routes press `s1` at move 3 and cross `d1` at move 5 (solver gate (ii): `press-then-cross-door = 6/6`, and the crossed tile `(3,1)` is in `refusedThenEnteredTiles`). `switchRequired = true` (gate (i): the all-OFF subgraph holds 16 of the 34 reachable states and the goal is unreachable inside it).
- The switch is one tile off the line, the detour costs +2 moves, and the refusal happens *at the door* — the shape `docs/level-design.md` §2/§3 asks for. The fourth named condition, `dualPhaseTiles ≥ 1`, is unsatisfiable before L11: see §4.

### L9 — `l009.json` · two doors + two switches, ordered (5 × 5, `par` 8)

The column `x = 2` is a sealed wall except for one tile: `(2,0)`/`(2,4)` are `phaseBWalls` on even-`d` tiles and `(2,1)`/`(2,3)` are `phaseAWalls` on odd-`d` tiles → **all four permanently solid** (F2), leaving only `(2,2)` — the **red** door `d1` (d = 2, entered on even moves, in phase B where red is closed). So everything at `x ≥ 3` is behind `d1`, and the switch for the second door lives there:

| step | tile entered | phase | outcome |
|---|---|---|---|
| 1 | `(0,1)` `s1` | A | legal, `s1` → **ON** (`d1` now open in B) → phase B |
| 2 | `(0,2)` | B | legal → phase A |
| 3 | `(1,2)` | A | legal → phase B |
| 4 | `(2,2)` `d1` | B | red closed in B, `s1` ON → **open** → legal; phase A now, so the door is closed *under* the player (`d1` ∈ `refusedThenEnteredTiles`) |
| 5 | `(3,2)` | A | legal → phase B |
| 6 | `(3,1)` `s2` | B | legal, `s2` → **ON** (`activePhase: "B"` = the fixed entry phase of `(3,1)`, d = 4) → phase A |
| 7 | `(4,1)` `d2` | A | blue closed in A, `s2` ON → **open** → legal → phase B |
| 8 | `(4,0)` **goal** | B | legal → win |

- The **order is forced by geometry**: `s2` is behind `d1`, and `d1` only opens with `s1`; `(3,0)` is a permanent A-wall and `(4,0)`'s only other neighbour is `d2`, so the goal cannot be reached without both presses. Solver: `shortestSolution = 8`, `parRoutes = 2`, `refusedThenEnteredTiles = 2`, `switchRequired = true`, 0 dead states.
- This is the dispatch's "two doors / two switches interaction"; it is **not** the lesson `docs/level-design.md` §2 originally wrote for L9 (see §4).

### L10 — `l010.json` · mastery: M0 geometry + phantom walk + latch (6 × 4, `par` 9)

- `(5,0)` and `(5,2)` are `phaseBWalls` on even-`d` tiles (d = 6) → **permanently solid**, so the goal `(5,1)` is reachable only through the **red** door `(4,1)` (d = 4, entered on even moves in phase B, where red is closed).
- `s1` sits at `(2,3)` (d = 4, entered in phase B → `activePhase: "B"`): a real detour down to row 3 and back.
- `(1,2)` is a `phaseAWalls` tile on an even-`d` tile (d = 2). Recall the §2 L4/L5 construction: an odd-`d` tile + the *other* phase's wall is the passable echo. Here it is an **A-wall on an even-`d` tile**, entered on an even move while phase B is current → passable, and *after* the flip the player is standing inside a phase-A-solid tile (embedded, legal, ADR-0008 clause 3). So the route recombines "walk through a wall" with "the flip is my step".

| step | tile entered | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(1,2)` — the echo | B | legal (solid in A only) → phase A, player now **embedded** in an A-wall |
| 3 | `(2,2)` | A | legal — stepping *out* of the embedded tile needs no rule (`(2,2)` is non-solid in A) → phase B |
| 4 | `(2,3)` `s1` | B | legal, `s1` → **ON** → phase A |
| 5 | `(3,3)` | A | legal → phase B |
| 6 | `(4,3)` | B | legal → phase A |
| 7 | `(4,2)` | A | legal → phase B |
| 8 | `(4,1)` `d1` | B | red closed in B, `s1` ON → **open** → legal → phase A |
| 9 | `(5,1)` **goal** | A | legal → win |

- `par = 9`; `switchRequired = true`; every one of the **36** shortest routes ends embedded (`parRoutes = 36 / embedRoutes = 36`), 0 dead states. The board is deliberately loose (36 equivalent routes, `forced-move ratio` 0.10) — its job is to confirm the player owns *move → flip → latch* together, not to add a new trick (`docs/level-design.md` §2 L10).

### Where L6–L10 came from (reproducible)

The five files are the **accepted output of a committed, seeded generator** (`scripts/author-lv006-candidates.ts`, `SEED = 20261015`), which enumerates the recorded template families, runs schema → rules → BFS → policy on each candidate, takes `par` **from the solver**, and prints every rejection. Re-running it re-derives all five files (`shipped=MATCH`) and fails loudly if any of its three negative probes (inert switch, Aha board without the goal funnel, door with no switch) is wrongly accepted. Full record: `docs/ai-native-pipeline.md` §8.

## 3. The parity structure, and why M0-only content is a *static* maze

Both facts used above are short proofs, not opinions.

**F1.** `startPhase = "A"`, and every legal move flips. After `n` legal moves the phase is `A` if `n` is even, `B` if `n` is odd. Move *n* is played in the phase of the state after `n−1` moves → **A for odd n, B for even n**.

**F2.** Each legal move changes the player's position by one step, so its `x + y` parity flips every move: after `L` moves, `L ≡ (x + y) − (x₀ + y₀) ≡ d(x, y) (mod 2)`. So **arrival at tile `c` is always an `n` with `n ≡ d(c) (mod 2)` — no route can change that**, because a detour adds 2 moves, never 1. Combining with F1: the phase present when the player arrives at `c` is a function of `c` alone. Hence

- a `phaseAWalls` tile is enterable **iff `d(c)` is even**;
- a `phaseBWalls` tile is enterable **iff `d(c)` is odd**;
- a parity-mismatched phase wall is **permanently impassable** → behaviourally identical to a wall listed in *both* phases (the warning in `validateLevel`);
- no tile inside a level can ever be *refused first and entered later* — **the flip never "opens" a tile for you; your own route cannot re-time your arrival.**

Empirical backing (throwaway probes kept out of the repo, 4000 random levels each, ADR-0008 rules): M0-only walls → 0 levels with a tile reachable in both phases, 0 tiles refused-then-entered, 0 phase-formula violations. The same holds for **M1 doors without switches** (door solidity is then a function of the phase alone). Dynamism appears only when the phase stops being a function of the tile: **M3 switches** (231/500 random skeletons produced refused-then-entered door tiles) and **M2 portals** (233/500 broke the position→phase function, because a teleport changes position without consuming an extra move).

### F3 — a switch must sit on a tile whose entry phase is its `activePhase`

F2 says the phase present when the player arrives at tile `c` depends only on `c`. `applyMove` fires a switch only when `switch.activePhase` equals the current phase, so on a portal-free board:

- a switch whose `activePhase` **equals** `entryPhase(c)` fires every time it is stepped on (it is a real latch);
- a switch whose `activePhase` **differs** from `entryPhase(c)` can **never** fire — it is dead data (the same "permanently equivalent" class as a parity-mismatched wall, §2 L3).

This is now enforced by the level policy (`@/core/solver/policy`, code `switch-never-fires`), measured over the whole reachable graph rather than argued from parity (so it stays correct if portals ever arrive). All five unit levels satisfy it: L6 `(1,1)` A, L7 `(0,0)` A, L8 `(2,0)` A, L9 `(0,1)` A + `(3,1)` B, L10 `(2,3)` B.

### Note — "embedded" has two constructions, and the metric does not distinguish them

`embedMetrics` (`@/core/solver/bfs`) asks the shipped `solidAt` whether an arrival left the player inside a **current-phase-solid** tile. That is true for both:

1. the **wall echo** of L4/L5 (an odd-`d` tile carrying the *other* phase's wall, entered while it is an echo, §2 L4);
2. a **door tile** on an M1+M3 level: the player enters it while it is latched open, the flip happens, and the door is closed in the new phase (`src/game/renderer` draws that as a closed door for one frame — the player is safe and embedded, ADR-0008 clause 3). On L6–L10 this is the usual case: `embedRoutes` = `parRoutes` on all five.

The LV-004 metric is correct for both (its definition is `solidAt`, `docs/architecture.md` §8 — not "wall") but it must not be *read* as "a wall echo happened": L10 carries both constructions, and a future portal level could embed a third way. The policy's lesson obligations are per level and name the intended construction (`phantom-walk-forced` for `l005`, `latch-dynamism` for L6–L10).

**Consequence for the pipeline:** the claim in `ADR-0008` clause 8 that parity-dependent entry "genuinely rewires feasible routes from L1 onward" and resolves OQ-1 does **not** hold for M0-only content. M0 walls are real gates *perceptually* (a wall is solid while its phase is current) but the legal-move graph they produce is **static**: which tiles are enterable is fixed at authoring time by the distance parity from `player`.

## 4. Blocked design intents (escalation needed — do not silently "fix")

| Where | Spec | Status |
|---|---|---|
| `docs/level-design.md` §2 L4 | "the solid wall becomes a passable echo … the route crosses the very tile that refused earlier" | **UNREACHABLE in M0** by F2. `l004.json` ships a substitute beat (a *different* tile that is solid in the other phase is crossed while it is an echo) and is flagged, not presented as the specified lesson. |
| `docs/level-design.md` §2–§3 L5 (Aha #1) | "greedy straight line refused at the last jump; a visible side step changes the parity; the refusing wall itself becomes the route" | **UNREACHABLE in M0** by F2. `l005.json` keeps the refusal + side-step + `par ≤ 6` shape and makes the goal reachable *only* through an echo tile, but the refusing tile `(3,1)` is still never enterable. The ladder's stated Aha is not delivered. |
| `docs/level-design.md` §1 example | `par: 6` for `player [0,1] / goal [4,1] / phaseAWalls [[2,0]] / phaseBWalls [[3,1]]` | **inconsistent with its own prose**: the prose (and F1/F2) give `R,R,R,R` = **4** moves (the echo `(3,1)` is entered on move 3, a phase-A step). `par` must be re-derived by SOLVER-001. The example also contains `(2,0)`, which is `d = 3` (odd) in a `phaseAWalls` list → never enterable decoration. |
| `docs/level-design.md` §2 L9 | "switches listen only in their `activePhase`; arriving on the wrong phase does nothing" — a **timing** lesson ("which step do I press on?") | **UNCONSTRUCTIBLE pre-L11**, by F2/F3: arrival at a fixed tile happens in exactly one phase, so there is no such thing as "arriving on the wrong phase" on a portal-free board. A switch is either **always** current on its tile (a working latch) or **never** current (dead data, now rejected by the policy as `switch-never-fires`). `l009.json` therefore ships the *constructible* interaction the dispatch asked for — two doors, two switches, the second switch behind the first door, so the **order** of the presses is forced by geometry (§2b) — and this row records the deviation rather than pretending the timing lesson exists. |
| Dispatch LV-006 criterion 4 (Aha #1 gate (iv)) | "`dualPhaseTiles ≥ 1` on L8" | **UNSATISFIABLE on any portal-free board** (ADR-0009 decision 1, checkerboard invariant: a switch never relocates the player, so `dualPhaseTiles ≡ 0`; already pinned by `tests/solver/dynamism-metrics.test.ts`). Gate (iv) is implemented and reported by `scripts/solve-levels.ts` as `UNSATISFIABLE` with its proof, and `dualPhaseTiles === 0` is pinned as the proven value. The gate is not dropped, not softened, and no portal is smuggled in — ADR-0009 schedules M2 at L11. Escalated in `docs/ai-native-pipeline.md` §8.5. **Corrected law (Orchestrator adjudication, recorded in §8.5):** pre-L11 acceptance is carried by the *measured latch* — `refusedThenEnteredTiles ≥ 1` (ADR-0009 decision 4) — and gate (iv) is the L11+ acceptance criterion, so `l008.json` passes (i)(ii)(iii) with printed proofs. Since LV-007A the `UNSATISFIABLE` verdict also needs **both** facts (portal-free **and** a measured 0): a portal-bearing board measuring 0 is a loud FAIL, and `dual-phase-tiles` is pinned as the only gate allowed to escalate. |

Cheapest mechanical fixes for the design team to consider (**none of them mine to decide** — ADR-0008 is human-approved core rule; M1/M2 scope belongs to the Game Designer):

1. Bring a **portal pair (M2)** into the early teaching block — a teleport is the only mechanic in the locked rule set that decouples the phase from the step parity, and it needs no rule change.
2. Or bring **M1 doors + M3 switch** forward (doors *alone* stay static, so M3 must ship with them).
3. Or add a legal, no-move flip (a "wait"/self-flip action) — this **is** a core-rule change and needs the Game Designer + Playtest Analyst + Orchestrator route and a new ADR.

## 5. Validator self-tests (negative cases)

`scripts/validate-levels.ts` carries 10 negative cases and requires each to be rejected **by an error message that names the invariant** (`ok === false`, message matched, input object unchanged → no auto-repair): goal-is-wall (both phases), out-of-bounds, duplicate coordinate, spawn-inside-wall, dangling door reference, portal degenerate pair, portal end on its own `activePhase` wall, unknown field (strict schema), missing `par`, grid over the R-L2 cap (8 × 8 without Orchestrator approval). Current status: **10/10 rejected by name**; the suite also proves the *non-zero exit* path (a deliberately broken copy of `l003.json` in a temp dir → `RESULT: FAIL`, exit code 1).

## 6. Interface contract (frozen — GAME-001 imports from `@/core/level`)

Exported by `src/core/level/index.ts`: `Coord`, `DoorDef`, `SwitchDef`, `PortalDef`, `Level`, `LevelSchema`, `validateLevel`, plus `Phase`, `LevelInput`, `LevelSchemaOutput`, the sub-schemas and the small helpers `coordKey` / `sameCoord` / `formatCoord`. Coordinate representation: **`Coord` tuples `[x, y]` in JSON and in this module**; the runtime state layer uses `Vec = { x, y }`; conversion happens **once**, in the loader / `initialState`. The level layer is a single module on purpose (see its header comment): the frozen `tsconfig.json` has no `allowImportingTsExtensions`, and Node's type stripping needs explicit `.ts` specifiers, so a single-file module with only `zod` as an external import satisfies the compiler *and* a no-build `node scripts/…` run.

## 7. Next handoff

- **GAME-001 / UI-ART-001 — L6–L10 must not enter the playable registry yet.** Per the LV-006 task contract the five new files stay out of `src/game/levels/level-registry.ts` until the Game Designer sequences them (L6–L10 were authored to `docs/level-design.md` V0.4 §2/§6; the §2b derivations above are the parts the solver proved). The renderer today implements no `door` or `switch` object (`src/game/renderer/objects/registry.ts`), so the block is not playable as authored — registering it now would ship a board whose latch is invisible.
- **Game Designer / Orchestrator:** §4 — the two blocked intents (L9's timing lesson, L8's gate (iv)) need a design decision, not an agent workaround: either re-word the ladder for the pre-L11 phase, or re-schedule M2/M3 (ADR-0009 puts portals at L11).
- **Level AI + Solver (next):** the metric work is **done** for this block — LV-004 embed plumbing, then LV-007B's `B` effective / `T` / `R` / `D` (`docs/level-difficulty.md` §5.2), the ordered latch companion (reported, not gated) and the n-11 route-walk budget key. Two follow-ups remain and neither is mine to decide: the **weights** are still the provisional V0.1 hypothesis and need playtest regression (`docs/level-difficulty.md` §2/§4), and the L5→L6 seam is measured **+8.53** where `docs/level-design.md` §6 asks for −2…−3 (§5.2 of the same file + this file's §4 escalation).
- **Then:** the LLM candidate pipeline (`docs/ai-native-pipeline.md` §8) can consume `validateLevel` + `@/core/solver/policy` unchanged for the next block (L11–L20, portals) — the ordered companion must be promoted to a gate before the first L11+ portal candidate is accepted (ADR-architecture-0002) — schema → rules → BFS → metrics → policy → accept/reject, with rejection (never repair) at every gate.