# Codex 总体提示词 — 修订轮（8 张 / 替换被拒候选 · 2026-10-16）

> 用法：把下面**整个方框内容**一次性粘贴给 Codex。自包含风格、管线契约、路径、文件名、尺寸、中英文 Prompt、负面词与再验收门槛。
> 本批是**修订轮**：第一批（T01–T11，见 `docs/assets/codex-master-prompt.md`）中 4 个条目被测量拒绝（`docs/assets/art-acceptance-2026-10-15.md`），本批逐条修形；**已达标的文件严禁重画**（`goal.png`、`logo_mark.png`）。
> 记录：最终美术由**人类指定的 Codex 通道**产出，ASSET GATE 由人类本人签署；Studio Agent 不参与生成，只负责验收与集成。
> 声源：以下五份申请单为唯一合法声源，Prompt 一律**逐字照抄、不得改写**——`docs/assets/asset-request-08-spirit-pair.md` · `09-portal-pair.md` · `10-logo-primary.md` · `11-background-pair.md` · `12-ui-kit.md`。
> 日期：2026-10-16 · 关联：`docs/assets/codex-generation-brief.md`（第一批拆解版）、`docs/assets/asset-manifest.md`

---

```
# ROLE
你在为一款即将参赛的休闲解谜 H5 游戏生成正式上线用美术素材（本次是**修订重出**，上一版部分素材被像素审计拒绝，失败原因与各张"必须保住的已测品质"见每张任务卡）。游戏名：
Phase Shift: Echo Grid / 双相棋盘：昼夜回响。
核心玩法：玩家在网格棋盘上每走一步，世界就在「白昼(Phase A)」与「夜晚(Phase B)」之间自动翻转。
你的图会被直接放进游戏运行时加载，所以可读性高于华丽度。

# GLOBAL STYLE（每一张都必须遵守，与第一批同一套法律，不得变体）
- calm premium casual-puzzle illustration
- soft flat vector illustration + gentle gradients
- clean geometric shapes, generous negative space
- subtle paper / light grain, soft diffused lighting
- NO heavy black outlines, NO bevel, NO chrome, NO 3D extrusion
- 画面绝不出现文字/数字/箭头/水印/签名（唯一例外：任务 R-T10 字标本身；R-T12 素材板零烧字）
- 整套素材必须像同一个工作室同一时间画出来的，风格高度统一
- 输出 PNG。标注 TRANSPARENT=YES 的必须有真实 alpha 通道（不能是白底盒子、不能有黑边/灰边毛刺）
- 不要超过指定分辨率做额外放大；**原生分辨率是硬门槛：任何 upscale/插值放大 = 直接拒收**（宁可生成更大再缩小，绝不从小图插值）

# PALETTES（全世界只有这两套配色）
Phase A / Light 白昼: ivory #F7F1E3, faint gold #E9C87A, sky blue #A8D8F0, warm sand, morning haze
Phase B / Shadow 夜晚: deep indigo #1B1F3B, violet #4A3D7A, moonlight #C9D6FF, cool teal accent, dream dusk
Hue ownership（不要违反）: 目标 Goal = 金琥珀色系(两相位都不变色相)；
传送门 Portal = 青蓝色系(两相位都不变色相)；只有明度与冷暖随相位翻转。

# CRITICAL: 以下元素【不要】画进任何图里
棋盘格子、网格线、墙体、虚影墙、相位切换特效、光标、选中框 —— 这些全部由程序矢量绘制，
属于代码而非素材。背景图中央区域必须干净空白，因为棋盘会叠在正中央。

# ★★★ 本批核心管线契约（与第一批最大的不同，全部成对任务必须遵守）★★★
成对素材（R-T04、R-T06、R-T11）的形态 B **一律不重新绘制**：
1. 先生成形态 A（白昼），通过该任务卡的全部自检；
2. 形态 B = 对 A 的**同一 alpha 轮廓/同一构图做换色换光**（recolor of A's alpha mask / relight），
   形状、尺寸、包围盒、居中、机位逐像素一致，只换配色（星点等额外稀疏层只允许"淡入"，禁止位移）。
3. 两版交叉淡入/原地替换时**任何元素都不得有任何跳动或位移**——第一批被拒的头号原因就是"两个相位各画各的"。

# GLOBAL NEGATIVE（每张图都追加，再叠加任务卡自己的 EXTRA NEGATIVE）
text, letters, numbers, watermark, signature, logo, harsh black outlines, photorealism,
3D render, heavy drop shadow, bevel, emboss, chrome, neon oversaturation, cluttered
background, busy pattern, low contrast, blurry, horror, scary, gore, weapon, distorted
perspective, extra limbs, anime character, opaque white background box, dark fringe,
upscale artefacts, interpolated low-res source

# OUTPUT LAYOUT — 严格按此路径与文件名保存（替换被拒旧文件；同名直接覆盖）
assets/art/
  character/echo_spirit_a.png          (R-T04, 512×512, TRANSPARENT=YES)
  character/echo_spirit_b.png          (R-T04, 512×512, TRANSPARENT=YES, =recolor of A)
  props/portal_a.png                   (R-T06, 512×512, TRANSPARENT=YES)
  props/portal_b.png                   (R-T06, 512×512, TRANSPARENT=YES, =recolor of A)
  background/bg_phase_a_1920x1080.png  (R-T11, 1920×1080, native)
  background/bg_phase_b_1920x1080.png  (R-T11, 1920×1080, native, =relight of A)
  logo/logo_primary.png                (R-T10, 2048×2048, TRANSPARENT=YES, native)
  ui/ui_kit.png                        (R-T12, 2048×2048, TRANSPARENT=YES, native)
严禁触碰（已达标，重画=事故）: assets/art/props/goal.png · assets/art/logo/logo_mark.png

# GENERATION RULES
1. 一个任务生成一张独立图片（成对的按管线契约由 A 派生 B，不算两次创作）。
2. 优先级：P0（R-T04 精灵对、R-T11 背景对——阻塞 Stage-2 可读性测试）→ P1（R-T06 传送门对）→ P2（R-T10 字标、R-T12 UI 板）。
3. 每张完成后自行对照该任务卡的 SELF-CHECK 数值门槛检查，不合格就重出该张，不要交付凑合版本。
4. 对"原生分辨率"任务（R-T10/R-T11/R-T12）：在交付说明里披露生成方式（原生多大、是否缩小过）；插值放大会被拒收。

# TASKS

## R-T04 · P0 · echo_spirit_a/_b.png · 512×512 · 1:1 · TRANSPARENT=YES
声源: docs/assets/asset-request-08-spirit-pair.md（A-03-R1）
被拒原因（务必避开）: A/B 轮廓 IoU 仅 0.8584、尾巴形状不同、B 体环外移；取景 48–52% 低于带宽。
必须保住的已测品质: A 暖蜂蜜金身体（核心亮度锚 0.6068–0.624，不得接近纯白）+ 淡天空蓝光晕；
B 靛紫身体 + 月光蓝光晕；恰好两点柔光眼；圆球 + 单一左上飘尾；真 alpha 干净边缘；48/32/24px 双底板可辨。
中文 Prompt（逐字）:
> 一个透明背景的小型发光精灵素材：简单圆润的光灵，一颗柔和发光的光球带一条向左上飘起的轻柔飘尾，极简细节，两点柔和微光眼睛，无人形、无四肢、无衣饰、无复杂脸。形态 A（白昼）：暖象牙金偏蜂蜜色的身体（不得接近纯白），淡天空蓝光晕。居中，轮廓包围盒占画面宽与高各约 70%（±3%），边缘干净无暗边毛刺。扁平柔和插画风，细腻渐变，内发光，少量颗粒，无粗黑描边，4K。**形态 B 不重新绘制：由形态 A 的同一 alpha 轮廓精确换色得到**——靛蓝紫罗兰身体、月光蓝光晕，形状、尺寸、位置与 A 逐像素一致。
English Prompt（逐字）:
> One small glowing spirit asset on a fully transparent background: a simple round luminous wisp — one softly glowing orb with a single gentle trailing tail curling to the upper-left, minimal detail, two tiny soft glowing eye dots, not humanoid, no limbs, no clothes, no complex face. Form A (Light): warm honey-ivory-gold body (explicitly NOT near-white) with a pale sky-blue aura. Centred; the silhouette bounding box fills about 70 % (±3 %) of the canvas in BOTH width and height; crisp clean edge, no dark fringe. Soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy outlines, 4k. **Form B is not re-drawn: it is an exact recolor of form A's identical alpha silhouette** — indigo-violet body with a moonlight-blue aura, pixel-identical shape, size and position.
EXTRA NEGATIVE（逐字）:
> different silhouette between forms, different size, different pose, different framing, off-centre subject, silhouette smaller than 60 % or larger than 85 % of canvas, humanoid body, arms, legs, detailed face, anime, wings, horns, scary ghost, skull, horror, weapon, dark muddy glow, harsh outline, 3D render, photorealistic, busy detail, text, watermark, pure white blown-out body, opaque white background box, dark fringe around glow, upscale artefacts
SELF-CHECK 数值门槛: IoU(A,B) α≥128 ≥ 0.99（走 recolor 管线应为 1.000）、chamfer ≤ 8 px；
bbox 填充宽高二轴均 ∈ [65 %, 80 %]，A/B 尺寸差 ≤ 2 %，质心偏差 ≤ 2 %；
A 核心(α≥200) luminance-of-mean-RGB ∈ [0.55, 0.70]、核心色相 ∈ [35°, 50°]；角 alpha=0、暗边 dark_fraction ≤ 0.05；
48/32 px 象牙底与靛蓝底可读且 A/B 可辨；覆盖叠影只应剩 ≤8px 边缘环。

## R-T11 · P0 · bg_phase_a/_b_1920x1080.png · 1920×1080 · 16:9 · 不透明 · 原生
声源: docs/assets/asset-request-11-background-pair.md（A-04-R1 + A-05-R1）
被拒原因: 双版模糊结构相关仅 −0.0712（云团只在一版出现/位置不同，交叉淡化会跳）；且由 1672×941 插值放大（非原生）。
必须保住的已测品质: 中心 60% 完全安静（min/max 对比 ≤1.6）；9:16 中裁安全（≤1.2 且特征完整）；
灰度明暗分离 A 亮 B 暗（比 ≥ 10:1，实测锚 13.28:1）；内容语法：A 象牙渐变天+淡金晨雾+角部云岸，B 深靛渐变+紫罗兰暮雾+少量针尖星+角部云岸。
中文 Prompt（逐字）:
> 休闲解谜游戏的全屏背景对图（同一构图、两个时刻）：先画白昼版——柔和象牙白渐变天空、淡金晨雾、左下与右下两团极柔的云岸、左上一缕小云、中心 60% 完全安静无物体；夜晚版必须是**同一张构图换光换色**：云团位置、大小、机位逐一对应，改为深靛蓝渐变、紫罗兰暮雾、右上几颗微小星点、柔和月光晕。两版交叉淡入时任何形状都不位移。极简、低对比、低细节、无文字无物体无网格，扁平柔和插画风，细腻渐变，少量颗粒，原生 1920×1080，4K。
English Prompt（逐字）:
> A matched pair of full-screen puzzle-game backgrounds: ONE composition at two times of day. Daytime version first — soft ivory gradient sky, faint golden morning haze, two very soft cloud banks anchored in the bottom-left and bottom-right corners, one small wisp in the top-left corner, the central 60 % completely quiet and object-free. The night version is the SAME composition relit and recolored — identical cloud positions, sizes and camera — in deep indigo gradient with violet dusk haze, soft moonlight glow and a few tiny pin-stars in the top-right quadrant. Cross-dissolving the two must move nothing. Extremely minimal, low contrast, low detail; no text, characters, board, grid, objects or UI; no vignette, flare, neon or horror. Soft flat illustration, gentle gradients, subtle grain, native 1920×1080, 4k.
EXTRA NEGATIVE（逐字）:
> different composition between phases, moved clouds, mismatched camera, cross-dissolve ghosting, busy pattern, high contrast, strong outlines, text, characters, board, grid, tiles, walls, objects, clutter, neon, photorealistic landscape, detailed foliage, harsh shadows, heavy vignette, lens flare, horror, scary, monsters, nebula overload, photorealistic starfield, watermark, upscale artefacts
SELF-CHECK 数值门槛: 模糊结构相关(A,B) ≥ 0.9；50/50 叠化无任何形状位移（星点只准作稀疏淡入层）；
原生 1920×1080（披露生成方式，插值痕迹检查）；中心 60% min/max ≤ 1.6（并报 contrast_2_98）；
9:16 裁切对比 ≤ 1.2 且特征完整；灰度亮度比 ≥ 10:1 且 A 亮 B 暗；内容语法目视复核。

## R-T06 · P1 · portal_a/_b.png · 512×512 · 1:1 · TRANSPARENT=YES
声源: docs/assets/asset-request-09-portal-pair.md（A-06-R1；goal.png 已达标**不重画**）
被拒原因: A/B 轮廓 IoU 0.9672、外缘错位；取景 56.6×83.2% 越出带宽且与 goal（78.9×79.1%）不齐；白色镜面高光条读成 glossy 3D。
必须保住的已测品质: 双版青蓝色系（A 亮青、B 深蓝，色相跨相位恒定只翻明度冷暖）；竖直圆润椭圆环+镂空环心+环内左侧一条柔涡笔；48px 语义无歧义；真 alpha 干净边缘。
中文 Prompt（逐字）:
> 一个透明背景的相位传送门素材：竖直圆润椭圆环，环心镂空，环内左侧一条柔和漩涡笔触，扁平柔和插画风、细腻渐变、柔和内发光，无高光镜面条、无玻璃质感、无粗黑描边。配色 A（白昼）：明亮青蓝色环（青蓝色系不变）。居中，轮廓包围盒占画面宽与高各约 79%（±1%），边缘干净。**形态 B 不重新绘制：由 A 的同一 alpha 轮廓精确换色**——更深的蓝蓝色环、月光蓝漩涡，形状尺寸位置逐像素一致。4K。
English Prompt（逐字）:
> One phase-portal prop on a fully transparent background: an upright rounded-ellipse ring with an open hollow centre and a single soft swirl stroke hugging the inner-left of the ring. Soft flat illustration, gentle gradients, soft inner glow only — NO specular streaks, NO glass/chrome highlights, no heavy outlines. Phase A colour: bright teal-cyan ring (teal/blue family, hue fixed across phases). Centred; silhouette bounding box fills about 79 % (±1 %) of canvas width AND height; crisp clean edge. **Phase B is not re-drawn: an exact recolor of form A's identical alpha silhouette** — deeper blue ring with a moonlight-blue swirl, pixel-identical shape, size, position. 4k.
EXTRA NEGATIVE（逐字）:
> different shape, different size, different angle, different framing, specular highlight, chrome, glass, glossy 3D torus, 3D render, photorealism, door, gate, wall, brick, stone, text, arrows, letters, numbers, fire, lava, chaotic swirl, scary, horror, silhouette smaller than 65 % or larger than 80 % of canvas, off-centre, opaque background box, dark fringe, upscale artefacts
SELF-CHECK 数值门槛: IoU(a,b) ≥ 0.99（recolor 管线应 1.000）、chamfer ≤ 8 px；
三件套取景互差 ≤ 2 %（goal 固定 78.9×79.1 ⇒ 传送门落 76.9–80.0 % 宽、77.1–80.0 % 高）；
传送门核心色相 ∈ [170°, 230°]（锚 192.0°/205.6°），与 goal 金琥珀（[30°, 55°]）色距 ≥ 100°；
无镜面高光条；48px 象牙/靛蓝双底无歧义；原生 512 禁 upscale。

## R-T10 · P2 · logo_primary.png · 2048×2048 · 1:1 · TRANSPARENT=YES · 原生
声源: docs/assets/asset-request-10-logo-primary.md（A-02-R1；logo_mark.png 已达标**不重画**）
被拒原因: 水平留白仅 6.15 %/5.86 %（< 8 % 门槛）；且由 1280×1280 插值放大（非原生）。
必须保住的已测品质: 恰好两行、拼写精确 `PHASE SHIFT` / `ECHO GRID`、无第三行无中文；
`PHASE` 暖金、`SHIFT` 月光蓝、`ECHO GRID` 柔和中性灰；行间上方一点微小光灵火花；圆润几何无衬线、扁平、干净 alpha。
中文 Prompt（逐字）:
> 透明背景的游戏主字标：圆润几何无衬线，第一行 "PHASE SHIFT"，第二行较小 "ECHO GRID"，两行之间或上方一个微小光灵火花；"PHASE" 暖金色、"SHIFT" 月光蓝、"ECHO GRID" 柔和中性灰；无粗描边、无浮雕、无金属、无 3D。**整体墨块收缩居中：左右上下四边各留至少 10% 的完全空白边距（墨块宽度不超过画布的 84%）**，拼写精确、恰好两行。扁平柔和、干净高级，原生 2048×2048 输出，4K。
English Prompt（逐字）:
> Game wordmark on a fully transparent background: clean rounded geometric sans-serif; first line exactly "PHASE SHIFT", smaller second line exactly "ECHO GRID", tiny glowing spirit spark above/between the lines; "PHASE" in warm gold, "SHIFT" in moonlight blue, "ECHO GRID" in soft neutral grey; no heavy outlines, no bevel, no chrome, no 3D extrusion. **Pull the lockup in: at least 10 % fully empty margin on all four sides (ink block ≤ 84 % of canvas width), optically centred.** Exactly two text lines, exact spelling. Soft flat vector, gentle gradients, clean premium, native 2048×2048 output, 4k.
EXTRA NEGATIVE（逐字）:
> misspelling, extra letters, missing letters, more than two text lines, chinese characters, heavy glow, bevel, emboss, chrome, metallic, 3D extrusion, grunge, busy ornament, dark background, jagged edges, watermark, ink touching canvas edge, margin smaller than 8 percent, upscaled interpolation, low resolution
SELF-CHECK 数值门槛: 墨块包围盒四边留白 ≥ 8.0 %（目标 10 %）；原生 2048（披露生成方式 + 字缘插值痕迹检查）；
两行拼写逐字复核；640 px 与 96 px 显示尺寸下字缘无暗边、角 alpha=0。

## R-T12 · P2 · ui_kit.png · 2048×2048 · 素材源板 · TRANSPARENT=YES · 原生
声源: docs/assets/asset-request-12-ui-kit.md（A-07-R1）
被拒原因: 13 元素缺 `icon_back`（左尖括号）；且由 1280 插值放大（非原生）。
必须保住的已测品质: 现有 13 元素**逐一保持原画法**（金胶囊主按钮/幽灵按钮、统一粗线圆润图标组：撤销/重开/下一步/声音开关、独立日光与月牙符号、象牙金边面板 + 靛蓝月光边面板（9-slice，圆角≈面板宽 9 %）、金底深日胶囊 + 靛紫底浅月胶囊）；全板零烧字；仅 undo/restart/next/back 允许箭头。
中文 Prompt（逐字）:
> 一张透明背景的极简游戏 UI 素材源板（2048×2048，元素间宽间距、各自独立可切）：1) 圆角胶囊主按钮（暖金到柔琥珀渐变、微内发光）与幽灵按钮（细柔描边、近透明填充），不含文字；2) 线性加柔填图标，统一线宽与圆角：撤销（柔和弧形箭头）、重开（环形箭头）、**返回（左尖括号，与下一步镜像同线宽）**、下一步（右尖括号）、声音开（喇叭加两道声波）、声音关（喇叭加斜叉）；3) 独立符号：日光符号（圆盘加八条短射线）、月牙符号；4) 圆角九宫格面板两版：白昼象牙底金边、夜晚靛蓝底月光边，边框平直、中心无细节可拉伸；5) 相位胶囊两枚：象牙金底加深色日光符号、靛蓝紫底加浅色月牙符号，仅图标不含文字。整体柔和圆润低对比，绝不与棋盘争注意力；图标 48px 可读、24px 可辨。扁平柔和插画风，细腻渐变，无粗黑描边，原生 2048×2048，4K。
English Prompt（逐字）:
> One minimal game UI source sheet on a fully transparent background (2048×2048, neat grid of separated elements with wide gaps, each individually cuttable): 1) a rounded pill primary button (warm gold to soft amber gradient, subtle inner glow) and a ghost button (thin soft outline, near-transparent fill), no text; 2) line-plus-soft-fill icons with one consistent stroke weight and corner radius: undo (soft curved arrow), restart (circular arrow), **back (chevron-left, mirrored sibling of next, same stroke)**, next (chevron-right), sound on (speaker with two waves), sound off (speaker with slash-cross); 3) standalone glyphs: sun (disc with eight short rays) and crescent; 4) two soft rounded 9-slice panels — ivory with gold border (Light) and indigo with moonlight border (Shadow) — flat border region, detail-free stretchable centre; 5) two phase chips: ivory-gold pill with dark sun glyph, indigo-violet pill with pale crescent glyph, icon only, no text. Everything calm, rounded, low-contrast, never competing with the board; icons legible at 48 px and recognisable at 24 px. Soft flat illustration, gentle gradients, no heavy outlines, native 2048×2048, 4k.
EXTRA NEGATIVE（逐字）:
> baked-in text, labels, numbers, letters, cursor, pointer, selection box, grid lines, board tiles, glossy 3D buttons, heavy drop shadow, bevel, skeuomorphism, harsh outlines, neon, clutter, dark muddy colors, inconsistent icon style, missing chevron-left, photorealistic, watermark, solid opaque background, upscale artefacts
SELF-CHECK 数值门槛: 视觉元素合计 **14**（含新增 `icon_back` 左尖括号，摆在 next 旁作镜像兄弟）；
back 与 next 水平镜像叠合 IoU ≥ 0.95（同线宽/端点圆角/视觉尺寸）；原生 2048（披露 + 痕迹检查）；
图标组 48px 可读、24px 可辨；面板平边平心（非平心区域 ≤ 24 % 为合格）；灰度下日光/月牙靠形状可分。

# DELIVERY NOTE（交付时请附）
- 每张一行说明：生成方式（原生尺寸/是否缩小/生成工具与种子），落盘路径与文件名。
- 替换到位后告知，Studio 将用既有 Pillow 审计（轮廓 IoU、chamfer、bbox 填充、色相/亮度锚、对比度、留白、元素普查）逐张复检，
  门槛即上文各 SELF-CHECK 数字，不接受口头达标。
```

