import { ReviewSchema, type Review } from '@app/core/contracts';

// Datos de ejemplo de T1.1 (Home preview) — inventados en v1 (PRD D4: "reviews
// con datos inventados en v1", mecanismo ya esperado), origen: mockup Claude
// Design "EnduroFun Pages" (HomeVariantA/HomeShared.jsx). Nombre/país no se
// traducen (son datos, no copy de marketing — mismo criterio del contrato
// `Review` en packages/core); solo `text` es `LocalizedTextSchema`, traducido
// aquí a ES/DE por el implementer. Validado con `.parse()` a nivel de módulo,
// mismo patrón que `packages.ts` — ver esa nota para el porqué.
const RAW_REVIEWS: Review[] = [
  {
    id: 'marcus',
    name: 'Marcus',
    country: 'Germany',
    rating: 5,
    text: {
      en: "Local knowledge you can't get from a map. Best week on a bike I've had in years.",
      es: 'Conocimiento local que no se encuentra en ningún mapa. La mejor semana en moto que he tenido en años.',
      de: 'Lokales Wissen, das man auf keiner Karte findet. Die beste Woche auf dem Motorrad seit Jahren.',
    },
  },
  {
    id: 'james',
    name: 'James',
    country: 'United Kingdom',
    rating: 5,
    text: {
      en: 'Great mix of proper trails and time to explore the old town in Málaga.',
      es: 'Gran mezcla de senderos de verdad y tiempo para explorar el casco antiguo de Málaga.',
      de: 'Tolle Mischung aus echten Trails und Zeit, um die Altstadt von Málaga zu erkunden.',
    },
  },
  {
    id: 'sophie',
    name: 'Sophie',
    country: 'United Kingdom',
    rating: 4,
    text: {
      en: 'Well organised from the airport to the last trail. Already planning a return trip.',
      es: 'Muy bien organizado desde el aeropuerto hasta el último sendero. Ya estoy planeando volver.',
      de: 'Vom Flughafen bis zum letzten Trail gut organisiert. Plane bereits die Rückkehr.',
    },
  },
];

export const REVIEWS: Review[] = RAW_REVIEWS.map((review) => ReviewSchema.parse(review));
