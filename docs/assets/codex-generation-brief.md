# Codex 生图指令包 — 第一批素材（A-01 … A-07 / 11 个文件）

> Owner: **Agent 5 — UI / UX / Art Director** · Orchestrator 汇总
> Date: 2026-10-14 · Status: **GENERATING (user-authorized Codex channel)**
>
> **ASSET GATE 授权记录：** 本项目的最终美术**不由 Studio Agent 自行生成**。本次由**人类**明确指定使用其自有 **Codex 生图通道**产出，因此人类 gate 已被人类本人签署通过。Agent 只负责：提供 Prompt、验收、重命名、归档、集成。**禁止**任何 Agent 擅自新增未登记于此的素材。

---

## 0. 给 Codex 的总前缀指令（每个任务都拼在 Prompt 前面）

```
You are generating production art assets for a calm premium casual puzzle game
called "Phase Shift: Echo Grid". Output must be a single clean PNG image.
STYLE (mandatory for every asset): soft flat vector illustration with gentle
gradients, clean geometric shapes, generous negative space, subtle paper/light
grain, soft diffused lighting, NO heavy black outlines, nothing busy, high
readability, cohesive with the rest of the set.
PALETTES (only these two worlds):
  Phase A / Light  : ivory #F7F1E3, faint gold #E9C87A, sky blue #A8D8F0, warm sand, morning haze
  Phase B / Shadow : deep indigo #1B1F3B, violet #4A3D7A, moonlight #C9D6FF, cool teal accent, dream dusk
RULES: no text/letters/numbers/watermark/signature (except the wordmark task T02).
Do not upscale beyond the requested size. Preserve real alpha where marked TRANSPARENT=YES.
```

**每个任务都追加统一负面词（Global Negative）：**

```
text, letters, numbers, watermark, signature, logo, harsh black outlines,
photorealism, 3D render, heavy drop shadow, bevel, emboss, chrome, neon
oversaturation, cluttered background, busy pattern, low contrast, blurry,
horror, scary, gore, weapon, distorted perspective, extra limbs, anime character
```

> 说明：`Global Negative` 覆盖下面每个任务自带的 negative prompt 中的重叠项；两者合并使用即可。

---

## 1. 任务清单（11 个文件，一次一个 Prompt，不要把多个素材塞进同一张图）

| # | Asset | 输出文件名 | 目标目录 | 尺寸 | 比例 | 透明 | 优先级 |
|---|---|---|---|---|---|---|---|
| T01 | A-01 Cover | `cover_hero_1920x1080.png` | `assets/art/cover/` | 1920×1080 | 16:9 | No | P2 |
| T02 | A-02 Logo wordmark | `logo_primary.png` | `assets/art/logo/` | 2048×2048 | 1:1 | Yes | P2 |
| T03 | A-02 Logo mark | `logo_mark.png` | `assets/art/logo/` | 1024×1024 | 1:1 | Yes | P2 |
| **T04** | **A-03 Echo Spirit A** | **`echo_spirit_a.png`** | **`assets/art/character/`** | **512×512** | **1:1** | **Yes** | **P0** |
| **T05** | **A-03 Echo Spirit B** | **`echo_spirit_b.png`** | **`assets/art/character/`** | **512×512** | **1:1** | **Yes** | **P0** |
| **T06** | **A-04 Phase A bg** | **`bg_phase_a_1920x1080.png`** | **`assets/art/background/`** | **1920×1080** | **16:9** | **No** | **P0** |
| **T07** | **A-05 Phase B bg** | **`bg_phase_b_1920x1080.png`** | **`assets/art/background/`** | **1920×1080** | **16:9** | **No** | **P0** |
| **T08** | **A-06 Goal** | **`goal.png`** | **`assets/art/props/`** | **512×512** | **1:1** | **Yes** | **P0** |
| T09 | A-06 Portal A | `portal_a.png` | `assets/art/props/` | 512×512 | 1:1 | Yes | P2 |
| T10 | A-06 Portal B | `portal_b.png` | `assets/art/props/` | 512×512 | 1:1 | Yes | P2 |
| T11 | A-07 UI kit | `ui_kit.png` | `assets/art/ui/` | 2048×2048 | 1:1 | Yes | P1 |

