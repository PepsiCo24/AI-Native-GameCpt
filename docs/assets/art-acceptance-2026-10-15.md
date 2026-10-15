# Art Acceptance Record — 2026-10-15 (UA1)

> **TASK_ID:** ART-INTAKE-2026-10-15-UA1 · **Reviewer:** Agent 5 — UI / UX / Art Director (vision model, sole visual acceptor of this batch)
> **Scope:** the 11 Codex candidate PNGs under `assets/art/**` (read-only during this task; nothing moved, renamed, overwritten or integrated).
> **Rubric:** the 「验收标准 / Acceptance criteria」 list of `asset-request-01..07-*.md`, read together with `docs/ui-ux.md` V0.7 (§4.1 hue families, §9.1 vector-by-design, §11 delivery validation), `docs/assets/codex-master-prompt.md` (global rules) and the adjudicated conflict rulings listed in §D below.
> **Method:** quantitative evidence = Orchestrator Pillow audit (`audit.json`, reproduced; **including the `supplemental` section added at corrigendum time** — core per-pixel luminance / hue measurements and their method definitions) + the delivery record's method numbers (centre-contrast min/max method; attributed per finding m-5 at each point of use). The QA second implementation was still in flight at corrigendum time (QA-004); where it conflicts with `audit.json`, the Orchestrator corrigendum governs. Every number cited here traces to one of those two packages, with the field or row named at the point of use. All fill % in this record are **bbox-fill** (silhouette bounding-box side / canvas side); the α≥128 pixel-area fraction lives in `files/<name>/silhouette.area_fraction`. Visual evidence = my own inspection of the composited previews in `/private/var/folders/…/art-intake/` (montage, checkerboards, dual-ground smalls, overlays, crops, labelled component map, stretch renders, plus the literal `cover_480.png` test piece added at corrigendum time). Each visual claim below states **what I saw**.
> **Ruling rule:** PASS = every criterion of the asset's request has evidence; REJECTED = at least one criterion violated; PENDING = undecidable (missing evidence, stated). No asset is marked APPROVED / DELIVERED / SHIPPED anywhere in this record.
> **Batch verdict: 3 PASS · 8 REJECTED · 0 PENDING.** Revision requests filed: `asset-request-08..12-*.md`.

---

## A. Per-asset rulings

### A-01 · `cover_hero_1920x1080.png` — **PASS** (with recorded deviations, §D-1, §D-6)

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | PNG ≥1920×1080, exact 16:9, no transparency | audit: 1920×1080, mode RGB, alpha single-valued 255 | PASS (file-level). Upscale flag: derived from 1672×941 by `sips` (§D-6); §11 policy = flag, not reject |
| 2 | Zero text/letters/watermark | `style_montage.png` cover tile: I see only clouds, sky gradient and one small gold spark — no glyph, signature or watermark anywhere | PASS |
| 3 | Upper third clean negative space | montage tile: the upper third is a smooth sky gradient across the centre two-thirds; soft cloud wisps touch only the extreme top-left and top-right corners; a centred logo would sit on clean gradient without retouching | PASS |
| 4 | Flat top-down board + clear L/R split | Board/walls absent by adjudicated conflict ① (global no-grid rule overrides T01 composition — recorded deviation, not scored). Split clause: I see a warm ivory/gold morning half on the left and a deep indigo/violet night half on the right, divided by a soft vertical boundary with the gold spirit spark standing on it, facing right | PASS (split), deviation recorded (no board) |
| 5 | Split obvious at 480 px wide | literal test piece `cover_480.png` (480 px wide, LANCZOS, created at corrigendum time): inspected at exactly 480 px — the warm-left / indigo-right split and the centre spark are unmistakable, **no weakening of the split at 480 px**; the montage tile at ≈533 px corroborates | PASS |
| 6 | Palette inside licensed families | left half ivory/faint-gold/sky-blue haze; right half deep indigo/violet/moonlight — matches §4.1 families exactly as seen in the montage | PASS |
| 7 | Soft flat illustration, no heavy outlines / 3D / photoreal | I see soft airbrushed cloud masses and gentle gradients, no line art, no specular 3D, no photographic texture; language matches the two backgrounds (one studio hand) | PASS |
| 8 | Path/filename | `assets/art/cover/cover_hero_1920x1080.png` present | PASS |

### A-02 · `logo_primary.png` — **REJECTED** · `logo_mark.png` — **PASS**

