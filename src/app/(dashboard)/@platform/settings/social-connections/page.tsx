// src/app/(dashboard)/@platform/settings/social-connections/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialConnectionsSettings from '@/components/dashboard/settings/SocialConnectionsSettings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SocialConnectionsPage() {
  const { user, getPrimaryRole, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is platform_agent
    const primaryRole = getPrimaryRole();
    if (primaryRole !== 'platform_agent') {
      router.push('/settings'); // Redirect to main settings if not platform agent
      return;
    }

    setIsAuthorized(true);
    setChecking(false);
  }, [user, isLoading, getPrimaryRole, router]);

  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading social connections..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-red-900 mb-2">Access Restricted</h1>
          <p className="text-red-700">
            Social account connections are only available for Platform Agents. 
            Please contact your administrator if you need access to this feature.
          </p>
        </div>
      </div>
    );
  }

  return <SocialConnectionsSettings />;
}