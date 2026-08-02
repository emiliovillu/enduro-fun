#!/usr/bin/env node
// T3.1 — pipeline de recodificación manual de imágenes para el export estático
// (apps/web, `output: 'export'` + `images: { unoptimized: true }`: sin Image
// Optimization API de Next, todo el trabajo de tamaño/formato se hace a mano
// sobre los ficheros reales de `apps/web/public/`). Tareas previas (T1.1/T2.1/
// TD.12) ya usaban `sharp` con este mismo criterio (AVIF, `rotate()` para
// hornear EXIF, calidad ~50/effort 6) de forma ad-hoc sin script committeado;
// este fichero lo fija de forma reproducible y documentada.
//
// Auditoría real que motiva los targets de abajo (Lighthouse móvil sobre
// `/en/`, ver docs/verifications/T3.1/ para el reporte completo): el audit
// moderno `image-delivery-insight` (sustituye a los antiguos `uses-responsive-
// images`/`uses-optimized-images`/`modern-image-formats`) flaggea un fichero
// cuando su compresión excede ~0.1667 bytes/px para AVIF (12:1 vs bitmap) o
// cuando su resolución excede la que realmente pinta el navegador para su caja
// CSS. Leído el código fuente de la insight
// (`@paulirish/trace_engine/models/trace/insights/ImageDelivery.js`, instalado
// por `npx lighthouse`): el "tamaño mostrado" que usa para comparar NO
// multiplica por el DPR emulado (854x480 móvil, DPR 1.75) — usa directamente
// el tamaño CSS de la caja (para `object-fit:cover`, el tamaño que resulta de
// escalar la imagen para cubrir el ANCHO de la caja, antes del recorte). El
// exceso de bytes tolerado es solo `bytesPerPixel × pixelesSobrantes`, con un
// umbral fijo de 4096 bytes — un margen mucho más estrecho de lo que parece a
// primera vista. Los anchos de esta tabla se calcularon despejando esa
// fórmula (con verificación empírica final, re-ejecutando Lighthouse tras
// cada cambio) para quedar cómodamente por debajo del umbral en la caja CSS
// real de cada imagen — no son un número redondo arbitrario. Importante: las
// fotos de `HomePhotoCarousel` se REUSAN tal cual en la Gallery (miniatura +
// lightbox, T3.1 nota en `home-photo-carousel.tsx`) — el criterio del
// planning es "sin duplicar assets", así que el tamaño elegido es un
// compromiso deliberado: prioriza el requisito medido en Home (caja fija de
// 340px) y acepta que el lightbox de Gallery se vea algo menos nítido en
// estas 10 fotos (de 122) al ampliarlas a pantalla casi completa.
//
//   node scripts/optimize-images.mjs           # recodifica todo lo listado
//   node scripts/optimize-images.mjs --dry-run # solo imprime antes/después
//
// Requiere `sharp` (devDependency raíz, añadida en esta tarea).
import sharp from 'sharp';
import { existsSync, statSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'apps', 'web', 'public');
const dryRun = process.argv.includes('--dry-run');

