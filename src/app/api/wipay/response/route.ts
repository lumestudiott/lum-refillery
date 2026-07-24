import { NextRequest, NextResponse } from 'next/server';
import { WIPAY_CONFIG, verifyWiPayHash } from '@/lib/wipay';

/**
 * GET /api/wipay/response
 *
 * WiPay redirect handler. When a customer finishes payment on WiPay's hosted page,
 * WiPay redirects them back here with query parameters:
 * status, transaction_id, order_id, total, message, hash, date, currency, card, data
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const status = searchParams.get('status');
  const transactionId = searchParams.get('transaction_id') || searchParams.get('transaction_id') || '';
  const orderId = searchParams.get('order_id') || '';
  const total = searchParams.get('total') || '';
  const message = searchParams.get('message') || '';
  const hash = searchParams.get('hash') || '';
  const rawCustomData = searchParams.get('data') || '';

  if (status !== 'success') {
    console.warn(`WiPay transaction unapproved: status=${status}, message=${message}`);
    const redirectUrl = new URL(`${appUrl}/cancel`);
    redirectUrl.searchParams.set('reason', 'wipay_failed');
    redirectUrl.searchParams.set('message', message || 'Payment was not approved');
    return NextResponse.redirect(redirectUrl);
  }

  // Hash verification
  const isValidHash = verifyWiPayHash(
    transactionId,
    total,
    WIPAY_CONFIG.apiKey,
    hash
  );

  if (!isValidHash) {
    console.error(`WiPay hash validation failed! transaction_id=${transactionId}, total=${total}`);
    const redirectUrl = new URL(`${appUrl}/cancel`);
    redirectUrl.searchParams.set('reason', 'invalid_signature');
    redirectUrl.searchParams.set('message', 'Payment security verification failed.');
    return NextResponse.redirect(redirectUrl);
  }

  // Parse optional custom data payload
  let customData: Record<string, any> = {};
  if (rawCustomData) {
    try {
      customData = JSON.parse(rawCustomData);
    } catch {
      // Ignore JSON parse errors for non-JSON custom data
    }
  }

  // Redirect user to success page with transaction metadata
  const successUrl = new URL(`${appUrl}/success`);
  successUrl.searchParams.set('session_id', transactionId);
  successUrl.searchParams.set('order_id', orderId);
  successUrl.searchParams.set('provider', 'wipay');
  if (customData.userId) {
    successUrl.searchParams.set('user_id', customData.userId);
  }

  return NextResponse.redirect(successUrl);
}

/** Also handle POST responses if WiPay sends server-to-server callback POST */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const status = formData.get('status')?.toString() || '';
    const transactionId = formData.get('transaction_id')?.toString() || '';
    const orderId = formData.get('order_id')?.toString() || '';
    const total = formData.get('total')?.toString() || '';
    const hash = formData.get('hash')?.toString() || '';

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (status === 'success' && verifyWiPayHash(transactionId, total, WIPAY_CONFIG.apiKey, hash)) {
      const successUrl = new URL(`${appUrl}/success`);
      successUrl.searchParams.set('session_id', transactionId);
      successUrl.searchParams.set('order_id', orderId);
      successUrl.searchParams.set('provider', 'wipay');
      return NextResponse.redirect(successUrl);
    }

    return NextResponse.redirect(`${appUrl}/cancel?reason=wipay_failed`);
  } catch (error) {
    console.error('WiPay POST response route error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/cancel?reason=error`);
  }
}
