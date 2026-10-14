# Iteration & Optimization Process — Phase Shift: Echo Grid

> Owner: **Docs + GitHub**
> Date: 2026-10-14 · Doc version: **V0.3** (V0.1 skeleton → V0.2 after the RV-001 review round → V0.3 after GATE C / ADR-0008)
> Source of truth: `docs/iteration-log.md` (ITER-0001…0005 — the V0.3 and V0.4 rounds are now filed there), `docs/ai-usage-log.md`, `docs/decisions/*` (ADRs 0001–0008 + architecture-0001; 0006 partially superseded and 0007 revised by 0008), git history, per-document change logs (`game-design.md` §changelog, `architecture.md` §changelog, `ui-ux.md` §13, `level-design.md`), `docs/playtest-log.md`, `docs/project-status.md`
>
> **Honesty rule for this file.** Only iterations that actually happened are written as fact. Every section after the version table is a **prepared skeleton marked `PENDING — not yet run`** with no numbers, no player quotes and no conclusions. When real data arrives it replaces the marker, and the marker itself stays in git history as proof it was written before the data existed. **Fabricated playtest numbers would invalidate the entire submission.**

---

## 1. Version history — what is real

| Version | Date | What was locked | Evidence |
|---|---|---|---|
| **V0** | before 2026-10-14 | Initial instinct: a Gravity-style stacking puzzle ("Gravity Stack") | Superseded. Research showed the Gravity sub-genre is already dense (Gravity Grid, Gravity Block Fall, Gravity Tiles, Block Drift). |
| **V0.1** | 2026-10-14 | **Design + architecture lock.** Core rule (one move ⇒ one flip, no switch button); mechanics M0–M4; 50-level rhythm; data-driven level JSON; Core/Gameplay/Renderer/Solver boundary; AI pipeline "LLM creates, Solver proves, human decides"; difficulty model `D`; ASSET GATE with requests A-01…A-07 | `docs/game-design.md` V0.1, `docs/architecture.md` V0.1, ADR-0001…0005, ITER-0001/0002, commits `b981dcd`…`0345c52` |
| **V0.2** | 2026-10-14 | **Illegal-move rule locked + measured model routing + level/UI specs.** Illegal move is refused atomically (no movement, **no flip consumed**); V0.1 wall-suppression rule **rejected and superseded**; 7-step `applyMove` order; `hashState` contract + BFS finiteness proof; `level-design.md`; `ui-ux.md`; `ai-model-matrix.md` from a live 5-model probe | ADR-0006, ADR-architecture-0001, `game-design.md` V0.2 §3.1, `architecture.md` V0.2 §6.1–§6.3/§12.1/§13, ITER-0003 |
| **V0.3** | 2026-10-14 | **RV-001 review reconciliation (the review loop applied to the docs themselves).** Reviewer found the docs contradicted the locked rules: blocker **B-1** (ADR-0006 refusals vs. ui-ux V0.1 "never render ghost walls" → refusals on empty-looking tiles read as broken input) resolved by **ADR-0007 wall echo** (presentation-only; binding contract `ui-ux.md` §3.1a R-E1…R-E8, measured echo tokens, B `obj.wall` re-tuned to 5.56:1); step-6 solidity check extended from walls to **walls + closed doors**; win condition pinned phase-independent; `par` made a **required** `LevelDef` field (stamped from Solver `shortestSolution`, never a fail condition); schema/layout conflict **OQ4 closed** (`width`/`height` int 3–7, authored ≤ 7 × 7, 8 × 8 only with Orchestrator approval); `doorsOpen`/`switchesOn`/portal canonical-by-construction semantics pinned; A* wording unified to "BFS until profiled"; roster / pipeline routing / playtest vocabulary reconciled (docs-github DG-002) | ADR-0007, ADR-architecture-0001 addendum, `game-design.md` V0.3, `architecture.md` V0.3, `ui-ux.md` V0.3 (UA-002), `level-design.md` §1/§5, `agent-roster.md` V0.2, `ai-native-pipeline.md` V0.2, `playtest-log.md` V0.2 |
| **V0.4** | 2026-10-14 | **GATE C — the human reverses a locked rule (ADR-0008, Option B: entry-only phase solidity).** Trigger was **OQ-1**, documented at the V0.2 lock itself: under ADR-0006's union property the M0-only stretch L1–L20 is a mechanically static maze. New rule (8 clauses): legality **only at entry, only in the current phase**; the post-flip standing check and the union property are **deleted**; standing inside a flipped-in wall is legal — never crushed / pushed / relocated; doors share wall semantics; portals trigger on entry once; win = on goal after full resolution, any phase, goal non-wall in both phases; corollary **parity-dependent entry ⇒ M0 walls open/close routes from L1, OQ-1 RESOLVED (mechanically)**. Partially supersedes ADR-0006, revises ADR-0007 (echo semantics; R-E1…R-E8 rendering contract unchanged). Docs rebaselined: `game-design.md` **V0.4**, `architecture.md` **V0.4** (`applyMove` **7→6 steps**), `ui-ux.md` **V0.4** (echo **hollow = passable**, new **R-C13** embedded-player contract), `level-design.md` **V0.3** (parity teaching ladder). Toolchain scaffold verified (`vite 7.3.7` · `typescript 5.9.3` · `vitest 5.0.4` · **`phaser 3.90.0`, explicit 3.x pin — npm `latest` is 4.2.1** · `zod 4.6.7`; typecheck clean, `vite build` ok, `vitest` runs). GATE A → **GENERATING (user-authorized Codex channel)**. **All pre-ADR-0008 Solver results void.** Obligations: Stage-2 playtest verification (a/b/c), SOLVER-001, RV-002 before `main`. | ADR-0008 (+ banners on 0006/0007, architecture-0001 addendum), `game-design.md` V0.4 §3.1, `architecture.md` V0.4 §6, `ui-ux.md` V0.4, `level-design.md` V0.3, ITER-0005; commits `e9b9e9d` · `c2f878c` · `e69d1bf` · `a4548a7` · merge `7bd6963`; toolchain `5551bae`/`41999be`; Codex prompt packs `06ac909`/`6976506` |

