// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredResults.tsx
import React, { useState, useEffect } from 'react';
import { DiscoverInfluencer, DiscoverSearchParams } from '@/lib/types';
import { addInfluencerToList } from '@/services/campaign/campaign-list.service';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

interface DiscoverResultsProps {
  influencers: DiscoverInfluencer[];
  isLoading: boolean;
  totalResults: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onLoadMore: () => void;
  hasMore: boolean;
  nextBatchSize: number;
  campaignData?: Campaign | null;
  onInfluencerAdded?: () => void;
  shortlistedMembers: CampaignListMember[];
}

const DiscoverResults: React.FC<DiscoverResultsProps> = ({
  influencers,
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
  shortlistedMembers
}) => {
  const [addedInfluencers, setAddedInfluencers] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

  // Check if an influencer is already in the shortlisted members
  const isInfluencerInShortlist = (influencer: DiscoverInfluencer) => {
    return shortlistedMembers.some(member => 
      member.social_account?.platform_account_id === influencer.id
    );
  };

  // Update addedInfluencers state based on shortlistedMembers when they change
  useEffect(() => {
    const newAddedInfluencers: Record<string, boolean> = {};
    
    influencers.forEach(influencer => {
      if (isInfluencerInShortlist(influencer)) {
        newAddedInfluencers[influencer.id] = true;
      }
    });
    
    setAddedInfluencers(prev => ({
      ...prev,
      ...newAddedInfluencers
    }));
  }, [shortlistedMembers, influencers]);

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    onSortChange(field, direction);
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const handleAddToList = async (influencer: DiscoverInfluencer) => {
    
    if (!campaignData || !campaignData.campaign_lists || !campaignData.campaign_lists.length) {
      console.error('No campaign list found');
      return;
    }

    const listId = campaignData.campaign_lists[0].id;
    const platformId = "5d13c7b1-7e75-4fa2-86e3-2e37c2c8e84c"; // Hardcoded platform ID as requested

    // Set adding state for this influencer
    setIsAdding(prev => ({ ...prev, [influencer.id]: true }));

    try {
      const response = await addInfluencerToList(listId, influencer, platformId);
      
      if (response.success) {
        // Update state to show influencer is added
        setAddedInfluencers(prev => ({ ...prev, [influencer.id]: true }));
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer to list:', response.message);
      }
    } catch (error) {
      console.error('Error adding influencer to list:', error);
    } finally {
      // Clear adding state
      setIsAdding(prev => ({ ...prev, [influencer.id]: false }));
    }
  };

  const handleViewProfile = (influencer: DiscoverInfluencer) => {
    console.log('View profile clicked:', influencer);
  };

  if (isLoading && influencers?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!isLoading && influencers?.length === 0) {
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
                    <span className="truncate">Influencers Name ({totalResults})</span>
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
                  onClick={() => handleSort('engagements')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Engagements</span>
                    {renderSortIcon('engagements')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-1/10"
                  onClick={() => handleSort('avgLikes')}
                >
                  <div className="flex items-center">
                    <span className="truncate">Avg Likes</span>
                    {renderSortIcon('avgLikes')}
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
              {influencers?.map((influencer, key) => {
                // Check if this influencer is already in shortlist or has been added during this session
                const isAlreadyAdded = isInfluencerInShortlist(influencer) || addedInfluencers[influencer.id];
                
                return (
                  <tr key={influencer.id || key} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <img
                            className="rounded-full object-cover h-8 w-8"
                            src={influencer.profileImage || '/images/default-avatar.png'}
                            alt={influencer.username}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/default-avatar.png';
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
                      {influencer.followers || '647.4M'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.engagements || '195.3K'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.avgLikes || '195.3K'}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                      {influencer.engagementRate || '0.03%'}
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
                          disabled={isAdding[influencer.id]}
                          className="inline-flex items-center justify-center px-2 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors text-xs"
                        >
                          {isAdding[influencer.id] ? (
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

      {/* Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
        <div className="flex items-center mb-4 sm:mb-0">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button aria-current="page" className="z-10 bg-purple-50 border-purple-500 text-purple-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
              1
            </button>
            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
              2
            </button>
            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
              3
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
              10
            </button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-700 mr-3">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
            <span className="font-medium">{totalResults || 50}</span> entries
          </p>
          <div className="relative">
            <button className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
              Show 8
              <svg className="-mr-1 ml-1 h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverResults;