// src/app/(dashboard)/@company/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyDashboard } from '@/components/dashboard';
import { getCompanyCampaigns } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  useEffect(() => {
    const redirectToCompanyCampaign = async () => {
      try {
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
      } catch (error) {
        console.error('Error redirecting company user:', error);
        setIsRedirecting(false); // Stay on dashboard if error
      }
    };
    
    redirectToCompanyCampaign();
  }, [router]);
  
  // Show loading while redirecting
  if (isRedirecting) {
    return <LoadingSpinner />;
  }
  
  // Only shown if redirection fails
  return <CompanyDashboard />;
}