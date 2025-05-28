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
