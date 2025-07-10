// src/components/dashboard/profile-analytics/sections/AudienceTabsSection.tsx
'use client';

import { useState } from 'react';
import { Users, Heart, MessageCircle } from 'lucide-react';
import { Profile } from '@/types/insightiq/profile-analytics';
import AudienceSection from './AudienceSection';
import AudienceLikersSection from './AudienceLikersSection';
import AudienceCommentersSection from './AudienceCommentersSection';

interface ProfileData {
  audience: Profile['audience'];
  audience_likers?: Profile['audience_likers'];
  audience_commenters?: Profile['audience_commenters'];
}

interface AudienceTabsSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceTabsSection: React.FC<AudienceTabsSectionProps> = ({
  profile,
  formatNumber
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overall Audience',
      icon: Users
    },
    {
      id: 'likers',
      label: 'Active Likers',
      icon: Heart
    },
    {
      id: 'commenters',
      label: 'Commenters',
      icon: MessageCircle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Audience Analytics</h2>
        
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <AudienceSection profile={profile} formatNumber={formatNumber} />
        )}
        {activeTab === 'likers' && (
          <AudienceLikersSection profile={profile} formatNumber={formatNumber} />
        )}
        {activeTab === 'commenters' && (
          <AudienceCommentersSection profile={profile} formatNumber={formatNumber} />
        )}
      </div>
    </div>
  );
};

export default AudienceTabsSection;