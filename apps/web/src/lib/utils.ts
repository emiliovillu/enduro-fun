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
