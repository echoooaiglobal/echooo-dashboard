// src/components/dashboard/platform/components/WelcomeSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare } from 'react-feather';

export type DashboardTab = 'today' | 'all';

interface WelcomeSectionProps {
  user: any;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function WelcomeSection({ user, activeTab, onTabChange }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="space-y-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-t-xl text-white shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-teal-100">Manage your assigned campaign lists and track influencer outreach progress.</p>
      </div>

      {/* Connected Tabs - No gap, attached to bottom of welcome section */}
      <div className="bg-white rounded-b-xl shadow-md">
        <div className="grid grid-cols-2">
          <button
            onClick={() => onTabChange('today')}
            className={`flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 rounded-bl-xl ${
              activeTab === 'today'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Today Tasks
          </button>
          <button
            onClick={() => onTabChange('all')}
            className={`flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 rounded-br-xl ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            All Assignments
          </button>
        </div>
      </div>
    </div>
  );
}