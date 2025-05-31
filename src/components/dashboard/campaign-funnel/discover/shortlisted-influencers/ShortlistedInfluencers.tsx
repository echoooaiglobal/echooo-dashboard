// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'react-feather';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import OutreachMessageForm from './OutreachMessageForm';
import { apiGet, apiPost, useApiCall } from '@/lib/api-utils';

interface MessageTemplate {
  id: string;
  subject: string;
  content: string;
  campaign_id: string;
  company_id: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

interface ShortlistedInfluencersProps {
  campaignData?: Campaign | null;
  shortlistedMembers: CampaignListMembersResponse;
  isLoading: boolean;
  onInfluencerRemoved?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const ShortlistedInfluencers: React.FC<ShortlistedInfluencersProps> = ({ 
  campaignData = null,
  shortlistedMembers,
  isLoading = false,
  onInfluencerRemoved,
  onPageChange,
  onPageSizeChange
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [removingInfluencers, setRemovingInfluencers] = useState<string[]>([]);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [isOutreachFormOpen, setIsOutreachFormOpen] = useState(false);
  
  // API Integration States
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

console.log('campaignData:', campaignData)
  
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

  /**
   * Check if a message template exists for the current campaign
   */
  const hasMessageTemplateForCampaign = (): boolean => {
    if (!campaignData?.id || !messageTemplates.length) {
      return false;
    }
    
    return messageTemplates.some(template => template.campaign_id === campaignData.id);
  };

  /**
   * Handle Start Outreach button click - conditional logic based on template existence
   */
  const handleStartOutreach = () => {
    if (hasMessageTemplateForCampaign()) {
      // Template exists for this campaign - perform different action
      console.log('Message template exists for campaign:', campaignData?.id);
      console.log('Existing templates:', messageTemplates.filter(t => t.campaign_id === campaignData?.id));
      
      // TODO: Replace with your custom logic when template exists
      // For now, we'll show an alert but you can replace this with your desired functionality
      alert('Message template already exists for this campaign. Custom outreach logic will be implemented here.');
      
      // Example of what you might want to do:
      // - Navigate to a different page
      // - Show a different modal
      // - Start the outreach process directly
      // - etc.
      
    } else {
      // No template exists - show the form to create one
      console.log('No message template found for campaign:', campaignData?.id);
      setIsOutreachFormOpen(true);
    }
  };

  /**
 * Get headers with Bearer token for API requests
 */
  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Get token from localStorage and add to headers
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Added Authorization header with token');
      } else {
        console.warn('⚠️ No accessToken found in localStorage');
      }
    }
    
    return headers;
  };


  // API Function: Fetch message templates by company
  const fetchMessageTemplates = async () => {
  if (!campaignData?.company_id) {
    console.warn('No company_id available to fetch templates');
    return;
  }

  setIsLoadingTemplates(true);
  try {
    console.log(`🔄 Fetching templates for company: ${campaignData.company_id}`);
    
    const response = await fetch(`/api/v0/message-templates/company/${campaignData.company_id}`, {
      method: 'GET',
      headers: getAuthHeaders() // 🔑 This adds the Bearer token
    });
    
    if (response.ok) {
      const templates = await response.json();
      setMessageTemplates(templates);
      console.log('✅ Templates fetched successfully:', templates);
      
      // Log whether template exists for current campaign
      const hasTemplate = templates.some((t: MessageTemplate) => t.campaign_id === campaignData.id);
      console.log(`Template exists for campaign ${campaignData.id}:`, hasTemplate);
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to fetch templates:', errorData);
      setMessageTemplates([]);
    }
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    setMessageTemplates([]);
  } finally {
    setIsLoadingTemplates(false);
  }
};

