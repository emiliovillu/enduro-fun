'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import Image from 'next/image';

import { Icon } from './icon';

// Espejo: docs/design-system/components/media/Lightbox.jsx — gap del DS
// original (TD.11, petición directa del usuario sobre la Gallery cerrada con
// fotos reales): visor a pantalla completa con overlay/scrim detrás, imagen
// centrada y ampliada respetando su proporción (object-contain, NUNCA
// object-cover como las miniaturas del grid).
//
// components/ui/ (no local a gallery-grid.tsx): es un patrón de DS agnóstico
// de dominio (props planas: src/alt/open/onOpenChange), exactamente el
// criterio de components.md §2 para vivir en el espejo del inventario — un
// futuro carrusel/lightbox de otra página (p. ej. el `HomePhotoCarousel` de
// T1.5, hoy sin lightbox) es un consumidor previsible sin cambiar ni una
// prop. Un componente local solo se justifica cuando NINGÚN otro dominio
// podría reusarlo sin tipos propios — no es el caso aquí.
//
// `@base-ui/react/dialog` en vez de HTML crudo con <dialog>: la primitiva
// (Root/Portal/Backdrop/Popup/Close) ya trae portal, focus-trap, cierre con
// Escape y devolución de foco al trigger — mismo paquete que Button/Input ya
// importan (sin dependencia nueva). Trampa real de a11y de Base UI
// (components.md §3, punto 1 — "una primitiva puede NO cablear role/aria por
// sí sola"): inspeccionado el código fuente del paquete
// (`@base-ui/react/dialog/popup/DialogPopup.js`), `DialogPopup` fija
// `role="dialog"` desde su store pero NUNCA `aria-modal` — no aparece en
// ningún fichero del paquete `dialog/`. Se fija a mano abajo.
//
// Cierre por click fuera de la imagen: NO se depende del "outside press" de
// Base UI — ese mecanismo trata cualquier click DENTRO del DOM del Popup
// (incluido el aire alrededor de la imagen, ya que el Popup ocupa toda la
// caja `inset-6`) como "dentro", así que nunca cerraría al clicar el margen.
// En su lugar, un `onClick` propio en el Popup compara
// `event.target === event.currentTarget`: solo dispara si el click aterriza
// literalmente en el fondo del Popup, nunca si burbujea desde la imagen o el
// botón de cerrar (ambos son otros nodos, no el propio Popup).
//
// Tamaño de imagen SIN `fill`: con `images.unoptimized: true` (next.config,
// export estático) y sin conocer el aspect ratio real de cada foto de
// antemano (122 fotos, orientación variable), `h-auto w-auto max-h-full
// max-w-full` deja que el navegador use las dimensiones intrínsecas REALES
// del AVIF decodificado (no el `width`/`height` nominal que exige la API de
// next/image) para calcular el tamaño — la imagen encoge/letterboxea de
// forma natural sin distorsión, y el `<img>` renderizado ocupa solo el
// espacio real que pinta (no toda la caja del Popup), así que el margen
// alrededor sigue siendo clicable como "fuera de la imagen".
interface LightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
  closeLabel: string;
}

export function Lightbox({ open, onOpenChange, src, alt, closeLabel }: LightboxProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-slot="lightbox-backdrop"
          className="fixed inset-0 z-50 bg-charcoal-900/90"
        />
        <DialogPrimitive.Popup
          data-slot="lightbox"
          aria-modal="true"
          aria-label={alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
          className="fixed inset-6 z-50 flex items-center justify-center outline-none sm:inset-10"
        >
          <DialogPrimitive.Close
            data-slot="lightbox-close"
            aria-label={closeLabel}
            className="fixed top-4 right-4 z-50 flex size-10 items-center justify-center text-text-on-dark transition-colors duration-150 ease-standard hover:text-text-on-dark-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:top-6 sm:right-6"
          >
            <Icon name="x" size={24} />
          </DialogPrimitive.Close>
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1600}
            className="h-auto max-h-full w-auto max-w-full rounded-lg object-contain shadow-lg"
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type { LightboxProps };
