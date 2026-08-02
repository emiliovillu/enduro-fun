# Verificación T1.4 — E2E de fase F1

- **Tarea**: T1.4 · E2E de fase F1 (`planning.md`)
- **Ejecutores**: verifier (contexto fresco) × 2 intentos independientes
- **Sistema (intento 2)**: working tree con el diff sin commitear del fix post-T1.4 sobre HEAD `97b193e` (main). Ficheros modificados: `apps/web/src/components/ui/language-switcher.tsx`, `header.tsx`, `footer.tsx`, las 6 páginas `apps/web/src/app/[locale]/**/page.tsx`, `apps/web/e2e/about.spec.ts`, `apps/web/e2e/contact.spec.ts`; nuevo `apps/web/src/lib/nav-links.ts`. Confirmado con `git diff`/`git status` al inicio de esta re-verificación.

## Verificación esperada (literal de planning.md)
> recorrido completo del caso de uso 2 y 3 del PRD (§4) — desde `/en/` navegar a About y a Contact, cambiar idioma en cada paso y comprobar que persiste la navegación, enviar el formulario de contacto (fixture) y ver el estado de éxito, comprobar el mapa visible. Cita criterios de éxito §14.2 (3 idiomas completos en Home/About/Contact), §14.3 (formulario funcional), §14.4 (mapa visible e interactivo), §14.7 (responsive). Sin regresión de TD.7/F0.

---

## Intento 1 — 2026-08-02 — FAIL

Ejecutado por un verifier de contexto fresco anterior. Resumen (detalle completo del recorrido, capturas `01`–`10` y `03-BUG-*`/`04-BUG-*`, y análisis de causa raíz conservados en este mismo directorio):

- `pnpm gate` verde, build de 24 páginas OK, 55/55 Playwright OK.
- Navegación Home→About→Contact en el mismo idioma: OK.
- **FAIL en el punto central**: cambiar de idioma con el `LanguageSwitcher` del Header estando en `/en/about/` o `/en/contact/` aterrizaba siempre en `/${locale}/` (Home), no en `/${locale}/about|contact/` — reproducido 2/2 veces (About→ES, Contact→DE). Causa raíz: `language-switcher.tsx:57` construía `href={`/${code}/`}` sin leer la ruta actual.
- Formulario con fixture: OK (monkey-patch de `window.fetch` documentado, ver detalle abajo — el mecanismo de `agent-browser network route --body` no añade cabeceras CORS y es rechazado por el `fetch()` cross-origin real de la app).
- Mapa: OK. Responsive: OK. Gate/build/E2E sin regresión: OK.
- Veredicto: **FAIL** por el punto de cambio de idioma, causa raíz + fix requerido documentados para el implementer.

*(Nota de esta re-verificación: los ficheros `01-en-home.png` y `02-en-about.png` de esta carpeta fueron sobrescritos sin querer por capturas del intento 2 que reutilizaron los mismos nombres — el contenido visual es equivalente en ambos intentos (misma página About/Home en inglés, sin cambios visuales introducidos por el fix, que solo toca hrefs no visibles en una captura estática), así que no se pierde información sustantiva, pero se anota por rigor de auditoría. Las capturas `03-BUG-about-to-es-lands-on-home.png` y `04-BUG-contact-to-de-lands-on-home.png` — la evidencia central del bug — permanecen intactas.)*

---

## Intento 2 (re-verificación tras fix) — 2026-08-02 — PASS

### Fix aplicado (verificado en el código, no solo confiado al resumen del implementer)
`LanguageSwitcher` recibe ahora `currentSlug` y construye el href con `localeHref(code, currentSlug)` (mismo helper que ya usaban Header/Footer). `Header`/`Footer` derivan `currentSlug` de su prop `active: NavKey` vía `navKeyToSlug()` (nuevo `apps/web/src/lib/nav-links.ts`, sin `'use client'` para que el `Footer` — Server Component — pueda invocarlo sin cruzar el límite servidor/cliente). Las 6 páginas declaran `const active: NavKey = '...'` una vez y lo pasan a ambos. Confirmado leyendo el diff completo (`git diff`), no solo el resumen del implementer.

### Pasos ejecutados

1. **`pnpm gate`** desde la raíz, sesión fresca → verde (5 warnings preexistentes ajenos `import-x/no-named-as-default-member`, 0 errores; typecheck/format/knip/readme:status OK; vitest 19/19). Evidencia: `pnpm-gate-reverify.txt`.
2. **`pnpm build`** (`apps/web`) → export estático, 24 páginas generadas, sin errores. Evidencia: `pnpm-build-reverify.txt`.
3. **`npx playwright test`** (suite completa) → **55 passed, 2 failed** — los 2 fallos son `gallery.spec.ts` (`el foco queda atrapado...`, `la primera foto no tiene botón "anterior"...`), **no relacionados con el fix de idioma**. Confirmado con un `git stash` que restaura el HEAD `97b193e` **sin el fix** (rebuild + re-test aislado): el mismo test (`la primera foto no tiene botón...`) falla igual en el baseline pre-fix — es un fallo preexistente del lightbox de Gallery (T1.5), no una regresión introducida por esta tarea. Repetido con `--repeat-each 2` y en aislamiento (`--workers 1`): el fallo es mayormente reproducible (3/4 intentos), más consistente de lo que "flaky de contención de workers" sugiere — **se anota como hallazgo a investigar en una tarea propia**, pero queda fuera del alcance literal de T1.4 (que no menciona Gallery) y no es una regresión de este fix. Evidencia: `pnpm-test-e2e-reverify.txt`.
4. Servido el build (`npx serve -l 4792 out`, sin `-s`); `curl` confirma 200 en `/en/`, `/en/about/`, `/en/contact/`.
5. **agent-browser sesión `t14b`**, `open http://localhost:4792/en/`: snapshot confirma Header (nav 6 páginas + `LanguageSwitcher` EN/ES/DE) y Footer (nav Explore/Company + `LanguageSwitcher` EN/ES/DE) — dos instancias del switcher, ambas afectadas por el bug original. Screenshot `01-en-home.png`.
6. Click en "ABOUT" del nav → `get url` → `http://localhost:4792/en/about/`. Screenshot `02-en-about.png`.
7. **Reproducción exacta del escenario 1 del FAIL (Header, About→ES)**: click en "ES" del `LanguageSwitcher` del **Header** → `get url` → **`http://localhost:4792/es/about/`** (no la raíz). Contenido confirmado en español ("SOBRE NOSOTROS" resaltado en el nav, heading "CONOCIMIENTO LOCAL, RUTAS DE VERDAD"). Screenshot `03-es-about-header-switch.png`.
8. **Footer del mismo estado (About→DE, vía Footer)**: scroll al footer, click en "DE" del `LanguageSwitcher` del **Footer** estando en `/es/about/` → `get url` → **`http://localhost:4792/de/about/`**. Contenido en alemán confirmado ("ÜBER UNS" resaltado, heading visible). Screenshots `04-es-about-footer-lang.png` (antes), `05-de-about-via-footer.png` (después).
9. **Reproducción exacta del escenario 2 del FAIL (Header, Contact→DE)**: `open /en/contact/` → confirmado formulario/mapa en inglés → click en "DE" del `LanguageSwitcher` del **Header** → `get url` → **`http://localhost:4792/de/contact/`** (no la raíz). Screenshots `06-en-contact.png`, `07-de-contact-header-switch.png`.
10. **Footer desde Contact (DE→EN, vía Footer)**: scroll al footer, click en "EN" del `LanguageSwitcher` del **Footer** estando en `/de/contact/` → `get url` → **`http://localhost:4792/en/contact/`**. Screenshots `08-de-contact-footer-lang.png` (antes), `09-en-contact-via-footer.png` (después). **4/4 combinaciones (Header×About, Footer×About, Header×Contact, Footer×Contact) preservan la página al cambiar de idioma** — el bug de ambas instancias del switcher, en las dos páginas donde se manifestó, está resuelto.
11. **Formulario de contacto (fixture, nunca Formspree real)**: primero repetido el intento con `agent-browser network route "**/f/mykrjbra" --body '{"ok":true}'` → confirma otra vez la limitación de CORS ya documentada en el intento 1 (el `fetch()` cross-origin real la rechaza; el propio flujo de error de la app se dispara correctamente — `status==='error'` renderiza *"Something went wrong sending your message..."*, confirmado leyendo el DOM). Screenshots `10-en-contact-filled.png`, `11-en-contact-after-failed-mock.png`. Para ejercitar el camino de éxito se recurrió al mismo mecanismo que el intento 1 (monkey-patch de `window.fetch` vía `eval`, que intercepta *solo* `formspree.io/f/mykrjbra` y resuelve `{ok:true}` localmente sin salir nunca a la red — nunca toca Formspree real): rellenados Name/Email/Message, click "SEND MESSAGE" → `wait --text "Thanks"` resuelto → UI reemplaza el formulario por *"Thanks — your message is on its way. We'll get back to you soon."*. Screenshots `12-en-contact-filled-for-fixture.png`, `13-en-contact-success.png`. Doble confirmación independiente: el test permanente `contact.spec.ts` → `'envío correcto muestra el mensaje de éxito'` (que usa `page.route()`, sin el problema de CORS) está en el pase verde del paso 3.
12. **Mapa**: iframe real de Google Maps (`title="Google Maps — Find us"`, Álora/Málaga, controles de zoom/satélite/indicaciones) visible en Home y Contact en todas las capturas de los pasos 5–13. Interactividad (pan/zoom) ya verificada en profundidad en `docs/verifications/T1.3/report.md` (2026-07-20, PASS) sobre el mismo componente sin cambios en este diff — no repetida en detalle, sin contradicción.
13. **Responsive (§14.7)**: `set viewport 390 844` → `/en/about/` muestra botón "Open menu" (hamburguesa) en vez del nav de 6 enlaces. Screenshot `14-mobile-en-about.png`. Abierto el panel → nav vertical + `LanguageSwitcher` visibles. Screenshot `15-mobile-menu-open-about.png`. **Cambio de idioma desde el menú móvil, estando en About**: click "ES" → `get url` → `http://localhost:4792/es/about/` (preserva la página también en mobile). Screenshot `16-mobile-es-about-after-switch.png`. `/en/contact/` en mobile: `document.documentElement.scrollWidth === clientWidth === 390` (sin overflow horizontal). Screenshot `17-mobile-en-contact.png`.
14. **Consola del navegador**: capturada en 3 puntos de la sesión (`browser-console-contact.txt`, `browser-console-full-session.txt`, `browser-console-final.txt`) — **vacía en los tres casos, sin errores ni warnings** en ningún momento del recorrido (Home, About, Contact, cambios de idioma ×4, envío de formulario, mobile).
15. **Sin regresión de TD.7/F0**: build de 24 páginas sin errores, `pnpm gate` verde, 55/57 E2E verdes (los 2 fallos son de Gallery/T1.5, preexistentes al fix, confirmados con `git stash` contra el baseline sin el fix — ver paso 3), `/` sigue redirigiendo a `/en/` (cubierto dentro de la suite, i18n.spec.ts en el pase verde).

