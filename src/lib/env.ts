/**
 * SERVER-ONLY env helpers.
 *
 * These functions use dynamic `process.env[name]` lookups which Next.js
 * CANNOT statically inline into client bundles. Importing this file from a
 * client component will cause `NEXT_PUBLIC_*` vars to be `undefined` at
 * runtime, even though they are correctly defined in `.env.local`.
 *
 * For client-side access, read the var as a static literal:
 *
 *   const value = process.env.NEXT_PUBLIC_FOO;
 *
 * Only use this module from:
 *   - Route handlers (`app/api/.../route.ts`)
 *   - Server components / server actions
 *   - Other server-only modules
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Resolves the Convex deployment URL for server-side `ConvexHttpClient`.
 * Accepts either `CONVEX_URL` (server-only secret) or
 * `NEXT_PUBLIC_CONVEX_URL` (the URL the browser already uses — the value
 * is identical and is not sensitive).
 */
export function getServerConvexUrl(): string {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      'Missing required environment variable: CONVEX_URL or NEXT_PUBLIC_CONVEX_URL'
    );
  }
  return url;
}
