import type { Video, Category, Tag, Creator, Media } from '../payload-types'

export interface TransformedVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  slug: string
  channelName: string
  views: number
  topics: string[]
  tools?: string[]
  skillLevel: string
  publishedAt?: string
  isFeatured?: boolean
  videoUrl?: string
  duration?: number
}

export function transformVideo(video: Video): TransformedVideo {
  // Handle thumbnail URL
  let thumbnailUrl = ''
  if (video.thumbnail && typeof video.thumbnail === 'object') {
    const thumbnail = video.thumbnail as Media
    thumbnailUrl = thumbnail.url || ''
  }

  // Handle creator/channel name
  let channelName = ''
  if (video.creator && typeof video.creator === 'object') {
    const creator = video.creator as Creator
    channelName = creator.name || ''
  }

  // Handle categories as topics
  let topics: string[] = []
  if (video.categories && Array.isArray(video.categories)) {
    topics = video.categories
      .map((cat) => {
        if (typeof cat === 'object' && cat !== null) {
          const category = cat as Category
          return category.title
        }
        return null
      })
      .filter(Boolean) as string[]
  }

  // Handle tool tags
  let tools: string[] = []
  if (video.tags && Array.isArray(video.tags)) {
    tools = video.tags
      .map((tag) => {
        if (typeof tag === 'object' && tag !== null) {
          const tagObj = tag as Tag
          // Since Tags collection doesn't have 'type' field, just return all tag titles
          return tagObj.title
        }
        return null
      })
      .filter(Boolean) as string[]
  }

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl,
    slug: video.slug || '',
    channelName,
    views: video.views || 0,
    topics,
    tools: tools.length > 0 ? tools : undefined,
    skillLevel: video.skillLevel || 'beginner',
    publishedAt: video.publishedDate || undefined,
    isFeatured: video.isFeatured || undefined,
    videoUrl: video.videoUrl,
    duration: video.duration,
  }
}

export function transformVideos(videos: Video[]): TransformedVideo[] {
  return videos.map(transformVideo)
}
