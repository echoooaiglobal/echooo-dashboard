// src/components/dashboard/profile-analytics/sections/ContentSection.tsx
'use client';

import { 
  Star,
  Calendar,
  Heart, 
  MessageCircle, 
  Share,
  Play,
  Camera,
  Hash,
  AtSign,
  DollarSign,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { Profile } from '@/types/insightiq/profile-analytics';
import { BaseSectionProps, validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface ContentSectionProps extends BaseSectionProps {}

const ContentSection: React.FC<ContentSectionProps> = ({
  profile,
  formatNumber
}) => {
  // Validate props
  const validation = validateSectionProps(profile);
  if (!validation.isValid) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">{validation.error}</p>
        </div>
      </div>
    );
  }

  // Safe access to profile data with fallbacks
  const topContents = safeProfileAccess(profile, p => p.top_contents, []);
  const recentContents = safeProfileAccess(profile, p => p.recent_contents, []);
  const sponsoredContents = safeProfileAccess(profile, p => p.sponsored_contents, []);
  const topHashtags = safeProfileAccess(profile, p => p.top_hashtags, []);
  const topMentions = safeProfileAccess(profile, p => p.top_mentions, []);
  const reputationHistory = safeProfileAccess(profile, p => p.reputation_history, []);

  // Prepare likes bar data
  const prepareLikesBarData = () => {
    const historyData = reputationHistory.slice(-6);
    return historyData.map(month => ({
      month: month.month,
      likes: month.average_likes
    }));
  };

  const likesBarData = prepareLikesBarData();

  // Helper function to handle content click
  const handleContentClick = (content: any) => {
    if (content.url) {
      window.open(content.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Helper function to get content type styling
  const getContentTypeStyle = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'REELS':
        return 'bg-purple-100 text-purple-700';
      case 'VIDEO':
        return 'bg-blue-100 text-blue-700';
      case 'STORY':
        return 'bg-pink-100 text-pink-700';
      case 'IGTV':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'REELS':
      case 'VIDEO':
      case 'IGTV':
        return <Play className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Content - Updated to 6 items per row */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Top Performing Content
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {topContents.slice(0, 12).map((content, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleContentClick(content)}
            >
              <div className="relative">
                {content.thumbnail_url ? (
                  <img
                    src={content.thumbnail_url}
                    alt="Content thumbnail"
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    {getContentTypeIcon(content.type)}
                  </div>
                )}
                {content.url && (
                  <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeStyle(content.type)}`}>
                    {content.type || 'POST'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {content.published_at ? new Date(content.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-800 mb-2 line-clamp-2">
                  {content.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{formatNumber(content.engagement?.like_count || 0)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
                  </span>
                  {content.engagement?.share_count && (
                    <span className="flex items-center space-x-1">
                      <Share className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.share_count)}</span>
                    </span>
                  )}
                  {content.engagement?.play_count && (
                    <span className="flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.play_count)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Content - Updated to 6 items per row */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Content
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {recentContents.slice(0, 18).map((content, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleContentClick(content)}
            >
              <div className="relative">
                {content.thumbnail_url ? (
                  <img
                    src={content.thumbnail_url}
                    alt="Recent content thumbnail"
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                    {getContentTypeIcon(content.type)}
                  </div>
                )}
                {content.url && (
                  <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute top-1 left-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeStyle(content.type)}`}>
                    {content.type || 'POST'}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {content.published_at ? new Date(content.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">Recent</span>
                </div>
                <p className="text-xs text-gray-800 mb-2 line-clamp-2">
                  {content.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{formatNumber(content.engagement?.like_count || 0)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
                  </span>
                  {content.engagement?.share_count && (
                    <span className="flex items-center space-x-1">
                      <Share className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.share_count)}</span>
                    </span>
                  )}
                  {content.engagement?.play_count && (
                    <span className="flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>{formatNumber(content.engagement.play_count)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags, Mentions & Average Likes - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hashtags */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Top Hashtags
          </h3>
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
            {topHashtags.slice(0, 20).map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors cursor-default"
                title={`Used ${hashtag.value || 0}% of the time`}
              >
                #{hashtag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Top Mentions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AtSign className="w-5 h-5 mr-2" />
            Top Mentions
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {topMentions.slice(0, 15).map((mention, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-800 font-medium text-sm">@{mention.name}</span>
                <span className="text-purple-600 font-bold text-sm">{(mention.value || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Likes per Post Chart - Compact Version */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Average Likes
            </h3>
            <p className="text-gray-600 text-sm mt-1">Monthly performance</p>
          </div>
          <div className="p-4">
            <div style={{ height: '280px' }}>
              <ResponsiveBar
                data={likesBarData}
                keys={['likes']}
                indexBy="month"
                margin={{ top: 10, right: 15, bottom: 50, left: 50 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#EC4899']}
                borderRadius={6}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: -45,
                  format: value => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  tickRotation: 0,
                  format: value => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }
                }}
                enableGridY={true}
                gridYValues={4}
                animate={true}
                motionConfig="gentle"
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 11,
                        fontWeight: 500,
                        fill: '#6B7280'
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: '#F3F4F6',
                      strokeWidth: 1
                    }
                  }
                }}
                tooltip={({ id, value, indexValue }) => (
                  <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-200">
                    <div className="text-xs font-medium text-gray-600">{indexValue}</div>
                    <div className="text-sm font-bold text-pink-600">{formatNumber(value)} likes</div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sponsored Content History - Updated to 6 items per row */}
      {sponsoredContents.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Sponsored Content History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {sponsoredContents.map((content, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleContentClick(content)}
              >
                <div className="relative">
                  {content.thumbnail_url ? (
                    <img
                      src={content.thumbnail_url}
                      alt="Sponsored content"
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                      {getContentTypeIcon(content.type)}
                    </div>
                  )}
                  {content.url && (
                    <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                      Sponsored
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeStyle(content.type)}`}>
                      {content.type || 'POST'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {content.published_at ? new Date(content.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 mb-2 line-clamp-2">
                    {content.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{content.engagement?.like_count ? formatNumber(content.engagement.like_count) : 'N/A'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
                    </span>
                    {content.engagement?.share_count && (
                      <span className="flex items-center space-x-1">
                        <Share className="w-3 h-3" />
                        <span>{formatNumber(content.engagement.share_count)}</span>
                      </span>
                    )}
                    {content.engagement?.play_count && (
                      <span className="flex items-center space-x-1">
                        <Play className="w-3 h-3" />
                        <span>{formatNumber(content.engagement.play_count)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSection;