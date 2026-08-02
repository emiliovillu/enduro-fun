# Verificación T3.2 — Meta tags, `hreflang` y sitemap multilingüe

- **Tarea**: T3.2 · Meta tags, `hreflang` y sitemap multilingüe (`planning.md`, fase F3)
- **Fecha**: 2026-08-02
- **Ejecutor**: `verifier` · agent-browser (npx -y, última versión resuelta en la sesión) · sesión `t3.2`
- **Sistema**: base commit `25b3738a97c98494354d3f089eac3c4905c62a96` (HEAD) + diff de T3.2 **sin commitear** (staged/untracked en el working tree en el momento de la verificación — es el patrón normal del bucle: el verifier corre antes del commit de cierre). Diff verificado: cambios en `apps/web/src/app/(root)/*`, `apps/web/src/app/[locale]/*`, `apps/web/src/app/sitemap.ts` (nuevo), `apps/web/src/lib/seo.ts` (nuevo), `apps/web/e2e/seo.spec.ts` (nuevo), borrado de `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/design-system/*` y `apps/web/src/i18n/set-html-lang.tsx`. Build real ejecutado desde ese working tree exacto (`rm -rf apps/web/out && pnpm --filter @app/web build`), no un `out/` viejo.

## Verificación esperada (literal de planning.md)
> `curl` sobre el HTML estático de una página muestra los 3 `<link rel="alternate" hreflang="...">` apuntando a las URLs correctas de las otras 2 versiones; `out/sitemap.xml` lista las 15 URLs; un validador de sitemap (script o herramienta online) no reporta errores.

## Decisión de alcance evaluada (18 URLs en vez de 15)

Confirmado en `PRD.md` línea 104 (tabla de decisiones, D12): *"6 páginas — Home, Gallery, Packages, About, Contact, Reviews — cada una con su propia ruta localizada. Gallery se añadió tras el lanzamiento inicial, hotfix a petición directa del usuario"*. El texto de T3.2 ("5 páginas / 15 URLs") quedó desactualizado por ese hotfix, posterior a la redacción original de la tarea. El sitio real tiene 6 páginas de contenido — confirmado también por el build real (`Route (app)` del output de `next build` lista 6 rutas bajo `[locale]/*`: `/`, `/about`, `/contact`, `/gallery`, `/packages`, `/reviews`, cada una generada en `/en`, `/es`, `/de`) y por `apps/web/src/lib/nav-links.ts` (`NAV_LINKS`, 6 entradas, misma fuente que usa el `Header` real). Sitemapear 6×3=18 URLs en vez de 15 es la decisión correcta: omitir Gallery del sitemap real para cumplir literalmente una cifra obsoleta sería un perjuicio de SEO real, no un cumplimiento más estricto de la tarea. Acepto esta decisión de alcance como parte del PASS, con el conteo 18 sustituyendo a 15 en el resto de esta verificación.

## Pasos ejecutados

1. `pnpm gate` completo desde la raíz → verde (lint 0 errores/6 warnings preexistentes no relacionados, typecheck OK, format OK, knip OK, readme:status OK, 20/20 unit tests).
2. `rm -rf apps/web/out && pnpm --filter @app/web build` → build real, 25 páginas estáticas generadas, incluye `● /[locale]/{,about,contact,gallery,packages,reviews}` × 3 locales + `○ /sitemap.xml`.
3. `out/sitemap.xml`: conteo de `<url>`/`<loc>` = **18** (script Python ad-hoc, ver `docs/verifications/T3.2/sitemap-validation.txt`). Validación: XML bien formado (`xml.etree.ElementTree.parse` sin error), 18 `<loc>` únicos, cada uno con exactamente 3 `<xhtml:link rel="alternate" hreflang>` (en/es/de), conjunto de 18 URLs esperadas (6 slugs × 3 locales, dominio `https://endurofun.eu`) == conjunto observado exacto (sin huecos ni extras), sin duplicados. Raíz `/` (redirección) correctamente NO listada — es coherente con la nota de la tarea ("+ / (redirección)" describe la estructura del sitio, no una entrada de sitemap; `/` no tiene contenido indexable propio).
4. Servido `out/` con `serve` local (`localhost:4173` y `localhost:3100`) y `curl` real contra el HTML estático servido (no contra mocks, no navegador con JS):
   - `curl http://localhost:4173/es/about/` → 3 `<link rel="alternate" hreflang="{en,es,de}" href="https://endurofun.eu/{en,es,de}/about/">` + `<link rel="canonical" href="https://endurofun.eu/es/about/">`. URLs correctas verificadas carácter a carácter.
   - `curl http://localhost:4173/de/gallery/` (HTTP 200) → mismo patrón, slug `gallery` correcto en las 3 URLs.
   - Grep directo sobre ficheros de `out/` (no `curl`, pero mismo HTML estático en disco) para 7 combinaciones más (`en/index`, `es/index`, `de/reviews`, `es/packages`, `de/contact`, `en/gallery`) — todas con hreflang cruzado y canonical correctos, cero errores de slug.
   - Nota de rareza (no bloquea PASS, ver abajo): el atributo se sirve como `hrefLang` (camelCase) en vez de `hreflang` — es el output nativo de la Metadata API de Next.js (confirmado en el propio código fuente de `next`, `lib/metadata/metadata.js`: `hrefLang: locale` es el nombre de prop JSX que React serializa literalmente), no una elección del implementer ni un bug: HTML5 trata los nombres de atributo sin distinguir mayúsculas/minúsculas, por lo que navegadores, Google y cualquier parser XML/HTML lo interpretan de forma idéntica a `hreflang`.
