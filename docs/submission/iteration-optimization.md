# Iteration & Optimization Process — Phase Shift: Echo Grid

> Owner: **Docs + GitHub**
> Date: 2026-10-14 · Doc version: **V0.2** (V0.1 skeleton → V0.2 after the RV-001 review round)
> Source of truth: `docs/iteration-log.md` (ITER-0001…0003; the V0.3 round is not yet filed there — flagged in §1 below), `docs/ai-usage-log.md`, `docs/decisions/*`, git history, per-document change logs (`game-design.md` §changelog, `architecture.md` §changelog, `ui-ux.md` §13, `level-design.md`), `docs/playtest-log.md`
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

### V0.1 → V0.2: the one real rule correction

This is the most valuable iteration we have so far, and it happened **on paper, before a line of gameplay code existed** — which is exactly the point of the process.

| Step | Content |
|---|---|
| **Original hypothesis (V0.1)** | "The player is never covered — an incoming wall is suppressed on the player's tile," telegraphed visually by keeping that tile clear. |
| **Observed problem** | One object gets **two rule paths**: a wall sometimes blocks, sometimes yields. Player model and Solver can disagree about the same board; post-flip board no longer matches level data; "walls that aren't always walls" weakens every mechanic stacked on top of them. The flip also stops being dangerous, which removes the planning pressure the whole game is built on. |
| **Change (V0.2)** | A move is legal only if the destination is clear in the current phase **and** the tile the player would stand on after the flip is not a wall in the new phase. An illegal move is refused **atomically: no movement and no phase flip** — the flip is a consequence of a legal move only and is never consumed. |
| **Evidence** | Case analysis producing the **union property** (a tile that is a wall in either phase is never a legal destination); consistency with ADR-0002 (flip bound to *legal* moves) and ADR-0004 (gameplay and Solver share one truth source). Architectural mirror in architecture-0001: single `applyMove`, fixed 7-step order, illegal = identity, derived `isLegalMove` pinned by a property test, `hashState` field list, finite BFS graph `w × h × 2 × 2^\|doors\| × 2^\|switches\|`. |
| **Result** | Rule locked in `game-design.md` V0.2 §3.1 and `architecture.md` V0.2 §6.1–§6.3. The teaching ladder was **rebuilt around refusal-as-tutorial** (`level-design.md` §2–§3): the bump itself is the explanation, which is what makes "≤ 1 hint line in L1–L3" achievable. Consequences accepted: levels can now contain true dead ends (generator must reject them; target dead-end ratio 0 for L1–L20), and refused moves need unmistakable feedback (bump + phase visibly not flipping) or they read as input failure — logged as a UI dependency. |
| **Alternatives rejected** | crush = death (adds a fail state the design excludes; anti-casual); push/slide to a free tile (violates "never crushed / pushed / randomly moved"); allow standing but block passing through (same two-path problem, plus ambiguous Solver states). |
| **Empirical status** | Playtest Analyst confirmation is **explicitly pending Stage 2** (recorded in the ADR header, not implied as done). |

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

**Honest gap, same round:** RV-001's fixes landed in the owning docs' change logs and ADR-0007, but `docs/iteration-log.md` has **not yet gained the matching ITER-0004 entry** — the V0.3 round is currently evidenced by per-doc changelogs only. The entry needs the full format (incl. Human Decision on ADR-0007 sign-off) and should be filed by Docs + GitHub in a dedicated dispatch; flagged in the return contract rather than quietly skipped.

**Why this matters as evidence:** the review gate fired twice on *paper*, before code existed — once on a wrong rule (V0.1 → V0.2), once on docs that contradicted the right rule (V0.2 → V0.3). Both failures and both fixes are in the record.

### Process incident recorded honestly (same day, Stage 0)

The working tree had **every tracked doc deleted** at the start of the session. All tracked files were recovered **non-destructively from `HEAD`** (`git checkout` of tracked paths; nothing rewritten, no history altered), and the genuinely new Stage-0 files were then authored on top. No documentation content was lost, and no commit history was rewritten. This is logged as ITER-0003(a) because "the docs survived" is only meaningful as an auditable event.

---

## 2. Prototype

**PENDING — not yet run.**

Planned, per ITER-0001/0002 decisions: **5 levels only**, no lobby, no 50 levels, no meta systems, entered directly at L1 (`launch → L1 → play → win → next`). Build is blocked by the human gate:

```
STATUS: WAITING_FOR_USER_ASSETS
```

P0 blockers from `docs/assets/asset-manifest.md`: A-03 Echo Spirit, A-04 Phase A background, A-05 Phase B background, A-06 goal. The 7 request docs (A-01…A-07, minimum 11 files) are complete and gate-ready after the field audit; every row is `REQUESTED`.

