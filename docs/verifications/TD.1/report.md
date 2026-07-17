# Verificación TD.1 — Tokens del DS, fuentes y showcase `/design-system`

- **Tarea**: TD.1 · Tokens del DS, fuentes y showcase `/design-system` (`planning.md`)
- **Fecha**: 2026-07-17
- **Ejecutor**: verifier · agent-browser 0.32.1 · sesión `td1`
- **Sistema**: HEAD `1a7c8b0` (T0.1) + diff de TD.1 **staged sin commitear** (`git status --short` confirma exactamente los ficheros del diff descrito: `apps/web/src/app/design-system/page.tsx`, `apps/web/src/app/fonts/*`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `docs/design-system/**`). No hay compose/BD que levantar (web estática `output: 'export'`, sin backend). Servido con `npx serve apps/web/out -l 4173` tras `pnpm build`.

## Verificación esperada (literal de planning.md)
> `/design-system` en navegador muestra los specimens; comparación visual contra las guidelines del espejo (`colors-*.card.html`, `type-*.card.html`, `spacing-*.card.html`) sin desviaciones perceptibles; cero requests de red a `fonts.googleapis.com` en el panel de red del navegador.

## Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (0 errores; 5 warnings preexistentes de `import-x/no-named-as-default-member` en `eslint.config.ts`/`scripts/readme-status.mjs`, no relacionados con el diff). Output: `docs/verifications/TD.1/gate-output.txt`.
2. `pnpm build` → `apps/web/out/design-system.html` generado sin errores (`Route (app) ... └ ○ /design-system`). Output: `docs/verifications/TD.1/build-output.txt`.
3. Serví `apps/web/out/` con `serve` en `:4173` y abrí `/design-system` con agent-browser (sesión `td1`).
4. `snapshot -i` → confirma las 14 secciones/specimens esperados: Colores (Brand/Gradient/Neutral/Sand/Semantic), Tipografía (Display/Body/Eyebrow), Espaciado y radios (Radios&Sombras/Escala). Screenshot completo: `01-design-system-full.png`.
5. Comparación visual specimen a specimen contra los `*.card.html` del espejo (`docs/design-system/guidelines/`), abriendo cada uno por `file://` y capturando: `guideline-cards/{colors-brand,colors-gradient,colors-neutral,colors-sand,colors-semantic,type-display,type-body,type-eyebrow,spacing-radius,spacing-scale}.png`. Comparé cada captura contra la sección equivalente de `01-design-system-full.png`: mismos colores, mismo orden de swatches/tokens, mismas proporciones de barras de espaciado y radios, mismo texto/color/peso en los specimens de tipografía. Sin desviaciones perceptibles.
6. Inspección del DOM computado (`eval getComputedStyle`) sobre `h1`/`h2`/`h3` de la página (no hay `h4`): los tres usan `font-family: oswaldDisplay, "oswaldDisplay Fallback", "Arial Narrow", sans-serif` — la clase generada por `next/font/local` para el Oswald self-hosted, **no** la fuente cruda `'Oswald'` que el bug de colisión de capas producía antes del fix. Confirmado además vía `document.fonts`: `oswaldDisplay` peso 600 con `status: "loaded"` (coincide con el peso real usado en los headings), e `interBody` pesos 400/500 `"loaded"` para el cuerpo. Ningún fallback quedó activo. Output: `computed-fonts.txt`, `font-faces-check.txt`.
7. Panel de red (`agent-browser network requests`, log limpiado y recargado fresco antes de capturar) durante la carga de `/design-system`: 15 requests, todas a `localhost:4173` (`_next/static/media/*.woff2` para las 8 fuentes, chunks JS/CSS). **Cero** requests a `fonts.googleapis.com` o `fonts.gstatic.com`. Output: `network-requests.txt`.
8. Verificación cruzada explícita filtrando por dominio (`--filter fonts.googleapis.com` / `--filter fonts.gstatic.com`) sobre el log de sesión completo: aparecen requests a esos dominios, pero **todas proceden de la carga de los `*.card.html` del espejo** (paso 5, `docs/design-system/styles.css` con `@import` de Google Fonts — comportamiento heredado del proyecto Claude Design original, espejo de solo lectura, fuera de alcance de esta tarea) — ninguna proviene de `/design-system`. Confirmado también por el log limpio del paso 7, capturado en aislamiento antes de tocar los ficheros del espejo. Output: `google-fonts-check-1.txt`, `google-fonts-check-2.txt`.
9. Consola y errores del navegador durante la carga de `/design-system`: ambos vacíos (`browser-console.txt`, `browser-errors.txt` sin contenido) — sin warnings ni errores JS.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `/design-system` muestra los specimens (colores, tipografía, espaciado/radios) | 14 secciones renderizadas: Brand/Gradient/Neutral/Sand/Semantic, Display/Body/Eyebrow, Radios&Sombras/Escala | `01-design-system-full.png` | OK |
| 2 | Comparación visual contra `colors-*.card.html` sin desviaciones perceptibles | Colores, orden y proporciones idénticos en brand/gradient/neutral/sand/semantic | `guideline-cards/colors-*.png` vs `01-design-system-full.png` | OK |
| 3 | Comparación visual contra `type-*.card.html` sin desviaciones perceptibles | Specimen "RIDE MÁLAGA" idéntico en display; párrafos body idénticos; eyebrow idéntico | `guideline-cards/type-*.png` | OK |
| 4 | Comparación visual contra `spacing-*.card.html` sin desviaciones perceptibles | Radios sm/md/lg/pill y escala de espaciado (space-2…20) idénticos en proporción y valores | `guideline-cards/spacing-*.png` | OK |
| 5 | Headings usan Oswald self-hosted, no la fuente cruda (regresión del bug de colisión de capas) | `h1`/`h2`/`h3` computan `font-family: oswaldDisplay...`; `document.fonts` confirma la face `oswaldDisplay` cargada y en uso | `computed-fonts.txt`, `font-faces-check.txt` | OK |
| 6 | Cero requests a `fonts.googleapis.com`/`fonts.gstatic.com` al cargar `/design-system` | 15/15 requests a `localhost:4173`; 0 a dominios de Google Fonts | `network-requests.txt` | OK |
| 7 | (implícito) sin errores/warnings en consola | Consola y errores vacíos | `browser-console.txt`, `browser-errors.txt` | OK |

