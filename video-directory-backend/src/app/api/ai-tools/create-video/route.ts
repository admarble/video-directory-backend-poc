import { NextResponse } from 'next/server';
import { validateAutomationUser } from '../../../../utils/validateAutomationUser';

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  try {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
}

// Main orchestrator function
export async function POST(request: Request) {
  try {
    // Validate automation user
    const authResult = await validateAutomationUser(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    const body = await request.json();
    const { 
      youtubeUrl, 
      youtubeId,
      enhanceTags = true, 
      analyzeSkillLevel = true,
      uploadThumbnail = true,
      published = false 
    } = body;
    
    // Validate input
    const videoUrl = youtubeUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null);
    if (!videoUrl) {
      return NextResponse.json({ error: 'YouTube URL or ID is required' }, { status: 400 });
    }
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL format' }, { status: 400 });
    }
    
    const { getPayloadClient } = await import('../../../../getPayload');
    const payload = await getPayloadClient();
    
    // Step 1: Create basic video entry
    console.log('Step 1: Creating basic video entry...');
    const newVideo = await payload.create({
      collection: 'videos',
      data: {
        videoUrl: videoUrl,
        title: `Processing video ${videoId}...`,
        description: 'Fetching video details...',
        duration: 0,
        published: published,
        thumbnail: null, // Will be populated by YouTube API
      }
    });
    
    const createdVideoId = String(newVideo.id);
    console.log('Created video with ID:', createdVideoId);
    
    // Step 2: Fetch YouTube data
    console.log('Step 2: Fetching YouTube data...');
    try {
      const youtubeApiUrl = `${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/youtube?url=${encodeURIComponent(videoUrl)}${uploadThumbnail ? '&uploadThumbnail=true' : ''}`;
      
      const youtubeResponse = await fetch(youtubeApiUrl);
      if (!youtubeResponse.ok) {
        throw new Error(`YouTube API failed: ${youtubeResponse.status}`);
      }
      
      const youtubeData = await youtubeResponse.json();
      
      // Step 3: Update video with YouTube data
      console.log('Step 3: Updating video with YouTube data...');
      const updateData: any = {
        title: youtubeData.title,
        description: youtubeData.description,
        duration: youtubeData.duration,
        publishedDate: youtubeData.publishedDate,
      };
      
      if (youtubeData.thumbnailId) {
        updateData.thumbnail = youtubeData.thumbnailId;
      }
      if (youtubeData.creatorId) {
        updateData.creator = youtubeData.creatorId;
      }
      if (youtubeData.categoryIds && youtubeData.categoryIds.length > 0) {
        updateData.categories = youtubeData.categoryIds;
      }
      if (youtubeData.tagIds && youtubeData.tagIds.length > 0) {
        updateData.tags = youtubeData.tagIds;
      }
      
      await payload.update({
        collection: 'videos',
        id: createdVideoId,
        data: updateData
      });
      
      console.log('Updated video with YouTube data');
      
      // Step 4: Enhanced tag analysis (if requested)
      let enhancedTagsResult = null;
      if (enhanceTags) {
        console.log('Step 4: Performing enhanced tag analysis...');
        try {
          const tagAnalysisResponse = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/ai-tools/enhanced-tags`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': request.headers.get('authorization') || ''
            },
            body: JSON.stringify({
              title: youtubeData.title,
              description: youtubeData.description,
              existingTags: youtubeData.tagIds || [],
              videoId: createdVideoId,
              createTags: true,
              confidenceThreshold: 0.75
            })
          });
          
          if (tagAnalysisResponse.ok) {
            enhancedTagsResult = await tagAnalysisResponse.json();
            console.log('Enhanced tags analysis completed');
          } else {
            console.warn('Enhanced tags analysis failed:', tagAnalysisResponse.status);
          }
        } catch (tagError) {
          console.error('Enhanced tags error:', tagError);
        }
      }
      
      // Step 5: Skill level analysis (if requested)
      let skillLevelResult = null;
      if (analyzeSkillLevel) {
        console.log('Step 5: Performing skill level analysis...');
        try {
          const skillLevelResponse = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/ai-tools/skill-level`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': request.headers.get('authorization') || ''
            },
            body: JSON.stringify({
              title: youtubeData.title,
              description: youtubeData.description,
              tags: enhancedTagsResult?.suggestedTags?.map((t: any) => t.name) || [],
              videoId: createdVideoId
            })
          });
          
          if (skillLevelResponse.ok) {
            skillLevelResult = await skillLevelResponse.json();
            console.log('Skill level analysis completed');
          } else {
            console.warn('Skill level analysis failed:', skillLevelResponse.status);
          }
        } catch (skillError) {
          console.error('Skill level error:', skillError);
        }
      }
      
      // Step 6: Get final video state
      const finalVideo = await payload.findByID({
        collection: 'videos',
        id: createdVideoId
      });
      
      return NextResponse.json({
        success: true,
        video: finalVideo,
        videoId: createdVideoId,
        processing: {
          youtubeData: !!youtubeData,
          enhancedTags: !!enhancedTagsResult,
          skillLevel: !!skillLevelResult
        },
        results: {
          youtubeData,
          enhancedTags: enhancedTagsResult,
          skillLevel: skillLevelResult
        }
      });
      
    } catch (processingError) {
      console.error('Error in video processing:', processingError);
      
      // Clean up: delete the created video if processing failed
      try {
        await payload.delete({
          collection: 'videos',
          id: createdVideoId
        });
      } catch (cleanupError) {
        console.error('Error cleaning up failed video:', cleanupError);
      }
      
      return NextResponse.json({
        error: 'Failed to process video',
        details: processingError instanceof Error ? processingError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Video creation orchestrator error:', error);
    return NextResponse.json({ 
      error: 'Failed to create video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
