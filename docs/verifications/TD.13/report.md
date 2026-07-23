# Verificación TD.13 — Navegación anterior/siguiente en el Lightbox de Gallery

- **Tarea**: TD.13 · Navegación anterior/siguiente en el Lightbox de Gallery (`planning.md`)
- **Fecha**: 2026-07-23
- **Ejecutor**: verifier (contexto fresco) · agent-browser (npx -y, última versión resuelta en el momento de la sesión) · sesión `td13`
- **Sistema**: working tree sin commitear sobre HEAD `030b2c795d9bc32ecc2be3f531aaad8c58d75dc0` (`git status` limpio salvo el diff de la propia tarea + `.claude/settings.json`, no relacionado con TD.13). Verificado en dos modos: (a) `pnpm dev` / Playwright contra servidor de test, y (b) `pnpm build` (export estático) servido con `npx serve -l 4173 out` para la comprobación manual en navegador (agent-browser), tal como exige el proyecto (`output: 'export'`).

## Verificación esperada (literal de planning.md)
> en navegador, `/en/gallery` (y confirmación cruzada en `/es`/`/de`) — abrir una foto del grid, navegar con las flechas (ratón y teclado) por varias fotos consecutivas en ambas direcciones, comprobar el comportamiento en los extremos (primera/última foto); comparación visual contra la card `Lightbox` actualizada del espejo de Claude Design; `pnpm gate` verde.

## Pasos ejecutados

1. `pnpm gate` desde la raíz → verde (lint, typecheck, format:check, knip, readme:status:check, `vitest run` 19/19 unit tests).
2. `pnpm exec playwright test gallery.spec.ts` (14 tests, incluye los 4 nuevos de TD.13) → 14/14 verde.
3. Estrés específico del test de límites (121 `ArrowRight` seguidos), por la duda que dejó `simplify` sobre closures obsoletos al cambiar `onPrev`/`onNext` de updater funcional a captura directa de `openIndex`:
   - `--repeat-each=10` (10 ejecuciones) → 10/10 verde.
   - `--repeat-each=15 --workers=4` (15 ejecuciones más, en paralelo) → 15/15 verde.
   - Total: **25/25 ejecuciones del test de límites, sin un solo fallo**. No se reprodujo ninguna regresión de closure obsoleto — el cambio de `simplify` se considera seguro.
4. `pnpm exec playwright test` (suite completa e2e) → 53/53 verde — sin regresiones en otros specs por los cambios compartidos (`icon.tsx`, contrato `messages.ts`, `page.tsx` del design-system).
5. `pnpm build` → export estático generado sin errores; servido con `serve -l 4173 out`.
6. Navegador real (agent-browser, sesión `td13`) contra `http://localhost:4173`:
   - `/en/gallery/`: abrir foto 5 → click "Next photo" → foto 6 → click "Previous photo" → foto 5 → `ArrowRight` → foto 6 → `ArrowRight` → foto 7 → `ArrowLeft` → foto 6. Ratón y teclado navegan correctamente en ambas direcciones, foto exacta en cada paso.
   - Foco atrapado: tras navegar por teclado, `document.activeElement` sigue dentro de `[data-slot="lightbox"]`; 8 pulsaciones de `Tab` adicionales no lo sacan del diálogo (cicla de vuelta al botón de cerrar).
   - Extremo inferior: foto 1 → solo aparecen "Close image viewer" y "Next photo", **sin** "Previous photo".
   - Extremo superior: 121 `ArrowRight` consecutivos desde la foto 1 → foto 122 (la última de las 122 reales), solo aparecen "Close image viewer" y "Previous photo", **sin** "Next photo". Coincide con el límite superior verificado en el spec de Playwright.
   - `/es/gallery/`: aria-labels correctos — "Foto anterior" / "Foto siguiente" (no en inglés). Navegación por click y por `ArrowLeft`/`ArrowRight` verificada (foto 2 → 3 → 2).
   - `/de/gallery/`: aria-labels correctos — "Vorheriges Foto" / "Nächstes Foto" (no en inglés). Navegación por click y `ArrowRight` verificada (foto 2 → 3 → 4).
   - Consola del navegador (`agent-browser console`) limpia en EN y DE — sin errores ni warnings de código propio.
   - Contraste de texto/icono: `getComputedStyle` del botón `[data-slot="lightbox-next"]` → color `rgb(250,246,240)` (texto normal) y `rgb(184,181,174)` (hover, `.text-text-on-dark-secondary`) sobre el scrim `--charcoal-900` al 90% de opacidad (mismo patrón ya usado por el botón de cerrar de TD.11). Ratios calculados: ~11.8:1 (normal) y ~6.2:1 (hover) — ambos muy por encima del umbral WCAG 4.5:1.
