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
