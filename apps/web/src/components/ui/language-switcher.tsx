import { cn, localeHref } from '@/lib/utils';

// Espejo: docs/design-system/components/navigation/LanguageSwitcher.jsx —
// pill de 3 vías EN/ES/DE.
//
// Desviación deliberada respecto al espejo (documentada, no silenciosa):
// el espejo modela el switcher con `onChange` (estado en memoria, SPA de
// Claude Design). Este proyecto es una web estática con i18n por RUTA
// (`/en`, `/es`, `/de` — PRD/planning): la traducción fiel NO es "misma
// página con handler", son 3 enlaces reales `<a href="/en">`.
//
// **Fix post-T1.4 (bug real encontrado por el verifier al cerrar el E2E de
// F1)**: cada link apuntaba SIEMPRE a la raíz del locale (`/${code}/`),
// ignorando en qué página estaba el usuario — cambiar de idioma desde
// `/en/about/` aterrizaba en `/es/` (Home) en vez de `/es/about/`. La
// detección de "en qué página estoy" YA EXISTE (a diferencia de lo que
// documentaba una versión anterior de este comentario): `Header`/`Footer`
// conocen su página vía la prop `active`/`NavKey` y ahora la bajan hasta
// aquí como `currentSlug`, que se usa con `localeHref` (mismo helper que ya
// usan `Header`/`Footer` para su propio nav) para construir el href
// correcto por locale. Sin `currentSlug` (showcase de `/design-system`),
// cae a la raíz del locale — mismo comportamiento previo.
const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

interface LanguageSwitcherProps extends Omit<React.ComponentProps<'nav'>, 'aria-label'> {
  activeLocale?: LocaleCode;
  /** Slug de la página actual (sin locale), p. ej. `"about"`. Vacío/`undefined` = raíz. */
  currentSlug?: string;
  dark?: boolean;
}

export function LanguageSwitcher({
  activeLocale,
  currentSlug = '',
  dark = false,
  className,
  ...props
}: LanguageSwitcherProps) {
  return (
    <nav
      aria-label="Language"
      data-slot="language-switcher"
      className={cn(
        'inline-flex gap-0.5 rounded-pill p-0.75',
        dark ? 'bg-white/8' : 'bg-sand-200',
        className,
      )}
      {...props}
    >
      {LOCALES.map(({ code, label }) => {
        const isActive = code === activeLocale;
        return (
          <a
            key={code}
            // Barra final obligatoria — coherente con `trailingSlash: true`
            // en next.config.ts (T0.2): el export estático escribe
            // `out/<locale>/index.html`, y sin barra final un host sin
            // servidor (Cloudflare Pages) puede no garantizar el 301
            // implícito `/en` → `/en/`, dando 404 en producción real.
            href={localeHref(code, currentSlug)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'font-display rounded-pill px-3 py-1.5 text-caption transition-colors duration-150 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              isActive
                ? // TD.8: texto oscuro sobre accent-primary (mismo fix que Button
                  // primary) — text-white daba 2.92:1, text-text-primary da 5.82:1.
                  'bg-accent-primary text-text-primary'
                : dark
                  ? 'text-text-on-dark-secondary hover:text-text-on-dark'
                  : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}

export type { LanguageSwitcherProps, LocaleCode };
