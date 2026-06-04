import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ClerkRoleClaims = {
  publicMetadata?: { role?: string };
  role?: string;
  org_role?: string;
};

/**
 * Resolve the currently authenticated Convex user record.
 * Throws if not authenticated or if no `users` row exists for the
 * Clerk subject (call `users.createUser` on first sign-in).
 */
export async function getAuthedUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    // Fallback for users created before tokenIdentifier migration
    user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  }

  if (!user) {
    throw new Error(
      "User record not found in Convex. Call api.users.createUser first."
    );
  }

  return user;
}

/**
 * Same as `getAuthedUser` but returns `null` instead of throwing when
 * the caller is unauthenticated. Useful in queries that should degrade
 * gracefully for signed-out viewers.
 */
export async function getAuthedUserOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    // Fallback for users created before tokenIdentifier migration
    user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  }

  return user;
}

/**
 * Returns true if the current identity has admin privileges.
 * Admin is granted by either:
 *   1. `users.isAdmin === true` in our table, OR
 *   2. Clerk JWT custom claim `publicMetadata.role === "admin"`.
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const claims = identity as typeof identity & ClerkRoleClaims;
  const role = claims.publicMetadata?.role ?? claims.role ?? claims.org_role;
  if (role === "admin" || role === "org:admin") return true;

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  }

  return user?.isAdmin === true;
}

/**
 * Throws unless the caller is an admin.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const ok = await isAdmin(ctx);
  if (!ok) {
    throw new Error("Unauthorized — admin access required");
  }
  return await getAuthedUserOrNull(ctx);
}
