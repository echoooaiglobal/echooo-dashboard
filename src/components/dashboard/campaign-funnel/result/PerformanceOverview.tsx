// src/components/dashboard/campaign-funnel/result/PerformanceOverview.tsx
'use client';

import { AnalyticsData } from './types';

interface PerformanceOverviewProps {
  analyticsData: AnalyticsData;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ analyticsData }) => {
  const formatNumber = (num: number): string => {
    if( num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPercentageChange = (current: number, base: number = 1000): string => {
    if (base === 0) return '+0%';
    const change = ((current - base) / base) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Helper function to get posts with positive likes for exclusion logic
  const getValidPosts = () => {
    const allPosts = [
      // From topPosts array
      ...analyticsData.topPosts,
      // From postsByDate array (flattened)
      ...analyticsData.postsByDate.flatMap(dateGroup => 
        dateGroup.posts.map(post => ({
          ...post,
          followers: 0 // Will need to be populated from topPerformers or other source
        }))
      )
    ];

    // Filter posts with positive likes
    return allPosts.filter(post => post.likes > 0);
  };

  // Helper function to calculate adjusted followers (excluding followers from posts with 0 or negative likes)
  const calculateAdjustedFollowers = (): { adjusted: number; excluded: number } => {
    // Try to use pre-calculated adjusted value first
    if (analyticsData.adjustedTotalFollowers !== undefined && analyticsData.adjustedTotalFollowers > 0) {
      return {
        adjusted: analyticsData.adjustedTotalFollowers,
        excluded: analyticsData.totalFollowers - analyticsData.adjustedTotalFollowers
      };
    }

    // Calculate from individual posts and performers if available
    // Get all posts from topPosts and postsByDate
    const allPosts = [
      ...analyticsData.topPosts,
      ...analyticsData.postsByDate.flatMap(dateGroup => 
        dateGroup.posts.map(post => ({
          ...post,
          username: post.username
        }))
      )
    ];

    if (allPosts.length > 0 && analyticsData.topPerformers.length > 0) {
      // Find posts with positive likes
      const postsWithPositiveLikes = allPosts.filter(post => post.likes > 0);
      
      // Get unique usernames from posts with positive likes
      const validUsernames = new Set(postsWithPositiveLikes.map(post => post.username));
      
      // Sum followers only from performers who have posts with positive likes
      const adjustedFollowers = analyticsData.topPerformers
        .filter(performer => validUsernames.has(performer.username))
        .reduce((sum, performer) => sum + performer.followers, 0);

      console.log('🔍 Followers Calculation Debug:');
      console.log(`Total posts: ${allPosts.length}`);
      console.log(`Posts with positive likes: ${postsWithPositiveLikes.length}`);
      console.log(`Valid usernames: ${Array.from(validUsernames).join(', ')}`);
      console.log(`Original total followers: ${analyticsData.totalFollowers}`);
      console.log(`Adjusted followers (excluding 0 likes): ${adjustedFollowers}`);
      console.log(`Followers excluded: ${analyticsData.totalFollowers - adjustedFollowers}`);
      
      return {
        adjusted: adjustedFollowers > 0 ? adjustedFollowers : analyticsData.totalFollowers,
        excluded: analyticsData.totalFollowers - (adjustedFollowers > 0 ? adjustedFollowers : analyticsData.totalFollowers)
      };
    }

    // Final fallback: No exclusions possible
    console.log('⚠️ No individual post/performer data available for followers adjustment');
    return {
      adjusted: analyticsData.totalFollowers,
      excluded: 0
    };
  };

  // UPDATED: Helper function to calculate adjusted views for engagement rate calculations only
  // This excludes views from posts with 0 or negative likes, but Total Views still shows all views
  const calculateAdjustedViewsForEngagement = (): { adjusted: number; excluded: number } => {
    // Try to use pre-calculated adjusted value first
    if (analyticsData.adjustedTotalViews !== undefined && analyticsData.adjustedTotalViews > 0) {
      return {
        adjusted: analyticsData.adjustedTotalViews,
        excluded: analyticsData.totalViews - analyticsData.adjustedTotalViews
      };
    }

    // Calculate from individual posts focusing on video_play_count equivalents
    // Get all posts (including those with 0/negative likes for comparison)
    const allPosts = [
      ...analyticsData.topPosts,
      ...analyticsData.postsByDate.flatMap(dateGroup => 
        dateGroup.posts.map(post => ({
          ...post,
          username: post.username
        }))
      )
    ];

    if (allPosts.length > 0) {
      // Calculate total views from ALL posts (for exclusion calculation)
      const totalViewsFromPosts = allPosts.reduce((sum, post) => {
        const videoPlayCount = post.videoPlayCount || post.video_play_count || 0;
        const generalViews = post.views || 0;
        const finalViews = Math.max(videoPlayCount, generalViews);
        return sum + finalViews;
      }, 0);

      // Calculate adjusted views from posts with positive likes only
      const validPosts = allPosts.filter(post => post.likes > 0);
      const adjustedViews = validPosts.reduce((sum, post) => {
        const videoPlayCount = post.videoPlayCount || post.video_play_count || 0;
        const generalViews = post.views || 0;
        const finalViews = Math.max(videoPlayCount, generalViews);
        return sum + finalViews;
      }, 0);
      
      console.log('🔍 Views Calculation Debug (for engagement rate only):');
      console.log(`Total posts: ${allPosts.length}`);
      console.log(`Valid posts (likes > 0): ${validPosts.length}`);
      console.log(`Total views from all posts: ${totalViewsFromPosts}`);
      console.log(`Adjusted views (excluding 0 likes posts): ${adjustedViews}`);
      console.log(`Views excluded from engagement calculation: ${totalViewsFromPosts - adjustedViews}`);
      
      return {
        adjusted: adjustedViews > 0 ? adjustedViews : analyticsData.totalViews,
        excluded: totalViewsFromPosts - adjustedViews
      };
    }

    // Final fallback: No exclusions possible
    return {
      adjusted: analyticsData.totalViews,
      excluded: 0
    };
  };

  // UPDATED: Enhanced calculation for Avg Engagement Rate with direct exclusion logic
  const calculateAdjustedEngagementRate = (): number => {
    const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
    const { adjusted: adjustedFollowers } = calculateAdjustedFollowers();
    
    const engagementRate = adjustedFollowers > 0 ? (totalEngagement / adjustedFollowers) * 100 : 0;
    
    console.log('🔍 Engagement Rate Calculation:');
    console.log(`Total engagement: ${totalEngagement}`);
    console.log(`Adjusted followers: ${adjustedFollowers}`);
    console.log(`Calculated engagement rate: ${engagementRate.toFixed(2)}%`);
    
    return engagementRate;
  };

  // UPDATED: Enhanced calculation for Avg Engagement Rate (Views) using adjusted views for engagement calculation only
  const calculateEngagementRateByViews = (): number => {
    const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
    const { adjusted: adjustedViews } = calculateAdjustedViewsForEngagement();
    
    const engagementRateByViews = adjustedViews > 0 ? (totalEngagement / adjustedViews) * 100 : 0;
    
    console.log('🔍 Engagement Rate by Views Calculation (excludes views from 0-like posts):');
    console.log(`Total engagement: ${totalEngagement}`);
    console.log(`Adjusted views for engagement calculation: ${adjustedViews}`);
    console.log(`Total Views (displayed): ${analyticsData.totalViews} (includes all views)`);
    console.log(`Calculated engagement rate by views: ${engagementRateByViews.toFixed(2)}%`);
    
    return engagementRateByViews;
  };

  // NEW: Calculate sum of collaboration prices and related metrics
  const calculateCollaborationMetrics = () => {
    // Extract collaboration prices from the analyticsData structure
    let totalCollaborationPrice = 0;
    let postsWithCollaborationPrice = 0;

    // Check if we have totalCPV and totalCPE data that indicates collaboration prices exist
    if (analyticsData.totalCPV > 0 || analyticsData.totalCPE > 0) {
      // If we have CPV/CPE data, we can derive collaboration price info
      // This is a fallback calculation based on existing totals
      
      // Check topPosts for collaboration price data
      if (analyticsData.topPosts && analyticsData.topPosts.length > 0) {
        analyticsData.topPosts.forEach(post => {
          // Try to extract collaboration price from post data
          const collaborationPrice = (post as any).collaborationPrice || 0;
          if (collaborationPrice > 0) {
            totalCollaborationPrice += collaborationPrice;
            postsWithCollaborationPrice++;
          }
        });
      }

      // If we still don't have collaboration price data, try to derive from existing CPV/CPE
      if (totalCollaborationPrice === 0) {
        // This is a rough estimation - in reality, this data should come from the backend
        // For now, we'll use the existing totalCPV and totalCPE as indicators
        if (analyticsData.totalCPV > 0 && analyticsData.totalViews > 0) {
          totalCollaborationPrice = analyticsData.totalCPV * analyticsData.totalViews;
        } else if (analyticsData.totalCPE > 0) {
          const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
          totalCollaborationPrice = analyticsData.totalCPE * totalEngagement;
        }
      }
    }

    // Calculate new CPV and CPE based on sum of collaboration prices
    const newTotalCPV = analyticsData.totalViews > 0 ? totalCollaborationPrice / analyticsData.totalViews : 0;
    const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
    const newTotalCPE = totalEngagement > 0 ? totalCollaborationPrice / totalEngagement : 0;

    console.log('💰 Collaboration Metrics Calculation:');
    console.log(`Total collaboration price: $${totalCollaborationPrice.toFixed(2)}`);
    console.log(`Posts with collaboration price: ${postsWithCollaborationPrice}`);
    console.log(`New Total CPV: $${newTotalCPV.toFixed(4)}`);
    console.log(`New Total CPE: $${newTotalCPE.toFixed(4)}`);

    return {
      totalCollaborationPrice,
      postsWithCollaborationPrice,
      newTotalCPV,
      newTotalCPE
    };
  };

  const collaborationMetrics = calculateCollaborationMetrics();

  // Helper function to determine exclusion status
  const getExclusionStatus = () => {
    const followerData = calculateAdjustedFollowers();
    const viewsData = calculateAdjustedViewsForEngagement(); // UPDATED: Use engagement-specific views calculation
    
    const hasFollowerExclusions = followerData.excluded > 0;
    const hasViewsExclusions = viewsData.excluded > 0;
    const hasAnyExclusions = hasFollowerExclusions || hasViewsExclusions;
    
    return {
      hasExclusions: hasAnyExclusions,
      excludedFollowers: followerData.excluded,
      excludedViews: viewsData.excluded,
      adjustedFollowers: followerData.adjusted,
      adjustedViews: viewsData.adjusted,
      isUsingAdjustedFollowers: hasFollowerExclusions,
      isUsingAdjustedViews: hasViewsExclusions
    };
  };

  const exclusionStatus = getExclusionStatus();

  // First row - Basic Insights (4 cards)
  const basicInsightsData = [
    {
      title: "Followers", 
      value: formatNumber(analyticsData.totalFollowers),
      change: getPercentageChange(analyticsData.totalFollowers, 100000),
      changeType: "positive" as const,
      tooltip: `Total unique followers across all participating influencers. ${
        exclusionStatus.isUsingAdjustedFollowers 
          ? `Note: ${formatNumber(exclusionStatus.excludedFollowers)} followers are excluded from engagement rate calculations due to posts with 0 likes.`
          : 'Each influencer is counted once with their maximum follower count to avoid double counting.'
      }`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Total Likes",
      value: formatNumber(analyticsData.totalLikes),
      change: getPercentageChange(analyticsData.totalLikes, 50000),
      changeType: "positive" as const,
      tooltip: "Sum of all likes across all campaign posts. Data pulled directly from Instagram's API.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      )
    },
    {
      title: "Total Comments",
      value: formatNumber(analyticsData.totalComments),
      change: getPercentageChange(analyticsData.totalComments, 5000),
      changeType: "positive" as const,
      tooltip: "Sum of all comments across all campaign posts. Comments indicate higher engagement than likes.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      )
    },
    {
      title: "Total Views",
      value: formatNumber(analyticsData.totalViews),
      change: getPercentageChange(analyticsData.totalViews, 200000),
      changeType: analyticsData.totalViews > 200000 ? "positive" : "negative" as const,
      tooltip: `Sum of all video views across ALL posts in the Published Results table. Displays the complete total including posts with 0 or negative likes. Uses video_play_count from Instagram's API where available. Note: For engagement rate calculations, views from posts with 0 likes are excluded, but this total shows all views.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      )
    }
  ];

  // Second row - Reordered: Total Shares, Impressions, Reach, Avg Engagement Rate
  const secondRowData = [
    {
      title: "Total Shares",
      value: formatNumber(analyticsData.totalShares),
      change: getPercentageChange(analyticsData.totalShares),
      changeType: "positive" as const,
      tooltip: "Total shares across all campaign posts. This reflects the exact sum of shares shown in the Published Results table. Note: Instagram API doesn't provide share counts, so this includes manual entries and defaults to 0 for API-fetched posts.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </div>
      )
    },
    {
      title: "Impressions", 
      value: formatNumber(analyticsData.totalImpressions),
      change: getPercentageChange(analyticsData.totalImpressions, 500000),
      changeType: "positive" as const,
      tooltip: "Total number of times content was displayed. Calculated as: (Video Views × 1.3) + (Photo Posts × Avg Followers × 40% reach rate). Accounts for repeat views and organic reach. Based on total views from all posts including those with 0 likes.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H3a1 1 0 00-1 1v16a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM9 12l2 2 4-4"/>
          </svg>
        </div>
      )
    },
    {
      title: "Reach",
      value: formatNumber(analyticsData.totalReach), 
      change: getPercentageChange(analyticsData.totalReach, 300000),
      changeType: "positive" as const,
      tooltip: "Estimated unique users who saw your content. Calculated as 65% of total impressions, but capped at actual engagement levels. Always lower than impressions. Based on total views from all posts.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Avg Engagement Rate",
      value: `${calculateAdjustedEngagementRate().toFixed(2)}%`,
      change: calculateAdjustedEngagementRate() > 3 ? "+15.2%" : "-5.1%",
      changeType: calculateAdjustedEngagementRate() > 3 ? "positive" : "negative" as const,
      tooltip: `${exclusionStatus.isUsingAdjustedFollowers 
        ? `Enhanced calculation: (Total Likes + Comments + Shares) ÷ Adjusted Total Followers (${formatNumber(exclusionStatus.adjustedFollowers)}) × 100. Excludes ${formatNumber(exclusionStatus.excludedFollowers)} followers from influencers whose posts have 0 or negative likes.`
        : 'Standard calculation: (Total Likes + Comments + Shares) ÷ Total Followers × 100.'
      } Rates above 3% are considered good for Instagram.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
      )
    }
  ];

  // UPDATED: Third row with new CPV/CPE calculations based on sum of collaboration prices - Remove $ symbol
  const thirdRowData = [
    {
      title: "Total CPV",
      value: `${collaborationMetrics.newTotalCPV.toFixed(4)}`,
      change: "+12.3%",
      changeType: "positive" as const,
      tooltip: `Cost Per View calculated as: Sum of all Collaboration Prices (${collaborationMetrics.totalCollaborationPrice > 0 ? `${collaborationMetrics.totalCollaborationPrice.toFixed(2)}` : '0'}) ÷ Total Views (${formatNumber(analyticsData.totalViews)}). ${collaborationMetrics.postsWithCollaborationPrice > 0 ? `Based on ${collaborationMetrics.postsWithCollaborationPrice} posts with collaboration prices.` : 'No collaboration prices entered yet.'}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        </div>
      )
    },
    {
      title: "Total CPE",
      value: `${collaborationMetrics.newTotalCPE.toFixed(4)}`,
      change: "+8.7%",
      changeType: "positive" as const,
      tooltip: `Cost Per Engagement calculated as: Sum of all Collaboration Prices (${collaborationMetrics.totalCollaborationPrice > 0 ? `${collaborationMetrics.totalCollaborationPrice.toFixed(2)}` : '0'}) ÷ Total Engagement (${formatNumber(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares)}). ${collaborationMetrics.postsWithCollaborationPrice > 0 ? `Based on ${collaborationMetrics.postsWithCollaborationPrice} posts with collaboration prices.` : 'No collaboration prices entered yet.'}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Views to Followers Ratio",
      value: `${(analyticsData.viewsToFollowersRatio / 100).toFixed(1)}x`,
      change: analyticsData.viewsToFollowersRatio > 50 ? "+25.6%" : "-10.2%",
      changeType: analyticsData.viewsToFollowersRatio > 50 ? "positive" : "negative" as const,
      tooltip: "Ratio of total views to total followers (Views ÷ Followers). Shows how well content resonates beyond the immediate follower base. Values above 1.0x indicate content is reaching beyond the follower count, suggesting good reach potential. Now based on video_play_count for more accurate video performance measurement.",
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Avg Engagement Rate (Views)",
      value: `${calculateEngagementRateByViews().toFixed(2)}%`,
      change: calculateEngagementRateByViews() > 5 ? "+18.4%" : "-5.3%",
      changeType: calculateEngagementRateByViews() > 5 ? "positive" : "negative" as const,
      tooltip: `${exclusionStatus.isUsingAdjustedViews 
        ? `Enhanced calculation: (Total Likes + Comments + Shares) ÷ Adjusted Views for Engagement (${formatNumber(exclusionStatus.adjustedViews)}) × 100. Excludes ${formatNumber(exclusionStatus.excludedViews)} views from posts with 0 or negative likes. Note: Total Views above shows ALL views including excluded ones.`
        : 'Standard calculation: (Total Likes + Comments + Shares) ÷ Total Views × 100. Uses all views since no posts have 0 likes.'
      } Shows engagement quality relative to view count from engaging posts only.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
      )
    }
  ];

  const renderCard = (item: any, index: number, rowOffset: number = 0) => (
    <div 
      key={index} 
      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform"
      style={{
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        animationDelay: `${(index + rowOffset) * 100}ms`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-700">{item.title}</h3>
        <div className="relative group">
          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="relative">
              {item.tooltip}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Icon */}
      <div className="flex items-center justify-center mb-3">
        {item.icon}
      </div>

      <div className="text-center">
        <span className="text-3xl font-bold text-gray-900 block mb-1">{item.value}</span>
      </div>
    </div>
  );

  return (
    <div>
      {/* UPDATED: Removed the "Excluding posts with 0 likes" text and visual indicator */}
      <div className="flex items-center space-x-2 mb-6 no-print">
        <h2 className="text-xl font-bold text-gray-800">Performance Overview</h2>
      </div>

      {/* First Row - Basic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {basicInsightsData.map((item, index) => renderCard(item, index, 0))}
      </div>

      {/* Second Row - Reordered: Total Shares, Impressions, Reach, Avg Engagement Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {secondRowData.map((item, index) => renderCard(item, index, 4))}
      </div>

      {/* Third Row - Updated with new CPV/CPE calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {thirdRowData.map((item, index) => renderCard(item, index, 8))}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceOverview;