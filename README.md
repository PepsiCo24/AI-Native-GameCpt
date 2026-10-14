# Phase Shift: Echo Grid · 双相棋盘：昼夜回响

> An AI-native H5 puzzle game for the **AI Native 休闲游戏创作大赛** (Oakever / 乐信圣文).
> 你每动一次，世界就变一次。

---

## One-liner

A two-phase grid puzzle. Every legal move flips the world between **Phase A (Light / 白昼)** and **Phase B (Shadow / 夜晚)**. Walls, doors and portals exist in only one phase. The player never presses a "switch world" button — the phase flip is bound to their own movement, so every step is a promise about the future board.

## Core promise

- **10 秒能懂** — tap an adjacent tile (or swipe), the world flips.
- **1 分钟 Aha** — around Level 3–5 the player discovers that *which* step they take now decides *which walls are enterable next*. Legality is judged **at entry, in the current phase only** (ADR-0008, GATE C human decision): a Phase-B wall is enterable exactly during Phase-A steps — routes depend on the **parity of your move count**, so plain phase walls genuinely open and close from L1 (**OQ-1 resolved at the rule level**). Other-phase walls render as a hollow, low-emphasis **"wall echo"**: *"enterable NOW, solid after your next move"* (ADR-0007 as revised by ADR-0008, `docs/ui-ux.md` §3.1a). Whether players discover the parity rule without text by L3–L5 is the **mandatory Stage-2 playtest gate** ADR-0008 ships with (`docs/level-design.md` §0/§2–§3).
- **5 关后还想继续** — the loop is `Observe → Move → Phase Flip → Re-plan → Reach Goal`.

## Competition requirements coverage

| Requirement | Status | Where |
|---|---|---|
| Runs directly in browser | **Scaffolded** (Vite + TS, build green; `phaser 3.90.0` pinned explicitly — npm `latest` is 4.2.1) — no playable game yet | `docs/architecture.md` V0.4 |
| Desktop + Mobile adaptive | Planned — layout rules computed, not built | `docs/ui-ux.md` §2 · `docs/architecture.md` §9 |
| ≥ 50 formal levels | **Plan + schema locked (V0.3); L1–L5 in authoring — nothing Solver-proven yet; all pre-ADR-0008 solver results void** | `docs/game-design.md` §8 · `docs/level-design.md` §1 |
| Progressive, non-monotonic difficulty | Curve designed; **weights provisional / uncalibrated** | `docs/level-difficulty.md` · `docs/level-design.md` §6 |
| First 3 levels need almost no text | Teaching ladder designed (L1–L10, rebuilt around parity in V0.3), not yet playable | `docs/level-design.md` §2–§3 · `docs/game-design.md` §9 |
| First Aha Moment at L3–L5 | Now produced **mechanically** by parity-dependent entry (ADR-0008); **unverified by playtest** | `docs/level-design.md` §3 |
| AI genuinely participates | Design / architecture / review / routing / rule-consequence analysis (reversal decided by the human at GATE C) — level generation + Solver proof not started | `docs/ai-native-pipeline.md` · `docs/ai-model-matrix.md` · `docs/ai-usage-log.md` |
| Full process recorded | Docs maintained | `docs/iteration-log.md` (ITER-0001…0005) · `docs/submission/` |

## Repository map

```
README.md
AGENTS.md                         # Studio rules: priority order, locked core rule, file ownership, gates
doc/                              # source research (input, not authored by us)
docs/
  game-design.md                  # Game Designer — living design doc (V0.4, core rule locked per ADR-0008)
  level-design.md                 # Game Designer — level schema (grid 3–7, required par) + parity teaching ladder L1–L10 (V0.3)
  level-difficulty.md             # Level AI + Solver — difficulty model & curve (weights provisional)
  architecture.md                 # Architect — technical architecture (V0.4: applyMove 6 steps, entry-only solidity, embedded states legal)
  ui-ux.md                        # UI / Art Director — screens, layout, wall echo §3.1a (hollow = passable, ADR-0007 revised by ADR-0008; R-C13 player-in-wall) (V0.4)
  ai-native-pipeline.md           # Level AI + Solver / Orchestrator — AI generation + validation chain
  ai-model-matrix.md              # Orchestrator — measured model capability probes → role routing (single source of truth)
  ai-usage-log.md                 # Orchestrator — rough AI usage / cost (no keys, no secrets)
  agent-roster.md                 # Docs + GitHub — mirror of the real 10-agent org (AGENTS.md §4 · .opencode/agents)
  project-status.md               # Orchestrator — live stage status (owned file; authored by Orchestrator)
  iteration-log.md                # Docs + GitHub — hypothesis → change → result (ITER-0001…0005)
  playtest-log.md                 # QA Engineer + Playtest Analyst — locked V0.2/V0.3 critical cases; no playtest sessions yet
  decisions/                      # ADRs
    0001-adopt-phase-shift-core-rule.md
    0002-phase-flip-bound-to-move.md
    0003-core-logic-decoupled-from-phaser.md
    0004-solver-proves-solvability.md
    0005-asset-gate.md
    0006-illegal-move-not-wall-suppression.md         # partially superseded by 0008 (banner)
    0007-other-phase-wall-echo.md                     # revised by 0008 (banner)
    0008-phase-solidity-entry-only.md                 # ★ current core rule (GATE C, Option B)
    architecture-0001-core-solver-shared-rules.md     # + V0.3 addendum + ADR-0008 addendum
  submission/
    design-thinking.md            # Docs + GitHub — submission: problem → idea → mechanics → AI role
    iteration-optimization.md     # Docs + GitHub — submission: V0…V0.4 + iteration evidence chain
  assets/
    asset-manifest.md             # UI / Art Director — asset tracker (generation moved to the user's authorised Codex channel)
    first-batch-prompts.md        # UI / Art Director — copy-paste generation sheet for the user
    asset-request-XX-*.md         # UI / Art Director — image generation prompts (ASSET GATE), 01…07
    codex-generation-brief.md ·   # Orchestrator/user — Codex prompt packs (user-authorized channel)
    codex-master-prompt.md        #   commits 06ac909 / 6976506
src/                              # toolchain scaffold + pure-TS core (src/core/state/**, src/core/rules/**) in flight — Stage 2, NOT blocked on art
tests/ · scripts/                 # not on disk yet (LV-001R / QA-001 pending)
```