**logo_primary (criteria 1–8 of request 02):**

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | Real alpha, no white box/fringe | audit RGBA alpha 0–255; `checker_logo_primary.png` shows checkerboard through all non-ink area; no baked plate | PASS |
| 2 | Exactly two lines, exact spelling | montage at full tile scale: I read line 1 "PHASE SHIFT", line 2 "ECHO GRID", correct spelling, no third line, no CJK | PASS |
| 4 | PHASE gold / SHIFT moonlight blue | I see "PHASE" in warm gold, "SHIFT" in moonlight blue, "ECHO GRID" in soft neutral grey, four-point spark above between the lines | PASS |
| 5 | Margins ≥ 8 % all sides | audit `logo_primary.horizontal_margin_fraction = [0.0615, 0.0586]` → **6.15 % / 5.86 % < 8 %** | **FAIL** |
| 6 | No bevel/chrome/3D/grunge | flat letterforms with soft gradient fill, no extrusion, no chrome highlight | PASS |
| 7 | ≥2048² | file is 2048² but interpolated up from a 1280×1280 generation (delivery record §Provenance) — non-native; master prompt forbids upscale; §11 flags generator upscaling | PASS (file-level) — **flag**: non-native 1280→2048 (§11 flag≠reject; req-10 requires native re-generation) |
| 3, 8 | mark-only / path | n.a. / path present | PASS |

Verdict **REJECTED** on criterion 5 (hard numeric fail) only. The non-native 1280→2048 output is a §11 flag, not a rejection ground (unified policy, §D-6); req-10 carries the native-regeneration gate. Revision: `asset-request-10-logo-primary.md`.

**logo_mark (criteria 1, 3–8):**

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | Real alpha, no white box, no fringe | `checker_logo_mark.png`: checkerboard clean around the rounded square; on `small_logo_mark_light/dark.png` (96→24 px on ivory and on indigo) I see no grey/black halo — the 53.9 % "dark semi-alpha edge" statistic is the mark's own indigo-half rim pixels, visually clean on both grounds | PASS |
| 3 | No text; readable at 32×32 | `logo_mark_32.png`: I see a rounded square split by an S-curve into a gold half and an indigo half with a pale crescent — recognisable as the mark; no letters anywhere | PASS |
| 4 | Halves ivory-gold / indigo-moonlight, centre spark | checker view: left half layered ivory-gold waves, right half indigo with moonlight-blue crescent, four-point white spark exactly at the S-boundary centre | PASS |
| 5 | Margins ≥ 8 % | audit silhouette bbox [128,140,895,878] on 1024 → margins **12.5 / 13.7 / 12.5 / 14.2 %** (same convention as logo_primary: left/top = min/W, right/bottom = (W−(max+1))/W; recomputable from the bbox) | PASS |
| 6 | No bevel/chrome/3D | soft flat layers + one glow spark; no extrusion, no chrome | PASS |
| 7 | ≥1024² | 1024², produced by **downscale** from 1280 (legal; no upscale) | PASS |
| 8 | Path | present | PASS |

Verdict **PASS**. Deviations recorded: rounded-**grid** wording dropped per adjudicated conflict ①; a crescent glyph was added in the indigo half (not requested, not forbidden — reinforces the Phase-B read; §D-2).

### A-03 · `echo_spirit_a.png` / `echo_spirit_b.png` — **REJECTED** (both files)

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | ≥512², real alpha, no white box, no dark fringe | audit 512² RGBA, corners alpha 0; `small_spirit_a/b_{light,dark}.png`: gold wisp with pale sky-blue aura rim and violet wisp with moonlight rim, no dark halo on either ground; fringe dark_fraction 0.0148 / 0.0244 | PASS |
| 2 | Centred, fills 65–80 %, identical framing both files | audit bboxes: A 246×320 px = **48.0 × 62.5 %** (below band), B 264×336 px = **51.6 × 65.6 %** (width below band); A≠B framing | **FAIL** |
| 3 | Identical silhouette A vs B (overlay test) | audit IoU 0.8584 (bbox-aligned 0.9541, chamfer 40.8 px). `overlay_echo_spirit_pair.png`: I see the shared grey body, but A's tail is a thin hook with a notch on its left edge while B's tail is a thicker, smoother S-curve, and B's body ring sits outside A's on the lower-right — the shapes are genuinely different, not a registration artefact | **FAIL** |
| 4 | Form A warm-gold body, not pure white | audit `supplemental.core.echo_spirit_a.core_lum_perpixel_mean` = **0.624** (mean of per-pixel relative luminance over α≥200 core pixels; luminance-of-mean-RGB of the same core = 0.6068); core mean RGB (235.9, 200.4, 120.1), HSV hue **41.6°**; smalls on ivory: the body reads as honey-gold clearly darker than the `#FFFDF7`-family ground | PASS |
| 5 | Form B indigo/violet, moonlight core, gentle | `small_spirit_b_dark.png`: violet body, moonlight-blue aura, two soft eye dots — dreamy, not scary | PASS |
| 6 | No limbs/clothes/wings/face, ≤2 eye dots | all previews: round wisp + trailing tail + exactly two dot eyes | PASS |
| 7 | Readable & distinguishable at 48 and 32 | `small_spirit_a_{light,dark}.png`, `small_spirit_b_dark.png` at 96/48/32/24: silhouette holds at 32 on both grounds; gold vs violet instantly separable | PASS |
| 8 | Path | present | PASS |

