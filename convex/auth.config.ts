/**
 * Convex auth configuration.
 *
 * CLERK_JWT_ISSUER_DOMAIN must be set as a Convex environment variable
 * (via the Convex dashboard or `npx convex env set`).
 *
 * For dev: https://skilled-stag-65.clerk.accounts.dev
 * For prod: set to your production Clerk domain
 */
const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!domain) {
  throw new Error(
    "Missing CLERK_JWT_ISSUER_DOMAIN environment variable. " +
    "Set it in the Convex dashboard or via `npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-clerk-domain>`"
  );
}

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
