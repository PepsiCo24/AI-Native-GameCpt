/**
 * UA-0011 — post-capture formula cross-check (Entry-3 pitch-governance method 3 class):
 * computeLayout (the production module, RUN not edited) against the canvas dims the
 * driver OBSERVED, compared to the driver's measured plate-scan geometry.
 * Run: cd <worktree> && npx tsx --tsconfig tsconfig.json <this file>
 */
import { readFileSync } from "node:fs";

import { LevelSchema } from "@/core/level";
import { computeLayout } from "@/game/renderer/grid-mapping";

const WT = "/Users/Admin/.local/share/opencode/worktree/f9a5d9/ua-0011-capture";
const OUT = "/private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/ua0011-out";

const rows: string[] = [];
for (const id of [12, 13, 14, 15]) {
  const level = LevelSchema.parse(JSON.parse(readFileSync(`${WT}/src/levels/l${String(id).padStart(3, "0")}.json`, "utf8")));
  const log = JSON.parse(readFileSync(`${OUT}/capture-log-l${String(id).padStart(3, "0")}.json`, "utf8")) as Array<Record<string, unknown>>;
  for (const rec of log) {
    if (typeof rec["where"] !== "string" || !rec["where"].includes("geometry")) continue;
    const canvas = rec["canvas"] as [number, number];
    const measuredCell = rec["cellSizeDevice"] as number;
    const measuredSpan = (rec["plateSpanDevice"] as [number, number])[0];
    const layout = computeLayout(level, { width: canvas[0], height: canvas[1], renderScale: 2 });
    rows.push(
      [
        `L${String(id)}`,
        String(rec["viewport"]),
        `canvas ${String(canvas[0])}x${String(canvas[1])}`,
        `formula boardSide ${String(layout.plate.w)} cellSize ${String(layout.cellSize)} (pitch ${String(layout.cellSize / 2)} CSS)`,
        `measured span ${String(measuredSpan)} cellSize ${String(measuredCell)} (pitch ${String(rec["pitchCSS"] as number)} CSS)`,
        layout.cellSize === measuredCell && layout.plate.w === measuredSpan ? "MATCH" : "MISMATCH",
      ].join(" | "),
    );
  }
}
console.log(rows.join("\n"));
