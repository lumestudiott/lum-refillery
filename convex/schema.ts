import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Refillery domain schema.
 *
 * Conventions:
 *  - All monetary fields are stored as integer cents (USD).
 *  - All timestamps are unix epoch milliseconds (`Date.now()`).
 *  - `weekKey` is an ISO week string `YYYY-Www` (e.g. `2026-W19`),
 *    used to align inventory + box generation to a delivery week.
 *  - Status enums are kept as strings (not v.union(v.literal(...))) so
 *    they can evolve without schema-breaking changes during MVP.
 */
export default defineSchema({
  // ──────────────────────────────────────────────────────────────
  // Identity
  // ──────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    // Stripe Customer this user owns. Stable across subscriptions.
    stripeCustomerId: v.optional(v.string()),
    // Denormalized current subscription summary for cheap reads.
    subscriptionTier: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    // Store credit balance in cents (positive = credit the user has).
    creditsCents: v.optional(v.number()),
    // Referral tracking — short referral code shared with friends.
    referralCode: v.optional(v.string()),
    referredByUserId: v.optional(v.id("users")),
    // Marketing prefs.
    marketingOptIn: v.optional(v.boolean()),
    // Internal admin flag (also derivable from Clerk publicMetadata.role).
    isAdmin: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_referral_code", ["referralCode"]),

  // ──────────────────────────────────────────────────────────────
  // Shipping addresses (multi-address per user, isPrimary flag)
  // ──────────────────────────────────────────────────────────────
  addresses: defineTable({
    userId: v.id("users"),
    label: v.optional(v.string()),   // "Home", "Office"
    line1: v.string(),
    line2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    country: v.optional(v.string()), // default "US"
    deliveryInstructions: v.optional(v.string()),
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_primary", ["userId", "isPrimary"]),

  // ──────────────────────────────────────────────────────────────
  // Delivery zone coverage (by zip prefix)
  // ──────────────────────────────────────────────────────────────
  deliveryZones: defineTable({
    zipPrefix: v.string(),             // e.g. "100" matches 10000-10099
    name: v.string(),                  // human label
    cutoffDayOfWeek: v.number(),       // 0=Sun … 6=Sat
    cutoffHour: v.number(),            // 0–23 in zone TZ
    deliveryDayOfWeek: v.number(),     // 0=Sun … 6=Sat
    carrier: v.optional(v.string()),
    shippingFeeCents: v.number(),      // base shipping for this zone
    active: v.boolean(),
  })
    .index("by_zip_prefix", ["zipPrefix"])
    .index("by_active", ["active"]),

  // ──────────────────────────────────────────────────────────────
  // Subscription (one per active recurring plan)
  // Models a Stripe Subscription 1:1.
  // ──────────────────────────────────────────────────────────────
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    // tier / cadence / box size
    tier: v.string(),                  // "essential" | "household" | "premium" | …
    boxSize: v.optional(v.string()),   // alias of tier; kept for forward-compat
    cadence: v.optional(v.string()),   // "weekly" | "biweekly" | "monthly"
    frequency: v.optional(v.string()), // legacy field, kept for back-compat
    // lifecycle
    status: v.string(),                // "active" | "paused" | "past_due" | "cancelled" | "incomplete"
    pausedUntil: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    // billing window
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    nextDelivery: v.optional(v.number()),
    // address for default fulfillment (resolved at lock-time per box)
    primaryAddressId: v.optional(v.id("addresses")),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
    // legacy fields kept so old rows still validate
    stripeSessionId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_status", ["status"]),

  // ──────────────────────────────────────────────────────────────
  // Product catalog
  // ──────────────────────────────────────────────────────────────
  products: defineTable({
    sku: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),              // "produce" | "pantry" | "dairy" | "protein" | …
    unit: v.string(),                  // "ea", "lb", "oz", "pkg"
    weightGrams: v.optional(v.number()),
    basePriceCents: v.number(),
    imageUrl: v.optional(v.string()),
    // attribute flags — kept as a record for forward-compat
    attributes: v.optional(
      v.object({
        organic: v.optional(v.boolean()),
        local: v.optional(v.boolean()),
        glutenFree: v.optional(v.boolean()),
        dairyFree: v.optional(v.boolean()),
        vegan: v.optional(v.boolean()),
        nutFree: v.optional(v.boolean()),
      })
    ),
    sourcingPartner: v.optional(v.string()),
    sourcingOrigin: v.optional(v.string()),
    // which tiers default-include this product (used by box generator).
    defaultForTiers: v.optional(v.array(v.string())),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_sku", ["sku"])
    .index("by_category", ["category"])
    .index("by_active", ["active"]),

  // ──────────────────────────────────────────────────────────────
  // Per-week inventory allocation
  // ──────────────────────────────────────────────────────────────
  weeklyInventory: defineTable({
    productId: v.id("products"),
    weekKey: v.string(),               // "2026-W19"
    quantityAvailable: v.number(),     // total units allocated for the week
    quantityReserved: v.number(),      // units locked in boxes (not yet shipped)
    // optional zone-scoped allocation; null = global
    deliveryZoneId: v.optional(v.id("deliveryZones")),
  })
    .index("by_product_week", ["productId", "weekKey"])
    .index("by_week", ["weekKey"])
    .index("by_week_zone", ["weekKey", "deliveryZoneId"]),

  // ──────────────────────────────────────────────────────────────
  // Delivery boxes (one row per subscription per delivery period)
  // ──────────────────────────────────────────────────────────────
  boxes: defineTable({
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
    weekKey: v.string(),               // "2026-W19"
    // lifecycle
    status: v.string(),                // "draft" | "locked" | "packed" | "shipped" | "delivered" | "skipped" | "refunded"
    cutoffAt: v.number(),              // when customization closes
    deliveryDate: v.number(),          // intended delivery (epoch ms midnight in zone)
    // fulfillment snapshot (denormalized at lock time)
    addressSnapshot: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
        country: v.optional(v.string()),
      })
    ),
    deliveryZoneId: v.optional(v.id("deliveryZones")),
    // totals (cents)
    subtotalCents: v.optional(v.number()),
    shippingCents: v.optional(v.number()),
    taxCents: v.optional(v.number()),
    creditsAppliedCents: v.optional(v.number()),
    totalCents: v.optional(v.number()),
    // billing
    stripeInvoiceId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    // shipping
    carrier: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_subscription", ["subscriptionId"])
    .index("by_subscription_week", ["subscriptionId", "weekKey"])
    .index("by_status", ["status"])
    .index("by_status_cutoff", ["status", "cutoffAt"])
    .index("by_status_delivery", ["status", "deliveryDate"])
    .index("by_stripe_invoice", ["stripeInvoiceId"]),

  // Line items for boxes — separate table avoids the 1 MB doc cap.
  boxItems: defineTable({
    boxId: v.id("boxes"),
    productId: v.id("products"),
    quantity: v.number(),
    unitPriceCentsAtLock: v.number(),  // snapshot at the moment the box locks
    source: v.string(),                // "default" | "added" | "swap"
    createdAt: v.number(),
  })
    .index("by_box", ["boxId"])
    .index("by_box_product", ["boxId", "productId"])
    .index("by_product", ["productId"]),

  // ──────────────────────────────────────────────────────────────
  // ─── ONE-OFF SHOP ORDERS ──────────────────────────────────────
  // A la carte purchases made via Stripe Checkout ("shop_order")
  // ──────────────────────────────────────────────────────────────
  shopOrders: defineTable({
    userId: v.id("users"),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.string(), // "paid" | "fulfilled" | "cancelled"
    totalCents: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  shopOrderItems: defineTable({
    shopOrderId: v.id("shopOrders"),
    productId: v.optional(v.string()), // string to handle legacy/missing product refs gracefully
    sku: v.string(),
    quantity: v.number(),
    priceCents: v.number(),
  })
    .index("by_order", ["shopOrderId"]),

  // ──────────────────────────────────────────────────────────────
  // Store-credit ledger
  // ──────────────────────────────────────────────────────────────
  // Balance is derived by summing this table, but we also denormalize
  // it on users.creditsCents for cheap reads. Always patch both.
  creditTransactions: defineTable({
    userId: v.id("users"),
    amountCents: v.number(),           // positive = credit, negative = applied
    reason: v.string(),                // "referral_bonus" | "refund" | "promo" | "applied_to_box" | "admin_adjust"
    boxId: v.optional(v.id("boxes")),
    referralId: v.optional(v.id("referrals")),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ──────────────────────────────────────────────────────────────
  // Referrals
  // ──────────────────────────────────────────────────────────────
  referrals: defineTable({
    referrerUserId: v.id("users"),
    refereeEmail: v.string(),
    refereeUserId: v.optional(v.id("users")),
    status: v.string(),                // "sent" | "registered" | "converted" | "expired"
    bonusCents: v.number(),            // credit awarded to referrer on conversion
    convertedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerUserId"])
    .index("by_referee_email", ["refereeEmail"])
    .index("by_status", ["status"]),

  // ──────────────────────────────────────────────────────────────
  // Webhook event idempotency log
  // ──────────────────────────────────────────────────────────────
  // Insert (provider, eventId) before processing. A duplicate insert
  // throws (unique index), and the handler short-circuits.
  webhookEvents: defineTable({
    provider: v.string(),              // "stripe" | "clerk"
    eventId: v.string(),               // Stripe event.id / Clerk svix id
    eventType: v.string(),
    payload: v.optional(v.any()),      // Raw event payload for async processing
    status: v.optional(v.string()),    // "pending" | "processed" | "failed"
    error: v.optional(v.string()),
    receivedAt: v.number(),
  }).index("by_provider_event", ["provider", "eventId"]),

  // ──────────────────────────────────────────────────────────────
  // Newsletter & gifts (unchanged)
  // ──────────────────────────────────────────────────────────────
  newsletterSubscribers: defineTable({
    email: v.string(),
    subscribedAt: v.number(),
    status: v.string(),
  }).index("by_email", ["email"]),

  giftSubscriptions: defineTable({
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
    status: v.string(),
    paymentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_giver_email", ["giverEmail"])
    .index("by_recipient_email", ["recipientEmail"])
    .index("by_status", ["status"])
    .index("by_stripe_session", ["stripeSessionId"]),

  // ──────────────────────────────────────────────────────────────
  // Legacy `orders` table — superseded by `boxes` + `boxItems`.
  // Kept (with all fields optional) so existing dev data validates.
  // Do NOT write new rows here.
  // ──────────────────────────────────────────────────────────────
  orders: defineTable({
    userId: v.optional(v.id("users")),
    subscriptionId: v.optional(v.id("subscriptions")),
    items: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.number(),
          price: v.number(),
        })
      )
    ),
    totalAmount: v.optional(v.number()),
    status: v.optional(v.string()),
    deliveryDate: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});