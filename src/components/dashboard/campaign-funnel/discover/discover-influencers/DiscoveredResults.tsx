// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredResults.tsx
import React, { useState, useEffect } from 'react';
import { DiscoverInfluencer } from '@/lib/types';
import { addInfluencerToList } from '@/services/campaign/campaign-list.service';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { DiscoveredCreatorsResults, Influencer } from '@/types/insights-iq';
import { SortField, SortOrder } from '@/lib/creator-discovery-types';

interface DiscoverResultsProps {
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
  // Add pagination callbacks
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  pageSize?: number;
}

const DiscoverResults: React.FC<DiscoverResultsProps> = ({
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
  pageSize = 20
}) => {
  const [addedInfluencers, setAddedInfluencers] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  // Get metadata with defaults
  const metadata = discoveredCreatorsResults?.metadata || {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    total_results: totalResults
  };

  // Calculate pagination info - Fix: Use actual page size, not metadata.limit
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
  }, [shortlistedMembers, discoveredCreatorsResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageSizeDropdown) {
        const target = event.target as Element;
        if (!target.closest('.page-size-dropdown')) {
          setShowPageSizeDropdown(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown]);

  // Map UI sort fields to API sort fields
  const mapSortFieldToAPI = (field: string): string => {
    const fieldMapping: Record<string, string> = {
      'username': 'DESCRIPTION',
      'followers': 'FOLLOWER_COUNT',
      'engagementRate': 'ENGAGEMENT_RATE',
      'average_likes': 'AVERAGE_LIKES',
      'average_views': 'AVERAGE_VIEWS',
      'content_count': 'CONTENT_COUNT',
      'reels_views': 'REELS_VIEWS'
    };
    return fieldMapping[field] || field.toUpperCase();
  };

  const handleSort = (field: string) => {
    const direction = sortField === mapSortFieldToAPI(field) && sortDirection === 'desc' ? 'asc' : 'desc';
    onSortChange(mapSortFieldToAPI(field), direction);
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== mapSortFieldToAPI(field)) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const handleAddToList = async (influencer: Influencer) => {
    if (!campaignData || !campaignData.campaign_lists || !campaignData.campaign_lists.length) {
      console.error('No campaign list found');
      return;
    }

    const listId = campaignData.campaign_lists[0].id;
    const platformId = "7b71b156-c049-4972-832e-7e1357c08415"; // Hardcoded platform ID as requested

    // Set adding state for this influencer
    setIsAdding(prev => ({ ...prev, [influencer.username]: true }));

    try {
      const response = await addInfluencerToList(listId, influencer, platformId);
      
      if (response.success) {
        // Update state to show influencer is added
        setAddedInfluencers(prev => ({ ...prev, [influencer.username]: true }));
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer to list:', response.message);
      }
    } catch (error) {
      console.error('Error adding influencer to list:', error);
    } finally {
      // Clear adding state
      setIsAdding(prev => ({ ...prev, [influencer.username]: false }));
    }
  };

  const handleViewProfile = (influencer: Influencer) => {
    console.log('View profile clicked:', influencer);
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
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show page 1, current page area, and last page with ellipsis
      if (calculatedCurrentPage <= 3) {
        // Show 1, 2, 3, ..., last
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (calculatedCurrentPage >= totalPages - 2) {
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
          No influencers found. Try adjusting your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow w-full">
      <div className="w-full">
        <div className="w-full min-w-full table-fixed">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/5"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Influencers Name ({metadata.total_results})</span>
                    {renderSortIcon('username')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/10"
                  onClick={() => handleSort('followers')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Followers</span>
                    {renderSortIcon('followers')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/10"
                  onClick={() => handleSort('engagementRate')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Eng Rate</span>
                    {renderSortIcon('engagementRate')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/10"
                  onClick={() => handleSort('average_likes')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Avg Likes</span>
                    {renderSortIcon('average_likes')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/10"
                  onClick={() => handleSort('average_views')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Avg Views</span>
                    {renderSortIcon('average_views')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10"
                >
                  <span className="truncate">Insights</span>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10"
                >
                  <span className="truncate">Add to List</span>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10"
                >
                  <span className="truncate">View Profile</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discoveredCreatorsResults?.influencers?.map((influencer, key) => {
                // Check if this influencer is already in shortlist or has been added during this session
                const isAlreadyAdded = isInfluencerInShortlist(influencer) || addedInfluencers[influencer.username];
               
                return (
                  <tr key={influencer.username || key} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <img
                            className="rounded-full object-cover h-8 w-8"
                            src={influencer.profileImage || '/user/profile-placeholder.png'}
                            alt={influencer.username}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                            }}
                          />
                        </div>
                        <div className="ml-3 truncate">
                          <div className="text-xs font-medium text-gray-900 flex items-center">
                            <span className="truncate">{influencer.name || influencer.username}</span>
                            {influencer.isVerified && (
                              <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            @{influencer.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.followers?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {typeof influencer.engagementRate === 'number'
                        ? `${(influencer.engagementRate * 100).toFixed(2)}%`
                        : 'N/A'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.average_likes?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.average_views?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs">
                      <button className="text-gray-500 flex items-center hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="truncate">Profile Insights</span>
                      </button>
                    </td>
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
                          onClick={() => handleAddToList(influencer)}
                          disabled={isAdding[influencer.username]}
                          className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors text-xs"
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
                    <td className="px-2 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleViewProfile(influencer)}
                        className="text-gray-500 hover:text-gray-700 inline-flex"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
        <div className="flex items-center mb-4 sm:mb-0">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous button */}
            <button 
              onClick={() => handlePageChange(calculatedCurrentPage - 1)}
              disabled={!hasPreviousPage}
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
                      pageNum === calculatedCurrentPage
                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
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
              className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
            >
              Show {actualPageSize >= metadata.total_results ? 'All' : actualPageSize}
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
                    const isActive = actualPageSize === value;
                    
                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageSizeChange(value);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          isActive ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
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
  );
};

export default DiscoverResults;