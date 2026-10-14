# Asset Request 06 — Goal + Phase Portal

- **Asset ID:** `A-06`
- **Asset Name:** `goal` (destination tile), `portal_a` (Phase A portal), `portal_b` (Phase B portal)
- **用途:** The level goal marker, and the Phase Portal mechanic (introduced at L36). Must read clearly at grid-cell size.
- **数量:** 3
- **尺寸:** 512 × 512 px each
- **比例:** 1:1
- **是否透明背景:** Yes (transparent PNG)
- **画面构图:**
  - **Goal:** a warm, welcoming target — a soft glowing ring/rune with a gentle inner light, slightly luminous so it always reads as "the place to reach" in *both* phases. Should not look like a wall or a door.
  - **Portal A:** a calm Phase-A-styled portal — ivory/gold ring with hints of sky blue, a soft swirl inside.
  - **Portal B:** the matching Phase-B-styled portal — indigo/violet ring with moonlight-blue swirl.
  - Both portals must be visually **the same object in different phases** (same shape/size, different palette), so the player instantly understands the pairing.
  - Centered, filling ~70–75% of the frame, crisp silhouette.
- **统一美术风格:** calm premium flat illustration; soft glow; consistent with Echo Spirit and backgrounds.
- **中文 Prompt:**
  > 三个小型游戏道具素材（透明背景，各 512×512）：1) 目标点 Goal：温暖的发光圆环/符文，内部柔和发光，在两个相位中都能被一眼识别为"要去的地方"，不要看起来像墙或门。2) 相位传送门 A（白昼）：象牙金圆环，带一点天空蓝，内部有柔和漩涡。3) 相位传送门 B（夜晚）：同形状同尺寸，靛蓝紫罗兰圆环，月光蓝漩涡。两个传送门必须明显是"同一个物体在不同相位"，只换配色，便于玩家理解配对关系。角色居中约占 70–75%，轮廓清晰。扁平柔和插画风，细腻渐变，柔和发光，无粗黑描边，4K。
- **英文 Prompt:**
  > Three small game prop assets on transparent background (512×512 each): 1) Goal — a warm welcoming glowing ring or rune with soft inner light, instantly readable as "the place to reach" in both phases, must not look like a wall or a door. 2) Phase Portal A (Light) — ivory-gold ring with a hint of sky blue and a soft inner swirl. 3) Phase Portal B (Shadow) — the identical shape and size, in indigo-violet with a moonlight-blue swirl. The two portals must clearly read as the same object in different phases, only recolored, so the pairing is obvious. Centered, filling about 70–75% of the frame, crisp silhouette, soft flat illustration, gentle gradients, soft glow, no heavy black outlines, 4k.
- **Negative Prompt:**
  > text, arrows, letters, numbers, wall look, door look, brick, stone texture, harsh outline, 3D render, photorealism, cluttered detail, mismatched portal shapes, scary portal, fire, lava, watermark, low resolution
- **文件名:** `goal.png`, `portal_a.png`, `portal_b.png`
- **目标目录:** `assets/art/props/`
- **依赖与阻塞:** Goal blocks Stage 2 (every level needs it). Portal blocks Stage 5 (L36).
- **验收标准 / Acceptance criteria:**
  1. Three PNG files, ≥ 512 × 512 px, **real alpha channel**; no white box, no baked background, no fringe on glow edges.
  2. Each sprite centred, filling **65–80 %** of the canvas, with identical framing across all three so they swap in place without a layout shift.
  3. **`portal_a` and `portal_b` must have an identical silhouette and identical apparent size** — recoloured only (overlay test: 100 % silhouette match). Mismatched portal shapes = rejected.
  4. **Goal must not read as a wall or a door**: it stays a *hollow ring* form (per `docs/ui-ux.md` R-C1/R-C2, blocking objects are solid, reachable objects are hollow).
  5. Goal keeps the **same gold/amber hue family in both phases** and portal keeps the same **teal/blue family** (R-C10: same class, same hue family across phases; only value and temperature flip).
  6. **Downscale test:** all three still unambiguous at **48 × 48 px** (grid-cell size on a small phone); goal vs portal distinguishable at that size without colour.
  7. No text, arrows, letters, numbers, brick/stone texture, fire, lava, 3D render or photorealism.
  8. Delivered as `goal.png`, `portal_a.png`, `portal_b.png` into `assets/art/props/`.