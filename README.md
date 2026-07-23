# EnduroFun

Web de marketing multilingüe (EN/ES/DE) para **EnduroFun**, empresa de rutas
guiadas de enduro en la provincia de Málaga (base en Álora). Presenta los
paquetes de viaje (multi-día, moto + alojamiento incluidos), reviews, forma de
contacto y la ubicación de la base — ver [`PRD.md`](PRD.md) para el producto
completo y [`planning.md`](planning.md) para el plan de ejecución tarea a tarea.

## Stack

- Next.js App Router con **exportación estática** (`output: 'export'`) + Tailwind v4 CSS-first
- pnpm workspaces: `apps/web` + `packages/core` (contratos Zod para el contenido)
- **Sin base de datos**: contenido versionado en ficheros TS, i18n estático (EN/ES/DE)
- Vitest + Playwright
- Contacto vía [Formspree](https://formspree.io/); ubicación vía Google Maps Embed API
- Desplegado en **Cloudflare Pages** (build automático en cada push a `main`)

> Este proyecto se desarrolla con un bucle autónomo de agentes de Claude Code
> (skill `dev-loop`) sobre el arnés del template `web-template`. Ver
> [`CLAUDE.md`](CLAUDE.md) para el detalle del proceso, los documentos fuente y
> las reglas de trabajo.

## Desarrollo

```bash
pnpm install
pnpm dev       # apps/web en localhost:3000
pnpm gate      # lint + typecheck + format:check + knip + readme:status:check + test
```

(Disponible desde que se cierre `T0.1` en `planning.md` — ver estado abajo.)

## Qué contiene

```
.claude/
  skills/
    dev-loop/        # el protocolo del bucle (selección, implementer/verifier, gates, cierre)
    dev-help/        # onboarding y soporte sobre el arnés mismo
    bootstrap/       # entrevista inicial → PRD + planning + placeholders
    testing/         # CÓMO se testea: tiers unit/integration/e2e/live, anti-flaky, CUA del verifier
    backend/         # CÓMO se construye el backend: API, arquitectura, DB, jobs*, observabilidad, tooling (§8 = stack y scripts canónicos)
    frontend/        # CÓMO se construye el frontend: arquitectura, componentes, design system (espejo DesignSync), forms, estado/SSE*
    …                # skills externas de terceros (pnpm, zod, next, react…) — NO `deploy` ni `postgres-drizzle`, no aplican a este proyecto
  agents/            # implementer, verifier, ds-reviewer
  hooks/guard-planning.sh   # bloquea marcar [x] sin report.md con PASS
scripts/
  readme-status.mjs  # regenera la tabla de estado de este README desde planning.md (el gate la verifica)
docs/
  design-system/     # espejo de solo-lectura de Claude Design (tool DesignSync)
  mockups/           # mockups aprobados de cada página, base del desarrollo
  verifications/     # evidencia por tarea
  dev-loop/          # journal del bucle
CLAUDE.md / AGENTS.md   # el contrato del arnés (mapa de documentos, reglas de oro, paradas)
lefthook.yml         # pre-commit (eslint+prettier sobre staged), pre-push (typecheck)
```

**Stack de este proyecto** (ver PRD §1/§6 para la justificación de la
desviación respecto al stack de fábrica del template): pnpm workspaces +
TypeScript, `apps/web` (Next.js App Router + Tailwind v4, exportación
estática), `packages/core` (contratos Zod para el contenido) — **sin**
`packages/db`, **sin** `apps/worker`. Vitest + Playwright, Base UI/shadcn,
pino. El gate local es `pnpm gate` = lint + typecheck + format:check + knip +
readme:status:check + test.

## Estado del desarrollo

La tabla de abajo la genera `pnpm readme:status` desde `planning.md`. **No
borres los marcadores**: el gate (`readme:status:check`) falla sin ellos.

<!-- STATUS-TABLE:BEGIN — generado por `pnpm readme:status`, no editar a mano -->

**22 de 29 tareas cerradas (76 %).**

| Fase                        | Qué entrega                                                                                                                                                                                            | Estado         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **F0** · Fundaciones        | Monorepo con export estático operativo, i18n estático (EN/ES/DE) funcionando, y pipeline de Cloudflare Pages desplegando en cada push a `main`                                                         | ✅ Completa    |
| **TD** · Design system      | `/design-system` muestra tokens y componentes fieles a "EnduroFun Design System" (Claude Design), lint de adherencia activo y skill frontend actualizada — se ejecuta tras T0.1, antes de continuar F0 | ✅ Completa    |
| **F1** · Contenido base     | Home + About + Contact navegables en los 3 idiomas, formulario de contacto entregando a Formspree y mapa de Álora visible                                                                              | 🔨 3/5         |
| **F2** · Paquetes y reviews | Packages + Reviews completas en los 3 idiomas; el escaparate de las 5 páginas está completo                                                                                                            | 🔨 2/3         |
| **F3** · Pulido y SEO       | `hreflang`/sitemap multilingüe correctos y Lighthouse móvil > 90 en todas las páginas                                                                                                                  | ⬜ No empezada |

<!-- STATUS-TABLE:END -->

## Licencia

[AGPL-3.0](LICENSE)
