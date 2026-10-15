# ADR-design-0003 — The L12–L15 block law: par obligation, two-beat dip, latch grade (+ per-board verdict)

- **Status:** **Proposed → Accepted** by Game Designer authorship (task GD-011, 2026-10-16); **Orchestrator countersign at merge to `develop`** per `AGENTS.md` §4
- **Date:** 2026-10-16
- **Deciders:** Agent 1 (Game Designer), on measured evidence produced by Level AI + Solver (LV-009-A, branch `agent/level/lv-009-doctrine-block`, tip `b631cda`, authoring base `79d1258`, `SEED 20261016`) and independently re-confirmed by the Orchestrator on the solver. **No core-rule change occurs in this ADR** — the locked rule (`AGENTS.md` §2) is untouched; this is level-design law, not mechanics. GD edited **no code**; LV-009-B encodes the approved numbers the way LV-008 encoded GD's L11 numbers.
- **Law text (normative):** `docs/level-design.md` **§6.1** (V0.9, GD-011). This ADR is the record + the verdict; §6.1 is the law.
- **References:** `docs/level-design.md` §1 (schema, board caps, one-switch-per-door), §3 gates (i)–(iv), §4 (no-false-route / no-dead-state region), §5 (block intents), §6 (dip law, construction floor, frozen L11 prediction), **§6.1 (this law)**; `docs/level-difficulty.md` §3.4/§3.5/§5.2 (Level-lane-owned — **cited, never edited**; the sidecar is test-pinned); `docs/decisions/design-0001-*` (execution axis), `docs/decisions/design-0002-*` (ordered-reader block ruling + its pre-specified re-opener); `src/core/solver/policy.ts:599/613/246` (**read-only** — the seam pattern GD fills, does not edit); ADR-0004 (Solver proves, never repair), ADR-0008 rules 1–7 (entry-only solidity), ADR-0009 (checkerboard invariant; mechanics schedule); `docs/ui-ux.md` Entry-3 JUDGED legibility facts; `src/levels/README.md` §4 R-003; LV-009-A dossier `candidates/README.md` §1–§8 (read-only).

---

## 1. Context

LV-009-A authored and solver-proved four out-of-tree L12–L15 candidates and **correctly stopped** at three questions that are design authority, not solver authority (its dossier §7 OQ-1/OQ-2/OQ-3). It never edited the engine, never edited a candidate to fit a law, and recorded its own rejections unrepaired (ADR-0004). The gaps were real:

- `policy.ts:599/613` publish `PORTAL_DEBUT_PAR_CAP = 4` and `PORTAL_DEBUT_EXEC_BUDGET = 13.64` as **L11 debut-only** obligations, and `policy.ts:246`'s own comment says a post-debut portal level "must declare its own lesson/obligation, because the par cap and the below-OFFERED grade are properties of the *debut*".
- `docs/level-difficulty.md` §3.5 **deliberately** publishes no numeric target above L11.
- So the pars 4/6/8/10, the two-beat dip, and the `switchRequired = false` grade were all **proposals with no law to be measured against**.

**The discipline that governs this ADR:** the law is published **before** the verdict lines below, and the verdict quotes solver values — never vibes. A number published after seeing boards is honest only if the law says why **no other shape** satisfies it; §6.1.1 does exactly that (uniqueness proof), so this is not approval-by-adoption. LV-009-A's own anti-post-hoc behaviour (122 `block-floor` rejections at L15 — the clause used as a *filter* during search, not a target read off the result) is preserved by answering before integration, while the branch is still HELD.

Headline measured facts carried into this ruling (Orchestrator-confirmed on the solver):

| | L11 (shipped) | L12 | L13 | L14 | L15 |
|---|---|---|---|---|---|
| Board | 7 × 3 | 7 × 3 | 6 × 4 | 7 × 4 | 7 × 5 |
| `par` | 4 | **4** | **6** | **8** | **10** |
| `D_exec` | 8.573171 | **8.230769** | **10.898734** | **12.957895** | **14.969697** |
| Δ | −5.069686 | **−0.342402** | +2.667965 | +2.059161 | +2.011802 |
| `portalFree` | — | **true (7)** | **false** | **false** | **false** |

