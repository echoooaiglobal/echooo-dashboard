// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

interface AnalyticsViewProps {
  onBack: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const analyticsData = [
    {
      title: "Total Clicks",
      value: "5,346",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Impressions", 
      value: "539k",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Reach",
      value: "352k", 
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Average CPC",
      value: "$0.04",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Average CPM",
      value: "$0.99",
      change: "-34.3%",
      changeType: "negative" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "CTR",
      value: "7.45%",
      change: "-34.3%",
      changeType: "negative" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Page Likes",
      value: "356k",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Cost Per Page Like",
      value: "$45.50",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Cost Per Post Reaction",
      value: "$45.40",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Unique Link Clicks",
      value: "3,593",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    },
    {
      title: "Unique CTR",
      value: "2.50%",
      change: "+34.3%",
      changeType: "positive" as const,
      subtitle: "Total Transaction & Activities in Last Month"
    }
  ];

  return (
    <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8 px-6">
        <h3 className="text-2xl font-bold text-gray-800">Analytics View</h3>
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </button>
      </div>

      {/* Basic Insights Section */}
      <div className="px-6">
        <div className="flex items-center space-x-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Basic Insights</h2>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              {/* Header with title and info icon */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{item.title}</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>

              {/* Main Value */}
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-900">{item.value}</span>
              </div>

              {/* Change Indicator */}
              <div className="flex items-center space-x-2 mb-3">
                <span className={`text-sm font-medium flex items-center ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {item.changeType === 'positive' ? (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                    </svg>
                  )}
                  {item.change}
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs text-gray-500 leading-relaxed">{item.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Advance Insights Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Advance Insights</h2>
          </div>

          {/* Advance Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Top Device Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Top Device</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Donut Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                  {/* Desktop segment - 90% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray={`${90 * 5.03} ${10 * 5.03}`} strokeDashoffset="0"/>
                  {/* Tablet segment - 0.6% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${0.6 * 5.03} ${99.4 * 5.03}`} strokeDashoffset={`-${90 * 5.03}`}/>
                  {/* Mobile segment - 4.8% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${4.8 * 5.03} ${95.2 * 5.03}`} strokeDashoffset={`-${90.6 * 5.03}`}/>
                </svg>
              </div>
              
              {/* Legend */} 
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Desktop</span>
                  </div>
                  <span className="text-sm font-medium">90%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Tablet</span>
                  </div>
                  <span className="text-sm font-medium">0.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Mobile</span>
                  </div>
                  <span className="text-sm font-medium">4.8%</span>
                </div>
              </div>
            </div>

            {/* Top Country Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Top Country</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Country Data */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Vietnam</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">United States</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Indonesia</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-300 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Hongkong</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-300 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Russia</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-300 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Ukraine</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-300 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Scale */}
              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>

            {/* New Customer Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">New Customer</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Donut Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                  {/* New Customer segment - 92% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray={`${92 * 5.03} ${8 * 5.03}`} strokeDashoffset="0"/>
                  {/* Returning Customer segment - 8% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${8 * 5.03} ${92 * 5.03}`} strokeDashoffset={`-${92 * 5.03}`}/>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">New Customer</span>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Returning Customer</span>
                  </div>
                  <span className="text-sm font-medium">0.6%</span>
                </div>
              </div>
            </div>

            {/* Clicks Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Clicks</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Area Chart */}
              <div className="h-32 relative">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d="M 0 80 Q 50 60 100 70 T 200 50 T 300 40 L 300 120 L 0 120 Z" fill="url(#areaGradient)"/>
                  {/* Line */}
                  <path d="M 0 80 Q 50 60 100 70 T 200 50 T 300 40" stroke="#a855f7" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              
              {/* Date labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>16 Aug</span>
                <span>20 Aug</span>
                <span>24 Aug</span>
                <span>28 Aug</span>
                <span>30 Aug</span>
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-32 flex flex-col justify-between text-xs text-gray-400 -ml-8">
                <span>160</span>
                <span>140</span>
                <span>120</span>
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Engagement</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Donut Chart with Center Text */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                  {/* Engagement segments */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${50 * 5.03} ${50 * 5.03}`} strokeDashoffset="0"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="20" 
                          strokeDasharray={`${30 * 5.03} ${70 * 5.03}`} strokeDashoffset={`-${50 * 5.03}`}/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${20 * 5.03} ${80 * 5.03}`} strokeDashoffset={`-${80 * 5.03}`}/>
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm text-gray-500">Total Engagements</span>
                  <span className="text-3xl font-bold text-gray-900">5045</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Shares (5k)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Comments (1.4k)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Likes (1k)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gender Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Gender</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Pie Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Male segment - 70% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${70 * 5.03} ${30 * 5.03}`} strokeDashoffset="0"/>
                  {/* Female segment - 30% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${30 * 5.03} ${70 * 5.03}`} strokeDashoffset={`-${70 * 5.03}`}/>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Male (70%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Female (29%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* First Audience Insights Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Audience Insights</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Pie Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Real segment - 60% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${60 * 5.03} ${40 * 5.03}`} strokeDashoffset="0"/>
                  {/* Suspicious segment - 40% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${40 * 5.03} ${60 * 5.03}`} strokeDashoffset={`-${60 * 5.03}`}/>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Real</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Suspicious</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Audience Insights Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Audience insights</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Pie Chart */}
              <div className="relative flex items-center justify-center mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Real segment - 60% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#06b6d4" strokeWidth="20" 
                          strokeDasharray={`${60 * 5.03} ${40 * 5.03}`} strokeDashoffset="0"/>
                  {/* Suspicious segment - 40% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="20" 
                          strokeDasharray={`${40 * 5.03} ${60 * 5.03}`} strokeDashoffset={`-${60 * 5.03}`}/>
                </svg>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Real</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Suspicious</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Influencers Section */}
        <div className="mb-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Top Performing Influencers</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Influencers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Influencer 1 - Arlene McCoy */}
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
                    alt="Arlene McCoy"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                  />
                  
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Arlene McCoy</h4>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <p className="text-sm text-gray-500">@arlenemccoy</p>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Performance Chart */}
                <div className="mb-3">
                  <svg className="w-full h-8" viewBox="0 0 100 20">
                    <path d="M 0 15 Q 25 10 50 12 T 100 8" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="text-center">
                  <span className="text-xl font-bold text-gray-900">4242</span>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>

              {/* Influencer 2 - Robert Fox */}
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                    alt="Robert Fox"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                  />
              
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Robert Fox</h4>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <p className="text-sm text-gray-500">@robertfox</p>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Performance Chart */}
                <div className="mb-3">
                  <svg className="w-full h-8" viewBox="0 0 100 20">
                    <path d="M 0 12 Q 25 8 50 10 T 100 6" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="text-center">
                  <span className="text-xl font-bold text-gray-900">3843</span>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>

