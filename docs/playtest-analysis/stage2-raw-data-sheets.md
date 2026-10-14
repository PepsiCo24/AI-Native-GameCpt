# Stage 2 — raw data sheets (printable templates)

> Owner: **Playtest Analyst** · V0.1 · 2026-10-14 · **ALL TEMPLATES EMPTY — NO DATA EXISTS.**
> Canonical templates. `docs/playtest-log.md` §9 references them by ID; the coding manual is
> `stage2-adr0008-gated-protocol-notes.md` §2. Print one Table A + B + C per participant,
> one Table D per session, one Table E per §3.3 sheet, one Table F per round.
> **Never back-fill a cell from memory the next day.** An unfilled cell stays `—` and is reported as
> missing. Missing data is a finding; invented data is a protocol violation.

---

## Table A — Participant & session header (one per participant)

| Field | Value |
|---|---|
| Participant ID (P1…P5 / PR1…PR3 replacement / V1…V5) | |
| Cohort (P = player / V = fresh viewer) | |
| Date · start · end (wall clock) | |
| Device · browser · viewport width (px) | |
| Build Under Test id + commit (from §9.1 BUT table) | |
| Art status (**must read `placeholder art`**) | |
| Non-developer attestation (never read `src/**`, never in this project) | ☐ |
| Prior exposure to this game / repo / docs (must be **no**) | ☐ |
| Self-report: plays grid/puzzle games? (need ≥ 1 "no" in the cohort) | |
| Self-report colour vision (record, do **not** exclude; note if CVD) | |
| Screen recording consent granted (screen + hands + audio) | ☐ |
| Moderator (must not have authored the level under test) | |
| Observer / timekeeper | |
| Second coder (for the ≥ 2/5 inter-rater sample) | |
| Script deviations on scored items (list, or "none") | |
| Session validity: VALID / INVALID + reason | |
| **Quit Level** (or "none") | |
| Aha Moment: level · move index · verbatim quote (or "none observed") | |

## Table B — Per-level sheet (one row per level per participant; Cohort P)

| Field | L1 | L2 | L3 | L4 | L5 | L6 |
|---|---|---|---|---|---|---|
| T0 board visible (mm:ss.s) | | | | | | |
| T1 first intentional legal move (mm:ss.s) | | | | | | |
| **Understand Time** = T1−T0 (s) | | | | | | |
| T2 level won (mm:ss.s) | | | | | | |
| **First Win Time** this level (s) | | | | | | |
| **Level Completion Time** (s) | | | | | | |
| Moves used / **par (Solver-proved)** / Δ | | | | | | |
| **Refusal count** (M4) | | | | | | |
| Post-refusal codes (M4b: R1/R2/R3/R4/R5/R6 tallies) | | | | | | |
| **Restart count** (M5) | | | | | | |
| **Undo count** (M6) | | | | | | |
| **Misclick count** (M8 / C9) | | | | | | |
| Ghost Opportunities (GO) count | | | | | | |
| Ghost codes G1/G2/G3/G4/G5 tallies | | | | | | |
| **GAR** = (G2+G3+G4+G5)/GO | | | | | | |
| Key-Ghost Coverage (M13b): crossed a formerly-refusing tile? Y/N | | | | | | |
| Embedded events count | | | | | | |
| **M14 dwell** per event (s) | | | | | | |
| **M15 flail** per event (Y/N) | | | | | | |
| Hints: H1 stalls / H2 / H3 (assisted ⇒ level excluded from DoD) | | | | | | |
| Confusion flags (C1…C9 + mm:ss + verbatim) | | | | | | |
| Freeze events (≥ 5 s, count) | | | | | | |
| Spontaneous correct rule statement? (time + verbatim, never prompted) | | | | | | |

## Table C — Post-L5 / post-L6 probes (verbatim answers only; never paraphrase)

| # | Asked after | Verbatim question (read exactly) | Answer (verbatim) | Coded |
|---|---|---|---|---|
| V-CL | L2 win | "Why did the world change?" | | ☐ because I moved ☐ automatic/timer ☐ don't know |
| P-probe | mid-L4 (paused) | "Can you step onto this tile? Why?" ×4 tiles (2 legal / 2 solid) | | correct ___ / 4 |
| CM1 | L5 win | "In your own words, what is the rule of this game?" | | ☐ flip-on-move ☐ phase-dependent passability |
| CM2 | L5 win | "If you tap a wall that is solid right now, what happens?" | | ☐ nothing moves, world doesn't change ☐ other |
| CM3 | L5 win | "Why can you sometimes walk onto a tile that looked like a wall?" | | ☐ when/which step I arrive ☐ other ☐ n/a |
| CM-D | after door level | "What made that door open / close?" | | ☐ my step on the switch ☐ proximity ☐ random ☐ don't know |
| CM-P | after portal level | "Why did you end up there?" | | ☐ portal/entry side ☐ random ☐ don't know |
| CM-GL | after door level | Causal Glance: looked at / pointed at / mentioned the door within 3 s of the switch? | | ☐ Y ☐ N |
| D1 | L5 win | "Did the game feel like it was asking you to **think ahead**, to **remember things**, or **neither**?" | | ☐ ahead ☐ remember ☐ neither |
| CI-beh | L5 win, **no Next prompt shown**, 15 s window | (observed) looked for / tapped a next control, asked "is there more?", reached for the device | | ☐ sought ☐ passive |
| CI-self | after CI-beh | "On a scale of 1 to 5, how much do you want to play Level 6 right now?" | | 1 2 3 4 5 |
| V8b | embed frame (Cohort V **or** end of P session — see §3 cohort rule) | "Is the player inside that wall a **bug**, or **part of the game**?" | | ☐ part of the game ☐ bug ☐ unsure |

