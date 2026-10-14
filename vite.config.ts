import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Build / test toolchain only. No gameplay logic lives here.
// `src/core/**` must stay pure TypeScript: Phaser is never importable there
// (AGENTS.md §3, architecture-0001). Unit tests for core therefore run in the
// default `node` environment; DOM/Phaser tests opt into jsdom per file with
//   // @vitest-environment jsdom
export default defineConfig({
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
