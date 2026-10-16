# PA-003 — L20 SEALED LANDING: pre-registration protocol for the two named comprehension risks

> Owner: **Playtest Analyst** (AGENTS.md §4 — `docs/playtest-log.md`, `docs/playtest-analysis/**`)
> Task: **PA-003** *(ticket label as dispatched; **distinct** from the V0.4 "PA-003" §9-realignment
> banner recorded in `docs/playtest-log.md` — same label, different ticket. This header is authoritative.)*
> Date: 2026-10-16 · Status: **PRE-REGISTERED · NOT RUN · n = 0** · Frozen **before** session 1 (T6 semantics)
> Parents: `docs/decisions/design-0004-l20-mechanism-sealed-landing.md` decision 8 · `docs/level-design.md`
> §6.2.4/§6.2.5/§6.2.6 (GD-007 published law) · `src/levels/candidates/l020.json` (the real board) ·
> `scripts/author-l20.transcript.md` + `src/levels/README.md` §2e (its measured read-out) ·
> `docs/playtest-log.md` §1/§9/§11 (vocabulary, tie-breaks, frozen thresholds — **all unedited by this file**).

## 0. The one question this protocol answers

After L20, does the pocket **teach** ("the portal did not shortcut me — it gave me a new start") or
**frighten** ("I was dropped somewhere I cannot leave")? Subordinate to the standing question
(`docs/playtest-log.md` §2: after L5, does the player actively want L6?): **no L20 row may outrank the
DoD** — a GREEN here never compensates for a DoD failure (§9.0's ordering rule carries).

## 1. The board under measurement (measured on the landed bytes, not restated from intent)

Tool run at this commit: `node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20`
→ `GATES: ACCEPT · controls: 11/11 caught by their named gate · RESULT: PASS`. Quoted facts:

| Fact | Value (prover output / file) |
|---|---|
| Grid · start · goal · startPhase | 7×6 = 42 tiles · `(0,0)` · `(5,4)` · A (`l020.json`) |
| `par` / `D_exec` / `B` | **20** exact · 24.729412 · 1.5765 · coverage `distinctPositions = 42/42` |
| Portal | `p1 (2,5) ⇄ (5,1)`, `activePhase: A` — **one** opposite-colour pair |
| Pocket (derived from the bytes) | `[5,1 6,0 6,1 6,2]` (4 tiles); **landing end `5,1`**; near end `2,5` |
| Pocket boundary | `[4,1 5,0 5,2 6,3]` — covered by **exactly 1 door object (`d1`, red)**; **0 free leaks · 0 phase walls** (g2) |
| Switch inside the pocket | **`s1` on `(6,0)`, `activePhase: A`**, targets `d1` — the only switch in the pocket |
| Arrival phase | **B** (g1: `arrival=phase B`; arrival = the teleport's **successor**, LV-011 instrument correction (i)) |
| Route structure | `par routes = 252`; `252/252` execute `land → press(s1) → cross the pocket door → press a seal switch` (g3); `distinct switches pressed per route: min = 2` |
| All-OFF world | **UNSATISFIABLE** (`allOffShortest = null`); g4: *"the pocket's door refuses the only exit (its base colour is closed in the arrival phase)"* |
| Refusal geometry | `refusedBeforeEnteredTiles = 14` incl. `[4,1 5,0 5,2 6,3]` (the pocket boundary) |
| L19 (baseline) | `src/levels/l019.json` — **7×6, `par` 18**, portal `p1 (2,5)⇄(4,0)`, goal-gated **full seal** (4 blue doors on the goal's 4 neighbours, 4 B-phase switches), all-OFF unsatisfiable |

**The one board-derived inference this protocol depends on** (stated as a dependency, not as a result):
the switch fires on the **entering move, while the current phase equals its `activePhase`**
(`src/core/rules/applyMove.ts:127` — *"`activePhase` is current; leaving it, or standing on it in the
other phase, …"*; same entry-phase semantics the transcript records for the portal). Therefore the
**press cannot be made on the arriving move** (arrival B ≠ `s1` A) and first becomes available **2
pocket moves after landing**. That is precisely §6.2.5's named risk 2 and its delivered mitigation.

## 2. Continuity — the names this protocol is allowed to use (nothing parallel is invented)

- **M4 Refusal Count** = *"taps that produced **no movement and no phase flip**"* (§1);
  **M4b** post-refusal R1–R6 codes; **M4c** refusal-cause guess `RG-*` — *"**RG-door** (names the door
  specifically — correct from L6 on) … **RG-input** (\"broken\"/\"didn't register\"/taps chrome — the R6
  utterance; one measurement, two columns … no second threshold)"* (§11.2). All three are used **verbatim**.
- **M5** — *"**Restart Count** | re-attempts of the same level | is failure motivating or punishing?"* (§1).
- **M6** — *"**Undo Count** | undos per level (**both tails reported**: ≈ 0 with long dwell = fear; very
  high = thrash) | is experimentation free in practice, not just in spec?"* (§1).
- **§11.2 row** — *"**M5/M6 Restarts · Undos** | per level, both tails reported | d′-5/d′-6 on L1–L5
  (frozen); **PD-4** at L6; L7–L10 context"*. **The frozen thresholds are not extended to L20:**
  d′-5/d′-6 stay on L1–L5 and PD-4 stays on L6.
- **M9/C3**, **M15**'s *"≥ 2 refusal/repeat taps, or restart/undo < 3 s after landing"* window language,
  **M16**, **M10** (*"**no threshold, ever** — presence of an Aha is never gated"*), §9.2 **T1–T9**,
  §9.7 **H1** (*"20 s with no input, or **3 consecutive refusals**"*), §11.6's **no-widening rule**
  (C3's frozen span is *not* widened to L20), §9.10 anti-fabrication rules 1–6.

**Scope of scoring:** all §11.2 rows are recorded per level for **L19 and L20 as context** (M1, M2, M3
Δmoves vs `par` 20, M4/M4b/M4c, M5, M6, M7, M8, M9, M10, M11-end, M12). **Only PL-1…PL-3 carry thresholds;
everything else is reported, never gated** — one measurement, one threshold.

## 3. RISK 1 — "the pocket reads as a trap"

> §6.2.5 verbatim: *"**Named risk 1 — \"the pocket reads as a trap.\"** A landing the player cannot walk
> out of may be misread as a bug or a punishment. Mitigations are structural (the exit door is visible and
> openable; unlimited Undo/Restart) and the measurement is Playtest Analyst territory: **M5 restarts and
> M6 undos on L20 vs L19 must not spike**; if they do, the device is re-designed, never re-labelled.
> Labelled **hypothesis**, not a claim."*

**The land window (both risks share it).** `L0` = the move whose outcome is the teleport (visible as the
jump `(2,5) → (5,1)`); the window = **L0+1 … L0+3** (3 subsequent inputs). Justification, from the board:
the press legitimately becomes available **2** pocket moves after landing (§1 dependency) and the entire
`land → press → cross` act completes inside the pocket — so 3 moves spans the full first act with one
move of slack. It is deliberately a **move-count** window, not a seconds window, so no frozen latency
(b-3's median ≤ 3.0 s / p90 ≤ 8.0 s, frozen on the L1–L5 wall-echo span) is imported onto a new level;
the M14 window is reused **descriptively** for the landing dwell and is reported as context only.

**Operational signals.**
- **S-1a — pocket-boundary refusals:** M4 refusals inside the window whose attempted destination is a
  `d1` boundary tile `(4,1)|(5,0)|(5,2)|(6,3)`. Board justification: the pocket boundary contains
  **no wall and no leak** (g2: 0/0), so *every* refusal obtainable inside the pocket has exactly one
  cause class — the closed door. Consequence: `M4c = RG-door` is the **expected** code, and
  `RG-wall` / `RG-ghost` / `RG-switch` are **misattributions** and therefore comprehension tells on this
  board (they are impossible causes here). Recorded with M4b code + verbatim.
- **S-1b — retreat before evidence:** M5 restart **or** M6 undo inside the window with `switchesOn`
  still unchanged and the door still un-crossed — i.e. before the player has any evidence the pocket opens.

**Threshold that counts as CONFUSION (named numbers).**
- **Participant level:** a participant is a **trap tell** if S-1b fires once, **or** S-1a reaches
  **≥ 3 refusals inside the window** *and* carries a C3-shaped verbatim ("stuck / trapped / broken").
  The number **3** is cited, not chosen: §9.7 **H1** already defines *"3 consecutive refusals"* as the
  instrument's own stall threshold; and because the pocket offers only **4** distinct boundary tiles all
  answering identically, 3 attempts is the point where the refusal is no longer exploration — it is
  information-free repetition.
- **Cohort level (the verdict number):** **CONFUSION (RED) iff ≥ 2/5 participants are trap tells.**
  **PASS iff ≤ 1/5.** Exactly **1/5 ⇒ `MARGINAL`** (§9.2 T2: exactly at a `≤ 1/5` ceiling ⇒ PASS flagged
  MARGINAL). The `≤ 1/5` tolerance is taken from the established family in this instrument — b-5, d′-2 and
  PD-1 all use “`≤ 1/5`, fails when `≥ 2/5`” — and is justified on this board by §9.5 b-4's existing
  allowance that a *forced* landing beat may flail for up to 1/5 of its occurrences.

**PL-2 — the row GD-007 named, verbatim PD-4 form re-based on the L19/L20 pair (no new scale):**
M5: `mean(L20) ≤ min(mean(L19) + 0.5, 1.0)` · M6: `mean(L20) ≤ min(mean(L19) + 0.5, 2.0)` — each bound
**exactly at ⇒ `MARGINAL`** (T2/T3), over ⇒ **RED**. Both M6 tails reported (§11.2 row: *"both tails"*).
Provisional margins, D-5 discipline (pre-registered so they cannot be moved post hoc, flagged for
re-calibration only via a future re-freeze).

## 4. RISK 2 — "the wrong ARRIVED PHASE"

> §6.2.5 verbatim: *"**Named risk 2 — the arrived phase may be the wrong phase to act.** Structural
> mitigation: the pocket's pressable object must be pressable in the phase the likely arrival produces,
> or both phases must present a legal action. The Solver proves ≥ 1 plan exists; comprehension requires
> the **first** plan to be visible."*

**Operational signals.**
- **S-2a — the failed press:** a move that enters `s1 (6,0)` while the phase at entry is **not** `A`
  (`s1`'s `activePhase`): the body moves, the phase flips — and **the world does not answer**
  (`switchesOn` and `d1` unchanged). This is *not* an M4 refusal (movement happened); it is the
  no-toggle press, and it is visible on the recording as "stepped on the switch, door stayed shut".
  Count **failed-press events per participant**; also count **repeat cycles** (the participant re-walks
  the pocket to try again) — M15's *"refusal/repeat taps"* language, reused descriptively.
- **S-2b — phase-language misattribution (verbatim channel):** after a failed press, a `RG-input`-class
  utterance ("it didn't work", "the switch is broken", "nothing happened") or a C3 flag. Scored **once**,
  per §11.2's one-measurement rule (the utterance is the R6/RG-input cell, never a second threshold).

**Threshold that counts as CONFUSION (named numbers).**
- **Participant level:** **≤ 1 failed press ⇒ within tolerance**; **≥ 2 failed-press events for one
  participant ⇒ that participant is a wrong-phase tell.** The number **1** as the tolerance and **2** as
  the tell are the **a′-4 form** (frozen §9.6: *"**C7 + C8** per participant | **≤ 1**, and **no
  participant ≥ 3**"*) — reused rather than invented, because the board makes a *single* failed press
  **designed-for**: the successful press needs the pre-flip phase `A`, arrival is `B`, and the same
  physical walk can be repeated with a different broken-parity phase after a return cycle (g1 records
  the walk back through the landing to the near end `2,5` as a real, named move). One no-op is the
  lesson arriving; two with no model formed is the comprehension tell.
- **Cohort level:** **RED iff ≥ 2/5 participants are wrong-phase tells; PASS iff ≤ 1/5; exactly 1/5 ⇒
  `MARGINAL` (T2)** — the same ceiling family as Risk 1, for the same reason.

**Structural-guard clause (b-6 discipline).** If the pre-cohort check **P-1** shows that *every* portal
arrival on L20 is phase **B** (i.e. no re-landing ever arrives in `A`), then S-2a is **structurally
rare** ("pre-ticked Y" in b-6's sense) and PL-3's live weight moves to S-2b + the Aha verbatim; the row
is then reported as a **structural-Y context row**, exactly as b-6 guards a build where a walk-around
exists. Stated **before** data, so neither outcome can be spun afterwards.

## 5. The L19-contrast rule (one rule, both risks)

L19 is the **within-session, within-participant matched control**: same **7×6** grid, same device family
(portal + a door-gated terminal), `par` 18 vs 20, **all-OFF unsatisfiable on both** (L20 g4 / the L16–L19
seal block), an ordered press demanded by both. The L20 delta is exactly the object under test — *the
walk-sealed pocket* — so L19 isolates it. Rules: (1) every field row is recorded on **L19 in the same
session, immediately upstream of L20**; (2) comparison is **within participant only** (participant as
their own control) — the cohort statistic is the distribution of per-participant deltas, **never** a
cross-cohort average; (3) **≥ 4 valid L19/L20 pairs required** — a pair is void if either cell is
`NOT MEASURED` (T9, including BD-1 contamination, §11.1), the pair is dropped **and counted, never
imputed**; **< 4 valid pairs ⇒ PL-2 = `NOT MEASURED` ⇒ Risk 1 = `INCOMPLETE`, never PASS** (the PD-2
denominator discipline, §11.4); (4) **L19 carries no threshold of its own** — a baseline is not a gate,
and no L19 number may be reused as a threshold elsewhere without its own pre-registration.

## 6. GREEN / RED — what each outcome means for keeping vs re-working L20 (pre-registration)

- **GREEN** (PL-1, PL-2, PL-3 all pass, with PL-3's structural variant recorded if P-1 fires) ⇒ the pocket
  **teaches**. Meaning: (i) §6.2.5's *labelled hypothesis* is upgraded to **measurement** on the M5/M6
  axis — the honest conversion of a design hypothesis into evidence, which is the whole point of this
  file; (ii) the block-end re-registration (L16–L20 + the **one-time** move of
  `block-l1619-tail-ceiling`) may cite this round as the PA-side evidence, but the number itself moves
  only by the level lane's ticket — **PA never re-tunes a number or a weight** (AGENTS.md §4); (iii) the
  rows stay frozen as written for the next round: **no re-freeze is needed**, because every threshold was
  pre-registered before session 1.
- **RED** (any of PL-1/PL-2/PL-3 fails) ⇒ the device is **re-designed, never re-labelled** (decision 8 /
  §6.2.5 verbatim). Routing: **E2-class authoring escalation** — Game Designer + Level AI & Solver, with
  the per-participant tables and verbatims (§9.9's V4/E2 routing reused; **not** E1, which is the
  presentation-only path inside the R-E/R-E2a bands). Remedies must stay **inside the published lattice**
  (§6.2.3), pre-named so the fix is a search, not a negotiation:
  **(i) re-pick** — a lattice variant whose pocket switch's `activePhase` matches the arrival phase
  (the census holds **238 leak-free devices** plus a per-landing ceiling table — a search, not a guess);
  **(ii) both-phases action** — a second pressable object so that each phase presents a legal action
  (§6.2.5's own mitigation sentence). **Prohibited:** text, tooltip, tutorial popup or HUD copy; a
  "it's a feature" re-label; moving any threshold; widening the terminal number; PA editing a board.
  A RED **never** reopens the locked core loop, ADR-0008 or ADR-0009 (§9.9's interpretation guard, carried).
- **MARGINAL** (exactly at a ceiling) ⇒ the risk is **not closed**: re-run **only** the marginal sub-test
  with a **fresh** cohort of 5 (T5, verbatim — never the same people).

## 7. Pre-cohort checks and the one product ask

- **P-0 · blocking precondition (not PA-owned).** L20 is today a **proven candidate, not a registered
  level** (`src/levels/candidates/README.md`: "proven, **unregistered**"; the count pins read **19**), and
  the round-entry rule (§11.1) makes `?level=` a **setup entrance only** — so the next round **cannot
  reach L20** until the registration ticket lands (registry row + count pins + metrics sidecar) and both
  **L19 and L20 are reachable by progression inside one scored session**. If that precondition is unmet
  at round start, record **`NOT TESTABLE ON THIS BUILD`** (a legal, reportable outcome, §9.10.4) and the
  L20 rows are **`INCOMPLETE`** — never PASS, never blank.
- **P-1 · pre-cohort read-out (level lane, read-only, one line).** The **phase at every portal arrival**
  on L20 across the 252 par routes and the reachable state space: *does a re-landing ever arrive in
  phase A?* This decides whether PL-3 is a live row or a structural guard (§4). If it is not committed
  before session 1, PL-3 is scored on the live channel and labelled `unverified-arrival-parity`.
- **P-2 · PRODUCT-ASK — one line, P-pending (QA / Gameplay Engineer, optional, never blocking).**
  *The events needed already exist and already carry the phase —* `move` `{level, moveCount, phase,
  playerEmbedded}`, `refused`, `phaseChanged`, `undo`, `restart`, `levelWon`, `levelStarted`
  (`src/game/systems/event-bus.ts`) *— but nothing records them* (`architecture.md` §13: *"no
  middleware, no wildcard topics, no replayable event log"*), **so the ask is a read-only, opt-in
  in-memory recorder tap on the existing bus (no new emit), plus one genuinely new emit detail: the
  `move` payload carries no position** — a `position` field (and a door/`switchesOn` delta) would let
  the land-window and wrong-phase rows be counted without a stopwatch. **Marked P-pending**: the
  protocol is fully runnable today on the §9.8 surface (screen recording + stopwatch), every affected
  row carrying the T8 `live-timed` degradation label. No analytics, server or logging code is requested
  for the round itself (§9.8's YAGNI boundary stands).

## 8. HONESTY BOX (read this before quoting any number above)

> **No player data exists.** `docs/playtest-log.md` §6 still reads *"No session has been run. No
> participant has been recruited. Every cell below is empty on purpose"* — re-verified at this commit;
> **n = 0**, and §11.9's standing disclosure applies verbatim. **Every number in this file is a
> pre-registered threshold or a program-measured board fact — none of it is evidence about players.**
> This document is a **falsifiable protocol**, not a result; it exists so that no threshold can be drawn
> after data appears (§9.10.1–2, T6). The cohort is the **user's lane** (`docs/project-status.md` item 47
> G4, USER-BLOCKED; `README.md` still-open item 1) — "the missing input is the cohort, not the protocol".
> The analyst's own impression of L20 is **not** data and appears nowhere as one (§9.10.6); the board
> facts above are the program's, and the only inference drawn from them (§1's entry-phase press) is
> labelled as a dependency with a named verification (P-1/P-2), not as proof. A verdict recorded before
> its tables exist is void (§9.10.1); a finding without tables is void (§9.9).

## 9. Freeze and void conditions

Frozen at this commit for the next round: row ids PL-1…PL-4, the land window (3 moves), the S-1a/S-1b/S-2a/
S-2b signals, the thresholds (**3 refusals**; **≤ 1/5 pass, exactly 1/5 marginal, ≥ 2/5 red**; **≥ 2 failed
presses**; the re-based PD-4 margins **+0.5 / 1.0 / 2.0**), the L19 within-participant contrast rule, the
GREEN/RED routing and the prohibited-fix list. **Same rules as §9/§11:** after session 1 no threshold,
probe string or level index in this file may be edited (T6 semantics carried); mid-round corrections go to
Table F and apply to the next round only; **any pre-session edit to this file is a re-freeze event** (RF-3,
dated grounds, fresh manifest). Round truth lives in `docs/playtest-log.md` §10 + the raw tables (A–F);
this file holds no results and may hold none.
