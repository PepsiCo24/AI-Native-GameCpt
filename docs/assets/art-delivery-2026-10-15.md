# Art Generation Delivery Record — 2026-10-15

> Batch status: **GENERATED CANDIDATES — NOT PRODUCTION APPROVED / NOT INTEGRATED**
>
> Trigger: the user explicitly instructed generation and reattached the full 11-asset brief. This record does not change `AGENTS.md` or waive normal acceptance evidence.

## Provenance and processing

- Original generation directory: `/Users/Admin/.codex/generated_images/01a139eb-29fc-7c83-8f75-2965af66efd7`
- Prompt approach: the attached original brief was consolidated with the documented conflict decisions, then simplified per target while retaining the shared visual language. The global no-grid/no-wall rule was chosen over the conflicting T01/T03 composition text; portals use the global cyan/blue hue ownership rather than the conflicting task-local gold/violet wording; T11 arrows were treated as an explicit UI exception.
- Exact-size adaptation used `sips` resampling. The three 16:9 candidates were generated at 1672×941 and resized to 1920×1080. `logo_primary.png` and `ui_kit.png` were generated at 1280×1280 and interpolated up to 2048×2048, so they are **not native-resolution outputs** and fail the no-upscaling requirement. The remaining 1280×1280 sources were downscaled to 512×512 or 1024×1024.
- Final Shadow spirit source: `exec-4fb069e2-6365-4507-89eb-86f2cc16e98a.png` from the generation directory.

## Per-file delivery inventory

| Task | Runtime path | Actual PNG properties | Status | Evidence and unresolved checks |
|---|---|---|---|---|
| T01 | `assets/art/cover/cover_hero_1920x1080.png` | 1920×1080, RGB, opaque | **NEEDS_REVISION** | Exact path/size/format pass. Generated without grid or walls to follow the global prohibition, so it does not satisfy T01's conflicting 5×5-board composition. Derived from 1672×941, not native output. |
| T02 | `assets/art/logo/logo_primary.png` | 2048×2048, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. Visual review found the correct two-line spelling, but left/right margin is about 6%, below the required 8%. Upscaled from 1280×1280. Fringe quality is not certified. |
| T03 | `assets/art/logo/logo_mark.png` | 1024×1024, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. Generated without a grid to follow the global prohibition, so it does not satisfy T03's conflicting rounded-grid composition. Readability at 32 px and fringe quality remain unverified. |
| T04 | `assets/art/character/echo_spirit_a.png` | 512×512, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. Pair silhouette IoU at alpha ≥128 is 0.8583545962 (85.84%), not the required identical silhouette. Fringe and 48/32 px checks remain unverified. |
| T05 | `assets/art/character/echo_spirit_b.png` | 512×512, RGBA, alpha 0–254 | **NEEDS_REVISION** | Non-constant alpha proves real transparency; no fully opaque pixel is present. Pair silhouette IoU is 85.84%, so the strict match fails. Fringe and 48/32 px checks remain unverified. |
| T06 | `assets/art/background/bg_phase_a_1920x1080.png` | 1920×1080, RGB, opaque | **PENDING_REVIEW** | Exact path/size/format pass. Central-60% linear-sRGB luminance contrast is 1.0936921576 (≤1.6 pass); mean luminance 0.902927. Derived from 1672×941, not native output. Crop/cross-dissolve review remains open. |
| T07 | `assets/art/background/bg_phase_b_1920x1080.png` | 1920×1080, RGB, opaque | **PENDING_REVIEW** | Exact path/size/format pass. Central-60% linear-sRGB luminance contrast is 1.3516895660 (≤1.6 pass); mean luminance 0.016766. Derived from 1672×941, not native output. Crop/cross-dissolve review remains open. |
| T08 | `assets/art/props/goal.png` | 512×512, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. It reads as a hollow ring, but has a residual bevel-like edge and an approximately 79% visual footprint instead of about 70%; 48 px ambiguity and fringe checks remain open. |
| T09 | `assets/art/props/portal_a.png` | 512×512, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. Portal-pair silhouette IoU at alpha ≥128 is 0.9672218845 (96.72%); alpha masks are not identical, so the strict 100% requirement fails. Fringe and 48 px checks remain open. |
| T10 | `assets/art/props/portal_b.png` | 512×512, RGBA, alpha 0–255 | **NEEDS_REVISION** | True-alpha and exact-size checks pass. Portal-pair silhouette IoU is 96.72%, not 100%; the strict identical-shape requirement fails. Fringe and 48 px checks remain open. |
| T11 | `assets/art/ui/ui_kit.png` | 2048×2048, RGBA, alpha 0–255 | **PENDING_REVIEW** | True-alpha and exact-size checks pass. Visual review counted 13 separated elements. Actual 9-slice stretching, individual crop/export safety, 48/24 px readability, and fringe quality were not verified. Upscaled from 1280×1280. |

## Batch-level check summary

- **Pass:** all 11 required filenames exist at the prescribed runtime paths; all are PNG; every file has the expected final dimensions.
- **Pass:** eight files have non-constant alpha and three files are opaque RGB. This verifies transparency presence, not clean fringe quality.
- **Pass:** the Light and Shadow background centre-contrast measurements are below the approximately 1.6:1 ceiling, and their mean luminance values strongly separate the phases.
- **Fail:** T04/T05 silhouettes are not identical (85.84% IoU).
- **Fail:** T09/T10 silhouettes are not identical (96.72% IoU versus required 100%).
- **Fail:** T02 side margins are approximately 6%, below the required 8%.
- **Fail:** `logo_primary.png` and `ui_kit.png` were upscaled rather than generated natively at 2048×2048; all three wides were also resized from non-native dimensions.
- **Pending:** full-batch visual style consistency, alpha fringe quality, required small-size legibility screenshots, background 9:16 crop and cross-dissolve, Goal small-size reading, UI 9-slice behavior, and runtime integration.

## Integration gate

Do not mark these files `DELIVERED`, `APPROVED`, or `SHIPPED`, and do not replace runtime placeholders, until the `NEEDS_REVISION` failures are resolved and the `PENDING_REVIEW` checks have evidence. No game code or integration was changed in this batch.
