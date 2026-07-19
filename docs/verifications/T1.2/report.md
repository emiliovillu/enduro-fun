# Verificación T1.2 — Página About

- **Tarea**: T1.2 · Página About (`planning.md`)
- **Fecha**: 2026-07-19
- **Ejecutor**: verifier · agent-browser (npx -y agent-browser, versión resuelta en runtime) · sesión `t1.2`
- **Sistema**: commit base `8c0b414` (T1.1) + diff sin commitear de T1.2 (working tree) — `next build` estático servido con `python3 -m http.server 8123` desde `apps/web/out/`. Working tree con cambios pendientes propios de T1.2 (about/page.tsx nuevo, e2e/about.spec.ts nuevo, messages EN/ES/DE, contracts/messages.ts, section-heading.tsx) — confirmado que corresponden exactamente a la Entrega descrita, sin trabajo de otras tareas mezclado.

## Verificación esperada (literal de planning.md)
> en navegador, `/en/about`, `/es/about`, `/de/about` muestran el contenido completo y correcto en cada idioma; el header/footer son consistentes con Home.

También el Playwright permanente: `apps/web/e2e/about.spec.ts` — la página carga en los 3 idiomas, el nav de `Header` marca "about" como activo.

## Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (lint con solo warnings preexistentes de `tseslint`/`prettier` en ficheros no tocados por esta tarea, typecheck, format:check, knip, readme:status:check, `vitest run` 9/9 unit).
2. `rm -rf apps/web/out apps/web/.next && pnpm --filter @app/web build` → build estático genera `out/en/about/index.html`, `out/es/about/index.html`, `out/de/about/index.html` (confirmado con `ls`).
3. Servido `out/` con `python3 -m http.server 8123`; sesión `agent-browser` nombrada `t1.2`.
4. `/en/about/`: snapshot interactivo + `get text body` → intro (h1 "Local knowledge, real trails" + párrafo), "Our story" (h2 "Riders first, guides by trade" + párrafo + placeholder de foto `aria-hidden`), "What makes us different" sobre fondo oscuro (3 diferenciadores: Local knowledge / Varied terrain / Cultural offering, cada uno con icono+título+texto), "Experience levels" (3 niveles: Beginner/Intermediate/Advanced con `Badge` + texto), footer con nav Explore/Company/Follow. Consola: `console` → vacío, sin errores.
5. `/es/about/`: mismas 5 secciones en español ("Sobre nosotros" / "Conocimiento local, rutas de verdad", "Nuestra historia" / "Motoristas primero, guías de oficio", "Qué nos hace diferentes" / "Tres cosas que los motoristas notan" con Conocimiento local/Terreno variado/Oferta cultural, "Niveles de experiencia" / "Para quién es esto" con Principiante/Intermedio/Avanzado). Consola vacía.
6. `/de/about/`: mismas 5 secciones en alemán ("Über uns" / "Lokales Wissen, echte Trails", "Unsere Geschichte" / "Zuerst Fahrer, dann Guides von Beruf", "Was uns anders macht" / "Drei Dinge, die Fahrern auffallen" con Lokales Wissen/Abwechslungsreiches Gelände/Kulturelles Angebot, "Erfahrungsstufen" / "Für wen das ist" con Anfänger/Fortgeschritten/Erfahren). Consola vacía.
7. Grep amplio propio sobre `out/es/about/index.html` y `out/de/about/index.html` con patrón de palabras inglesas comunes (`the|and|our|story|guide|guides|trail|trails|terrain|experience|levels|beginner|intermediate|advanced|photo|placeholder`) → único hit real: `Photo placeholder — guides on trail`, presente exactamente 2 veces por fichero (HTML renderizado + payload RSC del script), confirmado con contexto (`grep -oE '.{150}Photo placeholder.{20}'`) que está envuelto en `aria-hidden="true"` — mismo patrón aceptado que el hero de Home en T1.1. No se encontró ningún otro literal en inglés colado en ES/DE.
8. Comparación de nav activo: `get attr @e18 aria-current` → `page` en About; `outerHTML` del `<nav aria-label="Primary">` muestra `aria-current="page"` + clase `text-accent-amber` en el link activo, idéntico patrón (mismas clases) al usado para "Home" en `/en/` (comparado directamente). Header de About usa clase `bg-bg-inverse` (sólido, no transparente) frente al `absolute ... bg-transparent` del Header de Home — consistente con "Header estándar, no transparente" del resumen y con el resto de páginas interiores.
9. Contraste WCAG medido con `getComputedStyle` sobre los elementos de acento/semánticos que esta tarea introduce: badges de nivel (`bg-sand-200` `rgb(243,236,223)` / texto `rgb(28,28,30)`, 13px/600) → ratio ≈14.5:1; heading sobre fondo oscuro de "What makes us different" (`rgb(250,246,240)` sobre `rgb(28,28,30)`) → ratio muy alto; texto de cuerpo sobre el mismo fondo oscuro (`rgb(184,181,174)` sobre `rgb(28,28,30)`) → ratio ≈8.3:1. Todos muy por encima de 4.5:1.
10. `pnpm test:e2e` (Playwright, suite completa) → **13/13 passed** (9 previos de home/i18n + 4 nuevos de `about.spec.ts`: EN/ES/DE contenido + nav activo). Confirmado el número exacto pedido.
11. Screenshots full-page de los 3 idiomas + consola volcada a fichero para cada uno.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `/en/about` muestra contenido completo y correcto en inglés | 5 secciones completas, copy correcto, sin residuos de placeholder de copy | 01-en-about.png, console-en.txt (vacío) | ✅ |
| 2 | `/es/about` muestra contenido completo y correcto en español | 5 secciones completas y traducidas; único inglés residual es el placeholder decorativo `aria-hidden` esperado | 02-es-about.png, console-es.txt (vacío) | ✅ |
| 3 | `/de/about` muestra contenido completo y correcto en alemán | 5 secciones completas y traducidas; mismo placeholder `aria-hidden` esperado | 03-de-about.png, console-de.txt (vacío) | ✅ |
| 4 | Header/footer consistentes con Home | Mismas clases de nav activo (`aria-current="page"` + `text-accent-amber`), mismo footer (Explore/Company/Follow, mismos labels traducidos), header estándar sólido en About vs transparente en Home hero (comportamiento esperado, no una inconsistencia) | HTML `outerHTML` capturado en sesión, screenshots | ✅ |
| 5 | Playwright permanente `about.spec.ts` | 4 tests (EN/ES/DE contenido + nav activo), incluidos en la suite | salida `pnpm test:e2e` 13/13 | ✅ |
| 6 | `pnpm gate` verde antes de verificación | lint/typecheck/format/knip/readme-status/unit todos verdes | salida de terminal (paso 1) | ✅ |
| 7 | Sin texto en inglés colado fuera del placeholder aceptado | Grep dedicado confirma único hit esperado, 2 ocurrencias por fichero, ambas dentro de `aria-hidden` | grep con contexto (paso 7) | ✅ |
| 8 | Contraste WCAG de elementos de acento ≥ umbral | Badges ~14.5:1, heading dark-bg alto, body dark-bg ~8.3:1 — todos > 4.5:1 | mediciones `getComputedStyle` (paso 9) | ✅ |

## Coste real
$0 — sin APIs de pago, todo local (build estático + servidor HTTP local + agent-browser).

## Veredicto
**PASS** — las 3 versiones de idioma de `/about` cargan con las 5 secciones completas y correctamente traducidas, el header/footer son consistentes con Home (mismo patrón de nav activo, mismo footer), el patrón de FAIL repetido en T1.1 (texto hardcodeado sin traducir) no se repite: el único literal en inglés en ES/DE es el placeholder decorativo `aria-hidden="true"` ya aceptado como precedente en T1.1. Consola limpia en los 3 idiomas, `pnpm gate` verde, `pnpm test:e2e` 13/13 (4 nuevos + 9 previos), contraste WCAG de los elementos de acento muy por encima del umbral.

Notas: sin rarezas relevantes. El grep detectó también la cadena "guides" dentro del propio placeholder ("guides on trail") y no en otro sitio — no es un hallazgo adicional, es la misma ocurrencia ya contabilizada.
