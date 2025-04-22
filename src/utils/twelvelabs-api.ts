// src/utils/twelvelabs-api.ts
import {
    TwelveLabsIndex,
    TwelveLabsTask,
    TwelveLabsSummary,
    TwelveLabsError
  } from '@/types/twelvelabs';
  
  const TWELVE_LABS_BASE_URL = process.env.TWELVE_LABS_BASE_URL || 'https://api.twelvelabs.io/v1.3';
  
  async function makeTwelveLabsRequest(endpoint: string, method: string, body?: any, headers?: Record<string, string>) {
    if (!process.env.TWELVE_LABS_API_KEY) {
      throw new Error('Twelve Labs API key is not configured');
    }
  
    const defaultHeaders = {
      'x-api-key': process.env.TWELVE_LABS_API_KEY,
      'Content-Type': 'application/json',
      ...headers
    };
  
    const response = await fetch(`${TWELVE_LABS_BASE_URL}${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API request failed with status ${response.status}`);
    }
  
    return await response.json();
  }
  
  // Step 1: Create Index
  export async function createIndex(indexName: string): Promise<TwelveLabsIndex> {
    return makeTwelveLabsRequest('/indexes', 'POST', { index_name: indexName });
  }
  
  // Step 2: Upload Videos to Index (batch upload)
  export async function uploadVideosToIndex(indexId: string, videoUrls: string[]): Promise<TwelveLabsTask[]> {
    const uploadPromises = videoUrls.map(async (videoUrl) => {
      // First, we need to download the video to create a File object
      const videoResponse = await fetch(videoUrl);
      const videoBlob = await videoResponse.blob();
      const videoFile = new File([videoBlob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
  
      const formData = new FormData();
      formData.append('index_id', indexId);
      formData.append('video_file', videoFile);
  
      return makeTwelveLabsRequest('/tasks', 'POST', formData, {});
    });
  
    return Promise.all(uploadPromises);
  }
  
  // Step 3: Generate Summaries (batch processing)
  export async function generateVideoSummaries(videoIds: string[], prompt?: string): Promise<TwelveLabsSummary[]> {
    const summaryPromises = videoIds.map(async (videoId) => {
      return makeTwelveLabsRequest('/summarize', 'POST', {
        video_id: videoId,
        type: 'summary',
        prompt: prompt || 'Generate a concise summary of this video suitable for social media',
        temperature: 0.2
      });
    });
  
    return Promise.all(summaryPromises);
  }
  
  // Helper function to check task status
  export async function checkTaskStatus(taskId: string): Promise<TwelveLabsTask> {
    return makeTwelveLabsRequest(`/tasks/${taskId}`, 'GET');
  }