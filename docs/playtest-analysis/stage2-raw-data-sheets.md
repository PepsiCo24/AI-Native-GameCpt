# Stage 2 — raw data sheets (printable templates)

> Owner: **Playtest Analyst** · V0.3 · 2026-10-15 · **ALL DATA CELLS EMPTY — NO DATA EXISTS (n = 0).**
> The single exception is Table F's **(a′)/(c′) verdict rows, pre-filled with the fixed string
> `NOT TESTABLE ON THIS BUILD`** — a *build property* derived from the committed BUT (`41d5a4b`: no
> door/switch/portal content), not a session result (§9.10.4 makes it a legal reportable outcome).
> V0.3 (PA-005, **committed together with the `playtest-log.md` §9.1 BUT table — T6 applies from that
> commit**): **(1)** **Table C frozen bilingual** — new zh 正式脚本 column (the official field script for
> Chinese-speaking sessions; frozen on commit, **no rewriting during a session** — improvised
> translation on a scored item = `SCRIPT DEVIATION`, T7) beside the en origin column (read it if the
> participant speaks English); rows **`OBS-6`** (scored as (b) **b-7** on L5, §9.5 — PA-005 upgrade)
> and **`H1`/`H2`/`H3`** (the §9.7 ladder lines) added; the V8b zh wording carries an explicit
> anti-leading guard. **(2)** **Table F's verdict row split per hypothesis**, with (a′)/(c′) pre-filled
> (fixed string + release conditions) and (b)/(d′)/DoD left empty until coding. **No threshold, coding
> category or any other cell changed.**
> V0.2 (PA-003): label-only alignment with `playtest-log.md` V0.4 / ADR-0009 decision 8 — Table F's
> hypothesis letters are now **(a′) / (b) / (c′) / (d′)** (V0.3 used (a1)/(a2)/(c); reconcile via the
> §9.1 mapping table in `playtest-log.md`), and Table D's Δmoves row names the M0 stretch. **No cell,
> threshold or verdict value changed.**
> Canonical templates. `docs/playtest-log.md` §9 references them by ID; the coding manual is
> `stage2-adr0008-gated-protocol-notes.md` §2. Print one Table A + B + C per participant,
> one Table D per session, one Table E per §3.3 sheet, one Table F per round.
> **Print-and-fill field instrument for the current L1–L5 build (PA-004, 2026-10-15):**
> `stage2-field-sheet.md` — per-column definitions, code-event mapping and the OBS-1…OBS-10 minimal
> program; it instantiates these tables for the field and never overrides them (Table C governs
> verbatim strings; these tables govern scoring).
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

## Table C — verbatim probes & moderator lines (canonical frozen script · zh 正式脚本 + en origin · read exactly, never paraphrase)

> **Bilingual freeze (PA-005, 2026-10-15 — committed together with the §9.1 BUT table; T6 applies from
> that commit).** Our participants are Chinese speakers; an improvised translation mid-session is a
> script deviation on a scored item (T7 — can void the session). Therefore: the **zh column is the
> official field script** for every session conducted in Chinese, **frozen as of this commit — no
> rewriting during or between sessions**; a participant who speaks English gets the **origin (en)**
> column, verbatim. The zh strings are translations of the en origin, **not a second protocol**: coding
> categories, thresholds and precedence stay governed by `playtest-log.md` §9 + the coding manual
> (notes §2). Rows that are **not read aloud** (CI-beh, CM-GL) are observation items — their cells
> describe what to watch, in both languages, for moderator clarity.
> **Moderator vocabulary ban (§9.3), both columns:** never say 相位 / 奇偶 / 幽灵 / 回响 / 相位墙 (parity /
> ghost / echo / phase-wall) before the participant uses them first.

| # | Asked after / trigger | 正式脚本（zh — 逐字照读） | Origin (en — read exactly in English-speaking sessions) | Answer (verbatim) | Coded |
|---|---|---|---|---|---|
| V-CL | L2 win | 「世界为什么变了？」 | "Why did the world change?" | | ☐ because I moved ☐ automatic/timer ☐ don't know |
| P-probe | mid-L4 (paused) — **`NOT RUN` on the `41d5a4b` build** (§9.1 BUT: not marked; (a′) `NOT TESTABLE`) | 「你能踩到这个格子吗？为什么？」（×4 格：2 可走 / 2 实心） | "Can you step onto this tile? Why?" ×4 tiles (2 legal / 2 solid) | | correct ___ / 4 |
| CM1 | L5 win | 「用你自己的话说，这个游戏的规则是什么？」 | "In your own words, what is the rule of this game?" | | ☐ flip-on-move ☐ phase-dependent passability |
| CM2 | after CM1 | 「如果你点一面现在是实心的墙，会发生什么？」 | "If you tap a wall that is solid right now, what happens?" | | ☐ nothing moves, world doesn't change ☐ other |
| CM3 | after CM2 | 「为什么有时候你能走上一个看起来像墙的格子？」 | "Why can you sometimes walk onto a tile that looked like a wall?" | | ☐ when/which step I arrive ☐ other ☐ n/a |
| CM-D | after door level — **no door level on the `41d5a4b` build** ((a′) `NOT TESTABLE ON THIS BUILD`) | 「是什么让那扇门打开／关上的？」 | "What made that door open / close?" | | ☐ my step on the switch ☐ proximity ☐ random ☐ don't know |
| CM-P | after portal level — **no portal level on the `41d5a4b` build** ((c′) `NOT TESTABLE ON THIS BUILD`) | 「你为什么会到了那边？」 | "Why did you end up there?" | | ☐ portal/entry side ☐ random ☐ don't know |
| CM-GL | after door level | （观察项——不口播）踩上开关后 3 秒内，是否看向／指向／提到那扇门？ | Causal Glance: looked at / pointed at / mentioned the door within 3 s of the switch? | | ☐ Y ☐ N |
| D1 | after CM3 | 「这个游戏给你的感觉：是要你提前想好怎么走，是要你记住一些东西，还是两者都不是？」 | "Did the game feel like it was asking you to **think ahead**, to **remember things**, or **neither**?" | | ☐ ahead ☐ remember ☐ neither |
| CI-beh | L5 win, **no Next prompt shown**, 15 s window (Tw) — nothing is said | （观察项——不口播；窗口内保持沉默）是否在找下一关：四处点按、问「还有吗？」、伸手去拿设备 | (observed) looked for / tapped a next control, asked "is there more?", reached for the device | | ☐ sought ☐ passive |
| CI-self | right after Tw | 「用 1 到 5 分表示，你现在有多想玩第 6 关？」 | "On a scale of 1 to 5, how much do you want to play Level 6 right now?" | | 1 2 3 4 5 |
| OBS-6 | after level end of **any** embed event (L4 offered / L5 forced) — **never** inside an M14 window; on L5: right after Tw, **before CM1** (§9.8 step 6). **Scored as (b) b-7 on L5 only** (§9.5); L4 = context | 「用一句话说：你刚才踩到的那个格子，发生了什么？」 | "In one sentence — what just happened on that tile you stepped on?" | | ☐ SAW ☐ NOT-SEEN ☐ UNCODEABLE (coding rules: §9.5 b-7) |
| V8b | embed frame (Cohort V, scored = b-2) **or** end of P session (after CI-self — context only, notes §3 cohort rule) | 「站在墙里面的那个角色——是游戏出了 bug，还是游戏本来就是这样设计的？」 | "Is the player inside that wall a **bug**, or **part of the game**?" | | ☐ part of the game ☐ bug ☐ unsure |
| H1 | §9.7 ladder rung: 20 s no input, or 3 consecutive refusals | 「慢慢来——想重开（Restart）或撤销（Undo），随时都可以。」 | "Take your time — you can restart or undo whenever you want." | — (stall event recorded, **0 hints**) | H1 tally → Table B |
| H2 | §9.7 ladder rung: a further 30 s, or an explicit request for help | 「看一看：你移动的时候，什么东西变了。」 | "Look at what changes when you move." | — (**1 hint** ⇒ the level is excluded from D-1) | H2 tally → Table B |
| H3 | §9.7 ladder rung: wants to stop, or 90 s total stall on one level | 「要不要我演示一步给你看？」——若同意，只演示**一步** | "Do you want me to show you one move?" — if yes, demonstrate **exactly one** move | — (session marked **assisted**; the level is excluded from D-1 and from (b)/(a′)/(c′)/(d′) thresholds for that participant) | H3 tally → Table B |

