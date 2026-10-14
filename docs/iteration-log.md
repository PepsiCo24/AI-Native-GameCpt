# Iteration Log

> Owner: **Agent 8 — Documentation + GitHub**
> Every entry: `Date / Version / Hypothesis / Observed Problem / AI Analysis / Change / Test / Result / Next Decision`

This is the primary evidence source for the "AI collaboration & iteration process" part of the submission.

---

## ITER-0001 — Project direction selected (Phase Shift over Gravity Stack)

- **Date:** 2026-10-14
- **Version:** V0.1
- **Hypothesis:** A novel "board changes because the player acts" mechanic beats re-skinning a hot 2026 category (Arrow / Screw / Sort / Gravity).
- **Observed Problem (from research report `doc/`):** 2026 puzzle market is crowded. Arrow Escape, Sort, Screw, Block, Pixel Flow all have multiple global top-download products and rapid clone waves. A plain "Gravity Stack" would land in an already dense Gravity sub-genre.
- **AI Analysis:** Compared Phase Shift / Chain Escape / Gravity Relay across 7 axes (understandability, decision depth, market differentiation, 50-level scalability, H5 cost, AI-generatability, juice). Phase Shift scored highest on differentiation + scalability + AI-generatability.
- **Change:** Lock **Phase Shift: Echo Grid / 双相棋盘：昼夜回响** as the primary prototype. Chain Escape held as a competitor concept; Gravity Relay dropped to reserve.
- **Test:** Design-level review against competition criteria (50 levels, easy entry, AI-native).
- **Result:** Core rule locked: *one move ⇒ one phase flip; phase flip is bound to movement, never a button.*
- **Next Decision:** Build only a **5-level** prototype first. Do not build 50 levels or a lobby before the core loop is proven fun.

---

## ITER-0002 — Stage 0/1 outputs & asset gate

- **Date:** 2026-10-14
- **Version:** V0.1
- **Hypothesis:** Starting asset production before the core loop is proven wastes effort and risks an art direction that doesn't fit readability constraints.
- **Observed Problem:** The competition rewards "fun", not art complexity; and the two-phase world must not hurt board legibility.
- **AI Analysis:** A minimal first batch (cover, logo, protagonist, two backgrounds, goal/portal, basic UI) is enough to build a readable prototype. Everything else is deferred.
- **Change:** Produced Game Design V0.1, Architecture V0.1, AI-native pipeline, difficulty model, and the first batch of `asset-request-XX.md` files with image prompts.
- **Test:** — (awaiting user assets)
- **Result:** **WAITING_FOR_USER_ASSETS.** All work depending on final art is paused.
- **Next Decision:** On asset delivery → Art Agent checks/normalizes → Stage 2 core prototype (5 levels), no more.

---

## ITER-0003 — Stage 0 hardening: doc recovery, measured model routing, illegal-move lock, parallel design round

- **Date:** 2026-10-14
- **Version:** V0.2
- **Hypothesis:** The design is only worth trusting once (a) the documentation trail is provably intact, (b) agent model roles are chosen from **measured** capability instead of model names, and (c) the last ambiguous core-rule case — a phase wall arriving under the player — is resolved by **one** deterministic rule. A parallel design round (design / architecture / UI / levels) can produce that without two agents touching the same file.
- **Observed Problem:**
  1. **Documentation trail was broken at session start:** every tracked file under `docs/` was **deleted from the working tree** — uncommitted loss of the entire Stage 0 output.
  2. **Model capability was assumed, not known.** Roles had been written from provider metadata and naming (e.g. "a multimodal model, TBD" in `docs/ai-native-pipeline.md` §5); nothing had ever verified tool calling or image input on this endpoint.
  3. **V0.1's wall-suppression rule was a latent determinism bug:** "the player is never covered; incoming walls are suppressed on the player's tile" gives **one object two rule paths**, so the player model and the Solver can disagree about the same board, and the post-flip board no longer matches the level data.
  4. **No level authoring contract and no UI/legibility numbers** existed yet — the 50-level plan was not yet buildable or testable.
