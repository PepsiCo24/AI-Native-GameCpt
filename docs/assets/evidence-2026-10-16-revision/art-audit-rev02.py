"""Read-only ART-INTAKE-REVISION-02 audit (2026-10-16).

Same measuring stick as batch 1: every geometry/colour primitive is IMPORTED
from docs/assets/evidence-2026-10-15/art-audit.py, never re-implemented.
Gates implement the re-acceptance numbers of asset-request-08..12 verbatim.
"""
from __future__ import annotations

import colorsys
import importlib.util
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

BATCH1 = Path("/Users/Admin/VibeCoding/GameCpt/docs/assets/evidence-2026-10-15/art-audit.py")
spec = importlib.util.spec_from_file_location("batch1_audit", BATCH1)
A1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(A1)

ROOT = Path("/Users/Admin/VibeCoding/GameCpt")
ART = ROOT / "assets" / "art"
EVID = Path(__file__).resolve().parent

load_rgba = A1.load_rgba
iou = A1.iou
iou_resized = A1.iou_resized
chamfer = A1.chamfer
bbox_crop = A1.bbox_crop
silhouette_stats = A1.silhouette_stats
corner_check = A1.corner_check
fringe_check = A1.fringe_check
block_contrast = A1.block_contrast
connected_components = A1.connected_components
overlay_silhouettes = A1.overlay_silhouettes
thumbnail_grid = A1.thumbnail_grid
crossfade_delta = A1.crossfade_delta
crop_safety = A1.crop_safety
rel_lum = A1.rel_lum
contrast_ratio = A1.contrast_ratio

report: dict = {"files": {}, "spirit_pair": {}, "portal_pair": {}, "backgrounds": {},
                "logo_primary": {}, "ui_kit": {}}
verdicts: list[tuple[str, bool, str]] = []


def gate(name: str, ok: bool, detail: str) -> None:
    verdicts.append((name, ok, detail))


def chamfer_correct(a: np.ndarray, b: np.ndarray) -> float:
    """TRUE symmetric boundary-to-boundary mean distance.

    ERRATUM (2026-10-16): batch-1 A1.chamfer never used its boundary()/edt()
    helpers and measured each shape's self-depth instead (identical masks score
    ~50 px, not 0). Batch-1's chamfer numbers were this broken quantity; those
    rejections stood on IoU + framing, unaffected. This is the fixed yardstick.
    """
    def boundary(mask: np.ndarray) -> np.ndarray:
        p = np.pad(mask, 1, constant_values=False)
        inner = p[1:-1, 1:-1] & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
        return mask & ~inner

    def dist_to(src: np.ndarray) -> np.ndarray:
        h, w = src.shape
        out = np.where(src, 0.0, 1e9)
        for y in range(h):
            if y > 0:
                np.minimum(out[y], out[y - 1] + 1, out=out[y])
            row = out[y]
            for x in range(1, w):
                if row[x] > row[x - 1] + 1:
                    row[x] = row[x - 1] + 1
            for x in range(w - 2, -1, -1):
                if row[x] > row[x + 1] + 1:
                    row[x] = row[x + 1] + 1
        for y in range(h - 1, -1, -1):
            if y + 1 < h:
                np.minimum(out[y], out[y + 1] + 1, out=out[y])
            row = out[y]
            for x in range(1, w):
                if row[x] > row[x - 1] + 1:
                    row[x] = row[x - 1] + 1
            for x in range(w - 2, -1, -1):
                if row[x] > row[x + 1] + 1:
                    row[x] = row[x + 1] + 1
        return out

    bda, bdb = boundary(a), boundary(b)
    if not bda.any() or not bdb.any():
        return -1.0
    da = float(dist_to(bda)[bdb].mean())
    db = float(dist_to(bdb)[bda].mean())
    return (da + db) / 2.0


