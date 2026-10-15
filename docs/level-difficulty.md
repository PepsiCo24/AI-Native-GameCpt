# Level Difficulty Model & Curve

> Owner: **Agent 4 — Level AI + Solver**
> Version: V0.5 · Date: 2026-10-15
> Status: `D` is **measured** since LV-007B item 3 (`B` effective, `T`, `R` implemented in `src/core/solver/difficulty.ts`) and its **execution axis** `D_exec = D − w5·M` is published as of LV-007C item 2; as of **item 3** §3's target curve is **re-keyed** to the V0.6 execution-axis law (`docs/level-design.md` §6 / ADR-design-0001) — the pre-ADR-0009 schedule (door at L21, portal at L36) and the pre-measurement absolute `D` bands are **withdrawn by name**, and every number with legal force is now **measured**: L1–L10 since LV-007B, and **L11 since LV-008** — the pre-registered `D_exec(L11) < 13.64` was satisfied (`8.5732`) and is filed as measured, not as pending. The **weights** are still **provisional** and must be re-calibrated from playtest data.

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

### 2b. The execution axis `D_exec` — published as a column (LV-007C item 2)

The dip law of `docs/level-design.md` §6 (V0.6, ADR-design-0001) does not live on `D`: a mechanic debut **must** raise `w5·M` (the player really is learning something) in the very step where a "dip" was demanded on the single scalar. The law was therefore re-anchored on the part the player feels as hands-and-search:

```
D = D_exec + D_learn
D_exec  = D − w5·M = w1·L + w2·B + w3·T + w4·R   ← the execution axis (dip law)
D_learn = w5·M                                    ← comprehension tax (never dips at a debut)
```

`D_exec` is **purely derived** — no new measurement, no new weight, no change to `D`'s formula or arithmetic (`D`'s published values are byte-identical to V0.3's). It is computed in `src/core/solver/difficulty.ts` **from the formula's own non-`M` terms** and printed next to the subtraction on the CLI:

```
difficultyExec Dexec=13.64 = D(28.64) − 5·M(3) = 1·L(9) + 3·B(1.5476) + 4·T(0) + 2·R(0.0000) · execution axis
```

Both forms are printed on purpose: the identity `D − w5·M = w1·L + w2·B + w3·T + w4·R` is then checked by the reader, and pinned by the suite (`tests/solver/difficulty.test.ts` §2c asserts both forms plus the `L + 3·B` collapse inside `docs/level-design.md` §4). `D_exec = null` **iff** `D = null` (no solution ⇒ no position on either axis). This is the ADR's convenience ticket, taken: "adding a `D_exec` column to the report would spare every reader the subtraction".

## 3. Target curve (non-monotonic on purpose) — re-keyed to the V0.6 execution-axis law (LV-007C item 3)

**Authority.** The curve is the Game Designer's (`docs/level-design.md` **§6** V0.6, ruled at GD-008 / **ADR-design-0001**; block boundaries from `docs/game-design.md` **§8**). This section is the difficulty model's restatement of it and is deliberately **narrower than the law**: it adds no number, no weight and no rule — it removes the pre-measurement ones.

### 3.1 What the pre-V0.6 table said — withdrawn, and why (kept for the record)

V0.1–V0.3 of this section carried two things that measurement and ADR-0009 jointly killed. They are withdrawn here by name rather than deleted, so no later reader can "rediscover" them:

| Withdrawn row (pre-V0.6) | Why it has no force |
|---|---|
| L21–L25 **"dip to 5–6" — introduce Phase Door calmly** | M1 (Phase Door) is not introduced at L21: it ships at **L6**, paired with M3 (switch) as **one teaching unit** (GATE D / ADR-0009; `docs/game-design.md` §8, `docs/level-design.md` §5). L21–L25 sits inside the **L16–L25 latch-fluency** block — an `M`-plateau with **no debut**, hence no dip. |
| L36–L40 **"dip to 8, then rise" — introduce Phase Portal** | M2 (portal) is not introduced at L36: it ships at **L11** (same ruling). L36–L45 is **synthesis** — no debut, no dip. |
| Absolute `D` bands (`L1–L3: 1–2` … `L50: 16–17`) | Written **before `D` was computable**. The measured `D` of the *shipped teaching ten alone* is **14.00–28.64** (§5.2) — the bands below "L26–L35: 8–11" are already falsified by four levels that exist, at the doc's own weights. They are not a target to author against, and they are **not replaced by new absolute bands** (§3.4): inventing a fresh band schedule nobody has measured would repeat exactly the mistake §5.2 documents. |

Neither withdrawal changes a rule of the game — the mechanic schedule and the seam list were decided in ADR-0009 and only their *difficulty-doc transcription* was stale.

### 3.2 The shape: a sawtooth on `D_exec`, a step-up on `D`

```
D_exec  (the dip axis)                    ╭──╮            ╭─────╮
│                                  ╭─────╯  ╰──╮        ╱       ╰──╮       ╭─── Final Exam
│                           ╭──────╯           ╰───╮   ╱             ╰─────╯     (max on both axes)
│                    ╭──────╯   ▼ dip at L6        ▼ dip at L11
│            ╭───────╯
│     ───────╯
└──────────────────────────────────────────────────────────────────────▶ L
  1–5      6       11           16 …                      36 …     46   50

D = D_exec + w5·M          ┌──┐                        ← the TOTAL steps **up** at every
│                          │  │   ┌──┐                  debut by the comprehension tax
│  ────────────────────────┘  └───┘  └─────────────     `w5·ΔM` (+8.53 measured at
│                                                       L5→L6): admitted, never hidden
└──────────────────────────────────────────────────────────────────────▶ L
                          L6      L11      (the same two seams, one axis apart)
```

The two drawings are the same curve read twice — the ADR's whole point. A debut **must** raise `w5·M` (the player really is learning something new), so the search for a "dip" on the total was a search for a sign that cannot exist; on the execution axis the dip is real, measured, and now printed per level (§2b).

### 3.3 The curve, keyed to the schedule it must match

Ranges are `docs/game-design.md` §8's, verbatim. **`ΔM > 0` occurs exactly twice in the 50-level schedule — L6 and L11** (ADR-0009: those are the only mechanic-introduction seams), so those are the only two places a dip may be scheduled at all.

| Block (`game-design.md` §8) | Mechanic event | Intent (`level-design.md` §5) | Target on the **execution axis** `D_exec` |
|---|---|---|---|
| L1–L2 | — (M0 literacy) | tap → move → flip; the flip is harmless on purpose | **measured** 9.00 / 10.06 (§5.2) |
| L3 | — (M0) | the first honest "no": a *permanent* wall refusal, route around | **measured** 10.29 |
| L4–L5 | — (M0) | the phantom walk: enter an echo, it solidifies under you, walk out | **measured** 10.58 / 10.33 → **block-1 peak = 10.58** |
| **L6–L10** | **SEAM — M1+M3 as one latch unit, Aha #1 at L8** | latch decisions; the block dips at L6 | **seam law measured ✓** debut L6 = **8.86 < 10.58** (−1.72 vs peak, −1.47 vs L5); dip spans L6–L7 (8.86 / 7.75, both par 4); block ramps to **13.64 > 10.58 ✓** — sawtooth confirmed |
| **L11–L15** | **SEAM — M2 portals, Aha #2** | opposite-colour pairs only; parity truly breaks; the block dips at L11 | **seam law measured ✓ (LV-008)** — debut L11 = **8.5732 < 13.64** (−5.07 vs L10's 13.6429, the previous block's peak), with `D(L11) = 28.5732 < 33.64`; the pre-registration was published before any candidate existed (V0.6 / ADR-design-0001) and is now satisfied as authored: **par 4**, a single opposite-colour pair, no false routes, below-OFFERED grade. The block's `D_exec` must still **exceed 13.64 by its end**; a shipped L11 that had violated the law would have been a rejected level, whatever its other virtues |
| L16–L25 | — (latch fluency) | chained / timed switches, 2-step lookahead | strictly above the previous block's peak; ramp inside the block; **no dip** (no `ΔM`) |
| L26–L35 | — (portals integrated) | routes re-priced by latch state *and* approach side | strictly above the previous block's peak |
| L36–L45 | — (synthesis, all mechanics) | 3–5 step lookahead, deceptive geometry, all rules live | strictly above the previous block's peak |
| L46–L49 | — (density peak) | high-interaction boards, longest pars, zero new rules | the highest ship-content `D_exec` before L50 |
| L50 | — **Final Exam: no new mechanic** | recombine only what was taught; graduation, not luck | the curve's **maximum on both axes** — a spike that is fair because nothing in it is new |