### V0.1 → V0.2: the first real rule correction *(second condition since reversed at GATE C — see the V0.4 section below)*

This was, at the time, the most valuable iteration we had, and it happened **on paper, before a line of gameplay code existed** — which is exactly the point of the process. Everything in the table below records what was actually decided under ADR-0006; the post-flip standing check and the union property were later **deleted by the human at GATE C (ADR-0008)** — the decision, its reasoning and its evidence are kept here as dated history, not rewritten into hindsight correctness.

| Step | Content |
|---|---|
| **Original hypothesis (V0.1)** | "The player is never covered — an incoming wall is suppressed on the player's tile," telegraphed visually by keeping that tile clear. |
| **Observed problem** | One object gets **two rule paths**: a wall sometimes blocks, sometimes yields. Player model and Solver can disagree about the same board; post-flip board no longer matches level data; "walls that aren't always walls" weakens every mechanic stacked on top of them. The flip also stops being dangerous, which removes the planning pressure the whole game is built on. |
| **Change (V0.2)** | A move is legal only if the destination is clear in the current phase **and** the tile the player would stand on after the flip is not a wall in the new phase. An illegal move is refused **atomically: no movement and no phase flip** — the flip is a consequence of a legal move only and is never consumed. |
| **Evidence** | Case analysis producing the **union property** (a tile that is a wall in either phase is never a legal destination) — a consequence that was real *under this rule* and that, via OQ-1, ultimately got the rule itself reversed at GATE C; consistency with ADR-0002 (flip bound to *legal* moves) and ADR-0004 (gameplay and Solver share one truth source). Architectural mirror in architecture-0001: single `applyMove`, fixed step order (**7 steps** at V0.2–V0.3; reduced to **6 steps** in `architecture.md` V0.4 when ADR-0008 deleted the post-flip rollback), illegal = identity, derived `isLegalMove` pinned by a property test, `hashState` field list, finite BFS graph `w × h × 2 × 2^\|doors\| × 2^\|switches\|`. |
| **Result** | Rule locked in `game-design.md` V0.2 §3.1 and `architecture.md` V0.2 §6.1–§6.3. The teaching ladder was **rebuilt around refusal-as-tutorial** (`level-design.md` §2–§3): the bump itself is the explanation, which is what makes "≤ 1 hint line in L1–L3" achievable. Consequences accepted: levels can now contain true dead ends (generator must reject them; target dead-end ratio 0 for L1–L20), and refused moves need unmistakable feedback (bump + phase visibly not flipping) or they read as input failure — logged as a UI dependency. |
| **Alternatives rejected** | crush = death (adds a fail state the design excludes; anti-casual); push/slide to a free tile (violates "never crushed / pushed / randomly moved"); allow standing but block passing through (same two-path problem, plus ambiguous Solver states). |
| **Empirical status** | Playtest Analyst confirmation was explicitly pending Stage 2 (recorded in the ADR header, not implied as done). No playtest ever ran against ADR-0006: **GATE C reversed its second condition first** (2026-10-14, ADR-0008). The empirical obligation now belongs to ADR-0008's mandatory Stage-2 verification. |

### Other real V0.2 work

