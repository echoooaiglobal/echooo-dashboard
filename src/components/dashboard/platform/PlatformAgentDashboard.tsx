// src/components/dashboard/platform/PlatformAgentDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  List, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Eye,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Plus,
  Download,
  RefreshCw
} from 'react-feather';

// Types for Campaign List Members (these should match your backend)
interface CampaignListMember {
  id: string;
  list_id: string;
  influencer_id: string;
  influencer_username: string;
  influencer_name: string;
  influencer_followers: string;
  influencer_engagement_rate: string;
  contact_status: 'not_contacted' | 'contacted' | 'responded' | 'declined' | 'accepted';
  contact_attempts: number;
  last_contacted_at: string | null;
  notes: string | null;
  assigned_agent_id: string;
  created_at: string;
  updated_at: string;
}

// Types for Agent Assignments
interface AgentAssignment {
  id: string;
  agent_id: string;
  list_id: string;
  assigned_at: string;
  campaign_name: string;
  company_name: string;
  status: 'active' | 'completed' | 'paused';
}

// Mock data - replace with actual API calls
const mockCampaignListMembers: CampaignListMember[] = [
  {
    id: '1',
    list_id: 'list_001',
    influencer_id: 'inf_001',
    influencer_username: '@sarah_lifestyle',
    influencer_name: 'Sarah Johnson',
    influencer_followers: '125K',
    influencer_engagement_rate: '4.2%',
    contact_status: 'not_contacted',
    contact_attempts: 0,
    last_contacted_at: null,
    notes: null,
    assigned_agent_id: 'agent_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    list_id: 'list_001',
    influencer_id: 'inf_002',
    influencer_username: '@mike_fitness',
    influencer_name: 'Mike Rodriguez',
    influencer_followers: '89K',
    influencer_engagement_rate: '5.1%',
    contact_status: 'contacted',
    contact_attempts: 1,
    last_contacted_at: '2024-01-16T14:30:00Z',
    notes: 'Initial outreach sent, waiting for response',
    assigned_agent_id: 'agent_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    list_id: 'list_001',
    influencer_id: 'inf_003',
    influencer_username: '@emma_travel',
    influencer_name: 'Emma Wilson',
    influencer_followers: '245K',
    influencer_engagement_rate: '3.8%',
    contact_status: 'responded',
    contact_attempts: 2,
    last_contacted_at: '2024-01-17T09:15:00Z',
    notes: 'Interested in collaboration, sent brand guidelines',
    assigned_agent_id: 'agent_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: '4',
    list_id: 'list_001',
    influencer_id: 'inf_004',
    influencer_username: '@alex_tech',
    influencer_name: 'Alex Chen',
    influencer_followers: '67K',
    influencer_engagement_rate: '6.3%',
    contact_status: 'declined',
    contact_attempts: 1,
    last_contacted_at: '2024-01-16T11:45:00Z',
    notes: 'Not interested in this campaign type',
    assigned_agent_id: 'agent_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T11:45:00Z'
  },
  {
    id: '5',
    list_id: 'list_001',
    influencer_id: 'inf_005',
    influencer_username: '@lisa_food',
    influencer_name: 'Lisa Anderson',
    influencer_followers: '156K',
    influencer_engagement_rate: '4.7%',
    contact_status: 'accepted',
    contact_attempts: 3,
    last_contacted_at: '2024-01-18T16:20:00Z',
    notes: 'Contract signed, ready to start content creation',
    assigned_agent_id: 'agent_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-18T16:20:00Z'
  }
];

const mockAgentAssignments: AgentAssignment[] = [
  {
    id: 'assign_001',
    agent_id: 'agent_001',
    list_id: 'list_001',
    assigned_at: '2024-01-15T09:00:00Z',
    campaign_name: 'Summer Collection Launch',
    company_name: 'Fashion Forward Inc.',
    status: 'active'
  },
  {
    id: 'assign_002',
    agent_id: 'agent_001',
    list_id: 'list_002',
    assigned_at: '2024-01-10T14:00:00Z',
    campaign_name: 'Fitness Challenge 2024',
    company_name: 'HealthFit Pro',
    status: 'completed'
  }
];

