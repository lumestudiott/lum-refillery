import React from 'react';
import MaintenanceBanner from '@/components/MaintenanceBanner';

export const metadata = {
  title: 'Maintenance | Lumë Refillery',
  robots: 'noindex, nofollow', // Prevent search engines from indexing the maintenance page
};

export default function MaintenancePage() {
  return <MaintenanceBanner forceShow={true} />;
}
