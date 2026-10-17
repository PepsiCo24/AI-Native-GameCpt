# ADR-design-0005 — Move depth is RATED, never capped (stars) · the 100-level dataset is ACT-BANDED

- **Status:** ADOPTED (design ruling). Requires Orchestrator approval per AGENTS.md §4.
- **Date:** 2026-10-17
- **Decider:** Game Designer (Agent 1, task GD-008 / GD-009)
- **Owns:** `docs/game-design.md` (§8, §14), `docs/level-design.md` (§7), this record
- **Governs:** the move-count economy (par's player-facing role, star thresholds, persistence) and the
  tail of the difficulty law above L20 (act bands, batch proofing, CI sampling)
- **Schedule refs:** `docs/game-design.md` §3 (locked loop), §6 (interaction), §8 (rhythm), §9 (teaching),
  §11 (difficulty), §12 (prohibitions), §14.1 (GD-OQ1, the re-opener this ruling uses);
  `docs/level-design.md` §0, §1 (`par`), §4 (fail conditions), §6 (dip law), §6.1 (P1–P4), §6.2 (L20)
- **Evidence refs:** `docs/project-status.md` **item 106** (USER U-001 orders (2) and (3)), item 86(a)
  (L19 census), item 90 (registration train / `route-budget.test.ts:152`), item 92(b) (unlock-chain
  60.3 s of a held 360 s); `docs/level-difficulty.md` §2a/§2b, §5.2 (measured `B` band, `D_exec`),
  §3.4/§3.5; `docs/ai-native-pipeline.md` §8.14 (stage P/SL, **F-L20-3**); `docs/ui-ux.md` N-1/N-2
- **Core-loop impact:** **NONE.** The locked loop (one move ⇒ one flip, no switch button, illegal = no
  move and no flip) is byte-identical after this ADR. The AGENTS §2 triad (GD + Playtest Analyst +
  Orchestrator) therefore is **not convened** — the alternative that would have required it is
  **refused in writing below**.

---

## Context — two user orders, one ticket (2026-10-17, U-001)

The user played the dev build and filed two orders in one round (`docs/project-status.md` item 106):

1. **"步数没有限制"** — nothing in the shipped build prices move count beyond the frozen `moves N`
   HUD field and the win dialog's move count. `docs/game-design.md` §14.1 (GD-OQ1) had **refused**
   par-in-HUD and pre-registered an evidence-only re-opener with scope "the post-teaching span (L16+)
   **or the win dialog**" and T6-frozen thresholds. The user's order is that re-opener's trigger: the
   question is asked again, this time as an explicit mandate to rule.
2. **"关卡开发到100关"** — the dataset (20 shipped levels) must be planned to 100. The L1–L20 spine
   cannot simply be extended: the census closed the goal-gated full-seal device at **par 18** on 7×6 at
   every arity (arity 2→16, 3→18, 4→18 after 17 160 tuples enumerated completely), `7×7` reaches only
   **par 22** by re-stamping L19's exact seal (refused as a re-lengthened walk), and the adopted L20
   device's own class completeness is **OPEN at ≥ 9 pockets** (F-L20-3, deliberate: `--pocketsize=10`
   was killed after 25 lines). "par 100" is not a target; it is the absence of an architecture.

Both orders are `Record-Required` work: one touches the move economy (a core-loop-adjacent field), the
other changes the tail of the difficulty law. Both records are below, in the mandated form.

---

## RULING A — Original Hypothesis → Problem → Change → Evidence → Result

**Original Hypothesis (the shapes on the table).** Move depth could be delivered by (i) **star
thresholds** — a soft post-win rating, 3★ at ≤ `par + k1`, 2★ at ≤ `par + k2`, 1★ for any finish, with
the best run persisted locally; (ii) a **hard move cap** — the run fails at a cap (this is the shape
that would change the core loop and require the triad); or (iii) a **hybrid** — the cap appears only as
an optional challenge mode later.

