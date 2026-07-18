import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/navigation/LanguageSwitcher.jsx —
// pill de 3 vías EN/ES/DE.
//
// Desviación deliberada respecto al espejo (documentada, no silenciosa):
// el espejo modela el switcher con `onChange` (estado en memoria, SPA de
// Claude Design). Este proyecto es una web estática con i18n por RUTA
// (`/en`, `/es`, `/de` — PRD/planning): la traducción fiel NO es "misma
// página con handler", son 3 enlaces reales `<a href="/en">`. TD.3 (esta
// tarea) va ANTES de T0.2, que es quien genera esas rutas — por eso aquí
// SOLO se construyen el marcado y los hrefs correctos; la detección de
// "en qué locale estoy ahora mismo" (usePathname + resaltar el activo) es
// lógica de i18n que no existe todavía y NO se inventa: se deja como prop
// opcional `activeLocale` para que la página que sí conozca la ruta actual
// (tarea de T0.2 en adelante) la resalte sin tocar este componente.
const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
] as const;

type LocaleCode = (typeof LOCALES)[number]['code'];

interface LanguageSwitcherProps extends Omit<React.ComponentProps<'nav'>, 'aria-label'> {
  activeLocale?: LocaleCode;
  dark?: boolean;
}

export function LanguageSwitcher({
  activeLocale,
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
            href={`/${code}/`}
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
