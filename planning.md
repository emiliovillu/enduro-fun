# Planning — EnduroFun

> Plan de ejecución del `PRD.md` (v1, aprobado 2026-07-17). Fases → tareas → subtareas.
>
> **Filosofía baby steps**: cada tarea es autocontenida (se empieza y se termina en una sesión de trabajo), deja el sistema en un estado funcional (nunca a medias), y termina con una **verificación en el mundo real**: una acción concreta con un resultado observable que demuestra sin lugar a dudas que funciona — no "el código compila", sino "hago X y veo Y". Ninguna verificación depende de piezas que aún no se hayan construido en el momento de la tarea.
>
> Convenciones: `[ ]` pendiente · `[x]` hecha (marcar al completar, con fecha) · **Depende de** lista los IDs que deben estar hechos antes (el orden real lo dicta este grafo, no la numeración) · ⚠ marca prerequisitos externos que debe hacer el usuario · las referencias `§` apuntan al PRD; las `research/` a los informes. Los ítems `[verificar]` del PRD se cierran dentro de la tarea que integra ese componente.
>
> **Desviación de stack vigente para todo este planning** (PRD §1/§6.2, decisiones D1/D5): sin Postgres/Drizzle, sin `packages/db`, sin `apps/worker`, sin la skill `deploy` (VPS+Docker+Caddy) — este proyecto es una web estática (`output: 'export'`) desplegada en Cloudflare Pages. Ninguna tarea de este planning crea esas piezas.

## Estado global

| Fase | Nombre | Entrega observable al cerrar la fase | Estado |
|---|---|---|---|
| F0 | Fundaciones | Monorepo con export estático operativo, i18n estático (EN/ES/DE) funcionando, y pipeline de Cloudflare Pages desplegando en cada push a `main` | ☐ |
| TD | Design system | `/design-system` muestra tokens y componentes fieles a "EnduroFun Design System" (Claude Design), lint de adherencia activo y skill frontend actualizada — se ejecuta tras T0.1, antes de continuar F0 | ☐ |
| F1 | Contenido base | Home + About + Contact navegables en los 3 idiomas, formulario de contacto entregando a Formspree y mapa de Álora visible | ☐ |
| F2 | Paquetes y reviews | Packages + Reviews completas en los 3 idiomas; el escaparate de las 5 páginas está completo | ☐ |
| F3 | Pulido y SEO | `hreflang`/sitemap multilingüe correctos y Lighthouse móvil > 90 en todas las páginas | ☐ |

**Hitos de valor real**: tras F1 ya existe una web navegable en 3 idiomas con la propuesta de valor y una vía de contacto real; tras F2 el escaparate completo (paquetes + prueba social) está online; tras F3 queda lista para posicionar en buscadores.

---

## F0 — Fundaciones

El corazón de F0 aquí es distinto del template estándar: no hay base de datos ni servidor que levantar. Lo que debe quedar operativo al cerrar F0 es el **esqueleto estático + i18n + el pipeline de deploy**, sin ninguna página de contenido real todavía (eso es F1/F2).

#### T0.1 · Monorepo y esqueleto de proyecto (adaptado, sin DB/worker) [x] 2026-07-17 — PASS, ver docs/verifications/T0.1/
- **Depende de**: —
- **Entrega**: pnpm workspaces con `apps/web` (Next.js App Router + Tailwind v4 CSS-first, `output: 'export'` desde el día 1) y `packages/core` (contratos Zod para el contenido: paquete, review, datos de empresa — ver PRD §7). **Sin** `packages/db` ni `apps/worker` (PRD §6.2/§6.3: proyecto sin base de datos ni trabajo asíncrono). tsconfig/eslint/prettier compartidos; pino para logging de scripts de build/tooling (no hay servidor de producción que loguee requests). `pnpm gate` operativo (lint && typecheck && format:check && knip && readme:status:check && test). Página raíz mínima ("Hello EnduroFun").
  - **Desviación del T0.1 canónico**: sin `/api/health` — `output: 'export'` no soporta route handlers; la verificación de "vivo" se hace sirviendo el HTML estático generado, no con un healthcheck HTTP.
- **Subtareas**:
  - [x] Workspaces + tsconfig/eslint/prettier compartidos
  - [x] `apps/web` con Next.js App Router, Tailwind v4, `output: 'export'` configurado
  - [x] `packages/core` con esquemas Zod mínimos (placeholder de paquete/review/empresa)
  - [x] `pnpm gate` completo y verde
