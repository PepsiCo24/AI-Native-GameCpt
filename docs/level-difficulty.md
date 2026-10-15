# Level Difficulty Model & Curve

> Owner: **Agent 4 — Level AI + Solver**
> Version: V0.3 · Date: 2026-10-15
> Status: `D` is **measured** since LV-007B item 3 (`B` effective, `T`, `R` implemented in `src/core/solver/difficulty.ts`); the **weights** are still **provisional** and must be re-calibrated from playtest data.

---

## 1. Why not "board size = difficulty"

A level with an optimal 12-step solution but only one legal move each step can be *easy*. A level with a 6-step solution but 4 plausible-looking choices each step — 3 of which dead-end — can be *very hard*. Difficulty is driven mostly by **how many plausible choices the player sees**, not by board size.

## 2. Metric definition

```
D = w1·L + w2·B + w3·T + w4·R + w5·M
```

| Symbol | Meaning | Source |
|---|---|---|
| `L` | shortest solution length | Solver (BFS) |
| `B` | average effective branching factor (legal, non-dominated moves) | Solver |
| `T` | required lookahead depth (max depth where an alternative leads to dead-end) | Solver |
| `R` | dead-end / unrecoverable-mistake ratio | Solver enumeration |
| `M` | number of simultaneously enabled mechanics | Level metadata |

Also computed but treated as diagnostics, not primary score:

- `numSolutions` — too many solutions can mean a level is under-constrained.
- `forcedMoveRatio` — high ratio ⇒ "fake hard" (trivially forced).
- `maxSearchDepth`.

### Provisional weights (V0.1 — NOT final)

| Weight | Value | Note |
|---|---|---|
| w1 (L) | 1.0 | dominates sanity but not skill |
| w2 (B) | 3.0 | main driver of "thinking" |
| w3 (T) | 4.0 | planning depth is the real skill |
| w4 (R) | 2.0 | punish for dead-ends, but casual-friendly cap |
| w5 (M) | 5.0 | each new mechanic adds cognitive load |

> These weights are a starting hypothesis only. They will be replaced by regression against real playtest data (Mistake Rate, Retry Rate, First Win Time).

### 2a. The five terms, pinned as implemented (LV-007B item 3)

The table above is the model; this is the **reading the program actually computes** (`src/core/solver/difficulty.ts`, exposed as `LevelAudit.difficulty` and printed by `scripts/solve-levels.ts`). It is written down because two of the five rows admit a second reading, and the choice is a definition, not an implementation detail:

| Term | Pinned reading | Why this one |
|---|---|---|
| `L` | the solver's `shortestSolution` (BFS). | Already the level gate's number (`§5.1`); the file's `par` is checked against it. |
| `B` | **effective** branching factor: mean, over the reachable states, of the number of **legal moves whose successor attains the minimum remaining distance to a goal**. Unit-cost distance comes from an **exact reverse BFS** over the reachable graph (never a Manhattan estimate), so walls, doors, portals and latch state are all included by construction. Ties count — two equally short continuations are two real choices. | §2 says "legal, non-dominated". A state whose successors are all goal-unreachable ties every move at `∞` and counts its whole out-degree (a degenerate case that can only occur outside §4). |
| `T` | the greatest depth of a reachable state that has a legal move into a **goal-unreachable** state — §5.1's "the depth at which an alternative becomes unrecoverable". | The literal reading of §2's "max depth where an alternative leads to dead-end". **Consequence, stated rather than hidden: `T ≡ 0` inside `docs/level-design.md` §4** (`noUnrecoverableOk`), so `w3·T` cannot contribute on a shippable level. |
| `R` | dead-end ratio: reachable **non-goal states with zero legal out-edges** ÷ reachable states. | §2 conflates "dead-end" and "unrecoverable-mistake". Only the first is a dead end; the goal-unreachability share is reported separately as `unrecoverableRatio` (a diagnostic, not `R`). `R ≡ 0` inside §4 too. |
| `M` | number of simultaneously enabled mechanics = `1 + [doors non-empty] + [switches non-empty] + [portals non-empty]`. | The base `1` is the phase flip itself; a **category** counts once however many objects it holds, so "M3" always means the same construction on every board. |