// `resizeWidth: null` → recomprime sin tocar dimensiones (el fichero ya tiene
// el tamaño correcto para su mayor caja de renderizado real; solo el
// bytes-per-pixel estaba por encima del umbral).
// Para imágenes con `object-fit: cover` (recorte real), Lighthouse compara
// bytes/tamaño contra la REGIÓN RECORTADA que el navegador realmente pinta
// (no contra el fichero completo) — despejado del código fuente de la
// insight y verificado empíricamente re-ejecutando Lighthouse tras cada
// ajuste (ver nota extensa más arriba). El comentario de cada target de
// abajo documenta la caja CSS usada para ese cálculo.
const TARGETS = [
  // Logo del hero de Home (`app/[locale]/page.tsx`) — PNG 620x400, `<Image>`
  // SIN `fill` (no hay recorte cover: caja = boundingRect literal reportado
  // por Lighthouse, 149x96 en el viewport móvil de la config). 220x142
  // (quality 45) dió margen cómodo por debajo del umbral de 4096 bytes en
  // AMBOS chequeos (tamaño Y compresión) — 480px (intento inicial) no
  // bastaba: el umbral es mucho más estrecho de lo que parece (ver nota de
  // cabecera). PNG→AVIF es el mayor ahorro individual del sitio (176 KB →
  // unos pocos KB), sin tocar qué logo se muestra.
  { file: 'logo.png', outExt: 'avif', resizeWidth: 220, quality: 45 },
  // Marca de agua del Header (`components/ui/header.tsx`) — PNG 128x128
  // mostrado a 28x28 CSS, tampoco `fill` (mismo caso sin recorte). 64px
  // (DPR ~2.3) ya deja ambos chequeos por debajo del umbral.
  { file: 'brand-mark.png', outExt: 'avif', resizeWidth: 64, quality: 65 },
  // Poster del vídeo del hero (`<video poster>`, `home-hero-video.tsx`) —
  // 854x480 (16:9, mismo encode que `home-hero.mp4`), full-bleed sobre una
  // sección MÓVIL alta y estrecha (`h-190`, boundingRect móvil 412x760,
  // AR 0.54): el recorte `object-cover` en un viewport tan distinto del
  // origen 16:9 usa solo una franja vertical estrecha de la imagen — el
  // resto del ancho ni se pinta en móvil, así que gran parte de los bytes
  // del poster son literalmente invisibles para un usuario de móvil. Se
  // recomprime a quality 27 (sin redimensionar: el recurso es LCP-crítico,
  // `priority`/carga inmediata, NUNCA lazy — excepción sancionada del PRD
  // §8/planning T3.1) — deja el bpp cómodamente bajo el umbral y de paso
  // acelera el LCP (69 KB → ~18 KB).
  { file: 'hero/home-hero-poster.avif', outExt: 'avif', resizeWidth: null, quality: 27 },
  // Fotos de `HomePhotoCarousel` (`app/[locale]/home-photo-carousel.tsx`,
  // `GALLERY_PHOTO_INDEXES`): ÚNICO uso en Home es esta tira a `basis-85`
  // (340px CSS de ancho fijo, `h-100`=400px de alto, recorte `object-cover`
  // real). Se reusan TAL CUAL en la Gallery (grid de miniaturas + lightbox
  // ampliado) — el planning exige "sin duplicar assets", así que el tamaño
  // es un compromiso deliberado: 384px de ancho + quality 45 despejan el
  // umbral de Lighthouse para la caja de Home (verificado para las 10, tanto
  // retratos como paisajes) a costa de que el lightbox de Gallery se vea
  // algo menos nítido en estas 10 fotos concretas (de 122) al ampliarlas a
  // pantalla casi completa — trade-off documentado, no un descuido. Ninguna
  // se redimensiona por encima de su tamaño actual (nunca upscale):
  // `withoutEnlargement: true` dentro de la función de resize.
  ...['001', '017', '019', '029', '043', '045', '055', '061', '113', '121'].map((n) => ({
    file: `gallery/gallery-${n}.avif`,
    outExt: 'avif',
    resizeWidth: 384,
    quality: 45,
  })),
  // `packageImageSlot('full-adventure')` (`data/packages.ts`) — CSS
  // `background` en `PackageCard` (escape hatch de imagen real, T2.1). El
  // audit de Lighthouse EXCLUYE explícitamente las imágenes CSS del chequeo
  // de tamaño (`isCSS` → se ignora `RESPONSIVE_SIZE`) Y, verificado
  // empíricamente, calcula su bytes/píxel contra el fichero COMPLETO (no
  // recortado) — así que solo hace falta mejorar compresión, no
  // redimensionar ni tratarlo como el caso `object-fit:cover` de arriba.
  { file: 'gallery/gallery-049.avif', outExt: 'avif', resizeWidth: null, quality: 35 },
  // `about/our-story.avif` (`app/[locale]/about/page.tsx`) — ÚNICO uso, sin
  // conflicto entre páginas (a diferencia de las fotos de Gallery de arriba):
  // recorte `object-cover` en una caja de 372x340 CSS (móvil). 400px de
  // ancho (desde 1047px) + quality 40 despeja el audit sin el trade-off de
  // las fotos compartidas — ajuste fino de esta tarea (T3.1, ronda 2): a
  // 450px/q45 quedaba a ~7 KB del umbral (score 0.5 en el verifier); bajar
  // a 400px/q40 da margen cómodo sin pérdida de nitidez visible (recorte a
  // pantalla móvil, nunca ampliado a pantalla completa como el Lightbox de
  // Gallery).
  { file: 'about/our-story.avif', outExt: 'avif', resizeWidth: 400, quality: 40 },
  // Miniaturas dedicadas del grid de Gallery (T3.1, ronda 2 — ver hallazgo
  // del verifier: `image-delivery-insight` score 0 en `/en/gallery/`, 24
  // imágenes/~2MB desperdiciados). Las 111 fotos de `gallery/` NO reusadas
  // en el carrusel de Home se servían en el grid a su resolución completa
  // (~1100px de lado mayor) para pintar una miniatura `fill` de ~178-240px
  // CSS — exactamente el mismo problema de "fichero completo para una caja
  // pequeña" que el resto de targets de este fichero, pero aquí NO se puede
  // recomprimir/redimensionar in-situ como los demás: el mismo fichero se
  // reusa ampliado a pantalla casi completa en el `Lightbox` al hacer click
  // (ver `gallery-grid.tsx`, `photoFullSrc`), así que degradar el original
  // degradaría también el zoom. Solución: un fichero de miniatura SEPARADO
  // en `gallery/thumbs/gallery-XXX.avif` (`outFile` explícito, ver `run()`
  // más abajo) — el original en `gallery/gallery-XXX.avif` queda intacto.
  //
  // Las 11 fotos de ARRIBA (10 del carrusel + `gallery-049`) TAMBIÉN
  // necesitan su miniatura: aunque su fichero "completo" ya se recomprimió
  // en la tanda anterior (384px para las 10 del carrusel, u 825x1100/q35
  // para `gallery-049`, servida como fondo CSS en Packages), esos tamaños
  // siguen siendo muchos más píxeles de los que pinta la caja del GRID de
  // Gallery — verificado empíricamente: sin esta miniatura, Lighthouse
  // flagea `gallery-001.avif`/`gallery-019.avif` en cuanto el scroll
  // infinito los carga (están dentro de `INITIAL_COUNT=25`). Generarles
  // también un `gallery/thumbs/gallery-XXX.avif` NO las toca (mismo
  // mecanismo `outFile`, fichero derivado nuevo) — no contradice "no tocar
  // los 11 targets ya procesados": su propio fichero, el que sirve al
  // Lightbox y al carrusel de Home, permanece exactamente como lo dejó la
  // tanda anterior.
  //
  // Ancho: verificado empíricamente re-ejecutando Lighthouse sobre las 122
  // miniaturas generadas (ver docs/verifications/T3.1) — la caja del grid
  // en el viewport MÓVIL de Lighthouse (2 columnas, `aspect-square`) mide
  // ~178×178 CSS; a partir de 260px de ancho el audit vuelve a flaggear
  // (score 0.5, sub-razón "larger than it needs to be"), a 240px pasa limpio
  // (score 1, 0 issues) con margen. 240px cubre también la caja de escritorio
  // (`lg:grid-cols-5`, `--container-max:1200px` → columna real ≈214px CSS)
  // sin quedarse corto. Quality 45, misma calidad que el resto del proyecto.
  // El orden de este array importa: estos targets van DESPUÉS de los 11
  // in-place de arriba en `TARGETS`, así que `run()` (secuencial) lee ya el
  // fichero "completo" en su estado FINAL de esta tanda como fuente.
  ...Array.from({ length: 122 }, (_, i) => String(i + 1).padStart(3, '0')).map((n) => ({
    file: `gallery/gallery-${n}.avif`,
    outFile: `gallery/thumbs/gallery-${n}.avif`,
    outExt: 'avif',
    resizeWidth: 240,
    quality: 45,
  })),
];

function fmtKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function run() {
  for (const target of TARGETS) {
    const srcPath = join(PUBLIC_DIR, target.file);
    // `outFile` explícito (miniaturas de Gallery): destino en un fichero
    // DISTINTO del origen, que se conserva intacto — a diferencia de las
    // conversiones in-situ (PNG→AVIF u AVIF→AVIF recomprimido) de los demás
    // targets, donde origen y destino son el mismo fichero lógico.
    const outPath = target.outFile
      ? join(PUBLIC_DIR, target.outFile)
      : target.outExt === 'avif' && !target.file.endsWith('.avif')
        ? join(PUBLIC_DIR, target.file.replace(/\.\w+$/, '.avif'))
        : srcPath;
    const outLabel = outPath.replace(PUBLIC_DIR + '/', '');

    // Idempotencia para destinos separados (miniaturas): si ya existe, no
    // hay nada que regenerar — a diferencia de las conversiones in-situ de
    // abajo, que sí se reprocesan en cada pasada (mismo criterio que ya
    // tenían antes de esta tarea). Comprueba TAMBIÉN que el origen siga
    // existiendo: si el thumb ya está pero el original (el que sirve al
    // Lightbox ampliado) desapareció — renombrado/borrado sin querer — no es
    // un "ya procesado, todo bien", es una foto rota que el script debe
    // señalar, no silenciar con un salto prematuro.
    if (target.outFile && existsSync(outPath)) {
      if (!existsSync(srcPath)) {
        console.error(
          `${target.file}: ${outLabel} ya existe pero el origen desapareció — foto rota, revisar`,
        );
      } else {
        console.log(`${target.file} -> ya procesado (${outLabel}), saltando`);
      }
      continue;
    }

    if (!existsSync(srcPath)) {
      // Re-ejecución sobre un repo donde una pasada previa ya convirtió este
      // target (y borró el origen): no es un error, es el estado esperado.
      if (existsSync(outPath)) {
        console.log(`${target.file} -> ya procesado (${outLabel}), saltando`);
      } else {
        // Ni origen ni salida existen: fichero perdido/movido, error real —
        // pero no debe tumbar el resto de targets, que sí son alcanzables.
        console.error(`${target.file}: no existe ni el origen ni ${outLabel}, saltando`);
      }
      continue;
    }

    const beforeSize = statSync(srcPath).size;

    let pipeline = sharp(srcPath).rotate(); // hornea EXIF orientation, como en tareas previas
    if (target.resizeWidth) {
      pipeline = pipeline.resize({ width: target.resizeWidth, withoutEnlargement: true });
    }
    const outputBuffer = await pipeline.avif({ quality: target.quality, effort: 6 }).toBuffer();

    console.log(
      `${target.file} -> ${outLabel}: ${fmtKb(beforeSize)} -> ${fmtKb(outputBuffer.length)}`,
    );

    if (!dryRun) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, outputBuffer);
      // Solo se borra el origen en conversiones in-situ (mismo fichero
      // lógico, quizá con extensión distinta) — las miniaturas (`outFile`
      // explícito) conviven con el original a tamaño completo, que sigue
      // sirviendo al Lightbox ampliado.
      if (!target.outFile && outPath !== srcPath) unlinkSync(srcPath); // ya no queda el .png/.jpg original
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
