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
  // `as` (T1.2, About): por defecto `h2` — el uso previsto es encabezar UNA
  // sección dentro de una página que ya tiene su propio `<h1>` (Home: título
  // del hero, fuera de este componente). About reutiliza este mismo patrón
  // visual (eyebrow + título) para el título DE PÁGINA (el único `<h1>` de
  // `/about`), así que necesita emitir `h1` en vez de `h2` sin duplicar el
  // marcado del eyebrow a mano — jerarquía de headings real (components.md
  // §5), no solo estilo.
  as?: 'h1' | 'h2';
  // `size` (T1.2, About): mockup de About (`docs/mockups/about.html`,
  // `.intro h1`) usa `--fs-display-lg` para el único h1 de página, un peldaño
  // por encima de `--fs-display-md` que usan el resto de secciones (`h2`) —
  // mismo componente, tamaño distinto según si titula la página entera o una
  // sección dentro de ella. Por defecto `md` preserva el tamaño existente de
  // todos los consumidores actuales (Home).
  size?: 'md' | 'lg';
}

export function SectionHeading({
  className,
  eyebrow,
  title,
  align = 'left',
  light = false,
  as: Heading = 'h2',
  size = 'md',
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
      <Heading
        className={cn(
          'm-0',
          size === 'lg' ? 'text-display-lg' : 'text-display-md',
          light ? 'text-text-on-dark' : 'text-text-primary',
        )}
      >
        {title}
      </Heading>
    </div>
  );
}

export type { SectionHeadingProps };
