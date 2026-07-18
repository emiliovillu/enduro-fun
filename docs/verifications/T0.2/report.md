# Verificación T0.2 — i18n estático (EN/ES/DE)

- **Tarea**: T0.2 · i18n estático (EN/ES/DE) (`planning.md`)
- **Fecha**: 2026-07-18
- **Ejecutor**: verifier · agent-browser 0.32.2 · sesión `t0.2`
- **Sistema**: working tree sobre commit `8b940721fed87509e597ad1ae26d37cc8c82064b` (HEAD) + diff sin commitear de T0.2 (confirmado con `git status`/`git diff --stat` antes de empezar: rutas `[locale]`, `src/i18n/`, `src/messages/`, `e2e/`, `playwright.config.ts`, `vitest.config.ts`, `packages/core/src/contracts/messages.ts` + cambios en `header.tsx`, `language-switcher.tsx`, `next.config.ts`, `page.tsx`). Build estático real (`next build`, Turbopack) servido con `python3 -m http.server 8756` sobre `apps/web/out/`. No hay Postgres/worker en este proyecto (web estática); no aplica `docker compose`/`pnpm dev`/`pnpm seed`.

## Verificación esperada (literal de planning.md)
> **Verificación**: `pnpm build` genera `out/en/index.html`, `out/es/index.html`, `out/de/index.html`; abrir `/` en el navegador estático local redirige a `/en/`; editar un mensaje y comprobar que aparece traducido en los 3 idiomas tras rebuild. **Añadido por ajuste de alcance de TD.3** (ver journal 2026-07-17): con `LanguageSwitcher` ya construido (TD.3, vía TD.7), verificar aquí que clicar cada opción del switcher navega realmente a `/en`, `/es`, `/de` sobre una página con el componente montado.

También el **Playwright permanente** declarado en la tarea: `apps/web/e2e/i18n.spec.ts` — navegar a `/`, `/es/`, `/de/` y comprobar idioma correcto; control negativo (quitar clave de `de.json` rompe el build) probado con un test que invoca `pnpm build`, no en Playwright/navegador.

## Pasos ejecutados
1. `git status` / `git diff --stat` en la raíz del repo → diff coherente con el resumen del implementer (rutas `[locale]`, `i18n/`, `messages/`, `e2e/`, `playwright.config.ts`, `vitest.config.ts`, `messages.ts`/`messages.test.ts` en `packages/core`, más ajustes en `header.tsx`/`language-switcher.tsx`/`next.config.ts`/`page.tsx`, y el cierre del `[verificar]` de PRD §6.2/§12). Nada fuera de alcance.
2. `pnpm gate` (primera pasada, antes de tocar nada) → verde: lint (0 errores, 5 warnings preexistentes de `import-x/no-named-as-default-member`, no relacionados con T0.2), typecheck, format:check, knip, `readme:status:check`, `pnpm test` (3 test files, 7 tests, 5.0s).
3. `rm -rf apps/web/out apps/web/.next && pnpm --filter @app/web build` → build real (`next build`, Turbopack) en ~5 s. Confirmado en el output: rutas `/`, `/[locale]` (`/en`, `/es`, `/de`), `/design-system`. Ficheros generados con contenido real (no vacíos): `out/en/index.html` 11554 B, `out/es/index.html` 11560 B, `out/de/index.html` 11562 B, `out/index.html` 8902 B.
4. Servido `apps/web/out/` con `python3 -m http.server 8756`. `curl -s http://localhost:8756/` → HTML crudo (sin ejecutar JS) contiene `<meta http-equiv="refresh" content="0; url=/en/"/>` y el enlace de fallback `<a href="/en/">the English site</a>` — el mecanismo de redirección es meta-refresh puro, no JS de detección (evidencia: `00-root-raw-html-meta-refresh.txt`).
5. `agent-browser --session t0.2 open http://localhost:8756/` → `get url` tras la navegación devuelve `http://localhost:8756/en/`: la redirección ocurre de verdad en un navegador real (captura `01-root-redirect.png`).
6. Control positivo de edición de mensaje: backup de `apps/web/src/messages/es.json`, sustituido `home.subtitle` por un canario único (`VERIFIER-CANARY-MARKER-ES-9182`, elegido por el verifier, no reutilizando fixtures del implementer), rebuild real. `grep -c` del canario en los 3 `index.html` generados → presente 1 vez en `out/es/index.html`, 0 veces en `out/en/index.html` y `out/de/index.html`. Confirmado también visualmente con `agent-browser read` sobre `/es/` servido (texto del canario visible en la página, captura `05-es-canary-edit.png`). Fichero restaurado (`cp` desde backup) y verificado con `diff` byte a byte contra el original → idéntico; rebuild final confirma 0 apariciones del canario en los 3 idiomas.
7. `agent-browser` sobre `/en/` con `LanguageSwitcher` montado: snapshot muestra 3 links (`EN`/`ES`/`DE`) en `nav[aria-label=Language]`. Clic en `ES` → `get url` = `http://localhost:8756/es/`, snapshot confirma heading "HOLA ENDUROFUN" (contenido en español real, no solo el href). Clic en `DE` → `get url` = `http://localhost:8756/de/`, heading "HALLO ENDUROFUN". Clic en `EN` → `get url` = `http://localhost:8756/en/`, heading "HELLO ENDUROFUN". Las 3 direcciones de navegación del switcher verificadas con clic real y URL/contenido post-navegación, no solo lectura de `href` (capturas `02`–`04`).
8. `agent-browser console` tras todo el recorrido → vacío, sin errores ni warnings de consola.
9. Contraste WCAG del `LanguageSwitcher` (texto sobre acento activo y sobre fondo de página, tema claro — único tema soportado activamente en este build; `data-theme="dark"` no cambia los estilos computados, confirmando que el proyecto aún no expone un theme-switch real, fuera de alcance de T0.2): activo (texto `rgb(28,28,30)` sobre acento `rgb(232,121,30)`) → ratio 5.82:1; inactivo (texto `rgb(77,77,82)` sobre fondo `rgb(250,246,240)`) → ratio 7.81:1. Ambos ≥ 4.5:1. (Estilos heredados sin cambios de TD.3/TD.8, ya auditados en su momento; T0.2 solo tocó los `href` de navegación.)
10. `pnpm test:e2e` → 4/4 tests verdes (`apps/web/e2e/i18n.spec.ts`), incluido el test que ejercita el `LanguageSwitcher` con clicks reales de Playwright.
11. `pnpm test` (unit, incluye el control negativo real `messages.build-negative.test.ts`) → 3 test files / 7 tests verdes. El control negativo invoca `pnpm --filter @app/web build` de verdad (confirmado por tiempo de ejecución ~5s, coincidente con un build real medido de forma independiente) y falla mencionando `subtitle`. Tras el test, `git status --short apps/web/src/messages/` solo muestra el directorio como `??` (todo el árbol de mensajes es nuevo/sin commitear) y el contenido de `de.json` se confirmó idéntico al esperado (`home.subtitle` = "Geführte Enduro-Touren in Álora, Málaga.") — el `afterEach` restaura correctamente.
12. `pnpm gate` (segunda pasada, tras todas las manipulaciones) → verde de nuevo, mismo resultado que el paso 2. `git status --short` final: mismo diff que al empezar + `docs/verifications/T0.2/` nuevo — ningún fichero de producto quedó modificado por la verificación.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm build` genera `out/en/index.html`, `out/es/index.html`, `out/de/index.html` con contenido | Los 3 generados, 11.5-11.6 KB cada uno, contenido HTML real | build log, `ls -la` | ✅ |
| 2 | Abrir `/` en navegador estático local redirige a `/en/` | `get url` tras `open /` = `/en/`; meta-refresh puro en HTML crudo (sin JS) | 00-root-raw-html-meta-refresh.txt, 01-root-redirect.png | ✅ |
| 3 | Editar un mensaje aparece traducido en los 3 idiomas tras rebuild (solo en el idioma editado) | Canario en `es.json` → presente solo en `out/es/index.html` tras rebuild; ausente en `en`/`de`; fichero restaurado íntegro | grep post-build, 05-es-canary-edit.png, diff byte-a-byte | ✅ |
| 4 | Clicar cada opción del `LanguageSwitcher` navega realmente a `/en`, `/es`, `/de` | 3 clics reales con `agent-browser`, URL y contenido (heading traducido) confirmados tras cada uno | 02/03/04-*.png, snapshots con heading EN/ES/DE | ✅ |
| 5 | Playwright permanente `i18n.spec.ts` (4 tests) verde | `pnpm test:e2e` → 4 passed | e2e-output.txt | ✅ |
| 6 | Control negativo (quitar clave de `de.json` rompe `pnpm build`, mencionando la clave) | `pnpm test` (incluye `messages.build-negative.test.ts`) → verde; build real invocado (~5s); restauración de `de.json` confirmada | test output, contenido de `de.json` verificado post-test | ✅ |
| 7 | Consola limpia durante el recorrido | `agent-browser console` vacío | browser-console.txt | ✅ |
| 8 | `pnpm gate` verde antes y después de la verificación | 2 pasadas verdes, árbol de trabajo sin cambios de producto | gate output (2x) | ✅ |

## Coste real
$0 — sin APIs de pago (todo local: build de Next.js, servidor HTTP local, agent-browser contra localhost).

## Veredicto
**PASS** — los 8 puntos de la Verificación literal se comprobaron contra el sistema real (build estático servido localmente, navegador real vía `agent-browser`, `pnpm gate`/`test:e2e`/`test` verdes), incluyendo el control negativo de edición/rebuild con un canario elegido por el verifier (no reutilizado del implementer) y la navegación real de las 3 opciones del `LanguageSwitcher` con verificación de URL y contenido post-clic, no solo de `href`.

Notas (no bloquean el PASS):
- El `[verificar]` de PRD §6.2/§12 (compatibilidad de librería de i18n con `output: 'export'`) está correctamente cerrado en el diff de `PRD.md`: se investigó `next-intl` y se documentó la decisión de ir con solución custom mínima, con la compatibilidad de Next.js 16.2.10 verificada por el build real.
- `data-theme="dark"` no altera los estilos computados del `LanguageSwitcher` en este build — el proyecto aún no expone un theme-switch operativo; no es responsabilidad de T0.2 (solo tocó `href`s de navegación, no estilos), pero se deja anotado para que quien monte el theme-switch real (fuera del alcance visto hasta ahora en el planning) confirme el contraste en dark también.
- 5 warnings de lint preexistentes (`import-x/no-named-as-default-member` en `eslint.config.ts` y `scripts/readme-status.mjs`) no relacionados con T0.2, no bloquean el gate.
