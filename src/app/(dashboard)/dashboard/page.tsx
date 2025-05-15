// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PlatformDashboard, CompanyDashboard, InfluencerDashboard } from '@/components/dashboard';

/**
 * Dashboard page that conditionally renders the appropriate dashboard
 * based on the user's type (platform, company, or influencer)
 */
function DashboardContent() {
  const { user, isLoading, roles } = useAuth();

  // Use a loading state while determining user type
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Determine which dashboard to render based on user type
  // Default to influencer dashboard if type is not specified
  const userType = user?.user_type || 'influencer';

  return (
    <div className="w-full">
      {userType === 'platform' && <PlatformDashboard />}
      {userType === 'company' && <CompanyDashboard />}
      {userType === 'influencer' && <InfluencerDashboard />}
    </div>
  );
}

// Protected Dashboard Page
export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}