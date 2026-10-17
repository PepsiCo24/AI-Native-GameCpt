"""UA-002 portal-mount probe (2026-10-17) — read-only, re-runnable.

Purpose: print EVERY number the V0.9.6 spec text cites for the portal mount
(`docs/ui-ux.md` §3.1e / the V0.9.5 -> V0.9.6 change note M-1..M-6, §4.3 rows),
so each claim is auditable by re-running this file rather than by trusting the
doc. Same measuring stick as the batch-1/rev-02 audits: luminance primitives are
IMPORTED from `docs/assets/evidence-2026-10-15/art-audit.py`, never re-derived.

Measured objects (signed bytes, read-only):
  assets/art/props/portal_a.png, portal_b.png, goal.png   (512 x 512 RGBA)

Apertures (pinned here, because the doc cites numbers and must name how):
  ink        = alpha >= 128                      (the delivered figure's pixels)
  core       = MEAN RGB *over the ink mask*      (the published "#45BAD1"/"#385F8B")
  outer      = half the max side of the ink (alpha>=128) bounding box
  swirl      = ink with radius < 0.62 * outer, radius measured from the ink bbox centre

Gates: the script ASSERTS the published values; a byte change or an aperture
change makes it fail loudly instead of printing plausible numbers.

Usage:  python3 docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py
Writes: portal_probe.json next to this file.
"""
from __future__ import annotations

import colorsys
import importlib.util
import json
import math
from pathlib import Path

import numpy as np

# --- imported primitives (single measurement authority) ----------------------
BATCH1 = Path("/Users/Admin/VibeCoding/GameCpt/docs/assets/evidence-2026-10-15/art-audit.py")
_spec = importlib.util.spec_from_file_location("batch1_audit", BATCH1)
A1 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(A1)

load_rgba = A1.load_rgba
rel_lum = A1.rel_lum
contrast_ratio = A1.contrast_ratio

ROOT = Path("/Users/Admin/VibeCoding/GameCpt")
PROPS = ROOT / "assets" / "art" / "props"
EVID = Path(__file__).resolve().parent

INK_ALPHA = 128
CORE_ALPHA = 200
SWIRL_FRAC = 0.62
PORTAL_FOOTPRINT = 0.70   # src/game/renderer/objects/portal.ts
WALL_FOOTPRINT = 0.88     # §3.1 / §5.1 rank-3

# §4.3 token map (read-only inputs, cited not edited)
GROUND = {
    "A.cell": (0xFF, 0xFD, 0xF7),
    "A.cellAlt": (0xF2, 0xEA, 0xDB),
    "B.cell": (0x22, 0x28, 0x4A),
    "B.cellAlt": (0x2A, 0x31, 0x57),
}
OBJ_PORTAL = {"A": (0x1F, 0x6F, 0x78), "B": (0x7F, 0xD8, 0xD0)}
OBJ_PORTAL_ECHO = {"A": (0x4C, 0x8B, 0x91), "B": (0x6C, 0xB5, 0xB5)}


def hexs(rgb) -> str:
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in rgb[:3])


def hue_deg(rgb) -> float:
    h, _s, _v = colorsys.rgb_to_hsv(*(np.asarray(rgb, dtype=float) / 255.0))
    return h * 360.0


def lum(rgb) -> float:
    return float(rel_lum(np.asarray(rgb, dtype=float)))


def cr(a, b) -> float:
    return float(contrast_ratio(lum(a), lum(b)))


def _f(t: float) -> float:
    d = 6.0 / 29.0
    return t ** (1.0 / 3.0) if t > d ** 3 else t / (3.0 * d * d) + 4.0 / 29.0


def lstar(rgb) -> float:
    """CIE L* from the imported relative luminance (Y, white = 1.0)."""
    return 116.0 * _f(lum(rgb)) - 16.0


def dlstar(a, b) -> float:
    return abs(lstar(a) - lstar(b))


def mask_radii(arr: np.ndarray, alpha_min: int = INK_ALPHA):
    """Ink pixels + bbox + centre + outer, from the alpha channel."""
    alpha = arr[..., 3]
    ys, xs = np.nonzero(alpha >= alpha_min)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    cx = (x0 + x1) / 2.0
    cy = (y0 + y1) / 2.0
    outer = max(x1 - x0 + 1, y1 - y0 + 1) / 2.0
    r = np.hypot(xs - cx, ys - cy)
    return xs, ys, (x0, y0, x1 + 1, y1 + 1), (cx, cy), outer, r


def mean_ink_core(arr: np.ndarray) -> tuple:
    alpha = arr[..., 3]
    m = alpha >= INK_ALPHA
    return tuple(float(v) for v in arr[..., :3][m].mean(axis=0))


def census(arr: np.ndarray) -> dict:
    xs, ys, bbox, (cx, cy), outer, r = mask_radii(arr)
    alpha = arr[..., 3]
    ink = int((alpha >= INK_ALPHA).sum())
    core_px = int((alpha >= CORE_ALPHA).sum())
    core = mean_ink_core(arr)
    w, h = arr.shape[1], arr.shape[0]
    framing_w = (bbox[2] - bbox[0]) / w
    framing_h = (bbox[3] - bbox[1]) / h
    out = {
        "file_size": [w, h],
        "ink_bbox": list(bbox),
        "ink_bbox_px": [bbox[2] - bbox[0], bbox[3] - bbox[1]],
        "framing": [framing_w, framing_h],
        "framing_pct": [framing_w * 100.0, framing_h * 100.0],
        "framing_mean": (framing_w + framing_h) / 2.0,
        "outer": outer,
        "centre": [cx, cy],
        "ink_px": ink,
        "core_alpha200_px": core_px,
        "core_alpha200_share": core_px / ink,
        "mean_ink_core": [round(v) for v in core],
        "mean_ink_core_hex": hexs(core),
        "mean_ink_core_hue": hue_deg(core),
    }
    # swirl census: ink inside the inner aperture
    lim = SWIRL_FRAC * outer
    sel = r < lim
    n = int(sel.sum())
    out["swirl"] = {
        "aperture": f"r < {SWIRL_FRAC} * outer ({lim:.2f} px from the ink bbox centre)",
        "n": n,
        "share_of_ink": n / ink,
        "mean_r": float(r[sel].mean()) if n else 0.0,
        "mean_r_over_outer": float(r[sel].mean() / outer) if n else 0.0,
        "sigma_r": float(r[sel].std()) if n else 0.0,
        "r_min": float(r[sel].min()) if n else 0.0,
        "r_max": float(r[sel].max()) if n else 0.0,
        "r_range": float(r[sel].max() - r[sel].min()) if n else 0.0,
        "centroid_bearing_deg": float(np.degrees(np.arctan2(
            float(np.sin(np.radians(np.degrees(np.arctan2(ys[sel] - cy, xs[sel] - cx)))).mean()),
            float(np.cos(np.radians(np.degrees(np.arctan2(ys[sel] - cy, xs[sel] - cx)))).mean()),
        ))) if n else 0.0,
        "all_ink_r_min": float(r.min()),
        "all_ink_r_max": float(r.max()),
    }
    # eccentric inner edge: min ink radius per 30-degree bearing bin
    ang = (np.degrees(np.arctan2(ys - cy, xs - cx)) + 360.0) % 360.0
    bins = []
    for k in range(12):
        s = (ang >= k * 30) & (ang < (k + 1) * 30)
        bins.append({
            "bearing_bin_deg": f"[{k * 30},{k * 30 + 30})",
            "r_min": float(r[s].min()) if s.any() else None,
            "r_max": float(r[s].max()) if s.any() else None,
        })
    out["inner_edge_by_bearing"] = bins
    return out


def main() -> int:
    portal_a = load_rgba(PROPS / "portal_a.png")
    portal_b = load_rgba(PROPS / "portal_b.png")
    goal = load_rgba(PROPS / "goal.png")

    a = census(portal_a)
    b = census(portal_b)

    # alpha channel shared between the pair? (RGB-only difference — M-1's ground)
    same_alpha = bool((portal_a[..., 3] == portal_b[..., 3]).all())
    rgb_diff_px = int((portal_a[..., :3] != portal_b[..., :3]).any(axis=-1).sum())

    core_a = tuple(a["mean_ink_core"])
    core_b = tuple(b["mean_ink_core"])

    art_box = PORTAL_FOOTPRINT / a["framing_mean"]
    implied_cell = a["file_size"][0] / art_box
    ink_mass = a["ink_px"] / (implied_cell ** 2)
    wall_mass = WALL_FOOTPRINT ** 2

    report = {
        "generated_by": "docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py",
        "apertures": {
            "ink": f"alpha >= {INK_ALPHA}",
            "core": "mean RGB over the ink mask",
            "outer": "half the max side of the ink bbox",
            "swirl": f"ink with r < {SWIRL_FRAC} * outer",
        },
        "portal_a": a,
        "portal_b": b,
        "pair": {
            "alpha_channel_identical": same_alpha,
            "rgb_differing_px": rgb_diff_px,
            "note": "the signed pair differs in RGB only; alpha geometry is shared, "
                    "so the phase mapping can never be derived from the alpha/geometry",
        },
        "mapping": {
            "as_named_A": {
                "portal_a_on_A_cell": cr(core_a, GROUND["A.cell"]),
                "portal_a_on_A_cellAlt": cr(core_a, GROUND["A.cellAlt"]),
            },
            "as_named_B": {
                "portal_b_on_B_cell": cr(core_b, GROUND["B.cell"]),
                "portal_b_on_B_cellAlt": cr(core_b, GROUND["B.cellAlt"]),
            },
            "swapped_A": {
                "portal_b_on_A_cell": cr(core_b, GROUND["A.cell"]),
                "portal_b_on_A_cellAlt": cr(core_b, GROUND["A.cellAlt"]),
            },
            "swapped_B": {
                "portal_a_on_B_cell": cr(core_a, GROUND["B.cell"]),
                "portal_a_on_B_cellAlt": cr(core_a, GROUND["B.cellAlt"]),
            },
            "verdict": "as-named FAILS R-C3 (>= 3.0); swapped PASSES — M-1",
        },
        "token_cross_check": {
            "obj.portal_A_vs_cell": cr(OBJ_PORTAL["A"], GROUND["A.cell"]),
            "obj.portal_B_vs_cell": cr(OBJ_PORTAL["B"], GROUND["B.cell"]),
        },
        "subordination": {
            "mute_live_A": {
                "pair": f"{hexs(core_b)} (live raster) vs {hexs(OBJ_PORTAL_ECHO['A'])} (obj.portalEcho)",
                "cr": cr(core_b, OBJ_PORTAL_ECHO["A"]),
                "dLstar": dlstar(core_b, OBJ_PORTAL_ECHO["A"]),
            },
            "mute_live_B": {
                "pair": f"{hexs(core_a)} (live raster) vs {hexs(OBJ_PORTAL_ECHO['B'])} (obj.portalEcho)",
                "cr": cr(core_a, OBJ_PORTAL_ECHO["B"]),
                "dLstar": dlstar(core_a, OBJ_PORTAL_ECHO["B"]),
            },
            "vector_pair_reference": {
                "A": {"cr": cr(OBJ_PORTAL["A"], OBJ_PORTAL_ECHO["A"]),
                      "dLstar": dlstar(OBJ_PORTAL["A"], OBJ_PORTAL_ECHO["A"])},
                "B": {"cr": cr(OBJ_PORTAL["B"], OBJ_PORTAL_ECHO["B"]),
                      "dLstar": dlstar(OBJ_PORTAL["B"], OBJ_PORTAL_ECHO["B"])},
                "note": "§3.1c's published 1.50 / 1.42, ΔL* 11.3 / 11.7 — the VECTOR pair",
            },
            "live_flip_A_to_B": {
                "pair": f"{hexs(core_b)} -> {hexs(core_a)}",
                "cr": cr(core_b, core_a),
                "dLstar": dlstar(core_b, core_a),
            },
            "ink_mass": {
                "art_box_x_cell": art_box,
                "implied_raster_cell_px": implied_cell,
                "portal_ink_over_cell2": ink_mass,
                "wall_solid_over_cell2": wall_mass,
            },
        },
        "goal": {},
    }

    # goal: art box, framing, mean-ink core, centre-dot probe (M-5)
    ga = census(goal)
    g_mean = tuple(ga["mean_ink_core"])
    gs = ga["swirl"]
    report["goal"] = {
        "framing_pct": ga["framing_pct"],
        "mean_ink_core": [round(v) for v in g_mean],
        "mean_ink_core_hex": hexs(g_mean),
        "mean_ink_cr_on_A_cell": cr(g_mean, GROUND["A.cell"]),
        "ink_px": ga["ink_px"],
        "ink_inside_062_outer": gs["n"],
        "inner_r_over_outer": gs["all_ink_r_min"] / ga["outer"],
        "verdict": "ZERO ink inside r < 0.62 * outer -> no centre dot in the delivered art (M-5); "
                   "the shipped comment's 3.26:1 is a single-token number, the mean-ink method reads 2.30:1 "
                   "-> method question routed to QA, no verdict here",
    }

    # --- gates ---------------------------------------------------------------
    checks = [
        ("portal ink census 74 713 px", a["ink_px"], 74713),
        ("portal_b ink census == portal_a (shared alpha)", b["ink_px"], a["ink_px"]),
        ("alpha channel identical across the pair", same_alpha, True),
        ("framing 78.7 x 78.9 %", [round(v, 1) for v in a["framing_pct"]], [78.7, 78.9]),
        ("art box 0.888 x cell", round(art_box, 3), 0.888),
        ("core alpha>=200 share 99 %", round(a["core_alpha200_share"] * 100), 99),
        ("portal_a core #45BAD1", a["mean_ink_core_hex"], "#45BAD1"),
        ("portal_b core #385F8B", b["mean_ink_core_hex"], "#385F8B"),
        ("portal_a core hue 190", round(a["mean_ink_core_hue"]), 190),
        ("portal_b core hue 212", round(b["mean_ink_core_hue"]), 212),
        ("as-named A 2.24 / 1.91", [round(v, 2) for v in (cr(core_a, GROUND["A.cell"]), cr(core_a, GROUND["A.cellAlt"]))], [2.24, 1.91]),
        ("as-named B 2.16 / 1.90", [round(v, 2) for v in (cr(core_b, GROUND["B.cell"]), cr(core_b, GROUND["B.cellAlt"]))], [2.16, 1.90]),
        ("swapped A 6.50 / 5.53", [round(v, 2) for v in (cr(core_b, GROUND["A.cell"]), cr(core_b, GROUND["A.cellAlt"]))], [6.50, 5.53]),
        ("swapped B 6.25 / 5.49", [round(v, 2) for v in (cr(core_a, GROUND["B.cell"]), cr(core_a, GROUND["B.cellAlt"]))], [6.25, 5.49]),
        ("mute/live A 1.70 / dL* 14.7", [round(cr(core_b, OBJ_PORTAL_ECHO["A"]), 2), round(dlstar(core_b, OBJ_PORTAL_ECHO["A"]), 1)], [1.70, 14.7]),
        ("mute/live B 1.03 / dL* 1.0", [round(cr(core_a, OBJ_PORTAL_ECHO["B"]), 2), round(dlstar(core_a, OBJ_PORTAL_ECHO["B"]), 1)], [1.03, 1.0]),
        ("live flip 2.89 / dL* 30.8", [round(cr(core_b, core_a), 2), round(dlstar(core_b, core_a), 1)], [2.89, 30.8]),
        ("ink mass 22.5 % of cell²", round(ink_mass * 100, 1), 22.5),
        ("wall solid 77.4 % of cell²", round(wall_mass * 100, 1), 77.4),
        ("swirl n 2770 = 3.7 % of ink", round(a["swirl"]["share_of_ink"] * 100, 1), 3.7),
        ("swirl mean r 0.595 * outer", round(a["swirl"]["mean_r_over_outer"], 3), 0.595),
        ("swirl radial range 110-125 px", [round(a["swirl"]["r_min"]), round(a["swirl"]["r_max"])], [110, 125]),
        ("swirl centroid bearing -177 deg", round(a["swirl"]["centroid_bearing_deg"]), -177),
        ("goal framing 78.9 x 79.1 %", [round(v, 1) for v in ga["framing_pct"]], [78.9, 79.1]),
        ("goal mean-ink CR 2.30 on A cell", round(cr(g_mean, GROUND["A.cell"]), 2), 2.30),
        ("goal zero ink inside 0.62 outer", ga["swirl"]["n"], 0),
    ]
    failures = []
    for name, got, want in checks:
        ok = got == want
        print(f"[{'PASS' if ok else 'FAIL'}] {name}: got {got!r} want {want!r}")
        if not ok:
            failures.append(name)

    print()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    (EVID / "portal_probe.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print()
    if failures:
        print(f"FAILED GATES ({len(failures)}): " + "; ".join(failures))
        return 1
    print(f"ALL {len(checks)} GATES PASS — every number in §3.1e / M-1..M-6 reproduces.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())