Diagnostics, reported with every breakdown but carrying **no weight**:

- `bRaw` — plain mean legal out-degree. **This is not the `B` of `D`** (it is the number `§5.1` recorded before `B` existed).
- `forcedMoveRatio` — share of reachable states with exactly one legal move ("fake hard" detector).
- `lookaheadDepth` — the **other** reading of `T`: the deepest state on a completable prefix from which some legal move can no longer still finish within `L`. It is recorded so a re-worded `T` has a measured number to adopt instead of a definition invented to make a curve look nice; on the shipped L1–L10 it saturates at `L − 1` (§5.2).
- `unrecoverableRatio` — goal-unreachable states ÷ reachable states (the companion of `R`).
- `reachableStates` — the graph size the whole breakdown was taken over.
- `weights` — the weight vector the number was computed with, so a stored `D` can never be re-read against a later re-calibration by mistake.

`D = null` **iff** the board is unsolvable (`L = null`): no solution ⇒ no curve spot, and no fabricated number. `D` is deliberately **not** part of the solver's §8 `SolveResult` contract — the weights are a hypothesis, and freezing them into the published solver interface would make a playtest-driven re-calibration an API change. Re-calibrating is **one edit** to `DIFFICULTY_WEIGHTS` plus this §2 table.

## 3. Target curve (non-monotonic on purpose)

```
D
│                                        ╭─── Final Exam (L50)
│                              ╭────╮  ╭──╯
│                       ╭──────╯    ╰──╯
│            ╭────╮  ╭──╯
│      ╭─────╯    ╰──╯        ← dip when a new mechanic is taught
│ ╭────╯
│─╯
└─────────────────────────────────────────────────▶ L
 1   10    20    25    36      45   50
```

| Block | Target D band (relative) | Intent |
|---|---|---|
| L1–L3 | 1–2 (lowest) | teach, no friction |
| L4–L6 | 3–4 | first consequence awareness |
| L7–L10 | 5–6 | first Aha, satisfying not punishing |
| L11–L20 | 6–8 | planning, false routes |
| L21–L25 | **dip to 5–6** | introduce Phase Door calmly |
| L26–L35 | 8–11 | combine wall + door |
| L36–L40 | **dip to 8**, then rise | introduce Phase Portal |
| L41–L45 | 12–15 | 3–5 step lookahead |
| L46–L49 | 15–17 | dense composite |
| L50 | 16–17 (spike, but fair) | recombine only known mechanics |

Rules:

- Difficulty must **never** rise monotonically step-by-step.
- A new-mechanic block always **starts with a dip**.
- The Final Exam introduces **no new mechanic**.

## 4. Calibration loop

```
Solver D
   ↓
order candidate levels onto the curve
   ↓
human playtest (Mistake Rate / Retry Rate / First Win Time)
   ↓
compare predicted vs. experienced difficulty
   ↓
adjust weights + level parameters
   ↓
Solver revalidates
```

## 5. Recorded per-level metrics

Every accepted level stores its solver metrics in the level file / sidecar so the curve can be recomputed at any time. See `docs/ai-native-pipeline.md` §4.

### 5.1 L1–L10, measured (2026-10-15, LV-006)

Re-derivable with `node_modules/.bin/tsx scripts/solve-levels.ts` (per-level dump) and
`node_modules/.bin/tsx scripts/author-lv006-candidates.ts` (the L6–L10 candidate families).