Acceptance criteria for Stage 2 (to be filled with evidence when it exists): rules engine `applyMove` implemented once and shared by gameplay + Solver · illegal move returns structurally identical state (test) · import-boundary Vitest gate green · 5 levels accepted by the Solver · one real playtest session recorded.

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
| 3 | Union property: phase walls alone can never open a route — risk that L1–L20 feels static | Case analysis following the V0.2 lock | **OPEN — OQ-1**, Stage-2 playtest gate, mitigations pre-documented |
| 4 | Refused move could read as broken input rather than as information | Consequence analysis of the V0.2 lock | Open as a UI dependency (bump + phase visibly unchanged) |
| 5 | Art-palette colours fail ≥ 3:1 as board figures (1.59:1 / 1.50:1) | Measured during asset-audit | Resolved on paper → derived figure shades per phase, prompts untouched |
| 6 | First design dispatch produced zero files | Orchestrator integration check | Resolved → one retry; failure recorded in `ai-usage-log.md` |
| 7 | All tracked docs missing from the working tree | `git status` at session start | Resolved → non-destructive recovery from `HEAD` |
| 8 | Difficulty weights w1–w5 are a guess | Explicit in `level-difficulty.md` | **PENDING — cannot be fixed without playtest data** |

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

The one diagnosis that *did* happen in this round is process-level, not gameplay-level: the review agent judged the V0.1 suppression rule as a determinism threat, and the Orchestrator accepted the replacement. That is recorded above in §1.

---

## 6. Changes

| Trigger | Change | Where recorded |
|---|---|---|
| Research: crowded Gravity/Arrow categories | Lock Phase Shift as primary; Chain Escape as competitor concept; Gravity Relay to reserve | ADR-0001, ITER-0001 |
| Competition criteria (fun, not content volume) | Prototype scope cut to **5 levels**, no lobby, no meta | ITER-0001 Next Decision |
| Readability risk of a two-world presentation | Priority order `Fun > Readable > Expandable > Pretty`; any VFX hiding cell state is deleted; asset batch kept minimal | AGENTS.md §1, game-design.md §7, ITER-0002 |
| Two-path ambiguity in the suppression rule | Illegal move refused atomically; suppression deleted; 7-step `applyMove`; hash + finiteness contract | ADR-0006, architecture-0001, game-design.md V0.2 §3.1, architecture.md V0.2 §6 |
| Same lock | Teaching ladder rebuilt so **refusal is the tutorial** (L3 = first "no", L5 = Aha #1) | level-design.md §2–§3 |
| Model capability unknowns | Routing set by live probe, not naming; roles abstracted | ai-model-matrix.md, AGENTS.md §11 |
| Overengineering pressure | Explicit "deliberately NOT designed" list with revisit triggers | architecture.md §13 |
| Asset-readability conflict | Field audit of all 7 requests (added missing `Asset ID` / `Acceptance criteria`; corrected sizes/filenames against the authoritative request docs; 21 prompts byte-identical, verified programmatically) | asset-manifest.md |
| RV-001 **B-1**: refusals had no visible cause | **Wall echo** — other-phase walls rendered low-emphasis (≥ 3:1, strictly subordinate); presentation-only, core rule untouched | ADR-0007, ui-ux.md V0.3 §3.1a (UA-002) |
| RV-001 **OQ4**: schema vs. layout grid conflict | Authored grids **≤ 7 × 7** enforced in schema (`width`/`height` int 3–7); 8 × 8 only with Orchestrator approval; `par` required in `LevelDef` | level-design.md §1, architecture.md V0.3 §5, ui-ux.md §12 |
| RV-001 **M-1/M-4/LOW-4**: docs drifted from the locked rules | Roster rewritten to the real 10-agent org; playtest critical cases replaced with V0.2/V0.3 locked cases; pipeline routing section delegates to the model matrix | agent-roster.md V0.2, playtest-log.md V0.2, ai-native-pipeline.md V0.2 (DG-002) |

**Gameplay-impacting commits and their documentation duty:** every commit that changes a rule must also change `docs/game-design.md` or `docs/iteration-log.md` (AGENTS.md §6). All four rule-level changes above have an ADR and an iteration entry.

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
Stage 0  Design lock            DONE   (game-design V0.3, architecture V0.3, ADRs 0001–0007 + architecture-0001; RV-001 review round reconciled)
Stage 1  Asset requirements     DONE   (requests A-01…A-07 complete & gate-ready; manifest audited)
         ── human gate ──        WAITING_FOR_USER_ASSETS
Stage 2  Core prototype (5 lvl) BLOCKED, not started
Stage 3  Playtest               NOT RUN
Stage 4  50 levels + Solver proof NOT STARTED
Stage 5  Polish / final build   NOT STARTED
```

What the project can already show as evidence of AI-native working — with files, not adjectives:

- a direction that was **changed by research** rather than defended (V0 → V0.1);
- a core rule that was **corrected by review before code existed**, with the rejected alternative kept in the record (V0.1 → V0.2);
- **model routing decided by a measured probe**, including the discovery that only one available model has vision;
- an explicit, documented **AI failure and retry**;
- a locked verification invariant — LLM creates, the program Solver proves, the human decides — plus a hard "deliberately not built" list to prove scope discipline;
- a **human ASSET GATE** that stops the pipeline rather than letting an agent fake art.

What remains is the part the competition actually asks about: whether real people find it fun, and whether the level pipeline can produce 50 Solver-proven levels. Until then, the claim is "the machine is built and calibrated", not "the game is good."

---

*This file is the "AI collaboration & iteration process" deliverable. Re-version it whenever `docs/iteration-log.md` gains an entry; never rewrite an earlier entry to make it look smoother.*
