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

## 6. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial metric definition + provisional weights + target curve | Agent 4 |