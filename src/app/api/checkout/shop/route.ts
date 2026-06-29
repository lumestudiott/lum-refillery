import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';

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
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product.basePriceCents,
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
            images: product.imageUrl ? [product.imageUrl] : undefined,
            metadata: { sku: product.sku, product_id: String(product._id) },
          },
        },
      });
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
      },
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
