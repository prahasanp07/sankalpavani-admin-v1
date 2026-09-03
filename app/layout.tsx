import type {Metadata} from 'next';
import { Libre_Caslon_Text, Manrope } from 'next/font/google';
import './globals.css'; // Global styles

const libreCaslon = Libre_Caslon_Text({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SankalpVani Admin Portal',
  description: 'Divine administration system for SankalpVani Temple.',
};

import { Providers } from '../components/Providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${libreCaslon.variable} ${manrope.variable}`}>
      <head>
        {/* Load Material Symbols Outlined icon font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased text-on-surface bg-background min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