### 3.4 Rules (binding)

- Difficulty must **never** rise monotonically step-by-step — no mechanical staircase, on either axis.
- **Seam law** (the precise form of "a new-mechanic block starts with a dip"): at every seam (`ΔM > 0`) the debut level's `D_exec` sits **strictly below the previous block's `D_exec` peak**. Equivalent budget form: `D(debut) − D(previous block peak) < w5·ΔM` — the entire `D` rise at a debut is comprehension tax, never execution.
- **Sawtooth:** inside a block, `D_exec` ramps until it **exceeds the previous block's `D_exec` peak**. A block that ends below its predecessor's peak is a flat spot, not a curve.
- **Construction floor** (unchanged by the re-axing): the debut level — and its successor where the block allows — is short (**par ≤ 4** in the teaching span, L1–L15), single-concept (one new mechanic *unit*), free of false routes, and teaches **below OFFERED**: demonstrated by walking, not demanded (the L6 precedent `switchRequired = false`, a named concession never scored as FORCED — `docs/ai-native-pipeline.md` §8.5 OQ4).
- **Rejection teeth** (unchanged): a debut candidate that breaks the seam law is **rejected or redesigned**. No exceptions — and the rejection is program-side (`scripts/` gate + Solver on `applyMove`'s own graph), never a model's opinion.
- The **Final Exam introduces no new mechanic**.
- A mechanic introduced anywhere other than **L6 / L11** is a *schedule* change: it needs a Game Designer ruling (ADR-0009 class), not an edit to this table.

### 3.5 Which numbers have legal force today — and which deliberately do not

- **L1–L11: measured** (§5.2, reproduced by `scripts/solve-levels.ts`, pinned by `tests/solver/difficulty.test.ts`). This is the only stretch of the curve with a program behind it.
- **L11's target was pre-registered before any candidate existed, and is now filed as measured.** `D_exec(L11) < 13.64` (⇔ `D(L11) < 33.64`) was published by GD in `docs/level-design.md` §6 and carried in §5.2's hook row; **LV-008** authored the board against it and the Solver returned **8.5732** (28.5732 on `D`). The record keeps the order of events, because that order is the whole guarantee: the bound was *not* read off the level — the level was filtered to the bound (`scripts/author-l11-candidates.ts`, 54 candidates, 1 accept, `shipped=MATCH`).
- **L12–L50: no numeric target is published here**, on purpose. Every value would be unfitted (the §2 weights are V0.1-provisional) and unmeasurable (the levels do not exist). What is fixed above L11 is the **ordering** — strictly above the previous block's peak, ramp within the block, never a staircase — plus the construction floor at any seam. Numbers enter this document only by (a) authoring a level and having the Solver measure it, or (b) regression of `w1…w5` against playtest data (§4). No third path — that is the discipline §5.2's falsified-band record exists to enforce.
- **Weights are echoed, so no re-read can drift:** every published row carries the weight vector it was computed with (§2a/§5.2). A future re-calibration **recomputes** the seam law; it never re-interprets a stored number.
- The **felt half** of the valley (first-win time, restarts, undos, refusals at a debut vs the previous block's close) is not a Solver quantity: it is the Playtest Analyst clause named in `docs/level-design.md` §6, a labelled hypothesis until the Stage-2/3 protocol runs with thresholds frozen before the cohort.

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

**Where the numbers actually live (V0.3 correction).** No metric is *stored* today: the frozen level schema carries no metrics field, and no sidecar exists. Every number in §5.1/§5.2 is **recomputed from the shipped data on demand** — `node_modules/.bin/tsx scripts/solve-levels.ts` is the per-level dump (and the only thing that must stay reproducible), and `tests/solver/difficulty.test.ts` pins the §5.2 table so a regression is a RED test rather than a drifted document. Whether accepted levels should also *persist* their metrics (file field / sidecar — the earlier wording of this section assumed one) is an open decision because it touches the frozen schema; it is recorded as an OPEN_QUESTION in the LV-007B handoff. See `docs/ai-native-pipeline.md` §4 for the metric inventory.

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
- `B_raw` = average legal out-degree over the reachable graph (edges ÷ states). **This is NOT the `B` of §2** — §2's `B` is the *effective* branching factor (legal **and non-dominated** moves), measured separately in §5.2. `B_raw` is kept because it is exact and free, and it is now the *control* that proves the dominance filter is not dead code (`B < B_raw` on all ten rows of this table — and on L11 too, 1.5244 < 2.9756, §5.2).
- forced-move ratio = share of reachable states with exactly one legal move.
- `deadEndRatio` `R` = 0 on all ten levels of this table, and on L11 (§5.2) — no reachable non-goal state has zero legal moves — the §4 casual-friendliness cap is trivially satisfied today, and this table's `dead states` column is the same quantity §5.2 reports as `R`.
- `maxSearchDepth` = the depth the *wandering* BFS reached. It is **not** `T` and must not be read as `T`: it measures unexplored frontier depth, not the depth at which an alternative becomes unrecoverable (§2a, §5.2).
- `parRoutes / embedRoutes` = shortest routes / how many of them end embedded (LV-004 plumbing, `docs/ai-native-pipeline.md` §8). The metric reports **that** some arrival was embedded, not **which** tile did it: on L6–L10 the embedding arrival is typically a **door** tile (a door that latches closed under the player after the flip) — a different construction from L4/L5's wall echo, and L10 carries both. See `src/levels/README.md` §2b/§3.

**Curve read-out (block L6–L10, the latch unit).** `L` runs 4 → 4 → 6 → 8 → 9: the block **starts with a dip** (L6 par 4, the lowest in the game) while `M` jumps 1 → 3, exactly the §3.4 rule "a new-mechanic block always starts with a dip" — the mechanic count rises, the move count does not. `B_raw` stays flat (2.0–3.0) for every level, so **difficulty is not coming from raw branching**; it comes from planning depth and latch state (L9 `maxSearchDepth` 15 against `par` 8: the board offers long, useless wandering before the ordered plan is found).

**The §5.1 gap is now closed — but on the move-count axis, not on `D`.** `B` (effective), `T`, `R` and `D` were recorded here as *plainly missing* until LV-007B item 3. They are measured now (§5.2), and the result contradicted the §3 curve rule where it matters: the L5→L6 dip is **–2 on `L` and +8.53 on `D`** (§5.2). (That reading stands as taken at LV-007B; the contradiction was then resolved by a change of *axis*, not of numbers — §2b, §3.2, ADR-design-0001 — and §3 was re-keyed to the resolved law at LV-007C item 3.) No number here is estimated or back-filled; §5.1 stays the raw solver dump and §5.2 is the model.

**L11 is not in this table** — the section is the LV-006 record for the ten levels that existed then, and L11 was authored at LV-008. Its raw dump row lives in `src/levels/README.md` §0b (shortest 4 · reachable 82 · `refusedThenEnteredTiles` 1 `[5,0]` · `dualPhaseTiles` **21** · `parRoutes`/`embedRoutes` 1 / 1 · `switch required`: no, `"exempt"` row), and its model row is §5.2's. Nothing in the ten rows above moved.

### 5.2 The §2 model, measured (LV-007B item 3)

Re-derivable with `node_modules/.bin/tsx scripts/solve-levels.ts` (the `difficulty`,
`difficultyDiagnostics` and `difficultyExec` lines per level) and pinned by
`tests/solver/difficulty.test.ts` (one assertion set per level, values below reproduced
to 6 decimals). Weights are §2's **provisional** `w1…w5 = 1, 3, 4, 2, 5` — echoed into
every row so no stored `D` can be re-read against a later re-calibration.

| Level | `L` | `B` | `T` | `R` | `M` | `D = 1·L + 3·B + 4·T + 2·R + 5·M` | `D_exec = D − 5·M` (§2b) | `lookaheadDepth` (diag.) |
|---|---|---|---|---|---|---|---|---|
| L1 | 4 | 1.6667 | 0 | 0 | 1 | **14.00** | 9.00 | 3 |
| L2 | 5 | 1.6875 | 0 | 0 | 1 | **15.06** | 10.06 | 4 |
| L3 | 6 | 1.4286 | 0 | 0 | 1 | **15.29** | 10.29 | 5 |
| L4 | 6 | 1.5263 | 0 | 0 | 1 | **15.58** | 10.58 | 5 |
| L5 | 6 | 1.4444 | 0 | 0 | 1 | **15.33** | 10.33 | 5 |
| L6 | 4 | 1.6207 | 0 | 0 | 3 | **23.86** | **8.86** | 3 |
| L7 | 4 | 1.2500 | 0 | 0 | 3 | **22.75** | **7.75** | 3 |
| L8 | 6 | 1.5000 | 0 | 0 | 3 | **25.50** | 10.50 | 5 |
| L9 | 8 | 1.3793 | 0 | 0 | 3 | **27.14** | 12.14 | 7 |
| L10 | 9 | 1.5476 | 0 | 0 | 3 | **28.64** | 13.64 | 8 |
| **L11** (M2 debut, **measured** LV-008) | 4 | 1.5244 | 0 | 0 | **4** | **28.57** | **8.57** | 3 |

Definitions are §2a's, not re-stated per row. Two things this table says that §5.1 could not:

- **`T ≡ 0` and `R ≡ 0` on 11/11, and that is a theorem, not a hole.** `docs/level-design.md` §4 forbids exactly the states these two terms measure (`noUnrecoverableOk`, no dead states — both re-checked per level in the test file), so inside the acceptance region `D = L + 3·B + 5·M`. `w3` and `w4` are therefore **inert for any shippable level**: they cannot be used to shape the curve while §4 stands. The zero is *measured*, not assumed — the test file pairs it with a §4-violating control board (a portal that deposits the player in a sealed room) on which `T > 0`, `R > 0` and both weights really move `D`.
- **`B` is a real filter, and it is not `B_raw`.** `B < B_raw` on every level (L1 1.67 vs 2.93 … L9 1.38 vs 2.59, and L11 1.52 vs 2.98) — the "non-dominated" qualifier in §2 costs about a third of the apparent branching, which is why substituting `B_raw` into `D` would have inflated the whole curve.
- **The new column is the axis the dip law lives on.** `D_exec` **falls 10.33 → 8.86** across L5→L6 (Δ **−1.47**) while `D` rises +8.53 — the same seam, read on the axis `docs/level-design.md` §6 re-anchored at GD-008 (ADR-design-0001), now published as a column instead of left as a subtraction for the reader (§2b). The dip spans exactly the two par-4 levels (L6 8.86, L7 7.75) and the block then ramps to 13.64 > L4's 10.58: the sawtooth is visible on this axis and nowhere on `D`.

**The L5→L6 seam, measured (the block-opening dip §3 asks for):** `D` **rises by +8.528736**, decomposed exactly as ΔL = **−2**, ΔB = **+0.528736**, ΔM = **+10**, ΔT = ΔR = 0. The design target as it read at the time (`docs/level-design.md` §6 **V0.5** — superseded at GD-008 by ADR-design-0001, and the clause measured here is the pre-V0.6 one: the first level of a new-mechanic block sits **2–3 points below** the previous block's peak) is therefore **missed, with the sign inverted**, and it is missed **by construction at these weights**: introducing a mechanic adds `5·ΔM` (+10 here) in the very step where the dip is supposed to lower the score, while par can only fall to the block's floor (4, the game's lowest) and `B` does not fall at all. A −2…−3 `D` dip at a mechanic introduction is **unreachable** with `w = (1, 3, 4, 2, 5)` no matter what the board looks like.

**Recorded, not smoothed.** No weight was tuned to manufacture the dip and no definition was re-worded to make the curve look right: the formula is the doc's, the weights are the doc's, and the disagreement is published here. It was a **weight/definition question for the Game Designer** (see the open items in `docs/level-design.md` §6), with two levers this measurement made concrete: (a) re-weight `w5` (or let `M` count *new* mechanics instead of total ones, which is what §3.4's seam rule actually describes), or (b) adopt the weightless `lookaheadDepth` as the real `T` — it is measured on every level, but note it **saturates at `L − 1`** on all ten (the deepest state where a move can waste the par is always exactly one step before the goal — and L11 keeps the property: 3 = 4 − 1, §5.2), so it is not a differentiator either. **The question is closed** (GD-008 / ADR-design-0001): lever (a) was taken *as a decomposition rather than a re-weighting* — `w5` is unchanged, the dip law moved to `D_exec` (§2b/§3.2), so **no published `D` moved**; lever (b) was declined on the saturation measured here.

**L11 hook row — filled by measurement (LV-008).** L11 is where ADR-0009 schedules **M2 (portals)**, i.e. the first `M` step since L6 and the first board on which `dualPhaseTiles ≥ 1` becomes satisfiable. The row above is now measured, and the two things that landed with it are both read-outs, not filled-in numbers:

- **The M2 debut's own row:** `L = 4`, `B = 1.5244` (exact 1.524390243902439), `T = R = 0`, `M = 4` (M1+M3+M2), `D = 28.573171`, **`D_exec = 8.573171`**, `lookaheadDepth = 3` (= `L − 1`, so the diagnostic still saturates), 82 reachable states, `B < B_raw` (1.5244 < 2.9756) — the dominance filter still bites.
- **The pre-registered seam decision of §3.3 is satisfied as authored:** `D_exec(L11) = 8.5732 < 13.64` (= L10's measured value, reproduced above and pinned by `tests/solver/difficulty.test.ts` §2c). Stated together with what the *total* axis does, because it is the same comprehension-tax finding §5.2 already records for L5→L6: `D` falls only **−0.069686** (28.642857 → 28.573171) while `M` rises +1 (**+5** on `D`) and `L` falls −5 — on `D` the M2 debut is not a dip, and the sawtooth is visible on `D_exec` alone (§3.2, ADR-design-0001). The ordered companion's block ruling also landed: both readers report `[5,0]` on L11, so **gate (iii)** is carried by the ordered form with no shipped verdict moving (`docs/ai-native-pipeline.md` §8.8).

Everything the row measures is pinned by `tests/solver/l11-portal-gates.test.ts` (the 8-gate audience) and `tests/solver/difficulty.test.ts` §2 (the §2 terms), and re-derivable with `node_modules/.bin/tsx scripts/solve-levels.ts`.

### 5.3 Measured metrics are the only claim

The two tables above are generated by the program, never by a model: `L1–L11` par values are the solver's `shortestSolution` (the level gate FAILs on any mismatch), the state/route counts come from the same BFS that proves solvability, `refusedThenEnteredTiles` / `dualPhaseTiles` come from `@/core/solver/bfs` with the definitions of `docs/architecture.md` §8 / ADR-0009, and `B`/`T`/`R`/`D`/`D_exec` come from `@/core/solver/difficulty.ts` reading that same graph (§2a/§2b). Where a field is missing it is named as missing (`L12`–`L50` carry no row at all, and §3.5 says why), and no shipped row is estimated: the last one that used to be empty — **L11's** — is measured as of LV-008.

## 6. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial metric definition + provisional weights + target curve | Agent 4 |
| 2026-10-15 | V0.2 | **LV-006** — new **§5.1 measured metrics for L1–L10** (source, definitions and the block read-out for the latch unit). Records explicitly that `B` (effective), `T`, `R` and therefore `D` are **still unmeasured** — no stand-in is published; `B_raw` (average legal out-degree) is labelled as NOT the §2 `B`. Also records the L6–L10 design deviation (see §5.1/`src/levels/README.md` §2b–§4) so the difficulty rows are traceable | Level AI + Solver (LV-006) |
| 2026-10-15 | V0.3 | **LV-007B item 3 — the §5.1 gap is closed by measurement.** New **§2a** pins the implemented reading of all five terms (`B` effective = non-dominated legal moves against an exact reverse-BFS distance; `T` literal ⇒ `≡ 0` under §4; `R` = dead states ÷ reachable states with `unrecoverableRatio` as its named companion; `M` = categories; `bRaw`/`forcedMoveRatio`/`lookaheadDepth`/`unrecoverableRatio` demoted to weightless diagnostics) and states that `D` is **not** added to the §8 `SolveResult` contract because the weights are provisional (re-calibration = one constant). New **§5.2** publishes `B`/`T`/`R`/`M`/`D` for L1–L10, the `T ≡ R ≡ 0` theorem inside the §4 acceptance region (so `D = L + 3·B + 5·M` there and `w3`/`w4` are inert), the `B < B_raw` control, the **L5→L6 seam = +8.528736** with its exact decomposition (ΔL −2 · ΔB +0.529 · ΔM +10), the explicit statement that the −2…−3 dip `docs/level-design.md` §6 asks for is **unreachable at these weights by construction**, and an **empty L11 hook row** (M2 debut) that also carries the `refusedBeforeEnteredTiles` promotion trigger. Former §5.2 → **§5.3**. §5's opening claim that metrics are *stored* per level was **corrected**: nothing is stored (the frozen schema has no metrics field and no sidecar exists), the tables are recomputed from the shipped data and pinned by tests, and the persist-or-not question is an OPEN_QUESTION. No weight tuned, no definition re-worded to flatter the curve; the contradiction is reported as-is | Level AI + Solver (LV-007B) |
| 2026-10-15 | V0.4 | **LV-007C item 2 — the execution axis is published as a column.** New **§2b** defines `D_exec = D − w5·M = w1·L + w2·B + w3·T + w4·R` (ADR-design-0001; `docs/level-design.md` §6) as a **purely derived** reading — `D`'s formula, arithmetic and published values are untouched — and names both forms the program prints (`difficultyExec Dexec=… = D(…) − 5·M(…) = 1·L + 3·B + 4·T + 2·R`, the subtraction *and* the formula's own terms, so the identity is checked rather than assumed); `src/core/solver/difficulty.ts` gains `DifficultyBreakdown.Dexec` (`null` iff `D` is). §5.2 gains the `D_exec` column for L1–L10 (9.00 / 10.06 / 10.29 / 10.58 / 10.33 / 8.86 / 7.75 / 10.50 / 12.14 / 13.64, reproduced from the factory CLI output, not copied) plus the read-out of the L5→L6 seam on that axis (**−1.47**, against **+8.53** on `D` — the two axes are now printed side by side), the L11 hook row carries the pre-registered `< 13.64`, and `tests/solver/difficulty.test.ts` §2c pins both forms + the `L + 3·B` collapse + the ten published values. §5.3's provenance sentence names the new column | Level AI + Solver (LV-007C) |
| 2026-10-15 | V0.4 | **LV-007C item 3 — §3 re-keyed to the V0.6 execution-axis law, and reconciled with the schedule that actually ships.** The old §3 (V0.1 text) was the last place still carrying the **pre-ADR-0009** plan — a Phase Door dip at **L21–L25** and a Phase Portal dip at **L36–L40** — plus **absolute `D` bands** (`1–2` at L1–L3 … `16–17` at L50) written before `D` was computable; both are **withdrawn by name** in a new §3.1 with the measurement that falsifies them (**the shipped teaching ten alone measures 14.00–28.64**, §5.2, so every band under "L26–L35: 8–11" is already contradicted by levels that exist). §3.2 draws the law as it now reads — sawtooth on `D_exec`, step-**up** on `D` at a debut by `w5·ΔM` — the same curve read twice. §3.3 rebuilds the block table on **`docs/game-design.md` §8's** ranges verbatim (the only two `ΔM > 0` seams are **L6** and **L11**; L21–L25 is *latch fluency* and L36–L45 *synthesis*, so neither may carry a debut dip), with the measured ✓ on the L6 seam (debut 8.86 < peak 10.58; dip −1.72 vs peak / −1.47 vs L5; ramp to 13.64 > 10.58) and the **L11 pre-registration** restated verbatim (`D_exec(L11) < 13.64` ⇔ `D < 33.64`, par ≤ 4, one opposite-colour portal pair, no false routes, below-OFFERED; block must exceed 13.64 by its end). §3.4 states the binding rules — seam law + budget form `ΔD < w5·ΔM`, sawtooth, construction floor, rejection teeth, no debut outside L6/L11 without a GD ruling, Final Exam adds no mechanic. §3.5 names **which numbers have legal force** (L1–L10 measured, L11 pre-registered) and states that **no numeric band above L11 is published on purpose** — a fresh band schedule nobody can measure would repeat the error §5.2 documents; new numbers enter only by solver measurement or playtest regression of `w`. **No new number, weight, rule or level change; authority stays `docs/level-design.md` §6 / ADR-design-0001** | Level AI + Solver (LV-007C) |
| 2026-10-15 | V0.5 | **LV-008 — the L11 hook row is filled by measurement, and the pre-registered seam law is filed as satisfied.** §5.2's deliberately-empty row becomes the measured M2 debut (`L` 4 · `B` 1.5244 · `T`/`R` 0 · **`M` 4** (M1+M3+M2) · `D` **28.573171** · `D_exec` **8.573171** · `lookaheadDepth` 3 = `L − 1` · 82 reachable states · `B` 1.5244 < `B_raw` 2.9756), pinned per-level by `tests/solver/difficulty.test.ts` and re-derivable from `scripts/solve-levels.ts`. §3.3's L11–L15 row moves from *"pre-registered, not yet authored"* to *"seam law measured ✓ (LV-008)"* — `8.5732 < 13.64` (−5.07 against L10's peak) — while the **order of events is kept in the record** (§3.5): the bound was published before any candidate existed and the board was *filtered* to it (`scripts/author-l11-candidates.ts`, seed 20261015, 54 candidates, 1 accept, `shipped=MATCH`), never fitted to a target. The row's read-out is stated next to the finding it repeats: on the **total** axis `D` falls only **−0.069686** at this debut (`M` +1 ⇒ +5 on `D`, `L` −5), so the M2 sawtooth is visible on `D_exec` **alone** — the same comprehension-tax structure §5.2 records for L5→L6, now confirmed at the second and last `ΔM > 0` seam in the schedule. Also recorded: `T ≡ R ≡ 0` and `noUnrecoverableOk` hold on L11 too (§4 region intact), the ordered/unordered latch readers agree (`[5,0]`), and `dualPhaseTiles = 21` makes gate (iv) satisfiable **for the first time** — the L11 schedule is now a measurement, not a plan. §5.1 stays the LV-006 record and says so; §5.3's provenance sentence covers L11. **No weight tuned, no `D` value moved, no definition re-worded** | Level AI + Solver (LV-008) |