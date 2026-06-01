import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ─── Stripe types (narrow, only fields we read) ────────────────────
type StripeMetadata = Record<string, string | undefined> | null | undefined;

type StripeCheckoutSession = {
  id: string;
  customer?: string | null;
  subscription?: string | null;
  payment_intent?: string | null;
  metadata?: StripeMetadata;
  mode?: string;
};

type StripeSubscriptionItem = {
  price?: { id?: string; recurring?: { interval?: string } | null } | null;
};

type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  metadata?: StripeMetadata;
  items?: { data?: StripeSubscriptionItem[] };
};

type StripeInvoice = {
  id: string;
  customer?: string | null;
  subscription?: string | null;
  total?: number;
  subtotal?: number;
  tax?: number | null;
  period_start?: number;
  period_end?: number;
  metadata?: StripeMetadata;
  lines?: {
    data?: Array<{
      price?: { recurring?: { interval?: string } | null } | null;
      metadata?: StripeMetadata;
    }>;
  };
};

type StripeEvent = {
  id: string;
  type: string;
  data: { object: unknown };
};

/**
 * Background action to process a webhook payload reliably.
 * If this fails, the error is recorded but the original HTTP request to Stripe already succeeded.
 */
export const processWebhookAction = internalAction({
  args: { webhookEventId: v.id("webhookEvents") },
  handler: async (ctx, args) => {
    // 1. Load event
    const eventRecord = await ctx.runQuery(internal.webhookEvents.getEvent, { id: args.webhookEventId });
    if (!eventRecord || eventRecord.status !== "pending") return;

    const event = eventRecord.payload as StripeEvent;

    try {
      await handleStripeEvent(ctx, event);
      await ctx.runMutation(internal.webhookEvents.markProcessed, { id: args.webhookEventId });
    } catch (err) {
      console.error("Failed to process webhook:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      await ctx.runMutation(internal.webhookEvents.markFailed, { id: args.webhookEventId, error: errorMessage });
    }
  }
});

// ─── Event dispatch ────────────────────────────────────────────────
async function handleStripeEvent(ctx: any, event: StripeEvent) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(
        ctx,
        event.data.object as StripeCheckoutSession
      );

    case "checkout.session.expired":
      return handleCheckoutExpired(
        ctx,
        event.data.object as StripeCheckoutSession
      );

    case "customer.subscription.created":
    case "customer.subscription.updated":
      return handleSubscriptionUpsert(
        ctx,
        event.data.object as StripeSubscription
      );

    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(
        ctx,
        event.data.object as StripeSubscription
      );

    case "invoice.created":
      return handleInvoiceCreated(ctx, event.data.object as StripeInvoice);

    case "invoice.paid":
    case "invoice.payment_succeeded":
      return handleInvoicePaid(ctx, event.data.object as StripeInvoice);

    case "invoice.payment_failed":
      return handleInvoicePaymentFailed(
        ctx,
        event.data.object as StripeInvoice
      );

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }
}

async function handleCheckoutCompleted(
  ctx: any,
  session: StripeCheckoutSession
) {
  const metadata = session.metadata ?? {};

  if (metadata.type === "gift") {
    await ctx.runMutation(
      internal.giftSubscriptions.updateGiftSubscriptionByStripeSession,
      {
        stripeSessionId: session.id,
        paymentId:
          typeof session.payment_intent === "string" ? session.payment_intent : "",
        status: "paid",
      }
    );
    return;
  }

  if (session.mode === "subscription") {
    console.log(
      `Checkout subscription complete: session=${session.id}, customer=${session.customer}`
    );
    return;
  }

  // A la carte shop order flow.
  if (metadata.type === "shop_order") {
    const clerkId = metadata.clerk_user_id;
    if (!clerkId) {
      console.error("No clerk_user_id in shop_order metadata");
      return;
    }

    // Fetch line items from Stripe API since they aren't in the base webhook payload
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?expand[]=data.price.product`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch Stripe line items: ${await res.text()}`);
    }

    const lineItemsData = await res.json();
    const items = lineItemsData.data.map((item: any) => ({
      sku: item.price?.product?.metadata?.sku ?? "UNKNOWN",
      productId: item.price?.product?.metadata?.product_id ?? undefined,
      quantity: item.quantity,
      priceCents: item.amount_total, // amount_total already factors in quantity in Stripe, wait - our schema uses priceCents. We will use amount_total as total for that line, or unit_amount
    }));

    // For safety, convert total_amount from session if available, otherwise sum it up.
    // We'll calculate total cents from items if session total isn't easily accessible here.
    const totalCents = items.reduce((acc: number, val: any) => acc + val.priceCents, 0);

    await ctx.runMutation(internal.shopOrders.fulfillShopOrder, {
      clerkId,
      stripeSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      totalCents,
      items,
    });
    return;
  }

  const tierId = metadata.tier_id;
  const billingCycle = metadata.billing_cycle;
  const clerkId = metadata.clerk_user_id;
  if (tierId && billingCycle && clerkId) {
    await ctx.runMutation(internal.subscriptions.fulfillSubscription, {
      clerkId,
      tier: tierId,
      frequency: billingCycle,
      stripeSessionId: session.id,
      paymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
    });
  }
}

