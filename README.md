# Phase Shift: Echo Grid · 双相棋盘：昼夜回响

> An AI-native H5 puzzle game for the **AI Native 休闲游戏创作大赛** (Oakever / 乐信圣文).
> 你每动一次，世界就变一次。

---

## One-liner

A two-phase grid puzzle. Every legal move flips the world between **Phase A (Light / 白昼)** and **Phase B (Shadow / 夜晚)**. Walls, doors and portals exist in only one phase. The player never presses a "switch world" button — the phase flip is bound to their own movement, so every step is a promise about the future board.

## Core promise

- **10 秒能懂** — tap an adjacent tile (or swipe), the world flips.
- **1 分钟 Aha** — around Level 3–5 the player discovers that the step they just took decides which steps are legal next. Under the locked illegal-move rule (ADR-0006) this is delivered by **visibility + refusal** (a refused move, then a detour that only reading both worlds reveals) — not by a plain wall "opening"; since ADR-0007 every refusal has a **visible cause** (other-phase walls render as a low-emphasis "wall echo"). Whether M0-only levels read as dynamic enough regardless is open question **OQ-1**, pending Stage-2 playtest (`docs/level-design.md` §0, §3).
- **5 关后还想继续** — the loop is `Observe → Move → Phase Flip → Re-plan → Reach Goal`.

## Competition requirements coverage

| Requirement | Status | Where |
|---|---|---|
| Runs directly in browser | Planned (Vite + Phaser 3) — **no code yet** | `docs/architecture.md` |
| Desktop + Mobile adaptive | Planned — layout rules computed, not built | `docs/ui-ux.md` §2 · `docs/architecture.md` §9 |
| ≥ 50 formal levels | **Plan + schema locked; no level built or Solver-proven yet** | `docs/game-design.md` §8 · `docs/level-design.md` §1 |
| Progressive, non-monotonic difficulty | Curve designed; **weights provisional / uncalibrated** | `docs/level-difficulty.md` · `docs/level-design.md` §6 |
| First 3 levels need almost no text | Teaching ladder designed (L1–L10), not yet playable | `docs/level-design.md` §2–§3 · `docs/game-design.md` §9 |
| First Aha Moment at L3–L5 | Engineered on paper; **unverified** | `docs/level-design.md` §3 |
| AI genuinely participates | Design / architecture / review / routing only so far — level generation + Solver proof not started | `docs/ai-native-pipeline.md` · `docs/ai-model-matrix.md` · `docs/ai-usage-log.md` |
| Full process recorded | Docs maintained | `docs/iteration-log.md` · `docs/submission/` |

## Repository map

```
README.md
AGENTS.md                         # Studio rules: priority order, locked core rule, file ownership, gates
doc/                              # source research (input, not authored by us)
docs/
  game-design.md                  # Game Designer — living design doc (V0.3, core rule locked)
  level-design.md                 # Game Designer — level schema (grid 3–7, required par), teaching ladder L1–L10, Aha construction
  level-difficulty.md             # Level AI + Solver — difficulty model & curve (weights provisional)
  architecture.md                 # Architect — technical architecture (V0.3: applyMove 7 steps, par, door/wall step-6 rule)
  ui-ux.md                        # UI / Art Director — screens, layout, wall echo §3.1a (ADR-0007), legibility gates (V0.3)
  ai-native-pipeline.md           # Level AI + Solver / Orchestrator — AI generation + validation chain
  ai-model-matrix.md              # Orchestrator — measured model capability probes → role routing (single source of truth)
  ai-usage-log.md                 # Orchestrator — rough AI usage / cost (no keys, no secrets)
  agent-roster.md                 # Docs + GitHub — mirror of the real 10-agent org (AGENTS.md §4 · .opencode/agents)
  project-status.md               # Orchestrator — live stage status (owned file; authored by Orchestrator)
  iteration-log.md                # Docs + GitHub — hypothesis → change → result (ITER-0001…0003; V0.3 entry pending)
  playtest-log.md                 # QA Engineer + Playtest Analyst — locked V0.2/V0.3 critical cases; no playtest sessions yet
  decisions/                      # ADRs
    0001-adopt-phase-shift-core-rule.md
    0002-phase-flip-bound-to-move.md
    0003-core-logic-decoupled-from-phaser.md
    0004-solver-proves-solvability.md
    0005-asset-gate.md
    0006-illegal-move-not-wall-suppression.md
    0007-other-phase-wall-echo.md
    architecture-0001-core-solver-shared-rules.md   # + V0.3 addendum
  submission/
    design-thinking.md            # Docs + GitHub — submission: problem → idea → mechanics → AI role
    iteration-optimization.md     # Docs + GitHub — submission: V0…V0.3 + iteration evidence chain
  assets/
    asset-manifest.md             # UI / Art Director — asset tracker (all first-batch rows = REQUESTED)
    first-batch-prompts.md        # UI / Art Director — copy-paste generation sheet for the user
    asset-request-XX-*.md         # UI / Art Director — image generation prompts (ASSET GATE), 01…07
src/ · tests/ · scripts/          # not created yet — blocked by the asset gate (Stage 2)
```

## Current status

**STAGE 0 (Design Lock) + STAGE 1 (Asset Requirements) — DONE.**

**WAITING_FOR_USER_ASSETS** — no gameplay code, levels, playtest or art exists yet. The project does **not** proceed to Stage 2 (5-level prototype) until the first P0 asset batch is delivered by the user.

What is actually settled: core rule locked — illegal move = refused, no movement, no flip, no `moveCount` change (ADR-0006, `architecture.md` V0.3 §6) — plus the ADR-0007 **wall echo** comprehension channel (other-phase walls render visibly; presentation only). Architecture contract (`applyMove` 7-step order with step-6 revert discarding switch/portal side effects, state hash, BFS-until-profiled, import-boundary test), level schema (grid **3–7 authored cap**, `par` required field) + teaching ladder, UI/layout legibility constraints (≤ 7 × 7; 8 × 8 only with Orchestrator approval), and model routing measured against the live API (`docs/ai-model-matrix.md`). A cross-doc review round (RV-001) caught and reconciled doc-drift in the roster, pipeline and playtest vocabulary.

What is still open: **OQ-1** — under the locked rule, plain phase walls cannot open or close routes (union property), so whether L1–L20 feel dynamic enough must be answered by Stage-2/3 playtest data plus a new ADR (escalated to the user at GATE C). Difficulty weights are uncalibrated. Whether `par` is shown in the HUD at all awaits Game Designer sign-off (ui-ux OQ1). Nothing has been played yet.


## Hard rules (do not violate)

1. Phase switching is **never** a standalone button. It is bound to player movement.
2. Game rules live in **pure TypeScript core**. Phaser is visualization only, never the source of truth.
3. The Solver **never** depends on Phaser. LLM proposes levels; the program Solver proves solvability.
4. No AI-generated final art without an `asset-request-XX.md` and user-supplied files.
5. Priority order: **Fun > Readable > Expandable > Pretty.**
6. An **illegal move is refused entirely — no movement and no phase flip.** A move that would leave the player standing on a wall **or a closed door** in the new phase never happens; the player is never crushed, pushed, or randomly moved (ADR-0006, refined in `architecture.md` V0.3 §6.1; `docs/game-design.md` §3.1).
7. A refused move must **show its cause**: other-phase walls render as a low-emphasis "wall echo" (ADR-0007, `docs/ui-ux.md` §3.1a). Presentation layer only — it never changes legality or determinism.