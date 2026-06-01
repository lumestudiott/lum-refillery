'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { ReactNode, useMemo } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CartProvider } from '@/context/CartContext';
import IdleTimeout from '@/components/IdleTimeout';

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function Providers({ children }: { children: ReactNode }) {
  const convex = useMemo(
    () =>
      new ConvexReactClient(
        requirePublicEnv(
          'NEXT_PUBLIC_CONVEX_URL',
          process.env.NEXT_PUBLIC_CONVEX_URL
        )
      ),
    []
  );

  return (
    <ClerkProvider
      publishableKey={requirePublicEnv(
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      )}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <CartProvider>
          <IdleTimeout />
          <ErrorBoundary>{children}</ErrorBoundary>
        </CartProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
