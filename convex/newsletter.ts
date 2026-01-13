import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (existing) {
      // If already subscribed, just return success
      if (existing.status === "active") {
        return { success: true, message: "Already subscribed!" };
      }
      // If previously unsubscribed, reactivate
      await ctx.db.patch(existing._id, {
        status: "active",
        subscribedAt: Date.now(),
      });
      return { success: true, message: "Welcome back!" };
    }

    // Create new subscriber
    await ctx.db.insert("newsletterSubscribers", {
      email: args.email.toLowerCase(),
      subscribedAt: Date.now(),
      status: "active",
    });

    return { success: true, message: "Successfully subscribed!" };
  },
});

export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (subscriber) {
      await ctx.db.patch(subscriber._id, {
        status: "unsubscribed",
      });
    }

    return { success: true };
  },
});

export const getSubscriberCount = query({
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    return subscribers.length;
  },
});
