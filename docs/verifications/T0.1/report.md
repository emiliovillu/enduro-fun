# Verificación T0.1 — Monorepo y esqueleto de proyecto (adaptado, sin DB/worker)

- **Tarea**: T0.1 · Monorepo y esqueleto de proyecto (adaptado, sin DB/worker) (`planning.md`)
- **Fecha**: 2026-07-17
- **Ejecutor**: verifier (contexto fresco) · agent-browser 0.32.1 · sesión `t01`
- **Sistema**: commit `75e0a3f` (HEAD) + diff de la tarea staged en el índice (nuevo monorepo pnpm: `apps/web` Next.js App Router `output: 'export'`, `packages/core` con contratos Zod) + 2 fixes post-review sin stagear en `.prettierignore` y `apps/web/tsconfig.json` (verificados incluidos en la ejecución: `git diff` confirmado antes de empezar). Sin Postgres/worker (no aplica a este proyecto — web estática).

## Verificación esperada (literal de planning.md)
> `pnpm build` genera `apps/web/out/index.html` sin errores; `pnpm gate` en verde; servir `out/` con un servidor estático local (`npx serve out` o equivalente) y comprobar en el navegador que la página raíz carga; romper a propósito un tipo de `packages/core` rompe la compilación de `apps/web` (control negativo).

## Pasos ejecutados
1. `git status`/`git diff --cached --stat` para confirmar alcance del diff y que no hay `pnpm dev` vivo (`pgrep -fl "next dev"` vacío) → confirmado, sistema limpio, código bajo verificación es el del diff staged + 2 fixes unstaged post-review.
2. `pnpm install --frozen-lockfile` → lockfile al día, sin cambios.
3. `pnpm gate` desde la raíz → **verde** (lint con 5 warnings preexistentes de terceros — `import-x/no-named-as-default-member` en `eslint.config.ts` y `scripts/readme-status.mjs`, 0 errores —, typecheck OK, format:check OK, knip OK, readme:status:check OK, `pnpm test` 3/3 tests OK). Output completo en `gate-output.txt`.
4. `rm -rf apps/web/out apps/web/.next` y `pnpm build` desde la raíz → **compila sin errores**, genera `apps/web/out/index.html` (verificado con `ls -la`). Output completo en `build-output.txt`.
5. Serví `apps/web/out/` con `npx serve -l 4173 .` y comprobé con `curl` que la raíz responde HTTP 200 con el HTML esperado (`<title>EnduroFun</title>`, `Hello EnduroFun`).
6. Sesión de navegador real con `agent-browser` (`open http://localhost:4173/`, `snapshot -i`, `get text body`) → la página raíz carga en el navegador: heading `Hello EnduroFun` visible, párrafo "Enduro guiado en Álora, Málaga." visible. Consola y errores del navegador limpios (`console`/`errors` sin salida). Screenshot `01-index.png`.
7. **Control negativo**: edité `packages/core/src/contracts/company.ts`, renombrando el campo requerido `name` → `fullName` en `CompanySchema`. Ejecuté `pnpm --filter @app/web typecheck` → **FALLA** (`TS2353`/`TS2339`, `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`, exit status 2). Ejecuté `pnpm --filter @app/web build` → **FALLA** (`Type error` en `page.tsx:8:3`, `next build` worker exit code 1, `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`). Confirmado: un campo requerido roto en `packages/core` rompe la compilación de `apps/web`.
8. Reverí el cambio (`name` de vuelta) y confirmé `git diff -- packages/core/src/contracts/company.ts` vacío (revert limpio, sin residuo). Reejecuté `pnpm --filter @app/web typecheck` y `pnpm --filter @app/web build` → ambos **verdes** de nuevo. Output completo (los 4 pasos: fallo typecheck, fallo build, revert, éxito typecheck, éxito build) en `negative-control.txt`.
9. Limpieza: maté el proceso `serve`, borré `apps/web/out` y `apps/web/.next` generados durante la verificación.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm build` genera `apps/web/out/index.html` sin errores | Build completo sin errores, `index.html` presente en `apps/web/out/` | `build-output.txt` | ✅ |
| 2 | `pnpm gate` en verde | lint/typecheck/format/knip/readme-status/test todos OK (0 errores; 5 warnings preexistentes de terceros, no bloqueantes) | `gate-output.txt` | ✅ |
| 3 | Servir `out/` y comprobar en el navegador que la página raíz carga | `npx serve` en :4173, `agent-browser` abrió la URL real, snapshot muestra heading "Hello EnduroFun" y párrafo, consola sin errores | `01-index.png`, `browser-console.txt`, `browser-errors.txt` | ✅ |
| 4 | Romper un tipo de `packages/core` rompe la compilación de `apps/web` (control negativo) | Renombrar campo requerido `name`→`fullName` en `CompanySchema` rompió `typecheck` y `build` de `apps/web` con errores TS claros; revertido y vuelve a compilar limpio | `negative-control.txt` | ✅ |

## Coste real
$0 — sin APIs de pago, todo local (pnpm, Next.js build, agent-browser contra localhost).

## Veredicto
**PASS** — los 4 puntos literales de la Verificación se ejecutaron contra el sistema real (no simulado) y se observaron correctamente: build limpio con `index.html` generado, gate verde, carga real en navegador vía `agent-browser` con consola limpia, y control negativo que rompe y luego repara la compilación cruzada `packages/core` → `apps/web`.

Notas: los 5 warnings de ESLint (`import-x/no-named-as-default-member` en `eslint.config.ts` y `scripts/readme-status.mjs`) son ruido conocido de la interacción CJS/ESM de `typescript-eslint`/`prettier` bajo `import-x`, no bloquean el gate (0 errores) y no son responsabilidad de esta tarea — se anotan por transparencia, no como hallazgo bloqueante. Los dos fixes post-review sin stagear (`.prettierignore`, `apps/web/tsconfig.json`) estaban presentes en el árbol de trabajo durante toda la verificación y se incluyeron en todas las ejecuciones de gate/build.
