/**
 * Toolchain placeholder — NOT gameplay code.
 *
 * TODO(GAME-001): replace this file with the Phaser bootstrap that mounts the
 * board scene. Ownership of `src/main.ts` transfers to the Gameplay Engineer the
 * moment GAME-001 starts; the Orchestrator will not touch it again.
 *
 * Its only purpose is to prove that the Vite + TypeScript toolchain builds and
 * runs in the browser before any feature work begins.
 */
const app = document.getElementById('app');

if (app) {
  app.textContent =
    'Phase Shift: Echo Grid — toolchain OK. Awaiting GAME-001 renderer.';
}
