# Verificación TD.11 — Componente Lightbox (visor de imagen a pantalla completa con overlay)

- **Tarea**: TD.11 · Componente Lightbox (`planning.md`)
- **Fecha**: 2026-07-22
- **Ejecutor**: verifier · agent-browser (npx -y agent-browser, latest) · sesión `td11`
- **Sistema**: commit `538b00f` (HEAD) con el diff de TD.11 en working tree (sin commitear todavía, es lo esperado — el bucle no ha cerrado la tarea aún). `git status` confirmado antes de empezar: cambios exactamente en `lightbox.tsx`, `gallery-grid.tsx`, `gallery.spec.ts`, mensajes i18n, espejo `docs/design-system/`. Build estático (`next build`, `output: 'export'`) servido con `npx serve out -l 4173`. Sin docker/DB — no aplica a este proyecto (web estática).

## Verificación esperada (literal de planning.md)
> en navegador, `/en/gallery` (y confirmación cruzada en `/es`/`/de` de que el lightbox funciona igual, sin texto que traducir salvo el `aria-label` del botón de cierre) — clicar varias fotos distintas del grid abre cada una ampliada con el overlay detrás, cerrar con los 3 mecanismos (botón/overlay/Escape) funciona, el foco se comporta según lo descrito arriba; comparación visual contra la card `Lightbox` del espejo de Claude Design; `pnpm gate` verde.
>
> (El "foco se comporta según lo descrito arriba" se refiere al bullet de Playwright permanente de la tarea: click en una foto abre el lightbox con overlay visible y la imagen correspondiente; `Escape` cierra y devuelve el foco a la miniatura clicada; click en el overlay (fuera de la imagen) cierra; el foco queda atrapado dentro del diálogo mientras está abierto — `Tab` repetido no sale a elementos de detrás.)

## Pasos ejecutados

