# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.4**
> Date: 2026-10-14
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; mechanic schedule per GATE D / ADR-0009)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11), ADR-0002, ADR-0004, **ADR-0008 rules 1–7** (entry-only solidity; clause 8 withdrawn), **ADR-0009** (checkerboard invariant; GATE D mechanics-forward)

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
| `portals` | `Portal[]` | ✓ (may be `[]`) | **M2**, introduced **L11**. `{ "id": "p1", "pair": [[x1, y1], [x2, y2]], "activePhase": "A" \| "B" }`. Entering either end while `activePhase` is current teleports to the other end **once — no chaining, and standing on a portal never retriggers it** (ADR-0008 rule 6). **Landing semantics (per the architecture ruling, `docs/architecture.md` §6.2 — RV-002 reconciliation):** once the entering step is legal the teleport is **unconditional**; the landing tile is **not** re-validated, and if it is solid in the post-flip phase the player is simply **embedded** there (ADR-0008 rule 3) and walks out by the normal entry rule. (Replaces the V0.3 "landing tile must pass the same entry check" line, which implied a second failure path that §6.2's single-failure-point contract excludes.) **Opposite-colour law (ADR-0009):** the two ends **must** sit on opposite checkerboard colours — `x1+y1` and `x2+y2` of different parity. A teleport changes position without consuming a move; only opposite-colour ends break the position→phase function. Same-colour pairs are measured inert (0/200) and are **rejected by the validator**. Authoring caution: keep at least one neighbour of the landing tile non-solid in the post-flip phase, or the no-dead-state invariant (§4) rejects the level. |
| `par` | int ≥ 1 | ✓ | Reference move count, set from the Solver's `shortestSolution` (+0 for teaching levels, small slack later). Displayed as the "perfect clear" target; **never** a fail condition. |

Validation invariants (schema + validator, owned by Level AI + Solver): all coordinates in bounds; no duplicate tiles within a list; `player` and `goal` non-wall in **both** phases — the goal rule is hard-enforced (ADR-0008 rule 7): a goal walled in either phase is rejected; **portal ends on opposite checkerboard colours — hard rejection (ADR-0009; validator rule to be added by Level AI + Solver, SOLVER-001 handoff)**; **door targeted by more than one switch ⇒ review flag** (warning; hard rejection above the L36+ allowance is Solver-side policy); solvability and difficulty metrics attached by the Solver before a candidate is accepted. **The whole level set is verified by the Solver before Stage 4 — LLM proposals are candidates, never content, until proven (ADR-0004).**

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

Text budget: L1–L3 get **≤ 1 hint line total** ("Tap to move"); L4 onward get **none**. No popups, no "mechanic discovered" banners — the board is the teacher (game-design.md §9). Ladder per **GATE D / ADR-0009** (mechanics forward): the M0-only stretch is honest (literacy + refusal + phantom walk, **no dynamism claim**), and the first real decisions arrive at L6 with the M1+M3 latch unit.

| Level | Teaches / reveals | Construction |
|---|---|---|
| **L1** | `tap → move`; the world flashes to the other phase | Empty small board, straight line to goal. The flip is harmless here — the player simply watches the world change colour. |
| **L2** | "The flip happens *because I moved*" | Empty board, path of 4–5 moves; the world alternates in step with the player's own taps. Cause ⇒ effect is established. |
| **L3** | First contact with the illegal-move rule: a wall of the *current* phase blocks entry — **and this wall will never open** | One parity-**mismatched** phase wall on the direct line (a **permanent** obstacle, §0). The tap is refused with bump feedback (no movement, no flip). **The refusal IS the tutorial.** A one-tile detour solves it. Never author this wall as something that opens later — under the invariant it cannot. |
| **L4** | "The hollow tile is enterable — and the world can solidify around me, safely" | The offered route crosses an **echo** (a wall of the *other* phase): the player steps onto it while passable; the flip solidifies it *under* them — embedded, unharmed (ADR-0008 rule 3). An echo-free route of the same par exists, so the beat is offered, not forced (shipped `l004.json` shape). |
| **L5** | "…and I walk out." The phantom walk, **forced** | The goal's only approach is through an echo: enter it on a passable step → the flip solidifies it under the player → step out onto the goal (shipped `l005.json` shape; par = 6, BFS-verified). Par ≤ 6. This is Option B's real gift, taught on purpose — not route dynamism, and never sold as such. |
| **L6** | **M1+M3 debut (difficulty dip, §6): "what I step on changes the world — and it stays changed"** | One switch on the natural path, one door on the goal approach. Stepping on the switch (while its `activePhase` is current) inverts the door, **and the change persists after the player walks away** — the latch. Single-unit board, par ≤ 4, no false routes (§6 dip). |
| **L7** | The detour-to-switch: "I go out of my way to change the world" | Switch off the direct line; the door guards the goal approach. Walking to the switch and back costs moves but opens the door; the latch makes the round trip *worth* it. |
| **L8** | **Aha #1 — the latch (engineered, §3): "我踩过的东西改变了我脚下的世界"** | A closed door refuses the greedy approach; a visible switch inverts it and **stays** inverted; the player returns and passes the very door that refused them. The "refused first, entered later" beat ADR-0008 promised — delivered by latch state, not parity (ADR-0009). |
| **L9** | Switch timing: switches listen only in their `activePhase` | The switch tile is reachable but only triggers while its phase is current; arriving on the wrong phase does nothing. First genuine phase-planning decision of the ladder (which step do I press on?). |
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

Design requirements for the Aha #1 levels (Solver-checkable):

- Exactly **one door + one switch** on the board; both visible from the start; the switch on the greedy line or ≤ 2 tiles off it.
- The door must genuinely refuse the un-switched approach — Solver condition: **no solution exists with all `switchesOn` false**.
- The solution must pass **through the refusing door itself** after the toggle. The Aha is "the door opened", not "I walked around" — a route that bypasses the door teaches nothing about the latch.
- The toggle must be **required, not incidental** — Solver condition: every shortest solution steps on the switch while its `activePhase` is current.
- Par ≤ 8 for L8 (L6–L7 sit at par ≤ 4 under the §6 dip). No text, no popup; the success animation is the only reward signal; the player must *realize it themselves* (game-design.md §9).

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
- **L6–L10 — The latch unit (M1+M3).** Door + switch taught as one object; **Aha #1 at L8** (§3); L9 adds switch timing; L10 is the gate check. Block opens with a dip (§6).
- **L11–L15 — M2 portals.** Opposite-colour pairs only (§1); parity genuinely breaks; **Aha #2** — entry depends on approach side (§3). Block opens with a dip.
- **L16–L25 — Latch fluency.** Multi-door boards, chained and timed switches, 2-step lookahead; M0 geometry now read as permanent terrain the latch re-prices.
- **L26–L35 — Portals integrated.** Routes re-priced by latch state *and* approach side; portals as phase-shuffling edges inside larger plans.
- **L36–L45 — Synthesis.** All mechanics live; 3–5 step lookahead; deceptive geometry carried by visibility (wall echo, ADR-0007); the rare, review-flagged multi-switch (XOR) door may appear here (§1).
- **L46–L49 — Density peak.** High-interaction boards, longest pars, zero new rules.
- **L50 — Final Exam.** Recombines only what was taught; no new mechanic, no trick rules. Beating it should feel like graduation, not luck.

## 6. Difficulty dip rule (non-monotonic curve)

- **Every block that introduces a new mechanic starts with a dip:** its first level sits 2–3 points below the previous block's peak on the difficulty metric `D` (game-design.md §11), and its first 1–2 levels are short (par ≤ 4), single-mechanic, and free of false routes. Under the ADR-0009 schedule the dips land at **L6** (M1+M3 unit) and **L11** (M2).
- **Rationale:** when a mechanic is new, the player's budget is spent on *understanding*; execution difficulty stacked on comprehension load reads as unfairness. This is the L1–L3 lesson applied recursively.
- Difficulty then ramps **within** the block until it exceeds the previous block's peak — a sawtooth, never a staircase (game-design.md §8).
- Dips are verified with Solver metrics (solution length, branching, lookahead) at generation time and re-calibrated against playtest data (`docs/level-difficulty.md`, ADR-0004). A new-mechanic level that solver-scores at or above the previous block's peak is **rejected or redesigned** — no exceptions.

## 7. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.3 | **GATE C (human decision): Option B / ADR-0008 adopted.** Parity-dependent entry replaces the union property (§0 rewritten); OQ-1 marked RESOLVED; L1–L10 ladder rebuilt so Aha #1 is produced by M0 itself (§2–§3); `goal` hard-validated as non-wall in both phases and portal no-chaining stated (§1); embedded-state rule added to fail conditions (§4); block intents updated (§5). Prior history: `docs/iteration-log.md`. | Agent 1 / Human at GATE C |
| 2026-10-14 | V0.4 | **GATE D (human decision D3 — mechanics forward; ADR-0009).** Checkerboard invariant replaces the withdrawn parity corollary (§0 rewritten; OQ-1 re-resolved by D3, not by ADR-0008 clause 8). L1–L10 ladder rebuilt: L3 = permanent refusal, L4–L5 = phantom walk (Option B's real gift), **L6–L10 = M1+M3 latch unit with Aha #1 at L8** (§2–§3). §1: doors L6-paired / switches CORE + **invert-per-ON-switch composition pinned** + one-switch-per-door authoring rule (RV-002 M-5); portals gain the **architecture-ruling landing semantics** (entry legal ⇒ teleport unconditional; solid landing = clause-3 embedded state) and the **opposite-colour law**; §1 example replaced (old one self-contradictory — `par: 6` vs its own 4-move trace + decorative wall; RV-002 M-1). Block intents (§5) and dip placements (§6: L6, L11) updated; `R = 0` teaching span now L1–L15 (§4). **ADR-0008 rules 1–7 unchanged.** | Agent 1 / Human at GATE D |
