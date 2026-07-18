import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/feedback/Badge.jsx — pill uppercase
// para tags (dificultad, duración de paquete, "popular"). Presentacional puro,
// sin lógica ni estado.
//
// Desviación anotada: el espejo fija font-size:12px inline; el DS no tiene un
// token de 12px exacto — se snapea a `text-caption` (13px, el token nombrado
// más próximo), igual que TD.2 hizo con Button (design-system.md §3.6).
const badgeVariants = cva(
  'font-display inline-block rounded-pill px-3 py-1.5 text-caption tracking-eyebrow',
  {
    variants: {
      tone: {
        neutral: 'bg-sand-200 text-text-primary',
        amber: 'bg-amber-500 text-charcoal-900',
        red: 'bg-accent-secondary text-white',
        dark: 'bg-charcoal-800 text-text-on-dark',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
export type { BadgeProps };
