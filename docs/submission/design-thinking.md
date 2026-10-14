# Design Thinking — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Docs + GitHub** (compiled from the docs listed below; no content invented here)
> Date: 2026-10-14 · Doc version: **V0.3** (V0.1 skeleton → V0.2 after the RV-001 review round → V0.3 after GATE C / ADR-0008; submitted state will be re-versioned at the milestone gate)
> Sources of truth: `doc/AI Native 休闲游戏创作大赛：游戏项目玩法深度调研报告.docx`, `docs/game-design.md` (V0.4), `docs/architecture.md` (V0.4), `docs/level-design.md` (V0.3), `docs/level-difficulty.md`, `docs/ui-ux.md` (V0.4), `docs/ai-native-pipeline.md`, `docs/ai-model-matrix.md`, `docs/ai-usage-log.md`, `docs/iteration-log.md` (ITER-0001…0005), `docs/project-status.md`, `docs/decisions/*` (ADRs 0001–0008 + architecture-0001; ADR-0006 partially superseded, ADR-0007 revised — both by ADR-0008)
> Status legend: anything not yet backed by data is written as **PENDING — \<what evidence is needed\>**. This document deliberately keeps those markers instead of filling them with optimism.

---

## 1. Problem

The brief from the organizer is not "make a game", it is a set of hard constraints plus one attitude:

| Constraint | Consequence for design |
|---|---|
| Runs directly in a browser (H5), desktop + mobile | Small state, one input verb, no install, must stay readable on a 320 px phone |
| ≥ 50 formal levels, progressive difficulty | The core mechanic must be **generatable and machine-verifiable**, not hand-authored 50 times |
| First 3 levels need almost no text | The rule has to be teachable by the board itself |
| "不看复杂美术、不看代码质量，只看好不好玩" | Polish is not the axis we compete on; comprehension + decision depth are |
| AI must genuinely participate, full process recorded | The iteration evidence chain is part of the deliverable, not a footnote |

The design problem therefore reduces to three numbers the research report named as the only things that matter:

> **十秒能懂 · 一分钟产生第一次"原来如此" · 五关以后还想继续**
> (understand in 10 s · first Aha within a minute · still want to continue after 5 levels)

And the question the whole project is built to answer, repeated in `AGENTS.md` §0:

> **"这个游戏到底好不好玩？"**

---

## 2. Market Inspiration (from the competition research in `doc/`)

All figures below are **as reported by the research document** (`doc/AI Native 休闲游戏创作大赛：游戏项目玩法深度调研报告.docx`, dated 2026-10-14, which cites Sensor Tower, AppMagic, Google Play / App Store listings). They were input to our decision, not independently re-verified by this project.

**a) The category is crowded, and clone waves are fast.**
2026 H1: global mobile downloads fell ≈ 12 % year-on-year to ≈ 24 B, casual IAP held ≈ 16.5 B USD, hybrid-casual IAP grew ≈ 23 % to ≈ 2.4 B USD. Sort / Screw / Block Puzzle together generated close to 600 M USD IAP and attracted an explosion of new Block Puzzle titles. `Arrows Puzzle Escape` was the #1 game worldwide by downloads in May 2026, with several arrow clones still in the June Top 10. Conclusion we took: **borrowing an abstract mechanism is viable; shipping a recolored clone of a hot category is not.**

**b) The organizer's own product DNA says "mature rules × one light twist × global packaging".**
Vita Mahjong (100 M+ Android downloads) did not change Mahjong Solitaire's rule — it lowered visual pressure and failure anxiety. Tile Explorer keeps ~90 % of player behaviour constant and varies only board structure. Meowdoku (#1 Top Free Puzzle at scrape time) packages a constraint-satisfaction problem as "one cat per region, cats keep their distance". Amaze GO turns a dependency graph into a single tap.

**c) The formula the report extracted — and we adopted:**

```
Fun = Simple Action × Consequential Choice × Readable Feedback
```

The most dangerous design is a game with only the first term. The second most dangerous is a game with only the second. We need **one or two inputs whose single act reaches three to five moves ahead.**

**d) Clone-risk discipline.** The report notes the copyright case *Aretis Limited / Hungry Studio v. Oakever* (2025) as evidence that "gameplay borrowing" and "product-expression copying" are now real legal and reputational risks. Our rule: **imitate abstraction level, never composition** — no copied board layouts, UI, assets, level data or ad creative.

