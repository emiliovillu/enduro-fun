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
    //
    // `e2e/fixtures/serve.json` (T3.1): `serve-handler@6` (dependencia
    // transitiva de `serve`) resuelve el Content-Type con `mime-types@2.1.18`,
    // que fija `mime-db@~1.33.0` (2019, anterior al registro IANA de AVIF) —
    // sirve TODO `.avif` sin `Content-Type` alguno. Auditado con `curl -sv`:
    // confirmado en runtime, no es una suposición. Esto no afecta a estos E2E
    // (Chromium igualmente decodifica/renderiza AVIF por sniffing de
    // contenido), pero SÍ producía falsos "no es un formato moderno" en
    // Lighthouse al auditar el `out/` servido así (ver
    // `docs/verifications/T3.1/`) — Cloudflare Pages (producción real) no
    // tiene este problema, es un defecto propio de esta herramienta de
    // serving LOCAL. Por eso el fixture vive en `e2e/` (nunca en `public/`,
    // que se copia tal cual al artefacto de producción real) y se copia a
    // `out/serve.json` (donde `serve` lo busca) solo como parte de este
    // comando de test — el export de producción que sube a Cloudflare Pages
    // nunca lo contiene.
    command:
      'pnpm build && cp e2e/fixtures/serve.json out/serve.json && npx --yes serve out -p 3100 -n',
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // build completo + arranque de `serve`, antes tardaba <5s con next dev
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
