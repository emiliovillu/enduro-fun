# TD.9 — Rediseño del icono `bike` (moto de enduro)

**Veredicto de la parte automatizable: PASS** (revisión humana final PENDIENTE — ver abajo, no se puede marcar `[x]` en planning.md sin ella).

## Contexto

- Commit base: `ef2b216836ea297b47894bdc950e4782bec61bf4` (TD.8) + diff sin commitear de TD.9 en curso.
- `git status` al iniciar: cambios sin stage en `apps/web/src/components/ui/icon.tsx`, `docs/design-system/components/media/Icon.jsx`, `docs/dev-loop/journal.md`, `.claude/settings.json` (este último fuera del alcance de TD.9, no se toca en esta verificación).
- `git diff --stat`: 4 ficheros, 11 inserciones / 14 borrados — cambio acotado, sin sorpresas de alcance.

## Verificación literal (planning.md, TD.9)

> captura del glifo nuevo en la sección Icon de `/design-system`, `pnpm gate` verde, y **revisión humana final** (el juicio de "ya no parece un triciclo" es del propio usuario, que fue quien lo señaló — parada de fin de tarea hasta su OK visual).

## 1. `pnpm gate`

Ejecutado desde la raíz. Resultado: **verde**.

- `lint`: 0 errores (5 warnings preexistentes de `import-x/no-named-as-default-member` en `eslint.config.ts` y `scripts/readme-status.mjs`, no relacionados con TD.9, no bloquean el gate).
- `typecheck`: OK en `apps/web` y `packages/core`.
- `format:check`: OK.
- `knip`: OK, sin código muerto.
- `readme:status:check`: tabla del README coincide con planning.md.
- `test` (vitest unit): 3/3 pass.

## 2. Build estático + servidor local

- `pnpm --filter @app/web build` → compilación Turbopack correcta, 4 rutas estáticas generadas (`/`, `/_not-found`, `/design-system`), sin errores de TypeScript.
- Servido con `npx serve -l 4319 apps/web/out` → `/design-system.html` responde 200.

## 3. Evidencia visual (agent-browser, sesión `t9`)

Ficheros en este directorio:

| Fichero | Qué muestra |
|---|---|
| `01-icon-section-full.png` | Página `/design-system` completa (full-page), confirma contexto: la fila de iconos aparece bajo el heading "Icon — set inline estilo Lucide", 5º icono de la fila (`mail, map-pin, instagram, bike, phone`). |
| `02-bike-icon-zoom-isolated.png` | Glifo `bike` aislado, ampliado a 160×160px sobre fondo blanco (recorte nítido, sin reescalado con pérdida) — la vista "de cerca" pedida. |
| `04-header-context.png` | Sección "Header" del showcase completa, con el logo `<Icon name="bike" size={26}>` + "EnduroFun" en su superficie real de uso (barra oscura). |
| `05-header-logo-crop-big.png` / `05-header-logo-crop-raw.png` | Recorte del logo de Header a tamaño real (26px) y versión ampliada 4× (con el blur de reescalado esperable al ampliar un elemento tan pequeño — no es un artefacto de render, es upscaling de la captura). |

Verificación técnica adicional (vía `eval` sobre el DOM real, no asunción): confirmé que el `outerHTML` de los `<path>` renderizados en ambas instancias (showcase e.g. 24px, y Header 26px) coincide exactamente con los cuatro `d` del array `ICON_PATHS.bike` del diff:

```
M5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z
M18 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z
M3 14l5-1 2 3 3-2 3-1 2 3.5
M6 17h8
```

Confirmado también que el `svg` sigue la convención del registro: `fill="none"`, `stroke="currentColor"`, `stroke-width="1.8"`, `stroke-linecap/linejoin="round"`, `viewBox="0 0 24 24"` — sin fill, consistente con el resto de `ICON_PATHS`.

El espejo local `docs/design-system/components/media/Icon.jsx` coincide byte a byte (mismo `d` concatenado) con el `ICON_PATHS.bike` de `icon.tsx` — sincronización confirmada por `git diff`, ambos ficheros cambiaron a la vez con el mismo path.

## 4. Consola / red

- `agent-browser console` (todos los niveles) durante toda la sesión (apertura, scroll, evals, capturas): **vacía** — sin errores ni warnings.
- `agent-browser network` filtrado a 4xx/5xx: **sin coincidencias** — cero requests fallidas.

## 5. Impresión visual propia (dato adicional, NO es el veredicto de cierre)

El glifo actual (asiento/depósito con muesca + carril bajo separado + dos ruedas de radio distinto) se lee, a mi juicio, más claramente como un vehículo de dos ruedas motorizado que la primera versión descartada (manillar en T) — la silueta superior en zigzag rompe la simetría que producía la lectura de "triciclo/patinete", y el carril bajo aporta masa de chasis. A tamaño reducido (26px, uso real del Header) el patrón sigue siendo legible como "dos ruedas + cuerpo alargado entre ellas", aunque a ese tamaño cualquier glifo de línea pierde detalle. Esto es una impresión, no el criterio de aprobación de esta tarea.

## Resultado por punto

| Punto de la Verificación | Esperado | Observado | OK |
|---|---|---|---|
| Captura del glifo en `/design-system` | Presente y renderizado | `01-...png`, `02-...png` — glifo presente, paths coinciden con el diff | Sí |
| `pnpm gate` verde | 0 errores | 0 errores (5 warnings preexistentes ajenos) | Sí |
| Revisión humana final | OK visual del usuario | **PENDIENTE** — no evaluable por este agente | Pendiente |

## Coste real

$0 (sin llamadas a APIs de pago; solo build local, servidor estático y `agent-browser` contra localhost).

## Conclusión

La parte automatizable de TD.9 (entrega del path SVG, convenciones del registro, sincronización con el espejo de Claude Design, build/gate verdes, renderizado sin errores de consola/red) **PASA**. La tarea **NO se marca `[x]` en planning.md** hasta que el usuario dé su OK visual explícito sobre `02-bike-icon-zoom-isolated.png` (glifo aislado) y `05-header-logo-crop-big.png` (tamaño real de uso) — ese es el criterio subjetivo ("ya no parece un triciclo") que la propia Verificación reserva para juicio humano, siguiendo el mismo patrón aplicado en el cierre de TD.7.

## Actualización — iteración final tras feedback del usuario

El usuario, tras ver `02-bike-icon-zoom-isolated.png` y `05-header-logo-crop-big.png`, señaló: **"No se parece a una moto de enduro, le falta el manillar al icono"**.

Se añadió un quinto sub-path — un manillar corto pegado directamente a la pipa de dirección (`'M14.5 12h3.5'`), NO un vástago vertical separado (esa fue la primera versión descartada por leerse como patinete/triciclo). Path final aplicado:

```ts
bike: [
  'M5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'M18 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  'M3 14l5-1 2 3 3-2 3-1 2 3.5',
  'M6 17h8',
  'M14.5 12h3.5',
],
```

Sincronizado en Claude Design (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`, `components/media/Icon.jsx`) y en el espejo local, confirmados idénticos. `pnpm gate` verde tras el cambio. Evidencia nueva: `06-icon-final-with-handlebar-4x.png` (glifo aislado, zoom 4x) y `07-header-final-with-handlebar-4x.png` (logo del Header, zoom 4x sobre tamaño real 26px).

**Veredicto final: PASS.** El usuario pidió explícitamente continuar sin más confirmaciones ("deja de preguntarme, sigue tu solo") tras este ajuste — se cierra la tarea con esta iteración como definitiva.
