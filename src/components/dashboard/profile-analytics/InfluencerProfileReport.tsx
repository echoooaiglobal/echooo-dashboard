// src/components/dashboard/profile-analytics/InfluencerProfileReport.tsx
'use client';

import { useState } from 'react';
import { 
  BarChart3,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Activity,
  MapPin, 
  Globe, 
  ExternalLink,
  Verified,
  RefreshCw
} from 'lucide-react';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

// Import the individual section components
import OverviewSection from './sections/OverviewSection';
import GrowthSection from './sections/GrowthSection';
import AudienceSection from './sections/AudienceSection';
import ContentSection from './sections/ContentSection';
import PricingSection from './sections/PricingSection';
import AnalyticsSection from './sections/AnalyticsSection';
import AudienceTabsSection from './sections/AudienceTabsSection';

interface InfluencerProfileReportProps {
  analyticsData?: InsightIQProfileAnalyticsResponse;
  platformAccountId?: string | null;
  platformId?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const InfluencerProfileReport: React.FC<InfluencerProfileReportProps> = ({
  analyticsData,
  platformAccountId,
  platformId,
  onRefresh,
  isRefreshing = false
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audience' | 'content' | 'pricing' | 'growth' | 'analytics'>('overview');
  const profile = analyticsData?.profile || null;
  const pricing = analyticsData?.pricing || null;
  const price_explanations = analyticsData?.price_explanations || null;

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

  // Helper function to format location
  const formatLocation = () => {
    if (!profile?.location) return 'Location not specified';
    
    const { city, state, country } = profile.location;
    const parts = [city, state, country].filter(Boolean);
    
    if (parts.length === 0) return 'Location not specified';
    return parts.join(', ');
  };

  if (!profile) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile.image_url}
                alt={profile.full_name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-avatar.png'; // Fallback image
                }}
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              <p className="text-lg opacity-90">@{profile.platform_username}</p>
              <p className="text-sm opacity-80 mt-2 max-w-md">{profile.introduction}</p>
              <div className="flex items-center mt-3 space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{formatLocation()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{profile.language || 'Not specified'}</span>
                </span>
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Profile</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-right space-y-3">
            {/* Refresh Icon */}
            <div className="flex justify-end">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isRefreshing ? 'Refreshing data...' : 'Refresh data from source'}
              >
                <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-xl font-bold">{formatNumber(profile.follower_count)}</div>
              <div className="text-xs opacity-80">Followers</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <div className="text-sm font-bold">{getInfluencerTier(profile.follower_count)}</div>
              <div className="text-xs opacity-80">Tier</div>
            </div>
            <div className="text-xs opacity-90">
              Last updated: {new Date(profile.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
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
      <div>
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