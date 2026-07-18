import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Icon } from './icon';
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
// - hrefs de página son slugs simples (`/`, `/packages`…) sin locale: la
//   estructura de rutas real (`/en/packages`) la construye T0.2.
const NAV_LINKS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'packages', label: 'Packages', href: '/packages' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'contact', label: 'Contact', href: '/contact' },
  { key: 'reviews', label: 'Reviews', href: '/reviews' },
] as const;

type NavKey = (typeof NAV_LINKS)[number]['key'];

interface HeaderProps extends React.ComponentProps<'header'> {
  active?: NavKey;
  transparent?: boolean;
  activeLocale?: LocaleCode;
}

export function Header({
  active,
  transparent = false,
  activeLocale,
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
        href="/"
        className="font-display flex items-center gap-2.5 text-h4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <Icon name="bike" size={26} className="text-accent-primary" />
        EnduroFun
      </Link>

      <nav aria-label="Primary" className="flex gap-7">
        {NAV_LINKS.map(({ key, label, href }) => (
          <Link
            key={key}
            href={href}
            aria-current={key === active ? 'page' : undefined}
            className={cn(
              'font-display text-small transition-colors duration-150 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              key === active
                ? 'text-accent-amber'
                : 'text-text-on-dark-secondary hover:text-text-on-dark',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <LanguageSwitcher activeLocale={activeLocale} dark />
        <Button size="sm" variant="primary" render={<a href="/contact" />}>
          Contact
        </Button>
      </div>
    </header>
  );
}

export type { HeaderProps, NavKey };
