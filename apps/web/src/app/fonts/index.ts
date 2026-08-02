import localFont from 'next/font/local';

// Self-hosted Inter (body) — latin-subset static woff2, downloaded from Google Fonts
// so the site makes zero requests to fonts.googleapis.com/fonts.gstatic.com at runtime.
// Weights mirror docs/design-system/tokens/typography.css (--fw-regular/medium/semibold/bold).
//
// T3.3 — 700 (bold) retirado: `grep -rn "font-bold" src --include="*.tsx"` no
// devuelve NINGÚN resultado en todo el proyecto (ni en las 6 páginas
// públicas ni en `/design-system`) — es un peso que ningún elemento renderiza
// jamás, así que preloadearlo en cada página solo compite por ancho de banda
// con recursos que sí importan para el LCP (Lighthouse móvil, Home:
// `lcp-discovery-insight`/`lcp-breakdown-insight` flanqueaban justo esto —
// 8 ficheros de fuente `High` priority disparados a la vez que el poster del
// hero). 400/500/600 SÍ se usan (body por defecto, `font-medium` en
// `/design-system`, `font-semibold` en `ReviewCard`/Reviews) y se mantienen.
export const interBody = localFont({
  src: [
    { path: './inter-400.woff2', weight: '400', style: 'normal' },
    { path: './inter-500.woff2', weight: '500', style: 'normal' },
    { path: './inter-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-app-body',
  display: 'swap',
});

// Self-hosted Oswald (display) — latin-subset static woff2, same sourcing as Inter above.
//
// T3.3 — 400/500/700 retirados: `.font-display`/`h1`-`h4` (globals.css
// `@layer base`) fijan `font-weight: var(--fw-semibold)` (600) SIEMPRE — no
// existe ni una sola regla en el proyecto que pinte texto Oswald en otro
// peso (verificado leyendo cada uso de `.font-display`/`font-semibold` del
// código, ninguno combina con `font-normal`/`font-medium`/`font-bold`). Los
// 3 ficheros eran peso muerto: se preloadeaban (`High` priority) en TODAS
// las páginas sin que ningún glifo los usara nunca, compitiendo con el
// poster/vídeo del hero por el ancho de banda inicial bajo el throttling
// móvil de Lighthouse. Si algún día se necesita un peso distinto de Oswald,
// se añade aquí de vuelta junto con su uso real (nunca "por si acaso").
export const oswaldDisplay = localFont({
  src: [{ path: './oswald-600.woff2', weight: '600', style: 'normal' }],
  variable: '--font-app-display',
  display: 'swap',
});
