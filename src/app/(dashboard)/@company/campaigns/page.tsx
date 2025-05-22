// src/app/(dashboard)/@company/campaigns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCompanyCampaigns, Campaign } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import { Plus, Search, Filter } from 'react-feather';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setIsLoading(true);
        const company = getStoredCompany();
        
        if (!company || !company.id) {
          setError('Company information not found');
          return;
        }
        
        const data = await getCompanyCampaigns(company.id);
        setCampaigns(data);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError('Failed to load campaigns. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCampaigns();
  }, []);

  // Filter campaigns based on search
  const filteredCampaigns = searchQuery
    ? campaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : campaigns;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Campaigns</h1>
        <Link 
          href="/campaigns/new" 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <select className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 bg-white">
              <option>All status</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Campaign list */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Link 
              href={`/campaigns/${campaign.id}`} 
              key={campaign.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-2">{campaign.name}</h3>
              <p className="text-gray-600 mb-4">Brand: {campaign.brand_name}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  campaign.status_id === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : campaign.status_id === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {campaign.status.name.charAt(0).toUpperCase() + campaign.status.name.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(campaign.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'No campaigns match your search criteria.' : 'You haven\'t created any campaigns yet.'}
          </p>
          {!searchQuery && (
            <Link 
              href="/campaigns/new" 
              className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Campaign
            </Link>
          )}
        </div>
      )}
    </div>
  );
}


// Protected Dashboard Page
export default function Campaigns() {
  return (
    <ProtectedRoute>
      <CampaignsPage />
    </ProtectedRoute>
  );
}