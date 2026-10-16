# Asset Manifest — Phase Shift: Echo Grid

> Owner: **Agent 5 — UI / UX / Art Director**
> Version: V0.5.5 · Date: 2026-10-16
> V0.5.5 (UA-0014, 2026-10-16): **canvas-slot rows only — A-03 / A-04 / A-05 / A-06 (goal)** — the revision-round art for the five ASSET-GATE-approved canvas slots is wired as **texture-key swaps** by R-005a on branch `agent/gameplay/r-005a-art-wiring` (HEAD `76e65c3`, unpushed): those rows' statuses → **INTEGRATED-PENDING-MERGE** (merge train pending QA-007-art-probes; `ART_INTEGRATED` stays **false** until A-07 retires from `PLACEHOLDER_SLOTS` in R-005b; degrade fallback pixel-equivalent to base — whole-frame diff 0.123 %; the companion rulings R-1 host box `1.0 × cell` KEEP / R-2 shipped paint order / R-3 A4 switch-corner ACCEPTED are recorded in `docs/ui-ux.md` V0.9.4 §11 + §3.3b Entry 5). The A-06 raster portals stay in the req-09 queue (optional Stage-5 polish, V0.5.2 role). Batch-1 history columns, A-01/A-02 and the A-07 row (V0.5.4) are untouched. No prompt, filename, size or acceptance criterion changed.
> V0.5.4 (UA-0013, 2026-10-16): **A-07 row only** — the revision sheet is delivered (`assets/art/ui/ui_kit.png`, native 2048² RGBA), measured (R-T12 numeric PASS: back/next mirror IoU 1.0000, zero baked text — `art-acceptance-2026-10-16.md`; UA-0012b visual PASS ×4: census 14 incl. chevron-left — `art-visual-review-2026-10-16.md`) and human-signed 2026-10-16 ("签 R-005"); dispositioned by the spec-authority ruling (**`docs/ui-ux.md` §9.1, UA-0013: option (a) CSS-BY-DESIGN FINAL**) — status → **DELIVERED — INTEGRATED AS REFERENCE KIT**: the HUD ships the program token CSS, no DOM consumer in the prototype, the `ui_kit` placeholder slot retires in R-005b (A-07 leaves `unresolvedAssetIds()`; the R-P6 gate then covers A-03/A-04/A-05/A-06). `icon_back` stays RESERVED; `icon_sound_on/off` recorded as no-consumer-by-decision (no audio UI ships). Every other row, the global status line's remaining scope, and the other seven files' revision-round records belong to the R-005a integration pass — this note changes nothing else. No prompt, filename, size or acceptance criterion changed.
> V0.5 (UA1): formal acceptance of the 11-PNG candidate batch by the vision-capable Art Director. New **Acceptance 2026-10-15** column: 3 PASS · 8 REJECTED · 0 PENDING; per-criterion evidence in `docs/assets/art-acceptance-2026-10-15.md`; revision requests `asset-request-08..12-*.md`. V0.4 rows, paths, sizes, prompts and provenance unchanged. **Nothing is DELIVERED / APPROVED / SHIPPED.**
> V0.5.1 (corrigendum RV-003, 2026-10-15): evidence-attribution and policy-consistency corrections only — **3 PASS / 8 REJECTED / 0 PENDING unchanged**. Status column restated in post-UA1 semantics (A-01 PASS candidate with no revision filed; A-02 split primary→req-10 / mark PASS candidate; A-03→req-08, A-06→req-09 pointers; A-04/05 REJECTED→req-11, A-07 REJECTED→req-12); non-native resolution unified as a ui-ux §11 flag-not-reject (deciding grounds unchanged); acceptance record gains a Corrigendum RV-003 section (M-1..M-3, m-4..m-10, n-11..n-17, req-10 gate 2). No ruling, request or image changed.
> V0.5.2 (UA-0008 Q3, 2026-10-15): portal status aligned with `docs/ui-ux.md` **V0.8** — **portals are vector-by-design** (§3.1c construction, §9.1); the renderer draws the diamond + swirl from tokens and registers **no** placeholder id (`PLACEHOLDER_TO_ASSET` binds A-06 to the goal alone — correct, not a gap). The A-06 raster portal pair (in the req-09 revision queue) is therefore **optional Stage-5 polish, never a shipping dependency**; the vector portal ships as-is if req-09 never clears. **No new asset-request filed (req-09 only); no ruling, image, prompt, filename or size changed; 3 PASS / 8 REJECTED / 0 PENDING unchanged.**
> V0.5.3 (UA-0008d, 2026-10-15): pre-D3 schedule sweep (LV-007C OQ3 hand-off) — the stale "portal at L36" references in the A-06 priority cell, `asset-request-06-goal-portal.md`, `asset-request-09-portal-pair.md` and `first-batch-prompts.md` now read **L11** per ADR-0009 D3, each annotated "(pre-D3: L36)". **Schedule wording only** — no ruling, prompt, filename, size or acceptance criterion changed; the V0.5.2 portal role (optional Stage-5 polish, never a shipping dependency) and the 3 PASS / 8 REJECTED / 0 PENDING tally stand.
> V0.4: Recorded the user-directed 11-PNG generation batch as **generated candidates only**. Technical and visual acceptance remains open; see `docs/assets/art-delivery-2026-10-15.md`.
> V0.3 (UA-002): `icon_back` marked **RESERVED** (no consumer); `wallEcho` recorded as vector-by-design — **no art requested**. **No prompt, filename, size or acceptance criterion changed.**
> Status: **GENERATED — NOT APPROVED / NOT INTEGRATED** (batch-1 snapshot 2026-10-15; revision-round acceptance is signed 2026-10-16 and recorded row-wise — A-07: **DELIVERED — reference kit**, V0.5.4; canvas slots A-03 / A-04 / A-05 / A-06-goal: **INTEGRATED-PENDING-MERGE**, V0.5.5 — branch `agent/gameplay/r-005a-art-wiring` @ `76e65c3`, merge train pending QA-007-art-probes, `ART_INTEGRATED` false until R-005b; A-01/A-02 remain batch-1 candidates)
> Copy-paste generation sheet for the user: **`docs/assets/first-batch-prompts.md`**
> Visual spec that consumes these assets: **`docs/ui-ux.md`** (§11 integration contract)

