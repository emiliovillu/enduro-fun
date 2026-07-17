import localFont from 'next/font/local';

// Self-hosted Inter (body) — latin-subset static woff2, downloaded from Google Fonts
// so the site makes zero requests to fonts.googleapis.com/fonts.gstatic.com at runtime.
// Weights mirror docs/design-system/tokens/typography.css (--fw-regular/medium/semibold/bold).
export const interBody = localFont({
  src: [
    { path: './inter-400.woff2', weight: '400', style: 'normal' },
    { path: './inter-500.woff2', weight: '500', style: 'normal' },
    { path: './inter-600.woff2', weight: '600', style: 'normal' },
    { path: './inter-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-app-body',
  display: 'swap',
});

// Self-hosted Oswald (display) — latin-subset static woff2, same sourcing as Inter above.
export const oswaldDisplay = localFont({
  src: [
    { path: './oswald-400.woff2', weight: '400', style: 'normal' },
    { path: './oswald-500.woff2', weight: '500', style: 'normal' },
    { path: './oswald-600.woff2', weight: '600', style: 'normal' },
    { path: './oswald-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-app-display',
  display: 'swap',
});