7. Comparación visual contra el espejo de Claude Design:
   - `docs/design-system/components/media/lightbox.card.html` referencia un bundle (`../../_ds_bundle.js`) que no existe como fichero standalone — no es renderizable de forma aislada vía `file://` (confirmado: `#root` queda vacío, sin bundle). Es el patrón esperado por el propio protocolo (cua.md, "si el card HTML no es práctico de renderizar, usar el `.jsx` renderizado en `/design-system`").
   - Se comparó en su lugar contra el diff de `Lightbox.jsx` (el espejo actualizado por DesignSync) y el `LightboxShowcase` real en `/design-system` (ruta `output: 'export'` construida, no dev): mismo patrón de renderizado condicional (`onPrev ? <button>… : null`), mismos iconos `chevron-left`/`chevron-right`, misma posición (`top: 50%`, `left/right: 16px` en el mirror ≈ `left-4`/`right-4` con `sm:left-6`/`sm:right-6` en Tailwind), mismo tamaño de botón (40×40) e icono (28px), mismo color (`--text-on-dark`). Capturas `07-ds-showcase-open.png` (foto 1 de la demo, sin botón "anterior") y `08-ds-showcase-middle-both-arrows.png` (foto 2 de la demo, ambos botones) confirman que la implementación coincide visualmente con el patrón del espejo.

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Flechas de ratón navegan varias fotos consecutivas en ambas direcciones (`/en`) | 5→6 (Next), 6→5 (Previous) correcto | 01, 02 | ✅ |
| 2 | Teclado `ArrowLeft`/`ArrowRight` hace lo mismo, foco no escapa | 5→6→7→6 correcto; foco sigue en `[data-slot="lightbox"]` tras navegar y tras 8 Tabs | consola de comandos | ✅ |
| 3 | Primera foto sin botón "anterior" | Foto 1: solo Close + Next | 03-en-photo1-first-no-prev.png | ✅ |
| 4 | Última foto sin botón "siguiente" | Foto 122 (tras 121 ArrowRight): solo Close + Previous | 04-en-photo122-last-no-next.png | ✅ |
| 5 | Confirmación cruzada `/es`: aria-labels en español, navegación funcional | "Foto anterior"/"Foto siguiente"; click y teclado avanzan/retroceden correctamente | 05-es-photo2-labels.png | ✅ |
| 6 | Confirmación cruzada `/de`: aria-labels en alemán, navegación funcional | "Vorheriges Foto"/"Nächstes Foto"; click y teclado avanzan/retroceden correctamente | 06-de-photo2-labels.png | ✅ |
| 7 | Comparación visual vs card `Lightbox` del espejo de Claude Design | Card HTML no renderizable standalone (bundle ausente, comportamiento esperado); comparación equivalente vía `Lightbox.jsx` diff + showcase real en `/design-system` — coincide en icono, posición, tamaño, color y patrón condicional | 07, 08 + diff de `Lightbox.jsx` | ✅ |
| 8 | `pnpm gate` verde | Verde (lint/typecheck/format/knip/readme-status/vitest) | terminal | ✅ |
| 9 (estrés adicional) | El test de límites (121 ArrowRight) es estable frente al cambio de `simplify` (closures) | 25/25 ejecuciones repetidas (10 secuenciales + 15 con 4 workers en paralelo) en verde, ninguna regresión | terminal | ✅ |

## Coste real
$0 — sin APIs de pago. Todo el flujo se ejecutó contra el servidor de test de Playwright y contra un `pnpm build` servido localmente con `serve`.

## Veredicto
**PASS** — todos los puntos de la Verificación literal se cumplen, incluida la comprobación cruzada de extremos, foco atrapado, i18n de los 3 idiomas y comparación visual con el design system. El estrés adicional pedido sobre el test de límites (25 ejecuciones repetidas, incluidas 15 en paralelo) no reprodujo ninguna regresión de closures obsoletos: el cambio de `simplify` (captura directa de `openIndex` en vez de updater funcional) es seguro tal como está.

Rarezas observadas (no bloquean el PASS):
- `docs/design-system/components/media/lightbox.card.html` no es renderizable de forma aislada (depende de `../../_ds_bundle.js`, que no existe como fichero suelto en el repo) — es coherente con cómo DesignSync genera estos cards (se ensamblan en un pipeline propio, no standalone vía `file://`), y el propio protocolo de verificación (cua.md) contempla esta excepción y remite al `/design-system` renderizado como alternativa, que sí se usó.
- `.claude/settings.json` aparece modificado en el working tree pero no forma parte del diff de TD.13 (no se tocó en esta verificación).
