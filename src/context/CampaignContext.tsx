// src/context/CampaignContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCompanyCampaigns, getCampaignById, Campaign } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';

interface CampaignContextType {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  refreshCampaigns: (force?: boolean) => Promise<void>;
  setCurrentCampaign: (campaign: Campaign) => void;
  getCampaign: (id: string) => Promise<Campaign | null>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Get a specific campaign by ID
  const getCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    try {
      // First check if it's in our local state
      const existingCampaign = campaigns.find(c => c.id === id);
      if (existingCampaign) {
        setCurrentCampaign(existingCampaign);
        return existingCampaign;
      }
      
      // Otherwise fetch from API
      const campaign = await getCampaignById(id);
      if (campaign) {
        setCurrentCampaign(campaign);
      }
      return campaign;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      setError('Failed to load campaign details');
      return null;
    }
  }, [campaigns]);

  // Refresh campaigns function with throttling
  const refreshCampaigns = useCallback(async (force = false) => {
    // Don't fetch if user is not authenticated or not a company
    if (!isAuthenticated || user?.user_type !== 'company') {
      return;
    }
    
    // Throttle requests - only fetch if it's been more than 30 seconds since last fetch
    // unless force=true is passed
    const now = Date.now();
    if (!force && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const company = getStoredCompany();
      if (!company || !company.id) {
        setIsLoading(false);
        return;
      }
      
      const fetchedCampaigns = await getCompanyCampaigns(company.id);
      setCampaigns(fetchedCampaigns);
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, lastFetchTime]);

  // Initial fetch when context mounts
  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'company') {
      refreshCampaigns();
    }
  }, [isAuthenticated, user, refreshCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        currentCampaign,
        isLoading,
        error,
        refreshCampaigns,
        setCurrentCampaign,
        getCampaign
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}