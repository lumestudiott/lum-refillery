import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/onboarding/', '/cancel/', '/success/', '/gift-success/'],
      },
    ],
    sitemap: 'https://lumerefillery.com/sitemap.xml',
  };
}
