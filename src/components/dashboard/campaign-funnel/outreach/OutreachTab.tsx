// src/components/dashboard/campaign-funnel/outreach/OutreachTab.tsx
'use client';

import { useState } from 'react';
import MessageSent from './MessageSent';
import ReadyToOnboard from './ReadyToOnboard';
import OnBoarded from './OnBoarded';
import SelectedManually from './SelectedManually';

const OutreachTab: React.FC = () => {
  const [showManualSelection, setShowManualSelection] = useState(false);

  const handleSelectManually = () => {
    console.log('Opening manual selection view'); // Debug log
    setShowManualSelection(true);
  };

  const handleBackToMain = () => {
    console.log('Returning to main view'); // Debug log
    setShowManualSelection(false);
  };

  // Show manual selection view
  if (showManualSelection) {
    return <SelectedManually onBack={handleBackToMain} />;
  }

  // Show main outreach view
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Outreach</h2>
      
      {/* Cards Section with Overlay Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Sent Card */}
        <div className="relative">
          <MessageSent />
        </div>

        {/* Ready to Onboard Card with Overlay Buttons */}
        <div className="relative">
          <ReadyToOnboard />
          {/* Gradient Button Area Overlay for Ready to Onboard */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-6 rounded-b-xl">
            <div className="flex space-x-3">
              <button 
                onClick={handleSelectManually}
                className="px-6 py-3 bg-white border-2 border-red-400 text-red-500 rounded-full hover:bg-red-50 hover:border-red-500 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Select Manually
              </button>
              <button className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                <span>✨</span>
                <span>Select with AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* On Boarded Card with Overlay Button */}
        <div className="relative">
          <OnBoarded />
          {/* Gradient Button Area Overlay for On Boarded */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-6 rounded-b-xl">
            <button className="px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutreachTab;