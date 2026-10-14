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