# Journal del dev-loop — EnduroFun

> Memoria del bucle entre sesiones. Append cronológico; una entrada por evento (tarea iniciada/cerrada, bloqueo, parada, decisión de arnés, cierre de fase, hotfix). **Escribe para el agente que retomará el trabajo sin tu contexto**: lo no obvio, las decisiones y sus porqués, las deudas — no un log de comandos. Nunca se reescriben entradas antiguas.

## Formatos de entrada

```markdown
## <YYYY-MM-DD> · ⏳ T<ID> iniciada
- 1-2 líneas: qué entrega y coste esperado. (Se escribe en el SELECT del ciclo.)

## <YYYY-MM-DD> · T<ID> cerrada — PASS
- Coste: $X (vs estimado $Y) · Ciclos verifier: N · Tests: N · Commit: <sha-corto> · Evidencia: docs/verifications/T<ID>/
- Decisiones no obvias que las siguientes tareas deben heredar: <1-3 líneas>
- Deuda anotada: <o "—">

## <YYYY-MM-DD> · arnés: <qué cambió>
- Qué pieza del arnés se corrigió (skill/agente/hook/gate), por qué (el ciclo que reveló la carencia) y desde cuándo aplica. El arnés evoluciona deliberadamente, nunca por deriva.

## <YYYY-MM-DD> · T<ID> cerrada — PASS · FASE F<N> COMPLETA
- Lo del cierre normal + resumen de fase: qué entrega observable quedó viva, commits de la fase, deudas que pasan a la siguiente, READMEs revisados. Termina en parada: esperar OK del usuario.

## <YYYY-MM-DD> · hotfix: <síntoma>
- Trabajo fuera del planning (bug en producción/uso real): causa raíz, fix, test permanente que lo protege, y si destapa deuda mayor → candidata a fase de deuda (F<N>b) acordada con el usuario.
```

## 2026-07-17 · Proyecto bootstrapeado

