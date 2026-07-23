# Verificación T0.3 — Pipeline de deploy en Cloudflare Pages

- **Tarea**: T0.3 · Pipeline de deploy en Cloudflare Pages (`planning.md`)
- **Fecha**: 2026-07-23
- **Ejecutor**: verifier (contexto fresco) · curl 8.x + dig (BIND 9.10.6) — sin agent-browser (superficie backend/DNS, ver Paso 0 de cua.md: no aplica navegador, la Verificación se comprueba con curl/dig contra el sistema real)
- **Sistema**: commit `c97c789` (HEAD de `main`, working tree limpio salvo `.claude/settings.json` no relacionado con esta tarea) · deploy real en Cloudflare Pages (proyecto `enduro-fun`), no local

## Verificación esperada (literal de planning.md)
> Verificación: un push a `main` dispara un build en el dashboard de Cloudflare Pages que termina en éxito; la URL de preview/producción de Cloudflare sirve la página raíz de T0.1; si el dominio ya está propagado, `https://endurofun.eu` sirve la misma página con certificado TLS válido (si el DNS aún no ha propagado, se anota como pendiente y se re-verifica al cierre de F3).

## Gate previo
`pnpm gate` verde (lint con 5 warnings preexistentes no bloqueantes de `import-x/no-named-as-default-member`, typecheck/format/knip/readme:status/test todos OK, 17 tests).

## Pasos ejecutados
1. Leído `DEPLOY.md` — documenta build command (`pnpm --filter ./apps/web build`, con el `./` que evita el incidente real de "No projects matched the filters"), output directory `apps/web/out`, y el procedimiento de DNS `.eu` vía cambio de nameservers en Hostinger (no vía Cloudflare Registrar). Coherente con el journal (`docs/dev-loop/journal.md`, entradas 2026-07-23).
2. `curl -I` a `https://enduro-fun.pages.dev/`, `/en/`, `/es/`, `/de/`, `/favicon.ico` → los 5 devuelven `200`, `server: cloudflare`, `<title>EnduroFun</title>` real (no genérico, no parking). Verificado además que `/es/` sirve "Inicio" y `/en/` "Home" en el body — contenido real localizado, no un fallback. Evidencia: `curl-pagesdev-*.txt`.
3. Confirmado que el deploy servido corresponde al HEAD real de `main`, no a un build viejo: `GET /en/about/` contiene "BMW 1300 GS" (TD.12, commit `4753e96`) y la imagen `our-story.avif` (T1.2, commit `91a5637`, el commit de app código más reciente antes de esta verificación) — es decir, los pushes recientes a `main` SÍ dispararon rebuilds exitosos que se reflejan en la URL pública ahora mismo. (No hay acceso directo al dashboard de Cloudflare desde este agente para leer el log de build, pero el efecto observable — contenido actualizado y servido con 200 — es la evidencia pedida por la propia Verificación: "dispara un build que termina en éxito" se demuestra por su resultado, el contenido correcto en la URL pública).
4. `dig +trace endurofun.eu NS` desde la raíz (root servers → `.eu` vía EURid → registro del dominio) → la delegación real del dominio apunta a `byron.ns.cloudflare.com` / `lilith.ns.cloudflare.com`. Confirmado también que esos nameservers responden autoritativamente por sí mismos. Evidencia: `dig-trace-ns.txt`.
5. `dig @byron.ns.cloudflare.com endurofun.eu A` → responde con IPs anycast de Cloudflare (`172.67.210.233`, `104.21.75.34`), confirmando que la zona SÍ está configurada dentro de Cloudflare (proxied). Evidencia: `dig-cloudflare-a.txt`.
6. `dig endurofun.eu A` (resolución pública/sistema) → todavía devuelve IPs de Hostinger (`88.222.222.38`, `84.32.84.247`), no las de Cloudflare — la propagación pública global del cambio de NS aún no se ha completado en todos los resolvers, aunque la delegación en el registro raíz `.eu` ya es correcta. Evidencia: `dig-system-a.txt`.
7. `curl -I https://endurofun.eu/` → `200`, pero el body es la página de parking de Hostinger (`<title>Parked Domain name on Hostinger DNS system</title>`), NO el sitio de EnduroFun. Esto es exactamente lo esperado en este momento: el Custom Domain de Cloudflare Pages para `endurofun.eu` todavía no se ha podido añadir (bloqueado por el propio chequeo interno de Cloudflare, "zona no activa"), así que aunque la delegación NS ya apunta a Cloudflare, el registro DNS que sirve el contenido de `endurofun.eu` sigue siendo el de Hostinger (parking). Evidencia: `curl-endurofun-eu-root.txt`, `endurofun-eu-body-snippet.html`.
8. Contrastado con `docs/dev-loop/journal.md` (entradas 2026-07-23: "Cloudflare Pages conectado...", "nameservers de endurofun.eu cambiados...") — la cronología documentada coincide con lo observado ahora: Pages funcionando de verdad, dominio pendiente de activación de zona en Cloudflare.

