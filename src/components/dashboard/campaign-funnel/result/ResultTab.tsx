// src/components/dashboard/campaign-funnel/result/ResultTab.tsx
'use client';

import { useState } from 'react';
import ScheduledResults from './ScheduledResults';
import PublishedResults from './PublishedResults';
import AnalyticsView from './AnalyticsView';
import { Campaign } from '@/services/campaign/campaign.service';

type TabType = 'scheduled' | 'published';

const TABS = {
  SCHEDULED: 'scheduled' as const,
  PUBLISHED: 'published' as const,
} satisfies Record<string, TabType>;

interface ResultTabProps {
  campaignData?: Campaign | null;
}

const ResultTab: React.FC<ResultTabProps> = ({ 
  campaignData = null,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(TABS.PUBLISHED);
  const [showAnalyticsView, setShowAnalyticsView] = useState(false);
  const [publishedVideoCount, setPublishedVideoCount] = useState(0);

  // Handle video count updates from PublishedResults
  const handleVideoCountChange = (count: number) => {
    setPublishedVideoCount(count);
  };

  // If analytics view is active, show that component
  if (showAnalyticsView) {
    return <AnalyticsView onBack={() => setShowAnalyticsView(false)} campaignData={campaignData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tab buttons - Always visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            {activeTab === TABS.SCHEDULED ? 'Scheduled Campaign Content' : 'Published Campaign Result'}
          </h2>
          
          {/* Tab Navigation with View Analytics Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab(TABS.SCHEDULED)}
              className={`px-12 py-3 rounded-full text-sm font-medium transition-all duration-200 min-w-[180px] ${
                activeTab === TABS.SCHEDULED
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg'
                  : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 hover:from-pink-200 hover:to-rose-200'
              }`}
            >
              Scheduled (345)
            </button>
            <button
              onClick={() => setActiveTab(TABS.PUBLISHED)}
              className={`px-12 py-3 rounded-full text-sm font-medium transition-all duration-200 min-w-[180px] ${
                activeTab === TABS.PUBLISHED
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg'
                  : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 hover:from-pink-200 hover:to-rose-200'
              }`}
            >
              Published ({publishedVideoCount})
            </button>
            
            {/* View Analytics Button - Always show when Published tab is active */}
            {activeTab === TABS.PUBLISHED && (
              <button 
                onClick={() => setShowAnalyticsView(true)}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full hover:from-green-200 hover:to-green-300 transition-all duration-200 text-sm font-medium shadow-sm min-w-[150px]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                </svg>
                View Analytics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === TABS.SCHEDULED ? (
        <ScheduledResults onTabChange={setActiveTab} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <PublishedResults 
            campaignData={campaignData}
            onVideoCountChange={handleVideoCountChange}
          />
        </div>
      )}
    </div>
  );
};

export default ResultTab;