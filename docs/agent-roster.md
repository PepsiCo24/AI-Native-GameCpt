# Agent Roster — Multi-Agent Organization

> Owner: **Docs + GitHub** — this file *mirrors* the authoritative sources, it does not define them.
> Authoritative sources: agent definitions = `.opencode/agents/*.md` (10 files); file ownership = `AGENTS.md` §4; model routing = `docs/ai-model-matrix.md` §3 · `AGENTS.md` §11.
> Version: V0.2 · Date: 2026-10-14 · Reconciled from RV-001 finding **M-1** (roster listed a retired "Agent 0–8" org chart and was missing the Reviewer entirely).
> The legacy numbering is dropped: agents are addressed by **role name = file name** in `.opencode/agents/`.

---

## 1. The roster (10 agents)

| Role (definition file) | Mode | Model role → current model | Owns (AGENTS.md §4) | Must not touch |
|---|---|---|---|---|
| **Orchestrator** (`orchestrator.md`) | primary | REASONING → `kimi-k3` | `opencode.json`, `AGENTS.md`, `.opencode/agents/**`, `docs/project-status.md`, Git merge/push | feature code |
| **Game Designer** (`game-designer.md`) | subagent | REASONING → `kimi-k3` | `docs/game-design.md`, `docs/level-design.md`, `docs/decisions/design-*` | core engine |
| **Architect** (`architect.md`) | subagent | REASONING → `kimi-k3` | `docs/architecture.md`, `docs/decisions/architecture-*` | feature implementation |
| **Gameplay Engineer** (`gameplay-engineer.md`) | subagent | CODING → `deepseek-v4.1-flash` | `src/core/state/**`, `src/core/rules/**`, `src/game/**` (incl. `src/game/renderer/**`) | level solver, level data |
| **Level AI + Solver** (`level-solver.md`) | subagent | CODING → `deepseek-v4.1-flash` | `src/core/level/**`, `src/core/solver/**`, `scripts/**`, `src/levels/**`, `tests/solver/**`, `docs/ai-native-pipeline.md`, `docs/level-difficulty.md` | `src/game/**` |
| **UI / UX / Art Director** (`ui-art-director.md`) | subagent | VISION → `qwen3.8-max` | `docs/ui-ux.md`, `docs/assets/**`, later `src/ui/**` | core rules |
| **QA Engineer** (`qa-engineer.md`) | subagent | CODING → `deepseek-v4.1-flash` | `tests/**`, `playwright.config.*` | production logic |
| **Playtest Analyst** (`playtest-analyst.md`) | subagent | REVIEW → `qwen3.8-max` | `docs/playtest-log.md`, `docs/playtest-analysis/**` | production code |
| **Reviewer** (`reviewer.md`) | subagent | REVIEW → `qwen3.8-max` | nothing (read-only by design — edit permission denied) | all edits |
| **Docs + GitHub** (`docs-github.md`) | subagent | FAST → `qwen3.8-flash` | `README.md`, `docs/iteration-log.md`, `docs/submission/**`, other `docs/**` not claimed above | merge authority; may **format** (not change the meaning of) another role's file, never overwrite it |

Model names are **configuration, not architecture** (`AGENTS.md` §11): roles are abstract (`REASONING/CODING/FAST/REVIEW/VISION_MODEL`), assigned from measured capability in `docs/ai-model-matrix.md`, and any role can be reassigned without touching the codebase.

---

## 2. Role briefs

### Orchestrator
Schedules, splits tasks, manages the dependency DAG, dispatches subagents with the full Task Contract (§3 below), prefers worktrees named `agent/<role>/<task-id>`, enforces single-writer file ownership, owns **all Git merge/push** (no other agent pushes `main`), owns the human gates (GATE A assets → GATE E release candidate), controls cost (screen with the fast model, escalate; never ask five strong models one question), and keeps `docs/project-status.md` current. Never accepts "Done" without evidence; never fabricates playtest data, iterations, or AI usage.

