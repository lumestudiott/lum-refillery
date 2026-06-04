import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Record a webhook event id for idempotency and schedule it for processing.
 */
export const recordAndSchedule = internalMutation({
  args: {
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", args.provider).eq("eventId", args.eventId)
      )
      .unique();

    if (existing) return false;

    const id = await ctx.db.insert("webhookEvents", {
      provider: args.provider,
      eventId: args.eventId,
      eventType: args.eventType,
      payload: args.payload,
      status: "pending",
      receivedAt: Date.now(),
      attempts: 0,
    });

    if (args.provider === "stripe") {
      await ctx.scheduler.runAfter(0, internal.stripeWebhooks.processWebhookAction, {
        webhookEventId: id,
      });
    }

    return true;
  },
});

export const getEvent = internalQuery({
  args: { id: v.id("webhookEvents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

export const markProcessed = internalMutation({
  args: { id: v.id("webhookEvents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: "processed", 
      error: undefined,
      nextRetryAt: undefined 
    });
  }
});

export const markFailed = internalMutation({
  args: { id: v.id("webhookEvents"), error: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return;

    const attempts = (event.attempts ?? 0) + 1;
    const maxAttempts = 5;

    if (attempts >= maxAttempts) {
      await ctx.db.patch(args.id, { 
        status: "poison", 
        error: args.error,
        attempts,
        nextRetryAt: undefined 
      });
    } else {
      // Exponential backoff: 2^attempts minutes
      const backoffMs = Math.pow(2, attempts) * 60 * 1000;
      await ctx.db.patch(args.id, { 
        status: "failed", 
        error: args.error,
        attempts,
        nextRetryAt: Date.now() + backoffMs
      });
    }
  }
});
