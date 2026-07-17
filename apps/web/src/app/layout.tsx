import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EnduroFun',
  description: 'Rutas guiadas de enduro en la provincia de Málaga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