## Current status

**STAGE 0 (Design Lock) + STAGE 1 (Asset Requirements) — DONE. Docs baseline: V0.4.**

**GATE C — DECIDED (2026-10-14):** the human chose **Option B — entry-only phase solidity** (ADR-0008, 8 locked clauses). Legality is judged only at entry, against the current phase; standing inside a flipped-in wall is legal (never crushed / pushed / relocated); the corollary — **parity-dependent entry** — makes M0 phase walls real route gates from L1, so **OQ-1 (static-maze risk) is resolved at the rule level**. ADR-0008 partially supersedes ADR-0006 and revises ADR-0007. It ships with a **mandatory Stage-2 playtest verification** — and **all pre-ADR-0008 Solver results are void** (SOLVER-001).

**GATE A (final art) — GENERATING (user-authorized):** the user authorised and operates **their own Codex generation channel**; no Studio agent generates final art (AGENTS.md §8 intact) — agents supply prompts and acceptance criteria only. P0 set = `echo_spirit_a/b` · `bg_phase_a/b` · `goal`; manifest rows flip to `DELIVERED` on Agent 5 validation.

**STAGE 2 (5-level prototype) — IN FLIGHT.** Toolchain scaffolded and verified (`vite 7.3.7` · `typescript 5.9.3` · `vitest 5.0.4` · `phaser 3.90.0` — pinned explicitly because npm `latest` is 4.2.1 — `zod 4.6.7`; typecheck clean, `vite build` ok, `vitest` runs, no test files yet). Stage 2 coding is **not blocked on art** — an earlier judgment corrected the same day: the board is program-drawn vectors. GAME-001 pure-TS core rules are on disk; the first LV-001 level-pipeline dispatch produced zero files (verified by `find`) and was re-dispatched as LV-001R. Doc-rule baseline: illegal move = refused (no movement, no flip, state identical); one `applyMove` shared by Gameplay and Solver (6-step order, `architecture.md` V0.4 §6); wall echo renders hollow = currently passable + R-C13 (player readable inside a wall); level schema (grid **3–7 authored cap**, 8 × 8 only with explicit Orchestrator approval; `par` required); routing measured against the live API; review rounds: RV-001 reconciled (V0.3), **RV-002 pending** before `develop` merges to `main`. Commits: `e9b9e9d` · `c2f878c` · `e69d1bf` · `a4548a7` · merge `7bd6963`; toolchain `5551bae`/`41999be`; Codex prompts `06ac909`/`6976506`.

What is still open: Stage-2 playtest must empirically confirm the ADR-0008 hypotheses — (a) parity entry discovered without text by L3–L5, (b) embedded states read as "safe — walk out", (c) parity planning reads as depth, not chaos; if the data contradicts, the decision returns to the human — never a silent revert. Then SOLVER-001 (full re-verification), QA-001 (first tests), RENDER-001, and GATE A intake. Difficulty weights are uncalibrated. Whether `par` is shown in the HUD at all awaits Game Designer sign-off (ui-ux OQ1). **Nothing has been played yet.**


## Hard rules (do not violate)

1. Phase switching is **never** a standalone button. It is bound to player movement.
2. Game rules live in **pure TypeScript core**. Phaser is visualization only, never the source of truth.
3. The Solver **never** depends on Phaser. LLM proposes levels; the program Solver proves solvability.
4. No AI-generated final art without an `asset-request-XX.md` and user-supplied files.
5. Priority order: **Fun > Readable > Expandable > Pretty.**
6. An **illegal move is refused entirely — no movement and no phase flip.** Legality is judged **at entry, against the current phase only** (wall solid in the current phase, or a door closed in the current phase, blocks entry; anything else passes). If the flip makes the tile you are standing on solid, **you stand inside the wall — a legal, stable state** — and you are **never crushed, pushed, or randomly moved**; leaving an embedded tile uses the same entry rule. Deterministic puzzles only (ADR-0008, GATE C human decision 2026-10-14, which partially superseded ADR-0006; `docs/game-design.md` V0.4 §3.1, `docs/architecture.md` V0.4 §6).
7. Other-phase walls render as a hollow, low-emphasis **"wall echo"** — *enterable now, solid after your next move* — and the player standing inside a flipped-in wall stays readable (ADR-0007 as revised by ADR-0008, `docs/ui-ux.md` §3.1a + R-C13). Presentation layer only — it never changes legality or determinism.