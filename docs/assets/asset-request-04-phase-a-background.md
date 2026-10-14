# Asset Request 04 — Phase A Background (Light / 白昼)

- **Asset ID:** `A-04`
- **Asset Name:** `bg_phase_a`
- **用途:** Full-screen background behind the play board while in Phase A. Must not compete with board readability.
- **数量:** 1
- **尺寸:** 1920 × 1080 px
- **比例:** 16:9 (must also survive 9:16 mobile crop — keep the interesting content near center)
- **是否透明背景:** No
- **画面构图:**
  - A calm abstract light world: soft ivory gradient sky, faint golden haze, delicate floating dust motes, very subtle distant geometric hills or cloud shapes.
  - **Very low detail and low contrast** — the board will sit on top of the center. Avoid strong shapes, high-contrast edges, or patterns that could be mistaken for walls/paths.
  - Leave the central ~60% especially quiet and even.
- **统一美术风格:** calm premium flat illustration; gentle gradients; subtle grain; soft diffused morning light; no heavy outlines.
- **中文 Prompt:**
  > 休闲解谜游戏的"白昼/光之世界"全屏背景：柔和的象牙白渐变天空，淡淡的金色晨雾，空气中漂浮着轻柔的微尘光点，远处有非常隐约的几何云形或山形。整体极简、低对比、低细节，画面中心约 60% 区域尤其安静平缓，避免出现强烈图案或高对比边缘（因为棋盘会叠在中央）。扁平柔和插画风，细腻渐变，少量纸感颗粒，柔和漫射晨光，无粗黑描边，宽敞、宁静、高级，4K。
- **英文 Prompt:**
  > Full-screen "Light World / daytime" background for a calm puzzle game: soft ivory gradient sky, faint golden morning haze, delicate floating dust motes, very subtle distant geometric cloud or hill shapes. Extremely minimal, low-contrast, low-detail; keep the central 60% especially quiet and even because the game board overlays the center. Avoid strong shapes or high-contrast edges that could be mistaken for walls or paths. Soft flat illustration, gentle gradients, subtle paper grain, soft diffused morning light, no heavy outlines, spacious, serene, premium, 4k.
- **Negative Prompt:**
  > busy pattern, high contrast, strong outlines, text, characters, board, grid, tiles, walls, objects, clutter, dark, night, neon, photorealistic landscape, detailed foliage, harsh shadows, watermark, vignette too strong
- **文件名:** `bg_phase_a_1920x1080.png`
- **目标目录:** `assets/art/background/`
- **依赖与阻塞:** **Blocks Stage 2 prototype visual integration** (readability test).
- **验收标准 / Acceptance criteria:**
  1. PNG or JPG, ≥ 1920 × 1080 px, exact 16:9; no alpha required.
  2. **Central 60 % is quiet and even**: no distinct object, no hard edge, no pattern with a local contrast above roughly **1.6:1** inside that region (the board plate sits there at ≥ 0.92 opacity, but the background must not fight it).
  3. Survives a **9:16 centre crop** without losing its identity or introducing a hard shape behind the board.
  4. Clearly **daytime / Light World**: ivory, faint gold, sky blue, soft morning haze. Greyscale-converted it must read as the *bright* member of the A/B pair (measured phase ground separation is 14.04:1 — this inversion must not be weakened).
  5. **No** text, characters, creatures, board, grid, tiles, walls, doors, props or UI.
  6. No strong vignette, no lens flare, no photorealistic landscape, no detailed foliage, no busy texture.
  7. Shares its composition language with A-05 so the pair reads as one world at two times of day.
  8. Delivered as `bg_phase_a_1920x1080.png` into `assets/art/background/`.