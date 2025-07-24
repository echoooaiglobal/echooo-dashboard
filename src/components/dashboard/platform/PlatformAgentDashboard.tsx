// src/components/dashboard/platform/PlatformAgentDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStatusList } from '@/services/statuses/statuses.service';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import modals
import ContactsModal from './modals/ContactsModal';
import NotesModal from './modals/NotesModal';

// Import new components
import WelcomeSection from './components/WelcomeSection';
import TodayTasks from './components/TodayTasks';
import AllAssignments from './components/AllAssignments';

// Tab types
export type DashboardTab = 'today' | 'all';

export default function PlatformAgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  // Main dashboard state
  const [activeTab, setActiveTab] = useState<DashboardTab>('today');
  
  // Statuses
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState<string | null>(null);
  
  // Modal states
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<AssignmentInfluencer | null>(null);

  // Initialize statuses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableStatuses();
    }
  }, [isAuthenticated]);

  const fetchAvailableStatuses = async () => {
    try {
      setStatusesLoading(true);
      setStatusesError(null);
      const statuses = await getStatusList('campaign_influencer'); // Get campaign_influencer statuses
      setAvailableStatuses(statuses);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setStatusesError(error instanceof Error ? error.message : 'Failed to load statuses');
      setAvailableStatuses([]);
    } finally {
      setStatusesLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: DashboardTab) => {
    if (tab === activeTab) return;
    console.log('🔄 Tab change from', activeTab, 'to', tab);
    setActiveTab(tab);
  };

  // *** ENHANCED: Better influencer update handler ***
  const handleInfluencerUpdate = useCallback((updatedInfluencer: AssignmentInfluencer) => {
    console.log('📱 PlatformAgentDashboard: Influencer updated:', {
      id: updatedInfluencer.id,
      name: updatedInfluencer.campaign_influencer?.social_account?.full_name,
      attempts: updatedInfluencer.attempts_made,
      status: updatedInfluencer.status?.name,
      campaignStatus: updatedInfluencer.campaign_influencer?.status?.name
    });
    
    // Update the selected influencer if it's the same one being updated
    if (selectedInfluencer && selectedInfluencer.id === updatedInfluencer.id) {
      console.log('🔄 Updating selected influencer in modals');
      setSelectedInfluencer(updatedInfluencer);
    }
  }, [selectedInfluencer]);

  // Updated handlers - now we just open notes modal for editing campaign status
  const handleEditCampaignStatus = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsNotesModalOpen(true);
  };

  const handleViewInfluencer = (influencer: AssignmentInfluencer) => {
    console.log('View influencer:', influencer);
  };

  // Combined contacts modal handlers
  const handleAddContact = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsContactsModalOpen(true);
  };

  const handleViewContacts = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsContactsModalOpen(true);
  };

  const handleContactAdded = () => {
    console.log('Contact added successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Welcome Section with Full Width Tabs */}
      <WelcomeSection
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === 'today' ? (
        <TodayTasks />
      ) : (
        <AllAssignments
          availableStatuses={availableStatuses}
          onEditCampaignStatus={handleEditCampaignStatus}
          onViewInfluencer={handleViewInfluencer}
          onAddContact={handleAddContact}
          onViewContacts={handleViewContacts}
          onInfluencerUpdate={handleInfluencerUpdate}
        />
      )}

      {/* Modals */}
      {selectedInfluencer && (
        <>
          {/* Combined Contacts Modal */}
          <ContactsModal
            isOpen={isContactsModalOpen}
            onClose={() => {
              setIsContactsModalOpen(false);
              setSelectedInfluencer(null);
            }}
            member={selectedInfluencer}
            onContactAdded={handleContactAdded}
          />

          {/* Notes Modal */}
          <NotesModal
            isOpen={isNotesModalOpen}
            onClose={() => {
              setIsNotesModalOpen(false);
              setSelectedInfluencer(null);
            }}
            member={selectedInfluencer}
            onMemberUpdate={handleInfluencerUpdate}
          />
        </>
      )}
    </div>
  );
}