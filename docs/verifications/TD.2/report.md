# Verificación TD.2 — Primitiva core: Button (2º intento)

- **Tarea**: TD.2 · Primitiva core: Button (`planning.md`)
- **Fecha**: 2026-07-17
- **Ejecutor**: verifier (contexto fresco) · agent-browser (via `npx -y agent-browser`) · sesiones `td2` (app) y `td2ds` (espejo DS)
- **Sistema**: working tree con los cambios de TD.2 aplicados sobre `c5ed7e3` (TD.1) — `git status` muestra el diff de TD.2 staged, sin commit todavía (correcto: el verifier no comitea). `pnpm build` genera `apps/web/out/`, servido con `python3 -m http.server 4173` desde ese directorio (equivalente estático a producción, la app es `output: 'export'`).

**Es el 2º intento.** El 1er intento (ver `report-fail-1.md` en este mismo directorio) dio FAIL por dos causas raíz:
1. `twMerge()` sin extender config colisionaba el grupo `text-{color}` con la escala tipográfica custom `text-caption/small/body` → las clases de color de texto se descartaban.
2. `outline-hidden`/`outline-none` en la clase base de `buttonVariants` fijaba `--tw-outline-style: none` de forma incondicional → el anillo de foco nunca se pintaba.

Ambos fixes fueron aplicados por el implementer (ver diff de `apps/web/src/lib/utils.ts` y `apps/web/src/components/ui/button.tsx`). Esta verificación repite el protocolo completo desde cero, sin asumir el fix — se comprueba con `getComputedStyle` sobre el sistema real.

## Verificación esperada (literal de planning.md)
> comparación en navegador contra `buttons.card.html` del espejo: variantes y estados hover/focus/disabled/press fieles; operable por rol y accessible name.

## Pasos ejecutados

