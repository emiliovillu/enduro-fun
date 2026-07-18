import { cn } from '@/lib/utils';

import { Icon } from './icon';

// Espejo: docs/design-system/components/media/MapEmbed.jsx — placeholder del
// iframe real de Google Maps. Nota de la tarea TD.3: el iframe con API key
// (PRD §9.1) se conecta en la tarea de Contact (F1), NO aquí — este
// componente es solo el placeholder visual fiel al espejo.
//
// El patrón diagonal (repeating-linear-gradient) no tiene equivalente en las
// utilidades de background de Tailwind: va por `style` inline (escape hatch
// sancionado por design-system.md §3.1 para valores no tokenizables), con los
// DOS colores inyectados vía `var(--token)` — nunca un hex crudo.
interface MapEmbedProps extends React.ComponentProps<'div'> {
  label?: string;
  compact?: boolean;
}

export function MapEmbed({
  label = 'Álora, Málaga',
  compact = false,
  className,
  style,
  ...props
}: MapEmbedProps) {
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
