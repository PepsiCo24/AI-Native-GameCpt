# `src/levels/` — level data set (M0 ladder L1–L5 + M1+M3 unit L6–L10 + M2 debut L11 + M2 block L12–L15)

> Owner: **Level AI + Solver** (AGENTS.md §4). Design intent: **Game Designer** (`docs/level-design.md` §1–§3).
> Status: **schema-validated AND solver-proven** — `scripts/solve-levels.ts` reports `15/15 PASS`, `par` == the solver's `shortestSolution` on 15/15, 0 dead states, 0 unrecoverable states, and the level policy (`@/core/solver/policy`) reports 0 violations on 15/15.
> Metrics: the `docs/level-difficulty.md` §2 model is now **measured** for this block (`B` effective, `T`, `R`, `D` — §5.2 there, definitions in §2a); the route walk and the ordered latch companion are printed by the solver CLI (§0b).
> Board cap: **≤ 7 × 7** (`docs/ui-ux.md` R-L2). L1–L5 are **M0 only**; L6–L10 add **M1 doors + M3 switches**; **L11 adds M2 portals** (`dualPhaseTiles > 0` for the first time — the only board in the set whose position→phase link is broken); **L12–L15 are the M2 block** (`docs/decisions/design-0003-l1215-block-law.md`): par ramps 4/6/8/10 and the walking world is deleted from L13 up.
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
| `l011.json` | 11 | 7 × 3 | — / — | `d1` blue `(5,0)` / `s1` `(1,1)` A → `d1` · `p1` `(2,1) ⇄ (4,0)` **activePhase B** | 4 | **M2 debut**: the portal — a channel only alive in one phase; it is on the only par route, and the walking world needs 7 (below OFFERED) |
| `l012.json` | 12 | 7 × 3 | `(1,0)`, `(2,1)` / — | `d1` blue `(5,2)` / `s1` `(4,2)` B → `d1` · `p1` `(0,2) ⇄ (3,2)` **activePhase A** | 4 | **the dip's second beat**: the walking world still solves (7) so the channel is a *shortcut*, and the latch grades par by 2 |
| `l013.json` | 13 | 6 × 4 | `(4,1)`, `(4,3)` / `(4,0)`, `(4,2)` | `d1` blue `(5,1)` / `s1` `(5,2)` B → `d1` · `p1` `(0,1) ⇄ (5,3)` **activePhase A** | 6 | the sealed line: walk-only is **UNSATISFIABLE** — the channel is the only door |
| `l014.json` | 14 | 7 × 4 | `(5,0)`, `(5,2)` / `(5,1)`, `(5,3)` | `d1` blue `(6,2)` / `s1` `(6,1)` B → `d1` · `p1` `(0,1) ⇄ (6,0)` **activePhase A** | 8 | the same law on a longer board: mandatory channel + mandatory latch |
| `l015.json` | 15 | 7 × 5 | `(3,0)`, `(3,2)`, `(3,4)` / `(3,1)`, `(3,3)` | `d1` blue `(5,3)` / `s1` `(5,1)` A → `d1` · `p1` `(0,0) ⇄ (5,0)` **activePhase B** | 10 | **block end**: full coverage (35/35), `D_exec = 14.97 > 13.64` (the frozen §6 clause) |

### 0b. Measured solver facts (2026-10-15, LV-006 · obligations re-pinned by LV-007A)

`node_modules/.bin/tsx scripts/solve-levels.ts` prints these per run; `docs/level-difficulty.md` §5.1 holds the full table.

| id | shortest | reachable states | `refusedThenEnteredTiles` | `dualPhaseTiles` | `parRoutes` / `embedRoutes` | switch required | Aha gates |
|---|---|---|---|---|---|---|---|
| 6 | 4 | 29 | 1 `[3,1]` | 0 | 1 / 1 | **no** (dip: un-switched world solves in 6 — documented `switchRequired: "exempt"`) | — |
| 7 | 4 | 12 | 1 `[1,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 8 | 6 | 34 | 1 `[3,1]` | 0 | 6 / 6 | yes (**obligation**) | (i)(ii)(iii) PASS · (iv) UNSATISFIABLE before L11 · (v)(vi) PASS (§4) |
| 9 | 8 | 58 | 2 `[2,2] [4,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 10 | 9 | 42 | 1 `[4,1]` | 0 | 36 / 36 | yes (**obligation**) | — |
| 11 | 4 | 82 | 1 `[5,0]` | **21** | 1 / 1 | **no** (`"exempt"` row: the walking world solves in 7, so the portal is the shortcut and the latch is on the route — but not demanded) | portal suite, 8/8 PASS (§2c) |
| 12 | 4 | 78 | 3 `[1,0] [2,1] [5,2]` | **19** | 1 / 1 | **no** (`"exempt"` block row: G1 grades par, +2 in the all-OFF world — the latch buys speed, the channel carries existence) | block suite, 4/4 PASS (§2d) |
| 13 | 6 | 79 | 5 `[4,0] [4,1] [4,2] [4,3] [5,1]` | **16** | 3 / 3 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |
| 14 | 8 | 95 | 5 `[5,0] [5,1] [5,2] [5,3] [6,2]` | **20** | 10 / 10 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |
| 15 | 10 | 99 | 6 `[3,0] [3,1] [3,2] [3,3] [3,4] [5,3]` | **15** | 15 / 15 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |

- **The `switch required` column is an obligation, not a note** (LV-007A, OQ4 ruling): `@/core/solver/policy` reads it from the lesson row (`DOCUMENTED_LESSONS[].switchRequired`) and rejects a level documented as a load-bearing latch whose goal is still reachable with every switch OFF — code `lesson-switch-required`. **L6 and L11–L15 are the only levels exempt** (explicit `"exempt"` rows backed by the §6 dip / §2c / §2d below, with the measured `allOffGoalReachable = true` on all of them), and the check never reads a level id, so relabelling L6's board as L7 is rejected while the shipped `l006.json` stays clean. For the block the exemption is *named in the law* (ADR-design-0003 §5): its substitute teeth are G1 (`all-OFF` is exactly 2 moves slower, 4/4 measured), G2 (every par route presses the switch and crosses the door it drives) and G3 (the refusal is orderable) — par-grade teeth, never existence.

- **L11 satisfies the one gate that was unsatisfiable before it.** `dualPhaseTiles = 21` — every one of the board's 21 tiles is enterable in both phases, because the opposite-colour pair `(2,1) ⇄ (4,0)` makes a teleport the only displacement source that does not consume a move (`refusedThenEnteredTiles = 1` too: the door tile `(5,0)` answers differently because of history). The `dual-phase-tiles` gate, reported as `UNSATISFIABLE` on `l008` since LV-007A, is now **PASS** with a measured proof — and it is the *first* level for which that gate could be satisfied (LV-009-B's block continues the column at 19/16/20/15 tiles), so the L11 scheduling of M2 is no longer a plan but a measurement (§2c, §2d, ADR-0009).

