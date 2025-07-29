// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import { formatNumber } from '@/utils/format';

interface ShortlistedTableProps {
  shortlistedMembers: CampaignListMembersResponse;
  isLoading: boolean;
  searchText: string;
  selectedInfluencers: string[];
  removingInfluencers: string[];
  onInfluencerRemoved?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelectionChange: (selected: string[]) => void;
  onRemovingChange: (removing: string[]) => void;
}

// Define all available columns with their properties
interface ColumnDefinition {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
  getValue: (member: CampaignListMember) => string | number | null;
  render?: (value: any, member: CampaignListMember) => React.ReactNode;
}

const ShortlistedTable: React.FC<ShortlistedTableProps> = ({
  shortlistedMembers,
  isLoading,
  searchText,
  selectedInfluencers,
  removingInfluencers,
  onInfluencerRemoved,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onRemovingChange
}) => {
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Ensure shortlistedMembers has proper structure
  const members = shortlistedMembers?.members || [];
  const pagination = shortlistedMembers?.pagination || {
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false
  };

  // Helper function to safely access additional metrics
  const getAdditionalMetric = (member: CampaignListMember, key: string, defaultValue: any = null) => {
    return member?.social_account?.additional_metrics?.[key] ?? defaultValue;
  };

  // Helper function to parse JSON strings safely
  const parseJSONSafely = (jsonString: any, defaultValue: any = null) => {
    if (!jsonString) return defaultValue;
    if (typeof jsonString === 'object') return jsonString;
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  // Helper function to get reel views from member data
  const getReelViews = (member: CampaignListMember) => {
    // Check multiple possible locations for reel views data
    const instagramOptions = getAdditionalMetric(member, 'instagram_options');
    if (instagramOptions?.reel_views) {
      // If it's a range object with min/max
      if (typeof instagramOptions.reel_views === 'object' && 
          instagramOptions.reel_views.min !== undefined) {
        const avg = (instagramOptions.reel_views.min + instagramOptions.reel_views.max) / 2;
        return avg;
      }
      // If it's a direct number
      if (typeof instagramOptions.reel_views === 'number') {
        return instagramOptions.reel_views;
      }
    }
    
    // Check if it's stored in filter_match
    const filterMatch = getAdditionalMetric(member, 'filter_match');
    if (filterMatch?.instagram_options?.reel_views) {
      const reelViews = filterMatch.instagram_options.reel_views;
      if (typeof reelViews === 'number') {
        return reelViews;
      }
    }
    
    // Check for direct fields
    const averageReelViews = getAdditionalMetric(member, 'average_reel_views');
    if (averageReelViews !== null && averageReelViews !== undefined) {
      return averageReelViews;
    }
    
    const reelViews = getAdditionalMetric(member, 'reel_views');
    if (reelViews !== null && reelViews !== undefined) {
      return reelViews;
    }
    
    return null;
  };

  // Helper function to format location
  const formatLocation = (member: CampaignListMember) => {
    const locationData = getAdditionalMetric(member, 'creator_location');
    const parsed = parseJSONSafely(locationData, null);
    
    if (parsed && parsed.city && parsed.country) {
      return `${parsed.city}, ${parsed.country}`;
    }
    
    const city = getAdditionalMetric(member, 'creator_city');
    const country = getAdditionalMetric(member, 'creator_country');
    
    if (city && country) {
      return `${city}, ${country}`;
    }
    
    return 'N/A';
  };

  // Helper function to get contact details
  const getContactDetails = (member: CampaignListMember) => {
    const contactsData = getAdditionalMetric(member, 'contact_details');
    const parsed = parseJSONSafely(contactsData, []);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    
    // Check for individual contact fields
    const primaryType = getAdditionalMetric(member, 'primary_contact_type');
    const primaryValue = getAdditionalMetric(member, 'primary_contact_value');
    
    if (primaryType && primaryValue) {
      return [{ type: primaryType, value: primaryValue }];
    }
    
    return [];
  };

  // Helper function to get work platform info
  const getWorkPlatform = (member: CampaignListMember) => {
    const platformData = getAdditionalMetric(member, 'work_platform');
    const parsed = parseJSONSafely(platformData, null);
    
    if (parsed && parsed.name) {
      return parsed;
    }
    
    // Fall back to individual platform fields
    const platformName = getAdditionalMetric(member, 'platform_name') || member.platform?.name;
    const platformLogo = getAdditionalMetric(member, 'platform_logo');
    const platformId = getAdditionalMetric(member, 'platform_id') || member.platform?.id;
    
    if (platformName) {
      return {
        name: platformName,
        logo_url: platformLogo,
        id: platformId
      };
    }
    
    return member.platform || null;
  };

  // Toggle row expansion
  const toggleRowExpansion = (memberId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  // Truncate name function
  const truncateName = (name: string, maxLength: number = 15): string => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Get platform icon based on platform name
  const getPlatformIcon = (platformName: string) => {
    switch (platformName?.toLowerCase()) {
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-pink-500 fill-current">
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="w-5 h-5 text-red-500 fill-current">
            <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-black fill-current">
            <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 text-blue-400 fill-current">
            <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
          </svg>
        );
      default:
        return (
          <div className="w-5 h-5 bg-gray-300 rounded flex items-center justify-center">
            <span className="text-xs text-gray-600">?</span>
          </div>
        );
    }
  };

  // Handle clicking on name to open account URL
  const handleNameClick = (member: CampaignListMember) => {
    const accountUrl = member.social_account?.account_url || getAdditionalMetric(member, 'url');
    if (accountUrl) {
      window.open(accountUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Define all available columns with enhanced data access
  const allColumns: ColumnDefinition[] = [
    {
      key: 'name',
      label: 'Name',
      width: 'w-32',
      defaultVisible: true,
      getValue: (member) => member.social_account?.full_name || getAdditionalMetric(member, 'name') || '',
      render: (value, member) => (
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-12 w-12 relative">
            <img
              className="rounded-full object-cover h-12 w-12 border-2 border-gray-200 shadow-sm"
              src={member.social_account?.profile_pic_url || getAdditionalMetric(member, 'profileImage') || `https://i.pravatar.cc/150?u=${member.social_account?.id}`}
              alt={member.social_account?.full_name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${member.social_account?.id}`;
              }}
            /> 
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
              <span 
                className="truncate cursor-pointer hover:text-purple-600 transition-colors"
                title={member.social_account?.full_name || ''}
                onClick={() => handleNameClick(member)}
              >
                {truncateName(member.social_account?.full_name || getAdditionalMetric(member, 'name') || '', 20)}
              </span>
              {(member.social_account?.is_verified || getAdditionalMetric(member, 'isVerified')) && (
                <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"/>
                  </svg>
                </span>
              )}
            </div>
            <div 
              className="text-xs text-gray-500 flex items-center gap-2 mt-1"
              onClick={() => handleNameClick(member)}
            >
              <span className="truncate cursor-pointer hover:text-gray-700 transition-colors">
                @{truncateName(member.social_account?.account_handle || getAdditionalMetric(member, 'username') || '', 20)}
              </span>
              {getWorkPlatform(member)?.logo_url && (
                <img
                  src={getWorkPlatform(member).logo_url}
                  alt={getWorkPlatform(member).name}
                  className="w-4 h-4 rounded flex-shrink-0"
                  title={getWorkPlatform(member).name}
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
      getValue: (member) => member.social_account?.followers_count || getAdditionalMetric(member, 'followers') || 0,
      render: (value) => formatNumber(value) || 'N/A'
    },
    {
      key: 'engagement_rate',
      label: 'Eng Rate',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) => getAdditionalMetric(member, 'engagementRate') || getAdditionalMetric(member, 'engagement_rate'),
      render: (value) => {
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return 'N/A';
      }
    },
    {
      key: 'avg_likes',
      label: 'Avg Likes',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) => getAdditionalMetric(member, 'average_likes'),
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    // NEW: Reel Views Column
    {
      key: 'reel_views',
      label: 'Reel Views',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) => getReelViews(member),
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },

    // Enhanced columns from the additional metrics
    {
      key: 'location',
      label: 'Location',
      width: 'w-24',
      defaultVisible: false,
      getValue: (member) => formatLocation(member),
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
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'gender'),
      render: (value) => {
        if (!value) return 'N/A';
        const displayValue = String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
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
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'language'),
      render: (value) => value ? String(value).toUpperCase() : 'N/A'
    },
    {
      key: 'age_group',
      label: 'Age Group',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'age_group'),
      render: (value) => value || 'N/A'
    },
    {
      key: 'average_views',
      label: 'Avg Views',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'average_views'),
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'content_count',
      label: 'Content Count',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'content_count') || member.social_account?.media_count,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'subscriber_count',
      label: 'Subscribers',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => member.social_account?.subscribers_count || getAdditionalMetric(member, 'subscriber_count'),
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'platform_account_type',
      label: 'Account Type',
      width: 'w-24',
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'platform_account_type'),
      render: (value) => {
        if (!value) return 'N/A';
        const displayValue = String(value).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const colorClass = value === 'BUSINESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
            {displayValue}
          </span>
        );
      }
    },

    // Keep existing columns for backward compatibility
    {
      key: 'media_count',
      label: 'Media Count',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => member.social_account?.media_count,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'following_count',
      label: 'Following',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => member.social_account?.following_count,
      render: (value) => typeof value === 'number' ? formatNumber(value) : 'N/A'
    },
    {
      key: 'livestream_metrics',
      label: 'Livestream',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => getAdditionalMetric(member, 'livestream_metrics'),
      render: (value) => {
        if (value && typeof value === 'object') {
          return (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Available
            </span>
          );
        }
        return 'N/A';
      }
    }
  ];

  // Initialize visible columns based on data availability and default visibility
  useEffect(() => {
    if (members.length > 0) {
      const initialVisible = new Set<string>();
      
      allColumns.forEach(column => {
        if (column.defaultVisible) {
          initialVisible.add(column.key);
        } else {
          // Check if any member has data for this column
          const hasData = members.some(member => {
            const value = column.getValue(member);
            return value !== null && value !== undefined && value !== '';
          });
          
          if (hasData) {
            initialVisible.add(column.key);
          }
        }
      });
      
      setVisibleColumns(initialVisible);
    }
  }, [members]);

  // Filter shortlisted members based on search text
  const filteredMembers = searchText
    ? members.filter(member => {
        const fullName = member.social_account?.full_name || getAdditionalMetric(member, 'name') || '';
        const accountHandle = member.social_account?.account_handle || getAdditionalMetric(member, 'username') || '';
        return fullName.toLowerCase().includes(searchText.toLowerCase()) ||
               accountHandle.toLowerCase().includes(searchText.toLowerCase());
      })
    : members;

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  // Sort filtered members based on sort configuration
  const sortedMembers = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredMembers;
    }

    const column = allColumns.find(col => col.key === sortConfig.key);
    if (!column) return filteredMembers;

    return [...filteredMembers].sort((a, b) => {
      const aValue = column.getValue(a);
      const bValue = column.getValue(b);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (convert to string if needed)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredMembers, sortConfig, allColumns]);

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

  // Get visible columns in order
  const visibleColumnsData = allColumns.filter(column => visibleColumns.has(column.key));

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelected = selectedInfluencers.includes(id) 
      ? selectedInfluencers.filter(item => item !== id) 
      : [...selectedInfluencers, id];
    onSelectionChange(newSelected);
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

  // Toggle all selection
  const toggleAllSelection = () => {
    const currentPageIds = sortedMembers.map(member => member.id ?? '').filter(id => id);
    
    if (selectedInfluencers.length === currentPageIds.length && 
        currentPageIds.every(id => selectedInfluencers.includes(id))) {
      // Deselect all on current page
      onSelectionChange(selectedInfluencers.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      const newSelected = [...selectedInfluencers];
      currentPageIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onSelectionChange(newSelected);
    }
  };

  // Check if all current page items are selected
  const currentPageIds = sortedMembers.map(member => member.id ?? '').filter(id => id);
  const isAllCurrentPageSelected = currentPageIds.length > 0 && 
    currentPageIds.every(id => selectedInfluencers.includes(id));

  // Handle remove influencer
  const handleRemoveInfluencer = async (member: CampaignListMember) => {
    if (!member.id) {
      console.error('Member ID is required to remove influencer');
      return;
    }

    // Add member to removing state to show loading
    onRemovingChange([...removingInfluencers, member.id]);

    try {
      // Get the list ID from member
      const listId = member?.list_id;
      
      if (!listId) {
        throw new Error('List ID not found');
      }

      // Call the API to remove the influencer
      const result = await removeInfluencerFromList(listId, member.id);

      if (result.success) {
        console.log('Influencer removed successfully');
        
        // Remove from selected influencers if it was selected
        onSelectionChange(selectedInfluencers.filter(id => id !== member.id));
        
        // Call the callback to refresh the data
        if (onInfluencerRemoved) {
          onInfluencerRemoved();
        }
      } else {
        console.error('Failed to remove influencer:', result.message);
        alert(result.message || 'Failed to remove influencer');
      }
    } catch (error) {
      console.error('Error removing influencer:', error);
      alert('An error occurred while removing the influencer');
    } finally {
      // Remove member from removing state
      onRemovingChange(removingInfluencers.filter(id => id !== member.id));
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const { page: currentPage, total_pages: totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show page 1, current page area, and last page with ellipsis
      if (currentPage <= 3) {
        // Show 1, 2, 3, ..., last
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show 1, ..., last-2, last-1, last
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // Calculate display range
  const startItem = ((pagination.page - 1) * pagination.page_size) + 1;
  const endItem = Math.min(pagination.page * pagination.page_size, pagination.total_items);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (onPageChange) {
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

  // Page size options
  const pageSizeOptions = [
    10, 
    25, 
    50, 
    100, 
    { label: 'Show All', value: pagination.total_items || 999999 }
  ];

  // Close dropdowns when clicking outside
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

  return (
    <div className="w-12/12 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div className="flex-grow overflow-hidden">
        <div className="max-h-[735px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  <input 
                    type="checkbox" 
                    checked={isAllCurrentPageSelected}
                    onChange={toggleAllSelection}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </th>
                {/* Expand/Collapse column - REMOVED */}
                {visibleColumnsData.map((column) => (
                  <th 
                    key={column.key} 
                    scope="col" 
                    className={`px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${column.width} cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="group-hover:text-purple-700 transition-colors duration-200">
                        {column.key === 'name' ? `${column.label} (${pagination.total_items})` : column.label}
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon(column.key)}
                      </div>
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 relative">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Action</span>
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
                      
                      {/* Column Toggle Dropdown */}
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
                                // Check if any member has data for this column
                                const hasData = members.some(member => {
                                  const value = column.getValue(member);
                                  return value !== null && value !== undefined && value !== '';
                                });
                                
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
                                    const hasData = members.some(member => {
                                      const value = column.getValue(member);
                                      return value !== null && value !== undefined && value !== '';
                                    });
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={visibleColumnsData.length + 2} className="px-3 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnsData.length + 2} className="px-3 py-8 text-center text-gray-500">
                    {searchText ? 'No influencers match your search.' : 'No shortlisted influencers yet.'}
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member) => {
                  return (
                    <React.Fragment key={member.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox"
                            checked={selectedInfluencers.includes(member.id ?? '')}
                            onChange={() => toggleRowSelection(member.id ?? '')}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                          />
                        </td>
                        {/* Expand/Collapse button - REMOVED */}
                        {visibleColumnsData.map((column) => (
                          <td key={column.key} className={`px-2 py-4 whitespace-nowrap text-sm text-gray-500 ${column.width}`}>
                            <span className="truncate block">
                              {column.render ? column.render(column.getValue(member), member) : column.getValue(member) || 'N/A'}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-4 whitespace-nowrap text-center w-20">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleRemoveInfluencer(member)}
                              disabled={removingInfluencers.includes(member.id ?? '')}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all duration-200 group disabled:opacity-50"
                              title="Remove from list"
                            >
                              {removingInfluencers.includes(member.id ?? '') ? (
                                <div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" />
                              ) : (
                                <svg 
                                  className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Dynamic Pagination */}
      <div className="px-3 py-3 flex items-center justify-between border-t border-gray-200 mt-auto">
        <div className="flex-1 flex justify-between items-center">
          <div className="flex">
            {/* Previous button */}
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_previous}
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
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      pageNum === pagination.page
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
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{pagination.total_items}</span> entries
            </p>
            <div className="ml-2 relative page-size-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageSizeDropdown(!showPageSizeDropdown);
                }}
                className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
              >
                Show {pagination.page_size >= pagination.total_items ? 'All' : pagination.page_size}
                <svg className={`-mr-1 ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dropdown Menu - Opens UPWARD */}
              {showPageSizeDropdown && (
                <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {pageSizeOptions.map((option, index) => {
                      const isObject = typeof option === 'object';
                      const value = isObject ? option.value : option;
                      const label = isObject ? option.label : `Show ${option}`;
                      
                      // Fix the active logic - be more specific about Show All
                      let isActive;
                      if (isObject) {
                        // For "Show All" option: only active if page_size is exactly the large value (999999 or total_items)
                        isActive = pagination.page_size === value;
                      } else {
                        // For regular numeric options: only active if page_size exactly matches
                        isActive = pagination.page_size === value;
                      }
                      
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
  );
};

export default ShortlistedTable;