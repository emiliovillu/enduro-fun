import Link from 'next/link';

import { cn, localeHref } from '@/lib/utils';

import { Button } from './button';
import { LanguageSwitcher, type LocaleCode } from './language-switcher';

// Espejo: docs/design-system/components/navigation/Header.jsx — logo, nav de
// 5 enlaces, LanguageSwitcher, CTA de contacto siempre visible.
//
// Desviaciones deliberadas:
// - El espejo declara `useState('open')` para un menú móvil pero nunca lo
//   renderiza (dead code del mock) — no se replica un toggle que el propio
//   DS no dibuja; el nav queda siempre visible (sin colapso responsive). Si
//   el DS define un patrón de menú móvil en el futuro, se sube ahí primero.
// - `transparent` (hero overlay) usa `bg-transparent` sin el degradado del
//   espejo (`linear-gradient(180deg, rgba(28,28,30,.55), transparent)`): ese
//   degradado no tiene token en el volcado (--gradient-scrim existe pero va
//   en dirección/opacidad distintas). Se deja sin degradado hasta que la
//   página que use `transparent` (fase F1, hero) lo necesite y el DS lo
//   tokenice — no se inventa un valor crudo.
// - hrefs de página: slugs simples (`packages`, `about`…) sin locale — se
//   prefijan con `activeLocale` al construir el nav vía `localeHref` (T1.1,
//   deuda anotada en T0.2: "404eará en cuanto F1 monte Header en páginas
//   reales"; compartido con `Footer`, code review de T1.1). Sin
//   `activeLocale`, hacen fallback a `/${slug}` (comportamiento previo) —
//   red de seguridad genérica para cualquier consumidor que no pase
//   `activeLocale`, no un camino real hoy: el único otro consumidor,
//   `/design-system` (showcase), SÍ pasa `activeLocale="en"` explícitamente
//   desde TD.1 (`app/design-system/page.tsx`), así que ese fallback no se
//   ejercita ahí.
// - labels: SIN texto fijo a nivel de módulo (2º fix de code review del
//   verifier en T1.1, mismo patrón que `subtitle`/`ctaLabel` en
//   `PackageCard`) — este componente no importa `@app/core`/i18n, así que
//   los labels ya traducidos llegan como prop `labels` (`Record<NavKey,
//   string>`) desde quien sí conoce `messages` (la página). El botón CTA
//   reutiliza `labels.contact` (mismo copy que el link de nav "Contact").
const NAV_LINKS = [
  { key: 'home', slug: '' },
  { key: 'packages', slug: 'packages' },
  { key: 'about', slug: 'about' },
  { key: 'contact', slug: 'contact' },
  { key: 'reviews', slug: 'reviews' },
] as const;

type NavKey = (typeof NAV_LINKS)[number]['key'];
type NavLabels = Record<NavKey, string>;

interface HeaderProps extends React.ComponentProps<'header'> {
  active?: NavKey;
  transparent?: boolean;
  activeLocale?: LocaleCode;
  labels: NavLabels;
}

export function Header({
  active,
  transparent = false,
  activeLocale,
  labels,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(
        'flex items-center justify-between gap-6 px-5 py-4.5 sm:px-8',
        transparent ? 'absolute inset-x-0 top-0 z-10 bg-transparent' : 'bg-bg-inverse',
        className,
      )}
      {...props}
    >
      <Link
        href={localeHref(activeLocale, '')}
        className="font-display text-h4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        EnduroFun
      </Link>

      <nav aria-label="Primary" className="flex gap-7">
        {NAV_LINKS.map(({ key, slug }) => (
          <Link
            key={key}
            href={localeHref(activeLocale, slug)}
            aria-current={key === active ? 'page' : undefined}
            className={cn(
              'font-display text-small transition-colors duration-150 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              key === active
                ? 'text-accent-amber'
                : 'text-text-on-dark-secondary hover:text-text-on-dark',
            )}
          >
            {labels[key]}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <LanguageSwitcher activeLocale={activeLocale} dark />
        {/* Link, no <a>: el CTA de contacto es navegación interna (T0.2 —
            eslint-plugin-next `no-html-link-for-pages` empezó a marcar
            hrefs de un solo segmento como este tras introducir la ruta
            dinámica `/[locale]`, que coincide en forma). */}
        <Button
          size="sm"
          variant="primary"
          render={<Link href={localeHref(activeLocale, 'contact')} />}
        >
          {labels.contact}
        </Button>
      </div>
    </header>
  );
}

export type { HeaderProps, NavKey, NavLabels };
