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
    tokenIdentifier: v.optional(v.string()),
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
    // Referral tracking - short referral code shared with friends.
    referralCode: v.optional(v.string()),
    referredByUserId: v.optional(v.id("users")),
    // Marketing prefs.
    marketingOptIn: v.optional(v.boolean()),
    // Internal admin flag (also derivable from Clerk publicMetadata.role).
    isAdmin: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
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
    zip: v.optional(v.string()),
    country: v.optional(v.string()), // default "TT"
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
    // Custom URL slug for the product page (/shop/<slug>). Optional; when
    // blank the page falls back to resolving by sku.
    slug: v.optional(v.string()),
    name: v.string(),
    brand: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.string(),              // "produce" | "pantry" | "dairy" | "protein" | …
    // Shop navigation category (parent slug from shopCategories).
    shopCategorySlug: v.optional(v.string()),
    shopSubcategorySlug: v.optional(v.string()),
    unit: v.string(),                  // "ea", "lb", "oz", "pkg"
    unitType: v.optional(v.string()),  // "weight" | "volume" | "count"
    weightGrams: v.optional(v.number()),
    basePriceCents: v.number(),
    // Discount tier: "tier0" (none), "tier1" (5%), "tier2" (10%), "tier3" (12.5%)
    discountTier: v.optional(v.string()),
    customDiscountPercent: v.optional(v.number()),
    // Shopify-style on-hand stock for à-la-carte retail. Only enforced when
    // trackInventory is true; fresh/made-to-order items can leave it off.
    stockQuantity: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    lowStockThreshold: v.optional(v.number()), // alert level (default 5)
    imageUrl: v.optional(v.string()),
    // Multi-image gallery (ordered). First image is the primary thumbnail.
    images: v.optional(
      v.array(v.object({
        url: v.string(),
        alt: v.optional(v.string()),
      }))
    ),
    videoUrl: v.optional(v.string()),
    // PDP info sections (Farm-to-People style tabs). Each can hold
    // text, an image, or both.
    producer: v.optional(
      v.object({
        name: v.optional(v.string()),
        location: v.optional(v.string()),
        text: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
      })
    ),
    storageTips: v.optional(
      v.object({
        text: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
      })
    ),
    ingredients: v.optional(
      v.object({
        text: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
      })
    ),
    attributes: v.optional(
      v.object({
        // Food & pantry
        organic: v.optional(v.boolean()),
        local: v.optional(v.boolean()),
        glutenFree: v.optional(v.boolean()),
        dairyFree: v.optional(v.boolean()),
        vegan: v.optional(v.boolean()),
        nutFree: v.optional(v.boolean()),
        // Home, kitchen & retail
        sustainableMaterial: v.optional(v.boolean()),
        reusable: v.optional(v.boolean()),
        plasticFree: v.optional(v.boolean()),
        foodSafe: v.optional(v.boolean()),
        upcycled: v.optional(v.boolean()),
      })
    ),
    // Free-form labels the admin defines per product (e.g. "Fair Trade"),
    // shown as chips alongside the fixed attributes.
    customAttributes: v.optional(v.array(v.string())),
    // Refundable container deposit (cents) - only for purchaseType "deposit".
    depositCents: v.optional(v.number()),
    sourcingPartner: v.optional(v.string()),
    sourcingOrigin: v.optional(v.string()),
    // Shopify-style option dimensions. When present, purchasable combos
    // live in `productVariants`; basePriceCents becomes the "from" price.
    options: v.optional(
      v.array(v.object({ name: v.string(), values: v.array(v.string()) }))
    ),
    tags: v.optional(v.array(v.string())), // e.g. ["Sale", "New", "Best Seller"]
    // which tiers default-include this product (used by box generator).
    defaultForTiers: v.optional(v.array(v.string())),
    // Legacy single value - kept in sync with purchaseTypes[0].
    purchaseType: v.optional(v.string()),
    // Multi-select: which ways this product can be bought. Controls the
    // PDP buttons ("one-time" → Add, "subscription" → Subscribe, …).
    purchaseTypes: v.optional(v.array(v.string())),
    // e.g. ["1mo", "3mo", "6mo"] - only relevant when purchaseType = "subscription"
    subscriptionIntervals: v.optional(v.array(v.string())),
    // Case/bulk pricing: lets admin define quantity + price per fractional case.
    casePricing: v.optional(
      v.object({
        // Legacy: single "items per full case". Retained so older products
        // still validate; new products set per-fraction quantities below.
        caseSize: v.optional(v.number()),
        itemLabel: v.optional(v.string()),
        enableQuarter: v.optional(v.boolean()),
        quarterQty: v.optional(v.number()),
        quarterPriceCents: v.optional(v.number()),
        enableHalf: v.optional(v.boolean()),
        halfQty: v.optional(v.number()),
        halfPriceCents: v.optional(v.number()),
        enableFull: v.optional(v.boolean()),
        fullQty: v.optional(v.number()),
        fullPriceCents: v.optional(v.number()),
      })
    ),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_sku", ["sku"])
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_active_and_category", ["active", "category"])
    .index("by_brand", ["brand"])
    .index("by_shop_category", ["shopCategorySlug"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["active", "category"],
    }),

  // ──────────────────────────────────────────────────────────────
  // Product variants (Shopify-style options + purchasable combos)
  //
  // Optional per product. When a product has `options` defined,
  // each purchasable combination is a row here with its own SKU,
  // price, and stock. Products without variants use their own
  // basePriceCents/stockQuantity directly (no migration needed).
  // ──────────────────────────────────────────────────────────────
  productVariants: defineTable({
    productId: v.id("products"),
    sku: v.string(),
    optionValues: v.record(v.string(), v.string()),
    priceCents: v.number(),
    stockQuantity: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    lowStockThreshold: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    images: v.optional(
      v.array(v.object({
        url: v.string(),
        alt: v.optional(v.string()),
      }))
    ),
    videoUrl: v.optional(v.string()),
    // Per-size case pricing: each size (e.g. 250ml OWG) sells as ¼/½/full
    // case with its own quantity + price per fraction.
    casePricing: v.optional(
      v.object({
        itemLabel: v.optional(v.string()),
        enableQuarter: v.optional(v.boolean()),
        quarterQty: v.optional(v.number()),
        quarterPriceCents: v.optional(v.number()),
        enableHalf: v.optional(v.boolean()),
        halfQty: v.optional(v.number()),
        halfPriceCents: v.optional(v.number()),
        enableFull: v.optional(v.boolean()),
        fullQty: v.optional(v.number()),
        fullPriceCents: v.optional(v.number()),
      })
    ),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_sku", ["sku"])
    .index("by_product_active", ["productId", "active"]),

  // ──────────────────────────────────────────────────────────────
  // Editable product category taxonomy (the SKU pillars). Seeded from
  // the 6 defaults; admins can add/edit/remove their own.
  // ──────────────────────────────────────────────────────────────
  productCategories: defineTable({
    code: v.string(),                  // SKU prefix, uppercase - unique
    label: v.string(),
    description: v.optional(v.string()),
    attributeSet: v.string(),          // "food" | "home"
    units: v.array(v.string()),        // units offered for this pillar
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_code", ["code"]),

  // ──────────────────────────────────────────────────────────────
  // Shop navigation categories (parent/sub). Drives the storefront
  // tabs (e.g. ALL → HAULS → BEVERAGES → CARE). Parent rows have
  // no parentId; sub-categories reference their parent.
  // ──────────────────────────────────────────────────────────────
  shopCategories: defineTable({
    slug: v.string(),
    label: v.string(),
    parentId: v.optional(v.id("shopCategories")),
    sortOrder: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_active", ["active"]),

  // ──────────────────────────────────────────────────────────────
  // Store-wide promotions & sales. Active promos feed the
  // announcement banner and apply a discount to all products.
  // ──────────────────────────────────────────────────────────────
  promotions: defineTable({
    name: v.string(),
    description: v.string(),
    discountPercent: v.number(),
    promoCode: v.optional(v.string()),
    /** Max times a single user can redeem this code. undefined = 1. */
    maxUsesPerUser: v.optional(v.number()),
    bannerText: v.optional(v.string()),
    active: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_active", ["active"]),

  // Track promo code usage per user to prevent abuse.
  promoRedemptions: defineTable({
    userId: v.id("users"),
    promotionId: v.id("promotions"),
    promoCode: v.string(),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_promo", ["userId", "promotionId"])
    .index("by_promotion", ["promotionId"]),

  // ──────────────────────────────────────────────────────────────
  // Product tags - admin-managed vocabulary for discovery.
  // ──────────────────────────────────────────────────────────────
  tags: defineTable({
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"]),

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

  // Line items for boxes - separate table avoids the 1 MB doc cap.
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
    status: v.optional(v.string()),    // "pending" | "processed" | "failed" | "poison"
    error: v.optional(v.string()),
    receivedAt: v.number(),
    attempts: v.optional(v.number()),
    nextRetryAt: v.optional(v.number()),
  })
    .index("by_provider_event", ["provider", "eventId"])
    .index("by_status_retry", ["status", "nextRetryAt"]),

  // ──────────────────────────────────────────────────────────────
  // App settings - simple key/value store for admin-controlled flags
  // (e.g. the active payment provider: "stripe" | "wipay").
  // ──────────────────────────────────────────────────────────────
  appSettings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ──────────────────────────────────────────────────────────────
  // Support: complaints & contact queries from the public site
  // ──────────────────────────────────────────────────────────────
  supportTickets: defineTable({
    type: v.string(), // "complaint" | "query"
    name: v.string(),
    email: v.string(),
    orderRef: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // "open" | "resolved"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

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
  // Legacy `orders` table - superseded by `boxes` + `boxItems`.
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
