# Stage 2 — FIELD SHEET (print-and-fill) · current build L1–L5

> Owner: **Playtest Analyst** · V0.2 (PA-005) · 2026-10-15
> **V0.2 (PA-005 — consequential updates only, same commit as the §9.1 BUT table):** the BUT is now
> **committed** (`41d5a4b` — §F1 rewritten; PA-004's "do not run until the build is committed" block is
> resolved; **T6's clock has started**). The OBS-6 recall probe was **upgraded to scored (b) b-7**
> (`playtest-log.md` §9.5 — L5 forced instance only; coding `SAW`/`NOT-SEEN`/`UNCODEABLE`; on L5 asked
> right after Tw, **before CM1**) — R9/PAGE 2/PAGE 3 rows aligned. **Table C is now the bilingual frozen
> script** (zh 正式脚本 + en origin): the PAGE 2 language gap is **closed** — read Table C's zh column in
> Chinese-speaking sessions; this card stays the en reference copy. No threshold moved; still **n = 0**.
> V0.1 (PA-004) · 2026-10-15
> Status: **PRE-REGISTERED · NOT RUN · n = 0.** This file contains **no results, no findings, no
> analysis conclusions** — it is the paper instrument, not data (`playtest-log.md` §9.10).
> Evidence label (ui-ux R-P7 / §9.10.5): every build in this round is **`placeholder art`**.
>
> **What this file is:** the one sheet the moderator + observer hold during a Cohort-P session on the
> **current build (L1–L5 only)**. Every column carries its definition *here* — nobody flips through the
> protocol mid-session. Print pages 1–2 per participant; page 3 is the moderator's pre-session read;
> page 4 is build facts + honest limits.
> **What this file is NOT:** a second spec or a second truth source. It instantiates the canonical
> templates — `stage2-raw-data-sheets.md` **Tables A–F** — for today's build, and cites thresholds
> **only** by `docs/playtest-log.md` §9 clause numbers (T6: no number is invented or moved here).
> Coding manual (full code definitions, inter-rater rule): `stage2-adr0008-gated-protocol-notes.md` §2.
> Hypothesis alphabet: **a′ / b / c′ / d′** — canonical per **ADR-0009 Decision 8**; the withdrawn
> V0.3 letters (a1)/(a2)/(c) survive only in `playtest-log.md` §9.1's do-not-delete mapping table.
> On this build: **(b) live side + (d′) + DoD are runnable; (a′)/(c′) are `NOT TESTABLE ON THIS
> BUILD`** (no door/switch/portal content in l001–l005 — all `doors`/`switches`/`portals` = `[]`;
> release conditions: ADR-0009 Decisions 4/5). The (b) still-image side (b-1/b-2 = V8a/V8b) needs a
> **fresh Cohort V**; without one, record `§3.3 tests NOT RUN — no fresh cohort` (notes §3).

---

## PAGE 1 — Per-level sheet (one per participant · fill during the session)

Header (minimal — the full canonical header is **Table A**, fill it too):

| Participant ID | Date · start | Device · viewport px | **BUT commit** = `41d5a4b` (pre-printed fact — §9.1 BUT / PAGE 4 §F1; copy into Table A; never run a scored session on another build) | Moderator | Observer | Recording ☐ (screen+hands+audio, Table A consent) |
|---|---|---|---|---|---|---|
| | | | | | | |

Level columns are **pre-printed build facts** (program-verified 2026-10-15, PAGE 4 §F2) — the observer
reads them before the session, never during:

| Fact | **L1** `l001` | **L2** `l002` | **L3** `l003` | **L4** `l004` | **L5** `l005` |
|---|---|---|---|---|---|
| Grid · walls | 5×3 · none | 4×4 · none | 5×3 · 1 permanent | 5×4 · 1 perm + 1 ghost | 5×4 · 2 perm + 1 ghost |
| `par` (Solver-proved) | 4 | 5 | 6 | 6 | 6 |
| Lesson beat | tap→move→flip | "flip because **I** moved" | first refusal — wall at 4th col / 2nd row says no **forever** | phantom walk **OFFERED**: ghost `(2,0)` = 3rd col / top row; 3 of 6 par routes cross it, 3 avoid it (via `y=2`, the 3rd row down) | phantom walk **FORCED**: echo `(4,2)` = rightmost col / 3rd row down, **directly below the goal**; all 3/3 par routes and **every** route cross it |
| Never embeds / can embed | — | — | never (permanent obstacle) | embed possible at `(2,0)` | embed guaranteed at `(4,2)` |

### The fill-in grid (rows R1–R12; every row defined in the LEGEND below)

| Row | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| **R1 times** T0 `__:__.__` · T1 `__:__.__` · **M1**=T1−T0 `__s` · win T2 `__:__.__` | | | | | |
| **R2 moves** used `__` / par `__` / Δ `__` | | | | | |
| **R3 refusals** count `__` · **first** refusal: latency `__s` → code `R__` | | | | | |
| **R4 R-tally** R1`_` R2`_` R3`_` R4`_` R5`_` R6`_` | | | | | |
| **R5 switch-hunt** ☐none ☐eyed HUD ☐tapped chrome `______` | | | | | |
| **R6 counts** restart `__` · undo `__` · misclick `__` | | | | | |
| **R7 ghost choice** stepped-on G1 `__` · avoided G2–G5 `__` (detail `____`) | | | | | |
| **R8 embed** events `__` · dwell/event `__s` `__s` · flail ☐☐ · C3 ☐ | | | | | |
| **R9 embed recall** (ask AFTER level end — verbatim; on L5: right after Tw, **before CM1**) `“____________”` · ☐SAW ☐NOT-SEEN ☐UNCODEABLE (**b-7 — scored on L5**, §9.5) · re-entry ☐Y ☐N ☐hesitant | | | | | |
| **R10 hints** H1 `__` · H2 `__` · H3 `__` *(H2/H3 ⇒ level excluded from D-1)* | | | | | |
| **R11 confusion** `C#@__:__ “____”` · freezes `__` | | | | | |
| **R12 spontaneous rule statement** ☐ @`__:__` `“____”` · key ghost crossed in winning attempt: ☐Y ☐N *(L5: structural — pre-tick Y)* | | | | | |

Session-level (not per level): **Quit Level** `____` · **Aha Moment** (level · move · verbatim)
`____` · script deviations `____` → copy into **Table A footer**.

---

### LEGEND — every column, defined (print with PAGE 1)

**Source key:** `[E]` = a shipped `EventBus` event exists that carries this fact (future telemetry can
auto-fill it); `[M]` = **manual only** — no event exists or the fact is human behaviour; `[E+M]` = the
event anchors *when*, the human codes *what*. ⚠ **Today every cell is manual**: the build has **no
telemetry sink** — the bus feeds the HUD/renderer only, nothing is persisted, and §9.8 (YAGNI)
forbids adding analytics for this test. `[E]` marks what a *future instrumented round* could fill.
Real event names + payloads: `src/game/systems/event-bus.ts` (`GameEvents`), emitted in
`src/game/systems/session.ts`. Dispatch-level aliases reconcile 1:1 — see §E0 below.

| Row / code | What you write (one line) | Source | Future auto? | Feeds (canonical destination) |
|---|---|---|---|---|
| **R1** T0 | stopwatch/recording time the board is **visible** | [M] (`levelStarted` fires for L2–L5 only; the L1 boot has **no** bus event — instrumentation gap, flagged) | partly | Table B "T0" · M1/M2/M3 (§9.8 timing table) |
| **R1** T1 / M1 | time of **first intentional legal move**; M1 = T1−T0 in s | [E+M] `move` (first) — "intentional" is a human judgment | anchor auto, judgment manual | Table B "T1"/"Understand Time" · M1 · DoD **D-4** (§9.7) |
| **R1** T2 | time the **win dialog appears** | [E] `levelWon` | yes | Table B "T2" · M2/M3 · DoD **D-5** (§9.7) |
| **R2** moves/Δ | move counter shown in HUD at win; Δ = moves − par (par pre-printed) | [E] `levelWon.moveCount` vs `level.par` | yes | Table B "Moves/par/Δ" · M3 · (d′) **d′-8** (§9.6) |
| **R3** refusals | count of taps/swipes where **nothing moved AND the phase chip did not change** | [E] `refused` (fires per refusal; `phaseChanged` absent) | yes | Table B "Refusal count" · M4 · (d′) **d′-7** |
| **R3** first-refusal latency + code | seconds refusal→next input; code the **first action** (R1–R6 below) | [E+M] `refused` anchors Tr0; code is human | anchor auto, code manual | Table B "Post-refusal codes" · M4b · (d′) **d′-3/d′-4**; the L3-vs-L4 latency contrast is OBS-4 |
| **R4** R-tally | all refusals this level, by code | [M] | no (codes are behaviour) | M4b distribution → Table D |
| **R5** switch-hunt | did they look/tap for a **"flip day/night" control** (we deliberately ship none)? tick + what they touched | [M] | no | feeds **R6** tally + **C2/C4** verbatim (R11); OBS-3/OBS-4 |
| **R6** restart | Restart button / `R` key presses | [E] `restart` | yes | Table B "Restart count" · M5 · (d′) **d′-5** |
| **R6** undo | Undo button / `Z` key presses | [E] `undo` | yes | Table B "Undo count" · M6 · (d′) **d′-6** |
| **R6** misclick | taps on a **non-adjacent** cell / cell edge / off-board — these are **non-inputs** (R-T3: no event, no feedback): count from the hands recording. Never mix into R3! | [M] — **no event exists by design** | **no** | Table B "Misclick" · M8 / **C9** |
| **R7** ghost choice | at a moment where stepping onto a ghost **and** a different legal move both exist: stepped on (G1) vs avoided (G2–G5) | [M] board reading | no | M13 GAR + M13b → Table D · (b) **b-6**, (d′) **d′-9** (GO denominator recomputed by the analyst from recording + level data) |
| **R8** embed events/dwell | each time the player **stands inside a solidified tile**: count; dwell = flip-resolution → next legal move (Te0→Te1), 0.1 s from recording (±1 s live ⇒ label `live-timed`, T8) | [E+M] `move.playerEmbedded=true` marks the event; windows are human-timed | event auto, window partly | Table B "Embedded/M14/M15" · (b) **b-3/b-4** (§9.5) |
| **R8** flail / C3 | inside a dwell window: ≥2 refusal/repeat taps, restart/undo <3 s after landing, or "am I stuck/broken?" ⇒ flail ☐ + C3 ☐ | [M] | no | M15 · (b) **b-4/b-5** |
| **R9** embed recall | **after level end only** (never mid-window — asking contaminates M14/M15); on L5: right after Tw, **before CM1** (§9.8 step 6): OBS-6 one-sentence probe, verbatim → tick `SAW` / `NOT-SEEN` / `UNCODEABLE` (coding rules: §9.5 b-7) | [M] — **scored: (b) b-7 on L5** (§9.5, PA-005 upgrade); L4 offered = context | no | (b) **b-7** (§9.5) · E1 branch b-i/b-ii (PAGE 4 §F3) · string frozen in **Table C row `OBS-6`** (zh + en) |
| **R9** re-entry | after walking out / undoing out of an embed: did they enter a ghost **again** unprompted? Y/N/hesitant | [M] | no | (b)-iii context (OBS-8) |
| **R10** hints | ladder rungs used: **H1** stall (20 s no input or 3 consecutive refusals) — say the H1 line, 0 hints · **H2** (+30 s or help request) — "Look at what changes when you move." = 1 hint · **H3** (wants to stop or 90 s stall) — offer one demonstrated move ⇒ session `assisted` · **H4** quit — thank, stop, no persuasion. **Frozen zh lines: Table C rows `H1`/`H2`/`H3` (PA-005) — read them verbatim, never improvise a translation** | [M] | no | §9.7 ladder · H2/H3 exclude the level from **D-1** and score against the participant; **H3 also excludes the participant from b-7's denominator (§9.5)** |
| **R11** confusion flags | code + time + **verbatim quote** (free text goes in the quote, never in the code). Trigger: wrong-model verbalization / "huh?" / freeze ≥5 s / help request (notes §2.1). Uncodable ⇒ write the quote, no code — analyst counts the discard | [M] | no | Table B "Confusion flags" · M9 · C3→(b) **b-5**, C5→(d′) **d′-2**, C7/C8 cap →(a′) **a′-4** *(C7/C8 cannot fire on this build — no doors/portals)* |
| **R11** freezes | count of ≥5 s no-input-with-eyes-on-board | [M] | no | M9 trigger (Tf0→Tf1, §9.8) |
| **R12** spontaneous rule statement | participant states the rule **correctly, unprompted** — never prompt it; time + verbatim | [M] | no | Table B last row · M16/T3 · supports DoD **D-1** context |
| **R12** key ghost crossed | did the **winning attempt** actually cross the ghost tile? L4 `(2,0)`: Y/N. L5 `(4,2)`: structural (every win crosses it — verified PAGE 4 §F2), pre-tick Y | [M]/analyst | no | M13b · (b) **b-6** (§9.5) |

**Code vocabularies (abridged from notes §2 — that file governs):**

- **R1–R6** (first action after a refusal): **R1** re-taps same tile blindly · **R2** looks at/points
  at/names the causing tile ("oh, that one") · **R3** different legal move within 3 s · **R4** restarts
  · **R5** undoes · **R6** "it's broken / didn't register" / looks at moderator / **taps UI chrome
  (incl. hunting a phase-switch button)** ⇒ R6 is a §6.5 bug signal, ceiling **d′-4**.
- **C-codes fireable today:** **C1** "which tiles can I walk on?" · **C2** "why did the world change?"
  / attributes flip to timer · **C3** "am I stuck/trapped/is this broken?" (embed) · **C4** "why didn't
  that move work?" (refusal) · **C5** "I have to remember/count steps" · **C6** "where do I go?" ·
  **C9** mistap (input, never comprehension — M8). **C7/C8** (door/portal) — **cannot fire on this
  build**; record any such quote as an uncoded verbatim.
- **G1–G5** (at a ghost opportunity): **G1** steps onto ghost · **G2** takes the non-ghost alternative
  · **G3** freezes ≥3 s facing it, does something else · **G4** taps a currently-solid tile (inverted
  misread) · **G5** says "that's a wall/can't go" about a ghost (also flag C1). G2–G5 = avoidance.
- **Timing anchors (§9.8):** T0 board visible · T1 first legal move · T2 win · T3 spontaneous rule
  statement · Te0→Te1 embed dwell window · Tr0→Tr1 refusal→next input · Tf0→Tf1 freeze · **Tw = the
  15 s no-prompt window after the L5 end dialog appears** · Tq participant stops.

**§E0 — column ↔ code-event reconciliation (requirement: one event per column, named as shipped).**
The dispatch-level names map 1:1 onto the shipped bus; use the **shipped** names in any future
instrumentation request:

| Sheet fact | Dispatch alias | **Shipped event (payload)** — `event-bus.ts` / `session.ts` | Note |
|---|---|---|---|
| level begins (L2–L5) | `level_started` | **`levelStarted`** `{level}` | **L1 boot emits nothing** (constructor path) — a future auto-fill needs a boot event; today it changes nothing (all manual) |
| refusal | `move_refused` | **`refused`** `{level, moveCount, phase}` | no movement, **no `phaseChanged`** — the chip staying put is the designed cue (§6.5) |
| legal move / embed marker | — | **`move`** `{level, moveCount, phase, playerEmbedded}` | `playerEmbedded=true` **is** the embed-event flag (Te0) |
| undo | `undo` | **`undo`** `{level, moveCount, phase}` | |
| restart | — | **`restart`** `{level}` | **correction:** the dispatch described `level_won` as carrying `restartCount` — it does **not**: shipped `levelWon` = `{level, moveCount}` only, and no `restartCount` exists anywhere in the build. Restart counts come from `restart` events (or R6 manual tally) |
| win | `level_won` | **`levelWon`** `{level, moveCount}` | T2 anchor; HUD shows the dialog one `flipTimings.total` later |
| next level / prototype end | — | **`levelAdvanced`** `{level, finished}` | at L5 the Next button is **hidden** (`hud.ts showWinPanel`) — `finished:true` only via Enter |
| phase flip | — | **`phaseChanged`** `{from, to}` | V-CL timing anchor |
| misclick (M8/C9) | — | **none — by design** (R-T3 non-input) | manual only, forever, unless input logging is ever added |

**D1/D2/D3 ruling (dispatch item 2).** The draft sheet's per-level `Confusion: D1? D2? D3?` column is
**deleted**. Reason: **`D2`/`D3` are defined nowhere** in `playtest-log.md`, the coding manual, or
Tables A–F — an unexplainable symbol in the field is worse than no symbol. **`D1` is defined**, but as
a **once-per-session verbatim probe after L5** ("think ahead / remember things / neither", Table C row
`D1`, thresholded at (d′) **d′-1**, §9.6) — not as a per-level confusion code. It therefore lives on
the **PAGE 2 probe card**, and per-level confusion is coded **C1–C9 only** (R11). Do not confuse the
probe `D1` with §9.7's DoD rows `D-2`/`D-3` — those are computed from CI-beh/CI-self/M12, which this
sheet already collects; no field column named D2/D3 exists or may be added.

---

## PAGE 2 — Probe card (session order · read verbatim)

> Canonical verbatim strings live in **Table C** (`stage2-raw-data-sheets.md`) — reproduced here for
> printing; **if this card and Table C ever differ, Table C governs (both columns).** Moderator rules
> (§9.3): explain nothing, react with "mm-hm" only, never say parity/ghost/echo/phase-wall first, never
> re-ask beyond one repetition. Any improvised wording on a scored item ⇒ mark `SCRIPT DEVIATION`
> (Table A footer); on a scored item it can invalidate the session (T7).
> **Language (SOLVED — PA-005): Table C is now the bilingual frozen script.** In Chinese-speaking
> sessions read Table C's **zh 正式脚本** column — frozen at the BUT commit, **no rewriting during the
> session**; in English-speaking sessions read the **en origin** column. This card reproduces the en
> origin for reference only; improvising a translation on a scored item = script deviation (T7).
> **Row order below = session order** (§9.8 steps 4–7): V-CL mid-game · P-probe mid-L4 (not run on this
> build) · at the L5 end dialog: **Tw/CI-beh first, then OBS-6, then the CM block** (OBS-6 must precede
> CM1 — CM3 would prime the recall b-7 measures).

| # | When | Ask / do (verbatim — en origin; zh sessions read Table C's zh column) | Tick + write |
|---|---|---|---|
| **V-CL** | right after **L2** win | "Why did the world change?" | ☐ because I moved ☐ automatic/timer ☐ don't know · quote `____` → (d′) d′-10 |
| **P-probe** | mid-L4, paused | "Can you step onto this tile? Why?" ×4 tiles | **NOT RUN on this build — the §9.1 BUT table records `NOT MARKED`** ((a′) = `NOT TESTABLE ON THIS BUILD`) → record NOT RUN |
| **CI-beh** | **at the L5 end dialog — BEFORE any question**: start **Tw = 15 s**, say nothing | *(observe)* The build shows "原型结束 / Prototype over" with **no Next button** (structural no-prompt). Sought = taps around/probes for a way on, "还有吗/is there more?", reaches for the device; passive = settles, puts it down, looks at you; **Replay pressed = tick separately with t=__s** (raw fact; analyst codes) | ☐ sought ☐ passive ☐ replay@`__s` → with CI-self feeds **D-2** (M11) |
| **OBS-6** | **right after Tw closes, before CM1** (the L5 embed is forced). After an **L4** embed: on the L4 win dialog, before Next is pressed. **Never inside an M14 window** | "In one sentence — what just happened on that tile you stepped on?" (zh: Table C row `OBS-6`) | verbatim `____` → R9 · ☐ SAW ☐ NOT-SEEN ☐ UNCODEABLE (coding rules: §9.5 b-7) · **scored = (b) b-7 on L5 only**; L4 answers = offered-exposure context |
| **CM1** | after OBS-6 | "In your own words, what is the rule of this game?" | ☐ flip-on-move ☐ phase-dependent passability → D-1 |
| **CM2** | after CM1 | "If you tap a wall that is solid right now, what happens?" | ☐ nothing moves, world doesn't change ☐ other → D-1 |
| **CM3** | after CM2 | "Why can you sometimes walk onto a tile that looked like a wall?" | ☐ when/which step I arrive ☐ other ☐ n/a |
| **D1** | after CM3 | "Did the game feel like it was asking you to **think ahead**, to **remember things**, or **neither**?" | ☐ ahead ☐ remember ☐ neither → (d′) d′-1/d′-2 context |
| **CI-self** | right after D1 | "On a scale of 1 to 5, how much do you want to play Level 6 right now?" | 1 2 3 4 5 → **D-2** (needs CI-self ≥4 **and** sought) |
| **V8b** | very end of session (after CI-self) | "Is the player inside that wall a **bug**, or **part of the game**?" (zh: Table C row `V8b` — anti-leading wording, frozen) | ☐ part of the game ☐ bug ☐ unsure — **a P-cohort answer is context, NOT the §3.3 fresh-viewer test** (notes §3 cohort rule); b-2 is scored on Cohort V only |
| **CM-D / CM-GL / CM-P** | — | — | **NOT RUN on this build** — no door/switch/portal content ⇒ **(a′)/(c′) = `NOT TESTABLE ON THIS BUILD`** → the fixed string is **pre-filled in Table F** (PA-005); never blank, never `0` |

Footer: Quit Level (M12) `____` · Aha Moment (M10) `____` · validity VALID/INVALID + reason `____`
→ Table A.

---

## PAGE 3 — Minimal observation program, runnable today (OBS-1…OBS-10)

> **One moderator + one observer, ≈25 min/participant (§9.4).** Everything between the probes is
> **silent free play** — the only things the moderator ever says are the §9.7 ladder lines and the
> PAGE 2 verbatims. Each OBS says: where · what the player does · which second/response to watch ·
> where it lands. OBS items **invent no thresholds**; they fill the §9 cells named in the last column.
> The three (b) failure modes are kept **distinguishable** (PAGE 4 §F3 explains why that matters):
> **b-i didn't SEE** (OBS-6) vs **b-ii saw, read as BUG** (OBS-7) vs **b-iii read as MECHANIC**
> (OBS-8).

| # | Where | Player does | Watch (which second, what) | Write in | Feeds |
|---|---|---|---|---|---|
| **OBS-1** | L1, device handed over already on L1, recording on | free play, silence ("Here you go.") | T0→T1: is the **first tap** deliberate or exploratory? T1→T2: any stall? No question ever | R1, R2 | M1/M2 · DoD **D-4/D-5** (§9.7) |
| **OBS-2** | right after **L2** win | answers one question | the V-CL reply within ~3 s: "**I** moved" vs "it changes by itself/timer" | probe card V-CL | (d′) **d′-10**; <4/5 ⇒ Variant CL (pre-committed, §9.11) |
| **OBS-3** | **L3**, first refusal (the greedy tap at the 4th-col/2nd-row wall) | free play | **Tr0 + 3 s**: eyes/hands — do they go to the **HUD** (phase chip, Undo, Restart) as if hunting a day/night switch? did the **phase chip stay put**? first action = R-code | R3, R4, **R5** | M4b · (d′) **d′-3/d′-4**; R6+chrome-tap = the "where's the switch button" signal |
| **OBS-4** | **L4**, first refusal | free play | same coding as OBS-3, then **compare latency L3 vs L4**: fast R2/R3 ⇒ the L1–L3 rule is still held at L4; freeze/R1/R6 ⇒ it isn't. **Never ask "do you remember"** — the latency contrast *is* the memory measure | R3, R4, R5 | (d′) retention reading (d′-3/d′-4 cells; the contrast itself is analyst context) |
| **OBS-5** | **L4**, at the ghost `(2,0)` (3rd col / top row) | free play | the choice moment: both the ghost entry **and** the `y=2` detour (3rd row down) are legal — step on (G1) or avoid (G2/G3/G5)? any "that's a wall" verbalization (=G5+C1)? | R7, R11 | M13/M13b · (b) **b-6** offered-exposure context · (d′) **d′-9** |
| **OBS-6** | **L4 or L5**, the embed event (player lands on the ghost, it solidifies underfoot) | free play; **after level end**, one probe (on L5: right after Tw, **before CM1** — §9.8 step 6) | **live (Te0+0–3 s, intervene never):** do they look at their own tile, or exit/act as if nothing changed? **after level end:** ask the one-sentence recall (Table C row `OBS-6`, zh/en frozen): "In one sentence — what just happened on that tile you stepped on?" Coding (**§9.5 b-7**): mentions the tile changing/solidifying — **including bug-flavoured readings** — ⇒ **`SAW`**; describes only own movement / "nothing" ⇒ **`NOT-SEEN`** (b-i evidence); "don't know"/off-topic ⇒ **`UNCODEABLE`** (T9). A bug-flavoured `SAW` ("broken/glitch/didn't save") **also** feeds C3/R8 flail as usual — one measurement, one threshold | R8, **R9** (verbatim + tick) | **(b) b-7 — SCORED on L5** (§9.5, PA-005); L4 = offered-exposure context; E1 branch b-i/b-ii (§F3); M14 window untouched (probe is strictly post-level, like §9.8 step 7's V8b discipline) |
| **OBS-7** | **L4/L5**, inside each embed dwell window | free play | **Te0→Te1**: dwell length; ≥2 refusal/repeat taps; restart/undo **<3 s** after landing; C3 words ("stuck?", "broken?", "did it not save?"); eyes to moderator | R8 (dwell/flail/C3), R11 | (b) **b-3 (M14) / b-4 (M15) / b-5 (C3)** — §9.5 scored cells |
| **OBS-8** | **L4** after walking out / undoing out; **L5** approach | free play | **re-entry**: when a ghost is enterable again, do they step in **unprompted a second time** (Y), detour (N), or pause first (hesitant)? **L5**: after refusals at the two permanent walls, do they route to the echo below the goal **without** hesitating at it? | R9 (re-entry), R7 | (b)-iii "reads as mechanic" context (no separate threshold — b-1…b-7 stay the scored set) |
| **OBS-9** | **L5 win → end dialog** ("原型结束 / Prototype over", **no Next button** — build fact) | nothing is offered; silence | start **Tw (15 s)** the moment the dialog appears: do they **hunt for Level 6** (tap around, "is there more?", reach for the device) or go passive? Replay press = tick with time, don't interpret live. **No persuasion ever** (M12 rule) | probe card CI-beh | M11 · DoD **D-2** (§9.7) — the §2 question |
| **OBS-10** | after Tw | answers the probe card | read **OBS-6 → CM1→CM2→CM3→D1→CI-self→V8b** exactly in that order (OBS-6 before CM1: b-7's anti-priming rule, §9.5/§9.8 step 6); tick, quote verbatim, never paraphrase, never explain; zh sessions read Table C's zh column | probe card | DoD **D-1/D-2** · (d′) **d′-1/d′-2** · (b) **b-7 + b-2-context** |

> **OBS-6 note (PA-005 — UPGRADED to scored, window now closed):** the one-sentence recall probe was
> **new in PA-004**, recorded as context because V8b alone cannot separate "didn't see the tile change"
> (b-i) from "saw it and calls it a bug" (b-ii) — and because b-3…b-6 all pass for a cohort that never
> perceived the beat (a hollow (b) PASS; PAGE 4 §F3). PA-004 pre-registered the only legal upgrade path:
> "must be added to §9.5 **before** the §9.1 BUT table is committed — after that, T6 freezes
> everything." **Executed at PA-005 (2026-10-15), in the same commit as the BUT fill:** the probe is
> now **(b) b-7** (`playtest-log.md` §9.5 — coding rules, denominator, threshold form cited from b-6,
> E1 branch rule; administration pinned in §9.8 step 6). Scored on **L5 only** (the forced instance);
> L4 answers remain offered-exposure context. The string itself is frozen in **Table C** (zh + en).

---

## PAGE 4 — Build facts, program evidence, honest limits (read before scheduling; never filled)

### §F1 BUT status — ✅ committed (PA-005, 2026-10-15)

- **The BUT is filled and committed:** `playtest-log.md` §9.1 names build **`41d5a4b`** (develop HEAD
  at fill; game code byte-identical to the `9c4b5a1` baseline — `git diff 9c4b5a1 41d5a4b -- src/
  scripts/ package.json` is empty, sole delta `docs/project-status.md`; the §9.1 same-BUT rule covers
  docs-only descendants, incl. the PA-005 commit itself). **PA-004's blocker — "an uncommitted working
  tree is not a valid BUT; do not run a scored session" — is resolved**; scored sessions may now be
  scheduled. ⚠ **T6's clock has started at the BUT commit:** no §9 threshold, level index or probe
  wording may be edited any more; mid-round corrections go to Table F and apply to the next round.
- **Entry:** `npm run dev` → `http://localhost:5173` (vite `server.host: true` — LAN URL for the
  participant's own phone, §9.4). `?level=<n>` is a **dev/E2E/setup entrance only** (falls back to L1
  out of range; nothing persists; no win is bypassed). A scored session **starts at L1**; using
  `?level=` to skip mid-session = script deviation on a scored item (T7).
- **Evidence re-run at fill time on `41d5a4b` (not copied):** solver audit → 5/5 PASS, `par`
  4/5/6/6/6, `deadStates=0`, `RESULT: PASS`; out-of-repo route enumeration over the shipped rules →
  l004 = 6 par routes / 3 embed / 3 embed-free (**offered**), l005 = 3 / 3 / 0 + no embed-free route
  at any length (**forced**) — §9.1 rows 3–4.
- Verified playable (Orchestrator field-check, 2026-10-15): L1–L5 · keyboard + HUD buttons · Undo /
  Restart · win dialog · Next (hidden at L5) · trusted-input (CDP) tap moves the piece — tap an
  **adjacent** cell (R-T3: non-adjacent taps are silent non-inputs, counted as **misclicks**, never as
  refusals).

### §F2 Level facts — program-verified 2026-10-15 (reproduce, don't trust)

Gate: `npx tsx scripts/solve-levels.ts` → **5/5 PASS**, `par` 4/5/6/6/6 Solver-stamped, zero dead
states. Route enumeration: out-of-repo BFS harness driving the **shipped** `applyMove`/`solidAt`/
`isGoal`/`hashState` (one truth source; method mirrors the §9.1 program check):

| Level | par | shortest routes | routes containing an embed | embed-free route of ANY length | Reading |
|---|---|---|---|---|---|
| `l001` | 4 | 1 | 0 | yes | no walls — flip literacy |
| `l002` | 5 | 10 | 0 | yes | no walls — causality |
| `l003` | 6 | 6 | 0 | yes | `(3,1)` permanent obstacle — **never embeds** |
| `l004` | 6 | **6** | **3** (via ghost `(2,0)`, entered in A, solid in B) | **yes — 3 par routes via `y=2` (3rd row down)** | phantom walk **OFFERED** (matches §9.1/§9.5: "offered, never scored as the forced instance") |
| `l005` | 6 | **3** | **3/3** (via echo `(4,2)`, the goal's only enterable neighbour) | **NO** | phantom walk **FORCED** — the (b) precondition (`level-design.md` V0.4 §2 L5) |

> **Dispatch correction (recorded, with evidence, per anti-fabrication duty):** the PA-004 task text
> attributed "3/3 shortest routes must cross the wall ⇒ forced phantom walk" to **`l004`**. The program
> check on the shipped level JSON says otherwise: that is **`l005`'s** fact (3/3, and no embed-free
> route at any length); `l004` has **6** par routes of which **3 are embed-free** ⇒ offered, exactly as
> `playtest-log.md` §9.1/§9.5 and `src/levels/README.md` §2 already state. The sheet follows the
> program, not the prose. Consequence for the field: **the forced (b) instance is L5; L4 is offered
> exposure only** — never score L4 as forced (§9.5).

### §F3 The readability risk this sheet is built around (why b-i / b-ii / b-iii must stay separable)

Measured on the shipped token record (`src/game/theme/tokens.ts` derived tokens; WCAG greyscale
relative luminance; recomputed by the Analyst 2026-10-15 — matches the Orchestrator's renderer
measurement):

| Pair | Phase A | Phase B | Meaning |
|---|---|---|---|
| ghost fill `wallEchoFill` vs embedded interior `wallOccupied` | **1.15:1** | **1.28:1** | the solidified-underfoot tile's interior is **near-identical in greyscale to a passable ghost's fill** — the "it changed" beat may be invisible in fill |
| what still carries it: retained 2 px edge stroke `wallEdge` vs `wallOccupied` | **4.29:1** | 3.65:1 (published, ui-ux §4.5/§4.6) | edge + 88 % coverage outline (vs ghost 80 % hollow) + the player drawn on top + one-shot `fx.phaseRing` (140–220 ms) are the **only** separation channels |

**Real-render occupied audit (PA-004 harness, retained l004 occupied-frame screenshots, re-run
2026-10-15):** in the sampled **tile-centre 42 % region** of the occupied tile, the player body
(`actorBodyB`) covers **100.0 %** and the `wallOccupied` fill visible there is **0.0 %** (ghost tile by
contrast: 83.8 % `wallEchoFill`) — the solidification *fill* change is **literally invisible at the tile
centre**; the beat rides on the retained edge/outline + the one-shot ring alone. This is the concrete,
measured risk **(b) b-7** scores (PA-005, §9.5).

So (b)'s realistic failure is not one thing but three, and they have **different fixes** — the sheet
must tell them apart:

- **b-i didn't SEE the change** ⇒ a §4-band token/emphasis problem for UI-Art (fix inside R-E/R-E2a,
  never a bigger nudge — §6.3/§6.5 prohibitions). Detected by **OBS-6 recall probe** (**scored as b-7
  since PA-005** — `NOT-SEEN`-dominant failures route E1 here) + short dwell with no flail.
- **b-ii SAW it, reads it as a BUG/trap** ⇒ R-C13 presentation problem (E1 path, §9.9 V3). Detected by
  **OBS-7**: long dwell, flail, C3, restart/undo <3 s, "didn't save".
- **b-iii reads it as MECHANIC** ⇒ success signal. Detected by **OBS-8**: unprompted re-entry, direct
  L5 approach.
- This pair (`wallEchoFill`/`wallOccupied`) is **not published** in ui-ux §4.5/§4.6's tables — the gap
  itself is flagged to the UI / Art Director via the PA-004 handoff (this file records it, `ui-ux.md` is
  not mine to edit).

### §F4 What today's sheet canNOT answer (record, never guess)

- **(a′) latch readability / (c′) portal readability:** `NOT TESTABLE ON THIS BUILD` — no
  door+switch level (release: D3 set L6–L10 ships + Solver gate, ADR-0009 Decision 4) and no
  opposite-colour portal level (release: L11+, Decision 5). The fixed string is **pre-filled in Table F
  (PA-005)** with both release conditions; it is a legal reportable outcome (§9.10.4), never a pass,
  never a fail, never blank, never `0`.
- **b-1/b-2 (V8a/V8b still-image gate):** need **fresh Cohort V** + the frozen screenshot set — §9.1's
  last row records it as **`NOT CAPTURED` at BUT commit** (capture list there; §9.4 disjointness).
  Without fresh viewers: `§3.3 tests NOT RUN — no fresh cohort`.
- **No cohort has run. n = 0.** Every cell in this file's PAGE 1–2 is empty on purpose; §6/§7/§10 of
  `playtest-log.md` stay empty until Tables B/C exist (§9.10.1). **T6 is now in force** (BUT committed,
  PA-005): no threshold may be edited any more — mid-round corrections go to Table F, next round only.

### §F5 Column-merge honesty log (dispatch item 7 — what PAGE 1 drops vs canonical Table B, and why)

| Dropped / merged from Table B | Where it went | Why |
|---|---|---|
| separate T0/T1/T2/Understand/First-Win/Completion rows (6 rows) | **R1+R2** (2 rows) | six near-empty timing rows is why sheets go unfilled; M2's session-level variant is computed by the analyst from R1 across levels |
| "Ghost Opportunities (GO) count" + exact GAR | **R7** raw tallies only | live GO adjudication ("did a different legal move also exist?") is board analysis, not observation — the analyst recomputes GO/GAR from recording + level data; the field only tallies what the player did |
| per-event M14/M15 rows | **R8** (≤2 events/level inline) | l004/l005 admit few embed events per attempt; more than 2 ⇒ restart-heavy session, itself visible in R6 |
| standalone P-probe / CM-D / CM-P / CM-GL per-level placement | PAGE 2 card, marked NOT RUN | not runnable on this build (§F4) |
| `Confusion: D1? D2? D3?` (draft-sheet column) | **deleted** → R11 (C1–C9) + PAGE 2 `D1` probe | D2/D3 undefined anywhere; D1 is a post-L5 probe, not a confusion code — full ruling in the LEGEND |
| `Continue?` / `Next level wanted?` (draft-sheet columns) | PAGE 2 **CI-beh** (15 s no-prompt window, sought/passive/replay) + **CI-self** (1–5) | two undefined free-text columns replaced by the one canonical M11 pair that **D-2** (§9.7) is computed from — one measurement, never two thresholds (§9.6 retention-row rule) |
| `a1: … a2: … c: …` (draft-sheet columns) | **deleted** — no hypothesis columns exist on the sheet at all | withdrawn V0.3 letters (playtest-log §9.1 mapping); hypotheses are verdict-level, computed by the analyst into **Tables D/F** from R1–R12 + PAGE 2 — the field never writes "a1/b/c′" per level. Canonical alphabet today: **a′/b/c′/d′** (ADR-0009 Decision 8); (a′)/(c′) = `NOT TESTABLE ON THIS BUILD` (§F4) |
| `M0 walls` (draft-sheet column) | PAGE 1 pre-printed **fact header** + PAGE 4 **§F2** | a per-participant "walls" column asked the observer to re-record static build facts mid-session; build facts are printed once, program-verified, never filled |
| `L1/L2/L3 …` (draft-sheet columns) | PAGE 1 grid, columns **L1–L5** (L6 dropped, see below) | the level columns survive — now with pre-printed par/beat/ghost-position facts so nobody decodes a level id at the table |
| L6 column | **deleted** | the build has 5 levels; `?level=6` falls back to L1; "wants L6" is measured by CI-beh/CI-self at the L5 end dialog (OBS-9), not by an L6 column |

Nothing scored by §9 is lost by these merges: every §9.5/§9.6/§9.7 cell is still collectable from
R1–R12 + PAGE 2 (mapping in the LEGEND's "Feeds" column). Anything the analyst cannot recompute from
this sheet + the recording is reported `NOT MEASURED` (T9), never back-filled (§9.10.2).
