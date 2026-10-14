# Playtest Log

> Owners: **QA Engineer** and **Playtest Analyst**
> Version: **V0.3** · Date: 2026-10-14
> **V0.3 (PA-002, Playtest Analyst):** ADR-0008 ships with a *mandatory Stage 2 verification gate*, yet this
> log contained **zero** occurrences of `ADR-0008` / `Option B` / `parity` / `embedded` / `GATE C` — a
> human-approved core-rule reversal was hanging on an empty log. V0.3 adds the **pre-registered
> Stage 2 protocol in §9** (hypotheses (a1)/(a2)/(c) + DoD gate, thresholds, tie-break rules, escalation
> paths, minimal 5-participant script), extends the §1 metric vocabulary (M1–M16), corrects §5's
> refusal-explanation bullet (void under Option B — **ghosts never refuse anything**) and flags three more
> §5 bullets that still carry ADR-0006 step-6 semantics. **Still no sessions, no participants, no numbers.**
> V0.2 = RV-001 finding **M-4** reconciliation: the V0.1-era case list ("no-cover rule", "player never covered
> by a newly appearing wall", "wall appears/disappears on flip") described the **superseded** wall-suppression
> rule and is replaced by the locked V0.2/V0.3 cases below (ADR-0006, ADR-0007, `architecture.md` §6.1–6.2).
> ⚠ **§5 is QA-Engineer-authored content in a jointly-owned file.** V0.3 *corrects* the bullet PA-002 was
> mandated to correct (`:61`) and *flags* the others for QA to rewrite — see §5a.
> **Evidence label (ui-ux R-P7):** any Stage-2 build is program-drawn vector tokens = `placeholder art`.

---

## 1. Metrics tracked (per session / per level)

V0.3: the V0.2 vocabulary is kept and completed. IDs **M1–M16** are the only names the §9 protocol and
Table D may use; free-text synonyms are forbidden so that two rounds stay comparable. Definitions of the
coded columns (confusion codes C1–C9, post-refusal codes R1–R6, ghost codes G1–G5, the embedded-event
window) are in the coding manual: `docs/playtest-analysis/stage2-adr0008-gated-protocol-notes.md` §2.

| ID | Metric | Definition | Why it matters |
|---|---|---|---|
| **M1** | Understand Time | seconds from board visible (T0) to first intentional legal move (T1) | is entry cost near zero? (assumption A1: ≤ 30 s) |
| **M2** | First Win Time | seconds from first input of a level to that level's first completion; and session-level T(L1 start) → first win | is the loop satisfying fast? |
| **M3** | Level Completion Time | seconds per level, plus moves used vs **Solver-proved `par`** (Δmoves) | is difficulty honest, and is the cost of a lesson measurable? |
| **M4** | Refusal Count | taps that produced **no movement and no phase flip** (ADR-0008 clause 1) | mistake rate; is the refusal legible as information? |
| **M4b** | Post-refusal behaviour | coded **R1–R6** for the first action after each refusal | *what the player does with a "no"* is the real signal, not the count |
| **M5** | Restart Count | re-attempts of the same level | is failure motivating or punishing? |
| **M6** | Undo Count | undos per level (both tails reported: ≈ 0 with long dwell = fear; very high = thrash) | is experimentation free in practice, not just in spec? |
| **M7** | Hint Usage | H1 stall / **H2** / **H3-assisted** counts per level, with latency | does the design explain itself? (H2/H3 exclude the level from the DoD "without explanation" count) |
| **M8** | Misclick | **C9** events: wrong tile / cell edge / off-board taps — input, never comprehension | touch-target and layout defects (R-T5/R-T6); must not pollute M4 |
| **M9** | Confusion flags | **C1–C9** + timestamp `(level, move index)` + verbatim, per the §2.1 trigger rule | the qualitative spine; free-text goes in `verbatim`, never in `code` |
| **M10** | Aha Moment | level index + move index + verbatim quote (or "none observed") | is the innovation landing, and where? |
| **M11** | Continue Intent | **CI-beh** (15 s no-prompt window after L5: seeks the next level?) + **CI-self** (1–5) | the core quality bar — §2 |
| **M12** | Quit Level | the level at which the participant stops (or "none"); recorded without persuasion | the only unrecoverable failure in a game with no death (§4 of `level-design.md`) |
| **M13** | **Ghost Avoidance Rate (GAR)** *(new V0.3)* | (G2+G3+G4+G5) / Ghost Opportunities, pooled; plus per-participant worst; plus **M13b Key-Ghost Coverage** | **player avoids a passable ghost = readability failure** (`ui-ux` R9); the inverse error (tapping a solid) is G4 and is reported separately |
| **M14** | **Embedded Dwell** *(new V0.3)* | seconds from flip resolution (occupied tile + one-shot `fx.phaseRing`) to the next legal move; median + p90 | **reading the embed as "trapped" = R-C13 failure**; still-image §3.3 test 8 cannot see this |
| **M15** | **Embed Flail** *(new V0.3)* | within the M14 window: ≥ 2 refusal/repeat taps, or restart/undo < 3 s after landing, or a **C3** verbalization; ≤ 1 event per window | behavioural proof of "am I stuck?" — the failure mode Option B must not create |
| **M16** | Model probes | **V-CL**, **P-probe**, **CM1/CM2/CM3/CM-D/CM-P/CM-GL**, **D1** — verbatim, Table C | comprehension that the player can *state*, which is what "understand without explanation" means |

**Dropped from V0.2 as separate rows:** "Mistake Rate" (now M4 + M4b + Δmoves in M3) and "Retry Rate"
(now M5 + M6). They were the *stated* test for assumption A2 in `game-design.md` §13 and were too vague
to falsify — §9.6 replaces them with the hypothesis-(c) metric set.


## 2. The single most important question

> **After Level 5 is completed, does the player actively want to continue?**

More valuable than "rate this game 1–10." In the prototype, **do not show a "Next" prompt** — observe whether the player looks for Level 6 themselves.

## 3. Test matrix

| Type | Scope | Tool |
|---|---|---|
| Unit | rules, phase flip, collision, illegal-move identity | Vitest |
| Solver | known solvable/unsolvable fixtures | Vitest |
| Integration | loader + schema + solver | Vitest |
| E2E | load → move → win → next, restart, undo | Playwright |
| Mobile | viewport, touch targets, legibility | Playwright + manual |
| Gameplay | human sessions, L1–L10 focus | manual + telemetry |

## 4. Bug record format

```
Reproduce → Root Cause → Fix → Regression Test
```

## 5. Critical cases to cover (locked V0.2/V0.3 rules — QA Engineer mandate)

Derived from ADR-0006, ADR-architecture-0001 and `architecture.md` §6.1–6.2 (V0.3 wording). These are the cases the rule tests must pin before any level ships.

- Phase switch correctness: every **legal** move flips A↔B exactly once; phase after *n* moves is fully determined.
- **Illegal move = IDENTICAL state.** A refused move produces **no movement, no phase flip, and `moveCount` unchanged** — `applyMove` returns a state deep-equal to the input (implementations may even return the same reference). This supersedes the V0.1 "wall suppression / never covered" rule.
- **Legality property test:** `isLegalMove(level, s, m) ⟺ applyMove(level, s, m) ≢ s`, pinned over generated states so the pre-check and the rule function can never diverge (`architecture.md` §6.2).
- **Step-6 revert discards every side effect.** If the post-flip check would leave the player standing on a wall **or a closed door** in the new phase, the whole move is reverted — the step-3 switch toggles, portal teleport and door resolution of the candidate state are **discarded**, and the flip is **not consumed**. Callers must never observe a half-applied transition.
- Out-of-bounds and blocked destinations (wall / closed door active in the current phase) — each refused, identically.
- Portal in/out: triggers **only on the entering move** in its active phase; no portal-to-portal chaining within one move; standing on a portal after a flip never teleports.
- Door open/closed per phase: `doorsOpen` recomputed **absolutely** at step 5 from `(color, phase, switchesOn)` — never carried over incrementally; an open door may not close onto the player at the flip (step-6 rule).
- Wall activity across a flip is a **state swap, not add/remove** — no wall sprite is created or destroyed by the flip (supersedes the V0.1 phrase "wall appears/disappears"; `ui-ux.md` R-E6).
- Win condition checked at step 7 only: standing on the goal after a fully-resolved legal move wins, **regardless of phase**.
- Restart and Undo.
- Unsolvable state handling.
- Abnormal / malformed Level JSON (schema validator rejects; never auto-repaired).
- Touch behavior (tap + swipe as one verb).
- Mobile layout (authored grids ≤ 7×7; the flagged 320 px / 7×7 = 41.1 px case per `ui-ux.md` R-T5).
- **A refused move must be visually explained — and under Option B the cause is NEVER a ghost.** *(V0.3 correction; the V0.2 wording of this bullet is **void**.)* ADR-0008 clause 1 makes a refusal depend **only** on the **current** phase, so the refusing tile is always a full-strength filled `wall` (or a door closed *now*) — the highest-emphasis obstacle on the board, visible *before* the tap. The V0.2 claim that "other-phase walls render as the wall echo, so every refusal has a player-visible cause" was ADR-0007 semantics and is **false under Option B**: an other-phase wall now renders as a **passable ghost** and **never refuses anything** — it is the opposite of an obstacle at the moment of the tap. The presentation contract is therefore: (i) the refusal cause is on the board at full emphasis (`obj.wall`, filled, ≥ 3:1) before the tap; (ii) the **phase visibly does NOT flip** on a refusal — "the world did not change" is the primary cue (`ui-ux.md` §3.3 test 7b, §6.5); (iii) the ghost's reason to exist is **flip anticipation + the passable/blocking axis** ("enterable NOW, solid after my next move" — `ui-ux.md` §3.1 / §3.1a R-E3/R-E5), **not** refusal explanation. Two bugs are in scope, both tested on real screenshots at Stage 2: a refusal that reads as broken input (§3.3 test 7, M4b code **R6**) **and** a ghost the player avoids (§3.3 tests 5/6, metric **M13 GAR**). Prohibited fixes: a bigger nudge, a flash, a sound sting, or text on the causing wall (`ui-ux.md` §6.3/§6.5) — separation is tuned **inside** the R-E / R-E2a bands only.

## 5a. ⚠ Staleness flags — §5 bullets that still carry ADR-0006 semantics (hand-off: QA Engineer)

PA-002 was mandated to correct the refusal bullet above. While doing so, three further §5 bullets were
found to describe the **deleted** post-flip standing check (ADR-0006 Decision condition 2, withdrawn by
ADR-0008 clause 1/3/5). They are **flagged, not rewritten** — §5 is QA-Engineer-authored content and
`tests/**` does not exist yet, so the rewrite belongs to QA-001 with the real API surface in hand:

| §5 bullet | Status under ADR-0008 | What QA-001 must pin instead |
|---|---|---|
| "**Step-6 revert discards every side effect** … the flip is *not* consumed" | **VOID** — there is no post-flip standing check, so no step-6 revert exists. A move is judged once, at entry, against the current phase. | `isLegalMove(level,s,m) ⟺ destination in bounds ∧ ¬solid(currentPhase)`; illegal ⇒ `applyMove` returns a state deep-equal to the input (no move, **no flip**, `moveCount` unchanged); legal ⇒ the flip is always consumed and switch/portal/door side effects are **committed, never discarded**. |
| "Door open/closed per phase … an open door **may not close onto the player** at the flip (step-6 rule)" | **HALF VOID** — `doorsOpen` recomputed absolutely from `(color, phase, switchesOn)` still stands (clause 5); the "may not close onto the player" clause is **deleted**. | A door **may** close onto its occupant: that is the embedded state (clause 3/5). Pin instead: an embedded occupant is never crushed/pushed/relocated, and its exits are exactly the adjacent tiles non-solid in the then-current phase (clause 4). |
| "Win condition checked at **step 7** only" | numbering stale (no steps 3/5/6/7 pipeline survives) | substance stands: win = standing on the goal after a fully resolved legal move, **regardless of phase** (clause 7); goal must be non-wall in **both** phases, hard-enforced by validation. |
| "Unsolvable state handling" | stands, but incomplete | add the ADR-0008 dead-state invariant: a reachable non-goal state with **zero legal exits** (embedded states included) fails the level (`level-design.md` §4) — and note that "waiting to change parity" is **not** an escape, because no move means no flip. |

> Also void and worth restating for anyone reading old submission docs: the **union property**
> ("a tile that is a wall in either phase is never a legal destination"). It was the reason M0 looked
> static; ADR-0008 withdrew it — and **GATE D then proved that withdrawing it does not by itself make M0
> dynamic** (see §9.1). `docs/submission/design-thinking.md:125` and `iteration-optimization.md:29` still
> assert the union property as current truth (tracked as **DG-004**).


## 6. Sessions

**No session has been run. No participant has been recruited. Every cell below is empty on purpose** —
these are the rows the §9 protocol will fill, pre-created so that no threshold can be re-drawn after data
appears (pre-registration, §9.2 T6). Filling a row requires a completed Table A for that participant.

| # | Cohort | Date | Build (BUT id + commit) | Participant | Levels | Valid? | Quit level | Notes |
|---|---|---|---|---|---|---|---|---|
| P1 | P (player) | | | | L1–L6 | | | |
| P2 | P | | | | L1–L6 | | | |
| P3 | P | | | | L1–L6 | | | |
| P4 | P | | | | L1–L6 | | | |
| P5 | P | | | | L1–L6 | | | |
| PR1–PR3 | P (replacements, cap 3) | | | | | | | only for INVALID sessions — never used to drop n below 5 |
| V1–V5 | V (fresh viewers, **disjoint from P**) | | | | §3.3 tests 5/6/7/8 | | | screenshots only, no play |

## 7. Findings

_(empty — populated **only** from coded Stage-2 sessions, per §9.10. No finding may be written before its
raw tables exist; a finding without tables is void.)_


## 8. AI analysis of playtest

For each finding, record: raw data → AI diagnosis → parameter change → solver revalidation → retest. This is part of the required AI-collaboration evidence chain.

---

## 9. Stage 2 verification protocol — ADR-0008 (Option B) + GATE D

> **Owner:** Playtest Analyst · **Authority:** ADR-0008 Consequences, last bullet ("Mandatory Stage 2
> playtest verification … If Stage 2 data contradicts (a)–(c), re-escalate to the human with the playtest
> evidence; **do not silently revert**") and `project-status.md` GATE C row.
> **Status: PRE-REGISTERED · NOT RUN · n = 0.** Nothing in §9 contains a result. §9 exists so that the
> thresholds are fixed *before* any human touches the build.
> Companion files (subordinate to §9): `docs/playtest-analysis/stage2-adr0008-gated-protocol-notes.md`
> (rationale, coding manual, §3.3 mapping, test-6 sampling rule) and
> `docs/playtest-analysis/stage2-raw-data-sheets.md` (Table A–F, canonical raw-data templates).

### 9.0 Scope, and the one question that still dominates

§9 verifies the human-approved core-rule reversal **and** the Prototype Definition of Done. Both are
gates; the DoD dominates. No amount of readability success compensates for a cohort that does not want
Level 6 (§2). Order of reporting: **DoD → (a1) → (c) → (a2)**.

### 9.1 Build Under Test (BUT) — precondition, filled and committed **before** session 1

| BUT field | Value (fill before running) |
|---|---|
| Commit / build id · art status (**must be `placeholder art`**) | |
| Levels present (ids) | |
| Solver proof status for every level (solvability + `par` + zero dead states) — **manual `par` hypotheses are NOT acceptable here** | |
| First level containing a **forced embed** (mandated by `level-design.md` §2 L6) · in which phases | |
| First level containing a **switch + door pair** (D3) | |
| First level containing an **opposite-colour-end portal** (D3) | |
| Designated **key ghost tiles** per level (for M13b) | |
| Pre-marked **P-probe** board state + the 4 tiles (2 legal / 2 solid) | |
| Frozen screenshot set for Cohort V (levels × phases × conditions, with the Table E sampling worksheet) | |

**GATE D dependency — read before scheduling anything.** ADR-0008 clause 8 ("parity genuinely rewires
feasible routes from L1 onward") was **proved false for M0-only content** three independent ways
(`project-status.md` GATE D; 880,640-configuration exhaustive check behind RV-002; Orchestrator BFS
driving the shipped `applyMove` on 400 boards → **0 dual-phase tiles**). On a 4-connected grid where every
legal move flips the phase and a refusal costs no move, the phase in which a tile is entered is a function
of the tile alone, so an M0 wall is either permanently blocking or permanently passable decoration and
**no tile is ever "refused first, then entered later."**

Therefore the original hypothesis **(a)** — "players discover *parity opens walls* within L3–L5 without
text" — **has no discoverable object on M0-only content and is untestable as written.** Running it would
produce a guaranteed FAIL caused by the level plan, not by Option B, and would invite the wrong remedy
(reverting a human-approved rule). **(a) is withdrawn as a playtest hypothesis, re-filed as the GATE D
authoring/Solver question it actually is, and replaced by (a1) + (a2)** (full rationale: notes §1).

| Hypothesis | Object being measured | Runnable on the **current** M0-only build (l001–l005)? |
|---|---|---|
| **(a1)** Embedded-state readability (absorbs **(b)**) | the *embedded player* — Option B's only genuinely new **perceptible** beat (ADR-0008 clause 3/4; `ui-ux` R-C13 + §3.3 test 8). Reachable today: e.g. `l004`'s `phaseBWalls [[2,0]]` is entered on an odd (Phase-A) move and solidifies at the flip. | **YES** — provided the BUT contains a level where the par route *forces* the embed (`level-design.md` §2 L6). `l004`/`l005` permit it but do not force it; if no level forces it, (a1) is `NOT TESTABLE` on that build and must not be scored. |
| **(a2)** Decision readability under the **D3 schedule** (switch+door pairs moved forward; opposite-colour-end portals next) | whether the player can *state* "the thing I stepped on changed that door" / "which side I came in from decides whether this tile accepts me" — the "depth" feeling (a) was reaching for, now with a mechanical object (LV-001R: M0 → 0 dynamism, M1 doors alone → 0, **M3 switch+door → 231/500**, **M2 opposite-colour portal → 233/500**) | **NO** — requires the post-GATE-D level set. Until the human decides GATE D and Level AI ships it, record **(a2) = `NOT TESTABLE ON THIS BUILD`**. Never a pass, never a fail. |
| **(c)** Planning reads as depth, not chaos / memory test (assumption A2) | planning behaviour and its self-report | **YES**, but with one caveat recorded in the report: on an M0-only build the *planning* object is thin (GATE D), so a (c) pass on l001–l005 is weak evidence and must be re-run on the D3 build before it closes A2. |
| **DoD** | ≥ 5 non-developers · ≥ 4/5 understand without explanation · ≥ 3/5 want Level 6 | **YES** |

**Paper-prototype validity (a session can be run before RENDER-001).** Paper = printed grids, coins for
player/wall/ghost, a two-sided phase card the moderator flips after every legal move.

| Hypothesis | Paper-valid? | Why |
|---|---|---|
| (a2) decision readability, CM-D / CM-P / P-probe | **YES** | it measures a causal *model*, which paper carries faithfully |
| (c) planning vs memory, D1, Δmoves | **YES** | same |
| DoD understand (CM1/CM2) | **partly** — record as `paper`, and the DoD verdict stays **open** until a build run | comprehension of the *rule* transfers; comprehension of the *feel* does not |
| **(a1) embedded readability** | **NO** | it is precisely a rendering + motion property (R-C13, `obj.wallOccupied`, one-shot `fx.phaseRing`, 140–220 ms). A paper coin on a wall square cannot falsify "reads as a clip-through bug". |
| M14/M15 dwell & flail, V-CL / Variant CL, M13 GAR | **NO** | latencies, motion causality and touch behaviour need the real build |

### 9.2 Threshold and tie-break conventions (binding on every hypothesis)

| # | Rule |
|---|---|
| **T1** | For every `≥ k/n` threshold, **exactly k/n ⇒ PASS, flagged `MARGINAL`**. |
| **T2** | For every ceiling (`≤ k/n`, `≤ x s`, `≤ x %`), **exactly at the ceiling ⇒ PASS, flagged `MARGINAL`**. |
| **T3** | For every median/p90, **exactly equal ⇒ PASS, flagged `MARGINAL`**. |
| **T4** | Any value strictly on the wrong side ⇒ that sub-metric **FAILS**, and a hypothesis fails if **any** of its sub-metrics fails. There is no averaging across sub-metrics and no "close enough". |
| **T5** | **Marginal budget:** if ≥ 2 hypotheses pass only marginally — or the DoD passes marginally together with any marginal hypothesis — the round verdict is **`MARGINAL`**, which **does not close the ADR-0008 gate**. Re-run only the marginal sub-tests with a **fresh** cohort of 5 (never the same people: they are no longer fresh) before Stage 3. |
| **T6** | **No threshold, level index or probe wording in §9 may be edited after the §9.1 BUT table is committed.** A post-hoc edit is a protocol violation and voids the round. Corrections discovered mid-round are recorded in Table F, applied to the *next* round, and reported as a deviation. |
| **T7** | **n must be ≥ 5 VALID sessions.** An invalid session (interrupted > 5 min · build/device crash · script deviation on a scored item · prior exposure found later) is **replaced by a fresh participant** — never dropped to n = 4, which would silently tighten 4/5 into 4/4 = 100 %. Replacement cap **3**; beyond it, stop and report `BUILD NOT TESTABLE`. |
| **T8** | Times are read from the screen recording at 0.1 s. Without a recording, M14/M15 degrade to ±1 s live stopwatch and every affected row carries `live-timed`; those two metrics are then reported as **weaker evidence**, not as equivalent. |
| **T9** | A `NOT MEASURED` cell (discarded code, contaminated window, missing data) counts as **neither pass nor fail** and reduces the denominator only where §9 says so explicitly; otherwise the sub-metric is `NOT MEASURED` and the hypothesis verdict is **`INCOMPLETE`**, never `PASS`. |

### 9.3 Roles — who moderates, who codes, who is recused

| Role | Who | Constraint |
|---|---|---|
| **Session moderator (主持人)** | The **human user**, or a designated non-developer friend the human briefs. AI agents cannot moderate humans; the studio's contribution is this script and the coding. | Must **not** have authored the level under test. Reads the verbatim lines exactly. Explains nothing about mechanics. Reacts to nothing ("mm-hm" only). Never says parity / ghost / echo / phase-wall first. |
| **Observer / timekeeper** | A second person (may be the same human on a second pass over the recording) | Tallies Table B live; owns the stopwatch; says nothing to the participant. |
| **Protocol owner + first coder** | **Playtest Analyst** | Codes 100 % of sessions from the recording, computes Table D, writes §10 Findings and the verdict. |
| **Second coder** | **QA Engineer** or **Reviewer** | Independently codes ≥ 2 of 5 sessions from the coding manual alone; agreement per code, **< 70 % ⇒ that code is DISCARDED and reported `NOT MEASURED`** (notes §2.5). Never averaged, never adjudicated by the first coder alone. |
| **Recusal** | — | The sole author of a level may not be the only coder of that level's (a2) verdict. A disagreement resolved in the direction that helps a threshold is logged `DISPUTED`. |
| **Verdict recipient** | **Human (GATE C/GATE D authority)**, via the Orchestrator | Only the human may revert or re-scope ADR-0008 (§9.9). |

### 9.4 Recruitment (被试招募口径)

- **Cohort P — 5 players** (target 6–8 recruited so one invalid session does not delay the round).
  **Cohort V — 5 fresh viewers, disjoint people from P.** §3.3 requires "a fresh viewer … with no
  explanation"; someone who just played L1–L6 is not fresh and would pass tests 5/6/8 for the wrong
  reason. **Reusing P for V voids the §3.3 gate** — record `§3.3 tests NOT RUN — no fresh cohort` and
  leave the art gate open instead.
- **Non-developer:** has never read `src/**`, never worked on this project, never seen this build.
- **≥ 1 of 5 must self-report "I don't play puzzle games"** — otherwise the cohort measures genre
  literacy, not the design.
- **Own phone or the test phone at 390 px width**, mobile Safari/Chrome, held at their own distance.
- **Individually run.** Friends must not watch each other play; social learning moves M1 without moving
  the design.
- **Colour vision is recorded, never an exclusion criterion** — a CVD participant is *valuable* for
  §3.3 test 3 and for M13.
- **No incentive that creates compliance pressure.** A participant who wants to stop is thanked; their
  Quit Level (M12) is data. Persuading a quitter to continue corrupts M11.
- **Consent:** screen + hands + audio recording (audio is required — verbalizations *are* the data); no
  face; recordings deleted after coding unless the human chooses to keep them; consent recorded in Table A.
- Duration ≈ 25 min per P session, ≈ 8 min per V session.

### 9.5 Hypothesis (a1) — embedded-state readability *(absorbs ADR-0008 (b))*

**Claim under test:** walking onto a ghost and having it solidify underfoot reads as *"I am standing
inside a wall and I can still walk out"* — **part of the game**, not a clip-through/trapped bug.

| # | Metric | Threshold | n | Fails when |
|---|---|---|---|---|
| a1-1 | **V8a** (§3.3 test 8a): locate the player on the embed frame | **< 1 s, 5/5**, both phases | V = 5 | any viewer > 1 s, or the phase-B frame fails (Phase B is the harder case: player body vs `obj.wallOccupied`) |
| a1-2 | **V8b** (§3.3 test 8b): "Is the player inside that wall a **bug**, or **part of the game**?" | **≥ 4/5 "part of the game"**, both phases | V = 5 | ≤ 3/5, or any "bug" answer on the Phase-B frame cluster |
| a1-3 | **M14 Embedded Dwell** (flip resolution → next legal move) | median **≤ 3.0 s**, p90 **≤ 8.0 s** | ≥ 1 embed event per P participant, forced by the level | median or p90 over |
| a1-4 | **M15 Embed Flail** (≥ 2 refusal/repeat taps, or restart/undo < 3 s after landing, or C3) | **≤ 1/5 of embed events** | all embed events in cohort P | > 1/5 |
| a1-5 | **C3** "am I stuck / trapped / is this broken?" | **≤ 1/5 participants**, anywhere in L1–L6 | P = 5 | ≥ 2/5 |
| a1-6 | **M13b Key-Ghost Coverage** on the embed level: the winning attempt actually crossed a formerly-refusing / ghost tile | **≥ 4/5** without H2/H3 | P = 5 | ≤ 3/5 — a pure walk-around teaches nothing (`level-design.md` §3 req. 3) |

**Verdict:** (a1) **PASSES only if a1-1 … a1-6 all pass.** A still-image pass (V8) with a live fail
(M14/M15) is a **FAIL** — the ring/occupied-interior beat is a motion property and §3.3 cannot see it.
Tie rule: exactly 4/5 or exactly 1/5 ⇒ `MARGINAL` (T1/T2). **Escalation: E1 (§9.9).**

### 9.6 Hypotheses (a2) and (c)

**(a2) Decision readability — D3 schedule only.** Run only if the §9.1 BUT names a switch+door level and
an opposite-colour-portal level inside L1–L6; otherwise record `NOT TESTABLE ON THIS BUILD`.

| # | Metric | Threshold | n | Fails when |
|---|---|---|---|---|
| a2-1 | **CM-D** (verbatim, right after the door level): "What made that door open / close?" | **≥ 3/5** answer with the *switch/step* causality — not "proximity", "random", "timer", "don't know" | P = 5 | ≤ 2/5 |
| a2-2 | **CM-GL Causal Glance**: within 3 s of first stepping on a switch, the participant looks at / points at / mentions the door | **≥ 3/5**, unprompted | P = 5 | ≤ 2/5 |
| a2-3 | **CM-P** (right after the portal level): "Why did you end up there?" | **≥ 3/5** mention the portal / entry side, and **≤ 1/5** call it random | P = 5 | either bound broken |
| a2-4 | **P-probe** (paused mid-level, no explanation): "Can you step onto this tile? Why?" × 4 tiles (2 legal / 2 solid) | **≥ 80 % per participant**, and **≥ 4/5** participants reach 80 % | P = 5 | ≤ 3/5 — this is the *live* twin of §3.3 test 5 |
| a2-5 | **C7 + C8** per participant | **≤ 1**, and **no participant ≥ 3** | P = 5 | ceiling broken |

**Verdict:** (a2) PASSES iff a2-1 … a2-5 all pass. Exactly 3/5 ⇒ `MARGINAL`. **Escalation: E2.**
**Interpretation guard:** an (a2) failure is a **level-arrangement / D3-scheduling** failure, *not*
evidence against Option B's legality rule, and must not be reported as such.

**(c) Planning reads as depth, not chaos or a memory test** (operationalises `game-design.md` §13 A2,
whose stated test "Mistake Rate + Retry Rate" was too vague to falsify).

| # | Metric | Threshold | n | Fails when |
|---|---|---|---|---|
| c-1 | **D1** (verbatim, after L5): "Did the game feel like it was asking you to **think ahead**, to **remember things**, or **neither**?" | **≥ 3/5** "think ahead" | P = 5 | ≤ 2/5, or ≥ 2/5 say "remember" |
| c-2 | **C5** "I have to remember / count my steps" | **≤ 1/5** | P = 5 | ≥ 2/5 |
| c-3 | **M4b distribution**: refusals followed by **R2** (looks at / names the cause) or **R3** (different legal move) | **≥ 60 %** of all refusals | pooled over P | < 60 % — the refusal is not being used as information |
| c-4 | **M4b R6** ("it's broken" / "it didn't register" / taps chrome) | **≤ 1 event per participant** | P = 5 | ≥ 2 for any participant — a §6.5 bug, not a polish item |
| c-5 | **M5 Restarts** | mean **≤ 1.0** per level per participant, and no level with ≥ 3 restarts from ≥ 2 participants | P = 5 | ceiling broken |
| c-6 | **M6 Undos** | mean **≤ 2.0** per level; flag the tail if mean > 6 (thrash) *or* ≈ 0 with M14 dwell > 8 s (fear) | P = 5 | mean > 6 |
| c-7 | **M4 Refusals** | mean **≤ 3** per level per participant | P = 5 | mean > 3 |
| c-8 | **Δmoves vs Solver `par`**, L3–L6 | median **≤ +3** | P = 5 | median > +3 |
| c-9 | **M13 GAR** pooled (ghost avoidance = readability failure) | **≤ 20 %**, and **≤ 1/5** participants with GAR ≥ 50 % | pooled GOs / P = 5 | either bound broken |
| c-10 | **V-CL** (§6.2a trigger, after L2): "Why did the world change?" | **≥ 4/5** "because I moved" | P = 5 | ≤ 3/5 ⇒ **switch to Variant CL** (pre-committed UI action, one timing table — not a design debate) |

**Verdict:** (c) PASSES iff c-1 … c-10 all pass. **Escalation: E3.**
Report the **error direction split** of M13 (G2/G3/G5 = ghost read as blocking vs G4 = solid read as
ghost): the two directions have opposite fixes (`ui-ux` R9), and one pooled number hides which one broke.

### 9.7 Prototype Definition of Done gate + the only permitted help channel

| # | DoD metric | Threshold | n |
|---|---|---|---|
| D-1 | **Understand without explanation:** zero **H2/H3** through L1–L5 **and** CM1 correct (flip-on-move + phase-dependent passability) **and** CM2 correct ("nothing moves and the world doesn't change") | **≥ 4/5** | P = 5 |
| D-2 | **Wants Level 6:** CI-self **≥ 4** **and** CI-beh = sought the next level inside the 15 s no-prompt window after the L5 win | **≥ 3/5** | P = 5 |
| D-3 | **Quit before L5** | **≤ 1/5** | P = 5 |
| D-4 | **M1 Understand Time**, L1 | median **≤ 30 s** (assumption A1) | P = 5 |
| D-5 | **M2 First Win Time**, L1 | median **≤ 60 s** — *analyst-set provisional threshold, no prior data exists; pre-registered so it cannot be moved post hoc, and explicitly flagged for re-calibration after the first cohort* | P = 5 |

Exactly 4/5 or exactly 3/5 ⇒ `MARGINAL` (T1). **A DoD failure is a hard stop: Stage 3 is blocked**
(E4) — "do not hide the problem behind 45 more levels" (`game-design.md` §12).

**Intervention ladder — the only help that exists. No hint button, no tutorial popup, no explanatory
text may be added to L1–L5 to lift these numbers** (text budget ≤ 1 hint line in L1–L3,
`level-design.md` §2). Every rung is scored against the participant:

| Rung | Trigger | Moderator says (verbatim) | Cost |
|---|---|---|---|
| **H0** | default | *(silence)* | — |
| **H1** | 20 s with no input, or 3 consecutive refusals | "Take your time — you can restart or undo whenever you want." | stall event recorded, **0 hints** |
| **H2** | a further 30 s, or an explicit request for help | "Look at what changes when you move." | **1 hint** ⇒ the level is excluded from D-1 |
| **H3** | the participant says they want to stop, or 90 s total stall on one level | "Do you want me to show you one move?" — if yes, demonstrate **exactly one** move | session marked **assisted**; the level is excluded from D-1 and from (a1)/(a2)/(c) thresholds for that participant |
| **H4** | the participant quits | *(thank them, stop the recording)* | M12 Quit Level recorded; **no persuasion** |

### 9.8 Minimal executable test script (5 non-developers · L1–L6 · paper + mobile browser · no server, no telemetry, no instrumentation)

**YAGNI boundary:** nothing may be added to the build for this test — no analytics, no event bus, no
server, no logging code. All data comes from a phone screen recording + a stopwatch + the printed
Table A–F sheets. The only build-side requirement is the §9.1 BUT itself.

**Timing points** (all read from the recording at 0.1 s):

| Point | Event | Feeds |
|---|---|---|
| **T0** | board visible / level rendered | M1, M2, M3 |
| **T1** | first intentional legal move | M1 = T1−T0 |
| **T2** | level win frame | M2 = T2−T1, M3 |
| **T3** | spontaneous correct rule statement (**never prompted**; time + verbatim) | M16 |
| **Te0 → Te1** | flip resolution of an embed event → next legal move | **M14**, M15 window |
| **Tr0 → Tr1** | refusal frame → next input | M4b coding |
| **Tf0 → Tf1** | freeze (≥ 5 s no input, eyes on board) | M9 trigger |
| **Tw** | L5 win → end of the **15 s no-prompt** window | M11 CI-beh |
| **Tq** | participant stops | M12 |

**Run sheet — Cohort P (≈ 25 min):**

1. **Consent + header** (Table A). Read verbatim: *"We are testing the game, not you. There is no score
   and no right answer. You can stop at any time, and stopping is useful information for us. I will not
   explain how it works — if you ask, all I can say is 'take your time'. May I record the screen and your
   voice? Your face is not recorded."*
2. Hand over the device already sitting on L1. Start recording, start the stopwatch. Say only: *"Here you go."*
3. **Silent observation L1 → L5.** Tally Table B live. Intervene only via the §9.7 ladder.
4. **After the L2 win** → ask **V-CL** verbatim, record, move on.
5. **Mid-level P-probe** at the BUT's pre-marked state: pause, point, ask the 4 tile questions, resume.
6. **After the L5 win** → **show no Next control.** Start **Tw** (15 s). Observe and code CI-beh.
   Then ask **CM1, CM2, CM3, D1, CI-self** — verbatim strings are canonical in **Table C**.
7. **L6 (the forced-embed level)** → when the embed event happens, **do not intervene**; code Te0/Te1,
   M15, C3. Only after the level is finished may you ask **V8b**: *"Is the player inside that wall a bug,
   or part of the game?"* — and note that a P-cohort answer is **not** the §3.3 fresh-viewer test
   (notes §3 cohort rule).
8. **D3 levels only** (switch+door, then portal) → **CM-D, CM-GL** right after the door level; **CM-P**
   right after the portal level.
9. Thank them, stop recording, complete Table A's footer (Aha Moment, Quit Level, script deviations).

**Run sheet — Cohort V (≈ 8 min each, different people, screenshots only, no interaction):**
show the frozen frames in the Table E fixed random order and ask the verbatim items —
**V5** "which cells block entry right now?" (both phases; the correct answer set is the **currently-solid
walls only** — a ghost is a legal destination and must not be scored as blocked) · **V6** the 10-tile
sorting sheet in colour / desaturated / CVD, sampling per notes §3.1 · **V7a/V7b** on a post-refusal
frame: point at the cause, and "did the phase flip?" · **V8a/V8b** on the embed frame, both phases.

**Paper-prototype variant (only for the paper-valid rows of §9.1):** print each level's grid at ~48 px
cells, one coin = player, filled blocks = current-phase walls, hollow outlines = ghosts, a two-sided
A/B card = phase. The moderator flips the card **after every legal move** and never explains why.
Label every resulting row `paper`; leave M13/M14/M15/V-CL/(a1) cells as `—` with the reason
`not paper-valid`.

### 9.9 Verdicts and escalation paths (ADR-0008: **no silent revert — bring evidence to the human**)

| Verdict | Meaning | Action |
|---|---|---|
| **V1 PASS** | DoD + (a1) + (c) pass; (a2) passes on the D3 build | ADR-0008's Stage-2 gate **closes**; Playtest Analyst signs §10; proceed to Stage 3. The §3.3 **art** gate stays open until GATE A art lands and §3.3 is re-run (R-P7). |
| **V2 PARTIAL / MARGINAL** | ≥ 2 marginal hypotheses, or DoD marginal + one marginal hypothesis (T5) | Gate **does not close**. Re-run only the marginal sub-tests with a **fresh** cohort of 5, then re-report. |
| **V3 FAIL (a1)** | the embedded state cannot be made to read | **E1** → UI / Art Director with the failing sub-metric. The fix must live **inside** the R-E / R-E2a bands (`ui-ux` §6.5) — never a bigger nudge, flash, sting or text. Re-run §3.3 test 8 + M14/M15 with a fresh cohort. **If it fails twice**, the Analyst writes an escalation to the **human** stating that Option B's clause 3 has no readable presentation, with the tables attached — **the human**, not any agent, decides whether that means a presentation exception or a rule revisit. |
| **V4 FAIL (a2)** | the causal model does not form on the D3 build | **E2** → Game Designer + Level AI + Solver with per-level data. This is an **authoring/arrangement** defect. If (a2) also fails on the re-scheduled build, escalate to the **human at GATE D** with the player evidence: no M0/M1/M2 arrangement produced readable depth. |
| **V5 FAIL DoD** | < 4/5 understand, or < 3/5 want L6, or ≥ 2/5 quit | **E4 hard stop.** Stage 3 blocked. Orchestrator escalates to the human with Table D + all verbatims. No level-count increase, no text additions and no threshold edits as a remedy. |
| **(c) FAIL** | planning reads as chaos or as a memory test | **E3** → Game Designer: difficulty model / dip rule (`game-design.md` §11, `level-design.md` §6). First resort is level *arrangement*, not explanation; if the only fix would exceed the ≤ 1-hint-line text budget, that is itself an escalation to the human. |

**Absolute:** no agent reverts, softens or re-scopes ADR-0008 on the strength of this data. Every
escalation carries the raw tables (A–F) and the verbatim quotes. **A verdict without its tables is void.**

### 9.10 Anti-fabrication rules (this section is the reason §9 exists)

1. **No number in this file may be written before its Table B/C row exists.** §6, §7 and §10 stay empty
   until then — an empty log is honest; a filled one is not.
2. **Never back-fill from memory.** Unfilled cells stay `—` and are reported as missing (T9).
3. **A threshold may not be moved after the BUT table is committed** (T6).
4. **`NOT TESTABLE` is a legal, reportable outcome** — used for (a2) until GATE D lands, for (a1) if no
   level forces the embed, and for §3.3 if no fresh Cohort V exists. It is never silently upgraded to PASS.
5. **Every screenshot-derived conclusion carries the `placeholder art` label** (R-P7); no claim about the
   final art's readability may be made from this round.
6. **The Analyst may not substitute their own reading of "this level is fun" for cohort data.** Opinion
   is allowed in §10 only inside a clearly marked `ANALYST OPINION — NOT DATA` line.

### 9.11 Cross-reference to `ui-ux.md` §3.3 (one acceptance, not two)

| §3.3 | Cohort **V** static probe | Cohort **P** live twin | Precedence |
|---|---|---|---|
| **test 5** wall/path parse ≥ 90 % | **V5** | **M13 GAR** + **P-probe** (a2-4) | both required; test 5 proves the axis is *perceivable*, GAR proves it is *used under motion*. Test 5 can pass while GAR fails ⇒ R9 stays **open**. |
| **test 6** ghost vs solid ≥ 8/10 (desat + CVD) | **V6** | **M4b R1/R6** + **GAR G2/G3/G5** | both required, error **direction** reported separately (opposite fixes). |
| **test 7** refusal feedback (a)+(b) | **V7a / V7b** | **M4 / M4b / C4** | V7 gates §3.3; the live distribution gates (c). A V7 pass with R6 ≥ 2 still **fails `ui-ux` §6.5**. |
| **test 8** player-in-wall (a)+(b) | **V8a / V8b** | **M14 / M15 / C3** | **(a1) requires both sides** — test 8 is a still image and cannot see the 140–220 ms occupied-resolution beat or a looping-ring violation (R-C13.4). |
| §6.2a **Variant CL** trigger | — | **V-CL** after L2 (c-10) | < 4/5 "because I moved" ⇒ switch to Variant CL; recording duty is the Playtest Analyst's (`ui-ux.md:452`). |

**test 6 sampling trap — normative rule in notes §3.1** (9 mandatory conditions). Summary: "sort 10 wall
tiles" passes **trivially** if all 10 are the same class, and *spuriously* if hue, ground or source level
alone predicts the label. Mandatory: **exactly 5 solid + 5 ghost** (never below 4/4) · **both phases** ·
**≥ 2 levels** · **no two tiles adjacent** · crops include the real ground with **≥ 3 `cell` + ≥ 3
`cellAlt`** · **degeneracy check** — reject and redraw the sheet if any single attribute is 100 %
predictive · fixed randomised order + recorded seed · 3 conditions × 5 viewers · **each viewer ≥ 8/10 on
desat and on CVD, cohort mean ≥ 9.0/10, ≤ 2 viewers exactly at 8** (3 ⇒ MARGINAL).

## 10. Stage 2 verdict record

_(empty — written by the Playtest Analyst **after** coding, in this order: BUT id + commit → valid
sessions → Table D → per-hypothesis verdict with MARGINAL flags → round verdict V1–V5 → escalations
opened → attached table paths. A verdict recorded before its tables exist is void, §9.10.)_

| Field | Value |
|---|---|
| Round · date · BUT commit | — |
| Valid sessions (P / V) | — |
| DoD verdict | — |
| (a1) verdict | — |
| (c) verdict | — |
| (a2) verdict | — |
| Round verdict (V1–V5) | — |
| Escalations opened | — |
| Tables attached | — |
| Silent revert performed? (**must be NO**) | — |