**Problem.**
1. **(ii) contradicts the shipped laws by construction.** `docs/level-design.md` §4: *"There is no
   death, no crush, no timer, **no move limit**"*; Restart is instant and penalty-free, Undo unlimited,
   and the only real failure is **player confusion**. A cap **creates** unrecoverable states: a
   capped-out state at move = cap is a dead end in the Solver's own graph, so `R > 0` on every capped
   level — which **breaks the measured theorem** `T ≡ R ≡ 0` that all 20 shipped levels are certified
   against and on which the whole published curve collapses to `D_exec = par + 3·B`
   (`docs/level-difficulty.md` §2b/§5.2). It would reprice every published number, disable the §4
   no-dead-state gate, and require the triad + a core-loop ADR for a feature with **zero** measured
   demand behind it (U-001 reports *absence of depth*, not *desire for a cap*).
2. **1★ must be reachable, so thresholds must be parity-honest.** The checkerboard invariant
   (ADR-0009) makes **a detour cost exactly 2 moves, never 1**. A threshold at `par + 1` is therefore
   the *same threshold* as `par` — indistinguishable in play — and any odd slack is unreachable
   arithmetic. The derivable slack quantum is **2**.
3. **A constant slack above the teaching span punishes** the long boards the architecture is about to
   add: `par`'s shipped ladder is **4, 5, 6, 6, 6, 4, 4, 6, 8, 9, 4, 4, 6, 8, 10, 12, 14, 16, 18, 20**
   (`docs/level-difficulty.md` §5.2, solver `shortestSolution`, 20/20 pinned). *(Dispatch said "pars
   3..20": corrected by measurement — **no shipped level measures par 3**; the game's measured par
   floor is **4**, ADR-design-0003 P1.)* A flat `+2` is one detour at par 4 and a rounding error at
   par 20+; a flat `+6` is forgiveness at par 4 and a tax at par 36.

**Change.**
- **ADOPT (i) STAR THRESHOLDS.** HARD MOVE CAP (ii) **REFUSED** — recorded, not silently dropped.
  Hybrid (iii) is **parked** with a named trigger, and it would still be a fail state: it needs its own
  ADR *and* the triad whenever anyone proposes it, whatever mode it lives in.
- **Threshold derivation (both factors are existing published numbers, no new math):**
  **`k1 = 2·⌈par / 10⌉`**, **`k2 = 2·k1`**, **1★ = any finish**.
  - `2` = the detour quantum (ADR-0009: a detour adds 2, never 1) — so every threshold is a count a
    player can actually land on, and slack ≥ 2 always means "you may explore once".
  - `10` = **P3's published teaching-span par ceiling** (`docs/level-design.md` §6.1.1) — the game's
    own par unit; allowance therefore grows one step per par unit of board.
  - Ladder table: par 4–10 → 3★ ≤ par+2, 2★ ≤ par+4 · par 11–20 → +4 / +8 · par 21–30 → +6 / +12 ·
    par 31–40 → +8 / +16 (and so on).
- **Presentation (the field exists; the star render does not).** The in-play HUD stays **unchanged** —
  `moves N`, no par, no stars: GD-OQ1's live-HUD refusal stands, because a number the player can exceed
  *during* play is a fail condition by position (a soft timer), and the dip law deliberately spends the
  debut levels' whole budget on comprehension. Stars appear **only after the level is already won**,
  appended to the existing win dialog / end panel (whose frozen shape already carries `moves {M}`):
  `L8 cleared · moves 6 · ★★★`. Three slots, filled = earned; **no par number, no threshold
  explanation, no new screen** (ui-ux §0 non-negotiable 5; AGENTS §10). Static glyphs — no VFX rank
  consumed, nothing idles (R-C8), reduced-motion safe by construction. **Pixel spec is UI/Art's**
  (handoff UA-003); this ADR fixes semantics, thresholds and where it may appear.
- **Persistence (YAGNI: no accounts, no server, no sync).** One versioned localStorage key family:
  `ps.echoGrid/stars@1` → `{"schema":1,"best":{"3":{"moves":6}}}` written **only on win**, monotone
  (a worse run never downgrades a stored best), corrupt/absent/unknown-id data read as empty and never
  throws, cleared by the existing browser-storage surface only. A future second consumer (e.g. a
  challenge mode) takes **its own version suffix**, never an in-place schema bump. Written and read in
  the **game/HUD layer only**: `src/core/**` never touches it, so determinism, undo/restart and the
  Solver are untouched **by construction**.
- **Unlock is completion-based, never star-based** — at 100 levels a star gate would convert a rating
  into a progression wall (forbidden: §12 no new progression systems).
- **The stratified tail law is CHANGED (RULING B, below)** — recorded there, one record per ruling.

