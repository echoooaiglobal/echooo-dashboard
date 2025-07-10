// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedAnalytics.tsx
'use client';

import { CampaignListMember } from '@/services/campaign/campaign-list.service';

interface ShortlistedAnalyticsProps {
  members: CampaignListMember[];
}

const ShortlistedAnalytics: React.FC<ShortlistedAnalyticsProps> = ({ members }) => {
  // Calculate total followers count (existing logic)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalFollowers = members.reduce((total, member) => {
    const followersCount = member.social_account?.followers_count;
    let parsedCount = 0;
    
    if (followersCount) {
      if (typeof followersCount === 'string') {
        const numStr = (followersCount as string).toLowerCase() || '0';
        const baseNumber = parseFloat(numStr.replace(/[km]/g, ''));
        if (numStr.includes('k')) {
          parsedCount = baseNumber * 1000;
        } else if (numStr.includes('m')) {
          parsedCount = baseNumber * 1000000;
        } else {
          parsedCount = baseNumber || 0;
        }
      } else if (typeof followersCount === 'number') {
        parsedCount = followersCount;
      }
    }
    
    return total + parsedCount;
  }, 0);

  // Calculate total media count from actual data
  const totalMediaCount = members.reduce((total, member) => {
    const mediaCount = member.social_account?.media_count || 0;
    return total + mediaCount;
  }, 0);

  // Calculate total content count from additional metrics (fallback to media_count)
  const totalContentCount = members.reduce((total, member) => {
    const contentCount = member.social_account?.additional_metrics?.content_count || 
                        member.social_account?.media_count || 0;
    return total + contentCount;
  }, 0);

  // Calculate average engagement rate
  const averageEngagementRate = members.length > 0 ? 
    members.reduce((total, member) => {
      const engagementRate = member.social_account?.additional_metrics?.engagementRate || 0;
      return total + engagementRate;
    }, 0) / members.length : 0;

  // Calculate total average likes
  const totalAverageLikes = members.reduce((total, member) => {
    const avgLikes = member.social_account?.additional_metrics?.average_likes || 0;
    return total + avgLikes;
  }, 0);

  // Calculate estimated total engagements (average likes * content count)
  const estimatedTotalEngagements = members.reduce((total, member) => {
    const avgLikes = member.social_account?.additional_metrics?.average_likes || 0;
    const contentCount = member.social_account?.additional_metrics?.content_count || 
                        member.social_account?.media_count || 1;
    return total + (avgLikes * contentCount);
  }, 0);

  // Count verified influencers
  const verifiedCount = members.filter(member => member.social_account?.is_verified).length;

  // Count business accounts
  const businessAccountsCount = members.filter(member => member.social_account?.is_business).length;

  // Calculate total subscribers (for YouTube channels)
  const totalSubscribers = members.reduce((total, member) => {
    const subscriberCount = member.social_account?.subscribers_count || 
                           member.social_account?.additional_metrics?.subscriber_count || 0;
    return total + subscriberCount;
  }, 0);

  return (
    <div className="w-4/12 bg-white rounded-lg shadow flex flex-col">
      <div className="p-5 flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">List Analyze</h2>
            <button className="flex items-center text-red-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export List
            </button>
          </div>
          
          {/* Donut Charts - Smaller size for better fit */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Audience by Age - Keep hardcoded as this is audience demographics data */}
            <div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="51 49" strokeDashoffset="25"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="36.2 63.8" strokeDashoffset="76"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6.5 93.5" strokeDashoffset="39.8"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="3" strokeDasharray="4.8 95.2" strokeDashoffset="46.3"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">6.5%</span>
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium text-gray-700">Audience by age</p>
              </div>
              
              {/* Age Legend */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">25-34</span>
                  <span className="ml-auto text-xs font-medium">51.0%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">18-24</span>
                  <span className="ml-auto text-xs font-medium">36.2%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">35-44</span>
                  <span className="ml-auto text-xs font-medium">6.5%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">13-17</span>
                  <span className="ml-auto text-xs font-medium">4.8%</span>
                </div>
              </div>
            </div>
            
            {/* Audience by Location - Keep hardcoded as this is audience demographics data */}
            <div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="63.1 36.9" strokeDashoffset="25"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="3" strokeDasharray="14.1 85.9" strokeDashoffset="88.1"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="1.9 98.1" strokeDashoffset="102.2"></circle>
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#14b8a6" strokeWidth="3" strokeDasharray="20.9 79.1" strokeDashoffset="104.1"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">63.1%</span>
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium text-gray-700">Audience by location</p>
              </div>
              
              {/* Location Legend */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">Pakistan</span>
                  <span className="ml-auto text-xs font-medium">63.1%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">India</span>
                  <span className="ml-auto text-xs font-medium">14.1%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">United Arab Emirates</span>
                  <span className="ml-auto text-xs font-medium">1.9%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                  <span className="text-xs text-gray-600">Others</span>
                  <span className="ml-auto text-xs font-medium">20.9%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metrics Rows - More compact */}
          <div className="space-y-3">
            {/* First Row of Metrics */}
            <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{formatNumber(totalFollowers)}</p>
                <p className="text-xs text-gray-500">Total Followers</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalMediaCount > 0 ? formatNumber(totalMediaCount) : '3.4'}</p>
                <p className="text-xs text-gray-500">Total Content</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">663.4K</p>
                <p className="text-xs text-gray-500">Post Impressions</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">1.4M</p>
                <p className="text-xs text-gray-500">Story Views</p>
              </div>
            </div>
            
            {/* Campaign Engagements */}
            <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
              <p>Total campaign engagements: {estimatedTotalEngagements > 0 ? formatNumber(estimatedTotalEngagements) : '743.9K'}</p>
            </div>
            
            {/* Second Row of Metrics */}
            <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">$95.4K</p>
                <p className="text-xs text-gray-500">Story EMV</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{averageEngagementRate > 0 ? `${(averageEngagementRate * 100).toFixed(1)}%` : '3.4%'}</p>
                <p className="text-xs text-gray-500">Avg Eng Rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">$4.8M</p>
                <p className="text-xs text-gray-500">Posts EMV</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">$76.4K</p>
                <p className="text-xs text-gray-500">Reels EMV</p>
              </div>
            </div>
            
            {/* Campaign Engagements Repeat */}
            <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
              <p>Verified accounts: {verifiedCount} | Business accounts: {businessAccountsCount}</p>
            </div>
            
            {/* Third Row of Metrics */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalAverageLikes > 0 ? formatNumber(totalAverageLikes) : '201.8K'}</p>
                <p className="text-xs text-gray-500">Total Avg Likes</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">74.6K</p>
                <p className="text-xs text-gray-500">Story Engagements</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">466.7K</p>
                <p className="text-xs text-gray-500">Link Clicks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalSubscribers > 0 ? formatNumber(totalSubscribers) : '1.4M'}</p>
                <p className="text-xs text-gray-500">{totalSubscribers > 0 ? 'Total Subscribers' : 'Story Views'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total EMV - Bottom aligned */}
        <div className="text-center text-xs text-gray-500 pt-2 mt-3 border-t border-gray-200">
          <p>Total EMV: $4.9M</p>
        </div>
      </div>
    </div>
  );
};

export default ShortlistedAnalytics;