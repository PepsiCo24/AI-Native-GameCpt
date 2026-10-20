# ADR-design-0010 — the XOR multi-switch door DEVICE RULING (option (a) DERIVABLE + the `G2-X` effective-press contract), the `par 28` reservation's RELEASE, and the pre-published `batch-seam` relief **instance 7** (`L50→L51`)

> Owner: **Agent 1 — Game Designer** · Task **GD-014** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> Law text: `docs/level-design.md` **§7.10.8** (the XOR device ruling, the `H`/XOR device contract **C1–C4**,
> the `G2-X` obligation, and the comprehension plan), **§7.10.9** (the `par 28` release and the `L51–L55`
> ladder law **`[24,26,28,28,28]`**) and **§7.10.10** (the instance-7 label, verbatim, plus a register rider
> and finding **`F-GD014-1`**); the register row is `docs/level-design.md` **§7.3.1** instance **7**.
> Rider, not an edit: **ADR-design-0008** (the Act III band, the `L41–L45` opener rule and its **O2/O3
> ceiling reservation**, star totality, the `act-open` relief) and **ADR-design-0009** (the interior-batch
> rule **B1–B7**, the `L45→L46` seam relief instance 6, the register-wide relief-admissibility test) are
> **quoted and extended, never rewritten**. *A rider to 0009's test is disclosed below — one reading added,
> nothing narrowed.* ADR-design-0005 / -0006 / -0007 and `docs/game-design.md` §14.2 are **not touched**.
> Scope: **no code.** This ticket writes no `src/**`, no `scripts/**`, no `tests/**`, no level byte and no
> constant. Every number is **read from `src/core/solver/policy.ts`** (constants, cited with their computed
> values) or **read from shipped code by file:line** or **derived from published law** by the arithmetic
> shown. The trigger is `docs/project-status.md` items **154** and **159**: LV-018 handed the XOR / `H`
> both-pair **device-contract question** to **Game Designer + Architect** and wrote that **the `par 28` top
> is reserved for whatever answer comes**; §7.10.7's closing paragraph coupled the tail's ladders and the
> reservation's **release clause** to that answer **by name**; user ruling **U-002** placed the XOR debut in
> the act's **second half**, i.e. this era.

> **STATUS — 2026-10-20, GD-014b (corrigendum).** The `G2-X` **reader text** published in §7.10.8.2 C2 is
> **CORRECTED** by the Game Designer (this lane owns that text) under **ADR-architecture-0006 §4.2/§4.3**
> (`docs/architecture.md` §17.3), which is **normative** for the instrument: the wrong field path is fixed
> (`route[i].state.doorsOpen[d]`), and C2.2/C2.3 — **refused by measurement** (0 / 17 732 toggling arrivals
> changed their own target door; 30 847 crossings open at the **entry** state, 0 at the arrival) — are
> replaced by the **entry-state leg + counterfactual-replay** witness, with the refused original kept
> verbatim in a **dated supersession record** at `docs/level-design.md` §7.10.8.2. **The RULING ITSELF IS
> UNCHANGED:** option **(a) DERIVABLE**, the **`G2-X` capability** (a `scripts/**`-only reader, no new core
> surface), the **`par 28` release arithmetic** (floor `31.7500` > `31.0625`, margin `0.6875`), the ladder
> **`[24,26,28,28,28]`**, and the **instance-7 bound** `[−2.667021, −1.354521]` all stand **exactly as
> published**. The only other GD-014b change is **typing, not value**: instance 7's comparator constants are
> re-pinned to the register's **PIN-LITERAL** form per §17.4 (`50` / `30.417021` as
> `_PREVIOUS_LEVEL_ID_AT_REGISTRATION` / `_PREVIOUS_EXEC_AT_REGISTRATION`, delta **derived from the pin**,
> `near()` assertion on the frozen pair) — the **values, the bound and the ledger arithmetic do not move**;
> the register-wide form law is now law-text at `docs/level-design.md` §7.10.10.

---

## Why this is its own ADR (and not a §-edit inside ADR-design-0008 or -0009)

ADR-design-0008 legislated the Act III **band**, the **opener** (`L41–L45`), star totality, the `act-open`
relief and the mechanics stance — and **withheld** the derived top rung `par 28` from the opener on a
measurement (O2/O3), saying nothing about *who may spend the reservation or when*. ADR-design-0009
legislated the **interior batches** (`L46–L50`, `L51–L55`, `L56–L60`) as a rule (B1–B7) and extended O3's
scope to `L41–L50` (B3) — and then, in its own words, **left the tail's ladders and the reservation's release
coupled to the XOR device question by name**. This ruling is that coupling resolved, and it does four things
neither 0008 nor 0009 could do:

1. it **answers a device-contract question posed to two roles** (Game Designer + Architect) where the answer
   is *neither* option as posed — it is **option (a) DERIVABLE**, and it says so from a **read of shipped
   code**, not from a preference;
2. it **publishes a NEW proof obligation on landed bytes** — `G2-X`, the XOR-aware press-then-cross reader
   — which is a gate the level lane must encode **before** its census, and which the shipped readers
   cannot satisfy (they test `targets` **membership**);
3. it **releases a reservation that 0008 established and 0009 extended**, and it does so **by arithmetic**
   (the released class's floor is `0.6875` above the first half's ceiling), then **spends the act's entire
   remaining headroom exactly**;
4. it publishes **pre-emptively** two pieces of law the release makes reachable for the first time: a
   **register rider** (a `par`-term-negative **rise** still owes an entry, published as a *rise*) and a
   **finding** (`F-GD014-1`: a registered instance's left side is a published number and may not move after
   registration).

