import { clerkMiddleware } from '@clerk/nextjs/server';
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from 'next/server';

/**
 * Maintenance-mode domains — requests to these hosts are rewritten
 * to /maintenance at the edge, before any HTML is served.
 *
 * Empty = site is LIVE. To put the site back into maintenance, re-add the
 * domains, e.g. ['lumerefillery.com', 'www.lumerefillery.com'].
 */
const MAINTENANCE_DOMAINS: string[] = [
  'lumerefillery.com',
  'www.lumerefillery.com',
  // Vercel's auto production alias — gate it too so it can't leak the real
  // site while in maintenance. (Preview/staging *.vercel.app URLs are NOT
  // listed here, so the test site still shows the real site on dev backend.)
  'lum-refillery-ten.vercel.app',
];

/**
 * Paths that bypass maintenance (static assets, the maintenance page itself, etc.)
 */
const MAINTENANCE_BYPASS = [
  '/maintenance',
  '/admin', // admins manage the store while the public site shows maintenance
  '/_next',
  '/api',
  '/favicon',
  '/videos',
  '/images',
  '/robots.txt',
  '/sitemap.xml',
];

/** Pre-initialised Clerk middleware for non-maintenance requests. */
const clerk = clerkMiddleware();

/**
 * Top-level middleware: checks maintenance FIRST (before Clerk),
 * so the rewrite happens at the earliest possible point.
 */
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Strip any port and lowercase so we can match the host exactly. Exact
  // match (not `includes`) is important so subdomains like
  // `staging.lumerefillery.com` are NOT swept into maintenance.
  const hostname = (req.headers.get('host') || req.nextUrl.hostname || '')
    .split(':')[0]
    .toLowerCase();
  const { pathname } = req.nextUrl;

  const isMaintenanceDomain = MAINTENANCE_DOMAINS.includes(hostname);

  // Rewrite to /maintenance immediately — no Clerk, no auth, no flash
  if (
    isMaintenanceDomain &&
    !MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  // Non-maintenance requests go through Clerk as normal
  return clerk(req, event);
}

export const config = {
  matcher: [
    // Run middleware on all routes except static assets / Next internals.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|webmanifest|woff2?|ttf|otf)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
