# Stage 2 — COHORT v2 RUNBOOK (V0.6, L1–L10) · for the human moderator

> Owner: **Playtest Analyst** · V0.1 (PA-006) · 2026-10-15
> Status: **PRE-REGISTERED · NOT RUN · n = 0.** This runbook contains **no results**. It is the
> operating manual for the user's 10-person cohort; the normative instrument is
> `docs/playtest-log.md` **§11** (V0.6) on top of the frozen **§9** (V0.5), and the frozen coding
> manual is `stage2-adr0008-gated-protocol-notes.md` §2. Where this file and §11 disagree, **§11 wins**
> (this file never invents or moves a threshold, a probe string or a code).
> Evidence label (ui-ux R-P7): the round build is program-drawn vector tokens = **`placeholder art`**.
> Freeze provenance: `stage2-v06-freeze-note.md` + `stage2-v06-manifest.sha256` — **editing this file
> before session 1 = a re-freeze event (§11.0); after session 1 it is frozen absolutely (T6 semantics).**

---

## 0. Standing disclosure (read this first, quote it verbatim anywhere this round is cited)

> **"Zero cohort sessions have been run to date: n = 0 — no participants, no recordings, no results.
> Every threshold in this instrument is pre-registered. The Stage-2 human gate is open, and the missing
> input is the cohort, not the protocol."**

