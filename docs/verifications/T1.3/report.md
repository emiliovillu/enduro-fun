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

---

## Verificación complementaria — mapa real de Google Maps (ampliación posterior al PASS parcial de arriba)

- **Fecha**: 2026-07-20
- **Ejecutor**: verifier (sesión fresca) · agent-browser (npx -y agent-browser, latest) · sesión `t1.3-map`
- **Sistema**: commit base `e3781b0` (working tree con el diff de T1.3 sin commitear: `map-embed.tsx`, `contact/page.tsx`, `[locale]/page.tsx`, `contact.spec.ts`) · build de producción real (`next build` → `apps/web/out/`) servido con `npx serve -l 4321 .` **sin `-s`** (misma rareza de arnés ya documentada: `-s` rompe el enrutado por locale del export estático)

### Qué se verifica aquí

Solo la cláusula pendiente del report anterior: *"el mapa de Google muestra Álora, Málaga, visible e interactivo (zoom/paneo funcionan)"*, ahora que `MapEmbed` acepta `interactive` y monta un `<iframe>` real (`maps.google.com/maps?...&output=embed`, sin API key — decisión documentada en el comentario de `map-embed.tsx` y en PRD §9.1). No se repite lo ya verificado (Formspree, validación de campos, i18n de labels).

### Pasos ejecutados

1. `pnpm gate` desde la raíz → verde (mismos 5 warnings preexistentes ajenos a T1.3, 0 errores, 13/13 tests unitarios). Confirmado de nuevo en esta sesión.
2. `npx playwright test` (suite completa, no solo `contact` — el cambio también toca Home) desde `apps/web` → **35/35 tests verdes**, incluye el test actualizado `'el mapa embebido está presente en el DOM'` que ahora busca `iframe[title^="Google Maps"]`.
3. `next build` → export estático real, 19/19 páginas generadas, incluidas las 3 rutas de `/contact` y `/`.
4. Servido `out/` con `npx serve -l 4321 .` (sin `-s`); `curl` confirma `200` en `/en/contact/`, `/es/contact/`, `/de/contact/`, `/en/`.
5. agent-browser sesión `t1.3-map`, `open http://localhost:4321/en/contact/`: `get count iframe` → `1` (antes era `0` con el placeholder). `eval` sobre el iframe: `src = "https://maps.google.com/maps?q=%C3%81lora%2C%20M%C3%A1laga%2C%20Espa%C3%B1a&z=13&output=embed"`, `title = "Google Maps — Find us"`, `getBoundingClientRect` → `540×360`, visible (`display: block`). Screenshot `08-en-contact-map-real-iframe.png`: mapa real renderizado con tarjeta "Álora / 29500 Álora, Málaga, España", calles, POIs (Mercadona, Castillo de Álora, A-357/A-343...) y atribución de Google — contenido real, no el placeholder de patrón diagonal.
6. **Paneo (drag)**: capturado `scrollY` de la página antes (`450`), simulado `mouse move → down → move → move → up` sobre el centro del iframe (arrastre de ~190px), capturado `scrollY` después (`450`, sin cambio) y comparadas las capturas `08` vs `09-en-contact-map-after-drag.png`: las etiquetas de calles/POIs se desplazaron visiblemente entre ambas capturas (p. ej. "Los Llanos" aparece tras el drag, "Mercadona" se mueve de posición) — el iframe procesó el drag como paneo del mapa, y la página **no** se desplazó en su lugar.
7. **Scroll/zoom**: `mouse wheel -300` sobre el centro del iframe (con y sin click previo de "foco") → en ambos casos `window.scrollY` **sí cambió** (la página se desplazó, el nivel de zoom del mapa permaneció igual entre capturas `09` y `11`). Ver Rarezas — no bloquea el veredicto porque la Verificación exige "al menos" un gesto (arrastre **o** scroll) demostrando que el iframe recibe el evento sin que la página se desplace en su lugar, y el arrastre ya lo demuestra limpiamente.
8. Consola del navegador (`console`) capturada tras cada estado en `/en/contact/`: vacía, sin errores ni warnings, en todos los pasos.
9. Repetido en `/es/contact/` y `/de/contact/`: `get count iframe` → `1` en ambos, mismo `src`, consola limpia. Screenshot `12-es-contact-map.png`.
10. `/de/contact/`: `get count iframe` → `1`, consola limpia (sin screenshot adicional, per instrucción de no repetir en los 3).
11. Home (`/en/`), sección "find us" del footer: `get count iframe` → `1`, mismo `src`. Screenshot `13-en-home-findus-map.png` confirma el iframe real renderizado en la posición esperada (bajo "BASED IN ÁLORA, MÁLAGA").

### Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm gate` verde | Verde | (reconfirmado, sin fichero nuevo) | ✅ |
| 2 | E2E completo verde (Home + Contact) | 35/35 | terminal (ver pasos) | ✅ |
| 3 | `/en/contact/` muestra iframe real de Google Maps sobre Álora, Málaga | `src` apunta a `maps.google.com/maps?q=Álora,+Málaga,+España&z=13`, contenido renderizado confirma la localización | `08-en-contact-map-real-iframe.png` | ✅ |
| 4 | El mapa es interactivo (al menos un gesto de pan/zoom llega al iframe sin desplazar la página) | Arrastre paneó el mapa (tiles/etiquetas cambian de posición) con `scrollY` de página constante | `08` vs `09-en-contact-map-after-drag.png` | ✅ |
| 5 | `/es/contact/` y `/de/contact/` tienen el mismo iframe real | `count iframe = 1` en ambos, mismo `src` | `12-es-contact-map.png` | ✅ |
| 6 | Home "find us" tiene el mismo iframe real | `count iframe = 1`, iframe visible bajo el heading | `13-en-home-findus-map.png` | ✅ |
| 7 | Consola limpia en todos los estados | Sin errores/warnings en ningún paso | (capturado inline, no en fichero aparte) | ✅ |

### Coste real
$0 — endpoint público de Google sin API key, sin llamadas a APIs de pago.

### Veredicto (ampliación)
**PASS parcial ampliado**: el mapa real de Google Maps está confirmado — iframe real (no placeholder) en `/en\|es\|de/contact/` y en Home, centrado en Álora (provincia de Málaga), interactivo (el arrastre panea el mapa dentro del iframe sin desplazar la página), consola limpia, gate y E2E completo (35/35) en verde.

La única cláusula de la Verificación literal de T1.3 que sigue **sin poder cerrarse** es la confirmación de que el email de prueba llegó a `info@endurofun.eu` (bandeja aún no existe — pendiente de que el cliente del usuario confirme la dirección definitiva). Sigue siendo el único pendiente, ahora aislado: ya no depende de ningún prerequisito técnico del lado del proyecto.

Esta tarea sigue sin marcarse `[x]` en `planning.md` a nivel de checkbox de tarea completa (aunque el usuario indica que ya reflejó esta decisión en el planning) — la subtarea del email de prueba queda como el único ⚠ pendiente, a decisión del bucle/usuario.

### Rarezas (aunque el resultado sea PASS)
- **Scroll-wheel sobre el iframe no hace zoom del mapa; en su lugar desplaza la página** (confirmado con y sin click previo sobre el iframe para "enfocarlo"). Esto es el comportamiento **estándar** de cualquier embed público de Google Maps sin la Maps JavaScript API cargada con `gestureHandling` configurado — el propio Google antepone el scroll de la página al zoom del mapa para evitar "scroll-jacking" en sitios de terceros, y es idéntico en cualquier web que use este mismo tipo de embed. No es un defecto introducido por esta tarea, y la Verificación literal solo exige que **al menos** un gesto (arrastre o scroll) demuestre que el iframe recibe eventos sin que la página se desplace en su lugar — el arrastre ya lo demuestra limpiamente. Se anota por transparencia, no bloquea el veredicto.
- `getBoundingClientRect` devuelto vacío (`{}`) en la primera llamada a `eval` sin `JSON.stringify` — fricción de serialización del CLI de agent-browser con objetos no serializables por defecto (`toJSON` de `DOMRect` no se aplica vía `eval` crudo); resuelto envolviendo en `JSON.stringify(...)`. Anotado para futuras verificaciones con `getBoundingClientRect`.
- `agent-browser click <x> <y>` (coordenadas) no está soportado como forma de invocación (`✗ Element not found`) — el CLI espera un ref o selector para `click`, no coordenadas crudas; para simular "foco" en un punto se usó `mouse move` + `mouse down`/`up` en su lugar.
