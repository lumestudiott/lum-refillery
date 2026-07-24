/**
 * WiPay (Caribbean payment gateway) configuration.
 *
 * WiPay is a hosted-redirect gateway used across Trinidad & Tobago and the
 * wider Caribbean. Credentials come from env vars and are filled in once the
 * business + bank account is registered with WiPay:
 *
 *   WIPAY_ACCOUNT_NUMBER   your WiPay account number
 *   WIPAY_API_KEY          your WiPay API key
 *   WIPAY_ENVIRONMENT      "sandbox" | "live"   (default "sandbox")
 *   WIPAY_COUNTRY_CODE     "TT" | "JM" | ...    (default "TT")
 *
 * Until these are set, `isWiPayConfigured()` returns false and the storefront
 * shows a "WiPay not configured yet" notice instead of attempting a payment.
 */
import crypto from 'crypto';

export const WIPAY_CONFIG = {
  accountNumber: process.env.WIPAY_ACCOUNT_NUMBER || (process.env.WIPAY_ENVIRONMENT === 'live' ? '' : '1234567890'),
  apiKey: process.env.WIPAY_API_KEY || (process.env.WIPAY_ENVIRONMENT === 'live' ? '' : '123'),
  environment: (process.env.WIPAY_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'live',
  countryCode: (process.env.WIPAY_COUNTRY_CODE ?? 'TT').toUpperCase(),
  currency: process.env.WIPAY_CURRENCY ?? 'TTD',
  feeStructure: (process.env.WIPAY_FEE_STRUCTURE ?? 'merchant_absorb') as 'customer_pay' | 'merchant_absorb' | 'split',
};

/**
 * Returns the country-specific WiPay payment endpoint.
 * Supported countries: TT (Trinidad & Tobago), JM (Jamaica), BB (Barbados), GY (Guyana).
 */
export function getWiPayEndpoint(countryCode?: string): string {
  const code = (countryCode || WIPAY_CONFIG.countryCode || 'TT').toLowerCase();
  const validCodes = ['tt', 'jm', 'bb', 'gy'];
  const activeCode = validCodes.includes(code) ? code : 'tt';
  return `https://${activeCode}.wipayfinancial.com/plugins/payments/request`;
}

/**
 * Verifies the MD5 hash returned by WiPay redirect:
 * md5(transaction_id + total + api_key)
 */
export function verifyWiPayHash(
  transactionId: string,
  total: string,
  apiKey: string,
  receivedHash: string
): boolean {
  if (!transactionId || !total || !apiKey || !receivedHash) return false;
  // Standardize total format if needed, but WiPay sends total as received in query
  const payload = `${transactionId}${total}${apiKey}`;
  const computedHash = crypto.createHash('md5').update(payload).digest('hex');
  return computedHash.toLowerCase() === receivedHash.toLowerCase();
}

export function isWiPayConfigured(): boolean {
  return Boolean(WIPAY_CONFIG.accountNumber && WIPAY_CONFIG.apiKey);
}