---

## 3. Core Idea

> **你每动一次，世界就变一次。**
> A grid puzzle where the world flips between **Phase A (Light / 白昼)** and **Phase B (Shadow / 夜晚)** on *every legal move*, and each phase is a different map.

The player's real question is never "where can I go now?" It is:

> **"如果我现在走这一步，下一步世界会变成什么样？"**

That single sentence converts a trivial pathfinding task into **planning-under-transformation**, using only one input. The novelty is in the *decision structure*, not the controls — a familiar grid entry point with an unfamiliar consequence model (`docs/game-design.md` §2).

---

## 4. Micro Innovation — one move ⇒ one flip, no switch button

This is the protected core of the project (ADR-0002), stated precisely:

1. A move resolves **in the current phase's map**.
2. Then the phase flips **A ↔ B**.
3. Then the new phase's walls / doors / portals become active, and the player re-plans.
4. **There is no standalone phase-switch button. It is forbidden.** (`AGENTS.md` §2, `docs/game-design.md` §3, hard rule 1 in README.)

Why not a button (the rejected alternative, verbatim reasoning from ADR-0002): with an explicit toggle the game degrades into "walk, press button, walk" — the phase becomes a *tool* the player uses at leisure. Binding the flip to movement fuses cause and consequence into one input: the player can never take a free action, and every step is a **promise about the future board**.

Two supporting locks that make the innovation playable rather than merely clever:

- **Illegal move = refused atomically; legality is judged at entry, in the current phase only.** A move is illegal iff its destination is solid **in the phase you are standing in now**. An illegal move produces **no movement and no phase flip** — the flip is never consumed by a refused move (ADR-0008, architecture-0001 as amended, `docs/game-design.md` V0.4 §3.1). The player is never crushed, pushed, suppressed or randomly relocated: deterministic puzzles only. *History:* under ADR-0006 (V0.2–V0.3) legality additionally required that the tile the player would stand on **after the flip** not be a wall in the new phase; the human removed that second condition at GATE C — standing inside a flipped-in wall became a legal, stable state you can walk out of.
- **Refusal is a free tutorial — and refusal has a visible cause.** A bumped, visibly-unchanged board communicates "that tile is a wall in the other world" with zero text. The L1–L10 teaching ladder is built on that channel (`docs/level-design.md` §2–§3), which is what makes the "≤ 1 hint line" requirement achievable. **ADR-0007** closes the remaining comprehension hole found in review (RV-001 blocker B-1): the V0.1 UI rule "phase-inactive objects are absent / never render ghost walls" would have made an ADR-0006 refusal on an *empty-looking* tile read as broken input. During play, other-phase walls are now rendered as a low-emphasis-but-visible **"wall echo"** (`docs/ui-ux.md` §3.1a, contrast ≥ 3:1, strictly subordinate to active walls). **Presentation layer only** — legality, the flip, `applyMove` and determinism are untouched; the echo is derived render state over the same single `GameState`. ADR-0008 later **revised what the echo means** without touching the rendering contract: an other-phase wall is no longer a permanent obstacle with phase-skinned visibility but a **currently-passable phantom that turns solid on the other parity** — so the echo carries *timing* information ("enterable NOW, solid after your next move"); `ui-ux.md` V0.4 renders it **hollow = passable** and adds **R-C13**, the contract keeping the player readable while standing inside a flipped-in wall.

---

## 5. Player Loop

```
Launch
  ↓
Enter level (no lobby in the prototype)
  ↓
Observe current phase + board
  ↓
Move  (tap adjacent tile / swipe — one logical action: MOVE(direction))
  ↓
Phase flips automatically
  ↓
Board structure changes
  ↓
Re-plan
  ↓
Reach goal → level complete → next level
```

- **One input model only** — tap and swipe are the same verb, no gesture combos, no simultaneous schemes (`docs/game-design.md` §6).
- **Undo and Restart** are the only affordances beyond the verb, and they are quality-of-life, not mechanics.
- **No death, no timer, no move limit, no fail state.** The only real failure is player confusion, so levels are constructed so that no unrecoverable state exists (`docs/level-design.md` §4).
- Deliberately excluded (YAGNI, `AGENTS.md` §10): skills, items, currency, shop, ads, check-in, progression, lobby, social, story, online PvP.

---

## 6. Mechanics

