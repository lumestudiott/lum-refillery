import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Helper: Resolves the current authenticated user from Clerk identity.
 * Throws if not authenticated or user record not found in Convex.
 */
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Helper: Verifies that a subscription belongs to the authenticated user.
 * Throws "Unauthorized" if the subscription belongs to someone else.
 */
async function verifySubscriptionOwnership(ctx: any, subscriptionId: any) {
  const user = await getAuthenticatedUser(ctx);
  const subscription = await ctx.db.get(subscriptionId);

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.userId !== user._id) {
    throw new Error("Unauthorized — you can only modify your own subscriptions");
  }

  return { user, subscription };
}

export const createSubscription = mutation({
  args: {
    tier: v.string(),
    frequency: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: user._id,
      tier: args.tier,
      frequency: args.frequency,
      status: args.status || "active",
      startDate: Date.now(),
      createdAt: Date.now(),
    });

    return subscriptionId;
  },
});

export const getUserSubscriptions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getMySubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Update subscription status — requires auth + ownership verification.
 * Only the subscription owner can change its status.
 */
export const updateSubscriptionStatus = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await verifySubscriptionOwnership(ctx, args.subscriptionId);

    // Validate allowed status values
    const allowedStatuses = ["active", "paused", "cancelled"];
    if (!allowedStatuses.includes(args.status)) {
      throw new Error(`Invalid status: ${args.status}. Must be one of: ${allowedStatuses.join(", ")}`);
    }

    await ctx.db.patch(args.subscriptionId, {
      status: args.status,
    });
  },
});

/**
 * Pause subscription — requires auth + ownership verification.
 */
export const pauseSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const { subscription } = await verifySubscriptionOwnership(ctx, args.subscriptionId);

    if (subscription.status !== "active") {
      throw new Error("Can only pause an active subscription");
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "paused",
    });
  },
});

/**
 * Resume subscription — requires auth + ownership verification.
 */
export const resumeSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const { subscription } = await verifySubscriptionOwnership(ctx, args.subscriptionId);

    if (subscription.status !== "paused") {
      throw new Error("Can only resume a paused subscription");
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "active",
    });
  },
});

/**
 * Cancel subscription — requires auth + ownership verification.
 */
export const cancelSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const { subscription } = await verifySubscriptionOwnership(ctx, args.subscriptionId);

    if (subscription.status === "cancelled") {
      throw new Error("Subscription is already cancelled");
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "cancelled",
    });
  },
});