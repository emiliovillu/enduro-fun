import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

// Control negativo REAL de T2.1 (Playwright permanente, planning.md):
// `PackageSchema` (packages/core, PRD §7) exige `LocalizedTextSchema` (las 3
// claves en/es/de) en `name`/`description`/cada elemento de `features`, y
// `apps/web/src/data/packages.ts` aplica `PackageSchema.parse(...)` a nivel
// de MÓDULO (import time) sobre `PACKAGES` — así que un paquete con una
// traducción alemana ausente rompe `next build` entero (SSG importa este
// fichero desde la página), no solo el render. Este test invoca `pnpm build`
// DE VERDAD (no una aserción aislada sobre el esquema) sobre el fichero
// real, temporalmente roto (quita `de` de un `features[]` del paquete
// Getaway), y lo restaura pase lo que pase.
//
// Mismo patrón de backup en disco que
// `apps/web/src/i18n/messages.build-negative.test.ts` (T1.1): un snapshot de
// `packages.ts` se escribe a `os.tmpdir()` (fuera del repo) antes de mutar,
// nombrado con `process.pid` para aislar ejecuciones concurrentes, y se
// borra tras restaurar con éxito — así el contenido previo sobrevive a un
// crash abrupto del proceso (SIGKILL, OOM) que impediría que `afterEach`
// corriera.
const packagesPath = fileURLToPath(new URL('./packages.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const backupPath = join(
  tmpdir(),
  `endurofun-packages-ts-build-negative.${String(process.pid)}.bak.ts`,
);
const originalPackages = readFileSync(packagesPath, 'utf8');

beforeAll(() => {
  if (existsSync(backupPath)) {
    throw new Error(
      `Se encontró un backup de una ejecución anterior en ${backupPath} — probablemente un ` +
        `crash dejó ${packagesPath} a medio escribir en una ejecución previa de este test. ` +
        'Recupera manualmente desde ese backup (o bórralo si ya se resolvió) antes de re-ejecutar.',
    );
  }
  writeFileSync(backupPath, originalPackages);
});

afterEach(() => {
  writeFileSync(packagesPath, originalPackages);
  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }
});

describe('PackageSchema (vía packages.ts): control negativo de build', () => {
  it('quitar la clave `de` de un feature de Getaway rompe `pnpm build`', () => {
    // Quita la línea `de: '...',` de la primera feature del paquete Getaway
    // (única en el fichero — "4 nights, breakfast included" solo aparece en
    // esa entrada), dejando `features[0]` sin traducción alemana.
    const broken = originalPackages.replace(
      /(en: '4 nights, breakfast included',\s*\n\s*es: '4 noches, desayuno incluido',\s*\n)\s*de: '4 Nächte, Frühstück inklusive',\n/,
      '$1',
    );
    expect(broken).not.toBe(originalPackages);
    writeFileSync(packagesPath, broken);

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
    // El error de Zod nombra la ruta que falta (`features` + índice + `de`)
    // — evita que el test pase "en falso" por un fallo de build no
    // relacionado (ej. un typo accidental en otro fichero durante un
    // refactor futuro).
    expect(stderr).toMatch(/features/i);
    expect(stderr).toMatch(/\bde\b/);
  }, 45_000);
});
