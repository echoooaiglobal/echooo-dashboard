// src/app/(dashboard)/@company/dashboard/page.tsx - Enhanced with role support
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CompanyDashboard } from '@/components/dashboard';
import { getCompanyCampaigns } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanyDashboardPage() {
  const { getPrimaryRole } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const primaryRole = getPrimaryRole();
  
  useEffect(() => {
    const redirectToCompanyCampaign = async () => {
      try {
        // Different behavior based on company role
        switch (primaryRole) {
          case 'company_admin':
          case 'company_manager':
          case 'company_marketer':
            // These roles should redirect to campaigns
            const company = getStoredCompany();
            if (company && company.id) {
              const campaigns = await getCompanyCampaigns(company.id);
              
              if (campaigns && campaigns.length > 0) {
                // Navigate to the most recent campaign
                const mostRecentCampaign = campaigns.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )[0];
                
                router.push(`/campaigns/${mostRecentCampaign.id}`);
              } else {
                router.push('/campaigns/new');
              }
            } else {
              setIsRedirecting(false); // Stay on dashboard if no company data
            }
            break;
            
          case 'company_accountant':
          case 'company_content_creator':
          case 'company_user':
          default:
            // These roles stay on the dashboard
            setIsRedirecting(false);
            break;
        }
      } catch (error) {
        console.error('Error redirecting company user:', error);
        setIsRedirecting(false); // Stay on dashboard if error
      }
    };
    
    redirectToCompanyCampaign();
  }, [router, primaryRole]);
  
  // Show loading while redirecting
  if (isRedirecting) {
    return <LoadingSpinner />;
  }
  
  // Show dashboard with role-specific welcome message
  const getRoleSpecificMessage = () => {
    switch (primaryRole) {
      case 'company_admin':
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