# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.9**
> Date: 2026-10-16
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; mechanic schedule per GATE D / ADR-0009)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11), ADR-0002, ADR-0004, **ADR-0008 rules 1–7** (entry-only solidity; clause 8 withdrawn), **ADR-0009** (checkerboard invariant; GATE D mechanics-forward), **ADR-design-0001** (dip law on the execution axis `D_exec`), **ADR-design-0003** (GD-011: the L12–L15 block law — par obligation, two-beat dip, latch grade), ADR-architecture-0002 (metric #7 canonicality; gate (iii) ordered reader)

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
| `switches` | `Switch[]` | ✓ (may be `[]`) | **M3 (CORE — promoted at GATE D, ADR-0009)**, introduced **L6, paired with M1**. `{ "id": "s1", "tile": [x, y], "activePhase": "A" \| "B", "targets": ["d1", …] }`. Stepping on the tile while `activePhase` is current toggles `switchesOn[id]`; leaving the tile, or entering it in the other phase, does nothing (the **latch**: the change persists). **Multi-switch composition (pinned — RV-002 M-5; matches `src/core/rules` `doorIsOpen`):** a door's openness is its colour base **inverted once per ON switch that lists it in `targets`**; an even number of ON switches targeting the same door restores the colour base. **Authoring rule: each door is targeted by at most one switch in L6–L35** — multi-switch doors are XOR puzzles reserved for L36+ and flagged in review (validator warning recommended, handoff to Level AI + Solver). |
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
- **L16–L25 — Latch fluency.** Multi-door boards, chained and timed switches, 2-step lookahead; M0 geometry now read as permanent terrain the latch re-prices.
- **L26–L35 — Portals integrated.** Routes re-priced by latch state *and* approach side; portals as phase-shuffling edges inside larger plans.
- **L36–L45 — Synthesis.** All mechanics live; 3–5 step lookahead; deceptive geometry carried by visibility (wall echo, ADR-0007); the rare, review-flagged multi-switch (XOR) door may appear here (§1).
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
| `par` (construction floor) | **YES — as law** | Weightless. It is a schema field the level gate already enforces (`par == shortestSolution`), and §6 / `policy.ts:599` already carry par as law (`PORTAL_DEBUT_PAR_CAP = 4`). A par bound cannot be "fitted to the weights". |
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
   block's lesson to the previous block's. `policy.ts:246`'s own comment already says so: "a post-debut
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
| **G4** | `DOCUMENTED_LESSONS` must carry `switchRequired: "exempt"` — **not `null`** — because these boards *do* carry a latch lesson (`null` means "no latch lesson at all", `policy.ts:131`); the evidence string must name the measured `allOffShortest − par = 2`. | integration instruction, §6.1.6 |

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
conjunction collapses — which is exactly what `policy.ts:246`'s comment warns about. The reusable unit
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

Numbers approved for encoding, in the L11-seam style LV-008 used (`policy.ts:599/613`). **GD does not
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

## 7. Change log

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
