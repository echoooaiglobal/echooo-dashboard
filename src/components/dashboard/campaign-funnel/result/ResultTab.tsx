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
          
          {/* Tab Navigation - Always visible */}
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
              Published (450)
            </button>
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
            onShowAnalytics={() => setShowAnalyticsView(true)}
          />
        </div>
      )}
    </div>
  );
};

export default ResultTab;