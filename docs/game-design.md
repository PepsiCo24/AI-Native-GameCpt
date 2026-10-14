# Game Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.4**
> Date: 2026-10-14
> Status: **LOCKED for prototype** (changes require Product Lead + Game Designer double confirmation)

---

## 1. One-line pitch

A grid puzzle where **the world flips between Light and Shadow every time you move**, and each phase has a different map. You do not switch worlds — your movement does.

中文：
> 每走一步，世界就在白昼与夜晚之间翻转。两个相位是不同的地图。你不能按“切换”键，因为切换就藏在你的每一步里。

> **Rules truth (ADR-0008 — GATE C, human-approved):** a phase wall blocks entry **only while its own phase is active**. Every wall is enterable on exactly one parity of the move count, so the flip **really rewires routes from L1 onward** — the first Aha comes from M0 itself. The flip may leave you standing inside a wall: legal, safe, never crushed or moved. See §3.1, §5 and `docs/level-design.md` §0.

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

### 3.1 Illegal move & resolution order (LOCKED — V0.4, supersedes V0.2 per ADR-0008)

**Resolution order:** legality is judged **at entry, against the CURRENT phase only** → the move resolves → the phase flips (A↔B) → the new phase's map becomes active.

**The locked illegal-move rule (Option B, human-approved at GATE C):** a move is **ILLEGAL** iff
- the destination is out of bounds, **or**
- the destination tile is solid **in the current phase** (a current-phase wall, or a door closed in the current phase).

There is **no post-flip standing check**. An illegal move is refused **entirely: no movement and NO phase flip.** The world state does not change; the player stays put and the board shows blocked-move feedback. (Refusal semantics unchanged from V0.2.)

**Standing inside a wall is legal.** If the flip makes the player's tile solid in the new phase, the player simply stands inside the wall — **never crushed, never pushed, never randomly moved.** A player standing on a solid tile moves normally: each outward step is judged by the same entry rule (destination non-solid in the then-current phase). You can step out of a wall into the open; you cannot step from one solid tile into another tile that is solid now.

**Doors share the wall semantics:** entry is judged by current-phase solidity only; a flip never retroactively ejects an occupant. **Portals** trigger only on the entering step — no chaining, and standing on a portal never retriggers it.

> **REJECTED alternative (V0.1):** "incoming walls are suppressed on the player's tile." Still rejected. Option B is **not** suppression: the flipped-in wall stays fully real — it blocks entry while its phase is active. The rule simply never re-judges the tile the player already occupies. One rule path is preserved: legality at entry, against the current phase, and nowhere else.

**Goal evaluation (unchanged outcome, validation hardened):** the goal is checked at the end of a fully-resolved legal move (post-flip): **standing on the goal tile then wins the level, regardless of phase.** The goal tile must additionally be a non-wall in **both** phases — enforced by level validation (`docs/level-design.md` §1), so the goal is enterable on both parities and a win never happens from inside a wall. A phase-gated goal would still need its own schema field and its own ADR.

**Key corollary (resolves OQ-1):** a Phase-B wall is enterable exactly during Phase-A steps, and vice versa — enterability depends on the **parity of the move count**. Phase therefore rewires real routes from **L1** onward; M0 is no longer a static maze. Authoring consequences: `docs/level-design.md` §0.

**Worked example (the V0.4 rule in action):**

```
Phase A (current)            Phase B (after the flip)
  0 1 2                        0 1 2
0 . . .                      0 . . .
1 P . .          flip →      1 P # .      # = Phase-B wall at [1,1]
2 . . G                      2 . . G
```

Player at `[0,1]` taps RIGHT toward `[1,1]`. The destination is empty in Phase A — the only phase that judges entry — so the move is **legal**. The player lands on `[1,1]`; the world flips; a Phase-B wall materializes on the player's tile, and the player now **stands inside the wall**: safe, unmoved. The next move may exit to any adjacent tile that is non-solid in Phase B (e.g. LEFT back to `[0,1]`, or DOWN toward the goal if `[1,2]` is clear in B) — but never into another B-solid tile. Under the superseded V0.2 rule this same tap was refused; V0.4 lets the route through on this parity.

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
| **M1** | Phase Door (Red/Blue) | Red door open, Blue closed | Red closed, Blue open | L21 |
| **M2** | Phase Portal | Portal pair 1 active | Portal pair 2 active | L36 |
| **M3** | Phase Switch (optional) | Switch tile only triggers in one phase | Trigger in the other phase | L26 (extension) |
| **M4** | Composite | any combination above | any combination above | L26+ |

> **M0 note — parity-dependent entry (ADR-0008):** phase solidity only blocks **entry**. A B-wall tile is a legal destination during any Phase-A step and blocks only while Phase B is active, so every M0 wall is enterable on exactly **one parity of the move count** — M0 walls are real, parity-gated passages, not permanent obstacles. A move may end with the player standing inside a wall of the new phase (never crushed / pushed / moved), and the player can step out on a later move. Other-phase walls are rendered as a low-emphasis "wall echo" whose meaning is now "passable NOW, solid on the other parity" (ADR-0007, semantics revised by ADR-0008). Authoring consequences: `docs/level-design.md` §0.

**M3 (Phase Switch) is OPTIONAL** and only ships if Stage 2–4 playtest proves it adds decisions without adding explanation. Default plan: deliver M0 → M1 → M2 and keep M3 as a reserve mechanism.

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

| Range | Goal | Primary mechanic |
|---|---|---|
| **L1–L3** | Understand movement with almost no text | M0 (walls only) |
| **L4–L6** | First **Aha**: my move count opens and closes walls (parity) | M0 |
| **L7–L10** | Turn the Aha into fluency: parity planning, false routes | M0 |
| **L11–L20** | Deepen phase walls: path planning, 2-step lookahead, embedded positions | M0 |
| **L21–L25** | Introduce **Phase Door**; difficulty intentionally dips | M1 |
| **L26–L35** | Combine Phase Wall + Phase Door | M0 + M1 |
| **L36–L40** | Introduce **Phase Portal** | M2 |
| **L41–L45** | Cross-mechanic, require 3–5 step lookahead | M0+M1+M2 |
| **L46–L49** | High-density composite challenge | M0+M1+M2 |
| **L50** | **Final Exam** — no new mechanics, recombine only what was taught | M0+M1+M2 |

The curve is intentionally **non-monotonic**: every new-mechanic block starts with a small dip. Difficulty must never feel like a mechanical staircase.

## 9. Teaching plan (Show, don't tell)

- **L1–L3:** no walls, or a single clearly-relevant wall. The player learns `tap → move → world flips` purely from watching. ≤ 1 short hint line total.
- **L4–L6:** introduce a wall that only exists in one phase, so the flip **literally opens and closes that tile to entry** — not just visually.
- **Aha engineering for L3–L5:** build the first "oh, it can do *that*" moment as a small chain — now produced by **M0 itself** (ADR-0008), no doors required:
  ```
  player acts
    → world changes (the active wall set swaps)
    → the greedy line is refused; one visible side step flips the parity,
      and the tile that just said "no" is now enterable — M0 walls open
      and close with the move count (ADR-0008)
    → next move flips again
    → the player steps THROUGH the former wall; the route delivers a clean,
      legal entry to the goal
    → goal reached
  ```
  The player should *realize it themselves*, never be shown a "you discovered the mechanic!" popup.

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
| A2 | Two-phase walls create planning depth, not chaos | Feels like a memory test | Mistake Rate + Retry Rate |
| A3 | 50 levels can be generated & solver-verified automatically | Manual bottleneck | Solver accept-rate in Stage 4 |
| A4 | Readability holds across both worlds on mobile | Board unreadable on small screens | Mobile test + screenshot review |

## 14. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial design lock from competition research report; core rule and 50-level rhythm defined | Agent 1 (proposed) / Orchestrator (confirmed) |
| 2026-10-14 | V0.2 | Lock illegal-move rule (supersedes wall suppression); add level design doc | Agent 1 / Orchestrator |
| 2026-10-14 | V0.3 | RV-001 reconciliation: win condition made unambiguous (standing on goal post-resolution wins, any phase); M0 union-property note (§1, §5); Aha chain wording made ADR-0006-accurate; ADR-0007 wall echo; level grid cap 3–7 moved to `docs/level-design.md` citing ui-ux R-L2 | Agent 1 |
| 2026-10-14 | V0.4 | **GATE C (human decision): core rule → Option B (ADR-0008).** Phase solidity blocks entry only; the post-flip standing check is removed; standing inside a flipped-in wall is legal (never crushed / pushed / moved); union property removed (§1, §5); Aha chain re-based on M0 parity routing (§8, §9); goal must be non-wall in both phases. Partially supersedes ADR-0006; revises ADR-0007 echo semantics. **Requires Stage 2 playtest verification + full Solver re-verification of the level set** | Agent 1 / Human at GATE C |