Every mechanic is **"a different expression of one rule"**, not a new rule — that keeps teaching cost near zero while multiplying level variety.

| ID | Mechanic | Phase A | Phase B | First introduced |
|---|---|---|---|---|
| **M0** | Phase Wall | A-walls solid, B-walls gone | A-walls gone, B-walls solid | L1 |
| **M1** | Phase Door (red / blue) | red open, blue closed | red closed, blue open | L21 |
| **M2** | Phase Portal | pair 1 active | pair 2 active | L36 |
| **M3** | Phase Switch (OPTIONAL) | triggers in one phase only | triggers in the other | L26 (extension) |
| **M4** | Composite | any combination | any combination | L26+ |

**The consequence of locking the illegal-move rule (must be read together with §4).** *Superseded analysis, kept as history.* Under ADR-0006 (V0.2–V0.3) we proved a **union property**: entering a wall tile from its own phase is blocked by solidity, entering it from the other phase is blocked by the post-flip standing check, so a tile that is a wall in *either* phase was **never** a legal destination — plain phase walls were **permanent obstacles with phase-skinned visibility** that could not by themselves open or close a route, and genuine route dynamism had to wait for doors (M1), portals (M2) and switches (M3). That was the real, correct analysis *of that rule*, it produced **OQ-1** (below), and we documented the consequence at the moment of the lock instead of discovering it in playtest. **It is no longer the design truth.** At **GATE C (2026-10-14) the human chose Option B**, locked as **ADR-0008**: phase solidity blocks **entry only, judged against the current phase**; the post-flip standing check and with it the union property are **deleted**. The corollary is **parity-dependent entry** — a Phase-B wall is enterable exactly during Phase-A steps, and vice versa — so **M0 phase walls are themselves route-opening / route-closing gates from L1 onward**, with doors, portals and switches layered on a living M0 rather than a static one. Current authoring rules: `docs/level-design.md` V0.3 §0/§2–§3; the superseded reading: `docs/level-design.md` §0's OQ-1 record, retained as written.

- **OQ-1 — RESOLVED at the rule level (GATE C / ADR-0008, 2026-10-14):** the question "do M0-only levels deliver enough *felt* world change?" was answered by changing the rule rather than the dressing: parity-dependent entry makes every M0 wall a real gate. **What is still owed is empirical, not mechanical:** Stage-2 playtest must confirm (a) players discover parity entry without text by L3–L5, (b) embedded states read as "safe — walk out", not as a bug, (c) parity planning reads as depth, not chaos; and **every level must be re-proved by the Solver under ADR-0008 — all pre-ADR-0008 solver results are void**. If the data contradicts (a)–(c), the decision is re-escalated to the human with the evidence — never silently reverted.
- **M3 ships only on positive playtest evidence.** Default plan is M0 → M1 → M2; M3 is a reserve mechanism (`docs/game-design.md` §5). **PENDING — Stage 2–4 data.**

**World wrapping (visual layer only).** Phase A is warm ivory / faint gold / sky blue morning light; Phase B is deep indigo / violet / moonlight, calm and dream-like, never horror. Protagonist: **Echo Spirit / 光灵**. Readability outranks atmosphere: grid cells, obstacles and paths must stay extremely readable in both worlds, and any effect that reduces legibility is deleted rather than tuned (`docs/game-design.md` §7, `docs/ui-ux.md` §0).

---

## 7. Level Progression

50 levels, **data-driven JSON** (never scene code), schema-validated with `zod`, and every accepted level carries Solver metrics. Generator output that fails validation is **rejected, never auto-repaired** into the official set.

| Range | Goal | Mechanic |
|---|---|---|
| L1–L3 | understand movement with almost no text | M0 |
| L4–L6 | first feel that "my move changes the next board" | M0 |
| L7–L10 | first complete **Aha Moment**, ends with a skill gate | M0 |
| L11–L20 | deepen phase walls: path planning, false routes, 2-step lookahead | M0 |
| L21–L25 | introduce **Phase Door** — difficulty intentionally dips | M1 |
| L26–L35 | combine Phase Wall + Phase Door | M0 + M1 |
| L36–L40 | introduce **Phase Portal** — dips again | M2 |
| L41–L45 | cross-mechanic, 3–5 step lookahead | M0+M1+M2 |
| L46–L49 | high-density composite challenge | M0+M1+M2 |
| **L50** | **Final Exam** — no new mechanics, recombine only what was taught | M0+M1+M2 |

Two structural commitments:

- **Non-monotonic curve.** Every block that introduces a mechanic starts 2–3 points *below* the previous block's peak and its first levels are short (par ≤ 4) and free of false routes. When something is new, the player's budget is spent on *understanding*; stacking execution difficulty on comprehension load reads as unfair. Sawtooth, never a staircase (`docs/level-design.md` §6).
- **Difficulty is a measured model, not board size.** `D = w1·L + w2·B + w3·T + w4·R + w5·M` (solution length, branching, lookahead depth, dead-end ratio, active mechanics) — a 12-step level with one legal move per step can be easy; a 6-step level with four plausible choices can be brutal. Weights w1–w5 are **provisional** (`docs/level-difficulty.md` §2). **PENDING — regression against real playtest data (Mistake Rate, Retry Rate, First Win Time); no weight is final until it has been calibrated.**

Mobile readability is a level-generation constraint, not a wish: target cell ≥ 56 px, hard target ≥ 44 px, absolute floor 40 px, grids authored **≤ 7 × 7**, **9 × 9 and larger rejected on mobile portrait** (`docs/ui-ux.md` §2.3, rules R-L1/R-L2).

**`par` is a required level field** (int ≥ 1) in `LevelDef`: the generator stamps it from the Solver's `shortestSolution`, it ships in the level JSON, and it is a **never-a-fail-condition** "perfect clear" reference (`docs/architecture.md` V0.4 §5/§7/§8, `docs/level-design.md` §1). Whether it is *displayed* at all is a separate open UI question (OQ1 in `docs/ui-ux.md` §12: HUD currently shows a plain move count, par display pending Game Designer sign-off). What is settled is the data contract: the curve commitments above (§6, non-monotonic block openings "par ≤ 4") are *validatable from the level file*, not asserted.

> **Resolved (was a flagged inconsistency; closed in the RV-001 reconciliation, 2026-10-14):** the schema-vs-layout conflict is settled at **≤ 7 × 7 authored grids**. `docs/level-design.md` §1 now caps `width`/`height` at **int 3–7** per `docs/ui-ux.md` R-L2 (44 px touch-target floor at a 320 px viewport); **8 × 8 is allowed only with explicit Orchestrator approval**, and only under R-T5 conditions (the whole batch accepts the 40 px floor and swipe is promoted to primary input); **9 × 9+ stays rejected on mobile portrait**. Recorded as OQ4 **CLOSED** in `docs/ui-ux.md` §12. The generator can no longer emit levels the mobile layout cannot render.

Current state of the level set: **PENDING — the 5-level prototype set has not been authored or Solver-verified yet.** Only the schema, invariants, teaching ladder and rejection criteria are locked.

---

## 8. Why Phase Shift (and not the alternatives)

The research report scored three candidate concepts against the competition criteria (scale 0–10; "撞热门品类风险" = collision risk with a hot category):

| Criterion | **Phase Shift** | Chain Escape | Gravity Relay |
|---|---|---|---|
| Understand in 10 s | 8 | 10 | 9 |
| Decision depth | 10 | 9 | 9 |
| Market differentiation | 9 | 7 | 6 |
| 50-level scalability | 10 | 10 | 9 |
| H5 development cost | 9 | 10 | 9 |
| AI level generation | 10 | 10 | 9 |
| Juice potential | 8 | 10 | 10 |
| Hot-category collision risk | low | medium-high | medium-high |
| **Composite** | **9.2** | **9.0** | **8.5** |

Why it won on our priority order (`Fun > Player Comprehension > Puzzle Depth > Level Scalability > Determinism > Testability > Dev cost > Visual Polish`):

- **Differentiation without a learning wall.** Familiar grid + single tap; unfamiliar consequence model. Chain Escape, by contrast, "still reads as another arrow puzzle" — and 2026 is already saturated with arrow clones.
- **Cheap scalability.** One rule expressing itself as walls / doors / portals / switches gives 50 levels without 50 new mechanics — exactly the "same intuition, new situation" pattern the report observed in Tile Explorer.
- **AI-native fit.** Small serializable state ⇒ BFS over hashed states proves solvability and produces difficulty metrics automatically, which is what makes the pipeline in §9 possible at all.
- **Determinism.** Phase after *n* moves is fully determined; the illegal-move rule contributes no edge to the search graph. The player model, the renderer and the Solver can never disagree.

