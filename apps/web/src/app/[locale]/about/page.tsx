import type { Locale } from '@app/core/contracts';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { SectionHeading } from '@/components/ui/section-heading';
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
// Placeholder de foto de "Our story": mismo criterio que el hero de Home
// (div con gradiente tokenizado `from-charcoal-700 to-charcoal-900`,
// construido local a la página porque no hay primitiva del DS para esto),
// pero NO full-bleed: el mockup lo pone en una caja de altura fija dentro
// de un grid de 2 columnas, así que aquí es `h-85 rounded-lg` en vez de
// `absolute inset-0`.
//
// Iconos de "What makes us different": el mockup deja el círculo vacío
// (decorativo, `background: var(--accent-primary)` sin contenido) — aquí
// se sustituye por un `Icon` real donde el registro (`components/ui/icon`)
// tiene un glifo con encaje semántico razonable: `map-pin` para
// conocimiento local, `globe` para terreno variado, `landmark` (añadido en
// este hotfix — el usuario reportó el círculo vacío de "Oferta cultural"
// como icono roto) para oferta cultural.
export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const navLabels = {
    home: messages.nav.home,
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
        <div
          className="flex h-85 items-center justify-center rounded-lg bg-linear-to-br from-charcoal-700 to-charcoal-900"
          aria-hidden="true"
        >
          <span className="font-mono text-caption text-text-on-dark-secondary">
            Photo placeholder — guides on trail
          </span>
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