| Level | `L` (par) | `M` (mechanics) | reachable states | `B_raw` | forced-move ratio | dead states | `maxSearchDepth` | `refusedThenEnteredTiles` | `dualPhaseTiles` | `parRoutes` / `embedRoutes` | switch required |
|---|---|---|---|---|---|---|---|---|---|---|---|
| L1 | 4 | 1 | 15 | 2.93 | 0.00 | 0 | 5 | 0 | 0 | 1 / 0 | n/a |
| L2 | 5 | 1 | 16 | 3.00 | 0.00 | 0 | 6 | 0 | 0 | 10 / 0 | n/a |
| L3 | 6 | 1 | 14 | 2.57 | 0.00 | 0 | 6 | 0 | 0 | 6 / 0 | n/a |
| L4 | 6 | 1 | 19 | 2.84 | 0.00 | 0 | 6 | 0 | 0 | 6 / 3 | n/a |
| L5 | 6 | 1 | 18 | 2.78 | 0.11 | 0 | 6 | 0 | 0 | 3 / 3 | n/a |
| L6 | 4 | 3 | 29 | 2.76 | 0.00 | 0 | 6 | 1 | 0 | 1 / 1 | no (documented dip) |
| L7 | 4 | 3 | 12 | 2.00 | 0.25 | 0 | 4 | 1 | 0 | 2 / 2 | yes |
| L8 | 6 | 3 | 34 | 2.82 | 0.12 | 0 | 8 | 1 | 0 | 6 / 6 | yes |
| L9 | 8 | 3 | 58 | 2.59 | 0.03 | 0 | 15 | 2 | 0 | 2 / 2 | yes |
| L10 | 9 | 3 | 42 | 2.95 | 0.10 | 0 | 9 | 1 | 0 | 36 / 36 | yes |

Definitions, so the table cannot be misread:

- `L` = `shortestSolution` **from the solver**; the file's `par` must equal it or the level gate FAILs (`docs/level-design.md` §3).
- `M` = simultaneously enabled mechanics, counted from the level data (`1 + doors + switches + portals`, each non-empty list contributing 1).
- `B_raw` = average legal out-degree over the reachable graph (edges ÷ states). **This is NOT the `B` of §2** — §2's `B` is the *effective* branching factor (legal **and non-dominated** moves), measured separately in §5.2. `B_raw` is kept because it is exact and free, and it is now the *control* that proves the dominance filter is not dead code (`B < B_raw` on 10/10).
- forced-move ratio = share of reachable states with exactly one legal move.
- `deadEndRatio` `R` = 0 on 10/10 levels (no reachable non-goal state has zero legal moves) — the §4 casual-friendliness cap is trivially satisfied today, and this table's `dead states` column is the same quantity §5.2 reports as `R`.
- `maxSearchDepth` = the depth the *wandering* BFS reached. It is **not** `T` and must not be read as `T`: it measures unexplored frontier depth, not the depth at which an alternative becomes unrecoverable (§2a, §5.2).
- `parRoutes / embedRoutes` = shortest routes / how many of them end embedded (LV-004 plumbing, `docs/ai-native-pipeline.md` §8). The metric reports **that** some arrival was embedded, not **which** tile did it: on L6–L10 the embedding arrival is typically a **door** tile (a door that latches closed under the player after the flip) — a different construction from L4/L5's wall echo, and L10 carries both. See `src/levels/README.md` §2b/§3.

**Curve read-out (block L6–L10, the latch unit).** `L` runs 4 → 4 → 6 → 8 → 9: the block **starts with a dip** (L6 par 4, the lowest in the game) while `M` jumps 1 → 3, exactly the §3 rule "a new-mechanic block always starts with a dip" — the mechanic count rises, the move count does not. `B_raw` stays flat (2.0–3.0) for every level, so **difficulty is not coming from raw branching**; it comes from planning depth and latch state (L9 `maxSearchDepth` 15 against `par` 8: the board offers long, useless wandering before the ordered plan is found).

