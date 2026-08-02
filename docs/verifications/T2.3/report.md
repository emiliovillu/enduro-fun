# Verificación T2.3 — E2E de fase F2

- **Tarea**: T2.3 · E2E de fase F2 (`planning.md`)
- **Fecha**: 2026-08-02 (intento 1: FAIL) / 2026-08-02 (intento 2: re-verificación tras fix, PASS)
- **Ejecutor intento 1**: verifier (contexto fresco) · agent-browser 0.33.2 · sesión `t23`
- **Ejecutor intento 2 (este documento)**: verifier (contexto fresco, distinto del intento 1 y del intento cortado por límite de sesión que no llegó a producir informe) · agent-browser · sesión `t23v2`
- **Sistema (intento 1)**: commit `8d8ada3` (HEAD, main, working tree limpio)
- **Sistema (intento 2)**: working tree con el fix **sin commitear** aplicado sobre HEAD `8d8ada3` (rama `main`, `git status` limpio salvo los 3 ficheros del fix: `apps/web/src/app/globals.css`, `apps/web/src/components/ui/fleet-card.tsx`, `apps/web/src/components/ui/package-card.tsx`) — build estático (`pnpm --filter @app/web build`, 24 páginas) servido con `npx serve -l 4918 apps/web/out`. Sin Postgres/worker (proyecto 100% estático, desviación documentada en CLAUDE.md).

## Verificación esperada (literal de planning.md)
> recorrido completo de las 5 páginas (Home, About, Contact, Packages, Reviews) en los 3 idiomas sin roturas de navegación ni de `LanguageSwitcher`; cita criterio §14.5 (reviews con diseño coherente y datos creíbles) y confirma que el resto de criterios de contenido (§14.2) siguen cumpliéndose con las 5 páginas completas. Sin regresión de F1.

---

## INTENTO 1 (resumen — ver detalle completo en el historial de git de este fichero / journal)

`pnpm gate` verde, `pnpm test:e2e` 57/57 (con un fallo intermitente conocido de Gallery en un segundo pase, ajeno a F2), recorrido de las 15 combinaciones página×idioma sin roturas de navegación ni de `LanguageSwitcher`, §14.5 y §14.2 cumplidos, consola limpia, sin regresión de F1.

**Hallazgo bloqueante**: el caption de duración/cilindrada sobre foto real en `PackageCard` (`/packages`, 3 cards) y `FleetCard` (`/about`, motos) no tenía scrim/overlay — el contraste quedaba a merced del contenido de la foto. Medido con pixel real (promedio de color de fondo muestreado sobre el `getBoundingClientRect()` del `<span>`, contra `getComputedStyle().color` real):

| Card `/en/packages/` | Contraste medido | Umbral | OK |
|---|---|---|---|
| Getaway | 1.90:1 | 4.5:1 | ❌ |
| Full Adventure | 2.89:1 | 4.5:1 | ❌ |
| Ride your own bike | 2.09:1 | 4.5:1 | ❌ |

`FleetCard` (About): 901cc 3.45:1, 1300cc 3.67:1 (300cc 4.50:1, límite) — también por debajo de AA en 2/3.

**Veredicto intento 1**: **FAIL** — causa raíz: `imageSlot` (escape hatch T2.1) sustituye el degradado oscuro de fallback por una foto real sin ningún scrim que garantice contraste del caption. Resto de la Verificación literal (navegación, `LanguageSwitcher`, §14.5, §14.2, sin regresión F1, gate, consola) pasa sin reservas.

**Fix propuesto**: scrim tokenizado entre foto y caption cuando `imageSlot` está presente, independiente del contenido de la foto; re-verificar con pixel real.

---

## INTENTO 2 (esta re-verificación, tras el fix)

### Fix aplicado (en el árbol, sin commitear al momento de esta verificación)

- `PackageCard`/`FleetCard`: la caja de foto pasa a `relative`; con `imageSlot` presente se inserta `<div className="absolute inset-0 bg-gradient-scrim" aria-hidden="true" />` antes del `<span>` del caption; el `<span>` pasa a `relative`. Reusa el token `--gradient-scrim` ya existente (mismo patrón que el hero de Home).
- `globals.css`: stop de opacidad máxima de `--gradient-scrim` subido de `0.75` a `0.85` (necesario: con el scrim a `0.75` 2 de las 5 combinaciones seguían por debajo de 4.5:1 según medición del implementer).
- Código verificado línea a línea por mí (no solo el resumen del implementer): confirmado en `apps/web/src/components/ui/package-card.tsx` y `fleet-card.tsx` que el `<div>` de scrim se inserta condicionalmente (`{imageSlot ? ... : null}`) y que el `<span>` del caption es `relative` (necesario para quedar por encima del scrim vía stacking context, ya que el scrim es `absolute inset-0`).
- `docs/design-system/tokens/colors.css` (espejo de solo lectura) confirmado **sin tocar** — sigue con `.75` (línea 50), desincronización aceptada y documentada, no bloquea.

