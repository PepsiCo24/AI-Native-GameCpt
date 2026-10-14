# AI Usage Log

> Owner: **Orchestrator (Agent 0)**
> Purpose: rough cost control. **Never** record API keys, tokens, or provider secrets here.

Rough counts only — no exact token accounting is available from the harness.

## 2026-10-14 — Stage 0 (bootstrap, model routing, design round)

| Phase | Agents / models used | Count | Notes |
|---|---|---|---|
| Model smoke test | kimi-k3, glm-5.3, qwen3.8-max, qwen3.8-flash, deepseek-v4.1-flash | 5 probes | identical tiny task; all passed |
| Vision probe | same 5 models | 5 probes | only qwen3.8-max accepted image input |
| Design round | game-designer (kimi-k3), architect (kimi-k3), ui-art-director (qwen3.8-max) | 3 (1 retry) | GD-001 first attempt wrote no files → retried once |
| Synthesis | reviewer (qwen3.8-max) | 1 | read-only review |
| Docs | docs-github (qwen3.8-flash) | 1 | submission skeletons + status |
| Orchestrator | kimi-k3 | — | recovery, config, integration, GitHub sync |

**Policy applied:** one shared probe per model instead of per-task model shopping; strong models reserved for design/review, fast/cheap models reserved for docs and bulk work.

## 2026-10-14 — Stage 0 review + GATE C docs + Stage 2 code kickoff

| Phase | Agents / models used | Count | Notes |
|---|---|---|---|
| GATE C docs | game-designer (kimi-k3), architect (kimi-k3), ui-art-director (qwen3.8-max) | 3 | Option B propagated to V0.4 |
| Review | reviewer (qwen3.8-max) | 1 | RV-002: 2 BLOCKER / 5 HIGH / 10 MEDIUM / 6 LOW + a verified-pass list |
| Docs sync | docs-github (qwen3.8-flash) | 1 | ITER-0005 + submission correction |
| Core code | gameplay-engineer (deepseek-v4.1-flash) | 1 | GAME-001: 775 lines, 69 self-checks, respected the `@/core/level` seam |
| Level code | level-solver (deepseek-v4.1-flash) | 4 dispatches | **LV-001 empty, LV-002 empty**; LV-001R delivered; LV-002A/B pending |
| Playtest | playtest-analyst (qwen3.8-max) | 1 | PA-002 instrumenting the ADR-0008 gate |
| QA | qa-engineer (deepseek-v4.1-flash) | 1 | QA-001 in flight |

### Agent reliability finding — the failure variable is dispatch size, not model

`level-solver` ran on the **same** `deepseek-v4.1-flash` in all four dispatches. The two empty
(zero-file) returns were both **4–5-part mixed tasks**; the one full delivery (LV-001R) was a
**single-deliverable** task carrying a per-file `ls` evidence requirement — and that one also
produced the parity proof. Same role, same model, opposite outcome.

**Routing rule adopted:** one deliverable per dispatch, with an explicit "paste the real command
output" clause and an ownership list naming the files the agent must not create. Multi-part
dispatches to the same role are treated as likely to fail. This is a **process** change, not a
model change — no re-routing of `CODING_MODEL` is justified on this evidence.

**Corollary:** no agent report is accepted without a disk check (`find` / `ls` / `tsc`). Three
sessions now show prose and files diverging.

### Where the program overrode both agents

GAME-001 and LV-001R proved the checkerboard invariant independently; RV-002 proved it exhaustively
(880,640 configs, 0 counterexamples). But they then **contradicted each other** on what makes a level
dynamic — RV-002 argued switches are static, LV-001R measured 231/500 dynamic boards. Settled by
measuring what the player actually experiences (`refusedThenEnteredTiles`) against the **shipped**
`applyMove`: M0 walls 0/200, doors alone ~0 (a 9/200 residue still unexplained and assigned to
LV-002B), **switch+door 74/200**, **opposite-colour portal 80/200 with dual-phase tiles**,
same-colour portal 0/200. Cost: three throwaway harnesses outside the repo. Value: GATE D was decided
on that table rather than on which agent sounded more confident.