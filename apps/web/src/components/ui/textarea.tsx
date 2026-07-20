import { cn } from '@/lib/utils';

// Gap del DS: Claude Design no definía Textarea (control multilínea para el
// mensaje del formulario de contacto de F1) — creado siguiendo las
// foundations del espejo y subido a Claude Design (components/forms/Textarea.*)
// en TD.4.
//
// Base UI NO trae primitiva de Textarea (solo Input, que envuelve Field.Control
// con tagName 'input' fijo) — `<textarea>` nativo estilado es el camino
// sancionado por components.md §3 ("Base UI no cubre todos los controles").
//
// Mismo tratamiento visual que Input (mismo radio --radius-lg, mismo hairline
// --border-subtle, mismo --focus-ring) para que ambos controles de formulario
// lean como un único sistema — ver input.tsx para el razonamiento del radio.
// `invalid` es el nombre del espejo (Textarea.jsx): se traduce a `aria-invalid`
// (mecanismo de estilo y de accesibilidad), igual que en Input.
type TextareaProps = React.ComponentProps<'textarea'> & { invalid?: boolean };

export function Textarea({ className, rows = 4, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      aria-invalid={invalid}
      className={cn(
        'w-full resize-y rounded-lg border border-border-subtle bg-surface-card px-4 py-3 text-body text-text-primary transition-colors duration-150 ease-standard placeholder:text-text-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  );
}

export type { TextareaProps };
