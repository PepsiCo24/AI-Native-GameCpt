# Asset Request 10 — Primary Wordmark Revision (RE-GEN)

- **Asset ID:** `A-02-R1` (revision of `logo_primary` only; `logo_mark` PASSES and is **not** regenerated)
- **Asset Name:** `logo_primary` (wordmark)
- **用途:** Title on cover/landing and boot/win screens (≤ 640 px, ui-ux §11).
- **数量:** 1
- **尺寸:** 2048 × 2048 px canvas, **native generation at 2048** (no interpolation from 1280)
- **比例:** 1:1
- **是否透明背景:** Yes
- **Supersedes:** `asset-request-02-logo.md` criterion 5 margin target raised to a measured gate; all other frozen criteria stay.

## Failed measurements

- Ink bbox [126, 583, 1927, 1363] on 2048 → horizontal margins **6.15 % / 5.86 %** < required 8 % (vertical 28.5 / 33.4 % were fine).
- Resolution: generated at 1280×1280 and interpolated to 2048×2048 → non-native (master prompt forbids upscaling; ui-ux §11 flags generator upscaling).

## Qualities that MUST be preserved

- Exact two-line spelling `PHASE SHIFT` / `ECHO GRID` (verified correct in the rejected take), no third line, no CJK.
- Colour intent: `PHASE` warm gold, `SHIFT` moonlight blue, `ECHO GRID` soft neutral; four-point spirit spark above/between the lines.
- Clean rounded geometric sans; flat letterforms, no bevel/chrome/3D/grunge; real alpha with clean edges (checkerboard verified).

## Composition (corrected)

Identical lockup, pulled in: ink block (both lines + spark) must occupy ≤ 84 % of canvas width and be optically centred, leaving **≥ 8 % measured empty margin on all four sides** (target ≈ 10 % horizontal for safety). Same hierarchy: line 1 larger, line 2 smaller, spark centred above the line-1 gap.

## 修正后中文 Prompt

> 透明背景的游戏主字标：圆润几何无衬线，第一行 "PHASE SHIFT"，第二行较小 "ECHO GRID"，两行之间或上方一个微小光灵火花；"PHASE" 暖金色、"SHIFT" 月光蓝、"ECHO GRID" 柔和中性灰；无粗描边、无浮雕、无金属、无 3D。**整体墨块收缩居中：左右上下四边各留至少 10% 的完全空白边距（墨块宽度不超过画布的 84%）**，拼写精确、恰好两行。扁平柔和、干净高级，原生 2048×2048 输出，4K。

## Corrected English Prompt

> Game wordmark on a fully transparent background: clean rounded geometric sans-serif; first line exactly "PHASE SHIFT", smaller second line exactly "ECHO GRID", tiny glowing spirit spark above/between the lines; "PHASE" in warm gold, "SHIFT" in moonlight blue, "ECHO GRID" in soft neutral grey; no heavy outlines, no bevel, no chrome, no 3D extrusion. **Pull the lockup in: at least 10 % fully empty margin on all four sides (ink block ≤ 84 % of canvas width), optically centred.** Exactly two text lines, exact spelling. Soft flat vector, gentle gradients, clean premium, native 2048×2048 output, 4k.

## Negative Prompt

> misspelling, extra letters, missing letters, more than two text lines, chinese characters, heavy glow, bevel, emboss, chrome, metallic, 3D extrusion, grunge, busy ornament, dark background, jagged edges, watermark, ink touching canvas edge, margin smaller than 8 percent, upscaled interpolation, low resolution

## 文件名 / 目标目录

`logo_primary.png` → `assets/art/logo/` (replace rejected candidate; `logo_mark.png` untouched).

## 再验收门槛

1. Measured ink-bbox margins **≥ 8.0 % on all four sides** (Pillow audit; target 10 %).
2. Native 2048×2048: **provenance disclosure** at generation time (metadata/EXIF cannot prove nativeness after resampling) + interpolation-artefact check on letter edges.
3. Visual re-check at full size: exactly two lines, exact spelling, colour intent, spark present, no bevel/chrome.
4. Real alpha re-check: checkerboard, corner alpha 0, no fringe on letter edges at 640 px and 96 px display sizes.
