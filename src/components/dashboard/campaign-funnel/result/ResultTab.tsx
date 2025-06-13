// src/components/dashboard/campaign-funnel/result/ResultTab.tsx
'use client';

import { useState } from 'react';
import ScheduledResults from './ScheduledResults';
import PublishedResults from './PublishedResults';

const ResultTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'published'>('published');

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Published Campaign Result</h2>
        
        {/* Tab Navigation - Right Side */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-12 py-3 rounded-full text-sm font-medium transition-all duration-200 min-w-[180px] ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg'
                : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 hover:from-pink-200 hover:to-rose-200'
            }`}
          >
            Scheduled (345)
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-12 py-3 rounded-full text-sm font-medium transition-all duration-200 min-w-[180px] ${
              activeTab === 'published'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg'
                : 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 hover:from-pink-200 hover:to-rose-200'
            }`}
          >
            Published (450)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'scheduled' ? <ScheduledResults /> : <PublishedResults />}
      </div>
    </div>
  );
};

export default ResultTab;