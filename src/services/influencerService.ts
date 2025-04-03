import api from '@/lib/apiHelper';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Influencer {
  username: string;
  client_id: number;
}

// Get influencer
export const getInfluencerById = async (id: number): Promise<Influencer> => {
  const response = await api.get(`${API_ENDPOINTS.INFLUENCERS}/${id}`);
  return response.data;
};

// Get all influencers
export const getInfluencers = async (page: number = 1, limit: number = 10) => {
  const response = await api.get(`${API_ENDPOINTS.INFLUENCERS}/?page=${page}&limit=${limit}`);
  if (response.statusText !== 'OK') throw new Error('Failed to fetch influencers');
  return response.data;
};

// Create a new influencer
export const createInfluencer = async (data: Influencer): Promise<Influencer> => {
  const response = await api.post(API_ENDPOINTS.INFLUENCERS, data);
  return response.data;
};

// Update an influencer
export const updateInfluencer = async (id: number, data: Influencer): Promise<Influencer> => {
  const response = await api.put(`${API_ENDPOINTS.INFLUENCERS}/${id}`, data);
  return response.data;
};

// Delete an influencer
export const deleteInfluencer = async (id: number): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.INFLUENCERS}/${id}`);
};