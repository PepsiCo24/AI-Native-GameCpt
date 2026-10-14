/**
 * §12.1 import-boundary gate — the automated enforcement arm of ADR-0003.
 *
 * `docs/architecture.md` §12.1: a Vitest suite MUST statically verify the
 * dependency direction and fail the build on violation. `src/core/**` (including
 * `src/core/solver/**` once it exists) must never import `phaser`, in any of the
 * forms `from "phaser"`, `import "phaser"`, `require("phaser")` or
 * `import("phaser")`. It must also never import `src/game/**` (AGENTS.md §3).
 *
 * This is *static source analysis*: files are read and matched, never executed.
 * No browser, no Phaser install needed.
 */

import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

const CORE_DIR = fileURLToPath(new URL("../../src/core/", import.meta.url));

/** Every file under `src/core/**`, recursively. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

interface SourceSpec {
  file: string;
  specifier: string;
}

/**
 * Extract every module specifier from a source text: static imports/exports,
 * side-effect imports, dynamic `import(...)` and CommonJS `require(...)`.
 *
 * Written as an exported, reusable scanner so the gate can prove it is not
 * vacuous — {@link phaserFindings} is exercised on synthetic snippets below.
 */
export function moduleSpecifiers(text: string): string[] {
  const patterns: RegExp[] = [
    /\bfrom\s*['"]([^'"]+)['"]/g, // import … from / export … from
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // dynamic import(...)
    /\bimport\s*['"]([^'"]+)['"]/g, // side-effect import "…"
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // require("…")
  ];
  const out: string[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier !== undefined) out.push(specifier);
    }
  }
  return out;
}

/** Specifiers that import Phaser (bare `phaser` or a `phaser/…` subpath). */
export function phaserFindings(text: string): string[] {
  return moduleSpecifiers(text).filter(
    (specifier) => specifier === "phaser" || specifier.startsWith("phaser/"),
  );
}

/** Specifiers whose path segments include `game` (would reach `src/game/**`). */
export function gameFindings(text: string): string[] {
  return moduleSpecifiers(text).filter((specifier) =>
    /(^|[/@])game([/]|$)/.test(specifier),
  );
}

describe("import boundary — src/core/** is pure TypeScript (§12.1, ADR-0003)", () => {
  const files = walk(CORE_DIR);

  it("scans a non-empty set of core source files", () => {
    // A vacuous scan is worse than no scan: this pins that the walker found the
    // real `src/core/**` tree (currently state/, rules/, level/).
    expect(files.length).toBeGreaterThanOrEqual(10);
    expect(files.some((f) => f.endsWith(`${sep}rules${sep}applyMove.ts`))).toBe(true);
  });

  it("no file under src/core/** references phaser, in any import form", () => {
    const violations: SourceSpec[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const specifier of phaserFindings(text)) {
        violations.push({ file: relative(CORE_DIR, file), specifier });
      }
    }
    expect(violations).toEqual([]);
  });

  it("no file under src/core/** imports src/game/**", () => {
    const violations: SourceSpec[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const specifier of gameFindings(text)) {
        violations.push({ file: relative(CORE_DIR, file), specifier });
      }
    }
    expect(violations).toEqual([]);
  });

  it("the detector itself catches every phaser import form (non-vacuous)", () => {
    const samples = [
      `import Phaser from "phaser";`,
      `import Phaser from 'phaser';`,
      `import "phaser";`,
      `import 'phaser';`,
      `const P = await import("phaser");`,
      `const P = await import('phaser');`,
      `const P = require("phaser");`,
      `require('phaser');`,
      `import { Scene } from "phaser/plugins";`,
      `export { Game } from "phaser";`,
    ];
    for (const sample of samples) {
      expect(phaserFindings(sample), `should flag: ${sample}`).not.toEqual([]);
    }
  });

  it("the detector does not flag prose mentioning Phaser or unrelated modules", () => {
    // Core files legitimately say "never import Phaser" in comments; that must
    // not fail the gate. Only real module specifiers count.
    const clean = [
      `// src/core must never import Phaser (AGENTS.md §3).`,
      `import { z } from "zod";`,
      `import type { Level } from "@/core/level";`,
      `import { applyMove } from "./applyMove";`,
    ];
    for (const sample of clean) {
      expect(phaserFindings(sample), `should not flag: ${sample}`).toEqual([]);
    }
  });
});