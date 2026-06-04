'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useConvexAuth } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import AddressForm from '@/components/dashboard/AddressForm';
import { Truck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function OnboardingContent() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const addresses = useQuery(api.addresses.listMine, isAuthenticated ? undefined : 'skip');

  useEffect(() => {
    if (addresses !== undefined && addresses.length > 0) {
      // User already has an address, send them to dashboard
      router.push('/dashboard');
    }
  }, [addresses, router]);

  if (!isAuthenticated || addresses === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lume-house/20 border-t-lume-house" />
      </div>
    );
  }

  // If they have an address, we are redirecting them, so don't render the form
  if (addresses.length > 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
      <div className="rounded-[32px] border border-white/60 bg-white/50 p-8 sm:p-12 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lume-accent/10">
            <Truck className="h-6 w-6 text-lume-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-normal text-text-primary">
              Welcome to Lumë!
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Where in Trinidad and Tobago should we deliver your hauls?
            </p>
          </div>
        </div>

        <AddressForm
          requirePrimary={true}
          onSuccess={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <SignedIn>
          <OnboardingContent />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </main>
      <Footer />
    </>
  );
}
