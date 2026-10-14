# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Level AI + Solver** with **Orchestrator** (formatting maintenance by Docs + GitHub; content belongs to the owners)
> Version: V0.2 · Date: 2026-10-14

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

- Level generation is **seeded** and scripted (`scripts/generate-levels`), so results are re-runnable.
- Every accepted level stores its generation metadata (model role, seed, prompt version, solver metrics).
- Rejected candidates are archived too — the failures are part of the evidence.

## 8. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Pipeline, validation gate, model routing, evidence requirements | Agent 4 / Orchestrator |
| 2026-10-14 | V0.2 | RV-001 **LOW-4** reconciliation: §5 rewritten — "vision-capable model, TBD" and the FAST=DeepSeek mapping were stale; routing now delegates to `docs/ai-model-matrix.md` §3 as single source of truth (REASONING `kimi-k3` · CODING `deepseek-v4.1-flash` · FAST `qwen3.8-flash` · REVIEW/VISION `qwen3.8-max`); Solver-decides-solvability invariant kept verbatim | Docs + GitHub (DG-002) |