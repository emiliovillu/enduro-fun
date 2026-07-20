import { PackageSchema, type Package } from '@app/core/contracts';

// Datos de ejemplo de T1.1 (Home preview), origen: mockup Claude Design
// "EnduroFun Pages" (HomeVariantA/HomeShared.jsx), traducidos a ES/DE por el
// implementer. Validados con `.parse()` a nivel de MÓDULO (mismo patrón que
// `apps/web/src/i18n/messages.ts` de T0.2): un paquete con una traducción
// que falte una clave de `LocalizedTextSchema` rompe el build, no solo el
// render — control negativo gratis (citado explícitamente en la
// Verificación de T2.1, que reutilizará este mismo mecanismo).
//
// Vive fuera de `components/ui/` a propósito (regla dura de components.md
// §2): las primitivas de UI son presentacionales puras con props planas, no
// conocen `@app/core`. Este fichero es contenido de dominio; la página
// (`app/[locale]/page.tsx`) es quien traduce estos objetos a las props
// planas de `PackageCard`.
const RAW_PACKAGES: Package[] = [
  {
    id: 'getaway',
    nights: 4,
    days: 3,
    priceEur: 1290,
    name: { en: 'Getaway', es: 'Escapada', de: 'Kurztrip' },
    description: {
      en: 'A short, focused introduction to Málaga enduro terrain.',
      es: 'Una introducción corta y directa al terreno de enduro de Málaga.',
      de: 'Eine kurze, fokussierte Einführung in das Enduro-Gelände von Málaga.',
    },
    features: [
      {
        en: '4 nights, breakfast included',
        es: '4 noches, desayuno incluido',
        de: '4 Nächte, Frühstück inklusive',
      },
      {
        en: '3 days of guided route on a Husqvarna enduro bike',
        es: '3 días de ruta guiada en moto de enduro Husqvarna',
        de: '3 Tage geführte Route auf einer Husqvarna-Enduromaschine',
      },
      {
        en: 'Bike, fuel and local guide included',
        es: 'Moto, combustible y guía local incluidos',
        de: 'Motorrad, Kraftstoff und örtlicher Guide inklusive',
      },
    ],
  },
  {
    id: 'full-adventure',
    nights: 6,
    days: 4,
    priceEur: 1690,
    name: { en: 'Full Adventure', es: 'Aventura Completa', de: 'Volles Abenteuer' },
    description: {
      en: 'The complete Málaga enduro experience, with a rest day to explore.',
      es: 'La experiencia completa de enduro en Málaga, con un día de descanso para explorar.',
      de: 'Das komplette Enduro-Erlebnis in Málaga, mit einem Ruhetag zum Entdecken.',
    },
    features: [
      {
        en: '6 nights, breakfast included',
        es: '6 noches, desayuno incluido',
        de: '6 Nächte, Frühstück inklusive',
      },
      {
        en: '2 route days + rest day + 2 route days',
        es: '2 días de ruta + día de descanso + 2 días de ruta',
        de: '2 Routentage + Ruhetag + 2 Routentage',
      },
      {
        en: 'Rest day option: Caminito del Rey or Málaga old town',
        es: 'Opción de día de descanso: Caminito del Rey o el casco antiguo de Málaga',
        de: 'Ruhetag-Option: Caminito del Rey oder die Altstadt von Málaga',
      },
    ],
  },
  {
    // Hotfix (petición directa del usuario, cliente aportó el texto):
    // servicio de traer tu propia moto (almacenamiento/transporte/taller),
    // no una ruta guiada — sin noches/días/precio fijo, ver nota de
    // `PackageSchema` para `subtitleOverride`/`priceLabel`. El nombre
    // completo del partner de transporte ("Gayer Motorrad") se menciona sin
    // URL: el texto que pasó el cliente traía la dirección truncada
    // (`www.gayermotorrad.....`) y no se inventa una URL sin confirmar.
    id: 'own-bike',
    name: {
      en: 'Ride your own bike',
      es: 'Rueda con tu propia moto',
      de: 'Fahre mit deinem eigenen Motorrad',
    },
    description: {
      en: 'Bring your own bike and explore Andalucía on your own terms — we help with transport, storage and workshop support.',
      es: 'Trae tu propia moto y explora Andalucía a tu ritmo — te ayudamos con el transporte, el almacenamiento y el taller.',
      de: 'Bring dein eigenes Motorrad mit und erkunde Andalusien in deinem eigenen Tempo — wir helfen bei Transport, Lagerung und Werkstatt.',
    },
    subtitleOverride: {
      en: 'Storage · Transport · Workshop',
      es: 'Almacenamiento · Transporte · Taller',
      de: 'Lagerung · Transport · Werkstatt',
    },
    priceLabel: {
      en: 'Ask for pricing',
      es: 'Consulta precio',
      de: 'Preis auf Anfrage',
    },
    features: [
      {
        en: "We're happy to help you find the right transport — our partner: Gayer Motorrad",
        es: 'Te ayudamos con gusto a encontrar el transporte adecuado — socio colaborador: Gayer Motorrad',
        de: 'Wir helfen dir gerne, den passenden Transport zu finden — unser Partner: Gayer Motorrad',
      },
      {
        en: 'Storage with our own workshop',
        es: 'Almacenamiento con taller propio',
        de: 'Lagerung mit eigener Werkstatt',
      },
      {
        en: 'Airport pickup service',
        es: 'Servicio de aeropuerto',
        de: 'Flughafen-Service',
      },
    ],
  },
];

export const PACKAGES: Package[] = RAW_PACKAGES.map((pkg) => PackageSchema.parse(pkg));

// Paquete "destacado" en la preview de Home (mockup: badge "Most popular"
// sobre Full Adventure) — decisión de presentación de la PÁGINA, no del
// contrato de dominio (`Package` no tiene un campo `highlight`).
export const HIGHLIGHTED_PACKAGE_ID = 'full-adventure';