**Evidence.**
1. U-001 order (2) + item 106 (the mandate and its two candidate shapes, with the triad flag attached
   to the cap by the user's own framing).
2. `docs/game-design.md` §14.1 (GD-OQ1: live-HUD refusal + the pre-registered evidence-only re-opener,
   scope "L16+ **or the win dialog**") — this ruling operates **inside** that scope: the star is a
   post-win field, so no standing evaluation channel is introduced.
3. `docs/level-design.md` §4 (no death/timer/move limit; R = 0 target; restart-not-stuck) and §1
   (`par` is "**never** a fail condition").
4. `docs/level-difficulty.md` §2b/§5.2 — `T ≡ R ≡ 0` measured on 20/20 and `D_exec = par + 3·B` inside
   the §4 region; hence a cap's `R > 0` reprices every published row.
5. ADR-0009 checkerboard invariant ("a detour adds 2 moves, never 1") — the quantum in `k1`.
6. `docs/level-difficulty.md` §5.2's par ladder (20/20, solver) — the range the formula is keyed to;
   ADR-design-0003 P1 — par floor 4.
7. `docs/ui-ux.md` N-1 (spec authority CONCURS with GD-OQ1) / N-2 (the frozen end-panel string shape
   this ruling appends exactly one field to).

**Result.** Every locked rule survives verbatim: determinism, undo/restart, no fail state, `R ≡ 0`, one
shared `applyMove`. Move depth becomes a **rating the player can chase on their own terms**, never a
wall they can hit: the chase is *"do it again, better"*, not *"you failed"* — which is what makes the
post-win panel a "play one more" hook rather than a punishment texture. `k1`/`k2` are **falsifiable**:
playtest star distribution (below) is authorised to replace the constant pair by regression without
touching the core.

---

## RULING B — Original Hypothesis → Problem → Change → Evidence → Result

**Original Hypothesis.** The L1–L20 spine's rung law — `par` rising by ≥ 2 per rung, each block's
`D_exec` clearing the previous block's peak, one new mechanism or verb per rung — extends to 100
levels: `par` keeps climbing, the census families keep yielding rungs.

**Problem.** The rung law is **exhausted by measurement**, not by fatigue:
- the goal-gated full seal **saturates** (arity 2→16, 3→18, 4→18; 17 160 tuples enumerated; `par 18` is
  the ceiling on 7×6, and `7×7`'s `par 22` is L19's exact seal re-stamped ⇒ refused as a re-lengthened
  walk);
- the adopted sealed-landing device has **no proven ceiling** — F-L20-3 records class completeness
  **OPEN at ≥ 9 pockets** — but neither has it proven a *par-36* board, and its search cost is already
  in the 10⁵–10⁶-tuple class for one rung;
- **`par` is bounded by the board** under P3(a)+P4: a teaching-span par route visits every tile
  (`distinctPositions == width × height`), so on the 7×7 cap a coverage-honest route already has ≥ 48
  steps, and any par above the tile count is **backtracking, not planning** — the refused class;
- searchability collapses as par rises: accept share measured **0.5 % → 0.1 % → 0.06 % → 0.03 %** across
  par 4→10 (315 566 tried / 484 accepted).

Therefore **"strictly above the previous block's peak", applied per rung to 100 levels, is an
unfulfillable obligation** — and fulfilling it nominally (padding pars) is precisely the refit the
gates exist to forbid. Under AGENTS §1 (`Fun > Player Comprehension > Puzzle Depth > Level Scalability`),
the honest architecture gives up the endless climb and keeps the *decisions*.

**Change.**
1. **ACTS.** The dataset is five acts of 20 levels; each act is a **mechanism family × a bounded
   difficulty band** (par plateau + `D_exec` band). Variety, not depth: a new act adds *furniture on
   the same physics* (walls / doors / switches / portals only). Full table: `docs/level-design.md` §7.2.
2. **Band, not number.** Act bands are **ranges** built from the existing machinery, introducing no new
   math: `D_exec ∈ [par_min + 3·1.2500, par_max + 3·1.6875]`, i.e. the measured `B` band
   `[1.2500, 1.6875]` (`docs/level-difficulty.md` §5.2, re-derived from L1–L15 every run, never
   widened; `l016`'s 1.7000 stays the single named excursion) inside the measured theorem
   `T ≡ R ≡ 0 ⇒ D_exec = par + 3·B`.
3. **Act-scale tail law (this CHANGES `docs/level-design.md` §6/§6.1's ordering clause above L20).**
   Instead of "every block-open must clear the previous peak", the law becomes: **within an act** the
   existing rules hold unchanged (no dip without `ΔM > 0`; no padded pars; §6's dip law still binds at
   any future `ΔM > 0` seam); **across acts** the obligation moves to the act's **measured peak** — a
   new act's maximum `D_exec` must exceed the previous act's measured peak (`act-peak` clause), while
   its members may sit anywhere inside the act band. This preserves "never a mechanical staircase" (the
   player meets *breadth*, and the top of each act is higher than the last), and it deliberately
   **relaxes per-level monotonicity between acts** so a fresh family can open with a read-the-furniture
   level (a comprehension beat with `ΔM = 0`, honestly labelled a *plateau relaxation*, never sold as
   a dip).
4. **The tail of the old schedule is re-mapped, not deleted.** `docs/game-design.md` §8's mechanics
   schedule stands for L1–L20 as shipped; **L50 "Final Exam" becomes the Act III midpoint gate
   (`Midterm`)** and the **Final Exam moves to L100** (Act V peak, both axes, zero new mechanics). The
   L16–L25 / L26–L35 / L36–L45 / L46–L49 intents are carried into the acts as **mechanism families**
   (Act II–V), with §8 gaining a pointer row. A `midterm` reuses only taught content, exactly as the
   old L50 did.
5. **Proof obligations per batch, no exceptions.** No level enters the registry without a Solver PASS;
   the full census solver stays the CI gate for **100/100**; browser lanes move to stratified sampling
   with boundary levels always in. Details: `docs/level-design.md` §7.5/§7.6.

**Evidence.**
1. Item 86(a) — exhaustive L19 census, saturation 16→18→18, `7×7` re-stamp refusal, "L20 needs a NEW
   mechanism" and the no-padded-fifth-rung clause.
2. `docs/ai-native-pipeline.md` §8.14 — stage P (≤8 complete: 16 431 095 tile-sets, 2 788 leak-free)
   and stage SL (238 devices, 269 484 tuples, 640 accepts, `par-not-rung` the only firing filter), with
   **F-L20-3** naming the ≥ 9-pocket boundary as OPEN.
3. `docs/level-difficulty.md` §6.1.1 P3/P4 (ceiling from coverage + the measured searchability cliff;
   4/4 accepted candidates at `distinctPositions == width × height`) and §5.2 (the `B` band and the
   `D_exec = par + 3·B` collapse on 20/20).
4. Item 90(b) — `route-budget.test.ts:152`: unpruned walk demand 1.36M → 17.8M → 98.7M → **> 5×10⁸**
   against pruned 2162+7386 at 20 levels; the n-11 prune is load-bearing. Item 92(b): the unlock chain
   measured **60.3 s of a 360 s ceiling at 20 levels**.
5. `docs/project-status.md` item 106 order (3) — the user's own diagnosis that the P10 sampling policy
   is "now COASTING" and forced by the 100-level mandate.

**Result.** 100 levels stop being an extrapolation and become **four censused families at five bounded
bands**: every level is provably solvable and band-contained (solver), every batch is proven before
registry, and the architecture's own weakest claims (par-36 authorability, ≥ 9-pocket completeness,
the Act IV maze family) are named as **census obligations, not promises**. No core rule, weight,
gate threshold, shipped board or published number moves. `docs/game-design.md` §8's schedule is
preserved where it was measured and re-mapped where it was aspirational (L50 → Midterm, L100 → Final
Exam) — recorded here because that is a schedule change.

---

## Decision

1. **Move depth = STAR THRESHOLDS** (soft rating; best run persisted). **HARD MOVE CAP REFUSED** — it
   would create `R > 0`, repricing every published `D_exec` row and contradicting §4's no-fail-state
   law, for no measured demand. Hybrid (iii) parked with a named trigger; any proposal of it needs the
   AGENTS §2 triad + its own ADR.
2. **Thresholds:** `k1 = 2·⌈par/10⌉`, `k2 = 2·k1`, 1★ = any finish; factors `2` (ADR-0009 detour
   quantum) and `10` (P3's published par unit). Falsifiable by playtest regression.
3. **Stars are post-win only**, inside the existing end panel (N-2's frozen shape + one field);
   in-play HUD stays `moves N` with no par and no stars — GD-OQ1's live-HUD refusal stands.
4. **Persistence:** one versioned localStorage key family (`ps.echoGrid/stars@1`), win-only writes,
   monotone best, tamper/corruption-tolerant, **game layer only** — `src/core/**` never reads it; no
   accounts, no sync, no server. Unlock is completion-based, never star-based.
5. **100 levels = five acts of 20**, each act a mechanism family × a band (`docs/level-design.md` §7.2).
   Families use **locked vocabulary only** (walls / doors / switches / portals; determinism;
   no-crush; illegal = identity).
6. **Bands, not numbers:** `D_exec ∈ [par_min + 3·1.2500, par_max + 3·1.6875]` from the measured `B`
   band; no new weight, no new metric, no absolute `D` band above the measured set (§3.5's silence
   above the last measured row is untouched).
7. **Act-scale tail law:** within an act unchanged; across acts the obligation moves to the act's
   measured peak (`act-peak` clause); between-act relaxation is a labelled plateau, never a claimed dip.
8. **L50 → `Midterm` gate; L100 → `Final Exam`** (no new mechanics; the act's max on both axes).
9. **Generator lattice families:** named `--stage` censuses per act (extension of the shipped stage
   P/SL tooling), each bounded and enumerable; **never** clone a shipped board (§6.1.4: the reusable
   unit is the plan shape).
10. **Proof obligations per batch:** Solver PASS on 100/100 (validator, `par == shortestSolution`,
    `T ≡ R ≡ 0`, `deadStates 0`, `noUnrecoverableOk`, coverage, band containment, `B` in band or a
    named excursion, family gates, one negative control per new gate named by its measured refusal);
    sidecar + PINS + `EXPECTED_LEVEL_COUNT` regenerated with every batch; a failing level is
    **rejected, never registered with a caveat**.
11. **CI / P10 policy shape:** full-census solver stays full and cheap on every round; e2e is
    stratified (new batch = full, boundaries always in, seeded interior rotation, bounded coverage
    horizon), with the full 100-level chain reserved for release/milestone certification. QA owns the
    mechanics; the shape is fixed in `docs/level-design.md` §7.6.
12. **Level-lane handoff:** first batch = Act II (L21–L25); its census is specified in
    `docs/level-design.md` §7.7 (extend the pocket class past F-L20-3's ≥ 9 boundary, then the
    multi-pocket lattice). **GD writes no level JSON and no scripts.**

## Consequences

- **Positive.** 100 levels are architectable without inventing mechanics or padding pars; the player
  gets a self-paced efficiency chase that cannot punish; the level lane gets bounded, enumerable,
  pre-named targets; CI keeps a cheap full-solvability gate while browser cost becomes a declared
  sampling policy instead of a cliff.
- **Negative / cost.** Four new `--stage` lattice families and their gate batteries must be authored and
  negative-controlled; Act IV's maze family and Act V's par-36 ceiling are **unproven** (named
  obligations); `midterm`/`L100` re-mapping edits a schedule line that has been in `docs/game-design.md`
  since V0.1.
- **Risk register.** (a) *Star-chase misread as punishment* — hypothesis; Playtest measures star
  distribution, replay rate and 1★-vs-quit correlation before thresholds are frozen. (b) *Band
  relaxation read as "the game got easier"* — mitigated by the `act-peak` clause being measured per act,
  not asserted. (c) *Sampling policy hides a broken level* — mitigated by the bounded coverage horizon
  (every level is walked within N rounds, full chain at release) and by never sampling new content.
- **Not changed.** The locked core loop; `M` schedule for L1–L20; weights `w1…w5`; every published
  `D`/`D_exec`/par number; the registered L1–L20 bytes and their gates; §4's fail-condition law; §6's
  dip law; §6.1's P1–P4; §6.2's sealed-landing law.
- **Follow-ups.** UI/Art (UA-003): pixel spec for the post-win star field, inside N-2's frozen string
  shape. Gameplay (GAME-00x): star computation + the `<key>@1` persistence row in the HUD layer only.
  Playtest (PA): the measurement protocol in §7.1/RULING A, thresholds frozen before the cohort (T6).
  QA: the P10 sampling policy mechanics + the `route-budget.test.ts:152` prune decision. Level lane:
  §7.7's first-batch census.