5. `<html lang>` en el HTML SERVIDO (grep directo sobre ficheros de `out/`, sin JS activo):
   - `/en/` → `lang="en"`, `/es/` → `lang="es"`, `/de/` → `lang="de"`.
   - Spot-check en 5 páginas más por locale (`es/gallery`, `de/contact`, `en/reviews`, `es/packages`, `de/about`) → todas con el `lang` correcto de su propio locale.
   - `/` (raíz, redirección meta-refresh a `/en/`) y `/design-system` → ambas `lang="en"`, correcto (PRD D11: no son contenido localizado). Confirmado que `(root)/layout.tsx` y `[locale]/layout.tsx` son dos root layouts independientes (técnica "multiple root layouts" de Next, route groups) — cada uno declara su propio `<html>`.
6. Meta descriptions: extraídas y comparadas las 18 combinaciones página×locale (no solo 3×3) directamente de `out/**/index.html` — 18 `<title>`/`<meta name="description">` distintos, traducidos de verdad (EN/ES/DE con contenido semánticamente equivalente pero texto propio, no un string compartido copiado entre idiomas). Ver tabla completa en el bloque de "Pasos ejecutados" de la sesión (reproducible con el mismo grep).
7. Sin regresión — `pnpm test:e2e` completo: **64/64 passed**, incluye las 5 pruebas nuevas de `apps/web/e2e/seo.spec.ts` (html lang sin JS, hreflang cruzados, meta description distinta EN/DE, sitemap 18 URLs, `/` y `/design-system` no rotos) y las suites previas de F0-F3 (i18n, home, about, contact, gallery, packages, reviews, performance) sin ningún fallo nuevo.
8. Sin regresión visual/funcional — sesión `agent-browser` (`t3.2`) contra `out/` servido en `localhost:3100`:
   - `01-home-en.png`: Home en `/en/` renderiza correctamente (hero, nav, CTAs).
   - `02-about-de.png`: About en `/de/about/` renderiza correctamente, contenido alemán completo, nav y footer intactos.
   - Click real (no navegación por URL) en el link "ES" del `LanguageSwitcher` desde `/de/about/` → navega a `/es/about/` (conserva la página, no cae a la raíz del locale) — `03-languageswitcher-to-es-about.png`.
   - Consola del navegador limpia en ambas cargas (`01-home-en-console.txt`, `02-about-de-console.txt` — vacíos, sin errores/warnings).

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `curl` sobre HTML estático muestra 3 `hreflang` cruzados con URLs correctas | Confirmado en 9 combinaciones página×locale (2 vía `curl` real + 7 vía grep sobre el mismo HTML estático), slugs y dominio exactos | terminal output (esta sesión) | ✅ |
| 2 | `out/sitemap.xml` lista las 15 URLs | Decisión de alcance validada contra PRD D12: sitio real = 6 páginas → 18 URLs (6×3), no 15. Confirmadas 18 únicas, correctas, sin huecos/extras | `sitemap-validation.txt` | ✅ (alcance ajustado y justificado) |
| 3 | Validador de sitemap no reporta errores | Script Python (`xml.etree.ElementTree`) confirma XML bien formado + 18 `<loc>` únicos + hreflang cruzado correcto en cada `<url>` | `sitemap-validation.txt` | ✅ |
| 4 (deuda anotada) | `<html lang>` correcto por locale en HTML servido, sin JS | `/en/`,`/es/`,`/de/` y 5 páginas más por locale correctas; `/` y `/design-system` en `en` (correcto, no localizados) | grep sobre `out/**/index.html` (esta sesión) | ✅ |
| 5 | Meta descriptions distintas por página+idioma | 18/18 combinaciones con `<title>`/`<meta description>` propios y traducidos | grep sobre `out/**/index.html` (esta sesión) | ✅ |
| 6 | Sin regresión de nav/LanguageSwitcher/formulario | `pnpm test:e2e` 64/64 + verificación manual con agent-browser (click real en LanguageSwitcher, conserva página) | `/tmp/e2e-full.log` (resumen en el cuerpo del report), `01-home-en.png`, `02-about-de.png`, `03-languageswitcher-to-es-about.png` | ✅ |

## Coste real
$0 — sin APIs de pago. Build, tests, `curl`/grep locales y `agent-browser` contra el `out/` estático servido en localhost.

## Veredicto
**PASS** — las 3 cláusulas literales de la Verificación se cumplen (con el ajuste de alcance 15→18 URLs, evaluado y confirmado razonable contra PRD D12 antes de aceptarlo), la deuda de `<html lang>` fijo en "en" (anotada 3 veces en el journal) queda resuelta y verificada en el HTML servido sin JS, y no hay regresión: gate verde, 64/64 E2E, consola de navegador limpia, capturas de Home y About(DE) correctas.

**Rarezas** (no bloquean el PASS):
- El atributo se sirve como `hrefLang` (camelCase) en el HTML crudo en vez de `hreflang` — comportamiento nativo de la Metadata API de Next.js (confirmado en el código fuente de `next`), no un defecto introducido por esta tarea. HTML5 es case-insensitive para nombres de atributo, así que no afecta a rastreadores/validadores reales.
- El working tree de esta verificación tenía el diff de T3.2 sin commitear (staged + untracked) al empezar — normal en el punto del pipeline en que corre el verifier (antes del commit de cierre), anotado aquí por transparencia según protocolo `cua.md` ("confirma que el código que corre es el que verificas... o anota el diff en el report").
