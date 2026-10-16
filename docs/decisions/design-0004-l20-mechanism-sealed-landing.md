# ADR-design-0004 — The L20 mechanism is the SEALED LANDING; the GAUNTLET is rejected on census measurement

- **Status:** ADOPTED (design ruling). Requires Orchestrator approval per AGENTS.md §4.
- **Date:** 2026-10-16
- **Decider:** Game Designer (Agent 1, task GD-007)
- **Owns:** `docs/game-design.md`, `docs/level-design.md` (§6.2), this record
- **Governs:** the L20 rung of the L16+ ladder; the block law `BLOCK_L1619_*` / `block-l1619-tail-ceiling`
- **Schedule refs:** `docs/game-design.md` §5 (mechanics library), §8 (rhythm), §9 (teaching plan); `docs/level-design.md` §5, §6, §6.1
- **Evidence refs:** `docs/project-status.md` item 86 (a), item 90 (a); `docs/ai-native-pipeline.md` §8.12 V1.5, §8.13; `src/levels/l019.json`; `docs/level-difficulty.md` §5.2

---

## Context — the door the census closed

L16–L19 are the **goal-gated full seal**: every neighbour of the goal is a door, each door targeted by one switch, and the all-switches-OFF world is unsatisfiable (existence, measured, not decreed — R-003c). The device's ceiling was **censused exhaustively**, not sampled:

