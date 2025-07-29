// src/app/(dashboard)/@company/settings/page.tsx - NEW FILE
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanySettingsIndexPage() {
  const { getPrimaryRole, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoading) return;
    
    const primaryRole = getPrimaryRole() as DetailedRole;
    
    // Redirect to appropriate default settings page based on company role
    const getDefaultSettingsPage = (role: DetailedRole): string => {
      switch (role) {
        // Company Owner/Admin - redirect to company settings
        case 'b2c_company_owner':
        case 'b2c_company_admin':
          return '/settings/company';
          
        // Marketing roles - redirect to campaign settings
        case 'b2c_marketing_director':
        case 'b2c_campaign_manager':
          return '/settings/campaigns';
          
        // Financial roles - redirect to billing
        case 'b2c_finance_manager':
          return '/settings/billing';
          
        // Performance roles - redirect to analytics
        case 'b2c_performance_analyst':
          return '/settings/analytics';
          
        // All other roles - redirect to profile
        default:
          return '/settings/profile';
      }
    };
    
    const defaultPage = getDefaultSettingsPage(primaryRole);
    router.replace(defaultPage);
    
  }, [isLoading, getPrimaryRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Redirecting to Settings...</h2>
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
}
