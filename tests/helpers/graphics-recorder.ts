/**
 * `tests/helpers/graphics-recorder.ts` — a **recording `Graphics2D` double**.
 *
 * Why this exists (Gameplay R-002): the L4 painters (`objects/door.ts`,
 * `switch.ts`, `portal.ts`, `glyph.ts`) are typed against the narrow
 * {@link Graphics2D} seam, not against `Phaser.GameObjects.Graphics`. §3.1b's
 * door contract, §3.1's switch silhouette and §3.1c's swirl-presence channel are
 * **geometry** contracts, so the evidence for them must be the *draw calls the
 * shipped painter actually makes* — not a screenshot, not a screenshot-model, and
 * not a second implementation of the same shapes inside a test.
 *
 * This double is the whole of the test-side surface: it records every call in
 * order (op + arguments) and returns `undefined`, which is assignable to
 * `Graphics2D`'s `unknown` returns. It touches no canvas, no DOM and no Phaser,
 * so it runs in the default `node` Vitest environment.
 *
 * `lineStyle` **is** stateful here (unlike Phaser, where it is too): each shape
 * call records the stroke/fill style in effect, because "the swirl is drawn at
 * 1.5 px while the outline is 2 px" is part of §3.1c's subordination claim and a
 * bare call list could not express it.
 */

import type { Graphics2D } from "@/game/renderer/objects/graphics2d";

/** One recorded draw call, with the colour state that was active when it ran. */
export interface DrawCall {
  readonly op: string;
  readonly args: readonly number[];
  /** `fillStyle` colour in effect, or `null` for stroke/primitive calls. */
  readonly fill: number | null;
  readonly fillAlpha: number | null;
  /** `lineStyle` colour in effect, or `null` for fill/primitive calls. */
  readonly stroke: number | null;
  readonly strokeWidth: number | null;
  readonly strokeAlpha: number | null;
}

export class RecordingGraphics implements Graphics2D {
  readonly calls: DrawCall[] = [];

  private fill: number | null = null;
  private fillAlpha: number | null = null;
  private stroke: number | null = null;
  private strokeWidth: number | null = null;
  private strokeAlpha: number | null = null;

  /* ── style ─────────────────────────────────────────────────────────────── */

  fillStyle(color: number, alpha = 1): void {
    this.fill = color;
    this.fillAlpha = alpha;
  }

  lineStyle(width: number, color: number, alpha = 1): void {
    this.stroke = color;
    this.strokeWidth = width;
    this.strokeAlpha = alpha;
  }

  /* ── shapes ────────────────────────────────────────────────────────────── */

  fillRect(x: number, y: number, width: number, height: number): void {
    this.record("fillRect", [x, y, width, height], "fill");
  }

  fillRoundedRect(x: number, y: number, width: number, height: number, radius = 0): void {
    this.record("fillRoundedRect", [x, y, width, height, radius], "fill");
  }

  strokeRoundedRect(x: number, y: number, width: number, height: number, radius = 0): void {
    this.record("strokeRoundedRect", [x, y, width, height, radius], "stroke");
  }

  fillCircle(x: number, y: number, radius: number): void {
    this.record("fillCircle", [x, y, radius], "fill");
  }

  strokeCircle(x: number, y: number, radius: number): void {
    this.record("strokeCircle", [x, y, radius], "stroke");
  }

  fillEllipse(x: number, y: number, width: number, height: number): void {
    this.record("fillEllipse", [x, y, width, height], "fill");
  }

  lineBetween(x1: number, y1: number, x2: number, y2: number): void {
    this.record("lineBetween", [x1, y1, x2, y2], "stroke");
  }

  /* ── paths ─────────────────────────────────────────────────────────────── */

  beginPath(): void {
    this.record("beginPath", [], null);
  }

  moveTo(x: number, y: number): void {
    this.record("moveTo", [x, y], null);
  }

  lineTo(x: number, y: number): void {
    this.record("lineTo", [x, y], null);
  }

  closePath(): void {
    this.record("closePath", [], null);
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
    this.record("arc", [x, y, radius, startAngle, endAngle], null);
  }

  strokePath(): void {
    this.record("strokePath", [], "stroke");
  }

  /* ── read helpers ──────────────────────────────────────────────────────── */

  /** Every recorded call of one op, in order. */
  of(op: string): readonly DrawCall[] {
    return this.calls.filter((call) => call.op === op);
  }

  /** The ops, in order — for "the first thing drawn is the frame" style claims. */
  get ops(): readonly string[] {
    return this.calls.map((call) => call.op);
  }

  private record(op: string, args: readonly number[], kind: "fill" | "stroke" | null): void {
    this.calls.push({
      op,
      args,
      fill: kind === "fill" ? this.fill : null,
      fillAlpha: kind === "fill" ? this.fillAlpha : null,
      stroke: kind === "stroke" ? this.stroke : null,
      strokeWidth: kind === "stroke" ? this.strokeWidth : null,
      strokeAlpha: kind === "stroke" ? this.strokeAlpha : null,
    });
  }
}