- **Model routing decided by measurement, not by name.** Five candidate models each ran the *same* five-part probe as isolated child sessions: text reasoning, a TypeScript `clamp`, strict fence-free JSON, tool calling (`write` + `shell`), and vision (read a generated 64×64 PNG of four colour quadrants plus a white centre square). All five passed text/coding/JSON/tools; all five returned correct `clamp`; all wrote a file and reported `tool-ok2`; **no timeouts**. Only **`qwen3.8-max`** accepted image input and named the quadrants correctly → sole `VISION_MODEL`. Provider config declared `image` for `qwen3.8-max` only, and the probe independently confirmed the other four reject images. Routing: REASONING `kimi-k3` · CODING `deepseek-v4.1-flash` · FAST `qwen3.8-flash` · REVIEW `qwen3.8-max` · VISION `qwen3.8-max`. Latency is recorded **qualitatively** — the harness exposes no per-request millisecond hook, so this is explicitly *not* a benchmark.
- **Cost policy applied:** one shared probe per model instead of per-task model shopping; strong models reserved for design/review, fast/cheap models for docs and bulk work; usage tracked in `docs/ai-usage-log.md`.
- **A documented AI failure, kept in the record.** The first design dispatch of the round **wrote no files at all** and had to be retried once (`docs/ai-usage-log.md`: "3 (1 retry)"). Nothing about the pipeline assumes agent output is trustworthy: review + program Solver + human gates are what close the loop.
- **Anti-overengineering pass (`architecture.md` §13).** A* is *not* designed (BFS only until profiling shows a real state-space wall); no entity-component system, no animation state machine, no command-pattern Undo, no middleware event bus, no monorepo. Rule adopted: if a proposal introduces a concept not already in the spec, the burden is on it to name the **measured** problem it solves.
- **Layout constraints computed, not estimated (`ui-ux.md` §2.3).** Cell-size table across 320/360/390/414 px viewports produced hard rules: target ≥ 56 px, hard target ≥ 44 px, absolute floor 40 px → **grids authored ≤ 7 × 7**, 9 × 9+ rejected on mobile portrait. Derived gutter/radius formulas, opaque board plate, DPR capped at 2. Also measured: greyscale contrast **14.04:1** between phase grounds; art-palette figures used directly on an ivory cell would fail (1.59:1 / 1.50:1), so deeper figure shades are derived per phase — prompt and delivered art unchanged.

### V0.3 — the review round caught the studio's own docs (2026-10-14)

The second real iteration happened **between documents**. The Reviewer (REVIEW_MODEL, read-only) ran a cross-agent audit of the V0.2 doc set (**RV-001**) and the findings, by severity:

| Finding | What was wrong | How it was resolved |
|---|---|---|
| **B-1 (blocker)** | `ui-ux.md` V0.1 banned rendering phase-inactive objects ("never render ghost walls") while ADR-0006 made other-phase walls *permanent* blockers — so a refusal on an empty-looking tile would read as **broken input**, poisoning the game whose tutorial *is* its refusals | **ADR-0007**: other-phase walls render as a low-emphasis but clearly visible **wall echo**. Presentation layer only — legality, flip, `applyMove`, determinism untouched. Binding visual contract (tokens, ≥ 3:1 contrast, subordination, CVD-safe by value separation) added to `ui-ux.md` §3.1a under task UA-002, with measured values (echo A 3.98:1 / B 3.47:1; B `obj.wall` re-tuned 3.90 → 5.56:1 to open a legal value band) |
| **OQ4** | Grid-size cap was unconfirmed between schema (3–10) and layout contract | **Closed at authored ≤ 7 × 7**; `level-design.md` §1 schema now `width`/`height` int **3–7**; **8 × 8 only with explicit Orchestrator approval** under R-T5; 9 × 9+ rejected on mobile portrait |
| **Architecture gaps** | step-6 post-flip check covered only walls; win-condition timing ambiguous; `par` not in the schema; portal/door trigger semantics not pinned for `hashState` | V0.3: post-flip solidity covers **walls and closed doors**; win = standing on goal after full resolution, **any phase** (step 7); **`par` required in `LevelDef`** (int ≥ 1, generator-stamped from Solver `shortestSolution`, never a fail condition; HUD display is a separate open question, ui-ux OQ1, pending Game Designer sign-off); `doorsOpen`/`switchesOn`/portal canonical-by-construction semantics pinned (architecture-0001 addendum); A* wording unified to "BFS until profiled" |
| **M-5a / M-5b / LOW-5 / LOW-6** | Restart confirm dialog vs. one-tap rule; par shown in HUD vs. schema intent; 60 ms cross-fade vs. hop timing; missing `icon_back` asset row | All resolved in `ui-ux.md` V0.3 (dialog deleted; par removed from HUD pending sign-off; Variant CL timing added; `icon_back` RESERVED) |
| **M-1 / M-4 / LOW-4** | Docs-github drift: roster still described a retired 9-agent chart and omitted the Reviewer; playtest-log still tested the **superseded** wall-suppression rule ("no-cover rule", "wall appears/disappears"); pipeline §5 still said "vision-capable model, TBD" and mapped FAST to the wrong model | Reconciliation pass (task **DG-002**): `agent-roster.md` V0.2 rewritten to the actual 10 agents in `.opencode/agents/**` + AGENTS.md §4; `playtest-log.md` V0.2 §5 replaced with the locked cases (illegal move ⇒ **identical state**, `moveCount` unchanged; `isLegalMove ⟺ applyMove ≢ s` property; step-6 revert **discards switch/portal side effects**; refused move must be visually explained per ADR-0007); `ai-native-pipeline.md` V0.2 §5 now delegates routing to `ai-model-matrix.md` as the single source of truth |

