# Codex 总体提示词 — Phase Shift: Echo Grid 第一批美术素材（11 张 / 一次交付）

> 用法：把下面**整个方框内容**一次性粘贴给 Codex。它自包含了风格、路径、文件名、尺寸、Prompt、负面词与自检标准。
> 记录：最终美术由**人类指定的 Codex 通道**产出，ASSET GATE 由人类本人签署；Studio Agent 不参与生成，只负责验收与集成。
> 日期：2026-10-14 · 关联：`docs/assets/codex-generation-brief.md`（逐任务拆解版）、`docs/assets/asset-manifest.md`

---

```
# ROLE
你在为一款即将参赛的休闲解谜 H5 游戏生成正式上线用美术素材。游戏名：
Phase Shift: Echo Grid / 双相棋盘：昼夜回响。
核心玩法：玩家在网格棋盘上每走一步，世界就在「白昼(Phase A)」与「夜晚(Phase B)」之间自动翻转。
你的图会被直接放进游戏运行时加载，所以可读性高于华丽度。

# GLOBAL STYLE（每一张都必须遵守，不要变体）
- calm premium casual-puzzle illustration
- soft flat vector illustration + gentle gradients
- clean geometric shapes, generous negative space
- subtle paper / light grain, soft diffused lighting
- NO heavy black outlines, NO bevel, NO chrome, NO 3D extrusion
- 画面绝不出现文字/数字/箭头/水印/签名（唯一例外：任务 T02 字标）
- 整套素材必须像同一个工作室同一时间画出来的，风格高度统一
- 输出 PNG。标注 TRANSPARENT=YES 的必须有真实 alpha 通道（不能是白底盒子、不能有黑边/灰边毛刺）
- 不要超过指定分辨率做额外放大；不要压缩破坏细节

# PALETTES（全世界只有这两套配色）
Phase A / Light 白昼: ivory #F7F1E3, faint gold #E9C87A, sky blue #A8D8F0, warm sand, morning haze
Phase B / Shadow 夜晚: deep indigo #1B1F3B, violet #4A3D7A, moonlight #C9D6FF, cool teal accent, dream dusk
Hue ownership（不要违反）: 目标 Goal = 金琥珀色系(两相位都不变色相)；
传送门 Portal = 青蓝色系(两相位都不变色相)；只有明度与冷暖随相位翻转。

# CRITICAL: 以下元素【不要】画进任何图里
棋盘格子、网格线、墙体、虚影墙、相位切换特效、光标、选中框 —— 这些全部由程序矢量绘制，
属于代码而非素材。背景图中央区域必须干净空白，因为棋盘会叠在正中央。

# GLOBAL NEGATIVE（每张图都追加）
text, letters, numbers, watermark, signature, logo, harsh black outlines, photorealism,
3D render, heavy drop shadow, bevel, emboss, chrome, neon oversaturation, cluttered
background, busy pattern, low contrast, blurry, horror, scary, gore, weapon, distorted
perspective, extra limbs, anime character

# OUTPUT LAYOUT — 严格按此路径与文件名保存
assets/art/
  cover/cover_hero_1920x1080.png
  logo/logo_primary.png
  logo/logo_mark.png
  character/echo_spirit_a.png
  character/echo_spirit_b.png
  background/bg_phase_a_1920x1080.png
  background/bg_phase_b_1920x1080.png
  props/goal.png
  props/portal_a.png
  props/portal_b.png
  ui/ui_kit.png

# GENERATION RULES
1. 一个任务生成一张独立图片。绝对不要把两个素材塞进同一张图（T02/T03 分开出，T04/T05 分开出，T08/T09/T10 分开出）。
2. 成对素材（T04+T05、T06+T07、T09+T10）必须"同一个东西在两个相位"，形状/尺寸/构图/机位完全一致，只换配色或只换时间。
3. 先做 P0（T04 T05 T06 T07 T08），再 P1（T11），再 P2（T01 T02 T03 T09 T10）。
4. 每张图完成后自行对照 SELF-CHECK 检查，不合格就重出该张，不要交付凑合版本。

# TASKS（P0 = 阻塞开发，最优先）

## T04 · P0 · echo_spirit_a.png · 512x512 · 1:1 · TRANSPARENT=YES
PROMPT: A single small glowing spirit character on a fully transparent background. A simple
round luminous wisp: one softly glowing orb with a gentle trailing tail, minimal detail,
optionally two tiny soft glowing eyes. NOT humanoid, no arms, no legs, no clothes, no face
detail, not an anime mascot. Warm ivory-gold body glow with a pale sky-blue aura, serene and
calm. The body should be a slightly DEEPER gold rather than near-white so it stays readable
on an ivory game cell. Centred, the silhouette fills about 70% of the frame, crisp clean edge,
soft inner glow, subtle grain, no dark fringe or halo artefact around the glow edge. Single
character only, nothing else in frame, 4k.
EXTRA NEGATIVE: humanoid body, arms, legs, detailed face, anime, cartoon mascot with clothes,
wings, horns, scary ghost, skull, horror, weapon, dark muddy glow, harsh outline, busy detail,
pure white blown-out body, opaque white background box, dark fringe around glow

## T05 · P0 · echo_spirit_b.png · 512x512 · 1:1 · TRANSPARENT=YES
PROMPT: A single small glowing spirit character on a fully transparent background, the SAME
character silhouette, same pose, same size and same framing as its light counterpart: a simple
round luminous wisp with a gentle trailing tail, minimal detail, optionally two tiny soft
glowing eyes. NOT humanoid, no limbs, no clothes, no complex face. Indigo-violet body glow with
a moonlight-blue core, dreamy yet gentle, calm, never scary. Centred, silhouette fills about
70% of the frame, crisp clean edge, soft inner glow, subtle grain, no dark fringe around the
glow edge. Single character only, nothing else in frame, 4k.
EXTRA NEGATIVE: different silhouette, different size, different pose, humanoid body, arms, legs,
detailed face, anime, wings, horns, scary ghost, skull, horror, gore, weapon, harsh outline,
opaque background box

## T06 · P0 · bg_phase_a_1920x1080.png · 1920x1080 · 16:9 · TRANSPARENT=NO
PROMPT: A full-screen "Light World / daytime" background for a calm puzzle game. Soft ivory
gradient sky, faint golden morning haze, delicate floating dust motes, very subtle distant
geometric cloud or hill shapes. Extremely minimal, low contrast, low detail. The central 60
percent of the image must be especially quiet and even, because the game board is drawn on top
of the centre. Avoid any strong shape or high-contrast edge that could be mistaken for a wall,
a tile or a path. No grid, no tiles, no objects, no characters. Spacious, serene, premium, 4k.
EXTRA NEGATIVE: busy pattern, high contrast, strong outlines, board, grid, tiles, walls, objects,
characters, clutter, dark, night, neon, photorealistic landscape, detailed foliage, harsh
shadows, heavy vignette

## T07 · P0 · bg_phase_b_1920x1080.png · 1920x1080 · 16:9 · TRANSPARENT=NO
PROMPT: A full-screen "Shadow World / night" background for a calm puzzle game. Deep indigo
gradient night sky, faint violet dusk haze, soft moonlight glow, a few distant tiny stars,
delicate floating light motes. Extremely minimal, low contrast, low detail. The central region
must be especially quiet and even, because the game board is drawn on top of the centre. Use
exactly the same composition language and camera as its daytime counterpart, like the same world
at another time of day. Dreamy and gentle, never scary. No grid, no tiles, no objects, no
characters. 4k.
EXTRA NEGATIVE: horror, scary, monsters, dark oppressive mood, blood, gore, harsh contrast, busy
pattern, strong outlines, board, grid, tiles, objects, characters, photorealistic starfield,
nebula overload, neon oversaturation

## T08 · P0 · goal.png · 512x512 · 1:1 · TRANSPARENT=YES
PROMPT: A single small game prop on a fully transparent background: the Goal marker. A warm,
welcoming glowing ring with soft inner light and an open hollow centre, instantly readable as
"the place to reach". Gold-amber hue family, phase-neutral so it reads in both a light and a
dark world. It must NOT look like a wall, a brick, a stone block or a door. Centred, fills about
70 percent of the frame, crisp silhouette, soft glow, gentle gradients, no heavy outline,
legible when shrunk to 48x48 pixels. One object only, nothing else in frame, 4k.
EXTRA NEGATIVE: wall look, door look, brick, stone texture, solid filled block, arrows, letters,
numbers, text, cluttered detail, fire, lava, harsh outline, unreadable at small size

## T11 · P1 · ui_kit.png · 2048x2048 · 1:1 · TRANSPARENT=YES
PROMPT: A minimal game UI asset sheet on a fully transparent background, arranged as a neat grid
of separated elements with wide gaps so each element can be cut out individually. Include: 1) a
rounded pill primary button (warm gold to soft amber gradient, subtle inner glow) and 2) a ghost
button (thin soft outline, nearly transparent fill), both with NO text; 3) simple line-plus-
soft-fill icons, each in its own cell: undo (soft curved arrow), restart (circular arrow), sound
on, sound off, next (chevron right), phase sun glyph, phase crescent glyph; 4) one soft rounded
9-slice panel in ivory (Light) and one in indigo (Shadow), low contrast, with a flat border
region and a clean stretchable centre; 5) two phase indicator pills: an ivory-gold pill with a
small sun glyph, and an indigo-violet pill with a small crescent glyph, icon only. Everything
calm, rounded, low contrast, never competing with the game board; icons must stay legible at 48
pixels on mobile and recognizable at 24 pixels, with consistent stroke weight and corner radius.
Clean premium, 4k.
EXTRA NEGATIVE: baked-in text, labels, numbers, glossy 3D buttons, heavy drop shadow, bevel,
skeuomorphism, harsh outlines, neon, clutter, inconsistent icon style, dark muddy colors, solid
opaque background

## T01 · P2 · cover_hero_1920x1080.png · 1920x1080 · 16:9 · TRANSPARENT=NO
PROMPT: Key art for a calm premium puzzle game, 16:9. Flat top-down view of a clean 5x5 grid
board centred in frame, split softly down the middle: the left half is a Light World of ivory
white, faint gold and sky-blue morning haze; the right half is a Shadow World of deep indigo,
violet and moonlight. A small glowing wisp spirit stands at the centre on the boundary, facing
the Shadow side. Faint translucent phase walls hinted on both halves, light blocks on the left,
dark blocks on the right. Generous negative space, the clean upper third reserved for a logo to
be added later. No text anywhere. Calm, premium, highly readable, 4k.
EXTRA NEGATIVE: isometric perspective, 3D render, photorealism, lens flare, crowded composition,
too many details, characters with complex faces, anime fanart, text, logo

## T02 · P2 · logo_primary.png · 2048x2048 · 1:1 · TRANSPARENT=YES
（唯一允许文字的任务。若模型拼写不稳，就单独重出这一张。）
PROMPT: A game wordmark logo on a fully transparent background, the ONLY asset in this set that
contains text. Clean rounded geometric sans-serif. First line reads exactly: PHASE SHIFT
Second line, smaller, reads exactly: ECHO GRID
Colour: the word PHASE in warm gold, the word SHIFT in moonlight blue, ECHO GRID in a soft
neutral tone. A tiny glowing spirit spark motif above or between the lines. No heavy outlines,
no bevel, no chrome, no 3D extrusion. Centred with generous margins of at least 8 percent.
Spelling must be exact, exactly two text lines, 4k.
EXTRA NEGATIVE: misspelling, extra letters, missing letters, more than two text lines, chinese
characters in the wordmark, heavy glow, bevel, emboss, chrome, metallic, 3D extrusion, grunge
texture, busy ornament, dark background, jagged edges

## T03 · P2 · logo_mark.png · 1024x1024 · 1:1 · TRANSPARENT=YES
PROMPT: A compact game icon mark on a fully transparent background. A rounded square grid softly
cut by an S-shaped boundary: one half ivory-gold, the other half indigo-moonlight, with one
faint glowing spark at the centre. Absolutely NO text, no letters. Flat soft vector with gentle
gradients, clean premium look, must remain readable at 32x32 pixels, 4k.
EXTRA NEGATIVE: text, letters, words, complex detail, thin fragile lines, bevel, 3D extrusion,
dark background, unreadable at small size

## T09 · P2 · portal_a.png · 512x512 · 1:1 · TRANSPARENT=YES
PROMPT: A single small game prop on a fully transparent background: a phase portal. An ivory-gold
ring with a hint of sky blue and a soft inner swirl, open hollow centre, standing upright and
readable as a pair-link with its shadow counterpart. Centred, fills about 72 percent of the
frame, crisp silhouette, soft glow, no heavy outline, 4k. Not a door, not a wall.
EXTRA NEGATIVE: door, gate, wall, brick, stone, text, arrows, fire, lava, chaotic swirl,
mismatched size

## T10 · P2 · portal_b.png · 512x512 · 1:1 · TRANSPARENT=YES
PROMPT: A single small game prop on a fully transparent background: the same phase portal in its
shadow phase, IDENTICAL shape, size, angle and framing to the light version, only recoloured:
indigo-violet ring with a moonlight-blue inner swirl. Centred, fills about 72 percent of the
frame, crisp silhouette, soft glow, no heavy outline, 4k.
EXTRA NEGATIVE: different shape, different size, different angle, door, gate, wall, text, fire,
scary, horror

# SELF-CHECK（交付前逐条自检，不合格就重出该张）
[ ] 11 个文件全部存在于上述路径，文件名与大小写完全一致
[ ] 尺寸精确：1920x1080 严格 16:9；方形素材 512/1024/2048 严格 1:1
[ ] 标注 TRANSPARENT=YES 的 7 张具备真实 alpha（棋盘格验证），无白底盒、无黑边毛刺
[ ] T04 与 T05 轮廓、姿势、视觉大小一致（叠加对比可通过）
[ ] T09 与 T10 轮廓 100% 一致，只有配色不同（不一致必须重出）
[ ] T06 与 T07 构图语言/机位一致，交叉淡入不跳位；两张中心 60% 区域安静均匀（局部对比 ≤ 约 1.6:1）
[ ] T06/T07 转成灰度后仍能一眼分辨哪个是亮世界、哪个是暗世界
[ ] T08 Goal 读作空心环，绝不像墙或砖块；缩到 48x48 仍无歧义
[ ] T11 每个元素独立可切；零烘焙文字；图标 48px 可读、24px 可辨；线宽与圆角统一；面板 9-slice 安全
[ ] 除 T02 外没有任何图片含文字；T02 恰好两行且拼写为 PHASE SHIFT / ECHO GRID
[ ] 全套没有任何图里出现网格线/棋盘格/墙体素材（那些由代码绘制）
[ ] 没有素材被超范围放大或加风格化滤镜

# DELIVER
完成后输出一份清单：每个文件路径 | 实际分辨率 | 是否含真实 alpha | 通过/未通过哪条自检 | 未通过原因。
不要替我重命名、不要打包改路径，我会按清单做正式验收与归档。
```

---

## 交付回来时

把 Codex 的报告或文件名列表贴回来即可。之后：

1. **Agent 5** 走验收流程：分辨率 → 真实 alpha → 成对轮廓叠加比对 → 48px 可读性 → 重命名 → 写入 `docs/assets/asset-manifest.md`（`DELIVERED` + 日期 + 原始文件名）。
2. 不合格标 `REJECTED` + 具体原因，回到本文件对应 T 任务重出，**不会悄悄进游戏**。
3. **Orchestrator** 提交 `feat(assets): integrate first art batch`，解除 Stage 2 原型阻塞。

> 备注：GATE C = Option B 只影响程序绘制的墙体/虚影/相位反馈，**不影响本批 11 张位图素材**，无需改 Prompt。