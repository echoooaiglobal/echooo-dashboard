import { useState } from "react";
import { Search, Filter, ChevronDown, PlusCircle, Users, Award, Instagram } from "lucide-react";

export default function InfluencerPlatform() {
  const [activeTab, setActiveTab] = useState("Result");
  
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b">
          {["Discover", "Outreach", "Campaign Management", "Result", "Payments"].map((tab) => (
            <button
              key={tab}
              className={`px-8 py-4 text-sm font-medium ${
                activeTab === tab 
                  ? "text-purple-600 border-b-2 border-purple-600" 
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-700">Influencers Result</h1>
            <div className="flex space-x-4">
              <div className="bg-red-200 text-red-500 rounded-full px-6 py-2">
                Discovered Influencer (450)
              </div>
              <div className="bg-red-50 text-red-400 rounded-full px-6 py-2">
                Shortlisted (450)
              </div>
            </div>
          </div>
          
          {/* Search Bar and Action Buttons */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search influencer" 
                className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="p-2 border rounded-full">
              <Filter size={20} className="text-gray-500" />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-full bg-white text-gray-600">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-full bg-white text-purple-600 border-purple-200">
              <PlusCircle size={16} />
              <span>Add to Campaign</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-600 text-white">
              <Award size={16} />
              <span>AI Shortlist</span>
            </button>
          </div>
          
          {/* Filter Panel */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-700">Narrow your discovered influencers</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <Instagram size={20} className="text-pink-500" />
                <span>Instagram</span>
                <ChevronDown size={16} />
              </div>
            </div>
            
            {/* Demographics Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Demographics</h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Location</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Gender</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Language</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Age</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Audience Type</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Ethnicity</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Performance Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Performance</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Followers</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Engagements</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Trending</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Reels Plays</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Content</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Niche AI</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Topics AI</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">LOOKALIKES AI</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Mentions</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Interests</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Caption Keyword</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Partnerships</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Partnerships</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Account Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Account</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Last Post</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Account Type</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center justify-between px-4 py-3 border rounded-lg">
                  <span className="text-gray-600">Contacts</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="accountFilter" className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Only Verified Accounts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="accountFilter" className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Only Credible Accounts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="accountFilter" className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Exclude Private Accounts</span>
                </label>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button className="px-8 py-3 border border-gray-300 text-gray-500 rounded-full">
                Cancel
              </button>
              <button className="px-8 py-3 bg-purple-600 text-white rounded-full">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}