- **Four more lines per level since LV-007B/007C** (§0b's table intentionally stays the LV-006 facts; these are the new program outputs):
  - `routeWalk=<dfs> + <lookahead> work units (budget=…) prunedChildren=…` — the cost of enumerating *every* shortest route, on the walk's **own** budget key (`maxRouteVisits`, default 2 000 000). Before LV-007B item 1 the walk read the *exploration* cap (`maxStates`), so raising the state limit silently changed route enumeration; an overrun now raises instead of silently truncating the route set. See `docs/ai-native-pipeline.md` §8.7.
  - `refusedBeforeEnteredTiles=… tiles=[…]` — the **ordered** companion of the `refusedThenEnteredTiles` column above (same tile refused strictly before it is accepted, on one real path). It is the reader of **gate (iii)** since **LV-007C** (the code half of GD-008's re-wording of `docs/level-design.md` §3 (iii): the Aha's own sentence is ordered — "refused *first*, entered *later*"), where a trapped refusal — `refusedThenEnteredTiles > 0` but `refusedBeforeEnteredTiles = 0`, a beat no player can witness — is now rejected by name (`gate-refused-then-entered`, control: `tests/solver/policy-negative-controls.test.ts`). The `lesson-latch-dynamism` check and the pre-L11 acceptance law still read the *unordered* canonical metric (ADR-architecture-0002 decision 4 / Appendix A3; `docs/ai-native-pipeline.md` §8.5) — the two legs of the split are deliberately **not** re-stitched. On L6–L10 both forms report the same tile lists, so the switch moves no verdict on this set.
  - `difficulty D=… = 1·L + 3·B + 4·T + 2·R + 5·M` + `difficultyDiagnostics …` + `difficultyExec Dexec=… = D − 5·M = 1·L + 3·B + 4·T + 2·R` — the `docs/level-difficulty.md` §2 model with its **provisional** weights (printed next to the number on purpose) and its **execution axis** (§2b, ADR-design-0001 — the axis `docs/level-design.md` §6's dip law lives on), printed in both forms so the identity is checked by the reader. Inside `docs/level-design.md` §4 the `4·T` and `2·R` terms are provably 0 on every shipped level, so `Dexec = L + 3·B` there.

- **Validation is proven** for all fifteen: `node scripts/validate-levels.ts` → `15/15 level files ok`, exit code 0 (negative self-tests 10/10 rejected by name).
- **Solvability, `par` and the level policy are proven** for all fifteen: `node_modules/.bin/tsx scripts/solve-levels.ts` → `15/15 PASS`, `RESULT: PASS` (plus one ESCALATION — `l008`'s `dual-phase-tiles`, §4/§2c).
- The hand derivations in §2 (L1–L5, written before the solver existed), §2b (L6–L10), §2c (L11) and §2d (L12–L15) are kept as the *reason* each `par` is the floor. Where a hand derivation and the solver disagreed, the level file was re-authored — never the number.
- Supplementary, *informal* evidence (kept deliberately **out of the repo**): the original throwaway BFS that first agreed with all five L1–L5 `par` values (4 / 5 / 6 / 6 / 6). It has been superseded by `scripts/solve-levels.ts`, which is the deliverable and the evidence.

## 1. Running the gate

```bash
node_modules/.bin/tsx scripts/validate-levels.ts      # schema/rule gate + 10 negative self-tests
node_modules/.bin/tsx scripts/solve-levels.ts         # BFS: solvable, par, dead states, metrics, policy, gates
node_modules/.bin/tsx scripts/author-lv006-candidates.ts   # L6-L10 families: accept/reject + negative probes
node_modules/.bin/tsx scripts/author-l11-candidates.ts     # L11 (M2 debut) family: accept/reject + negative probes
node_modules/.bin/tsx scripts/validate-levels.ts <other-levels-dir>   # or LEVELS_DIR=…
```

`tsx` is a dev dependency of this workspace (`package.json`), so both gates run without a build step. `scripts/validate-levels.ts` additionally documents that it can run under Node's native type stripping. Exit code is **non-zero** if any level fails, if a negative self-test is wrongly accepted, or if two level files share an `id`. Failing levels are **rejected, never auto-repaired** (ADR-0004). `scripts/solve-levels.ts` also exits non-zero on a policy violation (`@/core/solver/policy` — the inventory is `POLICY_VIOLATION_CODES`, with one negative control per code in `tests/solver/policy-negative-controls.test.ts`: disabling any one check turns the suite RED), on a `par` mismatch, on a dead/unrecoverable state, or on a FAILing named gate; a gate that is *unsatisfiable as written* (only `dual-phase-tiles`, before L11 — pinned as the single legitimate escalation channel) is printed under ESCALATIONS (§4) instead of being counted as a pass.

The policy layer checks both content laws and the ladder's documented lessons, including the **`switchRequired` obligation on L7–L10** (`lesson-switch-required`), the **§3 Aha construction bullets** as named gates (v) `single-door-one-switch-funnel` and (vi) `aha-par-cap`, and — since **LV-008** — the **M2 debut suite** for `l011` (`portal-pair-single-opposite-colour`, `portal-crossing-on-every-par-route`, `portal-par-cap`, `portal-teaching-grade-below-offered`, `portal-seam-law-execution-axis`, on top of the reused `dual-phase-tiles`, the shared `shortest-solution-presses-switch-and-crosses-door` and the ordered `refused-then-entered`); `docs/ai-native-pipeline.md` §8.3–§8.5 and §8.8 are the record. Because **M1 never ships alone**, the mirror is enforced here too: a `switches[]` entry with an empty `targets` list is rejected as `switch-without-targets` (LV-007B n-13). Such a switch really *does* toggle — `applyMove` flips `switchesOn` regardless of targets — so the firing check cannot see it; what is wrong is that no door reads it. The frozen validator only **warns** about that shape, and a warning is not a gate (`src/core/level/**` is the schema layer and was deliberately not touched).

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

The five files are the **accepted output of a committed, seeded generator** (`scripts/author-lv006-candidates.ts`, `SEED = 20261015`), which enumerates the recorded template families, runs schema → rules → BFS → policy on each candidate, takes `par` **from the solver**, and prints every rejection. Re-running it re-derives all five files (`shipped=MATCH`) and fails loudly if any of its three negative probes (inert switch, Aha board without the goal funnel, door with no switch) is wrongly rejected. Full record: `docs/ai-native-pipeline.md` §8.

## 2c. L11 — the M2 (portal) debut, solver-verified

`l011.json` is the first board in the set that carries a **portal**, i.e. the first on which the phase is no longer a function of the tile (§3/§4 said M0 walls and M1 doors cannot break that link; only M2 and M3 can). Its acceptance contract was **pre-registered** before any candidate existed (`docs/level-design.md` §6 V0.6 / ADR-design-0001, `docs/level-difficulty.md` §3.3–§3.4), and every clause below is a program read-out — `tests/solver/l11-portal-gates.test.ts` pins them, `tests/solver/policy-negative-controls.test.ts` gives each named gate a board that fails by that name.

**The board.** 7 × 3, wall-free, `startPhase A`, player `(0,1)`, goal `(6,0)`; `d1` blue on `(5,0)`; `s1` on `(1,1)` with `activePhase A` → `d1`; `p1` = `(2,1) ⇄ (4,0)` with `activePhase B`; `par = 4` (solver: shortest = 4, `parMatch = true`). The skeleton is the L6 template's (`docs/level-difficulty.md` §3.4 asks a mechanic debut to be short and single-concept): the only obstruction is a *rule* object, so the portal's effect cannot be masked by geometry, and the board carries **0 validator warnings**.

**The par route is the portal (measured, unique).** `parRoutes = 1` — there is exactly one 4-move route, and `right-right-right-right` crosses the channel:

| step | clicked | entered | phase at entry | outcome |
|---|---|---|---|---|
| 1 | `(1,1)` | `(1,1)` `s1` | A | legal, `s1` → **ON**, `d1` opens → phase B |
| 2 | `(2,1)` | `(2,1)` 🔵 pair end, **active in B** | B | legal **and teleports** to `(4,0)` → phase A |
| 3 | `(5,0)` | `(5,0)` `d1` | A | blue closed in A… but `s1` is ON → **open** → legal → phase B |
| 4 | `(6,0)` | `(6,0)` **goal** | B | legal → win |

- The teleport is the *only* displacement in the game that does not cost a move, so it is what makes step 3 land on `(5,0)` **in phase A** — where the blue door is open. Without it the door tile is entered in B (closed) and the board is not 4 moves; the walking world needs **7** (measured with a second BFS on `{…l011, portals: []}`). The portal is therefore a **shortcut worth 3 moves, not decoration** — and `portal-crossing-on-every-par-route` proves it can never be bypassed on a shortest route.
- `refusedThenEnteredTiles = 1` tile `[5,0]`: `(5,0)` is clicked-and-refused when the door is closed in B (off-route wandering) and entered when it is open in A (step 3). Both readers agree here (`refusedBeforeEnteredTiles = 1`, same tile), so the LV-007C ordered reader changes no verdict on this board — it is the carrier, not the novelty.
- **Below OFFERED** (`docs/level-difficulty.md` §3.4): the portal is *rewarded in par* and *not demanded*, which is why this row is `switchRequired: "exempt"` (the L6 precedent, recorded on the lesson row rather than special-cased by id). Gate (i) `no-solution-with-switches-off` is deliberately **not** in L11's gate family: on a channel-bearing board a walking route and a teleporting route stand in different phase relations to the same door tile, so an all-OFF refusal is no longer one well-defined fact — the latch's role is measured by gate (ii) instead.

**The eight named gates (all PASS).** `dual-phase-tiles` (21 tiles, gate (iv) satisfied for the first time) · `shortest-solution-presses-switch-and-crosses-door` (**the same implementation** Aha #1 uses — extracted, not copied: `routes=1; press-then-cross-door=1`) · `refused-then-entered` (the ordered reader) · `portal-pair-single-opposite-colour` (one pair, x+y parities 3/4, one `activePhase = B`) · `portal-crossing-on-every-par-route` · `portal-par-cap` (`par ≤ 4`, authored **and** measured) · `portal-teaching-grade-below-offered` · `portal-seam-law-execution-axis`.

**The pre-registered seam law, measured.** `D_exec = 8.573171` (`D = 28.573171` − 5·M(4) = 1·L(4) + 3·B(1.5244)) — comfortably under the pre-registered bound **13.64**, which is nothing but the *published 2-dp form* of the shipped `l010` measurement (13.642857, pinned in `tests/solver/difficulty.test.ts` §2c), so the law is strictly harder than "beat L10". Stated honestly: on the **total** axis `D` only falls 0.0697 (28.6429 → 28.5732), because the mechanic count term rises by +5 exactly where the block changes mechanic; the seam is real on the **execution** axis (`D_exec` 13.6429 → 8.5732, **−5.07**), which is the axis ADR-design-0001 writes the law on. `M = 4` (M1+M3+M2) is the `ΔM = +1` the design section asked for, and `B` falls 1.5476 → 1.5244 (a smaller state space: 82 reachable states, `D_exec`'s only other live term).

**The two things L11 did *not* get, by design.** No `portalRequired` flag and no "lesson-portal-required" code: the debut's whole point is that the portal is *not* demanded, so such a check would be unreachable — and an unreachable check violates the one-negative-control-per-code law that `tests/solver/policy-negative-controls.test.ts` enforces at compile time. And no wall: adding parity-dead walls to raise `D_exec` was probed (`phaseBWalls [[5,2],[6,1]]` and several `phaseAWalls` variants) and measured to produce `deadStates = 0` and **no `D_exec` movement at all** — the honest reason the seam-law negative control is the boundary board (the shipped `l010` re-labelled `id: 11`, `D_exec = 13.642857 ≥ 13.64`) rather than a surgical one.

### Where L11 came from (reproducible)

Also the accepted output of a committed, seeded generator: `scripts/author-l11-candidates.ts` (`SEED = 20261015`) enumerates the recorded M2-debut family — the wall-free 7 × 3 skeleton × switch tile × door tile × door colour × pair × channel phase, **54 candidates**, plus a seeded pair-placement axis — runs schema → rules → BFS → `par` from the solver → the whole `portal-aha-2` suite on each, and prints every rejection.

- **1/54 accepted, and it is the shipped file** (`shipped=MATCH`): the design space of this debut is genuinely narrow (49 rejects fail gate (ii) — the channel must sit *exactly* on the only route while the door must still be closed in its entry phase — and 4 fail the `par ≤ 4` cap). That is the finding, not a failure of the sweep: the shipped board was *found and filtered to*, not fitted to a target.
- Both negative probes are rejected **by name**: a **same-colour** pair (`(6,2) ⇄ (0,2)`, both `(x + y)` even → inert M2, hard-**error** in `validateLevel`, not a warning) and a **bypassable** portal (the channel re-declared in the phase the par route never stands in → `gate-portal-crossing-on-every-par-route`). Full record: `docs/ai-native-pipeline.md` §8.8.

## 2d. L12–L15 — the M2 block, solver-verified (ADR-design-0003)

The block's law is `docs/decisions/design-0003-l1215-block-law.md`; the four boards are
the four candidates the LV-009-A dossier carried, **byte-copied** into the dataset after
STEP 0 re-derived every constant of that ADR from the candidates *as an isolated dataset*
(`scripts/attest-lv009-block.ts`, transcript committed at `e8a456d`). Each board's `par`
below is the program solver's `shortestSolution`, and the whole ramp is one legal
sentence: **4 / 6 / 8 / 10 = the P1 floor + the 2-move step, ending exactly on the
ceiling** (`BLOCK_L1215_PAR_FLOOR/STEP_MIN/CEILING` in `@/core/solver/policy`).

- **L12 — `l012.json` · 7 × 3 · `par` 4 · the dip's second beat.** The channel
  `(0,2) ⇄ (3,2)` sits **one step from the player's tile**: the opening move enters an
  active end (phase A) and *arrives on the far side* of the board in phase B, which is
  exactly where the latch `s1 (4,2)` is current — so the route reads **teleport → press →
  cross the door → goal** in 4 moves, with the door `d1 (5,2)` open only on that order.
  The walking world still finishes in **7** (Manhattan 7, no wall in the way), so the
  channel is a *shortcut*, and the board keeps the L11 grade ("below OFFERED") while
  dropping `D_exec` to **8.23 < 8.573171** (L11's measured value) — the two-beat dip §§4/6.1.2
  of the ADR, carried by effective branching (1.5244 → 1.4103) with par flat at the floor.
- **L13 — `l013.json` · 6 × 4 · `par` 6 · the sealed line.** Column `x = 4` alternates its
  wall phase per row (`(4,1)/(4,3)` in A, `(4,0)/(4,2)` in B), so the walking world cannot
  cross it while keeping the phase the door and the switch need: **walk-only is
  UNSATISFIABLE** (measured, and the reason the ADR's `BLOCK_L1215_PORTAL_LOAD` grades
  this board `"mandatory"`). The route must reach the channel end `(0,1)` on the parity
  that makes it active, teleport to `(5,3)`, press `s1 (5,2)` in phase B and cross
  `d1 (5,1)` — 6 moves, with the extra two over L12 being the detour to the far end.
- **L14 — `l014.json` · 7 × 4 · `par` 8 · the same law on a longer board.** The line
  `x = 5` is sealed in the same alternating way and the channel `(0,1) ⇄ (6,0)` is the
  only crossing; the latch `s1 (6,1)` sits between the channel's arrival end and the door
  `d1 (6,2)`, so the order is forced by geometry again. The board is what makes the ramp
  *arithmetic* rather than *longer*: `B` 1.6329 → 1.6526 with the same mechanic set.
- **L15 — `l015.json` · 7 × 5 · `par` 10 · the block end.** **Every tile of the 7 × 5 grid
  is visited** (coverage 35/35 — §6.1.1's `l015TemplateFamily` note, and the reason the
  board size was chosen *from* the route rather than padded to it), the line `x = 3` is
  sealed across all five rows, and the frozen §6 clause is met with room to spare:
  **`D_exec = 14.969697 > 13.64`** (and above L10's measured 13.642857 itself).

**What the block does *not* claim.** Gate (i) `no-solution-with-switches-off` is
deliberately **absent** from these four boards' suite (ADR §5): in the all-OFF world the
goal is still reachable on **4/4** (that is the documented G1 grade — the latch prices the
route, the sealed channel carries existence). The substitute teeth are par-grade and
measured: **G1** `allOffShortest − par = 2` on 4/4 (a *restricted* all-OFF walk, so the
number is a distance in the world it is read from), **G2** every par route presses the
switch *and* crosses the door it drives, and **G3** the refusal is *orderable*
(`refusedBeforeEntered == refusedThenEntered`, 3/5/5/6 tiles). G1 cannot fail alone —
if gate (ii) passes, no all-OFF route can be as short as par, which is why the G1 negative
control in `tests/solver/policy-negative-controls.test.ts` §2d fails with gate (ii) and
the coupling is asserted there as an implication over every board in the suite.

**Where L12–L15 came from.** The LV-009-A search (Kimi K3 for design reasoning, the
program Solver for every verdict) proposed candidate families; every accepted member was
filtered by the ADR's own constants — par floor/step/ceiling, coverage, latch grade,
portal load, the dip ceiling and the tail budget — during the *search*, not after it
(`docs/ai-native-pipeline.md` §8.10 records the pipeline and the rejection ledger). The
STEP 0 transcript is the load-bearing evidence: it re-derived `par`, `D_exec`, `T`, `R`,
dead states, coverage, the all-OFF advantage, the portal-free verdict, `dualPhaseTiles`
and the ordered/unordered refusal counts **from the candidate files alone**, and every
number matched the ADR before a single dataset byte moved.

## 2e. L16–L20 — the M2 latch block, **UNREGISTERED candidates** (`src/levels/candidates/`)

`src/levels/candidates/` is a **subdirectory of `src/levels/`, deliberately outside the
dataset**. It exists because the three suites that own the shipped-set census all read the
root non-recursively — `tests/solver/difficulty.test.ts` derives `SHIPPED_IDS` from
`readdirSync(src/levels).filter(/^l\d+\.json$/)` and asserts `Object.keys(PINS).sort() ===
SHIPPED_IDS`; `tests/solver/metrics-sidecar.test.ts` asserts `REPORT.levels.length === 15`
plus file-list equality; `src/game/levels/level-registry.ts` uses **explicit imports**, not
`import.meta.glob`. A candidate placed in the root therefore breaks two suites and
auto-registers a level the game is not ready to show. Measured, not assumed: the placement was
chosen after those three readers were opened, and `npm run levels` (15/15 PASS,
`RESULT: PASS`) plus `npx vitest run` (32 files, 654 passed, 3 skipped) are unchanged by a
candidate landing here.

**Registration — wiring the candidates into the root, `EXPECTED_LEVEL_COUNT`, the metrics
sidecar and the block-law policy — is the R-003c ticket's work.** This directory is the
proposal shelf, not the shelf.

### The rung law the candidates are filtered against

Derived, never chosen (`scripts/prove-candidate.ts` re-measures both constants from the 15
shipped files on every run — the values below are read-outs, not typed):

| constant | value | source |
|---|---|---|
| `par(L15)` | 10 | `l015.json` |
| the rung's minimum par | `l15Par + 2·(id − 15)` | §6.1.1 **P2** (non-seam block ⇒ `Δpar ≥ 2`) |
| the escalation cut | `D_exec ≤ 14.969697` is the old ceiling | max `D_exec` over L1–L15 (`a19a347` transcript) |
| the `B` band | `[1.2500, 1.6875]` | §6.1.1 P2 / §5.2, re-measured over the shipped set |

Pipeline for each rung: `scripts/author-l16-candidates.ts` (propose: schema → rules → BFS →
derived gates → census, seeded, `par` stamped by the solver) → `--write` lands the bytes →
`scripts/prove-candidate.ts <file>` **re-reads those bytes** and re-proves them plus six
negative controls → `tests/solver/l16-l20-candidates.test.ts` pins the obligations so a
regression is a red test rather than a lost terminal.

### Accepted candidates (proven on the landed bytes)

| rung | board | `par` | `D_exec` | `B` | region | latch (all-OFF) | shortest routes | refusals | coverage |
|---|---|---|---|---|---|---|---|---|---|
| L16 `l016.json` | 7 × 6, sealed column `x = 4`, portal `(3,3)↔(6,5)`/B, goal `(5,0)`, doors `(6,0)`+`(5,1)` blue, switches `(5,0)`/B + `(6,1)`/B | 12 | 17.100000 | 1.7000 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 20/20 press-then-cross | 8 tiles | 42/42 |
| L17 `l017.json` | 7 × 6, sealed column `x = 4`, portal `(3,3)↔(5,2)`/B, goal `(6,5)`, doors `(6,4)`+`(5,5)` blue, switches `(6,0)`/A + `(5,0)`/B | 14 | 19.027027 | 1.6757 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 60/60 press-then-cross | 8 tiles | 42/42 |
| L18 `l018.json` | 7 × 6, sealed column `x = 3`, portal `(2,5)↔(4,4)`/A, goal `(6,1)`, **three** blue doors `(6,0)`+`(5,1)`+`(6,2)` (every neighbour of the goal), switches `(6,3)`/B + `(6,5)`/B + `(5,0)`/B | 16 | 20.907923 | 1.6360 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 189/189 press-then-cross | 9 tiles | 42/42 |
| L19 `l019.json` | 7 × 6, sealed column `x = 3`, portal `(2,5)↔(4,0)`/A, goal `(5,4)` — **interior**, `x = 5` is the middle column — **four** blue doors `(5,3)`+`(4,4)`+`(6,4)`+`(5,5)` (every neighbour, all four), switches `(6,5)`/B + `(6,3)`/B + `(4,5)`/B + `(5,0)`/B | 18 | 22.885157 | 1.6284 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 231/231 press-then-cross | 10 tiles | 42/42 |

All are in the §4 acceptance region and all carry `D_exec = par + 3·B` exactly (the identity
that makes the escalation check mean `par + 3·B`, not something else).

**L16's taught beat** — *the latch is the door's only approach*: both of the goal's neighbours
are doors, so the goal is sealed until a switch has been pressed at all; the all-OFF world is
**unsatisfiable**, not merely slower.

**L17's taught beat** — *the same lesson with a real detour and two valid plans*: the goal
`(6,5)` is again sealed by both of its neighbours (doors `(6,4)` and `(5,5)`), but the two
switches now sit **two tiles off the landing column** (`(6,0)` and `(5,0)`), so neither press
is free: `par` grows from the bare 10 to 14, i.e. `Δpar = 4`, and the two plans
(land → up column 6 → `s1` → back down to `(6,4)`; or land → up column 5 → `s2` → down to
`(5,5)`) are **the same length**, which is what makes the second plan discoverable rather than
punished.

**L18's taught beat** — *the seal widens: every way in is a door.* The goal `(6,1)` has
**three** neighbours and all three are doors, so there is no free approach left at all and the
all-OFF world is again unsatisfiable — but now the player has to find one of **three** switches
(`(6,3)`, `(6,5)`, `(5,0)`, all phase B), none of which sits on the landing column of the portal
`(4,4)`. `par` grows from the bare 12 to 16 (`Δpar = 4`, two presses at +2 each) and the
escalation over L17 comes from the **shape** (door count 2 → 3, goal moved inward) rather than
from lengthening a walk: the door count is the goal's own geometry, not an axis the author
dials. `tests/solver/l16-l20-candidates.test.ts` pins all three rungs' obligations; the suite
picks a new candidate up automatically because it walks the directory rather than a typed list.

**L19's taught beat** — *the seal closes all four sides: the goal is in the middle of the room.*
L18's three-door seal still left the goal **against an edge**, so three of its four sides were
walls/door and the shape was "one edge, three doors". In `l019.json` the goal `(5,4)` is the
**interior** tile of the far region (`x = 5` of `4…6`, `y = 4` of `0…5`) and therefore has
**four** neighbours — and all four are doors (`(5,3)`, `(4,4)`, `(6,4)`, `(5,5)`), so there is no
edge to lean on and four switches to find instead of three. The arity is still the goal's own
geometry rather than a dial the author turns: on `7×6` a full seal is 2 (corner), 3 (edge) or 4
(interior), and the ladder now walks that sequence 2 → 2 → 3 → 4. The escalation over L18 is
measured, not asserted: `D_exec` rises `20.907923 → 22.885157` while `B` stays **in band**
(1.6284) and `par` steps `16 → 18`.

### The family census behind the L19 rung (measure, never tune-to-pass)

`--stage=f` measures what each geometry family can carry *before* a lattice is run, so the shape
step is picked from numbers. On `7×6` with the sealed-column grammar (`--stage=f --w=7 --h=6
--id=19 --cxs=2,3,4 --seal=2-4`), 14 310 bare boards scanned, every family full-coverage:

| cx | seal arity | scanned | clean | bare `par` max | on-rung (`bare ∈ {18,16,14}`) |
|---|---|---|---|---|---|
| 2 | 2 | 1012 | 506 | 14 | 2 |
| 2 | 3 | 3036 | 1518 | 13 | 0 |
| 2 | 4 | 2024 | 1012 | 12 | 0 |
| 3 | 2 | 1156 | 578 | 14 | 2 |
| 3 | 3 | 2890 | 1445 | 13 | 0 |
| 3 | 4 | 1156 | 578 | 12 | 0 |
| 4 | 2 | 1012 | 506 | 14 | 2 |
| 4 | 3 | 2024 | 1012 | 13 | 0 |

Two measured consequences. (1) **The bare route reaches 14 and no further on `7×6`**, and only at
arity 2 — a corner goal. Arity 3 caps at 13 and arity 4 at 12, so a par-18 rung cannot come from
the bare route at all on this grid; it must come from the press detour. (2) The arity-2 row is
**L16/L17's shape already**: a par-18 board built there would be the same seal with a longer walk,
which is exactly the escalation §6 has to avoid. So the shape step taken is arity 3 → **arity 4**.

The arity-4 family on `7×6` is small and was therefore enumerated **completely**, not sampled:
`--stage=d --w=7 --h=6 --cx=3 --id=19 --seal=4-4 --drop=8 --geo=17 --geos=1 --swcap=30000` judged
all 17 160 switch 4-tuples of its single clean geometry and measured

```
measured par census of the judged space: 12:10230 14:6450 16:446 18:34
census: 26 accept(s) of 17160 goal-gated candidate(s)
rung pin: par === 18 on 26 of 26 accept(s); over-rung accepts = 0
```

— i.e. the family's reachable `par` is `{12, 14, 16, 18}` and **18 is its ceiling**, with 26 boards
clearing every gate at exactly the rung value. The rung pin (`par === l15Par + 2·(id − 15)`
exactly, not merely `≥`) is printed by the generator and asserted in the suite, so an accept that
is longer than its rung is *named and dropped* rather than silently shipped as the rung.

### Named findings, recorded not smoothed

- **F-L16-1 (inert second latch).** In `l016.json` the switch `s1` sits on `(5,0)`, which *is*
  the goal tile, and `allOffShortestSolution = null` proves the goal tile is unreachable while
  all switches are off — so `d1` (`(6,0)`) can only ever be opened from a state in which the
  level is already won. `s1`/`d1` is therefore **decorative**: it fires
  (`every-switch-fires = true`) but it can never change a route, and the shipped policy audit
  reports `violations = 0`. Measured from two program read-outs (the `null` all-OFF walk and
  the tile identity in the file), not from inspection. The gate chain's `latch-route` reader
  needs only *some* switch to be pressed-then-crossed, so it does not name this case — the
  finding is recorded here for the reviewer and for R-003c rather than repaired silently in a
  committed artifact. `l017.json` does not have it (both its switches sit off the goal).
- **F-L16-2 (`B` excursion).** `l016.json` measures `B = 1.7000`, above the shipped band top
  `1.6875`. §6.1.1's self-correcting guard says an out-of-band `B` must be **named and the ramp
  re-checked on `D_exec` directly**, which it is: `D_exec = 17.100000 > 14.969697`. The
  excursion is named, not widened — `l017.json` was thereafter selected on `B` in-band
  (`1.6757`) and `D_exec` above its predecessor, to avoid compounding it.
- **F-L16-3 (wrong-name expectations).** The first pass of the negative-control table named the
  clause each mutation *should* trip; three of six measurements disagreed. The expectations were
  corrected **to the measured names**, and `expect` is now a *list* of clauses any of which may
  legitimately name the refusal (a mutation aimed at a late gate can be caught by a stronger,
  earlier reader). A mutation that is accepted still fails the battery, so widening the list
  cannot make it vacuous.

### Where L16–L20 came from (reproducible)

```
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4          # geometry census
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=d --cx=3 --id=18 --geos=45 --write
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l018.json --rung=18
node_modules/.bin/vitest run tests/solver/l16-l20-candidates.test.ts
```

L19 added `--stage=f` (the family census) and the grid/arity/window arguments:

```
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=f --w=7 --h=6 --id=19 --cxs=2,3,4 --seal=2-4
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=d --w=7 --h=6 --cx=3 --id=19 \
    --seal=4-4 --drop=8 --geo=17 --geos=1 --swcap=30000 --write
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l019.json --rung=19
```

`--w`/`--h` default to the shipped `7×6`, `--seal` to `2-3`, `--drop` to `4` and `--geo` to `0`, so
every L16–L18 command line above still reproduces byte-for-byte; `--geo`/`--geos` publish which
slice of the geometry list a run consumed, because a census that hides the rows it read is not a
census. `--drop` is the enumeration bound on `par − bare` (the press detour): the inherited value
encoded "each press costs 2 moves", which L17/L18 measured at 4 for a single press, so it is an
argument with the census printing what each setting yields rather than a law assumed to hold.

Stage D's lattice is a **full seal** enumeration: the doors are *every* neighbour of the goal
(a corner goal forces two, a goal against one edge forces three, an interior goal four) and only
the switch n-tuples are enumerated — capped per geometry (`--swcap`, default 1500, printed)
because the n-tuple count grows factorially. The cap is sampling, not a hidden filter: every
landed candidate was proved from its bytes afterwards, and a mutation battery of six controls
fails loudly if any of the obligations went slack. L19's own run set the cap above the family's
whole 4-tuple space, so its census is exhaustive rather than sampled.

`scripts/author-l16-candidates.ts` is rung-parameterised (`--id`, default 16) and the geometry
lattice carries a §6.1.4 clone guard: a spawn/goal/portal triple already present in the shipped
set or among the landed candidates is skipped outright, so a new rung can never be the previous
board with more moves. The script's *name* is historical — it authors whichever rung `--id` asks
for, which is why the L17 commit did not rename it (the L16 commit body cites the path).

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
- **Level AI + Solver — where the metric work stands (LV-007C):** LV-004 embed plumbing; LV-007B's `B` effective / `T` / `R` / `D` (`docs/level-difficulty.md` §5.2); then LV-007C — item 1: the ordered companion **is** gated now, by Aha gate (iii) alone (`refusedBeforeEnteredTiles`; the `lesson-latch-dynamism` check and the pre-L11 acceptance law stay **unordered** by ruling, ADR-architecture-0002 A3 — the two legs are not re-stitched, §8.5 of the pipeline doc); item 2: `D_exec = D − w5·M` printed per level (`difficultyExec`); item 3: `docs/level-difficulty.md` **§3 re-keyed** to the V0.6 execution-axis law — the L5→L6 question is **closed** by ADR-design-0001, not open: the seam is measured **−1.47 on `D_exec`** against **+8.53 on `D`**, and `docs/level-design.md` §6 V0.6 no longer asks for a −2…−3 `D` drop. The one follow-up left is not mine to decide: the **weights** are still the provisional V0.1 hypothesis and need playtest regression (`docs/level-difficulty.md` §2/§4).
- **Level AI + Solver — where the metric work stands (LV-009-B, this handoff):** the L12–L15 block is **in the dataset and proven** (§2d above): `15/15 ok · 0 errors · 28 warnings` on the validator gate, `15/15 PASS` on the solver gate, `par == shortestSolution` 15/15, 0 dead / 0 unrecoverable on the whole set, and the four block rows carry a lesson row and a named gate family (`BLOCK_L1215_*` constants + `blockL1215Gates` in `@/core/solver/policy`, one negative control per gate in `tests/solver/policy-negative-controls.test.ts` §2d). `D_exec` for the block: **8.230769 / 10.898734 / 12.957895 / 14.969697** — the first member below L11's measured 8.573171 (the dip's second beat), the last above the frozen 13.64 block-end floor by 1.329697. The dataset count pin moved 11 → 15 in `tests/e2e/helpers/levels.ts` (the one authorized cross-lane byte).
- **R-003 / UI-ART / GAME-001 — the registry is the one thing left between L12–L15 and play (LV-009-B).** `src/game/levels/level-registry.ts` still imports `l001`–`l011` only, so `?level=12..15` does not resolve to the block; ADR-design-0003 §8 item 6 additionally requires the **UA capture-entry round** (the doors × portals painter seam, the sealed line reading as a wall column, the portal ends reading as a pair) before the four boards are registered as playable. Not this role's edit: named handoff, recorded as `OPEN_QUESTIONS` in the task's return contract.
- **QA — two e2e rows the block moves, both outside this lane (LV-009-B, measured).** (1) `tests/e2e/portal.spec.ts:82` pins the literal `[PORTAL_LEVEL_ID]` against a **dataset-derived** list that is now `[11,12,13,14,15]` — stale by design, since ADR-design-0003 makes portals mandatory on L13–L15 and a shortcut on L12; the pin needs QA's pen, not a data change. (2) `tests/e2e/latch-door.spec.ts:102` is RED on L12 alone ("both fixtures stand on the same tile": expected `(5,1)`, received `(4,2)`) and it is **fixture selection, not a board gap** — `scripts/latch-pair-audit.ts` measures L12 shipping **2** co-located discriminating pairs under the spec's own fixture bookkeeping and **12** under `isLegalMove` alone over its 78 reachable states, while L6–L11 and L13–L15 all read HOLDS. `cheapestDoorFixtures()` picks the cheapest occupancy and the cheapest refusal *independently*; on L12 both are depth 4, and node order lands the refusal at `(5,1)A down` instead of the state that pairs with the depth-3 occupancy at `(4,2)A right`. The spec's docstring ("two reachable states on the same tile in the same phase whose only difference is whether the switch was pressed") describes a search the helper does not implement; no level file is implicated. Measured context: one managed full e2e run reads **107 tests / 8 files → 20 failed · 87 passed**, 19 of the 20 naming the registry gap, and a temporary, uncommitted, reverted registry probe lifts the four UI-walk specs to **74 passed · 2 failed** — so the four boards are winnable through the real UI, L1 → L15 unlock chain included (`docs/ai-native-pipeline.md` §8.10 item 6).
- **Then:** the LLM candidate pipeline (`docs/ai-native-pipeline.md` §8) can consume `validateLevel` + `@/core/solver/policy` unchanged for the next block — schema → rules → BFS → metrics → policy → accept/reject, with rejection (never repair) at every gate.
- **Level AI + Solver — where the metric work stands (LV-008, this handoff):** L11 is authored, proven and shipped in the dataset, and the **last pre-registered law is now measured, not pending** — `D_exec(L11) = 8.573171 < 13.64` ⇔ `D(L11) = 28.573171 < 33.64`, `par = 4`, exactly one opposite-colour pair, no bypass on any par route, below OFFERED (`docs/level-difficulty.md` §3.3/§3.4, §2c above, `tests/solver/l11-portal-gates.test.ts`). The ordered/unordered **block ruling** of ADR-architecture-0002 A3 lands here too: both readers report `[5,0]`, so gate (iii) is carried by the ordered form and no L1–L10 verdict moves.
- **R-003 / UI-ART / GAME-001 — the registry is still frozen, and that is now the *only* thing between L11 and play.** `src/game/levels/level-registry.ts` hardcodes `l001`–`l010` and `tests/unit/renderer-level-unlock.test.ts` asserts exactly that set, so **L11 must not be registered by this role** (AGENTS.md §4). Two conditions gate the unlock, and the first is satisfied by this task: (a) the board is proven playable-by-the-rules (done — and the portal is the *only* object L11 needs that L6–L10 do not), and (b) the §3.3b portal visual evidence (`docs/ui-ux.md` Entry 3, bound to R-003) — a board whose channel is invisible teaches nothing, so registering L11 before the portal painter ships would ship a lie. **Registry-unlock reminder for R-003: the L11 file is ready; the painter and the registry edit are not mine to make.**
- **Game Designer / Playtest Analyst — the open design question this task sharpens:** L11's seam is −5.07 on `D_exec` and only −0.07 on `D`, so a reader using `D` alone will report "no dip at the M2 debut" while the execution axis reports a large one. The weights are still the provisional V0.1 hypothesis (`docs/level-difficulty.md` §2/§4); if the ladder's curve rule is to be read on `D`, the `w5·M` term needs the playtest regression that §4 already asks for — this task deliberately did not re-tune it.