Decision (ADR-0001 / ITER-0001): **Phase Shift is the primary prototype. Chain Escape is kept as a competitor concept; Gravity Relay was dropped to reserve.** The first build target is **5 levels only** — no 50 levels, no lobby, no live-ops — because the only question worth answering first is whether the core loop is fun by itself.

---

## 9. Design Decisions (ADRs)

Full text in `docs/decisions/`. The six that shape the game (0003/0004 listed as one row):

| ADR | Decision | Status & why it matters |
|---|---|---|
| **0001** — Adopt "Phase Shift" as the core mechanic | Build 双相棋盘 over Gravity Relay and Chain Escape | Accepted. Consequences include the known costs: disciplined readability across two visual worlds, and avoiding degenerate "memory test" levels. |
| **0002** — Phase flip is bound to player movement | **No switch button, permanently.** Every legal move resolves in the current phase, flips, then resolves the new phase | Accepted — **protected core innovation**. May not change without Product Lead + Game Designer double confirmation. Undo/Restart became accessibility valves *because* of this rule. |
| **0003 / 0004** — Core logic decoupled from Phaser · Solver proves solvability | `src/core/**` is pure TS; gameplay and Solver call the same `applyMove`; LLM never declares a level solvable | Accepted. This is what turns "AI-generated levels" into a verifiable claim. |
| **0006** — Illegal move refused (no movement, no flip); **wall suppression rejected** | Superseded the V0.1 rule "incoming walls are suppressed on the player's tile" | **Partially superseded by ADR-0008 at GATE C (2026-10-14)** — status while it stood: rule LOCKED (V0.2–V0.3). The V0.1 rule gave **one object two rule paths** — a wall sometimes blocks, sometimes yields — so player and Solver could disagree about the same board; that diagnosis and the rejections of suppression, crush = death, push/slide and "allow standing but block passing" **all remain in force**. What GATE C deleted is the ADR's second legality condition (no standing on a post-flip wall) and its union-property consequence. Architectural mirror: **architecture-0001** — one `applyMove`, illegal = identity, `hashState` contract, BFS finiteness proof (its step order was **7 steps** in architecture V0.3, counting the post-flip revert; reduced to **6** in V0.4 when the revert was deleted). |
| **0007** — Other-phase walls render as a low-emphasis "wall echo" | Resolves RV-001 blocker **B-1**: under ADR-0006, an invisible other-phase wall made a refusal on an empty-looking tile read as broken input | Accepted; **revised by ADR-0008** (semantics only — the rendering contract R-E1…R-E8, ≥ 3:1 contrast and subordination are unchanged). **Presentation layer only** — legality, flip timing, `applyMove` and determinism untouched; the echo is derived render state over the same `GameState` (`docs/ui-ux.md` §3.1a). Consequence honestly recorded *at the time*: the echo improved refusal comprehension and felt change but did **not** resolve OQ-1 — M0-only levels remained mechanically static under ADR-0006. OQ-1 was closed afterwards, by ADR-0008's entry-only rule. Under ADR-0008 the echo renders **hollow = currently passable** and carries parity/timing information (`ui-ux.md` V0.4, + R-C13 embedded-player contract). |
| **0008** — Phase solidity blocks **entry only, judged against the current phase**; standing inside a flipped-in wall is legal (**Option B, GATE C**) | Human-approved core-rule change (AGENTS.md §2 procedure): the post-flip standing check and the union property are deleted; one evaluation point (entry) preserved; player never crushed/pushed/relocated; illegal move still = identity | Accepted (2026-10-14) — locked as 8 clauses in `docs/game-design.md` V0.4 §3.1; `architecture.md` V0.4 (6-step `applyMove`), `level-design.md` V0.3 (parity teaching ladder), `ui-ux.md` V0.4. Corollary: **parity-dependent entry ⇒ M0 walls open/close routes from L1, OQ-1 resolved mechanically.** Costs carried in the open: embedded-state readability (R-C13), all pre-ADR-0008 Solver results **void** (SOLVER-001), and a **mandatory Stage-2 playtest verification** — if data contradicts, re-escalate to the human, never silently revert. |

