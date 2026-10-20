# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V1.9** *(rider fold-in, 2026-10-20: this label still read **V1.6** while the change log had run to **V1.7/V1.8** — GD-014c's named cosmetic residue, corrected here by the label's owner, no law text touched; **V1.8 is GD-015 — §7.10.11 the `L56–L60` ladder at `ℓ = 4` (B1–B7 applied, B6's no-fallback reading, the B7-vs-batch-3 named conditional), §7.10.12 the `L55→L56` `batch-seam` relief as register instance 8 — the register's first COMPARATOR-FREE bound, §7.10.13 the ACT-MAX RANK ruling for Act III + the plateau-top arithmetic + the `L56–L60` XOR pacing**; **V1.9 is GD-016 — new §7.11: the Act IV band (derived-exact), the `L61–L65` opener rule, the reservation's Act IV scope (`L61–L70`, `par ≤ 30`), the `L60→L61` `act-open` relief pre-published as register instance 9 — the register's first comparator-free ACT-OPEN bound — plus the Act IV interior-batch ladder DEFERRED to GD-017; ruling only — no code, no constant, no board**) *(V1.2 was GD-010 — §7.3.1–§7.3.4 + §7.8, the sawtooth ruling on Act II batch 2; V1.3 is GD-011 — §7.9 the band-endpoint law, §7.8 item 7 the C-path standing, §7.3.1 instance 3; V1.4 is GD-012 — §7.10 the Act III band + the L41–L45 opener rule + Act III par/star totality + the Act II→III seam relief, which V1.4b renumbers **instance 5**; **V1.4b is GD-012b — the relief register's numbering corrigendum: `L35→L36` is instance 4 by seam order, the `L40→L41` act-open renumbers to instance 5, no label text changed**; **V1.5 is GD-013 — §7.10.6 the Act III INTERIOR-BATCH rule B1–B7 (the anchor-advance ladder, `par 27` refused, the O3 reservation's scope over `L41–L50`), §7.10.7 the `L45→L46` `batch-seam` relief corrected into the register as instance 6 with the register-wide relief-admissibility test, both pre-published before any `L46–L50` census**; **V1.6 is GD-014 — §7.10.8 the XOR multi-switch door DEVICE RULING (option (a) DERIVABLE: `g6`'s covering derivation is multiplicity-blind, no second derivation is owed; the `H`/XOR composition is no new schema/core/validator contract — but it owes the `G2-X` effective-press reader, because the shipped press-then-cross readers test `targets` membership and an XOR press can *close* the door it targets) with the comprehension plan, §7.10.9 the `par 28` reservation RELEASED with its arithmetic and the `L51–L55` ladder law `[24,26,28,28,28]`, §7.10.10 the `L50→L51` `batch-seam` relief pre-published as register instance 7 + the register rider and finding F-GD014-1**; **V1.7 is GD-014b — the §7.10.8.2 C2 reader-text CORRIGENDUM (field path fixed; the two measurement-refused sub-clauses replaced by the entry-state + counterfactual instrument, ADR-architecture-0006 §4.2–§4.3 normative, refused original kept in a dated supersession record) and the instance-7 constants re-pinned to the register's PIN-LITERAL form; the GD-014 RULING itself is unchanged**)*
> Date: 2026-10-20
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; mechanic schedule per GATE D / ADR-0009; **100-level act architecture per GD-009 / ADR-design-0005, §7**; **act-close peak + pre-published relief labels per GD-010 / ADR-design-0006, §7.3.1–§7.3.2**; **band endpoints are derived-exact and inclusive per GD-011 / ADR-design-0007, §7.9**; **Act III's band, opener rule, par/star totality and seam relief per GD-012 / ADR-design-0008, §7.10**; **Act III's interior-batch ladder rule and the `L45→L46` `batch-seam` relief instance 6 per GD-013 / ADR-design-0009, §7.10.6–§7.10.7**; **the XOR multi-switch door device ruling, the `par 28` reservation's release + the `L51–L55` ladder law, and the `L50→L51` relief instance 7 per GD-014 / ADR-design-0010, §7.10.8–§7.10.10**; **the `L56–L60` ladder, the `L55→L56` relief instance 8 and the Act III ACT-MAX RANK ruling per GD-015 / ADR-design-0011, §7.10.11–§7.10.13**; **the Act IV band, the `L61–L65` opener rule and the `L60→L61` relief instance 9 per GD-016 / ADR-design-0012, §7.11**)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11, move-depth ruling §14.2), ADR-0002, ADR-0004, **ADR-0008 rules 1–7** (entry-only solidity; clause 8 withdrawn), **ADR-0009** (checkerboard invariant; GATE D mechanics-forward), **ADR-design-0001** (dip law on the execution axis `D_exec`), **ADR-design-0003** (GD-011: the L12–L15 block law — par obligation, two-beat dip, latch grade), **ADR-design-0004** (L20 sealed landing), **ADR-design-0005** (GD-008 stars-not-cap + GD-009 act architecture), **ADR-design-0006** (GD-010 act-close peak clause + pre-published relief-label form), **ADR-design-0007** (GD-011 band-endpoint law + C-path standing), **ADR-design-0010 (GD-014 XOR device ruling + `par 28` release)**, **ADR-design-0011 (GD-015 `L56–L60` ladder + `L55→L56` relief instance 8 + the Act III ACT-MAX RANK rider on §7.3.2)**, **ADR-design-0012 (GD-016 Act IV band + `L61–L65` opener rule + `L60→L61` relief instance 9)**, ADR-architecture-0002 (metric #7 canonicality; gate (iii) ordered reader)

---

## 0. Rules truth box (read before authoring any level)

Under the locked rule (game-design.md §3.1, **ADR-0008 rules 1–7** — Option B, human-approved at GATE C, **corrected by ADR-0009 at GATE D**):

- A move is legal iff the destination is in bounds and non-solid **in the current phase at entry** (a current-phase wall or a door closed in the current phase blocks; everything else passes). Illegal move ⇒ no movement, **no flip**, state unchanged.
- Every legal move flips the phase. There is no waiting and no manual switch — only movement flips the world. The flip may leave the player **standing inside a wall of the new phase**: legal and safe — never crushed, never pushed, never moved. The player steps out on any later move whose destination is non-solid in the then-current phase.
- **The checkerboard invariant (proven law, ADR-0009 — replaces the withdrawn "parity corollary" of ADR-0008 clause 8):** the grid is bipartite and refusals consume no move, so the phase in which a tile can be *entered* is fixed by the tile. With `startPhase = A`: arrival at a tile `c` always happens on a move `n ≡ d(c) (mod 2)` (Manhattan distance from `player`; a detour adds 2 moves, never 1). Hence a `phaseAWalls` tile is enterable **iff `d(c)` is even**, a `phaseBWalls` tile **iff `d(c)` is odd**. Authoring consequences:
  - a parity-**mismatched** phase wall is a **permanent obstacle** — author it as geometry, never as a "timing gate";
  - a parity-**matched** phase wall is **permanent decoration** (passable whenever reached) — its uses are to be *seen* as an echo and, in L4–L5, to be **walked into** (phantom walk);
  - **"refused first, entered later" is unconstructible with M0 — and with M1 doors alone.** A door is itself a phase-conditional entity (red open in A, blue in B); alone it stays static *because* its openness is **derived from the current phase**, and the invariant pins every fixed tile's entry phase — so the derived solidity of each tile is constant. M3's contribution is not "giving the door a switch": it turns a tile's solidity from a function of the current phase into a function of the player's **history**. Any level whose lesson needs that beat must use latch state (M1+M3) or an opposite-colour portal (M2).
- **Where real decisions come from (GATE D / D3):** **M1 doors + M3 switches ship as one unit from L6** — the latch ("the switch I stepped on keeps the door changed") produced real decisions in **142/369 solvable boards** (≈38%; withdrawn old record 74/200, same magnitude). Doors alone are measured static (**0/400**; the earlier 9/200 anomaly is closed as a harness artifact — ADR-0009 Context item 5). **M2 portals from L11** break parity outright — **only when the two ends sit on opposite checkerboard colours** (**200/203 solvable boards decision-bearing, 203/203 dual-phase**; withdrawn old record 80/200 was an underestimate diluted by rejected boards); same-colour pairs are inert and validator-rejected (**0/400 legal**, §1).
- The phase after `n` moves is still fully determined; switches and portals add state bits the Solver hashes (`docs/architecture.md` §6.3), not randomness.
- Win check: standing on the goal at the end of a fully-resolved legal move, regardless of phase. **The goal must be a non-wall in BOTH phases** (validator-enforced, §1).

**OQ-1 — RESOLVED by GATE D / ADR-0009 (2026-10-14, human decision D3).** The original worry (M0-only L1–L20 is a static maze) was *proven*, not fixed: ADR-0008 clause 8's claim that Option B resolves it is **withdrawn** (dated banner on ADR-0008). The accepted resolution is **mechanics forward with the core rule unchanged**: decisions arrive at L6 via the M1+M3 latch and at L11 via opposite-colour portals; M0's L1–L5 carry literacy, refusal, and the phantom walk — honestly, with no dynamism claim. Remaining obligations: (a) **Stage 2 playtest** on the re-based hypotheses (ADR-0009 decision 8: latch readable without text by L8; embedded states read as safe; portals read as space-folding; L1–L5 retain players to L6); (b) **full Solver verification** of every level before acceptance (pars of shipped L1–L5 already BFS-confirmed: 4/5/6/6/6).

## 1. Level JSON schema (field by field)

All levels are data, never scene code (game-design.md §10). Schema validation is mandatory; invalid candidates are **rejected**, never auto-repaired (ADR-0004).

| Field | Type | Req | Meaning / constraints |
|---|---|---|---|
| `id` | int ≥ 1 | ✓ | Unique; equals the level's number in the 50-level progression (L`id`). |
| `width` | int 3–7 | ✓ | Board columns. Hard cap 7 per `docs/ui-ux.md` R-L2 (44 px touch-target floor at a 320 px viewport). **8×8 allowed ONLY with Orchestrator approval**, against the R-L2 conditions (batch accepts the 40 px floor, swipe promoted to primary input); 9×9+ rejected on mobile portrait. |
| `height` | int 3–7 | ✓ | Board rows. Same hard cap 7 and the same Orchestrator-approval condition for 8 rows (ui-ux.md R-L2). |
| `startPhase` | `"A"` \| `"B"` | ✓ | Phase at move 0. Teaching levels always start `"A"`. |
| `player` | `[x, y]` | ✓ | Start tile, 0-indexed from top-left. In bounds; non-wall in **both** phases (clean spawn — the player never starts embedded). |
| `goal` | `[x, y]` | ✓ | Goal tile. **Standing on it after a fully-resolved legal move (post-flip) wins the level, regardless of phase.** A phase-gated goal would need its own schema field + ADR; it is not part of this design. Differs from `player`; **non-wall in BOTH phases — hard validator rule (ADR-0008):** a goal walled in either phase is rejected, so the goal is enterable on both parities and a win never happens from inside a wall. |
| `phaseAWalls` | `[[x, y], …]` | ✓ (may be `[]`) | Tiles solid while Phase A is active (passable echoes during Phase B). Never overlap `player` or `goal`. Overlap with `phaseBWalls` = tile solid in both phases = never enterable; allowed only by deliberate design and flagged in review. |
| `phaseBWalls` | `[[x, y], …]` | ✓ (may be `[]`) | Tiles solid while Phase B is active (passable echoes during Phase A). Same constraints. |
| `doors` | `Door[]` | ✓ (may be `[]`) | **M1**, introduced **L6 — only ever paired with M3** (ADR-0009: doors without switches are measured static). `{ "id": "d1", "color": "red" \| "blue", "tiles": [[x, y], …] }`. Red doors are open in A / closed in B; blue doors the inverse. Openness is recomputed **absolutely** from `(color, current phase, switchesOn)` after every move — never carried incrementally (`docs/architecture.md` §6.2 step 5). |
| `switches` | `Switch[]` | ✓ (may be `[]`) | **M3 (CORE — promoted at GATE D, ADR-0009)**, introduced **L6, paired with M1**. `{ "id": "s1", "tile": [x, y], "activePhase": "A" \| "B", "targets": ["d1", …] }`. Stepping on the tile while `activePhase` is current toggles `switchesOn[id]`; leaving the tile, or entering it in the other phase, does nothing (the **latch**: the change persists). **Multi-switch composition (pinned — RV-002 M-5; matches `src/core/rules` `doorIsOpen`):** a door's openness is its colour base **inverted once per ON switch that lists it in `targets`**; an even number of ON switches targeting the same door restores the colour base. **Authoring rule: each door is targeted by at most one switch in L6–L50** — the multi-switch (XOR) door is an Act III second-half device, **allowed from `L51` under §7.10.8's released device contract** (ruled by GD-014: option (a) DERIVABLE — representation is `targets` multiplicity on this schema, **no field and no validator change**; the validator's `[multi-switch-door]` warning stays a **review flag, never a gate**) and **review-flagged** in the candidates dossier; its `G2-X` effective-press reader must exist **before** its census. *(Ranged corrected at GD-014 for the R-006a finding that this row under-covered `36–40`; the allowance's move to Act III was §7.2's, its release to `L51` is §7.10.8's.)* |
| `portals` | `Portal[]` | ✓ (may be `[]`) | **M2**, introduced **L11**. `{ "id": "p1", "pair": [[x1, y1], [x2, y2]], "activePhase": "A" \| "B" }`. Entering either end while `activePhase` is current teleports to the other end **once — no chaining, and standing on a portal never retriggers it** (ADR-0008 rule 6). **Landing semantics (per the architecture ruling, `docs/architecture.md` §6.2 — RV-002 reconciliation):** once the entering step is legal the teleport is **unconditional**; the landing tile is **not** re-validated, and if it is solid in the post-flip phase the player is simply **embedded** there (ADR-0008 rule 3) and walks out by the normal entry rule. (Replaces the V0.3 "landing tile must pass the same entry check" line, which implied a second failure path that §6.2's single-failure-point contract excludes.) **Opposite-colour law (ADR-0009):** the two ends **must** sit on opposite checkerboard colours — `x1+y1` and `x2+y2` of different parity. A teleport changes position without consuming a move; only opposite-colour ends break the position→phase function. Same-colour pairs are measured inert and are **rejected by the validator — enforced and landed: 0/400 same-colour boards pass validation** (LV-002A check, LV-002B re-scan; ADR-0009 decision 5). Authoring caution: keep at least one neighbour of the landing tile non-solid in the post-flip phase, or the no-dead-state invariant (§4) rejects the level. |
| `par` | int ≥ 1 | ✓ | Reference move count, set from the Solver's `shortestSolution` (+0 for teaching levels, small slack later). Displayed as the "perfect clear" target; **never** a fail condition. |

Validation invariants (schema + validator, owned by Level AI + Solver): all coordinates in bounds; no duplicate tiles within a list; `player` and `goal` non-wall in **both** phases — the goal rule is hard-enforced (ADR-0008 rule 7): a goal walled in either phase is rejected; **portal ends on opposite checkerboard colours — hard rejection, landed and machine-enforced (ADR-0009 decision 5; LV-002A validator check — 0/400 same-colour boards legal, reproducible via `scripts/validate-levels.ts`)**; **door targeted by more than one switch ⇒ review flag** (warning; hard rejection above the L36+ allowance is Solver-side policy); solvability and difficulty metrics attached by the Solver before a candidate is accepted. **The whole level set is verified by the Solver before Stage 4 — LLM proposals are candidates, never content, until proven (ADR-0004).**

Example (the shipped L5 phantom-walk teaching level, `src/levels/l005.json`; shortest solution **BFS-verified at 6**):

```json
{
  "id": 5,
  "width": 5,
  "height": 4,
  "startPhase": "A",
  "player": [0, 1],
  "goal": [4, 1],
  "phaseAWalls": [[3, 1], [4, 0]],
  "phaseBWalls": [[4, 2]],
  "doors": [],
  "switches": [],
  "portals": [],
  "par": 6
}
```

Reading it under the checkerboard invariant (§0): `(3,1)` and `(4,0)` are A-walls at **odd** Manhattan distance — **permanent obstacles**. The greedy middle row is refused at `(3,1)` on move 3, and will be refused there **forever**; this example never pretends otherwise. `(4,2)` is a B-wall at odd distance — enterable on odd moves, i.e. while Phase A is current, where it renders as a hollow echo. The solution: side-step `(2,2)` → `(3,2)` → step **into** the echo `(4,2)` on move 5 → the flip solidifies it *under* the player (embedded, safe — ADR-0008 rule 3) → walk out onto the goal on move 6. Every goal approach except `(4,2)` is permanently walled, so the phantom walk is **forced**, which is exactly the L5 lesson (§2). (This replaces the V0.3 example, which contradicted itself — `par: 6` against its own 4-move `R,R,R,R` trace, and a `phaseAWalls [[2,0]]` that was permanently impassable decoration; RV-002 M-1.)

## 2. Teaching ladder L1–L10 (Show, don't tell)

Text budget: L1–L3 get **≤ 1 hint line total** ("Tap to move"); L4 onward get **none**. No popups, no "mechanic discovered" banners — the board is the teacher (game-design.md §9). Ladder per **GATE D / ADR-0009** (mechanics forward), synced with the shipped + solver-proven L1–L10 (`src/levels/README.md` §0): the M0-only stretch is honest (literacy + refusal + phantom walk, **no dynamism claim**) — **there is no mechanical Aha before L6**; the hook there is cadence (small boards, par ≤ 6, instant restart, fast turnover), and whether L1–L5 retain players to L6 is Stage 2 playtest **hypothesis d′** (ADR-0009 decision 8; game-design.md §13 A5). The first real decisions arrive at L6 with the **M1+M3 unit — doors + switches taught as one object across L6–L10, Aha #1 (the latch) engineered at L8** (§3). **Portals arrive at L11** under the opposite-colour law (§1) — the first point where dual-phase-tile metrics are satisfiable at all (§3, gate (iv)). The 50-level endgame (§5) is unchanged.

| Level | Teaches / reveals | Construction |
|---|---|---|
| **L1** | `tap → move`; the world flashes to the other phase | Empty small board, straight line to goal. The flip is harmless here — the player simply watches the world change colour. |
| **L2** | "The flip happens *because I moved*" | Empty board, path of 4–5 moves; the world alternates in step with the player's own taps. Cause ⇒ effect is established. |
| **L3** | First contact with the illegal-move rule: a wall of the *current* phase blocks entry — **and this wall will never open** | One parity-**mismatched** phase wall on the direct line (a **permanent** obstacle, §0). The tap is refused with bump feedback (no movement, no flip). **The refusal IS the tutorial.** A one-tile detour solves it. Never author this wall as something that opens later — under the invariant it cannot. |
| **L4** | "The hollow tile is enterable — and the world can solidify around me, safely" | The offered route crosses an **echo** (a wall of the *other* phase): the player steps onto it while passable; the flip solidifies it *under* them — embedded, unharmed (ADR-0008 rule 3). An echo-free route of the same par exists, so the beat is offered, not forced (shipped `l004.json` shape). |
| **L5** | "…and I walk out." The phantom walk, **forced** | The goal's only approach is through an echo: enter it on a passable step → the flip solidifies it under the player → step out onto the goal (shipped `l005.json` shape; par = 6, BFS-verified). Par ≤ 6. This is Option B's real gift, taught on purpose — not route dynamism, and never sold as such. |
| **L6** | **M1+M3 debut (block-opening dip, §6): "what I step on changes the world — and it stays changed"** | The latch introduced **on the natural path**: one switch on the straight row, one door on the goal approach — the only shortest route presses the switch at move 1, so the player latches the door open **without being asked to**. Teaching grade: below OFFERED — the mechanic is *demonstrated by walking*, not yet demanded (same table as the l004 = phantom-walk-OFFERED / l005 = FORCED precedent, `src/levels/README.md` §0). Stepping on the switch (while its `activePhase` is current) inverts the door, **and the change persists after the player walks away** — the latch. Single-unit board, solver-verified par 4, no false routes. **Recorded concession:** `switchRequired = false` — the un-switched world still solves in 6 — is the deliberate price of the dip (`src/levels/README.md` §2b L6), not a defect: L6 is exempt from the `switchRequired` obligation that binds L7–L10 and is **never scored as FORCED** by any assertion. |
| **L7** | The detour-to-switch: "I go out of my way to change the world" | Switch off the direct line; the door guards the goal approach. Walking to the switch and back costs moves but opens the door; the latch makes the round trip *worth* it. |
| **L8** | **Aha #1 — the latch (engineered, §3): "我踩过的东西改变了我脚下的世界"** | A closed door refuses the greedy approach; a visible switch inverts it and **stays** inverted; the player returns and passes the very door that refused them. The "refused first, entered later" beat ADR-0008 promised — delivered by latch state, not parity (ADR-0009). |
| **L9** | **Two doors, two switches — the ordered plan: "the second switch sits behind the first door"** | Two latches chained by geometry: `s1` opens `d1`, and `s2` is reachable **only through `d1`**, so the press order is forced by the board itself, not by advice. (The V0.4 "switch timing" lesson — *a switch triggers only in its `activePhase`; arriving on the wrong phase does nothing* — is **unconstructible pre-L11**: F2/F3 fix every tile's entry phase, so a switch is either always current on its tile or never fires; `src/levels/README.md` §4. Shipped lesson, solver-proven on `l009.json`: par 8, `refusedThenEnteredTiles` = 2, `switchRequired` = true — README §2b L9, §0b.) |
| **L10** | Gate check: the player owns `move → flip → latch` | Medium board combining permanent M0 geometry + one door + one switch. Passing L10 = the player plans across the flip *and* across latch state. |

## 3. First Aha construction (L6–L8) — explicit step chain

The V0.3 parity-gate Aha ("a side step flips parity and the refusing wall becomes the route") is **unconstructible** — the checkerboard invariant proves arrival parity is route-independent (ADR-0009) — and is withdrawn. Do not author toward it. The mandated chain (game-design.md §9), instantiated concretely for L8, delivers the same *shape* of beat — refused first, entered later — through the **latch**, the constructible source of it:

```
1. ACT               Player walks the obvious line toward the goal; the world
                     flips A→B→A with each step (literacy owned from L1–L5).
2. REFUSAL           The door on the line is closed in the approach phase:
                     REFUSED — bump feedback, no movement, no flip
                     (ADR-0008 rule 1). A door, unlike an M0 wall, is visibly
                     an object WITH a state.
3. THE SWITCH        A switch tile sits visibly 1–2 tiles off the line. The
                     player steps on it while its activePhase is current:
                     the door inverts — and the board shows it STAYING
                     inverted when the player steps off. Latch, not pulse.
4. RETURN            The player walks back; the door that said "no" now
                     answers "yes". Nothing about step parity changed the
                     door — the player's HISTORY did.
5. GOAL              Player passes the tile that refused them and reaches the
                     goal, owning the sentence:
                     "我踩过的东西，改变了我脚下的世界。"
```

Design requirements for the Aha #1 levels, aligned with the adjudicated gate law (Orchestrator ruling on the LV-006 escalation — `docs/ai-native-pipeline.md` §8.5; ADR-0009 decision 1). Every gate's status on the shipped `l008.json` is program-measured (`src/levels/README.md` §0b, §2b L8):

**Named Solver gates — pre-L11 (all three PASS on shipped l008):**

- **(i) `no-solution-with-switches-off`** — the door must genuinely refuse the un-switched approach: **no solution exists with all `switchesOn` false**. (l008: the all-OFF subgraph holds 16 of the 34 reachable states; the goal is unreachable inside it.)
- **(ii) `shortest-solution-presses-switch-and-crosses-door`** — the toggle is **required, not incidental**: every shortest solution steps on the switch while its `activePhase` is current, then passes **through the refusing door itself**. The Aha is "the door opened", not "I walked around" — a route that bypasses the door teaches nothing about the latch. (l008: all 6 shortest routes press `s1` at move 3 and cross `d1` at move 5.)
- **(iii) `refused-then-entered`** — the crossed door tile appears in `refusedBeforeEnteredTiles` (**≥ 1**): on at least one legal play trace the tile is *refused strictly before it is entered* — the ordered beat the Aha words promise (ADR-architecture-0002 Ruling 1(c); spec: `docs/architecture.md` §8.1). **Switched from the unordered form at GD-008** — one-sentence reason: the Aha's own sentence is ordered ("refused *first*, entered *later*"), and the ordered reader is already shipped (report-only since LV-007B) and measured **identical on l008 and on all of L1–L10** (tile lists 1/1/1/2/1 on L6–L10 under both forms), so the switch changes no verdict today while closing the trapped-refusal class (46/2000 seeded latch boards fire unordered but never ordered — 2.3 %, pinned by `tests/solver/ordered-companion.test.ts` §5 — a beat no player can witness) **before** portal boards make divergence likelier. **Landed 2026-10-15 (LV-007C, merge `9dd92ce`):** `policy.ts` gate (iii) now reads the ordered field — enforcement gates `refusedBeforeEnteredTiles ≥ 1` and prints both forms in its detail — with the §8.3-mandated divergent-board negative control live: a watched **trapped-refusal flip control** (canonical 1, ordered 0 — a beat no player can witness) is rejected by `gate-refused-then-entered`. No shipped verdict moved: identical tile lists on L1–L10 (1/1/1/2/1) and `[5,0]` on both readers on L11. The pre-L11 acceptance law in `docs/ai-native-pipeline.md` §8.5 deliberately keeps the **unordered** form (board-level dynamism carrier — a different job from this gate; not edited by GD). **L11+ block ruling (2026-10-15, GD-010 — full record: `docs/decisions/design-0002-ordered-reader-block-ruling.md`):** the §8.5 ordered/unordered **promotion trigger was tested at the first L11+ portal candidate and did NOT fire** — `l011.json` reports `[5,0]` on **both** readers (LV-008; `docs/project-status.md` item 52) — so the unordered legs (`lesson-latch-dynamism`, gate (ii)'s refusal half, §8.5's pre-L11 acceptance law) stand unordered per ADR-architecture-0002 Appendix A3, and the split is not re-litigated without a measured divergent candidate. Re-opener: a future L12+ candidate whose two readers diverge — then §8.5's own promotion path fires. (l008: `(3,1)` — the very tile that refused the greedy line.)

**Named Solver gate — L11+ only:**

- **(iv) `dual-phase-tiles` (`dualPhaseTiles ≥ 1`) activates from L11 (portals) and must never be required of a portal-free level.** Per the Orchestrator's adjudication it is **unsatisfiable pre-L11 by law, not by authoring weakness**: the checkerboard invariant (ADR-0009 decision 1, proved three times) fixes each tile's entry phase, and a switch never relocates the player, so `dualPhaseTiles ≡ 0` (pinned by `tests/solver/dynamism-metrics.test.ts`; reported by the Solver as `UNSATISFIABLE` with its proof — never dropped, never softened, and never "fixed" by smuggling in a portal the schedule forbids). Aha #2 (below) is its first natural home.

**Construction spec (design requirements — programmatic enforcement is follow-up LV-007, RV-004 n-14; shipped l008 already satisfies both):**

- Exactly **one door + one switch** on the board; both visible from the start; the switch on the greedy line or ≤ 2 tiles off it. (l008: one blue door + one switch; `s1` at `(2,0)` sits **1 tile** off the straight row.)
- Par ≤ 8 for L8 (L6–L7 sit at par ≤ 4 under the §6 dip). (l008: solver-verified par **6**.) No text, no popup; the success animation is the only reward signal; the player must *realize it themselves* (game-design.md §9).

**Aha #2 preview (L11–L13, opposite-colour portal):** a tile that every *walking* approach reaches on the wrong phase is entered **through** a portal — "同一个格子，因为我从哪边来而应答不同。" Construction laws: portal ends on opposite checkerboard colours (§1, ADR-0009 decision 5); the target tile must be provably unreachable-on-foot in the needed phase (Solver condition: the walking-only subgraph has no entry to it).

## 4. Fail conditions & "restart instead of stuck"

- **There is no death, no crush, no timer, no move limit** (game-design.md §12; crush / push / relocation rejected by ADR-0006 and reaffirmed by ADR-0008 rule 3 — standing inside a wall is safe).
- The only real failure is **player confusion**. Levels are therefore constructed so that **no unrecoverable state exists**: from every reachable position, the goal stays reachable.
- **Embedded states are normal states.** A position with the player standing inside a wall (ADR-0008 rule 3) is an ordinary Solver node: its exits are the adjacent tiles non-solid in that state's phase. A reachable non-goal state with **zero legal moves** (every neighbor solid in the current phase — there is no waiting to change parity) is unrecoverable by construction and fails the reachability invariant.
- Enforcement is mechanical, not hopeful: the Solver checks reachability from all reachable states (embedded ones included, and the latch state bits `doorsOpen`/`switchesOn` are part of the state, `docs/architecture.md` §6.3); candidates with dead states are **rejected** (ADR-0004). Target `R` (dead-end ratio, game-design.md §11) = 0 for L1–L15 (the teaching span under ADR-0009), near-0 afterwards.
- **Restart instead of stuck:** `Restart` is instant, one tap, penalty-free; `Undo` is unlimited (game-design.md §6). Restart is framed as an experimentation tool — *every refusal is information* — never as punishment.
- A refused move must never be mistaken for input failure: distinct bump feedback + the phase visibly NOT flipping (UI dependency for the Art Director, `docs/ui-ux.md`).

## 5. Per-block design intent (50-level rhythm)

The block table itself lives in `docs/game-design.md` §8 and is deliberately **not** duplicated here. Intent per block:

- **L1–L2 — Literacy.** Movement = phase flip; cause ⇒ effect. The flip is harmless on purpose.
- **L3 — The first "no".** A *permanent* refusal: M0 walls are geometry, not timing gates (§0). The player learns to route around — and learns it honestly.
- **L4–L5 — The phantom walk.** Option B's real gift: echoes are enterable, embedding is safe, walking out is free. L4 offers it, L5 forces it (§2). No dynamism claim is made for M0 (ADR-0009).
- **L6–L10 — The latch unit (M1+M3).** Door + switch taught as one object; **Aha #1 at L8** (§3); L9 chains two latches in a geometry-forced order — the second switch sits behind the first door (§2); L10 is the gate check. Block opens with a dip (§6).
- **L11–L15 — M2 portals.** Opposite-colour pairs only (§1); parity genuinely breaks; **Aha #2** — entry depends on approach side (§3). First block in which gate (iv) `dualPhaseTiles ≥ 1` is satisfiable at all — it is unsatisfiable by law on every portal-free board (§3). Block opens with a dip.
- **L16–L25 — Latch fluency.** Multi-door boards, chained and timed switches, 2-step lookahead; M0 geometry now read as permanent terrain the latch re-prices. The promised **2-step lookahead** is delivered at **L20** by the **sealed landing** — portal → pocket → door, forcing the ordered two-press chain (§6.2, GD-007).
- **L26–L35 — Portals integrated.** Routes re-priced by latch state *and* approach side; portals as phase-shuffling edges inside larger plans.
- **L36–L45 — Synthesis.** All mechanics live; 3–5 step lookahead; deceptive geometry carried by visibility (wall echo, ADR-0007); the rare, review-flagged multi-switch (XOR) door may appear here (§1). *(Pointer, not a restatement: the 100-level architecture **moved this allowance to Act III** — §7.2 `L41–L60`, "moved here from §8's L36–L45 allowance" — and GD-014 §7.10.8 **released** it to `L51+`. This block's line is kept as the 50-level plot's own record; `docs/game-design.md` §8's twin row is a named handoff, not edited here — **discharged by GD-014b, which added the §7.10.8 + corrigendum pointer to that row** (§7.10.8.2's supersession record is that corrigendum).)*
- **L46–L49 — Density peak.** High-interaction boards, longest pars, zero new rules.
- **L50 — Final Exam.** Recombines only what was taught; no new mechanic, no trick rules. Beating it should feel like graduation, not luck.

## 6. Difficulty dip rule (non-monotonic curve) — re-axed at GD-008 (ADR-design-0001)

**Measured fact first.** `D` is computable and measured on the shipped L1–L10 since LV-007B (`docs/level-difficulty.md` §2a/§5.2; provisional weights `w1…w5 = 1, 3, 4, 2, 5`) — the V0.5 "not yet computable" gap is closed. The same measurement **falsified** the old version of this section: the L5→L6 seam is **+8.53 on `D`** (ΔL −2 · ΔB +0.53 · ΔM +10), and a −2…−3 `D` dip at a mechanic introduction is **unreachable by construction** — a debut adds `5·ΔM` in exactly the step where the dip must lower the score, while par is already at the game floor and `B` does not fall. The clause is replaced below. **No weight was re-tuned to manufacture a dip; the fix is a change of axis, not of numbers** (full record: `docs/decisions/design-0001-difficulty-dip-on-execution-axis.md`).

**The axis split (what the dip law always meant).** `D` prices two different things in one sum:

```
D = D_exec + D_learn
D_exec = w1·L + w2·B + w3·T + w4·R    — execution: what the player must DO and SEARCH
D_learn = w5·M                        — comprehension: what the player must LEARN
```

Inside the §4 acceptance region `T ≡ R ≡ 0` (measured theorem, `docs/level-difficulty.md` §5.2), so `D_exec = L + 3·B` there — computable today from the published per-level breakdown as `D − 5·M` (every stored row echoes its weight vector, so the subtraction is unambiguous). A mechanic debut **must** raise `D_learn` — the player really is learning something new, and pretending otherwise is what the falsified clause did. The non-monotonic law therefore lives on `D_exec`, the axis the player feels as "the game asks less of my hands while I learn".

**The dip law (binding, falsifiable):**

- **Seam law.** At every mechanic-introduction seam (`ΔM > 0`), the debut level's `D_exec` sits **strictly below the previous block's `D_exec` peak** (block = the span since the last mechanic introduction — an `M`-plateau). Equivalent budget form: `D(debut) − D(previous block peak) < w5·ΔM` — the entire `D` rise at a debut is comprehension tax, never execution.
- **Sawtooth.** Within a block, `D_exec` then ramps until it **exceeds the previous block's `D_exec` peak** — a sawtooth on the execution axis, never a staircase (game-design.md §8).
- **Construction floor (unchanged).** The debut level (and its successor where the block allows) is short (par ≤ 4 in the teaching span), single-concept (one new mechanic *unit*), free of false routes, and teaches **below OFFERED** — the mechanic is demonstrated by walking, not demanded (the L6 precedent: `switchRequired = false` recorded as a deliberate, named concession, **never scored as FORCED**; §2 L6; `docs/ai-native-pipeline.md` §8.5 OQ4).
- **Rejection teeth (unchanged).** A debut candidate that breaks the seam law is **rejected or redesigned** — no exceptions.

**Recomputed curve** (every value derivable as `D − 5·M` from the test-pinned rows of `docs/level-difficulty.md` §5.2; cross-checked as `L + 3·B`, valid because `T ≡ R ≡ 0` on 10/10; no new numbers introduced):

| Level | L1 | L2 | L3 | L4 | L5 | **L6** | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `D` | 14.00 | 15.06 | 15.29 | 15.58 | 15.33 | **23.86** | 22.75 | 25.50 | 27.14 | 28.64 |
| `D_exec` | 9.00 | 10.06 | 10.29 | 10.58 | 10.33 | **8.86** | 7.75 | 10.50 | 12.14 | 13.64 |

Read-out: the L5→L6 seam is **−1.47 on `D_exec`** (−1.72 against the previous block's peak, L4 10.58) — the dip exists and is measured, on the axis that carries it; the dip spans exactly the two par-4 levels (L6 8.86, L7 7.75), matching the construction floor's "first 1–2 levels"; the block then ramps to 13.64 > 10.58 — sawtooth confirmed. The old "2–3 points" margin is **withdrawn, not re-fit**: no principle independent of the target number ever derived it, and the measured `D_exec` span of the whole shipped ten is only ≈ 5.9 points. The measured margins (−1.47 / −1.72) stand as calibration anchors; any future numeric margin comes from playtest regression (`docs/level-difficulty.md` §4), never from curve-flattery.

**Player-perceivable semantics of the valley (the felt half, and who measures it).** What a *player* experiences at a debut: fewer moves to the goal (par at the game's floor), few effective choices per state (`B` at the block floor), no punishable mistakes (§4's no-dead-state invariant), and a mechanic shown before it is demanded (below OFFERED). The Solver measures the first three at generation time (the seam law above); the **felt half is Playtest Analyst territory** — debut level vs previous block-close level on first-win time, M5 restarts, M6 undos, M4 refusals — to be pinned as a named clause in the Stage-2/3 protocol with thresholds frozen **before** the cohort runs (T6 discipline; handoff: PA). Until that data lands, the valley claim on the experience axis is a labelled **hypothesis**, same honesty discipline as hypothesis d′ (§2).

**Falsifiable prediction for L11 — the law's only remaining test** (L6 and L11 are the only mechanic-introduction seams in the 50-level schedule, game-design.md §8). With `ΔM = +1` at L10→L11: `D_exec(L11) < 13.64` (equivalently `D(L11) < 33.64`), par ≤ 4, a single opposite-colour portal pair, no false routes, below-OFFERED teaching grade; and the L11–L15 block's `D_exec` exceeds 13.64 by its end. A shipped L11 that violates the seam law is a rejected level, whatever its other virtues.

**OUTCOME ANNOTATION (2026-10-15, GD-010 — appended below the frozen clause, which is byte-preserved).** LV-008 shipped the board and the Orchestrator's clause-by-clause verdict (merge `aaab35d`; `docs/project-status.md` item 52) records every per-level clause **PASS**, machine-checked against the frozen numbers: `D_exec(L11) = 8.5732 < 13.64` ✓ (the bound is the 2-dp published form of L10's measured 13.642857 — strictly harder than "beat L10"; both rows published in `docs/level-difficulty.md` §5.2 V0.5); `par = 4 ≤ 4` ✓; exactly **one** opposite-colour portal pair, validator-enforced, `errors = 0` ✓; `T = 0` — no false routes ✓; below-OFFERED debut grade with `switchRequired: "exempt"` recorded on the L6 precedent ✓. **Filtered, never fitted:** 54 seeded candidates (`SEED 20261015`, `scripts/author-l11-candidates.ts`) → 1 accept = shipped `MATCH`; both "差一点" probes rejected by name (same-colour pair = validator hard error; bypassable portal = gate trip). Read on both axes, honestly: the dip is real on `D_exec` (13.6429 → 8.5732, **−5.07** against L10) while raw `D` barely moves (28.6429 → 28.5732, −0.07) because the debut's `M` +1 carries its +5 comprehension tax — the same two-axis structure this section publishes for L5→L6, now confirmed at the second and last `ΔM > 0` seam in the schedule; no weight was tuned. **The block-level clause — "the L11–L15 block's `D_exec` exceeds 13.64 by its end" — is PENDING (untested, not failed):** L12–L15 are unauthored (LV-009 queue); the sawtooth obligation binds that block's ramp exactly as written, and a future L12–L15 level that strands the block under 13.64 is rejected or redesigned on the same teeth as above. **The law remains standing for L12+ and any future seam** — the schedule's only two mechanic-introduction seams (game-design.md §8) are now both measured ✓ (L6 −1.47, L11 −5.07 on `D_exec`) — and GD-008's discipline is unchanged: a failed number is **withdrawn, never re-fit** to a target (ADR-design-0001). This annotation adds the outcome and moves no threshold.

**Rationale (unchanged):** when a mechanic is new, the player's budget is spent on *understanding*; execution difficulty stacked on comprehension load reads as unfairness. This is the L1–L3 lesson applied recursively.

## 6.1 GD-011 published law — the L12–L15 block (par obligation, dip shape, latch grade)

> Owner: **Agent 1 — Game Designer** · Task **GD-011** · Date **2026-10-16** · Status: **PUBLISHED LAW**
> Full record + per-board clause-by-clause verdict: `docs/decisions/design-0003-l1215-block-law.md`
> Trigger: LV-009-A returned four solver-proven L12–L15 candidates and correctly STOPPED at three
> design-owned gaps (its dossier §7 OQ-1/OQ-2/OQ-3). This section closes all three **as law, before
> any integration**, so the four boards are MEASURED against it and never fitted to it.

### 6.1.0 What this section does and does not publish (integrity statement, read first)

`docs/level-difficulty.md` §3.5 deliberately publishes **no numeric `D`/`D_exec` target above L11**,
and §6 above publishes none either. **That prohibition is untouched.** What is published here is a
**par obligation** and two structural clauses. The distinction is not convenience, it is the reason
the §3.5 discipline exists:

| Quantity | Published here? | Why |
|---|---|---|
| `par` (construction floor) | **YES — as law** | Weightless. It is a schema field the level gate already enforces (`par == shortestSolution`), and §6 / `src/core/solver/policy.ts`, declarator `export const PORTAL_DEBUT_PAR_CAP` (= `4`) already carry par as law. *(Cite form: **symbol-anchored, no integer** — **ADR-architecture-0006 §10 `ARCH-006c` (2026-10-20)**, *cites into an era-decaying file anchor by symbol*. The published `policy.ts:599` had **already DECAYED (+562)** and landed on a `//` comment line; the declarator is measured at `:1161`, base `d395549`.)* A par bound cannot be "fitted to the weights". |
| `D` / `D_exec` targets | **NO** | Depends on the **provisional V0.1** weights `w1…w5 = 1,3,4,2,5` (§6, ADR-design-0001 option (d)). Inventing a fresh `D` band nobody has measured is exactly the error `docs/level-difficulty.md` §3.1 withdrew. |
| The block-end clause | **already frozen** | "`D_exec` exceeds 13.64 by its end" (§6, V0.6, byte-preserved). GD-011 adds no new `D_exec` number; it only records that the frozen clause is now **DISCHARGED** (§6.1.5). |

New numbers enter this document only by solver measurement or playtest regression of `w` (§3.5's two
paths). Every number below is either (a) an intersection of already-written rules, or (b) a value
**measured by the program** on the accepted candidates and cited with its source. No weight moved.

### 6.1.1 LAW Q1 — the par obligation for L12–L15 (ruling on OQ-1)

**Published shape: floor ∩ step ∩ ceiling ∩ coverage. The four numbers are the UNIQUE solution, not an approval.**

| Clause | Law | Derivation pointer (audit trail) |
|---|---|---|
| **P1 · floor** | `par(L12) = 4` **exactly** | Intersection of two already-written constraints: §6 *Construction floor* caps the debut's **successor** at `par ≤ 4`; and 4 is the game's measured par floor — ADR-design-0001 Change ("par is already at the game floor"), `docs/level-difficulty.md` §5.2 L5→L6 paragraph ("par can only fall to the block's floor (4, the game's lowest)"). Shipped L1/L6/L7/L11 are all par 4. `≤4 ∧ ≥4 ⇒ =4`. Not a choice. |
| **P2 · step** | `par` strictly increases within the block, **Δpar ≥ 2** between consecutive members | Inside the §4 acceptance region `T ≡ R ≡ 0` is a **measured theorem**, so `D_exec = L + 3·B` with `L = par` (`docs/level-difficulty.md` §5.2). `B` is measured in **[1.2500, 1.6875]** on **11/11** shipped levels (§5.2 rows) ⇒ `3·B ∈ [3.750, 5.0625]`, spread **1.3125**. §3.4's "ramp within the block" is a guarantee only if `Δpar > 1.3125`; the minimal such integer is **2**. `Δpar = 1` does **not** guarantee the ramp (a level can gain 1 par and lose 1.31 in `3·B`). |
| **P3 · ceiling** | `par ≤ 10` for the whole teaching span L1–L15, reached only at the block's last member | Three independent supports: **(a) coverage** — all four accepted candidates measure `distinctPositions == width × height` (21/21, 24/24, 28/28, 35/35; dossier §2.1–2.4), i.e. the par route visits **every tile**; a par above the tile count forces revisits, and revisits in the teaching span are backtracking, not planning (`forcedMoveRatio = 0.0000` on L15 — no fake-hard padding). §1's hard cap `width/height ≤ 7` (ui-ux R-L2, 44 px touch floor at 320 px) bounds the tile count. **(b) searchability** — accepted share falls `0.5 % → 0.1 % → 0.06 % → 0.03 %` across par 4→10 (315 566 tried / 484 accepted, dossier §5); a stricter ceiling is **unsearchable**, and §3.5's ordering ("L16+ strictly above the previous block's peak") needs headroom. **(c) precedent** — max shipped par is 9 (L10); 10 is the smallest value above it that P1∧P2 can land on for a 4-member block. |
| **P4 · coverage clause (new)** | A teaching-span member's par route must visit every board tile: `distinctPositions = width × height` | Measured 4/4 (dossier §2.1–2.4: 78/79/95/99 reachable states over 21/24/28/35 distinct positions). This is the clause that keeps `par` honest against board size, and it is what makes P3 a **measurement** rather than a taste call. |

**Uniqueness (the honest answer to "why no other shape satisfies it").** `game-design.md` §8 fixes the
block at **exactly four members** (L12–L15). `P1 ∧ P2 ∧ P3 ∧ 4 members ⇒ par = 4, 6, 8, 10` uniquely:
`4 + 2·3 = 10`, so the minimal ramp lands exactly on the ceiling. `(4,6,8,11)` and `(4,7,9,11)` violate
P3; `(4,6,7,9)` and `(4,5,7,9)` violate P2; `(5,…)` violates P1. **The proposal 4/6/8/10 is therefore
ADOPTED AS DERIVED, not approved by taste** — it is the only admissible ramp, and had LV-009-A proposed
anything else this section would have rejected it on P1/P2/P3.

**Stable shape for L16+ (published so the law does not need re-inventing per block):**

- At a **seam** (`ΔM > 0`): debut `par = 4`, successor `par = 4` (P1), then `Δpar ≥ 2` (P2) from the
  third member, ceiling per span, coverage per P4. This reproduces the shipped L6 block (4,4,6,8,9).
- At a **non-seam block** (L16–L25 latch fluency, L26–L35, L36–L45): no dip, no P1 pin; `Δpar ≥ 2`
  within the block and the block-open must clear the previous peak **on `D_exec`** (§3.4/§3.5) — par is
  the construction proxy, `D_exec` remains the law's primary quantity.
- **Forward consequence, already forced (labelled derived, conditional):** §3.5's ordering requires
  `D_exec(L16) > D_exec(L15) = 14.969697`, and `D_exec = par + 3·B`, so the measured `B` band bounds
  `par(L16)` from **both** sides: **necessary** — best case `3·B = 5.0625` ⇒ `par(L16) ≥ 10` (par 9
  tops out at `9 + 5.0625 = 14.0625 < 14.969697`, so par 9 cannot clear L15); **sufficient for any `B`
  in the band** — worst case `3·B = 3.750` ⇒ `par(L16) ≥ 12`. So a par-10 or par-11 L16 is *admissible
  only if it carries above-average branching* (`par 10` needs `B > 1.656566`, i.e. above L15's own
  measured `B`; `par 11` needs `B > 1.323232`). Publish both bounds to the L16 author; do not read
  `≥ 10` as "≥ 10 is enough". Conditional on L15 shipping at its measured value **and** on the V0.1
  weights; a playtest re-calibration of `w1/w2` moves these consequences and nothing else in §6.1.1
  (par itself is weightless and survives re-calibration).
- **Self-correcting guard:** P2's guarantee holds only while `B` stays inside its measured band
  [1.2500, 1.6875]. If a future board measures `B` outside it, `Δpar ≥ 2` no longer implies a
  monotonic `D_exec` ramp and the ramp must be re-checked **on `D_exec` directly**. Report the
  out-of-band `B` as a named finding; never silently widen the band.

### 6.1.2 LAW Q2 — the dip shape is TWO BEATS (ruling on OQ-2)

**RULING: two-beat breathing post-debut. L12 owns §6's successor slot. No re-author. Single-beat REJECTED.**

The L11–L15 dip therefore spans **L11 (debut) + L12 (successor)**, and the ramp begins at the block's
third member. The two shipped blocks are **isomorphic** on this axis:

| Block shape | debut | successor (beat 2) | ramp 3 | ramp 4 | ramp 5 (block end) |
|---|---|---|---|---|---|
| **L6–L10** (shipped, measured) | 8.86 | **7.75** | 10.50 | 12.14 | **13.64** |
| **L11–L15** (GD-011 law) | 8.573171 | **8.230769** | 10.898734 | 12.957895 | **14.969697** |

Reasons, comprehension-first, in priority order (`AGENTS.md` §1: Fun > Comprehension > Depth):

1. **The text's plain reading.** §6 *Construction floor* says "the debut level **and its successor
   where the block allows**"; §3.4 restates it. A single-beat ruling would have to explain why the
   successor clause exists at all. The shipped read-out already used the two-beat reading for L6 ("the
   dip spans exactly the two par-4 levels … matching the construction floor's 'first 1–2 levels'").
2. **What the player who just met portals actually needs at L12 is REST, not escalation.** Aha #2 is
   the only idea in the game that **breaks the checkerboard invariant** (§0: proven law; portals are
   the sole parity-breaker). The player has spent ten levels internalizing "a tile's answer is fixed by
   its position". One exposure — L11, par 4, 82 reachable states, **1** par route — cannot turn an
   invariant-break into a habit. L12's job is **consolidation at the same par on a different skeleton**
   (dossier §5: L12's accepts come from `funnelFamily`, which keeps the debut's *plan shape*
   channel → latch → door on a different board). Same cost, new surface: that is what consolidation is.
3. **The escalation that follows is qualitative and FORCED, so it needs a run-up.** From L13 the
   walk-only world is **UNSATISFIABLE** (`portalFree = false`, measured): the portal stops being a
   re-pricing shortcut (L12: `portalFree true`, route 7 → 4) and becomes the **only door**. Demanding
   that in the same breath as the debut, at a higher par, stacks execution load on comprehension load —
   precisely the unfairness §6's *Rationale* forbids ("execution difficulty stacked on comprehension
   load reads as unfairness"). Two beats buy exactly one rest level before the mandatory-channel step.
4. **Single-beat buys nothing the law requires.** The block-end clause is satisfied either way
   (14.969697 > 13.64). Single-beat would re-author one board to trade the block's only rest beat for a
   marginally steeper ramp — comprehension (priority 2) sold for depth (priority 3). Under §1's
   ordering that trade is wrong.
5. **The margin is small, and it is labelled honestly.** L11 → L12 is **−0.342402** on `D_exec` with par
   pinned flat at the floor 4: the second beat is carried **entirely by effective branching falling**
   (`B` 1.5244 → 1.410256), not by shortening. So beat 2 is a **choice-narrowing rest**, not a shorter
   level — a better rest than a shorter level would be, and it is measured. Honest label: on the felt
   axis this is a **consolidation plateau**, not a valley. §6's ban on re-fitting applies in both
   directions — the two-beat ruling is made on grounds 1–4, **not** because −0.34 is small; re-authoring
   to gain +0.35 on a provisional weight vector would be curve-flattery.

The felt half stays a **labelled hypothesis** (§6, PA handoff): first-win time / M5 restarts / M6 undos
at L11-vs-L12-vs-L13, thresholds frozen before the cohort runs. GD-011 does not claim the plateau is
*felt*; it rules that the construction is right and names who measures the rest.

### 6.1.3 LAW Q3 — the latch grade for combo levels (ruling on OQ-3)

**RULING: option (a) ACCEPTED AS DOCTRINE, hardened into a measurable obligation. Option (b) REJECTED.**

> **The quotable sentence for future reviewers:**
> **"From L12 up, the switch buys you *speed* and the sealed channel buys you *existence* — the latch
> grades `par`, never solvability, and from L13 the portal IS the solvability-load."**

Measured basis (dossier §5, §2.1–2.4): `switchRequired = false` on **0/484 accepted** candidates, and
the all-OFF world solves **exactly 2 moves slower** everywhere (`allOffShortest` 6/8/10/12 vs par
4/6/8/10). A filter that invalidates **484/484** is not a filter on authoring quality — it is a filter
on **geometry class**, and on this evidence it is 0-accepts ⇒ full block restart with no reason to
believe the class is findable inside §1's board caps.

Why (a) is right against the locked core and the priority order:

1. **It is the world the core rule already promises.** `AGENTS.md` §2 + ADR-0008 rules 1–7: entry-only
   solidity, a closed door **refuses**, and nothing is ever crushed, pushed or relocated. §4: "every
   refusal is information", restart-not-stuck. A latch worth 2 moves is exactly that world — doors
   **re-price** routes, they do not gate existence.
2. **The block already has one existence-gate, and one is a lesson; two is redundancy.** From L13 the
   sealed line makes the portal mandatory (`portalFree = false`, measured). Adding all-OFF
   unsatisfiability on top would put two existence-gates in the first block where parity itself breaks.
3. **The block's lesson is Aha #2, not Aha #1.** L7–L10's `"required"` obligation belongs to the
   **latch unit's own block**, whose lesson *is* the latch (Aha #1 at L8, gate (i)
   `no-solution-with-switches-off`). Re-asserting it in the **portal** block would subordinate this
   block's lesson to the previous block's. The L11 lesson row's own comment already says so (`policy.ts:251`, **integer KEPT + era-stamped** `measured at base d395549`: the referent is a `//` comment and has **no declarator** to anchor by, ADR-architecture-0006 §10 `ARCH-006c`; the published `:246` had **decayed +5** across the same era): "a post-debut
   portal level (L12+) must declare its own lesson/obligation, because the par cap and the
   below-OFFERED grade are properties of the *debut*".
4. **The witnessable beat survives — by a different measured gate.** Gate (iii) `refusedBeforeEnteredTiles
   ≥ 1` holds on **4/4** (3 / 5 / 5 / 6), with ordered == unordered on 4/4 (so ADR-design-0002's
   promotion trigger again does not fire and A3's legs stand). The player still witnesses
   *refused-first-entered-later*; it is delivered by the ordered reader, not by all-OFF unsatisfiability.
5. **Precedent is consistent, not convenient.** L6 and L11 are `switchRequired: "exempt"` in
   `DOCUMENTED_LESSONS`, both recorded as deliberate concessions **never scored as FORCED** (§2 L6;
   §6; `docs/ai-native-pipeline.md` §8.5 OQ4).

**The hardening (what (a) does NOT license).** An exemption with no teeth is a shrug, so the grade is
published as a **falsifiable obligation** for every L12+ combo level:

| # | Obligation (program-checkable) | Measured on L12/L13/L14/L15 |
|---|---|---|
| **G1** | The latch must be **worth at least one move**: `allOffShortest − par ≥ 1`. A latch worth 0 moves is **inert** and is rejected (validator defect class, dossier §4 `classifyWarnings`). | 2 / 2 / 2 / 2 ✓ |
| **G2** | Every par route must **press the switch** and **cross the door** (gate (ii)'s shape: the Aha is "the door opened", not "I walked around"). | L12 `parRoutes = 1`, trace `D1>3,2 R2*4,2 R3+5,2 R46,2` — presses `*` and crosses `+` ✓ |
| **G3** | Gate (iii) ordered reader fires: `refusedBeforeEnteredTiles ≥ 1`. | 3 / 5 / 5 / 6 ✓ |
| **G4** | `DOCUMENTED_LESSONS` must carry `switchRequired: "exempt"` — **not `null`** — because these boards *do* carry a latch lesson (`null` means "no latch lesson at all", `policy.ts:136`, **integer KEPT + era-stamped** `measured at base d395549`: the referent is the JSDoc `null` bullet and has **no declarator** to anchor by, ADR-architecture-0006 §10 `ARCH-006c`; the published `:131` had **decayed +5** onto the neighbouring `"exempt"` bullet); the evidence string must name the measured `allOffShortest − par = 2`. | integration instruction, §6.1.6 |

**Rejected option (b), recorded honestly:** pre-registering a `switchRequired` filter would invalidate
**0/484** ⇒ full block restart, at a measured search cost already at 132 000 trials for L15's 44
accepts — and it would **lengthen** the puzzle, not deepen it: the extra 2 moves are a detour to a
switch the player must visit anyway, purchased by deleting the sealed-line construction that gives this
block its real escalation (mandatory channel from L13). Depth here comes from the **portal becoming the
only door**, which is a change of *kind*; (b) would trade that for a change of *move count*.

### 6.1.4 LAW — two standing points (OQ-4, and the `l12TemplateFamily` artifact)

**OQ-4 · `[multi-switch-door]` stays DORMANT for this block — CONFIRMED, no change.** §1's authoring
rule (≤ 1 switch per door in L6–L35; XOR doors reserved for L36+, review-flagged) already governs, and
0/4 candidates carry the warning (`13 warnings (0 multi-switch-door)`), so the flag was never exercised
and never had to be presented as a design risk. Dormant is also **required**, not merely permitted: §6's
construction floor says *single-concept (one new mechanic unit)*, and a two-switch door would add a
state-space dimension to the first block in which the portal is already mandatory. If a later L12+ round
wants the XOR door, that round's dossier must present the flag as a named design risk (OQ-4's own
condition, accepted).

**The `l12TemplateFamily` 0-accepts artifact — what it teaches for L16+ authoring.** 512 hand-enumerated
candidates on the debut's own 7 × 3 skeleton, **0 accepts**, recorded not repaired (dossier §5). The
lesson is that a shipped debut board is **not a template — it is a one-off fit**: L11 was filtered from
54 candidates to 1 accept, and that single accept's geometry is jointly tuned to *its own* lesson
(par 4 ∧ below-OFFERED ∧ no false routes ∧ one opposite-colour pair ∧ a specific refusal reader).
Re-using the skeleton re-uses the geometry while the new board must satisfy a **new** lesson, so the
conjunction collapses — which is exactly what the L11 lesson row's comment warns about (`policy.ts:251`, **integer KEPT + era-stamped** `measured at base d395549`: a `//` comment has **no declarator** to symbol-anchor by, ADR-architecture-0006 §10 `ARCH-006c`; the published `:246` had **decayed +5**). The reusable unit
across a block is the **ordered plan shape** (what the player must realize, and in what order), never
the board: L12's 351 accepts came from `funnelFamily`, the same plan shape (channel → latch → door) on
a **different** skeleton. **Instruction for L16–L25 authoring: enumerate plan shapes and search
skeletons under each; never clone a shipped board and perturb it.** And the honest scope of the
artifact: 0/512 is a measurement **about that family**, not evidence the block was unauthorable — the
same block found 484 accepts once the skeleton was released.

### 6.1.5 The frozen block-end clause is now DISCHARGED

§6's frozen prediction (V0.6, byte-preserved) carried two parts. GD-010's appended annotation recorded
part 1 as **satisfied** (`D_exec(L11) = 8.5732 < 13.64`) and part 2 — *"the L11–L15 block's `D_exec`
exceeds 13.64 by its end"* — as **PENDING (untested, not failed)**. On the solver-measured block:

```
D_exec(L15) = 14.969697  >  13.64        (published bound)      ⇒ +1.329697
D_exec(L15) = 14.969697  >  13.642857    (L10's measured peak)  ⇒ +1.326840
```

**DISCHARGED, in the escalation direction** — the sawtooth closes *above* the previous block's peak, not
merely at the published bound. This is the first time a §6 clause has fired **positive** at a block's
tail (both prior firings were dip-direction rejections/confirmations at seams). It was **filtered, not
fitted**: L15's own histogram shows **122 `block-floor` rejections** — candidates that solved but sat
at/below 13.64 — so the clause operated as a gate during search, never as a target read off the result
(dossier §5). Both of §6's `ΔM > 0` seams and the schedule's only block-end clause are now measured;
§6's law stands unchanged for L16+ and GD-008's discipline is unchanged: a failed number is
**withdrawn, never re-fit** (ADR-design-0001).

### 6.1.6 Handoff — what LV-009-B encodes, in order

Numbers approved for encoding, in the L11-seam style LV-008 used (`src/core/solver/policy.ts`, declarators `export const PORTAL_DEBUT_PAR_CAP` / `export const PORTAL_DEBUT_EXEC_BUDGET` — **symbol-anchored, no integers**, per ADR-architecture-0006 §10 `ARCH-006c`: the published `policy.ts:599`/`:613` had **both ALREADY DECAYED by exactly +562** and landed on `//` comment lines, the two declarators measured at `:1161`/`:1175`, base `d395549`). **GD does not
edit code**; the integrator encodes these, and the pre-registered acceptance law below must be enforced
**BEFORE** the candidates merge.

1. **Law constants (encode FIRST, so the gates exist before the data lands):** par law P1–P3 as named
   constants — block par floor `4`, within-block step `≥ 2`, teaching-span ceiling `10`, and the derived
   L12–L15 expectation `[4, 6, 8, 10]`; coverage clause P4 (`distinctPositions == width × height`);
   latch-grade **G1** (`allOffShortest − par ≥ 1`, measured 2 on 4/4). Do **not** re-purpose
   `PORTAL_DEBUT_PAR_CAP` / `PORTAL_DEBUT_EXEC_BUDGET` — those remain **L11 debut-only** obligations.
2. **Dataset:** byte-copy `candidates/l012…l015.json` → `src/levels/` (dossier §6.1). **Never edit a
   candidate JSON** — GD judges, the generator authors, the solver measures.
3. **`DOCUMENTED_LESSONS`:** four rows (L12–L15) carrying the block's **own** lesson/obligation
   (consolidation → mandatory channel), `switchRequired: "exempt"` (**not `null`**, per G4) with an
   evidence string naming the measured `allOffShortest − par = 2` and this ADR.
4. **Pins / mirror / sidecar:** `EXPECTED_LEVEL_COUNT` 11 → 15; four hand-typed `PINS` rows;
   `npm run levels` then `solve-levels.ts --report` (regenerate the sidecar from **shipped** levels
   only — never `--report` against `candidates/`); §5.2's four mirror rows by hand.
5. **Pre-registered acceptance law (enforce before merge, all machine-checked):** 15/15 validator `ok`,
   errors 0, warnings 28 (+13, all permanent-geometry class); 15/15 solver PASS with only the
   pre-existing `l008` `dual-phase-tiles` escalation; `par == shortestSolution` 4/4; `D_exec` equal to
   6 dp — **8.230769 / 10.898734 / 12.957895 / 14.969697**; `T ≡ R ≡ 0`, `deadStates 0`,
   `noUnrecoverableOk true` 4/4; `dualPhaseTiles ≥ 1` 4/4; `refusedBeforeEnteredTiles ≥ 1` 4/4;
   `portalFree true` on L12 **and `false` on L13–L15**; `allOffShortest − par == 2` 4/4 (reject if
   `< 1`); `D_exec(l015) > 13.64`; coverage P4 4/4.
   **STOP-and-route clause:** if ordered and unordered refusal readers **diverge** on any of the four,
   do **not** merge — route to ADR-design-0002's pre-specified re-opener (a divergent candidate is the
   one currency that re-opens it).
6. **Registry LAST, R-003-gated (Gameplay Engineer + UI/Art):** `LEVEL_SOURCES` explicit imports plus
   the door × portal painter seam, and the **UA capture-entry round** before any of the four is
   registered as playable. Design-side legibility requirement, from the Entry-3 JUDGED facts
   (`docs/ui-ux.md`: 51–65 px classes proven, board-width discipline): the **sealed line must read as a
   wall column** and the **portal ends must read as a pair**. "A board whose channel is invisible
   teaches nothing" (`src/levels/README.md` §4 R-003) — and from L13 the channel is the *only* door, so
   an illegible channel makes L13–L15 unwinnable-by-comprehension, not merely unclear.

## 6.2 GD-007 published law — the L20 mechanism: the SEALED LANDING (Aha #3, ordered landing)

> Owner: **Agent 1 — Game Designer** · Task **GD-007** · Date **2026-10-16** · Status: **PUBLISHED LAW**
> Full record (Original Hypothesis → Problem → Change → Evidence → Result): `docs/decisions/design-0004-l20-mechanism-sealed-landing.md`
> Trigger: the L16+ census is exhausted (LV-010f; `docs/project-status.md` item 86; `docs/ai-native-pipeline.md` §8.12 V1.5/§8.13) and the block was closed without a fifth rung because no mechanism existed.

### 6.2.0 The question, and the two measured candidates

L16–L19 are the **goal-gated full seal** (every neighbour of the goal is a door, each door targeted by one switch, all-OFF unsatisfiable). That device's ceiling was **censused exhaustively**: `par 18` on `7×6` at **every** arity — arity 2 (`par 16`), arity 3 (`18`), arity 4 (L19's own board: 17 160 tuples, `12:10230 14:6450 16:446 18:34`) — with `7×7` reaching `par 22` only by re-running L19's **exact seal shape** longer, refused as a re-lengthened walk. `block-l1619-tail-ceiling` forbids widening the terminal number instead of building a new mechanism, so R-003c registered four rungs and fabricated no fifth. Two constructions were named for the next lane, and this section **rules** between them:

| | Candidate | One-line shape |
|---|---|---|
| **(A)** | **GAUNTLET** | every approach to the goal's **ring** itself behind a door (≥ 6 doors on a 7×6 ring) |
| **(B)** | **SEALED LANDING** | a portal lands the player into a **pocket** whose only exit is a door → an ordered `land → press → leave → press` chain |

### 6.2.1 RULING — ADOPT (B) SEALED LANDING · REJECT (A) GAUNTLET

Priority order is `Fun > Player Comprehension > Puzzle Depth > Level Scalability > Determinism > Testability > Cost > Polish` (AGENTS.md §1). Each reason cites the census, never taste:

- **Fun (1) — the gauntlet is a minimum, so it cannot escalate.** The census's *structural* finding is an identity: with a full seal the shortest plan opens exactly **one** door, because every seal tile is directly adjacent to the free far region — `par = min_i ( d(start→s_i) + 1 + d(s_i→goal) )` (`docs/ai-native-pipeline.md` §8.12 V1.5). A gauntlet adds terms to that **minimum**: more doors on the ring can only keep or **lower** par at equal board area. The player pays *reading* cost (≥ 6 doors + ≥ 6 switches) and receives *no* decision cost. Measured, not asserted: door count saturates — arity 2 → 16, arity 3 → 18, arity 4 → 18. Grind, not escalation. The sealed landing forces a **mandatory second press** — the precise thing the census proved the seal cannot do — converting "open the cheapest door" into a two-act plan. The genuinely fun Aha (**"传送门没有抄近路，它给我换了一个起点。"**) does not exist anywhere in the gauntlet.
- **Player Comprehension (2) — one visible cause vs. a wall of identical doors.** The sealed landing's causal chain is a single spatial story the board can *show*: portal → pocket → its only exit is a door. The gauntlet needs ≥ 12 objects on 42 tiles read at R-L2's 44 px touch floor; §1's hard 7-cap and `docs/ui-ux.md`'s board-width legibility discipline exist exactly against this. And the gauntlet's only *new* read ("the path into the switch is itself gated") must be **inferred from clutter**, whereas §9 requires the board itself to be the teacher.
- **Puzzle Depth (3) — ORDER is a new dimension; COUNT is the saturated one.** The gauntlet escalates a quantity the census measured as saturating (18 → 18). The sealed landing adds **press order**, and it reuses the proven reusable unit — §6.1.4's rule: *the reusable unit is the plan shape, never the board* — so the fifth rung is a new **shape**, exactly as L18 (2→3 doors) and L19 (3→4) were. Redirected generously, the gauntlet's only defensible verb *is* press order ("the key is itself gated") — i.e. it is a **strictly worse delivery of the sealed landing's own verb**, with more area and less legibility.
- **Level Scalability (4) — bounded enumerable lattice vs. unmeasured, unbounded space.** The gauntlet's ≥ 6-door nested ring lies **outside** the census that was enumerated (arity ≤ 4 only) and has no measured ceiling; betting the par-20 rung on it is exactly the "padded fifth rung" R-003c refused. The sealed landing's lattice is bounded (one portal pair + a pocket + doors + switches) and enumerable by the same machinery `--stage=f` proved on 14 310 bare boards / 17 160 tuples.
- **Determinism, Testability, Cost (5–7).** The sealed landing reuses **only shipped semantics** — portal landing = ADR-0008 clause-3 embedded state; opposite-colour law (ADR-0009); one-switch-per-door; latch grade; no new core rule; ΔM = 0 (§6.2.2). New gates are cheap and mechanical (§6.2.6). The gauntlet would need a new nested-ring well-formedness gate *plus* an unmeasured ceiling.
- **Schedule yoke (comprehension):** a portal at L20 does **not** breach the schedule. M2 ships from L11; §5's L16–L25 block already promises "2-step lookahead" (game-design.md §8, unchanged since GD-007 V0.5) and that promise has never been delivered. L20 uses M2 as the **ordering device** — not as a new mechanic.

### 6.2.2 `ΔM = 0` — why no dip fires, and why the strict-rise ladder is not contradicted

The §6 dip law binds **only** `ΔM > 0` seams. The sealed landing is a new **verb** over already-taught vocabulary (M0 walls, M1 doors, M2 portals, M3 switches); it introduces **no mechanic unit**, so `ΔM(L20) = 0` and **no dip obligation fires**. The L16+ rung law therefore stands unchallenged: `par(L20) = l15Par + 2·(20 − 15)` and `D_exec` strictly rises. Stated as law because the naive reading ("new mechanism ⇒ debut ⇒ dip") contradicts the registered rung ladder and would force one of the two to break; the ruling is that this is a **composition**, not a mechanic.

### 6.2.3 Lattice constraints (what a SEALED LANDING board is)

On a 7×6 board under §1's caps:

1. **Exactly one opposite-colour portal pair** (ADR-0009 law; same-colour is a validator hard error), both ends visible from the start — the pair is part of the plan, never decoration.
2. **The landing end resolves into a pocket** that is *not on-foot reachable in the needed phase* without the portal — the Solver condition is symmetric to Aha #2's (§3): the walking-only subgraph has no entry into the pocket at the phase the plan needs.
3. **The pocket's only exit is a door** (M1). **No phase wall may form the exit** — F-L19-2 doctrine: a far-region phase wall makes its tile unstandable and the P4 coverage gate (42/42) fails; every blocker in this device MUST be an **openable door**.
4. **The ordered plan shape:** at least one shortest route executes **≥ 2 presses in a fixed order**, the second switch reachable only *after* the first door opens. This **breaks the census identity by construction** (≥ 1 seal tile that is *not* adjacent to the free far region).
5. `par(L20) = 20` **exactly** — the rung, `l15Par(10) + 2·(20 − 15)`.
6. `T ≡ R ≡ 0` and P4 coverage: `distinctPositions == width × height == 42/42`. The pocket is a **through-station**, never a dead pocket.
7. `switchRequired = "required"` is **expected but not decreed** — it is a measurement obligation on the candidate (L16–L19 measured all-OFF unsatisfiable 4/4).

### 6.2.4 Teaching beat (show, never tell)

L20 is the family's **first member at grade** — it must show the ordering before the family deepens it:

- Portal pair and the pocket's door are both visible from the start; the door reads closed; the switch on the greedy line (or ≤ 2 tiles off it).
- **Zero text** (L4+ text budget is none, §2; game-design.md §9). The board tells it: the player walks the obvious line, is taken by the portal — visibly not a wall — lands, sees the closed door as their **only** way out, and the phase has already flipped on the entering move, so the press must happen in the arrived phase.
- The sentence the player owns (kept out of the game): **"传送门没有抄近路，它给我换了一个起点。"** This is **Aha #3** — the portal **re-orders** the puzzle instead of shortening it.

### 6.2.5 Fail conditions and the two named comprehension risks

- No death, no timer, no move limit (unchanged, §4); `Restart`/`Undo` unlimited and penalty-free. Embedded states (arrival onto a solid tile = ADR-0008 clause-3 embedded state) are ordinary Solver nodes; **R = 0**, no dead states.
- **Named risk 1 — "the pocket reads as a trap."** A landing the player cannot walk out of may be misread as a bug or a punishment. Mitigations are structural (the exit door is visible and openable; unlimited Undo/Restart) and the measurement is Playtest Analyst territory: **M5 restarts and M6 undos on L20 vs L19 must not spike**; if they do, the device is re-designed, never re-labelled. Labelled **hypothesis**, not a claim.
- **Named risk 2 — the arrived phase may be the wrong phase to act.** Structural mitigation: the pocket's pressable object must be pressable in the phase the likely arrival produces, or both phases must present a legal action. The Solver proves ≥ 1 plan exists; comprehension requires the **first** plan to be visible.

### 6.2.6 Difficulty obligations (what the L20 board must prove to the Solver)

- **Rung:** `par(L20) = 20` **exactly** (§6.1.1's P2 shape extended; the generator already prints a rung pin and drops longer accepts).
- **Escalation:** `D_exec(L20) > 22.885157` (the registered terminal). Inside the acceptance region `D_exec = par + 3·B`, so with `par = 20` and `B` in the measured band `[1.2500, 1.6875]` this is **automatic**: `D_exec ∈ [23.7500, 25.0625]`, minimum margin **+0.864843**. The obligation is therefore to **select in-band `B`** (do not compound `l016`'s named 1.7000 excursion, F-L16-2) and to record the measured value; an out-of-band-low candidate is named and the ramp re-checked, never smoothed.
- **Block:** R-003c closed `L16–L19` with the explicit clause *"5-rung waits for a real L20 mechanism, not a padded one"* (`docs/project-status.md` item 86). With the mechanism ruled **and proven**, the block becomes **L16–L20 (5 rungs)** and `block-l1619-tail-ceiling` is re-registered against the newly measured L20 `D_exec`. **Order is load-bearing: mechanism + measurement first; the tail-ceiling number moves only after** — widening the terminal first is precisely the refit the gate forbids.
- **Existing gates:** the six block gates stay (`-rung`, `-grid-coverage`, `-device-existence`, `-escalation-cut`, `-b-band`, `-tail-ceiling`), 6/6 negative controls caught by name.
- **New sealed-landing gates:** **(g1)** pocket not on-foot reachable in the needed phase; **(g2)** the pocket's only exit is a door (no phase wall exit); **(g3)** an ordered ≥ 2-press shortest plan exists, second switch gated behind the first door; **(g4)** `switchRequired` measured (all-OFF unsatisfiable); **(g5)** the census identity is *broken* (≥ 1 seal tile not adjacent to the free far region). One negative control per new gate, under the §8.12 F-L16-3 discipline: expectations corrected **to measured names**, never widened to pass — a mutation that is ACCEPTED still fails the battery.

## 7. GD-009 published law — the 100-LEVEL ACT ARCHITECTURE (acts, families, bands, batches)

> Owner: **Agent 1 — Game Designer** · Tasks **GD-008 (RULING A)** + **GD-009 (RULING B)** · Date **2026-10-17**
> Status: **PUBLISHED LAW** (the architecture; every act beyond Act I still requires its own batch proof)
> Full record (both rulings, `Original Hypothesis → Problem → Change → Evidence → Result`): `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`
> Trigger: **USER U-001 order (3)** — "关卡开发到100关" (`docs/project-status.md` item 106).

### 7.0 What this section does and does not publish (integrity statement, read first)

`docs/level-difficulty.md` §3.5 deliberately publishes **no numeric `D`/`D_exec` target above the last
measured row**, and §6/§6.1 of this file keep that prohibition. §7 does not break it:

| Quantity | Published here? | Why |
|---|---|---|
| **par bands** per act | **YES — as law** | `par` is weightless, schema-enforced (`par == shortestSolution`), and already law at §6 / §6.1.1 (P1–P3) and in `policy.ts`. A band is a range, not a target number. |
| **`D_exec` bands** per act | **YES — but derived, not invented** | Each band is `[par_min + 3·1.2500, par_max + 3·1.6875]`: the measured `B` band (`docs/level-difficulty.md` §5.2, re-derived from L1–L15 every run, never widened) inside the **measured theorem** `T ≡ R ≡ 0 ⇒ D_exec = par + 3·B` (20/20). No new weight, no new metric, no new arithmetic. |
| Absolute `D` bands above L20 | **NO** | §3.5's silence is untouched; §3.1 withdrew exactly this mistake by name. |
| A promise that par 36 / ≥ 9-pocket landings / Act IV mazes are authorable | **NO** | Each is a **named census obligation** on the level lane (§7.4, §7.7). A claim without a census is not architecture, it is hope. |

Reused laws, unchanged: the checkerboard invariant (ADR-0009); entry-only solidity and never-crushed
(ADR-0008 rules 1–7); opposite-colour portals only; one switch per door below the XOR allowance; `T ≡ R
≡ 0`, no dead states (§4); the dip law on `D_exec` at `ΔM > 0` seams (§6); P1–P4 (§6.1.1); the
sealed-landing lattice (§6.2).

### 7.1 Move depth — `par`'s role after GD-008 (RULING A, pointer)

`par` stays exactly what §1 says it is: a Solver/difficulty field, the "perfect clear" reference,
**never** a fail condition. **RULING A adds a post-win STAR RATING** (`3★ ≤ par + k1`, `2★ ≤ par + k2`,
`1★` any finish, best run persisted locally; `k1 = 2·⌈par/10⌉`, `k2 = 2·k1`) and **refuses the hard
move cap** — a cap would create `R > 0` states, contradicting §4 and repricing every published
`D_exec` row. The star is a **read-only consumer** of `par`: no level data changes, no gate reads it,
the in-play HUD is unchanged (`moves N` only; GD-OQ1's live-HUD refusal stands — the star is post-win).
Thresholds, HUD render, persistence row and the Playtest protocol live in `docs/game-design.md` §14.2
and **ADR-design-0005**; they are not duplicated here.

### 7.2 The acts (100 levels = 5 acts × 20; batches of 5 within an act)

Mechanism families use **locked vocabulary only** — phase walls, doors, switches, portals, under entry-only
solidity, determinism and never-crushed. No family may introduce a new rule; a family is *furniture on
the same physics*.

| Act | Levels | Mechanism family (variety, **not** depth) | par band | `D_exec` band (derived) | batch size |
|---|---|---|---|---|---|
| **I** | **L1–L20** *(SHIPPED — the tutorial spine)* | M0 walls → M1+M3 latch unit → M2 portals → M4 **composition** (sealed landing, §6.2) | **4–20** (the rung ladder, measured) | **9.00–24.73** (measured, 20/20) | done (4 × 5) |
| **II** | L21–L40 | **Portal orchestration**: multi-pocket sealed landings (2–4 pockets), ordered multi-switch chains, portal-repriced latches; the walk-only world deleted from the outset | 16–24 (plateau) | [19.75, 29.06] | 5 |
| **III** | L41–L60 | **Both-pair objects**: two opposite-colour portal pairs live in one plan (opposite-colour law per pair), doors re-priced by both, approach-side asymmetry deepened (Aha #2 at scale); the rare review-flagged **XOR multi-switch door** may appear (moved here from §8's L36–L45 allowance) | 20–28 | [23.75, 33.06] | 5 |
| **IV** | L61–L80 | **Phase-maze**: M0 wall-echo mazes where the same tile answers by approach side, both-pair objects inside larger geometry; **gauntlet-shaped boards (≥ 6-door rings) are permitted here as FLAVOUR only** — GD-007 rejected the gauntlet as a *rung* because extra ring doors are terms in the census `min` (they cannot raise par at equal area: saturation 16→18→18), but "cannot escalate" is not "cannot vary" | 24–32 | [27.75, 37.06] | 5 |
| **V** | L81–L100 | **Synthesis & density**: recombine the censused families at their proven arity ceilings; zero new mechanics; **L100 = FINAL EXAM** (Act V peak on both axes; §8's `L50` role re-mapped to a `Midterm` gate at the Act III midpoint — ADR-design-0005) | 28–36 | [31.75, 41.06] | 5 |

Batch = the level lane's **proofing unit**: 5 levels sharing one plan shape and one lattice family,
proven as a set before any of them is registered (a batch split across an act boundary is invalid).
Board caps are §1's (≤ 7×7; `8×8` only with Orchestrator approval, R-L2 conditions).

> **Band notation (GD-011, §7.9 — read this before using any number from the table above).** Every
> `D_exec` band in the table is **printed as a display rounding** of a **derived-exact** value
> (`[par_min + 3·1.2500, par_max + 3·1.6875]`). Act II's band is therefore
> **`[19.75, 29.0625]`**, *printed* `[19.75, 29.06]`; Act II's `par` band is **`16–24` inclusive**.
> **Act III's band is `[23.75, 33.0625]`**, *printed* `[23.75, 33.06]` (GD-012, §7.10.1); Act III's
> `par` band is **`20–28` inclusive**. **Act III's first half (`L41–L50`) carries its own derived
> ceiling `par ≤ 26`, with `par 27` inadmissible** (GD-013 / ADR-design-0009, §7.10.6 B3: the act band
> is the **outer range**, never a per-rung licence), so a rung's admissibility is read **batch by
> batch** against that half's rule. Bands are **inclusive at both ends** and are **derived from
> the formula, never read back from rounded text**. §7.9 states the law and its blast radius; it
> binds every gate, census filter and relief label in this file.
> **Act IV's band is `[27.7500, 37.0625]`**, *printed* `[27.75, 37.06]` (GD-016, §7.11.1) — the
> published growth law applied (`[23.7500, 33.0625] + 4`, and identically
> `[24 + 3·1.2500, 32 + 3·1.6875]`, both readings agreeing to the last digit); Act IV's `par` band is
> **`24–32` inclusive**: **the act spans `L61–L80` (§7.2, four batches of five — not `L61–L70`, which
> is its first half)**, **its first half (`L61–L70`) carries its own derived scope `par ≤ 30`, `par 31`
> inadmissible and `par 32` reserved** (GD-016, §7.11.3, a read-out of §7.10.2's O3), **its `act-close`
> carrier window is `L71–L80`** (§7.3.2's own text: an act's **last two batches**), and **every Act IV
> ladder value is even** (`par ≡ ACT_IV_PAR_FLOOR (mod 2)` — §7.11.1, the `par 31`/`par 33` refusal's
> instrument).

### 7.3 The act-scale tail law (the one law this architecture changes)

**Within an act, nothing changes.** No dip without `ΔM > 0` (§6); `Δpar ≥ 2` between consecutive
members (P2, §6.1.1); no padded pars — par stays ≤ the board's tile count and every teaching-span-grade
route keeps P4 coverage (§6.1.1); the block-end clause still binds when a block's tail is claimed.

**Across acts, the obligation moves from the rung to the act** — the previous "every block-open must
clear the previous peak" reading cannot be satisfied 20 times over without padding, which the gates
forbid (Evidence: item 86(a) census saturation; P3(a)+P4 par-is-bounded-by-the-board; the measured
accept-share cliff 0.5 % → 0.03 % by par 10; `docs/level-difficulty.md` §3.5).

- **`act-peak` clause (new, machine-checkable):** act *n*'s **measured maximum** `D_exec` strictly
  exceeds act *n−1*'s measured maximum. Act I's registered peak is **24.729412** (L20) until a batch
  measures higher inside Act II.
- **Interior freedom:** a member of an act sits anywhere inside the act's `D_exec` band, in any order
  (variety). An act may therefore open **below** the previous act's peak. That is a **plateau
  relaxation at a `ΔM = 0` boundary**, honestly labelled — it is **never** presented as a dip (a dip is
  a `D_exec` event at a mechanic introduction, §6), and it is never an excuse to drop a level out of
  its band.
- **Bands are ranges, and the range is the law:** a candidate outside its act band is **rejected**, not
  re-banded. Moving a band is a design change (this file + an ADR), never a generation outcome.
- **No new seam without a ruling:** any future `ΔM > 0` (a genuinely new mechanic) re-activates §6's
  full dip law and needs a Game Designer ruling + ADR before authoring — it cannot be smuggled in as
  "Act VI".

#### 7.3.1 Relief labels — PRE-PUBLISHED FORM, and the two named instances (GD-010)

**Why this exists (the process law, not the prose).** R-004a set the precedent and LV-008 set the older
one: a law lands **before** the bytes it judges (LV-008's acceptance contract was frozen before any L11
candidate existed; R-004a labelled the L20→L21 relief *at registration*, in the same artifact that
registered the rung). RV-012's finding (`docs/project-status.md` item 129) is that Act II batch 2's
interior relief was **labelled after the transfer** — measured `−6.044410`, lawful by the clause above,
but with **no artifact pre-publishing the label** the way the precedent demands. This sub-section fixes
the *order*, not just the instance: the label **form** is published once, and every further relief is a
**fill-in against it**, never fresh prose written after a number lands. A relief that has no
pre-published label is **not registrable**.

**The form (binding on every future relief, all acts):**

> **RELIEF LABEL — `[kind]` seam `[level_prev]`→`[level_next]` · `ΔD_exec = [value]` · band `[lo, hi]`.**
> This is an **interior relaxation at a `ΔM = 0` boundary, on the execution axis only — never a dip,
> and never a claim of lower felt difficulty.** §6's dip law does **not** fire: no mechanic is
> introduced, so the seam is §7.3 interior freedom and nothing else. It **discharges no clause and
> satisfies none**: the `act-peak` clause rides on the act's **measured maximum**, never on a relief.
> It asserts nothing about the felt half — `D_exec` is **blind to comprehension** (`M`/`T` are not in
> it), so any claim about how the seam *reads* to a player is a **labelled Playtest hypothesis**
> (§7.3.3), never an asserted ease. If the relief is an artifact of a **measurement design** (e.g. a
> par mirror held constant to isolate one variable), the label **says so** — a measurement instrument
> is not a designed rhythm.

Nine instances, listed in **seam order** — the register is **monotone by seam position**, not by the
order the rulings happened to be written (corrigendum **GD-012b**, changelog *V1.4b*: an earlier
`V1.4` row numbered the `L40→L41` act-open label "instance 4" while the `L35→L36` seam was already
being cited as the fourth instance by the registration ticket — the seam order below is the register's
order). Each is named with the constants the law files may carry:

1. **`act-open` · L20→L21 · `ΔD_exec = −3.148017` · band `[19.75, 29.06]`** — registered by R-004a
   (`L21 = 21.581395` under `L20 = 24.729412`); constants `ACT_II_B1_OPEN_RELIEF_LEVEL_ID` / `_EXEC`
   (`21` / `21.581395`) already exist. **Unchanged by GD-010** — recorded here only so both instances
   are read under one form.
2. **`batch-seam` · L25→L26 · `ΔD_exec = −6.044410` · band `[19.75, 29.06]`** — Act II batch 2's
   interior seam, **PRE-PUBLISHED HERE as the exact text R-005 must cite at registration** (the batch
   is solver-proven and ON THE SHELF; the bytes have not moved). Registration-side constants for the
   law files: `ACT_II_B2_SEAM_RELIEF_LEVEL_ID = 26`, `ACT_II_B2_SEAM_RELIEF_EXEC = 21.560241`,
   `ACT_II_B2_SEAM_RELIEF_DELTA = −6.044410` (`L25 = 27.604651` registered). The full label, verbatim:

   > **RELIEF LABEL — `batch-seam` seam L25→L26 · `ΔD_exec = −6.044410` · band `[19.75, 29.06]`.**
   > Interior relaxation at a `ΔM = 0` boundary, on the execution axis only — **never a dip, never a
   > claim of lower felt difficulty, and never the thing that satisfies a clause.** §6 does not fire:
   > no mechanic is introduced (`ΔM = 0`) — the fenced **3-pocket / forced 4-press** chain
   > (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4`) is **variety inside §7.2's Act II family**, one door
   > deeper than batch 1's 3-press device. `act-peak` rides on the act's measured maximum (L25
   > `27.604651`), never on this relief. **The relief is largely an artifact of the measurement
   > design:** batch 2 **mirrored** batch 1's pars on purpose (equal-par comparators for the one
   > variable, chain length — published pre-run, git-dated before the run), so the `par` term is held
   > identical by construction and the `B` term moves by ≤ 0.0239; the label therefore asserts **no**
   > ease the instrument cannot see — the batch-2 device carries a **longer** ordered chain (4 presses
   > vs 3) and `D_exec` is **blind to comprehension** (`M`/`T` are not terms in it), so *how the seam
   > reads* — mastery rest or deflation — is a **labelled Playtest hypothesis** (§7.3.3), not a result.
   > The mirrored pars are **not** a designed repetition of batch 1's climb; they are the measurement
   > instrument's control.

3. **`batch-seam` · L30→L31 · `ΔD_exec = −4.362098` · band `[19.75, 29.0625]`** (printed
   `[19.75, 29.06]`; §7.9's notation law) — **Act II batch 3's** interior seam, **PRE-PUBLISHED BY
   LV-015 BEFORE `--write`** (census/label commit `3f460b6` → the label in published form before the
   five bytes at `b35cdc8`; dossier §8.20) — the **first label in this file written while *neither*
   side is registered** (L31 is a batch-3 shelf rung, L30 a batch-2 shelf rung). Registration-side
   constants for the law files: `ACT_II_B3_SEAM_RELIEF_LEVEL_ID = 31`,
   `ACT_II_B3_SEAM_RELIEF_EXEC = 23.204167`, `ACT_II_B3_SEAM_RELIEF_DELTA = −4.362098`
   (`L30 = 27.566265` shelf-side, batch 2's measured maximum). **GD-011 blesses this text for
   R-006 to cite verbatim**, with **one notation-only amendment** — the band is written
   **derived-exact** with the printed form in parentheses, per §7.9 — and **no number LV-015
   published pre-write is changed** (`Δpar −4`, `3·ΔB −0.362098`, `ΔD_exec −4.362098` are cited
   unchanged; the amendment was made **before registration**, so the law-before-bytes order is not
   re-opened). The full label, verbatim:

   > **RELIEF LABEL — `batch-seam` seam L30→L31 · `ΔD_exec = −4.362098` · band `[19.75, 29.0625]` (printed `[19.75, 29.06]`).**
   > Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip,
   > never a claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip
   > law does **not** fire: no mechanic is introduced (`M` is 4 on both sides), and the fenced
   > **4-pocket / forced 5-press** chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`) is
   > **variety inside §7.2's Act II family**, one pocket group deeper than batch 2's 3-pocket device.
   > `act-close`/`act-peak` ride on the act's **measured maximum** (L35 `28.339426`), never on this
   > relief. **The relief is largely an artifact of the measurement design:** batch 3 derives its own
   > par set to **avoid** mirroring batch 1 (`[19, 22, 22, 24, 24]`, anti-mirror clause §7.8 item 4,
   > published pre-run), so the `par` term drops by **4** by construction, and the deeper device
   > carries a **lower `B` centre** (`1.3500 … 1.4465`) — the label therefore asserts **no** ease the
   > instrument cannot see, and `D_exec` is **blind to comprehension** (`M`/`T` are not terms in it),
   > so *how the seam reads* is a **labelled Playtest hypothesis** (§7.3.3; `NOT TESTABLE, n = 0`),
   > not a result. The batch's equal-par pairs **rise** (`+0.019191` / `+0.212483`), so no interior
   > label is owed anywhere else.

4. **`batch-seam` · L35→L36 · `ΔD_exec = −6.038144` · band `[19.75, 29.0625]`** (printed
   `[19.75, 29.06]`; §7.9's notation law) — **Act II batch 4's** interior seam, **PRE-PUBLISHED BY
   LV-017'S RULE 9 BEFORE THE CENSUS AND BEFORE ANY BYTE** (rule commit **`b9dac54`**, git-dated: the
   label is in the *rule* commit, which precedes the census and the five bytes — the strongest form of
   the law-before-bytes order this file has recorded). It is the **first label here published while
   *both* sides were unregistered** on the batch-4 side (L35 is batch 3's shelf rung, L36 a batch-4
   shelf rung) and it is **not yet registered**: it registers **with batch 4**, in in-flight
   **R-006a**'s train — the ticket already cites it as **this** instance, which is why the register's
   order below is by seam position. Its plants (the same text, not this file) are the candidates
   README, `docs/level-difficulty.md` and `docs/ai-native-pipeline.md` §8.24. Registration-side
   constants for the law files: `ACT_II_B4_SEAM_RELIEF_LEVEL_ID = 36`,
   `ACT_II_B4_SEAM_RELIEF_EXEC = 22.301282`, `ACT_II_B4_SEAM_RELIEF_DELTA = −6.038144`
   (`L35 = 28.339426` registered tail). The full label, verbatim, **quoted from the pre-published
   text — no number retyped from memory**:

   > **RELIEF LABEL — `batch-seam` seam L35→L36 · `ΔD_exec = −6.038144` · band `[19.75, 29.0625]`**
   > (printed `[19.75, 29.06]`; §7.9's notation law). Interior relaxation at a `ΔM = 0` boundary, on the
   > execution axis only — **never a dip, never a claim of lower felt difficulty, and never the thing
   > that satisfies a clause.** §6 does not fire: no mechanic is introduced (`ΔM = 0`) — the fenced
   > **4-pocket / forced 5-press** chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`) is the
   > **same device class** batch 3 registered, read on §7.4's **other frame** (`7×7`, `CX = 1`).
   > Decomposed so it cannot be read as a designed rhythm: **`Δpar = −6`** (L35 `24` → L36 `18`, the
   > dominant term), **`ΔB = −0.0127147` ⇒ `3·ΔB = −0.038144`** (from `B` `1.4337607` vs `1.4464753`;
   > the printed forms `1.4338` / `1.4465` / `−0.0127` are display roundings, §7.9), and their sum
   > **`ΔD_exec = −6.038144`** (`28.339426 → 22.301282`) — i.e. **the entire seam is the par term plus a
   > 0.6 % correction**, and `D_exec` is blind to comprehension (`M`/`T` are not in it). `act-close`
   > rides on the act's measured **maximum**, which this batch reports at L40 `28.455319` — never on
   > this relief.
   > **The relief is largely an artifact of the measurement design, and says so:** batch 4's ladder is
   > **derived** from the band endpoints and P2 (not mirrored), so its opening rung is `par 18` where
   > L35 sat at the act ceiling `par 24`, and the ladder *cannot* open higher without inventing a par
   > the derivation forbids. **How the seam reads** — mastery rest or deflation — is therefore a
   > **labelled Playtest hypothesis** (§7.3.3), not a result.

   > **Registration note (GD-012b).** The label above is **approved for verbatim citation by R-006a**,
   > with the same **notation-only** reading §7.9 imposes everywhere (the band is quoted derived-exact,
   > printed form in parentheses) and **no number the pre-published text carries is changed** — the
   > amendment precedes registration, so the law-before-bytes order is not re-opened.

5. **`act-open` · L40→L41 · `ΔD_exec ∈ [−4.705319, −1.392819]` · band `[23.75, 33.0625]`** — the
   **Act II→Act III** act-open seam, **PRE-PUBLISHED BY GD-012 BEFORE ANY ACT III BYTE EXISTS**
   (§7.10.4, ruling E; ADR-design-0008). This entry is the register's **index line only** — the full
   label text is **not duplicated here**; it lives at **§7.10.4** and the exact value is a
   **fill-in against that published form once L41's `par` is selected, never after the bytes**. It
   registers with Act III's first batch; until then it is pre-published and unregistered.
6. **`batch-seam` · L45→L46 · `ΔD_exec ∈ [−4.705319, −1.392819]` · band `[23.7500, 33.0625]`**
   (printed `[23.75, 33.06]`; §7.9's notation law) — **Act III batch 2's** interior seam,
   **PRE-PUBLISHED BY GD-013 BEFORE THE `L46–L50` CENSUS AND BEFORE ANY BYTE** (§7.10.7;
   ADR-design-0009). The bound is the **union** of `L46` at `par 22` ⇒ `[−4.705319, −3.392819]` and at
   `par 24` ⇒ `[−2.705319, −1.392819]` (B1's anchor, then B6's descending-fill fallback), always with
   the `par` term shown beside it (`−4`, then `−2`) and never folded in; its exact value is a
   **fill-in against the published form before the bytes**. This entry is the register's **index
   line** — the full label text lives at **§7.10.7** and is **not duplicated here**. Registration-side
   constants proposed: `ACT_III_B2_SEAM_RELIEF_LEVEL_ID = 46`,
   `ACT_III_B2_SEAM_RELIEF_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed** to
   `ACT_III_REGISTERED_TAIL_LEVEL_ID/_EXEC` (`45` / `30.455319`), `ACT_III_B2_SEAM_RELIEF_DELTA_RANGE
   = [−4.705319, −1.392819]`; the exact `_EXEC` / `_DELTA` are filled **only after selection and
   before the bytes**. **The bound is numerically identical to instance 5's and the value must not
   be** — the identity is the published `+2` shift (`22 − 30.455319 = 20 − 28.455319 = −8.455319`),
   i.e. a checkable arithmetic fact, while instance 5's `−4.197990` belongs to `L41`'s `B` (`1.4191`)
   and quoting it here would cite a different board.
   **This instance also carries the register's new admissibility test (GD-013 / ADR-design-0009,
   §7.10.7):** a `ΔM = 0` seam is a **registrable relief iff its `par` term is negative**
   (`ΔD_exec = Δpar + 3·ΔB`, `Δpar < 0`). A seam with `Δpar = 0` is **not a relief** — its residue is
   `3·ΔB`, bounded by `3·(1.6875 − 1.2500) = 1.3125`, and is published as an **instrument reading**
   (the LV-017 interior-minima precedent), never labelled. Every instance above (1–5) has a negative
   `par` term, so the test **describes** the register rather than narrowing it.
7. **`batch-seam` · L50→L51 · `ΔD_exec ∈ [−2.667021, −1.354521]` · band `[23.7500, 33.0625]`**
   (printed `[23.75, 33.06]`; §7.9's notation law) — **Act III batch 3's** interior seam,
   **PRE-PUBLISHED BY GD-014 BEFORE THE `L51–L55` CENSUS AND BEFORE ANY BYTE** (§7.10.10;
   ADR-design-0010). This entry is the register's **index line only** — the full label text lives at
   **§7.10.10** and is **not duplicated here**; the exact value is a **fill-in against that published
   form once `L51`'s `par` is selected, never after the bytes**. Its bound is a **single half, not a
   union**: `L51` at `par 24` (B1's anchor) ⇒ `[−2.667021, −1.354521]`, `par` term `−2`; the `par 26`
   fallback has `Δpar = 0` and is therefore **not a relief at all** (§7.10.7's test) and is published as
   an **instrument reading**. The comparator is **`L50 = 30.417021`** — batch 2's shelf maximum, which is
   **below** the registered tail `30.455319 @ L45`, so this instance's left side **pins the batch-2 tail
   constant's published values as literals at registration** (`50` / `30.417021` — the **PIN-LITERAL**
   register form, GD-014b / ADR-architecture-0006 §17.4) and **never** `ACT_III_REGISTERED_TAIL_*` (a different board by
   `0.038298`). Registration-side constants proposed: `ACT_III_B3_SEAM_RELIEF_LEVEL_ID = 51`,
   `ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION/_EXEC_AT_REGISTRATION` (`50` / `30.417021`),
   `ACT_III_B3_SEAM_RELIEF_DELTA_RANGE = [−2.667021, −1.354521]`. It registers **with batch 3**, in that
   registration train — until then it is pre-published and unregistered. The instance carries the
   register **rider** (the `par`-term-negative RISE) and the finding **`F-GD014-1`** (a registered label's
   left side is a published number and may not move) at §7.10.10.
8. **`batch-seam` · L55→L56 · `ΔD_exec ∈ [−3.3125, −0.6875]` · band `[23.7500, 33.0625]`** (printed
   `[23.75, 33.06]`; §7.9's notation law) — **Act III batch 4's** interior seam, **PRE-PUBLISHED BY GD-015
   BEFORE THE `L56–L60` CENSUS AND BEFORE ANY BYTE** (§7.10.12; ADR-design-0011). This entry is the
   register's **index line only** — the full label text lives at **§7.10.12** and is **not duplicated
   here**; the exact value is a **fill-in against that published form once `L56`'s `par` is selected,
   never after the bytes**. It is the register's **first COMPARATOR-FREE bound**, and that is a property
   the lane can check in one line: with `Δpar` **fixed by derivation** (`L56` at B1's anchor `par 26`;
   `L55` at batch 3's closing `par 28` — both `par` values are **law**, not selections), the bound is
   `Δpar + 3·ΔB` with `ΔB ∈ [−0.4375, +0.4375]` ⇒ **`[−3.3125, −0.6875]`**; **no measured left-side value
   enters it**, because `|3·ΔB| ≤ 3·(1.6875 − 1.2500) = 1.3125 < |Δpar| = 2` fixes the **sign** by the
   published band alone (instances 1–7 all needed a comparator's number; instance 8 needs only that the
   comparator is **in band**). It is a **single half, not a union**: B6 has **no non-flat fallback at
   `ℓ = 4`** — the post-truncation window is `{26, 28}`, so removing either value leaves a **singleton** ⇒
   a flat batch ⇒ **STOP-AND-ROUTE** (§7.10.11 B6). Registration-side constants proposed:
   `ACT_III_B4_SEAM_RELIEF_LEVEL_ID = 56`,
   `ACT_III_B4_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION` / `_PREVIOUS_EXEC_AT_REGISTRATION`
   **pin-literals** (`55` and `L55`'s registered value — **never** `ACT_III_REGISTERED_TAIL_*`: this seam
   is the **first whose left side would be wrong on the day it was written**, because batch 3's own
   registration is what moves the act tail off `L45`), `_DELTA_RANGE = [−3.3125, −0.6875]`,
   `_ADMISSIBLE_FIRST_RUNGS = [{ par 26, [−3.3125, −0.6875] }]`. It registers **with batch 4**, in that
   registration train — until then it is pre-published and unregistered. The instance carries the register
   finding **`F-GD015-1`** (a bound that needs no comparator still owes a **pinned** one at the fill-in, so
   the register form's two-board reading stays true) at §7.10.12.
9. **`act-open` · L60→L61 · `ΔD_exec ∈ [−5.3125, −2.6875] (at par 24) · [−3.3125, −0.6875] (at par 26)` ·
   band `[27.7500, 37.0625]`** (printed `[27.75, 37.06]`; §7.9's notation law) — the **Act III→Act IV**
   act-open seam, **PRE-PUBLISHED BY GD-016 BEFORE ANY ACT IV BYTE EXISTS** (§7.11.4; ADR-design-0012).
   This entry is the register's **index line only** — the full label text lives at **§7.11.4** and is **not
   duplicated here**; the exact value is a **fill-in against that published form once `L61`'s `par` is
   selected, never after the bytes**. It is the register's **first COMPARATOR-FREE `act-open` bound** — and
   the reason is checkable: with `Δpar` **fixed by law** on both sides (`L60` at §7.10.11's closing `par 28`;
   `L61` at O1/B1's Act IV floor anchor `par 24`, or `par 26` on O5's one admissible rising fill), the bound
   is `Δpar + 3·ΔB` with `ΔB ∈ [−0.4375, +0.4375]` and **no measured left-side value enters it** —
   `|3·ΔB| ≤ 1.3125 < |Δpar|` fixes the **sign** from the published band alone. It is **TWO HALVES, never a
   hull** (a fill-in inside `[−5.3125, −0.6875]` but in neither half is **outside** the label). Unlike
   instance 5 — the register's other `act-open`, which needed `L40 = 28.455319` as a comparator — this one
   needs only that both boards are **in band**. Registration-side constants proposed:
   `ACT_IV_B1_OPEN_RELIEF_LEVEL_ID = 61`,
   `ACT_IV_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION` / `_PREVIOUS_EXEC_AT_REGISTRATION`
   **pin-literals** (`60` and `L60`'s registered value — **never** `ACT_III_REGISTERED_TAIL_*`: whether that
   symbol points at `L60` depends on §7.10.13.3's rank comparison, so an alias would be correct only
   **contingently**, which `F-GD015-1`'s rule forbids), `_DELTA_RANGE = [−5.3125, −0.6875]` (hull, **for
   lookup only**), `_ADMISSIBLE_FIRST_RUNGS = [{ par 24, [−5.3125, −2.6875] }, { par 26, [−3.3125,
   −0.6875] }]`. It registers **with Act IV's first batch**, in that registration train — until then it is
   pre-published and unregistered. The instance carries **three self-voiding clauses** (the dilation
   conditional; the `L60` left-side conditional that makes the label **VOID as published** if Act III's
   batch 4 is B6-STOP-gated; and the `F-GD015-1` pin duty) at §7.11.4.

#### 7.3.2 The ACT-CLOSE PEAK clause (new law; ADR-design-0006)

**Original hypothesis.** §7.3's `act-peak` clause (the act's *measured maximum* must exceed the previous
act's) says nothing about **where inside the act** that maximum sits — interior freedom was published to
protect variety, and correctly so.

**Problem.** Act II measured it: batch 1 registered a rising ladder to `27.604651` at **L25**, and batch
2 (shelf) mirrors it at `−0.02…−0.07` `D_exec`, so the act's maximum would sit **mid-act** while its last
five rungs re-climb to `27.566265` — a second half that is *numerically* a photocopy of the first, at
five already-shipped pars. Lawful, but it makes every act **end on its own plateau** and leaves
`1.455349` of the act's derived band headroom unused; Act III then has to open against a base no higher
than its predecessor's midpoint (`docs/level-difficulty.md` §5.2 V1.3/V1.5; RV-012, item 129).

**Change (one clause, generalised to every act, machine-checkable).**

- **`act-close` clause.** An act's registered **maximum `D_exec` must be carried by its last two
  batches** (for Act II: L31–L40). The act's true peak therefore lands late, and the `act-peak` clause
  of §7.3 is read against a tail peak, not a midpoint peak.
- **What it does *not* do.** It is **not** a per-rung climb. Every per-rung and per-block rule is
  untouched: no dip without `ΔM > 0`, no padded pars, `Δpar` windows as measured, interior members free
  in the band, and an act's opening rungs may still sit below the previous act's peak — as a labelled
  **relief** under §7.3.1. One peak per act, carried late; the interior stays free.
- **Escape hatch (honest, never silent).** If the census shows the family's ladder **cannot** reach a
  closing peak without padding, the shortfall is **reported as a named act limitation** (with the
  measured class ceiling beside it), the batch still registers **only** proven members (§7.5's
  no-caveat rule is untouched — the caveat is on the act's shape, never on a board's proof), and the
  gap rides into the next act's band arithmetic as a named input. Never smoothed, never faked.
- **Falsifiable:** the closing batch's measured maximum is the number that fires or fails this clause;
  a batch whose members are all below the act's current maximum fails it by measurement.

**Evidence.** Item 129 (RV-012: the second-half duplication and the unlabelled `−6.044410`); item 124
(batch 1 registered, L25 `27.604651`, Act I peak `24.729412`); `docs/level-difficulty.md` §5.2 V1.3/V1.5
(both ladders, the per-par windows, headroom `1.455349`); ADR-design-0005 §7.3 (the law this rider
amends) and ADR-design-0001 (withdrawn-not-refit); §7.4 (the named open axes batch 3 can spend).

**Result.** The sawtooth keeps its meaning — **peak → breath → re-climb** — but the re-climb of the
**last** batch ends **above** the first peak, so an act reads as a shape with a culmination rather than
as one long plateau. No register moves, no par changes, no board is re-stamped; the obligation lands on
**unauthored** bytes (L31–L40) only.

> **RIDER — the ACT-MAX RANK law (GD-015, dated 2026-10-20; ADR-design-0011).** The clause above fixes the
> **place** of an act's maximum (its last two batches) and says nothing about the **rank order inside that
> place**, so this rider answers the residual question in the clause's own form: an act's **closing batch's
> maximum is the act's maximum wherever the pool permits the selection** — checked **before the bytes** by
> comparing the act's closing rung against the highest registered rung **outside** the closing batch (Act
> III: `L60` vs `L55`; both `par 28`, both B5 closing-rung maxima of **disjoint pools of one class**, so the
> comparison is one line and the band cannot decide it — see §7.10.13). Where the pool does **not** permit
> it, the inversion is **published as a NAMED act limitation with both measured numbers** — this clause's own
> **escape hatch, inherited verbatim** — and is **never** repaired by padding, re-anchoring, by rejecting a
> proven board, or by a caveat on a board's proof (§7.5 untouched). **What it does not do:** it discharges no
> carrier (`act-close` and §7.3's `act-peak` still ride on the act's **measured maximum**, exactly as
> before), it is **not** a per-rung climb, it adds **no** §7.3.1 relief (a rank is not a seam), and it moves
> **no** published number. **Nothing in this clause's text above moves.** Full derivation — the `par 28`
> class's `1.3125` reachable span, the plateau-top reading, the three admitted options and the two refused —
> at **§7.10.13**.

#### 7.3.3 The falsifiable Playtest ask (Act II's relief reading — GD-010)

**The question the lens owns:** a player who has just beaten **L25** (the act's registered peak) meets
**L26** — a *smaller* board (`par 17` vs `23`) carrying a *longer* ordered chain. Is that a **mastery
rest** (the same par family, a new mechanic expression, the star chase meeting fresh boards) or a
**deflation** (the hardest board is behind them and what follows recycles it)? The metric cannot answer
this: `D_exec` is blind to comprehension. So it is asked, pre-registered, with the thresholds frozen
before the cohort (T6; the row lives in the Playtest lane's star-era instrument —
`docs/playtest-analysis/star-era-asks-readiness.md` STAR-1/STAR-5, which today reads **NOT TESTABLE,
n = 0**).

> **ASK (one line, star-era archives):** on the five equal-par mirror pairs — **L21↔L26 · L22↔L27 ·
> L23↔L28 · L24↔L29 · L25↔L30** — report **STAR-1 replay share** and **M5/M6** per rung (batch-2 side
> vs batch-1 side); **`mastery-rest` survives** iff the batch-2 member's replay share is **≥ its
> same-par comparator's** on **≥ 3/5** participants (paired), and **`deflation` is declared** on **≥ 2/5**
> showing a quit-within-the-next-level or a flat M5/M6-with-low-dwell pattern at the **L25→L26** seam —
> which fires the **C path** (below) **with its own ADR**, and never a silent re-tune of any number.

**The C path (pre-registered remedy, NOT adopted now).** If `deflation` is declared, the authorised remedy
is to move **Act II's registered maximum onto its tail** by selecting the par-23 class reach
**`27.746988`** (published unselected four times: item 128/129, `docs/level-difficulty.md` §5.2 V1.5,
`docs/ai-native-pipeline.md` §8.19) as the **L30**-slot rung — proven under §7.5 before registration,
with **its own ADR** (it supersedes the act's registered maximum basis and re-keys the law constants).
**Refused now, on evidence discipline:** adopting it today would be **fitting the curve to a desired
shape** with zero playtest data behind it — the exact practice ADR-design-0001 withdrew the old "2–3
points" margin for. **Taste — mine included — is not evidence (AGENTS §7).**

#### 7.3.4 GD-010's ruling on Act II batch 2 (registration shape)

| Option | Verdict | Grounds (one line each) |
|---|---|---|
| **(A) SHIP-AS-IS — batch 2 registers as VARIATION RÜNDS after batch 1's climb, relief labelled** | **ADOPTED** | The duplicated pars are the **measurement instrument**, not a designed repeat (§7.3.1 instance 2); the boards are mechanically distinct (clone guard 0/5 keys over 21 roots, one door deeper, 4-press chain), and `par` is invisible in play (GD-OQ1) — what the player repeats is a **par frame**, what they meet is a **new puzzle**. |
| **(B) RE-ORDER / INTERLEAVE at registration** | **REFUSED** | It cannot remove the relief (both batches span `par 17→23`, so *some* seam drops ~6), it would break the **index-keyed** published mirror (`ACT_II_B1_LADDER[i].par`, read from the law constant) and the prover's ladder mapping, and it buys no comprehension (§1). Registration order stays as authored; the level lane is not asked to price it. |
| **(C) PROMOTION — the act ends higher than 27.604651** | **DEFERRED, pre-registered as the remedy** | Correct **eventually** (§7.3.2 makes it an obligation for L31–L40 anyway), **wrong today**: no playtest data exists, so promoting now is curve-flattery (§7.3.3). It fires on the `deflation` signal, with its own ADR. |
| **(D) BATCH-3 STEERING — the act must not read as one plateau** | **ADOPTED** | Set explicitly in **§7.8**: a derived par obligation (par 24 ⇒ `D_exec ≥ 27.7500` from the measured `B` band) plus the `act-close` clause; the derivation introduces **no new number**. |

### 7.4 Generator lattice families (what the level lane censuses to build)

Each act is fed by a **named, bounded, enumerable** lattice stage, extending the shipped stage-P/stage-SL
tooling (`scripts/author-l20.ts`; `docs/ai-native-pipeline.md` §8.14). None is a search over "good
levels": each enumerates a construction class and filters by stated gates, so an accept is a
**measurement**, never a taste call.

| Stage | Act | Lattice (enumerated axes) | Builds |
|---|---|---|---|
| `P` / `SL` (shipped) + `--pocketsize ≥ 9` | II | pocket class × portal entry × pocket switch × goal × seal-switch tuple | Act II batches 1–2; **the ≥ 9-pocket class is F-L20-3's OPEN boundary** |
| `G` *(new)* | II | **multi-pocket**: pocket count 1–4 × portal pairs 1–2 × door arity 2–5 × landing position, on 7×6 → 7×7 | Act II batches 3–4 |
| `H` *(new)* | III | **both-pair**: two opposite-colour pairs (independently validated) × door re-pricing graph × seal arity; XOR-door variants flagged for review | Act III |
| `I` *(new)* | IV | **phase-maze**: wall-echo maze skeletons (M0) × both-pair objects × approach-side asymmetry | Act IV |
| `J` *(new)* | IV | **gauntlet-flavour** (≥ 6-door ring), bounded: census only, to *place* the device inside a band | Act IV flavour slots (never a rung) |
| *(no new stage)* | V | recombine `G`/`H`/`I` at their **proven** ceilings | Act V, incl. L100 |

**Clone guard (§6.1.4) is law on every stage:** the reusable unit is the plan shape, never the board —
a new member must differ in the stricter seal-inclusive geometry key
(`player|goal|portal-pair|seal-door-tiles`), and "perturb a shipped board" is not a lattice.

### 7.5 Proof obligations per batch (100/100 — no exceptions)

Before any member of a batch is registered, on the batch's landed bytes:

1. **Per level (Solver, program-of-record only):** validator `ok`, `errors 0`; `par == shortestSolution`;
   `T ≡ R ≡ 0`; `deadStates 0`; `noUnrecoverableOk true`; coverage clause satisfied where the grade
   requires it; **par ∈ act band**; **`D_exec` ∈ act band**; `B` inside the measured band `[1.2500,
   1.6875]` **or** a named excursion in the F-L16-2 form (named, recorded, never smoothed); the
   family's own gates (g1–g5 for landings, the seal battery for seal rungs, §6.1.3's G1–G4 for
   latch-bearing boards, the multi-switch-door warning where the XOR allowance is used);
   `switchRequired` read as a **measurement**, never an assertion.
2. **Per batch:** the plan shape is named; the `act-peak` clause is evaluated once the batch's measured
   peak exists; clone-guard pass; rejection histogram published with the accepts (an accept count with
   no refusal census is not evidence).
3. **Negative controls:** one per new gate, with its refusal name **measured before** the control's
   `expect` list is written (§8.12 F-L16-3 discipline: expectations corrected to measured names, never
   widened; a mutation that is ACCEPTED still fails the battery).
4. **Consumer sync, last:** dataset bytes → sidecar (`--report` against **shipped** levels only) →
   hand-typed `PINS` → `EXPECTED_LEVEL_COUNT` → registry → the batch's own test rows. **A level that
   fails any clause is rejected; there is no "registered with a caveat" path.**
5. **Registry is R-003-gated** (Gameplay Engineer + UI/Art legibility round), exactly as L12–L20 were:
   a batch that is solver-proven but not legible is not playable and does not ship.

### 7.6 CI and the P10 sampling policy (one paragraph — QA owns the mechanics)

The **full-census Solver gate stays full and cheap**: `npm run levels`, `solve-levels.ts --report`, the
sidecar/PINS/difficulty rows and the route audit cover **100/100 on every round in seconds**, so
solvability is never sampled. What does not scale is the **browser** lane: the unlock-chain e2e is one
serial walk whose cost is level-count × per-level settle, measured at **60.3 s of a held 360 s ceiling
at 20 levels** (`docs/project-status.md` item 92(b)) — at 100 levels it is hours by extrapolation and
cannot be the per-push gate (the same item 90(b) finding as `route-budget.test.ts:152`, where the
unpruned walk demand explodes 1.36M → 17.8M → 98.7M → **> 5×10⁸** against pruned 2162+7386). The
policy shape is therefore: **(a)** every new batch runs its **full** spec before merge — new content is
never sampled; **(b)** **boundary levels are always in** — L1 (cold start), every act boundary
(L20/L21, L40/L41, L60/L61, L80/L81), the newest rung and L100; **(c)** the interior is a **seeded,
deterministic stratification** by act × mechanism family × par band, sized to keep the chain row inside
its derived envelope and rotating so that **every level is walked within a bounded coverage horizon** of
rounds (a schedule, not a random draw); **(d)** the live lane (`tests/e2e-live/**`) samples the same
strata against the deployed artifact rather than walking the ladder; **(e)** the **full 100-level chain
runs at release/milestone certification**, not per push, and that gap is stated wherever the sampled
rounds are cited. The `route-budget.test.ts:152` prune decision (raise the derived budget vs. extend the
n-11 prune above L15) is this policy's first concrete case and belongs to QA.

### 7.7 Handoff — first batch (Act II, L21–L25): what to census next

**The level lane authors; GD writes no JSON and no scripts.** In order:

1. **Re-run stage P past the open boundary.** `--stage=p --pocketsize=10` (the pass F-L20-3 recorded as
   killed after 25 lines because an accept already existed at ≤ 8): measure the leak-free size histogram
   and the per-landing pocket counts (`5,1` went 12 → 40, `6,0` 12 → 40, `5,0` 3 → 13 in the aborted
   pass). **F-L20-3 closes or stays open by measurement — never by assumption**, and no ceiling claim
   about the landing device may be published either way.
2. **Only then the new `G` lattice** (multi-pocket, 2–3 pockets first) under the §6.2.3 lattice
   constraints verbatim: one opposite-colour pair per teleport (independently validated), the landing
   pocket **not on-foot reachable** in the needed phase, **every** blocker an openable door (no
   phase-wall exit — the F-L19-2 doctrine that protects P4 coverage), an ordered **≥ 2-press** plan,
   `T ≡ R ≡ 0`, and a **named plan shape** before the skeleton is searched.
3. **Rung/band pin for the batch:** par inside **16–24**; `D_exec` inside **[19.75, 29.06]**; the batch
   is graded against the act band, and **Act II's `act-peak` obligation** (strictly above Act I's
   measured 24.729412) is discharged by the act's measured maximum, reported per batch.
4. **Do not re-stamp L20.** The sealed landing's shipped geometry is a one-off fit (§6.1.4's
   `l12TemplateFamily` lesson: 512 enumerated candidates on a shipped debut's own skeleton, **0
   accepts**). Act II's first two batches must come from **new** skeletons under the same plan shape.
5. **Report the refusal census with the accepts**, and hand the batch to QA for the §7.6 stratum
   assignment before registry.

### 7.8 Handoff — Act II batches 3–4 (L31–L40): the CLOSING-PEAK obligation (GD-010)

**The level lane authors; GD writes no JSON and no scripts.** Batch 2 is on the shelf at batch 1's pars;
the act therefore has a **midpoint peak** (L25 `27.604651`) and no tail peak. Batches 3–4 exist to close
that, and every number below is **derived from already-published law** (§7.0) — no new target is
invented, and none of it promises an unauthored board is authorable.

1. **`act-close` obligation (§7.3.2).** Act II's registered maximum must be carried by **batch 3 or 4**
   and must **strictly exceed `27.604651`**. The closing batch carries the act's maximum. A closing batch
   whose every member is below the act's current maximum **fails the clause by measurement**.
2. **Par obligation — the derived route (no new number).** At least one batch-3 rung at **`par 24`**,
   Act II's own band ceiling (§7.2: `par 16–24`). Inside the **measured** `B` band `[1.2500, 1.6875]`
   the collapse `D_exec = par + 3·B` (the measured theorem `T ≡ R ≡ 0`) forces
   **`D_exec ∈ [27.7500, 29.0625]`** — i.e. **strictly above the registered peak by ≥ `+0.145349`**, with
   the window's top **being** Act II's derived ceiling `29.06`. That redeems the act's unused
   `1.455349` headroom without touching any weight, band or registered row.
3. **Named census obligation, never a promise.** LV-014's accept pool by par is `17:24 · 18:28 · 19:36 ·
   20:38 · 21:70 · 22:94 · 23:106` — it **tops at `par 23`**, so **`par 24` is in-band but unmeasured**
   in the `G` lattice: the batch must *measure* whether the class reaches it (§7.4's `G`: pocket count
   1–4 × portal pairs 1–2 × door arity 2–5, on 7×6 → 7×7). **No ceiling claim either way is publishable
   before that measurement** (§7.0).
   **Fallback if `par 24` yields no accept:** the already-published par-23 class reach **`27.746988`**
   (`+0.142337` over the registered peak) — which must pass §7.5 in full and, because it supersedes the
   act's registered-maximum basis, travels the **§7.3.3 C path with its own ADR**. *(**This ground was
   measured ABSENT** by LV-015 — `par 24`'s pool is non-empty, 130/2640 + 498/20000 — so the fallback
   is **falsified, not dormant**: see **item 7**, the C path's standing.)*
4. **Anti-mirror clause.** Batch 3 must **not** mirror batch 1's ladder again, and must not copy batch
   2's device. The mirror was a **one-off measurement instrument** (equal-par comparators, published
   pre-run) — repeating it converts a measurement into a formula and yields a third indistinct rung set.
   Batch 3 publishes **its own** par set inside `16–24` (the census's own pool supports `19` and `22`,
   neither yet used) and a device distinct in the stricter **§6.1.4 seal-inclusive key**. The named open
   axes available to it: the **4-pocket** member (§7.4's `pocket count 1–4`; LV-014 states it
   **unenumerated**, no completeness claim) and the **deferred `--pocketsize ≥ 11` probe** (≤ 10 closed
   by measurement, ≥ 11 unmeasured).
5. **Any further relief is labelled BEFORE the bytes move.** If batch 3's opening rung sits below L30,
   that seam is another `ΔM = 0` interior relaxation and takes a §7.3.1-form label **published before the
   batch is authored** — the process fix RV-012 (item 129) demands, and the reason §7.3.1 publishes the
   *form* once. A relief with no pre-published label is **not registrable**.
6. **Report the refusal census with the accepts**, hand the batch to QA for the §7.6 stratum assignment
   before registry, and report the act's measured maximum per batch as §7.5 item 2 requires.
7. **The §7.3.3 C path — STANDING (GD-011).** Ruling: **KEPT ARMED for future acts; its Act II
   fallback ground is RETIRED by measurement.** Item 3 above pre-registered the C path **only** on the
   contingency *"if `par 24` yields no accept"*. LV-015 measured that pool **non-empty** — 3-pocket
   family at band `[24,24]`: **130 accepts of 2640 judged**, an **exact** count (no cap hit, budget not
   reached; `202` tuples at `par 24`, `D_exec ∈ [28.560241, 28.771084]`), and on the batch's own
   `CX = 1` frame: **498 accepts of 20000 judged** (published as a **floor**) — and the `act-close`
   clause was carried by the batch's **last rung** (`28.339426 > 27.604651`, **+0.734775**). A
   contingency whose condition is measured **absent** is **falsified, not dormant**: the C path may
   **not** be invoked on the par-24-absence ground it was registered against, and the par-23 reach
   `27.746988` is **not** a standing spare the act still owes itself. What **survives**: the C path
   stays **armed for a future act** whose own census measures a band-ceiling class unreachable, and
   stays armed for its **own §7.3.3 trigger** — the playtest `deflation` signal (≥ 2/5
   quit-within-next-level at the L25→L26 seam) — either use requiring **its own ADR** as published.
   **Retiring it outright is refused:** nothing about Act II falsifies the remedy's legality for an
   act that has not yet been censused, and deleting a pre-registered remedy on the strength of one
   act's census would be the mirror error of adopting it on zero data.

### 7.9 The BAND-ENDPOINT law (GD-011) — derived-exact values, inclusive ends, printed forms are display roundings

> Owner: **Agent 1 — Game Designer** · Task **GD-011** · Date **2026-10-17** · Status: **PUBLISHED LAW**
> (binds §7.2, §7.3.1, §7.5, §7.7, §7.8 and every future act; full record:
> `docs/decisions/design-0007-band-endpoint-law-and-c-path-standing.md`)
> Trigger: LV-015's escalated finding **F-L31-1** (`docs/project-status.md` item 134;
> `docs/ai-native-pipeline.md` §8.20; `scripts/prove-candidate-l3135.transcript.md` §0), ruled here
> **without editing ADR-design-0005 or ADR-design-0006**.

**Original hypothesis.** §7.0 published each act's `D_exec` band as a **derived** range
(`[par_min + 3·1.2500, par_max + 3·1.6875]`) and §7.2 printed the results in a table
(`[19.75, 29.06]`). The printed forms were then read as if they **were** the law's values — and, in a
variant dated by `git log -S` to **`849b6d4` (LV-012, 14:36)**, the band was additionally tested
**strictly** at both ends (`> [0] && < [1]`).

**Problem — two distinct defects, conflated inside one escalation.**

1. **Operator (the strict form).** A strict comparison refuses a rung standing **exactly on** a
   published ceiling — and the law **requires** such a rung. §7.2 writes Act II's `par` band `16–24`
   in the same notation it writes Act I's `4–20`, and Act I's ceiling `par 20` is **registered**
   (L20); §7.8 item 2 **mandates** a `par 24` rung and names it "Act II's own band ceiling", and
   `policy.ts`'s own `inParBand` is inclusive on the same constants, as is `scripts/author-l21.ts`'s
   census/selection filter (which is how this batch's own pool was filtered). A strict reading
   therefore refuses the value the same file requires: self-contradiction, not a reading.
2. **Value (the rounded constant).** Act II's stored `D_exec` ceiling is the **printed** literal
   `29.06`, while the derived-exact value is `24 + 3·1.6875 = 29.0625`. The `0.0025` gap is reachable
   **only** at `par 24` with `B > 5.06/3 = 1.6866̄`, inside the still-legal `B` band top `1.6875`. A
   gate comparing against the rounded text rejects a rung the law admits. (The same 2-dp reading is
   harmless where it is only notation: Act I's `D_exec` band top is measured, not derived, and
   `24.729412 ≤ 24.73` either way.)

**Verdict on LV-015's escalation, untangled (this is the part R-006/RV-013 needs).** The claim "if
the band is ruled **strict/open** at the printed `29.06`, batch 3's `L34`/`L35` **REJECT**" is
**TRUE in effect but WRONG in cause**: `L34` = `28.126943` and `L35` = `28.339426` are **strictly
inside `[19.75, 29.06]` under every reading**, so the `D_exec` ceiling never touched them. The
rejection came from the **`par` ceiling `24`**, compared **strictly** at
`scripts/prove-candidate.ts:239` (`stamped > ACT2_PAR_BAND[0] && stamped < ACT2_PAR_BAND[1]`) — an
integer law constant with **no rounding anywhere in it**. Two ceilings, two readings, two refutations:
the `par` ceiling is inclusive by four independent readings (constant + `inParBand` + the census
filter + §7.2's registered `L20` at Act I's ceiling), and the `D_exec` ceiling is `29.0625` by
derivation and only *printed* `29.06`. The claim's **second** half — "the act then closes **only** via
the C path" — is **FALSE as an absolute**: §7.3.2 places the carrier obligation on the act's **last
two batches**, so batch 4 (L36–L40) remains a legal `act-close` carrier; the C path is one route, not
the only one. (It is also moot: the strict reading is refused, so `L34`/`L35` stand and the act-close
is carried at `28.339426`.)

**Change — the law (binding, all acts, all gates, all censuses, all labels):**

> **§7.9 BAND-ENDPOINT LAW. A band is a range over DERIVED-EXACT values, and it is INCLUSIVE at both
> ends.** A band is computed from its formula — `[par_min + 3·B_lo, par_max + 3·B_hi]` for `D_exec`,
> the integer range for `par` — and is **never** read back from rounded text. Printed forms
> (`[19.75, 29.06]`, `16–24`, `4–20`) are **display roundings** of those values; a comparison against
> a printed form is a **defect**, and so is a strict (`<`/`>`) endpoint comparison. Concretely:
> **Act II's `D_exec` band is `[19.75, 29.0625]`** (printed `[19.75, 29.06]`) and a rung at
> `par 24` / `B = 1.6875` / `D_exec = 29.0625` is **in band**; a rung at `28.126943` and a rung at
> `28.339426` are in band under **either** reading, so an endpoint comparison may never be the thing
> that rejects them. **`par 24` is in band** (§7.2 `16–24`, inclusive).
> **Derive-from-formula; never compare against rounded text.**

**Corollary (stated so it cannot be silent).** Under this law the **stored** band constant must *be*
the derived value: a constant equal to a printed rounding is a **latent endpoint defect even while no
row sits in the sliver**, because §7.8 item 2's own mandate (`par 24` ⇒ up to `29.0625`) is then
unbuildable at its top. This ruling is **prose only** — it edits no `src/**`, no `scripts/**` and no
constant; the constant/operator alignment is **filed as a named follow-up for the Architecture,
Gameplay and Level/Solver lanes** (see the ADR's handoff). GD writes no code.

**Blast radius on published and measured rows (by name, under the ruled law):**

| Row (by name) | `D_exec` | Inside derived-exact `[19.75, 29.0625]`? | Verdict change |
|---|---|---|---|
| batch 1 **registered tail — L25** | `27.604651` | ✔ (inside under both readings) | **none** |
| batch 2 shelf max — **L30** | `27.566265` | ✔ (both readings) | **none** |
| batch 3 census top — 3-pocket, `par 24` | `28.771084` | ✔ (both readings) | **none** |
| batch 3 rung **L34** / **L35** | `28.126943` / `28.339426` | ✔ (both readings) | **none** (the `par` operator no longer refuses them) |
| Act I measured band top — **L20** | `24.729412` | ✔ Act I band `9.00–24.73` (measured, `24.729412 ≤ 24.73`) | **none** |

**No published row changes side; no registered row, band, weight, gate list, sidecar cell or board
byte moves.** The only rows whose verdict changes are **hypothetical and unmeasured so far**: (a) a
`par 24` rung with `B ∈ (1.6866̄, 1.6875]`, i.e. `D_exec ∈ (29.06, 29.0625]`, which the rounded
constant rejected and the law admits — **empty in every census run to date** (batch 3's par-24 reads
top out at `28.771084`); and (b) a rung standing **on** a ceiling, which the law admits and the strict
operator refused — exercised for the **first time** by batch 3's `par 24` (`act2-par-band`).

**Evidence.** LV-015's A/B receipt: pre-fix vs post-fix prover over **root L21–L25 and shelf
l026–l030** → **65 CAUGHT / 0 MISSED on both sides**, status surfaces differing in exactly one line
per set, no control changing verdict; `849b6d4` (LV-012, 14:36) dates the strict form ~7.5 h
**before** GD-010 (`ef643f7`, 22:06) published the par-24 obligation, and every Act II rung recorded
until batch 3 sits at `par 17–23`, strictly inside — so **the endpoint comparison had never been
exercised when the law that depends on it was written**; `docs/level-difficulty.md` §5.2 per-par
`D_exec` windows (batch 1 `21.581395…27.771654`, batch 3 `23.204167…28.339426`); the constants
`ACT_II_PAR_BAND [16, 24]` / `ACT_II_EXEC_BAND [19.75, 29.06]` and `inParBand` in
`src/core/solver/policy.ts`; §7.2's registered `par 20` ceiling (L20) and §7.8 items 2–3's mandate.

**Result.** §7.8 item 2's route is buildable **at its own ceiling**; the strict form is refused as the
outlier; and the act's band arithmetic keeps its published numbers — only their **reading** is fixed.
A printed band value may no longer be used as a comparison operand anywhere in this file or its law
constants.

### 7.10 GD-012 published law — the Act III band (derived-exact), the L41–L45 opener rule, Act III par/star totality, and the L40→L41 `act-open` relief pre-published

> Owner: **Agent 1 — Game Designer** · Task **GD-012** · Date **2026-10-18** · Status: **PUBLISHED LAW**
> (full record, `Original Hypothesis → Problem → Change → Evidence → Result`:
> `docs/decisions/design-0008-act-iii-band-opener-and-star-totality.md`)
> Trigger: Act II closes at **L40** — its final batch (`l036`–`l040`) is solver-proven on the shelf
> (LV-017, `docs/ai-native-pipeline.md` §8.24) and is being registered by the in-flight **R-006a** —
> and its tail is measured at **`28.455319`** against the Act II ceiling **`29.0625`**, i.e.
> headroom **`0.607181`**. Act II's band is **nearly topped out by design**; Act III therefore needs
> its **own** derivation, not an extrapolation.

#### 7.10.0 What this section does and does not publish (integrity statement, read first)

| Quantity | Published here? | Why |
|---|---|---|
| Act III's **`par` band** `20–28` | **NO — already law** | §7.2 publishes it (from ADR-design-0005 RULING B); this section **quotes** it and derives from it. |
| Act III's **`D_exec` band** | **YES — derived, not invented** | `[PAR_FLOOR + 3·B_lo, PAR_CEILING + 3·B_hi]` over the **measured** `B` band; no new weight, no new metric, no new arithmetic (§7.0). |
| The **opener's selection rule** (`L41–L45`) | **YES — as law** | A rule, not a search: an intersection of already-published clauses (§7.3.2, §6.1.1 P2, §6's comprehension rationale). Weightless (`par` is schema-enforced) and pre-runnable. |
| The opener's **`D_exec` values** | **NO** | They do not exist until the `H` census selects rungs; only the multiset rule is law. |
| Act III's **registered maximum** / per-rung numbers | **NO** | §3.5's silence above the last measured row is untouched; the act's peak is a **measurement** made when a batch lands. |
| A promise that `par 26` / `par 28` / the `H` lattice is authorable | **NO** | A **named census obligation**, never a promise (§7.0, §7.4). |

#### 7.10.1 The Act III EXEC band, derived-exact (§7.9 notation)

| Constant | Value | Derivation |
|---|---|---|
| `PAR_FLOOR` | **`20`** | §7.2's Act III `par` band, lower endpoint |
| `PAR_CEILING` | **`28`** | §7.2's Act III `par` band, upper endpoint |
| `B` band | **`[1.2500, 1.6875]`** | measured, re-derived from L1–L15 every run, never widened (§7.0) |
| `EXEC_FLOOR` | **`23.7500`** | `20 + 3·1.2500` |
| `EXEC_CEILING` | **`33.0625`** | `28 + 3·1.6875` |
| **Act III `D_exec` band** | **`[23.7500, 33.0625]`**, *printed* `[23.75, 33.06]` | inclusive at both ends (§7.9); both endpoints dyadic ⇒ IEEE-754 bit-exact |

Read-outs: Act III's band **translates Act II's by exactly `+4.0` on both ends** (`ΔEXEC = ΔPAR`
because both Act III endpoints move `+4`); the floor sits **`4.705319` below** Act II's closing rung
(`28.455319`), so the previous act's tail is **strictly inside** Act III's band — what §7.3 interior
freedom requires of an act that opens below the previous peak. The ceiling is a **derived readable
bound** (`par_max + 3·B_hi`), never a difficulty target (ADR-design-0008 RULING A).
**Act III's `act-close` carry window is `L51–L60`** (batches 3 + 4 of its four — `L41–L45 · L46–L50 ·
L51–L55 · L56–L60`): §7.3.2's carrier obligation lands there, read per batch once a batch's measured
peak exists (§7.5 item 2).

#### 7.10.2 The L41–L45 opener rule (six clauses — the level lane pre-runs this)

**Ladder (derived, not searched): `[20, 22, 24, 26, 26]`.** The derivation is an **intersection**, so
it is not an approval:

| # | Clause | Content |
|---|---|---|
| **O1 · ladder** | `L_i = PAR_FLOOR + 2·(i−1)`, `i = 1…5` | the P2-exact 5-member window (`20, 22, 24, 26, 28`) — LV-017's derivation (`§8.24`), same constants, applied to Act III's band |
| **O2 · ceiling reservation** | the derived top rung `par 28` is **withheld**; the 5th rung repeats the truncated top at its within-par **maximum** | multiset **`[20, 22, 24, 26, 26]`** |
| **O3 · why O2 is derived** | opener rungs have `D_exec ≤ 26 + 3·1.6875 = **31.0625**`; any `par 28` tail rung has `D_exec ≥ 28 + 3·1.2500 = **31.7500**` | **`31.7500 > 31.0625`** (margin `0.6875`) ⇒ §7.3.2's `act-close` is satisfiable **by construction** on `L51–L60` **regardless of the opener's realised `B`**. Consuming the ceiling destroys the guarantee — a measurement, not a preference |
| **O4 · anti-mirror** | the multiset must differ from **every** registered Act II batch's multiset (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`) and from every other Act III batch's | §7.8 item 4's discipline, generalised **across** acts; **coinciding pars are printed, never hidden** |
| **O5 · empty pool ⇒ ABSENT, never substituted** | a derived par absent from the `H` census pool is **absent**; no out-of-set par is substituted; the shortfall is absorbed by **within-par repeats at the highest available derived par** (LV-017's descending-fill convention, verbatim) | if fewer than five rungs can be populated from the truncated set, the batch **STOP-AND-ROUTES to GD** — it never silently extends to the ceiling |
| **O6 · within-par convention** | the **final rung** takes the within-par **maximum** `D_exec`; every earlier rung the **minimum** | LV-017 rule 4 / LV-015's tie-break; makes the batch's interior rise visible **without** claiming a clause |

**No `act-peak` / `act-close` branch for the opener — RULED.** §7.3.2 puts the carrier on the act's
**last two batches** (`L51–L60`) and §7.3's `act-peak` binds the act's **measured maximum**, evaluated
per batch once that batch's peak exists. The opener **reports** its measured peak and **carries no
clause**; what it does carry is the §7.3.1 `act-open` relief (§7.10.4). Every rung this rule admits is
**in band by construction** (`par 20` ⇒ `[23.75, 25.0625]`; `par 26` ⇒ `[29.75, 31.0625]`; both ⊆
`[23.75, 33.0625]`), so a rung outside the band is a **broken rule**, not a nuance.

#### 7.10.3 Act III's par range and the STAR LAW's totality (law text)

> **LAW (Act III `par` range and star totality).** Act III's admitted `par` range is **`20–28`
> inclusive** — exactly the plan-of-record band (§7.2). A rung outside it is **rejected, not
> re-banded**. Because `28 ≤ 30`, every Act III `par` falls inside **ADR-design-0005 RULING A's
> existing rows** — `par 11–20 → k1 = 4, k2 = 8` and `par 21–30 → k1 = 6, k2 = 12`, with
> **`k1 = 2·⌈par/10⌉`**, **`k2 = 2·k1`**, **`1★ = any finish`** — so the star law is **total over
> Act III by derivation**. **No new star row is ruled and `docs/game-design.md` §14.2 needs no
> edit.** Totality holds across the plan: Act IV (`24–32`) and Act V (`28–36`) are covered by the
> published ladder's `par 31–40 → +8 / +16` row and below (the table already runs to
> `91–100 → +20 / +40`). A fresh row would be owed only by an act whose `par` band left the published
> ladder — **none does**. No `par` value is capped at `30` for Act III; the act's own ceiling `28`
> binds. **Corrigendum (recorded, not silently used):** a dispatch restatement wrote
> *"`k1 = ceil(2·par/10)`, `k2 = 2·k1`; PA-004 bands `k2` par 21–30 = 6"*; the record
> (`docs/playtest-analysis/star-era-asks-readiness.md` §2) gives `par 21–30 → k1 = **6**`,
> `k2 = **12**`, `F2` falsify-too-tight at `median > 6` — the `6` is **`k1`**, and the pair is
> `2·⌈par/10⌉` **not** `⌈2·par/10⌉`. ADR-design-0005 is quoted, never re-derived.

#### 7.10.4 The pre-published `act-open` relief label (L40→L41) — §7.3.1 **instance 5**

*(Numbered **5** by the **GD-012b** corrigendum — the `L35→L36` batch-seam is instance 4, per seam
order; the label text below is unchanged from V1.4.)*

The seam is **forced by §7.10.2's own derivation** (the opener anchors at `PAR_FLOOR = 20` while Act
II's tail is at `par 24` ⇒ `Δpar = −4` by construction), so it is **labelled before it exists**.
Published bound: **`ΔD_exec ∈ [−4.705319, −1.392819]`** (union over O5's admissible first rungs: L41
at `par 20` ⇒ `[−4.705319, −3.392819]`; at `par 22` ⇒ `[−2.705319, −1.392819]`), decomposition always
`ΔD_exec = Δpar + 3·ΔB` with the `par` term shown beside it, never folded in. The full label,
verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `act-open` seam L40→L41 · `ΔD_exec ∈ [−4.705319, −1.392819]` (exact value filled
> in against this pre-published form once L41's `par` is selected; `par` term `−4` at the band floor)
> · band `[23.75, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip,
> never a claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law
> does **not** fire: Act III introduces **no** mechanic unit (`M` unchanged; §7.10.5) — the both-pair
> object is **variety inside §7.2's Act III family**, one verb deeper than Act II's multi-pocket
> chain. `act-peak`/`act-close` ride on the act's **measured maximum**, and the carrier obligation
> sits on **`L51–L60`** (§7.3.2). **The relief is largely an artifact of the measurement design:**
> §7.10.2's opener ladder is **derived** (floor-anchored, P2-exact, ceiling reserved for the tail), so
> the `par` term drops by **4 by construction**. The label asserts **no** ease the instrument cannot
> see — `D_exec` is **blind to comprehension** (`M`/`T` are not terms in it), so *how the seam reads*
> is a **labelled Playtest hypothesis** (§7.3.3; the star-era instrument reads `NOT TESTABLE, n = 0`),
> not a result.

Registration-side constants proposed (mirroring the `ACT_II_B2/B3_SEAM_RELIEF_*` triples):
`ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41`, `ACT_III_B1_OPEN_RELIEF_DELTA_RANGE = [−4.705319,
−1.392819]`; the exact `_EXEC` / `_DELTA` filled **only after selection and before the bytes**.

#### 7.10.5 Mechanics stance (YAGNI) — Act III ships ZERO new mechanics

**RULED:** Act III introduces **no mechanic unit and no new board feature**, so **`ΔM = 0`** and §6's
dip law **does not bind** it; no Act III rung may be scored as a debut. Every ingredient is **already
shipped law**: two opposite-colour portal pairs = **composition** over §1's portal array (each pair
independently validated, opposite-colour hard rule, teleport once / no chaining / no retrigger —
ADR-0009 decision 5; ADR-0008 rule 6); doors re-priced by both pairs = geometry + the shipped
`doorIsOpen`; the **XOR multi-switch door** = §1's pinned invert-per-ON-switch semantics (RV-002 M-5),
allowed here by §7.2's move, **review-flagged**, needing **no** schema, core or validator change.
**Prefer proven axes:** the **`CX = 1`** frames LV-015/LV-017 *measured* (`7×6`@`CX=1`: 40 / 27 / 27 /
40, disjoint 7; **`7×7`@`CX=1`: 46 / 31 / 31 / 46, disjoint 8) and the proven **4-pocket / 5-door /
5-press** device class — **F-L31-1's kill separated the FRAME, not the device class** (`CX = 2` empty,
`CX = 1` non-empty). A **5-pocket** device is refused by §7.2's family text and is **not censused**.
**No architect-impact is flagged by this section**; anything beyond the above is architect-impact
(schema + core review **before** authoring) and needs its own ADR — it may not be smuggled in as
"Act III variety". **Booked, not solved:** the structural **chain-envelope** question (100-rung walk
cost) stays BOOKED to the Architect at the Act IV juncture; §7.10 is **seam-walk-neutral** — no
clause here reads a cross-act walk and every batch proves on its **own** bytes (§7.5), so a later
choice between per-act seam walks and one `L1→L100` chain lands without re-opening Act III.

### 7.10.6 GD-013 published law — the Act III INTERIOR-BATCH rule (B1–B7), the O3 reservation's scope, and `par 27`'s refusal

> Owner: **Agent 1 — Game Designer** · Task **GD-013** · Date **2026-10-19** · Status: **PUBLISHED LAW**
> (full record, `Original Hypothesis → Problem → Change → Evidence → Result`:
> `docs/decisions/design-0009-act-iii-interior-batch-and-batch-seam-relief.md` — a **rider** to
> ADR-design-0008, which it quotes and extends, **never edits**)
> Trigger: the level lane is **gated** on this register's owner (`docs/project-status.md` item 157): a
> batch-seam relief must be **pre-published before the census**, and Act III's first half has **no
> published rule** for its interior batch's `par` ladder.

**§7.10.2's O1–O6 are scoped to the opener.** They derive `L41–L45`'s multiset and nothing else — and
§7.10.2's own words say so ("the derived top rung `par 28` is withheld", "opener rungs top out at
`26 + 3·1.6875`"). Act III's **second** batch therefore had no ladder law, while its **derivation is not
a free choice**: §7.3's interior freedom lets a *member* sit anywhere in the act band, but it never said
the batch may *search* its own par frame — §7.10.2's standard is **"a rule, not a search"**, and LV-017
satisfied it for Act II batch 4 by a counting identity (*5 members × step 2 = span 8 = the band's width*
⇒ `[16,18,20,22,24]`, unique). **That identity does not survive contact with Act III's first half**:
`ACT_III_B_BAND`/`ACT_III_CEILING_RESERVATION_MARGIN` remove `27` and `28`, so the usable set is
`{20, 22, 24, 26}` — **width 6 across 4 values** — and a 5-rung batch inside it **must** repeat. With
repeats in play the counting identity is gone, and the remaining clauses admit **three** multisets for
batch 2: `[22,24,26,26,26]`, `[24,26,26,26,26]`, `[26,26,26,26,26]` (the fourth, `[20,22,24,26,26]`, **is**
batch 1 and O4 refuses it). Law must therefore either **derive** the choice or **publish the tie-break** —
GD-013 does **both**, and says which is which.

| # | Clause | Content |
|---|---|---|
| **B1 · anchor advance** | `A_ℓ = ACT_III_PAR_FLOOR + 2·(ℓ−1)`, batch `ℓ` | the ladder's **floor advances by exactly one P2 step per batch**: `A₁ = 20`, `A₂ = 22`, `A₃ = 24`, `A₄ = 26` (`ACT_III_PAR_FLOOR = 20` is read from the law module). **This clause is the published TIE-BREAK, not a derivation** — see the box below |
| **B2 · self-check against published law** | at `ℓ = 1`, B1–B5 must reproduce **`ACT_III_OPENER_PAR_MULTISET = [20, 22, 24, 26, 26]`** **exactly** | a rule that did not reproduce the already-published opener would be a new rule wearing §7.10.2's clothes; this is the rule's own proving test and it is **checkable in one line** |
| **B3 · reservation scope + `par 27` (the boundary, in arithmetic)** | **every** rung of `L41–L50` has `par ≤ ACT_III_OPENER_TOP_PAR = 26`; **`par 27` is INADMISSIBLE** | `26 + 3·1.6875 = 31.0625 < 28 + 3·1.2500 = 31.7500`, margin **`0.6875`** (= `ACT_III_CEILING_RESERVATION_MARGIN`, computed in the law module); `27 + 3·1.6875 = 32.0625 > 31.7500` by **`0.3125`**. The boundary is `p ≤ 26` under **both** an inclusive and a strict reading, so **no operator choice decides it** (§7.9's lesson, applied pre-emptively) |
| **B4 · truncate + fill (O2/O5 verbatim)** | the P2-exact window from `A_ℓ` (`A_ℓ, A_ℓ+2, …`) is **truncated** where B3 bites; the shortfall is absorbed by repeats **at the truncated top** — O5's descending fill, "at the highest available derived par" | the opener's own 5th rung is this clause in its `ℓ = 1` instance |
| **B5 · within-par convention (O6) + the plural-same-par tie-break** | the **closing rung** takes the within-par **maximum**; every earlier rung the **minimum**; where **two or more** non-final rungs share a par, they take the pool's **lowest** accepted `D_exec` values **in ascending id order**, tie-broken inside a value by **minimal `D_exec`, then enumeration order** (LV-015 / LV-017) | **closes an ambiguity the opener never exercised**: `L41–L45` had exactly **one** non-final `par 26` rung, batch 2's derived multiset has **two** (`L48`, `L49`) |
| **B6 · empty pool ⇒ ABSENT, never substituted (O5 verbatim)** | a derived par absent from the census pool is **absent**; the fill drops to the next-lower **derived** value; **never** an out-of-set par, **never** a registered ladder's par borrowed | if the fill is forced **up to `26`** (`A_ℓ` and the next-lower value both empty), the seam's `par` term is `0`: the label there is **void — not a relief** — and the lane **STOP-AND-ROUTES to GD**, rather than registering a void label or silently re-anchoring |
| **B7 · anti-mirror (O4 verbatim, generalised)** | the multiset must differ from **every** registered Act II multiset (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`) and from every other Act III batch's | **coinciding pars are printed, never hidden** |

> **§7.10.6 B1 — THE TIE-BREAK, published because the multiset is not unique.** Where B3–B7 admit more
> than one multiset, take the one whose **anchor is the smallest admissible advance above the previous
> batch's anchor** — here **one P2 step (`22`)**. Grounds, in the register's own idiom: **(i)** it is the
> **minimum advance that clears B7** (re-anchoring at `20` reproduces batch 1's multiset); **(ii)** it keeps
> **every value of the act's derived window inside the act's par vocabulary** — a two-step advance would
> leave `22` with no home in any of Act III's four ladders, i.e. O1's derived window would be spent
> unevenly; **(iii)** it is a **minimality convention of exactly the form the file already uses** inside a
> par (O6, "earlier rungs take the **minimum**") and inside a value (`minimal D_exec, then enumeration
> order`). **It is labelled a tie-break and is not claimed as a derivation**: clause (ii) is a checkable
> claim, and a future measurement that contradicts it is the trigger for a replacement rule **with its own
> ADR** — this is the one part of GD-013 that a census may legitimately falsify.

**The derived batch-2 ladder (law, before any census): `[22, 24, 26, 26, 26]`** — `L46 22 · L47 24 ·
L48 26 · L49 26 · L50 26`. Read-outs, each stated so it can be checked rather than trusted:

- **It is distinct from batch 1 by derivation, not by luck** — B7's whole point; the coinciding pars
  (`22`, `24`, `26`) are **printed**, never hidden.
- **Its ceiling is `31.0625`** (`26 + 3·1.6875`), strictly below **any** `par 28` tail rung's floor
  `31.7500`: **§7.3.2's carrier obligation on `L51–L60` stays satisfiable by construction**, which is O3's
  guarantee and the reason B3 is a *half-wide* boundary rather than a per-rung note.
- **Batch 2 carries no `act-peak` / `act-close` branch** (unchanged §7.10.2 reading: §7.3.2's carrier is
  `L51–L60`; §7.3's `act-peak` binds the act's **measured maximum**, read per batch once that batch's peak
  exists). It **reports** its peak, and it carries the §7.3.1 **instance 6** label (§7.10.7).
- **Whether the front half's maximum lands on `L50` (the Midterm) or stays at `L45` is a MEASUREMENT, not
  a clause.** The Midterm's role (`ADR-design-0005` decision 8 — the Act III midpoint gate, no new
  mechanics) is served by **B5's max-late convention** placing the batch's maximum on its closing rung; if
  the pool's `par 26` top measures below `L45`'s `30.455319`, the act's maximum simply remains at `L45`
  until `L51–L60` lands — **reported, never repaired by padding**.
- **Mechanics stance is unchanged (§7.10.5, U-002):** `ΔM = 0`; **no** new mechanic unit, **no** new board
  feature, **no** new device contract. Batch 2 needs **no** device decision (item 154: the XOR / `H`
  question is booked to **GD + Architect** for the `L51–L60` era and **does not gate** `L46–L50`); the
  **XOR multi-switch door stays held for the act's second half** (user ruling **U-002**), the **5-pocket**
  device stays refused and uncensused, and the frame preference is §7.10.5's (**`CX = 1`** frames measured
  non-empty; the opener's `7×7` is the batch's proven primary, with **`7×6`@`CX = 1` published in advance
  as the fallback** — selected only if the census cannot populate the derived ladder, and then **named,
  never switched silently**).

### 7.10.7 GD-013 — the `L45→L46` `batch-seam` relief, pre-published (register §7.3.1 **instance 6**), and the relief-admissibility test

**Why the seam exists at all, in arithmetic rather than in taste.** B1 anchors batch 2 at `par 22` while
`L45` sits at `par 26`, so the seam's `par` term is **negative by construction** (`Δpar = −4`): this is a
§7.3 interior relaxation at a `ΔM = 0` boundary, and §7.3.1's rule is absolute — *a relief with no
pre-published label is **not registrable***. So it is labelled **here, before the census and before any
byte**, with the exact value left a **fill-in against this published form** (the instance-5 order:
bound → fill-in → bytes).

**The published bound, with its derivation shown** (`D_exec = par + 3·B`; `B ∈ [1.2500, 1.6875]` read from
`ACT_III_B_BAND = BLOCK_L1619_B_BAND`; comparator `L45 = 30.455319` read from
`ACT_III_REGISTERED_TAIL_EXEC`):

```text
par 22 (B1's anchor)     : [22 + 3·1.2500, 22 + 3·1.6875] = [25.7500, 27.0625]  −  30.455319  =  [−4.705319, −3.392819]
par 24 (B6's fallback)   : [24 + 3·1.2500, 24 + 3·1.6875] = [27.7500, 29.0625]  −  30.455319  =  [−2.705319, −1.392819]
union (the label's bound):                                                                       [−4.705319, −1.392819]
```

Two properties, stated so the lane can **verify** its measured `Δ` rather than trust this text:
**(a)** the union is **not** an interval — a fill-in landing inside it but inside **neither** admissible
half is **outside** the label (instance 5's `…ADMISSIBLE_FIRST_RUNGS` discipline, unchanged);
**(b)** the bound is **numerically identical to instance 5's** because `22 − 30.455319 = 20 − 28.455319 =
−8.455319` — a one-line **`+2` shift identity** (anchor +2, comparator +2). **The bound coincides; the
value must not:** instance 5's `−4.197990` belongs to `L41`'s `B` (`1.4191`), and quoting it for `L46`
would cite a different board.

The full label, verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `batch-seam` seam L45→L46 · `ΔD_exec ∈ [−4.705319, −1.392819]` (exact value filled in
> against this pre-published form once L46's `par` is selected; `par` term `−4` at the anchor) · band
> `[23.7500, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip, never a
> claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law does **not**
> fire: Act III introduces **no** mechanic unit (`M` unchanged; §7.10.5) — the batch-2 boards are **variety
> inside §7.2's Act III family**, on the device class the opener already registered. `act-peak`/`act-close`
> ride on the act's **measured maximum**, and the carrier obligation sits on **`L51–L60`** (§7.3.2).
> **The relief is largely an artifact of the measurement design:** §7.10.6's ladder is **derived**
> (anchor-advanced, reservation-bounded, fill at the truncated top), so the `par` term drops by **4 by
> construction** — the register's instances 2–5 are the same artifact of *their* ladders' floor-anchoring,
> and §7.3.1's form already refuses to call that a designed rhythm ("a measurement instrument is not a
> designed rhythm"). The label asserts **no** ease the instrument cannot see — `D_exec` is **blind to
> comprehension** (`M`/`T` are not terms in it) — so *how the seam reads* (mastery rest or deflation) is a
> **labelled Playtest hypothesis** (§7.3.3; the star-era instrument reads `NOT TESTABLE, n = 0`), not a
> result.

**Registration-side constants proposed** (mirroring the `ACT_III_B1_OPEN_RELIEF_*` / `ACT_II_B*_SEAM_RELIEF_*`
triples): `ACT_III_B2_SEAM_RELIEF_LEVEL_ID = 46`,
`ACT_III_B2_SEAM_RELIEF_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed** to
`ACT_III_REGISTERED_TAIL_LEVEL_ID/_EXEC` (`45` / `30.455319`),
`ACT_III_B2_SEAM_RELIEF_DELTA_RANGE = [−4.705319, −1.392819]`, and the checked halves as
`ACT_III_B2_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS = [{ par 22, [−4.705319, −3.392819] }, { par 24,
[−2.705319, −1.392819] }]`; the exact `_EXEC` / `_DELTA` are filled **only after selection and before the
bytes**. A value outside the union, or inside the union but in neither half, is a **STOP-AND-ROUTE to GD**.

> **§7.10.7 RELIEF-ADMISSIBILITY TEST (register-wide, all acts).** A `ΔM = 0` seam is a **registrable
> relief iff its `par` term is negative** — `ΔD_exec = Δpar + 3·ΔB`, with **`Δpar < 0`** shown beside it,
> never folded in. A seam with **`Δpar = 0`** is **not** a relief: its residue is `3·ΔB`, bounded by
> `3·(B_hi − B_lo) = 3·(1.6875 − 1.2500) = **1.3125**`, and is published as an **instrument reading** —
> never labelled — which is what the register already did with LV-017's interior minima
> (`−0.071490 / −0.071739 / −0.019565 / −0.109810`) before this test existed. Every instance in §7.3.1
> (1–5) has a negative `par` term (`−4 · −4 · −4 · −6 · −4`), so the test **describes** the register it
> governs and does **not** narrow it: a seam any future act drives negative **through the `par` term**
> remains registrable exactly as instances 1–6 were. **It is written so the boundary is law, not so it can
> be worked around** — a lane that measures `Δpar < 0` at a seam **owes this register a label before the
> bytes**, whatever the `D_exec` sign.

**What this sub-section does *not* legislate, by name.** The **`L51–L60` tail's ladders** (which must
redeem the reserved `par 28` and stay B7-distinct from `[20,22,24,26,26]` and `[22,24,26,26,26]`) are
**not published here**: the reservation's *release* clause is coupled to the **XOR multi-switch door / `H`
both-pair device-contract question booked to Game Designer + Architect** (`docs/project-status.md` item
154), and the whole tail is that ticket's law. §7.10.6–§7.10.7 are **seam-walk-neutral** and add **no**
clause any cross-act walk reads (§7.5: every batch proves on its **own** bytes).

### 7.10.8 GD-014 published law — the XOR multi-switch door: the DEVICE RULING (option (a) DERIVABLE), the `G2-X` effective-press contract, and the comprehension plan

> Owner: **Agent 1 — Game Designer** · Task **GD-014** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> (full record, `Original Hypothesis → Problem → Change → Evidence → Result`:
> `docs/decisions/design-0010-xor-device-ruling-and-par28-release.md` — a **rider** to
> ADR-design-0008 and ADR-design-0009, both **quoted and extended, never edited**)
> Trigger: `docs/project-status.md` item **154** — LV-018 handed the **XOR / `H`-both-pair device-contract
> question** to **Game Designer + Architect** (*"does the XOR door's `g6` covering rule need a second
> derivation, or is the `H` composition a NEW DEVICE CONTRACT?"*) and wrote that **"`par 28` top is
> reserved for whatever answer comes"**; item **159** records the same question still open after
> `L46–L50`; user ruling **U-002** (item 153) put the XOR debut in the act's **SECOND HALF**, i.e. this
> era. §7.10.7's closing paragraph left the **`L51–L60` tail's ladders and the reservation's *release***
> coupled to this answer **by name** — this section is that answer, and §7.10.9 is the release.

#### 7.10.8.0 What this section does and does not publish (integrity statement, read first)

| Quantity | Published here? | Why |
|---|---|---|
| The **device ruling** — option (a) vs option (b) | **YES — as law** | An intersection of already-published law with a **read of shipped code**, not a taste call; the code reading is quoted by file:line. |
| A **schema field, validator rule or core predicate** | **NO — and refused by name** | §7.10.5 already ruled **zero** schema/core/validator change; this section confirms it *for the right reason* and invents nothing. The only capability owed is a **reader in `scripts/**`** (the level lane's). |
| The **`G2-X` proof obligation** | **YES — as law** (prose) | It is a **gate on landed bytes**, stated here so the lane encodes it **before** its census. **GD writes no code.** |
| The **pacing/grade clauses** for `L51–L55` | **YES — as law** | Weightless (rung placement, teaching grade) and pre-runnable; §6's construction floor and §7.3.2's carrier already bind the rest. |
| Anything about the **felt half** | **NO — labelled hypothesis** | `D_exec` is blind to comprehension (`M`/`T` are not in it); the star-era instrument reads `NOT TESTABLE, n = 0` (§7.3.3). |

#### 7.10.8.1 RULING — the question answered in its own terms

**Asked:** *does the XOR door's `g6` covering rule need a second derivation, or is the `H` composition a
NEW DEVICE CONTRACT?* **Answer: NEITHER — and the clause that does need work is not `g6`.**

**(i) The covering derivation is MULTIPLICITY-BLIND BY CONSTRUCTION ⇒ NO second derivation is owed.**
`derivedWalkSealedRooms(level)` (`scripts/room-derivation.ts:69–116` — the single truth source both
`scripts/prove-candidate.ts` and `scripts/author-l21.ts` import, per the F-L41-2 fix) reads only
`phaseAWalls` / `phaseBWalls` / `doors[].tiles` / in-bounds connectivity. A region is a walk-sealed room
iff a **single door object** covers its whole boundary with **no** phase-wall and **no** free boundary
tile; `doorsCoveringTwoRooms` then requires each door object to cover **≤ 1** room. **`switches[].targets`
is never read by either function**, and a door tile is a structural blocker in **every** phase and
**every** switch state. Therefore adding a second targeting switch to a door — or retargeting an existing
one — **cannot move a region boundary or change the covering list**. The two `§6.2.3` clauses that do the
work here are both untouchable by XOR:
- **clause 3** (*"the pocket's only exit is a door — no phase wall may form the exit"*, the F-L19-2
  doctrine that protects `g6`-coverage and P4) is **structural**, and XOR is not structural;
- **clause 4** (an ordered **≥ 2-press** plan) is **measured on the landed bytes** from the **shared**
  `applyMove` state graph — the XOR truth table is *inside* the truth source, not beside it.
**Falsifiable form of the claim (so a reader can check it rather than trust it):** `g6`'s covering list is
**invariant under any mutation of `switches[].targets`**. If the lane wants a belt on that, it is a
one-line assertion in **its own** tool (mutate `targets`; the covering list must not move) — a
level/QA control, **not** a design deliverable and **not** a second law.

**(ii) What §7.10.5 did NOT foresee — a capability, not a predicate: the press-then-cross reader is
TARGET-MEMBERSHIP, and XOR breaks that reading.** The `G2`/`g2` census reader is implemented **twice** —
`scripts/author-l21.ts:1968–1991` and `scripts/prove-candidate.ts:279–297`, the F-L41-2 two-implementations
class — and both test `targets.includes(doorId)` for a **door tile the route later stands on**. For a
**single-switch** door that is a sound witness (one ON switch inverts the base, so a legal crossing after
the press is the press's doing — the necessity is separately measured by all-OFF unsatisfiability). **For
an XOR door it is not:** openness is the colour base inverted once per ON targeting switch
(`doorIsOpen` — `src/core/rules/solid.ts`, declarator `export function doorIsOpen`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c`; §1 / RV-002 M-5), so **a press can CLOSE the very door it
targets**, and a route can be credited with *"pressed, then crossed"* by a press that did the **opposite**
of opening it. That is the withdrawn **unordered-reader** class (ADR-design-0002's trapped refusal — a
beat no player can witness) arriving somewhere new: the Aha's own words are *"the door opened"*, and on an
XOR board the membership form cannot see whether the door opened **because of** that press.

#### 7.10.8.2 The `H`/XOR DEVICE CONTRACT — four clauses (law text; no code)

**C1 · Representation = multiplicity on the EXISTING schema (option (a) confirmed).** An XOR door is a
`Door` with **≥ 2** switches listing its id in `targets`. **No new field, no schema change, no validator
error, no core predicate, no new composition law** — the composition is **already shipped and is quoted,
never re-derived**: `open = base ⊕ (#ON targeting switches mod 2)`. The validator's
`[multi-switch-door]` **stays a warning** (`src/core/level/index.ts:622` — **integer KEPT + era-stamped** `measured at base d395549`, *exact*: the referent is the warning **emission** (a template literal inside the validator's door walk) and has **no declarator** to anchor by, though the code itself is enumerated in `LevelWarningCodeSchema`; ADR-architecture-0006 §10 `ARCH-006c`: review flag; never a rejection,
never a repair, never a Solver gate — ADR-architecture-0003 R5, and LV-018 already corrected this prose's
range). **An XOR door is therefore a *composition* in the §6.2.2 sense: `ΔM = 0`, no debut grade, no dip
obligation** — §7.10.5's stance, unchanged, now with the code reading behind it.

**C2 · `G2-X` — the XOR-AWARE press-then-cross obligation (NEW; a reader in `scripts/**`) — reader TEXT
CORRECTED BY GD-014b (2026-10-20), under ADR-architecture-0006 §4.3, which is NORMATIVE for the instrument
(`docs/architecture.md` §17.3).** The device RULING of §7.10.8 (`G2-X` capability, `scripts/**`-only blast
radius, the STOP rule of §4.4) is **unchanged**; only the encoding text dies — the published form was
**refused by measurement**, and the refused text is kept verbatim in the supersession record below. For
**every** par route, for **every** crossed door `d` that **≥ 2** switches target (its tile entered at
index `j`):

1. **the crossing's ENTRY state is switch-enabled, not colour-enabled** —
   `route[j−1].state.doorsOpen[d] === true`. *(This is the **C2.3 off-by-one correction**: legality is
   judged on the pre-move state and openness is recomputed **after** the flip, so the crossing *arrival*
   `j` reads the door **closed** in the new phase — measured **0 / 30 847** crossings open at `j`,
   **30 847 / 30 847** open at `j−1`, ADR-architecture-0006 §4.2 evidence row 13. On a landed par route
   this leg is entailed; it is read on the **counterfactual replay** of leg 2, where it is **not** a
   tautology.)* — **and**
2. **an effective press exists before it** — there is an index `i < j` whose `toggledOn ∪ toggledOff`
   names a switch `s` with `d ∈ s.targets` for which the **COUNTERFACTUAL holds**: from the state at `i`,
   restore `switchesOn[s]` to its **pre-arrival** value, recompute `doorsOpen` with the exported
   `resolveDoorsOpen` (`src/core/rules/solid.ts`, declarator `export function resolveDoorsOpen`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c`), replay moves `i+1 … j` with the shipped `applyMove`
   using the records' **own** `direction` values, and **require the crossing at `j` to FAIL**. If it still
   crosses, that press is **not load-bearing** for that crossing and the reader **must not claim it**.

**The field path is `route[i].state.doorsOpen[d]`, never `route[i].state.levelState.doorsOpen[d]`:**
`ArrivalRecord.state` is a `SearchState` (`src/core/state/types.ts`, declarator `export interface SearchState`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c`) and **has no `levelState`**;
`levelState` exists only on `GameState` (`src/core/state/types.ts`, declarator `export interface GameState`, field `levelState`; **symbol-anchored, no integer** — the published `:107` was the field, not the declarator). **A press that changes the door's
resolved openness *at its own arrival* is NOT the test and cannot be** — every legal move flips the phase,
the colour base **strictly alternates** with the phase (`src/core/rules/solid.ts`, declarator `export function baseDoorOpen`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c` — the published `solid.ts:73–75` is *exact* at base `d395549`, and the integer is dropped because the name disambiguates), and **≤ 1** switch toggles per
move (`switchAt` returns one switch — `src/core/rules/solid.ts`, declarator `export function switchAt`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c`; the published `solid.ts:220–226` is *exact* at base `d395549`) ⇒ base-flip and parity-flip **cancel**, and the
toggled switch's **own** target door **never** changes at that arrival (measured **0 / 17 732** toggling
arrivals against **70 048 / 70 048** non-toggling arrivals changed, over **4 025** par routes;
ADR-architecture-0006 §4.2 evidence row 12 — cited, **never re-derived here**). **That refused sub-clause is
kept verbatim, with its refutation, in the dated supersession record below — a corrigendum that erases its
own evidence trail is a restamp.**

Then the beat *"the press opened the door I then crossed"* is **witnessed**, not merely sequenced — which
is exactly what `G2`/`G1` exist to guarantee (§6.1.3's own words: the Aha is *"the door opened, not I
walked around"*). **Reader blast radius: `scripts/**` only** (two implementations of one law);
**zero** schema / core / validator change — which **is** §7.10.5's claim, now true for the right reason.
**Both legs use exported core functions and the records' own data only** — no new core surface, no second
derivation (the replay **is** `applyMove`), no new search (the move sequence is given), `O(par)` per
witness. **The parity reading** (`doorsOpen[d]` vs `baseDoorOpen(d.color, route[j−1].state.phase)`) is
**printed beside** the verdict and **never decides it** — GD-008's shape: both readings printed, no verdict
silently moved.

**Order + measurement (the ADR-architecture-0002 / GD-008 discipline, applied pre-emptively).**
`G2-X` encodes **before** the census (a gate that does not exist cannot filter a census; and a gate
repaired *after* a census owes the **identical command re-run** — the LV-019 `F-L46-1` precedent, where
the pre-registered test was not allowed to fire on a broken instrument). The lane then **measures and
prints the divergence** between the membership form and `G2-X`, the GD-008 shape (both readers printed,
no verdict silently moved). **Divergence > 0 is expected** (parity biting) and is published;
**divergence = 0 on any XOR-class census is a STOP-AND-ROUTE to GD by law** — **never** to tool-patching,
**never** to a widened gate, **never** to a re-labelled class — because it would mean the census selected
XOR-free boards wearing an XOR flag. **Under the refused literal text the FIRST census would have read
`divergence = 100 %`** (**0 / 17 732**): the instrument would have reported the class **absent** while the
device is present — **which is how this defect was caught before any board was misproven.** A `100 %`
reading is therefore an **instrument defect**, answered by this corrigendum **before** the census, never by
moving a threshold (ADR-architecture-0006 §4.4; `docs/architecture.md` §17.3). **One negative control per
new reader**, named from a **measured** refusal (§8.12 F-L16-3: expectations corrected to measured names,
never widened): a board whose par route presses a targeting switch that **closes** the door, later opened
by the **other** switch and then crossed — it must **pass** the membership form and **FAIL** `G2-X`.

> **SUPERSESSION RECORD — dated 2026-10-20 (GD-014b).** The text quoted below is `C2.2` / `C2.3` **exactly
> as published by GD-014** and **REFUSED** by ARCH-006 §4.2 **by measurement, not by argument**. It is **not
> law**, must **not** be encoded, and is kept **verbatim** because the refutation is the evidence for the
> corrected form: *a corrigendum that erases its own evidence trail is a restamp.*
>
> > 2. the door's **resolved openness CHANGES at that arrival** — `route[i].state.levelState.doorsOpen[d]`
> >    differs from `route[i−1]`'s — an **effective** press, not a parity-neutral one — **and it changes to
> >    `true`** (the door opens), **and**
> > 3. the door is **open at every crossing entry** — `route[j].state.levelState.doorsOpen[d] === true`.
>
> **Refuted:** clause 2 holds at **0 / 17 732** toggling arrivals — it is satisfiable exactly when the
> arrival toggles **nothing** (**70 048 / 70 048**) — and clause 3 holds at **0 / 30 847** crossings, while
> its **entry** state holds at **30 847 / 30 847** (ADR-architecture-0006 §4.2, evidence rows 12–13;
> `docs/architecture.md` §17.3). **A first census run behind the literal text would have read
> `divergence = 100 %` on a class that is present** — the defect was caught **pre-census**, so no board was
> misproven and **no gate, band, ladder, `par`, level byte or registered row is touched** by this
> corrigendum.
>
> **Corrigendum authority and standing.** Decided by the Game Designer (this lane owns the text) under
> ADR-architecture-0006 §4.2/§4.3 — the Architect refused the *text*, never the *ruling*. **The §7.10.8
> RULING (option (a) DERIVABLE, the `G2-X` capability, the `par 28` release arithmetic, the
> `[24,26,28,28,28]` ladder and the instance-7 bound) is UNCHANGED by this record**, and §7.10.8.1 /
> §7.10.9 / §7.10.10 are cited here, not re-written.

**C3 · Core compliance (AGENTS §2) — nothing crushes, nothing traps, nothing is random.** An XOR door
changes a **state**, never a position: entry-only solidity; an illegal move does **nothing** and flips
**nothing**; standing inside a wall stays **legal and safe** (ADR-0008 rules 1–3); deterministic puzzles
only. A door that **closes behind the player** is legal **iff** the goal stays reachable from that state —
which the shipped `deadStates 0` / `noUnrecoverableOk` / `T ≡ R ≡ 0` proof (§4) **already** refuses for the
trap class, by the same machinery, **unchanged**. **Authoring rule (a belt, not a new law):** a room whose
**only** exit is an XOR door must contain a targeting switch, or the board must prove that exit
re-openable from inside; a board that can seal the player in with the goal unreachable is **rejected by
the invariant**, never repaired. **Refused at contract level, by name:** any semantics in which an XOR
press can crush, push, relocate or randomise the player — those are ADR-0006's / ADR-0008's and the core
loop's standing refusals, and this device may not acquire them.

**C4 · Pacing for `L51–L55` (weightless; binds rung placement, nothing else).** **`L51` carries NO XOR** —
it is the §7.3.1 **instance-7 relief** rung, and two novelties on one board is what §6's construction-floor
discipline forbids. **`L52` = the XOR FIRST ENCOUNTER**, grade **below OFFERED**, one XOR door, both links
visible, `switchRequired: "exempt"` **recorded with its measured reason and not `null`** (the L6 / L11 / L12
precedent). **`L53` = OFFERED** (an XOR-free same-par route exists). The `par 28` **class** appears on this
rung, and that is a **register** fact, **invisible in play** — `par` is never shown live (GD-OQ1, §7.1) —
so it is **not** a player-facing second novelty and does not re-open C4. **`L54` = FORCED**
(`switchRequired: "required"` **measured**: all-OFF UNSATISFIABLE, and `G2-X` on every par route).
**`L55` = FORCED at the within-par maximum** (B5) and the batch's act-max candidate.

#### 7.10.8.3 Comprehension plan — the board must let the player reconstruct the truth table

**Teaching sequence (show, never tell; `L4+` text budget is none — §2, game-design.md §9).**

| # | Rung | What the board does — and the sentence the player owns (kept out of the game) |
|---|---|---|
| **T0** | owned since L6–L10 (Aha #1) | *"我踩过的东西改变了我脚下的世界"* — press ⇒ invert ⇒ **latch**. **Assumed, not re-taught.** |
| **T1** | **L52** (below OFFERED) | One door with **two** visible links; the greedy walk passes **both** switch tiles and the door then **REFUSES** (two ON ⇒ base restored). **The refusal IS the tutorial** (the L8 shape, re-aimed at the *second* press). Recovery is one step — re-entering either switch tile toggles it back — with unlimited `Undo`/`Restart`, `T ≡ R ≡ 0`, no dead states. Owned: *"两次踩踏会把它变回去"* — a press is not a one-way door. |
| **T2** | **L53** (OFFERED) | The two-link object may be read as an **echo**: a same-par route exists that never needs the XOR ordering. Owned (optionally): *"同一个按钮，因为我先踩了什么而回答不同。"* |
| **T3** | **L54** (FORCED) | Every par route must perform an **effective** XOR press (`G2-X`) — the ordering is **demanded**, not offered. |
| **T4** | **L55** (FORCED, within-par max) | The device's densest expression; the batch's act-max candidate. |

**First-encounter readability rules (mandatory — legibility is a design requirement, registry is
R-003-gated; §6.1.6 item 6 / §7.5 item 5).** A door whose truth table the player **cannot reconstruct
from the screen** is a **comprehension failure, not a puzzle**:

- **R1 · The two links must be VISIBLE, never inferred.** The door must present as *targeted by two*, and
  each switch must show the door it targets; one-link and two-link doors must be **visually distinct
  objects**. If the player cannot tell that a door has two feeders, the read is impossible and the board
  does not ship.
- **R2 · Per-switch ON state must be legible at all times** (a lit / unlit pip). This is what makes the XOR
  reconstructible **on screen** as *two lit ⇒ base, one lit ⇒ inverted* — the player must never have to
  hold a two-bit truth table in their head **across a phase flip**.
- **R3 · Every door change must be attributable to an arrival.** A press that changes the door is
  co-located in time with that arrival; a press that **fails** to change it (parity-neutral) must not read
  as a bug — R2 is what makes the neutral press legible rather than mysterious.
- **R4 · At first encounter the second switch is reachable WITHOUT crossing the door it targets.** "The
  key is behind its own lock" is reserved for deeper rungs (`L54`+), and even there **both links stay
  visible from move 0**.
- **R5 · The refusal is witnessed, not asserted.** Solver-measured on every XOR rung: gate (iii)
  `refusedBeforeEnteredTiles ≥ 1` **and** the `G2-X` companion witness — a state exists in which **both**
  feeders are ON and the door **refuses**.
- **R6 · Zero text, no popups, no "mechanic discovered" banner.** The board is the teacher (§2).

**Named comprehension risk (Playtest Analyst territory — LABELLED HYPOTHESIS, never a result).**
*"A press un-opened the door"* can read as *the game is inconsistent* rather than as a rule. Structural
mitigations are R1–R3 plus instant penalty-free `Restart`/`Undo`. **Measurement:** **M4 refusals / M5
restarts / M6 undos at L52 vs L51 must not spike**, with thresholds frozen **before** the cohort runs (T6
discipline; §7.3.3's form). The star-era instrument today reads **`NOT TESTABLE, n = 0`**. If it spikes,
the device is **re-designed, never re-labelled** (§6.2.5's standing rule for the L20 pocket).

### 7.10.9 GD-014 published law — the `par 28` reservation RELEASED, and the `L51–L55` ladder law

#### 7.10.9.1 The release: what O2/O3 + B3 reserved, why it is spendable now, and the act-max arithmetic

§7.10.2 withheld the derived top rung `par 28` from `L41–L45` on a **measurement, not a preference**:
opener rungs top out at `26 + 3·1.6875 = 31.0625` while any `par 28` rung bottoms at
`28 + 3·1.2500 = 31.7500` — margin **`0.6875`** = `ACT_III_CEILING_RESERVATION_MARGIN` — so §7.3.2's
`act-close` stays satisfiable **by construction** on the tail. §7.10.6 **B3** extended that scope to the
whole first half (`L41–L50`: `par ≤ 26`, **`par 27` inadmissible**). **The reservation exists FOR the
tail's carrier, and the tail is now being authored — so it is RELEASED, effective at batch 3** (`ℓ = 3`),
and the release is arithmetic, not a mood:

```text
reserved class        : par 28  ⇒ D_exec ∈ [28 + 3·1.2500, 28 + 3·1.6875] = [31.7500, 33.0625]
first half's ceiling  : 26 + 3·1.6875 = 31.0625  ⇒  margin 31.7500 − 31.0625 = 0.6875  (the reserved constant, now SPENT)
act band (derived)    : [23.7500, 33.0625]       ⇒  the released class's TOP *is* the act ceiling (0 headroom above it)
registered act max    : 30.455319 @ L45          ⇒  31.7500 − 30.455319 = +1.294681  (minimum margin, ANY in-band B)
                                                    33.0625 − 30.455319 = +2.607181  (= ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING)
```

**Read-outs, each stated so it can be checked rather than trusted.**

- **The carrier is discharged by MEASUREMENT whatever `B`.** Any `par 28` rung clears the act's current
  measured maximum by **≥ `+1.294681`** — no `B` selection is required, unlike L20's §6.2.6 obligation
  (*"select in-band `B`"*). §7.3.2's carrier window is `L51–L60`, so the obligation is discharged
  **inside the act's own band** by the first `par 28` rung that lands — **which is why the reservation can
  be released without weakening anything**: the released class's floor is `0.6875` above the first half's
  ceiling, i.e. the tail strictly dominates the half it was reserved from.
- **The released class exactly *is* the act's remaining headroom:** its floor is the act max `+1.294681`
  and its ceiling **is** the band ceiling `33.0625`, so the act's maximum can move into
  `[31.7500, 33.0625]` and **nothing above it is admissible anywhere in Act III**. The reservation was the
  only thing keeping that headroom unused; releasing it spends the headroom exactly.
- **Operator readings (§7.9's both-reading discipline, applied pre-emptively).** `par ≤ 28`: an **integer**
  comparison against `ACT_III_PAR_BAND[1] = 28`, **inclusive**; `29` is out of band and no operator question
  exists (`29 ≠ 28`, so nothing is decided by `<` vs `≤`). `D_exec ≤ 33.0625`: a `par 28` rung at
  `B = 1.6875` stands **exactly on** the derived-exact ceiling — **IN band**, because §7.9 made bands
  inclusive at both ends and the strict form was refused at GD-011 as the outlier. **Honest difference
  from Act II's dead sliver:** Act II's endpoint-adjacent sliver was **empty in every census run to
  date**; here the top is a **reachable** value (the act's own tail measures `B 1.4851`, batch 2's top
  `1.4723`, against the band top `1.6875`) — so if a census produces a `par 28` rung with
  `B ∈ (1.6866̄, 1.6875]` it is **admitted by law**, and §7.9's filed constant/operator-alignment
  follow-up stays exactly what it is.
- **`par 27` stays INADMISSIBLE — now on a DERIVATION rather than on the reservation** (so no operator
  reading can resurrect it): **every Act III ladder's `par` values are `≡ ACT_III_PAR_FLOOR (mod 2)`**,
  because O1's window is `A_ℓ + 2k` and B1's anchor advances by exactly `2` — the landed ladders
  `[20,22,24,26,26]` and `[22,24,26,26,26]` are all even, so `par 27` **has no home in any Act III
  ladder**. It is also strictly dominated inside the ceiling class:
  `27 + 3·1.6875 = 32.0625 < 28 + 3·1.6875 = 33.0625` with an **identical** floor `31.7500`, so a `par 27`
  rung can never measure above what the *same* `B` yields at `par 28`.

#### 7.10.9.2 The `L51–L55` ladder law — B1–B7 read at `ℓ = 3` (the rule APPLIED, never re-derived)

**Derived multiset (law, before any census): `[24, 26, 28, 28, 28]`** —
`L51 24 · L52 26 · L53 28 · L54 28 · L55 28`. Every clause is GD-013's; only the scope and the released
ceiling move, and they are shown moving:

| # | Clause at `ℓ = 3` | Content |
|---|---|---|
| **B1** | anchor advance (**the published tie-break**) | `A₃ = ACT_III_PAR_FLOOR + 2·(3−1) = 24` |
| **B2** | self-check against published law | at `ℓ = 1` and `ℓ = 2` the rule reproduces `ACT_III_OPENER_PAR_MULTISET = [20,22,24,26,26]` and batch 2's `[22,24,26,26,26]` **exactly** — **two** landed self-checks now, not one; this is what proves the rule is not "a new rule wearing §7.10.2's clothes" |
| **B3** | **the reservation RELEASED at `ℓ = 3`** | `L51–L55`: `par ≤ ACT_III_PAR_CEILING = 28`; `par 27` inadmissible **by derivation** (§7.10.9.1). **The first half's `par ≤ 26` scope is UNCHANGED** — §7.10.6 B3 still governs `L41–L50`, and a `par 27`/`28` rung there is still inadmissible |
| **B4** | truncate + fill (O2/O5 verbatim) | window from `24` = `[24, 26, 28, 30, 32]` → truncated at the act ceiling `28` → `[24, 26, 28]`; the 2-rung shortfall is absorbed by **repeats at the truncated top** ⇒ `[24, 26, 28, 28, 28]` |
| **B5** | within-par convention + plural-same-par tie-break | the closing rung `L55` takes the within-par **maximum**; every earlier rung the **minimum**; the **two** non-final `par 28` rungs (`L53`, `L54`) take the pool's **lowest** accepted `D_exec` values in **ascending id order** (batch 2's shape, second occurrence, so the convention is exercised twice) |
| **B6** | empty pool ⇒ ABSENT, never substituted | a derived par absent from the census pool is **absent**; the fill drops to the next-lower derived value. **Degenerate case, ruled in advance:** if `24` **and** `26` are both empty the fill lands at the **ceiling** ⇒ a flat `[28×5]` batch with **no interior rise**. Admissible by B6's letter (its `par` term is still `−2`) but **STOP-AND-ROUTE to GD**, because a flat-at-ceiling ladder is a shape **no published clause authorises**, and inventing it inside a fill-in is the *silent re-anchoring* B6 refuses |
| **B7** | anti-mirror (O4 verbatim, generalised) | must differ from every registered Act II multiset (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`), from `[20,22,24,26,26]`, from `[22,24,26,26,26]`, **and from batch 4's**. Batch 4's **ladder** is **GD-015's** era — this ruling binds it only by this **constraint**, never by a preview. Coinciding pars are **printed, never hidden** |

**Uniqueness, stated honestly (the GD-013 form — the tie-break stays a tie-break).** The multiset is
**unique GIVEN B1's anchor**, and the anchor is chosen by GD-013's published **tie-break**, **not** by a
derivation. Applied at `ℓ = 3`, its three grounds read:

- **(i) the minimum admissible advance — SURVIVES, and alone selects `24`.** `A₃ = 22` (zero advance)
  reproduces batch 2's multiset exactly, which **B7 refuses**; `24` is therefore the smallest admissible
  advance. *This is the load-bearing ground here.*
- **(ii) "every value of the derived window keeps a home in the act's ladders" — SPENT at `ℓ = 3`, and
  recorded as spent rather than re-asserted.** After the opener and batch 2, **every** window value except
  `28` already has a home, so (ii) cannot select this anchor; it was load-bearing at `ℓ = 2` and it is not
  at `ℓ = 3`. The claim stays *checkable* — under `A₃ = 24` the homes are `20`(B1) · `22`(B1,B2) ·
  `24`(B1,B2,B3) · `26`(all) · `28`(B3) — it simply no longer discriminates. **Stated here because a
  ground silently re-quoted after it stops discriminating is how a tie-break becomes folklore.**
- **(iii) the minimality convention — SURVIVES** (the form O6 already uses inside a par, and
  LV-015/LV-017 use inside a value: minimal `D_exec`, then enumeration order).

**It is labelled a tie-break and is not claimed as a derivation.** If a future census contradicts (i) or
(iii), that measurement is the trigger for a **replacement rule with its own ADR** — the one part of
GD-013 that a census may legitimately falsify, and this section adds no immunity to it.

**Interior structure of the batch (no relief owed inside it).** The steps `24→26` and `26→28` are
`Δpar = +2` (P2, §6.1.1), and the two same-par steps ascend by `B` (B5). **No interior label is owed.**

**Census obligation, never a promise (§7.0).** `par 28` is measured **non-empty** in the **Act III
`G`-family** pool (LV-018: `par 28: 556` on a budget-hit prefix census, `7×7`@`CX = 1`; LV-019's pre-fix
reading: `529`) — but that pool is **not** the **`H` both-pair** lattice (§7.4 stage `H`, **not yet
censused**), and **no ceiling claim is publishable in either direction**. If `H` cannot populate the
derived ladder, **B6 governs**: ABSENT-never-substituted, then the STOP-AND-ROUTE above — never a
substitute par, never a borrowed registered ladder.

### 7.10.10 GD-014 — the `L50→L51` `batch-seam` relief, pre-published (register §7.3.1 **instance 7**)

**Why the seam exists, in arithmetic.** B1 anchors batch 3 at `par 24` while `L50` sits at `par 26`, so
the seam's `par` term is **negative by construction** (`Δpar = −2`): a §7.3 interior relaxation at a
`ΔM = 0` boundary — and §7.3.1's rule is absolute: **an unlabelled relief is not registrable.** So it is
labelled **here, before the census and before any byte**, with the exact value left a **fill-in against
this published form** (the instance-5/-6 order: bound → fill-in → bytes).

**The published bound, with its derivation shown** (`D_exec = par + 3·B`; `B ∈ [1.2500, 1.6875]`;
comparator **`L50 = 30.417021`**, batch 2's shelf-measured maximum — `docs/ai-native-pipeline.md` §8.28,
see property (c) below):

```text
par 24 (B1's anchor)   : [24 + 3·1.2500, 24 + 3·1.6875] = [27.7500, 29.0625]  −  30.417021  =  [−2.667021, −1.354521]
par 26 (B6's fallback) : [26 + 3·1.2500, 26 + 3·1.6875] = [29.7500, 31.0625]  −  30.417021  =  [−0.667021, +0.645479]
                                                                   par term 0 ⇒ NOT a relief (§7.10.7's test)
published bound (the par 24 half alone):                                                       [−2.667021, −1.354521]
```

**Three properties, stated so the lane verifies rather than trusts.**

- **(a) It is a single half, not a union — the fallback is not a relief at all.** `L51` at `par 26` has
  `Δpar = 0`, and §7.10.7's register-wide test makes a `Δpar = 0` seam **not a relief**: its residue is
  `3·ΔB`, bounded by `3·(1.6875 − 1.2500) = 1.3125`, published as an **instrument reading**, never
  labelled. (Unusually, that residue **spans the sign change** here — `[−0.667021, +0.645479]` — which is
  *because* the comparator `L50` sits inside the `par 26` band; it changes nothing, because the test keys
  on the `par` term.)
- **(b) The `+0.038298` shift identity is a checkable coincidence, not a template.**
  `30.455319 − 30.417021 = 0.038298`, and instance 6's `par 24` half shifted by exactly that amount **is**
  instance 7's bound: `−2.705319 + 0.038298 = −2.667021` and `−1.392819 + 0.038298 = −1.354521`.
  **The bound coincides under the shift; the value must not:** instance 6's `−4.212830` belongs to `L46`'s
  own `B` (`1.4142`), and re-quoting it for `L51` would cite a different board.
- **(c) The comparator is explicitly NOT the act tail — a distinction instance 6 could not see.**
  `L50`'s `30.417021` is **below** the registered tail `30.455319 @ L45`, so after R-008's registration
  the act's **maximum stays at `L45`** (item 159's finding, re-derived there non-vacuously). This seam's
  left side must therefore carry the **batch-2 tail constant's published values**, **pinned as literals at
  registration** — `50` / `30.417021`, i.e. `ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION` /
  `_EXEC_AT_REGISTRATION` (the shipped constants they are read from are `policy.ts`
  `ACT_III_B2_BATCH_PEAK_LEVEL_ID/_EXEC`) — and **never** `ACT_III_REGISTERED_TAIL_*` — which is a
  **different board by `0.038298`**, and typing it so would put a `0.038298` error into a **published
  bound** silently. *(Form corrected by GD-014b to the register's PIN-LITERAL law of
  ADR-architecture-0006 §17.4; the values, the bound and this property's substance are unchanged — see the
  constants paragraph and the register-wide law below.)*

The full label, verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `batch-seam` seam L50→L51 · `ΔD_exec ∈ [−2.667021, −1.354521]` (exact value filled in
> against this pre-published form once L51's `par` is selected; `par` term `−2` at the anchor) · band
> `[23.7500, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip, never a
> claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law does **not**
> fire: Act III introduces **no** mechanic unit (`M` unchanged; §7.10.5) — the batch-3 boards are
> **variety inside §7.2's Act III family** plus the **§7.10.8 XOR composition**, which is a new *read* of
> shipped primitives and not a new board feature (`ΔM = 0`, the §6.2.2 class). `act-peak`/`act-close`
> ride on the act's **measured maximum**, and §7.3.2's carrier sits on **`L51–L60`** — where the released
> `par 28` class (§7.10.9.1) discharges it **by arithmetic**, whatever `B`. **The relief is largely an
> artifact of the measurement design:** §7.10.6/§7.10.9's ladder is **derived** (anchor tie-break +
> released ceiling + fill at the truncated top), so the `par` term drops by **2 by construction** — the
> register's instances 2–6 are the same artifact of *their* ladders' anchoring, and §7.3.1's form already
> refuses to call that a designed rhythm (*"a measurement instrument is not a designed rhythm"*). The
> label asserts **no** ease the instrument cannot see — `D_exec` is **blind to comprehension** (`M`/`T`
> are not terms in it) — so *how the seam reads* is a **labelled Playtest hypothesis** (§7.3.3; the
> star-era instrument reads `NOT TESTABLE, n = 0`), not a result.

**Registration-side constants proposed — the PIN-LITERAL form** *(corrected by GD-014b, 2026-10-20, to the
register's form law of ADR-architecture-0006 §17.4; mirroring the `ACT_III_B1_OPEN_RELIEF_*` /
`ACT_III_B2_SEAM_RELIEF_*` triples — the **values**, the bound and the ledger arithmetic are unchanged)*:
`ACT_III_B3_SEAM_RELIEF_LEVEL_ID = 51`;
`ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 50` and
`ACT_III_B3_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION = 30.417021` — **literals**, each documented as
*instance 7's comparator as published at registration (`L50`, the batch-2 tail constant's published value,
this register's instance 7)* — and **never** `ACT_III_REGISTERED_TAIL_*`, which is **a different board by
`0.038298`**; `ACT_III_B3_SEAM_RELIEF_DELTA =
ACT_III_B3_SEAM_RELIEF_EXEC − ACT_III_B3_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION` — the published delta is
**DERIVED from the pin**, so **no later registration can restamp it**;
`ACT_III_B3_SEAM_RELIEF_DELTA_RANGE = [−2.667021, −1.354521]`;
`ACT_III_B3_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS = [{ par 24, [−2.667021, −1.354521] }]`; the exact
`_EXEC` / `_DELTA` are filled **only after selection and before the bytes**. A value outside the half is a
**STOP-AND-ROUTE to GD**. **Assertion — on the frozen pair only** (the file's existing `near()` idiom — `src/core/solver/policy.ts`, declarator `const near`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c`): *instance 7's published delta equals the published pair* — assert `near(_EXEC −
_PREVIOUS_EXEC_AT_REGISTRATION, _DELTA_AT_REGISTRATION)`, message naming **`F-GD014-1`**; the assertion is
**never** taken against `ACT_III_REGISTERED_TAIL_*`, whose movement is **lawful and expected**. The batch-2
tail constant (`ACT_III_B2_BATCH_PEAK_LEVEL_ID/_EXEC`) and the live act tail are **printed as readings**
beside the clause, **never raised as violations**. Ladder-side constants proposed: `ACT_III_B3_ANCHOR_PAR =
ACT_III_PAR_FLOOR + 2·(3−1)` (= `24`), `ACT_III_B3_PAR_MULTISET = [24, 26, 28, 28, 28]`,
`ACT_III_TAIL_PAR_CEILING_RELEASED = ACT_III_PAR_CEILING` (= `28`).

> **REGISTER-WIDE FORM LAW — text, added by GD-014b (2026-10-20) under ADR-architecture-0006 §17.4.**
> **A registered instance pins its published VALUES as literals; aliases only for pre-ticket STANDARDS and
> closed registered sets.** An alias is admissible **only** over a referent **frozen by construction** — a
> pre-ticket **standard**, or a measurement over a **closed, already-registered** id set (e.g. a batch
> peak) — and **never** over a value defined over a set that still **grows** (the act's registered ids:
> `src/core/solver/policy.ts`, declarator `export const ACT_III_REGISTERED_IDS` — **symbol-anchored, no
> integer**, per the cite-form law of **ADR-architecture-0006 §10, `ARCH-006c` row (2026-10-20)**: *cites
> into an era-decaying file anchor by symbol*; that is `F-GD014-1`'s hazard, and `ACT_III_PRE_R008_REGISTERED_TAIL_*` shares it).
> *(**ERA-FROZEN SUPERSESSION RECORD — not a live pointer**, kept verbatim: the 2026-10-20 pointer re-pin by
> GD-015. **ADR-architecture-0006 §10 / ARCH-006b** measured the declarator at `:2573–2576` — the copied
> cite read `:2572–2576` and landed on the **doc-comment above it**. A pointer-only fold-in: no value, no
> ruling and no sentence of this law moves. Under `ARCH-006c` this line **is a measurement at its own
> base**, not a cite to maintain; the live pointer is the symbol above, and nothing in this sentence is
> re-pinned again.)*
> *Why instance 7 is pinned even though a batch peak **is** a closed set:* the register's **instance form**
> is the pin (the instance-6 remedy **shape**), so a published instance's left side never depends on
> **another constant's typing** — the closed-set class keeps only the alias **permission**, which this
> instance does not need. The self-cancelling `ACT_III_B2_TAIL_ZERO_MOVE` (`src/core/solver/policy.ts`, declarator `export const ACT_III_B2_TAIL_ZERO_MOVE`; **symbol-anchored, no integer**, ADR-architecture-0006 §10 `ARCH-006c` — the published `policy.ts:2631–2632` is *exact* at base `d395549`) remains a
> **label, not a measurement**, and **must never** be cited as evidence that the act maximum did not move.

> **RIDER to §7.10.7's register-wide admissibility test (disclosed: one *reading* added, nothing
> narrowed).** GD-013's test reads: a `ΔM = 0` seam is registrable **iff its `par` term is negative**,
> *"whatever the `D_exec` sign"*. The release makes a **new corner reachable for the first time**: the
> degenerate B6 case (`L51` at `par 28`) has `Δpar = −2` **and**
> `ΔD_exec ∈ [+1.332979, +2.645479]` — a **rise** carrying a negative `par` term. **Ruling:** such a seam
> **still owes this register a pre-published entry** (nothing escapes by sign — GD-013's boundary is
> kept), but it is published **as what it is** — a **`par`-term-negative RISE**, the word *relief*
> replaced by *rise* in its header — because calling a rise a relief would be exactly the
> F-L31-2/F-L36-2 failure class: *a label that no longer describes the thing it measures*. The corner is
> **STOP-gated anyway** (§7.10.9.2 B6), so this is **pre-emptive law, not a live decision**.

> **Finding `F-GD014-1` (named, not fixed here — a constant-hygiene item for the level + architect lane).**
> **A registered instance's left side is a PUBLISHED NUMBER and may not move after registration.**
> Instance 6's comparator is **alias-typed** to `ACT_III_REGISTERED_TAIL_*`; that is correct **today**
> (`45` / `30.455319`) and stays correct through R-008 (the act maximum stays at `L45`) — but the released
> `par 28` class makes it **certain** that a later registration moves the act's maximum **off `L45`** (any
> `par 28` rung measures `≥ 31.7500 > 30.455319`). At that moment the alias re-points, and instance 6's
> **published** `_DELTA` (`−4.212830`) silently becomes a different number — a published label restamped
> by a constant, which is the mirror of the *law-before-bytes* order this register enforces. **Remedy, one
> line, in `policy.ts` (`src/core/solver/**` — the level lane's, with Architect sign-off; never a design
> edit):** freeze each registered instance's comparator as `_PREVIOUS_EXEC_AT_REGISTRATION`, **or** assert
> `near(...)` against the published value so the drift fails **loudly** — §7.9's
> constant/operator-alignment corollary, one register later.

**What this sub-section does *not* legislate, by name.** **Batch 4's (`L56–L60`) ladder** is **GD-015's**
era: this ruling binds it only through **B7** (multiset distinctness) and the act band. Nothing here
previews its multiset, its device placement, or its own seam label.

### 7.10.11 GD-015 published law — the `L56–L60` ladder at `ℓ = 4` (B1–B7 applied), B6's **no-fallback** reading, and the B7-vs-batch-3 conditional

> Owner: **Agent 1 — Game Designer** · Task **GD-015** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> (full record, `Original Hypothesis → Problem → Change → Evidence → Result`:
> `docs/decisions/design-0011-act-iii-closing-batch-law-and-act-max-rank.md` — a **rider** to
> ADR-design-0009 and ADR-design-0010, quoted and extended, **never edited**)
> Trigger: **§7.10.10's closing paragraph hands batch 4 to this era by name** ("Batch 4's (`L56–L60`) ladder
> is **GD-015's** era: this ruling binds it only through **B7** … and the act band"), while **§7.10.9.2 B7**
> binds it to differ from **every** landed Act III multiset **and from batch 4's** — a constraint the level
> lane cannot satisfy by search (§7.10.2's standard is **"a rule, not a search"**), and §7.5 forbids a
> batch registering with a caveat. The lane is therefore **gated on this section before its census**.

**Derived batch-4 ladder (law, before any census): `[26, 28, 28, 28, 28]`** — `L56 26 · L57 28 ·
L58 28 · L59 28 · L60 28`. Every clause is **GD-013's**; only `ℓ` moves, and it is shown moving:

| # | Clause at `ℓ = 4` | Content |
|---|---|---|
| **B1** | anchor advance (**the published tie-break**) | `A₄ = ACT_III_PAR_FLOOR + 2·(4−1) = 26` (read from the law module, not retyped) — the **third** application of the same one-P2-step advance, and the last batch the act has |
| **B2** | self-check against published law | the rule now reproduces **three** landed multisets **exactly** (`ACT_III_OPENER_PAR_MULTISET = [20,22,24,26,26]`, batch 2's `[22,24,26,26,26]`, batch 3's `[24,26,28,28,28]`) — one more self-check per batch is precisely what keeps the rule from becoming "a new rule wearing §7.10.2's clothes" |
| **B3** | the released ceiling, unchanged at `ℓ = 4` | `L56–L60`: `par ≤ ACT_III_PAR_CEILING = 28`; the first half's `par ≤ 26` scope and `par 27`'s inadmissibility are **UNCHANGED** (§7.10.6 B3 governs `L41–L50`; §7.10.9.1's **mod-2 derivation** governs every Act III ladder) |
| **B4** | truncate + fill (O2/O5 verbatim) | window from `26` = `[26, 28, 30, 32, 34]` → **truncated at the act ceiling `28`** → `[26, 28]`; the **3-rung** shortfall is absorbed by **repeats at the truncated top** ⇒ `[26, 28, 28, 28, 28]` |
| **B5** | within-par convention + plural-same-par tie-break | the closing rung `L60` takes the within-par **maximum**; `L56` (the only non-`par 28` rung) the **minimum**; the **three** non-final `par 28` rungs (`L57`, `L58`, `L59`) take the pool's **lowest** accepted `D_exec` values in **ascending id order** — the **third** occurrence of the plural-same-par case (one non-final `par 26` rung at `ℓ = 1`, two at `ℓ = 2`/`ℓ = 3`, **three** here), so the convention is now exercised at every multiplicity the act can produce |
| **B6** | empty pool ⇒ ABSENT, never substituted — **and at `ℓ = 4` there is NO non-flat fallback** | the post-truncation window is the **two-value** set `{26, 28}`: removing **either** value leaves a **singleton** — `[28×5]` if `26` is absent, `[26×5]` if `28` is absent — and **both are flat batches with no interior rise** ⇒ **STOP-AND-ROUTE to GD** in **each** case. `[28×5]` is exactly GD-013's named degenerate case; the STOP is on the **flatness** (*"a shape no published clause authorises"*), generalised off the ceiling, and `[26×5]` adds a second arithmetic ground for the same STOP: a batch that never enters the released class cannot discharge §7.3.2's carrier and cannot meet §7.10.13's act-max rank duty, so it is not a shape this act may close on |
| **B7** | anti-mirror (O4 verbatim, generalised) | must differ from every registered Act II multiset (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`), from batch 1's `[20,22,24,26,26]`, batch 2's `[22,24,26,26,26]` and batch 3's `[24,26,28,28,28]` — **and from batch 3's REALISED multiset**, which is not yet known (the conditional below). Coinciding pars are **printed, never hidden** |

**Uniqueness, stated honestly (the GD-013/GD-014 form — the tie-break stays a tie-break).** The multiset is
**unique GIVEN B1's anchor**, and the anchor is chosen by GD-013's published **tie-break**, not by a
derivation. Applied at `ℓ = 4`, its three grounds read:

- **(i) the minimum admissible advance — SURVIVES, and alone selects `26`.** `A₄ = 24` (zero advance)
  reproduces batch 3's multiset exactly (`[24,26,28,28,28]`), which **B7 refuses**; `26` is therefore the
  smallest admissible advance. *Still the load-bearing ground.*
- **(ii) "every value of the derived window keeps a home in the act's ladders" — SPENT at `ℓ = 3`, and
  recorded as spent rather than re-asserted a second time.** Under `A₄ = 26` the homes read `20`(B1) ·
  `22`(B1,B2) · `24`(B1,B2,B3) · `26`(B1…B4) · `28`(B3,B4) — **every window value has a home either way**,
  so the ground cannot discriminate here at all. It stays *checkable* and it no longer selects.
- **(iii) the minimality convention — SURVIVES** (O6's form inside a par; LV-015/LV-017's minimal `D_exec`,
  then enumeration order, inside a value).

**It is labelled a tie-break and is not claimed as a derivation.** If a census contradicts (i) or (iii),
that measurement is the trigger for a **replacement rule with its own ADR** — the part of GD-013 a census
may legitimately falsify, and this section adds **no** immunity to it.

**Interior structure of the batch, and what it costs the close (arithmetic, not taste).** The **only**
`Δpar` step in the batch is `L56→L57` (`26 → 28`, `Δpar = +2`, P2); the other three steps are **`Δpar = 0`**
by construction (B4's fill). At `par 28` the **entire reachable span** is
`33.0625 − 31.7500 = 1.3125` — i.e. **4.31 % of the act's registered tail** (`1.3125 / 30.455319`) — so
after `L57` the batch has **no par headroom left** and the close's intensity must be carried by the
**board and the device**, not by the ladder. That is the measurement reason behind §7.10.13's pacing map,
and it is stated here so the pacing cannot later be mistaken for a preference.

**Carrier, and what this batch carries.** Every `par 28` rung of this batch measures `≥ 31.7500`, against
the act's registered maximum `30.455319 @ L45` — so **any** of `L57–L60` carries §7.3.2's `act-close` and
§7.3's `act-peak` **by measurement alone** (`+1.294681` at the floor; `+2.607181` at the band ceiling).
`L56` (`par 26`) cannot: its ceiling is `31.0625 < 31.7500` — the same `0.6875` `ACT_III_CEILING_RESERVATION_MARGIN`
that reserved the class in the first place. The **rank** question inside the close (does `L60` outrank
`L55`?) is ruled at **§7.10.13**; this section only reports the arithmetic that makes it a one-line
comparison.

**Census obligation, never a promise (§7.0).** The released class is non-empty in the **Act III `G`-family**
pool (LV-018 `par 28: 556`, LV-019's pre-fix `529`) but that pool is **not** the **`H` both-pair** lattice
(§7.4 stage `H`), which is **still uncensused** — so **no ceiling claim is publishable in either direction**
for `L56–L60` either. If `H` cannot populate this ladder, **B6 governs** (the no-fallback STOP above) —
**never** a substitute par, never a borrowed registered ladder, never a re-anchored batch.

**Mechanics stance is unchanged (§7.10.5, U-002):** `ΔM = 0`; **no** new mechanic unit, **no** new board
feature, **no** new device contract, **no** architect impact, and **no** rung of `L56–L60` may be scored as
a debut. Device placement is ruled at §7.10.13.

> **§7.10.11 B7-vs-BATCH-3 — the NAMED CONDITIONAL (published pre-census; a conditional, never a false
> certainty).** B7 at `ℓ = 4` is stated above against batch 3's **LAW** multiset `[24,26,28,28,28]`. Batch 3's
> **REALISED** multiset is **unknown today** (LV-020's census has not run) and **B6 can move it**: every
> admissible B6 outcome at `ℓ = 3` is one of `[22,26,28,28,28]` (`24` absent) · `[24,24,28,28,28]` (`26`
> absent) · `[24,26,26,26,26]` (`28` absent) · `[28×5]` (`24` **and** `26` absent — already STOP-gated by
> §7.10.9.2 B6, so it may not be registered at all). **The published procedure, exactly:**
> **(1)** LV-020's census **must print batch 3's realised multiset before batch 4's ladder is frozen** — the
> multiset is a value the lane already computes for B2's self-check, so no new instrument is owed;
> **(2)** the batch-4 ladder tool **re-runs B7 as a MULTISET-INEQUALITY over the REALISED set**, not over the
> law set — a pairwise par comparison is **not** the test (batch 4 shares `26` and `28` with batch 3 by
> construction; coinciding pars are printed, never hidden) — and it does so **pre-census** for batch 4, since
> the frozen ladder is precisely what that census searches against;
> **(3)** on **equality** the tool **writes nothing**, prints both multisets side by side, and
> **STOP-AND-ROUTES to GD** — the only free parameter left is B1's published tie-break advance, and
> re-anchoring it is a **design decision with its own ADR**, never a tool fix and never a widened gate;
> **(4)** on **inequality** the ladder stands as published, and the lane prints the realised batch-3 multiset
> beside it as the B7 witness.
> **What is known today, stated as a reading and not as a guarantee:** **none** of the three admissible
> non-gated B6 outcomes of batch 3 equals `[26,28,28,28,28]` — a B6 fill only ever **removes** values from a
> batch's own window, and batch 3's anchor is `24`, so no B6 path can raise a batch-3 rung to `26`. The
> conditional is published anyway, because a law that assumes its neighbour's census outcome is exactly the
> class of certainty this register has refused since instance 3.

### 7.10.12 GD-015 — the `L55→L56` `batch-seam` relief, pre-published (register §7.3.1 **instance 8**), and the register's first COMPARATOR-FREE bound

**Why the seam exists, in arithmetic rather than in taste.** B1 anchors batch 4 at `par 26` while `L55`
(the batch-3 closing rung, B5's within-par maximum of the released class) sits at `par 28`, so the seam's
`par` term is **negative by construction** (`Δpar = −2`) — a §7.3 interior relaxation at a `ΔM = 0`
boundary, and §7.3.1's rule is absolute: **an unlabelled relief is not registrable.** So it is labelled
**here, before the census and before any byte**, with the exact value left a **fill-in against this
published form** (the instance-5/-6/-7 order: bound → fill-in → bytes).

**The published bound — and the property that makes it new: it needs NO comparator's number.** Derivation
shown, with every constant read from the law module (`D_exec = par + 3·B`; `B ∈ [1.2500, 1.6875]` from
`ACT_III_B_BAND = BLOCK_L1619_B_BAND`):

```text
ΔD_exec = Δpar + 3·ΔB            with Δpar = 26 − 28 = −2   (BOTH pars are LAW, not selections)
ΔB      ∈ [1.2500 − 1.6875, 1.6875 − 1.2500] = [−0.4375, +0.4375]
⇒ ΔD_exec ∈ [−3.3125, −0.6875]      (equivalently: [29.7500, 31.0625] − [31.7500, 33.0625])
SIGN IS FIXED BY THE BAND:  |3·ΔB| ≤ 1.3125 < |Δpar| = 2  ⇒  ΔD_exec < 0 for EVERY in-band pair
```

Three properties, stated so the lane **verifies** rather than trusts.

- **(a) It is the register's first COMPARATOR-FREE bound, and the reason is checkable.** Instances 1–7 all
  publish a bound built on a **measured comparator** (`L20 = 24.729412`, `L25 = 27.604651`, …,
  `L50 = 30.417021`); instance 8 needs none, because **`Δpar` is fixed by published law** (B1's anchor at
  `ℓ = 4`, batch 3's closing par by B4/B5) and the `B` term is bounded by the **published band**. *The
  general form, named so it can be reused rather than rediscovered:* **when `Δpar` is fixed by law and
  `3·(B_hi − B_lo) < |Δpar|`, the seam's SIGN and its numeric bound are comparator-independent** — the
  lane may publish a bound **before either board exists**, and the fill-in is a *check against that bound*,
  never a derivation of it. **The 1.3125 is not a new constant:** it is `3·(B_hi − B_lo)`, the same number
  §7.10.7 published as the `Δpar = 0` residue bound — quoted here as a **checkable coincidence**, never as
  a template.
- **(b) It is a single half, not a union — and unlike instance 6 there is no second half to publish.**
  Instance 6's union existed because B6 had a **non-flat** fallback (`par 24`); instance 7's single half
  existed because its fallback had `Δpar = 0`; instance 8's single half exists because B6's fallbacks are
  **both flat batches** (§7.10.11 B6) and therefore **STOP-gated** — i.e. the seam's only admissible left
  `par` is B1's anchor `26`. **A fill-in is checked against this half and never against a hull.**
- **(c) The bound's midpoint is exactly the `par` term (`−2`), and the `B` half contributes `±0.65625`.**
  So the label's decomposition is readable at a glance: `−2 − 0.65625 … −2 + 0.65625`. The **value** must
  still be L56's own: it is computed from the two boards' measured `D_exec` and is **never** quoted from
  any other instance's `Δ` — the register's standing rule since instance 5 (`F-L31-2`/`F-L36-2`: *a label
  that no longer describes the thing it measures*).

The full label, verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `batch-seam` seam L55→L56 · `ΔD_exec ∈ [−3.3125, −0.6875]` (exact value filled in
> against this pre-published form once L56's `par` is selected; `par` term `−2` at the anchor — and the
> bound is **comparator-free**: no measured left-side value enters it, because the two `par` values are law
> and the `B` term is bounded by the band) · band `[23.7500, 33.0625]` (printed `[23.75, 33.06]`).**
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip, never a
> claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law does **not**
> fire: Act III introduces **no** mechanic unit (`M` unchanged; §7.10.5), the XOR composition is a new
> *read* of shipped primitives (§7.10.8, `ΔM = 0`), and the batch-4 boards are **variety inside §7.2's Act
> III family**. `act-close`/`act-peak` ride on the act's **measured maximum** (any `par 28` rung of this
> batch clears the registered tail by `≥ +1.294681`), never on this relief. **The relief is an artifact of
> the measurement design, and it says so:** §7.10.11's ladder is **derived** (anchor tie-break + released
> ceiling + fill at the truncated top), so the `par` term drops by `2` **by construction** — the register's
> instances 2–7 are the same artifact of *their* ladders' anchoring, and §7.3.1's form already refuses to
> call that a designed rhythm (*"a measurement instrument is not a designed rhythm"*). The label asserts
> **no** ease the instrument cannot see — `D_exec` is **blind to comprehension** (`M`/`T` are not terms in
> it) — so *how the seam reads* (mastery rest or deflation) is a **labelled Playtest hypothesis** (§7.3.3;
> the star-era instrument reads `NOT TESTABLE, n = 0`), not a result.

> **What the comparator-free bound does NOT license — the dilation conditional, named.** The bound holds
> **iff both boards' `B` sit in the published band** (§7.5: a rung outside it must be **NAMED in the
> F-L16-2 excursion register**). If `L55` **or** `L56` lands a **named excursion**, the band-width step is
> void: the label's value becomes a **fill-in against the measured pair**, the published range is
> **retired for that instance** (it may not be widened to cover the excursion), and the lane
> **STOP-AND-ROUTES to GD** — never a widened bound, never a silently re-published range.
> Second named-conditional, on the other side: if batch 3 cannot populate the released class and its
> realised closing par moves off `28` (B6 fallbacks, §7.10.9.2), then `Δpar = 0` or positive, §7.10.7's
> **register-wide test** makes the seam **not a relief**, and **this instance is void as published** —
> the seam is then published as an **instrument reading** (residue bounded by `1.3125`) or as a
> **`par`-term-negative RISE**, whichever the measurement shows, and that re-publication is a **GD ruling**.
> Both conditionals are published because batch 3's census is in the **future** and this register does not
> trade in certainties it has not measured.

**Registration-side constants proposed — the PIN-LITERAL form (§7.10.10's register-wide form law).**
`ACT_III_B4_SEAM_RELIEF_LEVEL_ID = 56`;
`ACT_III_B4_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 55` and
`ACT_III_B4_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION = <L55's registered value>` as **literals**, each
documented as *instance 8's comparator as published at registration* — filled **only after batch 3
registers and before the bytes**; `ACT_III_B4_SEAM_RELIEF_DELTA =
ACT_III_B4_SEAM_RELIEF_EXEC − ACT_III_B4_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION`, **derived from the
pin**, so no later registration can restamp it; `ACT_III_B4_SEAM_RELIEF_DELTA_RANGE = [−3.3125, −0.6875]`;
`ACT_III_B4_SEAM_RELIEF_ADMISSIBLE_FIRST_RUNGS = [{ par 26, [−3.3125, −0.6875] }]`. Ladder-side constants
proposed: `ACT_III_B4_ANCHOR_PAR = ACT_III_PAR_FLOOR + 2·(4−1)` (= `26`),
`ACT_III_B4_PAR_MULTISET = [26, 28, 28, 28, 28]`, `ACT_III_B4_TAIL_PAR_CEILING = ACT_III_PAR_CEILING`.

> **Finding `F-GD015-1` (named, not fixed here — a register-form item for the level + architect lane).**
> **Instance 8 is the register's first seam whose left side CANNOT be alias-typed, even transiently:**
> `L55` is itself a rung that moves the act's maximum off `L45` (any `par 28` rung measures `≥ 31.7500 >
> 30.455319`), so an alias to `ACT_III_REGISTERED_TAIL_*` written for this instance would be **wrong on the
> day it was written** — this is `F-GD014-1`'s hazard reached rather than hypothetical. **The same
> registration train that writes instance 8's pin is the train that must re-pin instance 6** (its
> `_PREVIOUS_EXEC` is alias-typed to the act tail; §7.10.10's remedy shape: freeze it as
> `_PREVIOUS_EXEC_AT_REGISTRATION`, or assert `near(...)` against the published value so drift fails
> **loudly**), **and instance 7's claim** that its pin "can never be restamped" holds **only** while its
> literal stays a literal — item 167's two disclosed growing-alias instances (`src/core/solver/policy.ts`, declarators `export const ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID` / `export const ACT_III_PRE_R008_REGISTERED_TAIL_EXEC`, and the self-cancelling `export const ACT_III_B2_TAIL_ZERO_MOVE` — all three **symbol-anchored, no integers**, ADR-architecture-0006 §10 `ARCH-006c`; the published `:2584` / `:2587` / `:2631–2632` are *exact* at base `d395549`) are the same class and belong to the **same** re-pin. **Nothing here
> edits `src/**`**: the remedy is the level lane's, with Architect sign-off.

### 7.10.13 GD-015 published law — the ACT-MAX RANK ruling for Act III (does `L60` outrank `L55`?), the plateau-top arithmetic, and the `L56–L60` XOR pacing

#### 7.10.13.1 The question, and why it is answerable in one line

§7.3.2's `act-close` clause fixes the act maximum's **place** (last two batches) and **says nothing about
rank inside that place** — and its own rider (§7.3.2, GD-015) asks whether an act's **last** board must be
its **strongest**. For Act III the question collapses by arithmetic to a **single comparison**:

- `L56` (`par 26`) can never be the act maximum: its ceiling is `31.0625 < 31.7500 ≤` any `par 28` rung.
- `L57–L59` are B5 **within-par minima** of the `par 28` pool, so `L60` (`par 28`, within-par **maximum**)
  outranks them **by law**.
- ⇒ the act's maximum is either **`L55`** (batch 3's closing rung, also a B5 within-par maximum of the
  released class) or **`L60`**. The two are **disjoint pools of one class**, structurally identical in role,
  and the band **admits either order**: it permits `L55 = 33.0625` with `L60 = 31.7500` — an inversion of up
  to **1.3125**.

#### 7.10.13.2 The plateau-top arithmetic — is `par 28 × 4` a climax or a fog?

```text
reachable span at par 28 : 33.0625 − 31.7500 = 1.3125   (= 3·(B_hi − B_lo))
as a share of the act's registered tail : 1.3125 / 30.455319 = 4.31 %
batch-4 top four rungs all live inside that width; three of the batch's four steps are Δpar = 0
```

So the batch's top is a **real plateau in the file**: four rungs at one par inside a `1.3125` window, i.e.
**4.3 %** of the act's current tail magnitude. **Stated out loud, because the decision turns on it:** the
plateau is **not** a player-facing fog, and that is a **published fact, not a preference** — `par` is never
shown live (`GD-OQ1`, §7.1) and `D_exec` is not player-visible at all, so four `par 28` rungs are invisible
as repetition; what the player meets on `L57–L60` is four **mechanically distinct** boards (clone guard,
§6.1.4) whose only shared property is an unshown number. **A plateau the player cannot see cannot read as a
fog**; a repeat the player *can* see would be the clone guard's business, and it is green there. Equally
honestly: the **climax is board-side** — the device's densest expression plus R1–R6 legibility — **not** a
shown number, so the rank law below **cannot** manufacture a felt climax; what it can do is stop the *file*
from contradicting the clause it publishes.

#### 7.10.13.3 The three options, what the band/ceiling permits for each, and the ruling

| Option | What the band permits | Verdict |
|---|---|---|
| **(A) `L60` must be the within-act MAXIMUM** (`D_exec(L60) ≥` every registered rung) | **Permitted at zero cost:** both candidates live in the same `1.3125`-wide class window and the ceiling `33.0625` is **shared**, so the duty spends **no** headroom and creates **no** padding pressure. **Not guaranteed by the band:** the band admits an inversion of up to `1.3125`, so the duty must be enforced by a **comparison**, never by containment | **ADOPTED — in its strongest satisfiable form** (below) |
| **(B) max-within-batch-4 only** | Automatic: B5's closing-rung-max already gives it. Costs nothing, **guarantees nothing about the act** | **ADOPTED as a consequence, never as a substitute** — it does not answer the question that was asked |
| **(C) unconstrained** | Permitted by the band; the act would be free to close on its **lowest**-measured `par 28` rung while its strongest board sits at `L55` | **REFUSED** |

**RULING (A), enforced as a PRE-BYTE PROGRAM COMPARISON with a NAMED SHORTFALL.** (i) `L60` takes the
within-par **maximum** of its own pool (B5, unchanged); (ii) **before the bytes**, the tail's instrument
compares `D_exec(L60)` against `D_exec(L55)` (batch 3 is registered by then, so `L55` is a measured
number); (iii) if `D_exec(L60) ≥ D_exec(L55)` the clause is **satisfied by measurement** and the act
maximum lands on `L60`; (iv) if it does **not**, batch 4 **does not re-anchor, does not pad, does not
reject a proven board** — the act closes with its maximum at `L55` and the inversion is published as a
**NAMED act limitation with both measured numbers** (§7.3.2's escape hatch, inherited verbatim), which
**does not block registration** (§7.5's no-caveat rule is untouched: the caveat is on the act's shape,
never on a board's proof). (v) The comparison is **not** a gate on `B` or on the census — it never rejects a
candidate for a board-side reason; it only decides whether a limitation line is owed.

**Why (A) and not (C) — said out loud, in the priority order's own terms.** **(1) Comprehension:** the
plateau is invisible in play (above), so "five same-par rungs" is **not** a comprehension risk and cannot be
used to refuse the plateau — the same fact that makes the plateau harmless makes an *inversion* harmless to
the player, and the decision therefore cannot be justified by felt experience at all; it is justified by
**the file's own honesty**. **(2) The clause's published Result:** §7.3.2 promises that an act reads as *"a
shape with a culmination rather than … one long plateau"*; (C) would let the file publish that sentence
about an act whose last board is its **weakest-measured** ceiling rung, which is exactly the
`F-L31-2`/`F-L36-2` failure class — *a label that no longer describes the thing it measures*. **(3) Fun >
Comprehension > Depth:** the climax must be delivered where the player meets it — the **board** — and the
rank duty is the cheapest available way to keep the *record* behind that board consistent; it changes no
board, no `par`, no weight, and no star row. **(4) Cost:** zero headroom, one comparison, one named
fallback. **(5) Evidence discipline:** there is **no playtest datum** (`NOT TESTABLE, n = 0`), so the parts
of this ruling that are *arithmetic* (the ceiling, the `1.3125` span, the zero headroom cost, the one-line
comparison) are law, and the parts that are *felt* (that a culmination reads better than a decay) are
**labelled hypothesis**, never asserted as result. **A testable prediction, published so it can fail:**
if the act closes at `L55 > L60` and the Playtest lens later measures a **climb** in `M5/M6` or replay
share across `L57→L60`, the rank duty is **falsified on the felt axis** and is withdrawn with its own ADR —
my own sawtooth preference is **not** evidence (AGENTS §7).

#### 7.10.13.4 XOR pacing through `L56–L60` (C4 continued) — `ΔM = 0` holds to the close

§7.10.8.2 **C4** paced `L51–L55` (L51 none · L52 first encounter **below OFFERED** · L53 **OFFERED** ·
L54 **FORCED** · L55 **FORCED** at within-par max). The T1–T4 teaching cycle is **complete at `L55`**, so
`L56–L60` is the act's **expression** phase: the device is **no longer a novelty**, but §7.10.5 still
forbids scoring any rung as a debut, `M` stays `4` on all five, and no new board feature may appear.

| Rung | `par` | XOR grade | Why this rung, in the register's terms |
|---|---|---|---|
| **`L56`** | `26` | **OFFERED, never FORCED** — `switchRequired: "exempt"` **with its measured reason** (never `null`, the L6 / L11 / L12 precedent) | It is the §7.3.1 **instance-8 relief** rung: §7.3's form says a relief **"discharges no clause and satisfies none"**, and C4's own construction-floor reasoning (**one demand at a time**) applies to a *demand* even when the device is no longer new. A relief rung may carry the device; it may not carry an **obligation**. Board density must not exceed the batch-3 close (design intent, published as intent — the machine-checkable part is the grade) |
| **`L57`** | `28` | **OFFERED** (an XOR-free same-par route exists) | The batch's **lowest-measured** `par 28` rung (B5's ascending-id minimums), so the released class arrives **undemanded** — this keeps the **demand grade monotone in the batch's own measured order** (`L57 < L58 < L59 < L60` by B5, and grade never falls as measurement rises). A weaker demand on a *higher*-measured board would be a self-contradiction the file could not explain |
| **`L58`** | `28` | **FORCED** (`switchRequired: "required"` **measured**: all-OFF UNSATISFIABLE, `G2-X` on every par route) | The first demand of the close; the plateau's measurement gradient now rises under a rising demand |
| **`L59`** | `28` | **FORCED** | Second demand — §7.3.2's **sawtooth read at batch scale** (peak → breath → re-climb): after `L56`'s breath and `L57`'s offered rung, the close re-climbs into the demand |
| **`L60`** | `28` | **FORCED at the within-par MAXIMUM** (B5) — the act's closing board | The act's last board **and** the subject of §7.10.13.3's rank duty. Densest expression, **zero text** (R6), `G2-X` on every par route, `T ≡ R ≡ 0` |

**Cross-checks each rung owes (§7.10.8.2 C3 / §7.10.8.3).** Every XOR rung must satisfy **R1–R6** and the
**R5** refusal witness (`refusedBeforeEnteredTiles ≥ 1` **and** a state where both feeders are ON and the
door refuses); a door that closes behind the player is legal **iff** the goal stays reachable — the shipped
`deadStates 0` / `noUnrecoverableOk` / `T ≡ R ≡ 0` proof refuses the trap class unchanged; and **`G2-X`**,
not the membership reader, is the witness on every FORCED rung. **The named comprehension risk** (§7.10.8.3:
*"a press un-opened the door reads as inconsistent"*) now has a **second** window worth measuring — the
post-teaching plateau (`L58` vs `L57`) — and it is a **labelled PA hypothesis** with the same
redesign-never-relabel rule.

**Refusals, with arithmetic where arithmetic exists (and named as unmeasured where it does not).**

- **REFUSED — a "louder finale" rung above the class.** `par 29`/`par 30` are **out of band at the par
  level** (`> ACT_III_PAR_CEILING = 28`, an integer comparison with no operator question) **and** have no
  home in any Act III ladder (`par ≡ ACT_III_PAR_FLOOR (mod 2)`, §7.10.9.1). The `D_exec` band alone would
  **not** refuse `par 29`: `29 + 3·1.2500 = 32.7500` is inside `[23.7500, 33.0625]` — so a lane that
  checked containment only would let it in; `29 + 3·1.6875 = 34.0625` and `30 + 3·1.2500 = 33.7500` both
  exceed the ceiling by `1.0` and `0.6875` respectively. **The refusal is the par band plus the derivation**,
  which is precisely why both are written down here.
- **REFUSED — the `5-pocket` device, still refused and still UNcensused** (§7.10.5, unchanged). Recorded
  honestly as **unmeasured**, not as arithmetic-refused: zero census, so no bound exists to publish.
- **REFUSED — any second-derivation / schema / validator change for the XOR composition** (§7.10.8.1:
  option (a) DERIVABLE; ARCH-006 signed representation as `targets` multiplicity). `ΔM = 0` therefore holds
  **through the close by code reading**, not by decree.
- **REFUSED — scoring any `L56–L60` rung as a debut** (§7.10.5), and **REFUSED — a flat closing batch**
  (§7.10.11 B6: `[28×5]` / `[26×5]` are STOP-gated; the close may not be built from a shape no published
  clause authorises).

**`ΔM = 0` through the act close — the standing sentence.** No new mechanic unit, no new board feature, no
new device contract, no architect impact, no debut grade, and no new player-facing text (R6). Everything
`L56–L60` adds is **composition over shipped law**: the released `par 28` class, the proven
`4-pocket / 5-door / 5-press` device class, and §7.10.8's XOR read of shipped primitives.

### 7.11 GD-016 published law — the Act IV band (derived-exact), the `L61–L65` opener rule, the reservation's Act IV scope, and the `L60→L61` `act-open` relief pre-published (register §7.3.1 **instance 9**)

> Owner: **Agent 1 — Game Designer** · Task **GD-016** · Date **2026-10-20** · Status: **PUBLISHED LAW**
> (full record, `Original Hypothesis → Problem → Change → Evidence → Result`:
> `docs/decisions/design-0012-act-iv-band-opener-and-act-seam-relief.md` — a **new** record that is itself a
> **rider** to ADR-design-0005 and ADR-design-0008, both quoted and extended, **never edited**)
> Trigger: Act III's tail (`L56–L60`) is ruled and its census era is next, and **an act's band and opener are
> ruled BEFORE its first census** — the precedent GD-012 set for Act III in exactly these words ("Act III was
> ruled exactly this way before its first census"). No Act IV byte exists, and none may until this section
> lands. The **Act IV juncture** is also where §7.10.5 booked the chain-envelope question to the Architect
> (answered by ADR-architecture-0005, quoted here only as a pointer — this section reads **no** cross-act walk).

#### 7.11.0 What this section does and does not publish (integrity statement, read first)

| Quantity | Published here? | Why |
|---|---|---|
| Act IV's **`par` band** `24–32` | **NO — already law** | §7.2's act table publishes it (from ADR-design-0005 RULING B); this section **quotes** it and derives from it. |
| Act IV's **`D_exec` band** | **YES — derived, not invented** | `[PAR_FLOOR + 3·B_lo, PAR_CEILING + 3·B_hi]` over the **measured** `B` band; no new weight, no new metric, no new arithmetic (§7.0). |
| The **opener's selection rule** (`L61–L65`) | **YES — as law** | §7.10.2's O1–O6 **re-based** on Act IV's own constants: a rule, not a search (§7.10.2's standard). |
| The opener's **`D_exec` values** | **NO** | They do not exist until the stage-`I` census selects rungs; only the multiset rule is law. |
| Act IV's **registered maximum** / per-rung numbers | **NO** | §3.5's silence above the last measured row is untouched; the act's peak is a **measurement** made when a batch lands. |
| A promise that `par 30` / `par 32` / the stage-`I`/`J` lattices are authorable | **NO** | **Named census obligations** on the level lane (§7.4), never promises (§7.0). |
| Whether `H` populates Act III's tail, or stage `I`/`J` populates anything | **NO — nothing, in either direction** | `H` is **uncensused** (§7.10.11's own wording) and stages `I`/`J` have **no census at all**; **no ceiling claim is publishable in either direction** — O5's ABSENT/STOP discipline governs, never a substitute ladder. |

Reused laws, unchanged: the locked core loop (one move ⇒ one flip, no manual switch button, illegal = no move
and no flip); the checkerboard invariant (ADR-0009); entry-only solidity and never-crushed (ADR-0008 rules
1–7); other-phase wall echo (ADR-0007); opposite-colour portals only; one switch per door below the XOR
allowance; `T ≡ R ≡ 0`; §7's interior freedom; §7.3.1's label-before-bytes order; §7.3.2's carrier clause;
§7.9's derive-from-formula law; §6.1.1's P2; §6.1.4's clone guard; §6.1.6's registry gate.

**Two range readings corrected by the plan of record (the GD-012 precedent, quoted).** GD-012's own changelog
row records *"the dispatch's 'L41–L6x' resolves to L60"* — a dispatch restatement is corrected against §7.2,
never the reverse. Applied here:

- **Act IV is `L61–L80`** (§7.2's row IV: four batches of five), **not** `L61–L70`; `L61–L70` is the act's
  **first half**, and that is exactly the `par ≤ 30` scope §7.11.3 publishes.
- **§7.3.2's carrier window for Act IV is `L71–L80`** — the clause's own text puts the carrier on an act's
  **last two batches** ("for Act II: `L31–L40`"), and §7.10.1 reads Act III's as `L51–L60`. A carrier claim on
  `L61–L70` would cite the wrong half of the act.

#### 7.11.1 The Act IV EXEC band, derived-exact (§7.9 notation)

| Constant | Value | Derivation |
|---|---|---|
| `ACT_IV_PAR_FLOOR` | **`24`** | §7.2's Act IV `par` band, lower endpoint |
| `ACT_IV_PAR_CEILING` | **`32`** | §7.2's Act IV `par` band, upper endpoint |
| `B` band | **`[1.2500, 1.6875]`** | measured, re-derived from L1–L15 every run, never widened; act-invariant **by reference** (assumption A1 below) |
| `EXEC_FLOOR` | **`27.7500`** | `24 + 3·1.2500` |
| `EXEC_CEILING` | **`37.0625`** | `32 + 3·1.6875` |
| **Act IV `D_exec` band** | **`[27.7500, 37.0625]`**, *printed* `[27.75, 37.06]` | inclusive at both ends (§7.9); both endpoints dyadic ⇒ IEEE-754 bit-exact |

```text
band law, derived from §7.2's own Act IV row   (the ONLY source — §7.11.0's integrity row):
  ACT_IV_PAR_FLOOR = 24  ·  ACT_IV_PAR_CEILING = 32        (§7.2's row IV; ADR-design-0005 RULING B)
  EXEC_FLOOR   = 24 + 3·1.2500 = 27.7500
  EXEC_CEILING = 32 + 3·1.6875 = 37.0625
  §7.2's printed Act IV row is [27.75, 37.06] — the display rounding of exactly this pair (§7.9)

growth READ-OUT, cross-checked against the block above  (an INDUCTION, never a second derivation):
  floors   : 16 (II) · 20 (III) · 24 (IV) · 28 (V)              ⇒ +4 per act
  ceilings : floor + 8                                          ⇒ +4 per act
  §7.10.1's read-out of Act II→III: "translates Act II's by exactly +4.0 on both ends (ΔEXEC = ΔPAR)"
  applied  : [23.7500, 33.0625] + 4 = [27.7500, 37.0625]   — agrees to the last digit
  BASIS    : ONE observed step (Act II→III). Act I is EXCLUDED — §7.2's Act I row is a MEASURED
             `9.00–24.73` over a `4–20` rung ladder, not a derived band over a per-act `par` row,
             so it is not a second instance of the pattern and cannot be counted as one.
  WHY THE AGREEMENT IS NOT EVIDENCE OF TWO ROUTES: both computations bottom on the SAME designed
             table (§7.2's per-act rows); the read-out is what those rows' own `+4` par step
             REPRODUCES, so the agreement says the read-out is NOT CONTRADICTED — never that an
             independent route to the number exists.
```

The derivation and the read-out **agree to the last digit**, so the **published law uniquely determines** Act
IV's band and **no STOP-AND-ROUTE is owed** (contrast: had §7.2's own Act IV row disagreed with the read-out
by even one `LAW_PRECISION` quantum, this section would have had to name the admissible readings and STOP
rather than pick by taste).

**Corrigendum (RV-015 item 2, dated 2026-10-20 — the `+4` label).** The two computations were published as
**independent readings**; they are not, for the reason printed in the `BASIS`/`WHY` lines above. The form of
the fix is **RULED — the FORBID sentence, not a dated assumption `A4`**: an *assumption* is something a
derivation **leans on**, and publishing the `+4` step as one would re-import exactly the misreading this
corrigendum removes (`A1`–`A3` remain the only assumptions this section leans on). What binds instead:

> **FORBID (dated 2026-10-20, GD-016b).** **No future act's band may be DERIVED FROM the `+4` step.** Bands
> anchor through **§7.2's per-act rows** — each act's own `par` band read from the table, then
> `[par_min + 3·B_lo, par_max + 3·B_hi]` (§7.9) — which is what **§7.11.0's integrity row** already
> publishes (*Act IV's `par` band: "NO — already law … this section **quotes** it and derives from it"*). The
> `+4` read-out is a **cross-check on that derivation and never its source**.
> **Falsifier, published so the read-out can fail without any value moving:** if a future act's §7.2 row
> yields a `ΔPAR ≠ +4` step, the `+4` **pattern is falsified for that step** and must be withdrawn **as a
> pattern** — **no band moves**, because no band was ever derived from it.

**Assumptions the derivation leans on, each dated and each falsifiable.**

- **A1 (2026-10-20) — the `B` band is act-invariant BY REFERENCE, not by re-measurement.** `policy.ts`'s
  `ACT_II_B_BAND` and `ACT_III_B_BAND` are both **aliases of `BLOCK_L1619_B_BAND`** = `[1.2500, 1.6875]` (the
  L1–L15 measurement); Act IV's band is derived on the **same** reference. The alternative reading (a fresh
  per-act `B` band) is **unbuildable before a census** and would reprice every published band. If a census
  ever widens the measured band, **every** act band moves: that is a design change (this file + an ADR),
  never a generation outcome (§7.3).
- **A2 (2026-10-20)** — the derivation uses `D_exec = par + 3·B` (the measured theorem, `T ≡ R ≡ 0`) and
  §7.9's rule (derive from the formula; a printed band value is never a comparison operand).
- **A3 (2026-10-20)** — the plan of record's act boundaries (§7.11.0's correction) hold. A re-split of the
  100 levels across acts would re-open this whole section, not one line of it.

**Read-outs, each stated so it can be checked rather than trusted.**

- **Both endpoints are dyadic** (`27.7500 = 111/4`, `37.0625 = 593/16`) ⇒ bit-exact, and §7.9's inclusivity
  is operator-free.
- **The previous act's registered tail stays inside Act IV's band:** `ACT_III_REGISTERED_TAIL_EXEC`
  (`30.455319`) is `2.705319` above the floor and `6.607181` below the ceiling — the §7.3 interior-freedom
  shape (an act that opens below the previous peak, as a labelled relief, §7.11.4).
- **Star totality is inherited, not re-ruled:** §7.10.3 already states that Act IV (`24–32`) falls inside
  ADR-design-0005's **published** rows (`21–30 → k1 = 6 / k2 = 12`; `31–40 → +8 / +16`; `k1 = 2·⌈par/10⌉`,
  `k2 = 2·k1`, `1★ = any finish`), so **no new star row is owed and `docs/game-design.md` §14.2 needs no
  edit**.
- **The admitted `par` range is `24–32` inclusive, and every in-ladder value is EVEN.** O1's window is
  `PAR_FLOOR + 2k` and B1's anchor advances by exactly `+2`, so **every Act IV ladder value ≡
  `ACT_IV_PAR_FLOOR` (mod 2)** — `25 · 27 · 29 · 31` have **no home in any Act IV ladder**. This is a
  derivation, not a preference, and it is the instrument that refuses `par 31` (§7.11.5).
- **A rung is admissible batch by batch** against the clause governing that batch (§7.2's band-notation
  rider): the act band is the **outer range**, never a per-rung licence.

#### 7.11.2 The `L61–L65` opener rule (six clauses, re-based — the level lane pre-runs this)

**Ladder (derived, not searched): `[24, 26, 28, 30, 30]`.** The derivation is §7.10.2's **intersection
re-based on Act IV's own constants** — quoted, never re-derived:

| # | Clause (Act IV constants) | Content |
|---|---|---|
| **O1 · ladder** | `L_i = ACT_IV_PAR_FLOOR + 2·(i−1)`, `i = 1…5` | the P2-exact 5-member window (`24, 26, 28, 30, 32`) — §7.10.2's O1 with **the act's own floor** substituted |
| **O2 · ceiling reservation** | the derived top rung `par 32` is **withheld**; the 5th rung repeats the truncated top at its within-par **maximum** | multiset **`[24, 26, 28, 30, 30]`** |
| **O3 · why O2 is derived** | opener rungs top out at `30 + 3·1.6875 = 35.0625`; any `par 32` tail rung bottoms at `32 + 3·1.2500 = 35.7500` | **`35.7500 > 35.0625`**, margin **`0.6875`** ⇒ §7.3.2's `act-close` is satisfiable **by construction** on `L71–L80` **regardless of the opener's realised `B`**. The margin is **act-invariant by construction**: `2 − 3·(B_hi − B_lo) = 2 − 1.3125 = 0.6875` — the `+2` par step the P2 window earns, minus the widest `B` swing three weights can carry. It **coincides numerically** with `ACT_III_CEILING_RESERVATION_MARGIN` (a **checkable coincidence, never a template**: in `policy.ts` that constant is *derived* from its own act's endpoints and opener top, so the Act IV sibling is to be derived likewise) |
| **O4 · anti-mirror** | the multiset must differ from **every registered Act II batch** (`[17,18,20,21,23]`, `[19,22,22,24,24]`, `[18,20,22,24,24]`) and from **every Act III batch's** (`[20,22,24,26,26]`, `[22,24,26,26,26]`, `[24,26,28,28,28]`, `[26,28,28,28,28]`, and any B6 outcome of batch 4) | checked **today** against all eight known multisets: `[24,26,28,30,30]` is distinct from each, and the distinctness is **structural**, not lucky — it is the only one carrying `30` at all. **Coinciding pars are printed, never hidden**; the check is re-run on the **realised** Act III sets at the Act IV census (batch 4's B6 path can only *remove* values, so no B6 outcome of batch 4 is `[24,26,28,30,30]`) |
| **O5 · empty pool ⇒ ABSENT, never substituted** | a derived par absent from the stage-`I` census pool is **absent**; no out-of-set par is substituted; the shortfall is absorbed by **within-par repeats at the highest available derived par** | the fill is **rising** from an absent floor (the instance-5 precedent, whose union published exactly two admissible first rungs), so **two** first-rung readings are admissible: `par 24` (the anchor) and `par 26` (one P2 step up). If fewer than five rungs can be populated even so, the batch **STOP-AND-ROUTES to GD** — it never silently extends into the reserved ceiling |
| **O6 · within-par convention** | the **final rung** takes the within-par **maximum** `D_exec`; every earlier rung the **minimum** | §7.10.2's O6 verbatim, **read at exactly the scope §7.10.6's B5 gives it**: B5's **plural-same-par tie-break** fires only where **two or more NON-FINAL rungs** share a par, and in `[24, 26, 28, 30, 30]` the **non-final** `par 30` multiplicity is **ONE** (`L64`) ⇒ the tie-break **never fires at this batch** and the **closing rung `L65` is never inside it**. Read-out: **`L64` = the pool's `par 30` MINIMUM** (tie-broken inside the value by minimal `D_exec`, then enumeration order — B5's own inner rule) **and `L65` = the pool's `par 30` MAXIMUM** (the closing rung, O6's first half). As first published this cell claimed a within-par maximum for the final rung **and** the plural tie-break over **both** `par 30` rungs *from the act's first batch* — which contradicts its own parent clause; that wording is kept **verbatim** in the dated supersession record below, and **nothing about `par`, `D_exec`, the multiset or any bound moves** (RV-015 item 1) |

> **SUPERSESSION RECORD — dated 2026-10-20 (GD-016b, RV-015 item 1).** The cell text quoted below is §7.11.2's
> **O6 as published by GD-016** and is **REFUTED** by §7.10.6's **B5**, whose own words scope the tie-break to
> *"where **two or more** non-final rungs share a par"*. It is **not law**, must **not** be encoded, and is kept
> **verbatim** because the refutation is the evidence for the corrected cell: *a corrigendum that erases its
> own evidence trail is a restamp* (the GD-014b model case).
>
> > §7.10.2's O6 verbatim; with `par 30` doubled by the truncation, §7.10.6's **plural-same-par tie-break**
> > applies from the act's **first** batch — the two `par 30` rungs take the pool's **lowest** accepted values
> > in **ascending id order**
>
> **Refuted — the cell contradicts its parent clause, in one line of arithmetic.** B5 scopes the plural
> tie-break to **non-final** rungs, so it can fire only where **two or more non-final rungs share a par**; in
> this ladder the `par 30` rungs are `L64` (non-final, multiplicity **one**) and `L65` (the
> **closing** rung, which O6's first half already assigns the within-par **maximum**) ⇒ the tie-break has
> **no second non-final member to order** and is **never invoked**. Read as written, the cell puts `L65` inside
> a **non-final** tie-break against the same sentence's first half, and the phrase *"applies from the act's
> first batch"* acquires a referent it does not have. **Correct reading:** `L64` = the pool's `par 30`
> **minimum**, `L65` = the pool's `par 30` **maximum** — which is what ADR-design-0012's RULING B already
> restates (*"the final rung at the within-par maximum, earlier rungs at the minimum"*).
> **Blast radius, stated:** the ladder is still the derived O2 truncation multiset, O1–O5 are untouched, every `D_exec`
> class in §7.11 is byte-identical, and **no bound, half, margin, refusal, constant or registered row moves**
> (§7.11.4's halves, §7.11.3's reservation margin and §7.11.5's refusals are all `par`-level or band-level and
> never touched this clause). The tie-break **does** fire elsewhere — §7.10.9.2's batch 3 and §7.10.11's batch 4
> each carry **two** or **three** non-final rungs at one par — which is precisely why the scope matters and why
> a mis-scoped copy must not be quotable from this section.

**No `act-peak` / `act-close` branch for the opener — RULED (mirrored).** §7.3.2 puts the carrier on the
act's **last two batches** (`L71–L80` for Act IV) and §7.3's `act-peak` binds the act's **measured maximum**,
evaluated per batch once that batch's peak exists. The opener **reports** its measured peak and **carries no
clause**; what it carries is the §7.3.1 `act-open` relief (§7.11.4). Every rung this rule admits is **in band
by construction** (`par 24` ⇒ `[27.7500, 29.0625]`; `par 30` ⇒ `[33.7500, 35.0625]`; both ⊆
`[27.7500, 37.0625]`), so a rung outside the band is a **broken rule**, not a nuance.

**Does the opener ENTER Act IV's band, or HOLD at Act III's ceiling? — RULED: it ENTERS, at the act's own
floor.** The Act II→III precedent is decisive and is **quoted rather than re-argued**: Act III's opener anchors
at `ACT_III_PAR_FLOOR = 20` while Act II's ceiling is `par 24`, i.e. the act opens **four `par` below the
previous act's ceiling**, inside its **own** band, and the seam is published as a relief. U-002 **ratified**
that default for the user, not silently: *"floor-anchored ladder `[20,22,24,26,26]` (par 20 opener, the `−4`
par-term breath after Act II's par-24 climax)"*. So the mirror at Act IV is `L61 = par 24` — the act's own
floor, with `Δpar = −4` against Act III's closing `par 28`.

The **"hold" reading is REFUSED**, on three grounds, in the file's own terms:

1. **It is a deviation from ratified law, and a deviation owes an ADR and a reason.** None exists on disk:
   O1's ladder is floor-anchored **by its own formula**, and the only ratified reading of an act's opener is
   the floor anchor.
2. **It leaves the act's floor class homeless at the one batch that can home it cheaply.** `par 24` can appear
   in any Act IV batch, but §7.10.9.1's tie-break ground (ii) — *"every value of the derived window keeps a
   home in the act's ladders"* — is **live again at a new act's first batch** (no Act IV ladder has landed, so
   nothing in the window has a home), whereas it was **SPENT** for Act III's `ℓ ≥ 2` batches. Recorded here so
   it is not re-quoted after it dies again — exactly as GD-013 recorded ground (ii)'s death.
3. **It would open the act by re-entering a class Act III already occupies four times.** `par 28`'s class is
   `[31.7500, 33.0625]` — **the same numbers** as Act III's closing four rungs (`L57–L60`) — so a `par 28`
   opener would make Act IV's first board a *par-class repeat* of the act that just closed, and its
   distinctness would rest on geometry alone. Distinctness is checkable (clone guard §6.1.4), so this ground
   is **not** a refusal by itself; it is recorded as why the hold is *also* undesirable, **never** as the
   reason it is unlawful (ground 1 does that).

**Shape principle at the seam (the dispatch's "same-par / different-shape" phrase, resolved by measurement).**
The phrase is **not law text anywhere in this file**; the seam's published properties are (a) a §7.3
**interior relaxation at a `ΔM = 0` boundary**, (b) a **re-anchor by arithmetic** (`Δpar = −4`, forced by
O1/B1), and (c) a **multiset-difference** against every landed set (O4). So the seam's shape principle is
stated in the register's own vocabulary: **same device class, different ladder shape**, with the
shape-difference **machine-checkable** as O4's multiset inequality — and the felt reading (*a breath after the
climax*) is a **labelled hypothesis** (§7.3.3's instrument reads `NOT TESTABLE, n = 0`), never an assertion.

#### 7.11.3 The reservation's Act IV scope (`L61–L70`, `par ≤ 30`), ruled as a READ-OUT of O3

```text
reserved class      : par 32 ⇒ D_exec ∈ [32 + 3·1.2500, 32 + 3·1.6875] = [35.7500, 37.0625]
first half's ceiling: 30 + 3·1.6875 = 35.0625 ⇒ margin 35.7500 − 35.0625 = 0.6875
act band (derived)  : [27.7500, 37.0625] ⇒ the reserved class's TOP *is* the act ceiling (0 headroom above it)
```

- **Scope.** The first half (`L61–L70`) takes **`par ≤ 30`**; **`par 31` is inadmissible** (odd ⇒ no home in
  any Act IV ladder, §7.11.1); **`par 32` is reserved** for the tail. This is **O3 re-based** — the
  reservation is published with the act it belongs to, not as a new clause — and the **per-batch ladders that
  consume it** are the Act IV **interior-batch** law, **DEFERRED to GD-017** (§7.11.5).
- **The release of `par 32` is NOT ruled here.** §7.10.9.1's release was an **arithmetic act against a
  registered act maximum**; Act IV has no registered row at all, so a release today would be a claim about a
  tail that does not exist. It is **named** as the tail's own future GD ruling, with its own record.
- **A rung is read batch by batch** (§7.2's band-notation rider): the act band is the outer range, and a
  `par 32` rung in the first half is **in band and still inadmissible** — containment is not admissibility.

#### 7.11.4 The pre-published `act-open` relief label (L60→L61) — register §7.3.1 **instance 9**

**Why the seam exists, in arithmetic rather than in taste.** §7.11.2 anchors `L61` at `par 24` while Act III's
closing rung `L60` sits at `par 28` (§7.10.11's B1–B5: the released ceiling, and the closing rung at its own
within-par maximum), so the seam's `par` term is **negative by construction** — a §7.3 interior relaxation at
a **`ΔM = 0`** boundary, and §7.3.1's rule is absolute: **an unlabelled relief is not registrable.** So it is
labelled **here, before the census and before any byte**, with the exact value a **fill-in against this
published form** (the instance-5/-6/-7/-8 order: bound → fill-in → bytes).

**The published bound — the register's first COMPARATOR-FREE `act-open` bound.** Derivation shown, every
constant read from the law module:

```text
ΔD_exec = Δpar + 3·ΔB     with Δpar = 24 − 28 = −4     (BOTH pars are LAW, not selections:
                                                        O1/B1's Act IV floor anchor; §7.10.11's closing rung)
ΔB      ∈ [1.2500 − 1.6875, 1.6875 − 1.2500] = [−0.4375, +0.4375]
⇒ ΔD_exec ∈ [−5.3125, −2.6875]      (equivalently: [27.7500, 29.0625] − [31.7500, 33.0625])
SIGN IS FIXED BY THE BAND:  |3·ΔB| ≤ 1.3125 < |Δpar| = 4  ⇒  ΔD_exec < 0 for EVERY in-band pair
O5's one admissible rising fill (par 26):
Δpar = 26 − 28 = −2  ⇒  ΔD_exec ∈ [−3.3125, −0.6875]   (equivalently: [29.7500, 31.0625] − [31.7500, 33.0625])
```

Three properties, stated so the lane **verifies** rather than trusts.

- **(a) It needs NO comparator's number — unlike instance 5, the register's other `act-open`.** Instance 5's
  bound is built on `L40 = 28.455319` (a measured left side); instance 9's left side is `L60`, whose `par` is
  **law** (B4/B5's closing rung) and whose `B` is bounded by the **published band**, so the bound and its sign
  are **comparator-independent** — the general form §7.10.12 named: **when `Δpar` is fixed by law and
  `3·(B_hi − B_lo) < |Δpar|`, the bound and the sign are comparator-free.** The `1.3125` is `3·(B_hi − B_lo)`,
  the same number §7.10.7 published as the `Δpar = 0` residue bound — quoted as a **checkable coincidence,
  never a template**.
- **(b) It is TWO HALVES, never a hull.** A fill-in is checked against the half its `par` names and **never**
  against `[−5.3125, −0.6875]`: a value inside that hull but in neither half is **outside** the label (the
  instance-6 rule, quoted). The halves' midpoints are exactly their `par` terms (`−4`, `−2`), and the `B` half
  contributes `±0.65625` to each.
- **(c) A numerical coincidence is named so it cannot be cross-quoted.** `[27.7500, 29.0625] − 30.455319 =
  [−2.705319, −1.392819]` — **the same numbers** as instance 5's `par 22` half. The **referents differ**:
  instance 5's is `L41`'s class against `L40`'s **measured** `B` (`1.4851`); this one is Act IV's **band-floor
  class** against Act III's **registered tail**. The register's standing rule applies unchanged (`F-L31-2` /
  `F-L36-2`: *a label that no longer describes the thing it measures*): **cross-quoting is forbidden**, and
  the value is computed from the two boards' **own** measured `D_exec`.

The full label, verbatim, for the registration ticket to cite:

> **RELIEF LABEL — `act-open` seam L60→L61 · `ΔD_exec ∈ [−5.3125, −2.6875] at par 24 (O1/B1's anchor) ·
> [−3.3125, −0.6875] at par 26 (O5's rising fill)`** (exact value filled in against this pre-published form
> once `L61`'s `par` is selected, **never after the bytes**; **comparator-free** — no measured left-side value
> enters it, because both `par` values are law and the `B` term is bounded by the published band) · **band
> `[27.7500, 37.0625]`** (printed `[27.75, 37.06]`).
> Interior relaxation at a **`ΔM = 0` boundary**, on the **execution axis only** — **never a dip, never a
> claim of lower felt difficulty, and never the thing that satisfies a clause.** §6's dip law does **not**
> fire: Act IV introduces **no** mechanic unit (§7.11.5), the phase-maze is **furniture on the same physics**
> (§7.2's own family sentence), and the batch's boards are **variety inside §7.2's Act IV family**.
> `act-peak`/`act-close` ride on the act's **measured maximum**, and the carrier obligation sits on
> **`L71–L80`** (§7.3.2's own text). **The relief is an artifact of the measurement design, and it says so:**
> §7.11.2's ladder is **derived** (floor-anchored, P2-exact, ceiling reserved for the tail), so the `par` term
> drops by `4` **by construction** — §7.10.4's instance 5 is the same artifact of the same derivation one act
> earlier, and §7.3.1's form already refuses to call that a designed rhythm (*"a measurement instrument is not
> a designed rhythm"*). The label asserts **no** ease the instrument cannot see — `D_exec` is **blind to
> comprehension** (`M`/`T` are not terms in it) — so *how the seam reads* is a **labelled Playtest
> hypothesis** (§7.3.3; the star-era instrument reads `NOT TESTABLE, n = 0`), not a result.

> **The self-voiding clauses (published because both sides' projections are future measurements).**
> **(V1) The dilation conditional.** The bound holds **iff both boards' `B` sit in the published band** (§7.5:
> a rung outside it must be **NAMED in the F-L16-2 excursion register**). If `L60` **or** `L61` lands a **named
> excursion**, the band-width step is **void**: the label's value becomes a **fill-in against the measured
> pair**, the published halves are **retired for this instance** (never widened to cover the excursion), and
> the lane **STOP-AND-ROUTES to GD**. *Owner-program:* the level lane's **Act IV census** — the only program
> that can produce the excursion — and the remedy is owed **before** the bytes.
> **(V2) The left-side conditional.** `L60 = par 28` is law **only while Act III's batch 4 is registrable at
> all**: §7.10.11's B6 makes every fallback at `ℓ = 4` a **flat batch**, and a flat batch is **STOP-gated** —
> so if it fires, batch 4 registers **nothing** and this seam has **no lawful left side**. In that event
> **this instance is VOID as published**, and it may not be re-published against a substituted or borrowed
> batch: the Act IV opener is gated on Act III's close. *Owner-program:* the level lane's **`L56–L60`
> census + registration train** — it reports, the design lane rules, and nothing is improvised in between.
> **B7's multiset conditional** (§7.10.11's own NAMED CONDITIONAL) is inherited **unchanged**: on
> multiset-equality the lane writes nothing and STOP-AND-ROUTES, and re-anchoring is a design decision with
> its own ADR.
> **(V3) The register-form obligation.** A comparator-free bound **still owes a pinned comparator at the
> fill-in** (`F-GD015-1`), so the register form's two-board reading stays true — see the pin-literals below.
> This clause is published **because this is the third occurrence of the same hazard class**: a hazard with two
> named prior occurrences that is silently assumed to be gone is how the class returns.
> *Owner-program:* the **LEVEL LANE**, at the **Act IV opener era** — **V1/V2 above name their owners and this
> clause does the same rather than leaving ownership implied by the pin-literals paragraph only.** The duty is:
> fill `ACT_IV_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 60` and
> `…_PREVIOUS_EXEC_AT_REGISTRATION = <L60's registered value>` as **literals** (never as an alias to
> `ACT_III_REGISTERED_TAIL_*`), derive `_DELTA` **from the pin**, and assert `near()` on the **frozen pair**
> with message `F-GD014-1`. **Enforcement, not intention:** the register's **fill-in-before-bytes ceremony**
> (bound → fill-in → bytes, §7.3.1's own order) plus the **`near()`-frozen-pair assertion** of the
> `F-GD014-1` family — the program-side check written in the **`ARCH-006c` symbol form** (§7.10.10's
> register-wide form law: declarators, not integers), so a later Act III registration that moves the act tail
> makes the check **fail loudly** instead of restamping this label silently. The design lane **rules** this
> duty; it does not write, fill or assert it (`src/**` is the level lane's, with Architect sign-off).

**Registration-side constants proposed — the PIN-LITERAL form (§7.10.10's register-wide form law).**
`ACT_IV_B1_OPEN_RELIEF_LEVEL_ID = 61`;
`ACT_IV_B1_OPEN_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 60` and
`ACT_IV_B1_OPEN_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION = <L60's registered value>` as **literals** — each
documented as *instance 9's comparator as published at registration*, filled **only after Act III's batch 4
registers and before Act IV's bytes**; `ACT_IV_B1_OPEN_RELIEF_DELTA` **derived from the pin**, so no later
registration can restamp it; `ACT_IV_B1_OPEN_RELIEF_DELTA_RANGE = [−5.3125, −0.6875]` (the **hull of the two
halves**, carried **for lookup only** — a fill-in is checked against a half, never the hull);
`ACT_IV_B1_OPEN_RELIEF_ADMISSIBLE_FIRST_RUNGS = [{ par 24, [−5.3125, −2.6875] }, { par 26, [−3.3125,
−0.6875] }]`; `_DELTA = _EXEC − _PREVIOUS_EXEC_AT_REGISTRATION`. It must **never** alias
`ACT_III_REGISTERED_TAIL_*`: whether that symbol points at `L60` depends on §7.10.13.3's **rank comparison**,
so an alias would be correct only **contingently** — and `F-GD015-1`'s rule is that an alias is admissible
only over a referent **frozen by construction**. Ladder-side constants proposed: `ACT_IV_PAR_FLOOR = 24`,
`ACT_IV_PAR_CEILING = 32`, `ACT_IV_B_BAND = BLOCK_L1619_B_BAND`,
`ACT_IV_EXEC_BAND = [ACT_IV_PAR_FLOOR + 3·ACT_IV_B_BAND[0], ACT_IV_PAR_CEILING + 3·ACT_IV_B_BAND[1]]`,
`ACT_IV_OPENER_PAR_MULTISET = [24, 26, 28, 30, 30]`, `ACT_IV_OPENER_TOP_PAR = 30`,
`ACT_IV_CEILING_RESERVATION_MARGIN = ACT_IV_PAR_CEILING + 3·B[0] − (ACT_IV_OPENER_TOP_PAR + 3·B[1])`
(**derived, never typed** — the `policy.ts` shape), `ACT_IV_B1_IDS = [61…65]`, `ACT_IV_B1_ANCHOR_PAR =
ACT_IV_PAR_FLOOR + 2·(1−1)`, `ACT_IV_TAIL_PAR_CEILING = ACT_IV_PAR_CEILING` (**reserved, unreleased**).

#### 7.11.5 Mechanics stance (YAGNI), the comprehension plan (a NAMED HOLD), the deferrals, and the refusals

**Mechanics stance — `ΔM = 0` through Act IV, by citation.** §7.2's own family sentence is the law here:
*"Mechanism families use **locked vocabulary only** … a family is furniture on the same physics"*, and its Act
IV row names **M0 wall-echo mazes · both-pair objects inside larger geometry · gauntlet-shaped boards (≥ 6-door
rings) as FLAVOUR only**. §7.4's stages `I` (phase-maze) and `J` (gauntlet-flavour) are **generator lattices**,
not devices, and **the plan names NO new device**: every ingredient is shipped law — M0 walls and their
other-phase echo (ADR-0007), the shipped `doorIsOpen`, §1's portal array under the opposite-colour law, and
geometry. Therefore **no Act IV rung may be scored as a debut**, §6's dip law **does not fire**, and **no
architect-impact is flagged by this section**. **Asset Gate: unaffected** — no new board feature and no new
player-facing object is introduced, so **no `asset-request` is owed by this ruling**. **Named conditional (the
§7.10.5 closing sentence, mirrored):** if the stage-`I`/`J` census discovers that the maze read requires a
**rule the core does not already have** (a solidity / echo / portal semantics absent from shipped law), that
is **architect-impact** and needs **its own ADR before authoring** — it may not be smuggled in as "Act IV
variety", and this section's `ΔM = 0` claim is then **void for that batch**. *Owner-program:* the level lane's
stage-`I` census.

**Comprehension plan — RULED as a NAMED HOLD (not a T-series extension).** No new teaching cycle is
legislated by this ticket, and the hold rests on a stated basis rather than on silence:

- Act IV's first batch introduces **no mechanic unit and no new board feature**, so §6's dip law does not fire
  and **no debut rung exists for a teaching beat to hang on** (the T1–T4 precedent exists precisely because
  the XOR read *was* a first encounter). What is already taught is **assumed, not re-taught**: T0's latch
  (owned since L6–L10, Aha #1), M0's refusal (L3) and phantom-walk (L4–L5) beats, and the both-pair object's
  Act III cycle (**T1–T4, complete at `L55`**).
- What *can* fail is a **read**, not a rule: *the same tile answers by approach side* (§7.2's Act IV row). So
  the hold carries the standing readability duties, **quoted and not weakened**: **R6** (zero text — §2's
  show-don't-tell and the `L4+` text budget), **§6.1.4's clone guard** (the opener's five boards must be
  mechanically distinct shapes — a maze-flavoured repeat is not a lattice member), and **§6.1.6 item 6 /
  §7.5 item 5's registry gate** (a batch that is solver-proven but not legible does not ship).
- **Named risk + its measurement window (LABELLED HYPOTHESIS, never a result):** *"that wall refused me … but
  it let me through from the other side"* can read as **inconsistency** rather than as the shipped echo rule.
  **Measurement:** **M4 refusals / M5 restarts / M6 undos** on `L61–L65` against `L60`, thresholds **frozen
  before** the cohort runs (T6 discipline, §7.3.3's form; today the instrument reads **`NOT TESTABLE, n = 0`**).
  **Falsification clause:** if the spike is measured, the geometry is **re-designed, never re-labelled**
  (§6.2.5's standing rule for the L20 pocket, applied here by name), and the T-series extension is then owed
  as **T5** at the ticket the next bullet names.
- *Owner-program for the extension:* the Act IV **interior-batch** ticket (**GD-017**, below) — a teaching
  cycle is a **per-rung** claim (which rung teaches what), and the interior batches' rungs are that ticket's;
  legislating `T5` here would assign beats to rungs whose `par` values are not yet law.

**Deferrals, each named with the era that owns it.**

- **Act IV's interior-batch ladder law (B1–B7 at `ℓ = 2, 3, 4`) → GD-017, near its era.** GD-012's own
  precedent: the Act III opener ticket **did not** legislate the interior ladders; GD-013 did, when the lane
  was **gated** on it. The same gate will exist for `L66–L70`, and it is not raised by Act IV's band or its
  opener.
- **The one anchor the band law DOES force, and why.** The dispatch asks whether B1 is **act-scoped or
  dataset-scoped**; **on disk it is ACT-SCOPED**: §7.10.9.2's B1 law text reads `A₃ = ACT_III_PAR_FLOOR +
  2·(3−1)` and §7.10.11's reads `A₄ = ACT_III_PAR_FLOOR + 2·(4−1)` — the declarator names **its own act's
  floor constant**, and `ℓ` indexes **that act's own batches**. The cross-act generalization is therefore
  **substitution of the act's floor into the same formula** (which is exactly how O1 already writes it
  generically), not a shared dataset-level counter. Checked arithmetically, **both** losing readings collapse —
  and the second one collapses harder, which is why the naming now matters:
  - **A CROSS-ACT `ℓ` CONTINUATION** — the variant this section first published as *"a dataset-scoped `ℓ = 5`"*
    (the arithmetic was right; the **name** was not). Act III ends at **`ℓ = 4`**, so no Act IV batch can be
    `ℓ = 5` **within its own act**: the reading actually being refused is a counter **walked across the seam**.
    It gives `A = 24 + 2·(5−1) = 32` — **the act's own reserved ceiling** — which O2/O3 forbids as an opener
    (it would consume the ceiling and destroy §7.3.2's by-construction carrier guarantee).
  - **A genuinely DATASET-SCOPED counter** (`ℓ` counted over the whole dataset — the reading the *word* properly
    denotes, and the stronger refusal): this file's 50-rung plan carries **4 + 4 + 4 = 12 batches** to `L60`
    (`L1–L20 · L21–L40 · L41–L60`), so Act IV's first batch is dataset batch **`ℓ = 13`** ⇒
    `A = 24 + 2·(13−1) = 48` — **`48 > ACT_IV_PAR_CEILING = 32`** (an integer comparison, no operator
    question) and outside **every** act's `par` band.
  So the forced anchor at Act IV's first batch is **`ACT_IV_PAR_FLOOR = 24`** — the `+2` is the **step**, not
  the anchor — and it is **published here** as part of the opener law, never deferred. **Conclusion unchanged**
  (`ACT-SCOPED`, anchor `24`); RV-015 item 3 touched the **label** and added the second collapse, nothing else.
- **The release of `par 32` → the Act IV tail's era**, with its own record (§7.11.3).
- **The `T5` comprehension extension → GD-017** (above).
- **Re-pinning duties owed at the Act IV era (register hygiene, named not performed).** Whatever registration
  train moves the Act III act tail must **re-pin instance 6** and fill **instance 8's** pin
  (`F-GD014-1` / `F-GD015-1`), and the **three disclosed growing-alias declarators** of item 167 (the
  `ACT_III_PRE_R008_REGISTERED_TAIL_*` pair and the self-cancelling `ACT_III_B2_TAIL_ZERO_MOVE`, all
  **symbol-anchored, no integers**) remain due at the **tail move**. None of it is a design edit — `src/**`
  belongs to the level lane with Architect sign-off.

**Refusals, with arithmetic where arithmetic does the refusing (and named as unmeasured where it does not).**

- **REFUSED — any new device, mechanic unit, or board feature in Act IV.** `ΔM = 0` by §7.2's own family
  sentence plus §7.4's lattice names; no census exists and none is claimed here.
- **REFUSED — every out-of-band Act IV rung value, with the containment arithmetic shown** (the `par 29`
  precedent's instrument rigor, §7.10.13, applied to Act IV's own numbers — because a lane that checked
  **containment only** would let two of these through):
  - **`par 33`:** `33 + 3·1.2500 = 36.7500` is **inside** `[27.7500, 37.0625]` (by `0.3125`) — so
    **containment alone does not refuse it**. It is refused by the **`par` band** (`33 > ACT_IV_PAR_CEILING =
    32`, an integer comparison with no operator question) **and** by the mod-2 derivation (odd). At the band
    top `33 + 3·1.6875 = 38.0625` exceeds the ceiling by `1.0`.
  - **`par 34`:** even, still `> 32` ⇒ refused by the `par` band; containment agrees only at the `B` floor
    (`34 + 3·1.2500 = 37.7500 > 37.0625`, excess `0.6875`), and at the band top it exceeds by `2.0` — so
    **two** instruments refuse it and neither is containment alone.
  - **`par 31`:** **containment and the `par` band BOTH admit it** (`31 + 3·1.2500 = 34.7500` and
    `31 + 3·1.6875 = 36.0625` are both ⊆ `[27.7500, 37.0625]`, and `31 ≤ 32`). It is refused **by the
    derivation only** — odd ⇒ no home in any Act IV ladder — and it is **strictly dominated wherever it could
    matter**, in two readings that must be stated together because neither alone is sufficient: **(i)** at any
    in-band `B` it measures exactly `1.0` below the `par 32` rung built from the **same** `B`
    (`31 + 3·B < 32 + 3·B` for *every* `B`); **(ii)** read **inside the reserved class**
    (`D_exec ≥ 35.7500`, the class's own floor — §7.10.9.1's `par 27` form, read the same way, *inside the
    ceiling class*) its reachable span is `[35.7500, 36.0625]` against `par 32`'s `[35.7500, 37.0625]` — an
    **identical floor and a top `1.0` lower**, so a `par 31` rung can never measure above what the same `B`
    yields at the reserved par. **This is the sharpest
    single read-out in this section:** an Act IV admissibility test that does not carry the
    `par`-band/parity derivation is **insufficient** — a checkable fact, not a preference.
  - **`par 32` in the first half:** in band, in the derivation's parity class, and **still inadmissible**
    (§7.11.3 — the reservation is O3's, and the act band is never a per-rung licence).
- **REFUSED — re-stamping.** No published number moves: Act I/II/III bands, ladders, relief bounds and
  registered rows are untouched, no instance's bound is widened, and `[24,26,28,30,30]` is **not** obtained by
  editing any Act III number. The register counts by **seam order**, so instance 9 is **appended**, never
  inserted.
- **REFUSED — any ceiling claim while `H` is uncensused, in either direction.** `H` is **uncensused at
  GD-015's publication** (§7.10.11's own wording) and stages `I`/`J` have **no census at all**, so: **no**
  claim that `par 30`/`par 32` is authorable, **no** claim that it is not, and **no** claim that stage `I` can
  populate the Act IV ladder. If it cannot, **O5 governs** — ABSENT-never-substituted, then
  **STOP-AND-ROUTE to GD**: never a substitute `par`, never a borrowed registered ladder, never a re-anchored
  batch.
- **REFUSED — any Act IV rung law that would break monotone grades.** §7.10.13.4's published convention (**the
  demand grade never falls as a batch's own measurement rises**, because a weaker demand on a
  higher-measured board is a self-contradiction the file could not explain) is inherited as a binding
  **constraint** on whatever GD-017 legislates: pandering grades, a **debut** grade under `ΔM = 0`, and a
  FORCED demand on a relief rung are each refused — the last by §7.10.13.4's own construction-floor reasoning
  (**one demand at a time**; *a relief rung may carry a device, never an obligation*).
- **REFUSED — silence about the felt half.** Every player-facing claim in this section is a **labelled
  hypothesis with a falsification clause** (§7.11.2's, §7.11.5's); my own sawtooth-over-plateau taste is
  **not** evidence (AGENTS §7), and no playtest datum exists (`NOT TESTABLE, n = 0`).

**`ΔM = 0` through Act IV's opener — the standing sentence.** No new mechanic unit, no new board feature, no
new device contract, no architect impact, no debut grade, and no new player-facing text (R6). Everything
`L61–L65` adds is **composition over shipped law**: the wall-echo read at maze scale, the both-pair object,
and geometry inside Act IV's own derived band.

## 8. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.3 | **GATE C (human decision): Option B / ADR-0008 adopted.** Parity-dependent entry replaces the union property (§0 rewritten); OQ-1 marked RESOLVED; L1–L10 ladder rebuilt so Aha #1 is produced by M0 itself (§2–§3); `goal` hard-validated as non-wall in both phases and portal no-chaining stated (§1); embedded-state rule added to fail conditions (§4); block intents updated (§5). Prior history: `docs/iteration-log.md`. | Agent 1 / Human at GATE C |
| 2026-10-14 | V0.4 | **GATE D (human decision D3 — mechanics forward; ADR-0009).** Checkerboard invariant replaces the withdrawn parity corollary (§0 rewritten; OQ-1 re-resolved by D3, not by ADR-0008 clause 8). L1–L10 ladder rebuilt: L3 = permanent refusal, L4–L5 = phantom walk (Option B's real gift), **L6–L10 = M1+M3 latch unit with Aha #1 at L8** (§2–§3). §1: doors L6-paired / switches CORE + **invert-per-ON-switch composition pinned** + one-switch-per-door authoring rule (RV-002 M-5); portals gain the **architecture-ruling landing semantics** (entry legal ⇒ teleport unconditional; solid landing = clause-3 embedded state) and the **opposite-colour law**; §1 example replaced (old one self-contradictory — `par: 6` vs its own 4-move trace + decorative wall; RV-002 M-1). Block intents (§5) and dip placements (§6: L6, L11) updated; `R = 0` teaching span now L1–L15 (§4). **ADR-0008 rules 1–7 unchanged.** | Agent 1 / Human at GATE D |
| 2026-10-15 | V0.5 | **Aligned with LV-006 shipped + solver-proven reality, and with the gate (iv) adjudication** (Orchestrator ruling, `docs/ai-native-pipeline.md` §8.5). §1: stale portal figures corrected — same-colour rejection is landed and machine-enforced (0/400 legal; "validator rule to be added" note removed). §2 intro: ladder synced — **no mechanical Aha before L6** (hook = cadence; retention = hypothesis d′), M1+M3 as one teaching unit L6–L10 with Aha #1 at L8, portals L11+ as the first dual-phase-satisfiable block; 50-level endgame unchanged. §2 L9 **re-worded**: the "switch timing" lesson is unconstructible pre-L11 (F2/F3) and is replaced by the shipped, solver-proven lesson — two doors + two switches, the second switch behind the first door (ordered plan; `l009.json` par 8, rte 2). §2 L6: block-opening dip on the natural path; `switchRequired = false` recorded as a deliberate concession — below-OFFERED debut (l004 OFFERED / l005 FORCED precedent), exempt from the `switchRequired` obligation, **never scored as FORCED**. §3: Aha #1 requirements re-stated as named gates — (i)(ii)(iii) pre-L11 (measured PASS on l008), (iv) `dualPhaseTiles ≥ 1` activates **L11+ only** (unsatisfiable pre-L11 by law, ADR-0009 decision 1); construction bullets (one-door-one-switch funnel; L8 par ≤ 8) kept as spec, programmatic enforcement = LV-007 (RV-004 n-14). §5: L9 / L11 block intents synced. §6: dip rule reconciled with measured `M` 1→3 / par 6→4; the `D`-drop clause labelled a design target until LV-007 exposes `B`/`T`/`R`. | Agent 1 (GD-007) |
| 2026-10-15 | V0.6 | **GD-008 ruling 1 — §6 rewritten on measurement (ADR-design-0001).** LV-007B closed the "`D` not yet computable" gap and falsified the "2–3 points below peak on `D`" clause in one move (L5→L6 seam measured **+8.53**; −2…−3 proven **unreachable by construction** at `w = 1,3,4,2,5`). The dip law moves to the **execution axis** `D_exec = D − w5·M` (= `L + 3·B` inside the §4 acceptance region): seam law (debut `D_exec` strictly below the previous block's `D_exec` peak; budget form `ΔD < w5·ΔM`), sawtooth on `D_exec`, construction floor and rejection teeth unchanged; the "2–3" margin **withdrawn unfitted** (measured anchor −1.47), the felt-half valley assigned to playtest as a labelled hypothesis (PA handoff), and the falsifiable L11 prediction pre-registered (`D_exec(L11) < 13.64`, par ≤ 4). Recomputed `D_exec` curve published from §5.2's pinned rows — no weight changed, no number invented. | Agent 1 (GD-008) |
| 2026-10-15 | V0.6 | **GD-008 ruling 2 — §3 gate (iii) switches to the ordered reader.** Gate (iii) now reads `refusedBeforeEnteredTiles ≥ 1` (ADR-architecture-0002 Appendix A2 draft, updated to shipped reality: the companion metric is **already shipped report-only** at LV-007B and measured identical on l008 / all of L1–L10, so the switch changes no verdict on shipped content and closes the 0.9 % trapped-refusal class before portal boards arrive). The policy-code reader switch is a named LV follow-up ticket; `docs/ai-native-pipeline.md` §8.5's pre-L11 acceptance law keeps the **unordered** form (LV's file, deliberately untouched — the two legs of the ADR-architecture-0002 split are not re-merged). | Agent 1 (GD-008) |
| 2026-10-15 | V0.7 | **Citation corrigendum (ADR-architecture-0003 Ruling 1) — no design content changes.** §3 gate (iii)'s live parenthetical now cites the single citable divergence figure — **46/2000 (2.3 %), pinned by `tests/solver/ordered-companion.test.ts` §5** — replacing the 18/2000 figure, which Ruling 1 demoted to a labelled historical measurement (AR-0005b-era out-of-repo mulberry32 harness at `b65e465`; generator never committed, not reproducible). No gate, threshold, verdict, or lesson changes. The V0.6 row above keeps its dated "0.9 %" phrasing as history, per Ruling 1's changelog carve-out. | Agent 1 (GD-009) |
| 2026-10-15 | V0.8 | **GD-010 — outcome recording + staleness pass; no rule, threshold, gate or lesson changes.** §6: the frozen L11 prediction (byte-preserved — the paragraph itself shows zero diff) gains an appended **OUTCOME ANNOTATION**: LV-008's clause-by-clause verdict (merge `aaab35d`, `docs/project-status.md` item 52) — `D_exec 8.5732 < 13.64` ✓, par 4 ✓, one opposite-colour pair ✓ (`errors=0`), `T=0` ✓, below-OFFERED ✓; the L11–L15 **block-end clause stays PENDING** (L12–L15 unauthored, LV-009); law stands for L12+ with GD-008's withdrawn-not-refit ban unchanged. §3 gate (iii): the stale "until the policy-code reader lands" tail is replaced by the **landed** reality — LV-007C (merge `9dd92ce`) gates the ordered `refusedBeforeEnteredTiles ≥ 1` with the trapped-refusal flip control live, no shipped verdict moved. §3 gains the dated **L11+ block ruling** pointer: the §8.5 promotion trigger was tested at the first L11+ candidate and did **not** fire (`[5,0]` on both readers) — ADR-architecture-0002 A3's unordered legs stand; full record: `docs/decisions/design-0002-ordered-reader-block-ruling.md`. | Agent 1 (GD-010) |
| 2026-10-16 | V0.9 | **GD-011 — new §6.1: the L12–L15 block law published BEFORE integration (three design-owned gaps closed).** LV-009-A returned four solver-proven L12–L15 candidates and correctly stopped at its own OQ-1/OQ-2/OQ-3; §6.1 answers all three as law so the boards are **measured** against it, never fitted to it. **§6.1.0** states the integrity boundary: `par` is published as law (weightless, schema-enforced, already law at §6 / `policy.ts:599`) while **no new `D`/`D_exec` target is published** — `docs/level-difficulty.md` §3.5's deliberate silence above L11 is untouched, and the only numeric `D_exec` obligation remains §6's frozen block-end clause. **§6.1.1 (Q1)** publishes the par obligation as **floor ∩ step ∩ ceiling ∩ coverage** with derivation pointers: **P1** `par(L12) = 4` by intersection (§6 successor slot `≤ 4` ∧ the game's measured par floor `4`); **P2** `Δpar ≥ 2` from `B`'s measured band [1.2500, 1.6875] on 11/11 shipped levels (`3·B` spread 1.3125 < 2) — the minimal integer that makes §3.4's within-block ramp a *guarantee*; **P3** ceiling `par ≤ 10` from the measured **coverage** invariant (`distinctPositions == width × height` on 4/4), §1's hard 7-cap, the measured searchability cliff (0.5 %→0.03 % accept share, 315 566 tried / 484 accepted) and shipped precedent (max par 9); **P4** the coverage clause itself. **Uniqueness proved**: 4 members (`game-design.md` §8) ∧ P1 ∧ P2 ∧ P3 ⇒ `4, 6, 8, 10` is the only admissible ramp — adopted as **derived**, not approved by taste. Stable shape for L16+ published, incl. the already-forced consequence `par(L16) ≥ 10` (labelled conditional on the V0.1 weights) and a self-correcting guard if `B` leaves its band. **§6.1.2 (Q2)** rules **two-beat** post-debut (L12 owns §6's successor slot; single-beat REJECTED, no re-author) on five comprehension-first reasons — the text's plain reading, the invariant-break needs a consolidation beat before the **mandatory-channel** step (`portalFree false` from L13, measured), and single-beat buys nothing the block-end clause requires; the L6 and L11 blocks are shown **isomorphic** on `D_exec`; the second beat is honestly labelled a **consolidation plateau** (par flat at 4, the −0.342402 carried entirely by `B` 1.5244→1.4103), and the felt half stays a PA hypothesis. **§6.1.3 (Q3)** accepts **option (a)** as doctrine with the quotable sentence — *"the switch buys you speed, the sealed channel buys you existence; from L13 the portal IS the solvability-load"* — on the measured 0/484 `switchRequired` universality, the locked core's entry-only refusal semantics, one-existence-gate-per-block, Aha #2 not Aha #1 being this block's lesson, and gate (iii) still firing 4/4 (3/5/5/6) so the witnessable beat survives; the exemption is **hardened** into falsifiable obligations **G1** `allOffShortest − par ≥ 1` (measured 2 on 4/4), **G2** switch-pressed-and-door-crossed on every par route, **G3** ordered reader, **G4** `"exempt"` not `null` in `DOCUMENTED_LESSONS`; option (b) rejected as invalidating 0/484 ⇒ full restart, and as *lengthening* the puzzle rather than deepening it. **§6.1.4** confirms `[multi-switch-door]` DORMANT (required by §6's single-concept floor, not merely permitted) and records the `l12TemplateFamily` 0/512 read — a shipped debut board is a **one-off fit, not a template**; author plan shapes, search skeletons, never clone-and-perturb. **§6.1.5** records §6's frozen block-end clause as **DISCHARGED** (`D_exec(L15) = 14.969697 > 13.64` and `> 13.642857`), the first **positive/escalation-direction** firing, filtered not fitted (122 `block-floor` rejections). **§6.1.6** is the LV-009-B handoff: exact numbers to encode, in order, plus the pre-registered acceptance law and a STOP-and-route clause on reader divergence. Per-board clause-by-clause ACCEPT verdicts (L12/L13/L14/L15 + the block as a set) live in `docs/decisions/design-0003-l1215-block-law.md`. **No code, gate, threshold, weight or lesson outside this section changed; no candidate JSON was edited.** | Agent 1 (GD-011) |
| 2026-10-16 | V1.0 | **GD-007 — new §6.2: the L20 mechanism is RULED: the SEALED LANDING (Aha #3, ordered landing); the GAUNTLET is REJECTED on census measurement.** The L16+ census (LV-010f, `docs/project-status.md` item 86) closed the goal-gated full-seal device at `par 18` / `D_exec 22.885157` on `7×6` at **every** arity (arity 4: 17 160 tuples enumerated completely, `12:10230 14:6450 16:446 18:34`), and `7×7` reaches `par 22` only by re-stamping L19's exact seal — refused as a re-lengthened walk; `block-l1619-tail-ceiling` forbids widening the terminal instead of building a mechanism. Of the two named candidates, **ADOPT (B) SEALED LANDING / REJECT (A) GAUNTLET**, argued in priority-law order: **(1 Fun)** the census identity `par = min_i(d(start→s_i)+1+d(s_i→goal))` makes a gauntlet's extra doors terms in a **minimum** — more reading, no decision (measured saturation 16→18→18) — while the landing forces the mandatory second press the census proved the seal cannot; **(2 Comprehension)** one visible portal→pocket→door story vs. ≥ 12 objects inferred from clutter at the 44 px floor; **(3 Depth)** ORDER is a new dimension, COUNT is the saturated one, and the gauntlet's only defensible verb (the key is itself gated) is the same verb delivered worse; **(4 Scalability)** the sealed landing's lattice is bounded/enumerable, the ≥ 6-door nested ring is outside the census and unmeasured. **§6.2.2** rules `ΔM(L20) = 0` (new **verb**, existing mechanics ⇒ no dip fires, rung law stands). **§6.2.3** publishes the lattice (one opposite-colour pair; pocket not on-foot reachable; exit MUST be an openable door per F-L19-2; ≥ 2 ordered presses breaking the census identity; `par 20`; P4 42/42). **§6.2.4** teaching beat (zero text, Aha #3). **§6.2.5** fail conditions + two named comprehension risks (PA measures M5/M6 L20 vs L19). **§6.2.6** obligations (`par = 20` exact; `D_exec > 22.885157` automatic at `par 20` + in-band `B`, margin ≥ +0.864843; block becomes L16–L20 and the tail-ceiling moves **only after** the mechanism is proven; five new named gates g1–g5). No core-rule, weight, gate-widening or shipped-board change. Full record: `docs/decisions/design-0004-l20-mechanism-sealed-landing.md`. | Agent 1 (GD-007) |
| 2026-10-17 | V1.1 | **GD-008 + GD-009 (one ticket, two user-ordered rulings — `docs/project-status.md` item 106) — new §7: the 100-level ACT ARCHITECTURE; and the move-depth ruling's `par`-side restatement (§7.1).** **RULING A:** `par` stays a Solver/difficulty field and **never** a fail condition; the ordered shape is a **post-win star rating** (`k1 = 2·⌈par/10⌉`, `k2 = 2·k1`; factors = ADR-0009's detour quantum 2 and P3's published par unit 10), and the **hard move cap is REFUSED** (a cap creates `R > 0` states, contradicting §4 and repricing every published `D_exec` row — it would need the AGENTS §2 triad + ADR). The dispatch's "pars 3..20" is **corrected by measurement**: the shipped ladder is 4,5,6,6,6,4,4,6,8,9,4,4,6,8,10,12,14,16,18,20 and the measured par floor is **4** (ADR-design-0003 P1) — no level measures par 3. **RULING B:** §7.0 integrity statement (par bands = law; `D_exec` bands = **derived** from the measured `B` band via `D_exec = par + 3·B`, no new math; no absolute `D` band, no promise of unproven authorability); **§7.2** five acts × 20 (Act I = the shipped L1–L20 spine; Act II portal orchestration; Act III both-pair objects + the XOR allowance moved off §8's L36–L45; Act IV phase-maze + gauntlet-as-FLAVOUR-only per GD-007's census identity; Act V synthesis/density with **L100 = Final Exam**, §8's `L50` role re-mapped to the Act III `Midterm`), each with a par band, a derived `D_exec` band and a batch size of 5; **§7.3** the act-scale tail law — the one changed law: within an act unchanged, across acts the obligation moves to the measured **`act-peak`** (strictly above the previous act's measured max), with interior members free inside the band and any below-peak act-open labelled a **plateau relaxation at `ΔM = 0`, never a dip**; **§7.4** named generator lattice families (`P`/`SL` extended past F-L20-3's open ≥ 9-pocket boundary, then new `G` multi-pocket, `H` both-pair, `I` phase-maze, `J` gauntlet-flavour census; Act V recombines only proven ceilings; §6.1.4 clone guard on every stage); **§7.5** per-batch proof obligations (Solver PASS 100/100, band containment, measured `B` in band or a named F-L16-2 excursion, family gates, one negative control per new gate named by its measured refusal, sidecar/PINS/`EXPECTED_LEVEL_COUNT` last; **no "registered with a caveat" path**); **§7.6** the P10 sampling policy shape (full-census Solver stays full/cheap on 100/100 every round; e2e = new-batch-full + boundaries always-in + seeded rotating interior strata with a bounded coverage horizon + sampled live lane; the full 100-level chain runs at release/milestone certification — forced by the measured unlock chain 60.3 s of a 360 s ceiling at 20 levels and `route-budget.test.ts:152`'s 1.36M → 17.8M → 98.7M → > 5×10⁸ explosion); **§7.7** first-batch handoff (Act II L21–L25: re-run stage P at `--pocketsize=10` to close or keep open F-L20-3 **by measurement**, then the multi-pocket `G` lattice under §6.2.3 verbatim, **never re-stamping L20** per the `l12TemplateFamily` 0/512 lesson). Header version corrected V0.9 → V1.1 (it had lagged the change log through the V1.0/GD-007 row). **No core rule, mechanic, weight, gate threshold, shipped board or published number moved** — the locked loop is byte-identical; full record: `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`. | Agent 1 (GD-008 / GD-009) |
| 2026-10-17 | V1.2 | **GD-010 — the Act II batch-2 sawtooth is RULED (RV-012's MEDIUM), and two §7 clauses are added: the pre-published RELIEF-LABEL form and the `act-close` PEAK clause.** Ruling = **(A) ADOPTED + (D) ADOPTED, (B) REFUSED, (C) DEFERRED with a named trigger** (§7.3.4): batch 2 registers as **VARIATION RÜNDS** after batch 1's climb because the duplicated pars are the **measurement instrument** (batch 2 mirrored batch 1's pars on purpose, published pre-run and git-dated, to isolate chain length at equal par) and not a designed repeat — the boards are mechanically distinct (fenced 3-pocket, forced **4-press** chain, one door deeper, clone guard 0/5 keys over 21 roots) and `par` is invisible in play (GD-OQ1), so what repeats is a **par frame**, not a puzzle; re-ordering (B) is refused because it cannot remove the relief (both batches span `par 17→23`), would break the index-keyed published mirror `ACT_II_B1_LADDER[i].par` and buys no comprehension; promotion (C, the published-unselected par-23 class reach **27.746988**) is **not** adopted on zero playtest data — that is curve-flattery, the practice ADR-design-0001 withdrew — and is pre-registered as the remedy that **fires on the deflation signal with its own ADR**. **§7.3.1** publishes the **relief-label FORM once** (road-lesson from RV-012: batch 2's `−6.044410` was lawful but its label came after the transfer; a relief with no pre-published label is **not registrable**) and both named instances — the registered `act-open` L20→L21 `−3.148017` and the **`batch-seam` L25→L26 `−6.044410`**, quoted verbatim for R-005 to cite, with the constants `ACT_II_B2_SEAM_RELIEF_LEVEL_ID/_EXEC/_DELTA` (`26` / `21.560241` / `−6.044410`) and the honest note that the relief is **largely an instrument artifact** (`par` held identical by the mirror, `ΔB ≤ 0.0239`) and that `D_exec` is **blind to comprehension**, so the *felt* reading is a hypothesis. **§7.3.2** adds the `act-close` clause (new law, ADR-design-0006): an act's registered **maximum must be carried by its last two batches** — not a per-rung climb (no dip without `ΔM > 0`, no padded pars, interior freedom intact, act-open reliefs still lawful), with an honest **escape hatch** (a family that cannot reach a closing peak is a **named act limitation**, reported, never smoothed, and §7.5's no-caveat rule is untouched because the caveat is on the act's shape, not a board's proof). **§7.3.3** pre-registers the **falsifiable Playtest ask** on the five equal-par mirror pairs (STAR-1 replay share + M5/M6, batch-2 side vs batch-1 side; `mastery-rest` survives iff ≥ its same-par comparator on ≥ 3/5 paired participants, `deflation` declared on ≥ 2/5 quit-within-next-level at the L25→L26 seam ⇒ fires C with an ADR) — defensible because `D_exec` carries no comprehension term. **§7.4…§7.7 unchanged.** **§7.8** new: the Act II batches-3–4 handoff — the closing-peak obligation (`> 27.604651`), the **derived** par obligation (**`par 24` ⇒ `D_exec ∈ [27.7500, 29.0625]`** from the measured `B` band `[1.2500, 1.6875]` and `D_exec = par + 3·B`, ≥ `+0.145349`, redeeming the `1.455349` headroom — **no new number invented**), the **named census obligation** that `par 24` is in-band but **unmeasured** (LV-014's accept pool tops at `par 23`; fallback = the published `27.746988` via the C path + ADR), the **anti-mirror clause** (no third indistinct rung set; own par set inside 16–24; §6.1.4 key distinct; named open axes = the 4-pocket member and the deferred `--pocketsize ≥ 11` probe), and the "label before the bytes" rule for any further relief. **No registered row, par, weight, gate, band, sidecar cell or board byte moved** — Act II batch 2 stays ON THE SHELF and L21–L25 stay registered; no star threshold re-prices (`par` unchanged; a future `par 24` is already covered by ADR-design-0005's `21–30 → +6/+12` row, derivation not pins). Full record: `docs/decisions/design-0006-act-close-peak-and-relief-label-form.md`. | Agent 1 (GD-010) |
| 2026-10-17 | V1.3 | **GD-011 — the BAND-ENDPOINT law (§7.9), the C path's standing (§7.8 item 7), and the batch-3 relief label blessed for R-006 (§7.3.1 instance 3). Ruling only — no code, no constant, no board.** *(The trigger)* LV-015 escalated **F-L31-1** (item 134; `docs/ai-native-pipeline.md` §8.20): the prover's `act2-par-band` tested the band **strictly** at both ends while the constant, `policy.ts`'s `inParBand`, `author-l21.ts`'s four call sites, §7.2's `4–20` table with **registered L20 at its ceiling** and §7.8 items 2–3 are all **inclusive**. *(The ruling)* **Bands are ranges over DERIVED-EXACT values and are inclusive at both ends; printed forms are display roundings; derive-from-formula, never compare against rounded text.** Act II's `D_exec` band is **`[19.75, 29.0625]`**, printed `[19.75, 29.06]`; `par 24` is in band. *(The untangling — two ceilings, not one)* the escalation's cause was **wrong in its attribution**: **`L34` `28.126943` / `L35` `28.339426` are strictly inside `[19.75, 29.06]` under every reading**, so the `D_exec` ceiling never touched them; the rejection came from the **`par` ceiling `24`** compared strictly at `scripts/prove-candidate.ts:239` — an *integer* law constant with no rounding in it. The claim's second half ("the act then closes **only** via the C path") is **false as an absolute**: §7.3.2 puts the carrier obligation on the act's **last two batches**, so batch 4 remains a legal carrier (and is moot — the strict reading is refused and the act-close is carried at `28.339426`). *(The latent half)* the **stored** constant `ACT_II_EXEC_BAND[1] = 29.06` is a **printed rounding**, so `§7.8`'s own mandate is unbuildable in the sliver `par 24` / `B ∈ (1.6866̄, 1.6875]` ⇒ `D_exec ∈ (29.06, 29.0625]` — **empty in every census to date**; the constant/operator alignment is a **code follow-up** filed to Architecture / Gameplay / Level-Solver, **not** done here (GD writes no code; no `src/**`, no `scripts/**`, no constant touched). *(Blast radius, by name)* batch 1 registered tail **L25 `27.604651`** ✔ · batch 2 shelf max **L30 `27.566265`** ✔ · batch 3 census top **`28.771084`** ✔ · **L34/L35** ✔ · Act I measured top **L20 `24.729412`** ✔ — **no published row changes side**; the only changed verdicts are hypothetical rows (a rung *on* a ceiling, and the `0.0025` sliver). *(§7.8 item 7 — Q2)* the **C path is KEPT ARMED for future acts and its Act II fallback ground is RETIRED by measurement** (LV-015: `par 24` non-empty, **130 accepts / 2640 judged** exact + **498 / 20000** floored on the batch's own frame; `act-close` carried at `28.339426`, **+0.734775**): a contingency measured absent is **falsified, not dormant** — it may not be invoked on the par-24-absence ground, while its **own §7.3.3 deflation trigger** and **future-act** use stay armed, each with **its own ADR**; **retiring it outright is refused** (one act's census cannot falsify a remedy for an uncensused act). *(§7.3.1 instance 3)* the pre-published **L30→L31 `ΔD_exec = −4.362098`** label is **blessed for verbatim citation by R-006** with **one notation-only amendment** (band written derived-exact, printed form in parentheses, per §7.9) — **no number LV-015 published pre-write changes** (`Δpar −4`, `3·ΔB −0.362098`), and the amendment precedes registration, so the law-before-bytes order is not re-opened; constants proposed `ACT_II_B3_SEAM_RELIEF_LEVEL_ID/_EXEC/_DELTA` (`31` / `23.204167` / `−4.362098`). *(§7.2)* the act table carries a **band-notation note** so no printed number is ever used as a comparison operand again. *(Not touched)* ADR-design-0005 / ADR-design-0006 bodies, `docs/game-design.md`, §6/§6.1/§6.2, every registered row, every weight, every gate, every sidecar cell, all of `src/**` and `scripts/**`; the locked core loop is byte-identical and the AGENTS §2 triad is **not** convened (no core-rule change: this is band *reading*, not the phase loop). Full record: `docs/decisions/design-0007-band-endpoint-law-and-c-path-standing.md`. | Agent 1 (GD-011) |
| 2026-10-18 | V1.4 | **GD-012 — new §7.10: the Act III band (derived-exact), the L41–L45 opener rule, Act III par/star totality, and the Act II→III `act-open` relief PRE-PUBLISHED (renumbered **instance 5** by the V1.4b corrigendum below; it is `instance 4` as written here and **must not be read as instance 4**). Ruling only — no code, no constant, no board.** *(The trigger)* Act II closes at **L40** (its final batch `l036`–`l040` is shelf-proven at LV-017 and is being registered by in-flight **R-006a**); its tail measures **`28.455319`** against the Act II ceiling **`29.0625`** — headroom **`0.607181`** — so **Act II's band is nearly topped out by design and Act III needs its own derivation**. *(§7.10.1 · RULING A)* Act III is **`L41–L60`** (plan of record, §7.2; the dispatch's "L41–L6x" resolves to L60) and its `D_exec` band is derived from **its own** `par` band: `PAR_FLOOR 20`, `PAR_CEILING 28`, measured `B` band `[1.2500, 1.6875]` ⇒ **`[23.7500, 33.0625]`**, *printed* `[23.75, 33.06]` (both endpoints dyadic ⇒ bit-exact; inclusive per §7.9; **derive-from-formula, never compare against rounded text**). The band **translates Act II's by exactly `+4.0` on both ends**; its floor sits **`4.705319` below** Act II's closing rung, so the previous act's tail is strictly inside — the §7.3 interior-freedom shape. **§7.3.2's `act-close` carry window for Act III is `L51–L60`** (its last two batches). *(§7.10.2 · RULING B)* the opener ladder is **derived, not searched**: **`[20, 22, 24, 26, 26]`** via six clauses — **O1** P2-exact 5-member window (`20,22,24,26,28` = LV-017's derivation on Act III's constants); **O2** the **ceiling is reserved** (the derived top `par 28` is withheld and the 5th rung repeats the truncated top at its within-par maximum); **O3** the reservation is **derived, not taste** — opener rungs top out at `26 + 3·1.6875 = 31.0625` while any `par 28` tail rung bottoms at `28 + 3·1.2500 = 31.7500` ⇒ **`31.7500 > 31.0625`** (margin `0.6875`), so `act-close` is satisfiable **by construction** regardless of the opener's realised `B` (an opener at `par 28` measuring `33.0625` = the band ceiling would make the clause fail by construction); **O4** anti-mirror against every registered Act II multiset and every other Act III batch (coinciding pars printed, never hidden); **O5** empty pool ⇒ **ABSENT, never substituted** (descending fill; shortfall **STOP-AND-ROUTES to GD**, never a silent extension to the ceiling); **O6** final rung within-par **maximum**, earlier rungs minimum. **The opener carries NO `act-peak`/`act-close` branch** — §7.3.2's carrier is `L51–L60`, and §7.3's `act-peak` binds the act's measured maximum read per batch. *(§7.10.3 · RULING C)* Act III admits **`par 20–28` inclusive** — the ladder **does** extend beyond Act II's `par 24` (`26`, `28`), but **28 ≤ 30**, so every Act III par falls inside ADR-design-0005's **existing** rows (`11–20 → k1 4 / k2 8`; `21–30 → k1 6 / k2 12`, `k1 = 2·⌈par/10⌉`, `k2 = 2·k1`, `1★ = any finish`): the star law is **total over Act III by derivation**, **no new row is ruled and `docs/game-design.md` §14.2 needs no edit** (Act IV `24–32` / Act V `28–36` are likewise covered by the published `31–40 → +8/+16` row and below). Recorded corrigendum: a dispatch restatement gave "`k1 = ceil(2·par/10)`, `k2 par 21–30 = 6`"; the record (`star-era-asks-readiness.md` §2) gives `par 21–30 → k1 = 6`, `k2 = 12` — the `6` is **`k1`**, and the pair is `2·⌈par/10⌉` — corrected against the artifact, not propagated. *(§7.10.4 · RULING E)* the **L40→L41 `act-open` relief is PRE-PUBLISHED** as §7.3.1 **instance 5** *(was written "instance 4" in this row at V1.4 — see V1.4b)* with the published bound **`ΔD_exec ∈ [−4.705319, −1.392819]`** (union over O5's admissible first rungs: L41 at `par 20` ⇒ `[−4.705319, −3.392819]`; at `par 22` ⇒ `[−2.705319, −1.392819]`), decomposition `ΔD_exec = Δpar + 3·ΔB` with the `par` term (`−4` at the floor) shown beside it; exact value is a **fill-in before the bytes, never after**; constants proposed `ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41` + `_DELTA_RANGE`; the relief is **largely an instrument artifact** of §7.10.2's derived ladder, discharges no clause, and its felt half is a **labelled Playtest hypothesis** (§7.3.3, `NOT TESTABLE, n = 0`). *(§7.10.5 · RULING D)* mechanics stance = **YAGNI: zero new mechanics, zero new board features, zero architect-impact** — `ΔM = 0` so §6's dip law does not bind Act III and no rung may be scored as a debut; two opposite-colour portal pairs are **composition** over §1's portal array, the **XOR multi-switch door** is already pinned semantics (§1, RV-002 M-5; §7.2 moved the allowance here) needing no schema/core/validator change; **prefer the proven `CX = 1` frames** (`7×6`@`CX=1` 40/27/27/40 disjoint 7; **`7×7`@`CX=1` 46/31/31/46 disjoint 8) and the proven **4-pocket/5-door/5-press** class — **F-L31-1's kill separated the FRAME, not the device class** (`CX = 2` empty, `CX = 1` non-empty); a **5-pocket** device stays refused and uncensused; anything beyond is **architect-impact with its own ADR**. *(Booked, not solved)* the structural **chain-envelope** (100-rung walk cost) stays BOOKED to the Architect at the Act IV juncture; §7.10 is **seam-walk-neutral** (no clause reads a cross-act walk; every batch proves on its own bytes). *(Not touched)* the locked core loop, every level byte, every registered row, every weight, every gate, every Act I/II band value, every sidecar cell, all of `src/**` and `scripts/**`; ADR-design-0005 / -0006 / -0007 bodies are **riders, not edited**; the §7.2 band-notation note gains Act III's derived-exact form. Full record: `docs/decisions/design-0008-act-iii-band-opener-and-star-totality.md`. | Agent 1 (GD-012) |
| 2026-10-18 | V1.4b | **GD-012b — CORRECTIVE, numbering only: the relief register comes back IN ORDER.** The V1.4 row above numbered the Act II→III `act-open` label (`L40→L41`) **"instance 4"**, but the register collides there: the **`batch-seam` `L35→L36` · `ΔD_exec = −6.038144` · band `[19.75, 29.0625]`** relief was **pre-published by LV-017's rule 9 before the census and before any byte** (rule commit **`b9dac54`**, git-dated), is planted in the candidates README, `docs/level-difficulty.md` and `docs/ai-native-pipeline.md` §8.24 — where it is already called §7.3.1's **fourth instance** — and **registers with batch 4 in in-flight R-006a's train**, whose ticket cites it as instance 4 **now**. Since the register is ordered by **seam position**, **`L35→L36` is instance 4** and the **`L40→L41` act-open renumbers to instance 5** (`L20→L21` 1 · `L25→L26` 2 · `L30→L31` 3 · `L35→L36` **4** · `L40→L41` **5**). §7.3.1 gains the fourth entry — the **verbatim** pre-published text, **quoted from the artifact, no number retyped**, with its provenance (rule 9 / `b9dac54`, pre-census and pre-byte, pending registration with batch 4) and its **notation-only** reading for R-006a's verbatim citation — plus a fifth entry as an **index line only** pointing at §7.10.4 (the label text is **not duplicated**); the list's stale count word is corrected with it. §7.10.4's heading and the ADR's crossrefs move `instance 4 → instance 5`; the register's stated ordering rule is now explicit. **No label text, no number, no band, no `ΔD_exec`, no `Δpar`, no `ΔB`, no constant, no gate, no registered row, no level byte and no ruling changes** — this is the **numbering of a register**, disclosed as corrective, dated, and **not a silent edit**: the V1.4 row's own "instance 4" wording is **annotated in place** rather than rewritten, so the collision stays legible. | Agent 1 (GD-012b) |
| 2026-10-19 | V1.5 | **GD-013 — new §7.10.6: the Act III INTERIOR-BATCH rule (B1–B7), the O3 reservation's scope, and `par 27`'s refusal in arithmetic; new §7.10.7: the `L45→L46` `batch-seam` relief PRE-PUBLISHED as §7.3.1 instance 6, plus the register-wide relief-admissibility test. Ruling only — no code, no constant, no board.** *(The trigger)* the level lane is gated on this register's owner (`docs/project-status.md` item 157): a batch-seam relief must be **pre-published before the census**, and Act III's second batch had **no ladder law** — §7.10.2's O1–O6 are scoped to the opener in their own words. *(The falsified assumption)* LV-017's uniqueness identity (*5 members × step 2 = span 8 = the band's width* ⇒ unique) **does not transfer**: the first half's usable `par` set is `{20,22,24,26}` — **width 6 across 4 values** — so a 5-rung batch **must** repeat and the identity is gone. The clause set `{B3–B7}` admits **three** multisets for batch 2 (`[22,24,26,26,26]`, `[24,26,26,26,26]`, `[26,26,26,26,26]`), refusing only batch 1's own `[20,22,24,26,26]` by anti-mirror. *(§7.10.6 · RULING)* the rule is **B1–B7**: **B1** the ladder's floor advances by exactly one P2 step per batch (`A₂ = 22`); **B2** the rule's **self-check** — at `ℓ = 1` it reproduces `ACT_III_OPENER_PAR_MULTISET = [20,22,24,26,26]` **exactly**, so it is not a new rule wearing §7.10.2's clothes; **B3** the reservation's **scope** is **`L41–L50`**, with `par ≤ 26` and **`par 27` INADMISSIBLE** — `26 + 3·1.6875 = 31.0625 < 28 + 3·1.2500 = 31.7500` (margin `0.6875` = `ACT_III_CEILING_RESERVATION_MARGIN`) while `27 + 3·1.6875 = 32.0625 > 31.7500` by `0.3125`, a boundary under **both** an inclusive and a strict reading, so no operator decides it (§7.9 pre-empted); **B4** truncate + fill at the truncated top (O2/O5 verbatim); **B5** O6's within-par convention **plus the plural-same-par tie-break** — with **two** non-final `par 26` rungs (`L48`, `L49`), the opener's single-rung reading was unexercised and is now closed; **B6** empty pool ⇒ **ABSENT, never substituted**, the fill dropping to the next-lower derived value, with the degenerate `Δpar = 0` outcome a **STOP-AND-ROUTE to GD**; **B7** O4's anti-mirror with coinciding pars **printed**. **Because the multiset is not unique, the tie-break itself is published** as B1's box: *the smallest admissible advance above the previous batch's anchor* (one P2 step), grounded in (i) minimum advance clearing B7, (ii) keeping **every derived-window value in the act's par vocabulary** — a two-step advance leaves `22` with no home — and (iii) the file's existing minimality conventions (O6; LV-015/LV-017's minimal-`D_exec`-then-enumeration order). **It is labelled a tie-break, not a derivation**: clause (ii) is checkable and a census may legitimately falsify it, with its own ADR. **Derived batch-2 ladder: `[22, 24, 26, 26, 26]`** (`L46 22 · L47 24 · L48 26 · L49 26 · L50 26`), ceiling `31.0625` — strictly below any `par 28` tail rung's floor `31.7500`, so **§7.3.2's carrier obligation on `L51–L60` remains satisfiable by construction**; batch 2 **carries no `act-peak`/`act-close` branch** and only **reports** its peak (whether the front half's maximum lands on the Midterm `L50` or stays at `L45`'s `30.455319` is a **measurement**, never repaired by padding). *(§7.10.7 · RULING)* the seam is a **re-anchor by arithmetic** (`Δpar = −4`) and is therefore **pre-published** as §7.3.1 **instance 6**: **`batch-seam` L45→L46 · `ΔD_exec ∈ [−4.705319, −1.392819]` · band `[23.7500, 33.0625]`**, the bound being the **union** of `par 22` ⇒ `[−4.705319, −3.392819]` (B1's anchor) and `par 24` ⇒ `[−2.705319, −1.392819]` (B6's fallback), decomposition `ΔD_exec = Δpar + 3·ΔB` with the `par` term shown (`−4`, then `−2`), exact value a **fill-in before the bytes**. Two properties are published so the lane **verifies** rather than trusts: the union is **not an interval** (a fill-in in the union but in neither half is **outside** the label), and the bound is **numerically identical to instance 5's** by the one-line **`+2` shift identity** (`22 − 30.455319 = 20 − 28.455319 = −8.455319`) — **the bound coincides, the value must not** (`−4.197990` belongs to `L41`'s `B` `1.4191`). *(The register, closed rather than dodged)* **§7.10.7's RELIEF-ADMISSIBILITY TEST** — a `ΔM = 0` seam is a **registrable relief iff its `par` term is negative**; a `Δpar = 0` seam's residue is `3·ΔB`, bounded by **`1.3125`**, and is an **instrument reading**, never labelled (the LV-017 interior-minima precedent, e.g. `−0.071490 … −0.109810`). All of instances 1–5 have negative `par` terms (`−4 · −4 · −4 · −6 · −4`), so the test **describes** the register and does **not** narrow it; the **no-relief branch is not taken** — not because a breath is desirable, but because B1's tie-break re-anchors at `22`. *(Register)* §7.3.1's list grows to **six** entries in seam order with a sixth row (index line to §7.10.7 + the bound + the halves + the provenance order bound → fill-in → bytes); §7.2's band-notation note gains the **batch-by-batch** pointer so the act band is never read as a per-rung licence. *(Evidence, and what it is not)* every number is **read from `src/core/solver/policy.ts`** (`ACT_III_PAR_FLOOR 20` · `ACT_III_PAR_CEILING 28` · `ACT_III_B_BAND = BLOCK_L1619_B_BAND [1.25,1.6875]` · `ACT_III_EXEC_BAND [23.75,33.0625]` computed · `ACT_III_OPENER_PAR_MULTISET` · `ACT_III_OPENER_TOP_PAR 26` · `ACT_III_CEILING_RESERVATION_MARGIN 0.6875` · `ACT_III_B1_LADDER` · `ACT_III_REGISTERED_TAIL_LEVEL_ID/_EXEC 45/30.455319`) or **derived by the arithmetic printed beside it**; LV-018's census pool by par (`22:387 · 24:512 · 26:599`, a **prefix floor**) is cited as *evidence that B1's anchor is populatable*, **never as a promise** — B6 keeps ABSENT-never-substituted and the lane must verify with its own census. **No playtest datum exists for this seam** (§7.3.3's instrument reads `NOT TESTABLE, n = 0`), so the felt half is a **labelled hypothesis** and the tie-break is published **as a tie-break** — my own sawtooth-over-plateau preference is **not** evidence (AGENTS §7). *(Not taken)* the `L51–L60` tail's ladders and the reservation's **release clause** stay **unlegislated**: they are coupled to the **XOR / `H` both-pair device-contract question booked to Game Designer + Architect** (item 154) and do not gate `L46–L50`; the **XOR debut stays held for the act's second half** (user ruling **U-002**), the **5-pocket** device stays refused and uncensused. **Mechanics stance unchanged** (`ΔM = 0`, §7.10.5): **no** mechanic unit, **no** board feature, **no** device contract, **no** architect impact. *(Not touched)* the locked core loop (no AGENTS §2 triad — band/ladder/relief law, not the phase loop), every registered row, every band value, every weight, every gate list, every sidecar cell, every level byte, all of `src/**` / `scripts/**` / `tests/**`, `docs/game-design.md` (no mechanic, no HUD, no star row), and ADR-design-0005 / -0006 / -0007 / -0008 bodies (0008 is a **rider**: quoted and extended, never edited). Full record: `docs/decisions/design-0009-act-iii-interior-batch-and-batch-seam-relief.md`. | Agent 1 (GD-013) |
| 2026-10-20 | V1.6 | **GD-014 — new §7.10.8: the XOR multi-switch door DEVICE RULING; new §7.10.9: the `par 28` reservation RELEASED + the `L51–L55` ladder law; new §7.10.10: the `L50→L51` `batch-seam` relief PRE-PUBLISHED as §7.3.1 instance 7, plus a register rider and finding `F-GD014-1`. Ruling only — no code, no constant, no board.** *(The trigger)* items **154 / 159**: LV-018 handed the **XOR / `H`-both-pair device-contract question** to **Game Designer + Architect** (*does `g6`'s covering rule need a second derivation, or is the `H` composition a NEW DEVICE CONTRACT?*) and wrote that **the `par 28` top is reserved for the answer**; §7.10.7's closing paragraph coupled the tail's ladders and the **release clause** to it **by name**; user ruling **U-002** puts the XOR debut in the act's second half. *(§7.10.8 · RULING)* **the answer is NEITHER option as posed — option (a) DERIVABLE, for semantics/representation/covering.** `derivedWalkSealedRooms` (`scripts/room-derivation.ts:69–116`) reads only `phaseAWalls`/`phaseBWalls`/`doors[].tiles`/connectivity and **never reads `switches[].targets`**, and a door tile blocks structurally in **every** phase and switch state ⇒ the `g6` covering list is **invariant under any mutation of `targets`** ⇒ **no second derivation is owed**. Representation is **multiplicity on the EXISTING schema** (`≥ 2` switches listing the id) — **no new field, no validator change, no core predicate**: the XOR composition is **already shipped** (`doorIsOpen`, `src/core/rules/solid.ts:93–106`; §1 / RV-002 M-5) and the `[multi-switch-door]` **stays a warning** (`src/core/level/index.ts:622`). **`ΔM = 0`, no debut grade, no dip** (§7.10.5 unchanged, now with the code reading behind it). *(The real gap, ruled as a NEW obligation)* **`G2-X`**: the `G2`/`g2` press-then-cross reader is implemented **twice** (`scripts/author-l21.ts:1968–1991`, `scripts/prove-candidate.ts:279–297`) and tests `targets.includes(doorId)` **membership** — sound for a single-switch door, **unsound under XOR**, because a press can **CLOSE** the door it targets ⇒ a route can be credited with *"pressed, then crossed"* by a press that did the **opposite**. `G2-X` requires, for every par route and every crossed door with **≥ 2** targeting switches, an arrival `i` that **toggles a targeting switch**, that `route[i].state.levelState.doorsOpen[d]` **CHANGES** there (effective press, to `true`), and a later crossing `j > i` open at every entry. Reader blast radius **`scripts/**` only**, **zero** schema/core/validator change. **Order + measurement:** `G2-X` encodes **before** the census (a gate repaired after a census owes the identical command re-run — the LV-019 `F-L46-1` precedent); the lane **prints the membership-vs-`G2-X` divergence** (GD-008 shape); **divergence = 0 on an XOR class is a STOP-AND-ROUTE to GD**; one **negative control** (membership-pass / `G2-X`-fail) named from a **measured** refusal. **Core compliance:** XOR changes a **state**, never a position — entry-only solidity, illegal move = no move + no flip, embedded state legal and safe, deterministic only; a closing door is legal **iff** the goal stays reachable, which the shipped `deadStates 0` / `T ≡ R ≡ 0` proof **already** refuses for the trap class; **refused at contract level:** any semantics that crushes, pushes, relocates or randomises. **C4 pacing:** `L51` **no XOR** (instance-7 relief rung); `L52` first encounter **below OFFERED**, `switchRequired: "exempt"` with measured reason (**not `null`**); `L53` OFFERED; `L54` FORCED (`"required"`, all-OFF UNSATISFIABLE, `G2-X` on every par route); `L55` FORCED at within-par max. **Comprehension plan** T0 (latch, assumed) → T1 refusal-is-the-tutorial → T2 echo → T3/T4 forced, with mandatory readability rules **R1** two links visible · **R2** per-switch ON pip legible · **R3** attributability · **R4** second switch reachable without crossing the door it targets · **R5** witnessed refusal · **R6** zero text; the **named risk** (a press that un-opens reads as *inconsistent*) is a **labelled PA hypothesis** measuring **M4/M5/M6 at `L52` vs `L51`**, thresholds frozen pre-cohort, instrument today `NOT TESTABLE, n = 0`; if it spikes the device is **re-designed, never re-labelled**. *(§7.10.9 · RELEASE)* the reservation is **RELEASED effective at batch 3** (`ℓ = 3`), **by arithmetic**: `par 28` floor `31.7500` > first half's ceiling `31.0625`, margin **`0.6875` = `ACT_III_CEILING_RESERVATION_MARGIN`** — the reserved constant, now **SPENT**; the released range `[31.7500, 33.0625]` **is the act band's top**, so the class's floor clears the registered act max `30.455319 @ L45` by **`+1.294681`** and its ceiling **is** the band ceiling `33.0625` (headroom `+2.607181`) ⇒ **§7.3.2's carrier is discharged by measurement whatever `B`**; bands **inclusive** (§7.9); **`par 27` stays INADMISSIBLE — now by derivation** (every Act III ladder value `≡ ACT_III_PAR_FLOOR (mod 2)`, and `27` is strictly dominated: `32.0625 < 33.0625` with identical floor `31.7500`); the first half's `par ≤ 26` scope (**B3**) is **UNCHANGED**. *(§7.10.9.2 · LADDER LAW)* the batch-3 multiset is **`[24, 26, 28, 28, 28]`** (`L51 24 · L52 26 · L53 28 · L54 28 · L55 28`) from **B1–B7 at `ℓ = 3`**: **B1** anchor `A₃ = 20 + 2·2 = 24`; **B2** self-check reproduces **both** landed multisets (`[20,22,24,26,26]`, `[22,24,26,26,26]`); **B3** release; **B4** window `[24,26,28,30,32]` truncated at the ceiling → fill `[24,26,28]` + 2 repeats ⇒ the multiset; **B5** closing rung at within-par max, the two non-final `par 28` rungs ascending by id; **B6** absent-never-substituted, with the **degenerate case ruled in advance** (`24` **and** `26` both empty ⇒ flat `[28×5]`, no interior rise ⇒ **STOP-AND-ROUTE to GD** — a shape no published clause authorises); **B7** distinct from all registered Act II multisets and from **B4/GD-015's** (coinciding pars printed, never hidden). **Uniqueness, stated honestly:** unique **GIVEN B1's anchor**, which is chosen by GD-013's **published tie-break**, not a derivation — ground **(i)** (minimum admissible advance; `22` reproduces batch 2 and B7 refuses it) **SURVIVES and alone selects `24`**; ground **(ii)** ("every window value keeps a home") is **SPENT at `ℓ = 3`** and recorded **as spent, not re-asserted** (after `ℓ = 1,2` only `28` lacked a home, so (ii) no longer discriminates — a ground silently re-quoted after it stops discriminating is how a tie-break becomes folklore); **(iii)** (minimality convention) **SURVIVES**. If a census contradicts (i)/(iii), that measurement is the trigger for a **replacement rule with its own ADR**. **Census obligation, never a promise:** `par 28` is non-empty in the **Act III `G`-family** pool (LV-018 `556`, LV-019 `529`) but that is **not** the **`H` both-pair** lattice, **not yet censused** — **no ceiling claim in either direction**; if `H` cannot populate the ladder, **B6 governs**. *(§7.10.10 · RELIEF instance 7)* the `L50→L51` seam is pre-published **before the census and before any byte** (the instance-5/-6 order: bound → fill-in → bytes): `par` term **`−2` by construction** (B1 anchors `24` while `L50` sits at `26`); comparator **`L50 = 30.417021`** (batch 2's shelf-measured max); bound **`[−2.667021, −1.354521]`** (the **`par 24` half alone**). Three stated properties: **(a)** a **single half, not a union** — the `par 26` fallback has `Δpar = 0` ⇒ **not a relief** by §7.10.7's test, its residue `[−0.667021, +0.645479]` published as an **instrument reading** (it spans the sign change only because the comparator sits inside the `par 26` band); **(b)** the `+0.038298` shift identity (`30.455319 − 30.417021`) is a **checkable coincidence, not a template** — instance 6's `−4.212830` belongs to `L46`'s own `B` (`1.4142`) and re-quoting it would cite a different board; **(c)** the comparator is **explicitly NOT the act tail** — `L50` is **below** the registered tail `30.455319 @ L45`, so after R-008 the act maximum **stays at `L45`** (item 159, re-derived) ⇒ this seam's left side must be **alias-typed to the batch-2 tail constant** (`50` / `30.417021`) and **never** to `ACT_III_REGISTERED_TAIL_*`, which is a **different board by `0.038298`**. Proposed constants `ACT_III_B3_SEAM_RELIEF_LEVEL_ID = 51`, `_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed with a `near()` assertion**, `_DELTA_RANGE = [−2.667021, −1.354521]`, `_ADMISSIBLE_FIRST_RUNGS = [{ par 24, [−2.667021, −1.354521] }]` (exact `_EXEC`/`_DELTA` filled after selection, before bytes; a value outside the half is **STOP-AND-ROUTE to GD**); ladder-side `ACT_III_B3_ANCHOR_PAR`, `ACT_III_B3_PAR_MULTISET = [24, 26, 28, 28, 28]`, `ACT_III_TAIL_PAR_CEILING_RELEASED = ACT_III_PAR_CEILING`. *(RIDER, disclosed)* §7.10.7's register-wide test is **extended by one reading, nothing narrowed**: the release makes a **new corner reachable for the first time** — degenerate **B6** (`L51` at `par 28`) has `Δpar = −2` **and** `ΔD_exec ∈ [+1.332979, +2.645479]`, a **rise** carrying a negative `par` term; such a seam **still owes this register a pre-published entry** (nothing escapes by sign) but is published **as what it is** — a **`par`-term-negative RISE**, the word *relief* replaced by *rise* in its header — because calling a rise a relief is the **F-L31-2/F-L36-2** failure class (*a label that no longer describes the thing it measures*); the corner is **STOP-gated anyway**, so this is **pre-emptive law, not a live decision**. *(Finding `F-GD014-1`, named, not fixed here)* **a registered instance's left side is a PUBLISHED NUMBER and may not move after registration:** instance 6's comparator is alias-typed to `ACT_III_REGISTERED_TAIL_*` — correct **today** (`45` / `30.455319`) and through R-008 — but the released `par 28` class makes it **certain** a later registration moves the act maximum **off `L45`**, re-pointing the alias and silently **restamping** instance 6's published `−4.212830`; **remedy one line in `policy.ts`** (`src/core/solver/**` — level lane + Architect, **never a design edit**): freeze each instance as `_PREVIOUS_EXEC_AT_REGISTRATION`, or assert `near(...)` so drift fails **loudly**. *(Also in this version, non-§7.10)* the §1 `switches` authoring-rule row is **corrected** (at most one switch per door in **L6–L50**; XOR allowed from **L51** under §7.10.8; the review flag is **never** a gate; `G2-X` applies before the census) and §5's `L36–L45` line gains a **pointer** (the XOR allowance is moved off §8's `L36–L45` by §7.2 Act III and released to `L51`); §7.3.1's list goes **six → seven instances** with the new index row. *(ARCH-006 still owed)* the Architect must sign (i) representation = `targets` multiplicity, no schema/validator/core change, warning stays a warning; (ii) `g6`/region derivation is multiplicity-blind ⇒ no second derivation; (iii) `G2-X` is a **`scripts/**` reader over the shared state graph; (iv) **`F-GD014-1`** constant hygiene. *(Not touched)* the locked core loop (no AGENTS §2 triad — device/band/ladder/relief law, not the phase loop), every registered row, every band value, every weight, every gate list, every level byte, all of `src/**` / `scripts/**` / `tests/**`, and ADR-design-0005/-0006/-0007/-0008/-0009 bodies (0008 and 0009 are **riders**: quoted and extended, never edited). **`docs/game-design.md` §8's twin row** (*"L36–L45 | … rare multi-switch (XOR) doors"*) is a **named, unedited handoff** (out of this dispatch's declared scope). Full record: `docs/decisions/design-0010-xor-device-ruling-and-par28-release.md`. | Agent 1 (GD-014) |
| 2026-10-20 | V1.6a | **GD-014c — ANNOTATION ROW (cite hygiene only: no ruling, no value, no bound, no verdict moves; it annotates the V1.6 row above IN PLACE instead of rewriting it, per the GD-012b / GD-015 lineage rule).** **supersedes-ref: GD-014b**, under **ARCH-006 item (iv)** (constant hygiene / `F-GD014-1`) and **ADR-architecture-0006 §17.4**; the cite form applied here is the law of **ADR-architecture-0006 §10, `ARCH-006c` row (2026-10-20)**. **What is superseded, by name:** the V1.6 row's §7.10.10 sentence *“`_PREVIOUS_LEVEL_ID/_EXEC` **alias-typed with a `near()` assertion**”* — **the live law is NOT an alias.** **The live law, stated once:** a registered instance pins its published VALUES as **literals** — instance 7's left side is the pin `50` / `30.417021` (`ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION` / `_PREVIOUS_EXEC_AT_REGISTRATION`), the **delta is DERIVED from the pin** (so no later registration can restamp it), and `near()` is asserted **on the frozen pair** with message `F-GD014-1` — **never** against the live `ACT_III_REGISTERED_TAIL_*`, whose movement is lawful and printed as a reading. Where it resolves: the **V1.7 row immediately below** (GD-014b), §7.10.10's form-corrected constants paragraph, §7.10.10's **REGISTER-WIDE FORM LAW** block, and §7.3.1 **instance 7**. **Why this row exists while the V1.6 text above stays verbatim:** RV-014 flagged that sentence MEDIUM and un-annotated while its neighbours carry in-place supersession notes; the lineage rule is **annotate, never silently rewrite**, so the V1.6 row above is byte-identical and this row carries the correction. **Tool-lane reading order (unambiguous):** §7.3.1 instance 7 (index line) → §7.10.10 (law text + constants + the register-wide form law) → change log V1.6 (record) → **this annotation** → V1.7 (the superseding law) → V1.8. | Agent 1 (GD-014c) |
| 2026-10-20 | V1.7 | **GD-014b — the §7.10.8.2 C2 reader-text CORRIGENDUM (texts only; the GD-014 RULING is UNCHANGED) + the register's PIN-LITERAL form law.** *(Trigger)* **ARCH-006** (ADR-architecture-0006 §4.2–§4.4, `docs/architecture.md` §17) **REFUSED the published C2 encoding by measurement** and routed the corrected instrument back to this lane: "the Architect refused the *text*, never the *ruling*". *(Corrected in place, §7.10.8.2 C2)* **(a) field path** `route[i].state.levelState.doorsOpen[d]` → **`route[i].state.doorsOpen[d]`** (`ArrivalRecord.state` is a `SearchState`, `src/core/state/types.ts:58–63`; `levelState` is `GameState`-only, `:107`). **(b) C2.2 replaced** — "the resolved openness CHANGES at that arrival" is **UNSATISFIABLE on shipped semantics** (base strictly alternates with the phase, `solid.ts:73–75`; every legal move flips it; ≤ 1 toggle per move, `solid.ts:220–226` ⇒ base-flip **cancels** parity-flip; measured **0 / 17 732** toggling arrivals changed their own target door vs **70 048 / 70 048** non-toggling, over **4 025** par routes) — by the **normative two-leg instrument of ADR-architecture-0006 §4.3, cited and never re-derived**: **ENTRY-STATE leg** `route[j−1].state.doorsOpen[d] === true` (**the C2.3 off-by-one correction**: **30 847** crossings, own-index open **0** vs entry-state open **30 847**) **+ COUNTERFACTUAL leg** (restore the pressed switch's **pre-arrival** value at `i`, recompute via the exported `resolveDoorsOpen` `solid.ts:113`, replay `i+1…j` through the shipped `applyMove` using the records' **own** `direction`, and **require the crossing to FAIL**); parity reading **printed beside**, never deciding (GD-008 shape); **no new core surface, no second derivation, no new search**. **The refused original is KEPT VERBATIM in a dated SUPERSESSION RECORD** inside §7.10.8.2 — *a corrigendum that erases its own evidence trail is a restamp* — together with its refutation and the note that **`divergence = 0` on any XOR-class census fires STOP-AND-ROUTE to GD by law** (never tool-patching, never a widened gate, never a re-labelled class), and that **under the literal text the FIRST census would have read `divergence = 100 %`** — an **instrument defect**, caught **pre-census**, so **no board was misproven**. *(Corrected in §7.10.10 + §7.3.1 instance 7 + property (c)). **Instance-7 constants are re-pinned to the PIN-LITERAL form** per ADR-architecture-0006 §17.4: `ACT_III_B3_SEAM_RELIEF_PREVIOUS_LEVEL_ID_AT_REGISTRATION = 50` / `_PREVIOUS_EXEC_AT_REGISTRATION = 30.417021` as **literals**, delta **DERIVED from the pin** (so no later registration can restamp it), `near()` assertion on the **frozen pair** with message `F-GD014-1`, **never** asserted against the live `ACT_III_REGISTERED_TAIL_*` (whose movement is lawful and **printed as a reading**); the batch-2 tail constant stays the **referent of the values**, never of an alias that could re-point. **New law-text:** *a registered instance pins its published VALUES as literals; aliases only for pre-ticket STANDARDS and closed registered sets* — an alias is admissible only over a referent **frozen by construction**, never over a **growing** set (`policy.ts:2573–2576`). *(Pointer re-pinned 2026-10-20 by GD-015 per **ADR-architecture-0006 §10 / ARCH-006b**: this row's copy read `policy.ts:2572–2576` and landed on the doc-comment above the declarator; the measured cite is `:2573–2576` — pointer only, no value, no bound and no verdict moves.)* *(Non-§7.10 bookkeeping)* §5's `L36–L45` pointer notes the handoff discharged; **`docs/game-design.md` §8's twin row gains the §7.10.8 + corrigendum pointer** (XOR = `targets` multiplicity over **≥ 2 distinct** switches, duplicates inside one switch **inert**, `ΔM = 0`, **first sighting `L52`** per the **T1 refusal-is-the-tutorial** plan). *(UNCHANGED, stated explicitly)* option **(a) DERIVABLE**, the **`G2-X` capability** (blast radius `scripts/**`), the **`par 28` release arithmetic** (`31.7500 > 31.0625`, margin `0.6875`), the ladder **`[24,26,28,28,28]`**, and the **instance-7 bound `[−2.667021, −1.354521]`** — the ruling stands; **only reader text and a constant's typing form moved**. *(Not touched)* every gate, band, `par`, weight, registered row, level byte, all of `src/**` / `scripts/**` / `tests/**`, and ADR-design-0005/-0006/-0007/-0008/-0009 bodies; ADR-design-0010 body quoted, with a **dated STATUS line** added. Full record: `docs/decisions/design-0010-xor-device-ruling-and-par28-release.md` (status note) + ADR-architecture-0006 §4.2–§4.4. | Agent 1 (GD-014b) |
| 2026-10-20 | V1.8 | **GD-015 — new §7.10.11: the `L56–L60` ladder law at `ℓ = 4` (B1–B7 APPLIED, plus B6's no-fallback reading and the B7-vs-batch-3 conditional); new §7.10.12: the `L55→L56` `batch-seam` relief PRE-PUBLISHED as §7.3.1 instance 8 — the register's first COMPARATOR-FREE bound; new §7.10.13: the ACT-MAX RANK ruling for Act III + the plateau-top arithmetic + the `L56–L60` XOR pacing. Ruling only — no code, no constant, no board.** *(The trigger)* §7.10.10's closing paragraph hands batch 4 to this era **by name**, §7.10.9.2 B7 binds it to differ from every landed Act III multiset, and §7.5 forbids registering with a caveat — so the lane is gated on a **rule, not a search** (§7.10.2's standard). *(§7.10.11 · the ladder)* **`[26, 28, 28, 28, 28]`** (`L56 26 · L57 28 · L58 28 · L59 28 · L60 28`) from **B1** `A₄ = 20 + 2·3 = 26`; **B2** the rule now reproduces **three** landed multisets exactly (one more self-check per batch); **B3** the released ceiling unchanged, the first half's `par ≤ 26` and `par 27`'s inadmissibility unchanged; **B4** window `[26,28,30,32,34]` truncated at `28` → `[26,28]` + **3** repeats at the truncated top; **B5** closing rung at within-par max, the **three** non-final `par 28` rungs at the pool's ascending-id minimums (third occurrence of the plural-same-par case); **B6** *NO non-flat fallback exists at `ℓ = 4`* — the post-truncation window is `{26,28}`, so removing either value leaves a **singleton** ⇒ `[28×5]` or `[26×5]`, **both flat, both STOP-AND-ROUTE**, the STOP being on the **flatness** (generalised off the ceiling) with a second arithmetic ground for `[26×5]` (a batch that never enters the released class cannot discharge the carrier and cannot meet the rank duty); **B7** distinct from all three registered Act II multisets, from batches 1/2/3, **and from batch 3's REALISED set** (the conditional below). *(§7.10.11's conditional)* **B7-vs-BATCH-3 is published as a NAMED CONDITIONAL, never a certainty**: batch 3's realised multiset is unknown (LV-020's census is in the future) and B6 can move it to `[22,26,28,28,28]` / `[24,24,28,28,28]` / `[24,26,26,26,26]` (or the already-gated `[28×5]`); the lane **must print the realised multiset before batch 4's ladder is frozen**, the tool **re-runs B7 as a MULTISET-INEQUALITY over the REALISED set** (never a pairwise par comparison — coinciding pars are printed), and on equality it **writes nothing and STOP-AND-ROUTES to GD** (re-anchoring B1's tie-break is a design decision with its own ADR). **Known today as a reading, not a guarantee:** no admissible B6 path can raise a batch-3 rung to `26`, because a fill only removes values from a batch's own window and batch 3's anchor is `24`. *(§7.10.12 · instance 8)* `L55→L56` is pre-published **before the census and before any byte**: `Δpar = −2` **by law** (B1's anchor `26` vs batch 3's closing `28`), bound **`ΔD_exec ∈ [−3.3125, −0.6875]`** = `−2 + 3·ΔB`, `ΔB ∈ [−0.4375, +0.4375]`; **the register's FIRST COMPARATOR-FREE bound** — no measured left-side number enters it, and the **sign is fixed by the band** (`|3·ΔB| ≤ 1.3125 < |Δpar| = 2`), with the general form named for reuse: *when `Δpar` is fixed by law and `3·(B_hi − B_lo) < |Δpar|`, the bound — and the sign — are comparator-independent*. It is a **single half** (B6's fallbacks are both flat ⇒ STOP-gated ⇒ the only admissible left `par` is the anchor), its **midpoint is exactly the `par` term**, and the `1.3125` is quoted as the **checkable coincidence** with §7.10.7's `Δpar = 0` residue bound — never a template. Two named conditionals ride it: a **NAMED F-L16-2 excursion** on either board **voids the band-width step** ⇒ fill-in against the measured pair + **STOP-AND-ROUTE**; and if batch 3's realised closing par moves off `28`, `Δpar` stops being negative ⇒ §7.10.7's test makes the seam **not a relief** and **this instance is VOID as published** (re-publication as an instrument reading or a `par`-term-negative RISE is a **GD ruling**). *(§7.10.13 · the close)* **the ACT-MAX RANK law** (rider at §7.3.2, whose clause text is untouched): an act's **closing batch's maximum is the act's maximum wherever the pool permits the selection**, checked **before the bytes** by comparing the closing rung against the highest registered rung outside that batch — for Act III a **single comparison**, `L60` vs `L55` (both `par 28`, both B5 within-par maxima of **disjoint pools of one class**; `L56` can never be the act max, `31.0625 < 31.7500`, and B5 already outranks `L57–L59`), with the pool's failure published as a **NAMED act limitation with both numbers**, inherited verbatim from §7.3.2's escape hatch and **never** repaired by padding, re-anchoring, rejecting a proven board, or a caveat on a proof (§7.5 untouched). **The plateau-top arithmetic, said out loud:** the entire reachable span at `par 28` is `33.0625 − 31.7500 = 1.3125` — **4.31 %** of the act's registered tail — so batch 4's top four rungs live inside it and **three of its four steps are `Δpar = 0`**; the batch therefore has **no par headroom after `L57`** and the close's intensity must be carried by the **board and the device**. **Is four/five-`par-28` a climax or a fog? NOT A PERCEPTUAL RISK, on a published fact: `par` is never shown live (`GD-OQ1`, §7.1) and `D_exec` is not player-visible at all**, so the plateau is invisible as repetition while the four boards are mechanically distinct (clone guard §6.1.4) — a plateau the player cannot see cannot read as a fog. **(A) `L60` must be the within-act maximum is ADOPTED in its strongest satisfiable form** (pre-byte comparison + named shortfall), **(B) max-within-batch-4 is adopted as a consequence, never a substitute**, **(C) unconstrained is REFUSED**: the band admits an inversion of up to `1.3125`, so (A) is enforced by a **comparison, not by containment**, at **zero headroom cost** — the ceiling `33.0625` is shared by both candidates, so the duty creates no padding pressure — and (C) would let the file publish §7.3.2's *"a shape with a culmination"* about an act whose last board is its **weakest-measured** ceiling rung (the `F-L31-2`/`F-L36-2` class). The arithmetic half is law; the felt half is a **labelled hypothesis** with a **testable prediction** (a measured `M5/M6`/replay climb across `L57→L60` on an inverted close **falsifies** the rank duty and withdraws it with its own ADR; my sawtooth preference is not evidence, AGENTS §7). *(§7.10.13.4 · pacing, C4 continued)* the teaching cycle **completes at `L55`**, so `L56–L60` is the **expression** phase with `ΔM = 0` and **no debut grade**: **`L56` OFFERED, never FORCED** (`switchRequired: "exempt"` with its measured reason — a relief rung may carry the device but **may not carry an obligation**), **`L57` OFFERED** (the batch's **lowest-measured** `par 28` rung, so the released class arrives undemanded and the **demand grade stays monotone in the batch's own measured order**), **`L58` FORCED**, **`L59` FORCED**, **`L60` FORCED at the within-par maximum**; every XOR rung owes **R1–R6** + the **R5** refusal witness + **`G2-X`** (never the membership reader), and the named *"press un-opened the door"* risk gains a **second** measurement window (`L58` vs `L57`) under the same redesign-never-relabel rule. *(Refusals, arithmetic where arithmetic exists)* **`par 29`/`par 30` REFUSED** — out of band at the **par** level (`> 28`, integer, no operator question) and homed by no Act III ladder (`par ≡ ACT_III_PAR_FLOOR (mod 2)`); stated pre-emptively that the **`D_exec` band alone would NOT refuse `par 29`** (`29 + 3·1.2500 = 32.7500` is in band) while `29 + 3·1.6875 = 34.0625` and `30 + 3·1.2500 = 33.7500` exceed the ceiling — so the refusal is the **par band plus the derivation**, which is why both are written down. **`5-pocket` REFUSED as UNcensused** (named as unmeasured, not as arithmetic-refused); **any second derivation / schema / validator change REFUSED** (option (a) DERIVABLE, ARCH-006 signed) so `ΔM = 0` holds through the close **by code reading**; **a flat closing batch REFUSED** (B6's STOP). *(Register)* §7.3.1 goes **seven → eight instances** with instance 8 an **index line** (bound, single half, comparator-free property, pin-literal constants, `F-GD015-1`); §7.3.2 gains the **dated ACT-MAX RANK rider** with its body untouched. *(Evidence, and what it is not)* every constant is **read from `src/core/solver/policy.ts`** (`ACT_III_PAR_FLOOR 20` · `ACT_III_PAR_CEILING 28` · `ACT_III_B_BAND = BLOCK_L1619_B_BAND [1.25, 1.6875]` · `ACT_III_EXEC_BAND [23.75, 33.0625]` computed · `ACT_III_CEILING_RESERVATION_MARGIN 0.6875` · `ACT_III_OPENER_PAR_MULTISET` · `ACT_III_REGISTERED_TAIL_EXEC 30.455319` · `ACT_III_B2_BATCH_PEAK_EXEC 30.417021`) or **derived by the arithmetic printed beside it**, and a disk-reading verification script re-computed the band, the anchor, the truncation, both bounds, the spans and both refusal excesses **from `policy.ts` at this ticket's base** (no number retyped from memory); the **`H` both-pair lattice stays UNCENSUSED**, so **no ceiling claim is published in either direction** — B6 governs, never a substitute. **No playtest datum exists** (§7.3.3 reads `NOT TESTABLE, n = 0`), so the felt halves are labelled hypotheses and the tie-break stays a tie-break. *(Not touched)* the locked core loop (no AGENTS §2 triad — ladder/relief/rank law, not the phase loop), every registered row, every band value, every weight, every gate list, every sidecar cell, every level byte, all of `src/**` / `scripts/**` / `tests/**`, `docs/game-design.md`, and ADR-design-0005/-0006/-0007/-0008/-0009/-0010 bodies (**0009 and 0010 are riders**: quoted and extended, never edited); ADR-design-0011 is new and is itself a rider. *(Fold-in)* ARCH-006b's one named residue is discharged: the two stale `policy.ts:2572–2576` copies in this file (the §7.10.10 register-form law, and the V1.7 row) are re-pinned to **`:2573–2576`** with a dated cite of **ADR-architecture-0006 §10** — pointer only, nothing else at those two sites moved. Full record: `docs/decisions/design-0011-act-iii-closing-batch-law-and-act-max-rank.md` (rider to 0009 + 0010). | Agent 1 (GD-015) |
| 2026-10-20 | V1.9 | **GD-016 — new §7.11: the Act IV band (derived-exact), the `L61–L65` opener rule, the reservation's Act IV scope (`L61–L70`, `par ≤ 30`), and the `L60→L61` `act-open` relief PRE-PUBLISHED as §7.3.1 instance 9 — the register's first COMPARATOR-FREE `act-open` bound; the Act IV interior-batch ladder is DEFERRED to GD-017 by name. Ruling only — no code, no constant, no board.** *(The trigger)* Act III's tail (`L56–L60`) is ruled and its census era is next; **an act's band and opener are ruled BEFORE its first census** — GD-012's own order for Act III — and no Act IV byte may exist until this section lands. *(§7.11.1 · the BAND)* Act IV is **`L61–L80`** (§7.2's row IV, four batches of five; **the dispatch's `L61–L70` is the act's FIRST HALF**, corrected by the plan of record exactly as GD-012 corrected `"L41–L6x"` → `L60`), and its `D_exec` band is **`[27.7500, 37.0625]`**, *printed* `[27.75, 37.06]` — **two readings agree to the last digit**: the published growth law (`[23.7500, 33.0625] + 4`, i.e. floors `16/20/24/28` and ceilings `floor + 8`, the `ΔEXEC = ΔPAR` read-out §7.10.1 already published for Act II→III) and the endpoints' own formula (`24 + 3·1.2500`, `32 + 3·1.6875`); both endpoints **dyadic** ⇒ bit-exact; **because the two readings agree the law uniquely determines the band and no STOP-AND-ROUTE is owed**. Three **dated assumptions** are published so the derivation can be falsified: **(A1)** the `B` band is act-invariant **by reference** (`ACT_II_B_BAND` and `ACT_III_B_BAND` are both aliases of `BLOCK_L1619_B_BAND`; a per-act re-measurement is unbuildable pre-census and would reprice every band); **(A2)** `D_exec = par + 3·B` + §7.9's derive-from-formula rule; **(A3)** the plan of record's act boundaries. Read-outs: the Act III registered tail `30.455319` is **inside** Act IV's band (`+2.705319` above the floor, `6.607181` below the ceiling — §7.3 interior freedom), **the carrier window is `L71–L80`** (§7.3.2's own text: an act's **last two batches**; §7.10.1 reads Act III's as `L51–L60`), **star totality is inherited not re-ruled** (Act IV `24–32` falls inside ADR-design-0005's published rows, so **no new star row and no `docs/game-design.md` §14.2 edit**), the admitted range is **`24–32` inclusive with every in-ladder value EVEN** (`par ≡ ACT_IV_PAR_FLOOR (mod 2)` — O1's `+2` window + B1's `+2` advance), and a rung is admissible **batch by batch** (the act band is the outer range, never a per-rung licence). *(§7.11.2 · the OPENER)* §7.10.2's **O1–O6 re-based on Act IV's constants** (quoted, never re-derived): ladder **`[24, 26, 28, 30, 30]`** — **O2** withholds the derived top `par 32` and the 5th rung repeats the truncated top `par 30` at its within-par maximum; **O3** opener rungs top out at `30 + 3·1.6875 = 35.0625` while any `par 32` tail rung bottoms at `32 + 3·1.2500 = 35.7500` — margin **`0.6875`**, **act-invariant by construction** (`2 − 3·(B_hi − B_lo) = 2 − 1.3125`) and a **checkable coincidence, never a template**, with `ACT_III_CEILING_RESERVATION_MARGIN` (in `policy.ts` that constant is *derived* from its own act's endpoints, so the Act IV sibling is derived likewise); **O4** the multiset differs from **all eight** known multisets (Act II's three, Act III's four, and batch 4's law set) and the distinctness is **structural** — it is the only one carrying `30`; **O5** ABSENT-never-substituted with a **rising** fill (the instance-5 precedent publishes exactly two admissible first rungs ⇒ `par 24` or `par 26`), then **STOP-AND-ROUTE**; **O6** final rung within-par maximum, earlier rungs minimum, with §7.10.6's **plural-same-par tie-break** applying from the act's **first** batch (`par 30` is doubled by the truncation). **The opener carries NO `act-peak`/`act-close` branch** (carrier on `L71–L80`; every rung in band by construction). **ENTERS THE BAND OR HOLDS AT ACT III'S CEILING? — ENTERS, at the act's own floor.** The Act II→III precedent is quoted: Act III's opener anchors at `ACT_III_PAR_FLOOR = 20` while Act II's ceiling is `par 24`, and **U-002 ratified exactly that default for the user** ("floor-anchored ladder `[20,22,24,26,26]` … the `−4` par-term breath"); so `L61 = par 24`, `Δpar = −4` against Act III's closing `par 28`. **The hold is REFUSED on three grounds:** (1) it deviates from ratified law and a deviation owes an ADR and a reason — none exists on disk; (2) it leaves the act's **floor class** homeless at the one batch that can home it cheaply, and §7.10.9.1's tie-break ground (ii) is **live again at a new act's first batch** (recorded so it is not re-quoted after it dies, as GD-013 recorded its death); (3) it would open the act by re-entering `par 28`'s class `[31.7500, 33.0625]` — **the same numbers** as Act III's closing four rungs — so distinctness would rest on geometry alone; ground 3 is **not** a refusal by itself and is labelled as desirability, never as unlawfulness. **Shape principle at the seam, resolved by measurement:** the dispatch's "same-par / different-shape" phrase **is not law text anywhere in this file**; the seam's published properties are a §7.3 interior relaxation at a `ΔM = 0` boundary, a re-anchor **by arithmetic**, and O4's **multiset-difference** — so the principle is stated as **same device class, different ladder shape**, machine-checkable, with the felt half a **labelled hypothesis**. *(§7.11.3 · the SCOPE)* O3 re-based: the first half **`L61–L70` takes `par ≤ 30`**, **`par 31` inadmissible**, **`par 32` reserved**; the **release of `par 32` is NOT ruled here** (§7.10.9.1's release was an arithmetic act against a *registered* act maximum; Act IV has no registered row, so it is named as the tail's own future GD ruling). *(§7.11.4 · instance 9)* the seam is pre-published **before the census and before any byte**: `Δpar = 24 − 28 = −4` **by law** ⇒ **`[−5.3125, −2.6875]`**, plus **O5's one rising-fill half** at `par 26` (`Δpar = −2`) ⇒ **`[−3.3125, −0.6875]`**, both **comparator-free** (no measured left-side value enters them; `|3·ΔB| ≤ 1.3125 < |Δpar|` fixes the **sign** from the published band alone — the general form §7.10.12 named, so instance 9 is the register's first comparator-free **`act-open`**, where instance 5 needed `L40 = 28.455319`); **two halves, never a hull** (a fill-in in the hull but in neither half is **outside** the label); a **named numerical coincidence** (`[27.7500, 29.0625] − 30.455319 = [−2.705319, −1.392819]`, the same numbers as instance 5's `par 22` half with **different referents**) is published so it cannot be cross-quoted. **Three self-voiding clauses, each with a named owner-program:** **(V1)** a **named F-L16-2 excursion** on either board voids the band-width step ⇒ fill-in against the measured pair + **STOP-AND-ROUTE** (owner: the Act IV census); **(V2)** `L60 = par 28` is law only while Act III's batch 4 is **registrable at all** — every B6 fallback at `ℓ = 4` is a flat, STOP-gated batch ⇒ if it fires the seam has **no lawful left side** and **this instance is VOID as published**, never re-published against a borrowed batch (owner: the `L56–L60` census + registration train); **B7's multiset conditional is inherited unchanged**; **(V3)** the `F-GD015-1` pin duty — a comparator-free bound **still owes a pinned comparator at the fill-in**, published because this is the **third occurrence** of that hazard class. Registration-side constants are proposed in the **PIN-LITERAL** form with the comparator declared **never** as an alias to `ACT_III_REGISTERED_TAIL_*` (whether that symbol points at `L60` depends on §7.10.13.3's rank comparison, so an alias would be correct only **contingently**). *(§7.11.5 · stance, comprehension, deferrals, refusals)* **`ΔM = 0` through Act IV by citation** (§7.2's own family sentence — *furniture on the same physics* — plus §7.4's stages `I`/`J` being **generator lattices**, not devices; the plan names **NO new device**), with the §7.10.5-style **named conditional** (a maze read needing a rule the core lacks is architect-impact and needs its own ADR *before* authoring, and the `ΔM = 0` claim is then void for that batch); **Asset Gate unaffected** (no new board feature ⇒ no `asset-request` owed). **Comprehension plan = NAMED HOLD, not a T-series extension:** no debut rung exists to hang a beat on, the shipped teaching is assumed (T0 latch; L3 refusal; L4–L5 phantom walk; the both-pair cycle T1–T4 complete at `L55`), and the hold carries R6 + §6.1.4's clone guard + the registry gate, with a **named risk** (*"it refused me here and let me through there"* reading as inconsistency) measured on **M4/M5/M6 at `L61–L65` vs `L60`** with thresholds frozen pre-cohort (`NOT TESTABLE, n = 0` today) and a **falsification clause** (spike ⇒ **re-designed, never re-labelled**); the `T5` extension is **deferred to GD-017** because a teaching cycle is a per-rung claim and the interior rungs are that ticket's. **Deferrals:** the Act IV **interior-batch ladder (B1–B7 at `ℓ = 2,3,4`) → GD-017 near its era** (GD-012's own precedent: the Act III opener ticket did not legislate interior ladders; GD-013 did, when gated) — **EXCEPT the one anchor the band law forces**, and the **B1 scope question is answered from disk**: B1 is **ACT-SCOPED** (its law text names `ACT_III_PAR_FLOOR` and `ℓ` indexes that act's own batches), so the cross-act generalization is **substituting the act's floor into the same formula**; the dataset-scoped reading **collapses arithmetically** (a dataset-scoped `ℓ = 5` would give `A = 24 + 2·4 = 32` — the act's own **reserved ceiling**, forbidden as an opener), so the forced anchor at Act IV's first batch is **`ACT_IV_PAR_FLOOR = 24`** (the `+2` is the **step**, not the anchor). Also deferred: the `par 32` release, `T5`, and the register's **re-pinning duties** (instances 6/8's pins + item 167's three disclosed growing-alias declarators at the tail move — `src/**`, level lane + Architect, never a design edit). **Refusals with arithmetic where arithmetic does the refusing:** **`par 33`** is **inside the band** at the `B` floor (`36.7500`, by `0.3125`) so **containment alone does not refuse it** — refused by the `par` band (`> 32`, integer, no operator question) **and** the mod-2 derivation (`38.0625` at the band top, excess `1.0`); **`par 34`** refused by the band with containment agreeing only at the floor (`37.7500`, excess `0.6875`) and `39.0625` at the top (excess `2.0`); **`par 31`** is admitted by **both** containment and the band (`[34.7500, 36.0625] ⊆` the band) and is refused **by the derivation only** — odd ⇒ no home — and **strictly dominated in two readings stated together**: at any in-band `B` it measures exactly `1.0` below the `par 32` rung built from the **same** `B`, and read **inside the reserved class** (`D_exec ≥ 35.7500`) its span is `[35.7500, 36.0625]` against `par 32`'s `[35.7500, 37.0625]` — identical floor, top `1.0` lower; which is the section's sharpest read-out: **an Act IV admissibility test without the `par`-band/parity derivation is insufficient**; **`par 32` in the first half** is in band, in the parity class, and **still inadmissible** (containment is not admissibility); **REFUSED** also: any new device/mechanic/board feature, **re-stamping** (no published number moves; instance 9 is **appended** in seam order, never inserted), **any ceiling claim while `H` is uncensused — in either direction** (stages `I`/`J` have no census at all; if the ladder cannot be populated **O5 governs**), **any Act IV rung law that would break monotone grades** (§7.10.13.4's convention inherited as a binding constraint: no pandering grades, no **debut** grade under `ΔM = 0`, no FORCED demand on a relief rung), and **silence about the felt half**. *(Evidence, and what it is not)* every number was **read from `src/core/solver/policy.ts` at this ticket's base or derived by the arithmetic printed beside it** (`BLOCK_L1619_B_BAND [1.25, 1.6875]` · `ACT_III_PAR_FLOOR 20` / `ACT_III_PAR_CEILING 28` / `ACT_III_EXEC_BAND` computed · `ACT_III_REGISTERED_TAIL_EXEC 30.455319` · `ACT_III_CEILING_RESERVATION_MARGIN` **computed** from its own act's endpoints) — no number retyped from memory, and **`ACT_IV_*` is ABSENT from `policy.ts` today** (this section *proposes* the constants; the lane writes them in its registration train); **no playtest datum exists**, so every felt half is a labelled hypothesis. *(Rider fold-in, disclosed)* the §:4 header version label still read **V1.6** while the change log had run to **V1.7/V1.8** — **GD-014c's named cosmetic residue** — now bumped to **V1.9** with a dated one-line note, and the header's status/governing-doc pointer lines gain **GD-015 (ADR-design-0011) and GD-016 (ADR-design-0012)** because a pointer set that stops at §7.10.10 mis-states what the file now binds: **label and pointers only, no law text touched**. *(Not touched)* the locked core loop (no AGENTS §2 triad — band/opener/relief law, not the phase loop), every registered row, every band value, every weight, every gate list, every sidecar cell, every level byte, all of `src/**` / `scripts/**` / `tests/**`, **`docs/game-design.md`** (no act-theme or pacing row moves — §8's pointer row already names Act IV's family, and the star law needs no new row), `docs/architecture*.md`, and ADR-design-0005/-0006/-0007/-0008/-0009/-0010/-0011 bodies (**0005 and 0008 are riders** here: quoted and extended, never edited). Full record: `docs/decisions/design-0012-act-iv-band-opener-and-act-seam-relief.md`. | Agent 1 (GD-016) |