1. `pnpm gate` desde la raíz → verde (lint 0 errores/5 warnings preexistentes de `import-x/no-named-as-default-member` ajenos a esta tarea, typecheck OK, format OK, knip OK, readme:status OK, 3/3 tests unit OK). Ver `gate-output.txt`.
2. `pnpm build` → `apps/web/out/design-system.html` generado sin errores (Next 16.2.10, Turbopack, 4 páginas estáticas). Ver `build-output.txt`.
3. Servido `apps/web/out/` en `http://localhost:4173`, abierto `/design-system` con agent-browser real (sesión `td2`). Snapshot de accesibilidad confirma 16 `<button>` (4 variantes × 4 estados: sm/md/lg/disabled) con nombres accesibles correctos (`BOOK NOW`, `ENQUIRE`, `LEARN MORE`, `ON DARK`).
4. Para cada variante, `getComputedStyle` real (no className) del color de texto y color de fondo efectivo (recorriendo ancestros hasta el primer `background-color` no transparente), y cálculo de contraste WCAG:
   - **primary** (`Book now`): texto `rgb(255,255,255)` sobre `rgb(232,121,30)` (`--accent-primary`) → **2.92:1**
   - **secondary** (`Enquire`): texto `rgb(255,255,255)` sobre `rgb(198,43,40)` (`--accent-secondary`) → **5.56:1**
   - **ghost** (`Learn more`): texto `rgb(28,28,30)` sobre `rgb(250,246,240)` (bg canvas) → **15.80:1**
   - **outline** (`On dark`): texto `rgb(250,246,240)` sobre `rgb(28,28,30)` (bg-inverse) → **15.80:1**

   Las clases de color **sí se están aplicando** ahora (bug #1 confirmado arreglado: el texto blanco se renderiza de verdad en primary/secondary, no negro heredado).
5. Tamaño de fuente real de "Book now" por tamaño: sm 13px, md 15px, lg 17px, todos `font-weight: 600`. Ninguno alcanza el umbral de "texto grande" (18.66px en negrita real ≥700, o 24px regular) → el ratio exigible es 4.5:1 en los tres tamaños.
6. Estado **focus**: reset de página, navegación por **Tab real** (tecla, no `.focus()` programático para evitar el sesgo de modalidad de Chromium) hasta cada una de las 4 variantes (índices de tab 1-3 primary, 7-9 ghost, 10-12 outline, confirmados por barrido completo). En cada caso: `el.matches(':focus-visible') === true` y `getComputedStyle(el).outlineStyle === 'solid'` (no `'none'`) con `outlineColor: rgb(245,166,35)` (`--focus-ring`) y `outlineOffset: 2px`. Screenshots muestran el anillo naranja visible sobre fondo claro y oscuro. **Esto es exactamente lo que falló en el intento 1** — confirmado arreglado.
7. Estado **disabled**: botón `disabled` con `opacity: 0.5`, `pointer-events: none`, excluido del orden de tabulación (confirmado por el barrido de Tab, que salta directamente de las 3 variantes habilitadas a la siguiente familia).
8. Estado **press**: dado que Tailwind v4 usa la propiedad CSS `scale` (no `transform`) para `active:scale-[.96]`, se verificó con `mouse down`/`mouse up` real (CDP, no evento sintético) sobre las coordenadas del botón: `el.matches(':active') === true` y `getComputedStyle(el).scale === '0.96'`. Sin cambio de color en press (color de fondo en press = color de hover, porque el cursor está sobre el botón — comportamiento esperado, no hay una tercera variable de color para "press").
9. **Rol y accessible name**: todos los elementos son `<button>` nativos (Base UI compone sobre el elemento nativo), `role` implícito `button`, `textContent` = accessible name (`Book now`, `Enquire`, `Learn more`, `On dark`), confirmado también en el snapshot de accesibilidad de agent-browser.
10. **Comparación contra el espejo**: `docs/design-system/components/buttons/buttons.card.html` referencia `../../_ds_bundle.js`, que **no existe en este repo** (el mirror es de solo lectura y el bundle se genera en el proyecto de Claude Design remoto — no es parte de la Entrega de TD.2). Al abrirlo con agent-browser (sesión `td2ds`), `#root` queda vacío y no hay errores de consola informativos más allá de los warnings esperados de Babel-in-browser. La comparación fiel se hizo entonces contra la fuente de verdad textual del espejo — `Button.jsx` (estilos inline: `primary: {background: var(--accent-primary), color: var(--white)}`, `secondary: {...var(--accent-secondary)...}`, `outline: {...color: var(--text-on-dark), boxShadow: inset 0 0 0 2px var(--text-on-dark)}`, `ghost: {...color: var(--text-primary), boxShadow: inset 0 0 0 2px var(--border-subtle)}`) y `Button.d.ts`/`Button.prompt.md` — y se confirmó 1:1 contra `buttonVariants` en `apps/web/src/components/ui/button.tsx`: mismos 4 variantes, mismo mapeo semántico (`outline` = anillo para fondo oscuro, `ghost` = anillo sutil para fondo claro — coincide con el nombrado del propio `Button.jsx`, no es un error de naming), mismos paddings/font-size por tamaño verificados con `getComputedStyle` (sm 8px/18px/13px, md 13px/28px/15px, lg 17px/36px/17px — exactos).
11. Consola del navegador: `console` y `errors` vacíos en la página de la app durante todo el flujo (`browser-console-final.txt`, 0 líneas).

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Variantes fieles al espejo (`Button.jsx`) | 1:1 en colores, tamaños, paddings, boxShadow/ring | eval de `getComputedStyle`, código de `button.tsx` vs `Button.jsx` | OK |
| 2 | Hover un tono más oscuro | primary `rgb(232,121,30)`→`rgb(209,89,15)` en hover real | eval tras `hover @e17` | OK |
| 3 | Focus visible, anillo pintado | `outline-style: solid` (no `none`) en las 4 variantes vía Tab real | 04-focus-primary-tab.png, 07-focus-ghost-tab.png, 08-focus-outline-ondark.png | OK |
| 4 | Disabled fiel (opacidad, sin eventos, fuera del tab order) | `opacity:0.5`, `pointer-events:none`, saltado por Tab | eval + barrido de Tab | OK |
| 5 | Press = `scale(.96)` sin cambio de color | `scale: 0.96` confirmado con mouse down/up real vía CDP | eval durante mousedown, 05-press-primary.png | OK |
| 6 | Operable por rol y accessible name | `<button>` nativo, accessible name = texto visible en los 16 botones | snapshot -i, eval de accessibleName | OK |
| 7 | Contraste texto/fondo >=4.5:1 (chequeo obligatorio del protocolo) | secondary 5.56:1 OK, ghost 15.80:1 OK, outline 15.80:1 OK; **primary 2.92:1 FALLA — por debajo del umbral** | ver tabla de ratios en el paso 4 | VER NOTA |
| 8 | Comparación visual directa contra `buttons.card.html` renderizado | El HTML del espejo no renderiza localmente: depende de `_ds_bundle.js`, ausente en este repo (mirror de solo lectura, el bundle vive en el proyecto remoto de Claude Design) | 06-ds-mirror-buttons-card.png (vacío) | LIMITACIÓN DE INFRA, no de la tarea — comparación hecha contra `Button.jsx`/`.d.ts`/`.prompt.md` en su lugar |

## Nota sobre el punto 7 — contraste de `primary` (no bloquea el PASS de TD.2)

`Button.jsx` del espejo especifica literalmente `primary: {background: 'var(--accent-primary)', color: 'var(--white)'}` — blanco sobre `--accent-primary` (`#e8791e`, orange-500). La app de TD.2 reproduce esto **exactamente** (1:1 fidelidad, que es lo que pide la Entrega/Verificación de TD.2). El ratio resultante, 2.92:1, está por debajo de 4.5:1 en los tres tamaños (13/15/17px, weight 600 — ninguno califica como "texto grande" bajo WCAG). Esto es un valor de diseño del propio DS (`--accent-primary` vs `--white`), no un defecto de implementación de TD.2: el bug de contraste reportado en el intento 1 (que hacía pensar que el texto renderizaba en negro) era síntoma del bug de `twMerge`, ya arreglado — el texto blanco SÍ se está pintando ahora, y aun así el ratio no alcanza AA porque el propio par de tokens del DS es bajo. Se reporta aquí, tal como exige el protocolo (`cua.md`: "el defecto está en los valores del DS, decisión del usuario, pero se REPORTA con la tabla de ratios, no se ignora"), para que el usuario decida si ajustar `--accent-primary` o el color de texto del botón primary en una tarea de diseño posterior — no bloquea TD.2, cuyo contrato es fidelidad al espejo, no corrección del espejo.

## Coste real

$0 — verificación 100% local (build estático + servidor HTTP local + agent-browser), sin llamadas a APIs de pago.

## Veredicto

**PASS** — Ambas causas raíz del intento 1 están confirmadas arregladas con evidencia de `getComputedStyle`/`:focus-visible` sobre el sistema real (no solo inspección de className): el color de texto se renderiza correctamente en las 4 variantes, y el anillo de foco se pinta (`outline-style: solid`) en las 4 variantes vía navegación por teclado real. Hover, disabled, press (vía la propiedad CSS `scale` de Tailwind v4, confirmado con mouse down/up real por CDP) y rol/accessible name, todos fieles al espejo (`Button.jsx`/`.d.ts`/`.prompt.md`) y sin errores de consola.

**Rarezas** (no bloquean el PASS, pero se dejan anotadas):
- El contraste de `primary` (blanco sobre `--accent-primary`) es 2.92:1, por debajo de AA (4.5:1) — defecto heredado del propio par de tokens del DS, no de la implementación de TD.2. Recomendado abrir una nota de ajuste de diseño (oscurecer `--accent-primary` o revisar el color de texto de `primary`) antes de que este botón se use en superficie pública real (F1+).
- `buttons.card.html` del espejo no es renderizable localmente sin `_ds_bundle.js` (ausente en `docs/design-system/`, que es un mirror de solo lectura). La comparación de fidelidad se hizo contra las fuentes textuales del espejo (`Button.jsx`/`.d.ts`/`.prompt.md`), que son la especificación autoritativa citada en la propia Entrega de TD.2. Si en tareas futuras (TD.3+) se necesita comparación visual pixel-a-pixel contra las `.card.html`, valdría la pena que `DesignSync` también sincronice el bundle o un snapshot renderizado.
