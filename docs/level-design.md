# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.6**
> Date: 2026-10-15
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; mechanic schedule per GATE D / ADR-0009)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11), ADR-0002, ADR-0004, **ADR-0008 rules 1–7** (entry-only solidity; clause 8 withdrawn), **ADR-0009** (checkerboard invariant; GATE D mechanics-forward), **ADR-design-0001** (dip law on the execution axis `D_exec`), ADR-architecture-0002 (metric #7 canonicality; gate (iii) ordered reader)

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
- **(iii) `refused-then-entered`** — the crossed door tile appears in `refusedThenEnteredTiles` (**≥ 1**). (l008: `(3,1)` — the very tile that refused the greedy line.)

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

**Rationale (unchanged):** when a mechanic is new, the player's budget is spent on *understanding*; execution difficulty stacked on comprehension load reads as unfairness. This is the L1–L3 lesson applied recursively.

## 7. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.3 | **GATE C (human decision): Option B / ADR-0008 adopted.** Parity-dependent entry replaces the union property (§0 rewritten); OQ-1 marked RESOLVED; L1–L10 ladder rebuilt so Aha #1 is produced by M0 itself (§2–§3); `goal` hard-validated as non-wall in both phases and portal no-chaining stated (§1); embedded-state rule added to fail conditions (§4); block intents updated (§5). Prior history: `docs/iteration-log.md`. | Agent 1 / Human at GATE C |
| 2026-10-14 | V0.4 | **GATE D (human decision D3 — mechanics forward; ADR-0009).** Checkerboard invariant replaces the withdrawn parity corollary (§0 rewritten; OQ-1 re-resolved by D3, not by ADR-0008 clause 8). L1–L10 ladder rebuilt: L3 = permanent refusal, L4–L5 = phantom walk (Option B's real gift), **L6–L10 = M1+M3 latch unit with Aha #1 at L8** (§2–§3). §1: doors L6-paired / switches CORE + **invert-per-ON-switch composition pinned** + one-switch-per-door authoring rule (RV-002 M-5); portals gain the **architecture-ruling landing semantics** (entry legal ⇒ teleport unconditional; solid landing = clause-3 embedded state) and the **opposite-colour law**; §1 example replaced (old one self-contradictory — `par: 6` vs its own 4-move trace + decorative wall; RV-002 M-1). Block intents (§5) and dip placements (§6: L6, L11) updated; `R = 0` teaching span now L1–L15 (§4). **ADR-0008 rules 1–7 unchanged.** | Agent 1 / Human at GATE D |
| 2026-10-15 | V0.5 | **Aligned with LV-006 shipped + solver-proven reality, and with the gate (iv) adjudication** (Orchestrator ruling, `docs/ai-native-pipeline.md` §8.5). §1: stale portal figures corrected — same-colour rejection is landed and machine-enforced (0/400 legal; "validator rule to be added" note removed). §2 intro: ladder synced — **no mechanical Aha before L6** (hook = cadence; retention = hypothesis d′), M1+M3 as one teaching unit L6–L10 with Aha #1 at L8, portals L11+ as the first dual-phase-satisfiable block; 50-level endgame unchanged. §2 L9 **re-worded**: the "switch timing" lesson is unconstructible pre-L11 (F2/F3) and is replaced by the shipped, solver-proven lesson — two doors + two switches, the second switch behind the first door (ordered plan; `l009.json` par 8, rte 2). §2 L6: block-opening dip on the natural path; `switchRequired = false` recorded as a deliberate concession — below-OFFERED debut (l004 OFFERED / l005 FORCED precedent), exempt from the `switchRequired` obligation, **never scored as FORCED**. §3: Aha #1 requirements re-stated as named gates — (i)(ii)(iii) pre-L11 (measured PASS on l008), (iv) `dualPhaseTiles ≥ 1` activates **L11+ only** (unsatisfiable pre-L11 by law, ADR-0009 decision 1); construction bullets (one-door-one-switch funnel; L8 par ≤ 8) kept as spec, programmatic enforcement = LV-007 (RV-004 n-14). §5: L9 / L11 block intents synced. §6: dip rule reconciled with measured `M` 1→3 / par 6→4; the `D`-drop clause labelled a design target until LV-007 exposes `B`/`T`/`R`. | Agent 1 (GD-007) |
| 2026-10-15 | V0.6 | **GD-008 ruling 1 — §6 rewritten on measurement (ADR-design-0001).** LV-007B closed the "`D` not yet computable" gap and falsified the "2–3 points below peak on `D`" clause in one move (L5→L6 seam measured **+8.53**; −2…−3 proven **unreachable by construction** at `w = 1,3,4,2,5`). The dip law moves to the **execution axis** `D_exec = D − w5·M` (= `L + 3·B` inside the §4 acceptance region): seam law (debut `D_exec` strictly below the previous block's `D_exec` peak; budget form `ΔD < w5·ΔM`), sawtooth on `D_exec`, construction floor and rejection teeth unchanged; the "2–3" margin **withdrawn unfitted** (measured anchor −1.47), the felt-half valley assigned to playtest as a labelled hypothesis (PA handoff), and the falsifiable L11 prediction pre-registered (`D_exec(L11) < 13.64`, par ≤ 4). Recomputed `D_exec` curve published from §5.2's pinned rows — no weight changed, no number invented. | Agent 1 (GD-008) |
