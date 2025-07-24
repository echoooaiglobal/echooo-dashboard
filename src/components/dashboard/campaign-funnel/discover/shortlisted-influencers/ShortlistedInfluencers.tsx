// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import { Campaign } from '@/types/campaign';
import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import { executeBulkAssignments } from '@/services/bulk-assignments/bulk-assignments.service';
import { BulkAssignmentRequest } from '@/types/bulk-assignments';
import OutreachMessageForm from './OutreachMessageForm';
import ShortlistedTable from './ShortlistedTable';
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
  const members = shortlistedMembers?.influencers || [];
  console.log('Shortlisted Influencers:', members);

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
        variant: 'primary',
        disabled: isProcessingOutreach
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

      if (statusGroups.running.length > 0) {
        return {
          label: 'Manage Outreach',
          action: 'manage-outreach',
          variant: 'secondary',
          disabled: isProcessingOutreach
        };
      } else if (statusGroups.paused.length > 0) {
        return {
          label: 'Manage Outreach',
          action: 'manage-outreach',
          variant: 'secondary',
          disabled: isProcessingOutreach
        };
      } else if (statusGroups.failed.length > 0) {
        return {
          label: 'Manage Outreach',
          action: 'manage-outreach',
          variant: 'secondary',
          disabled: isProcessingOutreach
        };
      } else {
        return {
          label: 'Start New Outreach',
          action: 'open-form',
          variant: 'primary',
          disabled: isProcessingOutreach
        };
      }
    } else {
      // Case 3: Template exists BUT no assignments
      return {
        label: 'Start Outreach',
        action: 'start-with-existing',
        variant: 'primary',
        disabled: isProcessingOutreach
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
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  };

  /**
   * API Function: Save message template
   */
  const saveMessageTemplate = async (data: { subject: string; message: string }) => {
    if (!campaignData?.company_id || !campaignData?.id) {
      console.error('Missing company_id or campaign_id for saving template');
      throw new Error('Missing required campaign data');
    }

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
          is_global: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const newTemplate = await response.json();
      console.log('✅ Template saved successfully:', newTemplate);
      
      // Refresh the templates list
      await fetchMessageTemplates();
      return newTemplate;
    } catch (error) {
      console.error('❌ Error saving template:', error);
      throw error;
    }
  };

  /**
   * Execute bulk assignments for the campaign
   */
  const executeBulkAssignmentsForCampaign = async () => {
    if (!campaignData?.id) {
      throw new Error('Campaign ID not available');
    }

    const bulkAssignmentData: BulkAssignmentRequest = {
      campaign_list_id: campaignData.id,
      strategy: "round_robin",
      preferred_agent_ids: null,
      max_influencers_per_agent: 20,
      force_new_assignments: false
    };

    console.log('🚀 Executing bulk assignments:', bulkAssignmentData);
    
    const result = await executeBulkAssignments(bulkAssignmentData);
    
    console.log('✅ Bulk assignments completed:', result);
    return result;
  };

  /**
   * Handle Start Outreach button click
   */
  const handleStartOutreach = async () => {
    const buttonConfig = getOutreachButtonConfig();
    
    try {
      switch (buttonConfig.action) {
        case 'open-form':
          // Just open form to create template - no loading state needed
          setIsOutreachFormOpen(true);
          break;
          
        case 'start-with-existing':
          // Start with existing template - set loading state for this action
          setIsProcessingOutreach(true);
          await handleStartWithExistingTemplate();
          break;
          
        case 'manage-outreach':
          // Handle management of existing outreach - no loading needed
          handleManageOutreach();
          break;
          
        default:
          console.warn('Unknown button action:', buttonConfig.action);
      }
    } catch (error) {
      console.error('Error processing outreach action:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Only reset loading if we actually set it
      if (buttonConfig.action === 'start-with-existing') {
        setIsProcessingOutreach(false);
      }
    }
  };

  /**
   * Handle form submission: Save template + Execute bulk assignments
   */
  const handleFormSubmit = async (templateData: { subject: string; message: string }) => {
    try {
      // Set loading states when form is actually submitted
      setIsSavingTemplate(true);
      setIsProcessingOutreach(true);
      
      // Step 1: Save the message template
      console.log('💾 Saving message template...');
      await saveMessageTemplate(templateData);
      
      // Step 2: Execute bulk assignments
      console.log('🚀 Starting bulk assignments...');
      const result = await executeBulkAssignmentsForCampaign();
      
      // Show success message
      alert(
        `Outreach started successfully! ${result.total_influencers} influencers assigned to ${result.total_agents} agents.`
      );
      
      // Close the form
      setIsOutreachFormOpen(false);
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
      
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      
      let errorMessage = 'Failed to start outreach. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      // Reset both loading states
      setIsSavingTemplate(false);
      setIsProcessingOutreach(false);
    }
  };

  /**
   * Handle starting outreach with existing template
   */
  const handleStartWithExistingTemplate = async () => {
    try {
      console.log('🚀 Starting outreach with existing template...');
      const result = await executeBulkAssignmentsForCampaign();
      
      alert(
        `Outreach started successfully! ${result.total_influencers} influencers assigned to ${result.total_agents} agents.`
      );
      
      // Refresh campaign data
      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
      
    } catch (error) {
      console.error('❌ Error starting outreach with existing template:', error);
      throw error;
    }
  };

  /**
   * Handle manage outreach functionality
   */
  const handleManageOutreach = () => {
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

    const message = `Outreach Status Breakdown:\n\n${statusBreakdown}\n\nUse the campaign management tools to modify outreach status.`;
    alert(message);
  };

  /**
   * API Function: Fetch message templates by company
   */
  const fetchMessageTemplates = async () => {
    if (!campaignData?.company_id) {
      return;
    }

    setIsLoadingTemplates(true);
    try {
      const response = await fetch(`/api/v0/message-templates/company/${campaignData.company_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const templates = await response.json();
        setMessageTemplates(templates);
        console.log('✅ Templates fetched successfully:', templates);
      } else {
        setMessageTemplates([]);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      setMessageTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Fetch templates when component mounts or campaignData changes
  useEffect(() => {
    if (campaignData?.company_id) {
      fetchMessageTemplates();
    }
  }, [campaignData?.company_id]);

  /**
   * Handle bulk remove selected influencers
   */
  const handleBulkRemove = async () => {
    if (selectedInfluencers.length === 0) return;

    const selectedMembers = members.filter(member => 
      selectedInfluencers.includes(member.id ?? '')
    );

    if (selectedMembers.length === 0) {
      alert('No valid members selected for removal');
      return;
    }

    setRemovingInfluencers(prev => [...prev, ...selectedInfluencers]);

    try {
      const promises = selectedMembers.map(member => {
        if (!member.id) {
          return Promise.reject(new Error(`Invalid data for member: ${member.social_account?.full_name}`));
        }
        return removeInfluencerFromList(member.id);
      });
      
      const results = await Promise.allSettled(promises);
      
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
        alert(`Successfully removed ${successCount} influencers. Failed to remove ${failures.length} influencers.`);
        
        if (onInfluencerRemoved && successCount > 0) {
          onInfluencerRemoved();
        }
      }
    } catch (error) {
      console.error('Error in bulk remove:', error);
      alert('An error occurred during bulk removal');
    } finally {
      setRemovingInfluencers([]);
    }
  };

  // Get the current button configuration
  const buttonConfig = getOutreachButtonConfig();

  return (
    <div className="space-y-6">
      {/* Search Box and Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-6/12">
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
          
          {/* Export Button */}
          <ExportButton 
            members={members}
            campaignName={campaignData?.name}
            selectedMembers={selectedInfluencers.length > 0 ? members.filter(member => selectedInfluencers.includes(member.id ?? '')) : undefined}
          />
          
          {/* Start Outreach Button */}
          <button 
            onClick={() => handleStartOutreach()}
            disabled={buttonConfig.disabled}
            className={`px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 ${
              buttonConfig.variant === 'secondary'
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
      </div>

      {/* Outreach Message Form */}
      <OutreachMessageForm 
        isOpen={isOutreachFormOpen}
        onClose={() => {
          setIsOutreachFormOpen(false);
          // Don't reset processing state here - let form handle its own state
        }}
        onSubmit={handleFormSubmit}
        messageTemplates={messageTemplates}
        isLoadingTemplates={isLoadingTemplates}
        isSavingTemplate={isSavingTemplate} // Only pass template saving state, not processing state
      />
    </div>
  );
};

export default ShortlistedInfluencers;