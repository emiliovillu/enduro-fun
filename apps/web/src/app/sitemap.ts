import type { MetadataRoute } from 'next';
import { LOCALES } from '@app/core/contracts';
import { NAV_LINKS } from '@/lib/nav-links';
import { absoluteLocaleUrl, localizedUrls } from '@/lib/seo';

// T3.2 (F3, meta tags/hreflang/sitemap). `next build` con `output: 'export'`
// escribe este route handler estático a `out/sitemap.xml` (sin depender de
// nada en tiempo de request — Next lo trata como contenido estático por
// defecto salvo que uses `generateSitemaps`, que aquí no hace falta).
//
// 6 páginas × 3 idiomas = 18 URLs (`NAV_LINKS`, `lib/nav-links.ts`, es la
// MISMA fuente de verdad que usa el `Header`/`Footer` para el nav real — no
// se duplica la lista de slugs aquí). Decisión sobre el conteo real de
// páginas: el bullet de T3.2 dice "5 páginas" (cifra previa al hotfix de
// Gallery, añadida después del lanzamiento inicial — ver PRD D12, que ya
// lista las 6 correctamente: Home/Gallery/Packages/About/Contact/Reviews).
// Se sitemapea las 6, no 5 — omitir Gallery del sitemap real por seguir
// literalmente una cifra desactualizada del propio texto de la tarea sería
// peor SEO, no mejor cumplimiento.
//
// La raíz `/` (redirección meta-refresh a `/en/`, sin contenido propio,
// `noindex` implícito por no tener nada indexable) NO se lista aquí — solo
// las 18 URLs canónicas de contenido real, cada una con sus `hreflang`
// cruzados vía `alternates.languages` (Next expande esto a las anotaciones
// `xhtml:link` del sitemap, el equivalente de sitemap a los `<link
// rel="alternate" hreflang>` del `<head>`).
// `output: 'export'` exige declarar explícitamente que esta ruta es
// estática (no genera nada en tiempo de request) — sin esto, `next build`
// falla con "export const dynamic = 'force-static' ... not configured".
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    NAV_LINKS.map(({ slug }) => ({
      url: absoluteLocaleUrl(locale, slug),
      alternates: { languages: localizedUrls(slug) },
    })),
  );
}
