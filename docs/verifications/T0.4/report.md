# Verificación T0.4 — E2E de fase F0 (re-verificación tras fix de README)

- **Tarea**: T0.4 · E2E de fase F0 (`planning.md`)
- **Fecha**: 2026-07-23
- **Ejecutor**: verifier (contexto fresco) · curl 8.x + openssl · Playwright (`pnpm test:e2e`) contra build local · sin agent-browser (superficie backend/build/DNS-TLS — ver Paso 0 de cua.md: esta tarea es de verificación pura de pipeline, no hay UI interactiva nueva que recorrer con un CUA; se cubre con build/gate local + curl/openssl contra el sistema real desplegado + suite E2E existente como control de regresión)
- **Sistema**: commit `65cb7df2a4d846e3cdfac3fe7244d6d292123f37` (HEAD de `main`, incluye el cierre de T0.3: `planning.md`, `README.md` regenerado y `docs/verifications/T0.3/` commiteados). Working tree limpio salvo `.claude/settings.json` (cambio de configuración del arnés no relacionado con esta tarea) y este propio directorio `docs/verifications/T0.4/` en construcción. El deploy verificado en `https://enduro-fun.pages.dev` sirve el contenido de este mismo commit (confirmado por contenido real: BMW 1300 GS de TD.12 presente en `/en/about/`).

## Verificación esperada (literal de planning.md)
> Verificación: recorrido completo — `pnpm build && pnpm gate` verde; las 3 rutas de idioma sirven contenido placeholder correcto; push a `main` dispara deploy en Cloudflare Pages con éxito; la URL pública (Cloudflare o dominio si ya propagado) es accesible desde fuera y sirve HTTPS válido. Sin regresión de T0.1-T0.3.

Nota de interpretación (dada por quien encarga la re-verificación, consistente con el estado real del proyecto): "contenido placeholder correcto" se lee históricamente — el proyecto avanzó mucho más allá de F0 y las páginas tienen contenido real (Home/About/Gallery/Packages/Reviews/Contact); lo que importa es que las 3 rutas `/en/`, `/es/`, `/de/` sirven contenido real correctamente localizado.

## Contexto de la re-verificación
El intento anterior (mismo día) dio **FAIL** porque `pnpm gate` se detenía en `readme:status:check`: el cierre de T0.3 había marcado `planning.md` `[x]` sin regenerar `README.md` con `pnpm readme:status`. Ese fix ya está commiteado en `65cb7df` (`T0.3: close Cloudflare Pages deploy pipeline`, incluye `planning.md`, `README.md` regenerado y `docs/verifications/T0.3/`). Esta re-verificación repite el **flujo completo** desde cero (no solo el punto que falló), tal como exige el protocolo.

