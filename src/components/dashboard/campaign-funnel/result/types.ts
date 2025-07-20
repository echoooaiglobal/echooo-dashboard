// src/components/dashboard/campaign-funnel/result/types.ts

export interface AnalyticsData {
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  totalFollowers: number;
  totalPosts: number;
  totalInfluencers: number;
  averageEngagementRate: number;
  // New metrics
  totalCPV: number;
  totalCPE: number;
  viewsToFollowersRatio: number;
  commentToViewsRatio: number;
  postsByDate: Array<{
    date: string;
    count: number;
    views: number;
    cumulativeViews: number;
    posts: Array<{
      influencerName: string;
      username: string;
      avatar: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }>;
  }>;
  topPerformers: Array<{
    name: string;
    username: string;
    avatar: string;
    clicks: number;
    isVerified: boolean;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalShares: number;
    avgEngagementRate: number;
    totalEngagement: number;
    followers: number;
  }>;
  topPosts: Array<{
    id: string;
    influencerName: string;
    username: string;
    avatar: string;
    thumbnail: string;
    likes: number;
    comments: number;
    views: number;
    plays: number;
    shares: number;
    engagementRate: number;
    isVerified: boolean;
    postId: string;
    totalEngagement: number;
    postDate: string;
  }>;
}