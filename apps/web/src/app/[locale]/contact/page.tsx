import type { Locale } from '@app/core/contracts';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { MapEmbed } from '@/components/ui/map-embed';
import { SectionHeading } from '@/components/ui/section-heading';
import { getMessages } from '@/i18n/messages';

import { ContactForm } from './contact-form';

// T1.3 (F1, Página Contact). Mockup original acordado con el usuario:
// `docs/mockups/contact.html` (layout grid de 2 columnas — formulario a la
// izquierda, "Find us" + mapa a la derecha; intro arriba a ancho completo),
// mismos patrones que About (T1.2): Header/Footer reciben `labels` ya
// traducidos, copy real en `messages.contact`, nunca hardcodeado.
//
// El formulario y el bloque "Find us" + mapa van en un grid de 2 columnas
// (`lg:grid-cols-2`), fiel al mockup — el usuario pidió volver a este layout
// tras una iteración intermedia que los apilaba en secciones separadas.
// `items-start` evita que el mapa (más alto que el formulario en la mayoría
// de idiomas) fuerce un estirado raro de la columna del formulario.
//
// DESVIACIÓN DELIBERADA acordada con el usuario para esta tarea (ver
// journal del dev-loop y report de T1.3): Google Maps real diferido — el
// usuario todavía no tiene la API key de Google Cloud (Maps Embed API). Se
// usa `MapEmbed` (TD.3, placeholder visual) TAL CUAL, sin modificar — el
// `[verificar]` de coste/condiciones de Maps Embed API (PRD §9.1) queda SIN
// CERRAR. El endpoint de Formspree, en cambio, ya es el real (claim
// completado por el usuario) — ver `contact-form.tsx`.
export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);
  const navLabels = {
    home: messages.nav.home,
    packages: messages.nav.packages,
    about: messages.nav.about,
    contact: messages.nav.contact,
    reviews: messages.nav.reviews,
  };
  const { contact } = messages;

  return (
    <main>
      <Header
        active="contact"
        activeLocale={locale}
        labels={navLabels}
        menuOpenLabel={messages.nav.menuOpen}
        menuCloseLabel={messages.nav.menuClose}
      />

      <section className="mx-auto max-w-[var(--container-max)] px-5 py-24 sm:px-8">
        <SectionHeading as="h1" size="lg" eyebrow={contact.eyebrow} title={contact.title} />
        <p className="mt-5 max-w-160 text-lead text-text-secondary">{contact.intro}</p>
      </section>

      <section className="mx-auto grid max-w-[var(--container-max)] items-start gap-14 px-5 pb-24 sm:px-8 lg:grid-cols-2">
        <ContactForm labels={contact.form} />
        <div>
          <div className="font-display mb-2 text-eyebrow font-semibold tracking-eyebrow text-accent-secondary uppercase">
            {contact.findUs.eyebrow}
          </div>
          <p className="mb-6 text-body text-text-secondary">{contact.findUs.text}</p>
          <MapEmbed label={contact.findUs.eyebrow} />
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
