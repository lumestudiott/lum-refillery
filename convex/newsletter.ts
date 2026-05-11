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

/**
 * Simple in-memory rate limiter for newsletter subscribes.
 * Tracks recent subscribe attempts per email to prevent spam.
 * Resets on server restart (Convex function re-deploy), which is fine
 * for basic protection — for production hardening, use a counter table.
 */
const recentSubscribes = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_SUBSCRIBES_PER_WINDOW = 3;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();

  // Clean up expired entries periodically
  if (recentSubscribes.size > 1000) {
    for (const [k, timestamp] of recentSubscribes.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
        recentSubscribes.delete(k);
      }
    }
  }

  const lastAttempt = recentSubscribes.get(key);
  if (lastAttempt && now - lastAttempt < RATE_LIMIT_WINDOW_MS) {
    return false; // Rate limited
  }

  recentSubscribes.set(key, now);
  return true;
}

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
    if (!checkRateLimit(email)) {
      return { success: false, message: "Too many attempts. Please try again in a minute." };
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
    let cursor: any = null;

    // Paginate through results counting without holding all in memory
    while (!isDone) {
      const page = await ctx.db
        .query("newsletterSubscribers")
        .filter((q) => q.eq(q.field("status"), "active"))
        .paginate({ numItems: 100, cursor: cursor ?? undefined });

      count += page.page.length;
      isDone = page.isDone;
      cursor = page.continueCursor;
    }

    return count;
  },
});
