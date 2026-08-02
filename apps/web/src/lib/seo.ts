import type { Metadata } from 'next';
import { LOCALES, type Locale } from '@app/core/contracts';
import { localeHref } from '@/lib/utils';

// T3.2 (F3, meta tags/hreflang/sitemap). Dominio real del sitio — zona
// Cloudflare activa desde T0.3, Custom Domain confirmado en T1.3 (ver
// planning.md, actualización 2026-07-23: `https://endurofun.eu` sirve el
// sitio con TLS válido). Deliberadamente NO un placeholder: las URLs
// absolutas de `canonical`/`hreflang`/`sitemap.xml` tienen que resolver de
// verdad para que un rastreador las siga.
const SITE_URL = 'https://endurofun.eu';

// URL absoluta de una página+locale — reusa `localeHref` (ya usado por
// Header/Footer para hrefs internos relativos) en vez de reimplementar el
// mismo cálculo de slug/trailing-slash aquí.
export function absoluteLocaleUrl(locale: Locale, slug: string): string {
  return `${SITE_URL}${localeHref(locale, slug)}`;
}

// Mapa {en,es,de} → URL absoluta de una página, factorizado aparte de
// `buildAlternates` (en vez de leer `.languages` de su valor de retorno):
// `Metadata['alternates'].languages` acepta un tipo más ancho
// (`string | URL | AlternateLinkDescriptor[] | null`) que el que exige
// `MetadataRoute.Sitemap` (`Languages<string>`, solo strings) — `sitemap.ts`
// necesita el tipo concreto `Record<Locale, string>` de aquí directamente,
// no el ensanchado por la firma de `Metadata`.
export function localizedUrls(slug: string): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, absoluteLocaleUrl(l, slug)])) as Record<
    Locale,
    string
  >;
}

// `alternates` de la Metadata API de Next: `canonical` es la URL de ESTA
// página+locale; `languages` es el mapa completo {en,es,de} de las otras
// versiones (+ la propia) — Next genera automáticamente los 3
// `<link rel="alternate" hreflang="…">` a partir de `languages`, no hace
// falta escribirlos a mano (T3.2, Verificación). Sin `export`: desde el
// reuso de `buildPageMetadata` en las 6 páginas, ya no tiene consumidores
// fuera de este fichero (knip lo marcaba como export muerto).
function buildAlternates(locale: Locale, slug: string): NonNullable<Metadata['alternates']> {
  const languages = localizedUrls(slug);
  return {
    canonical: languages[locale],
    languages,
  };
}

// `generateMetadata` de las 6 páginas de `[locale]/*` compartía este mismo
// bloque de 6 líneas cambiando solo el sub-objeto de `messages` y el slug
// (code review de T3.2: reuso perdido) — `MessagesSchema` ya fuerza el mismo
// shape `{ title, meta: { description } }` en las 6 páginas (ver
// `packages/core/src/contracts/messages.ts`), así que un helper único basta
// sin perder especificidad por página.
export function buildPageMetadata(
  locale: Locale,
  slug: string,
  page: { title: string; meta: { description: string } },
): Metadata {
  return {
    title: `${page.title} · EnduroFun`,
    description: page.meta.description,
    alternates: buildAlternates(locale, slug),
  };
}
