import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FleetCard } from '@/components/ui/fleet-card';
import { Footer } from '@/components/ui/footer';
import { Header } from '@/components/ui/header';
import { Icon, type IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { MapEmbed } from '@/components/ui/map-embed';
import { PackageCard } from '@/components/ui/package-card';
import { ReviewCard } from '@/components/ui/review-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Textarea } from '@/components/ui/textarea';

import { LightboxShowcase } from './lightbox-showcase';

export const metadata: Metadata = {
  title: 'Design system — EnduroFun',
  robots: { index: false, follow: false },
};

// Herramienta interna (no localizada): showcase de los tokens volcados en
// globals.css desde docs/design-system/. Todas las clases usadas aquí son
// semánticas, emitidas por el @theme inline de globals.css — nunca hex/px
// crudos (skill frontend, design-system.md §3).

const BRAND_SWATCHES = [
  { label: '700', className: 'bg-red-700 text-white' },
  { label: '600', className: 'bg-red-600 text-white' },
  { label: '500', className: 'bg-red-500 text-white' },
  { label: 'O600', className: 'bg-orange-600 text-white' },
  { label: 'O500', className: 'bg-orange-500 text-white' },
  { label: 'A700', className: 'bg-amber-700 text-white' },
  { label: 'A500', className: 'bg-amber-500 text-white' },
  { label: 'A400', className: 'bg-amber-400 text-text-primary' },
];

const NEUTRAL_SWATCHES = [
  { label: '900', className: 'bg-charcoal-900 text-white' },
  { label: '800', className: 'bg-charcoal-800 text-white' },
  { label: '700', className: 'bg-charcoal-700 text-white' },
  { label: '600', className: 'bg-charcoal-600 text-white' },
  { label: '500', className: 'bg-charcoal-500 text-white' },
];

const SAND_SWATCHES = [
  { label: '100', className: 'bg-sand-100 text-text-primary' },
  { label: '200', className: 'bg-sand-200 text-text-primary' },
  { label: '300', className: 'bg-sand-300 text-text-primary' },
  { label: '400', className: 'bg-dust-400 text-text-primary' },
];

const SEMANTIC_CHIPS = [
  { label: '--accent-primary', className: 'bg-accent-primary text-text-primary' },
  { label: '--accent-secondary', className: 'bg-accent-secondary text-white' },
  { label: '--accent-amber', className: 'bg-accent-amber text-text-primary' },
  { label: '--rating-fill', className: 'bg-rating-fill text-white' },
  { label: '--link', className: 'bg-link text-white' },
  { label: '--success', className: 'bg-success text-white' },
  { label: '--danger', className: 'bg-danger text-white' },
  { label: '--bg-inverse', className: 'bg-bg-inverse text-white' },
  {
    label: '--surface-card',
    className: 'bg-surface-card text-text-primary border border-border-subtle',
  },
];

const RADII = [
  { label: 'sm', className: 'rounded-sm shadow-sm' },
  { label: 'md', className: 'rounded-md shadow-md' },
  { label: 'lg', className: 'rounded-lg shadow-lg' },
  { label: 'pill', className: 'rounded-pill' },
];

const SPACING_STEPS = [
  { label: 'space-2 / 8', className: 'w-2' },
  { label: 'space-4 / 16', className: 'w-4' },
  { label: 'space-6 / 24', className: 'w-6' },
  { label: 'space-8 / 32', className: 'w-8' },
  { label: 'space-12 / 48', className: 'w-12' },
  { label: 'space-20 / 80', className: 'w-20' },
];

const BUTTON_ROWS: {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline';
  label: string;
  wrapperClassName?: string;
}[] = [
  { variant: 'primary', label: 'Book now' },
  { variant: 'secondary', label: 'Enquire' },
  { variant: 'ghost', label: 'Learn more' },
  { variant: 'outline', label: 'On dark', wrapperClassName: 'rounded-lg bg-bg-inverse p-4' },
];

const BADGE_ROWS: { tone: 'neutral' | 'amber' | 'red' | 'dark'; label: string }[] = [
  { tone: 'neutral', label: 'Beginner friendly' },
  { tone: 'amber', label: 'Intermediate' },
  { tone: 'red', label: 'Most popular' },
  { tone: 'dark', label: 'On photo' },
];

const FORM_FIELD_STATES: { label: string; props: React.ComponentProps<'input'> }[] = [
  { label: 'Default', props: { placeholder: 'Jane Rider' } },
  { label: 'Filled', props: { defaultValue: 'Jane Rider' } },
  { label: 'Disabled', props: { placeholder: 'Jane Rider', disabled: true } },
  {
    label: 'Invalid',
    props: { defaultValue: 'not-an-email', 'aria-invalid': true },
  },
];

const ICON_NAMES: IconName[] = [
  'mail',
  'map-pin',
  'instagram',
  'bike',
  'phone',
  'globe',
  'menu',
  'x',
  'chevronDown',
];

const SECTION_HEADING_ROWS: {
  label: string;
  props: React.ComponentProps<typeof SectionHeading>;
  wrapperClassName?: string;
}[] = [
  {
    label: 'left, sin eyebrow',
    props: { title: 'Trail knowledge you can trust' },
  },
  {
    label: 'left, con eyebrow',
    props: { eyebrow: 'About', title: 'Local guides, real trails' },
  },
  {
    label: 'center',
    props: { eyebrow: 'Packages', title: 'Choose your route', align: 'center' },
  },
  {
    label: 'light (sobre fondo oscuro)',
    props: { eyebrow: 'Reviews', title: 'What riders say', align: 'center', light: true },
    wrapperClassName: 'rounded-lg bg-bg-inverse p-8',
  },
];

const PACKAGE_CARD_ROWS: { label: string; props: React.ComponentProps<typeof PackageCard> }[] = [
  {
    label: 'con highlight',
    props: {
      name: 'Escapada',
      subtitle: '4 nights · 3 route days',
      price: '1.290€',
      highlight: 'Popular',
      features: [
        '4 nights with breakfast',
        '3 days on a Husqvarna enduro bike',
        'Personal guide included',
      ],
    },
  },
  {
    label: 'sin highlight',
    props: {
      name: 'Fin de semana',
      subtitle: '2 nights · 2 route days',
      price: '590€',
      features: ['2 nights with breakfast', '2 days on a Husqvarna enduro bike'],
    },
  },
];

const FLEET_CARD_ROWS: { label: string; props: React.ComponentProps<typeof FleetCard> }[] = [
  {
    label: 'enduro',
    props: {
      name: 'Husqvarna TE 300',
      displacementCc: 300,
      categoryLabel: 'Enduro',
      description: 'Our go-to enduro bike for technical singletrack and rocky climbs.',
    },
  },
  {
    label: 'trail-adventure',
    props: {
      name: 'Husqvarna Norden 901',
      displacementCc: 901,
      categoryLabel: 'Trail & Adventure',
      description: 'Long-distance comfort for open trails and multi-day touring.',
    },
  },
];

const REVIEW_CARD_ROWS: { label: string; props: React.ComponentProps<typeof ReviewCard> }[] = [
  {
    label: 'rating 5',
    props: {
      name: 'Mark H.',
      country: 'United Kingdom',
      rating: 5,
      text: 'Best riding week of my life. The guides know every trail.',
    },
  },
  {
    label: 'rating 4',
    props: {
      name: 'Sofie L.',
      country: 'Germany',
      rating: 4,
      text: 'Great trails and great company — the last day was a bit rushed.',
    },
  },
];

// Renombrado de `SectionHeading` (colisionaba de nombre con la primitiva
// REAL `components/ui/section-heading.tsx` importada arriba — TD.5 la sube
// al DS y este helper interno del showcase, que solo titula sus propias
// secciones, pasa a `ShowcaseSectionHeading` para no chocar).
function ShowcaseSectionHeading({ children }: { children: React.ReactNode }) {
  // h2/h3 ya reciben font-display del selector de etiqueta en globals.css @layer base
  return <h2 className="mt-16 mb-6 text-h3 first:mt-0">{children}</h2>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-h4 text-text-secondary">{children}</h3>;
}

function SwatchStrip({
  swatches,
  heightClass,
}: {
  swatches: { label: string; className: string }[];
  heightClass: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-lg ${heightClass}`}>
      {swatches.map((s) => (
        <div
          key={s.label}
          className={`flex flex-1 items-end p-2 text-caption font-mono ${s.className}`}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[var(--container-max)] px-6 py-12">
      <p className="text-eyebrow font-display tracking-eyebrow text-accent-secondary">
        Design system
      </p>
      <h1 className="text-display-lg">EnduroFun tokens</h1>
      <p className="mt-2 max-w-2xl text-body text-text-secondary">
        Showcase interno (no localizado) de los tokens volcados desde{' '}
        <code className="font-mono">docs/design-system/</code>. Referencia contra{' '}
        <code className="font-mono">guidelines/*.card.html</code> del espejo.
      </p>

      <ShowcaseSectionHeading>Colores</ShowcaseSectionHeading>

      <SubHeading>Brand — sunset ramp</SubHeading>
      <SwatchStrip swatches={BRAND_SWATCHES} heightClass="h-32" />

      <SubHeading>Gradient</SubHeading>
      <div className="overflow-hidden rounded-lg">
        <div className="h-16 bg-gradient-sunset" />
        <div className="h-10 bg-gradient-scrim" />
      </div>

      <SubHeading>Neutral — charcoal</SubHeading>
      <SwatchStrip swatches={NEUTRAL_SWATCHES} heightClass="h-24" />

      <SubHeading>Sand &amp; dust</SubHeading>
      <SwatchStrip swatches={SAND_SWATCHES} heightClass="h-24" />

      <SubHeading>Semantic roles</SubHeading>
      <div className="flex flex-wrap gap-3">
        {SEMANTIC_CHIPS.map((c) => (
          <span
            key={c.label}
            className={`rounded-md px-4 py-2 text-small font-mono ${c.className}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <ShowcaseSectionHeading>Tipografía</ShowcaseSectionHeading>

      <SubHeading>Display — Oswald</SubHeading>
      <div className="rounded-lg bg-bg-canvas-alt p-6">
        <div className="font-display text-display-xl">Ride Málaga</div>
        <div className="font-display text-display-md text-accent-secondary">
          Enduro Tours &amp; Guided Routes
        </div>
      </div>

      <SubHeading>Body — Inter</SubHeading>
      <div className="rounded-lg bg-bg-canvas-alt p-6">
        <p className="mb-3 text-lead font-medium">
          Guided enduro routes through the hills of Álora, with real Andalusian trail knowledge.
        </p>
        <p className="mb-2 text-body text-text-secondary">
          Multi-day packages include accommodation, breakfast, and a Husqvarna enduro bike — plus a
          rest day to explore Caminito del Rey.
        </p>
        <p className="text-small text-text-secondary">
          We tailor every trip. Tell us your level and dates.
        </p>
      </div>

      <SubHeading>Eyebrow &amp; labels</SubHeading>
      <div className="rounded-lg bg-bg-canvas-alt p-6">
        <div className="font-display text-eyebrow tracking-eyebrow text-accent-secondary">
          Packages
        </div>
        <div className="mt-1.5 font-display text-h3">Escapada — 4 nights</div>
      </div>

      <ShowcaseSectionHeading>Espaciado y radios</ShowcaseSectionHeading>

      <SubHeading>Radios &amp; sombras</SubHeading>
      <div className="flex flex-wrap gap-4">
        {RADII.map((r) => (
          <div
            key={r.label}
            className={`flex h-24 w-24 items-end justify-center bg-surface-card p-2 text-caption font-mono text-text-secondary ${r.className}`}
          >
            {r.label}
          </div>
        ))}
      </div>

      <SubHeading>Escala de espaciado (base 4px)</SubHeading>
      <div className="flex flex-col gap-1.5">
        {SPACING_STEPS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 text-caption font-mono text-text-secondary"
          >
            <div className={`h-3.5 bg-accent-primary ${s.className}`} />
            {s.label}
          </div>
        ))}
      </div>

      <ShowcaseSectionHeading>Componentes</ShowcaseSectionHeading>

      <SubHeading>Button — variantes × tamaños</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Referencia: <code className="font-mono">docs/design-system/components/buttons/</code>.
        Estado press = <code className="font-mono">scale(.96)</code> sin cambio de color; hover un
        tono más oscuro.
      </p>
      <div className="flex flex-col gap-6">
        {BUTTON_ROWS.map((row) => (
          <div
            key={row.variant}
            className={`flex flex-wrap items-center gap-3 ${row.wrapperClassName ?? ''}`}
          >
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <Button key={size} variant={row.variant} size={size}>
                {row.label}
              </Button>
            ))}
            <Button variant={row.variant} size="md" disabled>
              {row.label}
            </Button>
          </div>
        ))}
      </div>

      <SubHeading>Badge — tonos</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Referencia: <code className="font-mono">docs/design-system/components/feedback/</code>.
      </p>
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-bg-canvas-alt p-4">
        {BADGE_ROWS.map((b) => (
          <Badge key={b.tone} tone={b.tone}>
            {b.label}
          </Badge>
        ))}
      </div>

      <SubHeading>Input &amp; Textarea — gap del DS, subidos en TD.4</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        No definidos por el DS original — necesarios para el formulario de contacto de F1.
        Referencia: <code className="font-mono">docs/design-system/components/forms/</code>. Mismo
        radio que las cards (<code className="font-mono">--radius-lg</code>), hairline{' '}
        <code className="font-mono">--border-subtle</code> y un único{' '}
        <code className="font-mono">--focus-ring</code> (el mismo token que Button).
      </p>
      <div className="grid grid-cols-1 gap-6 rounded-lg bg-bg-canvas-alt p-6 sm:grid-cols-2">
        {FORM_FIELD_STATES.map((s) => (
          <div key={s.label}>
            <label htmlFor={`ds-input-${s.label}`} className="mb-1.5 block text-small font-medium">
              Name — {s.label}
            </label>
            <Input id={`ds-input-${s.label}`} {...s.props} />
          </div>
        ))}
      </div>
      <div className="mt-6 max-w-md">
        <label htmlFor="ds-textarea" className="mb-1.5 block text-small font-medium">
          Message
        </label>
        <Textarea id="ds-textarea" placeholder="Tell us about your trip…" />
      </div>

      <SubHeading>Icon — set inline estilo Lucide</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Referencia: <code className="font-mono">docs/design-system/components/media/</code>. Sin
        librería de iconos: SVG inline generado a partir de un mapa de paths.
      </p>
      <div className="flex flex-wrap gap-6 rounded-lg bg-bg-canvas-alt p-6 text-accent-secondary">
        {ICON_NAMES.map((name) => (
          <div key={name} className="flex flex-col items-center gap-1.5">
            <Icon name={name} size={24} />
            <span className="font-mono text-caption text-text-secondary">{name}</span>
          </div>
        ))}
      </div>

      <SubHeading>MapEmbed — placeholder</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Placeholder fiel al espejo; el iframe real de Google Maps se conecta en la tarea de Contact
        (F1).
      </p>
      <div className="flex flex-wrap gap-6">
        <div className="w-full max-w-md">
          <MapEmbed label="Álora, Málaga" />
        </div>
        <div className="w-70">
          <MapEmbed label="Álora, Málaga" compact />
        </div>
      </div>

      <SubHeading>Lightbox — visor a pantalla completa (TD.11)</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Referencia:{' '}
        <code className="font-mono">docs/design-system/components/media/Lightbox.*</code>. Gap del
        DS original — creado a partir de las foundations existentes (scrim
        <code className="font-mono">--charcoal-900</code>,{' '}
        <code className="font-mono">--radius-lg</code>,{' '}
        <code className="font-mono">--shadow-lg</code>) y subido a Claude Design en la misma tarea.
        Cierra con el botón, con click en el scrim fuera de la foto, o con Escape.
      </p>
      <LightboxShowcase />

      <SubHeading>LanguageSwitcher — EN / ES / DE</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Enlaces reales <code className="font-mono">/en</code>,{' '}
        <code className="font-mono">/es</code>, <code className="font-mono">/de</code>. Sin lógica
        de detección de ruta activa todavía (T0.2 la aporta) —{' '}
        <code className="font-mono">activeLocale</code> es opcional.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <LanguageSwitcher activeLocale="en" />
        <div className="rounded-lg bg-bg-inverse p-4">
          <LanguageSwitcher activeLocale="es" dark />
        </div>
      </div>

      <SubHeading>Header</SubHeading>
      <p className="mb-4 text-small text-text-secondary">
        Referencia: <code className="font-mono">docs/design-system/components/navigation/</code>.
        Nav de 5 enlaces (Home/Packages/About/Contact/Reviews), LanguageSwitcher y CTA de contacto
        siempre visible.
      </p>
      <div className="overflow-hidden rounded-lg">
        <Header
          active="packages"
          activeLocale="en"
          labels={{
            home: 'Home',
            gallery: 'Gallery',
            packages: 'Packages',
            about: 'About',
            contact: 'Contact',
            reviews: 'Reviews',
          }}
          menuOpenLabel="Open menu"
          menuCloseLabel="Close menu"
        />
      </div>

      <SubHeading>Footer</SubHeading>
      <div className="overflow-hidden rounded-lg">
        <Footer
          activeLocale="en"
          labels={{
            home: 'Home',
            gallery: 'Gallery',
            packages: 'Packages',
            about: 'About',
            contact: 'Contact',
            reviews: 'Reviews',
          }}
          columnLabels={{ explore: 'Explore', company: 'Company', follow: 'Follow' }}
          brandBlurb="Guided enduro routes from Álora, Málaga. Multi-day packages with bike and accommodation included."
        />
      </div>

      <ShowcaseSectionHeading>Cards</ShowcaseSectionHeading>

      {/* Etiqueta sin nivel de heading (no <SubHeading>/h3): las filas de abajo
          ya renderizan su propio <h2> vía la primitiva SectionHeading —
          anteponer un h3 aquí produciría un salto de jerarquía h2→h3→h2. */}
      <p className="mb-3 text-h4 text-text-secondary">SectionHeading — eyebrow/title/align/light</p>
      <p className="mb-4 text-small text-text-secondary">
        Referencia: <code className="font-mono">docs/design-system/components/cards/</code>.
      </p>
      <div className="flex flex-col gap-8">
        {SECTION_HEADING_ROWS.map((row) => (
          <div key={row.label} className={row.wrapperClassName}>
            <p className="mb-2 text-caption font-mono text-text-secondary">{row.label}</p>
            <SectionHeading {...row.props} />
          </div>
        ))}
      </div>

      <SubHeading>PackageCard — con y sin highlight</SubHeading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PACKAGE_CARD_ROWS.map((row) => (
          <div key={row.label}>
            <p className="mb-2 text-caption font-mono text-text-secondary">{row.label}</p>
            <PackageCard {...row.props} />
          </div>
        ))}
      </div>

      <SubHeading>FleetCard — enduro vs trail-adventure</SubHeading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FLEET_CARD_ROWS.map((row) => (
          <div key={row.label}>
            <p className="mb-2 text-caption font-mono text-text-secondary">{row.label}</p>
            <FleetCard {...row.props} />
          </div>
        ))}
      </div>

      <SubHeading>ReviewCard — rating 4 vs 5</SubHeading>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {REVIEW_CARD_ROWS.map((row) => (
          <div key={row.label}>
            <p className="mb-2 text-caption font-mono text-text-secondary">{row.label}</p>
            <ReviewCard {...row.props} />
          </div>
        ))}
      </div>
    </main>
  );
}