## Pasos ejecutados
1. `git status` / `git log` → working tree limpio (solo `.claude/settings.json` no relacionado), HEAD en `65cb7df` con T0.3 cerrado y README regenerado.
2. `pnpm build` desde la raíz → build de `apps/web` (Next.js 16.2.10, Turbopack) termina en éxito, genera export estático con las 24 páginas esperadas (`/en`, `/es`, `/de` × 6 rutas + `/`, `/_not-found`, `/design-system`, iconos). Sin errores de TypeScript ni de build. Evidencia: `pnpm-build.txt`.
3. `pnpm gate` completo (`lint && typecheck && format:check && knip && readme:status:check && test`) → **VERDE de punta a punta**. `readme:status:check` → `"readme:status — la tabla del README coincide con planning.md ✓"`. `pnpm test` (vitest) → 17/17 tests, 6 test files, verde. Solo 5 warnings preexistentes de ESLint (`import-x/no-named-as-default-member` sobre `tseslint`/`prettier`, no bloqueantes, ya presentes en verificaciones anteriores). Evidencia: `pnpm-gate.txt`.
4. `pnpm test:e2e` (Playwright, contra build local servido estáticamente) como control de regresión adicional (no exigido literalmente por el texto de T0.4, pero cubre "sin regresión de T0.1-T0.3" con evidencia ejecutable en vez de solo inspección) → **49/49 tests verdes** (home, about, contact, gallery, i18n, packages, reviews en los 3 idiomas). Evidencia: `pnpm-test-e2e.txt`.
5. `curl -D -` contra `https://enduro-fun.pages.dev/en/`, `/es/`, `/de/` → los 3 responden `200`, `server: cloudflare`, `content-type: text/html; charset=utf-8`. Evidencia: `headers-{en,es,de}.txt`, `body-{en,es,de}.html`.
6. Contenido localizado real y distinto por idioma verificado en el body (grep de strings de navegación/CTA, no solo el status code): EN → "Home", "About", "Gallery", "Packages", "Reviews", "Contact", "Explore", "Full Adventure"; ES → "Inicio", "Sobre nosotros", "Galería", "Paquetes", "Contacto", "Aventura Completa", "Contacta con nosotros"; DE → "Über uns", "Galerie", "Pakete", "Bewertungen", "Kontakt", "Kontakt aufnehmen", "Entdecken". 3 idiomas claramente distintos, ninguno cae a fallback inglés.
7. Confirmado que el deploy público corresponde al HEAD real verificado y no a un build viejo: `curl https://enduro-fun.pages.dev/en/about/` contiene "1300 GS" (BMW 1300 GS de TD.12, la tarea más reciente antes de T0.3) → push a `main` sí dispara deploy con éxito y sirve el contenido actual.
8. Redirección de `/` → confirmado `<meta http-equiv="refresh" content="0; url=/en/"/>` + enlace visible de fallback `href="/en/"` en el body servido en producción (consistente con T0.2, sin JS de detección de idioma).
9. TLS: `openssl s_client` + `curl -vI` contra `https://enduro-fun.pages.dev` → certificado emitido por Google Trust Services (`WE1`), CN=`enduro-fun.pages.dev`, válido `2026-07-23` a `2026-10-21`, `SSL certificate verify ok.` (curl valida la cadena por defecto, sin `-k`). Evidencia: `tls-cert.txt`, `tls-curl.txt`.
10. Sin regresión de T0.1-T0.3: `/` (raíz) → `200`; ruta inexistente `/en/this-route-does-not-exist-xyz/` → `404` correcto (no todo cae a 200 ciegamente); build de las 24 páginas sin errores; 49/49 E2E verdes cubriendo Home/About/Contact/Gallery/Packages/Reviews en los 3 idiomas + i18n switcher.
11. Rareza reconfirmada (ya anotada por T0.3, no nueva ni bloqueante): `<html lang="...">` queda fijo en `"en"` en las 3 rutas de idioma pese a que el body sí varía correctamente por idioma — deuda de T0.1/T0.2, candidata a T3.2, no bloquea esta Verificación (que habla de "contenido... correcto", no del atributo `lang`).
12. Dominio propio (`https://endurofun.eu`): sin cambios respecto a T0.3 — sigue sin propagar del lado del dashboard de Cloudflare (Custom Domain aún no añadible). La propia Verificación de T0.4 acepta explícitamente "Cloudflare o dominio si ya propagado"; el estado pendiente ya está documentado en T0.3 con re-verificación prevista en T3.4. No se re-repite aquí en detalle (no aporta información nueva).

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | `pnpm build && pnpm gate` verde | `pnpm build` verde (24 páginas); `pnpm gate` **VERDE completo**, incluyendo `readme:status:check` (ya no falla) y `pnpm test` 17/17 | pnpm-build.txt, pnpm-gate.txt | ✅ |
| 2 | Las 3 rutas de idioma sirven contenido correcto y localizado | `/en/`, `/es/`, `/de/` → 200, textos distintos y correctos por idioma | headers-*.txt, body-*.html | ✅ |
| 3 | Push a `main` dispara deploy en Cloudflare Pages con éxito | Contenido del HEAD actual (`65cb7df`) servido en vivo, incl. BMW 1300 GS de TD.12 | body-en.html (about) | ✅ |
| 4 | URL pública accesible desde fuera con HTTPS válido | `https://enduro-fun.pages.dev` → cert de Google Trust Services válido, `SSL certificate verify ok.`, vigente hasta oct-2026 | tls-cert.txt, tls-curl.txt | ✅ |
| 5 | Sin regresión de T0.1-T0.3 | Build 24 páginas OK, raíz 200, ruta inexistente 404, redirección `/`→`/en/` intacta, 49/49 Playwright E2E verdes | pnpm-build.txt, pnpm-test-e2e.txt, headers-*.txt | ✅ |

## Coste real
$0 — sin APIs de pago (build local, Cloudflare Pages Free, curl/openssl, Playwright local).

## Veredicto
**PASS** — los 5 puntos de la Verificación literal se cumplen contra el sistema real desplegado en `https://enduro-fun.pages.dev` (commit `65cb7df`, HEAD de `main`). El fallo del intento anterior (README desfasado en `readme:status:check`) está corregido y confirmado en verde de punta a punta en esta re-ejecución completa del flujo (no solo el paso que había fallado).

**Notas / rarezas (no bloquean el PASS)**:
- `<html lang="...">` fijo en `"en"` en las 3 rutas de idioma pese a que el body sí varía correctamente por idioma — deuda ya anotada por T0.1/T0.2/T0.3, candidata a T3.2.
- `https://endurofun.eu` sigue sirviendo el parking de Hostinger (zona de Cloudflare aún no "Activa", Custom Domain no añadido) — estado transitorio ya documentado y explícitamente aceptado por el propio texto de la Verificación ("Cloudflare o dominio si ya propagado"), pendiente para T3.4.
- 5 warnings preexistentes de ESLint (`import-x/no-named-as-default-member`), no bloqueantes, sin relación con esta tarea.
