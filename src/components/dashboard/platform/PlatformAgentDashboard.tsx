// src/components/dashboard/platform/PlatformAgentDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAssignments, getAssignmentMembers } from '@/services/assignments/assignments.service';
import { getListMemberStatuses } from '@/services/statuses/statuses.service';
import { Assignment, AssignmentsResponse } from '@/types/assignments';
import { AssignmentMember, AssignmentMembersResponse } from '@/types/assignment-members';
import { Status } from '@/types/statuses';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EditMemberModal from './modals/EditMemberModal';
import AddContactModal from './modals/AddContactModal';
import ViewContactsModal from './modals/ViewContactsModal';
import AssignmentStatsCards from './components/AssignmentStatsCards';
import AssignmentSelector from './components/AssignmentSelector';
import MembersTable from './components/MembersTable';

export default function PlatformAgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [greeting, setGreeting] = useState('');
  
  // API State Management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  
  // Assignment Members State
  const [assignmentMembers, setAssignmentMembers] = useState<AssignmentMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [membersPagination, setMembersPagination] = useState({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false
  });
  
  // Statuses State
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState<string | null>(null);
  
  // UI State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isViewContactsModalOpen, setIsViewContactsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AssignmentMember | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Debug: Log component state
  useEffect(() => {
    console.log('🔍 PlatformAgentDashboard Debug Info:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, user_type: user.user_type } : null,
      hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false
    });
  }, [isAuthenticated, user]);

  // Fetch assignments from API
  const fetchAssignments = async () => {
    try {
      console.log('🚀 Starting assignments fetch...');
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('📞 Calling getAssignments service...');
      const assignmentsData: AssignmentsResponse = await getAssignments();
      
      console.log('✅ Assignments API response received:', {
        totalAssignments: assignmentsData.total_assignments,
        assignmentsCount: assignmentsData.assignments?.length || 0,
        assignmentsData
      });
      
      const fetchedAssignments = assignmentsData.assignments || [];
      setAssignments(fetchedAssignments);
      
      // Set default assignment to first pending or first assignment
      if (fetchedAssignments.length > 0) {
        const pendingAssignment = fetchedAssignments.find(a => a.status.name.toLowerCase() === 'pending');
        const firstAssignment = pendingAssignment || fetchedAssignments[0];
        setSelectedAssignment(firstAssignment);
        
        // Fetch members for the first assignment
        if (firstAssignment) {
          await fetchAssignmentMembers(firstAssignment.id);
        }
      }
      
    } catch (error) {
      console.error('❌ PlatformAgentDashboard: Error fetching assignments:', error);
      setAssignmentsError(error instanceof Error ? error.message : 'Failed to load assignments');
    } finally {
      console.log('🏁 Assignments fetch completed');
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    console.log('📋 useEffect for assignments triggered');
    console.log('📋 Conditions check:', {
      isAuthenticated,
      userExists: !!user,
      userType: user?.user_type
    });

    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, skipping assignments fetch');
      setAssignmentsLoading(false);
      return;
    }

    if (!user) {
      console.log('❌ No user data, skipping assignments fetch');
      setAssignmentsLoading(false);
      return;
    }

    // Add a small delay to ensure everything is ready
    const timer = setTimeout(() => {
      fetchAssignments();
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Fetch statuses on component mount
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        console.log('🚀 Starting statuses fetch...');
        setStatusesLoading(true);
        setStatusesError(null);
        
        const statusesData = await getListMemberStatuses();
        
        console.log('✅ Statuses fetched:', statusesData);
        setAvailableStatuses(statusesData);
        
      } catch (error) {
        console.error('❌ Error fetching statuses:', error);
        setStatusesError(error instanceof Error ? error.message : 'Failed to load statuses');
      } finally {
        setStatusesLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStatuses();
    }
  }, [isAuthenticated]);

  // Function to fetch assignment members
  const fetchAssignmentMembers = async (assignmentId: string, page: number = 1, pageSize: number = 10) => {
    try {
      console.log(`🚀 Fetching members for assignment ${assignmentId}, page ${page}, size ${pageSize}`);
      setMembersLoading(true);
      setMembersError(null);
      
      const membersData: AssignmentMembersResponse = await getAssignmentMembers(assignmentId, page, pageSize);
      
      console.log('✅ Assignment members fetched:', {
        memberCount: membersData.members?.length || 0,
        pagination: membersData.pagination
      });
      
      setAssignmentMembers(membersData.members || []);
      setMembersPagination(membersData.pagination);
      
    } catch (error) {
      console.error('❌ Error fetching assignment members:', error);
      setMembersError(error instanceof Error ? error.message : 'Failed to load assignment members');
      setAssignmentMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  // Handle assignment selection
  const handleAssignmentSelect = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    await fetchAssignmentMembers(assignment.id, 1, membersPagination.page_size);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (selectedAssignment) {
      fetchAssignmentMembers(selectedAssignment.id, page, membersPagination.page_size);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (selectedAssignment) {
      fetchAssignmentMembers(selectedAssignment.id, 1, size);
    }
  };

  // Handle member update
  const handleMemberUpdate = (updatedMember: AssignmentMember) => {
    setAssignmentMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  // Handle member actions
  const handleEditMember = (member: AssignmentMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleViewMember = (member: AssignmentMember) => {
    // TODO: Implement view details modal
    console.log('View member:', member);
  };

  const handleAddContact = (member: AssignmentMember) => {
    setSelectedMember(member);
    setIsAddContactModalOpen(true);
  };

  const handleViewContacts = (member: AssignmentMember) => {
    setSelectedMember(member);
    setIsViewContactsModalOpen(true);
  };

  // Handle contact operations
  const handleContactAdded = () => {
    // Optionally refresh member data or show success message
    console.log('Contact added successfully');
  };

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-teal-100">Manage your assigned campaign lists and track influencer outreach progress.</p>
      </div>

      {/* Assignment Selector */}
      <AssignmentSelector
        assignments={assignments}
        selectedAssignment={selectedAssignment}
        onAssignmentSelect={handleAssignmentSelect}
        isLoading={assignmentsLoading}
        error={assignmentsError}
        onRefresh={fetchAssignments}
      />

      {/* Statistics Cards */}
      {selectedAssignment && (
        <AssignmentStatsCards
          assignmentMembers={assignmentMembers}
          availableStatuses={availableStatuses}
        />
      )}

      {/* Campaign List Management */}
      {selectedAssignment && (
        <MembersTable
          members={assignmentMembers}
          isLoading={membersLoading}
          error={membersError}
          onRefresh={() => fetchAssignmentMembers(selectedAssignment.id, membersPagination.page, membersPagination.page_size)}
          onEditMember={handleEditMember}
          onViewMember={handleViewMember}
          onAddContact={handleAddContact}
          onViewContacts={handleViewContacts}
          availableStatuses={availableStatuses}
          assignmentName={selectedAssignment.campaign.name}
          brandName={selectedAssignment.campaign.brand_name}
          listName={selectedAssignment.campaign_list.name}
          currentPage={membersPagination.page}
          totalPages={membersPagination.total_pages}
          totalItems={membersPagination.total_items}
          pageSize={membersPagination.page_size}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Edit Member Modal */}
      <EditMemberModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onUpdate={handleMemberUpdate}
        availableStatuses={availableStatuses}
        statusesLoading={statusesLoading}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        member={selectedMember}
        isOpen={isAddContactModalOpen}
        onClose={() => {
          setIsAddContactModalOpen(false);
          setSelectedMember(null);
        }}
        onContactAdded={handleContactAdded}
      />

      {/* View Contacts Modal */}
      <ViewContactsModal
        member={selectedMember}
        isOpen={isViewContactsModalOpen}
        onClose={() => {
          setIsViewContactsModalOpen(false);
          setSelectedMember(null);
        }}
        onAddContact={() => {
          setIsViewContactsModalOpen(false);
          setIsAddContactModalOpen(true);
          // selectedMember is already set
        }}
      />
    </div>
  );
}