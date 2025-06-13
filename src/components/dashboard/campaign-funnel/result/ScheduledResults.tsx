// src/components/dashboard/campaign-funnel/result/ScheduledResults.tsx
const ScheduledResults = () => {
  return (
    <div className="pt-4">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Content</h3>
          <p className="text-gray-500 text-sm">Content scheduled for future publishing will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduledResults;