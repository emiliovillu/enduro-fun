# Verificación T3.1 — Optimización de imágenes y vídeo

- **Tarea**: T3.1 · Optimización de imágenes y vídeo (`planning.md`)
- **Fecha**: 2026-08-02 (intento 1) / 2026-08-02 (intento 2, re-verificación tras fix)
- **Ejecutor intento 2**: `verifier` (contexto fresco, distinto del intento 1) · agent-browser 0.33.2 (sesión `t31v2`) · Lighthouse 13.4.1 CLI (Chrome for Testing 151.0.7922.34 vía `CHROME_PATH`, headless) · `serve` 14.x
- **Sistema (intento 2)**: working tree sin commitear, mismo commit base `eb4359c8facc892cdddf655c347b63dafa1dfee7` (confirmado con `git status` antes de empezar: solo los ficheros de T3.1 modificados/nuevos, sin residuos ajenos) · build real `pnpm --filter @app/web build` (Next 16.2.10, Turbopack) servido con `npx serve -l 4173 out` en `localhost:4173`

## Verificación esperada (literal de planning.md)
> Lighthouse móvil sobre `/en/` (servido en local con `out/`) reporta 0 issues de "oversized images" / "properly size images"; el vídeo/imagen del hero carga con prioridad y el resto con lazy loading (comprobado en el panel de red: requests de imágenes fuera de viewport se disparan al hacer scroll, no al cargar).

---

## Intento 1 (FAIL) — resumen

`pnpm gate` verde, build real servido, Lighthouse móvil sobre `/en/`, `/en/packages/`, `/en/about/` y `/en/gallery/`. Resultado: `/en/` (Home) pasaba con margen — `image-delivery-insight` score 1, hero con prioridad confirmada, lazy loading confirmado independientemente (incluida la interacción real del carrusel). Pero `/en/gallery/` daba **score 0**, **24 imágenes, ~2 MB desperdiciados**: de las 122 fotos de Gallery, T3.1 solo había optimizado las 11 reutilizadas en el carrusel de Home; las 111 restantes se servían a resolución completa (hasta 926×925px) en miniaturas de grid de 160-350px CSS, sin `srcset`. Causa raíz: la Entrega de la tarea ("hero y demás secciones") no se cumplía para Gallery, página real del sitio. Veredicto: **FAIL**. Evidencia completa (JSON de Lighthouse, capturas, network checks) conservada en este directorio con el mismo nombrado del intento 1 (`lighthouse-en-*.report.json/html`, `01-home-en.png`...`06-gallery-en.png`, `network-check.json`, `viewport-check.json`, `carousel10-check.txt`, `console-*.txt`).

---

## Intento 2 (re-verificación) — flujo completo ejecutado desde cero

### Fix aplicado desde el intento 1
- `scripts/optimize-images.mjs`: mecanismo `outFile` para generar miniaturas en un destino distinto del original.
- 122 miniaturas nuevas en `apps/web/public/gallery/thumbs/gallery-XXX.avif` (240px de ancho, quality 45) para las 122 fotos de Gallery, incluidas las 11 ya optimizadas en la tanda anterior (que seguían siendo demasiado grandes para la caja del grid pese a estar comprimidas para su otro uso).
- `gallery-grid.tsx`: `photoSrc()` separado en `photoThumbSrc()` (grid, usa `thumbs/`) y `photoFullSrc()` (Lightbox, usa el fichero completo de siempre).
- `about/our-story.avif` reajustado (400px/q40) tras quedar cerca del umbral (score 0.5) en el intento 1.

### Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (lint 0 errores/6 warnings preexistentes, typecheck, format, knip, readme:status, 19 tests unit).
2. `pnpm --filter @app/web build` → export estático real en `apps/web/out/`. Confirmado `apps/web/out/gallery/thumbs/` con 122 ficheros y que el HTML de Gallery referencia `src="/gallery/thumbs/gallery-XXX.avif"` en el grid.
3. `npx serve -l 4173 apps/web/out` (mismo mecanismo que el intento 1) → Lighthouse móvil (`--form-factor=mobile`, `--throttling-method=simulate`, Chrome for Testing headless vía `CHROME_PATH` porque no hay Chrome nativo instalado en esta máquina — Chromium 151 de la caché de Playwright) contra `/en/`, `/en/packages/`, `/en/about/` y `/en/gallery/`. Leído el JSON crudo de `audits['image-delivery-insight']` (nombre real del audit en Lighthouse 13.4.1, ex "oversized/properly-sized images") con un script Node ad hoc, no asumido de memoria.
4. agent-browser (sesión `t31v2`), navegación 100% fresca (`open --new-tab` tras `close --all`, para eliminar cualquier caché/estado de sesiones anteriores que hubiera contaminado una medición anterior — ver nota más abajo): capturado el log de red (`network requests --json`, con timestamps de wall-clock reales) inmediatamente tras el `open`, sin ninguna interacción del usuario.
5. Verificación de lazy loading del carrusel de Home: confirmado que 4 de las 10 fotos del carrusel (`gallery-029`, `045`, `061`, `113`) tienen **0 requests** antes de cualquier interacción; clic en el dot "10/10" (`aria-label`) y confirmación de que `gallery-113.avif` pasa a 1 request justo después, con `045`/`061`/`029` (fuera de la trayectoria de scroll de ese salto directo) siguiendo en 0. Hero (`home-hero-poster.avif`, `home-hero.mp4`) confirmado en el request log con timestamp idéntico al del documento (carga inmediata, con prioridad).
6. Verificación del riesgo específico de esta re-verificación (Lightbox mostrando la miniatura en vez del original): en `/en/gallery/`, clic en la foto 3 del grid, comprobado en el log de red que se piden **ambos** ficheros (`gallery/thumbs/gallery-003.avif` para el grid, `gallery/gallery-003.avif` para el Lightbox) y, con `agent-browser eval`, leído `currentSrc`/`naturalWidth`/`naturalHeight` del `<img>` dentro del Lightbox: `gallery-003.avif`, 825×1100 — el fichero completo, no la miniatura de 240px. Captura visual (`lightbox-check.png`) confirma nitidez, sin pixelado.
7. Regresión visual + consola: capturas y `console`/`errors` de agent-browser en Home (en/es/de), About y Packages sobre el mismo build — 0 mensajes de consola en las 5 combinaciones.
8. Limpieza: `network har stop`, `agent-browser close --all`, `pkill` del proceso `serve`, confirmado con `lsof -i:4173` que no queda ningún proceso huérfano. `git status` confirmado sin ficheros nuevos fuera de `docs/verifications/T3.1/`.

