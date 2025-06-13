// src/components/dashboard/campaign-funnel/result/PublishedResults.tsx
'use client';

import { useState } from 'react';
import AddVideoModal from './AddVideoModal';
import AnalyticsView from './AnalyticsView';

interface InfluencerVideo {
  id: number;
  name: string;
  handle: string;
  videoThumbnail: string;
  impressions: string;
  engagements: string;
  avgLikes: string;
  organicRatio: string;
  budget: string;
  cpv: string;
  engagementRate: string;
  platform: string;
  isSelected?: boolean;
}

const PublishedResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAnalyticsView, setShowAnalyticsView] = useState(false);
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<number>>(new Set());

  // If analytics view is active, show that component
  if (showAnalyticsView) {
    return <AnalyticsView onBack={() => setShowAnalyticsView(false)} />;
  }

  // Sample data matching the design
  const influencerVideos: InfluencerVideo[] = [
    {
      id: 1,
      name: "Prestia Camira",
      handle: "@prestia",
      videoThumbnail: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=60&h=60&fit=crop",
      impressions: "647.4k",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "34%",
      budget: "$250",
      cpv: "$0.53%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 2,
      name: "Hanna Baptista",
      handle: "@hanna",
      videoThumbnail: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=60&h=60&fit=crop",
      impressions: "647.4k",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "54%",
      budget: "$400",
      cpv: "$0.54%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 3,
      name: "Miracle Geidt",
      handle: "@miracle",
      videoThumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=60&h=60&fit=crop",
      impressions: "647.4k",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "85%",
      budget: "$120",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 4,
      name: "Rayna Torff",
      handle: "@rayna",
      videoThumbnail: "https://images.unsplash.com/photo-1542652735873-fb2825bac6e4?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "47%",
      budget: "$800",
      cpv: "$0.64%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 5,
      name: "Giana Lipshutz",
      handle: "@giana",
      videoThumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "85%",
      budget: "$100",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 6,
      name: "James George",
      handle: "@james",
      videoThumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "46%",
      budget: "$50",
      cpv: "$2.53%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 7,
      name: "James George",
      handle: "@james2",
      videoThumbnail: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "96%",
      budget: "$630",
      cpv: "$1.64%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 8,
      name: "Jordyn George",
      handle: "@jordyn",
      videoThumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "75%",
      budget: "$400",
      cpv: "$0.86%",
      engagementRate: "0.03%",
      platform: "instagram"
    },
    {
      id: 9,
      name: "Skyler Herwitz",
      handle: "@skyler",
      videoThumbnail: "https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?w=60&h=60&fit=crop",
      impressions: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      organicRatio: "25%",
      budget: "$230",
      cpv: "$3.55%",
      engagementRate: "0.03%",
      platform: "instagram"
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

  const filteredInfluencers = influencerVideos.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-4">
      {/* Search Bar and Action Buttons */}
      <div className="flex items-center justify-between mb-6 px-4">
        {/* Search Bar - Left Side */}
        <div className="relative flex-1 mr-6">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setShowAddVideoModal(true)}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 transition-all duration-200 text-sm font-medium shadow-lg min-w-[140px]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Video
          </button>
          <button 
            onClick={() => setShowAnalyticsView(true)}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 rounded-full hover:from-pink-200 hover:to-rose-200 transition-all duration-200 text-sm font-medium min-w-[150px]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
            </svg>
            Analytics View
          </button>
          <button className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-full border border-gray-200 transition-colors duration-200 min-w-[60px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-4 py-4 text-sm font-bold text-gray-700 uppercase tracking-wide">
            <div className="col-span-1"></div>
            <div className="col-span-2">Influencers Name (823M)</div>
            <div className="col-span-1">Impressions</div>
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
          {filteredInfluencers.map((influencer, index) => (
            <div
              key={influencer.id}
              className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedInfluencers.has(influencer.id)}
                  onChange={() => toggleInfluencerSelection(influencer.id)}
                  className="w-4 h-4 text-pink-500 bg-white border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                />
              </div>

              {/* Influencer Info with Video Thumbnail */}
              <div className="col-span-2 flex items-center space-x-2">
                <div className="relative group cursor-pointer">
                  <img
                    src={influencer.videoThumbnail}
                    alt={`${influencer.name} video`}
                    className="w-16 h-12 rounded-xl object-cover shadow-md ring-1 ring-gray-200 group-hover:shadow-lg transition-all duration-300"
                  />
                  
                  {/* Gradient overlay for better contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 rounded-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Enhanced Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                      <svg className="w-4 h-4 text-pink-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Video duration badge */}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-md">
                    0:30
                  </div>
                  
                  {/* Platform indicator */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  
                  {/* Engagement indicator on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          45.2K
                        </span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 6h-2l-1.27-1.27c-.39-.39-.9-.73-1.73-.73H8c-.83 0-1.34.34-1.73.73L5 6H3c-.55 0-1 .45-1 1s.45 1 1 1h1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V8h1c.55 0 1-.45 1-1s-.45-1-1-1zM12 16c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                          </svg>
                          1.2K
                        </span>
                      </div>
                      <span className="text-xs font-medium bg-pink-500 px-2 py-0.5 rounded-full">
                        Trending
                      </span>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{influencer.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">{influencer.handle}</p>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <p className="text-xs text-green-600 font-medium">Published</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-1 flex items-center text-sm text-gray-700">{influencer.impressions}</div>
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
                <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
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
        <div className="flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-3 py-1 text-sm bg-pink-400 text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150">2</button>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150">3</button>
            <span className="px-3 py-1 text-sm text-gray-500">...</span>
            <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors duration-150">10</button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Showing 1 to 9 of 51 entries</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400">
                <option>8</option>
                <option>16</option>
                <option>24</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <AddVideoModal 
          onClose={() => setShowAddVideoModal(false)}
          onSubmit={(videoData) => {
            console.log('Video added:', videoData);
            setShowAddVideoModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PublishedResults;