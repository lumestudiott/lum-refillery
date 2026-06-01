'use client';

import React from 'react';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import StatusCard from '@/components/editorial/StatusCard';

export default function CancelPage() {
  return (
    <StatusCard
      variant="error"
      icon={XCircle}
      title="Payment cancelled"
      description="Your payment was cancelled. No charges were made — you can try again anytime."
      primaryAction={{ href: '/sample-hauls', label: 'Try again', icon: RotateCcw }}
      secondaryAction={{ href: '/', label: 'Back to home', icon: Home }}
    />
  );
}
