// src/app/(dashboard)/@company/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CompanyDashboard } from '@/components/dashboard';
import { getCompanyCampaigns } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanyDashboardPage() {
  const { getPrimaryRole, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const primaryRole = getPrimaryRole();
  
  useEffect(() => {
    // FIXED: Only run redirect logic once when component mounts
    // and only if we haven't already checked
    if (hasCheckedRedirect || !isAuthenticated || !user) {
      return;
    }

    // FIXED: Only redirect if we're specifically on /dashboard, not on /campaigns or other routes
    if (pathname !== '/dashboard') {
      setHasCheckedRedirect(true);
      return;
    }

    const redirectToCompanyCampaign = async () => {
      setIsRedirecting(true);
      
      try {
        // Different behavior based on company role
        switch (primaryRole) {
          case 'company_marketer':
          case 'b2c_company_admin':
          case 'company_manager':
          case 'b2c_company_owner':
            // These roles should redirect to campaigns
            console.log('🔄 Company Dashboard: Redirecting marketing roles to campaigns');
            const company = getStoredCompany();
            
            if (company && company.id) { console.log('🔍 Company Dashboard: Found company, fetching campaigns...');
              try {
                const campaigns = await getCompanyCampaigns(company.id);
                
                if (campaigns && campaigns.length > 0) { console.log('✅ Company Dashboard: Found campaigns, redirecting to /campaigns');
                  // Navigate to campaigns list page, not a specific campaign
                  console.log('✅ Company Dashboard: Found campaigns, redirecting to /campaigns');
                  router.push('/campaigns');
                } else {
                  console.warn('⚠️ Company Dashboard: No campaigns found, redirecting to create new campaign');
                  // No campaigns, redirect to create new campaign
                  console.log('📝 Company Dashboard: No campaigns found, redirecting to /campaigns/new');
                  router.push('/campaigns/new');
                }
              } catch (campaignError) {
                console.error('❌ Company Dashboard: Error fetching campaigns:', campaignError);
                // If there's an error fetching campaigns, just go to campaigns page
                router.push('/campaigns');
              }
            } else {
              console.warn('⚠️ Company Dashboard: No company data found, staying on dashboard');
              setIsRedirecting(false);
            }
            break;
            
          case 'company_accountant':
          case 'company_content_creator':
          case 'company_user':
          default:
            // These roles stay on the dashboard
            console.log('🏠 Company Dashboard: Non-marketing role, staying on dashboard');
            setIsRedirecting(false);
            break;
        }
      } catch (error) {
        console.error('💥 Company Dashboard: Error in redirect logic:', error);
        setIsRedirecting(false);
      } finally {
        setHasCheckedRedirect(true);
      }
    };
    
    // Add a small delay to prevent immediate redirects that might cause loops
    const timeoutId = setTimeout(() => {
      redirectToCompanyCampaign();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router, primaryRole, pathname, isAuthenticated, user, hasCheckedRedirect]);
  
  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Setting up your dashboard..." />
      </div>
    );
  }
  
  // Show dashboard with role-specific welcome message
  const getRoleSpecificMessage = () => {
    switch (primaryRole) {
      case 'b2c_company_owner':
        return 'Manage your company campaigns and team.';
      case 'company_manager':
        return 'Oversee marketing operations and team performance.';
      case 'company_marketer':
        return 'Create and optimize your marketing campaigns.';
      case 'company_accountant':
        return 'Review financial data and campaign budgets.';
      case 'company_content_creator':
        return 'Collaborate on content creation and campaign assets.';
      default:
        return 'Welcome to your company dashboard.';
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {primaryRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard
        </h1>
        <p className="text-gray-600">{getRoleSpecificMessage()}</p>
      </div>
      <CompanyDashboard />
    </div>
  );
}