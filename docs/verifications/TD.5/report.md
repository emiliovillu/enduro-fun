# Verificación TD.5 — Composites de producto: PackageCard, ReviewCard, SectionHeading

- **Tarea**: TD.5 · Composites de producto: PackageCard, ReviewCard, SectionHeading (`planning.md`)
- **Fecha**: 2026-07-18
- **Ejecutor**: verifier · agent-browser (CLI vía `npx -y agent-browser`) · sesión `td5`
- **Sistema**: commit `0cffc4edbd36fa7cf6e69031715c2013ecc97edc` (working tree con el diff staged de TD.5 encima) · `pnpm build` (export estático) servido con `python3 -m http.server` sobre `apps/web/out/` — no aplica compose/DB/worker (proyecto sin backend, PRD §1/§6)

## Verificación esperada (literal de planning.md)
> comparación contra `cards.card.html` del espejo; `PackageCard` y `ReviewCard` renderizan correctamente con datos de ejemplo variados (con y sin `highlight`, rating 4 vs 5 estrellas).

## Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (lint con solo warnings preexistentes no relacionados, typecheck, format:check, knip, readme:status:check, 3 tests unit). Output: `01-gate.txt`.
2. `pnpm build` → `next build` compila y exporta estático sin errores, genera `apps/web/out/design-system.html`. Output: `02-build.txt`.
3. Serví `apps/web/out/` en `localhost:4173` y abrí `/design-system.html` con agent-browser (sesión `td5`).
4. Extraje **todos** los headings (`h1`-`h6`) de la página renderizada en orden de documento vía `eval` sobre el DOM real → `03-headings.txt`.
5. Inspeccioné los 2 `PackageCard` del showcase (con/sin `highlight`) leyendo el DOM real → `04-packagecard-raw.txt` + capturas.
6. Inspeccioné los 2 `ReviewCard` del showcase (rating 5 y rating 4): conteo de glifos `★`/`☆` y `aria-label` del contenedor `role="img"` leídos del DOM real → `05-reviewcard-raw.txt`.
7. Snapshot de accesibilidad de agent-browser (árbol AX real, no DOM) sobre el bloque `[data-slot=review-card]` para confirmar que el `aria-label` es el que expone el navegador a un lector de pantalla → `06-reviewcard-a11y-snapshot.txt`.
8. Capturas de pantalla de la sección "Cards" completa (full-page) y de cada subsección (`SectionHeading`, `PackageCard`, `ReviewCard`) → `07`–`10`.
9. Consola y errores del navegador tras cargar `/design-system.html` → `11-browser-console.txt`, `12-browser-errors.txt` (ambos vacíos).
10. Comparación contra el espejo `cards.card.html`: el fichero referencia `../../_ds_bundle.js`, que **no existe en el repo** (patrón sistémico: los 6 `*.card.html` del espejo entero referencian ese bundle y ninguno lo tiene sincronizado — verificado con `grep -rl _ds_bundle`, no es un defecto de TD.5). Lo serví igualmente desde `docs/design-system/` (para que las rutas relativas a `styles.css` resolvieran) y confirmé que React/Babel cargan pero `window.EnduroFunDesignSystem_8ee30e` es `undefined` → el mirror no renderiza standalone en ningún componente del proyecto, es una limitación conocida del espejo, no de esta tarea. Como alternativa **más fiable** (fuente exacta, no un bundle opaco), comparé línea a línea el JSX fuente del espejo (`PackageCard.jsx`, `ReviewCard.jsx`, `SectionHeading.jsx`) contra `apps/web/src/components/ui/{package-card,review-card,section-heading}.tsx`: estructura, orden de nodos, tokens y mecanismo de estrellas Unicode coinciden.
11. Reproduje el `RangeError` que el implementer dice haber arreglado: ejecuté la lógica de estrellas del espejo SIN el clamp (`'★'.repeat(rating)+'☆'.repeat(5-rating)` tal cual `ReviewCard.jsx` del espejo) contra `rating` fuera de `[0,5]` (-3, -1, 6, 27) → confirmado `RangeError: Invalid count value`. Ejecuté la misma lógica CON el clamp de `review-card.tsx` (`Math.min(5, Math.max(0, rating))`) contra el mismo conjunto → sin excepción en ningún caso, degrada a 0 o 5 estrellas → `15-rangeerror-fix-test.txt`.
12. Medí contraste WCAG real (texto/fondo, `getComputedStyle`) de los elementos con color de acento de esta sección: badge "Popular" (blanco sobre rojo), botón "Enquire" (blanco sobre rojo) y los glifos de estrella (ámbar sobre blanco) → `16-contrast-raw.txt`, `17-contrast-ratios.txt`.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Jerarquía de headings de la página completa sin saltos (regla dura del proyecto) | `h1 → h2 → h3 → ... → h2(Cards) → h2×4(SectionHeading) → h3(PackageCard) → h3×2(nombres) → h3(ReviewCard)`. Ningún salto N→N+2 en toda la página | `03-headings.txt` | ✅ |
| 2 | `PackageCard` con `highlight` muestra el badge; sin `highlight` no lo muestra | "con highlight" → badge visible con texto "Popular"; "sin highlight" → sin badge (`badgeText: null`) | `04-packagecard-raw.txt`, `09-packagecard.png` | ✅ |
| 3 | `ReviewCard` rating 5 vs rating 4 muestran el número correcto de estrellas rellenas/vacías | rating 5 → `★★★★★` (5 llenas, 0 vacías); rating 4 → `★★★★☆` (4 llenas, 1 vacía) | `05-reviewcard-raw.txt`, `10-reviewcard.png` | ✅ |
| 4 | `aria-label` correcto vía snapshot de accesibilidad | Árbol AX real de agent-browser: `image "5 out of 5 stars"` para el card de rating 5 (coincide con `${filledStars} out of 5 stars`) | `06-reviewcard-a11y-snapshot.txt` | ✅ |
| 5 | `SectionHeading` en sus combinaciones `align`/`light` | 4 instancias renderizadas: left sin eyebrow, left con eyebrow, center, light-sobre-oscuro — todas correctas visualmente | `08-cards-sectionheading.png` | ✅ |
| 6 | Comparación cualitativa contra `cards.card.html` del espejo | El `.card.html` no ejecuta standalone en ningún componente del repo (bundle `_ds_bundle.js` ausente, patrón sistémico en los 6 ficheros del espejo, no introducido por TD.5); comparación por JSX fuente línea a línea: estructura/tokens/orden idénticos a la implementación | ver paso 10 arriba | ✅ (vía fuente, no vía ejecución del `.card.html`) |
| 7 | Consola del navegador limpia | Sin errores ni warnings tras cargar `/design-system.html` | `11-browser-console.txt`, `12-browser-errors.txt` (vacíos) | ✅ |
| 8 | Fix del `RangeError` de rating fuera de rango | Reproducido el crash con la lógica sin clamp del espejo (rating -3/-1/6/27 → `RangeError`); confirmado que el clamp de `review-card.tsx` lo previene en los mismos casos | `15-rangeerror-fix-test.txt` | ✅ |
| 9 (informativo, no pedido por la Verificación literal) | Contraste WCAG de elementos de acento de esta sección | Badge "Popular" blanco/rojo: **5.56:1** (pasa 4.5:1); botón "Enquire" blanco/rojo: **5.56:1** (pasa); glifos de estrella ámbar (`--amber-500` `#f5a623`) sobre `bg-surface-card` blanco: **2.03:1** — **por debajo de 3:1 y de 4.5:1** | `17-contrast-ratios.txt` | ⚠️ ver Rarezas |

