import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/cards/ReviewCard.jsx — tarjeta de
// testimonio (Home destacados + página Reviews). Presentacional puro, props
// planas (nombre/país/rating/texto) — sin importar tipos de `@app/core`
// (components.md §2, misma regla que PackageCard).
//
// Rating: el espejo renderiza estrellas Unicode literales (`★`.repeat(rating)
// + `☆`.repeat(5-rating)), NO un Icon del registro (icon.tsx no tiene glifo
// de estrella) — se preserva el mecanismo del espejo tal cual, coloreado con
// el token `amber-500` (mismo que usa el DS: `--amber-500`, clase Tailwind
// `text-amber-500`). Componente custom sin semántica nativa de "rating" →
// `role="img"` + `aria-label` con el valor exacto en el contenedor
// (components.md §5/§6: "los componentes custom sin semántica de serie
// reciben role y aria-label explícitos"); los glifos visuales van
// `aria-hidden` dentro.
interface ReviewCardProps extends React.ComponentProps<'div'> {
  name: string;
  country: string;
  rating?: number;
  text: string;
}

export function ReviewCard({
  className,
  name,
  country,
  rating = 5,
  text,
  ...props
}: ReviewCardProps) {
  // Acota a [0, 5]: `.repeat()` lanza RangeError con un conteo negativo, así
  // que un `rating` fuera de rango (dato malo, no algo que el tipo impida)
  // rompería el render en vez de degradar visualmente.
  const filledStars = Math.min(5, Math.max(0, rating));
  return (
    <div
      data-slot="review-card"
      className={cn('flex flex-col gap-3 rounded-lg bg-surface-card p-6 shadow-sm', className)}
      {...props}
    >
      <div
        role="img"
        aria-label={`${String(filledStars)} out of 5 stars`}
        className="text-body tracking-widest text-amber-500"
      >
        <span aria-hidden="true">
          {'★'.repeat(filledStars)}
          {'☆'.repeat(5 - filledStars)}
        </span>
      </div>
      <p className="m-0 text-body leading-body text-text-primary">&ldquo;{text}&rdquo;</p>
      <div className="mt-auto flex items-center gap-2.5">
        <div className="size-9 shrink-0 rounded-full bg-gradient-sunset" aria-hidden="true" />
        <div>
          <div className="text-small font-semibold">{name}</div>
          <div className="text-caption text-text-secondary">{country}</div>
        </div>
      </div>
    </div>
  );
}

export type { ReviewCardProps };
