# Verificación T3.3 — Performance final

- **Tarea**: T3.3 · Performance final (`planning.md`)
- **Fecha**: 2026-08-02
- **Ejecutor**: verifier · lighthouse 13.4.1 (npx) · Chrome for Testing (Playwright cache, chromium-1234) vía `CHROME_PATH` · agent-browser (npx -y agent-browser), sesión `t3.3`
- **Sistema**: base commit `39d4fee` (T3.2) + working tree con el diff de T3.3 SIN COMMITEAR (`git status` confirmado antes de empezar: exactamente los ficheros descritos por el implementer — `apps/web/src/app/fonts/index.ts`, `home-hero-video.tsx`, `[locale]/page.tsx`, `packages/page.tsx`, `data/packages.ts` + 4 `.woff2` borrados — más el ajuste de `architecture.md` de `simplify`). Build limpio: `.next`/`out` borrados y regenerados con `pnpm --filter @app/web build` justo antes de medir. Servido con `npx serve@latest -l 4173 out` (export estático, sin `next dev`/SSR).

## Verificación esperada (literal de planning.md)
> Lighthouse móvil (servido local, throttling por defecto) reporta Performance > 90 en Home, About, Contact, Packages y Reviews — cita criterio §14.1.

**Decisión de alcance heredada de T3.2 (verificada, no solo aceptada)**: el bullet nombra 5 páginas, cifra previa al hotfix de Gallery. Confirmé en PRD §D12 ("6 páginas... Gallery se añadió tras el lanzamiento inicial") y §14.1 (que no acota el criterio de performance a páginas concretas: "la web carga en <2s... score Performance > 90", sin lista) que exigir las 6 páginas reales es la lectura correcta — mismo patrón ya razonado por el verifier de T3.2 para hreflang/sitemap. Verifiqué las 6.

## Pasos ejecutados
1. `pnpm gate` desde raíz → verde (lint 0 errores/6 warnings preexistentes, typecheck OK, format OK, knip OK, readme:status OK, 20/20 unit tests).
2. `git status`/`git rev-parse HEAD` → confirmado que el árbol de trabajo contiene exactamente el diff de T3.3 sobre el commit T3.2 (39d4fee), sin cambios ajenos.
3. `rm -rf apps/web/.next apps/web/out` + `pnpm --filter @app/web build` (Turbopack) → build limpio, 25 páginas estáticas generadas (6 rutas × 3 locales + raíz/sitemap/etc).
4. `grep` sobre `out/en/index.html` y `out/en/packages/index.html` → confirmado en el HTML estático real: `<link rel="preload" href=".../home-hero-poster.avif" as="image" fetchPriority="high">` en Home, `<link rel="preload" href=".../gallery-049.avif" as="image" fetchPriority="high">` en Packages (primera card = `PACKAGES[0]`), y solo 4 ficheros de fuente precargados (`inter_400/500/600`, `oswald_600`) — ni `inter_700` ni `oswald_400/500/700` aparecen en ningún HTML, confirmando que los `.woff2` borrados no dejan huérfanos.
5. Confirmé por lectura de código (no solo aceptando el resumen): `grep -rn "font-bold" apps/web/src --include="*.tsx"` → 0 resultados; `globals.css` `@layer base` fija `h1,h2,h3,h4,.font-display { font-weight: var(--fw-semibold) /* 600 */ }` como ÚNICA regla que aplica `font-family: var(--font-display)` (Oswald) en todo el proyecto — no hay combinación con otro peso. El recorte de pesos es correcto, no un experimento sin verificar.
6. `npx serve@latest -l 4173 out`, servido en `127.0.0.1:4173` (nota: `localhost` no resolvía a la instancia recién lanzada en esta sesión — usar `127.0.0.1` explícito).
7. Lighthouse móvil (`--preset=perf --form-factor=mobile --screenEmulation.mobile=true`, sin overrides de throttling → confirmado en el JSON `configSettings.throttling` = valores por defecto de Lighthouse: rtt 150ms, throughput 1638.4kbps down, cpuSlowdownMultiplier 4) sobre las 6 páginas en `/en/`.
8. Repetición ×4 total de Home (la más ajustada) para descartar fluke.
9. `agent-browser` (sesión `t3.3`): captura visual + consola de Home y Packages contra el `out/` servido, sin reload entre estados (carga única de página).
10. `npx playwright test performance.spec.ts` (test permanente de T3.1) y suite completa `npx playwright test`.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Home Performance > 90 | 92, 92, 92, 92 (4 corridas) — estable, no fluke | lh-home.report.json, lh-home-run{2,3,4}.report.json | ✅ |
| 2 | About Performance > 90 | 100 | lh-about.report.json/html | ✅ |
| 3 | Contact Performance > 90 | 100 | lh-contact.report.json/html | ✅ |
| 4 | Packages Performance > 90 | 98 | lh-packages.report.json/html | ✅ |
| 5 | Reviews Performance > 90 | 100 | lh-reviews.report.json/html | ✅ |
| 6 | Gallery Performance > 90 (alcance ampliado, ver arriba) | 98 | lh-gallery.report.json/html | ✅ |
| 7 | `preload()` reduce competencia por LCP (verificable) | LCP real: Home 1.7s, About/Contact/Reviews 1.5s, Packages/Gallery 2.3s — todos dentro del rango "good" de Lighthouse (≤2.5s); preload confirmado en HTML estático (paso 4) | grep sobre out/, JSON audits | ✅ (ver rareza sobre "<2s" literal de §14.1) |
| 8 | Sin regresión visual/funcional | Home y Packages renderizan correctamente, sin elementos rotos | 01-home.png, 02-packages.png | ✅ |
| 9 | Consola limpia | 0 líneas en `agent-browser console` para ambas páginas | 01-home-console.txt, 02-packages-console.txt (vacíos) | ✅ |
| 10 | `performance.spec.ts` (T3.1) sigue verde | 2/2 passed | salida de playwright (ver abajo) | ✅ |
| 11 | `pnpm gate` verde | lint/typecheck/format/knip/readme/unit-tests OK | salida de terminal (paso 1) | ✅ |
| 12 | `pnpm test:e2e` verde | 64/64 passed | salida de playwright (paso 10) | ✅ |

