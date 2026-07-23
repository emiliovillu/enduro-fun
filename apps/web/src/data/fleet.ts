import { FleetBikeSchema, type FleetBike, type Messages } from '@app/core/contracts';

// Datos reales de la flota (TD.12, aportados por el usuario — NO SE
// INVENTAN NI SE CAMBIAN): Husqvarna TE 300 (enduro, 300cc), Husqvarna
// Norden 901 (trail/aventura, 901cc) y BMW 1300 GS (trail/aventura, 1300cc —
// añadida 2026-07-23, misma categoría que la Norden 901, ver planning.md
// TD.12 nota de cambio de alcance menor). Mismo patrón que
// `apps/web/src/data/packages.ts`: `RAW_X` + `.map(Schema.parse)` a nivel de
// MÓDULO — un dato con una traducción que falte una clave de
// `LocalizedTextSchema` rompe el build, no solo el render (control negativo
// gratis).
//
// Vive fuera de `components/ui/` a propósito (regla dura de components.md
// §2): las primitivas de UI son presentacionales puras con props planas, no
// conocen `@app/core`. Este fichero es contenido de dominio; la página
// (`app/[locale]/about/page.tsx`) es quien traduce estos objetos a las props
// planas de `FleetCard`.
const RAW_FLEET: FleetBike[] = [
  {
    id: 'te-300',
    name: 'Husqvarna TE 300',
    displacementCc: 300,
    category: 'enduro',
    description: {
      en: 'Our go-to enduro bike for technical singletrack and rocky climbs.',
      es: 'Nuestra moto de referencia para singletrack técnico y subidas rocosas.',
      de: 'Unser Standard-Enduromotorrad für technische Singletrails und felsige Anstiege.',
    },
  },
  {
    id: 'norden-901',
    name: 'Husqvarna Norden 901',
    displacementCc: 901,
    category: 'trail-adventure',
    description: {
      en: 'Long-distance comfort for open trails and multi-day touring.',
      es: 'Comodidad para largas distancias en pistas abiertas y rutas de varios días.',
      de: 'Komfort für lange Strecken auf offenen Pisten und mehrtägige Touren.',
    },
  },
  {
    id: 'bmw-1300-gs',
    name: 'BMW 1300 GS',
    displacementCc: 1300,
    category: 'trail-adventure',
    description: {
      en: 'Flagship adventure tourer for effortless miles between routes.',
      es: 'Adventure tourer insignia para kilómetros sin esfuerzo entre rutas.',
      de: 'Flaggschiff-Adventure-Tourer für mühelose Kilometer zwischen den Routen.',
    },
  },
];

export const FLEET: FleetBike[] = RAW_FLEET.map((bike) => FleetBikeSchema.parse(bike));

// Foto real de la Norden 901 (petición directa del usuario 2026-07-23,
// `apps/web/public/fleet/norden-901.avif`, mismo pipeline `sharp`/AVIF que
// Gallery/About: `rotate()` + `avif({quality: 50, effort: 6})`, ~73KB).
// Vive fuera de `FleetBikeSchema` a propósito: `imageSlot` de `FleetCard` es
// un string CSS `background` no-tokenizable (design-system.md §3.1), no un
// dato de dominio — mismo criterio que separa `fleetCategoryLabel` del
// contrato Zod. `50% 80%` de posición porque la foto es una fila de motos en
// un almacén; ese recorte deja el depósito con la serigrafía "NORDEN 901" en
// primer plano en vez del manillar/espejos de arriba.
const FLEET_IMAGES: Partial<Record<FleetBike['id'], string>> = {
  'norden-901': 'url(/fleet/norden-901.avif) 50% 80% / cover no-repeat',
};

export function fleetImageSlot(id: FleetBike['id']): string | undefined {
  return FLEET_IMAGES[id];
}

// Mapeo enum→etiqueta traducida (`fleet-bike.ts` cita `status-class.ts` como
// precedente de "la agrupación enum→texto vive en UN sitio" — este es ESE
// sitio, no un `const` local a `about/page.tsx`: `design-system/page.tsx`
// necesita las mismas 2 etiquetas para su showcase, así que un mapeo inline
// en la página se habría duplicado igualmente ahí).
export function fleetCategoryLabel(
  categories: Messages['about']['fleet']['categories'],
): Record<FleetBike['category'], string> {
  return {
    enduro: categories.enduro,
    'trail-adventure': categories.trailAdventure,
  };
}
