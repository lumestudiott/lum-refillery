'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// 15 minutes of inactivity
const TIMEOUT_MS = 15 * 60 * 1000;

export default function IdleTimeout() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only track idle time if the user is actually signed in
    if (!isSignedIn) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const logout = () => {
      // User is idle, sign them out
      signOut(() => router.push('/'));
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, TIMEOUT_MS);
    };

    // Initialize the timer
    resetTimer();

    // Events that signify the user is active
    const events = ['mousemove', 'keydown', 'wheel', 'click', 'touchstart', 'scroll'];

    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isSignedIn, signOut, router]);

  return null;
}
