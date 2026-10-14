# UI / UX Spec — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 5 — UI / UX / Art Director**
> Version: **V0.4**
> Date: 2026-10-14
> Status: **LOCKED for prototype** (visual token values may be re-tuned only with a screenshot-review record)
> Governs: `src/ui/**`, `src/game/renderer/**`, `src/game/scenes/**` (visual layer only), `docs/assets/**`
> Read-only inputs: `docs/game-design.md` (§3, §6, §7, §9, §12), `docs/level-design.md` (§0–§4), `docs/architecture.md` (§9, §10, §11), `docs/decisions/0006`, `docs/decisions/0007`, **GATE C human decision 2026-10-14 (Option B)** — recorded in **`docs/decisions/0008-phase-solidity-entry-only.md`** (Accepted); see also `docs/assets/codex-generation-brief.md` §6. OQ5 below is closed by that ADR.

---

## V0.3 → V0.4 change note (GATE C · core rule Option B · task UA-0003 · 2026-10-14)

**The GATE C human decision (2026-10-14) replaced the ADR-0006 illegal-move regime with Option B:** phase walls block **entry only**, judged **against the current phase only**, and **never crush or push the player**. The **union property** ("a tile that is a wall in either phase is permanently impassable") is **void**. A legal move can therefore end with the player **standing inside a tile that is a solid wall in the current phase** (entered as a ghost, solidified by the flip). This spec revision changes **presentation semantics only** — no rule lives in this file.

| # | What changed | Where |
|---|---|---|
| **G-1** | `wallEcho` re-semanted: from "permanently impassable, low-emphasis solid" to "**passable ghost** — walkable now, solidifies at the flip". Treatment moves to the **hollow** side of the R-C2 fill axis: 2 px stroke + flat light tint (`obj.wallEchoFill`), never a filled block. **ADR-0007's original argument ("never enterable but invisible ⇒ reads as input failure") is invalidated** — refusals are now caused *only* by visibly solid current-phase walls. Ghosts stay mandatory for **flip anticipation** instead (§3.1 rewritten). | §3.1, §3.1a, R-E1…R-E8, R-C1, R-C2 |
| **G-2** | New **R-C13 — the player standing inside a solid wall tile** must read as *mechanism, not a clip-through bug*: player always on top, wall interior drops to `obj.wallOccupied` with the edge stroke retained, one-shot phase ring at flip resolution (180 ms, inside the existing ≤ 220 ms budget, 0 ms input lock). | §4.3 (R-C13), §6.2, §6.3 |
| **G-3** | §3.3 acceptance tests 5–7 rewritten (union scoring deleted) and **test 8 added** (player-in-wall legibility). Test 7 now also verifies **"the phase did not flip"** on refusal. | §3.3 |
| **G-4** | All union-property wording deleted or corrected: §3.1 rationale, **R-E3 flipped**, **R-E5 flipped (ghosts are an affordance)**, §6.5 (adjacent ghost = *legal* move), §8 R-T6 + cell row (ghosts get the hover ring), §12 R9 (risk inverted). | throughout |
| **G-5** | New derived tokens `obj.wallEchoFill`, `obj.wallOccupied`, `fx.phaseRing` — offline WCAG/Viénot computation on 2026-10-14, same evidence status as V0.3: §3.3 in-app screenshot review still pending. | §4.3, §4.4, §4.6 |
| **G-6** | **Asset impact: none — the 11-image GATE A batch does not need regeneration.** Walls, ghosts, the occupied treatment and flip feedback are program-drawn vector art in the token system, not bitmaps. `docs/assets/codex-generation-brief.md` §6 states the same and was **not** edited by this task. | §9.1, §11 |
| **G-7** | ADR-0006/0007 needed a superseding ADR, and `level-design.md`'s refusal-as-tutorial ladder (L3/L4) + OQ-1 text needed the same correction — owned by Game Designer / Architect, **not** by this file. **DELIVERED while this spec was being written:** `ADR-0008` Accepted (partially supersedes 0006, revises 0007), `game-design.md` V0.4, `level-design.md` V0.3 with **OQ-1 RESOLVED**. Flagged as OQ5 → now closed. | §12 |

---

## V0.2 → V0.3 change note (RV-001 reconciliation · task UA-002 · 2026-10-14)

| # | Finding | What changed here |
|---|---|---|
| **B-1 (BLOCKER)** | §3.1 banned "ghost walls" as LOCKED, which made every ADR-0006 refusal look like broken input | §3.1 rewritten; new **§3.1a `wallEcho`** state (tokens, treatment, ≥3:1 contract, QA). Presentation layer only — **the core rule is unchanged.** Implements **ADR-0007**. |
| M-5a | R-T2 allowed a Restart confirm dialog | Deleted. **Restart = one tap, no dialog, penalty-free** (level-design §4, game-design §6, §0.5 no-new-screens). |
| M-5b | Par display contradicted `level-design.md` §1 | **V0.3 HUD = plain move count only, no par** (§5.3, OQ1) — flagged **pending Game Designer sign-off**; the `moves 4/9` example is removed from §5.3 and the future par format is quarantined behind that sign-off. |
| LOW-5 | Cross-fade started at 60 ms while the hop runs 0–130 ms | §6.2 keeps the 60 ms lead as default **and** defines **Variant CL** (fade locked to hop-landing) with exact timings + the measured trigger that switches to it. R-L2 reworded (40 px floor everywhere; 44 px except one flagged case). |
| LOW-6 | `icon_back` had no consumer | Marked **RESERVED** in §11 and in `docs/assets/asset-manifest.md`. |
| OQ4 | Grid cap unconfirmed | **CLOSED:** authored grids **≤ 7 × 7**; 8 × 8 only with Orchestrator approval. |
| evidence | Phase-B `obj.wall` was the weakest state token in the map (3.90:1) and left no room for a sub-3:1-safe echo | B `obj.wall` re-tuned `#8A78D6 → #A795EE` (**5.56:1**). Offline computation only; §3.3 screenshot review still pending at Stage 2. |

*Version note: the text reviewed by RV-001 is the V0.1/V0.2 content of this file; V0.2 carried no spec change over V0.1 (asset-manifest field audit only). V0.3 is this reconciliation round.*

---

## 0. Authority & non-negotiables

Priority order (from `AGENTS.md` §1) applied to every visual dispute:

`Fun > Player Comprehension > Puzzle Depth > … > Visual Polish`

1. **Board legibility outranks beauty.** Any effect that hides cell state is deleted, not tuned.
2. **Phase A and Phase B must read as clearly different at a glance on a phone.** Verified by the greyscale test (§4.4) — measured 14.04:1 between phase grounds, see below.
3. **One visual skin per phase, driven by a theme token map.** Never duplicated scene code. There is no `if (phase === "A")` branch inside renderer/entity/UI code; there is only `theme(phase)` (§5.4).
4. **No agent generates final art.** All art comes through the ASSET GATE (`docs/assets/asset-request-*.md` → `WAITING_FOR_USER_ASSETS` → user delivers → Agent 5 validates → manifest).
5. **Nothing in this document may add a mechanic, a screen, or a system.** YAGNI applies to UI: no lobby, no shop, no settings tree beyond sound, no tutorial popups.

---

## 1. Screen inventory (prototype = 1 screen + 1 dialog)

| Screen | Exists? | Notes |
|---|---|---|
| Boot / load | yes (code only) | no art, no logo animation. Placeholder = solid phase-A ground + logo mark if delivered. |
| Level (board) | **yes — the game** | top HUD bar + board + bottom action bar. |
| Win dialog | yes | minimal overlay on the board: level number, move count, `Next`, `Replay`. Not a separate scene. |
| Level select / lobby | **no** | prototype enters at a level directly (design §4). |
| Store / social / settings menu | **no** | out of scope (AGENTS.md §10). Sound toggle only, inside the top bar. |

---

## 2. Layout model & board layout rules

### 2.1 Coordinate systems

- **Logical grid** is fixed and authored in level data (`width`, `height`, integer cell coords). The renderer maps `grid(x,y) → world(px,py)` in exactly one place: `src/game/renderer/grid-mapping.ts`. No entity computes its own pixel position.
- **Board container** is a square, scale-to-fit, centered in the *play area* (viewport minus HUD bars minus safe insets).
- Board is **top-down flat** (no isometric, no perspective). Cover art A-01 must match this: flat top-down grid.
- `cellSize = floor(boardSide / max(width, height))`; the grid is centered inside the board plate; leftover pixels become outer padding, never stretched cells. Non-square grids keep square cells (letterboxed inside the plate).

### 2.2 Fixed frame budget (portrait, mobile-first)

| Region | Height | Contents |
|---|---|---|
| Top HUD bar | **56 px** (+ `env(safe-area-inset-top)`) | level label, move counter, phase chip, sound |
| Play area | remaining | board plate, centered |
| Bottom action bar | **72 px** (+ `env(safe-area-inset-bottom)`) | Undo, Restart, (Next on win) |
| Board side margin | **16 px** each side | minimum; grows on wide screens |

The DOM overlay **must never intersect the board rect** (§7.3). HUD is outside the play area, not floating on top of it.

### 2.3 Cell-size floor (hard numbers, computed 2026-10-14)

Board margin 16 px/side, square board = `min(viewportWidth − 32, playAreaHeight)`. Resulting cell size:

| Viewport width | 5×5 | 6×6 | 7×7 | 8×8 | 9×9 |
|---|---|---|---|---|---|
| 320 px | 57.6 | 48.0 | **41.1** ⚠ | 36.0 ✗ | 32.0 ✗ |
| 360 px | 65.6 | 54.7 | 46.9 ✓ | **41.0** ⚠ | 36.4 ✗ |
| 390 px | 71.6 | 59.7 | 51.1 ✓ | 44.8 ✓ | **39.8** ✗ |
| 414 px | 76.4 | 63.7 | 54.6 ✓ | 47.8 ✓ | **42.4** ⚠ |

(✓ ≥ 44 px target · ⚠ between the 40 px absolute floor and 44 px · ✗ below the floor — the 390 px / 9 × 9 cell was mis-marked ⚠ in V0.1; 39.8 < 40 is below the absolute floor, so 9 × 9 fails at 390 px too, not only at 320/360 px)

**Layout rules derived from this table:**