- **Verificación**: `pnpm build` genera `apps/web/out/index.html` sin errores; `pnpm gate` en verde; servir `out/` con un servidor estático local (`npx serve out` o equivalente) y comprobar en el navegador que la página raíz carga; romper a propósito un tipo de `packages/core` rompe la compilación de `apps/web` (control negativo).

#### T0.2 · i18n estático (EN/ES/DE) [x] 2026-07-18 — PASS, ver docs/verifications/T0.2/
- **Depende de**: T0.1; orden: TD.7 (por convención — ninguna tarea de F0 posterior a T0.1 se construye antes de que cierre la fase TD, aunque esta tarea en concreto no consuma componentes visuales)
- **Entrega**: rutas localizadas `/en/...`, `/es/...`, `/de/...` generadas vía `generateStaticParams` para las 3 páginas placeholder existentes; `/` (raíz) es un `index.html` estático con redirección fija a `/en/` (meta-refresh + enlace visible de fallback — sin JS de detección de idioma de navegador, consistente con PRD D11); ficheros `src/messages/{en,es,de}.json` con un esquema Zod en `packages/core` que exige las 3 claves para cada string (falta una traducción → falla el build). **`[verificar]` cerrado** (PRD §6.2/§12, línea 135): `next-intl` SÍ es compatible con `output: 'export'` (verificado contra su documentación oficial — rutas con prefijo, sin middleware), pero se optó por una solución custom mínima (diccionario tipado + Zod) por ser más proporcionada a 5 páginas/3 idiomas — ver PRD.md y `apps/web/src/i18n/messages.ts`.
- **Subtareas**:
  - [x] Elegir y configurar la librería de i18n (o solución custom mínima) compatible con export estático
  - [x] `generateStaticParams` para `/en`, `/es`, `/de` sobre las páginas placeholder de T0.1
  - [x] Redirección estática de `/` a `/en/`
  - [x] Esquema Zod de mensajes que exige las 3 claves
- **Playwright permanente**: `apps/web/e2e/i18n.spec.ts` — navegar a `/`, `/es/`, `/de/` y comprobar que cada una sirve el idioma correcto; quitar una clave de `de.json` a propósito rompe el build (control negativo, se prueba con un test que invoca `pnpm build` sobre un fixture, no en Playwright).
- **Verificación**: `pnpm build` genera `out/en/index.html`, `out/es/index.html`, `out/de/index.html`; abrir `/` en el navegador estático local redirige a `/en/`; editar un mensaje y comprobar que aparece traducido en los 3 idiomas tras rebuild. **Añadido por ajuste de alcance de TD.3** (ver journal 2026-07-17): con `LanguageSwitcher` ya construido (TD.3, vía TD.7), verificar aquí que clicar cada opción del switcher navega realmente a `/en`, `/es`, `/de` sobre una página con el componente montado.

#### T0.3 · Pipeline de deploy en Cloudflare Pages ⚠
- **Depende de**: T0.1
- **Entrega**: proyecto conectado en Cloudflare Pages al repo de GitHub (`emiliovillu/enduro-fun`), build command y output directory configurados para `output: 'export'`; documentación en `DEPLOY.md` (raíz) del procedimiento y de la configuración DNS de `endurofun.eu` (Hostinger → Cloudflare). Esta tarea sustituye a la skill `deploy` del arnés (no aplica — PRD §10).
- **Subtareas**:
  - [ ] ⚠ Cuenta de Cloudflare del usuario, conectada al repo de GitHub
  - [ ] Configurar build de Cloudflare Pages (comando, directorio de salida `apps/web/out`)
  - [ ] ⚠ DNS de `endurofun.eu` en Hostinger apuntando a Cloudflare (nameservers o CNAME)
  - [ ] `DEPLOY.md` con el procedimiento documentado
- **Verificación**: un push a `main` dispara un build en el dashboard de Cloudflare Pages que termina en éxito; la URL de preview/producción de Cloudflare sirve la página raíz de T0.1; si el dominio ya está propagado, `https://endurofun.eu` sirve la misma página con certificado TLS válido (si el DNS aún no ha propagado, se anota como pendiente y se re-verifica al cierre de F3).

#### T0.4 · E2E de fase F0
- **Depende de**: T0.2, T0.3, TD.7
- **Entrega**: ninguna — tarea de verificación pura.
- **Verificación**: recorrido completo — `pnpm build && pnpm gate` verde; las 3 rutas de idioma sirven contenido placeholder correcto; push a `main` dispara deploy en Cloudflare Pages con éxito; la URL pública (Cloudflare o dominio si ya propagado) es accesible desde fuera y sirve HTTPS válido. Sin regresión de T0.1-T0.3.

---