              {/* Influencer 3 - Jacob Jones */}
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                    alt="Jacob Jones"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                  />
                  
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Jacob Jones</h4>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <p className="text-sm text-gray-500">@jacobjones</p>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Performance Chart */}
                <div className="mb-3">
                  <svg className="w-full h-8" viewBox="0 0 100 20">
                    <path d="M 0 14 Q 25 11 50 13 T 100 9" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="text-center">
                  <span className="text-xl font-bold text-gray-900">2355</span>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>

              {/* Influencer 4 - Dianne Russell */}
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
                    alt="Dianne Russell"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                  />
                  
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Dianne Russell</h4>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <p className="text-sm text-gray-500">@diannerussell</p>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Performance Chart */}
                <div className="mb-3">
                  <svg className="w-full h-8" viewBox="0 0 100 20">
                    <path d="M 0 16 Q 25 13 50 15 T 100 11" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="text-center">
                  <span className="text-xl font-bold text-gray-900">1029</span>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>

              {/* Influencer 5 - Marvin McKinney */}
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"
                    alt="Marvin McKinney"
                    className="w-16 h-16 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                  />
                  
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Marvin McKinney</h4>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <p className="text-sm text-gray-500">@marvinmckinney</p>
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Performance Chart */}
                <div className="mb-3">
                  <svg className="w-full h-8" viewBox="0 0 100 20">
                    <path d="M 0 17 Q 25 14 50 16 T 100 12" stroke="#a855f7" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="text-center">
                  <span className="text-xl font-bold text-gray-900">1010</span>
                  <p className="text-xs text-gray-500">Total Clicks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;