## Rules

- The Asset Gate in `AGENTS.md` §8 remains the repository baseline. For this batch, the user explicitly instructed generation and reattached the full brief; this manifest records the resulting candidates without changing `AGENTS.md` or treating the files as approved final art.
- After delivery, Agent 5: **checks → names → resizes → verifies transparency → verifies style consistency → places into `/assets`** → registers the row below as `DELIVERED` with filename + date → swaps the DEV PLACEHOLDER via `PLACEHOLDER_TO_ASSET` → re-runs the readability QA gate (`docs/ui-ux.md` §3.3).
- Target directory convention: `assets/art/<category>/<name>.png`. The **filename inside each request doc is authoritative**; a `_<W>x<H>` suffix is used for full-frame images (cover, backgrounds) so multiple resolutions can coexist. Agent 5 normalises at integration if a variant is needed.
- A row is only `DELIVERED` after validation. Nothing is `SHIPPED` on the strength of an opinion (AGENTS.md §7).

## First batch (Stage 1) — generated candidates

Status = post-UA1 state; delivery-time snapshot in `art-delivery-2026-10-15.md`.

| ID | Asset | File (target) | Size | Transparency | Priority | Request doc | Status | Acceptance 2026-10-15 (UA1) |
|---|---|---|---|---|---|---|---|---|
| A-01 | Cover / Hero Image | `assets/art/cover/cover_hero_1920x1080.png` | 1920×1080 | No | P2 (marketing) | `asset-request-01-cover.md` | **GENERATED — PASS (candidate, no revision filed)** | **PASS** (deviations recorded: no board per adjudicated conflict ①; 1672→1920 upscale flagged §11) — `art-acceptance-2026-10-15.md` §A-01 |
| A-02 | Logo (primary + mark) | `assets/art/logo/logo_primary.png`, `assets/art/logo/logo_mark.png` | primary 2048×2048 · mark 1024×1024 | Yes | P2 (marketing) | `asset-request-02-logo.md` | **GENERATED — SPLIT: logo_primary NEEDS_REVISION (→ req-10) · logo_mark PASS (candidate, no revision filed)** | **SPLIT — logo_primary REJECTED** (margins 6.15/5.86 % < 8 %; separate flag: non-native 1280→2048; req-10) · **logo_mark PASS** — §A-02 |
| A-03 | Echo Spirit (Idle A / Idle B) | `assets/art/character/echo_spirit_a.png`, `assets/art/character/echo_spirit_b.png` | 512×512 each | Yes | **P0 — blocks Stage 2** | `asset-request-03-echo-spirit.md` | **GENERATED — NEEDS_REVISION → req-08** · **Revision round: DELIVERED — INTEGRATED-PENDING-MERGE (R-005a texture-key swap, branch `agent/gameplay/r-005a-art-wiring` @ `76e65c3`; V0.5.5)** | **REJECTED** (pair silhouette IoU 0.8584 ≠ identical; framing 48.0×62.5 % / 51.6×65.6 % below the 65–80 band; req-08) — §A-03 |
| A-04 | Phase A background | `assets/art/background/bg_phase_a_1920x1080.png` | 1920×1080 | No | **P0 — blocks Stage 2** | `asset-request-04-phase-a-background.md` | **GENERATED — NEEDS_REVISION (REJECTED → req-11)** · **Revision round: DELIVERED — INTEGRATED-PENDING-MERGE (R-005a texture-key swap, branch `agent/gameplay/r-005a-art-wiring` @ `76e65c3`; V0.5.5)** | **REJECTED** (pair blurred structural correlation −0.0712 violates same-composition criterion; separate flag: non-native 1672→1920; req-11; centre quietness / crop / greyscale all pass) — §A-04 |
| A-05 | Phase B background | `assets/art/background/bg_phase_b_1920x1080.png` | 1920×1080 | No | **P0 — blocks Stage 2** | `asset-request-05-phase-b-background.md` | **GENERATED — NEEDS_REVISION (REJECTED → req-11)** · **Revision round: DELIVERED — INTEGRATED-PENDING-MERGE (R-005a texture-key swap, branch `agent/gameplay/r-005a-art-wiring` @ `76e65c3`; V0.5.5)** | **REJECTED** (same pair failure as A-04; req-11) — §A-04 |
| A-06 | Goal + Portal | `assets/art/props/goal.png`, `assets/art/props/portal_a.png`, `assets/art/props/portal_b.png` | 512×512 each | Yes | **goal = P0** · portals = P2 (**L11** per ADR-0009 D3; pre-D3: L36) | `asset-request-06-goal-portal.md` | **GENERATED — NEEDS_REVISION → req-09** · **portal role V0.5.2: optional Stage-5 polish only — the vector portal ships (`docs/ui-ux.md` §9.1, V0.8)** · **Revision round: goal DELIVERED — INTEGRATED-PENDING-MERGE (goal wired by R-005a; the portal pair stays in the req-09 queue — vector ships; branch `agent/gameplay/r-005a-art-wiring` @ `76e65c3`; V0.5.5)** | **SPLIT — goal PASS** (hollow gold-amber annulus, crisp at 48/32/24, 78.9×79.1 % in band) · **portal_a/b REJECTED** (pair IoU 0.9672; fill 56.6×83.2 % off-band and off-trio; req-09) — §A-06 |
| A-07 | Basic UI kit | `assets/art/ui/ui_kit.png` → 12 exports (`btn_primary`, `btn_ghost`, `icon_undo`, `icon_restart`, `icon_back`, `icon_sound_on`, `icon_sound_off`, `icon_next`, `panel_frame_a`, `panel_frame_b`, `phase_chip_a`, `phase_chip_b`) | sheet 2048×2048 · icons 128×128 · buttons ≤1024×320 | Yes | P1 (UI polish) | `asset-request-07-ui-kit.md` | **DELIVERED 2026-10-16 (revision round, human-signed "签 R-005") — INTEGRATED AS REFERENCE KIT per UA-0013 (`docs/ui-ux.md` §9.1: CSS-by-design FINAL — the HUD ships the token CSS, no DOM consumer in the prototype; `ui_kit` slot retires in R-005b; never loaded at runtime)** | Batch-1: **REJECTED** (`icon_back` absent from sheet → criteria 4+8 unfulfillable; non-native 1280→2048; req-12) — §A-07. **Revision round: ACCEPTED — signed 2026-10-16** (R-T12 numeric all-PASS: mirror IoU 1.0000, native 2048, true alpha — `art-acceptance-2026-10-16.md`; visual 4/4 PASS: census 14 incl. chevron-left, mirror siblings, zero baked text, stroke family + 9-slice-safe panels — `art-visual-review-2026-10-16.md`; disposition = reference kit, UA-0013) |

Candidate file count present: **11 files**, including A-07 as one source sheet. Presence is not acceptance.

## Acceptance ruling — 2026-10-15 (UA1 · Agent 5, vision review)

- Full per-criterion record (measured + visual evidence, deviation log, PENDING list): **`docs/assets/art-acceptance-2026-10-15.md`**.
- Result: **3 PASS** (`cover_hero`, `logo_mark`, `goal`) · **8 REJECTED** (`logo_primary`, `echo_spirit_a/b`, `bg_phase_a/b`, `portal_a/b`, `ui_kit`) · **0 PENDING**. No file is DELIVERED / APPROVED / SHIPPED; placeholders stay (R-P5/R-P6).
- Revision requests filed (same runtime filenames replace the rejected candidates): `asset-request-08-spirit-pair.md`, `asset-request-09-portal-pair.md`, `asset-request-10-logo-primary.md`, `asset-request-11-background-pair.md`, `asset-request-12-ui-kit.md`.
- **Portal addendum (V0.5.2, UA-0008 Q3):** `docs/ui-ux.md` V0.8 rules portals **vector-by-design** (§3.1c construction, §9.1): the renderer draws the diamond + swirl from tokens and registers no placeholder id, so `PLACEHOLDER_TO_ASSET` binding A-06 to the goal alone is correct, not a gap. The A-06 portal pair changes role accordingly: the **req-09 revision queue stays exactly as the user left it** (the portal_a/b rejection stands; nothing is cancelled or re-prompted by this ruling), but a delivered, accepted portal pair is now **optional Stage-5 polish** — no milestone, gate or readability claim depends on it, and the vector portal ships as-is if req-09 never clears. The goal half of A-06 is unaffected (P0, Stage 2). **No new asset-request filed.**
- Integration-deferred checks (not acceptance gates): Phaser 9-slice re-verification of `panel_frame_a/b`; per-phase tint of the monochrome A-07 icon set on Phase-B grounds; §3.3 readability QA re-run after any integration.
- PASS rows enter integration only through the normal gate: rename/registry as DELIVERED **after** the Orchestrator-user authorises commit and §3.3 QA passes. The three PASS files remain candidates until then.

## Generation delivery record — 2026-10-15

- Full per-file measurements and pass/fail notes: `docs/assets/art-delivery-2026-10-15.md`.
- All 11 expected PNG paths exist at their exact requested output dimensions; eight are RGBA with non-constant alpha and three are opaque RGB.
- Known hard failures include non-identical Echo Spirit silhouettes, non-identical portal silhouettes, and insufficient primary-logo side margins. Additional visual and integration checks remain open.
- No asset is `DELIVERED`, `APPROVED`, `SHIPPED`, or integrated into the game on the strength of this generation run.

> **A-07 note (V0.3, LOW-6):** `icon_back` is **RESERVED — no consumer in the prototype** (there is no back navigation: no lobby, no level select, no settings tree; see `docs/ui-ux.md` §11). It **stays in the export list** so the sheet and the frozen prompts are unchanged, but it will not be integrated or wired. Nothing for the user to do differently.

## Field audit vs AGENTS.md §8 — 2026-10-14 (Agent 5)

Required fields: Asset ID / Name / Usage / Quantity / Size / Ratio / Transparency / Composition / Shared Style / CN prompt / EN prompt / Negative prompt / Filename / Destination / Acceptance criteria.

| ID | Result before audit | Action taken |
|---|---|---|
| A-01 … A-07 | 13 of 15 fields present in every doc. **Missing in all 7: `Asset ID`** (the ID existed only in this manifest and in the document title) and **`Acceptance criteria`** (no measurable delivery check). | Both fields added inside each request doc — `Asset ID` as the first bullet, `Acceptance criteria` as a numbered list at the end. **No other content was modified**; all 21 prompts (EN / CN / negative × 7) are byte-identical to their pre-audit text (verified programmatically). |
| A-02 | Size row here said "2048×2048" for both files; the request doc specifies primary 2048 and mark 1024. | Manifest corrected to match the request doc. |
| A-04 / A-05 | Manifest listed `bg_phase_a.png` / `bg_phase_b.png`; the request docs specify `bg_phase_a_1920x1080.png` / `bg_phase_b_1920x1080.png`. | Manifest corrected to match the request docs (authoritative). |
| A-06 / A-07 | Manifest size cells said "see doc" / omitted the export list. | Filled in from the request docs. |

