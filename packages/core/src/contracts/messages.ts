import { z } from 'zod';

/**
 * Esquema de mensajes de UI localizados (T0.2). Distinto de
 * `LocalizedTextSchema` (locale.ts): ese es para un campo individual de
 * CONTENIDO (ej. el nombre de un `Package`); este es la forma completa de
 * `src/messages/<locale>.json` en `apps/web` — un fichero POR idioma, no un
 * objeto con las 3 claves por string.
 *
 * `apps/web/src/i18n/messages.ts` hace `MessagesSchema.parse(...)` sobre
 * CADA UNO de `en.json`/`es.json`/`de.json` a nivel de módulo (import time):
 * si falta una clave en cualquiera de los 3 ficheros, `.parse()` lanza y
 * `next build` falla — ese es el invariante "las 3 claves obligatorias" del
 * PRD §7, aplicado aquí a nivel de fichero-por-idioma en vez de
 * objeto-por-string.
 *
 * Ampliado en T1.1 (Home real, F1): `home.title`/`home.subtitle` se
 * reutilizan como tagline/párrafo del hero (mismas claves que el placeholder
 * de F0 — preserva el control negativo existente en
 * `apps/web/src/i18n/messages.build-negative.test.ts`, que borra
 * `home.subtitle` de `de.json` y espera que `pnpm build` falle nombrando esa
 * clave). El resto de contenido de Home (badge, CTAs, secciones de
 * packages/reviews/find-us) se añade en grupos anidados nuevos.
 *
 * `packages.durationTemplate`/`packages.ctaLabel` (fix de code review del
 * verifier en T1.1): `PackageCard` (components/ui, presentacional puro) NO
 * puede construir `` `${nights} nights · ${days} route days` `` ni fijar
 * `"Enquire"` internamente — quedaban en inglés en `/es/`/`/de/`. La página
 * (que sí conoce `messages`) interpola `durationTemplate` (con los
 * placeholders literales `{nights}`/`{days}`) por idioma antes de pasar el
 * string final ya traducido a la prop `subtitle` del componente.
 *
 * `nav` (2º fix de code review del verifier en T1.1, mismo patrón que
 * `packages` arriba): `Header`/`Footer` (components/ui, presentacionales
 * puros) tenían los labels de navegación ("Home"/"Packages"/"About"/
 * "Contact"/"Reviews"), los títulos de columna del footer ("Explore"/
 * "Company"/"Follow") y el blurb de marca del footer fijados en inglés a
 * nivel de módulo — quedaban sin traducir en `/es/`/`/de/` porque ninguna de
 * las dos páginas que montan estos componentes ([locale] y el showcase de
 * `/design-system`) se los pasaba. Grupo fuera de `home` porque es contenido
 * compartido de layout (aparece en TODAS las páginas, no solo Home), no
 * contenido específico de la Home.
 */
export const MessagesSchema = z.object({
  nav: z.object({
    home: z.string().min(1),
    packages: z.string().min(1),
    about: z.string().min(1),
    contact: z.string().min(1),
    reviews: z.string().min(1),
    footer: z.object({
      explore: z.string().min(1),
      company: z.string().min(1),
      follow: z.string().min(1),
      brandBlurb: z.string().min(1),
    }),
  }),
  home: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    badge: z.string().min(1),
    ctaPrimary: z.string().min(1),
    ctaSecondary: z.string().min(1),
    packages: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      note: z.string().min(1),
      fromPrefix: z.string().min(1),
      mostPopular: z.string().min(1),
      durationTemplate: z.string().min(1),
      ctaLabel: z.string().min(1),
    }),
    reviews: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
    }),
    findUs: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
    }),
  }),
});

export type Messages = z.infer<typeof MessagesSchema>;