This stays TRUE — and must be **re-verified, never assumed** — until session 1 has run and its Table A
exists (`playtest-log.md` §11.9). It matches `README.md`'s still-open item (1) and `project-status.md`
item 47 G4 (cohort recruitment is the user's USER-BLOCKED lane; this runbook is the agent-executable half).

## 1. Who to recruit (10 non-developers = P5 + V5)

| Cohort | People | Job | Time |
|---|---|---|---|
| **P (players)** | **5** | play **L1 → L10** on the live build, individually, silently observed | ≈ 40–50 min each |
| **V (fresh viewers)** | **5**, **disjoint people from P** | look at frozen screenshots and answer verbatim questions — **no play, no interaction** (§9.4: reusing P for V voids the §3.3 gate) | ≈ 8–10 min each |

Recruitment rules (frozen, §9.4 carried verbatim):

- **Non-developer:** has never read `src/**`, never worked on this project, never seen this build.
- **≥ 1 of the 5 P participants** must self-report "I don't play puzzle games" — otherwise the cohort
  measures genre literacy, not the design.
- **Device mix: ≥ 5 of the 10 sessions run on a mobile browser** (Safari/Chrome, ≈ 390 px-class phone,
  the participant's own device preferred), **and ≥ 3 of those mobile sessions are P sessions.** Desktop
  browser is acceptable for the remaining sessions. Record device + browser + viewport px in Table A.
- **Individually run.** Friends must not watch each other play; social learning moves M1 without moving
  the design.
- **Colour vision is recorded, never an exclusion criterion** — a CVD participant is valuable (V6, M13).
- **No incentive that creates compliance pressure.** A participant who wants to stop is thanked; their
  Quit Level (M12) **is data**. Persuading a quitter corrupts M11.
- **Replacement pool:** up to 3 fresh replacements for INVALID sessions (T7 — interrupted > 5 min,
  build/device crash, script deviation on a scored item, prior exposure found later). Never drop to n = 4.
  Replacements beyond 3 ⇒ stop and report `BUILD NOT TESTABLE`.
- **Moderator:** the human user, or a non-developer friend the user briefs. Must not have authored the
  level under test. **Zero hints. Zero mechanic vocabulary** — never say 相位 / 奇偶 / 幽灵 / 回响 /
  相位墙 / phase / parity / ghost / echo / wall-echo / switch / door / latch first; the participant's own
  words are the data. React to nothing ("mm-hm" only). Read verbatim lines exactly (Table C is the
  canonical frozen script; Table C2 below adds the V0.6 administration lines).

## 2. Round setup (once, before session 1)

1. **Fill the round BUT row** (§11.1) in a fresh Table F instance: the `main` commit whose GitHub Pages
   deploy is live (from the Actions deploy run: sha + run URL) serving
   `https://pepsico24.github.io/AI-Native-GameCpt/`. Art status: `placeholder art`. **All 10 sessions run
   on this one commit** — if a new deploy lands mid-round, stop (§11.1 same-BUT rule).
2. **Verification pass** (unrecorded, once per round + once per device):
   - `?level=1` … `?level=10`: each renders a playable board (✓/✗ per level in the BUT row).
   - Win **L10** (setup play): transcribe the win panel's **title + body verbatim** (BD-2 baseline —
     the stale-copy defect observation; do not fix, do not assume, record).
   - Win **L5** (setup play): transcribe title/body verbatim; record **panel state N** (Next control
     visible) or **E** (no Next control). Both states have a frozen CI-beh rule (§11.4).
   - Note the deployed commit's **R-004b status** (defects fixed / present) from the release record —
     disclosure only; sessions measure the player either way.
3. **Print per participant:** Table A (P1…P5 / V1…V5 ids — **no names anywhere**), field sheet PAGE 1
   rows R1–R12 **per level for L1–L10** (Table B covers L1–L6; print **Table B2** below for L7–L10),
   Table C + C2 (moderator card), one Table D per round, Table E per V test/viewer, one Table F.
   ⚠ The field sheet's PAGE 4 build facts (`41d5a4b`, L1–L5) are **superseded for cohort v2 by the round
   BUT row** — rows R1–R12 and the LEGEND apply unchanged, extended per level to L10.
4. **Capture the Cohort-V frozen frames from the round BUT** (§9.1's list — never captured at `41d5a4b`,
   so capture is fresh) **plus the V0.6 addendum** (§11.6): L6 + L8 boards in **both phases** — closed
   blue door (phase A), switch tile glyph + latch dot unpressed/pressed, latched-open door, occupied-door
   standing state; the `l005` embed frame at Te0 + its phase-A approach; the `l004 (2,0)` pair; a
   post-refusal frame; both-phase boards for V5; the 10-tile sorting sheet per notes §3.1 (9 mandatory
   conditions + recorded seed). Label every frame `placeholder art` + round BUT sha.
5. **Recording:** screen + hands + audio (audio is required — verbalizations *are* the data). **No face.**
   Consent is Table A's first act. Without a recording, T8's `live-timed` degradation applies and
   M14/M15 report as weaker evidence.

## 3. Cohort-V session (≈ 8–10 min, screenshots only)

Show the frozen frames in the Table E fixed random order; ask the verbatim items (§9.8 carried):

- **V5** "which cells block entry right now?" — both phases. Answer key: **currently-solid walls ∪
  closed doors**; ghosts, open doors and **switches are never blocking** (a switch misclassification is
  scored, then the **C2-f neutral follow-up** is asked **on switch tiles only** — it feeds SW-4, §11.3).
- **V6** the 10-tile sorting sheet (colour / desaturated / CVD conditions; sampling per notes §3.1).
- **V7a/V7b** on a post-refusal frame: point at the cause; "did the phase flip?"
- **V8a/V8b** on the embed frame, both phases (scored b-1/b-2; the frozen zh V8b wording and its
  anti-leading guard are Table C's — read exactly).
- Record every answer in Table E; **SW tags** (§11.3) beside it — observation only, no score.

## 4. Cohort-P session script (≈ 40–50 min · L1 → L10)

**Probe timeline (what fires when — everything else is silent observation):**

| When | What | String source |
|---|---|---|
| start | consent + header, device already sitting at **`…/?level=1`**; recording + stopwatch on | §9.8 step 1 verbatim; handover line C2-a |
| after **L2 win** | **V-CL** | Table C |
| **L5 win** | **Tw** 15 s no-prompt window → **CI-beh** (panel-state rule, §11.4) → bridge line **C2-b** → **OBS-6** → **CM1 → CM2 → CM3 → D1 → CI-self** (this exact order; OBS-6 before CM1 — §9.8 step 6 pin) | Table C |
| resume | participant continues at their own pace; **L6 T0 = the moment the battery ends and you fall silent** (§11.4) | — |
| **first switch step** (expected L6, move 1) | code **CM-GL** silently (look/point/mention of the door within 3 s) | Table C (observation row) |
| **L8**, iff pre-marked state **PP-A** occurs (player (3,2), phase A, s1 OFF — §11.5) | pause line **C2-c** → **P-probe** × 4 tiles → resume line **C2-d** | Table C |
| after **L8 win** | **CM-D** (before anything else at that panel) | Table C |
| **L10 win** (or quit point) | **CI-self-end** (C2-e) → **Aha recall** (C2-f) → thank, stop recording | Table C2 |
| any stall | ladder **H0–H4** only (§9.7 verbatim strings in Table C); every rung is scored against the participant | Table C |

**During play — tally live (Table B/B2):** T0/T1/T2 · moves vs par (4/5/6/6/6/4/4/6/8/9) · refusals with
**M4b R-codes + M4c RG-codes** (spontaneous attribution only — **never ask why a move failed**) ·
restarts · undos · misclicks (C9) · GO/G-codes · embed windows (Te0/Te1, M14/M15, C3) · **OB-DE**
door-embed events on L6–L10 (context, §11.6) · confusion flags C1–C9 + **SW tags** + **BD-1/BD-2**
events (§11.1–§11.3: BD events are build defects, never participant errors — timestamp them; a scored
window containing BD-1 is marked CONTAMINATED on that row). Freezes (≥ 5 s). Spontaneous rule
statements (never prompted). Aha candidates live (M10: level + move + verbatim).

**Embed events (L4 offered / L5 forced):** do not intervene; code the window; V8b-style questions only
after level end, and a P-cohort answer is **not** the fresh-viewer test (§9.8 step 7 carried).

**Quit:** H4 — thank them, stop, record M12 without persuasion. Quitting is data.

## 5. After each session, after the round

- **PA codes 100 % of sessions from the recording**; second coder (QA or Reviewer) independently codes
  ≥ 2 of 5 P sessions from the coding manual alone; per-code agreement < 70 % ⇒ that code is **DISCARDED
  and reported `NOT MEASURED`** (§2.5 carried). Never back-fill from memory; unfilled cells stay `—`.
- **Table D** (cohort roll-up) + **Table F** (round verdict, cohort-v2 instance: BUT sha, panel state,
  R-004b status, BD counts, (c′) row = the fixed deferral string) are filled **before** any §10 finding
  is written. A verdict without tables is void (§9.9).
- **SW tallies** go to §10 Findings as observation rows with the R7 tri-signal mapping (§11.3); the PA
  reports, the UI / Art Director rules — the runbook changes no ruling.
- Recordings: stored locally by the user, **deleted after coding** unless the human chooses to keep
  them; **never committed to the repo** (only coded tables are).

## 6. Success thresholds at a glance (pre-registered — all cited, none invented here)

| Question | Rows | Pass bar (frozen source) |
|---|---|---|
| **DoD — prototype gate** | D-1…D-5 | ≥ 4/5 understand without explanation (zero H2/H3 through L1–L5 + CM1 + CM2 correct) · ≥ 3/5 want L6 (CI-self ≥ 4 **and** CI-beh sought in Tw) · ≤ 1/5 quit before L5 · M1(L1) median ≤ 30 s · M2(L1) median ≤ 60 s *(provisional)* — §9.7 |
| **SEAM-1 — L5→L6 dip (d′)** | PD-1…PD-4 + shared D-2/D-3 | ≤ 1/5 quit at L6–L7 · ≥ 4/5 of L6-enterers reach L8 without H3 · median M2(L6) ≤ median M2(L5) + 20 s *(provisional)* · L6 friction: M5 ≤ min(L5+0.5, 1.0), M6 ≤ min(L5+0.5, 2.0), M4 ≤ min(L5+1.0, 3.0) *(provisional margins)* — §11.4; plus d′-1…d′-10 §9.6 verbatim |
| **(b) — embedded readability** | b-1…b-7 | §9.5 verbatim (V8a < 1 s 5/5 · V8b ≥ 4/5 · M14 median ≤ 3.0 s / p90 ≤ 8.0 s · M15 ≤ 1/5 events · C3 ≤ 1/5 · M13b ≥ 4/5 · OBS-6 SAW ≥ 4/5 on L5) |
| **SEAM-2 — L6→L8 latch (a′)** | a′-1…a′-4 | §9.6 verbatim (CM-D ≥ 3/5 · CM-GL ≥ 3/5 · P-probe ≥ 80 %/participant & ≥ 4/5 participants · C7+C8 ≤ 1, none ≥ 3) — administration pins §11.5 |
| **(c′) — portal** | — | **`NOT TESTABLE ON THIS BUILD — DEFERRED TO COHORT v3`** (§11.7: accepted `l011.json` + R-003 unlock + Entry-3 frames) |
| Marginals / verdicts | T1–T9, V1–V5 | §9.2 / §9.9 carried unchanged; exactly-at-ceiling ⇒ PASS flagged MARGINAL; ≥ 2 marginal hypotheses ⇒ round MARGINAL, fresh-5 re-run |

## 7. Privacy (absolute)

- **No names, no faces, ever.** Participant ids P1…P5 / PR1…PR3 / V1…V5 only, in every table and file.
- Consent script (Table A act 1) states: screen + hands + audio recorded; face not recorded; stop any
  time and stopping is useful; recordings deleted after coding unless the human keeps them.
- Nothing but coded tables enters the repo. No telemetry, no server, no analytics (§9.8 YAGNI boundary
  carried): the build is not modified for this test in any way.

---

## Table B2 — per-level continuation sheet (L7–L10; identical field rows to Table B, frozen order)

| Field | L7 | L8 | L9 | L10 |
|---|---|---|---|---|
| T0 board visible (mm:ss.s) *(L6's T0 = battery-end, §11.4)* | | | | |
| T1 first intentional legal move (mm:ss.s) | | | | |
| **Understand Time** = T1−T0 (s) | | | | |
| T2 level won (mm:ss.s) | | | | |
| **First Win Time** this level (s) · **Level Completion Time** (s) | | | | |
| Moves used / **par** (L7 **4** · L8 **6** · L9 **8** · L10 **9**) / Δ | | | | |
| **Refusal count** (M4) · first refusal latency `__s` | | | | |
| Post-refusal codes (M4b: R1/R2/R3/R4/R5/R6 tallies) | | | | |
| **Refusal-cause guesses** (M4c: RG-wall/RG-door/RG-switch/RG-ghost/RG-boundary/RG-input/RG-none tallies) | | | | |
| **Restart** (M5) `__` · **Undo** (M6) `__` · **Misclick** (M8/C9) `__` | | | | |
| Ghost Opportunities `__` · G1`_` G2`_` G3`_` G4`_` G5`_` · **GAR** `__`% *(context span)* | | | | |
| Key-ghost crossed in winning attempt? *(L10 `(1,2)`: structural — pre-tick Y)* ☐Y ☐N | | | | |
| Embed events: wall-echo `__` · **OB-DE door-embed** `__` (tile `____` dwell `__s` flail ☐ C3 ☐) | | | | |
| Hints H1 `__` H2 `__` H3 `__` *(H3 ⇒ excluded per §9.7 ladder)* | | | | |
| Confusion flags `C#@__:__ "____"` · **SW tags** `SW-# @__:__ phase _ "____"` (wall 4-adjacent? ☐Y ☐N) · freezes `__` | | | | |
| **BD events** BD-1 `__` (gesture `____` moves observed `__`) · BD-2 `__` (verbatim `____`) · contaminated rows `____` | | | | |
| Probes fired: CM-GL ☐ (level `__` move `__`) · **P-probe PP-A** ☐RUN ☐NOT-RUN reason `____` (`__/4`) · CM-D ☐ (after L8 win, verbatim `____`) · witness: door refused-then-crossed ☐Y (structural pre-tick) | | | | |
| Spontaneous rule statement ☐ @`__:__` `"____"` · M10 Aha candidate ☐ (move `__`, verbatim `____`) | | | | |

Session tail (once): **CI-self-end** `1 2 3 4 5` · **Aha recall answer** `____` · **Quit Level** `____` ·
win-panel copy observations (L5 / L10 verbatim, panel state N/E) `____` · script deviations `____` →
copy into Table A footer + Table F.

## Table C2 — V0.6 administration lines (frozen bilingual · read exactly · these are session
administration, **never** hints, **never** mechanic vocabulary)

| # | When | 正式脚本（zh — 逐字照读） | Origin (en) | Notes |
|---|---|---|---|---|
| **C2-a** | handover, recording on, device on `?level=1` | 「给你。」 | "Here you go." | §9.8 step 2 carried; nothing else is said |
| **C2-b** | L5 win, **after Tw closes** (state N: before the participant continues; state E: before the battery) | 「先不用继续——有几个小问题，问你刚才看到的东西。」 | "Before you continue — a few quick questions about what you just saw." | bridge into the frozen battery (OBS-6 → CM1 → CM2 → CM3 → D1 → CI-self); afterwards the moderator falls silent and **L6 T0 starts** |
| **C2-c** | L8, PP-A state reached | 「先停一下——不用动。」 | "Hold on a moment — don't move." | then Table C's frozen P-probe string × 4 tiles: (3,1) · (4,2) · (2,2) · (3,3) |
| **C2-d** | after the P-probe | 「继续吧。」 | "Carry on." | resume; the clock keeps running |
| **C2-e** | after the L10 win (or at the quit point, if the participant is willing) | 「这个版本到这里就没有更多关卡了。如果还有更多关卡，你有多想继续玩？用 1 到 5 分表示。」 | "There are no more levels in this build. If there were more, how much would you want to keep playing? On a scale of 1 to 5." | **CI-self-end — context item, no threshold** (§11.2 M11) |
| **C2-f** | after C2-e | 「整个过程里，有没有哪个瞬间让你觉得『啊，原来是这样』？是哪一刻？」 | "Was there a moment when you thought 'aha, so that's how it works'? Which one?" | M10 recall support; answer verbatim or "none"; **no threshold, ever** |
| **C2-g** | Cohort V, V5 sheet — **on switch tiles only**, after the viewer's blocking-set answer | 「那这个呢——为什么？」 | "And this one — why?" | neutral attribution follow-up feeding **SW-4** (§11.3); never suggest an answer; if the viewer says "don't know", record that verbatim |

> Anti-leading guard (Table C's, carried): no question may contain parity / ghost / echo / phase-wall /
> switch / door / latch (or 相位 / 幽灵 / 回响 / 相位墙 / 开关 / 门 / 闩) before the participant uses the
> word first — **C2-g's 「这个」 is deliberately wordless about the object**. Improvising on any scored
> item = `SCRIPT DEVIATION` (T7): the row is excluded from scoring and logged.
