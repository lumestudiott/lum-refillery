'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Routes that should NOT trigger the onboarding redirect.
 * The onboarding page itself, API routes, sign-in/up pages, and public pages
 * that unauthenticated users visit.
 */
const EXCLUDED_PATHS = ['/onboarding', '/sign-in', '/sign-up'];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const pathname = usePathname();
  const router = useRouter();

  const createUser = useMutation(api.users.createUser);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !syncedRef.current) {
      createUser({}).catch(console.error);
      syncedRef.current = true;
    }
  }, [isAuthenticated, createUser]);

  // Only query addresses when the user is actually authenticated
  const addresses = useQuery(
    api.addresses.listMine,
    isAuthenticated ? undefined : 'skip'
  );

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) return;

    // Don't redirect if the user isn't signed in
    if (!isAuthenticated) return;

    // Don't redirect if we're already on an excluded path
    if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return;

    // Don't redirect if we're still loading addresses from the DB
    if (addresses === undefined) return;

    // If user has no addresses, send them to onboarding
    if (addresses.length === 0) {
      router.replace('/onboarding');
    }
  }, [authLoading, isAuthenticated, addresses, pathname, router]);

  return <>{children}</>;
}
