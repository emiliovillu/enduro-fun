import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

// Control negativo REAL de T0.2 (Playwright permanente, planning.md): quitar
// una clave de `de.json` debe romper `pnpm build`, porque `MessagesSchema`
// (packages/core) exige las 3 claves y `apps/web/src/i18n/messages.ts` la
// aplica a nivel de módulo (import time, ver ese fichero). Este test invoca
// el build DE VERDAD (no una aserción sobre el esquema aislado) sobre el
// fichero real, temporalmente roto, y lo restaura pase lo que pase.
//
// Riesgo residual: esto muta un fichero TRACKEADO en disco y solo lo
// restaura en `afterEach`. Si el proceso muere de forma abrupta entre
// escribir el fixture roto y que `pnpm build` termine (OOM, SIGKILL,
// cancelación dura de CI), `afterEach` nunca corre.
//
// Mitigación (T1.1, reemplaza la guarda original de T0.2): un snapshot de
// `de.json` se escribe a un fichero de backup EN DISCO (`os.tmpdir()`, fuera
// del repo) antes de mutar, y se borra tras restaurar con éxito — así el
// contenido previo sobrevive aunque el PROCESO no lo haga (a diferencia de
// `originalDe`, que solo vive en el heap de un proceso que un SIGKILL mata
// junto con el resto). La guarda original de T0.2 bloqueaba el test entero
// si `de.json` tenía cambios sin commitear respecto a git — con buena
// intención (no pisar trabajo real en silencio), pero un `git status` sucio
// es precisamente el estado NORMAL de `de.json` durante cualquier tarea que
// añada contenido real (T1.1 y sucesivas: el implementer nunca commitea a
// mitad de tarea), así que la guarda hacía este control negativo
// imposible de correr en el flujo de desarrollo real — sin aportar
// seguridad adicional sobre la del backup en disco (el riesgo de perder
// trabajo ante un crash es el mismo con o sin cambios pendientes; lo que
// protege de verdad es que el contenido sobreviva en un fichero aparte, no
// el estado de git). Si queda un backup de una ejecución anterior sin
// limpiar (señal de que un crash real dejó `de.json` a medio escribir), el
// test aborta pidiendo recuperación manual en vez de pisarlo.
const dePath = fileURLToPath(new URL('../messages/de.json', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
// `process.pid` en el nombre: aísla ejecuciones concurrentes en la misma
// máquina (2 workers, un `pnpm test` local solapado con el gate del bucle,
// 2 checkouts en el mismo runner de CI) — sin esto, la segunda ejecución
// encontraría el backup de la primera y abortaría con el mensaje de "crash
// previo", un falso positivo que confunde colisión de concurrencia con un
// crash real (code review de T1.1).
const backupPath = join(
  tmpdir(),
  `endurofun-de-json-build-negative.${String(process.pid)}.bak.json`,
);
const originalDe = readFileSync(dePath, 'utf8');

beforeAll(() => {
  if (existsSync(backupPath)) {
    throw new Error(
      `Se encontró un backup de una ejecución anterior en ${backupPath} — probablemente un ` +
        `crash dejó ${dePath} a medio escribir en una ejecución previa de este test. Recupera ` +
        'manualmente desde ese backup (o bórralo si ya se resolvió) antes de re-ejecutar.',
    );
  }
  writeFileSync(backupPath, originalDe);
});

afterEach(() => {
  writeFileSync(dePath, originalDe);
  if (existsSync(backupPath)) {
    unlinkSync(backupPath);
  }
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
