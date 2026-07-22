# PRD — EnduroFun

> **Página web multilingüe para una empresa de rutas guiadas de enduro en Málaga, orientada a turistas extranjeros.**
> EnduroFun organiza rutas guiadas de enduro en la provincia de Málaga (base en Álora). La web presenta los paquetes (multi-día con alojamiento y moto incluida), permite contacto por formulario, muestra la ubicación en Google Maps y ofrece contenido en inglés, castellano y alemán desde el primer día.
>
> **Versión:** 1.0 · **Fecha:** 2026-07-17 · **Aprobado:** 2026-07-17 · **Autor:** Emilio Villuendas + Claude
> **Documentos fuente:** borrador previo del usuario (2026-07-16, no versionado en el repo) + `EnduroFun Design System` y `EnduroFun Pages` (proyectos de Claude Design, ver §6.4)

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Contexto y oportunidad](#2-contexto-y-oportunidad)
3. [Objetivos y no-objetivos](#3-objetivos-y-no-objetivos)
4. [Usuario y casos de uso](#4-usuario-y-casos-de-uso)
5. [Decisiones de producto ya tomadas](#5-decisiones-de-producto-ya-tomadas)
6. [Arquitectura general](#6-arquitectura-general)
7. [Contenido multilingüe y estructura de datos](#7-contenido-multilingüe-y-estructura-de-datos)
8. [Cliente: UX y rutas](#8-cliente-ux-y-rutas)
9. [Integraciones externas](#9-integraciones-externas)
10. [Despliegue y operación](#10-despliegue-y-operación)
11. [Observabilidad y seguridad](#11-observabilidad-y-seguridad)
12. [Riesgos y mitigaciones](#12-riesgos-y-mitigaciones)
13. [Roadmap de fases](#13-roadmap-de-fases)
14. [Criterios de éxito](#14-criterios-de-éxito)

---

## 1. Resumen ejecutivo

EnduroFun es una página web principalmente estática que actúa como escaparate digital para una empresa de rutas guiadas de enduro en la provincia de Málaga. El objetivo es dar visibilidad al negocio entre turistas extranjeros (principalmente alemanes e ingleses) que buscan experiencias de aventura en moto en el sur de España, y convertir esa visibilidad en un contacto por formulario.

La web ofrece: información sobre los paquetes disponibles (rutas multi-día con alojamiento y moto), una sección de contacto, información sobre la empresa ("About"), ubicación vía Google Maps, y una sección de reviews (con datos inventados en v1 — el cliente aportará reviews reales más adelante).

**Tesis del producto:**
1. Los turistas de enduro buscan online en su idioma nativo — una web trilingüe (EN/ES/DE) captura demanda donde muchos competidores solo ofrecen uno o dos idiomas. `[verificar: volumen de búsqueda real por idioma]`
2. El mercado de enduro tours en Andalucía está fragmentado y muchos competidores tienen webs anticuadas o sin soporte multilingüe completo — una presencia moderna y rápida genera confianza inmediata. `[verificar: nombres y precios de competidores directos]`
3. La combinación enduro + oferta cultural (Caminito del Rey, casco antiguo de Málaga) es un diferenciador que pocos explotan.

**Stack:** monorepo pnpm (TS) · Next.js App Router con **exportación estática** (`output: 'export'`) · Tailwind v4 CSS-first · `packages/core` (contratos Zod para el contenido) · i18n estático (EN/ES/DE) · sin base de datos, sin servidor propio · Vitest + Playwright · desplegado en **Cloudflare Pages**.

> **Desviación deliberada del stack "de fábrica" del template**: este proyecto NO usa Postgres/Drizzle (`packages/db`), ni `apps/worker`, ni la skill `deploy` (pensada para VPS + Docker + Caddy) — no hay backend dinámico que operar. Motivo: es una web de marketing 100% estática sin datos de usuario ni lógica de servidor. Ver §6.3 y §10.

## 2. Contexto y oportunidad

### 2.1 Estado del mercado

El enduro tourism en Andalucía es un nicho creciente, impulsado por el clima favorable (>300 días de sol/año), terreno variado y proximidad a aeropuertos internacionales (Málaga-Costa del Sol). Existen competidores establecidos en la zona `[verificar: nombres y precios exactos]`, pero muchos operan con webs básicas o sin soporte multilingüe completo.

### 2.2 Por qué EnduroFun, por qué ahora

- Demanda de turistas alemanes e ingleses que buscan "enduro tour spain" / "enduro reise andalusien" `[verificar: volumen de búsqueda]`.
- Base en Álora: acceso privilegiado a terreno de enduro variado, con proximidad a Málaga capital y sus atracciones turísticas.
- Paquetes diferenciados que incluyen experiencia cultural (no solo moto).

## 3. Objetivos y no-objetivos

### 3.1 Objetivos

- **O1** — Presentar la oferta de EnduroFun de forma clara y atractiva en tres idiomas (EN/ES/DE).
- **O2** — Permitir a visitantes contactar a la empresa vía un formulario que llega por email, de forma directa y sin fricción.
- **O3** — Mostrar la ubicación física en un mapa interactivo (Google Maps).
- **O4** — Transmitir confianza mediante una sección de reviews (datos de ejemplo en v1, reemplazables por reviews reales más adelante).
- **O5** — Posicionar la web en buscadores para keywords relevantes en los tres idiomas.

### 3.2 No-objetivos

- Reservas/pagos online (v1 es solo escaparate + contacto).
- Sistema de gestión de contenidos (CMS) — el contenido se edita en código.
- App móvil nativa.
- Integración real con Google Reviews / Google Business Profile API (futuro post-v1; v1 usa datos inventados).
- Blog o sección de noticias.
- Chat en vivo o chatbot.
- Sistema de usuarios/login — no hay cuentas de ningún tipo.
- Base de datos o backend dinámico propio — todo el contenido es estático o vive en un servicio de terceros (Formspree).

## 4. Usuario y casos de uso

**Usuario principal:** turista extranjero (25-55 años, mayoritariamente alemán o inglés) que busca una experiencia de enduro guiada en el sur de España. Nivel de experiencia en moto variable. Busca en Google en su idioma nativo.

**Casos de uso:**
1. **Descubrimiento**: el turista busca "enduro tour spain" en Google → llega a la home → ve fotos/vídeo de rutas → entiende la propuesta de valor en su idioma.
2. **Evaluación de paquetes**: navega a `/packages` → compara opciones (duración, precio, qué incluye) → decide cuál le interesa.
3. **Contacto**: va a `/contact` → rellena el formulario solicitando información o una oferta personalizada → EnduroFun recibe el email vía Formspree.
4. **Validación social**: lee las reviews en `/reviews` (o el resumen en home) → gana confianza en la empresa.
5. **Localización**: consulta el mapa embebido para saber dónde está la base → planifica su llegada (20 min desde el aeropuerto de Málaga).

## 5. Decisiones de producto ya tomadas

| # | Decisión | Detalle |
|---|---|---|
| D1 | Página principalmente estática | Sin backend dinámico, sin base de datos, en ninguna fase de v1 |
| D2 | Tres idiomas desde el día 1 | Inglés (default/fuente), castellano y alemán — igual de "primera clase" los tres |
| D3 | Contacto vía formulario Formspree | Formulario en `/contact` que envía a Formspree (`formspree.io`), que reenvía por email a la empresa. Sin backend propio, sin CRM. ⚠ requiere cuenta Formspree + endpoint del formulario (prerequisito externo del usuario) |
| D4 | Reviews con datos inventados en v1 | Textos de ejemplo creíbles; el cliente aportará reviews reales para sustituirlos más adelante (no hay integración con Google Places/Reviews API) |
| D5 | Deploy en Cloudflare Pages | Dominio `endurofun.eu` registrado en Hostinger; DNS apunta a Cloudflare. La skill `deploy` del arnés (VPS+Docker+Caddy) **no se usa** en este proyecto |
| D6 | Vídeos/fotos como contenido principal del hero | Placeholders en v1, preparados para contenido real del cliente |
| D7 | Solo Instagram como red social | `@endurofun_oficial` enlazado en el footer |
| D8 | Google Maps embebido | Iframe del endpoint público de Google (sin API key, sin cuenta de Google Cloud) para mostrar la ubicación de Álora, Málaga — decisión actualizada en T1.3 (ver §9.1), ya no requiere prerequisito externo |
| D9 | Licencia AGPL-3.0, repo público | github.com/emiliovillu/enduro-fun |
| D10 | Paquetes con precios orientativos | Los precios mostrados son de partida; el texto invita a pedir una oferta personalizada |
| D11 | Sin auto-detección de idioma por navegador | La exportación estática no ejecuta middleware; `/` sirve inglés por defecto y el visitante cambia de idioma manualmente con el selector (siempre visible) |
| D12 | 6 páginas | Home, Gallery, Packages, About, Contact, Reviews — cada una con su propia ruta localizada. Gallery se añadió tras el lanzamiento inicial, hotfix a petición directa del usuario (ver journal) |

## 6. Arquitectura general

### 6.1 Diagrama

```
┌───────────────────────────────────────────────┐
│                Cloudflare Pages                │
│  ┌───────────────────────────────────────────┐│
│  │      Next.js App Router (static export)   ││
│  │                                            ││
│  │  /[locale]/            → Home              ││
│  │  /[locale]/gallery     → Galería            ││
│  │  /[locale]/packages    → Paquetes           ││
│  │  /[locale]/about       → Sobre nosotros     ││
│  │  /[locale]/contact     → Contacto           ││
│  │  /[locale]/reviews     → Reviews            ││
│  └───────────────────────────────────────────┘│
│                      ↕                          │
│   Google Maps Embed (iframe)                    │
│   Formulario → Formspree (POST directo cliente) │
│   Instagram link (footer)                       │
└───────────────────────────────────────────────┘
              ↑
   DNS: endurofun.eu (Hostinger → Cloudflare)
```

### 6.2 Stack y justificación

- **Next.js App Router, exportación estática** (`output: 'export'`): genera HTML estático servible desde Cloudflare Pages; SEO fuerte out-of-the-box; sin runtime de servidor que operar.
- **Tailwind v4 CSS-first**: tokens del design system volcados verbatim (fase TD), sin runtime extra.
- **i18n estático**: rutas localizadas `/en/`, `/es/`, `/de/` generadas vía `generateStaticParams`; sin middleware (incompatible con export estático) — el selector de idioma navega entre rutas ya generadas. **`[verificar]` cerrado en T0.2**: se investigó `next-intl` (última versión, docs oficiales) — SÍ es compatible con `output: 'export'` vía enrutamiento con prefijo obligatorio y sin proxy/middleware (`localePrefix: 'always'`, `localeDetection: false`, sin `pathnames`), pero para el tamaño de este proyecto (5 páginas, 3 idiomas) se optó por una **solución custom mínima**: diccionario tipado (`apps/web/src/messages/{en,es,de}.json`) validado contra `MessagesSchema` (Zod, `packages/core/src/contracts/messages.ts`) a nivel de módulo — falta una clave en cualquier idioma rompe `next build`. Compatibilidad con Next.js 16.2.10 (versión del monorepo) verificada: `pnpm --filter @app/web build` genera `out/en/index.html`, `out/es/index.html`, `out/de/index.html` sin middleware ni server runtime.
- **`packages/core`**: esquemas Zod para el contenido versionado (paquete, review, datos de empresa) — valida en build time que los ficheros de contenido tienen la forma correcta en los 3 idiomas; no hay lógica de dominio más allá de esto.
- **Sin Postgres/Drizzle/`packages/db`**: no hay modelo de datos persistente — ver §7.
- **Sin `apps/worker`**: no hay trabajo asíncrono.
- **Formspree**: gestiona la recepción y reenvío por email del formulario de contacto sin backend propio.

### 6.3 Patrones obligatorios

- Static Site Generation (SSG) para todas las páginas y los 3 idiomas — nada se renderiza en request time.
- Contenido de paquetes/reviews/empresa en ficheros TS versionados en el repo (no editable en producción — es una decisión de producto, D1).
- Imágenes/vídeo optimizados a mano para export estático (el loader por defecto de `next/image` no sirve en `output: 'export'`; se usa un loader estático o assets pre-optimizados).

### 6.4 Fuentes de diseño

- Design system: proyecto Claude Design **"EnduroFun Design System"** (`8ee30e13-2372-49e4-ba6f-2692bc1a6af5`) — tokens, componentes (`Button`, `Badge`, `PackageCard`, `ReviewCard`, `SectionHeading`, `Header`, `Footer`, `LanguageSwitcher`, `Icon`, `MapEmbed`, `Lightbox`), guidelines de marca. `Lightbox` (overlay a pantalla completa para ver una imagen ampliada) se añadió tras el lanzamiento inicial, hotfix a petición directa del usuario sobre la Gallery (TD.11, ver journal) — mismo patrón que Gallery en D12.
- Mockups: proyecto Claude Design **"EnduroFun Pages"** (`07ce2c66-a9a4-4636-ad05-ea1746fa94f9`) — dos variantes de Home fueron evaluadas (A "Cinemática": hero foto/vídeo a pantalla completa, header transparente; B "Editorial": hero partido, header sólido). **Elegida: Variante A (Cinemática)** — la tarea de Home parte de `HomeVariantA.jsx` de ese proyecto.

## 7. Contenido multilingüe y estructura de datos

No hay base de datos. Todo el contenido vive en ficheros versionados en el repo, tipados y validados con Zod desde `packages/core`:

```
src/data/packages.ts    → array de paquetes (id, noches, días, precio, features) × 3 idiomas
src/data/reviews.ts     → array de reviews (nombre, país, rating, texto) — datos inventados en v1
src/data/company.ts     → datos de la empresa (email, ubicación, coordenadas del mapa, redes)
src/messages/en.json    → traducciones UI inglés (idioma fuente)
src/messages/es.json    → traducciones UI castellano
src/messages/de.json    → traducciones UI alemán
```

Invariantes:
- Todo contenido nuevo (paquete, review) se añade en los 3 idiomas a la vez — un esquema Zod que exija las 3 claves rompe el build si falta una traducción.
- El inglés es el idioma fuente: los textos se escriben cortos y concretos para traducir limpio (se evitan modismos/juegos de palabras en el copy fuente).

## 8. Cliente: UX y rutas

| Ruta | Página | Contenido |
|---|---|---|
| `/[locale]` | Home | Hero (foto/vídeo), tagline, CTA a paquetes/contacto, preview de 2-3 paquetes, 2-3 reviews destacadas, mapa de ubicación |
| `/[locale]/gallery` | Galería | Grid de 5 columnas con scroll infinito de fotos del terreno (placeholder hasta que haya fotos reales) — hotfix, no prevista en el diseño original, añadida a petición directa del usuario (ver journal) |
| `/[locale]/packages` | Paquetes | Todas las cards de paquetes con precio y detalle completo; nota de oferta personalizada |
| `/[locale]/about` | Sobre nosotros | Historia de la empresa/guías, qué la hace especial (conocimiento local, terreno variado, oferta cultural), niveles de experiencia aceptados |
| `/[locale]/contact` | Contacto | Formulario (nombre, email, mensaje) → Formspree; texto invitando a pedir presupuesto personalizado; mapa embebido |
| `/[locale]/reviews` | Reviews | 4-6 testimonios (datos inventados en v1) |

Presentes en **todas** las páginas: header (logo, nav de 6 enlaces, selector de idioma, CTA de contacto) y footer (logo/nombre, nav, Instagram, mapa mini o link, selector de idioma).

**Requisitos UX no negociables:**
- Mobile-first — la mayoría de turistas buscan desde el móvil.
- Tiempo de carga < 2s (estático servido desde CDN de Cloudflare).
- Selector de idioma siempre visible en el header.
- CTA de contacto visible en todas las páginas.
- Vídeos con lazy loading.
- Cada página tiene su mockup aprobado en `docs/mockups/` antes de implementarse (regla 7 del planning); Home ya tiene 2 variantes en Claude Design (§6.4), el resto se acuerdan con el usuario al llegar su tarea.

## 9. Integraciones externas

### 9.1 Google Maps embed

- **Uso**: iframe embed para mostrar la ubicación de Álora, Málaga, en `/contact` y en el footer/Home (versión compacta).
- **`[verificar]` cerrado en T1.3 (2026-07-20)**: se descartó la Maps Embed API oficial (exige API key + proyecto de Google Cloud + cuenta de facturación activada, aunque el uso en sí sea gratuito e ilimitado) en favor del endpoint público `maps.google.com/maps?...&output=embed` — sin API key, sin cuota, sin proyecto de Cloud, gratis e ilimitado, estable desde 2014. Decisión explícita del usuario: prioriza cero prerequisitos externos sobre el respaldo oficial/SLA de Google. Implementado en `MapEmbed` (`apps/web/src/components/ui/map-embed.tsx`, prop `interactive`).
- **Coste**: $0, sin límite de uso conocido.
- **Requiere**: nada — ya no hay prerequisito externo del usuario para este punto.

### 9.2 Formspree

- **Uso**: recepción y reenvío por email del formulario de `/contact`. El formulario hace POST directo al endpoint de Formspree desde el cliente — no hay route handler propio.
- **Requiere**: cuenta en formspree.io + ID de formulario/endpoint — ✅ resuelto en T1.3 (2026-07-20), endpoint real `https://formspree.io/f/mykrjbra`.
- **Límites — `[verificar]` cerrado en T1.3 (2026-07-20)**: plan gratuito de Formspree admite **50 envíos/mes por formulario**. Si se supera, Formspree deja de aceptar nuevos envíos hasta el siguiente ciclo mensual (el formulario mostraría el estado de error ya implementado en `contact-form.tsx`, sin lógica adicional necesaria). Documentado también como comentario en el código.

### 9.3 Google Reviews / Places API (fuera de alcance v1)

No se integra en v1 (ver D4, no-objetivo). Si se aborda en el futuro, sustituye los datos inventados de `src/data/reviews.ts` por una llamada server-side cacheada — requeriría reintroducir un mínimo de backend, fuera del alcance de este PRD.

## 10. Despliegue y operación

- **Hosting**: Cloudflare Pages (free tier suficiente para este volumen de tráfico).
- **Dominio**: `endurofun.eu`, registrado en Hostinger.
- **DNS**: nameservers de Hostinger apuntando a Cloudflare, o CNAME records — se documenta la configuración exacta en la tarea de deploy inicial.
- **Deploy**: push a `main` → build automático de Cloudflare Pages. No hay paso manual.
- **TLS**: provisto automáticamente por Cloudflare.
- **La skill `deploy` del arnés no aplica**: está diseñada para VPS + Docker + Caddy; este proyecto no tiene servidor propio que operar. La tarea de F0 que monta el pipeline de Cloudflare Pages documenta el procedimiento directamente en el planning/journal, no en esa skill.
- Sin base de datos, por tanto sin backups de BD que gestionar.

## 11. Observabilidad y seguridad

- **Analítica**: Cloudflare Web Analytics (gratuito, sin cookies, GDPR-friendly) — sin necesidad de banner de cookies para analítica.
- **Superficie de seguridad**: mínima — sitio estático, sin inputs de usuario propios (el único input, el formulario de contacto, lo procesa Formspree fuera de nuestra infraestructura).
- **Headers de seguridad**: CSP, `X-Frame-Options`, etc. vía fichero `_headers` de Cloudflare Pages.
- **API key de Google Maps**: restringida por referrer/dominio en Google Cloud Console — nunca una key sin restricciones en el frontend.
- **Secretos**: no hay credenciales de servidor que gestionar (ni base de datos, ni API keys server-side) — cualquier key pública (Maps) se tracking como configuración de build, no como secreto de servidor.

## 12. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Contenido no traducido correctamente al alemán | Medio (público principal) | Revisión por hablante nativo antes de lanzar cada página con contenido nuevo |
| Librería de i18n elegida no soporta bien `output: 'export'` | Medio (ya no es "alto": D11 evita depender de middleware) | Se verifica en la tarea de F0 que monta i18n antes de construir páginas sobre ella |
| Dominio en Hostinger, hosting en Cloudflare | Bajo | Documentar la configuración DNS exacta en la tarea de deploy; es un patrón estándar |
| Formspree free tier alcanza su límite mensual | Bajo-Medio | Monitorizar envíos; plan de pago es trivial de activar si ocurre |
| Competidores con mejor SEO establecido | Medio | Investigación de keywords + contenido nativo en 3 idiomas como ventaja diferencial |

## 13. Roadmap de fases

- **F0 — Infraestructura**: monorepo, tooling (`pnpm gate`), pipeline de deploy a Cloudflare Pages, i18n estático configurado y verificado.
- **TD — Design system**: tokens, componentes base y composites alineados con "EnduroFun Design System" en Claude Design.
- **F1 — Contenido base**: Home + About + Contact (con formulario Formspree + mapa) + footer con Instagram, en los 3 idiomas.
- **F2 — Paquetes y reviews**: página de paquetes completa + página de reviews con datos de ejemplo.
- **F3 — Pulido y SEO**: optimización de imágenes/vídeo, meta tags, `hreflang`, sitemap multilingüe, performance final.

**Hitos de valor real**: tras F1 ya existe una web navegable en 3 idiomas con la propuesta de valor y forma de contactar; tras F2 el escaparate está completo (paquetes + prueba social); F3 la deja lista para posicionar en buscadores.

## 14. Criterios de éxito

1. La web carga en **< 2 segundos** en Lighthouse móvil (score Performance > 90).
2. Las **3 versiones lingüísticas** (EN/ES/DE) muestran contenido completo y correcto en las 6 páginas.
3. El **formulario de contacto** envía correctamente y el email llega vía Formspree, en los 3 idiomas de UI.
4. **Google Maps** muestra la ubicación de Álora, visible e interactiva, en `/contact` y en el footer.
5. Las **reviews** se muestran con diseño coherente y datos de ejemplo creíbles (datos reales sustituibles sin cambios de esquema).
6. El **selector de idioma** cambia todo el contenido de la página sin recarga completa perceptible.
7. La web es **responsive** y usable en móvil, tablet y desktop.
8. El **deploy automático** desde push a `main` en Cloudflare Pages funciona sin intervención manual.
9. **SEO básico**: `hreflang` correcto entre los 3 idiomas, `sitemap.xml` multilingüe, meta descriptions por página e idioma.
10. El enlace de **Instagram** en el footer lleva al perfil `@endurofun_oficial`.
