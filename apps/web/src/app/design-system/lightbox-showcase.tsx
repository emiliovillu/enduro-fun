'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Lightbox } from '@/components/ui/lightbox';

const SHOWCASE_PHOTOS = [1, 2, 3];

// Demo interactiva del showcase — la propia página `/design-system` es un
// server component (no necesita estado en ningún otro punto), así que el
// toggle open/close del Lightbox vive en este client component pequeño,
// aislado, en vez de convertir toda la página en 'use client'.
//
// TD.13: 3 fotos de demo (en vez de 1 fija) para que las flechas de
// navegación tengan algo real que recorrer — `index` es local al showcase,
// sin depender de `GalleryGrid`.
export function LightboxShowcase() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

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
        src={`/gallery/gallery-00${String(SHOWCASE_PHOTOS[index])}.avif`}
        alt={`Enduro trail photo ${String(SHOWCASE_PHOTOS[index])}`}
        closeLabel="Close image viewer"
        onPrev={
          index > 0
            ? () => {
                setIndex(index - 1);
              }
            : undefined
        }
        onNext={
          index < SHOWCASE_PHOTOS.length - 1
            ? () => {
                setIndex(index + 1);
              }
            : undefined
        }
        prevLabel="Previous photo"
        nextLabel="Next photo"
      />
    </>
  );
}
