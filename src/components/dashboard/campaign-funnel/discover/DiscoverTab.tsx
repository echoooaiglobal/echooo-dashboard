// src/components/dashboard/campaign-funnel/discover/DiscoverTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search } from 'react-feather';
import EmptyState from './EmptyState';
import BrandInfoForm from './BrandInfoForm';
import { Campaign } from '@/services/campaign/campaign.service';

interface DiscoverTabProps {
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  onCampaignCreated?: (campaign: Campaign) => void;
}

const DiscoverTab: React.FC<DiscoverTabProps> = ({ 
  campaignData = null,
  isNewCampaign = false,
  onCampaignCreated
}) => {
  const [activeFilter, setActiveFilter] = useState<'discovered' | 'shortlisted'>('discovered');
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [showBrandForm, setShowBrandForm] = useState(isNewCampaign);

  // If campaign data exists and we're not in new campaign mode, load influencers
  useEffect(() => {
    if (campaignData && !isNewCampaign) {
      // Mock loading influencers for existing campaign
      // In real app, this would be an API call
      setTimeout(() => {
        setInfluencers([
          {
            id: 1,
            name: "Alex Johnson",
            followers: "120K",
            categories: ['Fashion', 'Lifestyle']
          },
          {
            id: 2,
            name: "Sarah Miller",
            followers: "250K",
            categories: ['Beauty', 'Travel']
          },
          {
            id: 3,
            name: "Michael Brown",
            followers: "85K",
            categories: ['Fitness', 'Health']
          }
        ]);
      }, 500);
    }
  }, [campaignData, isNewCampaign]);

  // Function to handle starting the discovery process
  const handleStartDiscovery = () => {
    setShowBrandForm(true);
  };

  // Function to handle form completion
  const handleFormComplete = (formData: any) => {
    console.log('Form submitted with data:', formData);
    
    // For new campaigns, call the parent handler
    if (isNewCampaign && onCampaignCreated) {
      onCampaignCreated(formData);
    } else {
      // For existing campaigns, hide the form and show influencers
      setShowBrandForm(false);
      
      // In a real app, this would be an API call to search influencers
      setTimeout(() => {
        setInfluencers([
          {
            id: 1,
            name: "Alex Johnson",
            followers: "120K",
            categories: ['Fashion', 'Lifestyle']
          },
          {
            id: 2,
            name: "Sarah Miller",
            followers: "250K",
            categories: ['Beauty', 'Travel']
          },
          {
            id: 3,
            name: "Michael Brown",
            followers: "85K",
            categories: ['Fitness', 'Health']
          }
        ]);
      }, 500);
    }
  };

  // If the brand form is being shown, display it
  if (showBrandForm) {
    return (
      <div className="py-8">
        <BrandInfoForm 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // If no influencers are discovered yet, show the empty state
  if (influencers.length === 0) {
    return <EmptyState onStartDiscovery={handleStartDiscovery} />;
  }

  // Show influencer results
  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Influencers Result</h2>
        
        {/* Filter Buttons */}
        <div className="flex mt-3 md:mt-0">
          <div className="bg-red-200 rounded-full flex overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'discovered' 
                  ? 'bg-red-300 text-red-800' 
                  : 'text-red-800 hover:bg-red-300'
              }`}
              onClick={() => setActiveFilter('discovered')}
            >
              Discovered Influencer ({influencers.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeFilter === 'shortlisted' 
                  ? 'bg-red-300 text-red-800' 
                  : 'text-red-800 hover:bg-red-300'
              }`}
              onClick={() => setActiveFilter('shortlisted')}
            >
              Shortlisted (0)
            </button>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search influencers..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Influencer List Content */}
      <div className="border border-gray-200 rounded-lg p-4">
        {activeFilter === 'discovered' ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {influencers.map((influencer) => (
              <div 
                key={influencer.id} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-3" />
                  <div>
                    <h3 className="font-medium">{influencer.name}</h3>
                    <p className="text-sm text-gray-500">{influencer.followers} followers</p>
                    <div className="flex items-center mt-2">
                      {influencer.categories.map((category: string, index: number) => (
                        <span 
                          key={index} 
                          className={`text-xs ${
                            index % 2 === 0 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          } px-2 py-0.5 rounded-full ${index > 0 ? 'ml-2' : ''}`}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No influencers have been shortlisted yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverTab;