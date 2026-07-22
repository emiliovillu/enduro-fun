import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/cards/FleetCard.jsx — card de una
// moto de la flota. Mismo lenguaje visual que `PackageCard` (caja de foto
// arriba con degradado tokenizado + bloque de texto abajo), simplificada: sin
// precio, sin lista de features, sin CTA (ver FleetCard.prompt.md del
// espejo). Presentacional puro: props planas, PROHIBIDO importar tipos de
// `@app/core` (regla de dependencia de components.md §2 — `ui/` no conoce
// dominio; el wrapper de dominio que traduce `FleetBike` a estas props vive
// en la página, no aquí).
//
// Deviación deliberada de components.md §2 ("promoción a `ui/` exige ≥2
// dominios consumidores"): `FleetCard` tiene hoy un solo consumidor (About,
// TD.12) — se promueve igualmente porque el usuario pidió explícitamente que
// pasara por el flujo de actualización del design system (mismo patrón ya
// usado en TD.11 con `Lightbox`), no una reinterpretación silenciosa de la
// regla — ver planning.md TD.12 y el journal de la misma fecha.
//
// `imageSlot` (espejo: string CSS `background`) mismo escape hatch que
// `PackageCard` (design-system.md §3.1) — degradado de fallback SIEMPRE
// tokenizado (`from-charcoal-700 to-charcoal-900`).
//
// `categoryLabel` (espejo: prop `categoryLabel`, pasada YA traducida por el
// caller) usa `Badge tone="neutral"` — el espejo lo aclara explícitamente en
// su `.prompt.md`: es una etiqueta de taxonomía ("Enduro"/"Trail &
// Adventure"), no un flag promocional, así que NO usa `tone="red"` como el
// `highlight` de `PackageCard`.
interface FleetCardProps extends React.ComponentProps<'div'> {
  name: string;
  displacementCc: number;
  categoryLabel: string;
  description: string;
  imageSlot?: string;
}

export function FleetCard({
  className,
  name,
  displacementCc,
  categoryLabel,
  description,
  imageSlot,
  ...props
}: FleetCardProps) {
  return (
    <div
      data-slot="fleet-card"
      className={cn(
        'relative flex flex-col overflow-hidden rounded-lg bg-surface-card shadow-md',
        className,
      )}
      {...props}
    >
      <div className="absolute top-4 right-4 z-10">
        <Badge tone="neutral">{categoryLabel}</Badge>
      </div>
      <div
        className="flex h-45 items-end bg-linear-to-br from-charcoal-700 to-charcoal-900 p-4"
        style={imageSlot ? { background: imageSlot } : undefined}
      >
        <span className="font-mono text-caption text-text-on-dark-secondary">
          {displacementCc}cc
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="m-0 text-h3">{name}</h3>
        <p className="m-0 text-small text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export type { FleetCardProps };
