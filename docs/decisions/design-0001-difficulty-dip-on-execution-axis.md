# ADR-design-0001 — The difficulty dip law moves to the execution axis (`D_exec = D − w5·M`)

- **Status:** Accepted — Game Designer ruling (task GD-008); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-15
- **Deciders:** Agent 1 (Game Designer). Triggered by LV-007B's measured falsification of the V0.5 dip clause; the playtest backstop is named as a handoff to the Playtest Analyst, not performed here. No core-rule change occurs in this ADR (the locked rule, AGENTS.md §2, is untouched; this is a difficulty-law ruling).
- **References:** `docs/level-design.md` §6 (V0.6, the rewritten law); `docs/level-difficulty.md` §2a/§5.2 (the measurement); `docs/game-design.md` §8/§11 (synced); ADR-0004 (Solver proves); ADR-0009 (mechanic schedule: the only introduction seams are L6 and L11); `docs/ai-native-pipeline.md` §8.5 (OQ4: L6's `switchRequired`-exempt dip row).

## Context

`docs/level-design.md` V0.5 §6 carried the clause: *every block that introduces a new mechanic starts with a dip — its first level sits 2–3 points below the previous block's peak on `D`* — labelled a **design target** because `D` was not yet computable. LV-007B closed the measurement gap and reported, without tuning a single weight:

- `D` is measured on the shipped L1–L10 under the provisional weights `w1…w5 = 1, 3, 4, 2, 5`: 14.00 / 15.06 / 15.29 / 15.58 / 15.33 / 23.86 / 22.75 / 25.50 / 27.14 / 28.64 (`docs/level-difficulty.md` §5.2, test-pinned).
- The L5→L6 seam — the first mechanic-introduction seam — measures **+8.53 on `D`** (exact decomposition: ΔL = −2, ΔB = +0.53, ΔM = +10, ΔT = ΔR = 0), where the clause demanded −2…−3. The target is missed with the sign inverted.
- The miss is **unreachable-by-construction**, not bad authoring: a mechanic debut adds `w5·ΔM` (+10 at L6) in the very step where the dip must lower the score, while par is already at the game floor (4) and `B` does not fall.
- Inside the §4 acceptance region, `T ≡ R ≡ 0` is a **measured theorem** (the no-dead-state invariant forbids exactly what those terms price), so `D = L + 3·B + 5·M` for every shippable level and `w3`/`w4` are inert.

The integrity constraint on this ruling (AGENTS.md §7): **no reverse-engineering the weights to make the target number come out** — a metric re-tuned to flatter the curve is an echo chamber, not a measurement.

## Rule-change record (required format)

- **Original Hypothesis (level-design.md V0.3–V0.5 §6):** the teaching valley at a mechanic debut is expressible as a 2–3 point drop on the single scalar `D` below the previous block's peak.
- **Problem:** the hypothesis is falsified by measurement and provably unsatisfiable at the debut step: `D` prices comprehension load (`w5·M`) and execution load in one sum, and a debut *must* raise the former in exactly the move where the law asked the sum to fall.
- **Change:** the dip law is re-anchored from raw `D` to the **execution axis** `D_exec = D − w5·M = w1·L + w2·B + w3·T + w4·R` (= `L + 3·B` inside the acceptance region). New seam law: a debut level's `D_exec` sits **strictly below the previous block's `D_exec` peak** (equivalent budget form: `D(debut) − D(previous block peak) < w5·ΔM` — the entire `D` rise at a debut is comprehension tax, never execution). The "2–3 points" margin is **withdrawn unfitted** (no principle independent of the target number ever derived it; the measured `D_exec` span of all ten shipped levels is only ≈ 5.9 points); the measured margin (−1.47 at L5→L6) stands as the calibration anchor. Construction floor (par ≤ 4, single-concept, no false routes, below-OFFERED teaching grade with the L6 `switchRequired = false` concession pattern) and the rejection teeth are unchanged. The felt half of the valley is assigned to playtest as a labelled hypothesis (Playtest Analyst handoff). **No weight is changed.**
- **Evidence:** `docs/level-difficulty.md` §5.2 (program-generated, test-pinned); the recomputed `D_exec` curve published in `docs/level-design.md` §6 — every value derivable as `D − 5·M` from the pinned §5.2 rows, cross-checked as `L + 3·B` (acceptance region), no new numbers introduced; the unreachable-by-construction decomposition (§5.2).
- **Result:** `docs/level-design.md` V0.6 §6 rewritten; `docs/game-design.md` V0.6 §8/§11 synced; the falsifiable L11 prediction published **before** any portal candidate is authored (`D_exec(L11) < 13.64`, par ≤ 4); design target and measurement agree on the L5→L6 seam for the first time — dip **−1.47 on `D_exec`**, step **+8.53 on `D`**, both printed, neither hidden.

## Options considered (the four legal exits)

- **(a) Change the measurement (mechanic-cost-normalized `D`) — ADOPTED, as a decomposition, not a re-definition.** `D` keeps its formula, its provisional weights and its per-level published values; `D_exec` is a named component of it (`D − w5·M`), costless to recompute because every stored `D` row echoes its weight vector. This is not "re-wording a definition to make the curve look right": the split is the semantic content the dip law always had (execution must fall so comprehension has room), and both components remain published.
- **(b) Re-axis the dip target to player experience — ADOPTED as the felt-half clause, REJECTED as the primary gate.** The player-perceivable valley (fewer moves, few effective choices, no punishable mistakes, mechanic shown before demanded) is stated in §6 with its measurers named: Solver for the generation-time half, Playtest Analyst for the felt half (first-win time, M5 restarts, M6 undos, M4 refusals, debut vs previous block-close). But an experience-only law cannot reject a candidate at generation time — the teeth need the `D_exec` number.
- **(c) Abolish the numeric law, keep a qualitative valley — REJECTED.** A purely qualitative valley cannot reject a level and cannot be tested by L11–L20 data; its structural content (within-block ramp, sawtooth, never a staircase) survives *inside* the law rather than replacing it.
- **(d) Re-weight `w1…w5` — REJECTED, for now.** The only legitimate source of new weights is regression against playtest data (`docs/level-difficulty.md` §4); no such data exists today, and choosing `w5` so that the dip becomes reachable would be fitting the metric to the target — exactly the AGENTS.md §7 violation this ruling exists to avoid. (Also considered and declined: adopting the weightless `lookaheadDepth` diagnostic as `T` — it saturates at `L − 1` on all ten shipped levels and differentiates nothing, §5.2.)

## Consequences

- (+) The dip law is no longer a falsified target: it is a measured, sign-only, falsifiable law on an axis whose recomputation needs no new solver machinery.
- (+) The +8.53 `D` step at L6 stops being a scandal and becomes the published price of learning: `D_learn = +10` comprehension tax, partly offset by the measured execution dip −1.47. The total-load step is admitted openly instead of being defined away.
- (+) L11 gets a pre-registered acceptance number before any portal candidate exists — post-hoc fitting is impossible by construction.
- (−) `D_exec` is a derived reading, not a solver output field; if Level AI + Solver later resolves the persist-or-not OPEN_QUESTION (`docs/level-difficulty.md` §5) toward persistence, adding a `D_exec` column to the report would spare every reader the subtraction — a convenience ticket, not a blocker.
- (−) The felt-half valley claim is a **hypothesis** until the Playtest Analyst runs the debut-friction clause (thresholds frozen before the cohort, T6 discipline); §6 labels it as such. It joins the re-based Stage-2 set (a′/b/c′/d′), it does not replace any of them.
- (−) `docs/level-difficulty.md` §3's target-curve table still carries the pre-ADR-0009 schedule (Phase Door at L21, Phase Portal at L36) and absolute `D` bands that predate measurement — that file is Level AI + Solver's; flagged here for LV's next reconciliation, deliberately not edited by GD.