1. `pnpm gate` desde la raíz → lint/typecheck/format/knip/readme-status/test(15/15) todo verde.
2. `cd apps/web && pnpm build` → build estático 24 páginas OK; `npx serve out -l 4173`; `curl /en/gallery/` → 200.
3. `agent-browser` disponible en este entorno (a diferencia de sesiones previas del proyecto) — se usó para toda la verificación de UI, sesión nombrada `td11`.
4. Abierto `/en/gallery/`, snapshot: grid de 25 botones `Enduro trail photo N`. Click en foto 5 (`@e10`) → dialog "Enduro trail photo 5" con `<img src="/gallery/gallery-005.avif">` — overlay/scrim visible detrás (`00-grid-initial.png`, `01-photo5-open.png`).
5. Cerrado con el botón de cerrar (`@e2`) → vuelve al grid.
6. Click en foto 20 (`@e25`) → dialog "Enduro trail photo 20" — imagen DISTINTA a la de la foto 5, confirmado por el texto del dialog y el screenshot (`02-photo20-open.png`).
7. Cierre por overlay: click en `[data-slot=lightbox-backdrop]` fue rechazado por agent-browser ("covered by la imagen" en el centro — la imagen ocupa gran parte del viewport), así que se hizo click con coordenadas de ratón fuera de la imagen (esquina 20,20, zona de overlay pura) → el lightbox se cerró.
8. Click en foto 15 (`@e20`) → `Escape` → lightbox se cierra; `document.activeElement.outerHTML` confirmado como el `<button>` con `alt="Enduro trail photo 15"` (el mismo que abrió el visor) — foco devuelto correctamente.
9. Reabierta foto 15, 15 pulsaciones de `Tab` consecutivas con el diálogo abierto → `document.activeElement` permanece siempre en `[data-slot=lightbox-close]` (único elemento focusable dentro del diálogo) — el foco nunca escapa al Header/Footer de detrás. Confirmado también que el foco entra automáticamente en el diálogo (al close button) nada más abrirse, sin acción del usuario.
10. `agent-browser console` sin errores/warnings de la app durante todo el flujo.
11. Repetido apertura+cierre (botón + overlay) en `/es/gallery/` (`03-es-open.png`, dialog "Foto de ruta de enduro 5", botón "Cerrar el visor de imagen") y `/de/gallery/` (`04-de-open.png`, dialog "Enduro-Trail-Foto 10", botón "Bildansicht schließen") — mismo comportamiento visual y de interacción; solo cambia el texto del `aria-label`.
12. Contraste del icono de cierre: `getComputedStyle` → icono `rgb(250,246,240)` sobre el scrim (`oklab(0.227 … / 0.9)` ≈ `rgb(50,50,51)` compuesto sobre el fondo canvas) → ratio calculado ≈ **11.9:1**, muy por encima del umbral 4.5:1.
13. Comparación visual contra el espejo de Claude Design: `docs/design-system/components/media/lightbox.card.html` referencia `_ds_bundle.js` para renderizar (patrón usado por todas las cards del proyecto), pero ese fichero **no existe en el espejo local** (`find docs/design-system -iname "*bundle*"` → vacío), así que la card local no renderiza standalone (root queda vacío, sin errores de consola). Se comprobó el remoto vía `DesignSync get_file` (`_ds_bundle.js`, `_ds_manifest.json`, proyecto `8ee30e13-...`): el bundle y el manifest remotos **tampoco incluyen `Lightbox`** en su lista de `components`/`cards` — se quedaron en el snapshot previo a TD.4/TD.11 (ni siquiera `Input`/`Textarea` de TD.4 aparecen). Es decir, la card de Lightbox subida por el implementer existe como fichero (`components/media/Lightbox.jsx` + `.card.html`) tanto en local como en remoto, pero el paso de regeneración del bundle/manifest que la haría renderizable y visible en el panel del Design System **no se ejecutó** — deuda preexistente del proyecto (afecta también a Input/Textarea de TD.4), no algo roto por esta tarea en particular, pero sigue siendo un hallazgo real: la card `Lightbox` no es hoy navegable/visible dentro de la app de Claude Design.
14. Para poder hacer la comparación visual pedida pese a lo anterior, se montó manualmente un render standalone con el código fuente real de `Lightbox.jsx`+`Icon.jsx` del espejo, los tokens CSS reales (`tokens/colors.css`, `spacing.css`, `typography.css`, `styles.css`) y el mismo prop set que usa `lightbox.card.html` (imagen placeholder con gradiente) — `06-ds-manual-render.png`. Comparado contra `01-photo5-open.png`/`02-photo20-open.png` de la app real: overlay/scrim oscuro ✓, botón de cerrar (X) en la esquina superior derecha con el mismo tamaño/posición ✓, imagen centrada con `border-radius` y sombra ✓, proporción de imagen respetada (`object-contain`, sin recorte) ✓. Coincide con el diseño.

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Clicar varias fotos distintas abre cada una ampliada con overlay detrás | Foto 5 → `gallery-005.avif`; foto 20 → dialog distinto; foto 15 → dialog distinto; overlay/scrim visible en todos | `01-photo5-open.png`, `02-photo20-open.png` | ✅ |
| 2 | Cierre con botón de cerrar | Click en `[data-slot=lightbox-close]` cierra | paso 5 | ✅ |
| 3 | Cierre con click en overlay (fuera de la imagen) | Click en coordenada de scrim (20,20) cierra | paso 7 | ✅ |
| 4 | Cierre con `Escape` | `Escape` cierra | paso 8 | ✅ |
| 5 | Tras `Escape`, foco vuelve a la miniatura clicada | `document.activeElement` = botón "Enduro trail photo 15" | paso 8 | ✅ |
| 6 | Foco atrapado dentro del diálogo (`Tab` repetido no escapa) | 15 `Tab` seguidos, foco permanece en el close button | paso 9 | ✅ |
| 7 | Mismo comportamiento en `/es/` y `/de/`, solo cambia el `aria-label` | Confirmado en ambos locales, textos traducidos solo en el label del botón de cerrar y en el nombre accesible del dialog | `03-es-open.png`, `04-de-open.png` | ✅ |
| 8 | Comparación visual contra la card `Lightbox` del espejo de Claude Design | Card local/remota no renderiza (falta `_ds_bundle.js`/manifest actualizado, deuda preexistente); comparación hecha reconstruyendo el render con el código fuente real de la card — coincide en overlay, posición de cierre, proporción de imagen | `06-ds-manual-render.png` vs `01-photo5-open.png` | ✅ (con hallazgo, ver Rarezas) |
| 9 | `pnpm gate` verde | lint/typecheck/format/knip/readme-status/test 15/15 OK | terminal, ver arriba | ✅ |
| 10 | Contraste texto/icono legible (regla del gate CUA) | Icono de cierre sobre scrim ≈ 11.9:1 | paso 12 | ✅ |

## Coste real
$0 — sin APIs de pago (build estático local, `agent-browser` local, `DesignSync get_file` sin coste).

## Veredicto
**PASS** — los 3 mecanismos de cierre, la apertura de fotos distintas con overlay, el retorno de foco y el atrapamiento de foco funcionan exactamente como describe la Verificación, en los 3 locales, con `pnpm gate` verde y sin errores de consola.

**Rarezas** (no bloquean el PASS, pero se documentan):
- La card `Lightbox` (y también `Input`/`Textarea` de TD.4) no aparecen en `_ds_bundle.js`/`_ds_manifest.json` del proyecto remoto de Claude Design — el paso de regeneración del bundle tras subir componentes nuevos no se está ejecutando (ni localmente ni en remoto), así que ninguna de esas cards renderiza standalone hoy. Es deuda preexistente del flujo `DesignSync`, no un defecto de TD.11 en sí — recomendable abrir una tarea TD dedicada a corregir el paso de regeneración del bundle si el panel visual del Design System se va a seguir usando como referencia de las tareas futuras.
- Al hacer click en el overlay con `agent-browser click <selector>`, el centro del backdrop queda cubierto por la imagen ampliada (`object-contain` puede dejar la imagen ocupando casi todo el viewport en pantallas pequeñas) — hubo que apuntar el click a una esquina libre de overlay. Comportamiento correcto (la imagen consume el click, solo el área fuera de ella cierra), pero conviene que quien reverifique sepa que un click "en overlay" cerca del centro puede fallar simplemente porque cae sobre la imagen, no porque el cierre esté roto.
