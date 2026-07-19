# Verificación T1.1 — Página Home

- **Tarea**: T1.1 · Página Home (`planning.md`, sección F1)
- **Fecha**: 2026-07-19
- **Ejecutor**: `verifier` · agent-browser (CLI vía `npx -y agent-browser`) · sesión `t1.1`
- **Sistema**: working tree sobre commit `2c64956` (TD.10) + diff sin commitear de T1.1 (`git status`/`git diff --stat` limpio salvo los ficheros de la tarea: `apps/web/src/app/[locale]/page.tsx`, `header.tsx`, `footer.tsx`, `package-card.tsx`, `messages.ts`, `en/es/de.json`, `e2e/home.spec.ts`, `e2e/i18n.spec.ts`, `src/data/{packages,reviews}.ts`, `src/lib/utils.ts`) — build estático fresco (`rm -rf out .next && pnpm --filter @app/web build`) servido con `npx serve -l 4173 out`.
- **Intento**: 3º (tras 2 FAIL consecutivos ya corregidos — ver sección "Regresión de FAILs previos").

## Verificación esperada (literal de planning.md)
> en navegador (sirviendo `out/` local), abrir `/en/`, `/es/`, `/de/` y comprobar que el hero, tagline, CTAs, paquetes y reviews de preview aparecen traducidos y correctos en los 3; clicar cada CTA navega a la ruta esperada.

Playwright permanente asociado: `apps/web/e2e/home.spec.ts` y `apps/web/e2e/i18n.spec.ts` (ajustado en T0.2 para el contenido real de T1.1).

## Regresión de FAILs previos (re-chequeados explícitamente)

| FAIL previo | Causa raíz original | Re-chequeo en este intento | Resultado |
|---|---|---|---|
| 1er FAIL | `PackageCard` hardcodeaba `"{nights} nights · {days} route days"` y `"Enquire"` en inglés, ignorando el locale | Leído `page.tsx`: `subtitle`/`ctaLabel` se pasan ya traducidos desde `messages.home.packages`; confirmado en el DOM renderizado de `/es/` ("4 noches · 3 días de ruta" / "Consultar") y `/de/` ("4 Nächte · 3 Routentage" / "Anfragen") | Sigue arreglado |
| 2º FAIL | `Header`/`Footer` hardcodeaban labels de nav ("Home"/"Packages"/.../"Explore"/"Company"/"Follow") en inglés en las 3 páginas | Confirmado prop `labels`/`columnLabels`/`brandBlurb` en `page.tsx` pasando `messages.nav.*`; DOM de `/es/` muestra nav "INICIO/PAQUETES/SOBRE NOSOTROS/CONTACTO/OPINIONES" y footer "Explora/Empresa/Síguenos"; DOM de `/de/` muestra "START/PAKETE/ÜBER UNS/KONTAKT/BEWERTUNGEN" y footer "Entdecken/Unternehmen/Folgen" | Sigue arreglado |

## Pasos ejecutados

