'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// Página Gallery (hotfix, petición directa del usuario): grid de 5 columnas
// con scroll infinito de fotos placeholder (sin fotos reales todavía, mismo
// criterio tokenizado que el resto del sitio — hero de Home, "Our story" de
// About, carrusel de T1.5). Client component local a la página (un solo
// consumidor, mismo criterio que `HomePhotoCarousel`).
//
// Mecanismo de scroll infinito: no hay backend que paginar (sitio estático,
// `output: 'export'`) — un `IntersectionObserver` sobre un sentinel al final
// del grid dispara la carga de la siguiente tanda, con un `setTimeout` corto
// que simula latencia de red (el spinner sería instantáneo/imperceptible
// sin él). Sin tope superior deliberado ("scroll infinito" tal cual se
// pidió) — son `<div>` planos sin coste real de red, no hay motivo para
// cortar la lista.
//
// Spinner con el favicon girando: `/icon.png` (mismo mark que el favicon
// real, T-hotfix anterior) + `animate-spin` de Tailwind. Respeta
// `prefers-reduced-motion` igual que el autoplay del carrusel de T1.5 (WCAG
// 2.2.2 — aquí no es estrictamente contenido en movimiento persistente,
// mismo criterio de cautela: si el usuario pidió menos movimiento a nivel de
// sistema, el giro se sustituye por un pulso de opacidad).
const INITIAL_COUNT = 25;
const BATCH_SIZE = 15;
const SIMULATED_LOAD_MS = 700;

interface GalleryGridProps {
  placeholderLabelTemplate: string;
  loadingLabel: string;
}

export function GalleryGrid({ placeholderLabelTemplate, loadingLabel }: GalleryGridProps) {
  const [count, setCount] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setLoading((alreadyLoading) => {
          if (alreadyLoading) return alreadyLoading;
          window.setTimeout(() => {
            setCount((current) => current + BATCH_SIZE);
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
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex aspect-square items-center justify-center rounded-lg bg-linear-to-br from-charcoal-700 to-charcoal-900 p-3"
          >
            <span className="text-center font-mono text-caption text-text-on-dark-secondary">
              {placeholderLabelTemplate.replace('{n}', String(index + 1))}
            </span>
          </div>
        ))}
      </div>

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
    </>
  );
}
