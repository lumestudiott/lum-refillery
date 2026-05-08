'use client';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import UserDashboard from '@/components/UserDashboard';

export default function DashboardPage() {
  return (
    <>
      <SignedIn><UserDashboard /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
