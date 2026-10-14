# Phase Shift: Echo Grid · 双相棋盘：昼夜回响

> An AI-native H5 puzzle game for the **AI Native 休闲游戏创作大赛** (Oakever / 乐信圣文).
> 你每动一次，世界就变一次。

---

## One-liner

A two-phase grid puzzle. Every legal move flips the world between **Phase A (Light / 白昼)** and **Phase B (Shadow / 夜晚)**. Walls, doors and portals exist in only one phase. The player never presses a "switch world" button — the phase flip is bound to their own movement, so every step is a promise about the future board.

## Core promise

- **10 秒能懂** — tap an adjacent tile (or swipe), the world flips.
- **1 分钟 Aha** — around Level 3–5 the player discovers that changing the world opens a route that did not exist before.
- **5 关后还想继续** — the loop is `Observe → Move → Phase Flip → Re-plan → Reach Goal`.

## Competition requirements coverage

| Requirement | Status | Where |
|---|---|---|
| Runs directly in browser | Planned (Vite + Phaser 3) | `docs/architecture.md` |
| Desktop + Mobile adaptive | Planned | `docs/architecture.md` § Rendering |
| ≥ 50 formal levels | Level plan locked | `docs/game-design.md` § 50-Level Rhythm |
| Progressive, non-monotonic difficulty | Difficulty curve locked | `docs/level-difficulty.md` |
| First 3 levels need almost no text | Teaching plan locked | `docs/game-design.md` § Teaching |
| First Aha Moment at L3–L5 | Designed | `docs/game-design.md` § Aha Plan |
| AI genuinely participates | Pipeline defined | `docs/ai-native-pipeline.md` |
| Full process recorded | Docs maintained | `docs/iteration-log.md` |

## Repository map

```
README.md
doc/                              # source research (input, not authored by us)
docs/
  game-design.md                  # Agent 1 — living design doc
  architecture.md                 # Agent 2 — technical architecture V0.1
  ai-native-pipeline.md           # Agent 4/0 — AI generation + validation chain
  agent-roster.md                 # Agent 0 — multi-agent org chart
  level-difficulty.md             # Agent 4 — difficulty model & curve
  iteration-log.md                # Agent 8 — hypothesis → change → result
  playtest-log.md                 # Agent 6/7 — playtest & telemetry records
  decisions/                      # ADRs (architecture / design decisions)
  assets/
    asset-manifest.md             # Agent 5 — asset tracker
    asset-request-XX-*.md         # Agent 5 — image generation prompts (ASSET GATE)
```

## Current status

**STAGE 0 (Design Lock) + STAGE 1 (Asset Requirements) — DONE.**

**WAITING_FOR_USER_ASSETS** — the project does **not** proceed to prototype coding until the first asset batch is delivered by the user.

## Hard rules (do not violate)

1. Phase switching is **never** a standalone button. It is bound to player movement.
2. Game rules live in **pure TypeScript core**. Phaser is visualization only, never the source of truth.
3. The Solver **never** depends on Phaser. LLM proposes levels; the program Solver proves solvability.
4. No AI-generated final art without an `asset-request-XX.md` and user-supplied files.
5. Priority order: **Fun > Readable > Expandable > Pretty.**