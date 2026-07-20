import { cn } from '@/lib/utils';

import { Icon } from './icon';

// Espejo: docs/design-system/components/media/MapEmbed.jsx — placeholder del
// iframe real de Google Maps. `interactive` (T1.3, F1) monta el iframe real
// en vez del placeholder; el showcase de `/design-system` sigue pasando
// `interactive={false}` (por defecto) a propósito — es un catálogo de
// variantes visuales, no una superficie que deba hacer una petición de red
// real a Google.
//
// Decisión T1.3 (cierra el `[verificar]` de PRD §9.1): en vez de la Maps
// Embed API oficial (que exige API key + proyecto de Google Cloud + cuenta
// de facturación activada, aunque el uso en sí sea gratuito), se usa el
// endpoint público `maps.google.com/maps?...&output=embed` — sin API key, sin
// cuota, sin proyecto de Cloud, estable desde 2014, gratis e ilimitado.
// Decisión acordada explícitamente con el usuario (no lo que preveía el PRD
// originalmente, anotado como cambio de alcance menor en el journal).
//
// El patrón diagonal del placeholder (repeating-linear-gradient) no tiene
// equivalente en las utilidades de background de Tailwind: va por `style`
// inline (escape hatch sancionado por design-system.md §3.1 para valores no
// tokenizables), con los DOS colores inyectados vía `var(--token)` — nunca un
// hex crudo.
interface MapEmbedProps extends React.ComponentProps<'div'> {
  label?: string;
  compact?: boolean;
  interactive?: boolean;
}

const MAPS_QUERY = 'Álora, Málaga, España';
const MAPS_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&z=13&output=embed`;

export function MapEmbed({
  label = 'Álora, Málaga',
  compact = false,
  interactive = false,
  className,
  style,
  ...props
}: MapEmbedProps) {
  if (interactive) {
    return (
      <div
        data-slot="map-embed"
        className={cn(
          'overflow-hidden',
          compact ? 'h-35 rounded-md' : 'h-90 rounded-lg',
          className,
        )}
        style={style}
        {...props}
      >
        <iframe
          src={MAPS_EMBED_SRC}
          title={`Google Maps — ${label}`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div
      data-slot="map-embed"
      role="img"
      aria-label={`Google Maps embed placeholder — ${label}`}
      className={cn(
        'relative overflow-hidden',
        compact ? 'h-35 rounded-md' : 'h-90 rounded-lg',
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, var(--sand-200), var(--sand-200) 10px, var(--sand-300) 10px, var(--sand-300) 20px)',
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary">
        <Icon name="map-pin" size={compact ? 22 : 32} className="text-accent-secondary" />
        {!compact ? (
          <span className="font-mono text-caption">Google Maps embed — {label}</span>
        ) : null}
      </div>
    </div>
  );
}

export type { MapEmbedProps };
