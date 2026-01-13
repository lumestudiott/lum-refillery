import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import UserDashboard from '../components/UserDashboard';

const Dashboard: React.FC = () => {
  return (
    <>
      <SignedIn>
        <UserDashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Dashboard;