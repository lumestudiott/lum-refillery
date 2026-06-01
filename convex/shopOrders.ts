import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const fulfillShopOrder = internalMutation({
  args: {
    clerkId: v.string(),
    stripeSessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    totalCents: v.number(),
    items: v.array(
      v.object({
        sku: v.string(),
        productId: v.optional(v.string()),
        quantity: v.number(),
        priceCents: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error(`User not found for clerkId: ${args.clerkId}`);
    }

    // 2. Check if already fulfilled
    const existing = await ctx.db
      .query("shopOrders")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
      
    if (existing) {
      console.log(`Shop order already fulfilled for session ${args.stripeSessionId}`);
      return existing._id;
    }

    // 3. Create the order
    const orderId = await ctx.db.insert("shopOrders", {
      userId: user._id,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.paymentIntentId,
      status: "paid",
      totalCents: args.totalCents,
      createdAt: Date.now(),
    });

    // 4. Create line items
    for (const item of args.items) {
      await ctx.db.insert("shopOrderItems", {
        shopOrderId: orderId,
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        priceCents: item.priceCents,
      });
      
      // Optional: Decrement inventory here if tracked globally
      // (Currently inventory is managed on a weekly cycle in Lume, but this supports future a la carte stock tracking)
    }

    return orderId;
  },
});
