# Project Status — Phase Shift: Echo Grid

> Owner: **Orchestrator (Agent 0)** · Updated: **2026-10-14**
> Read this first when resuming a session; it is the recovery entry point.

---

## Current milestone

**Stage 0 (Design Lock) + Stage 1 (Asset Requirements) — COMPLETE.**
Next milestone: **Stage 2 — 5-level Prototype** (see the Prototype Definition of Done). Currently **paused at the human gate**.

## Completed

- **Recovery:** the working tree had every tracked doc deleted; restored non-destructively from `HEAD`. Nothing lost.
- **Model routing:** 5-model smoke test + vision probe → `docs/ai-model-matrix.md` (only `qwen3.8-max` is vision-capable).
- **Multi-agent studio:** `AGENTS.md`, `opencode.json`, `.opencode/agents/` (10 roles). Verified loaded live.
- **Design set:** `game-design.md` V0.3, `level-design.md` V0.2, `architecture.md` V0.3, `ui-ux.md` V0.3.
- **Decisions:** ADR 0001–0007 + `architecture-0001`.
- **Assets:** `asset-request-01..07` (all 15 required fields), `first-batch-prompts.md`, `asset-manifest.md` V0.3.
- **Review:** RV-001 (1 BLOCKER / 5 HIGH / 8 MEDIUM) + reconciliation round → V0.3 baseline.
- **Docs:** `iteration-log.md` ITER-0003/0004, `submission/design-thinking.md`, `submission/iteration-optimization.md`, `ai-usage-log.md`.

## In progress

- None. Work is intentionally paused at the asset gate.

## Blocked

| Blocked work | Blocked by |
|---|---|
| All gameplay/engineer/solver/UI coding | **GATE A** — user must deliver the first asset batch |
| Level generation for L1–L50 | **GATE C** — core-rule escalation OQ-1 not yet decided |
| Readability validation / screenshot review | GATE A assets (A-03/A-04/A-05/A-06 minimum) |

## Human gates

- **GATE A — Initial visual assets:** `WAITING_FOR_USER_ASSETS`. Copy-paste prompts in `docs/assets/first-batch-prompts.md` (P0 = A-03, A-04, A-05, A-06 goal).
- **GATE C — Core-mechanic decision (OQ-1):** under ADR-0006's union property, a tile that is a wall in *either* phase is never enterable, so M0-only levels (L1–L20) are mechanically static mazes and the phase flip changes no legal move until doors/portals arrive. Decision needed before any level past L10 is generated.

## Active worktrees

- None. The probe `agent/_probe/worktree-smoke` was created and removed cleanly. Native worktrees verified working (`strategy: git`); they will be used in the parallel code phase.

## Relevant commits / branches

- Pre-recovery local `main`: `0345c52` (7 commits, never pushed).
- Baseline V0.3 committed on `develop` in this session; tag `stage0-baseline`.
- Branch model: `main` (stable) ← `develop` (integration) ← `agent/<role>/<task>`.

## Next tasks (in order)

1. **User → assets.** On delivery: UI/Art intake (inspect → validate → rename → register `DELIVERED`).
2. **Orchestrator → Stage-2 DAG.** Parallel worktrees: `agent/gameplay/core-rules`, `agent/solver/bfs-v1`, `agent/qa/core-tests`, `agent/ui/board-shell`.
3. **Build the shared core** (`applyMove` truth source) before solver/UI bind to it.
4. **Author + solver-prove Levels 1–5.**
5. **Prototype playtest gate:** ≥ 5 non-developers; ≥ 4/5 understand without explanation; ≥ 3/5 want level 6.

## Guardrails while resuming

- Never edit `src/core/**` from a Phaser-importing file; the Solver never depends on Phaser.
- One writer per file. Agents never `git push`; only the Orchestrator merges.
- Never place final art without an `asset-request-*.md` and user-supplied files.