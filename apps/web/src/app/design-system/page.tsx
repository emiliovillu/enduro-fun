import type { Metadata } from 'next';

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
  { label: '--accent-primary', className: 'bg-accent-primary text-white' },
  { label: '--accent-secondary', className: 'bg-accent-secondary text-white' },
  { label: '--accent-amber', className: 'bg-accent-amber text-text-primary' },
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

function SectionHeading({ children }: { children: React.ReactNode }) {
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

      <SectionHeading>Colores</SectionHeading>

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

      <SectionHeading>Tipografía</SectionHeading>

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

      <SectionHeading>Espaciado y radios</SectionHeading>

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
    </main>
  );
}
