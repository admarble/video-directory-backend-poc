import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Function to extract YouTube video ID from URL
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

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  const hours = (match?.[1] && parseInt(match[1])) || 0;
  const minutes = (match?.[2] && parseInt(match[2])) || 0;
  const seconds = (match?.[3] && parseInt(match[3])) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Function to download and upload thumbnail to Payload
async function uploadThumbnailToPayload(thumbnailUrl: string, title: string) {
  try {
    // Import payload dynamically to avoid issues with server components
    const { getPayloadClient } = await import('../../../getPayload');
    const payload = await getPayloadClient();
    
    // Download the thumbnail image
    const imageResponse = await fetch(thumbnailUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download thumbnail: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    const imageBlob = new Blob([buffer], { type: imageResponse.headers.get('content-type') || 'image/jpeg' });
    
    // Create a filename based on the video title
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    const filename = `${cleanTitle}-thumbnail-${randomUUID().substring(0, 8)}.jpg`;
    
    // Create a File object from the blob
    const _file = new File([imageBlob], filename, { type: 'image/jpeg' });
    
    // Upload to Payload's media collection
    const uploadResult = await payload.create({
      collection: 'media',
      data: {
        alt: `Thumbnail for ${title}`,
      },
      file: {
        data: buffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: buffer.length,
      },
    });
    
    return uploadResult.id;
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return null; // Return null if upload fails, don't break the whole process
  }
}

// Route handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const uploadThumbnail = searchParams.get('uploadThumbnail') === 'true';
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
    }
    
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('YouTube API error:', errorData);
      return NextResponse.json({ 
        error: `YouTube API error: ${response.status} ${response.statusText}`,
        details: errorData
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found or not accessible' }, { status: 404 });
    }
    
    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    
    // Base response
    const responseData = {
      title: snippet.title,
      description: snippet.description,
      duration: parseDuration(contentDetails.duration),
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      publishedDate: snippet.publishedAt,
      thumbnailId: null as string | null
    };
    
    // Optionally upload thumbnail to Payload
    if (uploadThumbnail && responseData.thumbnailUrl) {
      responseData.thumbnailId = await uploadThumbnailToPayload(
        responseData.thumbnailUrl,
        responseData.title
      );
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
  }
}