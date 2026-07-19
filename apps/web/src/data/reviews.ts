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
  // Añadidas en T2.2 (F2, Página Reviews) para llegar a las 6 del mockup
  // `docs/mockups/reviews.html` — mismo estilo de texto e inventadas en v1
  // (PRD D4), sin segundo array paralelo. Home (T1.1) sigue enseñando solo
  // las 3 primeras (ver `apps/web/src/app/[locale]/page.tsx`).
  {
    id: 'lars',
    name: 'Lars',
    country: 'Sweden',
    rating: 5,
    text: {
      en: 'The guides know every inch of that terrain. Never felt unsafe, always felt challenged.',
      es: 'Los guías conocen cada rincón de ese terreno. Nunca me sentí inseguro, siempre desafiado.',
      de: 'Die Guides kennen jeden Zentimeter des Geländes. Nie unsicher gefühlt, immer gefordert.',
    },
  },
  {
    id: 'elena',
    name: 'Elena',
    country: 'Italy',
    rating: 5,
    text: {
      en: 'Six days, zero regrets. The rest-day trip to Caminito del Rey was a great touch.',
      es: 'Seis días, cero arrepentimientos. La excursión del día de descanso al Caminito del Rey fue un gran detalle.',
      de: 'Sechs Tage, keine Reue. Der Ausflug zum Caminito del Rey am Ruhetag war ein schönes Extra.',
    },
  },
  {
    id: 'tom',
    name: 'Tom',
    country: 'Netherlands',
    rating: 4,
    text: {
      en: 'Bike was well maintained and the route difficulty matched exactly what we discussed beforehand.',
      es: 'La moto estaba bien mantenida y la dificultad de la ruta coincidió exactamente con lo que habíamos hablado.',
      de: 'Das Motorrad war gut gewartet und der Schwierigkeitsgrad entsprach genau dem, was wir vorher besprochen hatten.',
    },
  },
];

export const REVIEWS: Review[] = RAW_REVIEWS.map((review) => ReviewSchema.parse(review));
