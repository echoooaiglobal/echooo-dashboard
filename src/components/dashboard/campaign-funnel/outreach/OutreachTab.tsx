// src/components/dashboard/campaign-funnel/outreach/OutreachTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { OutreachProvider, useOutreach } from '@/context/OutreachContext';
import { useCampaigns } from '@/context/CampaignContext';
import MessageSent from './MessageSent';
import ReadyToOnboard from './ReadyToOnboard';
import OnBoarded from './OnBoarded';
import SelectedManually from './SelectedManually';

// Inner component that uses the context
const OutreachContent: React.FC = () => {
  const [showManualSelection, setShowManualSelection] = useState(false);
  const { fetchInfluencers, readyToOnboardInfluencers, currentCampaign } = useOutreach();
  const { currentCampaign: campaignFromContext } = useCampaigns();

  // Fetch data when campaign changes
  useEffect(() => {
    console.log('🔍 OutreachTab: Campaign effect triggered', {
      hasCanpaign: !!campaignFromContext,
      campaignId: campaignFromContext?.id,
      campaignName: campaignFromContext?.name,
      campaignLists: campaignFromContext?.campaign_lists?.length
    });
    
    if (campaignFromContext) {
      console.log('🔄 OutreachTab: Campaign changed, fetching influencers:', campaignFromContext.id);
      fetchInfluencers(campaignFromContext);
    } else {
      console.log('⚠️ OutreachTab: No campaign data available');
    }
  }, [campaignFromContext, fetchInfluencers]);

  const handleSelectManually = () => {
    console.log('Opening manual selection view');
    setShowManualSelection(true);
  };

  const handleBackToMain = () => {
    console.log('Returning to main view');
    setShowManualSelection(false);
  };

  // Auto-close manual selection when all influencers are onboarded
  const handleAllOnboarded = () => {
    console.log('All influencers onboarded, closing manual selection');
    setShowManualSelection(false);
  };

  // Show manual selection view
  if (showManualSelection) {
    return (
      <SelectedManually 
        onBack={handleBackToMain}
        onAllOnboarded={handleAllOnboarded}
        campaignData={campaignFromContext}
      />
    );
  }

  // Show main outreach view
  return (
    <div className="p-6">
      
      {/* Cards Section with Overlay Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Sent Card */}
        <div className="relative">
          <MessageSent campaignData={campaignFromContext} />
        </div>

        {/* Ready to Onboard Card with Overlay Buttons */}
        <div className="relative">
          <ReadyToOnboard />
          {/* Gradient Button Area Overlay for Ready to Onboard */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-6 rounded-b-xl">
            <div className="flex space-x-3">
              <button 
                onClick={handleSelectManually}
                disabled={readyToOnboardInfluencers.length === 0}
                className={`px-6 py-3 border-2 rounded-full transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  readyToOnboardInfluencers.length > 0
                    ? 'bg-white border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500'
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                Select Manually
              </button>
              <button 
                disabled={readyToOnboardInfluencers.length === 0}
                className={`px-6 py-3 rounded-full transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 ${
                  readyToOnboardInfluencers.length > 0
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>✨</span>
                <span>Select with AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* On Boarded Card with Overlay Button */}
        <div className="relative">
          <OnBoarded />
          {/* Gradient Button Area Overlay for On Boarded */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-6 rounded-b-xl">
            <button className="px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with provider
const OutreachTab: React.FC = () => {
  return (
    <OutreachProvider>
      <OutreachContent />
    </OutreachProvider>
  );
};

export default OutreachTab;