import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Cron job handler to find failed webhooks that are due for retry
 * and schedule them for processing.
 */
export const processDueRetries = internalMutation({
  handler: async (ctx) => {
    // Get up to 50 failed events that are due for retry
    const dueEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("by_status_retry", (q) => 
        q.eq("status", "failed").lte("nextRetryAt", Date.now())
      )
      .take(50);

    for (const event of dueEvents) {
      // Mark as pending to avoid concurrent retries picking it up
      await ctx.db.patch(event._id, { status: "pending" });
      
      // Schedule processing
      if (event.provider === "stripe") {
        await ctx.scheduler.runAfter(0, internal.stripeWebhooks.processWebhookAction, {
          webhookEventId: event._id,
        });
      } else {
        console.warn(`Retry not implemented for provider ${event.provider}`);
      }
    }

    if (dueEvents.length === 50) {
      await ctx.scheduler.runAfter(0, internal.webhookRetry.processDueRetries);
    }
  }
});

/**
 * Admin utility to manually retry a poisoned webhook event.
 */
export const retryPoisonEvent = internalMutation({
  args: { id: v.id("webhookEvents") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");
    if (event.status !== "poison") throw new Error("Event is not poisoned");

    await ctx.db.patch(event._id, { 
      status: "pending", 
      attempts: 0,
      nextRetryAt: undefined
    });

    if (event.provider === "stripe") {
      await ctx.scheduler.runAfter(0, internal.stripeWebhooks.processWebhookAction, {
        webhookEventId: event._id,
      });
    }
  }
});
