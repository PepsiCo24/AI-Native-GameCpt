# UI / UX Spec — Phase Shift: Echo Grid / 双相棋盘：昼夜回响

> Owner: **Agent 5 — UI / UX / Art Director**
> Version: **V0.6**
> Date: 2026-10-15
> Status: **LOCKED for prototype** (visual token values may be re-tuned only with a screenshot-review record)
> Governs: `src/ui/**` (no such tree exists yet — the shipped DOM side lives in `src/game/hud/**`, §5.4), `src/game/renderer/**`, `src/game/theme/**`, `src/game/hud/**`, `src/game/scenes/**` (visual layer only), `docs/assets/**`
> Read-only inputs: `docs/game-design.md` (§3, §5, §6, §7, §9, §12), `docs/level-design.md` (§0–§4), `docs/architecture.md` (§9, §10, §11), `docs/decisions/0006`, `docs/decisions/0007`, **GATE C human decision 2026-10-14 (Option B)** — recorded in **`docs/decisions/0008-phase-solidity-entry-only.md`** (Accepted), `docs/decisions/0009-checkerboard-invariant-mechanics-forward.md`, `docs/ai-native-pipeline.md` §3 (legibility law, scoped by measurement) + §3b (door ∩ wall adjudication — LV-005, commit `5f9e5f7`); see also `docs/assets/codex-generation-brief.md` §6. OQ5 below is closed by ADR-0008.

---

## V0.5 → V0.6 change note (single-cell precedence · R-P3 contradiction · UA-0004 doc-drift fixes · task UA-0005 · 2026-10-15)

**Three corrections, one document pass — presentation semantics only, no rule lives in this file.** (1) §3.1 defined every class's appearance but never how **one cell** composes when more than one graphic claims it — LV-005 (commit `5f9e5f7`) removed the only lying combination at the data layer and explicitly handed appearance precedence to this file (`docs/ai-native-pipeline.md` §3b: *"appearance precedence belongs to `docs/ui-ux.md`"*). (2) R-P3 demanded per-placeholder on-board Asset-ID labels that §7.1 (no canvas text) and §7.3 (no DOM over the board rect) make impossible — the shipped HUD already implements the only legal equivalent. (3) Two UA-0004 leftovers, both Orchestrator-verified against the shipped code: §5.4/R-C11/§6.2a still name `src/ui/theme/`, while the module actually lives at `src/game/theme/tokens.ts` + `assets.ts`; and §7.4 never stated the `touch-action`/pinch-zoom policy that `index.html` implements and cites it for (RV-002 M-8). **No frozen value moves:** §4.3 tokens, §5.3 type scale and §6.1/§6.2/§6.2a `flipTimings` numbers are untouched; **asset impact: none** (no new art requested — ASSET GATE unchanged).

