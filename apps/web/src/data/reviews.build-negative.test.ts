import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

// Control negativo REAL de T2.2 (Playwright permanente, planning.md), mismo
// patrón que `packages.build-negative.test.ts` (T2.1): `ReviewSchema`
// (packages/core, PRD §7) exige `LocalizedTextSchema` (las 3 claves
// en/es/de) en `text`, y `apps/web/src/data/reviews.ts` aplica
// `ReviewSchema.parse(...)` a nivel de MÓDULO (import time) sobre cada
// elemento de `RAW_REVIEWS` — así que una review con una traducción alemana
// ausente rompe `next build` entero (SSG importa este fichero desde Home Y
// desde `/reviews`), no solo el render. Este test invoca `pnpm build` DE
// VERDAD (no una aserción aislada sobre el esquema) sobre el fichero real,
// temporalmente roto (quita `de` del texto de Lars), y lo restaura pase lo
// que pase.
//
// Mismo patrón de backup en disco que `packages.build-negative.test.ts`: un
// snapshot de `reviews.ts` se escribe a `os.tmpdir()` (fuera del repo) antes
// de mutar, nombrado con `process.pid` para aislar ejecuciones concurrentes,
// y se borra tras restaurar con éxito — así el contenido previo sobrevive a
// un crash abrupto del proceso (SIGKILL, OOM) que impediría que `afterEach`
// corriera.
const reviewsPath = fileURLToPath(new URL('./reviews.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const backupPath = join(
  tmpdir(),
  `endurofun-reviews-ts-build-negative.${String(process.pid)}.bak.ts`,
);
const originalReviews = readFileSync(reviewsPath, 'utf8');

beforeAll(() => {
  if (existsSync(backupPath)) {
    throw new Error(
      `Se encontró un backup de una ejecución anterior en ${backupPath} — probablemente un ` +
        `crash dejó ${reviewsPath} a medio escribir en una ejecución previa de este test. ` +
        'Recupera manualmente desde ese backup (o bórralo si ya se resolvió) antes de re-ejecutar.',
    );
  }
  writeFileSync(backupPath, originalReviews);
});

afterEach(() => {
  writeFileSync(reviewsPath, originalReviews);
  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }
});

describe('ReviewSchema (vía reviews.ts): control negativo de build', () => {
  it('quitar la clave `de` del texto de Lars rompe `pnpm build`', () => {
    // Quita la línea `de: '...',` de la review de Lars (única en el
    // fichero — "Die Guides kennen jeden Zentimeter" solo aparece ahí),
    // dejando su `text` sin traducción alemana.
    const broken = originalReviews.replace(
      /(en: 'The guides know every inch of that terrain\. Never felt unsafe, always felt challenged\.',\s*\n\s*es: 'Los guías conocen cada rincón de ese terreno\. Nunca me sentí inseguro, siempre desafiado\.',\n)\s*de: 'Die Guides kennen jeden Zentimeter des Geländes\. Nie unsicher gefühlt, immer gefordert\.',\n/,
      '$1',
    );
    expect(broken).not.toBe(originalReviews);
    writeFileSync(reviewsPath, broken);

    let failed = false;
    let stderr = '';
    try {
      execFileSync('pnpm', ['--filter', '@app/web', 'build'], {
        cwd: repoRoot,
        stdio: 'pipe',
      });
    } catch (error) {
      failed = true;
      stderr = String((error as { stderr?: Buffer }).stderr ?? error);
    }

    expect(failed).toBe(true);
    // El error de Zod nombra la ruta que falta (`text` + `de`) — evita que
    // el test pase "en falso" por un fallo de build no relacionado (ej. un
    // typo accidental en otro fichero durante un refactor futuro).
    expect(stderr).toMatch(/text/i);
    expect(stderr).toMatch(/\bde\b/);
  }, 45_000);
});
