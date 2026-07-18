import Link from 'next/link';

// Raíz estática (`out/index.html`) — T0.2: redirección fija a `/en/`.
// Deliberadamente SIN JS de detección de idioma de navegador (PRD D11): el
// selector de idioma es siempre manual (`LanguageSwitcher`). El mecanismo es
// un <meta httpEquiv="refresh"> (funciona sin JS, sin servidor, en un export
// 100% estático) + un enlace visible de fallback para navegadores/lectores
// que no procesen el refresh. Next.js hoiste automáticamente <meta>/<title>
// renderizados a nivel de página dentro del <head> del documento.
export default function RootRedirectPage() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/en/" />
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-text-secondary">
          Redirecting to{' '}
          <Link href="/en/" className="text-accent-primary underline underline-offset-2">
            the English site
          </Link>
          …
        </p>
      </main>
    </>
  );
}
