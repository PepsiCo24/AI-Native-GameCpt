# First Batch Prompts — ASSET GATE hand-off sheet (A-01 … A-07)

> Owner: **Agent 5 — UI / UX / Art Director**
> Version: V0.1 · Date: 2026-10-14
> Status: **WAITING_FOR_USER_ASSETS**
> Source of truth: the individual `asset-request-0X-*.md` files. The prompts below are **verbatim copies** so this sheet can be used on its own — no other file needs to be open.

---

## How to use this sheet

1. Work top to bottom, or start with the **P0** assets (they unblock the prototype).
2. For each asset: paste the **English prompt** (or the **中文 prompt**) into your image generator, paste the **negative prompt**, set the size / ratio, and request a **transparent background** where the table says `Yes`.
3. Save each file with **exactly** the filename given, in the given folder (create the folders; or deliver everything in one place and tell Agent 5 — renaming and placement will be done at integration).
4. Do **not** upscale by hand beyond the requested size, and do **not** flatten transparency. PNG-24/PNG-32 preferred.
5. When files are ready, reply with the list of delivered filenames. Agent 5 then: inspects → validates style / transparency / resolution → renames → registers in `docs/assets/asset-manifest.md` → integrates.

### Global rules that apply to every asset

- **One shared style:** calm premium casual-puzzle illustration; soft flat vector with gentle gradients; clean geometric shapes; generous negative space; subtle paper/light grain; soft diffused lighting; **no heavy black outlines**; nothing busy behind the play area.
- **No text anywhere** unless the asset is the wordmark (A-02 primary only). No watermark, no signature.
- **Two palettes only:** Phase A / 白昼 = ivory `#F7F1E3`, faint gold `#E9C87A`, sky blue `#A8D8F0`, warm sand, morning haze. Phase B / 夜晚 = deep indigo `#1B1F3B`, violet `#4A3D7A`, moonlight `#C9D6FF`, cool teal accent, dream-like dusk.
- **Legibility beats beauty.** Board-facing assets (A-03, A-06, A-07) must survive being shown at 48 px.

### Priority

| Priority | Assets | Why |
|---|---|---|
| **P0 — blocks Stage 2 prototype** | A-03 (Echo Spirit), A-04 (Phase A bg), A-05 (Phase B bg), A-06 `goal.png` only | The readability test cannot run without these. Everything else can wait. |
| **P1 — needed before UI polish (Stage 4+)** | A-07 (UI kit) | Prototype runs on CSS DEV PLACEHOLDERs until then. |
| **P2 — marketing / late mechanics** | A-01 (cover), A-02 (logo), A-06 `portal_a/b.png` | Cover/logo block no gameplay; portals are first used at **L11** (ADR-0009 D3; pre-D3 sheet said L36) — and are optional Stage-5 polish only (manifest V0.5.2). |

### Delivery checklist (11 files minimum)

```
[ ] A-01  assets/art/cover/cover_hero_1920x1080.png
[ ] A-02  assets/art/logo/logo_primary.png
[ ] A-02  assets/art/logo/logo_mark.png
[ ] A-03  assets/art/character/echo_spirit_a.png
[ ] A-03  assets/art/character/echo_spirit_b.png
[ ] A-04  assets/art/background/bg_phase_a_1920x1080.png
[ ] A-05  assets/art/background/bg_phase_b_1920x1080.png
[ ] A-06  assets/art/props/goal.png
[ ] A-06  assets/art/props/portal_a.png
[ ] A-06  assets/art/props/portal_b.png
[ ] A-07  assets/art/ui/ui_kit.png   (or the 12 exports listed in the A-07 section)
```

---

## A-01 · Cover / Hero Image — `cover_hero`

| Size | Ratio | Transparent | Quantity | Filename | Destination |
|---|---|---|---|---|---|
| 1920 × 1080 px (a 1080 × 1080 safe-crop is a bonus) | 16:9 | **No** (full painted background) | 1 | `cover_hero_1920x1080.png` | `assets/art/cover/` |

**English prompt (FINAL)**

```
Key art for a calm premium puzzle game. Flat top-down view of a clean 5×5 grid board centered in frame, split softly down the middle: left half is a Light World of ivory white, faint gold and sky-blue morning haze; right half is a Shadow World of deep indigo, violet and moonlight. A small glowing wisp spirit (Echo Spirit) stands at the center on the boundary, facing the Shadow side. Faint translucent phase walls hinted on both halves (light blocks on the left, dark blocks on the right). Soft flat-vector illustration with gentle gradients, subtle grain, no heavy black outlines, soft diffused lighting, generous negative space, clean upper third reserved for a logo. No text. Calm, premium, highly readable casual puzzle cover art, 4k.
```