Verdict **REJECTED** on criteria 2 + 3 (pair clauses bind both files). Revision: `asset-request-08-spirit-pair.md`.

### A-04 · `bg_phase_a_1920x1080.png` — **REJECTED** · A-05 · `bg_phase_b_1920x1080.png` — **REJECTED**

Shared evidence (criteria of requests 04 and 05):

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | ≥1920×1080, 16:9, no alpha | audit 1920×1080 RGB opaque both | PASS (file-level); non-native: resized from 1672×941 (§D-6) |
| 2 | Centre 60 % quiet, local contrast ≤ ~1.6:1 | centre contrast 1.0937 (A) / 1.3517 (B) = centre-60 % **min/max WCAG ratio** (delivery-record method, Orchestrator-reproduced); audit.json `contrast_2_98` (20-grid p2/p98 method) = 1.0318 / 1.0870 cross-corroborates — **both methods ≤ 1.6**; `portrait_bg_a/b.png` and montage: the centre is a featureless gradient, I see no object or hard edge there | PASS |
| 3 | Survives 9:16 centre crop | `portrait_bg_a.png`: plain ivory gradient with a faint warm band at the very bottom; `portrait_bg_b.png`: plain indigo gradient with a faint violet haze band low — identity (bright-warm / dark-cool) survives, no hard shape enters the crop; audit crop contrast 1.014 / 1.032 | PASS |
| 4 | Day vs night member, greyscale separation | audit mean lum 0.8795 vs 0.0200 → **13.28:1** measured on this art pair (`backgrounds.phase_contrast`); disambiguation: the **14.04:1** figure is the ui-ux §4.4 **board-ground token** phase separation (cell ground 0.982 vs 0.024) — a different measurement, not a bar this art pair must meet; A's bright-member status is not weakened (PASS logic unchanged); montage: ivory-gold morning sky vs deep indigo night with tiny stars — unmistakable even without hue | PASS |
| 5 / 6 | No text/characters/board/grid/objects; no horror, no nebula/neon, no vignette flare | montage tiles: A = haze + faint corner cloud banks; B = indigo gradient, few pin-stars top-right, soft cloud banks in the bottom corners; nothing else, no glyphs, no oppressive mood | PASS |
| 7 | Same composition language / camera; cross-dissolve aligns | audit blurred structural correlation **−0.0712**. `diff_structure_ab.png`: the centre diamond is flat (no structural difference) but all four corners carry green/red heat blobs = cloud masses that exist in one phase only or at different positions. `crossfade_mid.png`: at 50/50 I see half-strength cloud wisps in the top-left (A-only) and top-right plus star dots (B-only) that have no counterpart in the other phase — during a real cross-dissolve these would fade in/out at non-matching positions | **FAIL** |
| 8 | Path | present | PASS |

Verdict **REJECTED** (both) on criterion 7 only. The 1672×941→1920×1080 resize stays a §11 flag, not a rejection ground (unified policy, §D-6); req-11 carries the native gate. Everything else passes and must be preserved. Revision: `asset-request-11-background-pair.md`.

### A-06 · `goal.png` — **PASS** · `portal_a.png` / `portal_b.png` — **REJECTED**

**goal:**

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | ≥512², real alpha, no white box/fringe | audit 512² RGBA; corner mean_alpha 0.000–0.019 (tl 0.008 / tr 0.000 / bl 0.019 / br 0.007), opaque_fraction 0.0 at all four corners; `checker_goal.png`: checkerboard visible through the hollow centre and around the ring; the only semi-alpha material is the ring's own warm glow halo (fringe dark_fraction 0.0102) — no grey/black rim | PASS |
| 2 | Centred, 65–80 %, identical framing across the trio | own fill 404×405 px = 78.9 × 79.1 % — inside band and centred (centroid 255,258). The trio-clause is broken by the portals (56.6×83.2 % / 56.8×83.6 %); that violation is scored on the portal rows below and repaired by revision 09, which re-frames all three together | PASS (own numbers); trio mismatch attributed to portals |
| 4 | Hollow ring, never wall/door | checker + `small_goal_{light,dark}.png`: I see an open annulus with a fully transparent centre — no solid block, no frame, no hinge/panel reading at any size | PASS |
| 5 | Gold/amber family in both phases | single gold-amber file; on ivory and on indigo grounds it keeps the same hue (small_goal pair) | PASS |
| 6 | Unambiguous at 48; goal vs portal without colour | smalls at 48/32/24 on both grounds: the circular ring stays crisp; shape language differs from the portals' tall ellipse, so greyscale separation is geometric, not chromatic | PASS |
| 7 | No text/brick/fire/3D | flat gradient annulus with a soft inner shade; no texture, no specular chrome, no glyphs | PASS |
| 8 | Path | present | PASS |