## TD — Design system (la piedra angular de toda UI)

Fuente de verdad: proyecto Claude Design **"EnduroFun Design System"** (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`). Inventario real: tokens (`tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`), componentes `Button` (buttons), `Badge` (feedback), `PackageCard`/`ReviewCard`/`SectionHeading` (cards), `Header`/`Footer`/`LanguageSwitcher` (navigation), `Icon`/`MapEmbed` (media). El DS es de un solo tema visual (sin light/dark toggle — no es ese tipo de producto): las tareas de tokens/showcase no incluyen switcher de tema, solo verificación fiel de la única identidad visual.

Gaps conocidos ya identificados: el DS **no define `Input`/`Textarea`** (el inventario se hizo antes de decidir Formspree como mecanismo de contacto) — se crean en TD.4 y se suben a Claude Design en esa misma tarea, ya que el formulario de `/contact` (F1) los necesita.

Se intercala tras T0.1 y antes de continuar F0 (T0.2 gana dependencia de orden sobre TD.7). Coste de la fase: $0.

#### TD.1 · Tokens del DS, fuentes y showcase `/design-system` [x] 2026-07-17 — PASS, ver docs/verifications/TD.1/
- **Depende de**: T0.1
- **Entrega**: espejo inicial regenerado en `docs/design-system/` (vía `DesignSync` sobre el proyecto `8ee30e13-2372-49e4-ba6f-2692bc1a6af5`); `globals.css` con los tokens de `tokens/*.css` volcados verbatim en los 3 bloques canónicos de Tailwind v4 (`:root`+overrides, `@theme inline {}`, `@layer base {}`); gotcha `--shadow-*` del DS resuelto renombrando a `--elevation-*` en `:root`/`@theme` si aplica. Fuentes Oswald (display) e Inter (body) self-hosted (0 requests a Google Fonts CDN — el DS actual las carga por `@import`, aquí se descargan los `.woff2` y se sirven localmente). Página `/design-system` con specimens de colores (brand/gradient/neutral/sand/semantic), tipografía (display/body/eyebrow) y espaciado/radios.
- **Verificación**: `/design-system` en navegador muestra los specimens; comparación visual contra las guidelines del espejo (`colors-*.card.html`, `type-*.card.html`, `spacing-*.card.html`) sin desviaciones perceptibles; cero requests de red a `fonts.googleapis.com` en el panel de red del navegador.

#### TD.2 · Primitiva core: Button [x] 2026-07-17 — PASS, ver docs/verifications/TD.2/
- **Depende de**: TD.1
- **Entrega**: `Button` en `apps/web/src/components/ui/` generado con shadcn sobre Base UI, ajustado 1:1 al espejo (`components/buttons/Button.jsx`/`.d.ts`/`.prompt.md`): mismas variantes (`primary`/`secondary`/`outline`/`ghost`), mismos tamaños, estado press con `scale(.96)` (PRD/DS: sin cambio de color en press), hover un paso más oscuro; sección nueva en `/design-system`.
- **Verificación**: comparación en navegador contra `buttons.card.html` del espejo: variantes y estados hover/focus/disabled/press fieles; operable por rol y accessible name.

#### TD.3 · Resto de primitivas del inventario (feedback, navegación, media) [x] 2026-07-18 — PASS, ver docs/verifications/TD.3/
- **Depende de**: TD.2
- **Entrega**: `Badge` (feedback), `Header`/`Footer`/`LanguageSwitcher` (navigation — nav de 5 enlaces, selector EN/ES/DE persistente vía la ruta actual, CTA de contacto siempre visible), `Icon` (glifos inline estilo Lucide sustituidos, sin librería de iconos) e `Icon`-dependiente `MapEmbed` (placeholder de iframe de Google Maps, ver TD nota abajo), mismo estándar que TD.2; secciones en `/design-system`.
- **Nota `MapEmbed`**: en TD se construye fiel al placeholder del DS; el iframe real de Google Maps (con API key, PRD §9.1) se conecta en la tarea de Contact (F1), no aquí.
- **Verificación**: comparación contra sus specimens del espejo en la única identidad visual del DS; `Header`/`Footer`/`LanguageSwitcher` operables por teclado; `LanguageSwitcher` renderiza los 3 idiomas (EN/ES/DE) con hrefs `/en`/`/es`/`/de` fieles al espejo. **Nota de alcance** (ajuste menor, ver journal 2026-07-17): el cambio REAL entre rutas `/en|es|de` no se puede verificar aquí — T0.2 (que las genera) está ordenado DESPUÉS de toda la fase TD (depende de TD.7 por convención), así que en TD.3 esas rutas todavía no existen. Esa verificación end-to-end se traslada a T0.2, que ya tendrá `LanguageSwitcher` disponible por construirse después de TD.7.

#### TD.4 · Gaps: Input/Textarea + subida a Claude Design [x] 2026-07-18 — PASS, ver docs/verifications/TD.4/
- **Depende de**: TD.3
- **Entrega**: `Input` y `Textarea` (no definidos por el DS original — necesarios para el formulario de contacto de F1), creados siguiendo las foundations del DS (hairlines `--border-subtle`, `--radius-lg`/`--radius-pill` según corresponda, focus ring único, sin gradientes); sección nueva en `/design-system`; **subida de ambos al proyecto "EnduroFun Design System"** vía `DesignSync` (`.jsx` + `.d.ts` + `.prompt.md` + card en `components/forms/`), regenerando el espejo después.
- **Verificación**: revisión en navegador de la sección nueva; `DesignSync list_files` sobre `8ee30e13-2372-49e4-ba6f-2692bc1a6af5` muestra `components/forms/Input.*` y `components/forms/Textarea.*`; el espejo regenerado en `docs/design-system/` los incluye.

#### TD.5 · Composites de producto: PackageCard, ReviewCard, SectionHeading [x] 2026-07-18 — PASS, ver docs/verifications/TD.5/
- **Depende de**: TD.3
- **Entrega**: `PackageCard`, `ReviewCard`, `SectionHeading` como presentacionales puros (props planas: nombre/noches/días/precio/features para `PackageCard`; nombre/país/rating/texto para `ReviewCard`; eyebrow/title/align/light para `SectionHeading` — prohibido importar tipos de `packages/core`), fieles a `components/cards/*` del espejo; secciones en `/design-system`.
- **Verificación**: comparación contra `cards.card.html` del espejo; `PackageCard` y `ReviewCard` renderizan correctamente con datos de ejemplo variados (con y sin `highlight`, rating 4 vs 5 estrellas).

#### TD.6 · Lint de adherencia al DS [x] 2026-07-18 — PASS, ver docs/verifications/TD.6/
- **Depende de**: TD.4, TD.5
- **Entrega**: reglas de lint (scope `apps/web`, dentro de `pnpm gate`) adaptando `_adherence.oxlintrc.json` del proyecto Claude Design al flat config del repo. Prohíben: paleta cruda de Tailwind, valores arbitrarios crudos en `className` fuera de `globals.css`, imports de `@radix-ui/*`/`lucide-react`/cualquier librería de iconos.
- **Verificación**: un fichero de prueba con una violación de cada tipo hace fallar `pnpm lint` nombrando la regla; al retirarlo, `pnpm gate` queda verde.

#### TD.7 · Cierre: skill frontend contra la realidad + OK humano [x] 2026-07-18 — PASS, ver docs/verifications/TD.7/
- **Depende de**: TD.4, TD.6
- **Entrega**: skill `frontend` actualizada contra el código real committeado: inventario definitivo de `components/ui/` (incluyendo `Input`/`Textarea` añadidos en TD.4) con variantes/props leídas de los `.tsx`, obligatoriedad explícita del uso de las primitivas del DS.
- **Verificación (E2E de fase)**: recorrido completo de `/design-system` con evidencia visual en `docs/verifications/TD.7/`; `pnpm gate` verde; **revisión humana final del showcase** (parada de fin de fase: el usuario da el OK visual).

**Añadidas tras el OK humano de TD.7** (ver journal 2026-07-18): dos correcciones dirigidas explícitamente por el usuario sobre el DS ya cerrado — deuda de contraste WCAG acumulada (TD.2/TD.3/TD.5) y rediseño del icono `bike`. Cambio de alcance menor, documentado en la misma sesión.

#### TD.8 · Corrección de contraste WCAG AA en tokens del DS [x] 2026-07-18 — PASS, ver docs/verifications/TD.8/
- **Depende de**: TD.7
- **Entrega**: en el proyecto Claude Design (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`), decisión de diseño y ajuste de los tokens con contraste insuficiente ya detectado: `--accent-primary` (naranja, texto blanco encima en `Button` variante `primary` y en la píldora activa de `LanguageSwitcher`, ratio medido 2.92:1) y `--amber-500` (estrellas de `ReviewCard` sobre blanco, ratio medido 2.03:1) — ambos por debajo del mínimo WCAG AA de 4.5:1 para texto normal. La corrección vive en Claude Design (oscurecer el token o introducir una variante explícita para uso con texto claro — decisión de diseño, no un valor inventado en código, `design-system.md §1`), se sube vía `DesignSync`, se regenera el espejo local (`docs/design-system/`) y se propaga a los consumidores reales en `apps/web` (`button.tsx`, `language-switcher.tsx`, `review-card.tsx` y cualquier otro uso de estos tokens con texto/icono claro encima).
- **Verificación**: contraste medido con `getComputedStyle` sobre las superficies REALES donde se usa (no una fixture aislada) — `Button` variante `primary`, píldora activa de `LanguageSwitcher`, rating de `ReviewCard` — los tres ≥4.5:1; captura visual del antes/después en `docs/verifications/TD.8/`; `pnpm gate` verde.

#### TD.9 · Rediseño del icono `bike` (moto de enduro) [x] 2026-07-18 — PASS, ver docs/verifications/TD.9/
- **Depende de**: TD.7
- **Entrega**: nuevo path SVG para `ICON_PATHS.bike` en `apps/web/src/components/ui/icon.tsx` representando una moto de enduro/motocross (dos ruedas con banda de rodadura marcada, suspensión, manillar alto, depósito/asiento) en vez del glifo actual, percibido por el usuario como un triciclo infantil; mismo `viewBox` 24×24 y convenciones del registro (stroke, no fill, consistente con el resto de `ICON_PATHS`); si el espejo de Claude Design referencia explícitamente este glifo (`components/media/Icon.jsx`), actualizarlo también vía `DesignSync` y regenerar el espejo.
- **Verificación**: captura del glifo nuevo en la sección Icon de `/design-system`, `pnpm gate` verde, y **revisión humana final** (el juicio de "ya no parece un triciclo" es del propio usuario, que fue quien lo señaló — parada de fin de tarea hasta su OK visual).

#### TD.10 · Icono `bike`: vástago entre el manillar y la pipa de dirección [x] 2026-07-18 — PASS, ver docs/verifications/TD.10/
- **Depende de**: TD.9
- **Entrega**: el manillar de `ICON_PATHS.bike` (`apps/web/src/components/ui/icon.tsx`, sub-path `'M14.5 12h3.5'`) queda pegado directamente a la pipa de dirección — el usuario, tras aprobar TD.9, pidió un vástago corto que separe visualmente el manillar del cuerpo (rasgo real de una moto de enduro: el manillar se eleva sobre un vástago, no nace pegado al chasis). Ajustar el path (y su equivalente en Claude Design `components/media/Icon.jsx` + espejo local) añadiendo ese vástago sin volver a la forma de la 1ª iteración descartada en TD.9 (vástago vertical largo que se leía como patinete/triciclo) — vástago corto, proporcionado al resto del glifo.
- **Verificación**: captura del glifo ajustado (zoom aislado + logo del Header a 26px, mismo patrón que TD.9), `pnpm gate` verde, revisión humana final del usuario.

---

## F1 — Contenido base

Home + About + Contact navegables en los 3 idiomas, con el formulario de contacto entregando de verdad a Formspree y el mapa de Álora visible.

#### T1.1 · Página Home [x] 2026-07-19 — PASS, ver docs/verifications/T1.1/
- **Depende de**: TD.7, T0.2
- **Entrega**: `/[en|es|de]` con hero a pantalla completa (foto/vídeo placeholder + scrim), badge de ubicación/idiomas, tagline + CTA ("View packages" / "Get in touch"), preview de 2-3 `PackageCard`, 2-3 `ReviewCard` destacadas, sección "Find us" con `MapEmbed` (placeholder — el iframe real llega en T1.3) — contenido en los 3 idiomas vía los mensajes de T0.2.
- **Mockup**: Claude Design "EnduroFun Pages" (`07ce2c66-a9a4-4636-ad05-ea1746fa94f9`), `variants/HomeVariantA.jsx` (Variante Cinemática, elegida — PRD §6.4).
- **Playwright permanente**: `apps/web/e2e/home.spec.ts` — hero visible, CTAs navegan a `/packages` y `/contact` respectivamente, preview de paquetes y reviews renderiza, `LanguageSwitcher` cambia de `/en/` a `/es/` y `/de/` conservando la página.
- **Verificación**: en navegador (sirviendo `out/` local), abrir `/en/`, `/es/`, `/de/` y comprobar que el hero, tagline, CTAs, paquetes y reviews de preview aparecen traducidos y correctos en los 3; clicar cada CTA navega a la ruta esperada.

#### T1.2 · Página About [x] 2026-07-19 — PASS, ver docs/verifications/T1.2/
- **Depende de**: TD.7, T1.1
- **Entrega**: `/[en|es|de]/about` con historia de la empresa/guías, diferenciadores (conocimiento local, terreno variado, oferta cultural) y niveles de experiencia aceptados (PRD §8). Layout acordado con el usuario al iniciar esta tarea (no existía mockup previo en Claude Design — regla 7 del planning: se acuerda antes de implementar).
- **Mockup**: `docs/mockups/about.html` (a crear y aprobar por el usuario al iniciar esta tarea, con los componentes del DS ya cerrado en TD).
- **Playwright permanente**: `apps/web/e2e/about.spec.ts` — la página carga en los 3 idiomas, el nav de `Header` marca "about" como activo.
- **Verificación**: en navegador, `/en/about`, `/es/about`, `/de/about` muestran el contenido completo y correcto en cada idioma; el header/footer son consistentes con Home.

#### T1.3 · Página Contact (Formspree + Google Maps real) ⚠
- **Depende de**: TD.7, T0.1
- **Entrega**: `/[en|es|de]/contact` con formulario (`Input` nombre/email + `Textarea` mensaje de TD.4) que hace POST directo al endpoint de Formspree; texto invitando a pedir presupuesto personalizado; `MapEmbed` con el iframe **real** de Google Maps Embed API (ubicación de Álora, Málaga) — cierra el `[verificar]` de coste/condiciones de la API (PRD §9.1). Cierra también el `[verificar]` de límite del plan gratuito de Formspree (PRD §9.2), documentado como comentario en el código y en el journal.
- **Subtareas**:
  - [ ] ⚠ Cuenta Formspree del usuario + ID de endpoint del formulario
  - [ ] ⚠ API key de Google Cloud con Maps Embed API habilitada, restringida por dominio `endurofun.eu`
  - [ ] Formulario con validación mínima (campos requeridos) usando `Input`/`Textarea` del DS
  - [ ] Iframe de Google Maps embebido con la key
- **Mockup**: `docs/mockups/contact.html` (a crear y aprobar por el usuario al iniciar esta tarea).
- **Playwright permanente**: `apps/web/e2e/contact.spec.ts` — el formulario se rellena y envía contra un **fixture/mock del endpoint de Formspree** (nunca el endpoint real en CI, regla 10); se comprueba el estado de éxito mostrado al usuario; el mapa embebido está presente en el DOM (sin verificar contenido del iframe de terceros).
- **Verificación**: en navegador, rellenar y enviar el formulario real una vez contra el endpoint real de Formspree → comprobar que el email llega a la bandeja configurada (evidencia: captura del email recibido); el mapa de Google muestra Álora, Málaga, visible e interactivo (zoom/paneo funcionan). Este envío real es manual/one-shot (no se repite en cada gate — el gate usa el fixture de Playwright).

#### T1.5 · Sección Galería (Home) — carrusel de fotos [x] 2026-07-19 — PASS, ver docs/verifications/T1.5/
- **Depende de**: T1.1
- **Añadida 2026-07-19** (petición directa del usuario mientras se reúnen los prerequisitos ⚠ de T1.3/T0.3, scope-change menor documentado en el journal): nueva sección de Home, carrusel deslizante ("aesthetic") de fotos placeholder (mismo criterio tokenizado que el hero/About — sin fotos reales todavía), ancho completo igual al contenedor de la sección Reviews (`max-w-[var(--container-max)]`). Posición acordada con el usuario: justo después de la preview de Packages, antes de Reviews.
- **Entrega**: nueva sección en `apps/web/src/app/[locale]/page.tsx` entre Packages y Reviews — carrusel horizontal (scroll-snap o equivalente, sin librería externa — mismo criterio "sin dependencias nuevas si no hace falta" que el resto del proyecto) con varias tarjetas de foto placeholder tokenizadas; controles operables por teclado/táctil.
- **Mockup**: `docs/mockups/home-gallery.html` (a crear y aprobar por el usuario al iniciar esta tarea — sin mockup previo en Claude Design, regla 7 del planning).
- **Playwright permanente**: añadir a `apps/web/e2e/home.spec.ts` — la sección de galería es visible en `/en/`, contiene más de una tarjeta, es navegable (siguiente/anterior o scroll) sin JS roto.
- **Verificación**: en navegador, `/en/`, `/es/`, `/de/` muestran la sección con el mismo ancho que Reviews, el carrusel se desplaza (rueda/gesto/controles) sin salirse del contenedor, y funciona con teclado (foco visible, `Tab`/flechas si aplica).

#### T1.4 · E2E de fase F1
- **Depende de**: T1.1, T1.2, T1.3, T1.5
- **Entrega**: ninguna — tarea de verificación pura.
- **Verificación**: recorrido completo del caso de uso 2 y 3 del PRD (§4) — desde `/en/` navegar a About y a Contact, cambiar idioma en cada paso y comprobar que persiste la navegación, enviar el formulario de contacto (fixture) y ver el estado de éxito, comprobar el mapa visible. Cita criterios de éxito §14.2 (3 idiomas completos en Home/About/Contact), §14.3 (formulario funcional), §14.4 (mapa visible e interactivo), §14.7 (responsive). Sin regresión de TD.7/F0.

---

## F2 — Paquetes y reviews

Packages + Reviews completas en los 3 idiomas; el escaparate de las 5 páginas queda completo.

#### T2.1 · Página Packages [x] 2026-07-19 — PASS, ver docs/verifications/T2.1/
- **Depende de**: TD.7, T1.1
- **Entrega**: `/[en|es|de]/packages` con las cards completas de los 2 paquetes (Getaway: 4 noches/3 días, desde 1.290 €; Full Adventure: 6 noches/4 días, desde 1.690 €, "Most popular") vía `packages.ts` tipado con Zod (PRD §7), features completas, nota de Adventure Bike disponible y de oferta personalizada.
- **Mockup**: `docs/mockups/packages.html` (a crear y aprobar por el usuario al iniciar esta tarea; reutiliza la sección de paquetes ya vista en `HomeVariantA.jsx` como referencia de estilo de card).
- **Playwright permanente**: `apps/web/e2e/packages.spec.ts` — las 2 cards renderizan con su precio y features en los 3 idiomas; el badge "Most popular" aparece en el paquete correcto.
- **Verificación**: en navegador, `/en/packages`, `/es/packages`, `/de/packages` muestran ambos paquetes completos y correctos; añadir un paquete de prueba a `packages.ts` sin traducción alemana rompe el build (control negativo del esquema Zod de §7).

#### T2.2 · Página Reviews [x] 2026-07-19 — PASS, ver docs/verifications/T2.2/
- **Depende de**: TD.7, T1.1
- **Entrega**: `/[en|es|de]/reviews` con 4-6 testimonios (datos inventados en v1 — PRD D4) vía `reviews.ts` tipado con Zod, en grid completo usando `ReviewCard`.
- **Mockup**: `docs/mockups/reviews.html` (a crear y aprobar por el usuario al iniciar esta tarea).
- **Playwright permanente**: `apps/web/e2e/reviews.spec.ts` — el grid renderiza todas las reviews del data file con su rating correcto (★/☆) en los 3 idiomas.
- **Verificación**: en navegador, las 3 versiones de idioma muestran el mismo conjunto de reviews traducido; el diseño es coherente con `ReviewCard` de TD.5.

#### T2.3 · E2E de fase F2
- **Depende de**: T2.1, T2.2, T1.3 — **añadida T1.3** (ver journal 2026-07-19): la propia Verificación exige el recorrido de las 5 páginas, incluida Contact, así que el grafo original (que no la listaba) era inconsistente con su propio texto. Cambio menor, documentado en la misma sesión.
- **Entrega**: ninguna — tarea de verificación pura.
- **Verificación**: recorrido completo de las 5 páginas (Home, About, Contact, Packages, Reviews) en los 3 idiomas sin roturas de navegación ni de `LanguageSwitcher`; cita criterio §14.5 (reviews con diseño coherente y datos creíbles) y confirma que el resto de criterios de contenido (§14.2) siguen cumpliéndose con las 5 páginas completas. Sin regresión de F1.

---

## F3 — Pulido y SEO

`hreflang`/sitemap multilingüe correctos y Lighthouse móvil > 90 en todas las páginas.

#### T3.1 · Optimización de imágenes y vídeo
- **Depende de**: T2.3
- **Entrega**: assets de imagen/vídeo del hero y demás secciones optimizados a mano para export estático (formatos modernos, tamaños responsive, lazy loading en todo lo que no sea el hero above-the-fold — PRD §8).
- **Verificación**: Lighthouse móvil sobre `/en/` (servido en local con `out/`) reporta 0 issues de "oversized images" / "properly size images"; el vídeo/imagen del hero carga con prioridad y el resto con lazy loading (comprobado en el panel de red: requests de imágenes fuera de viewport se disparan al hacer scroll, no al cargar).

#### T3.2 · Meta tags, `hreflang` y sitemap multilingüe
- **Depende de**: T2.3
- **Entrega**: meta descriptions por página e idioma, tags `hreflang` cruzados entre `/en`, `/es`, `/de` en las 5 páginas, `sitemap.xml` generado en build listando las 15 URLs (5 páginas × 3 idiomas) + `/` (redirección).
- **Verificación**: `curl` sobre el HTML estático de una página muestra los 3 `<link rel="alternate" hreflang="...">` apuntando a las URLs correctas de las otras 2 versiones; `out/sitemap.xml` lista las 15 URLs; un validador de sitemap (script o herramienta online) no reporta errores.

#### T3.3 · Performance final
- **Depende de**: T3.1
- **Entrega**: ajustes finales de performance (fuentes, JS crítico, CSS) para llevar el score de Lighthouse móvil por encima de 90 en las 5 páginas.
- **Verificación**: Lighthouse móvil (servido local, throttling por defecto) reporta Performance > 90 en Home, About, Contact, Packages y Reviews — cita criterio §14.1.

#### T3.4 · E2E de fase F3 (cierre de producto v1)
- **Depende de**: T3.2, T3.3, T0.3
- **Entrega**: ninguna — tarea de verificación pura.
- **Verificación**: recorrido completo de los 10 criterios de éxito del PRD (§14) contra el sitio desplegado en Cloudflare Pages (dominio propagado si ya disponible, si no la URL de Cloudflare): carga < 2s, 3 idiomas completos en las 5 páginas, formulario real entrega vía Formspree, mapa visible, reviews coherentes, `LanguageSwitcher` sin recarga perceptible, responsive en los 3 breakpoints, deploy automático confirmado con un push de prueba, `hreflang`/sitemap correctos, enlace de Instagram correcto. Evidencia en `docs/verifications/T3.4/`.

---

## Reglas de trabajo

1. **Orden**: el grafo `Depende de` manda (la numeración es orientativa); entre fases se puede adelantar trabajo que no dependa de lo pendiente, pero una fase solo se cierra cuando su E2E final pasa.
2. **Definición de hecho**: subtareas completas + verificación ejecutada y anotada (fecha + resultado + coste real si aplica) + sin regresión del E2E de la fase anterior.
3. **Deudas `[verificar]`**: cada una se cierra en la tarea que la nombra y el resultado se anota también en el PRD para mantenerlo veraz.
4. **Los E2E de fase son sagrados**: T0.4, TD.7, T1.4, T2.3 y T3.4 y los criterios de éxito del PRD son la vara de "funciona en el mundo real"; no se marcan por aproximación.
5. **Costes**: ninguna tarea de este proyecto llama a APIs de pago por uso (Formspree y Google Maps Embed son gratuitos en su uso previsto) — si alguna tarea revela un coste no anticipado, se anota igualmente en el report y se recalibra esta regla.
6. **Cambios de alcance**: si una tarea revela que el PRD necesita ajuste, se edita el PRD en la misma sesión y se anota en ambos documentos (planning y journal). PRD y planning nunca se cuentan historias distintas.
7. **Mockups de página**: cada página con pantalla propia tiene un mockup aprobado por el usuario en `docs/mockups/` (catálogo en `docs/mockups/README.md`), construido con los tokens del design system. La tarea que la desarrolla lo referencia con `- **Mockup**: docs/mockups/<x>.html` y su desarrollo **parte de ese mockup** (con los componentes `components/ui/` del DS, no reinventado). Una página que se desvíe del mockup sin acuerdo explícito es un error de review. Páginas nuevas sin mockup (About, Contact, Packages, Reviews): se acuerda el layout con el usuario antes de implementarlas.
8. **Las cláusulas deterministas de una Verificación se quedan como tests**: todo check automatizable y gratuito de un DoD (asserts sobre ficheros, validadores de schema/seeds, linters, golden files) se codifica como test permanente dentro de `pnpm gate` en la misma tarea — así el "sin regresión" de la regla 2 es ejecutable y gratis para siempre. Las cláusulas con envío real a Formspree o juicio humano quedan one-shot con su evidencia en `docs/verifications/`.
9. **Coste estimado por tarea**: no aplica a este proyecto — ninguna tarea consume APIs de pago por uso (regla 5).
10. **Playwright permanente por tarea web**: toda tarea cuya Entrega añada o modifique comportamiento operable en navegador declara una línea `- **Playwright permanente**` con el fichero exacto y los comportamientos protegidos. El spec se crea o actualiza en esa misma tarea, usa providers fake/fixtures para ser determinista y gratuito (p. ej. el envío a Formspree se prueba contra un mock, nunca el endpoint real), y queda en `pnpm test:e2e`. Los E2E de fase viven además en `apps/web/e2e/phases/` con tags `@fN @phase`.
