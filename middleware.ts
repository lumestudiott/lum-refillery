import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Clerk middleware — required for `auth()` from `@clerk/nextjs/server`
 * to work in route handlers and server components.
 *
 * All routes are public by default. To require auth on a route, use
 * `await auth.protect()` inside the route handler or wrap with
 * `createRouteMatcher` here. We do per-route gating in handlers
 * (see `src/app/api/checkout/route.ts`) for now.
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
