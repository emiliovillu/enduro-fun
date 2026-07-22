# TD.12 — Verificación (re-verificación tras fix de traducción DE)

## Contexto
Un verifier anterior (contexto distinto) emitió **FAIL** por `about.fleet.categories.trailAdventure` sin traducir en `apps/web/src/messages/de.json` (idéntico byte a byte al inglés "Trail & Adventure"), con el test Playwright DE horneando ese mismo string inglés como valor esperado (ocultando el hueco). Se corrigió a `"Trail & Abenteuer"` y se actualizó `apps/web/e2e/about.spec.ts` (línea 119: `getByText('Trail & Abenteuer')`). Esta es una re-verificación completa y de cero (no solo del punto que falló), con evidencia propia y actual. El `report.md` anterior (íntegro) queda documentado más abajo como historial; este documento lo sustituye como veredicto vigente.

## Sistema bajo prueba
- `pwd` confirmado: `/Users/personal/Developer/enduro-fun` (raíz del repo, no `apps/web`).
- `git log --oneline -5` HEAD: `31de478 docs(planning): add TD.12 — FleetCard component + "Our fleet" section on About` (código de la tarea en working tree, no commiteado aún — normal antes del cierre por el bucle). `git status` limpio salvo los ficheros de la tarea TD.12 (+ un fichero preexistente sin relación: `.claude/settings.json`).
- Confirmado en código (no solo en el diff, en el fichero real): `de.json:63` → `"trailAdventure": "Trail & Abenteuer"`; `en.json:63` → `"Trail & Adventure"`; `es.json:63` → `"Trail y Aventura"`. Los tres difieren entre sí — ya no hay copia silenciosa del inglés.
- `about.spec.ts` línea 119: `await expect(page.getByText('Trail & Abenteuer')).toBeVisible();` (ya no usa el string inglés).

## Punto por punto

| Punto de la Verificación | Esperado | Observado | OK |
|---|---|---|---|
| `pnpm gate` (raíz) | verde | lint 0 errores/5 warnings preexistentes no relacionados (import-x/no-named-as-default-member en `eslint.config.ts` y `scripts/readme-status.mjs`, nada de TD.12), typecheck OK (apps/web + packages/core), format:check OK, knip OK, readme:status:check OK, `vitest run` 17/17. Log: `gate-output.log` | OK |
| `pnpm --filter @app/web exec playwright test` | verde, incluido el test DE de flota | **49/49 passed**. Confirmados explícitamente por nombre: `/en/about muestra "Our fleet" en la posición correcta con las 2 motos`, `/es/about muestra "Nuestra flota"...`, `/de/about muestra "Unsere Flotte" con las 2 motos y categorías en alemán` — este último pasa con la nueva aserción `Trail & Abenteuer`. Log: `pw-output.log` | OK |
| Posición de la sección (los 3 idiomas) | "Nuestra flota" justo después de guías/historia, antes de "What makes us different" | Confirmado por accessibility-tree DE (`heading level=2`: "Zuerst Fahrer, dann Guides von Beruf" → "Die Motorräder, die wir fahren" → "Drei Dinge, die Fahrern auffallen") y visualmente en capturas full-page EN/DE (`re-01-de-full.png`, `re-02-en-full.png`, `re-03-es-full.png`) | OK |
| Layout 2 columnas | mismas clases de grid que "Our story"/guías arriba | Confirmado visualmente — 2 `FleetCard` en fila, mismo ancho de contenido/gutter que el resto de secciones de la página (el `SectionHeading` va encima del grid, no embebido en una columna como en "Our story" — mismo matiz ya anotado en el intento anterior, no bloqueante) | OK (con nota heredada) |
| Datos reales de las 2 `FleetCard` | Husqvarna TE 300 300cc Enduro / Husqvarna Norden 901 901cc Trail&Aventura | Confirmado leyendo el DOM renderizado (no solo capturas) en los 3 idiomas: EN "ENDURO / 300cc / HUSQVARNA TE 300" + "TRAIL & ADVENTURE / 901cc / HUSQVARNA NORDEN 901"; ES "ENDURO / 300cc / HUSQVARNA TE 300" + "TRAIL Y AVENTURA / 901cc / HUSQVARNA NORDEN 901"; DE "ENDURO / 300cc / HUSQVARNA TE 300" + **"TRAIL & ABENTEUER**  / 901cc / HUSQVARNA NORDEN 901" | OK |
| Nombres de modelo NO traducidos | idénticos en los 3 idiomas | "HUSQVARNA TE 300" y "HUSQVARNA NORDEN 901" idénticos byte a byte en las 3 extracciones de texto | OK |
| Resto del copy SÍ traducido en los 3 idiomas, incl. categoría "Trail & Adventure" (el punto que había fallado) | traducción real, no copia del inglés | **Corregido y confirmado en vivo**: DE muestra "TRAIL & ABENTEUER" (no "TRAIL & ADVENTURE"). Verificado tanto en el DOM renderizado real (`get text body` tras navegar a `/de/about/`) como en captura de pantalla (`re-01-de-full.png`, badge visible en la 2ª card). "Enduro" se mantiene igual en los 3 idiomas — término internacional sin traducción real, mismo criterio aceptado en el intento anterior | OK |
| Comparación visual contra card del espejo de Claude Design | — | El `.card.html` del espejo sigue sin renderizar standalone vía `file://` (bundle `_ds_bundle.js` remoto no regenerado, deuda preexistente ya anotada en TD.4/TD.11/intento anterior de TD.12 — reproducido de nuevo: `re-04-ds-mirror-attempt.png` muestra página en blanco con el código fuente JSX como texto). Reconstruida la comparación desde el código fuente: `FleetCard.jsx` (espejo, leído íntegro) vs `apps/web/src/components/ui/fleet-card.tsx` (leído íntegro) — misma estructura: badge absoluto arriba-derecha (`tone="neutral"`), bloque imagen 180px/h-45 con degradado tokenizado `charcoal-700→900` y cc en mono abajo-izquierda, bloque de texto padding 24px/p-6 con h3+descripción. El render real (`re-05-en-fleet-section.png`) coincide visualmente con esa estructura | OK (con deuda preexistente ya conocida, no bloquea) |

