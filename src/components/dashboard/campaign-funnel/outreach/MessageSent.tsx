// src/components/dashboard/campaign-funnel/outreach/MessageSent.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllCampaignInfluencers } from '@/services/campaign-influencers/campaign-influencers.service';
import { getStatuses } from '@/services/statuses/statuses.service';
import { 
  CampaignListMember, 
  CampaignInfluencersByStatus 
} from '@/types/campaign-influencers';
import { Status } from '@/types/statuses';
import { Campaign } from '@/types/campaign';
import { formatNumber } from '@/utils/format';

interface MessageSentProps {
  campaignData?: Campaign | null;
}

const MessageSent: React.FC<MessageSentProps> = ({ campaignData }) => {
  // States
  const [allInfluencers, setAllInfluencers] = useState<CampaignListMember[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Group influencers by status using useMemo for performance
  const influencersByStatus = useMemo<CampaignInfluencersByStatus & { all: CampaignListMember[] }>(() => {
    const grouped = allInfluencers.reduce((acc, influencer) => {
      const statusName = influencer.status?.name?.toLowerCase() || 'discovered';
      
      // Map status names to our defined structure
      switch (statusName) {
        case 'discovered':
          acc.discovered.push(influencer);
          break;
        case 'unreachable':
          acc.unreachable.push(influencer);
          break;
        case 'contacted':
          acc.contacted.push(influencer);
          break;
        case 'responded':
          acc.responded.push(influencer);
          break;
        case 'info_requested':
          acc.info_requested.push(influencer);
          break;
        case 'completed':
          acc.completed.push(influencer);
          break;
        case 'declined':
          acc.declined.push(influencer);
          break;
        case 'inactive':
          acc.inactive.push(influencer);
          break;
        default:
          // Handle unknown statuses by adding to discovered
          acc.discovered.push(influencer);
      }
      
      return acc;
    }, {
      discovered: [],
      unreachable: [],
      contacted: [],
      responded: [],
      info_requested: [],
      completed: [],
      declined: [],
      inactive: [],
    } as CampaignInfluencersByStatus);

    return {
      ...grouped,
      all: allInfluencers
    };
  }, [allInfluencers]);

  // Fast search with debouncing using useMemo
  const filteredInfluencers = useMemo(() => {
    // First filter by status
    let influencers = selectedFilter === 'all' 
      ? influencersByStatus.all 
      : influencersByStatus[selectedFilter as keyof CampaignInfluencersByStatus] || [];

    // Then apply search filter (optimized for speed)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      influencers = influencers.filter(influencer => {
        const fullName = (influencer.social_account?.full_name || '').toLowerCase();
        const accountHandle = (influencer.social_account?.account_handle || '').toLowerCase();
        
        return fullName.includes(searchLower) || accountHandle.includes(searchLower);
      });
    }

    return influencers;
  }, [influencersByStatus, selectedFilter, searchText]);

  // Status filter options with counts (only show available statuses)
  const statusFilterOptions = useMemo(() => {
    const options = [
      { key: 'all', label: 'All Messages', count: influencersByStatus.all?.length || 0 },
    ];

    // Add status options that have data
    statuses.forEach(status => {
      const statusKey = status.name.toLowerCase();
      const count = influencersByStatus[statusKey as keyof CampaignInfluencersByStatus]?.length || 0;
      
      if (count > 0) {
        options.push({
          key: statusKey,
          label: status.name.charAt(0).toUpperCase() + status.name.slice(1).replace('_', ' '),
          count: count
        });
      }
    });

    return options;
  }, [influencersByStatus, statuses]);

  // Get current filter info
  const currentFilter = statusFilterOptions.find(option => option.key === selectedFilter) || statusFilterOptions[0];

  // Fetch campaign influencers and statuses
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignData?.campaign_lists?.[0]?.id) {
        console.log('No campaign data or campaign list ID available');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch statuses first
        console.log('🔄 Fetching campaign influencer statuses...');
        const statusesResponse = await getStatuses('campaign_influencer');
        setStatuses(statusesResponse);
        console.log('✅ Statuses fetched:', statusesResponse.length);

        // Fetch all campaign influencers
        const listId = campaignData.campaign_lists[0].id;
        console.log('🔄 Fetching all campaign influencers for list:', listId);
        
        const influencersResponse = await getAllCampaignInfluencers(listId);
        
        if (influencersResponse.success) {
          setAllInfluencers(influencersResponse.influencers);
          console.log('✅ Campaign influencers fetched:', influencersResponse.influencers.length);
        } else {
          throw new Error(influencersResponse.message || 'Failed to fetch campaign influencers');
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignData?.campaign_lists]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.filter-dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
    setIsDropdownOpen(false);
  };

  // Show loading state with original design
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">Loading...</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Show error state with original design
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900 text-red-600">Error</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load data</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no campaign data state
  if (!campaignData?.campaign_lists?.[0]?.id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">Message Sent (0)</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 font-medium">No Campaign Selected</p>
            <p className="text-gray-400 text-sm mt-1">Please select a campaign to view influencers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
      {/* Header - maintaining original design */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0 relative">
        <h3 className="text-base font-semibold text-gray-900">
          {currentFilter.label} ({formatNumber(currentFilter.count)})
        </h3>
        <div className="flex items-center relative filter-dropdown-container">
          <button 
            onClick={toggleDropdown}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>

          {/* Dropdown - Updated to match ReadyToOnboard design with reduced height */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Filter by Status</h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                {statusFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleFilterChange(option.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-full border-2 transition-colors text-xs ${
                      selectedFilter === option.key
                        ? 'border-purple-300 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-gray-500">({option.count})</span>
                      {selectedFilter === option.key && (
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar - maintaining original design */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg 
              className="w-3.5 h-3.5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contact List - maintaining original design with platform icon moved */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredInfluencers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">No Influencers Found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchText ? 'Try adjusting your search' : 'No influencers match the selected filter'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors duration-150 border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        influencer.social_account?.profile_pic_url || 
                        influencer.social_account?.additional_metrics?.profileImage ||
                        '/default-avatar.png'
                      }
                      alt="avatar"
                      className="rounded-full w-8 h-8 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {/* Platform icon overlaid on profile picture */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border border-white">
                      <svg 
                        className="w-2 h-2 text-white" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    {/* Verification badge */}
                    {influencer.social_account?.is_verified && (
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {influencer.social_account?.full_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      @{influencer.social_account?.account_handle || 'unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Right side - Status and Followers */}
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  {/* Status Badge - restored original size */}
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    influencer.status?.name === 'responded' ? 'bg-green-100 text-green-700' :
                    influencer.status?.name === 'contacted' ? 'bg-blue-100 text-blue-700' :
                    influencer.status?.name === 'completed' ? 'bg-purple-100 text-purple-700' :
                    influencer.status?.name === 'declined' ? 'bg-red-100 text-red-700' :
                    influencer.status?.name === 'info_requested' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {influencer.status?.name || 'Unknown'}
                  </span>
                  
                  {/* Followers Count */}
                  <span className="text-[9px] text-gray-400">
                    {formatNumber(influencer.social_account?.followers_count || 0)} followers
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSent;