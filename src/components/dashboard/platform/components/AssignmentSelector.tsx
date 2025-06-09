// src/components/dashboard/platform/components/AssignmentSelector.tsx
'use client';

import { Assignment } from '@/types/assignments';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { RefreshCw } from 'react-feather';

interface AssignmentSelectorProps {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  onAssignmentSelect: (assignment: Assignment) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

// Assignment Status Badge Component
const AssignmentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' };
      case 'paused':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Paused' };
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

export default function AssignmentSelector({
  assignments,
  selectedAssignment,
  onAssignmentSelect,
  isLoading,
  error,
  onRefresh
}: AssignmentSelectorProps) {
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Assignments</h2>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Loading assignments...</span>
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh assignments"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm font-medium">Error Loading Assignments</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={onRefresh}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Try again
          </button>
        </div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <div 
              key={assignment.id}
              onClick={() => onAssignmentSelect(assignment)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedAssignment?.id === assignment.id
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 truncate pr-2">
                  {assignment.campaign.name}
                </h3>
                <AssignmentStatusBadge status={assignment.status.name} />
              </div>
              
              <p className="text-sm text-gray-600 mb-2 truncate">
                Brand: {assignment.campaign.brand_name}
              </p>
              
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created: {formatDate(assignment.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
          <p className="text-gray-500 text-sm mb-4">
            You don't have any campaign assignments yet.
          </p>
          <button 
            onClick={onRefresh}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Refresh to check for new assignments
          </button>
        </div>
      ) : null}
    </div>
  );
}