**The §5.1 gap is now closed — but on the move-count axis, not on `D`.** `B` (effective), `T`, `R` and `D` were recorded here as *plainly missing* until LV-007B item 3. They are measured now (§5.2), and the result contradicts the §3 curve rule where it matters: the L5→L6 dip is **–2 on `L` and +8.53 on `D`** (§5.2). No number here is estimated or back-filled; §5.1 stays the raw solver dump and §5.2 is the model.

### 5.2 The §2 model, measured (LV-007B item 3)

Re-derivable with `node_modules/.bin/tsx scripts/solve-levels.ts` (the `difficulty` and
`difficultyDiagnostics` lines per level) and pinned by `tests/solver/difficulty.test.ts`
(one assertion set per level, values below reproduced to 6 decimals). Weights are §2's
**provisional** `w1…w5 = 1, 3, 4, 2, 5` — echoed into every row so no stored `D` can be
re-read against a later re-calibration.

| Level | `L` | `B` | `T` | `R` | `M` | `D = 1·L + 3·B + 4·T + 2·R + 5·M` | `lookaheadDepth` (diag.) |
|---|---|---|---|---|---|---|---|
| L1 | 4 | 1.6667 | 0 | 0 | 1 | **14.00** | 3 |
| L2 | 5 | 1.6875 | 0 | 0 | 1 | **15.06** | 4 |
| L3 | 6 | 1.4286 | 0 | 0 | 1 | **15.29** | 5 |
| L4 | 6 | 1.5263 | 0 | 0 | 1 | **15.58** | 5 |
| L5 | 6 | 1.4444 | 0 | 0 | 1 | **15.33** | 5 |
| L6 | 4 | 1.6207 | 0 | 0 | 3 | **23.86** | 3 |
| L7 | 4 | 1.2500 | 0 | 0 | 3 | **22.75** | 3 |
| L8 | 6 | 1.5000 | 0 | 0 | 3 | **25.50** | 5 |
| L9 | 8 | 1.3793 | 0 | 0 | 3 | **27.14** | 7 |
| L10 | 9 | 1.5476 | 0 | 0 | 3 | **28.64** | 8 |
| **L11 (hook — not authored)** | — | — | — | — | — | **—** | — |

Definitions are §2a's, not re-stated per row. Two things this table says that §5.1 could not:

- **`T ≡ 0` and `R ≡ 0` on 10/10, and that is a theorem, not a hole.** `docs/level-design.md` §4 forbids exactly the states these two terms measure (`noUnrecoverableOk`, no dead states — both re-checked per level in the test file), so inside the acceptance region `D = L + 3·B + 5·M`. `w3` and `w4` are therefore **inert for any shippable level**: they cannot be used to shape the curve while §4 stands. The zero is *measured*, not assumed — the test file pairs it with a §4-violating control board (a portal that deposits the player in a sealed room) on which `T > 0`, `R > 0` and both weights really move `D`.
- **`B` is a real filter, and it is not `B_raw`.** `B < B_raw` on every level (L1 1.67 vs 2.93 … L9 1.38 vs 2.59) — the "non-dominated" qualifier in §2 costs about a third of the apparent branching, which is why substituting `B_raw` into `D` would have inflated the whole curve.

