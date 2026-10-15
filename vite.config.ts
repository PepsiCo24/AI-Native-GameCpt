import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Build / test toolchain only. No gameplay logic lives here.
// `src/core/**` must stay pure TypeScript: Phaser is never importable there
// (AGENTS.md §3, architecture-0001). Unit tests for core therefore run in the
// default `node` environment; DOM/Phaser tests opt into jsdom per file with
//   // @vitest-environment jsdom
export default defineConfig({
  // GitHub Pages serves this repo under a subpath (/AI-Native-GameCpt/).
  // Relative asset URLs make the SAME dist work from the subpath, a repo root,
  // or a plain `file:`/preview server — no env-specific base juggling.
  base: "./",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
