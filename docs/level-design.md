# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.3**
> Date: 2026-10-14
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004; the whole set must be re-verified under ADR-0008)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11), ADR-0002, ADR-0004, **ADR-0008** (partially supersedes ADR-0006)

---

## 0. Rules truth box (read before authoring any level)

Under the locked rule (game-design.md §3.1, **ADR-0008** — Option B, human-approved at GATE C, 2026-10-14):

- A move is legal iff the destination is in bounds and non-solid **in the current phase at entry** (a current-phase wall or a door closed in the current phase blocks; everything else passes). Illegal move ⇒ no movement, **no flip**, state unchanged.
- Every legal move flips the phase. There is no waiting and no manual switch — only movement flips the world. The flip may leave the player **standing inside a wall of the new phase**: legal and safe — never crushed, never pushed, never moved. The player steps out on any later move whose destination is non-solid in the then-current phase.
- **Parity-dependent entry (the load-bearing corollary):** a phase wall blocks entry only while its own phase is active, so every M0 wall is enterable on exactly **one parity of the move count**. Plain phase walls ARE gates — opened and closed by the player's own step count. Author them as **timing puzzles**, not static maze geometry. Route dynamism starts at **L1 with M0 alone**; doors (M1), portals (M2), switches (M3) layer authored structure on top.
- The phase after `n` moves is fully determined (`startPhase` flipped `n` times).
- Win check: standing on the goal at the end of a fully-resolved legal move, regardless of phase. **The goal must be a non-wall in BOTH phases** (validator-enforced, §1).

**OQ-1 — RESOLVED by ADR-0008 / GATE C (2026-10-14, human decision).** Original worry: under ADR-0006's union property, M0-only content (L1–L20) was mechanically a static maze and the flip changed no legal move until M1. GATE C chose Option B (entry-only solidity), so parity now genuinely opens and closes M0 routes from L1 and the first Aha (L3–L5) is produced by M0 itself (§2–§3). Remaining obligations: (a) **Stage 2 playtest** must confirm the new dynamism reads as *planning*, not *chaos* (assumption A2, `docs/game-design.md` §13) and that embedded states read as safe; (b) **full Solver re-verification** of the level set under the new rule before Stage 4 generation.

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
| `doors` | `Door[]` | ✓ (may be `[]`) | **M1**, introduced L21. `{ "id": "d1", "color": "red" \| "blue", "tiles": [[x, y], …] }`. Red doors are open in A / closed in B; blue doors the inverse (game-design.md §5). |
| `switches` | `Switch[]` | ✓ (may be `[]`) | **M3 (OPTIONAL)** — ships only if Stage 2–4 playtest proves value (game-design.md §5). `{ "id": "s1", "tile": [x, y], "activePhase": "A" \| "B", "targets": ["d1", …] }`. Stepping on the tile while `activePhase` is current toggles the target doors. |
| `portals` | `Portal[]` | ✓ (may be `[]`) | **M2**, introduced L36. `{ "id": "p1", "pair": [[x1, y1], [x2, y2]], "activePhase": "A" \| "B" }`. Entering either end while `activePhase` is current teleports to the other end **once — no chaining, and standing on a portal never retriggers it** (ADR-0008 rule 6); the landing tile must pass the same entry check as a normal move (non-solid in the current phase). |
| `par` | int ≥ 1 | ✓ | Reference move count, set from the Solver's `shortestSolution` (+0 for teaching levels, small slack later). Displayed as the "perfect clear" target; **never** a fail condition. |

Validation invariants (schema + validator, owned by Level AI + Solver): all coordinates in bounds; no duplicate tiles within a list; `player` and `goal` non-wall in **both** phases — the goal rule is hard-enforced (ADR-0008): a goal walled in either phase is rejected; solvability and difficulty metrics attached by the Solver before a candidate is accepted. **The whole level set must be re-verified under ADR-0008 before Stage 4.**

Example (L5-style teaching level):

```json
{
  "id": 5,
  "width": 5,
  "height": 3,
  "startPhase": "A",
  "player": [0, 1],
  "goal": [4, 1],
  "phaseAWalls": [[2, 0]],
  "phaseBWalls": [[3, 1]],
  "doors": [],
  "switches": [],
  "portals": [],
  "par": 6
}
```

Option-B illustration: `phaseBWalls: [[3,1]]` sits on the straight row to the goal. It is enterable only while Phase A is current, so the **move count** decides whether the direct line is open — walking R,R,R,R crosses it on move 3 (a Phase-A step), leaves the player legally embedded in it after the flip to B, and exits onto the goal on move 4. Parity-gated entry in miniature.

