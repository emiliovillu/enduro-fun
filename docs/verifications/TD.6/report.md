# Verificación TD.6 — Lint de adherencia al DS

- **Tarea**: TD.6 · Lint de adherencia al DS (`planning.md`)
- **Fecha**: 2026-07-18
- **Ejecutor**: verifier · eslint v9.39.5 · sin superficie UI (verificación de tooling backend/lint)
- **Sistema**: commit `76a5984e082586bfb39fa9d112624540986eae7f` (HEAD, cambios de TD.6 en staged: `eslint.config.ts`, `apps/web/src/app/page.tsx`) · sin docker/pnpm dev necesarios — la Verificación es puramente de lint estático, no hay servidor que levantar

## Verificación esperada (literal de planning.md)
> un fichero de prueba con una violación de cada tipo hace fallar `pnpm lint` nombrando la regla; al retirarlo, `pnpm gate` queda verde.

## Pasos ejecutados
1. `pnpm gate` desde la raíz, estado previo a mi propio fichero de prueba → verde (0 errores; solo warnings preexistentes `import-x/no-named-as-default-member` en `eslint.config.ts`/`scripts/readme-status.mjs`, no relacionados con TD.6). Output: `01-gate-before.txt`.
2. Creado `apps/web/src/app/__td6-verify-test.tsx` (fichero propio, no reutilizado del implementer) con las 3 violaciones, una de cada tipo:
   - import `lucide-react` (librería de iconos prohibida)
   - `className="text-gray-500"` (paleta cruda de Tailwind, familia `gray` no definida por el DS)
   - `className="top-[13px]"` (valor arbitrario crudo, px)

   `pnpm exec eslint apps/web/src/app/__td6-verify-test.tsx` → 3 errores, cada uno nombrando su regla: `no-restricted-imports`, `no-restricted-syntax` (paleta), `no-restricted-syntax` (arbitrario). Output: `02-own-testfile-lint.txt`.
3. Creado `apps/web/src/app/__td6-verify-regex.tsx` con el caso específico del fix de regex reportado por el implementer: línea 4 `className="text-[var(--x)_#fff]"` (valor crudo concatenado DESPUÉS de un `var(--...)` legítimo, dentro del MISMO corchete) y línea 5 `className="max-w-[var(--container-max)]"` (patrón sancionado completo, uso real ya existente en el repo).

   `pnpm exec eslint apps/web/src/app/__td6-verify-regex.tsx` → exactamente 1 error, en la línea 4 (`no-restricted-syntax`, valor arbitrario). La línea 5 NO se marca. Confirma que el lookahead anclado al `]` de cierre funciona: el escape hatch `var(--token)` solo se acepta si ocupa el corchete COMPLETO, no si hay contenido crudo pegado después. Output: `03-regex-fix-lint.txt`.
4. Borrados ambos ficheros de prueba (`rm -f`). `git status --short` confirma que no quedó ningún fichero de prueba en el árbol.
5. `pnpm gate` de nuevo desde la raíz → verde, resultado idéntico al paso 1 (mismos warnings preexistentes, 0 errores, typecheck/format/knip/readme-status/tests todos en verde). Output: `04-gate-after.txt`.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Fichero de prueba con 1 violación de cada tipo hace fallar `pnpm lint`/eslint, nombrando la regla | 3 errores, uno por violación, cada uno con el nombre de regla (`no-restricted-imports`, `no-restricted-syntax` ×2) en el mensaje | 02-own-testfile-lint.txt | ✅ |
| 2 | Caso específico del fix de regex: `[var(--x)_#fff]` falla, `[var(--container-max)]` (patrón real en uso) no falla | 1 solo error, en la línea del valor crudo tras var(); la línea con el patrón sancionado completo pasa limpia | 03-regex-fix-lint.txt | ✅ |
| 3 | Al retirar el fichero, `pnpm gate` queda verde | Gate verde, idéntico al estado previo (mismos warnings preexistentes no relacionados) | 01-gate-before.txt, 04-gate-after.txt | ✅ |

## Coste real
$0 — sin APIs de pago, verificación puramente de lint estático local.

## Veredicto
**PASS** — las 3 reglas nuevas (`no-restricted-syntax` ×2, `no-restricted-imports`) disparan correctamente sobre un fichero de prueba propio con una violación de cada tipo, nombrando la regla en el mensaje; el fix del hueco de regex (`var()` seguido de contenido crudo en el mismo corchete) se reprodujo y confirmó de forma independiente; al retirar los ficheros de prueba `pnpm gate` vuelve exactamente al mismo estado verde previo.

Notas:
- Deuda anotada por el implementer (fuera de alcance literal de la Entrega): la regla de `no-restricted-syntax`/`no-restricted-imports` solo cubre `JSXAttribute[name.name='className']`, no las strings de configuración de `cva()` en `components/ui/button.tsx`/`badge.tsx`/etc. El texto literal de la Verificación solo habla de `className`, así que esto no bloquea el PASS, pero queda como gap conocido para una tarea futura si se decide ampliar el alcance del linter.
- No se detectaron rarezas adicionales. Los warnings `import-x/no-named-as-default-member` presentes en ambos gates son preexistentes y no relacionados con TD.6 (afectan a `tseslint`/`prettier`, no a las reglas nuevas).
