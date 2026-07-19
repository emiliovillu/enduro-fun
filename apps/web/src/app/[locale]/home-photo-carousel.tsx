'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// T1.5 — carrusel de fotos placeholder (sin fotos reales todavía, mismo
// criterio tokenizado que el hero de Home / "Our story" de About). Client
// component local a la página (no una primitiva de `components/ui/` — solo
// tiene un consumidor hoy, mismo criterio que el placeholder del hero de
// T1.1). Autoplay pedido explícitamente por el usuario, con las
// salvaguardas de accesibilidad que exige WCAG 2.2.2 (contenido que se
// mueve solo más de 5s necesita un control de pausa visible) y
// `prefers-reduced-motion` (nunca autoplay si el usuario lo ha desactivado a
// nivel de sistema). El único control de pausa es el botón explícito — se
// probó también pausar en hover/focus, pero eso competía con el propio
// click del botón (el hover ya ponía `playing=false` antes de que el click
// lo alternara, así que un click en el botón durante hover volvía a
// reanudar en vez de pausar) — descartado, un solo mecanismo de pausa sin
// ambigüedad.
const SLIDE_COUNT = 5;
const AUTOPLAY_MS = 4000;

interface HomePhotoCarouselProps {
  eyebrow: string;
  title: string;
  pauseLabel: string;
  playLabel: string;
}

export function HomePhotoCarousel({
  eyebrow,
  title,
  pauseLabel,
  playLabel,
}: HomePhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // `prefers-reduced-motion`: el autoplay arranca en pausa si el usuario lo
  // pidió a nivel de sistema (inicializador perezoso, no un efecto — evita
  // el render en cascada de fijar el estado dentro de un `useEffect`); se
  // puede reanudar a mano igualmente, no se le quita el control.
  const [playing, setPlaying] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDE_COUNT);
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(id);
    };
  }, [playing]);

  // Desplaza SOLO el track del carrusel (`scrollTo` sobre el propio
  // contenedor), nunca `card.scrollIntoView()` — ese método puede escalar a
  // CUALQUIER ancestro scrolleable, incluida la página entera, si decide
  // que la tarjeta "no está visible" (p. ej. el usuario ya bajó a Reviews
  // mientras el autoplay seguía en marcha): el bug real reportado por el
  // usuario era justo eso, la página saltaba de vuelta a la galería en
  // cada avance automático.
  useEffect(() => {
    const card = cardRefs.current[activeIndex];
    if (!card || !trackRef.current) return;
    trackRef.current.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [activeIndex]);

  return (
    <section className="bg-bg-inverse py-16" aria-roledescription="carousel" aria-label={title}>
      <div className="mx-auto flex max-w-[var(--container-max)] items-end justify-between gap-6 px-5 sm:px-8">
        <div>
          <p className="font-display mb-2 text-eyebrow font-semibold tracking-eyebrow text-accent-secondary uppercase">
            {eyebrow}
          </p>
          <h2 className="m-0 text-display-md text-text-on-dark">{title}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaying((current) => !current);
          }}
          aria-label={playing ? pauseLabel : playLabel}
          className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-subtle text-text-on-dark-secondary transition-colors duration-150 ease-standard hover:text-text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <Icon name={playing ? 'pause' : 'play'} size={16} />
        </button>
      </div>

      {/* Sin gap entre tarjetas (filmstrip continuo) y sin bordes
          redondeados — pedido explícito del usuario, distinto del resto de
          cards del sitio (`PackageCard`/`ReviewCard` sí llevan `radius-lg`).
          Altura fija (`h-100`) para que las fotos ocupen todo el alto de la
          sección. Sin `max-w-[var(--container-max)]` ni padding horizontal
          (a diferencia de la cabecera de arriba) — el track ocupa TODO el
          ancho de la sección, pedido explícito del usuario; solo el título
          y el botón de pausa quedan alineados al contenedor. */}
      <div
        ref={trackRef}
        className="mt-8 flex h-100 overflow-x-auto [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {Array.from({ length: SLIDE_COUNT }, (_, index) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            aria-hidden="true"
            className="flex h-full w-85 shrink-0 items-end bg-linear-to-br from-charcoal-700 to-charcoal-900 p-4 [scroll-snap-align:start]"
          >
            <span className="font-mono text-caption text-text-on-dark-secondary">
              Photo placeholder — route {index + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: SLIDE_COUNT }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setActiveIndex(index);
            }}
            aria-label={`${String(index + 1)}/${String(SLIDE_COUNT)}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={cn(
              'size-2 rounded-pill transition-colors duration-150 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              index === activeIndex ? 'bg-accent-primary' : 'bg-border-subtle',
            )}
          />
        ))}
      </div>
    </section>
  );
}
