import type { Locale } from '@app/core/contracts';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { FleetCard } from '@/components/ui/fleet-card';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
import { FLEET, fleetCategoryLabel, fleetImageSlot } from '@/data/fleet';
import { getMessages } from '@/i18n/messages';

// About real (T1.2, F1). Mockup acordado con el usuario al iniciar esta
// tarea (no existía mockup previo en Claude Design — regla 7 del planning):
// `docs/mockups/about.html` / `about.png`. Mismos patrones que Home (T1.1):
// Header/Footer reciben `labels`/`columnLabels`/`brandBlurb` ya traducidos,
// el copy real vive en `messages.about` (packages/core `MessagesSchema`),
// nunca hardcodeado en la página o en una primitiva.
//
// Diferencia deliberada con el hero de Home: el Header de esta página NO es
// `transparent` (el mockup lo pinta como header estándar sobre fondo claro,
// sin hero full-bleed debajo) — se monta como sección normal, no `absolute`.
//
// Foto real de "Our story" (añadida 2026-07-23, sustituye el placeholder
// tokenizado — petición directa del usuario): `public/about/our-story.avif`,
// AVIF ~125KB (mismo pipeline `sharp` que Gallery: `rotate()` antes de
// codificar para hornear la orientación EXIF, calidad 50/effort 6). Sigue
// dentro de la caja de altura fija `h-85 rounded-lg` del mockup (no
// full-bleed) — `fill` + `object-cover` en vez de dimensiones explícitas
// porque el contenedor ya fija el tamaño. `alt` traducido en
// `messages.about.story.photoAlt`.
//
// Recorte descentrado reportado por el usuario 2026-07-23 (foto retrato
// 1047×1400 dentro de una caja apaisada — el centrado por defecto de
// `object-cover` dejaba el casco cortado arriba y el pulgar dominando la
// composición): `objectPosition: '50% 25%'` vía `style` (no `className`
// arbitrario — el lint del DS prohíbe valores crudos en clases, ver
// `design-system.md` §3.1) desplaza el recorte hacia arriba para mostrar
// casco y cara completos.
//
// Iconos de "What makes us different": el mockup deja el círculo vacío
// (decorativo, `background: var(--accent-primary)` sin contenido) — aquí
// se sustituye por un `Icon` real donde el registro (`components/ui/icon`)
// tiene un glifo con encaje semántico razonable: `map-pin` para
// conocimiento local, `globe` para terreno variado, `landmark` (añadido en
// este hotfix — el usuario reportó el círculo vacío de "Oferta cultural"
// como icono roto) para oferta cultural.
//
// Sección "Nuestra flota" (TD.12, petición directa del usuario): insertada
// justo debajo de "Our story" y antes de "What makes us different". El
// `SectionHeading` va ENCIMA del grid (mismo patrón que "What makes us
// different"/"levels" más abajo, porque las columnas son las `FleetCard`, no
// texto+foto). Datos reales (`apps/web/src/data/fleet.ts`, NO inventados).
// Grid `sm:grid-cols-2 lg:grid-cols-3` (cambio de alcance menor 2026-07-23,
// ver planning.md TD.12: se amplió de 2 a 3 columnas al añadir la BMW 1300
// GS — 2 columnas dejaba la 3ª card sola en su fila). `imageSlot` (vía
// `fleetImageSlot`, `data/fleet.ts`) da foto real solo a la Norden 901
// (petición directa del usuario 2026-07-23) — TE 300 y BMW 1300 GS siguen
// con el degradado de fallback tokenizado de `FleetCard` hasta que haya foto
// real de esas motos también.
export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const navLabels = {
    home: messages.nav.home,
    gallery: messages.nav.gallery,
    packages: messages.nav.packages,
    about: messages.nav.about,
    contact: messages.nav.contact,
    reviews: messages.nav.reviews,
  };
  const { about } = messages;

  const differentiators = [
    { ...about.different.localKnowledge, icon: 'map-pin' as const },
    { ...about.different.variedTerrain, icon: 'globe' as const },
    { ...about.different.culturalOffering, icon: 'landmark' as const },
  ];

  // TD.12: etiqueta de categoría del Badge de `FleetCard` — el enum
  // `FleetBike.category` es el dato de dominio, la traducción de su etiqueta
  // es copy de UI; `fleetCategoryLabel()` (en `data/fleet.ts`, no aquí) es el
  // único sitio de mapeo enum→texto, reusado también por el showcase de
  // `/design-system`.
  const fleetCategoryLabels = fleetCategoryLabel(about.fleet.categories);

  const levels = [about.levels.beginner, about.levels.intermediate, about.levels.advanced];

  return (
    <main>
      <Header
        active="about"
        activeLocale={locale}
        labels={navLabels}
        menuOpenLabel={messages.nav.menuOpen}
        menuCloseLabel={messages.nav.menuClose}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading as="h1" size="lg" eyebrow={about.eyebrow} title={about.title} />
        <p className="mt-5 max-w-160 text-lead text-text-secondary">{about.intro}</p>
      </section>

      <section className="mx-auto grid max-w-[var(--container-max)] items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={about.story.eyebrow} title={about.story.title} />
          <p className="mt-5 text-body text-text-secondary">{about.story.text}</p>
        </div>
        <div className="relative h-85 overflow-hidden rounded-lg">
          <Image
            src="/about/our-story.avif"
            alt={about.story.photoAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 25%' }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading eyebrow={about.fleet.eyebrow} title={about.fleet.title} />
        <div className="mt-10 grid items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FLEET.map((bike) => (
            <FleetCard
              key={bike.id}
              name={bike.name}
              displacementCc={bike.displacementCc}
              categoryLabel={fleetCategoryLabels[bike.category]}
              description={bike.description[locale]}
              imageSlot={fleetImageSlot(bike.id)}
            />
          ))}
        </div>
      </section>

      <section className="bg-bg-inverse py-24">
        <div className="mx-auto max-w-[var(--container-max)] px-5 sm:px-8">
          <SectionHeading eyebrow={about.different.eyebrow} title={about.different.title} light />
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {differentiators.map((item) => (
              <div key={item.title} className="rounded-lg bg-surface-card-inverse p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-pill bg-accent-primary text-charcoal-900">
                  <Icon name={item.icon} size={20} />
                </div>
                <h3 className="m-0 mb-2 text-h4 text-text-on-dark">{item.title}</h3>
                <p className="m-0 text-small text-text-on-dark-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading eyebrow={about.levels.eyebrow} title={about.levels.title} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {levels.map((level) => (
            <div
              key={level.label}
              className="rounded-lg border border-border-subtle bg-surface-card p-6"
            >
              <Badge tone="neutral" className="mb-3">
                {level.label}
              </Badge>
              <p className="m-0 text-small text-text-secondary">{level.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer
        activeLocale={locale}
        labels={navLabels}
        columnLabels={{
          explore: messages.nav.footer.explore,
          company: messages.nav.footer.company,
          follow: messages.nav.footer.follow,
        }}
        brandBlurb={messages.nav.footer.brandBlurb}
      />
    </main>
  );
}
