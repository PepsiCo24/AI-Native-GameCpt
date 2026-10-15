# ADR-architecture-0002 — Solver metric #7 canonicality (unordered stays, ordered companion adopted) & the theme-token parity chain

- **Status:** Accepted — Architect ruling (task AR-0005b); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-15
- **Deciders:** Agent 2 (Technical Architect). Ruling 1 closes the question **ADR-0009 Context item 5 explicitly deferred to the Architect** ("whether to upgrade the shipped metric … no ruling is made here").
- **References:** ADR-0009 (decisions 1/4; Context item 5 metric-semantics note); `docs/ai-native-pipeline.md` §8.5 (pre-L11 acceptance law); `src/core/solver/bfs.ts` (`explore` / `clickLedger` / `refusedThenEnteredTiles` / `dualPhaseTiles`); `src/core/solver/policy.ts` (named gates); `docs/ui-ux.md` §4.3/§5.4 (token map, R-C11/R-C12); `src/game/theme/tokens.ts`; `docs/architecture.md` §8/§9/§12 (the normative text this ADR backs).
- **Changes no rule, no code, no level.** Both rulings are canonicality rulings over artefacts that already exist and agree today; their teeth are the test tickets they name.

## Context

### Thread 1 — metric #7 `refusedThenEnteredTiles`

The standing ticket: on the same board the move order `down,right,up` produces the refuse→enter beat while `right,down,left` does not — the beat is **order-sensitive** — so the metric was questioned, with three options on the table: make it advisory, redefine it order-free, or downgrade it to a diagnostic (the last motivated by "#3 `dualPhaseTiles` is already order-free").

Legal constraints that are not mine to relitigate:

- `dualPhaseTiles ≥ 1` is **provably unsatisfiable on portal-free boards** (checkerboard invariant, ADR-0009 decision 1 — proved three times, pinned by `tests/solver/dynamism-metrics.test.ts`, machine-enforced as the only `UNSATISFIABLE`-producing gate under a two-fact guard). ADR-0009 schedules portals at L11.
- Therefore the pre-L11 dynamism/acceptance leg is carried **only** by #7: ADR-0009 decision 4 ("the latch, not parity, carries the decision") and the Orchestrator's adjudicated acceptance law (`docs/ai-native-pipeline.md` §8.5: pre-L11 M1+M3 acceptance = `refusedThenEnteredTiles ≥ 1`, gate (iv) activates at L11).
- LV-006/LV-007A already shipped the named gates (i)–(vi), the typed `POLICY_VIOLATION_CODES` inventory with one negative control per code, and the `lesson-latch-dynamism` policy that reads #7 as a hard gate.

What the shipped code actually does (read from `src/core/solver/bfs.ts` on `develop` `b65e465`, not from memory): the metric is computed from the **complete reachable `SearchState` graph** (`explore()`); for every reachable node all four click directions are classified by `legalMask` — which **is** `isLegalMove`, no second legality path; the key is the **clicked tile** (`player + dirDelta`, the tile `applyMove` step 1 judges — a portal landing is keyed only when itself clicked); a tile counts iff its click is **refused in ≥ 1 reachable state AND accepted in ≥ 1 other reachable state**. It is a deterministic function of `(level, startState)`: the reachable set is a fixpoint, so BFS traversal order cannot change the value. **It is not computed over any path set** — not shortest paths, not greedy lines, not single playthroughs.

Measured evidence for this ruling (program runs on `b65e465`, reproducible):

1. `node_modules/.bin/tsx scripts/solve-levels.ts` — 10/10 PASS; `refusedThenEnteredTiles` = **1, 1, 1, 2, 1** on L6–L10 (tiles `[3,1] [1,1] [3,1] [2,2 4,1] [4,1]`), 0 on L1–L5. Reproduces `docs/level-difficulty.md` §5.1.
2. The **ordered variant** (tile counts iff ∃ a refusing reachable state `r` and an accepting reachable state `a` with `a` reachable from `r` — equivalent to "one legal play trace on which the refusal strictly precedes the acceptance", because refusal is identity, §6.1) computed over the same ten graphs: **tile lists identical on every level**. The upgrade question is therefore free of re-acceptance cost on the shipped set.
3. 2,000 seeded random 1-door-1-switch boards (mulberry32; harness out of repo, counts re-runnable): 568 boards fire **both** forms; **18 boards (≈ 0.9 %) fire unordered but NOT ordered** — the divergent class exists: trapped-refusal pockets (a state that refuses the tile, from which no state accepting it is reachable). The two semantics are genuinely distinct in the wild, not a theoretical nicety.

### Thread 2 — theme tokens

