# Verificación TD.10 — Icono `bike`: vástago entre el manillar y la pipa de dirección

- **Tarea**: TD.10 (`planning.md`, fase TD)
- **Fecha**: 2026-07-18
- **Ejecutor**: yo mismo (orquestador del dev-loop), dado el tamaño trivial del cambio (una sola sub-path SVG) — sin subagente implementer/verifier dedicado, siguiendo el mismo criterio de proporcionalidad aplicado en TD.8/TD.9 para diffs mecánicos de una línea.

## Verificación esperada (literal de planning.md)
> **Verificación**: captura del glifo ajustado (zoom aislado + logo del Header a 26px, mismo patrón que TD.9), `pnpm gate` verde, revisión humana final del usuario.

## Cambio aplicado
`apps/web/src/components/ui/icon.tsx`, `ICON_PATHS.bike`, sub-path del manillar sustituido:
- Antes (TD.9): `'M14.5 12h3.5'` — manillar pegado directamente a la pipa de dirección.
- Ahora (TD.10): `'M16 13v-2M14 11h4'` — vástago corto vertical (2 unidades) desde la pipa de dirección (16,13) hasta (16,11), seguido de la barra horizontal del manillar centrada en esa altura.

Iterado y confirmado visualmente con Playwright (mismo mecanismo que TD.9) antes de aplicar — descartado deliberadamente un vástago largo (la 1ª iteración de TD.9 que leía como patinete/triciclo).

Sincronizado en Claude Design (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`, `components/media/Icon.jsx`) y en el espejo local `docs/design-system/components/media/Icon.jsx` — confirmados idénticos vía `DesignSync write_files` + `get_file`.

## Resultado

| # | Esperado | Observado | OK |
|---|---|---|---|
| 1 | Captura del glifo ajustado, zoom aislado | `01-icon-zoom-with-stem.png` (zoom 4x sobre 20px real) — vástago claramente visible separando manillar y chasis | ✅ |
| 2 | Captura del logo del Header a 26px | `02-header-with-stem.png` (zoom 4x sobre 26px real) — vástago visible a tamaño real de uso | ✅ |
| 3 | `pnpm gate` verde | lint/typecheck/format/knip/readme-status/test — todos OK | ✅ |
| 4 | Revisión humana final del usuario | **PENDIENTE** — el usuario dio la directriz explícita de no bloquear el flujo esperando su confirmación en cada iteración de icono ("deja de preguntarme, sigue tu solo"); se deja la evidencia lista aquí para su revisión cuando quiera, sin STOP-CHECK bloqueante | ⏳ (no bloqueante, ver journal) |

## Coste real
$0 — sin APIs de pago, todo local + `DesignSync` (no factura).
