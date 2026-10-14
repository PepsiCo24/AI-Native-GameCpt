# Game Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.5**
> Date: 2026-10-14
> Status: **LOCKED for prototype** (changes require Product Lead + Game Designer double confirmation)

---

## 1. One-line pitch

A grid puzzle where **the world flips between Light and Shadow every time you move**, and each phase has a different map. You do not switch worlds — your movement does.

中文：
> 每走一步，世界就在白昼与夜晚之间翻转。两个相位是不同的地图。你不能按“切换”键，因为切换就藏在你的每一步里。

> **Rules truth (ADR-0008 rules 1–7, corrected by ADR-0009 — GATE D, human-approved):** a phase wall blocks entry **only while its own phase is active**, and the flip may leave you standing inside a wall — legal, safe, never crushed or moved. **Proven law — the checkerboard invariant (ADR-0009):** the phase in which a tile can be entered is fixed by the tile itself, so plain M0 walls are permanent obstacles or permanent decoration, never timing gates. Real route decisions come from **latch state (M1 doors + M3 switches, taught as one unit from L6)** and from **opposite-colour portals (M2, from L11)** — that is where the Ahas live. See §3.1, §5 and `docs/level-design.md` §0.

## 2. Why this is different

The player's real question is never "where can I go now?" It is:

> **"如果我现在走这一步，下一步世界会变成什么样？"**

This converts a trivial pathfinding task into a **planning-under-transformation** task, using only one input. The innovation is in the *decision structure*, not in the controls — a familiar grid entry point with an unfamiliar consequence model.

## 3. Core rule (LOCKED — core innovation)

```
Phase A = Light / 白昼
Phase B = Shadow / 夜晚

START: Phase A

Player makes a legal move
        ↓
World state resolves in the CURRENT phase's map
        ↓
Phase A -> Phase B  (or  B -> A)
        ↓
Map structure changes (walls / doors / portals swap)
        ↓
Player observes the new world and plans the next move
```

- The phase flip happens **after every legal move**.
- Phase is a property of world state, not of player charge/energy.
- **There is no standalone phase-switch button.** This is the protected core innovation.
- After the flip, the player may be standing on a tile that is solid in the new phase. **That is legal** — the player is never crushed, pushed, or relocated (ADR-0008).
- Rule changes must be recorded as: `Original Hypothesis → Problem → Change → Evidence → Result`.

### 3.1 Illegal move & resolution order (LOCKED — since V0.4 per ADR-0008 rules 1–7; unchanged by V0.5 / ADR-0009)

**Resolution order:** legality is judged **at entry, against the CURRENT phase only** → the move resolves → the phase flips (A↔B) → the new phase's map becomes active.

**The locked illegal-move rule (Option B, human-approved at GATE C):** a move is **ILLEGAL** iff
- the destination is out of bounds, **or**
- the destination tile is solid **in the current phase** (a current-phase wall, or a door closed in the current phase).

There is **no post-flip standing check**. An illegal move is refused **entirely: no movement and NO phase flip.** The world state does not change; the player stays put and the board shows blocked-move feedback. (Refusal semantics unchanged from V0.2.)

**Standing inside a wall is legal.** If the flip makes the player's tile solid in the new phase, the player simply stands inside the wall — **never crushed, never pushed, never randomly moved.** A player standing on a solid tile moves normally: each outward step is judged by the same entry rule (destination non-solid in the then-current phase). You can step out of a wall into the open; you cannot step from one solid tile into another tile that is solid now.

**Doors share the wall semantics:** entry is judged by current-phase solidity only; a flip never retroactively ejects an occupant. **Portals** trigger only on the entering step — no chaining, and standing on a portal never retriggers it.

> **REJECTED alternative (V0.1):** "incoming walls are suppressed on the player's tile." Still rejected. Option B is **not** suppression: the flipped-in wall stays fully real — it blocks entry while its phase is active. The rule simply never re-judges the tile the player already occupies. One rule path is preserved: legality at entry, against the current phase, and nowhere else.

**Goal evaluation (unchanged outcome, validation hardened):** the goal is checked at the end of a fully-resolved legal move (post-flip): **standing on the goal tile then wins the level, regardless of phase.** The goal tile must additionally be a non-wall in **both** phases — enforced by level validation (`docs/level-design.md` §1), so the goal is enterable on both parities and a win never happens from inside a wall. A phase-gated goal would still need its own schema field and its own ADR.

