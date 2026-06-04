import { v } from "convex/values";
import {
  mutation,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Create (or upsert) the Convex user record for the *currently authenticated*
 * Clerk user. Identity claims are derived from `ctx.auth.getUserIdentity()`,
 * so the client cannot impersonate another user by passing arbitrary args.
 *
 * Idempotent on `clerkId`.
 */
export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;
    const tokenIdentifier = identity.tokenIdentifier;
    const email = identity.email ?? "";
    const name =
      identity.name ?? identity.givenName ?? identity.preferredUsername ?? undefined;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      if (existingUser.tokenIdentifier !== tokenIdentifier) {
        await ctx.db.patch(existingUser._id, { tokenIdentifier });
      }
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId,
      tokenIdentifier,
      email,
      name,
      creditsCents: 0,
      createdAt: Date.now(),
    });

    // Best-effort: link any open referral invite addressed to this email.
    if (email) {
      try {
        await ctx.runMutation(internal.referrals.linkOnSignup, {
          refereeUserId: userId,
          refereeEmail: email,
        });
      } catch (err) {
        console.warn("referral link skipped:", err);
      }
    }

    return userId;
  },
});

/**
 * Persist the caller's Stripe customer id on their user record.
 *
 * Public mutation gated by `ctx.auth.getUserIdentity()` — the clerkId is
 * derived from the JWT (NEVER trusted from args), so this is safe even
 * though it's reachable from the public API. The Next.js checkout route
 * forwards the Clerk JWT to ConvexHttpClient via `setAuth(...)` so this
 * runs as the authenticated user.
 *
 * Idempotent: a second call with the same id is a no-op; a call with a
 * different id throws (prevents accidentally overwriting a customer).
 */
export const setMyStripeCustomerId = mutation({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (
      user.stripeCustomerId &&
      user.stripeCustomerId !== args.stripeCustomerId
    ) {
      throw new Error(
        `User already has a different Stripe customer id (${user.stripeCustomerId})`
      );
    }
    if (!user.stripeCustomerId) {
      await ctx.db.patch(user._id, { stripeCustomerId: args.stripeCustomerId });
    }
    return user._id;
  },
});

/**
 * INTERNAL read — find a user by Clerk id (for the checkout route).
 */
export const findByClerkIdInternal = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique(),
});

/**
 * Public lookup — returns the user record for a given Clerk ID.
 * Reads only; no write surface, safe to leave public.
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * INTERNAL — invoked from Convex code (e.g. the Stripe webhook HTTP action)
 * to patch a user's tier/status. Not reachable from public API.
 */
export const updateUserSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    subscriptionTier: v.string(),
    subscriptionStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      subscriptionTier: args.subscriptionTier,
      subscriptionStatus: args.subscriptionStatus,
    });

    return user._id;
  },
});