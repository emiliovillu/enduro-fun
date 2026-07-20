import type { Locale } from '@app/core/contracts';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { PackageCard } from '@/components/ui/package-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { CENTERED_PACKAGE_ID, HIGHLIGHTED_PACKAGE_ID, PACKAGES } from '@/data/packages';
import { getMessages } from '@/i18n/messages';
import { localeHref } from '@/lib/utils';

// Packages real (T2.1, F2). Mockup: `docs/mockups/packages.html`, creado y
// aprobado por el usuario al iniciar esta tarea (no existía mockup previo en
// Claude Design para esta página — regla 7 del planning, mismo criterio que
// T1.2/about.html). Layout: intro (eyebrow + h1 + párrafo) seguida de un
// grid de 2 columnas con las 2 `PackageCard` y una nota debajo — mismos
// patrones de Header/Footer/SectionHeading que Home (T1.1) y About (T1.2).
//
// Datos: reusa `PACKAGES`/`HIGHLIGHTED_PACKAGE_ID` de `@/data/packages`
// (T1.1) — NO se crea un segundo array paralelo. Mismo criterio de traducir
// el contrato `Package` (dominio) a las props planas de `PackageCard`
// (presentacional) que ya usa la preview de Home.
//
// Mensajes: las 2 cards reusan `messages.home.packages.{durationTemplate,
// ctaLabel,mostPopular}` tal cual — mismo dato de dominio (cómo se formatea
// la duración, el label del CTA, el badge de "más popular"), sin importar en
// qué página se muestren las cards. Solo el copy PROPIO de esta página
// (eyebrow/título/intro del h1 + nota de Adventure Bike/oferta
// personalizada) vive en el grupo nuevo `messages.packages` (packages/core
// `MessagesSchema`, T2.1) — evita duplicar `durationTemplate`/`ctaLabel`/
// `mostPopular` en dos sitios que tendrían que mantenerse sincronizados.
export default async function PackagesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const priceFormatter = new Intl.NumberFormat(locale);
  const navLabels = {
    home: messages.nav.home,
    gallery: messages.nav.gallery,
    packages: messages.nav.packages,
    about: messages.nav.about,
    contact: messages.nav.contact,
    reviews: messages.nav.reviews,
  };
  const { packages: pageCopy, home } = messages;

  return (
    <main>
      <Header
        active="packages"
        activeLocale={locale}
        labels={navLabels}
        menuOpenLabel={messages.nav.menuOpen}
        menuCloseLabel={messages.nav.menuClose}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading as="h1" size="lg" eyebrow={pageCopy.eyebrow} title={pageCopy.title} />
        <p className="mt-5 max-w-160 text-lead text-text-secondary">{pageCopy.intro}</p>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-5 pb-24 sm:px-8">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          {PACKAGES.map((pkg) => {
            const card = (
              <PackageCard
                key={pkg.id}
                name={pkg.name[locale]}
                subtitle={
                  pkg.subtitleOverride
                    ? pkg.subtitleOverride[locale]
                    : home.packages.durationTemplate
                        .replace('{nights}', String(pkg.nights))
                        .replace('{days}', String(pkg.days))
                }
                price={
                  pkg.priceLabel
                    ? pkg.priceLabel[locale]
                    : `${home.packages.fromPrefix} ${priceFormatter.format(pkg.priceEur ?? 0)} €`
                }
                features={pkg.features.map((feature) => feature[locale])}
                highlight={
                  pkg.id === HIGHLIGHTED_PACKAGE_ID ? home.packages.mostPopular : undefined
                }
                ctaLabel={home.packages.ctaLabel}
                ctaHref={localeHref(locale, 'contact')}
              />
            );

            return pkg.id === CENTERED_PACKAGE_ID ? (
              <div key={pkg.id} className="sm:col-span-2 sm:flex sm:justify-center">
                <div className="w-full sm:w-1/2">{card}</div>
              </div>
            ) : (
              card
            );
          })}
        </div>
        <p className="mx-auto mt-7 max-w-160 text-center text-small text-text-secondary">
          {pageCopy.note}
        </p>
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
