# Verificación T2.1 — Página Packages

- **Tarea**: T2.1 · Página Packages (`planning.md`)
- **Fecha**: 2026-07-19
- **Ejecutor**: verifier · agent-browser (npx -y, latest) · sesión `t2.1`
- **Sistema**: working tree sobre commit `1531ef3` (T1.2) + diff sin commitear de T2.1 (`git status` arriba) · web estática servida con `python3 -m http.server` sobre `apps/web/out` tras `rm -rf out .next && pnpm --filter @app/web build` (sin docker/DB — proyecto 100% estático, PRD §1/§6)

## Verificación esperada (literal de planning.md)
> en navegador, `/en/packages`, `/es/packages`, `/de/packages` muestran ambos paquetes completos y correctos; añadir un paquete de prueba a `packages.ts` sin traducción alemana rompe el build (control negativo del esquema Zod de §7).

## Pasos ejecutados
1. `git status` / `git diff --stat` → diff de T2.1 confirmado (page.tsx nuevo, e2e nuevo, control negativo nuevo, mensajes ampliados en los 3 idiomas, `vitest.config.ts` con `fileParallelism: false`).
2. `rm -rf apps/web/out apps/web/.next && pnpm --filter @app/web build` → build limpio OK (Turbopack, 13/13 páginas estáticas), confirmado `out/{en,es,de}/packages/index.html` presentes.
3. Servido `out/` estático en `localhost:8973`; sesión agent-browser `t2.1` recorriendo `/en/packages/`, `/es/packages/`, `/de/packages/`: 2 cards completas (nombre, subtítulo duración, precio, todas las features, CTA) + badge "Most popular"/"Más popular"/"Am beliebtesten" únicamente en Full Adventure/Aventura Completa/Volles Abenteuer + nota Adventure Bike/oferta personalizada, todo traducido. Screenshots full-page en los 3 idiomas.
4. Grep amplio propio (extracción de texto del HTML estático, no del script del implementer) sobre `out/es/index.html` y `out/de/index.html`: sin residuos de inglés. "Adventure-Bike" en alemán confirmado como préstamo léxico legítimo (aparece junto a palabras compuestas alemanas normales: "Adventure-Bike-Optionen", "Routentagen", "Ruhetag-Option").
5. `Header` en los 3 idiomas: verificado `aria-current="page"` en el link de Packages/Paquetes/Pakete vía `get attr` sobre el ref del nav — consistente con Home/About (mismo patrón de Header compartido).
6. Control negativo verificado directamente: `pnpm --filter @app/web test data/packages.build-negative` → 1/1 test pasa (4.4s, incremental sobre `.next` cacheada tras el paso 2 — legítimo, no falso positivo: el test hace backup/mutación/`execFileSync('pnpm',['--filter','@app/web','build'])`/restore reales sobre `packages.ts`). Leído el fichero del test: la mutación quita la línea `de: '4 Nächte, Frühstück inklusive'` de `features[0]` de Getaway (única en el fichero), el assert comprueba `failed === true` y que `stderr` matchea `/features/i` y `/\bde\b/` — no un mock, el error real de Zod. Backup en `os.tmpdir()` con guard de `beforeAll` contra crashes previos.
7. `pnpm gate` (lint+typecheck+format:check+knip+readme:status:check+test) → verde. 4 archivos de test / 11 tests, 9.7s total — los 2 controles negativos de build (i18n + packages) siguen dentro de rango razonable con `fileParallelism: false`, sin timeout.
8. `pnpm test:e2e` → **18/18 passed** (9.6s), incluye los 5 tests nuevos de `packages.spec.ts` (2 cards x3 idiomas + badge correcto + nav activo).
9. Consola del navegador (`agent-browser console`) capturada en los 3 idiomas: vacía, sin errores/warnings.
10. Contraste de texto medido con `getComputedStyle` (no solo visual): badge "Most popular" blanco (255,255,255) sobre `bg-accent-secondary` rgb(198,43,40) → ratio ≈5.57:1 (≥4.5:1 OK); precio rgb(198,43,40) sobre card blanca → ratio ≈5.57:1 OK; botón "Enquire" rgb(28,28,30) sobre `bg-accent-primary` rgb(232,121,30) → ratio ≈5.82:1 OK. Los 3 pasan el umbral WCAG.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `/en/packages` muestra ambos paquetes completos y correctos | Getaway (4n/3d, 1.290€, 3 features) y Full Adventure (6n/4d, 1.690€, 3 features, "Most popular") completos y traducidos | 01-en-packages.png | ✅ |
| 2 | `/es/packages` muestra ambos paquetes completos y correctos | Escapada/Aventura Completa completos, "Más popular" en el paquete correcto, sin residuos de inglés | 02-es-packages.png | ✅ |
| 3 | `/de/packages` muestra ambos paquetes completos y correctos | Kurztrip/Volles Abenteuer completos, "Am beliebtesten" en el paquete correcto, sin residuos de inglés/español | 03-de-packages.png | ✅ |
| 4 | Añadir un paquete de prueba sin traducción alemana rompe el build (control negativo Zod) | `pnpm --filter @app/web test data/packages.build-negative` invoca `pnpm build` real, falla, stderr contiene el error de Zod (`features`/`de`) | output del test (paso 6 arriba) | ✅ |
| 5 (extra, Playwright permanente) | `packages.spec.ts` cubre las 2 cards x3 idiomas + badge correcto + nav activo | 18/18 e2e verdes | salida `pnpm test:e2e` | ✅ |
| 6 (extra, contraste) | Texto sobre acento cumple WCAG | Badge/precio/CTA ≥4.5:1 en los 3 casos medidos | cálculos paso 10 | ✅ |

## Coste real
$0 — sin APIs de pago, build/test local únicamente.

## Veredicto
**PASS** — las 3 páginas `/packages` muestran ambos paquetes completos y correctamente traducidos, el control negativo de Zod rompe `pnpm build` de verdad (verificado directamente, no solo vía informe del implementer), el gate y los 18 e2e están verdes, y la consola queda limpia en los 3 idiomas.

## Notas / rarezas
- El precio en español se muestra "Desde 1290 €" (sin separador de miles) mientras que en/de sí lo llevan ("1,290 €" / "1.690 €"). Investigado con `node -e "new Intl.NumberFormat('es').format(1290)"` en este mismo entorno (Node v24, ICU completo): confirma que es comportamiento **nativo de CLDR** para `es` (`minimumGroupingDigits` efectivo hace que 4 dígitos no agrupen, sí a partir de 5), no un bug del código ni un olvido de traducción — mismo `Intl.NumberFormat(locale)` ya usado en Home (T1.1). El propio `packages.spec.ts` del implementer ya documenta y fija este comportamiento con un comentario explícito. No bloquea el PASS, se anota por transparencia.
- El mockup `docs/mockups/packages.html`/`.png` se generó ad-hoc para esta tarea (no existía en Claude Design) — igual criterio que T1.2/about.html, según el propio comentario del código; la aprobación de usuario del mockup queda fuera del alcance de este gate (responsabilidad del bucle dev-loop, no del verifier).