Visual note on "crisp silhouette" (orchestrator open question): at 48 and 32 px the ring band renders as a clean solid annulus — the 44.8 % semi-alpha share lives in the faint outer glow, which disappears at cell size and never muddies the band. The 0.3 % fully-opaque share is therefore not a legibility defect; I see a crisp ring at every tested size. **PASS.** Two delivery-record T08 observations were considered and are closed here: the "~79 % footprint" lands **inside** the frozen criterion-2 [65, 80] band (78.9 × 79.1 %; the prompt's "~70–75 %" is composition guidance, not a gate), and the "bevel-like edge" reading is **denied by direct visual inspection** — no highlight band, extrusion or texture at any tested size — the same treatment as `logo_mark`'s 53.9 % dark semi-alpha statistic (statistic flagged, resolved by inspection, never scored). The trio-framing breach is attributed to the portals and mechanically locked by req-09 gate 2's derived bands (goal fixed at 78.9 × 79.1 %; portals must land in 76.9–80.0 % width / 77.1–80.0 % height).

**portal_a / portal_b:**

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | ≥512², real alpha, no fringe | audit 512² RGBA corners 0; checker previews clean | PASS |
| 2 | Centred, 65–80 %, identical framing across trio | audit bboxes 290×426 (A) = **56.6 × 83.2 %**, 291×428 (B) = 56.8 × 83.6 % — outside the 65–80 band on both axes and inconsistent with goal's 78.9 × 79.1 % | **FAIL** |
| 3 | Identical silhouette A vs B, 100 % overlay | audit IoU **0.9672** (bbox-aligned 0.9631, chamfer 11.6 px). `overlay_portal_pair.png`: I see the shared grey annulus plus thin green (B-only) slivers along the outer-left rim and a green notch at the inner-left where the swirl cut-outs disagree — B is a few pixels larger and the swirl negative space differs | **FAIL** |
| 5 | Teal/blue family both phases | adjudicated conflict ②: global cyan-blue ownership — documentary pointers: delivery record §Provenance ("portals use the global cyan/blue hue ownership rather than the conflicting task-local gold/violet wording"), `codex-master-prompt.md` "# PALETTES — Hue ownership" global line (Goal = gold-amber family, Portal = cyan-blue family, hue fixed across phases), `docs/ui-ux.md` §4.1; montage shows teal (A) and blue (B) — family holds | PASS (deviation recorded) |
| 6 | Unambiguous at 48 | `portals_small.png` (≈48 px on ivory): tall glossy ellipse ring reads clearly | PASS |
| 7 | No text/brick/fire/3D-render | no glyphs or stone; **style observation:** both rings carry hard white specular streaks and inner-shadow bands that read as a glossy 3D torus, unlike the flat soft-gradient language of goal/spirits/chips — recorded as style drift (§D-4) and folded into revision 09's fix list | PASS on the literal list, style drift recorded |
| 8 | Path | present | PASS |

Verdict **REJECTED** (both) on criteria 2 + 3. Revision: `asset-request-09-portal-pair.md`.

### A-07 · `ui_kit.png` — **REJECTED**

Component census (my read of `ui_kit_labelled_1024.png`, **re-inspected once at corrigendum time (RV-003 m-7)** and cross-checked against the audit's 24 coarse components; **index = audit area-descending order = overlay label number**; coordinates in the 512 alpha map): **13 visual elements** —

| Visual element | Component index/indices | Geometry (512 map) |
|---|---|---|
| `panel_frame_a` (ivory fill, gold border) | **0** | 223×79 @ [26,341,248,419] |
| `panel_frame_b` (indigo fill, moonlight border) | **1** | 222×78 @ [264,342,485,419] |
| `btn_primary` (solid gold pill) | **2** | 212×67 @ [32,32,243,98] |
| `phase_chip_b` (periwinkle pill + pale crescent) | **3** | 142×53 @ [291,439,432,491] |
| `phase_chip_a` (gold pill + dark sun) | **4** | 142×52 @ [80,440,221,491] |
| `btn_ghost` (dark outline pill) | **5** | 213×68 @ [267,32,479,99] |
| `icon_restart` (open circular arrow) | **6** | 66×77 @ [161,133,226,209] |
| standalone crescent glyph | **7** | 66×70 @ [365,245,430,314] |
| `icon_undo` (curved left hook) | **8** | 68×70 @ [47,138,114,207] |
| `icon_sound_on` | **9** (speaker body) + **15** (inner wave) + **14** (outer wave) | body 43×64 @ [277,144,319,207]; the two nested arcs sit immediately right of the body |
| `icon_sound_off` | **10** (speaker body) + **13** (× mark) | body 40×60 @ [393,146,432,205]; × 32×32 @ [436,161,467,192] |
| standalone sun glyph | **11** (disc) + **16–23** (8 detached rays) | disc 40×40 @ [237,258,276,297] = ring centre; rays radial (cardinals 20–23, diagonals 16–19) |
| `icon_next` (chevron-right) | **12** | 40×66 @ [94,245,133,310] |

The 24-component count is fully explained by multi-part glyphs (sun = disc + 8 detached rays = 9 components; sound_on = body + 2 waves; sound_off = body + ×). Corrigendum note: the pre-corrigendum census mis-assigned several indices (panels to 6 / "2nd large box", sun disc to 14, sound bodies to 8/9, × to 7-or-13 undecided); the re-inspection pins the panels to components **0/1** (223×79 / 222×78 in the 512 map), which is the bbox criterion 5's corner-radius arithmetic uses (radius ≈ 18–20 px on a 223 px panel width ≈ 8–9 % ≤ 24 %, recomputable), and resolves sound_on = 9+15+14, sound_off = 10+13, crescent = 7.

**Cursor suspicion cleared:** the centre cluster (components 11 and 16–23 — the pinned m-7 census indices) is the sun glyph's disc plus its eight detached ray capsules arranged radially around it — I see a sun, not a pointer/cursor. No cursor-, selection-box- or grid-like element exists anywhere on the sheet; the only arrows are undo/restart/next, the explicit T11 exception (§D-3).

| # | Criterion | Evidence | Verdict |
|---|---|---|---|
| 1 | Sheet ≥2048² or 12 exports; real alpha everywhere | 2048² RGBA; labelled view on checkerboard: transparency genuine around every element, no white box, no baked plate behind icons | PASS (file-level); non-native: interpolated 1280→2048 (§D-6) |
| 2 | Zero baked text | labelled 1024 and montage: no letters, numbers or labels on buttons, panels or chips (the tiny yellow indices are the audit overlay, not asset pixels) | PASS |
| 3 | Icons legible 48 px, recognisable 24 px; consistent stroke/radius | `ui_components_inventory.png`: undo, restart, chevron, speaker+waves, speaker+×, crescent all hold meaning at 48 and remain recognisable at 24 on light ground; stroke weight and corner rounding are uniform across the set (labelled view). Integration note: the set is monochrome dark-indigo, so on a Phase-B dark ground it must be tinted at integration (ui-ux §7 DOM/CSS or Phaser tint) — recorded, not a criterion fail | PASS |
| 4 | Meanings unambiguous without colour, incl. **back (chevron-left)** | undo = curved left-hook arrow, restart = open circular arrow, next = chevron-right, sound on = speaker + 2 waves, sound off = speaker + × (× read as an acceptable slash-family mute mark, §D-5) — all unambiguous in monochrome. **But no chevron-left / back icon exists on the sheet** (13 elements censused; master-prompt T11 omitted it) — the enumerated icon set is incomplete | **FAIL** |
| 5 | panel_frame_a/b 9-slice safe | labelled view: both panels = flat uniform border (gold on ivory, pale moonlight on indigo), completely flat centre, corner radius ≈ 8–9 % of panel width (bbox 223 px, radius ≈ 18–20 px in the 512-map) ≤ 24 % | PASS on structure. `panel_stretch_0..5.png` composites show mis-placed slice seams (top border stopping mid-width, missing corner caps) that are inconsistent with the sheet's uniform-border geometry — I judge them a harness margin artefact, **inconclusive**, and require a Phaser 9-slice re-verification at integration (§E) |
| 6 | Chips icon-only, greyscale-distinguishable | chip_a = gold pill + dark sun disc-with-rays; chip_b = periwinkle pill + pale crescent; no text; in greyscale the two differ by glyph **shape** (radiate sun vs crescent) and by glyph polarity (dark-on-light vs light-on-mid), not by fill alone | PASS |
| 7 | Calm, rounded, low-contrast, no glossy 3D/bevel/skeuomorph | flat pills, thin ghost outline, matte panels — nothing glossy or bevelled | PASS |
| 8 | Exports exactly per 文件名 list | `icon_back.png` can never be cut from this sheet because the back chevron was never drawn → the frozen export list is unfulfillable from the delivered source | **FAIL** |

Verdict **REJECTED** on criteria 4 + 8 (missing `icon_back`). Mitigation recorded: `icon_back` is RESERVED with no consumer (manifest V0.3 LOW-6), so gameplay impact is zero; the revision restores sheet completeness. Revision: `asset-request-12-ui-kit.md`.

---

## B. Summary table

| File | Verdict | Deciding evidence (full detail in §A) | Revision |
|---|---|---|---|
| `cover/cover_hero_1920x1080.png` | **PASS** | no text seen; upper-third clean; L/R split unmistakable at the literal 480 px test piece (533 px montage corroborates); palette in-family; deviations ① + upscale flag | — |
| `logo/logo_primary.png` | **REJECTED** | margins 6.15/5.86 % < 8 % (separate flag: non-native 1280→2048) | req-10 |
| `logo/logo_mark.png` | **PASS** | clean alpha both grounds; readable at 32; margins 12.5–14.2 %; halves + spark correct | — |
| `character/echo_spirit_a.png` | **REJECTED** | fill 48.0×62.5 % below 65–80 band; pair IoU 0.8584 (tails visibly different) | req-08 |
| `character/echo_spirit_b.png` | **REJECTED** | fill 51.6×65.6 % (width below band); pair IoU 0.8584 | req-08 |
| `background/bg_phase_a_1920x1080.png` | **REJECTED** | pair blurred structural correlation −0.0712 (criterion 7) (separate flag: non-native 1672×941→1920×1080) | req-11 |
| `background/bg_phase_b_1920x1080.png` | **REJECTED** | same pair failure (criterion 7) (separate flag: non-native) | req-11 |
| `props/goal.png` | **PASS** | hollow gold-amber annulus, crisp at 48/32/24 both grounds; 78.9×79.1 % in band; trio-framing breach scored on portals | — |
| `props/portal_a.png` | **REJECTED** | fill 56.6×83.2 % off-band/off-trio; pair IoU 0.9672 ≠ identical | req-09 |
| `props/portal_b.png` | **REJECTED** | fill 56.8×83.6 %; pair IoU 0.9672; green B-only slivers in overlay | req-09 |
| `ui/ui_kit.png` | **REJECTED** | `icon_back` absent → criteria 4+8 unfulfillable (separate flag: non-native 1280→2048) | req-12 |

**PENDING list: empty.** Every criterion was decidable from the evidence package + visual inspection. Two items are deferred to integration, not to acceptance: (i) runtime Phaser 9-slice verification of `panel_frame_a/b` (harness composites inconclusive, §A-07 #5); (ii) phase-tint of the monochrome icon set on Phase-B grounds (§A-07 #3).

---

## C. Batch-level visual statements (style consistency, R6)

Looking at all eleven side by side in `style_montage.png`: one palette story (ivory-gold vs indigo-moonlight), one gradient language, one grain weight, no heavy outlines anywhere, no text outside the wordmark. The single style outlier is the portal pair's glossy specular torus treatment (§D-4); the cover/backgrounds share a softer painterly cloud language that still sits inside "soft flat illustration + gentle gradients". The batch reads as one studio — style consistency **PASS** as a batch, with the portal gloss queued for correction in req-09.

## D. Deviation record (adjudicated conflicts + new observations)

1. **① (pre-adjudicated):** global no-board/no-grid/no-wall rule overrides T01's 5×5 board composition and T03's rounded-grid wording → cover and mark carry no grid; not scored as failure. Documentary pointers: delivery record §"Provenance and processing" ("the global no-grid/no-wall rule was chosen over the conflicting T01/T03 composition text"); `codex-master-prompt.md` "# CRITICAL" global block (board cells / grid lines / walls / echo walls / cursors / selection boxes are program vectors, never art) + SELF-CHECK "no grid/board/wall material in any image"; `docs/ui-ux.md` §9.1 (vector-by-design).
2. **New (minor, accepted):** `logo_mark` adds a crescent glyph in the indigo half (not in the frozen prompt, not forbidden; strengthens the Phase-B read; no text introduced).
3. **③ (pre-adjudicated):** T11 arrows (undo/restart/next) are the explicit exception to the global no-arrow rule; confirmed present and limited to those three. Documentary pointers: delivery record §"Provenance and processing" ("T11 arrows were treated as an explicit UI exception"); `codex-master-prompt.md` GLOBAL STYLE global line (no text/numbers/arrows/watermark anywhere; sole exception the T02 wordmark) read against the T11 task text (undo/restart/next arrows); `docs/ui-ux.md` §11 (icon-set integration contract; `icon_back` RESERVED).
4. **New (style drift, corrective):** `portal_a/b` specular-gloss torus look departs from the shared flat-vector language; folded into req-09 fix list (not an extra rejection ground — criteria 2+3 already decide).
5. **New (minor, accepted):** `icon_sound_off` uses speaker + × instead of the rubric's "speaker + slash"; meaning is unambiguous in monochrome, × being a slash-family mute mark.
6. **④ + upscale flags (pre-adjudicated/recorded; policy unified at corrigendum RV-003):** 8 true-alpha files (master self-check "7" was a typo). Non-native outputs in this batch (delivery record §"Provenance and processing"): the three 16:9 wides generated at **1672×941 and resized to 1920×1080** (`sips`), and `logo_primary` + `ui_kit` generated at **1280×1280 and interpolated to 2048×2048**. **Unified policy (Orchestrator-adjudicated, applied batch-wide):** ui-ux §11 read literally — "≥ requested resolution (upscaling accepted, upscaling *by the generator* flagged)" — a flag is recorded and **never counts as a rejection ground**; every REJECTED verdict in this record is therefore decided by criterion-level evidence only (§A-02 criterion 5; §A-04/05 criterion 7; §A-07 criteria 4+8), and the §B deciding-evidence column lists criterion-level evidence with non-native facts parenthetical as separate flags. Native resolution survives only as a **forward re-acceptance gate** inside the revision requests: req-09 gate 3, req-10 gate 2, req-11 gate 3, req-12 gate 2 (unchanged by this corrigendum).
7. **New (recorded, zero impact):** master-prompt T11 omitted `icon_back` from the frozen request-07 content list; nobody adjudicated that drift before generation. Scored as a request-07 completeness failure on the delivered sheet (criteria 4+8) and repaired by req-12; RESERVED status (no consumer) unchanged.

## E. Handoff notes for integration (not acceptance gates)

- Tint the A-07 icon set per phase (dark-indigo originals vanish on Phase-B grounds).
- Re-verify `panel_frame_a/b` with Phaser's 9-slice at integration; the audit harness composites are inconclusive (§A-07 #5).
- Re-run `docs/ui-ux.md` §3.3 readability QA after any PASS asset is integrated; placeholders stay until then (R-P5/R-P6).
- Stage-5 flag from ui-ux §11 stands: frozen A-06 portals bake the swirl; a no-swirl `portalEcho` variant would need its own request at Stage 5.

---

## Corrigendum — RV-003 (2026-10-15)

**This section repairs evidence attribution and policy consistency only; none of the 3 PASS / 8 REJECTED / 0 PENDING changes.** Reviewer re-adjudication of UA1 ("adopt after correction") kept every ruling; the findings below correct the record's documentation. Locations are given as §-references in this file unless another file is named.

- **M-1** (lum 0.624 provenance): §A-03 #4 now cites `supplemental.core.echo_spirit_a.core_lum_perpixel_mean` = 0.624 with its definition (α≥200 core per-pixel relative-luminance mean; luminance-of-mean-RGB = 0.6068; core mean RGB (235.9, 200.4, 120.1); HSV hue 41.6°). Header Method line restates the quantitative sources: `audit.json` incl. the `supplemental` section (added at corrigendum time) + delivery-record method numbers. `asset-request-08-spirit-pair.md`: gate 4 gains the measurement definition (luminance-of-mean-RGB ∈ [0.55, 0.70], anchor 0.6068; core hue ∈ [35°, 50°], anchor 41.6°); the "MUST be preserved" line now cites the audit field instead of "luminance ≈ 0.62".
- **M-2** (non-native policy unified, Orchestrator-adjudicated): §A-02 c7 = PASS (file-level) with flag; §A-02 / §A-04/05 verdict lines drop "+ non-native resolution" (REJECTED decided by criterion 5 / criterion 7 only); §B deciding-evidence column keeps criterion-level evidence with non-native facts as parenthetical separate flags (logo_primary, both bgs, ui_kit); §D-6 rewritten as the unified flag-not-reject policy with native resolution as forward gate in req-09/10/11/12 only. Table c1 flag wording in §A-04/05 and §A-07 kept.
- **M-3** (manifest Status semantics): `asset-manifest.md` Status column restated post-UA1 — A-01 `GENERATED — PASS (candidate, no revision filed)`; A-02 split (primary → req-10, mark PASS candidate); A-03 `NEEDS_REVISION → req-08`; A-04/A-05 `NEEDS_REVISION (REJECTED → req-11)`; A-06 `NEEDS_REVISION → req-09`; A-07 `NEEDS_REVISION (REJECTED → req-12)`; table header sentence "Status = post-UA1 state; delivery-time snapshot in `art-delivery-2026-10-15.md`."; new V0.5.1 header line.
- **m-4** (logo_mark margins): §A-02 mark c5 and §B now read 12.5 / 13.7 / 12.5 / 14.2 % (logo_primary convention `(W−(max+1))/W`; recomputable from bbox [128,140,895,878] on 1024).
- **m-5** (centre-contrast attribution): §A-04/05 c2 names the delivery-record min/max WCAG method (1.0937/1.3517, Orchestrator-reproduced) with `contrast_2_98` (20-grid p2/p98: 1.0318/1.0870) as cross-corroboration, both ≤ 1.6; `asset-request-11-background-pair.md` preserved-quality line and gate 4 name the method (gate: min/max ≤ 1.6, report `contrast_2_98`).
- **m-6** (goal T08 observations + trio lock): §A-06 goal visual note closes the delivery T08 "bevel-like edge" (denied by direct inspection; same treatment as logo_mark's 53.9 % statistic) and "~79 % footprint" (inside the frozen [65, 80] band; "~70–75 %" is composition guidance) observations, and points the trio attribution at req-09 gate 2's mechanical bands (76.9–80.0 / 77.1–80.0).
- **m-7** (ui_kit census indices): §A-07 census re-inspected once against `ui_kit_labelled_1024.png`; the 13-element ↔ index mapping table is now pinned (index = audit area-descending = label number), panels = components 0/1 (223×79 / 222×78 @512 map), sun = 11 + 16–23, sound_on = 9+15+14, sound_off = 10+13, crescent = 7, next = 12, undo = 8, restart = 6, buttons = 2/5, chips = 4/3; criterion 5's radius arithmetic (18–20 px ≈ 8–9 % ≤ 24 % of the 223 px panel bbox) is recomputable from the pinned panel bbox.
- **m-8** (req-12 gate-3 rationale): `asset-request-12-ui-kit.md` gate 3 gains the reason sentence (0.99 = the B=recolor(A alpha) identity contract of req-08/09; back/next are independently drawn mirrored siblings, 0.95 constrains mirror consistency only).
- **m-9** (req-09 hue gate quantified): `asset-request-09-portal-pair.md` gate 4 now states portal core (α≥200) hue ∈ [170°, 230°] (anchors 192.0 / 205.6), goal core hue ∈ [30°, 55°] (anchor 38.7), portal–goal hue distance ≥ 100°.
- **m-10** (0.99 vs 100 % contract): `asset-request-08-spirit-pair.md` gate 1 and `asset-request-09-portal-pair.md` gate 1 gain the note that the prescribed B=recolor(A alpha) pipeline expects `alpha_equal_exact=true` (IoU 1.000); the frozen 100 % requirement is carried by the pipeline contract and 0.99 absorbs only last-ring anti-aliasing.
- **n-11** (fill% definition): header Method line states all fill % are bbox-fill; α≥128 pixel-area fractions live in `files/<name>/silhouette.area_fraction`.
- **n-12** (480 px literal test): §A-01 c5 evidence chain now rests on the new literal test piece `cover_480.png` (480 px, LANCZOS); inspected — split unmistakable, no weakening at 480 px.
- **n-13** (14.04 vs 13.28): §A-04/05 c4 disambiguates 14.04:1 = ui-ux §4.4 board-ground token separation vs 13.28:1 = this art pair's measured phase contrast; A's bright-member status and the PASS logic unchanged.
- **n-14** (documentary pointers for ①②③): §D-1 (①), §A-06 portal c5 (②), §D-3 (③) each cite the delivery-record provenance paragraph, the matching `codex-master-prompt.md` global line and the ui-ux section (§9.1 / §4.1 / §11).
- **n-15** (wides resize wording): §D-6 now states 1672×941→1920×1080 (was "1672→1080").
- **n-16** (goal corners): §A-06 goal c1 replaces "corners 0" with corner mean_alpha 0.000–0.019 (tl 0.008 / tr 0.000 / bl 0.019 / br 0.007), opaque_fraction 0.0.
- **n-17** (QA status): header Method line states the QA second implementation was in flight at corrigendum time (QA-004) and that the Orchestrator corrigendum governs any conflict with `audit.json`.
- **Final-verification residual micro-fixes (Orchestrator-verified residuals):** three leftovers closed at final verification — §A-07 "Cursor suspicion cleared" cluster indices corrected to the pinned m-7 census (components 11 and 16–23); §B cover row now cites the literal 480 px test piece (533 px montage corroborates); req-11 gate 3 and req-12 gate 2 adopt the req-10 gate 2 evidence standard (provenance disclosure + interpolation-artefact check on edges). No ruling changed.
- **req-10 gate 2** (native proof): `asset-request-10-logo-primary.md` gate 2 replaces "metadata proves native" (EXIF cannot prove nativeness after resampling) with provenance disclosure + letter-edge interpolation-artefact check.
