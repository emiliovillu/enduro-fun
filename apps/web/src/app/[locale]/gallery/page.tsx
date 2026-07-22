import type { Locale } from '@app/core/contracts';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { SectionHeading } from '@/components/ui/section-heading';
import { getMessages } from '@/i18n/messages';

import { GalleryGrid } from './gallery-grid';

// Página Gallery (hotfix, petición directa del usuario, no prevista en el
// PRD/planning original — anotada como cambio de alcance menor en el
// journal). Mismos patrones que About/Packages/Reviews (T1.2/T2.1/T2.2):
// Header/Footer reciben `labels` ya traducidos, copy real en
// `messages.gallery`, nunca hardcodeado. Sin mockup previo — layout acordado
// directamente con el usuario en la conversación (regla 7 del planning:
// páginas nuevas sin mockup se acuerdan con el usuario antes de
// implementarlas).
export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
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
  const { gallery } = messages;

  return (
    <main>
      <Header
        active="gallery"
        activeLocale={locale}
        labels={navLabels}
        menuOpenLabel={messages.nav.menuOpen}
        menuCloseLabel={messages.nav.menuClose}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading as="h1" size="lg" eyebrow={gallery.eyebrow} title={gallery.title} />
        <p className="mt-5 max-w-160 text-lead text-text-secondary">{gallery.intro}</p>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-5 pb-24 sm:px-8">
        <GalleryGrid
          photoAltTemplate={gallery.photoAltTemplate}
          loadingLabel={gallery.loadingLabel}
        />
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
