# Level Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.2**
> Date: 2026-10-14
> Status: **Draft for Stage 2 prototype** (all level content requires Solver verification per ADR-0004)
> Governing docs: `docs/game-design.md` (core rule §3, mechanics §5, rhythm §8, difficulty §11), ADR-0002, ADR-0004, ADR-0006

---

## 0. Rules truth box (read before authoring any level)

Under the locked rule (game-design.md §3.1, ADR-0006):

- A move is legal only if the destination is clear in the current phase **and** the post-flip tile is not a phase wall. Illegal move ⇒ no movement, no flip.
- **Union property (proved in ADR-0006):** a tile that is a wall in *either* phase is *never* a legal destination under either parity. Plain phase walls are permanent obstacles with phase-skinned visibility — author them as **maze geometry**, never as gates that open.
- Genuine route dynamism comes from **doors (M1)**, **portals (M2)**, **switches (M3)** — never from plain walls.
- The phase after `n` moves is fully determined (`startPhase` flipped `n` times). There is no waiting; only movement flips the world.

**Open question OQ-1 — ESCALATION to the user at GATE C:** under ADR-0006, M0-only content (L1–L20) is *mechanically a static maze* — the phase flip is cosmetically animated (wall skins swap, refusals fire, wall echoes per ADR-0007) but **changes no legal move until M1 doors arrive**. If Stage 2 playtest confirms this feels flat, the lever is the locked rule itself, which only the user may approve. Concrete alternative for that decision (one line): *walls block entry only in their solid phase and never crush the player — restoring parity-dependent routing.* Any such change requires user sign-off + playtest data + an ADR + full Solver re-verification of the level set. It is **not** made here.

## 1. Level JSON schema (field by field)

All levels are data, never scene code (game-design.md §10). Schema validation is mandatory; invalid candidates are **rejected**, never auto-repaired (ADR-0004).

| Field | Type | Req | Meaning / constraints |
|---|---|---|---|
| `id` | int ≥ 1 | ✓ | Unique; equals the level's number in the 50-level progression (L`id`). |
| `width` | int 3–7 | ✓ | Board columns. Hard cap 7 per `docs/ui-ux.md` R-L2 (44 px touch-target floor at a 320 px viewport). **8×8 allowed ONLY with Orchestrator approval**, against the R-L2 conditions (batch accepts the 40 px floor, swipe promoted to primary input); 9×9+ rejected on mobile portrait. |
| `height` | int 3–7 | ✓ | Board rows. Same hard cap 7 and the same Orchestrator-approval condition for 8 rows (ui-ux.md R-L2). |
| `startPhase` | `"A"` \| `"B"` | ✓ | Phase at move 0. Teaching levels always start `"A"`. |
| `player` | `[x, y]` | ✓ | Start tile, 0-indexed from top-left. In bounds; not a wall in either phase (union property). |
| `goal` | `[x, y]` | ✓ | Goal tile. **Standing on it after a fully-resolved legal move (post-flip) wins the level, regardless of phase.** A phase-gated goal would need its own schema field + ADR; it is not part of this design. Differs from `player`; not a wall in either phase. |
| `phaseAWalls` | `[[x, y], …]` | ✓ (may be `[]`) | Tiles solid while Phase A is active. Never overlap `player` or `goal`. Overlap with `phaseBWalls` = permanently dead tile; allowed only by deliberate design and flagged in review. |
| `phaseBWalls` | `[[x, y], …]` | ✓ (may be `[]`) | Tiles solid while Phase B is active. Same constraints. |
| `doors` | `Door[]` | ✓ (may be `[]`) | **M1**, introduced L21. `{ "id": "d1", "color": "red" \| "blue", "tiles": [[x, y], …] }`. Red doors are open in A / closed in B; blue doors the inverse (game-design.md §5). |
| `switches` | `Switch[]` | ✓ (may be `[]`) | **M3 (OPTIONAL)** — ships only if Stage 2–4 playtest proves value (game-design.md §5). `{ "id": "s1", "tile": [x, y], "activePhase": "A" \| "B", "targets": ["d1", …] }`. Stepping on the tile while `activePhase` is current toggles the target doors. |
| `portals` | `Portal[]` | ✓ (may be `[]`) | **M2**, introduced L36. `{ "id": "p1", "pair": [[x1, y1], [x2, y2]], "activePhase": "A" \| "B" }`. Entering either end while `activePhase` is current teleports to the other end; the landing tile must pass the same wall checks as a normal move. |
| `par` | int ≥ 1 | ✓ | Reference move count, set from the Solver's `shortestSolution` (+0 for teaching levels, small slack later). Displayed as the "perfect clear" target; **never** a fail condition. |

Validation invariants (schema + validator, owned by Level AI + Solver): all coordinates in bounds; no duplicate tiles within a list; `player`/`goal` not on any wall; solvability and difficulty metrics attached by the Solver before a candidate is accepted.

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

## 2. Teaching ladder L1–L10 (Show, don't tell)

Text budget: L1–L3 get **≤ 1 hint line total** ("Tap to move"). No popups, no "mechanic discovered" banners — the board is the teacher (game-design.md §9).

| Level | Teaches / reveals | Construction |
|---|---|---|
| **L1** | `tap → move`; the world flashes to the other phase | Empty small board, straight line to goal. The flip is harmless here — the player simply watches the world change color. |
| **L2** | "The flip happens *because I moved*" | Empty board, path of 4–5 moves; the world alternates in step with the player's own taps. Cause ⇒ effect is established. |
| **L3** | First contact with the illegal-move rule: some tiles are walls in one world | One phase wall on the direct line. The tap is refused with bump feedback (no flip). **The refusal IS the tutorial.** |
| **L4** | Reveal: "the wall I see and the wall that stops me can live in different worlds" | A corridor where the visible (current-phase) wall set differs from the wall set that actually refuses moves; other-phase ghost visibility carries comprehension (UI dependency, §4 below). |
| **L5** | **Aha #1 (engineered — see §3):** plan in both worlds at once | Greedy straight line is refused at the final approach; a visible side corridor solves it. Par ≤ 6. |
| **L6** | Consolidation: read both phases before committing | Two alternating wall clusters; the safe path weaves between them. |
| **L7** | 2-step lookahead: "if I move there, what does the world look like after *that* move?" | First board whose shortest path threads two refusal traps in sequence. |
| **L8** | Experimentation is free | Open board, many routes, harmless dead pockets. Deliberately low pressure after L7. |
| **L9** | False-route literacy | A path that looks shortest but costs +2 detour moves. Teaches evaluation, never punishment — dead ends cannot lock (§4). |
| **L10** | Gate check: the player owns the core verb | Medium board combining the L3–L9 patterns, M0 only. Passing L10 = the player can plan `move → future board`. |

## 3. First Aha construction (L3–L5) — explicit step chain

The mandated chain (game-design.md §9), instantiated concretely for L5:

```
1. ACT               Player walks the obvious straight line toward the goal
                     (two legal moves; the world flips A→B→A with each step).
2. WORLD CHANGES     On the third tap the move is REFUSED: resolving it would
                     leave the player standing on a Phase-B wall (ADR-0006).
                     Bump feedback; no movement, no flip — the phase stays A.
3. NEW ROUTE         During the earlier flips the side corridor was rendered
   APPEARS           open and inviting; the refusal redirects the player's
                     eye to it. A perceptual reveal — zero text.
4. ACT AGAIN         Player commits to the detour; each step flips the world
                     and the player now tracks BOTH wall sets on purpose.
5. "CLOSED" ROUTE    From the far side of the detour, the final approach to
   OPENS —           the goal — refused on the greedy line — is a clean,
   PERCEPTUALLY      legal entry. Per ADR-0006 no M0 wall ever opens: the
                     wall sets are permanent; what changed is which walls are
                     visible (echo vs solid, ADR-0007) and which line the
                     player committed to. Doors/portals open literally (M1/M2).
6. GOAL              Player reaches the goal and owns the sentence:
                     "where I step decides what the world becomes."
```

Design requirements for the Aha levels:

- The refused tile and the side-corridor entrance must both be visible from the start; the detour entrance within 2 tiles of the refusal point.
- Exactly **one** refusal trap on the greedy line (more reads as frustration, not revelation).
- Par ≤ 6 for L5. No text, no popup. The success animation is the only reward signal.
- The player must *realize it themselves* — never show a "you discovered the mechanic!" banner (game-design.md §9).

## 4. Fail conditions & "restart instead of stuck"

- **There is no death, no crush, no timer, no move limit** (game-design.md §12; ADR-0006 rejects crush).
- The only real failure is **player confusion**. Levels are therefore constructed so that **no unrecoverable state exists**: from every reachable position, the goal stays reachable.
- Enforcement is mechanical, not hopeful: the Solver checks reachability from all reachable states; candidates with dead states are **rejected** (ADR-0004). Target `R` (dead-end ratio, game-design.md §11) = 0 for L1–L20, near-0 afterwards.
- **Restart instead of stuck:** `Restart` is instant, one tap, penalty-free; `Undo` is unlimited (game-design.md §6). Restart is framed as an experimentation tool — *every refusal is information* — never as punishment.
- A refused move must never be mistaken for input failure: distinct bump feedback + the phase visibly NOT flipping (UI dependency for the Art Director, `docs/ui-ux.md`).

## 5. Per-block design intent (50-level rhythm)

The block table itself lives in `docs/game-design.md` §8 and is deliberately **not** duplicated here. Intent per block:

- **L1–L3 — Literacy.** Movement = phase flip. The wall as the first "no".
- **L4–L6 — Revelation + Aha #1.** Both worlds are real; plan across them (§3).
- **L7–L10 — Fluency gate.** Lookahead, false routes, confidence; ends with a skill check.
- **L11–L20 — M0 depth.** Path planning, 2-step lookahead, deceptive geometry carried by visibility (wall echo, ADR-0007) and refusal. **Watch OQ-1:** if playtest shows these feel static, escalate per §0 (user decision at GATE C) before L21 art is finalized.
- **L21–L25 — M1 doors.** "The flip made literal": gates that visibly open/close in step with the player's moves — the first genuinely phase-dependent routes. Block opens with a dip (§6).
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
