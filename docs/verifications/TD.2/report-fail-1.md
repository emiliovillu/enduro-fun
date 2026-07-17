# Verificación TD.2 — Primitiva core: Button

- **Tarea**: TD.2 · Primitiva core: Button (`planning.md`)
- **Fecha**: 2026-07-17
- **Ejecutor**: verifier · agent-browser (npx -y, última versión resuelta en la sesión) · sesión `td2`
- **Sistema**: commit base `c5ed7e3` + diff staged de la tarea (working tree sucio con los ficheros de TD.2 en `git diff --cached`: `apps/web/src/components/ui/button.tsx`, `apps/web/src/lib/utils.ts`, `apps/web/components.json`, `apps/web/src/app/design-system/page.tsx`, espejo `docs/design-system/components/buttons/*`, `eslint.config.ts`, `knip.json`). `pnpm gate` verde, `pnpm build` genera `apps/web/out/`, servido con `npx serve -l 4173 apps/web/out` y verificado contra ese build de producción real (no `pnpm dev`).

## Verificación esperada (literal de planning.md)
> comparación en navegador contra `buttons.card.html` del espejo: variantes y estados hover/focus/disabled/press fieles; operable por rol y accessible name.

## Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (lint 0 errores/5 warnings preexistentes no relacionados, typecheck OK, format OK, knip OK, readme:status OK, 3 tests unit OK). Output: `docs/verifications/TD.2/gate-output.txt`.
2. `pnpm build` → `apps/web/out/design-system.html` generado sin errores (confirma que el fix de `'use client'` funciona: sin él, el prerender de Next crashea). Output: `docs/verifications/TD.2/build-output.txt`.
3. Servido `apps/web/out/` en `localhost:4173`, abierto `/design-system` con agent-browser (sesión `td2`), navegado hasta la sección "BUTTON — VARIANTES × TAMAÑOS", comparado contra `docs/design-system/components/buttons/buttons.card.html` y `Button.jsx` del espejo.
4. Forma/tipografía: pill (`rounded-pill`), `font-display` uppercase con tracking — fiel al espejo. Screenshot `01-button-section-initial.png`.
5. Hover: `hover @e18` (Book now, tamaño md) → `getComputedStyle(...).backgroundColor` pasa de `rgb(232,121,30)` a `rgb(209,89,15)` con `matches(':hover')===true`. Correcto, un tono más oscuro, fiel a la entrega.
6. Focus: navegación real por **Tab** (no `.focus()` JS) hasta el botón "Book now" (md). `document.activeElement` = el botón, `matches(':focus-visible')===true`, pero `getComputedStyle(...).outlineStyle === 'none'` — **sin anillo visible en absoluto**. Screenshot `04-focus-primary.png` confirma cero anillo (no "de bajo contraste": inexistente).
7. Disabled: botón "Book now" disabled → `opacity: 0.5`, `pointer-events: none`. Correcto.
8. Accesibilidad: snapshot de agent-browser muestra `button "BOOK NOW" [ref=...]` (rol nativo `<button>`) con accessible name = texto visible ("Book now", "Enquire", "Learn more", "On dark") en todos los casos, incl. disabled. Correcto.
9. Consola del navegador: `console` → vacía, sin errores/warnings JS. `browser-console.txt`.
10. Inspección de color de texto real (`getComputedStyle`) en las 4 variantes reveló que **ninguna variante aplica su clase de color de texto** (`text-white` / `text-text-on-dark` / `text-text-primary`): todas renderizan `color: rgb(28,28,30)` (heredado del body), independientemente de la variante. Confirmado también leyendo el CSS compilado del build (`apps/web/out/_next/static/chunks/*.css`): la clase `text-white` etc. simplemente **no aparece** en el `className` real del DOM.
11. Screenshot de la fila "On dark" (outline sobre fondo oscuro, `03-ondark-zoom.png`): el texto del botón es **completamente invisible** — el pill se ve (borde), el texto no.

## Causa raíz (confirmada, no especulativa)

**(a) Pérdida de color de texto en todas las variantes.** `apps/web/src/lib/utils.ts` usa `twMerge()` sin extender su configuración con el theme de font-size custom del proyecto (`--text-body/--text-small/--text-caption`, generado por Tailwind v4 vía `--text-*` en `globals.css:227-229`). `twMerge`, al no reconocer `text-small`/`text-caption`/`text-body` como utilidades de tamaño de fuente, las clasifica en el mismo grupo de conflicto que las utilidades de color de texto (`text-white`, `text-text-on-dark`, `text-text-primary` — todas con prefijo `text-`). Como en `buttonVariants` (cva) las clases de tamaño (`variants.size`) se concatenan **después** de las de color (`variants.variant`), `twMerge` descarta la clase de color por "conflicto" y se queda solo con la de tamaño. Resultado medido en el DOM real:
   - `primary`: texto `rgb(28,28,30)` sobre `rgb(232,121,30)` en vez de blanco → contraste 5.82:1 (pasa umbral, pero **no es fiel al espejo**, que especifica `color: var(--white)`).
   - `secondary`: texto `rgb(28,28,30)` sobre `rgb(198,43,40)` → contraste **3.06:1**, por debajo de 4.5:1 (texto normal) exigido por `cua.md`.
   - `outline` ("On dark"): texto `rgb(28,28,30)` sobre contenedor `rgb(28,28,30)` → contraste **1.0:1** — texto invisible. Variante no funcional visualmente.