**Honest gap, same round — closed:** RV-001's fixes landed in the owning docs' change logs and ADR-0007 before `docs/iteration-log.md` had the matching **ITER-0004** entry; the gap was flagged in the return contract rather than quietly skipped, and **ITER-0004 was subsequently filed** (together with **ITER-0005**, below). The audit trail is continuous now: iteration log ↔ per-doc changelogs ↔ ADRs.

### V0.3 → V0.4: the second real rule correction — GATE C, a human reverses a locked rule (2026-10-14)

The most valuable evidence in the whole process so far, and it is different in kind from the first two corrections: nothing here was a *mistake*. A correct, deterministic, reviewed rule had a **documented strategic consequence** (OQ-1) that no agent was allowed to fix silently — it was escalated to the human, who decided.

| Step | Content |
|---|---|
| **Original hypothesis (V0.2–V0.3, ADR-0006)** | Two-condition legality: current-phase entry solidity **and** no standing on a wall after the flip. The **union property** was accepted as the price of determinism; genuine route dynamism was delegated to doors M1 (L21), portals M2 (L36), switches M3. |
| **Observed problem** | Union property ⇒ every M0 wall is a permanent obstacle with phase-skinned visibility. In L1–L20 — 40% of the game, containing the hook and the first Aha (L3–L5) — the flip changed **no legal move**: a static maze. ADR-0007's wall echo made refusals comprehensible and resolved nothing mechanical (recorded honestly in that ADR's consequences). Documented as **OQ-1 at lock time**, not discovered at playtest. |
| **Decision path** | Escalated to the user as **GATE C** with options: A = keep ADR-0006; B = entry-only phase solidity; C = hybrids (standing check for doors only / one "grace step" / entry-only in tutorial levels only). **C rejected**: every hybrid re-creates two rule paths for one object class — the exact failure ADR-0006 was written to eliminate. **The human chose Option B on 2026-10-14.** Locked as **ADR-0008** (8 clauses). |
| **Change (V0.4)** | Legality judged **only at entry, only against the current phase**; illegal ⇒ atomic refusal (no movement, no flip, state identical); **standing inside a flipped-in wall is legal** — never crushed / pushed / relocated; exit from an embedded tile uses the same entry rule; doors share wall semantics; portals trigger on entry exactly once, never chained; win = standing on the goal after full resolution, **any phase**, with the goal a validated non-wall in both phases; corollary — **parity-dependent entry**: a Phase-B wall is enterable exactly during Phase-A steps, so routes depend on the parity of the move count and **M0 walls genuinely open and close routes from L1**. |
| **What survived** | Everything ADR-0006 existed to protect: one rule path (a single evaluation point — entry), illegal = identity, no suppression/crush/push (their rejections remain in force), fully determined phase after *n* moves, one `applyMove` shared by Gameplay and Solver, `hashState` + finiteness contract. ADR-0006 is marked **partially superseded**, not deleted; ADR-0007 is **revised** (echo semantics; R-E1…R-E8 rendering contract unchanged). |
| **Evidence** | GATE C human decision (2026-10-14); case analysis; the OQ-1 record in `level-design.md` §0. Empirical playtest evidence: **none yet — ADR-0008 ships with a mandatory Stage-2 verification gate** ((a) parity discovered without text by L3–L5, (b) embedded states read as "safe — walk out", (c) parity planning reads as depth, not chaos/memory test). If data contradicts: re-escalate with the evidence, never silently revert. |
| **Costs carried** | A new state class — the **embedded player** — that the renderer must show readably (`ui-ux.md` V0.4: echo flipped solid → **hollow = currently passable**, now also carrying *timing* information; new **R-C13** contract); embedded positions as ordinary Solver nodes; extended dead-state rejection; **all pre-ADR-0008 Solver results void** (SOLVER-001 must re-prove every level and re-derive difficulty and `par`); `main` merge held until RV-002 review. |
| **Result** | **OQ-1 resolved at the rule level.** Rule locked in `game-design.md` V0.4 §3.1; `architecture.md` V0.4 (`applyMove` **7 → 6 steps**, post-flip rollback deleted); `level-design.md` V0.3 (teaching ladder rebuilt around parity routing). Atomic commits `e9b9e9d` (design) · `c2f878c` (architecture) · `e69d1bf` (ui) · `a4548a7` (status) · merge `7bd6963` on `develop`; iteration entry **ITER-0005**. |

**Three further corrections of this same day, recorded as honestly as the rule change:**