All 7 requests are now **complete and gate-ready**.

## Not yet requested (deliberately deferred)

| Feature | Why deferred |
|---|---|
| Wall tile textures | Done with clean vector/code for maximum readability (`docs/ui-ux.md` §9.1: **vector by design**, not a placeholder); revisit in Stage 5 polish. |
| `wallEcho` (other-phase wall, ADR-0007) | **Not an art request — deliberately.** It is vector-by-design (`docs/ui-ux.md` §3.1a, §9.1): a flat `obj.wallEcho` token fill at an 80 % footprint with a knockout phase notch. Ghost/echo art would violate R-C7 (no texture inside cells) and R-E4 (echoes must stay strictly subordinate to active walls). Do not generate one. |
| Door sprites | **Vector-by-design** (`docs/ui-ux.md` §3.1b / §9.1, V0.5): a door is frame + bars/stubs + medallion drawn from its single hue token with state carried by geometry — **no art requested**, and none may be added without a new `asset-request`. (Row pre-dates the V0.5 door contract; corrected V0.5.2.) |
| VFX / particles | Explicitly deprioritized (readability first); particle budget is **0** in the prototype. |
| Level-select art | No lobby in prototype. |
| Store / social / reward art | Out of scope by design. |
| Echo Spirit "hop" pose | Optional 3rd sprite in A-03; movement is a 130 ms tween, so it is not required. |

## Global art direction (shared by all requests)

**Style:** calm premium casual-puzzle illustration; soft flat vector with gentle gradients; clean geometric shapes; generous negative space; subtle paper/light grain; soft diffused lighting; **no heavy black outlines**; nothing busy behind the play area; cohesive across all assets.

**Phase A (Light / 白昼) palette:** ivory `#F7F1E3`, faint gold `#E9C87A`, sky blue `#A8D8F0`, warm sand, soft morning haze.

**Phase B (Shadow / 夜晚) palette:** deep indigo `#1B1F3B`, violet `#4A3D7A`, moonlight `#C9D6FF`, cool teal accent, dream-like dusk.

**Hard constraint:** the two worlds must read as clearly different, but must never reduce grid/obstacle/path readability. Backgrounds must stay low-detail and low-contrast behind the board.

**Relationship to the board tokens (read this before "fixing" a colour):** the palettes above are **art / background** colours. Used directly as *board figures* on a light Phase A ground they fail the ≥ 3:1 contrast floor (measured: `#E9C87A` on an ivory cell = 1.59:1, `#A8D8F0` = 1.50:1). `docs/ui-ux.md` §4.2–§4.3 therefore derives deeper **figure shades** from the same hue families (deep sand-stone walls, deep amber goal, deep sky-teal portal in A; brighter violet / moonlight / pale gold / teal in B) and inverts figure-ground between phases. This changes **no prompt and no delivered art** — it only governs how the board is drawn.

## Delivery risks tracked at intake

| # | Risk | Check at intake |
|---|---|---|
| R1 | A-04 / A-05 centre busier than spec → cells lose contrast | centre 60 % local contrast ≤ ~1.6:1; else add a 0.35–0.5 scrim (`docs/ui-ux.md` R-L4) |
| R2 | A-03 form A delivered as pure white → 1.30:1 on a Phase A cell | prefer a deeper-gold take; renderer adds the auto contrast ring (R-C9, 11.74:1) either way |
| R3 | A-06 portals delivered with mismatched silhouettes | overlay test: `portal_a` / `portal_b` silhouettes must match 100 % |
| R4 | Transparency flattened to a white box, or a dark fringe baked into a glow edge | checkerboard test on every `Transparency = Yes` row |
| R5 | Baked text / watermark anywhere | reject; all in-game text is DOM text |
| R6 | Style drift between assets (outline weight, grain, saturation) | side-by-side review of the whole batch before any row goes `DELIVERED` |
