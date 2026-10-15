# Asset Request 08 — Echo Spirit Pair Revision (RE-GEN)

- **Asset ID:** `A-03-R1` (revision of `A-03`)
- **Asset Name:** `echo_spirit_a` (Light form), `echo_spirit_b` (Shadow form)
- **用途:** Player sprite on the board; swaps in place on every move (phase flip). Blocks Stage 2 readability test.
- **数量:** 2
- **尺寸:** 512 × 512 px each, native (see re-acceptance gate: no upscaling)
- **比例:** 1:1
- **是否透明背景:** Yes (transparent PNG, real alpha)
- **Supersedes:** `asset-request-03-echo-spirit.md` criteria 2–3 only; all other frozen criteria stay in force verbatim.

## Failed measurements (why this revision exists)

- Silhouette identity: alpha≥128 IoU **0.8584** (bbox-aligned 0.9541, chamfer **40.8 px**) vs required identical (overlay test). Visual: form A's tail is a thin hook with a notch; form B's tail is a thicker smooth S-curve; B's body ring sits outside A's.
- Framing: A bbox 246×320 px = **48.0 × 62.5 %** of canvas (below the 65–80 % band); B 264×336 px = **51.6 × 65.6 %** (width below band); A≠B framing → in-place swap shifts layout.
- (Resolution was native 512 for this pair — not a failure here; keep it native.)

## Qualities that MUST be preserved (measured in the rejected take)

- Form A warm honey-gold body — luminance = audit `supplemental.core.echo_spirit_a.core_lum_perpixel_mean` = **0.624** (mean of per-pixel relative luminance over α≥200 core pixels; luminance-of-mean-RGB of the same core = 0.6068, gate 4 below fixes band + anchor), not pure white (1.30:1 risk avoided) — with pale sky-blue aura rim.
- Form B indigo-violet body with moonlight-blue aura; gentle, never scary; exactly two soft eye dots; round wisp + single trailing tail; no limbs/clothes/wings/face.
- Real alpha with clean edges: corner alpha 0, fringe dark_fraction 0.015/0.024 (no dark halo on ivory or indigo grounds); readable and A/B-distinguishable at 48/32/24 px on both grounds.
- Shared batch style: soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy outlines.

## Composition (corrected)

One silhouette, two palettes. Generate **form A first**; form B is produced by **recoloring form A's exact alpha mask** (identical pixel silhouette, identical bbox, identical centring) — never re-prompted as a second drawing. Silhouette = round orb + one gentle trailing tail curling to the upper-left, two eye dots. Both files: silhouette bbox fills **70 % ± 3 % of canvas width AND height** (i.e. ≈ 358×358 px on 512), centred (centroid within ±2 % of canvas centre).

## 修正后中文 Prompt

> 一个透明背景的小型发光精灵素材：简单圆润的光灵，一颗柔和发光的光球带一条向左上飘起的轻柔飘尾，极简细节，两点柔和微光眼睛，无人形、无四肢、无衣饰、无复杂脸。形态 A（白昼）：暖象牙金偏蜂蜜色的身体（不得接近纯白），淡天空蓝光晕。居中，轮廓包围盒占画面宽与高各约 70%（±3%），边缘干净无暗边毛刺。扁平柔和插画风，细腻渐变，内发光，少量颗粒，无粗黑描边，4K。**形态 B 不重新绘制：由形态 A 的同一 alpha 轮廓精确换色得到**——靛蓝紫罗兰身体、月光蓝光晕，形状、尺寸、位置与 A 逐像素一致。

## Corrected English Prompt

> One small glowing spirit asset on a fully transparent background: a simple round luminous wisp — one softly glowing orb with a single gentle trailing tail curling to the upper-left, minimal detail, two tiny soft glowing eye dots, not humanoid, no limbs, no clothes, no complex face. Form A (Light): warm honey-ivory-gold body (explicitly NOT near-white) with a pale sky-blue aura. Centred; the silhouette bounding box fills about 70 % (±3 %) of the canvas in BOTH width and height; crisp clean edge, no dark fringe. Soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy outlines, 4k. **Form B is not re-drawn: it is an exact recolor of form A's identical alpha silhouette** — indigo-violet body with a moonlight-blue aura, pixel-identical shape, size and position.

## Negative Prompt

> different silhouette between forms, different size, different pose, different framing, off-centre subject, silhouette smaller than 60 % or larger than 85 % of canvas, humanoid body, arms, legs, detailed face, anime, wings, horns, scary ghost, skull, horror, weapon, dark muddy glow, harsh outline, 3D render, photorealistic, busy detail, text, watermark, pure white blown-out body, opaque white background box, dark fringe around glow, upscale artefacts

## 文件名 / 目标目录

`echo_spirit_a.png`, `echo_spirit_b.png` → `assets/art/character/` (replace the rejected candidates at the same paths).

## 再验收门槛 (re-acceptance gates)

1. Same-method alpha≥128 silhouette IoU(A,B) **≥ 0.99** AND bbox-aligned IoU ≥ 0.99 AND chamfer ≤ 8 px (Orchestrator Pillow audit, QA cross-check). Note: 0.99 = generation tolerance; under the prescribed B=recolor(A alpha) pipeline the expected result is `alpha_equal_exact=true` (IoU = 1.000). The frozen 100 % identity requirement is carried by the pipeline contract; 0.99 only absorbs last-ring anti-aliasing differences.
2. Both files: bbox fill within **[65 %, 80 %]** on width AND height; |bbox size A − bbox size B| ≤ 2 % per axis; centroid within ±2 % of centre.
3. Native 512×512 (generation at ≥512 with downscale allowed; any upscale = automatic reject).
4. All preserved-quality checks re-run: **spirit_a core (α≥200) luminance-of-mean-RGB ∈ [0.55, 0.70] (this batch's anchor 0.6068); core hue ∈ [35°, 50°] (anchor 41.6°)** — measurement definition: `audit.json` `supplemental.core.echo_spirit_a` (`relative_luminance` = luminance of the core mean RGB = the gated value; `core_lum_perpixel_mean` = mean of per-pixel relative luminance = 0.624 this batch; `hue_deg` = HSV hue of the core mean RGB); corner alpha 0; fringe dark_fraction ≤ 0.05; 48/32 px readability + A/B distinguishability screenshots on ivory and indigo grounds.
5. Visual: overlay shows a single silhouette colour (no red/green-only regions beyond ≤8 px rim).
