// src/components/dashboard/campaign-funnel/CampaignFunnelSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiscoverTab from '@/components/dashboard/campaign-funnel/discover/DiscoverTab';
import OutreachTab from '@/components/dashboard/campaign-funnel/outreach/OutreachTab';
import ManagementTab from '@/components/dashboard/campaign-funnel/management/ManagementTab';
import ResultTab from '@/components/dashboard/campaign-funnel/result/ResultTab';
import PaymentsTab from '@/components/dashboard/campaign-funnel/payments/PaymentsTab';
import { Campaign } from '@/services/campaign/campaign.service';

// Define the available tab options
type FunnelTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

interface CampaignFunnelSectionProps {
  userType?: 'company' | 'influencer' | 'platform';
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  initialTab?: FunnelTab;
}

const CampaignFunnelSection: React.FC<CampaignFunnelSectionProps> = ({ 
  userType = 'company',
  campaignData = null,
  isNewCampaign = false,
  initialTab = 'discover'
}) => {
  const [activeTab, setActiveTab] = useState<FunnelTab>(initialTab);
  const router = useRouter();

  // Handle tab change
  const handleTabChange = (tab: FunnelTab) => {
    setActiveTab(tab);
  };

  // Handle campaign creation - used for new campaigns
  const handleCampaignCreated = (createdCampaign: Campaign) => {
    if (createdCampaign && createdCampaign.id) {
      router.push(`/campaigns/${createdCampaign.id}`);
    }
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <DiscoverTab 
            campaignData={campaignData} 
            isNewCampaign={isNewCampaign}
            onCampaignCreated={isNewCampaign ? handleCampaignCreated : undefined}
          />
        );
      case 'outreach':
        return <OutreachTab/>;
      case 'management':
        return <ManagementTab/>;
      case 'result':
        return <ResultTab/>;
      case 'payments':
        return <PaymentsTab/>;
      default:
        return <DiscoverTab 
          campaignData={campaignData} 
          isNewCampaign={isNewCampaign}
          onCampaignCreated={isNewCampaign ? handleCampaignCreated : undefined}
        />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between overflow-x-auto px-1 py-1 border-b border-gray-100 bg-gray-50">
        <button
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'discover'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange('discover')}
        >
          Discover
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'outreach'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange('outreach')}
          disabled={isNewCampaign}
        >
          Outreach
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'management'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange('management')}
          disabled={isNewCampaign}
        >
          Campaign Management
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'result'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange('result')}
          disabled={isNewCampaign}
        >
          Result
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'payments'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => handleTabChange('payments')}
          disabled={isNewCampaign}
        >
          Payments
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CampaignFunnelSection;