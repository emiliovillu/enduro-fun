# Verificación T1.5 — Sección Galería (Home) — carrusel de fotos

- **Tarea**: T1.5 · Sección Galería (Home) — carrusel de fotos (`planning.md`)
- **Fecha**: 2026-07-19
- **Ejecutor**: verifier (contexto fresco) · agent-browser 0.32.3 · sesión `t15c` (t1.5/t15b descartadas por CDP roto tras timeout, ver Rarezas)
- **Sistema**: commit `fc148f048c433a2720d154bd64b7040f1f7c6970` (HEAD; cambios de la tarea sin commitear en el árbol de trabajo — `git status` mostrado abajo) · `next build` (export estático) servido con `serve` sobre `apps/web/out` en `http://localhost:4310` (sin flag `-s`, ver Rarezas) · sin BD/worker (proyecto sin esos módulos, PRD §1/§6)

```
git status --porcelain (relevante)
 M apps/web/e2e/home.spec.ts
 M apps/web/src/app/[locale]/page.tsx
 M apps/web/src/components/ui/icon.tsx
 M apps/web/src/messages/{de,en,es}.json
 M packages/core/src/contracts/messages.{ts,test.ts}
 M planning.md
?? apps/web/src/app/[locale]/home-photo-carousel.tsx
?? docs/mockups/home-gallery.{html,png}
```

## Verificación esperada (literal de planning.md)
> en navegador, `/en/`, `/es/`, `/de/` muestran la sección con el mismo ancho que Reviews, el carrusel se desplaza (rueda/gesto/controles) sin salirse del contenedor, y funciona con teclado (foco visible, `Tab`/flechas si aplica).

## Pasos ejecutados
1. `pnpm gate` completo (lint, typecheck, format:check, knip, readme:status:check, `pnpm test` unit) → verde.
2. `pnpm test:e2e` completo → 24 tests passed (incluye el nuevo "la sección de galería es visible y navegable" en `apps/web/e2e/home.spec.ts`).
3. `next build` (export estático) + `serve` sirviendo `out/` real (no `pnpm dev`, no mocks) en `localhost:4310`.
4. Sesión `agent-browser` contra `/en/`: `snapshot -i` confirma la región `"A taste of the terrain"` con botón de pausa y 5 puntos de paginación, montada entre Packages y Reviews.
5. Medí con `eval` el `getBoundingClientRect().width` del contenedor de la galería y del contenedor de Reviews en el DOM real → **1200px ambos**, en `/en/`, `/es/` y `/de/`.
6. Autoplay: leí el dot con `aria-current` en dos instantes separados por >5s **sin reload** → el índice avanzó (`1/5` → `4/5`; luego tras pausa/resume `5/5` → `2/5`), confirmando ciclo automático de 4s.
7. Pausa: click en el botón → `aria-label` cambia a "Resume gallery autoplay"; confirmé que el índice NO avanza durante 6s con el botón en pausa (dos lecturas idénticas: `4/5` / `4/5`).
8. Resume: click de nuevo → `aria-label` vuelve a "Pause gallery autoplay" y el autoplay reanuda de verdad (avanzó `5/5` → `2/5` en los siguientes 5s) — sin bug de doble-toggle ni de re-play accidental.
9. Puntos de paginación: click directo en el dot `3/5` (ref `@e7`) → `aria-current="true"` pasa a ese dot inmediatamente.
10. Teclado: clic en el botón "ENQUIRE" (Full Adventure, elemento previo en el DOM) + `press Tab` real → `document.activeElement` es el botón de pausa/play, con `:matches(':focus-visible')` = true y `outline: 2px solid rgb(159,108,23)` con `offset: 2px` (visible en captura `05-en-gallery-keyboard-focus-pause.png`).
11. Contraste de texto (regla obligatoria de `cua.md`): medí `color` del texto "Photo placeholder — route N" (`rgb(184,181,174)`) contra ambos extremos del gradiente de fondo de la tarjeta (`rgb(56,56,60)` → `rgb(28,28,30)`) → ratio ≈ 5.70:1 en el extremo más claro (peor caso), ≈ 8.32:1 en el más oscuro. Ambos ≥ 4.5:1 (texto normal/pequeño) → OK.
12. Overflow horizontal: `document.documentElement.scrollWidth > clientWidth` → `false` en `/en/`, `/de/` (y visualmente sin scroll lateral en `/es/`).
13. Consola/errores del navegador (`console`, `errors`) tras todo el flujo → vacíos, sin warnings ni errores.
14. Mockup previo: `docs/mockups/home-gallery.html` y `.png` existen en el árbol (aprobados por el usuario según el brief de la tarea).

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `/en/`, `/es/`, `/de/` muestran la sección | Región "A taste of the terrain" / "Una muestra del terreno" / "Ein Vorgeschmack auf das Gelände" visible entre Packages y Reviews en los 3 idiomas | 01, 06, 07 | ✅ |
| 2 | Mismo ancho de contenedor que Reviews | 1200px == 1200px en los 3 idiomas (medido con `getBoundingClientRect`) | eval logs arriba | ✅ |
| 3 | El carrusel se desplaza (rueda/gesto/controles) sin salirse del contenedor | Controles (dots) mueven el índice activo; scroll-snap horizontal contenido en el track (`overflow-x-auto`); sin overflow de página | 02, 04 | ✅ |
| 4 | Autoplay avanza solo, sin reload | Índice cambió de `1/5`→`4/5` y de `5/5`→`2/5` en ventanas de 5-6s sin `reload` | 02 | ✅ |
| 5 | Pausa/play funciona sin bug de re-play | `aria-label` alterna correctamente; en pausa el índice no avanza en 6s; al reanudar, el autoplay vuelve a avanzar | 03 | ✅ |
| 6 | Puntos de paginación clicables | Click en dot 3 → `aria-current` se mueve a ese dot | 04 | ✅ |
| 7 | Funciona con teclado, foco visible | `Tab` real alcanza el botón de pausa/play; `:focus-visible` true; outline 2px sólido con offset visible | 05 | ✅ |
| 8 | Sin errores de consola | `console`/`errors` vacíos tras todo el flujo | browser-console.txt, browser-errors.txt | ✅ |
| 9 | `pnpm gate` y `pnpm test:e2e` en verde | gate verde (12 unit tests); e2e 24/24 passed | terminal output (ver Pasos 1-2) | ✅ |