### Pasos ejecutados

1. **Gate previo** (mío, independiente): `pnpm gate` desde la raíz → verde. Lint 0 errores/5 warnings preexistentes ajenos (`import-x/no-named-as-default-member`, ya presentes en intento 1); typecheck OK (`apps/web`, `packages/core`); `format:check` OK; `knip` OK; `readme:status:check` OK; `vitest run --project '*:unit'` → 6 files / 19 tests passed. Evidencia: `pnpm-gate-v2.txt`.
2. `rm -rf apps/web/out apps/web/.next && pnpm --filter @app/web build` → build limpio, 24 páginas estáticas (mismo layout que intento 1: `/en|es|de` × `{home,about,contact,gallery,packages,reviews}` + raíz/design-system/iconos). `curl` 200 en `/en/packages/`, `/en/about/`, `/en/reviews/`.
3. `pnpm test:e2e` (suite completa) → **57/57 passed en ~22s**, sin flakiness esta vez (proceso `serve` propio en puerto 4918, aislado del puerto del test runner; sin procesos huérfanos de sesiones previas de agent-browser interfiriendo). Evidencia: `pnpm-test-e2e-v2.txt`.
4. **Sesión agent-browser `t23v2`** contra `localhost:4918`, recorrido de las **15 combinaciones página×idioma** navegando siempre por links reales del Header/Footer/LanguageSwitcher (nunca URL a mano salvo el `open` inicial a `/en/`):
   - `/en/` (01) → click PACKAGES → `/en/packages/` (02).
   - **Packages, Header ES**: click "ES" → `/es/packages/` (03) — preserva página.
   - **Packages, Footer DE**: scroll a footer, click "DE" → `/de/packages/` (04) — preserva página.
   - `/de/packages/` → click BEWERTUNGEN → `/de/reviews/` (05).
   - **Reviews, Header EN**: click "EN" → `/en/reviews/` (06) — preserva página.
   - **Reviews, Footer ES**: scroll a footer, click "ES" → `/es/reviews/` (07) — preserva página.
   - `/es/reviews/` → click INICIO → `/es/` (08) → click SOBRE NOSOTROS → `/es/about/` (09) → click CONTACTO → `/es/contact/` (10).
   - Contact, Header DE → `/de/contact/` (11) → click ÜBER UNS → `/de/about/` (12) → Header EN → `/en/about/` (13) → click CONTACT → `/en/contact/` (14) → Footer DE → `/de/contact/` (14b) → click START → `/de/` (15).
   - **Las 15 combinaciones renderizaron sin error de navegación**; el `LanguageSwitcher` (Header y Footer) preservó siempre la página actual en las 6 combinaciones sin cobertura permanente (Header×Packages, Footer×Packages, Header×Reviews, Footer×Reviews, Header×About EN, Footer×Contact DE), sin reaparición del bug de T1.4.
