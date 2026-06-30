'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertTriangle } from 'lucide-react';

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
// A real Stripe key starts with pk_test_ or pk_live_ and isn't our placeholder.
const PK_OK = /^pk_(test|live)_/.test(PK) && !PK.includes('PLACEHOLDER') && !PK.includes('your_');
const stripePromise = PK_OK ? loadStripe(PK) : null;

/** The actual card fields + confirm button (must live inside <Elements>). */
function CardFields({ onSaved }: { onSaved: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });
    if (error) {
      setError(error.message ?? 'Could not save your card.');
      setSubmitting(false);
      return;
    }
    onSaved();
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={save}
        disabled={!stripe || submitting}
        className="btn-pill inline-flex w-full items-center justify-center gap-2 bg-lume-accent px-7 py-3.5 text-[15px] font-semibold tracking-tight text-white shadow-frap transition-all hover:bg-lume-green disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Save card &amp; finish
          </>
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[12px] text-text-secondary">
        <Lock className="h-3 w-3" />
        Secured by Stripe · no charge today
      </p>
    </div>
  );
}

/** Loads a SetupIntent then renders the card form. */
export default function PaymentCardForm({ onSaved }: { onSaved: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!PK_OK) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/setup-intent', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start payment setup');
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to start payment setup');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stripe keys not configured for this environment (e.g. local/staging with
  // placeholder keys). Show a friendly notice instead of a broken form.
  if (!PK_OK) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Card entry is available on the live site. This environment doesn&apos;t have
          Stripe keys configured yet.
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-lume-accent" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#00754A',
            colorText: 'rgba(0,0,0,0.87)',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
          },
        },
      }}
    >
      <CardFields onSaved={onSaved} />
    </Elements>
  );
}