### Game Designer
Owns the core loop, tutorial, mechanics library (M0–M4), difficulty curve, 50-level progression, Aha moments and fail conditions in `docs/game-design.md` / `docs/level-design.md`. Every core-rule change is recorded as `Original Hypothesis → Problem → Change → Evidence → Result`. Never rewrites the core engine. Core-loop changes require **Game Designer + Playtest Analyst + Orchestrator** agreement plus an ADR (`AGENTS.md` §2).

### Architect
Owns the state model, module boundaries, level schema alignment, event flow, input system and the renderer/core separation in `docs/architecture.md`. Guards the hard boundary `Renderer (Phaser) → Gameplay → Core (pure TS) ← Solver`. Reviews `src/core/**` but does not bulk-implement features.

### Gameplay Engineer
Implements grid, movement, phase flip, collision, walls, doors, switches, portals, goal, restart, undo, level loader, scene and input **in Phaser — on top of the pure core**. Rules are pure TypeScript first; Phaser is visualization only and never the source of truth. Gameplay and the Solver must call the **same** `applyMove`.

### Level AI + Solver
Owns the level schema validator, BFS solver, difficulty analyzer, seeded candidate-generation scripts and the 50-level dataset. The standing rule: **LLM proposes, the program proves solvability** — a model may never declare a level solvable (`AGENTS.md` §7, `docs/ai-native-pipeline.md` §1).

### UI / UX / Art Director
Owns board readability, visual hierarchy, the Phase A/B presentation language (including the ADR-0007 **wall echo**: other-phase walls render low-emphasis so every refusal has a visible cause — presentation only, never a rule change), feedback/animation direction, and the asset pipeline. Holds **spec authority over the renderer**, but `src/game/renderer/**` is *written* by the Gameplay Engineer. Runs the ASSET GATE (§5) and validates delivered art with the VISION model.

### QA Engineer
Owns unit / integration / regression / solver / E2E / touch / mobile tests under `tests/**` and `playwright.config.*`. Bug flow: `Reproduce → Root Cause → Fix → Regression Test`. The locked critical-rule cases live in `docs/playtest-log.md` §5 (illegal move = identical state; `isLegalMove ⟺ applyMove ≢ s`; step-6 revert discards side effects).

### Playtest Analyst
Judges **fun**, not features: tracks Understand Time, First Win Time, Mistake/Retry Rate, Hint Dependence, Aha Point and Continue Intent; owns `docs/playtest-log.md` findings and `docs/playtest-analysis/**`. Read-only toward production code. Confirms ADR-0006 empirically at Stage 2/3 and helps answer OQ-1 with data.

### Reviewer
Read-only cross-agent review of finished tasks: correctness and regressions, fidelity to the locked game rules (one move ⇒ one flip; illegal move ⇒ no movement, no flip; player never crushed), `src/core/**` Phaser-free and Solver→Phaser-forbidden boundary integrity, maintainability and YAGNI, secret leakage, test gaps, design drift. Reports findings **by severity** (blockers `B-x`, majors `M-x`, lows `LOW-x`) and never edits code. RV-001 was this role's first full round.

### Docs + GitHub
Keeps `README.md`, `docs/iteration-log.md`, `docs/submission/**` and unclaimed `docs/**` current **continuously** — no big-bang last-minute doc commits, atomic commits only (see §4). Records every iteration in the full format (see `AGENTS.md` and `docs/iteration-log.md` header): `Date / Version / Hypothesis / Observed Problem / Evidence / AI Analysis / Human Decision / Change / Test / Result / Next Decision`. Failures are recorded, never rewritten as "everything went smoothly". **No merge authority** — the Orchestrator merges and pushes.

---

## 3. Task contract (every dispatch — verbatim from `AGENTS.md` §5)

