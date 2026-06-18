import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Maintenance-mode domains — requests to these hosts are rewritten
 * to /maintenance at the edge, before any static HTML is served.
 * This guarantees zero flash of the homepage.
 */
const MAINTENANCE_DOMAINS = ['lumerefillery.com', 'www.lumerefillery.com'];

/**
 * Paths that should NOT be rewritten even on maintenance domains.
 * This allows the maintenance page itself, static assets, and APIs to load.
 */
const MAINTENANCE_BYPASS = [
  '/maintenance',
  '/_next',
  '/api',
  '/favicon',
  '/videos',
  '/images',
  '/robots.txt',
  '/sitemap.xml',
];

export default clerkMiddleware(async (_auth, req) => {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // Check if this request is hitting a maintenance domain
  const isMaintenanceDomain = MAINTENANCE_DOMAINS.some((d) =>
    hostname.includes(d),
  );

  // If on a maintenance domain and not on a bypass path, rewrite to /maintenance
  if (
    isMaintenanceDomain &&
    !MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))
  ) {
    const maintenanceUrl = req.nextUrl.clone();
    maintenanceUrl.pathname = '/maintenance';
    return NextResponse.rewrite(maintenanceUrl);
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes except static assets / Next internals.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|webmanifest|woff2?|ttf|otf)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