**The L5→L6 seam, measured (the block-opening dip §3 asks for):** `D` **rises by +8.528736**, decomposed exactly as ΔL = **−2**, ΔB = **+0.528736**, ΔM = **+10**, ΔT = ΔR = 0. The design target (`docs/level-design.md` §6: the first level of a new-mechanic block sits **2–3 points below** the previous block's peak) is therefore **missed, with the sign inverted**, and it is missed **by construction at these weights**: introducing a mechanic adds `5·ΔM` (+10 here) in the very step where the dip is supposed to lower the score, while par can only fall to the block's floor (4, the game's lowest) and `B` does not fall at all. A −2…−3 `D` dip at a mechanic introduction is **unreachable** with `w = (1, 3, 4, 2, 5)` no matter what the board looks like.

**Recorded, not smoothed.** No weight was tuned to manufacture the dip and no definition was re-worded to make the curve look right: the formula is the doc's, the weights are the doc's, and the disagreement is published here. It is a **weight/definition question for the Game Designer** (see the open items in `docs/level-design.md` §6), with two levers this measurement makes concrete: (a) re-weight `w5` (or let `M` count *new* mechanics instead of total ones, which is what §3's dip rule actually describes), or (b) adopt the weightless `lookaheadDepth` as the real `T` — it is measured on every level, but note it **saturates at `L − 1`** on all ten (the deepest state where a move can waste the par is always exactly one step before the goal), so it is not a differentiator either.

**L11 hook row.** L11 is where ADR-0009 schedules **M2 (portals)**, i.e. the first `M` step since L6 and the first board on which `dualPhaseTiles ≥ 1` becomes satisfiable. Two things land with it and both are *measurements to take*, not numbers to fill in: the M2 row of this table, and the promotion of the ordered companion metric `refusedBeforeEnteredTiles` from reported-only to gate (ADR-architecture-0002's implementation trigger: it MUST land before the first L11+ portal candidate is accepted; ADR-0009 decision 4 / `docs/ai-native-pipeline.md` §8.5 keep the acceptance law on the **unordered** form). The row above is deliberately empty — this document does not pre-fill a level that does not exist.

### 5.3 Measured metrics are the only claim

The two tables above are generated by the program, never by a model: `L1–L10` par values are the solver's `shortestSolution` (the level gate FAILs on any mismatch), the state/route counts come from the same BFS that proves solvability, `refusedThenEnteredTiles` / `dualPhaseTiles` come from `@/core/solver/bfs` with the definitions of `docs/architecture.md` §8 / ADR-0009, and `B`/`T`/`R`/`D` come from `@/core/solver/difficulty.ts` reading that same graph (§2a). Where a field is missing it is named as missing — `L11`'s row is empty, not estimated.

## 6. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial metric definition + provisional weights + target curve | Agent 4 |
| 2026-10-15 | V0.2 | **LV-006** — new **§5.1 measured metrics for L1–L10** (source, definitions and the block read-out for the latch unit). Records explicitly that `B` (effective), `T`, `R` and therefore `D` are **still unmeasured** — no stand-in is published; `B_raw` (average legal out-degree) is labelled as NOT the §2 `B`. Also records the L6–L10 design deviation (see §5.1/`src/levels/README.md` §2b–§4) so the difficulty rows are traceable | Level AI + Solver (LV-006) |
| 2026-10-15 | V0.3 | **LV-007B item 3 — the §5.1 gap is closed by measurement.** New **§2a** pins the implemented reading of all five terms (`B` effective = non-dominated legal moves against an exact reverse-BFS distance; `T` literal ⇒ `≡ 0` under §4; `R` = dead states ÷ reachable states with `unrecoverableRatio` as its named companion; `M` = categories; `bRaw`/`forcedMoveRatio`/`lookaheadDepth`/`unrecoverableRatio` demoted to weightless diagnostics) and states that `D` is **not** added to the §8 `SolveResult` contract because the weights are provisional (re-calibration = one constant). New **§5.2** publishes `B`/`T`/`R`/`M`/`D` for L1–L10, the `T ≡ R ≡ 0` theorem inside the §4 acceptance region (so `D = L + 3·B + 5·M` there and `w3`/`w4` are inert), the `B < B_raw` control, the **L5→L6 seam = +8.528736** with its exact decomposition (ΔL −2 · ΔB +0.529 · ΔM +10), the explicit statement that the −2…−3 dip `docs/level-design.md` §6 asks for is **unreachable at these weights by construction**, and an **empty L11 hook row** (M2 debut) that also carries the `refusedBeforeEnteredTiles` promotion trigger. Former §5.2 → **§5.3**. No weight tuned, no definition re-worded to flatter the curve; the contradiction is reported as-is | Level AI + Solver (LV-007B) |