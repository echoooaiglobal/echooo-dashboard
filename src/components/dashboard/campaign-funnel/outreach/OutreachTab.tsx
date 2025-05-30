// src/components/dashboard/campaign-funnel/outreach/OutreachTab.tsx
'use client';

import MessageSent from './MessageSent';
import ReadyToOnboard from './ReadyToOnboard';
import OnBoarded from './OnBoarded';

const OutreachTab: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Outreach</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MessageSent />
        <ReadyToOnboard />
        <OnBoarded />
      </div>
    </div>
  );
};

export default OutreachTab;