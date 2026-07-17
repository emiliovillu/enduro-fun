import type { NextConfig } from 'next';

// PRD §6.2: exportación estática desde el día 1 — Cloudflare Pages sirve el
// HTML generado, sin runtime de servidor Next que operar.
const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
