import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new gift subscription
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
  },
  handler: async (ctx, args) => {
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
      createdAt: Date.now(),
    });

    return giftSubscriptionId;
  },
});

// Update gift subscription status (for payment webhooks)
export const updateGiftSubscriptionStatus = mutation({
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

// Get gift subscriptions by giver email
export const getGiftSubscriptionsByGiver = query({
  args: { giverEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("giftSubscriptions")
      .withIndex("by_giver_email", (q) => q.eq("giverEmail", args.giverEmail))
      .order("desc")
      .collect();
  },
});

// Get gift subscriptions by recipient email
export const getGiftSubscriptionsByRecipient = query({
  args: { recipientEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("giftSubscriptions")
      .withIndex("by_recipient_email", (q) => q.eq("recipientEmail", args.recipientEmail))
      .order("desc")
      .collect();
  },
});

// Get all gift subscriptions (admin)
export const getAllGiftSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("giftSubscriptions")
      .order("desc")
      .collect();
  },
});

// Get gift subscription by ID
export const getGiftSubscriptionById = query({
  args: { id: v.id("giftSubscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete gift subscription (admin)
export const deleteGiftSubscription = mutation({
  args: { id: v.id("giftSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});