'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Home } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import StatusCard from '@/components/editorial/StatusCard';

type VerificationState = 'checking' | 'paid' | 'syncing' | 'unpaid' | 'error';

function SuccessVerifier() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [state, setState] = useState<VerificationState>('checking');
  const [message, setMessage] = useState('Verifying your payment with Stripe…');

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!sessionId) {
        setState('error');
        setMessage('Missing checkout session. Please contact support if you were charged.');
        return;
      }

      try {
        const response = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) throw new Error(data.error || 'Unable to verify checkout session');

        if (data.paymentStatus === 'paid' && data.fulfilled) {
          setState('paid');
          setMessage('Payment verified. Your subscription is active.');
        } else if (data.paymentStatus === 'paid') {
          setState('syncing');
          setMessage(
            'Payment verified. Your subscription is still syncing from Stripe — refresh the dashboard in a moment.'
          );
        } else {
          setState('unpaid');
          setMessage(
            'Stripe has not marked this payment as paid yet. If this looks wrong, please contact support.'
          );
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Checkout verification error:', error);
        setState('error');
        setMessage('We could not verify this checkout session. Please contact support if you were charged.');
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const isPaid = state === 'paid';
  const isWorking = state === 'checking' || state === 'syncing';

  const variant = isPaid ? 'success' : isWorking ? 'pending' : 'error';
  const Icon = isWorking ? Loader2 : isPaid ? CheckCircle : AlertCircle;
  const title = isWorking
    ? state === 'checking'
      ? 'Checking payment'
      : 'Activating subscription'
    : isPaid
      ? 'Payment verified'
      : 'Payment needs attention';

  return (
    <StatusCard
      variant={variant}
      icon={Icon}
      iconSpinning={isWorking}
      title={title}
      description={message}
      primaryAction={{ href: '/dashboard', label: 'Go to dashboard' }}
      secondaryAction={{ href: '/', label: 'Back to home', icon: Home }}
    />
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-text-secondary">
          Checking payment…
        </div>
      }
    >
      <SuccessVerifier />
    </Suspense>
  );
}
