'use client';

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return (
    <>
      <SignedIn>
        <AdminDashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