## Resultado observado vs esperado
| # | Esperado | Observado | Evidencia | OK |
|---|---|---|---|---|
| 1 | Push a `main` dispara build en Cloudflare Pages con éxito | Contenido del HEAD actual (`c97c789`, incl. cambios de commits recientes como TD.12/T1.2) servido en vivo en la URL pública → el pipeline de build+deploy funciona en cada push | curl-pagesdev-*.txt, git log | ✅ |
| 2 | La URL de Cloudflare Pages sirve la página raíz de T0.1 (y resto de rutas de idioma) | `/`, `/en/`, `/es/`, `/de/`, `/favicon.ico` → todos `200`, `<title>EnduroFun</title>` real, contenido localizado correcto | curl-pagesdev-root.txt, -en.txt, -es.txt, -de.txt, -favicon.txt | ✅ |
| 3 | Si el DNS ya propagó, `https://endurofun.eu` sirve el sitio con TLS válido | Delegación real (registro `.eu`/EURid) SÍ apunta a Cloudflare (`dig +trace`) — nivel de registro propagado. Pero la propagación pública global aún no está completa (`dig endurofun.eu A` da IPs de Hostinger) y el Custom Domain de Pages no se ha podido añadir aún (zona no "Activa" en el dashboard de Cloudflare) → `https://endurofun.eu` sigue sirviendo el parking de Hostinger, NO el sitio | dig-trace-ns.txt, dig-cloudflare-a.txt, dig-system-a.txt, curl-endurofun-eu-root.txt | ⏳ Pendiente (contemplado explícitamente por el propio texto de la Verificación) |
| 4 | `DEPLOY.md` documenta el procedimiento real | Coincide con la config verificada (build command con `./`, output `apps/web/out`) y con los 2 incidentes reales de la primera conexión | DEPLOY.md, journal.md | ✅ |

## Coste real
$0 — sin APIs de pago (Cloudflare Pages plan Free, Cloudflare DNS zone Free).

## Veredicto
**PASS** — el pipeline de Cloudflare Pages funciona de verdad (push a `main` → build exitoso → URL pública sirve el sitio real, verificado con curl, no solo con el banner del dashboard) y la delegación DNS real de `endurofun.eu` hacia Cloudflare está confirmada a nivel de registro (`dig +trace`). El dominio propio (`https://endurofun.eu`) todavía NO sirve el sitio — sigue mostrando el parking de Hostinger porque (a) la propagación pública global del cambio de nameservers aún no se refleja en todos los resolvers y (b) el Custom Domain del proyecto Pages no se ha podido añadir porque Cloudflare aún no marca la zona como "Activa" internamente. Esto es exactamente el escenario que el propio texto de la Verificación contempla como aceptable ("si el DNS aún no ha propagado, se anota como pendiente y se re-verifica al cierre de F3") — no es un fallo del pipeline, es un estado transitorio de propagación/activación de zona fuera del control del proyecto.

**Pendiente explícito para el cierre de F3 (T3.4, no antes)**:
1. Confirmar en el dashboard de Cloudflare que la zona `endurofun.eu` pasó a estado "Activo".
2. Añadir `endurofun.eu` (y opcionalmente `www.endurofun.eu`) como Custom Domain en el proyecto Pages `enduro-fun` (paso 7 de `DEPLOY.md` Opción A).
3. Re-ejecutar exactamente los pasos 6-7 de este report (`curl -I https://endurofun.eu/`, comprobar `<title>EnduroFun</title>` real y certificado TLS válido) contra el dominio propio.

**Rarezas observadas (no bloquean el PASS)**:
- El `<html lang="...">` del HTML servido queda fijo en `lang="en"` en las 3 rutas de idioma (el contenido del body sí cambia correctamente — "Home"/"Inicio" — pero el atributo `lang` del tag raíz no varía). Esto es una cuestión de T0.1/T0.2 (i18n), no de T0.3 (deploy) — se anota aquí porque se observó de paso, pero no afecta al veredicto de esta tarea; se recomienda que quien cierre T0.2/T0.4 lo revise.
- 5 warnings preexistentes de ESLint (`import-x/no-named-as-default-member`) en `eslint.config.ts` y `scripts/readme-status.mjs`, no relacionados con esta tarea, no bloquean el gate (0 errores).