## Evidencia (nueva, de esta re-verificación)
- `docs/verifications/TD.12/gate-output.log` — `pnpm gate` completo, verde
- `docs/verifications/TD.12/pw-output.log` — `pnpm --filter @app/web exec playwright test`, 49/49 verdes
- `docs/verifications/TD.12/re-01-de-full.png` — `/de/about/` completa, "TRAIL & ABENTEUER" visible
- `docs/verifications/TD.12/re-02-en-full.png` — `/en/about/` completa
- `docs/verifications/TD.12/re-03-es-full.png` — `/es/about/` completa
- `docs/verifications/TD.12/re-04-ds-mirror-attempt.png` — intento de render standalone del espejo de Claude Design (en blanco, deuda ya conocida)
- `docs/verifications/TD.12/re-05-en-fleet-section.png` — sección "Our fleet" en detalle, comparable estructuralmente con el espejo
- Evidencia del intento FAIL anterior conservada sin sobrescribir: `01-en-fleet-full.png`, `02-en-fleet-section.png`, `03-en-full-page.png`, `04-de-full.png`, `05-es-full.png`, `ds-fleet-card.png`

## Coste real
$0 — solo herramientas locales: `pnpm gate`, `pnpm build`, Playwright, `agent-browser` (npx) contra `out/` servido localmente con `npx serve`. Sin llamadas a APIs de pago.

## Veredicto
**PASS** — el motivo del FAIL anterior (`de.json` → `trailAdventure` sin traducir, test DE horneando el string inglés) está corregido y verificado en vivo: `/de/about/` muestra "TRAIL & ABENTEUER" en el DOM renderizado real, distinto byte a byte del inglés y del español, y el test Playwright permanente asocia el valor correcto. El resto de puntos de la Verificación (posición de la sección en los 3 idiomas, layout 2 columnas, datos reales de las 2 motos, nombres de modelo no traducidos, estructura fiel al espejo de diseño, `pnpm gate` verde) se mantienen cumplidos, igual que en el intento anterior.

### Rarezas (no bloquean)
- El `SectionHeading` de "Nuestra flota" va encima del grid de 2 columnas, no embebido en una columna como en "Our story" arriba — decisión de producto razonable y ya documentada por el implementer, difiere ligeramente de una réplica 1:1 del patrón de layout de la sección anterior.
- El espejo local de Claude Design (`fleet-card.card.html`) sigue sin renderizar standalone por el bundle remoto sin regenerar (deuda preexistente TD.4/TD.11, no de esta tarea).