**最小可开工集 = T04 / T05 / T06 / T07 / T08（P0）。** 先给这 5 张，我就能立刻开跑 Stage 2 原型与可读性验证；其余可以边开发边补。

---

## 2. 逐任务 Prompt（P0 优先）

### T04 · Echo Spirit — Light form (**P0**) → `echo_spirit_a.png` · 512×512 · YES transparent

```
A single small glowing spirit character on a fully transparent background. A simple
round luminous wisp: one softly glowing orb with a gentle trailing tail, minimal
detail, optionally two tiny soft glowing eyes. NOT humanoid, no arms, no legs, no
clothes, no face detail, not an anime mascot. Warm ivory-gold body glow with a pale
sky-blue aura, serene and calm. The body should be a slightly DEEPER gold rather than
near-white so it stays readable on an ivory game cell. Centred, the silhouette fills
about 70% of the frame, crisp clean edge, soft inner glow, subtle grain, no dark
fringe or halo artefact around the glow edge. Single character only, nothing else in
frame, 4k.
```
Task negative: `humanoid body, arms, legs, detailed face, anime, cartoon mascot with clothes, wings, horns, scary ghost, skull, horror, weapon, dark muddy glow, harsh outline, busy detail, pure white blown-out body, opaque white background box, dark fringe around glow`

### T05 · Echo Spirit — Shadow form (**P0**) → `echo_spirit_b.png` · 512×512 · YES transparent

```
A single small glowing spirit character on a fully transparent background, the SAME
character silhouette, same pose, same size and same framing as its light counterpart:
a simple round luminous wisp with a gentle trailing tail, minimal detail, optionally
two tiny soft glowing eyes. NOT humanoid, no limbs, no clothes, no complex face.
Indigo-violet body glow with a moonlight-blue core, dreamy yet gentle, calm, never
scary. Centred, silhouette fills about 70% of the frame, crisp clean edge, soft inner
glow, subtle grain, no dark fringe around the glow edge. Single character only,
nothing else in frame, 4k.
```
Task negative: `different silhouette, different size, different pose, humanoid body, arms, legs, detailed face, anime, wings, horns, scary ghost, skull, horror, gore, weapon, harsh outline, opaque background box`

> ⚠ 验收硬条件：T04 与 T05 的**轮廓和视觉大小必须一致**（叠加测试）。不一致就要其中一张重出。

### T06 · Phase A / Light World 全屏背景 (**P0**) → `bg_phase_a_1920x1080.png` · 1920×1080 · NO transparent

```
A full-screen "Light World / daytime" background for a calm puzzle game. Soft ivory
gradient sky, faint golden morning haze, delicate floating dust motes, very subtle
distant geometric cloud or hill shapes. Extremely minimal, low contrast, low detail.
The central 60 percent of the image must be especially quiet and even, because the game
board is drawn on top of the centre. Avoid any strong shape or high-contrast edge that
could be mistaken for a wall, a tile or a path. No grid, no tiles, no objects, no
characters. Spacious, serene, premium, 4k.
```
Task negative: `busy pattern, high contrast, strong outlines, board, grid, tiles, walls, objects, characters, clutter, dark, night, neon, photorealistic landscape, detailed foliage, harsh shadows, heavy vignette`

### T07 · Phase B / Shadow World 全屏背景 (**P0**) → `bg_phase_b_1920x1080.png` · 1920×1080 · NO transparent

```
A full-screen "Shadow World / night" background for a calm puzzle game. Deep indigo
gradient night sky, faint violet dusk haze, soft moonlight glow, a few distant tiny
stars, delicate floating light motes. Extremely minimal, low contrast, low detail. The
central region must be especially quiet and even, because the game board is drawn on top
of the centre. Use exactly the same composition language and camera as its daytime
counterpart, like the same world at another time of day. Dreamy and gentle, never scary.
No grid, no tiles, no objects, no characters. 4k.
```
Task negative: `horror, scary, monsters, dark oppressive mood, blood, gore, harsh contrast, busy pattern, strong outlines, board, grid, tiles, objects, characters, photorealistic starfield, nebula overload, neon oversaturation`

### T08 · Goal 目标点 (**P0**) → `goal.png` · 512×512 · YES transparent

```
A single small game prop on a fully transparent background: the Goal marker. A warm,
welcoming glowing ring with soft inner light and an open hollow centre, instantly
readable as "the place to reach". Gold-amber hue family, phase-neutral so it reads in
both a light and a dark world. It must NOT look like a wall, a brick, a stone block or
a door. Centred, fills about 70 percent of the frame, crisp silhouette, soft glow,
gentle gradients, no heavy outline, legible when shrunk to 48x48 pixels. One object
only, nothing else in frame, 4k.
```
Task negative: `wall look, door look, brick, stone texture, solid filled block, arrows, letters, numbers, text, cluttered detail, fire, lava, harsh outline, unreadable at small size`

---

## 3. 逐任务 Prompt（P1 / P2）

### T11 · UI kit（**P1**）→ `ui_kit.png` · 2048×2048 · YES transparent

```
A minimal game UI asset sheet on a fully transparent background, arranged as a neat
grid of separated elements with wide gaps so each element can be cut out individually.
Include: 1) a rounded pill primary button (warm gold to soft amber gradient, subtle
inner glow) and 2) a ghost button (thin soft outline, nearly transparent fill), both
with NO text; 3) simple line-plus-soft-fill icons, each in its own cell: undo (soft
curved arrow), restart (circular arrow), sound on, sound off, next (chevron right),
phase sun glyph, phase crescent glyph; 4) one soft rounded 9-slice panel in ivory
(Light) and one in indigo (Shadow), low contrast, with a flat border region and a
clean stretchable centre; 5) two phase indicator pills: an ivory-gold pill with a small
sun glyph, and an indigo-violet pill with a small crescent glyph, icon only.
Everything calm, rounded, low contrast, never competing with the game board; icons must
stay legible at 48 pixels on mobile and recognizable at 24 pixels, with consistent
stroke weight and corner radius. Clean premium, 4k.
```
Task negative: `baked-in text, labels, numbers, glossy 3D buttons, heavy drop shadow, bevel, skeuomorphism, harsh outlines, neon, clutter, inconsistent icon style, dark muddy colors, solid opaque background`
> 若模型把元素挤成一团：接受它作为**源画板**，Agent 5 会在集成时自行切图重命名。

### T01 · Cover（**P2**）→ `cover_hero_1920x1080.png` · 1920×1080 · NO transparent

```
Key art for a calm premium puzzle game, 16:9. Flat top-down view of a clean 5x5 grid
board centred in frame, split softly down the middle: the left half is a Light World of
ivory white, faint gold and sky-blue morning haze; the right half is a Shadow World of
deep indigo, violet and moonlight. A small glowing wisp spirit stands at the centre on
the boundary, facing the Shadow side. Faint translucent phase walls hinted on both
halves, light blocks on the left, dark blocks on the right. Generous negative space, the
clean upper third reserved for a logo to be added later. No text anywhere. Calm,
premium, highly readable, 4k.
```
Task negative: `isometric perspective, 3D render, photorealism, lens flare, crowded composition, too many details, characters with complex faces, anime fanart, text, logo`

### T02 · Logo wordmark（**P2**）→ `logo_primary.png` · 2048×2048 · YES transparent

```
A game wordmark logo on a fully transparent background, the ONLY asset in this set that
contains text. Clean rounded geometric sans-serif. First line reads exactly: PHASE SHIFT
Second line, smaller, reads exactly: ECHO GRID
Colour: the word PHASE in warm gold, the word SHIFT in moonlight blue, ECHO GRID in a
soft neutral tone. A tiny glowing spirit spark motif above or between the lines. No
heavy outlines, no bevel, no chrome, no 3D extrusion. Centred with generous margins of
at least 8 percent. Spelling must be exact, exactly two text lines, 4k.
```
Task negative: `misspelling, extra letters, missing letters, more than two text lines, chinese characters in the wordmark, drop shadow glow heavy, bevel, emboss, chrome, metallic, 3D extrusion, grunge texture, busy ornament, dark background, jagged edges`

### T03 · Logo mark（**P2**）→ `logo_mark.png` · 1024×1024 · YES transparent

```
A compact game icon mark on a fully transparent background. A rounded square grid softly
cut by an S-shaped boundary: one half ivory-gold, the other half indigo-moonlight, with
one faint glowing spark at the centre. Absolutely NO text, no letters. Flat soft vector
with gentle gradients, clean premium look, must remain readable at 32x32 pixels, 4k.
```
Task negative: `text, letters, words, complex detail, thin fragile lines, bevel, 3D extrusion, dark background, unreadable at small size`