5. **Consola del navegador**, capturada al final de toda la sesión (`console`, `errors`): **ambas vacías (0 bytes)** en las 15 navegaciones. Evidencia: `browser-console-full-session.txt`, `browser-errors-full-session.txt` (sobrescritas con el resultado de esta sesión — igualmente vacías que en el intento 1).
6. **Contraste del caption — medición propia, pixel real, independiente del implementer** (`getBoundingClientRect()` del `<span>` real vía `agent-browser eval`, cruzado con el color de fondo promediado sobre esa misma región en el screenshot real de la página, y `getComputedStyle().color` real del texto — mismo método que estableció el FAIL del intento 1, aplicado ahora al estado con fix):

   | Elemento | Color texto (computado) | BG muestreado (pixel real) | Contraste | Umbral | OK |
   |---|---|---|---|---|---|
   | Getaway (EN) | rgb(184,181,174) | rgb(70,70,54) | **4.71:1** | 4.5:1 | ✅ |
   | Full Adventure (EN) | rgb(184,181,174) | rgb(63,61,58) | **5.30:1** | 4.5:1 | ✅ |
   | Ride your own bike (EN) | rgb(184,181,174) | rgb(74,67,65) | **4.72:1** | 4.5:1 | ✅ |
   | Kurztrip (DE, mismo card que Getaway) | rgb(184,181,174) | rgb(73,72,57) | **4.52:1** | 4.5:1 | ✅ (margen estrecho, ver nota) |
   | Volles Abenteuer (DE) | rgb(184,181,174) | rgb(65,64,60) | **5.09:1** | 4.5:1 | ✅ |
   | Fahre mit... (DE) | rgb(184,181,174) | rgb(73,67,64) | **4.76:1** | 4.5:1 | ✅ |
   | Husqvarna TE 300 — 300cc (EN/ES/DE) | rgb(184,181,174) | rgb(71,59,56) | **5.27:1** | 4.5:1 | ✅ |
   | Husqvarna Norden 901 — 901cc (EN/ES/DE) | rgb(184,181,174) | rgb(64,64,63) | **5.09–5.09:1** | 4.5:1 | ✅ |
   | BMW 1300 GS — 1300cc (EN/ES/DE) | rgb(184,181,174) | rgb(65,62,61) | **5.15:1** | 4.5:1 | ✅ |

   **Las 5 combinaciones que motivaron el FAIL original (Getaway, Full Adventure, Ride your own bike, Husqvarna Norden 901, BMW 1300 GS) quedan ≥4.5:1**, confirmadas independientemente en al menos un idioma cada una, y Packages confirmado también en DE (mismas fotos, texto más largo). Salida completa: `contrast-check-v2-output.txt`. Script propio (no reutiliza el del implementer): `contrast-check-v2.py`.

   Confirmación visual: `crop-es-fleetcards-legible.png` (las 3 motos, caption perfectamente legible sobre el scrim oscuro). Comparación con/sin texto en Kurztrip (DE): `crop-kurztrip-withtext.png` vs `crop-kurztrip-bgonly-textohidden.png`.

   **Nota — verificación de robustez adicional, no bloqueante**: además del método estándar (promedio de color de fondo sobre la caja del `<span>`, el mismo que estableció el FAIL original y que el implementer usó para verificar su fix), probé un método más estricto: ocultar el texto (`opacity:0`) para obtener un fondo "limpio" sin contaminación de anti-aliasing del glifo, y medir el 5% de píxeles más claros dentro de esa misma caja (parche de highlight real de la foto, no artefacto de medición — confirmado visualmente en `crop-kurztrip-bgonly-textohidden.png`: hay follaje claro justo bajo el inicio de "4 Nächte" y bajo "Routentage"). Con ese método más severo, 2 de las 3 cards de Packages en DE (texto más largo que en EN, se extiende más hacia zonas claras de la foto) caen a ~3.6:1 en esos parches localizados, aunque el promedio de la región (con el mismo método "limpio") sube a 5.9–6.8:1. Visualmente el texto sigue siendo legible en el crop (ver comparación con/sin texto) — no reproduce la ilegibilidad severa del bug original (1.9–2.9:1 de promedio). Como el proyecto no tiene establecido este método más estricto como criterio de aceptación (ni el intento 1 ni el fix del implementer lo usaron), y el caso está en el límite entre "hallazgo real" y "variación inherente a cualquier foto con textura, iluminación de contraluz", **no lo elevo a FAIL bloqueante** — lo documento como rareza para que quede registrado y el equipo decida si vale la pena un fondo sólido/pill detrás del texto en vez de un scrim degradado, especialmente para las traducciones más largas (alemán).
7. **§14.5 — reviews con diseño coherente y datos creíbles**: confirmado en `/de/reviews/` (05) — `ReviewCard` (TD.5) reutilizado sin cambios, 6 reviews con 6 nacionalidades distintas (Alemania, Reino Unido ×2, Suecia, Italia, Países Bajos), ratings variados (cuatro 5★, dos 4★), detalles concretos y creíbles (Caminito del Rey, mantenimiento de moto, dificultad acordada de antemano), texto íntegramente traducido al alemán. `reviews.ts` inspeccionado directamente — sin cambios desde el intento 1.
8. **§14.2 — 3 idiomas completos y correctos, 5 páginas**: revisado visualmente en las 15 capturas de esta sesión (01–15, 14b) — Home, Packages, Reviews, About, Contact: nav, headings, formulario (campos "NOMBRE"/"EMAIL"/"MENSAJE" en ES confirmados con `snapshot -i`, ver paso 4), precios y mapa (iframe real, controles traducidos "Encuéntranos"/"Combinaciones de teclas" en ES) traducidos correctamente en los 3 idiomas, sin residuos de otro idioma.
9. **Formulario de contacto**: NO se envió con agent-browser contra el endpoint real de Formspree (regla explícita de esta re-verificación). El flujo de envío (éxito y error) está cubierto por `contact.spec.ts` con `page.route()` interceptando `**/f/mykrjbra` — 2 tests de ese fichero incluidos en los 57/57 verdes del paso 3. Con agent-browser solo se confirmó visualmente que el formulario carga con los 3 campos requeridos, correctamente etiquetados y traducidos en los 3 idiomas (EN/ES/DE, ver capturas 10, 11, 11b, 14, 14b).
10. **Sin regresión de F1**: Home/About/Contact/Header/Footer/`LanguageSwitcher` se comportan igual que en T1.4; `pnpm test:e2e` conserva los 57 tests verdes (F0–F2), sin el fallo intermitente de Gallery que apareció en un segundo pase del intento 1 (aquí un solo pase, limpio).
11. **Higiene de proceso**: sesión `agent-browser` (`t23v2`) cerrada explícitamente (`close` + `close --all`) y proceso `serve` (PID 45147, puerto 4918) matado manualmente al terminar — sin procesos huérfanos dejados para el siguiente ciclo.

### Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Recorrido de las 5 páginas en 3 idiomas sin roturas de navegación | 15/15 combinaciones navegadas con éxito vía clicks reales, sin 404 ni error | 01–15,14b*.png | ✅ |
| 2 | `LanguageSwitcher` sin roturas (Header y Footer) en las 5 páginas | Confirmado en las 6 combinaciones sin cobertura permanente + resto ya cubierto por tests | 03,04,06,07,13,14b*.png | ✅ |
| 3 | §14.5 — reviews con diseño coherente y datos creíbles | 6 reviews, nacionalidades/ratings variados, detalles creíbles, traducción íntegra | 05*.png, `reviews.ts` | ✅ |
| 4 | §14.2 — contenido completo y correcto en 3 idiomas, 5 páginas | Nav, headings, precios, formulario, mapa traducidos sin residuos | 01–15*.png | ✅ |
| 5 | Texto legible sobre fondos de imagen (aserción obligatoria cua.md) — **el hallazgo bloqueante del intento 1** | Las 5 combinaciones que fallaban (Getaway, Full Adventure, Ride your own bike, Norden 901, BMW 1300 GS) ahora ≥4.5:1 medido con pixel real independiente (4.52–5.30:1) | `contrast-check-v2-output.txt`, crops | ✅ **corregido** |
| 6 | Sin regresión de F1 | Comportamiento idéntico a T1.4; 57/57 E2E verdes, sin flakiness | `pnpm-test-e2e-v2.txt` | ✅ |
| 7 | `pnpm gate` verde antes del gate CUA | Verde (solo warnings preexistentes ajenos) | `pnpm-gate-v2.txt` | ✅ |
| 8 | Consola del navegador limpia en todo el recorrido | Sin errores ni warnings en las 15 navegaciones | `browser-console-full-session.txt`, `browser-errors-full-session.txt` (0 bytes) | ✅ |

## Coste real
$0 — sin APIs de pago. Build/test/CUA 100% local (`serve` local, agent-browser local, sin llamadas a Formspree/Google Maps de pago).

## Veredicto
**PASS** — el fix (scrim `bg-gradient-scrim` tokenizado insertado entre foto y caption cuando `imageSlot` está presente, más subida de la opacidad máxima del token de `0.75` a `0.85`) corrige el hallazgo bloqueante del intento 1: las 5 combinaciones que medían 1.90–3.67:1 ahora miden 4.52–5.30:1, confirmado con medición de pixel real **independiente** (script propio, no el del implementer), en al menos un idioma por elemento y cruzado en EN/ES/DE para los 3 casos de `/about`. El resto de la Verificación literal (navegación de las 5×3 combinaciones, `LanguageSwitcher` en las 5 páginas incluidas las 6 combinaciones sin cobertura permanente previa, §14.5, §14.2, sin regresión de F1, consola limpia, gate verde, 57/57 E2E) pasa sin reservas.

**Rarezas** (no bloqueantes):
- Con un método de medición más estricto que el usado para establecer el bug original (fondo "limpio" sin texto + peor 5% de píxeles en vez de promedio), 2 de las 3 cards de Packages en alemán (texto más largo) muestran parches localizados de la foto de fondo en torno a 3.6:1 bajo algunos caracteres — visualmente el texto sigue siendo legible (no reproduce la ilegibilidad severa original) y el promedio de la región sigue muy por encima del umbral (5.9–6.8:1 con este mismo método estricto). No es el criterio que el proyecto ha usado hasta ahora para este bug y lo documento solo para que quede registrado, no bloquea el PASS. Sugerencia si se quiere blindar del todo: un fondo sólido/pill detrás del caption en vez de un scrim degradado, especialmente pensando en las traducciones más largas.
- El precio en español sigue sin separador de miles ("Desde 1290 €") — ya documentado en `docs/verifications/T2.1/report.md` como comportamiento nativo de `Intl.NumberFormat('es')`, no bloquea.
- `docs/design-system/tokens/colors.css` (espejo de solo lectura) sigue con el valor antiguo `0.75` del token `--gradient-scrim` — desincronización ya documentada y aceptada por el proyecto (regla: ese fichero es de solo lectura), no se toca ni bloquea.
- La preview de Reviews en Home sigue reemplazada por "Our Fleet" (cambio de alcance de T1.1 ya documentado en planning.md, anterior a esta re-verificación) — no es una regresión.