// Component for displaying contact status badge
const ContactStatusBadge = ({ status }: { status: CampaignListMember['contact_status'] }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'not_contacted':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Contacted' };
      case 'contacted':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' };
      case 'responded':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Responded' };
      case 'declined':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' };
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Component for action dropdown menu
const ActionDropdown = ({ member, onEdit, onView }: { 
  member: CampaignListMember;
  onEdit: (member: CampaignListMember) => void;
  onView: (member: CampaignListMember) => void;
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
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
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
      )}
    </div>
  );
};

// Edit Status Modal Component
const EditStatusModal = ({ 
  member, 
  isOpen, 
  onClose, 
  onUpdate 
}: {
  member: CampaignListMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (memberId: string, status: CampaignListMember['contact_status'], notes?: string) => void;
}) => {
  const [status, setStatus] = useState<CampaignListMember['contact_status']>('not_contacted');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member) {
      setStatus(member.contact_status);
      setNotes(member.notes || '');
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member) {
      onUpdate(member.id, status, notes);
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Update Contact Status</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Influencer: {member.influencer_name}
            </label>
            <p className="text-sm text-gray-500">{member.influencer_username}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CampaignListMember['contact_status'])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
              <option value="responded">Responded</option>
              <option value="declined">Declined</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add notes about this contact..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Platform Agent Dashboard Component
export default function PlatformAgentDashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [assignments, setAssignments] = useState<AgentAssignment[]>(mockAgentAssignments);
  const [listMembers, setListMembers] = useState<CampaignListMember[]>(mockCampaignListMembers);
  const [selectedAssignment, setSelectedAssignment] = useState<AgentAssignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CampaignListMember | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Set default assignment
    if (assignments.length > 0) {
      setSelectedAssignment(assignments.find(a => a.status === 'active') || assignments[0]);
    }
  }, [assignments]);

  // Filter list members based on search and status
  const filteredMembers = listMembers.filter(member => {
    const matchesSearch = member.influencer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.influencer_username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.contact_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: listMembers.length,
    notContacted: listMembers.filter(m => m.contact_status === 'not_contacted').length,
    contacted: listMembers.filter(m => m.contact_status === 'contacted').length,
    responded: listMembers.filter(m => m.contact_status === 'responded').length,
    accepted: listMembers.filter(m => m.contact_status === 'accepted').length,
    declined: listMembers.filter(m => m.contact_status === 'declined').length,
  };

  const handleEditMember = (member: CampaignListMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleViewMember = (member: CampaignListMember) => {
    // TODO: Implement view details modal
    console.log('View member:', member);
  };

  const handleStatusUpdate = (memberId: string, newStatus: CampaignListMember['contact_status'], notes?: string) => {
    setListMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { 
            ...member, 
            contact_status: newStatus, 
            notes: notes || member.notes,
            contact_attempts: newStatus === 'contacted' ? member.contact_attempts + 1 : member.contact_attempts,
            last_contacted_at: newStatus === 'contacted' ? new Date().toISOString() : member.last_contacted_at,
            updated_at: new Date().toISOString()
          }
        : member
    ));
  };

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-teal-100">Manage your assigned campaign lists and track influencer outreach progress.</p>
      </div>

      {/* Assignment Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <div 
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAssignment?.id === assignment.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{assignment.campaign_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {assignment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{assignment.company_name}</p>
              <p className="text-xs text-gray-500">
                Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedAssignment && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-gray-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.notContacted}</p>
                <p className="text-sm text-gray-500">Not Contacted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.contacted}</p>
                <p className="text-sm text-gray-500">Contacted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.responded}</p>
                <p className="text-sm text-gray-500">Responded</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.accepted}</p>
                <p className="text-sm text-gray-500">Accepted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.declined}</p>
                <p className="text-sm text-gray-500">Declined</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List Management */}
      {selectedAssignment && (
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Campaign: {selectedAssignment.campaign_name}
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
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
                  <option value="not_contacted">Not Contacted</option>
                  <option value="contacted">Contacted</option>
                  <option value="responded">Responded</option>
                  <option value="declined">Declined</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Influencer List Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.influencer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.influencer_username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.influencer_followers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.influencer_engagement_rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ContactStatusBadge status={member.contact_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.contact_attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.last_contacted_at 
                        ? new Date(member.last_contacted_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionDropdown 
                        member={member}
                        onEdit={handleEditMember}
                        onView={handleViewMember}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No influencers found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Status Modal */}
      <EditStatusModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}