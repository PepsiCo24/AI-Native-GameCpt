# Game Design — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 1 — Game Designer**
> Version: **V0.9**
> Date: 2026-10-17
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

**M4 composition law (L20, GD-007 / ADR-design-0004) — one rule, a new verb, no new mechanic.** The mechanics library's fifth rung is a **composition**, not a mechanic: the **sealed landing** uses M2 as an *ordering* device — a portal lands the player into a pocket whose only exit is a door, so the shortest plan must execute **two ordered presses** (`land → press → leave → press`). `ΔM(L20) = 0`, so no dip fires and the L16+ rung ladder is untouched. The board that proves it, and its five gates, live in `docs/level-design.md` §6.2. The rule below the library is unchanged: **one move ⇒ one phase flip**, no manual switch.

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
| **L16–L25** | Latch fluency: chained switches, timed switches, 2-step lookahead — delivered at **L20** by the **sealed landing** (portal → pocket → door, forced ordered two-press chain; **Aha #3**, ADR-design-0004) | M0+M1+M3 (+M2 as the ordering device at L20) |
| **L26–L35** | Portals integrated: routes re-priced by latch state and approach side | M0+M1+M2+M3 |
| **L36–L45** | Synthesis: 3–5 step lookahead, deceptive geometry, rare multi-switch (XOR) doors | all |
| **L46–L49** | High-density composite challenge, longest pars | all |
| **L50** | **Final Exam** — no new mechanics, recombine only what was taught | all |

The curve is intentionally **non-monotonic**: every new-mechanic block starts with a small dip. Difficulty must never feel like a mechanical staircase. **The dip lives on the execution axis `D_exec = D − w5·M`** (level-design.md §6, ADR-design-0001): raw `D` steps **up** at a debut by the comprehension tax `w5·ΔM` — measured **+8.53** at L5→L6 — and that step is admitted openly, not defined away; what dips is what the player's hands must do (`D_exec` −1.47 at L5→L6).

> **Pointer row — the 100-level act architecture (GD-009, ADR-design-0005).** The table above is the **measured** mechanics schedule for the shipped spine (**L1–L20**, whose rungs are proven level-by-level); it is not extended by adding rungs, because the census closed the seal device at par 18 and the sealed landing's class is open at ≥ 9 pockets while par is bounded by the board (coverage + no-padding laws). From L21 the dataset is planned as **five acts of 20**, each act a **mechanism family × a bounded par/`D_exec` band** — Act II portal orchestration, Act III both-pair objects (the XOR-door allowance moves off the L36–L45 row), Act IV phase-maze (gauntlet geometry allowed as *flavour only* — it cannot escalate, GD-007), Act V synthesis. In that architecture **L50's "Final Exam" role becomes the Act III `Midterm` gate and the Final Exam moves to L100** (no new mechanics either way). Authority and the full law — acts table, derived bands, the `act-peak` clause, lattice stages, per-batch proof obligations and the P10 sampling policy — live in `docs/level-design.md` §7; the record is `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`. Rows L26–L50 above keep their *intent* as mechanism families, not as rungs.

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
- **Aha #3 (L20) — the sealed landing (ordered landing):** the last mechanic-verb the ladder teaches, and a **composition** of shipped mechanics, not a new one (ADR-design-0004). The portal does not shorten the maze — it hands the player a **new starting point**: they land inside a pocket whose only exit is a door, so the plan must be executed in a **forced order** (`land → press → leave → press`). The sentence the player owns: **"传送门没有抄近路，它给我换了一个起点。"** Taught by showing (portal and the pocket door visible from the start; zero text); construction, gates and difficulty obligations: `docs/level-design.md` §6.2.
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

- **The axis split (ADR-design-0001):** `D = D_exec + D_learn`, where `D_exec = w1·L + w2·B + w3·T + w4·R` (execution) and `D_learn = w5·M` (comprehension). The teaching-dip law binds on `D_exec`, never on raw `D` — law and measured record: `docs/level-design.md` §6. Measured anchor (LV-007B, provisional weights `1, 3, 4, 2, 5`): L5→L6 seam = **+8.53 on `D`** (comprehension tax, admitted) and **−1.47 on `D_exec`** (the dip, delivered). Weights are re-calibrated by playtest regression only — never re-tuned to make a target number come out (AGENTS.md §7).

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
| A3 | 50 levels can be generated & solver-verified automatically (now **100**, act-banded — `docs/level-design.md` §7, ADR-design-0005) | Manual bottleneck | Solver accept-rate in Stage 4 |
| A4 | Readability holds across both worlds on mobile | Board unreadable on small screens | Mobile test + screenshot review |
| A5 | The M0-only opening (L1–L5: literacy, refusal, phantom walk) retains players to L6 **without a mechanical Aha** | Slow open; early churn before the first real decision at L6 | Stage 2: L1–L5 completion + "wants L6" rate (ADR-0009 hypothesis d′) |
| A6 | A **post-win** star rating drives replay ("do it again, better") **without reading as punishment** (GD-OQ2) | 1★ reads as failure; star-chase pauses flow | Stage 2/3: replay rate, star distribution, best−par median, 1★-vs-quit correlation, time-to-next-level vs a no-star arm (§14.2; thresholds frozen before the cohort) |

## 14. Open questions ledger (design-owned)

Design rulings on open questions raised in other lanes' files. One row per question; a question is **open** (waiting on named evidence) or **retired** (answered, with grounds). Retired rows stay as history — they are never deleted, and re-opening one requires the named evidence, not taste (AGENTS.md §7).

| # | Source | Question | Status | Ruling |
|---|---|---|---|---|
| **GD-OQ1** | `docs/ui-ux.md` §12 OQ1 / §5.3 (M-5b) | Should `par` display in the HUD (`moves 4 / par 6`)? | **RETIRED 2026-10-15 (GD-010) — REFUSED** | §14.1 |
| **GD-OQ2** | **USER U-001 order (2)** (2026-10-17, `docs/project-status.md` item 106); touched GD-OQ1's evidence-only re-opener | "步数没有限制" — should move depth be enforced: **soft star thresholds** or a **hard move cap**? | **RULED 2026-10-17 (GD-008) — STARS ADOPTED, HARD CAP REFUSED** | §14.2 |

### 14.1 GD-OQ1 — par in the HUD: REFUSED (2026-10-15, GD-010)

**Ruling.** The ui-ux.md V0.3 default — **plain move count only, no par anywhere in the HUD or the win dialog** — is signed as the *design* ruling, ending the "pending Game Designer sign-off" state. `par` stays in the level schema as a Solver/difficulty field (it is load-bearing: the `aha-par-cap` / `gate-portal-par-cap` gates and the seam law read it); it is **not a player-facing number** in the prototype. This changes no rule, no schema, no shipped screen; the outcome lands in `docs/ui-ux.md` via UA's own next round (that file is not edited here).

**Grounds — locked doctrine only:**

1. **Show, don't tell (§9) — the board is the teacher.** In the teaching span the only sanctioned teaching channels are the board and refusal feedback — the refusal IS the tutorial (`docs/level-design.md` §2 L3). A par readout is a *telling* channel: it asserts "a shorter route exists" before the player has the literacy to act on that fact. On L8 the Aha is engineered so the player *realizes it themselves* — never a "you discovered it" popup (§9) — and a visible `moves 9 / par 6` during that search leaks exactly the meta-information the board was built to withhold until discovery.
2. **The dip law's psychology (`docs/level-design.md` §6 rationale).** Debut levels are deliberately par ≤ 4, single-concept, below-OFFERED so the player's whole budget goes to comprehension: execution difficulty stacked on comprehension load reads as unfairness. A visible par adds a standing *evaluation* channel on top of comprehension load — the player tapping around to learn the latch reads `moves 7 / par 4` as failure. Par is **never a fail condition** (`docs/level-design.md` §1), but a HUD number the player can exceed is a fail condition by position; the honest framings are fail condition (forbidden) or decoration (noise the attention budget has no rank for). Refuse the position, keep the rule intact.
3. **No-punishment doctrine (§12; `docs/level-design.md` §4).** No death, no timer, no move limit; Restart is one tap, penalty-free, framed as experimentation — *every refusal is information*. An over-par counter is a soft timer inside the player's head: the exact punishment texture the fail-condition law excludes.
4. **No-new-screens / YAGNI (`docs/ui-ux.md` §0 non-negotiable 5; AGENTS.md §10).** Par-in-HUD is the first cell of a ratings system (perfect-clear chase → stars → progression), all out of prototype scope. The "play one more" hook is already carried by shipped channels: instant one-tap Restart, unlimited Undo, fast cadence on small par ≤ 6 boards (the L1–L5 hook, `docs/level-design.md` §2), and the win dialog's existing move count + Replay.
5. **The comprehension ladder (`docs/level-design.md` §2).** The ladder spends L1–L10 building one reading skill per level; during L1–L15 the par number answers a question the ladder has not yet taught the player to ask.

**What this ruling is not:** not a schema change (`par` stays; never a fail condition); not a `docs/ui-ux.md` edit (UA owns that file); not a removal of the win dialog's move count (shipped, stays).

**Re-opener (evidence-only, pre-specified):** Stage 2/3 playtest data showing players seek an efficiency target — e.g. win-dialog move-count comparisons measurably driving Replay sessions, or testers spontaneously asking "was that good?" at rates the Playtest Analyst's protocol scores — may re-open this question for the **post-teaching span (L16+)** or for the **win dialog**, with thresholds frozen before the cohort runs (T6 discipline). Playtest data outranks this ruling; taste — mine included — does not.

### 14.2 GD-OQ2 — move depth: STARS ADOPTED (soft), HARD MOVE CAP REFUSED (2026-10-17, GD-008)

**Ruling.** Move depth becomes a **rating, never a wall**. The player's run is rated **after the level is
already won**: **3★** at `moves ≤ par + k1`, **2★** at `moves ≤ par + k2`, **1★ for any finish**; the
best run is kept locally. The **hard move cap is REFUSED** in writing, and the hybrid (a cap as an
optional challenge mode later) is **parked** with a named trigger. Full record, evidence and the
`Original Hypothesis → Problem → Change → Evidence → Result` chain:
`docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`.

**Why not the cap (the short form, all of it from shipped law).** A cap creates states from which the
run cannot continue, i.e. `R > 0` — while `docs/level-design.md` §4 forbids exactly those states
("no death, no crush, no timer, **no move limit**"; the only real failure is player confusion) and the
measured theorem `T ≡ R ≡ 0` on 20/20 is what makes the published curve collapse to
`D_exec = par + 3·B` (`docs/level-difficulty.md` §2b/§5.2). So a cap **reprices every published
number** and disables the no-dead-state gate, in exchange for a fail texture that no measured data
requests (U-001 reports missing *depth*, not a wanted *cap*). It would also be a core-loop change:
AGENTS §2 triad (Game Designer + Playtest Analyst + Orchestrator) + an ADR. None of that is spent here.

**Thresholds — derived from two already-published quanta, no new math.**
`k1 = 2·⌈par / 10⌉`, `k2 = 2·k1`:
the **2** is ADR-0009's checkerboard law ("a detour adds 2 moves, never 1"), so every threshold is a
count a player can actually land on and a slack below 2 is no slack at all; the **10** is P3's published
teaching-span par ceiling (`docs/level-design.md` §6.1.1) — the game's own par unit, so allowance grows
one step per par unit of board. Over the shipped ladder (par 4…20, measured 20/20):

| par | 4–10 | 11–20 | 21–30 | 31–40 |
|---|---|---|---|---|
| 3★ ≤ | par+2 | par+4 | par+6 | par+8 |
| 2★ ≤ | par+4 | par+8 | par+12 | par+16 |

1★ is always reachable. The pair (2, 10) is **falsifiable**: playtest star distribution replaces it by
regression without touching the core. *(Dispatch said "pars 3..20" — corrected by measurement: no
shipped level measures par 3; the game's measured par floor is 4, ADR-design-0003 P1.)*

**HUD presentation.** *In play, the HUD does not change* — it stays the existing `moves N` field, with
no par and no stars: GD-OQ1 (§14.1) refused a live evaluation channel because a number the player can
exceed **during** play is a fail condition by position, and the debut levels deliberately spend their
whole budget on comprehension. The star render appears **only on the existing win dialog / end panel**,
as one added field beside the frozen `moves {M}` shape (`docs/ui-ux.md` N-2):
`L8 cleared · moves 6 · ★★★`. Three slots, filled = earned; **no par number, no threshold explanation,
no new screen** (ui-ux §0 non-negotiable 5; AGENTS §10). Static glyphs — no idle animation, no VFX rank
consumed (R-C8), reduced-motion safe by construction. The **pixel spec is UI/Art's** (handoff UA-003);
this ruling fixes semantics, thresholds and where the field may appear.

**Persistence row (YAGNI: no accounts, no server, no sync).** One versioned localStorage key family —
`ps.echoGrid/stars@1` → `{"schema":1,"best":{"8":{"moves":6}}}` — written **only on win**, monotone (a
worse run never downgrades a stored best), tolerant (absent / corrupt / unknown level id read as empty,
never throws), and cleared only through the browser's own storage surface. A future second consumer
takes its **own version suffix**, never an in-place schema bump. It lives in the **game/HUD layer only**:
`src/core/**` never reads it, so determinism, Undo/Restart and the Solver are untouched by
construction. **Unlock stays completion-based, never star-based** — a star gate at 100 levels would be a
progression wall (§12, AGENTS §10).

**Why this is the "play one more" hook and not punishment.** The chase is *"do it again, better"*, offered
after the win, with unlimited Undo and instant Restart already in place (§6; level-design §4): the
player can always finish at 1★ and still be told they finished. The cap would invert that sentence into
*"you failed"* — priority order (AGENTS §1) prices Fun and Comprehension above Depth, and depth is
available for free here (an efficiency target), with no new mechanic.

**What Playtest must measure (protocol owed; thresholds frozen before the cohort runs — T6).**
1. **Replay rate** — Replay presses per win, and second-run rate per level (the hook's direct measure).
2. **Star distribution** — first-win 3★/2★/1★ shares and the best-run distribution; the median
   `(best − par)` is the **empirical k1/k2 calibration** (if median is ~+1 the thresholds are tighter
   than players can see; if ~+6 they are decoration).
3. **Star-chase behaviour** — re-wins within the same session and time-to-next-level, against a
   no-star control arm, to test that the panel *adds* pull instead of pausing flow.
4. **Punishment counter-check** — M5 restarts / M6 undos, and **1★-vs-quit correlation**: if 1★
   measurably increases quit rate, the 1★ presentation (not the mechanic) is redesigned — never the
   fail-condition law.
5. **Comprehension guard** — L1–L5 understand time / first-win time must not regress: the star field
   ships post-win only, so any regression there is a presentation bug, not a mechanic trade.

**What this ruling is not:** not a schema change (`par` stays; never a fail condition); not a HUD live
readout (GD-OQ1 stands); not a new screen, currency, progression or leaderboard (AGENTS §10); not an
edit to `docs/ui-ux.md` (UA's file) or to the renderer (Gameplay Engineer's).

## 15. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial design lock from competition research report; core rule and 50-level rhythm defined | Agent 1 (proposed) / Orchestrator (confirmed) |
| 2026-10-14 | V0.2 | Lock illegal-move rule (supersedes wall suppression); add level design doc | Agent 1 / Orchestrator |
| 2026-10-14 | V0.3 | RV-001 reconciliation: win condition made unambiguous (standing on goal post-resolution wins, any phase); M0 union-property note (§1, §5); Aha chain wording made ADR-0006-accurate; ADR-0007 wall echo; level grid cap 3–7 moved to `docs/level-design.md` citing ui-ux R-L2 | Agent 1 |
| 2026-10-14 | V0.4 | **GATE C (human decision): core rule → Option B (ADR-0008).** Phase solidity blocks entry only; the post-flip standing check is removed; standing inside a flipped-in wall is legal (never crushed / pushed / moved); union property removed (§1, §5); Aha chain re-based on M0 parity routing (§8, §9); goal must be non-wall in both phases. Partially supersedes ADR-0006; revises ADR-0007 echo semantics. **Requires Stage 2 playtest verification + full Solver re-verification of the level set** | Agent 1 / Human at GATE C |
| 2026-10-14 | V0.5 | **GATE D (human decision, D3 — mechanics forward; ADR-0009).** Checkerboard invariant adopted as design law; ADR-0008 clause 8's parity-routing claim withdrawn (M0, and M1 without switches, are measured static). **M3 promoted OPTIONAL → CORE**; M1+M3 paired teaching unit from L6; M2 portals from L11 under the opposite-colour law. Aha #1 re-defined as the **latch** ("我踩过的东西改变了我脚下的世界"), Aha #2 as the **opposite-colour portal**; phantom walk kept as M0's honest L4–L5 lesson. §1 rules truth, §3.1 (invariant + `[x, y]` = column/row convention), §5, §8, §9 rewritten; §13 A2 replaced, A5 added. **ADR-0008 rules 1–7 unchanged** | Agent 1 / Human at GATE D |
| 2026-10-15 | V0.6 | **GD-008 — dip law re-axed (ADR-design-0001).** §8/§11: the block-opening dip moves to the execution axis `D_exec = D − w5·M`; raw `D` steps **up** at debuts by the comprehension tax `w5·ΔM` (measured +8.53 at L5→L6), admitted openly — what dips is execution (−1.47). The falsified "2–3 points on `D`" clause is withdrawn **unfitted**: no weight re-tuned to reach a target number. Core rule untouched. | Agent 1 (GD-008) |
| 2026-10-15 | V0.7 | **GD-010 — design-owned OQ ledger opened (new §14); ui-ux.md OQ1 retired: par-in-HUD REFUSED.** HUD stays plain move count only; `par` remains a Solver/difficulty schema field, never a player-facing number in the prototype — argued from locked doctrine alone (§9 show-don't-tell, board-is-the-teacher, refusal-as-tutorial, §12 no-punishment, no-new-screens/YAGNI) plus the comprehension-ladder cost, with an evidence-only re-opener (Stage 2/3 playtest, T6-frozen thresholds; L16+/win-dialog scope). Change log renumbered §14 → §15. Also recorded this round (in `docs/level-design.md` V0.8 + ADR-design-0002): the L11 seam-law OUTCOME, the LV-007C landed gate-(iii) reader, and the L11+ block ruling (promotion trigger tested, did not fire). **No core-rule, mechanic, schedule or difficulty-law change.** | Agent 1 (GD-010) |
| 2026-10-16 | V0.8 | **GD-007 — the L20 mechanism is RULED: the SEALED LANDING (Aha #3); the GAUNTLET is REJECTED on census measurement.** The L16+ goal-gated full seal is censused to a ceiling of `par 18` on `7×6` at every arity (arity 4: 17 160 tuples enumerated completely) and `7×7` reaches `par 22` only by re-stamping L19's exact seal — so the fifth rung needs a new mechanism, and `block-l1619-tail-ceiling` forbids padding the number. Of the two named candidates, **ADOPT (B) / REJECT (A)**: the census identity `par = min_i(d(start→s_i)+1+d(s_i→goal))` makes a gauntlet's extra ring doors terms in a **minimum** (more reading, no decision; measured saturation 16→18→18), whereas the sealed landing forces the **mandatory second press** the census proved the seal cannot. §5 gains the **M4 composition law**; §8's L16–L25 row names L20 as the delivery of the promised 2-step lookahead; §9 gains **Aha #3** — *"传送门没有抄近路，它给我换了一个起点。"* `ΔM(L20) = 0` (new **verb**, shipped mechanics ⇒ no dip, rung law stands). Full spec + gates + obligations: `docs/level-design.md` §6.2; record: `docs/decisions/design-0004-l20-mechanism-sealed-landing.md`. No core-rule, weight or shipped-board change. | Agent 1 (GD-007) |
| 2026-10-17 | V0.9 | **GD-008 + GD-009 (one ticket; both ordered by USER U-001, `docs/project-status.md` item 106) — move depth ruled, and the 100-level architecture published.** **GD-OQ2 (§14.2):** move depth = **post-win STAR RATING** (`k1 = 2·⌈par/10⌉`, `k2 = 2·k1`, 1★ any finish, best run persisted in `ps.echoGrid/stars@1`, win-only writes, game/HUD layer only, unlock stays completion-based); the **HARD MOVE CAP is REFUSED** — it creates `R > 0` states against §4 and the measured `T ≡ R ≡ 0`/`D_exec = par + 3·B` theorem, reprices every published row, and needs the AGENTS §2 triad + ADR for zero measured demand; hybrid parked. GD-OQ1's live-HUD refusal **stands** (the star is post-win only), and the ruling operates inside GD-OQ1's own pre-registered re-opener scope (win dialog). Threshold factors are already-published quanta (ADR-0009's detour-2; P3's par-unit 10); the constant pair is falsifiable by playtest regression. Dispatch's "pars 3..20" corrected by measurement (floor is **4**). §8 gains a **pointer row** to `docs/level-design.md` §7 — five acts × 20 (Act II portal orchestration; Act III both-pair objects + the XOR allowance moved off the L36–L45 row; Act IV phase-maze with gauntlet geometry as **flavour only**; Act V synthesis), **L50's Final Exam re-mapped to the Act III `Midterm`, Final Exam at L100** — with the act-scale tail law (`act-peak`), generator lattice stages, per-batch proof obligations and the P10 sampling policy all owned by the level-design section. §13 gains **A6** (the star hypothesis + its measurement). **No core-rule, mechanic, weight, gate or shipped-board change**; full record: `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md`. | Agent 1 (GD-008 / GD-009) |