  // src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers.tsx

  'use client';

  import { useState, useEffect, useCallback } from 'react';
  import { Search } from 'react-feather';
  import { Campaign } from '@/types/campaign';
  import { CampaignListMember, CampaignListMembersResponse, removeInfluencerFromList, addInfluencerToList } from '@/services/campaign/campaign-list.service';
  import { executeBulkAssignments } from '@/services/bulk-assignments/bulk-assignments.service';
  import { BulkAssignmentRequest } from '@/types/bulk-assignments';
  import { MessageTemplate, CreateMessageTemplateWithFollowupsRequest } from '@/types/message-templates';
  import { 
    createMessageTemplateWithFollowups,
    getMessageTemplatesByCampaignWithFollowups
  } from '@/services/message-templates/message-templates.client';
  import OutreachMessageForm from './OutreachMessageForm';
  import ShortlistedTable from './ShortlistedTable';
  import ExportButton from './ExportButton';
  import ImportCsvButton from './ImportCsvButton';
  import { getCreatorProfile } from '@/services/ensembledata/creator-profile';
  import { Platform } from '@/types/platform';

  interface ShortlistedInfluencersProps {
    campaignData?: Campaign | null;
    shortlistedMembers: CampaignListMembersResponse;
    isLoading: boolean;
    onInfluencerRemoved?: () => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    selectedPlatform?: Platform | null;
    onInfluencerAdded?: () => void;
  }

  const ShortlistedInfluencers: React.FC<ShortlistedInfluencersProps> = ({ 
    campaignData = null,
    shortlistedMembers,
    isLoading = false,
    onInfluencerRemoved,
    onPageChange,
    onPageSizeChange,
    selectedPlatform = null,
    onInfluencerAdded
  }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
    const [removingInfluencers, setRemovingInfluencers] = useState<string[]>([]);
    const [isOutreachFormOpen, setIsOutreachFormOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    
    const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isProcessingOutreach, setIsProcessingOutreach] = useState(false);
    
    const members = shortlistedMembers?.influencers || [];

    const handleVisibleColumnsChange = useCallback((columns: string[]) => {
      setVisibleColumns(columns);
    }, []);

    const handleImportInfluencer = async (username: string): Promise<boolean> => {
      try {
        if (!campaignData || !campaignData.campaign_lists || !campaignData.campaign_lists.length) {
          return false;
        }

        if (!selectedPlatform || !selectedPlatform.id) {
          return false;
        }

        const profileResponse = await getCreatorProfile({
          username: username,
          platform: 'instagram',
          include_detailed_info: true
        });

        if (!profileResponse.success || !profileResponse.data) {
          return false;
        }

        const influencerData = profileResponse.data;
        const listId = campaignData.campaign_lists[0].id;
        const platformId = selectedPlatform.id;

        const addResponse = await addInfluencerToList(listId, influencerData, platformId);

        if (addResponse) {
          if (onInfluencerAdded) {
            onInfluencerAdded();
          }
          return true;
        }

        return false;
      } catch (error) {
        return false;
      }
    };

    const hasMessageTemplateForCampaign = (): boolean => {
      if (!campaignData?.id) {
        return false;
      }
      
      const fetchedTemplateExists = messageTemplates.some(template => template.campaign_id === campaignData.id);
      const campaignTemplateExists = campaignData.message_templates && campaignData.message_templates.length > 0;
      
      return fetchedTemplateExists || campaignTemplateExists;
    };

    const hasListAssignmentsForCampaign = (): boolean => {
      if (!campaignData?.list_assignments) {
        return false;
      }
      
      return campaignData.list_assignments.length > 0;
    };

    const getOutreachButtonConfig = () => {
      const hasTemplate = hasMessageTemplateForCampaign();
      const hasAssignments = hasListAssignmentsForCampaign();

      if (!hasTemplate) {
        return {
          label: 'Start Outreach',
          action: 'open-form',
          variant: 'primary',
          disabled: isProcessingOutreach
        };
      } else if (hasAssignments) {
        const assignments = campaignData?.list_assignments || [];
        
        const statusGroups = {
          running: assignments.filter(a => ['pending', 'active'].includes(a.status?.name?.toLowerCase())),
          paused: assignments.filter(a => a.status?.name?.toLowerCase() === 'paused'),
          failed: assignments.filter(a => a.status?.name?.toLowerCase() === 'failed'),
          finished: assignments.filter(a => ['completed', 'cancelled', 'expired'].includes(a.status?.name?.toLowerCase()))
        };

        if (statusGroups.running.length > 0 || statusGroups.paused.length > 0 || statusGroups.failed.length > 0) {
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
        return {
          label: 'Start Outreach',
          action: 'start-with-existing',
          variant: 'primary',
          disabled: isProcessingOutreach
        };
      }
    };

    const saveMessageTemplate = async (data: { subject: string; message: string }) => {
      if (!campaignData?.company_id || !campaignData?.id) {
        throw new Error('Missing required campaign data');
      }

      const requestData: CreateMessageTemplateWithFollowupsRequest = {
        subject: data.subject,
        content: data.message,
        company_id: campaignData.company_id,
        campaign_id: campaignData.id,
        template_type: 'initial',
        is_global: true,
        generate_followups: true
      };

      const createdTemplate = await createMessageTemplateWithFollowups(requestData);
      await fetchMessageTemplates();
      
      const updatedTemplate = messageTemplates.find(t => t.id === createdTemplate.id) || createdTemplate;
      
      if (updatedTemplate.followup_templates && updatedTemplate.followup_templates.length > 0) {
        console.log(`AI generated ${updatedTemplate.followup_templates.length} followup templates:`);
        updatedTemplate.followup_templates.forEach((followup, index) => {
          const days = Math.round(followup.followup_delay_hours / 24);
          console.log(`   ${index + 1}. "${followup.subject}" (${days} day${days !== 1 ? 's' : ''} delay)`);
        });
      }
      
      return updatedTemplate;
    };

    const executeBulkAssignmentsForCampaign = async () => {
      if (!campaignData?.id) {
        throw new Error('Campaign ID not available');
      }

      const bulkAssignmentData: BulkAssignmentRequest = {
        campaign_list_id: campaignData.campaign_lists[0].id,
        strategy: "round_robin",
        preferred_agent_ids: null,
        max_influencers_per_agent: 20,
        force_new_assignments: false
      };

      const result = await executeBulkAssignments(bulkAssignmentData);
      return result;
    };

    const handleStartOutreach = async () => {
      const buttonConfig = getOutreachButtonConfig();
      
      try {
        switch (buttonConfig.action) {
          case 'open-form':
            setIsOutreachFormOpen(true);
            break;
            
          case 'start-with-existing':
            setIsProcessingOutreach(true);
            await handleStartWithExistingTemplate();
            break;
            
          case 'manage-outreach':
            handleManageOutreach();
            break;
        }
      } catch (error) {
        console.error('Error processing outreach action:', error);
      } finally {
        if (buttonConfig.action === 'start-with-existing') {
          setIsProcessingOutreach(false);
        }
      }
    };

    const handleFormSubmit = async (templateData: { subject: string; message: string }) => {
      try {
        setIsSavingTemplate(true);
        setIsProcessingOutreach(true);
        
        const savedTemplate = await saveMessageTemplate(templateData);
        const result = await executeBulkAssignmentsForCampaign();
        
        let successMessage = `🎉 Outreach Campaign Started Successfully!\n\n`;
        successMessage += `📊 Campaign Metrics:\n`;
        successMessage += `• ${result.total_influencers} influencers assigned to ${result.total_agents} agents\n\n`;
        successMessage += `📝 Message Template Created:\n`;
        successMessage += `• Subject: "${savedTemplate.subject}"\n`;
        
        if (savedTemplate.followup_templates && savedTemplate.followup_templates.length > 0) {
          successMessage += `• Main template + ${savedTemplate.followup_templates.length} AI-generated followups\n`;
          successMessage += `• Automated follow-up sequence activated\n\n`;
          
          successMessage += `🤖 AI Follow-up Schedule:\n`;
          savedTemplate.followup_templates.forEach((followup, index) => {
            const days = Math.round(followup.followup_delay_hours / 24);
            successMessage += `   ${index + 1}. "${followup.subject}" (${days} day${days !== 1 ? 's' : ''})\n`;
          });
          successMessage += `\n✨ Your campaign now has intelligent, automated follow-ups!`;
        } else {
          successMessage += `• Single template created (manual follow-ups)\n`;
          successMessage += `\nℹ️ Note: AI follow-up generation was not available, but your campaign is fully active.`;
        }
        
        alert(successMessage);
        setIsOutreachFormOpen(false);
        
        if (onInfluencerRemoved) {
          onInfluencerRemoved();
        }
        
      } catch (error) {
        console.error('Error in form submission:', error);
        
        let errorMessage = 'Failed to start outreach campaign.';
        
        if (error instanceof Error) {
          if (error.message.includes('AI Generation Failed') || error.message.includes('AI service error')) {
            errorMessage = `⚠️ Campaign Status: ${error.message}\n\nYour campaign may still be active. Check the templates section and consider creating follow-ups manually if needed.`;
          } else if (error.message.includes('Missing required')) {
            errorMessage = `❌ Setup Error: ${error.message}\n\nPlease check your campaign configuration and try again.`;
          } else if (error.message.includes('bulk assignments')) {
            errorMessage = `❌ Assignment Error: ${error.message}\n\nTemplate was created but influencer assignments failed. You can retry assignments from the campaign dashboard.`;
          } else {
            errorMessage = `❌ ${error.message}`;
          }
        }
        
        alert(errorMessage);
        
      } finally {
        setIsSavingTemplate(false);
        setIsProcessingOutreach(false);
      }
    };

    const handleStartWithExistingTemplate = async () => {
      try {
        const result = await executeBulkAssignmentsForCampaign();
        
        alert(
          `Outreach started successfully! ${result.total_influencers} influencers assigned to ${result.total_agents} agents.`
        );
        
        if (onInfluencerRemoved) {
          onInfluencerRemoved();
        }
        
      } catch (error) {
        console.error('Error starting outreach with existing template:', error);
        throw error;
      }
    };

    const handleManageOutreach = () => {
      if (!campaignData?.list_assignments || campaignData.list_assignments.length === 0) {
        return;
      }

      const statusCounts = campaignData.list_assignments.reduce((acc, assignment) => {
        const status = assignment.status?.name?.toLowerCase() || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusBreakdown = Object.entries(statusCounts)
        .map(([status, count]) => `${status}: ${count}`)
        .join('\n');

      const message = `Outreach Status Breakdown:\n\n${statusBreakdown}\n\nUse the campaign management tools to modify outreach status.`;
    };

    const fetchMessageTemplates = async () => {
      if (!campaignData?.id) {
        return;
      }

      setIsLoadingTemplates(true);
      try {
        const templates = await getMessageTemplatesByCampaignWithFollowups(campaignData.id);
        
        templates.forEach((template) => {
          if (template.followup_templates && template.followup_templates.length > 0) {
            console.log(`Template "${template.subject}" has ${template.followup_templates.length} followups`);
          }
        });
        
        setMessageTemplates(templates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setMessageTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    useEffect(() => {
      if (campaignData?.id) {
        fetchMessageTemplates();
      }
    }, [campaignData?.id]);

    const handleBulkRemove = async () => {
      if (selectedInfluencers.length === 0) return;

      const selectedMembers = members.filter(member => 
        selectedInfluencers.includes(member.id ?? '')
      );

      if (selectedMembers.length === 0) {
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
      } finally {
        setRemovingInfluencers([]);
      }
    };

    const buttonConfig = getOutreachButtonConfig();

    return (
      <div className="space-y-6">
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
            
            <ImportCsvButton 
              onImportInfluencer={handleImportInfluencer}
              disabled={!selectedPlatform}
            />
            
            <ExportButton 
              members={members}
              campaignName={campaignData?.name}
              selectedMembers={selectedInfluencers.length > 0 ? members.filter(member => selectedInfluencers.includes(member.id ?? '')) : undefined}
              visibleColumns={visibleColumns}
            />
            
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
        
        <div className="flex space-x-6" style={{ minHeight: '750px' }}>
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
            onVisibleColumnsChange={handleVisibleColumnsChange}
          />
        </div>

        <OutreachMessageForm 
          isOpen={isOutreachFormOpen}
          onClose={() => {
            setIsOutreachFormOpen(false);
          }}
          onSubmit={handleFormSubmit}
          messageTemplates={messageTemplates}
          isLoadingTemplates={isLoadingTemplates}
          isSavingTemplate={isSavingTemplate}
        />
      </div>
    );
  };

  export default ShortlistedInfluencers;