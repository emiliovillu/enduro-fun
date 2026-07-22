'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Lightbox } from '@/components/ui/lightbox';

// Demo interactiva del showcase — la propia página `/design-system` es un
// server component (no necesita estado en ningún otro punto), así que el
// toggle open/close del Lightbox vive en este client component pequeño,
// aislado, en vez de convertir toda la página en 'use client'.
export function LightboxShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Open Lightbox
      </Button>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        src="/gallery/gallery-001.avif"
        alt="Enduro trail photo 1"
        closeLabel="Close image viewer"
      />
    </>
  );
}
