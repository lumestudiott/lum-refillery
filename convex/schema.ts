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
    frequency: v.string(), // "fortnightly", "monthly", "yearly"
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

  giftSubscriptions: defineTable({
    // Gift giver info
    giverName: v.string(),
    giverEmail: v.string(),
    
    // Recipient info
    recipientName: v.string(),
    recipientEmail: v.string(),
    recipientAddress: v.string(),
    recipientCity: v.string(),
    recipientState: v.string(),
    recipientZip: v.string(),
    
    // Gift details
    tier: v.string(), // "essential", "household", etc.
    billingCycle: v.string(), // "fortnightly", "monthly", "yearly"
    giftMessage: v.optional(v.string()),
    
    // Payment and status
    amount: v.number(),
    status: v.string(), // "pending", "paid", "delivered", "cancelled"
    paymentId: v.optional(v.string()), // WiiPay payment ID
    
    // Timestamps
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  }).index("by_giver_email", ["giverEmail"])
    .index("by_recipient_email", ["recipientEmail"])
    .index("by_status", ["status"]),
});