---

## Studio 侧接口（非 Codex 内容，供人类与验收席查）

| 任务 | 申请单（声源路径） | 落盘目标 | 优先级 | 复检方 |
|---|---|---|---|---|
| R-T04 精灵对 | `docs/assets/asset-request-08-spirit-pair.md` | `assets/art/character/echo_spirit_a.png` `_b.png` | **P0** | Orchestrator Pillow audit + QA 交叉 |
| R-T11 背景对 | `docs/assets/asset-request-11-background-pair.md` | `assets/art/background/bg_phase_a_1920x1080.png` `_b` | **P0** | 同上 |
| R-T06 传送门对 | `docs/assets/asset-request-09-portal-pair.md` | `assets/art/props/portal_a.png` `_b.png`（goal 不动） | P1 | 同上（三件套取景互差 ≤2 %） |
| R-T10 主字标 | `docs/assets/asset-request-10-logo-primary.md` | `assets/art/logo/logo_primary.png`（mark 不动） | P2 | 留白/拼写/原生 |
| R-T12 UI 板 | `docs/assets/asset-request-12-ui-kit.md` | `assets/art/ui/ui_kit.png` | P2 | 14 元素普查 |

> 集成前提：交付后的运行时接线是 **R-005（art integration）** 工单，归 Gameplay/UA；本文件只负责"图怎么出"。
> 出图顺序建议：R-T04 → R-T11（两件 P0 先过）→ R-T06 → R-T10 → R-T12。
