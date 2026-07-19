import type { NextConfig } from 'next';

// PRD §6.2: exportación estática desde el día 1 — Cloudflare Pages sirve el
// HTML generado, sin runtime de servidor Next que operar.
const nextConfig: NextConfig = {
  output: 'export',
  // T0.2: sin esto, el export escribe `out/en.html` (fichero suelto) en vez
  // de `out/en/index.html` (carpeta) — la Verificación de T0.2 exige
  // literalmente `out/en/index.html`, y es además la forma que los hosts
  // estáticos (Cloudflare Pages incluido) resuelven sin servidor: piden
  // `/en/` con barra final y sirven `index.html` de esa carpeta.
  trailingSlash: true,
  // hotfix logo Header: `next/image` necesita la Image Optimization API (un
  // servidor) para redimensionar/servir formatos on-demand — `output:
  // 'export'` no tiene servidor, así que se sirve el asset tal cual sin
  // pasar por esa pipeline.
  images: { unoptimized: true },
};

export default nextConfig;
