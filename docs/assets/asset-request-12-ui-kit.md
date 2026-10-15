# Asset Request 12 — UI Kit Sheet Revision (RE-GEN, complete element list)

- **Asset ID:** `A-07-R1` (revision of `ui_kit`)
- **Asset Name:** `ui_kit` — source sheet (13→14 elements; exports unchanged)
- **用途:** Minimal HUD/overlay for prototype + UI polish stage; exports feed `PLACEHOLDER_TO_ASSET` (11 integrated, `icon_back` RESERVED).
- **数量:** 1 sheet (2048 × 2048), native
- **比例:** mixed (icons 1:1, buttons ~3:1, panels 9-slice, chips pill)
- **是否透明背景:** Yes
- **Supersedes:** nothing in `asset-request-07-ui-kit.md` is relaxed; this revision only completes the missing element and fixes native resolution.

## Failed measurements / census

- Element census of the delivered sheet (`ui_kit_labelled_1024.png`, 24 coarse components = 13 visual elements): btn_primary, btn_ghost, icon_undo, icon_restart, icon_sound_on, icon_sound_off, icon_next, standalone sun glyph, standalone crescent glyph, panel_frame_a, panel_frame_b, phase_chip_a, phase_chip_b. **`icon_back` (chevron-left) is absent** → request-07 criterion 4's enumerated icon set is incomplete and criterion 8's export list (`icon_back.png`) is unfulfillable from this sheet. (Master-prompt T11 omitted it; drift recorded in acceptance §D-7.)
- Resolution: generated 1280×1280, interpolated to 2048×2048 → non-native.
- Cleared suspicions (no action needed): the centre component cluster is the sun glyph (disc + 8 detached rays), **not** a cursor/pointer; zero baked text; the only arrows are undo/restart/next (explicit T11 exception).

## Qualities that MUST be preserved

- The 13 delivered elements exactly as drawn: flat gold pill + thin ghost outline; uniform thick rounded-stroke monochrome icon set (undo curved hook, restart open circular arrow, next chevron-right, speaker+waves, speaker+×); flat-border ivory panel (gold border) and indigo panel (moonlight border) with flat centres and corner radius ≈ 9 % of panel width (9-slice-safe structure); gold chip + dark sun, periwinkle chip + pale crescent (greyscale-distinguishable by glyph shape/polarity).
- Zero baked text/labels/numbers; calm rounded low-contrast language; no gloss/bevel/skeuomorphism.
- Real alpha everywhere; clean checkerboard transparency.
- 48 px legibility / 24 px recognisability of the icon set on light ground (verified in the inventory).

## Composition (corrected)

Same sheet layout and gaps, plus **one added element: `icon_back` = chevron-left drawn in the identical stroke weight, cap radius and optical size as `icon_next`**, placed in the icon row next to it so the pair reads as mirrored siblings. Total 14 visual elements. Everything else keeps its current cell position so existing crops stay valid where possible.

## 修正后中文 Prompt

> 一张透明背景的极简游戏 UI 素材源板（2048×2048，元素间宽间距、各自独立可切）：1) 圆角胶囊主按钮（暖金到柔琥珀渐变、微内发光）与幽灵按钮（细柔描边、近透明填充），不含文字；2) 线性加柔填图标，统一线宽与圆角：撤销（柔和弧形箭头）、重开（环形箭头）、**返回（左尖括号，与下一步镜像同线宽）**、下一步（右尖括号）、声音开（喇叭加两道声波）、声音关（喇叭加斜叉）；3) 独立符号：日光符号（圆盘加八条短射线）、月牙符号；4) 圆角九宫格面板两版：白昼象牙底金边、夜晚靛蓝底月光边，边框平直、中心无细节可拉伸；5) 相位胶囊两枚：象牙金底加深色日光符号、靛蓝紫底加浅色月牙符号，仅图标不含文字。整体柔和圆润低对比，绝不与棋盘争注意力；图标 48px 可读、24px 可辨。扁平柔和插画风，细腻渐变，无粗黑描边，原生 2048×2048，4K。

## Corrected English Prompt

> One minimal game UI source sheet on a fully transparent background (2048×2048, neat grid of separated elements with wide gaps, each individually cuttable): 1) a rounded pill primary button (warm gold to soft amber gradient, subtle inner glow) and a ghost button (thin soft outline, near-transparent fill), no text; 2) line-plus-soft-fill icons with one consistent stroke weight and corner radius: undo (soft curved arrow), restart (circular arrow), **back (chevron-left, mirrored sibling of next, same stroke)**, next (chevron-right), sound on (speaker with two waves), sound off (speaker with slash-cross); 3) standalone glyphs: sun (disc with eight short rays) and crescent; 4) two soft rounded 9-slice panels — ivory with gold border (Light) and indigo with moonlight border (Shadow) — flat border region, detail-free stretchable centre; 5) two phase chips: ivory-gold pill with dark sun glyph, indigo-violet pill with pale crescent glyph, icon only, no text. Everything calm, rounded, low-contrast, never competing with the board; icons legible at 48 px and recognisable at 24 px. Soft flat illustration, gentle gradients, no heavy outlines, native 2048×2048, 4k.

## Negative Prompt

> baked-in text, labels, numbers, letters, cursor, pointer, selection box, grid lines, board tiles, glossy 3D buttons, heavy drop shadow, bevel, skeuomorphism, harsh outlines, neon, clutter, dark muddy colors, inconsistent icon style, missing chevron-left, photorealistic, watermark, solid opaque background, upscale artefacts

## 文件名 / 目标目录

`ui_kit.png` → `assets/art/ui/` (replace rejected candidate; export filename list unchanged, now fully cuttable).

## 再验收门槛

1. Census: **14 visual elements** present, including a chevron-left `icon_back` in the icon row; component map re-run (connected-component count will exceed 14 by glyph parts — census is by visual element, as in acceptance §A-07).
2. Native 2048×2048 — no upscale; provenance disclosure + interpolation-artefact check on edges (metadata cannot prove nativeness after resampling — same evidence standard as req-10 gate 2).
3. Stroke-weight / corner-radius consistency check across undo/restart/back/next/sound pair (overlay back vs next mirrored: silhouette IoU ≥ 0.95 after horizontal flip). Rationale for 0.95 (not 0.99): the 0.99 gate (req-08 / req-09) constrains the "B = recolor of A's alpha mask" identity contract — one drawing, two palettes; `icon_back` and `icon_next` are two independently drawn mirrored siblings, so 0.95 constrains mirror consistency of stroke, cap radius and optical size only.
4. Re-run: zero baked text; checkerboard transparency; 48/24 px inventory on light ground; chips greyscale distinguishability; panel 9-slice structure (flat border, flat centre, corners ≤ 24 %).
5. Integration-time (not acceptance): Phaser/CSS 9-slice stretch verification of both panels and per-phase tint test of the monochrome icons on Phase-B grounds (acceptance §E).