1. `git status` / `git diff --stat` — confirmado el diff exacto de la tarea, sin sorpresas fuera de alcance.
2. `pnpm gate` (lint + typecheck + format:check + knip + readme:status:check + `vitest run --project '*:unit'`) → verde, 8/8 tests unitarios, 0 errores (solo 5 warnings preexistentes de `import-x/no-named-as-default-member` no relacionados con esta tarea).
3. `rm -rf apps/web/out apps/web/.next && pnpm --filter @app/web build` → build estático limpio, genera `out/en`, `out/es`, `out/de`, `out/design-system`.
4. Servido `out/` con `npx serve -l 4173 out`; verificado `curl` 200 en `/en/`, `/es/`, `/de/`.
5. Sesión `agent-browser --session t1.1`; recorrido completo de `/en/`: snapshot de accesibilidad (Header nav completo, badge, hero h1/subtítulo, 2 CTAs, 2 `PackageCard` con nombre/subtítulo/precio/features/badge "Most popular"/CTA, 3 `ReviewCard`, sección "Find us", Footer con 3 columnas + blurb) — todo en inglés correcto.
6. `get attr href` sobre los 2 CTAs del hero (`View packages` → `/en/packages/`, `Get in touch` → `/en/contact/`), sobre los 5 links de nav del Header y los 4+2 del Footer — todos apuntan a la ruta esperada con el locale `en` correcto.
7. Click real en "View packages" → navega a `/en/packages` (404 esperado, la página de Packages es T2.1, no penaliza per protocolo). Click real en nav "CONTACT" → navega a `/en/contact` (404 esperado, T1.3 pendiente).
8. Vuelto a `/en/`, click real en `LanguageSwitcher` (Header) "ES" → navega a `/es/` (misma página, Home) — confirma que el switcher conserva la página, no solo el locale.
9. Snapshot completo de `/es/`: nav, hero, 2 `PackageCard`, reviews, footer — 100% en español, incluidos el nav ("INICIO/PAQUETES/SOBRE NOSOTROS/CONTACTO/OPINIONES") y footer ("Explora"/"Empresa"/"Síguenos").
10. Extracción de texto completo (`agent-browser read`) de `/es/` y `/de/` — inspección línea a línea del contenido renderizado (hero, packages, reviews, find us, footer).
11. Grep programático (Python) sobre `out/es/index.html` y `out/de/index.html` de texto visible, filtrando tags/scripts/estilos, buscando tokens ingleses conocidos del dominio (`home`, `packages`, `enquire`, `view`, `nights`, `days`, `most`, `popular`, `find`, `based`, países). Único resultado real: `country: 'Germany'`/`'United Kingdom'` en las 3 `ReviewCard` (dato de review, no copy — mismo criterio ya documentado en `src/data/reviews.ts` para el contrato `Review`, no traducido a propósito, igual en las 3 locales) y "popular" en ES (cognado legítimo, "Más popular"). Sin literales en inglés indebidos.
12. Console del navegador (`agent-browser console`) en `/en/`, `/es/`, `/de/` — vacía en las 3 (0 errores, 0 warnings).
13. `document.documentElement.lang` verificado por JS tras hidratación en `/de/` → `"de"` (el HTML estático servido trae `lang="en"` en las 3 rutas por restricción arquitectónica de Next App Router documentada en `SetHtmlLang`/T0.2 — corregido client-side de forma síncrona en el primer paint útil; no es un defecto nuevo de esta tarea, ya cubierto y aceptado en T0.2).
14. Medición de contraste real (no solo tokens): sampleo de píxeles sobre el screenshot renderizado (no solo `getComputedStyle`, porque el hero usa capas absolutas que el DOM-walk de fondo no resuelve correctamente) para: botón primario (texto `rgb(28,28,30)` sobre acento `rgb(232,121,30)`) → **5.82:1**; botón outline "Get in touch" (texto `rgb(250,246,240)` sobre scrim del hero `rgb(33,33,35)`) → **14.93:1**; badge "Álora · Málaga..." (texto `rgb(28,28,30)` sobre ámbar `rgb(245,166,35)`) → **8.39:1**; badge "Most popular" y botón secundario "info@endurofun.eu" (texto blanco sobre `rgb(198,43,40)`) → **5.56:1**. Todos ≥ 4.5:1 (texto normal).
15. Repetido el recorrido completo en `/de/`: nav, hero, packages, reviews, footer — 100% en alemán correcto (ver paso 10).
16. `pnpm --filter @app/web test:e2e` → **9/9 passed** (`home.spec.ts` + `i18n.spec.ts` ajustado).
17. Cierre de sesión `agent-browser`.

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Hero (badge/tagline/párrafo/CTAs) traducido en EN/ES/DE | "RIDE THE WILD HEART..."/"VIVE EL CORAZÓN..."/"ERLEBE DAS WILDE HERZ..." correctos, badge y subtítulo también | 01-en-home.png, 02-es-home.png, 03-de-home.png | ✅ |
| 2 | 2 `PackageCard` (nombre/subtítulo duración/precio/features/badge "Most popular"/CTA) traducidas en los 3 | Confirmado texto completo por `read` en los 3 idiomas (paso 9-10 arriba) | screenshots + logs de sesión | ✅ |
| 3 | 3 `ReviewCard` traducidas | `text` traducido en los 3; `name`/`country` no traducidos a propósito (dato, no copy — documentado en código) | screenshots | ✅ |
| 4 | Sección "Find us" traducida | "BASED IN ÁLORA.../ENCUÉNTRANOS.../FINDE UNS..." correctos en los 3 | screenshots | ✅ |
| 5 | Header (nav completo + botón contacto) traducido | Confirmado en los 3 (incluye regresión del 2º FAIL, sigue arreglada) | snapshots, paso 5/9 | ✅ |
| 6 | Footer (columnas + títulos + blurb) traducido | Confirmado en los 3 (incluye regresión del 2º FAIL, sigue arreglada) | snapshots, paso 10 | ✅ |
| 7 | Clicar cada CTA navega a la ruta esperada | Hero CTAs → `/en/packages`, `/en/contact`; nav Header/Footer → rutas correctas con locale; LanguageSwitcher conserva página | pasos 6-8 | ✅ |
| 8 | Sin literales en inglés colados en ES/DE (grep propio) | Solo `Germany`/`United Kingdom` (dato de review, intencional) y "popular" (cognado ES) | paso 11 | ✅ |
| 9 | `pnpm gate` verde | lint/typecheck/format/knip/readme-status/unit tests (8/8) verdes | terminal | ✅ |
| 10 | `pnpm test:e2e` verde | 9/9 passed | terminal | ✅ |
| 11 | Consola limpia en los 3 idiomas | 0 mensajes en EN/ES/DE | console-en.txt, console-es.txt, console-de.txt (vacíos) | ✅ |
| 12 | Contraste texto/fondo en botones y badges ≥ 4.5:1 | Rango real 5.56:1–14.93:1 en los 4 acentos usados en Home | paso 14 | ✅ |

