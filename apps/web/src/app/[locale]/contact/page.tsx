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
// DESVIACIÓN respecto al mockup, pedida por el usuario tras ver la página
// renderizada (grid de 2 columnas dejaba un hueco vertical raro porque el
// formulario y el mapa no tienen alturas comparables — a diferencia de
// about/page.tsx §"story", donde SÍ tiene sentido un grid compartido porque
// ambas columnas tienen contenido de altura similar): el formulario y el
// bloque "Find us" + mapa van en DOS SECCIONES SEPARADAS, apiladas
// verticalmente (mismo patrón de secciones independientes que el resto de
// la página), no en un grid compartido. El formulario se queda en un ancho
// contenido (`max-w-160`, igual que el párrafo de intro) en vez de ocupar
// media fila del grid.
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

      <section className="mx-auto max-w-[var(--container-max)] px-5 pb-14 sm:px-8">
        <div className="max-w-160">
          <ContactForm labels={contact.form} />
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-5 pb-24 sm:px-8">
        <div className="font-display mb-2 text-eyebrow font-semibold tracking-eyebrow text-accent-secondary uppercase">
          {contact.findUs.eyebrow}
        </div>
        <p className="mb-6 max-w-160 text-body text-text-secondary">{contact.findUs.text}</p>
        <MapEmbed label={contact.findUs.eyebrow} />
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