> **V8b anti-leading guard (why this exact zh wording — PA-005):** translations of the family
> 「站在墙里的那个是你踩进去的**结果**，还是游戏**坏了**？」 are **rejected and must never be read**:
> 「结果」 smuggles in the game-caused reading (pushes toward "part of the game") and 「坏了」 overweights
> the bug option — both destroy b-2's symmetry. The frozen zh keeps the two options symmetric and
> cause-neutral (「出了 bug」 vs 「本来就是这样设计的」), **bug first**, mirroring the origin's option order.
> **Prohibited phrasings** (leading): "did you *get* the phase trick?", "wasn't it clever how the wall
> opened?", "you *can* walk in there, see?", any question containing the words parity / ghost / echo /
> phase-wall before the participant has used them first — **and their Chinese equivalents** (e.g. never
> add 「是不是因为你踩了它」「你是不是看懂了昼夜的窍门」). If the moderator improvises, mark the row
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
| Δmoves vs par (M0 stretch — L3–L5 on the current build; V0.3 wrote "L3–L6") | | | | | | median | ≤ +3 | |
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
| Verdict — **(a′)** latch readability | **`NOT TESTABLE ON THIS BUILD`** — *pre-filled at BUT commit (PA-005, 2026-10-15), build `41d5a4b`: l001–l005 contain **no door+switch content** (`doors`/`switches` = `[]` in all five — §9.1 BUT rows 2/5). This is a **build property, not a result**: (a′) cannot be scored this round — never a pass, never a fail, never blank, never `0` (§9.10.4). **Release condition (§9.6 run-only-if):** the D3 door+switch set (**L6–L10**, Aha #1 engineered at L8) **ships and passes the Solver gate** (`scripts/solve-levels.ts` PASS + the §3 latch conditions) ⇒ (a′) is scored in a **new round with its own §9.1 BUT row**.* |
| Verdict — **(b)** embedded readability | *(fill after coding only — **n = 0, empty on purpose at commit time**. Runnable on this build: forced instance `l005`, rows **b-1…b-7** §9.5; b-1/b-2 additionally require the frozen screenshot set + a fresh Cohort V — §9.1 last row records `NOT CAPTURED`, §9.4 disjointness)* |
| Verdict — **(c′)** portal readability | **`NOT TESTABLE ON THIS BUILD`** — *pre-filled at BUT commit (PA-005, 2026-10-15), build `41d5a4b`: **no portal content** (`portals` = `[]` in all five — §9.1 BUT rows 2/6). Build property, not a result — never a pass, never a fail, never blank, never `0` (§9.10.4). **Release condition (§9.6 run-only-if):** opposite-colour-end portal levels (**L11+**) ship, the validator's opposite-colour rule is in force (same-colour pairs rejected), **and the Solver gate passes** ⇒ scored in a **new round with its own §9.1 BUT row**.* |
| Verdict — **(d′)** M0-opening retention | *(fill after coding only — n = 0. Runnable on this build: d′-1…d′-10 **and** D-2 **and** D-3, §9.6)* |
| Verdict — **DoD** | *(fill after coding only — n = 0. D-1…D-5, §9.7)* |
| Count of MARGINAL sub-metrics (≥ 2 ⇒ round verdict MARGINAL) | |
| Overall Stage-2 verdict (V1…V5 per §9.9) | |
| Tables attached (A–F) — **a verdict without tables is void** | |
| Escalation opened? (E1 UI (b) / E2 authoring+schedule (a′)/(c′) / E3 design difficulty+cadence (d′) / E4 DoD hard stop) | |
| Evidence handed to the human (paths) | |
| Silent revert performed? (**must be NO — ADR-0008 and ADR-0009 forbid it**) | |
| §3.3 art gate status (open until GATE A art + re-run) | |

> *(do-not-delete reconciliation)* V0.3 sheets used **(a1)/(a2)/(c)** — mapping: (a1)→(b), (a2)→(a′)+(c′),
> (c) battery→(d′); see `playtest-log.md` §9.1. The (a′)/(c′) pre-fill above is the **fixed string**
> §9.10.4 requires; when their release conditions land, the *new round's* Table F supersedes it — this
> row is never silently upgraded to PASS.
