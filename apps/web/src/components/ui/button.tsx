'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Espejo: docs/design-system/components/buttons/Button.jsx — pill CTA en
// font-display (uppercase, tracking, semibold ya resueltos por la utilidad
// .font-display de globals.css). Estado press = SOLO transform scale(.96) vía
// :active (cubre mouse/touch/teclado sobre el <button> nativo de Base UI),
// sin cambio de color (PRD/DS); hover = un tono más oscuro vía los tokens
// -hover que TD.1 volcó (accent-primary-hover/accent-secondary-hover). El
// espejo no define hover para outline/ghost (fondo transparente, sin token
// "más oscuro" equivalente para on-dark) — ghost usa el par existente
// border-subtle→border-strong como aproximación; outline se deja sin hover,
// ver nota de ambigüedad en el report de TD.2.
const buttonVariants = cva(
  // Sin outline-hidden/outline-none en base: esa utilidad fija --tw-outline-style
  // a `none` de forma incondicional (no scoped a :focus), y ninguna utilidad
  // focus-visible:outline-* la revierte a `solid` — el anillo quedaba invisible
  // SIEMPRE, no solo fuera de foco (bug real cazado por el verifier en TD.2).
  // El navegador ya no muestra el outline nativo en click de ratón (semántica
  // :focus-visible nativa sobre el <button> real de Base UI), así que no hace
  // falta suprimirlo a mano.
  'font-display inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill whitespace-nowrap transition-all duration-150 ease-standard active:scale-[.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent-primary text-white hover:bg-accent-primary-hover',
        secondary: 'bg-accent-secondary text-white hover:bg-accent-secondary-hover',
        outline: 'bg-transparent text-text-on-dark ring-2 ring-inset ring-text-on-dark',
        ghost:
          'bg-transparent text-text-primary ring-2 ring-inset ring-border-subtle hover:ring-border-strong',
      },
      size: {
        sm: 'px-4.5 py-2 text-caption',
        md: 'px-7 py-3.25 text-small',
        lg: 'px-9 py-4.25 text-body',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

// El espejo (Button.prompt.md) documenta el CTA de enlace como
// `<Button as="a" href="/contact">` (idioma genérico de Claude Design) — este
// proyecto usa Base UI, que compone polimorfismo con la prop `render`, no
// `as`/`asChild` (skill frontend, design-system.md §7.5): el mismo caso de uso
// es `<Button render={<a href="/contact" />}>Contact us</Button>`.
type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
export type { ButtonProps };
