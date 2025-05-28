import { uploadToCloudinary } from './cloudinary'

interface ThumbnailQuality {
  url: string
  width: number
  height: number
  quality: 'maxres' | 'standard' | 'high' | 'medium' | 'default'
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Get available thumbnail qualities for a YouTube video
export function getYouTubeThumbnails(videoId: string): ThumbnailQuality[] {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`
  
  return [
    {
      url: `${baseUrl}/maxresdefault.jpg`,
      width: 1280,
      height: 720,
      quality: 'maxres'
    },
    {
      url: `${baseUrl}/sddefault.jpg`,
      width: 640,
      height: 480,
      quality: 'standard'
    },
    {
      url: `${baseUrl}/hqdefault.jpg`,
      width: 480,
      height: 360,
      quality: 'high'
    },
    {
      url: `${baseUrl}/mqdefault.jpg`,
      width: 320,
      height: 180,
      quality: 'medium'
    },
    {
      url: `${baseUrl}/default.jpg`,
      width: 120,
      height: 90,
      quality: 'default'
    }
  ]
}

// Download and optimize YouTube thumbnail
export async function optimizeYouTubeThumbnail(
  videoId: string,
  options: {
    quality?: 'maxres' | 'standard' | 'high' | 'medium' | 'default'
    uploadToCloud?: boolean
    folder?: string
  } = {}
): Promise<{ url: string; width: number; height: number; cloudinaryUrl?: string }> {
  const thumbnails = getYouTubeThumbnails(videoId)
  const selectedThumbnail = thumbnails.find(t => t.quality === (options.quality || 'maxres')) || thumbnails[0]

  // Check if thumbnail exists (YouTube doesn't always have maxres)
  try {
    const response = await fetch(selectedThumbnail.url, { method: 'HEAD' })
    if (!response.ok && options.quality === 'maxres') {
      // Fallback to standard quality
      const fallback = thumbnails.find(t => t.quality === 'standard')!
      const fallbackResponse = await fetch(fallback.url, { method: 'HEAD' })
      if (fallbackResponse.ok) {
        selectedThumbnail.url = fallback.url
        selectedThumbnail.width = fallback.width
        selectedThumbnail.height = fallback.height
      }
    }
  } catch (error) {
    console.error('Thumbnail check failed:', error)
  }

  let cloudinaryUrl: string | undefined

  // Upload to Cloudinary if requested
  if (options.uploadToCloud) {
    try {
      const cloudinaryResult = await uploadToCloudinary(selectedThumbnail.url, {
        folder: options.folder || 'video-directory/thumbnails',
        public_id: `youtube-${videoId}`,
        transformation: {
          quality: 'auto',
          fetch_format: 'auto',
          width: 1280,
          height: 720,
          crop: 'fill',
          gravity: 'center',
        },
      })
      cloudinaryUrl = cloudinaryResult.url
    } catch (error) {
      console.error('Failed to upload thumbnail to Cloudinary:', error)
    }
  }

  return {
    url: selectedThumbnail.url,
    width: selectedThumbnail.width,
    height: selectedThumbnail.height,
    cloudinaryUrl,
  }
}