`docs/ui-ux.md` §5.4 names itself spec authority and (since its V0.6 correction, S-1) names the shipped location `src/game/theme/tokens.ts` — written and owned by the Gameplay Engineer (AGENTS.md §4); no `src/ui/**` tree exists. R-002 added the door/switch/portal token surface that now ships on `develop`.

Verified on `b65e465` (all reproducible):

- **R-C11 holds in code:** no `#RRGGBB` literal under `src/game/**` outside `theme/tokens.ts` (the single grep hit is a *comment* in `renderer/objects/actor.ts` explaining where `fx.phaseRing` may come from).
- **Value parity is exact:** every §4.3 base value matches `BASE` in `tokens.ts` (grounds, wall/echo/edge, goal, portal, doorRed/doorBlue, switch, actor, text, accent, hud, btn, feedback, winAlpha 0.18/0.16); all six derived tokens re-executed in plain Node match the published values exactly (A `#BBB09B #AFA491 #D4928B #8CA8D4 #4C8B91` + ring `#3A3226`; B `#585786 #6B64A4 #9C5E64 #5E7EAE #6CB5B5` + ring `#EAF0FF`); `ringVisible` = A on / B off matches R-C9; `FLIP_TIMING` S/CL/reduced and `LAYOUT` match §6.2/§6.2a/§2.2.
- **…and none of it is pinned.** The §5.4-recommended enforcement (QA-owned grep test: no hex literal, no `phase === "A"` colour branch under `src/game/**` outside the token module) is **not implemented** — the §12.1 import-boundary test scans only `src/core/**` for `phaser` / `src/game/**` imports. No test pins `THEME` values or the derived-token formulas against §4.3. Parity is today maintained by review alone. The doc-chasing-code corrections of the past (V0.6 S-1 path + `FLIP_TIMING` shape) happened precisely because nothing went red at commit time.

## Decision

### Ruling 1 — metric #7 stays **canonical** with its shipped (unordered, state-set) semantics; the beat's order-dependence is mechanical semantics, not a measurement defect; an **ordered companion metric** is adopted by spec, with a named implementation trigger.

**(a) Defect or semantics — semantics, twice over.** (i) The *experienced* beat is inherently trace-ordered because the latch **is** memory: a player who steps on the switch before approaching the door never sees the refusal — that is the shipped L6 lesson ("the latch on the natural path"), the mechanic working as designed. Whether one playthrough contains refuse→enter depends on the player's move order; that is a property of the trace, not a bug in the instrument. (ii) The metric never claimed to measure a playthrough: it is a board-level property of the complete reachable state set and is **already order-free** (traversal-order-invariant fixpoint). The ticket's premise "#3 is order-free, #7 is not" is false as stated — both shipped metrics are state-space properties; what differs is that #3's pre-L11 value is theorem-forced to 0 while #7's is free to vary. The `down,right,up` vs `right,down,left` observation conflates the trace layer with the state-space layer.

**Rejected options from the ticket.** *Downgrade to diagnostic* — REJECTED: the pre-L11 acceptance law (pipeline §8.5) rests on #7 ≥ 1 as the **only** dynamism carrier; #3 is provably 0 there, so downgrading removes the named metric the acceptance system runs on. *Order-free redefinition* — MOOT: the shipped metric is already order-free over the state space. *Advisory status* — REJECTED: `policy.ts` consumes #7 in hard gates (`lesson-latch-dynamism`; Aha gate (iii)) with per-code negative controls; "advisory" would contradict shipped enforcement.

**(b) Definition contract** — normative, written from the shipped implementation (`bfs.ts` @ `b65e465`); if code and this text ever disagree, that disagreement is a failing-test alarm, never a licence to re-read the code:

1. **Universe:** every `SearchState` reachable from `initialState(level)` under the shipped `applyMove` (goal states expanded; no win latch at this layer — §6.2 M-4). No path set is selected: not shortest routes, not greedy lines, not sampled playthroughs.
2. **Observation unit:** per (reachable state × direction), the **clicked tile** `state.player + dirDelta` — the tile `applyMove` step 1 judges. A portal's *landing* tile is not credited by the teleport; it counts only when itself clicked from an adjacent state.
3. **Verdicts:** `refused` = `isLegalMove` false (no movement, no flip; includes out-of-bounds clicks, which can never be accepted and therefore never enter the metric); `accepted` = legal move.
4. **Set rule:** a tile belongs to `refusedThenEnteredTiles` iff `refused` at ≥ 1 reachable state **and** `accepted` at ≥ 1 reachable state — an **unordered** conjunction over the state space. The report's list is sorted `"x,y"` keys; the count is its length.
5. **Determinism:** a pure function of `(level, startState)`; BFS discovery order cannot affect it. Any harness that starts from a state the game cannot reach (ADR-0009 Context item 5's lesson) measures a different game.

**(c) The deferred upgrade question is answered: no in-place upgrade.** The ordered variant ships as a **separate named companion metric**, specified here, implemented by Level AI + Solver:

> **`refusedBeforeEnteredTiles`** — a clicked tile `T` counts iff there exist reachable states `r` (the click on `T` is refused at `r`) and `a` (the click on `T` is accepted at `a`) such that **`a` is reachable from `r`** in the reachable graph. Because refusal is identity (§6.1), this is exactly "∃ a single legal play trace on which a refusal of `T` strictly precedes an acceptance of `T`". Computable from the existing `ReachableGraph` (one reverse reachability per candidate tile over `edgesIn`); no second search, no second rule.

The two forms have distinct jobs, and the split is load-bearing: **#7 (unordered)** measures *history-dependence of entry legality* — the pre-L11 dynamism/acceptance carrier, whose theorem base (M0/M1-alone ≡ 0) was proved for this form, and which must keep firing for latch boards whose beat is real but trace-unwitnessable (the divergent 0.9 %: a trapped refusal still proves the tile's legality is history-dependent, and `lesson-latch-dynamism` must not call such a board "static"). **The companion (ordered)** measures *beat-witnessability* — the semantically correct reading of the Aha promise "refused first, entered later", and the form immune by construction to the ADR-0009 harness-artifact class (both events must live on one real trace; an unreachable state cannot forge it).

**Implementation trigger (YAGNI guard):** the companion MUST land before the first L11+ portal candidate is accepted (teleport edges are one-way-ish; trapped-refusal divergence is measured at 0.9 % on plain latch boards and is plausibly more frequent once portals ship), and SHOULD land whenever a candidate first diverges (`refusedThenEnteredTiles > 0` ∧ `refusedBeforeEnteredTiles = 0`). Until it lands, gate (iii) keeps reading the unordered form — measured harmless today: identical tile lists on all of L1–L10. The JSON report gains the field only when the implementation ships; docs do not run ahead of code.

**(d) Wording suggestions for the Game Designer** (GD owns the target ADR/doc text; these are suggestion drafts, original sentence → proposed sentence): see **Appendix A**.

### Ruling 2 — theme tokens: **docs hold value & meaning authority; `src/game/theme/tokens.ts` is the sole injection point; parity is pinned by tests — whoever drifts, goes red.**

1. **Canonical chain (normative).** *Spec:* `docs/ui-ux.md` §4.3 (values, blend rules, measured contrast evidence) and §5.4 (skin contract, R-C11/R-C12) are the **value and meaning authority** (owner: UI / Art Director). *Injection:* `src/game/theme/tokens.ts` is the **only** module where colour/timing/layout constants enter code (owner: Gameplay Engineer writes it; `theme(phase)` the only lookup; no `phase ===` colour branch, no hex literal elsewhere — R-C11). *Pins:* `tests/**` hold the two against each other (owner: QA). If a future standalone `src/ui/**` tree appears, it imports the same module — the map is never forked (§5.4 already says this; confirmed here as architecture).
2. **Direction of truth for derived tokens.** The **formulas** are law (60/40 `wallEchoFill`; 55/45 `wallOccupied` / `doorRedOccupied` / `doorBlueOccupied`; 80/20 `portalEcho`; the boot-time minimax for `fx.phaseRing` — R-C12). Docs publish the measured outputs; code computes them. A base-token re-tune without the derived re-computation — in either direction — must fail the pin.
3. **Change flow.** Any token change = spec row (value + derivation + re-measured evidence) **and** code **and** the parity pin, in one change. A docs-only or code-only move goes red. Interface additions (new token groups, new tables like `FLIP_TIMING`/`LAYOUT`) are legal only when the spec section names them — spec-first; the export surface follows §5.4's declared shape.
4. **Enforcement, specified today** (architecture.md §12 rows added): **(i)** the §5.4-recommended static scan — no `#RRGGBB` literal and no `phase === "A"` colour branch under `src/game/**` outside `theme/tokens.ts`, same static-analysis family as §12.1; **(ii)** a **token-parity test** pinning every §4.3 base value and every derived-token formula output (and the `ringVisible` boot rule) against the shipped `THEME` map. Both land green on the current tree — the parity was verified exact by re-execution for this ruling (Context, thread 2) — so their purpose is to make the *next* drift red at commit time instead of corrected in prose a version later. That terminates the "docs chase code" pattern (V0.6 S-1) by construction.

## Consequences

- (+) The pre-L11 acceptance system keeps its named, program-proven metric — no gap opens between ADR-0009 decision 4 and enforcement.
- (+) The metric's contract is now written precisely enough to be tested against misreading: universe, keying, verdicts, set rule, determinism — each sentence maps to shipped code.
- (+) ADR-0009's deferral is closed with evidence, not opinion: identical on the shipped set, divergent-but-rare in the wild, so the stronger form is adopted where it is cheap (a spec + a named trigger) instead of a rushed re-implementation.
- (+) Token authority stops being a matter of editorial discipline: values, formulas and the no-hex/no-branch law become CI-enforceable, with owners named per layer (UI/Art spec · Gameplay injection · QA pins).
- (−) One more metric lands later (the companion) — accepted cost, bounded by the trigger; until then gate (iii) reads the unordered form under a measured coincidence proof.
- (−) Two QA tickets join the backlog (§12 rows); neither blocks level or renderer work.
- (−) The 18/2000 divergent boards are **not** mis-measured by the shipped set's acceptance law — they remain correctly classified as history-dependent by #7 — but a future Aha-claiming level drawn from that class would need the companion to prove its beat; the trigger covers exactly this.

## Appendix A — wording suggestions for the Game Designer (suggestion drafts only; GD owns the target text — `docs/decisions/design-*`, `docs/level-design.md`)

**A1 — ADR-0009, Context item 5, metric-semantics note (the deferral sentence).**

> 原句： "The ordered variant (refusal strictly earlier than a later acceptance of the same tile) is **stronger and would have been immune to the harness artifact above**; whether to upgrade the shipped metric is **deferred to the Architect** — no ruling is made here."

> 建议新句： "The ordered variant (refusal strictly earlier than a later acceptance of the same tile) is stronger and is immune to the harness-artifact class. **Resolved by ADR-architecture-0002 (2026-10-15):** the shipped unordered metric stays canonical as the history-dependence carrier (the pre-L11 acceptance leg); the ordered variant is adopted as the companion metric `refusedBeforeEnteredTiles` (path-witnessed beat), specified in `docs/architecture.md` §8, to be implemented before the first L11+ portal candidate is accepted. Measured on the shipped L1–L10: identical tile lists under both forms (1/1/1/2/1 on L6–L10); divergence exists in the wild (18/2000 random latch boards — trapped-refusal pockets), which is why the companion is *added* rather than the shipped metric re-read."

**A2 — `docs/level-design.md` §3, condition (iii) (and the matching Aha #1 leg in ADR-0009 decision 6's construction reference).**

> 原句： "**(iii) `refused-then-entered`** — the crossed door tile appears in `refusedThenEnteredTiles` (**≥ 1**). (l008: `(3,1)` — the very tile that refused the greedy line.)"

> 建议新句： "**(iii) `refused-then-entered`** — the crossed door tile appears in `refusedBeforeEnteredTiles` (**≥ 1**): on at least one legal play trace the tile is *refused strictly before it is entered* — the ordered beat the Aha words promise (ADR-architecture-0002). Until the companion metric ships, gate (iii) reads `refusedThenEnteredTiles ≥ 1` — the two forms are measured identical on l008 and on all of L1–L10, so the stand-in changes no verdict. (l008: `(3,1)` — the very tile that refused the greedy line.)"

**A3 — no change suggested** to ADR-0009 decision 4 or `docs/ai-native-pipeline.md` §8.5: the pre-L11 acceptance law deliberately keeps reading the **unordered** `refusedThenEnteredTiles ≥ 1` (board-level dynamism), which is the form its theorem base was proved on. (§8.5 is Level AI + Solver's file; noted here so the two legs of the split are not re-merged by a later edit.)

## Corrigenda (2026-10-15, AR-0006 / ADR-architecture-0003)

1. **The 18/2000 (≈ 0.9 %) divergence figure** (Context thread 1 evidence 3; Decision (c); Consequences; Appendix A1) is a **historical measurement**: produced by an out-of-repo mulberry32 harness at `b65e465` whose generator was never committed and cannot be re-run. The canonical, test-pinned number is **46/2000 (2.3 %)** from the in-repo sweep (`tests/solver/ordered-companion.test.ts` §5 — 44 self-closing-latch, 2 unexplained, seeds 187/1228). The two scans used different generators over different board populations, so the numbers do not contradict; the pinned one governs every citation (ADR-architecture-0003 Ruling 1).
2. **The implementation trigger is consumed ahead of schedule:** the companion metric shipped report-only at LV-007B (`600c5d4`) and gate (iii)'s code reader switched to it at LV-007C (`9dd92ce`) — before the first L11+ portal candidate, as required. Appendix A3 stands unchanged: the §8.5 generation leg stays unordered deliberately (Orchestrator ruling, project-status item 39).
