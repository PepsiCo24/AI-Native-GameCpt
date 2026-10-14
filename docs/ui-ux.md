# UI / UX Spec — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 5 — UI / UX / Art Director**
> Version: **V0.3**
> Date: 2026-10-14
> Status: **LOCKED for prototype** (visual token values may be re-tuned only with a screenshot-review record)
> Governs: `src/ui/**`, `src/game/renderer/**`, `src/game/scenes/**` (visual layer only), `docs/assets/**`
> Read-only inputs: `docs/game-design.md` (§3, §6, §7, §9, §12), `docs/level-design.md` (§0–§4), `docs/architecture.md` (§9, §10, §11), `docs/decisions/0006`, `docs/decisions/0007`

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

Every cell is exactly one of: `empty`, `wallA(active|echo)`, `wallB(active|echo)`, `doorRed(open|closed)`, `doorBlue(open|closed)`, `portalA`, `portalB`, `switch(on|off)`, `goal`, plus overlays `player`, `playerOrigin` (last-move ghost, optional), `hintTarget` (only if the designer enables a hint).

A phase wall is **one object with two render states**, never an object that appears and disappears:

- **`wall` (active)** — the wall belongs to the current phase: full-strength solid.
- **`wallEcho` (other-phase)** — the wall belongs to the *inactive* phase: rendered anyway, as a low-emphasis but clearly visible silhouette (**§3.1a**, ADR-0007).

Doors, portals and switches keep their own open/closed and active/inactive treatments; `wallEcho` is defined for **walls** in V0.3 (the same `*Echo` pattern is **RESERVED** for an inactive portal at L36/M2 — token name reserved, not implemented, no art requested).

**Why the V0.1 ban was wrong (superseded text: "phase-inactive objects are absent … never render ghost walls").** Under ADR-0006 a move is refused when resolving it would leave the player standing on a wall *in the phase the move flips into*, and the **union property** makes such a tile permanently impassable. If the other-phase wall is not drawn, the player taps a tile that looks empty, nothing happens, and the refusal reads as **broken input** — the worst possible outcome for a game whose tutorial *is* its refusals (`level-design.md` §2 L3/L4, §4; ADR-0006 Consequences: "Refused moves need unmistakable feedback … or they read as input failure"). Rendering the echo makes every refusal **predictable and caused**: the player can see the obstacle before tapping it.

**This changes no rule.** Legality, the flip, `applyMove` and determinism are untouched; `wallEcho` is *derived render state* computed from the same single `GameState` (ADR-0002 / ADR-0004 / architecture-0001 unaffected, ADR-0007 scope note). It adds information — it never hides cell state, so non-negotiable #1 is satisfied, not violated.

### 3.1a `wallEcho` — the binding visual contract (ADR-0007)

| Property | `wall` (active) | `wallEcho` (other phase) | Channel used |
|---|---|---|---|
| Silhouette | filled rounded square | **filled rounded square** (same class silhouette, R-C1 / R-C10) | shape — identical |
| Footprint | **88 %** of cell | **80 %** of cell | size (greyscale- and CVD-proof) |
| Fill | `obj.wall`, flat | `obj.wallEcho`, flat — **muted, same hue family, different value** | **value** |
| Edge | `obj.wallEdge`, 2 px, only at `cellSize ≥ 56` | **none** | presence/absence |
| Phase notch | none | **knockout sun/crescent** (the R-C1 door glyph language: crescent on an echo while Phase A is active, sun while Phase B is), `cellSize * 0.30` box, only at `cellSize ≥ 56` | glyph |
| Corner radius / gutter | R-L3 | R-L3 (same derivation) | — |

Hard rules:

