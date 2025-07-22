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
  // UPDATED: Modified CPV/CPE metrics to use collaboration price calculations
  totalCPV: number;          // Now: Sum of all collaboration prices ÷ Total Views
  totalCPE: number;          // Now: Sum of all collaboration prices ÷ Total Engagement
  viewsToFollowersRatio: number;
  commentToViewsRatio: number;
  
  // ADDED: Optional adjusted values for exclusion logic (excluding posts with 0 likes)
  adjustedTotalFollowers?: number;  // Followers excluding those from posts with 0 likes
  adjustedTotalViews?: number;      // Views excluding those from posts with 0 likes
  
  // ADDED: Collaboration price tracking
  totalCollaborationPrice?: number; // Sum of all collaboration prices from posts
  postsWithCollaborationPrice?: number; // Number of posts that have collaboration prices
  
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
    totalVideoPlayCount?: number; // ADDED: For consistency with PublishedResults
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
    videoPlayCount?: number; // ADDED: For video_play_count consistency
    plays: number;
    shares: number;
    engagementRate: number;
    isVerified: boolean;
    postId: string;
    totalEngagement: number;
    postDate: string;
    collaborationPrice?: number; // ADDED: Individual post collaboration price
  }>;
}