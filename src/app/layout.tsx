import type { Metadata } from 'next';
import { Providers } from './providers';
import MaintenanceBanner from '@/components/MaintenanceBanner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://lumerefillery.com'),
  title: {
    default: 'Lumë Refillery — Sustainable Grocery Subscriptions',
    template: '%s | Lumë Refillery',
  },
  description:
    'Reliable grocery subscriptions, thoughtfully built for everyday tables. Curated hauls delivered on your schedule — zero waste, premium quality.',
  keywords: [
    'refillery',
    'sustainable groceries',
    'grocery subscription',
    'zero waste',
    'eco-friendly',
    'bulk refill',
    'Lumë Refillery',
    'lume refillery',
  ],
  authors: [{ name: 'Lumë Refillery' }],
  creator: 'Lumë Refillery',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lumerefillery.com',
    siteName: 'Lumë Refillery',
    title: 'Lumë Refillery — Sustainable Grocery Subscriptions',
    description:
      'Reliable grocery subscriptions, thoughtfully built for everyday tables. Curated hauls delivered on your schedule.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lumë Refillery — Sustainable Grocery Subscriptions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumë Refillery — Sustainable Grocery Subscriptions',
    description:
      'Reliable grocery subscriptions, thoughtfully built for everyday tables. Curated hauls delivered on your schedule.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://lumerefillery.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning on <html> only: browser extensions (e.g. Scribe)
          inject attributes here before React hydrates — this is outside our control */}
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-cream-50 text-stone-800 antialiased" suppressHydrationWarning>
        <MaintenanceBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