- **AI Analysis:**
  - *Recovery:* because nothing had been committed, `HEAD` still held every deleted file; recovery was possible **non-destructively** by restoring tracked paths from `HEAD`. No commit history was rewritten and no content was lost. Lesson logged: uncommitted work is not safe work — Stage 0 output must be committed in atomic chunks, and the Orchestrator owns merge/push.
  - *Routing:* five candidate models (`kimi-k3`, `glm-5.3`, `qwen3.8-max`, `qwen3.8-flash`, `deepseek-v4.1-flash`) each ran an **identical five-part probe** as isolated child sessions: text reasoning, a TypeScript `clamp`, fence-free strict JSON, tool calling (`write` + `shell`), and vision (read a generated 64×64 PNG: four colour quadrants + white centre square). All five passed text/coding/JSON/tools and returned shell stdout `tool-ok2`; **no timeouts**. **Only `qwen3.8-max` accepted image input** and named the colours correctly (`TL=red, TR=green, BL=blue, BR=yellow`, centre `white square`); the other four rejected image input, confirming the provider config. Latency was recorded **qualitatively** — the harness exposes no per-request timing hook, so this is explicitly not a benchmark.
  - *Rule:* the suppression alternative was rejected on case analysis. The replacement — refuse the move entirely — yields the **union property**: entering a wall tile from its own phase is blocked by solidity, entering from the other phase is blocked by the post-flip standing check, so a tile that is a wall in *either* phase is **never** a legal destination. One rule, one path, shared by Gameplay and Solver via a single `applyMove`.
  - *Cost/failure honesty:* the design round is recorded as **3 runs (1 retry)** — the first game-designer dispatch **wrote no files at all** and was re-run once (`docs/ai-usage-log.md`). Recorded rather than smoothed over.
