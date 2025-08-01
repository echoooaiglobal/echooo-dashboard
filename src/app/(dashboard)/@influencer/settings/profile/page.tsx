// src/app/(dashboard)/@influencer/settings/profile/page.tsx
'use client';

import ProfileSettings from '@/components/dashboard/settings/ProfileSettings';

export default function InfluencerProfileSettingsPage() {
  return (
    <ProfileSettings 
      userType="influencer" 
      showCompanyFields={false} 
    />
  );
}