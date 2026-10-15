# Asset Request 09 — Portal Pair Revision (RE-GEN, trio re-framing)

- **Asset ID:** `A-06-R1` (revision of the portal half of `A-06`; `goal.png` PASSES and is **not** regenerated)
- **Asset Name:** `portal_a` (Phase A portal), `portal_b` (Phase B portal)
- **用途:** Phase Portal mechanic (first board at **L11** per ADR-0009 D3; pre-D3: L36 — Stage 5, and per `asset-manifest.md` V0.5.2 optional polish only, never a shipping dependency). Must pair-read with itself across phases and coexist on the board with `goal.png` without layout shift.
- **数量:** 2
- **尺寸:** 512 × 512 px each, native
- **比例:** 1:1
- **是否透明背景:** Yes
- **Supersedes:** `asset-request-06-goal-portal.md` criteria 2–3 for the portals; criterion 5's teal/blue family ruling (adjudicated conflict ②) stays in force.

## Failed measurements

- Portal pair silhouette identity: alpha≥128 IoU **0.9672** (bbox-aligned 0.9631, chamfer 11.6 px) vs required identical; overlay shows B-only slivers on the outer-left rim and a mismatched swirl notch inner-left.
- Framing: portal_a bbox 290×426 = **56.6 × 83.2 %**, portal_b 291×428 = **56.8 × 83.6 %** — outside the 65–80 % band on both axes and inconsistent with the passing `goal.png` (404×405 = 78.9 × 79.1 %), breaking the trio's identical-framing clause.
- Style drift (recorded, corrective): hard white specular streaks + inner-shadow bands read as a glossy 3D torus, outside the batch's flat soft-gradient language.

## Qualities that MUST be preserved

- Teal/blue hue family for both portals (adjudicated conflict ②): A = bright teal-cyan, B = deeper blue; hue constant across phases, only value/temperature flip.
- Hollow upright ellipse-ring read with a soft inner swirl hint; open centre; not a door, not a wall; unambiguous at 48 px.
- Real alpha, corner alpha 0, no dark fringe (fringe dark_fraction was 0.228/0.717 — the B value is the portal's own dark-blue rim; keep edges clean on both grounds as verified in `small_portal_*` previews).

## Composition (corrected)

One ring silhouette, two palettes, one framing contract shared with the existing goal: upright rounded-ellipse annulus (ring thickness ≈ 12 % of canvas), open hollow centre, one soft swirl stroke hugging the inner-left of the ring (identical geometry in both files). Because `goal.png` passes at 78.9 × 79.1 % and will not be regenerated, the portal target is **79 % ± 1 % of canvas width AND height** (inside the 65–80 % band and inside the ≤2 % trio-delta gate). **Form B = exact recolor of form A's alpha mask** (same pipeline rule as req-08). Rendering: flat soft gradients only — replace specular streaks with one gentle inner-glow gradient; no chrome, no glass highlights.

## 修正后中文 Prompt

> 一个透明背景的相位传送门素材：竖直圆润椭圆环，环心镂空，环内左侧一条柔和漩涡笔触，扁平柔和插画风、细腻渐变、柔和内发光，无高光镜面条、无玻璃质感、无粗黑描边。配色 A（白昼）：明亮青蓝色环（青蓝色系不变）。居中，轮廓包围盒占画面宽与高各约 79%（±1%），边缘干净。**形态 B 不重新绘制：由 A 的同一 alpha 轮廓精确换色**——更深的蓝蓝色环、月光蓝漩涡，形状尺寸位置逐像素一致。4K。

## Corrected English Prompt

> One phase-portal prop on a fully transparent background: an upright rounded-ellipse ring with an open hollow centre and a single soft swirl stroke hugging the inner-left of the ring. Soft flat illustration, gentle gradients, soft inner glow only — NO specular streaks, NO glass/chrome highlights, no heavy outlines. Phase A colour: bright teal-cyan ring (teal/blue family, hue fixed across phases). Centred; silhouette bounding box fills about 79 % (±1 %) of canvas width AND height; crisp clean edge. **Phase B is not re-drawn: an exact recolor of form A's identical alpha silhouette** — deeper blue ring with a moonlight-blue swirl, pixel-identical shape, size, position. 4k.

## Negative Prompt

> different shape, different size, different angle, different framing, specular highlight, chrome, glass, glossy 3D torus, 3D render, photorealism, door, gate, wall, brick, stone, text, arrows, letters, numbers, fire, lava, chaotic swirl, scary, horror, silhouette smaller than 65 % or larger than 80 % of canvas, off-centre, opaque background box, dark fringe, upscale artefacts

## 文件名 / 目标目录

`portal_a.png`, `portal_b.png` → `assets/art/props/` (replace rejected candidates; `goal.png` untouched).

## 再验收门槛

1. Same-method alpha≥128 IoU(portal_a, portal_b) **≥ 0.99**, bbox-aligned ≥ 0.99, chamfer ≤ 8 px. Note: 0.99 = generation tolerance; under the prescribed B=recolor(A alpha) pipeline the expected result is `alpha_equal_exact=true` (IoU = 1.000). The frozen 100 % identity requirement is carried by the pipeline contract; 0.99 only absorbs last-ring anti-aliasing differences.
2. Trio framing: each of `goal.png` (existing, fixed at 78.9 × 79.1 %), `portal_a`, `portal_b` has bbox fill within [65 %, 80 %] per axis AND pairwise bbox-size delta ≤ 2 % per axis (portals therefore must land in 76.9–80.0 % width and 77.1–80.0 % height).
3. Native 512×512, no upscale.
4. Hue check, quantified as dominant-hue gates on the audit `supplemental.core` fields (HSV hue of the α≥200 core mean RGB): portal core hue ∈ **[170°, 230°]** (this batch's anchors: portal_a 192.0°, portal_b 205.6°); goal core hue ∈ **[30°, 55°]** (anchor 38.7°); portal-vs-goal hue distance **≥ 100°** (this batch: 153.3° / 166.9°) — i.e. both portals inside the teal/blue family and far from goal's gold-amber family; greyscale pair still distinguishable by shape from goal at 48 px.
5. Visual: no specular streaks; overlay shows single silhouette; 48 px preview unambiguous on ivory and indigo grounds.
