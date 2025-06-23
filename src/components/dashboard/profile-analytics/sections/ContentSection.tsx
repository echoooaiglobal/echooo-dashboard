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
  DollarSign
} from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Top Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Top Performing Content
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {topContents.slice(0, 6).map((content, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {content.thumbnail_url && (
                <img
                  src={content.thumbnail_url}
                  alt="Content thumbnail"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    content.type === 'REELS' ? 'bg-purple-100 text-purple-700' :
                    content.type === 'VIDEO' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {content.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(content.published_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-3 line-clamp-3">{content.description}</p>
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

      {/* Recent Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Content
        </h3>
        <div className="space-y-4">
          {recentContents.slice(0, 8).map((content, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  content.type === 'REELS' ? 'bg-purple-100' :
                  content.type === 'VIDEO' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {content.type === 'REELS' || content.type === 'VIDEO' ? 
                    <Play className="w-5 h-5" /> : 
                    <Camera className="w-5 h-5" />
                  }
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 line-clamp-2">{content.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(content.published_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(content.engagement?.like_count || 0)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags & Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Top Hashtags
          </h3>
          <div className="flex flex-wrap gap-2">
            {topHashtags.slice(0, 15).map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                title={`Used ${hashtag.value || 0}% of the time`}
              >
                #{hashtag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AtSign className="w-5 h-5 mr-2" />
            Top Mentions
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {topMentions.slice(0, 12).map((mention, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-800">@{mention.name}</span>
                <span className="text-purple-600 font-medium">{(mention.value || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsored Content */}
      {sponsoredContents.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Sponsored Content History
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sponsoredContents.map((content, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {content.thumbnail_url && (
                  <img
                    src={content.thumbnail_url}
                    alt="Sponsored content"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Sponsored
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(content.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-3 line-clamp-3">{content.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{content.engagement?.like_count ? formatNumber(content.engagement.like_count) : 'N/A'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
                    </span>
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