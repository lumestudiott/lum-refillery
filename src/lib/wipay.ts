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
export const WIPAY_CONFIG = {
  accountNumber: process.env.WIPAY_ACCOUNT_NUMBER ?? '',
  apiKey: process.env.WIPAY_API_KEY ?? '',
  environment: (process.env.WIPAY_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'live',
  countryCode: process.env.WIPAY_COUNTRY_CODE ?? 'TT',
};

export function isWiPayConfigured(): boolean {
  return Boolean(WIPAY_CONFIG.accountNumber && WIPAY_CONFIG.apiKey);
}
