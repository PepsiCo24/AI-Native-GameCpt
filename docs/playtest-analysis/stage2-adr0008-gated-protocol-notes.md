# Stage 2 — ADR-0008 / GATE D verification protocol · Analyst notes

> Owner: **Playtest Analyst** · Version V0.1 · Date: 2026-10-14
> Status: **PRE-REGISTERED, NOT RUN.** Zero sessions, zero participants, zero numbers exist.
> Normative protocol (thresholds, verdicts, escalation) lives in `docs/playtest-log.md` §9.
> This file is **subordinate** to §9: it holds the *reasoning*, the *coding manual* and the
> *mapping to `ui-ux.md` §3.3*. Printable data sheets: `stage2-raw-data-sheets.md`.
> **Standing evidence label (ui-ux R-P7):** every Stage-2 build is program-drawn vector tokens =
> `placeholder art`. No conclusion about the *final* art's readability may be drawn from this round;
> §3.3 is re-run after GATE A integration.

---

## 1. Why hypothesis (a) had to be split — the replacement record

ADR-0008 Consequences, last bullet, mandates Stage 2 verification of three hypotheses:

| ADR-0008 wording | Status at PA-002 | Replacement |
|---|---|---|
| **(a)** players discover "enter the echo / parity opens walls" within L3–L5 without text | **UNTESTABLE as written** — see §1.1 | split into **(a1)** and **(a2)** |
| **(b)** embedded states read as "safe — walk out", not as a bug | testable | **absorbed into (a1)** — same observable object, one gate instead of two |
| **(c)** parity planning reads as depth, not chaos or a memory test (A2) | testable, but A2's stated test ("Mistake Rate + Retry Rate") is not operational | **retained as (c)** with the operational metric set in `playtest-log.md` §9.6 |

### 1.1 (a) has no discoverable object on M0-only content — program-proven, not opinionated

GATE D (`docs/project-status.md`, proven three independent ways: GAME-001 analytic + 200-board sweep,
LV-001R 4000 random levels, Orchestrator BFS driving the shipped `applyMove` on 400 boards) and
the exhaustive 880,640-configuration check behind RV-002 established:

> On a 4-connected grid where every legal move flips the phase and a refusal costs no move,
> **the phase in which a tile is entered is a function of the tile alone.** A detour adds 2 moves,
> never 1. Therefore an M0 wall is either a **permanent obstacle** or **permanently passable
> decoration**, and **no tile can ever be "refused first, then entered later."**

ADR-0008 clause 8 ("parity genuinely rewires feasible routes from L1 onward") is **false for
M0-only content**; OQ-1 is **reopened**. Measured on the five shipped levels: `l001`/`l002` 0 dual-phase
tiles (fine, they teach tap→flip), `l003` 1 permanent refusal, `l004`/`l005` **cannot deliver their
lesson**, Aha #1 **does not exist** on M0.

**Consequence for the playtest:** a player in L3–L5 *cannot* discover "parity opens walls", because
under the current rule + M0-only authoring that event never occurs on any board. Running a session
to measure it would produce a guaranteed FAIL that says nothing about Option B and everything about
the level plan — and would invite the wrong fix (revert a human-approved core rule) for a
level-authoring cause. **(a) is therefore withdrawn as a playtest hypothesis and re-filed as a
GATE D authoring/solver question, which is a program matter, not a human-perception matter.**

### 1.2 What Option B actually added that a player can perceive — (a1)

Option B's rule 3 (standing inside a flipped-in wall is legal, never crushed/pushed/moved) creates a
**new visible state that did not exist under ADR-0006**: the *embedded player*. This state **is**
reachable on the current M0 levels — e.g. `l004`'s `phaseBWalls [[2,0]]` is entered on an odd move
(phase A) and solidifies at the flip; `l005` has two such tiles. It is the only genuinely new
*perceptible* beat Option B shipped, and `ui-ux.md` V0.4 built R-C13 + §3.3 **test 8** +
three new tokens specifically for it. **(a1) tests exactly that, and it is testable today.**

**(a1) Embedded-state readability** — walking into a ghost and having it solidify underfoot must read
as *"I am standing in a wall and I can still walk out"*, never as a clip-through/trapped bug.

### 1.3 Where the original "depth" question can actually be measured — (a2)

The feeling ADR-0008 wanted from (a) — *"my decisions rewire the board"* — needs an object whose
passability genuinely depends on player action. GATE D measured which mechanics can supply one:

| Mechanic | Dual-phase tiles (LV-001R, 4000 random levels × mixes) |
|---|---|
| M0 walls only | **0** |
| M1 doors only | **0** |
| M3 switch + door | **231 / 500** |
| M2 portal (**opposite checkerboard colours** only) | **233 / 500** |

The **D3 schedule** = switch+door pairs moved forward into the teaching ladder, opposite-colour-end
portals immediately after. Under D3 a player can, for the first time, truthfully say
*"the thing I stepped on changed that door"* or *"which side I came in from decides whether this tile
accepts me"*. **(a2) Decision readability** measures whether they actually say it — unprompted — and
whether they can plan with it.

> **Precondition, stated honestly:** D3 is one of the options escalated to the human at **GATE D and
> is not yet decided.** Until the decision lands and Level AI ships the re-scheduled L1–L6 with Solver
> proof, **(a2) is NOT RUN and must be recorded as `NOT TESTABLE ON THIS BUILD`** — never as a pass,
> never as a fail. (a1), (c) and the DoD gate are runnable on the current build.

### 1.4 Why (b) is folded into (a1)

(b) ("reads as safe, walk out") and (a1) ("reads as part of the game, not a bug") are the same
observable object — the embedded player — probed with two questions that cannot disagree without one
of them being badly worded. Two gates on one object invites the failure mode where test 8(b) passes
and someone still calls (b) failed. One gate, four sub-metrics (still-image probe ×2 + live behaviour ×2).

---

## 2. Coding manual

### 2.1 Confusion-flag taxonomy (metric M9)

A **confusion flag** is recorded when ANY of these occurs, and is timestamped to `(level, move index)`:

- an unprompted verbalization of a wrong or absent model;
- an audible "huh?" / "wait" / laugh-of-disorientation;
- a **freeze**: ≥ 5 s with no input while the participant is looking at the board;
- an explicit request for help (also counts as hint H2).

Only the codes below may be used. Free-text goes in the `verbatim` column, never in the code column.
A flag with no code is discarded (uncodable), and the discard is counted.

| Code | Meaning | Points at |
|---|---|---|
| **C1** | "which tiles can I actually walk on?" | solid↔ghost axis · `ui-ux` R-C2 / R9, §3.3 tests 5–6 |
| **C2** | "why did the world change?" / attributes the flip to a timer or to nothing | causality · §6.2a **Variant CL trigger** |
| **C3** | "am I stuck / trapped / is this broken?" while embedded | **R-C13 / hypothesis (a1)** |
| **C4** | "why didn't that move work?" after a refusal | refusal legibility · §3.3 test 7 |
| **C5** | "I have to remember / count my steps" | **A2 / hypothesis (c)** — the memory-test failure |
| **C6** | "where am I supposed to go? what's the goal?" | goal/HUD salience |
| **C7** | "the door didn't do what I expected" | **switch→door causality / (a2)** |
| **C8** | "that teleport was random" | **portal / (a2)** |
| **C9** | mis-tap: touched the wrong tile / edge / off-board (input, not comprehension) | touch targets · R-T5/R-T6, metric M8 |

**Rule:** C9 is *never* counted toward a comprehension threshold. A participant whose only flags are
C9 has not failed to understand — they have been failed by the layout. Report it to the
UI / Art Director, not to the Game Designer.

### 2.2 Post-refusal behaviour codes (metric M4b)

Coded from the first action after a refusal (a refusal = no movement **and** no phase flip):

| Code | Behaviour | Reading |
|---|---|---|
| **R1** | immediately re-taps the *same* refused tile | refusal not understood as information (blind retry) |
| **R2** | looks at / points at / names the tile that caused it, or says "oh, that one" | **refusal worked as tutorial** |
| **R3** | takes a *different* legal move within 3 s | refusal worked as information |
| **R4** | restarts | cost-bearing reset |
| **R5** | undoes | experimentation (healthy in small numbers) |
| **R6** | says "it's broken" / "it didn't register" / looks at the moderator / tries to tap UI chrome | **refusal read as input failure — a bug, `ui-ux` §6.5** |

Depth reading for (c): **R2+R3 ≥ 60 %** of all refusals, and **R6 ≤ 1 event per participant**.
R1 clusters (> 2 in a row on the same tile) are recorded separately as a *stall*, not as depth.

### 2.3 Ghost-opportunity and ghost-avoidance (metric M13)

A **Ghost Opportunity (GO)** is a decision point where (i) at least one adjacent tile is a ghost
(other-phase wall = legal destination under Option B), and (ii) at least one *different* legal move
also exists — a forced ghost step carries no information and is **not** counted.

Per GO, code the participant's next action:

| Code | Action | Counts as avoidance? |
|---|---|---|
| **G1** | steps onto a ghost tile | no |
| **G2** | takes the non-ghost legal alternative, and never steps on that ghost in this attempt | **yes** |
| **G3** | freezes ≥ 3 s facing the ghost, then does something else | **yes** |
| **G4** | taps a currently-solid tile (refusal) | **yes** — the *inverted* misread (`ui-ux` R9) |
| **G5** | verbalizes "I can't go there" / "that's a wall" about a ghost | **yes**, and also flag **C1** |

**M13 Ghost Avoidance Rate = (G2+G3+G4+G5) / GO.** Both misread directions are failures and are
reported separately: G2/G3/G5 = *ghost read as blocking* (player avoids legal moves); G4 = *solid
read as ghost* (player taps into refusals). A cohort can fail M13 while §3.3 test 5 passes — see §3.

**Key-Ghost Coverage (M13b, the Aha-side twin):** in the winning attempt of each level whose par route
crosses a tile that was solid when the participant first saw it, did they actually cross it?
`≥ 4/5` participants must cross ≥ 1 such tile in the embed level without H2/H3. A pure walk-around
teaches nothing (`level-design.md` §3 requirement 3).

### 2.4 Embedded-event window (metrics M14 / M15)

Window opens at **flip resolution** (the frame the occupied tile shows `obj.wallOccupied` + the
one-shot `fx.phaseRing`) and closes at the participant's **next legal move**.

- **M14 Embedded Dwell** = window length, seconds, from screen recording (0.1 s resolution).
- **M15 Embed Flail** = inside the window, any of: ≥ 2 taps that produce refusals, ≥ 2 repeat taps on
  the participant's own tile or on the board edge, restart or undo within 3 s of landing,
  or a **C3** verbalization. One flail event per window maximum.
- A window is **excluded** if an H2/H3 hint landed inside it (contaminated), and the exclusion is
  counted. Excluded windows never count toward the pass side.

### 2.5 Inter-rater procedure (because flags are subjective)

1. Screen-record every session (consent script, Table A row `consent`). Screen + hands only; no face
   required; audio on, because verbalizations *are* the data.
2. Playtest Analyst codes 100 % of sessions from the recording.
3. **Second coder** (QA Engineer or Reviewer — read-only roles both) independently codes **≥ 2 of 5**
   sessions using only this manual.
4. Agreement is computed **per code** as `2·agree / (nA + nB)` on event counts. **< 70 % on a code ⇒
   that code is DISCARDED for the round and its threshold is reported as `NOT MEASURED`** — never
   averaged, never adjudicated by the protocol owner alone.
5. Disagreements on *retained* codes are resolved by re-watching, and the resolution is logged with
   the timestamp. The Analyst may not resolve a disagreement in the direction that helps a threshold
   without recording it as `DISPUTED` in §10 Findings.

If no recording is permitted, M14/M15 latency thresholds degrade to **±1 s live stopwatch** and every
affected row must carry the label `live-timed`; the verdict then reports that these two metrics are
weaker evidence than the rest.

---

## 3. Mapping to `ui-ux.md` §3.3 — one acceptance, not two

`ui-ux.md` §3.3 is the **art/readability** gate (still images, fresh viewers, no interaction).
This protocol is the **interaction/comprehension** gate (live play, timers, behaviour). They overlap
on three tests. Mapping and precedence:

| `ui-ux` §3.3 | Static probe (Cohort **V**, fresh viewers) | Live twin (Cohort **P**, players) | Precedence rule |
|---|---|---|---|
| **test 5** wall/path parse ≥ 90 % | **V5** — "which cells block entry right now?", both phases, currently-solid only (ghosts are legal) | **M13 GAR** + **V5-live** mid-level planning probe (§9.6) | Both required. V5 alone proves the axis is *perceivable*; GAR proves it is *used under motion*. **test 5 may pass while GAR fails** (static parse ≠ decision under time pressure) — then R9 is **open**, and the fix is inside the R-E bands (§6.5), not a bigger nudge. |
| **test 6** ghost-vs-solid ≥ 8/10, desaturated + CVD | **V6** — 10-tile sorting sheet, sampling rule in §3.1 below | refusal codes **M4b R1/R6** (solid misread as ghost) and **GAR G2/G3/G5** (ghost misread as solid) | Both required, and the **error direction must be reported separately** — the two directions have opposite fixes. |
| **test 7** refusal feedback (a) point at cause ≥ 4/5, (b) "phase did NOT flip" ≥ 4/5 | **V7** on a frozen post-refusal screenshot | **M4** refusal count + **M4b** distribution + **C4** | V7 is the gate for §3.3; the live distribution is the gate for hypothesis (c). A V7 pass with R6 ≥ 2 events is a **FAIL of §6.5** ("a refusal that reads as broken input is a bug"). |
| **test 8** player-in-wall (a) locate < 1 s 5/5, (b) "bug or part of the game?" ≥ 4/5 | **V8** on the embed frame, both phases | **M14** dwell, **M15** flail, **C3** | **Hypothesis (a1) passes only if V8a AND V8b AND M14 AND M15 AND the C3 ceiling all pass.** test 8 is a still image; it cannot see the 140–220 ms occupied-resolution beat (§6.2) or a looping-ring violation (R-C13.4) — the live metrics can. Neither substitutes for the other. |
| §6.2a **Variant CL trigger** — "why did the world change?" after L2, ≥ 4/5 "because I moved" | **V-CL** asked in-session right after L2 (Cohort P; ui-ux §6.2a assigns the recording duty to the Playtest Analyst) | **C2** flags | < 4/5 ⇒ **switch to Variant CL** (one timing table, data not branches). This is a pre-committed UI action, not a design debate. |

Two cohort rules that keep the mapping honest:

- **Cohort V must be different people from Cohort P.** §3.3 says "a fresh viewer … with no
  explanation"; a participant who just played L1–L6 is *not* fresh — they carry the learned model and
  will pass tests 5/6/8 for the wrong reason. Reusing P for V **voids** the §3.3 gate.
- If the human can only recruit 5 people total: run **V first, then exclude those 5 from P** and
  recruit P separately. If that is impossible, record `§3.3 tests NOT RUN — no fresh cohort` and leave
  the art gate **open**. Do not report a contaminated pass.

### 3.1 test 6 sampling rule (the trap and how to close it)

**The trap:** "sort 10 wall tiles into ghost vs solid" passes **trivially** if the 10 tiles are all
ghosts (or all solid) — the viewer can score 10/10 by answering one label for everything, having
discriminated nothing. It also passes *spuriously* if hue, ground or level alone predicts the label,
because then the viewer is sorting by palette, not by the R-C2 fill rule. Chance on a balanced sheet
is 50 %, and 8/10 has a one-viewer tail of ≈ 5.5 % — real but thin.

**Sampling rule (all conditions mandatory; the sampler signs the worksheet in Table E before running):**

1. **Balance:** exactly **5 currently-solid + 5 ghost**. If one board cannot supply 5+5, fill the
   remainder from a second level's screenshot — never by relaxing the balance below **4/4**.
2. **Both phases:** ≥ 5 tiles from Phase A screenshots and ≥ 5 from Phase B, so no single palette
   carries the answer.
3. **≥ 2 levels**, so no single composition carries the answer.
4. **Non-adjacency:** no two sampled tiles may be adjacent (4- or 8-connected) on their source board —
   adjacency lets a viewer reason by cluster/pattern instead of fill rule.
5. **Ground balance:** each crop is the tile **plus its real ground** (±4 px margin), and the set
   contains ≥ 3 `ground.cell` and ≥ 3 `ground.cellAlt` crops, so the checker alternation is not a tell.
6. **Degeneracy check (the actual trap-closer):** before running, the sampler fills a 3-row
   attribute table — `hue family`, `ground`, `source level` × `label` — and **rejects the sheet if any
   single attribute predicts all 10 labels at 100 %**. A rejected sheet is re-drawn, and the rejection
   is recorded.
7. **Fixed random order**, same order for all 5 viewers, seed recorded in Table E.
8. **Three conditions × 5 viewers:** full colour, desaturated (§4.4), CVD-simulated (protan/deutan/
   tritan) = 15 sheets. §3.3 test 6 requires the desaturated + CVD conditions; the colour sheet is the
   control.
9. **Scoring:** each viewer ≥ 8/10 on the desaturated sheet **and** ≥ 8/10 on the CVD sheet;
   cohort mean ≥ 9.0/10; **≤ 2 viewers may sit exactly at 8** (3 at exactly 8 ⇒ MARGINAL).
   Report the **error direction split** (ghost→solid vs solid→ghost) per §3 above.

---

## 4. Statistical honesty at n = 5

n = 5 is the DoD minimum, and it is a **gate, not a measurement**. 4/5 = 80 % has a 95 % Wilson
interval of roughly **44 %–96 %**: this design can detect *gross* failure (nobody understands) and
cannot tune a difficulty curve or rank two variants. Consequences that are binding on the report:

- No Stage-2 number may be quoted as a population estimate, and no difficulty parameter may be
  changed on the strength of one cohort. Parameter changes need the Stage-3 cohort too.
- **n must be ≥ 5 valid sessions.** A session is *invalid* if: interrupted > 5 min; build/device crash;
  the moderator deviated from the script on a scored item; or prior exposure is discovered afterwards.
  Invalid sessions are **replaced by a fresh participant** — never dropped to n = 4, which would
  silently tighten 4/5 into 4/4 = 100 %. Replacement cap **3**; beyond that, stop and report
  `BUILD NOT TESTABLE`.
- Sessions run **individually**. Friends in the same room must not watch each other play: social
  learning would move the Understand metric without moving the design.
- **No incentive that creates compliance pressure.** A participant who wants to stop is thanked and
  their Quit Level is recorded as data. Persuading a quitter to continue corrupts Continue Intent.

## 5. What is *not* allowed to make the test pass

- Adding a hint button, a tutorial popup, a "mechanic discovered" banner or any explanatory text to
  L1–L5 to lift the Understand score. The text budget is **≤ 1 hint line total in L1–L3**
  (`level-design.md` §2); the moderator-side intervention ladder in §9.7 is the *only* help channel,
  and every use of it is scored against the participant.
- Enlarging the refusal nudge, adding a flash, a sting or a scolding animation on the causing wall —
  prohibited by `ui-ux.md` §6.3/§6.5. If V7 or GAR fails, the fix lives **inside** the R-E / R-E2a bands.
- Editing a threshold after the Build-Under-Test table is committed (§9.2 T6).
- Reporting a verdict without the raw tables attached (Table A–F). **A verdict without its tables is void.**
