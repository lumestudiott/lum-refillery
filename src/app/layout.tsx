import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lume Refillery — Fresh Groceries Delivered Weekly',
  description:
    'Reliable grocery subscriptions, thoughtfully built for everyday tables. Curated hauls delivered on your schedule.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    {/* suppressHydrationWarning on <html> only: browser extensions (e.g. Scribe)
        inject attributes here before React hydrates — this is outside our control */}
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-cream-50 text-stone-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
