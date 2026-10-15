# Level Difficulty Model & Curve

> Owner: **Agent 4 — Level AI + Solver**
> Version: V0.1 · Date: 2026-10-14
> Status: weights are **provisional** and must be re-calibrated from playtest data.

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
- `B_raw` = average legal out-degree over the reachable graph (edges ÷ states). **This is NOT the `B` of §2** — §2's `B` is the *effective* branching factor (legal **and non-dominated** moves), which needs the dead-end/dominance analysis and is still unmeasured. `B_raw` is recorded because it is exact and free; it must not be substituted into `D`.
- forced-move ratio = share of reachable states with exactly one legal move.
- `deadEndRatio` `R` = 0/10 levels (no reachable non-goal state has zero legal moves) — the §4 casual-friendliness cap is trivially satisfied today.
- `T` (required lookahead) is **not** in the table: the current solver reports `maxSearchDepth` (wandering depth), not the depth at which an alternative becomes unrecoverable. Do not read `maxSearchDepth` as `T`.
- `parRoutes / embedRoutes` = shortest routes / how many of them end embedded (LV-004 plumbing, `docs/ai-native-pipeline.md` §8). The metric reports **that** some arrival was embedded, not **which** tile did it: on L6–L10 the embedding arrival is typically a **door** tile (a door that latches closed under the player after the flip) — a different construction from L4/L5's wall echo, and L10 carries both. See `src/levels/README.md` §2b/§3.

**Curve read-out (block L6–L10, the latch unit).** `L` runs 4 → 4 → 6 → 8 → 9: the block **starts with a dip** (L6 par 4, the lowest in the game) while `M` jumps 1 → 3, exactly the §3 rule "a new-mechanic block always starts with a dip" — the mechanic count rises, the move count does not. `B_raw` stays flat (2.0–3.0) for every level, so **difficulty is not coming from raw branching**; it comes from planning depth and latch state (L9 `maxSearchDepth` 15 against `par` 8: the board offers long, useless wandering before the ordered plan is found).

**Honest gap:** `D` itself is **not** computed for L1–L10, because `B` (effective), `T` and `R` are not exposed by the solver yet. Publishing a `D` from `L`+`M` alone would be inventing the number this document exists to measure. The follow-up is recorded as an open item in §6.

### 5.2 Measured metrics are the only claim

The table above is generated by the program, never by a model: `L1–L10` par values are the solver's `shortestSolution` (the level gate FAILs on any mismatch), the state/route counts come from the same BFS that proves solvability, and `refusedThenEnteredTiles` / `dualPhaseTiles` come from `@/core/solver/bfs` with the definitions of `docs/architecture.md` §8 / ADR-0009. Where a field is missing it is named as missing (`B` effective, `T`, `R`, `D`) instead of being estimated.

## 6. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial metric definition + provisional weights + target curve | Agent 4 |
| 2026-10-15 | V0.2 | **LV-006** — new **§5.1 measured metrics for L1–L10** (source, definitions and the block read-out for the latch unit). Records explicitly that `B` (effective), `T`, `R` and therefore `D` are **still unmeasured** — no stand-in is published; `B_raw` (average legal out-degree) is labelled as NOT the §2 `B`. Also records the L6–L10 design deviation (see §5.1/`src/levels/README.md` §2b–§4) so the difficulty rows are traceable | Level AI + Solver (LV-006) |