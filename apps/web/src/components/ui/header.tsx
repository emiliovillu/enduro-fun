'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';

import { cn, localeHref } from '@/lib/utils';

import { Button } from './button';
import { Icon } from './icon';
import { LanguageSwitcher, type LocaleCode } from './language-switcher';

// Espejo: docs/design-system/components/navigation/Header.jsx — logo, nav de
// 5 enlaces, LanguageSwitcher, CTA de contacto siempre visible.
//
// Desviaciones deliberadas:
// - El espejo declara `useState('open')` para un menú móvil pero nunca lo
//   renderiza (dead code del mock) — la 1ª versión de este componente (TD.3)
//   no replicaba ese toggle porque el propio DS no lo dibujaba. **Hotfix
//   2026-07-20**: el usuario reportó que en mobile el nav de 5 enlaces se
//   desbordaba/partía en dos líneas (captura real) — se implementó el menú
//   hamburguesa que el mock ya insinuaba, con los iconos `menu`/`x` que ya
//   existían en el registro. Por debajo de `lg` (1024px) el nav/switcher/CTA
//   colapsan detrás de un botón; a partir de `lg` el layout previo (todo en
//   una fila) se mantiene sin cambios.
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
  menuOpenLabel: string;
  menuCloseLabel: string;
}

export function Header({
  active,
  transparent = false,
  activeLocale,
  labels,
  menuOpenLabel,
  menuCloseLabel,
  className,
  ...props
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Cierra el panel con Escape (el botón hamburguesa ya lo cierra con su
  // propio toggle) — sin esto, un usuario de teclado que abre el menú no
  // tiene forma rápida de salir sin volver a tabular hasta el botón.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header
      data-slot="header"
      className={cn(
        'flex items-center justify-between gap-6 px-5 py-4.5 sm:px-8',
        // El panel móvil (`absolute top-full`) se posiciona respecto al
        // header: la variante `transparent` ya es `absolute` (contexto de
        // posicionamiento propio); la variante normal no tenía ningún
        // `position`, así que necesita `relative` explícito o el panel se
        // habría posicionado respecto al siguiente ancestro posicionado
        // (probablemente `<body>`), no respecto al header. Nunca las dos
        // clases (`relative`+`absolute`) a la vez — orden de cascada
        // impredecible entre utilidades de la misma capa.
        transparent ? 'absolute inset-x-0 top-0 z-10 bg-transparent' : 'relative bg-bg-inverse',
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

      {/* >= lg: el layout original en una sola fila, sin cambios. < lg: nav
          + LanguageSwitcher + CTA colapsan detrás del botón hamburguesa
          (hotfix 2026-07-20 — desbordaba/partía en dos líneas en mobile). */}
      <nav aria-label="Primary" className="hidden gap-7 lg:flex">
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

      <div className="hidden items-center gap-4 lg:flex">
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

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
        }}
        aria-label={open ? menuCloseLabel : menuOpenLabel}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex size-10 shrink-0 items-center justify-center text-white lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <Icon name={open ? 'x' : 'menu'} size={24} />
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full flex flex-col gap-6 bg-bg-inverse px-5 py-6 lg:hidden"
        >
          <nav aria-label="Primary" className="flex flex-col gap-5">
            {NAV_LINKS.map(({ key, slug }) => (
              <Link
                key={key}
                href={localeHref(activeLocale, slug)}
                aria-current={key === active ? 'page' : undefined}
                onClick={() => {
                  setOpen(false);
                }}
                className={cn(
                  'font-display text-body transition-colors duration-150 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                  key === active
                    ? 'text-accent-amber'
                    : 'text-text-on-dark-secondary hover:text-text-on-dark',
                )}
              >
                {labels[key]}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-4">
            <LanguageSwitcher activeLocale={activeLocale} dark />
            <Button
              size="sm"
              variant="primary"
              render={<Link href={localeHref(activeLocale, 'contact')} />}
              onClick={() => {
                setOpen(false);
              }}
            >
              {labels.contact}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export type { HeaderProps, NavKey, NavLabels };