## 2. Teaching ladder L1–L10 (Show, don't tell)

Text budget: L1–L3 get **≤ 1 hint line total** ("Tap to move"). No popups, no "mechanic discovered" banners — the board is the teacher (game-design.md §9).

| Level | Teaches / reveals | Construction |
|---|---|---|
| **L1** | `tap → move`; the world flashes to the other phase | Empty small board, straight line to goal. The flip is harmless here — the player simply watches the world change color. |
| **L2** | "The flip happens *because I moved*" | Empty board, path of 4–5 moves; the world alternates in step with the player's own taps. Cause ⇒ effect is established. |
| **L3** | First contact with the illegal-move rule: a wall of the *current* phase blocks entry | One current-phase wall on the direct line. The tap is refused with bump feedback (no movement, no flip). **The refusal IS the tutorial.** A one-tile detour solves it. |
| **L4** | "The wall that said no is gone after I move" — parity opens walls | A tile that refuses the player in Phase A must be entered in Phase B: any side step flips the world, the solid wall becomes a passable echo (ADR-0007, semantics per ADR-0008), and the route crosses the very tile that refused earlier. |
| **L5** | **Aha #1 (engineered — see §3):** the move count is the key | Greedy straight line is refused at the final approach; a visible one-tile side step flips parity and the refusing wall itself becomes the route. Par ≤ 6. The first Aha is produced by **M0 alone** — no doors required (ADR-0008). |
| **L6** | "The world can close around me — and I walk out" | The route requires ending a move on a tile that solidifies with the flip: the player stands inside a wall, unharmed, and steps out next move to a currently-open tile (ADR-0008 rules 3–4). |
| **L7** | 2-step lookahead: "after my move flips the world, which walls exist for the *next* move?" | First board whose shortest path threads two parity traps in sequence. |
| **L8** | Experimentation is free | Open board, many routes, harmless dead pockets. Deliberately low pressure after L7. |
| **L9** | False-route literacy | A path that looks shortest but arrives at the goal line on the wrong parity, costing +2. Teaches evaluation, never punishment — dead ends cannot lock (§4). |
| **L10** | Gate check: the player owns the core verb | Medium board combining the L3–L9 patterns, M0 only. Passing L10 = the player can plan `move → parity → future board`. |

## 3. First Aha construction (L3–L5) — explicit step chain

The mandated chain (game-design.md §9), instantiated concretely for L5 — note that under ADR-0008 the "opening" is **mechanical**, not perceptual:

```
1. ACT               Player walks the obvious straight line toward the goal
                     (two legal moves; the world flips A→B→A with each step).
2. WORLD CHANGES     On the third tap the move is REFUSED: the next tile is a
                     wall in the CURRENT phase (ADR-0008 rule 1). Bump
                     feedback; no movement, no flip — the phase stays A.
3. NEW ROUTE         The refusal point sits one tile from a visible side
   APPEARS           step. Taking it flips the world — and the tile that just
                     refused the player becomes an echo: passable NOW
                     (parity-dependent entry, ADR-0008).
4. ACT AGAIN         Player takes the side step, watches the refusing wall
                     turn passable, and steps THROUGH the tile that said
                     "no" one move ago.
5. WALL OPENS —      The same wall tile is crossed on the new parity. Nothing
   LITERALLY,        appeared visually that wasn't there before — the route
   ON ONE PARITY     became LEGAL. That is the Aha: "the parity of my steps
                     decides which walls exist for me." (Under ADR-0006 this
                     beat was perceptual only; ADR-0008 makes it mechanical.
                     Doors/portals add authored gates later, M1/M2.)
6. GOAL              Player reaches the goal and owns the sentence:
                     "where — and WHEN — I step decides what the world becomes."
```

Design requirements for the Aha levels:

- The refused tile and the side-corridor entrance must both be visible from the start; the detour entrance within 2 tiles of the refusal point.
- Exactly **one** refusal trap on the greedy line (more reads as frustration, not revelation).
- **The solution must cross the refusing tile itself on the new parity.** The Aha is "the wall opened", not "I walked around" — a pure detour teaches nothing about parity.
- Par ≤ 6 for L5. No text, no popup. The success animation is the only reward signal.
- The player must *realize it themselves* — never show a "you discovered the mechanic!" banner (game-design.md §9).

## 4. Fail conditions & "restart instead of stuck"