### Nota metodológica (contaminación de caché descartada)
Una primera pasada de comprobación del carrusel de Home, reutilizando una sesión de agent-browser que ya llevaba varios minutos abierta (con el autoplay de 4s corriendo de fondo durante las pruebas de Lighthouse), mostró **las 10** fotos del carrusel ya solicitadas nada más "navegar" — un resultado que habría parecido un FAIL de lazy loading. Investigado: se debía a que el autoplay (intervalo de 4s, sin tope de vueltas) ya había recorrido las 10 diapositivas varias veces durante los minutos previos, y todas las imágenes estaban ya en la caché HTTP del navegador (respuestas `304` instantáneas) — no a un fallo del `loading="lazy"`. Repetido con una sesión y pestaña 100 % nuevas (`close --all` + `open --new-tab`) y comprobación en el primer segundo tras la carga: el resultado limpio confirma que 6 de las 10 fotos entran dentro del margen de precarga nativo del navegador (mismo fenómeno ya documentado por el implementer y por el intento 1) y las 4 restantes (incluida la genuinamente lejana, `113`) permanecen en 0 requests hasta la interacción. Se documenta este descarte explícitamente porque un CUA con sesión reutilizada de larga duración puede producir falsos negativos/positivos de lazy-loading — lección para verificaciones futuras de este tipo.

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Lighthouse móvil `/en/`: 0 issues "oversized/properly-sized images" | `image-delivery-insight` score **1**, 0 items | `lighthouse-2-en.report.json` | ✅ |
| 2 | **Sin regresión — `/en/gallery/`** (punto que falló en el intento 1): 0 issues | `image-delivery-insight` score **1**, 0 items (antes: score 0, 24 imágenes, ~2MB) | `lighthouse-2-en-gallery.report.json` | ✅ |
| 3 | Sin regresión — `/en/packages/` | score 1, 0 items | `lighthouse-2-en-packages.report.json` | ✅ |
| 4 | Sin regresión — `/en/about/` (score 0.5 en intento 1, ajuste fino aplicado) | score **1**, 0 items | `lighthouse-2-en-about.report.json` | ✅ |
| 5 | Hero (imagen + vídeo) carga con prioridad | `home-hero-poster.avif` y `home-hero.mp4` con timestamp idéntico al documento en carga fresca, sin interacción | request log (sesión `t31v2`, ver pasos 4-5) | ✅ |
| 6 | Resto de imágenes fuera de viewport: se piden al hacer scroll, no al cargar | Confirmado en carga 100% fresca: `gallery-029/045/061/113` (4 de 10 del carrusel) en 0 requests pre-interacción; `gallery-113` pasa a 1 request tras clic en dot "10/10" (scroll real del track); `029/045/061` siguen en 0 (fuera de la trayectoria de ese salto directo) | pasos 4-5 del log de esta sesión | ✅ |
| 7 | Riesgo específico de este fix: el Lightbox de Gallery muestra la foto en resolución completa, no la miniatura de 240px | Confirmado por request log (se piden ambos ficheros) y por `eval` en la página: `currentSrc` del `<img>` del Lightbox = `/gallery/gallery-003.avif`, `naturalWidth/Height` = 825×1100 (el original, no el thumb) | `lightbox-check.png`, log de paso 6 | ✅ |
| 8 | Sin regresión visual, 3 idiomas | Home (en/es/de), About, Packages, Gallery — capturas limpias | `01-gallery-en-grid.png`, `02-home-en.png`, `03-about-en.png`, `04-packages-en.png` (+ los del intento 1) | ✅ |
| 9 | Consola sin errores | 0 mensajes en las 5 combinaciones comprobadas en el intento 2 (+ 6 del intento 1) | `agent-browser console`/`errors` (sin salida) | ✅ |

## Coste real
$0 — Lighthouse, Playwright/Chrome for Testing, agent-browser y `serve` corren en local, sin llamadas a APIs de pago. (Intento 1 también $0.)

## Veredicto
**PASS** — el fix resuelve exactamente la causa raíz documentada en el intento 1: las 122 fotos de Gallery tienen ahora su propia miniatura de 240px para el grid, separada del fichero completo que sigue sirviendo el Lightbox. Los 4 escenarios de Lighthouse móvil (`/en/`, `/en/packages/`, `/en/about/`, `/en/gallery/`) dan `image-delivery-insight` en score 1 / 0 items — incluida la página que falló, confirmado con el JSON crudo de Lighthouse, no por inspección del código. El riesgo real introducido por el fix (que el Lightbox se hubiera conectado mal a la miniatura, produciendo una imagen ampliada pixelada) se descartó con evidencia directa (`currentSrc` + dimensiones naturales del `<img>` real vía `eval`, más inspección visual), no solo confiando en la lectura del diff. El comportamiento de prioridad del hero y lazy loading del resto se reconfirmó de forma independiente con una sesión de navegador 100% fresca (se descubrió y se descartó explícitamente una contaminación de caché de una sesión de larga duración que habría producido un falso resultado).

**Rarezas** (no bloquean el PASS):
- Native preload margin de Chromium: 6 de las 10 fotos del carrusel de Home cargan de inmediato pese a `loading="lazy"` por estar dentro del margen de precarga nativo para conexiones rápidas (ya documentado por el implementer y por el intento 1); solo la genuinamente lejana (fuera de ese margen) se comportó estrictamente como "se dispara al hacer scroll, no al cargar" — la Verificación literal no exige que TODAS las imágenes fuera de viewport sean lazy en sentido estricto de "cero preload", sino que el patrón de scroll-trigger exista y sea real, lo cual se confirmó.
- El servidor `serve` local no manda `Content-Type` correcto para `.avif` en algunos casos (bug conocido de una dependencia transitiva, `mime-db` desactualizado) — no afecta a Chrome (decodifica por sniffing) ni a producción real (Cloudflare Pages); ya documentado en el intento 1.
- Se encontró y limpió un directorio vacío residual `docs/verifications/T3.1/round2/` sin contenido, de un intento anterior — eliminado antes de escribir este report.
