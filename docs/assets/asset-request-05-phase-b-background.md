# Asset Request 05 — Phase B Background (Shadow / 夜晚)

- **Asset ID:** `A-05`
- **Asset Name:** `bg_phase_b`
- **用途:** Full-screen background behind the play board while in Phase B. Must feel clearly different from Phase A yet keep board readability.
- **数量:** 1
- **尺寸:** 1920 × 1080 px
- **比例:** 16:9 (must also survive 9:16 mobile crop — keep content near center)
- **是否透明背景:** No
- **画面构图:**
  - A calm dream-like night world: deep indigo gradient, violet dusk haze, soft moonlight glow, a few tiny distant stars, faint floating light motes.
  - **Very low detail and low contrast** — the board sits on top of the center. No strong shapes or high-contrast edges that could be mistaken for walls/paths.
  - Same composition language as A-04 so the two backgrounds feel like one world seen at two times of day.
- **统一美术风格:** calm premium flat illustration; gentle gradients; subtle grain; soft moonlight; no heavy outlines; **dreamy, never horror.**
- **中文 Prompt:**
  > 休闲解谜游戏的"夜晚/影之世界"全屏背景：深靛蓝渐变夜空，淡淡的紫罗兰暮色薄雾，柔和的月光晕散，几颗遥远的微小星星，空中漂浮着轻柔的微光粒子。整体极简、低对比、低细节，棋盘会叠在画面中央，所以中心区域尤其安静平缓，避免强烈图案或高对比边缘。构图语言与白昼背景一致，像是同一个世界在一天中的另一个时刻。扁平柔和插画风，细腻渐变，少量颗粒，柔和月光，无粗黑描边，梦幻温柔，绝不恐怖，4K。
- **英文 Prompt:**
  > Full-screen "Shadow World / night" background for a calm puzzle game: deep indigo gradient night sky, faint violet dusk haze, soft moonlight glow, a few distant tiny stars, delicate floating light motes. Extremely minimal, low-contrast, low-detail; the game board overlays the center so keep the middle especially quiet and even; avoid strong shapes or high-contrast edges. Same composition language as the daytime background, like one world at another time of day. Soft flat illustration, gentle gradients, subtle grain, soft moonlight, no heavy outlines, dreamy and gentle, never scary, 4k.
- **Negative Prompt:**
  > horror, scary, monsters, dark oppressive mood, blood, gore, harsh contrast, busy pattern, strong outlines, text, characters, board, grid, tiles, objects, photorealistic starfield, nebula overload, neon oversaturation, watermark
- **文件名:** `bg_phase_b_1920x1080.png`
- **目标目录:** `assets/art/background/`
- **依赖与阻塞:** **Blocks Stage 2 prototype visual integration** (readability test).
- **验收标准 / Acceptance criteria:**
  1. PNG or JPG, ≥ 1920 × 1080 px, exact 16:9; no alpha required.
  2. **Central region quiet and even**: no distinct object or hard edge behind the board; local contrast inside the centre ≤ roughly **1.6:1**.
  3. Survives a **9:16 centre crop** without losing identity.
  4. Clearly **night / Shadow World**: deep indigo, violet dusk, moonlight, a few tiny distant stars. Greyscale-converted it must read as the *dark* member of the A/B pair.
  5. **Dreamy and gentle — never horror.** No monsters, no oppressive mood, no blood, no scary silhouettes.
  6. **No** text, characters, board, grid, tiles, objects, props or UI; no nebula overload, no neon oversaturation, no photorealistic starfield.
  7. Same composition language and camera as A-04 (one world, another time of day) — the two files should align when cross-dissolved.
  8. Delivered as `bg_phase_b_1920x1080.png` into `assets/art/background/`.