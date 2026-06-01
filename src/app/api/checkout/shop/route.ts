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

    const convexToken = await getToken({ template: 'convex' });
    if (!convexToken) {
      return NextResponse.json({ error: 'Auth token error' }, { status: 500 });
    }
    const convex = new ConvexHttpClient(getServerConvexUrl());
    convex.setAuth(convexToken);

    // ── Validate prices server-side against canonical Convex catalog ──
    const lineItems = [];
    for (const item of items) {
      if (!item.sku || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid item: ${item.sku ?? '(no sku)'}` },
          { status: 400 }
        );
      }
      const product = await convex.query(api.products.getBySku, { sku: item.sku });
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
        allowed_countries: ['US', 'TT'],
      },
      metadata: {
        clerk_user_id: userId,
        type: 'shop_order',
      },
      success_url: `${appUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/shop`,
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