- **R-L1.** Target cell size **≥ 56 px**, hard target **≥ 44 px**, absolute floor **40 px**.
- **R-L2.** Level grids are authored **≤ 7 × 7**. At that cap the **40 px absolute floor holds at every supported viewport** (worst case 320 px / 7 × 7 = 41.1 px), and the **44 px target holds everywhere except that single flagged case** — 320 px viewport on a 7 × 7 grid, the smallest supported device, where R-T5 applies. Every other cell in the ≤ 7 × 7 columns is ✓ or ⚠-above-floor. 8 × 8 requires explicit Orchestrator approval (R-T5 + acceptance of the 40 px floor for the whole batch). **9 × 9 and larger are rejected on mobile portrait** (below the floor at 320 / 360 / 390 px). → generator constraint, handed to Level AI + Solver; **OQ4 closed**.
- **R-L3.** Cell gutter (visible gap between cells) = `max(2, round(cellSize * 0.06))`; corner radius = `round(cellSize * 0.14)`. Both derived, never hard-coded.
- **R-L4.** The board plate is opaque enough that background art never leaks into a cell: plate alpha **≥ 0.92 (A) / ≥ 0.94 (B)**, or fully opaque. If a delivered background is busier than spec, Agent 5 adds a single-colour scrim (0.35–0.5 alpha) instead of rejecting the art.
- **R-L5.** Landscape / desktop: board stays a centered square, capped at `min(playAreaHeight, 640 px)`; HUD bars become left/right rails only if width ≥ 900 px, otherwise unchanged. No separate landscape layout code path — same components, CSS-driven.
- **R-L6.** `devicePixelRatio` / Phaser resolution capped at **2**. No 3× framebuffers (mobile fill-rate budget).
- **R-L7.** Resize / orientation change recomputes `cellSize` once, then re-lays out. No per-frame layout math.

---

## 3. Cell readability contract (the hard rule)

### 3.1 State inventory that must be readable

Every cell is exactly one of: `empty`, `wallA(active|echo)`, `wallB(active|echo)`, `doorRed(open|closed)`, `doorBlue(open|closed)`, `portalA`, `portalB`, `switch(on|off)`, `goal`, plus overlays `player`, `playerOrigin` (last-move ghost, optional), `hintTarget` (only if the designer enables a hint). **Since V0.4 the `player` overlay may legally coexist with an `active` wall tile** (entered as a ghost, solidified by the flip) — presentation contract R-C13.

A phase wall is **one object with two render states**, never an object that appears and disappears:

- **`wall` (active)** — the wall is solid **in the current phase**: full-strength filled block. Entering it is the **only** way a move can be illegal (Option B).
- **`wallEcho` (ghost)** — the wall belongs to the *other* phase: **passable right now**, rendered as a clearly visible **hollow ghost** — thin stroke + light flat tint (**§3.1a**). The next flip solidifies it; if the player is standing on it at that moment, **R-C13** applies.

Doors, portals and switches keep their own open/closed and active/inactive treatments; `wallEcho` is defined for **walls** in V0.3 (the same `*Echo` pattern is **RESERVED** for an inactive portal at L36/M2 — token name reserved, not implemented, no art requested).

**Why ghosts must be rendered — the V0.4 rationale (supersedes both the V0.1 ban and the ADR-0007 argument).** The V0.1 ban ("never render ghost walls") was wrong because an invisible obstacle reads as input failure. ADR-0007 fixed that under ADR-0006 by rendering other-phase walls as *low-emphasis solids*, arguing: "a tile that is never enterable but is invisible makes every refusal look like broken input." **GATE C Option B removed that premise:** walls block entry only in their own solid phase and never crush the player, so a ghost tile is a **legal destination**, and a refusal is caused **only** by a tile that is visibly solid in the current phase — refusal legibility no longer depends on the echo at all. Ghosts remain mandatory for two other reasons:

1. **Flip anticipation.** Every legal move flips the phase, and a ghost tile the player walks into **solidifies under them** when the move resolves. If ghosts are not rendered, the post-flip topology is invisible: walls materialise out of nowhere, the flip reads as arbitrary world mutation, and cross-phase planning degrades into a memory test (ADR-0007's planning argument survives the rule change intact — "a reading task instead of a memory test").
2. **Passable vs blocking must be a readable axis.** The player must see *now* which tiles refuse entry (solid) and which accept it and solidify after the flip (ghost) — otherwise they either avoid legal moves or read a materialising wall as a clip-through bug. That axis is the **fill rule** — filled block vs hollow ghost (R-C2, R-E3) — and it is what the greyscale/CVD proofs require (§3.3 tests 5/6/8).

**This changes no rule.** Legality, the flip, `applyMove` and determinism are untouched; `wall` / `wallEcho` / the occupied variant are *derived render states* computed from the same single `GameState` (ADR-0002 / ADR-0004 / architecture-0001 unaffected). Rendering adds information — it never hides cell state, so non-negotiable #1 is satisfied, not violated. The rule change itself is the GATE C human decision, recorded in **ADR-0008** (Accepted, 2026-10-14) and not owned by this file.

### 3.1a `wallEcho` — the binding visual contract (V0.4: the passable ghost)

A ghost is **walkable in the current phase**. It must be separable from a solid wall **at a glance, with colour entirely removed**, on the **fill-rule** axis — inside the same token and hue family (R-C10).

| Property | `wall` (solid — current phase) | `wallEcho` (ghost — other phase) | Channel used |
|---|---|---|---|
| Silhouette | rounded square, **filled** | rounded square, **hollow**: 2 px stroke + flat light tint — never a filled block | **fill rule — primary, greyscale/CVD-proof** |
| Footprint | **88 %** of cell | **80 %** of cell | size |
| Interior | `obj.wall`, flat, full coverage | `obj.wallEchoFill`, flat — precomputed light tint (§4.3, R-E2a) | value |
| Stroke | none (the fill carries the shape) | `obj.wallEcho`, **2 px**, at every cell size ≥ 40 px | value |
| Edge | `obj.wallEdge`, 2 px, only at `cellSize ≥ 56` | **none** | presence/absence |
| Phase notch | none | **knockout sun/crescent to `ground.cell`** (the R-C1 door glyph language: crescent on a ghost while Phase A is active, sun while Phase B is), `cellSize * 0.30` box, only at `cellSize ≥ 56` | glyph |
| Corner radius / gutter | R-L3 | R-L3 (same derivation) | — |

Hard rules:

- **R-E1 — ≥ 3:1 on the stroke, always.** `obj.wallEcho` (the stroke token) reaches **≥ 3:1 against the *worse* of `ground.cell` and `ground.cellAlt`**. Measured: A **3.98 / 3.38**, B **3.47 / 3.05** (§4.6). A ghost must be findable at a glance — never "invisible unless you squint". The interior tint is a *subordinate* channel with its own band (R-E2a) and does not carry the 3:1 requirement; the stroke does.
- **R-E2 — Separated from the solid wall by fill rule first, value second.** Primary axis: **filled vs hollow** — cannot be collapsed by desaturation or by any dichromat simulation (R-C2, R-C6). Secondary axis (stroke token vs `obj.wall`): **ΔL\* ≥ 12** *and* **desaturated CR ≥ 1.55:1**; measured A **ΔL\* 13.1 / grey 1.61:1**, B **ΔL\* 14.0 / grey 1.60:1**. Tertiary axis: solid fill vs ghost tint = **3.03:1 (A) / 2.62:1 (B)** in greyscale (§4.6). Hue is *not* used to distinguish the two.
- **R-E2a — Tint band.** `obj.wallEchoFill` sits at **1.7:1 – 2.6:1 against the worse ground**: clearly present, strictly subordinate to both the stroke (≥ 3:1) and the solid fill. Measured: A **2.11 / 1.79**, B **2.12 / 1.86** (§4.3/§4.6). The tint is a **flat, precomputed token** — never runtime alpha over ground (R-C7 preserved; contrast stays deterministic and unit-testable). Derivation rule: 60 % `obj.wallEcho` + 40 % `ground.cell`.
- **R-E3 — Hollow = passable now (FLIPPED in V0.4).** Under GATE C Option B a ghost tile is a **legal destination**, so R-C2's load-bearing axis ("solid = blocks entry now, hollow = passable now") puts the ghost on the **hollow** side. The V0.3 text ("still solid, still blocking … must not become hollow or outline-only") rested on ADR-0006's union property and is **void**. A ghost must never be rendered as a filled block: a filled ghost promises a refusal the rules do not make.
- **R-E4 — Low emphasis, strictly subordinate.** A ghost may never be brighter, larger, higher-contrast or more saturated than a solid wall of the same phase (§5.1 rank 4). The **notch is a knockout to `ground.cell` through stroke and tint**, so it reads at the tint's own CR (**2.11:1** in both phases); it is a *redundant* channel — the owning phase is already named by which walls are solid — and therefore does not require the stroke's 3:1 band.
- **R-E5 — Affordance, not decoration (V0.4 semantics).** A ghost **is a legal move destination**: tapping/swiping toward it goes through the normal `MOVE(dir)` path and **succeeds**; the flip then solidifies the tile under the player (R-C13 presentation applies). Ghosts still never animate on idle (R-C8's single attention magnet stays the goal), never get a hover state of their own, and have **no input handler of their own**. The V0.3 text ("tapping an adjacent echo is refused by the core rules") is **void**.
- **R-E6 — The flip is a state swap, not an add/remove.** On a phase flip a wall tile cross-fades `wall ↔ wallEcho` (fill rule + tokens + footprint 88 ↔ 80 % + edge on/off + notch), in place, on the same sprite (§6.2). If the player occupies the tile when the flip resolves, the solid side renders with the **occupied treatment** (R-C13) instead of the full solid. No wall sprite is ever created or destroyed by a flip.
- **R-E7 — Uniform language.** Ghosts render in **every** level from L1 onward, including teaching levels. Two visual languages for one object class is noise.
- **R-E8 — One code path.** `wallEcho` is a token pair + a footprint constant + a glyph lookup inside the existing wall renderer; the occupied variant is one extra derived token + one boot-time ring lookup (R-C13). No `phase ===` branch, no second prefab, no second scene (non-negotiable #3, §5.4).

**Relationship to `level-design.md` OQ-1:** GATE C **resolved OQ-1 by adopting Option B** — walls block entry only in their own solid phase, restoring parity-dependent routing. The old mitigation wording ("tune ghost-wall visibility (UI)") now means tuning **within** this contract — the emphasis bands (footprint 76–84 %, ΔL\* 12–18, tint band R-E2a) — **not** adding, removing or re-solidifying the ghost state.


### 3.2 Encoding contract

- **R-C1 — Shape is the primary channel, colour is the phase channel, hue is the tertiary class channel.** No state may be encoded by colour alone. Each class has a unique silhouette:

| Class | Silhouette (mandatory) | Fill rule |
|---|---|---|
| empty | flat cell plate | ground colour |
| wall (active) | **filled rounded square**, 88 % of cell | solid |
| wallEcho (ghost — other phase) | **hollow rounded square**, 80 % of cell, 2 px stroke + knockout phase notch at `cellSize ≥ 56` (§3.1a) | stroke `obj.wallEcho` + flat light tint `obj.wallEchoFill` |
| door (red / blue) | rounded square with **3 horizontal bars** + phase glyph notch (sun = red/A-active, crescent = blue/B-active) | solid bars |
| portal | **diamond outline** with inner swirl | hollow |
| switch | **small square outline**, 40 % of cell, corner dot when on | hollow |
| goal | **hollow ring**, 66 % of cell, with a small centre dot | hollow |
| player | **filled round glow** + (auto) contrast ring, 70 % of cell | solid |

- **R-C2 — Fill vs hollow is a semantic axis.** Anything that **blocks entry in the current phase** is *solid*; anything you can pass through or reach is *hollow*. The player is the only solid moving element. This alone makes the board parseable without colour. **Since V0.4 (GATE C Option B) `wallEcho` sits on the HOLLOW side of this axis** (R-E3): a ghost is a legal destination that solidifies at the flip. The V0.3 sentence placing echoes on the solid side (union property) is void. One marked overlay exception: a solid wall **under the player** (R-C13) keeps its filled footprint but drops its interior value and retains its edge — at that moment it blocks nothing (the player is already inside and can always move out; the origin tile is never re-checked), and the read is carried by player-on-top + the occupied treatment.
- **R-C3 — Contrast.** Every state-bearing graphic must reach **≥ 3:1** against the cell ground it sits on (WCAG 2.1 SC 1.4.11 non-text contrast), and against `ground.cellAlt` where the graphic can sit on a checker-alternate cell (R-E1). HUD text **≥ 4.5:1** (SC 1.4.3). Verified values in §4.3 / §4.6.
- **R-C4 — Grid lines are structure, not state.** They are exempt from R-C3 but must stay in the **1.6:1 – 2.2:1** band against the cell ground: visible enough to parse the grid, never stronger than any state element.
- **R-C5 — Nothing may cover a cell's state.** No vignette, blur, bloom, particle, glow overlay, or transition effect may reduce the state graphic's coverage below **70 % of its drawn area**, and no effect may be drawn *above* the object layer except the player and the win flash (which is a plate-level tint, not a per-cell cover). The `wallEcho` **knockout notch is part of the state graphic, not a cover**: it removes 0.09 cell² from a 0.64 cell² silhouette → coverage **86 %**, above the floor.
- **R-C6 — Colour-vision safety.** Class distinctions must survive protanopia / deuteranopia / tritanopia. The red↔blue door pair is additionally glyph-coded (R-C1) because luminance separation between red and blue is near zero for deuteranopes (measured: A doors 1.41:1 simulated CR under deutan, but 0.58 simulated hue distance — hence the mandatory glyph). `wall ↔ wallEcho` is separated on the **value axis only** (R-E2), which no dichromat simulation can collapse — see §4.6.
- **R-C7 — No texture inside cells.** Grain, paper texture and gradients belong to the *background* and the *plate*, never inside a state graphic. Textured walls are deferred in the manifest for exactly this reason. `wallEcho` is a **flat stroke + a flat precomputed tint** (`obj.wallEchoFill`), and `wallOccupied` is a flat precomputed token — no hatch, no stripes, no dither, no runtime transparency-over-ground anywhere (flat tokens keep contrast deterministic and unit-testable).
- **R-C8 — One attention magnet.** Exactly one element may animate on an idle board: the goal (2.4 s slow pulse, ±6 % scale, no colour change). Nothing else idles, breathes, sparkles or loops — **including `wallEcho`** (R-E5): echoes are static between moves and change only inside the flip sequence.

### 3.3 Readability QA gate (must pass before art is called "integrated")

1. **Screenshot review** at 360×640, 390×844, 1024×768 for both phases on the same level.
2. **Greyscale test** (§4.4): desaturated screenshot — a fresh viewer must name the current phase correctly, 5/5.
3. **CVD test**: same screenshots through protan / deutan / tritan simulation — every class still separable by shape, and `wall` vs `wallEcho` still separable by **fill rule and value** (R-E2).
4. **1-second player test**: on a 390 px-wide screenshot, a fresh viewer locates the player in < 1 s, 5/5.
5. **Wall/path parse test (V0.4 rewrite — union scoring is void):** viewer states which cells **block entry right now**, ≥ 90 % correct with no explanation. The correct answer set is **the currently-solid walls only** — under Option B a ghost (`wallEcho`) tile is a **legal** destination and must **not** be scored as blocked. (V0.3 scored `wall ∪ wallEcho`; that scoring assumed the union property and is deleted.) Run in both phases.
6. **Ghost-vs-solid discriminability test (V0.4 rewrite):** on a **desaturated and CVD-simulated** 390 px screenshot, a fresh viewer sorts 10 wall tiles into "passable now (ghost)" vs "solid now (blocks)", ≥ 8/10 with no explanation. Run in both phases. This is the direct test of the R-C2 fill-rule axis with colour entirely removed.
7. **Refusal feedback test (V0.4 rewrite):** after one refused move and **no** explanation, the viewer must (a) point at the tile that caused the refusal — always a **currently-solid wall** under Option B — ≥ 4/5, **and** (b) state that **the phase did NOT flip** (ground, chip and wall states all unchanged), ≥ 4/5. If (a) fails, solid↔ghost separation has failed and the fix lives inside the R-E bands (§6.5) — never a bigger nudge, flash or text.
8. **Player-in-wall test (new V0.4 — gates R-C13):** after the player legally enters a ghost tile and the flip solidifies it, on a screenshot with **no** explanation: (a) a fresh viewer locates the player in < 1 s, 5/5; (b) asked "is the player inside that wall a bug or part of the game?", ≥ 4/5 answer *part of the game / intended*. Run in both phases (Phase B is the harder case — player body vs `obj.wallOccupied` must hold the §4.6 numbers).

---

## 4. Theme tokens — Phase A / Phase B

### 4.1 Base palettes (reused verbatim from `docs/assets/asset-manifest.md`)

- **Phase A (Light / 白昼):** ivory `#F7F1E3`, faint gold `#E9C87A`, sky blue `#A8D8F0`, warm sand, soft morning haze.
- **Phase B (Shadow / 夜晚):** deep indigo `#1B1F3B`, violet `#4A3D7A`, moonlight `#C9D6FF`, cool teal accent, dream-like dusk.

### 4.2 Derived-token policy (important, and why it exists)

The base palettes are **background / art** colours. Used directly as *board figures* on a light Phase A ground they fail the contrast contract — measured: faint gold `#E9C87A` on an ivory cell = **1.59:1**, sky blue `#A8D8F0` on ivory = **1.50:1**. So this spec derives a **figure shade** per class from the same hue families (deeper sand-stone, deeper gold, deeper sky-teal for A; brighter violet, moonlight, pale gold, bright teal for B). Derived tokens stay inside the licensed hue families; they do **not** change any asset prompt.

**Phase inversion rule (the core of the phase identity):**

> **Phase A = light ground, dark warm figures. Phase B = dark ground, light cool figures.**

This single inversion is what makes the phases legible at a glance, legible in greyscale, and legible to colour-blind players — before hue is even considered.

### 4.3 Token map (V0.3 values, measured)

Measured with a WCAG 2.1 relative-luminance script on 2026-10-14; the V0.3 rows (`obj.wallEcho` A/B, `obj.wall` B) were recomputed the same day with the same script (offline; re-verify in-app via §3.3 screenshot review). `CR` = contrast ratio against that phase's cell ground.

| Token | Phase A (Light) | CR vs ground | Phase B (Shadow) | CR vs ground | Purpose |
|---|---|---|---|---|---|
| `ground.page` | `#F1E6D2` | — | `#141733` | — | page / letterbox behind board |
| `ground.plate` | `#F7F1E3` | — | `#1B1F3B` | — | board plate (manifest base colour) |
| `ground.cell` | `#FFFDF7` | 1.00 | `#22284A` | 1.00 | empty cell |
| `ground.cellAlt` | `#F2EADB` | 1.18 | `#2A3157` | 1.14 | checker alternate (deliberately subtle) |
| `ground.grid` | `#CDB996` | 1.88 ✓ band | `#414A7E` | 1.70 ✓ band | cell separator (R-C4) |
| `obj.wall` | `#6E5B3E` | **6.39** ✓ | `#A795EE` | **5.56** ✓ | phase wall, active (solid square). B re-tuned in V0.3 from `#8A78D6` (3.90) — see note below |
| `obj.wallEcho` | `#8E7C5D` | **3.98** ✓ (3.38 vs `cellAlt`) | `#7C77AE` | **3.47** ✓ (3.05 vs `cellAlt`) | **ghost stroke** — other-phase wall = passable ghost (§3.1a, V0.4); 2 px hollow outline, 80 % footprint |
| `obj.wallEchoFill` | `#BBB09B` | **2.11** (1.79 vs `cellAlt`) | `#585786` | **2.12** (1.86 vs `cellAlt`) | flat tint inside the ghost (R-E2a band 1.7–2.6:1) — **new V0.4**, derived: 60 % `obj.wallEcho` + 40 % `ground.cell` |
| `obj.wallOccupied` | `#AFA491` | **2.42** (2.06 vs `cellAlt`) | `#6B64A4` | **2.71** (2.38 vs `cellAlt`) | solid-wall interior **under the player** (R-C13) — **new V0.4**, derived: 55 % `obj.wall` + 45 % `ground.cell` |
| `obj.wallEdge` | `#4A3D28` | **10.38** ✓ | `#C9D6FF` | **9.89** ✓ | 2 px edge on the **active** wall only, and only at cellSize ≥ 56 px |
| `obj.goal` | `#A8752A` | **3.94** ✓ | `#E9C87A` | **8.85** ✓ | goal ring — same hue family in both phases |
| `obj.portal` | `#1F6F78` | **5.73** ✓ | `#7FD8D0` | **8.59** ✓ | portal diamond (teal family both phases) |
| `obj.doorRed` | `#B03A32` | **5.90** ✓ | `#FF8A7A` | **6.24** ✓ | red door (A-active) |
| `obj.doorBlue` | `#2E62B8` | **5.81** ✓ | `#8FC4FF` | **7.83** ✓ | blue door (B-active) |
| `obj.switch` | `#7A5AA0` | **5.44** ✓ | `#C79BE8` | **6.31** ✓ | optional M3 switch |
| `actor.body` | `#F6DE9E` | 1.30 ⚠ | `#EAF0FF` | **12.52** ✓ | Echo Spirit body (art-driven) |
| `actor.ring` | `#4A3216` | **11.74** ✓ | `#5B4E96` | 2.02 (unused) | auto contrast ring, see R-C9 |
| `text.primary` | `#3A3226` | **11.20** ✓ | `#EAF0FF` | **14.10** ✓ | HUD text |
| `text.secondary` | `#6E6047` | **5.44** ✓ | `#A9B2D8` | **7.69** ✓ | counters, labels |
| `accent` | `#E9C87A` | (on plate 1.43 → used only as fill under dark text) | `#7FD8D0` | 8.59 ✓ | focus ring, chip fill, highlight |
| `hud.panel` | `rgba(247,241,227,0.88)` | — | `rgba(27,31,59,0.88)` | — | HUD bar background |
| `hud.chipA` / `hud.chipB` | fill `#E9C87A` + glyph `#6B4E1E` (4.76 ✓) | — | fill `#4A3D7A` + glyph `#C9D6FF` (6.49 ✓) | — | phase chip, icon-only |
| `btn.primary` | `#E9C87A → #D8A94E`, label `#4A3B21` (**6.71** ✓) | — | `#5B4E96 → #4A3D7A`, label `#F2F5FF` (**6.48** ✓) | — | Next / primary CTA |
| `btn.ghost` | outline `#6E6047`, label `#3A3226` | — | outline `#A9B2D8`, label `#EAF0FF` | — | Undo / Restart / Sound |
| `feedback.deny` | `#B4453A` | 4.84 ✓ | `#FF9C8E` | 7.96 ✓ | illegal-move nudge (no text, no shake > 2 px) |
| `fx.phaseRing` | derived → `actor.ring` `#4A3216` (**4.86:1** vs `obj.wallOccupied`) | — | derived → `accent` `#7FD8D0` (**3.17:1** vs `obj.wallOccupied`) | — | one-shot ring when a flip solidifies the wall under the player (R-C13) — **new V0.4**, chosen **at boot** as `argmax CR(candidate, obj.wallOccupied)` over `{actor.ring, accent}`; never a per-frame or per-phase branch |
| `feedback.win` | plate tint `#E9C87A` @ 0.18 | — | plate tint `#C9D6FF` @ 0.16 | — | plate-level only, never per-cell cover |

- **R-C9 — Auto contrast ring.** `actor.ring` is drawn **only when `CR(actor.body, ground.cell) < 3`**, evaluated once at boot from the token map (not per frame, not per phase branch). With the current tokens this means: ring ON in Phase A (a light spirit on a light board is 1.30:1 without it, 11.74:1 with it), ring OFF in Phase B (12.52:1 already). One code path, deterministic, unit-testable.
- **R-C10 — Same class, same hue family across phases.** Goal is gold in both phases, portal is teal in both, doors are red/blue in both, **walls are sand-stone in A and violet in B in both states** (active and echo). Only *value* and *temperature* flip with the phase. This is how the player learns "that object is the same object" across a flip — it is also the rule A-06 requires of the two portal sprites.
- **R-C11 — Tokens are the only source of colour.** No hex literal may appear in `src/game/**` or `src/ui/**`. One file (`src/ui/theme/tokens.ts`) exports the map; the DOM consumes it as CSS custom properties (`--ps-*`), Phaser consumes it as colour ints. Both are generated from the same object.
- **R-C12 — Echo & derived tokens are computed, never hand-picked per level.** `obj.wallEcho`, `obj.wallEchoFill`, `obj.wallOccupied` and `fx.phaseRing` are single values per phase. The renderer picks `wall` vs `wallEcho` from `theme(phase)` + the tile's `phaseAWalls` / `phaseBWalls` membership — data, not a colour decision. `obj.wallEchoFill` (60/40) and `obj.wallOccupied` (55/45) follow the fixed blend rules in §4.3: **re-tuning a base wall token requires recomputing both in the same commit**, with the §4.6 numbers re-measured. No level, no scene and no entity may override any of these tokens.
- **R-C13 — Player inside a solid wall tile (new V0.4, GATE C Option B).** The player may legally stand on a tile that is a **solid wall in the current phase** (entered as a ghost, solidified by the flip). This must read as *mechanism, never as a clip-through bug*:
  1. **Z-order:** the player sprite (L5) always draws **above** the wall graphic (L4). No wall treatment may draw over any part of the player.
  2. **Occupied treatment (steady state):** while the player occupies the tile, the wall interior renders `obj.wallOccupied` instead of `obj.wall` — a visible drop of **2.65:1 (A) / 2.05:1 (B)** in greyscale against the full wall (band: ≥ 1.8:1) — and the wall **retains a 2 px `obj.wallEdge` stroke at every cell size** (edge vs occupied interior: A 4.29:1, B 3.65:1; edge vs ground: A 10.38:1, B 9.89:1), so the tile stays unmistakably a wall. R-C3 is satisfied by the edge stroke; the interior band is ≥ 2.0:1 against the worse ground (measured A 2.06 / B 2.38).
  3. **Player visibility:** Phase A relies on R-C9's `actor.ring` (ON in A: **4.86:1** vs occupied interior; body alone is only 1.86:1 — the ring is *mandatory* here, not optional). Phase B body alone reaches **4.62:1** vs occupied interior.
  4. **One-shot phase ring (event):** at flip resolution a single ring pulses around the player — 2 px stroke, **180 ms**, scale 0.7 → 1.0 of the cell, token `fx.phaseRing` (boot-derived, ≥ 3:1 vs the occupied interior in both phases). It is event feedback like the deny nudge — **not** an idle animation (R-C8 stands), never looped while standing.
  5. **Budget:** the occupied cross-fade + ring live **inside** the existing ≤ 220 ms flip budget (§6.1/§6.2) with **0 ms** added input lock.
  6. **No hidden state:** the treatment only changes the wall's interior value; the player stays fully visible (§3.3 test 8a), the wall stays identifiable (test 8b leans on edge + filled silhouette), and nothing is drawn outside the occupied cell.
  7. **One code path:** "occupied" is a derived render flag (`player position === wall tile && tile is solid in the current phase`) computed from `GameState`; no `phase ===` branch, no second prefab (non-negotiable #3).

> **V0.3 token re-tune record (required by the header rule).** Phase-B `obj.wall` was `#8A78D6` = **3.90:1**, the weakest state-bearing token in the whole map for the game's most important obstacle class. It also left **no room** for a subordinate echo: on a `#2A3157` checker-alternate cell, 3:1 requires figure luminance ≥ 0.203 while the old wall sat at 0.237 — a band too narrow for a visible value step (ΔL\* ≈ 3). `obj.wall` (B) is therefore lightened to **`#A795EE` = 5.56:1** (4.88:1 vs `cellAlt`), which opens a clean band for `obj.wallEcho` B = `#7C77AE` (3.47:1) at **ΔL\* 14.0**. Same hue family (violet), same phase-inversion rule (§4.2), no asset prompt touched. Phase A needed no change: `obj.wall` 6.39:1 already left room for `#8E7C5D` at 3.98:1 / ΔL\* 13.1. **Evidence status: offline WCAG computation only** — the in-app §3.3 screenshot review is still pending (no renderer exists yet), and this row is re-verified there before the tokens are called "integrated".

> **V0.4 token record (required by the header rule).** GATE C Option B added three derived tokens, computed offline 2026-10-14 with the same WCAG 2.1 relative-luminance + Viénot (1999) scripts: `obj.wallEchoFill` (ghost tint, 60/40 blend of the stroke over `ground.cell`) A `#BBB09B` **2.11:1** / B `#585786` **2.12:1** — inside the R-E2a band 1.7–2.6:1; `obj.wallOccupied` (wall interior under the player, 55/45 blend of `obj.wall` over `ground.cell`) A `#AFA491` **2.42:1** / B `#6B64A4` **2.71:1**; `fx.phaseRing` (boot-time `argmax` over `{actor.ring, accent}` vs the occupied interior) → A picks `#4A3216` (**4.86:1**), B picks `#7FD8D0` (**3.17:1**). Base tokens (`obj.wall`, `obj.wallEcho`, grounds, edges) are **unchanged** from V0.3 — the V0.3 re-tune record above stays valid. **Evidence status: offline computation only**; re-verified in-app at the §3.3 review (tests 5/6/8 in particular).


### 4.4 Greyscale test — measured evidence

Desaturating the V0.3 tokens completely (worst case: no colour information at all):

| Element | Phase A luminance | Phase B luminance | A↔B ratio |
|---|---|---|---|
| cell ground | 0.982 | 0.024 | **14.04:1** |
| board plate | 0.882 | 0.015 | **14.28:1** |
| wall (active) | 0.111 | 0.359 | 2.53:1 |
| wallEcho stroke (ghost outline) | 0.210 | 0.205 | 1.02:1 |
| wallEchoFill (ghost tint, new V0.4) | 0.440 | 0.106 | 3.14:1 |
| wallOccupied (wall under player, new V0.4) | 0.377 | 0.149 | 2.14:1 |
| goal | 0.212 | 0.600 | 2.48:1 |

The grounds invert by more than an order of magnitude, so **the phase is identifiable in pure greyscale**, satisfying non-negotiable #2 without relying on hue. This is the single most robust phase signal in the game and must not be weakened (e.g. by darkening Phase A or lightening Phase B).

The A↔B column is *not* the interesting number for walls — what matters is the **within-phase** separation of solid wall vs ghost, because that is what tells the player "blocks entry now" from "passable now, solid after the flip" with colour removed entirely. Since V0.4 the **primary** greyscale axis is the fill rule (filled block vs hollow stroke + light tint); the value numbers are the backup:

| Phase | `obj.wall` vs `obj.wallEcho` stroke, desaturated | `obj.wall` fill vs `obj.wallEchoFill` tint (fill-area step) | Verdict |
|---|---|---|---|
| A | 0.111 vs 0.210 → **1.61:1** | 0.111 vs 0.440 → **3.03:1** | clearly separable in greyscale ✓ (structure + two value steps) |
| B | 0.359 vs 0.205 → **1.60:1** | 0.361 vs 0.106 → **2.62:1** | clearly separable in greyscale ✓ |

(`wallEcho` sits at nearly the same absolute luminance in both phases by design — it is the "muted" figure in each — so its A↔B ratio is ~1.0. Phase identity is carried by the grounds, not by the figures, exactly as non-negotiable #2 intends.)

### 4.5 CVD spot-checks (simulated, Viénot matrices)

| Pair | Normal CR | protan | deutan | tritan | Verdict |
|---|---|---|---|---|---|
| A doorRed / doorBlue | 1.02 | d 0.89 | d 0.58 | d 0.36 | hue-separated + mandatory glyph ✓ |
| B doorRed / doorBlue | 1.26 | d 1.16 | d 0.79 | d 0.71 | ✓ |
| A wall / goal | 1.62 | d 0.37 | d 0.20 | d 0.14 | solid vs hollow ring ✓ (shape carries it) |
| B wall / portal | 2.20 → **1.55** † | d 0.72 | d 0.53 | d 0.05 | square vs diamond ✓ (tritan relies on shape) |
| B player / goal | 1.42 | d 0.75 | d 0.77 | d 0.51 | filled glow vs hollow ring ✓ |
| A player / wall | 4.91 | d 1.27 | d 1.04 | d 0.42 | ✓ |

(`d` = Euclidean distance in simulated linear RGB; > 0.15 treated as separable.) Conclusion: **no class may rely on hue alone** — R-C1/R-C2 are load-bearing, not decorative.

† The V0.1 `d` values in the `B wall / portal` row were measured against the old `#8A78D6`. V0.3 lightened B `obj.wall` to `#A795EE`, so the normal-vision CR drops 2.20 → 1.55 while the *simulated* hue distance actually rises (protan 0.03 → 0.20, deutan 0.00 → 0.16, §4.6). The verdict is unchanged and was never hue-dependent: **filled square vs hollow diamond** (R-C1/R-C2).

### 4.6 `wallEcho` separation — measured evidence (new in V0.3)

Recomputed 2026-10-14 with the same offline Viénot (1999) linear-RGB script; `d` = Euclidean distance in simulated linear RGB (> 0.15 treated as separable). `ΔL*` = CIELAB lightness difference (D65). `CR` is luminance-based, so it **is** the separation that survives full desaturation (the greyscale column of §4.4 applied to a pair).

| Pair | CR (greyscale separation) | ΔL\* | protan | deutan | tritan | Verdict |
|---|---|---|---|---|---|---|
| A `wall` / `wallEcho` | **1.61:1** | **13.1** | 0.19 | 0.19 | 0.15 | value step ✓ — see note |
| B `wall` / `wallEcho` | **1.60:1** | **14.0** | 0.41 | 0.35 | 0.22 | value step ✓ |
| A `wallEcho` / `goal` | 1.01:1 | 0.3 | 0.67 | 0.53 | 0.14 | 80 % filled square vs 66 % hollow ring ✓ (shape carries it — same situation as the V0.1 `A wall / goal` row) |
| B `wallEcho` / `portal` | 2.47:1 | 28.4 | 0.20 | 0.20 | 0.53 | square vs diamond ✓ |
| B `wall` / `portal` (re-measured) | 1.55:1 | 14.4 | 0.20 | 0.16 | 0.38 | square vs diamond ✓ |
| A `player` / `wallEcho` | 3.06:1 | 36.2 | 0.71 | 0.74 | 0.85 | ✓ (vs stroke token; body vs tint = 1.68:1 — the *structure* carries actor-over-ghost, and in A the R-C9 ring is ON) |
| B `player` / `wallEcho` | 3.60:1 | 42.3 | 0.55 | 0.50 | 0.96 | ✓ |

**V0.4 additions (Option B pairs — ghost tint, occupied wall, phase ring), same script, same day:**

| Pair | CR (greyscale separation) | ΔL\* | protan | deutan | tritan | Verdict |
|---|---|---|---|---|---|---|
| A `wall` fill / `wallEchoFill` tint | **3.03:1** | 32.4 | 0.57 | 0.57 | 0.50 | fill-area value step ✓ — plus hollow-vs-filled structure (primary axis) |
| B `wall` fill / `wallEchoFill` tint | **2.62:1** | 27.5 | 0.37 | 0.39 | 0.94 | ✓ |
| A `wall` / `wallOccupied` (drop visibility) | **2.65:1** | 28.0 | — | — | — | ✓ ≥ 1.8:1 band (R-C13.2) |
| B `wall` / `wallOccupied` | **2.05:1** | 20.9 | — | — | — | ✓ |
| A `player` body / `wallOccupied` | 1.86:1 | — | 0.64 | 0.67 | 0.22 | body alone insufficient → **R-C9 ring mandatory in A**: ring vs occupied = **4.86:1** ✓ |
| B `player` body / `wallOccupied` | **4.62:1** | — | 1.28 | 1.26 | 1.12 | ✓ body alone |
| A `wallEdge` / `wallOccupied` | **4.29:1** | — | — | — | — | ✓ edge keeps the occupied tile readable as a wall (R-C13.2) |
| B `wallEdge` / `wallOccupied` | **3.65:1** | — | — | — | — | ✓ |
| `fx.phaseRing` / `wallOccupied` | A **4.86:1** · B **3.17:1** | — | — | — | — | ✓ ≥ 3:1 both phases (boot-time argmax, R-C13.4) |

**Note on the tritan 0.15 for A `wall` / `wallEcho`:** it sits exactly on the separability threshold, which is *why* R-E2 specifies this pair on the value axis (CR 1.61:1, ΔL\* 13.1) and forbids specifying it on hue. A lightness ordering cannot be collapsed by a dichromat simulation; a hue difference can. The `d` columns are confirmation, not the argument — the opposite of the door pair, which *needed* a glyph because its hue separation vanishes under deutan. Actor adjacency is safe in both phases (A 3.06:1, B 3.60:1 body-fill alone), and in Phase A R-C9's `actor.ring` is ON anyway (11.74:1), so the player's outline never depends on the fill.

**Contract restated as numbers:** `ΔL* ≥ 12` **and** `CR(wall, wallEcho stroke) ≥ 1.55:1` **and** `CR(stroke, worse ground) ≥ 3.0` **and (V0.4)** `CR(wall fill, wallEchoFill) ≥ 2.5:1` **and** `CR(wallEchoFill, worse ground) ∈ [1.7, 2.6]` **and** `CR(wall, wallOccupied) ≥ 1.8:1` **and** `CR(player-visible-element, wallOccupied) ≥ 3.0` (via body or R-C9 ring) **and** `CR(fx.phaseRing, wallOccupied) ≥ 3.0`. A re-tune that breaks any of these is rejected, not shipped.

---

## 5. Visual hierarchy

### 5.1 Attention budget (strictly ordered)

| Rank | Element | Allowed motion | Allowed area |
|---|---|---|---|
| 1 | **Player (Echo Spirit)** | move hop only (§6) | 70 % of one cell |
| 2 | **Goal** | slow pulse, ±6 % scale, 2.4 s | 66 % of one cell |
| 3 | **Walls (solid, current phase) / doors (blocking)** | `wall ↔ wallEcho` state cross-fade during flip only (R-E6 — never created/destroyed); occupied interior drop + one-shot phase ring when a flip solidifies the tile under the player (R-C13) | 88 % of a cell |
| 4 | **`wallEcho` (ghosts — passable now)** | state cross-fade during flip only; **never on idle** (R-C8, R-E5) | 80 % of a cell |
| 5 | Portals / switches | enter/exit during flip only | 70 % of a cell |
| 6 | Cell plate + grid lines | never | full board |
| 7 | Background art (A-04 / A-05) | never (static image; cross-dissolve on flip only) | full screen |
| 8 | HUD (DOM) | count/chip update only | outside the board |

Rank 4 is a **hard ceiling for echoes** (R-E4): an echo may never outrank, out-contrast or out-size an active wall. If a delivered background or a re-tune makes echoes compete with active walls, the echo is muted further — never the active wall dimmed.

### 5.2 Z-order (bottom → top), fixed layer names

```
L0 pageGround          L1 backgroundImage      L2 boardPlate
L3 cellPlate + grid    L4 objects (wall + wallEcho / door / portal / switch / goal)
L5 actor (player)      L6 cellFeedback (deny nudge, hint target)
L7 plateTint (win)     L8 DOM overlay (HUD, dialogs)
```

- Only L6 and L7 may sit above the actor, and neither may cover an object graphic (R-C5).
- `L1 backgroundImage` is always below `L2 boardPlate`, and the plate is opaque per R-L4.
- **`wallEcho` lives in L4, on the same sprite as the active wall** (R-E6/R-E8). There is no separate "ghost layer", no extra container and no per-tile z-sorting: a flip swaps tokens on an existing object, it does not re-parent anything.

### 5.3 Type & icon scale

| Use | Size (CSS px) | Weight | Notes |
|---|---|---|---|
| level label | 16 | 600 | `L 07` — tabular numerals |
| move counter | 16 | 500 | **`moves 4`** — plain move count only. **No par, no `4/9`, no "best".** See the par note below. |
| win dialog title | 28 | 700 | one line, no marketing copy |
| body / hint line | 14–16 | 400 | ≤ 1 short hint line total in L1–L3 (design §9) |
| icons | 24 (bar) / 32 (chip) / 48 (primary action) | — | from A-07; icon-only chips carry `aria-label` + visually-hidden text |

Font stack: `system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif`. **No webfont** in the prototype (load cost + FOUT on mobile). All in-game text is DOM text (§7) — never baked into canvas, never baked into art (all A-0x prompts already forbid text).

**Par display — V0.3 decision (M-5b, resolves a doc conflict).** `level-design.md` §1 describes the `par` field as "displayed as the *perfect clear* target"; the V0.1 default here was plain move count; §5.3 showed a `4/9` example. **V0.3 sets the shipping behaviour to: plain move count only, no par anywhere in the HUD or the win dialog.** `par` stays in the level schema as a **Solver / difficulty-metric field** (`level-design.md` §1, §6; `level-difficulty.md`) — it is simply not a HUD field yet.

> **⚠ PENDING GAME DESIGNER SIGN-OFF.** This is a UI-side default chosen to remove the contradiction, not a design ruling. It conflicts with the literal wording of `level-design.md` §1, which Agent 5 does not own. If the Game Designer signs par off for display, the format is fixed in advance so no new layout work is needed: `moves 4 / par 6`, same HUD slot (rank 8), `text.secondary`, tabular numerals, no colour change, no per-move delta, and **never** framed as a fail/over-par state (`level-design.md` §1: par is never a fail condition; `game-design.md` §12: no punishment). Until then, implementing a par label is out of scope.

### 5.4 Skin system (non-negotiable #3, made concrete)

```ts
// src/ui/theme/tokens.ts  — the ONLY place colours exist
export type Phase = "A" | "B";
export interface ThemeTokens { ground: {...}; obj: {...}; actor: {...}; text: {...}; hud: {...}; btn: {...}; feedback: {...} }
export const THEME: Record<Phase, ThemeTokens>;         // from §4.3
export function theme(phase: Phase): ThemeTokens;        // single lookup
export function cssVars(phase: Phase): Record<string,string>; // same object -> --ps-*
```

- Renderer, entities and DOM read `theme(phase)`. **Forbidden:** `if (phase === "A") { … } else { … }` with colours/sizes inside; duplicated `LevelSceneA` / `LevelSceneB`; per-phase scene files; per-phase prefabs.
- The phase flip is a **token swap + tween**, not a scene change (§6).
- Adding a new visual = adding a token, not adding a branch.
- Recommended enforcement (QA-owned): a grep/import-boundary test asserting no hex literal (`/#[0-9A-Fa-f]{6}/`) and no `phase === "A"` comparison inside `src/game/**` and `src/ui/**` outside `theme/tokens.ts`.

---

## 6. Phase-transition feedback direction

**Design intent:** the flip is the game's signature beat. It must feel like the *world* changed, be over before the player's next thought, and never hide what changed. Cheap, deterministic, skippable.

### 6.1 Budget

| Item | Budget |
|---|---|
| Total flip sequence | **≤ 220 ms** (hard cap 250 ms) |
| Input lock during flip | **0 ms** — the next input is accepted and buffered immediately |
| Concurrent tweens | ≤ 25 |
| Full-screen effects | cross-dissolve of background + plate tint only |
| Particles | **0** in prototype (deferred in manifest) |
| Shaders / blur / bloom | **forbidden** |

### 6.2 Sequence (fixed order — matches `applyMove`: move in current phase → resolve → flip)

| t (ms) | What happens | Cheap how |
|---|---|---|
| 0–130 | **Player hop** to the target cell: 130 ms, `easeOutQuad`, arc height `cellSize * 0.12`, squash ≤ 6 % on landing | 1 tween on position + 1 on scale |
| 60–200 | **Token cross-fade**: `ground.*`, `obj.*`, `text.*`, HUD CSS vars lerp A→B (or B→A), 140 ms `easeOutQuad` | colour lerp on cached tint values; CSS transition on `--ps-*` |
| 80–200 | **Wall state swap (R-E6)**: walls never enter or exit — each wall tile whose *state* changes cross-fades `wall ↔ wallEcho` (**fill rule solid ↔ hollow** + tokens + footprint 88 ↔ 80 % + edge on/off + tint on/off + notch knockout), 120 ms, stagger ≤ 15 ms by distance from the player. Doors keep their own open/closed swap. **No sprite is created or destroyed by a flip.** | 2 tweens per changed tile only (tint + scale) — diff the object list, never re-tween the whole board |
| 100–220 | **Background cross-dissolve** A-04 ↔ A-05, 120 ms, alpha only (both textures preloaded) | 2 sprites, alpha tween |
| 140–220 | **Occupied resolution (R-C13, new V0.4)**: if the player's tile just became a solid wall, its interior cross-fades to `obj.wallOccupied` (edge stroke switches on at every cell size) and the one-shot `fx.phaseRing` pulses around the player — 2 px stroke, 180 ms, scale 0.7 → 1.0. If the tile became a ghost instead, nothing extra happens (the normal swap covers it). | 1 tint tween + 1 ring tween, player's tile only |
| 140–220 | **Phase chip swap** in the HUD: icon cross-fades sun ↔ crescent, chip background token swap; `aria-live="polite"` announces 白昼/Light or 夜晚/Shadow | DOM class toggle |
| — | Win check fires **after** the flip resolves; win flash is a plate tint (L7), 180 ms, never per-cell | no extra pass — reuses the L7 plate tint |

### 6.2a Causality rule — the 60 ms lead, and Variant CL (LOW-5)

The token cross-fade deliberately **starts at 60 ms, while the hop is still in the air (0–130 ms)**. Rationale: the two events must feel like *one* beat, and the total budget must stay ≤ 220 ms. The risk is the opposite of lag — if the world changes before the player's foot lands, a new player may not attribute the flip to their own move, which is exactly the lesson L2 exists to teach (`level-design.md` §2: "the flip happens *because I moved*").

**Default (Variant S — simultaneous, shipped in V0.3):** as tabled above, fade lead 60 ms, total ≤ 220 ms.

**Variant CL (causality-locked) — pre-specified fallback, no redesign needed if triggered:**

| t (ms) | Variant CL |
|---|---|
| 0–130 | Player hop, unchanged |
| **130–250** | Token cross-fade starts **at hop-landing**, shortened to 120 ms |
| 140–250 | Wall state swap, 110 ms |
| 150–250 | Background cross-dissolve, 100 ms |
| 180–250 | Phase chip swap |

Total 250 ms = exactly the hard cap of §6.1, still with **0 ms input lock** (§6.1) and the same snap-to-target rule (§6.4).

- **Trigger (measured, not opinionated):** in the Stage-2 comprehension test, ask a fresh viewer after L2 "why did the world change?" If **fewer than 4/5** answer "because I moved" (i.e. they answer "automatically", "on a timer" or "I don't know"), switch to Variant CL. Recorded in `docs/playtest-log.md` by the Playtest Analyst.
- **Implementation:** the two variants are **one timing table**, not two code paths — `FLIP_TIMING: Record<"S" | "CL", FlipTimings>` in `src/ui/theme/tokens.ts` (or the renderer's single timing module). Choosing a variant changes data, never branches.
- Reduced-motion (§6.4) collapses both variants to the same 60 ms token swap; causality there is carried by the move itself, not by timing.

### 6.3 Prohibited (delete on sight)

Full-screen white/black flash · gaussian blur or depth-of-field over the board · colour grade that covers cells · pulsing vignette · screen shake > 2 px · any shake at all on a legal move · particles over the player cell · trail/afterimage that lingers > 250 ms · "PHASE SHIFT!" text banner · any transition that locks input · any transition longer than 250 ms · sound longer than 250 ms · **any reactive flash/pop on the solid wall that caused a refusal** (the cause is permanently visible at full emphasis — §6.5; a flash after the fact reads as scolding) · **any idle animation on a ghost** (R-C8, R-E5) · **any treatment drawn over the player sprite while the player occupies a wall tile** (R-C13.1) · **a looping phase ring** — it fires once per flip resolution, never while standing (R-C13.4).

### 6.4 Interruption & determinism

- Animation is a **view of state, never a source of it**. The renderer tweens toward `GameState`; if a new move arrives mid-flip, running tweens **snap to their target** and the new sequence starts (animation queue depth = 1). No tween may be allowed to finish "later" and desync from state.
- Fast repeated taps must never produce visual lag accumulation. Test: 10 taps in 1.5 s → final rendered board == final `GameState` (QA regression).
- `prefers-reduced-motion: reduce` → all tweens collapse to a single 60 ms token swap, no hop arc, no object scale, background swaps instantly. Legibility identical, motion removed.
- Audio (if any): one soft 120 ms "flip" cue per legal move, one muted thud-free 90 ms cue on illegal move, both ≤ −18 LUFS relative, no music layer in the prototype.

### 6.5 Illegal move feedback (design: no movement, no flip)

- 90 ms **nudge**: the player sprite translates 4 px toward the blocked cell and returns; `feedback.deny` tints the *player ring only* at 0.5 alpha for 90 ms.
- **No** board-wide flash, **no** shake, **no** red X, **no** sound sting louder than the legal-move cue, **no** text. The player must never feel punished; the world simply does not change (design §12: comprehension over punishment).
- **The cause is on the board at full emphasis.** Under Option B (V0.4) a move is refused **only** when the destination is solid *in the current phase* — a full-strength filled `wall`, the highest-emphasis obstacle on the board. The refusal is therefore legible before the tap: the nudge points at a filled block, and the phase visibly does **not** flip — "the world did not change" is the primary cue (§3.3 test 7b). The V0.3 text (refusals caused by visible echo tiles) is void: **ghosts never refuse anything**.
- Tapping a **non-adjacent** cell is not an illegal move — it is a non-input. Nothing happens, no feedback, no penalty. Tapping/swiping toward an **adjacent ghost (`wallEcho`) is a LEGAL move** (R-E5): the player enters, the flip solidifies the tile under them, and the R-C13 presentation applies — **no** nudge, **no** deny feedback. Any implementation that refuses a ghost entry is a V0.3-era bug, not a design.
- If Stage-2 §3.3 test 7 fails, the fix is **solid↔ghost separation inside the R-E bands** (footprint pair up to 88 ↔ 76 %, ΔL\* up to 18, tint band R-E2a) — **never** a bigger nudge, a sound sting, a flash or text.

---

## 7. DOM / HUD overlay vs canvas split

### 7.1 Split rule

| Layer | Technology | Owns | Never owns |
|---|---|---|---|
| **Canvas** (Phaser, `src/game/renderer/**`) | WebGL/Canvas | background image, board plate, cells, grid lines, walls (**active + `wallEcho`**), doors, portals, switches, goal, player, flip tweens, deny nudge, win tint | any text, any button, any dialog, any scrollable region |
| **DOM overlay** (`src/ui/**`) | HTML + CSS | level label, move counter, phase chip, Undo / Restart / Sound / Next buttons, win dialog, hint line, focus rings, `aria-live` announcements | board rendering, per-cell visuals, anything inside the board rect |

Rationale (matches architecture §9): text stays crisp and accessible on mobile at any DPR, native focus/keyboard/screen-reader support comes free, and 44 px targets are CSS-cheap. Canvas text at mobile DPR is a readability tax we refuse to pay.

### 7.2 Data flow

```
Core (pure) ──emits──> typed event bus ──> Renderer (canvas)   [visual only]
                                    └────> DOM UI (src/ui/**)   [text/buttons only]
```

- DOM subscribes to `move`, `phaseChanged`, `levelWon`, `undo`, `restart` — the **same** bus as the renderer. DOM **never** reads `GameState` per frame and never imports Phaser.
- DOM dispatches *intents* (`undo()`, `restart()`, `next()`); it never mutates state. One truth source stays in core.
- Tokens reach the DOM as CSS custom properties from `cssVars(phase)`; a phase flip is one `data-phase="A|B"` attribute on `<body>` plus a CSS transition — no per-element JS styling.

### 7.3 Overlay layout contract

- The overlay root is `position: fixed; inset: 0; pointer-events: none;`. **Every** interactive control re-enables `pointer-events: auto` on itself only. A full-screen `pointer-events: auto` overlay above the board is a bug (it eats taps).
- The board rect is reserved: no DOM element may intersect it, in any orientation, at any viewport (verified by Playwright bounding-box assertion — QA).
- Safe areas: `padding-top: env(safe-area-inset-top)`, `padding-bottom: env(safe-area-inset-bottom)`, left/right insets in landscape. `viewport-fit=cover` in the meta tag.
- HUD bars use flex with fixed heights (56 / 72 px); the play area is `flex: 1` and the canvas is sized from the play-area box, never from `window.innerWidth` alone.

### 7.4 Accessibility minimum

- Real `<button>` elements, visible focus ring using `accent` at ≥ 3:1 against the bar.
- Keyboard: arrow keys + WASD → `MOVE(dir)`; `Z` → undo; `R` → restart; `Enter` → next on win. Same logical actions as touch — one interaction model (design §6).
- `aria-live="polite"` region announcing phase (`白昼 / Light`, `夜晚 / Shadow`) and win. Phase chip has `aria-label`, icon-only visually.
- No information conveyed by colour alone anywhere, including the HUD (R-C1). On the board the concrete cases are the door sun/crescent glyph and the **`wallEcho` knockout notch** (§3.1a) — both name the owning phase without colour, and both are the reason `wall ↔ wallEcho` and `A-door ↔ B-door` survive CVD simulation.
- Reduced-motion honoured (§6.4).

---

## 8. Touch targets (hard floor ≥ 44 px)

| Control / element | Minimum | Target | Gap to neighbour | Notes |
|---|---|---|---|---|
| Board cell (tap-to-move) | **44 px** (floor 40 px) | **≥ 56 px** | n/a | ≥ 44 px guaranteed by the R-L2 grid cap **except** one flagged case: 320 px viewport on a 7 × 7 grid = 41.1 px (above the 40 px floor → R-T5). Hit area = full cell; a ghost (`wallEcho`) tile is a **legal** tap target and resolves to a successful `MOVE(dir)` (R-E5); only current-phase solid tiles are refused |
| Undo | 44 × 44 | **48 × 48** | ≥ 8 px | bottom bar, thumb-reachable left |
| Restart | 44 × 44 | **48 × 48** | ≥ 8 px | bottom bar, right of Undo — **one tap, no confirm dialog** (R-T2) |
| Next (win) | 44 × 44 | **48 px tall, ≥ 160 px wide** | ≥ 8 px | primary button, dominant thumb side |
| Sound toggle | 44 × 44 | 44 × 44 | ≥ 8 px | top bar corner; icon 24 px inside a 44 px target |
| Phase chip | 44 px tall (non-interactive) | — | — | indicator only; must not be a button (there is **no** manual phase switch — design §3) |
| Win dialog dismiss | 44 × 44 | 48 × 48 | — | whole dialog backdrop is *not* a tap target (prevents accidental skip) |

**Rules:**

- **R-T1.** No interactive element below **44 × 44 CSS px**. Visible glyph may be smaller (24 px) as long as the *hit box* is ≥ 44 px, achieved with padding, never with `transform: scale`.
- **R-T2.** ≥ **8 px** clear gap between adjacent targets. **`Restart` is one tap, with no confirm dialog and no penalty, at any point in a level** (`level-design.md` §4: "Restart is instant, one tap, penalty-free"; `game-design.md` §6: Undo/Restart are quality-of-life, not mechanics).
  - *Why no dialog:* Restart is not an irreversible control here — no score, no currency, no timer, no move limit, no fail state (`game-design.md` §12, `level-design.md` §4). The worst mistap outcome is replaying a board the player has already read once, and Restart is explicitly framed as an **experimentation tool** ("every refusal is information"), never as a loss. A dialog would cost more than the mistake.
  - *Also forbidden structurally:* a confirm dialog is a **new dialog/screen**, which §0.5 prohibits and the §1 inventory does not contain (prototype = 1 screen + 1 dialog).
  - *If Stage-2 playtest shows real mis-taps:* the fix is **layout** (Undo↔Restart gap 8 → 12 px, or Restart to the far corner of the bar) — never a dialog.
- **R-T3.** Cell hit area = the cell rect exactly. **No outward slop** that would make a non-adjacent cell tappable; up to 4 px slop is allowed *inward* from board edges only.
- **R-T4.** Swipe threshold: **≥ 24 px** travel and ≤ 500 ms, dominant axis wins; below threshold it is treated as a tap. Tap and swipe resolve to the same `MOVE(dir)` — no gesture combos (design §6).
- **R-T5.** Sub-44 px cells are exactly two cases (§2.3 table): **7 × 7 on a 320 px viewport = 41.1 px** (in-spec, ≤ 7 × 7 cap), and **8 × 8 on a 360 px viewport = 41.0 px** (only reachable with Orchestrator approval, R-L2). In those cases the app shows a **one-time** non-blocking hint that swipe is available, and cell hit areas expand to include the swipe gesture over the whole board. **8 × 8 on a 320 px viewport (36.0 px) is below the 40 px floor**, and **9 × 9 falls below the floor at 320 / 360 / 390 px (32.0 / 36.4 / 39.8 px)** — both are rejected by the layout validator, and 9 × 9+ is rejected outright by R-L2 on mobile portrait. A level that cannot be laid out at ≥ 40 px on every supported viewport does not ship.
- **R-T6.** Desktop: hover shows a 2 px `accent` ring on **legal** adjacent cells. Under Option B (V0.4) an adjacent **ghost (`wallEcho`) tile IS legal** and gets the hover ring — the V0.3 exclusion (union property, ADR-0006) is void. Only current-phase **solid** tiles are excluded: a ring there would promise a move the rules refuse. Hover must not change hit areas, and hover state must not be the only cue (touch has none).
- **R-T7.** Bottom-bar controls sit inside the thumb arc: ≤ 96 px from the bottom edge (before safe inset), never in the top corners on mobile.

---

## 9. DEV PLACEHOLDER rules (prototype only)

Placeholders exist so logic, layout and readability can be built **before** the ASSET GATE clears. They are never final art.

### 9.1 What is a placeholder vs what is vector-by-design

| Element | Status | Source |
|---|---|---|
| Board plate, cells, grid lines | **vector by design** (not a placeholder) | tokens §4.3 — ships as-is |
| Walls (solid **and** ghost `wallEcho`), occupied-wall treatment (R-C13), doors, switches | **vector by design** | manifest defers wall/door textures to Stage 5 polish; the ghost is stroke + flat tint (§3.1a) and the occupied treatment is a derived token, so **no asset is requested for either** and none may be added without a new `asset-request` |
| Background (A-04 / A-05) | **DEV PLACEHOLDER** → solid `ground.page` colour | art |
| Player (A-03) | **DEV PLACEHOLDER** → filled circle + `actor.ring` | art |
| Goal (A-06) | **DEV PLACEHOLDER** → hollow ring + centre dot | art |
| Portals (A-06) | **DEV PLACEHOLDER** → diamond outline | art |
| Buttons / icons / panels / chips (A-07) | **DEV PLACEHOLDER** → CSS-only: rounded rect, system font label, inline SVG-free shapes | art |
| Cover (A-01), logo (A-02) | **DEV PLACEHOLDER** → nothing shown; boot uses `ground.plate` only | marketing |

### 9.2 The seven placeholder rules

- **R-P1 — Plain geometry, solid colour.** Placeholders are rectangles, circles, rings and diamonds filled with **real theme tokens** (§4.3). No gradients, no textures, no images, no downloaded art, no emoji. Using the real tokens is mandatory: it validates the contrast decisions *now*, so integration cannot silently break readability.
- **R-P2 — Labelled in code.** Every placeholder carries the comment tag `DEV PLACEHOLDER — <AssetID>` at its construction site (e.g. `// DEV PLACEHOLDER — A-03 echo_spirit_a`).
- **R-P3 — Labelled on screen (dev builds only).** A corner badge reads `DEV PLACEHOLDER ART — NOT FINAL`, plus a `?placeholders=1` query flag that draws each placeholder's Asset ID under it. Both are hidden when `import.meta.env.PROD`.
- **R-P4 — No placeholder binaries in `assets/`.** Placeholders are generated at runtime by code (`src/game/renderer/placeholder/**`, CSS for the DOM). Nothing placeholder-shaped is ever committed under `assets/art/**`, and no placeholder may be registered in the manifest as DELIVERED.
- **R-P5 — One lookup table.** `PLACEHOLDER_TO_ASSET` maps every placeholder to exactly one manifest Asset ID. Integration = swap the texture key by Asset ID; no scattered file paths.
- **R-P6 — Production gate.** The release build runs `assertNoPlaceholders()` at boot and **throws**, listing unresolved Asset IDs. Shipping a placeholder is a build failure, not a review comment.
- **R-P7 — Evidence honesty.** Any screenshot, playtest log or analysis captured with placeholders must be labelled `placeholder art` in `docs/playtest-log.md` / `docs/playtest-analysis/**`. **No readability conclusion about the final art may be drawn from a placeholder screenshot** — final art carries grain, glow and internal detail that placeholders do not; §3.3 QA is re-run after integration.

---

## 10. Responsive & performance budget

| Item | Budget |
|---|---|
| Frame rate | 60 fps on a mid-range mobile (target device class: 2020-era Android, 4× CPU throttle test) |
| Draw calls per frame (board) | ≤ 40 (batch cell plates; walls/doors share a texture atlas region) |
| Board object count | up to **2 ×** the wall count once echoes render (a tile can be a wall in one phase only, so at most one of `wall`/`wallEcho` per tile — the 2 × figure is the union of both phases' wall lists). Echoes reuse the **same** wall texture region with a tint + scale, so the draw-call budget above is unchanged; if a level's total wall+echo count pushes the board past 40 draw calls, batching is fixed first and the level is not re-skinned. |
| Concurrent tweens | ≤ 25 (flip peak) |
| Texture memory | ≤ 12 MB total: backgrounds 1920×1080 ×2, sprites 512² ×5, UI sheet 2048² → all downscaled to the sizes in §11 |
| Particle systems | 0 |
| Shaders / post-processing | 0 |
| Webfont | 0 |
| Audio | ≤ 3 short cues, ≤ 200 KB total, optional |

Breakpoints: 320 / 360 / 390 / 414 / 768 / 1024 / 1440. Layout is fluid inside the frame budget of §2.2; there are no per-breakpoint component swaps.

---

## 11. Asset integration contract (ASSET GATE hand-off)

| Asset ID | File(s) expected | Integrated size in game | Layer | Blocks |
|---|---|---|---|---|
| A-01 | `cover_hero_1920x1080.png` | marketing only (README / landing) | — | nothing in-game |
| A-02 | `logo_primary.png`, `logo_mark.png` | mark ≤ 96 px (top bar), primary ≤ 640 px (boot/win) | L8 DOM | nothing in-game |
| A-03 | `echo_spirit_a.png`, `echo_spirit_b.png` | `cellSize * 0.70` | L5 actor | **Stage 2 readability test** |
| A-04 | `bg_phase_a_1920x1080.png` | cover-fit to play area | L1 | **Stage 2 readability test** |
| A-05 | `bg_phase_b_1920x1080.png` | cover-fit to play area | L1 | **Stage 2 readability test** |
| A-06 | `goal.png`, `portal_a.png`, `portal_b.png` | `cellSize * 0.66 / 0.72` | L4 objects | goal → **Stage 2**; portals → Stage 5 (L36) |
| A-07 | `ui_kit.png` → 12 exports (**11 integrated**; `icon_back` is RESERVED, see below) | icons 24–48 px, buttons ≤ 320 px wide, panel 9-slice | L8 DOM | UI polish (Stage 4+) |

**`icon_back` — RESERVED, no consumer (LOW-6).** The prototype has **no back navigation**: no lobby, no level select, no settings tree (§0.5, §1) — the app enters at a level and the only forward control is `Next` on win. The icon therefore:

- **stays in the A-07 export list** so the delivered sheet remains whole and the user's generation pass is unchanged (no prompt is edited — see `docs/assets/asset-request-07-ui-kit.md`, all prompts frozen);
- is **not** registered as integrated, **not** wired to any control, and **not** listed in `PLACEHOLDER_TO_ASSET`;
- may only gain a consumer through a design change that adds a screen — which §0.5 forbids in the prototype. If that ever happens, this row is updated first, then the icon is integrated.

**No asset is requested for `wallEcho` or the occupied-wall treatment.** Both are vector-by-design (§9.1): the ghost = `obj.wallEcho` stroke + flat `obj.wallEchoFill` tint + knockout notch; the occupied state = `obj.wallOccupied` interior + retained edge + the derived one-shot `fx.phaseRing` — all drawn by the wall/actor renderers from tokens. Requesting "ghost wall" art would violate R-C7 (no texture inside cells) and R-E4 (strict subordination). **The 11-image GATE A batch is unaffected by the Option B rule change** — walls, ghosts and flip feedback are program-drawn vectors, not bitmaps (stated identically in `docs/assets/codex-generation-brief.md` §6, which this task did not edit).

Integration procedure (Agent 5, on delivery): **inspect → validate style/transparency/resolution → rename to the manifest path → register in `docs/assets/asset-manifest.md` (status DELIVERED + delivered filename + date) → swap the texture key via `PLACEHOLDER_TO_ASSET` → re-run §3.3 readability QA → record in `docs/iteration-log.md`.**

Delivery validation checks: PNG-24/32; transparency actually present where required (alpha channel, not a white box); ≥ requested resolution (upscaling accepted, upscaling *by the generator* flagged); no baked text; no watermark; hue family inside the §4.1 palettes; A-04/A-05 centre 60 % low-detail; A-03 form A not pure white (§4.2 risk); A-06 portals identical in silhouette.

---

## 12. Risks & open questions

| # | Risk | Mitigation |
|---|---|---|
| R1 | Phase A background art arrives busier than spec → cells lose contrast | R-L4 plate opacity + scrim; reject only if the centre 60 % cannot be calmed |
| R2 | **A-03 form A is specified as an ivory/gold glow** — on a near-white Phase A cell that is 1.30:1 without help | R-C9 auto contrast ring (`#4A3216`, 11.74:1); if the delivered sprite is pure white, request a deeper-gold variant via a new asset-request (never silently re-prompt) |
| R3 | Delivered art carries internal detail that breaks the "one class, one silhouette" read | §3.3 QA re-run post-integration; silhouette check at 48 px |
| R4 | DOM overlay drifts over the board on odd viewports / keyboard open | R-T + Playwright bounding-box assertion; `visualViewport` resize listener |
| R5 | Tween queue desyncs from `GameState` on fast tapping | §6.4 snap-to-target rule + 10-tap regression test |
| R6 | Placeholder screenshots get read as final-art evidence | R-P7 mandatory labelling |
| R7 | **V0.3 side-effect:** lightening B `obj.wall` to `#A795EE` narrowed its value gap to `obj.switch` B `#C79BE8` (CR 1.62 → **1.14**, simulated hue distance 0.13 → 0.04) | M3 switches are **optional and not shipping by default** (`game-design.md` §5, `level-design.md` §1). Shape already separates them (88 % filled square vs 40 % hollow outline). **If M3 ever ships, `obj.switch` Phase B must be re-tuned away from the wall value before integration** — tracked here so it cannot be forgotten. |
| R8 | Ghost clutter / subtlety: a dense board carries up to 2 × wall graphics, and the *felt* solid↔ghost difference may be too subtle on a real device | R-C2 **fill-rule axis** (filled block vs hollow stroke + tint — greyscale/CVD-proof) + R-E2/R-E2a numeric contracts + R-E4 subordination + R-L2's ≤ 7 × 7 authored cap + §3.3 tests 5/6 re-run at Stage 2. Tuning happens **inside** the R-E bands, never by removing or re-solidifying the ghost state. |
| R9 | **(inverted in V0.4)** Ghost misread as *blocking* (player avoids legal moves, board feels unfair) **or** solid wall misread as ghost (player taps into refusals) | R-C2 fill-rule axis is the primary separator; the knockout notch names the owning phase at `cellSize ≥ 56`; §3.3 tests 5/6 score **currently-solid only**, so either misread fails the gate measurably. Tuning inside R-E/R-E2a bands. |
| R10 | **(new V0.4)** Player standing inside a solidified wall reads as a clip-through/stuck bug ("am I trapped?") | R-C13: player always on top, occupied interior drop (≥ 1.8:1 CR change), edge stroke retained at every cell size, one-shot `fx.phaseRing` at flip resolution; §3.3 test 8 gates it ("part of the game, not a bug" ≥ 4/5). The rules guarantee an exit — the origin tile is never re-checked and every legal move flips the phase (**ADR-0008 rules 3–4**). |

**Open questions (need Game Designer / Orchestrator input):**

- **OQ1 — ANSWERED for V0.3, ⚠ pending Game Designer sign-off.** HUD shows a **plain move count only, no par** (§5.3). `par` remains a Solver/difficulty field in the level schema and is not displayed. This resolves the contradiction with `level-design.md` §1 ("displayed as the perfect-clear target") in favour of the simpler UI; the pre-agreed display format if the designer signs par off is `moves 4 / par 6` (§5.3). **Owner of the ruling: Game Designer.**
- **OQ2.** Is a `hintTarget` highlight allowed at all? Default (V0.1, unchanged in V0.3): **not implemented** (design §9 says teach by observation, not by pointing). Token reserved. *Note: `wallEcho` is not a hint* — it is permanent board state (ADR-0007), rendered in every level from L1, so it does not reopen this question.
- **OQ3.** Win dialog copy: one line maximum. Needs the designer's wording (bilingual CN/EN), must not explain the mechanic ("你发现了…！" is forbidden by design §9). Must not contain par (§5.3).
- **OQ4 — CLOSED (2026-10-14).** Confirmed constraint: authored grids are **≤ 7 × 7**; **8 × 8 only with explicit Orchestrator approval** (and then only under R-T5); **9 × 9 and larger are rejected** on mobile portrait. Handed to Level AI + Solver as a generator constraint (R-L2) and matched by the schema cap being tightened in `docs/level-design.md` §1 in parallel (`width`/`height` authored range 3–7). Evidence: §2.3 cell-size table — the 40 px absolute floor holds at every supported viewport for ≤ 7 × 7.
- **OQ5 — CLOSED by ADR-0008 (opened V0.4, UA-0003; resolved by Orchestrator cross-reference pass 2026-10-14).** The GATE C Option B decision voids ADR-0006's post-flip standing check and ADR-0007's rationale ("never enterable ⇒ input failure"). Both are now recorded: **`docs/decisions/0008-phase-solidity-entry-only.md` (Accepted)** partially supersedes 0006 and revises 0007, `game-design.md` V0.4 §3.1 and `architecture.md` V0.4 §6 carry the rule, and `level-design.md` V0.3 rewrote the L3/L4 refusal-as-tutorial ladder with **OQ-1 marked RESOLVED**. **Still open and owned elsewhere:** the Solver must re-verify every level (L1–L50) under the new legality — all pre-ADR-0008 solver results are void (ADR-0008 Consequences). This spec is written **only** for Option B — if the decision is ever reverted, §3.1/§3.1a/R-C13 revert to the V0.3 text.

---

## 13. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial UI/UX spec: layout & cell-size floor, readability contract, measured Phase A/B token map, visual hierarchy, flip feedback budget, DOM/canvas split, ≥44 px touch targets, DEV PLACEHOLDER rules, asset integration contract | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.3 | **RV-001 reconciliation (UA-002).** **B-1:** §3.1 "phase-inactive objects are absent / never render ghost walls" **superseded** by the `wallEcho` state + binding contract §3.1a (R-E1…R-E8), implementing **ADR-0007**; presentation-only, core rule untouched. New tokens `obj.wallEcho` A `#8E7C5D` (3.98:1) / B `#7C77AE` (3.47:1); B `obj.wall` re-tuned `#8A78D6` → `#A795EE` (3.90 → 5.56:1) to open a legal value band — record in §4.3, measurements in §4.4/§4.6; R-C1/C2/C3/C5/C6/C7/C8/C10 updated, R-C12 added. §5.1 rank 4, §5.2 L4 note, §6.2 wall state swap, §6.3 two new prohibitions, §6.5 cause-is-visible, §9.1 + §10 + §11 echo notes, §3.3 tests 6–7, risks R7–R9. **M-5a:** R-T2 Restart confirm dialog deleted (one tap, no dialog). **M-5b:** par removed from the HUD (§5.3), OQ1 answered pending designer sign-off. **LOW-5:** §6.2a causality rule + Variant CL timings and measured trigger; R-L2 reworded (40 px floor everywhere, 44 px except 320 px/7×7); §2.3 390 px/9×9 marker corrected ⚠ → ✗; §8 cell row and R-T5 made exact. **LOW-6:** `icon_back` RESERVED (§11 + manifest). **OQ4 closed:** authored grids ≤ 7 × 7, 8 × 8 only with Orchestrator approval. | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.4 | **GATE C human decision — core rule Option B (UA-0003).** Walls block **entry only, current phase only, never crush**; the **union property is void**. Presentation semantics revised: §3.1 rationale rewritten (ADR-0007's "input-failure" argument invalidated; ghosts now mandatory for **flip anticipation** + passable/blocking axis); §3.1a `wallEcho` re-semanted as the **passable ghost** — hollow treatment (2 px `obj.wallEcho` stroke + flat `obj.wallEchoFill` tint, 80 % footprint), **R-E3 flipped**, **R-E5 flipped (ghost = legal destination / affordance)**, R-E2/R-E2a/R-E4/R-E6/R-E8 updated; R-C1/R-C2/R-C7 corrected (ghost on the hollow side of the fill axis). **New R-C13** — player legally standing inside a solid wall tile: player on top, `obj.wallOccupied` interior + retained `obj.wallEdge`, one-shot `fx.phaseRing` (boot-derived), ≤ 220 ms budget, no hidden state. New tokens `obj.wallEchoFill` A `#BBB09B` (2.11:1) / B `#585786` (2.12:1), `obj.wallOccupied` A `#AFA491` (2.42:1) / B `#6B64A4` (2.71:1), `fx.phaseRing` A `#4A3216` (4.86:1 vs occupied) / B `#7FD8D0` (3.17:1) — offline computation record in §4.3, measurements §4.4/§4.6. §3.3 tests 5–7 rewritten (union scoring deleted; test 7 adds "phase did not flip"), **test 8 added** (player-in-wall). §5.1, §6.2 (new 140–220 occupied-resolution row), §6.3, §6.5, §8 (cell row + R-T6: ghosts get the hover ring), §9.1, §11, §12 (R8/R9 updated, R10 added), OQ5 added (superseding ADR-0008 pending — Game Designer/Architect). **Asset impact: none — the 11-image batch needs no regeneration** (vector walls, G-6). | Agent 5 (UI / UX / Art Director) |
