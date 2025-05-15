// src/components/dashboard/CompanyDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Users, Briefcase, TrendingUp, Award, PieChart, Calendar } from 'react-feather';

// Dashboard statistics component
const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('border-', 'bg-').replace('-600', '-100')} ${color.replace('border-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="w-full">
      {/* Welcome Section - Company Specific */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-blue-100">Welcome to your Company Dashboard. Manage your influencer campaigns and track performance metrics.</p>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Campaigns" 
          value="8" 
          icon={<Briefcase className="w-6 h-6" />} 
          color="border-blue-600" 
        />
        <StatCard 
          title="Engaged Influencers" 
          value="24" 
          icon={<Users className="w-6 h-6" />} 
          color="border-cyan-600" 
        />
        <StatCard 
          title="Total Reach" 
          value="3.2M" 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="border-green-600" 
        />
        <StatCard 
          title="Campaign ROI" 
          value="215%" 
          icon={<Award className="w-6 h-6" />} 
          color="border-amber-600" 
        />
      </div>

      {/* Campaign Performance and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Top Performing Campaigns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Campaign Performance</h2>
            <div className="flex space-x-2">
              <button className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Weekly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Monthly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Yearly</button>
            </div>
          </div>
          <div className="h-60 w-full bg-gray-50 rounded-lg flex items-center justify-center">
            <PieChart className="h-10 w-10 text-gray-300" />
            <span className="ml-2 text-gray-400">Campaign Performance Chart</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Impressions</p>
              <p className="text-xl font-bold">1.2M</p>
              <p className="text-xs text-green-600">+15% from last month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Engagement Rate</p>
              <p className="text-xl font-bold">4.8%</p>
              <p className="text-xs text-green-600">+0.5% from last month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Conversions</p>
              <p className="text-xl font-bold">5,240</p>
              <p className="text-xs text-green-600">+18% from last month</p>
            </div>
          </div>
        </div>

        {/* Top Influencers */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Top Influencers</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: "Alex Johnson", followers: "1.2M", engagement: "4.8%" },
              { name: "Sarah Miller", followers: "845K", engagement: "5.2%" },
              { name: "James Wilson", followers: "650K", engagement: "6.1%" },
              { name: "Emma Garcia", followers: "520K", engagement: "5.5%" }
            ].map((item, i) => (
              <div key={i} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center text-white font-bold">
                  {item.name.charAt(0)}
                </div>
                <div className="ml-3 flex-grow">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.followers} followers</p>
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {item.engagement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Company Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Link href="/campaigns/create" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">New Campaign</span>
          </Link>
          <Link href="/influencers/discover" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 mb-2">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Find Influencers</span>
          </Link>
          <Link href="/analytics/performance" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">View Analytics</span>
          </Link>
          <Link href="/content/library" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Content Library</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Campaigns */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Campaigns</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View Calendar</button>
        </div>
        <div className="space-y-4">
          {[
            { campaign: "Summer Collection Launch", date: "May 20, 2025", status: "Scheduled", influencers: 8 },
            { campaign: "Brand Anniversary Promotion", date: "June 5, 2025", status: "Planning", influencers: 12 },
            { campaign: "Back to School Campaign", date: "July 15, 2025", status: "Planning", influencers: 6 }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.campaign}</p>
                  <p className="text-sm text-gray-500">{item.date} • {item.influencers} influencers</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                item.status === 'Scheduled' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}