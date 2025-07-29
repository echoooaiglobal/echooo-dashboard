// src/app/(dashboard)/@platform/settings/outreach/page.tsx - FIXED OVERFLOW

'use client';

import { useState, useEffect } from 'react';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { Send, Clock, Users, MessageSquare, TrendingUp, AlertCircle, ArrowLeft } from 'react-feather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

function OutreachManagementPage() {
  const [outreachStats, setOutreachStats] = useState({
    totalSent: 1247,
    responses: 203,
    responseRate: 16.3,
    pendingOutreach: 45,
    todayQuota: 50,
    todayUsed: 23
  });
  
  const [settings, setSettings] = useState({
    dailyLimit: 50,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    autoFollowUp: true,
    followUpDelay: 24,
    weekendMode: false
  });
  
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      console.log('Saving outreach settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // CRITICAL FIX: Add proper width constraints and overflow handling
    <div className="w-full max-w-none overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/settings" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Outreach Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your influencer outreach campaigns and monitor performance
          </p>
        </div>

        {/* Stats Overview - FIXED: Better responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 overflow-x-hidden">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <Send className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Sent</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{outreachStats.totalSent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Responses</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{outreachStats.responses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Response Rate</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{outreachStats.responseRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Today's Quota</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">
                  {outreachStats.todayUsed}/{outreachStats.todayQuota}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Pending</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{outreachStats.pendingOutreach}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 min-w-0">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-600 flex-shrink-0" />
              <div className="ml-3 lg:ml-4 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Failed</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel - FIXED: Better responsive layout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Outreach Settings</h2>
            <p className="text-gray-600 mt-1">Configure your outreach preferences and limits</p>
          </div>

          <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
            {/* Daily Limits - FIXED: Better responsive grid */}
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Daily Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Outreach Limit
                  </label>
                  <input
                    type="number"
                    value={settings.dailyLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                    max="200"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum outreach messages per day</p>
                </div>
              </div>
            </div>

            {/* Working Hours - FIXED: Better responsive grid */}
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursStart}
                    onChange={(e) => setSettings(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={settings.workingHoursEnd}
                    onChange={(e) => setSettings(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Automation Settings - FIXED: Better responsive layout */}
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Automation</h3>
              <div className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg min-w-0">
                    <div className="min-w-0 flex-1">
                      <label className="text-sm font-medium text-gray-700 block">Auto Follow-up</label>
                      <p className="text-sm text-gray-500 truncate">Automatically send follow-up messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoFollowUp}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoFollowUp: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0 ml-3"
                    />
                  </div>

                  {settings.autoFollowUp && (
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Delay (hours)
                      </label>
                      <input
                        type="number"
                        value={settings.followUpDelay}
                        onChange={(e) => setSettings(prev => ({ ...prev, followUpDelay: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                        max="168"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg min-w-0">
                    <div className="min-w-0 flex-1">
                      <label className="text-sm font-medium text-gray-700 block">Weekend Mode</label>
                      <p className="text-sm text-gray-500 truncate">Continue outreach on weekends</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.weekendMode}
                      onChange={(e) => setSettings(prev => ({ ...prev, weekendMode: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0 ml-3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 lg:pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span className="ml-2">Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRoleAccess(OutreachManagementPage, {
  allowedRoles: ['platform_agent'],
  requiredPermissions: [{ resource: 'influencer_outreach', action: 'read' }]
});