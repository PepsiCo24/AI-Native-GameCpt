/**
 * `grid(x, y) → world(px, py)` — the **one** place the renderer converts between
 * logical cells and pixels (`docs/ui-ux.md` §2.1: "No entity computes its own
 * pixel position").
 *
 * Rules implemented here:
 * - §2.1 board container is a **square**, scale-to-fit, centered in the play area;
 *   `cellSize = floor(boardSide / max(width, height))`, the grid is centered
 *   inside the plate and leftover pixels become **outer padding, never stretched
 *   cells**; non-square grids keep square cells (letterboxed inside the plate).
 * - §2.2 board side margin **16 px**; R-L5 board capped at `min(playArea, 640 px)`.
 * - R-L3 gutter / corner radius are **derived** (`cellGutter` / `cellRadius`).
 * - R-L6 the render scale is `min(devicePixelRatio, 2)`; every CSS-px constant
 *   below is multiplied by it, so the layout is expressed in **device px** while
 *   the board stays visually the same size in CSS px.
 * - R-L7 layout is recomputed once per resize, never per frame.
 * - R-T3 the cell hit area is the cell rect **exactly** — no outward slop.
 */

import type { Level } from "@/core/level";
import type { Vec } from "@/core/state/types";
import { LAYOUT, cellGutter, cellRadius } from "@/game/theme/tokens";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface BoardLayout {
  /** Device px per cell (square, for both axes). */
  readonly cellSize: number;
  /** R-L3 visible gap between cells. */
  readonly gutter: number;
  /** R-L3 corner radius. */
  readonly radius: number;
  /** The board plate (R-L4 opaque surface behind the cells). */
  readonly plate: Rect;
  /** The area actually covered by cells (centered inside the plate). */
  readonly grid: Rect;
  readonly cols: number;
  readonly rows: number;
  /** `min(devicePixelRatio, 2)` — the constant that converts CSS px → device px. */
  readonly renderScale: number;
}

export interface Viewport {
  /** Play-area size in **device px** (already multiplied by the render scale). */
  readonly width: number;
  readonly height: number;
  /** `min(devicePixelRatio, 2)` (R-L6). */
  readonly renderScale: number;
}

/** Compute the board layout for a play-area box. Pure; call once per resize (R-L7). */
export function computeLayout(level: Level, viewport: Viewport): BoardLayout {
  const cols = level.width;
  const rows = level.height;
  const scale = viewport.renderScale;
  const longest = Math.max(cols, rows);

  const margin = LAYOUT.margin * scale;
  const maxBoard = LAYOUT.maxBoard * scale;
  // §2.1 square, scale-to-fit, capped (R-L5). Floor the side so the derived cell
  // size never exceeds the plate.
  const boardSide = Math.max(
    1,
    Math.floor(Math.min(viewport.width - margin * 2, viewport.height - margin * 2, maxBoard)),
  );
  const cellSize = Math.max(1, Math.floor(boardSide / longest));
  const gridSide = cellSize * longest;

  const plateX = Math.floor((viewport.width - boardSide) / 2);
  const plateY = Math.floor((viewport.height - boardSide) / 2);
  // §2.1: leftover pixels are outer padding inside the plate, never stretched cells.
  const gridX = plateX + Math.floor((boardSide - gridSide) / 2);
  const gridY = plateY + Math.floor((boardSide - gridSide) / 2);

  return {
    cellSize,
    gutter: cellGutter(cellSize),
    radius: cellRadius(cellSize),
    plate: { x: plateX, y: plateY, w: boardSide, h: boardSide },
    grid: { x: gridX, y: gridY, w: gridSide, h: gridSide },
    cols,
    rows,
    renderScale: scale,
  };
}

/** The full cell rect (hit area, R-T3). Visual inset comes from the gutter at draw time. */
export function cellRect(layout: BoardLayout, x: number, y: number): Rect {
  return {
    x: layout.grid.x + x * layout.cellSize,
    y: layout.grid.y + y * layout.cellSize,
    w: layout.cellSize,
    h: layout.cellSize,
  };
}

/** The drawn cell surface: the cell rect inset by half the gutter (R-L3). */
export function cellSurface(layout: BoardLayout, x: number, y: number): Rect {
  const rect = cellRect(layout, x, y);
  const inset = layout.gutter / 2;
  return {
    x: rect.x + inset,
    y: rect.y + inset,
    w: rect.w - layout.gutter,
    h: rect.h - layout.gutter,
  };
}

export function cellCenter(layout: BoardLayout, x: number, y: number): Vec {
  return {
    x: layout.grid.x + x * layout.cellSize + layout.cellSize / 2,
    y: layout.grid.y + y * layout.cellSize + layout.cellSize / 2,
  };
}

/**
 * Device px → cell, or `null` when the point is outside the grid (R-T3: a tap
 * outside the grid or on a non-adjacent cell is a **non-input**, never a rule
 * decision — see `src/game/input/input-map.ts`).
 */
export function cellAtPoint(layout: BoardLayout, px: number, py: number): Vec | null {
  const dx = px - layout.grid.x;
  const dy = py - layout.grid.y;
  if (dx < 0 || dy < 0) return null;
  const x = Math.floor(dx / layout.cellSize);
  const y = Math.floor(dy / layout.cellSize);
  if (x >= layout.cols || y >= layout.rows) return null;
  return { x, y };
}

/** Checker alternate for the cell plate (§4.3 `ground.cellAlt` — deliberately subtle). */
export function isAltCell(x: number, y: number): boolean {
  return (x + y) % 2 === 1;
}

/** R-T5: is the cell below the 44 px touch target (in CSS px)? */
export function cellSizeCss(layout: BoardLayout): number {
  return layout.cellSize / layout.renderScale;
}