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
    gallery: z.string().min(1),
    packages: z.string().min(1),
    about: z.string().min(1),
    contact: z.string().min(1),
    reviews: z.string().min(1),
    menuOpen: z.string().min(1),
    menuClose: z.string().min(1),
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
    gallery: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      pauseLabel: z.string().min(1),
      playLabel: z.string().min(1),
    }),
    findUs: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
    }),
  }),
  // T1.2 (F1, Página About): grupo nuevo, mismo patrón que `home` — cada
  // sección de la página (intro, historia, diferenciadores, niveles de
  // experiencia) es un sub-objeto con sus propias claves obligatorias. Los
  // 3 diferenciadores (`localKnowledge`/`variedTerrain`/`culturalOffering`)
  // y los 3 niveles (`beginner`/`intermediate`/`advanced`) van como claves
  // fijas, no un array — mismo criterio que evitar arrays de longitud fija
  // en Zod cuando el contenido es semánticamente distinto por clave (no una
  // lista homogénea), y permite que falte un solo campo de un solo
  // diferenciador/nivel dispare el control negativo con un mensaje de error
  // preciso (nombra la ruta exacta).
  about: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    story: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
      // Foto real de un guía en ruta (añadida 2026-07-23, sustituye el
      // placeholder tokenizado) — `alt` traducido, mismo criterio que
      // `gallery.photoAltTemplate`.
      photoAlt: z.string().min(1),
    }),
    // TD.12: sección "Nuestra flota", hermana de `story`/`different`/`levels`
    // (mismo patrón de sub-objeto por sección). `categories` traduce el enum
    // `FleetBike.category` (`enduro`/`trail-adventure`, ver `fleet-bike.ts`)
    // a la etiqueta visible del `Badge` de `FleetCard` — el enum es el dato
    // de dominio, la etiqueta es copy de UI localizado, misma separación que
    // `status-class.ts` usa para mapear estado→token (design-system.md
    // §3.4: la agrupación enum→texto vive en UN sitio, aquí en `messages`
    // porque es texto, no una clase Tailwind).
    fleet: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      categories: z.object({
        enduro: z.string().min(1),
        trailAdventure: z.string().min(1),
      }),
    }),
    different: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      localKnowledge: z.object({ title: z.string().min(1), text: z.string().min(1) }),
      variedTerrain: z.object({ title: z.string().min(1), text: z.string().min(1) }),
      culturalOffering: z.object({ title: z.string().min(1), text: z.string().min(1) }),
    }),
    levels: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      beginner: z.object({ label: z.string().min(1), text: z.string().min(1) }),
      intermediate: z.object({ label: z.string().min(1), text: z.string().min(1) }),
      advanced: z.object({ label: z.string().min(1), text: z.string().min(1) }),
    }),
  }),
  // T2.1 (F2, Página Packages): grupo nuevo con SOLO el copy propio de esta
  // página (eyebrow/título/intro del h1 + nota de Adventure Bike/oferta
  // personalizada). Deliberadamente NO duplica `durationTemplate`/
  // `ctaLabel`/`mostPopular` de `home.packages` — la página reusa esas 3
  // claves tal cual para las cards (mismo dato, mismo formato, un solo sitio
  // que traducir si cambia el criterio de "most popular" o el CTA).
  packages: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    note: z.string().min(1),
  }),
  // T2.2 (F2, Página Reviews): mismo patrón que `packages` arriba — copy
  // propio de la página (eyebrow/h1/intro), distinto de `home.reviews`
  // (eyebrow/título de la SECCIÓN de preview en Home, texto más corto).
  reviews: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
  }),
  // T1.3 (F1, Página Contact): copy propio de la página — intro invitando a
  // pedir presupuesto personalizado, labels/placeholders de los 3 campos del
  // formulario (name/email/message), label del botón de envío, mensajes de
  // éxito/error tras el POST a Formspree, y el bloque "find us" (eyebrow +
  // texto corto sobre Álora/Málaga que acompaña al `MapEmbed`).
  contact: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    form: z.object({
      nameLabel: z.string().min(1),
      namePlaceholder: z.string().min(1),
      emailLabel: z.string().min(1),
      emailPlaceholder: z.string().min(1),
      messageLabel: z.string().min(1),
      messagePlaceholder: z.string().min(1),
      submitLabel: z.string().min(1),
      successMessage: z.string().min(1),
      errorMessage: z.string().min(1),
    }),
    findUs: z.object({
      eyebrow: z.string().min(1),
      text: z.string().min(1),
    }),
  }),
  // Hotfix (petición directa del usuario): página /gallery, grid de 5
  // columnas con scroll infinito sobre las fotos reales subidas por el
  // usuario. `photoAltTemplate` reusa el patrón `{n}` de interpolación
  // manual ya usado en `home.packages.durationTemplate` (`{nights}`/
  // `{days}`) — cada foto interpola su propio índice en el `alt`.
  // `loadingLabel` es el texto accesible (`aria-live`) del spinner que
  // aparece al cargar la siguiente tanda.
  gallery: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    intro: z.string().min(1),
    photoAltTemplate: z.string().min(1),
    loadingLabel: z.string().min(1),
    // TD.11 — Lightbox: único texto nuevo del componente (aria-label del
    // botón de cerrar); la propia entrada del planning es explícita en que
    // no hay más copy que traducir en el visor.
    lightboxCloseLabel: z.string().min(1),
  }),
});

export type Messages = z.infer<typeof MessagesSchema>;
