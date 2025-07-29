// src/app/(dashboard)/@platform/settings/assignments/page.tsx - UPDATED WITH FULL WIDTH
'use client';

import { useState, useEffect } from 'react';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { Users, Settings, Clock, AlertTriangle, ArrowLeft, TrendingUp } from 'react-feather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

function AssignmentPreferencesPage() {
  const [preferences, setPreferences] = useState({
    maxConcurrentAssignments: 100,
    preferredCategories: ['fashion', 'lifestyle'],
    preferredPlatforms: ['instagram', 'tiktok'],
    autoAcceptAssignments: true,
    workloadPreference: 'balanced',
    specializations: ['micro-influencers', 'nano-influencers']
  });
  
  const [stats, setStats] = useState({
    currentAssignments: 45,
    completedThisMonth: 23,
    avgResponseTime: '2.3h',
    successRate: 85
  });

  const categoryOptions = [
    'fashion', 'lifestyle', 'beauty', 'fitness', 'food', 'travel', 'tech', 'gaming'
  ];

  const platformOptions = [
    'instagram', 'tiktok', 'youtube', 'twitter', 'facebook'
  ];

  const handleSave = async () => {
    try {
      console.log('Saving assignment preferences:', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/settings" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Assignment Preferences</h1>
        <p className="text-gray-600 mt-2">
          Configure your assignment preferences and workload settings
        </p>
      </div>

      {/* Current Stats - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentAssignments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Max Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{preferences.maxConcurrentAssignments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Form - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assignment Configuration</h2>
          <p className="text-gray-600 mt-1">Customize your assignment workflow and preferences</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Workload Settings - Full Width */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Workload Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Concurrent Assignments
                </label>
                <input
                  type="number"
                  value={preferences.maxConcurrentAssignments}
                  onChange={(e) => setPreferences(prev => ({ 
                    ...prev, 
                    maxConcurrentAssignments: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workload Preference
                </label>
                <select
                  value={preferences.workloadPreference}
                  onChange={(e) => setPreferences(prev => ({ ...prev, workloadPreference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="light">Light (25-50 assignments)</option>
                  <option value="balanced">Balanced (50-100 assignments)</option>
                  <option value="heavy">Heavy (100+ assignments)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Preferences - Full Width */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {categoryOptions.map((category) => (
                <label key={category} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={preferences.preferredCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({
                          ...prev,
                          preferredCategories: [...prev.preferredCategories, category]
                        }));
                      } else {
                        setPreferences(prev => ({
                          ...prev,
                          preferredCategories: prev.preferredCategories.filter(c => c !== category)
                        }));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platform Preferences - Full Width */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Platforms</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {platformOptions.map((platform) => (
                <label key={platform} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={preferences.preferredPlatforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences(prev => ({
                          ...prev,
                          preferredPlatforms: [...prev.preferredPlatforms, platform]
                        }));
                      } else {
                        setPreferences(prev => ({
                          ...prev,
                          preferredPlatforms: prev.preferredPlatforms.filter(p => p !== platform)
                        }));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Auto Accept - Full Width */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-lg font-medium text-gray-700">Auto-Accept Assignments</h4>
              <p className="text-sm text-gray-500">
                Automatically accept assignments that match your preferences and workload capacity
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoAcceptAssignments}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                autoAcceptAssignments: e.target.checked 
              }))}
              className="h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRoleAccess(AssignmentPreferencesPage, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }]
});