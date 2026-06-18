import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Clerk middleware — required for `auth()` from `@clerk/nextjs/server`
 * to work in route handlers and server components.
 *
 * Maintenance-mode routing is handled by vercel.json rewrites at the
 * edge-router level (before static files / CDN cache are served).
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Run middleware on all routes except static assets / Next internals.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|webmanifest|woff2?|ttf|otf)).*)',
    // Always run for API routes.
    '/(api|trpc)(.*)',
  ],
};
