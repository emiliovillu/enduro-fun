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