**Proven limit — the checkerboard invariant (ADR-0009; supersedes the withdrawn parity corollary of ADR-0008 clause 8):** every legal move flips the phase and refusals consume no move, so the phase in which a tile can be *entered* is fixed by the tile's checkerboard colour — a detour adds 2 moves, never 1. An M0 wall is therefore either a **permanent obstacle** (its solid phase matches the only phase it can ever be entered in) or **permanent decoration** (passable whenever reached). "Refused first, entered later" cannot be built from M0 alone; route-changing decisions are authored with **latch state (M1+M3)** and **opposite-colour portals (M2)** — see §5, §8 and `docs/level-design.md` §0, §2.

**Worked example (the rule in action).** Coordinates are `[x, y]` tuples — **x = column, y = row**, 0-indexed from the top-left (the level-schema convention, `docs/level-design.md` §1):

```
Phase A (current)            Phase B (after the flip)
  0 1 2                        0 1 2
0 . . .                      0 . . .
1 P . .          flip →      1 P # .      # = Phase-B wall at [1,1]
2 . . G                      2 . . G
```

Player at `[0,1]` taps RIGHT toward `[1,1]`. The destination is empty in Phase A — the only phase that judges entry — so the move is **legal**. The player lands on `[1,1]`; the world flips; a Phase-B wall materializes on the player's tile, and the player now **stands inside the wall**: safe, unmoved. The next move may exit to any adjacent tile that is non-solid in Phase B (e.g. LEFT back to `[0,1]`, or DOWN toward the goal if `[1,2]` is clear in B) — but never into another B-solid tile. Under the superseded V0.2 rule this same tap was refused; the current rule lets the route through.

## 4. Core loop

```
Launch
  ↓
Enter level (no lobby in prototype)
  ↓
Observe current Phase + board
  ↓
Move (tap adjacent / swipe)
  ↓
Phase flips automatically
  ↓
Board structure changes
  ↓
Re-plan
  ↓
Reach Goal
  ↓
Level complete
  ↓
Next level
```

Deliberately excluded from this project: skills, equipment, items, resources, character progression, daily check-in, shop, ads, social systems. The core competitive advantage is the **Puzzle Core Loop** alone.

## 5. Mechanics library

Each mechanic is "a different expression of one rule", not a new rule. That keeps teaching cost near-zero while multiplying level variety.

| ID | Mechanic | Phase A | Phase B | First introduced |
|---|---|---|---|---|
| **M0** | Phase Wall | A-walls solid; B-walls passable (echo) | B-walls solid; A-walls passable (echo) | L1 |
| **M1** | Phase Door (Red/Blue) | Red door open, Blue closed | Red closed, Blue open | **L6 — only ever paired with M3** (ADR-0009) |
| **M3** | Phase Switch (**CORE**) | Switch tile only triggers in one phase | Trigger in the other phase | **L6 — paired with M1** (ADR-0009) |
| **M2** | Phase Portal | Portal pair 1 active | Portal pair 2 active | **L11 — opposite-colour pairs only** (ADR-0009) |
| **M4** | Composite | any combination above | any combination above | L16+ |

> **M0 note — what phase walls are (ADR-0008 rules 1–7), and are not (ADR-0009):** phase solidity blocks **entry** only; a move may end with the player standing inside a wall of the new phase (never crushed / pushed / moved), and stepping out uses the same entry rule. But under the **checkerboard invariant** the entry phase of any tile is fixed at authoring time, so an M0 wall is authored as **permanent geometry** (it refuses every approach, forever) or it is **decoration** (passable whenever reached) — never a timing gate. M0's real teaching gift under Option B is the **phantom walk** (L4–L5): step onto a passable echo → the flip solidifies it under you → walk out. Other-phase walls are rendered as the low-emphasis "wall echo" = "passable NOW, solid after the flip" (ADR-0007, semantics per ADR-0008).

**M3 (Phase Switch) is CORE (promoted at GATE D, ADR-0009).** Doors without switches are measured static — their openness is a function of the phase alone. The **latch** (*the switch I stepped on keeps the door changed after I walk away*) is the first mechanic that produces real, memory-driven decisions (74/200 in the GATE D scan). **M1 therefore never ships alone: door + switch is one teaching unit (L6–L10).** Multi-switch composition is pinned in `docs/level-design.md` §1 (invert-per-ON-switch; at most one switch per door before L36).

**M2 portal authoring law (ADR-0009):** a portal pair must connect tiles of **opposite checkerboard colour** (`x1+y1` and `x2+y2` of different parity). A teleport changes position without consuming a move, and only opposite-colour ends break the position→phase function — same-colour pairs are measured inert (0/200) and are rejected at validation (`docs/level-design.md` §1).