## Coste real

$0 — sin APIs de pago; build estático + servidor HTTP local + `agent-browser` contra `localhost`. Acumulado de los 3 intentos: $0 (vs estimado del planning; no hay coste estimado para esta tarea al ser puramente local/estático).

## Veredicto

**PASS** — el flujo completo de la Verificación (hero, packages, reviews, find us, header, footer, en los 3 idiomas + navegación de CTAs + `LanguageSwitcher`) se ejecutó de extremo a extremo contra el build estático real, sin atajos. Los 2 FAILs anteriores (duración/CTA de `PackageCard` en inglés; nav de `Header`/`Footer` en inglés) siguen corregidos — confirmado por inspección directa del DOM renderizado, no solo por lectura del diff. El grep propio (no el del implementer) sobre el HTML servido no encontró literales en inglés indebidos. `pnpm gate` y `pnpm test:e2e` (9/9) verdes. Consola limpia en los 3 idiomas. Contraste de todos los acentos usados en Home ≥ 4.5:1.

**Rarezas** (no bloquean el PASS):
- `<html lang="en">` en el HTML estático servido de `/es/` y `/de/` (Next App Router no permite un `<html>` por locale sin restructurar el árbol de layouts) — corregido client-side de forma síncrona por `SetHtmlLang` (confirmado `document.documentElement.lang === "de"` tras hidratación). Decisión ya documentada y aceptada en T0.2, no es un defecto nuevo de T1.1; se anota aquí por completitud del re-verify.
- Los botones "Enquire"/"Consultar"/"Anfragen" de `PackageCard` son `<button>` sin navegación (no `<a href>`) — correcto para el alcance de T1.1 (la página Packages con acción real de contacto llega en T2.1/T1.3), no forma parte de los "CTAs" que la Verificación pide comprobar por ruta (esos son los del hero).
