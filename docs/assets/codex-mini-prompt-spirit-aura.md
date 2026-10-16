# Codex 微型提示词 — 精灵 A 光晕单条重出（1 张 + 1 次派生 · 2026-10-16）

> 背景：修订轮八图验收 **数值 49/50 + 目视 7/8**。唯一美术缺陷：`echo_spirit_a` 的**光晕/边缘辉光被画成暖奶油色（色相≈47°）**，申请单 req-08 要求**淡天空蓝（pale sky-blue）**光晕。身体色、轮廓、取景、B 形态全部达标。
> 本单只修这一条。形状法律不变：B 仍由 A 的同一 alpha 轮廓换色派生。
> 若您选择豁免（waive）本条，此文件作废，无需出图。

---

```
# ROLE
为 H5 解谜游戏《Phase Shift: Echo Grid / 双相棋盘：昼夜回响》重出**一个已有素材的局部配色**——上一版构图与形体已完全达标，只有一条光晕颜色不合格。

# 只改这一件事
形态 A（白昼精灵）的身体保持**暖蜂蜜金不变**；把环绕身体的**光晕/边缘辉光（aura/rim glow）从暖奶油色改为淡天空蓝**（sky blue, 约 #A8D8F0 色系，冷色）。身体与光晕必须**冷暖分离**：身体暖、辉光冷。

# 必须逐像素保持不变的（上一版已验证达标）
- 形体：圆润光灵、单条向左上飘起的柔尾、恰好两点柔光眼、无人形四肢无衣饰
- 轮廓与取景：alpha 轮廓形状不变，包围盒仍占画面宽与高各约 70%（±3%），居中，512×512 原生
- 身体色：暖蜂蜜金（不是接近纯白），核心亮度观感不变
- 边缘干净：真 alpha、四角全透明、无暗边毛刺、扁平柔和插画风、细腻渐变、无粗黑描边

# 中文 Prompt（逐字）
> 一个透明背景的小型发光精灵素材：简单圆润的光灵，一颗柔和发光的光球带一条向左上飘起的轻柔飘尾，极简细节，两点柔和微光眼睛，无人形、无四肢、无衣饰、无复杂脸。形态 A（白昼）：暖象牙金偏蜂蜜色的身体（不得接近纯白），**冷调淡天空蓝（约 #A8D8F0 色系）光晕包裹暖金身体——身体暖、辉光冷，冷暖必须分离**。居中，轮廓包围盒占画面宽与高各约 70%（±3%），边缘干净无暗边毛刺。扁平柔和插画风，细腻渐变，内发光，少量颗粒，无粗黑描边，原生 512×512，4K。

# English Prompt（逐字）
> One small glowing spirit asset on a fully transparent background: a simple round luminous wisp — one softly glowing orb with a single gentle trailing tail curling to the upper-left, minimal detail, two tiny soft glowing eye dots, not humanoid, no limbs, no clothes, no complex face. Form A (Light): warm honey-ivory-gold body (explicitly NOT near-white) wrapped in a **cool pale sky-blue aura (about #A8D8F0 family) — the body stays warm, the glow turns cold, the two temperatures must read as clearly separate**. Centred; silhouette bounding box about 70 % (±3 %) of canvas width and height; crisp clean edge, no dark fringe. Soft flat illustration, gentle gradients, inner glow, subtle grain, no heavy outlines, native 512×512, 4k.

# EXTRA NEGATIVE（逐字）
> warm cream halo, golden aura, yellow glow around body, warm-toned rim light, aura same hue as body, blown-out white body, different silhouette, moved tail, different framing, off-centre, humanoid, limbs, detailed face, text, watermark, opaque background box, dark fringe, upscale artefacts

# 派生形态 B（不重新绘制）
形态 B = 对**新形态 A 的同一 alpha 轮廓**精确换色：靛蓝紫罗兰身体 + 月光蓝光晕（与现行已验收的 B 一致），形状/尺寸/位置逐像素不变。

# 交付
- assets/art/character/echo_spirit_a.png（覆盖）
- assets/art/character/echo_spirit_b.png（覆盖，由新 A 派生）
- 附一行生成方式披露（原生 512、工具）。

# Studio 复检门槛（重出后自动执行，口头达标无效）
1. 现行 R-T04 全部数值门槛不得回退：IoU(A,B)=1.0000（alpha 逐字节全等）、chamfer 0.00、
   bbox 填充 65–80 %、质心差 ≤2 %、A 核心亮度 ∈[0.55,0.70]、A 核心色相 ∈[35,50]、四角 α=0、角暗边 ≤0.05。
2. **新增光晕门**：A 的 rim 带（0 < α < 128）平均色相 ∈ [185°, 225°]（冷蓝），
   且不得落入身体暖色带 [30°, 60°]；身体核心（α≥200）色相保持 [35°, 50°]——冷暖分离由两个带同时成立证明。
```