**中文 Prompt（FINAL）**

```
休闲益智游戏封面主视觉，俯视平面棋盘构图，画面正中是一个简洁的 5×5 网格棋盘，被一条柔和的中线分成左右两半：左半是白昼光之世界（象牙白、淡金、天空蓝、清晨雾光），右半是夜晚影之世界（深靛蓝、紫罗兰、月光、梦境感）。棋盘中央站着一个小巧发光的光灵（Echo Spirit），面向夜晚那一侧。两侧各自隐约浮现半透明的相位墙体（左侧浅色、右侧深色）。整体柔和扁平插画风，细腻渐变，少量纸感颗粒，无粗黑描边，柔和漫射光，干净留白，上方三分之一留出放置 Logo 的空间，画面不出现任何文字。安静、高级、可读性极强的休闲解谜游戏封面，4K。
```

**Negative prompt**

```
text, letters, logo, watermark, signature, UI buttons, cluttered background, too many details, photorealism, 3D render, harsh black outlines, neon oversaturation, lens flare, horror, gore, scary, crowded composition, busy pattern, low contrast, blurry, distorted perspective, characters with complex faces, weapons, anime fanart
```

**Accept on delivery if:** ≥ 1920×1080 exact 16:9 · zero text/logo/watermark · flat top-down board (no isometric) · left-Light / right-Shadow split still obvious at 480 px wide · upper third clean for the logo · no heavy outlines, no 3D/photorealism.

---

## A-02 · Logo (wordmark + mark) — `logo_primary`, `logo_mark`

| Size | Ratio | Transparent | Quantity | Filenames | Destination |
|---|---|---|---|---|---|
| primary 2048 × 2048 px canvas; mark 1024 × 1024 px | 1:1 canvas for both | **Yes** (transparent PNG) | 2 | `logo_primary.png`, `logo_mark.png` | `assets/art/logo/` |

**English prompt (FINAL)**

```
Two separate game logo assets on transparent background: 1) Primary wordmark — clean rounded geometric sans-serif, first line "PHASE SHIFT", smaller second line "ECHO GRID", with a tiny Echo Spirit spark motif; "PHASE" in warm gold, "SHIFT" in moonlight blue to echo the two phases; no heavy outlines; centered with generous margin. 2) Compact mark — a rounded square grid cut by a soft S-shaped boundary, one half ivory-gold, the other indigo-moonlight, with a faint glowing spark at the center; no text; still readable at 32×32. Soft flat vector, gentle gradients, clean premium look, transparent background, 4k.
```

**中文 Prompt（FINAL）**

```
两个独立的游戏 Logo 素材（透明背景）：1) 主字标：圆润几何无衬线字体，第一行 "PHASE SHIFT"，第二行较小 "ECHO GRID"，圆润干净，上方或字间有一个小小的光灵火花点缀；"PHASE" 用暖金色，"SHIFT" 用月光蓝，呼应昼夜双相；无粗描边；居中、留足边距。2) 图标标记：一个圆角方形网格被柔和的 S 形分界切开，一半象牙金、一半靛蓝月光，中心有一个微弱发光的小火花；不含文字；32×32 仍清晰可读。扁平柔和插画风，细腻渐变，干净高级，透明背景。
```

**Negative prompt**

```
drop shadow glow heavy, bevel, emboss, chrome, metallic, 3D extrusion, grunge texture, serif clutter, misspelled with extra letters, more than two text lines, busy ornament, dark background, low resolution, jagged edges, watermark
```

**Accept on delivery if:** two separate files with real alpha (checkerboard test, no white box) · primary has exactly two text lines spelled `PHASE SHIFT` / `ECHO GRID` (no misspelling, no third line, no CJK) · mark has **no** text and is still readable at 32 × 32 · `PHASE` warm gold, `SHIFT` moonlight blue · margins ≥ 8 % · no bevel/chrome/3D.
> Generate the two pieces **separately** if your tool struggles with "two assets in one image" — one run for the wordmark, one for the mark. Both are listed above.

---

## A-03 · Echo Spirit (protagonist) — `echo_spirit_a`, `echo_spirit_b`  · **P0**

| Size | Ratio | Transparent | Quantity | Filenames | Destination |
|---|---|---|---|---|---|
| 512 × 512 px each (scaled down to ~one grid cell in game) | 1:1 | **Yes** (transparent PNG) | 2 (optional 3rd "hop/move" pose) | `echo_spirit_a.png`, `echo_spirit_b.png` | `assets/art/character/` |

