// src/components/dashboard/platform/components/MembersTable.tsx
'use client';

import { useState } from 'react';
import { AssignmentMember } from '@/types/assignment-members';
import { Status, getStatusDisplayConfig } from '@/types/statuses';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  MoreVertical,
  Eye,
  Edit3,
  Mail,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'react-feather';

interface MembersTableProps {
  members: AssignmentMember[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEditMember: (member: AssignmentMember) => void;
  onViewMember: (member: AssignmentMember) => void;
  onAddContact: (member: AssignmentMember) => void;
  onViewContacts: (member: AssignmentMember) => void;
  availableStatuses: Status[];
  assignmentName: string;
  brandName: string;
  listName: string;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Component for displaying contact status badge
const ContactStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'discovered':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Discovered' };
      case 'contacted':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' };
      case 'responded':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Responded' };
      case 'declined':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' };
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' };
      case 'onboarded':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Onboarded' };
      case 'unreachable':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Unreachable' };
      case 'info_requested':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Info Requested' };
      case 'info_received':
        return { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Info Received' };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Inactive' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Component for clickable name with external link
const InfluencerName = ({ 
  member 
}: { 
  member: AssignmentMember 
}) => {
  const handleNameClick = () => {
    if (member.social_account.account_url) {
      window.open(member.social_account.account_url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasAccountUrl = !!member.social_account.account_url;

  return (
    <div 
      className={`flex items-center ${hasAccountUrl ? 'cursor-pointer' : ''}`}
      onClick={hasAccountUrl ? handleNameClick : undefined}
    >
      <div className="flex-shrink-0 h-10 w-10">
        <img 
          className={`h-10 w-10 rounded-full object-cover ${hasAccountUrl ? 'cursor-pointer' : ''}`}
          src={member.social_account.profile_pic_url} 
          alt={member.social_account.full_name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.social_account.full_name)}&background=random`;
          }}
        />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900 flex items-center">
          {hasAccountUrl ? (
            <button
              onClick={handleNameClick}
              className="flex items-center text-gray-900 hover:text-gray-700 transition-colors duration-200 focus:outline-none cursor-pointer"
            >
              <span>{member.social_account.full_name}</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
            </button>
          ) : (
            <span>{member.social_account.full_name}</span>
          )}
          {member.social_account.is_verified && (
            <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className={`text-sm text-gray-500 ${hasAccountUrl ? 'cursor-pointer' : ''}`}>
          @{member.social_account.account_handle}
        </div>
      </div>
    </div>
  );
};

// Component for platform logo
const PlatformLogo = ({ 
  platform 
}: { 
  platform: { name: string; logo_url?: string } 
}) => {
  return (
    <div className="flex items-center">
      {platform.logo_url ? (
        <img
          src={platform.logo_url}
          alt={platform.name}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling!.textContent = platform.name;
          }}
        />
      ) : (
        <span className="text-sm text-gray-900">{platform.name}</span>
      )}
      <span className="hidden text-sm text-gray-900">{platform.name}</span>
    </div>
  );
};

// Component for action dropdown menu
const ActionDropdown = ({ 
  member, 
  onEdit, 
  onView,
  onAddContact,
  onViewContacts
}: { 
  member: AssignmentMember;
  onEdit: (member: AssignmentMember) => void;
  onView: (member: AssignmentMember) => void;
  onAddContact: (member: AssignmentMember) => void;
  onViewContacts: (member: AssignmentMember) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onView(member);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(member);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Status
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  onViewContacts(member);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-4 h-4 mr-2" />
                View Contacts
              </button>
              <button
                onClick={() => {
                  onAddContact(member);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Contact
              </button>
              <hr className="my-1" />
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm rounded-md ${
                page === currentPage
                  ? 'bg-teal-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function MembersTable({
  members,
  isLoading,
  error,
  onRefresh,
  onEditMember,
  onViewMember,
  onAddContact,
  onViewContacts,
  availableStatuses,
  assignmentName,
  brandName,
  listName,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.social_account.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.social_account.account_handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status.name.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md mb-8">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Campaign: {assignmentName}
            </h2>
            <p className="text-sm text-gray-600">
              Brand: {brandName} | List: {listName}
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search influencers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {availableStatuses.map((status) => {
                const config = getStatusDisplayConfig(status.name);
                return (
                  <option key={status.id} value={status.name.toLowerCase()}>
                    {config.label}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-gray-500">
            {filteredMembers.length} of {totalItems} members
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" />
          <span className="ml-3 text-gray-500">Loading assignment members...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mb-4">
            <p className="text-red-600 text-sm font-medium">Error Loading Members</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={onRefresh}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <>
          {filteredMembers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Influencer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Followers
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <InfluencerName member={member} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(member.social_account.followers_count)}
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <PlatformLogo platform={member.platform} />
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ContactStatusBadge status={member.status.name} />
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.last_contacted_at 
                            ? formatDate(member.last_contacted_at)
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(member.next_contact_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.contact_attempts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.collaboration_price 
                            ? `$${member.collaboration_price.toLocaleString()}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ActionDropdown 
                            member={member}
                            onEdit={onEditMember}
                            onView={onViewMember}
                            onAddContact={onAddContact}
                            onViewContacts={onViewContacts}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No members found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No influencers match your search criteria.' 
                  : 'This assignment doesn\'t have any members yet.'
                }
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}