import type { Company } from '@app/core/contracts';

// Placeholder de F0 — se sustituye por src/data/company.ts (PRD §7) en la
// tarea que monta el contenido real. Tipado contra @app/core a propósito: un
// campo requerido roto en CompanySchema debe romper esta compilación (T0.1,
// control negativo).
const company: Company = {
  name: 'EnduroFun',
  email: 'hola@endurofun.eu',
  location: { address: 'Álora, Málaga', lat: 36.8299, lng: -4.7106 },
  social: { instagram: 'https://instagram.com/endurofun' },
};

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2">
      <h1 className="text-3xl font-bold">Hello {company.name}</h1>
      <p className="text-neutral-500">Enduro guiado en Álora, Málaga.</p>
    </main>
  );
}
