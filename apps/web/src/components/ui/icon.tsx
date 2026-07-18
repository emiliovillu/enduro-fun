import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/media/Icon.jsx — set mínimo de glifos
// inline estilo Lucide (stroke 1.8, cabos redondeados), sustituye a
// lucide-react (retirada en TD.2, planning exige "sin librería de iconos").
// Los `d` de cada path se listan como array (uno por sub-trazo) en vez del
// truco `.split(' M')` del espejo — mismo resultado visual, sin parsing
// frágil de string en runtime.
const ICON_PATHS = {
  mail: ['M4 4h16v16H4z', 'M22 6l-10 7L2 6'],
  'map-pin': [
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z',
    'M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  instagram: [
    'M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z',
    'M16.5 7.5h.01',
    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  ],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  globe: [
    'M2 12h20',
    'M12 2a15 15 0 0 1 0 20',
    'M12 2a15 15 0 0 0 0 20',
    'M2 12a10 10 0 0 1 20 0 10 10 0 0 1-20 0',
  ],
  chevronDown: ['M6 9l6 6 6-6'],
  bike: [
    'M5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', // rueda trasera
    'M18 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', // rueda delantera (ligeramente menor)
    'M3 14l5-1 2 3 3-2 3-1 2 3.5', // perfil superior: asiento → muesca → depósito → carenado del faro → horquilla delantera
    'M6 17h8', // carril bajo (motor/chasis), separado del perfil superior — da masa, evita que se lea como bici de líneas finas
    'M16 13v-2M14 11h4', // vástago corto desde la pipa de dirección + manillar horizontal (TD.10: separa visualmente el manillar del chasis, sin volver al vástago largo de la 1ª iteración de TD.9 que leía como patinete)
  ],
  phone: ['M4 5c0 8.5 6.5 15 15 15l3-4-5-3-2 2c-2-1-4.5-3.5-5.5-5.5l2-2-3-5z'],
} as const;

type IconName = keyof typeof ICON_PATHS;

interface IconProps extends Omit<React.ComponentProps<'svg'>, 'name'> {
  name: IconName;
  size?: number;
}

// Icono decorativo por defecto (aria-hidden) — cuando acompaña texto visible
// (nav, footer, MapEmbed) el texto ya da el accessible name. Si se usa
// icon-only, el caller pasa `aria-label` y el icono conmuta a role="img"
// (norma de a11y de components.md §5: aria-label en todo botón icon-only).
export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
  'aria-label': ariaLabel,
  ...props
}: IconProps) {
  return (
    <svg
      data-slot="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export type { IconName, IconProps };
