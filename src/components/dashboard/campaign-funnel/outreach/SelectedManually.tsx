// src/components/dashboard/campaign-funnel/outreach/SelectedManually.tsx
import React, { useState } from 'react';

interface Influencer {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  followers: string;
  engagements: string;
  avgLikes: string;
  organicRatio: string;
  budget: string;
  cpv: string;
  engagementRate: string;
  platform: string;
  isSelected: boolean;
}

interface SelectedManuallyProps {
  onBack: () => void;
}

const SelectedManually: React.FC<SelectedManuallyProps> = ({ onBack }) => {
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Sample influencer data matching the design
  const influencers: Influencer[] = [
    {
      id: 1,
      name: "Prestia Camira",
      handle: "@prestia",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "34%",
      budget: "$250",
      cpv: "$0.53%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 2,
      name: "Hanna Baptista",
      handle: "@hanna",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "54%",
      budget: "$400",
      cpv: "$0.34%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 3,
      name: "Miracle Geidt",
      handle: "@miracle",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "85%",
      budget: "$120",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 4,
      name: "Rayna Torff",
      handle: "@rayna",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "47%",
      budget: "$800",
      cpv: "$0.64%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 5,
      name: "Giana Lipshutz",
      handle: "@giana",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "85%",
      budget: "$100",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 6,
      name: "James George",
      handle: "@james",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "46%",
      budget: "$50",
      cpv: "$2.53%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 7,
      name: "James George",
      handle: "@james2",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "96%",
      budget: "$630",
      cpv: "$1.64%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 8,
      name: "Jordyn George",
      handle: "@jordyn",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "75%",
      budget: "$400",
      cpv: "$0.86%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    },
    {
      id: 9,
      name: "Skylar Herwitz",
      handle: "@skylar",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=40&h=40&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "25%",
      budget: "$230",
      cpv: "$3.55%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false
    }
  ];

  const toggleInfluencerSelection = (id: number) => {
    const newSelected = new Set(selectedInfluencers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInfluencers(newSelected);
  };

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>

        {/* Title and Buttons Row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ready to Onboard (343)</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-150 text-sm">
              Onboard Selected Influencers
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-150 text-sm"
            >
              Close Tab
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
            <div className="col-span-1"></div>
            <div className="col-span-2">Influencers Name (823M)</div>
            <div className="col-span-1">Followers</div>
            <div className="col-span-1">Engagements</div>
            <div className="col-span-1">Avg Likes</div>
            <div className="col-span-1">Organic Ratio</div>
            <div className="col-span-1">Budget</div>
            <div className="col-span-1">CPV</div>
            <div className="col-span-1">Engagement Rate</div>
            <div className="col-span-1">Platform</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="bg-white divide-y divide-gray-100">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedInfluencers.has(influencer.id)}
                  onChange={() => toggleInfluencerSelection(influencer.id)}
                  className="w-4 h-4 text-purple-500 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>

              {/* Influencer Info */}
              <div className="col-span-2 flex items-center space-x-3">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{influencer.name}</p>
                  <p className="text-xs text-gray-500">{influencer.handle}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.followers}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.engagements}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.avgLikes}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.organicRatio}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.budget}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.cpv}</div>
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.engagementRate}</div>

              {/* Platform */}
              <div className="col-span-1 flex items-center">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </div>

              {/* View Icon */}
              <div className="col-span-1 flex items-center">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-3 py-1 text-sm bg-purple-500 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">3</button>
            <span className="px-3 py-1 text-sm text-gray-500">...</span>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">10</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Showing 1 to 8 of 50 entries</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>8</option>
                <option>16</option>
                <option>24</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedManually;