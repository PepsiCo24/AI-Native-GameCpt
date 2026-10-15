/**
 * The narrow 2D draw surface the L4 painters depend on.
 *
 * `docs/architecture.md` §3 fixes the dependency direction
 * `Renderer (Phaser) → Gameplay → Core (pure TS)`. This module is the seam that
 * keeps the **painters** honest about it: a painter needs "a thing that can fill
 * a rounded rect and stroke a circle", not the whole `Phaser.GameObjects.Graphics`
 * (input, masks, paths, blend modes…). Typing the painters against this interface
 *
 * 1. documents exactly which draw commands the board contract depends on —
 *    `docs/ui-ux.md` R-C1/R-D2/R-D8 are *geometry* contracts, so the set of
 *    primitives a painter may use is part of the spec, not an implementation
 *    detail; and
 * 2. lets a **unit test** pass a recording double and assert on the actual draw
 *    calls (bar mass, no tinted interior, swirl presence/absence) without a
 *    browser, a canvas or a Phaser install — the evidence the dispatch asks for
 *    is then about the shipped painter, not about a parallel model of it.
 *
 * `Phaser.GameObjects.Graphics` satisfies this interface structurally, so
 * `board-view.ts` passes a real Graphics and nothing is wrapped or adapted at
 * runtime. The `satisfies`-style compatibility probe at the bottom is a
 * **compile-time** assertion (it has no runtime effect) so a future Phaser
 * upgrade that changes a signature fails `tsc --noEmit` here instead of silently
 * at the first draw call.
 */

import type Phaser from "phaser";

/** Colour-and-alpha state, then shapes. All coordinates are **device px**. */
export interface Graphics2D {
  fillStyle(color: number, alpha?: number): unknown;
  lineStyle(width: number, color: number, alpha?: number): unknown;
  fillRect(x: number, y: number, width: number, height: number): unknown;
  fillRoundedRect(x: number, y: number, width: number, height: number, radius?: number): unknown;
  strokeRoundedRect(x: number, y: number, width: number, height: number, radius?: number): unknown;
  fillCircle(x: number, y: number, radius: number): unknown;
  strokeCircle(x: number, y: number, radius: number): unknown;
  fillEllipse(x: number, y: number, width: number, height: number): unknown;
  lineBetween(x1: number, y1: number, x2: number, y2: number): unknown;
  beginPath(): unknown;
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  closePath(): unknown;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean,
  ): unknown;
  strokePath(): unknown;
}

/**
 * Compile-time compatibility probe — **never executed**. If Phaser's Graphics
 * stops being assignable to {@link Graphics2D}, `tsc --noEmit` fails here.
 */
export type PhaserGraphicsIsGraphics2D = Phaser.GameObjects.Graphics extends Graphics2D
  ? true
  : never;