- **A planning judgment that was simply wrong:** Stage 2 was first logged as **fully blocked on art**. Wrong — walls, echoes, phase feedback and the player's in-wall state are all **program-drawn vector tokens** (`ui-ux.md` §9.1); core rules, the Solver and level data depend on **no bitmap asset**. Coding started the same day (toolchain scaffold commits `5551bae`/`41999be`; GAME-001 core code already on disk). Only final visual polish and the §3.3 screenshot readability review still wait on GATE A. Dependency claims are now checked against "does this feature read a file from `/assets`?" rather than assumed.
- **A real AI failure — the second of its class:** the first **LV-001** dispatch (level schema + L1–L5 + validator) **returned an empty report and wrote nothing to disk** — `src/core/level`, `src/levels`, `scripts` verified absent via `find`. Same failure as ITER-0003's zero-file design dispatch, now twice. Handling: nobody rewrote another agent's work; LV-001 was **re-dispatched as LV-001R** with the cross-agent export names (`Coord`, `DoorDef`, `SwitchDef`, `PortalDef`, `Level`, `LevelSchema`, `validateLevel`) **frozen verbatim in the dispatch contract**, because GAME-001 had already written `import type { PortalDef } from "@/core/level"`. Flow lesson generalised into the studio rule: **an agent's "done" is not a delivery until the Orchestrator can see it on disk** (`find`/`ls` + typecheck before acceptance).
- **ASSET GATE re-scoped by human decision (GATE A):** the user authorised **their own Codex generation channel** for final competition art (prompt packs: commits `06ac909`/`6976506`). No Studio agent generates art — AGENTS.md §8 stays intact; agents supply prompts + acceptance criteria only. Status moved `WAITING_FOR_USER_ASSETS` → **`GENERATING (user-authorized)`**; P0 set = `echo_spirit_a/b` · `bg_phase_a/b` · `goal`; manifest rows flip to `DELIVERED` only on Agent 5 validation.

**Why this matters as evidence:** the loop fired **three times before code existed** — once on a wrong rule (V0.1 → V0.2), once on docs contradicting the right rule (V0.2 → V0.3), and once on a *correct but strategically dead-ended* rule that AI analysed, the studio refused to patch silently, and **the human reversed at an explicit gate** (V0.3 → V0.4). All three failures and all three fixes are in the record, plus two same-class agent delivery failures and one wrong blocking judgment, none smoothed over.

### Process incident recorded honestly (same day, Stage 0)

The working tree had **every tracked doc deleted** at the start of the session. All tracked files were recovered **non-destructively from `HEAD`** (`git checkout` of tracked paths; nothing rewritten, no history altered), and the genuinely new Stage-0 files were then authored on top. No documentation content was lost, and no commit history was rewritten. This is logged as ITER-0003(a) because "the docs survived" is only meaningful as an auditable event.

---

## 2. Prototype

**IN FLIGHT as of 2026-10-14 (not yet playable).**

Planned, per ITER-0001/0002 decisions: **5 levels only**, no lobby, no 50 levels, no meta systems, entered directly at L1 (`launch → L1 → play → win → next`). It was first gated on art — that gate was **re-scoped the same day** (see the correction in §1):

```
GATE A (final art)  : GENERATING (user-authorized Codex channel; P0 = echo_spirit_a/b · bg_phase_a/b · goal)
Stage 2 (prototype) : IN FLIGHT — code is NOT blocked on art
                      toolchain scaffold verified (typecheck clean · vite build ok · vitest runs, no test files yet)
                      GAME-001 pure-TS core rules on disk (src/core/state/**, src/core/rules/**)
                      LV-001R level pipeline re-dispatched (first run produced zero files — see §1)
```

P0 art blockers from `docs/assets/asset-manifest.md`: A-03 Echo Spirit, A-04 Phase A background, A-05 Phase B background, A-06 goal — generated through the user's authorised Codex channel; manifest rows flip to `DELIVERED` only on Agent 5 validation. The 7 request docs (A-01…A-07, minimum 11 files) are complete and gate-ready after the field audit.

Acceptance criteria for Stage 2 (to be filled with evidence when it exists): rules engine `applyMove` implemented once and shared by gameplay + Solver (ADR-0008 entry-only rule) · illegal move returns structurally identical state (test) · import-boundary Vitest gate green · 5 levels accepted by the Solver **under ADR-0008** · one real playtest session recording ADR-0008's verification hypotheses (parity discovery without text, embedded-state readability, parity-as-depth).

---

## 3. Playtest

**PENDING — not yet run. No sessions, no participants, no numbers.** `docs/playtest-log.md` §6 currently reads `— | awaiting Stage 2 prototype` and §7 is empty; that is the accurate state and this file mirrors it rather than improving on it.

Metric definitions are locked and ready (so the instrument exists before the measurement):

