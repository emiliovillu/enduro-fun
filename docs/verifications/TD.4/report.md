# Verificación TD.4 — Gaps: Input/Textarea + subida a Claude Design

- **Tarea**: TD.4 · Gaps: Input/Textarea + subida a Claude Design (`planning.md`)
- **Fecha**: 2026-07-18
- **Ejecutor**: verifier · agent-browser 0.32.2 · sesión `td.4`
- **Sistema**: base commit `d824b04` (TD.3) + cambios de TD.4 **staged sin commitear** (`git diff --cached --stat`: `apps/web/src/app/design-system/page.tsx`, `apps/web/src/components/ui/{input,textarea}.tsx`, `docs/design-system/components/forms/*`). `pnpm build` ejecutado sobre el working tree con esos cambios aplicados — el `out/` servido es el código bajo verificación.

## Verificación esperada (literal de planning.md)
> revisión en navegador de la sección nueva; `DesignSync list_files` sobre `8ee30e13-2372-49e4-ba6f-2692bc1a6af5` muestra `components/forms/Input.*` y `components/forms/Textarea.*`; el espejo regenerado en `docs/design-system/` los incluye.

## Pasos ejecutados
1. `pnpm gate` desde la raíz → verde (lint 0 errores/5 warnings preexistentes de terceros, typecheck OK, format OK, knip OK, readme:status OK, 3 tests unit OK). Output: `gate-output.txt`.
2. `pnpm build` → `apps/web/out/design-system.html` generado sin errores. Output: `build-output.txt`.
3. `DesignSync list_files` sobre `8ee30e13-2372-49e4-ba6f-2692bc1a6af5` (llamada directa e independiente, no reutilizando la comprobación del implementer) → `components/forms/Input.d.ts`, `Input.jsx`, `Input.prompt.md`, `Textarea.d.ts`, `Textarea.jsx`, `Textarea.prompt.md`, `forms.card.html` presentes. Output crudo: `designsync-list_files.json`.
4. `docs/design-system/components/forms/` local contiene los mismos 7 ficheros (`ls`). Comparación de contenido remoto (`DesignSync get_file`) vs local (`Read`) en 2 muestras: `Input.jsx` (idéntico byte a byte) y `Textarea.prompt.md` (idéntico, incluye `rows` default `4`).
5. Servido `apps/web/out/` con `python3 -m http.server 8934`; abierto `/design-system.html` con `agent-browser` (sesión `td.4`).
   - Snapshot de accesibilidad: 5 controles presentes con accessible name correcto vía `<label for>`: `textbox "Name — Default"`, `"Name — Filled"` (con valor "Jane Rider"), `"Name — Disabled"` (disabled), `"Name — Invalid"` (con valor "not-an-email"), `"Message"` (textarea).
   - Foco real vía **Tab del teclado** (click en el botón "ON DARK" previo en el DOM + `press Tab`, no `.focus()` programático): `document.activeElement.id === "ds-input-Default"`; `getComputedStyle` → `outlineStyle: "solid"`, `outlineColor: rgb(245,166,35)` (`--focus-ring`), `outlineWidth: 2px`. Screenshot `02-input-focus.png` muestra el anillo naranja visible.
   - Estado invalid: `getComputedStyle(#ds-input-Invalid).borderColor === "rgb(179, 38, 30)"` = `#b3261e` = token `--danger` exacto (`globals.css:68`), `aria-invalid="true"`.
   - Estado disabled: `opacity: 0.5`, `cursor: not-allowed`, `disabled: true`; intento de click real sobre el input disabled (`click @e37`, no atajo) → `document.activeElement` queda vacío (no se enfoca) = confirmado no interactivo.
   - Consola del navegador tras todo el flujo: vacía, sin errores ni warnings. `browser-console.txt`.
6. Revisión de código: `input.tsx`/`textarea.tsx` no usan `outline-hidden`/`outline-none` (bug TD.2 #1, ausente); `rows` default `4` coincide con el espejo (bug de code-review ya corregido, confirmado); prop `invalid` presente y mapeada a `aria-invalid` en ambos componentes (segundo hallazgo de code-review, confirmado corregido); `apps/web/src/lib/utils.ts` mantiene el fix de `tailwind-merge` de TD.2 (grupo `text` extendido) — no aplica colisión en Input/Textarea porque no combinan `text-{color}` con `text-{size}` en la misma cadena.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Sección nueva Input/Textarea visible en `/design-system` | 5 controles (Default/Filled/Disabled/Invalid + Textarea) renderizan con labels asociados | 01-input-textarea-section.png | OK |
| 2 | `DesignSync list_files` muestra `components/forms/Input.*` y `Textarea.*` | Los 6 ficheros de componente + `forms.card.html` presentes en el remoto | designsync-list_files.json | OK |
| 3 | Espejo regenerado en `docs/design-system/` los incluye | 7 ficheros locales idénticos a los 2 muestreados del remoto (`Input.jsx`, `Textarea.prompt.md`) | `ls docs/design-system/components/forms/` (este report) | OK |
| 4 | Foco real visible, no `outline: none` | Tab real → `outline-style: solid`, anillo naranja visible | 02-input-focus.png | OK |
| 5 | Invalid → borde `--danger` visible | `borderColor: rgb(179,38,30)` = `#b3261e` exacto | 01-input-textarea-section.png | OK |
| 6 | Disabled → opacidad reducida, no interactivo | `opacity:0.5`, click real no enfoca el campo | eval output (este report) | OK |
| 7 | `pnpm gate` verde, `pnpm build` sin errores | Ambos verdes | gate-output.txt, build-output.txt | OK |
| 8 | Consola del navegador limpia | Sin errores/warnings | browser-console.txt | OK |

## Coste real
$0 — DesignSync no factura; sin llamadas a APIs de pago.

## Veredicto
**PASS** — la sección Input/Textarea funciona en navegador como describe la Verificación, el proyecto remoto de Claude Design contiene los 6 ficheros de componente + card, y el espejo local coincide con el remoto (verificado por contenido, no solo por listado).

Notas: los 2 hallazgos de code-review mencionados en el brief (rows default y prop `invalid` faltante) están efectivamente corregidos en el código verificado. No se encontraron regresiones de los bugs reales de TD.2 (outline-hidden/outline-none, colisión tailwind-merge). El estado "Default" del Input muestra "Jane Rider" como placeholder (gris), distinto del "Filled" que lo tiene como value real — comportamiento correcto pero visualmente sutil en el screenshot; confirmado por accessibility snapshot (`Filled` reporta `: Jane Rider` como valor, `Default` no). Cambios verificados están `staged` pero no committeados (correcto: el verifier no hace commit).
