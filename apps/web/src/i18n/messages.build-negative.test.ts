import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

// Control negativo REAL de T0.2 (Playwright permanente, planning.md): quitar
// una clave de `de.json` debe romper `pnpm build`, porque `MessagesSchema`
// (packages/core) exige las 3 claves y `apps/web/src/i18n/messages.ts` la
// aplica a nivel de módulo (import time, ver ese fichero). Este test invoca
// el build DE VERDAD (no una aserción sobre el esquema aislado) sobre el
// fichero real, temporalmente roto, y lo restaura pase lo que pase.
//
// Riesgo residual aceptado (code review): esto muta un fichero TRACKEADO en
// disco y solo lo restaura en `afterEach`. Si el proceso muere de forma
// abrupta entre escribir el fixture roto y que `pnpm build` termine (OOM,
// SIGKILL, cancelación dura de CI), `afterEach` nunca corre y `de.json`
// queda con la clave `subtitle` borrada en el working tree. Mitigación
// proporcionada, no sobre-ingeniería (no se copia el repo entero a un
// tmpdir para un proyecto de 5 páginas/3 idiomas): la guarda de abajo
// rechaza mutar si `de.json` YA tiene cambios sin commitear respecto al
// índice de git — así nunca se pisa en silencio trabajo previo real. Un
// fichero recién creado y aún sin commitear (`??`, sin baseline en git que
// proteger) SÍ se deja mutar: si un SIGKILL lo deja roto a medio escribir,
// no hay historial que perder — `git diff`/`status` lo señala como
// "contenido inesperado" en un fichero ya marcado como pendiente, nunca
// como una regresión silenciosa sobre algo commiteado.

const relPath = 'apps/web/src/messages/de.json';
const dePath = fileURLToPath(new URL('../messages/de.json', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const originalDe = readFileSync(dePath, 'utf8');

beforeAll(() => {
  const status = execFileSync('git', ['status', '--porcelain', '--', relPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const isTrackedWithPendingEdits = status.trim() !== '' && !status.startsWith('??');
  if (isTrackedWithPendingEdits) {
    throw new Error(
      `${relPath} tiene cambios sin commitear (${status.trim()}) — abortando el control ` +
        'negativo para no pisarlos en silencio. Commitea o descarta esos cambios antes de ' +
        're-ejecutar este test.',
    );
  }
});

afterEach(() => {
  writeFileSync(dePath, originalDe);
});

describe('esquema de mensajes: control negativo de build', () => {
  it('quitar home.subtitle de de.json rompe `pnpm build`', () => {
    const broken = JSON.parse(originalDe) as { home: Record<string, string> };
    delete broken.home.subtitle;
    writeFileSync(dePath, JSON.stringify(broken, null, 2));

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
    // El error de Zod nombra la clave/ruta que falta — evita que el test
    // pase "en falso" por un fallo de build no relacionado (ej. typo
    // accidental en otro fichero durante un refactor futuro).
    expect(stderr).toMatch(/subtitle/i);
  }, 45_000);
});