- **R-E1 — ≥ 3:1 always.** `obj.wallEcho` reaches **≥ 3:1 against the *worse* of `ground.cell` and `ground.cellAlt`** (not just the primary cell colour). Measured: A **3.98 / 3.38**, B **3.47 / 3.05** (§4.6). An echo must be findable at a glance — never "invisible unless you squint" (ADR-0007).
- **R-E2 — Separated from the active wall by value, never by hue.** Requirement: **ΔL\* ≥ 12** *and* **desaturated (greyscale) CR ≥ 1.55:1** between `obj.wall` and `obj.wallEcho` in the same phase. Measured: A **ΔL\* 13.1 / grey 1.61:1**, B **ΔL\* 14.0 / grey 1.60:1** (§4.6). A value step cannot be destroyed by a dichromat simulation, so this pair is **CVD-safe by construction** (R-C6) and survives the greyscale test (§4.4). Hue is *not* used to distinguish them.
- **R-E3 — Still solid, still blocking.** Under the union property an echo tile is **never a legal destination**, so it keeps the *filled* treatment. It must **not** become hollow or outline-only: R-C2's "solid = blocks, hollow = passable" axis is load-bearing and an echo sits on the blocking side of it.
- **R-E4 — Low emphasis, strictly subordinate.** An echo may never be brighter, larger, higher-contrast or more saturated than an active wall of the same phase (§5.1 rank 4). The **notch is a knockout to `ground.cell`**, so its contrast equals the fill's own CR (A 3.98 / B 3.47) and needs no extra token.
- **R-E5 — Information, not affordance.** Echoes never animate on idle (R-C8's single attention magnet stays the goal), never get a hover state, and have **no input handler of their own**: tapping an adjacent echo tile goes through the normal `MOVE(dir)` path and is refused by the core rules, with feedback per §6.5.
- **R-E6 — The flip is a state swap, not an add/remove.** On a phase flip a wall tile cross-fades `wall ↔ wallEcho` (fill + footprint + edge + notch), in place, on the same sprite (§6.2). No wall sprite is ever created or destroyed by a flip.
- **R-E7 — Uniform language.** Echoes render in **every** level from L1 onward, including teaching levels. Two visual languages for one object class is noise (ADR-0007, rejected alternative).
- **R-E8 — One code path.** `wallEcho` is a token + a footprint constant + a glyph lookup inside the existing wall renderer. No `phase ===` branch, no second prefab, no second scene (non-negotiable #3, §5.4).

**Relationship to `level-design.md` OQ-1:** OQ-1's mitigation "tune ghost-wall visibility (UI)" now means tuning **within** this contract — the emphasis band (footprint 76–84 %, ΔL\* 12–18) — **not** adding or removing the echo state. Removing it requires a new ADR superseding 0007.


### 3.2 Encoding contract

- **R-C1 — Shape is the primary channel, colour is the phase channel, hue is the tertiary class channel.** No state may be encoded by colour alone. Each class has a unique silhouette:

| Class | Silhouette (mandatory) | Fill rule |
|---|---|---|
| empty | flat cell plate | ground colour |
| wall (active) | **filled rounded square**, 88 % of cell | solid |
| wallEcho (other phase) | **filled rounded square**, 80 % of cell, knockout phase notch at `cellSize ≥ 56` (§3.1a) | solid, muted (`obj.wallEcho`) |
| door (red / blue) | rounded square with **3 horizontal bars** + phase glyph notch (sun = red/A-active, crescent = blue/B-active) | solid bars |
| portal | **diamond outline** with inner swirl | hollow |
| switch | **small square outline**, 40 % of cell, corner dot when on | hollow |
| goal | **hollow ring**, 66 % of cell, with a small centre dot | hollow |
| player | **filled round glow** + (auto) contrast ring, 70 % of cell | solid |

- **R-C2 — Fill vs hollow is a semantic axis.** Anything that blocks movement is *solid*; anything you pass through or reach is *hollow*. The player is the only solid moving element. This alone makes the board parseable without colour. **`wallEcho` is on the solid side of this axis** (R-E3): an other-phase wall is permanently impassable under ADR-0006's union property, so it is never drawn hollow — "muted" is a *value* change, not a fill-rule change.
- **R-C3 — Contrast.** Every state-bearing graphic must reach **≥ 3:1** against the cell ground it sits on (WCAG 2.1 SC 1.4.11 non-text contrast), and against `ground.cellAlt` where the graphic can sit on a checker-alternate cell (R-E1). HUD text **≥ 4.5:1** (SC 1.4.3). Verified values in §4.3 / §4.6.
- **R-C4 — Grid lines are structure, not state.** They are exempt from R-C3 but must stay in the **1.6:1 – 2.2:1** band against the cell ground: visible enough to parse the grid, never stronger than any state element.
- **R-C5 — Nothing may cover a cell's state.** No vignette, blur, bloom, particle, glow overlay, or transition effect may reduce the state graphic's coverage below **70 % of its drawn area**, and no effect may be drawn *above* the object layer except the player and the win flash (which is a plate-level tint, not a per-cell cover). The `wallEcho` **knockout notch is part of the state graphic, not a cover**: it removes 0.09 cell² from a 0.64 cell² silhouette → coverage **86 %**, above the floor.
- **R-C6 — Colour-vision safety.** Class distinctions must survive protanopia / deuteranopia / tritanopia. The red↔blue door pair is additionally glyph-coded (R-C1) because luminance separation between red and blue is near zero for deuteranopes (measured: A doors 1.41:1 simulated CR under deutan, but 0.58 simulated hue distance — hence the mandatory glyph). `wall ↔ wallEcho` is separated on the **value axis only** (R-E2), which no dichromat simulation can collapse — see §4.6.
- **R-C7 — No texture inside cells.** Grain, paper texture and gradients belong to the *background* and the *plate*, never inside a state graphic. Textured walls are deferred in the manifest for exactly this reason. `wallEcho` is a **flat single-colour fill** — no hatch, no stripes, no dither, no transparency-over-ground (a flat token keeps contrast deterministic and unit-testable).
- **R-C8 — One attention magnet.** Exactly one element may animate on an idle board: the goal (2.4 s slow pulse, ±6 % scale, no colour change). Nothing else idles, breathes, sparkles or loops — **including `wallEcho`** (R-E5): echoes are static between moves and change only inside the flip sequence.

### 3.3 Readability QA gate (must pass before art is called "integrated")

1. **Screenshot review** at 360×640, 390×844, 1024×768 for both phases on the same level.
2. **Greyscale test** (§4.4): desaturated screenshot — a fresh viewer must name the current phase correctly, 5/5.
3. **CVD test**: same screenshots through protan / deutan / tritan simulation — every class still separable by shape, and `wall` vs `wallEcho` still separable by value (R-E2).
4. **1-second player test**: on a 390 px-wide screenshot, a fresh viewer locates the player in < 1 s, 5/5.
5. **Wall/path parse test**: viewer states which cells are blocked, ≥ 90 % correct with no explanation. **Since V0.3 this includes echo tiles** — a blocked cell is a blocked cell in *either* phase (union property), so the correct answer set is `wall ∪ wallEcho`.
6. **Echo discriminability test (new, V0.3):** on a desaturated 390 px screenshot, a fresh viewer sorts 10 wall tiles into "solid now" vs "solid in the other world", ≥ 8/10 with no explanation. Run in both phases.
7. **Refusal-cause test (new, V0.3):** after one refused move and **no** explanation, the viewer must point at the tile that caused the refusal, ≥ 4/5. This is the direct measure of ADR-0006's "refusal reads as input failure" risk and of ADR-0007's fix; it is the Stage-2 gate for `level-design.md` L3/L4.

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
| `obj.wallEcho` | `#8E7C5D` | **3.98** ✓ (3.38 vs `cellAlt`) | `#7C77AE` | **3.47** ✓ (3.05 vs `cellAlt`) | phase wall of the **other** phase (§3.1a, ADR-0007) — flat fill, 80 % footprint, no edge |
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
| `feedback.win` | plate tint `#E9C87A` @ 0.18 | — | plate tint `#C9D6FF` @ 0.16 | — | plate-level only, never per-cell cover |

- **R-C9 — Auto contrast ring.** `actor.ring` is drawn **only when `CR(actor.body, ground.cell) < 3`**, evaluated once at boot from the token map (not per frame, not per phase branch). With the current tokens this means: ring ON in Phase A (a light spirit on a light board is 1.30:1 without it, 11.74:1 with it), ring OFF in Phase B (12.52:1 already). One code path, deterministic, unit-testable.
- **R-C10 — Same class, same hue family across phases.** Goal is gold in both phases, portal is teal in both, doors are red/blue in both, **walls are sand-stone in A and violet in B in both states** (active and echo). Only *value* and *temperature* flip with the phase. This is how the player learns "that object is the same object" across a flip — it is also the rule A-06 requires of the two portal sprites.
- **R-C11 — Tokens are the only source of colour.** No hex literal may appear in `src/game/**` or `src/ui/**`. One file (`src/ui/theme/tokens.ts`) exports the map; the DOM consumes it as CSS custom properties (`--ps-*`), Phaser consumes it as colour ints. Both are generated from the same object.
- **R-C12 — Echo tokens are derived, never hand-picked per level.** `obj.wallEcho` is a single token per phase. The renderer picks `wall` vs `wallEcho` from `theme(phase)` + the tile's `phaseAWalls` / `phaseBWalls` membership — data, not a colour decision. No level, no scene and no entity may override an echo token.

> **V0.3 token re-tune record (required by the header rule).** Phase-B `obj.wall` was `#8A78D6` = **3.90:1**, the weakest state-bearing token in the whole map for the game's most important obstacle class. It also left **no room** for a subordinate echo: on a `#2A3157` checker-alternate cell, 3:1 requires figure luminance ≥ 0.203 while the old wall sat at 0.237 — a band too narrow for a visible value step (ΔL\* ≈ 3). `obj.wall` (B) is therefore lightened to **`#A795EE` = 5.56:1** (4.88:1 vs `cellAlt`), which opens a clean band for `obj.wallEcho` B = `#7C77AE` (3.47:1) at **ΔL\* 14.0**. Same hue family (violet), same phase-inversion rule (§4.2), no asset prompt touched. Phase A needed no change: `obj.wall` 6.39:1 already left room for `#8E7C5D` at 3.98:1 / ΔL\* 13.1. **Evidence status: offline WCAG computation only** — the in-app §3.3 screenshot review is still pending (no renderer exists yet), and this row is re-verified there before the tokens are called "integrated".


### 4.4 Greyscale test — measured evidence

Desaturating the V0.3 tokens completely (worst case: no colour information at all):

| Element | Phase A luminance | Phase B luminance | A↔B ratio |
|---|---|---|---|
| cell ground | 0.982 | 0.024 | **14.04:1** |
| board plate | 0.882 | 0.015 | **14.28:1** |
| wall (active) | 0.111 | 0.359 | 2.53:1 |
| wallEcho (other phase) | 0.210 | 0.205 | 1.02:1 |
| goal | 0.212 | 0.600 | 2.48:1 |

The grounds invert by more than an order of magnitude, so **the phase is identifiable in pure greyscale**, satisfying non-negotiable #2 without relying on hue. This is the single most robust phase signal in the game and must not be weakened (e.g. by darkening Phase A or lightening Phase B).

The A↔B column is *not* the interesting number for walls — what matters is the **within-phase** separation of active wall vs echo, because that is what tells the player "solid now" from "solid in the other world" with colour removed entirely:

| Phase | `obj.wall` vs `obj.wallEcho`, desaturated | Verdict |
|---|---|---|
| A | 0.111 vs 0.210 → **1.61:1** | clearly separable in greyscale ✓ |
| B | 0.359 vs 0.205 → **1.60:1** | clearly separable in greyscale ✓ |

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
| A `player` / `wallEcho` | 3.06:1 | 36.2 | 0.71 | 0.74 | 0.85 | ✓ |
| B `player` / `wallEcho` | 3.60:1 | 42.3 | 0.55 | 0.50 | 0.96 | ✓ |

**Note on the tritan 0.15 for A `wall` / `wallEcho`:** it sits exactly on the separability threshold, which is *why* R-E2 specifies this pair on the value axis (CR 1.61:1, ΔL\* 13.1) and forbids specifying it on hue. A lightness ordering cannot be collapsed by a dichromat simulation; a hue difference can. The `d` columns are confirmation, not the argument — the opposite of the door pair, which *needed* a glyph because its hue separation vanishes under deutan. Actor adjacency is safe in both phases (A 3.06:1, B 3.60:1 body-fill alone), and in Phase A R-C9's `actor.ring` is ON anyway (11.74:1), so the player's outline never depends on the fill.

**Contract restated as numbers:** `ΔL* ≥ 12` **and** `CR(wall, wallEcho) ≥ 1.55:1` **and** `CR(echo, worse ground) ≥ 3.0`. A re-tune that breaks any of the three is rejected, not shipped.

---

## 5. Visual hierarchy

### 5.1 Attention budget (strictly ordered)

| Rank | Element | Allowed motion | Allowed area |
|---|---|---|---|
| 1 | **Player (Echo Spirit)** | move hop only (§6) | 70 % of one cell |
| 2 | **Goal** | slow pulse, ±6 % scale, 2.4 s | 66 % of one cell |
| 3 | **Walls (active) / doors (blocking)** | `wall ↔ wallEcho` state cross-fade during flip only (R-E6 — never created/destroyed) | 88 % of a cell |
| 4 | **`wallEcho` (other-phase walls)** | state cross-fade during flip only; **never on idle** (R-C8, R-E5) | 80 % of a cell |
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
| 80–200 | **Wall state swap (R-E6)**: walls never enter or exit — each wall tile whose *state* changes cross-fades `wall ↔ wallEcho` (fill token + footprint 88 ↔ 80 % + edge on/off + notch knockout), 120 ms, stagger ≤ 15 ms by distance from the player. Doors keep their own open/closed swap. **No sprite is created or destroyed by a flip.** | 2 tweens per changed tile only (tint + scale) — diff the object list, never re-tween the whole board |
| 100–220 | **Background cross-dissolve** A-04 ↔ A-05, 120 ms, alpha only (both textures preloaded) | 2 sprites, alpha tween |
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

Full-screen white/black flash · gaussian blur or depth-of-field over the board · colour grade that covers cells · pulsing vignette · screen shake > 2 px · any shake at all on a legal move · particles over the player cell · trail/afterimage that lingers > 250 ms · "PHASE SHIFT!" text banner · any transition that locks input · any transition longer than 250 ms · sound longer than 250 ms · **any reactive flash/pop on the `wallEcho` tile at the moment of a refusal** (ADR-0007 rejected "show the cause only at refusal" — the echo is *predictive*; a flash after the fact reads as scolding) · **any idle animation on an echo** (R-C8, R-E5).

### 6.4 Interruption & determinism

- Animation is a **view of state, never a source of it**. The renderer tweens toward `GameState`; if a new move arrives mid-flip, running tweens **snap to their target** and the new sequence starts (animation queue depth = 1). No tween may be allowed to finish "later" and desync from state.
- Fast repeated taps must never produce visual lag accumulation. Test: 10 taps in 1.5 s → final rendered board == final `GameState` (QA regression).
- `prefers-reduced-motion: reduce` → all tweens collapse to a single 60 ms token swap, no hop arc, no object scale, background swaps instantly. Legibility identical, motion removed.
- Audio (if any): one soft 120 ms "flip" cue per legal move, one muted thud-free 90 ms cue on illegal move, both ≤ −18 LUFS relative, no music layer in the prototype.

### 6.5 Illegal move feedback (design: no movement, no flip)

- 90 ms **nudge**: the player sprite translates 4 px toward the blocked cell and returns; `feedback.deny` tints the *player ring only* at 0.5 alpha for 90 ms.
- **No** board-wide flash, **no** shake, **no** red X, **no** sound sting louder than the legal-move cue, **no** text. The player must never feel punished; the world simply does not change (design §12: comprehension over punishment).
- **The cause is already on the board.** Since V0.3 the tile that refuses the move is a visible `wallEcho` (§3.1a), so the refusal is *legible before the tap* and needs no new effect: the nudge points at it, the phase visibly does not flip, and the echo does not move or flash (R-E5, §6.3). Two cues — "the world did not change" + "there is a wall there in the other world" — replace what V0.1 tried to do with motion alone.
- Tapping a **non-adjacent** cell is not an illegal move — it is a non-input. Nothing happens, no feedback, no penalty. Tapping an **adjacent `wallEcho`** *is* an illegal move (union property, ADR-0006) and gets the nudge above; echoes have no input handler of their own (R-E5).
- If Stage-2 §3.3 test 7 (refusal-cause) fails, the fix is **echo emphasis inside the R-E band** (footprint up to 84 %, ΔL\* up to 18) — **never** a bigger nudge, a sound sting, a flash or text.

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
| Board cell (tap-to-move) | **44 px** (floor 40 px) | **≥ 56 px** | n/a | ≥ 44 px guaranteed by the R-L2 grid cap **except** one flagged case: 320 px viewport on a 7 × 7 grid = 41.1 px (above the 40 px floor → R-T5). Hit area = full cell; an echo tile stays tappable and resolves to `MOVE(dir)`, refused by the core rules (R-E5) |
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
- **R-T6.** Desktop: hover shows a 2 px `accent` ring on **legal** adjacent cells only — an adjacent `wallEcho` is *not* legal (union property, ADR-0006), so it gets **no** hover ring — a ring there would promise a move the rules refuse. Hover must not change hit areas, and hover state must not be the only cue (touch has none).
- **R-T7.** Bottom-bar controls sit inside the thumb arc: ≤ 96 px from the bottom edge (before safe inset), never in the top corners on mobile.

---

## 9. DEV PLACEHOLDER rules (prototype only)

Placeholders exist so logic, layout and readability can be built **before** the ASSET GATE clears. They are never final art.

### 9.1 What is a placeholder vs what is vector-by-design

| Element | Status | Source |
|---|---|---|
| Board plate, cells, grid lines | **vector by design** (not a placeholder) | tokens §4.3 — ships as-is |
| Walls (active **and** `wallEcho`), doors, switches | **vector by design** | manifest defers wall/door textures to Stage 5 polish; the echo is a flat token fill (§3.1a), so **no asset is requested for it** and none may be added without a new `asset-request` |
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

**No asset is requested for `wallEcho`.** It is vector-by-design (§9.1): a flat `obj.wallEcho` fill + footprint + knockout notch drawn by the wall renderer. Requesting "ghost wall" art would violate R-C7 (no texture inside cells) and R-E4 (strict subordination).

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
| R8 | Echo clutter: a dense board now carries up to 2 × wall graphics, and the *felt* difference between active and echo may be too subtle on a real device (ADR-0007 consequence) | R-E2 numeric contract (ΔL\* ≥ 12, grey CR ≥ 1.55:1) + R-E4 subordination + R-L2's ≤ 7 × 7 authored cap + §3.3 tests 5/6 re-run at Stage 2. Tuning happens **inside** the R-E band, never by removing the state. |
| R9 | Echo misread as "walkable in this phase" (it is *muted*, and muted can read as inactive/passable) | R-E3 keeps it **filled** (never hollow/outline-only) and the knockout notch names the owning phase at `cellSize ≥ 56`; §3.3 test 5 scores `wall ∪ wallEcho` as blocked, so a misread fails the gate measurably. |

**Open questions (need Game Designer / Orchestrator input):**

- **OQ1 — ANSWERED for V0.3, ⚠ pending Game Designer sign-off.** HUD shows a **plain move count only, no par** (§5.3). `par` remains a Solver/difficulty field in the level schema and is not displayed. This resolves the contradiction with `level-design.md` §1 ("displayed as the perfect-clear target") in favour of the simpler UI; the pre-agreed display format if the designer signs par off is `moves 4 / par 6` (§5.3). **Owner of the ruling: Game Designer.**
- **OQ2.** Is a `hintTarget` highlight allowed at all? Default (V0.1, unchanged in V0.3): **not implemented** (design §9 says teach by observation, not by pointing). Token reserved. *Note: `wallEcho` is not a hint* — it is permanent board state (ADR-0007), rendered in every level from L1, so it does not reopen this question.
- **OQ3.** Win dialog copy: one line maximum. Needs the designer's wording (bilingual CN/EN), must not explain the mechanic ("你发现了…！" is forbidden by design §9). Must not contain par (§5.3).
- **OQ4 — CLOSED (2026-10-14).** Confirmed constraint: authored grids are **≤ 7 × 7**; **8 × 8 only with explicit Orchestrator approval** (and then only under R-T5); **9 × 9 and larger are rejected** on mobile portrait. Handed to Level AI + Solver as a generator constraint (R-L2) and matched by the schema cap being tightened in `docs/level-design.md` §1 in parallel (`width`/`height` authored range 3–7). Evidence: §2.3 cell-size table — the 40 px absolute floor holds at every supported viewport for ≤ 7 × 7.

---

## 13. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial UI/UX spec: layout & cell-size floor, readability contract, measured Phase A/B token map, visual hierarchy, flip feedback budget, DOM/canvas split, ≥44 px touch targets, DEV PLACEHOLDER rules, asset integration contract | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.3 | **RV-001 reconciliation (UA-002).** **B-1:** §3.1 "phase-inactive objects are absent / never render ghost walls" **superseded** by the `wallEcho` state + binding contract §3.1a (R-E1…R-E8), implementing **ADR-0007**; presentation-only, core rule untouched. New tokens `obj.wallEcho` A `#8E7C5D` (3.98:1) / B `#7C77AE` (3.47:1); B `obj.wall` re-tuned `#8A78D6` → `#A795EE` (3.90 → 5.56:1) to open a legal value band — record in §4.3, measurements in §4.4/§4.6; R-C1/C2/C3/C5/C6/C7/C8/C10 updated, R-C12 added. §5.1 rank 4, §5.2 L4 note, §6.2 wall state swap, §6.3 two new prohibitions, §6.5 cause-is-visible, §9.1 + §10 + §11 echo notes, §3.3 tests 6–7, risks R7–R9. **M-5a:** R-T2 Restart confirm dialog deleted (one tap, no dialog). **M-5b:** par removed from the HUD (§5.3), OQ1 answered pending designer sign-off. **LOW-5:** §6.2a causality rule + Variant CL timings and measured trigger; R-L2 reworded (40 px floor everywhere, 44 px except 320 px/7×7); §2.3 390 px/9×9 marker corrected ⚠ → ✗; §8 cell row and R-T5 made exact. **LOW-6:** `icon_back` RESERVED (§11 + manifest). **OQ4 closed:** authored grids ≤ 7 × 7, 8 × 8 only with Orchestrator approval. | Agent 5 (UI / UX / Art Director) |
