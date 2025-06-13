// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

interface AnalyticsViewProps {
  onBack: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  return (
    <div className="pt-4">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6 px-4">
        <h3 className="text-xl font-semibold text-gray-800">Analytics View</h3>
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>
      </div>

      {/* Empty State Content */}
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Detailed analytics and performance insights will be displayed here. 
            Track engagement metrics, reach analytics, and campaign performance data.
          </p>
          
          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Reach Analytics</h4>
              <p className="text-xs text-gray-500">Track audience reach and impressions</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Engagement</h4>
              <p className="text-xs text-gray-500">Monitor likes, comments, and shares</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Performance</h4>
              <p className="text-xs text-gray-500">Analyze ROI and conversion rates</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
            <p className="text-blue-600 text-sm mt-2">
              Advanced analytics features are currently in development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;