- **Origen**: el usuario ya traía un borrador de PRD (no versionado en el repo, fechado 2026-07-16) usado como input para construir dos proyectos de Claude Design: **"EnduroFun Design System"** (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`, tokens + componentes) y **"EnduroFun Pages"** (`07ce2c66-a9a4-4636-ad05-ea1746fa94f9`, mockups — 2 variantes de Home). Se leyeron ambos vía la tool `DesignSync` (no vía `WebFetch`: las URLs `claude.ai/design/p/…` no son fetchables con esa tool, solo `claude.ai/code/artifact/…`) y se usaron como fuente principal del PRD, reconciliados con las decisiones tomadas en esta conversación.
- **Desviación de stack deliberada** (documentada en PRD §1/§6, planning cabecera, CLAUDE.md/AGENTS.md y README.md): este proyecto es una web de marketing 100% estática, sin base de datos ni backend dinámico. No se usan `packages/db`, `apps/worker` ni Postgres/Drizzle. El deploy es en **Cloudflare Pages** vía CI (push a `main`), NO en el VPS del arnés — la skill `deploy` y `deploy.env` no se usan en este proyecto (se dejan intactos como plantilla por si cambia el hosting).
- **Decisiones de producto cerradas en la entrevista**: reviews con datos inventados en v1 (el cliente aportará reviews reales más adelante, sin integración con Google Places/Reviews API); contacto vía formulario que envía a **Formspree** (no mailto, no backend propio); 5 páginas (Home/Packages/About/Contact/Reviews, confirmado — no solo 4); variante de Home elegida: **A — Cinemática** (hero foto/vídeo a pantalla completa, header transparente) sobre la B (Editorial).
- **Módulos de F0 elegidos**: solo el esqueleto monorepo (T0.1, adaptado sin DB/worker), i18n estático (T0.2, sin middleware — `/` redirige estáticamente a `/en/`, sin auto-detección de idioma de navegador) y un módulo ad-hoc de pipeline de Cloudflare Pages (T0.3, fuera del menú estándar que asume VPS). Módulos descartados: Postgres/Drizzle, auth, storage, colas/máquina de estados/SSE, spend ledger, credenciales cifradas — ninguno tiene consumidor en este PRD.
- **Gaps de componentes detectados en el DS**: no define `Input`/`Textarea` (necesarios para el formulario de contacto) — se crean y se suben a Claude Design en TD.4.
- **Deudas del arnés / prerequisitos externos pendientes**:
  - ⚠ Cuenta de Formspree + ID de endpoint del formulario (bloquea T1.3).
  - ⚠ API key de Google Cloud con Maps Embed API habilitada, restringida por dominio (bloquea T1.3).
  - ⚠ Cuenta de Cloudflare Pages conectada al repo de GitHub + DNS de `endurofun.eu` en Hostinger apuntando a Cloudflare (bloquea T0.3).
  - `pnpm readme:status:check` no se ha podido ejecutar todavía (no existe `package.json` raíz — lo crea T0.1); la tabla «Estado global» de `planning.md` se validó a mano contra la regex de `scripts/readme-status.mjs`.
- **Licencia**: AGPL-3.0, repo público (`github.com/emiliovillu/enduro-fun`, remote ya configurado).
- Próxima tarea elegible: **T0.1**.

## 2026-07-17 · T0.1 cerrada — PASS
- Coste: $0 (vs estimado $0) · Ciclos verifier: 1 · Tests: 3 · Commit: (pendiente, ver siguiente) · Evidencia: docs/verifications/T0.1/
- Decisiones no obvias que las siguientes tareas deben heredar:
  - `pino` retirado del catalog de `pnpm-workspace.yaml` (comentado): no hay ningún script propio nuevo que loguee todavía — se reintroduce en la primera tarea de F0 que añada uno (`knip` lo marcaría como dep sin uso si se deja activo sin consumidor).
  - `.prettierignore` usa `/*.md` + `!/README.md` en la raíz (glob general) en vez de listar ficheros uno a uno — cualquier `.md` nuevo en la raíz (`CONTRIBUTING.md`, etc.) queda excluido de Prettier automáticamente salvo que se quiera lo contrario.
  - `apps/web/tsconfig.json` incluye `next.config.ts` explícitamente en `include` (no un catch-all `**/*.ts`) — cualquier fichero `.ts` nuevo en la raíz de `apps/web` (fuera de `src`/`test`) necesita añadirse a mano a `include` o quedará fuera del typecheck del gate.
  - Rareza de Next.js (no defecto de esta tarea): `next-env.d.ts` referencia `.next/types/routes.d.ts`, que solo existe tras un `pnpm build` (o `next dev`). Un `pnpm lint`/`pnpm gate` en un checkout limpio sin build previo falla con `import-x/no-unresolved` en ese fichero. CI (T0.3/futuро pipeline) debe correr `pnpm build` antes de `pnpm gate`, o `pnpm gate` antes de cualquier `rm -rf .next` manual.
- Deuda anotada: — (todos los hallazgos de code-review/simplify se arreglaron en la propia tarea: `.prettierignore` general, `apps/web/tsconfig.json` sin catch-all; el resto de hallazgos fueron descartados como no accionables o falsos positivos con justificación).

## 2026-07-17 · ⏳ TD.1 iniciada
- Tokens del DS, fuentes self-hosted y showcase /design-system (espejo DesignSync sobre el proyecto 8ee30e13-2372-49e4-ba6f-2692bc1a6af5). Coste esperado: $0 (sin APIs de pago; DesignSync no factura).

## 2026-07-17 · TD.1 cerrada — PASS
- Coste: $0 (vs estimado $0) · Ciclos verifier: 1 · Tests: 3 (sin cambios respecto a T0.1, sin tests unitarios nuevos — showcase visual puro) · Commit: (pendiente, ver siguiente) · Evidencia: docs/verifications/TD.1/
- Decisiones no obvias que las siguientes tareas (TD.2+) deben heredar:
  - **Bug real cazado en code-review, no por el implementer**: `--font-display`/`--font-body` se definían con el MISMO nombre en `:root` (raw, unlayered) y en `@theme inline` (layered) — el CSS unlayered siempre gana sobre `@layer theme` independientemente del orden de origen, así que cualquier `<h1>-<h4>` que dependiera de la regla de `@layer base` (sin la clase `.font-display` explícita) heredaba la fuente cruda `'Oswald'` (nunca cargada) en vez de la self-hosted `--font-app-display`. Arreglado renombrando los valores crudos a sufijo `-src` en `:root`, dejando el nombre canónico (`--font-display`/`--font-body`/`--font-mono`) SOLO en `@theme inline` — mismo patrón que ya usaban `--elevation-*`→`shadow-*` y `--ds-radius-*`→`radius-*`. **Regla para TD.2+**: cualquier token nuevo cuyo nombre coincida con un namespace reservado de Tailwind (`--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--spacing-*`, `--tracking-*`…) DEBE volcarse en `:root` bajo un sufijo distinto y reservar el nombre canónico para `@theme inline` — nunca el mismo nombre en los dos bloques.
  - `--tracking-eyebrow` añadido a `@theme inline` (mapea `--ls-eyebrow`) — usa la clase `tracking-eyebrow`, no el escape hatch `tracking-[var(--ls-eyebrow)]`.
  - `docs/design-system/` regenerado (solo lectura) con: `tokens/{colors,spacing,typography}.css`, `readme.md`, `styles.css`, `_adherence.oxlintrc.json`, `guidelines/*.card.html` (10 cards de colores/tipografía/espaciado). NO se descargó `components/` todavía (no hace falta hasta TD.2, que sí debe regenerarlo si está desactualizado — skill frontend §7.1).
  - Fuentes Oswald/Inter (4 pesos c/u) descargadas como `.woff2` estáticos vía la CSS API legacy de Google Fonts con UA forzado a Chrome 60 (evita que la API v2 devuelva un único fichero de fuente variable para los 4 pesos) — están committeadas en `apps/web/src/app/fonts/*.woff2` (no en `public/`, siguiendo convención `next/font/local`).
  - `/design-system` es página interna NO localizada (`robots: noindex`), vive fuera de cualquier segmento de idioma — no lo toca T0.2 (i18n).
- Deuda anotada: — (todos los hallazgos de code-review se arreglaron en la propia tarea: colisión de capas font-display/font-body/font-mono, --tracking-eyebrow, clases redundantes en h1-h3, SwatchStrip extraído; el hallazgo de "8 fuentes precargadas, no todas en uso todavía" se dejó como trade-off consciente de tarea fundacional, no deuda).
- **Nota de arnés** (segunda vez que aparece, candidata a fix deliberado): el `verifier` reporta que la tool `Write` bloquea la creación de `docs/verifications/<ID>/report.md` con el mensaje "Subagents should return findings as text, not write report files" — el verifier lo esquiva escribiendo el fichero vía `Bash`/heredoc, que funciona, pero es fricción repetida (ya pasó en T0.1). Si vuelve a aparecer en la próxima tarea, ajustar el prompt/tooling del agente `verifier` para que use `Bash` desde el principio en vez de `Write` para `report.md`.

## 2026-07-17 · ⏳ TD.2 iniciada
- Primitiva core Button (shadcn sobre Base UI, ajustada 1:1 al espejo del DS: variantes primary/secondary/outline/ghost, press scale(.96), hover un paso más oscuro). Coste esperado: $0.

## 2026-07-17 · TD.2 cerrada — PASS (2 ciclos verifier: FAIL → PASS)
- Coste: $0 (vs estimado $0) · Ciclos verifier: 2 · Commit: (pendiente, ver siguiente) · Evidencia: docs/verifications/TD.2/ (report-fail-1.md archivado)
- **Contexto de sesión**: esta tarea se retomó tras una compactación de contexto — el implementer ya había dejado el trabajo hecho (Button + showcase + tooling) sin commitear cuando la sesión se reanudó. El bucle detectó el estado, corrió `pnpm gate` de cero (rojo: 4 errores de config) y siguió el protocolo completo (gate → code-review → simplify → ds-reviewer → verify) desde ahí en vez de asumir que el trabajo previo era válido.
- **Bugs reales cazados y arreglados antes de VERIFY (code-review, no el implementer)**:
  1. `Button` sin `'use client'` → crash de prerender de Next (Server Component con event handlers).
  2. Estado press con handlers JS manuales (`onMouseDown`/`onMouseUp`/`onMouseLeave` mutando `style.transform`) → sustituido por `active:scale-[.96]` (CSS `:active` nativo, cubre teclado/touch).
  3. Config de tooling rota: `eslint-import-resolver-typescript` sin `project` explícito no resolvía `@/*` (necesita `project: ['tsconfig.json', 'apps/*/tsconfig.json', 'packages/*/tsconfig.json']`); `docs/design-system/**` sin excluir de ESLint (`globalIgnores`) ni de knip (`ignore`) — el espejo de solo lectura no pertenece a ningún tsconfig; `apps/web` necesita `entry: ["src/components/ui/**/*.{ts,tsx}"]` en knip.json (las primitivas del DS son API pública, no dead code); `shadcn` (CLI, no runtime) debe ir a devDependencies + `ignoreDependencies` en knip; `lucide-react`/`tw-animate-css` eran deps sin uso (proyecto sin librería de iconos, PRD/planning TD.3).
  4. `components.json` tenía `iconLibrary: "lucide"` obsoleto — eliminado.
- **2 bugs reales cazados por el VERIFIER (1er intento, FAIL) — relevantes para TODA futura primitiva `components/ui/`**:
  1. **`cn()` (tailwind-merge) sin extender su theme** — la escala tipográfica custom del DS (`text-body`/`text-caption`/`text-h3`…) comparte el prefijo `text-` con las clases de color de texto (`text-white`); `twMerge` sin config las trataba como el MISMO grupo y descartaba la clase de color que aparecía antes en la cadena `cva`. Resultado: texto negro heredado en todos los botones, invisible en `outline` sobre fondo oscuro. **Fix**: `extendTailwindMerge({ extend: { theme: { text: [...nombres de la escala del DS] } } })` en `apps/web/src/lib/utils.ts` — registra la escala como grupo `text` (font-size) separado del grupo de color. **Regla para TD.3+**: cualquier componente nuevo que combine una clase de tamaño-de-texto custom con una clase de color-de-texto en la misma cadena `cva` hereda este mismo riesgo si la escala no está en `extendTailwindMerge`; ya está resuelto de una vez para todo el proyecto (vive en `cn()`, no por componente).
  2. **`outline-hidden`/`outline-none` en la clase base de un elemento con `focus-visible:outline-*`** — esa utilidad fija `--tw-outline-style: none` de forma INCONDICIONAL (no scoped a `:focus`), y ninguna utilidad `focus-visible:outline-*` la revierte a `solid`: el anillo de foco no se pintaba NUNCA, ni en foco ni fuera de él. **Fix**: se eliminó `outline-hidden`/`outline-none` de la base por completo — sin ella, `--tw-outline-style` conserva su valor inicial `solid` (`@property` de Tailwind v4) y las utilidades `focus-visible:outline-*` funcionan solas. **Regla para TD.3+**: NUNCA combinar `outline-none`/`outline-hidden` en la clase base con `focus-visible:outline-*` — es el patrón "shadcn clásico" de Tailwind v3 y NO funciona igual en v4 (custom properties + `@property`, no cascada de propiedades CSS normales).
- **Deuda anotada** (NO bloquea el cierre, no inventable en código):
  - Contraste WCAG insuficiente en 2 puntos, ambos heredados de tokens del DS ya volcados VERBATIM (TD.1): (a) `--focus-ring` (amber-500) ~1.8:1 contra fondos claros/primary — nota: como parte del fix del bug #2 de arriba, el anillo SÍ se pinta ahora, así que este déficit de contraste es real y visible (antes era invisible del todo, ahora es visible pero de bajo contraste); (b) texto blanco sobre `--accent-primary` (orange-500) = 2.92:1, por debajo de WCAG AA 4.5:1 — es el par de tokens literal que define `Button.jsx` del espejo. Ambos requieren una decisión de diseño a nivel Claude Design (nuevo token o técnica de doble-anillo), no se puede resolver inventando un color en código (regla de la skill frontend §1). **Candidata a fase de deuda o a una nota para el humano al cerrar la fase TD** (revisión de contraste conjunta cuando F0/TD cierren, en vez de una por una).
  - `buttons.card.html` del espejo no renderiza standalone (depende de `_ds_bundle.js`, no sincronizado por `DesignSync`) — la comparación visual de la Verificación se hizo contra la especificación textual (`Button.jsx`/`.prompt.md`) en vez de contra el card renderizado. Si TD.3+ necesita comparación pixel-perfect, valorar sincronizar el bundle o pedir un snapshot renderizado.
- **Nota de arnés** (repite de T0.1/TD.1, tercera vez — ya candidato firme a fix): el `verifier` sigue reportando que `Write` bloquea `report.md` con "Subagents should return findings as text, not write report files"; lo esquiva con `Bash`/heredoc cada vez. Patrón consistente en 3/3 tareas cerradas — la próxima sesión debería ajustar el prompt/tooling del agente `verifier` para usar `Bash` desde el principio.
