# AI Model Matrix — Phase Shift: Echo Grid

> Owner: **Orchestrator (Agent 0)**
> Date: 2026-10-14 · Provider: `learnings_campus` (OpenAI-compatible endpoint)
> Method: actual API behaviour, never name-based assumptions.

---

## 1. Test method (low cost, ~10 tiny probes)

Each candidate model ran an **identical probe** as an isolated child session:

1. Text reasoning — one sentence on why binding a phase flip to every move adds planning depth.
2. TypeScript coding — return a compact `clamp(n,min,max):number` as a string.
3. Structured output — return one strict JSON object, no markdown fences.
4. Tool calling — call the **write** tool (create a file) and the **shell** tool (`node -e "console.log('tool-ok'+(1+1))"`), then report the stdout.
5. Vision — read a generated 64×64 PNG (four colour quadrants R/G/B/Y + white centre square) and report the colours.

Probes wrote only to the approved temp dir (`…/T/opencode/`), never to the repo.

## 2. Results

| Model | Text reasoning | TS coding | Strict JSON | Tool calling | Vision | Notes |
|---|---|---|---|---|---|---|
| **kimi-k3** | PASS | PASS | PASS | PASS (write+shell) | **FAIL** (text-only) | Clear, well-structured reasoning; strong design/architecture prose. |
| **glm-5.3** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Precise code; concise explanations. |
| **qwen3.8-max** | PASS | PASS | PASS | PASS | **PASS** — read `TL=red, TR=green, BL=blue, BR=yellow`, centre `white square` | Only vision-capable model. 1,000,000-token context. Best review candidate. |
| **qwen3.8-flash** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Fast, correct, cheap. Good for bulk generation. |
| **deepseek-v4.1-flash** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Fast, correct, idiomatic TS. Good default coding model. |

All five returned **schema-conformant JSON with no fences** and correct `clamp` implementations, and all five successfully wrote a file and returned shell stdout `tool-ok2`. **No timeouts occurred.**

### Latency
All probes completed in a single turn. The harness exposes no per-request millisecond timing hook, so latency is recorded **qualitatively**: every model finished without a retry; no model was materially slow enough to affect routing. This is *not* a benchmark — re-test if a model starts failing real tasks.

### Vision (decisive)
The provider config declares `image` input **only** for `qwen3.8-max`; the probe independently confirmed that the other four models **reject image input**. `qwen3.8-max` described the image correctly, so it is the sole `VISION_MODEL`.

## 3. Routing decision (roles are abstract — names are config)

| Role | Assigned model | Used by |
|---|---|---|
| **REASONING_MODEL** | `kimi-k3` | Game Designer, Architect |
| **CODING_MODEL** | `deepseek-v4.1-flash` | Gameplay Engineer, Level Solver, QA |
| **FAST_MODEL** | `qwen3.8-flash` | Docs + GitHub, bulk level candidates |
| **REVIEW_MODEL** | `qwen3.8-max` | Reviewer, Playtest Analyst |
| **VISION_MODEL** | `qwen3.8-max` | UI/UX/Art Director (asset validation, screenshot review) |

Agent → model mapping lives in `.opencode/agents/*.md` frontmatter.

## 4. Cost policy

- Routine coding, tests, docs formatting, bulk candidate generation → **FAST/CODING** models.
- Design, architecture, hard debugging, major review, playtest diagnosis → **REASONING/REVIEW** models.
- Never send one question to five strong models. Screen candidates with the fast model first, then escalate.
- Rough usage is tracked in `docs/ai-usage-log.md` (no keys, no provider secrets).

## 5. Invariants

- **Solvability is always judged by the program Solver, never by any model** — including the vision model.
- A model name is configuration, not architecture. Any role can be reassigned without changing the codebase.