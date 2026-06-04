import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Basic email format validation.
 * Rejects obviously invalid strings before they hit the database.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

import { rateLimiter } from "./lib/rateLimit";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // ── Input validation ─────────────────────────────────────────
    const email = args.email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // ── Rate limiting ────────────────────────────────────────────
    const status = await rateLimiter.limit(ctx, "newsletter", { key: email });
    if (!status.ok) {
      return { success: false, message: `Too many attempts. Please try again later.` };
    }

    // ── Check for existing subscriber ────────────────────────────
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
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
      email: email,
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
    const email = args.email.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return { success: false, message: "Invalid email address." };
    }

    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (subscriber) {
      await ctx.db.patch(subscriber._id, {
        status: "unsubscribed",
      });
    }

    return { success: true };
  },
});

/**
 * Get subscriber count — uses index-scoped query count instead of
 * loading all records into memory.
 *
 * For Convex, the most efficient approach without a dedicated counter
 * table is to use a filtered query with .collect() but only on the
 * indexed field. Since Convex doesn't have a native COUNT, we paginate
 * in chunks to avoid loading everything at once at scale.
 *
 * For 10K+ subscribers, migrate to a dedicated `counters` table that
 * gets incremented/decremented on subscribe/unsubscribe.
 */
export const getSubscriberCount = query({
  handler: async (ctx) => {
    let count = 0;
    let isDone = false;
    let cursor: string | null = null;

    // Paginate through results counting without holding all in memory
    while (!isDone) {
      const page = await ctx.db
        .query("newsletterSubscribers")
        .filter((q) => q.eq(q.field("status"), "active"))
        .paginate({ numItems: 100, cursor });

      count += page.page.length;
      isDone = page.isDone;
      cursor = page.continueCursor ?? null;
    }

    return count;
  },
});