## Coste real
$0 — sin APIs de pago involucradas (build local, servidor estático local, agent-browser local).

## Veredicto
**PASS** — la sección de galería cumple literalmente la Verificación: mismo ancho que Reviews (1200px) en los 3 idiomas, autoplay real observado sin reload, pausa/resume sin bugs de re-play, puntos de paginación funcionales, operable por teclado con foco visible, sin overflow horizontal ni errores de consola, `pnpm gate` y `pnpm test:e2e` (24/24) en verde.

### Rarezas (no bloquean el PASS)
- Al servir `out/` con `serve -l <puerto> -s .` (flag `-s`, single-page mode), TODAS las rutas se reescriben al `index.html` de raíz (la página de redirección `/ → /en/`), rompiendo el enrutado por locale: `agent-browser` solo veía el link "the English site" en cualquier ruta. Se corrigió sirviendo sin `-s` (`serve -l <puerto> .`), que respeta el export estático multi-directorio de Next. **Anotar para futuras verificaciones de este proyecto**: nunca usar `serve -s` contra `apps/web/out`.
- Dos sesiones iniciales de `agent-browser` (`t1.5`, `t15b`) quedaron con el CDP desconectado ("Not attached to an active page") tras un primer comando que excedió el timeout de 60s y pasó a background; se resolvió cerrando todas las sesiones (`close --all`) y abriendo una sesión nueva (`t15c`). No es un problema del código verificado.
- El botón de pausa/play no lleva `aria-live` sobre el propio carrusel (el cambio de contenido activo no se anuncia a lectores de pantalla más allá del `aria-current` de los dots) — no lo exige la Verificación literal ni la Entrega de la tarea, se anota como posible mejora de accesibilidad futura, no bloquea.
