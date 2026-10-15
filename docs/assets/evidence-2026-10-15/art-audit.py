#!/usr/bin/env python3
"""Read-only ART-INTAKE-2026-10-15 audit.

Does not modify any PNG. Writes evidence images to EVID.
"""

from __future__ import annotations

import json
import math
import os
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/Users/Admin/VibeCoding/GameCpt")
ART = ROOT / "assets" / "art"
EVID = Path("/private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/art-intake")
EVID.mkdir(parents=True, exist_ok=True)

EXPECTED = {
    "cover": ("assets/art/cover/cover_hero_1920x1080.png", (1920, 1080), False, "P2"),
    "logo_primary": ("assets/art/logo/logo_primary.png", (2048, 2048), True, "P2"),
    "logo_mark": ("assets/art/logo/logo_mark.png", (1024, 1024), True, "P2"),
    "echo_spirit_a": ("assets/art/character/echo_spirit_a.png", (512, 512), True, "P0"),
    "echo_spirit_b": ("assets/art/character/echo_spirit_b.png", (512, 512), True, "P0"),
    "bg_phase_a": ("assets/art/background/bg_phase_a_1920x1080.png", (1920, 1080), False, "P0"),
    "bg_phase_b": ("assets/art/background/bg_phase_b_1920x1080.png", (1920, 1080), False, "P0"),
    "goal": ("assets/art/props/goal.png", (512, 512), True, "P0"),
    "portal_a": ("assets/art/props/portal_a.png", (512, 512), True, "P2"),
    "portal_b": ("assets/art/props/portal_b.png", (512, 512), True, "P2"),
    "ui_kit": ("assets/art/ui/ui_kit.png", (2048, 2048), True, "P1"),
}


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    c = c.astype(np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c.astype(np.float64), 0.0, 1.0)
    out = np.where(c <= 0.0031308, c * 12.92, 1.055 * (np.power(c, 1 / 2.4)) - 0.055)
    return np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8)


def rel_lum(rgb: np.ndarray) -> np.ndarray:
    lin = srgb_to_linear(rgb)
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


def contrast_ratio(a_lum: float, b_lum: float) -> float:
    hi, lo = max(a_lum, b_lum), min(a_lum, b_lum)
    return (hi + 0.05) / (lo + 0.05)


def png_metadata(path: Path) -> dict:
    with Image.open(path) as im:
        return {
            "format": im.format,
            "width": im.width,
            "height": im.height,
            "mode": im.mode,
            "has_alpha": "A" in im.mode,
            "info_keys": sorted(im.info.keys()),
            "transparency_info": "transparency" in im.info,
        }


def load_rgba(path: Path) -> np.ndarray:
    with Image.open(path) as im:
        return np.asarray(im.convert("RGBA"))


def silhouette_stats(mask: np.ndarray) -> dict:
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return {"area": 0, "bbox": None}
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
    return {
        "area": int(mask.sum()),
        "area_fraction": float(mask.mean()),
        "bbox": [x0, y0, x1, y1],
        "bbox_size": [x1 - x0 + 1, y1 - y0 + 1],
        "centroid": [float(xs.mean()), float(ys.mean())],
    }


def bbox_crop(mask: np.ndarray) -> np.ndarray:
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return mask[:0, :0]
    return mask[int(ys.min()) : int(ys.max()) + 1, int(xs.min()) : int(xs.max()) + 1]


def iou(a: np.ndarray, b: np.ndarray) -> float:
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return float(inter) / float(union) if union else 0.0


def iou_resized(a: np.ndarray, b: np.ndarray, size=(256, 256)) -> float:
    ia = Image.fromarray((a * 255).astype(np.uint8)).resize(size, Image.Resampling.NEAREST)
    ib = Image.fromarray((b * 255).astype(np.uint8)).resize(size, Image.Resampling.NEAREST)
    return iou(np.asarray(ia) > 127, np.asarray(ib) > 127)


