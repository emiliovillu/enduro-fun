import Link from 'next/link';

import { cn, localeHref } from '@/lib/utils';

import { Icon } from './icon';
import type { NavLabels } from './header';
import { LanguageSwitcher, type LocaleCode } from './language-switcher';

// Espejo: docs/design-system/components/navigation/Footer.jsx — blurb de
// marca, columnas de enlaces, Instagram, LanguageSwitcher, copyright.
//
// Los títulos de columna ("Explore", "Company", "Follow") van en `<p>`, no en
// heading real (`<h3>`): son etiquetas de columna repetidas en TODAS las
// páginas, no estructura de documento — un `<h3>` de footer sin `<h2>` previo
// en cada página rompería la jerarquía de headings (components.md §5). Las
// listas de enlaces usan `<ul>/<li>` reales.
//
// slugs sin locale (mismo mecanismo y mismo motivo que `Header`, T1.1: se
// prefijan con `activeLocale` al construir cada columna vía `localeHref`,
// compartido con `Header` desde `@/lib/utils` — code review de T1.1; `null`
// → sin prefijar, para no romper el fallback del showcase de
// `/design-system`).
//
// labels/columnLabels/brandBlurb: SIN texto fijo a nivel de módulo (2º fix de
// code review del verifier en T1.1, mismo patrón que `Header`) — este
// componente no importa `@app/core`/i18n, así que todo el texto ya traducido
// llega como props desde quien sí conoce `messages` (la página). `labels`
// reutiliza el mismo tipo `NavLabels` que `Header` (mismas claves
// home/packages/about/contact/reviews) porque las columnas del footer
// enlazan a las mismas páginas con el mismo copy.
const EXPLORE_LINKS = [
  { key: 'home', slug: '' },
  { key: 'packages', slug: 'packages' },
  { key: 'about', slug: 'about' },
  { key: 'reviews', slug: 'reviews' },
] as const;

const COMPANY_LINKS = [
  { key: 'contact' as const, slug: 'contact' },
  { label: 'info@endurofun.eu', href: 'mailto:info@endurofun.eu' },
] as const;

interface FooterProps extends React.ComponentProps<'footer'> {
  activeLocale?: LocaleCode;
  labels: NavLabels;
  columnLabels: { explore: string; company: string; follow: string };
  brandBlurb: string;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="font-display mb-3.5 text-caption tracking-eyebrow text-white">{title}</p>
      <ul className="flex flex-col gap-2.5 text-small">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-text-on-dark-secondary transition-colors duration-150 ease-standard hover:text-text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({
  activeLocale,
  labels,
  columnLabels,
  brandBlurb,
  className,
  ...props
}: FooterProps) {
  const exploreLinks = EXPLORE_LINKS.map((link) => ({
    label: labels[link.key],
    href: localeHref(activeLocale, link.slug),
  }));
  const companyLinks = COMPANY_LINKS.map((link) =>
    'slug' in link ? { label: labels[link.key], href: localeHref(activeLocale, link.slug) } : link,
  );

  return (
    <footer
      data-slot="footer"
      className={cn('bg-bg-inverse px-5 pt-14 pb-7 text-text-on-dark-secondary sm:px-8', className)}
      {...props}
    >
      <div className="mx-auto flex max-w-[var(--container-max)] flex-wrap justify-between gap-12">
        <div className="max-w-70">
          <p className="font-display mb-2.5 text-h4 text-white">EnduroFun</p>
          <p className="text-small">{brandBlurb}</p>
        </div>

        <FooterColumn title={columnLabels.explore} links={exploreLinks} />
        <FooterColumn title={columnLabels.company} links={companyLinks} />

        <div>
          <p className="font-display mb-3.5 text-caption tracking-eyebrow text-white">
            {columnLabels.follow}
          </p>
          <a
            href="https://www.instagram.com/endurofun_oficial"
            className="flex items-center gap-2 text-small text-text-on-dark-secondary transition-colors duration-150 ease-standard hover:text-text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Icon name="instagram" size={18} />
            @endurofun_oficial
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[var(--container-max)] flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <span className="text-caption">© 2026 EnduroFun. Álora, Málaga.</span>
        <LanguageSwitcher activeLocale={activeLocale} dark />
      </div>
    </footer>
  );
}

export type { FooterProps };
