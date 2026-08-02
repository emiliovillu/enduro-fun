import { test, expect } from '@playwright/test';

// T3.1 — Optimización de imágenes/vídeo. Cláusula determinista y gratuita de
// la Verificación de la tarea (planning.md regla 8): "el vídeo/imagen del
// hero carga con prioridad y el resto con lazy loading (comprobado en el
// panel de red: requests de imágenes fuera de viewport se disparan al hacer
// scroll, no al cargar)". Se ejercita contra el build estático real servido
// tal cual (mismo stack que el resto de `apps/web/e2e/`, ver
// `playwright.config.ts` — `pnpm build && npx serve out`), escuchando
// requests reales de red (`page.on('request')`), no asumiendo el atributo
// `loading` a secas: un atributo `loading="lazy"` sin que el navegador lo
// respete de verdad no protegería nada.
//
// Hero: `HomeHeroVideo` (vídeo + poster) tiene `priority`
// (`app/[locale]/page.tsx`) / `preload="metadata"` — es la ÚNICA excepción
// sancionada por el PRD §8 al requisito general de lazy loading (recurso
// LCP-crítico, above-the-fold).
//
// Resto — nota importante descubierta escribiendo este test: el
// `loading="lazy"` NATIVO de Chrome no espera literalmente a que el
// elemento entre en el viewport visible — precarga con un margen de
// distancia generoso en conexiones rápidas (comportamiento del navegador,
// no configurable desde la app). Con las 10 fotos de `HomePhotoCarousel`
// repartidas en ~3400px de scroll horizontal, Chrome precarga las primeras
// 9 casi de inmediato pero NUNCA la 10ª (`gallery-113.avif`, la última
// tarjeta) — queda por encima de ese margen. Es el candidato correcto para
// esta prueba: cualquier foto más cercana al inicio del carrusel daría un
// FALSO positivo (parecería cargar "no-lazy" solo por el margen de
// precarga del navegador, no por un bug real).
test(
  'el hero carga con prioridad; la última foto del carrusel (fuera del margen de precarga) no se pide hasta hacer scroll',
  { tag: ['@f3'] },
  async ({ page }) => {
    const requestedUrls: string[] = [];
    page.on('request', (request) => {
      requestedUrls.push(new URL(request.url()).pathname);
    });

    await page.goto('/en/');
    await page.waitForLoadState('load');

    // Hero: carga inmediata, sin esperar a ningún scroll (excepción
    // sancionada — imagen Y vídeo del hero, PRD §8).
    expect(requestedUrls).toContain('/hero/home-hero-poster.avif');
    expect(requestedUrls).toContain('/hero/home-hero.mp4');

    // Resto: la última foto del carrusel NO debe haberse pedido todavía.
    expect(requestedUrls).not.toContain('/gallery/gallery-113.avif');

    // Al desplazar el carrusel hasta la última tarjeta (mismo mecanismo de
    // navegación por dots que `home.spec.ts`), la foto entra en el margen
    // de precarga real y el navegador SÍ dispara la request diferida
    // (`expect.poll`: espera por condición observable de verdad, nunca un
    // `waitForTimeout` a ciegas).
    const gallerySection = page.getByRole('region', { name: 'A taste of the terrain' });
    await gallerySection.scrollIntoViewIfNeeded();
    await gallerySection.getByRole('button', { name: '10/10' }).click();

    await expect
      .poll(() => requestedUrls.includes('/gallery/gallery-113.avif'), { timeout: 10_000 })
      .toBe(true);
  },
);

// Mismo comportamiento en la página Gallery (T3.1 "demás secciones" — la
// Entrega no es solo Home). Aquí el caso es incluso más fuerte que un
// margen de precarga: `GalleryGrid` solo renderiza las primeras
// `INITIAL_COUNT=25` fotos en el DOM; el resto (`gallery/thumbs/gallery-
// 026.avif` en adelante) NI SIQUIERA EXISTE hasta que un
// `IntersectionObserver` sobre un sentinel dispara la siguiente tanda
// (scroll infinito, ver `gallery-grid.tsx`) — así que "no se pide hasta
// hacer scroll" está garantizado por construcción, no solo por el atributo
// `loading="lazy"` (que sí llevan, ver la propia entrega de esas imágenes
// en el DOM tras el scroll). El grid pide la variante MINIATURA
// (`gallery/thumbs/…`, T3.1 ronda 2) — el fichero completo
// (`gallery/gallery-026.avif`) solo se pide si se abre el Lightbox.
test(
  'en Gallery, las fotos de tandas posteriores no existen ni se piden hasta hacer scroll',
  { tag: ['@f3'] },
  async ({ page }) => {
    const requestedUrls: string[] = [];
    page.on('request', (request) => {
      requestedUrls.push(new URL(request.url()).pathname);
    });

    await page.goto('/en/gallery/');
    await page.waitForLoadState('load');

    // Ni en el DOM ni en la red.
    await expect(page.getByRole('img', { name: 'Enduro trail photo 26' })).toHaveCount(0);
    expect(requestedUrls).not.toContain('/gallery/thumbs/gallery-026.avif');

    // Scroll hasta el final del grid ya cargado: dispara el sentinel del
    // scroll infinito, que renderiza la siguiente tanda (`BATCH_SIZE=15`,
    // con una latencia simulada de 700ms).
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    const nextPhoto = page.getByRole('img', { name: 'Enduro trail photo 26' });
    await expect(nextPhoto).toBeAttached({ timeout: 10_000 });
    await nextPhoto.scrollIntoViewIfNeeded();

    await expect
      .poll(() => requestedUrls.includes('/gallery/thumbs/gallery-026.avif'), { timeout: 10_000 })
      .toBe(true);
  },
);
