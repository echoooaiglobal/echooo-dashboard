// src/components/dashboard/platform/components/AssignmentStatsCards.tsx
'use client';

import { AssignmentMember } from '@/types/assignment-members';
import { Status, getStatusDisplayConfig } from '@/types/statuses';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'react-feather';

interface AssignmentStatsCardsProps {
  assignmentMembers: AssignmentMember[];
  availableStatuses: Status[];
}

export default function AssignmentStatsCards({ 
  assignmentMembers, 
  availableStatuses 
}: AssignmentStatsCardsProps) {
  
  // Calculate stats from actual assignment members data
  const stats: { total: number; [key: string]: number } = {
    total: assignmentMembers.length,
    ...availableStatuses.reduce((acc, status) => {
      const statusKey = status.name.toLowerCase();
      acc[statusKey] = assignmentMembers.filter(m => 
        m.status.name.toLowerCase() === statusKey
      ).length;
      return acc;
    }, {} as Record<string, number>)
  };

  // Icon mapping for different statuses
  const getIcon = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'discovered':
        return <Eye className="w-8 h-8 text-gray-500 mr-3" />;
      case 'unreachable':
        return <XCircle className="w-8 h-8 text-orange-500 mr-3" />;
      case 'contacted':
        return <MessageSquare className="w-8 h-8 text-blue-500 mr-3" />;
      case 'responded':
        return <Mail className="w-8 h-8 text-yellow-500 mr-3" />;
      case 'info_requested':
        return <Clock className="w-8 h-8 text-indigo-500 mr-3" />;
      case 'info_received':
        return <CheckCircle className="w-8 h-8 text-cyan-500 mr-3" />;
      case 'declined':
        return <XCircle className="w-8 h-8 text-red-500 mr-3" />;
      case 'inactive':
        return <Clock className="w-8 h-8 text-gray-400 mr-3" />;
      default:
        return <Users className="w-8 h-8 text-gray-500 mr-3" />;
    }
  };

  // Calculate percentage for each status
  const getPercentage = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
      {/* Total Members Card */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Members</p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Status Cards */}
      {availableStatuses.map((status) => {
        const statusKey = status.name.toLowerCase();
        const count = stats[statusKey] || 0;
        const percentage = getPercentage(count);
        const config = getStatusDisplayConfig(status.name);
        
        // Get border color based on status
        const getBorderColor = (statusName: string) => {
          switch (statusName.toLowerCase()) {
            case 'discovered':
              return 'border-gray-500';
            case 'unreachable':
              return 'border-orange-500';
            case 'contacted':
              return 'border-blue-500';
            case 'responded':
              return 'border-yellow-500';
            case 'info_requested':
              return 'border-indigo-500';
            case 'info_received':
              return 'border-cyan-500';
            case 'declined':
              return 'border-red-500';
            case 'inactive':
              return 'border-gray-400';
            default:
              return 'border-gray-500';
          }
        };
        
        return (
          <div 
            key={status.id} 
            className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getBorderColor(status.name)}`}
          >
            <div className="flex items-center">
              {getIcon(status.name)}
              <div>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  {stats.total > 0 && (
                    <span className="ml-2 text-xs text-gray-500">({percentage}%)</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{config.label}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBorderColor(status.name).replace('border-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}