def core_stats(arr: np.ndarray, alpha_thresh: int = 200) -> dict:
    """luminance-of-mean-RGB + hue of core (alpha>=thresh) pixels.
    SCALE: arrays are uint8 0-255; rel_lum takes 0-255 (divides itself)."""
    m = arr[..., 3] >= alpha_thresh
    if not m.any():
        return {"present": False}
    mean_rgb = arr[..., :3][m].reshape(-1, 3).mean(axis=0)  # 0..255
    lum = float(A1.rel_lum(mean_rgb.reshape(1, 1, 3))[0, 0])
    r, g, b = (float(x) / 255.0 for x in mean_rgb)
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return {
        "present": True,
        "pixels": int(m.sum()),
        "mean_rgb_srgb": [round(x * 255, 1) for x in (r, g, b)],
        "luminance_of_mean": round(lum, 4),
        "hue_deg": round(h * 360.0, 1),
        "saturation": round(s, 3),
        "value": round(v, 3),
    }


def nativeness(rel: str, name: str, expect: tuple[int, int], alpha: bool) -> np.ndarray:
    p = ROOT / rel
    im = Image.open(p)
    ok_size = im.size == expect
    gate(f"{name}·native-size", ok_size, f"{im.size} expected {expect}")
    ok_alpha = (im.mode == "RGBA") if alpha else (im.mode in ("RGB", "RGBA"))
    gate(f"{name}·alpha-mode", ok_alpha, f"mode={im.mode}")
    report["files"][name] = {"path": rel, "size": list(im.size), "mode": im.mode,
                             "bytes": p.stat().st_size,
                             "mtime": p.stat().st_mtime}
    return load_rgba(p)


# ---------- R-T04 spirit pair (asset-request-08) ----------
sa = nativeness("assets/art/character/echo_spirit_a.png", "echo_spirit_a", (512, 512), True)
sb = nativeness("assets/art/character/echo_spirit_b.png", "echo_spirit_b", (512, 512), True)
ma, mb = sa[..., 3] >= 128, sb[..., 3] >= 128
st_a, st_b = silhouette_stats(ma), silhouette_stats(mb)
raw = iou(ma, mb)
ch = chamfer_correct(ma, mb)
ch_legacy = chamfer(ma, mb)  # batch-1 broken self-depth quantity, recorded for continuity only
gate("R-T04·silhouette-IoU≥0.99", raw >= 0.99, f"raw_iou={raw:.4f} chamfer={ch:.2f}px (legacy-depth {ch_legacy:.1f})")
gate("R-T04·chamfer≤8px", ch <= 8.0, f"chamfer={ch:.4f}")
equal_alpha = bool(np.array_equal(sa[..., 3], sb[..., 3]))
gate("R-T04·alpha-mask-identity", equal_alpha, f"alpha_equal_exact={equal_alpha}")
fw_a, fh_a = 100 * st_a["bbox_size"][0] / 512, 100 * st_a["bbox_size"][1] / 512
fw_b, fh_b = 100 * st_b["bbox_size"][0] / 512, 100 * st_b["bbox_size"][1] / 512
for label, w_, h_ in (("A", fw_a, fh_a), ("B", fw_b, fh_b)):
    gate(f"R-T04·bbox-fill-{label}∈[65,80]", 65.0 <= w_ <= 80.0 and 65.0 <= h_ <= 80.0,
         f"w={w_:.1f}% h={h_:.1f}%")
size_delta = max(abs(st_a["bbox_size"][i] - st_b["bbox_size"][i]) / st_a["bbox_size"][i] for i in (0, 1))
gate("R-T04·A/B-size-diff≤2%", size_delta <= 0.02, f"diff={100 * size_delta:.2f}%")
cent = math.dist(st_a["centroid"], st_b["centroid"]) / 512
gate("R-T04·centroid-shift≤2%", cent <= 0.02, f"shift={100 * cent:.2f}%")
ca_ = core_stats(sa)
cb_ = core_stats(sb)
gate("R-T04·A-core-lum∈[0.55,0.70]", 0.55 <= ca_["luminance_of_mean"] <= 0.70,
     f"lum={ca_['luminance_of_mean']}")
gate("R-T04·A-core-hue∈[35,50]", 35.0 <= ca_["hue_deg"] <= 50.0, f"hue={ca_['hue_deg']}°")
for label, arr in (("A", sa), ("B", sb)):
    cc = corner_check(arr)
    gate(f"R-T04·corner-alpha-{label}=0", all(v["mean_alpha"] == 0.0 for v in cc.values()),
         {k: v["mean_alpha"] for k, v in cc.items()} if isinstance(cc, dict) else "?")
    fr = fringe_check(arr)
    gate(f"R-T04·fringe-dark≤0.05-{label}", fr.get("dark_fraction", 0.0) <= 0.05,
         f"dark_fraction={fr.get('dark_fraction')}")
Image.fromarray(overlay_silhouettes(sa, sb)).save(EVID / "overlay_spirit_pair.png")
# small-size readability sheets (visual pass)
for size, back, tag in [(48, (247, 241, 227), "light"), (32, (27, 31, 59), "dark")]:
    Image.fromarray(thumbnail_grid(
        [(ART / "character/echo_spirit_a.png", size), (ART / "character/echo_spirit_b.png", size)],
        back)).save(EVID / f"spirits_{size}_{tag}.png")
report["spirit_pair"] = {
    "raw_iou": raw, "alpha_equal_exact": equal_alpha, "bbox_aligned_iou": iou_resized(bbox_crop(ma), bbox_crop(mb)),
    "chamfer_px": ch, "chamfer_px_legacy_batch1_yardstick": ch_legacy,
    "fill_pct": {"a": [round(fw_a, 1), round(fh_a, 1)], "b": [round(fw_b, 1), round(fh_b, 1)]},
    "a_bbox": st_a["bbox"], "b_bbox": st_b["bbox"],
    "core_a": ca_, "core_b": cb_,
}

# ---------- R-T06 portal pair + goal triad (asset-request-09) ----------
pa = nativeness("assets/art/props/portal_a.png", "portal_a", (512, 512), True)
pb = nativeness("assets/art/props/portal_b.png", "portal_b", (512, 512), True)
goal = nativeness("assets/art/props/goal.png", "goal(untouched)", (512, 512), True)
mpa, mpb, mpg = pa[..., 3] >= 128, pb[..., 3] >= 128, goal[..., 3] >= 128
p_raw = iou(mpa, mpb)
p_ch = chamfer_correct(mpa, mpb)
p_legacy = chamfer(mpa, mpb)
gate("R-T06·silhouette-IoU≥0.99", p_raw >= 0.99, f"raw_iou={p_raw:.4f} chamfer={p_ch:.2f}px (legacy-depth {p_legacy:.1f})")
gate("R-T06·chamfer≤8px", p_ch <= 8.0, f"chamfer={p_ch:.4f}")
gate("R-T06·alpha-mask-identity", bool(np.array_equal(pa[..., 3], pb[..., 3])),
     f"alpha_equal_exact={bool(np.array_equal(pa[..., 3], pb[..., 3]))}")
sp, gb = silhouette_stats(mpa), silhouette_stats(mpb)
g_st = silhouette_stats(mpg)
fills = {}
for label, st in (("a", sp), ("b", gb), ("goal", g_st)):
    fills[label] = [100 * st["bbox_size"][0] / 512, 100 * st["bbox_size"][1] / 512]
gate("R-T06·portal-fill-w∈[76.9,80.0]",
     all(76.9 <= fills[k][0] <= 80.0 for k in ("a", "b")),
     {k: [round(x, 1) for x in v] for k, v in fills.items()})
gate("R-T06·portal-fill-h∈[77.1,80.0]",
     all(77.1 <= fills[k][1] <= 80.0 for k in ("a", "b")),
     {k: [round(x, 1) for x in v] for k, v in fills.items()})
spread_w = max(fills[k][0] for k in fills) - min(fills[k][0] for k in fills)
spread_h = max(fills[k][1] for k in fills) - min(fills[k][1] for k in fills)
gate("R-T06·triad-framing-spread≤2%", spread_w <= 2.0 and spread_h <= 2.0,
     f"w_spread={spread_w:.2f}% h_spread={spread_h:.2f}%")
pc_a, pc_b, gc = core_stats(pa), core_stats(pb), core_stats(goal)
gate("R-T06·portal-core-hue∈[170,230]",
     all(170.0 <= c["hue_deg"] <= 230.0 for c in (pc_a, pc_b)),
     f"a={pc_a['hue_deg']}° b={pc_b['hue_deg']}°")
dh = abs(pc_a["hue_deg"] - gc["hue_deg"])
dh = min(dh, 360 - dh)
gate("R-T06·portal-goal-hue-distance≥100", dh >= 100.0, f"Δhue={dh:.1f}° goal_hue={gc['hue_deg']}°")
gate("R-T06·goal-core-hue∈[30,55] (regression)", 30.0 <= gc["hue_deg"] <= 55.0, f"hue={gc['hue_deg']}°")
for label, arr in (("a", pa), ("b", pb)):
    lum_core = rel_lum(arr[..., :3]) * (arr[..., 3] >= 200)
    hi = int(((arr[..., 3] >= 200) & (rel_lum(arr[..., :3]) >= 0.95)).sum())
    tot = int((arr[..., 3] >= 200).sum())
    report["portal_pair"][f"near_white_core_pixels_{label}"] = [hi, tot]
Image.fromarray(overlay_silhouettes(pa, pb)).save(EVID / "overlay_portal_pair.png")
for size, back, tag in [(48, (247, 241, 227), "light"), (48, (27, 31, 59), "dark")]:
    Image.fromarray(thumbnail_grid(
        [(ART / "props/portal_a.png", size), (ART / "props/portal_b.png", size), (ART / "props/goal.png", size)],
        back)).save(EVID / f"portal_trio_{size}_{tag}.png")
report["portal_pair"].update({
    "raw_iou": p_raw, "alpha_equal_exact": bool(np.array_equal(pa[..., 3], pb[..., 3])),
    "chamfer_px": p_ch, "chamfer_px_legacy_batch1_yardstick": p_legacy,
    "fill_pct": {k: [round(x, 1) for x in v] for k, v in fills.items()},
    "core_a": pc_a, "core_b": pc_b, "core_goal": gc,
})

# ---------- R-T11 background pair (asset-request-11) ----------
ba = nativeness("assets/art/background/bg_phase_a_1920x1080.png", "bg_phase_a", (1920, 1080), False)
bb = nativeness("assets/art/background/bg_phase_b_1920x1080.png", "bg_phase_b", (1920, 1080), False)
la, lb = rel_lum(ba[..., :3]), rel_lum(bb[..., :3])
sa_blur = rel_lum(np.asarray(Image.fromarray(ba[..., :3]).filter(ImageFilter.GaussianBlur(18))))
sb_blur = rel_lum(np.asarray(Image.fromarray(bb[..., :3]).filter(ImageFilter.GaussianBlur(18))))
na = (sa_blur - sa_blur.min()) / (sa_blur.max() - sa_blur.min())
nb = (sb_blur - sb_blur.min()) / (sb_blur.max() - sb_blur.min())
corr = float(np.corrcoef(na.ravel(), nb.ravel())[0, 1])
gate("R-T11·blurred-structural-corr≥0.9", corr >= 0.9, f"corr={corr:.4f} (batch1 rejected value −0.0712)")
bc_a, bc_b = block_contrast(ba, 0.6, 20), block_contrast(bb, 0.6, 20)
gate("R-T11·center60-quiet-minmax≤1.6-A", bc_a["contrast_minmax"] <= 1.6,
     f"minmax={bc_a['contrast_minmax']:.3f} p2/p98={bc_a['contrast_2_98']:.3f}")
gate("R-T11·center60-quiet-minmax≤1.6-B", bc_b["contrast_minmax"] <= 1.6,
     f"minmax={bc_b['contrast_minmax']:.3f} p2/p98={bc_b['contrast_2_98']:.3f}")
cr_a, cr_b = crop_safety(ba[..., :3]), crop_safety(bb[..., :3])
gate("R-T11·916crop-contrast≤1.2",
     all(v["center_contrast"] <= 1.2 for v in (cr_a, cr_b)),
     f"a={cr_a['center_contrast']:.3f} b={cr_b['center_contrast']:.3f}")
ratio = contrast_ratio(float(la.mean()), float(lb.mean()))
gate("R-T11·lum-separation≥10:1 (A bright)", ratio >= 10.0 and la.mean() > lb.mean(),
     f"contrast={ratio:.2f}:1 meanA={la.mean():.4f} meanB={lb.mean():.4f}")
xf = crossfade_delta(ba, bb, 9)
Image.fromarray(  # 50/50 mid frame for the "nothing moves" visual check
    np.asarray(Image.blend(Image.fromarray(ba[..., :3]), Image.fromarray(bb[..., :3]), 0.5))
).save(EVID / "bg_crossfade_mid.png")
for n, cr in (("a", cr_a), ("b", cr_b)):
    crop = cr["crop"]
    src = ba if n == "a" else bb
    Image.fromarray(src[crop[1]:crop[1] + crop[3], crop[0]:crop[0] + crop[2], :3]).save(
        EVID / f"bg_{n}_portrait916.png")
report["backgrounds"] = {
    "blurred_structural_correlation": corr,
    "center_a": bc_a, "center_b": bc_b,
    "portrait": {"a": {k: v for k, v in cr_a.items() if k != "crop"},
                 "b": {k: v for k, v in cr_b.items() if k != "crop"}},
    "phase_contrast": ratio, "mean_lum": {"a": float(la.mean()), "b": float(lb.mean())},
    "crossfade": xf,
}

# ---------- R-T10 logo primary (asset-request-10) ----------
lg = nativeness("assets/art/logo/logo_primary.png", "logo_primary", (2048, 2048), True)
ls = silhouette_stats(lg[..., 3] >= 128)
x0, y0, x1, y1 = ls["bbox"]
mL, mT = x0 / 2048, y0 / 2048
mR, mB = (2048 - 1 - x1) / 2048, (2048 - 1 - y1) / 2048
gate("R-T10·margins≥8% all sides", min(mL, mR, mT, mB) >= 0.08,
     f"L={100*mL:.2f}% R={100*mR:.2f}% T={100*mT:.2f}% B={100*mB:.2f}% (rejected take: 6.15/5.86)")
cc = corner_check(lg)
gate("R-T10·corner-alpha=0", all(v["mean_alpha"] == 0.0 for v in cc.values()),
     str({k: v["mean_alpha"] for k, v in cc.items()}))
fr = fringe_check(lg)
# yardstick reference: the PASSED batch-1 logo_mark on the same fringe measure
mark = load_rgba(ART / "logo/logo_mark.png")
fr_mark = fringe_check(mark)
gate("R-T10·fringe-dark≤0.05", fr.get("dark_fraction", 0.0) <= 0.05,
     f"dark_fraction={fr.get('dark_fraction')} (reference logo_mark, batch-1 PASSED: {fr_mark.get('dark_fraction')})")
report["logo_primary"]["fringe_reference_logo_mark"] = fr_mark
# ink-edge band composited over the ivory board background (how it will actually be seen)
alpha = lg[..., 3]
edge = (alpha > 0) & (alpha < 128)
ys, xs = np.nonzero(edge)
if len(xs):
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    crop = lg[y0:y1 + 1, x0:x1 + 1, :].copy()
    ivory = np.zeros_like(crop)
    ivory[..., 0], ivory[..., 1], ivory[..., 2], ivory[..., 3] = 247, 241, 227, 255
    a3 = crop[..., 3:4] / 255.0
    comp = (crop[..., :3] * a3 + ivory[..., :3] * (1 - a3)).astype(np.uint8)
    Image.fromarray(comp[:: max(1, comp.shape[0] // 900)]).save(EVID / "logo_edge_on_ivory.png")
Image.fromarray(lg).resize((640, 640), Image.Resampling.LANCZOS).save(EVID / "logo_primary_640.png")
report["logo_primary"] = {"ink_bbox": ls["bbox"], "margins_pct": [round(100 * m, 2) for m in (mL, mT, mR, mB)],
                          "lines_check": "VISUAL (spelling/line-count adjudicated by reviewer eyes)",
                          "fringe": fr}

# ---------- R-T12 ui kit (asset-request-12) ----------
uk = nativeness("assets/art/ui/ui_kit.png", "ui_kit", (2048, 2048), True)
comps = connected_components(uk[..., 3], thresh=20, min_area=250)
for c in comps:
    c["x"], c["y"] = c["bbox"][0], c["bbox"][1]
    c["w"], c["h"] = c["size"]
chev = [c for c in comps if 25 <= c["w"] <= 260 and 25 <= c["h"] <= 260 and abs(c["w"] - c["h"]) < 130]
best = (0.0, None)
mk = uk[..., 3] >= 20
for i, c1 in enumerate(chev):
    a_img = Image.fromarray((mk[c1["y"]:c1["y"] + c1["h"], c1["x"]:c1["x"] + c1["w"]] * 255).astype(np.uint8)).resize((256, 256))
    for c2 in chev[i + 1:]:
        if abs(c1["w"] - c2["w"]) + abs(c1["h"] - c2["h"]) > 20:
            continue
        b_img = Image.fromarray((mk[c2["y"]:c2["y"] + c2["h"], c2["x"]:c2["x"] + c2["w"]] * 255).astype(np.uint8)).resize((256, 256))
        flip = getattr(Image, "Transpose", Image).FLIP_LEFT_RIGHT
        v = iou(np.asarray(a_img) > 127, np.asarray(b_img.transpose(flip)) > 127)
        if v > best[0]:
            best = (v, (c1, c2))
gate("R-T12·back/next-mirror-IoU≥0.95", best[0] >= 0.95,
     f"best mirror IoU={best[0]:.4f} (chevron-size candidates={len(chev)}, coarse components={len(comps)})")
ccu = corner_check(uk)
gate("R-T12·corner-alpha=0 (sheet bg really transparent)",
     all(v["mean_alpha"] == 0.0 for v in ccu.values()), str({k: v["mean_alpha"] for k, v in ccu.items()}))
Image.fromarray(uk).resize((1024, 1024), Image.Resampling.LANCZOS).save(EVID / "ui_kit_flat_1024.png")
Image.fromarray(A1.checkerboard(uk)).save(EVID / "ui_kit_checker.png")
report["ui_kit"] = {
    "coarse_components": len(comps),
    "component_boxes": [{"x": c["x"], "y": c["y"], "w": c["w"], "h": c["h"], "area": c.get("area")} for c in comps],
    "chevron_candidates": len(chev),
    "best_mirror_pair": {"iou": round(best[0], 4),
                        "boxes": [best[1][0], best[1][1]] if best[1] else None},
    "element_census_14": "VISUAL (14-element + icon_back presence adjudicated on ui_kit_flat_1024.png)",
}

# ---------- write evidence ----------
lines = []
for name, ok, detail in verdicts:
    lines.append(f"[{'PASS' if ok else 'FAIL'}] {name} :: {detail}")
n_pass = sum(1 for _, ok, _ in verdicts if ok)
lines.append(f"RESULT {n_pass}/{len(verdicts)} numeric gates PASS")
(EVID / "audit_rev02.json").write_text(json.dumps(report, indent=1, default=str), "utf-8")
(EVID / "audit_rev02_flat.txt").write_text("\n".join(lines) + "\n", "utf-8")
print("\n".join(lines))
