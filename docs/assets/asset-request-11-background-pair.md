# Asset Request 11 — Phase Background Pair Revision (RE-GEN, one composition / two times of day)

- **Asset ID:** `A-04-R1` + `A-05-R1` (revision of the background pair; issued as one request because the failure is a pair property)
- **Asset Name:** `bg_phase_a` (Light / 白昼), `bg_phase_b` (Shadow / 夜晚)
- **用途:** Full-screen L1 background behind the play board per phase; cross-dissolved on every phase flip (ui-ux §6).
- **数量:** 2
- **尺寸:** 1920 × 1080 px each, **native** (no resize from 1672×941)
- **比例:** 16:9 (must survive 9:16 centre crop)
- **是否透明背景:** No
- **Supersedes:** `asset-request-04/05-*.md` criterion 7, now with a quantitative gate; criteria 1–6 of both requests stay in force verbatim (they all passed).

## Failed measurements

- Blurred structural correlation between A and B: **−0.0712** (requirement: same composition at two times of day; re-acceptance gate ≥ 0.9).
- `diff_structure_ab.png`: centre diamond clean, but all four corners carry structural-difference heat = cloud masses present in one phase only / at different positions. `crossfade_mid.png` (50/50): half-strength A-only wisps top-left and B-only wisps + star dots top-right — a real cross-dissolve would make clouds jump.
- Resolution: both resized from 1672×941 → non-native.

## Qualities that MUST be preserved (all measured in the rejected take)

- Centre-60 % quietness: **min/max WCAG ratio over the centre-60 % block** = 1.0937 (A) / 1.3517 (B) ≤ 1.6 (delivery-record method, Orchestrator-reproduced; audit.json `contrast_2_98` 20-grid p2/p98 method = 1.0318 / 1.0870 cross-corroborates — both methods ≤ 1.6) — keep the centre a featureless gradient.
- 9:16 centre-crop safety: crop contrast 1.014 (A) / 1.032 (B), identity survives (portrait previews verified).
- Greyscale phase separation: mean lum 0.8795 vs 0.0200 → 13.28:1; A must stay the bright member, B the dark member.
- Content grammar: A = ivory gradient sky, faint gold haze, soft corner cloud banks; B = deep indigo gradient, violet dusk haze, a few pin-stars, soft corner cloud banks. No text/characters/board/grid/objects/UI, no vignette/flare/neon/horror.
- Shared batch style: soft flat illustration, gentle gradients, subtle grain.

## Composition (corrected — one layout, two lightings)

Define the composition **once** as a grayscale layout map: horizon-free sky gradient + cloud bank masses anchored in the bottom-left and bottom-right corners + one small wisp in the top-left corner + (B only) pin-stars in the top-right quadrant at fixed coordinates. Phase A and Phase B are then the **same layout map rendered at two times of day** (recolor/relight, not re-imagined): identical cloud positions, sizes and camera; only hue, value, haze and the star layer differ. Practical pipeline: generate A, then produce B by relighting/recoloring A's composition (img2img / same-seed + palette swap), adding stars as a separate sparse layer.

## 修正后中文 Prompt

> 休闲解谜游戏的全屏背景对图（同一构图、两个时刻）：先画白昼版——柔和象牙白渐变天空、淡金晨雾、左下与右下两团极柔的云岸、左上一缕小云、中心 60% 完全安静无物体；夜晚版必须是**同一张构图换光换色**：云团位置、大小、机位逐一对应，改为深靛蓝渐变、紫罗兰暮雾、右上几颗微小星点、柔和月光晕。两版交叉淡入时任何形状都不位移。极简、低对比、低细节、无文字无物体无网格，扁平柔和插画风，细腻渐变，少量颗粒，原生 1920×1080，4K。

## Corrected English Prompt

> A matched pair of full-screen puzzle-game backgrounds: ONE composition at two times of day. Daytime version first — soft ivory gradient sky, faint golden morning haze, two very soft cloud banks anchored in the bottom-left and bottom-right corners, one small wisp in the top-left corner, the central 60 % completely quiet and object-free. The night version is the SAME composition relit and recolored — identical cloud positions, sizes and camera — in deep indigo gradient with violet dusk haze, soft moonlight glow and a few tiny pin-stars in the top-right quadrant. Cross-dissolving the two must move nothing. Extremely minimal, low contrast, low detail; no text, characters, board, grid, objects or UI; no vignette, flare, neon or horror. Soft flat illustration, gentle gradients, subtle grain, native 1920×1080, 4k.

## Negative Prompt

> different composition between phases, moved clouds, mismatched camera, cross-dissolve ghosting, busy pattern, high contrast, strong outlines, text, characters, board, grid, tiles, walls, objects, clutter, neon, photorealistic landscape, detailed foliage, harsh shadows, heavy vignette, lens flare, horror, scary, monsters, nebula overload, photorealistic starfield, watermark, upscale artefacts

## 文件名 / 目标目录

`bg_phase_a_1920x1080.png`, `bg_phase_b_1920x1080.png` → `assets/art/background/` (replace rejected candidates).

## 再验收门槛

1. Blurred structural correlation(A,B) **≥ 0.9** (same Orchestrator Pillow method as the −0.0712 measurement; QA cross-check).
2. `crossfade_mid` visual: no position jump — every cloud mass present in both phases at the same coordinates; stars allowed to fade in as a sparse extra layer only.
3. Native 1920×1080 — no resize from any other native; provenance disclosure + interpolation-artefact check on edges (metadata cannot prove nativeness after resampling — same evidence standard as req-10 gate 2).
4. Preserved qualities re-measured: centre-60 % contrast ≤ 1.6 both **by the min/max method, reporting `contrast_2_98` (20-grid p2/p98) alongside**; 9:16 crop contrast ≤ 1.2 both and identity intact; greyscale mean-lum ratio ≥ 10:1 with A bright / B dark; content grammar and style checks re-run visually.
