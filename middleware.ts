import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_DOMAINS = ['lumerefillery.com', 'www.lumerefillery.com'];

export default function middleware(req: NextRequest, event: any) {
  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.hostname || '';
  const domain = hostname.split(':')[0];
  const isMaintenanceDomain = MAINTENANCE_DOMAINS.includes(domain);

  console.log('MAINT_DEBUG:', { hostname, domain, isMaintenanceDomain, url: req.nextUrl.pathname });

  if (isMaintenanceDomain) {
    const url = req.nextUrl.clone();

    // Return 503 JSON for API routes
    if (url.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Service Unavailable (Maintenance)' }),
        { status: 503, headers: { 'content-type': 'application/json' } }
      );
    }

    // Rewrite pages to the /maintenance page
    if (url.pathname !== '/maintenance') {
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

  // Fallback to clerkMiddleware
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: [
    // Run middleware on all routes except static assets / Next internals.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|webmanifest|woff2?|ttf|otf)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
