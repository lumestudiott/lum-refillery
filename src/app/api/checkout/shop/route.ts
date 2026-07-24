import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';
import { stockStatus } from '@/lib/stock';

/**
 * POST /api/checkout/shop
 *
 * Creates a Stripe Checkout Session in `mode: 'payment'` for a one-off
 * shop purchase (chilled items, à la carte). Validates each line item
 * against the canonical product price in Convex to prevent client-side
 * price tampering.
 *
 * Body: { items: [{ productId, sku, name, priceCents, quantity }] }
 */

interface ShopLineItem {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  sku: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in before checkout' }, { status: 401 });
    }

    const body = await request.json();
    const items = (body?.items ?? []) as ShopLineItem[];
    const promoCode = typeof body?.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : '';

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (items.length > 50) {
      return NextResponse.json({ error: 'Cart exceeds maximum size of 50 items' }, { status: 400 });
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (totalQuantity > 200) {
      return NextResponse.json({ error: 'Total quantity exceeds maximum of 200' }, { status: 400 });
    }

    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json({ error: 'Auth token error' }, { status: 500 });
    }
    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    // ── Rate Limit Check ──
    const isAllowed = await convex.mutation(api.lib.rateLimit.checkCheckoutLimit, { clerkId: userId });
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again later.' }, { status: 429 });
    }

    // ── Validate prices server-side against canonical Convex catalog ──
    const skus = items.map((item) => item.sku);
    const products = await convex.query(api.products.getManyBySku, { skus });
    const productMap = new Map(products.map((p) => [p.sku, p]));

    const lineItems = [];
    for (const item of items) {
      if (!item.sku || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid item: ${item.sku ?? '(no sku)'}` },
          { status: 400 }
        );
      }
      const product = productMap.get(item.sku);
      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Product no longer available: ${item.sku}` },
          { status: 400 }
        );
      }
      // Enforce on-hand stock for tracked products so zeroing stock in the
      // admin actually stops sales - no developer/code change needed.
      const stock = stockStatus(product);
      if (stock.soldOut) {
        return NextResponse.json(
          { error: `Sold out: ${product.name}` },
          { status: 400 }
        );
      }
      if (stock.tracked && item.quantity > stock.quantity) {
        return NextResponse.json(
          { error: `Only ${stock.quantity} left of ${product.name}` },
          { status: 400 }
        );
      }
      const unitAmount = item.variantId ? item.priceCents : product.basePriceCents;
      const displayName = item.variantLabel
        ? `${product.name} - ${item.variantLabel}`
        : product.name;

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          // Storefront prices are TTD cents - bill in TTD so the Stripe
          // charge matches the displayed TT$ amount exactly.
          currency: 'ttd',
          unit_amount: unitAmount,
          product_data: {
            name: displayName,
            description: product.description ?? undefined,
            images: product.imageUrl ? [product.imageUrl] : undefined,
            metadata: {
              sku: item.sku,
              product_id: String(product._id),
              ...(item.variantId ? { variant_id: item.variantId } : {}),
            },
          },
        },
      });
    }

    // ── Check Active Payment Gateway (Stripe vs WiPay) ──
    const activeProvider = await convex.query(api.payments.getActiveProvider);

    if (activeProvider === 'wipay') {
      const { WIPAY_CONFIG, getWiPayEndpoint } = await import('@/lib/wipay');
      let totalCents = 0;
      for (const item of items) {
        const product = productMap.get(item.sku);
        if (product) {
          const unitAmount = item.variantId ? item.priceCents : product.basePriceCents;
          totalCents += unitAmount * item.quantity;
        }
      }

      let appliedPromoCode = '';
      if (promoCode) {
        const promo = await convex.query(api.promotions.validatePromoCode, { code: promoCode });
        if (promo && promo.discountPercent > 0) {
          totalCents = Math.round(totalCents * (1 - promo.discountPercent / 100));
          appliedPromoCode = promoCode;
        }
      }

      const formattedTotal = (totalCents / 100).toFixed(2);
      const cleanUserSuffix = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-8);
      const orderId = `shop_${Date.now()}_${cleanUserSuffix}`.slice(0, 48);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const responseUrl = `${appUrl}/api/wipay/response`;
      const endpoint = getWiPayEndpoint(WIPAY_CONFIG.countryCode);

      const params = new URLSearchParams();
      params.append('account_number', WIPAY_CONFIG.accountNumber);
      params.append('country_code', WIPAY_CONFIG.countryCode);
      params.append('currency', WIPAY_CONFIG.currency);
      params.append('environment', WIPAY_CONFIG.environment);
      params.append('fee_structure', WIPAY_CONFIG.feeStructure);
      params.append('method', 'credit_card');
      params.append('order_id', orderId);
      params.append('origin', 'LumeRefillery');
      params.append('response_url', responseUrl);
      params.append('total', formattedTotal);
      params.append('avs', '0');
      params.append('data', JSON.stringify({ userId, type: 'shop_order', orderId, promoCode: appliedPromoCode }));

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.url) {
        console.error('WiPay shop checkout error:', data);
        return NextResponse.json(
          { error: data?.message || 'Failed to generate WiPay payment URL' },
          { status: 502 }
        );
      }

      return NextResponse.json({ url: data.url, transactionId: data.transaction_id, orderId });
    }

    // ── Stripe customer (lazy create + persist) ──
    let stripeCustomerId: string | null = null;
    const me = await convex.query(api.users.getUserByClerkId, { clerkId: userId });
    if (me?.stripeCustomerId) {
      stripeCustomerId = me.stripeCustomerId;
    } else {
      const user = await currentUser();
      const email = user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        name: user?.fullName ?? undefined,
        metadata: { clerk_user_id: userId },
      });
      stripeCustomerId = customer.id;
      await convex.mutation(api.users.setMyStripeCustomerId, {
        stripeCustomerId: customer.id,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ── Promo code → Stripe coupon ─────────────────────────────────
    let discounts: { coupon: string }[] | undefined;
    let appliedPromoId: string | undefined;
    if (promoCode) {
      const promo = await convex.query(api.promotions.validatePromoCode, { code: promoCode });
      if (promo && promo.discountPercent > 0) {
        if (me) {
          const redemptions = await convex.query(api.promotions.countRedemptions, {
            userId: me._id,
            promotionId: promo.id,
          });
          if (redemptions >= (promo.maxUsesPerUser ?? 1)) {
            return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
          }
        }
        
        // Create a one-off Stripe coupon matching the Convex promotion
        const coupon = await stripe.coupons.create({
          percent_off: promo.discountPercent,
          duration: 'once',
          name: `${promo.name} (${promoCode})`,
          metadata: { convex_promo_id: promo.id, code: promoCode },
        });
        discounts = [{ coupon: coupon.id }];
        appliedPromoId = promo.id;
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['TT'],
      },
      billing_address_collection: 'required',
      metadata: {
        clerk_user_id: userId,
        type: 'shop_order',
        ...(promoCode ? { promo_code: promoCode } : {}),
        ...(appliedPromoId ? { promo_id: appliedPromoId } : {}),
      },
      ...(discounts ? { discounts } : {}),
      success_url: `${appUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/shop`,
    }, {
      idempotencyKey: `checkout_${userId}_${Date.now()}` // simple idempotency key to prevent dupes in rapid succession
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Shop checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