**English prompt (FINAL)**

```
Two small glowing spirit character assets on transparent background: a simple round luminous wisp, like a soft glowing orb with a gentle trailing tail, minimal detail, optionally two tiny soft glowing eyes, no complex face, not humanoid, not anime. Form A (Light): warm ivory-gold glow with a pale sky-blue aura, serene and calm. Form B (Shadow): indigo-violet glow with a moonlight-blue core, dreamy yet gentle, never scary. Centered, filling about 70% of the frame, crisp silhouette, soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy black outlines, 4k.
```

**中文 Prompt（FINAL）**

```
两个小巧的发光精灵角色素材（透明背景）：一只简单圆润的"光灵"，像一颗柔和的发光光球，带一点轻柔的飘尾，极简细节，可以有两点柔和的微光眼睛，不要复杂人脸，不是人形角色，不是动漫人物。形态 A（白昼/光）：暖象牙金光辉，淡天空蓝光晕，宁静柔和。形态 B（夜晚/影）：靛蓝紫罗兰光辉，月光蓝核心，梦幻但温柔，绝不恐怖。角色居中，约占画面 70%，轮廓清晰，扁平柔和插画风，细腻渐变，内发光，少量颗粒，无粗黑描边，4K。
```

**Negative prompt**

```
humanoid body, arms, legs, detailed face, anime, cartoon mascot with clothes, wings, horns, scary ghost, skull, horror, gore, weapon, dark muddy glow, harsh outline, 3D render, photorealistic, busy detail, text, watermark, small unreadable silhouette
```

**Accept on delivery if:** ≥ 512×512, real alpha, no white box and **no dark fringe on the glow edge** · centred, filling 65–80 % · **identical silhouette and apparent size in both files** (overlay test) · no limbs/clothing/complex face · readable at 48 × 48 and 32 × 32 · form B never scary.

> **⚠ Art-director note (does not change the prompt):** form A is specced as an *ivory-gold glow*, and the Phase A board cell is near-white (`#FFFDF7`). A near-white sprite on that cell measures only **1.30:1** contrast — below the 3:1 readability floor. If your generator produces a **slightly deeper gold body** for form A, prefer that take. Otherwise deliver it anyway: the renderer adds an automatic dark contrast ring in Phase A (`docs/ui-ux.md` R-C9), measured at 11.74:1. A pure-white, blown-out sprite is the only variant that would be rejected.

---

## A-04 · Phase A Background (Light / 白昼) — `bg_phase_a`  · **P0**

| Size | Ratio | Transparent | Quantity | Filename | Destination |
|---|---|---|---|---|---|
| 1920 × 1080 px | 16:9 (must also survive a 9:16 mobile crop — keep content near centre) | **No** | 1 | `bg_phase_a_1920x1080.png` | `assets/art/background/` |

**English prompt (FINAL)**

```
Full-screen "Light World / daytime" background for a calm puzzle game: soft ivory gradient sky, faint golden morning haze, delicate floating dust motes, very subtle distant geometric cloud or hill shapes. Extremely minimal, low-contrast, low-detail; keep the central 60% especially quiet and even because the game board overlays the center. Avoid strong shapes or high-contrast edges that could be mistaken for walls or paths. Soft flat illustration, gentle gradients, subtle paper grain, soft diffused morning light, no heavy outlines, spacious, serene, premium, 4k.
```

**中文 Prompt（FINAL）**

```
休闲解谜游戏的"白昼/光之世界"全屏背景：柔和的象牙白渐变天空，淡淡的金色晨雾，空气中漂浮着轻柔的微尘光点，远处有非常隐约的几何云形或山形。整体极简、低对比、低细节，画面中心约 60% 区域尤其安静平缓，避免出现强烈图案或高对比边缘（因为棋盘会叠在中央）。扁平柔和插画风，细腻渐变，少量纸感颗粒，柔和漫射晨光，无粗黑描边，宽敞、宁静、高级，4K。
```

**Negative prompt**

```
busy pattern, high contrast, strong outlines, text, characters, board, grid, tiles, walls, objects, clutter, dark, night, neon, photorealistic landscape, detailed foliage, harsh shadows, watermark, vignette too strong
```

**Accept on delivery if:** ≥ 1920×1080 exact 16:9 · central 60 % quiet and even (no distinct object, no hard edge, local contrast ≤ ~1.6:1) · survives a 9:16 centre crop · reads as the **bright** member of the day/night pair even in greyscale · no text/characters/board/grid/tiles/walls/props · no strong vignette or lens flare.

---

