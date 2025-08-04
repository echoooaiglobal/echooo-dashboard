// src/components/dashboard/platform/components/WelcomeSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, Zap, Play, Square, Star } from 'react-feather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export type DashboardTab = 'today' | 'all';

interface WelcomeSectionProps {
  user: any;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function WelcomeSection({ user, activeTab, onTabChange }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState('');
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [isAutopilotLoading, setIsAutopilotLoading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleAutopilotToggle = async () => {
    setIsAutopilotLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Toggle autopilot state
      setIsAutopilotActive(!isAutopilotActive);
      
      // TODO: Add actual API call here
      console.log('🤖 Autopilot toggled:', !isAutopilotActive ? 'STARTED' : 'STOPPED');
      
    } catch (error) {
      console.error('Error toggling autopilot:', error);
    } finally {
      setIsAutopilotLoading(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-t-xl text-white shadow-lg p-8 pb-16">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
            <p className="text-teal-100">Manage your assigned campaign lists and track influencer outreach progress.</p>
          </div>
          
          {/* AI Autopilot Button - Enhanced */}
          <div className="flex-shrink-0 ml-8">
            <button
              onClick={handleAutopilotToggle}
              disabled={isAutopilotLoading}
              className={`
                relative overflow-hidden group
                flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm
                transform transition-all duration-300 hover:scale-105 active:scale-95
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isAutopilotActive 
                  ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 hover:from-green-300 hover:via-green-400 hover:to-emerald-500 shadow-xl shadow-green-500/30' 
                  : 'bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 hover:from-purple-300 hover:via-purple-400 hover:to-indigo-500 shadow-xl shadow-purple-500/30'
                }
                border-2 border-white/30 backdrop-blur-sm
                min-w-[160px]
              `}
            >
              {/* Enhanced sparkle animation */}
              <div className="absolute inset-0 opacity-20">
                <Star className="absolute top-1 right-2 w-3 h-3 text-white animate-pulse" />
                <Star className="absolute bottom-1 left-2 w-2 h-2 text-white animate-pulse delay-500" />
                <Star className="absolute top-2 left-4 w-2 h-2 text-white animate-pulse delay-1000" />
              </div>
              
              {/* Button content */}
              <div className="relative flex items-center space-x-2 z-10">
                {isAutopilotLoading ? (
                  <>
                    <div className="relative">
                      <LoadingSpinner size="sm" />
                    </div>
                    <span className="text-white font-semibold">Processing...</span>
                  </>
                ) : (
                  <>
                    {isAutopilotActive ? (
                      <>
                        <div className="relative">
                          <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-sm" />
                          </div>
                        </div>
                        <span className="text-white">Stop AI Autopilot</span>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Zap className="w-4 h-4 text-white" />
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                        </div>
                        <span className="text-white">Start AI Autopilot</span>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Simple status dot indicator */}
              {!isAutopilotLoading && (
                <div className={`
                  absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                  ${isAutopilotActive 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-gray-400'
                  }
                `}>
                  {isAutopilotActive && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
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