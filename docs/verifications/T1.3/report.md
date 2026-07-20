# Verificación T1.3 — Página Contact (Formspree + Google Maps real)

- **Tarea**: T1.3 · Página Contact (Formspree + Google Maps real) (`planning.md`)
- **Fecha**: 2026-07-20
- **Ejecutor**: verifier · agent-browser (npx -y agent-browser, latest) · sesión `t1.3`
- **Sistema**: commit base `89cd647` + diff de T1.3 sin commitear (`git status --short`: `contact/page.tsx`, `contact-form.tsx`, `contact.spec.ts`, `docs/mockups/contact.html`, mensajes `en/es/de.json`, `messages.ts`/`messages.test.ts`) · build de producción real (`next build` → `apps/web/out/`) servido con `npx serve -l 4173 .` **sin `-s`** (rareza de arnés documentada en el journal: `serve -s` rompe el enrutado por locale del export estático)

## Verificación esperada (literal de planning.md)
> en navegador, rellenar y enviar el formulario real una vez contra el endpoint real de Formspree → comprobar que el email llega a la bandeja configurada (evidencia: captura del email recibido); el mapa de Google muestra Álora, Málaga, visible e interactivo (zoom/paneo funcionan). Este envío real es manual/one-shot (no se repite en cada gate — el gate usa el fixture de Playwright).

## Contexto — desviación deliberada, acordada con el usuario

El usuario todavía **no dispone de la API key de Google Cloud (Maps Embed API)**. Es un prerequisito externo ⚠ pendiente (subtarea del planning), no un bug de esta tarea. El mapa sigue siendo el `MapEmbed` placeholder de TD.3 (patrón diagonal + icono, sin iframe real). Por acuerdo explícito con el usuario en esta sesión, este report separa:
1. Todo lo automatable ya implementado → **PASS parcial**, verificado literalmente.
2. Lo que depende de prerequisitos externos sin resolver → **PENDIENTE — requiere al usuario**, no cuenta como FAIL de la tarea.

## Pasos ejecutados

1. `pnpm gate` desde la raíz → verde (lint con solo warnings preexistentes de `import-x/no-named-as-default-member`, typecheck, format, knip, readme:status:check, 13 tests unitarios). Output completo: `gate-output.txt`.
2. `npx playwright test contact` (equivalente a `pnpm --filter @app/web test:e2e -- contact`, que en este proyecto corre la suite entera porque el positional arg no filtra por defecto vía ese script — usé el binario directo para aislar el spec) → **8/8 tests de `contact.spec.ts` en verde** (no 9 como se me indicó de partida; el fichero solo declara 8 `test(...)`, ver Rarezas). Output: `e2e-contact-output.txt`.
3. `next build` → export estático real en `apps/web/out/`, 3 rutas de `/contact` generadas (`/en/contact`, `/es/contact`, `/de/contact`) confirmadas en el log de build.
4. Servido `out/` con `serve -l 4173 .` (sin `-s`), confirmado `200` en las 3 rutas de contacto por `curl`.
5. agent-browser sesión `t1.3`: `open http://localhost:4173/en/contact/` → snapshot muestra heading "ASK FOR A CUSTOM QUOTE", 3 campos (`Name`/`Email`/`Message`, los 3 `required`), botón "Send message", nav "CONTACT" con `aria-current="page"`. Screenshot `01-en-contact-inicial.png`.
6. Confirmado que el mapa es el placeholder (NO iframe real): `get count iframe` → `0`; `get html` del contenedor `[aria-label*='Google Maps']` → `div` con patrón diagonal + icono + texto "Google Maps embed — Find us" (sin red externa). Screenshot `02-en-map-placeholder.png`. Esto es lo esperado hoy (prerequisito ⚠ pendiente), documentado como hecho, no como fallo.
7. Validación de campos requeridos: click en "Send message" con los 3 campos vacíos → la URL no cambia (`get url` antes/después idéntica, sin navegación ni POST), y `eval` sobre `document.querySelectorAll('[required]')` confirma `validity.valid === false` en los 3 inputs — el navegador bloquea el submit nativamente. Screenshot `03-en-empty-submit-blocked.png`.
8. Repetido el snapshot en `/es/contact/` y `/de/contact/`: heading, labels de campos y texto del botón traducidos correctamente ("PIDE UN PRESUPUESTO PERSONALIZADO" / "NOMBRE" / "ENVIAR MENSAJE"; "INDIVIDUELLES ANGEBOT ANFRAGEN" / "NAME" / "NACHRICHT SENDEN"). Screenshots `04-es-contact.png`, `05-de-contact.png`.
9. **Envío real one-shot**: vuelto a `/en/contact/`, rellenados los 3 campos con datos de prueba identificables (`T1.3 Verifier Test` / `test@endurofun.eu` / mensaje con fecha "2026-07-20 18:43 CEST" + "verificación automática T1.3 del dev-loop"). Screenshot pre-submit `06-en-form-filled-pre-submit.png`. Click único en "Send message" → `wait --text "Thanks"` resuelto → UI muestra "Thanks — your message is on its way. We'll get back to you soon." Screenshot `07-en-form-success.png`.
10. **Evidencia de red real** (no solo UI): `agent-browser network requests --filter formspree --json` capturó el POST real: `POST https://formspree.io/f/mykrjbra`, `status: 200`, cabeceras de respuesta de Cloudflare/Formspree (`server: cloudflare`, `x-fs-worker`, `cf-ray`), `postData` multipart con los 3 campos de prueba. Guardado en `network-formspree-pretty.json` — esta es la prueba de que el POST llegó de verdad al endpoint de Formspree, más fuerte que la sola captura de UI.
11. Consola del navegador capturada tras cada estado clave (`console-en.txt`, `console-after-submit.txt`): ambas vacías, sin errores ni warnings.

## Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm gate` verde | Verde (lint solo warnings preexistentes ajenos a T1.3) | `gate-output.txt` | ✅ |
| 2 | E2E permanente de contact en verde | 8/8 tests de `contact.spec.ts` verdes | `e2e-contact-output.txt` | ✅ |
| 3 | `/en\|es\|de/contact` cargan con contenido traducido correcto | Confirmado en los 3 (heading, labels, botón) | `01`, `04`, `05`*.png | ✅ |
| 4 | Nav de `Header` marca "Contact" activo | `aria-current="page"` en el link Contact (EN) | snapshot + `01-en-contact-inicial.png` | ✅ |
| 5 | Los 3 campos son requeridos, el navegador bloquea el submit vacío | Sin navegación, `validity.valid=false` en los 3 | `03-en-empty-submit-blocked.png` | ✅ |
| 6 | `MapEmbed` presente y visible en el DOM en las 3 rutas | Presente (placeholder, no iframe real — esperado hoy) | `02-en-map-placeholder.png` | ✅ (como placeholder) |
| 7 | Envío real one-shot contra Formspree real, UI pasa a estado de éxito | POST real 200 a `formspree.io/f/mykrjbra`, UI muestra "Thanks — your message is on its way..." | `07-en-form-success.png`, `network-formspree-pretty.json` | ✅ |
| 8 | Email llega a `info@endurofun.eu` | **No verificable por el verifier** (sin acceso al buzón) | — | ⚠ PENDIENTE — requiere al usuario |
| 9 | Mapa de Google real, visible e interactivo (zoom/paneo) | **No implementado** — falta API key de Google Cloud | — | ⚠ PENDIENTE — requiere al usuario |

## Coste real
$0 — el envío a Formspree es gratuito en el plan free del proyecto (límite documentado en el código/journal, PRD §9.2). Sin llamadas a APIs de pago.

## Veredicto
**PASS parcial** en todo lo automatable: gate verde, 8/8 E2E de contact verdes, carga correcta en los 3 idiomas, nav activo, validación nativa de campos requeridos, placeholder de mapa presente (documentado como esperado, no como fallo), y envío real one-shot completado con éxito contra el endpoint real de Formspree (POST 200 confirmado por captura de red, no solo por la UI).

**PENDIENTE — requiere al usuario** (no es un FAIL de la tarea; son los 2 prerequisitos externos ⚠ ya listados como subtareas sin resolver en el planning):
1. Confirmar que el email de prueba (asunto/remitente `test@endurofun.eu`, nombre "T1.3 Verifier Test", enviado 2026-07-20 ~18:43 CEST) llegó a `info@endurofun.eu` — adjuntar captura si es posible.
2. Proveer la API key de Google Cloud (Maps Embed API, restringida a `endurofun.eu`) para implementar el iframe real y cerrar el `[verificar]` de PRD §9.1.

Esta tarea **no se marca `[x]`** en `planning.md` — queda abierta con los 2 pendientes de arriba anotados como subtareas ⚠ sin resolver, a decisión del bucle/usuario.

## Rarezas (aunque el resultado automatable sea PASS)
- El brief de arranque mencionaba "9 tests permanentes" en `contact.spec.ts`; el fichero real declara **8** `test(...)`. Los 8 pasan; no hay ningún test roto ni faltante respecto a lo que el fichero declara, solo una discrepancia de conteo en la comunicación previa al verifier — anotado por si el implementer quiso decir 9 y falta uno, o el número de partida era simplemente impreciso.
- `pnpm --filter @app/web test:e2e -- contact` (tal como se sugirió) NO filtra por "contact": el script `test:e2e` es `playwright test` a secas y el positional arg no llegó a aplicarse como filtro vía el wrapper de pnpm en esta invocación — tuve que invocar `npx playwright test contact` directamente dentro de `apps/web` para aislar el spec. No bloquea el veredicto (los 8 tests de contact pasaron igual dentro de la suite completa la primera vez, y aislados la segunda), pero vale la pena anotarlo como fricción de comando para futuras verificaciones.
- Confirmada de nuevo la rareza de arnés ya documentada en el journal (T1.5): `serve -s` rompe el enrutado por locale del export estático — server usado sin `-s` en esta verificación, sin problemas.
- Diff de T1.3 no está commiteado al momento de esta verificación (`git status --short` lo confirma) — es el estado esperado antes de que el bucle cierre la tarea; no afecta al veredicto, se anota para trazabilidad.
