'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
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
//   una fila) se mantiene sin cambios. **2ª iteración, mismo día**: a
//   petición del usuario, el panel pasa de dropdown (`top-full`) a un drawer
//   que entra deslizando desde el borde derecho (`translate-x`, con
//   backdrop). El panel y el backdrop están SIEMPRE montados (nunca
//   `{open && <div>}`) — si se desmontan al cerrar, la transición de salida
//   nunca llega a pintarse (React quita el nodo del DOM en el mismo tick).
//   Visibilidad/interactividad cuando está cerrado se controla con
//   `invisible`+`pointer-events-none`, no con desmontar.
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
// - Icono de marca junto al wordmark (hotfix, petición directa del usuario
//   tras ver el favicon nuevo — "me ha gustado mucho, ponlo justo después
//   del texto EnduroFun"): `public/brand-mark.png`, el mismo mark del
//   casco/bandera recortado del logo provisto que ya usa el favicon
//   (`apps/web/src/app/icon.png`) — un recorte cuadrado a 128px para que se
//   vea nítido a los ~28px que ocupa aquí, no el fichero de favicon en sí
//   (ese es un archivo especial de convención de Next, no pensado para
//   reusarse como `<img>` normal). `alt=""` + `aria-hidden`: el nombre
//   "EnduroFun" ya está en el texto adyacente, el icono es puramente
//   decorativo (evita que un lector de pantalla anuncie el link dos veces).
const NAV_LINKS = [
  { key: 'home', slug: '' },
  { key: 'gallery', slug: 'gallery' },
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
        // z-50: por encima del drawer/backdrop (z-40, ver más abajo) — el
        // botón hamburguesa vive en el header y debe quedar SIEMPRE
        // clickable/visible por encima del backdrop mientras el drawer está
        // abierto, en vez de que el backdrop (a pantalla completa) le robe
        // los clicks. `relative` solo en la variante NO transparente —
        // `transparent` ya es `absolute` (su propio contexto de
        // posicionamiento); nunca las dos a la vez, cascada impredecible
        // entre utilidades `position` de la misma capa.
        'z-50 flex items-center justify-between gap-6 px-5 py-4.5 sm:px-8',
        transparent ? 'absolute inset-x-0 top-0 bg-transparent' : 'relative bg-bg-inverse',
        className,
      )}
      {...props}
    >
      <Link
        href={localeHref(activeLocale, '')}
        className="font-display inline-flex items-center gap-2 text-h4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        EnduroFun
        <Image src="/brand-mark.png" alt="" width={28} height={28} aria-hidden="true" />
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
        // `relative z-50`: bug real encontrado al verificar visualmente —
        // un elemento SIN `position` (este botón, `static` por defecto)
        // siempre pinta por DEBAJO de cualquier descendiente posicionado
        // con z-index dentro del mismo contexto de apilamiento (el drawer,
        // `fixed z-40`), sin importar el z-index del propio `<header>`
        // (z-50): ese z-50 solo compite con los HERMANOS del header, no
        // gobierna el orden ENTRE los hijos del header. El botón necesita
        // su propio `position`+z-index para competir con el drawer.
        className="relative z-50 flex size-10 shrink-0 items-center justify-center text-white lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <Icon name={open ? 'x' : 'menu'} size={24} />
      </button>

      {/* Backdrop + drawer SIEMPRE montados (nunca `{open && …}`) — con
          `transition-*` + clases condicionales, desmontar el nodo en el
          mismo render que lo cierra le quita a React la oportunidad de
          pintar el frame de partida de la transición de salida (no hay
          "antes" desde el que animar si el nodo ya no existe). `invisible`
          además de `opacity-0`/`translate-x-full` para que, cerrado, ni
          ocupe la mira del ratón ni sea alcanzable por Tab. */}
      <div
        aria-hidden={!open}
        onClick={() => {
          setOpen(false);
        }}
        className={cn(
          'fixed inset-0 z-40 bg-charcoal-900/60 transition-opacity duration-300 ease-standard lg:hidden',
          open ? 'opacity-100' : 'invisible opacity-0',
        )}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={menuOpenLabel}
        aria-hidden={!open}
        className={cn(
          // `w-full max-w-75` en vez de un ancho fijo con `max-w-[85vw]`
          // (arbitrario crudo, prohibido — TD.6 §3.1): en viewports más
          // estrechos que 300px el drawer ocupa el 100% sin desbordar,
          // en el resto se asienta en 300px.
          'fixed inset-y-0 right-0 z-40 flex w-full max-w-75 flex-col gap-8 bg-bg-inverse px-6 py-24 shadow-lg transition-transform duration-300 ease-standard lg:hidden',
          open ? 'translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <nav aria-label="Primary" className="flex flex-col gap-6">
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
    </header>
  );
}

export type { HeaderProps, NavKey, NavLabels };