**Recorded failures, not smoothed-over ones.** Three separate defects were caught, all before any gameplay code existed. (1) The V0.1 design *did* contain a wrong rule (wall suppression): found by Stage-1 review, replaced by ADR-0006 — the audit trail is `docs/iteration-log.md` ITER-0002 → ITER-0003. (2) The V0.2 *documents contradicted each other*: ADR-0006's refusal rule clashed with `ui-ux.md` V0.1's "never render ghost walls" ban, and roster / pipeline / playtest-vocabulary docs had drifted; found by the Reviewer's cross-doc round (**RV-001**) and reconciled in a V0.3 pass (ADR-0007; V0.3 doc set; DG-002). (3) **Even the "right" rule was strategically flawed:** ADR-0006's union property made the tutorial-critical M0 stretch static (OQ-1). The consequence was documented at lock time rather than hidden, escalated to the user at **GATE C**, and the human reversed the rule (**ADR-0008**) while keeping the determinism invariants ADR-0006 existed to protect. The matching iteration entries (**ITER-0004**, **ITER-0005**) are both filed in `docs/iteration-log.md` — the gap earlier flagged in this document's §9 and in `iteration-optimization.md` §1 is closed. Separately, the process itself failed twice in the same way: two background dispatches (the first game-design round, GD-001; the first level-pipeline round, **LV-001**) returned **zero files on disk** — LV-001's empty report was verified with `find` (`src/core/level`, `src/levels`, `scripts` absent) and re-dispatched as LV-001R with cross-agent export names frozen verbatim. The pipeline rule now: **an agent's "done" is not a delivery until the Orchestrator can see it on disk** (`docs/iteration-log.md` ITER-0003, ITER-0005).

---

## 10. AI Role

Principle (`docs/ai-native-pipeline.md` §1):

> **LLM creates. Solver proves. Human decides.**

**What AI actually did in this project so far** (evidence: `docs/ai-usage-log.md`, `docs/iteration-log.md`, `docs/ai-model-matrix.md`, commit history):

1. **Market research synthesis** — the candidate comparison in §2/§8, including the correction that killed our earlier "Gravity Stack" instinct. A point that sounds new is not necessarily new; that is what deep research buys you over deciding by feel.
2. **Design and architecture drafting** — Game Designer and Architect (REASONING_MODEL) produced `game-design.md` V0.1→V0.2 and `architecture.md` V0.1→V0.2 in a parallel round; the Reviewer (REVIEW_MODEL) read-only reviewed the round; the illegal-move problem was raised and resolved as an ADR pair (design + architecture) rather than a chat reply.
3. **A real, measured model-routing decision** (`docs/ai-model-matrix.md`) — five candidate models each ran *the same* five-part probe as isolated child sessions: text reasoning, TypeScript coding, strict JSON, tool calling, and vision (read a generated 64×64 PNG of four colour quadrants plus a white centre square). All five passed text/coding/JSON/tools; **only `qwen3.8-max` accepted image input and described it correctly**, so it is the sole VISION_MODEL. Routing was assigned by measured behaviour, never by model name: REASONING = `kimi-k3`, CODING = `deepseek-v4.1-flash`, FAST = `qwen3.8-flash`, REVIEW = `qwen3.8-max`, VISION = `qwen3.8-max`. Roles are abstract; a model name is configuration, not architecture.
4. **Cost policy** — one shared probe per model instead of per-task model shopping; strong models reserved for design/review, fast models for docs and bulk work.
5. **Documented friction — twice the same class.** The first design dispatch under ADR/GD-001 wrote **no files** and had to be retried once; the first level-pipeline dispatch (**LV-001**, 2026-10-14) returned an **empty report with zero files on disk** (verified by `find` before any acceptance) and was re-dispatched as **LV-001R** with the cross-agent export contract (`Coord`/`DoorDef`/`SwitchDef`/`PortalDef`/`Level`/`LevelSchema`/`validateLevel`) frozen verbatim in the dispatch, because GAME-001 was already coding against `import type { PortalDef } from "@/core/level"`. Both failures are recorded rather than hidden (`docs/ai-usage-log.md`, `docs/iteration-log.md` ITER-0003/0005); the pipeline rule learned from them: background-agent completion requires **disk evidence**, verified by the Orchestrator, not an agent's self-report.
6. **A cross-doc review round that caught the docs disagreeing with the rules (RV-001).** The Reviewer (REVIEW_MODEL) read-only audited the V0.2 document set and found one blocker and a set of drift findings: **B-1** — ADR-0006 refusals vs. the `ui-ux.md` V0.1 "never render ghost walls" ban (an invisible other-phase wall makes a legitimate refusal look like broken input); **M-1** roster drift; **M-4** stale playtest vocabulary; **LOW-4** stale model routing in the pipeline doc; plus M-5a/M-5b (HUD/restart & par contradictions), LOW-5/LOW-6 (timing & asset naming), and open **OQ4** (grid cap). Outcome: **ADR-0007** (wall echo, presentation-only), `ui-ux.md` V0.3 with the binding `wallEcho` contract, `game-design.md` / `architecture.md` V0.3 (step-6 solidity extended to closed doors; win condition pinned phase-independent; `par` required in `LevelDef`; portal/door/hash semantics pinned), OQ4 closed at ≤ 7 × 7, and a reconciliation pass (DG-002) fixing roster / pipeline / playtest-log drift. This is the review loop working on *paper contradictions before code* — and the failure mode (docs drifting from a locked rule) is itself part of the record.