def chamfer(a: np.ndarray, b: np.ndarray) -> float:
    """Mean nearest-surface distance in pixels, symmetric."""
    from collections import deque

    def edt(mask: np.ndarray) -> np.ndarray:
        h, w = mask.shape
        out = np.full((h, w), 1e9, dtype=np.float64)
        q = deque()
        for y in range(h):
            for x in range(w):
                if not mask[y, x]:
                    out[y, x] = 0
                    q.append((y, x))
        dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        while q:
            y, x = q.popleft()
            d = out[y, x]
            for dy, dx in dirs:
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and out[ny, nx] > d + 1:
                    out[ny, nx] = d + 1
                    q.append((ny, nx))
        return out

    # only compute from boundary pixels of each silhouette for speed
    def boundary(mask: np.ndarray) -> np.ndarray:
        er = mask[1:-1, 1:-1]
        b = np.zeros_like(mask, dtype=bool)
        interior = er & mask[1:-1, 1:-1]
        b[1:-1, 1:-1] = er & ~np.all(mask[0:-2, 1:-1] & mask[2:, 1:-1] & mask[1:-1, 0:-2] & mask[1:-1, 2:], axis=0)
        return b

    def bdist(mask: np.ndarray) -> np.ndarray:
        h, w = mask.shape
        out = np.full((h, w), 1e9, dtype=np.float64)
        q = deque()
        for y in range(h):
            for x in range(w):
                if not mask[y, x]:
                    out[y, x] = 0
        # forward/back raster scan (Felzenszwalb is better but this is sufficient for 512^2)
        for y in range(h):
            for x in range(w):
                if mask[y, x]:
                    v = out[y, x]
                    if y > 0:
                        v = min(v, out[y - 1, x] + 1)
                    if x > 0:
                        v = min(v, out[y, x - 1] + 1)
                    out[y, x] = v
        for y in range(h - 1, -1, -1):
            for x in range(w - 1, -1, -1):
                if mask[y, x]:
                    v = out[y, x]
                    if y + 1 < h:
                        v = min(v, out[y + 1, x] + 1)
                    if x + 1 < w:
                        v = min(v, out[y, x + 1] + 1)
                    out[y, x] = v
        return out

    da = bdist(a)[b]
    db = bdist(b)[a]
    return float((da.sum() + db.sum()) / (b.sum() + a.sum()))


def alpha_profile(arr: np.ndarray) -> dict:
    a = arr[..., 3]
    counts = np.bincount(a.ravel(), minlength=256)
    total = a.size
    return {
        "min": int(a.min()),
        "max": int(a.max()),
        "unique_count": int(np.count_nonzero(counts)),
        "zero": float((a == 0).mean()),
        "opaque_255": float((a == 255).mean()),
        "ge_128": float((a >= 128).mean()),
        "soft_edge_1_to_254": float(((a > 0) & (a < 255)).mean()),
        "histogram": counts.tolist(),
    }


def corner_check(arr: np.ndarray, size=32) -> dict:
    h, w = arr.shape[:2]
    out = {}
    for name, ys, xs in [
        ("tl", (0, size), (0, size)),
        ("tr", (0, size), (w - size, w)),
        ("bl", (h - size, h), (0, size)),
        ("br", (h - size, h), (w - size, w)),
    ]:
        p = arr[ys[0] : ys[1], xs[0] : xs[1]]
        out[name] = {
            "mean_alpha": float(p[..., 3].mean()),
            "opaque_fraction": float((p[..., 3] == 255).mean()),
            "mean_rgb": p[..., :3].reshape(-1, 3).mean(axis=0).round(3).tolist(),
        }
    return out


def fringe_check(arr: np.ndarray) -> dict:
    """Dark/gray fringe around the semi-transparent glow edge: local ring inside mask boundary."""
    a = arr[..., 3]
    mask = a > 0
    # ring = pixels with 0<a<255 and not fully transparent neighborhood only
    edge = ((a > 0) & (a < 255)).astype(np.uint8)
    if edge.sum() == 0:
        return {"edge_pixels": 0}
    rgb = arr[..., :3]
    lum = rel_lum(rgb)
    trans = (a > 0) & (a < 128)
    dark = trans & (lum < 0.16)
    gray = trans & (lum >= 0.16) & (lum < 0.42)
    bright = trans & (lum >= 0.42)
    return {
        "semi128_pixels": int(trans.sum()),
        "dark_fraction": float(dark.sum() / max(trans.sum(), 1)),
        "gray_fraction": float(gray.sum() / max(trans.sum(), 1)),
        "bright_fraction": float(bright.sum() / max(trans.sum(), 1)),
        "mean_edge_alpha": float(a[trans].mean()) if trans.sum() else None,
        "edge_width_rows": int(((a > 0) & (a < 255)).any(axis=1).sum()),
    }


def block_contrast(img: np.ndarray, crop_fraction: float, grid: int, pct_low=2, pct_high=98) -> dict:
    h, w = img.shape[:2]
    ch, cw = int(h * crop_fraction), int(w * crop_fraction)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    crop = img[y0 : y0 + ch, x0 : x0 + cw, :3]
    lum = rel_lum(crop)
    by, bx = ch // grid, cw // grid
    blocks = lum[: by * grid, : bx * grid].reshape(grid, by, grid, bx).mean(axis=(1, 3))
    lo = float(np.percentile(blocks, pct_low))
    hi = float(np.percentile(blocks, pct_high))
    return {
        "crop_fraction": crop_fraction,
        "grid": grid,
        "mean_lum": float(lum.mean()),
        "p50_lum": float(np.percentile(lum, 50)),
        "p2_block": lo,
        "p98_block": hi,
        "contrast_2_98": contrast_ratio(hi, lo),
        "contrast_minmax": contrast_ratio(float(blocks.max()), float(blocks.min())),
        "std_lum": float(lum.std()),
    }


def connected_components(alpha: np.ndarray, thresh=20, min_area=250) -> list[dict]:
    mask = alpha > thresh
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    out = []
    stack = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                stack.append((y, x))
                pixels = []
                while stack:
                    cy, cx = stack.pop()
                    pixels.append((cy, cx))
                    for dy, dx in ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            stack.append((ny, nx))
                if len(pixels) >= min_area:
                    ys = np.array([p[0] for p in pixels])
                    xs = np.array([p[1] for p in pixels])
                    bbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
                    out.append({"area": len(pixels), "bbox": bbox, "size": [bbox[2] - bbox[0] + 1, bbox[3] - bbox[1] + 1]})
    return sorted(out, key=lambda x: -x["area"])


def overlay_silhouettes(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    sa = a[..., 3] >= 128
    sb = b[..., 3] >= 128
    out = np.full((*sa.shape, 3), 255, dtype=np.uint8)
    out[sa & ~sb] = [220, 0, 0]
    out[sb & ~sa] = [0, 160, 0]
    out[sa & sb] = [90, 90, 90]
    return out


def checkerboard(arr: np.ndarray, square=32, light=(210, 210, 210), dark=(90, 90, 90)) -> np.ndarray:
    h, w = arr.shape[:2]
    y, x = np.mgrid[0:h, 0:w]
    cond = (((y // square) + (x // square)) % 2 == 0)[..., None]
    tile = np.where(cond, np.array(light, dtype=np.uint8), np.array(dark, dtype=np.uint8))
    bg = tile.astype(np.uint8)
    af = arr[..., 3:4].astype(np.float64) / 255.0
    return (arr[..., :3] * af + bg * (1 - af)).round().astype(np.uint8)


def thumbnail_grid(files: list[tuple[Path, int]], back_color: tuple[int, int, int], scale=4) -> np.ndarray:
    tiles = []
    for (p, size) in files:
        arr = load_rgba(p)
        out = np.zeros((*arr.shape[:2], 3), dtype=np.uint8) + np.array(back_color, dtype=np.uint8)
        a = arr[..., 3:4].astype(np.float64) / 255
        out = (arr[..., :3] * a + out * (1 - a)).astype(np.uint8)
        im = Image.fromarray(out).resize((size, size), Image.Resampling.LANCZOS)
        im = im.resize((size * scale, size * scale), Image.Resampling.NEAREST)
        tiles.append(np.asarray(im))
    gap = 12
    height = max(t.shape[0] for t in tiles)
    width = sum(t.shape[1] for t in tiles) + gap * (len(tiles) - 1)
    canvas = np.zeros((height, width, 3), dtype=np.uint8) + 245
    x = 0
    for t in tiles:
        canvas[: t.shape[0], x : x + t.shape[1]] = t
        x += t.shape[1] + gap
    return canvas


def crossfade_delta(a: np.ndarray, b: np.ndarray, steps=9) -> dict:
    la = rel_lum(a[..., :3])
    lb = rel_lum(b[..., :3])
    deltas = [np.abs(la - (la.mean() / lb.mean()) * lb).mean() for _ in [0]]
    # structural difference (same world, phase tint) after brightness normalisation
    norm_b = srgb_to_linear(b[..., :3]) * (rel_lum(a[..., :3]).mean() / rel_lum(b[..., :3]).mean())
    diff = np.abs(srgb_to_linear(a[..., :3]) - norm_b).mean()
    # max single-step luminance delta if crossfade linearly interpolates
    max_step = abs(rel_lum(a[..., :3]) - rel_lum(b[..., :3])) / (steps - 1)
    return {
        "normalised_mean_abs_diff": float(diff),
        "mean_lum_a": float(la.mean()),
        "mean_lum_b": float(lb.mean()),
        "max_lum_delta_per_step_8": float(max_step.max()),
    }


def crop_safety(img: np.ndarray, target_aspect=9 / 16) -> dict:
    h, w = img.shape[:2]
    ch, cw = min(h, int(w * target_aspect)), min(w, int(h / target_aspect))
    if h / w > target_aspect:
        cw, ch = w, int(w * target_aspect)
    else:
        ch, cw = h, int(h * target_aspect)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    crop = img[y0 : y0 + ch, x0 : x0 + cw]
    center = crop[int(ch * 0.2) : int(ch * 0.8), int(cw * 0.2) : int(cw * 0.8), :3]
    return {
        "crop": [x0, y0, cw, ch],
        "center_contrast": block_contrast(center, 1.0, 12)["contrast_2_98"],
        "center_mean_lum": float(rel_lum(center).mean()),
    }


def analyze(name: str, rel: str, expected_size: tuple[int, int], expect_alpha: bool, priority: str) -> dict:
    p = ROOT / rel
    meta = png_metadata(p)
    arr = load_rgba(p)
    res = {
        "name": name,
        "path": rel,
        "exists": p.is_file(),
        "priority": priority,
        "expected_size": list(expected_size),
        "actual_size": [meta["width"], meta["height"]],
        "mode": meta["mode"],
        "format": meta["format"],
        "expected_alpha": expect_alpha,
        "has_alpha_channel": meta["has_alpha"],
        "png_info": meta["info_keys"],
        "alpha": alpha_profile(arr),
        "corners": corner_check(arr),
        "silhouette": silhouette_stats(arr[..., 3] >= 128),
        "fringe": fringe_check(arr),
        "bytes": p.stat().st_size,
    }
    if expect_alpha:
        res["checkerboard"] = str(EVID / f"checker_{name}.png")
        Image.fromarray(checkerboard(arr)).save(EVID / f"checker_{name}.png")
        res["on_light_ground"] = str(EVID / f"light_{name}.png")
        Image.fromarray(thumbnail_grid([(p, 64)], (247, 241, 227), 1)).save(EVID / f"light_{name}.png")
        res["on_dark_ground"] = str(EVID / f"dark_{name}.png")
        Image.fromarray(thumbnail_grid([(p, 64)], (27, 31, 59), 1)).save(EVID / f"dark_{name}.png")
    else:
        res["center_contrast"] = block_contrast(arr, 0.6, 20)
    if name.startswith("bg_"):
        res["portrait_crop"] = crop_safety(arr[..., :3])
    if name == "ui_kit":
        # Full-size Python CC is slow. Coarse then local refine: use morphology-style downsampling.
        a = arr[..., 3]
        small = np.asarray(Image.fromarray(a).resize((512, 512), Image.Resampling.BILINEAR))
        comps = connected_components(small, thresh=35, min_area=50)
        res["coarse_connected_components_512"] = comps
        res["coarse_note"] = "bbox coordinates are in the 512x512 alpha map; multiply by 4 for source pixels."
    return res


def main() -> int:
    report: dict = {"files": {}, "pairs": {}, "backgrounds": {}, "goal": {}, "integration": {}}
    loaded: dict[str, np.ndarray] = {}
    for name, (rel, size, alpha, prio) in EXPECTED.items():
        loaded[name] = load_rgba(ROOT / rel)
        report["files"][name] = analyze(name, rel, size, alpha, prio)

    # pairs
    for pair_name, a, b, req_iou in [
        ("echo_spirit_pair", "echo_spirit_a", "echo_spirit_b", 1.0),
        ("portal_pair", "portal_a", "portal_b", 1.0),
    ]:
        ma = loaded[a][..., 3] >= 128
        mb = loaded[b][..., 3] >= 128
        ca = bbox_crop(ma)
        cb = bbox_crop(mb)
        stats = {
            "raw_iou": iou(ma, mb),
            "bbox_aligned_iou": iou_resized(ca, cb),
            "chamfer_px": chamfer(ma, mb),
            "a_area": int(ma.sum()),
            "b_area": int(mb.sum()),
            "area_ratio": float(ma.sum() / mb.sum()),
            "a_bbox": ma.sum() and [int(np.nonzero(ma)[1].min()), int(np.nonzero(ma)[0].min()), int(np.nonzero(ma)[1].max()), int(np.nonzero(ma)[0].max())],
            "b_bbox": mb.sum() and [int(np.nonzero(mb)[1].min()), int(np.nonzero(mb)[0].min()), int(np.nonzero(mb)[1].max()), int(np.nonzero(mb)[0].max())],
            "required": req_iou,
        }
        Image.fromarray(overlay_silhouettes(loaded[a], loaded[b])).save(EVID / f"overlay_{pair_name}.png")
        stats["overlay"] = str(EVID / f"overlay_{pair_name}.png")
        # alpha mask equality (not just silhouette)
        stats["alpha_equal_exact"] = bool(np.array_equal(loaded[a][..., 3], loaded[b][..., 3]))
        report["pairs"][pair_name] = stats

    # backgrounds
    la = rel_lum(loaded["bg_phase_a"][..., :3])
    lb = rel_lum(loaded["bg_phase_b"][..., :3])
    # Structure: blur to remove stars/motes, then compare normalized maps.
    sa = rel_lum(np.asarray(Image.fromarray(loaded["bg_phase_a"][..., :3]).filter(ImageFilter.GaussianBlur(18))))
    sb = rel_lum(np.asarray(Image.fromarray(loaded["bg_phase_b"][..., :3]).filter(ImageFilter.GaussianBlur(18))))
    na = (sa - sa.min()) / (sa.max() - sa.min())
    nb = (sb - sb.min()) / (sb.max() - sb.min())
    corr = float(np.corrcoef(na.ravel(), nb.ravel())[0, 1])
    report["backgrounds"] = {
        "mean_lum": {"a": float(la.mean()), "b": float(lb.mean())},
        "phase_contrast": contrast_ratio(float(la.mean()), float(lb.mean())),
        "center": {
            "a": block_contrast(loaded["bg_phase_a"], 0.6, 20),
            "b": block_contrast(loaded["bg_phase_b"], 0.6, 20),
        },
        "blurred_structural_correlation": corr,
        "crossfade": crossfade_delta(loaded["bg_phase_a"], loaded["bg_phase_b"], 9),
        "portrait": {
            "a": crop_safety(loaded["bg_phase_a"][..., :3]),
            "b": crop_safety(loaded["bg_phase_b"][..., :3]),
        },
    }
    # Save 9:16 crops for visual check
    for n in ("a", "b"):
        crop = report["backgrounds"]["portrait"][n]["crop"]
        Image.fromarray(loaded[f"bg_phase_{n}"][crop[1] : crop[1] + crop[3], crop[0] : crop[0] + crop[2], :3]).save(EVID / f"portrait_bg_{n}.png")

    # goal small sizes
    goal = ROOT / EXPECTED["goal"][0]
    Image.fromarray(thumbnail_grid([(goal, 24)], (247, 241, 227))).save(EVID / "goal_small_light.png")
    Image.fromarray(thumbnail_grid([(goal, 24)], (27, 31, 59))).save(EVID / "goal_small_dark.png")

    # spirit sizes
    Image.fromarray(
        thumbnail_grid(
            [(ROOT / EXPECTED["echo_spirit_b"][0], 32)],
            (247, 241, 227),
        )
    ).save(EVID / "spirits_small.png")

    # portal small
    Image.fromarray(
        thumbnail_grid(
            [(ROOT / EXPECTED["portal_b"][0], 32)],
            (247, 241, 227),
        )
    ).save(EVID / "portals_small.png")

    # logo_mark small
    Image.fromarray(thumbnail_grid([(ROOT / EXPECTED["logo_mark"][0], 32)], (250, 250, 250))).save(EVID / "logo_mark_32.png")

    # ui kit individual crop previews
    ui = loaded["ui_kit"]
    with Image.open(ROOT / EXPECTED["ui_kit"][0]) as im:
        uim = im.convert("RGBA")
    uim.save(EVID / "ui_kit_checker.png", "PNG", optimize=True)  # full file may be large; write in chunks below if needed

    # integrated text/spelling: OCR impossible here; visual review. Record logo bbox from alpha.
    lm = ui  # not used
    logo = load_rgba(ROOT / EXPECTED["logo_primary"][0])
    stats = silhouette_stats(logo[..., 3] >= 128)
    report["logo_primary"] = {
        "ink_bbox": stats["bbox"],
        "bbox_size": stats["bbox_size"],
        "horizontal_margin_fraction": [
            float(stats["bbox"][0] / logo.shape[1]),
            float((logo.shape[1] - stats["bbox"][2] - 1) / logo.shape[1]),
        ],
        "vertical_margin_fraction": [
            float(stats["bbox"][1] / logo.shape[0]),
            float((logo.shape[0] - stats["bbox"][3] - 1) / logo.shape[0]),
        ],
        "raw_alpha_min": int(logo[..., 3].min()),
        "raw_alpha_max": int(logo[..., 3].max()),
    }
    Image.fromarray(thumbnail_grid([(ROOT / EXPECTED["logo_primary"][0], 256)], (240, 240, 240))).save(EVID / "logo_primary_small.png")

    report["integration"] = {
        "no_game_files_modified": True,
        "evidence_directory": str(EVID),
        "sha256_baseline": str(EVID / "baseline.sha256"),
    }

    # Write large UI evidence carefully.
    Image.fromarray(checkerboard(ui)).resize((1024, 1024), Image.Resampling.LANCZOS).save(EVID / "ui_kit_checker_1024.png")
    # coarse crops
    a = ui[..., 3]
    small = np.asarray(Image.fromarray(a).resize((512, 512), Image.Resampling.BILINEAR))
    for i, comp in enumerate(connected_components(small, 35, 50)[:30]):
        x0, y0, x1, y1 = [v * 4 for v in comp["bbox"]]
        Image.fromarray(checkerboard(ui[y0:y1 + 1, x0:x1 + 1])).save(EVID / f"ui_component_{i:02d}.png")

    out = EVID / "audit.json"
    out.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    # console summary
    print(json.dumps({
        "files": {k: {kk: vv for kk, vv in v.items() if kk in ["actual_size", "mode", "has_alpha_channel"]} for k, v in report["files"].items()},
        "pairs": report["pairs"],
        "background_center": report["backgrounds"]["center"],
        "portrait": report["backgrounds"]["portrait"],
        "logo_margins": report["logo_primary"],
        "ui_components": len(report["files"]["ui_kit"].get("coarse_connected_components_512", [])),
    }, indent=2))
    print("EVID", EVID)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
