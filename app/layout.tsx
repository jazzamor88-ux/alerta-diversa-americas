import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alerta Diversa Américas',
  description: 'Registro y visualización multilingüe de crímenes de odio en las Américas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
