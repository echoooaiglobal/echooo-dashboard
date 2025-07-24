// src/types/statuses.ts

export interface Status {
  id: string;
  model: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StatusesResponse {
  statuses: Status[];
}

// Type for the allowed statuses in agent dashboard
export type AllowedStatusName = 
  | 'discovered'
  | 'unreachable' 
  | 'contacted'
  | 'responded'
  | 'info_requested'
  | 'completed'
  | 'declined'
  | 'inactive';

// Helper function to filter allowed statuses
export function filterAllowedStatuses(statuses: Status[]): Status[] {
  const allowedStatuses: AllowedStatusName[] = [
    // 'discovered',
    'unreachable',
    'contacted',
    'responded',
    'info_requested',
    'completed',
    'declined',
    'inactive'
  ];

  return statuses.filter(status => 
    allowedStatuses.includes(status.name as AllowedStatusName)
  );
}

// Helper function to get status display configuration
export function getStatusDisplayConfig(statusName: string) {
  switch (statusName.toLowerCase()) {
    case 'discovered':
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Discovered' };
    case 'unreachable':
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Unreachable' };
    case 'contacted':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' };
    case 'responded':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Responded' };
    case 'info_requested':
      return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Info Requested' };
    case 'completed':
      return { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Info Received' };
    case 'declined':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' };
    case 'inactive':
      return { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Inactive' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: statusName };
  }
}