import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    tier: v.string(), // "essential", "household", "supported"
    frequency: v.string(), // "fortnightly", "monthly"
    status: v.string(), // "active", "paused", "cancelled"
    startDate: v.number(),
    nextDelivery: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    items: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    totalAmount: v.number(),
    status: v.string(), // "pending", "confirmed", "delivered"
    deliveryDate: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  newsletterSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    status: v.string(), // "active", "unsubscribed"
  }).index("by_email", ["email"]),
});