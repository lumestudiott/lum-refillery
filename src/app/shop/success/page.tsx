'use client';

import React, { useEffect } from 'react';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import StatusCard from '@/components/editorial/StatusCard';
import { useCart } from '@/context/CartContext';

export default function ShopSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <StatusCard
      variant="success"
      icon={CheckCircle}
      title="Order confirmed"
      description="Thank you for your order. We'll send a confirmation email with your delivery details shortly."
      primaryAction={{ href: '/shop', label: 'Continue shopping', icon: ShoppingBag }}
      secondaryAction={{ href: '/', label: 'Back to home', icon: Home }}
    />
  );
}
