# AI Native Pipeline — Phase Shift: Echo Grid

> Owner: **Level AI + Solver** with **Orchestrator** (formatting maintenance by Docs + GitHub; content belongs to the owners)
> Version: V0.3 · Date: 2026-10-14

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
| 2026-10-14 | V0.3 | **LV-005** — new **§3b Level Schema adjudications**: `doors[]` ∩ (`phaseAWalls` \| `phaseBWalls`) = **illegal, hard error** (never "the door swallows the wall"); §3's hard-reject list gains "a cell that is two objects at once". Reason recorded with measured BFS evidence and the explicit non-decision on appearance precedence (UI / Art Director's `docs/ui-ux.md`) | Level AI + Solver (LV-005) |