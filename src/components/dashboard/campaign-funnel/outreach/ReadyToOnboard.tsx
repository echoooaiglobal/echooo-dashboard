// src/components/dashboard/campaign-funnel/outreach/ReadyToOnboard.tsx
import React, { useState } from 'react';

const ReadyToOnboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Ready to Onboard');

  // Sample data matching the design
  const contacts = [
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=32&h=32&fit=crop&crop=face" },
    { name: "Giana Lipshutz", handle: "@giana", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" },
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{selectedFilter} (343)</h3>
          <div className="flex items-center">
            <button 
              onClick={toggleDropdown}
              className="flex items-center hover:bg-gray-50 p-1 rounded"
            >
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-16 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Sort by</h4>
              <button 
                onClick={() => setIsDropdownOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Cost Per View Option */}
              <label className="flex items-center justify-between cursor-pointer bg-purple-50 p-2 rounded-lg border border-purple-200">
                <span className="text-sm text-gray-700">Cost Per View</span>
                <input
                  type="radio"
                  name="filter"
                  value="Cost Per View"
                  checked={selectedFilter === 'Cost Per View'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

              {/* By Price Option */}
              <label className="flex items-center justify-between cursor-pointer bg-purple-50 p-2 rounded-lg border border-purple-200">
                <span className="text-sm text-purple-700 font-medium">By Price</span>
                <input
                  type="radio"
                  name="filter"
                  value="By Price"
                  checked={selectedFilter === 'By Price'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-4 h-4 text-purple-600 border-purple-300 focus:ring-purple-500"
                />
              </label>

              {/* Engagement Rate Option */}
              <label className="flex items-center justify-between cursor-pointer bg-purple-50 p-2 rounded-lg border border-purple-200">
                <span className="text-sm text-gray-700">Engagement Rate</span>
                <input
                  type="radio"
                  name="filter"
                  value="Engagement Rate"
                  checked={selectedFilter === 'Engagement Rate'}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
              </label>

              
            </div>
          </div>
        )}

        {/* Overlay to close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Influencer"
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          <div className="space-y-3">
            {contacts.map((contact, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-150 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt="avatar"
                      className="rounded-full w-10 h-10 object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.handle}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-md flex items-center justify-center">
                    <svg 
                      className="w-4 h-4 text-white" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default ReadyToOnboard;