'use client';

import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

// Gap del DS: Claude Design no definía Input (control de texto de una línea
// para el formulario de contacto de F1) — creado siguiendo las foundations
// del espejo y subido a Claude Design (components/forms/Input.*) en TD.4.
//
// Base UI trae `@base-ui/react/input` (thin wrapper sobre Field.Control,
// funciona standalone sin <Field.Root> — ver internals/FieldRootContext,
// contexto opcional con defaults no-op) así que se usa como primitiva, igual
// que Button usa ButtonPrimitive.
//
// Radio: --radius-lg (16px), NO --radius-pill — el readme del espejo es
// explícito: "cards use --radius-lg (16px), buttons/tags are full pill" — un
// input de una línea es un control de formulario, no un chip/CTA, así que
// sigue el mismo precedente que las cards (única superficie boxed existente).
// Borde: hairline `--border-subtle` (1px), foco: `--focus-ring` MISMO token
// que Button — sin outline-hidden/outline-none en la base (bug real cazado
// en TD.2: esa utilidad fija --tw-outline-style a `none` de forma
// incondicional y ninguna utilidad focus-visible:outline-* lo revierte).
// Sin gradientes (regla explícita de la tarea).
// `invalid` es el nombre del espejo (Input.jsx): se traduce a `aria-invalid`,
// el mecanismo real de estilo (`aria-invalid:border-danger` arriba) y de
// semántica de accesibilidad — un solo booleano, dos superficies.
type InputProps = InputPrimitive.Props & { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <InputPrimitive
      data-slot="input"
      aria-invalid={invalid}
      className={cn(
        'w-full rounded-lg border border-border-subtle bg-surface-card px-4 py-3 text-body text-text-primary transition-colors duration-150 ease-standard placeholder:text-text-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}

export type { InputProps };
