# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Agent 4 (Level AI + Solver)** with **Agent 0 (Orchestrator)**
> Version: V0.1 · Date: 2026-10-14

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

## 4. Difficulty metrics (per accepted level)

```
solvable
shortestSolution          L
numSolutions
averageBranchingFactor    B
deadEndRatio              R
maxSearchDepth            T
forcedMoveRatio
difficultyScore           D = w1·L + w2·B + w3·T + w4·R + w5·M
```

Weights are **calibrated from real playtest data**, never hard-frozen. See `docs/level-difficulty.md`.

## 5. Model routing (do not bind architecture to a model)

Abstract roles, so any model can be swapped in:

```ts
REASONING_MODEL
FAST_MODEL
MULTIMODAL_MODEL
```

| Role | Tasks | Current mapping |
|---|---|---|
| **REASONING_MODEL** | Game design, architecture, hard level analysis, code review, playtest analysis, final review | **Kimi K3** (preferred for complex reasoning / long context) |
| **FAST_MODEL** | Bulk level candidates, test cases, simple code tasks, doc drafts, repetitive analysis | **DeepSeek V4.1-Flash** (preferred for low latency) |
| **MULTIMODAL_MODEL** | User asset inspection, UI screenshots, gameplay screenshot review | vision-capable model, TBD |

> Model names are config, not architecture. If a model is unavailable, the role is reassigned; nothing else changes.

**Invariant:** level solvability is always judged by the program Solver, never by any model — including the MULTIMODAL_MODEL.

## 6. What "AI truly participated" must be provable as

The final submission must show the chain, not a claim:

- AI proposed mechanics (recorded in `iteration-log.md`).
- AI generated level candidates (raw JSON archived).
- Program Solver validated solvability (metrics archived).
- AI analyzed difficulty / diagnosed bottlenecks (analysis archived).
- Levels changed and were revalidated (before/after metrics archived).
- Players retested (playtest data archived).

## 7. Reproducibility

- Level generation is **seeded** and scripted (`scripts/generate-levels`), so results are re-runnable.
- Every accepted level stores its generation metadata (model role, seed, prompt version, solver metrics).
- Rejected candidates are archived too — the failures are part of the evidence.

## 8. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Pipeline, validation gate, model routing, evidence requirements | Agent 4 / Orchestrator |