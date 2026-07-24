import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WIPAY_CONFIG, getWiPayEndpoint, isWiPayConfigured } from '@/lib/wipay';

/**
 * POST /api/wipay/create-payment
 *
 * Implements the WiPay "Request A Payment" hosted-checkout flow.
 * Accepts order metadata in the request body, posts to WiPay's country-specific
 * API endpoint, and returns the hosted payment page URL to redirect the customer.
 */
export async function POST(request: NextRequest) {
  try {
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

    let body: Record<string, any> = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const countryCode = (body.countryCode || WIPAY_CONFIG.countryCode || 'TT').toUpperCase();
    const currency = (body.currency || WIPAY_CONFIG.currency || 'TTD').toUpperCase();
    const feeStructure = body.feeStructure || WIPAY_CONFIG.feeStructure || 'customer_pay';
    const numTotal = typeof body.total === 'number' ? body.total : parseFloat(body.total ?? '60.00');
    const formattedTotal = (isNaN(numTotal) || numTotal <= 0 ? 60.00 : numTotal).toFixed(2);
    
    // Order ID must be 1-48 chars, alphanumeric + dash/underscore
    const cleanUserSuffix = userId.replace(/[^a-zA-Z0-9_-]/g, '').slice(-8);
    const orderId = (body.orderId || `oid_${Date.now()}_${cleanUserSuffix}`).slice(0, 48);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const responseUrl = `${appUrl}/api/wipay/response`;
    const endpoint = getWiPayEndpoint(countryCode);

    const customData = JSON.stringify({
      userId,
      orderId,
      total: formattedTotal,
      currency,
      timestamp: Date.now(),
      ...(body.customData && typeof body.customData === 'object' ? body.customData : {}),
    });

    const params = new URLSearchParams();
    params.append('account_number', WIPAY_CONFIG.accountNumber);
    params.append('country_code', countryCode);
    params.append('currency', currency);
    params.append('environment', WIPAY_CONFIG.environment);
    params.append('fee_structure', feeStructure);
    params.append('method', 'credit_card');
    params.append('order_id', orderId);
    params.append('origin', 'LumeRefillery');
    params.append('response_url', responseUrl);
    params.append('total', formattedTotal);
    params.append('avs', body.avs ? '1' : '0');
    params.append('data', customData);
    if (body.cardType) {
      params.append('card_type', body.cardType.toLowerCase());
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    const data = await res.json().catch(() => null);
    const hostedUrl = data?.url || (res.redirected ? res.url : null);

    if (!hostedUrl) {
      console.error('WiPay API Error:', data, 'Response status:', res.status);
      return NextResponse.json(
        {
          error: data?.message || 'Failed to generate WiPay payment URL',
          details: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: hostedUrl,
      message: data?.message || 'OK',
      transactionId: data?.transaction_id,
      orderId,
    });
  } catch (error) {
    console.error('WiPay create-payment route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
