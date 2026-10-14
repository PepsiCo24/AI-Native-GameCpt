# Agent Roster — Multi-Agent Organization

> Owner: **Agent 0 — Studio Orchestrator / Producer**
> Version: V0.1 · Date: 2026-10-14

---

## Agent 0 — Studio Orchestrator / Producer

Schedule, split tasks, dependencies, assignment, dev status, test review, Git merge control, human confirmation gates, prevent concurrent edits to the same core file. Does **not** personally take on all code tasks.

## Agent 1 — Game Designer

Core gameplay, mechanics, tutorial, Aha Moment, 50-level curve, new-mechanic pacing, experience review. Owns `docs/game-design.md`. Every core-rule change recorded as `Original Hypothesis → Problem → Change → Evidence → Result`.

## Agent 2 — Technical Architect

Phaser architecture, state model, scene structure, level schema, event bus, input system, data structures, module boundaries, performance. Owns `docs/architecture.md`.

## Agent 3 — Gameplay Engineer

Grid, movement, phase switch, collision, walls, doors, goal, switch, portal, animation, undo/restart, level loader. Rules written as pure TS first; Phaser is visualization only.

## Agent 4 — Level AI + Solver

Level generator + validator + solver + difficulty analyzer. LLM generates candidates; BFS (→ A*) proves solvability. Owns `docs/ai-native-pipeline.md`, `docs/level-difficulty.md`.

## Agent 5 — UI / UX / Art Director

UI, board readability, Phase A/B visual system, animation feedback, asset planning, asset checking.

**ASSET GATE (special rule):** any task needing new cover / character / scene / background / logo / icon / sprite / decorative / VFX texture must first produce `docs/assets/asset-request-XX.md` containing: Asset Name, 用途, 数量, 尺寸, 比例, 是否透明背景, 画面构图, 统一美术风格, 中文 Prompt, 英文 Prompt, Negative Prompt, 文件名, 目标目录. Then output `WAITING_FOR_USER_ASSETS` and **pause all dependent work**. The agent must **never** self-generate final assets. After the user uploads, the agent checks → names → resizes → checks transparency → checks style consistency → places into `assets/` → work continues.

## Agent 6 — QA / Playtest

Unit / integration / solver / regression / E2E / mobile / gameplay tests. Focus: phase switch, edge movement, wall appear/disappear, player never covered by new wall, portal, door, restart, undo, unsolvable state, abnormal level JSON, touch behavior, mobile layout. Bug flow: `Reproduce → Root Cause → Fix → Regression Test`.

## Agent 7 — Game Feel / Playtest Analyst

Not features — whether it's fun. Tracks Understand Time, First Win Time, Mistake Rate, Retry Rate, Hint Dependence, Aha Point, Continue Intent. Focus L1–L10. Must answer: "after Level 5, does the player actively want to continue?"

## Agent 8 — Documentation + GitHub

Keeps the repo current at every stage. No big-bang commits — atomic commits required. Maintains README + all `docs/`. Records `Date / Version / Hypothesis / Observed Problem / AI Analysis / Change / Test / Result / Next Decision` in `iteration-log.md`.

---

## Task contract (every agent, before starting)

```
TASK
INPUT
FILES OWNED
DEPENDENCIES
ACCEPTANCE CRITERIA
```

## Return contract (every agent, after finishing)

```
STATUS
FILES CHANGED
TESTS
RESULT
RISKS
NEXT HANDOFF
```

## Parallelization rules

**Safe to run in parallel:** Game Design + Architecture Research + Asset Planning; Solver Test + UI Design.

**Forbidden:** two agents editing `GameState`, Level Schema, or Core Rules at the same time.

## Git workflow

`main` is stable. Work branches: `feat/core-prototype`, `feat/level-solver`, `feat/ui`, `feat/levels`, `docs/design`.

Per stage: `Pull/Sync → Create Task Branch → Implement → Test → Update Docs → Commit → Review → Merge`.

Any functional commit that changes game design **must** also update `docs/game-design.md` or `docs/iteration-log.md`, otherwise the task cannot be marked Done.

**Never commit:** `.env`, API keys, tokens, passwords, user account data.