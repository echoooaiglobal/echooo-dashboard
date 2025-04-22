// src/app/api/twelvelabs/analyze/route.ts
import { NextResponse } from 'next/server';
import {
  createIndex,
  uploadVideosToIndex,
  generateVideoSummaries,
  checkTaskStatus
} from '@/utils/twelvelabs-api';

export async function POST(request: Request) {
  try {
    const { videoUrls, userId } = await request.json();

    if (!videoUrls || !Array.isArray(videoUrls)) {
      return NextResponse.json(
        { error: 'videoUrls is required and must be an array' },
        { status: 400 }
      );
    }

    // Step 1: Create an index for this user
    const index = await createIndex(`instagram-${userId}-${Date.now()}`);
    
    // Step 2: Upload all videos
    const uploadTasks = await uploadVideosToIndex(index._id, videoUrls);
    
    // Wait for all uploads to complete
    const completedTasks = await Promise.all(
      uploadTasks.map(async (task) => {
        let currentTask = task;
        while (currentTask.status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          currentTask = await checkTaskStatus(currentTask._id);
        }
        return currentTask;
      })
    );

    // Filter out failed tasks
    const successfulTasks = completedTasks.filter(task => task.status === 'completed' && task.video_id);
    
    if (successfulTasks.length === 0) {
      throw new Error('All video uploads failed');
    }

    // Step 3: Generate summaries for successful uploads
    const videoIds = successfulTasks.map(task => task.video_id!);
    const summaries = await generateVideoSummaries(videoIds);

    return NextResponse.json({
      success: true,
      indexId: index._id,
      videoCount: successfulTasks.length,
      summaries
    });
  } catch (error) {
    console.error('Error in video analysis:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}