## Coste real
$0 — sin APIs de pago. Lighthouse/Chrome/agent-browser/Playwright, todo local.

## Veredicto
**PASS** — Lighthouse móvil (throttling por defecto) reporta Performance > 90 en las 6 páginas reales (Home 92, About 100, Contact 100, Packages 98, Reviews 100, Gallery 98), Home repetido 4 veces sin variación, gate + e2e (incl. `performance.spec.ts`) verdes, sin regresión visual ni de consola.

### Rarezas (no bloqueantes)
- **§14.1 dice "<2 segundos"**: el LCP medido en Packages y Gallery es 2.3s (por encima de 2s, aunque dentro del rango "good" ≤2.5s de Lighthouse y suficiente para Performance=98). El literal de la Verificación de T3.3 solo exige "Performance > 90" (que se cumple con holgura), no un LCP<2s explícito por página — pero como el propio criterio §14.1 se cita en el texto de la tarea, lo anoto para que quede constancia: si en el futuro se quiere apretar el LCP de esas 2 páginas por debajo de 2s literales, queda como posible trabajo futuro, no bloquea este PASS.
- **Home tiene Speed Index 5.8s** (frente a ~1.5s del resto de páginas) pese a un score de 92 — probablemente por el carrusel de fotos (`HomePhotoCarousel`) prolongando la "visual completeness" bajo CPU throttling ×4. No es un audit que falle (LCP/TBT/CLS de Home están todos en verde) y no impide el >90, pero es la explicación de por qué Home es la página más ajustada de las 6.
- Warnings preexistentes de ESLint (`import-x/no-named-as-default-member` en `eslint.config.ts`/`readme-status.mjs`, `import-x/no-named-as-default` en `scripts/optimize-images.mjs`) no relacionados con esta tarea — no bloquean `pnpm gate` (0 errores).
- Puertos de `serve` huérfanos de una sesión de verificación anterior (T3.1, puertos 4960-4962) detectados en el sistema al arrancar esta verificación — no interferían (puerto propio 4173), no se tocaron.
