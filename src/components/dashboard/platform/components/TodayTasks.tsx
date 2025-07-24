// src/components/dashboard/platform/components/TodayTasks.tsx
'use client';

import { Clock, Calendar, CheckSquare } from 'react-feather';

export default function TodayTasks() {
  return (
    <div className="space-y-6">
      {/* Empty state for Today Tasks */}
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks for Today</h3>
        <p className="text-gray-600 mb-4">
          You have no pending tasks scheduled for today. Great job!
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Check back tomorrow</span>
          </div>
          <div className="flex items-center">
            <CheckSquare className="w-4 h-4 mr-2" />
            <span>All caught up</span>
          </div>
        </div>
      </div>
    </div>
  );
}