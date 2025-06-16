// src\app\(dashboard)\@company\profile-analytics\page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InfluencerProfileReport from '@/components/dashboard/profile-analytics/InfluencerProfileReport';

function ProfileAnalytics() {

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">User Report</h1>
      </div>
    </div>
  );
}


// Protected Dashboard Page
export default function Campaigns() {
  return (
    <ProtectedRoute>
      <ProfileAnalytics />
      <InfluencerProfileReport />
    </ProtectedRoute>
  );
}