- **There is no death, no crush, no timer, no move limit** (game-design.md §12; crush / push / relocation rejected by ADR-0006 and reaffirmed by ADR-0008 rule 3 — standing inside a wall is safe).
- The only real failure is **player confusion**. Levels are therefore constructed so that **no unrecoverable state exists**: from every reachable position, the goal stays reachable.
- **Embedded states are normal states.** A position with the player standing inside a wall (ADR-0008 rule 3) is an ordinary Solver node: its exits are the adjacent tiles non-solid in that state's phase. A reachable non-goal state with **zero legal moves** (every neighbor solid in the current phase — there is no waiting to change parity) is unrecoverable by construction and fails the reachability invariant.
- Enforcement is mechanical, not hopeful: the Solver checks reachability from all reachable states (embedded ones included); candidates with dead states are **rejected** (ADR-0004). Target `R` (dead-end ratio, game-design.md §11) = 0 for L1–L20, near-0 afterwards.
- **Restart instead of stuck:** `Restart` is instant, one tap, penalty-free; `Undo` is unlimited (game-design.md §6). Restart is framed as an experimentation tool — *every refusal is information* — never as punishment.
- A refused move must never be mistaken for input failure: distinct bump feedback + the phase visibly NOT flipping (UI dependency for the Art Director, `docs/ui-ux.md`).

## 5. Per-block design intent (50-level rhythm)

The block table itself lives in `docs/game-design.md` §8 and is deliberately **not** duplicated here. Intent per block:

- **L1–L3 — Literacy.** Movement = phase flip. The wall as the first "no".
- **L4–L6 — Revelation + Aha #1.** Parity opens and closes walls; standing inside a wall is safe; the player learns to plan across both parities (§3).
- **L7–L10 — Fluency gate.** Lookahead, false routes, confidence; ends with a skill check.
- **L11–L20 — M0 depth.** Path planning, 2-step lookahead, parity traps, embedded positions, deceptive geometry carried by visibility (wall echo, ADR-0007 + ADR-0008). **OQ-1 is RESOLVED (§0):** M0 carries genuine routing dynamism from L1 — the playtest watch shifts to A2 (`docs/game-design.md` §13): does parity planning read as *depth*, not *chaos* or a memory test?
- **L21–L25 — M1 doors.** Colored, multi-tile, **level-authored** phase gates — phase dependency the designer shapes deliberately, layered on the parity dynamism M0 already provides (no longer the *first* source of phase-dependent routing). Block opens with a dip (§6).
- **L26–L35 — M0 + M1 combination.** Reading two interacting systems. Decision point at L26: the M3 switch ships only on positive playtest evidence (game-design.md §5).
- **L36–L40 — M2 portals.** Space-folding; portals are phase-gated edges — the purest expression of "the world you move in decides where you can go". Block opens with a dip.
- **L41–L45 — Synthesis.** All mechanics live; 3–5 step lookahead; routes that re-price themselves with every move.
- **L46–L49 — Density peak.** High-interaction boards, longest pars, zero new rules.
- **L50 — Final Exam.** Recombines only what was taught; no new mechanic, no trick rules. Beating it should feel like graduation, not luck.

## 6. Difficulty dip rule (non-monotonic curve)

- **Every block that introduces a new mechanic starts with a dip:** its first level sits 2–3 points below the previous block's peak on the difficulty metric `D` (game-design.md §11), and its first 1–2 levels are short (par ≤ 4), single-mechanic, and free of false routes.
- **Rationale:** when a mechanic is new, the player's budget is spent on *understanding*; execution difficulty stacked on comprehension load reads as unfairness. This is the L1–L3 lesson applied recursively.
- Difficulty then ramps **within** the block until it exceeds the previous block's peak — a sawtooth, never a staircase (game-design.md §8).
- Dips are verified with Solver metrics (solution length, branching, lookahead) at generation time and re-calibrated against playtest data (`docs/level-difficulty.md`, ADR-0004). A new-mechanic level that solver-scores at or above the previous block's peak is **rejected or redesigned** — no exceptions.

## 7. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.3 | **GATE C (human decision): Option B / ADR-0008 adopted.** Parity-dependent entry replaces the union property (§0 rewritten); OQ-1 marked RESOLVED; L1–L10 ladder rebuilt so Aha #1 is produced by M0 itself (§2–§3); `goal` hard-validated as non-wall in both phases and portal no-chaining stated (§1); embedded-state rule added to fail conditions (§4); block intents updated (§5). Prior history: `docs/iteration-log.md`. | Agent 1 / Human at GATE C |
