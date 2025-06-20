// src/components/dashboard/profile-analytics/InfluencerProfileReport.tsx
'use client';

import { useState } from 'react';
import { 
  BarChart3,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';
import profileAnalysis from '@/lib/profile-analysis';

// Import the individual section components
import OverviewSection from './sections/OverviewSection';
import GrowthSection from './sections/GrowthSection';
import AudienceSection from './sections/AudienceSection';
import ContentSection from './sections/ContentSection';
import PricingSection from './sections/PricingSection';
import AnalyticsSection from './sections/AnalyticsSection';
import AudienceTabsSection from './sections/AudienceTabsSection';
// import profileAnalysis from './data/profile-analysis';

const InfluencerProfileReport: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audience' | 'content' | 'pricing' | 'growth' | 'analytics'>('overview');
  const { profile, pricing, price_explanations } = profileAnalysis;

  const formatNumber = (num: number) => {
    if(num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEngagementLevel = (rate: number) => {
    if (rate >= 6) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 3) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 1) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getInfluencerTier = (followers: number) => {
    if (followers >= 1000000) return 'Mega Influencer';
    if (followers >= 100000) return 'Macro Influencer';
    if (followers >= 10000) return 'Mid-tier Influencer';
    if (followers >= 1000) return 'Micro Influencer';
    return 'Nano Influencer';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'growth', label: 'Growth', icon: TrendingUp },
          { id: 'content', label: 'Content', icon: Target },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 min-w-0 ${
              activeSection === id
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
 
      {/* Content */}
      <div className="min-h-screen">
        {activeSection === 'overview' && (
          <OverviewSection
            profile={profile}
            formatNumber={formatNumber}
            getEngagementLevel={getEngagementLevel}
            getInfluencerTier={getInfluencerTier}
          />
        )}
        {activeSection === 'audience' && (
          <AudienceTabsSection 
            profile={profile}
            formatNumber={formatNumber}
          />
        )}
        {activeSection === 'content' && (
          <ContentSection
            profile={profile}
            formatNumber={formatNumber}
          />
        )}
        {activeSection === 'growth' && (
          <GrowthSection
            profile={profile}
            formatNumber={formatNumber}
          />
        )}
        {activeSection === 'pricing' && (
          <PricingSection
            pricing={pricing}
            price_explanations={price_explanations}
            profile={profile}
            formatCurrency={formatCurrency}
          />
        )}
        {activeSection === 'analytics' && (
          <AnalyticsSection
            profile={profile}
            pricing={pricing}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
            getInfluencerTier={getInfluencerTier}
            getEngagementLevel={getEngagementLevel}
          />
        )}
      </div>
    </div>
  );
};

export default InfluencerProfileReport;