**(b) Anillo de foco inexistente (no "de bajo contraste").** La clase base incluye `outline-none`, que en Tailwind v4 compila a `.outline-none{--tw-outline-style:none;outline-style:none}` — fija la custom property `--tw-outline-style` a `none` de forma incondicional. `focus-visible:outline-2` compila a `.focus-visible\:outline-2:focus-visible{outline-style:var(--tw-outline-style);outline-width:2px}`, que **lee esa misma variable** en vez de fijarla a `solid`. Como ninguna regla del focus-visible resetea `--tw-outline-style`, el valor `none` fijado por `.outline-none` gana siempre (misma especificidad de custom property, sin override), y el outline **nunca se pinta**, con o sin foco. Confirmado con Tab real + `getComputedStyle` (`outline-style: none` pese a `:focus-visible` = true) y visualmente (`04-focus-primary.png`, sin ningún anillo). Esto contradice el hallazgo documentado por el implementer como "deuda de contraste ~1.8:1" — el ring no es de bajo contraste, **no existe**.

Ambos bugs son de la propia `button.tsx`/`utils.ts` de esta tarea (no heredados de TD.1) y sobreviven al build de producción (`next build`/export servido), por lo que no aplica la excepción de "warning de dependencia que muere en prod" de `cua.md`.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Variantes fieles al espejo (forma, tipografía, color) | Forma/tipografía OK; color de texto NO aplicado en ninguna variante (blanco/on-dark/primary esperado, negro heredado real) | `01-button-section-initial.png`, eval de `getComputedStyle` | FAIL |
| 2 | Hover un tono más oscuro | Confirmado en primary (rgb(232,121,30)→rgb(209,89,15)), `matches(':hover')` true | eval | OK |
| 3 | Focus: anillo visible | Anillo **ausente** (`outline-style:none` con `:focus-visible` true) | `04-focus-primary.png`, eval | FAIL |
| 4 | Disabled: opacidad reducida, no interactivo | `opacity:0.5`, `pointer-events:none` | eval | OK |
| 5 | Press: `scale(.96)` sin cambio de color | Clase `active:scale-[.96]` presente y correcta por inspección de código; mecanismo CSS `:active` nativo | `button.tsx:19` | OK (no bloqueante) |
| 6 | Operable por rol y accessible name | `role="button"` nativo + accessible name = texto visible en las 4 variantes, incl. disabled | snapshot -i | OK |
| 7 | Contraste texto/fondo (mandato `cua.md`) | primary 5.82:1 OK; secondary **3.06:1 FAIL** (<4.5:1); outline on-dark **1.0:1 FAIL** (texto invisible) | cálculo WCAG sobre colores medidos | FAIL |
| 8 | Consola limpia | Sin errores/warnings | `browser-console.txt` (vacío) | OK |

## Coste real
$0 — sin APIs de pago.

## Veredicto
**FAIL** — dos bugs de implementación reproducibles y verificados contra el build de producción real: (1) `cn()`/`twMerge` sin config extendida descarta la clase de color de texto en las 4 variantes por conflicto falso con las utilidades de tamaño de fuente custom (`text-small`/`text-caption`/`text-body`), dejando `outline` "on dark" con texto invisible (contraste 1.0:1) y `secondary` por debajo del umbral WCAG (3.06:1 < 4.5:1); (2) `outline-none` en la base de `buttonVariants` fija permanentemente `--tw-outline-style:none`, por lo que el anillo de foco de `focus-visible:outline-2` nunca se renderiza — no es la "deuda de bajo contraste (~1.8:1)" que el implementer documentó, es ausencia total del anillo, verificado con Tab real.

**Qué debe arreglar el implementer**:
- En `apps/web/src/lib/utils.ts`, usar `extendTailwindMerge` (tailwind-merge) registrando el theme de font-size custom (`text-body`/`text-small`/`text-caption`) en el classGroup `font-size`, para que deje de colisionar con el classGroup `text-color`. Reordenar clases dentro de `buttonVariants` esquivaría el síntoma en este componente pero no la causa (TD.3+ reusará `cn()` con el mismo patrón `text-{color}` + `text-{tamaño custom}`), así que se prefiere el fix en `tailwind-merge`.
- En `buttonVariants`, sustituir `outline-none` por `outline-hidden` (utilidad de Tailwind v4 pensada para "sin outline salvo `:focus-visible`", que no poisona `--tw-outline-style`) o añadir explícitamente `focus-visible:outline` (sin el sufijo `-2`) para resetear la custom property a `solid` antes de aplicar el ancho.
- Re-ejecutar esta Verificación completa (no solo los dos puntos rotos) tras el fix, incluyendo Tab real y `getComputedStyle` de color de texto en las 4 variantes × 3 tamaños.

**Rarezas** (aunque el veredicto es FAIL): el mecanismo de `press` (`active:scale-[.96]`) y el fix de `'use client'` (prerender) están correctamente implementados y verificados contra el build real — no son parte del FAIL. El hallazgo de `--focus-ring` de bajo contraste (~1.8:1) que el implementer documentó como deuda heredada de TD.1 queda **subsumido**: mientras el anillo no se pinte en absoluto, su contraste es irrelevante; deberá re-evaluarse una vez el implementer arregle `outline-hidden`.