## Coste real
$0 — sin APIs de pago, todo el flujo corre en local (build estático + servidor HTTP local + agent-browser).

## Veredicto
**PASS** — los 6 puntos literales de la Verificación de TD.5 se cumplen: comparación fiel contra el espejo (por fuente JSX, dado que el `.card.html` no ejecuta standalone por una limitación sistémica preexistente del espejo, no de esta tarea) y ambos composites renderizan correctamente con datos variados (`highlight`/sin `highlight`, rating 4/5), incluyendo el `aria-label` verificado vía snapshot de accesibilidad real del navegador. Jerarquía de headings de la página completa sin saltos, confirmado el fix del `RangeError`, consola limpia.

**Rarezas** (no bloquean el PASS de TD.5, se documentan para trazabilidad):
- Los glifos de estrella de `ReviewCard` (`text-amber-500` = `#f5a623`) sobre el fondo blanco de la card dan **2.03:1** de contraste, por debajo del umbral WCAG de 3:1 (elemento gráfico/icónico) y muy por debajo de 4.5:1. Es un hallazgo real medido con `getComputedStyle` + fórmula WCAG, no una opinión. **Se rutea como hallazgo del token, no como FAIL de TD.5**: (a) el token `amber-500` es preexistente de TD.1 (ya usado como `--warning`/`--focus-ring` antes de esta tarea), (b) `ReviewCard` reproduce fielmente el mecanismo de color del espejo (`ReviewCard.jsx` usa el mismo `var(--amber-500)` para las estrellas), TD.5 no introdujo el valor, solo lo consumió tal cual está documentado que debía hacerlo. Corregirlo implica una decisión de producto sobre el token en sí (subir el tono ámbar o cambiar el mecanismo visual de rating), fuera del alcance de "renderiza correctamente con datos de ejemplo variados". Queda anotado aquí para que una tarea futura (o TD.6/TD.7 al auditar el DS contra la realidad) lo recoja.
- El fichero `.card.html` del espejo no es ejecutable standalone en ningún componente sincronizado del repo (los 6 ficheros de `docs/design-system/components/*/​*.card.html` referencian `_ds_bundle.js`, inexistente localmente) — no es un defecto de esta tarea, pero limita la forma en que un verifier futuro puede hacer la "comparación contra `cards.card.html`" literal: se resolvió comparando el JSX fuente, que es la fuente de verdad más fiable de las dos.
