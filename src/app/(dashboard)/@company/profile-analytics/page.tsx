// src\app\(dashboard)\@company\profile-analytics\page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InfluencerProfileReport from '@/components/dashboard/profile-analytics/InfluencerProfileReport';

function ProfileAnalytics() {

  return (
    <InfluencerProfileReport />
  );
}


// Protected Dashboard Page
export default function Campaigns() {
  return (
    <ProtectedRoute>
      <ProfileAnalytics />
    </ProtectedRoute>
  );
}