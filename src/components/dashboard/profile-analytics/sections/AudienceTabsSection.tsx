// src/components/dashboard/profile-analytics/sections/AudienceTabsSection.tsx
'use client';

import { useState } from 'react';
import { Users, Heart, MessageCircle } from 'lucide-react';
import AudienceSection from './AudienceSection';
import AudienceLikersSection from './AudienceLikersSection';
import AudienceCommentersSection from './AudienceCommentersSection';

interface GenderDistribution {
  gender: string;
  value: number;
}

interface AgeDistribution {
  gender: string;
  age_range: string;
  value: number;
}

interface Country {
  code: string;
  value: number;
}

interface City {
  name: string;
  value: number;
}

interface Language {
  code: string;
  value: number;
}

interface Ethnicity {
  name: string;
  value: number;
}

interface FollowerType {
  name: string;
  value: number;
}

interface Interest {
  name: string;
  value: number;
}

interface SignificantFollower {
  platform_username: string;
  image_url: string;
  follower_count: number;
  is_verified: boolean;
}

interface Audience {
  gender_distribution: GenderDistribution[];
  gender_age_distribution: AgeDistribution[];
  countries: Country[];
  cities: City[];
  languages: Language[];
  ethnicities: Ethnicity[];
  follower_types: FollowerType[];
  interests: Interest[];
  credibility_score: number;
  significant_followers_percentage: number;
  significant_followers: SignificantFollower[];
}

interface AudienceCommenters {
  countries?: Country[];
  credibility_score?: number;
}

interface AudienceLikers {
  countries?: Country[];
  cities?: City[];
  gender_age_distribution?: AgeDistribution[];
  ethnicities?: Ethnicity[];
  languages?: Language[];
  follower_types?: FollowerType[];
  interests?: Interest[];
  credibility_score?: number;
  gender_distribution?: GenderDistribution[];
  significant_likers_percentage?: number;
  significant_likers?: SignificantFollower[];
}

interface ProfileData {
  audience: Audience;
  audience_likers?: AudienceLikers;
  audience_commenters?: AudienceCommenters;
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
      icon: Users,
      count: formatNumber(profile.audience?.significant_followers?.length || 0)
    },
    {
      id: 'likers',
      label: 'Active Likers',
      icon: Heart,
      count: profile.audience_likers?.significant_likers ? 
        formatNumber(profile.audience_likers.significant_likers.length) : '0'
    },
    {
      id: 'commenters',
      label: 'Commenters',
      icon: MessageCircle,
      count: profile.audience_commenters?.countries ? 
        formatNumber(profile.audience_commenters.countries.length) : '0'
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
                  {tab.count && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
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