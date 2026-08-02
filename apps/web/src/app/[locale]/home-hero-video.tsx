'use client';

import { useEffect, useRef } from 'react';

// T1.1 — vídeo real del hero (2026-07-25, petición directa del usuario,
// sustituye el placeholder tokenizado). Client component local a la página
// (mismo criterio que `HomePhotoCarousel` — un solo consumidor hoy).
//
// Origen: clip vertical (9:16) de ~2:30, 135MB, aportado por el usuario.
// Recortado a `[4.8s, 46.8s]` del original (petición 2026-07-25: el clip
// fuente abre con una animación de logo grande y centrado que se disuelve
// del todo hacia t≈4.8s — verificado fotograma a fotograma; a partir de ahí
// solo queda el watermark pequeño y persistente de esquina, que SÍ se deja,
// no es al que se refería el usuario) y re-encuadrado a 16:9
// (`crop=1080:608:0:750` — el offset vertical 750 se eligió tras comparar
// varios candidatos contra fotogramas de muestra de todo el clip: capta la
// acción real sin quedarse solo con cielo, mejor que un crop centrado a
// ciegas). Recodificado con `ffmpeg`/libx264 (854×480, sin pista de audio —
// el autoplay no la necesita y ahorra peso, crf 30, faststart) a
// `public/hero/home-hero.mp4`, ~6.9MB (desde 135MB, -95%, mismo espíritu de
// compresión agresiva que el pipeline AVIF de las fotos). Poster
// (`home-hero-poster.avif`) generado con el mismo pipeline `sharp` que el
// resto del sitio, a partir de un fotograma del propio clip ya recodificado.
//
// `preload="metadata"` (no `"auto"`): el `poster` ya cubre el primer
// pintado, así que no hay ganancia visual en reservar ancho de banda para
// los 6.8MB del vídeo antes de que React hidrate — solo competiría con los
// recursos que sí determinan el LCP (logo `priority`, fuentes).
//
// `prefers-reduced-motion`: mismo criterio que `HomePhotoCarousel` — el
// vídeo NO autoarranca si el usuario lo pidió a nivel de sistema (se queda
// en el poster, pausado). Se comprueba dentro del propio `useEffect` (solo
// corre en cliente, sin SSR) en vez de vía `useState`: el valor se lee una
// única vez y nunca cambia, no necesita vivir en el árbol de estado de
// React. DEUDA anotada en el journal: este mismo `matchMedia` ya se repite,
// con la misma cadena, en `home-photo-carousel.tsx` y `gallery-grid.tsx` —
// candidato a extraer un hook `useReducedMotion()` compartido, no aplicado
// aquí porque tocaría 2 componentes ya cerrados y verificados, fuera de
// alcance de este cambio.
// T3.3 — `poster` ahora llega como prop en vez de literal interno: `page.tsx`
// necesita el string real para `ReactDOM.preload`, y un export de este
// módulo `'use client'` no sirve para eso (ver el razonamiento completo en
// `page.tsx`, junto al `HERO_POSTER_SRC` que ahora es la fuente de verdad;
// `frontend/references/architecture.md` §2.1 documenta la regla general).
interface HomeHeroVideoProps {
  poster: string;
}

export function HomeHeroVideo({ poster }: HomeHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    videoRef.current?.play().catch((error: unknown) => {
      // `NotAllowedError` = autoplay bloqueado por política del navegador
      // pese a `muted` — esperado, el poster se queda visible sin más
      // acción posible. Cualquier OTRO rechazo (p. ej. `NotSupportedError`
      // si `home-hero.mp4` estuviera roto o diera 404) se registra: un
      // catch que traga TODO por igual esconde justo el bug que este canal
      // existe para cazar (regla dura de observabilidad del proyecto).
      if (error instanceof DOMException && error.name === 'NotAllowedError') return;
      console.error('HomeHeroVideo: fallo al reproducir el vídeo del hero', error);
    });
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 size-full object-cover"
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src="/hero/home-hero.mp4" type="video/mp4" />
    </video>
  );
}
