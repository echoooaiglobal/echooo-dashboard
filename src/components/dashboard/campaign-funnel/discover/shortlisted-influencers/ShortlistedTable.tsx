// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import ColumnVisibility, { ColumnDefinition } from '@/components/ui/table/ColumnVisibility';
import { getColumnDefinitions } from './columnDefinitions';

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

  // Get column definitions from separate file
  const allColumns = getColumnDefinitions();

  // Ensure shortlistedMembers has proper structure
  const members = shortlistedMembers?.influencers || [];
  const pagination = shortlistedMembers?.pagination || {
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false
  };

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
        const fullName = member.social_account?.full_name || '';
        const accountHandle = member.social_account?.account_handle || '';
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
  const handleRemoveInfluencer = async (campaignInfluencer: CampaignListMember) => {
    if (!campaignInfluencer.id) {
      console.error('Member ID is required to remove influencer');
      return;
    }
    console.log('Removing influencer:', campaignInfluencer);
    // Add campaignInfluencer to removing state to show loading
    onRemovingChange([...removingInfluencers, campaignInfluencer.id]);

    try {
      // Get the list ID from campaignInfluencer
      const campaignListId = campaignInfluencer?.campaign_list_id;
      
      if (!campaignListId) {
        throw new Error('List ID not found');
      }

      // Call the API to remove the influencer
      const result = await removeInfluencerFromList(campaignInfluencer.id);

      if (result.success) {
        console.log('Influencer removed successfully');
        
        // Remove from selected influencers if it was selected
        onSelectionChange(selectedInfluencers.filter(id => id !== campaignInfluencer.id));
        
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
      // Remove campaignInfluencer from removing state
      onRemovingChange(removingInfluencers.filter(id => id !== campaignInfluencer.id));
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
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown]);

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
                      
                      {/* Use the reusable ColumnVisibility component */}
                      <ColumnVisibility
                        isOpen={showColumnDropdown}
                        onClose={() => setShowColumnDropdown(false)}
                        columns={allColumns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumnVisibility}
                        data={members}
                        position="top-right"
                      />
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
                sortedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox"
                        checked={selectedInfluencers.includes(member.id ?? '')}
                        onChange={() => toggleRowSelection(member.id ?? '')}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </td>
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
                ))
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