## A-05 · Phase B Background (Shadow / 夜晚) — `bg_phase_b`  · **P0**

| Size | Ratio | Transparent | Quantity | Filename | Destination |
|---|---|---|---|---|---|
| 1920 × 1080 px | 16:9 (must also survive a 9:16 mobile crop — keep content near centre) | **No** | 1 | `bg_phase_b_1920x1080.png` | `assets/art/background/` |

**English prompt (FINAL)**

```
Full-screen "Shadow World / night" background for a calm puzzle game: deep indigo gradient night sky, faint violet dusk haze, soft moonlight glow, a few distant tiny stars, delicate floating light motes. Extremely minimal, low-contrast, low-detail; the game board overlays the center so keep the middle especially quiet and even; avoid strong shapes or high-contrast edges. Same composition language as the daytime background, like one world at another time of day. Soft flat illustration, gentle gradients, subtle grain, soft moonlight, no heavy outlines, dreamy and gentle, never scary, 4k.
```

**中文 Prompt（FINAL）**

```
休闲解谜游戏的"夜晚/影之世界"全屏背景：深靛蓝渐变夜空，淡淡的紫罗兰暮色薄雾，柔和的月光晕散，几颗遥远的微小星星，空中漂浮着轻柔的微光粒子。整体极简、低对比、低细节，棋盘会叠在画面中央，所以中心区域尤其安静平缓，避免强烈图案或高对比边缘。构图语言与白昼背景一致，像是同一个世界在一天中的另一个时刻。扁平柔和插画风，细腻渐变，少量颗粒，柔和月光，无粗黑描边，梦幻温柔，绝不恐怖，4K。
```

**Negative prompt**

```
horror, scary, monsters, dark oppressive mood, blood, gore, harsh contrast, busy pattern, strong outlines, text, characters, board, grid, tiles, objects, photorealistic starfield, nebula overload, neon oversaturation, watermark
```

**Accept on delivery if:** ≥ 1920×1080 exact 16:9 · centre quiet and even · survives a 9:16 centre crop · reads as the **dark** member of the pair in greyscale · dreamy, never horror · same composition language / camera as A-04 (the two should align when cross-dissolved) · no text/characters/board/grid/objects.

---

## A-06 · Goal + Phase Portal — `goal`, `portal_a`, `portal_b`  · goal = **P0**, portals = P2

| Size | Ratio | Transparent | Quantity | Filenames | Destination |
|---|---|---|---|---|---|
| 512 × 512 px each | 1:1 | **Yes** (transparent PNG) | 3 | `goal.png`, `portal_a.png`, `portal_b.png` | `assets/art/props/` |

**English prompt (FINAL)**

```
Three small game prop assets on transparent background (512×512 each): 1) Goal — a warm welcoming glowing ring or rune with soft inner light, instantly readable as "the place to reach" in both phases, must not look like a wall or a door. 2) Phase Portal A (Light) — ivory-gold ring with a hint of sky blue and a soft inner swirl. 3) Phase Portal B (Shadow) — the identical shape and size, in indigo-violet with a moonlight-blue swirl. The two portals must clearly read as the same object in different phases, only recolored, so the pairing is obvious. Centered, filling about 70–75% of the frame, crisp silhouette, soft flat illustration, gentle gradients, soft glow, no heavy black outlines, 4k.
```

**中文 Prompt（FINAL）**

```
三个小型游戏道具素材（透明背景，各 512×512）：1) 目标点 Goal：温暖的发光圆环/符文，内部柔和发光，在两个相位中都能被一眼识别为"要去的地方"，不要看起来像墙或门。2) 相位传送门 A（白昼）：象牙金圆环，带一点天空蓝，内部有柔和漩涡。3) 相位传送门 B（夜晚）：同形状同尺寸，靛蓝紫罗兰圆环，月光蓝漩涡。两个传送门必须明显是"同一个物体在不同相位"，只换配色，便于玩家理解配对关系。角色居中约占 70–75%，轮廓清晰。扁平柔和插画风，细腻渐变，柔和发光，无粗黑描边，4K。
```

**Negative prompt**

```
text, arrows, letters, numbers, wall look, door look, brick, stone texture, harsh outline, 3D render, photorealism, cluttered detail, mismatched portal shapes, scary portal, fire, lava, watermark, low resolution
```

**Accept on delivery if:** three files ≥ 512×512 with real alpha, no fringe · centred, filling 65–80 %, identical framing in all three · **`portal_a` and `portal_b` silhouettes match 100 %** (recoloured only — mismatched shapes = rejected) · goal reads as a **hollow ring**, not a wall or door · all three unambiguous at 48 × 48 · no text/arrows/brick/stone/fire/lava.
> **⚠ Art-director note (does not change the prompt):** in game, the goal keeps a **gold/amber** hue in both phases and portals keep a **teal/blue** hue in both phases — only value and temperature flip with the phase (`docs/ui-ux.md` R-C10). If a take gives you a gold portal and a blue goal, prefer the take that matches this hue assignment; the tint can also be adjusted at integration.
> Generate the three props **separately** if the tool merges them into one image.

---

## A-07 · Basic UI Kit — `ui_kit`  · P1

| Size | Ratio | Transparent | Quantity | Filename | Destination |
|---|---|---|---|---|---|
| source sheet 2048 × 2048 px; icons exported at 128 × 128 px; buttons up to 1024 × 320 px | mixed (icons 1:1, buttons ~3:1, frame 9-slice) | **Yes** (transparent PNG) | 1 sheet (or the 12 exports below) | `ui_kit.png` → exports: `btn_primary.png`, `btn_ghost.png`, `icon_undo.png`, `icon_restart.png`, `icon_back.png`, `icon_sound_on.png`, `icon_sound_off.png`, `icon_next.png`, `panel_frame_a.png`, `panel_frame_b.png`, `phase_chip_a.png`, `phase_chip_b.png` | `assets/art/ui/` |

**English prompt (FINAL)**

```
A minimal game UI asset set on transparent background (one 2048×2048 source sheet; export icons at 128×128): 1) Buttons — a rounded pill primary button (warm gold to soft amber gradient with a subtle inner glow) and a ghost button (thin soft outline, near-transparent fill); no text. 2) Icons — undo (soft curved arrow), restart (circular arrow), back (chevron), sound on/off, next (chevron-right); line plus soft fill. 3) Panel — a soft rounded 9-slice panel in an ivory Light version and an indigo Shadow version, low contrast. 4) Phase indicator chips — a Light pill (ivory-gold with a small sun glyph) and a Shadow pill (indigo-violet with a crescent glyph); icon only, no text. Everything calm, rounded, low-contrast, never competing with the board; icons still legible at ~48px on mobile. Soft flat illustration, gentle gradients, no heavy black outlines, clean premium, 4k.
```

**中文 Prompt（FINAL）**

```
一套极简游戏 UI 素材（透明背景，源文件一张 2048×2048 画板，图标各 128×128）：1) 按钮：圆角胶囊主按钮（暖金到柔琥珀渐变，内发光）与幽灵按钮（细柔描边、近乎透明填充），不含文字。2) 图标：撤销（柔和弧形箭头）、重开（环形箭头）、返回（箭头）、声音开/关、下一步（右箭头），线性加柔和填充。3) 面板：圆角九宫格面板，白昼象牙色与夜晚靛蓝色两个版本，低对比。4) 相位指示胶囊：白昼款（象牙金底，小日光符号）与夜晚款（靛蓝紫底，小月牙符号），仅图标不含文字。整体柔和、圆润、低对比，绝不与棋盘争夺注意力；图标在移动端约 48px 仍需清晰。扁平柔和插画风，细腻渐变，无粗黑描边，干净高级，4K。
```

**Negative prompt**

```
baked-in text, labels, numbers, glossy 3D buttons, drop shadows heavy, bevel, skeuomorphism, harsh outlines, neon, clutter, dark muddy colors, inconsistent icon style, photorealistic, watermark
```

**Accept on delivery if:** sheet ≥ 2048×2048 or the 12 exports delivered directly · real alpha on every element · **zero baked text/numbers/labels** · icons legible at 48 px and recognisable at 24 px with a consistent stroke weight and corner radius · icon meanings readable without colour · panels are **9-slice safe** (flat border region, corners ≤ 24 % of panel width, clean stretchable centre) · phase chips are icon-only (sun / crescent) and still distinguishable in greyscale · calm, rounded, low-contrast.
> If the generator returns a single cluttered sheet, accept it as the **source** and export the 12 elements yourself — Agent 5 will slice and rename at integration.

---

## After delivery

Reply with the delivered filenames. Agent 5 runs the intake procedure: **inspect → validate style / transparency / resolution → rename → register in `docs/assets/asset-manifest.md` (status `DELIVERED`) → swap the DEV PLACEHOLDER via `PLACEHOLDER_TO_ASSET` → re-run the readability QA gate (`docs/ui-ux.md` §3.3) → record in `docs/iteration-log.md`.**

No asset is considered shipped until it has a manifest row with status `DELIVERED`, the delivered filename and the date.