| Metric | Definition |
|---|---|
| Understand Time | seconds before the first *intentional* move |
| First Win Time | seconds to first completion |
| Mistake Rate | wrong moves per level |
| Retry Rate | re-attempts after a stuck state |
| Hint Dependence | hints requested per level |
| Aha Point | level index where the player visibly "gets it" |
| Continue Intent | does the player seek the next level unprompted |

The single decisive question: **after Level 5, does the player actively want to continue?** In the prototype **no "Next" prompt is shown** — we observe whether the player looks for Level 6 themselves. That is worth more than "rate this game 1–10."

Also to be tested: the four design assumptions in `game-design.md` §13 (A1 flip is understandable in 30 s; A2 two-phase walls create planning depth, not a memory test; A3 50 levels can be generated and Solver-verified automatically; A4 readability holds in both worlds on mobile).

---

## 4. Problems

**Real problems found so far (all pre-playtest, all documented in `docs/iteration-log.md` / ADRs):**

| # | Problem | How it was found | Status |
|---|---|---|---|
| 1 | "Gravity Stack" would land in a crowded sub-genre | Research sweep of 2026 Gravity products | Resolved → direction changed to Phase Shift (ITER-0001) |
| 2 | V0.1 wall-suppression rule creates two rule paths for one object | Stage-1 architecture/design review | Resolved → illegal-move lock, ADR-0006 + architecture-0001 (ITER-0003) |
| 3 | Union property: phase walls alone can never open a route — risk that L1–L20 feels static | Case analysis following the V0.2 lock, documented as OQ-1 at lock time; escalated to the user at **GATE C** | **RESOLVED 2026-10-14 — Option B (ADR-0008)**: entry-only phase solidity ⇒ parity-dependent entry; M0 walls are real route gates from L1. Stage-2 playtest verification + full Solver re-proof still owed (all pre-ADR-0008 results void) |
| 4 | Refused move could read as broken input rather than as information | Consequence analysis of the V0.2 lock | Open as a UI dependency (bump + phase visibly unchanged) |
| 5 | Art-palette colours fail ≥ 3:1 as board figures (1.59:1 / 1.50:1) | Measured during asset-audit | Resolved on paper → derived figure shades per phase, prompts untouched |
| 6 | First design dispatch produced zero files | Orchestrator integration check | Resolved → one retry; failure recorded in `ai-usage-log.md`. **Recurred** (row 10) |
| 7 | All tracked docs missing from the working tree | `git status` at session start | Resolved → non-destructive recovery from `HEAD` |
| 8 | Difficulty weights w1–w5 are a guess | Explicit in `level-difficulty.md` | **PENDING — cannot be fixed without playtest data** |
| 9 | **Second occurrence** of zero-output background agent: first LV-001 dispatch returned an empty report, `src/core/level` / `src/levels` / `scripts` verified absent via `find` | Orchestrator disk check before accepting the report | Resolved → re-dispatched as **LV-001R** with cross-agent export names (`Coord`/`DoorDef`/`SwitchDef`/`PortalDef`/`Level`/`LevelSchema`/`validateLevel`) frozen verbatim in the contract (GAME-001 already imported `PortalDef`). **Flow lesson: agent "completion" requires disk evidence** |
| 10 | Wrong blocking judgment: "Stage 2 fully blocked on art" | Re-analysis of `ui-ux.md` §9.1 — walls/echo/phase feedback/player-in-wall are program vector tokens; no core rule, Solver or level-data path reads a bitmap | Resolved same day → Stage 2 coding started; only final polish + §3.3 screenshot review remain behind GATE A |
| 11 | Submission docs + README asserted the withdrawn union property / 7-step order / `WAITING_FOR_USER_ASSETS` as current truth | Grep audit at DG-004 dispatch (`design-thinking.md` §6, `iteration-optimization.md` §1/§2/§4, README rules/status) | Resolved → this file + `design-thinking.md` + README synced to V0.4/ADR-0008/GATE C decided/GENERATING, with the superseded analysis kept as dated history (ITER-0005) |

**Problem categories that are still empty by design:** player-comprehension failures, Aha timing misses, mobile legibility complaints, difficulty-curve complaints, dead-end frustrations. None have been observed, because no one has played the game yet.

---

## 5. AI Diagnosis

**PENDING — no playtest data has been analyzed.**

The diagnosis chain is built and specified, just not yet exercised:

```
raw telemetry / session notes
  → AI diagnosis (REASONING / REVIEW model role)
  → parameter change (level data or difficulty weights)
  → program Solver re-validation (accept / reject)
  → retest
```

Hard invariant: the model may *propose* why a level is hard; the Solver decides whether a level is solvable and how hard it measures. LLM opinion never replaces the program.

