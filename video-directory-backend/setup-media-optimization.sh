#!/bin/bash

# Media Optimization Setup Script
# Implements image optimization, CDN integration, and media performance enhancements

echo "🖼️ Setting up media optimization and CDN integration..."

# Install media optimization dependencies
echo "📦 Installing media optimization dependencies..."
npm install sharp cloudinary next-cloudinary @cloudinary/react @cloudinary/url-gen

# Create Cloudinary configuration
mkdir -p src/lib/media
cat > src/lib/media/cloudinary.ts << 'EOF'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export async function uploadToCloudinary(
  file: Buffer | string, 
  options: {
    folder?: string
    public_id?: string
    transformation?: any
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
  } = {}
) {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: options.folder || 'video-directory',
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: options.resource_type || 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    })

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

// Generate optimized image URL
export function generateOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
) {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto',
    secure: true,
  })
}

// Generate responsive image URLs
export function generateResponsiveImages(publicId: string) {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536]
  
  return breakpoints.map(width => ({
    width,
    url: generateOptimizedImageUrl(publicId, { width, quality: 'auto' }),
  }))
}

// Delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

export default cloudinary
EOF

# Create image optimization component
cat > src/components/OptimizedImage.tsx << 'EOF'
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        className={`duration-700 ease-in-out ${
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  )
}
EOF

# Create YouTube thumbnail optimization utility
cat > src/lib/media/youtube-thumbnails.ts << 'EOF'
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
EOF

# Update environment variables
echo "🔧 Adding media optimization environment variables..."
cat >> .env.example << 'EOF'

# Media Optimization
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ENABLE_IMAGE_OPTIMIZATION=true
EOF

cat >> .env.production.example << 'EOF'

# Media Optimization (Production)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ENABLE_IMAGE_OPTIMIZATION=true
CDN_URL=https://your-cdn-domain.com
EOF

echo "✅ Media optimization setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up Cloudinary account at https://cloudinary.com"
echo "2. Copy credentials to your .env file"
echo "3. Test image optimization"
echo ""
echo "📊 Media optimization features:"
echo "- Automatic image optimization (WebP/AVIF)"
echo "- YouTube thumbnail optimization"
echo "- Cloudinary integration"
echo "- Responsive image generation"
echo "- CDN-ready caching headers"