import type { Metadata } from 'next';
import './globals.css';
import { interBody, oswaldDisplay } from './fonts';

export const metadata: Metadata = {
  title: 'EnduroFun',
  description: 'Rutas guiadas de enduro en la provincia de Málaga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interBody.variable} ${oswaldDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