## Coste real
$0 — sin APIs de pago; build/serve/agent-browser locales.

## Veredicto
PASS — los tres puntos literales de la Verificación se cumplen: specimens renderizados y completos, comparación visual sin desviaciones perceptibles contra los 10 `*.card.html` relevantes del espejo (colors-brand/gradient/neutral/sand/semantic, type-display/body/eyebrow, spacing-radius/scale), y cero requests a `fonts.googleapis.com`/`fonts.gstatic.com` en la carga real de `/design-system`. El fix de la colisión de capas CSS (`--font-display`/`--font-body`/`--font-mono` renombrados a `-src` fuera de `@theme inline`) se confirmó funcionando en el navegador real, no solo por compilación: los headings usan la face self-hosted `oswaldDisplay`, no el fallback crudo `'Oswald'`.

Notas / rarezas (no bloquean el PASS):
- Los `*.card.html` del espejo (`docs/design-system/guidelines/`) sí cargan Google Fonts vía `@import` en `docs/design-system/styles.css` — es el comportamiento original del proyecto Claude Design, un espejo de solo lectura que no se edita (regla del proyecto). La Verificación exige cero requests de Google Fonts al navegar `/design-system` (nuestra página), no al abrir los ficheros de guía — distinción que confirmé aislando el log de red por navegación.
- `pnpm gate` mostró 5 warnings preexistentes (`import-x/no-named-as-default-member`) en ficheros no tocados por este diff (`eslint.config.ts`, `scripts/readme-status.mjs`); no son parte de TD.1 y no bloquean.
- El sistema estaba con el diff staged pero no commiteado en el momento de verificar — coherente con el protocolo del bucle (el commit ocurre tras el veredicto PASS).
