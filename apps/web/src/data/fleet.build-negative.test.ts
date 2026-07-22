import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

// Control negativo REAL de TD.12 (Playwright permanente, planning.md), mismo
// patrón que `apps/web/src/data/packages.build-negative.test.ts` (T2.1):
// `FleetBikeSchema` (packages/core) exige `LocalizedTextSchema` (las 3 claves
// en/es/de) en `description`, y `apps/web/src/data/fleet.ts` aplica
// `FleetBikeSchema.parse(...)` a nivel de MÓDULO (import time) sobre `FLEET`
// — así que una moto con una traducción alemana ausente rompe `next build`
// entero (SSG importa este fichero desde `about/page.tsx`), no solo el
// render. Este test invoca `pnpm build` DE VERDAD sobre el fichero real,
// temporalmente roto (quita `de` de la descripción de la Norden 901), y lo
// restaura pase lo que pase.
//
// Mismo patrón de backup en disco que `packages.build-negative.test.ts`: un
// snapshot de `fleet.ts` se escribe a `os.tmpdir()` (fuera del repo) antes de
// mutar, nombrado con `process.pid` para aislar ejecuciones concurrentes, y
// se borra tras restaurar con éxito.
const fleetPath = fileURLToPath(new URL('./fleet.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const backupPath = join(
  tmpdir(),
  `endurofun-fleet-ts-build-negative.${String(process.pid)}.bak.ts`,
);
const originalFleet = readFileSync(fleetPath, 'utf8');

beforeAll(() => {
  if (existsSync(backupPath)) {
    throw new Error(
      `Se encontró un backup de una ejecución anterior en ${backupPath} — probablemente un ` +
        `crash dejó ${fleetPath} a medio escribir en una ejecución previa de este test. ` +
        'Recupera manualmente desde ese backup (o bórralo si ya se resolvió) antes de re-ejecutar.',
    );
  }
  writeFileSync(backupPath, originalFleet);
});

afterEach(() => {
  writeFileSync(fleetPath, originalFleet);
  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }
});

describe('FleetBikeSchema (vía fleet.ts): control negativo de build', () => {
  it('quitar la clave `de` de la descripción de la Norden 901 rompe `pnpm build`', () => {
    const broken = originalFleet.replace(
      /(en: 'Long-distance comfort for open trails and multi-day touring\.',\s*\n\s*es: 'Comodidad para largas distancias en pistas abiertas y rutas de varios días\.',\n)\s*de: 'Komfort für lange Strecken auf offenen Pisten und mehrtägige Touren\.',\n/,
      '$1',
    );
    expect(broken).not.toBe(originalFleet);
    writeFileSync(fleetPath, broken);

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
    // El error de Zod nombra la ruta que falta (`description` + `de`) —
    // evita que el test pase "en falso" por un fallo de build no relacionado.
    expect(stderr).toMatch(/description/i);
    expect(stderr).toMatch(/\bde\b/);
  }, 45_000);
});
