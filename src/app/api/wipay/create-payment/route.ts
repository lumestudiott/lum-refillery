import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isWiPayConfigured } from '@/lib/wipay';

/**
 * POST /api/wipay/create-payment
 *
 * Scaffold for the WiPay "Request A Payment" hosted-checkout flow. Returns
 * 501 until a WiPay account is registered and credentials are configured
 * (see `src/lib/wipay.ts`). Once credentials + the API spec are available,
 * this builds the WiPay payment request and returns the hosted-page URL to
 * redirect the customer to.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  }

  if (!isWiPayConfigured()) {
    return NextResponse.json(
      { error: 'WiPay is not configured yet.', configured: false },
      { status: 501 }
    );
  }

  // TODO: implement the WiPay "Request A Payment" request here once the
  // account number + API key (and the exact API version/region) are provided.
  // It should create the payment and return { url } for the hosted page.
  return NextResponse.json(
    { error: 'WiPay integration pending implementation.', configured: true },
    { status: 501 }
  );
}