  // API Function: Save new message template
  const saveMessageTemplate = async (data: { subject: string; message: string; campaignId?: string }) => {
    if (!campaignData?.company_id || !campaignData?.id) {
      console.error('Missing company_id or campaign_id for saving template');
      return false;
    }

    setIsSavingTemplate(true);
    try {
      console.log('🔄 Saving template with data:', data);
      
      const response = await fetch('/api/v0/message-templates', {
        method: 'POST',
        headers: getAuthHeaders(), // 🔑 This adds the Bearer token
        body: JSON.stringify({
          subject: data.subject,
          content: data.message,
          company_id: campaignData.company_id,
          campaign_id: campaignData.id,
          is_global: true,
          auto_assign_agent: true,
          target_list_id: campaignData?.campaign_lists[0].id
        }),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        console.log('✅ Template saved successfully:', newTemplate);
        
        // Refresh the templates list
        await fetchMessageTemplates();
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save template:', errorData);
        alert(`Failed to save template: ${errorData.error || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving template:', error);
      alert('An error occurred while saving the template');
      return false;
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Fetch templates when component mounts or campaignData changes
  useEffect(() => {
    if (campaignData?.company_id) {
      fetchMessageTemplates();
    }
  }, [campaignData?.company_id]);

  // Filter shortlisted members based on search text
  const filteredMembers = searchText
    ? members.filter(member => {
        const fullName = member.social_account?.full_name || '';
        const accountHandle = member.social_account?.account_handle || '';
        return fullName.toLowerCase().includes(searchText.toLowerCase()) ||
               accountHandle.toLowerCase().includes(searchText.toLowerCase());
      })
    : members;

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedInfluencers(prevSelected => 
      prevSelected.includes(id) 
        ? prevSelected.filter(item => item !== id) 
        : [...prevSelected, id]
    );
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    const currentPageIds = filteredMembers.map(member => member.id ?? '').filter(id => id);
    
    if (selectedInfluencers.length === currentPageIds.length && 
        currentPageIds.every(id => selectedInfluencers.includes(id))) {
      // Deselect all on current page
      setSelectedInfluencers(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedInfluencers(prev => {
        const newSelected = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  // Check if all current page items are selected
  const currentPageIds = filteredMembers.map(member => member.id ?? '').filter(id => id);
  const isAllCurrentPageSelected = currentPageIds.length > 0 && 
    currentPageIds.every(id => selectedInfluencers.includes(id));

  // Calculate total followers count - FIXED TYPE ERROR
  const totalFollowers = filteredMembers.reduce((total, member) => {
    const followersCount = member.social_account?.followers_count;
    let parsedCount = 0;
    
    if (followersCount) {
      if (typeof followersCount === 'string') {
        const numStr = (followersCount as string).toLowerCase() || '0';
        const baseNumber = parseFloat(numStr.replace(/[km]/g, ''));
        if (numStr.includes('k')) {
          parsedCount = baseNumber * 1000;
        } else if (numStr.includes('m')) {
          parsedCount = baseNumber * 1000000;
        } else {
          parsedCount = baseNumber || 0;
        }
      } else if (typeof followersCount === 'number') {
        parsedCount = followersCount;
      }
    }
    
    return total + parsedCount;
  }, 0);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Truncate name function - FIXED LONG NAME ISSUE
  const truncateName = (name: string, maxLength: number = 15): string => {
    if (!name) return '';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Handle remove influencer - UPDATED WITH API CALL
  const handleRemoveInfluencer = async (member: CampaignListMember) => {
    if (!member.id) {
      console.error('Member ID is required to remove influencer');
      return;
    }

    // Add member to removing state to show loading
    setRemovingInfluencers(prev => [...prev, member.id ?? '']);

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
        setSelectedInfluencers(prev => prev.filter(id => id !== member.id));
        
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
      setRemovingInfluencers(prev => prev.filter(id => id !== member.id));
    }
  };

  // Handle bulk remove selected influencers
  const handleBulkRemove = async () => {
    if (selectedInfluencers.length === 0) return;

    // Get list IDs for the selected members
    const selectedMembers = members.filter(member => 
      selectedInfluencers.includes(member.id ?? '')
    );

    if (selectedMembers.length === 0) {
      alert('No valid members selected for removal');
      return;
    }

    // Add all selected to removing state
    setRemovingInfluencers(prev => [...prev, ...selectedInfluencers]);

    try {
      // Create removal promises for each selected member
      const promises = selectedMembers.map(member => {
        const listId = member.list_id;
        if (!listId || !member.id) {
          return Promise.reject(new Error(`Invalid data for member: ${member.social_account?.full_name}`));
        }
        return removeInfluencerFromList(listId, member.id);
      });
      
      const results = await Promise.allSettled(promises);
      
      // Check results
      const failures = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      );

      if (failures.length === 0) {
        console.log('All selected influencers removed successfully');
        setSelectedInfluencers([]);
        
        if (onInfluencerRemoved) {
          onInfluencerRemoved();
        }
      } else {
        const successCount = selectedInfluencers.length - failures.length;
        console.error(`Failed to remove ${failures.length} influencers`);
        alert(`Successfully removed ${successCount} influencers. Failed to remove ${failures.length} influencers.`);
        
        // Remove successfully removed items from selection
        const failedMemberIds = failures.map((_, index) => selectedInfluencers[index]);
        setSelectedInfluencers(failedMemberIds);
        
        if (onInfluencerRemoved && successCount > 0) {
          onInfluencerRemoved();
        }
      }
    } catch (error) {
      console.error('Error in bulk remove:', error);
      alert('An error occurred during bulk removal');
    } finally {
      // Clear removing state
      setRemovingInfluencers([]);
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

  return (
    <div className="space-y-6">
      {/* Search Box and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-4">
          {selectedInfluencers.length > 0 && (
            <button
              onClick={handleBulkRemove}
              disabled={removingInfluencers.length > 0}
              className="px-4 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {removingInfluencers.length > 0 ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Removing...
                </div>
              ) : (
                `Remove Selected (${selectedInfluencers.length})`
              )}
            </button>
          )}
          
          <button 
            onClick={handleStartOutreach}
            className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            Start Outreach
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex space-x-6" style={{ minHeight: '630px' }}>
        {/* Influencers Table */}
        <div className="w-8/12 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    <input 
                      type="checkbox" 
                      checked={isAllCurrentPageSelected}
                      onChange={toggleAllSelection}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Influencers Name ({pagination.total_items})
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Followers
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Engagements
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Avg Likes
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Platform
                  </th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                      {searchText ? 'No influencers match your search.' : 'No shortlisted influencers yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox"
                          checked={selectedInfluencers.includes(member.id ?? '')}
                          onChange={() => toggleRowSelection(member.id ?? '')}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-32">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 h-8 w-8 relative">
                            <img
                              className="rounded-full object-cover h-8 w-8"
                              src={member.social_account?.profile_pic_url || `https://i.pravatar.cc/150?u=${member.social_account?.id}`}
                              alt={member.social_account?.full_name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${member.social_account?.id}`;
                              }}
                            />
                          </div>
                          <div className="ml-2 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
                              <span 
                                className="truncate"
                                title={member.social_account?.full_name || ''} // Show full name on hover
                              >
                                {truncateName(member.social_account?.full_name || '', 20)}
                              </span>
                              {member.social_account?.is_verified && (
                                <span className="ml-1 flex-shrink-0 text-blue-500" title="Verified">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"/>
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div 
                              className="text-xs text-gray-500 truncate"
                              title={`@${member.social_account?.account_handle || ''}`} // Show full handle on hover
                            >
                              @{truncateName(member.social_account?.account_handle || '', 20)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                        <span className="truncate block">
                          {member.social_account?.followers_count || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                        <span className="truncate block">195.3K</span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                        <span className="truncate block">195.3K</span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-16">
                        <div className="w-6 h-6 flex items-center justify-center rounded-md mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-pink-500 fill-current">
                            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                          </svg>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-center w-16">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        
        {/* Analytics Section */}
        <div className="w-4/12 bg-white rounded-lg shadow flex flex-col">
          <div className="p-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">List Analyze</h2>
                <button className="flex items-center text-red-500 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export List
                </button>
              </div>
              
              {/* Donut Charts - Smaller size for better fit */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Audience by Age */}
                <div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="51 49" strokeDashoffset="25"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="36.2 63.8" strokeDashoffset="76"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6.5 93.5" strokeDashoffset="39.8"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="3" strokeDasharray="4.8 95.2" strokeDashoffset="46.3"></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">6.5%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-700">Audience by age</p>
                  </div>
                  
                  {/* Age Legend */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">25-34</span>
                      <span className="ml-auto text-xs font-medium">51.0%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">18-24</span>
                      <span className="ml-auto text-xs font-medium">36.2%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">35-44</span>
                      <span className="ml-auto text-xs font-medium">6.5%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">13-17</span>
                      <span className="ml-auto text-xs font-medium">4.8%</span>
                    </div>
                  </div>
                </div>
                
                {/* Audience by Location */}
                <div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="63.1 36.9" strokeDashoffset="25"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="3" strokeDasharray="14.1 85.9" strokeDashoffset="88.1"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="1.9 98.1" strokeDashoffset="102.2"></circle>
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#14b8a6" strokeWidth="3" strokeDasharray="20.9 79.1" strokeDashoffset="104.1"></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">63.1%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-700">Audience by location</p>
                  </div>
                  
                  {/* Location Legend */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Pakistan</span>
                      <span className="ml-auto text-xs font-medium">63.1%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">India</span>
                      <span className="ml-auto text-xs font-medium">14.1%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">United Arab Emirates</span>
                      <span className="ml-auto text-xs font-medium">1.9%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                      <span className="text-xs text-gray-600">Others</span>
                      <span className="ml-auto text-xs font-medium">20.9%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Metrics Rows - More compact */}
              <div className="space-y-3">
                {/* First Row of Metrics */}
                <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">{formatNumber(totalFollowers)}</p>
                    <p className="text-xs text-gray-500">Total Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">3.4</p>
                    <p className="text-xs text-gray-500">Reels Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">663.4K</p>
                    <p className="text-xs text-gray-500">Post Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">1.4M</p>
                    <p className="text-xs text-gray-500">Story Views</p>
                  </div>
                </div>
                
                {/* Campaign Engagements */}
                <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
                  <p>Total campaign engagements: 743.9K</p>
                </div>
                
                {/* Second Row of Metrics */}
                <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">$95.4K</p>
                    <p className="text-xs text-gray-500">Story EMV</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">3.4</p>
                    <p className="text-xs text-gray-500">Reels Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">$4.8M</p>
                    <p className="text-xs text-gray-500">Posts EMV</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">$76.4K</p>
                    <p className="text-xs text-gray-500">Reels EMV</p>
                  </div>
                </div>
                
                {/* Campaign Engagements Repeat */}
                <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
                  <p>Total campaign engagements: 743.9K</p>
                </div>
                
                {/* Third Row of Metrics */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">201.8K</p>
                    <p className="text-xs text-gray-500">Posts Engagements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">74.6K</p>
                    <p className="text-xs text-gray-500">Story Engagements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">466.7K</p>
                    <p className="text-xs text-gray-500">Link Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">1.4M</p>
                    <p className="text-xs text-gray-500">Story Views</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total EMV - Bottom aligned */}
            <div className="text-center text-xs text-gray-500 pt-2 mt-3 border-t border-gray-200">
              <p>Total EMV: $4.9M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Message Form - Only show if no template exists for this campaign */}
      {!hasMessageTemplateForCampaign() && (
        <OutreachMessageForm 
          isOpen={isOutreachFormOpen}
          onClose={() => setIsOutreachFormOpen(false)}
          onSubmit={saveMessageTemplate}
          messageTemplates={messageTemplates}
          isLoadingTemplates={isLoadingTemplates}
          isSavingTemplate={isSavingTemplate}
        />
      )}
    </div>
  );
};

export default ShortlistedInfluencers;