The diagnoses that *did* happen are process-level, not gameplay-level — three of them: the review agent judged the V0.1 suppression rule a determinism threat (→ ADR-0006, V0.2); the Reviewer's cross-doc round judged the V0.2 doc set self-contradictory (→ ADR-0007, V0.3); and the consequence analysis of the V0.2 lock itself surfaced **OQ-1**, which no agent was allowed to patch — the studio **escalated**, the AI prepared the option set and the rejection reasons, and the **human decided** the rule reversal at GATE C (→ ADR-0008, V0.4). All recorded above in §1.

---

## 6. Changes

| Trigger | Change | Where recorded |
|---|---|---|
| Research: crowded Gravity/Arrow categories | Lock Phase Shift as primary; Chain Escape as competitor concept; Gravity Relay to reserve | ADR-0001, ITER-0001 |
| Competition criteria (fun, not content volume) | Prototype scope cut to **5 levels**, no lobby, no meta | ITER-0001 Next Decision |
| Readability risk of a two-world presentation | Priority order `Fun > Readable > Expandable > Pretty`; any VFX hiding cell state is deleted; asset batch kept minimal | AGENTS.md §1, game-design.md §7, ITER-0002 |
| Two-path ambiguity in the suppression rule | Illegal move refused atomically; suppression deleted; 7-step `applyMove` *(V0.2–V0.3 order; 6 steps since V0.4)*; hash + finiteness contract | ADR-0006, architecture-0001, game-design.md V0.2 §3.1, architecture.md V0.2 §6 |
| Same lock | Teaching ladder rebuilt so **refusal is the tutorial** (L3 = first "no", L5 = Aha #1) | level-design.md §2–§3 |
| Model capability unknowns | Routing set by live probe, not naming; roles abstracted | ai-model-matrix.md, AGENTS.md §11 |
| Overengineering pressure | Explicit "deliberately NOT designed" list with revisit triggers | architecture.md §13 |
| Asset-readability conflict | Field audit of all 7 requests (added missing `Asset ID` / `Acceptance criteria`; corrected sizes/filenames against the authoritative request docs; 21 prompts byte-identical, verified programmatically) | asset-manifest.md |
| RV-001 **B-1**: refusals had no visible cause | **Wall echo** — other-phase walls rendered low-emphasis (≥ 3:1, strictly subordinate); presentation-only, core rule untouched | ADR-0007, ui-ux.md V0.3 §3.1a (UA-002) |
| RV-001 **OQ4**: schema vs. layout grid conflict | Authored grids **≤ 7 × 7** enforced in schema (`width`/`height` int 3–7); 8 × 8 only with Orchestrator approval; `par` required in `LevelDef` | level-design.md §1, architecture.md V0.3 §5, ui-ux.md §12 |
| RV-001 **M-1/M-4/LOW-4**: docs drifted from the locked rules | Roster rewritten to the real 10-agent org; playtest critical cases replaced with V0.2/V0.3 locked cases; pipeline routing section delegates to the model matrix | agent-roster.md V0.2, playtest-log.md V0.2, ai-native-pipeline.md V0.2 (DG-002) |
| **OQ-1** (V0.4): the locked union property made M0-only levels a static maze — a strategic dead end no agent may patch silently | **GATE C → Option B**: legality at entry against the current phase only; standing inside a flipped-in wall legal; never crush/push/relocate; **parity-dependent entry**; partial supersession of ADR-0006 + revision of ADR-0007, banners added; docs rebaselined (`game-design.md` V0.4, `architecture.md` V0.4 **7→6 steps**, `ui-ux.md` V0.4 hollow echo + **R-C13**, `level-design.md` V0.3 parity ladder); **all pre-ADR-0008 solver results void** | **ADR-0008**, ITER-0005, commits `e9b9e9d`/`c2f878c`/`e69d1bf`/`a4548a7`, merge `7bd6963` |
| Prototype was assumed blocked on art — **wrong** | Judgment corrected (vector-drawn board state per `ui-ux.md` §9.1); toolchain scaffolded and verified (`phaser 3.90.0` pinned explicitly because npm `latest` = 4.2.1); Stage 2 dispatches issued the same day | project-status, ITER-0005, commits `5551bae`/`41999be` |
| Zero-output background agent, **2nd occurrence** (LV-001 empty report, nothing on disk per `find`) | Re-dispatch LV-001R with verbatim-frozen cross-agent export names; studio rule: **agent completion = disk evidence verified by the Orchestrator**; GATE A moved to user-authorized Codex generation (`GENERATING`), prompt packs delivered | ITER-0003 + ITER-0005, ai-usage-log.md, Codex prompt commits `06ac909`/`6976506` |
| Submission docs + README still stated the withdrawn union property / 7-step order / old gate status | DG-004 continuity pass: rewritten as dated history with pointers to ADR-0008; status synced to V0.4 / GATE C decided / GENERATING | ITER-0005, `docs/submission/*`, README |

**Gameplay-impacting commits and their documentation duty:** every commit that changes a rule must also change `docs/game-design.md` or `docs/iteration-log.md` (AGENTS.md §6). Every rule-level change above has an ADR and an iteration entry (ADRs 0001–0008; ITER-0001…0005).

---

## 7. Metrics

**Nothing has been measured on a player yet. The table below is the instrument, deliberately left empty.**

| Metric | Target / threshold | Baseline V0.1 | V0.2 | V0.3+ | Instrument |
|---|---|---|---|---|---|
| Understand Time | ≤ 30 s to first intentional move | not run | not run | — | manual session |
| First Win Time | ≤ 60 s (L1) | not run | not run | — | manual session |
| Aha Point | L3–L5 | not run | not run | — | session observation |
| Mistake Rate | falls across L1–L10 without feeling punished | not run | not run | — | telemetry + notes |
| Retry Rate | voluntary re-attempts, not abandonment | not run | not run | — | telemetry |
| Hint Dependence | ≈ 0 in L1–L10 | not run | not run | — | session observation |
| Continue Intent | player seeks L6 unprompted | not run | not run | — | session, no "Next" prompt |
| Solver accept-rate | ≥ target once candidate generation runs | n/a | n/a | — | `scripts/validate-levels` |
| Dead-end ratio | 0 for L1–L20 | n/a | n/a | — | Solver enumeration |
| Cell size / contrast | ≥ 44 px hard target; ≥ 3:1 figure contrast; phase grounds measured 14.04:1 | — | **measured (design-time)** | — | `ui-ux.md` §2.3, §4.4 |
| Level `D` curve | sawtooth with new-mechanic dips of 2–3 pts | — | weights provisional, uncalibrated | — | `level-difficulty.md` |

Two notes on metric integrity:
- The 14.04:1 and the 1.59:1 / 1.50:1 figures are **design-time computed values**, not playtest data; they are the only numbers in this section that are real.
- Latency figures for model routing are **qualitative** by necessity (no per-request timing hook in the harness); the doc says so explicitly and must be re-tested if a model starts failing real tasks.

---

## 8. Final Result

**PENDING — there is no final result yet, and pretending otherwise would invalidate the submission's core claim.**

Current honest status line (mirrors README and `docs/iteration-log.md`):

```
Stage 0  Design lock            DONE   (V0.4 baseline: game-design V0.4, architecture V0.4, level-design V0.3, ui-ux V0.4, ADRs 0001–0008 + architecture-0001; RV-001 reconciled; GATE C decided → Option B; RV-002 pending before main merge)
Stage 1  Asset requirements     DONE   (requests A-01…A-07 complete; Codex prompt packs delivered `06ac909`/`6976506`)
         ── human gate ──        GENERATING (GATE A via the user's own authorised Codex channel; P0 = echo_spirit_a/b · bg_phase_a/b · goal)
Stage 2  Core prototype (5 lvl) IN FLIGHT — core rules code on disk (GAME-001); LV-001R re-dispatched after a zero-file first run; NOT blocked on art
Stage 3  Playtest               NOT RUN (ADR-0008 carries a mandatory Stage-2 verification gate)
Stage 4  50 levels + Solver proof NOT STARTED — all pre-ADR-0008 solver results void; SOLVER-001 queued
Stage 5  Polish / final build   NOT STARTED
```

What the project can already show as evidence of AI-native working — with files, not adjectives:

- a direction that was **changed by research** rather than defended (V0 → V0.1);
- a core rule that was **corrected by review before code existed**, with the rejected alternative kept in the record (V0.1 → V0.2);
- a second core-rule change made **by the human at an explicit gate (GATE C)**, after AI analysis documented the strategic dead end (OQ-1) inside the previously *correct* rule and the studio refused to patch it silently — the reversal is ADR'd, the old ADR is marked partially superseded rather than deleted, and **all solver results computed under the old rule were declared void instead of reused** (V0.3 → V0.4, ADR-0008);
- **model routing decided by a measured probe**, including the discovery that only one available model has vision;
- a verified **toolchain scaffold** with dependency pins that had to be made explicit (npm's `latest` Phaser is 4.x; the stack pins 3.90.0);
- **two explicit, documented AI delivery failures of the same class** (zero-file background agents) and the process rule learned from them: an agent's "done" is not a delivery until it is visible on disk — plus one **wrong blocking judgment ("Stage 2 is blocked on art") corrected the same day it was recorded**;
- a locked verification invariant — LLM creates, the program Solver proves, the human decides — plus a hard "deliberately not built" list to prove scope discipline;
- a **human ASSET GATE** that never let an agent fake art: final art comes from the user's own authorised generation channel, with agents supplying prompts and acceptance criteria only.

What remains is the part the competition actually asks about: whether real people find it fun, and whether the level pipeline can produce 50 Solver-proven levels. Until then, the claim is "the machine is built and calibrated", not "the game is good."

---

*This file is the "AI collaboration & iteration process" deliverable. Re-version it whenever `docs/iteration-log.md` gains an entry; never rewrite an earlier entry to make it look smoother.*
