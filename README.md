# Phase Shift: Echo Grid · 双相棋盘：昼夜回响

> An AI-native H5 puzzle game for the **AI Native 休闲游戏创作大赛** (Oakever / 乐信圣文).
> 你每动一次，世界就变一次。

---

## One-liner

A two-phase grid puzzle. Every legal move flips the world between **Phase A (Light / 白昼)** and **Phase B (Shadow / 夜晚)**. Walls, doors and portals exist in only one phase. The player never presses a "switch world" button — the phase flip is bound to their own movement, so every step is a promise about the future board.

## Core promise

- **10 秒能懂** — tap an adjacent tile (or swipe), the world flips.
- **1 分钟 Aha** — what the player genuinely discovers, in the order the ladder can actually deliver it (**GATE D / ADR-0009**, human decision — this replaces the parity-routing story we believed at GATE C):
  - **L4–L5 · the phantom walk** — a hollow tile is enterable → *it solidifies under my feet* → and I walk out, unharmed. This is Option B's real gift, taught on purpose, and it is **not** route dynamism.
  - **L8 · Aha #1, the latch** — the switch I stepped on **stays** changed after I walk away, so the very door that refused me now answers "yes": **"我踩过的东西，改变了我脚下的世界。"**
  Why this is the honest version: the **checkerboard invariant** — a 4-connected grid is bipartite, every legal move flips the phase, and a refusal costs no move — fixes the phase in which each tile can be *entered*; a detour adds 2 moves, never 1. So plain phase walls **never open and close on a timer**: a parity-dead wall is permanent geometry, a parity-live wall is the phantom-walk vehicle. Legality is still judged **at entry, in the current phase only** (ADR-0008 **rules 1–7**, unchanged). Real decisions arrive **by schedule, not by rule**: the **M1+M3 latch unit from L6** and **M2 opposite-colour portals from L11** (Aha #2 — *"同一个格子，因为我从哪边来而应答不同"*). Other-phase walls render as a hollow, low-emphasis **"wall echo"** — *passable now, solid after your next move* — and that axis is now a measured guarantee rather than a hope: a wall that can never be entered is only ever seen **solid** (`docs/ui-ux.md` §3.1a · `docs/iteration-log.md` ITER-0006). Whether players read the phantom walk and the latch without text is the **Stage-2 playtest gate** (ADR-0009 decision 8, `docs/level-design.md` §2–§3).
- **5 关后还想继续** — the loop is `Observe → Move → Phase Flip → Re-plan → Reach Goal`.

## Competition requirements coverage

| Requirement | Status | Where |
|---|---|---|
| Runs directly in browser | **Scaffolded + verified** (Vite + TS, build green; `phaser 3.90.0` pinned explicitly — npm `latest` is 4.2.1); pure-TS core, level data and automated tests on disk; browser rendering (RENDER-001) not yet | `docs/architecture.md` V0.4 |
| Desktop + Mobile adaptive | Planned — layout rules computed, not built | `docs/ui-ux.md` §2 · `docs/architecture.md` §9 |
| ≥ 50 formal levels | **Plan + schema (grid 3–7, required `par`) locked; the 5-level prototype is authored with BFS-verified pars (4/5/6/6/6); the 50-level set is not authored and full SOLVER-001 re-verification is still owed** | `docs/game-design.md` §8 · `docs/level-design.md` §1 |
| Progressive, non-monotonic difficulty | Curve re-based at GATE D (new-mechanic dips move to **L6** and **L11**); **weights provisional / uncalibrated** | `docs/level-difficulty.md` · `docs/level-design.md` §6 |
| First 3 levels need almost no text | Teaching ladder designed (L1–L10, **V0.4**: L1–L2 movement + flip, L3 permanent refusal, L4–L5 phantom walk, L6–L10 latch unit), not yet playable | `docs/level-design.md` §2–§3 · `docs/game-design.md` §9 |
| First Aha Moment at L3–L5 | **Honestly re-scheduled at GATE D:** L3–L5 carry literacy, refusal and the phantom walk; the first **mechanical** Aha is the **latch at L8** — the parity-gate Aha the V0.3 ladder promised is **unconstructible** (checkerboard invariant). **Unverified by playtest** | `docs/level-design.md` §2–§3 · ADR-0009 |
| AI genuinely participates | Design / architecture / review / routing / rule-consequence analysis. The strongest evidence so far: **the theorem that overturned GATE C's stated rationale was proved by machine measurement, not by opinion** — and the human then chose D3 at GATE D (core rule untouched). LLM level-candidate generation + full Solver proof not started | `docs/ai-native-pipeline.md` · `docs/ai-model-matrix.md` · `docs/ai-usage-log.md` · ADR-0009 |
| Full process recorded | Docs maintained | `docs/iteration-log.md` (ITER-0001…0006) · `docs/submission/` |

## Repository map

```
README.md
AGENTS.md                         # Studio rules: priority order, locked core rule, file ownership, gates
doc/                              # source research (input, not authored by us)
docs/
  game-design.md                  # Game Designer — living design doc (V0.5: core rule per ADR-0008 rules 1–7; mechanic schedule per GATE D / ADR-0009)
  level-design.md                 # Game Designer — level schema (grid 3–7, required par) + teaching ladder L1–L10 (V0.4: phantom walk L4–L5, latch unit L6–L10)
  level-difficulty.md             # Level AI + Solver — difficulty model & curve (weights provisional)
  architecture.md                 # Architect — technical architecture (V0.4: applyMove 6 steps, entry-only solidity, embedded states legal — untouched by GATE D)
  ui-ux.md                        # UI / Art Director — screens, layout, wall echo §3.1a (solid = blocking / hollow = currently passable; R-C13 player-in-wall) — V0.4, GATE D pass in flight
  ai-native-pipeline.md           # Level AI + Solver / Orchestrator — AI generation + validation chain
  ai-model-matrix.md              # Orchestrator — measured model capability probes → role routing (single source of truth)
  ai-usage-log.md                 # Orchestrator — rough AI usage / cost (no keys, no secrets)
  agent-roster.md                 # Docs + GitHub — mirror of the real 10-agent org (AGENTS.md §4 · .opencode/agents)
  project-status.md               # Orchestrator — live stage status (owned file; authored by Orchestrator)
  iteration-log.md                # Docs + GitHub — hypothesis → change → result (ITER-0001…0006)
  playtest-log.md                 # QA Engineer + Playtest Analyst — locked V0.2/V0.3 critical cases; no playtest sessions yet
  decisions/                      # ADRs
    0001-adopt-phase-shift-core-rule.md
    0002-phase-flip-bound-to-move.md
    0003-core-logic-decoupled-from-phaser.md
    0004-solver-proves-solvability.md
    0005-asset-gate.md
    0006-illegal-move-not-wall-suppression.md         # partially superseded by 0008 (banner)
    0007-other-phase-wall-echo.md                     # revised by 0008 (banner)
    0008-phase-solidity-entry-only.md                 # ★ core rule 1–7 (GATE C, Option B) — clause 8 WITHDRAWN at GATE D (banner)
    0009-checkerboard-invariant-mechanics-forward.md  # ★★ CURRENT truth source: invariant + mechanics forward (GATE D, D3)
    architecture-0001-core-solver-shared-rules.md     # + V0.3 addendum + ADR-0008 addendum
  submission/
    design-thinking.md            # Docs + GitHub — submission: problem → idea → mechanics → AI role
    iteration-optimization.md     # Docs + GitHub — submission: V0…V0.5 + iteration evidence chain
  assets/
    asset-manifest.md             # UI / Art Director — asset tracker (generation moved to the user's authorised Codex channel)
    first-batch-prompts.md        # UI / Art Director — copy-paste generation sheet for the user
    asset-request-XX-*.md         # UI / Art Director — image generation prompts (ASSET GATE), 01…07
    codex-generation-brief.md ·   # Orchestrator/user — Codex prompt packs (user-authorized channel)
    codex-master-prompt.md        #   commits 06ac909 / 6976506
src/                              # pure-TS core (state + rules), level contract + l001…l005 on disk
tests/ · scripts/                 # on disk (QA-001): 8 Vitest files + scripts/validate-levels.ts · .github/workflows/ci.yml
```

## Current status

**STAGE 0 (Design Lock) + STAGE 1 (Asset Requirements) — DONE. Docs baseline: V0.5 design / V0.4 levels · architecture · UI — i.e. post-GATE D (ADR-0009).**

**GATE C — DECIDED (2026-10-14), then MEASURED (same day):** the human chose **Option B — entry-only phase solidity**. The recorded reason (ADR-0008 clause 8) was that parity-dependent entry would make M0 phase walls real route gates from L1 and so **resolve OQ-1**. **That reason proved false.** The checkerboard invariant — a 4-connected grid is bipartite, every legal move flips the phase, an illegal move consumes nothing — means the phase in which a tile is *entered* is fixed by the tile itself (a detour adds 2 moves, never 1). Four independent program results agree: **GAME-001** (analytic proof + 200-board sweep), **LV-001R** (4,000 levels × 4 mechanic mixes), the **Orchestrator's own BFS harness driving the shipped `applyMove`** (400 boards → 0 dual-phase tiles, 0 violations) and **RV-002** (exhaustive sweep of **880,640** configurations → 0 counterexamples). **A decision the human approved was overturned by our own measurement** — recorded as such, not smoothed into "we always knew".
**What stands:** ADR-0008 **rules 1–7, word for word** (entry-only legality, flip bound to movement, standing inside a wall is legal, exit by the same rule, doors share wall semantics, portals trigger once, phase-independent win with a dual-phase-safe goal). Option B **did** buy one new, perceptible beat that ADR-0006 never had — *walk into a phantom echo → it solidifies under me → I walk out* — honestly labelled the **phantom walk** at L4–L5, and **never** again as routing dynamism. All pre-ADR-0008 Solver results remain void (SOLVER-001).

**GATE D — DECIDED (2026-10-14): the human chose D3 — mechanics forward, core rule unchanged** (ADR-0009). OQ-1 is resolved **by level schedule, not by rule**: **M3 promoted OPTIONAL → CORE**; **M1 doors never ship alone** (measured static: doors alone ≈ 0 decisions, 9/200 anomalous residue handed to SOLVER-001 for qualification); **door + switch is one teaching unit at L6–L10**, with **Aha #1 (the latch) at L8** — 74/200 boards produced real latch decisions, *without* breaking the invariant; **M2 portals at L11** under the **opposite-colour law** (80/200 — genuine parity break; same-colour pairs measured **0/200**, inert, and rejected by the validator). Aha #1 = **"我踩过的东西，改变了我脚下的世界"**; Aha #2 = **"同一个格子，因为我从哪边来而应答不同"**. The parity-gate Aha ("a side step changes parity and the wall that refused me becomes my route") is **unconstructible** and has been deleted from the design docs.

**GATE A (final art) — GENERATING (user-authorized):** the user authorised and operates **their own Codex generation channel**; no Studio agent generates final art (AGENTS.md §8 intact) — agents supply prompts and acceptance criteria only. P0 set = `echo_spirit_a/b` · `bg_phase_a/b` · `goal`; manifest rows flip to `DELIVERED` on Agent 5 validation.

**STAGE 2 (5-level prototype) — IN FLIGHT.** Toolchain scaffolded and verified (`vite 7.3.7` · `typescript 5.9.3` · `vitest 5.0.4` · `phaser 3.90.0` — pinned explicitly because npm `latest` is 4.2.1 — `zod 4.6.7`; typecheck clean, `vite build` ok). Stage 2 coding is **not blocked on art** — an earlier judgment corrected the same day: the board is program-drawn vectors. **QA-001 is delivered:** 8 Vitest files — rule property tests, `hashState`, board invariants, golden trajectories, an Option-B regression suite, the import-boundary gate, level validation and the level dataset — **89 tests passing, 3 explicitly skipped**, **zero production-code changes**; the `--passWithNoTests` escape hatch has been **removed** so an empty suite can never look green again, and CI (`.github/workflows/ci.yml`: typecheck → vitest → level validation → build) now runs the same gates on every push. GAME-001 pure-TS core rules are on disk; LV-001 delivered zero files (verified by `find`), was re-dispatched as **LV-001R**, and the level contract + `l001–l005.json` + `scripts/validate-levels.ts` are now on disk with BFS-verified pars **4/5/6/6/6**. Doc-rule baseline: illegal move = refused (no movement, no flip, state identical); one `applyMove` shared by Gameplay and Solver (6-step order, `architecture.md` V0.4 §6); wall echo renders hollow = currently passable + R-C13 (player readable inside a wall); level schema (grid **3–7 authored cap**, 8 × 8 only with explicit Orchestrator approval; `par` required; **opposite-colour portal law** enforced — ADR-0009); routing measured against the live API; review rounds: RV-001 reconciled (V0.3), **RV-002** ran the exhaustive counterexample sweep (**880,640 configurations → 0**) and its findings are being folded in. Commits: `e9b9e9d` · `c2f878c` · `e69d1bf` · `a4548a7` · merge `7bd6963`; toolchain `5551bae`/`41999be`; Codex prompts `06ac909`/`6976506`; GATE D round `e189145` · `bb60c87` · `16cf6b3` · `f3ba2ca` · `2186282`.

What is still open: Stage-2 playtest must empirically confirm the **re-based ADR-0009 hypotheses** — (a′) players read the **latch** (step on the switch, the door changes and *stays* changed) without text by L8, (b) embedded states read as "safe — walk out" (now load-bearing earlier, at L4–L5), (c′) portal travel reads as "space folded", not disorientation, (d′) the M0-only opening L1–L5 retains players to L6 **without a mechanical Aha**; if the data contradicts, the decision returns to the human — never a silent revert. Then SOLVER-001 (full re-verification + qualification of the 9/200 door-only residue), RENDER-001, and GATE A intake. Difficulty weights are uncalibrated. Whether `par` is shown in the HUD at all awaits Game Designer sign-off (ui-ux OQ1). **Nothing has been played yet.**


## Hard rules (do not violate)

1. Phase switching is **never** a standalone button. It is bound to player movement.
2. Game rules live in **pure TypeScript core**. Phaser is visualization only, never the source of truth.
3. The Solver **never** depends on Phaser. LLM proposes levels; the program Solver proves solvability.
4. No AI-generated final art without an `asset-request-XX.md` and user-supplied files.
5. Priority order: **Fun > Readable > Expandable > Pretty.**
6. An **illegal move is refused entirely — no movement and no phase flip.** Legality is judged **at entry, against the current phase only** (wall solid in the current phase, or a door closed in the current phase, blocks entry; anything else passes). If the flip makes the tile you are standing on solid, **you stand inside the wall — a legal, stable state** — and you are **never crushed, pushed, or randomly moved**; leaving an embedded tile uses the same entry rule. Deterministic puzzles only (ADR-0008 **rules 1–7**, human decision at GATE C 2026-10-14, which partially superseded ADR-0006 — **and these rules survived GATE D untouched**; `docs/game-design.md` V0.5 §3.1, `docs/architecture.md` V0.4 §6).
7. Other-phase walls render as a hollow, low-emphasis **"wall echo"** — *passable now, solid after your next move* — and the player standing inside a flipped-in wall stays readable (ADR-0007 as revised by ADR-0008, `docs/ui-ux.md` §3.1a + R-C13). Presentation layer only — it never changes legality or determinism.
8. **The checkerboard invariant is design law** (ADR-0009, GATE D human decision 2026-10-14): on a walking board the phase in which a tile can be entered is fixed by the tile — a detour adds 2 moves, never 1 — so a plain phase wall is **permanent geometry or the phantom-walk vehicle, never a timing gate**. "Refused first, entered later" requires **latch state (M1+M3)** or an **opposite-colour portal (M2)**; same-colour portal pairs are measured inert and are rejected by the validator. The first mechanical Aha is therefore the **latch at L8**, and no level lesson, doc or marketing line may revive the parity-gate story.