async function handleCheckoutExpired(
  ctx: any,
  session: StripeCheckoutSession
) {
  const metadata = session.metadata ?? {};
  if (metadata.type === "gift" && metadata.gift_subscription_id) {
    await ctx.runMutation(
      internal.giftSubscriptions.updateGiftSubscriptionByStripeSession,
      {
        stripeSessionId: session.id,
        paymentId: "",
        status: "cancelled",
      }
    );
  }
}

function extractCadenceFromSubscription(sub: StripeSubscription): string {
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
  switch (interval) {
    case "week":
      return "weekly";
    case "month":
      return "monthly";
    case "year":
      return "yearly";
    default:
      return interval ?? "monthly";
  }
}

async function handleSubscriptionUpsert(
  ctx: any,
  sub: StripeSubscription
) {
  const tier = (sub.metadata?.tier_id ?? "essential") as string;
  const cadence = extractCadenceFromSubscription(sub);

  await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
    stripeCustomerId: sub.customer,
    stripeSubscriptionId: sub.id,
    status: sub.status,
    tier,
    cadence,
    currentPeriodStart:
      typeof sub.current_period_start === "number"
        ? sub.current_period_start * 1000
        : undefined,
    currentPeriodEnd:
      typeof sub.current_period_end === "number"
        ? sub.current_period_end * 1000
        : undefined,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}

async function handleSubscriptionDeleted(
  ctx: any,
  sub: StripeSubscription
) {
  await ctx.runMutation(internal.subscriptions.markCancelledFromStripe, {
    stripeSubscriptionId: sub.id,
  });
}

async function handleInvoiceCreated(ctx: any, invoice: StripeInvoice) {
  if (!invoice.subscription || !invoice.id) return;

  const localSub = await ctx.runQuery(
    internal.subscriptions.findByStripeSubscriptionId,
    { stripeSubscriptionId: invoice.subscription }
  );
  if (!localSub) {
    console.warn(
      `invoice.created: no local subscription for stripe id ${invoice.subscription}`
    );
    return;
  }

  await ctx.runMutation(internal.boxes.generateForPeriod, {
    subscriptionId: localSub._id,
    stripeInvoiceId: invoice.id,
    periodStartMs:
      typeof invoice.period_start === "number"
        ? invoice.period_start * 1000
        : undefined,
  });
}

async function handleInvoicePaid(ctx: any, invoice: StripeInvoice) {
  if (!invoice.id) return;
  await ctx.runMutation(internal.boxes.markPaid, {
    stripeInvoiceId: invoice.id,
    totalCents: typeof invoice.total === "number" ? invoice.total : 0,
    subtotalCents:
      typeof invoice.subtotal === "number" ? invoice.subtotal : undefined,
    taxCents: typeof invoice.tax === "number" ? invoice.tax : undefined,
  });
}

async function handleInvoicePaymentFailed(
  ctx: any,
  invoice: StripeInvoice
) {
  if (!invoice.id) return;
  await ctx.runMutation(internal.boxes.markPastDue, {
    stripeInvoiceId: invoice.id,
  });
}