`T ≡ R ≡ 0`, `deadStates 0`, `noUnrecoverableOk true`, validator `ok` with 0 errors — **4/4**. `switchRequired = false` on **all 484 accepted candidates**. Block-end clause `D_exec > 13.64`: **FIRED POSITIVE at the tail** (first ever escalation-direction firing; also above L10's measured peak 13.642857).

## 2. Rule-change record (required format, `AGENTS.md` §2)

- **Original Hypothesis** (`docs/level-design.md` §6 V0.6 / `docs/level-difficulty.md` §3.5): above L11 the **ordering** is law (strictly above the previous block's peak, ramp within the block, never a staircase) plus the construction floor at a seam — and **no numeric target is published**, because every such number would be unfitted (provisional V0.1 weights) and unmeasurable (the levels did not exist). The L12–L15 par ramp, the dip's beat count, and the latch grade were left to be *declared per level* by whoever authored them.
- **Problem:** LV-009-A proved the gap is load-bearing, not cosmetic. Without a published par law, a correct 4/6/8/10 ramp is **indistinguishable from a fitted one** — the anti-post-hoc guarantee that made the L11 acceptance law trustworthy (`D_exec(L11) < 13.64` published before any candidate existed, then filtered to 1 accept from 54) cannot exist for the block. Without a dip-shape ruling, §6's "and its successor where the block allows" is ambiguous enough that a compliant L12 could be rejected or a non-compliant one accepted. Without a latch grade, the measured `0/484 switchRequired` fact reads either as doctrine or as a defect — and the stricter reading would invalidate **every** accepted candidate in the block.
- **Change:** three clauses published as law in `docs/level-design.md` §6.1 —
  **(Q1)** the par obligation as **floor ∩ step ∩ ceiling ∩ coverage** (**P1** `par(L12) = 4` by intersection; **P2** within-block `Δpar ≥ 2`; **P3** teaching-span ceiling `par ≤ 10`; **P4** coverage `distinctPositions = width × height`), with the **uniqueness proof** `4 members ∧ P1 ∧ P2 ∧ P3 ⇒ 4/6/8/10` and a stable shape for L16+;
  **(Q2)** the dip is **two beats** — L12 owns §6's successor slot, single-beat rejected, no re-author;
  **(Q3)** the latch grade is **"par-not-solvability from L12 up"**, hardened into falsifiable obligations **G1** `allOffShortest − par ≥ 1`, **G2** switch pressed and door crossed on every par route, **G3** ordered reader ≥ 1, **G4** `DOCUMENTED_LESSONS` carries `"exempt"` not `null`.
  **No `D`/`D_exec` target is published** — §3.5's deliberate silence above L11 stands, and the only numeric `D_exec` obligation for this block remains §6's already-frozen clause. **No weight, threshold, gate or metric definition changed. No code edited by GD.**
- **Evidence:** `B`'s measured band **[1.2500, 1.6875]** on 11/11 shipped levels (`docs/level-difficulty.md` §5.2, test-pinned) ⇒ `3·B` spread **1.3125 < 2** — the derivation of P2. Coverage measured **4/4** at 100 % (21/21, 24/24, 28/28, 35/35 — dossier §2.1–2.4). Searchability cliff measured **0.5 % → 0.1 % → 0.06 % → 0.03 %** accept share over 315 566 trials / 484 accepts (dossier §5). `switchRequired = false` on **0/484** with `allOffShortest − par = 2` exactly on 4/4 (6/8/10/12 vs 4/6/8/10). `portalFree`: true(7) on L12, **false(null)** on L13–L15 ⇒ walk-only UNSATISFIABLE. Ordered == unordered refusal readers on 4/4 (3/5/5/6 tiles) ⇒ ADR-design-0002's promotion trigger again does **not** fire. Shipped two-beat precedent: L6 8.86 / L7 7.75 then ramp 10.50 / 12.14 / 13.64 (§6 read-out).
- **Result:** `docs/level-design.md` V0.9 §6.1 published; §6's frozen block-end clause recorded **DISCHARGED**; all four boards **ACCEPTED** clause-by-clause below against numbers published in the same sitting but *before* the verdict lines; LV-009-B handed the exact constants to encode plus a pre-registered acceptance law to enforce before merge (§7).

## 3. Ruling Q1 — the par obligation (OQ-1)

**RULED: publish `par(L12–L15) = 4 / 6 / 8 / 10` as the UNIQUE solution of floor ∩ step ∩ ceiling ∩ block length. The proposal is ADOPTED AS DERIVED, not approved by taste.**

Derivation (full audit trail in §6.1.1; the point of restating it here is that each step cites an already-written rule or a program measurement, never a preference):

| Step | Constraint | Source | Effect |
|---|---|---|---|
| P1 | `par(L12) ≤ 4` **and** `≥ 4` | §6 *Construction floor* successor slot; the game's measured par floor 4 (ADR-design-0001 Change; `docs/level-difficulty.md` §5.2 "par can only fall to the block's floor (4, the game's lowest)"; shipped L1/L6/L7/L11 all par 4) | `par(L12) = 4` — **pinned, no freedom** |
| P2 | `Δpar ≥ 2` within the block | `D_exec = L + 3·B` (measured theorem inside §4's region) with `3·B ∈ [3.750, 5.0625]` ⇒ spread **1.3125**; the minimal integer step exceeding it | makes §3.4's ramp a **guarantee**, not a hope. `Δpar = 1` does not guarantee it |
| P3 | `par ≤ 10` in the teaching span | coverage measured 4/4 at 100 % under §1's hard 7-cap; searchability cliff 0.5 %→0.03 %; shipped max par 9 (L10); §3.5 must leave L16+ headroom | caps the ramp |
| — | the block has **exactly 4 members** | `docs/game-design.md` §8 block ranges (L11–L15) | closes the system |

`4 + 2·3 = 10`: the minimal ramp lands **exactly** on the ceiling, so `4/6/8/10` is the **only** admissible ramp. `(4,6,8,11)` / `(4,7,9,11)` break P3; `(4,6,7,9)` / `(4,5,7,9)` break P2; any `par(L12) ≠ 4` breaks P1. **This is the answer to "why no other shape satisfies it."**

**Empirical confirmation of P2 (a confirmation, not the derivation).** Decomposing the three measured ramp deltas exactly:

| Step | `Δpar` | `Δ(3·B)` | `Δ D_exec` (measured) |
|---|---|---|---|
| L12 → L13 | +2 | +0.667965 | **+2.667965** |
| L13 → L14 | +2 | +0.059161 | **+2.059161** |
| L14 → L15 | +2 | +0.011802 | **+2.011802** |

The `B` contribution to the ramp is tiny and shrinking (0.668 → 0.059 → 0.012) and could easily have been **negative** — the par step is what actually carries §3.4's ramp. P2 was derived from the band *spread* before this table was written; the table merely shows the derivation was not academic.

**Rejected shapes (recorded, per the brief's option list):**

- **Per-level caps only (`≤4 / ≤6 / ≤8 / ≤10`)** — REJECTED. A cap cannot express "the ramp must be monotonic on `D_exec`", so a compliant-looking 4/4/4/4 block would pass every cap while violating §3.4 outright. Caps without a step rule are not a law.
- **Cap-with-band (e.g. `par ∈ [4,6]` per level)** — REJECTED. A band widens the search without buying guarantee: the band's lower edge still needs P2 to force monotonicity, and its upper edge re-opens exactly the fitting risk this ADR exists to close (a band published after seeing 6/8/10 is a band drawn around 6/8/10).
- **A stricter step (`Δpar ≥ 3`)** — REJECTED as **unsearchable**, and the 484-accept tables say so: L15 already cost 132 000 trials for 44 accepts (0.03 %). `Δpar ≥ 3` from a pinned floor of 4 would demand par 13 at the block's end — above the measured coverage invariant at every board size §1 permits in the teaching span, and deep inside the accept-rate cliff. A law nobody can satisfy is not a stricter law, it is a blocked block. (This is the "must remain SEARCHABLE" condition the brief set.)
- **`D_exec` targets for L12–L15** — REJECTED on §3.5's own reasoning: the weights are V0.1-provisional, so any `D_exec` band would be unfitted-by-construction, and inventing one repeats the error §3.1 withdrew. `par` is published because it is **weightless**; `D_exec` is not, because it is not.

**If the shape had been REJECTED, the re-author would have had to search for:** a pinned L12 (P1 is not negotiable — it is an intersection), a monotone `D_exec` ramp guaranteed against `B`'s measured band (⇒ `Δpar ≥ 2`), coverage 100 % (⇒ board sized to the route, not the reverse), and a tail clearing 13.64 **inside** an accept rate the generator can actually reach (⇒ the tail level must stay near par 10 on a ≤ 7 × 5 board). Those four conditions *are* 4/6/8/10, which is why the shape is published rather than rejected.

## 4. Ruling Q2 — the dip shape (OQ-2)

**RULED: TWO-BEAT breathing post-debut. L12 owns §6's successor slot. SINGLE-BEAT REJECTED — no board is re-authored.**

The L11–L15 dip spans **L11 (debut) + L12 (successor)**; the ramp begins at the third member. The two shipped blocks are **isomorphic** on the execution axis:

| | beat 1 (debut) | beat 2 (successor) | ramp | ramp | ramp (block end) |
|---|---|---|---|---|---|
| **L6–L10** (shipped) | 8.86 | **7.75** (−1.11) | 10.50 | 12.14 | **13.64** |
| **L11–L15** (this law) | 8.573171 | **8.230769** (−0.342402) | 10.898734 | 12.957895 | **14.969697** |

Judged comprehension-first, per `AGENTS.md` §1's priority order (Fun > Player Comprehension > Puzzle Depth):

1. **The text's plain reading.** §6 / §3.4: "the debut level **and its successor where the block allows**". A single-beat ruling must explain why the successor clause exists, and why §6's own read-out used two beats for L6 ("the dip spans exactly the two par-4 levels … matching the construction floor's 'first 1–2 levels'").
2. **What the player needs at L12 is REST, not escalation.** Aha #2 is the **only** idea in the game that breaks the checkerboard invariant (§0 — proven law; portals are the sole parity-breaker, ADR-0009). The player spent ten levels learning "a tile's answer is fixed by its position". L11 gives that one exposure: par 4, 82 reachable states, **1** par route. One exposure cannot convert an invariant-break into a habit. L12's job is **consolidation at the same par on a different skeleton** — the dossier's own finding: L12's 351 accepts come from `funnelFamily`, which keeps the debut's *plan shape* (channel → latch → door) while changing the board. Same cost, new surface. That is what consolidation looks like.
3. **The escalation that follows is qualitative and FORCED, so it needs a run-up.** From L13 the walk-only world is **UNSATISFIABLE** (`portalFree = false`, measured): the portal stops being a re-pricing shortcut (L12: `portalFree true`, route 7 → 4 — the channel *re-prices* without being the only door) and becomes **the only door**. Demanding that in the same breath as the debut, at a higher par, stacks execution load on comprehension load — precisely the unfairness §6's *Rationale* forbids. Two beats buy exactly one rest level before the mandatory-channel step, and the ramp then climbs for three levels without a new idea (dossier §2.3: "the escalation is board growth + route count (3 → 10), not a new idea").
4. **Single-beat buys nothing the law requires.** The block-end clause is satisfied either way (`14.969697 > 13.64`), so single-beat would re-author one board to trade the block's only rest beat for a marginally steeper ramp — comprehension (priority 2) sold for depth (priority 3). Under §1 that trade is wrong.
5. **The second beat is honestly labelled.** The dip's arithmetic: `D_exec(L11) = 4 + 3(1.524390) = 8.573171`; `D_exec(L12) = 4 + 3(1.410256) = 8.230769`; difference `= 3(1.524390 − 1.410256) = 0.342402`. **Par is flat at the floor 4, so the entire −0.342402 is carried by effective branching falling** — beat 2 is a **choice-narrowing rest**, not a shorter level (a better rest than shortening, and it is measured). On the felt axis this is therefore a **consolidation plateau**, not a valley. §6's withdrawn-not-refit ban applies in both directions: this ruling is made on grounds 1–4, **not** because −0.34 is small, and re-authoring to gain +0.35 on a provisional weight vector would itself be curve-flattery.

**The felt half stays a labelled hypothesis** (§6, PA handoff): L11-vs-L12-vs-L13 on first-win time, M5 restarts, M6 undos, M4 refusals, thresholds frozen before the cohort runs (T6 discipline). GD-011 rules that the **construction** is right and names who measures the **experience**; it does not claim the plateau is felt.

## 5. Ruling Q3 — the latch grade for combo levels (OQ-3)

**RULED: option (a) ACCEPTED AS DOCTRINE — the latch grades `par`, not solvability, from L12 up — hardened into falsifiable obligations G1–G4. Option (b) REJECTED.**

> ### The sentence future reviewers should quote
> **"From L12 up, the switch buys you *speed* and the sealed channel buys you *existence* — the latch grades `par`, never solvability, and from L13 the portal IS the solvability-load."**

Measured basis: `switchRequired = false` on **0 of 484 accepted candidates**, with the all-OFF world solving **exactly 2 moves slower** everywhere (`allOffShortest` 6/8/10/12 vs par 4/6/8/10). A filter that invalidates **484/484** is not a filter on authoring quality — it is a filter on **geometry class**.

Reasons, against the locked core and the priority order:

1. **It is the world the core rule already promises.** `AGENTS.md` §2 + ADR-0008 rules 1–7: entry-only solidity, a closed door **refuses** (no movement, no flip), and nothing is ever crushed, pushed or relocated. §4: "every refusal is information"; restart-not-stuck. A latch worth 2 moves *is* that world — doors **re-price** routes, they do not gate existence. Option (b) would make the latch an existence-gate in a game whose locked core says a closed door is a refusal, not a wall.
2. **One existence-gate per block is a lesson; two is redundancy.** This block already has one, and it is the interesting one: from L13 the sealed line makes the portal mandatory (`portalFree = false`). Stacking all-OFF unsatisfiability on top puts two existence-gates in the first block where parity itself breaks — and dilutes Aha #2, the block's actual payload.
3. **This block's lesson is Aha #2, not Aha #1.** The `"required"` obligation belongs to the **latch unit's own block** (L7–L10: Aha #1 at L8, gate (i) `no-solution-with-switches-off`). Re-asserting it in the **portal** block subordinates this block's lesson to the previous block's. `policy.ts:246` already states the principle: a post-debut portal level "must declare its own lesson/obligation". Consistency with the L6/L11 `"exempt"` precedent is a consequence, not the argument.
4. **The witnessable beat survives — via a different measured gate.** Gate (iii) `refusedBeforeEnteredTiles ≥ 1` fires on **4/4** (3 / 5 / 5 / 6 tiles), with **ordered == unordered** on 4/4, so ADR-design-0002's promotion trigger again does not fire and Appendix A3's legs stand. The player still witnesses *refused-first-entered-later*; it is delivered by the ordered reader rather than by all-OFF unsatisfiability. Nothing player-visible is lost by (a).
5. **Searchability, honestly priced.** L15 already cost **132 000 trials for 44 accepts (0.03 %)**. Option (b) would invalidate 0/484 ⇒ a full block restart with **no evidence the class is findable** inside §1's board caps, and — decisively — it would **lengthen** the puzzle rather than **deepen** it: the extra 2 moves are a detour to a switch the player must visit anyway, purchased by deleting the sealed-line construction that gives this block its real escalation. Depth here comes from the portal becoming the *only door* — a change of **kind**. (b) trades that for a change of **move count**.

**The hardening — what (a) does NOT license.** An exemption with no teeth is a shrug, so the grade is published as falsifiable obligations (§6.1.3):

| # | Obligation | Measured L12 / L13 / L14 / L15 |
|---|---|---|
| **G1** | `allOffShortest − par ≥ 1` — the latch must be worth at least one move. Worth 0 ⇒ **inert** ⇒ rejected (validator defect class, dossier §4 `classifyWarnings`) | **2 / 2 / 2 / 2** ✓ |
| **G2** | Every par route presses the switch **and** crosses the door (gate (ii)'s shape: the Aha is "the door opened", not "I walked around") | L12 `parRoutes = 1`, trace `D1>3,2 R2*4,2 R3+5,2 R46,2` — `*` and `+` both present ✓ |
| **G3** | `refusedBeforeEnteredTiles ≥ 1` (ordered) | 3 / 5 / 5 / 6 ✓ |
| **G4** | `DOCUMENTED_LESSONS` carries `switchRequired: "exempt"` — **not `null`** (these boards *do* carry a latch lesson; `null` means "no latch lesson at all", `policy.ts:131`), evidence string naming the measured `allOffShortest − par = 2` and this ADR | integration instruction (§7) |

**What is lost, stated rather than hidden:** gate **(i)** `no-solution-with-switches-off` does **not** hold anywhere in L12–L15, so the Aha #1 *construction* is not re-delivered in this block. That is the intended division of labour — L6–L10 own Aha #1, L11–L15 own Aha #2 — and G2/G3 are what keep the latch from becoming decoration. If a future reviewer wants gate (i) back in a portal block, the currency is a measured candidate where the sealed line and an all-OFF-unsatisfiable latch **coexist** without either becoming redundant; none exists in 484 accepts today.

## 6. VERDICT — per-board, clause by clause, against the law published in §3–§5 above

**Clause set** (all from `docs/level-design.md` §6.1 / §1 / §3 / §4 / §6, as published above — no clause is introduced here):

| # | Clause | Law source |
|---|---|---|
| **C1** | `par` = the unique P1∧P2∧P3 ramp: 4 / 6 / 8 / 10; `par == shortestSolution` | §6.1.1 |
| **C2** | Coverage: `distinctPositions == width × height` | §6.1.1 P4 |
| **C3** | Within-block `D_exec` strictly increasing from L12 | §3.4 / §6.1.1 P2 |
| **C4** | Two-beat dip: `D_exec(L12) < D_exec(L11) = 8.573171` | §6.1.2 |
| **C5** | Block-end clause (frozen, V0.6): `D_exec(L15) > 13.64` | §6 |
| **C6** | §4 acceptance region: `T ≡ 0`, `R ≡ 0`, `deadStates 0`, `noUnrecoverableOk true` | §4 |
| **C7** | Latch grade **G1**: `allOffShortest − par ≥ 1` | §6.1.3 |
| **C8** | Latch grade **G2**: par route presses switch **and** crosses door | §6.1.3 / §3 gate (ii) |
| **C9** | Gate (iii) ordered: `refusedBeforeEnteredTiles ≥ 1`; **and** ordered == unordered (else STOP-and-route) | §3 / ADR-design-0002 |
| **C10** | Gate (iv): `dualPhaseTiles ≥ 1` | §3 gate (iv) |
| **C11** | Mechanics fence: shipped mechanics only, `M ≡ 4`, no schema/`policy.ts` change, validator `errors = 0` | §1 / §5 / dossier L5 |
| **C12** | Board cap `width, height ≤ 7`; legibility within Entry-3 JUDGED facts | §1 / `docs/ui-ux.md` |
| **C13** | `[multi-switch-door]` dormant: 0 warnings | §6.1.4 / §1 |
| **C14** | Portal-load escalation: `portalFree true` on L12 (consolidation) **and `false` on L13–L15** (mandatory channel) | §6.1.2 reason 3 |
| **C15** | Every warning is the permanent-geometry class and under its per-level cap (L12 3 / L13 8 / L14 8 / L15 10) | dossier §4 |

### 6.1 `candidates/l012.json` — **ACCEPT** (the consolidation beat)

| Clause | Measured (solver) | Verdict |
|---|---|---|
| C1 | `par = 4`, `shortestSolution = 4`, `parMatch = true` — equals P1's pinned value exactly | **PASS** |
| C2 | `distinctPositions 21` = 7 × 3 = 21 (100 %) | **PASS** |
| C3 | block ramp start; `D_exec = 8.230769` | **PASS** (see C4) |
| C4 | `8.230769 < 8.573171` (L11), **−0.342402**; par flat at floor 4, so the beat is 100 % `B`-carried (`1.5244 → 1.410256`) | **PASS** — §6.1.2's two-beat law satisfied as derived |
| C6 | `T = 0`, `R = 0`, `deadStates 0`, `noUnrecoverableOk true`; `reachableStates 78`, `maxDepth 11`, `budget 168` | **PASS** |
| C7 | `switchRequired false`; `allOffShortest 6` − `par 4` = **2 ≥ 1**; all-OFF subgraph 39/78, goal reachable | **PASS** |
| C8 | `parRoutes = 1` (`embedRoutes 1`, `embedForced true`), trace `D1>3,2 R2*4,2 R3+5,2 R46,2` — presses `s1` at move 2, crosses `d1` at move 3 | **PASS** |
| C9 | `refusedThenEnteredTiles 3` `[1,0 2,1 5,2]` **==** `refusedBeforeEnteredTiles 3` (identical) ⇒ ordered fires, no divergence | **PASS** |
| C10 | `dualPhaseTiles 19 ≥ 1` | **PASS** |
| C11 | `M = 4` (M0+M1+M3+M2, no new mechanic); validator `ok`, **errors 0** | **PASS** |
| C12 | 7 × 3, both ≤ 7 | **PASS** |
| C13 | `[multi-switch-door]` 0 | **PASS** |
| C14 | `portalFree true (7)` — walk-only still solves in 7, the channel **re-prices** 7 → 4 without being the only door: the correct below-OFFERED grade for a successor beat | **PASS** |
| C15 | **0 warnings** (cap 3) | **PASS** |

Note for the record: `forcedMoveRatio 0.0769` is the block's highest and still low (L13 0.0127, L14 0.0105, L15 0.0000) — not "fake hard" (`docs/level-difficulty.md` §2a diagnostic). `lookaheadDepth 3 = L − 1`, so the saturation property §5.2 records still holds.

### 6.2 `candidates/l013.json` — **ACCEPT** (escalation begins; the channel becomes mandatory)

| Clause | Measured (solver) | Verdict |
|---|---|---|
| C1 | `par = 6` = 4 + 2 (P2 minimal step), `parMatch = true` | **PASS** |
| C2 | `distinctPositions 24` = 6 × 4 = 24 (100 %) | **PASS** |
| C3 | `10.898734 > 8.230769`, **+2.667965** (= Δpar 2 + Δ3B 0.667965) | **PASS** |
| C4 | ramp member, not a dip beat; correctly `> L11 8.573171` and `> L12` | **PASS** |
| C6 | `T = 0`, `R = 0`, `deadStates 0`, `noUnrecoverableOk true`; `reachableStates 79`, `maxDepth 11`, `budget 192` | **PASS** |
| C7 | `allOffShortest 8` − `par 6` = **2**; all-OFF 39/79 reachable | **PASS** |
| C8 | par route `U12,1 L21,1 L3>5,3 U4*5,2 U5+5,1 U65,0` — teleport, then presses `s1`, then crosses `d1` | **PASS** |
| C9 | `refusedThenEnteredTiles 5` `[4,0 4,1 4,2 4,3 5,1]` **==** `refusedBeforeEnteredTiles 5` | **PASS** |
| C10 | `dualPhaseTiles 16 ≥ 1` | **PASS** |
| C11 | `M = 4`; validator `ok`, **errors 0** | **PASS** |
| C12 | 6 × 4, both ≤ 7 | **PASS** |
| C13 | 0 | **PASS** |
| C14 | **`portalFree = false (null)`** — the walk-only world is **UNSATISFIABLE**; the sealed line `x = 4` forces the portal. This is the block's real qualitative escalation | **PASS** |
| C15 | **4 warnings**, all the permanent-geometry class, each naming a wall tile listed in its own entry phase (cap 8) | **PASS** |

**C15 detail (the warning tail is *resolved*, not waved away).** All four tiles are the sealed line, i.e. load-bearing permanent geometry, and the validator's own `NOT PROVEN … carries 1 portal(s) … may still be enterable from a portal landing (manual review / needs the solver)` branch is answered **by the program**: `portalFree = false` (impassable for the walking world) while the same tiles appear in `refusedThenEnteredTiles` (entered, correctly, on the portal route). Solver, not model — `AGENTS.md` §7.

### 6.3 `candidates/l014.json` — **ACCEPT** (same shape, one row taller, geometry re-priced)

| Clause | Measured (solver) | Verdict |
|---|---|---|
| C1 | `par = 8` = 6 + 2, `parMatch = true` | **PASS** |
| C2 | `distinctPositions 28` = 7 × 4 = 28 (100 %) | **PASS** |
| C3 | `12.957895 > 10.898734`, **+2.059161** (= Δpar 2 + Δ3B 0.059161) | **PASS** |
| C5 | `12.957895 < 13.64` — **correct, not a violation**: §6's clause binds the block "by its **end**", so a mid-ramp member below the bound is the sawtooth working, not failing. Recorded explicitly so no reviewer re-flags it | **N/A at L14 — PASS as ramp** |
| C6 | `T = 0`, `R = 0`, `deadStates 0`, `noUnrecoverableOk true`; `reachableStates 95`, `maxDepth 14`, `budget 224` | **PASS** |
| C7 | `allOffShortest 10` − `par 8` = **2**; all-OFF 47/95 | **PASS** |
| C8 | par route `U13,2 U23,1 L32,1 L41,1 L5>6,0 D6*6,1 D7+6,2 D86,3` — channel first, latch, then door | **PASS** |
| C9 | `refusedThenEnteredTiles 5` `[5,0 5,1 5,2 5,3 6,2]` **==** `refusedBeforeEnteredTiles 5` | **PASS** |
| C10 | `dualPhaseTiles 20 ≥ 1` | **PASS** |
| C11 | `M = 4`; validator `ok`, **errors 0** | **PASS** |
| C12 | 7 × 4, both ≤ 7 | **PASS** |
| C13 | 0 | **PASS** |
| C14 | **`portalFree = false (null)`** | **PASS** |
| C15 | **4 warnings**, permanent-geometry class, sealed line `x = 5` (cap 8) | **PASS** |

Design note (accepted, with one observation for L16+): the **shape is stable** L13 → L14 — the escalation is board growth plus route count (`parRoutes 3 → 10`, `embedRoutes 3 → 10`, `embedForced true`), not a new idea. That is correct for a ramp inside one block (§6.1.2 reason 3), but two consecutive members of the same skeleton family is the **upper** limit of what "ramp without a new idea" should mean: L15 already varies the geometry (three-wall sealed line at `x = 3`, portal `activePhase B` — the block's only B-phase channel). L16+ must not open with a third copy of the L13/L14 skeleton; see §6.6 (`l12TemplateFamily` lesson) — plan shapes are the reusable unit, skeletons are disposable.

### 6.4 `candidates/l015.json` — **ACCEPT** (block-end level; the frozen clause FIRES POSITIVE)

| Clause | Measured (solver) | Verdict |
|---|---|---|
| C1 | `par = 10` = 8 + 2, and **exactly the P3 ceiling** — the minimal ramp lands precisely on the published cap, `parMatch = true` | **PASS** |
| C2 | `distinctPositions 35` = 7 × 5 = 35 (100 % — every tile of the board is visited at par 10) | **PASS** |
| C3 | `14.969697 > 12.957895`, **+2.011802** (= Δpar 2 + Δ3B 0.011802) | **PASS** |
| **C5** | **`D_exec(L15) = 14.969697 > 13.64` ⇒ +1.329697**, and **`> 13.642857`** (L10's measured peak) ⇒ +1.326840. The frozen §6 clause is **DISCHARGED**, and the sawtooth closes **above the previous block's peak**, not merely at the published bound | **PASS — first positive/escalation-direction firing** |
| C6 | `T = 0`, `R = 0`, `deadStates 0`, `noUnrecoverableOk true`; `reachableStates 99`, `maxDepth 15`, `budget 280` | **PASS** |
| C7 | `allOffShortest 12` − `par 10` = **2**; all-OFF 49/99 | **PASS** |
| C8 | par route `U12,3 U22,2 U32,1 U42,0 L51,0 L6>5,0 D7*5,1 D85,2 D9+5,3 D105,4` | **PASS** |
| C9 | `refusedThenEnteredTiles 6` `[3,0 3,1 3,2 3,3 3,4 5,3]` **==** `refusedBeforeEnteredTiles 6` | **PASS** |
| C10 | `dualPhaseTiles 15 ≥ 1` | **PASS** |
| C11 | `M = 4`; validator `ok`, **errors 0** | **PASS** |
| C12 | 7 × 5, both ≤ 7 | **PASS** |
| C13 | 0 | **PASS** |
| C14 | **`portalFree = false (null)`** — and this is the block's only **`activePhase B`** channel (`p1 (0,0) ⇄ (5,0)`), so the tail varies the portal's phase, not just its position | **PASS** |
| C15 | **5 warnings**, permanent-geometry class, three-wall sealed line `x = 3` (cap 10) | **PASS** |

**Filtered, never fitted — the evidence that C5 was a gate and not a target:** L15's own rejection histogram carries **122 `block-floor` rejections** (candidates that solved but sat at/below 13.64) out of **132 000 trials for 44 accepts (0.03 %)**. `forcedMoveRatio = 0.0000` — the hardest level in the block is also its least "fake hard". `parRoutes 15` / `embedRoutes 15` / `embedForced true` — the widest route set in the block, so the tail is hard by **plan count**, not by padding.

### 6.5 THE BLOCK AS A SET — **ACCEPT**

| Clause | Measured | Verdict |
|---|---|---|
| C1 | `4 / 6 / 8 / 10` = the unique P1∧P2∧P3∧4-member ramp; `parMatch true` 4/4 | **PASS** |
| C2 | Coverage 100 % on 4/4 (21/21, 24/24, 28/28, 35/35) | **PASS** |
| C3 | `8.230769 < 10.898734 < 12.957895 < 14.969697` — strictly increasing from L12, three consecutive ramp steps | **PASS** |
| C4 | Two-beat dip `8.573171 → 8.230769`, then ramp from the third member — **isomorphic to the shipped L6 block** (`8.86 → 7.75 → 10.50 → 12.14 → 13.64`) | **PASS** |
| C5 | Tail clears 13.64 **and** 13.642857 ⇒ §6's frozen prediction is now **fully discharged on both of its parts** (L11 debut clause at GD-010, block-end clause here) | **PASS** |
| C6 | `T ≡ R ≡ 0`, `deadStates 0`, `noUnrecoverableOk true` on **4/4** — the §4 region holds, so `D_exec = L + 3·B` is valid for every row above and `w3`/`w4` remain inert | **PASS** |
| C7–C8 | `allOffShortest − par = 2` on 4/4; switch pressed and door crossed on the par route 4/4 | **PASS** |
| C9 | Ordered reader fires 4/4 (3/5/5/6) and **ordered == unordered on 4/4** ⇒ ADR-design-0002's promotion trigger **does not fire**; Appendix A3's unordered legs stand. Recorded, not re-litigated | **PASS** |
| C10 | `dualPhaseTiles ≥ 1` on 4/4 (19/16/20/15) — gate (iv) satisfiable throughout the portal block, as §3 scheduled | **PASS** |
| C11 | `M ≡ 4` on 4/4 — **all** of the block's movement is execution (`L` 4→10, `B` 1.410256→1.656566), none is comprehension tax; no new mechanic, no schema change, no `policy.ts` edit, validator `errors 0` 4/4 | **PASS** |
| C12 | 7×3 / 6×4 / 7×4 / 7×5 — all inside §1's hard cap; no 8-row board, so no Orchestrator R-L2 exception was needed | **PASS** |
| C13 | `13 warnings (0 multi-switch-door)` — the L6–L35 rule is not merely respected, never triggered | **PASS** |
| C14 | The block's teaching escalation is **qualitative and measured**: `portalFree` true → false → false → false. The portal goes from *re-pricing the route* (L12, 7 → 4) to *being the only door* (L13–L15, walk-only UNSATISFIABLE). This is the honest content of "the ramp is not just numbers" | **PASS** |
| C15 | 13/13 warnings are the permanent-geometry class, each with its solver-side answer quoted (dossier §4); per-level caps 3/8/8/10 respected by 0/4/4/5 | **PASS** |
| — | **No candidate JSON was edited by GD; no engine code was edited by anyone.** 484 accepts across 315 566 trials, all rejection keys recorded unrepaired (ADR-0004) | **PASS** |

**Total-axis reading (same honesty discipline as §6's L6/L11 rows):** `D` runs `28.573171 (L11) → 28.230769 → 30.898734 → 32.957895 → 34.969697`. Because `M ≡ 4` is constant, the total axis moves only where execution moves — no weight was tuned and no threshold was moved anywhere in this block.

**Residual observation, not a defect:** the block's `B` sits at `1.410256 / 1.632911 / 1.652632 / 1.656566` — the tail is close to the **top** of the measured band [1.2500, 1.6875], and `par(L15) = 10` is exactly the P3 ceiling. So L15 saturates **both** published limits at once. That is the honest signal for L16+: the next block cannot escalate by pushing this block's two knobs further, which is why §6.1.1's forward consequence publishes `par(L16) ≥ 10` as **necessary** and `≥ 12` as **sufficient for any `B` in the band** (a par-10 L16 would need `B > 1.656566`, i.e. above L15's own). Escalation from L16 must come from **plan structure** (multi-door, chained/timed switches, 2-step lookahead — §5's L16–L25 intent), not from a longer route on a capped board.

### 6.6 Standing points ruled

**OQ-4 · `[multi-switch-door]` stays DORMANT for this block — CONFIRMED (LV-009-A's own proposal accepted, not overruled).** Three reasons, in order of force: (1) **required, not merely permitted** — §6's construction floor says *single-concept (one new mechanic unit)*, and a two-switch door would add a state-space dimension (the XOR composition pinned in §1) to the first block in which the portal is already mandatory; (2) §1's authoring rule reserves XOR doors for **L36+** with a review flag, so using one at L12–L15 would be a *schedule* change needing its own ruling (§3.4's last bullet); (3) it is moot on the evidence — **0/4** candidates carry the warning, so the flag was never exercised and never had to be presented as a design risk. If a later round wants the XOR door, that round's dossier must present the flag as a named design risk (OQ-4's own condition, accepted).

**OQ-5 · Prettier — not design-owned; recorded, no ruling.** `format:check` is not in `.github/workflows/ci.yml`, the 11 shipped `src/levels/*.json` are flagged identically, and LV-009-A deliberately kept the candidates **byte-compatible with the shipped style** so integration is a byte-copy (dossier §6.1). Design view: **do not reformat now** — reformatting would break the byte-copy property and touch 11 shipped files for zero design gain. Any house-wide pass is Orchestrator / Docs + GitHub territory, in one atomic commit, after the block lands.

**The `l12TemplateFamily` 0/512 artifact — what it teaches for L16+ authoring (one paragraph, no ceremony).** 512 hand-enumerated candidates on the debut's own 7 × 3 skeleton produced **0 accepts**, recorded not repaired. The lesson is that a shipped debut board is **not a template — it is a one-off fit**: L11 was filtered from 54 candidates to 1 accept, and that single accept's geometry is jointly tuned to *its own* lesson (`par 4` ∧ below-OFFERED ∧ no false routes ∧ one opposite-colour pair ∧ a specific refusal reader). Re-using the skeleton re-uses the geometry while the new board must satisfy a **new** lesson, so the conjunction collapses — exactly what `policy.ts:246` warns about, now measured rather than asserted. The reusable unit across a block is the **ordered plan shape** (what the player must realize, and in what order), never the board: L12's 351 accepts came from `funnelFamily` — the same plan shape (channel → latch → door) on a **different** skeleton. **Instruction for L16–L25 authoring: enumerate plan shapes and search skeletons under each; never clone a shipped board and perturb it.** And the honest scope of the artifact: 0/512 is a measurement **about that family**, not evidence the block was unauthorable — the same block found 484 accepts the moment the skeleton was released.

## 7. Options considered (the exits this ADR rejected, and why)

- **Q1 — adopt 4/6/8/10 by approval alone.** REJECTED. It would produce the same four numbers with none of the guarantee: a future block could be "approved" to anything, and the anti-post-hoc property (the whole reason the L11 law was trusted) would be lost. The uniqueness proof is what makes the numbers law rather than precedent.
- **Q1 — publish `D_exec` bands for L12–L15 instead.** REJECTED on §3.5's own reasoning (provisional weights ⇒ unfitted by construction; §3.1's withdrawn-band record exists to prevent this).
- **Q2 — single-beat dip (re-author L12 above L11).** REJECTED. Costs one board, buys a steeper ramp the block-end clause does not require, and removes the only rest beat before the mandatory-channel step — comprehension sold for depth against §1's priority order.
- **Q2 — a three-beat dip.** REJECTED, and not merely unneeded: §6's construction floor says "the debut **and its successor**" (two), the shipped L6 precedent is two, and a third beat at par ≤ 4 would strand the block with only two ramp levels to clear 13.64 — which the P2/P3 arithmetic shows is not reachable from par 4 (`4 + 2·2 = 8` ⇒ `D_exec ≈ 8 + 3·B ≤ 13.06 < 13.64`).
- **Q3 — option (b), pre-register a `switchRequired` filter.** REJECTED on measurement (invalidates **0/484** ⇒ full block restart, at a search cost already at 132 000 trials for L15) and on design (it **lengthens** the puzzle rather than deepening it, and it would delete the sealed-line construction that carries this block's real escalation). Recorded honestly rather than argued away.
- **Q3 — accept (a) with no hardening.** REJECTED. An unteethed exemption invites exactly the "the latch is decoration" drift G1 exists to catch: a board where `allOffShortest == par` makes the switch **inert**, which is a validator defect class, not a grade.

## 8. Handoff — LV-009-B integration (numbers to encode, in order)

**GD edits no code.** The integrator encodes the following, in this order, in the L11-seam style LV-008 used (`policy.ts:599/613`):

1. **Law constants FIRST** (so the gates exist before the data lands): P1 block par floor `4`; P2 within-block step `≥ 2`; P3 teaching-span ceiling `10`; the derived L12–L15 expectation `[4, 6, 8, 10]`; P4 coverage `distinctPositions == width × height`; **G1** `allOffShortest − par ≥ 1`. **Do not re-purpose** `PORTAL_DEBUT_PAR_CAP` / `PORTAL_DEBUT_EXEC_BUDGET` — those stay **L11 debut-only**.
2. **Dataset:** byte-copy `candidates/l012…l015.json` → `src/levels/`. **Never edit a candidate JSON.**
3. **`DOCUMENTED_LESSONS`:** four rows (L12–L15) carrying the block's **own** lesson/obligation (consolidation → mandatory channel), `switchRequired: "exempt"` (**not `null`**, per G4), evidence string naming `allOffShortest − par = 2` and this ADR.
4. **Pins / mirror / sidecar:** `EXPECTED_LEVEL_COUNT` 11 → 15; four hand-typed `PINS` rows; `npm run levels` then `solve-levels.ts --report` (**shipped levels only — never `--report` against `candidates/`**); §5.2's four mirror rows by hand.
5. **Pre-registered acceptance law — enforce BEFORE merge, all machine-checked:** 15/15 validator `ok`, `errors 0`, warnings 28 (+13, all permanent-geometry); 15/15 solver PASS with **only** the pre-existing `l008` `dual-phase-tiles` escalation; `par == shortestSolution` 4/4; `D_exec` equal to 6 dp — **8.230769 / 10.898734 / 12.957895 / 14.969697**; `T ≡ R ≡ 0`, `deadStates 0`, `noUnrecoverableOk true` 4/4; `dualPhaseTiles ≥ 1` 4/4; `refusedBeforeEnteredTiles ≥ 1` 4/4; `portalFree true` on L12 **and `false` on L13–L15**; `allOffShortest − par == 2` 4/4 (**reject if `< 1`**); coverage P4 4/4; `D_exec(l015) > 13.64`.
   **STOP-and-route clause:** if ordered and unordered refusal readers **diverge** on any of the four, do **not** merge — route to ADR-design-0002's pre-specified re-opener (a measured divergent candidate is the only currency that re-opens it).
6. **Registry LAST, R-003-gated** (Gameplay Engineer + UI/Art): `LEVEL_SOURCES` explicit imports, the door × portal painter seam, and the **UA capture-entry round** before any of the four is registered as playable. Design-side legibility requirement from the Entry-3 JUDGED facts (`docs/ui-ux.md`: 51–65 px classes proven, board-width discipline): **the sealed line must read as a wall column and the portal ends must read as a pair.** From L13 the channel is the *only* door, so an illegible channel makes L13–L15 unwinnable-by-comprehension, not merely unclear (`src/levels/README.md` §4 R-003: "a board whose channel is invisible teaches nothing").
7. **ASSET GATE untouched** — no art was requested or needed for this round.

## 9. Consequences

- (+) The block's numbers are law **before** integration, so the four boards are measured against published numbers and the anti-post-hoc guarantee that made the L11 clause credible extends to L12–L15.
- (+) §6's frozen falsifiable prediction is now **fully discharged on both parts**, including the first **escalation-direction** firing (14.969697 > 13.642857). The dip law has survived both of the schedule's `ΔM > 0` seams and one block tail.
- (+) The par law generalizes: floor ∩ step ∩ ceiling ∩ coverage is a **shape**, not four numbers, and it publishes L16+'s forced bounds (`par ≥ 10` necessary, `≥ 12` sufficient) without inventing a band.
- (+) The latch grade is a **sentence a reviewer can quote** plus four checkable obligations, instead of an unexplained `false` in a solver dump.
- (−) L15 saturates **both** published limits (par at the P3 ceiling 10, `B` at 1.656566 near the band top). L16+ cannot escalate on those two knobs; it must escalate on plan structure. Named here so the next block's author does not discover it as a dead end.
- (−) The two-beat dip's **felt** half remains an unmeasured hypothesis (§6.1.2, PA handoff). GD-011 rules on construction only; if playtest shows no consolidation benefit at L12, the ruling is re-opened on that data — not on taste.
- (−) P2's monotonicity guarantee holds only while `B` stays inside [1.2500, 1.6875]. The self-correcting guard is published in §6.1.1: an out-of-band `B` is a **named finding**, never a silent widening of the band.
- (−) Gate **(i)** `no-solution-with-switches-off` does not hold anywhere in L12–L15. Intended (Aha #1 belongs to L6–L10), but it means the latch's *existence*-grade is untested in this block — G1/G2/G3 are the substitute teeth, and they are par-grade teeth only.
- (→) Files changed by GD-011: `docs/level-design.md` (V0.9, new §6.1 + change-log row + governing-docs line) and this ADR. **Nothing else.** No code, no tests, no candidate JSON, no other-lane document.