| # | What changed | Where |
|---|---|---|
| **Z-1** | **New §3.1d — the single-cell appearance precedence, rules R-Z1…R-Z6.** One fixed total order per cell, top → bottom: **player (L5, always topmost — R-C13.1 restated, not redefined) > door (open/closed/occupied) > wall (solid/ghost/occupied) > goal > switch > portal > ground (L3)**. Trapped-state stacking adds **no new layer** — it cites the existing clauses (R-C13.1/.2/.4/.5, R-D7): the tile keeps its slot, only the interior token swaps. Goal ∩ wall is **impossible at the renderer** and the dependency is stated (validator hard error — goal non-wall in BOTH phases, ADR-0008 rule 7); goal ∩ door is warning-flagged legal data and gets its picture (door on top; ring visible through the open door's passage; goal-over-door **rejected on measurement**: `obj.goal` vs door token = 1.50:1 A / 1.13:1 B, plus it would dilute the blocking read — the LV-005 lie class). One explicit sentence: **the precedence legalises nothing** — door ∩ wall stays a hard error (§3b: the ruling stands until Game Designer + UI/Art Director + Orchestrator change it together). Known-unreadable combos flagged, not blessed: switch ∩ wall measures 1.14–2.97:1 in every stacking (offline, same §4.3 script; reproduces the published R7 1.14 row) → gated before any M3 "integrated" claim (extends §12 R7), data-layer verdict escalated as **OQ6**. Evidence cited: LV-005 measurements (Orchestrator 5×5 probe: 3 lying reachable states; shipped suite: per tile exactly one of four wall-phase × door-colour overlaps lies, `hollow-but-refusing = 4`, six honest combos 0) and the legibility-law scoping (pure M0 boards 0/400 lying tiles; opposite-colour portal boards 0 — door ∩ wall is the only construction that ever lied). | §3.1d new, §3.1, §5.2 |
| **Z-2** | §3.1 gains a composition pointer (the one-class law is the design law; validator rejects some violations, warns on others; §3.1d answers any cell that still carries two graphics). §5.2 gains one bullet: within-L4 order is §3.1d — one ordered table, never per-tile z-sorting. Implementation mapping for the renderer (R-001b): the `BoardView` depths as committed on develop (`0f53076`) put the goal graphics **above** the wall graphics — harmless today (goal ∩ wall impossible, doors unimplemented) but it inverts slots 2–4 and must flip before M1 doors ship; the same applies to any boot-time depth **assertion** — R-C13.1 requires only `actor` above every L4 layer, the intra-L4 order is §3.1d's; the registry's `TileObjectSpec.layer` field is the natural carrier, mechanism is the Gameplay Engineer's choice, the resulting picture order is this contract. | §3.1, §5.2, §3.1d |
| **P-1** | **R-P3 rewritten to an implementable equivalent.** The V0.5 text ("draws each placeholder's Asset ID under it") required per-placeholder labels **on the board** — impossible: canvas text is forbidden (§7.1) and no DOM element may intersect the board rect (§7.3); the three clauses could never all hold. New R-P3: both honesty labels are **DOM in the chrome** — (1) corner badge inside the top HUD bar, (2) `?placeholders=1` renders a dev info **strip between the bars and the play area** listing every placeholder's Asset ID + name from R-P5's single lookup table. The ID↔object binding stays where it always was legal: R-P2 code-site tags. Matches the shipped implementation (`src/game/hud/hud.ts` `.ps-devbadge` / `.ps-devstrip`; `src/game/env.ts` `IS_PROD` + `hasQueryFlag`); both hidden when `import.meta.env.PROD`. R-P1/R-P2/R-P4–R-P7 unchanged. | §9.2 |
| **S-1** | **§5.4 path correction (UA-0004 leftover, Orchestrator-verified).** `src/ui/theme/tokens.ts` → the shipped **`src/game/theme/tokens.ts`** (+ sibling **`src/game/theme/assets.ts`** carrying `PLACEHOLDER_SLOTS` / `PLACEHOLDER_TO_ASSET` / `assertNoPlaceholders`, R-P5/R-P6). No `src/ui/**` tree exists in the prototype; the DOM side (`src/game/hud/**`) consumes `cssVars(phase)` as `--ps-*` exactly as specified. **Division of labour restated, unchanged:** §5.4 remains the **spec authority** for the token map, the R-C11 law and the skin contract; the files live in `src/game/**` and are written/owned by the Gameplay Engineer (AGENTS.md §4) — Agent 5 does not edit them. R-C11's file reference and §6.2a's `FLIP_TIMING` reference corrected with it (shipped shape `Record<"S" \| "CL" \| "reduced", FlipTimings>` — the third row is §6.4's reduced-motion collapse inside the same single table; **no timing value changed**). | §5.4, R-C11, §6.2a |
| **S-2** | **§7.4 states the shipped `touch-action` / pinch-zoom policy (UA-0004 leftover, RV-002 M-8).** The code `index.html` cites "§7.4/R-C3" for its WCAG SC 1.4.4 conformance claim, but §7.4 was silent. Now codified as shipped: **no global `touch-action: none`**, viewport meta unchanged (`width=device-width, initial-scale=1, viewport-fit=cover` — never `user-scalable=no` / `maximum-scale`), exactly two scoped rules (`#app canvas { touch-action: none }` — board surface only; `touch-action: manipulation` on HUD buttons) and `overscroll-behavior: none` on `body` for pull-to-refresh. The game swallows gestures only on its own surface, never on the document. | §7.4 |
| **S-3** | **OQ6 added** (unvalidated same-cell combinations — data-layer verdicts belong to Level AI + Solver / Game Designer, visual consequences recorded in §3.1d/R-Z6). **No conflict with ADR-0008/0009 found**: the precedence is presentation-only; ADR-0008 rule 7 is a cited *dependency* (goal ∩ wall impossibility) and ADR-0009's checkerboard invariant underpins the §3b measurements this note cites — neither is restated or altered. | §12 |

---

## V0.4 → V0.5 change note (RV-002 H-4 · doors on the fill axis · task UA-0004 · 2026-10-14)

**V0.4 promoted "does this tile block entry in the current phase" to the board's first readable axis (R-C2) — but gave doors no open/closed visual definition at all:** R-C1 carried a single door row ("solid bars", identical for open and closed) and §4.3 carried no door-state tokens. RV-002 rated this **H-4**, the loudest remaining hole. From L21 on (M1) doors gate routes exactly like walls do (`game-design.md` §5: red opens in A / closed in B, blue the inverse; closed-in-current-phase blocks entry; doors share wall semantics including never ejecting an occupant). This revision defines the missing pair **on the same fill axis**, fixes the L-2 portal-reservation trap, and makes the §3.3 viewer tests falsifiable (M-11). **Presentation semantics only** — no rule lives in this file.

| # | What changed | Where |
|---|---|---|
| **D-1** | **Doors get a binding open/closed contract on the R-C2 fill axis — new §3.1b, rules R-D1…R-D8.** Closed = framed panel + **3 full-width solid bars** + centre medallion (blocks entry — SOLID side). Open = **same frame + same medallion**, bars retracted to **4 corner stubs** over an **empty ground passable centre** (passable now, closes at the flip — HOLLOW side). **Proposal 2 chosen over separate open/closed colour tokens**: one token per door colour in both states (`obj.doorRed`/`obj.doorBlue` unchanged), state carried by geometry — structure-first per R-C2, zero new hand-tunable values per R-C12, object constancy across the flip. Measured coverage ratio closed/open **1.80:1** @56 px / **1.70:1** @40 px (contract ≥ 1.6:1); an open door carries ≈ ⅓ of a wall's ink (25.1 % vs 77.4 % of cell²) and an empty centre — it can never read as a wall. | §3.1b new, R-C1, R-C2 |
| **D-2** | **Doors join the blocking predicate.** Everywhere the spec answers "what blocks entry now", the answer set is `current-phase solid walls ∪ current-phase closed doors` (R-D1): §3.3 **test 5** answer key rewritten (open doors and ghosts score passable); **test 6** sampling made deterministic + **stratified 3 walls + 3 ghosts + 2 closed + 2 open doors** (door-less builds 5+5), hard cap **no class > 6/10** — the all-ghost trivial pass is excluded by construction; **test 7** refusal cause includes closed doors; §6.5 "cause is visible" text updated; **R-T6** hover: open doors get the ring, closed doors excluded. | §3.3, §6.5, §8 |
| **D-3** | **R-C13 extended to closed doors** (doors share wall semantics — `game-design.md` §5): a player may legally stand inside a door closed in the current phase. New derived tokens `obj.doorRedOccupied` / `obj.doorBlueOccupied` (same 55/45 formula as `wallOccupied`); the door's 2 px frame stays at full token (the wall-edge analogue). `fx.phaseRing` **re-derived** — formula becomes a boot-time **minimax over every occupied interior**, candidate set gains `text.primary`: A → `#3A3226` (min **4.98:1**), B → `#EAF0FF` (min **3.63:1**). The V0.4 B pick (`accent`) fails the extended set (**2.49:1** vs `doorBlueOccupied` B) — the re-derivation is mandatory, not cosmetic. | R-C13, §4.3, §4.6 |
| **D-4** | **L-2 trap fixed — new §3.1c.** The V0.3 reservation ("the same `*Echo` pattern" for an inactive portal) was unsatisfiable: portals are hollow in **both** states (R-C2 — always passable), so the fill axis has nothing to separate. `*Echo` is redefined as a **family name** ("belongs to the other phase / inactive now") with a **per-class channel**: walls → fill rule; portals → **swirl presence/absence** (primary, structural) + muted derived stroke `obj.portalEcho` (secondary — 80/20 formula: A `#4C8B91` **3.25:1**, B `#6CB5B5` **5.32:1** vs the worse ground; provisional, RESERVED until M2). | §3.1c new, §3.1, §4.3 |
| **D-5** | **M-11 closed — new §3.3a test protocol P-1…P-6**: n = **5 fresh viewers per phase per item** (cohort pass ≥ 4/5 where per-viewer criteria apply), verbatim question scripts, **Playtest Analyst recruits + moderates** (Agent 5 owns criteria only, observes silently), deterministic **seeded** sampling, fixture composition minima, **inclusive thresholds with a borderline rerun rule** (exactly-at-threshold = PASS once + mandatory fresh rerun before "integrated"; a second consecutive borderline = FAIL), per-phase failure never averaged, R-P7 evidence labelling, "no log entry = no pass claim". | §3.3a new |
| **D-6** | New measurements, offline WCAG 2.1 + Viénot (1999) script (sanity-checked: reproduces the published V0.3/V0.4 rows before adding new ones): door tokens vs both grounds (min **4.94:1**), occupied doors (drop **2.18–2.44:1**, ≥ 2.0:1 vs worse ground), player visibility (A ring-mandatory **4.71–4.93:1**, body alone 1.83–1.91; B body alone **3.63–4.38:1**), closed-door-vs-wall and open-door-vs-ghost structure pairs, §4.4 greyscale door rows. **Evidence status: offline**; in-app screenshot review still pending. | §4.3, §4.4, §4.6 |
| **D-7** | **Asset impact: none — the 11-image GATE A batch still needs no regeneration.** Doors in every state (closed / open / occupied), the medallion glyph and the reserved portal-echo treatment are program-drawn vector art in the token system (§9.1). `docs/assets/codex-*.md` untouched. One forward flag only: if Stage 5/M2 ships the flattened A-06 portal sprite (swirl baked in), the swirl-absence channel needs a no-swirl variant via a **new** asset-request at Stage-5 kickoff — never part of the frozen batch (§3.1c, §11). | §9.1, §11 |
| **D-8** | Consistency sweep: §5.1 ranks (closed doors → rank 3, open doors → rank 4 with the door-specific area-subordination note), §6.2 (door swap = bar retract/extend on the same sprite, frame + medallion constant; occupied-resolution row covers doors), §6.3 (two new prohibitions: tint inside an open door frame; idle door animation), §7.4 (door glyph never size-gated off), §12 (R9 updated; **R11** door-state misread and **R12** open-door↔ghost confusion added). | throughout |

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

Every cell is exactly one of: `empty`, `wallA(active|echo)`, `wallB(active|echo)`, `doorRed(open|closed)`, `doorBlue(open|closed)`, `portalA`, `portalB`, `switch(on|off)`, `goal`, plus overlays `player`, `playerOrigin` (last-move ghost, optional), `hintTarget` (only if the designer enables a hint). **Since V0.4 the `player` overlay may legally coexist with an `active` wall tile** (entered as a ghost, solidified by the flip) — presentation contract R-C13. **Since V0.5 the same holds for a door closed in the current phase** (entered while open, closed by the flip — doors share wall semantics, `game-design.md` §5 / ADR-0008) — R-C13 as extended by R-D7.

**Same-cell composition (new V0.6).** The one-class law above is the *design* law, and the validator enforces only part of it: door ∩ wall is a hard error (LV-005, commit `5f9e5f7`; adjudication `docs/ai-native-pipeline.md` §3b), player/goal ∩ wall (either phase) is a hard error (ADR-0008 rule 7 for the goal; the same check covers the player start — `validateLevel`), portal ends ∩ wall/door are hard errors (`architecture.md` V0.5 §7) — while a door on the goal/player is **warning-flagged legal data**, and combinations like goal ∩ portal or switch ∩ wall are not adjudicated at all (OQ6). For any cell that nevertheless carries two graphics, **§3.1d** is the single appearance-precedence contract: it gives every combination one deterministic picture, and it legalises nothing — a rejected cell stays rejected (ADR-0004).

A phase wall is **one object with two render states**, never an object that appears and disappears:

- **`wall` (active)** — the wall is solid **in the current phase**: full-strength filled block. Entering it is the **only** way a move can be illegal (Option B).
- **`wallEcho` (ghost)** — the wall belongs to the *other* phase: **passable right now**, rendered as a clearly visible **hollow ghost** — thin stroke + light flat tint (**§3.1a**). The next flip solidifies it; if the player is standing on it at that moment, **R-C13** applies.

Doors received their binding open/closed contract in **V0.5 — §3.1b** — on the **same R-C2 fill axis** as walls (closed = SOLID side, open = HOLLOW side). Switches keep their own on/off treatment (R-C1). The `*Echo` family name remains **RESERVED** for an inactive portal at L36/M2, but the V0.3 wording ("the same pattern") is **superseded — §3.1c**: portals are hollow in *both* states (R-C2), so `portalEcho` cannot live on the fill axis; it is carried by **swirl presence/absence** instead. Token name + derivation formula reserved, not implemented, no art requested.

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


### 3.1b Doors — open/closed on the same fill axis (new V0.5, UA-0004 / RV-002 H-4)

V0.4 left a hole: R-C1 gave doors a single row ("solid bars") with **no open/closed visual definition**, while GATE C Option B promoted "does this tile block entry right now" to the board's first readable axis (R-C2). Under the locked mechanics (`game-design.md` §5 M1, `level-design.md` §1): **a red door is open in Phase A and closed in Phase B; a blue door is the inverse**; a door closed in the current phase blocks entry exactly like a solid wall; and **doors share wall semantics** — a flip never ejects an occupant, so a player who entered an open door may legally stand inside it after the flip closes it (R-C13, extended by R-D7 below). Optional M3 switches toggle that baseline; either way open/closed is `GameState`-derived data.

The presentation consequence: **a door is the wall grammar applied to a second class** —

- **a closed door is the door's wall state** (blocks now, opens at the flip),
- **an open door is the door's ghost state** (passable now, closes at the flip — stand in it at resolution and R-C13 applies).

The player learns this grammar on walls in L1–L20, **before doors ship at L21**; doors then reuse it instead of inventing a second language. This is also why **Proposal 2 (one token, geometry carries the state) is chosen over Proposal 1 (separate `obj.door*Open` / `obj.door*Closed` colour tokens)**:

1. **R-C2 is structure-first.** Bar mass vs empty passage cannot be collapsed by desaturation or by any dichromat simulation; a value delta between two door colours would be a weaker second axis nobody needs. V0.4's wall pair needed a separate muted stroke token only because R-E4 subordination demanded a value drop between two *identically shaped* squares; door states differ in geometry hugely (coverage ratio **1.80:1**, measured below), so subordination is achieved by area alone (R-D6).
2. **R-C12 re-tune surface.** Proposal 1 adds 4 hand-managed base values per phase; Proposal 2 adds **zero** — one token per door colour, identical in both states and both phases, so R-C10 ("same object across the flip") is trivially true. The only additions are formula-derived occupied tokens (55/45 — the existing `obj.wallOccupied` rule).
3. **Object constancy across the flip.** Frame + medallion are invariant through the open↔closed swap; only the bars retract/extend (R-D3). Colour-token swaps would repaint the object's identity in the very moment the player is tracking it.

**Geometry contract (all sizes ≥ 40 px, derived from `cellSize`, never hard-coded):**

| Property | Closed (blocks entry now) | Open (passable now) | Channel |
|---|---|---|---|
| Frame | rounded square, **2 px stroke**, 88 % of cell, R-L3 radius | **identical — constant across states** | identity (constant) |
| Bars | **3 full-width solid bars**, height `max(3, round(cellSize * 0.12))`, centred at 25 / 50 / 75 % of footprint height; ground gaps ≈ `0.10 * cell` between bars | **zero full-width bars** — top/bottom bars retract to **4 corner stubs** of width `round(0.18 * footprint)` (cap ≤ 20 %), flush to the frame's inner edges; the middle bar is gone | **fill / mass — primary, greyscale/CVD-proof** |
| Passage | striped: ground gaps between bars | **empty passage**: interior = `ground.cell`, **never tinted** (R-D5) | mass distribution |
| Medallion | filled disc Ø `max(13, round(cellSize * 0.34))`, centred, fused with the middle bar | **identical disc**, floating in the empty passage | identity (constant) |
| Identity glyph | **knockout to `ground.cell`**: sun = red (opens in A), crescent = blue (opens in B), box `max(9, round(cellSize * 0.22))`, inside the medallion | **identical** | R-C6 CVD channel — load-bearing, never size-gated off (R-D4) |
| Tokens | `obj.doorRed` / `obj.doorBlue`, flat | **the same tokens**, flat | hue = colour family only |

**Glyph semantics, unified with walls:** the sun/crescent always names the **owning phase** of the object — sun = "acts in Day", crescent = "acts in Night". Walls show the glyph only in the ghost state (a solid wall's owner is obvious — R-E4, redundant channel, ≥ 56 px); doors show it in **both** states because it doubles as the red↔blue CVD channel (R-D4, load-bearing, ≥ 40 px). Fill always carries *current* passability; the glyph never does.

Measured (offline 2026-10-14, script per §4.3; cell 56 px nominal / 40 px floor):

- **Coverage:** closed **45.0 %** of cell² @56 px (48.7 % @40); open **25.1 %** (28.7 %) — ratio **1.80:1** (1.70:1 at the floor); contract ≥ 1.6:1. Reference: a solid wall covers **77.4 %**. An open door carries ≈ ⅓ of a wall's ink around an empty centre — it can never read as a wall.
- **Medallion** = **9.0–9.6 %** of cell² — within the ≤ 10 % cap of R-C2's marked exception.
- **R-C5:** the knockout glyph removes ≤ 8.4 % of the drawn graphic area (closed retains 95.1 %, open 91.6 %) ✓ ≥ 70 %.
- **Token contrast (shared by both states):** red A **5.90:1** (5.02 vs `cellAlt`) · blue A **5.81:1** (4.94) · red B **6.24:1** (5.47) · blue B **7.83:1** (6.87) — R-C3 ✓ including the 2 px frame at every size.

Hard rules:

- **R-D1 — Same axis, same grammar.** A closed door sits on R-C2's SOLID side, an open door on the HOLLOW side, together with `wall`/`wallEcho`. Any renderer, hover rule or test that answers "blocks entry now" must return **`current-phase walls ∪ current-phase closed doors`** — one predicate for both classes (§3.3 test 5 answer key, R-T6).
- **R-D2 — Geometry carries the state.** Closed = 3 full-width solid bars; open = zero full-width bars, maximum horizontal interior span ≤ 20 % of frame width, empty-passage centre. Coverage ratio closed/open **≥ 1.6:1** (measured 1.80 @56 px, 1.70 @40 px). Because the delta is structural, no desaturation, no dichromat simulation and no dirty phone screen can collapse it — the §4.6 `d`/ΔL\* columns are confirmation, never the argument.
- **R-D3 — Identity is constant.** Frame + medallion + knockout glyph render identically in both states; the state swap animates **only** bar retraction/extension, in place, on the same sprite (§6.2). The glyph is a knockout through the full-strength medallion, so it reads at the token's own CR (≥ 4.94:1 against the worse ground) at every size.
- **R-D4 — The glyph is load-bearing at every size ≥ 40 px.** Red↔blue luminance separation is near zero for deuteranopes (1.02:1 normal, §4.6), so the sun/crescent medallion is the **only** non-colour channel between the two door colours: unlike the ghost's redundant notch (≥ 56 px, R-E4) it is **never size-gated off**. Below 44 px cells the R-T5 flagged cases apply unchanged.
- **R-D5 — An open door's interior is ground, never tinted.** The flat tint (`obj.wallEchoFill`) is wall-ghost-specific. An open door that borrowed it would collapse the two rank-4 classes into "tinted square" at a glance. Measured separation: interior ground 1.00:1 vs ghost tint 2.11:1 (A) / 2.12:1 (B); plus footprint 88 vs 80 %, corner stubs vs full square outline, red/blue vs sand/violet hue families (§4.6). Class confusion here is behaviourally benign (both are passable now, both close at the flip — §12 R12), but the blocking read is never ambiguous.
- **R-D6 — Subordination by area, not by value.** Open-state visual weight ≤ **0.65×** the closed state (measured 0.56 @56 px, 0.59 @40 px), achieved by coverage alone; both states render at full token strength. R-E4's *value* ceiling is wall-class-specific and does **not** transfer: a door's state is the M1 routing read, and the warm-red/cool-blue families never compete with the muted sand/violet wall tokens. No idle animation on any door part (R-C8); state changes only inside the flip (§6.2) or at M3 switch resolution (the same swap).
- **R-D7 — Occupied closed door = R-C13, extended.** The player may legally stand inside a door closed in the current phase. Bars + medallion drop to `obj.doorRedOccupied` / `obj.doorBlueOccupied` (derived, 55/45 — the `wallOccupied` formula), the 2 px frame stays at the full door token at every cell size (the wall's retained-edge analogue), player on top, one-shot `fx.phaseRing` at flip resolution, inside the ≤ 220 ms budget with 0 ms input lock. Numbers in §4.3/§4.6; gated by §3.3 test 8.
- **R-D8 — One code path.** Open/closed is a derived render flag computed from `GameState` (door colour, current phase, switch toggles) — data, not a colour or branch decision: `theme(phase)` supplies the two door tokens, the door renderer draws bars or stubs from the flag, and the swap is one width tween on the same sprite. No `phase ===` branch, no second prefab, no sprite creation/destruction by a flip (non-negotiable #3, the R-E8 pattern).

### 3.1c `portalEcho` — reserved inactive portal on a non-fill channel (new V0.5, fixes L-2)

V0.3 reserved the `*Echo` family name for an inactive portal (M2/L36) with the wording "the same pattern" as `wallEcho`. **That reservation was a trap:** a portal is **hollow in both states** — R-C2 puts it on the passable side *always* (stepping onto a portal tile is legal whether or not it triggers; only the teleport is conditional) — so the fill axis that separates `wall ↔ wallEcho` **has nothing to separate** for portals, and an "echo portal" drawn hollow would have been indistinguishable from an active one.

V0.5 redefines the reservation: **`*Echo` is a family name meaning "belongs to the other phase / inactive now"; the discriminating channel is per-class.**

| Class | Both states share | The `*Echo` channel (primary) | Secondary |
|---|---|---|---|
| wall | square silhouette | **fill rule**: solid → hollow (2 px stroke + flat tint, §3.1a) | value drop ΔL\* ≥ 12 (R-E2) |
| portal | hollow diamond outline (R-C2: passable in both states) | **swirl presence**: active = outline + inner swirl; inactive (`portalEcho`) = **outline only, no swirl** | muted stroke `obj.portalEcho` (derived — provisional until M2) |

Presence/absence is a structural channel — the same species as the wall's edge on/off (§3.1a) — greyscale- and CVD-proof by construction; the value step is the backup, never the argument. `obj.portalEcho` = **80 % `obj.portal` + 20 % `ground.cell`** (formula-derived, R-C12): A `#4C8B91` (**3.82:1** vs `ground.cell`, **3.25:1** vs the worse `cellAlt`), B `#6CB5B5` (**6.06:1** / **5.32:1**) — meets the R-E1-analogue ≥ 3.0 stroke band while staying strictly subordinate to the active portal (CR 1.50:1 A / 1.42:1 B, ΔL\* drop 11.3 / 11.7 — §4.6). The active portal is never muted. The flip swaps tokens + swirl visibility on the same sprite (the R-E6 pattern); nothing is created or destroyed.

**Status: RESERVED** — token name, formula and channel are fixed now; implementation ships with M2 (L36); the numbers above are provisional offline values, re-measured at M2 integration. No art is requested. **Stage-5 flag:** the frozen A-06 prompt bakes the swirl into the flattened portal sprite; if M2 ships with that sprite, the swirl-absence channel needs a no-swirl variant — Agent 5 files a **new** `asset-request-XX` at Stage-5 kickoff (or keeps portals vector-drawn). Never a silent re-prompt of frozen A-06, never an addition to the current 11-image batch (§11).

### 3.1d Same-cell composition — the single-cell appearance precedence (new V0.6, UA-0005)

§3.1–§3.1c define what each class looks like; none of them defined what a cell looks like when **two graphics claim it**. The one combination ever measured to produce a lying picture — a door on a phase wall (the wall echoes hollow, "passable now" under R-C2, while the closed door still refuses entry) — was removed at the data layer: **LV-005 hard error** in `validateLevel` (commit `5f9e5f7`, `src/core/level/index.ts`), adjudicated in `docs/ai-native-pipeline.md` §3b as *illegal data, never "the door swallows the wall"*, with appearance precedence explicitly delegated to this file. The legibility law's scope is measured, not assumed: pure M0 wall boards (**0/400** lying tiles) and opposite-colour portal boards (**0** lying tiles — a portal *removes* deadness, it never creates lies) never violate `filled = blocks / hollow = passes`; door ∩ wall is the **only** construction that ever did (Orchestrator 5×5 probe: **3 lying reachable states**; shipped suite `tests/unit/door-wall-overlap.test.ts`: per tile exactly **one of the four** (wall phase × door colour) overlaps lies, `hollow-but-refusing = 4` of 4 refused clicks on the 5×3 boards, `0` for the six honest combinations). But other combinations **can** reach the renderer legally today — a door on the goal is warning-flagged data; goal ∩ portal, goal ∩ switch, switch ∩ portal, switch ∩ wall are unadjudicated (OQ6) — and every future milestone adds classes. Without a fixed order, each implementer invents their own z answer: two builds, two pictures, nothing to test against. This section fixes the order **once**.

**The precedence (one cell, top → bottom):**

| Slot | Element (states included) | Layer | Why here |
|---|---|---|---|
| 1 | **Player** — incl. hop/deny offsets | L5 | Always above every object graphic — **R-C13.1, cited not restated**; the actor is the eye's first target (§3.3 test 4) |
| 2 | **Door** (open / closed / occupied) | L4 | Blocking-axis class; the most specific identity on the board (frame + medallion constant across states, R-D3) |
| 3 | **Wall** (solid / ghost echo / occupied) | L4 | The blocking-axis class — the cell's primary answer to "can I enter now" (R-C2, R-E3) |
| 4 | **Goal** (ring + centre dot) | L4 | The destination — attention rank 2 (§5.1), above modifiers, **below blockers** (R-Z3) |
| 5 | **Switch** (on / off outline) | L4 | Traversal modifier — rank 5, hollow in both states, never blocks |
| 6 | **Portal** (active; reserved `portalEcho` holds the same slot) | L4 | Traversal modifier — rank 5, hollow in both states (R-C2), never blocks |
| 7 | **Ground** (cell plate + checker `cellAlt` + grid lines) | L3 | Position identity, **never state** (R-C4) — always bottom |

Overlays outside the table: `playerOrigin` (optional, unimplemented) sits **directly above ground, below every L4 object** — decoration may be hidden but never hides; the hover ring (R-T6), deny nudge (§6.5) and one-shot phase ring (R-C13.4) are L6 `cellFeedback` per §5.2, subject to R-C5; `hintTarget` stays reserved (OQ2). The cross-layer stack L0–L8 (§5.2) is unchanged — this section governs **within L4** and restates L5 > L4.

**Correspondence with the logic.** Draw order is the inverse of each layer's question-urgency. The board must answer, in ascending order of what a wrong answer costs: *"where do I stand"* (ground — carries no state) < *"what happens here"* (portal/switch — modifiers, passable in both states, can never refuse) < *"where do I go"* (goal — can never refuse) < *"may I enter now"* (wall/door — the R-C2 axis, the **only** question whose answer can be a refusal) < *"who am I"* (player). The more load-bearing the question, the higher it draws. Consequence: no decorative ink can ever sit on a blocking-class graphic and dilute the solid/hollow read — which is precisely the lie class LV-005 measured. Note that §5.1's attention ranks are **not** the draw order: the goal is attention rank 2 yet draws below blockers, because attention is measured on legal boards where the goal never shares a cell with one (validator guarantee, R-Z3); on the rare gated-goal cell, honesty outranks discovery.

Hard rules:

- **R-Z1 — One fixed total order, expressed as data.** The table above is the only z answer, in every phase, in every level, at every cell size. Implementation = one ordered table (the `TILE_OBJECTS` registry order / its `layer` field, plus fixed container depths), **never** per-cell runtime z-sorting, never per-frame reordering, never a `phase ===` branch, never a re-parent on flip (R-E6/R-D8; §5.2 "no per-tile z-sorting"). The wall's special in-place state-swap machinery (R-E6/R-E8) is untouched: precedence assigns the wall *class* a slot, it does not give walls a second renderer. A tile listed in both wall phases is **one** wall object (permanently solid, `owningPhase = undefined` — validator warning "solid in both phases"), never a two-graphic stack.
- **R-Z2 — Player on top; the trapped state adds no new stacking.** Nothing in L4 may draw over any part of the player (**R-C13.1**). When the player legally stands inside a tile the flip just solidified/closed, the picture is exactly the existing contract, in the existing slot order: the obstacle keeps its slot (2/3, above goal etc.), its interior swaps to `obj.wallOccupied` / `obj.door{Red|Blue}Occupied` with edge/frame retained (**R-C13.2**, extended by **R-D7**), the one-shot `fx.phaseRing` fires at flip resolution (**R-C13.4** — event feedback at the player, never looped, never per-cell cover), inside the ≤ 220 ms budget with 0 ms input lock (**R-C13.5**), and the "occupied" flag stays a derived render state, one code path (**R-C13.7**). This section fixes *order* only — R-C13/R-D7 remain the *treatment* clauses; no new numbering is introduced for the trapped state.
- **R-Z3 — Goal never draws above a blocker; the validator dependency is stated.** **Goal ∩ wall cannot reach the renderer**: `validateLevel` hard-errors when the goal (or the player start) is solid in **either** phase (ADR-0008 rule 7). This precedence **depends on that guarantee** — if it is ever relaxed, this row re-opens, because neither picture is shippable: a ring above a solid wall promises a win the rules refuse (the LV-005 lie class), and a ring below it hides the objective. **Goal ∩ ground is the normal case** — the ring draws over the cell plate at 3.94:1 (A) / 8.85:1 (B) (§4.3); ground is never state, so there is no conflict. **Goal ∩ door can reach the renderer** (a door tile on the goal = validator *warning*, manual review — ADR-0008 rule 7 intends the goal enterable on both parities): the **door draws on top**. Closed → the bars occlude the ring except ground-gap slivers; the cell reads as a closed door first (blocks now), which is exactly the authored intent of gating a goal — "come back when it opens". Open → frame + corner stubs + medallion above; the goal ring (stroke at radius ≈ 33 % of cell) stays visible in the empty passage around the medallion (radius ≤ 17 %, §3.1b), the centre dot covered — acceptable on warning-flagged data. Goal-**over**-door is rejected on measurement, not taste: `obj.goal` vs the covering door token = **1.50:1** (A vs `doorRed`) / **1.13:1** (B vs `doorBlue`) — invisible ink, plus the diluted blocking read.
- **R-Z4 — Same-class overlap resolves by declaration order.** If two objects of one class ever claim a cell (e.g. two portal ends from different pairs — unvalidated today), the **later entry in level-data declaration order draws on top**. Deterministic without sorting; such cells remain candidates for a data-layer verdict (OQ6), and this rule makes the picture testable meanwhile.
- **R-Z5 — The precedence is not a permission slip.** This order guarantees that **any** future combination has one deterministic picture answer — **it legalises nothing**. Door ∩ wall remains a hard error (LV-005, `validateLevel`, §3b; ADR-0004 reject-never-repair), and per §3b that ruling stands until Game Designer + UI/Art Director + Orchestrator change it **together**, in the pipeline doc and the validator — writing "door > wall" here does not reopen it: on legal data that pair is unreachable, and it exists only so the total order stays total. A picture answer is never an acceptance criterion: any combination that ever becomes legal must additionally pass §3.3 (and get §4.6 numbers) before it ships.
- **R-Z6 — Known-unreadable combinations are flagged, not blessed.** **Switch ∩ phase-wall tile is legal data today** (only the inert case — wall in the switch's *own* activePhase — draws a warning). Neither stacking is readable with current tokens, measured offline 2026-10-15 with the §4.3 script method (sanity check: reproduces the published §12 R7 row B switch/wall = 1.14): switch *below* wall is fully hidden in both wall states (the 88 % solid fill, or the 80 % **flat opaque** ghost tint — R-C7 forbids see-through alpha, so nothing shows through); switch *above* wall measures **1.18:1** (A `obj.switch` vs `obj.wall`), **2.58:1** (A vs `obj.wallEchoFill`), **1.14:1** (B vs `obj.wall` — the R7 pair), **2.97:1** (B vs `wallEchoFill`) — every pair below R-C3's 3:1. The precedence answer stands (wall > switch — deterministic picture: the switch is not visible on such a tile); the *shipping* answer does not: **no M3 build may call a board with a switch on a phase-wall tile "integrated"** until the M3 integration gate re-tunes/re-measures the pair — this extends §12 R7's existing switch-vs-wall gate from adjacent-cell class separation to same-cell stacking — or LV forbids the combination outright (OQ6). The same discipline covers the unadjudicated pairs (goal ∩ portal — which is also a *rules*-layer ambiguity, teleport vs win resolution; goal ∩ switch; switch ∩ portal; cross-pair portal ∩ portal): deterministic picture, zero measured contrast, no "integrated" claim without a §3.3-grade gate.

**Implementation mapping (spec authority → the renderer being written now, R-001b).** This document holds spec authority over `src/game/renderer/**`; the Gameplay Engineer writes the code (AGENTS.md §4). In the `BoardView` as committed on develop (`0f53076`), the goal graphics sit **above** the wall graphics (`goalGfx = DEPTH.objects + 1`). That is harmless *today* — goal ∩ wall is impossible and doors are deliberately unimplemented (`objects/registry.ts`) — but it inverts slots 2–4 of this order and would mis-stack the first door ∩ goal cell (a door painted into the wall container would land **under** the goal). Required before M1 door content ships: container depths / paint sequence satisfy **portal < switch < goal < wall < door < actor**; the registry's `TileObjectSpec.layer` field ("draw order inside L4; lower first") is the natural carrier. The concrete numbers and the mechanism (depths vs one sequenced paint call) are the implementer's choice — the resulting picture order is this contract. The same distinction applies to depth **assertions**: R-C13.1 requires only `actor` above *every* L4 layer — it says nothing about goal-vs-wall; any boot-time check that enforces relative L4 depths (the R-001b line of work is adding one) must encode §3.1d's order for the intra-L4 pairs, never cement the inverted goal-above-wall placement. `wall-tiles.ts` / `cell-state.ts` (R-E6 in-place swap, solid/ghost/occupied classification) and `paintActor` (slot 1 / R-C13.1 already satisfied) need no change for this section.

### 3.2 Encoding contract

- **R-C1 — Shape is the primary channel, colour is the phase channel, hue is the tertiary class channel.** No state may be encoded by colour alone. Each class has a unique silhouette:

| Class | Silhouette (mandatory) | Fill rule |
|---|---|---|
| empty | flat cell plate | ground colour |
| wall (active) | **filled rounded square**, 88 % of cell | solid |
| wallEcho (ghost — other phase) | **hollow rounded square**, 80 % of cell, 2 px stroke + knockout phase notch at `cellSize ≥ 56` (§3.1a) | stroke `obj.wallEcho` + flat light tint `obj.wallEchoFill` |
| door (red / blue) | **framed** rounded square (2 px frame) + **3 full-width solid bars** (closed) / **4 corner stubs + empty passable centre** (open) + centre **medallion** with knockout glyph — sun = red (opens in A), crescent = blue (opens in B) — constant across states (§3.1b) | **closed = solid** (bar mass) · **open = hollow** (frame + stubs, interior = ground, never tinted) |
| portal | **diamond outline** with inner swirl (inactive `portalEcho`: outline only, **no swirl** — RESERVED, §3.1c) | hollow |
| switch | **small square outline**, 40 % of cell, corner dot when on | hollow |
| goal | **hollow ring**, 66 % of cell, with a small centre dot | hollow |
| player | **filled round glow** + (auto) contrast ring, 70 % of cell | solid |

- **R-C2 — Fill vs hollow is a semantic axis.** Anything that **blocks entry in the current phase** is *solid*; anything you can pass through or reach is *hollow*. The player is the only solid moving element. This alone makes the board parseable without colour. **Since V0.4 (GATE C Option B) `wallEcho` sits on the HOLLOW side of this axis** (R-E3): a ghost is a legal destination that solidifies at the flip. The V0.3 sentence placing echoes on the solid side (union property) is void. **Since V0.5 doors ride BOTH sides by state (§3.1b): a door closed in the current phase is on the SOLID side (3 full-width solid bars); an open door is on the HOLLOW side (frame + corner stubs, interior = ground, never tinted) — the same grammar as `wall ↔ wallEcho`, so "blocks entry now" is one predicate over walls ∪ closed doors (R-D1).** Marked exceptions, exactly two: **(1)** a solid wall **or closed door** **under the player** (R-C13/R-D7) keeps its filled footprint but drops its interior value and retains its edge/frame — at that moment it blocks nothing (the player is already inside and can always move out; the origin tile is never re-checked), and the read is carried by player-on-top + the occupied treatment; **(2)** the open door's **medallion** — a filled identity disc ≤ 10 % of cell² (measured 9.0–9.6 %) floating in an otherwise empty passage: it is the glyph carrier, never a barrier, and the bar mass carries the fill read (R-D2).
- **R-C3 — Contrast.** Every state-bearing graphic must reach **≥ 3:1** against the cell ground it sits on (WCAG 2.1 SC 1.4.11 non-text contrast), and against `ground.cellAlt` where the graphic can sit on a checker-alternate cell (R-E1). HUD text **≥ 4.5:1** (SC 1.4.3). Verified values in §4.3 / §4.6.
- **R-C4 — Grid lines are structure, not state.** They are exempt from R-C3 but must stay in the **1.6:1 – 2.2:1** band against the cell ground: visible enough to parse the grid, never stronger than any state element.
- **R-C5 — Nothing may cover a cell's state.** No vignette, blur, bloom, particle, glow overlay, or transition effect may reduce the state graphic's coverage below **70 % of its drawn area**, and no effect may be drawn *above* the object layer except the player and the win flash (which is a plate-level tint, not a per-cell cover). The `wallEcho` **knockout notch is part of the state graphic, not a cover**: it removes 0.09 cell² from a 0.64 cell² silhouette → coverage **86 %**, above the floor.
- **R-C6 — Colour-vision safety.** Class distinctions must survive protanopia / deuteranopia / tritanopia. The red↔blue door pair is additionally glyph-coded (R-C1) because luminance separation between red and blue is near zero for deuteranopes (measured: A doors 1.41:1 simulated CR under deutan, but 0.58 simulated hue distance — hence the mandatory medallion glyph, which is **load-bearing at every cell size ≥ 40 px and never size-gated off**, unlike the ghost's redundant ≥ 56 px notch — R-D4 vs R-E4). Door open/closed is additionally structural (bar mass vs empty passage, R-D2), which no simulation can collapse. `wall ↔ wallEcho` is separated on the **value axis only** (R-E2), which no dichromat simulation can collapse — see §4.6.
- **R-C7 — No texture inside cells.** Grain, paper texture and gradients belong to the *background* and the *plate*, never inside a state graphic. Textured walls are deferred in the manifest for exactly this reason. `wallEcho` is a **flat stroke + a flat precomputed tint** (`obj.wallEchoFill`), and `wallOccupied` / `obj.doorRedOccupied` / `obj.doorBlueOccupied` (reserved `obj.portalEcho` alike) are flat precomputed tokens — no hatch, no stripes, no dither, no runtime transparency-over-ground anywhere (flat tokens keep contrast deterministic and unit-testable).
- **R-C8 — One attention magnet.** Exactly one element may animate on an idle board: the goal (2.4 s slow pulse, ±6 % scale, no colour change). Nothing else idles, breathes, sparkles or loops — **including `wallEcho`** (R-E5): echoes are static between moves and change only inside the flip sequence.

### 3.3 Readability QA gate (must pass before art is called "integrated")

1. **Screenshot review** at 360×640, 390×844, 1024×768 for both phases on the same level.
2. **Greyscale test** (§4.4): desaturated screenshot — a fresh viewer must name the current phase correctly, 5/5.
3. **CVD test**: same screenshots through protan / deutan / tritan simulation — every class still separable by shape, and `wall` vs `wallEcho` still separable by **fill rule and value** (R-E2).
4. **1-second player test**: on a 390 px-wide screenshot, a fresh viewer locates the player in < 1 s, 5/5.
5. **Wall/path parse test (V0.5 rewrite — doors join the blocking set):** the viewer states which cells **block entry right now**: **≥ 90 % per viewer AND ≥ 4/5 of the cohort** (§3.3a P-4), with no explanation. **The answer key = every cell that blocks entry in the current phase = current-phase solid walls ∪ current-phase CLOSED doors (R-D1).** Ghosts (`wallEcho`) and **OPEN doors** are legal destinations under Option B and must **not** be scored as blocked; errors in both directions count. (V0.3 scored `wall ∪ wallEcho` — deleted with the union property; V0.4 scored currently-solid walls only — superseded in V0.5: it predates the door contract and would mis-key closed doors from L21 on.) Run in both phases.
6. **Blocking-vs-passable discriminability test (V0.5 rewrite — stratified sampling):** on a **desaturated and CVD-simulated** 390 px screenshot, a fresh viewer sorts **10 sampled object tiles** into "blocks entry now" vs "passable now": **≥ 8/10 per viewer AND ≥ 4/5 of the cohort**, with no explanation. Sampling is deterministic, seeded and stratified (§3.3a P-3): **3 solid walls + 3 ghosts + 2 closed doors + 2 open doors** (door-less builds: 5 solid + 5 ghosts), with a hard cap of **no class > 6 of 10** — the all-ghost / all-solid trivial pass is excluded by construction. This is the direct test of the unified R-C2 axis — walls and doors speak one grammar — with colour entirely removed. Run in both phases.
7. **Refusal feedback test (V0.5 update):** after one refused move and **no** explanation, the viewer must (a) point at the tile that caused the refusal — always a **currently-blocking tile: a solid wall or, from L21 on, a closed door** (game-design §3.1: refusals are caused only by these) — ≥ 4/5, **and** (b) state that **the phase did NOT flip** (ground, chip and wall/door states all unchanged), ≥ 4/5. If (a) fails, solid↔hollow separation has failed and the fix lives inside the R-E bands (walls) or the R-D bands (doors) (§6.5) — never a bigger nudge, flash or text.
8. **Player-in-obstacle test (new V0.4, extended to doors V0.5 — gates R-C13/R-D7):** after the player legally enters a ghost tile **or an open-door tile** and the flip solidifies/closes it, on a screenshot with **no** explanation: (a) a fresh viewer locates the player in < 1 s, 5/5; (b) asked "is the player inside that wall/door a bug or part of the game?", ≥ 4/5 answer *part of the game / intended*. Run in both phases **and — from L21 on — on an occupied wall AND an occupied closed door** (Phase B's tightest pair is body vs `obj.doorBlueOccupied` at 3.63:1; Phase A relies on the mandatory R-C9 ring: 4.93:1 vs `doorBlueOccupied`, body alone 1.83:1 — §4.6 V0.5 rows must hold).

### 3.3a Test protocol (new V0.5 — makes tests 2, 4, 5, 6, 7, 8 falsifiable · closes M-11)

Every "fresh viewer" item above runs under this protocol. **Agent 5 owns the criteria (this section); the Playtest Analyst owns recruitment, moderation and the log** (`docs/playtest-log.md`, `docs/playtest-analysis/**`).

- **P-1 — Cohorts & roles.** n = **5 fresh viewers per phase per test item** (tests 5–8 run in both phases ⇒ 10 sessions per item). "Fresh" = has never played any build of this game, never read this repo's `docs/**`, was not present at the same test item within the last 30 days, and has had the phase rule explained by nobody on the team. The Playtest Analyst recruits and moderates; Agent 5 may observe silently but must **never** moderate, explain or nudge.
- **P-2 — Administration.** Questions are read **verbatim** (scripts below); zero mechanics explanation before or during an item; at most one repetition of a question; leading vocabulary (`wall`, `door`, `phase`, `ghost`, `switch`) is **banned inside the test 5/6 questions**. Every session logs: raw per-viewer answers, build hash, viewport, phase, fixture level ID, sampling seed, and the **`placeholder art` / `final art`** label (R-P7).
- **P-3 — Fixtures & sampling (tests 5/6).** The fixture is a designated readability level (list maintained by the Playtest Analyst in `docs/playtest-analysis/**`). Per phase, a fixture must contain **≥ 4 solid walls, ≥ 4 ghosts**, and — in builds that include L21+ content — **≥ 2 closed doors and ≥ 2 open doors (≥ 1 of each colour where both colours ship)**. Test 5 scores **every numbered non-empty object tile** of the fixture (empty plates and the player's own tile excluded). Test 6's 10 tiles are drawn **by a deterministic script from `GameState`** (seed logged): **3 solid walls + 3 ghosts + 2 closed doors + 2 open doors**; door-less builds: **5 solid + 5 ghosts**. Hard cap: **no class may exceed 6 of 10.** Tiles are numbered **in board context** on the 390 px-wide screenshot, never as isolated crops.
- **P-4 — Scoring.** Test 5: per-viewer accuracy = correct classifications / tiles scored; **errors in both directions count** (calling a passable tile blocking is as wrong as calling a blocking tile passable); pass = **≥ 90 % per viewer AND ≥ 4/5 viewers of the cohort**. Test 6: **≥ 8/10 per viewer, ≥ 4/5 cohort**. Tests 7a/7b: **≥ 4/5 each, cohort-level**. Test 8: (a) **5/5** locate in < 1 s; (b) **≥ 4/5** "part of the game". Tests 2/4: unchanged (**5/5**), same cohort rules.
- **P-5 — Borderline & failure.** All thresholds are **inclusive** (≥ 4/5 means 4 passes; ≥ 90 % means exactly 90.0 % passes). A cohort landing **exactly at** a threshold = **PASS, logged `borderline`**, and requires **one rerun with a fresh cohort** (new viewers, same fixture, new seed) before any token is called "integrated"; **a second consecutive exactly-at-threshold result = FAIL** (conservative rule — a threshold that only ever ties is not being met). Anything below a threshold = FAIL. **Failure in either phase fails the item — phases are never averaged.** A failed item is fixed **only inside the declared bands** (walls: R-E/R-E2a; doors: R-D2/R-D6) — never by re-hueing a token, adding effects or explanatory text, or weakening a test or threshold.
- **P-6 — Evidence.** One log entry per item × phase with raw scores; **no log entry = no pass claim** (AGENTS.md §7). Placeholder-art runs are labelled and **cannot satisfy the final-art gate** (R-P7); §3.3 re-runs in full after A-03/A-04/A-05/A-06 integration.

**Verbatim question scripts (P-2):**

| Test | Script (read verbatim; per numbered tile where applicable) |
|---|---|
| 5 / 6 | "Can the player step into this cell right now — yes or no?" |
| 7a | "You just tried to move there and nothing happened. Which tile stopped you?" |
| 7b | "In that attempt, did the world change between day and night — yes or no?" |
| 8a | "Point at the player." (timed from image reveal; < 1 s) |
| 8b | "The player is inside that wall — is that a bug, or part of the game?" (door variant: "…inside that door…") |
| 2 / 4 | unchanged from §3.3 items 2 and 4 (phase naming on the desaturated shot; player located in < 1 s) |

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

### 4.3 Token map (V0.3–V0.5 values, measured)

Measured with a WCAG 2.1 relative-luminance script on 2026-10-14; the V0.3 rows (`obj.wallEcho` A/B, `obj.wall` B) were recomputed the same day with the same script (offline; re-verify in-app via §3.3 screenshot review). The V0.5 rows (occupied doors, reserved `obj.portalEcho`, re-derived `fx.phaseRing`) were computed the same day with the same script family **after sanity-checking it against the published V0.3/V0.4 rows** (reproduced exactly or within ±0.02: `wallEchoFill` 2.11/1.79 · 2.12/1.86, `wall↔wallEcho` A CR 1.61 / ΔL\* 13.1, `wallOccupied` A blend exact, `fx.phaseRing` V0.4 picks 4.86/3.17, door tokens 5.90/6.24) — see the V0.5 token record below. `CR` = contrast ratio against that phase's cell ground.

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
| `obj.doorRed` | `#B03A32` | **5.90** ✓ (5.02 vs `cellAlt`) | `#FF8A7A` | **6.24** ✓ (5.47 vs `cellAlt`) | red door — **opens in A / closed in B** (`game-design.md` §5). **One token for BOTH states (V0.5 §3.1b, Proposal 2)**: closed = frame + 3 solid bars + medallion; open = frame + corner stubs + medallion over empty ground |
| `obj.doorBlue` | `#2E62B8` | **5.81** ✓ (4.94 vs `cellAlt`) | `#8FC4FF` | **7.83** ✓ (6.87 vs `cellAlt`) | blue door — **closed in A / opens in B**; same one-token rule |
| `obj.doorRedOccupied` | `#D4928B` | **2.49** (2.12 vs `cellAlt`) | `#9C5E64` | **2.86** (2.51 vs `cellAlt`) | red-door bars + medallion **under the player** (R-C13/R-D7) — **new V0.5**, derived: 55 % `obj.doorRed` + 45 % `ground.cell` (the `wallOccupied` formula) |
| `obj.doorBlueOccupied` | `#8CA8D4` | **2.38** (2.03 vs `cellAlt`) | `#5E7EAE` | **3.45** (3.03 vs `cellAlt`) | blue-door occupied variant — **new V0.5**, same 55/45 formula |
| `obj.portalEcho` **(RESERVED — M2/L36)** | `#4C8B91` | **3.82** (3.25 vs `cellAlt`) | `#6CB5B5` | **6.06** (5.32 vs `cellAlt`) | inactive-portal stroke (§3.1c) — **new V0.5, reserved**, derived: 80 % `obj.portal` + 20 % `ground.cell`; provisional until M2 integration |
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
| `fx.phaseRing` | derived → `text.primary` `#3A3226` (**min 4.98:1** across all occupied interiors) | — | derived → `text.primary` `#EAF0FF` (**min 3.63:1** across all occupied interiors) | — | one-shot ring when a flip solidifies/closes the tile under the player (R-C13/R-D7) — **re-derived V0.5**: boot-time **minimax** `argmax_c min_i CR(c, i)` over candidates `{actor.ring, accent, text.primary}` × occupied interiors `{wallOccupied, doorRedOccupied, doorBlueOccupied}`; never per-frame or per-phase. The V0.4 wall-only picks fail the extended set in B (`accent` = 2.49:1 vs `doorBlueOccupied` B) — see the V0.5 token record |
| `feedback.win` | plate tint `#E9C87A` @ 0.18 | — | plate tint `#C9D6FF` @ 0.16 | — | plate-level only, never per-cell cover |

- **R-C9 — Auto contrast ring.** `actor.ring` is drawn **only when `CR(actor.body, ground.cell) < 3`**, evaluated once at boot from the token map (not per frame, not per phase branch). With the current tokens this means: ring ON in Phase A (a light spirit on a light board is 1.30:1 without it, 11.74:1 with it), ring OFF in Phase B (12.52:1 already). One code path, deterministic, unit-testable.
- **R-C10 — Same class, same hue family across phases.** Goal is gold in both phases, portal is teal in both, doors are red/blue in both, **walls are sand-stone in A and violet in B in both states** (active and echo). Only *value* and *temperature* flip with the phase. This is how the player learns "that object is the same object" across a flip — it is also the rule A-06 requires of the two portal sprites.
- **R-C11 — Tokens are the only source of colour.** No hex literal may appear in `src/game/**` or `src/ui/**`. One file (`src/game/theme/tokens.ts` — the shipped path; V0.1–V0.5 named `src/ui/theme/tokens.ts`, corrected in V0.6, see §5.4) exports the map; the DOM consumes it as CSS custom properties (`--ps-*`), Phaser consumes it as colour ints. Both are generated from the same object.
- **R-C12 — Echo, occupied & derived tokens are computed, never hand-picked per level.** `obj.wallEcho`, `obj.wallEchoFill`, `obj.wallOccupied`, `obj.doorRedOccupied`, `obj.doorBlueOccupied`, reserved `obj.portalEcho` and `fx.phaseRing` are single values per phase. The renderer picks `wall` vs `wallEcho` from `theme(phase)` + the tile's `phaseAWalls` / `phaseBWalls` membership, and door open vs closed from the door's `GameState`-derived flag — **data, not a colour decision** (a door's state never changes its token at all, only its geometry — §3.1b). `obj.wallEchoFill` (60/40), `obj.wallOccupied` and both `obj.door*Occupied` (55/45) and `obj.portalEcho` (80/20) follow the fixed blend rules in §4.3: **re-tuning a base wall or door token requires recomputing its derived tokens in the same commit**, with the §4.6 numbers re-measured; `fx.phaseRing` re-runs its boot minimax automatically. No level, no scene and no entity may override any of these tokens.
- **R-C13 — Player inside a solid wall or closed-door tile (new V0.4, extended V0.5 · GATE C Option B).** The player may legally stand on a tile that is a **solid wall in the current phase** (entered as a ghost, solidified by the flip) **or a door closed in the current phase** (entered while open, closed by the flip — doors share wall semantics, `game-design.md` §5, R-D7). This must read as *mechanism, never as a clip-through bug*:
  1. **Z-order:** the player sprite (L5) always draws **above** the obstacle graphic (L4). No wall or door treatment may draw over any part of the player.
  2. **Occupied treatment (steady state):** while the player occupies the tile, the wall interior renders `obj.wallOccupied` instead of `obj.wall`, and a closed door's **bars + medallion** render `obj.door{Red|Blue}Occupied` instead of the door token — visible greyscale drops: wall **2.65:1 (A) / 2.05:1 (B)**; door red **2.37:1 (A) / 2.18:1 (B)**, blue **2.44:1 (A) / 2.27:1 (B)** — all inside the ≥ 1.8:1 band. The obstacle **retains its edge at every cell size**: walls a 2 px `obj.wallEdge` stroke (edge vs occupied interior: A 4.29:1, B 3.65:1; edge vs ground: A 10.38:1, B 9.89:1); doors the **2 px frame in the full door token** (frame vs occupied interior = the drop ratios above; frame vs ground ≥ 4.94:1). R-C3 is satisfied by the edge/frame; the interior band is ≥ 2.0:1 against the worse ground (walls A 2.06 / B 2.38; doors 2.03–3.03).
  3. **Player visibility:** Phase A relies on R-C9's `actor.ring` (ON in A): ring vs occupied interior — wall **4.86:1**, blue door **4.93:1**, red door **4.71:1**; body alone is only 1.83–1.91:1 over doors (1.86 over the wall) — the ring is *mandatory* here, not optional. Phase B body alone reaches wall **4.62:1**, red door **4.38:1**, blue door **3.63:1** ✓.
  4. **One-shot phase ring (event):** at flip resolution a single ring pulses around the player — 2 px stroke, **180 ms**, scale 0.7 → 1.0 of the cell, token `fx.phaseRing`. **Re-derived in V0.5 as a boot-time minimax over every occupied interior** (candidates `{actor.ring, accent, text.primary}`): A → `#3A3226`, min **4.98:1**; B → `#EAF0FF`, min **3.63:1**. The V0.4 B pick (`accent` `#7FD8D0`) fails the extended set at **2.49:1** vs `doorBlueOccupied` B — the re-derivation is mandatory, not cosmetic. (In B the ring is body-coloured; it reads as an expanding halo because it scales 0.7 → 1.0 of the cell while the body covers 70 % — test 8 gates it.) Event feedback like the deny nudge — **not** an idle animation (R-C8 stands), never looped while standing.
  5. **Budget:** the occupied cross-fade + ring live **inside** the existing ≤ 220 ms flip budget (§6.1/§6.2) with **0 ms** added input lock.
  6. **No hidden state:** the treatment only changes the obstacle's interior value; the player stays fully visible (§3.3 test 8a), the tile stays identifiable (test 8b leans on edge/frame + filled silhouette; doors keep frame + medallion), and nothing is drawn outside the occupied cell.
  7. **One code path:** "occupied" is a derived render flag (`player position === wall tile && tile is solid in the current phase`, **or** `=== door tile && that door is closed in the current phase`) computed from `GameState`; no `phase ===` branch, no second prefab (non-negotiable #3).

> **V0.3 token re-tune record (required by the header rule).** Phase-B `obj.wall` was `#8A78D6` = **3.90:1**, the weakest state-bearing token in the whole map for the game's most important obstacle class. It also left **no room** for a subordinate echo: on a `#2A3157` checker-alternate cell, 3:1 requires figure luminance ≥ 0.203 while the old wall sat at 0.237 — a band too narrow for a visible value step (ΔL\* ≈ 3). `obj.wall` (B) is therefore lightened to **`#A795EE` = 5.56:1** (4.88:1 vs `cellAlt`), which opens a clean band for `obj.wallEcho` B = `#7C77AE` (3.47:1) at **ΔL\* 14.0**. Same hue family (violet), same phase-inversion rule (§4.2), no asset prompt touched. Phase A needed no change: `obj.wall` 6.39:1 already left room for `#8E7C5D` at 3.98:1 / ΔL\* 13.1. **Evidence status: offline WCAG computation only** — the in-app §3.3 screenshot review is still pending (no renderer exists yet), and this row is re-verified there before the tokens are called "integrated".

> **V0.4 token record (required by the header rule).** GATE C Option B added three derived tokens, computed offline 2026-10-14 with the same WCAG 2.1 relative-luminance + Viénot (1999) scripts: `obj.wallEchoFill` (ghost tint, 60/40 blend of the stroke over `ground.cell`) A `#BBB09B` **2.11:1** / B `#585786` **2.12:1** — inside the R-E2a band 1.7–2.6:1; `obj.wallOccupied` (wall interior under the player, 55/45 blend of `obj.wall` over `ground.cell`) A `#AFA491` **2.42:1** / B `#6B64A4` **2.71:1**; `fx.phaseRing` (boot-time `argmax` over `{actor.ring, accent}` vs the occupied interior) → A picks `#4A3216` (**4.86:1**), B picks `#7FD8D0` (**3.17:1**). Base tokens (`obj.wall`, `obj.wallEcho`, grounds, edges) are **unchanged** from V0.3 — the V0.3 re-tune record above stays valid. **Evidence status: offline computation only**; re-verified in-app at the §3.3 review (tests 5/6/8 in particular).

> **V0.5 token record (required by the header rule).** UA-0004 (RV-002 H-4) adds **two derived occupied-door tokens and one reserved derived token**, all formula-computed offline 2026-10-14 with this spec's WCAG 2.1 relative-luminance + Viénot (1999) linear-RGB script — sanity-checked against the published V0.3/V0.4 rows before adding new ones (§4.3 note): `obj.doorRedOccupied` A `#D4928B` **2.49:1** / B `#9C5E64` **2.86:1**; `obj.doorBlueOccupied` A `#8CA8D4` **2.38:1** / B `#5E7EAE` **3.45:1** (55/45 door-over-ground blend; drop vs the full token 2.18–2.44:1 ✓ ≥ 1.8; ≥ 2.03:1 vs the worse ground ✓ ≥ 2.0); `obj.portalEcho` (**RESERVED**, M2) A `#4C8B91` **3.25:1** / B `#6CB5B5` **5.32:1** vs the worse ground (80/20 portal-over-ground blend; 70/30 was rejected — A lands 2.65:1 vs `cellAlt`, below the 3.0 stroke band). **No door colour token changed**: `obj.doorRed` / `obj.doorBlue` are the *same values in both open and closed states* (§3.1b Proposal 2) — door state is geometry, not colour. `fx.phaseRing` was **re-derived** under the extended minimax formula → A `#3A3226` (min **4.98:1** across `wallOccupied`/`doorRedOccupied`/`doorBlueOccupied`), B `#EAF0FF` (min **3.63:1**); the V0.4 B pick (`accent` `#7FD8D0`) fails the extended interior set (**2.49:1** vs `doorBlueOccupied` B). **Evidence status: offline computation only**; the in-app §3.3 screenshot review — now under the §3.3a protocol — remains pending; tests 5/6/8 re-verify these rows.


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
| door, closed (A: blue · B: red — new V0.5) | 0.128 | 0.408 | 2.58:1 ‡ |
| doorOccupied (door under player, new V0.5) | 0.383 | 0.160 | 2.06:1 ‡ |
| goal | 0.212 | 0.600 | 2.48:1 |

The grounds invert by more than an order of magnitude, so **the phase is identifiable in pure greyscale**, satisfying non-negotiable #2 without relying on hue. This is the single most robust phase signal in the game and must not be weakened (e.g. by darkening Phase A or lightening Phase B).

(‡ The door rows pair *different hues* across phases — the closed door is blue in A and red in B (`game-design.md` §5) — so their A↔B ratio is informational only; phase identity remains carried by the grounds. The door open/closed axis is **structural** — bar mass 45.0 % vs empty-passage 25.1 % of cell² (§3.1b) — and therefore greyscale-invariant by construction; its within-phase numbers live in §4.6.)

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

**V0.5 additions (doors on the blocking axis · occupied doors · reserved portal-echo — same script family, same day; the script reproduced the published V0.3/V0.4 rows above before these were added):**

| Pair | CR (greyscale separation) | ΔL\* | protan | deutan | tritan | Verdict |
|---|---|---|---|---|---|---|
| A `doorBlue` closed / `wall` (both SOLID-side, same phase) | **1.10:1** | 2.6 | 0.93 | 0.90 | 0.18 | **structure carries it** — framed panel, 3 bars with full-width ground gaps, medallion, coverage 45.0 % vs a uniform filled square at 77.4 %. Luminance is near-identical *by design*; hue is never the argument (same pattern as the V0.1 `A wall / goal` row) |
| B `doorRed` closed / `wall` | **1.12:1** | 3.6 | 0.72 | 0.72 | 0.72 | ✓ same structural argument |
| A `doorRed` open / `wallEchoFill` (both rank-4) | **2.80:1** | 30.2 | 0.93 | 0.96 | 0.48 | ✓ interior ground 1.00:1 vs tint 2.11:1, footprint 88 vs 80 %, corner stubs vs full square (R-D5) |
| B `doorBlue` open / `wallEchoFill` | **3.69:1** | 38.7 | 0.80 | 0.72 | 0.63 | ✓ |
| A `doorRed` open / `wallEcho` stroke | 1.48:1 | 10.9 | 0.28 | 0.39 | 0.25 | ✓ all d ≥ 0.15; structure primary |
| B `doorBlue` open / `wallEcho` stroke | 2.25:1 | 25.2 | 0.55 | 0.48 | 0.49 | ✓ |
| A `doorRed` / `doorBlue` (re-measured with the V0.5 script) | 1.02:1 | 0.4 | 0.98 | 1.00 † | 0.46 | medallion glyph mandatory at every size ≥ 40 px (R-D4) — luminance separation ≈ 0 by design |
| B `doorRed` / `doorBlue` | 1.25:1 | 7.5 | 0.84 | 0.82 | 0.94 | ✓ |
| A `doorRed` / `doorRedOccupied` (drop) | **2.37:1** | 24.9 | — | — | — | ✓ ≥ 1.8 (R-C13.2 / R-D7) |
| A `doorBlue` / `doorBlueOccupied` | **2.44:1** | 25.8 | — | — | — | ✓ |
| B `doorRed` / `doorRedOccupied` | **2.18:1** | 23.1 | — | — | — | ✓ |
| B `doorBlue` / `doorBlueOccupied` | **2.27:1** | 25.4 | — | — | — | ✓ |
| A `player` body / `doorBlueOccupied` · / `doorRedOccupied` | 1.83:1 · 1.91:1 | — | 0.29 / 0.22 | 0.33 / 0.32 | 0.78 / 0.57 | body alone insufficient → **R-C9 ring mandatory in A**: **4.93:1** · **4.71:1** ✓ |
| B `player` body / `doorRedOccupied` · / `doorBlueOccupied` | **4.38:1** · **3.63:1** | — | 1.03 / 0.55 | 0.96 / 0.50 | 0.98 / 0.99 | ✓ body alone (tightest B pair = blue-door occupied 3.63:1) |
| `fx.phaseRing` V0.5 minimax / every occupied interior | A `#3A3226`: wall 5.13 · red 4.98 · blue 5.21 → **min 4.98:1** · B `#EAF0FF`: wall 4.62 · red 4.38 · blue 3.63 → **min 3.63:1** | — | — | — | — | ✓ ≥ 3.0 both phases (R-C13.4) |
| `portalEcho` RESERVED / `portal` (subordination) | A **1.50:1** · B **1.42:1** | 11.3 / 11.7 | 0.30 / 0.16 | 0.30 / 0.15 | 0.13 / 0.28 | provisional (M2) — primary channel is **swirl absence** (§3.1c); the stroke band ≥ 3.0 vs the worse ground holds: A **3.25:1**, B **5.32:1** |

† The `d` columns are recomputed with the V0.5 offline script; small implementation drift vs the V0.1-era §4.5 rows (e.g. deutan doors 1.00 here vs 0.58 published) changes no verdict — every door conclusion is carried by structure and by the mandatory glyph, never by a `d` magnitude ("the `d` columns are confirmation, not the argument"). The §4.5 rows stay as published.

**Geometry numbers (doors — deterministic from `cellSize`, §3.1b):** coverage @56 px: closed **45.0 %** of cell² (58.1 % of footprint), open **25.1 %** (32.4 %) → ratio **1.80:1**; @40 px floor: 48.7 % / 28.7 % → **1.70:1** (contract ≥ 1.6:1). Open/closed weight **0.56–0.59** (cap ≤ 0.65). Medallion **9.0–9.6 %** of cell² (cap ≤ 10 %). Glyph knockout leaves **95.1 %** (closed) / **91.6 %** (open) of the drawn area (R-C5 floor 70 %). Solid-wall reference: **77.4 %**.

**Contract restated as numbers (V0.5 extension):** `ΔL* ≥ 12` (wall pair) **and** `CR(wall, wallEcho stroke) ≥ 1.55:1` **and** `CR(stroke, worse ground) ≥ 3.0` **and** `CR(wall fill, wallEchoFill) ≥ 2.5:1` **and** `CR(wallEchoFill, worse ground) ∈ [1.7, 2.6]` **and** `CR(wall, wallOccupied) ≥ 1.8:1` **and** `CR(player-visible-element, wallOccupied) ≥ 3.0` (via body or R-C9 ring) **and (V0.5)** `CR(door token, worse ground) ≥ 3.0` (measured 4.94–6.87) **and** `CR(door, doorOccupied) ≥ 1.8:1` **and** `CR(doorOccupied, worse ground) ≥ 2.0:1` **and** `CR(player-visible-element, doorOccupied) ≥ 3.0` **and** `fx.phaseRing` minimax `≥ 3.0:1 vs EVERY occupied interior` **and** door geometry: `coverage(closed)/coverage(open) ≥ 1.6` · `open/closed weight ≤ 0.65` · `medallion ≤ 10 % cell²` · **open interior = ground, never tinted** · stub span ≤ 20 % of frame width **and (RESERVED, M2):** `CR(portalEcho, worse ground) ≥ 3.0` with swirl absence as the primary channel. A re-tune that breaks any of these is rejected, not shipped.

---

## 5. Visual hierarchy

### 5.1 Attention budget (strictly ordered)

| Rank | Element | Allowed motion | Allowed area |
|---|---|---|---|
| 1 | **Player (Echo Spirit)** | move hop only (§6) | 70 % of one cell |
| 2 | **Goal** | slow pulse, ±6 % scale, 2.4 s | 66 % of one cell |
| 3 | **Walls (solid, current phase) / doors (CLOSED — blocking, V0.5)** | `wall ↔ wallEcho` state cross-fade during flip only (R-E6 — never created/destroyed); door bar retract/extend during flip or M3 switch resolution only (R-D3); occupied interior drop + one-shot phase ring when a flip solidifies/closes the tile under the player (R-C13/R-D7) | 88 % of a cell |
| 4 | **`wallEcho` (ghosts — passable now) / doors (OPEN — passable now, V0.5)** | state cross-fade during flip only; **never on idle** (R-C8, R-E5, R-D6) | 80 % of a cell (ghost) · 88 % frame at ~25 % ink (open door) |
| 5 | Portals / switches | enter/exit during flip only | 70 % of a cell |
| 6 | Cell plate + grid lines | never | full board |
| 7 | Background art (A-04 / A-05) | never (static image; cross-dissolve on flip only) | full screen |
| 8 | HUD (DOM) | count/chip update only | outside the board |

Rank 4 is a **hard ceiling for echoes** (R-E4): an echo may never outrank, out-contrast or out-size an active wall. If a delivered background or a re-tune makes echoes compete with active walls, the echo is muted further — never the active wall dimmed. The R-E4 **value** ceiling is wall-class-specific and does **not** transfer to open doors (R-D6): doors subordinate by **area** (open/closed weight ≤ 0.65×, measured 0.56–0.59), render at full token strength, and never tint their interior (R-D5).

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
- **Within L4, one cell's graphics stack in the fixed order of §3.1d** (door > wall > goal > switch > portal, ground below in L3, actor above in L5): one ordered table, never per-tile z-sorting (R-Z1). The L4 enumeration above lists classes, not z — §3.1d is the z contract.

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
// src/game/theme/tokens.ts  — the ONLY place colours exist
// (V0.6 path correction: V0.1–V0.5 named src/ui/theme/tokens.ts — see the shipped-location note below)
export type Phase = "A" | "B";
export interface ThemeTokens { ground: {...}; obj: {...}; actor: {...}; text: {...}; hud: {...}; btn: {...}; feedback: {...} }
export const THEME: Record<Phase, ThemeTokens>;         // from §4.3
export function theme(phase: Phase): ThemeTokens;        // single lookup
export function cssVars(phase: Phase): Record<string,string>; // same object -> --ps-*
```

- Renderer, entities and DOM read `theme(phase)`. **Forbidden:** `if (phase === "A") { … } else { … }` with colours/sizes inside; duplicated `LevelSceneA` / `LevelSceneB`; per-phase scene files; per-phase prefabs.
- The phase flip is a **token swap + tween**, not a scene change (§6).
- Adding a new visual = adding a token, not adding a branch.
- Recommended enforcement (QA-owned): a grep/import-boundary test asserting no hex literal (`/#[0-9A-Fa-f]{6}/`) and no `phase === "A"` comparison inside `src/game/**` and `src/ui/**` outside `src/game/theme/tokens.ts`.

**Shipped location (V0.6 correction — UA-0004 leftover, Orchestrator-verified).** The prototype has **no `src/ui/**` tree**. The token module shipped at **`src/game/theme/tokens.ts`** — it exports exactly the §5.4 shape (`Phase`, `ThemeTokens`, `THEME`, `theme()`, `cssVars()`) plus the derived-blend helpers (R-C12), the `FLIP_TIMING` table (§6.1/§6.2/§6.2a/§6.4) and the `LAYOUT` constants (§2.2/§2.3); its sibling **`src/game/theme/assets.ts`** carries the placeholder ↔ Asset-ID tables (`PLACEHOLDER_SLOTS`, `PLACEHOLDER_TO_ASSET`, `assetNameOf`, `unresolvedAssetIds`, `assertNoPlaceholders` — R-P5/R-P6). The DOM side (`src/game/hud/**`) consumes `cssVars(phase)` as `--ps-*` custom properties exactly as this section specifies. **Division of labour unchanged:** §5.4 (this document) remains the **spec authority** for the token map's contents, the R-C11 no-hex-elsewhere law and the skin contract; the files themselves live in `src/game/**` and are **written and owned by the Gameplay Engineer** (AGENTS.md §4) — Agent 5 does not edit them (the deviation was flagged, not silently decided, in the module's own header). If a standalone `src/ui/**` tree is ever spun up, it **imports the same module** — the map is never forked; the move is a rename plus an import update.

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
| 80–200 | **Wall state swap (R-E6)**: walls never enter or exit — each wall tile whose *state* changes cross-fades `wall ↔ wallEcho` (**fill rule solid ↔ hollow** + tokens + footprint 88 ↔ 80 % + edge on/off + tint on/off + notch knockout), 120 ms, stagger ≤ 15 ms by distance from the player. Doors keep their own open/closed swap — **V0.5 (R-D3/R-D8): frame + medallion stay constant; the bars retract to corner stubs (closing → opening) or extend to full width (opening → closing), one width tween per changed door tile, same 120 ms window and stagger rule.** **No sprite is created or destroyed by a flip.** | 2 tweens per changed tile only (tint + scale) — diff the object list, never re-tween the whole board |
| 100–220 | **Background cross-dissolve** A-04 ↔ A-05, 120 ms, alpha only (both textures preloaded) | 2 sprites, alpha tween |
| 140–220 | **Occupied resolution (R-C13, new V0.4; doors V0.5)**: if the player's tile just became a solid wall **or a closed door**, its interior cross-fades to `obj.wallOccupied` **or `obj.door{Red|Blue}Occupied`** (the wall's edge stroke switches on at every cell size; a door's 2 px frame simply stays at full token — R-D7) and the one-shot `fx.phaseRing` pulses around the player — 2 px stroke, 180 ms, scale 0.7 → 1.0. If the tile became a ghost **or an open door** instead, nothing extra happens (the normal swap covers it). | 1 tint tween + 1 ring tween, player's tile only |
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
- **Implementation:** the two variants are **one timing table**, not two code paths — shipped as `FLIP_TIMING: Record<"S" | "CL" | "reduced", FlipTimings>` in `src/game/theme/tokens.ts` (V0.6 path + shape correction: V0.3–V0.5 named `src/ui/theme/tokens.ts` and a two-key record; the third row is §6.4's reduced-motion collapse living in the *same* table, read via `flipTimings(reducedMotion)`). Choosing a variant changes data, never branches. **No timing value changed in V0.6** — the §6.1 budget and the §6.2/§6.2a millisecond tables above stay frozen.
- Reduced-motion (§6.4) collapses both variants to the same 60 ms token swap; causality there is carried by the move itself, not by timing.

### 6.3 Prohibited (delete on sight)

Full-screen white/black flash · gaussian blur or depth-of-field over the board · colour grade that covers cells · pulsing vignette · screen shake > 2 px · any shake at all on a legal move · particles over the player cell · trail/afterimage that lingers > 250 ms · "PHASE SHIFT!" text banner · any transition that locks input · any transition longer than 250 ms · sound longer than 250 ms · **any reactive flash/pop on the solid wall that caused a refusal** (the cause is permanently visible at full emphasis — §6.5; a flash after the fact reads as scolding) · **any idle animation on a ghost** (R-C8, R-E5) · **any treatment drawn over the player sprite while the player occupies a wall tile** (R-C13.1) · **a looping phase ring** — it fires once per flip resolution, never while standing (R-C13.4) · **any tint inside an open door frame** — borrowing the ghost treatment collapses the two rank-4 classes (R-D5) · **any idle animation on door bars, stubs or medallions** (R-C8, R-D6).

### 6.4 Interruption & determinism

- Animation is a **view of state, never a source of it**. The renderer tweens toward `GameState`; if a new move arrives mid-flip, running tweens **snap to their target** and the new sequence starts (animation queue depth = 1). No tween may be allowed to finish "later" and desync from state.
- Fast repeated taps must never produce visual lag accumulation. Test: 10 taps in 1.5 s → final rendered board == final `GameState` (QA regression).
- `prefers-reduced-motion: reduce` → all tweens collapse to a single 60 ms token swap, no hop arc, no object scale, background swaps instantly. Legibility identical, motion removed.
- Audio (if any): one soft 120 ms "flip" cue per legal move, one muted thud-free 90 ms cue on illegal move, both ≤ −18 LUFS relative, no music layer in the prototype.

### 6.5 Illegal move feedback (design: no movement, no flip)

- 90 ms **nudge**: the player sprite translates 4 px toward the blocked cell and returns; `feedback.deny` tints the *player ring only* at 0.5 alpha for 90 ms.
- **No** board-wide flash, **no** shake, **no** red X, **no** sound sting louder than the legal-move cue, **no** text. The player must never feel punished; the world simply does not change (design §12: comprehension over punishment).
- **The cause is on the board at full emphasis.** Under Option B (V0.4) a move is refused **only** when the destination blocks entry *in the current phase* — a full-strength filled `wall` or, from L21 on, a **closed door** (frame + 3 full-width solid bars + medallion, §3.1b). Both are rank-3, the highest-emphasis obstacles on the board. The refusal is therefore legible before the tap: the nudge points at a filled block, and the phase visibly does **not** flip — "the world did not change" is the primary cue (§3.3 test 7b). The V0.3 text (refusals caused by visible echo tiles) is void: **ghosts never refuse anything — and neither do open doors.**
- Tapping a **non-adjacent** cell is not an illegal move — it is a non-input. Nothing happens, no feedback, no penalty. Tapping/swiping toward an **adjacent ghost (`wallEcho`) is a LEGAL move** (R-E5) — **and so is tapping toward an adjacent OPEN door** (R-D1): the player enters, the flip solidifies/closes the tile under them, and the R-C13 presentation applies — **no** nudge, **no** deny feedback. Any implementation that refuses a ghost or open-door entry is a V0.3-era bug, not a design.
- If Stage-2 §3.3 test 7 fails, the fix is **solid↔ghost separation inside the R-E bands** (footprint pair up to 88 ↔ 76 %, ΔL\* up to 18, tint band R-E2a) for walls, or **closed↔open separation inside the R-D bands** (coverage ratio ≥ 1.6:1, stub cap ≤ 20 % of frame width, interior never tinted — R-D2/R-D5) for doors — **never** a bigger nudge, a sound sting, a flash or text.

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
- No information conveyed by colour alone anywhere, including the HUD (R-C1). On the board the concrete cases are the door **medallion** sun/crescent glyph — load-bearing for red↔blue under deutan and therefore rendered at **every cell size ≥ 40 px**, never size-gated off (R-D4) — the **`wallEcho` knockout notch** (§3.1a, redundant, ≥ 56 px), and the door open/closed **bar mass** itself (structural, R-D2). These are why `wall ↔ wallEcho`, `door closed ↔ door open` and `A-door ↔ B-door` all survive CVD simulation.
- Reduced-motion honoured (§6.4).
- **Browser gestures & `touch-action` (new V0.6 — codifies the shipped policy, RV-002 M-8; UA-0004 leftover).** Pinch-zoom **stays available**: WCAG 2.1 SC 1.4.4 (Resize Text) is the same conformance level R-C3 already claims, and the whole pitch is fine-grained cell legibility on a 320 px viewport — blocking zoom would attack the very weakness it is meant to protect. Therefore, as shipped and as required: **no global `touch-action: none`** (not on `html`, `body` or any app root) and **no `user-scalable=no` / `maximum-scale`** — the viewport meta is exactly `width=device-width, initial-scale=1, viewport-fit=cover` (`viewport-fit=cover` per §7.3) and must not be rewritten. Exactly two scoped rules exist: `#app canvas { touch-action: none }` (`index.html`) — the **board surface only**, so R-T4 swipes never scroll or zoom the page — and `touch-action: manipulation` on the HUD buttons (kills the double-tap-zoom delay, keeps pinch). Pull-to-refresh is suppressed by `overscroll-behavior: none` on `body`, which does not touch zoom. The game swallows gestures **only on its own surface, never on the document**; any future change that widens either rule needs a screenshot-review-style record here first.

---

## 8. Touch targets (hard floor ≥ 44 px)

| Control / element | Minimum | Target | Gap to neighbour | Notes |
|---|---|---|---|---|
| Board cell (tap-to-move) | **44 px** (floor 40 px) | **≥ 56 px** | n/a | ≥ 44 px guaranteed by the R-L2 grid cap **except** one flagged case: 320 px viewport on a 7 × 7 grid = 41.1 px (above the 40 px floor → R-T5). Hit area = full cell; a ghost (`wallEcho`) tile **and an open-door tile** are **legal** tap targets and resolve to a successful `MOVE(dir)` (R-E5/R-D1); only currently-blocking tiles (solid walls ∪ closed doors) are refused |
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
- **R-T6.** Desktop: hover shows a 2 px `accent` ring on **legal** adjacent cells. Under Option B (V0.4) an adjacent **ghost (`wallEcho`) tile IS legal** and gets the hover ring — the V0.3 exclusion (union property, ADR-0006) is void; **since V0.5 an adjacent OPEN door is equally legal and equally gets the ring (R-D1)**. Only currently-**blocking** tiles (solid walls ∪ closed doors) are excluded: a ring there would promise a move the rules refuse. Hover must not change hit areas, and hover state must not be the only cue (touch has none).
- **R-T7.** Bottom-bar controls sit inside the thumb arc: ≤ 96 px from the bottom edge (before safe inset), never in the top corners on mobile.

---

## 9. DEV PLACEHOLDER rules (prototype only)

Placeholders exist so logic, layout and readability can be built **before** the ASSET GATE clears. They are never final art.

### 9.1 What is a placeholder vs what is vector-by-design

| Element | Status | Source |
|---|---|---|
| Board plate, cells, grid lines | **vector by design** (not a placeholder) | tokens §4.3 — ships as-is |
| Walls (solid **and** ghost `wallEcho`), occupied-wall treatment (R-C13), **doors — closed / open / occupied variants (§3.1b, R-D7)**, switches | **vector by design** | manifest defers wall/door textures to Stage 5 polish; the ghost is stroke + flat tint (§3.1a), a door is frame + bars/stubs + medallion drawn from its one token with **state carried by geometry, not by art** (§3.1b), and the occupied treatments are derived tokens — so **no asset is requested for any of them** and none may be added without a new `asset-request` |
| Background (A-04 / A-05) | **DEV PLACEHOLDER** → solid `ground.page` colour | art |
| Player (A-03) | **DEV PLACEHOLDER** → filled circle + `actor.ring` | art |
| Goal (A-06) | **DEV PLACEHOLDER** → hollow ring + centre dot | art |
| Portals (A-06) | **DEV PLACEHOLDER** → diamond outline | art |
| Buttons / icons / panels / chips (A-07) | **DEV PLACEHOLDER** → CSS-only: rounded rect, system font label, inline SVG-free shapes | art |
| Cover (A-01), logo (A-02) | **DEV PLACEHOLDER** → nothing shown; boot uses `ground.plate` only | marketing |

### 9.2 The seven placeholder rules

- **R-P1 — Plain geometry, solid colour.** Placeholders are rectangles, circles, rings and diamonds filled with **real theme tokens** (§4.3). No gradients, no textures, no images, no downloaded art, no emoji. Using the real tokens is mandatory: it validates the contrast decisions *now*, so integration cannot silently break readability.
- **R-P2 — Labelled in code.** Every placeholder carries the comment tag `DEV PLACEHOLDER — <AssetID>` at its construction site (e.g. `// DEV PLACEHOLDER — A-03 echo_spirit_a`).
- **R-P3 — Labelled on screen (dev builds only, DOM in the chrome only — V0.6 rewrite).** Two honesty labels, both **DOM**, both outside the board rect: **(1)** a corner badge inside the top HUD bar reads `DEV PLACEHOLDER ART — NOT FINAL`; **(2)** the `?placeholders=1` query flag adds a **dev info strip between the bars and the play area** — a layout box, not an overlay — listing every placeholder's **Asset ID + name** (one item per slot, from R-P5's single lookup table), usage in the item tooltip. Both are rendered only when **not** `import.meta.env.PROD`. The ID↔object binding lives where it was always legal: R-P2's code-site tags. **Superseded (V0.1–V0.5 text):** "`?placeholders=1` … draws each placeholder's Asset ID under it" — per-placeholder labels **on the board** are unsatisfiable: canvas may own no text (§7.1) and no DOM element may intersect the board rect (§7.3); the three clauses could not all hold. The rewrite matches the shipped implementation (`src/game/hud/hud.ts` `.ps-devbadge` / `.ps-devstrip`, `src/game/env.ts` `IS_PROD` + `hasQueryFlag`) and conflicts with neither §7.1 nor §7.3.
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

**No asset is requested for `wallEcho`, the occupied-wall treatment, any door state (closed / open / occupied — §3.1b), or the reserved `portalEcho` treatment (§3.1c).** All are vector-by-design (§9.1): the ghost = `obj.wallEcho` stroke + flat `obj.wallEchoFill` tint + knockout notch; the occupied wall = `obj.wallOccupied` interior + retained edge + the derived one-shot `fx.phaseRing`; a door = frame + bars/stubs + medallion drawn from its **single** hue token with state carried by geometry; the occupied door = the 55/45 derived variant + retained frame. Requesting "ghost wall" or "open door" art would violate R-C7 (no texture inside cells) and R-E4/R-D6 (strict subordination), and would break the R-D3 object-constancy swap. **The 11-image GATE A batch is unaffected — re-confirmed in V0.5 (third confirmation: V0.4 G-6, V0.5 D-7): no regeneration is required** (stated identically in `docs/assets/codex-generation-brief.md` §6, which this task did not edit). **Stage-5 flag (V0.5):** the frozen A-06 prompt bakes the swirl into the flattened portal sprite; if M2 (L36) ships with that sprite, the reserved **swirl-absence** channel (§3.1c) needs a no-swirl variant — Agent 5 files a **new** `asset-request-XX` at Stage-5 kickoff (or keeps portals vector-drawn). Never a silent re-prompt of frozen A-06, never an addition to the current batch.

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
| R9 | **(inverted in V0.4)** Ghost misread as *blocking* (player avoids legal moves, board feels unfair) **or** solid wall misread as ghost (player taps into refusals) | R-C2 fill-rule axis is the primary separator; the knockout notch names the owning phase at `cellSize ≥ 56`; §3.3 tests 5/6 score **currently-blocking only (walls ∪ closed doors — V0.5 answer key, stratified sampling)**, so either misread fails the gate measurably. Tuning inside R-E/R-E2a bands. |
| R10 | **(new V0.4)** Player standing inside a solidified wall reads as a clip-through/stuck bug ("am I trapped?") | R-C13: player always on top, occupied interior drop (≥ 1.8:1 CR change), edge stroke retained at every cell size, one-shot `fx.phaseRing` at flip resolution; §3.3 test 8 gates it ("part of the game, not a bug" ≥ 4/5). The rules guarantee an exit — the origin tile is never re-checked and every legal move flips the phase (**ADR-0008 rules 3–4**). **V0.5: the same treatment + gate extend to occupied closed doors (R-D7).** |
| R11 | **(new V0.5)** Door state misread: an open door reads as blocking (player avoids a legal door) or a closed door reads as open (player taps into a refusal) | Doors reuse the wall grammar the player already learned in L1–L20, before doors ship at L21 (§3.1b); R-D2 structural contract (coverage ratio ≥ 1.6:1 — measured 1.80 @56 px / 1.70 @40 px; open interior = ground, never tinted); frame + medallion constant across the swap (R-D3); §3.3 tests 5/6 sample both door states (P-3 stratification), so either misread fails the gate measurably. Tuning inside the R-D bands only. |
| R12 | **(new V0.5)** Open door ↔ `wallEcho` class confusion (both are rank-4 "passable now, closes at the flip") | Behaviourally benign by construction — both are legal destinations and both trigger R-C13 when the flip closes/solidifies under the player — so the **blocking axis is never ambiguous**, and test 6 scores the axis, not the class name. Class separation is nonetheless measured: interior ground 1.00:1 vs tint 2.11/2.12:1, footprint 88 vs 80 %, corner stubs vs full square, red/blue vs sand/violet hue families (§4.6 V0.5 rows, R-D5). |

**Open questions (need Game Designer / Orchestrator input):**

- **OQ1 — ANSWERED for V0.3, ⚠ pending Game Designer sign-off.** HUD shows a **plain move count only, no par** (§5.3). `par` remains a Solver/difficulty field in the level schema and is not displayed. This resolves the contradiction with `level-design.md` §1 ("displayed as the perfect-clear target") in favour of the simpler UI; the pre-agreed display format if the designer signs par off is `moves 4 / par 6` (§5.3). **Owner of the ruling: Game Designer.**
- **OQ2.** Is a `hintTarget` highlight allowed at all? Default (V0.1, unchanged in V0.3): **not implemented** (design §9 says teach by observation, not by pointing). Token reserved. *Note: `wallEcho` is not a hint* — it is permanent board state (ADR-0007), rendered in every level from L1, so it does not reopen this question.
- **OQ3.** Win dialog copy: one line maximum. Needs the designer's wording (bilingual CN/EN), must not explain the mechanic ("你发现了…！" is forbidden by design §9). Must not contain par (§5.3).
- **OQ4 — CLOSED (2026-10-14).** Confirmed constraint: authored grids are **≤ 7 × 7**; **8 × 8 only with explicit Orchestrator approval** (and then only under R-T5); **9 × 9 and larger are rejected** on mobile portrait. Handed to Level AI + Solver as a generator constraint (R-L2) and matched by the schema cap being tightened in `docs/level-design.md` §1 in parallel (`width`/`height` authored range 3–7). Evidence: §2.3 cell-size table — the 40 px absolute floor holds at every supported viewport for ≤ 7 × 7.
- **OQ5 — CLOSED by ADR-0008 (opened V0.4, UA-0003; resolved by Orchestrator cross-reference pass 2026-10-14).** The GATE C Option B decision voids ADR-0006's post-flip standing check and ADR-0007's rationale ("never enterable ⇒ input failure"). Both are now recorded: **`docs/decisions/0008-phase-solidity-entry-only.md` (Accepted)** partially supersedes 0006 and revises 0007, `game-design.md` V0.4 §3.1 and `architecture.md` V0.4 §6 carry the rule, and `level-design.md` V0.3 rewrote the L3/L4 refusal-as-tutorial ladder with **OQ-1 marked RESOLVED**. **Still open and owned elsewhere:** the Solver must re-verify every level (L1–L50) under the new legality — all pre-ADR-0008 solver results are void (ADR-0008 Consequences). This spec is written **only** for Option B — if the decision is ever reverted, §3.1/§3.1a/R-C13 revert to the V0.3 text.
- **OQ6 — Same-cell combinations with no data-layer verdict (new V0.6, UA-0005 → Level AI + Solver / Game Designer).** §3.1d gives every combination a deterministic *picture*, but these combinations have **no validator ruling and no measured contrast**: goal ∩ portal end (also a rules-layer ambiguity: teleport vs win resolution — Gameplay/Architect), goal ∩ switch, switch ∩ portal, cross-pair portal ∩ portal end, and switch ∩ phase-wall tile (legal today; only the inert case warns; unreadable in *either* stacking with current tokens — R-Z6 numbers). Proposal: extend the §3b adjudication pattern **before M2/M3 content authoring** — hard error or warning per combination, decided on the legibility-law measurement (0 lying tiles), not on taste. **This file records the visual consequence only; the verdicts belong to the validator's owners** (`docs/ai-native-pipeline.md` §3b pattern). No conflict with ADR-0008/0009 was found while writing §3.1d — ADR-0008 rule 7 is a cited dependency (R-Z3), ADR-0009 underpins the §3b measurements; neither is restated or altered here.

---

## 13. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial UI/UX spec: layout & cell-size floor, readability contract, measured Phase A/B token map, visual hierarchy, flip feedback budget, DOM/canvas split, ≥44 px touch targets, DEV PLACEHOLDER rules, asset integration contract | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.3 | **RV-001 reconciliation (UA-002).** **B-1:** §3.1 "phase-inactive objects are absent / never render ghost walls" **superseded** by the `wallEcho` state + binding contract §3.1a (R-E1…R-E8), implementing **ADR-0007**; presentation-only, core rule untouched. New tokens `obj.wallEcho` A `#8E7C5D` (3.98:1) / B `#7C77AE` (3.47:1); B `obj.wall` re-tuned `#8A78D6` → `#A795EE` (3.90 → 5.56:1) to open a legal value band — record in §4.3, measurements in §4.4/§4.6; R-C1/C2/C3/C5/C6/C7/C8/C10 updated, R-C12 added. §5.1 rank 4, §5.2 L4 note, §6.2 wall state swap, §6.3 two new prohibitions, §6.5 cause-is-visible, §9.1 + §10 + §11 echo notes, §3.3 tests 6–7, risks R7–R9. **M-5a:** R-T2 Restart confirm dialog deleted (one tap, no dialog). **M-5b:** par removed from the HUD (§5.3), OQ1 answered pending designer sign-off. **LOW-5:** §6.2a causality rule + Variant CL timings and measured trigger; R-L2 reworded (40 px floor everywhere, 44 px except 320 px/7×7); §2.3 390 px/9×9 marker corrected ⚠ → ✗; §8 cell row and R-T5 made exact. **LOW-6:** `icon_back` RESERVED (§11 + manifest). **OQ4 closed:** authored grids ≤ 7 × 7, 8 × 8 only with Orchestrator approval. | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.4 | **GATE C human decision — core rule Option B (UA-0003).** Walls block **entry only, current phase only, never crush**; the **union property is void**. Presentation semantics revised: §3.1 rationale rewritten (ADR-0007's "input-failure" argument invalidated; ghosts now mandatory for **flip anticipation** + passable/blocking axis); §3.1a `wallEcho` re-semanted as the **passable ghost** — hollow treatment (2 px `obj.wallEcho` stroke + flat `obj.wallEchoFill` tint, 80 % footprint), **R-E3 flipped**, **R-E5 flipped (ghost = legal destination / affordance)**, R-E2/R-E2a/R-E4/R-E6/R-E8 updated; R-C1/R-C2/R-C7 corrected (ghost on the hollow side of the fill axis). **New R-C13** — player legally standing inside a solid wall tile: player on top, `obj.wallOccupied` interior + retained `obj.wallEdge`, one-shot `fx.phaseRing` (boot-derived), ≤ 220 ms budget, no hidden state. New tokens `obj.wallEchoFill` A `#BBB09B` (2.11:1) / B `#585786` (2.12:1), `obj.wallOccupied` A `#AFA491` (2.42:1) / B `#6B64A4` (2.71:1), `fx.phaseRing` A `#4A3216` (4.86:1 vs occupied) / B `#7FD8D0` (3.17:1) — offline computation record in §4.3, measurements §4.4/§4.6. §3.3 tests 5–7 rewritten (union scoring deleted; test 7 adds "phase did not flip"), **test 8 added** (player-in-wall). §5.1, §6.2 (new 140–220 occupied-resolution row), §6.3, §6.5, §8 (cell row + R-T6: ghosts get the hover ring), §9.1, §11, §12 (R8/R9 updated, R10 added), OQ5 added (superseding ADR-0008 pending — Game Designer/Architect). **Asset impact: none — the 11-image batch needs no regeneration** (vector walls, G-6). | Agent 5 (UI / UX / Art Director) |
| 2026-10-14 | V0.5 | **RV-002 H-4 + M-11 + L-2 (UA-0004).** Doors get their binding open/closed contract **on the R-C2 fill axis** — new §3.1b, rules R-D1…R-D8: closed = framed panel + 3 full-width solid bars + centre medallion (SOLID side, blocks entry); open = same frame + retracted corner stubs + medallion over an **empty ground passable centre** (HOLLOW side; passable now, closes at the flip). **Proposal 2 chosen** — one token per door colour in both states (`obj.doorRed`/`obj.doorBlue` values unchanged), state carried by geometry: structure-first axis (R-C2), zero new hand-tunable values (R-C12), object constancy across the flip; measured coverage ratio **1.80:1** @56 px / **1.70:1** @40 px (contract ≥ 1.6), open door ≈ ⅓ of a wall's ink. R-C1 door+portal rows, R-C2 (doors ride both sides; medallion = second marked exception, ≤ 10 % cell²), R-C6 (medallion glyph load-bearing, never size-gated off ≥ 40 px), R-C7, R-C12 updated. **R-C13 extended to closed doors** (doors share wall semantics — game-design §5): new derived tokens `obj.doorRedOccupied` A `#D4928B` (**2.49:1**) / B `#9C5E64` (**2.86:1**), `obj.doorBlueOccupied` A `#8CA8D4` (**2.38:1**) / B `#5E7EAE` (**3.45:1**) — 55/45 formula, drops 2.18–2.44:1 ✓, A ring mandatory (4.71–4.93:1; body alone 1.83–1.91), B body alone (3.63–4.38:1). `fx.phaseRing` **re-derived** (boot minimax over every occupied interior, candidates + `text.primary`): A `#3A3226` min **4.98:1**, B `#EAF0FF` min **3.63:1** — the V0.4 B pick fails the extended set (2.49:1). **L-2 fixed — new §3.1c**: the `*Echo` reservation for inactive portals is redefined off the fill axis (portals are hollow in both states, R-C2): primary channel = **swirl absence**, secondary = reserved derived stroke `obj.portalEcho` (80/20 formula: A `#4C8B91` **3.25:1** / B `#6CB5B5` **5.32:1** vs worse ground; provisional, M2). **§3.3 test 5** answer key = walls ∪ closed doors (open doors + ghosts passable); **test 6** deterministic seeded stratified sampling 3+3+2+2 (door-less 5+5), no class > 6/10; **test 7** refusal cause includes closed doors; **test 8** covers occupied doors. **M-11 fixed — new §3.3a protocol P-1…P-6**: n = 5 fresh viewers per phase per item, cohort ≥ 4/5, verbatim scripts, Playtest Analyst recruits/moderates (Agent 5 owns criteria only), inclusive thresholds + borderline-rerun rule (second consecutive borderline = FAIL), phases never averaged, R-P7 labelling, no-log-entry-no-pass-claim. New measurements in §4.3–§4.6 (offline; in-app review pending) + §4.4 door greyscale rows. §5.1 ranks 3/4, §6.2 (door swap row + occupied resolution covers doors), §6.3 (two new prohibitions: tint inside an open door; idle door animation), §6.5, §7.4, §8 (cell row + R-T6: open doors legal, closed doors excluded), §9.1, §11, §12 (R9/R10 updated; R11, R12 added). **Asset impact: none — the 11-image GATE A batch still needs no regeneration** (doors/occupied/portal-echo are program vectors; D-7); one Stage-5 flag only (A-06 swirl variant would need a NEW asset-request at M2 kickoff). | Agent 5 (UI / UX / Art Director) |
| 2026-10-15 | V0.6 | **Single-cell precedence + R-P3 contradiction + UA-0004 doc-drift fixes (UA-0005).** **Z-1/Z-2:** new **§3.1d** — the single-cell appearance precedence (**player > door > wall > goal > switch > portal > ground**), rules **R-Z1…R-Z6**: one fixed total order expressed as data (never per-cell z-sorting / re-parenting — R-Z1); the trapped state cites the existing clauses **R-C13.1/.2/.4/.5/.7 + R-D7**, no new numbering (R-Z2); goal ∩ wall impossible at the renderer — stated dependency on the validator hard error (ADR-0008 rule 7); goal ∩ door (warning data) adjudicated door-on-top with the goal-over-door alternative rejected on measurement (`obj.goal` vs door token 1.50:1 A / 1.13:1 B) (R-Z3); same-class overlap = level-data declaration order (R-Z4); **the precedence legalises nothing** — door ∩ wall stays a LV-005 hard error (commit `5f9e5f7`, `docs/ai-native-pipeline.md` §3b; changes require Game Designer + UI/Art Director + Orchestrator together) (R-Z5); switch ∩ wall flagged unreadable in both stackings (offline 2026-10-15, §4.3 script method, reproduces the R7 1.14 row: 1.18 / 2.58 A · 1.14 / 2.97 B — all < 3:1) → M3 "integrated" gate extends R7 (R-Z6). Evidence cited: LV-005 measurements (probe: 3 lying reachable states; suite: one of four overlaps per tile lies, `hollow-but-refusing = 4`, honest combos 0) + legibility-law scoping (M0 0/400, opposite-colour portals 0 lying tiles). §3.1 gains a composition pointer; §5.2 a within-L4 bullet; §3.1d maps the contract onto the shipped renderer (goal-graphics depth currently above walls — must invert before M1 doors; registry `layer` field is the carrier; mechanism = Gameplay Engineer's choice). **P-1:** **R-P3 rewritten** — the V0.5 per-placeholder on-board Asset-ID label was unsatisfiable (§7.1 no canvas text + §7.3 no DOM over the board rect); new R-P3 = badge in the top bar + `?placeholders=1` DOM strip **between the bars and the play area** listing Asset IDs from the R-P5 table, matching the shipped HUD (`hud.ts` `.ps-devbadge`/`.ps-devstrip`, `env.ts`), hidden in PROD; R-P1/2/4–7 unchanged. **S-1:** **§5.4 corrected to the shipped paths** — `src/game/theme/tokens.ts` + `assets.ts` (no `src/ui/**` tree exists; DOM side = `src/game/hud/**` consuming `cssVars`); §5.4 stays the **spec authority**, files written/owned by the Gameplay Engineer (AGENTS.md §4); R-C11 + §6.2a references corrected (shipped `FLIP_TIMING: Record<"S" \| "CL" \| "reduced">`); **no token or timing value changed**. **S-2:** **§7.4 codifies the shipped touch policy** (RV-002 M-8): pinch-zoom stays available (WCAG SC 1.4.4), no global `touch-action: none`, viewport meta unchanged (`width=device-width, initial-scale=1, viewport-fit=cover`), only `#app canvas { touch-action: none }` + HUD `manipulation` + body `overscroll-behavior: none`. **S-3:** **OQ6** added (unadjudicated same-cell combos → validator owners); **no ADR-0008/0009 conflict**. **Asset impact: none** — no new art requested, ASSET GATE unchanged, 11-image batch untouched. | Agent 5 (UI / UX / Art Director) |
