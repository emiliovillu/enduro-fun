import type { Locale } from '@app/core/contracts';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { ReviewCard } from '@/components/ui/review-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { REVIEWS } from '@/data/reviews';
import { getMessages } from '@/i18n/messages';

// Reviews real (T2.2, F2). Mockup: `docs/mockups/reviews.html`, creado y
// aprobado por el usuario al iniciar esta tarea (6 reviews, grid de 3
// columnas — no había mockup previo en Claude Design para esta página,
// mismo criterio que T1.2/about.html y T2.1/packages.html). Layout: intro
// (eyebrow + h1 + párrafo) seguida de un grid con TODAS las `REVIEWS` de
// `@/data/reviews` (T1.1, ampliado a 6 en esta tarea) usando `ReviewCard`
// (TD.5) — mismos patrones de Header/Footer/SectionHeading que
// Home/About/Packages.
//
// Datos: reusa `REVIEWS` de `@/data/reviews` tal cual (NO se crea un
// segundo array paralelo) — la preview de Home (T1.1) muestra solo las 3
// primeras, esta página muestra las 6 completas.
//
// Mensajes: copy propio de esta página (eyebrow/título/intro del h1) vive
// en el grupo nuevo `messages.reviews` (packages/core `MessagesSchema`,
// T2.2) — distinto de `messages.home.reviews` (eyebrow/título de la sección
// de preview en Home, texto más corto). Nombre/país de cada review NO se
// traducen (son datos, no copy) — solo `text` es `LocalizedTextSchema`.
export default async function ReviewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
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
  const pageCopy = messages.reviews;

  return (
    <main>
      <Header
        active="reviews"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              country={review.country}
              rating={review.rating}
              text={review.text[locale]}
            />
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