- `7×6`, arity 2 → `par 16`; arity 3 → `18`; arity 4 (L19's own board geometry) — **17 160 tuples enumerated COMPLETELY**: `par census 12:10230 14:6450 16:446 18:34`. **18 is the family's ceiling.**
- `7×7` reaches `par 22` only by re-running L19's **exact seal shape** at the **same bare `par 12`** — extra moves are press-detour length on an already-taught shape. **Refused as an escalation** (a re-lengthened walk).
- The block law `block-l1619-tail-ceiling` enforces the stop as an **equality**: widening the terminal number *instead of* building a new mechanism is exactly what that gate forbids.

R-003c therefore registered the four rungs that exist and **fabricated no fifth**, with the explicit clause *"5-rung waits for a real L20 mechanism, not a padded one"* (`docs/project-status.md` item 86). Two constructions were named for the next lane and **neither was built**:

| | Candidate | Shape |
|---|---|---|
| **(A)** | **GAUNTLET** | every approach to the goal's **ring** itself behind a door (≥ 6 doors on a 7×6 ring) |
| **(B)** | **SEALED LANDING** | a portal lands the player into a **pocket** whose only exit is a door → the ordered `land → press → leave → press` chain (the still-undelivered "2-step lookahead" of `docs/level-design.md` §5) |

Constraints inherited and non-negotiable: deterministic puzzles only; **no new core rule** (the locked loop `one move ⇒ one phase flip`, no switch button); YAGNI — existing vocabulary only (phase walls, doors, switches, portals); the **F-L19-2 doctrine** — a far-region phase wall makes its tile unstandable and the 42/42 coverage gate then fails, so **every blocker in this device must be an openable door**.

---

## Original Hypothesis → Problem → Change → Evidence → Result

**Original Hypothesis.** The L20 rung could be earned by escalating the *quantity* of blockers on the goal ring — the **gauntlet**: put every approach to the goal's ring behind a door (≥ 6 doors), so the player must open doors even to reach the tiles from which the goal is approachable, forcing more presses and a longer plan ("the path INTO the key is itself gated" is a new read).

**Problem.** The census identity refutes the hypothesis as stated. With a full seal:

```
par = min_i ( d(start→s_i) + 1 + d(s_i→goal) )      [ai-native-pipeline §8.12 V1.5]
```

because **every seal tile is directly adjacent to the free far region**, so the shortest plan opens exactly **one** door. Adding more ring doors adds terms to that **minimum** — a monotone non-increasing operation. A gauntlet therefore **cannot raise par** at equal board area; it can only keep or **lower** it, while adding ≥ 6 doors + ≥ 6 switches (≥ 12 objects on 42 tiles read at the R-L2 44 px touch floor). The measured saturation confirms it: arity 2 → 16, arity 3 → 18, arity 4 → 18. The idea buys reading cost and no decision cost. The charitable re-reading of the gauntlet ("the switch path is itself gated") *does* force a second press — but that verb is **press order**, which is exactly what the sealed landing delivers, with less area and more legibility (one visible portal→pocket→door story instead of a dependency graph inferred from a wall of identical door art, against `docs/game-design.md` §9 "the board is the teacher").

**Change.** L20's device is the **SEALED LANDING**, published as law in `docs/level-design.md` §6.2 (lattice constraints, teaching beat, `par 20`, difficulty obligations, five new named gates). The **GAUNTLET is rejected**. The L16+ block becomes **L16–L20 (5 rungs)**; `block-l1619-tail-ceiling` moves to the newly measured L20 `D_exec` **only after** the mechanism is proven — never before.

**Evidence.**
1. Census (exhaustive): arity-4 `7×6` = 17 160 tuples, ceiling `par 18`; `7×7` `par 22` only by re-stamping L19's seal. `docs/project-status.md` item 86(a); `docs/ai-native-pipeline.md` §8.12 V1.5, §8.13.
2. The structural identity `par = min_i(d(start→s_i)+1+d(s_i→goal))` and its cause ("every seal tile is directly adjacent to the free far region") — `docs/ai-native-pipeline.md` §8.12 V1.5.
3. The law that forbids the cheap path: `block-l1619-tail-ceiling` as an equality; R-003c's "no padded fifth rung" clause — item 86(a), item 90(a).
4. The un-delivered promise: `docs/level-design.md` §5 (L16–L25, "2-step lookahead"), `docs/game-design.md` §8 (same row, unchanged since GD-007 V0.5).
5. The constraint set: F-L19-2 (blockers must be doors); ADR-0009 (opposite-colour portals, `ΔM` schedule); ADR-0008 clause 3 (portal landing = embedded state); `par = l15Par + 2·(id − 15)` rung pin.
6. Arithmetic of the obligation: inside the acceptance region `D_exec = par + 3·B`; with `par = 20` and `B ∈ [1.2500, 1.6875]`, `D_exec ∈ [23.7500, 25.0625] > 22.885157`, min margin **+0.864843** — `docs/level-difficulty.md` §5.2 band, `docs/level-design.md` §6.

**Result.** Ruling shipped in `docs/level-design.md` §6.2 (V1.0) and `docs/game-design.md` (Aha #3 pointer). The level lane now has a **buildable, bounded, enumerable** target for the fifth rung with named gates; the block law's terminal may move once — and only once — a par-20 sealed-landing board is Solver-proven. **No core rule, weight, gate threshold or shipped board was changed by this ADR.**

---

## Decision

1. **ADOPT** the **SEALED LANDING** as the L20 device. Priority-law order (AGENTS.md §1): Fun (mandatory second press vs. a minimum that cannot escalate) > Player Comprehension (one visible cause vs. clutter-inferred dependency) > Puzzle Depth (ORDER as a new dimension vs. COUNT on a saturated axis) > Level Scalability (bounded enumerable lattice vs. an unmeasured ≥ 6-door family) > Determinism / Testability / Cost (shipped semantics only, cheap mechanical gates).
2. **REJECT** the **GAUNTLET** on the census identity. Its only defensible verb collapses into the sealed landing's verb, delivered worse.
3. **`ΔM(L20) = 0`.** The sealed landing is a new **verb** over already-taught mechanics — no new mechanic unit — so the §6 dip law (`ΔM > 0` seams only) does **not** fire and the strict-rise rung law is not contradicted. The mechanism is a **composition**, not a mechanic.
4. **Lattice constraints** (law): one opposite-colour portal pair; the landing end resolves into a pocket **not on-foot reachable** in the needed phase; the pocket's **only exit is a door** (no phase-wall exit); an ordered **≥ 2-press** shortest plan with the second switch gated behind the first door — i.e. the census identity is **broken by construction**; `par(L20) = 20` exactly; `T ≡ R ≡ 0`; P4 coverage 42/42.
5. **Teaching beat:** zero text; portal pair and pocket door visible from the start; the board shows the story; **Aha #3** = *"传送门没有抄近路，它给我换了一个起点。"*
6. **Difficulty obligations:** `par = 20` exactly; `D_exec > 22.885157` (automatic at `par 20` + in-band `B`; the lane selects in-band `B` and does **not** compound `l016`'s named 1.7000 excursion, F-L16-2); the block becomes **L16–L20** with the tail-ceiling re-registered **after** proof.
7. **New gates:** (g1) pocket not on-foot reachable in the needed phase; (g2) pocket's only exit is a door; (g3) ordered ≥ 2-press plan with the second switch gated behind the first door; (g4) `switchRequired` measured (all-OFF unsatisfiable); (g5) the census identity is broken (≥ 1 seal tile not adjacent to the free far region). One negative control per new gate (§8.12 F-L16-3 discipline: expectations corrected **to measured names**; a mutation that is ACCEPTED still fails the battery).
8. **Named comprehension risks** (labelled hypotheses, PA-owned): *"the pocket reads as a trap"* — measure M5 restarts and M6 undos on L20 vs L19; *"wrong arrived phase"* — the pocket's pressable object must be pressable in the likely arrival phase, or both phases must present a legal action.

## Consequences

- **Positive.** The rung ladder can resume above 22.885157 on a *mechanism*, not a padded number; the L16–L25 "2-step lookahead" promise is finally delivered; the lesson is a genuinely new verb (order) over shipped vocabulary; the proving machinery is reused (`prove-candidate.ts`, the block battery, a new `--stage` lattice like `--stage=f`).
- **Negative / cost.** One new lattice stage and five new gate classes must be authored and negative-controlled by the level lane; a portal appears in the L16–L25 latch-fluency block (acceptable — M2 ships from L11 and §5 already promises the lookahead there).
- **Risk register entries.** The two named comprehension risks above; and the *ordering trap* — moving `block-l1619-tail-ceiling` before the L20 proof would be the refit the gate exists to forbid, so the sequence is law.
- **Not changed.** Locked core loop; `M` schedule; weights; the frozen cut (`L1–L15 = 14.969697`); the registered L16–L19 bytes; any shipped board; the dip law's text.
- **Follow-ups (level lane).** `R-003?-next` must census the sealed-landing lattice, prove a `par-20` accept at 42/42 with in-band `B`, extend the block to L16–L20, re-register the tail-ceiling, and land g1–g5 with one negative control each. Registry/`EXPECTED_LEVEL_COUNT`/sidecar remain the level lane's.