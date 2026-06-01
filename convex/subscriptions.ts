import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthedUser } from "./lib/auth";

/**
 * Helper: load + verify a subscription belongs to the calling user.
 */
async function loadOwnedSubscription(
  ctx: MutationCtx,
  subscriptionId: Id<"subscriptions">
): Promise<{ user: Doc<"users">; subscription: Doc<"subscriptions"> }> {
  const user = await getAuthedUser(ctx);
  const subscription = await ctx.db.get(subscriptionId);
  if (!subscription) throw new Error("Subscription not found");
  if (subscription.userId !== user._id) {
    throw new Error("Unauthorized — not your subscription");
  }
  return { user, subscription };
}

// ─────────────────────────────────────────────────────────────────
// Internal mutations (called from convex/http.ts on Stripe events)
// ─────────────────────────────────────────────────────────────────

/**
 * INTERNAL — upsert the Convex subscription record from a Stripe
 * `customer.subscription.{created,updated}` payload. Idempotent on
 * `stripeSubscriptionId`.
 */
export const upsertFromStripe = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    tier: v.string(),
    cadence: v.string(),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find the owner user by stripeCustomerId.
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
    if (!user) {
      throw new Error(
        `No Convex user has stripeCustomerId=${args.stripeCustomerId}`
      );
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    const patch = {
      userId: user._id,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: args.status,
      tier: args.tier,
      boxSize: args.tier,
      cadence: args.cadence,
      frequency: args.cadence,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
    };

    let subscriptionId: Id<"subscriptions">;
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      subscriptionId = existing._id;
    } else {
      subscriptionId = await ctx.db.insert("subscriptions", {
        ...patch,
        createdAt: Date.now(),
      });
    }

    // Mirror denormalized status onto the user record for cheap reads.
    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status,
    });

    return subscriptionId;
  },
});

/**
 * INTERNAL — Stripe `customer.subscription.deleted`. Marks the
 * subscription cancelled. Does not delete the row (audit trail).
 */
export const markCancelledFromStripe = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();
    if (!sub) return null;

    await ctx.db.patch(sub._id, {
      status: "cancelled",
      cancelAtPeriodEnd: false,
    });
    await ctx.db.patch(sub.userId, { subscriptionStatus: "cancelled" });
    return sub._id;
  },
});

/**
 * LEGACY internal — old one-off-checkout fulfillment.
 * Retained so existing webhook flows keep working through the cutover.
 * New subscriptions are seeded via `upsertFromStripe` instead.
 */
export const fulfillSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    tier: v.string(),
    frequency: v.string(),
    stripeSessionId: v.string(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
    if (existing) return existing._id;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error(`User ${args.clerkId} not found`);

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: user._id,
      tier: args.tier,
      boxSize: args.tier,
      frequency: args.frequency,
      cadence: args.frequency,
      status: "active",
      startDate: Date.now(),
      stripeSessionId: args.stripeSessionId,
      paymentId: args.paymentId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: "active",
    });
    return subscriptionId;
  },
});

/**
 * INTERNAL — used by convex/http.ts (`invoice.created`) to map a
 * Stripe subscription id back to its Convex record.
 */
export const findByStripeSubscriptionId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique(),
});

// ─────────────────────────────────────────────────────────────────
// Public queries
// ─────────────────────────────────────────────────────────────────

export const getSubscriptionByStripeSession = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
    if (!sub) return null;
    return { id: sub._id, status: sub.status, tier: sub.tier };
  },
});

export const getMySubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(50);
  },
});

export const getMyActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(50);
    return (
      rows.find((s) => s.status === "active") ??
      rows.find((s) => s.status === "past_due") ??
      rows.find((s) => s.status === "paused") ??
      null
    );
  },
});

// ─────────────────────────────────────────────────────────────────
// Public mutations (auth + ownership)
// ─────────────────────────────────────────────────────────────────

export const pauseSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    pausedUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { subscription } = await loadOwnedSubscription(ctx, args.subscriptionId);
    if (subscription.status !== "active") {
      throw new Error("Can only pause an active subscription");
    }
    await ctx.db.patch(subscription._id, {
      status: "paused",
      pausedUntil: args.pausedUntil,
    });
  },
});

export const resumeSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const { subscription } = await loadOwnedSubscription(ctx, args.subscriptionId);
    if (subscription.status !== "paused") {
      throw new Error("Can only resume a paused subscription");
    }
    await ctx.db.patch(subscription._id, {
      status: "active",
      pausedUntil: undefined,
    });
  },
});

export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    atPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { subscription } = await loadOwnedSubscription(ctx, args.subscriptionId);
    if (subscription.status === "cancelled") {
      throw new Error("Already cancelled");
    }
    if (args.atPeriodEnd === false) {
      await ctx.db.patch(subscription._id, { status: "cancelled" });
    } else {
      await ctx.db.patch(subscription._id, { cancelAtPeriodEnd: true });
    }
    // Note: the *real* Stripe cancellation must be issued from the
    // Next.js API route (server-side Stripe SDK). This mutation only
    // records the user's intent; the webhook flow then confirms it.
  },
});

export const setPrimaryAddress = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    addressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const { user, subscription } = await loadOwnedSubscription(
      ctx,
      args.subscriptionId
    );
    const addr = await ctx.db.get(args.addressId);
    if (!addr || addr.userId !== user._id) {
      throw new Error("Address not found or not yours");
    }
    await ctx.db.patch(subscription._id, {
      primaryAddressId: args.addressId,
    });
  },
});

export const updateSubscriptionStatus = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const { subscription } = await loadOwnedSubscription(ctx, args.subscriptionId);
    const allowed = ["active", "paused", "cancelled"];
    if (!allowed.includes(args.status)) {
      throw new Error(
        `Invalid status: ${args.status}. Must be one of: ${allowed.join(", ")}`
      );
    }
    await ctx.db.patch(subscription._id, { status: args.status });
  },
});