Mechanic introduction always pairs with a **temporary difficulty dip** so cognitive load has room to breathe (see §8).

## 6. Interaction model (one primary input only)

- **Primary:** tap an adjacent tile to move there (works identically on desktop mouse and mobile touch).
- **Secondary (same verb):** swipe up/down/left/right for the same 4-way move.
- Both map to one logical action: `MOVE(direction)`. **One interaction model only** — no simultaneous schemes, no gesture combos.
- Provide `Undo` and `Restart` only (quality-of-life, not mechanics).

## 7. World wrapping (visual layer only)

Two worlds, one board logic.

- **Phase A — Light / 白昼:** warm, soft, calm. Ivory white, faint gold, sky blue. Morning light.
- **Phase B — Shadow / 夜晚:** deep blue, violet, moonlight, dream-like. Still calm, never horror.
- Protagonist: **Echo Spirit / 光灵** — a small, simple light spirit. No complex animation system. It exists to (1) focus the eye, (2) carry world flavor, (3) give movement feedback, (4) strengthen the cover art.

**Readability rule:** the two worlds must feel clearly different, **but grid cells, obstacles and paths must remain extremely readable.** Every visual effect that reduces board legibility is deleted (priority: Fun > Readable > Expandable > Pretty).

## 8. 50-level rhythm

Mechanic schedule per **GATE D / ADR-0009 (mechanics forward; core rule unchanged)** — real decisions arrive in the first block:

| Range | Goal | Mechanics |
|---|---|---|
| **L1–L2** | Understand movement with almost no text: tap → move → flip; cause ⇒ effect | M0 (no walls) |
| **L3** | The first "no": a current-phase wall refuses — **permanently**; route around | M0 |
| **L4–L5** | The **phantom walk**: enter an echo → it solidifies under you → walk out | M0 |
| **L6–L10** | **M1+M3 as one unit** — latch decisions; **Aha #1 (latch) at L8**; block dips at L6 | M0+M1+M3 |
| **L11–L15** | **M2 portals** (opposite-colour law) — parity truly breaks; **Aha #2**; block dips at L11 | +M2 |
| **L16–L25** | Latch fluency: chained switches, timed switches, 2-step lookahead | M0+M1+M3 |
| **L26–L35** | Portals integrated: routes re-priced by latch state and approach side | M0+M1+M2+M3 |
| **L36–L45** | Synthesis: 3–5 step lookahead, deceptive geometry, rare multi-switch (XOR) doors | all |
| **L46–L49** | High-density composite challenge, longest pars | all |
| **L50** | **Final Exam** — no new mechanics, recombine only what was taught | all |

The curve is intentionally **non-monotonic**: every new-mechanic block starts with a small dip. Difficulty must never feel like a mechanical staircase.

## 9. Teaching plan (Show, don't tell)

- **L1–L3:** no walls, or a single clearly-relevant wall. The player learns `tap → move → world flips` purely from watching; L3's refusal teaches "a wall of the *current* phase says no" — and that this wall will say no **forever** (ADR-0009: M0 walls are permanent geometry, never timing gates). ≤ 1 short hint line total.
- **L4–L5:** the **phantom walk** — Option B's real gift. The player steps onto a hollow echo (passable now), the flip solidifies it *under* them (safe, never crushed), and they walk out. L5 forces it: the only approach to the goal is through an echo. Taught explicitly — and never claimed to be route dynamism.
- **Aha engineering — Aha #1 is the latch (L6–L8), produced by M1+M3** (ADR-0009; it replaces the withdrawn parity-gate Aha, which the checkerboard invariant proves unconstructible):
  ```
  player walks the obvious line toward the goal
    → the door on the line is closed in the approach phase: REFUSED
      (no movement, no flip)
    → a switch tile sits visibly off the line; stepping on it
      (in its active phase) inverts the door — and the door STAYS
      inverted after the player walks away (the latch)
    → the player walks back; the door that said "no" now answers "yes"
    → goal reached
  ```
  The sentence the player owns: **"我踩过的东西，改变了我脚下的世界。"** Detailed construction requirements: `docs/level-design.md` §3.
- **Aha #2 (L11–L13) — the opposite-colour portal:** a tile that every walking approach reaches on the wrong phase is entered *through* a portal: **"同一个格子，因为我从哪边来而应答不同。"** This is the moment parity genuinely breaks (ADR-0009 decision 5).
- The player should *realize it themselves*, never be shown a "you discovered the mechanic!" popup.

