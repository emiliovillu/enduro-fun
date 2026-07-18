import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/cards/SectionHeading.jsx — eyebrow
// rojo condensado + título uppercase, forma estándar en que cada sección de
// contenido del sitio se presenta. Presentacional puro, props planas
// (eyebrow/title/align/light) — sin dominio, sin importar de `@app/core`.
//
// `light` (fondo oscuro): el espejo pone `color:'#fff'` inline crudo — se
// traduce al token semántico ya existente para texto claro sobre oscuro,
// `text-text-on-dark` (mismo criterio de traducción hex→token de TD.1/TD.2,
// nunca se copia el hex literal).
interface SectionHeadingProps extends React.ComponentProps<'div'> {
  eyebrow?: string;
  title: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export function SectionHeading({
  className,
  eyebrow,
  title,
  align = 'left',
  light = false,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn(align === 'center' ? 'mx-auto max-w-xl text-center' : 'text-left', className)}
      {...props}
    >
      {eyebrow ? (
        <div className="font-display mb-2 text-eyebrow font-semibold tracking-eyebrow text-accent-secondary uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h2 className={cn('m-0 text-display-md', light ? 'text-text-on-dark' : 'text-text-primary')}>
        {title}
      </h2>
    </div>
  );
}

export type { SectionHeadingProps };