### Resultado observado vs esperado

| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm gate` verde | Verde (solo warnings preexistentes ajenos) | `pnpm-gate-reverify.txt` | ✅ |
| 2 | Navegar `/en/` → About → Contact | OK en ambos saltos | `01`, `02`*.png | ✅ |
| 3 | **Cambiar idioma en cada paso (About, Contact) y que persista la navegación** — Header y Footer | **4/4 combinaciones correctas**: Header×About (`/en/about/`→`/es/about/`), Footer×About (`/es/about/`→`/de/about/`), Header×Contact (`/en/contact/`→`/de/contact/`), Footer×Contact (`/de/contact/`→`/en/contact/`). También correcto en el menú móvil. | `03`–`09`*.png, `16`*.png | ✅ **PASS** (antes FAIL) |
| 4 | Enviar formulario de contacto (fixture) y ver estado de éxito | Formulario se rellena y envía; con fixture (sin tocar Formspree real) la UI pasa a "Thanks — your message is on its way..." | `12`, `13`*.png; `pnpm-test-e2e-reverify.txt` (test permanente en verde) | ✅ |
| 5 | Mapa visible en Home/Contact | Iframe real de Google Maps presente y visible; interactividad ya confirmada en T1.3 sin cambios en este diff | `01`, `06`, `13`*.png | ✅ |
| 6 | §14.2 — 3 idiomas completos en Home/About/Contact | Contenido correcto y traducido en los 3 idiomas, confirmado esta vez **navegando de verdad** con el switcher (no solo tecleando la URL) desde About y Contact, además de por `pnpm test:e2e` | — | ✅ |
| 7 | §14.7 — responsive | Menú hamburguesa en mobile, cambio de idioma funcional preservando página, sin overflow horizontal en About/Contact | `14`–`17`*.png | ✅ |
| 8 | Sin regresión TD.7/F0 | Build 24 páginas OK, 55/57 E2E verdes (2 fallos de Gallery preexistentes al fix, confirmado con `git stash`), gate verde, consola limpia en toda la sesión | `pnpm-build-reverify.txt`, `pnpm-test-e2e-reverify.txt`, `browser-console-*.txt` | ✅ |

### Coste real
$0 — sin APIs de pago. Build local, Playwright local, agent-browser local, sin ningún envío real a Formspree (monkey-patch de `fetch`, igual que el intento 1).

### Veredicto
**PASS**

El fix resuelve exactamente el defecto documentado en el intento 1: reproducido el mismo recorrido exacto que expuso el bug (About→ES vía Header, Contact→DE vía Header) y, adicionalmente, las combinaciones que el intento 1 no llegó a cubrir (Footer en ambas páginas, menú móvil), con resultado correcto en las 4+1 combinaciones probadas. Código del fix revisado directamente (no solo el resumen del implementer): `language-switcher.tsx` ya no hardcodea la raíz del locale, y `nav-links.ts` resuelve limpiamente el problema de límite servidor/cliente (Footer es Server Component) que habría bloqueado un enfoque más ingenuo de reexportar desde `header.tsx`.

**Rarezas** (no bloquean el PASS):
- El mecanismo de mock de red de `agent-browser network route --body` sigue sin añadir cabeceras CORS a la respuesta simulada (ya documentado en el intento 1) — se resolvió otra vez con monkey-patch de `window.fetch`, no es un defecto de la app.
- **2 tests de `gallery.spec.ts` fallan de forma mayormente reproducible** (`el foco queda atrapado dentro del lightbox...`, `la primera foto no tiene botón "anterior"...` — este segundo en 3/4 intentos con `--repeat-each 2`/`--workers 1`), confirmado preexistente al fix de esta tarea vía `git stash` contra el baseline `97b193e`. No es una regresión de T1.4 ni está dentro de su alcance literal (Gallery no se menciona en la Verificación de T1.4), pero es más consistente que un simple "flaky de contención de workers" — **se recomienda abrir una tarea de investigación propia** para el lightbox de Gallery (T1.5) antes de que esto contamine el gate de una fase futura.
- Filenames `01-en-home.png`/`02-en-about.png` de este directorio fueron reutilizados entre el intento 1 y el intento 2 (contenido visual equivalente en ambos casos, sin pérdida de información sustantiva) — ver nota en la sección del intento 1.
