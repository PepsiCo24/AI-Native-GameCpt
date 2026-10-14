# Asset Request 03 — Echo Spirit (protagonist)

- **Asset ID:** `A-03`
- **Asset Name:** `echo_spirit_a` (Light form), `echo_spirit_b` (Shadow form)
- **用途:** The player's visual focus on the board. Provides movement feedback and world flavor. **Highest engineering dependency** — needs to read clearly at a small grid-cell size.
- **数量:** 2 (same spirit, one per phase; optional 3rd "hop/move" pose if easy)
- **尺寸:** 512 × 512 px each (will be scaled down to roughly one grid cell)
- **比例:** 1:1
- **是否透明背景:** Yes (transparent PNG)
- **画面构图:**
  - A **small, simple, round luminous wisp** — like a soft glowing orb with a gentle trailing tail. Minimal detail. Possibly two tiny soft glowing eyes; no complex face. **Not** a humanoid character, **not** an anime figure.
  - **Form A (Light):** warm ivory/gold glow, soft sky-blue aura, calm and serene.
  - **Form B (Shadow):** indigo/violet glow, moonlight-blue core, dreamy but still gentle (never scary).
  - Centered in the canvas, filled to ~70% of the frame, crisp silhouette so it reads on the board.
- **统一美术风格:** calm premium flat illustration; soft inner glow; subtle grain; no heavy outlines.
- **中文 Prompt:**
  > 两个小巧的发光精灵角色素材（透明背景）：一只简单圆润的"光灵"，像一颗柔和的发光光球，带一点轻柔的飘尾，极简细节，可以有两点柔和的微光眼睛，不要复杂人脸，不是人形角色，不是动漫人物。形态 A（白昼/光）：暖象牙金光辉，淡天空蓝光晕，宁静柔和。形态 B（夜晚/影）：靛蓝紫罗兰光辉，月光蓝核心，梦幻但温柔，绝不恐怖。角色居中，约占画面 70%，轮廓清晰，扁平柔和插画风，细腻渐变，内发光，少量颗粒，无粗黑描边，4K。
- **英文 Prompt:**
  > Two small glowing spirit character assets on transparent background: a simple round luminous wisp, like a soft glowing orb with a gentle trailing tail, minimal detail, optionally two tiny soft glowing eyes, no complex face, not humanoid, not anime. Form A (Light): warm ivory-gold glow with a pale sky-blue aura, serene and calm. Form B (Shadow): indigo-violet glow with a moonlight-blue core, dreamy yet gentle, never scary. Centered, filling about 70% of the frame, crisp silhouette, soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy black outlines, 4k.
- **Negative Prompt:**
  > humanoid body, arms, legs, detailed face, anime, cartoon mascot with clothes, wings, horns, scary ghost, skull, horror, gore, weapon, dark muddy glow, harsh outline, 3D render, photorealistic, busy detail, text, watermark, small unreadable silhouette
- **文件名:** `echo_spirit_a.png`, `echo_spirit_b.png`
- **目标目录:** `assets/art/character/`
- **依赖与阻塞:** **Blocks Stage 2 prototype visual integration** (readability test needs this asset).
- **验收标准 / Acceptance criteria:**
  1. Two PNG files, ≥ 512 × 512 px, **real alpha channel**; no white box, no baked background plate, no dark fringe on the glow edge.
  2. Sprite centred, filling **65–80 %** of the canvas; identical framing in both files so they can be swapped in place without a layout shift.
  3. **Identical silhouette and apparent size between form A and form B** — only the palette differs (overlay test: silhouettes must match).
  4. **Form A must have a visible warm-gold body, not pure white.** Measured: an ivory-white spirit on the Phase A cell ground `#FFFDF7` is only **1.30:1** contrast, below the 3:1 readability floor; the renderer adds a contrast ring (`docs/ui-ux.md` R-C9) but a deeper gold body is strongly preferred.
  5. Form B: indigo/violet glow with a moonlight-blue core; **gentle and dreamy, never scary** (no horror reading at any size).
  6. No limbs, no clothing, no wings, no complex face — at most two soft eye dots.
  7. **Downscale test:** silhouette still readable and the two forms still distinguishable at **48 × 48 px** and at **32 × 32 px** (screenshots required).
  8. Delivered as `echo_spirit_a.png` and `echo_spirit_b.png` into `assets/art/character/`.