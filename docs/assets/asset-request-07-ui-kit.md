# Asset Request 07 — Basic UI Kit

- **Asset ID:** `A-07`
- **Asset Name:** `ui_kit` — basic interface elements
- **用途:** Minimal HUD/overlay for the prototype: undo, restart, level label backdrop, primary "Next" button, and a phase indicator. Keep it extremely light — this is a puzzle, not a console.
- **数量:** 1 sheet (delivered as separate transparent PNGs; a single sheet is fine as the source)
- **尺寸:** source sheet 2048 × 2048 px; individual icons exported at 128 × 128 px, buttons at up to 1024 × 320 px
- **比例:** mixed (icons 1:1, buttons ~3:1, frame 9-slice)
- **是否透明背景:** Yes (transparent PNG)
- **画面构图 / contents:**
  1. **Buttons** — `btn_primary` (rounded pill, warm gold → soft amber gradient, subtle inner glow) and `btn_ghost` (rounded pill, thin soft outline, near-transparent fill). No text baked in.
  2. **Icon set (line + soft fill, 128×128):** `icon_undo` (soft curved arrow), `icon_restart` (circular arrow), `icon_back` (chevron), `icon_sound_on` / `icon_sound_off`, `icon_next` (chevron-right).
  3. **Panel / frame** — `panel_frame` a soft rounded 9-slice panel (ivory in Phase A, indigo in Phase B variants), low-contrast, for level label and dialogs.
  4. **Phase indicator chip** — `phase_chip_a` (ivory/gold pill with a small sun-light glyph) and `phase_chip_b` (indigo/violet pill with a crescent glyph). **Icon-only, no text.**
  - Everything must stay calm and low-contrast so it never competes with the board. Icons must be legible at ~48px on mobile.
- **统一美术风格:** consistent with the rest of the kit; rounded, soft, calm, premium; no heavy outlines; subtle gradients.
- **中文 Prompt:**
  > 一套极简游戏 UI 素材（透明背景，源文件一张 2048×2048 画板，图标各 128×128）：1) 按钮：圆角胶囊主按钮（暖金到柔琥珀渐变，内发光）与幽灵按钮（细柔描边、近乎透明填充），不含文字。2) 图标：撤销（柔和弧形箭头）、重开（环形箭头）、返回（箭头）、声音开/关、下一步（右箭头），线性加柔和填充。3) 面板：圆角九宫格面板，白昼象牙色与夜晚靛蓝色两个版本，低对比。4) 相位指示胶囊：白昼款（象牙金底，小日光符号）与夜晚款（靛蓝紫底，小月牙符号），仅图标不含文字。整体柔和、圆润、低对比，绝不与棋盘争夺注意力；图标在移动端约 48px 仍需清晰。扁平柔和插画风，细腻渐变，无粗黑描边，干净高级，4K。
- **英文 Prompt:**
  > A minimal game UI asset set on transparent background (one 2048×2048 source sheet; export icons at 128×128): 1) Buttons — a rounded pill primary button (warm gold to soft amber gradient with a subtle inner glow) and a ghost button (thin soft outline, near-transparent fill); no text. 2) Icons — undo (soft curved arrow), restart (circular arrow), back (chevron), sound on/off, next (chevron-right); line plus soft fill. 3) Panel — a soft rounded 9-slice panel in an ivory Light version and an indigo Shadow version, low contrast. 4) Phase indicator chips — a Light pill (ivory-gold with a small sun glyph) and a Shadow pill (indigo-violet with a crescent glyph); icon only, no text. Everything calm, rounded, low-contrast, never competing with the board; icons still legible at ~48px on mobile. Soft flat illustration, gentle gradients, no heavy black outlines, clean premium, 4k.
- **Negative Prompt:**
  > baked-in text, labels, numbers, glossy 3D buttons, drop shadows heavy, bevel, skeuomorphism, harsh outlines, neon, clutter, dark muddy colors, inconsistent icon style, photorealistic, watermark
- **文件名:** `ui_kit.png` (source sheet) → export: `btn_primary.png`, `btn_ghost.png`, `icon_undo.png`, `icon_restart.png`, `icon_back.png`, `icon_sound_on.png`, `icon_sound_off.png`, `icon_next.png`, `panel_frame_a.png`, `panel_frame_b.png`, `phase_chip_a.png`, `phase_chip_b.png`
- **目标目录:** `assets/art/ui/`
- **依赖与阻塞:** Blocks no core puzzle work; needed before UI polish (Stage 4+). Level label / Next button are the minimum used in the Stage 2 prototype.
- **验收标准 / Acceptance criteria:**
  1. Source sheet ≥ 2048 × 2048 px **or** the 12 exports delivered directly; every delivered element has a **real alpha channel** (no white box, no baked panel behind icons).
  2. **Zero baked text**: no labels, no numbers, no letters on buttons, panels or chips. All text is DOM text (see `docs/ui-ux.md` §7.1).
  3. **Icons legible at 48 px and still recognisable at 24 px** (downscale screenshots required); consistent stroke weight and corner radius across the whole icon set.
  4. Icon meanings unambiguous **without colour**: undo (curved arrow), restart (circular arrow), back (chevron-left), next (chevron-right), sound on/off (speaker + waves / speaker + slash).
  5. `panel_frame_a` / `panel_frame_b` are **9-slice safe**: flat (non-gradient) border region, corners ≤ 24 % of the panel width, centre area free of detail so it can stretch.
  6. `phase_chip_a` / `phase_chip_b` are **icon-only** (sun glyph / crescent glyph) and remain distinguishable in a **greyscale conversion** — the chip fill contrast must not be the only difference.
  7. Everything calm, rounded, low-contrast; no glossy 3D, no bevel, no skeuomorphism, no neon, no heavy drop shadow.
  8. Delivered into `assets/art/ui/` with exactly the export filenames listed in **文件名**.