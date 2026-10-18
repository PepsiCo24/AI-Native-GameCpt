# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V1.4** *(V1.2 was GD-010 — §7.3.1–§7.3.4 + §7.8, the sawtooth ruling on Act II batch 2; V1.3 is GD-011 — §7.9 the band-endpoint law, §7.8 item 7 the C-path standing, §7.3.1 instance 3; V1.4 is GD-012 — §7.10 the Act III band + the L41–L45 opener rule + Act III par/star totality + §7.3.1 instance 4)*
> Date: 2026-10-18
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; mechanic schedule per GATE D / ADR-0009; **100-level act architecture per GD-009 / ADR-design-0005, §7**; **act-close peak + pre-published relief labels per GD-010 / ADR-design-0006, §7.3.1–§7.3.2**; **band endpoints are derived-exact and inclusive per GD-011 / ADR-design-0007, §7.9**; **Act III's band, opener rule, par/star totality and seam relief per GD-012 / ADR-design-0008, §7.10**)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11, move-depth ruling §14.2), ADR-0002, ADR-0004, **ADR-0008 rules 1–7** (entry-only solidity; clause 8 withdrawn), **ADR-0009** (checkerboard invariant; GATE D mechanics-forward), **ADR-design-0001** (dip law on the execution axis `D_exec`), **ADR-design-0003** (GD-011: the L12–L15 block law — par obligation, two-beat dip, latch grade), **ADR-design-0004** (L20 sealed landing), **ADR-design-0005** (GD-008 stars-not-cap + GD-009 act architecture), **ADR-design-0006** (GD-010 act-close peak clause + pre-published relief-label form), **ADR-design-0007** (GD-011 band-endpoint law + C-path standing), ADR-architecture-0002 (metric #7 canonicality; gate (iii) ordered reader)

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
- **L16–L25 — Latch fluency.** Multi-door boards, chained and timed switches, 2-step lookahead; M0 geometry now read as permanent terrain the latch re-prices. The promised **2-step lookahead** is delivered at **L20** by the **sealed landing** — portal → pocket → door, forcing the ordered two-press chain (§6.2, GD-007).
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
> `par` band is **`20–28` inclusive**. Bands are **inclusive at both ends** and are **derived from
> the formula, never read back from rounded text**. §7.9 states the law and its blast radius; it
> binds every gate, census filter and relief label in this file.

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

Two instances, both named with the constants the law files may carry:

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

