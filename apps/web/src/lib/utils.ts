import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// La escala tipográfica del DS (globals.css @theme inline: --text-display-xl,
// --text-body, --text-caption…) no encaja en los nombres por defecto de
// Tailwind (xs/sm/base/lg…), así que tailwind-merge la clasifica por defecto
// como si fuera un valor de color (mismo prefijo `text-`) y descarta la clase
// de color de texto que la precede en la misma cadena — bug real cazado en
// TD.2 (verifier): `text-white text-caption` colapsaba a solo `text-caption`.
// Registrar la escala como su propio grupo `font-size` separa ambos conflictos.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-xl',
        'display-lg',
        'display-md',
        'h3',
        'h4',
        'lead',
        'body',
        'small',
        'caption',
        'eyebrow',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Construye un href interno con locale + trailing slash obligatorio
// (`trailingSlash: true` en next.config.ts escribe `out/<locale>/<slug>/
// index.html` — sin la barra, un host sin servidor como Cloudflare Pages
// puede 404 en vez de redirigir). `slug` vacío → raíz del locale. Sin
// `activeLocale` (undefined) → sin prefijar, red de seguridad genérica para
// cualquier consumidor que no lo pase (hoy: solo el showcase
// `/design-system`, que SÍ pasa `activeLocale` explícito — ver Header y
// Footer). Compartido por `Header` y `Footer` (T1.1 code review: ambos
// reimplementaban la misma lógica de una línea de forma idéntica).
export function localeHref(activeLocale: string | undefined, slug: string): string {
  const prefix = activeLocale ? `/${activeLocale}` : '';
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}
