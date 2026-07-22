'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Página Gallery (hotfix, petición directa del usuario): grid de 5 columnas
// con scroll infinito sobre las fotos reales subidas por el usuario
// (apps/web/public/gallery/gallery-001.avif … gallery-122.avif — AVIF,
// redimensionadas a 1100px de lado mayor y recomprimidas: ~438MB de
// originales a ~10MB en total, servidas tal cual porque `output: 'export'`
// no tiene la Image Optimization API de Next). Client component local a la
// página (un solo consumidor, mismo criterio que `HomePhotoCarousel`).
//
// Mecanismo de scroll infinito: no hay backend que paginar (sitio estático)
// — un `IntersectionObserver` sobre un sentinel al final del grid dispara
// la carga de la siguiente tanda, con un `setTimeout` corto que simula
// latencia de red. A diferencia de la versión con tarjetas placeholder, el
// número de fotos es finito: el conteo se limita a `TOTAL_PHOTOS` y, una
// vez mostradas todas, el sentinel deja de renderizarse (no hay más que
// cargar, no tiene sentido seguir observando).
//
// Spinner con el favicon girando: `/icon.png` (mismo mark que el favicon
// real, T-hotfix anterior) + `animate-spin` de Tailwind. Respeta
// `prefers-reduced-motion` igual que el autoplay del carrusel de T1.5 (WCAG
// 2.2.2 — aquí no es estrictamente contenido en movimiento persistente,
// mismo criterio de cautela: si el usuario pidió menos movimiento a nivel de
// sistema, el giro se sustituye por un pulso de opacidad).
const TOTAL_PHOTOS = 122;
const INITIAL_COUNT = 25;
const BATCH_SIZE = 15;
const SIMULATED_LOAD_MS = 700;

function photoSrc(index: number): string {
  return `/gallery/gallery-${String(index + 1).padStart(3, '0')}.avif`;
}

interface GalleryGridProps {
  photoAltTemplate: string;
  loadingLabel: string;
}

export function GalleryGrid({ photoAltTemplate, loadingLabel }: GalleryGridProps) {
  const [count, setCount] = useState(Math.min(INITIAL_COUNT, TOTAL_PHOTOS));
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || count >= TOTAL_PHOTOS) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setLoading((alreadyLoading) => {
          if (alreadyLoading) return alreadyLoading;
          window.setTimeout(() => {
            setCount((current) => Math.min(current + BATCH_SIZE, TOTAL_PHOTOS));
            setLoading(false);
          }, SIMULATED_LOAD_MS);
          return true;
        });
      },
      { rootMargin: '400px' },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [count]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
            <Image
              src={photoSrc(index)}
              alt={photoAltTemplate.replace('{n}', String(index + 1))}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
              loading={index < INITIAL_COUNT ? undefined : 'lazy'}
            />
          </div>
        ))}
      </div>

      {count < TOTAL_PHOTOS ? (
        <div ref={sentinelRef} className="flex h-24 items-center justify-center" aria-live="polite">
          {loading ? (
            <>
              <Image
                src="/icon.png"
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
                className={reducedMotion ? 'animate-pulse' : 'animate-spin'}
              />
              <span className="sr-only">{loadingLabel}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
