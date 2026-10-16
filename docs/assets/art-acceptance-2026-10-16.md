# Art Acceptance Record — Revision Round 02 (numeric track) · 2026-10-16

- **Delivery:** 8 images regenerated via the human Codex lane per `docs/assets/codex-master-prompt-revision-02.md`, overwritten onto the canonical paths at 09:59 local. Asset Gate unchanged: the user generates and signs; agents measure and integrate only.
- **Do-not-touch verified:** `goal.png` · `logo_mark.png` — batch-1 PASSED files, git shows them unmodified (mtime still 10-15 19:34).
- **Audit:** `docs/assets/evidence-2026-10-16-revision/art-audit-rev02.py` — every geometry/colour primitive IMPORTED from the batch-1 script (`../evidence-2026-10-15/art-audit.py`), so the two rounds share one yardstick lineage; gates implement the five request files' re-acceptance numbers verbatim. Machine-readable: `audit_rev02.json`, verdict lines `audit_rev02_flat.txt`.

## Delivered inventory (sha256, first 16)

```
6979e4856c73f517  assets/art/character/echo_spirit_a.png   512×512 RGBA
27f558b95f5b4d17  assets/art/character/echo_spirit_b.png   512×512 RGBA
8161cd2ace94ad50  assets/art/props/portal_a.png            512×512 RGBA
088f86665fcfeb7d  assets/art/props/portal_b.png            512×512 RGBA
2ea52a80cc44908c  assets/art/background/bg_phase_a_1920x1080.png  1920×1080 RGB
494511212a96876d  assets/art/background/bg_phase_b_1920x1080.png  1920×1080 RGB
3327302ec5428230  assets/art/logo/logo_primary.png         2048×2048 RGBA
cfe77f6c6351b196  assets/art/ui/ui_kit.png                 2048×2048 RGBA
```

## Result: 49/50 numeric gates PASS · 1 FAIL reclassified (evidence below)

### R-T04 · spirit pair (req-08) — ALL PASS
- **alpha_equal_exact = True** — form B is a byte-perfect recolor of form A's alpha mask. The pipeline contract (batch-1's measured killer, IoU was 0.8584) is not just met, it is *exact*: raw IoU 1.0000, chamfer 0.00 px (fixed yardstick), size-diff 0.00 %, centroid-shift 0.00 %.
- Framing 69.9 × 70.1 % both forms (band [65,80], target 70±3) — in-place phase swap shifts nothing.
- Core (α≥200): luminance-of-mean 0.6413 ∈ [0.55,0.70] (NOT near-white), hue 41.6° ∈ [35,50] honey-gold. Corners α=0, dark fringe 0.0 both forms.

### R-T06 · portal trio (req-09) — ALL PASS
- alpha_equal_exact = True again (B = recolor of A, IoU 1.0000, chamfer 0.00).
- Framing trio coherent: portal 78.7×78.9 % vs untouched goal 78.9×79.1 % — spread 0.20 % (gate ≤2 %; batch-1 rejected at 56.6×83.2 % misaligned).
- Hue law: portal core 190.0° / 212.0° ∈ [170,230] teal-blue both phases; goal 38.7° golden (regression PASS); Δhue(portal,goal) = 151.3° ≥ 100 — the two mechanics can never be confused by hue.

### R-T11 · background pair (req-11) — ALL PASS
- Blurred structural correlation **0.9951** (gate ≥0.9; the rejected take: −0.0712). One composition, two times of day — proven numerically.
- Centre 60 % quiet: minmax 1.008 / 1.021 (gate ≤1.6). 9:16 centre crop: 1.004 / 1.013 (gate ≤1.2).
- Phase separation 13.47:1 with A bright (gate ≥10:1; batch-1 anchor 13.28:1 preserved). Native 1920×1080 both.

### R-T10 · logo (req-10) — margins PASS, fringe gate reclassified
- Ink margins **L 11.67 / R 10.84 / T 29.25 / B 39.26 %** — all four sides ≥8 % gate, inside the 10 % target band (rejected take: 6.15/5.86). Native 2048. Corners α=0.
- `[FAIL → reclassified]` fringe dark_fraction 0.328 vs band ≤0.05 — **the band is a glow-spirit law, physically unsatisfiable by text AA**. Accepted-reference evidence, same instruments:
  - raw fringe: logo_mark (batch-1 PASSED) scores **0.539** — worse than the new take;
  - composited over the real ivory backdrop (#F7F1E3): new logo dark-edge fraction **0.346** vs accepted mark **0.717** — the new take is cleaner than the file the human already signed;
  - the 7,760 "raw-dark" edge pixels have mean α = 10.8/255 — near-invisible under-blends, the normal non-premultiplied text-edge signature.
  - Verdict: NOT an art defect; gate misapplication. Perceptual companion check `logo_edge_on_ivory.png` is routed to UA-0012b visual adjudication. Ledger line stays FAIL-as-measured, reclassified-as-adjudicated.

### R-T12 · ui kit (req-12) — measured PASS
- back/next mirror IoU **1.0000** (gate ≥0.95) — chevron-left exists as a true mirrored sibling (25 coarse components; census of 14 visual elements deferred to UA-0012b, components alone cannot count multi-part glyphs).
- Native 2048; sheet background genuinely transparent (corners α=0).

## Yardstick erratum (this round, disclosed)

Batch-1 `chamfer()` never used its own `boundary()`/`edt()` helpers and measured each shape's **self-depth** (byte-identical masks score ~50 px, not 0). Batch-1's reported chamfer numbers (spirits 40.8, portals 11.6) were this broken quantity — their rejections stood on IoU + framing, unaffected. This round adds `chamfer_correct()` (true symmetric boundary-to-boundary mean, 0.00 for identical pairs) and records both numbers in `audit_rev02.json` for continuity. Also fixed mid-round: a luminance double-scaling in the new `core_stats` (first run printed lum 0.0002; corrected 0.6413) — caught because it contradicted its own hue reading.

## Reproduce

```
python3 docs/assets/evidence-2026-10-16-revision/art-audit-rev02.py
```

## Visual track result (UA-0012b, landed same day)

`docs/assets/art-visual-review-2026-10-16.md` — **VISUAL ACCEPTANCE 7/8 PASS**. Every clause green except one, precisely named:

- **`echo_spirit_a` aura colour**: the rim/glow reads warm cream (hue ≈ 47°) where req-08 mandates a **pale sky-blue** aura. Body colour, silhouette, framing, small-size readability and the B form's moonlight-blue aura are all correct — this is a one-clause colour defect on the halo band only, not a shape/identity problem (the batch-1 killer stays dead: alpha masks are still byte-identical).
- The logo edge-AA clause CONFIRMED the numeric reclassification above: no black halo over ivory.

## Options for the human gate

1. **WAIVE** the aura clause (record the waiver, sign 8/8) — the defect is sub-perceptual at 32–48 px gameplay sizes where identity is carried by the body;
2. **RE-GEN** the single clause via the surgical brief `docs/assets/codex-mini-prompt-spirit-aura.md` (A's aura only → B re-derived from A's alpha; R-T04 block re-runs with a new rim-band hue gate ∈ [185°, 225°]).

## Status

- Numeric track: **49/50 PASS · 1 reclassified with accepted-reference evidence** — no unexplained red remains.
- Visual track: **7/8 PASS · 1 named aura-colour defect** (options above).
- **ASSET GATE: awaiting the human signature (waive-or-regen decision included).** Integration (R-005) starts only after the user signs this round.
