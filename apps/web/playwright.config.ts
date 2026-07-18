import { defineConfig, devices } from '@playwright/test';

// Desviación deliberada respecto al `e2e-stack.ts` canónico de
// testing/references/e2e.md §2 (documentada aquí, como el resto de
// desviaciones del proyecto): ese script orquesta Postgres/testcontainer/
// worker — este proyecto NO tiene BD ni worker (es una web 100% estática,
// PRD §6.2/§6.3). El `webServer` aquí es mínimo: build + servir el export
// estático real (`out/`). Nada de testcontainer, nada de seeds, nada de
// fake APIs (no hay APIs externas que mockear en F0).
//
// Deliberadamente NO `next dev` (código anterior, corregido en code review):
// `next dev` normaliza rutas de forma transparente (`/en` ⇄ `/en/`) y
// esconde justo el tipo de discrepancia que un host sin servidor
// (Cloudflare Pages sirviendo `out/` tal cual) puede NO resolver — la
// suite debe ejercitar el mismo artefacto (`out/en/index.html`, etc.) que
// produce `trailingSlash: true` y que consume producción. `next start`
// tampoco sirve: `output: 'export'` no genera servidor de producción
// arrancable.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // `serve` no tiene fallback de directorio a `index.html` para rutas
    // "limpias" salvo `-s` (SPA) — no lo queremos (serviría 404.html mal).
    // Con `trailingSlash: true` cada ruta YA es una carpeta con su propio
    // `index.html` (`out/en/index.html`…), así que `serve` estático plano
    // basta sin flags especiales; `-n` desactiva el prompt de analítica.
    command: 'pnpm build && npx --yes serve out -p 3100 -n',
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // build completo + arranque de `serve`, antes tardaba <5s con next dev
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
