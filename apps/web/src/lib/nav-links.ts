// Slugs (sin locale) del nav de 5+1 páginas, compartidos por `Header` y
// `Footer` — antes vivían duplicados en cada fichero (T1.1 code review),
// y NAV_LINKS/navKeyToSlug fueron unificados aquí (fix post-T1.4) para que
// `Footer` (Server Component) pudiera consumir `navKeyToSlug` sin
// importarlo de `header.tsx`, que lleva `'use client'`: una función
// exportada desde un módulo cliente no puede invocarse como función normal
// desde un Server Component (solo puede renderizarse como componente), y
// `next build` lo rompe en tiempo de export estático
// ("Attempted to call navKeyToSlug() from the server but ... is on the
// client"). Este módulo NO lleva `'use client'` — es lógica pura, la
// comparten ambos sin cruzar el límite servidor/cliente.
export const NAV_LINKS = [
  { key: 'home', slug: '' },
  { key: 'gallery', slug: 'gallery' },
  { key: 'packages', slug: 'packages' },
  { key: 'about', slug: 'about' },
  { key: 'contact', slug: 'contact' },
  { key: 'reviews', slug: 'reviews' },
] as const;

export type NavKey = (typeof NAV_LINKS)[number]['key'];
export type NavLabels = Record<NavKey, string>;

// Deriva el slug (sin locale) de un NavKey — usado por `Header` y `Footer`
// para que su `LanguageSwitcher` conserve la página actual al cambiar de
// idioma (fix post-T1.4, bug real encontrado por el verifier: antes cada
// link del LanguageSwitcher apuntaba siempre a la raíz del locale).
export function navKeyToSlug(active?: NavKey): string {
  return NAV_LINKS.find((link) => link.key === active)?.slug ?? '';
}
