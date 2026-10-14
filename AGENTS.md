# AGENTS.md — Phase Shift: Echo Grid · AI-Native Game Studio

This repository is run by a **multi-agent game studio**, not a single coding agent.
Read this file before doing anything. It overrides default behaviour.

---

## 0. Project

- **Game:** Phase Shift: Echo Grid / 双相棋盘：昼夜回响
- **Competition:** AI Native 休闲游戏创作大赛
- **Platform:** H5 / mobile browser / desktop browser
- **Stack:** TypeScript · Phaser 3 · Vite · Vitest · Playwright · zod
- **Repository:** https://github.com/PepsiCo24/AI-Native-GameCpt

The only final question that matters: **"这个游戏到底好不好玩？"**

## 1. Priority order (use this to settle every dispute)

`Fun > Player Comprehension > Puzzle Depth > Level Scalability > Determinism > Testability > Development Cost > Visual Polish`

## 2. The locked core rule (do not silently change)

- World has two phases: **A = Light / 白昼**, **B = Shadow / 夜晚**.
- **Every legal move flips the phase** (A→B, B→A). There is **no manual switch button**.
- Walls / doors / portals exist in only one phase.
- **Illegal move = no movement and no phase flip.**
- A move that would leave the player standing on a phase wall is **illegal** (the player is never crushed / pushed / randomly moved). Deterministic puzzles only.
- Changing this core loop requires **Game Designer + Playtest Analyst + Orchestrator** agreement and an ADR in `docs/decisions/`.

## 3. Architecture boundary (hard rule)

```
Renderer (Phaser)  →  Gameplay  →  Core Logic (pure TS)  ←  Solver
```

- `src/core/**` is **pure TypeScript**: never import Phaser there.
- The Solver depends on Core only — **Solver → Phaser is forbidden**.
- Gameplay and Solver must call the **same** `applyMove` rule function. One truth source.

## 4. File ownership (single writer per file — no concurrent edits)

| Owner | Owns | Must not touch |
|---|---|---|
| Orchestrator | `opencode.json`, `AGENTS.md`, `.opencode/agents/**`, `docs/project-status.md`, Git merge/push | feature code |
| Game Designer | `docs/game-design.md`, `docs/level-design.md`, `docs/decisions/design-*` | core engine |
| Architect | `docs/architecture.md`, `docs/decisions/architecture-*` | feature implementation |
| Gameplay Engineer | `src/core/state/**`, `src/core/rules/**`, `src/game/**` (incl. `src/game/renderer/**`) | level solver, level data |
| Level AI + Solver | `src/core/level/**`, `src/core/solver/**`, `scripts/**`, `src/levels/**`, `tests/solver/**`, `docs/ai-native-pipeline.md`, `docs/level-difficulty.md` | `src/game/**` |
| UI / Art Director | `docs/ui-ux.md`, `docs/assets/**`, later `src/ui/**` (holds **spec authority** over the renderer, but `src/game/renderer/**` is *written* by the Gameplay Engineer) | core rules |
| QA Engineer | `tests/**`, `playwright.config.*` | production logic |
| Playtest Analyst | `docs/playtest-log.md`, `docs/playtest-analysis/**` | production code |
| Reviewer | nothing (read-only) | all edits |
| Docs + GitHub | `README.md`, `docs/iteration-log.md`, `docs/submission/**`, other `docs/**` not claimed above; may **format** (not change the meaning of) files owned by another role | merge authority; may not overwrite another role's owned file |

**Never** let two agents modify `GameState`, the level schema, core rules, `package.json`, `opencode.json`, or `AGENTS.md` at once.

**ADRs:** numbered `docs/decisions/NNNN-*.md` are authored by the role that owns the decision (design ↔ Game Designer, architecture ↔ Architect) and approved by the Orchestrator. No agent edits another role's ADR without Orchestrator approval.

## 5. Task contract (every dispatch)

```
TASK_ID / ROLE / GOAL / CONTEXT / INPUT / WORKTREE /
OWNED_FILES / READ_ONLY_FILES / DO_NOT_TOUCH /
DEPENDENCIES / ACCEPTANCE_CRITERIA / TEST_COMMANDS /
DOCUMENTATION_REQUIRED / COMMIT_MESSAGE
```

Return contract:

```
STATUS / SUMMARY / FILES_CHANGED / TESTS_RUN / TEST_RESULTS /
DESIGN_IMPACT / RISKS / OPEN_QUESTIONS / COMMIT_SHA / NEXT_HANDOFF
```

Never answer with only "Done".

## 6. Git strategy

- `main` = stable. `develop` = integration. `agent/<role>/<task>` = task branches.
- Flow: `agent branch → review → develop → (milestone) main`.
- **No agent pushes `main` directly.** Only the Orchestrator merges/pushes.
- Atomic commits: `feat(core):`, `feat(level):`, `feat(ui):`, `fix(core):`, `test(solver):`, `docs(design):`, `chore:`.
- Any commit that changes gameplay **must** update `docs/game-design.md` or `docs/iteration-log.md`.

## 7. Evidence / quality gate

Claiming completion requires evidence: code ⇒ tests; levels ⇒ solver proof; design ⇒ playtest or explicit hypothesis; GitHub ⇒ commit SHA; assets ⇒ manifest entry.
Forbidden words as proof: "should work", "looks fine", "probably done". LLM opinion never replaces the program Solver.

## 8. Asset Gate (hard human gate)

No agent may generate final competition art. New art requires a `docs/assets/asset-request-XX-*.md` (Asset ID / Name / Usage / Quantity / Size / Ratio / Transparency / Composition / Shared Style / Chinese prompt / English prompt / Negative prompt / Filename / Destination / Acceptance criteria). Then output `WAITING_FOR_USER_ASSETS` and stop dependent work. The user generates images.

## 9. Security (absolute)

Never print, log, commit, copy, or echo API keys, tokens, passwords, cookies, accounts, or credential values. `.env`, `.env.*`, `*.secret`, `credentials*`, `auth.json` must never enter Git. Provider credentials come only from env vars (`LEARNINGS_CAMPUS_API_KEY`, `LEARNINGS_CAMPUS_API_BASE`) — never write real values into `opencode.json`, `AGENTS.md`, README, docs, source, or commit messages.

## 10. YAGNI

Out of scope: accounts, servers, login, shop, ads, check-in, progression, equipment, skill trees, currency, leaderboards, social, story system, online PvP, heavy particles, complex animation state machines. Only build what deepens the puzzle core.

## 11. Model routing

See `docs/ai-model-matrix.md`. Roles are abstract (`REASONING_MODEL`, `CODING_MODEL`, `FAST_MODEL`, `REVIEW_MODEL`, `VISION_MODEL`); a model name is config, not architecture. Solvability is **always** judged by the program Solver, never a model.