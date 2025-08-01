// src/app/(dashboard)/@company/settings/profile/page.tsx
'use client';

import ProfileSettings from '@/components/dashboard/settings/ProfileSettings';

export default function CompanyProfileSettingsPage() {
  return (
    <ProfileSettings 
      userType="company" 
      showCompanyFields={true} 
    />
  );
}