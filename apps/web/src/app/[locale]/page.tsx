import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@app/core/contracts';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { MapEmbed } from '@/components/ui/map-embed';
import { PackageCard } from '@/components/ui/package-card';
import { ReviewCard } from '@/components/ui/review-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { HIGHLIGHTED_PACKAGE_ID, PACKAGES } from '@/data/packages';
import { REVIEWS } from '@/data/reviews';
import { getMessages } from '@/i18n/messages';
import { localeHref } from '@/lib/utils';

import { HomePhotoCarousel } from './home-photo-carousel';

// Home real (T1.1, F1) — reemplaza el placeholder de F0. Mockup: Claude
// Design "EnduroFun Pages", `variants/HomeVariantA.jsx` (Variante Cinemática,
// PRD §6.4).
//
// Placeholder de foto/vídeo del hero: NO existe una primitiva del DS para
// esto (`Photo` en el mockup es un helper del sandbox de Claude Design, no
// un componente real) — se construye aquí, local a la página (no en
// `components/ui/`, no es una primitiva reusable todavía), con un div de
// fondo tokenizado (mismo criterio que `PackageCard`'s
// `from-charcoal-700 to-charcoal-900`) + texto indicando el placeholder.
// El scrim usa `bg-gradient-scrim`, que YA existe como utilidad tokenizada
// (`--gradient-scrim` en globals.css, namespace `background-image-*` →
// `bg-gradient-*`) — va de transparente (arriba) a oscuro (abajo), que es
// exactamente la dirección que necesita el contenido del hero anclado al
// fondo: no hizo falta el escape hatch `var(--token)` porque el token
// existente ya encaja tal cual.
export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const priceFormatter = new Intl.NumberFormat(locale);
  const navLabels = {
    home: messages.nav.home,
    packages: messages.nav.packages,
    about: messages.nav.about,
    contact: messages.nav.contact,
    reviews: messages.nav.reviews,
  };

  return (
    <main>
      <section className="relative h-190 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-charcoal-700 to-charcoal-900"
          aria-hidden="true"
        >
          <span className="font-mono text-caption text-text-on-dark-secondary">
            Photo/video placeholder
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-scrim" aria-hidden="true" />
        <Header
          active="home"
          transparent
          activeLocale={locale}
          labels={navLabels}
          menuOpenLabel={messages.nav.menuOpen}
          menuCloseLabel={messages.nav.menuClose}
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 px-5 pb-20 sm:px-8">
          {/* logo con más presencia en el hero, pegado al h1 (marca
              provista, sin recrear — docs/design-system/guidelines/
              brand-logo.card.html); el Header vuelve a usar solo texto
              "EnduroFun" (hotfix branding, 2026-07-19, 3ª iteración a
              petición del usuario: fuera el badge Álora·Málaga, logo más
              cerca del título) */}
          <Image
            src="/logo.png"
            alt="EnduroFun"
            width={620}
            height={400}
            className="-mb-2 h-24 w-auto sm:h-32"
            priority
          />
          <h1 className="m-0 max-w-3xl text-display-xl text-text-on-dark">{messages.home.title}</h1>
          <p className="m-0 max-w-140 text-body text-text-on-dark-secondary">
            {messages.home.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="primary"
              render={<Link href={localeHref(locale, 'packages')} />}
            >
              {messages.home.ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={localeHref(locale, 'contact')} />}
            >
              {messages.home.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      <HomePhotoCarousel
        eyebrow={messages.home.gallery.eyebrow}
        title={messages.home.gallery.title}
        pauseLabel={messages.home.gallery.pauseLabel}
        playLabel={messages.home.gallery.playLabel}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow={messages.home.packages.eyebrow}
          title={messages.home.packages.title}
          align="left"
        />
        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              name={pkg.name[locale]}
              subtitle={messages.home.packages.durationTemplate
                .replace('{nights}', String(pkg.nights))
                .replace('{days}', String(pkg.days))}
              price={`${messages.home.packages.fromPrefix} ${priceFormatter.format(pkg.priceEur)} €`}
              features={pkg.features.map((feature) => feature[locale])}
              highlight={
                pkg.id === HIGHLIGHTED_PACKAGE_ID ? messages.home.packages.mostPopular : undefined
              }
              ctaLabel={messages.home.packages.ctaLabel}
            />
          ))}
        </div>
        <p className="mt-7 text-small text-text-secondary">{messages.home.packages.note}</p>
      </section>

      <section className="bg-bg-inverse py-24">
        <div className="mx-auto max-w-[var(--container-max)] px-5 sm:px-8">
          <SectionHeading
            eyebrow={messages.home.reviews.eyebrow}
            title={messages.home.reviews.title}
            align="left"
            light
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Preview: solo las 3 primeras de `REVIEWS` (T2.2 amplió el
                array a 6 para la página dedicada `/reviews` — Home conserva
                su grid original de 1 fila/3 columnas, el resto vive solo en
                esa página). */}
            {REVIEWS.slice(0, 3).map((review) => (
              <ReviewCard
                key={review.id}
                name={review.name}
                country={review.country}
                rating={review.rating}
                text={review.text[locale]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[var(--container-max)] items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={messages.home.findUs.eyebrow}
            title={messages.home.findUs.title}
          />
          <p className="my-5 text-body text-text-secondary">{messages.home.findUs.text}</p>
          <Button
            variant="secondary"
            render={<a href="mailto:info@endurofun.eu" />}
            className="inline-flex items-center gap-2"
          >
            <Icon name="mail" size={18} />
            info@endurofun.eu
          </Button>
        </div>
        <MapEmbed label={messages.home.findUs.eyebrow} interactive />
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
