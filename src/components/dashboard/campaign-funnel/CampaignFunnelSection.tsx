// src/components/dashboard/campaign-funnel/CampaignFunnelSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiscoverTab from '@/components/dashboard/campaign-funnel/discover/DiscoverTab';
import OutreachTab from '@/components/dashboard/campaign-funnel/outreach/OutreachTab';
import ManagementTab from '@/components/dashboard/campaign-funnel/management/ManagementTab';
import ResultTab from '@/components/dashboard/campaign-funnel/result/ResultTab';
import PaymentsTab from '@/components/dashboard/campaign-funnel/payments/PaymentsTab';
import { Campaign } from '@/types/campaign';

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
        return <ResultTab
          campaignData={campaignData}
        />;
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
    <div className="w-full overflow-hidden bg-white rounded-xl shadow-md mb-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 py-4">
        <button
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mx-2 shadow-md border-2 hover:shadow-lg ${
            activeTab === 'discover'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 hover:from-purple-600 hover:to-purple-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('discover')}
        >
          Discover
        </button>
        
        <button
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mx-2 shadow-md border-2 hover:shadow-lg ${
            activeTab === 'outreach'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 hover:from-purple-600 hover:to-purple-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('outreach')}
          disabled={isNewCampaign}
        >
          Outreach
        </button>
        
        <button
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mx-2 shadow-md border-2 hover:shadow-lg ${
            activeTab === 'management'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 hover:from-purple-600 hover:to-purple-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('management')}
          disabled={isNewCampaign}
        >
          Campaign
        </button>
        
        <button
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mx-2 shadow-md border-2 hover:shadow-lg ${
            activeTab === 'result'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 hover:from-purple-600 hover:to-purple-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('result')}
          disabled={isNewCampaign}
        >
          Result
        </button>
        
        <button
          className={`flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mx-2 shadow-md border-2 hover:shadow-lg ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-300 hover:from-purple-600 hover:to-purple-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
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