## 10. Level data (data-driven, no hard-coded level scenes)

```json
{
  "id": 1,
  "width": 5,
  "height": 5,
  "startPhase": "A",
  "player": [0, 0],
  "goal": [4, 4],
  "phaseAWalls": [],
  "phaseBWalls": [],
  "doors": [],
  "switches": [],
  "portals": []
}
```

- All levels are data, never scene code.
- Schema validation is mandatory. Invalid JSON from the generator is **rejected**, never auto-guess-repaired into the official level set.

## 11. Difficulty model (calibrated, never hard-frozen)

Reference internal metric (not an industry standard):

```
D = w1·L  +  w2·B  +  w3·T  +  w4·R  +  w5·M
```

- `L` shortest solution length
- `B` average effective branching factor
- `T` required lookahead depth
- `R` dead-end / unrecoverable-mistake ratio
- `M` number of simultaneously enabled mechanics

Weights are **not** set once and forgotten. They are re-calibrated against real playtest data (see `docs/level-difficulty.md`).

## 12. Design principles & prohibitions

Priority: **Fun > Readable > Expandable > Pretty.**

- If a VFX hurts board legibility → delete it.
- If a new mechanic needs a long tutorial → redesign it.
- If a feature doesn't deepen the core puzzle → don't build it.
- If AI generates an interesting-looking level the Solver can't verify → discard it.
- If the 5-level prototype isn't fun → do **not** hide the problem behind 45 more levels.

## 13. Assumptions & risks (to test in Stage 2/3)

| # | Assumption | Risk if wrong | Test |
|---|---|---|---|
| A1 | "Flip on every move" is understandable within 30s | Player feels punished/random | Understand Time in Stage 3 |
| A2 | **Latch state (switch → door) and opposite-colour portals create planning depth, not chaos** (replaces the falsified "two-phase walls create depth" — disproven for M0 by the checkerboard invariant, ADR-0009) | Feels like a memory test | Mistake Rate + Retry Rate |
| A3 | 50 levels can be generated & solver-verified automatically | Manual bottleneck | Solver accept-rate in Stage 4 |
| A4 | Readability holds across both worlds on mobile | Board unreadable on small screens | Mobile test + screenshot review |
| A5 | The M0-only opening (L1–L5: literacy, refusal, phantom walk) retains players to L6 **without a mechanical Aha** | Slow open; early churn before the first real decision at L6 | Stage 2: L1–L5 completion + "wants L6" rate (ADR-0009 hypothesis d′) |

## 14. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial design lock from competition research report; core rule and 50-level rhythm defined | Agent 1 (proposed) / Orchestrator (confirmed) |
| 2026-10-14 | V0.2 | Lock illegal-move rule (supersedes wall suppression); add level design doc | Agent 1 / Orchestrator |
| 2026-10-14 | V0.3 | RV-001 reconciliation: win condition made unambiguous (standing on goal post-resolution wins, any phase); M0 union-property note (§1, §5); Aha chain wording made ADR-0006-accurate; ADR-0007 wall echo; level grid cap 3–7 moved to `docs/level-design.md` citing ui-ux R-L2 | Agent 1 |
| 2026-10-14 | V0.4 | **GATE C (human decision): core rule → Option B (ADR-0008).** Phase solidity blocks entry only; the post-flip standing check is removed; standing inside a flipped-in wall is legal (never crushed / pushed / moved); union property removed (§1, §5); Aha chain re-based on M0 parity routing (§8, §9); goal must be non-wall in both phases. Partially supersedes ADR-0006; revises ADR-0007 echo semantics. **Requires Stage 2 playtest verification + full Solver re-verification of the level set** | Agent 1 / Human at GATE C |
| 2026-10-14 | V0.5 | **GATE D (human decision, D3 — mechanics forward; ADR-0009).** Checkerboard invariant adopted as design law; ADR-0008 clause 8's parity-routing claim withdrawn (M0, and M1 without switches, are measured static). **M3 promoted OPTIONAL → CORE**; M1+M3 paired teaching unit from L6; M2 portals from L11 under the opposite-colour law. Aha #1 re-defined as the **latch** ("我踩过的东西改变了我脚下的世界"), Aha #2 as the **opposite-colour portal**; phantom walk kept as M0's honest L4–L5 lesson. §1 rules truth, §3.1 (invariant + `[x, y]` = column/row convention), §5, §8, §9 rewritten; §13 A2 replaced, A5 added. **ADR-0008 rules 1–7 unchanged** | Agent 1 / Human at GATE D |