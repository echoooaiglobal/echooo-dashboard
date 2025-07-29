// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredResults.tsx
import React, { useState, useEffect } from 'react';
import { DiscoverInfluencer } from '@/lib/types';
import { Campaign } from '@/types/campaign';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { DiscoveredCreatorsResults, Influencer } from '@/types/insights-iq';
import { SortField, SortOrder } from '@/lib/creator-discovery-types';
import ProfileInsightsModal from './ProfileInsightsModal';
import { formatNumber } from '@/utils/format';
import { Platform } from '@/types/platform';

interface DiscoverResultsProps {
  selectedPlatform?: Platform | null;
  influencers: DiscoverInfluencer[];
  discoveredCreatorsResults: DiscoveredCreatorsResults | null;
  isLoading: boolean;
  totalResults: number;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onLoadMore: () => void;
  hasMore: boolean;
  nextBatchSize: number;
  campaignData?: Campaign | null;
  onInfluencerAdded?: () => void;
  shortlistedMembers: CampaignListMember[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
  onAddToList: (influencer: Influencer) => Promise<void>;
  addedInfluencers: Record<string, boolean>;
  isAdding: Record<string, boolean>;
  setAddedInfluencers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onFetchInfluencerPosts?: (influencer: Influencer) => Promise<any[]>;
}

// Define all available columns with their properties
interface ColumnDefinition {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
  getValue: (influencer: Influencer) => string | number | null;
  render?: (value: any, influencer: Influencer) => React.ReactNode;
}

const DiscoverResults: React.FC<DiscoverResultsProps> = ({
  selectedPlatform,
  influencers,
  discoveredCreatorsResults,
  isLoading,
  totalResults,
  sortField,
  sortDirection,
  onSortChange,
  onLoadMore,
  hasMore,
  nextBatchSize,
  campaignData,
  onInfluencerAdded,
  shortlistedMembers,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  pageSize = 20,
  onAddToList,
  addedInfluencers,
  isAdding,
  setAddedInfluencers,
  onFetchInfluencerPosts
}) => {
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  // Get metadata with defaults
  const metadata = discoveredCreatorsResults?.metadata || {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    total_results: totalResults
  };

  // Calculate pagination info
  const actualPageSize = pageSize || metadata.limit;
  const calculatedCurrentPage = currentPage;
  const totalPages = Math.ceil(metadata.total_results / actualPageSize);
  const hasNextPage = calculatedCurrentPage < totalPages;
  const hasPreviousPage = calculatedCurrentPage > 1;
  const startItem = ((calculatedCurrentPage - 1) * actualPageSize) + 1;
  const endItem = Math.min(calculatedCurrentPage * actualPageSize, metadata.total_results);

  // Page size options
  const pageSizeOptions = [
    10, 
    20,
    25, 
    50, 
    100, 
    { label: 'Show All', value: metadata.total_results || 999999 }
  ];

  // Helper function to format location
  const formatLocation = (influencer: Influencer) => {
    if (!influencer.creator_location) return 'N/A';
    
    const { city, state, country } = influencer.creator_location;
    const parts = [city, state, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Helper function to format gender
  const formatGender = (gender?: string | null) => {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Helper function to format platform account type
  const formatAccountType = (type?: string | null) => {
    if (!type || type === 'ANY') return 'N/A';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Helper function to format age group
  const formatAgeGroup = (ageGroup?: string | null) => {
    if (!ageGroup) return 'N/A';
    return ageGroup.replace('_', ' ').toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format creator age - Updated to handle the actual data structure
  const formatCreatorAge = (influencer: Influencer) => {
    // First check direct creator_age field
    if (influencer.creator_age) {
      if (typeof influencer.creator_age === 'string') return influencer.creator_age;
      return `${influencer.creator_age} years`;
    }
    
    // Check filter_match for creator_age with min/max
    if (influencer.filter_match?.creator_age) {
      const ageData = influencer.filter_match.creator_age as any;
      if (typeof ageData === 'object' && ageData && 'min' in ageData && 'max' in ageData) {
        return `${ageData.min}-${ageData.max}`;
      }
    }
    
    // Fallback to age_group if available
    if (influencer.age_group) {
      return influencer.age_group.replace('_', '-');
    }
    
    return 'N/A';
  };

  // Helper function to format audience locations with percentages - Updated for actual data
  const formatAudienceLocations = (influencer: Influencer) => {
    // Check direct audience_locations field first
    let audienceLocations = influencer.audience_locations;
    
    // Fallback to filter_match if not available
    if (!audienceLocations && influencer.filter_match?.audience_locations) {
      audienceLocations = influencer.filter_match.audience_locations;
    }
    
    // Fallback to audience_demographics
    if (!audienceLocations && influencer.audience_demographics?.location_distribution) {
      audienceLocations = influencer.audience_demographics.location_distribution;
    }
    
    if (!audienceLocations || !Array.isArray(audienceLocations) || audienceLocations.length === 0) {
      return 'N/A';
    }
    
    // Handle different possible data structures
    const formattedLocations = audienceLocations
      .slice(0, 3) // Show top 3 locations
      .map((location: any) => {
        const locationName = location.name || location.country || 'Unknown';
        const percentage = location.percentage_value;
        
        if (percentage !== null && percentage !== undefined) {
          return `${locationName} (${Math.round(percentage)}%)`;
        } else {
          return locationName;
        }
      })
      .filter(Boolean);
      
    return formattedLocations.length > 0 ? formattedLocations.join(', ') : 'N/A';
  };

  // Helper function to format audience age groups - Updated for actual data structure
  const formatAudienceAgeGroups = (influencer: Influencer) => {
    // Check direct audience_age_groups field first
    let ageGroups = influencer.audience_age_groups;
    
    // Fallback to filter_match
    if (!ageGroups && influencer.filter_match?.audience_age) {
      ageGroups = influencer.filter_match.audience_age;
    }
    
    // Fallback to audience_demographics
    if (!ageGroups && influencer.audience_demographics?.age_distribution) {
      ageGroups = influencer.audience_demographics.age_distribution;
    }
    
    if (!ageGroups) {
      return 'N/A';
    }
    
    // Handle object with min/max structure (cast to any to avoid strict typing issues)
    const ageData = ageGroups as any;
    if (typeof ageData === 'object' && !Array.isArray(ageData) && 'min' in ageData && 'max' in ageData) {
      const percentage = ageData.percentage_value;
      const ageRange = `${ageData.min}-${ageData.max}`;
      
      if (percentage !== null && percentage !== undefined) {
        return `${ageRange} (${Math.round(percentage)}%)`;
      } else {
        return ageRange;
      }
    }
    
    // Handle array format
    if (Array.isArray(ageGroups)) {
      return ageGroups
        .slice(0, 2)
        .map((ageGroup: any) => {
          if (ageGroup && typeof ageGroup === 'object' && 'min' in ageGroup && 'max' in ageGroup) {
            const percentage = ageGroup.percentage_value;
            const ageRange = `${ageGroup.min}-${ageGroup.max}`;
            return percentage ? `${ageRange} (${Math.round(percentage)}%)` : ageRange;
          }
          return String(ageGroup);
        })
        .filter(Boolean)
        .join(', ');
    }
    
    return 'N/A';
  };

  // NEW: Helper function to format gender distribution
  const formatGenderDistribution = (influencer: Influencer) => {
    // Check filter_match first
    let genderData = influencer.filter_match?.audience_gender;
    
    // Fallback to audience_demographics
    if (!genderData && influencer.audience_demographics?.gender_distribution) {
      genderData = influencer.audience_demographics.gender_distribution;
    }
    
    if (!genderData || !Array.isArray(genderData) || genderData.length === 0) {
      return 'N/A';
    }
    
    // Format gender distribution data
    const formattedGenders = genderData
      .slice(0, 2) // Show top 2 gender distributions
      .map((gender: any) => {
        const type = gender.type || 'Unknown';
        const percentage = gender.percentage_value;
        
        if (percentage !== null && percentage !== undefined) {
          return `${type}: ${Math.round(percentage)}%`;
        } else {
          return type;
        }
      })
      .filter(Boolean);
      
    return formattedGenders.length > 0 ? formattedGenders.join(', ') : 'N/A';
  };

  // Helper function to get reel views from influencer data
  const getReelViews = (influencer: Influencer) => {
    // Check multiple possible locations for reel views data
    if (influencer.instagram_options?.reel_views) {
      // If it's a range object with min/max
      if (typeof influencer.instagram_options.reel_views === 'object' && 
          influencer.instagram_options.reel_views.min !== undefined) {
        const avg = (influencer.instagram_options.reel_views.min + influencer.instagram_options.reel_views.max) / 2;
        return avg;
      }
      // If it's a direct number
      if (typeof influencer.instagram_options.reel_views === 'number') {
        return influencer.instagram_options.reel_views;
      }
    }
    
    // Check if it's stored in filter_match
    if (influencer.filter_match?.instagram_options?.reel_views) {
      const reelViews = influencer.filter_match.instagram_options.reel_views;
      if (typeof reelViews === 'number') {
        return reelViews;
      }
    }
    
    // Check for any field that might contain reel views
    if (influencer.average_reel_views) {
      return influencer.average_reel_views;
    }
    
    // Check if it's a direct field
    if (influencer.reel_views) {
      return influencer.reel_views;
    }
    
    // Check additional_metrics if it exists
    if (influencer.additional_metrics?.average_reel_views) {
      return influencer.additional_metrics.average_reel_views;
    }
    
    if (influencer.additional_metrics?.reel_views) {
      return influencer.additional_metrics.reel_views;
    }
    
    return null;
  };

  // Helper function to truncate name
  const truncateName = (name: string, maxLength: number = 15): string => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Define all available columns with enhanced data access
  const allColumns: ColumnDefinition[] = [
    {
      key: 'name',
      label: 'Name',
      width: 'w-32',
      defaultVisible: true,
      getValue: (influencer) => influencer.name || influencer.username || '',
      render: (value, influencer) => (
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <img
              className="rounded-full object-cover h-12 w-12 border-2 border-gray-200 shadow-sm"
              src={influencer.profileImage || '/user/profile-placeholder.png'}
              alt={influencer.username}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
              }}
            />
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
              <span 
                className="truncate cursor-pointer hover:text-purple-600 transition-colors"
                title={influencer.name || influencer.username}
                onClick={() => handleInfluencerClick(influencer)}
              >
                {truncateName(influencer.name || influencer.username, 20)}
              </span>
              {influencer.isVerified && (
                <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"/>
                  </svg>
                </span>
              )}
            </div>
            <div 
              className="text-xs text-gray-500 flex items-center gap-2 mt-1"
              onClick={() => handleInfluencerClick(influencer)}
            >
              <span className="truncate cursor-pointer hover:text-gray-700 transition-colors">
                @{truncateName(influencer.username, 20)}
              </span>
              {influencer.work_platform?.logo_url && (
                <img
                  src={influencer.work_platform.logo_url}
                  alt={influencer.work_platform.name}
                  className="w-4 h-4 rounded flex-shrink-0"
                  title={influencer.work_platform.name}
                />
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'followers',
      label: 'Followers',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => influencer.followers || 0,
      render: (value) => typeof value === 'number' ? value.toLocaleString() : (value || 'N/A')
    },
    {
      key: 'engagementRate',
      label: 'Eng Rate',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => influencer.engagementRate,
      render: (value) => {
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return 'N/A';
      }
    },
    {
      key: 'average_likes',
      label: 'Avg Likes',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => influencer.average_likes,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'reel_views',
      label: 'Reel Views',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => getReelViews(influencer),
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'location',
      label: 'Location',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => formatLocation(influencer),
      render: (value) => (
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'gender',
      label: 'Gender',
      width: 'w-16',
      defaultVisible: true,
      getValue: (influencer) => influencer.gender,
      render: (value) => {
        if (!value) return 'N/A';
        const displayValue = formatGender(value);
        const colorClass = value?.toLowerCase() === 'female' ? 'bg-pink-100 text-pink-800' : 
                          value?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800';
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
            {displayValue}
          </span>
        );
      }
    },
    {
      key: 'language',
      label: 'Language',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => influencer.language,
      render: (value) => value ? String(value).toUpperCase() : 'N/A'
    },
    {
      key: 'age_group',
      label: 'Age Group',
      width: 'w-20',
      defaultVisible: true,
      getValue: (influencer) => influencer.age_group,
      render: (value) => formatAgeGroup(value)
    },
    {
      key: 'platform_account_type',
      label: 'Account Type',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => influencer.platform_account_type,
      render: (value) => {
        if (!value) return 'N/A';
        const displayValue = formatAccountType(value);
        const colorClass = value === 'BUSINESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
            {displayValue}
          </span>
        );
      }
    },
    // Additional columns (hidden by default)
    {
      key: 'creator_age',
      label: 'Creator Age',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => formatCreatorAge(influencer),
      render: (value) => value
    },
    {
      key: 'audience_locations',
      label: 'Audience Locations',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => formatAudienceLocations(influencer),
      render: (value) => (
        <span className="text-xs" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'audience_age_groups',
      label: 'Audience Age',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => formatAudienceAgeGroups(influencer),
      render: (value) => (
        <span className="text-xs" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'gender_distribution',
      label: 'Gender Distribution',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => formatGenderDistribution(influencer),
      render: (value) => (
        <span className="text-xs" title={value}>
          {value}
        </span>
      )
    },
    {
      key: 'average_views',
      label: 'Avg Views',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => influencer.average_views,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'content_count',
      label: 'Content Count',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => influencer.content_count,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'subscriber_count',
      label: 'Subscribers',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => influencer.subscriber_count,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    }
  ];

  // Initialize visible columns based on default visibility
  useEffect(() => {
    if (discoveredCreatorsResults?.influencers && discoveredCreatorsResults.influencers.length > 0) {
      const defaultVisible = new Set<string>();
      
      allColumns.forEach(column => {
        if (column.defaultVisible) {
          defaultVisible.add(column.key);
        }
      });
      
      setVisibleColumns(defaultVisible);
    }
  }, [discoveredCreatorsResults]);

  // Get visible columns in order
  const visibleColumnsData = allColumns.filter(column => visibleColumns.has(column.key));

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    
    if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    setSortConfig({ key: columnKey, direction });
    
    // Map to API sort field if needed
    const apiField = mapSortFieldToAPI(columnKey);
    onSortChange(apiField, direction);
  };

  // Get sort icon for column headers
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0.5">
          <svg className="w-3 h-3 text-gray-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-400 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3.5 h-3.5 text-purple-600 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-300 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3 h-3 text-gray-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3.5 h-3.5 text-purple-600 -mt-0.5 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Check if an influencer is already in the shortlisted members
  const isInfluencerInShortlist = (influencer: Influencer) => {
    return shortlistedMembers.some(member => 
      member.social_account?.platform_account_id === influencer.id
    );
  };

  // Update addedInfluencers state based on shortlistedMembers when they change
  useEffect(() => {
    const newAddedInfluencers: Record<string, boolean> = {};
    
    discoveredCreatorsResults?.influencers?.forEach(influencer => {
      if (influencer.username && isInfluencerInShortlist(influencer)) {
        newAddedInfluencers[influencer.username] = true;
      }
    });
    
    setAddedInfluencers(prev => ({
      ...prev,
      ...newAddedInfluencers
    }));
  }, [shortlistedMembers, discoveredCreatorsResults, setAddedInfluencers]);

  // Debug: Log first influencer data to console
  useEffect(() => {
    if (discoveredCreatorsResults?.influencers && discoveredCreatorsResults.influencers.length > 0) {
      const firstInfluencer = discoveredCreatorsResults.influencers[0];
      console.log('🔍 Complete first influencer data:', firstInfluencer);
      console.log('🎯 Demographic data check:', {
        creator_age_direct: firstInfluencer.creator_age,
        creator_age_from_filter: firstInfluencer.filter_match?.creator_age,
        creator_location: firstInfluencer.creator_location,
        audience_locations_direct: firstInfluencer.audience_locations,
        audience_locations_from_filter: firstInfluencer.filter_match?.audience_locations,
        audience_age_groups_direct: firstInfluencer.audience_age_groups,
        audience_age_from_filter: firstInfluencer.filter_match?.audience_age,
        gender_distribution_from_filter: firstInfluencer.filter_match?.audience_gender,
        demographic_data: firstInfluencer.audience_demographics
      });
      
      // Test the helper functions
      console.log('🧪 Helper function outputs:', {
        formatCreatorAge: formatCreatorAge(firstInfluencer),
        formatAudienceLocations: formatAudienceLocations(firstInfluencer),
        formatAudienceAgeGroups: formatAudienceAgeGroups(firstInfluencer),
        formatGenderDistribution: formatGenderDistribution(firstInfluencer)
      });
    }
  }, [discoveredCreatorsResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (showPageSizeDropdown && !target.closest('.page-size-dropdown')) {
        setShowPageSizeDropdown(false);
      }
      
      if (showColumnDropdown && !target.closest('.column-dropdown')) {
        setShowColumnDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown, showColumnDropdown]);

  // Map UI sort fields to API sort fields
  const mapSortFieldToAPI = (field: string): string => {
    const fieldMapping: Record<string, string> = {
      'name': 'DESCRIPTION',
      'followers': 'FOLLOWER_COUNT',
      'engagementRate': 'ENGAGEMENT_RATE',
      'average_likes': 'AVERAGE_LIKES',
      'average_views': 'AVERAGE_VIEWS',
      'content_count': 'CONTENT_COUNT',
      'reel_views': 'REELS_VIEWS',
      'reels_views': 'REELS_VIEWS'
    };
    return fieldMapping[field] || field.toUpperCase();
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== mapSortFieldToAPI(field)) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Handle opening influencer profile in new tab
  const handleInfluencerClick = (influencer: Influencer) => {
    if (influencer.url) {
      window.open(influencer.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle opening profile insights modal
  const handleProfileInsights = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInfluencer(null);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setShowPageSizeDropdown(false);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (calculatedCurrentPage <= 3) {
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (calculatedCurrentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(calculatedCurrentPage - 1, calculatedCurrentPage, calculatedCurrentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  if (isLoading && (!discoveredCreatorsResults?.influencers || discoveredCreatorsResults.influencers.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && (!discoveredCreatorsResults?.influencers || discoveredCreatorsResults.influencers.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12 text-gray-500">
          Try adjusting your filters.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-12/12 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-hidden">
          <div className={`w-full ${isLoading ? 'opacity-50' : ''}`}>
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                  <p className="text-sm text-gray-600">Loading new results...</p>
                </div>
              </div>
            )}
            
            <div className="max-h-[735px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {visibleColumnsData.map((column) => (
                      <th 
                        key={column.key} 
                        scope="col" 
                        className={`px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${column.width} cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none`}
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="group-hover:text-purple-700 transition-colors duration-200">
                            {column.key === 'name' ? `${column.label} (${metadata.total_results})` : column.label}
                          </span>
                          <div className="transform group-hover:scale-110 transition-transform duration-200">
                            {getSortIcon(column.key)}
                          </div>
                        </div>
                      </th>
                    ))}
                    
                    {/* Insights Column with Column Toggle */}
                    <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 relative">
                      <div className="flex items-center justify-center space-x-2">
                        <span>Insights</span>
                        <div className="column-dropdown">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowColumnDropdown(!showColumnDropdown);
                            }}
                            className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Toggle Columns"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          
                          {/* Column Toggle Dropdown - Same design as ShortlistedTable */}
                          {showColumnDropdown && (
                            <>
                              {/* Backdrop for visual separation */}
                              <div className="fixed inset-0 z-40" onClick={() => setShowColumnDropdown(false)}></div>
                              
                              {/* Dropdown positioned independently */}
                              <div className="fixed right-4 top-20 w-56 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 max-h-[28rem] overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                                    </svg>
                                    Column Visibility
                                  </h3>
                                  <p className="text-xs text-gray-600 mt-1">Select columns to display</p>
                                </div>
                                
                                {/* Column List */}
                                <div className="py-3 max-h-80 overflow-y-auto">
                                  {allColumns.map((column, index) => {
                                    // Check if any influencer has data for this column
                                    const hasData = discoveredCreatorsResults?.influencers?.some(influencer => {
                                      const value = column.getValue(influencer);
                                      return value !== null && value !== undefined && value !== '' && value !== 'N/A';
                                    }) || false;
                                    
                                    return (
                                      <label
                                        key={column.key}
                                        className="flex items-center px-5 py-3 hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 cursor-pointer transition-all duration-150 group"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={visibleColumns.has(column.key)}
                                          onChange={() => toggleColumnVisibility(column.key)}
                                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                          <span className={`text-sm font-medium block truncate transition-colors ${
                                            hasData 
                                              ? 'text-gray-900 group-hover:text-purple-700' 
                                              : 'text-gray-400 group-hover:text-gray-500'
                                          }`}>
                                            {column.label}
                                          </span>
                                        </div>
                                        {/* Data availability indicator */}
                                        <div className="ml-2 flex-shrink-0">
                                          {hasData ? (
                                            <div className="w-2 h-2 bg-green-400 rounded-full" title="Data available"></div>
                                          ) : (
                                            <div className="w-2 h-2 bg-gray-300 rounded-full" title="No data"></div>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}
                                  {/* Extra spacing at bottom of column list */}
                                  <div className="h-2"></div>
                                </div>
                                
                                {/* Footer */}
                                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                  <button
                                    onClick={() => {
                                      // Select all columns with data
                                      const columnsWithData = new Set<string>();
                                      allColumns.forEach(column => {
                                        const hasData = discoveredCreatorsResults?.influencers?.some(influencer => {
                                          const value = column.getValue(influencer);
                                          return value !== null && value !== undefined && value !== '' && value !== 'N/A';
                                        }) || false;
                                        if (hasData || column.defaultVisible) {
                                          columnsWithData.add(column.key);
                                        }
                                      });
                                      setVisibleColumns(columnsWithData);
                                    }}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                  >
                                    Select All
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Keep only default visible columns
                                      const defaultColumns = new Set<string>();
                                      allColumns.forEach(column => {
                                        if (column.defaultVisible) {
                                          defaultColumns.add(column.key);
                                        }
                                      });
                                      setVisibleColumns(defaultColumns);
                                    }}
                                    className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
                                  >
                                    Reset
                                  </button>
                                </div>
                                
                                {/* Bottom spacing for visual separation */}
                                <div className="h-3 bg-gray-50"></div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                    
                    {/* Add to List Column */}
                    <th
                      scope="col"
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                    >
                      <span className="truncate">Add to List</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discoveredCreatorsResults?.influencers?.map((influencer, key) => {
                    const isAlreadyAdded = isInfluencerInShortlist(influencer) || addedInfluencers[influencer.username];
                   
                    return (
                      <tr key={influencer.username || key} className="hover:bg-gray-50">
                        {visibleColumnsData.map((column) => (
                          <td key={column.key} className={`px-2 py-4 whitespace-nowrap text-sm text-gray-500 ${column.width}`}>
                            <span className="truncate block">
                              {column.render ? column.render(column.getValue(influencer), influencer) : column.getValue(influencer) || 'N/A'}
                            </span>
                          </td>
                        ))}
                        
                        {/* Insights Column */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs">
                          <button 
                            onClick={() => handleProfileInsights(influencer)}
                            className="text-gray-500 flex items-center hover:text-gray-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="truncate">Profile Insights</span>
                          </button>
                        </td>
                        
                        {/* Add to List Column */}
                        <td className="px-2 py-4 whitespace-nowrap text-center">
                          {isAlreadyAdded ? (
                            <button 
                              className="inline-flex items-center justify-center px-2 py-1 bg-green-100 text-green-600 rounded-md text-xs"
                              disabled
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="truncate">Added</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => onAddToList(influencer)}
                              disabled={isAdding[influencer.username] || isLoading}
                              className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isAdding[influencer.username] ? (
                                <div className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span className="truncate">Adding...</span>
                                </div>
                              ) : (
                                <span className="truncate">Add to List</span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination - matching ShortlistedTable design */}
        <div className={`px-3 py-3 flex items-center justify-between border-t border-gray-200 mt-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex-1 flex justify-between items-center">
            <div className="flex">
              {/* Previous button */}
              <button 
                onClick={() => handlePageChange(calculatedCurrentPage - 1)}
                disabled={!hasPreviousPage || isLoading}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Page numbers */}
              {pageNumbers.map((pageNum, index) => (
                <div key={index}>
                  {pageNum === '...' ? (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(pageNum as number)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium disabled:cursor-not-allowed ${
                        pageNum === calculatedCurrentPage
                          ? 'bg-pink-50 text-pink-600 border-pink-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </div>
              ))}

              {/* Next button */}
              <button 
                onClick={() => handlePageChange(calculatedCurrentPage + 1)}
                disabled={!hasNextPage || isLoading}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center">
              <p className="text-sm text-gray-700 mr-3">
                Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{metadata.total_results}</span> entries
              </p>
              <div className="ml-2 relative page-size-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPageSizeDropdown(!showPageSizeDropdown);
                  }}
                  disabled={isLoading}
                  className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Show {actualPageSize >= metadata.total_results ? 'All' : actualPageSize}
                  <svg className={`-mr-1 ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showPageSizeDropdown && !isLoading && (
                  <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {pageSizeOptions.map((option, index) => {
                        const isObject = typeof option === 'object';
                        const value = isObject ? option.value : option;
                        const label = isObject ? option.label : `Show ${option}`;
                        const isActive = actualPageSize === value;
                        
                        return (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageSizeChange(value);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Insights Modal */}
      <ProfileInsightsModal
        selectedPlatform={selectedPlatform}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        influencer={selectedInfluencer}
        onFetchPosts={onFetchInfluencerPosts}
      />
    </>
  );
};

export default DiscoverResults;