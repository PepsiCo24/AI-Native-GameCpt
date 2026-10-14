# Game Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.3**
> Date: 2026-10-14
> Status: **LOCKED for prototype** (changes require Product Lead + Game Designer double confirmation)

---

## 1. One-line pitch

A grid puzzle where **the world flips between Light and Shadow every time you move**, and each phase has a different map. You do not switch worlds — your movement does.

中文：
> 每走一步，世界就在白昼与夜晚之间翻转。两个相位是不同的地图。你不能按“切换”键，因为切换就藏在你的每一步里。

> **Rules truth (ADR-0006):** a wall tile is never enterable in *either* phase — the flip changes which walls the world shows as solid, not which tiles you may enter. Routes truly open only via doors / portals / switches (M1–M3). See §5 and `docs/level-design.md` §0.

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
- Rule changes must be recorded as: `Original Hypothesis → Problem → Change → Evidence → Result`.

### 3.1 Illegal move & resolution order (LOCKED — V0.2)

**Resolution order (unchanged from V0.1):** a move resolves in the CURRENT phase's map → the phase flips (A↔B) → the new phase's map becomes active.

**The locked illegal-move rule:** a move is **ILLEGAL** if either
- the destination tile is solid in the current phase, **or**
- after the move resolves and the phase flips, the tile the player would be standing on is a wall in the new phase.

An illegal move is refused **entirely: no movement and NO phase flip.** The world state does not change; the player stays put and the board shows blocked-move feedback.

> **REJECTED alternative (V0.1):** "the player is never covered — incoming walls are suppressed on the player's tile." Rejected because it creates **two rule paths** for the same object and weakens puzzle determinism (player model and Solver can disagree about board state). One rule, one path: *if the resolution would put you on a wall, the move does not happen.*

**Goal evaluation timing (unchanged from V0.1):** the goal is checked after a legal move fully resolves (post-flip): **standing on the goal tile after a fully-resolved legal move wins the level, regardless of phase.** A phase-gated goal would need its own schema field and its own ADR; it is not part of this design.

**Worked example (the V0.2 rule in action):**

```
Phase A (current)            Phase B (after the flip)
  0 1 2                        0 1 2
0 . . .                      0 . . .
1 P . .          flip →      1 . # .      # = Phase-B wall at [1,1]
2 . . G                      2 . . G
```

Player at `[0,1]` taps RIGHT toward `[1,1]`. The destination is empty in Phase A, but resolving the move would flip the world and leave the player standing on a Phase-B wall at `[1,1]`. **The move is refused: no movement, no flip — the player stays at `[0,1]` and the phase stays A.** Every landing tile must be clear in both the departure phase and the arrival phase.

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
| **M0** | Phase Wall | A-Walls solid, B-Walls gone | A-Walls gone, B-Walls solid | L1 |
| **M1** | Phase Door (Red/Blue) | Red door open, Blue closed | Red closed, Blue open | L21 |
| **M2** | Phase Portal | Portal pair 1 active | Portal pair 2 active | L36 |
| **M3** | Phase Switch (optional) | Switch tile only triggers in one phase | Trigger in the other phase | L26 (extension) |
| **M4** | Composite | any combination above | any combination above | L26+ |

> **M0 note — union property (ADR-0006):** a tile that is a wall in EITHER phase is never enterable under either parity, so M0 phase walls are **permanent obstacles with phase-skinned visibility** — never gates that open. Genuine route dynamism comes from M1 (doors), M2 (portals), M3 (switches). Other-phase walls are still rendered as a low-emphasis "wall echo" (ADR-0007). Authoring consequences: `docs/level-design.md` §0.

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
| **L4–L6** | First feel that "my move changes the next board" | M0 |
| **L7–L10** | First complete **Aha Moment** | M0 |
| **L11–L20** | Deepen phase walls: path planning, false routes, 2-step lookahead | M0 |
| **L21–L25** | Introduce **Phase Door**; difficulty intentionally dips | M1 |
| **L26–L35** | Combine Phase Wall + Phase Door | M0 + M1 |
| **L36–L40** | Introduce **Phase Portal** | M2 |
| **L41–L45** | Cross-mechanic, require 3–5 step lookahead | M0+M1+M2 |
| **L46–L49** | High-density composite challenge | M0+M1+M2 |
| **L50** | **Final Exam** — no new mechanics, recombine only what was taught | M0+M1+M2 |

The curve is intentionally **non-monotonic**: every new-mechanic block starts with a small dip. Difficulty must never feel like a mechanical staircase.

## 9. Teaching plan (Show, don't tell)

- **L1–L3:** no walls, or a single clearly-relevant wall. The player learns `tap → move → world flips` purely from watching. ≤ 1 short hint line total.
- **L4–L6:** introduce a wall that only exists in one phase, so the flip visibly creates/removes a blockage.
- **Aha engineering for L3–L5:** build the first "oh, it can do *that*" moment as a small chain:
  ```
  player acts
    → world changes (the visible wall set swaps)
    → the greedy line is refused; the side corridor the player already saw
      becomes the plan — walls never "open" (for M0 the change is
      perceptual, ADR-0006; doors/portals open literally, M1/M2)
    → next move flips again
    → the detour delivers a clean, legal entry to the goal
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