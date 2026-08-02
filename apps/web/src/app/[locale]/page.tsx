import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@app/core/contracts';
import { Button } from '@/components/ui/button';
import { FleetCard } from '@/components/ui/fleet-card';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { MapEmbed } from '@/components/ui/map-embed';
import { PackageCard } from '@/components/ui/package-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { FLEET, fleetCategoryLabel, fleetImageSlot } from '@/data/fleet';
import {
  CENTERED_PACKAGE_ID,
  HIGHLIGHTED_PACKAGE_ID,
  PACKAGES,
  packageImageSlot,
} from '@/data/packages';
import { getMessages } from '@/i18n/messages';
import type { NavKey } from '@/lib/nav-links';
import { localeHref } from '@/lib/utils';

import { HomeHeroVideo } from './home-hero-video';
import { HomePhotoCarousel } from './home-photo-carousel';

// Home real (T1.1, F1) — reemplaza el placeholder de F0. Mockup: Claude
// Design "EnduroFun Pages", `variants/HomeVariantA.jsx` (Variante Cinemática,
// PRD §6.4).
//
// Vídeo del hero: `HomeHeroVideo` (2026-07-25, ver ese fichero para el
// pipeline completo) sustituye el placeholder tokenizado original. Sigue sin
// existir una primitiva del DS para esto (`Photo` en el mockup es un helper
// del sandbox de Claude Design, no un componente real) — client component
// local a la página, no en `components/ui/`, mismo criterio que
// `HomePhotoCarousel`.
// El scrim usa `bg-gradient-scrim`, que YA existe como utilidad tokenizada
// (`--gradient-scrim` en globals.css, namespace `background-image-*` →
// `bg-gradient-*`) — va de transparente (arriba) a oscuro (abajo), que es
// exactamente la dirección que necesita el contenido del hero anclado al
// fondo: no hizo falta el escape hatch `var(--token)` porque el token
// existente ya encaja tal cual.
//
// Sección "Nuestra flota" (2026-07-25, petición directa del usuario:
// sustituye la preview de Reviews que había aquí) — reusa TAL CUAL los
// mismos datos/componente/fotos de la sección homónima de About (TD.12):
// `FLEET`/`fleetCategoryLabel`/`fleetImageSlot` de `@/data/fleet` y
// `FleetCard` de `components/ui/`, sin duplicar ni un dato. El copy
// (eyebrow/título) reusa `messages.about.fleet.{eyebrow,title}` — mismo
// criterio de reuso cross-página ya establecido por
// `messages.home.packages.*` en `/packages` (ver ese comentario). La
// preview de Reviews que ocupaba este hueco se elimina de Home (la página
// `/reviews` dedicada, T2.2, sigue intacta) — `messages.home.reviews`
// queda sin consumidor y se retira del contrato (ver `messages.ts`).
export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const active: NavKey = 'home';
  const messages = getMessages(locale);
  const priceFormatter = new Intl.NumberFormat(locale);
  const fleetCategoryLabels = fleetCategoryLabel(messages.about.fleet.categories);
  const navLabels = {
    home: messages.nav.home,
    gallery: messages.nav.gallery,
    packages: messages.nav.packages,
    about: messages.nav.about,
    contact: messages.nav.contact,
    reviews: messages.nav.reviews,
  };

  return (
    <main>
      <section className="relative h-190 overflow-hidden">
        <HomeHeroVideo />
        <div className="absolute inset-0 bg-gradient-scrim" aria-hidden="true" />
        <Header
          active={active}
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
          <div className="flex w-full flex-wrap justify-center gap-4">
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
        photoAltTemplate={messages.home.gallery.photoAltTemplate}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow={messages.home.packages.eyebrow}
          title={messages.home.packages.title}
          align="left"
        />
        <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2">
          {PACKAGES.map((pkg) => {
            const card = (
              <PackageCard
                key={pkg.id}
                name={pkg.name[locale]}
                subtitle={
                  pkg.subtitleOverride
                    ? pkg.subtitleOverride[locale]
                    : messages.home.packages.durationTemplate
                        .replace('{nights}', String(pkg.nights))
                        .replace('{days}', String(pkg.days))
                }
                price={
                  pkg.priceLabel
                    ? pkg.priceLabel[locale]
                    : `${messages.home.packages.fromPrefix} ${priceFormatter.format(pkg.priceEur ?? 0)} €`
                }
                features={pkg.features.map((feature) => feature[locale])}
                highlight={
                  pkg.id === HIGHLIGHTED_PACKAGE_ID ? messages.home.packages.mostPopular : undefined
                }
                ctaLabel={messages.home.packages.ctaLabel}
                ctaHref={localeHref(locale, 'contact')}
                imageSlot={packageImageSlot(pkg.id)}
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
          {messages.home.packages.note}
        </p>
      </section>

      <section className="bg-bg-inverse py-24">
        <div className="mx-auto max-w-[var(--container-max)] px-5 sm:px-8">
          <SectionHeading
            eyebrow={messages.about.fleet.eyebrow}
            title={messages.about.fleet.title}
            align="left"
            light
          />
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
        active={active}
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
