import {
  mutation,
  internalMutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./lib/rateLimit";

type ClerkRoleClaims = {
  publicMetadata?: { role?: string };
  role?: string;
  org_role?: string;
};

/**
 * Helper: Check if the current user has admin role.
 * Uses Clerk's publicMetadata to determine admin status.
 * Returns true if admin, false otherwise.
 */
async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const claims = identity as typeof identity & ClerkRoleClaims;
  const role = claims.publicMetadata?.role || claims.role || claims.org_role;

  return role === "admin" || role === "org:admin";
}

/**
 * Helper: Require admin access. Throws if not admin.
 */
async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const admin = await isAdmin(ctx);
  if (!admin) {
    throw new Error("Unauthorized — admin access required");
  }

  return identity;
}

/**
 * Create a new gift subscription.
 * Requires authentication to prevent bot spam.
 */
export const createGiftSubscription = mutation({
  args: {
    giverName: v.string(),
    giverEmail: v.string(),
    recipientName: v.string(),
    recipientEmail: v.string(),
    recipientAddress: v.string(),
    recipientCity: v.string(),
    recipientState: v.string(),
    recipientZip: v.string(),
    tier: v.string(),
    billingCycle: v.string(),
    giftMessage: v.optional(v.string()),
    amount: v.number(),
    paymentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ── Auth gate: require authenticated user ────────────────────
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated — sign in to send a gift subscription");
    }

    // ── Input validation ─────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.giverEmail)) {
      throw new Error("Invalid giver email address");
    }
    if (!emailRegex.test(args.recipientEmail)) {
      throw new Error("Invalid recipient email address");
    }

    const validTiers = ["supported", "essential", "household", "premium", "gourmet", "bulk"];
    if (!validTiers.includes(args.tier)) {
      throw new Error(`Invalid tier: ${args.tier}`);
    }

    const validCycles = ["fortnightly", "monthly", "yearly"];
    if (!validCycles.includes(args.billingCycle)) {
      throw new Error(`Invalid billing cycle: ${args.billingCycle}`);
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // ── Rate limiting ────────────────────────────────────────────
    const status = await rateLimiter.limit(ctx, "giftCreation", { key: identity.subject });
    if (!status.ok) {
      throw new Error("Rate limit exceeded for gift creation");
    }

    const giftSubscriptionId = await ctx.db.insert("giftSubscriptions", {
      giverName: args.giverName,
      giverEmail: args.giverEmail,
      recipientName: args.recipientName,
      recipientEmail: args.recipientEmail,
      recipientAddress: args.recipientAddress,
      recipientCity: args.recipientCity,
      recipientState: args.recipientState,
      recipientZip: args.recipientZip,
      tier: args.tier,
      billingCycle: args.billingCycle,
      giftMessage: args.giftMessage,
      amount: args.amount,
      status: "pending",
      paymentId: args.paymentId,
      stripeSessionId: args.stripeSessionId,
      createdAt: Date.now(),
    });

    return giftSubscriptionId;
  },
});

/**
 * INTERNAL — payment-webhook only. Marks a gift as paid/delivered by
 * looking it up via `paymentId`. No auth here because this is unreachable
 * from the public API.
 */
export const updateGiftSubscriptionStatus = internalMutation({
  args: {
    paymentId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const giftSubscription = await ctx.db
      .query("giftSubscriptions")
      .filter((q) => q.eq(q.field("paymentId"), args.paymentId))
      .first();

    if (!giftSubscription) {
      throw new Error("Gift subscription not found");
    }

    await ctx.db.patch(giftSubscription._id, {
      status: args.status,
      ...(args.status === "paid" && { paidAt: Date.now() }),
      ...(args.status === "delivered" && { deliveredAt: Date.now() }),
    });

    return giftSubscription._id;
  },
});

/**
 * Attach a Stripe Checkout session ID to a pending gift.
 *
 * Authenticated. The caller's primary email must match `gift.giverEmail`,
 * preventing arbitrary users from squatting session IDs on other people's
 * pending gifts. Called from `/api/checkout/gift` immediately after
 * creating the Stripe Checkout Session.
 */
export const attachStripeSessionToGift = mutation({
  args: {
    id: v.id("giftSubscriptions"),
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const giftSubscription = await ctx.db.get(args.id);
    if (!giftSubscription) {
      throw new Error("Gift subscription not found");
    }

    if (giftSubscription.giverEmail.toLowerCase() !== identity.email.toLowerCase()) {
      throw new Error("Unauthorized — you can only attach sessions to your own gifts");
    }

    if (
      giftSubscription.stripeSessionId &&
      giftSubscription.stripeSessionId !== args.stripeSessionId
    ) {
      throw new Error("Gift subscription already has a different Stripe session");
    }

    await ctx.db.patch(args.id, {
      stripeSessionId: args.stripeSessionId,
    });

    return args.id;
  },
});

