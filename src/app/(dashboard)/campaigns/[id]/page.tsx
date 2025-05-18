// src/app/(dashboard)/campaigns/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Archive, Share2, MoreHorizontal } from 'react-feather';
import Link from 'next/link';
import { getCampaignById, Campaign } from '@/services/campaign/campaign.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CampaignFunnelSection from '@/components/dashboard/campaign-funnel/CampaignFunnelSection';
import DashboardMetricsSection from '@/components/dashboard/metrics/DashboardMetricsSection';
import { useCampaigns } from '@/context/CampaignContext';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { getCampaign, currentCampaign, setCurrentCampaign } = useCampaigns();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaign() {
      if (!campaignId) return;

      try {
        setIsLoading(true);
        const campaign = await getCampaign(campaignId);
        if (!campaign) {
          setError('Campaign not found');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        setError('Failed to load campaign details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCampaign();
    
    // Cleanup
    return () => {
      setCurrentCampaign(null);
    };
  }, [campaignId, getCampaign, setCurrentCampaign]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !currentCampaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Campaign not found'}</p>
          <Link 
            href="/campaigns" 
            className="mt-4 inline-block text-red-700 hover:underline"
          >
            Return to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button and actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link 
            href="/campaigns" 
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">{currentCampaign.name}</h1>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <DashboardMetricsSection userType="company"/>

      {/* Main content - Campaign Funnel */}
      <CampaignFunnelSection 
        userType="company" 
        campaignData={currentCampaign} 
        isNewCampaign={false}
      />
    </div>
  );
}