- **Change:**
  1. **Recovered** all tracked docs (and README) non-destructively from `HEAD`; untracked Stage-0 files were left in place.
  2. **Model routing locked** in `docs/ai-model-matrix.md`: REASONING=`kimi-k3`, CODING=`deepseek-v4.1-flash`, FAST=`qwen3.8-flash`, REVIEW=`qwen3.8-max`, VISION=`qwen3.8-max` (sole vision-capable model). Roles stay abstract; a model name is config, not architecture. Cost policy: screen with the fast model, escalate to reasoning/review; never ask five strong models one question.
  3. **Parallel design round** (single-writer-per-file, no concurrent edits to `GameState`/schema/rules) produced: `docs/game-design.md` **V0.2**, `docs/architecture.md` **V0.2**, new `docs/level-design.md` (level JSON schema field-by-field, teaching ladder L1–L10, explicit Aha-#1 step chain, no-unrecoverable-state rule, per-block intent, difficulty-dip rule), new `docs/ui-ux.md` V0.1 (screen inventory = 1 screen + 1 dialog; cell-size floor table across 320/360/390/414 px; grids authored **≤ 7×7**, 9×9+ rejected on mobile portrait; phase contrast measured **14.04:1**; art palette shown to fail ≥3:1 as board figures → derived per-phase figure shades without touching any prompt), plus **ADR-0006** (`decisions/0006-illegal-move-not-wall-suppression.md`) and **ADR-architecture-0001** (`decisions/architecture-0001-core-solver-shared-rules.md`).
  4. **Illegal-move rule LOCKED (supersedes wall suppression):** a move is illegal if the destination is solid in the current phase **or** the player would stand on a wall in the new phase after the flip; an illegal move is refused **atomically — no movement and NO phase flip** (the flip is never consumed). Rejected alternatives recorded: suppression, crush = death, push/slide, "allow standing but block passing". Architecture side gained the 7-step `applyMove` order (revert-without-flip at the player-on-wall check), the `hashState` field contract + BFS finiteness proof, `isLegalMove` defined as derived (property-pinned), the automated import-boundary Vitest gate (§12.1) and the anti-overengineering list (§13: BFS only, no ECS, no animation state machine, snapshot Undo).
  5. **ASSET GATE presented:** `docs/assets/asset-request-01…07` (cover, logo, Echo Spirit, Phase A/B backgrounds, goal + portals, UI kit) with CN/EN/negative prompts; field audit added the missing `Asset ID` and `Acceptance criteria` to all seven and corrected manifest sizes/filenames against the authoritative request docs (all 21 prompts verified **byte-identical** to pre-audit text). Minimum deliverable: 11 files; P0 blockers = A-03, A-04, A-05, A-06 goal. Copy-paste sheet: `docs/assets/first-batch-prompts.md`.
  6. **Submission skeletons started:** `docs/submission/design-thinking.md` and `docs/submission/iteration-optimization.md`, written so that every unrun stage reads **"PENDING — not yet run"** instead of inventing data.
- **Test:** Documentation-only iteration — no gameplay code exists yet. Verification performed: `git status` / `git checkout -- <tracked docs>` for recovery integrity; live 5-model API probe (isolated child sessions, writes confined to the approved temp dir, never the repo) for routing; rule-level **case analysis** for the union property; programmatic byte-comparison of all 21 asset prompts; arithmetic derivation of the cell-size / contrast tables in `ui-ux.md`. **Playtest-based validation of the new rule: none yet — deliberately scheduled for Stage 2.**
- **Result:** Core rule is now single-path and deterministic end to end (design + architecture agree, one `applyMove`, one truth source). Stage 0 (design lock) and Stage 1 (asset requirements) are complete: `game-design.md` V0.2 · `architecture.md` V0.2 · `level-design.md` · `ui-ux.md` V0.1 · `ai-model-matrix.md` · `ai-usage-log.md` · ADRs 0001–0006 + architecture-0001. **Status: `WAITING_FOR_USER_ASSETS`.** Two open risks carried forward, not closed: **OQ-1** — under the union property, plain phase walls cannot open or close routes, so L1–L20 (M0 only) may feel static; mitigations are pre-documented but require playtest data **and** a new ADR. And a refused move must be rendered unmistakably (bump + phase visibly unchanged) or it reads as broken input — a UI dependency.
- **Next Decision:** **Human gate holds.** No agent generates final art and no dependent work proceeds. On asset delivery: Art Director validates → normalises → flips manifest rows to `DELIVERED` → Stage 2 core prototype of **exactly 5 levels** (no 50, no lobby), with the illegal-move rule covered by unit tests (illegal ⇒ identical state, flip not consumed) and the import-boundary Vitest gate green. Playtest Analyst confirms ADR-0006 empirically at Stage 2/3 and answers **OQ-1** with data. Difficulty weights stay provisional until real playtest data exists.

---

## ITER-0004 — RV-001 doc review and V0.3 reconciliation: ghost-wall blocker, schema/semantics fixes

- **Date:** 2026-10-14
- **Version:** V0.3
- **Hypothesis:** The Stage-0 docs (V0.2 output of ITER-0003) were internally consistent and ready to commit.
- **Observed Problem:** An **independent read-only Reviewer (RV-001, `qwen3.8-max` = REVIEW model per the measured matrix)** reviewed the whole doc set and returned **1 BLOCKER, 5 HIGH, 8 MEDIUM** — the docs contradicted each other and, in one case, the locked rules:
  1. **B-1 (BLOCKER) — two LOCKED docs contradicted each other:** `ui-ux.md` V0.1 §3.1 forbade rendering other-phase "ghost walls" (inactive objects shown as **absent**), while `level-design.md`'s L3–L5 teaching **relied on seeing them**. Consequence under ADR-0006's union property: a phase-B wall on an empty-looking phase-A board is an invisible permanent obstacle — the player taps, the move is refused with no movement and no flip, and the refusal reads as **broken input**. On the tutorial levels.
  2. **`par` missing from `LevelDef`** — difficulty grading and the restart loop referenced it, the schema did not define it.
  3. **Grid-size contradiction (OQ4):** schema said **3–10**, `ui-ux.md` R-L2 capped authored grids at **≤ 7×7**.
  4. **Door-closes-on-player case undefined:** the post-flip solidity check (architecture step 6) covered only walls, not closed doors.
  5. **Win condition ambiguous:** whether standing on the goal **after** resolution, and in which phase, was unstated.
  6. **Stale vocabulary (M-1 / M-4 + MEDIUM set):** `agent-roster.md`, `ai-native-pipeline.md` §5 routing and `playtest-log.md` critical cases still described the pre-V0.2 rule world and an out-of-date agent org; `ui-ux.md` also carried a restart confirm dialog (M-5a) and HUD par (M-5b) conflicting with locked rules.
- **AI Analysis:** RV-001's own verdict: **strong evidence culture, no substantive rework needed** — but B-1 was not a wording nit: the renderer would follow ui-ux, the designer would teach with ghost walls, and playtest would score the mismatch as broken input. A guaranteed **Stage-2 implementation collision** if committed as-is. Fix = bounded reconciliation round, not a rewrite.
- **Change:** bounded reconciliation — **max 3 concurrent writers**, single-writer-per-file, no core-rule edits (ADR-0002/0004/0006 and `applyMove` untouched):
  1. **Game Designer** — `game-design.md` **V0.3**: union-property note (§1, §5), win condition made unambiguous (**standing on the goal after full resolution wins, any phase**), Aha chain re-worded ADR-0006-accurate, grid cap moved to `level-design.md` citing ui-ux R-L2. Authored **ADR-0007** (`decisions/0007-other-phase-wall-echo.md`): other-phase walls **are** rendered during play as a low-emphasis "wall echo" — **presentation-only derived state, no legality/flip-timing/determinism change**, so the AGENTS.md §2 core-rule procedure is not triggered; accepted by Game Designer + UI/Art Director, **Orchestrator (human) sign-off at merge**.
  2. **Architect** — `architecture.md` **V0.3**: `par` a **required** `LevelDef` field (int ≥ 1, generator-stamped from Solver `shortestSolution`, **never a fail condition**); step-6 post-flip solidity extended to **walls + closed doors**; `doorsOpen` / `switchesOn` / portal canonical-by-construction `hashState` semantics pinned (architecture-0001 addendum); A* wording unified to **"BFS until profiled"**.
  3. **UI / Art Director** — `ui-ux.md` **V0.3** (UA-002): the ban is replaced by a binding **`wallEcho` contract R-E1…R-E8** — same wall silhouette (shape channel), strictly subordinate hierarchy, contrast **≥ 3:1**, no idle animation, no input interception, full solid at flip; echo tokens measured, phase-B `obj.wall` re-tuned to 5.56:1. Restart confirm dialog deleted, par removed from HUD pending sign-off, hop-timing variant added.
  4. **Docs + GitHub (DG-002)** — `agent-roster.md` **V0.2** rewritten to the real 10-agent org; `ai-native-pipeline.md` **V0.2** routing section delegates to the model matrix; `playtest-log.md` **V0.2** critical cases replaced with the V0.2/V0.3 locked rule set; submission docs gain the V0.3 markers (this entry's own late filing was flagged there as an honest gap rather than skipped).
- **Test:** Documentation-only iteration — **no code exists yet**. Verification = cross-read of the four reconciled docs against ADR-0006/ADR-0007 (echo is render state only; `applyMove` unchanged) and trace of every RV-001 finding to the owning doc's changelog row. No automated test possible or claimed.
- **Result:** **BLOCKER + all 5 HIGH resolved**; MEDIUM items folded into the same V0.3 passes; LOW items logged as backlog (`icon_back` asset row; HUD par display = ui-ux OQ1, pending Game Designer sign-off). The review gate has now fired **twice on paper before code existed** — once on a wrong rule (V0.1→V0.2), once on docs contradicting the right rule (V0.2→V0.3). Both failures and both fixes are in the record.
- **Next Decision:** Commit the **V0.3 doc baseline to `develop`** (atomic commits per file-owner; Orchestrator merges — no agent pushes). Then present two human gates to the user: **GATE A** — asset delivery (still `WAITING_FOR_USER_ASSETS`), and **GATE C** — the **OQ-1 core-rule escalation**: under ADR-0006's union property, M0-only levels remain **mechanically static** (ADR-0007 improves readability of refusals, resolves nothing); mitigations need a new ADR and playtest data. ADR-0007's human sign-off rides the same merge.

---

<!-- Template for future entries:

## ITER-XXXX — <title>
- Date:
- Version:
- Hypothesis:
- Observed Problem:
- AI Analysis:
- Change:
- Test:
- Result:
- Next Decision:
-->