export const cancelPendingGiftSubscription = mutation({
  args: { id: v.id("giftSubscriptions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const giftSubscription = await ctx.db.get(args.id);
    if (!giftSubscription) {
      return null;
    }

    if (giftSubscription.giverEmail !== identity.email) {
      throw new Error("Unauthorized — you can only cancel your own pending gifts");
    }

    if (giftSubscription.status !== "pending") {
      return giftSubscription._id;
    }

    await ctx.db.patch(args.id, { status: "cancelled" });
    return args.id;
  },
});

/**
 * INTERNAL — payment-webhook only. Updates a gift by Stripe session ID.
 * No auth here because internal mutations are unreachable from public API.
 */
export const updateGiftSubscriptionByStripeSession = internalMutation({
  args: {
    stripeSessionId: v.string(),
    paymentId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const giftSubscription = await ctx.db
      .query("giftSubscriptions")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (!giftSubscription) {
      // Try by filtering if the index hasn't propagated yet
      const fallback = await ctx.db
        .query("giftSubscriptions")
        .filter((q) => q.eq(q.field("stripeSessionId"), args.stripeSessionId))
        .first();

      if (!fallback) {
        throw new Error(`Gift subscription not found for session: ${args.stripeSessionId}`);
      }

      await ctx.db.patch(fallback._id, {
        status: args.status,
        paymentId: args.paymentId || undefined,
        ...(args.status === "paid" && { paidAt: Date.now() }),
      });
      return fallback._id;
    }

    await ctx.db.patch(giftSubscription._id, {
      status: args.status,
      paymentId: args.paymentId || undefined,
      ...(args.status === "paid" && { paidAt: Date.now() }),
    });

    return giftSubscription._id;
  },
});

/**
 * Get gift subscriptions sent by the authenticated user.
 * Scoped to the user's own email — no cross-user data leakage.
 */
export const getGiftSubscriptionsByGiver = query({
  args: { giverEmail: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.email !== args.giverEmail) return [];

    return await ctx.db
      .query("giftSubscriptions")
      .withIndex("by_giver_email", (q) => q.eq("giverEmail", args.giverEmail))
      .order("desc")
      .collect();
  },
});

/**
 * Get gift subscriptions received by the authenticated user.
 * Scoped to the user's own email.
 */
export const getGiftSubscriptionsByRecipient = query({
  args: { recipientEmail: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.email !== args.recipientEmail) return [];

    return await ctx.db
      .query("giftSubscriptions")
      .withIndex("by_recipient_email", (q) => q.eq("recipientEmail", args.recipientEmail))
      .order("desc")
      .collect();
  },
});

/**
 * Get all gift subscriptions — ADMIN ONLY.
 * Requires the user to have an admin role set in Clerk publicMetadata.
 */
export const getAllGiftSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    // ── Admin gate ──────────────────────────────────────────────
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const admin = await isAdmin(ctx);
    if (!admin) {
      throw new Error("Unauthorized — admin access required");
    }

    return await ctx.db
      .query("giftSubscriptions")
      .order("desc")
      .collect();
  },
});

/**
 * Get gift subscription by ID.
 * Requires authentication. Returns data only if the user is the
 * giver, the recipient, or an admin.
 */
export const getGiftSubscriptionById = query({
  args: { id: v.id("giftSubscriptions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const gift = await ctx.db.get(args.id);
    if (!gift) return null;

    // Allow access if admin, giver, or recipient
    const admin = await isAdmin(ctx);
    const userEmail = identity.email || "";
    const isGiver = gift.giverEmail === userEmail;
    const isRecipient = gift.recipientEmail === userEmail;

    if (!admin && !isGiver && !isRecipient) {
      throw new Error("Unauthorized — you can only view your own gift subscriptions");
    }

    return gift;
  },
});

/**
 * Delete gift subscription — ADMIN ONLY.
 * Regular users cannot delete gift records.
 */
export const deleteGiftSubscription = mutation({
  args: { id: v.id("giftSubscriptions") },
  handler: async (ctx, args) => {
    // ── Admin gate ──────────────────────────────────────────────
    await requireAdmin(ctx);

    const gift = await ctx.db.get(args.id);
    if (!gift) {
      throw new Error("Gift subscription not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});