**What AI has *not* been allowed to do:** declare a level solvable, judge its own difficulty, or generate final competition art. Solvability is always the program Solver's verdict. Art stays behind the ASSET GATE (`AGENTS.md` §8): no Studio agent generates final art — at GATE A (2026-10-14) the **human authorised and operates their own Codex generation channel**, and agents supply only prompts and acceptance criteria; delivered files are then validated and registered by the Art Director. And when AI analysis surfaced a strategic dead end inside its own *accepted* rule (the union property ⇒ static M0, OQ-1), no agent was allowed to "fix" it silently: it was escalated to the human, who decided at **GATE C** (ADR-0008). The AI prepared the consequence analysis and the option set (A/B/C with rejection reasons); the **decision to reverse a locked core rule belongs to the human** — "LLM creates. Solver proves. Human decides." applied to the rule itself, not only to levels.

**Planned, not yet performed:** LLM level-candidate generation → zod validation → rule validation → BFS Solver → difficulty metrics → accept/reject → playtest → AI bottleneck diagnosis → re-validation. **PENDING — Stage 2/4 evidence:** archived raw candidate JSON (including rejected ones), per-level Solver metric JSON, before/after difficulty comparison, and human playtest sessions. Until those artifacts exist, the "AI genuinely participates" claim in this document is limited to research, design, architecture, review and process documentation — which is what has actually happened.

---

## 11. Open / PENDING register

| # | Item | Evidence needed |
|---|---|---|
| P1 | Is the 5-level prototype fun? (the only final question) | Stage 3 human playtest: Understand Time, First Win Time, Aha Point, Continue Intent |
| P2 | OQ-1 — do M0-only levels feel dynamic enough? | **RESOLVED at the rule level (GATE C / ADR-0008, 2026-10-14): parity-dependent entry makes M0 walls real route gates.** Remaining evidence owed: Stage-2 playtest — (a) parity discovery without text by L3–L5, (b) embedded states read as safe, (c) parity reads as depth not chaos — plus **SOLVER-001 re-verification of every level (all pre-ADR-0008 solver results void)**. If data contradicts, re-escalate to the human. |
| P3 | M3 Phase Switch — ship or cut? | Positive playtest evidence in Stage 2–4, else it stays a reserve mechanism |
| P4 | Difficulty weights w1–w5 | Regression against real Mistake / Retry / First Win data |
| P5 | Mobile readability across both worlds | Device screenshots + the `ui-ux.md` greyscale/contrast gate |
| P6 | 50-level set | Generated candidates + Solver-proven metrics (nothing accepted without proof) |
| P7 | Final art | **Status changed 2026-10-14: GENERATING (user-authorized Codex channel)** — the human operates the generation; agents supply prompts + acceptance criteria only (AGENTS.md §8 intact). P0 set = `echo_spirit_a/b` · `bg_phase_a/b` · `goal`; manifest rows flip to `DELIVERED` on Agent 5 validation |
| P8 | Level size cap: `level-design.md` §1 vs. `ui-ux.md` R-L2 | **RESOLVED (2026-10-14, RV-001 round).** Schema now `width`/`height` int **3–7**; authored grids **≤ 7 × 7**; **8 × 8 only with explicit Orchestrator approval** under R-T5; 9 × 9+ rejected on mobile portrait. OQ4 **CLOSED** in `ui-ux.md` §12. Kept in this register as the audit trail, not as an open item. |