### T09 · Phase Portal A（**P2**）→ `portal_a.png` · 512×512 · YES transparent

```
A single small game prop on a fully transparent background: a phase portal. An ivory-gold
ring with a hint of sky blue and a soft inner swirl, open hollow centre, standing upright
and readable as a pair-link with its shadow counterpart. Centred, fills about 72 percent
of the frame, crisp silhouette, soft glow, no heavy outline, 4k. Not a door, not a wall.
```
Task negative: `door, gate, wall, brick, stone, text, arrows, fire, lava, swirl too chaotic, mismatched size`

### T10 · Phase Portal B（**P2**）→ `portal_b.png` · 512×512 · YES transparent

```
A single small game prop on a fully transparent background: the same phase portal in its
shadow phase, IDENTICAL shape, size, angle and framing to the light version, only
recoloured: indigo-violet ring with a moonlight-blue inner swirl. Centred, fills about 72
percent of the frame, crisp silhouette, soft glow, no heavy outline, 4k.
```
Task negative: `different shape, different size, different angle, door, gate, wall, text, fire, scary, horror`

> ⚠ 验收硬条件：T09 与 T10 轮廓**必须 100% 一致**（只换色）。形状不一致 = 直接退回重出。

---

## 4. 交付后流程

1. 把生成的文件名列表贴回来（或放到 `assets/art/<category>/` 后告诉我路径）。
2. **Agent 5** 执行验收：分辨率 → 真实 alpha（棋盘格测试，不允许白底盒）→ 风格一致性 → 叠加尺寸一致性（T04/T05、T09/T10）→ 48px 可读性 → 重命名 → 写入 `docs/assets/asset-manifest.md`（状态 `DELIVERED` + 日期 + 原始文件名）。
3. **Orchestrator** 提交 `feat(assets): integrate first art batch`，解除 Stage 2 阻塞。
4. 不合格项会被标 `REJECTED` 并附带**具体原因**，回到本文件重出该任务——不会悄悄塞进游戏。

## 5. 验收标准摘要（逐条）

- **T04/T05**：真实透明；居中占 65–80%；两张叠加后轮廓与视觉大小一致；无四肢/衣服/复杂脸；48×48 与 32×32 仍可辨；B 形态绝不恐怖；A 形态避免纯白过曝。
- **T06/T07**：精确 16:9；中心 60% 安静均匀（无独立物体、无硬边，局部对比 ≤ ~1.6:1）；裁成 9:16 竖屏中心仍可用；转灰度后仍能分辨哪个是"亮"哪个是"暗"；两张构图语言一致，交叉淡入不跳位；无文字/角色/棋盘元素。
- **T08**：真实透明；空心环、不是墙也不是门；48×48 无歧义；金琥珀色系。
- **T09/T10**：轮廓完全一致只换色；否则退回。
- **T11**：每个元素真实 alpha；**零烘焙文字/数字/标签**；图标 48px 可读、24px 可辨、线宽与圆角统一；图标语义不依赖颜色；面板 9-slice 安全（边框区平直、圆角 ≤ 面板宽 24%）；相位胶囊仅图标（日/月），灰度下仍可区分。
- **T01**：≥1920×1080 精确 16:9；零文字；俯视平面（非等距）；左右亮暗分区在 480px 宽仍明显；上 1/3 干净留给 logo。
- **T02/T03**：真实 alpha（棋盘格测试）；字标恰好两行且拼写为 `PHASE SHIFT` / `ECHO GRID`；标记**无文字**且 32×32 可读；边距 ≥8%；无 bevel/chrome/3D。

## 6. 与核心规则 B 的关系（重要）

GATE C 已选定 **Option B**：相位墙**只阻挡"进入"，永不压死玩家**，其他相位的墙在当前相位是**可通行的虚影**。

- **本批 11 张素材全部仍然有效，无需重出。**
- 墙体、虚影、相位切换反馈全部是**程序绘制的矢量**（`docs/ui-ux.md` token 系统），不属于美术素材——所以规则改动不影响本批图片。
- 唯一受影响的是 `docs/ui-ux.md §3.1a wallEcho` 的语义（从"永久障碍"改为"当前相位可通过的虚影"），Agent 5 正在并行修订。
