# STAR-ERA ASKS — readiness section (pre-registered · **NOT TESTABLE** · n = 0)

> Owner: **Playtest Analyst** (AGENTS.md §4 — `docs/playtest-log.md`, `docs/playtest-analysis/**`)
> Task: **PA-004** · Date: 2026-10-17 · Status: **PRE-REGISTERED · NOT TESTABLE YET · every cell empty on
> purpose.** This file contains **no result, no rate, no distribution** — the rows below are the questions
> and the **falsification bands**, written before any participant exists so no number can be drawn after
> data appears (§9.10.1–2, T6 semantics).
> **Authority for the semantics:** `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`
> **Ruling A** (ADR design-0005, APPROVED; `docs/project-status.md` item 107) — quoted, never moved:
> **3★ ≤ `par + k1`**, **2★ ≤ `par + k2`**, **1★ any finish**, **`k1 = 2·⌈par/10⌉`**, **`k2 = 2·k1`**;
> stars are **post-win only** (the in-play HUD stays `moves N` — GD-OQ1's refusal stands); persistence is
> one versioned key family **`ps.echoGrid/stars@1`**; **unlock stays completion-based, never star-based**.
> Shipped code (quoted, not re-derived): `src/game/systems/stars.ts` — `starThresholds` / `starsFor`;
> `docs/ui-ux.md` §5.5 (the pixel spec); `docs/game-design.md` §14.2 GD-OQ2.
> **Parents:** `docs/playtest-log.md` §1 (M1–M16 vocabulary — reused verbatim), §6a (the U-001 booking),
> §11 (the frozen L1–L10 instrument — **this file adds no threshold to it**),
> `docs/playtest-analysis/PA-003-l20-sealed-landing-risk-protocol.md` (the reused threshold *forms*).
> **The asks themselves** were booked with the ruling: `docs/project-status.md` item 107(d) — replay rate,
> star distribution, **median best−par as the k-regression**, 1★-vs-quit correlation.

## 0. Standing disclosure (quote it verbatim wherever this file is cited)

> **"Zero cohort sessions have been run to date: n = 0 — no participants, no recordings, no results.
> Every threshold in this instrument is pre-registered. The Stage-2 human gate is open, and the missing
> input is the cohort, not the protocol."** (`docs/playtest-log.md` §11.9, unchanged.)

**The star-era rows are NOT TESTABLE today, for three independent reasons — each a checkable fact:**

1. **No cohort.** The 10-person cohort (5 P + 5 V, §9.4's non-developer rule) has not run; recruitment is
   the **user's lane** (`docs/project-status.md` item 47 G4, USER-BLOCKED).
2. **No deployed build carrying stars.** The live URL is **OFFLINE** (item 89 freeze + **ITER-0021**
   take-down: 404 at both planes) and the **last-served** artifact was the train-3 **15-level** set, which
   predates **GAME-004** (`be7cdeb`, certified QA-019 at `147fba6`). Stars are live on **develop** only.
3. **No instrument step reads the key yet.** The runbook is frozen and contains **no localStorage step**
   and **no replay/quit coding row** — adding either is an **RF event** (§9.10.4's discipline: pre-register,
   never improvise mid-round). See §3.

**Anecdote ceiling — U-001.** The single seat booked in `docs/playtest-log.md` **§6a** is
**`ANECDOTE (single seat, developer class)`**, contributes **no cell** here, and has **no observed replay
behaviour** (no recording exists). If the user ever reports replay behaviour, it is recorded as that same
label — never as a measurement, never in a denominator. **`1/1` is not `5/5`.**

## 1. The rows (5 pre-registered · **5/5 `NOT TESTABLE`**)

| Row | Question | Source of the number (no new instrumentation) | Pre-registered threshold / falsifier | Status |
|---|---|---|---|---|
| **STAR-1 · Replay rate per level** | After winning L*n*, does the player **re-attempt a level they have already won** in the same session (the ADR's *"do it again, better"* chase)? | **Coded observation** (screen recording). ⚠ **Not** derivable from `ps.echoGrid/stars@1` — the key is monotone **best**, it stores no replay counter and no sequence. ⚠ **Not** M5 and **not** M6 (see STAR-5). | Report the per-level share as **context**; the gate is the participant form, **cited** from §9.7 D-2's established family: **PASS iff ≥ 3/5** participants replay ≥ 1 already-won level; ≤ 2/5 ⇒ the chase is not happening (report to GD + UI/Art, no threshold moved). Denominator = P participants with ≥ 2 wins. | **NOT TESTABLE** |
| **STAR-2 · Star distribution** | Are 3★/2★/1★ spread in a way that makes the rating **discriminating** rather than universal or punishing? | **`ps.echoGrid/stars@1`** (stored best **moves** per level) + Solver-proved `par` ⇒ `starsFor(best, par)`. Zero new instrumentation. | Per **populated band**: 3★ share **≥ 2/5 and ≤ 4/5** of won levels. **5/5 ⇒ FALSIFIED-TOO-LOOSE** (the allowance never binds — with the parity rule, an un-binding `par+k1` is *identical in play* to `par`); **≤ 1/5 ⇒ FALSIFIED-TOO-TIGHT** (the design's own "one exploration" allowance is unreachable for the median player). Exactly at a bar ⇒ `MARGINAL` (T2). | **NOT TESTABLE** |
| **STAR-3 · median `best − par` = the `k1` regression** | Does the **observed** allowance track `k1 = 2·⌈par/10⌉`, or does a **fitted pair** (`c`, `u`) describe the data better? | **Same key, same win-only write**: `best − par` per level = stored moves − Solver-proved par. **Falsification bands per par band in §2.** | Falsify the pair **(2, 10)** iff the median exits the band's window (§2): band-internal **drift** (F1) or the band-window breach (F2). A fitted pair replaces the constants **docs-first** (ADR-amended), never by a silent code edit. | **NOT TESTABLE** |
| **STAR-4 · 1★-vs-quit correlation** | Does a 1★ panel read as **"play one more"** or as a **punishment texture** (the ADR's own stated risk)? | **Coded observation** + the frozen M12 (Quit Level) + M11's CI-self (1–5). Not in the key. | Pattern = a 1★ panel followed by **quit within the next level**, or **CI-self ≤ 2** at session end. **PASS iff ≤ 1/5; RED iff ≥ 2/5; exactly 1/5 ⇒ `MARGINAL` (T2)** — the instrument's own established ceiling family (b-5 / d′-2 / PD-1 / PA-003 §3). Denominator = participants with ≥ 1 1★ panel; **< 3 eligible ⇒ `NOT MEASURED`** (never PASS). | **NOT TESTABLE** |
| **STAR-5 · Counter-check: M5 / M6** | Are we counting a **chase** as a **thrash**? (a) replay must never be scored as a restart; (b) star pressure must not *worsen* fail behaviour after a first win. | **§11.2's existing M5 / M6 rows**, per level, **both tails reported** (M6's own rule). | (a) **Definitional, not statistical:** M5 = re-attempts of a level **before** its first win; M6 = undos; **neither is replay** (STAR-1). (b) Reuse **PD-4's form verbatim** (one measurement, one threshold — no new scale): on a level **after** its first win, `mean(M5) ≤ min(mean(first-attempt) + 0.5, 1.0)` and `mean(M6) ≤ min(mean(first-attempt) + 0.5, 2.0)`; **exactly at ⇒ `MARGINAL` (T2/T3), over ⇒ RED.** | **NOT TESTABLE** |

**Reporting rule:** the five rows report **together or not at all** — a star row quoted without STAR-5's
counter-check is a half-measurement (it cannot distinguish a chase from a thrash). No star row may
**outrank** the standing question (`docs/playtest-log.md` §2: after L5, does the player want L6?) or the
DoD: a green star column never compensates for a DoD failure (§9.0's ordering rule carried).

## 2. FALSIFICATION BANDS — what number would kill the `(2, 10)` factor pair

Two factors, two falsifiers, and **both are per par band** because `⌈·⌉` makes the allowance a step
function of `par`. The pair is **`k1 = 2·⌈par/10⌉`**, `k2 = 2·k1`. “`best`” = the stored best **moves** for
that level; the observable is **median(`best − par`)** over the levels in the band.

| par band (shipped?) | ⌈par/10⌉ | `k1` (3★ ≤ `par + k1`) | `k2` (2★ ≤ `par + k2`) | **F2 — FALSIFY-TOO-TIGHT:** median(`best − par`) **>** | **hard form:** median **>** `k2` ⇒ 1★ is modal | **F1 — FALSIFY-TOO-LOOSE / band drift** |
|---|---|---|---|---|---|---|
| **4–10** *(populated: L1–L10)* | 1 | **2** | 4 | **> 2** | > 4 | median at the band's top `par` exceeds its floor-`par` median by **≥ 2** (allowance tracks `par` continuously ⇒ the unit is not 10) |
| **11–20** *(populated: L11–L20)* | 2 | **4** | 8 | **> 4** | > 8 | same test, within 11–20 |
| **21–30** *(partly populated: L21–L25 on the shelf, R-004 pending)* | 3 | **6** | 12 | **> 6** | > 12 | same test, within 21–30 |
| 31–40 · 41–50 · 51–60 · 61–70 · 71–80 · 81–90 · 91–100 | 4…10 | 8 · 10 · 12 · 14 · 16 · 18 · 20 | 16 · 20 · 24 · 28 · 32 · 36 · 40 | **> k1** (8 · 10 · 12 · 14 · 16 · 18 · 20) | **> k2** | same test |

**Band population law (stated, because it caps what any round can claim):** today the shipped ladder is
`par` **4…24** (`docs/level-difficulty.md` §5.2; Act II batch 1 = 17/18/20/21/23 on the shelf,
`docs/project-status.md` items 111/114). Bands **31–100 have no shipped level** ⇒ their cells are
**structurally `NOT TESTABLE`** until those acts ship — they are written down now so the pair cannot be
"validated" on the easy bands and left unexamined above them when the acts land.

**The three readings, named (so no post-hoc spin is possible):**

- **PAIR SURVIVES** — in every populated band the median sits **inside `(0, k1]`** and F1 does **not**
  fire. That is the ADR's claim: the allowance is *one exploration's worth*, growing one step per 10 par.
- **PAIR TOO TIGHT (`2` too small, or `10` too fine)** — median **> `k1`** in a band: the median player
  cannot reach 3★ at the design's own allowance. Escalation: **Game Designer** (docs-first constant
  change, ADR-amended) — **never** a code edit, **never** a mid-round threshold move.
- **PAIR TOO LOOSE / NOT BINDING** — median **= 0** with **≥ 4/5** of won levels at 3★ (STAR-2's
  too-loose form) in a band: the allowance is never consumed, and by the **parity rule** (a detour costs
  exactly **2** — ADR-0009; so `par + 1 ≡ par` in play, `stars.ts`'s own comment) an un-binding threshold
  is indistinguishable from no threshold. Same escalation path.

**Honesty clauses (pre-registered, not excuses):**

- **Parity is not a falsifier, it is structure.** Every legal route length ≡ `par` (mod 2), so
  `best − par` is **always even**; the value `2` is the **smallest reachable non-zero slack**, which is
  *why* only even thresholds are honest. A round may not "discover" this — it is arithmetic, and the
  playtest cannot confirm it.
- **The key is per **device**, win-only and monotone.** It records **no sequence**: a level won five times
  looks identical to one won once (best only), and a level won before the star build shipped has **no
  row**. Consequences, both binding: **STAR-1 cannot come from the key** (§1), and **an absent row means
  "never won on this device", never `best − par = 0`** (§3, missing-data law).
- **`par` is quoted, never recomputed by this lane**: the Solver owns it (§9.10.6 — no model/analyst
  judgement replaces the program).

## 3. Instrumentation: what already exists, and what would have to be pre-registered

**Zero new instrumentation is needed for STAR-2 and STAR-3** — the two rows the ask makes computable:

| Fact | Consequence |
|---|---|
| `ps.echoGrid/stars@1` stores **`{"schema":1,"best":{"<levelId>":{"moves":<n>}}}`** — **moves**, not stars; the star count is **derived** (`starsFor(moves, par)`, `src/game/systems/stars.ts`). | `best − par` is computable **from the key the game already writes** — one truth source, no new telemetry, no server (YAGNI boundary carried, §9.8). |
| `ENABLED` write path is **win-only, monotone**; corrupt/absent/unknown-id reads as **empty and never throws** (private-mode Safari, blocked store). | STAR-2/STAR-3 have a **legal zero state**: no win recorded = the level is **absent**, never filled with a guess. |
| The store is **device-local**; the game has **no analytics, no server, no accounts** (§11.7 privacy carries: nothing but coded tables enters the repo). | Reading it is a **scripted, read-only session-tail step on the participant's own device**, with the consent they already gave for observation — it must be **added to the runbook by an RF event before it is ever used**, and its wording must contain **no mechanic vocabulary** (Table C's anti-leading guard, carried). |

**What the key cannot answer (stated so nobody assumes it can):** **STAR-1** (replay) and **STAR-4**
(1★-then-quit) are **behavioural** — they need the coding surface (§9.2's coding manual + the M12/M11
rows), i.e. an RF'd runbook addition, plus a second coder on ≥ 2 of 5 P sessions (inter-rater < 70 % ⇒
the code is **DISCARDED and reported `NOT MEASURED`**, §2.5 carried).

**Missing-data law (binding on all five rows):** `NOT MEASURED` is a legal, reportable outcome (§9.10.4);
**never impute**, never fill an unfilled cell with `0`, never back-fill from memory. A participant whose
key cannot be read (private mode, blocked store) contributes **no STAR-2/STAR-3 cell** — and that absence
is itself reported as a **count**, not silently dropped.

## 4. Readiness gate (what must be true before any star row can be scored)

| # | Precondition | Owner | State (2026-10-17) |
|---|---|---|---|
| G1 | A **deployed, single, frozen** build carrying **GAME-004** (the §11.1 BUT rule) | Orchestrator (unfreeze + deploy) | **NOT MET** — Pages offline (item 89 / ITER-0021); stars are develop-only |
| G2 | The **10-person cohort** recruited and run (5 P + 5 V, §9.4 rules) | **User** (item 47 G4, USER-BLOCKED) | **NOT MET** |
| G3 | An **RF'd runbook addition** for the key read + the replay/quit coding rows | Playtest Analyst | **NOT DONE** (deliberately: no step exists that could be improvised) |
| G4 | The fresh **RF-2/RF-3 manifest + note** (blocking for cohort-v2 session 1) | Playtest Analyst | **OUTSTANDING** (`docs/playtest-log.md` V0.8 banner, §11.0 landing-status note) |
| G5 | **R-004** lands L21–L25 so the 21–30 band has registered levels (STAR-2/STAR-3 band coverage) | Level lane | **PENDING** (item 121's QA-021 green gates it) |

**Until G1–G5 are all met, every row in this file reads `NOT TESTABLE` — never PASS, never FAIL, never
blank, never `0`.** Filling §1's cells requires a coded session table per participant; a finding without
tables is void (§9.9).

## 5. What this file is, in one line

The star era's **falsification contract**: the pair `(2, 10)` is allowed to be replaced by a fitted pair
**by regression on real players** — and the numbers that would do it are written here, per par band,
**before** anyone played.