#### 7.10.4 The pre-published `act-open` relief label (L40→L41) — §7.3.1 **instance 4**

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
| 2026-10-18 | V1.4 | **GD-012 — new §7.10: the Act III band (derived-exact), the L41–L45 opener rule, Act III par/star totality, and the §7.3.1 instance-4 relief PRE-PUBLISHED. Ruling only — no code, no constant, no board.** *(The trigger)* Act II closes at **L40** (its final batch `l036`–`l040` is shelf-proven at LV-017 and is being registered by in-flight **R-006a**); its tail measures **`28.455319`** against the Act II ceiling **`29.0625`** — headroom **`0.607181`** — so **Act II's band is nearly topped out by design and Act III needs its own derivation**. *(§7.10.1 · RULING A)* Act III is **`L41–L60`** (plan of record, §7.2; the dispatch's "L41–L6x" resolves to L60) and its `D_exec` band is derived from **its own** `par` band: `PAR_FLOOR 20`, `PAR_CEILING 28`, measured `B` band `[1.2500, 1.6875]` ⇒ **`[23.7500, 33.0625]`**, *printed* `[23.75, 33.06]` (both endpoints dyadic ⇒ bit-exact; inclusive per §7.9; **derive-from-formula, never compare against rounded text**). The band **translates Act II's by exactly `+4.0` on both ends**; its floor sits **`4.705319` below** Act II's closing rung, so the previous act's tail is strictly inside — the §7.3 interior-freedom shape. **§7.3.2's `act-close` carry window for Act III is `L51–L60`** (its last two batches). *(§7.10.2 · RULING B)* the opener ladder is **derived, not searched**: **`[20, 22, 24, 26, 26]`** via six clauses — **O1** P2-exact 5-member window (`20,22,24,26,28` = LV-017's derivation on Act III's constants); **O2** the **ceiling is reserved** (the derived top `par 28` is withheld and the 5th rung repeats the truncated top at its within-par maximum); **O3** the reservation is **derived, not taste** — opener rungs top out at `26 + 3·1.6875 = 31.0625` while any `par 28` tail rung bottoms at `28 + 3·1.2500 = 31.7500` ⇒ **`31.7500 > 31.0625`** (margin `0.6875`), so `act-close` is satisfiable **by construction** regardless of the opener's realised `B` (an opener at `par 28` measuring `33.0625` = the band ceiling would make the clause fail by construction); **O4** anti-mirror against every registered Act II multiset and every other Act III batch (coinciding pars printed, never hidden); **O5** empty pool ⇒ **ABSENT, never substituted** (descending fill; shortfall **STOP-AND-ROUTES to GD**, never a silent extension to the ceiling); **O6** final rung within-par **maximum**, earlier rungs minimum. **The opener carries NO `act-peak`/`act-close` branch** — §7.3.2's carrier is `L51–L60`, and §7.3's `act-peak` binds the act's measured maximum read per batch. *(§7.10.3 · RULING C)* Act III admits **`par 20–28` inclusive** — the ladder **does** extend beyond Act II's `par 24` (`26`, `28`), but **28 ≤ 30**, so every Act III par falls inside ADR-design-0005's **existing** rows (`11–20 → k1 4 / k2 8`; `21–30 → k1 6 / k2 12`, `k1 = 2·⌈par/10⌉`, `k2 = 2·k1`, `1★ = any finish`): the star law is **total over Act III by derivation**, **no new row is ruled and `docs/game-design.md` §14.2 needs no edit** (Act IV `24–32` / Act V `28–36` are likewise covered by the published `31–40 → +8/+16` row and below). Recorded corrigendum: a dispatch restatement gave "`k1 = ceil(2·par/10)`, `k2 par 21–30 = 6`"; the record (`star-era-asks-readiness.md` §2) gives `par 21–30 → k1 = 6`, `k2 = 12` — the `6` is **`k1`**, and the pair is `2·⌈par/10⌉` — corrected against the artifact, not propagated. *(§7.10.4 · RULING E)* the **L40→L41 `act-open` relief is PRE-PUBLISHED** as §7.3.1 **instance 4** with the published bound **`ΔD_exec ∈ [−4.705319, −1.392819]`** (union over O5's admissible first rungs: L41 at `par 20` ⇒ `[−4.705319, −3.392819]`; at `par 22` ⇒ `[−2.705319, −1.392819]`), decomposition `ΔD_exec = Δpar + 3·ΔB` with the `par` term (`−4` at the floor) shown beside it; exact value is a **fill-in before the bytes, never after**; constants proposed `ACT_III_B1_OPEN_RELIEF_LEVEL_ID = 41` + `_DELTA_RANGE`; the relief is **largely an instrument artifact** of §7.10.2's derived ladder, discharges no clause, and its felt half is a **labelled Playtest hypothesis** (§7.3.3, `NOT TESTABLE, n = 0`). *(§7.10.5 · RULING D)* mechanics stance = **YAGNI: zero new mechanics, zero new board features, zero architect-impact** — `ΔM = 0` so §6's dip law does not bind Act III and no rung may be scored as a debut; two opposite-colour portal pairs are **composition** over §1's portal array, the **XOR multi-switch door** is already pinned semantics (§1, RV-002 M-5; §7.2 moved the allowance here) needing no schema/core/validator change; **prefer the proven `CX = 1` frames** (`7×6`@`CX=1` 40/27/27/40 disjoint 7; **`7×7`@`CX=1` 46/31/31/46 disjoint 8) and the proven **4-pocket/5-door/5-press** class — **F-L31-1's kill separated the FRAME, not the device class** (`CX = 2` empty, `CX = 1` non-empty); a **5-pocket** device stays refused and uncensused; anything beyond is **architect-impact with its own ADR**. *(Booked, not solved)* the structural **chain-envelope** (100-rung walk cost) stays BOOKED to the Architect at the Act IV juncture; §7.10 is **seam-walk-neutral** (no clause reads a cross-act walk; every batch proves on its own bytes). *(Not touched)* the locked core loop, every level byte, every registered row, every weight, every gate, every Act I/II band value, every sidecar cell, all of `src/**` and `scripts/**`; ADR-design-0005 / -0006 / -0007 bodies are **riders, not edited**; the §7.2 band-notation note gains Act III's derived-exact form. Full record: `docs/decisions/design-0008-act-iii-band-opener-and-star-totality.md`. | Agent 1 (GD-012) |
