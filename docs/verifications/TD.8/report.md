# TD.8 — Corrección de contraste WCAG AA en tokens del DS

## Veredicto: PASS

## Sistema verificado
- Commit de trabajo (sin commitear todavía): diff sobre `main` en `6c67e35` — cambios en `apps/web/src/app/globals.css`, `apps/web/src/components/ui/{button,language-switcher,review-card}.tsx`, `apps/web/src/app/design-system/page.tsx`, `docs/design-system/tokens/colors.css`.
- `pnpm gate` verde antes y después de la verificación (`06-gate-output.txt`).
- `pnpm --filter @app/web build` (Next static export) generó `apps/web/out/` sin errores; servido con `python3 -m http.server 8811` desde `apps/web/out/`.
- Navegación con `agent-browser` (sesión `tTD8`) contra `http://localhost:8811/design-system.html` (el export estático no genera `/design-system/index.html`, sino `design-system.html`).
- Consola del navegador limpia (`agent-browser console` sin salida). Los únicos 404 de red son prefetch de Next Link hacia rutas aún no construidas (`/contact`, `/about`, `/packages`, `/reviews` — fuera de alcance de TD.8, no existen todavía) y `favicon.ico` — ninguno es un error de JS ni afecta al contraste medido.

## Método
Contraste calculado con la fórmula WCAG estándar de luminancia relativa (coeficientes 0.2126/0.7152/0.0722, sRGB linearizado) sobre `getComputedStyle().color` / `.backgroundColor` de los nodos REALES renderizados en la sección correspondiente del showcase `/design-system` (no swatches aislados). Para el hover de `Button` se disparó un `hover` real vía CDP (`agent-browser hover`) y se confirmó `el.matches(':hover') === true` antes de medir. Para `ReviewCard` se resolvió el fondo efectivo subiendo por los ancestros hasta encontrar un `background-color` con alpha > 0 (heredado de `bg-surface-card`, blanco puro en este caso). Script completo y salida cruda en `05-contrast-ratios.txt`.

## Resultado por punto

| Superficie | Esperado (planning TD.8) | Observado | Color texto/icono | Color fondo | OK |
|---|---|---|---|---|---|
| `Button` variante `primary`, reposo | ≥4.5:1 | **5.82:1** | `rgb(28,28,30)` (`--text-primary`) | `rgb(232,121,30)` (`--accent-primary`) | ✅ |
| `Button` variante `primary`, `:hover` (foco de la regresión de la 1ª vuelta del fix) | ≥4.5:1 | **5.38:1** | `rgb(255,255,255)` | `rgb(179,74,12)` (`--accent-primary-active`) | ✅ |
| `LanguageSwitcher`, píldora activa (`aria-current="true"`) | ≥4.5:1 | **5.82:1** | `rgb(28,28,30)` | `rgb(232,121,30)` | ✅ |
| `ReviewCard`, rating stars vs fondo real de la tarjeta | ≥4.5:1 | **4.53:1** | `rgb(159,108,23)` (`--rating-fill`/`--amber-700`) | `rgb(255,255,255)` (heredado de `bg-surface-card`) | ✅ (margen estrecho, +0.03) |

Los 4 valores (3 superficies pedidas + el hover de Button, que ya había fallado una vez en code-review) están por encima del mínimo AA de 4.5:1 para texto normal.

## Antes / después
- `00-before-button-hover-white-text-TD2.png`: captura de TD.2 del hover de `Button primary` con texto blanco fijo (ratio histórico documentado en planning: 2.92:1 en reposo con texto blanco).
- `00-before-reviewcard-amber500-TD5.png`: captura de TD.5 del `ReviewCard` con `amber-500` crudo (ratio histórico documentado en planning: 2.03:1).
- `01-button-rest.png`: sección Button del showcase actual, estado reposo.
- `02-button-hover.png`: mismo botón con `:hover` disparado de verdad (`matchesHover: true`), texto blanco sobre `accent-primary-active`.
- `03-language-switcher.png`: sección LanguageSwitcher, píldora EN activa.
- `04-review-card.png`: sección ReviewCard (rating 4 vs 5), estrellas con `--rating-fill`.

## Coste real
$0 (sin llamadas a APIs de pago; build y medición 100% local).

## Rarezas
- El ratio de `ReviewCard` (4.53:1) queda muy cerca del mínimo legal (margen de +0.034 sobre 4.5). Cualquier cambio futuro de `bg-surface-card` a un tono no-blanco, o un ajuste de antialiasing/subpixel rendering, podría tumbarlo. No bloquea este PASS (la medición real da ≥4.5:1), pero es un punto frágil a vigilar si se retoca la rampa ámbar o `--surface-card` más adelante.
- El export estático no genera `/design-system/index.html` sino `design-system.html` (y un directorio `/design-system/` con fragmentos internos de Next `__next.*.txt`) — no es un bug de esta tarea, es el comportamiento general de `output: 'export'` de Next.js visto ya en TD.7, documentado aquí por si afecta a la siguiente tarea que sirva `out/` localmente.
