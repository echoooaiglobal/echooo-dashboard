// src/components/dashboard/platform/components/AssignmentContentArea.tsx
'use client';

import { AgentAssignment } from '@/types/assignments';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import AssignmentStatsCards from './AssignmentStatsCards';
import InfluencerTypeTabs from './InfluencerTypeTabs';
import MembersTable from './MembersTable';

interface AssignmentContentAreaProps {
  assignment: AgentAssignment;
  influencers: AssignmentInfluencer[];
  influencersLoading: boolean;
  influencersError: string | null;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  currentInfluencerType: 'active' | 'archived' | 'completed';
  availableStatuses: Status[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onInfluencerTypeChange: (type: 'active' | 'archived' | 'completed') => void;
  onEditCampaignStatus: (influencer: AssignmentInfluencer) => void; // Fixed: Changed from onEditInfluencer
  onViewInfluencer: (influencer: AssignmentInfluencer) => void;
  onAddContact: (influencer: AssignmentInfluencer) => void;
  onViewContacts: (influencer: AssignmentInfluencer) => void;
  onInfluencerUpdate: (influencer: AssignmentInfluencer) => void; // Add this prop
  isStatsCollapsed: boolean;
  onToggleStats: () => void;
}

export default function AssignmentContentArea({
  assignment,
  influencers,
  influencersLoading,
  influencersError,
  pagination,
  currentInfluencerType,
  availableStatuses,
  onPageChange,
  onPageSizeChange,
  onInfluencerTypeChange,
  onEditCampaignStatus, // Fixed: Updated parameter name
  onViewInfluencer,
  onAddContact,
  onViewContacts,
  onInfluencerUpdate, // Add this parameter
  isStatsCollapsed,
  onToggleStats
}: AssignmentContentAreaProps) {
  
  return (
    <div className="space-y-6">
      {/* Assignment Stats */}
      <AssignmentStatsCards assignment={assignment} />

      {/* Connected Tabs and Table Section - No gap between them */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Influencer Type Tabs - Top part of connected section */}
        <div className="grid grid-cols-3 border-b border-gray-200">
          {[
            { type: 'active' as const, label: 'Active', icon: '⚡' },
            { type: 'completed' as const, label: 'Completed', icon: '✓' },
            { type: 'archived' as const, label: 'Archived', icon: '📁' }
          ].map((tab, index) => {
            const isActive = currentInfluencerType === tab.type;
            const isFirst = index === 0;
            const isLast = index === 2;
            
            return (
              <button
                key={tab.type}
                onClick={() => onInfluencerTypeChange(tab.type)}
                className={`flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } ${
                  !isLast && !isActive ? 'border-r border-gray-200' : ''
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Members Table - Bottom part of connected section */}
        <MembersTable
          members={influencers}
          loading={influencersLoading}
          error={influencersError}
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onEditCampaignStatus={onEditCampaignStatus} // Fixed: Pass the correct prop
          onViewMember={onViewInfluencer}
          onAddContact={onAddContact}
          onViewContacts={onViewContacts}
          availableStatuses={availableStatuses}
          onTypeChange={onInfluencerTypeChange}
          currentType={currentInfluencerType}
          assignment={assignment}
          onMemberUpdate={onInfluencerUpdate} // Pass the update handler
        />
      </div>
    </div>
  );
}