> **Prohibited phrasings** (leading): "did you *get* the phase trick?", "wasn't it clever how the wall
> opened?", "you *can* walk in there, see?", any question containing the words parity / ghost / echo /
> phase-wall before the participant has used them first. If the moderator improvises, mark the row
> `SCRIPT DEVIATION` and exclude it from scoring.

## Table D — Cohort roll-up (fill only after all 5 P sessions are coded)

| Metric | P1 | P2 | P3 | P4 | P5 | Statistic | Threshold | Verdict |
|---|---|---|---|---|---|---|---|---|
| Understand Time L1 (s) | | | | | | median | ≤ 30 (A1) | |
| First Win Time L1 (s) | | | | | | median | ≤ 60 (provisional) | |
| Understand (CM1+CM2, zero H2/H3 through L5) | | | | | | count /5 | ≥ 4/5 | |
| V-CL "because I moved" | | | | | | count /5 | ≥ 4/5 | |
| GAR (pooled over GOs) | | | | | | pooled % | ≤ 20 % | |
| Participants with GAR ≥ 50 % | | | | | | count /5 | ≤ 1/5 | |
| Key-Ghost Coverage (embed level) | | | | | | count /5 | ≥ 4/5 | |
| M14 dwell (s) | | | | | | median / p90 | ≤ 3.0 / ≤ 8.0 | |
| M15 flail events / embed events | | | | | | ratio | ≤ 1/5 of events | |
| C3 "stuck/trapped/broken" | | | | | | count /5 | ≤ 1/5 | |
| Refusals per level | | | | | | mean | ≤ 3 | |
| R2+R3 share of refusals | | | | | | % | ≥ 60 % | |
| R6 events | | | | | | max per participant | ≤ 1 | |
| Restarts per level | | | | | | mean | ≤ 1.0 | |
| Undo per level | | | | | | mean (flag > 6) | ≤ 2.0 | |
| Δmoves vs par, L3–L6 | | | | | | median | ≤ +3 | |
| C5 "remember/count" | | | | | | count /5 | ≤ 1/5 | |
| P-probe accuracy | | | | | | ≥ 80 % per participant | ≥ 4/5 | |
| CM-D door causality | | | | | | count /5 | ≥ 3/5 | |
| CM-P portal | | | | | | count /5 | ≥ 3/5 | |
| Causal Glance (CM-GL) | | | | | | count /5 | ≥ 3/5 | |
| D1 "think ahead" | | | | | | count /5 | ≥ 3/5 | |
| C7+C8 per participant | | | | | | max | ≤ 1 (no participant ≥ 3) | |
| Continue Intent (CI-self ≥ 4 **and** CI-beh sought) | | | | | | count /5 | ≥ 3/5 | |
| Quit before L5 | | | | | | count /5 | ≤ 1/5 | |
| Aha Moment level index | | | | | | list | recorded, no threshold | |
| Inter-rater agreement per code | | | | | | % | ≥ 70 % else code discarded | |

## Table E — §3.3 viewer sheet log (Cohort V; one per test per viewer)

| Field | Value |
|---|---|
| Test (V5 / V6-colour / V6-desat / V6-CVD-protan / -deutan / -tritan / V7a / V7b / V8a / V8b) | |
| Source level(s) · phase(s) · screenshot timestamp | |
| Art status (`placeholder art`) | |
| Viewer ID (V1…V5) — **must not be a Cohort P participant** | |
| Sampling: 5 solid + 5 ghost? (V6 only) | ☐ |
| Sampling: ≥ 2 levels · both phases · no two tiles adjacent · ≥ 3 cell + ≥ 3 cellAlt grounds | ☐ |
| **Degeneracy check**: hue / ground / level each < 100 % predictive of label (else sheet rejected) | ☐ pass ☐ rejected + redrawn |
| Randomised presentation order + seed | |
| Score | /10 or /5 or Y/N |
| Error direction (ghost→solid / solid→ghost) | |
| Latency for the <1 s items (locate player; locate player in wall) | |

## Table F — Round verdict & escalation record (one per round; written before any fix is made)

| Field | Value |
|---|---|
| Round id · date · BUT commit | |
| Valid sessions (P / V) | |
| Replacements used (cap 3) | |
| Per-hypothesis verdict: (a1) / (a2) / (c) / DoD — PASS · PASS-MARGINAL · FAIL · NOT TESTABLE | |
| Count of MARGINAL sub-metrics (≥ 2 ⇒ round verdict MARGINAL) | |
| Overall Stage-2 verdict (V1…V5 per §9.9) | |
| Tables attached (A–F) — **a verdict without tables is void** | |
| Escalation opened? (E1 UI / E2 level-design+GATE D / E3 design difficulty / E4 DoD hard stop) | |
| Evidence handed to the human (paths) | |
| Silent revert performed? (**must be NO — ADR-0008 forbids it**) | |
| §3.3 art gate status (open until GATE A art + re-run) | |