```
TASK_ID / ROLE / GOAL / CONTEXT / INPUT / WORKTREE /
OWNED_FILES / READ_ONLY_FILES / DO_NOT_TOUCH /
DEPENDENCIES / ACCEPTANCE_CRITERIA / TEST_COMMANDS /
DOCUMENTATION_REQUIRED / COMMIT_MESSAGE
```

Return contract (every agent, after finishing — `AGENTS.md` §5):

```
STATUS / SUMMARY / FILES_CHANGED / TESTS_RUN / TEST_RESULTS /
DESIGN_IMPACT / RISKS / OPEN_QUESTIONS / COMMIT_SHA / NEXT_HANDOFF
```

Never answer with only "Done". Claiming completion requires evidence:
code ⇒ tests · levels ⇒ solver proof · design ⇒ playtest or explicit hypothesis ·
GitHub ⇒ commit SHA · assets ⇒ manifest entry (`AGENTS.md` §7).

## 4. Git workflow (`AGENTS.md` §6)

- `main` = stable · `develop` = integration · **`agent/<role>/<task>`** = per-task branch (the Orchestrator names worktrees the same way).
- Flow: `agent branch → review → develop → (milestone) main`.
- Only the **Orchestrator** merges and pushes; no agent pushes `main` directly.
- Atomic commits with the project prefixes: `feat(core):`, `feat(level):`, `feat(ui):`, `fix(core):`, `test(solver):`, `docs(design):`, `chore:`.
- Any commit that changes gameplay **must** also update `docs/game-design.md` or `docs/iteration-log.md`.
- **Never commit:** `.env`, `.env.*`, `*.secret`, `credentials*`, `auth.json`, API keys, tokens, passwords, account data (`AGENTS.md` §9).

## 5. ASSET GATE (`AGENTS.md` §8 — hard human gate)

No agent may generate final competition art. Any task needing new cover / character / scene / background / logo / icon / sprite / decorative / VFX texture must first produce `docs/assets/asset-request-XX-*.md` containing **all 15 fields**:

```
Asset ID / Name / Usage / Quantity / Size / Ratio / Transparency /
Composition / Shared Style / Chinese prompt / English prompt /
Negative prompt / Filename / Destination / Acceptance criteria
```

Then output `WAITING_FOR_USER_ASSETS` and **stop all dependent work**. The user generates the images. The UI / Art Director then checks → names → resizes → verifies transparency → verifies style consistency → places files per manifest → dependent work resumes. Every accepted asset needs a row in `docs/assets/asset-manifest.md`.

## 6. Parallelization rules

**Safe to run in parallel:** Game Design + Architecture Research + Asset Planning · Solver tests + UI design — as long as each running task writes only its own `OWNED_FILES`.

**Forbidden** (never simultaneously, from `AGENTS.md` §4): two agents modifying `GameState`, the level schema, core rules, `package.json`, `opencode.json`, or `AGENTS.md`; anyone but the Orchestrator editing `.opencode/agents/**`, `AGENTS.md` or `opencode.json`; anyone editing another role's owned file beyond formatting (Docs + GitHub may format, never change meaning).

**ADRs** (`AGENTS.md` §4): numbered `docs/decisions/NNNN-*.md` are authored by the role that owns the decision (design ↔ Game Designer, architecture ↔ Architect) and approved by the Orchestrator. No agent edits another role's ADR without Orchestrator approval.

---

## Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial org chart ("Agent 0–8") drafted before the agent definitions existed | Orchestrator / Docs |
| 2026-10-14 | V0.2 | **RV-001 M-1 reconciliation:** rewritten to mirror the actual 10 agents in `.opencode/agents/**` and the AGENTS.md §4 ownership table (Reviewer had been missing entirely); added per-agent model-role mapping, the verbatim §5 task/return contracts, the `agent/<role>/<task>` branch scheme (§6 Git strategy), and the 15-field ASSET GATE list from §8; retired the numeric "Agent 0–8" addressing | Docs + GitHub (DG-002) |