The alternative — folding the device answer into §7.10.5's "zero-new-mechanics" stance — would have left the
*capability gap* (the membership reader) undocumented while the *predicate* question was declared closed,
which is exactly how a silent class of unwitnessed beats (ADR-design-0002's trapped refusal) survives into a
census: the gate would look green because nothing was checking the thing XOR breaks.

---

## Original Hypothesis

Two hypotheses were live before this ticket, one per question.

**H-device (the question LV-018 asked).** *The XOR multi-switch door is a **NEW DEVICE CONTRACT**: because
`g6`'s covering derivation defines the sealed-room/pocket family, giving a door a **second** targeting switch
must move the covering list (a door with two feeders is "less covered", or covers a different region), and
therefore the `H` both-pair composition needs a **second derivation** and, with it, a schema field, a
validator rule, or a core predicate. Alternatively — the second option on the table — if `g6` does **not**
move, the composition is a new *device* whose contract must be **written** somewhere new.*

**H-release (the coupling §7.10.7 left open).** *The `par 28` reservation is **spendable only when a census
proves it can be populated**, and the tail's ladder must be derived **after** the `H` lattice is censused, so
that the release and the ladder rest on measurement rather than on law.*

Stated falsifiably: **H-device** — if `g6`'s covering list is invariant under any mutation of
`switches[].targets`, then option (a) is derivable and no schema/validator/core change is owed.
**H-release** — if the released class's *floor* strictly exceeds the first half's *ceiling* **by construction**,
then the reservation is spendable by law, before any census, exactly as the opener's ladder was.

## Problem

Five defects, each shown by a code read or by arithmetic — none a taste complaint.

1. **H-device is falsified by reading the truth source: the covering derivation is multiplicity-blind.**
   `derivedWalkSealedRooms(level)` (`scripts/room-derivation.ts:69–116` — the single truth source both
   `scripts/prove-candidate.ts` and `scripts/author-l21.ts` import, per the F-L41-2 fix) reads only
   `phaseAWalls` / `phaseBWalls` / `doors[].tiles` / in-bounds connectivity: a region is a walk-sealed room
   iff **one door object** covers its whole boundary with no phase-wall and no free boundary tile, and
   `doorsCoveringTwoRooms` requires each door object to cover **≤ 1** room. **Neither function ever reads
   `switches[].targets`**, and a door tile is a structural blocker in **every** phase and **every** switch
   state. Adding or retargeting a switch therefore **cannot** move a region boundary or change the covering
   list. The two `§6.2.3` clauses that do real work here — *clause 3* (the pocket's only exit is a door, no
   phase wall may form the exit) and *clause 4* (an ordered ≥ 2-press plan) — are **untouchable by XOR**:
   clause 3 is **structural**, and clause 4 is **measured on the shared `applyMove` state graph**, where the
   XOR truth table already lives. **Conclusion: no second derivation is owed, and no new field/rule/predicate
   is owed.** But the hypothesis's *second* option is not the answer either — the composition is **already
   shipped** (`doorIsOpen`, `src/core/rules/solid.ts:93–106`), so there is **no new contract to write**
   beyond the *reader* defect below.
2. **The real gap is a capability, not a predicate: the press-then-cross reader is TARGET-MEMBERSHIP, and XOR
   breaks that reading.** The `G2`/`g2` census reader is implemented **twice** —
   `scripts/author-l21.ts:1968–1991` and `scripts/prove-candidate.ts:279–297` (the F-L41-2
   two-implementations class) — and both test `targets.includes(doorId)` for a door tile the route later
   stands on. For a **single-switch** door that is a sound witness (one ON switch inverts the base, so a legal
   crossing after the press is the press's doing, with necessity separately measured by all-OFF
   unsatisfiability). **For an XOR door it is not:** openness is the colour base inverted once per ON
   targeting switch, so **a press can CLOSE the very door it targets**, and a route can be credited with
   *"pressed, then crossed"* by a press that did the **opposite** of opening it. That is the withdrawn
   unordered-reader class (ADR-design-0002's trapped refusal — a beat no player can witness) arriving
   somewhere new, and the Aha's own words are *"the door opened"*.
3. **The `par 28` reservation has no release clause, so the tail lane is hard-gated on a device question that
   does not actually gate it.** O2/O3 withheld `par 28` from the opener because `26 + 3·1.6875 = 31.0625 < 28
   + 3·1.2500 = 31.7500` (margin `0.6875` = `ACT_III_CEILING_RESERVATION_MARGIN`), and B3 extended the
   `par ≤ 26` scope to all of `L41–L50`. §7.3.2's carrier sits on **`L51–L60`**, where the earliest `par 28`
   rung clears **any** in-band `B` above the first half's ceiling **by construction**. The reservation was
   therefore never waiting on the `H` census — it was waiting on a **release clause nobody had written**,
   while `docs/project-status.md` item 159 recorded the device question as **still open** and, in practice,
   as the thing the tail waited on.
4. **The `L50→L51` seam acquires a negative `par` term the moment the ladder is anchored, and §7.3.1 refuses
   an unlabelled relief.** B1 anchors batch 3 at `par 24` while `L50` sits at `par 26`, so `Δpar = −2` is a
   §7.3 interior relaxation at a `ΔM = 0` boundary. §7.3.1: *"A relief that has no pre-published label is
   **not registrable**."* The level lane is therefore gated on this register's owner, exactly as it was for
   instance 6 — and **before** the census and any byte (bound → fill-in → bytes).
5. **The release makes two corners reachable for the first time, and both must be legislated pre-emptively.**
   (a) **The degenerate B6 case** — `24` and `26` both absent ⇒ a flat `[28×5]` batch ⇒ a seam with
   `Δpar = −2` **and** `ΔD_exec ∈ [+1.332979, +2.645479]`: a **rise** carrying a negative `par` term. 0009's
   test reads *"iff its `par` term is negative, whatever the `D_exec` sign"*, so by the letter such a seam is
   registrable — but calling a rise a **relief** would be the F-L31-2 / F-L36-2 failure class (*a label that
   no longer describes the thing it measures*). (b) **`F-GD014-1`** — instance 6's comparator is
   **alias-typed** to `ACT_III_REGISTERED_TAIL_*`; that is correct today (`45` / `30.455319`) and stays
   correct through R-008 (the act maximum stays at `L45`), but **any** `par 28` rung measures `≥ 31.7500 >
   30.455319`, so a later registration **certainly** moves the act maximum **off `L45`**, re-points the alias,
   and **silently restamps** instance 6's published `−4.212830` — a published label moved by a constant,
   the mirror of the *law-before-bytes* order this register enforces.

## Change

**Nothing in the locked core loop, in any mechanic, in any weight/gate/band, in any registered row and in any
level byte changes.** The change is law text (three sub-sections) plus one register entry plus a disclosed
rider plus a named finding.

**1 — The XOR device ruling and the `H`/XOR device contract, `docs/level-design.md` §7.10.8.**

- **The ruling (`§7.10.8.1`).** The question *"does `g6`'s covering rule need a second derivation, or is the
  `H` composition a NEW DEVICE CONTRACT?"* is answered **in its own terms: NEITHER — and the clause that does
  need work is not `g6`.** (i) The covering derivation is **multiplicity-blind by construction** ⇒ **no second
  derivation is owed**; the claim is stated **falsifiably** (`g6`'s covering list is invariant under any
  mutation of `switches[].targets`) so a reader can check it rather than trust it. (ii) The gap is a
  **capability**: the press-then-cross reader is **target-membership** and XOR breaks that reading.
- **`C1 · Representation = multiplicity on the EXISTING schema` (option (a) confirmed).** An XOR door is a
  `Door` with **≥ 2** switches listing its id in `targets`. **No new field, no schema change, no validator
  error, no core predicate, no new composition law** — the composition is **already shipped and is quoted,
  never re-derived**: `open = base ⊕ (#ON targeting switches mod 2)`. The validator's `[multi-switch-door]`
  **stays a warning** (`src/core/level/index.ts:622`: review flag; never a rejection, never a repair, never a
  Solver gate). **An XOR door is a *composition* in the §6.2.2 sense: `ΔM = 0`, no debut grade, no dip
  obligation** — §7.10.5's stance, unchanged, now with the code reading behind it.
- **`C2 · `G2-X` — the XOR-aware press-then-cross obligation (NEW; a reader in `scripts/**`).** For **every**
  par route and **every** crossed door that **≥ 2** switches target, there must exist an arrival index `i`
  and a later crossing index `j > i` such that (1) the arrival **toggles a targeting switch**
  (`toggledOn`/`toggledOff` names an id whose `targets` include the door); (2) the door's resolved openness
  **CHANGES at that arrival** (`route[i].state.levelState.doorsOpen[d]` differs from `route[i−1]`'s) — an
  **effective** press — **and it changes to `true`**; (3) the door is **open at every crossing entry**
  (`route[j].state.levelState.doorsOpen[d] === true`). Then the beat *"the press opened the door I then
  crossed"* is **witnessed**, not merely sequenced. **Reader blast radius: `scripts/**` only**; **zero**
  schema/core/validator change.
- **Order + measurement (the ADR-architecture-0002 / GD-008 discipline, applied pre-emptively).** `G2-X`
  encodes **before** the census (a gate that does not exist cannot filter a census; and a gate repaired
  *after* a census owes the **identical command re-run** — the LV-019 `F-L46-1` precedent). The lane then
  **measures and prints the divergence** between the membership form and `G2-X` (the GD-008 shape: both
  readers printed, no verdict silently moved). **Divergence > 0 is expected** and is published;
  **divergence = 0 on a class whose entire point is parity is a STOP-AND-ROUTE to GD**, because it would mean
  the census selected XOR-free boards wearing an XOR flag. **One negative control per new reader**, named from
  a **measured** refusal: a board whose par route presses a targeting switch that **closes** the door, later
  opened by the **other** switch and then crossed — it must **pass** the membership form and **FAIL** `G2-X`.
- **`C3 · Core compliance (AGENTS §2)`.** An XOR door changes a **state**, never a position: entry-only
  solidity; an illegal move does **nothing** and flips **nothing**; standing inside a wall stays **legal and
  safe** (ADR-0008 rules 1–3); deterministic puzzles only. A door that **closes behind the player** is legal
  **iff** the goal stays reachable from that state — which the shipped `deadStates 0` / `noUnrecoverableOk` /
  `T ≡ R ≡ 0` proof **already** refuses for the trap class, **unchanged**. **Authoring belt (not a new law):**
  a room whose only exit is an XOR door must contain a targeting switch, or the board must prove that exit
  re-openable from inside; a board that can seal the player in with the goal unreachable is **rejected by the
  invariant**, never repaired. **Refused at contract level, by name:** any semantics in which an XOR press can
  crush, push, relocate or randomise the player.
- **`C4 · Pacing for `L51–L55` (weightless; binds rung placement).** `L51` carries **NO XOR** (it is the
  instance-7 relief rung; two novelties on one board is what §6's construction-floor discipline forbids).
  `L52` = the **XOR first encounter**, grade **below OFFERED**, one XOR door, both links visible,
  `switchRequired: "exempt"` **recorded with its measured reason and not `null`**. `L53` = **OFFERED**. The
  `par 28` class appears here, which is a **register** fact, **invisible in play** (`par` is never shown
  live — GD-OQ1, §7.1), so it is **not** a player-facing second novelty and does not re-open C4. `L54` =
  **FORCED** (`switchRequired: "required"` **measured**: all-OFF UNSATISFIABLE, `G2-X` on every par route).
  `L55` = **FORCED at the within-par maximum** (B5) and the batch's act-max candidate.
- **The comprehension plan (`§7.10.8.3`) — show, never tell.** **T0** (owned since L6–L10) press ⇒ invert ⇒
  **latch**, *assumed not re-taught*; **T1** `L52` — one door with two visible links, the greedy walk passes
  **both** switch tiles and the door then **REFUSES** (two ON ⇒ base restored): **the refusal IS the
  tutorial**, recovery one step, no dead states, `T ≡ R ≡ 0`; **T2** `L53` — the object may be read as an
  **echo** (a same-par route exists); **T3** `L54` — every par route must perform an effective XOR press;
  **T4** `L55` — the device's densest expression. **Mandatory readability rules:** **R1** the two links must
  be **visible, never inferred** (one-link and two-link doors visually distinct objects); **R2** per-switch
  **ON pip legible at all times** (so *two lit ⇒ base, one lit ⇒ inverted* is reconstructible **on screen**
  across a phase flip); **R3** every door change attributable to an arrival (a parity-neutral press must not
  read as a bug); **R4** at first encounter the second switch is reachable **without** crossing the door it
  targets ("the key is behind its own lock" reserved for `L54`+, links still visible from move 0);
  **R5** the refusal is **witnessed** (gate (iii) + the `G2-X` companion witness); **R6** **zero text**, no
  popups, no "mechanic discovered" banner. **Named risk (labelled PA hypothesis, never a result):** *"a press
  un-opened the door"* can read as *inconsistency*; measurement is **M4 refusals / M5 restarts / M6 undos at
  `L52` vs `L51` must not spike**, thresholds frozen **before** the cohort runs; the star-era instrument reads
  **`NOT TESTABLE, n = 0`**; if it spikes, the device is **re-designed, never re-labelled**.

**2 — The `par 28` reservation RELEASED, `docs/level-design.md` §7.10.9.**

- **The release (`§7.10.9.1`), effective at batch 3 (`ℓ = 3`), by arithmetic.**

  ```text
  reserved class        : par 28  ⇒ D_exec ∈ [28 + 3·1.2500, 28 + 3·1.6875] = [31.7500, 33.0625]
  first half's ceiling  : 26 + 3·1.6875 = 31.0625  ⇒  margin 31.7500 − 31.0625 = 0.6875  (the reserved constant, now SPENT)
  act band (derived)    : [23.7500, 33.0625]       ⇒  the released class's TOP *is* the act ceiling (0 headroom above it)
  registered act max    : 30.455319 @ L45          ⇒  31.7500 − 30.455319 = +1.294681  (minimum margin, ANY in-band B)
                                                       33.0625 − 30.455319 = +2.607181  (= ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING)
  ```

  Read-outs: the carrier is discharged **by measurement whatever `B`** (§7.3.2's window is `L51–L60`); the
  released range **exactly is** the act's remaining headroom (`[31.7500, 33.0625]`), so releasing it spends
  the headroom **exactly** and nothing above it is admissible anywhere in Act III; bands are **inclusive**
  (§7.9) — a `par 28` rung at `B = 1.6875` stands **on** the derived-exact ceiling and is **IN band** (an
  honest difference from Act II's dead sliver, which was empty in every census run to date: here the top is a
  **reachable** value, the act's tail measuring `B 1.4851`, batch 2's top `1.4723`); **`par 27` stays
  INADMISSIBLE — now on a derivation rather than on the reservation**: every Act III ladder's par values are
  `≡ ACT_III_PAR_FLOOR (mod 2)` (O1's window is `A_ℓ + 2k`; B1's anchor advances by exactly `2`), and `27` is
  strictly dominated (`27 + 3·1.6875 = 32.0625 < 28 + 3·1.6875 = 33.0625` with an **identical** floor
  `31.7500`); the first half's `par ≤ 26` scope (**B3**) is **UNCHANGED**.
- **The `L51–L55` ladder law (`§7.10.9.2`) — B1–B7 read at `ℓ = 3`, the rule APPLIED never re-derived.**
  **Derived multiset (law, before any census): `[24, 26, 28, 28, 28]`** —
  `L51 24 · L52 26 · L53 28 · L54 28 · L55 28`. **B1** anchor `A₃ = 20 + 2·2 = 24`. **B2** self-check
  reproduces **both** landed multisets (`[20,22,24,26,26]`, `[22,24,26,26,26]`) — two self-checks now, not
  one. **B3** the release. **B4** window `[24,26,28,30,32]` truncated at `28` → `[24,26,28]` + 2 repeats at
  the truncated top ⇒ the multiset. **B5** closing rung within-par **maximum**, every earlier rung the
  **minimum**, the **two** non-final `par 28` rungs ascending by id. **B6** absent-never-substituted, with
  the **degenerate case ruled in advance**: if `24` **and** `26` are both empty the fill lands at the ceiling
  ⇒ a flat `[28×5]` batch with no interior rise, admissible by B6's letter (its `par` term is still `−2`)
  but **STOP-AND-ROUTE to GD** — a shape no published clause authorises. **B7** anti-mirror: distinct from
  every registered Act II multiset, from `[20,22,24,26,26]`, from `[22,24,26,26,26]`, **and from batch 4's**
  (GD-015's era; this ruling binds it only by this constraint, never by a preview); coinciding pars are
  **printed, never hidden**.
- **Uniqueness, stated honestly — the tie-break stays a tie-break.** Unique **GIVEN B1's anchor**, and the
  anchor is chosen by GD-013's **published tie-break**, **not** a derivation. Applied at `ℓ = 3`: ground
  **(i)** (*minimum admissible advance*) **SURVIVES and alone selects `24`** — `A₃ = 22` reproduces batch 2's
  multiset exactly, which B7 refuses, so `24` is the smallest admissible advance; **this is the load-bearing
  ground here**; ground **(ii)** (*"every value of the derived window keeps a home in the act's ladders"*) is
  **SPENT at `ℓ = 3`** and is **recorded as spent rather than re-asserted** — after the opener and batch 2
  every window value except `28` already has a home, so (ii) cannot select this anchor (it was load-bearing
  at `ℓ = 2`), and the claim stays *checkable* (homes under `A₃ = 24`: `20`(B1) · `22`(B1,B2) · `24`(B1,B2,B3)
  · `26`(all) · `28`(B3)) but no longer discriminates — **stated because a ground silently re-quoted after it
  stops discriminating is how a tie-break becomes folklore**; ground **(iii)** (*minimality convention*)
  **SURVIVES**. **It is labelled a tie-break and is not claimed as a derivation**; if a future census
  contradicts (i) or (iii), that measurement is the trigger for a **replacement rule with its own ADR** —
  the one part of GD-013 a census may legitimately falsify, and this section adds no immunity to it.
- **Interior structure of the batch.** The steps `24→26` and `26→28` are `Δpar = +2` (P2, §6.1.1); the two
  same-par steps ascend by `B` (B5). **No interior label is owed.**
- **Census obligation, never a promise (§7.0).** `par 28` is measured **non-empty** in the Act III
  **`G`-family** pool (LV-018 `556` on a budget-hit prefix census; LV-019's pre-fix reading `529`), but that
  pool is **not** the **`H` both-pair** lattice (§7.4 stage `H`, **not yet censused**), and **no ceiling
  claim is publishable in either direction**; if `H` cannot populate the derived ladder, **B6 governs**.

**3 — `RELIEF INSTANCE 7` — `batch-seam` `L50→L51`, pre-published (`docs/level-design.md` §7.10.10; register
row §7.3.1 item 7).**

| | |
|---|---|
| comparator (previous side) | **`L50 = 30.417021`** — batch 2's shelf-measured maximum (`docs/ai-native-pipeline.md` §8.28) |
| first rung's admissible pars | **`24`** (B1's anchor — the primary, and the only half published) · `26` (B6's descending-fill fallback, **not a relief**) |
| `par` term | **`−2`** at the anchor (`26 → 24`) |
| published bound | **`ΔD_exec ∈ [−2.667021, −1.354521]`** — a **single half**, not a union |
| band | **`[23.7500, 33.0625]`**, printed `[23.75, 33.06]` — `policy.ts` `ACT_III_EXEC_BAND`, derived-exact, inclusive (§7.9) |
| exact value | **a fill-in against the published form, before the bytes** (`ACT_III_B3_SEAM_RELIEF_EXEC` / `_DELTA`), the instance-5/-6 order |

The bound's arithmetic, shown so the level lane verifies its measured `Δ` inside it (`D_exec = par + 3·B`;
`B ∈ [1.2500, 1.6875]`):

```text
par 24 (B1's anchor)   : [24 + 3·1.2500, 24 + 3·1.6875] = [27.7500, 29.0625]  −  30.417021  =  [−2.667021, −1.354521]
par 26 (B6's fallback) : [26 + 3·1.2500, 26 + 3·1.6875] = [29.7500, 31.0625]  −  30.417021  =  [−0.667021, +0.645479]
                                                                   par term 0 ⇒ NOT a relief (§7.10.7's test)
published bound (the par 24 half alone):                                                        [−2.667021, −1.354521]
```

**Three properties, stated so the lane verifies rather than trusts.**

- **(a) It is a single half, not a union — the fallback is not a relief at all.** `L51` at `par 26` has
  `Δpar = 0`, and §7.10.7's register-wide test makes a `Δpar = 0` seam **not a relief**: its residue is
  `3·ΔB`, bounded by `3·(1.6875 − 1.2500) = 1.3125`, published as an **instrument reading**, never labelled.
  (Unusually, that residue **spans the sign change** here — `[−0.667021, +0.645479]` — which is *because* the
  comparator `L50` sits inside the `par 26` band; it changes nothing, because the test keys on the `par` term.)
- **(b) The `+0.038298` shift identity is a checkable coincidence, not a template.** `30.455319 − 30.417021 =
  0.038298`, and instance 6's `par 24` half shifted by exactly that amount **is** instance 7's bound
  (`−2.705319 + 0.038298 = −2.667021`; `−1.392819 + 0.038298 = −1.354521`). **The bound coincides under the
  shift; the value must not:** instance 6's `−4.212830` belongs to `L46`'s own `B` (`1.4142`), and re-quoting
  it for `L51` would cite a different board.
- **(c) The comparator is explicitly NOT the act tail — a distinction instance 6 could not see.** `L50`'s
  `30.417021` is **below** the registered tail `30.455319 @ L45`, so after R-008's registration the act's
  maximum **stays at `L45`** (item 159's finding, re-derived there non-vacuously). This seam's left side must
  therefore be alias-typed to the **batch-2 tail constant** (`policy.ts`
  `ACT_III_B2_BATCH_PEAK_LEVEL_ID/_EXEC` = `50` / `30.417021`) and **never** to
  `ACT_III_REGISTERED_TAIL_*` — which is a **different board by `0.038298`**, and typing it so would put a
  `0.038298` error into a **published bound** silently.

The full label, verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `batch-seam` seam L50→L51 · `ΔD_exec ∈ [−2.667021, −1.354521]` (exact value filled in
> against this pre-published form once L51's `par` is selected; `par` term `−2` at the anchor) · band
> `[23.7500, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip, never a
> claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law does **not**
> fire: Act III introduces **no** mechanic unit (`M` unchanged; §7.10.5) — the batch-3 boards are **variety
> inside §7.2's Act III family** plus the **§7.10.8 XOR composition**, which is a new *read* of shipped
> primitives and not a new board feature (`ΔM = 0`, the §6.2.2 class). `act-peak`/`act-close` ride on the
> act's **measured maximum**, and §7.3.2's carrier sits on **`L51–L60`** — where the released `par 28` class
> (§7.10.9.1) discharges it **by arithmetic**, whatever `B`. Also published beside it, from GD-013's own
> reasoning and **unchanged here**: **the relief is largely an artifact of the measurement design** — the
> ladder is **derived** (anchor tie-break + released ceiling + fill at the truncated top), so the `par` term
> drops by **2 by construction**, and §7.3.1's form already refuses to call that a designed rhythm. *How the
> seam reads* is a **labelled Playtest hypothesis** (§7.3.3; the star-era instrument reads `NOT TESTABLE,
> n = 0`), not a result.

**Registration-side constants proposed** (mirroring the `ACT_III_B1_OPEN_RELIEF_*` / `ACT_III_B2_SEAM_RELIEF_*`
triples): `ACT_III_B3_SEAM_RELIEF_LEVEL_ID = 51`;
`ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed to the batch-2 tail constant**
(`policy.ts` `ACT_III_B2_BATCH_PEAK_LEVEL_ID/_EXEC` = `50` / `30.417021`) — **not** to
`ACT_III_REGISTERED_TAIL_*` — with a `near()` assertion on the alias so a wrong
typing fails **loudly** rather than by `0.038298`;
`ACT_III_B3_SEAM_RELIEF_DELTA_RANGE = [−2.667021, −1.354521]`;
`ACT_III_B3_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS = [{ par 24, [−2.667021, −1.354521] }]`; the exact
`_EXEC`/`_DELTA` are filled **only after selection and before the bytes**. A value outside the half is a
**STOP-AND-ROUTE to GD**. Ladder-side constants proposed: `ACT_III_B3_ANCHOR_PAR =
ACT_III_PAR_FLOOR + 2·(3−1)` (= `24`), `ACT_III_B3_PAR_MULTISET = [24, 26, 28, 28, 28]`,
`ACT_III_TAIL_PAR_CEILING_RELEASED = ACT_III_PAR_CEILING` (= `28`).

**4 — RIDER to ADR-design-0009's register-wide admissibility test (disclosed: one *reading* added, nothing
narrowed).** 0009's test reads: a `ΔM = 0` seam is registrable **iff its `par` term is negative**, *"whatever
the `D_exec` sign"*. The release makes a **new corner reachable for the first time**: the degenerate B6 case
(`L51` at `par 28`) has `Δpar = −2` **and** `ΔD_exec ∈ [+1.332979, +2.645479]` — a **rise** carrying a
negative `par` term. **Ruling:** such a seam **still owes this register a pre-published entry** (nothing
escapes by sign — GD-013's boundary is kept), but it is published **as what it is** — a
**`par`-term-negative RISE**, the word *relief* replaced by *rise* in its header — because calling a rise a
relief would be exactly the F-L31-2 / F-L36-2 failure class: *a label that no longer describes the thing it
measures*. The corner is **STOP-gated anyway** (§7.10.9.2 B6), so this is **pre-emptive law, not a live
decision**.

**5 — Finding `F-GD014-1` (named, not fixed here).** **A registered instance's left side is a PUBLISHED
NUMBER and may not move after registration.** Instance 6's comparator is **alias-typed** to
`ACT_III_REGISTERED_TAIL_*`; that is correct **today** (`45` / `30.455319`) and stays correct through R-008
(the act maximum stays at `L45`) — but the released `par 28` class makes it **certain** that a later
registration moves the act's maximum **off `L45`**, at which moment the alias re-points and instance 6's
**published** `_DELTA` (`−4.212830`) silently becomes a different number. **Remedy, one line, in
`policy.ts` (`src/core/solver/**` — the level lane's, with Architect sign-off; never a design edit):** freeze
each registered instance's comparator as `_PREVIOUS_EXEC_AT_REGISTRATION`, **or** assert `near(...)` against
the published value so the drift fails **loudly** — §7.9's constant/operator-alignment corollary, one
register later.

**6 — Two non-§7.10 edits in the same version (disclosed, non-§7.10).** §1's `switches` authoring-rule row is
**corrected** (at most one switch per door in **L6–L50**; XOR allowed from **L51** under §7.10.8; the review
flag is **never** a gate; `G2-X` applies before the census), and §5's `L36–L45` line gains a **pointer** (the
XOR allowance is moved off §8's `L36–L45` by §7.2 Act III and released to `L51`). §7.3.1's list goes **six →
seven instances** with the new index row.

## Evidence

| # | Evidence | What it settles |
|---|---|---|
| 1 | `scripts/room-derivation.ts:69–116` — `derivedWalkSealedRooms` / `doorsCoveringTwoRooms` read only `phaseAWalls`, `phaseBWalls`, `doors[].tiles` and connectivity; `switches[].targets` is **never read** | Problem 1 / ruling (i): the covering derivation is **multiplicity-blind by construction** ⇒ **no second derivation is owed**, and the claim is stated in **falsifiable form** (covering list invariant under `targets` mutation) |
| 2 | `src/core/rules/solid.ts:93–106` — `doorIsOpen` / `baseDoorOpen`: openness = colour base ⊕ (#ON targeting switches mod 2) | Problem 1's second half / `C1`: the XOR composition is **already shipped**; `H` is a **composition** (`ΔM = 0`), not a new device ⇒ **no schema/core/validator change** |
| 3 | `scripts/author-l21.ts:1968–1991` (the membership test at `:1987`) and `scripts/prove-candidate.ts:279–297` (at `:293`) — both press-then-cross readers test `targets.includes(doorId)` **membership** | Problem 2 / `C2`: the reader is **target-membership**, sound for one switch and **unsound under XOR** (a press can close the door it targets) ⇒ **`G2-X`** is the owed capability; blast radius `scripts/**` only |
| 4 | `src/core/level/index.ts:622` — the `[multi-switch-door]` prose, a **review warning** (range already corrected by LV-018) | `C1`: the validator flag **stays a warning** — never a rejection, never a repair, never a Solver gate |
| 5 | `src/core/solver/policy.ts` — `ACT_III_PAR_FLOOR = 20`, `ACT_III_PAR_CEILING = 28`, `ACT_III_B_BAND = BLOCK_L1619_B_BAND = [1.25, 1.6875]`, `ACT_III_EXEC_BAND` **computed** `= [23.7500, 33.0625]`, `ACT_III_OPENER_PAR_MULTISET = [20,22,24,26,26]`, `ACT_III_B2_PAR_MULTISET = [22,24,26,26,26]`, `ACT_III_CEILING_RESERVATION_MARGIN` (computed `0.6875`), `ACT_III_REGISTERED_TAIL_LEVEL_ID/_EXEC = 45 / 30.455319`, `ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING = 2.607181`, `ACT_III_B2_BATCH_PEAK_LEVEL_ID/_EXEC = 50 / 30.417021`, `ACT_III_B2_HALF_CEILING_EXEC = 31.0625`, `ACT_III_B2_SEAM_RELIEF` spec (`46` / `26.242489`) | every constant quoted above is **read from the module**, never retyped from memory; both band endpoints are dyadic ⇒ the arithmetic is bit-exact (§7.9) |
| 6 | `docs/ai-native-pipeline.md` §8.28 / LV-019 — `L50` measured **`30.417021`** (`B 1.4723`), **below** `L45`'s registered `30.455319`; item 159's finding that the act maximum **stays at `L45`** after R-008 | Problem 4 / property (c): the instance-7 comparator is the **batch-2 tail**, **not** the act tail, and `ACT_III_REGISTERED_TAIL_*` is a **different board by `0.038298`** |
| 7 | `docs/ai-native-pipeline.md` §8.26 / LV-018 census (`--stage=g --act=3 --pockets=4 --cx=1 --h=7`, budget HIT = prefix **floor**): pool by par `… 26:599 · 27:630 · 28:556`; LV-019's pre-fix reading `529` | the release's **census obligation**: `par 28` is measured non-empty on the `G` family, but that is **not** the `H` both-pair lattice (§7.4 stage `H`, **not yet censused**) ⇒ **no ceiling claim in either direction**; a prefix census licenses no class claim (item 114's law) |
| 8 | `docs/level-design.md` §7.3.1 instances **1–6**, verbatim; §7.10.7's register-wide test | the register's **order** (monotone by seam position, GD-012b), its **form** (`ΔD_exec = Δpar + 3·ΔB`, `par` term shown, bound pre-published, value a fill-in), and the **test** the rider extends by one reading |
| 9 | ADR-design-0008 §7.10.2 (O2/O3) and ADR-design-0009 §7.10.6 (B1–B7), quoted | the reservation's provenance, its `L41–L50` scope, and the rule being **applied at `ℓ = 3`** — never re-derived |
| 10 | `docs/project-status.md` items **154** (XOR/`H` booked to GD + Architect; the `par 28` top reserved for the answer) and **159** (same question still open after `L46–L50`), user ruling **U-002** (XOR debut in the act's second half) | the *trigger*, the *handoff*, and the *order*: law before bytes, and this ticket is the pre-census publication the level lane is gated on |

**What is *not* evidence, stated so it cannot be read as any.** No playtest datum exists for this device or
this seam (§7.3.3's star-era instrument reads **`NOT TESTABLE, n = 0`**). **The felt half of every claim here
is a labelled hypothesis, not a result:** `D_exec` carries no comprehension term (`M`/`T` are not in it), so
*"the pre-emptive refusal teaches the XOR rule"* and *"`L51` reads as a breath after the `L50` shelf"* are
**hypotheses**, and both labels say so in their own text. **My own preference for a two-link door as the
elegant expression of one rule is not evidence** (AGENTS §7): it is the reason `C4`/`T1` publish a
**checkable** teaching sequence (the greedy walk passes both switch tiles and the door **refuses** — a
Solver-measurable witness, R5) that a measurement could contradict, and the reason the device is
**re-designed, never re-labelled** if M4/M5/M6 spike.

## Result

- **The XOR / `H` device question is answered, and the answer is NEITHER option as posed: option (a)
  DERIVABLE, for semantics/representation/covering.** `g6`'s covering list is **invariant under any mutation
  of `switches[].targets`** ⇒ **no second derivation is owed**; representation is **multiplicity on the
  existing schema** ⇒ **no new field, no validator rule, no core predicate**; the composition is **already
  shipped**; the `[multi-switch-door]` warning **stays a warning**. **`ΔM = 0`, no debut grade, no dip.**
- **The real gap is closed by a NEW obligation, `G2-X`**, a reader in `scripts/**` (two implementations of
  one law) that requires an **effective** XOR press — the door's resolved openness **changes to `true`** at an
  arrival that toggles a targeting switch — before a later crossing, because the shipped membership reader can
  be satisfied by a press that **closed** the door. It encodes **before** the census; the membership-vs-`G2-X`
  divergence is **printed**; **divergence = 0 on an XOR class is a STOP-AND-ROUTE**; one measured-refusal
  **negative control** (membership-pass / `G2-X`-fail) per reader.
- **The `par 28` reservation is RELEASED at batch 3 (`ℓ = 3`), by arithmetic** — released floor `31.7500` >
  first half's ceiling `31.0625`, margin **`0.6875` = `ACT_III_CEILING_RESERVATION_MARGIN`** (now **SPENT**);
  the released range `[31.7500, 33.0625]` **is** the act band's top, clearing the registered act max by
  **`+1.294681`** (minimum, **any** in-band `B`) ⇒ **§7.3.2's carrier is discharged by measurement whatever
  `B`**; **`par 27` stays INADMISSIBLE by derivation**; the first half's `par ≤ 26` scope is **unchanged**.
- **Batch 3's par ladder is law before its census exists: `[24, 26, 28, 28, 28]`** (`L51 24 · L52 26 ·
  L53 28 · L54 28 · L55 28`), derived by **B1–B7 at `ℓ = 3`** with **two** landed self-checks (B2) and a
  published **tie-break** whose ground (ii) is recorded **SPENT, not re-asserted**; the degenerate case is
  ruled in advance as **STOP-AND-ROUTE**.
- **The `L50→L51` seam is a registrable re-anchor, and it is pre-published:** `RELIEF INSTANCE 7`, bound
  **`[−2.667021, −1.354521]`** (a **single half**, not a union; the `par 26` fallback is **not a relief**),
  band `[23.7500, 33.0625]`, `par` term `−2`, exact value a **fill-in before the bytes**. **No relief is owed
  anywhere else in batch 3** — its interior steps are `+2`, and the same-par steps ascend by `B` (B5).
- **Two pieces of pre-emptive law are published:** the **rider** (a `par`-term-negative **rise** still owes an
  entry, published as a *rise*) and **`F-GD014-1`** (a registered instance's left side is a published number
  and may not move — remedy one line in `policy.ts`, level lane + Architect).
- **Untouched:** the locked core loop (no AGENTS §2 triad — this is device/band/ladder/relief law, not the
  phase loop); every registered row; every band value; every weight; every gate list; every level byte; all of
  `src/**`, `scripts/**`, `tests/**`; `docs/game-design.md` (no mechanic, no HUD, no star row);
  ADR-design-0005 / -0006 / -0007 bodies, and ADR-design-0008 / -0009 bodies (both **riders**: quoted and
  extended, never edited).
- **Left gated, by name:** the `H` both-pair **census** (it is the lane's, and **no ceiling claim is
  publishable in either direction** until it exists), and **batch 4's (`L56–L60`) ladder** (GD-015's era —
  bound by **B7**'s multiset distinctness and the act band only, never previewed here).

## Handoff

1. **LV-020 (level lane, Act III batch 3 `L51–L55`)** — **UNBLOCKED for the rule; STOP-gated on the reader.**
   The order is binding: **(rule → `G2-X` reader → census → fill-in → bytes)**. Encode/repair the **`G2-X`**
   reader (or extend the two shipped readers so one law has one implementation) **before** the census, print
   the **membership-vs-`G2-X` divergence**, and ship **one negative control per reader** named from a
   **measured** refusal. Run the census on the pre-published rule (B1–B7 at `ℓ = 3`, `[24,26,28,28,28]`),
   verify the measured seam's `ΔD_exec` lands **inside the published half** `[−2.667021, −1.354521]` for
   `L51`'s selected `par`, and **fill `ACT_III_B3_SEAM_RELIEF_EXEC` / `_DELTA` in a commit that precedes the
   board bytes** (the instance-5/-6 provenance shape: bound → fill-in → bytes, git-datable). Cite **this
   commit** as the pre-census provenance. **Route to GD, not to yourself**, if: divergence `= 0` on an XOR
   class; the pool forces the degenerate B6 case (`24` **and** `26` both empty ⇒ flat `[28×5]`); or the
   measured seam lands outside the published half.
2. **Registration (the `R-008`-era train, or its successor)** — `ACT_III_B3_ANCHOR_PAR`,
   `ACT_III_B3_PAR_MULTISET = [24,26,28,28,28]`, `ACT_III_TAIL_PAR_CEILING_RELEASED`,
   `ACT_III_B3_SEAM_RELIEF_LEVEL_ID = 51` / `_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed to the batch-2 tail**
   (`50` / `30.417021`) with a `near()` assertion / `_DELTA_RANGE = [−2.667021, −1.354521]` /
   `_ADMISSIBLE_FIRST_RUNGS`, the lesson rows, the sidecar at 55, the registry row, the count pins.
   **Fill-in-before-bytes is the register's rule, not a preference.**
3. **ARCH-006 (Architect, with this ADR as the design input)** — sign four items: **(i)** representation =
   `targets` **multiplicity**, no schema/validator/core change, and the `[multi-switch-door]` warning **stays
   a warning**; **(ii)** `g6`/region derivation is **multiplicity-blind** ⇒ **no second derivation** is owed;
   **(iii)** `G2-X` is a **`scripts/**`** reader over the **shared** state graph (`doorsOpen` /
   `toggledOn` / `toggledOff` already exist on the route records) — **zero** core surface; **(iv)**
   **`F-GD014-1`** constant hygiene (`_PREVIOUS_EXEC_AT_REGISTRATION` or a loud `near()` assertion), in
   `policy.ts`, level lane's file.
4. **QA** — one control per new gate code in the `policy-negative-controls` Record (the R-005a2 / R-006c
   precedent): the **`G2-X` negative control** (membership-pass / `G2-X`-fail, from a measured board) is the
   first, since it is the only new gate that can **pass a wrong board**.
5. **UI / Art Director (spec authority)** — the comprehension plan's **R1–R3** are **board-readability
   requirements**, not code: a two-link door must be a **visually distinct object**, and each switch must
   carry a legible **ON pip** (§6.1.6 item 6 / §7.5 item 5; `docs/ui-ux.md` owns the spec). This is a named
   handoff — the asset/readability work is theirs, and **no final art is generated by an agent (ASSET GATE)**.
6. **Playtest Analyst (ASK, labelled)** — §7.3.3's ASK extends to **`L52` vs `L51`**: **M4 refusals / M5
   restarts / M6 undos must not spike** when the XOR rule first refuses the greedy walk, with thresholds
   **frozen before** the cohort runs; the instrument today reads **`NOT TESTABLE, n = 0`**. The named reading
   to watch is *"a press un-opened the door"* reading as **inconsistency** rather than as a rule. If it
   spikes, the device is **re-designed, never re-labelled**.