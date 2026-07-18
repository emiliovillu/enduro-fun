import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/cards/PackageCard.jsx — tarjeta de
// precio para un paquete de enduro de varios días. Presentacional puro: props
// planas (nombre/noches/días/precio/features), PROHIBIDO importar tipos de
// `@app/core` (regla de dependencia de components.md §2 — `ui/` no conoce
// dominio; el día que exista un dominio `packages/` un wrapper ahí traduce el
// contrato Zod a estas props planas, no al revés).
//
// `imageSlot` (espejo: string CSS `background`, p.ej. una URL `url(...)` o un
// color) llega tal cual como valor runtime/no-tokenizable del caller: caso
// canónico del escape hatch de design-system.md §3 — va por `style` inline
// (`background`), con el degradado de fallback (sin `imageSlot`) SIEMPRE
// tokenizado vía clases Tailwind (`from-charcoal-700 to-charcoal-900`, los
// mismos tokens de color que el espejo usa en su gradiente inline).
//
// Precio: el espejo fija `fontSize:28px` inline sin token propio — se snapea
// a `text-display-md` (clamp que arranca en 1.75rem = 28px), mismo criterio
// que TD.2 con Badge/text-caption (design-system.md §3.6).
interface PackageCardProps extends React.ComponentProps<'div'> {
  name: string;
  nights: number;
  days: number;
  price: string;
  features?: string[];
  highlight?: string;
  imageSlot?: string;
}

export function PackageCard({
  className,
  name,
  nights,
  days,
  price,
  features = [],
  highlight,
  imageSlot,
  ...props
}: PackageCardProps) {
  return (
    <div
      data-slot="package-card"
      className={cn(
        'relative flex flex-col overflow-hidden rounded-lg bg-surface-card shadow-md',
        className,
      )}
      {...props}
    >
      {highlight ? (
        <div className="absolute top-4 right-4 z-10">
          <Badge tone="red">{highlight}</Badge>
        </div>
      ) : null}
      <div
        className="flex h-45 items-end bg-linear-to-br from-charcoal-700 to-charcoal-900 p-4"
        style={imageSlot ? { background: imageSlot } : undefined}
      >
        <span className="font-mono text-caption text-text-on-dark-secondary">
          {nights} nights · {days} route days
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <h3 className="m-0 text-h3">{name}</h3>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-small text-text-secondary">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-accent-primary" aria-hidden="true">
                —
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-2">
          <span className="font-display text-display-md text-accent-secondary">{price}</span>
          <Button size="sm" variant="primary">
            Enquire
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { PackageCardProps };
