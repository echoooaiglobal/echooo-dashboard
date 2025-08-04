// src/components/dashboard/platform/components/MembersTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { AgentAssignment, MessageTemplate } from '@/types/assignments';
import { Status } from '@/types/statuses';
import { recordContactAttempt } from '@/services/assignments/assignments.service';
import { 
  updateCampaignInfluencerStatus,
  updateCampaignInfluencerPrice
} from '@/services/campaign-influencers/campaign-influencers.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import InlineSpinner from '@/components/ui/InlineSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
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
  ExternalLink,
  CheckCircle,
  Clock,
  Star,
  Archive,
  Activity,
  XCircle,
  Copy,
  Check,
  Edit2,
  DollarSign,
  Save,
  ChevronDown,
  MessageSquare,
  FileText
} from 'react-feather';

// Import API service for price and status updates

type InfluencerType = 'active' | 'archived' | 'completed';

interface MembersTableProps {
  members: AssignmentInfluencer[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditCampaignStatus: (member: AssignmentInfluencer) => void;
  onViewMember: (member: AssignmentInfluencer) => void;
  onAddContact: (member: AssignmentInfluencer) => void;
  onViewContacts: (member: AssignmentInfluencer) => void;
  availableStatuses: Status[];
  onTypeChange: (type: InfluencerType) => void;
  currentType: InfluencerType;
  assignment: AgentAssignment;
  onMemberUpdate?: (updatedMember: AssignmentInfluencer) => void;
}

// Currency options
const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
];

// Helper function to format status names
const formatStatusName = (statusName: string): string => {
  return statusName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ContactStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace('_', '');
    
    switch (normalizedStatus) {
      case 'assigned':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'contacted':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'awaitingresponse':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'responded':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'completed':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'declined':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'discovered':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      case 'unreachable':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'inforequested':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const config = getStatusConfig(status);
  const formattedLabel = formatStatusName(status);
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {formattedLabel}
    </span>
  );
};

const InlineStatusDropdown = ({ 
  influencer, 
  availableStatuses, 
  onUpdate 
}: { 
  influencer: AssignmentInfluencer;
  availableStatuses: Status[];
  onUpdate?: (updatedMember: AssignmentInfluencer) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (statusId: string) => {
    setIsUpdating(true);
    try {
      console.log('🔄 Updating status for influencer:', influencer.id, 'to status:', statusId);
      
      // Use the new dedicated status API endpoint
      const result = await updateCampaignInfluencerStatus(
        influencer.campaign_influencer_id, 
        influencer.id,
        statusId
      );
      
      console.log('✅ Status update result:', result);
      
      const foundStatus = availableStatuses.find(s => s.id === statusId);
      if (foundStatus && onUpdate) {
        // Create updated influencer object
        const updatedMember: AssignmentInfluencer = {
          ...influencer,
          campaign_influencer: {
            ...influencer.campaign_influencer,
            status: {
              id: foundStatus.id,
              name: foundStatus.name,
              model: 'campaign_influencer',
            }
          },
          updated_at: new Date().toISOString()
        };
        onUpdate(updatedMember);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <ContactStatusBadge status={influencer.campaign_influencer.status?.name || 'discovered'} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-gray-100 transition-colors group"
          title="Change status"
        >
          <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-teal-600 transition-colors" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1 max-h-60 overflow-y-auto">
              {availableStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleStatusChange(status.id)}
                  disabled={isUpdating}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 block ${
                    status.id === influencer.campaign_influencer.status?.id ? 'bg-teal-50 text-teal-700' : 'text-gray-700'
                  }`}
                >
                  {isUpdating && status.id === influencer.campaign_influencer.status?.id ? (
                    <div className="flex items-center">
                      <InlineSpinner size="sm" />
                      <span className="ml-2">Updating...</span>
                    </div>
                  ) : (
                    formatStatusName(status.name)
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EditablePrice = ({ 
  influencer, 
  onUpdate 
}: { 
  influencer: AssignmentInfluencer;
  onUpdate?: (updatedMember: AssignmentInfluencer) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(influencer.campaign_influencer.collaboration_price?.toString() || '');
  const [currency, setCurrency] = useState(influencer.campaign_influencer.currency || 'USD');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    const currentPrice = influencer.campaign_influencer.collaboration_price?.toString() || '';
    const currentCurrency = influencer.campaign_influencer.currency || 'USD';
    
    // Check if anything actually changed
    if (price === currentPrice && currency === currentCurrency) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 Updating price for influencer:', influencer.campaign_influencer_id, 'to:', price, currency);
      
      // Use the new dedicated price API endpoint
      const result = await updateCampaignInfluencerPrice(
        influencer.campaign_influencer_id || influencer.campaign_influencer_id,
        price ? parseFloat(price) : null,
        currency
      );
      
      console.log('✅ Price update result:', result);
      
      if (onUpdate) {
        // Create updated influencer object
        const updatedMember: AssignmentInfluencer = {
          ...influencer,
          campaign_influencer: {
            ...influencer.campaign_influencer,
            collaboration_price: price ? parseFloat(price) : null,
            currency: currency
          },
          updated_at: new Date().toISOString()
        };
        onUpdate(updatedMember);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error updating price:', error);
      alert(`Failed to update price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setPrice(influencer.campaign_influencer.collaboration_price?.toString() || '');
    setCurrency(influencer.campaign_influencer.currency || 'USD');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const currentCurrency = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  if (isEditing) {
    return (
      <div className="w-28 space-y-1">
        <div className="flex items-center space-x-1">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-14 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            disabled={isUpdating}
          >
            {CURRENCY_OPTIONS.map(curr => (
              <option key={curr.code} value={curr.code}>{curr.code}</option>
            ))}
          </select>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="0"
            autoFocus
            disabled={isUpdating}
          />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
          >
            <XCircle className="w-3 h-3" />
          </button>
          {isUpdating && <InlineSpinner size="sm" />}
        </div>
      </div>
    );
  }

  return (
    <div className="w-28">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-1 py-0.5 rounded transition-colors group w-full"
        title="Click to edit price"
      >
        <span className="mr-0.5">{currentCurrency.symbol}</span>
        <span>{influencer.campaign_influencer.collaboration_price || '0'}</span>
        <Edit2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
      </button>
    </div>
  );
};

const NextContactTimer = ({ nextContactAt }: { nextContactAt: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!nextContactAt) {
      setTimeLeft('N/A');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(nextContactAt).getTime();
      const difference = target - now;

      if (difference > 0) {
        setIsOverdue(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setIsUrgent(difference < 3600000); // 1 hour in milliseconds

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setIsOverdue(true);
        setIsUrgent(false);
        const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const overdueMinutes = Math.floor((Math.abs(difference) % (1000 * 60 * 60)) / (1000 * 60));
        
        if (overdueDays > 0) {
          setTimeLeft(`${overdueDays}d ${overdueHours}h overdue`);
        } else if (overdueHours > 0) {
          setTimeLeft(`${overdueHours}h ${overdueMinutes}m overdue`);
        } else {
          setTimeLeft('Overdue');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextContactAt]);

  if (!nextContactAt) {
    return <span className="text-gray-400">N/A</span>;
  }

  return (
    <span className={`font-mono text-xs ${
      isOverdue 
        ? 'text-red-600 font-semibold animate-pulse' 
        : isUrgent 
          ? 'text-orange-600 font-semibold animate-pulse bg-orange-50 px-1 py-0.5 rounded' 
          : 'text-blue-600'
    }`}>
      {timeLeft}
    </span>
  );
};

const EditableAttempts = ({ 
  member, 
  onUpdate 
}: { 
  member: AssignmentInfluencer;
  onUpdate?: (updatedMember: AssignmentInfluencer) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canMakeAttempt = () => {
    if (!member.next_contact_at) return true;
    const now = new Date().getTime();
    const nextContact = new Date(member.next_contact_at).getTime();
    return now >= nextContact;
  };

  const handleRecordAttempt = async () => {
    if (!canMakeAttempt()) {
      alert('Cannot make contact attempt yet. Please wait for the next contact time.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await recordContactAttempt(member.id);
      
      if (response.success && response.assigned_influencer) {
        const updatedMember: AssignmentInfluencer = {
          ...member,
          id: response.assigned_influencer.id,
          status_id: response.assigned_influencer.status_id,
          attempts_made: response.assigned_influencer.attempts_made,
          last_contacted_at: response.assigned_influencer.last_contacted_at,
          next_contact_at: response.assigned_influencer.next_contact_at,
          responded_at: response.assigned_influencer.responded_at,
          updated_at: response.assigned_influencer.updated_at,
          status: {
            ...member.status,
            ...response.assigned_influencer.status
          },
          campaign_influencer: {
            ...member.campaign_influencer,
            ...response.assigned_influencer.campaign_influencer,
            total_contact_attempts: response.assigned_influencer.campaign_influencer?.total_contact_attempts || member.campaign_influencer.total_contact_attempts,
            social_account: response.assigned_influencer.campaign_influencer?.social_account || member.campaign_influencer.social_account
          }
        };
        
        onUpdate?.(updatedMember);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to record contact attempt');
      }
    } catch (error) {
      console.error('Error recording contact attempt:', error);
      alert('Failed to record contact attempt. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const isDisabled = !canMakeAttempt();

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-blue-600">Record attempt?</div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleRecordAttempt}
            disabled={isUpdating}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isUpdating ? 'Recording...' : 'Yes'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          {isUpdating && <InlineSpinner size="sm" />}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => !isDisabled && setIsEditing(true)}
      disabled={isDisabled}
      className={`flex items-center text-xs px-1 py-0.5 rounded transition-colors ${
        isDisabled 
          ? 'text-gray-400 cursor-not-allowed opacity-60' 
          : 'hover:text-blue-600 hover:bg-blue-50'
      }`}
      title={isDisabled ? 'Cannot make contact attempt until next contact time' : 'Click to record contact attempt'}
    >
      <Mail className="w-3 h-3 mr-1" />
      <span>Attempts: {member.attempts_made}</span>
      {!isDisabled && <Edit2 className="w-3 h-3 ml-1 opacity-50" />}
    </button>
  );
};

const ContactTimeline = ({ 
  member 
}: { 
  member: AssignmentInfluencer;
}) => {
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const difference = now - date;
    
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}min ago`;
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    return `${days}d ${hours % 24}h ago`;
  };

  const formatNextContactTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const difference = date - now;
    
    // If it's more than 1 day difference, show like last contact
    if (Math.abs(difference) > 24 * 60 * 60 * 1000) {
      const days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
      return difference > 0 ? `in ${days}d` : `${days}d ago`;
    }
    
    // Otherwise show the timer format
    return null; // Will use the timer component
  };

  const nextContactFormatted = formatNextContactTime(member.next_contact_at);

  return (
    <div className="w-28 space-y-1"> {/* Fixed width container */}
      {/* Last Contact */}
      <div className="flex items-center text-xs">
        <Calendar className="w-3 h-3 text-gray-500 mr-1 flex-shrink-0" />
        <span className="text-gray-600 truncate">{formatRelativeTime(member.last_contacted_at)}</span>
      </div>

      {/* Next Contact */}
      <div className="flex items-center text-xs">
        <Clock className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
        <span className="text-gray-600">
          {nextContactFormatted ? (
            <span className="text-blue-600 truncate">{nextContactFormatted}</span>
          ) : (
            <NextContactTimer 
              key={`${member.id}-${member.next_contact_at}`}
              nextContactAt={member.next_contact_at} 
            />
          )}
        </span>
      </div>
    </div>
  );
};

const CopyMessageButton = ({ 
  member, 
  messageTemplates,
  assignment,
  onCopy
}: { 
  member: AssignmentInfluencer;
  messageTemplates: MessageTemplate[];
  assignment: AgentAssignment;
  onCopy?: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  
  const getMessageTemplate = (): MessageTemplate | null => {
    if (!messageTemplates || messageTemplates.length === 0) {
      return null;
    }
    
    const attemptsCount = member.attempts_made || 0;
    
    if (attemptsCount === 0) {
      return messageTemplates.find(template => template.template_type === 'initial') || null;
    } else {
      const followupTemplate = messageTemplates.find(template => 
        template.template_type === 'followup' && 
        template.followup_sequence === attemptsCount
      );
      
      if (!followupTemplate) {
        const allFollowups = messageTemplates
          .filter(template => template.template_type === 'followup')
          .sort((a, b) => (b.followup_sequence || 0) - (a.followup_sequence || 0));
        
        return allFollowups[0] || null;
      }
      
      return followupTemplate;
    }
  };
  
  const handleCopyMessage = async () => {
    const template = getMessageTemplate();
    
    if (!template) {
      alert('No message template available for this attempt level');
      return;
    }
    
    const brandName = assignment?.campaign?.brand_name || 'Your Brand';
    const campaignName = assignment?.campaign?.name || 'Campaign';
    
    const replacements = {
      '{{influencer_name}}': member.campaign_influencer.social_account.account_handle,
      '{{brand_name}}': brandName,
      '{{campaign_name}}': campaignName,
      '{{agent_name}}': 'Agent',
      '{{recent_post_topic}}': 'your amazing content',
      '{{collaboration_offer}}': 'exciting collaboration opportunity',
      '{{product_value}}': '$XXX',
      '{{additional_benefits}}': 'additional perks and benefits'
    };
    
    let processedSubject = template.subject || '';
    let processedContent = template.content || '';
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    const fullMessage = processedSubject ? 
      `${processedSubject}\n\n${processedContent}` : 
      processedContent;
    
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      onCopy?.();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      // alert('Failed to copy message to clipboard');
    }
  };
  
  const template = getMessageTemplate();
  
  return (
    <button
      onClick={handleCopyMessage}
      disabled={!template}
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
        copied 
          ? 'bg-green-100 text-green-700 border border-green-300'
          : template
            ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
      }`}
      title={template ? `${template.template_type} message` : 'No message template available'}
    >
      {copied ? (
        <Check className="w-3 h-3 mr-1" />
      ) : (
        <Copy className="w-3 h-3 mr-1" />
      )}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const ActionsDropdown = ({ 
  member, 
  onEditNotes, 
  onViewMember, 
  currentType 
}: { 
  member: AssignmentInfluencer;
  onEditNotes: (member: AssignmentInfluencer) => void;
  onViewMember: (member: AssignmentInfluencer) => void;
  currentType: InfluencerType;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Edit Notes',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => {
        onEditNotes(member);
        setIsOpen(false);
      },
      disabled: currentType === 'completed'
    },
    {
      label: 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        onViewMember(member);
        setIsOpen(false);
      },
      disabled: false
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3 text-gray-400">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) {
            pages.push(i);
          }
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
              className={`px-3 py-2 text-sm rounded-md min-w-[40px] ${
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
          disabled={currentPage === totalPages || totalPages === 0}
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
  loading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  onEditCampaignStatus,
  onViewMember,
  onAddContact,
  onViewContacts,
  availableStatuses,
  onTypeChange,
  currentType,
  assignment,
  onMemberUpdate
}: MembersTableProps) {
  const [searchText, setSearchText] = useState('');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const filteredMembers = members.filter(member => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      member.campaign_influencer.social_account.full_name.toLowerCase().includes(searchLower) ||
      member.campaign_influencer.social_account.account_handle.toLowerCase().includes(searchLower)
    );
  });

  const messageTemplates: MessageTemplate[] = assignment?.campaign?.message_templates || [];
  const isCompletedTab = currentType === 'completed';

  return (
    <div className="bg-transparent">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Assignment Details</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search influencers..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Influencer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Contact Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="ml-3 space-y-1">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-28"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">No influencers found</h3>
                      <p className="text-gray-500 text-sm">
                        {searchText 
                          ? 'No influencers match your search criteria.' 
                          : `No ${currentType} influencers in this assignment.`
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={member.campaign_influencer.social_account.profile_pic_url || '/default-avatar.png'}
                              alt=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {member.campaign_influencer.social_account.full_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <span>@{member.campaign_influencer.social_account.account_handle}</span>
                              {member.campaign_influencer.social_account.is_verified && (
                                <CheckCircle className="w-3 h-3 ml-1 text-blue-500" />
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatNumber(member.campaign_influencer.social_account.followers_count)} followers
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {isCompletedTab ? (
                          <ContactStatusBadge status={member.campaign_influencer.status?.name || 'discovered'} />
                        ) : (
                          <InlineStatusDropdown 
                            influencer={member}
                            availableStatuses={availableStatuses}
                            onUpdate={onMemberUpdate}
                          />
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {isCompletedTab ? (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            <span>Attempts: {member.attempts_made}</span>
                          </div>
                        ) : (
                          <EditableAttempts 
                            member={member}
                            onUpdate={onMemberUpdate}
                          />
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <ContactTimeline 
                          key={`${member.id}-${member.attempts_made}-${member.last_contacted_at}-${member.next_contact_at}`}
                          member={member} 
                        />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <CopyMessageButton 
                          member={member}
                          messageTemplates={messageTemplates}
                          assignment={assignment}
                          onCopy={() => console.log('Message copied for:', member.campaign_influencer.social_account.full_name)}
                        />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewContacts(member)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View & manage contacts"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {isCompletedTab ? (
                          <div className="w-28 flex items-center text-xs text-gray-500">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            <span>{member.campaign_influencer.collaboration_price || '0'}</span>
                          </div>
                        ) : (
                          <EditablePrice 
                            influencer={member}
                            onUpdate={onMemberUpdate}
                          />
                        )}
                      </td>
                      
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="text-xs">{formatDate(member.assigned_at)}</div>
                          {member.responded_at && (
                            <div className="text-green-600 text-xs">Responded: {formatDate(member.responded_at)}</div>
                          )}
                          {member.archived_at && currentType === 'archived' && (
                            <div className="text-orange-600 text-xs">Archived: {formatDate(member.archived_at)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <ActionsDropdown 
                          member={member}
                          onEditNotes={onEditCampaignStatus}
                          onViewMember={onViewMember}
                          currentType={currentType}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            pageSize={pagination.page_size}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </div>
  );
}