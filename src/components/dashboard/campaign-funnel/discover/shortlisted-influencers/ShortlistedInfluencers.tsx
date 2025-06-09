// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import { Campaign } from '@/services/campaign/campaign.service';
import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import { ASSIGNMENT_STATUS } from '@/services/list-assignments/list-assignment.server';
import OutreachMessageForm from './OutreachMessageForm';
import ShortlistedTable from './ShortlistedTable';
import ShortlistedAnalytics from './ShortlistedAnalytics';
import ExportButton from './ExportButton';

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
  const [isOutreachFormOpen, setIsOutreachFormOpen] = useState(false);
  
  // API Integration States
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isProcessingOutreach, setIsProcessingOutreach] = useState(false);
  
  // Ensure shortlistedMembers has proper structure
  const members = shortlistedMembers?.members || [];

  /**
   * Check if a message template exists for the current campaign
   */
  const hasMessageTemplateForCampaign = (): boolean => {
    if (!campaignData?.id) {
      return false;
    }
    
    // Check both the fetched templates and campaign's message_templates
    const fetchedTemplateExists = messageTemplates.some(template => template.campaign_id === campaignData.id);
    const campaignTemplateExists = campaignData.message_templates && campaignData.message_templates.length > 0;
    
    return fetchedTemplateExists || campaignTemplateExists;
  };

  /**
   * Check if list assignments exist for the current campaign
   */
  const hasListAssignmentsForCampaign = (): boolean => {
    if (!campaignData?.list_assignments) {
      return false;
    }
    
    return campaignData.list_assignments.length > 0;
  };

  /**
   * Get the appropriate button configuration based on templates and assignments
   */
  const getOutreachButtonConfig = () => {
    const hasTemplate = hasMessageTemplateForCampaign();
    const hasAssignments = hasListAssignmentsForCampaign();

    if (!hasTemplate) {
      // Case 1: No message template exists
      return {
        label: 'Start Outreach',
        action: 'open-form',
        variant: 'primary'
      };
    } else if (hasAssignments) {
      // Case 2: Template exists AND assignments exist
      const assignments = campaignData?.list_assignments || [];
      
      // Group assignments by status categories
      const statusGroups = {
        running: assignments.filter(a => ['pending', 'active'].includes(a.status?.name?.toLowerCase())),
        paused: assignments.filter(a => a.status?.name?.toLowerCase() === 'paused'),
        failed: assignments.filter(a => a.status?.name?.toLowerCase() === 'failed'),
        finished: assignments.filter(a => ['completed', 'cancelled', 'expired'].includes(a.status?.name?.toLowerCase()))
      };

      // Priority logic for button state:
      // 1. If any assignment is running (pending/active) -> Show "Pause Outreach"
      // 2. If any assignment is paused -> Show "Resume Outreach" 
      // 3. If any assignment failed -> Show "Retry Outreach"
      // 4. If all are finished (completed/cancelled/expired) -> Show "Start New Outreach"
      // 5. If mixed states -> Show "Manage Outreach"

      if (statusGroups.running.length > 0) {
        return {
          label: 'Pause Outreach',
          action: 'pause-outreach',
          variant: 'warning'
        };
      } else if (statusGroups.paused.length > 0 && statusGroups.failed.length === 0) {
        return {
          label: 'Resume Outreach',
          action: 'resume-outreach',
          variant: 'success'
        };
      } else if (statusGroups.failed.length > 0) {
        return {
          label: 'Retry Outreach',
          action: 'retry-outreach',
          variant: 'info'
        };
      } else if (statusGroups.finished.length === assignments.length && assignments.length > 0) {
        return {
          label: 'Start New Outreach',
          action: 'start-new',
          variant: 'primary'
        };
      } else if (assignments.length > 1 && (statusGroups.paused.length + statusGroups.failed.length + statusGroups.finished.length) > 1) {
        return {
          label: 'Manage Outreach',
          action: 'manage-outreach',
          variant: 'secondary'
        };
      } else {
        return {
          label: 'Start Outreach',
          action: 'start-existing',
          variant: 'primary'
        };
      }
    } else {
      // Case 3: Template exists BUT no assignments
      return {
        label: 'Start Outreach',
        action: 'start-existing',
        variant: 'primary'
      };
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

  /**
   * API Function: Create list assignment via server-side API
   */
  const createListAssignmentAPI = async (listId: string) => {
    try {
      console.log(`🔄 Creating list assignment for list: ${listId}`);
      
      const response = await fetch('/api/v0/list-assignments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          list_id: listId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create assignment: ${response.status}`);
      }

      const assignment = await response.json();
      console.log('✅ List assignment created successfully:', assignment);
      return assignment;
    } catch (error) {
      console.error('❌ Error creating list assignment:', error);
      throw error;
    }
  };

  /**
   * API Function: Update assignment status via server-side API
   */
  const updateAssignmentStatusAPI = async (assignmentId: string, statusId: string) => {
    try {
      console.log(`🔄 Updating assignment ${assignmentId} status to: ${statusId}`);
      
      const response = await fetch(`/api/v0/list-assignments/${assignmentId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status_id: statusId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update assignment status: ${response.status}`);
      }

      const assignment = await response.json();
      console.log('✅ Assignment status updated successfully:', assignment);
      return assignment;
    } catch (error) {
      console.error('❌ Error updating assignment status:', error);
      throw error;
    }
  };

  /**
   * Handle Start Outreach button click - Enhanced logic for all new status types
   */
  const handleStartOutreach = async () => {
    const buttonConfig = getOutreachButtonConfig();
    setIsProcessingOutreach(true);

    try {
      switch (buttonConfig.action) {
        case 'open-form':
          // Case 1: No template exists - show the form to create one
          console.log('No message template found for campaign:', campaignData?.id);
          setIsOutreachFormOpen(true);
          break;
          
        case 'pause-outreach':
          // Case 2: Running assignments exist - pause them
          console.log('Pausing outreach for campaign:', campaignData?.id);
          await handlePauseOutreach();
          break;
          
        case 'resume-outreach':
          // Case 3: Paused assignments exist - resume them
          console.log('Resuming outreach for campaign:', campaignData?.id);
          await handleResumeOutreach();
          break;
          
        case 'retry-outreach':
          // Case 4: Failed assignments exist - retry them
          console.log('Retrying outreach for campaign:', campaignData?.id);
          await handleRetryOutreach();
          break;
          
        case 'start-new':
          // Case 5: All assignments are finished - create new ones
          console.log('Starting new outreach for campaign:', campaignData?.id);
          // await handleStartNewOutreach();
          break;

        case 'manage-outreach':
          // Case 6: Mixed statuses - show management options
          console.log('Managing outreach for campaign:', campaignData?.id);
          await handleManageOutreach();
          break;
          
        case 'start-existing':
          // Case 7: Template exists but no assignments - start with existing template
          console.log('Starting outreach with existing template for campaign:', campaignData?.id);
          await handleStartExistingOutreach();
          break;
          
        default:
          console.warn('Unknown button action:', buttonConfig.action);
      }
    } catch (error) {
      console.error('Error processing outreach action:', error);
      alert('An error occurred while processing the outreach action');
    } finally {
      setIsProcessingOutreach(false);
    }
  };

  /**
   * Handle Pause Outreach functionality - Pause running assignments (pending/active -> paused)
   */
  const handlePauseOutreach = async () => {
    console.log('⏸️ Pause Outreach function called');
    
    if (!campaignData?.list_assignments || campaignData.list_assignments.length === 0) {
      console.error('No list assignments found to pause');
      alert('No list assignments found to pause');
      return;
    }

    try {
      // Find running assignments (pending or active) and pause them
      const runningAssignments = campaignData.list_assignments.filter(
        assignment => {
          const statusName = assignment.status?.name?.toLowerCase();
          return statusName === 'pending' || statusName === 'active';
        }
      );

      if (runningAssignments.length === 0) {
        console.log('No running assignments found');
        alert('No running assignments found to pause');
        return;
      }

      console.log(`Pausing ${runningAssignments.length} running assignments`);

      // Pause all running assignments by setting them to paused
      const pausePromises = runningAssignments.map(assignment => 
        updateAssignmentStatusAPI(assignment.id, 'paused')
      );

      await Promise.all(pausePromises);

      console.log('✅ All assignments paused successfully');
      alert('Outreach has been paused successfully');
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('❌ Error pausing outreach:', error);
      alert(`Failed to pause outreach: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Handle Resume Outreach functionality - Resume paused assignments (paused -> active)
   */
  const handleResumeOutreach = async () => {
    console.log('▶️ Resume Outreach function called');
    
    if (!campaignData?.list_assignments || campaignData.list_assignments.length === 0) {
      console.error('No list assignments found to resume');
      alert('No list assignments found to resume');
      return;
    }

    try {
      // Find paused assignments and resume them
      const pausedAssignments = campaignData.list_assignments.filter(
        assignment => assignment.status?.name?.toLowerCase() === 'paused'
      );

      if (pausedAssignments.length === 0) {
        console.log('No paused assignments found');
        alert('No paused assignments found to resume');
        return;
      }

      console.log(`Resuming ${pausedAssignments.length} paused assignments`);

      // Resume all paused assignments by setting them to active
      const resumePromises = pausedAssignments.map(assignment => 
        updateAssignmentStatusAPI(assignment.id, 'active')
      );

      await Promise.all(resumePromises);

      console.log('✅ All assignments resumed successfully');
      alert('Outreach has been resumed successfully');
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('❌ Error resuming outreach:', error);
      alert(`Failed to resume outreach: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Handle Retry Outreach functionality - Retry failed assignments (failed -> pending)
   */
  const handleRetryOutreach = async () => {
    console.log('🔄 Retry Outreach function called');
    
    if (!campaignData?.list_assignments || campaignData.list_assignments.length === 0) {
      console.error('No list assignments found to retry');
      alert('No list assignments found to retry');
      return;
    }

    try {
      // Find failed assignments and retry them
      const failedAssignments = campaignData.list_assignments.filter(
        assignment => assignment.status?.name?.toLowerCase() === 'failed'
      );

      if (failedAssignments.length === 0) {
        console.log('No failed assignments found');
        alert('No failed assignments found to retry');
        return;
      }

      console.log(`Retrying ${failedAssignments.length} failed assignments`);

      // Retry all failed assignments by setting them to pending
      const retryPromises = failedAssignments.map(assignment => 
        updateAssignmentStatusAPI(assignment.id, 'pending')
      );

      await Promise.all(retryPromises);

      console.log('✅ All assignments retried successfully');
      alert('Failed outreach has been queued for retry');
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('❌ Error retrying outreach:', error);
      alert(`Failed to retry outreach: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Handle Manage Outreach functionality - Show status breakdown for mixed states
   */
  const handleManageOutreach = async () => {
    console.log('⚙️ Manage Outreach function called');
    
    if (!campaignData?.list_assignments || campaignData.list_assignments.length === 0) {
      alert('No list assignments found to manage');
      return;
    }

    // Count assignments by status
    const statusCounts = campaignData.list_assignments.reduce((acc, assignment) => {
      const status = assignment.status?.name?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Create status breakdown message
    const statusBreakdown = Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join('\n');

    const message = `Outreach Status Breakdown:\n\n${statusBreakdown}\n\nWould you like to:\n- Pause all running assignments\n- Resume all paused assignments\n- Retry all failed assignments\n- Create new assignments`;

    // For now, just show the breakdown. In a real app, you might show a modal with action buttons
    alert(message);
  };

  /**
   * Handle Start Existing Outreach functionality - API call to create/activate assignments
   */
  const handleStartExistingOutreach = async () => {
    console.log('▶️ Start Existing Outreach function called');
    
    if (!campaignData?.campaign_lists || campaignData.campaign_lists.length === 0) {
      console.error('No campaign lists found to start outreach');
      alert('No campaign lists found. Please create a campaign list first.');
      return;
    }

    try {
      const existingAssignments = campaignData?.list_assignments || [];
      
      // Check if we have existing assignments that are inactive
      const inactiveAssignments = existingAssignments.filter(
        assignment => {
          const statusName = assignment.status?.name?.toLowerCase();
          return statusName === 'inactive' || statusName === 'stopped';
        }
      );

      if (inactiveAssignments.length > 0) {
        // Reactivate existing inactive assignments
        console.log(`Reactivating ${inactiveAssignments.length} inactive assignments`);
        
        const activatePromises = inactiveAssignments.map(assignment => 
          updateAssignmentStatusAPI(assignment.id, 'pending')
        );

        await Promise.all(activatePromises);
        
        console.log('✅ Existing assignments reactivated successfully');
        alert('Outreach has been started successfully');
      } else {
        // Create new assignments for each campaign list
        console.log(`Creating assignments for ${campaignData.campaign_lists.length} campaign lists`);
        
        const createPromises = campaignData.campaign_lists.map(list => 
          createListAssignmentAPI(list.id)
        );

        const results = await Promise.all(createPromises);
        
        console.log('✅ New assignments created successfully:', results);
        alert('Outreach has been started successfully');
      }
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('❌ Error starting outreach:', error);
      alert(`Failed to start outreach: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        headers: getAuthHeaders()
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: data.subject,
          content: data.message,
          company_id: campaignData.company_id,
          campaign_id: campaignData.id,
          is_global: true,
          auto_assign_agent: true,
          target_list_id: campaignData?.campaign_lists[0]?.id
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

  // Get the current button configuration
  const buttonConfig = getOutreachButtonConfig();

  return (
    <div className="space-y-6">
      {/* Search Box and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-8/12">
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
          
          {/* Export Button - Added before Start Outreach */}
          <ExportButton 
            members={members}
            campaignName={campaignData?.name}
            selectedMembers={selectedInfluencers.length > 0 ? members.filter(member => selectedInfluencers.includes(member.id ?? '')) : undefined}
          />
          
          {/* Enhanced Outreach Button with all status variants */}
          <button 
            onClick={handleStartOutreach}
            disabled={isProcessingOutreach}
            className={`px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 ${
              buttonConfig.variant === 'danger' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : buttonConfig.variant === 'warning'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : buttonConfig.variant === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : buttonConfig.variant === 'info'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : buttonConfig.variant === 'secondary'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isProcessingOutreach ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Processing...
              </div>
            ) : (
              buttonConfig.label
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex space-x-6" style={{ minHeight: '750px' }}>
        {/* Influencers Table Component */}
        <ShortlistedTable
          shortlistedMembers={shortlistedMembers}
          isLoading={isLoading}
          searchText={searchText}
          selectedInfluencers={selectedInfluencers}
          removingInfluencers={removingInfluencers}
          onInfluencerRemoved={onInfluencerRemoved}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSelectionChange={setSelectedInfluencers}
          onRemovingChange={setRemovingInfluencers}
        />
        
        {/* Analytics Component - Simplified without export button */}
        <ShortlistedAnalytics 
          members={members} 
        />
      </div>

      {/* Outreach Message Form - Only show when action is 'open-form' */}
      {buttonConfig.action === 'open-form' && (
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